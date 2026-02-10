import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1 style={{ fontSize: '4rem', color: '#dc3545' }}>404</h1>
            <h2>Page Not Found</h2>
            <p style={{ margin: '1rem 0' }}>The page you are looking for does not exist.</p>
            <Link to="/home" className="btn btn-primary">Go Home</Link>
        </div>
    );
};

export default NotFound;
