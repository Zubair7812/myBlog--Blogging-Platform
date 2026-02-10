import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainRoutes />
      </AuthProvider>
    </Router>
  );
}

const MainRoutes = () => {
  const { loading } = useAuth();

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
      <Navbar />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/compose" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/editprofile/:username" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/chat/:username" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
