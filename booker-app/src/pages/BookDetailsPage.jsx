import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './BookDetailsPage.css';
import { getPlaceholderImage } from '../utils/bookUtils';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setLoading(false);
      setBook(null);
      // Redirect away from invalid route
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/getbook/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du livre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.post('/deletebook', { id });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading">Chargement du livre...</div>;
  if (!book) return <div className="error-message">Livre non trouvé</div>;

  // Helpers
  const isLegacy = !!book.year && !book.startedDate; // anciens livres sans dates
  const formatDate = (d) => {
    if (!d) return '';
    try {
      // Supporte 'YYYY-MM-DD' ou ISO
      const parts = String(d).split('-');
      const date = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date(d);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };
  const stars = (n = 0) => {
    const v = Math.max(0, Math.min(5, Number(n) || 0));
    return (
      <span className="stars">
        {'★'.repeat(v)}{'☆'.repeat(5 - v)}
      </span>
    );
  };
  const hasDetailed = ['characterRating','environmentRating','plotRating','plotTwistRating','originalityRating']
    .some((k) => Number(book?.[k]) > 0);

  return (
    <div className="book-details-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">←</button>
        <h1>Détails du livre</h1>
      </header>

      <div className="book-details">
        <div className="book-cover-large">
          <img 
            src={book.image || getPlaceholderImage(book.title)} 
            alt={book.title}
            onError={(e) => { e.target.src = getPlaceholderImage(book.title); }}
          />
        </div>

        <div className="book-info-details">
          <h2>{book.title}</h2>
          <p className="author-name">{book.author}</p>
          {book.isFavorite && (
            <div className="favorite-badge" title="Coup de cœur">❤️ Coup de cœur</div>
          )}

          <div className="book-metadata">
            {book.genre && <span className="genre-tag">{book.genre}</span>}
            {!isLegacy ? (
              <>
                {book.startedDate && (
                  <span className="date-tag">Début: {formatDate(book.startedDate)}</span>
                )}
                {book.finishedDate && (
                  <span className="date-tag">Fin: {formatDate(book.finishedDate)}</span>
                )}
              </>
            ) : (
              <>
                {book.year && <span className="year-tag">{book.year}</span>}
                <span className="pages-tag">{book.pages ? `${book.pages} pages` : '— pages'}</span>
              </>
            )}
          </div>

          {/* Ratings */}
          <div className="ratings-grid-details">
            <div className="rating-row"><span className="rating-label">Note générale</span>{stars(book.rating)}</div>
            {(hasDetailed || !isLegacy) && (
              <>
                <div className="rating-row"><span className="rating-label">Personnages</span>{stars(book.characterRating)}</div>
                <div className="rating-row"><span className="rating-label">Environnement</span>{stars(book.environmentRating)}</div>
                <div className="rating-row"><span className="rating-label">Intrigue</span>{stars(book.plotRating)}</div>
                <div className="rating-row"><span className="rating-label">Plot twist</span>{stars(book.plotTwistRating)}</div>
                <div className="rating-row"><span className="rating-label">Originalité</span>{stars(book.originalityRating)}</div>
              </>
            )}
          </div>

            <div className="book-section">
              <h3>Résumé</h3>
              <p>{book.resume && String(book.resume).trim().length > 0 ? book.resume : <span className="muted">Aucun résumé ajouté</span>}</p>
            </div>
            <div className="book-section">
              <h3>📌 Citations</h3>
              {Array.isArray(book.quotes) && book.quotes.length > 0 ? (
                <div>
                  {book.quotes.map((q, i) => (
                    <blockquote key={i} className="quote-block">
                      <p>{q.text}</p>
                      {(q.author || q.page) && (
                        <footer>
                          {q.author && <span>— {q.author}</span>}
                          {q.author && q.page && <span> · </span>}
                          {q.page && <span>p. {q.page}</span>}
                        </footer>
                      )}
                    </blockquote>
                  ))}
                </div>
              ) : (
                <p className="muted">Aucune citation enregistrée</p>
              )}
            </div>
            <div className="book-section">
              <h3>Mon commentaire</h3>
              <p>{book.comment && String(book.comment).trim().length > 0 ? book.comment : <span className="muted">Aucun commentaire</span>}</p>
            </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={() => navigate(`/edit-book/${id}`)}>
              Modifier
            </button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce livre ?</p>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;