const CACHE = 'med-nykuto-shell-v481';
const SHELL = [
  '/offline.html',
  '/turma-shell/',
  '/turma-v471.css?v=478',
  '/turma-v471.js?v=478',
  '/turma-manifest-boot-v471.js?v=478',
  '/assets/pwa-icon-192.png',
  '/assets/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE && (key.startsWith('med-nykuto-class-') || key.startsWith('med-nykuto-shell-'))).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/gestion')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); } return response; }).catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => { if (response.ok && !/\.(?:pptx|docx|pdf)$/i.test(url.pathname)) caches.open(CACHE).then((cache) => cache.put(request, response.clone())); return response; }).catch(() => cached);
    return cached || network;
  }));
});
function safeNotificationTarget(value) {
  try {
    const url = new URL(value || '/turma/s4-e#avisos', self.location.origin);
    if (url.origin !== self.location.origin || !url.pathname.startsWith('/turma/')) return '/turma/s4-e#avisos';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (_) {
    return '/turma/s4-e#avisos';
  }
}
self.addEventListener('push', (event) => {
  let data = { title: 'Med Nykuto', body: 'Hay una actualización importante en tu turma.', url: '/turma/s4-e#avisos' };
  try { data = { ...data, ...event.data.json() }; } catch (error) { if (event.data) data.body = event.data.text(); }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/assets/pwa-icon-192.png', badge: '/assets/pwa-icon-192.png', tag: data.id || 'med-nykuto-alert', renotify: data.priority === 'urgent', data: { url: safeNotificationTarget(data.url) } }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = safeNotificationTarget(event.notification.data?.url);
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => { const existing = windows.find((client) => new URL(client.url).pathname === new URL(target, self.location.origin).pathname); if (existing) return existing.focus().then(() => existing.navigate(target)); return clients.openWindow(target); }));
});
