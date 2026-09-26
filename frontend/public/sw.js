// MedGuard AI - Web Push & Clinical Adherence Service Worker
const CACHE_NAME = 'medguard-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Push notification event listener for real-time dose reminders and caregiver alerts
self.addEventListener('push', (event) => {
  let payload = {
    title: 'MedGuard AI Alert',
    body: 'Time for your scheduled medication dose.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'medguard-dose-reminder',
    data: { url: '/' }
  };

  try {
    if (event.data) {
      const data = event.data.json();
      payload = {
        title: data.title || payload.title,
        body: data.body || payload.body,
        icon: data.icon || payload.icon,
        badge: data.badge || payload.badge,
        tag: data.tag || payload.tag,
        data: data.data || payload.data
      };
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: true,
    data: payload.data,
    actions: [
      { action: 'take', title: '✓ Mark Taken' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
