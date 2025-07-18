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
import useMobile from '../hooks/useMobile';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastNotificationTime, setLastNotificationTime] = useState(0);
    const [showMobileChatWindow, setShowMobileChatWindow] = useState(false);
    const [searchParams] = useSearchParams();
    const { socket, isConnected, joinChat } = useSocket();
    const { showCustom, showSuccess, axiosNotificationError } = useNotification();
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile] = useMobile();

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
                        // Only show success message if this is a direct chat creation, not from notification
                        if (!searchParams.has('orderId')) {
                            showSuccess('Chat opened successfully!');
                        }
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
        // On mobile, show the chat window when a chat is selected
        if (isMobile) {
            setShowMobileChatWindow(true);
        }
    };

    const handleBackToChats = () => {
        setShowMobileChatWindow(false);
        setSelectedChat(null);
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
                <div className="bg-white/90 rounded-xl shadow-lg overflow-hidden">                    {/* Header - More compact on mobile */}
                    <div className="p-3 lg:p-6 bg-gradient-to-r from-emerald-400 to-lime-400 text-white">
                        <h1 className="text-lg lg:text-2xl font-bold flex items-center gap-2 lg:gap-3">
                            <svg className="w-5 h-5 lg:w-8 lg:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="hidden lg:inline">Buyer-Seller Communication</span>
                            <span className="lg:hidden">Messages</span>
                        </h1>
                        <p className="text-emerald-100 mt-1 text-xs lg:text-base">
                            <span className="hidden lg:inline">Connect with buyers and sellers for your orders</span>
                            <span className="lg:hidden">Chat with buyers & sellers</span>
                        </p>
                    </div>
                    
                    {!user ? (
                        // Login Required UI - More compact on mobile
                        <div className="h-[400px] lg:h-[600px] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-50">
                            <div className="text-center max-w-md mx-auto p-4 lg:p-8">
                                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-emerald-100">
                                    <div className="mb-4 lg:mb-6">
                                        <svg className="w-12 h-12 lg:w-20 lg:h-20 mx-auto text-emerald-400 mb-3 lg:mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h2 className="text-lg lg:text-2xl font-bold text-emerald-800 mb-2">Welcome to Chat!</h2>
                                        <p className="text-emerald-600 mb-4 lg:mb-6 text-sm lg:text-base">
                                            <span className="hidden lg:inline">
                                                Connect with sellers, ask questions about products, and track your orders through our secure messaging system.
                                            </span>
                                            <span className="lg:hidden">
                                                Connect with sellers and track orders.
                                            </span>
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-2 lg:space-y-4">
                                        <div className="flex items-center gap-2 lg:gap-3 text-emerald-700 text-sm lg:text-base">
                                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="hidden lg:inline">Real-time messaging with sellers</span>
                                            <span className="lg:hidden">Real-time messaging</span>
                                        </div>
                                        <div className="flex items-center gap-2 lg:gap-3 text-emerald-700 text-sm lg:text-base">
                                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="hidden lg:inline">Share images and voice messages</span>
                                            <span className="lg:hidden">Share media</span>
                                        </div>
                                        <div className="flex items-center gap-2 lg:gap-3 text-emerald-700 text-sm lg:text-base">
                                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="hidden lg:inline">Track order status and updates</span>
                                            <span className="lg:hidden">Order tracking</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 lg:mt-8 space-y-3">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-600 hover:to-lime-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 text-sm lg:text-base"
                                        >
                                            Login to Start Chatting
                                        </button>
                                        <p className="text-xs lg:text-sm text-emerald-600">
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
                        isMobile ? (
                            // Mobile Layout - Show either chat list or chat window
                            <div className="h-[600px]">
                                {!showMobileChatWindow ? (
                                    // Mobile Chat List Only
                                    <div className="h-full">
                                        <div className="p-4 border-b border-emerald-100">
                                            <h2 className="text-lg font-semibold text-emerald-800">Your Conversations</h2>
                                        </div>
                                        <ChatList
                                            chats={chats}
                                            selectedChat={selectedChat}
                                            onChatSelect={handleChatSelect}
                                            loading={loading}
                                            user={user}
                                            isMobile={true}
                                        />
                                    </div>
                                ) : (
                                    // Mobile Chat Window with Back Button
                                    <div className="h-full flex flex-col">
                                        <div className="p-4 border-b border-emerald-100 flex items-center gap-3">
                                            <button
                                                onClick={handleBackToChats}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
                                                </svg>
                                            </button>
                                            <div className="flex items-center gap-3">
                                                {selectedChat && (
                                                    <>
                                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                            <span className="text-emerald-600 font-medium text-sm">
                                                                {(selectedChat.buyerId._id === user._id ? selectedChat.sellerId.name : selectedChat.buyerId.name)?.[0]?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-medium text-emerald-800">
                                                            {selectedChat.buyerId._id === user._id ? selectedChat.sellerId.name : selectedChat.buyerId.name}
                                                        </h3>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {selectedChat && (
                                                <ChatWindow
                                                    chat={selectedChat}
                                                    user={user}
                                                    onChatUpdate={handleChatUpdate}
                                                    isMobile={true}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Desktop Layout - Split View
                            <div className="flex h-[600px]">
                                {/* Chat List */}
                                <div className="w-1/3 border-r border-emerald-100">
                                    <ChatList
                                        chats={chats}
                                        selectedChat={selectedChat}
                                        onChatSelect={handleChatSelect}
                                        loading={loading}
                                        user={user}
                                        isMobile={false}
                                    />
                                </div>

                                {/* Chat Window */}
                                <div className="flex-1">
                                    {selectedChat ? (
                                        <ChatWindow
                                            chat={selectedChat}
                                            user={user}
                                            onChatUpdate={handleChatUpdate}
                                            isMobile={false}
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
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
