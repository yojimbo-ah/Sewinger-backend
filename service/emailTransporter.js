import dotenv from 'dotenv' ;
import { Resend } from 'resend';
import { createTransport } from "nodemailer";

dotenv.config() ;

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : process.env.EMAIL ,
        pass : process.env.EMAIL_PASSWORD
    } 
})

export {resend} ;
export default transporter ;