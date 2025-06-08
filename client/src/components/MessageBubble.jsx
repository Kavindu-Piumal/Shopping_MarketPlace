import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const renderMessageContent = () => {
        switch (message.messageType) {
            case 'image':
                return (
                    <div className="max-w-xs">
                        <img
                            src={message.content}
                            alt="Shared image"
                            className="rounded-lg max-w-full h-auto"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                            }}
                        />
                    </div>
                );
            
            case 'voice':
                return (
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <audio
                            controls
                            className="w-full max-w-xs"
                            style={{ height: '40px' }}
                        >
                            <source src={message.content} type="audio/mpeg" />
                            <source src={message.content} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                );
            
            default:
                return (
                    <p className="whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                );
        }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start gap-2 max-w-[70%]">
                {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-medium flex-shrink-0">
                        {message.senderId.name.charAt(0).toUpperCase()}
                    </div>
                )}
                
                <div
                    className={`px-4 py-2 rounded-lg ${
                        isOwn
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-white border border-emerald-100 text-emerald-900 rounded-bl-sm'
                    }`}
                >
                    <div className="mb-1">
                        {renderMessageContent()}
                    </div>
                    
                    <div className={`text-xs flex items-center gap-1 ${
                        isOwn ? 'text-emerald-100' : 'text-emerald-500'
                    }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {isOwn && (
                            <span>
                                {message.isRead ? (
                                    <svg className="w-3 h-3 text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </span>
                        )}
                    </div>
                </div>
                
                {isOwn && (
                    <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center text-lime-700 text-sm font-medium flex-shrink-0">
                        {message.senderId.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
