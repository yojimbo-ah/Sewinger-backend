import express from 'express' ;
import notification from '../controllers/notification.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const notificationRouter = express.Router() ;

notificationRouter.get('/' , verifyJWT , notification.getNotifications) ;

export default notificationRouter ;