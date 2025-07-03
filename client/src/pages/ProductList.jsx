import React, { use, useEffect, useState, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { useNotification } from "../context/NotificationContext";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import validUrl from "../utils/validUrl";
import useMobile from "../hooks/useMobile";

const ProductList = () => {
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const params = useParams();
  const location = useLocation();
  const [isMobile] = useMobile();
  const allsubCategory = useSelector((state) => state.product.allSubCategory);
  const [DisplaysubCategory, setDisplaysubCategory] = useState([]);
  const subCategoryName = params?.subcategory
    ?.split("-")
    .slice(0, -1)
    .join(" ");

  // 🎯 SMART: Determine if search bar should be visible based on current route
  const shouldShowSearch = useMemo(() => {
    const path = location.pathname;
    
    // Show search on product-related pages
    const productPages = [
      '/',                    // Home page
      '/search',              // Search page
      '/category',            // Category pages
      '/subcategory',         // Subcategory pages
      '/product',             // Product pages
      '/shops',              // Shops page
      '/hot-deals',          // Hot deals page
    ];
    
    // Hide search on user account/dashboard pages
    const dashboardPages = [
      '/user-menu-mobile',    // Mobile user menu
      '/dashboard',           // Dashboard pages
      '/chat',               // Chat page
      '/checkout',           // Checkout
      '/cart',               // Cart page
      '/login',              // Auth pages
      '/register',
      '/forgot-password',
      '/reset-password',
      '/otp-verification',
    ];
    
    // Check if current path starts with any dashboard page
    const isDashboardPage = dashboardPages.some(page => path.startsWith(page));
    
    // Check if current path starts with any product page or contains product-related segments
    const isProductPage = productPages.some(page => path.startsWith(page)) || 
                         path.includes('/category/') || 
                         path.includes('/subcategory/') ||
                         path.includes('/product/') ||
                         path.includes('/shop/');
    
    return isProductPage && !isDashboardPage;
  }, [location.pathname]);

  // Dynamic padding: add extra padding when mobile search is visible
  const mobilePadding = useMemo(() => {
    if (shouldShowSearch && isMobile) {
      return 'pt-6'; // 128px: 80px (header) + 48px (mobile search)
    }
    return 'pt-20'; // 80px: just header
  }, [shouldShowSearch, isMobile]);
  //console.log("allsubCategory", allsubCategory);

  //console.log("params", params);
  // Add null safety checks for params
  const categoryId = params?.category ? params.category.split("-").slice(-1)[0] : null;
  const subCategoryId = params?.subcategory ? params.subcategory.split("-").slice(-1)[0] : null;
  const fetchProductData = async () => {
    try {
      // Don't fetch if we don't have valid IDs
      if (!categoryId || !subCategoryId) {
        console.warn("Missing category or subcategory ID");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getproductbyCategoryandSubCategory.url,
        method: summaryApi.getproductbyCategoryandSubCategory.method,
        data: {
          page: page,
          limit: 12,
          categoryId: categoryId,
          subCategoryId: subCategoryId,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data);
        } else {
          setData(...data, responseData.data);
        }
        //console.log("Product Data:", responseData);

        setTotalPage(responseData.totalPage);
      }    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [params]);
  
  useEffect(() => {
    // Add null safety checks
    if (!allsubCategory || !Array.isArray(allsubCategory) || !categoryId) {
      setDisplaysubCategory([]);
      return;
    }
    
    const subCat = allsubCategory.filter((sub) => {
      if (!sub || !sub.category || !Array.isArray(sub.category)) {
        return false;
      }
      const filterData = sub.category.some((el) => {
        return el && el._id === categoryId;
      });
      return filterData ? filterData : null;
    });
    setDisplaysubCategory(subCat);
    console.log("22", subCat);
  }, [params, allsubCategory]);

  // Remove body scroll prevention since we're using fixed positioning
  // useEffect(() => {
  //   document.body.style.overflow = 'hidden';
  //   document.body.style.height = '100vh';
    
  //   return () => {
  //     document.body.style.overflow = 'auto';
  //     document.body.style.height = 'auto';
  //   };
  // }, []);

  //console.log("data", data);

  return (
    <div className={`lg:fixed lg:inset-0 lg:pt-20 lg:bg-gray-50 ${mobilePadding} min-h-screen bg-gray-50`}>
      <div className="lg:h-full flex flex-col px-4 lg:pt-2">
        {/* Mobile Category Pills + Sort - Show on mobile/tablet */}
        <div className="lg:hidden mb-2 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-800">Categories</h2>
            {/* Mobile Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort:</span>
              <select className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
          <div className="category-pills-container flex overflow-x-auto gap-2 pb-2 scrollbar-none category-scroll">
            {DisplaysubCategory.map((s, index) => {
              if (!s || !s._id || !s.name || !s.category || !s.category[0] || !s.category[0]._id) {
                return null;
              }
              
              const link = `/${validUrl(s?.category[0]?.name) || ""}-${s.category[0]._id}/${validUrl(s.name) || ""}-${s._id}`;
              const isActive = subCategoryId === s._id;

              return (
                <Link 
                  key={s._id + index} 
                  to={link}
                  className={`category-pill flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[80px] category-link ${
                    isActive 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg p-1 mb-2">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <p className="text-xs text-center font-medium line-clamp-2 leading-tight">
                    {s.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex gap-4 lg:flex-1 lg:min-h-0">
        {/* Sidebar - Hidden on mobile/tablet */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md lg:h-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 flex-shrink-0">
              <h2 className="font-semibold text-lg">Categories</h2>
            </div>
            <div className="flex-1 overflow-y-auto scrollbarcustom">
              <div className="p-2">
                {DisplaysubCategory.map((s, index) => {
                  if (!s || !s._id || !s.name || !s.category || !s.category[0] || !s.category[0]._id) {
                    return null;
                  }
                  
                  const link = `/${validUrl(s?.category[0]?.name) || ""}-${s.category[0]._id}/${validUrl(s.name) || ""}-${s._id}`;
                  const isActive = subCategoryId === s._id;

                  return (
                    <Link 
                      key={s._id + index} 
                      to={link}
                      className={`category-link flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${
                        isActive 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg p-1 flex-shrink-0 ${
                        isActive ? 'bg-white/20' : 'bg-green-100'
                      }`}>
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <p className="font-medium text-sm line-clamp-2 leading-tight">
                        {s.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header - Fixed on desktop, scrollable on mobile */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-2 lg:flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                  {subCategoryName}
                </h1>
                <p className="text-gray-600 text-sm">
                  {data.length} {data.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              {/* Desktop Sort Dropdown */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid - Scrollable on desktop, natural flow on mobile */}
          <div className="bg-white rounded-xl shadow-md lg:flex-1 lg:overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center lg:flex-1 py-16">
                <Loading />
              </div>
            ) : data.length > 0 ? (
              <div className="lg:flex-1 lg:overflow-y-auto scrollbarcustom">
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                    {data
                      .filter(p => p && p._id && p.name)
                      .map((p, index) => (
                        <CardProduct
                          data={p}
                          key={p._id + "ProductsubList" + index}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:flex-1 flex items-center justify-center">
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600">Try browsing other categories</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductList;
