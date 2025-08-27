import mongoose , {Types , Schema} from "mongoose";

const productSchema = new Schema({
    name : {
        type : String ,
        required : true
    } ,
    description : {
        type : String ,
        required : true
    } ,
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