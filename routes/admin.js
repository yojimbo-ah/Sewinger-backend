import express from 'express' ;
import admin from '../controllers/admin.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const adminRouter = express.Router() ;

// Apply verifyAdmin middleware to all admin routes
// This ensures user is authenticated (verifyJWT) and is an admin
adminRouter.use(verifyJWT);
adminRouter.use(verifyAdmin);

// Stats and data endpoints
adminRouter.get('/stats' , admin.adminGetStats) ;
adminRouter.get('/users' , admin.adminGetUsers) ;
adminRouter.get('/products' , admin.adminGetProducts) ;

// Product and user management
adminRouter.patch('/user/power/:userId' , admin.adminPatchUserPower) ;
adminRouter.patch('/product/:productId' , admin.adminPatchProductStatus) ;
adminRouter.delete('/product/:productId' , admin.adminDeleteProduct) ;

// Requests
adminRouter.get('/seller/request' , admin.adminGetSellerRequests) ;
adminRouter.get('/product/request' , admin.adminGetPendingProducts) ;

export default adminRouter ;