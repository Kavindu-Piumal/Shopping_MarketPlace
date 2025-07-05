import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import Axios from '../../utils/Axios';
import summaryApi from '../../common/summaryApi';
import MessageBubble from './MessageBubble';
import OrderControls from './OrderControls';
import MessageInput from './MessageInput';
import OrderDetailsModal from './OrderDetailsModal';
import { ArrowLeft, User, Store, MoreVertical } from 'lucide-react';

const ChatWindow = ({ conversation, onBack, onUpdate, isMobile = false }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    const messagesEndRef = useRef(null);
    const user = useSelector(state => state.user);
    const { socket, isConnected } = useSocket();
    const { showSuccess, axiosNotificationError } = useNotification();

    // Determine user role and other user - with safe property access
    const isUserBuyer = conversation.buyerId?._id === user._id;
    const isUserSeller = conversation.sellerId?._id === user._id;
    const otherUser = isUserBuyer ? conversation.sellerId : conversation.buyerId;
    const userRole = isUserBuyer ? 'buyer' : 'seller';

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: `${summaryApi.getChatMessages.url}/${conversation._id}`,
                method: summaryApi.getChatMessages.method
            });

            if (response.data.success) {
                setMessages(response.data.data);
                scrollToBottom();
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    // Send message - ensure sender doesn't get notification
    const handleSendMessage = async (content, type = 'text') => {
        if (!content.trim()) return;

        try {
            const response = await Axios({
                url: summaryApi.sendMessage.url,
                method: summaryApi.sendMessage.method,
                data: {
                    chatId: conversation._id,
                    receiverId: otherUser._id,
                    content,
                    messageType: type
                }
            });

            if (response.data.success) {
                const newMessage = response.data.data;
                console.log('Message sent successfully:', newMessage); // Debug log

                // Add message to local state immediately for sender
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();

                // Emit via socket for real-time delivery to receiver only
                if (socket && isConnected) {
                    console.log('Emitting socket message:', {
                        chatId: conversation._id,
                        message: newMessage,
                        receiverId: otherUser._id
                    }); // Debug log

                    socket.emit('send-message', {
                        chatId: conversation._id,
                        message: newMessage,
                        receiverId: otherUser._id
                    });
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            axiosNotificationError(error);
        }
    };

    // Handle typing indicators
    const handleTyping = () => {
        if (socket && isConnected) {
            socket.emit('typing', {
                chatId: conversation._id,
                userId: user._id,
                receiverId: otherUser._id
            });
        }
    };

    const handleStopTyping = () => {
        if (socket && isConnected) {
            socket.emit('stop-typing', {
                chatId: conversation._id,
                userId: user._id,
                receiverId: otherUser._id
            });
        }
    };

    // Delete chat handler
    const handleDeleteChat = (chatId) => {
        if (onBack) {
            onBack();
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (socket && isConnected) {
            console.log('Setting up socket listeners for chat:', conversation._id);

            // Join the chat room
            socket.emit('join-chat', conversation._id);
            console.log('Emitted join-chat for:', conversation._id);

            // Only listen for messages in this chat
            const handleNewMessage = (data) => {
                console.log('🔔 Received new message event:', data);
                if (data.chatId === conversation._id && data.message) {
                    console.log('✅ Message is for this chat, adding to messages');
                    setMessages(prev => {
                        // Check if message already exists to prevent duplicates
                        const messageExists = prev.some(msg => msg._id === data.message._id);
                        if (!messageExists) {
                            console.log('➕ Adding new message to state');
                            return [...prev, data.message];
                        } else {
                            console.log('⚠️ Message already exists, skipping');
                            return prev;
                        }
                    });
                    setTimeout(scrollToBottom, 100);
                } else {
                    console.log('❌ Message not for this chat or invalid data');
                }
            };

            const handleUserTyping = (data) => {
                if (data.chatId === conversation._id && data.userId === otherUser?._id) {
                    setTyping(true);
                    setTimeout(() => setTyping(false), 3000);
                }
            };

            const handleUserStopTyping = (data) => {
                if (data.chatId === conversation._id && data.userId === otherUser?._id) {
                    setTyping(false);
                }
            };

            // Handle conversation updates (order status changes)
            const handleConversationUpdate = (data) => {
                console.log('🔄 Received conversation update:', data);
                if (data.chatId === conversation._id && data.conversation) {
                    if (onUpdate) {
                        onUpdate(data.conversation);
                    }
                }
            };

            // Listen for message events
            socket.on('new-message', handleNewMessage);
            socket.on('message-received', handleNewMessage);
            socket.on('user-typing', handleUserTyping);
            socket.on('user-stop-typing', handleUserStopTyping);
            socket.on('conversation-updated', handleConversationUpdate);

            console.log('✅ Socket listeners registered');

            return () => {
                console.log('🧹 Cleaning up socket listeners for chat:', conversation._id);
                socket.emit('leave-chat', conversation._id);
                socket.off('new-message', handleNewMessage);
                socket.off('message-received', handleNewMessage);
                socket.off('user-typing', handleUserTyping);
                socket.off('user-stop-typing', handleUserStopTyping);
                socket.off('conversation-updated', handleConversationUpdate);
            };
        } else {
            console.log('❌ Socket not connected or unavailable');
        }
    }, [socket, isConnected, conversation._id, otherUser?._id, onUpdate]);

    // Fetch messages on mount
    useEffect(() => {
        fetchMessages();
    }, [conversation._id]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // If conversation data is incomplete, show loading or error state AFTER all hooks
    if (!conversation.buyerId || !conversation.sellerId || !otherUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading conversation...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header - Fixed */}
            <div className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0 ${isMobile ? 'px-3 py-3' : ''}`}>
                <div className="flex items-center gap-3">
                    {/* Back button for both mobile and desktop */}
                    <button
                        onClick={onBack}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Back to chat list"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {otherUser.avatar ? (
                                <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User size={20} className="text-gray-500" />
                            )}
                        </div>

                        <div>
                            <h3 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
                                {otherUser.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                {isUserBuyer ? <Store size={12} /> : <User size={12} />}
                                <span>{isUserBuyer ? 'Seller' : 'Buyer'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Optional: Add call or video buttons */}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Messages Container - Scrollable */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'px-3' : ''}`}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Start a conversation
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {conversation.orderId
                                ? 'Discuss your order details with the ' + (isUserBuyer ? 'seller' : 'buyer')
                                : 'Ask questions about the product'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            // Handle both string and ObjectId formats for senderId comparison
                            const messageSenderId = message.senderId?._id || message.senderId;
                            const currentUserId = user._id;
                            const isMessageOwn = String(messageSenderId) === String(currentUserId);

                            console.log('Message debug:', {
                                messageId: message._id,
                                senderId: message.senderId,
                                messageSenderIdExtracted: messageSenderId,
                                currentUserId: currentUserId,
                                isOwn: isMessageOwn,
                                content: message.content,
                                senderIdType: typeof messageSenderId,
                                currentUserIdType: typeof currentUserId
                            });

                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={isMessageOwn}
                                    isMobile={isMobile}
                                />
                            );
                        })}

                        {typing && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span>{otherUser.name} is typing...</span>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Order Controls - if applicable */}
            {conversation.orderId && (
                <OrderControls
                    conversation={conversation}
                    userRole={userRole}
                    onUpdate={onUpdate}
                    onShowOrderDetails={() => setShowOrderDetails(true)}
                    onDeleteChat={handleDeleteChat}
                    isMobile={isMobile}
                />
            )}

            {/* Message Input - Fixed */}
            <div className="flex-shrink-0">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    disabled={loading}
                    isMobile={isMobile}
                />
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && conversation.orderId && (
                <OrderDetailsModal
                    conversation={conversation}
                    onClose={() => setShowOrderDetails(false)}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default ChatWindow;
