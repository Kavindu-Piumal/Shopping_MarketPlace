import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

  // Check if we're on a page that needs a sticky footer
  // These are pages with minimal content like login/register
  const needsStickyFooter = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)

  const footerClasses = needsStickyFooter
    ? 'border-t border-gray-200 py-6 hidden lg:block bg-white absolute bottom-0 left-0 w-full'
    : 'border-t border-gray-200 py-6 hidden lg:block bg-white'

  return (
    <footer className={footerClasses}>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap justify-between items-center'>
          {/* Copyright and basic info */}
          <div className='text-sm text-gray-600'>
            <p>© {currentYear} EcoMarket. All rights reserved.</p>
          </div>

          {/* Essential links */}
          <div className='flex gap-6 text-sm'>
            <Link to="/privacy-policy" className='text-gray-600 hover:text-emerald-700 transition-colors'>
              Privacy Policy
            </Link>
            <Link to="/terms" className='text-gray-600 hover:text-emerald-700 transition-colors'>
              Terms of Service
            </Link>
            <Link to="/contact" className='text-gray-600 hover:text-emerald-700 transition-colors'>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
