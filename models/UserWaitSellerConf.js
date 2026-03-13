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
        originalName : {
            type : String ,
            required : true
        }
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
    }
} , {timestamps : true})

const UserWaitSellerConf = mongoose.model('UserWaitSellerConf' , userWaitSellerConf) ;
export default UserWaitSellerConf ;