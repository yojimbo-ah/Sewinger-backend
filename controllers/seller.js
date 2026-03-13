import User from "../models/User.js";
import Order from "../models/Order.js";

const getUsersWhoBoughtMyProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;
    
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(200).json({message : 'Couldnt find user'}) ;
        }

        if (user.power !== 'seller' && user.power !== 'admin') {
            return res.status({message : 'This user is not allowed as admin or seller'}) ;
        }

        const userIds = await Order.distinct('ownerId', {
            'order.items.itemId': productId
        }); 

        const usersPromise = userIds.map(async(userId) => {
            const buyer = await User.findById(userId) ;
            if (!buyer) {
                throw new Error ('Couldnt find the buyer try again later') ;
            }

            return {
                _id : buyer._id ,
                name : buyer.name ,
                bio : buyer.bio ,
                email : buyer.email
            }
        })
        const users = await Promise.all(usersPromise) ;

        console.log(userIds) ;
        return res.status(200).json({users : users}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getUserWhoBoughtMyProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const buyerId = req.params.buyerId ;
    const productId = req.params.productId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }

        const buyer = await User.findById(buyerId) ;
        if (!buyer) {
            return res.status(400).json({message : 'Couldnt find buyer'}) ;
        }

        if (user.power !== 'admin' && user.power !== 'seller') {
            return res.status(400).json({message : 'You are now allowed in this page'}) ;
        }

        const orderUser = await Order.findOne({
            ownerId: buyerId,
            'order.items.itemId': productId  
        });
        let productOrder ;
        orderUser.order.items.forEach((orderItem) => {
            if (orderItem.itemId.toString() === productId) {
                productOrder = orderItem ;
                return true ;
            }
        })

        if (!orderUser) {
            return res.status(400).json({message : 'Couldnt find the user'}) ;
        }

        return res.status(200).json({orderUser : productOrder , buyerDetails : {
            name : buyer.name ,
            _id : buyer._id ,
            email : buyer.email ,
            bio : buyer.bio

        }}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}


const seller = {getUsersWhoBoughtMyProduct , getUserWhoBoughtMyProduct} ;
export default seller ;