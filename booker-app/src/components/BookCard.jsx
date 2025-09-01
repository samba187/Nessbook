import React from 'react';
import { getPlaceholderImage } from '../utils/bookUtils';
import './BookCard.css';

const BookCard = ({ book, onClick, onEdit, onDelete, onView }) => {
  const formatRating = (rating) => {
    const stars = Math.round(rating || 0);
    return '⭐'.repeat(stars);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    console.log('BookCard action:', action, 'book:', book, 'book._id:', book._id);
    if (action === 'edit' && onEdit) {
      console.log('Calling onEdit with book:', book);
      onEdit(book);
    } else if (action === 'delete' && onDelete) {
      console.log('Calling onDelete with book:', book);
      onDelete(book);
    } else if (action === 'view' && onView) {
      console.log('Calling onView with book:', book);
      onView(book);
    }
  };

  return (
    <div className="book-card" onClick={() => onClick && onClick(book)}>
      <div className="book-card-header">
        <div className="book-cover-container">
          <img 
            src={book.image || getPlaceholderImage(book.title)} 
            alt={book.title} 
            className="book-cover-image"
            onError={(e) => { e.target.src = getPlaceholderImage(book.title); }}
          />
          <div className="book-overlay">
            <div className="book-actions">
              {onView && (
                <button 
                  className="action-btn view-btn"
                  onClick={(e) => handleAction('view', e)}
                  title="Voir les détails"
                >
                  👁️
                </button>
              )}
              {onEdit && (
                <button 
                  className="action-btn edit-btn"
                  onClick={(e) => handleAction('edit', e)}
                  title="Modifier"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => handleAction('delete', e)}
                  title="Supprimer"
                >
                  🗑️
                </button>
              )}
            </div>
            {!onView && !onEdit && !onDelete && (
              <span className="view-details">👁️ Voir les détails</span>
            )}
          </div>
        </div>
        
        {book.rating > 0 && (
          <div className="book-rating-badge">
            <span className="rating-stars">{formatRating(book.rating)}</span>
            <span className="rating-value">{book.rating}/5</span>
          </div>
        )}
      </div>

      <div className="book-card-content">
        <div className="book-main-info">
          <h3 className="book-title" title={book.title}>
            {truncateText(book.title, 50)}
          </h3>
          <p className="book-author" title={book.author}>
            {truncateText(book.author, 30)}
          </p>
        </div>

        <div className="book-metadata">
          <div className="book-genre-tag">
            <span className="genre-icon">📖</span>
            {book.genre}
          </div>
          
          {book.year && (
            <div className="book-year">
              📅 {book.year}
            </div>
          )}
        </div>

        {book.resume && (
          <div className="book-description">
            <p>{truncateText(book.resume, 100)}</p>
          </div>
        )}

        {book.comment && (
          <div className="book-comment">
            <span className="comment-icon">💭</span>
            <p>{truncateText(book.comment, 80)}</p>
          </div>
        )}
      </div>

      <div className="book-card-footer">
        <div className="card-actions">
          {onView && (
            <button 
              className="action-btn view-btn" 
              onClick={(e) => handleAction('view', e)}
              title="Voir les détails"
            >
              👁️
            </button>
          )}
          {onEdit && (
            <button 
              className="action-btn edit-btn" 
              onClick={(e) => handleAction('edit', e)}
              title="Modifier"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button 
              className="action-btn delete-btn" 
              onClick={(e) => handleAction('delete', e)}
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
        
        <button
          className="read-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onView) {
              onView(book);
            } else if (onClick) {
              onClick(book);
            }
          }}
        >
          <span>Lire plus</span>
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;