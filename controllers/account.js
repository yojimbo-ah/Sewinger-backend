import User from '../models/User.js';
import UserWaitConfirm from '../models/UserWaitConfirm.js';
import UserWaitSellerConf from '../models/UserWaitSellerConf.js';
import Notification from '../models/Notification.js';
import { Reset } from '../models/Reset.js' ;
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto' ;
import { resend } from '../service/emailTransporter.js';

import transporter from '../service/emailTransporter.js';

const confirmJwt = async (req , res , next) => {
    const authHeader = req.headers.authorization ;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({message : 'invalid jwt format'}) ;
    }
    const jwtToken = authHeader.split(' ')[1] ;
    jwt.verify(jwtToken , 'topsecretcode' , (err , decoded) => {
        if (err) {
            return res.status(400).json({message : 'invalid token' , valid : false}) ;
        }
        const {email , userId , lastName , firstName , power , sentRequest , profileImage} = decoded ;
        console.log('this is the ver confirm jwt') ;
        console.log(decoded) ;
        const data = {
            email ,
            id : userId ,
            name : {
                lastName ,
                firstName
            } ,
            profileImage : profileImage ,
            power : power ,
            sentRequest : sentRequest
        }
        return res.status(200).json({user : data , valid : true}) ;

    })
} ;

const resetAccountVer = async (req , res , next) => {
    const token = req.params.token ;
    const password = req.body.password.trim() ;
    const confirmPassword = req.body.confirmPassword.trim() ;
    
    let errors = {
        password : undefined ,
        confirmPassword : undefined ,
        token : undefined
    }

    let status = false ;

    if (validator.isEmpty(password)) {
        errors.password = 'cant leave the password fiedl empty' ;
        status = true
    }
    if (!validator.isLength(password , {min : 6 , max : 20})) {
        errors.password = 'password must be between 6 and 20 characters' ;
        status = true ;
    }
    if (password !== confirmPassword) {
        errors.confirmPassword = 'confirmation password doesnt match the password' ;
        status = true ;
    }
    try {
        const reset = await Reset.findOne({token : token}) ;
        if (!reset) {
            errors.token = 'Invalid token' ;
            status = true ;
        }

        if (status) {
            console.log(errors);
            return res.status(400).json({errors : errors}) ;
        }
        const userEmail = reset.email ;
        const user = await User.findOne({email : userEmail}) ;
        const hashedPassword = await bcrypt.hash(password , 12) ;
        user.password = hashedPassword ;
        await user.save() ;
        await reset.deleteOne() ;
        return res.status(200).json({message : 'password has been reseted'})
    } catch (error) {
        return res.status(500).json({error : 'server error'})
    }


}

const resetAccount = async (req , res , next) => {
    const email = req.body.email ;

    if (validator.isEmpty(email)) {
        return res.status(400).json({email : 'Cant leave the email field empty'}) ;
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({email : 'Invalid email format'})
    }
    const user = await User.findOne({email : email}) ;
    if (!user) {
        return res.status(400).json({email : 'there is no user with similair email'}) ;
    }
    const randomString = crypto.randomBytes(16).toString("hex");
    const newToken = new Reset({
        token : randomString ,
        email : user.email
    })
    try {
        await newToken.save() ;
        transporter.sendMail({
            from : `Sewinger team <${process.env.EMAIL}>` ,
            to : user.email ,
            subject : 'password reseting' ,
            html : `<p> reset the password
            <a href="${process.env.FRONTEND_URL}/account/forgot/${randomString}">click</a>
            </p>`
        })
        return res.status(200).json({message : 'reset token has been created'}) ; 
    } catch (error) {
        return res.status(500).json({error : 'server error'}) ;
    }
    

}

const login = async (req , res , next) => {
    const email = req.body.email ;
    const password = req.body.password ;

    let errors = {
        email : undefined ,
        password : undefined
    }
    let status = false ;
    if (validator.isEmpty(email)) {
        errors.email = 'cant leave the email field empty' ;
        status = true
    }
    if (validator.isEmpty(password)) {
        errors.password = 'cant leave the password fiedl empty' ;
        status = true
    }
    if (!validator.isLength(password , {min : 6 , max : 20})) {
        errors.password = 'password must be between 6 and 20 characters' ;
        status = true ;
    }
    if(!validator.isEmail(email)) {
        errors.email = 'invalid email format' ;
        status = true ;
    }
    if (status) {
        return res.status(400).json({errors : errors})
    }
    try {
        const user = await User.findOne({email : email}) ;
        if (!user) {
            errors.email = 'cant find a user with the same email' ;
            return res.status(400).json({errors : errors}) ;
        } 

        // the request variable here is to check if the user has sent a a request to admins 
        // to be a seller on the site and i coded it on the json web token and it get decoded and
        // saved in the frontend (it has it own controller function that decodod it )
        
        const request = await UserWaitSellerConf.findOne({userId : user._id}) ;
        let reqt = false ;
        if (request) {
            reqt = true ;
        }
        console.log(user._doc) ;
        const hashedPassword = user.password ;
        const result = await bcrypt.compare(password , hashedPassword) ;

        if (result) {
            const token = jwt.sign({
                email : email ,
                userId : user._id.toString() ,
                firstName : user.name.firstName ,
                lastName : user.name.lastName ,
                profileImage : user.bio.profileImage ,
                power : user.power ,
                sentRequest : reqt
            }, process.env.BCRYPT_CODE ,{expiresIn : '15d'}) ;

            const response = await resend.emails.send({
                from : `Sewinger team <onboarding@resend.dev>` ,
                to : user.email ,
                subject: 'Hello from Resend!',
                html: '<p>This is your first email sent with Resend!</p>'
            }) ;

            if (response.data) {
                console.log(`response ID : ${response.data.id}`) ;
            }

            console.log('email has been sent') ;

            return res.status(200).json({message : 'Connected successfuly' , token : token , user : {
                email : user.email ,
                id : user._id ,
                firstName : user.name.firstName ,
                lastName : user.name.lastName ,
                profileImage : user.bio.profileImage
            }});
        } 

        errors.password = 'invalid password' ;
        res.status(400).json({errors : errors}) ;

    } catch (error) {
        res.status(500).json({error : 'eternal server error'})
    }
}

const signup = async (req , res , next) => {
    const email = req.body.email ;
    const password = req.body.password ;
    const name = req.body.name ;
    const firstName = name.firstName ;
    const lastName = name.lastName
    const confirmPassword = req.body.confirmPassword ;
    let errors = {
        password : undefined ,
        confirmPassword : undefined ,
        firstName : undefined ,
        lastName : undefined ,
        email : undefined ,
    }
    let status = false ;
    if (validator.isEmpty(email)) {
        errors.email = 'cant leave the email empty' ;
        status = true ;
    }
    if (validator.isEmpty(confirmPassword)) {
        errors.confirmPassword = 'cant leave the confirmation password empty' ;
        status = true ;
    }
    if (validator.isEmpty(name.lastName)) {
        errors.lastName = 'cant leave the last name empty' ;
        status = true
    }
    if (validator.isEmpty(name.firstName)) {
        errors.firstName = 'cant leave the first name empty' ;
        status = true
    }
    if (validator.isEmpty(password)) {
        errors.password = 'cant leave the password empty' ;
        status = true
    }
    if (!validator.isLength(password , {min : 6 , max : 20})) {
        errors.password = 'between 6 and 20 characters' ;
        status = true ;
    }
    if (password.trim() !== confirmPassword) {
        errors.confirmPassword = 'confirmation password doesnt match the password' ;
        status = true ;
    }
    if (!validator.isEmail(email)) {
        errors.email = 'invalid email' ;
        status = true ;
    }
    if (!validator.isLength(name.firstName , {min : 3 , max : 20})) {
        errors.firstName = 'first name between 3 and 20 characters' ;
        status = false ;
    }
    if (!validator.isLength(name.lastName , {min : 3 , max : 20}) ) {
        errors.lastName = 'last name between 3 and 20 characters' ;
        status = true ;
    }
    if (status) {
        return res.status(400).json({errors : errors});
    }

    try {
        const exists = await User.findOne({email : email}) ;
        if (exists) {
            errors.email = 'email already exists' ;
            return res.status(409).json({errors : errors});
        }

        const hashedPassword = await bcrypt.hash(password , 12);
        const token = crypto.randomBytes(20).toString("hex");
        const user = new UserWaitConfirm({
            name : {
                firstName : firstName ,
                lastName : lastName
            } ,
            email : email ,
            password : hashedPassword ,
            token : token
        })

        await user.save()
        const response = await resend.emails.send({
            from : `Sewinger team <onboarding@resend.dev>` ,
            to : user.email ,
            subject: 'Hello from Resend!',
            html: '<p>This is your first email sent with Resend!</p>'
        }) ;

        if (response.data) {
            console.log(`response ID : ${response.data.id}`) ;
        }   


        
        console.log("email has been sent") ;
        return res.status(200).json({message : 'Account has been created'})
    } catch (error) {
        console.log('inside the error block') ;
        console.log(error.message) ;
        console.log(error) ;
        console.log('inside the error block') ;
        console.log(error.message) ;
        console.log(error) ;
        return res.status(500).json({error}) ;
    }

}

const SignupVer = async (req , res , next) => {
    const status = req.body.status ;
    const token = req.params.token
    try {
        const awaitingAccount = await UserWaitConfirm.findOne({token : token}) ;
        console.log(awaitingAccount)
        if (!awaitingAccount) {
            return res.status(400).json({message : 'invalid token , couldnt verify account'}) ;
        }
        if (status) {
            const notification = new Notification({
                notifications : []
            }) 

            const user  = new User({
                email : awaitingAccount.email ,
                name : {
                    firstName : awaitingAccount.name.firstName ,
                    lastName : awaitingAccount.name.lastName
                } ,
                password : awaitingAccount.password ,
                notification : notification._id
            }) ;

            await notification.save() ;
            await user.save() ;
            await awaitingAccount.deleteOne() ;
            return res.status(200).json({messgae : 'Account created , welcome to Sewinger'}) ;
        } else {
            await awaitingAccount.deleteOne()
            return res.status(200).json({message : 'Removed account'})
        }
    } catch (error) {
        return res.status(500).json({message : 'Eternal server error'})
    }
}

const putUserWaitSellerRequest = async (req , res , next) => {
    const userId = req.user.id ;
    
    const description  = req.body.description ;

    try {

        if (!validator.isLength(description , {min : 50 , max : 500})) {
            return res.status(400).json({message : 'error happened' , error : {
                description : 'the length must be between 50 and 500 characters'
            }})
        }

        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with same informations'}) ;
        }
        const request = await UserWaitSellerConf.findOne({userId : userId}) ;

        if (request) {
            return res.status(400).json({message : 'You already have a request , it still pending for admin confimation'}) ;
        }

        const pendingRequest = new UserWaitSellerConf({
            description : description ,
            userId : userId
        })

        await user.save() ;
        await pendingRequest.save() ;
        return res.status(200).json({message : 'request has been sent succussfully'})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const account = {login , signup , resetAccount , resetAccountVer , SignupVer , confirmJwt , putUserWaitSellerRequest} ;

export default account ;
