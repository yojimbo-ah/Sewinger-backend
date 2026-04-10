import mongoose , {Schema , Types} from "mongoose";

// the main user Schema

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
    bio : {
        profileImage : {
            type : String ,
            required : false ,
            default : null
        } ,
        socials : {
            instagram : {
                type : String ,
                required : false ,
                default : null
            } ,
            facebook : {
                type : String ,
                required : false ,
                default : null
            } ,
            github : {
                type : String ,
                required : false ,
                default : null
            } 
        }
    } ,
    email : {
        type : String ,
        required : true ,
        unique : true
    } ,
    notification : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'Notification'
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
    // this will be considered as fake wallet 
    // it will not be integreated via like stripe api or chargily api
    // since i think it out of the scope of this project
    wallet : {
        balance : {
            type : Number ,
            required : true ,
            default : 0
        }
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
    // the rest of the field are for the communication side of the app 
    // it seld explanatory , it just refrence to other User schemas 
    // array of refrernces 
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
    }] ,
    groupChats : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'GroupChat' ,
        default : []
    }]
} , {timestamps : true})


const User = mongoose.model('User' , userSchema)

export default User ;