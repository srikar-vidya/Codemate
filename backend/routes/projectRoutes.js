import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/projectController.js"
import { authUser } from "../middleware/authMiddleware.js";
const router=Router();
router.post("/create",authUser,
    body("name").isString().withMessage("name is required"),
    projectController.createProjectController
)
router.get("/all",authUser,projectController.getAllProjects)
router.put("/add-user",authUser
    ,
    body("projectId").isString().withMessage("project Id is required"),
    body("users").isArray({min:1}).withMessage("User must be an array").bail()
    .custom((users)=>users.every(user=> typeof user=="string")),
    projectController.addUserToProject)
router.get("/get-projects/:projectId",authUser,projectController.allProjects)
router.put("/update-file-tree",authUser,
    body("projectId").isString().withMessage("Project ID is required"),
    body("fileTree").isObject().withMessage("file tree is required"),
    projectController.updateFileTree

)
export default router;