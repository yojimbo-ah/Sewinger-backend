import mongoose , {Schema , Types} from 'mongoose' ;

/////////////////////////////////////////////////////////
// started workin on the notifications , might change //
//////         in the future (probably)       /////////
//////////////////////////////////////////////////////
const notificationModel = new Schema({
    notifications : [{
        message : {
            type : String ,
            required : true 
        } ,
        type : {
            required : true ,
            type : String ,
            enum : ['chat_private' , 'chat_public' , 'friend_request' , 'accepted_request']
        } ,
        read : {
            type : Boolean ,
            required : true ,
            default : false
        } ,
        createdAt : {
            type : Date ,
            default : Date.now ,
            required : true
        }
    }]
})

const Notification = mongoose.model('Notification' , notificationModel) ;

export default Notification ;