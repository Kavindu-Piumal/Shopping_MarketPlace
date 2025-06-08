import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className='shadow-md h-20 border-t'>
        <div className='container mx-auto p-4 text-center flex-col lg:flex-row lg:justify-between gap-2'>
            <p>All Right Reserved 2025</p>
            <div className='flex items-center gap-4 justify-center text-2xl'>
                <a href=''className='hover:text-blue-500'>
                    <FaFacebook className='text-2xl mx-2 '/>
                </a>
                <a href='' className='hover:text-orange-700'>
                    <FaInstagram className='text-2xl mx-2'/>
                </a>
                <a href=''className='hover:text-blue-700'>
                    <FaLinkedin className='text-2xl mx-2'/>
                </a>
                <a href=''className='hover:text-blue-400'>
                    <FaTwitter className='text-2xl mx-2'/>
                </a>
            </div>
        </div>


    </footer>
  )
}

export default Footer   