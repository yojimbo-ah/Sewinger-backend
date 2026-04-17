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
    } ,
    isRead : {
        type : Boolean ,
        default : false
    } ,
    readAt : {
        type : Date ,
        default : null
    }
} , {timestamps : true})


const Message = mongoose.model('Message' , messageSchema) ;

export default Message ;