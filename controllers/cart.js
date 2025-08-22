import Product from "../models/Product.js";
import User from "../models/User.js" ;

const updateItemQuantity = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;
    const quantity = Math.floor(req.body.quantity) ;

    console.log('am hereeeeeeeeeeeeeeeeeeeeeeee')
    try {

        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Invalid user'})
        }
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'Invalid product'}) ;
        }
        if (quantity <= 0) {
            return res.status(400).json({message : 'the quanity cant be less then 0'}) ;
        } 
        const userProduct = user.cart.items.find((item) => {
            return item.productId.toString() === productId.toString() ;
        })


        if (userProduct.quantity < quantity) {

            const updatedQuantity = quantity - userProduct.quantity ;
            if (updatedQuantity > product.availbleItems) {
                return res.status(400).json({message : 'cant update , there isnt sufficent availble items'}) ;
            }
            userProduct.quantity += updatedQuantity ;
            if (updatedQuantity === product.availbleItems) {
                product.availble = false ;
            }
            product.availbleItems -= updatedQuantity ;
            user.cart.totalPrice += updatedQuantity * product.price 

        } else if (userProduct.quantity > quantity) {

            const updatedQuantity = userProduct.quantity - quantity ;
            product.availbleItems += updatedQuantity ;
            userProduct.quantity = quantity ;
            user.cart.totalPrice -= product.price *updatedQuantity ;
            
        } 
        await product.save() ;
        await user.save() ;
        return res.status(200).json({message : `product with id : ${productId}`}) ;
    } catch (error) {

    }
    const user = await User.findById(userId) ;
}

const deleteCart = async (req , res , next) => {
    const userId = req.user.id ;
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'invalid user , couldnt empty cart try again'}) ;
        }
        user.cart.items.forEach(async (item) => {
            const productId = item.productId ;
            const quantity = item.quantity ;
            const product = await Product.findById(productId) ;
            if (!product) {
                return res.status(400).json({message : 'couldnt find a product with similair id'}) ;
            }
            product.availbleItems += quantity ;
            if (!product.availble) {
                product.availble = true ;
            }
            await product.save() ;
        })

        user.cart.items = [] ;
        user.cart.totalPrice = 0 ;
        await user.save() ;
        return res.status(200).json({message : 'cart has been reseted'}) ;
    } catch (error) {
        return res.status(500).json({message : 'iternal sever error jjjj'}) ;
    }
}

const deleteProductFromCart = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'couldnt find your user'}) ;
        }
        const product = await Product.findById(productId) ;
        if (!product) {
            return res.status(400).json({message : 'couldnt find product with similair id'}) ;
        }
        let quantity ;
        const newCartItems = user.cart.items.filter((item) => {
            if (item.productId.toString() === productId.toString()) {
                quantity = item.quantity ;
            }
            return item.productId.toString() !== productId.toString()
        })
        if (!product.availble) {
            product.availble = true ;
        }
        product.availbleItems += quantity ;
        user.cart.items = newCartItems ;
        user.cart.totalPrice -= quantity * product.price ;
        await user.save() ;
        await product.save()
        return res.status(200).json({message : `product with id : ${productId} was removed from cart`})
    } catch (error) {
        return res.status(400).json({message : 'Iternal server error'}) ;
    }
}

const buyProduct = async (req , res , next) => {
    const productId = req.params.productId ;
    const userId = req.user.id ;
    const quantity = Math.floor(req.body.quantity) ;

    if (quantity <= 0) {
        return res.status(400).json({message : 'cant buy minus product'}) ;
    }
    try {
        const user = await User.findById(userId) ;
        const product = await Product.findById(productId) ; 

        if (!user) {
            return res.status(400).json({message : 'Couldnt find a user with same id , try again'}) ;
        }
        if (!product) {
            return res.status(400).json({message : 'Couldnt find a product with same id'})
        }

        if (product.quantity < quantity) {
            return res.status(400).json({message : 'There isnt enough availble items'}) ;
        }
        let cartItems = user.cart.items ;
        let itemIndex = cartItems.findIndex(item  => {
            return item.productId.toString() === product.id.toString() ;
        }) ;

        if (itemIndex < 0) {
            cartItems.push({
                productId : product._id ,
                quantity : quantity
            })
        } else {
            cartItems[itemIndex].quantity += quantity ;
        }

        user.cart.totalPrice += quantity * product.price ;

        if (product.availbleItems === quantity) {

            product.quantity = 0 ;
            product.availble = false ;

        } else {
            product.availbleItems -= quantity ;
        }
        await user.save() ;
        await product.save() ;
        return res.status(200).json({message : 'items were added to cart' , cart : user.cart}) ;
        
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getCart = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : `couldnt find your user`}) ;
        }

        await user.populate('cart.items.productId') ;
        const { cart } = user ;


        const newCart = {
            totalPrice : cart.totalPrice ,
            items : cart.items.map(item => {
                return {
                    quantity : item.quantity ,
                    name : item.productId.name ,
                    description : item.productId.description ,
                    price : item.productId.price ,
                    creatorId : item.productId.creatorId ,
                    images : item.productId.images ,
                    categories : item.productId.categories ,
                    productId : item.productId._id
                }
            })
        }

        return res.status(200).json({ cart : newCart}) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const cart = {deleteCart , deleteProductFromCart , buyProduct , updateItemQuantity , getCart } ;
export  {cart} 