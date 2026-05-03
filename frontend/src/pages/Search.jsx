import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './Search.css';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialFilter = searchParams.get('filter') || 'all';

    const [query, setQuery] = useState(initialQuery);
    const [filter, setFilter] = useState(initialFilter);
    const [results, setResults] = useState({ posts: [], users: [] });
    const [loading, setLoading] = useState(false);

    const fetchResults = useCallback(async () => {
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
    }, [query, filter]);

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
    }, [query, filter, fetchResults, setSearchParams]);

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

            {loading && (
                <div style={{ marginTop: '2rem' }}>
                    <SkeletonLoader type="text" count={1} />
                    <SkeletonLoader type="card" count={2} />
                </div>
            )}

            {!loading && (
                <div className="search-results fade-in">
                    {(filter === 'all' || filter === 'people') && results.users.length > 0 && (
                        <div className="results-section">
                            <h2>People</h2>
                            <div className="users-grid">
                                {results.users.map(user => (
                                    <Link to={`/profile/${user.username}`} key={user._id} className="user-card-search">
                                        <LazyImage
                                            src={user.dp ? `/thumbnails/${user.dp}` : '/thumbnails/default-user.jpg'}
                                            alt={user.username}
                                            className="user-dp-search"
                                            aspectRatio="1"
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
                        <EmptyState
                            icon="fa-search"
                            message={`No results found for "${query}"`}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
