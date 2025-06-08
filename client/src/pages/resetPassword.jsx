import React, { use, useEffect } from 'react'
import { useLocation , useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import summaryApi from '../common/summaryApi';
import Axios from 'axios';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { useNotification } from '../context/NotificationContext';


const ResetPassword = () => {
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const location=useLocation();
  const navigate=useNavigate();
  const [data,setData]=useState({
    email:"",
    newPassword:"",
    confirmPassword:""
  })

  const[showPassword,setShowPassword]=useState(false);

  const [showConfirmPassword,setShowConfirmPassword]=useState(false);

  const validvalue=Object.values(data).every(ele=>ele);

  useEffect(()=>{
    if(!(location?.state?.data?.success)){
        navigate("/forgot-password")
    }

    if(location?.state?.email){
        setData((prev)=>({
            ...prev,
            email:location?.state?.email
        }))
    }
  },[])

  const handleChange = (e) => {
    const {name,value} = e.target;

    setData((preve)=>{
      return {
        ...preve,
        [name]: value
      }
    });


  }

  const handleSubmit=async(e)=>{
    e.preventDefault();    if(data.newPassword !== data.confirmPassword){
      showError("Password and Confirm Password should be same");
      return;
    }

    try{
      const response = await Axios({
        ...summaryApi.resetPassword,
        data:data
      });

      if(response.data.error){
        showError(response.data.message);
      }

      if(response.data.success){
        showSuccess(response.data.message);
        navigate('/login', { state: { email: data.email } });
        setData({
          email:"",
          newPassword:"",
          confirmPassword:""
        });
      }

    }catch(error){
      axiosNotificationError(error);
    }
    
  }



    

  return (
    <section className= 'w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-4'>
            
            <p className='font-bold'>Enter Your New Password</p>


            <form className='grid gap-2 mt-6 'onSubmit={handleSubmit}>

              

            <div className='grid gap-1'>
                <label htmlFor="newPassword" >New Password</label>
                
                                
                                <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                                  <input 
                                    type={showPassword ? "text":"password"}
                                    id='password'
                                    autoFocus
                                    className='w-full outline-none'
                                    value={data.newPassword}
                                    onChange={handleChange}
                                    name='newPassword'
                                    placeholder='Enter your  New password'
                                    required
                                     />
                                    <div onClick={()=>setShowPassword((preve)=>!preve)} className='cursor-pointer'>
                                      {
                                        showPassword?(
                                          <FaEye/>
                                        ) : (
                                          <FaEyeSlash/>
                
                                        )
                                      }
                                   
                
                
                                    </div>
                                </div>
                                
            </div>

            <div className='grid gap-1'>
                <label htmlFor="confirmPassword" >Confirm Password</label>
                
                                
                                <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                                  <input 
                                    type={showConfirmPassword ? "text":"password"}
                                    id='password'
                                    autoFocus
                                    className='w-full outline-none'
                                    value={data.confirmPassword}
                                    onChange={handleChange}
                                    name='confirmPassword'
                                    placeholder='Confirm your password'
                                    required
                                     />
                                    <div onClick={()=>setShowConfirmPassword((preve)=>!preve)} className='cursor-pointer'>
                                      {
                                        showConfirmPassword?(
                                          <FaEye/>
                                        ) : (
                                          <FaEyeSlash/>
                
                                        )
                                      }
                                   
                
                
                                    </div>
                                </div>
                                
            </div>
                
            

            

            <button disabled={!validvalue} className={`${validvalue? "bg-green-600 hover:bg-green-500" : "bg-gray-500"} text-white py-2 rounded font-semibold my-2 tracking-wider`}>Change Password</button>

            

            </form>

            <p>
              Already Have  an Account? <Link to={"/login"}
              className='text-blue-500 hover:text-blue-600 font-semibold hover:underline'>
              
              Login </Link>
            </p>

        </div>
    </section>
  )
}

export default ResetPassword;