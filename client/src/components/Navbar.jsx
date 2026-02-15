import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, unreadChats, unreadNotifs } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    <img src="/logo.svg" alt="MyBlog Logo" className="logo-img" />
                </Link>
                <ul className="nav-links">
                    {!isAuthPage && (
                        <>
                            <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link></li>
                            <li><Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>Search</Link></li>
                        </>
                    )}

                    {user ? (
                        <>
                            <li>
                                <Link to="/notifications" className={`nav-link-item ${location.pathname === '/notifications' ? 'active' : ''}`}>
                                    Notifications
                                    {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/chat" className={`nav-link-item ${location.pathname.startsWith('/chat') ? 'active' : ''}`}>
                                    Chat
                                    {unreadChats > 0 && <span className="nav-badge">{unreadChats}</span>}
                                </Link>
                            </li>
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
                            <li><ThemeToggle /></li>
                            <li><button onClick={handleLogout} className="btn btn-logout">Logout</button></li>
                        </>
                    ) : (
                        <>
                            {!isAuthPage && (
                                <>
                                    <li><Link to="/login">Login</Link></li>
                                    <li><Link to="/register" className="btn btn-primary">Register</Link></li>
                                </>
                            )}
                            <li><ThemeToggle /></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
