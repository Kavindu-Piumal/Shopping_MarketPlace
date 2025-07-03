import React, { useState } from "react";
import { useSelector } from "react-redux";
import AddAddress from "../components/AddAddress";
import { MdDelete, MdEdit } from "react-icons/md";
import EditAddressDetails from "../components/EditAddressDetails";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { data } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { useGlobalcontext } from "../provider/globaleProvider";
import DashboardMobileLayout from "../components/DashboardMobileLayout";

const Addresses = () => {
  const { showSuccess, axiosNotificationError } = useNotification();
  const addressList = useSelector((state) => state.addresses.addressList);
  const [openAddress, setOpenAddress] = useState(false);
  const [editopen, setEditOpen] = useState(false);
  const [editdata, setEditData] = useState({});
  const {fetchAddress} = useGlobalcontext();

  const handleDisableAddress = async (id) => {
    try{
      const response = await Axios({
        url: summaryApi.disableAddress.url,
        method: summaryApi.disableAddress.method,
        data: { _id: id }
      })

        if (response.data.success) {
        // Optionally, you can update the state to reflect the change
        showSuccess("Address disabled successfully");
        // You might want to refetch the address list or update it in the state
        if (fetchAddress) {
          fetchAddress();
        }
      }
       

    }catch (error) {
      axiosNotificationError(error);
      console.error("Error disabling address:", error);
    }
  }

  return (
    <DashboardMobileLayout>
      <section className="bg-gradient-to-br from-green-50 via-emerald-100 to-lime-50 py-4 px-2">
        <div className="max-w-5xl mx-auto">
        {/* Header with improved layout since no search bar */}
        <div className="bg-white/90 p-4 md:p-6 rounded-xl shadow-lg mb-4 border border-emerald-100">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4m-8 0v10m0 0a4 4 0 01-4-4H4m8 4a4 4 0 004-4h4" />
            </svg>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-emerald-800 tracking-tight">Your Addresses</h1>
              <p className="text-sm text-emerald-600 mt-1">Manage your delivery addresses</p>
            </div>
          </div>
          <button
            className="border border-emerald-300 bg-emerald-100 text-emerald-800 px-5 py-2 rounded-lg font-semibold shadow hover:bg-emerald-200 transition w-full sm:w-auto"
            onClick={() => setOpenAddress(true)}
          >
            + Add New Address
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {addressList.map((address, index) => {
            return (
              <div
                key={index}
                className={`border border-emerald-200 bg-white/90 gap-2 p-4 rounded-xl shadow-md hover:shadow-emerald-200 transition flex flex-col justify-between min-h-[170px] relative ${!address.status && 'hidden'}`}
              >
                <div className="mb-2">
                  <p className="font-semibold text-emerald-900 text-lg mb-1">{address.address_line}</p>
                  <p className="text-emerald-700">{address.city}, {address.state}</p>
                  <p className="text-emerald-600">{address.pincode}</p>
                  <p className="text-emerald-600">{address.country}</p>
                  <p className="text-xs text-emerald-500 mt-1">Mobile: {address.mobile}</p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setEditOpen(true);
                      setEditData(address);
                    }}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-300 font-medium transition"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button onClick={()=>handleDisableAddress(address._id)} className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg border border-red-200 font-medium transition">
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            );
          })}
          <div
            onClick={() => setOpenAddress(true)}
            className="h-40 cursor-pointer bg-white/80 border-2 border-dashed border-emerald-300 flex flex-col justify-center items-center rounded-xl hover:bg-emerald-50 transition"
          >
            <span className="text-emerald-400 text-3xl font-bold">+</span>
            <span className="text-emerald-700 font-medium">Add Address</span>
          </div>
        </div>
        {openAddress && (<AddAddress close={() => setOpenAddress(false)} />)}
        {editopen && (
          <EditAddressDetails
            data={editdata}
            close={() => setEditOpen(false)}
          />
        )}
      </div>
    </section>
    </DashboardMobileLayout>
  );
};

export default Addresses;
