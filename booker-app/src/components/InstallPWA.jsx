import React, { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Détection des plateformes
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isAndroid = /android/i.test(window.navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isInWebAppiOS = window.navigator.standalone === true;
  const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    // Pour Chrome/Edge/Firefox (Android & Desktop)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Pour iOS Safari, montre les instructions si pas déjà installé
    if (isIOS && !isInWebAppiOS) {
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isIOS, isInWebAppiOS]);

  const onInstall = async () => {
    if (deferredPrompt) {
      // Chrome/Edge/Firefox
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // iOS Safari - montrer les instructions
      setShowIOSInstructions(true);
    }
  };

  const closeIOSInstructions = () => {
    setShowIOSInstructions(false);
    setVisible(false);
  };

  // N'affiche rien si déjà installé
  if (isStandalone || isInWebAppiOS || isInWebAppChrome) return null;
  
  // N'affiche rien si pas visible
  if (!visible) return null;

  return (
    <>
      {/* Bouton d'installation */}
      <div className="install-pwa-button" style={{ 
        position: 'fixed', 
        bottom: 80, 
        right: 20, 
        zIndex: 1000,
        animation: 'slideInUp 0.3s ease-out'
      }}>
        <button
          onClick={onInstall}
          className="btn btn-primary"
          style={{ 
            boxShadow: '0 6px 20px rgba(233, 30, 99, 0.3)',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: '#e91e63',
            borderColor: '#e91e63',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isIOS ? '📱' : '⬇️'} 
          {isIOS ? 'Installer sur iOS' : 'Installer l\'app'}
        </button>
      </div>

      {/* Instructions pour iOS */}
      {showIOSInstructions && (
        <div 
          className="ios-install-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeIOSInstructions}
        >
          <div 
            className="ios-install-content"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '350px',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeIOSInstructions}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
            
            <h3 style={{ color: '#e91e63', marginBottom: '20px', fontSize: '20px' }}>
              📱 Installer NessBook
            </h3>
            
            <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
              <p style={{ marginBottom: '15px' }}>
                Pour installer cette app sur votre iPhone :
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>1️⃣</span>
                <span>Appuyez sur le bouton <strong>Partager</strong> 
                <span style={{ fontSize: '18px', marginLeft: '5px' }}>⬆️</span></span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>2️⃣</span>
                <span>Sélectionnez <strong>"Sur l'écran d'accueil"</strong> 
                <span style={{ fontSize: '18px', marginLeft: '5px' }}>📱</span></span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>3️⃣</span>
                <span>Appuyez sur <strong>"Ajouter"</strong></span>
              </div>
              
              <div style={{ 
                backgroundColor: '#f0f8ff', 
                padding: '15px', 
                borderRadius: '10px',
                fontSize: '14px',
                color: '#666'
              }}>
                💡 L'app sera accessible depuis votre écran d'accueil, comme une vraie app !
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
