const cacheName = 'v1'
const cacheFiles = [
  '/',
  '/index.html'
]


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(cacheFiles))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const promises = cacheNames.map(item => {
          if (item !== cacheName) return caches.delete(item)
        })

        return Promise.all(promises)
      })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => console.log('[ServiceWorker]: Error Fetching & Caching New Data', err))
  )
})
