import mongoose , {Types , Schema} from 'mongoose' ;

const userWaitConfirmSchema = new Schema({
    email : {
        type : String ,
        required : true
    } ,
    password : {
        type : String ,
        required : true
    } ,
    name : {
        firstName : {
            type : String ,
            required : true
        } ,
        lastName : {
            type : String ,
            required : true
        }
    } ,
    token : {
        type : String ,
        required : true
    } ,
    createdAt : {
        type : Date ,
        default : Date.now ,
        expires : 60 * 15
    }
})

const UserWaitConfirm = mongoose.model('UserWaitConfirm' , userWaitConfirmSchema) ;

export default UserWaitConfirm ;

