import User from "../models/User.js";
import Product from "../models/Product.js";
import validator from 'validator' ;
import cloudinary from "../cloudinary.js";
import transporter from "../service/emailTransporter.js";
import extractPublicId from "../helperFunctions/cloudinaryImageId.js";

const PRODUCTS_PER_PAGE = 12 ;

const PostProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const productDetail = req.body ;
    // memory storage for uploaded data into the cloud in case of failure so we can retrieve them and
    // remove them from cloudinary servers
    req.memorystorage = [] ;
    if (!userId) {
        return res.status(400).json({message : 'invalid user'}) ;
    }
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'invalid user'}) ;
        }

        if (user.power !== 'admin' || user.power !== 'seller') {
            return res.status(400).json({message : 'You are not allowed to create products'}) ;
        }

        let status = false ;
        let errors = {
            name : undefined ,
            price : undefined ,
            description : undefined ,
            type : undefined ,
            availbleItems : undefined ,
            categories : undefined ,
            images : undefined
        }

        const name = productDetail.name.trim() || '' ;
        const price = Number(productDetail.price) ;
        const description = productDetail.description.trim() || '' ;
        const type = productDetail.type.trim() || '' ;
        const availbleItems = Math.floor(Number(productDetail.quantity)) ;
        const categories = productDetail.categories ;


        const images = req.files ;


        if (validator.isEmpty(name)) {
            errors.name = 'cant leave the name empty' ;
            status = true
        }
        if(!validator.isLength(name , {min : 3 , max : 40})) {
            errors.name = 'name should be between 3 and 20 characters' ;
            status = true ;
        } 
        if (validator.isEmpty(description)) {
            errors.description = 'cant leave the description empty' ;
            status = true ;
        }
        if (!validator.isLength(description , {min : 10 , max : 150})) {
            errors.description = 'the description must be between 10 and 80 characters' ;
            status = true ;
        }

        if (price <= 0) {
            errors.price = 'invalid price' ;
            status = true ;
        }
        if (type !== 'raw' && type !== 'custom' && type !== 'normal') {
            errors.type = 'invalid type' ;
            status = true ;
        }
        if (availbleItems <= 0) {
            errors.availbleItems = 'cant have minus availble items' ;
            status = true
        }
        if (images.length > 4 || images.length < 1) {
            errors.images = 'you are allowed to post only 4 images ' ;
            status = true ;
        }

        if (status) {
            return res.status(400).json({message : 'error validating' , errors : errors}) ;
        }
        // what does valid do here , it works as variable if the user was admin then the product is valid directly else is
        // not and needs admin verification
        let valid = false ;

        if (user.power === 'admin') {
            valid = true ;
        }

    
        const promiseUrls = images.map(async (file) => {
            const response = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}` ,
                {folder : 'product_images'}
            ) ;
            req.memorystorage.push(`product_images/${extractPublicId(response.secure_url)}`)
            return response.secure_url ;
        })

        const productImages = await Promise.all(promiseUrls) ;

        const product = new Product({
            name : name ,
            price : price.toFixed(2) ,
            description : description ,
            type : type ,
            images : productImages ,
            availbleItems : availbleItems ,
            categories : [...categories],
            creatorId : user._id ,
            valid : valid
        })

        const createdProduct = await product.save() ;
        return res.status(200).json({message : `product created with id : ${createdProduct._id}`})
    } catch (error) {
        next(error) ;
    }
}

const getProducts = async (req , res , next) => {
    try {
        // Get page from query parameter, default to 1
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = PRODUCTS_PER_PAGE; // Always 20 products per page
        const skip = (page - 1) * limit;

        const [products , totalProducts] = await Promise.all([
            Product.find({valid : true})
                .sort({createdAt : -1})
                .skip(skip)
                .limit(limit),
            Product.countDocuments({valid : true})
        ]) ;

        const totalPages = Math.max(Math.ceil(totalProducts / limit) , 1);

        return res.status(200).json({
            products : products,
            pagination : {
                page,
                limit,
                totalItems : totalProducts,
                totalPages : totalPages,
                hasNextPage : page < totalPages,
                hasPrevPage : page > 1
            }
        }) ;
    } catch (error) {
        return res.status(500).json({message : 'server again'}) ;
    }
}

const getUserProducts = async (req , res , next) => {
    const userId = req.user.id ;
    const valid = req.params.valid ;

    try {
        let userProducts ;
        if (valid === 'valid') {
            userProducts = await Product.find({creatorId : userId , valid : true}) ;
        }
        if (valid === 'notValid') {
            userProducts = await Product.find({creatorId : userId , valid : false}) ;
        }

        console.log(userProducts) ;

        return res.status(200).json({products : userProducts}) ;

    } catch (error) {
        return res.status(500).json({message : 'cant fetch the products , iternal server error'}) ;
    }

}

const updateUserProduct = async (req , res , next) => {
    const productId = req.params.productId ;
    const userId = req.user.id ;
    const productName = req.body.name.trim() || '' ;
    const productDescription = req.body.description.trim() || '' ;
    const productPrice = req.body.price ;
    const type = req.body.type.trim() || ''
    const availbleItems = req.body.availbleItems ;
    const categories = req.body.categories ;

    // memory storage to handle if any error happened 
    // refrence for images in case of fail so we can 
    // remove them in the next route handeler
    req.memorystorage = [] ;


    try {
        const user = await User.findById(userId) ;
        const product = await Product.findById(productId) ;
        if (!user) {
            return res.status(400).json({message : 'couldnt find user' , errors : {
                user : 'there is no user with familair id'
            }})
        }
        if (!product) {
            return res.status(400).json({message : 'cant find product' , errors : {
                product : 'there is no product with familair id'
            }})
        }

        if (user._id.toString() !== product.creatorId.toString()) {
            return res.status(400).json({message : 'cant edit a product that you dont own'}) ;
        }

        let status = false ;
        // the error object that would be show in the frontend page 
        // the fields that stay undefined wouldnt be sent 
        let errors = {
            name : undefined ,
            price : undefined ,
            description : undefined ,
            type : undefined ,
            availbleItems : undefined ,
            proudctIdMatchUser : undefined ,
            images : undefined ,
            categories : undefined
        }

        if (req.files.length < 1 || req.files.length > 4) {
            errors.images = 'the max amount of images is 4 and the minimum is one' ;
            status = true ;
        }
        if (categories.length < 1) {
            errors.categories = 'you must at least add a categorie , max 4' ;
            status = true ; 
        }
        if (validator.isEmpty(productName)) {
            errors.name = 'cant leave the name empty' ;
            status = true
        }
        if(!validator.isLength(productName , {min : 3 , max : 40})) {
            errors.name = 'name should be between 3 and 20 characters' ;
            status = true ;
        } 
        if (validator.isEmpty(productDescription)) {
            errors.description = 'cant leave the description empty' ;
            status = true ;
        }
        if (!validator.isLength(productDescription , {min : 10 , max : 150})) {
            errors.description = 'the description must be between 10 and 40 characters' ;
            status = true ;
        }

        if (productPrice <= 0) {
            errors.price = 'invalid price' ;
            status = true ;
        }
        if (type !== 'raw' && type !== 'custom' && type !== 'normal') {
            errors.type = 'invalid type' ;
            status = true ;
        }
        if (availbleItems <= 0) {
            errors.availbleItems = 'cant have minus availble items' ;
            status = true ;
        }

        if (status) {
            return res.status(400).json({message : 'error validating' , errors : errors}) ;
        }

        const oldImages = product.images ;

        let productStatus = false ;
        if (user.power === 'admin') {
            productStatus = true ;
        }    

        // setting up the new images 
        const promiseUrls = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}` ,
                {folder : 'product_images' , use_filename : true , unique_filename : false}
            ) ;
            req.memorystorage.push(`product_images/${extractPublicId(response.secure_url)}`) ;
            return response.secure_url ; 
        })

        const productImages = await Promise.all(promiseUrls) ;

        product.name = productName ;
        product.description = productDescription ;
        product.price = productPrice ;
        product.availbleItems = availbleItems ;
        product.type = type ;
        product.images = productImages ;
        product.categories = [...categories] ;
        product.status = productStatus  ;


        // deletting the old images
        const promiseImages = oldImages.map(async (image) => {
            const publicId = extractPublicId(image) ;
            await cloudinary.uploader.destroy(`product_images/${publicId}`) ;
        })
        await product.save() ;
        await Promise.all(promiseImages) ;

        return res.status(200).json({message : 'product has been updated'}) ;
    } catch (error) {
        next(error) ;
    }

}

const productDelete = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'couldnt find a user with similair name'}) ;
        }
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'couldnt find a product with similair id'}) ;
        }
        if (product.creatorId.toString() !== user._id.toString()) {
            return res.status(400).json({message : 'you are not allowed to delete this product since you didnt create it'}) ;
        }
        const images = product.images ;
        
        const promiseImages = images.map(async (image) => {
            const publicId = extractPublicId(image) ;
            await cloudinary.uploader.destroy(`product_images/${publicId}`) ; 
        })
        await Promise.all(promiseImages) ;

        await product.deleteOne() ;
        return res.status(200).json({message : 'product has been deleted'}) ;
    } catch (error) {
        return res.status(500).json({message : 'iternal server error , try later'}) ;
    }


}

const getProductDetails = async (req , res , next) => {
    // in this controller we also return some of the user details since i want to display it
    // at the page as the user created this product 
    const productId = req.params.productId ;
    try {
        const product = await Product.findById(productId).populate('reviews.commenterId', 'name avatar') ;
        if (!product) {
            return res.status(400).json({message : 'Product not found'}) ;
        }
        const creator = await User.findById(product.creatorId) ;
        if (!creator) {
            return res.status(400).json({message : 'Creator not found'}) ;
        }

        return res.status(200).json({product : product , creator : {
            name : creator.name ,
            bio : creator.bio ,
            _id : creator._id
        }}) ;
    } catch (error) {
        console.error(error) ;
        return res.status(500).json({message : 'Internal server error, try again later'}) ;
    }
}

const putComment = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;
    const commentDetails = req.body.commentDetails ;

    if (!commentDetails.comment || commentDetails.comment.trim().length === 0) {
        return res.status(400).json({message : 'Comment cannot be empty'}) ;
    }
    if (commentDetails.comment.length > 200 ) {
        return res.status(400).json({message : 'Comment must be at most 200 characters'}) ;
    }
    if (!Number.isInteger(commentDetails.rating) || !(1 <= commentDetails.rating && commentDetails.rating <= 5)) {
        return res.status(400).json({message : 'Rating must be an integer between 1 and 5'}) ;
    }

    try {
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'Product not found'}) ;
        } 
        let existingReviewIndex = -1 ;
        product.reviews.forEach((review, index) => {
            if (review.commenterId.toString() === userId) {
                existingReviewIndex = index ;
            }
        })

        if (existingReviewIndex !== -1) {
            return res.status(400).json({message : 'You already commented on this product. Use update endpoint to modify.'}) ;
        }
        
        product.reviews.push({
            comment : commentDetails.comment.trim() ,
            rating : commentDetails.rating ,
            commenterId : userId
        })   

        product.ratings.count ++ ;
        product.ratings.average = (product.ratings.average * (product.ratings.count - 1) + commentDetails.rating) / product.ratings.count ;
        await product.save() ;
        
        return res.status(201).json({message : 'Comment added successfully', review : product.reviews[product.reviews.length - 1]}) ;
    } catch (err) {
        console.error(err) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const updateComment = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;
    const { comment, rating } = req.body ;

    if (!comment || comment.trim().length === 0) {
        return res.status(400).json({message : 'Comment cannot be empty'}) ;
    }
    if (comment.length > 200) {
        return res.status(400).json({message : 'Comment must be at most 200 characters'}) ;
    }
    if (!Number.isInteger(rating) || !(1 <= rating && rating <= 5)) {
        return res.status(400).json({message : 'Rating must be an integer between 1 and 5'}) ;
    }

    try {
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(404).json({message : 'Product not found'}) ;
        }
        
        const reviewIndex = product.reviews.findIndex(r => r.commenterId.toString() === userId) ;
        if (reviewIndex === -1) {
            return res.status(404).json({message : 'Review not found'}) ;
        }

        const oldRating = product.reviews[reviewIndex].rating ;
        product.reviews[reviewIndex].comment = comment.trim() ;
        product.reviews[reviewIndex].rating = rating ;
        product.reviews[reviewIndex].updatedAt = new Date() ;

        // Recalculate average rating
        product.ratings.average = (product.ratings.average * product.ratings.count - oldRating + rating) / product.ratings.count ;
        
        await product.save() ;
        return res.status(200).json({message : 'Review updated successfully', review : product.reviews[reviewIndex]}) ;
    } catch (err) {
        console.error(err) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const deleteComment = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;

    try {
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(404).json({message : 'Product not found'}) ;
        }

        const reviewIndex = product.reviews.findIndex(r => r.commenterId.toString() === userId) ;
        if (reviewIndex === -1) {
            return res.status(404).json({message : 'Review not found'}) ;
        }

        const deletedRating = product.reviews[reviewIndex].rating ;
        product.reviews.splice(reviewIndex, 1) ;
        
        // Recalculate average rating
        if (product.ratings.count > 1) {
            product.ratings.average = (product.ratings.average * product.ratings.count - deletedRating) / (product.ratings.count - 1) ;
        } else {
            product.ratings.average = 0 ;
        }
        product.ratings.count -- ;

        await product.save() ;
        return res.status(200).json({message : 'Review deleted successfully'}) ;
    } catch (err) {
        console.error(err) ;
        return res.status(500).json({message : 'Internal server error'}) ;
    }
}

const products = {PostProduct , getProducts , getUserProducts , updateUserProduct , productDelete , getProductDetails
    , putComment , updateComment , deleteComment
} ;
export default products ;