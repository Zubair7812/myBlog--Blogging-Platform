import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from '../components/EmptyState';
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
    }, [fetchUnreadCounts]);

    const groupNotifications = (notifs) => {
        const grouped = [];
        notifs.forEach((notif) => {
            const last = grouped[grouped.length - 1];
            if (
                last &&
                last.type === notif.type &&
                last.postId?._id === notif.postId?._id &&
                notif.type !== 'follow' // Don't group follows usually, or maybe do? Let's group likes/comments primarily.
            ) {
                last.users.push(notif.sender);
                last.read = last.read && notif.read; // If any is unread, group is unread? Or strict? Let's say group is unread if any is unread.
                // actually if I want to show "Unread" highlighting, if the latest is unread, it triggers.
                if (!notif.read) last.read = false;
            } else {
                grouped.push({
                    ...notif,
                    users: [notif.sender]
                });
            }
        });
        return grouped;
    };

    const groupedNotifications = groupNotifications(notifications);

    const renderMessage = (group) => {
        const uniqueUsers = [...new Map(group.users.map(u => [u.username, u])).values()];
        const count = uniqueUsers.length;
        const u1 = uniqueUsers[0];
        const u2 = uniqueUsers[1];

        let userText;
        if (count === 1) {
            userText = <Link to={`/profile/${u1.username}`}><strong>{u1.username}</strong></Link>;
        } else if (count === 2) {
            userText = (
                <>
                    <Link to={`/profile/${u1.username}`}><strong>{u1.username}</strong></Link> and <Link to={`/profile/${u2.username}`}><strong>{u2.username}</strong></Link>
                </>
            );
        } else {
            userText = (
                <>
                    <Link to={`/profile/${u1.username}`}><strong>{u1.username}</strong></Link>, <Link to={`/profile/${u2.username}`}><strong>{u2.username}</strong></Link> and {count - 2} others
                </>
            );
        }

        if (group.type === 'like') {
            return <>{userText} liked your post </>;
        } else if (group.type === 'comment') {
            return <>{userText} commented on your post </>;
        } else if (group.type === 'follow') {
            return <>{userText} started following you</>;
        }
    };

    if (loading) return <div className="loading">Loading notifications...</div>;

    return (
        <div className="container notifications-container">
            <h1>Notifications</h1>

            <div className="notifications-list">
                {groupedNotifications.length > 0 ? groupedNotifications.map((group, index) => (
                    <div key={index} className={`notification-item ${!group.read ? 'unread' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="notif-icon-wrapper">
                            {group.type === 'like' && <i className="fas fa-heart notif-icon like-icon"></i>}
                            {group.type === 'comment' && <i className="fas fa-comment notif-icon comment-icon"></i>}
                            {group.type === 'follow' && <i className="fas fa-user-plus notif-icon follow-icon"></i>}
                        </div>

                        <div className="notif-content">
                            <p>
                                {renderMessage(group)}
                                {group.postId && (
                                    <>
                                        {' '}
                                        <Link to={`/posts/${group.postId._id || group.postId}`} className="notif-post-link">
                                            "{group.postId.title || 'Post'}"
                                        </Link>
                                    </>
                                )}
                            </p>
                            <span className="time">{formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                )) : (
                    <EmptyState
                        icon="fa-bell"
                        message="No notifications yet."
                        action={<Link to="/" className="btn btn-primary">Explorer Stories</Link>}
                    />
                )}
            </div>
        </div>
    );
};

export default Notifications;
