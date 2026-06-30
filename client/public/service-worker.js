self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Sri Tirupati Bakery';
  
  // Set badge to small monochrome icon, or fallback
  const badgeIcon = '/icon-192.png';

  // Determine dynamic icons or vibration patterns based on type
  let icon = '/icon-192.png';
  let vibrate = [200, 100, 200];
  let image = undefined;

  if (data.type === 'new_order' || data.type === 'payment_received') {
    vibrate = [300, 100, 400]; // longer vibrate for new orders/payments
  } else if (data.type === 'order_cancelled') {
    vibrate = [100, 50, 100, 50, 100]; // alert vibrate
  } else if (data.type === 'custom_cake') {
    vibrate = [200, 100, 200, 100, 200]; // celebratory
  }

  const options = {
    body: data.body || 'You have a new notification.',
    icon: icon,
    badge: badgeIcon,
    vibrate: vibrate,
    image: image, // Optional banner image
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
