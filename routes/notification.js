import express from 'express' ;
import notification from '../controllers/notification.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const notificationRouter = express.Router() ;

notificationRouter.get('/' , verifyJWT , notification.getNotifications) ;
notificationRouter.get('/count' , verifyJWT , notification.getUnreadNotificationCount) ;
notificationRouter.get('/type/:type' , verifyJWT , notification.getNotificationsByType) ;

export default notificationRouter ;