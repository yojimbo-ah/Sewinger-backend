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
    images : [{
        type : String ,
        required : false 
    }]
})

const MessageGroup = mongoose.model('MessageGroup' , messageGroupSchema) ;