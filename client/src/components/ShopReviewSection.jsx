import React, { useState, useEffect } from 'react';
import { FaStar, FaUser, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useAxiosNotificationError } from '../utils/AxiosNotificationError';
import Loading from './Loading';
import ShopReviewForm from './ShopReviewForm';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ShopReviewSection = ({ shopId }) => {
  const axiosNotificationError = useAxiosNotificationError();
  const user = useSelector(state => state.user);
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (user?._id) {
      checkCanReview();
    }
  }, [shopId, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: `${summaryApi.getShopReviews.url}/${shopId}`,
        method: summaryApi.getShopReviews.method
      });
      
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await Axios({
        url: `${summaryApi.getShopReviewStats.url}/${shopId}`,
        method: summaryApi.getShopReviewStats.method
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Stats are optional, don't show error
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await Axios({
        url: `${summaryApi.canUserReviewShop.url}/${shopId}`,
        method: summaryApi.canUserReviewShop.method
      });
      
      if (response.data.success) {
        setCanReview(response.data.data.canReview);
        setUserOrders(response.data.data.eligibleOrders || []);
      }
    } catch (error) {
      // Can review check is optional
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await Axios({
        url: `${summaryApi.deleteShopReview.url}/${reviewId}`,
        method: summaryApi.deleteShopReview.method
      });

      if (response.data.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
        fetchStats();
        checkCanReview();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleReviewAdded = () => {
    fetchReviews();
    fetchStats();
    checkCanReview();
    setShowReviewForm(false);
    setEditingReview(null);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StarDisplay = ({ rating, size = 'text-base' }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );

  const AspectRating = ({ label, rating }) => (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <StarDisplay rating={rating} size="text-xs" />
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shop Reviews</h2>
        {canReview && userOrders.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Write Review
            </button>
          </div>
        )}
      </div>

      {/* Review Stats */}
      {stats && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Overall Rating</h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {stats.averageRating?.toFixed(1) || 'N/A'}
                </span>
                <div>
                  <StarDisplay rating={Math.round(stats.averageRating || 0)} />
                  <p className="text-sm text-gray-600">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {stats.aspectAverages && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Aspect Ratings</h3>
                <div className="space-y-2">
                  <AspectRating label="Communication" rating={stats.aspectAverages.communication || 0} />
                  <AspectRating label="Product Quality" rating={stats.aspectAverages.productQuality || 0} />
                  <AspectRating label="Shipping Speed" rating={stats.aspectAverages.shipping || 0} />
                  <AspectRating label="Customer Service" rating={stats.aspectAverages.service || 0} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {review.userId?.name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} />
                  {user?._id === review.userId?._id && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingReview(review);
                          setShowReviewForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit review"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete review"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{review.comment}</p>
              
              {review.aspects && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Detailed Ratings</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <AspectRating label="Communication" rating={review.aspects.communication} />
                    <AspectRating label="Product Quality" rating={review.aspects.productQuality} />
                    <AspectRating label="Shipping Speed" rating={review.aspects.shipping} />
                    <AspectRating label="Customer Service" rating={review.aspects.service} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to review this shop!</p>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ShopReviewForm
          shopId={shopId}
          orderId={selectedOrder || (userOrders.length > 0 ? userOrders[0]._id : null)}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
            setSelectedOrder(null);
          }}
          onReviewAdded={handleReviewAdded}
          existingReview={editingReview}
        />
      )}
    </div>
  );
};

export default ShopReviewSection;
