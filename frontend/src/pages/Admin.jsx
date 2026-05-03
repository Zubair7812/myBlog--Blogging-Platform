import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ profiles: [], posts: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.type !== 'admin') {
                navigate('/');
                return;
            }
            fetchAdminData();
        }
    }, [user, authLoading, navigate]);

    const fetchAdminData = async () => {
        try {
            const res = await axios.get('/api/admin');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this user? This will delete all their posts.')) return;
        try {
            await axios.delete(`/api/removeuser/${userId}`);
            setStats(prev => ({
                ...prev,
                profiles: prev.profiles.filter(p => p._id !== userId)
            }));
        } catch (err) {
            console.error(err);
            alert('Failed to remove user');
        }
    };

    if (loading || authLoading) return <div className="loading">Loading Admin Dashboard...</div>;

    return (
        <div className="container admin-container">
            <h1>Admin Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <h2>Total Users</h2>
                    <p>{stats.profiles.length}</p>
                </div>
                <div className="stat-card secondary">
                    <h2>Total Stories</h2>
                    <p>{stats.posts.length}</p>
                </div>
            </div>

            <h2>Manage Users</h2>
            <div className="users-grid-admin">
                {stats.profiles.map(profile => (
                    <div key={profile._id} className="user-card-admin">
                        <img
                            src={profile.dp ? `/thumbnails/${profile.dp}` : '/thumbnails/default-user.jpg'}
                            alt={profile.username}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80' }}
                        />
                        <h3>@{profile.username}</h3>
                        <p>{profile.email}</p>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveUser(profile._id)}
                        >
                            Remove User
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
