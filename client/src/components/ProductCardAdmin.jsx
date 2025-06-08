import React, { useState } from 'react'
import EditProductAdmin from './EditProductAdmin'
import ConfirmBox from './ConfirmBox';
import { IoClose } from 'react-icons/io5';
import summaryApi from '../common/summaryApi';
import Axios from '../utils/Axios';
import { useNotification } from '../context/NotificationContext';
import { useSelector } from "react-redux";

const ProductCardAdmin = ({data,fetchProductData}) => {
  const { showSuccess, axiosNotificationError } = useNotification();
  const user = useSelector((state) => state.user);
  const isOwner = user.role === "admin" || data.sellerId === user._id;

  const [editOpen, setEditOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const handleDeleteCancel =()=>{
    setOpenDelete(false)
  }

  const handleDelete=async()=>{

     try{
      const response = await Axios({
        url: summaryApi.deleteProductDetails.url,
        method: summaryApi.deleteProductDetails.method,
        data:{
         _id: data._id
      }
      
    })

    const { data: responseData } = response;    if(responseData.success){
      showSuccess(responseData.message);
      if(fetchProductData) {
        fetchProductData();
      }
      setOpenDelete(false);

    }


    }catch(error){
      console.log("error", error);
      axiosNotificationError(error)
    }
  }

  return (
    <div className="w-full max-w-xs bg-white/90 shadow-lg rounded-xl flex flex-col items-center justify-between border border-emerald-100 hover:shadow-emerald-200 transition group overflow-hidden">
      <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-100">
        <img
          src={data.image[0]}
          alt={data.name}
          className="h-36 w-auto object-contain group-hover:scale-105 transition"
        />
      </div>
      <div className="w-full flex-1 flex flex-col items-center px-3 py-2">
        <p className="text-emerald-900 font-semibold text-base text-center line-clamp-2 mb-1">{data?.name}</p>
        <p className="text-xs text-emerald-600 mb-2">{data?.unit}</p>
        {isOwner && (
          <div className="flex gap-2 w-full justify-center mt-2">
            <button onClick={() => setEditOpen(true)} className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 text-xs font-medium transition">Edit</button>
            <button onClick={() => setOpenDelete(true)} className="px-3 py-1 rounded bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 text-xs font-medium transition">Delete</button>
          </div>
        )}
      </div>
      {/* Modals */}
      {editOpen && (
        <EditProductAdmin fetchProductData={fetchProductData} data={data} close={() => setEditOpen(false)} />
      )}
      {openDelete && (
        <section className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-semibold text-emerald-800 text-lg">Permanent Delete</h3>
              <button onClick={() => setOpenDelete(false)} className="text-emerald-500 hover:text-emerald-700"><IoClose size={22} /></button>
            </div>
            <p className="my-2 text-emerald-700">Are you sure you want to delete this product?</p>
            <div className="flex items-center gap-3 ml-auto justify-end mt-4">
              <button onClick={handleDeleteCancel} className="px-4 py-1 rounded border border-emerald-300 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium transition">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-1 rounded border border-red-300 bg-red-400 hover:bg-red-500 text-white font-medium transition">Delete</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductCardAdmin