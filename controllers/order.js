import User from "../models/User.js";
import Order from "../models/Order.js";

const putOrder = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;

        if (!user) {
            return res.starus(400).json({message : 'Couldnt find user with similair id'}) ;
        }

        await user.populate('cart.items.productId') ;
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
        return res.starus(500).json({message : 'Iternal server error'}) ;
    }

}


const getOrders = async (req , res , next) => {
    const userId = req.user.id ;
    console.log('am here')

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

const order = {putOrder , getOrders} ;

export default order ;