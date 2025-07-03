import React, { useState, useEffect } from 'react';
import { FaStore, FaSearch, FaFilter, FaStar, FaTrash, FaEdit, FaCheck, FaTimes, FaEye, FaUserEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import Loading from '../components/Loading';
import CreateShopModal from '../components/CreateShopModal';
import ConfirmBox from '../components/ConfirmBox';
import DashboardMobileLayout from '../components/DashboardMobileLayout';

const ManageShops = () => {
  const { showSuccess, showError } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1
  });

  // Confirmation states
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingShopAction, setPendingShopAction] = useState(null);

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
      const queryParams = new URLSearchParams({
        ...filters,
        limit: 10
      }).toString();

      // Use admin endpoint to get all shops including inactive/pending
      const response = await Axios({
        url: `${summaryApi.getAllShops.url}?${queryParams}`,
        method: summaryApi.getAllShops.method
      });
      
      if (response.data.success) {
        setShops(response.data.data.shops);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      axiosNotificationError(error);
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
  };
  const handleStatusChange = async (shopId, newStatus) => {
    if (newStatus === 'suspended') {
      setPendingShopAction({ shopId, action: 'suspend' });
      setShowSuspendConfirm(true);
      return;
    }
    
    try {
      const response = await Axios({
        url: `${summaryApi.updateShopStatus.url}/${shopId}`,
        method: summaryApi.updateShopStatus.method,
        data: { status: newStatus }
      });

      if (response.data.success) {
        showSuccess(`Shop status changed to ${newStatus}`);
        fetchShops(); // Refresh the list
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  const confirmSuspendShop = async () => {
    if (!pendingShopAction) return;
    
    try {
      const response = await Axios({
        url: `${summaryApi.updateShopStatus.url}/${pendingShopAction.shopId}`,
        method: summaryApi.updateShopStatus.method,
        data: { status: 'suspended' }
      });

      if (response.data.success) {
        showSuccess('Shop suspended successfully');
        fetchShops();
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setShowSuspendConfirm(false);
      setPendingShopAction(null);
    }
  };

  const handleDeleteShop = async (shopId) => {
    setPendingShopAction({ shopId, action: 'delete' });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteShop = async () => {
    if (!pendingShopAction) return;

    try {
      const response = await Axios({
        url: `${summaryApi.deleteShop.url}/${pendingShopAction.shopId}`,
        method: 'DELETE'
      });

      if (response.data.success) {
        showSuccess('Shop deleted successfully');
        fetchShops(); // Refresh the list
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setShowDeleteConfirm(false);
      setPendingShopAction(null);
    }
  };

  const handleEditShop = (shop) => {
    setSelectedShop(shop);
    setShowEditModal(true);
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Mobile Card Component for Shops
  const ShopCard = ({ shop }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
        <div className="flex items-start space-x-4">
          {/* Shop Icon/Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-md">
              {shop.logo ? (
                <img 
                  src={shop.logo} 
                  alt={shop.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaStore size={24} />
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Shop Name & Description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{shop.description}</p>
                )}
                
                {/* Shop Details Grid */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Owner:</span>
                    <span className="ml-1 text-gray-600">{shop.owner?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Mobile:</span>
                    <span className="ml-1 text-gray-600">{shop.mobile}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-1 text-gray-600">{shop.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-1 text-gray-600">{new Date(shop.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2">{getStatusBadge(shop.status)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              <Link 
                to={`/shop/${shop._id}`} 
                state={{ from: 'admin-manage-shops' }}
                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                title="View Shop"
              >
                <FaEye size={14} />
                <span>View</span>
              </Link>
              
              <button
                onClick={() => handleEditShop(shop)}
                className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
                title="Edit Shop"
              >
                <FaEdit size={14} />
                <span>Edit</span>
              </button>
              
              {shop.status === 'active' ? (
                <button
                  onClick={() => handleStatusChange(shop._id, 'suspended')}
                  className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm"
                  title="Suspend Shop"
                >
                  <FaTimes size={14} />
                  <span>Suspend</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(shop._id, 'active')}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-sm"
                  title="Activate Shop"
                >
                  <FaCheck size={14} />
                  <span>Activate</span>
                </button>
              )}
              
              <button
                onClick={() => handleDeleteShop(shop._id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                title="Delete Shop"
              >
                <FaTrash size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardMobileLayout>
      <div className="max-w-full overflow-hidden">
        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaStore className="text-emerald-600" />
            Manage All Shops
          </h1>
        
        {/* Debug Tools - only in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                try {
                  const response = await Axios({
                    url: summaryApi.debugShops.url,
                    method: summaryApi.debugShops.method
                  });
                  console.log("Debug shops response:", response.data);
                  const { totalShops, statusCounts } = response.data;
                  showSuccess(
                    `Found ${totalShops} shops: ` +
                    `${statusCounts.active} active, ` +
                    `${statusCounts.pending} pending, ` +
                    `${statusCounts.inactive} inactive, ` +
                    `${statusCounts.suspended} suspended`
                  );
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
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearchSubmit} className="col-span-1 md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shops..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          <div>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              {shopCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Review</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Table and Mobile Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loading />
          </div>
        ) : shops.length > 0 ? (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shops.map(shop => (
                    <tr key={shop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-3">
                            <FaStore />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{shop.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{shop.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shop.owner?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{shop.mobile}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shop.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(shop.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link 
                            to={`/shop/${shop._id}`} 
                            state={{ from: 'admin-manage-shops' }}
                            className="text-blue-600 hover:text-blue-900" 
                            title="View Shop"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => handleEditShop(shop)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Shop"
                          >
                            <FaEdit />
                          </button>
                          {shop.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(shop._id, 'suspended')}
                              className="text-orange-600 hover:text-orange-900"
                              title="Suspend Shop"
                            >
                              <FaTimes />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(shop._id, 'active')}
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Activate Shop"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteShop(shop._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Shop"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="md:hidden p-4">
              <div className="space-y-4">
                {shops.map(shop => (
                  <ShopCard key={shop._id} shop={shop} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaStore className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No shops found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === pagination.currentPage
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Shop Modal */}
      {showEditModal && selectedShop && (
        <CreateShopModal 
          close={() => setShowEditModal(false)}
          onShopCreated={() => {
            setShowEditModal(false);
            fetchShops();
          }}
          shopData={selectedShop}
          isEditing={true}
        />
      )}

      {/* Confirmations */}
      {showSuspendConfirm && (
        <ConfirmBox
          title="Suspend Shop"
          message="Are you sure you want to suspend this shop? The shop will be hidden from customers until reactivated."
          confirmText="Suspend"
          cancelText="Cancel"
          confirmButtonClass="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          cancelButtonClass="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          cancel={() => {
            setShowSuspendConfirm(false);
            setPendingShopAction(null);
          }}
          confirm={confirmSuspendShop}
          close={() => {
            setShowSuspendConfirm(false);
            setPendingShopAction(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal - Replace existing one */}
      {showDeleteConfirm && (
        <ConfirmBox
          title="Delete Shop"
          message="Are you sure you want to permanently delete this shop? This action cannot be undone and will remove all shop data, products, and reviews."
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          cancelButtonClass="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          cancel={() => {
            setShowDeleteConfirm(false);
            setPendingShopAction(null);
          }}
          confirm={confirmDeleteShop}
          close={() => {
            setShowDeleteConfirm(false);
            setPendingShopAction(null);
          }}
        />
      )}
      </div>
      </div>
    </DashboardMobileLayout>
  );
};

export default ManageShops;
