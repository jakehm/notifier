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
let idList = [811198401379495940]
let twitterStream = client.stream(
  'statuses/filter', 
  { follow: idList }
)


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
  const screen_name = content.screen_name
  const subscription = req.body.subscription
  const options = {
    TTL: 24*60*60,
    vapidDetails: {
      subject: 'mailto:jake@lightninging.us',
      publicKey: process.env.PUBLIC_KEY,
      privateKey: process.env.PRIVATE_KEY
    }
  }


  client.get('users/show', { screen_name })
  .then(user => {
    console.log(user.id)  
    setTimeout(() => {
      
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Subcription Confirmation",
          body: "You are now subscribed to push notifications."
        }),
        options
      )
      
      idList.push(user.id)
      twitterStream = client.stream(
        'statuses/filter', 
        { follow: idList.join() }
      )
      
      twitterStream.on('data', event => {
        console.log(event)
        if (event.user.id !== user.id)
          return
        console.log("event matched user.id")
        const message = JSON.stringify({
          title: event.user.screen_name,
          body: event.text
        })

        webpush.sendNotification(
          subscription,
          message,
          options
        )
      })
    }, 0)  
  })
  .catch(err => {
    console.error(err)
  })
  
  res.send('OK')
})

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
