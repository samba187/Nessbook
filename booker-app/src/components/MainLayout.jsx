import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import MobileNav from './MobileNav';

const MainLayout = ({ children }) => {
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
    <div className="app-container">
      {isAuthenticated && <Header />}
      <main className="app-content" style={{ flex: 1, padding: isAuthenticated ? '24px' : '0' }}>
        {children}
      </main>
      {isAuthenticated && <MobileNav />}
    </div>
  );
};

export default MainLayout;