import express from "express";
import account from "../controllers/account.js";

const accountRouter = express.Router() ;

accountRouter.post('/login' , account.login);
accountRouter.post('/signup' , account.signup);
accountRouter.put('/signup/:token' , account.SignupVer);
accountRouter.post('/forgot' , account.resetAccount);
accountRouter.patch('/forgot/:token' , account.resetAccountVer);
accountRouter.post('/jwtVer' , account.confirmJwt);


export default accountRouter ;