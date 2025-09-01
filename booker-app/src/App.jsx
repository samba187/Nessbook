import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ProfilePage from './pages/ProfilePage';

// Import the main CSS
import './App.css';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/add-book" element={<PrivateRoute><AddBookPage /></PrivateRoute>} />
      <Route path="/edit-book/:id" element={<PrivateRoute><EditBookPage /></PrivateRoute>} />
      <Route path="/book/:id" element={<PrivateRoute><BookDetailsPage /></PrivateRoute>} />
  {/* Defensive redirect for accidental /book/undefined */}
  <Route path="/book/undefined" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      {/* Catch all route */}
      <Route path="*" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </AuthProvider>
  );
};

export default App;
