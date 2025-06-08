import { createContext, use, useContext, useEffect, useState } from "react";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { handleAdditemCart } from "../Store/cartProduct";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "../context/NotificationContext";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import { handleAddAddress } from "../Store/Address.slice";
import { setOrders } from "../Store/OrderSlice";

export const Globalcontext = createContext(null);

export const useGlobalcontext = () => useContext(Globalcontext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { showSuccess, axiosNotificationError } = useNotification();
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);  const cartItem = useSelector(state => state.cartItem.cart);
  const [notdiscountTotalPrice, setNotdiscountTotalPrice] = useState(0);
  const user= useSelector(state => state.user);

  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getCartItem.url,
        method: summaryApi.getCartItem.method,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(handleAdditemCart(responseData.data));
        //console.log("Cart items fetched successfully", responseData.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateCartItem = async (id, qty) => {
    try {
      const response = await Axios({
        url: summaryApi.UpdateCartItem.url,
        method: summaryApi.UpdateCartItem.method,
        data: {
          _id: id,
          qty: qty,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        //toast.success(responseData.message);
        fetchCartItem();
        return responseData;
      }    } catch (error) {
      axiosNotificationError(error);
      return error;
    }
  };

  const deleteCartItem = async (cartId) => {
    try {
      const response = await Axios({
        url: summaryApi.deleteCartItem.url,
        method: summaryApi.deleteCartItem.method,
        data: {
          _id: cartId,
        },
      });

      const { data: responseData } = response;      if (responseData.success) {
        showSuccess(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

    useEffect(() => {
    // Only count items with valid productId
    const validCartItems = cartItem.filter(item => item && item.productId && item.productId.price !== undefined);

    const qty = validCartItems.reduce((prev, current) => {
      return prev + current.quantity;
    }, 0);
    setTotalQty(qty);

    const Tprice = validCartItems.reduce((prev, curr) => {
      return (
        prev +
        PriceWithDiscount(curr.productId.price, curr.productId.discount) *
          curr.quantity
      );
    }, 0);
    setTotalPrice(Tprice);

    const noDiscount = validCartItems.reduce((prev, curr) => {
      return (
        prev +
        curr.productId.price * curr.quantity
      );
    }, 0);
    setNotdiscountTotalPrice(noDiscount);

  }, [cartItem]);

  

  const handlelogout = () => {
    localStorage.clear();
    dispatch(handleAdditemCart([]));
    setTotalPrice(0);
    setTotalQty(0);
    setNotdiscountTotalPrice(0);
  }

  const fetchAddress = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getAddress.url,
        method: summaryApi.getAddress.method,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
        // Handle address data
        // console.log("Address fetched successfully", responseData.data);
      }    } catch (error) {
      axiosNotificationError(error);
    }
  }

  const fetchOrders = async () => {
    try{
      const response = await Axios({
        url: summaryApi.getorderDetails.url,
        method: summaryApi.getorderDetails.method,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setOrders(responseData.data));
        // Handle orders data
        // console.log("Orders fetched successfully", responseData.data);
      }    }catch(error){
      console.log("Error fetching orders", error);
      axiosNotificationError(error);
    }
  }

  

  useEffect(() => {
    if (user && user._id) {
      fetchCartItem();
      fetchAddress();
      fetchOrders();
    } else {
      // User is logged out, clear cart and totals
      dispatch(handleAdditemCart([]));
      setTotalPrice(0);
      setTotalQty(0);
      setNotdiscountTotalPrice(0);
    }
  }, [user]);
  
  return (
    <Globalcontext.Provider
      value={{
        fetchCartItem,
        UpdateCartItem,
        deleteCartItem,
        fetchAddress,
        totalPrice,
        totalQty,
        notdiscountTotalPrice,
        fetchOrders,
        cartItem // <-- Expose cartItem in context
      }}
    >
      {children}
    </Globalcontext.Provider>
  );
};

export default GlobalProvider;
