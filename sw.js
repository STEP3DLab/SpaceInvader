importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.skipWaiting();
workbox.core.clientsClaim();

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.routing.registerRoute(({request}) => request.destination === 'image', new workbox.strategies.CacheFirst({cacheName:'images',plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:50,maxAgeSeconds:60*60*24*30})]}));

const FALLBACK_URL = '/offline.html';
workbox.routing.setCatchHandler(async ({event}) => {
  if (event.request.destination === 'document') {
    return caches.match(FALLBACK_URL);
  }
  return Response.error();
});
