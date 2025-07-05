import React, { useState, useEffect } from 'react';
import {
  FaStore, FaSearch, FaFilter, FaStar, FaTrash,
  FaEdit, FaCheck, FaTimes, FaEye, FaUserEdit,
  FaSort, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
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

  // Mobile-optimized Shop Card Component with expandable details
  const MobileShopCard = ({ shop }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mb-3 border border-gray-200">
        {/* Shop Header - Always visible */}
        <div className="p-3 flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <FaStore size={16} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{shop.name}</h3>
              <div className="flex items-center mt-0.5">
                {getStatusBadge(shop.status)}
              </div>
            </div>
          </div>
          
          {/* Toggle expand/collapse */}
          <button
            className="p-2 text-gray-500"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Content */}
        {expanded && (
          <div className="px-3 pb-3 pt-1 border-t border-gray-100">
            {/* Owner & Category Info */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <p className="text-gray-500">Owner</p>
                <p className="font-medium">{shop.owner?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-500">Mobile</p>
                <p className="font-medium">{shop.mobile}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{shop.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{new Date(shop.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Description - if available */}
            {shop.description && (
              <div className="mb-3">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-xs line-clamp-2">{shop.description}</p>
              </div>
            )}

            {/* Quick Action Buttons - Compact for mobile */}
            <div className="flex gap-2 mt-2">
              <Link
                to={`/shop/${shop._id}`} 
                state={{ from: 'admin-manage-shops' }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-xs"
              >
                <FaEye size={12} />
                <span>View</span>
              </Link>
              
              <button
                onClick={() => handleEditShop(shop)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition text-xs"
              >
                <FaEdit size={12} />
                <span>Edit</span>
              </button>
              
              {shop.status === 'active' ? (
                <button
                  onClick={() => handleStatusChange(shop._id, 'suspended')}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition text-xs"
                >
                  <FaTimes size={12} />
                  <span>Suspend</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(shop._id, 'active')}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition text-xs"
                >
                  <FaCheck size={12} />
                  <span>Activate</span>
                </button>
              )}
              
              <button
                onClick={() => handleDeleteShop(shop._id)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-xs"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile-optimized Filter Section with dropdown
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <DashboardMobileLayout>
      <div className="max-w-full overflow-hidden">
        {/* Mobile Header with Title and Filter Toggle */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <FaStore className="text-emerald-600" />
            Manage Shops
          </h1>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 rounded-full bg-gray-100 text-gray-700"
              aria-label="Toggle filters"
            >
              <FaFilter size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Filters - Collapsible */}
        <div className={`bg-white px-4 py-3 border-b border-gray-200 transition-all duration-300 ${
          showMobileFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden py-0'
        }`}>
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shops..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <FaSearch size={14} />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full p-2 text-sm border border-gray-300 rounded-lg"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="col-span-2 mt-2">
              <div className="flex justify-between">
                <label className="block text-xs font-medium text-gray-700">Sort By</label>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-xs text-gray-700 flex items-center gap-1"
                >
                  <FaSort size={12} />
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
              <select
                className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-lg"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Shop Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Shop List */}
        <div className="px-4 py-3">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loading />
            </div>
          ) : shops.length > 0 ? (
            <div className="space-y-0">
              <div className="text-xs text-gray-500 mb-2">
                Showing {shops.length} of {pagination.totalItems || 0} shops
              </div>

              {shops.map(shop => (
                <MobileShopCard key={shop._id} shop={shop} />
              ))}

              {/* Simple Mobile Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaStore className="text-4xl text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">No shops found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
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
          message="Are you sure you want to permanently delete this shop? This action cannot be undone."
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
    </DashboardMobileLayout>
  );
};

export default ManageShops;
