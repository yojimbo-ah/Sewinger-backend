import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js';
import friend from '../controllers/friendInvite.js';

const friendRouter = express.Router() ;

friendRouter.post('/create'  , verifyJWT , friend.postFriendInvite) ;
friendRouter.put('/approve' , verifyJWT , friend.approveFriendInvite) ;
friendRouter.delete('/delete' , verifyJWT , friend.deleteFriend) ;
friendRouter.delete('/delete/request' , verifyJWT , friend.deleteFriendInvite) ; 
friendRouter.get('/requests/pending' , verifyJWT , friend.getUserPendingFriends) ;
friendRouter.get('/requests' , verifyJWT , friend.getUserFriendRequests) ;
friendRouter.get('/' , verifyJWT , friend.getUserFriends) ;

export default friendRouter ;
