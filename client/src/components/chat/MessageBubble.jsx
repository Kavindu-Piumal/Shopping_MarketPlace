import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

const MessageBubble = ({ message, isOwn, isMobile = false }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getMessageStatus = () => {
        if (message.readAt) {
            return <CheckCheck size={12} className="text-blue-500" />;
        } else if (message.deliveredAt) {
            return <CheckCheck size={12} className="text-gray-400" />;
        } else if (message.sentAt) {
            return <Check size={12} className="text-gray-400" />;
        } else {
            return <Clock size={12} className="text-gray-300" />;
        }
    };

    const isSystemMessage = message.messageType === 'system';

    if (isSystemMessage) {
        return (
            <div className="flex justify-center my-4">
                <div className={`bg-gray-100 text-gray-600 rounded-lg px-3 py-2 max-w-xs text-center ${
                    isMobile ? 'text-xs px-2 py-1' : 'text-sm'
                }`}>
                    <AlertCircle size={14} className="inline mr-1" />
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <div className={`flex flex-col ${isMobile ? 'max-w-[280px]' : 'max-w-xs lg:max-w-md'}`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-2 rounded-2xl ${
                        isOwn
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    } ${isMobile ? 'px-3 py-2 text-sm' : ''}`}
                >
                    {/* Message Content */}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                    </p>

                    {/* Attachments (if any) */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                                <div key={index} className="border border-white/20 rounded-lg p-2">
                                    {attachment.type === 'image' ? (
                                        <img
                                            src={attachment.url}
                                            alt="Attachment"
                                            className="max-w-full h-auto rounded"
                                        />
                                    ) : (
                                        <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`underline text-sm ${isOwn ? 'text-white' : 'text-blue-600'}`}
                                        >
                                            {attachment.name || 'Download File'}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Info */}
                <div className={`flex items-center gap-1 mt-1 ${
                    isOwn ? 'justify-end' : 'justify-start'
                } ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    <span className="text-gray-500">
                        {formatTime(message.createdAt)}
                    </span>

                    {/* Show status only for own messages */}
                    {isOwn && (
                        <span className="ml-1">
                            {getMessageStatus()}
                        </span>
                    )}
                </div>

                {/* Edited indicator */}
                {message.editedAt && (
                    <div className={`text-xs text-gray-400 mt-1 ${
                        isOwn ? 'text-right' : 'text-left'
                    }`}>
                        edited
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
