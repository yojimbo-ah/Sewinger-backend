import express from "express";
import account from "../controllers/account.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const accountRouter = express.Router() ;

// this is the account managements routes and verification of json wev tokens

accountRouter.post('/login' , account.login);
accountRouter.post('/signup' , account.signup);
accountRouter.put('/signup/:token' , account.SignupVer);
accountRouter.post('/forgot' , account.resetAccount);
accountRouter.patch('/forgot/:token' , account.resetAccountVer);
accountRouter.post('/jwtVer' , account.confirmJwt);
accountRouter.put('/request/seller' , verifyJWT , account.putUserWaitSellerRequest)


export default accountRouter ;