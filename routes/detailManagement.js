import express from 'express' ;
import detailManagement from '../controllers/detailManagement.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const detailRouter = express.Router() ;

// manegemanet the details of the user meaning the name , socials , profile image ...etc

detailRouter.patch('/name' , verifyJWT , detailManagement.patchChangeName) ;
detailRouter.patch('/social' , verifyJWT , detailManagement.putSocialMedias) ;
detailRouter.patch('/image' , verifyJWT , detailManagement.putProfileImage) ;

export default detailRouter ;
