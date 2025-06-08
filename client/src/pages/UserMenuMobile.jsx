import React from 'react'
import UserMenu from '../components/UserMenu'
import { FaRegWindowClose } from "react-icons/fa";

const UserMenuMobile = () => {
  return (
    <section className='bg-white w-full h-full py-2'>
      <button onClick={()=>window.history.back()} className='text-neutral-500 block w-fit ml-auto'>
        <FaRegWindowClose size={20}/>
      </button>
      <div className='container mx-auto px-3 py-5'>
        <UserMenu/>
      </div>
    </section>
  )
}

export default UserMenuMobile;