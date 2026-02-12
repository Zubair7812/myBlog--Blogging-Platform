import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';
import EditPost from './pages/EditPost';
import EditProfile from './pages/EditProfile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

import { StrictMode } from 'react';

function App() {
  return (
    <Router>
      <StrictMode>
        <ThemeProvider>
          <AuthProvider>
            <MainRoutes />
          </AuthProvider>
        </ThemeProvider>
      </StrictMode>
    </Router>
  );
}

const MainRoutes = () => {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.startsWith('/chat') ? 'chat' : location.pathname}>
          <Route path="/login" element={<PageTransition><Navbar /><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Navbar /><Register /></PageTransition>} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Home /></div></PageTransition></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Search /></div></PageTransition></PrivateRoute>} />
          <Route path="/compose" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><CreatePost /></div></PageTransition></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><EditPost /></div></PageTransition></PrivateRoute>} />
          <Route path="/posts/:id" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><PostDetail /></div></PageTransition></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Profile /></div></PageTransition></PrivateRoute>} />
          <Route path="/editprofile/:username" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><EditProfile /></div></PageTransition></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Notifications /></div></PageTransition></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Chat /></div></PageTransition></PrivateRoute>} />
          <Route path="/chat/:username" element={<PrivateRoute><PageTransition><Navbar /><div className="content-container"><Chat /></div></PageTransition></PrivateRoute>} />
          <Route path="/admin" element={<PageTransition><Navbar /><div className="content-container"><Admin /></div></PageTransition>} />
          <Route path="*" element={<PageTransition><Navbar /><div className="content-container"><NotFound /></div></PageTransition>} />
        </Routes>
      </AnimatePresence>

    </div>
  );
};

export default App;
