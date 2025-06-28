import React from 'react';
import Loading from './Loading';

const ChatList = ({ chats, selectedChat, onChatSelect, loading, user, isMobile = false }) => {
    const formatLastMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getOtherUser = (chat) => {
        return chat.buyerId._id === user._id ? chat.sellerId : chat.buyerId;
    };

    const getChatRole = (chat) => {
        return chat.buyerId._id === user._id ? 'Buyer' : 'Seller';
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <div className="text-center text-emerald-600">
                    <svg className="w-12 h-12 mx-auto mb-3 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm text-emerald-500 mt-1">Order something to start chatting!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {!isMobile && (
                <div className="p-4 border-b border-emerald-100">
                    <h3 className="font-semibold text-emerald-800">Your Conversations</h3>
                    <p className="text-xs text-emerald-600">{chats.length} active chat{chats.length !== 1 ? 's' : ''}</p>
                </div>
            )}
            
            <div className="space-y-0">
                {chats.map((chat) => {
                    const otherUser = getOtherUser(chat);
                    const role = getChatRole(chat);
                    const isSelected = selectedChat && selectedChat._id === chat._id;
                    
                    return (
                        <div
                            key={chat._id}
                            onClick={() => onChatSelect(chat)}
                            className={`${isMobile ? 'p-4' : 'p-4'} cursor-pointer border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors ${
                                isSelected ? 'bg-emerald-100 border-l-4 border-l-emerald-400' : ''
                            }`}
                        >
                            <div className={`flex items-start gap-${isMobile ? '4' : '3'}`}>
                                {/* User Avatar */}
                                <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-emerald-600 font-medium text-sm">
                                        {otherUser.name?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {/* User and Role */}
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-medium text-emerald-900 truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                                            {otherUser.name}
                                        </h4>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            role === 'Buyer' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {role}
                                        </span>
                                    </div>
                                    
                                    {/* Product Name */}
                                    {chat.productId && (
                                        <p className={`text-emerald-700 truncate mb-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                            📦 {chat.productId.name}
                                        </p>
                                    )}
                                    
                                    {/* Order ID or Product Chat Indicator */}
                                    {chat.orderId ? (
                                        <p className="text-xs text-emerald-500">
                                            Order: {chat.orderId?.orderId}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-blue-500">
                                            💬 Product Inquiry
                                        </p>
                                    )}
                                    
                                    {/* Last Message Preview */}
                                    {chat.lastMessage && (
                                        <p className={`text-gray-600 truncate mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                            {chat.lastMessage.content}
                                        </p>
                                    )}
                                    
                                    {/* Status and Time */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                chat.orderId ? (
                                                    chat.orderCompleted 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : chat.orderConfirmed
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : chat.isActive 
                                                                ? 'bg-emerald-100 text-emerald-700' 
                                                                : 'bg-gray-100 text-gray-600'
                                                ) : (
                                                    'bg-blue-100 text-blue-700'
                                                )
                                            }`}>
                                                {chat.orderId ? (
                                                    chat.orderCompleted 
                                                        ? '✅ Completed' 
                                                        : chat.orderConfirmed 
                                                            ? '✅ Confirmed' 
                                                            : chat.isActive 
                                                                ? '🟢 Active' 
                                                                : '⭕ Inactive'
                                                ) : (
                                                    '💬 Chat'
                                                )}
                                            </span>
                                            
                                            {/* Show unread message indicator */}
                                            {chat.hasUnreadMessages && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {/* Show encryption indicator */}
                                            <div className="flex items-center gap-1" title="Encrypted">
                                                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            
                                            <span className="text-xs text-emerald-400">
                                                {formatLastMessageTime(chat.updatedAt)}
                                            </span>
                                            
                                            {isMobile && (
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;
