/* いまこれ: offline cache. Bump VERSION when files change. */
var VERSION = 'imakore-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  /* network first so updates arrive; fall back to cache when offline */
  e.respondWith(fetch(e.request).then(function(res){
    if (res.ok && new URL(e.request.url).origin === location.origin){ var cp = res.clone(); caches.open(VERSION).then(function(c){ c.put(e.request, cp); }); }
    return res;
  }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); }));
});
