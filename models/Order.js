import mongoose , { Schema, Types} from 'mongoose' ;

// the order Schema , it has a field priceWhenBought since the price must change after the user buys it 
// and it shouldnt change the price since is already bought and it being shipped

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