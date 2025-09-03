import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DraggableBookGrid from '../components/DraggableBookGrid';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      console.log('Fetching books from API...');
      const response = await api.get('/getbooks');
      console.log('API response:', response.data);
      setBooks(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooksReorder = (reorderedBooks) => {
    setBooks(reorderedBooks);
    // Sauvegarder l'ordre dans le localStorage
    const bookOrder = reorderedBooks.map((book, index) => ({
      id: book._id,
      order: index
    }));
    localStorage.setItem(`bookOrder_${user?.email}`, JSON.stringify(bookOrder));
  };

  // Restore book order from localStorage
  useEffect(() => {
    if (books.length > 0 && user?.email) {
      const savedOrder = localStorage.getItem(`bookOrder_${user.email}`);
      if (savedOrder) {
        try {
          const orderMap = JSON.parse(savedOrder);
          const orderedBooks = [...books].sort((a, b) => {
            const orderA = orderMap.find(item => item.id === a._id)?.order ?? 999;
            const orderB = orderMap.find(item => item.id === b._id)?.order ?? 999;
            return orderA - orderB;
          });
          setBooks(orderedBooks);
        } catch (error) {
          console.error('Erreur lors de la restauration de l\'ordre:', error);
        }
      }
    }
  }, [books.length, user?.email]);

  // Get unique genres for filter
  const genres = [...new Set(books.map(book => book.genre))].filter(Boolean);

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = !filterGenre || book.genre === filterGenre;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'favorites':
          // Favorites first, then by rating
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: books.length,
    genres: genres.length,
    avgRating: books.length > 0 
      ? (books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1)
      : 0,
    favorites: books.filter(book => book.isFavorite).length
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="welcome-title">
            {getWelcomeMessage()}, {user?.username || 'Lecteur'} ! 👋
          </h1>
          <p className="welcome-subtitle">
            Prêt à découvrir votre prochaine lecture ?
          </p>
        </div>
        
        <div className="quick-stats">
          <div className="quick-stat-item">
            <span className="quick-stat-value">{stats.total}</span>
            <span className="quick-stat-label">Livres</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-value">{stats.favorites}</span>
            <span className="quick-stat-label">❤️ Favoris</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-value">⭐ {stats.avgRating}</span>
            <span className="quick-stat-label">Note moy.</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn btn-primary add-book-btn"
          onClick={() => navigate('/add-book')}
        >
          <span className="btn-icon">➕</span>
          Ajouter un livre
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="title">Trier par titre</option>
            <option value="author">Trier par auteur</option>
            <option value="rating">Trier par note</option>
            <option value="favorites">Coups de cœur d'abord</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3 className="empty-state-title">
              {searchTerm || filterGenre 
                ? 'Aucun livre trouvé' 
                : 'Votre bibliothèque est vide'
              }
            </h3>
            <p className="empty-state-description">
              {searchTerm || filterGenre
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier livre à votre collection'
              }
            </p>
            {!searchTerm && !filterGenre && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/add-book')}
              >
                <span className="btn-icon">➕</span>
                Ajouter votre premier livre
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2 className="results-title">
                {filteredBooks.length === books.length 
                  ? 'Tous mes livres' 
                  : `${filteredBooks.length} livre${filteredBooks.length > 1 ? 's' : ''} trouvé${filteredBooks.length > 1 ? 's' : ''}`
                }
              </h2>
              {(searchTerm || filterGenre) && (
                <button 
                  className="btn btn-ghost clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterGenre('');
                  }}
                >
                  Effacer les filtres
                </button>
              )}
            </div>

            <DraggableBookGrid 
              books={filteredBooks}
              onBooksReorder={handleBooksReorder}
              onEdit={(book) => {
                console.log('DashboardPage onEdit called with book:', book);
                if (!book?._id) {
                  console.warn('Cannot edit: book._id is missing:', book);
                  return;
                }
                console.log('Navigating to edit-book with id:', book._id);
                navigate(`/edit-book/${book._id}`);
              }}
              onDelete={async (book) => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
                  try {
                    await api.post('/deletebook', { id: book._id });
                    fetchBooks(); // Refresh the list
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                  }
                }
              }}
              onView={(book) => {
                console.log('DashboardPage onView called with book:', book);
                if (!book?._id) {
                  console.warn('Cannot view: book._id is missing:', book);
                  return;
                }
                console.log('Navigating to book with id:', book._id);
                navigate(`/book/${book._id}`);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;