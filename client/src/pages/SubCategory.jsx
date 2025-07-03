import React, { use } from "react";
import { useState } from "react";
import Axios from "../utils/Axios";
import UploadSubCategoryModel from "../components/UploadSubCategoryModel";
import DisplayTable from "../components/DisplayTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect } from "react";
import { useNotification } from "../context/NotificationContext";
import summaryApi from "../common/summaryApi";
import ViewImage from "../components/ViewImage";
import {LuPencil} from "react-icons/lu";
import { MdAutoDelete } from "react-icons/md";
import EditSubCategory from "../components/EditSubCategory";
import ConfirmBox from "../components/ConfirmBox";
import { useSelector } from "react-redux";
import DashboardMobileLayout from "../components/DashboardMobileLayout";


const SubCategory = () => {
  const { axiosNotificationError, showSuccess } = useNotification();
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const columnHelper = createColumnHelper();
  const [imageUrl, setImageUrl] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteSubCategory,setdeleteSubCategory] = useState({
    _id: "",
  }); 
  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
  });
  const user = useSelector((state) => state.user);
  const fetchSubCategory = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getSubCategory.url,
        method: summaryApi.getSubCategory.method,
      });
      const { data: responseData } = response;
      //console.log("SubCategory API response:", responseData); // <-- Add here
      if (responseData.success) {
        setData(responseData.subCategory);
        console.log("SubCategory data set:", responseData.subCategory); // <-- Add here
      }    } catch (error) {
      //console.log("SubCategory fetch error:", error); // <-- Add here
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategory();
  }, []);

  const column = [
    columnHelper.accessor("name", {
      header: "Name",
    }),

    columnHelper.accessor("image", {
      header: "Image",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 justify-center">
            <img
              src={row.original.image}
              alt={row.original.image}
              className="w-12 h-12 rounded-full cursor-pointer border-2 border-emerald-200 shadow hover:scale-105 hover:border-emerald-400 transition"
              onClick={() => {
                setImageUrl(row.original.image);
              }}
            />
          </div>
        );
      },
    }),

    columnHelper.accessor("category", {
      header: "Category",
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {row.original.category.map((c, index) => (
              <span key={c._id+"table"} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">{c.name}</span>
            ))}
          </div>
        );
      }
    }),
    // Only show Action column for admin or for sellers who are the creator
    ...((user.role === "admin" || user.role === "seller")
      ? [
          columnHelper.accessor("_id", {
            header: "Action",
            cell: ({ row }) => {
              const isOwner = user.role === "admin" || row.original.createdBy === user._id;
              if (isOwner) {
                return (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setOpenEdit(true);
                        setEditData(row.original);
                      }}
                      className="p-2 bg-emerald-100 rounded-full text-emerald-700 border border-emerald-300 hover:bg-emerald-200 hover:text-emerald-900 transition"
                    >
                      <LuPencil />
                    </button>
                    <button
                      onClick={() => {
                        setOpenConfirmBoxDelete(true);
                        setdeleteSubCategory(row.original);
                      }}
                      className="p-2 bg-red-100 rounded-full text-red-600 border border-red-200 hover:bg-red-200 hover:text-red-900 transition"
                    >
                      <MdAutoDelete />
                    </button>
                  </div>
                );
              } else if (user.role === "seller") {
                return <div className="text-emerald-400 text-center">Added Seller Only</div>;
              } else {
                return null;
              }
            },
          }),
        ]
      : []),
  ];

  const handleDeleteSubCategory = async () => {
    try{
      const response = await Axios({
        url: summaryApi.deleteSubCategory.url,
        method: summaryApi.deleteSubCategory.method,
        data: {_id:deleteSubCategory._id}
      });
      const { data: responseData } = response;      if (responseData.success) {
        fetchSubCategory();
        setOpenConfirmBoxDelete(false);
        setdeleteSubCategory({_id: ""});
        showSuccess(responseData.message);
      }
    }catch(error){
      axiosNotificationError(error)
    };
}

  // Mobile Card Component for SubCategories
  const SubCategoryCard = ({ subCategory }) => {
    const isOwner = user.role === "admin" || subCategory.createdBy === user._id;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
        <div className="flex items-start space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={subCategory.image}
              alt={subCategory.name}
              className="w-16 h-16 rounded-full cursor-pointer border-2 border-emerald-200 shadow hover:scale-105 hover:border-emerald-400 transition object-cover"
              onClick={() => setImageUrl(subCategory.image)}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{subCategory.name}</h3>
                
                {/* Categories */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {subCategory.category.map((c, index) => (
                      <span 
                        key={c._id + "card"} 
                        className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              {(user.role === "admin" || user.role === "seller") && (
                <div className="flex space-x-2 ml-4">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => {
                          setOpenEdit(true);
                          setEditData(subCategory);
                        }}
                        className="p-2 bg-emerald-100 rounded-full text-emerald-700 border border-emerald-300 hover:bg-emerald-200 hover:text-emerald-900 transition"
                        title="Edit"
                      >
                        <LuPencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setOpenConfirmBoxDelete(true);
                          setdeleteSubCategory(subCategory);
                        }}
                        className="p-2 bg-red-100 rounded-full text-red-600 border border-red-200 hover:bg-red-200 hover:text-red-900 transition"
                        title="Delete"
                      >
                        <MdAutoDelete size={16} />
                      </button>
                    </>
                  ) : user.role === "seller" ? (
                    <div className="text-emerald-400 text-xs text-center px-2 py-1">
                      Added by<br/>Seller Only
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardMobileLayout>
      <div className='min-h-screen bg-gray-50'>
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Sub Categories</h2>
            <button
              onClick={() => setOpenAddSubCategory(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
            >
              Add Sub Category
            </button>
          </div>
          
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <DisplayTable data={data} columns={column} />
            </div>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="md:hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
              </div>
            ) : data.length > 0 ? (
              <div className="space-y-4">
                {data.map((subCategory) => (
                  <SubCategoryCard key={subCategory._id} subCategory={subCategory} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No sub categories found</p>
              </div>
            )}
          </div>
        </div>
      </div> {/* End scrollable content area */}

      {openAddSubCategory && (
        <UploadSubCategoryModel 
          close={() => setOpenAddSubCategory(false)} 
          fetchSubCategory={fetchSubCategory}
        />
      )}

      {
        imageUrl&&
        <ViewImage
          url={imageUrl}
          close={()=>setImageUrl("")}/>
      }

      {
        openEdit &&
        <EditSubCategory 
          data={editData} 
          close={()=>setOpenEdit(false)}
          fetchdata={fetchSubCategory}/>
      }

      {
        openConfirmBoxDelete && (
          <ConfirmBox
          cancel={()=>setOpenConfirmBoxDelete(false)}
          close={()=>setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteSubCategory}


          />
        )
      }
    </DashboardMobileLayout>
  );
};

export default SubCategory;
