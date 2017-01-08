const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const twitter = require('./twitterAPI')

const Twitter = require('twitter')
const webpush = require('web-push')

const vapidPublicKey = require('./config').vapidKeys.publicKey
const vapidPrivateKey = require('./config').vapidKeys.privateKey


//set up the twitter stream
const config = require('./config')
const client = new Twitter(config.twitter)
const params = { follow: '811198401379495940' }
const twitterStream = client.stream('statuses/filter', params)


app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.use(bodyParser.json())

//endpoint is /api/tweets?q=realDonaldTrump
app.get('/api/tweets', (req, res) => {
  twitter
    .then(tweets => {
      const response = tweets.map(tweet => {
        return { 
          created_at: tweet.created_at, 
          text: tweet.text
        }
      })
      res.json(response)
    })

});


app.post('/api/register', (req, res) => {
  const subscription = req.body.subscription
  
  setTimeout(() => {
    const options = {
      TTL: 24*60*60,
      vapidDetails: {
        subject: 'mailto:jake@lightninging.us',
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey
      }
    }
    
    twitterStream.on('data', event => {
      const message = JSON.stringify({
        body: event.text
      })

      webpush.sendNotification(
        subscription,
        message,
        options
      )
    })

    twitterStream.on('error', error => {
      throw error
    })
  
  }, 0)

  res.send('OK')
})

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
