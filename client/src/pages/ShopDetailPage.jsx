import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaStore, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaGlobe, FaFacebook, FaInstagram, FaTwitter, FaArrowLeft, FaTag, FaBox } from 'react-icons/fa';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import Loading from '../components/Loading';
import CardProduct from '../components/CardProduct';
import { useSelector } from 'react-redux';
import isAdmin from '../utils/isAdmin';
import AdminShopActions from '../components/AdminShopActions';

const ShopDetailPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosNotificationError = useAxiosNotificationError();
  const user = useSelector(state => state.user);
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Determine correct back navigation path
  const getBackPath = () => {
    // Check if user came from admin manage-shops page
    const fromAdminPage = location.state?.from === 'admin-manage-shops' || 
                         (document.referrer && document.referrer.includes('/dashboard/manage-shops'));
    
    // If user is admin and likely came from manage-shops, go back to admin page
    if (isAdmin(user?.role) && fromAdminPage) {
      return '/dashboard/manage-shops';
    }
    
    // Default to public shops page
    return '/shops';
  };

  const handleBackNavigation = (e) => {
    e.preventDefault();
    // Use browser history if available, otherwise use determined path
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getBackPath());
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId, currentPage]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12
      }).toString();

      const response = await Axios({
        url: `${summaryApi.getShopById.url}/${shopId}?${queryParams}`,
        method: summaryApi.getShopById.method
      });
      
      if (response.data.success) {
        setShop(response.data.data.shop);
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };
  const isOpenNow = () => {
    if (!shop?.operatingHours) return false;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const todayHours = shop.operatingHours[currentDay];
    if (!todayHours?.isOpen) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayStatus = (dayHours) => {
    if (!dayHours?.isOpen) return 'Closed';
    return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Shop not found</h2>
          <button 
            onClick={handleBackNavigation}
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            ← Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}        <button 
          onClick={handleBackNavigation}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium cursor-pointer"
        >
          <FaArrowLeft /> Back to Shops
        </button>

        {/* Admin Controls (visible only to admins) */}
        {isAdmin(user?.role) && shop && (
          <AdminShopActions 
            shop={shop} 
            onShopUpdated={fetchShopDetails} 
          />
        )}        {/* Shop Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
            {/* Shop Banner Background */}
            {shop.banner && (
              <img 
                src={shop.banner} 
                alt="Shop Banner" 
                style={{ 
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: '1',
                  display: 'block',
                  opacity: '1'
                }}
              />
            )}
            
            {/* Light overlay for text readability */}
            <div style={{ 
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: '2'
            }}></div>
            
            <div className="absolute bottom-6 left-6 right-6" style={{ zIndex: '10' }}>
              <div className="flex items-end gap-4">
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}>
                  {shop.logo ? (
                    <img 
                      src={shop.logo} 
                      alt="Shop Logo" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <FaStore style={{ fontSize: '30px', color: '#059669' }} />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{shop.name}</h1>
                  <div className="flex items-center gap-4 text-white">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {shop.category}
                    </span>                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOpenNow() 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {isOpenNow() ? '● Open Now' : '● Closed'}
                    </span>
                    {shop.verified && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                        ✓ Verified
                      </span>
                    )}
                    {shop.status !== 'active' && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                        {shop.status === 'pending' ? 'Pending Review' : 
                         shop.status === 'suspended' ? 'Suspended' : 'Inactive'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                {/* Rating and Stats */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    <span className="text-gray-600">({shop.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBox className="text-emerald-600" />
                    <span className="font-semibold">{shop.totalProducts}</span>
                    <span className="text-gray-600">products</span>
                  </div>
                </div>

                {/* Description */}
                {shop.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Shop</h3>
                    <p className="text-gray-600 leading-relaxed">{shop.description}</p>
                  </div>
                )}

                {/* Keywords */}
                {shop.keywords && shop.keywords.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaTag className="text-emerald-600" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {shop.keywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact & Hours */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-emerald-600" />
                      <span>{shop.mobile}</span>
                    </div>
                    {shop.email && (
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-emerald-600" />
                        <span className="break-all">{shop.email}</span>
                      </div>
                    )}
                    {shop.address && (
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-emerald-600 mt-1" />
                        <div>
                          {shop.address.street && <div>{shop.address.street}</div>}
                          <div>
                            {[shop.address.city, shop.address.state].filter(Boolean).join(', ')}
                          </div>
                          {shop.address.pincode && <div>{shop.address.pincode}</div>}
                          {shop.address.country && <div>{shop.address.country}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(shop.socialLinks?.website || shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.socialLinks?.twitter) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Find Us Online</h3>
                    <div className="space-y-2">
                      {shop.socialLinks.website && (
                        <a 
                          href={shop.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                          <FaGlobe />
                          Website
                        </a>
                      )}
                      {shop.socialLinks.facebook && (
                        <a 
                          href={shop.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FaFacebook />
                          Facebook
                        </a>
                      )}
                      {shop.socialLinks.instagram && (
                        <a 
                          href={shop.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 hover:text-pink-600 transition-colors"
                        >
                          <FaInstagram />
                          Instagram
                        </a>
                      )}
                      {shop.socialLinks.twitter && (
                        <a 
                          href={shop.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 hover:text-blue-400 transition-colors"
                        >
                          <FaTwitter />
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaClock className="text-emerald-600" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize font-medium">{day}</span>
                        <span className={
                          shop.operatingHours?.[day]?.isOpen 
                            ? 'text-gray-600' 
                            : 'text-red-500'
                        }>
                          {getDayStatus(shop.operatingHours?.[day])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Shop Products</h2>
            <span className="text-gray-600">{pagination.totalProducts || 0} products</span>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
                {products.map(product => (
                  <CardProduct key={product._id} data={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-500">This shop hasn't added any products yet.</p>            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;
