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
    comments : [{
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
    }

} , {timestamps : true})


const Product = mongoose.model('Product' , productSchema);

export default Product ;