import React ,{useState} from 'react'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNotification } from '../context/NotificationContext';
import Axios from 'axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { Link, useNavigate } from 'react-router-dom';


const forgotPassword = () => {
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const [data,setData] = useState({
    
    email: ''
    
  })

  const navigate=useNavigate();

  const handleChange = (e) => {
    const {name,value} = e.target;

    setData((preve)=>{
      return {
        ...preve,
        [name]: value
      }
    });


  }
  const validvalue=Object.values(data).every(ele=>ele);
  
  

  const handleSubmit=async(e)=>{
    e.preventDefault();

    

    try{
      const response = await Axios({
        url: summaryApi.forgotPassword.url,
        method: summaryApi.forgotPassword.method,
        data: data
      });      if(response.data.error){
        showError(response.data.message);
      }

      if(response.data.success){
        showSuccess(response.data.message);
        navigate('/verification-otp', { state: { email: data.email } });
        setData({
          email: ''
        });
      }

    }catch(error){
      axiosNotificationError(error);
    }
    
  }

  
    
  



  return (
    <section className= 'w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-4'>
            
            <p className='font-bold'>Forgot Password</p>


            <form className='grid gap-2 mt-6 'onSubmit={handleSubmit}>

              

            <div className='grid gap-1'>
                <label htmlFor="email" >E-mail</label>
                <input 
                    type="email"
                    id='email'
                    autoFocus
                    className='bg-blue-50 p-2 border rounded '
                    value={data.email}
                    onChange={handleChange}
                    name='email'
                    placeholder='Enter your email'
                    required
                     />
            </div>

            

            <button disabled={!validvalue} className={`${validvalue? "bg-green-600 hover:bg-green-500" : "bg-gray-500"} text-white py-2 rounded font-semibold my-2 tracking-wider`}>Send OTP</button>

            

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

export default forgotPassword;