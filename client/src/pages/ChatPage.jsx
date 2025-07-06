import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import MobileBackButton from '../components/MobileBackButton';

const ChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showChatWindow, setShowChatWindow] = useState(false);

    const user = useSelector(state => state.user);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user came from user menu
    const fromUserMenu = location.state?.from === 'user-menu';

    // Check if user is on mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle conversation selection
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        if (isMobile) {
            setShowChatWindow(true);
        }
    };

    // Handle back from chat window (mobile)
    const handleBackFromChat = () => {
        setShowChatWindow(false);
        setSelectedConversation(null);
    };

    // Handle back to chat list (desktop)
    const handleBackToChatList = () => {
        setSelectedConversation(null);
    };

    // Update conversation data
    const handleUpdateConversation = (updatedConversation) => {
        setSelectedConversation(updatedConversation);
    };

    // If user is not logged in
    if (!user._id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please sign in to access your messages and chat with sellers.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Back button for mobile when coming from user menu - only show when not in a chat */}
            {isMobile && fromUserMenu && !showChatWindow && (
                <MobileBackButton
                    label="User Menu"
                    to="/user-menu-mobile"
                    isFixed={true}
                    className="mt-2"
                />
            )}

            {/* Mobile Layout */}
            {isMobile ? (
                <div className="h-[calc(100vh-80px)] bg-white flex flex-col">
                    {showChatWindow && selectedConversation ? (
                        <ChatWindow
                            conversation={selectedConversation}
                            onBack={handleBackFromChat}
                            onUpdate={handleUpdateConversation}
                            isMobile={true}
                        />
                    ) : (
                        <ConversationList
                            onSelectConversation={handleSelectConversation}
                            selectedConversation={selectedConversation}
                            isMobile={true}
                        />
                    )}
                </div>
            ) : (
                /* Desktop Layout - Perfect viewport fit, no scrolling */
                <div className="h-[calc(100vh-80px)] bg-gray-50 flex flex-col overflow-hidden">
                    <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col p-2">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
                            <div className="flex h-full">
                                {/* Conversation List - Desktop */}
                                <ConversationList
                                    onSelectConversation={handleSelectConversation}
                                    selectedConversation={selectedConversation}
                                    isMobile={false}
                                />

                                {/* Chat Window - Desktop */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {selectedConversation ? (
                                        <ChatWindow
                                            conversation={selectedConversation}
                                            onBack={handleBackToChatList}
                                            onUpdate={handleUpdateConversation}
                                            isMobile={false}
                                        />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                                            <div className="text-center">
                                                <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    Select a conversation
                                                </h3>
                                                <p className="text-gray-500">
                                                    Choose a conversation from the list to start messaging
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPage;
