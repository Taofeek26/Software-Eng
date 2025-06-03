// src/components/Auth/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div>Loading authentication status...</div>; // Or a spinner
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to so we can send them along after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />; // Render children or Outlet for nested routes
};

export default ProtectedRoute;