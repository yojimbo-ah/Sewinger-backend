import User from "../models/User.js";
import UserWaitSellerConf from "../models/UserWaitSellerConf.js";
import validator from 'validator' ;
import jwt from 'jsonwebtoken'

import cloudinary from "../cloudinary.js";
import extractPublicId from "../helperFunctions/cloudinaryImageId.js";

import Product from "../models/Product.js";


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
            profileImage : user.bio.profileImage ,
            power : user.power ,
            sentRequest : reqt
        }, process.env.BCRYPT_CODE ,{expiresIn : '15d'}) ;

        const userDoc = {
            id : user._id ,
            email : user.email ,
            firstName : user.name.firstName ,
            lastName : user.name.lastName ,
            profileImage : user.bio.profileImage ,
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

        user.bio.socials.instagram = instagram ;
        user.bio.socials.github = github ;
        user.bio.socials.facebook = facebook ;


        await user.save() ;
        return res.status(200).json({message : 'Socials has been edited'}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const putProfileImage = async (req , res , next) => {
    const userId = req.user.id ;
    
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'})
        }

        console.log(user) ;

        if (user.bio.profileImage) {
            const profileId = extractPublicId(user.bio.profileImage);
            // we add progile_images to the path since am saving them there
            // and cloudinry needs the full path to it or the asigned path with 
            // id
            await cloudinary.uploader.destroy(`profile_images/${profileId}`) ;
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` ,
            {folder : 'profile_images'}
        )
        
        user.bio.profileImage = result.secure_url ;

        const request = await UserWaitSellerConf.findOne({userId : user._id}) ;

        let reqt = false ;
        
        if (request) {
            reqt = true ;
        }

        const userDoc = {
            id : user._id ,
            email : user.email ,
            firstName : user.name.firstName ,
            lastName : user.name.lastName ,
            profileImage : result.secure_url ,
            power : user.power ,
            sentRequest : reqt 
        }

        await user.save() ;

        const token = jwt.sign({
            email : user.email ,
            userId : user._id.toString() ,
            firstName : user.name.firstName ,
            lastName : user.name.lastName ,
            profileImage : result.secure_url ,
            power : user.power ,
            sentRequest : reqt
        }, process.env.BCRYPT_CODE ,{expiresIn : '15d'}) ;

        return res.status(200).json({
                message : 'Image has been updated' ,
                user : userDoc ,
                jwtToken : token
            }) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getUserProfile = async (req, res , next) => {
    // this controller doesnt have anything to do with the modofication of the profile of the user
    // i just wanted to add it here since it has a realtion with the profiles and getting data of them

    // work in progress....

    const profileId = req.params.profileId ;
    const userId = req.user.id ;
    
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }

        const profile = await User.findById(profileId) ;
        if (!profile) {
            return res.status(400).json({message : 'Couldnt find profile error happened'}) ;
        }
        const profileUserFriendsIdsPromise = profile.friends.map(async (friendObj) => {
            const friend = await User.findById(friendObj.friendId) ;
            if (!friend) {
                const error = new Error('Error happened , couldnt find user') ;
                throw error ;
            }

            return {
                name : friend.name ,
                bio : friend.bio ,
                _id : friend._id
            }
        })

        // this will contain the users of the user we looking at his profile
        const profileUserFriendsIds = await Promise.all(profileUserFriendsIdsPromise) ;

        // this object will contain the data that will be shown in the frontend , the status of the user ,
        // some of his products if he was a seller , some of his friends 

        const newProfile = {
            name : profile.name ,
            bio : profile.bio ,
            email : profile.email ,
            status : undefined ,
            sentBy : undefined ,
            power : profile.power ,
            products : undefined ,
            friends : profileUserFriendsIds
        }

        if (profile.power === 'admin' || profile.power === 'seller') {
            const profileUserProducts = await Product.find({creatorId : profile._id , valid : true}) ;
            newProfile.products = profileUserProducts ;
        }

        let includes1 = false , includes2 = false  ;

        user.friends.map(user => {
            if (user.friendId.toString() === profile._id.toString()) {
                includes1 = true ;
                return true ;
            }
        })

        if (includes1) {
            newProfile.status = 'friend' ;
            return res.status(200).json({profile : newProfile })
        }

        user.friendsRequests.map(user => {
            if (user.friendId.toString() === profile._id.toString()) {
                newProfile.status = "pending" ; 
                newProfile.sentBy = user.sentBy ;
                includes2 = true ;
                return true ;
            }
        })

        if (includes2) {
            return res.status(200).json({profile : newProfile})
        }

        newProfile.status = "normal" ;
        return res.status(200).json({profile : newProfile }) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const detailManagement = {patchChangeName , putProfileImage , putSocialMedias , getUserProfile} ;

export default detailManagement ;