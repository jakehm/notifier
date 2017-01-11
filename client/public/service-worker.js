self.addEventListener('push', (event) => {
  

  const content = JSON.parse(event.data.text())

  title  = content.title 
  body = content.body

  event.waitUntil(
    self.registration.showNotification(title, { body})
  )
})