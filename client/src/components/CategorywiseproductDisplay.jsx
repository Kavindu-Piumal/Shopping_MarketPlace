import React, { createRef, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import validUrl from "../utils/validUrl";
import { useAuthContext } from "../context/AuthContext"; // Add AuthContext

const CategorywiseproductDisplay = ({ id, name }) => {
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();
  const subcategoryData = useSelector((state) => state.product.allSubCategory);
  const { isAuthenticated } = useAuthContext(); // Listen to auth state
  const navigate = useNavigate();
  const loadingcard = new Array(10).fill(null);
  // Create an array of 10 elements to simulate loading cards
  const fetchcategorywiseProduct = async () => {
    try {
      setLoading(true);
      // Don't make request if no id provided
      if (!id) {
        setData([]);
        return;
      }
      
      const response = await Axios({
        url: summaryApi.getProductbyCategory.url,
        method: summaryApi.getProductbyCategory.method,
        data: {
          id: id,
        },
      });

      const { data: responseData } = response;
      //console.log("categorywiseProduct API response:", responseData); // <-- Add here
      if (responseData.success) {
        setData(responseData.data || []);
        //console.log("categorywiseProduct data set:", responseData.data); // <-- Add here
      }    } catch (error) {
      axiosNotificationError(error);
      // Set empty array on error to prevent undefined issues
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcategorywiseProduct();
  }, [id, isAuthenticated]); // Re-fetch when auth state changes

  const handleScrollRight = () => {
    containerRef.current.scrollLeft += 200;
  };

  const handleScrollLeft = () => {
    containerRef.current.scrollLeft -= 200;
  };
  const handleSeeAllClick = () => {
    // Scroll to top smoothly before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Small delay to ensure smooth scroll starts before navigation
    setTimeout(() => {
      const url = handleRedirectproductList();
      if (url && url !== "#") {
        navigate(url);
      }
    }, 100);
  };

  const handleRedirectproductList = () => {    // Return early if no subcategory data available (this is normal when not logged in or data is loading)
    if (!subcategoryData || subcategoryData.length === 0) {
      return "#";
    }
    
    // Find all subcategories that belong to this category
    const subcategories = subcategoryData.filter(
      (subcat) =>
        subcat &&
        Array.isArray(subcat.category) &&
        subcat.category.some((c) => c && c._id === id)
    );

    // Use the first subcategory found (or handle if none found)
    const subcategory = subcategories[0];    if (!subcategory) {
      // Fallback to category-only URL if no subcategory found
      return `/${validUrl(name) || ""}-${id}`;
    }

    const url = `/${validUrl(name) || ""}-${id}/$${validUrl(subcategory.name) || ""}-${subcategory._id}`;
    return url
  };  const reDirectUrl = handleRedirectproductList();
  
  // Don't render if no data and not loading
  if (!loading && data.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="container mx-auto p-4 flex items-center justify-between category-header-mobile">
        <h3 className="font-semibold text-lg md:text-xl text-gray-800">{name}</h3>
        <button 
          onClick={handleSeeAllClick}
          className="text-green-600 hover:text-green-500 transition-colors see-all-mobile flex items-center gap-1 cursor-pointer"
        >
          See All
          <FaArrowAltCircleRight className="text-sm" />
        </button>
      </div>

      <div className="relative flex items-center categorywise-product-container">
        <button
          onClick={handleScrollLeft}
          className="bg-white shadow-lg text-lg z-10 absolute left-2 p-2 rounded-full hidden lg:block hover:bg-gray-50 transition-colors"
        >
          <FaArrowAltCircleLeft className="text-green-600" />
        </button>

        <div
          className="mobile-product-scroll categorywise-scroll-container"
          ref={containerRef}
        >
          {loading &&
            loadingcard.map((_, index) => {
              return (
                <div key={index} className="mobile-product-item">
                  <CardLoading />
                </div>
              );
            })}

          {data.map((product, index) => {
            return (
              <div 
                key={product._id + "CategoryWisedProductDisplay" + index}
                className="mobile-product-item"
              >
                <CardProduct
                  data={product}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleScrollRight}
          className="bg-white shadow-lg text-lg z-10 absolute right-2 p-2 rounded-full hidden lg:block hover:bg-gray-50 transition-colors"
        >
          <FaArrowAltCircleRight className="text-green-600" />
        </button>
      </div>
    </div>
  );
};

export default CategorywiseproductDisplay;
