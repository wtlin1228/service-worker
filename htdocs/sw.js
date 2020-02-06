// Service worker code goes in here!
var cacheVersion = "v5";
var cacheAssets = [
  "/css/global.css",
  "/js/debounce.js",
  "/js/nav.js",
  "/js/attach-nav.js",
  "/img/global/icon-email.svg",
  "/img/global/icon-github.svg",
  "/img/global/icon-linked-in.svg",
  "/img/global/icon-twitter.svg",
  "/img/global/jeremy.svg"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(cacheVersion)
      .then(function(cache) {
        return cache.addAll(cacheAssets);
      })
      .then(function() {
        // This instructs the service worker to immediately fire
        // the activate event after the install event is complete.
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function(event) {
  // Allows the service worker to begin working immediately.

  var cacheWhiteList = ["v5"];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all([
        keyList.map(function(key) {
          if (cacheWhiteList.indexOf(key) === -1) {
            return caches.delete(key);
          }
        }),
        self.clients.claim()
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  var allowedHosts = /(localhost|fonts\.googleapis\.com|fonts\.gstatic\.com)/i;
  var deniedAssets = /(sw\.js|sw-install\.js)$/i;
  var htmlDocument = /(\/|\.html)$/i;

  if (
    allowedHosts.test(event.request.url) === true &&
    deniedAssets.test(event.request.url) === false
  ) {
    if (htmlDocument.test(event.request.url) === true) {
      // Get the latest HTML asset when the internet connection is ok.
      event.respondWith(
        fetch(event.request)
          .then(function(fetchedResponse) {
            var copyFetchedResponse = fetchedResponse.clone();
            caches.open(cacheVersion).then(function(cache) {
              cache.put(event.request, copyFetchedResponse);
            });

            return fetchedResponse;
          })
          .catch(function() {
            return caches.match(event.request);
          })
      );
    } else {
      // Get asset from cacheStorage first.
      // If it's not cached. Fetch it and cache it.
      event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
          return (
            cachedResponse ||
            fetch(event.request).then(function(fetchedResponse) {
              var copyFetchedResponse = fetchedResponse.clone();
              caches.open(cacheVersion).then(function(cache) {
                cache.put(event.request, copyFetchedResponse);
              });

              return fetchedResponse;
            })
          );
        })
      );
    }
  }
});
