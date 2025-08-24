import mongoose , { Schema, Types} from 'mongoose' ;

const orderSchema = new Schema({
    ownerId : {
        type : Types.ObjectId ,
        required : true
    } ,
    order : {
        totalPrice : {
            type : Number ,
            required : true
        } ,
        items :[{
            itemId : {
                type : Types.ObjectId ,
                required : true ,
                ref : 'User'
            } ,
            quantity : {
                type : Number ,
                required : true
            } ,
            priceWhenBought : {
                type : Number ,
                required : true
            } ,
            name : {
                type : String ,
                required : true
            }
        }]
    }
 } , {timestamps : true})

const Order = mongoose.model('Order' , orderSchema) ;

export default Order ;