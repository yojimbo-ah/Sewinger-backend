import User from "../models/User.js";
import Order from "../models/Order.js";
import PDFDocument from 'pdfkit'
import { resend } from "../service/emailTransporter.js";
import { orderConfirmation } from "../helperFunctions/emailPages.js";



const putOrder = async (req , res , next) => {
    const userId = req.user.id ;
    console.log('am at the order section') ;
    try {
        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair id'}) ;
        }

        await user.populate('cart.items.productId') ;
        if (user.cart.items.length === 0) {
            return res.status(400).json({message : 'Cart is empty'})
        }

        const totalPrice = Number(user.cart.totalPrice.toFixed(2)) ;

        const currentBalance = Number((user.wallet?.balance ?? 0).toFixed(2)) ;
        if (!user.wallet || typeof user.wallet.balance !== 'number') {
            user.wallet = {balance : currentBalance} ;
        }

        if (currentBalance < totalPrice) {
            return res.status(400).json({
                message : 'Insufficent wallet balance',
                wallet : {
                    balance : currentBalance ,
                    required : totalPrice
                }
            }) ;
        }

        const missingProducts = user.cart.items.find(item => !item.productId) ;
        if (missingProducts) {
            return res.status(400).json({message : 'One or more products in your cart no longer exist'}) ;
        }

        const insufficentProduct = user.cart.items.find(item => {
            return item.quantity > item.productId.availbleItems ;
        }) ;

        if (insufficentProduct) {
            return res.status(400).json({
                message : 'There isnt enough stock to create this order',
                product : {
                    id : insufficentProduct.productId._id ,
                    name : insufficentProduct.productId.name ,
                    available : insufficentProduct.productId.availbleItems ,
                    wanted : insufficentProduct.quantity
                }
            }) ;
        }

        const order = new Order({
            ownerId : userId ,
            order : {
                totalPrice : totalPrice ,
                items : user.cart.items.map(item => {
                    return {
                        quantity : item.quantity ,
                        itemId : item.productId._id ,
                        priceWhenBought : item.productId.price ,
                        name : item.productId.name
                    }
                })
            }
        })

        const productUpdatePromises = user.cart.items.map(async(item) => {
            const product = item.productId ;
            product.availbleItems -= item.quantity ;
            if (product.availbleItems <= 0) {
                product.availbleItems = 0 ;
                product.availble = false ;
            }
            await product.save() ;
        }) ;
        await Promise.all(productUpdatePromises) ;

        user.wallet.balance = currentBalance - totalPrice ;
        user.wallet.balance = Number(user.wallet.balance.toFixed(2)) ;

        user.cart = {
            totalPrice : 0 ,
            items : []
        }
        await user.save() ;
        await order.save()
        resend.emails.send({
            from: 'Handlyy <no_reply@handly.tech>',
            to: user.email,
            subject: 'Order Confirmation',
            html: orderConfirmation(order._id.toString(), new Date().toLocaleDateString(), totalPrice, `${user.name.firstName} ${user.name.lastName}`)
        })
        return res.status(200).json({
            message : 'order had been created',
            wallet : {
                balance : user.wallet.balance
            }
        }) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const getOrderInvoice = async (req , res , next) => {
    const userId = req.user.id ;
    const orderId = req.params.orderId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with familair id'}) ;
        }
        const order = await Order.findById(orderId) ;
        if (!order) {
            return res.status(400).json({message : 'Couldnt find order with similair id'}) ;
        }
        if (order.ownerId.toString() !== user._id.toString()) {
            return res.status(400).json({message : 'You cant get the invoice since you dont own the order'}) ;
        }

        // PDFDocument library helps us generate documents on the fly with the data we want
        // i used so users can retrieve there invoices it is not complicated to use or
        // anything like that , pretty good documentation on the web (ai really helps
        // with these kinda stuff )        
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
        doc.pipe(res);

        doc.fontSize(24).text('Invoice', { underline: true });
        doc.moveDown();
        doc.fontSize(10).text(`Name: ${user.name.lastName} ${user.name.firstName}`);
        doc.moveDown();
        doc.fontSize(10).text(`Order id: ${order._id}`);
        doc.moveDown();
        doc.fontSize(10).text(`Today's date: ${new Date().toLocaleDateString()}`);
        doc.moveDown(3);

        const itemNameX = 50;
        const quantityX = 200;
        const priceX = 300;
        const totalX = 400;

        doc.font('Helvetica-Bold');
        const headerY = doc.y; 
        doc.text('Item Name', itemNameX, headerY);
        doc.text('Quantity', quantityX, headerY);
        doc.text('Price', priceX, headerY);
        doc.text('Total', totalX, headerY);

        doc.moveDown();
        const lineY = doc.y;
        doc.moveTo(itemNameX, lineY)
        .lineTo(totalX + 50, lineY)
        .stroke();

        doc.moveDown();

        doc.font('Helvetica');
        order.order.items.forEach(product => {
            const total = product.priceWhenBought * product.quantity;
            const currentY = doc.y; 
            
            doc.text(`${product.name}`, itemNameX, currentY);
            doc.text(`${product.quantity}`, quantityX, currentY);
            doc.text(`$${product.priceWhenBought.toFixed(2)}`, priceX, currentY);
            doc.text(`$${total.toFixed(2)}`, totalX, currentY);
            
            doc.moveDown(1.5); 
        });

        doc.moveDown(2);
        doc.moveTo(itemNameX, doc.y)
        .lineTo(totalX + 50, doc.y)
        .stroke();

        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.fontSize(12);
        doc.text(`Total Price of the Order: $${order.order.totalPrice.toFixed(2)}`, itemNameX);

        doc.end();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}


const getOrders = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair id'}) ;
        }
        const orders = await Order.find({ownerId : userId}) ;

        return res.status(200).json({ orders : orders }) ;

    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const deleteOrder = async (req , res , next) => {
    const userId = req.user.id ;
    const orderId = req.params.orderId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }

        const order = await Order.findById(orderId) ;

        if (!order) {
            return res.status(400).json({message : 'Couldnt find the order , invalid order ID'}) ;
        }

        if (user._id.toString() !== order.ownerId.toString()) {
            return res.status(400).json({message : 'You dont own this order to delete it'}) ;
        }
        await order.deleteOne() ;

        return res.status(200).json({message : 'order deleted successfully'})

    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const order = {putOrder , getOrders , getOrderInvoice , deleteOrder} ;

export default order ;