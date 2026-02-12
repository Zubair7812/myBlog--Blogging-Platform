import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EmojiPickerButton from '../components/EmojiPickerButton';
import './Chat.css';

const Chat = () => {
    const { username } = useParams(); // target user for chat
    const { user } = useAuth();
    const location = useLocation(); // Hook to get query params
    const navigate = useNavigate(); // Hook for navigation
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [error, setError] = useState('');
    const messagesContainerRef = useRef(null);

    // Fetch Contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get('/api/chat/contacts');
                // Ensure the currently active chat always shows 0 unread
                const updatedContacts = res.data.contacts.map(c =>
                    c.user.username === username
                        ? { ...c, unreadCount: 0 }
                        : c
                );
                setContacts(updatedContacts);
                setError('');
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || err.message || 'Failed to load contacts');
            }
        };
        fetchContacts();
        const interval = setInterval(fetchContacts, 5000); // Poll contacts
        return () => clearInterval(interval);
    }, [username]); // Re-run when username changes

    // Fetch Active Chat
    useEffect(() => {
        if (!username) return;

        const fetchChat = async () => {
            try {
                // console.log(`Fetching chat for: ${username}`);
                const res = await axios.get(`/api/chat/${username}`);
                // console.log("Chat data:", res.data);
                if (res.data.activeChat) {
                    setActiveChatUser(res.data.activeChat);
                    setMessages(res.data.messages);
                    setError('');

                    // Optimistic update: Clear unread count locally
                    setContacts(prev => prev.map(c =>
                        c.user.username === username
                            ? { ...c, unreadCount: 0 }
                            : c
                    ));
                } else {
                    setError("Active chat user not found in response");
                }

                // Mark as read
                await axios.post('/api/chat/mark-read', { senderUsername: username });
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load chat");
            }
        };

        fetchChat();
    }, [username]);

    // Debug: Log activeChatUser changes
    useEffect(() => {
        console.log('activeChatUser changed:', activeChatUser);
    }, [activeChatUser]);

    // Debug: Log messages changes
    useEffect(() => {
        console.log('messages changed:', messages);
    }, [messages]);

    // Scroll to bottom
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Function to convert URLs in text to clickable links
    const linkifyText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-link"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !username) return;

        try {
            const res = await axios.post('/api/chat/send', {
                recipientUsername: username,
                content: newMessage
            });
            setMessages([...messages, res.data.message]);
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container chat-container">
            <div className={`chat-sidebar ${!username ? 'mobile-active' : ''}`}>
                <h2>Chats</h2>
                {error && <div style={{ padding: '1rem', color: 'red', fontSize: '0.8rem' }}>{error}</div>}
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <Link
                            to={`/chat/${contact.user.username}`}
                            key={contact.user._id}
                            className={`contact-item ${username === contact.user.username ? 'active' : ''}`}
                        >
                            <img
                                src={contact.user.dp ? `/thumbnails/${contact.user.dp}` : '/thumbnails/default-user.jpg'}
                                alt={contact.user.username}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                            />
                            <div className="contact-info">
                                <span className="contact-name">{contact.user.fullname || contact.user.username}</span>
                                <span className="last-msg">
                                    {contact.lastMessage?.content?.substring(0, 20)}...
                                </span>
                            </div>
                            {contact.unreadCount > 0 && <span className="unread-badge">{contact.unreadCount}</span>}
                        </Link>
                    ))}
                    {contacts.length === 0 && <p className="no-contacts">No recent chats.</p>}
                </div>
            </div>

            <div className={`chat-main ${username ? 'mobile-active' : ''}`}>
                {username && activeChatUser ? (
                    <>
                        <div className="chat-header">
                            <button className="mobile-back-btn" onClick={() => navigate('/chat')}>
                                {'<'}
                            </button>
                            <img
                                src={activeChatUser.dp ? `/thumbnails/${activeChatUser.dp}` : '/thumbnails/default-user.jpg'}
                                alt={activeChatUser.username}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                            />
                            <h3>{activeChatUser.fullname || activeChatUser.username}</h3>
                        </div>
                        <div className="messages-area" ref={messagesContainerRef}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '2rem' }}>
                                    <p>No messages yet. Say hi!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const currentDate = new Date(msg.createdAt).toDateString();
                                    const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                                    const showDate = currentDate !== prevDate;

                                    let dateLabel = new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                    const today = new Date().toDateString();
                                    const yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);

                                    if (currentDate === today) dateLabel = 'Today';
                                    else if (currentDate === yesterday.toDateString()) dateLabel = 'Yesterday';

                                    return (
                                        <div key={msg._id} style={{ display: 'flex', flexDirection: 'column' }}>
                                            {showDate && (
                                                <div className="date-separator">
                                                    <span>{dateLabel}</span>
                                                </div>
                                            )}
                                            <div
                                                className={`message-bubble ${msg.sender?._id?.toString() === activeChatUser?._id?.toString() ? 'received' : 'sent'}`}
                                            >
                                                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                    {linkifyText(msg.content)}
                                                </p>
                                                <small>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <EmojiPickerButton onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji)} />
                            <button type="submit" className="btn btn-primary">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
