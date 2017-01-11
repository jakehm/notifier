require('dotenv').config({ 
  silent: process.env.NODE_ENV === 'production',
})

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const Twitter = require('twitter')
const webpush = require('web-push')

//set up the twitter stream
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
const params = { follow: '811198401379495940' }
const twitterStream = client.stream('statuses/filter', params)


app.set('port', (process.env.PORT || 3001));

//force heroku to use ssl
app.get('*', function(req,res,next) {
  if(req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
});


// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.use(bodyParser.json())

app.post('/api/register', (req, res) => {
  const content = req.body.content
  client.get('users/show', { screen_name: content.screen_name })
  .then(user => {
    console.log(user.id)  
  })
  .catch(err => {
    console.error(err)
  })
  const subscription = req.body.subscription
  
  setTimeout(() => {
    const options = {
      TTL: 24*60*60,
      vapidDetails: {
        subject: 'mailto:jake@lightninging.us',
        publicKey: process.env.PUBLIC_KEY,
        privateKey: process.env.PRIVATE_KEY
      }
    }

    webpush.sendNotification(
      subscription,
      "You are now signed up for notifications.",
      options
    )

    
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
