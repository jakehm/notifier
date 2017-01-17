require('dotenv').config({ 
  silent: process.env.NODE_ENV === 'production',
})

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const Twitter = require('./twitterApi')
const webpush = require('web-push')

//using this janky database module because I don't want to have a separate process just for db
const level = require('level')
const  promisify = require('then-levelup')

//thee are webpush notification options
const options = {
  TTL: 24*60*60,
  vapidDetails: {
    subject: 'mailto:jake@lightninging.us',
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  }
}

// init db
const db = promisify(level('notify.db', { valueEncoding: 'json' }))

//keep these in global scope so that I can end the stream from outside the function
let twitterStream

function initiateTwitterStream(db) {
  let idList = []
  db.createReadStream()
    .on('data', data => {
      console.log("data from read stream:")
      console.log(data)
      idList.push(data.key)
    })
    .on('error', error => {
      console.log ('there was an error while reading the db', error)
    })
    .on('end', () => {
      if (idList.length === 0)
        return

      console.log('done reading from the db')
      Twitter.stream(idList, stream => {
        twitterStream = stream
        stream.on('data', event => {
          console.log("got data from stream")
          db.get(event.user.id_str)
            .then(subscriptions => {
              console.log("found subscriptions associated with stream data")
              for (const subscription of subscriptions) {
                const message = JSON.stringify({
                  title: event.user.screen_name,
                  body: event.text
                })
                webpush.sendNotification(
                  subscription,
                  message,
                  options
                )
              }
            })
        })
      })
    })
}

initiateTwitterStream(db)

app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.use(bodyParser.json())



//primary api
app.post('/api/register', (req, res) => {
  const screen_name = req.body.screen_name
  const subscription = req.body.subscription
  
  //ugly higher scope variable because I need to access 
  //the return of a promise further down in the promise chain
  let userId

  Twitter.convertScreenNameToId(screen_name)
    .then(_userId => {
      userId = _userId
      return db.get(userId)
    })
    .then(subList => {
      if (subList.indexOf(subscription) === -1) {
        const newSubList = subList.push(subscription)
        console.log("printing new sublist: " + newSubList)
        return db.put(userId, newSubList)
      } else {
        console.log("subscription already found in ")
        console.log(subList)
      }
    }).catch(err => {
      console.log("no subs found for that userid, making new entry in db")
      return db.put(userId, [subscription])
    }).then(() => {
      console.log("twitterStream:")
      console.log(twitterStream)
      if (twitterStream)
        twitterStream.destroy()

      initiateTwitterStream(db)
    })
  console.log("about to push confirmation notification")
  console.log("subscription:")
  console.log(subscription)
  webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: "Subcription Confirmation",
      body: "You are now subscribed to push notifications."
    }),
    options
  )
 
  res.send('OK')
})



app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
