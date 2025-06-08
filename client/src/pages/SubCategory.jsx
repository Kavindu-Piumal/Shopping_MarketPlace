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

  return (
    <section>
      <div className="p-2  font-semibold bg-white shadow-md flex items-center justify-between">
        <h2>Sub Category</h2>
        <button
          onClick={() => setOpenAddSubCategory(true)}
          className="text-sm border border-primary-200 hover:bg-green-300 px-3 py-1 rounded"
        >
          Add Sub Category
        </button>
      </div>
      <div className="overflow-auto w-full max-w[95vw]">
        <DisplayTable data={data} columns={column} />
      </div>

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
    </section>
  );
};

export default SubCategory;
