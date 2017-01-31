import React, { Component } from 'react';
import './App.css';
import urlsafeBase64 from 'urlsafe-base64'
import List from './components/List'

import RaisedButton from 'material-ui/RaisedButton'

import Explanation from './components/Explanation'

class App extends Component {

  constructor() {
    super()
    
    this.isLoading = this.isLoading.bind(this)
    this.isNotLoading = this.isNotLoading.bind(this)
    this.handleSubscribe = this.handleSubscribe.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAddTwitter = this.handleAddTwitter.bind(this)
    this.handleDelete = this.handleDelete.bind(this)

    this.state = {
      isRegistered: false,
      isSubscribed: false,
      isLoading: false,
      twitterValue: 'realDonaldTrump',
      content: null,
      twitterList: []
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
            screenNameList: this.state.twitterList
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

  handleSubscribe(event) {
    event.preventDefault()
    console.log("entering handleSubscribe")
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker()
      .then(()=> {
        return this.subscribeServiceWorker()
      }).then(() => {
        const subscribedList = this.state.twitterList
        this.setState({
          twitterList: [],
          subscribedList: subscribedList
        })
    
      })

    } else {
      console.error('Service workers are not supported in this browser.')
    }
  }

handleAddTwitter(event) {
  this.setState({
    twitterList: [...this.state.twitterList, this.state.twitterValue],
    twitterValue: ""
  })
}

handleDelete(index, event) {
  event.preventDefault()
  const twitterList = this.state.twitterList.filter((e, i) => {
    return index !== i
  })

  this.setState({
    twitterList: twitterList
  })
}

render() {

  return (
    <div className="App">
    <div className="App-header">
    <h2>Welcome to Notifier</h2>
    </div>
    <br />
    {this.state.isLoading &&
      <p>Loading...</p>
    }
    <label> Screen name: <span>&nbsp;</span>
    <input type="text" 
    value={this.state.twitterValue}
    onChange={this.handleChange}
    style={{padding: 10}}
    />
    </label>
    <RaisedButton onClick={this.handleAddTwitter} style={{margin:10}} 
      label="Add"
    />
    <br />
    <br />
    <List items={this.state.twitterList} onSubscribe={this.handleSubscribe} 
      onDelete={this.handleDelete}
    />
    {this.state.subscribedList &&
    <div>
      <br />
      <p>You are subscribed to 
        {this.state.subscribedList.map((e, i, array) => (
          <span key={i}>
            {array.length>2 && i>0 && <span>,</span>}
            {array.length===(i+1) && i>0 && <span>&nbsp;and</span>}
            &nbsp;<b>{e}</b>
            {array.length===(i+1) && <span>.</span>}
          </span>
        ))}
      </p> 
    </div>
    }
      <Explanation />
    </div>
    )
}
}

export default App;
