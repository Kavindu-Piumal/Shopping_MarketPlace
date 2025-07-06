import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'reconnecting'
    const [retryCount, setRetryCount] = useState(0);

    const user = useSelector(state => state.user);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const visibilityChangeRef = useRef(null);
    const maxRetries = 5;
    const retryDelays = [1000, 2000, 5000, 10000, 30000]; // Progressive delays

    // Auto-reconnection function
    const reconnectSocket = useCallback(() => {
        if (retryCount >= maxRetries) {
            console.log('❌ Max reconnection attempts reached');
            setConnectionStatus('failed');
            return;
        }

        const delay = retryDelays[retryCount] || 30000;
        console.log(`🔄 Attempting to reconnect in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);

        setConnectionStatus('reconnecting');

        reconnectTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            createSocketConnection();
        }, delay);
    }, [retryCount]);

    // Create socket connection with enhanced error handling
    const createSocketConnection = useCallback(() => {
        if (!user?._id) return;

        console.log('🔌 Creating socket connection...');
        setConnectionStatus('connecting');

        const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            timeout: 10000,
            forceNew: true // Force new connection
        });

        // Connection success
        newSocket.on('connect', () => {
            console.log('✅ Connected to server with socket ID:', newSocket.id);
            setIsConnected(true);
            setConnectionStatus('connected');
            setRetryCount(0); // Reset retry count on successful connection

            console.log('🏠 Joining user room for notifications:', user._id);
            newSocket.emit('join', user._id);

            // Start heartbeat to keep connection alive
            startHeartbeat(newSocket);
        });

        // Connection failure
        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server. Reason:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');
            stopHeartbeat();

            // Auto-reconnect unless it's a manual disconnect
            if (reason !== 'io client disconnect') {
                reconnectSocket();
            }
        });

        // Connection errors
        newSocket.on('connect_error', (error) => {
            console.error('💥 Connection error:', error);
            setIsConnected(false);
            setConnectionStatus('error');
            stopHeartbeat();

            // Attempt to reconnect on error
            reconnectSocket();
        });

        // Reconnection events
        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            setRetryCount(0);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('🔄❌ Reconnection failed:', error);
        });

        setSocket(newSocket);
        return newSocket;
    }, [user?._id, reconnectSocket]);

    // Heartbeat to keep connection alive
    const startHeartbeat = (socketInstance) => {
        heartbeatIntervalRef.current = setInterval(() => {
            if (socketInstance && socketInstance.connected) {
                socketInstance.emit('heartbeat', { userId: user._id, timestamp: Date.now() });
            }
        }, 30000); // Send heartbeat every 30 seconds
    };

    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    // Handle browser visibility changes (tab focus/blur)
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            console.log('👁️ Tab hidden - reducing activity');
        } else {
            console.log('👁️ Tab visible - resuming full activity');

            // Refresh connection when tab becomes visible
            if (!isConnected && user?._id) {
                console.log('🔄 Tab became visible, reconnecting...');
                createSocketConnection();
            }

            // Emit user activity
            if (socket && socket.connected) {
                socket.emit('user-active', { userId: user._id });
            }
        }
    }, [isConnected, socket, user?._id, createSocketConnection]);

    // Manual reconnection function for UI buttons
    const manualReconnect = useCallback(() => {
        console.log('🔄 Manual reconnection triggered');
        setRetryCount(0);

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (socket) {
            socket.disconnect();
        }

        createSocketConnection();
    }, [socket, createSocketConnection]);

    // Initialize socket connection
    useEffect(() => {
        if (user && user._id) {
            createSocketConnection();

            // Add visibility change listener
            document.addEventListener('visibilitychange', handleVisibilityChange);
            visibilityChangeRef.current = handleVisibilityChange;

            return () => {
                // Cleanup
                if (socket) {
                    socket.close();
                }

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }

                stopHeartbeat();

                if (visibilityChangeRef.current) {
                    document.removeEventListener('visibilitychange', visibilityChangeRef.current);
                }
            };
        }
    }, [user?._id, createSocketConnection]);

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Network back online');
            if (!isConnected && user?._id) {
                manualReconnect();
            }
        };

        const handleOffline = () => {
            console.log('🌐 Network went offline');
            setConnectionStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isConnected, user?._id, manualReconnect]);

    const value = {
        socket,
        isConnected,
        connectionStatus,
        onlineUsers,
        retryCount,
        maxRetries,
        manualReconnect
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
