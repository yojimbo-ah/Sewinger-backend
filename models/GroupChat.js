import mongoose , { Schema , Types} from 'mongoose' ;


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
    }
} , {timestamps : true}) ;

const Chat = mongoose.model('Chat' , chatSchema) ;

export default Chat ;