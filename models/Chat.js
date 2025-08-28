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
    type : {
        type : String ,
        enum : ['private' , 'group'] ,
        required : true
    } ,
    messages : [{
        type : Types.ObjectId ,
        required : true ,
        ref : 'Message' ,
        default : []

    }]
} , {timestamps : true}) ;

const Chat = mongoose.model('Chat' , chatSchema) ;

export default Chat ;