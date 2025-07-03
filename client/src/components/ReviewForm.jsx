import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import StarRating from './StarRating';
import summaryApi from '../common/summaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';

const ReviewForm = ({ 
    isOpen, 
    onClose, 
    productId, 
    productName, 
    eligibleOrders = [], 
    onReviewAdded,
    preSelectedOrderId = null,
    preSelectedChatId = null
}) => {    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-select order when pre-selected parameters are provided
    useEffect(() => {
        if (isOpen && preSelectedOrderId && eligibleOrders.length > 0) {
            const matchingOrder = eligibleOrders.find(order => 
                order.orderId === preSelectedOrderId && 
                order.chatId === preSelectedChatId
            );
            
            if (matchingOrder) {
                setSelectedOrder(preSelectedOrderId);
            }
        }
    }, [isOpen, preSelectedOrderId, preSelectedChatId, eligibleOrders]);

    // Reset form when closing
    useEffect(() => {
        if (!isOpen) {
            setRating(0);
            setComment('');
            setSelectedOrder('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rating) {
            toast.error('Please select a rating');
            return;
        }
        
        if (!selectedOrder) {
            toast.error('Please select an order');
            return;
        }

        const selectedOrderData = eligibleOrders.find(order => order.orderId === selectedOrder);
        
        try {
            setLoading(true);
            
            const response = await Axios({
                ...summaryApi.addReview,
                data: {
                    productId,
                    orderId: selectedOrder,
                    chatId: selectedOrderData.chatId,
                    rating,
                    comment: comment.trim()
                }
            });

            if (response.data.success) {
                toast.success('Review added successfully!');
                onReviewAdded();
                onClose();
                setRating(0);
                setComment('');
                setSelectedOrder('');
            }
            
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-green-700">Write a Review</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">{productName}</h3>
                        <p className="text-sm text-gray-600">Share your experience with this eco-friendly product</p>
                    </div>

                    {/* Order Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Order
                        </label>
                        <select
                            value={selectedOrder}
                            onChange={(e) => setSelectedOrder(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        >
                            <option value="">Choose an order to review</option>
                            {eligibleOrders.map((order) => (
                                <option key={order.orderId} value={order.orderId}>
                                    Order from {new Date(order.orderDate).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            <StarRating 
                                rating={rating}
                                size="text-2xl"
                                interactive={true}
                                onRatingChange={setRating}
                            />
                            <span className="text-sm text-gray-600">
                                {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell others about your experience with this sustainable product..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !rating}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
