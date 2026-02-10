import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            await axios.post('/api/compose', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/home');
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
            <h1>Create New Post</h1>
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
                    <label>Thumbnail Image</label>
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
                    {loading ? 'Publishing...' : 'Publish Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;
