import {v2 as cloudinary} from 'cloudinary' ;
import dotenv from 'dotenv' ;

// we use this file so we dont have llop imports between files
// so we import cloudinary package from this file to other 
// files of we need it to upload something to the cloud

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