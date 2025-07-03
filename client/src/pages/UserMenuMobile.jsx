import React from 'react'
import UserMenu from '../components/UserMenu'
import { FaRegWindowClose } from "react-icons/fa";

const UserMenuMobile = () => {
  return (
    <section className='bg-white w-full h-full py-2'>
      {/* Header with My Account title - no close button for mobile view */}
      <div className='container mx-auto px-3 pt-2 pb-1'>
        <div className='flex items-center'>
          <h1 className='font-semibold text-lg'>My Account</h1>
        </div>
      </div>
      
      {/* User Menu Content without duplicate title - no top padding */}
      <div className='container mx-auto px-3 pt-1'>
        <UserMenu hideTitle={true}/>
      </div>
    </section>
  )
}

export default UserMenuMobile;