import mongoose , {Schema , Types} from "mongoose";

const userSchema = new Schema({
    name : {
        firstName : {
            type : String ,
            required : true
        } ,
        lastName : {
            type : String ,
            required : true
        }
    } ,
    email : {
        type : String ,
        required : true
    } ,
    password : {
        type : String ,
        required : true
    } ,
    products : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'Product'
    }] ,
    cart : {
        totalPrice : {
            type : Number ,
            required : true ,
            default : 0
        } ,
        items : [{
            productId : {
                type : Types.ObjectId ,
                ref : 'Product' ,
                required : true
            } ,
            quantity : {
                type : Number ,
                required : true
            }
        }]
    } ,
    power : {
        type : String ,
        required : true ,
        default : 'client'
    }, 
    orders : [{
        type : Types.ObjectId ,
        required : true ,
        ref :'Order'
    }]

})


const User = mongoose.model('User' , userSchema)

export default User ;