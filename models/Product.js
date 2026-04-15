import mongoose , {Types , Schema} from "mongoose";

// might add description later in the future

const productSchema = new Schema({
    name : {
        type : String ,
        required : true
    } ,
    description : {
        type : String ,
        required : true
    } ,
    reviews : [{
        comment : {
            type : String ,
            maxlength : 200 ,
            required : true
        } ,
        rating : {
            type : Number ,
            min : 1 ,
            max : 5 ,
            validate : {
                validator : Number.isInteger,
                message : 'Rating must be an integer'
            } ,
            required : true
        } , 
        commenterId : {
            type : Types.ObjectId ,
            required : true ,
            ref : 'User'
        } ,
        createdAt : {
            type : Date ,
            default : Date.now ,
            required : true
        } ,
        updatedAt : {
            type : Date ,
            default : Date.now
        }
    }] ,
    categories : [{
        type : String ,
        required : true 
    }] ,
    creatorId : {
        type : Types.ObjectId ,
        required : true ,
        ref : 'User'
    } ,
    price : {
        type : Number ,
        required : true
    } ,
    images : [{
        type : String ,
        required : true
    }] ,
    type : {
        type : String ,
        required : true
    } ,
    availbleItems : {
        type : Number ,
        required : true
    }  ,
    valid : {
        // this field is for if the product is validated by the admin or not
        type : Boolean ,
        required : true ,
        default : false
    } ,
    aiValidationStatus : {
        // AI filtering status for product quality checks (images, price, description)
        // pending: awaiting AI analysis
        // passed: AI approved product quality
        // flagged: AI detected potential issues (low quality images, price issues, suspicious description)
        type : String ,
        enum : ['pending', 'passed', 'flagged'] ,
        default : 'pending'
    } ,
    aiValidationReason : {
        // Detailed reason from AI validation
        type : String ,
        default : null
    } ,
    availble  : {
        type : Boolean ,
        requierd : true ,
        default : true
    } ,
    // this here is the overall rating of the product each person who buys product ,
    // can rate it out of 5 on star level 
    ratings : {
        count : {
            type : Number ,
            required : true ,
            default : 0
        } ,
        average : {
            type : Number ,
            required : true ,
            default : 0 ,
            min : 0 ,
            max : 5
        }
    }

} , {timestamps : true})


const Product = mongoose.model('Product' , productSchema);

export default Product ;