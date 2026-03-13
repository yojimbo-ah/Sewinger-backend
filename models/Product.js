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
            length : 200 ,
            requierd : true
        } ,
        rating : {
            type : Number ,
            min : 0 ,
            max : 5 ,
            validator : {
                validator : Number.isInteger
            } ,
            required : true
        } , 
        commenterId : {
            type : Types.ObjectId ,
            required : true ,
            ref : 'User'
        } ,
        addedAt : {
            type : Date ,
            default : Date.now ,
            required : true
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