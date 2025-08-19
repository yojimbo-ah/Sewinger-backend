import jwt from 'jsonwebtoken'

export const verifyJWT = async (req , res , next) => {
    const authHeader = req.headers.authorization ;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({message : 'invalid jwt format'}) ;
    }
    const jwtToken = authHeader.split(' ')[1] ;
    jwt.verify(jwtToken , 'topsecretcode' , (err , decoded) => {
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