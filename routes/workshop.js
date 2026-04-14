import express from "express" ;
import workshop from "../controllers/workshop.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const workshopRouter = express.Router() ;

// Admin routes (must come FIRST)
workshopRouter.get('/admin/pending', verifyJWT, verifyAdmin, workshop.getPendingWorkshops);
workshopRouter.patch('/admin/validate/:id', verifyJWT, verifyAdmin, workshop.validateWorkshop);

// Seller dashboard route
workshopRouter.get('/seller/my-workshops', verifyJWT, workshop.getSellerWorkshops);

// Public routes
workshopRouter.get('/', workshop.getWorkshops);
workshopRouter.get('/:id', workshop.getWorkshopDetail);

// Protected routes (user must be logged in)
workshopRouter.post('/', verifyJWT, workshop.createWorkshop);
workshopRouter.put('/:id', verifyJWT, workshop.updateWorkshop);
workshopRouter.delete('/:id', verifyJWT, workshop.deleteWorkshop);

// Application routes
workshopRouter.post('/:id/apply', verifyJWT, workshop.applyForWorkshop);
workshopRouter.patch('/:id/application/:appId', verifyJWT, workshop.respondToApplication);
workshopRouter.delete('/:id/enrollment', verifyJWT, workshop.cancelEnrollment);

export default workshopRouter ;
