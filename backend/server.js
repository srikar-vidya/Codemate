import dotenv from "dotenv"
dotenv.config()
import app from "./app.js";
import http from "http"
import { Server } from "socket.io";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import Project from "./models/projectModel.js";
import { generateResult } from "./services/aiService.js";
const port=process.env.PORT||3000;
const server=http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});
//verifying the user is vaild or not // we are passing these information during the socket intilization..
io.use(async(socket,next)=>{
    try {
        const token=socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1]
        const projectId=socket.handshake.query.projectId
        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error("invalid project"))
        }
        socket.project=await Project.findById(projectId)
        if(!token){
          return  next(new Error("authentication error"))
        }
        const user=jwt.verify(token,process.env.JWT_SECRET)
        if(!user){
            return next(new Error("authentication error"))
        }
        socket.user=user
        next();
     } catch (error) {
        next(error)
    }
})
io.on('connection', socket => {
    console.log("connected to socket.io")
    socket.roomId=socket.project._id.toString()
    //keeping all in users in the one room
    socket.join(socket.roomId);
    //receiving the message
    socket.on("project-message",async (data)=>{
        const message=data.message;
        const aiIsPresentInMessage=message.includes("@ai");
        //sending the message to all except the owner
        socket.broadcast.to(socket.roomId).emit("project-message",data)
        //if the request is for the ai....
        if(aiIsPresentInMessage){
            console.log("i am in ai")
            const prompt=message.replace("@ai","");
            const result=await generateResult(prompt)
            //sending the message to the frontnd
            io.to(socket.roomId).emit("project-message",{
                message:result,
                sender:{
                    _id:"ai",
                    email:"AI"
                }
            })
        }
        console.log(data)
        console.log(socket.roomId)
        
    })
    socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.leave(socket.roomId)
  });
//   client.on('event', data => { /* … */ });
//   client.on('disconnect', () => { /* … */ });
});

server.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})