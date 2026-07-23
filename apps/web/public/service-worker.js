// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('activate', function(e) {
  self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    });
});
