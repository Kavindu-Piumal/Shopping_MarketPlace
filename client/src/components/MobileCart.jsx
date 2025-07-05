import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalcontext } from "../provider/globaleProvider";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import { FaRegHandPointRight, FaCartPlus, FaHome } from "react-icons/fa";
import { useSelector } from "react-redux";
import AddtoCartButton from "./addtoCartButton";
import emptycart from "../assets/emptycart.png";
import { useNotification } from "../context/NotificationContext";

const MobileCart = () => {
  const { showError } = useNotification();
  const { notdiscountTotalPrice, totalPrice, totalQty } = useGlobalcontext();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const redirectToCheckOutPage = () => {
    if (user?._id) {
      navigate("/checkout");
      return;
    }
    showError("Please login to continue");
    navigate("/login");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  // Check if cart has items
  const hasItems = cartItem.filter(item => item && item.productId).length > 0;

  return (
    <div className="bg-gray-50 fixed inset-0 z-50 flex flex-col overflow-hidden">
      {hasItems ? (
        <div className="h-full flex flex-col overflow-hidden">
          {/* Mobile Header - Fixed */}
          <div className="bg-white px-4 py-2 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCartPlus className="text-green-600" size={16} />
                <h2 className="font-semibold text-gray-800 text-sm">My Cart</h2>
              </div>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {totalQty} {totalQty === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Mobile Savings Banner - Fixed */}
          <div className="bg-blue-50 mx-3 mt-2 p-2 rounded border border-blue-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 text-xs font-medium">💰 Total Savings</span>
              <span className="font-bold text-green-700 text-sm">
                {DisplayPriceInRupees(notdiscountTotalPrice - totalPrice)}
              </span>
            </div>
          </div>

          {/* Mobile Cart Items - ONLY Scrollable Section with proper height calculation */}
          <div className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <div className="space-y-2">
              {cartItem.filter(item => item && item.productId).map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-2 min-w-0">
                    {/* Product Image */}
                    <div className="w-14 h-14 bg-gray-50 rounded p-1 flex-shrink-0">
                      <img
                        src={item?.productId?.image[0]}
                        className="w-full h-full object-contain"
                        alt={item?.productId?.name}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-medium text-gray-800 text-xs mb-1 line-clamp-1 break-words">
                        {item?.productId?.name}
                      </h3>

                      {/* Price Row */}
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <span className="font-bold text-green-600 text-sm whitespace-nowrap">
                          {DisplayPriceInRupees(PriceWithDiscount(item?.productId?.price, item?.productId?.discount))}
                        </span>
                        {item?.productId?.discount > 0 && (
                          <span className="text-gray-400 line-through text-xs whitespace-nowrap">
                            {DisplayPriceInRupees(item?.productId?.price)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls and Total */}
                      <div className="flex items-center justify-between min-w-0">
                        {/* Use the working AddtoCartButton component */}
                        <div className="scale-75 origin-left ml-0.1 flex-shrink-0">
                          <AddtoCartButton data={item?.productId} />
                        </div>

                        {/* Item Total */}
                        <span className="font-semibold text-gray-800 text-xs whitespace-nowrap ml-2">
                          {DisplayPriceInRupees(PriceWithDiscount(item?.productId?.price, item?.productId?.discount) * (item.quantity || item.qty || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Order Summary - Fixed Bottom with proper spacing */}
          <div className="bg-white border-t-2 shadow-lg flex-shrink-0 overflow-hidden" style={{ minHeight: '180px' }}>
            {/* Summary */}
            <div className="px-5 py-2 bg-gray-50 border-b">
              <div className="flex justify-between text-xs mb-1">
                <span>Items ({totalQty})</span>
                <span>{DisplayPriceInRupees(notdiscountTotalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-600">Savings</span>
                <span className="text-green-600">-{DisplayPriceInRupees(notdiscountTotalPrice - totalPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t">
                <span>Total</span>
                <span className="text-green-700">{DisplayPriceInRupees(totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons with proper padding */}
            <div className="p-2 space-y-3 pb-26">
              <button
                onClick={redirectToCheckOutPage}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <FaRegHandPointRight size={12} />
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full border border-green-500 text-green-600 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-green-50"
              >
                <FaHome size={12} />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Empty Cart - Completely static, no scroll */
        <div className="h-full flex items-center justify-center overflow-hidden">
          <div className="text-center px-6 pb-20 max-w-full">
            <img src={emptycart} alt="Empty Cart" className="w-20 h-20 mb-3 opacity-60 mx-auto" />
            <h2 className="text-base font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-xs mb-4 leading-relaxed">
              Start shopping to fill it up!
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <FaHome size={14} />
              <span>Start Shopping</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCart;
