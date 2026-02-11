// Add this temporarily to debug
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.get('/api/auth/me');
                console.log("AUTH CHECK - User data from /api/auth/me:", res.data); // DEBUG
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
    };

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        console.log("LOGIN - User data from /api/auth/login:", res.data); // DEBUG
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await axios.post('/api/auth/register', { name, email, password });
        console.log("SIGNUP - User data from /api/auth/register:", res.data); // DEBUG
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    console.log("CURRENT USER STATE:", user); // DEBUG

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
