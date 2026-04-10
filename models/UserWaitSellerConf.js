import mongoose , {Schema , Types} from "mongoose";

// Schema for users that send a request for being a seller and awaits admin verification

// this is the file schema being used to save the files we have either image or
// raw (word documents , pdfs , odt , ...etc)
const fileSchema = new Schema ({
    url : {
        type : String ,
        required : true
    } ,
    type : {
        type : String ,
        enum : ['image' , 'raw'] ,
        required : true
    } ,
    originalName : {
        type : String ,
        required : true
    }
} , {_id : false})

// userWaitSellerConf is the scehma used to save the request beign sent by client 
// if he want to be a seller on the website 
// so he will pass two checks ai check if he got rejected or failed to check
// (error in the ai api i used , gemini flash) then he will be redirected for manual
// check might change it tho if it doesnt work well 

////////////////////////
// might get chenged //
//////////////////////
const userWaitSellerConf = new Schema ({
    userId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    description : {
        type : String ,
        required : true
    } ,
    files : {
        type : [fileSchema] ,
        required : true ,
        default : [] 
    } ,
    validationStatus : {
        type : String ,
        enum : ['pending', 'validating', 'not_compatible', 'manual_review', 'approved', 'rejected'] ,
        default : 'pending'
    } ,
    aiValidationReason : {
        type : String ,
        default : null
    }
} , {timestamps : true})

const UserWaitSellerConf = mongoose.model('UserWaitSellerConf' , userWaitSellerConf) ;
export default UserWaitSellerConf ;