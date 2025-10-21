import User from "../models/User.js"
import Product from "../models/Product.js"
import UserWaitSellerConf from "../models/UserWaitSellerConf.js"
import transporter from "../service/emailTransporter.js"

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

        const products = await Product.find({valid : false}).populate('creatorId') ;
        const sentProducts = products.map(product => {
            return {
                ...product._doc ,
                creatorId : {
                    email : product.creatorId.email ,
                    name : product.creatorId.name ,
                    userId : product.creatorId._id
                }
            }
        })
        return res.status(200).json({products : sentProducts}) ;
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
        const requests = await UserWaitSellerConf.find().populate('userId') ;
        const sellerRequests = requests.map(request => {
            return {
                userId : request.userId._id ,
                description : request.description ,
                createdAt : request.createdAt ,
                name : {
                    firstName : request.userId.name.firstName ,
                    lastName : request.userId.name.lastName
                } ,
                profilePicture : request.userId.bio.profilePicture
            }
        })
        return res.status(200).json({requests : sellerRequests}) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
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
            from : `Sewinger team <${process.env.EMAIL}>` ,
            to : user.email ,
            subject : 'Product validation' ,
            html : `<p>the product with ID : ${productId} , has been veryfied by the admin : ${user.name.lastName} ${user.name.firstName}</p>`
        })
        return res.status(200).json({message : 'Product was verefied'}) ;


    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const adminDeleteProduct = async (req , res , next) => {
    const adminId = req.user.id ;
    const productId = req.params.productId ;


    try {
        const admin = await User.findById(adminId) ;
        if (!admin) {
            return res.status(400).json({message : 'Couldnt find user with similair info'}) ;
        }
        if (admin.power !== 'admin') {
            return res.status(400).json({message : 'This user is not allowed as admin'}) ;
        }
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'Couldnt find product with similair info'}) ;
        }
        const user = await User.findById(product.creatorId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find the creator of the product'}) ;
        }

        await product.deleteOne() ;
        transporter.sendMail({
            from : `Sewinger team <${process.env.EMAIL}>` ,
            to : user.email ,
            subject : 'Product deletion' ,
            html : `<p>the product with ID : ${productId} , has been deleted by the admin : ${admin.name.lastName} ${admin.name.firstName}</p>`
        })
        return res.status(200).json({message : 'Product deleted succcesffuly'}) ;
    } catch (error) {

    }
}

const adminPatchUserPower = async (req , res , next) => {
    const adminId = req.user.id ;
    const userId = req.params.userId ;
    const status = req.body.status ;
    try {
        const admin = await User.findById(adminId) ;
        if (!admin) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }
        if (admin.power !== 'admin') {
            return res.status(400).json({message : 'This user is not allowed as admin'}) ;
        }
        const user = await User.findById(userId) ;
        const request = await UserWaitSellerConf.findOne({userId : userId}) ;

        if (!user) {
            return res.status(400).json({message : 'Couldnt find the user'}) ;
        }
        if (!request) {
            return res.status(400).json({message : 'Error happened try again'}) ;
        }
        if (!status) {
            await UserWaitSellerConf.deleteMany({userId : userId}) ;
            console.log('am here') ;
            return res.status(200).json({message : 'Request to be seller has been denied'}) ;
        }

        user.power = 'seller' ;
        await UserWaitSellerConf.deleteMany({userId : userId}) ;
        await user.save() ;
            transporter.sendMail({
            from : `Sewinger team <${process.env.EMAIL}>` ,
            to : user.email ,
            subject : 'Account' ,
            html : `<p>You Account has been set as a seller by the admin ${admin.name.firstName} ${admin.name.lastName}</p>`
        })
        return res.status(200).json({message : 'Success '}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const admin = {adminGetPendingProducts , adminPatchProductStatus , adminPatchUserPower , adminGetSellerRequests , adminDeleteProduct} ;

export default admin ;