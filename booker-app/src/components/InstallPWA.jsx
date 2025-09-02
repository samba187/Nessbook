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
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <button
        onClick={onInstall}
        className="btn btn-secondary"
        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}
      >
        Installer l'application
      </button>
    </div>
  );
};

export default InstallPWA;
