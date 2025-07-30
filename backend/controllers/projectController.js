import Project from "../models/projectModel.js";
import * as projectService from "../services/projectService.js"
import {validationResult} from "express-validator"
import User from "../models/userModel.js";
export const createProjectController=async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }
    try {
        const {name}=req.body;
        //autheticated user can create the project
        //req.user.email this information is stored in the jwt token
    const loggedInUser=await User.findOne({email:req.user.email})
    const userId=loggedInUser._id;
    const newProject=await projectService.createProject({name,userId})
    res.status(201).json(newProject)
    } catch (error) {
        console.log(error)
        res.status(400).json(error.message)
    }
    

}
//for dispalying the members of users in the project and also getiing the project information
//for shoe=wing how maany users are present in the project
export const getAllProjects=async(req,res)=>{
    try {
        const loggedInUser=await User.findOne({email:req.user.email})
        const allUserProjects=await projectService.getAllProjectByUserId({userId:loggedInUser._id})
        return res.status(200).json({projects:allUserProjects})
    } catch (error) {
        console.log(error)
        res.status(404).json({error:error.message})
    }
}
// adding user to the project
export const addUserToProject=async(req,res)=>{
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors:error.array()})
    }
    try {
        const {projectId,users}=req.body;
        const loggedInUser=await User.findOne({
            email:req.user.email
        })
        const project=await projectService.addUsersToProject({projectId,users,userId:loggedInUser._id})
        return res.status(200).json({
            project
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            error:error.message
        })
    }
}
// displaying the all projects on the ui
export const allProjects=async(req,res)=>{
    try {
        const {projectId}=req.params;
        const project=await projectService.getProjectById({projectId})
        return res.status(200).json({
            project
        })
       
    } catch (error) {
      console.log(error)  
      res.status(400).json({error:error.message})
    }
}
// changes that are made in the editor that should reflect on the database
export const updateFileTree=async(req,res)=>{
    const errors=validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {projectId,fileTree}=req.body;
        const project=await projectService.updateFileTree({
            projectId,
            fileTree
        })
        return res.status(200).json({
            project
        })
    } catch (error) {
         
         console.log(error)
        res.status(400).json({ error: err.message })
    }
}