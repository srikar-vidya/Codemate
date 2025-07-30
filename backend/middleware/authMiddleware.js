import jwt from "jsonwebtoken";
import redisClient from "../services/redisServices.js";
export const authUser=async(req,res,next)=>{
    try {
        const token=req.cookies.token || req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).send({error:"please authenticate"})
        }
        //done at the time of logout by using the redis ....
        const isBlackListed=await redisClient.get(token);

        if(isBlackListed){
            res.cookie("token","")
             return res.status(401).send({error:"please authenticate"})
        }
        const decode=jwt.verify(token,process.env.JWT_SECRET)
        console.log(decode)
        // in req.user we are giving email of the user which is stored at the time of jwt signin
        req.user=decode;

        next()
    } catch (error) {
        console.log(error)
        return res.status(401).send({error:"please authenticate"})
    }
}