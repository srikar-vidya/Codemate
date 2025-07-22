import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();
export async function connect() {
    
    try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("connected to the database")
    } catch (error) {
        console.log(error)
       process.exit(1)
    }
}