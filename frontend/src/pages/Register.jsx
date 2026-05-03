import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    // Override parent content-container styles for full-page layout
    useEffect(() => {
        const contentContainer = document.querySelector('.content-container');
        if (contentContainer) {
            contentContainer.style.maxWidth = '100%';
            contentContainer.style.padding = '0';
            contentContainer.style.width = '100%';
            contentContainer.style.overflow = 'hidden';
        }
        return () => {
            if (contentContainer) {
                contentContainer.style.maxWidth = '';
                contentContainer.style.padding = '';
                contentContainer.style.width = '';
                contentContainer.style.overflow = '';
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signup(username, fullname, email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username (Handle)</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. johndoe123"
                        />
                    </div>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Register</button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
