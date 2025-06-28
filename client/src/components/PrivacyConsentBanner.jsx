import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PrivacyConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(!localStorage.getItem('chatPrivacyConsent'));
    
    const handleAccept = () => {
        localStorage.setItem('chatPrivacyConsent', 'accepted');
        localStorage.setItem('chatPrivacyConsentDate', new Date().toISOString());
        setIsVisible(false);
        toast.success('Privacy settings saved');
    };
    
    const handleViewPolicy = () => {
        window.open('/privacy-policy#chat-communications', '_blank');
    };
    
    if (!isVisible) return null;
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-t-2 border-yellow-200 p-3 md:p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="font-semibold text-yellow-800 text-sm md:text-base">Chat Privacy Notice</h3>
                    </div>
                    <p className="text-xs md:text-sm text-yellow-700 leading-relaxed">
                        Your chat messages are encrypted for privacy. Platform administrators may access conversations 
                        for dispute resolution, fraud prevention, and legal compliance as outlined in our privacy policy.
                    </p>
                </div>
                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={handleViewPolicy}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition"
                    >
                        View Policy
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyConsentBanner;
