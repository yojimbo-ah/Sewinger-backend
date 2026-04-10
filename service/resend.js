import { Resend } from "resend";
import dotenv from "dotenv" ;

dotenv.config()
// resend is api that makes sending emails easy you just do the setup wtih your domain
// in there website then you will get your api key to use it
const resend = new Resend(process.env.RESEND_API_KEY) ;

export default resend ;