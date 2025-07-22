import User from "../models/userModel.js";
import createUser from "../services/userService.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redisServices.js";
import { getAllUsers } from "../services/userService.js";
export const createUserController=async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }
    try{
        const user=await createUser(req.body);
        const token=await user.generateJWT()
        res.status(201).json({user,token})
    }catch(error){
        console.log(error)
        res.send(error.message).status(400)
    }
}
export const loginUser=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
         return res.status(400).json({error:errors.array()})
    }
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email}).select("+password")
        if(!user){
            return  res.status(401).json({ message: "Invalid user" });
        }
        const isMatch=user.isValidPassword(password)
        if(!isMatch){
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token=user.generateJWT();
        res.status(200).json({ user: { email: user.email }, token });

    }
    catch(error){
        console.log(error)
          return res.status(500).json({ message: "Server error" });
    }
}
export const profileController=async(req,res)=>{

    console.log(req.user)
    res.status(200).json({
        user:req.user
    })
}
export const logoutController=async(req,res)=>{
    try {
        const token=req.cookies.token || req.headers.authorization.split(" ")[1]
        redisClient.set(token,"logout","EX",60*60*24)
        res.status(200).json({
            message:"Logged out succesfully"
        })
    }catch(error) {
        console.log(error)
        res.status(400).send(error.message);
    }
}
export const getAllUserController=async(req,res)=>{
    try {
        const loggedUser=await User.findOne({email:req.user.email})
        const allUsers=await getAllUsers({userId:loggedUser._id})
         return res.status(200).json({ users: allUsers });
    } catch (error) {
        console.log(error)
        res.status(400).json({error:error.message})
    }
   
}