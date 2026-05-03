import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadChats, setUnreadChats] = useState(0);
    const [unreadNotifs, setUnreadNotifs] = useState(0);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.get('/api/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const fetchUnreadCounts = useCallback(async () => {
        if (!user) return;
        try {
            const chatRes = await axios.get('/api/chat/unread-count');
            const notifRes = await axios.get('/api/notifications/unread');
            setUnreadChats(chatRes.data.count || 0);
            setUnreadNotifs(notifRes.data.count || 0);
        } catch (err) {
            console.error("Failed to fetch unread counts", err);
        }
    }, [user]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (user) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 5000);
            return () => clearInterval(interval);
        } else {
            setUnreadChats(0);
            setUnreadNotifs(0);
        }
    }, [user, fetchUnreadCounts]);

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return res.data;
    };

    const signup = async (username, fullname, email, password) => {
        const res = await axios.post('/api/auth/register', { username, fullname, email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setUnreadChats(0);
        setUnreadNotifs(0);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            checkAuth,
            unreadChats,
            unreadNotifs,
            fetchUnreadCounts,
            updateUser: setUser // Expose state setter for partial updates
        }}>
            {children}
        </AuthContext.Provider>
    );
};
