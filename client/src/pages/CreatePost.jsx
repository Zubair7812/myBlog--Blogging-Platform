import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AutoResizeTextarea from '../components/AutoResizeTextarea';
import EmojiPickerButton from '../components/EmojiPickerButton';
import './CreatePost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
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
        formData.append('tags', JSON.stringify(tags));
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
                    <div className="textarea-wrapper">
                        <AutoResizeTextarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            minRows={10}
                            placeholder="Write your post content here..."
                        />
                        <div className="emoji-btn-pos">
                            <EmojiPickerButton onEmojiClick={(emoji) => setContent(prev => prev + emoji)} />
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;
