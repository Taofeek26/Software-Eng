// src/components/Layout/Navbar.js
import React, { useContext } from 'react'; // Import useContext
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthContext'; // Adjust path
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout, loading } = useContext(AuthContext); // Use context
    const navigate = useNavigate();

    const handleLogout = async () => {
        // await authService.logout(); // Optional backend call
        logout();
        navigate('/login');
    };

    if (loading) {
         return (
            <nav className="navbar">
                <div className="navbar-brand">
                    <Link to="/">MovieApp</Link>
                </div>
                <ul className="navbar-links"><li>Loading...</li></ul>
            </nav>
         ); // Or a more sophisticated loader
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">MovieApp</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/search">Search</Link></li>
                {isAuthenticated ? (
                    <>
                        <li><Link to="/profile">{user?.username || 'Profile'}</Link></li>
                        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;