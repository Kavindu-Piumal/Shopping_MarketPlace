import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import { FaCartPlus, FaStore } from "react-icons/fa";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

import  dp from "../assets/dp.jpg";
import Search from "./Search";
import UserMenu from "./UserMenu";
import DisplayCartItem from "./DisplayCartItem";
import NotificationPanel from "./NotificationPanel.jsx";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { useGlobalcontext } from "../provider/globaleProvider";
import useMobile from "../hooks/useMobile";
import { useAuthContext } from "../context/AuthContext";

/**
 * 🎯 ENTERPRISE: Zero-unnecessary-calls Header Component
 * Professional authentication handling with lazy loading
 * Enhanced desktop UX with improved navigation and visual hierarchy
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

  // 🎯 PROFESSIONAL: State management
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openCartSection, setOpenCartSection] = useState(false);
  const userMenuRef = useRef(null);
  const cartRef = useRef(null);
  const cartButtonRef = useRef(null);

  // 🎯 SMART: Determine if search bar should be visible based on current route
  const shouldShowSearch = useMemo(() => {
    const path = location.pathname;
    
    // Show search on product-related pages
    const productPages = [
      '/',                    // Home page
      '/search',              // Search page
      '/category',            // Category pages
      '/subcategory',         // Subcategory pages
      '/product',             // Product pages
      '/shops',              // Shops page
      '/hot-deals',          // Hot deals page
    ];
    
    // Hide search on user account/dashboard pages
    const dashboardPages = [
      '/user-menu-mobile',    // Mobile user menu
      '/dashboard',           // Dashboard pages
      '/chat',               // Chat page
      '/checkout',           // Checkout
      '/cart',               // Cart page
      '/login',              // Auth pages
      '/register',
      '/forgot-password',
      '/reset-password',
      '/otp-verification',
    ];
    
    // Check if current path starts with any dashboard page
    const isDashboardPage = dashboardPages.some(page => path.startsWith(page));
    
    // Check if current path starts with any product page or contains product-related segments
    const isProductPage = productPages.some(page => path.startsWith(page)) || 
                         path.includes('/category/') || 
                         path.includes('/subcategory/') ||
                         path.includes('/product/') ||
                         path.includes('/shop/');
    
    return isProductPage && !isDashboardPage;
  }, [location.pathname]);
  
  // Close user menu when route changes
  useEffect(() => {
    setOpenUserMenu(false);
    setOpenCartSection(false); // Also close cart when route changes
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
      
      // For cart - exclude the cart button from closing the cart
      if (cartRef.current && !cartRef.current.contains(event.target) && 
          cartButtonRef.current && !cartButtonRef.current.contains(event.target)) {
        setOpenCartSection(false);
      }
    };

    if (openUserMenu || openCartSection) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openUserMenu, openCartSection]);

  // Simple handlers for opening cart
  const handleCartToggle = () => {
    setOpenCartSection(!openCartSection);
  };

  const redirectToLoginpage = () => {
    navigate("/login");
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleCloseCart = () => {
    setOpenCartSection(false);
  };

  return (
    <header className="h-16 lg:h-20 shadow-eco fixed left-0 right-0 z-50 bg-eco/90 backdrop-blur-md border-b border-emerald-100" style={{ top: 0, margin: 0, padding: 0 }}>
      <div className="h-full container mx-auto flex items-center px-2 lg:px-4 justify-between gap-2 lg:gap-4">
        {/* Logo section with improved visibility */}
        <div className="h-full flex items-center">
          <Link to={"/"} onClick={handleCloseUserMenu} className="h-full flex justify-center items-center gap-1 lg:gap-2">
            <img
              src={dp}
              alt="logo"
              height={170}
              width={60}
              className="hidden lg:block drop-shadow-md"
            />
            <img
              src={dp}
              alt="logo"
              height={170}
              width={40}
              className="lg:hidden drop-shadow-md"
            />
            <span className="text-xl lg:text-2xl font-bold text-emerald-700 tracking-wide hidden md:block">EcoMarket</span>
          </Link>
        </div>

        {/* Main navigation - enhanced for desktop */}
        <div className="hidden lg:flex flex-1 items-center justify-between max-w-4xl mx-auto">
          {/* Primary navigation links with visual cues */}
          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className={`font-medium text-base hover:text-emerald-700 transition-colors ${
                location.pathname === '/' ? 'text-emerald-700 font-semibold' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shops"
              className={`flex items-center gap-2 font-medium text-base hover:text-emerald-700 transition-colors ${
                location.pathname.includes('/shop') ? 'text-emerald-700 font-semibold' : 'text-gray-700'
              }`}
            >
              <FaStore size={16} />
              <span>Shops</span>
            </Link>
            <Link
              to="/hot-deals"
              className={`font-medium text-base hover:text-emerald-700 transition-colors ${
                location.pathname.includes('/hot-deals') ? 'text-emerald-700 font-semibold' : 'text-gray-700'
              }`}
            >
              Hot Deals
            </Link>
          </nav>

          {/* search - with improved positioning and visibility */}
          {shouldShowSearch && (
            <div className="w-full max-w-md">
              <Search />
            </div>
          )}
        </div>

        {/* Right section - user actions */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Mobile Notifications Button - only for authenticated users */}
          {user?._id && (
            <div className="lg:hidden">
              <NotificationPanel isMobile={true} />
            </div>
          )}

          {/* Mobile Auth Button - only for unauthenticated users */}
          {!user?._id && location.pathname !== '/login' && (
            <button
              onClick={redirectToLoginpage}
              className="lg:hidden text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-full transition-colors font-medium text-sm"
              aria-label="Login"
            >
              Login
            </button>
          )}

          {/* Desktop Only - enhanced layout */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Notifications - only for authenticated users */}
            {user?._id && (
              <NotificationPanel isMobile={false} />
            )}

            {/* User Account - improved visibility */}
            {user?._id ? (
              <div className="relative" ref={userMenuRef}>
                <div
                  onClick={() => setOpenUserMenu((prev) => !prev)}
                  className="flex select-none items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </span>
                  <p className="max-w-[100px] truncate">{user.name}</p>
                  {openUserMenu ? <GoTriangleUp size={16} /> : <GoTriangleDown size={16} />}
                </div>
                {openUserMenu && (
                  <div className="absolute right-0 top-12 z-50">
                    <div className="bg-white rounded-lg shadow-eco p-4 min-w-52">
                      <UserMenu close={handleCloseUserMenu} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              location.pathname !== '/login' && (
                <button
                  onClick={redirectToLoginpage}
                  className="px-4 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium transition-colors flex items-center gap-2"
                >
                  <span>Login</span>
                </button>
              )
            )}

            {/* Cart button - with improved visual feedback */}
            <button
              onClick={handleCartToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                openCartSection 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              ref={cartButtonRef}
            >
              <FaCartPlus size={18} className="flex-shrink-0" />
              <div className="font-medium text-center">
                {cartItem[0] ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-emerald-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalQty}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </div>
                ) : (
                  <span>Cart</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* search for mobile - only show on product-related pages */}
      {shouldShowSearch && isMobile && (
        <div className="absolute top-full left-0 right-0 bg-eco/90 backdrop-blur-md border-b border-emerald-100 py-1 z-40">
          <div className="container mx-auto px-2">
            <Search />
          </div>
        </div>
      )}
      
      {/* Cart dropdown with enhanced styling */}
      {openCartSection && (
        <div className="absolute right-4 top-20 z-50" ref={cartRef}>
          <DisplayCartItem close={handleCloseCart}/>
        </div>
      )}
    </header>
  );
});

export default Header;
