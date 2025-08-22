import User from "../models/User.js";
import Order from "../models/Order.js";
import PDFDocument from 'pdfkit'


const putOrder = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;

        if (!user) {
            return res.starus(400).json({message : 'Couldnt find user with similair id'}) ;
        }

        await user.populate('cart.items.productId') ;
        if (user.cart.items.length === 0) {
            res.status(400).json({message : 'error'})
        }
        const order = new Order({
            ownerId : userId ,
            order : {
                totalPrice : user.cart.totalPrice.toFixed(2) ,
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

        user.cart = {
            totalPrice : 0 ,
            items : []
        }
        await user.save() ;
        await order.save()

        return res.status(200).json({message : 'order had been created'}) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const getOrderInvoice = async (req , res , next) => {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=invoice.pdf")

    doc.pipe(res);

    doc.fontSize(25).text("Invoice Example", { align: "center" });
    doc.moveDown();
    doc.text("Customer: Ahmed Ahmed");
    doc.text("Total: $120.50");

    doc.end();
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