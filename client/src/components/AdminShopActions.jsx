import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import { useNavigate } from 'react-router-dom';
import CreateShopModal from './CreateShopModal';

const AdminShopActions = ({ shop, onShopUpdated }) => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await Axios({
        url: `${summaryApi.updateShopStatus.url}/${shop._id}`,
        method: summaryApi.updateShopStatus.method,
        data: { status: newStatus }
      });

      if (response.data.success) {
        showSuccess(`Shop status changed to ${newStatus}`);
        onShopUpdated(); // Refresh shop data
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  const handleDeleteShop = async () => {
    if (!window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await Axios({
        url: `${summaryApi.deleteShop.url}/${shop._id}`,
        method: 'DELETE'
      });

      if (response.data.success) {
        showSuccess('Shop deleted successfully');
        navigate('/shops'); // Redirect to shops page
      }
    } catch (error) {
      axiosNotificationError(error);
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

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" />
            Admin Controls
          </h3>
          <p className="text-sm text-gray-600">
            These controls are only visible to administrators
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Current Status:</p>
          {getStatusBadge(shop.status)}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <FaEdit /> Edit Shop
          </button>

          {shop.status !== 'active' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <FaCheck /> Activate
            </button>
          )}

          {shop.status === 'active' && (
            <button
              onClick={() => handleStatusChange('suspended')}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <FaTimes /> Suspend
            </button>
          )}

          <button
            onClick={handleDeleteShop}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <FaTrash /> Delete Shop
          </button>
        </div>
      </div>

      {/* Edit Shop Modal */}
      {showEditModal && (
        <CreateShopModal 
          close={() => setShowEditModal(false)}
          onShopCreated={() => {
            setShowEditModal(false);
            onShopUpdated();
          }}
          shopData={shop}
          isEditing={true}
        />
      )}
    </>
  );
};

export default AdminShopActions;
