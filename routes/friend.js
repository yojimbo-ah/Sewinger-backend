import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js';
import friend from '../controllers/friendInvite.js';

const friendRouter = express.Router() ;

friendRouter.post('/create'  , friend.postFriendInvite) ;
friendRouter.put('/approve' , friend.approveFriendInvite)
friendRouter.delete('/delete' , friend.deleteFriend) ;

export default friendRouter ;
