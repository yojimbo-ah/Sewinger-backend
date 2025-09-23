import mongoose , {Schema , Types} from 'mongoose' ;

const messageGroupSchema = new Schema ({
    message : {
        type : String ,
        required : true 
    } ,
    senderId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    type : {
        type : String ,
        required : true ,
        enum : ['text' , 'image' , 'video'] ,
        default : 'text'
    }
})

const MessageGroup = mongoose.model('MessageGroup' , messageGroupSchema) ;

export default MessageGroup ;