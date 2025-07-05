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
    const [showConfirmOrderConfirm, setShowConfirmOrderConfirm] = useState(false);
    const [showReviewPrompt, setShowReviewPrompt] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const { socket, isConnected, sendMessage, emitTyping, emitStopTyping } = useSocket();

    // Fix: More robust otherUser determination to prevent self-notifications
    const determineOtherUser = () => {
        console.log('🔍 Determining other user:');
        console.log('  - Current user ID:', user._id);
        console.log('  - Chat buyerId:', chat.buyerId?._id || chat.buyerId);
        console.log('  - Chat sellerId:', chat.sellerId?._id || chat.sellerId);

        // Convert IDs to strings for proper comparison
        const currentUserId = String(user._id);
        const buyerId = String(chat.buyerId?._id || chat.buyerId);
        const sellerId = String(chat.sellerId?._id || chat.sellerId);

        if (currentUserId === buyerId) {
            console.log('  - Current user is buyer, other user is seller');
            return chat.sellerId;
        } else if (currentUserId === sellerId) {
            console.log('  - Current user is seller, other user is buyer');
            return chat.buyerId;
        } else {
            console.error('  - ERROR: Current user is neither buyer nor seller!');
            // Fallback: return the buyer if current user is not buyer
            return chat.buyerId;
        }
    };

    const otherUser = determineOtherUser();
    const isBuyer = String(chat.buyerId?._id || chat.buyerId) === String(user._id);
    const isSeller = String(chat.sellerId?._id || chat.sellerId) === String(user._id);

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
                // Force scroll to bottom after messages are loaded for new chat
                // Use longer timeout to ensure all DOM updates are complete
                setTimeout(() => scrollToBottom(true), 300);
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
    const handleConfirmOrder = () => {
        if (!isSeller) {
            showError('Only sellers can confirm orders');
            return;
        }

        if (chat.orderConfirmed) {
            showError('Order has already been confirmed');
            return;
        }

        // Show confirmation modal instead of basic browser confirm
        setShowConfirmOrderConfirm(true);
    };

    // Process the actual order confirmation after user confirms in modal
    const confirmConfirmOrder = async () => {
        try {
            setConfirmingOrder(true);
            const response = await Axios({
                url: `${summaryApi.confirmChatOrder.url}/${chat._id}`,
                method: summaryApi.confirmChatOrder.method
            });
            
            if (response.data.success) {
                showSuccess('✅ Order confirmed successfully! The buyer has been notified and can now proceed with the order.');
                fetchOrderDetails();
                fetchMessages();
                onChatUpdate(response.data.data.chat);
                setShowOrderDetails(false); // Close modal if open
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setConfirmingOrder(false);
            setShowConfirmOrderConfirm(false);
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
        scrollToBottom(false); // Don't force scroll for regular message updates
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

    const scrollToBottom = (force = false) => {
        // Use setTimeout to ensure DOM is updated before scrolling
        setTimeout(() => {
            if (messagesContainerRef.current) {
                const container = messagesContainerRef.current;
                const isAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
                
                // Only scroll if forced (new chat selected) or user is already at bottom
                if (force || isAtBottom) {
                    container.scrollTop = container.scrollHeight;
                }
            }
            // Also try the old method as fallback
            if (force) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSendMessage = async (messageContent = newMessage, messageType = 'text') => {
        if (!messageContent.trim()) return;

        try {
            setSending(true);
            
            console.log(`💬 Frontend - Sending message:`);
            console.log(`  - From (senderId): ${user._id} (${user.name})`);
            console.log(`  - To (receiverId): ${otherUser._id} (${otherUser.name})`);
            console.log(`  - ChatId: ${chat._id}`);
            console.log(`  - Content: ${messageContent}`);
            console.log(`  - Chat buyerId: ${chat.buyerId._id}, sellerId: ${chat.sellerId._id}`);
            
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
            {/* Chat Header - Mobile Optimized */}
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50">
                {/* Top Row - User Info and Menu */}
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <img
                            src={chat.productId?.image?.[0] || '/placeholder-product.png'}
                            alt={chat.productId?.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => handleProductImageClick(chat.productId?._id, chat.productId?.name)}
                            title="Click to view product details"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-emerald-900 truncate">{otherUser.name}</h3>
                            <p className="text-sm text-emerald-600 truncate">{chat.productId?.name}</p>
                            {chat.orderId ? (
                                <p className="text-xs text-emerald-500 truncate">Order: {chat.orderId?.orderId}</p>
                            ) : (
                                <p className="text-xs text-emerald-500">Product Inquiry</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowOrderDetails(true)}
                        className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-full transition"
                        title="Options"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                    </button>
                </div>

                {/* Order Status Bar - Only show if there's an order */}
                {chat.orderId && (
                    <div className="px-3 pb-3">
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    chat.orderCompleted 
                                        ? 'bg-green-500' 
                                        : chat.orderConfirmed
                                            ? 'bg-blue-500'
                                            : 'bg-orange-500'
                                }`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {chat.orderCompleted ? 'Completed' : chat.orderConfirmed ? 'Confirmed' : 'Pending'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {DisplayPriceInRupees(orderDetails?.totalAmount || 0)}
                                </span>
                            </div>

                            {/* Action Button */}
                            {chat.orderId && !chat.orderCompleted && (
                                <>
                                    {isBuyer && chat.orderConfirmed && (
                                        <button
                                            onClick={handleCompleteOrder}
                                            className="px-4 py-1.5 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition"
                                        >
                                            Complete
                                        </button>
                                    )}
                                    {isSeller && !chat.orderConfirmed && (
                                        <button
                                            onClick={handleConfirmOrder}
                                            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition"
                                            disabled={confirmingOrder}
                                        >
                                            {confirmingOrder ? 'Confirming...' : 'Confirm'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-br from-green-50/30 to-emerald-50/30">
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
                            <div className="flex items-center gap-2 text-emerald-600 text-sm px-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs">{otherUser.name} is typing...</span>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input Area - Mobile Optimized - Allow messaging even after order completion */}
            {chat.isActive && (
                <div className="p-3 border-t border-emerald-100 bg-white">
                    {/* Show helpful message for completed orders */}
                    {chat.orderCompleted && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs text-green-700 text-center">
                                ✅ Order delivered • Continue chatting for support, feedback, or future orders
                            </p>
                        </div>
                    )}

                    {/* Attachment buttons row */}
                    <div className="flex justify-center gap-4 mb-3">
                        <button
                            onClick={() => setShowImageUpload(true)}
                            className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition text-sm"
                            title="Send Image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Photo
                        </button>

                        <button
                            onClick={() => setShowVoiceRecorder(true)}
                            className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition text-sm"
                            title="Send Voice Message"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Voice
                        </button>
                    </div>

                    {/* Message input row */}
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyPress={handleKeyPress}
                                placeholder={chat.orderCompleted ? "Order delivered - chat for support or feedback..." : "Type your message..."}
                                className="w-full p-3 pr-12 border border-emerald-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                                rows="1"
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                                disabled={sending}
                            />
                        </div>
                        
                        {/* Send button */}
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={sending || !newMessage.trim()}
                            className="w-12 h-12 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

            {/* Order Details Modal - Mobile Optimized */}
            {showOrderDetails && (
                <div className="fixed inset-0 flex items-end justify-center z-50 bg-black/50">
                    <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-emerald-900">Chat Options</h3>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Order Details Section */}
                            {orderDetails && chat.orderId && (
                                <div className="bg-emerald-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Order Details
                                    </h4>

                                    {/* Product Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={orderDetails.productDetails?.image?.[0] || '/placeholder-product.png'}
                                            alt={orderDetails.productDetails?.name}
                                            className="w-16 h-16 rounded-lg object-cover border-2 border-emerald-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-emerald-900 truncate">{orderDetails.productDetails?.name}</p>
                                            <p className="text-sm text-emerald-600">Qty: {orderDetails.quantity || 1}</p>
                                            <p className="text-sm font-semibold text-emerald-800">{DisplayPriceInRupees(orderDetails.totalAmount)}</p>
                                        </div>
                                    </div>

                                    {/* Order Info Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-emerald-600 font-medium">Order ID</p>
                                            <p className="text-emerald-900 text-xs font-mono">{orderDetails.orderId}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-emerald-600 font-medium">Status</p>
                                            <p className={`text-xs font-medium ${
                                                chat.orderCompleted ? 'text-green-600' : 
                                                chat.orderConfirmed ? 'text-blue-600' : 'text-orange-600'
                                            }`}>
                                                {chat.orderCompleted ? 'Completed' : chat.orderConfirmed ? 'Confirmed' : 'Pending'}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-emerald-600 font-medium">Customer</p>
                                            <p className="text-emerald-900 text-xs truncate">{orderDetails.userId?.name}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-emerald-600 font-medium">Date</p>
                                            <p className="text-emerald-900 text-xs">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {/* Order Actions */}
                                {chat.orderId && !chat.orderCompleted && (
                                    <>
                                        {isSeller && !chat.orderConfirmed && (
                                            <button
                                                onClick={handleConfirmOrder}
                                                className="w-full p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
                                                disabled={confirmingOrder}
                                            >
                                                {confirmingOrder ? 'Confirming Order...' : 'Confirm Order'}
                                            </button>
                                        )}
                                        {isBuyer && chat.orderConfirmed && (
                                            <button
                                                onClick={handleCompleteOrder}
                                                className="w-full p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-medium"
                                            >
                                                Complete Order
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Product Link */}
                                <button
                                    onClick={() => {
                                        handleProductImageClick(chat.productId?._id, chat.productId?.name);
                                        setShowOrderDetails(false);
                                    }}
                                    className="w-full p-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Product Details
                                </button>

                                {/* Delete Chat */}
                                <button
                                    onClick={() => {
                                        setShowOrderDetails(false);
                                        handleDeleteChat();
                                    }}
                                    className="w-full p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Chat
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

            {/* Confirm Order Confirmation Modal */}
            {showConfirmOrderConfirm && (
                <ConfirmBox
                    title="Confirm Order"
                    message="Are you sure you want to confirm this order? The buyer will be notified and can now proceed with the order."
                    confirmText="Yes, Confirm Order"
                    cancelText="Cancel"
                    confirmButtonClass="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    cancelButtonClass="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    cancel={() => setShowConfirmOrderConfirm(false)}
                    confirm={confirmConfirmOrder}
                    close={() => setShowConfirmOrderConfirm(false)}
                />
            )}

            {/* Review Prompt Modal */}
            {showReviewPrompt && (
                <div className="fixed inset-0 bg-black bg opacity-50 flex items-center justify-center z-50">
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
