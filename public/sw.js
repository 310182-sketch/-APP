// Service Worker for notifications and reminders
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || '提醒時間到！',
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FocusBuddy 提醒', options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})