import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import DashboardMobileLayout from './DashboardMobileLayout';

const AdminChatHistory = () => {
    const { showSuccess, showError, axiosNotificationError } = useNotification();
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showEncrypted, setShowEncrypted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [justification, setJustification] = useState('');
    const [showJustificationModal, setShowJustificationModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const user = useSelector(state => state.user);

    // Check if user is admin
    const isAdmin = user && user.role === 'admin';

    const requireJustification = (action, callback) => {
        setPendingAction({ action, callback });
        setShowJustificationModal(true);
    };    const handleJustifiedAction = () => {
        if (!justification.trim() || justification.trim().length < 10) {
            showError('Please provide a detailed justification (minimum 10 characters)');
            return;
        }

        if (pendingAction) {
            pendingAction.callback(justification);
        }
        
        setShowJustificationModal(false);
        setJustification('');
        setPendingAction(null);
    };

    const fetchChatHistory = async (adminJustification = '') => {
        if (!isAdmin) return;

        try {
            setLoading(true);
            const response = await Axios({
                url: summaryApi.getAdminChatHistory.url,
                method: summaryApi.getAdminChatHistory.method,
                data: adminJustification ? { justification: adminJustification } : {}
            });            if (response.data.success) {
                setChatHistory(response.data.data);
                if (adminJustification) {
                    showSuccess('Chat history accessed - action logged for audit');
                }
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSelect = (chat) => {
        requireJustification(
            `Viewing detailed chat history for users: ${chat.buyerId?.name} and ${chat.sellerId?.name}`,
            (justification) => {
                setSelectedChat(chat);
                // Log the justification
                console.log('Admin chat access justified:', justification);
            }
        );
    };

    useEffect(() => {
        if (isAdmin) {
            fetchChatHistory();
        }
    }, [isAdmin]);

    const filteredChats = chatHistory.filter(chat => {
        const matchesSearch = 
            chat.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.sellerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.orderId?.orderId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = 
            filterStatus === 'all' ||
            (filterStatus === 'active' && chat.isActive) ||
            (filterStatus === 'completed' && chat.orderCompleted) ||
            (filterStatus === 'confirmed' && chat.orderConfirmed && !chat.orderCompleted) ||
            (filterStatus === 'deleted' && (chat.deletedByBuyer || chat.deletedBySeller));

        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m6-7V8a3 3 0 00-6 0v3m0 0a3 3 0 003 3h6a3 3 0 003-3V8a3 3 0 00-3-3h-6z" />
                    </svg>
                    <p className="text-red-600 font-medium">Access Denied</p>
                    <p className="text-red-500 text-sm">Admin privileges required</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardMobileLayout>
            <div className="bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-50 min-h-screen">
                {/* Privacy Warning Banner - More compact on mobile */}
                <div className="bg-red-50 border-l-4 border-red-400 p-2 lg:p-4 mb-3 lg:mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-4 w-4 lg:h-5 lg:w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-xs lg:text-sm font-medium text-red-800">Privacy & Ethics Notice</h3>
                        <div className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-700">
                            <p className="hidden lg:block">You are accessing private user communications. This action is logged and audited. Only access chats when:</p>
                            <p className="lg:hidden">Accessing private communications - logged & audited</p>
                            <ul className="list-disc ml-5 mt-1 text-xs hidden lg:block">
                                <li>Resolving customer disputes</li>
                                <li>Investigating fraud or policy violations</li>
                                <li>Complying with legal requirements</li>
                                <li>Ensuring platform safety</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-2 lg:p-4">
                <div className="bg-white/90 rounded-xl shadow-lg overflow-hidden">
                    {/* Header - More compact on mobile */}
                    <div className="p-3 lg:p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <h1 className="text-lg lg:text-2xl font-bold flex items-center gap-2 lg:gap-3">
                            <svg className="w-5 h-5 lg:w-8 lg:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="hidden lg:inline">Admin Chat History Monitor</span>
                            <span className="lg:hidden">Chat Monitor</span>
                        </h1>
                        <p className="text-blue-100 mt-1 text-xs lg:text-base">
                            <span className="hidden lg:inline">Monitor and review encrypted chat communications responsibly</span>
                            <span className="lg:hidden">Review communications responsibly</span>
                        </p>
                    </div>

                    {/* Controls - More compact on mobile */}
                    <div className="p-3 lg:p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col gap-3 lg:gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-3 lg:gap-4 lg:flex-row flex-1">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search chats..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-8 lg:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    />
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute left-2 lg:left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                >
                                    <option value="all">All Chats</option>
                                    <option value="active">Active</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>

                            {/* Encryption Toggle & Refresh */}
                            <div className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showEncrypted}
                                        onChange={(e) => setShowEncrypted(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-xs lg:text-sm text-gray-700">
                                        <span className="hidden lg:inline">Show encrypted content</span>
                                        <span className="lg:hidden">Encrypted</span>
                                    </span>
                                </label>
                                <button
                                    onClick={fetchChatHistory}
                                    className="px-3 lg:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat List - 2 columns on mobile, responsive */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 p-3 lg:p-6 max-h-[70vh] lg:max-h-none overflow-y-auto">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-8">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <svg className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-500 font-medium text-sm lg:text-base">No chats found</p>
                                <p className="text-gray-400 text-xs lg:text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className="bg-white border border-gray-200 rounded-lg p-2 lg:p-4 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-start gap-2 lg:gap-3 mb-2 lg:mb-3">
                                        <img
                                            src={chat.productId?.image?.[0] || '/placeholder-product.png'}
                                            alt={chat.productId?.name}
                                            className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg object-cover border-2 border-gray-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate text-xs lg:text-sm">{chat.productId?.name}</h4>
                                            <p className="text-xs lg:text-sm text-gray-600 truncate">#{chat.orderId?.orderId}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Buyer:</span>
                                            <span className="text-gray-900 truncate ml-1">{chat.buyerId?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Seller:</span>
                                            <span className="text-gray-900 truncate ml-1">{chat.sellerId?.name}</span>
                                        </div>
                                        <div className="flex justify-between lg:hidden">
                                            <span className="text-gray-500">Msgs:</span>
                                            <span className="text-gray-900">{chat.messageCount || 0}</span>
                                        </div>
                                        <div className="hidden lg:flex justify-between">
                                            <span className="text-gray-500">Messages:</span>
                                            <span className="text-gray-900">{chat.messageCount || 0}</span>
                                        </div>
                                        <div className="hidden lg:flex justify-between">
                                            <span className="text-gray-500">Created:</span>
                                            <span className="text-gray-900">{formatDate(chat.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-100">
                                        <div className="flex gap-1 lg:gap-2">
                                            <span className={`text-xs px-1 lg:px-2 py-1 rounded-full font-medium ${
                                                chat.orderCompleted 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : chat.orderConfirmed
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {chat.orderCompleted ? 'Done' : chat.orderConfirmed ? 'Confirmed' : 'Pending'}
                                            </span>
                                            
                                            {(chat.deletedByBuyer || chat.deletedBySeller) && (
                                                <span className="text-xs px-1 lg:px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                                    Del
                                                </span>
                                            )}
                                        </div>

                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Detail Modal */}
                    {selectedChat && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-800 bg opacity-90">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Chat Details</h3>
                                        <button
                                            onClick={() => setSelectedChat(null)}
                                            className="text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Chat Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><span className="text-gray-500">Chat ID:</span> {selectedChat._id}</div>
                                                <div><span className="text-gray-500">Product:</span> {selectedChat.productId?.name}</div>
                                                <div><span className="text-gray-500">Order ID:</span> {selectedChat.orderId?.orderId}</div>
                                                <div><span className="text-gray-500">Created:</span> {formatDate(selectedChat.createdAt)}</div>
                                                <div><span className="text-gray-500">Last Updated:</span> {formatDate(selectedChat.updatedAt)}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Participants</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><span className="text-gray-500">Buyer:</span> {selectedChat.buyerId?.name} ({selectedChat.buyerId?.email})</div>
                                                <div><span className="text-gray-500">Seller:</span> {selectedChat.sellerId?.name} ({selectedChat.sellerId?.email})</div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedChat.messages && selectedChat.messages.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Messages ({selectedChat.messages.length})</h4>
                                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                                {selectedChat.messages.map((message, index) => (
                                                    <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="font-medium text-gray-900">
                                                                {message.senderId?.name || 'System'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(message.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            {showEncrypted && message.encryptedContent ? (
                                                                <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                                                                    <span className="text-red-600">Encrypted:</span> {message.encryptedContent}
                                                                </div>
                                                            ) : (
                                                                <div>{message.content}</div>
                                                            )}
                                                        </div>
                                                        {message.messageType !== 'text' && (
                                                            <span className="inline-block mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                                {message.messageType}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Justification Modal */}
                    {showJustificationModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-800 bg opacity-90">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Access Justification Required</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Please provide a business justification for accessing this private communication:
                                    </p>
                                    <p className="text-xs text-blue-600 mb-3 font-medium">
                                        Action: {pendingAction?.action}
                                    </p>
                                    <textarea
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="e.g., Customer dispute resolution - Order #12345, investigating fraud report, legal compliance request..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                        rows="4"
                                    />
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                setShowJustificationModal(false);
                                                setJustification('');
                                                setPendingAction(null);
                                            }}
                                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleJustifiedAction}
                                            disabled={!justification.trim() || justification.trim().length < 10}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Proceed with Access
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </DashboardMobileLayout>
    );
};

export default AdminChatHistory;
