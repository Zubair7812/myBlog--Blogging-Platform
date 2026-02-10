import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">MyBlog</Link>
                <ul className="nav-links">
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/search">Search</Link></li>
                    {user ? (
                        <>
                            <li><Link to="/notifications">Notifications</Link></li>
                            <li><Link to="/chat">Chat</Link></li>
                            <li><Link to="/compose" className="btn btn-primary">Compose</Link></li>
                            <li>
                                <Link to={`/profile/${user.username}`} className="nav-profile-link">
                                    <img
                                        src={user.dp ? `/thumbnails/${user.dp}` : '/thumbnails/default-user.jpg'}
                                        alt={user.username}
                                        className="nav-profile-img"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                                    />
                                </Link>
                            </li>
                            <li><button onClick={handleLogout} className="btn btn-logout">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register" className="btn btn-primary">Register</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
