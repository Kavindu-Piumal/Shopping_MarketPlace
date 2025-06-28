import Axios from "./Axios"
import summaryApi from "../common/summaryApi"

/**
 * 🎯 ENTERPRISE-GRADE: Authentication-aware user details fetcher
 * ZERO unnecessary API calls for unauthenticated users
 */
const fetchUserDetails = async () => {
    try {
        // 🚀 PERFORMANCE: Check tokens FIRST before any network calls
        const accessToken = localStorage.getItem('accesstoken');
        const refreshToken = localStorage.getItem('refreshtoken');
        
        // 🔒 SECURITY: No tokens = immediate return (no API spam)
        if (!accessToken && !refreshToken) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('🚫 fetchUserDetails: NO TOKENS - Aborting API call');
            }
            return { 
                success: false, 
                data: null, 
                message: 'No authentication credentials found',
                isAuthenticated: false,
                shouldRetry: false
            };
        }

        if (process.env.NODE_ENV === 'development') {
            console.info('🌐 fetchUserDetails: Making API call to /user-details');
        }

        // 🌐 NETWORK: Only make API call when tokens exist
        const response = await Axios({
            url: summaryApi.userDetails.url,
            method: summaryApi.userDetails.method,
            withCredentials: true,
            timeout: 10000, // 10 second timeout
        });

        // 🎉 SUCCESS: User authenticated
        return {
            ...response.data,
            isAuthenticated: true,
            shouldRetry: false
        };

    } catch (error) {
        // 🔥 PROFESSIONAL ERROR HANDLING

        // 401: Token expired/invalid
        if (error.response?.status === 401) {
            localStorage.removeItem('accesstoken');
            localStorage.removeItem('refreshtoken');
            
            return { 
                success: false, 
                data: null, 
                message: 'Session expired - please login again',
                isAuthenticated: false,
                shouldRetry: false,
                redirectToLogin: true
            };
        }

        // 403: Access forbidden
        if (error.response?.status === 403) {
            return { 
                success: false, 
                data: null, 
                message: 'Access denied - insufficient permissions',
                isAuthenticated: false,
                shouldRetry: false
            };
        }

        // 500: Server error
        if (error.response?.status >= 500) {
            return { 
                success: false, 
                data: null, 
                message: 'Server temporarily unavailable',
                isAuthenticated: false,
                shouldRetry: true // Can retry server errors
            };
        }

        // Network errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
            return { 
                success: false, 
                data: null, 
                message: 'Network connection failed',
                isAuthenticated: false,
                shouldRetry: true
            };
        }

        // 🔍 DEVELOPMENT: Detailed logging (production-safe)
        if (process.env.NODE_ENV === 'development') {
            console.group('🔐 Authentication Error Details');
            console.warn('Status:', error.response?.status);
            console.warn('Message:', error.message);
            console.warn('Code:', error.code);
            console.groupEnd();
        }

        // 🚨 FALLBACK: Unknown error
        return { 
            success: false, 
            data: null, 
            message: 'Authentication check failed',
            isAuthenticated: false,
            shouldRetry: false
        };
    }
}

export default fetchUserDetails