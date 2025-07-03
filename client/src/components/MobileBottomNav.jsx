import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaStore, FaHome, FaShoppingCart, FaUser, FaTag } from 'react-icons/fa';
import { useGlobalcontext } from '../provider/globaleProvider';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const { totalQty } = useGlobalcontext();

  // Don't show on certain pages
  const hiddenRoutes = ['/checkout', '/register']; // Removed '/login' so bottom nav shows on login page
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: FaHome,
      path: '/',
      color: 'text-blue-600'
    },
    {
      id: 'shops',
      label: 'Shops',
      icon: FaStore,
      path: '/shops',
      color: 'text-emerald-600'
    },
    {
      id: 'deals',
      label: 'Hot Deals',
      icon: FaTag,
      path: '/hot-deals',
      color: 'text-red-600',
      special: true // Special middle button
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: FaShoppingCart,
      path: '/cart',
      color: 'text-purple-600',
      badge: totalQty || 0
    },
    {
      id: 'account',
      label: 'Account',
      icon: FaUser,
      path: user?._id ? '/user-menu-mobile' : '/login',
      color: 'text-gray-600'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item) => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (item.id === 'deals') {
      // Navigate to hot deals section (we'll create this)
      navigate('/hot-deals');
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 lg:hidden"></div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.special) {
              // Special middle button with different styling
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-col items-center justify-center p-2 -mt-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="bg-white rounded-full p-3 shadow-md">
                    <Icon className="text-red-600 text-xl" />
                  </div>
                  <span className="text-xs font-medium text-white mt-1 bg-red-600/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {item.label}
                  </span>
                  {/* Hot deals indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">🔥</span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`relative flex flex-col items-center justify-center p-2 min-w-[60px] transition-all duration-200 ${
                  active 
                    ? `${item.color} scale-105` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`text-xl ${active ? 'animate-pulse' : ''}`} />
                  
                  {/* Cart badge */}
                  {item.id === 'cart' && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {active && (
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 ${item.color.replace('text-', 'bg-')} rounded-full`}></div>
                  )}
                </div>
                
                <span className={`text-xs font-medium mt-1 ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
