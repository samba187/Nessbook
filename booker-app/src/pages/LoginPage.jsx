import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AuthPages.css';

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/login', formData);
      
      if (response.data.access_token) {
        // Create user data object
        const userData = {
          email: formData.email,
          username: formData.email.split('@')[0], // Extract username from email
        };
        
        login(response.data.access_token, userData);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">📚</span>
              <h1 className="auth-logo-text">NessBook</h1>
            </div>
            <p className="auth-subtitle">Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-icon">🔒</span>
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full auth-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="auth-footer">
            <p>Vous n'avez pas de compte ?</p>
            <Link to="/register" className="auth-link">
              Créer un compte
              <span className="link-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">📖</div>
            <h3>Gérez votre bibliothèque</h3>
            <p>Organisez et suivez tous vos livres préférés</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⭐</div>
            <h3>Notez et commentez</h3>
            <p>Partagez vos avis et découvrez de nouveaux livres</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Objectifs de lecture</h3>
            <p>Définissez et atteignez vos objectifs de lecture</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;