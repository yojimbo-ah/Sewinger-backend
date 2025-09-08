import express from 'express' ;
import detailManagement from '../controllers/detailManagement.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const detailRouter = express.Router() ;

detailRouter.patch('/name' , verifyJWT , detailManagement.patchChangeName) ;

export default detailRouter ;
