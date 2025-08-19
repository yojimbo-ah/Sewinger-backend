import User from "../models/User.js";
import Product from "../models/Product.js";
import validator from 'validator' ;
import path from 'path' ;
import fs from 'fs' ;
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PostProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const productDetail = req.body ;

    if(!userId) {
        return res.status(400).json({message : 'invalid user'}) ;
    }

    const user = await User.findById(userId) ;

    if (!user) {
        return res.status(400).json({message : 'invalid user , you are not allowed to create product'}) ;
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

    const name = productDetail.name.trim() ;
    const price = Number(productDetail.price) ;
    const description = productDetail.description.trim();
    const type = productDetail.type.trim() ;
    const availbleItems = Math.floor(Number(productDetail.quantity)) ;
    const categories = productDetail.categories ;

    const images = req.files.map(file => {
        return file.filename ;
    }) ;


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
    if (images.isLength > 4 || images.length < 1) {
        errors.images = 'you are allowed to post only 4 images ' ;
        status = true ;
    }

    if (status) {
        return res.status(400).json({message : 'error validating' , errors : errors}) ;
    }

    const product = new Product({
        name : name ,
        price : price.toFixed(2) ,
        description : description ,
        type : type ,
        images : images ,
        availbleItems : availbleItems ,
        categories : [...categories],
        creatorId : user._id
    })

    const createdProduct = await product.save() ;
    return res.status(200).json({message : `product created with id : ${createdProduct._id}`})

}

const getProducts = async (req , res , next) => {
    try {
        const products = await Product.find({valid : true}) ;
        return res.status(200).json({products : products}) ;
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
    console.log('am about to update my product') ;
    console.log(req.body)
    console.log(req.files)
    const productId = req.params.productId ;
    const userId = req.user.id ;
    const productName = req.body.name.trim() ;
    const productDescription = req.body.description.trim() ;
    const productPrice = req.body.price ;
    const type = req.body.type.trim() ;
    const availbleItems = req.body.availbleItems ;
    const categories = req.body.categories ;
    const images = req.files.map((file) => {
        return file.filename
    })

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

        if (images.length < 1 || images.length > 4) {
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

        if (user._id.toString() !== product.creatorId.toString()) {
            errors.proudctIdMatchUser = 'you dont own this product to edit it' ;
            status = true ;
        }
        if (status) {
            return res.status(400).json({message : 'error validating' , errors : errors}) ;
        }
        product.name = productName ;
        product.description = productDescription ;
        product.price = productPrice ;
        product.availbleItems = availbleItems ;
        product.type = type ;
        product.images = images ;
        product.categories = [...categories] ;
        
        images.forEach((image) => {
            const filePath = path.join(__dirname , '../images' , image) ;
            fs.unlink(filePath , (err) => {
                if (err) {
                    console.log(err) ;
                }
            })
        })
        await product.save() ;

        return res.status(200).json({message : 'product has been created'}) ;
    } catch (error) {
        return res.status(500).json({message : 'error happened' , error : error}) ;
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

        images.forEach((image) => {
            const filePath = path.join(__dirname , '../images' , image) ;
            fs.unlink(filePath , (err) => {
                console.log(err) ;
            })
        })

        await product.deleteOne() ;
        return res.status(200).json({message : 'product has been deleted'}) ;
    } catch (error) {
        return res.status(500).json({message : 'iternal server error , try later'}) ;
    }


}

const products = {PostProduct , getProducts , getUserProducts , updateUserProduct , productDelete } ;
export default products ;