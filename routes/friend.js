import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js';
import friend from '../controllers/friendInvite.js';

const friendRouter = express.Router() ;

friendRouter.post('/create'  , friend.postFriendInvite) ;
friendRouter.put('/approve' , friend.approveFriendInvite)
friendRouter.delete('/delete' , friend.deleteFriend) ;
friendRouter.delete('/delete/request' , friend.deleteFriendInvite) ; 
friendRouter.get('/requests/pending' , friend.getUserPendingFriends) ;
friendRouter.get('/requests' , friend.getUserFriendRequests) ;
friendRouter.get('/' , friend.getUserFriends) ;

export default friendRouter ;
