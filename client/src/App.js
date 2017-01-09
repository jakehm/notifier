import React, { Component } from 'react';
import './App.css';
import urlsafeBase64 from 'urlsafe-base64'

class App extends Component {

  constructor() {
    super()
    
    this.subscribe = this.subscribe.bind(this)

    this.state = {
      isRegistered: false,
      isSubscribed: false
    }
  }

  registerServiceWorker() {
    return navigator.serviceWorker.register('/service-worker.js')
    .then(reg => {
      reg.update()
      console.log('New service worker registered with scope: ' + reg.scope)
      this.setState({isRegistered: true})
    })  
    .catch(err => {
        console.log('Service worker registration failed: ' + err)
    })
  }

  subscribeServiceWorker() {
    const encodedKey = require('../../config.js').vapidKeys.publicKey    
    const decodedKey = urlsafeBase64.decode(encodedKey)
    const vapidPublicKey = new Uint8Array(decodedKey)

    return navigator.serviceWorker.ready
    .then(serviceWorkerRegistration => {
      serviceWorkerRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })
      .then(subscription => {
        this.setState({ isSubscribed: true })
        fetch('/api/register', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription: subscription.toJSON()
          })
        })
      })
    })
  }

  subscribe(e) {

    if ('serviceWorker' in navigator) {
      
      if (!this.state.isRegistered) {
        this.registerServiceWorker()
      }

      if(!this.state.isSubscribed) {
        this.subscribeServiceWorker()
      }

    }
    else {
      console.error('Service workers are not supported in this browser.')
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to Notifier</h2>
        </div>
        <br />
        <button onClick={this.subscribe}>subscribe to Trump's twitter</button>
      </div>
    )
  }
}

export default App;
