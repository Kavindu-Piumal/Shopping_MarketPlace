import React ,{useEffect, useRef, useState} from 'react'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNotification } from '../context/NotificationContext';
import Axios from 'axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { Link, useLocation, useNavigate } from 'react-router-dom';



const OtpVerification = () => {
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const [data,setData] = useState([

    "","","","","",""

  ])

  const navigate=useNavigate();

  const inputRef=useRef([]);

  const location=useLocation();

  useEffect(()=>{
        if(!location?.state?.email){
            navigate("/forgot-password")
        }
    },[])
  
  
  const validvalue=data.every(ele=>ele);
  
  

  const handleSubmit=async(e)=>{
    e.preventDefault();

    

    try{
      const response = await Axios({
        url: summaryApi.forgot_password_otpverify.url,
        method: summaryApi.forgot_password_otpverify.method,
        data: {
          otp: data.join(""),
          email: location?.state?.email
          
        }
      });

            if(response.data.error){
        showError(response.data.message);
      }

      if(response.data.success){
        showSuccess(response.data.message);
        setData(["","","","","",""]);
        navigate("/reset-password",{
          state : {
            data:response.data,
            email : location?.state?.email
          }
        });
      }

    }catch(error){
      axiosNotificationError(error);
    }
    
  }


  return (
    <section className= 'w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-4'>
            
            <p className='font-bold'>Enter OTP</p>


            <form className='grid gap-2 mt-6 'onSubmit={handleSubmit}>

              

            <div className='grid gap-1'>
                <label htmlFor="otp" >Enter Your OTP :</label>
                <div className='flex items-center gap-2 justify-between mt-3'>
                  {
                    data.map((ele,index)=>{
                     return( <input 
                          key={'otp'+index}
                          type="text"
                          id='otp'

                          ref={(ref)=> {inputRef.current[index]=ref
                            return ref
                          }}

                          value={data[index]}
                          onChange={(e)=>{
                            const value=e.target.value;
                            const newData=[...data];
                            newData[index]=value;
                            setData(newData);

                            if(value && index<5){
                              inputRef.current[index+1].focus();
                            }
                          }}
                          maxLength={1}
                          autoFocus
                          className='bg-blue-50 p-2 w-full max-w-16 border rounded text-center font-semibold'
                          required
                     />
                     ) })
                  }
                </div>
                
            </div>

            

            <button disabled={!validvalue} className={`${validvalue? "bg-green-600 hover:bg-green-500" : "bg-gray-500"} text-white py-2 rounded font-semibold my-2 tracking-wider`}>Verify OTP</button>

            

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

export default OtpVerification;