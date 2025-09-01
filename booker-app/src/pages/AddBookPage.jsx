import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AddBookPage.css';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year: new Date().getFullYear(),
    image: '',
    imageFile: null,
    resume: '',
    comment: '',
    rating: 0,
  highlights: [],
  quotes: [],
    pages: ''
  });

  // Genres (liste courte demandée)
  const genres = [
    'New Romance',
    'Dark Romance',
    'Romance',
    'Fantasy',
    'Thriller',
    'Science-Fiction',
    'Autres'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Gestion des fichiers image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Drop pour les images
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  // Surlignages retirés de l'UI à la demande; on garde le champ pour compatibilité sans l'exposer

  const addQuote = () => {
    setFormData(prev => ({
      ...prev,
      quotes: [...prev.quotes, { text: '', page: '', author: formData.author }]
    }));
  };
  const addTwoQuotes = () => {
    setFormData(prev => ({
      ...prev,
      quotes: [...prev.quotes, { text: '', page: '', author: formData.author }, { text: '', page: '', author: formData.author }]
    }));
  };

  const updateQuote = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      quotes: prev.quotes.map((quote, i) => 
        i === index ? { ...quote, [field]: value } : quote
      )
    }));
  };

  const removeQuote = (index) => {
    setFormData(prev => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/addbook', formData);
      navigate('/dashboard');
    } catch (error) {
      setError('Erreur lors de l\'ajout du livre');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(num => (
        <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
          <div className="step-number">{num}</div>
          <div className="step-label">
            {num === 1 && 'Informations'}
            {num === 2 && 'Avis & Notes'}
            {num === 3 && 'Citations'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h3 className="step-title">📖 Informations du livre</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📚</span>
            Titre du livre *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Le titre de votre livre..."
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">✍️</span>
            Auteur *
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Nom de l'auteur..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎭</span>
            Genre *
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Choisir un genre...</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📅</span>
            Année de publication
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="form-input"
            min="1000"
            max={new Date().getFullYear() + 10}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📄</span>
            Nombre de pages
          </label>
          <input
            type="text"
            name="pages"
            value={formData.pages}
            onChange={handleInputChange}
            className="form-input"
            placeholder="ex: 350"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🖼️</span>
          Image de couverture
        </label>
        <div 
          className="image-upload-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-input').click()}
        >
          {formData.image ? (
            <div className="image-preview">
              <img src={formData.image} alt="Aperçu" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData(prev => ({ ...prev, image: '', imageFile: null }));
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <p>Glissez-déposez une image ici</p>
              <p>ou cliquez pour sélectionner</p>
              <small>PNG, JPG, JPEG acceptés</small>
            </div>
          )}
        </div>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📝</span>
          Résumé du livre
        </label>
        <textarea
          name="resume"
          value={formData.resume}
          onChange={handleInputChange}
          className="form-textarea"
          placeholder="Écrivez un résumé du livre..."
          rows="4"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3 className="step-title">⭐ Votre avis sur le livre</h3>
      
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">⭐</span>
          Note sur 5
        </label>
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(star)}
            >
              ⭐
            </button>
          ))}
          <span className="rating-text">
            {formData.rating > 0 ? `${formData.rating}/5` : 'Non noté'}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">💭</span>
          Votre commentaire personnel
        </label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          className="form-textarea"
          placeholder="Que pensez-vous de ce livre ? Vos impressions, ce que vous avez aimé ou moins aimé..."
          rows="6"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3 className="step-title">📝 Citations</h3>
      
      <div className="quotes-section">
        <div className="section-header">
          <h4>📝 Citations mémorables</h4>
          <div style={{display:'flex', gap: '8px'}}>
          <button type="button" onClick={addQuote} className="btn btn-secondary btn-small">
            <span className="btn-icon">➕</span>
            Ajouter une citation
          </button>
          <button type="button" onClick={addTwoQuotes} className="btn btn-secondary btn-small" title="Ajouter deux">
            ➕➕
          </button>
          </div>
        </div>
        
        {formData.quotes.map((quote, index) => (
          <div key={index} className="quote-item">
            <div className="quote-header">
              <span className="quote-number">Citation #{index + 1}</span>
              <button 
                type="button" 
                onClick={() => removeQuote(index)}
                className="remove-btn"
              >
                ✕
              </button>
            </div>
            <div className="quote-content">
              <textarea
                value={quote.text}
                onChange={(e) => updateQuote(index, 'text', e.target.value)}
                className="form-textarea quote-text"
                placeholder="Écrivez la citation ici..."
                rows="3"
              />
              <div className="quote-meta">
                <input
                  type="text"
                  value={quote.page}
                  onChange={(e) => updateQuote(index, 'page', e.target.value.trim())}
                  className="form-input page-input"
                  placeholder="Page"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

  {/* Surlignages retirés */}
    </div>
  );

  return (
    <div className="add-book-container">
      <div className="add-book-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <span className="back-icon">←</span>
          Retour
        </button>
        <h1 className="page-title">📚 Ajouter un nouveau livre</h1>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form 
        onSubmit={(e) => e.preventDefault()} 
        className="add-book-form"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        <div className="form-container">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="form-navigation">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn btn-secondary">
              <span className="btn-icon">←</span>
              Précédent
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {step < 3 ? (
            <button 
              type="button" 
              onClick={nextStep} 
              className="btn btn-primary"
              disabled={step === 1 && (!formData.title || !formData.author || !formData.genre)}
            >
              <span>Suivant</span>
              <span className="btn-icon">→</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.author || !formData.genre}
              className="btn btn-primary btn-large"
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Ajouter le livre
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddBookPage;