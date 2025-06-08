import React, { useState } from "react";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { useGlobalcontext } from "../provider/globaleProvider";
import AddAddress from "../components/AddAddress";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { handleAdditemCart } from "../Store/cartProduct";
import { useNotification } from "../context/NotificationContext";
import { useAxiosNotificationError } from "../utils/AxiosNotificationError";

const CheckoutPage = () => {
  const { notdiscountTotalPrice, totalPrice, totalQty, cartItem } = useGlobalcontext();
  const [openaddaddress, setOpenAddAddress] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selecterAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  // console.log("addressList", addressList[selecterAddress]);
  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
        const address = addressList[selecterAddress];
      if (!address || selecterAddress === null) {
        showError("Please select an address");
        setLoading(false);
        return;
      }
      
      // cartItem is now available from context
      const response = await Axios({
        url: summaryApi.Cashondelivery.url,
        method: summaryApi.Cashondelivery.method,
        data: {
          list_items: cartItem,
          totalAmt: totalPrice,
          subTotalAmt: notdiscountTotalPrice,
          addressId: address._id,
        },
      });
      
      const { data: responseData } = response;
      if (responseData.success) {        // Clear cart in Redux and localStorage
        dispatch(handleAdditemCart([]));
        if (window.localStorage) {
          localStorage.removeItem("persist:cartItem"); // If using redux-persist
        }
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event("storage")); // Trigger redux-persist update
        }
          // Simply redirect to success page after order placement        navigate("/ordersuccesscontactshop", { state: { text: "Order Placed" } });
      } else {
        showError(responseData.message || "Order failed");
      }
    } catch (error) {
      // Use AxiosNotificationError for proper error handling
      axiosNotificationError(error);
      console.error("Order placement error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-blue-50 ">
      <div className="container mx-auto p-4 lg:flex-row flex-col flex justify-between w-full gap-3">
        <div className="bg-white p-4 rounded shadow-md w-full lg:w-2/3">
          {/* address */}
          <h3 className="text-lg font-semibold">Choose Your Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {addressList.map((address, index) => {
              return (
                <label htmlFor={"address"+index}>
                  <div key={index} className="border  gap-1  p-3 rounded mb-2 hover:bg-blue-100 cursor-pointer">
                    <div>                      <input
                      id={"address"+index}
                        type="radio"
                        name="address"
                        value={index}
                        checked={selecterAddress === index}
                        onChange={(e) => {
                          setSelectedAddress(parseInt(e.target.value));
                        }}
                        className="mr-2"
                      />
                    </div>
                    <div></div>
                    <p className="font-semibold">{address.address_line}</p>
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>{address.pincode}</p>
                    <p>{address.country}</p>
                    <p>Mobile: {address.mobile}</p>
                  </div>
                </label>
              );
            })}
            <div
              onClick={() => setOpenAddAddress(true)}
              className="h-24 cursor-pointer  bg-blue border-2 border-dashed flex justify-center items-center "
            >
              Add Address
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md w-full lg:w-1/3">
          {/* summary */}
          <h3 className="text-lg font-semibold">Summary</h3>
          <div className="bg-blue-200 p-4">
            <h3 className="font-semibold">Bill Details</h3>
            <div className="flex items-center justify-between gap-4 mt-2 ml-1">
              <p>Items Total</p>
              <p className="flex items-center gap-2">
                <span className="line-through text-neutral-400">
                  {DisplayPriceInRupees(notdiscountTotalPrice)}
                </span>
                <span>{DisplayPriceInRupees(totalPrice)}</span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2 ml-1">
              <p>Total Quantity</p>
              <p className="flex items-center gap-2">{totalQty} items</p>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2 ml-1">
              <p>Delivery Process</p>
              <p className="flex items-center gap-2">COD </p>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2 ml-1">
              <p className="font-semibold">Grand Total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>          <div className="flex items-center justify-between gap-4 mt-4">
            <button 
              onClick={handleCashOnDelivery} 
              disabled={loading || selecterAddress === null || !addressList.length} 
              className="py-2 px-4 w-full bg-green-400 rounded hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Placing Order..." : selecterAddress === null ? "Select Address to Continue" : "Cash On Delivery"}
            </button>
          </div>
        </div>
      </div>

      {openaddaddress && <AddAddress close={() => setOpenAddAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
