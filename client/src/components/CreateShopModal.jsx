import React, { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaStore, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTags, FaClock } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import Loading from './Loading';

const CreateShopModal = ({ close, onShopCreated, shopData = null, isEditing = false }) => {
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const [loading, setLoading] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const modalRef = useRef(null);
    // Add outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        close();
      }
    };
    
    // Add escape key handler
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [close]);
  
  // Initialize form data with existing shop data if editing
  const [formData, setFormData] = useState(() => {
    if (shopData && isEditing) {
      // Convert keywords array to comma-separated string for form
      const keywordsString = shopData.keywords ? shopData.keywords.join(', ') : '';
      
      return {
        name: shopData.name || '',
        description: shopData.description || '',
        category: shopData.category || '',
        keywords: keywordsString,
        mobile: shopData.mobile || '',
        email: shopData.email || '',
        address: {
          street: shopData.address?.street || '',
          city: shopData.address?.city || '',
          state: shopData.address?.state || '',
          country: shopData.address?.country || 'Sri Lanka',
          pincode: shopData.address?.pincode || ''
        },
        socialLinks: {
          website: shopData.socialLinks?.website || '',
          facebook: shopData.socialLinks?.facebook || '',
          instagram: shopData.socialLinks?.instagram || '',
          twitter: shopData.socialLinks?.twitter || ''
        },
        operatingHours: shopData.operatingHours || {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '16:00', isOpen: true },
          sunday: { open: '10:00', close: '15:00', isOpen: false }
        }
      };
    } else {
      // Default empty form for new shop
      return {
        name: '',
        description: '',
        category: '',
        keywords: '',
        mobile: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: 'Sri Lanka',
          pincode: ''
        },
        socialLinks: {
          website: '',
          facebook: '',
          instagram: '',
          twitter: ''
        },
        operatingHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '16:00', isOpen: true },
          sunday: { open: '10:00', close: '15:00', isOpen: false }
        }
      };
    }
  });

  // Fetch shop categories on component mount
  useEffect(() => {
    fetchShopCategories();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: field === 'isOpen' ? value : value
        }
      }
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category || !formData.mobile.trim()) {
      showSuccess('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Convert keywords string to array
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const shopData = {
        ...formData,
        keywords: keywordsArray
      };

      let response;

      if (isEditing) {
        // Update existing shop
        response = await Axios({
          url: `${summaryApi.updateShop.url}`,
          method: summaryApi.updateShop.method,
          data: shopData
        });
      } else {
        // Create new shop
        response = await Axios({
          url: summaryApi.createShop.url,
          method: summaryApi.createShop.method,
          data: shopData
        });
      }

      if (response.data.success) {
        showSuccess(response.data.message);
        onShopCreated && onShopCreated();
        close();
        
        // Reload to update user role (only for create, not for edit)
        if (!isEditing) {
          window.location.reload();
        }
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <section className="fixed inset-0 p-2 bg-neutral-800 bg-opacity-90 flex items-start justify-center overflow-y-auto z-[999]" style={{ backdropFilter: 'blur(5px)' }}>      <div ref={modalRef} className="bg-white max-w-4xl w-full my-8 rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaStore className="text-green-600" />
            {isEditing ? 'Edit Your Shop' : 'Create Your Shop'}
          </h2>
          <button 
            onClick={close} 
            className="hover:bg-red-500 hover:text-white p-2 rounded-full transition-all"
          >
            <IoClose size={24} />
          </button>        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Green Electronics Store"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {shopCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your shop and what you sell..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTags className="inline mr-1" />
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., electronics, mobile, laptop, accessories"
              />
              <p className="text-xs text-gray-500 mt-1">Help customers find your shop with relevant keywords</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-1" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+94 77 123 4567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-1" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="shop@example.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              <FaMapMarkerAlt className="inline mr-1" />
              Shop Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Colombo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Western Province"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Sri Lanka"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              <FaClock className="inline mr-1" />
              Operating Hours
            </h3>
            <div className="space-y-3">
              {dayNames.map(day => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-20">
                    <span className="capitalize font-medium">{day.substring(0, 3)}</span>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.operatingHours[day].isOpen}
                      onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                      className="mr-2"
                    />
                    Open
                  </label>
                  {formData.operatingHours[day].isOpen && (
                    <>
                      <input
                        type="time"
                        value={formData.operatingHours[day].open}
                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={formData.operatingHours[day].close}
                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Social Media (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://yourshop.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://facebook.com/yourshop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://instagram.com/yourshop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourshop"
                />              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t sticky bottom-0 bg-white pb-4 px-4">
            <button
              type="button"
              onClick={close}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-md"
            >              {loading ? <Loading /> : <FaStore />}
              {loading 
                ? (isEditing ? 'Updating Shop...' : 'Creating Shop...') 
                : (isEditing ? 'Update Shop' : 'Create Shop')
              }
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateShopModal;
