// Service Worker for GuardRoster PWA
const CACHE_NAME = 'guardroster-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        // Only cache assets in production, skip during development
        if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
          console.log('Development mode - skipping asset caching')
          return Promise.resolve()
        }
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker installed')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.log('Service Worker install failed:', error)
        // Continue even if caching fails
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip development server requests
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return
  }

  // Skip Supabase API calls - let them fail gracefully
  if (event.request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache successful responses for offline use
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If network fails and it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            })
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'roster-sync') {
    event.waitUntil(
      // Sync roster data when back online
      syncRosterData()
    )
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  const options = {
    body: 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'guardroster-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options.body = data.body || options.body
      options.title = data.title || 'GuardRoster Alert'
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification('GuardRoster', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

// Helper function to sync roster data
async function syncRosterData() {
  try {
    console.log('Syncing roster data...')
    
    // In a real implementation, this would:
    // 1. Check for offline actions stored in IndexedDB
    // 2. Sync them with the server when back online
    // 3. Update the cache with fresh data
    
    console.log('Roster sync completed')
  } catch (error) {
    console.error('Roster sync failed:', error)
  }
}
