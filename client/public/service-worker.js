
self.addEventListener('push', (event) => {
  const content = JSON.parse(event.data.text())

  const title  = content.title 
  const body = content.body

  event.waitUntil(
    self.registration.showNotification(title, { body })
  )
})