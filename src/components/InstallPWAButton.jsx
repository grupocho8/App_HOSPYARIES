import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap'; 

const InstallPWAButton = ({ isMobile = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') setIsVisible(false);
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');

  if (!isVisible || isStandalone) return null;

  if (isMobile) {
    return (
      <button 
        className="btn btn-outline-dark mt-3 w-100" 
        onClick={handleInstallClick}
      >
        <i className="bi-download me-2"></i>
        Instalar App
      </button>
    );
  }

  return (
    <Nav.Link
      onClick={handleInstallClick}
      className="text-dark d-flex align-items-center"
      title="Instalar Aplicación"
    >
      <i className="bi-download fs-5"></i>
    </Nav.Link>
  );
};

export default InstallPWAButton;
