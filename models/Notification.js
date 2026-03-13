import mongoose , {Schema , Types} from 'mongoose' ;

/////////////////////////////////////////////////////////
// started workin on the notifications , might change //
//////         in the future (probably)       /////////
//////////////////////////////////////////////////////

// after searching , the notifications of the chat app wouldnt be saved here since it is overkill ,
// it would be for admin validations , orders , users when they buy your products , 
// but for chats it will be hanedeled only in the frontend as push notifications in the react app 
// else then that it still might change in the future 



const notificationModel = new Schema({
    notifications : [{
        message : {
            type : String ,
            required : true 
        } ,
        type : {
            required : true ,
            type : String ,
            enum : ['friend_request' , 'accepted_request']
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