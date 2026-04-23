import express from "express";
import account from "../controllers/account.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { uploadMixed } from "../middleware/uploadMixed.js";
import { authLimiter, uploadLimiter } from "../middleware/rateLimiters.js";
const MAX_UPLOAD = 10 ;
const accountRouter = express.Router() ;

// this is the account managements routes and verification of json wev tokens

accountRouter.post('/login' , authLimiter , account.login);
accountRouter.post('/signup' , authLimiter , account.signup);
accountRouter.put('/signup/:token' , account.SignupVer);
accountRouter.post('/forgot' , authLimiter , account.resetAccount);
accountRouter.patch('/forgot/:token' , account.resetAccountVer);
accountRouter.post('/jwtVer' , account.confirmJwt);
accountRouter.put('/request/seller' , verifyJWT , uploadLimiter , uploadMixed.array('files' , MAX_UPLOAD) , account.putUserWaitSellerRequest)
accountRouter.get('/wallet' , verifyJWT , account.getWallet) ;
accountRouter.put('/wallet/add' , verifyJWT , account.addFakeMoneyToWallet) ;


export default accountRouter ;