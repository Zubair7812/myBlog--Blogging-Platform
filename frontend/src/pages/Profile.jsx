import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './Profile.css';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import LazyImage from '../components/LazyImage';


const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    // Override parent content-container...
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

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
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

    // Fetch Saved Posts when tab changes to 'saved'


    const handleFollow = async () => {
        if (!currentUser) return;

        // Optimistic Update
        const previousIsFollowing = isFollowing;
        const previousFollowersCount = followersCount;

        setIsFollowing(prev => !prev);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            if (previousIsFollowing) {
                await axios.post(`/api/unfollow/${profileData._id}`);
            } else {
                await axios.post(`/api/follow/${profileData._id}`);
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setIsFollowing(previousIsFollowing);
            setFollowersCount(previousFollowersCount);
        }
    };

    if (loading) {
        return (
            <div className="container fade-in" style={{ marginTop: '2rem' }}>
                <SkeletonLoader type="text" count={1} /> {/* Profile Header Skeleton */}
                <div style={{ marginTop: '2rem' }}>
                    <SkeletonLoader type="card" count={3} />
                </div>
            </div>
        );
    }

    if (!profileData) return <div className="container">User not found</div>;

    const isOwner = currentUser && currentUser.username === profileData.username;

    return (
        <div className="profile-container-layout fade-in">
            {/* Sidebar Section */}
            <aside className="profile-sidebar">
                <div className="sidebar-content">
                    <div className="profile-avatar-wrapper">
                        <LazyImage
                            src={profileData.dp ? `/thumbnails/${profileData.dp}` : '/thumbnails/default-user.jpg'}
                            alt={profileData.username}
                            className="profile-avatar-large"
                            aspectRatio="1/1"
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
                    {posts.length > 0 ? posts.map(post => (
                        <div key={post._id} className="post-card-visual">
                            {/* Re-adding visual flair */}
                            <LazyImage
                                src={post.thumbnail ? `/thumbnails/${post.thumbnail}` : '/thumbnails/default.jpg'}
                                alt={post.title}
                                className="post-card-img"
                                aspectRatio="16/9"
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
                    )) : (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <EmptyState
                                icon="fa-folder-open"
                                message={`No stories from @${profileData?.username || 'user'} yet.`}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
