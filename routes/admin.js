import express from 'express' ;
import admin from '../controllers/admin.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const adminRouter = express.Router() ;

adminRouter.patch('/user/power/:userId' , verifyJWT , admin.adminPatchUserPower) ;
adminRouter.patch('/product/:productId' , verifyJWT , admin.adminPatchProductStatus) ;
adminRouter.get('/seller/request' , verifyJWT , admin.adminGetSellerRequests) ;
adminRouter.get('/product/request' , verifyJWT , admin.adminGetPendingProducts) ;




export default adminRouter ;