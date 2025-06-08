import React, { use } from "react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import UploadImages from "../utils/UploadImage";
import { useSelector } from "react-redux";
import Loading from "./Loading";

import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import toast from "react-hot-toast";

const UploadSubCategoryModel = ({ close, fetchSubCategory }) => {
  const [subCategoryData, setSubCategoryData] = useState({
    name: "",
    image: "",
    category: [],
  });
  const [imageloading, setImageLoading] = useState(false);

  const allCategory = useSelector((state) => state.product.allCategory);
  //console.log("allCategory", allCategory);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    setImageLoading(true);
    const response = await UploadImages(file);
    console.log("response", response);

    // Try both, fallback to empty string
    const imageUrl = response?.data?.image?.url || response?.data?.image || "";

    setSubCategoryData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
    setImageLoading(false);
  };
  //console.log("handleUploadSubCategoryImage", subCategoryData);

  const handleRemoveCategorySelected = (categoryId) => {
    const index = subCategoryData.category.findIndex(
      (el) => el._id === categoryId
    );
    const newSubCategoryData = subCategoryData.category.splice(index, 1);
    setSubCategoryData((prev) => {
      return {
        ...prev,
      };
    });
  };

  const handleSubmitSubCategory = async (e) => {
    try {
      e.preventDefault();
      const response = await Axios({
        url: summaryApi.createSubCategory.url,
        method: summaryApi.createSubCategory.method,
        data: subCategoryData,
      });

      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchSubCategory) fetchSubCategory();
        close();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 bg-black bg opacity-80 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-2xl border border-green-300 relative animate-fadeIn">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h1 className="text-xl font-bold text-green-700">Add Sub Category</h1>
          <button
            onClick={close}
            className="text-neutral-800 hover:bg-green-100 p-1 rounded-full transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmitSubCategory}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              id="name"
              name="name"
              value={subCategoryData.name}
              onChange={handleChange}
              placeholder="Enter subcategory name"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Add Image</p>
            <div className="flex gap-4 flex-col lg:flex-row items-center">
              <div className="border h-36 w-full lg:w-36 bg-green-100 flex items-center justify-center rounded shadow-inner">
                {imageloading ? (
                  <Loading />
                ) : !subCategoryData.image ? (
                  <p className="text-sm text-neutral-800">No Image</p>
                ) : (
                  <img
                    src={subCategoryData.image}
                    alt="subCategory"
                    className="object-contain h-full w-full rounded"
                  />
                )}
              </div>
              <label htmlFor="uploadSubCategoryImage">
                <div className="px-4 py-2 cursor-pointer border border-green-400 text-white bg-green-500 hover:bg-green-600 rounded transition font-semibold text-sm">
                  Upload Image
                </div>
                <input
                  type="file"
                  id="uploadSubCategoryImage"
                  className="hidden"
                  onChange={handleUploadSubCategoryImage}
                  disabled={imageloading}
                />
              </label>
            </div>
          </div>
          <div className="border rounded focus-within:border-green-400 p-2 bg-gray-50">
            {/* Display Value */}
            <div className="flex flex-wrap gap-2">
              {subCategoryData.category.map((cat, index) => {
                return (
                  <div
                    key={cat._id + "selectedValue"}
                    className="bg-white shadow-md px-1 m-1"
                  >
                    {cat.name}
                    <div
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleRemoveCategorySelected(cat._id)}
                    >
                      <IoClose />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Select Category */}

            <select
              className="w-full p-2 bg-white rounded outline-none"
              onChange={(e) => {
                const value = e.target.value;
                const categoryDetails = allCategory.find(
                  (category) => category._id === value
                );
                setSubCategoryData((prev) => {
                  return {
                    ...prev,
                    category: [...prev.category, categoryDetails],
                  };
                });
              }}
            >
              <option value="">Select Category</option>

              {allCategory.map((category) => (
                <option key={category._id} value={category?._id}>
                  {category?.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={
              !subCategoryData.name ||
              !subCategoryData.image ||
              !subCategoryData.category[0]
            }
            className={`px-4 py-2 rounded text-white font-semibold transition
    ${
      subCategoryData.name &&
      subCategoryData.image &&
      subCategoryData.category[0]
        ? "bg-green-500 hover:bg-green-600 cursor-pointer"
        : "bg-red-600 cursor-not-allowed opacity-60"
    }`}
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default UploadSubCategoryModel;
