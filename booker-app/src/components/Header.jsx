import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Logo from './Logo';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const getInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    if (user?.profilePhoto) return user.profilePhoto;
    return null;
  };

  if (!isAuthenticated) return null;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="header-logo">
          <div className="logo-icon"><Logo size={24} /></div>
          <span className="logo-text">NessBook</span>
        </Link>

        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          <Link to="/add-book" className="nav-link">
            <span className="nav-icon">➕</span>
            Ajouter un livre
          </Link>
        </nav>

        <div className="header-profile">
          <div 
            className="profile-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="avatar">
              {getAvatarUrl() ? (
                <img src={getAvatarUrl()} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(user?.username)}
                </div>
              )}
            </div>
            <span className="profile-name">{user?.username || 'Utilisateur'}</span>
            <span className="dropdown-arrow">▼</span>
          </div>

          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <div className="profile-menu-avatar">
                  {getAvatarUrl() ? (
                    <img src={getAvatarUrl()} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {getInitials(user?.username)}
                    </div>
                  )}
                </div>
                <div className="profile-menu-info">
                  <div className="profile-menu-name">{user?.username}</div>
                  <div className="profile-menu-email">{user?.email}</div>
                </div>
              </div>
              
              <div className="profile-menu-divider"></div>
              
              <Link 
                to="/profile" 
                className="profile-menu-item"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="menu-item-icon">👤</span>
                Mon Profil
              </Link>
              
              <button 
                onClick={handleLogout}
                className="profile-menu-item profile-menu-logout"
              >
                <span className="menu-item-icon">🚪</span>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
