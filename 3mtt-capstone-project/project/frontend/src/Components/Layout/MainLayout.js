// src/components/Layout/MainLayout.js
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;