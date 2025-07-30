import { Router } from "express";
import * as userController from "../controllers/userController.js"
import { body } from "express-validator";
import * as authMiddleware from "../middleware/authMiddleware.js"
const router=Router();
router.post("/register",body("email").isEmail().withMessage("email must be valid adddress"),
body("password").isLength({min:3}).withMessage("password must be atleast 3 characters")
,userController.createUserController)

router.post("/login",
   body("email").isEmail().withMessage("email must be valid adddress"),
body("password").isLength({min:3}).withMessage("password must be atleast 3 characters")
,userController.loginUser
)
//when we created the logon or register, it will generate us a token, by those token it will send the user infrmation..
router.get("/profile",authMiddleware.authUser,userController.profileController)
router.get("/logout",authMiddleware.authUser,userController.logoutController)
// used to add the colobarators
router.get("/all",authMiddleware.authUser,userController.getAllUserController)
export default router
