import mongoose , {Schema , Types} from "mongoose";

// Schema for users that send a request for being a seller and awaits admin verification

const userWaitSellerConf = new Schema ({
    userId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    description : {
        type : String ,
        required : true
    }
} , {timestamps : true})

const UserWaitSellerConf = mongoose.model('UserWaitSellerConf' , userWaitSellerConf) ;
export default UserWaitSellerConf ;