import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import MessageBubble from './MessageBubble';
import ImageUpload from './ImageUpload';
import VoiceRecorder from './VoiceRecorder';
import ConfirmBox from './ConfirmBox';
import { DisplayPriceInRupees } from '../utils/displaypriceinrupees';

const ChatWindow = ({ chat, user, onChatUpdate }) => {
    const { showSuccess, showError, axiosNotificationError } = useNotification();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCompleteOrderConfirm, setShowCompleteOrderConfirm] = useState(false);
    const [showReviewPrompt, setShowReviewPrompt] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const { socket, isConnected, sendMessage, emitTyping, emitStopTyping } = useSocket();

    const otherUser = chat.buyerId._id === user._id ? chat.sellerId : chat.buyerId;
    const isBuyer = chat.buyerId._id === user._id;
    const isSeller = chat.sellerId._id === user._id;

    // Fetch messages
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: `${summaryApi.getChatMessages.url}/${chat._id}`,
                method: summaryApi.getChatMessages.method
            });
            
            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch order details
    const fetchOrderDetails = async () => {
        // Only fetch order details if this chat has an order
        if (!chat.orderId) {
            return;
        }
        
        try {
            const response = await Axios({
                url: `${summaryApi.getOrderDetails.url}/${chat._id}`,
                method: summaryApi.getOrderDetails.method
            });

            if (response.data.success) {
                setOrderDetails(response.data.data.order);
            }
        } catch (error) {
            axiosNotificationError(error);
        }
    };

    // Confirm order (seller only)
    const handleConfirmOrder = async () => {
        if (!isSeller) {
            showError('Only sellers can confirm orders');
            return;
        }

        if (chat.orderConfirmed) {
            showError('Order has already been confirmed');
            return;
        }        try {
            setConfirmingOrder(true);
            const response = await Axios({
                url: `${summaryApi.confirmChatOrder.url}/${chat._id}`,
                method: summaryApi.confirmChatOrder.method
            });
            
            if (response.data.success) {
                showSuccess('Order confirmed successfully!');
                fetchOrderDetails();
                fetchMessages();
                onChatUpdate(response.data.data.chat);
                setShowOrderDetails(false); // Close modal if open
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setConfirmingOrder(false);
        }
    };

    // Delete chat
    const handleDeleteChat = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteChat = async () => {
        try {
            const response = await Axios({
                url: `${summaryApi.deleteChat.url}/${chat._id}`,
                method: summaryApi.deleteChat.method
            });
            
            if (response.data.success) {
                showSuccess('Chat deleted successfully');
                // Notify parent component
                if (onChatUpdate) {
                    onChatUpdate({ ...chat, deleted: true });
                }
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const cancelDeleteChat = () => {
        setShowDeleteConfirm(false);
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket event listeners
    useEffect(() => {
        if (socket && isConnected) {
            // Listen for new messages (only add if not from current user)
            socket.on('new-message', (message) => {
                if (message.chatId === chat._id && message.senderId._id !== user._id) {
                    setMessages(prev => [...prev, message]);
                }
            });

            // Listen for typing indicators
            socket.on('user-typing', ({ userId }) => {
                if (userId === otherUser._id) {
                    setTyping(true);
                }
            });

            socket.on('user-stop-typing', ({ userId }) => {
                if (userId === otherUser._id) {
                    setTyping(false);
                }
            });

            // Listen for order status updates
            socket.on('order-status-update', (data) => {
                if (data.chatId === chat._id) {
                    // Update chat status in real-time
                    onChatUpdate({
                        ...chat,
                        orderConfirmed: data.orderConfirmed,
                        orderConfirmedAt: data.orderConfirmedAt,
                        orderCompleted: data.orderCompleted,
                        completedAt: data.completedAt
                    });
                    
                    // Refresh order details if they exist
                    if (orderDetails) {
                        fetchOrderDetails();
                    }
                    
                    // Show real-time notification
                    if (data.orderConfirmed && !chat.orderConfirmed) {
                        showSuccess('Order has been confirmed by the seller!');
                    } else if (data.orderCompleted && !chat.orderCompleted) {
                        showSuccess('Order has been completed!');
                    }
                }
            });

            // Listen for chat updates (deletions, etc.)
            socket.on('chat-update', (data) => {
                if (data.chatId === chat._id) {
                    onChatUpdate(data.chat);
                }
            });

            return () => {
                socket.off('new-message');
                socket.off('user-typing');
                socket.off('user-stop-typing');
                socket.off('order-status-update');
                socket.off('chat-update');
            };
        }
    }, [socket, isConnected, chat._id, otherUser._id, chat.orderConfirmed, chat.orderCompleted, orderDetails]);

    useEffect(() => {
        if (chat && chat._id) {
            fetchMessages();
            fetchOrderDetails();
        }
    }, [chat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (messageContent = newMessage, messageType = 'text') => {
        if (!messageContent.trim()) return;

        try {
            setSending(true);
            const response = await Axios({
                url: summaryApi.sendMessage.url,
                method: summaryApi.sendMessage.method,
                data: {
                    chatId: chat._id,
                    receiverId: otherUser._id,
                    content: messageContent,
                    messageType: messageType
                }
            });

            if (response.data.success) {
                const message = response.data.data;
                setMessages(prev => [...prev, message]);
                setNewMessage('');
                
                // Emit via socket
                sendMessage({
                    chatId: chat._id,
                    receiverId: otherUser._id,
                    message: message
                });
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        // Emit typing
        emitTyping(chat._id, user._id);
        
        // Clear previous timeout
        clearTimeout(typingTimeoutRef.current);
        
        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(chat._id, user._id);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Initiate order completion process
    const handleCompleteOrder = () => {
        if (!isBuyer) {
            showError('Only buyers can complete orders');
            return;
        }

        if (chat.orderCompleted) {
            showError('Order has already been completed');
            return;
        }

        if (!chat.orderConfirmed) {
            showError('Order must be confirmed by seller before completion');
            return;
        }

        // Show confirmation dialog instead of browser confirm
        setShowCompleteOrderConfirm(true);
    };
    
    // Process the actual order completion after confirmation
    const confirmCompleteOrder = async () => {
        try {
            const response = await Axios({
                url: summaryApi.completeOrder.url,
                method: summaryApi.completeOrder.method,
                data: { chatId: chat._id }
            });
            
            if (response.data.success) {
                showSuccess('Order completed successfully!');
                onChatUpdate({ ...chat, orderCompleted: true });
                fetchMessages(); // Refresh to show completion message
                // Ask if user wants to leave a review with beautiful modal
                setTimeout(() => {
                    setShowReviewPrompt(true);
                }, 1000);
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setShowCompleteOrderConfirm(false);
        }
    };

    const cancelCompleteOrder = () => {
        setShowCompleteOrderConfirm(false);
    };

    // Handle review prompt
    const handleAddReview = () => {
        setShowReviewPrompt(false);
        // Navigate to product page with review parameters
        if (chat.productId && chat.orderId) {
            const productName = chat.productId.name;
            const productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const productUrl = `/product/${productSlug}-${chat.productId._id}?review=true&orderId=${chat.orderId.orderId || chat.orderId._id}&chatId=${chat._id}`;
            navigate(productUrl);
        }
    };

    const cancelReviewPrompt = () => {
        setShowReviewPrompt(false);
    };

    const handleImageUpload = (imageUrl) => {
        handleSendMessage(imageUrl, 'image');
        setShowImageUpload(false);
    };

    const handleVoiceUpload = (voiceUrl) => {
        handleSendMessage(voiceUrl, 'voice');
        setShowVoiceRecorder(false);
    };

    // Handle navigation to product display page
    const handleProductImageClick = (productId, productName) => {
        if (productId && productName) {
            // Create URL slug similar to how it's done in ProductDisplayPage
            const productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const productUrl = `/product/${productSlug}-${productId}`;
            navigate(productUrl);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={chat.productId?.image?.[0] || '/placeholder-product.png'}
                            alt={chat.productId?.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => handleProductImageClick(chat.productId?._id, chat.productId?.name)}
                            title="Click to view product details"
                        />
                        <div>
                            <h3 className="font-semibold text-emerald-900">{otherUser.name}</h3>
                            <p className="text-sm text-emerald-600">{chat.productId?.name}</p>
                            {chat.orderId ? (
                                <p className="text-xs text-emerald-500">Order: {chat.orderId?.orderId}</p>
                            ) : (
                                <p className="text-xs text-emerald-500">Product Inquiry</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Order Details Button - Only show if there's an order */}
                        {orderDetails && chat.orderId && (
                            <button
                                onClick={() => setShowOrderDetails(true)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
                                title="View Order Details"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Details
                            </button>
                        )}
                        
                        {/* Order Status - Only show if there's an order */}
                        {chat.orderId && (
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                chat.orderCompleted 
                                    ? 'bg-green-100 text-green-700' 
                                    : chat.orderConfirmed
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {chat.orderCompleted ? 'Completed' : chat.orderConfirmed ? 'Confirmed' : 'Pending'}
                            </span>
                        )}
                        
                        {/* Product Chat Indicator - Show if no order */}
                        {!chat.orderId && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                                Product Chat
                            </span>
                        )}
                        
                        {/* Complete Order Button (Buyer only) - Only for order chats */}
                        {chat.orderId && isBuyer && !chat.orderCompleted && chat.orderConfirmed && (
                            <button
                                onClick={handleCompleteOrder}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition"
                            >
                                Complete Order
                            </button>
                        )}

                        {/* Confirm Order Button (Seller only) - Only for order chats */}
                        {chat.orderId && isSeller && !chat.orderCompleted && !chat.orderConfirmed && (
                            <button
                                onClick={handleConfirmOrder}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                                disabled={confirmingOrder}
                            >
                                {confirmingOrder ? 'Confirming...' : 'Confirm Order'}
                            </button>
                        )}

                        {/* Delete Chat Button */}
                        <button
                            onClick={handleDeleteChat}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition flex items-center gap-1"
                            title="Delete Chat"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-green-50/30 to-emerald-50/30">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.senderId._id === user._id}
                            />
                        ))}
                        
                        {typing && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span>{otherUser.name} is typing...</span>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input Area */}
            {chat.isActive && !chat.orderCompleted && (
                <div className="p-4 border-t border-emerald-100 bg-white">
                    <div className="flex items-end gap-2">
                        {/* Attachment buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowImageUpload(true)}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                                title="Send Image"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={() => setShowVoiceRecorder(true)}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                                title="Send Voice Message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Message input */}
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full p-3 border border-emerald-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                rows="1"
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                                disabled={sending}
                            />
                        </div>
                        
                        {/* Send button */}
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={sending || !newMessage.trim()}
                            className="p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showImageUpload && (
                <ImageUpload
                    onUpload={handleImageUpload}
                    onClose={() => setShowImageUpload(false)}
                />
            )}
            
            {showVoiceRecorder && (
                <VoiceRecorder
                    onUpload={handleVoiceUpload}
                    onClose={() => setShowVoiceRecorder(false)}
                />
            )}

            {/* Order Details Modal */}
            {showOrderDetails && orderDetails && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-emerald-900">Order Details</h3>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-emerald-800 border-b border-emerald-200 pb-2">Product Information</h4>
                                    
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={orderDetails.productDetails?.image?.[0] || '/placeholder-product.png'}
                                            alt={orderDetails.productDetails?.name}
                                            className="w-20 h-20 rounded-lg object-cover border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-colors"
                                            onClick={() => handleProductImageClick(chat.productId?._id, chat.productId?.name)}
                                            title="Click to view product details"
                                        />
                                        <div className="flex-1">
                                            <h5 className="font-medium text-emerald-900">{orderDetails.productDetails?.name}</h5>
                                            <p className="text-sm text-emerald-600 mt-1">{orderDetails.productDetails?.category}</p>
                                            <p className="text-xs text-emerald-500 mt-2 line-clamp-2">{orderDetails.productDetails?.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-emerald-500">Quantity:</span>
                                            <p className="font-medium text-emerald-900">{orderDetails.quantity || 1}</p>
                                        </div>
                                        <div>
                                            <span className="text-emerald-500">Unit Price:</span>
                                            <p className="font-medium text-emerald-900">{DisplayPriceInRupees(orderDetails.productDetails?.price)}</p>
                                        </div>
                                        <div>
                                            <span className="text-emerald-500">Total Amount:</span>
                                            <p className="font-bold text-emerald-900">{DisplayPriceInRupees(orderDetails.totalAmount)}</p>
                                        </div>
                                        <div>
                                            <span className="text-emerald-500">Payment Status:</span>
                                            <p className={`font-medium ${orderDetails.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                                {orderDetails.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Order & Customer Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-emerald-800 border-b border-emerald-200 pb-2">Order Information</h4>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-emerald-500">Order ID:</span>
                                            <p className="font-mono text-emerald-900 text-xs bg-emerald-50 px-2 py-1 rounded mt-1">{orderDetails.orderId}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-emerald-500">Order Date:</span>
                                            <p className="text-emerald-900">{new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-emerald-500">Customer:</span>
                                            <p className="font-medium text-emerald-900">{orderDetails.userId?.name}</p>
                                            <p className="text-emerald-600">{orderDetails.userId?.email}</p>
                                        </div>
                                        
                                        {orderDetails.delivery_address && (
                                            <div>
                                                <span className="text-emerald-500">Delivery Address:</span>
                                                <div className="bg-emerald-50 p-3 rounded-lg mt-1">
                                                    <p className="text-emerald-900 text-xs leading-relaxed">
                                                        {orderDetails.delivery_address.address_line_1}<br/>
                                                        {orderDetails.delivery_address.address_line_2 && (
                                                            <>{orderDetails.delivery_address.address_line_2}<br/></>
                                                        )}
                                                        {orderDetails.delivery_address.city}, {orderDetails.delivery_address.state}<br/>
                                                        {orderDetails.delivery_address.pincode}, {orderDetails.delivery_address.country}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Order Status */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-lime-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="font-semibold text-emerald-900">Order Status</h5>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                chat.orderCompleted 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : chat.orderConfirmed
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {chat.orderCompleted ? 'Order Completed' : chat.orderConfirmed ? 'Order Confirmed' : 'Awaiting Confirmation'}
                                            </span>
                                            
                                            {chat.orderConfirmed && chat.orderConfirmedAt && (
                                                <span className="text-xs text-emerald-600">
                                                    Confirmed on {new Date(chat.orderConfirmedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    {isSeller && !chat.orderCompleted && !chat.orderConfirmed && (
                                        <button
                                            onClick={handleConfirmOrder}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                            disabled={confirmingOrder}
                                        >
                                            {confirmingOrder ? 'Confirming...' : 'Confirm Order'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmBox
                    title="Delete Chat"
                    message={`Are you sure you want to delete this chat with ${otherUser.name}? This action cannot be undone and you will lose all message history.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmButtonClass="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    cancelButtonClass="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    cancel={cancelDeleteChat}
                    confirm={confirmDeleteChat}
                    close={cancelDeleteChat}
                />
            )}

            {/* Complete Order Confirmation Modal */}
            {showCompleteOrderConfirm && (
                <ConfirmBox
                    title="Complete Order"
                    message="Are you sure you want to mark this order as completed? This action cannot be undone and will finalize the transaction."
                    confirmText="Yes, Complete Order"
                    cancelText="Cancel"
                    confirmButtonClass="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    cancelButtonClass="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    cancel={cancelCompleteOrder}
                    confirm={confirmCompleteOrder}
                    close={cancelCompleteOrder}
                />
            )}

            {/* Review Prompt Modal */}
            {showReviewPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full shadow-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Completed Successfully!</h3>
                            <p className="text-gray-600 mb-6">
                                Would you like to share your experience and help other customers by leaving a review for this product?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelReviewPrompt}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleAddReview}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition font-medium"
                                >
                                    Add Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
