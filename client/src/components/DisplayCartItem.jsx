import React from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useGlobalcontext } from "../provider/globaleProvider";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import { FaRegHandPointRight, FaCartPlus, FaHome } from "react-icons/fa";
import { useSelector } from "react-redux";
import AddtoCartButton from "./addtoCartButton";
import MobileCart from "./MobileCart";
import emptycart from "../assets/emptycart.png";
import { useNotification } from "../context/NotificationContext";

const DisplayCartItem = ({ close }) => {
  const { showError } = useNotification();
  const { notdiscountTotalPrice, totalPrice, totalQty } = useGlobalcontext();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const redirectToCheckOutPage = () => {
    if (user?._id) {
      navigate("/checkout");
      if (close) {
        close();
      }
      return;
    }
    showError("Please login to continue");
    navigate("/login");
  };

  const handleContinueShopping = () => {
    navigate("/");
    if (close) {
      close();
    }
  };

  // Check if we're on mobile (screen width less than 768px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Use dedicated mobile cart component for mobile view
  if (isMobile) {
    return <MobileCart />;
  }

  // Desktop modal view - Clean and focused
  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      {/* Desktop Header with close button */}
      <div className="flex items-center justify-between gap-3 p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-full">
            <FaCartPlus className="text-green-600" size={16} />
          </div>
          <h2 className="font-semibold text-gray-800">My Cart</h2>
          {cartItem.filter(item => item && item.productId).length > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {totalQty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => close && close()}
            className="p-2 hover:bg-red-100 active:bg-red-200 rounded-full transition-colors"
            type="button"
          >
            <IoClose size={20} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* Desktop content */}
      <div className="flex-1 overflow-y-auto">
        {cartItem.filter(item => item && item.productId).length > 0 ? (
          <>
            <div className="flex items-center rounded justify-between px-4 py-3 bg-blue-50 text-blue-600 text-sm">
              <p className="font-medium">💰 Your Total Savings</p>
              <p className="font-semibold">
                {DisplayPriceInRupees(notdiscountTotalPrice - totalPrice)}
              </p>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[300px]">
              {cartItem.filter(item => item && item.productId).map((item, index) => (
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  key={index}
                >
                  <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg p-2 shadow-sm">
                    <img
                      src={item?.productId?.image[0]}
                      className="w-full h-full object-cover rounded"
                      alt={item?.productId?.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className="font-medium text-gray-800 text-sm truncate">
                      {item?.productId?.name}
                    </h4>
                    <p className="text-gray-600 text-xs">Qty: {item.qty}</p>
                    <p className="text-green-600 font-semibold text-sm">
                      {DisplayPriceInRupees(PriceWithDiscount(item?.productId?.price, item?.productId?.discount))}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-24">
                    <AddtoCartButton data={item?.productId} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <img src={emptycart} alt="Empty Cart" className="w-24 h-24 mb-4 opacity-50" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add some products to get started</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t bg-white space-y-2">
        {cartItem.filter(item => item && item.productId).length === 0 && (
          <button 
            onClick={handleContinueShopping}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <FaHome size={16} />
            <span>Continue Shopping</span>
          </button>
        )}
        
        {cartItem.filter(item => item && item.productId).length > 0 && (
          <button 
            onClick={redirectToCheckOutPage} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <span>{DisplayPriceInRupees(totalPrice)}</span>
            <FaRegHandPointRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default DisplayCartItem;
