// Uncomment the lines below to set up the cache files
//
const CACHE_NAME = 'my-site-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v2';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/images/icons/icon-72x72.png',
  '/assets/images/icons/icon-96x96.png',
  '/assets/images/icons/icon-128x128.png',
  '/assets/images/icons/icon-144x144.png',
  '/app.js'
];

// Install the service worker
// YOUR CODE HERE
self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
})

// Activate the service worker and remove old data from the cache
// YOUR CODE HERE
self.addEventListener('activate', function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
})

// Intercept fetch requests
// YOUR CODE HERE
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
          caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
              return fetch(evt.request)
                .then(response => {
                  if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                  }
    
                  return response;
                })
                .catch(err => {
                  return cache.match(evt.request);
                });
            })
            .catch(err => console.log(err))
        );
    
        return;
      } 
        evt.respondWith(
          fetch(evt.request).catch(function() {
            return caches.match(evt.request).then(function(response) {
              if (response) {
                return response;
              } else if (evt.request.headers.get('accept').includes('text/html')) {
                // return the cached home page for all requests for html pages
                return caches.match('/');
              }
            });
          })
        );
      

})
