import React from 'react'
import { FaUserSecret } from 'react-icons/fa6'
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { updatedAvatar } from '../Store/UserSlice';
import { useDispatch } from 'react-redux';
import { IoClose } from "react-icons/io5";


const UserProfileAvatarEdit = ({close}) => {

    const user = useSelector((state) => state.user);
    const dispatch= useDispatch();
    console.log("Avatar after update:", user.avatar);
    
    const [loading, setLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        
    }

    const handleUploadAvatarImage = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            setLoading(true);
            const response = await Axios({
            url: summaryApi.uploadAvatar.url,
            method: summaryApi.uploadAvatar.method,
            data: formData,
            
            
        })
        const {data:responseData}=response;
        dispatch(updatedAvatar(responseData.data.avatar));
        
        

        }catch (error) {
            AxiosToastError(error);

        }finally{
            setLoading(false);
        }
        
        
        
        
    }



  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-900
     bg opacity-70 p-4 flex items-center justify-center'>
        <div className='bg-white max-w-sm w-full rounded p-4 flex flex-col
        items-center justify-center'>
            <button onClick={close} className=' text-neutral-800 w-fit block ml-auto '>
                <IoClose size={25} />

            </button>
           <div className='cursor-pointer w-16 h-16 bg-amber-400 flex items-center
            justify-center rounded-full overflow-hidden drop-shadow-sm'>
                   {
                     user.avatar?(
                       <img
                            alt={user.name}
                            src={typeof user.avatar === "string" ? user.avatar : user.avatar?.url}
                            className="w-full h-full rounded-full"
                            />
                     ) :(
                       <FaUserSecret size={50} className='text-red-500'/>
                     )
                   }
           
            </div>

            <form onSubmit={handleSubmit}>
                <label htmlFor='uploadProfile'>
                    <div className='border border-green-400 hover:bg-green-600
                    px-4 py-2 rounded-full mt-3 text-sm text-neutral-800'>
                
                {
                    loading? "Loading..." : "Upload"
                }
            </div>
                </label>
                <input onChange={handleUploadAvatarImage} type='file' id='uploadProfile' className='hidden' >
                </input>
            </form>

            

        </div>
    </section>
  )
}

export default UserProfileAvatarEdit