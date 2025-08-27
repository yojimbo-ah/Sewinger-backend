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
        default : 'client' ,
        enum : ['admin' , 'client' , 'seller']
    }, 
    orders : [{
        type : Types.ObjectId ,
        required : true ,
        ref :'Order'
    }]  ,
    friends : [{
        _id : false ,
        friendId : {
            type : Types.ObjectId ,
            required : true ,
            ref : 'User' 
        } ,
        addedAt : {
            type : Date ,
            default : Date.now ,
            required : true
        }
    }] ,
    friendsRequests : [{
        _id : false ,
        friendId : {
            type : Types.ObjectId ,
            required : true ,
            ref : 'User'
        } ,
        sentAt : {
            type : Date ,
            default : Date.now ,
            required : true
        } ,
        sentBy : {
            type : String ,
            required : true ,
            enum : ['me' , 'friend']
        }
    }]
} , {timestamps : true})


const User = mongoose.model('User' , userSchema)

export default User ;