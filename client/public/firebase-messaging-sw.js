importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCZv_eSl25Mmvvogxy0RUc8bIryDHMxICU",
  authDomain: "sri-tirupati-bakery.firebaseapp.com",
  projectId: "sri-tirupati-bakery",
  messagingSenderId: "642597912840", // Extracted from appId 1:642597912840:...
  appId: "1:642597912840:web:4abeeb7592ec62b5d5acbd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Sri Tirupathi Bakery';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: payload.data?.url || '/',
      type: payload.data?.type || 'notification'
    }
  };

  // Set App Badge
  if (navigator.setAppBadge) {
    // We don't know the exact unread count here without an API call, 
    // but we can increment it or rely on the frontend to set the exact number.
    // For now, just set it to 1 to show a dot on Android.
    navigator.setAppBadge(1).catch((error) => {
      console.error('Error setting app badge:', error);
    });
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (navigator.clearAppBadge) {
    navigator.clearAppBadge().catch((error) => console.error(error));
  }

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
