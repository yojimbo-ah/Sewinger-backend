import User from "../models/User.js";
import Notification from "../models/Notification.js";

const getNotifications = async (req , res , next) => {
    const userId = req.user.id ;


    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Coudldnt find user'}) ;
        }
        const notifications = await Notification.findById(user.notification) ;
        if (!notification) {
            throw new Error('Error couldnt find notifications') ;
        }

        return res.status(200).json({notification : notifications}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const notification = {getNotifications} ;

export default notification ;