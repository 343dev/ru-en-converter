import './converter'

/**
 * ServiceWorker
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('serviceWorker.js', { scope: './' })
    // .then(() => console.log('[ServiceWorker]: Registered'))
    // .catch(error => console.log('[ServiceWorker]: Registration error', error))
}
