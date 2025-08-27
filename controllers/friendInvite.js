import User from "../models/User.js";

const postFriendInvite = async (req , res , next) => {
    const userId = req.body.userId ;
    const friendId = req.body.friendId ;

    try {

        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair information'}) ;
        }

        const friend = await User.findById(friendId) ;
        if (!friend) {
            return res.status(400).json({message : 'Couldnt find friend profile'}) ;
        }
        let includes = false ;
        user.friendsRequests.forEach(request => {
            if (request.firendId.toString() === friendId.toString()) {
                includes = true ;
                return true ;
            }
        })
        if (includes) {
            return res.status(400).json({message : 'The invite is already sent you cant sent it again'}) ;
        }
        user.friendsRequests.push({
            friendId : friendId ,
            sentBy : 'me'
        })
        friend.friendsRequests.push({
            friendId : userId ,
            sentBy : 'friend'
        })

        await user.save() ;
        await friend.save() ;
        return res.status(200).json({message : 'Request was added'}) ;
    } catch (error) {
        return res.status(500).json({message : 'Couldnt send friend invite'}) ;
    }


}

const approveFriendInvite = async (req , res , next) => {
    const userId = req.body.userId ;
    const friendId = req.body.friendId ;
    const approve = req.body.approve ;

    try {
        const user = await User.findById(userId) ;

        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair info'}) ;
        }

        const friend = await User.findById(friendId) ;
        if (!friend) {
            return res.status(400).json({message : 'Couldnt find your friend try again later'}) ;
        }

        // cheking if the friend is already in the friend section in the database :
        let alreadyFriend = false ;
        user.friends.map(request => {
            if (request.friendId.toString() === friendId.toString()) {
                alreadyFriend = true ;
                return true ;
            }
        })

        if (alreadyFriend) {
            return res.status(400).json({message : 'You are already friend with this user'}) ;
        }

        // updating both the friend requests and also the friends depending on the data base :
        let had1 = false ;
        let had2 = false ;
        let index1 ;
        let index2 ;

        user.friendsRequests.map((request , index) => {
            if (request.friendId.toString() === friendId.toString() && request.sentBy === 'friend') {
                had1 = true ;
                index1 = index ;
                return true ;
            }
        })
        friend.friendsRequests.map((request , index) => {
            if (request.friendId.toString() === userId.toString()) {
                index2 = index ;
                had2 = true ;
                return true ;
            }
        })


        if (approve && had1 && had2) {           
            user.friendsRequests.splice(index1 , 1) ;
            user.friends.push({
                friendId : friendId 
            })
            friend.friendsRequests.splice(index2 , 1) ;
            friend.friends.push({
                friendId : userId
            })
            await user.save() ;
            await friend.save() ;

            return res.status(200).json({message : 'Friend had been added'}) ;
        } else if (!approve && had1 && had2) {
            user.friendsRequests.splice(index1 , 1) ;
            friend.friendsRequests.splice(index2 , 1) ;

            await friend.save() ;
            await user.save() ;

            return res.status(200).json({message : 'Friend Request has been denied'}) ;
        }

        return res.status(400).json({message : 'Couldnt complete confirmation'}) ;

    } catch (error) {
        return res.status(500).json({message : 'Iternal server , ooopps'})
    }
}

const deleteFriend = async (req , res , next) => {
    const userId = req.body.userId ;
    const friendId = req.body.friendId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        const friend = await User.findById(friendId) ;

        if (!friend) {
            return res.status(400).json({message : 'Couldnt find friend with similair informations'}) ;
        }

        let index1 = undefined ;
        let index2 = undefined ;

        let had1 = false ;
        let had2 = false ;

        // used two variavble for each user since the index can be zero and it would be falsy in javaScript

        user.friends.forEach((friend , index) => {
            if (friend.friendId.toString() === friendId.toString()) {
                had1 = true ;
                index1 = index ;
                return true ;
            }
        })
        friend.friends.map((friend , index) => {
            if (friend.friendId.toString() === userId.toString()) {
                had2 = true ;
                index2 = index ;
                return true ;
            }
        })
        if (had1 && had2) {
            user.friends.splice(index1 , 1) ;
            friend.friends.splice(index2 , 1) ;
            await user.save() ;
            await friend.save() ;
            return res.status(200).json({message : 'Friend has been removed'}) ;
        }

        return res.status(400).json({message : 'Couldnt delete friend'}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getUserFriends = async (req , res , next) => {
    const userId = req.body.userId ;

    
}

const getUserPendingFriends = async (req , res , next) => {

}

const getUserFriendRequests = async (req , res , next ) => {

}

const friend = {approveFriendInvite , postFriendInvite , deleteFriend} ;

export default friend ;