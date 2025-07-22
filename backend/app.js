import express from "express"
import { connect } from "./db/connectDb.js";
import userRoutes from "./routes/userRoutes.js"
import cookieParser from "cookie-parser";
import projectRoutes from "./routes/projectRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import cors from "cors";
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
const allowedOrigins = ['https://codemate-frontend-eakf.onrender.com'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
connect();
app.get("/",(req,res)=>{
    res.send("hii")
})
app.use("/users",userRoutes)
app.use("/projects",projectRoutes)
app.use("/ai",aiRoutes)

export default app;

