import mongoose , {Types , Schema} from 'mongoose' ;

// the rest Schema when user want to reset his password a token is created to access the route 
// for reseting the password , this is reseting structure for the password as you can 
// i made it in structure alone since if i directly implemented it in the user structure
// it might cause a lot of waiting when trying to fetch the with the token as param
// but since it is a seperate structure it would be less time consuming when trying 
// to search

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


