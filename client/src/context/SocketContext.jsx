import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const user = useSelector(state => state.user);

    useEffect(() => {
        if (user && user._id) {
            // Create socket connection
            const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
                withCredentials: true
            });

            // Connection handlers
            newSocket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
                newSocket.emit('join', user._id);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from server');
                setIsConnected(false);
            });

            // Error handling
            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                setIsConnected(false);
            });

            setSocket(newSocket);

            // Cleanup on unmount or user change
            return () => {
                newSocket.close();
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [user]);

    // Socket helper functions
    const joinChat = (chatId) => {
        if (socket && isConnected) {
            socket.emit('join-chat', chatId);
        }
    };

    const sendMessage = (data) => {
        if (socket && isConnected) {
            socket.emit('send-message', data);
        }
    };

    const emitTyping = (chatId, userId) => {
        if (socket && isConnected) {
            socket.emit('typing', { chatId, userId });
        }
    };

    const emitStopTyping = (chatId, userId) => {
        if (socket && isConnected) {
            socket.emit('stop-typing', { chatId, userId });
        }
    };

    const value = {
        socket,
        isConnected,
        onlineUsers,
        joinChat,
        sendMessage,
        emitTyping,
        emitStopTyping
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
