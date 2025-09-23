import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";
import { upload } from "../middleware/upload.js";

const chatRouter = express.Router() ;

const IMAGE_COUNT = 10 ;

chatRouter.get('/private/:friendId' , verifyJWT , chat.getPrivateChat) ;
chatRouter.put('/message/public' , verifyJWT , upload.single('image') , chat.createGroupChat) ;
chatRouter.put('/message/public/add' , verifyJWT , chat.addPersonToGroup) ;
chatRouter.get('/public/:chatId' , verifyJWT , chat.getPublicGroupChat )
chatRouter.get('/public' , verifyJWT , chat.getUserGroups) ; 
chatRouter.patch('/public' , verifyJWT , upload.single('image') , chat.patchGroupDetails ) ;

chatRouter.post('/images/public' , verifyJWT , upload.array('images' , IMAGE_COUNT) ,chat.uploadImagesPublic) ;
chatRouter.post('/images/private' , verifyJWT , upload.array('images' , IMAGE_COUNT) , chat.uploadImagePrivate) ;

export default chatRouter ;


