import mongoose , {Schema , Types} from "mongoose";

///////////////////////////////////////////
//STILL WORKING ON IT , MIGHT CHANGE IT///
/////////////////////////////////////////

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
    } ,
    type : {
        type : String ,
        required : true ,
        default : 'text' ,
        enum : ['text' , 'image' , 'video']
    }
} , {timestamps : true})


const Message = mongoose.model('Message' , messageSchema) ;

export default Message ;