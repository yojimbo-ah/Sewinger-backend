import dotenv from 'dotenv' ;
import { createTransport } from "nodemailer";

dotenv.config() ;

// i just use this transporter for testing purpuses ;
const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : process.env.EMAIL ,
        pass : process.env.EMAIL_PASSWORD
    } 
})

export default transporter ;