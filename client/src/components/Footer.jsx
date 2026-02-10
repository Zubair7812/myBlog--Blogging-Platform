import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} MyBlog Platform</p>
        </footer>
    );
};

export default Footer;
