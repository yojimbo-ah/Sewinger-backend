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
import cloudinary from '../cloudinary.js';
import transporter from '../service/emailTransporter.js';
import extractPublicId from '../helperFunctions/cloudinaryImageId.js';
import streamifier from 'streamifier' ;
import { validateSellerRequest } from '../google-generative-ai.js';

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
    const email = req.body.email ||  '' ;
    const password = req.body.password || '' ;

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

            console.log(response) ;
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

        // creating the notification first since i need the Id :
        const notification = new Notification({
            notifications : []
        }) ;

        const hashedPassword = await bcrypt.hash(password , 12);
        const token = crypto.randomBytes(20).toString("hex");
        // const user  = new User({
        //         email : email ,
        //         name : {
        //             firstName : firstName ,
        //             lastName : lastName
        //         } ,
        //         password : hashedPassword ,
        //         notification : notification._id
        //     }) ;

        const user = new UserWaitConfirm({
            name : {
                firstName : firstName ,
                lastName : lastName
            } ,
            email : email ,
            password : hashedPassword ,
            token : token
        })

        await user.save() ;
        // this email sending here works only on my private email ,
        // will be fixed in the future 
        // will be fixed by the change of the email domain 
        // for now it is not ready even tho the site is hosted 

        /*
        const response = await resend.emails.send({
            from : `Sewinger team <onboarding@resend.dev>` ,
            to : user.email.toString() ,
            subject: 'Hello from Resend!',
            html: `<p><b>confirm your account creation : <a href="${process.env.FRONTEND_URL}/account/signup/${token}">confirm</a></b></p>`
        }) ;
        console.log(response) ;
        if (response.data) {
            console.log(`response ID : ${response.data.id}`) ;
        }   
        console.log("email has been sent") ;
         */


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
    // status here it supposed to be a boolen if it true then the user want to create the account
    // else he doesnt 
    // we check the token if we have a a awaiting account with simailair token in the database
    // if not then we passed the allowed time to create an account after sending the singup form
    // else you account is created normally
    
    const status = !!req.body.status ;
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
    //this will put such that the user can add a folder
    // that contains pictures , vids , pdfs and stuff like that 
    // the admins can download that folder and rectify it 
    // to check if they let the user augmenet from being a clien -> seller 
    // in the shop

    // the description would the describe the files the user attached
    // when sending the request to be a seller
    const userId = req.user.id ;
    const description  = req.body.description ;
    const files = req.files ;
    // we will use this array as memory storage in case of failure so we can delete
    // what we saved into cloudinary servers
    const uploadedData = [] ;
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
        // handeling the files , req.files will the contain the iles
        // since we user memorystorage in the multer setup 
        // se we have to handle the uploading to the cloud in the route
        // beacause i think that gaves us more freedom and let us reuse 
        // the multer setup if we need it else where
        if (files.length === 0) {
            return res.status(400).json({message : 'You didnt attatch any file to the seller request'}) ;
        }

        const promiseArray = req.files.map(async(file) => {
            // Extract filename and extension to preserve them properly
            const filenameParts = file.originalname.lastIndexOf('.')
            const nameWithoutExt = filenameParts > 0 ? file.originalname.substring(0, filenameParts) : file.originalname
            const extension = filenameParts > 0 ? file.originalname.substring(filenameParts + 1) : ''
            
            const response = await new Promise ((resolve , reject) => {
                const stream = cloudinary.uploader.upload_stream({
                        resource_type : file.mimetype.startsWith('image/') ? 'image' : 'raw' ,
                        folder : `seller_requests/seller_${user._id.toString()}` ,
                        // Use public_id with original filename to preserve it
                        public_id : extension ? `${nameWithoutExt}.${extension}` : nameWithoutExt ,
                        // Keep these for safety but explicit public_id takes precedence
                        use_filename : true , 
                        unique_filename : false ,
                        // Force the file to keep extension and be downloadable with correct format
                        force_version : false
                    } ,
                    (error , result) => {
                        if (error) reject(error) ;
                        if (result) resolve(result)
                    }
                ) ;
                streamifier.createReadStream(file.buffer).pipe(stream) ;
            }) ;
            
            const fileObj = {
                url : response.secure_url ,
                type : file.mimetype.startsWith('image/') ? 'image' : 'raw' ,
                originalName : file.originalname
            }
            uploadedData.push(fileObj) ;
            return fileObj ;
        })

        const handlledFilesArray = await Promise.all(promiseArray) || [] ;
        
        // Create the request with pending validation status
        const pendingRequest = new UserWaitSellerConf({
            description : description ,
            userId : userId ,
            files : handlledFilesArray ,
            validationStatus : 'validating'
        })
        await pendingRequest.save() ;
        
        // Run AI validation asynchronously (don't wait for it to complete)
        // This way the response is sent quickly to the user
        (async () => {
            try {
                const aiResult = await validateSellerRequest(description, handlledFilesArray);
                
                // Update the request status based on AI result
                const statusUpdate = aiResult.valid ? 'manual_review' : 'not_compatible';
                
                await UserWaitSellerConf.findByIdAndUpdate(
                    pendingRequest._id,
                    {
                        validationStatus : statusUpdate,
                        aiValidationReason : aiResult.reason
                    }
                );
                
                console.log(`AI Validation completed for request ${pendingRequest._id}: ${statusUpdate} - ${aiResult.reason}`);
            } catch (error) {
                console.error(`AI Validation error for request ${pendingRequest._id}:`, error);
                // If AI fails, mark as manual review to be safe
                await UserWaitSellerConf.findByIdAndUpdate(
                    pendingRequest._id,
                    {
                        validationStatus : 'manual_review',
                        aiValidationReason : 'AI validation encountered an error - requires manual review'
                    }
                );
            }
        })();
        
        return res.status(200).json({message : 'request has been sent succussfully'})

    } catch (error) {
        // in case of error we must destroy the files 
        // in case they were saved 
        if (uploadedData.length > 0) {
            // then we uploaded files but we didnt get to save the refrences in the database
            const result = uploadedData.map(async(file) => {
                const publicId = extractPublicId(file.url) ;
                await cloudinary.uploader.destroy(`seller_requests/seller_${req.user.id}/${publicId}`)
            })
            await Promise.all(result) ;
        }
        console.log(error)
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const getWallet = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with same informations'}) ;
        }

        const currentBalance = Number((user.wallet?.balance ?? 0).toFixed(2)) ;
        if (!user.wallet || typeof user.wallet.balance !== 'number') {
            user.wallet = {balance : currentBalance} ;
            await user.save() ;
        }

        return res.status(200).json({wallet : {balance : currentBalance}}) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const addFakeMoneyToWallet = async (req , res , next) => {
    const userId = req.user.id ;
    const amount = Number(req.body.amount) ;

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({message : 'Invalid amount , amount should be greater than 0'}) ;
    }

    if (amount > 10000) {
        return res.status(400).json({message : 'Amount too large for a single top up'}) ;
    }

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with same informations'}) ;
        }

        const currentBalance = Number((user.wallet?.balance ?? 0).toFixed(2)) ;
        if (!user.wallet || typeof user.wallet.balance !== 'number') {
            user.wallet = {balance : currentBalance} ;
        }

        user.wallet.balance += amount ;
        user.wallet.balance = Number(user.wallet.balance.toFixed(2)) ;
        await user.save() ;

        return res.status(200).json({
            message : 'Fake money added to wallet',
            wallet : {balance : user.wallet.balance}
        }) ;
    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const account = {login , signup , resetAccount , resetAccountVer , SignupVer , confirmJwt , putUserWaitSellerRequest , getWallet , addFakeMoneyToWallet} ;

export default account ;
