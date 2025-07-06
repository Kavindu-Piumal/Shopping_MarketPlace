import React, { useState, useEffect } from 'react';
import { FaStore, FaEdit, FaEye, FaBox, FaPlus, FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPause, FaPlay, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';
import CreateShopModal from '../components/CreateShopModal';
import DashboardMobileLayout from '../components/DashboardMobileLayout';

const MyShop = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lifecycleInfo, setLifecycleInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchMyShop();
      fetchLifecycleInfo();
    }
  }, [user]);

  const fetchMyShop = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getMyShop.url,
        method: summaryApi.getMyShop.method
      });
      
      if (response.data.success) {
        setShop(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // User doesn't have a shop yet
        setShop(null);
      } else {
        axiosNotificationError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLifecycleInfo = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getShopLifecycleInfo.url,
        method: summaryApi.getShopLifecycleInfo.method
      });
      
      if (response.data.success) {
        setLifecycleInfo(response.data.data);
      }
    } catch (error) {
      // Silently handle error - lifecycle info is optional
      console.log('Could not fetch lifecycle info:', error);
    }
  };

  const handleDeactivateShop = async () => {
    try {
      const response = await Axios({
        url: summaryApi.deactivateShop.url,
        method: summaryApi.deactivateShop.method
      });

      if (response.data.success) {
        setShop(response.data.data.shop);
        showSuccess(response.data.message);
        fetchLifecycleInfo(); // Refresh lifecycle info
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  const handleReactivateShop = async () => {
    try {
      const response = await Axios({
        url: summaryApi.reactivateShop.url,
        method: summaryApi.reactivateShop.method
      });

      if (response.data.success) {
        setShop(response.data.data.shop);
        showSuccess(response.data.message);
        fetchLifecycleInfo(); // Refresh lifecycle info
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  const handleDeleteShop = async () => {
    try {
      const response = await Axios({
        url: summaryApi.deleteShop.url,
        method: summaryApi.deleteShop.method,
        data: { confirmPassword: deletePassword }
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        // Redirect to home or refresh user data
        navigate('/');
        window.location.reload(); // Refresh to update user role
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need to be a seller to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <FaStore className="text-6xl text-emerald-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Create Your Shop</h1>
              <p className="text-gray-600 mb-8 text-lg">
                You're a seller but haven't created your shop yet. Set up your shop to start showcasing your sustainable products!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all font-semibold text-lg flex items-center gap-3 mx-auto"
              >
                <FaPlus />
                Create My Shop
              </button>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <CreateShopModal 
            close={() => setShowCreateModal(false)}
            onShopCreated={() => {
              setShowCreateModal(false);
              fetchMyShop();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <DashboardMobileLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaStore className="text-emerald-600" />
            My Shop Dashboard
          </h1>
          {/* View Shop and Edit Shop in one line on mobile */}
          <div className="flex flex-row items-center gap-2 sm:gap-4">
            <Link
              to={`/shop/${shop._id}`}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
            >
              <FaEye />
              <span className="hidden xs:inline">View Shop</span>
              <span className="xs:hidden">View</span>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
            >
              <FaEdit />
              <span className="hidden xs:inline">Edit Shop</span>
              <span className="xs:hidden">Edit</span>
            </button>
          </div>
        </div>

        {/* Lifecycle Warnings */}
        {lifecycleInfo?.warnings && lifecycleInfo.warnings.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-400 mt-1 mr-3" />
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Shop Activity Alert</h3>
                  {lifecycleInfo.warnings.map((warning, index) => (
                    <div key={index} className={`p-3 rounded-lg mb-2 ${
                      warning.status === 'warning' ? 'bg-yellow-100 border border-yellow-300' :
                      warning.status === 'critical' ? 'bg-red-100 border border-red-300' :
                      'bg-blue-100 border border-blue-300'
                    }`}>
                      <p className={`font-medium ${
                        warning.status === 'warning' ? 'text-yellow-800' :
                        warning.status === 'critical' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {warning.message}
                      </p>
                      {warning.action && (
                        <p className={`text-sm mt-1 ${
                          warning.status === 'warning' ? 'text-yellow-700' :
                          warning.status === 'critical' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                          Action needed: {warning.action}
                        </p>
                      )}
                    </div>
                  ))}
                  <p className="text-yellow-700 text-sm mt-2">
                    💡 Tip: Add, update, or delete products to reset your activity timer
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop Management Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaStore className="text-emerald-600" />
            Shop Management
          </h3>
          
          {/* Mobile-optimized layout */}
          <div className="space-y-4">
            {/* Status and Action in one line on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Status</label>
                <div className="flex items-center gap-2">
                  {getStatusBadge(shop.status)}
                  {shop.status === 'active' ? (
                    <button
                      onClick={handleDeactivateShop}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-all flex items-center gap-1"
                    >
                      <FaPause className="text-xs" />
                      <span className="hidden xs:inline">Deactivate</span>
                      <span className="xs:hidden">Pause</span>
                    </button>
                  ) : shop.status === 'inactive' ? (
                    <button
                      onClick={handleReactivateShop}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-all flex items-center gap-1"
                    >
                      <FaPlay className="text-xs" />
                      <span className="hidden xs:inline">Reactivate</span>
                      <span className="xs:hidden">Resume</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Delete Shop on next line */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-red-700 mb-2">Danger Zone</label>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <FaTrash className="text-xs" />
                Delete Shop
              </button>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Shop Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Shop Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">              {/* Shop Header */}
              <div className="relative">
                {/* Shop Banner Background */}
                <div className="h-48 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
                  {/* Banner Image */}
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
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    zIndex: '2'
                  }}></div>
                  
                  {/* Shop Logo */}
                  <div style={{ 
                    position: 'absolute',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: '10',
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                    {shop.logo ? (
                      <img 
                        src={shop.logo} 
                        alt="Shop Logo" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    ) : (
                      <FaStore style={{ fontSize: '24px', color: '#059669' }} />
                    )}
                  </div>
                  
                  {/* Shop Info at bottom */}
                  <div style={{ 
                    position: 'absolute',
                    bottom: '16px',
                    left: '24px',
                    right: '24px',
                    textAlign: 'center',
                    zIndex: '10'
                  }}>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: 'white', 
                      marginBottom: '8px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                    }}>
                      {shop.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {getStatusBadge(shop.status)}
                      {shop.verified && (
                        <span style={{ 
                          backgroundColor: '#3b82f6', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '14px'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Details */}
              <div className="p-6">
                {shop.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{shop.description}</p>
                  </div>
                )}

                {shop.keywords && shop.keywords.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {shop.keywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-emerald-600 mb-1">
                      <FaBox />
                      {shop.totalProducts || 0}
                    </div>
                    <p className="text-gray-600 text-sm">Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {/* Phone and Email in one line on mobile when both exist */}
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-emerald-600 text-sm" />
                    <span className="text-gray-700 text-sm">{shop.mobile}</span>
                  </div>
                  {shop.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-emerald-600 text-sm" />
                      <span className="text-gray-700 text-sm break-all">{shop.email}</span>
                    </div>
                  )}
                </div>
                
                {/* Address */}
                {shop.address && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-emerald-600 mt-1 text-sm" />
                    <div className="text-gray-700 text-sm">
                      {shop.address.street && <div>{shop.address.street}</div>}
                      <div>
                        {[shop.address.city, shop.address.state].filter(Boolean).join(', ')}
                      </div>
                      {shop.address.pincode && <div>{shop.address.pincode}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-emerald-600" />
                Operating Hours
              </h3>
              <div className="space-y-2 text-sm">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="capitalize font-medium text-gray-700 min-w-[80px]">{day.slice(0, 3)}</span>
                    <span className={`text-right ${
                      shop.operatingHours?.[day]?.isOpen 
                        ? 'text-gray-600' 
                        : 'text-red-500'
                    }`}>
                      {shop.operatingHours?.[day]?.isOpen 
                        ? `${formatTime(shop.operatingHours[day].open)} - ${formatTime(shop.operatingHours[day].close)}`
                        : 'Closed'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
          {/* Two buttons per line on mobile, full grid on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/uploadproduct"
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg p-4 text-center transition-all group"
            >
              <FaPlus className="text-2xl sm:text-3xl text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-emerald-800 text-sm sm:text-base">Add Product</h4>
              <p className="text-emerald-600 text-xs sm:text-sm">Upload new products</p>
            </Link>

            <Link
              to="/dashboard/product"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-all group"
            >
              <FaBox className="text-2xl sm:text-3xl text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-blue-800 text-sm sm:text-base">My Products</h4>
              <p className="text-blue-600 text-xs sm:text-sm">Manage your listings</p>
            </Link>

            <Link
              to="/dashboard/seller-orders"
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-center transition-all group"
            >
              <FaBox className="text-2xl sm:text-3xl text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-orange-800 text-sm sm:text-base">Orders</h4>
              <p className="text-orange-600 text-xs sm:text-sm">View & manage orders</p>
            </Link>

            <Link
              to="/chat"
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-all group"
            >
              <FaUsers className="text-2xl sm:text-3xl text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-purple-800 text-sm sm:text-base">Customer Chat</h4>
              <p className="text-purple-600 text-xs sm:text-sm">Message customers</p>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaTrash className="text-red-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Shop</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your shop? This action cannot be undone. 
              You must delete all products first.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm with password (optional)
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteShop}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Delete Shop
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateShopModal 
          close={() => setShowCreateModal(false)}
          onShopCreated={() => {
            setShowCreateModal(false);
            fetchMyShop();
          }}
          shopData={shop} // Pass existing shop data for editing
          isEditing={true}
        />
      )}
    </div>
    </DashboardMobileLayout>
  );
};

export default MyShop;
