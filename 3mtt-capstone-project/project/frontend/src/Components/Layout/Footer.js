// src/components/Layout/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} MovieApp. All rights reserved.</p>
            <p>Data provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDb</a>.</p>
        </footer>
    );
};

export default Footer;