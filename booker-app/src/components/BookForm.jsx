import React, { useState } from 'react';

const BookForm = ({ initialData = {}, onSubmit, submitLabel, disabled = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    author: initialData.author || '',
    genre: initialData.genre || '',
    year: initialData.year || new Date().getFullYear(),
  pages: initialData.pages || '',
    rating: initialData.rating || 0,
    resume: initialData.resume || '',
    comment: initialData.comment || '',
    image: initialData.image || '',
    // Normalize legacy 'highlight' to 'highlights'
    highlights: initialData.highlights || initialData.highlight || [],
    quotes: initialData.quotes || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

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

        <div className="form-group">
          <label>Année</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="form-input"
            min="1000"
            max={new Date().getFullYear()}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Pages</label>
          <input
            type="text"
            value={formData.pages}
            onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
            className="form-input"
            placeholder="ex: 350"
            disabled={disabled}
          />
        </div>
      </div>

  <div className="form-group">
        <label>Note</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${formData.rating >= star ? 'filled' : ''}`}
              onClick={() => !disabled && handleRatingClick(star)}
              style={{ cursor: disabled ? 'default' : 'pointer' }}
            >
              ★
            </span>
          ))}
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