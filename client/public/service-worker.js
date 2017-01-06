self.addEventListener('push', function(event) {
  event.waitUntil(
    self.registration.showNotification('Service Worker Test', {
      body: 'test test test'
    })
  )
})