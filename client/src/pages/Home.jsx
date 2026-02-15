import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import '../pages/Profile.css'; // Import Profile CSS to reuse card styles

import { formatDistanceToNow } from 'date-fns';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('/api/posts');
                setPosts(res.data.posts);
                setTrending(res.data.sortedPosts);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="container home-container-vibrant">

            <div className="feed-section">
                <h1 className="section-title">Latest Stories</h1>
                <div className="vibrant-grid">
                    {posts.map(post => (
                        <div key={post._id} className="post-card-visual">
                            <img
                                src={`/thumbnails/${post.thumbnail}`}
                                alt={post.title}
                                className="post-card-img"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250' }}
                            />
                            <div className="post-card-body">
                                <span className="post-time author-tag">
                                    By <Link to={`/profile/${post.author}`} className="hover-underline">{post.author}</Link> • {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                                </span>
                                <h3 className="post-card-title">
                                    <Link to={`/posts/${post._id}`} className="hover-underline">{post.title}</Link>
                                </h3>
                                <p className="post-card-excerpt">
                                    {post.content.substring(0, 120)}...
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
                </div>
            </div>

            <aside className="end-sidebar">
                <div className="sidebar-card">
                    <h3>Top Trending</h3>
                    <ul className="trending-list-vibrant">
                        {trending.slice(0, 5).map((post, index) => (
                            <li key={post._id} className="trending-item-vibrant">
                                <span className="trend-number">#{index + 1}</span>
                                <div className="trend-info">
                                    <Link to={`/posts/${post._id}`} className="hover-underline">{post.title}</Link>
                                    <span className="trend-likes">{post.like} Likes</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default Home;
