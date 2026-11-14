/* Takip Defteri · service worker: yalnızca bildirim gösterir; sayfaları önbelleğe almaz
   (her açılışta güncel sürüm gelsin diye). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let v = {};
  try { v = e.data ? e.data.json() : {}; } catch (_) { v = { metin: e.data && e.data.text() }; }
  const baslik = v.baslik || 'Takip Defteri';
  e.waitUntil(self.registration.showNotification(baslik, {
    body: v.metin || 'Yeni bir bildiriminiz var.',
    icon: 'ikon-192.png',
    badge: 'ikon-192.png',
    tag: v.id || undefined,
    lang: 'tr',
    data: { hedef: v.hedef || 'bugun' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const hedef = (e.notification.data && e.notification.data.hedef) || 'bugun';
  const url = new URL('./?ac=' + encodeURIComponent(hedef), self.registration.scope).href;
  e.waitUntil((async () => {
    const pencereler = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const p of pencereler) {
      if (p.url.startsWith(self.registration.scope)) {
        p.postMessage({ tur: 'bildirim-ac', hedef });
        return p.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
