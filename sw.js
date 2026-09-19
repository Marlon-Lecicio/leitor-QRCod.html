// Service worker mínimo — necessário para o Chrome/Android oferecer "Instalar app".
// Faz cache básico do app shell para abrir mais rápido; a lógica de dados
// continua sempre buscando informação nova do backend (fetch normal).

const CACHE_NAME = 'controle-veiculos-v2';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Só intercepta pedidos do próprio app (GET); tudo que for pro backend (Apps Script)
  // passa direto pela rede, nunca é servido do cache, pra sempre pegar dado atual.
  if (event.request.method !== 'GET' || event.request.url.indexOf('script.google.com') !== -1) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
