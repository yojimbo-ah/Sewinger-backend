import dotenv from 'dotenv' ;
dotenv.config() ;

import { createTransport } from "nodemailer";


const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : process.env.EMAIL ,
        pass : process.env.EMAIL_PASSWORD
    } 
})

export default transporter ;