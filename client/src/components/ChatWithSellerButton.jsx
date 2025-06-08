import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import { useNotification } from '../context/NotificationContext';
import summaryApi from '../common/summaryApi';

const ChatWithSellerButton = ({ product, className = "" }) => {
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError, axiosNotificationError } = useNotification();
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    
    // Don't render the button if the current user is the seller
    if (user?._id && product?.sellerId === user._id) {
        return null;
    }
    
    const handleChatWithSeller = async (e) => {
        e.preventDefault();
        e.stopPropagation();        // Check if user is logged in
        if (!user?._id) {
            showError('Please login to chat with seller');
            navigate('/login');
            return;
        }

        // Check if product data is available
        if (!product || !product._id) {
            showError('Product information is not available');
            return;
        }

        // Check if user is trying to chat with themselves
        if (product.sellerId === user._id) {
            showError('You cannot chat about your own product');
            return;
        }

        try {
            setLoading(true);
            
            const response = await Axios({
                url: summaryApi.createProductChat.url,
                method: summaryApi.createProductChat.method,
                data: {
                    productId: product._id
                }
            });            if (response.data.success) {
                showSuccess('Chat started successfully!');
                // Navigate to chat with the specific chat selected
                navigate('/chat', { 
                    state: { 
                        selectedChatId: response.data.data._id,
                        productContext: {
                            name: product.name,
                            image: product.image?.[0],
                            price: product.price
                        }
                    } 
                });
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                showSuccess('Opening existing chat...');
                navigate('/chat');
            } else {
                axiosNotificationError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleChatWithSeller}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting Chat...</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Chat with Seller</span>
                </>
            )}
        </button>
    );
};

export default ChatWithSellerButton;
