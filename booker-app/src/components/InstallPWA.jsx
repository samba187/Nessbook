import React, { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome auto prompt
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  // Hide on iOS Safari (no beforeinstallprompt); users use Share -> Add to Home Screen
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (!visible || isIos || isStandalone) return null;

  return (
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
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        📱 Installer l'app
      </button>
    </div>
  );
};

export default InstallPWA;
