import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AuthPages.css';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span className="auth-logo-icon">✅</span>
                <h1 className="auth-logo-text">Inscription réussie !</h1>
              </div>
              <p className="auth-subtitle">Redirection vers la page de connexion...</p>
            </div>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3>Commencez votre voyage</h3>
            <p>Créez votre compte et commencez à organiser votre bibliothèque personnelle</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Sécurisé et privé</h3>
            <p>Vos données sont protégées et votre bibliothèque reste privée</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>Accessible partout</h3>
            <p>Accédez à vos livres depuis n'importe quel appareil</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">📚</span>
              <h1 className="auth-logo-text">NessBook</h1>
            </div>
            <p className="auth-subtitle">Créez votre compte</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <span className="label-icon">👤</span>
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre nom d'utilisateur"
                required
                minLength="3"
              />
            </div>

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
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <span className="label-icon">🔐</span>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
                minLength="6"
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
                  Création du compte...
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="auth-footer">
            <p>Vous avez déjà un compte ?</p>
            <Link to="/login" className="auth-link">
              Se connecter
              <span className="link-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;