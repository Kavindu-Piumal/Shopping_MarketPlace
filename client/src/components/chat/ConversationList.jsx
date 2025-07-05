import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNotification } from '../../context/NotificationContext';
import Axios from '../../utils/Axios';
import summaryApi from '../../common/summaryApi';
import { MessageCircle, Search, Plus, User, Store, Clock, Check } from 'lucide-react';

const ConversationList = ({ onSelectConversation, selectedConversation, isMobile = false }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, with-orders, product-only

    const user = useSelector(state => state.user);
    const { axiosNotificationError } = useNotification();

    // Fetch user conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: summaryApi.getUserChats.url,
                method: summaryApi.getUserChats.method
            });

            if (response.data.success) {
                setConversations(response.data.data);
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    // Format last message time
    const formatLastMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d`;
        }
    };

    // Filter conversations based on search and filter type
    const filteredConversations = conversations.filter(conv => {
        const otherUser = conv.buyerId._id === user._id ? conv.sellerId : conv.buyerId;
        const productName = conv.productId?.name || '';

        // Search filter
        const matchesSearch = searchTerm === '' ||
            otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productName.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const matchesFilter = filter === 'all' ||
            (filter === 'with-orders' && conv.orderId) ||
            (filter === 'product-only' && !conv.orderId);

        return matchesSearch && matchesFilter;
    });

    // Get conversation preview
    const getConversationPreview = (conv) => {
        const isUserBuyer = conv.buyerId._id === user._id;
        const otherUser = isUserBuyer ? conv.sellerId : conv.buyerId;
        const hasOrder = conv.orderId;

        return {
            otherUser,
            isUserBuyer,
            hasOrder,
            orderStatus: hasOrder ? (
                conv.orderCompleted ? 'Completed' :
                conv.orderConfirmed ? 'Shipped' : 'Pending'
            ) : null
        };
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col ${isMobile ? 'w-full h-full' : 'w-80 h-full'}`}>
            {/* Header - Fixed */}
            <div className={`${isMobile ? 'p-4 pt-6' : 'p-4'} border-b border-gray-200 flex-shrink-0`}>
                <div className={`flex items-center justify-between mb-4 ${isMobile ? 'mt-8' : ''}`}>
                    <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg ml-12' : 'text-xl'}`}>
                        Messages
                    </h2>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Plus size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isMobile ? 'text-sm' : ''
                        }`}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'with-orders', label: 'Orders' },
                        { key: 'product-only', label: 'Products' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                                filter === tab.key
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations List - Scrollable */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                        <MessageCircle size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No conversations
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? 'No conversations match your search.' : 'Start chatting with sellers about products!'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conv) => {
                            const { otherUser, isUserBuyer, hasOrder, orderStatus } = getConversationPreview(conv);
                            const isSelected = selectedConversation?._id === conv._id;

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => onSelectConversation(conv)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                    } ${isMobile ? 'p-3' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gray-200 rounded-full flex items-center justify-center`}>
                                            {otherUser.avatar ? (
                                                <img
                                                    src={otherUser.avatar}
                                                    alt={otherUser.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User size={isMobile ? 16 : 20} className="text-gray-500" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-medium text-gray-900 truncate ${isMobile ? 'text-sm' : ''}`}>
                                                    {otherUser.name}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    {conv.lastMessage && (
                                                        <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                            {formatLastMessageTime(conv.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* User Role & Product */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center gap-1">
                                                    {isUserBuyer ? <Store size={12} /> : <User size={12} />}
                                                    <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                                        {isUserBuyer ? 'Seller' : 'Buyer'}
                                                    </span>
                                                </div>
                                                {hasOrder && orderStatus && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                                            orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            orderStatus === 'Shipped' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {orderStatus}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Product Name */}
                                            <p className={`text-gray-600 truncate mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                {conv.productId?.name || 'Product'}
                                            </p>

                                            {/* Last Message */}
                                            {conv.lastMessage && (
                                                <p className={`text-gray-500 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                    {conv.lastMessage.senderId === user._id && (
                                                        <Check size={14} className="inline mr-1" />
                                                    )}
                                                    {conv.lastMessage.content}
                                                </p>
                                            )}
                                        </div>

                                        {/* Unread indicator */}
                                        {conv.unreadCount > 0 && (
                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
