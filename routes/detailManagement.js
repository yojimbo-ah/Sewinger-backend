import express from 'express' ;
import detailManagement from '../controllers/detailManagement.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { upload } from '../middleware/upload.js';
import { cloudinaryErrorHandler } from '../controllers/errorHandlers.js';
const detailRouter = express.Router() ;

// manegemanet the details of the user meaning the name , socials , profile image ...etc

detailRouter.patch('/name' , verifyJWT , detailManagement.patchChangeName) ;
detailRouter.patch('/social' , verifyJWT , detailManagement.putSocialMedias) ;
detailRouter.patch('/image' , verifyJWT , upload.single('image') ,
    detailManagement.putProfileImage , cloudinaryErrorHandler ) ;
detailRouter.get('/profile/:profileId' , verifyJWT , detailManagement.getUserProfile) ;

export default detailRouter ;
