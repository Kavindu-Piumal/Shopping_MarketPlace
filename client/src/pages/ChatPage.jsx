import React from 'react';
import Chat from '../components/Chat';
import DashboardMobileLayout from '../components/DashboardMobileLayout';

const ChatPage = () => {
    return (
        <DashboardMobileLayout>
            <Chat />
        </DashboardMobileLayout>
    );
};

export default ChatPage;