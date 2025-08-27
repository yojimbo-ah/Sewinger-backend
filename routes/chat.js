import chat from "../controllers/chat.js";
import express from 'express' ;
import { verifyJWT } from "../middleware/verifyJWT.js";

const chatRouter = express.Router() ;


export default chatRouter ;


