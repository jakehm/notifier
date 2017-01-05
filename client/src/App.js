import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import client from './client'

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
    let endpoint
    navigator.serviceWorker.register('service-worker.js')
    .then(registration => {
      return registration.pushManager.getSubscription()
      .then(subscription => {
        
        if (subscription) {
          return subscription
        }
        
        return registration.pushManager.subscribe({ userVisibleOnly: true })
      })
    }).then(subscription => {
      endpoint = subscription.endpoint

      fetch('/api/register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      })
    }) 
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
