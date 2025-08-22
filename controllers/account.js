import User from '../models/User.js';
import UserWaitConfirm from '../models/UserWaitConfirm.js';
import { Reset } from '../models/Reset.js' ;
import validator from 'validator'
import bcrypt from 'bcrypt'
import {createTransport} from 'nodemailer'
import jwt from 'jsonwebtoken'
import crypto from 'crypto' ;

const transporter = createTransport({
    service : 'gmail' ,
    auth : {
        user : 'abbad.ahmed.gg@gmail.com' ,
        pass : 'kzfstadzrocduaar'
    } 
})


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
        const {email , userId , lastName , firstName , power} = decoded ;
        const data = {
            email ,
            id : userId ,
            name : {
                lastName ,
                firstName
            } ,
            power : power
        }
        return res.status(200).json({user : data , valid : true}) ;

    })
}


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
            from : 'Sewinger team <abbad.ahmed.gg@gmail.com>' ,
            to : user.email ,
            subject : 'password reseting' ,
            html : `<p> reset the password
            <a href="http://localhost:5173/account/forgot/${randomString}">click</a>
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
        const hashedPassword = user.password ;
        const result = await bcrypt.compare(password , hashedPassword) ;
        if (result) {
            const token = jwt.sign({
                email : email ,
                userId : user._id.toString() ,
                firstName : user.name.firstName ,
                lastName : user.name.lastName ,
                power : user.power
            }, 'topsecretcode' ,{expiresIn : '15d'}) ;

            transporter.sendMail({
                from : 'Sewinger team <abbad.ahmed.gg@gmail.com>' ,
                to : email ,
                subject : 'Account login' ,
                html : '<p>Youre account has been logged in , verify if it was you </p>'
            })            

            return res.status(200).json({message : 'Connected successfuly' , token : token , user : {
                email : user.email ,
                id : user._id ,
                firstName : user.name.firstName ,
                lastName : user.name.lastName
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
        await transporter.sendMail({
            from : 'Sewinger team <abbad.ahmed.gg@gmail.com>' ,
            to : email ,
            subject : 'account creation' ,
            html : `<p><b>confirm your account creation : <a href="http://localhost:5173/account/signup/${token}">confirm</a></b></p>`
        })

        return res.status(200).json({message : 'Account has been created'})
    } catch (error) {
        return res.status(500).json({message : 'Server error'}) ;
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
            const user  = new User({
                email : awaitingAccount.email ,
                name : {
                    firstName : awaitingAccount.name.firstName ,
                    lastName : awaitingAccount.name.lastName
                } ,
                password : awaitingAccount.password ,
                
            })
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
const account = {login , signup , resetAccount , resetAccountVer , SignupVer , confirmJwt} ;

export default account ;