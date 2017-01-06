import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import client from './client'
import urlsafeBase64 from 'urlsafe-base64'

class App extends Component {

  constructor() {
    super()
    this.state = {
      tweets: [],
      isLoading: true
    }
  }

  componentWillMount() {
    this.getTweets()
    this.startPoll()
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  getTweets() {
    this.setState({ isLoading: true})
    client.get(tweets => {
      console.log("refreshing tweets")
      this.setState({ 
        tweets,
        isLoading: false 
      })
    })
  }

  startPoll() {
    this.timeout = setTimeout(() => {
      this.getTweets()
    }, 15*1000)
  }

  subscribe(e) {
    const encodedKey = require('../../config.js').vapidKeys.publicKey
    const decodedKey = urlsafeBase64.decode(encodedKey)
    const vapidPublicKey = new Uint8Array(decodedKey)

    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('New service worker registered.')
        
        navigator.serviceWorker.ready
        .then(serviceWorkerRegistration => {
          serviceWorkerRegistration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
          })
          .then(subscription => {
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
      })
    }
    else {
      console.error('Service workers are not supported in this browser.')
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Notifier</h2>
        </div>
        {this.state.isLoading && 
          <p>Loading...</p>
        }
        <button onClick={this.subscribe}>subscribe</button>
        <p className="App-intro">
          Tweets
        </p>
        <ul>
          {this.state.tweets.map((tweet, index) => {
            return(
              <li key={index}> 
                <h3>{tweet.created_at}</h3>
                <p>{tweet.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    );
  }
}

export default App;
