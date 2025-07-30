//connecting socket io in the frontend with the backend url
import socket from "socket.io-client"
let socketInstance=null;
export const initialzeSocket=(projectId)=>{
    socketInstance=socket(import.meta.env.VITE_API_URL,{
        auth:{
            token:localStorage.getItem("token")
        },
        query:{
            projectId
        }
    })
    return socketInstance;
}
//receive message
export const receiveMessage=(eventName,cb)=>{
    socketInstance.on(eventName,cb)
}
//send messsage
export const sendMessage=(eventName,data)=>{
    socketInstance.emit(eventName,data)
}