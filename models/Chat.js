import mongoose , { Schema , Types} from 'mongoose' ;

//////////////////////////////////////////
//STILL WORKING ON IT , MIGHT CHANGE IT///
/////////////////////////////////////////

const chatSchema = new Schema ({
    users : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    }] ,
    messages : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'Message' ,
        default : []
    }] ,
    lastMessage : {
        type : Types.ObjectId ,
        ref : 'Message' ,
        default : null
    } ,
    lastMessageAt : {
        type : Date ,
        default : null
    } ,
    participants : [{
        userId : {
            type : Types.ObjectId ,
            ref : 'User'
        } ,
        unreadCount : {
            type : Number ,
            default : 0
        }
    }] ,
    ChatImage : {
        type : String ,
        required : true ,
        default : 'no image'
    }
} , {timestamps : true}) ;

const Chat = mongoose.model('Chat' , chatSchema) ;

export default Chat ;