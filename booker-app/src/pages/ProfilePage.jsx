import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [saveState, setSaveState] = useState('idle');
  const [stats, setStats] = useState({ total: 0, genres: {}, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    profilePhoto: user?.profilePhoto || ''
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const avatarOptions = [
    '👤', '👨', '👩', '🧑', '👱‍♂️', '👱‍♀️', '👨‍🦰', '👩‍🦰', 
    '👨‍🦱', '👩‍🦱', '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳',
    '🤓', '😎', '🤗', '😊', '🧐', '🤔', '😌', '🙂'
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/getbooks');
      const books = response.data;
      
      const genreCount = books.reduce((acc, book) => {
        acc[book.genre] = (acc[book.genre] || 0) + 1;
        return acc;
      }, {});

      const totalRating = books.reduce((sum, book) => sum + (book.rating || 0), 0);
      const avgRating = books.length > 0 ? (totalRating / books.length).toFixed(1) : 0;

      setStats({
        total: books.length,
        genres: genreCount,
        avgRating: avgRating
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveState('saving');
    await updateUserProfile(profileData);
    setSaveState('saved');
    setEditMode(false);
    setTimeout(() => setSaveState('idle'), 1500);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePhoto: reader.result,
          avatar: '' // Clear avatar when uploading photo
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectAvatar = (avatar) => {
    setProfileData({
      ...profileData,
      avatar: avatar,
      profilePhoto: '' // Clear photo when selecting avatar
    });
    setShowAvatarPicker(false);
  };

  const getCurrentAvatar = () => {
    if (profileData.profilePhoto) return profileData.profilePhoto;
    if (profileData.avatar) return profileData.avatar;
    return '👤';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-hero">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              {profileData.profilePhoto ? (
                <img 
                  src={profileData.profilePhoto} 
                  alt="Profile" 
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-emoji">
                  {getCurrentAvatar()}
                </div>
              )}
              {editMode && (
                <div className="avatar-edit-buttons">
                  <label className="avatar-edit-btn">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button 
                    className="avatar-edit-btn"
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    😊
                  </button>
                </div>
              )}
            </div>
            
            {showAvatarPicker && (
              <div className="avatar-picker">
                <div className="avatar-picker-header">
                  <h3>Choisir un avatar</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAvatarPicker(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="avatar-grid">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      className="avatar-option"
                      onClick={() => selectAvatar(avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="profile-info">
            {editMode ? (
              <div className="profile-edit-form">
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="form-input profile-input"
                  placeholder="Nom d'utilisateur"
                />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="form-input profile-input"
                  placeholder="Email"
                />
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="form-input form-textarea profile-input"
                  placeholder="Écrivez quelque chose sur vous..."
                  rows="3"
                />
                <div className="profile-edit-buttons">
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saveState==='saving'}>
                    {saveState==='saving' ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setEditMode(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{profileData.username}</h1>
                <p className="profile-email">{profileData.email}</p>
                {profileData.bio && (
                  <p className="profile-bio">{profileData.bio}</p>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={() => setEditMode(true)}
                >
                  ✏️ Modifier le profil
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="stats-section">
          <h2 className="section-title">📊 Mes statistiques de lecture</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Livres dans ma bibliothèque</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎭</div>
              <div className="stat-value">{Object.keys(stats.genres).length}</div>
              <div className="stat-label">Genres différents</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats.avgRating}/5</div>
              <div className="stat-label">Note moyenne</div>
            </div>
          </div>

          {Object.keys(stats.genres).length > 0 && (
            <div className="genres-section">
              <h3 className="subsection-title">📖 Répartition par genres</h3>
              <div className="genre-stats">
                {Object.entries(stats.genres)
                  .sort(([,a], [,b]) => b - a)
                  .map(([genre, count]) => (
                    <div key={genre} className="genre-stat-item">
                      <div className="genre-info">
                        <span className="genre-name">{genre}</span>
                        <span className="genre-count">{count} livre{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="genre-bar-container">
                        <div 
                          className="genre-bar" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="genre-percentage">
                        {Math.round((count / stats.total) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="btn btn-ghost logout-btn" onClick={logout}>
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;