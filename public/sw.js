// BuddyGolf service worker: shows push notifications and opens the right
// screen when one is tapped. No offline caching.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'BuddyGolf', body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'BuddyGolf', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/badge-96.png',
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (open) return open.focus().then(() => open.navigate(url))
      return self.clients.openWindow(url)
    }),
  )
})
