import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { listenToChatMessages, sendChatMessage } from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { CloseIcon, PaperAirplaneIcon, SpinnerIcon } from './Icons';

interface ChatRoomModalProps {
    onClose: () => void;
}

const ChatRoomModal: React.FC<ChatRoomModalProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { user } = useAuth();

    const [nickname, setNickname] = useState<string | null>(user?.email || null);
    const [tempNickname, setTempNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(modalRef, true, onClose);

    useEffect(() => {
        // Only start listening when we have a nickname (or user is logged in)
        if (nickname) {
            const unsubscribe = listenToChatMessages((messageData) => {
                setMessages(messageData);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [nickname]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoinChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tempNickname.trim()) {
            setNicknameError('Nickname cannot be empty.');
            return;
        }
        if (tempNickname.trim().length > 20) {
            setNicknameError('Nickname must be 20 characters or less.');
            return;
        }
        setNickname(tempNickname.trim());
        setNicknameError('');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !nickname) return;

        setSending(true);
        const textToSend = newMessage;
        setNewMessage('');
        
        try {
            // Use user's real ID and email if logged in, otherwise use the nickname
            const senderId = user?.id || nickname;
            const senderIdentifier = user?.email || nickname;
            await sendChatMessage(senderId, senderIdentifier, textToSend);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Optionally, handle the error in the UI
            setNewMessage(textToSend); // Restore message on failure
        } finally {
            setSending(false);
        }
    };
    
    const isMyMessage = (msg: ChatMessage) => {
        // If logged in, check against UID. If anonymous, check against nickname used as ID.
        return (user && msg.userId === user.id) || (!user && nickname && msg.userId === nickname);
    };

    const renderNicknamePrompt = () => (
        <div className="flex flex-col justify-center items-center h-full p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter a Nickname to Join</h3>
            <form onSubmit={handleJoinChat} className="w-full max-w-sm">
                <input
                    type="text"
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    placeholder="Your display name..."
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                    aria-label="Enter your nickname"
                />
                {nicknameError && <p className="text-red-500 text-sm mt-2">{nicknameError}</p>}
                <button
                    type="submit"
                    className="w-full mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Join Chat
                </button>
            </form>
        </div>
    );

    const renderChat = () => (
        <>
            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <SpinnerIcon className="text-blue-600"/>
                        <p className="ml-2">Loading messages...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-sm ${isMyMessage(msg) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {!isMyMessage(msg) && (
                                        <p className="text-xs font-bold mb-1 opacity-70">{msg.userEmail}</p>
                                    )}
                                    <p>{msg.text}</p>
                                    <p className="text-xs text-right mt-1 opacity-60">
                                        {msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <footer className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                        aria-label="Chat message input"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[90vh] max-h-[700px] m-4 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-room-title"
            >
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 id="chat-room-title" className="text-xl font-bold text-gray-800">Student Chat Room</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                        aria-label="Close chat room"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                {nickname ? renderChat() : renderNicknamePrompt()}
            </div>
        </div>
    );
};

export default ChatRoomModal;