import React, { useState, useEffect } from 'react';
import { FaStore, FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaEye, FaShoppingBag, FaLeaf } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import Loading from '../components/Loading';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../context/AuthContext';

const ShopsPage = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const user = useSelector((state) => state.user); // Fixed: Remove .user since it's direct properties
  const { isAuthenticated } = useAuthContext(); // Add auth context for better error handling
  
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1
    // Don't include status for non-admin users
  });

  useEffect(() => {
    fetchShopCategories();
    fetchShops();
  }, [filters]);

  const fetchShopCategories = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getShopCategories.url,
        method: summaryApi.getShopCategories.method
      });
      
      if (response.data.success) {
        setShopCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shop categories:', error);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      
      // Build query parameters, filtering out undefined values
      const queryParams = Object.fromEntries(
        Object.entries({
          ...filters,
          limit: 12
        }).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      
      // Only add status parameter for authenticated admin users
      if (user?._id && user?.role === 'admin') {
        queryParams.status = 'all';
      }
      
      const queryString = new URLSearchParams(queryParams).toString();      
      
      console.log("Fetching shops with params:", queryString);
      console.log("User authentication status:", { 
        isAuthenticated, 
        userId: user?._id, 
        userRole: user?.role 
      });
      
      const response = await Axios({
        url: `${summaryApi.getAllShops.url}?${queryString}`,
        method: summaryApi.getAllShops.method
      });
      
      console.log("Shop API response:", response.data);
      
      if (response.data.success) {
        // Set the shops data
        setShops(response.data.data.shops || []);
        setPagination(response.data.data.pagination || {});
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      
      // Better error handling for different scenarios
      if (error.response?.status === 500) {
        console.error("Server error when fetching shops");
        // Show a user-friendly message instead of technical error
        if (isAuthenticated && user?._id) {
          axiosNotificationError(error);
        } else {
          // For unauthenticated users, show a simple message
          console.info("Unable to load shops at the moment. Please try again later.");
          // Optionally show a simple notification
          // showError("Unable to load shops. Please try again later.");
        }
      } else if (error.response?.status === 401) {
        // Authentication required but user is not authenticated
        console.info("Some shop features require authentication");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        // Network/connection issues
        console.error("Network error when fetching shops");
        // showError("Connection issue. Please check your internet and try again.");
      } else {
        // Other errors should be shown
        axiosNotificationError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops();
  };  const ShopCard = ({ shop }) => {
    const isOpen = () => {
      if (!shop.operatingHours) return false;
      
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      const todayHours = shop.operatingHours[currentDay];
      if (!todayHours?.isOpen) return false;
      
      return currentTime >= todayHours.open && currentTime <= todayHours.close;
    };

    return (      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
        {/* Shop Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-green-500 rounded-t-xl relative overflow-hidden">
            {/* Shop Banner Background */}
            {shop.banner && (
              <img 
                src={shop.banner} 
                alt="Shop Banner" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          <div className="absolute -bottom-6 left-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {shop.logo ? (
                <img 
                  src={shop.logo} 
                  alt="Shop Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaStore className="text-emerald-600 text-xl" />
              )}
            </div>
          </div><div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpen() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOpen() ? '● Open' : '● Closed'}
            </span>
            
            {shop.status && shop.status !== 'active' && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                shop.status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {shop.status === 'pending' ? 'Pending Review' :
                 shop.status === 'suspended' ? 'Suspended' :
                 'Inactive'}
              </span>
            )}
          </div>
        </div>

        {/* Shop Content */}
        <div className="p-6 pt-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{shop.name}</h3>
            <p className="text-emerald-600 text-sm font-medium">{shop.category}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="text-sm text-gray-600">{shop.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({shop.totalReviews} reviews)</span>
              </div>
              {shop.verified && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">✓ Verified</span>
              )}
            </div>
          </div>

          {shop.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
          )}

          {/* Keywords */}
          {shop.keywords && shop.keywords.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {shop.keywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {keyword}
                  </span>
                ))}
                {shop.keywords.length > 3 && (
                  <span className="text-xs text-gray-500">+{shop.keywords.length - 3} more</span>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            {shop.address?.city && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>{shop.address.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaPhone className="text-gray-400" />
              <span>{shop.mobile}</span>
            </div>
            {shop.email && (
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                <span className="truncate">{shop.email}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to={`/shop/${shop._id}`}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <FaEye />
              View Shop
            </Link>
            <div className="bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-1">
              <FaShoppingBag />
              {shop.totalProducts}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Shop Categories Section */}
        <div className="px-4 my-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <FaStore className="text-purple-600" />
              Browse Sustainable Shops
              <FaLeaf className="text-green-500" />
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover eco-friendly shops offering reused, recycled, and sustainable products from local sellers
            </p>
          </div>          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {[
              { name: "Electronics & Tech", icon: "📱", color: "from-blue-400 to-blue-600" },
              { name: "Clothing & Fashion", icon: "👕", color: "from-pink-400 to-pink-600" },
              { name: "Home & Garden", icon: "🏡", color: "from-green-400 to-green-600" },
              { name: "Automotive Parts", icon: "🚗", color: "from-red-400 to-red-600" },
              { name: "Books & Media", icon: "📚", color: "from-indigo-400 to-indigo-600" },
              { name: "Sports & Recreation", icon: "⚽", color: "from-orange-400 to-orange-600" },
              { name: "Health & Beauty", icon: "💄", color: "from-purple-400 to-purple-600" },
              { name: "Tools & Hardware", icon: "🔧", color: "from-gray-400 to-gray-600" }
            ].map((shopCategory, index) => (
              <Link
                key={index}
                to={`/shops?category=${encodeURIComponent(shopCategory.name)}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-emerald-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className={`h-20 bg-gradient-to-br ${shopCategory.color} flex items-center justify-center`}>
                  <span className="text-3xl">{shopCategory.icon}</span>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-800 text-center group-hover:text-emerald-600 transition-colors leading-tight">
                    {shopCategory.name}
                  </h3>
                </div>
              </Link>
            ))}          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shops, keywords..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {shopCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="totalProducts-desc">Most Products</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
            
            {/* Only show status filter if user is admin */}
            {user && user.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending Review</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Showing {shops.length} of {pagination.totalShops || 0} shops
              {filters.category !== 'all' && ` in ${filters.category}`}
              {filters.search && ` matching "${filters.search}"`}
            </p>
          </div>
          
          {/* Debug button - Only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <button 
              onClick={() => console.log("Current shops:", shops)}
              className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-700"
            >
              Debug Shops Data
            </button>
          )}
        </div>        {/* Debug Panel - Admin Only */}
        {user?.role === 'admin' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">🔧 Admin Debug Panel</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => console.log("Current shops:", shops)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Log Shops Data
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const response = await Axios({
                      url: summaryApi.testGetAllShops.url,
                      method: summaryApi.testGetAllShops.method
                    });
                    console.log("Test API response:", response.data);
                    showSuccess(`Found ${response.data.count} shops in database`);
                  } catch (error) {
                    console.error("Error fetching test shops:", error);
                    axiosNotificationError(error);
                  }
                }}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs"
              >
                Check All Shops
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const response = await Axios({
                      url: summaryApi.debugShops.url,
                      method: summaryApi.debugShops.method
                    });
                    console.log("Debug shops response:", response.data);
                    const { totalShops, statusCounts } = response.data;
                    showSuccess(`Found ${totalShops} shops (${statusCounts.active} active, ${statusCounts.pending} pending)`);
                  } catch (error) {
                    console.error("Error fetching debug shops:", error);
                    axiosNotificationError(error);
                  }
                }}
                className="px-3 py-1 bg-purple-500 text-white rounded text-xs"
              >
                Debug Shop Status
              </button>
              
              <button 
                onClick={async () => {
                  if (!window.confirm("This will set ALL shops to active status. Continue?")) {
                    return;
                  }
                  try {
                    const response = await Axios({
                      url: summaryApi.debugActivateAllShops.url,
                      method: summaryApi.debugActivateAllShops.method
                    });
                    console.log("Activate shops response:", response.data);
                    showSuccess(`${response.data.modifiedCount} shops activated. Refreshing...`);
                    setTimeout(() => fetchShops(), 1000);
                  } catch (error) {
                    console.error("Error activating shops:", error);
                    axiosNotificationError(error);
                  }
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
              >
                Activate All Shops
              </button>
            </div>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        )}

        {/* Shops Grid */}
        {!loading && (
          <>
            {shops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {shops.map(shop => (
                  <ShopCard key={shop._id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No shops found</h3>
                <p className="text-gray-500">
                  {filters.search || filters.category !== 'all' 
                    ? 'Try adjusting your search filters'
                    : 'Be the first to create a shop!'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(filters.page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(filters.page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default ShopsPage;
