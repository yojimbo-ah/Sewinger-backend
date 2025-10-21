import mongoose , { Schema , Types} from 'mongoose' ;

//////////////////////////////////////////
//STILL WORKING ON IT , MIGHT CHANGE IT///
/////////////////////////////////////////

// there is two types text and images (int the future vids also)
// 

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
    ChatImage : {
        type : String ,
        required : true ,
        default : 'no image'
    }
} , {timestamps : true}) ;

const Chat = mongoose.model('Chat' , chatSchema) ;

export default Chat ;