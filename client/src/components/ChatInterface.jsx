import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import useMobile from '../hooks/useMobile';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import ConversationList from './chat/ConversationList';
import ChatWindow from './chat/ChatWindow';
import EmptyState from './chat/EmptyState';

const ChatInterface = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMobileChat, setShowMobileChat] = useState(false);

    const user = useSelector(state => state.user);
    const [isMobile] = useMobile();
    const { socket, isConnected } = useSocket();
    const { showError, axiosNotificationError } = useNotification();

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

    // Handle conversation selection
    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        if (isMobile) {
            setShowMobileChat(true);
        }

        // Join socket room for real-time updates
        if (socket && isConnected) {
            socket.emit('join-chat', conversation._id);
        }
    };

    // Handle back to conversations (mobile)
    const handleBackToConversations = () => {
        setShowMobileChat(false);
        setSelectedConversation(null);
    };

    // Update conversation when new message arrives
    const handleConversationUpdate = (updatedConversation) => {
        setConversations(prev =>
            prev.map(conv =>
                conv._id === updatedConversation._id ? updatedConversation : conv
            )
        );

        if (selectedConversation && selectedConversation._id === updatedConversation._id) {
            setSelectedConversation(updatedConversation);
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (socket && isConnected) {
            socket.on('conversation-updated', handleConversationUpdate);
            socket.on('new-message', (data) => {
                if (data.chatId !== selectedConversation?._id) {
                    // Update unread count for other conversations
                    fetchConversations();
                }
            });

            return () => {
                socket.off('conversation-updated');
                socket.off('new-message');
            };
        }
    }, [socket, isConnected, selectedConversation]);

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    // Login required state
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chat</h2>
                    <p className="text-gray-600 mb-6">Please login to start conversations with buyers and sellers</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    // Mobile layout
    if (isMobile) {
        return (
            <div className="min-h-screen bg-gray-50">
                {!showMobileChat ? (
                    <ConversationList
                        conversations={conversations}
                        onSelect={handleConversationSelect}
                        loading={loading}
                        onRefresh={fetchConversations}
                        isMobile={true}
                    />
                ) : (
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={handleBackToConversations}
                        onUpdate={handleConversationUpdate}
                        isMobile={true}
                    />
                )}
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-2rem)]">
                    <div className="flex h-full">
                        {/* Conversations Sidebar */}
                        <div className="w-1/3 border-r border-gray-200">
                            <ConversationList
                                conversations={conversations}
                                selectedId={selectedConversation?._id}
                                onSelect={handleConversationSelect}
                                loading={loading}
                                onRefresh={fetchConversations}
                                isMobile={false}
                            />
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1">
                            {selectedConversation ? (
                                <ChatWindow
                                    conversation={selectedConversation}
                                    onUpdate={handleConversationUpdate}
                                    isMobile={false}
                                />
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
