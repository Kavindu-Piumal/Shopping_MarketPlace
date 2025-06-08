import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import UploadImages from "../utils/UploadImage";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import toast from "react-hot-toast";
import { useNotification } from "../context/NotificationContext";
import { useSelector } from "react-redux";

const EditCategory = ({ close, fetchData, data: CategoryData }) => {
  const { axiosNotificationError } = useNotification();
  const user = useSelector((state) => state.user);
  const isOwner =
    user.role === "admin" || CategoryData.createdBy === user._id;

  const [data, setData] = useState({
      _id: CategoryData._id,
      name: CategoryData.name,
      image: CategoryData.image,
    });
  
    const [loading, setLoading] = useState(false);
  
    const handleOnChange = (e) => {
      const { name, value } = e.target;
      setData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    };

  const handleSubmit = async (e) => {
      e.preventDefault();

  try {
      console.log("summaryApi", summaryApi);
      setLoading(true)
          const response = await Axios({
              url : summaryApi.updateCategory.url,
              method: summaryApi.updateCategory.method,
              data:data
          })
          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              close();
              fetchData();
              
          }
            } catch (error) {
          axiosNotificationError(error)
          console.log("error", error);
      }finally{
          setLoading(false)
      }
  };

  const handleUploadCategoryImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);

  const response = await UploadImages(file);
  console.log("response", response);

  setLoading(false);

  // Try both, fallback to empty string
  const imageUrl =
    response?.data?.image?.url || response?.data?.image || "";

  setData((prev) => ({
    ...prev,
    image: imageUrl,
  }));
  };

  if (!isOwner) {
    return (
      <section className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg opacity-90 flex items-center justify-center">
        <div className="bg-white max-w-4xl w-full p-4 rounded text-center">
          <h2 className="font-semibold text-red-600">
            You don't have permission to edit this category.
          </h2>
          <button
            onClick={close}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-90 flex items-center justify-center z-[60]">
          <div className="bg-white max-w-4xl w-full p-4 rounded shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Edit Category</h2>
              <button onClick={close} className="w-fit block ml-auto hover:bg-gray-100 p-1 rounded">
                <IoClose size={24} />
              </button>
            </div>
            <form className="my-3 grid gap-2 " onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label id="Category Name">Name</label>
                <input
                  type="text"
                  id="categoryName"
                  placeholder="Category Name"
                  value={data.name}
                  name="name"
                  onChange={handleOnChange}
                  className="bg-green-300 p-2 border border-blue-100 
                            focus-within:border-primary-200 outline-none rounded"
                />
              </div>
              <div className="grid gap-1">
                <p>Image</p>
                <div className="flex gap-4 flex-col lg:flex-row items-center">
                  <div className="border bg-green-100 h-36 w-full lg:w-36 rounded flex items-center justify-center">
                    {data.image ? (
                      <img
                        src={data.image}
                        alt="category"
                        className="object-scale-down h-full w-full"
                      />
                    ) : (
                      <p className="text-sm text-neutral-800">No Image</p>
                    )}
                  </div>
                  <label htmlFor="uploadCategoryImage">
                    <div
                      className={`${
                        data.name ? "bg-green-500" : "bg-red-600"
                      } px-4 py-2 rounded cursor-pointer`}
                    >
                        {
                            loading ? "Loading..." : "Upload Image"
                        }
                      
                    </div>
                    <input
                      type="file"
                      id="uploadCategoryImage"
                      className="hidden"
                      disabled={!data.name}
                      onChange={handleUploadCategoryImage}
                    />
                  </label>
                </div>
              </div>
    
              <button className={
                `
                ${data.name && data.image ? "bg-green-500" : "bg-red-600"}
                px-4 py-2 rounded text-white font-semibold mt-3
                `
              }>Update Category</button>
            </form>
          </div>
        </section>
  )
}

export default EditCategory