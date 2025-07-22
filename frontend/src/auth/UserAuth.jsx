import React, { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
const UserAuth = ({children}) => {
    const navigate=useNavigate()
    const {user}=useUser()
    const [loading,setLoading]=useState(true)
    
    useEffect(()=>{
        const token=localStorage.getItem("token")
       if (!token || !user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [navigate, user]);
   if (loading) return <div>Loading...</div>;
  return (
   <>
   {children}
   </>
  )
}

export default UserAuth