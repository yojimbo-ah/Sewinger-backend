import { createTransport } from "nodemailer";

const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : 'abbad.ahmed.gg@gmail.com' ,
        pass : 'kzfstadzrocduaar'
    } 
})

export default transporter ;