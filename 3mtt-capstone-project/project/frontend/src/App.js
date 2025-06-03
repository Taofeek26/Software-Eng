// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './Components/Layout/MainLayout';
import HomePage from './Pages/HomePage';
import MovieDetailPage from './Pages/MovieDetailPage';
import SearchPage from './Pages/SearchPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import ProtectedRoute from './Components/Auth/ProtectedRoute'; // Import

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:tmdbId" element={<MovieDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}> {/* Wrapper for multiple protected routes */}
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add other protected routes here e.g. /favorites, /watchlists/:id */}
        </Route>

        <Route path="*" element={<div><h2>404 Not Found</h2></div>} />
      </Routes>
    </MainLayout>
  );
}

export default App;