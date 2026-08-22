const CACHE = 'med-nykuto-class-v457';
const SHELL = [
  '/clase.html',
  '/comunidade.html',
  '/profesores.html',
  '/archivos.html',
  '/grupo-3-v401.css?v=452',
  '/class-courses-2026-08-17-v432.css?v=432',
  '/class-hub-2026-08-21-v440.css?v=455',
  '/class-notebook-v445.css?v=457',
  '/profesores-v445.css?v=445',
  '/archivos-v445.css?v=445',
  '/academic-model-v445.js?v=448',
  '/grupo-3-i18n-v421.js?v=442',
  '/grupo-3-practice-v413.js?v=445',
  '/grupo-3-practice-expansion-v420.js?v=422',
  '/grupo-3-practice-grounded-v426.js?v=431',
  '/grupo-3-practice-2026-08-17-v432.js?v=432',
  '/grupo-3-practice-2026-08-21-v440.js?v=440',
  '/teacher-question-profile-v445.js?v=445',
  '/grupo-3-v401.js?v=448',
  '/class-hub-runtime-v440.js?v=455',
  '/class-notebook-v445.js?v=457',
  '/teacher-profiles-v445.js?v=445',
  '/archivos-v440.js?v=440',
  '/assets/pwa-icon-192.png',
  '/assets/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key.startsWith('med-nykuto-class-')).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response; }).catch(() => caches.match(request).then((cached) => cached || caches.match('/clase.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => { if (response.ok && !/\.(?:pptx|docx|pdf)$/i.test(url.pathname)) caches.open(CACHE).then((cache) => cache.put(request, response.clone())); return response; }).catch(() => cached);
    return cached || network;
  }));
});
self.addEventListener('push', (event) => {
  let data = { title: 'Med Nykuto', body: 'Hay una actualización importante en tu clase.', url: '/clase.html' };
  try { data = { ...data, ...event.data.json() }; } catch (error) { if (event.data) data.body = event.data.text(); }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/assets/pwa-icon-192.png', badge: '/assets/pwa-icon-192.png', tag: data.id || 'med-nykuto-alert', renotify: data.priority === 'urgent', data: { url: data.url || '/clase.html' } }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/clase.html';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => { const existing = windows.find((client) => new URL(client.url).pathname === new URL(target, self.location.origin).pathname); if (existing) return existing.focus().then(() => existing.navigate(target)); return clients.openWindow(target); }));
});
