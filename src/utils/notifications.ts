import { toast } from 'react-hot-toast';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
}

export function scheduleNotification(
  title: string,
  options: NotificationOptions,
  delay: number
) {
  // Show toast notification
  toast(title, {
    duration: 5000,
    icon: '🔔',
  });

  // Show browser notification
  if (Notification.permission !== 'granted') {
    requestNotificationPermission();
    return;
  }

  try {
    // First try to use service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        setTimeout(() => {
          registration.showNotification(title, {
            ...options,
            badge: '/icon.svg',
            icon: '/icon.svg',
            vibrate: [200, 100, 200],
            requireInteraction: true,
          });
        }, delay);
      });
    } else {
      // Fallback to native notification
      setTimeout(() => {
        new Notification(title, {
          ...options,
          icon: '/icon.svg',
        });
      }, delay);
    }
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
  }
}