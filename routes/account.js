import express from "express";
import account from "../controllers/account.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { uploadMixed } from "../middleware/uploadMixed.js";
const MAX_UPLOAD = 10 ;
const accountRouter = express.Router() ;

// this is the account managements routes and verification of json wev tokens

accountRouter.post('/login' , account.login);
accountRouter.post('/signup' , account.signup);
accountRouter.put('/signup/:token' , account.SignupVer);
accountRouter.post('/forgot' , account.resetAccount);
accountRouter.patch('/forgot/:token' , account.resetAccountVer);
accountRouter.post('/jwtVer' , account.confirmJwt);
accountRouter.put('/request/seller' , verifyJWT , uploadMixed.array('files' , MAX_UPLOAD) , account.putUserWaitSellerRequest)
accountRouter.get('/wallet' , verifyJWT , account.getWallet) ;
accountRouter.put('/wallet/add' , verifyJWT , account.addFakeMoneyToWallet) ;


export default accountRouter ;