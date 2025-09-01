import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BookListPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/getbooks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setBooks(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <h2>Mes Livres</h2>
      {books.length === 0 ? (
        <p>Aucun livre trouvé.</p>
      ) : (
        <ul>
          {books.map((book, index) => (
            <li key={index}>
              <strong>{book.title}</strong> — {book.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookListPage;
