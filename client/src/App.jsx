import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute, { AdminRoute } from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import BookingPage from './pages/BookingPage';
import TheatresPage from './pages/TheatresPage';
import OffersPage from './pages/OffersPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function NotFound() {
  return (
    <div className="min-h-screen pt-32 text-center text-white px-4">
      <h1 className="text-6xl font-black font-display gradient-text mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-6">Page not found in this cinema hall!</p>
      <a href="/" className="px-6 py-3 rounded-xl btn-primary text-white font-medium inline-block">
        Return Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#12121A',
                color: '#fff',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              },
            }}
          />
          <Routes>
            {/* Standalone auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main application layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="movies/:id" element={<MovieDetailsPage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="booking/:movieId" element={<BookingPage />} />
              <Route path="theatres" element={<TheatresPage />} />
              <Route path="offers" element={<OffersPage />} />

              {/* Protected user routes */}
              <Route
                path="my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin only route */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}
