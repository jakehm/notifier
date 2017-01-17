import React, { Component } from 'react';
import './App.css';
import urlsafeBase64 from 'urlsafe-base64'

class App extends Component {

  constructor() {
    super()
    
    this.isLoading = this.isLoading.bind(this)
    this.isNotLoading = this.isNotLoading.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      isRegistered: false,
      isSubscribed: false,
      isLoading: false,
      twitterValue: 'realDonaldTrump',
      content: null

    }
  }

  isLoading() {
    this.setState({ isLoading: true })
  }
  isNotLoading() {
    this.setState({ isLoading: false })
  }

  registerServiceWorker() {
    this.isLoading()
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
    const encodedKey = "BFZv8KVT8NiY62iAMpISqs2Y-GY6YZI5I24CUDq-DEhfhASgf2nOqPIGAO4i8ulf_GPtWd3F_yf0CPFdtC7f5Ik"
    const decodedKey = urlsafeBase64.decode(encodedKey)
    const vapidPublicKey = new Uint8Array(decodedKey)
    this.isLoading()

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
            subscription: subscription.toJSON(),
            screen_name: this.state.twitterValue
          })
        })
        .then(response => {
          this.isNotLoading()  
        })
      })
      .catch(err => {
        this.isNotLoading()
        console.error(err)
      })
    })
  }

  handleChange(event) {
    this.setState({twitterValue: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault()

    if ('serviceWorker' in navigator) {
      
      if (!this.state.isRegistered) {
        this.registerServiceWorker()
        .then(()=> {
          if(!this.state.isSubscribed) {
            this.subscribeServiceWorker()
          }
        })
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
        <h2>How this works</h2>  Not working with Safari.  <br />
        Enter the twitter screen name of someone you want notifications for.  Like maybe if you want the US President's tweets to go straight to your phone notifications.
        <br />
        <br />
        {this.state.isLoading &&
          <p>Loading...</p>
        }
        <form onSubmit={this.handleSubmit}>
          <label> Screen name:
            <input type="text" 
              value={this.state.twitterValue}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Subscribe" />
        </form> 
      </div>
    )
  }
}

export default App;
