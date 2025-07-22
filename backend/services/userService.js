import User from "../models/userModel.js";
export default async function createUser({
    email,password
}){
    if(!email || !password){
        throw new Error("Email and password are required")
    }
    const hashPassword=await User.hashPassword(password)
    const user=await User.create({
        email,
        password:hashPassword
    })
  
   return user;
}
export const getAllUsers=async({userId})=>{

    const users=await User.find({
        _id:{$ne:userId},
    })
    return users;
}