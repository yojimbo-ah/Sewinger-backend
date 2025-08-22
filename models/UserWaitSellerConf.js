import mongoose , {Schema , Types} from "mongoose";

const userWaitSellerConf = new Schema ({
    userId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    description : {
        
    }
})

const UserWaitSellerConf = mongoose.model('UserWaitSellerConf' , userWaitSellerConf) ;