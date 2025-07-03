import React, { useEffect, useState } from "react";
import { useGlobalcontext } from "../provider/globaleProvider";
import Axios from "../utils/Axios";
import { useNotification } from "../context/NotificationContext";
import { useAxiosNotificationError } from "../utils/AxiosNotificationError";
import summaryApi from "../common/summaryApi";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { HiOutlineMinus } from "react-icons/hi2";
import { PiPlusBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const AddtoCartButton = ({ data }) => {
  const { fetchCartItem, UpdateCartItem, deleteCartItem } = useGlobalcontext();
  const [loading, setLoading] = useState(false);
  const [increaseLoading, setIncreaseLoading] = useState(false);
  const [decreaseLoading, setDecreaseLoading] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemDetails] = useState();  const [lastToastTime, setLastToastTime] = useState(0);
  const navigate = useNavigate();
  const { showSuccess, showCustom, showError, removeNotificationsByCategory } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  // Function to show login notification with replacement of previous login notifications
  const showLoginNotification = () => {
    // Remove any existing login notifications first
    removeNotificationsByCategory('login-required');
    
    showCustom({
      type: 'warning',
      category: 'login-required', // Add category for easy identification
      title: 'Login Required',
      message: 'Please login to add items to cart',
      customContent: (
        <button
          onClick={() => navigate("/login")}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-all duration-200 transform hover:scale-105 mt-2"
        >
          Login
        </button>
      )
    });
  };const handleADDToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user?._id) {
      showLoginNotification();
      return;
    }

    // Check if user is trying to add their own product to cart
    if (data?.sellerId === user?._id) {
      showError("You cannot add your own product to cart");
      return;
    }

    try {
      setLoading(true);
      
      // Remove any existing cart operation notifications first
      removeNotificationsByCategory('cart-operation');
      
      const response = await Axios({
        url: summaryApi.addToCart.url,
        method: summaryApi.addToCart.method,
        data: {
          productId: data?._id,
          //quantity: 1,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        showSuccess(responseData.message, {
          category: 'cart-operation',
          duration: 2000
        });
        if (fetchCartItem) {
          fetchCartItem();
        }
      }
    } catch (error) {
      console.log("error", error);
      // Handle specific error for sellers trying to add own products
      if (error?.response?.data?.message === "You cannot add your own product to cart") {
        showError("You cannot add your own product to cart");
      } else {
        axiosNotificationError(error);
      }
    } finally {
      setLoading(false);
    }
  };useEffect(() => {
    // Only check cart availability for logged-in users
    if (!user?._id) {
      setIsAvailableCart(false);
      setQty(0);
      setCartItemDetails(null);
      return;
    }
    
    const checkingItem = cartItem.some(
      (item) => item.productId && item.productId._id === data._id
    );
    setIsAvailableCart(checkingItem);
    const Product = cartItem.find((item) => item.productId && item.productId._id === data._id);
    setQty(Product?.quantity);
    setCartItemDetails(Product);
  }, [data, cartItem, user?._id]);  const increaseqty = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks while loading or within 500ms
    const now = Date.now();
    if (increaseLoading || (now - lastActionTime < 500)) return;
    setLastActionTime(now);
    
    // Check if user is logged in
    if (!user?._id) {
      showLoginNotification();
      return;
    }
    
    try {
      setIncreaseLoading(true);
      
      // Remove any existing cart operation notifications first
      removeNotificationsByCategory('cart-operation');
      
      const response = await UpdateCartItem(cartItemDetails?._id, qty + 1);
      if(response.success){
        showSuccess("Item quantity updated", {
          category: 'cart-operation',
          duration: 2000
        });
      }
    } catch (error) {
      console.error("Error increasing quantity:", error);
      axiosNotificationError(error);
    } finally {
      setIncreaseLoading(false);
    }
  };  const decreaseqty = async(e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple clicks while loading or within 500ms
    const now = Date.now();
    if (decreaseLoading || (now - lastActionTime < 500)) return;
    setLastActionTime(now);

    // Check if user is logged in
    if (!user?._id) {
      showLoginNotification();
      return;
    }

    try {
      setDecreaseLoading(true);
      
      // Remove any existing cart operation notifications first
      removeNotificationsByCategory('cart-operation');

      // Always call UpdateCartItem, let backend handle qty=0 as delete
      const response = await UpdateCartItem(cartItemDetails?._id, qty === 1 ? 0 : qty - 1);
      if(response.success){
        showSuccess("Item Removed from cart", {
          category: 'cart-operation', // Add category for replacement
          duration: 2000 // Shorter duration for cart operations
        });
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      axiosNotificationError(error);
    } finally {
      setDecreaseLoading(false);
    }
  };
  return (
    <div className="w-full max-w-[180px] lg:max-w-[150px]">
      {/* Check if user is the seller of this product */}
      {data?.sellerId === user?._id ? (
        <button
          disabled
          className="bg-gray-400 text-white px-3 py-2 rounded-lg cursor-not-allowed opacity-60 text-sm w-full h-8 flex items-center justify-center"
          title="You cannot purchase your own product"
        >
          Your Product
        </button>
      ) : isAvailableCart ? (
        <div className="flex items-center justify-center rounded-lg h-8 w-24 sm:w-auto add-to-cart-container">
          <button
            onClick={decreaseqty}
            disabled={decreaseLoading || increaseLoading}
            className={`text-white w-8 h-8 flex items-center justify-center transition-all duration-200 border-none outline-none flex-shrink-0 rounded-l-md ${
              decreaseLoading || increaseLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
          >
            <HiOutlineMinus size={14} />
          </button>
          <div className="bg-white text-center w-8 text-xs font-semibold text-gray-700 border-none h-8 flex items-center justify-center flex-shrink-0">{qty}
          </div>
          <button
            onClick={increaseqty}
            disabled={increaseLoading || decreaseLoading}
            className={`text-white w-8 h-8 flex items-center justify-center transition-all duration-200 border-none outline-none flex-shrink-0 rounded-r-md ${
              increaseLoading || decreaseLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
          >
            <PiPlusBold size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleADDToCart}
          className="w-full bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 text-xs font-medium h-8 flex items-center justify-center"
        >
          {loading ? <Loading /> : "Add to Cart"}
        </button>
      )}
    </div>
  );
};

export default AddtoCartButton;
