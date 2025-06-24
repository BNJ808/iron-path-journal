
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker enregistré avec succès:', registration.scope);
      
      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              console.log('Nouvelle version de l\'app disponible');
              // Ici vous pouvez afficher une notification à l'utilisateur
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  }
};

export const checkForAppUpdate = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
    }
  }
};

export const isAppInstallable = () => {
  return 'BeforeInstallPromptEvent' in window;
};

export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true;
};
