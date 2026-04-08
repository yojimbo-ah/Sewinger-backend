import User from "../models/User.js";

// Middleware to verify that the user is an admin
export const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(400).json({ message: 'Couldnt find user information' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(400).json({ message: 'Couldnt find user with similiar information' });
        }

        if (user.power !== 'admin') {
            return res.status(403).json({ message: 'Insufficient permissions. Admin access required' });
        }

        // Attach the user to the request for use in controllers
        req.admin = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
