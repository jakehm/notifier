self.addEventListener('push', (event) => {
  const content = JSON.parse(event.data.text())

  const title  = 'Donald Trump tweeted:' 
  const body = content.body
  const icon = iconPath

  event.waitUntil(
    self.registration.showNotification(title, { body, icon })
  )
})