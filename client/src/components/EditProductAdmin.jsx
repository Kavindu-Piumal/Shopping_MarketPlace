import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import UploadImages from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage"; // Import the correct ViewImage component
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { MdDeleteOutline } from "react-icons/md";
import AddField from "../components/AddField";
import { useNotification } from "../context/NotificationContext";
import successAlert from "../utils/SuccessAlert";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import { IoClose } from "react-icons/io5";

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
  });

  const [imageloading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector((state) => state.product.allCategory);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const allSubCategory = useSelector((state) => state.product.allSubCategory);
  const [openaddfield, setOpenAddField] = useState(false);
  const [fieldname, setFieldName] = useState("");

  // Initialize selected category and subcategory when component mounts
  useEffect(() => {
    console.log("🔍 Debug - Product data categories:", data.category);
    console.log("🔍 Debug - Product data subcategories:", data.subCategory);
    console.log("🔍 Debug - Available categories from Redux:", allCategory);
    console.log("🔍 Debug - Available subcategories from Redux:", allSubCategory);

    // Convert category IDs to full objects for display
    if (
      allCategory &&
      allCategory.length > 0 &&
      data.category &&
      data.category.length > 0
    ) {
      const categoryObjects = data.category
        .map((categoryId) => {
          const foundCategory = allCategory.find((cat) => cat._id === categoryId);
          if (!foundCategory) {
            console.warn("⚠️ Category not found for ID:", categoryId);
          }
          return foundCategory;
        })
        .filter(Boolean); // Remove any undefined values

      if (categoryObjects.length > 0) {
        console.log("✅ Converting category IDs to objects:", categoryObjects);
        setData((prev) => ({
          ...prev,
          category: categoryObjects,
        }));

        // Set dropdown to first category
        setSelectedCategory(categoryObjects[0]._id);
      }
    }

    // Convert subcategory IDs to full objects for display
    if (
      allSubCategory &&
      allSubCategory.length > 0 &&
      data.subCategory &&
      data.subCategory.length > 0
    ) {
      console.log("🔍 Looking for subcategory IDs:", data.subCategory);
      console.log("🔍 In available subcategories:", allSubCategory.map(sub => ({ id: sub._id, name: sub.name })));

      const subCategoryObjects = data.subCategory
        .map((subCategoryId) => {
          const foundSubCategory = allSubCategory.find((subCat) => subCat._id === subCategoryId);
          if (!foundSubCategory) {
            console.warn("⚠️ Subcategory not found for ID:", subCategoryId);
            console.warn("⚠️ Available subcategory IDs:", allSubCategory.map(sub => sub._id));
          }
          return foundSubCategory;
        })
        .filter(Boolean); // Remove any undefined values

      if (subCategoryObjects.length > 0) {
        console.log("✅ Converting subcategory IDs to objects:", subCategoryObjects);
        setData((prev) => ({
          ...prev,
          subCategory: subCategoryObjects,
        }));

        // Set dropdown to first subcategory
        setSelectedSubCategory(subCategoryObjects[0]._id);
      } else {
        console.warn("❌ No matching subcategories found! Product subcategory IDs may be invalid.");
      }
    }
  }, [allCategory, allSubCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageLoading(true);

    const uploadedImages = [];
    for (const file of files) {
      const response = await UploadImages(file);
      const imageUrl =
        response?.data?.image?.url ||
        response?.data?.image ||
        response?.data?.url ||
        "";
      if (imageUrl) uploadedImages.push(imageUrl);
    }

    setData((prev) => ({
      ...prev,
      image: [...prev.image, ...uploadedImages],
    }));
    setImageLoading(false);
  };

  const handleDeleteImage = (index) => {
    setData((prev) => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1);
    setData((prev) => {
      return {
        ...prev,
      };
    });
  };

  const handleRemovesubCategory = async (index) => {
    data.subCategory.splice(index, 1);
    setData((prev) => {
      return {
        ...prev,
      };
    });
  };

  const handleAddField = () => {
    setData((prev) => {
      return {
        ...prev,
        more_details: {
          ...prev.more_details,
          [fieldname]: "",
        },
      };
    });
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("data", data);
    try {
      const response = await Axios({
        url: summaryApi.updateProductDetails.url,
        method: summaryApi.updateProductDetails.method,
        data: data,
      });
      const { data: responseData } = response;
      console.log("responseData", responseData);
      if (responseData.success) {
        successAlert(responseData.message);
        if (close) {
          close();
        }
        // Reset form data
        fetchProductData();
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
        });
      }
    } catch (error) {
      console.log("Error in handleSubmit:", error);
      axiosNotificationError(error);
    }
  };

  return (
    <section className="fixed p-4 top-0 left-0 right-0 bottom-0 bg-black z-50 bg opacity-90">
      <div className="bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[90vh]">
        <section>
          <div className="p-2  font-semibold bg-white shadow-md flex items-center justify-between">
            <h2>Upload Products</h2>
            <button onClick={close}>
              <IoClose />
            </button>
          </div>
          <div className="max-w-4xl w-full p-4">
            <form className="grid gap-3 p-4" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label htmlFor="name" className="font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Product Name"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  required
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="description" className="font-medium">
                  Description
                </label>
                <textarea
                  type="text"
                  id="description"
                  placeholder="Product Description"
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              <div>
                <p className="font-medium">Image</p>
                <div>
                  <label
                    htmlFor="productImage"
                    className="bg-blue-200 h-24 cursor-pointer  border border-blue-100 rounded flex items-center justify-center"
                  >
                    <div className="text-center flex flex-col items-center justify-center">
                      {imageloading ? (
                        <Loading />
                      ) : (
                        <>
                          <FaCloudUploadAlt size={30} />
                          <p>Upload</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="productImage"
                      className="hidden"
                      onChange={handleUploadImage}
                      accept="image/*"
                      multiple
                    />
                  </label>

                  {/* Display Uploaded Images */}
                  <div className=" flex gap-2 flex-wrap">
                    {data.image.map((img, index) => {
                      if (!img) return null;
                      return (
                        <div
                          key={img + index}
                          className="h-20 w-20 min-w-20 relative group mt-1"
                        >
                          <img
                            src={img}
                            alt={img}
                            className="w-full h-full object-scale-down cursor-pointer"
                            onClick={() => {
                              setViewImageURL(img);
                            }}
                          />
                          <div
                            onClick={() => handleDeleteImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer hidden group-hover:block"
                          >
                            <MdDelete />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="font-medium">Category</label>
                <div>
                  <select
                    className="w-full p-2 bg-white rounded outline-none"
                    value={selectedCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const category = allCategory.find(
                        (el) => el._id === value
                      );
                      setData((prev) => {
                        // Prevent duplicate
                        if (prev.category.some((cat) => cat._id === value))
                          return prev;
                        return {
                          ...prev,
                          category: [...prev.category, category],
                        };
                      });
                      setSelectedCategory("");
                    }}
                  >
                    <option value={""}>Select Category</option>
                    {allCategory.map((c, index) => {
                      return (
                        <option key={c._id + index} value={c._id}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.category.map((c, index) => {
                      return (
                        <div
                          key={c._id + index + "productsection"}
                          className="text-sm flex items-center gap-1 bg-green-300"
                        >
                          <p>{c.name}</p>
                          <div
                            className="text-red-300 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveCategory(index)}
                          >
                            <MdDeleteOutline size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="font-medium"> Sub Category</label>
                <div>
                  <select
                    className="w-full p-2 bg-white rounded outline-none"
                    value={selectedSubCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const subcategory = allSubCategory.find(
                        (el) => el && el._id === value
                      );
                      if (!subcategory) return; // Prevent adding undefined
                      setData((prev) => {
                        // Prevent duplicate
                        if (
                          prev.subCategory.some(
                            (sub) => sub && sub._id === value
                          )
                        )
                          return prev;
                        return {
                          ...prev,
                          subCategory: [...prev.subCategory, subcategory],
                        };
                      });
                      setSelectedSubCategory("");
                    }}
                  >
                    <option value={""}>Select Sub Category</option>
                    {allSubCategory.map((sc, index) => {
                      return (
                        <option key={sc._id + index} value={sc._id}>
                          {sc.name}
                        </option>
                      );
                    })}
                  </select>

                  {/* Show selected subcategories as tags/chips */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.subCategory.map((sc, index) => {
                      if (!sc) return null;
                      // If sc is an object, use as is; if it's an ID, look up the object
                      const subCatObj = typeof sc === 'object' ? sc : allSubCategory.find(s => s._id === sc);
                      if (!subCatObj) return null;
                      return (
                        <div
                          key={subCatObj._id + index + "subcategorysection"}
                          className="text-sm flex items-center gap-1 bg-blue-200 px-2 py-1 rounded"
                        >
                          <p>{subCatObj.name}</p>
                          <div
                            className="text-red-400 cursor-pointer hover:text-red-600"
                            onClick={() => handleRemovesubCategory(index)}
                          >
                            <MdDeleteOutline size={18} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-1">
                <label htmlFor="unit" className="font-medium">
                  Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  placeholder="Product Units Kg/Litre/Pcs"
                  name="unit"
                  value={data.unit}
                  onChange={handleChange}
                  required
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="stock" className="font-medium">
                  {" "}
                  Number Of Stock
                </label>
                <input
                  type="number"
                  id="unit"
                  placeholder="Product Stock"
                  name="stock"
                  value={data.stock}
                  onChange={handleChange}
                  required
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="price" className="font-medium">
                  {" "}
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  placeholder="Product price"
                  name="price"
                  value={data.price}
                  onChange={handleChange}
                  required
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="discount" className="font-medium">
                  {" "}
                  Discount
                </label>
                <input
                  type="number"
                  id="discount"
                  placeholder="Product Discount"
                  name="discount"
                  value={data.discount}
                  onChange={handleChange}
                  required
                  className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                />
              </div>

              {Object?.keys(data?.more_details)?.map((key, index) => {
                return (
                  <div className="grid gap-1" key={key}>
                    <label htmlFor={key} className="font-medium">
                      {key}
                    </label>
                    <input
                      type="text"
                      id={key}
                      value={data?.more_details[key]}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData((prev) => {
                          return {
                            ...prev,
                            more_details: {
                              ...prev.more_details,
                              [key]: value,
                            },
                          };
                        });
                      }}
                      required
                      className="bg-green-300 p-2 border border-blue-100 outline-none rounded"
                    />
                  </div>
                );
              })}

              <div
                onClick={() => setOpenAddField(true)}
                className="inline-block bg-green-300 hover:bg-green-400 text-white py-1 px-3 w-25 cursor-pointer"
              >
                Add Fields
              </div>
              <button className="bg-yellow-300 hover:bg-yellow-400 text-white py-1 px-3 w-full cursor-pointer">
                Update
              </button>
            </form>
          </div>

          {ViewImageURL && (
            <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
          )}
          {openaddfield && (
            <AddField
              value={fieldname}
              onChange={(e) => setFieldName(e.target.value)}
              submit={handleAddField}
              close={() => setOpenAddField(false)}
            />
          )}
        </section>
      </div>
    </section>
  );
};

export default EditProductAdmin;
