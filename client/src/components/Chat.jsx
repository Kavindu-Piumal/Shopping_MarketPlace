import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import PrivacyConsentBanner from './PrivacyConsentBanner';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastNotificationTime, setLastNotificationTime] = useState(0);
    const [searchParams] = useSearchParams();
    const { socket, isConnected, joinChat } = useSocket();
    const { showCustom, showSuccess, axiosNotificationError } = useNotification();
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const location = useLocation();

    // Debounced login notification (similar to AddtoCartButton)
    const showLoginNotification = () => {
        const now = Date.now();
        if (now - lastNotificationTime < 3000) return; // 3-second cooldown
        setLastNotificationTime(now);
        
        showCustom(
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <p className="font-medium text-gray-800">Login Required</p>
                    <p className="text-sm text-gray-600">Please login to access chat features</p>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                    Login
                </button>
            </div>
        );
    };// Fetch user chats
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: summaryApi.getUserChats.url,
                method: summaryApi.getUserChats.method
            });

            if (response.data.success) {
                setChats(response.data.data);
            }        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle URL parameters for direct chat access (from order notifications)
    const handleUrlParams = async () => {
        const orderId = searchParams.get('orderId');
        const withUserId = searchParams.get('with');
        const sellerId = searchParams.get('sellerId');

        if (orderId && withUserId && user._id) {
            try {
                // Find existing chat for this order
                const existingChat = chats.find(chat => 
                    chat.orderId === orderId && 
                    (chat.buyerId === withUserId || chat.sellerId === withUserId)
                );

                if (existingChat) {
                    setSelectedChat(existingChat);
                    joinChat(existingChat._id);
                } else {
                    // Create a new chat if it doesn't exist
                    const response = await Axios({
                        url: summaryApi.createChat.url,
                        method: summaryApi.createChat.method,
                        data: {
                            orderId: orderId,
                            buyerId: user.role === 'seller' ? withUserId : user._id,
                            sellerId: user.role === 'seller' ? user._id : sellerId || withUserId
                        }
                    });

                    if (response.data.success) {
                        // Refresh chats and select the new one
                        await fetchChats();
                        const newChat = response.data.data;
                        setSelectedChat(newChat);
                        joinChat(newChat._id);
                        showSuccess('Chat opened successfully!');
                    }
                }

                // Clean up URL parameters
                navigate('/chat', { replace: true });
            } catch (error) {
                console.error('Error handling URL parameters:', error);
                axiosNotificationError(error);
            }
        }
    };    useEffect(() => {
        if (user && user._id) {
            fetchChats();
        }
    }, [user]);

    // Handle URL parameters after chats are loaded
    useEffect(() => {
        if (chats.length > 0 && searchParams.has('orderId')) {
            handleUrlParams();
        }
    }, [chats, searchParams]);

    // Handle pre-selected chat from navigation state
    useEffect(() => {
        if (location.state?.selectedChatId && chats.length > 0) {
            const preSelectedChat = chats.find(chat => chat._id === location.state.selectedChatId);
            if (preSelectedChat) {
                setSelectedChat(preSelectedChat);
                joinChat(preSelectedChat._id);
                // Clear the navigation state
                navigate(location.pathname, { replace: true });
            }
        }
    }, [chats, location.state, navigate, location.pathname, joinChat]);// Socket event listeners
    useEffect(() => {
        if (socket && isConnected) {
            // Listen for new messages
            socket.on('new-message', (message) => {
                // Update chat list to move this chat to top
                setChats(prev => {
                    const updatedChats = [...prev];
                    const chatIndex = updatedChats.findIndex(chat => chat._id === message.chatId);
                    if (chatIndex > -1) {
                        const chat = updatedChats.splice(chatIndex, 1)[0];
                        chat.lastMessage = message;
                        chat.updatedAt = new Date().toISOString();
                        return [chat, ...updatedChats];
                    }
                    return updatedChats;
                });
            });

            // Listen for order status updates
            socket.on('order-status-update', (data) => {
                setChats(prev => 
                    prev.map(chat => 
                        chat._id === data.chatId 
                            ? { 
                                ...chat, 
                                orderConfirmed: data.orderConfirmed,
                                orderConfirmedAt: data.orderConfirmedAt,
                                orderCompleted: data.orderCompleted,
                                completedAt: data.completedAt
                            } 
                            : chat
                    )
                );
            });

            // Listen for chat updates (deletions, etc.)
            socket.on('chat-update', (data) => {
                if (data.action === 'delete') {
                    setChats(prev => prev.filter(chat => chat._id !== data.chatId));
                    if (selectedChat && selectedChat._id === data.chatId) {
                        setSelectedChat(null);
                    }
                } else {
                    setChats(prev => 
                        prev.map(chat => 
                            chat._id === data.chatId ? { ...chat, ...data.chat } : chat
                        )
                    );
                }
            });

            return () => {
                socket.off('new-message');
                socket.off('order-status-update');
                socket.off('chat-update');
            };
        }
    }, [socket, isConnected, selectedChat]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (chat && chat._id) {
            joinChat(chat._id);
        }
    };    const handleChatUpdate = (updatedChat) => {
        if (updatedChat.deleted) {
            // Remove deleted chat from list or mark as deleted
            setChats(prev => prev.filter(chat => chat._id !== updatedChat._id));
            if (selectedChat && selectedChat._id === updatedChat._id) {
                setSelectedChat(null);
            }
            // Toast message is handled in ChatWindow component to avoid duplication
        } else {
            setChats(prev => 
                prev.map(chat => 
                    chat._id === updatedChat._id ? { ...chat, ...updatedChat } : chat
                )
            );
            if (selectedChat && selectedChat._id === updatedChat._id) {
                setSelectedChat({ ...selectedChat, ...updatedChat });
            }
        }
    };// No blocking authentication check - provide better UX below

    return (
        <div className="bg-gradient-to-br from-green-50 via-emerald-100 to-lime-50 min-h-screen">
            <PrivacyConsentBanner />
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white/90 rounded-xl shadow-lg overflow-hidden">                    <div className="p-6 bg-gradient-to-r from-emerald-400 to-lime-400 text-white">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Buyer-Seller Communication
                        </h1>
                        <p className="text-emerald-100 mt-1">Connect with buyers and sellers for your orders</p>
                    </div>
                    
                    {!user ? (
                        // Login Required UI (Beautiful and Encouraging)
                        <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-50">
                            <div className="text-center max-w-md mx-auto p-8">
                                <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-100">
                                    <div className="mb-6">
                                        <svg className="w-20 h-20 mx-auto text-emerald-400 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Welcome to Chat!</h2>
                                        <p className="text-emerald-600 mb-6">
                                            Connect with sellers, ask questions about products, and track your orders through our secure messaging system.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-700">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Real-time messaging with sellers</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-emerald-700">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Share images and voice messages</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-emerald-700">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Track order status and updates</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-3">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-600 hover:to-lime-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                                        >
                                            Login to Start Chatting
                                        </button>
                                        <p className="text-sm text-emerald-600">
                                            Don't have an account?{' '}
                                            <button
                                                onClick={() => navigate('/register')}
                                                className="text-emerald-700 font-semibold hover:text-emerald-800 transition underline"
                                            >
                                                Sign up here
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Authenticated User Chat Interface
                        <div className="flex h-[600px]">
                            {/* Chat List */}
                            <div className="w-1/3 border-r border-emerald-100">
                                <ChatList
                                    chats={chats}
                                    selectedChat={selectedChat}
                                    onChatSelect={handleChatSelect}
                                    loading={loading}
                                    user={user}
                                />
                            </div>

                            {/* Chat Window */}
                            <div className="flex-1">
                                {selectedChat ? (
                                    <ChatWindow
                                        chat={selectedChat}
                                        user={user}
                                        onChatUpdate={handleChatUpdate}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-50">
                                        <div className="text-center text-emerald-600">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-lg font-medium">Select a chat to start messaging</p>
                                            <p className="text-sm text-emerald-500 mt-1">Choose a conversation from the left panel</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
