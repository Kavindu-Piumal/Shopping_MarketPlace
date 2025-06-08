import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaUser, FaLeaf, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import StarRating from './StarRating';
import summaryApi from '../common/summaryApi';
import Axios from '../utils/Axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ReviewSection = forwardRef(({ productId, productName, onReviewChange = null }, ref) => {
    const user = useSelector(state => state.user);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);    const [hasMore, setHasMore] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editData, setEditData] = useState({ rating: 0, comment: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, reviewId: null });

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        refreshReviews: () => fetchReviews(1)
    }));

const fetchReviews = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await Axios({
                ...summaryApi.getProductReviews,
                url: `${summaryApi.getProductReviews.url}/${productId}?page=${pageNum}&limit=5`
            });

            if (response.data.success) {
                const { reviews: newReviews, stats: reviewStats, pagination } = response.data.data;
                
                if (pageNum === 1) {
                    setReviews(newReviews);
                } else {
                    setReviews(prev => [...prev, ...newReviews]);
                }
                
                setStats(reviewStats);
                setHasMore(pagination.hasMore);
                setPage(pageNum);
                
                // Call callback if provided for parent component updates
                if (onReviewChange && pageNum === 1) {
                    onReviewChange(reviewStats);
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };    useEffect(() => {
        fetchReviews(1);
    }, [productId]);

    const loadMoreReviews = () => {
        fetchReviews(page + 1);
    };

    const handleEditReview = (review) => {
        setEditingReview(review._id);
        setEditData({
            rating: review.rating,
            comment: review.comment || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setEditData({ rating: 0, comment: '' });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await Axios({
                ...summaryApi.updateReview,
                url: `${summaryApi.updateReview.url}/${editingReview}`,
                data: editData
            });

            if (response.data.success) {
                toast.success('Review updated successfully!');
                setEditingReview(null);
                setEditData({ rating: 0, comment: '' });
                fetchReviews(1); // Refresh reviews
            }
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        }
    };    const handleDeleteReview = async (reviewId) => {
        setDeleteConfirm({ show: true, reviewId });
    };

    const confirmDelete = async () => {
        const reviewId = deleteConfirm.reviewId;
        try {
            const response = await Axios({
                ...summaryApi.deleteReview,
                url: `${summaryApi.deleteReview.url}/${reviewId}`
            });

            if (response.data.success) {
                toast.success('Review deleted successfully!');
                fetchReviews(1); // Refresh reviews
                setDeleteConfirm({ show: false, reviewId: null });
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, reviewId: null });
    };

    const handleRatingChange = (rating) => {
        setEditData(prev => ({ ...prev, rating }));
    };

    const handleCommentChange = (e) => {
        setEditData(prev => ({ ...prev, comment: e.target.value }));
    };

    const getRatingWidth = (rating) => {
        const total = stats.totalReviews;
        if (total === 0) return 0;
        return (stats.ratingDistribution[rating] / total) * 100;
    };

    if (loading && page === 1) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <FaLeaf className="text-green-600" />
                <h3 className="text-xl font-semibold text-green-800">
                    Customer Reviews & Sustainability Impact
                </h3>
            </div>

            {stats.totalReviews > 0 ? (
                <>
                    {/* Rating Summary */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-8">
                        {/* Overall Rating */}
                        <div className="flex-1">
                            <div className="text-center lg:text-left">
                                <div className="text-4xl font-bold text-green-700 mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <StarRating rating={stats.averageRating} size="text-lg" />
                                <p className="text-gray-600 mt-2">
                                    Based on {stats.totalReviews} verified purchase{stats.totalReviews !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1">
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-2 text-sm">
                                        <span className="w-8">{rating} ★</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getRatingWidth(rating)}%` }}
                                            ></div>
                                        </div>
                                        <span className="w-8 text-gray-600">
                                            {stats.ratingDistribution[rating]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.map((review) => {
                            const isOwner = user?._id === review.userId?._id;
                            const isEditing = editingReview === review._id;
                            
                            return (
                                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FaUser className="text-green-600" />
                                        </div>

                                        {/* Review Content */}
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">
                                                        {review.userId?.name || 'Verified Buyer'}
                                                    </h4>
                                                    <div className="flex items-center gap-2">                                                        {isEditing ? (
                                                            <StarRating 
                                                                rating={editData.rating} 
                                                                size="text-sm"
                                                                interactive={true}
                                                                onRatingChange={handleRatingChange}
                                                            />
                                                        ) : (
                                                            <StarRating rating={review.rating} size="text-sm" />
                                                        )}
                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                            Verified Purchase
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Edit/Delete buttons for review owner */}
                                                {isOwner && !isEditing && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditReview(review)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                            title="Edit review"
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                            title="Delete review"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Save/Cancel buttons when editing */}
                                                {isOwner && isEditing && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors flex items-center gap-1"
                                                            title="Save changes"
                                                        >
                                                            <FaSave size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                                                            title="Cancel edit"
                                                        >
                                                            <FaTimes size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Comment section */}
                                            {isEditing ? (
                                                <textarea
                                                    value={editData.comment}
                                                    onChange={handleCommentChange}
                                                    placeholder="Update your review comment..."
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 resize-none mb-2"
                                                    rows="3"
                                                />
                                            ) : (
                                                review.comment && (
                                                    <p className="text-gray-700 mb-2 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                )
                                            )}

                                            <p className="text-xs text-gray-500">
                                                {isEditing ? (
                                                    <span className="text-blue-600 font-medium">Editing review...</span>
                                                ) : (
                                                    <>
                                                        Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                        {review.updatedAt !== review.createdAt && (
                                                            <span className="ml-2 text-gray-400">(Updated)</span>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center mt-6">
                            <button
                                onClick={loadMoreReviews}
                                disabled={loading}
                                className="px-6 py-2 text-green-600 border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Loading...' : 'Load More Reviews'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <FaLeaf className="mx-auto text-4xl text-green-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">
                        No Reviews Yet
                    </h4>
                    <p className="text-gray-500">
                        Be the first to share your experience with this sustainable product!
                    </p>                </div>
            )}
            
            {/* Beautiful Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform transition-all">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <FaExclamationTriangle className="text-red-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Delete Review
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete this review? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}        </div>
    );
});

ReviewSection.displayName = 'ReviewSection';

export default ReviewSection;
