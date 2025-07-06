import React, { use } from "react";
import abcdef from "../assets/abcdef.jpg";
import dp from "../assets/dp.jpg";
import { useSelector } from "react-redux";
import validUrl from "../utils/validUrl";
import { Link, useNavigate } from "react-router-dom";
import CategorywiseproductDisplay from "../components/CategorywiseproductDisplay";
import { FaLeaf, FaRecycle, FaHeart, FaShoppingBag, FaArrowRight, FaStore } from "react-icons/fa";

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subcategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();
  const handleRedirectproductList = (categoryId) => {
    // Check if subcategoryData exists and is an array
    if (!subcategoryData || !Array.isArray(subcategoryData) || subcategoryData.length === 0) {
      console.warn("No subcategory data available for navigation");
      return;
    }

    // Find all subcategories that belong to this category
    const subcategories = subcategoryData.filter(
      (subcat) =>
        subcat &&
        Array.isArray(subcat.category) &&
        subcat.category.some((c) => c && c._id === categoryId)
    );

    // Use the first subcategory found (or handle if none found)
    const subcategory = subcategories[0];

    if (!subcategory) {
      // Optionally show an error or fallback
      console.warn("No subcategory found for category", categoryId);
      return;
    }

    // Use only IDs for navigation
    const url = `/category/${categoryId}/subcategory/${subcategory._id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(url);
  };
  return (
    <section className="w-full h-full bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen">
      <div className="container mx-auto">
        {/* Hero Banner with eco-friendly overlay */}
        <div
          className={`w-full h-full min-h-48 rounded-2xl relative overflow-hidden shadow-lg ${
            !abcdef && "animate-pulse"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-green-300-800/20 z-10"></div>
          <img
            src={abcdef}
            alt="Sustainable Shopping - Reused & Recycled Products"
            className="w-full h-50 object-cover rounded-2xl hidden lg:block"
          />
          <img
            src={dp}
            alt="Sustainable Shopping - Reused & Recycled Products"
            className="w-full h-50 object-cover rounded-2xl lg:hidden"
          />
          {/* Hero Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white bg-black/30 backdrop-blur-sm rounded-2xl p-6">
              <h1 className="text-2xl lg:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                <FaLeaf className="text-green-400" />
                Sustainable Shopping
                <FaRecycle className="text-emerald-400" />
              </h1>
              <p className="text-sm lg:text-lg opacity-90">Discover eco-friendly, reused & recycled products</p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="px-4 my-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <FaHeart className="text-red-500" />
              Shop by Category
              <FaShoppingBag className="text-green-600" />
            </h2>
            <p className="text-gray-600">Browse our sustainable product categories</p>
          </div>
          
          <div className="hidden lg:grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {loadingCategory
              ? new Array(12).fill(0).map((c, index) => {
                  return (
                    <div key={index} className="bg-white p-4 min-h-40 grid gap-2 rounded-2xl shadow-lg animate-pulse border border-green-100">
                      <div className="bg-gradient-to-br from-green-200 to-emerald-200 min-h-24 rounded-xl"></div>
                      <div className="bg-gradient-to-r from-green-200 to-emerald-200 h-8 rounded-lg"></div>
                    </div>
                  );
                })              : categoryData.map((category, index) => {
                  // Add null check for category
                  if (!category || !category._id || !category.name) {
                    return null;
                  }
                  return (
                    <div
                      key={category._id || index}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-green-100 hover:border-green-300 transform hover:-translate-y-1"
                      onClick={() => {
                        console.log(
                          "category._id",
                          category._id,
                          "category.name",
                          category.name
                        );
                        handleRedirectproductList(category._id, category.name);
                      }}
                    >
                      <div className="p-4">
                        <div className="relative overflow-hidden rounded-xl mb-3">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <FaLeaf className="text-green-500 text-sm" />
                          </div>
                        </div>
                        <h3 className="text-xs font-semibold text-gray-800 text-center group-hover:text-green-600 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Mobile horizontal scrollable categories */}
          <div className="lg:hidden mobile-category-scroll overflow-x-auto overflow-y-hidden flex gap-4 pb-2 px-2 scrollbar-none scroll-smooth">
            {loadingCategory
              ? new Array(12).fill(0).map((c, index) => {
                  return (
                    <div key={index} className="bg-white p-3 min-h-32 min-w-20 max-w-20 flex-shrink-0 grid gap-2 rounded-2xl shadow-lg animate-pulse border border-green-100">
                      <div className="bg-gradient-to-br from-green-200 to-emerald-200 min-h-16 rounded-xl"></div>
                      <div className="bg-gradient-to-r from-green-200 to-emerald-200 h-4 rounded-lg"></div>
                    </div>
                  );
                })
              : categoryData.map((category, index) => {
                  // Add null check for category
                  if (!category || !category._id || !category.name) {
                    return null;
                  }
                  return (
                    <div
                      key={category._id + "mobile" || index}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-green-100 hover:border-green-300 transform hover:-translate-y-1 min-w-20 max-w-20 flex-shrink-0"
                      onClick={() => {
                        console.log(
                          "category._id",
                          category._id,
                          "category.name",
                          category.name
                        );
                        handleRedirectproductList(category._id, category.name);
                      }}
                    >
                      <div className="p-3">
                        <div className="relative overflow-hidden rounded-xl mb-2">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1">
                            <FaLeaf className="text-green-500 text-xs" />
                          </div>
                        </div>
                        <h3 className="text-xs font-semibold text-gray-800 text-center group-hover:text-green-600 transition-colors leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  );
                })}
          </div>        </div>

        {/* Product Categories Sections with proper spacing - Updated: Cache Clear */}
        <div className="category-sections-container">
          {categoryData
            .filter(c => c && c._id && c.name) // Filter out null/invalid categories
            .map((c, index) => {
              return (
                <div 
                  key={c?._id + "Category Wised"} 
                  className="category-section-wrapper"
                >
                  <CategorywiseproductDisplay
                    id={c?._id}
                    name={c?.name}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Home;
