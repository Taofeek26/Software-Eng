// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUserProfile } from '../Services/apiService'; // To fetch user data if token exists

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // To handle initial auth check

    const storeUserData = (userToken, userData) => {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user object
        setToken(userToken);
        setUser(userData);
    };

    const login = (userToken, userData) => {
        storeUserData(userToken, userData);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        // Optionally call backend logout: await apiService.logout();
    }, []);

    useEffect(() => {
        const verifyUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // If user object isn't stored but token exists, try to fetch user profile
                    try {
                        const response = await getCurrentUserProfile(); // Assumes apiService handles token
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    } catch (error) {
                        console.error("Failed to fetch user with stored token", error);
                        logout(); // Token might be invalid or expired
                    }
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, [logout]);


    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};