import User from "../models/User.js";
import UserWaitSellerConf from "../models/UserWaitSellerConf.js";
import validator from 'validator' ;
import jwt from 'jsonwebtoken'

const patchChangeName = async (req , res , next) => {
    const userId = req.user.id ;
    const firstName = req.body.name.firstName ;
    const lastName = req.body.name.lastName ;

    try {
        let errors = {
            firstName : undefined ,
            lastName : undefined
        }
        let status = false ;

        if (!validator.isLength(firstName , {max : 20 , min : 3})) {
            errors.firstName = 'It must be between 3 and 20 characters' ;
            status = true ;
        }

        if (!validator.isLength(lastName , {min : 3 , max : 20})) {
            errors.lastName = 'It must be between 3 and 20 characters' ;
            status = true ;
        }

        if (validator.isEmpty(firstName)) {
            errors.firstName = 'Cant leave the first name empty' ;
            status = true ;
        }

        if (validator.isEmpty(lastName)) {
            errors.lastName = 'Cant leave the last name empty' ;
            lastName = true ;
        }

        if (status) {
            return res.status(400).json({errors : errors})
        }
        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : 'There is no user with similair informations'}) ;
        }
        user.name.firstName = firstName ;
        user.name.lastName = lastName ;
        
        const request = await UserWaitSellerConf.findOne({userId : user._id}) ;

        // this is for the user sent a request for being a seller or not we need to check is since
        // is is coded in the json web token and decoded in the frontend (request is sent frin there again)
        // and you have to get it here since we have to reset the json web token , because it contains
        // the new coded user data that we have to check it again

        let reqt = false ;
        if (request) {
            reqt = true ;
        }
        await user.save() ;
        const token = jwt.sign({
            email : user.email ,
            userId : user._id.toString() ,
            firstName : user.name.firstName ,
            lastName : user.name.lastName ,
            power : user.power ,
            sentRequest : reqt
        }, process.env.BCRYPT_CODE ,{expiresIn : '15d'}) ;

        const userDoc = {
            id : user._id ,
            email : user.email ,
            firstName : user.name.firstName ,
            lastName : user.name.lastName ,
            power : user.power ,
            sentRequest : reqt
        }
        console.log(token) ;

        return res.status(200).json({message : 'Name has been modified succufully' , jwtToken : token , user : userDoc}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const putSocialMedias = async (req , res , next) => {
    // this controller is not working for now , since the schema is not compatible yet
    // it would be chnaged in the future
    // (but the logic is correct)
    const userId = req.user.id ;
    const {facebook , instagram , github} = req.body.socials ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        let errors = {
            instagram : undefined ,
            github : undefined ,
            facebook : undefined
        }

        let status = false ;
        if (!validator.isURL(instagram)) {
            errors.instagram = true ;
            status = true ;
        }
        if (!validator.isURL(github)) {
            errors.github = true ;
            status = true ;
        }
        if (validator.isURL(facebook)) {
            errors.facebook = true ;
            status = true ;
        }

        if (status) {
            return res.status(400).json({errors : errors}) ;
        }

        user.socials.instagram = instagram ;
        user.socials.github = github ;
        user.socials.facebook = facebook ;


        await user.save() ;
        return res.status(200).json({message : 'Socials has been edited'}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const putProfileImage = async (req , res , next) => {

}

const detailManagement = {patchChangeName , putProfileImage , putSocialMedias} ;

export default detailManagement ;