import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './Profile.css';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    // Override parent content-container so the sidebar touches the left viewport edge
    useEffect(() => {
        const contentContainer = document.querySelector('.content-container');
        if (contentContainer) {
            contentContainer.style.maxWidth = '100%';
            contentContainer.style.paddingLeft = '0';
            contentContainer.style.paddingTop = '0';
            contentContainer.style.paddingBottom = '0';
        }
        return () => {
            if (contentContainer) {
                contentContainer.style.maxWidth = '';
                contentContainer.style.paddingLeft = '';
                contentContainer.style.paddingTop = '';
                contentContainer.style.paddingBottom = '';
            }
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/profile/${username}`);
                setProfileData(res.data.userdata);
                setPosts(res.data.posts);
                setFollowersCount(res.data.userdata.followers.length);

                if (currentUser && res.data.userdata.followers.includes(currentUser._id)) {
                    setIsFollowing(true);
                } else {
                    setIsFollowing(false);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, currentUser]);

    const handleFollow = async () => {
        if (!currentUser) return;
        try {
            if (isFollowing) {
                await axios.post(`/api/unfollow/${profileData._id}`);
                setFollowersCount(prev => prev - 1);
                setIsFollowing(false);
            } else {
                await axios.post(`/api/follow/${profileData._id}`);
                setFollowersCount(prev => prev + 1);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!profileData) return <div className="container">User not found</div>;

    const isOwner = currentUser && currentUser.username === profileData.username;

    return (
        <div className="profile-container-layout">
            {/* Sidebar Section */}
            <aside className="profile-sidebar">
                <div className="sidebar-content">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={profileData.dp ? `/thumbnails/${profileData.dp}` : '/thumbnails/default-user.jpg'}
                            alt={profileData.username}
                            className="profile-avatar-large"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                        />
                    </div>

                    <h2 className="profile-name">{profileData.fullname || profileData.name}</h2>
                    <p className="profile-username" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>@{profileData.username}</p>
                    <p className="profile-welcome">{profileData.bio || "Welcome to my profile!!!"}</p>

                    <div className="profile-stats-box">
                        <div className="stat">
                            <span className="stat-label">Posts</span>
                            <span className="stat-value">{posts.length}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Followers</span>
                            <span className="stat-value">{followersCount}</span>
                        </div>
                    </div>

                    <div className="contact-section">
                        <h3>CONTACTS</h3>
                        <div className="contact-info">
                            <p><i className="fas fa-envelope"></i> {profileData.email}</p>
                        </div>

                        <div className="social-links-sidebar">
                            <a href={profileData.facebook || '#'} className="social-icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href={profileData.twitter || '#'} className="social-icon"><i className="fa-brands fa-x-twitter"></i></a>
                            <a href={profileData.instagram || '#'} className="social-icon"><i className="fa-brands fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className="profile-actions-sidebar">
                        {isOwner ? (
                            <Link to={`/editprofile/${username}`} className="btn btn-edit-profile">
                                <i className="fas fa-pen"></i> Edit Profile
                            </Link>
                        ) : (
                            currentUser && (
                                <button
                                    onClick={handleFollow}
                                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-edit-profile'}`}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content (Posts Grid) */}
            <main className="profile-main-content">
                <div className="profile-posts-grid">
                    {posts.map(post => (
                        <div key={post._id} className="post-card-visual">
                            <img
                                src={`/thumbnails/${post.thumbnail}`}
                                alt={post.title}
                                className="post-card-img"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250' }}
                            />
                            <div className="post-card-body">
                                <span className="post-time">{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</span>
                                <h3 className="post-card-title">
                                    <Link to={`/posts/${post._id}`} className="hover-underline">{post.title}</Link>
                                </h3>
                                <p className="post-card-excerpt">
                                    {post.content.substring(0, 100)}...
                                </p>
                                <div className="post-card-footer">
                                    <span className="post-likes">
                                        <i className="fas fa-heart"></i> {post.like}
                                    </span>
                                    <Link to={`/posts/${post._id}`} className="btn btn-readmore">Read More</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="no-posts">
                            <p>No stories yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
