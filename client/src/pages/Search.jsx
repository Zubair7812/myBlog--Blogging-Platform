import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialFilter = searchParams.get('filter') || 'all';

    const [query, setQuery] = useState(initialQuery);
    const [filter, setFilter] = useState(initialFilter);
    const [results, setResults] = useState({ posts: [], users: [] });
    const [loading, setLoading] = useState(false);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query) {
                fetchResults();
                setSearchParams({ q: query, filter });
            } else {
                setResults({ posts: [], users: [] });
                setSearchParams({});
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query, filter]);

    const fetchResults = async () => {
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

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    // Helper to highlight text
    const HighlightText = ({ text, highlight }) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);

        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <span key={i} className="highlight">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <div className="container search-container">
            <div className="search-header">
                <h1>Search</h1>
                <div className="search-bar-wrapper">
                    <div className="search-input-group">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search posts, people, tags..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            </div>

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

            {loading && <div className="loading" style={{ textAlign: 'center', margin: '2rem' }}>Searching...</div>}

            {!loading && (
                <div className="search-results">
                    {(filter === 'all' || filter === 'people') && results.users.length > 0 && (
                        <div className="results-section">
                            <h2>People</h2>
                            <div className="users-grid">
                                {results.users.map(user => (
                                    <Link to={`/profile/${user.username}`} key={user._id} className="user-card-search">
                                        <img
                                            src={user.dp ? `/thumbnails/${user.dp}` : '/thumbnails/default-user.jpg'}
                                            alt={user.username}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60' }}
                                        />
                                        <div className="user-info">
                                            <h3><HighlightText text={user.fullname} highlight={query} /></h3>
                                            <p>@<HighlightText text={user.username} highlight={query} /></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {(filter === 'all' || filter === 'posts') && results.posts.length > 0 && (
                        <div className="results-section">
                            <h2>Posts</h2>
                            <div className="posts-list">
                                {results.posts.map(post => {
                                    // Construct plain text excerpt for searching/highlighting
                                    const plainContent = post.content.replace(/<[^>]*>?/gm, '');
                                    const excerpt = plainContent.substring(0, 150) + '...';

                                    return (
                                        <Link
                                            to={`/posts/${post._id}`}
                                            key={post._id}
                                            className="post-item-search"
                                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                        >
                                            <h3>
                                                <HighlightText text={post.title} highlight={query} />
                                            </h3>
                                            <p className="post-excerpt">
                                                <HighlightText text={excerpt} highlight={query} />
                                            </p>
                                            <div className="post-meta">
                                                By {post.author} • {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!loading && query && results.posts.length === 0 && results.users.length === 0 && (
                        <p className="no-results">No results found for "{query}"</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
