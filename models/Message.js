import mongoose , {Schema , Types} from "mongoose";

const messageSchema = new Schema ({
    senderId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    reciverId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    message : {
        type : String ,
        required : true
    }
} , {timestamps : true})


const Message = mongoose.model('Message' , messageSchema) ;

export default Message ;