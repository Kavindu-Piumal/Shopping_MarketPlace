import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import validUrl from "../utils/validUrl";

const CategorywiseproductDisplay = ({ id, name }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();
  const subcategoryData = useSelector((state) => state.product.allSubCategory);
  const loadingcard = new Array(10).fill(null);

  const fetchcategorywiseProduct = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getProductbyCategory.url,
        method: summaryApi.getProductbyCategory.method,
        data: {
          id: id,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcategorywiseProduct();
  }, [fetchcategorywiseProduct]);

  const handleScrollRight = () => {
    containerRef.current.scrollLeft += 200;
  };

  const handleScrollLeft = () => {
    containerRef.current.scrollLeft -= 200;
  };

  const handleRedirectproductList = () => {
    const subcategories = subcategoryData.filter(
      (subcat) =>
        Array.isArray(subcat.category) &&
        subcat.category.some((c) => c._id === id)
    );

    const subcategory = subcategories[0];

    if (!subcategory) {
      console.warn("No subcategory found for category", name);
      return;
    }

    const url = `/${encodeURIComponent(validUrl(name) || "")}-${id}/$${encodeURIComponent(validUrl(subcategory.name) || "")}-${subcategory._id}`;
    console.log("Generated URL:", url); // Log the generated URL for debugging
    return url;
  };

  const reDirectUrl = handleRedirectproductList();
  return (
    <div className="">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
        <Link to={reDirectUrl} className="text-green-600 hover:text-green-400">
          See All
        </Link>
      </div>

      <div className="relative flex items-center">
        <button
          onClick={handleScrollLeft}
          className="bg-white shadow-lg text-lg z-10 relative p-2  left-0 rounded-full hidden lg:block"
        >
          <FaArrowAltCircleLeft />
        </button>

        <div
          className="flex items-center gap-4 md:gap-6 lg:gap-8 container mx-auto px-4 overflow-x-scroll scrollbar-none scroll-smooth"
          ref={containerRef}
        >
          {loading &&
            loadingcard.map((_, index) => {
              return <CardLoading key={index} />;
            })}

          {data.map((product, index) => {
            return (
              <CardProduct
                data={product}
                key={product._id + "CategoryWisedProductDisplay" + index}
              />
            );
          })}
        </div>

        <button
          onClick={handleScrollRight}
          className="bg-white shadow-lg text-lg z-10 relative p-2  right-0 rounded-full hidden lg:block"
        >
          <FaArrowAltCircleRight />
        </button>
      </div>
    </div>
  );
};

export default CategorywiseproductDisplay;
