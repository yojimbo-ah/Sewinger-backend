import User from "../models/User.js"
import Product from "../models/Product.js"
import UserWaitSellerConf from "../models/UserWaitSellerConf.js"
import { createTransport } from "nodemailer"

const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : 'abbad.ahmed.gg@gmail.com' ,
        pass : 'kzfstadzrocduaar'
    } 
})

const adminGetPendingProducts = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }

        if (user.power !== 'admin') {
            return res.status(400).json({message : 'This user is not allowed as a admin'})
        }

        const products = await Product.find({valid : false}) ;
        return res.status(200).json({products : products}) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const adminGetSellerRequests = async (req , res , next) => {
    const adminId = req.user.id ;

    try {
        const admin = await User.findById(adminId) ;
        if (!admin) {
            return res.status(400).json({message : 'There is no user with similair information'}) ;
        }
        if (admin.power !== 'admin') {
            return res.status(400).json({message : 'This user is now allowed as admin'}) ;
        }
        const requests = await UserWaitSellerConf.find() ;

        return res.status(200).json({requests : requests}) ;
    } catch (error) {

    }

}

const adminPatchProductStatus = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'there is no user with this info'}) ;
        }

        if (user.power !== 'admin') {
            return res.status(400).json({message : 'This user is not allowed as admin'}) ;
        }
        const product = await Product.findById(productId) ;

        if (!product) {
            return res.status(400).json({message : 'Cant find product with similair id'}) ;
        }
        product.valid = true ;
        await product.save() ;
        transporter.sendMail({
            from : 'Sewinger team <abbad.ahmed.gg@gmail.com>' ,
            to : user.email ,
            subject : 'Product validation' ,
            html : `<p>the product with ID : ${productId} , has been veryfied by the admin : ${user.name.lastName} ${user.name.firstName}</p>`
        })
        return res.status(200).json({message : 'Product was verefied'}) ;


    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const adminPatchUserPower = async (req , res , next) => {
    const adminId = req.user.id ;
    const userId = req.params.userId ;

    try {
        const admin = await User.findById(adminId) ;
        if (!admin) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }
        if (admin.power !== 'admin') {
            return res.status(400).json({message : 'This user is not allowed as admin'}) ;
        }
        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : 'Couldnt find the user'}) ;
        }

        user.power = 'seller' ;
        await user.save() ;
            transporter.sendMail({
            from : 'Sewinger team <abbad.ahmed.gg@gmail.com>' ,
            to : user.email ,
            subject : 'Account' ,
            html : `<p>You Account has been set as a seller by the admin ${admin.name.firstName} ${admin.name.lastName}</p>`
        })
        return res.status(200).json({message : 'Success '}) ;

    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const admin = {adminGetPendingProducts , adminPatchProductStatus , adminPatchUserPower , adminGetSellerRequests} ;

export default admin ;