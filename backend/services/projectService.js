
import mongoose from "mongoose";
import Project from "../models/projectModel.js";
export const createProject=async({name,userId})=>{
    if(!name){
        throw new Error("Name is required")
    }
    if(!userId){
        throw new Error("User is Required")
    }
    const project=await Project.create({
        name,
        users:[userId]
    })
    return project;
}
export const getAllProjectByUserId=async({userId})=>{
    if(!userId){
        throw new Error("UserId is required")
    }
    const allUserProjects=await Project.find({
        users:userId
    })
    return allUserProjects;
}
export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!users || !Array.isArray(users)) {
    throw new Error("users must be an array");
  }

  if (!users.every(user => mongoose.Types.ObjectId.isValid(user))) {
    throw new Error("All users must be valid ObjectIds");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // Check if the user adding others is already part of the project
  const project = await Project.findOne({
    _id: projectId,
    users: userId
  });

  if (!project) {
    throw new Error("User does not belong to the project");
  }

  
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        users: { $each: users }
      }
    },
    {
      new: true 
    }
  );

  return updatedProject;
};
export const getProjectById=async({projectId})=>{
  if(!projectId){
    throw new Error("projectId is required")
  }
  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new Error("projectId is invalid")
  }
  const project=await Project.findOne({
    _id:projectId
  }).populate("users")
  return project;
}
export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await Project.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}
