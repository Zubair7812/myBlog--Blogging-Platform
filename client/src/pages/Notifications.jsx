import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Notifications.css';

const Notifications = () => {
    const { fetchUnreadCounts } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/api/notifications');
                setNotifications(res.data.notifications);
                fetchUnreadCounts(); // Update global unread count immediately
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return <div className="loading">Loading notifications...</div>;

    return (
        <div className="container notifications-container">
            <h1>Notifications</h1>

            <div className="notifications-list">
                {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif._id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                        <img
                            src={notif.sender.dp ? `/thumbnails/${notif.sender.dp}` : '/thumbnails/default-user.jpg'}
                            alt={notif.sender.username}
                            className="notif-user-img"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                        />
                        <div className="notif-content">
                            <p>
                                <Link to={`/profile/${notif.sender.username}`}><strong>{notif.sender.username}</strong></Link>
                                {' '}
                                {notif.type === 'like' && `liked your post `}
                                {notif.type === 'comment' && `commented on your post `}
                                {notif.type === 'follow' && `started following you`}
                                {' '}
                                {notif.postId && (
                                    <Link to={`/posts/${notif.postId._id || notif.postId}`}>
                                        "{notif.postId.title || 'Post'}"
                                    </Link>
                                )}
                            </p>
                            <span className="time">{new Date(notif.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                )) : (
                    <p className="no-notifs">No notifications yet.</p>
                )}
            </div>
        </div>
    );
};

export default Notifications;
