import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookForm from '../components/BookForm';
import './EditBookPage.css';

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Identifiant de livre invalide');
      setLoading(false);
      return;
    }
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/getbook/${id}`);
      setBook(response.data);
    } catch (error) {
      setError('Erreur lors du chargement du livre');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/editbook', {
        id,
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        startedDate: formData.startedDate,
        finishedDate: formData.finishedDate,
        resume: formData.resume,
        image: formData.image,
        rating: formData.rating,
        characterRating: formData.characterRating,
        environmentRating: formData.environmentRating,
        plotRating: formData.plotRating,
        plotTwistRating: formData.plotTwistRating,
        originalityRating: formData.originalityRating,
        isFavorite: formData.isFavorite,
        comment: formData.comment,
        quotes: formData.quotes || [],
        highlights: formData.highlights || [],
      });
      if (id && id !== 'undefined' && id !== 'null') {
        navigate(`/book/${id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Erreur lors de la modification du livre');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Chargement du livre...</div>;
  if (!book) return <div className="error-message">Livre non trouvé</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">←</button>
        <h1>Modifier le livre</h1>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <BookForm 
        initialData={book}
        onSubmit={handleSubmit} 
        submitLabel={submitting ? 'Modification en cours...' : 'Enregistrer les modifications'} 
        disabled={submitting}
      />
    </div>
  );
};

export default EditBookPage;