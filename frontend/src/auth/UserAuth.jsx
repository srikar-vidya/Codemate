import React, { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
// it is used in the routes app-router when we are navigating the pages from one page to another page..
const UserAuth = ({children}) => {
    const navigate=useNavigate()
    const {user}=useUser()
    const [loading,setLoading]=useState(true)
    //navigate to one page to another page and checking the validation of the user..
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