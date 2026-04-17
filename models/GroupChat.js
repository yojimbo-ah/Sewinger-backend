import mongoose , {Schema , Types} from "mongoose";

//////////////////////////////////////////
//STILL WORKING ON IT , MIGHT CHANGE IT///
/////////////////////////////////////////

const groupChatSchema = new Schema ({
    users : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    }] ,
    messages : [{
        type : Types.ObjectId ,
        required : true ,
        default : [] ,
        ref : 'MessageGroup'
    }] ,
    lastMessage : {
        type : Types.ObjectId ,
        ref : 'MessageGroup' ,
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
    options : {
        name : {
            type : String ,
            required : true ,
            default : 'group'
        } ,
        image : {
            type : String ,
            required : true ,
            default : 'No image'
        } ,
        admin : {
            type : Types.ObjectId ,
            ref : 'User' ,
            required : true
        }
    }
} , {timestamps : true})


const GroupChat = mongoose.model('GroupChat' , groupChatSchema) ;
export default GroupChat ;