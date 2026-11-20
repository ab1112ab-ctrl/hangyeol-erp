// 화면 파일은 휴대폰에 저장해 두고 바로 띄움 + 뒤에서 새 버전 받아 둠 (다음에 열 때 반영)
const C = 'hg-erp';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.json', 'icon-192.png', 'icon-512.png']))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(caches.open(C).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
// 앱 알림 (PC app_push.py → 휴대폰). 누르면 앱의 🔔 알림함이 열림
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (x) { d = { title: '한결연마', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '한결연마', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: './?bell=1' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) { if ('focus' in c) { c.postMessage('bell'); return c.focus(); } }
    return clients.openWindow(e.notification.data.url);
  }));
});
