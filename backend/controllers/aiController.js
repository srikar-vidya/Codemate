import * as aiServices from "../services/aiService.js"
export const getResult=async(req,res)=>{
    try {
        const {prompt}=req.query
        const result=await aiServices.generateResult(prompt)
       res.send({ result }) 
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error.message})
    }
}