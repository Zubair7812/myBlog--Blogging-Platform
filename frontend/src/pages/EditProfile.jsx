import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AutoResizeTextarea from '../components/AutoResizeTextarea';
import './CreatePost.css'; // Reuse form styles

const EditProfile = () => {
    const { username } = useParams();
    const { user, loading: authLoading, updateUser } = useAuth();
    const navigate = useNavigate();

    const [fullname, setFullname] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [bio, setBio] = useState('');
    const [fb, setFb] = useState('');
    const [tw, setTw] = useState('');
    const [insta, setInsta] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (user.username !== username) {
            navigate(`/profile/${username}`); // Redirect if not owner
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/profile/${username}`);
                const data = res.data.userdata;
                setFullname(data.fullname || data.name || '');
                setUsernameInput(data.username || '');
                setBio(data.bio || '');
                setFb(data.facebook || '');
                setTw(data.twitter || '');
                setInsta(data.instagram || '');
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch profile');
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('username', usernameInput);
        formData.append('bio', bio);
        formData.append('fb', fb);
        formData.append('tw', tw);
        formData.append('insta', insta);
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await axios.post(`/api/editprofile/${username}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Dynamically update the global user state so the Navbar photo updates instantly
            if (res.data.user) {
                updateUser(res.data.user);
            }

            // If username changed, redirect to new profile
            if (res.data.user && res.data.user.username !== username) {
                navigate(`/profile/${res.data.user.username}`);
                // Force reload to update auth context or manual update might be needed
                window.location.reload();
            } else {
                navigate(`/profile/${username}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to update profile');
            setLoading(false);
        }
    };

    if (loading || authLoading) return <div className="loading">Loading...</div>;

    return (
        <div className="create-post-container" style={{ maxWidth: '600px' }}>
            <h1>Edit Public Profile</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Profile Picture</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <AutoResizeTextarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        minRows={4}
                        placeholder="Tell the world about yourself..."
                    />
                </div>

                <h3 style={{ margin: '1.5rem 0 1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Social Links</h3>

                <div className="form-group">
                    <label>Facebook URL</label>
                    <input
                        type="text"
                        value={fb}
                        onChange={(e) => setFb(e.target.value)}
                        placeholder="https://facebook.com/username"
                    />
                </div>
                <div className="form-group">
                    <label>Twitter URL</label>
                    <input
                        type="text"
                        value={tw}
                        onChange={(e) => setTw(e.target.value)}
                        placeholder="https://twitter.com/username"
                    />
                </div>
                <div className="form-group">
                    <label>Instagram URL</label>
                    <input
                        type="text"
                        value={insta}
                        onChange={(e) => setInsta(e.target.value)}
                        placeholder="https://instagram.com/username"
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
