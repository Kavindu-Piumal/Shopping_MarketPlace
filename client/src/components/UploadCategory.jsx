import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import UploadImages from "../utils/UploadImage";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import { useNotification } from "../context/NotificationContext";
import axiosNotificationError from "../utils/AxiosNotificationError";
import Loading from "./Loading";

const uploadCategory = ({ close, fetchData }) => {
  const { showSuccess } = useNotification();
  const [data, setData] = useState({
    name: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
      setLoading(true);
      const response = await Axios({
        url: summaryApi.addCategory.url,
        method: summaryApi.addCategory.method,
        data: data,
      });
      const { data: responseData } = response;      if (responseData.success) {
        showSuccess(responseData.message);
        close();
        fetchData();
      }
    } catch (error) {
      axiosNotificationError(error);
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCategoryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const response = await UploadImages(file);
      // Try both, fallback to empty string
      const imageUrl =
        response?.data?.image?.url || response?.data?.image || "";

      setData((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } finally {
      setImageLoading(false);
    }
  };
  return (
    <section className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="bg-white max-w-4xl w-full p-4 rounded shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add Category</h2>
          <button onClick={close} className="w-fit block ml-auto hover:bg-red-500 hover:text-white p-1 rounded">
            <IoClose size={20} />
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
                ) : imageLoading ? (
                  <Loading />
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
                  {imageLoading ? <span>Uploading...</span> : "Upload Image"}
                </div>
                <input
                  type="file"
                  id="uploadCategoryImage"
                  className="hidden"
                  disabled={!data.name || imageLoading}
                  onChange={handleUploadCategoryImage}
                />
              </label>
            </div>
          </div>

          <button
            className={`
            ${data.name && data.image ? "bg-green-500" : "bg-red-600"}
            px-4 py-2 rounded text-white font-semibold mt-3
            `}
          >
            Add Category
          </button>
        </form>
      </div>
    </section>
  );
};

export default uploadCategory;
