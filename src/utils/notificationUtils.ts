
// Fonction pour demander la permission des notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Fonction pour envoyer une notification
export const sendNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Iron Path Journal', {
      body: 'Votre temps de repos est terminé !',
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      silent: false,
      requireInteraction: true
    });

    // Auto-fermer après 10 secondes
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};
