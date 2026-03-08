import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css'; // Reuse CSS

const EditPost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/api/posts/${id}`);
                const post = res.data.post;
                setTitle(post.title);
                setContent(post.content);
                setTags(post.tags || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch post details');
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('postTitle', title);
        formData.append('postBody', content);
        formData.append('tags', JSON.stringify(tags));
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.post(`/api/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate(`/posts/${id}`);
        } catch (err) {
            setError('Failed to update post. Please try again.');
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="create-post-container">
            <h1>Edit Post</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title"
                    />
                </div>
                <div className="form-group">
                    <label>Thumbnail Image (Leave empty to keep current)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <div className="form-group">
                    <label>Tags (Press Enter to add)</label>
                    <div className="tag-input-container">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag-pill" onClick={() => setTags(tags.filter((_, i) => i !== index))}>
                                #{tag} <i className="fas fa-times"></i>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="tag-input"
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = currentTag.trim();
                                    if (val && !tags.includes(val)) {
                                        setTags([...tags, val]);
                                        setCurrentTag('');
                                    }
                                } else if (e.key === 'Backspace' && !currentTag && tags.length > 0) {
                                    setTags(tags.slice(0, -1));
                                }
                            }}
                            placeholder={tags.length === 0 ? "e.g. technology, life, travel" : ""}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="10"
                        placeholder="Write your post content here..."
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Post'}
                </button>
            </form>
        </div>
    );
};

export default EditPost;
