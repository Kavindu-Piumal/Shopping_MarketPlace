import React, { useEffect, useRef } from "react";
import react from "../assets/react.svg";
import Search from "./Search";
import { Link } from "react-router-dom";
import { SlUserUnfollow } from "react-icons/sl";
import useMobile from "../hooks/useMobile";
import { useLocation } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { useState } from "react";
import UserMenu from "./UserMenu";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { useGlobalcontext } from "../provider/globaleProvider";
import DisplayCartItem from "./DisplayCartItem";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const userMenuRef = useRef(null);
  // const [totalPrice,setTotalPrice]=useState(0);
  // const [totalQty,setTotalQty]=useState(0);

  const {totalPrice , totalQty} = useGlobalcontext();
  const [openCartSection, setOpenCartSection] = useState(false);

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
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openUserMenu]);


  // console.log("cartItem", cartItem);

  //console.log('store',user);

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

  //tot item price
  // useEffect(() => {
  //   const qty=cartItem.reduce((prev,current)=>{
  //       return prev + current.quantity
  //   },0)
  //   setTotalQty(qty)

  //   const Tprice = cartItem.reduce((prev,curr)=>{
  //     return prev + (curr.productId.price * curr.quantity)
  //   },0)
  //   setTotalPrice(Tprice)

  //   //console.log(Tprice)

  //   //console.log(qty)

  // },[cartItem]); 
  return (
    <header className="h-28 lg:h-20 shadow-eco sticky top-0 z-40 flex flex-col justify-center gap-1 bg-eco/90 backdrop-blur-md border-b border-emerald-100 rounded-b-eco">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center px-2 justify-between">          {/* logo */}
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

            {/* Dekstop Only */}
            <div className="hidden lg:flex items-center gap-8">              {user?._id ? (
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
};

export default Header;
