var CACHE_NAME = "s2-urgent-v1";
var CORE = ["./", "./index.html"];

self.addEventListener("install", function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(CORE);
  }).then(function() {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.map(function(key) {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
  }).then(function() {
    return self.clients.claim();
  }));
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(function(response) {
    var copy = response.clone();
    caches.open(CACHE_NAME).then(function(cache) {
      cache.put(event.request, copy);
    });
    return response;
  }).catch(function() {
    return caches.match(event.request).then(function(cached) {
      return cached || caches.match("./index.html");
    });
  }));
});
