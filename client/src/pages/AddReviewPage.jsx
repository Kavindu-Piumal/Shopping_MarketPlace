import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotification } from '../context/NotificationContext';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { Star, ArrowLeft, Package, User } from 'lucide-react';

const AddReviewPage = () => {
    const { productId } = useParams();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const chatId = searchParams.get('chatId'); // Get chatId from URL params

    const [product, setProduct] = useState(null);
    const [order, setOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const user = useSelector(state => state.user);
    const { showSuccess, showError, axiosNotificationError } = useNotification();
    const navigate = useNavigate();

    // Fetch product and order details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);

                // Fetch product details - FIXED: Use POST method with productId in body
                const productResponse = await Axios({
                    url: summaryApi.getProductDetails.url,
                    method: summaryApi.getProductDetails.method,
                    data: {
                        productId: productId
                    }
                });

                if (productResponse.data.success) {
                    setProduct(productResponse.data.data);
                }

                // Fetch order details if orderId is provided
                if (orderId) {
                    const orderResponse = await Axios({
                        url: `${summaryApi.getorderDetails.url}?orderId=${orderId}`,
                        method: summaryApi.getorderDetails.method
                    });

                    if (orderResponse.data.success) {
                        setOrder(orderResponse.data.data);
                    }
                }
            } catch (error) {
                axiosNotificationError(error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchDetails();
        }
    }, [productId, orderId]);

    // Submit review
    const handleSubmitReview = async () => {
        if (rating === 0) {
            showError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            showError('Please write a review comment');
            return;
        }

        try {
            setSubmitting(true);

            // If we don't have chatId from URL, try to find it from the order
            let reviewChatId = chatId;

            if (!reviewChatId && orderId) {
                try {
                    // Try to find the chat associated with this order
                    const chatResponse = await Axios({
                        url: `${summaryApi.getUserChats.url}`,
                        method: summaryApi.getUserChats.method
                    });

                    if (chatResponse.data.success) {
                        const chats = chatResponse.data.data;
                        const orderChat = chats.find(chat =>
                            chat.orderId && (chat.orderId._id === orderId || chat.orderId === orderId)
                        );
                        if (orderChat) {
                            reviewChatId = orderChat._id;
                        }
                    }
                } catch (error) {
                    console.log('Could not find chat for order, proceeding without chatId');
                }
            }

            const response = await Axios({
                url: summaryApi.addReview?.url || `${summaryApi.baseURL}/api/review/add`,
                method: summaryApi.addReview?.method || 'post',
                data: {
                    productId,
                    orderId,
                    chatId: reviewChatId, // Include chatId in the request
                    rating,
                    comment: comment.trim()
                }
            });

            if (response.data.success) {
                showSuccess('Review submitted successfully!');

                // Set localStorage flag to indicate review has been submitted
                const reviewStartedKey = `review_started_${productId}_${orderId}`;
                localStorage.setItem(reviewStartedKey, 'true');

                // Use client-side navigation for better UX
                setTimeout(() => {
                    navigate('/dashboard/myorders');
                }, 2000);
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
                    <p className="text-gray-600 mt-2">Share your experience with this product</p>
                </div>

                {/* Review Form */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Product Information */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex gap-4">
                            <img
                                src={product.image?.[0]}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-gray-600 mt-1">LKR {product.price}</p>
                                {order && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Package size={16} className="text-green-600" />
                                        <span className="text-sm text-green-600">Verified Purchase</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate this product</h4>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-colors"
                                >
                                    <Star
                                        size={32}
                                        className={`${
                                            star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-3 text-gray-600">
                                {rating === 0 ? 'Select rating' :
                                 rating === 1 ? 'Poor' :
                                 rating === 2 ? 'Fair' :
                                 rating === 3 ? 'Good' :
                                 rating === 4 ? 'Very Good' : 'Excellent'}
                            </span>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Write your review</h4>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell others about your experience with this product..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">
                                {comment.length}/500 characters
                            </span>
                            <span className="text-sm text-gray-500">
                                Be honest and helpful
                            </span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">Your review will be public</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="p-6">
                        <div className="flex gap-4 flex-col xs:flex-row">
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-base xs:text-sm"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || !comment.trim() || submitting}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base xs:text-sm"
                            >
                                {submitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Submitting...
                                    </div>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Review Guidelines</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Be honest and fair in your review</li>
                        <li>• Focus on the product quality and your experience</li>
                        <li>• Avoid personal information or inappropriate content</li>
                        <li>• Help other buyers make informed decisions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AddReviewPage;
