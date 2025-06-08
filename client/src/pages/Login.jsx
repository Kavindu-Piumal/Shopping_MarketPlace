import React ,{useState} from 'react'
import { FaEye, FaLeaf, FaRecycle, FaHeart } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNotification } from '../context/NotificationContext';
import Axios from 'axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { setUserDetails } from '../Store/UserSlice';
import { useDispatch } from 'react-redux';

const Login = () => {

  const [data,setData] = useState({
    
    email: '',
    password: '',
    
  })

  const [showPassword,setShowPassword]=useState(false);
  
  const validvalue=Object.values(data).every(ele=>ele);
  
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const handleSubmit=async(e)=>{
    e.preventDefault();

    try{
      const response = await Axios({
        url: summaryApi.login.url,
        method: summaryApi.login.method,
        data: data
      });

      if(response.data.error){
        showError(response.data.message);
      }

      if(response.data.success){
        showSuccess(response.data.message);

        localStorage.setItem('accesstoken',response.data.data.accesstoken);
        localStorage.setItem('refreshtoken',response.data.data.refreshtoken);        const userDetails=await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setData({
          email: '',
          password: ''
        });
        navigate('/');
        
      }

    }catch(error){
      axiosNotificationError(error);
    }
    
  }

  const handleChange = (e) => {
    const {name,value} = e.target;

    setData((preve)=>{
      return {
        ...preve,
        [name]: value
      }
    });


  }
    
  



  return (
    <section className= 'w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-4'>
            <p>Welcome To Sustainable Shopping Marketplace </p>
            <h1 className='text-xl font-semibold'>Login to Continue</h1>


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

            <div className='grid gap-1 '>
                <label htmlFor="password" >Password</label>
                <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                  <input 
                    type={showPassword ? "text":"password"}
                    id='password'
                    autoFocus
                    className='w-full outline-none'
                    value={data.password}
                    onChange={handleChange}
                    name='password'
                    placeholder='Enter your password'
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
                <Link to={'/forgot-password'} className='block ml-auto hover:text-green-400'>Forgot Password ? </Link>
            </div>

            

            <button disabled={!validvalue} className={`${validvalue? "bg-green-600 hover:bg-green-500" : "bg-gray-500"} text-white py-2 rounded font-semibold my-2 tracking-wider`}>Login</button>

            

            </form>

            <p>
              Dont Have Account? <Link to={"/register"}
              className='text-blue-500 hover:text-blue-600 font-semibold hover:underline'>
              
              Register </Link>
            </p>

        </div>
    </section>
  )

}

export default Login;