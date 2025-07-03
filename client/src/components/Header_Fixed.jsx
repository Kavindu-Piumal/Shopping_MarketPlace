import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import { FaCartPlus, FaStore, FaBell } from "react-icons/fa";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

import react from "../assets/react.svg";
import Search from "./Search";
import UserMenu from "./UserMenu";
import DisplayCartItem from "./DisplayCartItem";
import NotificationsMenu from "./NotificationsMenu";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { useGlobalcontext } from "../provider/globaleProvider";
import useMobile from "../hooks/useMobile";
import { useAuthContext } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

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
  const { unreadCount } = useNotifications();

  // 🎯 PROFESSIONAL: State management
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openCartSection, setOpenCartSection] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

  // 🔥 PERFORMANCE: Memoized computations
  const isSearchPage = useMemo(() => location.pathname === "/search", [location.pathname]);
  
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
    setOpenNotifications(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
      
      // For desktop notifications
      if (desktopNotificationsRef.current && !desktopNotificationsRef.current.contains(event.target) &&
          mobileNotificationsRef.current && !mobileNotificationsRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
    };

    if (openUserMenu || openNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openUserMenu, openNotifications]);

  // Additional effect to handle cart/notification mutual exclusivity
  useEffect(() => {
    // When cart opens, close notifications
    if (openCartSection && openNotifications) {
      setOpenNotifications(false);
    }
  }, [openCartSection, openNotifications]);

  useEffect(() => {
    // When notifications open, close cart  
    if (openNotifications && openCartSection) {
      setOpenCartSection(false);
    }
  }, [openNotifications, openCartSection]);

  const redirectToLoginpage = () => {
    navigate("/login");
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleCloseNotifications = () => {
    setOpenNotifications(false);
  };

  return (
    <header className="h-20 shadow-eco fixed left-0 right-0 z-50 bg-eco/90 backdrop-blur-md border-b border-emerald-100" style={{ top: 0, margin: 0, padding: 0 }}>
      <div className="h-full container mx-auto flex items-center px-2 justify-between">
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

        {/* Middle section - flexible layout based on search visibility */}
        <div className={`hidden lg:flex items-center gap-6 ${shouldShowSearch ? 'flex-1 justify-between' : 'justify-center'}`}>
          {/* Shop Link */}
          <Link
            to="/shops"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
          >
            <FaStore size={18} />
            <span>Shops</span>
          </Link>

          {/* search - only show on product-related pages */}
          {shouldShowSearch && (
            <div className="w-full max-w-lg mx-8">
              <Search />
            </div>
          )}
        </div>

        {/*login and add to cart */}
        <div className="flex items-center gap-4">
          {/* Mobile Notifications Button - only for authenticated users */}
          {user?._id && (
            <div className="relative lg:hidden" ref={mobileNotificationsRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Close cart if open when opening notifications
                  if (openCartSection) {
                    setOpenCartSection(false);
                  }
                  setOpenNotifications(!openNotifications);
                }}
                className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 p-2 rounded-full transition-colors relative"
                aria-label="Notifications"
              >
                <FaBell size={22} />
                {/* Notification Badge for mobile */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {openNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)]">
                  <div className="bg-white rounded-lg shadow-eco border border-gray-200 p-4">
                    <NotificationsMenu close={handleCloseNotifications} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Auth Button - only for unauthenticated users */}
          {!user?._id && (
            <button
              onClick={redirectToLoginpage}
              className="lg:hidden text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-full transition-colors font-medium text-sm"
              aria-label="Login"
            >
              Login
            </button>
          )}

          {/* Desktop Only */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Notifications - only for authenticated users */}
            {user?._id && (
              <div className="relative" ref={desktopNotificationsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Close cart if open when opening notifications
                    if (openCartSection) {
                      setOpenCartSection(false);
                    }
                    setOpenNotifications(!openNotifications);
                  }}
                  className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 p-2 rounded-full hover:bg-emerald-50 transition-all duration-200 relative"
                  aria-label="Notifications"
                >
                  <FaBell size={20} />
                  {/* Notification Badge - dynamic count */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {openNotifications && (
                  <div className="absolute right-0 top-12 z-50">
                    <div className="bg-white rounded-lg shadow-eco border border-gray-200 p-4">
                      <NotificationsMenu close={handleCloseNotifications} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account */}
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
              onClick={() => {
                // Close notifications if open when opening cart
                if (openNotifications) {
                  setOpenNotifications(false);
                }
                setOpenCartSection(true);
              }} 
              className="flex items-center gap-2 btn-eco px-4 py-2 text-base min-w-[140px] justify-center"
            >
              <FaCartPlus size={20} className="flex-shrink-0" />
              <div className="font-semibold text-white text-center text-sm">
                {cartItem[0] ? (
                  <div className="leading-tight">
                    <p className="text-xs">{totalQty} Items</p>
                    <p className="text-sm">{DisplayPriceInRupees(totalPrice)}</p>
                  </div>
                ) : (
                  <span className="text-sm">My Cart</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* search for mobile - only show on product-related pages */}
      {shouldShowSearch && isMobile && (
        <div className="absolute top-20 left-0 right-0 bg-eco/90 backdrop-blur-md border-b border-emerald-100 py-2">
          <div className="container mx-auto px-2">
            <Search />
          </div>
        </div>
      )}
      
      {openCartSection && (
        <DisplayCartItem close={()=>setOpenCartSection(false)}/>
      )}
    </header>
  );
});

export default Header;
