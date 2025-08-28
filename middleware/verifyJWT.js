import jwt from 'jsonwebtoken'

// verifys the validaty of the json web token send by the user in evry protected route

export const verifyJWT = async (req , res , next) => {
    const authHeader = req.headers.authorization ;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({message : 'invalid jwt format'}) ;
    }
    const jwtToken = authHeader.split(' ')[1] ;
    jwt.verify(jwtToken , process.env.BCRYPT_CODE , (err , decoded) => {
        if (err) {
            return res.status(400).json({message : 'invalid token' , valid : false}) ;
        }
        const {email , userId , lastName , firstName} = decoded ;
        const user = {
            email ,
            id : userId 
        }

        req.user = user ;
        next() ;
    })
}