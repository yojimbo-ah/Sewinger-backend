import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";

const chatRouter = express.Router() ;

chatRouter.get('/private/:friendId' , verifyJWT , chat.getPrivateChat) ;
chatRouter.put('/message/private' , verifyJWT , chat.putMessagePrivateChat) ;
chatRouter.put('/message/public' , verifyJWT , chat.createGroupChat) ;
chatRouter.put('/message/public/add' , verifyJWT , chat.addPersonToGroup) ;


export default chatRouter ;


