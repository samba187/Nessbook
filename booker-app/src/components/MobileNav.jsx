import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Accueil' },
    { path: '/add-book', icon: '➕', label: 'Ajouter' },
    { path: '/profile', icon: '👤', label: 'Profil' }
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-container">
              <span className="nav-icon">{item.icon}</span>
              {location.pathname === item.path && (
                <div className="active-indicator"></div>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;