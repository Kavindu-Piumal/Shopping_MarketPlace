import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import { SlUserUnfollow } from "react-icons/sl";
import { FaCartPlus, FaStore } from "react-icons/fa";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

import react from "../assets/react.svg";
import Search from "./Search";
import UserMenu from "./UserMenu";
import DisplayCartItem from "./DisplayCartItem";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { useGlobalcontext } from "../provider/globaleProvider";
import useMobile from "../hooks/useMobile";
import { useAuthContext } from "../context/AuthContext";

/**
 * 🎯 ENTERPRISE: Zero-unnecessary-calls Header Component
 * Professional authentication handling with lazy loading
 */
const Header = React.memo(() => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🚀 OPTIMIZED: Single Redux selector with shallow comparison
  const { user, cartItem } = useSelector(
    (state) => ({
      user: state.user,
      cartItem: state.cartItem.cart
    }),
    shallowEqual
  );

  const { totalPrice, totalQty } = useGlobalcontext();
  const { checkAuth } = useAuthContext();

  // 🎯 PROFESSIONAL: State management
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openCartSection, setOpenCartSection] = useState(false);
  const userMenuRef = useRef(null);

  // 🔥 PERFORMANCE: Memoized computations
  const isSearchPage = useMemo(() => location.pathname === "/search", [location.pathname]);
  
  const cartDisplay = useMemo(() => {
    if (!cartItem?.length) return "My Cart";
    
    return (
      <div className="text-left">
        <p>{totalQty} Items</p>
        <p>{DisplayPriceInRupees(totalPrice)}</p>
      </div>
    );
  }, [cartItem, totalQty, totalPrice]);

  // Close user menu when route changes
  useEffect(() => {
    setOpenUserMenu(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };

    if (openUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openUserMenu]);

  const redirectToLoginpage = () => {
    navigate("/login");
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleMobileUser = () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    navigate("/user-menu-mobile");
  };

  return (
    <header className="h-28 lg:h-20 shadow-eco sticky top-0 z-50 flex flex-col justify-center gap-1 bg-eco/90 backdrop-blur-md border-b border-emerald-100 rounded-b-eco">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center px-2 justify-between">
          {/* logo */}
          <div className="h-full flex items-center">
            <Link to={"/"} onClick={handleCloseUserMenu} className="h-full flex justify-center items-center gap-2">
              <img
                src={react}
                alt="logo"
                height={170}
                width={60}
                className="hidden lg:block drop-shadow-md"
              />
              <img
                src={react}
                alt="logo"
                height={170}
                width={50}
                className="lg:hidden drop-shadow-md"
              />
              <span className="text-2xl font-bold text-emerald-700 tracking-wide hidden md:block">EcoMarket</span>
            </Link>
          </div>

          {/* Shop Link */}
          <div className="hidden lg:block">
            <Link
              to="/shops"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
            >
              <FaStore size={18} />
              <span>Shops</span>
            </Link>
          </div>

          {/* search */}
          <div className="hidden lg:block w-full max-w-lg mx-8">
            <Search />
          </div>

          {/*login and add to cart */}
          <div className="flex items-center gap-4">
            <button
              className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 p-2 rounded-full transition-colors lg:hidden"
              onClick={handleMobileUser}
              aria-label="User Menu"
            >
              <SlUserUnfollow size={25} />
            </button>

            {/* Desktop Only */}
            <div className="hidden lg:flex items-center gap-8">
              {user?._id ? (
                <div className="relative" ref={userMenuRef}>
                  <div
                    onClick={() => setOpenUserMenu((preve) => !preve)}
                    className="flex select-none items-center gap-2 cursor-pointer text-emerald-700 hover:text-emerald-900 font-semibold"
                  >
                    <p>Account</p>
                    {openUserMenu ? (
                      <GoTriangleUp size={20} />
                    ) : (
                      <GoTriangleDown size={20} />
                    )}
                  </div>
                  {openUserMenu && (
                    <div className="absolute right-0 top-15 z-50">
                      <div className="bg-white rounded shadow-eco p-4 min-w-52">
                        <UserMenu close={handleCloseUserMenu} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={redirectToLoginpage} className="text-lg px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold transition-colors">Login</button>
              )}
              <button 
                onClick={()=>setOpenCartSection(true)} 
                className="flex items-center gap-2 btn-eco px-5 py-2 text-base"
              >
                <FaCartPlus size={22} />
                <div className="font-semibold text-white text-left">
                  {cartItem[0] ? (
                    <div>
                      <p>{totalQty} Items</p>
                      <p>{DisplayPriceInRupees(totalPrice)}</p>
                    </div>
                  ) : (
                    <span>My Cart</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* search for mobile */}
      <div className="container mx-auto px-2 lg:hidden mt-2">
        <Search />
      </div>
      {openCartSection && (
        <DisplayCartItem close={()=>setOpenCartSection(false)}/>
      )}
    </header>
  );
});

export default Header;
