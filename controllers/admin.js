import User from "../models/User.js"
import Product from "../models/Product.js"
import UserWaitSellerConf from "../models/UserWaitSellerConf.js"
import transporter from "../service/emailTransporter.js"
import resend from "../service/resend.js"
import { productDeleted, productVerfied, sellerRequestAccepted } from "../helperFunctions/emailPages.js"

const adminGetPendingProducts = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    try {

        const products = await Product.find({valid : false}).populate('creatorId') ;
        console.log(`📊 Pending products fetched: ${products.length}`);
        
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
        console.error("Error fetching pending products:", error);
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const adminGetSellerRequests = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    try {
        
        // Only fetch requests that are either in manual review or pending (waiting for AI validation)
        const requests = await UserWaitSellerConf.find({
            $or: [
                { validationStatus: 'manual_review' },
                { validationStatus: 'pending' },
                { validationStatus: 'validating' } ,
                { validationStatus : 'not_compatible'}
            ]
        }).populate('userId') ;
        
        const sellerRequests = requests.map(request => {
            return {
                userId : request.userId._id ,
                description : request.description ,
                createdAt : request.createdAt ,
                files : request.files ,
                validationStatus : request.validationStatus ,
                aiValidationReason : request.aiValidationReason ,
                name : {
                    firstName : request.userId.name.firstName ,
                    lastName : request.userId.name.lastName
                } ,
                profilePicture : request.userId.bio.profileImage
            }
        })
        console.log("📊 Seller Requests fetched:", sellerRequests.length);
        return res.status(200).json({requests : sellerRequests}) ;
    } catch (error) {
        console.error("Error fetching seller requests:", error);
        return res.status(500).json({message : 'Internal server error'}) ;
    }

}

const adminPatchProductStatus = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    const productId = req.params.productId ;
    try {
        const product = await Product.findById(productId) ;

        if (!product) {
            return res.status(400).json({message : 'Cant find product with similair id'}) ;
        }
        const seller = await User.findById(product.creatorId) ;
        if (!seller) {
            return res.status(400).json({message : 'Error happened try again later'}) ;
        }
        product.valid = true ;
        await product.save() ;
        const data = resend.emails.send({
            from : 'handlyy corp <no_reply@handlyy.tech>' ,
            to : seller.email ,
            subject : 'Product validation' ,
            html : productVerfied(productId , req.user.name) 
        })
        return res.status(200).json({message : 'Product was verefied'}) ;


    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const adminDeleteProduct = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    const productId = req.params.productId ;

    try {
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'Couldnt find product with similair info'}) ;
        }
        const user = await User.findById(product.creatorId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find the creator of the product'}) ;
        }

        await product.deleteOne() ;
        const data = resend.emails.send({
            from : 'handlyy corp <no_reply@handlyy.tech>' ,
            to : seller.email ,
            subject : 'Product deleted' ,
            html : productDeleted(productId)
        })
        return res.status(200).json({message : 'Product deleted succcesffuly'}) ;
    } catch (error) {

    }
}

const adminPatchUserPower = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    const userId = req.params.userId ;
    const status = req.body.status ;
    try {
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
        const data = resend.emails.send({
            from : 'handlyy corp <no_reply@handlyy.tech>' ,
            to : seller.email ,
            subject : 'Seller validation' ,
            html :  sellerRequestAccepted(user.name)
        })
        return res.status(200).json({message : 'Success '}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const adminGetStats = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    try {

        const totalUsers = await User.countDocuments({}) ;
        const totalProducts = await Product.countDocuments({valid : true}) ;
        const pendingProducts = await Product.countDocuments({valid : false}) ;
        const totalSellers = await User.countDocuments({power : 'seller'}) ;
        const totalAdmins = await User.countDocuments({power : 'admin'}) ;
        const pendingSellerRequests = await UserWaitSellerConf.countDocuments({
            $or: [
                { validationStatus: 'manual_review' },
                { validationStatus: 'pending' },
                { validationStatus: 'validating' }
            ]
        }) ;

        return res.status(200).json({
            stats : {
                totalUsers ,
                totalProducts ,
                pendingProducts ,
                totalSellers ,
                totalAdmins ,
                pendingSellerRequests
            }
        }) ;
    } catch (error) {
        console.error(error) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const adminGetUsers = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    const page = Number(req.query.page) || 1 ;
    const limit = 10 ;
    const skip = (page - 1) * limit ;

    try {

        const users = await User.find({})
            .select('-password')
            .limit(limit)
            .skip(skip)
            .sort({createdAt : -1}) ;
        
        const totalUsers = await User.countDocuments({}) ;
        const totalPages = Math.ceil(totalUsers / limit) ;

        return res.status(200).json({
            users ,
            pagination : {
                currentPage : page ,
                totalPages ,
                totalUsers ,
                limit
            }
        }) ;
    } catch (error) {
        console.error(error) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const adminGetProducts = async (req , res , next) => {
    // Admin verification is handled by verifyAdmin middleware
    const page = Number(req.query.page) || 1 ;
    const limit = 12 ;
    const skip = (page - 1) * limit ;
    const valid = req.query.valid === 'true' ? true : false ;

    try {

        const products = await Product.find({valid : valid})
            .populate('creatorId' , 'name email')
            .limit(limit)
            .skip(skip)
            .sort({createdAt : -1}) ;
        
        const totalProducts = await Product.countDocuments({valid : valid}) ;
        const totalPages = Math.ceil(totalProducts / limit) ;

        return res.status(200).json({
            products ,
            pagination : {
                currentPage : page ,
                totalPages ,
                totalProducts ,
                limit
            }
        }) ;
    } catch (error) {
        console.error(error) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const admin = {
    adminGetPendingProducts , 
    adminPatchProductStatus , 
    adminPatchUserPower , 
    adminGetSellerRequests , 
    adminDeleteProduct ,
    adminGetStats ,
    adminGetUsers ,
    adminGetProducts
} ;

export default admin ;