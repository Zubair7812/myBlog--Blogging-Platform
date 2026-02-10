import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css'; // Reuse CSS

const EditPost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
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
