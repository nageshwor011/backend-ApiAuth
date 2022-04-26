import jwt from 'jsonwebtoken';
import userModel from '../models/users.js';

let checkUserAuth = async (req, res, next)=>{
    let token
    const {authorization} = req.headers;
            console.log("authorization is ", authorization);
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // getting token from header
            token = authorization.split(' ')[1]
            // console.log("tokken is  ", token );

            // verify token 
            const {userId} = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // console.log("user id is ", userId);

            //get user from token
            req.user =  await userModel.findById(userId).select('-password -confirmPassword')
            next();
        } catch (error) {
            console.log(error);
            res.status(401).send({"status":"faild", "message": "unautharaize user"})
            
        }
    } 
    if (!token) {
        res.status(401).send({"status":"faild", "message": "no token found"})
        
    }
}


export default checkUserAuth;