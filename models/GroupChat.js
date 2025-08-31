import mongoose , {Schema , Types} from "mongoose";

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
        }
    }
} , {timestamps : true})


const GroupChat = mongoose.model('GroupChat' , groupChatSchema) ;
export default GroupChat ;