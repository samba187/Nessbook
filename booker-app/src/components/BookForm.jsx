import React, { useState } from 'react';
import '../styles/ratings.css';

const BookForm = ({ initialData = {}, onSubmit, submitLabel, disabled = false }) => {
  // Defensive clone so we can mutate safely
  const safeInitial = initialData || {};
  const [formData, setFormData] = useState({
    title: safeInitial.title || '',
    author: safeInitial.author || '',
    genre: safeInitial.genre || '',
    // Nouveaux champs (dates)
  startedDate: safeInitial.startedDate || '',
  finishedDate: safeInitial.finishedDate || '',
    // Anciens champs (pour compatibilité)
  year: safeInitial.year || '',
  pages: safeInitial.pages || '',
  rating: safeInitial.rating || 0,
  characterRating: safeInitial.characterRating || 0,
  environmentRating: safeInitial.environmentRating || 0,
  plotRating: safeInitial.plotRating || 0,
  plotTwistRating: safeInitial.plotTwistRating || 0,
  originalityRating: safeInitial.originalityRating || 0,
  isFavorite: safeInitial.isFavorite || false,
  resume: safeInitial.resume || '',
  comment: safeInitial.comment || '',
  image: safeInitial.image || '',
    // Normalize legacy 'highlight' to 'highlights'
  highlights: safeInitial.highlights || safeInitial.highlight || [],
  quotes: safeInitial.quotes || []
  });

  // Détermine si c'est un ancien livre (a year/pages mais pas startedDate/finishedDate)
  const isLegacyBook = !!safeInitial.year && !safeInitial.startedDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRatingClick = (field, rating) => {
    setFormData({ ...formData, [field]: rating });
  };

  const RatingInput = ({ label, field, value }) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${value >= star ? 'filled' : ''}`}
            onClick={() => !disabled && handleRatingClick(field, star)}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  return (
  <form onSubmit={handleSubmit} className="book-form">
      <div className="form-group">
        <label>Titre *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
      className="form-input"
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label>Auteur *</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
          className="form-input"
          disabled={disabled}
        />
      </div>

  <div className="form-row">
        <div className="form-group">
          <label>Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
    className="form-input"
            placeholder="Roman, SF, Thriller..."
            disabled={disabled}
          />
        </div>

        {!isLegacyBook && (
          <div className="form-group">
            <label>Coup de cœur</label>
            <button
              type="button"
              className={`btn ${formData.isFavorite ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => !disabled && setFormData({ ...formData, isFavorite: !formData.isFavorite })}
              disabled={disabled}
              style={{ padding: '8px 16px' }}
            >
              {formData.isFavorite ? '❤️ Coup de cœur' : '🤍 Pas un coup de cœur'}
            </button>
          </div>
        )}
      </div>

      <div className="form-row">
        {isLegacyBook ? (
          <>
            <div className="form-group">
              <label>Année de publication</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="form-input"
                placeholder="2023"
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Nombre de pages</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="form-input"
                placeholder="350"
                disabled={disabled}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Commencé le</label>
              <input
                type="date"
                value={formData.startedDate}
                onChange={(e) => setFormData({ ...formData, startedDate: e.target.value })}
                className="form-input"
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Terminé le</label>
              <input
                type="date"
                value={formData.finishedDate}
                onChange={(e) => setFormData({ ...formData, finishedDate: e.target.value })}
                className="form-input"
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>

      <div className="form-group">
        <label>Notes détaillées</label>
        <div className="ratings-grid">
          <RatingInput label="Note globale" field="rating" value={formData.rating} />
          {!isLegacyBook && (
            <>
              <RatingInput label="Personnages" field="characterRating" value={formData.characterRating} />
              <RatingInput label="Environnement" field="environmentRating" value={formData.environmentRating} />
              <RatingInput label="Intrigue" field="plotRating" value={formData.plotRating} />
              <RatingInput label="Plot twist" field="plotTwistRating" value={formData.plotTwistRating} />
              <RatingInput label="Originalité" field="originalityRating" value={formData.originalityRating} />
            </>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Résumé</label>
        <textarea
          value={formData.resume}
          onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
          rows="4"
          className="form-input"
          placeholder="Résumé du livre..."
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label>Commentaire personnel</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          rows="3"
          className="form-input"
          placeholder="Vos impressions sur ce livre..."
          disabled={disabled}
        />
      </div>

      {/* Quotes section */}
      <div className="form-group">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <label>Citations</label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => !disabled && setFormData({
              ...formData,
              quotes: [...(formData.quotes || []), { text: '', page: '', author: formData.author }]
            })}
            disabled={disabled}
          >
            ➕ Ajouter une citation
          </button>
        </div>
        {(formData.quotes || []).map((q, i) => (
          <div key={i} className="form-row" style={{alignItems:'start'}}>
            <div className="form-group" style={{gridColumn:'1 / -1'}}>
              <textarea
                className="form-input"
                rows="2"
                placeholder={`Citation #${i+1}`}
                value={q.text}
                onChange={(e) => {
                  const quotes = [...formData.quotes];
                  quotes[i] = { ...quotes[i], text: e.target.value };
                  setFormData({ ...formData, quotes });
                }}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <input
                className="form-input"
                placeholder="Page"
                value={q.page || ''}
                onChange={(e) => {
                  const quotes = [...formData.quotes];
                  quotes[i] = { ...quotes[i], page: e.target.value };
                  setFormData({ ...formData, quotes });
                }}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <input
                className="form-input"
                placeholder="Auteur de la citation"
                value={q.author || ''}
                onChange={(e) => {
                  const quotes = [...formData.quotes];
                  quotes[i] = { ...quotes[i], author: e.target.value };
                  setFormData({ ...formData, quotes });
                }}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const quotes = formData.quotes.filter((_, idx) => idx !== i);
                  setFormData({ ...formData, quotes });
                }}
                disabled={disabled}
              >
                ✕ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

  {/* Surlignages retirés de l'UI (compatibilité des données conservée) */}

<div className="form-group">
  <label>Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, image: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }}
    className="form-input"
    disabled={disabled}
  />
</div>

{formData.image && (
  <div className="form-group">
    <label>Prévisualisation :</label>
    <img src={formData.image} alt="Prévisualisation" style={{ width: '100px', borderRadius: '10px' }} />
  </div>
)}


      <button type="submit" className="btn btn-primary" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
};

export default BookForm;