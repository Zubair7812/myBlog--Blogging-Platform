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
        try {
            const res = await axios.get('/api/check-auth');
            if (res.data.isAuthenticated) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post('/api/login', { email, password });
        setUser(res.data.user);
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await axios.post('/api/signup', { name, email, password });
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        await axios.post('/api/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
