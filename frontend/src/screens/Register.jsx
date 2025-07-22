import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { useState } from 'react'
import { useUser } from '../context/userContext'
const Register = () => {
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("")
   const {setUser}=useUser()
  const submitHandler=async(e)=>{
    e.preventDefault()
    try {
      const response=await axios.post("/users/register",{
        email,password
      })
      localStorage.setItem("token",response.data.token)
      setUser(response.data.user)
      navigate("/")
      

    } catch (error) {
      console.log(error)
    }
    
  }
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
       <h2 className='text-2xl font-bold text-white mb-6'>Register</h2> 
       <form onSubmit={submitHandler}>
        <div className='mb-4'>
            <label className='block text-gray-400 mb-2'htmlFor='email'>Email</label>
            <input type="email" id="email"
               onChange={(e)=>setEmail(e.target.value)}
              value={email} className='w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder="Enter your email" />
        </div>
        <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              onChange={(e)=>setPassword(e.target.value)}
              value={password}
            />
          </div>
        <button
            type="submit"
            className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
       </form>
       <p className='text-gary-400 mt-4'>
             Have an account?
        <Link to="/login" className='text-blue-500 hover:underline'>  Login</Link>
       </p>
    </div>
     
    </div>
  )
}

export default Register