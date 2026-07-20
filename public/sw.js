const CACHE_NAME = 'cnes-cache-v2';
const urlsToCache = ['/', '/index.html'];

// Instalação: faz o pré-cache dos arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  // Força o novo SW a assumir o controle imediatamente
  self.skipWaiting();
});

// Rede primeiro, cache como fallback (network-first)
// Isso garante que o usuário sempre veja a versão mais recente
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a rede funcionar, atualiza o cache em background
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta o cache
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});

// Ativação: limpa caches antigos e assume controle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});
