import mongoose , {Schema , Types} from "mongoose";

// Schema for users that send a request for being a seller and awaits admin verification
const fileSchema = new Schema ({
    url : {
        type : String ,
        required : true
    } ,
    type : {
        type : String ,
        enum : ['image' , 'raw'] ,
        required : true
    } ,
    originalName : {
        type : String ,
        required : true
    }
} , {_id : false})

const userWaitSellerConf = new Schema ({
    userId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    description : {
        type : String ,
        required : true
    } ,
    files : {
        type : [fileSchema] ,
        required : true ,
        default : [] 
    } ,
    validationStatus : {
        type : String ,
        enum : ['pending', 'validating', 'not_compatible', 'manual_review', 'approved', 'rejected'] ,
        default : 'pending'
    } ,
    aiValidationReason : {
        type : String ,
        default : null
    }
} , {timestamps : true})

const UserWaitSellerConf = mongoose.model('UserWaitSellerConf' , userWaitSellerConf) ;
export default UserWaitSellerConf ;