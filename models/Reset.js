import mongoose , {Types , Schema} from 'mongoose' ;

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


