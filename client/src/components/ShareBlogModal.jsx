import { useState, useEffect } from 'react';
import axios from 'axios';
import './ShareBlogModal.css';

const ShareBlogModal = ({ isOpen, onClose, blogTitle, blogUrl }) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/chat/contacts');
            setContacts(res.data.contacts || []);
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleContact = (username) => {
        setSelectedContacts(prev =>
            prev.includes(username)
                ? prev.filter(u => u !== username)
                : [...prev, username]
        );
    };

    const handleShare = async () => {
        if (selectedContacts.length === 0) {
            alert('Please select at least one contact');
            return;
        }

        setSending(true);
        const shareMessage = `Check out this blog: ${blogTitle}\n${blogUrl}`;

        try {
            // Send to all selected contacts
            await Promise.all(
                selectedContacts.map(username =>
                    axios.post('/api/chat/send', {
                        recipientUsername: username,
                        content: shareMessage
                    })
                )
            );

            setMessage(`Blog shared with ${selectedContacts.length} contact(s)!`);
            setTimeout(() => {
                onClose();
                setSelectedContacts([]);
                setMessage('');
            }, 1500);
        } catch (err) {
            console.error('Failed to share blog:', err);
            setMessage('Failed to share blog. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Share Blog</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <p className="share-instruction">Select contacts to share this blog with:</p>

                    {loading ? (
                        <div className="loading-spinner">Loading contacts...</div>
                    ) : contacts.length === 0 ? (
                        <p className="no-contacts-msg">No contacts available. Start chatting with someone first!</p>
                    ) : (
                        <div className="contacts-grid">
                            {contacts.map(contact => (
                                <div
                                    key={contact.user._id}
                                    className={`contact-card ${selectedContacts.includes(contact.user.username) ? 'selected' : ''}`}
                                    onClick={() => toggleContact(contact.user.username)}
                                >
                                    <img
                                        src={contact.user.dp ? `/thumbnails/${contact.user.dp}` : '/thumbnails/default-user.jpg'}
                                        alt={contact.user.username}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                                    />
                                    <div className="contact-name">{contact.user.fullname || contact.user.username}</div>
                                    {selectedContacts.includes(contact.user.username) && (
                                        <div className="check-icon">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {message && <div className="share-message">{message}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={sending}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleShare}
                        disabled={sending || selectedContacts.length === 0}
                    >
                        {sending ? 'Sharing...' : `Share with ${selectedContacts.length} contact(s)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareBlogModal;
