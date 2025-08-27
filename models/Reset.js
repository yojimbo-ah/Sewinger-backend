import mongoose , {Types , Schema} from 'mongoose' ;

// the rest Schema when user want to reset his password a token is created to access the route 
// for reseting the password

const resetSchema = new Schema({
    token : {
        type : String ,
        required : true
    } ,
    email : {
        type : String ,
        required : true
    } ,
    createdAt : {
        type : Date ,
        default : Date.now ,
        expires : 60 * 15
    }
})

export const Reset = mongoose.model('Reset' , resetSchema) ;


