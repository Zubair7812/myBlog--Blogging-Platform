import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, unreadChats, unreadNotifs } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setIsMenuOpen(false);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const handleLogoClick = (e) => {
        closeMenu();
        if (location.pathname === '/' || location.pathname === '/home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo" onClick={handleLogoClick}>
                    <img src="/logo.svg" alt="MyBlog Logo" className="logo-img" />
                </Link>
                
                <div className="nav-right">
                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                        {!isAuthPage && (
                            <>
                                <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''} onClick={closeMenu}>Home</Link></li>
                                <li><Link to="/search" className={location.pathname === '/search' ? 'active' : ''} onClick={closeMenu}>Search</Link></li>
                            </>
                        )}

                        {user && !isAuthPage ? (
                            <>
                                <li>
                                    <Link to="/notifications" className={`nav-link-item ${location.pathname === '/notifications' ? 'active' : ''}`} onClick={closeMenu}>
                                        Notifications
                                        {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chat" className={`nav-link-item ${location.pathname.startsWith('/chat') ? 'active' : ''}`} onClick={closeMenu}>
                                        Chat
                                        {unreadChats > 0 && <span className="nav-badge">{unreadChats}</span>}
                                    </Link>
                                </li>
                                <li><Link to="/compose" className={`btn btn-primary ${location.pathname === '/compose' ? 'active-btn' : ''}`} onClick={closeMenu}>Compose</Link></li>
                                <li className="mobile-only-item"><button onClick={handleLogout} className="btn btn-logout">Logout</button></li>
                            </>
                        ) : (
                            <>
                                {!isAuthPage && (
                                    <>
                                        <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
                                        <li><Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register</Link></li>
                                    </>
                                )}
                            </>
                        )}
                    </ul>

                    <div className="nav-controls">
                        <ThemeToggle />
                        
                        {user && !isAuthPage && (
                            <>
                                <Link to={`/profile/${user.username}`} className="nav-profile-link" onClick={closeMenu}>
                                    <img
                                        src={user.dp ? `/thumbnails/${user.dp}` : '/thumbnails/default-user.jpg'}
                                        alt={user.username}
                                        className="nav-profile-img"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                                    />
                                </Link>
                                <button onClick={handleLogout} className="btn btn-logout desktop-only-btn">Logout</button>
                            </>
                        )}

                        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
