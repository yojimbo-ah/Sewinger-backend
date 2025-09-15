import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";
import { upload } from "../middleware/upload.js";

const chatRouter = express.Router() ;

chatRouter.get('/private/:friendId' , verifyJWT , chat.getPrivateChat) ;
chatRouter.put('/message/private' , verifyJWT , chat.putMessagePrivateChat) ;
chatRouter.put('/message/public' , verifyJWT , upload.single('image') , chat.createGroupChat) ;
chatRouter.put('/message/public/add' , verifyJWT , chat.addPersonToGroup) ;
chatRouter.get('/public/:chatId' , verifyJWT , chat.getPublicGroupChat )
chatRouter.get('/public' , verifyJWT , chat.getUserGroups) ; 

export default chatRouter ;


