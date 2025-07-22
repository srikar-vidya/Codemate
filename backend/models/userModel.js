import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:[6,"must be atleast 6 characters long"],
        maxLength:[50,"email cannot be 50 characters long"]
    },
    password:{
        type:String,
        required:true,
        select:false
    }
})
userSchema.statics.hashPassword=async function(password) {
    return await bcrypt.hash(password,10)
}
userSchema.methods.isValidPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateJWT=function(){
    return jwt.sign({email:this.email}
        ,process.env.JWT_SECRET,
        {
        expiresIn:"24h"
    })
}
const User=mongoose.model("User",userSchema)
export default User;


