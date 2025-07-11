import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNotification } from '../../context/NotificationContext';
import Axios from '../../utils/Axios';
import summaryApi, { baseURL } from '../../common/summaryApi';
import ConfirmBox from '../ConfirmBox';
import {
    Eye,
    Package,
    Trash2,
    Star,
    AlertCircle,
    ShoppingBag,
    Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderControls = ({
    conversation,
    onUpdate,
    onShowOrderDetails,
    onDeleteChat,
    isMobile = false
}) => {
    const [loading, setLoading] = useState({});
    const [hasReviewed, setHasReviewed] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [justFinalized, setJustFinalized] = useState(false);
    const user = useSelector(state => state.user);
    const { showSuccess, axiosNotificationError } = useNotification();
    const navigate = useNavigate();

    const isUserBuyer = conversation.buyerId._id === user._id;
    const isUserSeller = conversation.sellerId._id === user._id;
    const hasOrder = conversation.orderId ? true : false;

    // Extract IDs for use throughout the component
    const productId = conversation.productId?._id || conversation.productId;
    const orderId = conversation.orderId?._id || conversation.orderId;

    // Check if user has already reviewed this product or started the review process
    useEffect(() => {
        if (isUserBuyer && hasOrder && conversation.orderCompleted && productId && orderId) {
            // First check localStorage to see if user has started the review process
            const reviewStartedKey = `review_started_${productId}_${orderId}`;
            const hasStartedReview = localStorage.getItem(reviewStartedKey) === 'true';

            if (hasStartedReview) {
                setHasReviewed(true);
                return;
            }

            // If not in localStorage, check with the API
            const checkReviewStatus = async () => {
                try {
                    const response = await Axios({
                        url: `${baseURL}/api/review/can-review/${productId}?orderId=${orderId}`,
                        method: 'get'
                    });

                    if (response.data.success) {
                        setHasReviewed(response.data.data.hasReviewed);
                    }
                } catch (error) {
                    console.log('Error checking review status:', error);
                    // If API doesn't exist or fails, assume they haven't reviewed
                    setHasReviewed(false);
                }
            };

            checkReviewStatus();
        }
    }, [isUserBuyer, hasOrder, conversation.orderCompleted, productId, orderId, conversation]);

    // Prevent sellers from confirming their own orders
    const canConfirmOrder = isUserSeller && hasOrder && !conversation.orderConfirmed && !isUserBuyer;

    // Prevent buyers from finalizing orders they didn't place
    const canFinalizeOrder = isUserBuyer && hasOrder && conversation.orderConfirmed && !conversation.orderCompleted && !isUserSeller;

    // Only buyers can add reviews after completing orders AND they haven't already reviewed
    const canAddReview = isUserBuyer && hasOrder && conversation.orderCompleted && !isUserSeller && !hasReviewed;

    const handleAction = async (action, endpoint, successMessage) => {
        setLoading(prev => ({ ...prev, [action]: true }));

        try {
            const response = await Axios({
                url: endpoint,
                method: 'put',
                data: { chatId: conversation._id }
            });

            if (response.data.success) {
                showSuccess(successMessage);

                // Re-fetch the latest conversation/order data after action
                if (onUpdate) {
                    try {
                        const refreshed = await Axios({
                            url: `${summaryApi.getUserChats.url}/${conversation._id}`,
                            method: 'get'
                        });
                        if (refreshed.data.success && refreshed.data.data) {
                            onUpdate(refreshed.data.data);
                        } else {
                            // fallback: update with needsRefresh flag
                            onUpdate({ ...conversation, needsRefresh: true });
                        }
                    } catch (refreshErr) {
                        // fallback: update with needsRefresh flag
                        onUpdate({ ...conversation, needsRefresh: true });
                    }
                }
                return true;
            }
            return false; // Return false if not successful
        } catch (error) {
            axiosNotificationError(error);
            return false; // Return false on error
        } finally {
            setLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    const handleConfirmOrder = async () => {
        if (!canConfirmOrder) return;

        // Extract the actual order ID - handle both string and object formats
        const orderId = conversation.orderId?._id || conversation.orderId;

        const success = await handleAction(
            'confirm',
            `${summaryApi.confirmOrder.url}/${orderId}`,
            'Order confirmed and shipped! Buyer has been notified.'
        );

        // If successful, immediately update the conversation state to hide the button
        if (success && onUpdate) {
            // Update the conversation state immediately to reflect the confirmed status
            onUpdate({
                ...conversation,
                orderConfirmed: true,
                orderConfirmedAt: new Date()
            });
            console.log('Order confirmed successfully - button should now disappear');
        }
    };

    const handleFinalizeOrder = async () => {
        if (!canFinalizeOrder) return;

        // Extract the actual order ID - handle both string and object formats
        const orderId = conversation.orderId?._id || conversation.orderId;

        const success = await handleAction(
            'finalize',
            `${summaryApi.finalizeOrder?.url || summaryApi.completeOrder?.url}/${orderId}`,
            'Order completed! You can now add a review.'
        );

        if (success) {
            // Set justFinalized to true after successful finalization
            setJustFinalized(true);
        }
    };

    const handleDeleteChat = async () => {
        setConfirmOpen(false); // Close confirm box if open
        if (window.confirm('Are you sure you want to delete this chat?')) {
            setLoading(prev => ({ ...prev, delete: true }));

            try {
                const response = await Axios({
                    url: `${summaryApi.deleteChat?.url || `${summaryApi.getUserChats.url}/delete`}/${conversation._id}`,
                    method: 'delete'
                });

                if (response.data.success) {
                    showSuccess('Chat deleted successfully');
                    if (onDeleteChat) {
                        onDeleteChat(conversation._id);
                    }
                }
            } catch (error) {
                axiosNotificationError(error);
            } finally {
                setLoading(prev => ({ ...prev, delete: false }));
            }
        }
    };

    const handleAddReview = () => {
        // Check if user has already reviewed the product
        if (hasReviewed) {
            // Show notification that they've already reviewed this product
            showSuccess('You have already reviewed this product. You can edit or delete your review in the product details page.');
            return;
        }

        // Extract the actual product ID - handle both string and object formats
        const productId = conversation.productId?._id || conversation.productId;
        const orderId = conversation.orderId?._id || conversation.orderId;

        // Use client-side navigation for better UX
        navigate(`/add-review/${productId}?orderId=${orderId}`);
    };

    if (!hasOrder) {
        return (
            <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                <button
                    onClick={onShowOrderDetails}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    disabled={loading.details}
                >
                    <Eye size={14} />
                    {isMobile ? 'Details' : 'Product Details'}
                </button>

                <button
                    onClick={handleDeleteChat}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    disabled={loading.delete}
                >
                    <Trash2 size={14} />
                    {loading.delete ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-3 p-3 bg-gray-50 rounded-lg border ${isMobile ? 'text-sm' : ''}`}>
            {/* Order Status Indicator */}
            <div className="flex items-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} className="text-blue-600" />
                <span>Order Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    conversation.orderCompleted ? 'bg-green-100 text-green-700' :
                    conversation.orderConfirmed ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                }`}>
                    {conversation.orderCompleted ? 'Completed' :
                     conversation.orderConfirmed ? 'Shipped' : 'Pending'}
                </span>
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                <button
                    onClick={onShowOrderDetails}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    disabled={loading.details}
                >
                    <Eye size={14} />
                    {isMobile ? 'Order' : 'Order Details'}
                </button>

                {canConfirmOrder && (
                    <button
                        onClick={handleConfirmOrder}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        disabled={loading.confirm}
                    >
                        <Truck size={14} />
                        {loading.confirm ? 'Confirming...' : (isMobile ? 'Ship' : 'Confirm & Ship')}
                    </button>
                )}

                {canFinalizeOrder && !justFinalized && (
                    <button
                        onClick={handleFinalizeOrder}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                        disabled={loading.finalize}
                    >
                        <Package size={14} />
                        {loading.finalize ? 'Finalizing...' : (isMobile ? 'Received' : 'Mark as Received')}
                    </button>
                )}

                {/* Show Add Review button if order is completed and user hasn't reviewed, OR if order was just finalized */}
                {((isUserBuyer && hasOrder && conversation.orderCompleted && !isUserSeller && !hasReviewed) || 
                  (isUserBuyer && justFinalized && !hasReviewed)) && (
                    <button
                        onClick={handleAddReview}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                    >
                        <Star size={14} />
                        {isMobile ? 'Review' : 'Add Review'}
                    </button>
                )}

                <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    disabled={loading.delete}
                >
                    <Trash2 size={14} />
                    {loading.delete ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            {/* Status Messages */}
            {!conversation.orderConfirmed && isUserSeller && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-700">
                        <p className="font-medium">Action Required</p>
                        <p>Confirm this order when you've shipped the product to notify the buyer.</p>
                    </div>
                </div>
            )}

            {conversation.orderConfirmed && !conversation.orderCompleted && isUserBuyer && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Package size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                        <p className="font-medium">Order Shipped</p>
                        <p>Mark as received when you get your package to complete the order.</p>
                    </div>
                </div>
            )}

            {conversation.orderCompleted && canAddReview && (
                <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <Star size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-700">
                        <p className="font-medium">Order Completed</p>
                        <p>Share your experience by adding a review for this product.</p>
                    </div>
                </div>
            )}

            {/* Confirm Box for Delete Action */}
            {confirmOpen && (
                <ConfirmBox
                    close={() => setConfirmOpen(false)}
                    cancel={() => setConfirmOpen(false)}
                    confirm={async () => {
                        setConfirmOpen(false);
                        setLoading(prev => ({ ...prev, delete: true }));

                        try {
                            const response = await Axios({
                                url: `${summaryApi.deleteChat?.url || `${summaryApi.getUserChats.url}/delete`}/${conversation._id}`,
                                method: 'delete'
                            });

                            if (response.data.success) {
                                showSuccess('Chat deleted successfully');
                                if (onDeleteChat) {
                                    onDeleteChat(conversation._id);
                                }
                            }
                        } catch (error) {
                            axiosNotificationError(error);
                        } finally {
                            setLoading(prev => ({ ...prev, delete: false }));
                        }
                    }}
                    title="Delete Chat"
                    message="Are you sure you want to delete this chat? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </div>
    );
};

export default OrderControls;
