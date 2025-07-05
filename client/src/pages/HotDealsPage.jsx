import React, { useState, useEffect } from 'react';
import { FaFire, FaPercent, FaClock, FaShoppingBag } from 'react-icons/fa';
import CardProduct from '../components/CardProduct';
import CardLoading from '../components/CardLoading';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';

const HotDealsPage = () => {
  const { axiosNotificationError } = useNotification();
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    minDiscount: 30,
    sortBy: 'discount',
    sortOrder: 'desc',
    limit: 12
  });

  // Fetch hot deals
  useEffect(() => {
    fetchHotDeals(true); // Reset data when filters change
  }, [filters]);

  const fetchHotDeals = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      
      const currentPage = reset ? 1 : page;
      
      const response = await Axios({
        url: summaryApi.getHotDeals.url,
        method: summaryApi.getHotDeals.method,
        data: {
          page: currentPage,
          limit: filters.limit,
          minDiscount: filters.minDiscount
        }
      });

      if (response.data.success) {
        const newDeals = response.data.data || [];
        
        if (reset) {
          setHotDeals(newDeals);
        } else {
          setHotDeals(prev => [...prev, ...newDeals]);
        }
        
        setTotalPage(response.data.totalPage || 1);
        setTotalCount(response.data.totalCount || 0);
        
        if (!reset) {
          setPage(currentPage + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching hot deals:', error);
      axiosNotificationError(error);
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Load more products
  const handleLoadMore = () => {
    if (page <= totalPage && !loadingMore) {
      fetchHotDeals(false);
    }
  };

  // Filter handlers
  const handleDiscountFilter = (minDiscount) => {
    // Only scroll to top if user is actually changing filters (not initial load)
    const isFilterChange = filters.minDiscount !== minDiscount;

    setFilters(prev => ({ ...prev, minDiscount }));

    // Only scroll to top if it's an actual filter change by user
    if (isFilterChange && hotDeals.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-0 lg:pt-20 pb-20 lg:pb-8 min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Mobile-First Header - Non-sticky, scrolls with content */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Title Section */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                <FaFire className="text-white text-xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  🔥 Hot Deals
                </h1>
                <p className="text-sm text-gray-600">
                  {totalCount} amazing deals • Save up to 70%
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Filter Pills */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            {[
              { label: '30%+ OFF', value: 30, color: 'bg-blue-100 text-blue-700' },
              { label: '40%+ OFF', value: 40, color: 'bg-green-100 text-green-700' },
              { label: '50%+ OFF', value: 50, color: 'bg-orange-100 text-orange-700' },
              { label: '60%+ OFF', value: 60, color: 'bg-red-100 text-red-700' },
              { label: '70%+ OFF', value: 70, color: 'bg-purple-100 text-purple-700' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleDiscountFilter(filter.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.minDiscount === filter.value
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : filter.color + ' hover:shadow-md'
                }`}
              >
                <FaPercent className="inline mr-1" size={12} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section - Seamless connection, no gap */}
      <div>
        {/* Loading State */}
        {loading ? (
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(8).fill().map((_, index) => (
                <CardLoading key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {hotDeals.length > 0 ? (
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {hotDeals.map((product, index) => (
                    <div key={product._id || index} className="relative">
                      <div className="transform hover:scale-105 transition-transform duration-200">
                        <CardProduct data={product} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {page <= totalPage && (
                  <div className="flex justify-center mt-8 pb-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaShoppingBag />
                          Load More Deals
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="container mx-auto px-4 py-4">
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <FaPercent className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Hot Deals Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No products found with {filters.minDiscount}% or more discount.
                  </p>
                  <button
                    onClick={() => handleDiscountFilter(30)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
                  >
                    Try 30%+ Deals
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Floating Stats with Scroll to Top */}
      <div className="lg:hidden fixed bottom-24 left-4 right-4 z-40">
        <div className="flex items-center gap-2">
          {/* Stats Bar */}
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-red-600">
                <FaFire className="animate-pulse" />
                <span className="font-semibold">{totalCount} Deals</span>
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1 text-orange-600">
                <FaClock />
                <span className="font-semibold">Limited</span>
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1 text-green-600">
                <FaPercent />
                <span className="font-semibold">Up to 70%</span>
              </div>
            </div>
          </div>
          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all flex-shrink-0"
            aria-label="Scroll to top"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotDealsPage;
