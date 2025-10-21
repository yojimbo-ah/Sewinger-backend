import {v2 as cloudinary} from 'cloudinary' ;
import dotenv from 'dotenv' ;

dotenv.config() ;

// access to the cloud storage (just for the images for now
// could be for more in the furute)
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME ,
    api_key : process.env.CLOUDINARY_API_KEY ,
    api_secret : process.env.CLOUDINARY_API_SECRET ,
    secure : true
})

export default cloudinary ;