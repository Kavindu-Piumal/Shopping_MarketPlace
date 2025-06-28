import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import toast from 'react-hot-toast';

const ShopReviewForm = ({ shopId, orderId, onClose, onReviewAdded, existingReview = null }) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || '',
    aspects: {
      communication: existingReview?.aspects?.communication || 0,
      productQuality: existingReview?.aspects?.productQuality || 0,
      shipping: existingReview?.aspects?.shipping || 0,
      service: existingReview?.aspects?.service || 0
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const aspectLabels = {
    communication: 'Communication',
    productQuality: 'Product Quality',
    shipping: 'Shipping Speed',
    service: 'Customer Service'
  };

  const handleRatingChange = (field, rating) => {
    if (field === 'overall') {
      setFormData(prev => ({ ...prev, rating }));
    } else {
      setFormData(prev => ({
        ...prev,
        aspects: { ...prev.aspects, [field]: rating }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData = {
        shopId,
        orderId,
        ...formData
      };

      let response;
      if (existingReview) {
        response = await Axios({
          url: `${summaryApi.updateShopReview.url}/${existingReview._id}`,
          method: summaryApi.updateShopReview.method,
          data: requestData
        });
      } else {
        response = await Axios({
          url: summaryApi.addShopReview.url,
          method: summaryApi.addShopReview.method,
          data: requestData
        });
      }

      if (response.data.success) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review added successfully!');
        onReviewAdded && onReviewAdded(response.data.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 w-24">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <FaStar />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">({rating}/5)</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {existingReview ? 'Edit Shop Review' : 'Write Shop Review'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Overall Rating */}
            <div className="mb-6">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => handleRatingChange('overall', rating)}
                label="Overall"
              />
            </div>

            {/* Aspect Ratings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Specific Aspects</h3>
              <div className="space-y-3">
                {Object.entries(aspectLabels).map(([key, label]) => (
                  <StarRating
                    key={key}
                    rating={formData.aspects[key]}
                    onRatingChange={(rating) => handleRatingChange(key, rating)}
                    label={label}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Share your experience with this shop..."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopReviewForm;
