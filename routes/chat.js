import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";
import { upload } from "../middleware/upload.js";
import { uploadVideo } from "../middleware/uploadVideo.js";

const chatRouter = express.Router() ;

const IMAGE_COUNT = 10 ;
const VIDEO_COUNT = 3 ;

chatRouter.get('/private/:friendId' , verifyJWT , chat.getPrivateChat) ;
chatRouter.put('/message/public' , verifyJWT , upload.single('image') , chat.createGroupChat) ;
chatRouter.put('/message/public/add' , verifyJWT , chat.addPersonToGroup) ;
chatRouter.get('/public/:chatId' , verifyJWT , chat.getPublicGroupChat )
chatRouter.get('/public' , verifyJWT , chat.getUserGroups) ; 
chatRouter.patch('/public' , verifyJWT , upload.single('image') , chat.patchGroupDetails ) ;

// handle the images uploading in both the public and private chats :
chatRouter.post('/images/public' , verifyJWT , upload.array('images' , IMAGE_COUNT) , chat.uploadImagesPublic) ;
chatRouter.post('/images/private' , verifyJWT , upload.array('images' , IMAGE_COUNT) , chat.uploadImagePrivate) ;

// handles the videos uploading both in the private and public chats 
// (with respond returned with sockets , the rhttp respond that send 
// to the video sender is just )
chatRouter.post('/videos/public' , verifyJWT , uploadVideo.array('videos' , VIDEO_COUNT) , chat.uploadVideosPublic) ;
chatRouter.post('/videos/private' , verifyJWT , uploadVideo.array('videos' , VIDEO_COUNT) , chat.uploadVideosPrivate) ;

export default chatRouter ;


