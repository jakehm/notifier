const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const twitter = require('./twitterAPI')
const webpush = require('web-push')

const vapidPublicKey = require('./config').vapidKeys.publicKey
const vapidPrivateKey = require('./config').vapidKeys.privateKey

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

    webpush.sendNotification(
      subscription,
      "test message",
      options
    )
  }, 0)

  res.send('OK')
})

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
