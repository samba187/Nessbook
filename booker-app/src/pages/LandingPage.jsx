import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // This will be handled by Navigate in App.jsx
  }

  return (
    <div className="landing-container">
      <div className="landing-background">
        <div className="landing-blob blob-1"></div>
        <div className="landing-blob blob-2"></div>
        <div className="landing-blob blob-3"></div>
        <div className="landing-blob blob-4"></div>
      </div>

      <div className="landing-content">
        <header className="landing-header">
          <div className="landing-logo">
            <span className="landing-logo-icon">📚</span>
            <h1 className="landing-logo-text">NessBook</h1>
          </div>
          <nav className="landing-nav">
            <Link to="/login" className="nav-link">Connexion</Link>
            <Link to="/register" className="btn btn-primary">S'inscrire</Link>
          </nav>
        </header>

        <main className="landing-main">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                NessBook
                <span className="highlight"> - Ma bibliothèque</span>
              </h1>
              <p className="hero-description">
                Organisez vos livres, gardez vos notes et citations.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  <span>Créer un compte</span>
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Se connecter
                </Link>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="book-stack">
                <div className="book book-1">
                  <div className="book-spine"></div>
                  <div className="book-cover">
                    <span>📖</span>
                  </div>
                </div>
                <div className="book book-2">
                  <div className="book-spine"></div>
                  <div className="book-cover">
                    <span>📚</span>
                  </div>
                </div>
                <div className="book book-3">
                  <div className="book-spine"></div>
                  <div className="book-cover">
                    <span>📓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <h2 className="features-title">Fonctionnalités</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Organisation simple</h3>
                <p>Classez vos livres par genre, auteur ou note.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Notes & citations</h3>
                <p>Gardez vos commentaires et citations préférées.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Accessible partout</h3>
                <p>Sur tous vos appareils.</p>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <div className="cta-content">
              <h2>Commencer maintenant</h2>
              <p>Créez votre compte</p>
              <Link to="/register" className="btn btn-primary btn-large">
                <span>S'inscrire</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </main>

        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="footer-logo-icon">📚</span>
              <span className="footer-logo-text">NessBook</span>
            </div>
            <p>&copy; 2024 NessBook.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
