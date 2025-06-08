import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import UploadImages from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage"; // Import the correct ViewImage component
import { MdDelete } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { MdDeleteOutline } from "react-icons/md";
import AddField from "../components/AddField";
import { useNotification } from "../context/NotificationContext";
import successAlert from "../utils/SuccessAlert";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import { setAllSubCategory } from '../Store/ProductSlice';
import { setAllCategory } from '../Store/ProductSlice';

const UploadProduct = () => {
  const dispatch = useDispatch();
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState({
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

  const [imageloading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector((state) => state.product.allCategory);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const allSubCategory = useSelector((state) => state.product.allSubCategory);
  const [openaddfield, setOpenAddField] = useState(false);
  const [fieldname, setFieldName] = useState("");

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
    console.log("data",data)
    try{
      const response = await Axios({
        url: summaryApi.createProduct.url,
        method: summaryApi.createProduct.method,
        data: data,
      });
      const { data: responseData } = response;
      console.log("responseData", responseData);
      if (responseData.success) {
        successAlert(responseData.message);
        setData({
            name : "",
            image : [],
            category : [],
            subCategory : [],
            unit : "",
            stock : "",
            price : "",
            discount : "",
            description : "",
            more_details : {},
          })
      }
        
          }catch(error){
      axiosNotificationError(error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getSubCategory.url,
        method: summaryApi.getSubCategory.method,
      });
      const { data: responseData } = response;      if (responseData.success) {
        dispatch(setAllSubCategory(responseData.subCategory));
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  // Fetch categories if not present
  React.useEffect(() => {
    if (!allCategory || allCategory.length === 0) {
      const fetchCategories = async () => {
        try {
          const response = await Axios({
            url: summaryApi.getCategory.url,
            method: summaryApi.getCategory.method,
          });
          const { data: responseData } = response;          if (responseData.success) {
            dispatch(setAllCategory(responseData.data));
          }
        } catch (error) {
          axiosNotificationError(error);
        }
      };
      fetchCategories();
    }
  }, [allCategory, dispatch]);

  React.useEffect(() => {
    fetchSubCategories();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 flex flex-col items-center py-8">
      <div className="p-4 font-bold bg-white/90 shadow-lg rounded-t-xl flex items-center justify-between w-full max-w-2xl border-b border-emerald-100">
        <h2 className="text-2xl text-emerald-700 tracking-wide flex items-center gap-2">
          <span className="inline-block text-3xl">🌱</span> Upload Eco Product
        </h2>
      </div>
      <div className="max-w-2xl w-full p-6 bg-white/95 rounded-b-xl shadow-xl border border-emerald-100">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="grid gap-1">
            <label htmlFor="name" className="font-semibold text-emerald-700">
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
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* Description */}
          <div className="grid gap-1">
            <label htmlFor="description" className="font-semibold text-emerald-700">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Product Description"
              name="description"
              value={data.description}
              onChange={handleChange}
              required
              rows={3}
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <p className="font-semibold text-emerald-700 mb-1">Image</p>
            <div>
              <label
                htmlFor="productImage"
                className="bg-gradient-to-br from-emerald-100 to-lime-100 h-28 cursor-pointer border-2 border-dashed border-emerald-300 rounded-xl flex items-center justify-center hover:border-emerald-500 transition-all"
              >
                <div className="text-center flex flex-col items-center justify-center text-emerald-600">
                  {imageloading ? (
                    <Loading />
                  ) : (
                    <>
                      <FaCloudUploadAlt size={36} />
                      <p className="font-medium">Upload</p>
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
              <div className="flex gap-3 flex-wrap mt-2">
                {data.image.map((img, index) => {
                  if (!img) return null;
                  return (
                    <div
                      key={img + index}
                      className="h-24 w-24 min-w-24 relative group rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50 shadow-sm"
                    >
                      <img
                        src={img}
                        alt={img}
                        className="w-full h-full object-cover object-center cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => {
                          setViewImageURL(img);
                        }}
                      />
                      <div
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MdDelete />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid gap-1">
            <label className="font-semibold text-emerald-700">Category</label>
            <div>
              <select
                className="w-full p-3 bg-emerald-50 rounded-lg border border-emerald-200 outline-emerald-400"
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const category = allCategory.find((el) => el._id === value);
                  setData((prev) => {
                    if (prev.category.some((cat) => cat._id === value)) return prev;
                    return {
                      ...prev,
                      category: [...prev.category, category],
                    };
                  });
                  setSelectedCategory("");
                }}
              >
                <option value={""}>Select Category</option>
                {allCategory.map((c, index) => (
                  <option key={c._id + index} value={c._id}>{c.name}</option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-2">
                {data.category.map((c, index) => (
                  <div
                    key={c._id + index + "productsection"}
                    className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shadow-sm"
                  >
                    <p>{c.name}</p>
                    <div
                      className="text-red-400 cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveCategory(index)}
                    >
                      <MdDeleteOutline size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub Category Selection */}
          <div className="grid gap-1">
            <label className="font-semibold text-emerald-700">Sub Category</label>
            <div>
              <select
                className="w-full p-3 bg-emerald-50 rounded-lg border border-emerald-200 outline-emerald-400"
                value={selectedSubCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const subcategory = allSubCategory.find(
                    (el) => el && el._id === value
                  );
                  if (!subcategory) return;
                  setData((prev) => {
                    if (prev.subCategory.some((sub) => sub && sub._id === value)) return prev;
                    return {
                      ...prev,
                      subCategory: [...prev.subCategory, subcategory],
                    };
                  });
                  setSelectedSubCategory("");
                }}
              >
                <option value={""}>Select Sub Category</option>
                {(Array.isArray(allSubCategory) ? allSubCategory : []).map(
                  (c, index) =>
                    c && c._id && (
                      <option key={c._id + index} value={c._id}>{c.name}</option>
                    )
                )}
              </select>

              <div className="flex flex-wrap gap-2 mt-2">
                {data.subCategory.map((c, index) => (
                  <div
                    key={c._id + index + "productsection"}
                    className="text-xs flex items-center gap-1 bg-lime-100 text-lime-700 px-2 py-1 rounded-full shadow-sm"
                  >
                    <p>{c.name}</p>
                    <div
                      className="text-red-400 cursor-pointer hover:text-red-600"
                      onClick={() => handleRemovesubCategory(index)}
                    >
                      <MdDeleteOutline size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Input */}
          <div className="grid gap-1">
            <label htmlFor="unit" className="font-semibold text-emerald-700">
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
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* Stock Input */}
          <div className="grid gap-1">
            <label htmlFor="stock" className="font-semibold text-emerald-700">
              Number Of Stock
            </label>
            <input
              type="number"
              id="stock"
              placeholder="Product Stock"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              required
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* Price Input */}
          <div className="grid gap-1">
            <label htmlFor="price" className="font-semibold text-emerald-700">
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
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* Discount Input */}
          <div className="grid gap-1">
            <label htmlFor="discount" className="font-semibold text-emerald-700">
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
              className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          {/* More Details Fields */}
          {Object?.keys(data?.more_details)?.map((key, index) => (
            <div className="grid gap-1" key={key}>
              <label htmlFor={key} className="font-semibold text-emerald-700">{key}</label>
              <input
                type="text"
                id={key}
                value={data?.more_details[key]}
                onChange={(e) => {
                  const value = e.target.value;
                  setData((prev) => ({
                    ...prev,
                    more_details: {
                      ...prev.more_details,
                      [key]: value,
                    },
                  }));
                }}
                required
                className="bg-emerald-50 p-3 border border-emerald-200 outline-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>
          ))}

          <div
            onClick={() => setOpenAddField(true)}
            className="inline-block bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-emerald-500 hover:to-lime-400 text-white py-2 px-5 rounded-full font-semibold shadow-md cursor-pointer transition-all duration-200"
          >
            + Add Fields
          </div>
          <button
            className="bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-lime-400 hover:to-emerald-500 text-white py-3 px-6 rounded-lg font-bold shadow-lg mt-2 tracking-wide text-lg transition-all duration-200"
          >Submit</button>
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
  );
};

export default UploadProduct;
