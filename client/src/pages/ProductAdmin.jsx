import React, { use } from "react";
import summaryApi from "../common/summaryApi";
import { useNotification } from "../context/NotificationContext";
import Axios from "../utils/Axios";
import { useState } from "react";
import { useEffect } from "react";
import Loading from "../components/Loading";
import ProductCardAdmin from "../components/ProductCardAdmin";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";

const ProductAdmin = () => {
  const { axiosNotificationError } = useNotification();
  const user = useSelector((state) => state.user);
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      if (user && user.role === "admin") {
        response = await Axios({
          url: summaryApi.getProduct.url,
          method: summaryApi.getProduct.method,
          data: {
            page: page,
            limit: 12,
            search: search,
          },
        });
      } else if (user && user.role === "seller") {
        response = await Axios({
          url: summaryApi.getMyProducts.url,
          method: summaryApi.getMyProducts.method,
          // If your endpoint supports pagination/search, add them here
        });
      } else {
        setProductData([]);
        setLoading(false);
        return;
      }
      const { data: responseData } = response;
      //console.log("Products API response:", responseData); // <-- Add here

      if (responseData.success) {
        setProductData(responseData.data);
      }    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.role) return; // Wait until user is loaded
    fetchProducts();
  }, [page, user]);

  const handleNext = () => {
    if (page !== totalPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleonChange = (e) => {
    const { value } = e.target;

    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    if (!user || !user.role) return; // Wait until user is loaded
    let flag = true;
    const intervel = setTimeout(() => {
      if (flag) {
        fetchProducts();
        flag = false;
      }
    }, 300);
    return () => {
      clearTimeout(intervel);
    };
  }, [search, user]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-lime-50 py-6 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/90 rounded-lg shadow-lg px-6 py-4 mb-6 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-800 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-emerald-400 rounded-full mr-2"></span>
            Sustainable Products
          </h2>
          <div className="flex items-center gap-2 bg-emerald-50 rounded px-3 py-2 border border-emerald-200 shadow-sm">
            <IoSearch className="text-emerald-500 text-lg" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              className="bg-transparent outline-none w-40 md:w-64 text-emerald-900 placeholder-emerald-400"
              onChange={handleonChange}
            />
          </div>
        </div>

        {loading && <Loading />}

        <div className="min-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {productData.map((p, index) => (
              <ProductCardAdmin
                key={p._id || index}
                data={p}
                fetchProductData={fetchProducts}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
          <button
            onClick={handlePrevious}
            className="px-6 py-2 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 font-semibold shadow-sm transition"
          >
            Previous
          </button>
          <span className="text-emerald-700 font-medium text-lg">
            Page {page}/{totalPage}
          </span>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 font-semibold shadow-sm transition"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductAdmin;
