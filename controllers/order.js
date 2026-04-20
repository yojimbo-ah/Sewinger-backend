import User from "../models/User.js";
import Order from "../models/Order.js";
import PDFDocument from 'pdfkit'
import { orderConfirmation } from "../helperFunctions/emailPages.js";
import resend from "../service/resend.js";
import { getIO } from "../socket.js";
import { createNotification } from "../service/notificationService.js";



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

        // Extract seller info BEFORE clearing cart
        const sellerMap = new Map();
        user.cart.items.forEach(item => {
          if (item.productId.creatorId) {
            const sellerId = item.productId.creatorId.toString();
            if (!sellerMap.has(sellerId)) {
              sellerMap.set(sellerId, []);
            }
            sellerMap.get(sellerId).push({
              productId: item.productId._id,
              productName: item.productId.name,
              quantity: item.quantity,
              price: item.productId.price
            });
          }
        });

        user.wallet.balance = currentBalance - totalPrice ;
        user.wallet.balance = Number(user.wallet.balance.toFixed(2)) ;

        user.cart = {
            totalPrice : 0 ,
            items : []
        }
        await user.save() ;
        await order.save()

        // Create notifications for each seller whose products were purchased
        const io = getIO();
        for (const [sellerId, products] of sellerMap.entries()) {
          await createNotification(
            io,
            sellerId,
            'product_purchased',
            {
              userId: userId,
              name: `${user.name.firstName} ${user.name.lastName}`,
              avatar: user.bio?.profileImage || null
            },
            {
              orderId: order._id,
              buyerName: `${user.name.firstName} ${user.name.lastName}`,
              products: products,
              totalPrice: totalPrice
            }
          );
        }

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

        // Ensure all numeric values are proper numbers
        const totalPrice = Number(order.order.totalPrice) || 0;
        if (isNaN(totalPrice)) {
            throw new Error('Invalid order total price: ' + order.order.totalPrice);
        }

        const doc = new PDFDocument({ size: 'A4', margin: 35 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);
        doc.pipe(res);

        // ════════════════════════════════════════════════════════════
        // TOP ACCENT BAR
        // ════════════════════════════════════════════════════════════
        doc.rect(0, 0, 700, 6).fill('#EB8556');

        // ════════════════════════════════════════════════════════════
        // HEADER SECTION - Logo and Company Name
        // ════════════════════════════════════════════════════════════
        
        const logoPath = 'c:/Users/PC/Desktop/tailwind-learning/src/assets/logo2.png';
        try {
            doc.image(logoPath, 35, 12, { width: 60 });
        } catch (err) {
            console.log('[Invoice] Logo not found, skipping');
        }

        doc.fontSize(16).font('Helvetica-Bold').fillColor('#333333').text('HANDLYY', 105, 25);
        doc.fontSize(9).font('Helvetica').fillColor('#8B6B55').text('Professional Tailoring & Fashion', 105, 42);
        
        // Decorative line
        doc.strokeColor('#D4C4B8').lineWidth(1);
        doc.moveTo(35, 65).lineTo(560, 65).stroke();

        // ════════════════════════════════════════════════════════════
        // HEADER RIGHT SECTION - Invoice Number and Dates
        // ════════════════════════════════════════════════════════════
        
        const invoiceNumber = order._id.toString().slice(-8).toUpperCase();
        const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#8B6B55').text('INVOICE', 35, 72);
        
        // Invoice details box on right - Enhanced styling
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
        const detailsBoxY = 72;
        const boxWidth = 180;
        const boxHeight = 55;
        
        doc.rect(560 - boxWidth, detailsBoxY, boxWidth, boxHeight).stroke('#8B6B55').lineWidth(2);
        doc.rect(560 - boxWidth, detailsBoxY, boxWidth, 18).fill('#EB8556');
        
        doc.text('INVOICE DETAILS', 560 - boxWidth + 10, detailsBoxY + 3);
        
        doc.fontSize(7.5).font('Helvetica').fillColor('#333');
        doc.text(`Invoice Number: ${invoiceNumber}`, 560 - boxWidth + 10, detailsBoxY + 23);
        doc.text(`Invoice Date: ${invoiceDate}`, 560 - boxWidth + 10, detailsBoxY + 35);
        doc.text(`Order Date: ${orderDate}`, 560 - boxWidth + 10, detailsBoxY + 47);

        doc.moveDown(4.5);

        // ════════════════════════════════════════════════════════════
        // CUSTOMER INFORMATION SECTION
        // ════════════════════════════════════════════════════════════
        
        const custInfoY = doc.y;
        const col1X = 35;
        const col2X = 315;
        
        // Bill To
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#EB8556').text('BILL TO', col1X, custInfoY);
        doc.fontSize(7.5).font('Helvetica').fillColor('#333');
        doc.text(`Name: ${user.name.firstName} ${user.name.lastName}`, col1X, custInfoY + 15);
        doc.text(`Email: ${user.email}`, col1X, custInfoY + 26);
        doc.text(`User ID: ${userId}`, col1X, custInfoY + 37);

        // Ship To
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#EB8556').text('SHIP TO', col2X, custInfoY);
        doc.fontSize(7.5).font('Helvetica').fillColor('#333');
        doc.text(`Name: ${user.name.firstName} ${user.name.lastName}`, col2X, custInfoY + 15);
        doc.text(`Email: ${user.email}`, col2X, custInfoY + 26);
        doc.text(`Member Since: ${new Date(user.createdAt).toLocaleDateString()}`, col2X, custInfoY + 37);

        // Separator line
        doc.strokeColor('#D4C4B8').lineWidth(1);
        doc.moveTo(35, custInfoY + 48).lineTo(560, custInfoY + 48).stroke();

        doc.moveDown(4);

        // ════════════════════════════════════════════════════════════
        // ITEMS TABLE SECTION
        // ════════════════════════════════════════════════════════════

        const tableTop = doc.y;
        const col1X_Table = 35;
        const col2X_Table = 340;
        const col3X_Table = 420;
        const col4X_Table = 485;
        const tableWidth = 530;

        // Table Header
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
        doc.rect(col1X_Table, tableTop, tableWidth, 22).fill('#8B6B55').stroke('#8B6B55').lineWidth(2);
        
        doc.text('ITEM DESCRIPTION', col1X_Table + 10, tableTop + 6, { width: 295 });
        doc.text('QTY', col2X_Table + 10, tableTop + 6, { width: 60, align: 'center' });
        doc.text('UNIT PRICE', col3X_Table + 8, tableTop + 6, { width: 50, align: 'center' });
        doc.text('TOTAL', col4X_Table + 10, tableTop + 6, { width: 50, align: 'right' });

        // Column separator lines in header
        doc.strokeColor('#6D5A47').lineWidth(1);
        doc.moveTo(col2X_Table, tableTop).lineTo(col2X_Table, tableTop + 22).stroke();
        doc.moveTo(col3X_Table, tableTop).lineTo(col3X_Table, tableTop + 22).stroke();
        doc.moveTo(col4X_Table, tableTop).lineTo(col4X_Table, tableTop + 22).stroke();

        let rowY = tableTop + 22;
        const rowHeight = 22;
        let subtotal = 0;
        let itemCount = 0;

        doc.fontSize(7.5).font('Helvetica').fillColor('#333');
        
        order.order.items.forEach((product, index) => {
            const quantity = Number(product.quantity) || 0;
            const price = Number(product.priceWhenBought) || 0;
            const itemTotal = price * quantity;
            subtotal += itemTotal;
            itemCount++;

            if (isNaN(itemTotal)) {
                console.warn('[Invoice] Invalid product calculation', product);
                return;
            }

            // Alternate row background color with borders
            if (index % 2 === 0) {
                doc.rect(col1X_Table, rowY, tableWidth, rowHeight).fill('#f4f0ed');
            } else {
                doc.rect(col1X_Table, rowY, tableWidth, rowHeight).fill('#fefdfb');
            }
            
            // Row border
            doc.strokeColor('#D4C4B8').lineWidth(0.5);
            doc.rect(col1X_Table, rowY, tableWidth, rowHeight).stroke();

            // Vertical column divider lines
            doc.strokeColor('#D4C4B8').lineWidth(0.5);
            doc.moveTo(col2X_Table, rowY).lineTo(col2X_Table, rowY + rowHeight).stroke();
            doc.moveTo(col3X_Table, rowY).lineTo(col3X_Table, rowY + rowHeight).stroke();
            doc.moveTo(col4X_Table, rowY).lineTo(col4X_Table, rowY + rowHeight).stroke();

            // Content with proper alignment
            doc.fontSize(7).fillColor('#333').font('Helvetica');
            doc.text(`${product.name}`, col1X_Table + 10, rowY + 7, { width: 295 });
            doc.text(`${quantity}`, col2X_Table + 10, rowY + 7, { width: 60, align: 'center' });
            doc.text(`$${price.toFixed(2)}`, col3X_Table + 8, rowY + 7, { width: 50, align: 'center' });
            doc.text(`$${itemTotal.toFixed(2)}`, col4X_Table + 10, rowY + 7, { width: 50, align: 'right' });

            rowY += rowHeight;
        });

        // Bottom border
        doc.strokeColor('#8B6B55').lineWidth(2);
        doc.moveTo(col1X_Table, rowY).lineTo(col1X_Table + tableWidth, rowY).stroke();

        doc.moveDown(2.5);

        // ════════════════════════════════════════════════════════════
        // FINANCIAL SUMMARY SECTION
        // ════════════════════════════════════════════════════════════

        const summaryY = doc.y;
        const labelX = 360;
        const valueX = 555;

        if (isNaN(subtotal)) {
            subtotal = 0;
        }

        // Summary box background
        doc.rect(360, summaryY - 5, 205, 100).fill('#f9f7f4').stroke('#D4C4B8');

        // Summary lines
        doc.fontSize(8).font('Helvetica').fillColor('#666');
        doc.text('Subtotal:', labelX + 10, summaryY);
        doc.font('Helvetica-Bold').fillColor('#333');
        doc.text(`$${subtotal.toFixed(2)}`, valueX - 60, summaryY, { align: 'right', width: 55 });

        doc.font('Helvetica').fillColor('#666');
        doc.text('Tax (0%):', labelX + 10, summaryY + 14);
        doc.font('Helvetica-Bold').fillColor('#333');
        doc.text('$0.00', valueX - 60, summaryY + 14, { align: 'right', width: 55 });

        doc.font('Helvetica').fillColor('#666');
        doc.text('Shipping:', labelX + 10, summaryY + 28);
        doc.font('Helvetica-Bold').fillColor('#333');
        doc.text('$0.00', valueX - 60, summaryY + 28, { align: 'right', width: 55 });

        // Divider line
        doc.strokeColor('#D4C4B8').lineWidth(1);
        doc.moveTo(370, summaryY + 42).lineTo(545, summaryY + 42).stroke();

        // Total Due Box - Professional styling
        const totalBoxY = summaryY + 48;
        doc.rect(360, totalBoxY, 205, 40).fill('#EB8556').stroke('#EB8556').lineWidth(2);
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.text('TOTAL AMOUNT DUE', labelX + 10, totalBoxY + 4);
        
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#fff');
        doc.text(`$${totalPrice.toFixed(2)}`, valueX - 60, totalBoxY + 16, { align: 'right', width: 55 });

        doc.moveDown(5);

        // ════════════════════════════════════════════════════════════
        // ADDITIONAL INFORMATION SECTION
        // ════════════════════════════════════════════════════════════

        const additionalY = doc.y;

        // Payment Information Box
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#EB8556').text('Payment Information', 35);
        doc.fontSize(7).font('Helvetica').fillColor('#333');
        doc.text(`Method: Digital Wallet`, 35, additionalY + 14);
        doc.text(`Amount Paid: $${totalPrice.toFixed(2)}`, 35, additionalY + 24);
        doc.text(`Payment Status: Completed`, 35, additionalY + 34);
        doc.text(`Payment Date: ${invoiceDate}`, 35, additionalY + 44);

        // Contact Information Box on right
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#EB8556').text('Contact Information', 310);
        doc.fontSize(7).font('Helvetica').fillColor('#333');
        doc.text(`Email: support@handlyy.com`, 310, additionalY + 14);
        doc.text(`Phone: +1 (800) 123-4567`, 310, additionalY + 24);
        doc.text(`Website: www.handlyy.com`, 310, additionalY + 34);
        doc.text(`Hours: Monday - Friday, 9AM-6PM EST`, 310, additionalY + 44);

        // Separator line
        doc.strokeColor('#D4C4B8').lineWidth(1);
        doc.moveTo(35, additionalY + 58).lineTo(560, additionalY + 58).stroke();

        doc.moveDown(3.5);

        // ════════════════════════════════════════════════════════════
        // TERMS & CONDITIONS
        // ════════════════════════════════════════════════════════════

        doc.fontSize(8).font('Helvetica-Bold').fillColor('#8B6B55').text('Terms & Conditions:');
        doc.fontSize(6.5).font('Helvetica').fillColor('#555');
        doc.text('Thank you for your order with HANDLYY! This invoice is an official proof of purchase and should be retained for your records. All items purchased are subject to our comprehensive return and exchange policy. For any inquiries, disputes, or concerns about your order, please contact our support team at support@handlyy.com within 30 days of this transaction. We guarantee the quality of all our products and services.', { width: 530 });

        doc.moveDown(1.5);

        // ════════════════════════════════════════════════════════════
        // FOOTER
        // ════════════════════════════════════════════════════════════

        // Bottom accent bar
        doc.rect(0, 755, 700, 8).fill('#EB8556');

        doc.fontSize(6.5).fillColor('#8B6B55');
        doc.text('─'.repeat(115), 35, 766);
        
        doc.fontSize(6).fillColor('#7D6652');
        doc.text('HANDLYY © 2024 - Professional Tailoring & Fashion Services - All Rights Reserved', 35, 774, { align: 'center' });
        doc.text('www.handlyy.com  |  support@handlyy.com  |  +1 (800) 123-4567', 35, 781, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, 35, 789, { align: 'center' });

        doc.end();
        
    } catch (error) {
        console.log('[Invoice Error]', error.message);
        if (!res.headersSent) {
            return res.status(500).json({message : 'Error generating invoice'});
        }
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