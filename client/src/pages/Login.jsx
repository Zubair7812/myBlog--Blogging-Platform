import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
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
            // Save original styles if needed, but for now just overriding and clearing on unmount is enough 
            // since we clear them to empty string
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
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
