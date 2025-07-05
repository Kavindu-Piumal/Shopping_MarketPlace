import React, { useEffect } from 'react'
import {IoSearch} from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaArrowLeft } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { Link } from 'react-router-dom';


const Search = () => {

    const location=useLocation();

    const navigate=useNavigate();

    const [isSearchPage, setIsSearchPage] = useState(false);
    const [isMobile] =useMobile();
    const params=useLocation();
    const searchText=params?.search?.slice(3);

    useEffect(() => {
        const isSearch=location.pathname==='/search';
        setIsSearchPage(isSearch);
    }
    , [location]);

    
    const redirectToSearchPage = () => {
        navigate('/search');
    }

    const handleOnChange = (e) => {
        const value = e.target.value;

        const url=`/search?q=${value}`
        navigate(url);

        
    }

  return (
    <div className='w-full  min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group  focus-within:border-green-400'>
        {
            (isMobile && isSearchPage) ? (
                <Link to={'/'} className='flex justify-center h-full p-3.5 m-1 group-focus-within:text-green-400 bg-white rounded-full shadow-md'>
                    <FaArrowLeft size={20}/>
                </Link>
            ):(
                <button className='flex justify-center h-full p-3.5 group-focus-within:text-green-400'>
                    <IoSearch size={22}/>
                </button>
            )
        }

        <div className='w-full '>
            {
                !isSearchPage?(
                <div onClick={redirectToSearchPage} className='w-full flex items-center'>
                     <TypeAnimation
                        sequence={[
                        'Search for products',
                            1000,
                        'Search for categories',
                            1000,
                        'Search for brands',
                            1000,]}
                        speed={50}
                        wrapper="span"
                        repeat={Infinity}/>
                </div>

                ):(
                    <input
                         type="text"
                         placeholder='Search for products, categories, brands'
                         autoFocus
                         defaultValue={searchText || ''}
                         className='w-full h-full p-3.5 outline-none bg-slate-50'
                         onChange={handleOnChange}
                         />
                )
            }
        </div>
    </div>
  )
}

export default Search