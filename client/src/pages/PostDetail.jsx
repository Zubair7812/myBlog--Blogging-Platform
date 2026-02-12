import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ShareBlogModal from '../components/ShareBlogModal';
import './PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/api/posts/${id}`);
                setPost(res.data.post);
                setComments(res.data.comments);
                setAuthor(res.data.authorUser);
                setLikes(res.data.post.like);
                if (user && res.data.post.likedby.includes(user.username)) {
                    setIsLiked(true);
                }
            } catch (err) {
                console.error(err);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, user, navigate]);

    const handleLike = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await axios.post(`/api/posts/${id}/like`);
            setLikes(res.data.likes);
            setIsLiked(res.data.status === 'liked');
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`/api/posts/${id}/comment`, { comment: commentText });
            setComments([res.data.comment, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`/api/delete/${id}`);
            navigate('/home');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!post) return <div>Post not found</div>;

    const isOwner = user && (user.username === post.author || user.type === 'admin');
    const blogUrl = `${window.location.origin}/posts/${id}`;

    return (
        <div className="container post-detail-container">
            <div className="post-header">
                <h1>{post.title}</h1>
                <div className="post-meta-row">
                    <span className="meta-author">
                        By <Link to={`/profile/${post.author}`}>{post.author}</Link>
                    </span>
                    <span className="meta-date">{new Date(post.date).toLocaleDateString()}</span>
                </div>

                <div className="post-interaction-bar">
                    {!isOwner && user && (
                        <div className="user-actions">
                            <Link to={`/chat/${post.author}`} className="btn btn-primary btn-sm">
                                <i className="fas fa-comment"></i> Chat with Author
                            </Link>
                            <button onClick={() => setShowShareModal(true)} className="btn btn-secondary btn-sm">
                                <i className="fas fa-share"></i> Share Blog
                            </button>
                        </div>
                    )}

                    {isOwner && (
                        <div className="owner-actions">
                            <Link to={`/edit/${id}`} className="btn btn-secondary btn-sm">Edit</Link>
                            <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
                            <button onClick={() => setShowShareModal(true)} className="btn btn-primary btn-sm">
                                <i className="fas fa-share"></i> Share Blog
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="post-image-large">
                <img
                    src={post.thumbnail ? `/thumbnails/${post.thumbnail}` : '/thumbnails/default.jpg'}
                    alt={post.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image' }}
                />
            </div>

            <div className="post-body">
                <p>{post.content}</p>
            </div>

            <div className="interaction-section">
                <button
                    className={`btn-like ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    ♥ {likes} Likes
                </button>
            </div>

            <div className="comments-section">
                <h3>Comments ({comments.length})</h3>
                {user && (
                    <form onSubmit={handleComment} className="comment-form">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            rows="3"
                        ></textarea>
                        <button type="submit" className="btn btn-primary">Post Comment</button>
                    </form>
                )}

                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                            <strong>{comment.username}</strong>
                            <p>{comment.content}</p>
                            <small>{new Date(comment.date).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            </div>

            <ShareBlogModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                blogTitle={post.title}
                blogUrl={blogUrl}
            />
        </div>
    );
};

export default PostDetail;
