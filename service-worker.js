const CACHE = 'med-nykuto-shell-v510-s4-dates-r2';
const SHELL = [
  '/offline.html',
  '/med-typography-v509.css?v=509',
  '/turma-shell/',
  '/turma-v471.css?v=488',
  '/turma-v471.js?v=488-s4-dates-r2',
  '/turma-manifest-boot-v471.js?v=478',
  '/public-theme-v485.css?v=486',
  '/public-theme-v485.js?v=485',
  '/calendar-subscription-v485.js?v=485',
  '/assets/pwa-icon-192.png',
  '/assets/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  // This S4-E-only release must not evict another class's offline snapshots or assets.
  event.waitUntil(self.clients.claim());
});
async function cachedResponse(request) {
  const current = await (await caches.open(CACHE)).match(request);
  return current || caches.match(request);
}
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/gestion')) return;

  const isP1VisualAsset = url.pathname === '/p1-micro-visual-50-v507.js'
    || /^\/assets\/p1-micro-practica-pdf-sprite-v508\.part\d{2}$/.test(url.pathname);
  if (isP1VisualAsset) {
    event.respondWith(fetch(request, { cache: 'no-store' }).then((response) => {
      if (!response.ok) return cachedResponse(request).then((cached) => cached || response);
      const copy = response.clone();
      return caches.open(CACHE).then((cache) => cache.put(request, copy)).then(() => response);
    }).catch(() => cachedResponse(request).then((cached) => cached || Response.error())));
    return;
  }

  if (url.pathname === '/data/drive-files.json') {
    event.respondWith(fetch(request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      return caches.open(CACHE).then((cache) => cache.put(request, copy)).then(() => response);
    }).catch(() => cachedResponse(request).then((cached) => cached || new Response('{"schemaVersion":1,"files":[]}', {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    }))));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); } return response; }).catch(async () => {
      const current = await caches.open(CACHE), cached = await current.match(request);
      if (cached) return cached;
      // Use the current S4-E shell before any retained, outdated S4-E navigation.
      if (/^\/turma\/s4-e\/?$/.test(url.pathname)) {
        const shell = await current.match('/turma-shell/');
        if (shell) return shell;
      }
      return (await caches.match(request)) || cachedResponse('/offline.html');
    }));
    return;
  }
  event.respondWith(cachedResponse(request).then((cached) => {
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
