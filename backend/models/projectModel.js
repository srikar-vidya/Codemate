import mongoose from "mongoose"
const projectSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase: true
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    fileTree:{
        type:Object,
        default:{}
    }
})
const Project=mongoose.model("Project",projectSchema)
export default Project