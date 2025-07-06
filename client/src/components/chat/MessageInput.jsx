import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Send, Smile } from 'lucide-react';

const MessageInput = ({
    onSendMessage,
    onTyping,
    onStopTyping,
    disabled = false,
    placeholder = "Type a message...",
    isMobile = false
}) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { socket } = useSocket();

    const handleSend = async () => {
        if (!message.trim() || sending || disabled) return;

        setSending(true);
        try {
            await onSendMessage(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }

            // Stop typing when message is sent
            if (isTyping) {
                setIsTyping(false);
                if (onStopTyping) onStopTyping();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }

        // Handle typing indicators
        if (value.trim() && !isTyping) {
            setIsTyping(true);
            if (onTyping) onTyping();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        if (value.trim()) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                if (onStopTyping) onStopTyping();
            }, 1000);
        } else if (isTyping) {
            setIsTyping(false);
            if (onStopTyping) onStopTyping();
        }

        // Emit typing indicator
        if (socket) {
            socket.emit('typing', { typing: e.target.value.length > 0 });
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`flex items-end gap-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
            {/* Message Input Container */}
            <div className="flex-1 relative">
                <div className={`flex items-end bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-blue-500 transition-colors ${
                    isMobile ? 'min-h-[40px]' : 'min-h-[44px]'
                }`}>
                    {/* Text Input */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled || sending}
                        className={`flex-1 bg-transparent border-none outline-none resize-none py-3 px-3 max-h-32 ${
                            isMobile ? 'text-sm py-2 px-3' : ''
                        }`}
                        rows={1}
                        style={{ lineHeight: '1.4' }}
                    />

                    {/* Optional: Emoji button */}
                    <button
                        type="button"
                        className={`flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors ${
                            isMobile ? 'p-2' : 'p-3'
                        }`}
                        disabled={disabled}
                    >
                        <Smile size={isMobile ? 16 : 18} />
                    </button>
                </div>
            </div>

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={!message.trim() || sending || disabled}
                className={`flex-shrink-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
                    isMobile ? 'p-2' : 'p-3'
                }`}
            >
                {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                    <Send size={isMobile ? 16 : 18} />
                )}
            </button>
        </div>
    );
};

export default MessageInput;
