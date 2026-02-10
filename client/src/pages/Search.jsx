import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const initialFilter = searchParams.get('filter') || 'all';

    const [filter, setFilter] = useState(initialFilter);
    const [results, setResults] = useState({ posts: [], users: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await axios.get(`/api/search?q=${query}&filter=${filter}`);
                setResults({
                    posts: res.data.posts || [],
                    users: res.data.users || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setSearchParams({ q: query, filter: newFilter });
    };

    return (
        <div className="container search-container">
            <h1 className="search-title">Search Results for "{query}"</h1>

            <div className="search-tabs">
                <button
                    className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                >
                    All
                </button>
                <button
                    className={`tab-btn ${filter === 'posts' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('posts')}
                >
                    Posts
                </button>
                <button
                    className={`tab-btn ${filter === 'people' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('people')}
                >
                    People
                </button>
            </div>

            {loading ? (
                <div className="loading">Searching...</div>
            ) : (
                <div className="search-results">
                    {(filter === 'all' || filter === 'people') && results.users.length > 0 && (
                        <div className="results-section">
                            <h2>People</h2>
                            <div className="users-grid">
                                {results.users.map(user => (
                                    <div key={user._id} className="user-card-search">
                                        <img
                                            src={user.dp ? `/thumbnails/${user.dp}` : '/thumbnails/default-user.jpg'}
                                            alt={user.username}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                                        />
                                        <div className="user-info">
                                            <Link to={`/profile/${user.username}`}><h3>{user.fullname}</h3></Link>
                                            <p>@{user.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(filter === 'all' || filter === 'posts') && results.posts.length > 0 && (
                        <div className="results-section">
                            <h2>Posts</h2>
                            <div className="posts-list">
                                {results.posts.map(post => (
                                    <div key={post._id} className="post-item-search">
                                        <Link to={`/posts/${post._id}`}><h3>{post.title}</h3></Link>
                                        <p>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                                        <small>By {post.author}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.posts.length === 0 && results.users.length === 0 && (
                        <p className="no-results">No results found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
