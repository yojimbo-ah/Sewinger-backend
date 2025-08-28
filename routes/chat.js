import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";

const chatRouter = express.Router() ;

chatRouter.get('/private' , chat.getPrivateChat) ;
chatRouter.put('/message/private' , chat.putMessagePrivateChat) ;
chatRouter.put('/message/public' , chat.createGroupChat) ;
chatRouter.put('/message/public/add' , chat.addPersonToGroup) ;


export default chatRouter ;


