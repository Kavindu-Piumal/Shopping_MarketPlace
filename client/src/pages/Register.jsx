import React ,{useState} from 'react'
import { FaEye, FaLeaf, FaRecycle, FaHeart, FaUserPlus } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNotification } from '../context/NotificationContext';
import Axios from 'axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { Link, useNavigate } from 'react-router-dom';


const Register = () => {

  const [data,setData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword,setShowPassword]=useState(false);
  const [showConfirmPassword,setShowConfirmPassword]=useState(false);
  const validvalue=Object.values(data).every(ele=>ele);
  const navigate=useNavigate();
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const handleSubmit=async(e)=>{
    e.preventDefault();

    if(data.password !== data.confirmPassword){
      showError("Password and Confirm Password do not match");
      return;
    }

    try{      const response = await Axios({
        url: summaryApi.register.url,
        method: summaryApi.register.method,
        data: data
      });

      if(response.data.error){
        showError(response.data.message);
      }

      if(response.data.success){
        showSuccess(response.data.message);
        setData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        navigate('/login');
        
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
            <p>Welcome To Sustainable Shopping Marketplace</p>

            <form className='grid gap-2 mt-6 'onSubmit={handleSubmit}>

              <div className='grid gap-1'>
                <label htmlFor="name" >Name</label>
                <input 
                    type="text"
                    id='name'
                    autoFocus
                    className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-400'
                    value={data.name}
                    onChange={handleChange}
                    name='name'
                    placeholder='Enter your name'
                    required
                     />
              </div>

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
            </div>

            <div className='grid gap-1 '>
                <label htmlFor="confirmpassword" >Confirm Password</label>
                <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                  <input 
                    type={showConfirmPassword ? "text":"password"}
                    id='confirmpassword'
                    autoFocus
                    className='w-full outline-none'
                    value={data.confirmPassword}
                    onChange={handleChange}
                    name='confirmPassword'
                    placeholder='Enter your confirm password'
                    required
                     />
                     <div onClick={()=>setShowConfirmPassword((preve)=>!preve)} className='cursor-pointer'>
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

            <button disabled={!validvalue} className={`${validvalue? "bg-green-600 hover:bg-green-500" : "bg-gray-500"} text-white py-2 rounded font-semibold my-2 tracking-wider`}>Register</button>

            

            </form>

            <p>
              Already Have Account? <Link to={"/login"}
              className='text-blue-500 hover:text-blue-600 font-semibold hover:underline'>
              
              Login </Link>
            </p>

        </div>
    </section>
  )

}

export default Register;