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
const db = promisify(level('notify.db',
  { valueEncoding: 'json' }))

function generateIdList(db) {
  return new Promise((resolve, reject) => {
    let idList = []
    db.createReadStream()
      .on('data', data => {
        console.log("data from read stream:")
        console.log(data)
        idList.push(data.key)
      })
      .on('error', error => {
        console.log ('there was an error while reading the db', error)
        reject(error)
      })
      .on('end', () => {
        console.log('done reading from the db')
        resolve(idList)
      })
  })
}
  
//keep this in global scope so that I can check 
//if the stream is has already been turned on
let twitterStream
function initiateTwitterStream(db) {

  if (twitterStream) {
    console.log('destroying twitter stream before initialization')
    twitterStream.destroy()
  }

  console.log('initializing twitter stream')
  return generateIdList(db).then(idList => {
    if (idList.length === 0)
      return
    console.log('initializing twitter stream')
    console.log('idList=')
    console.log(idList)
    Twitter.stream(idList, stream => {
      console.log("stream successfully initialized")
      twitterStream = stream
      stream.on('data', event => {
        const userId = event.user.id_str

        //a lot of tweets come in on the stream from people replying
        //to the followed userId.  This ignores those. 
        if (idList.indexOf(userId) === -1)
          return

        db.get(event.user.id_str)
          .then(subscriptions => {
            console.log("found subscriptions associated with stream data")
            console.log("subscriptions count = ", subscriptions.length)
            subscriptions.forEach(subscription => {
              console.log("pushing subscription")
              const message = JSON.stringify({
                title: event.user.screen_name,
                body: event.text
              })
              webpush.sendNotification(
                subscription,
                message,
                options
              ).then(data => {
                console.log("webpush ok with statuscode: ", data.statusCode)
              }).catch(err => {
                console.log("the web push fucked up, statuscode: ", err.statusCode)
                if (err.statusCode == 410)
                  console.log("Subscription not registered.  Deleting...")
                  db.put(userId, subscriptions.filter(sub => {
                    return sub != subscription
                  }))
                  .then(data => {
                    console.log("unregistered subscription was deleted")
                  })
                  .catch(err => {
                    console.log("deleting didn't work.  here's the error: ")
                    console.log(err)
                  })
              })
            })
          })
          .catch(error => {
            console.log("something went wrong, userId not found in db")
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
  const screenNames = req.body.screenNameList
  const subscription = req.body.subscription

  function sendConfirmation(subscription) {
    webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Subcription Confirmation",
        body: "You are now subscribed to push notifications."
      }),
      options
    )
  }

  function addScreenNames(screenNames) {
    return Promise.all(screenNames.map(screenName => {
      return addScreenName(screenName)
    })).then(() => {
      return initiateTwitterStream(db)
    }).then(() => {
      return sendConfirmation(subscription)
    }).then(() => {
      res.send('OK')
    }).catch((error) => {
      console.log(error)
    })
  }

  function addScreenName(screen_name) {
    let userId
     return Twitter.convertScreenNameToId(screen_name)
      .then(_userId => {
        userId = _userId
        return db.get(userId)
      })
      .then(subList => {
        console.log('sublist found on userId: ')
        console.log(subList)
        if (subList.indexOf(subscription) === -1) {
          console.log("userId found, but that subscription does not exist for it yet")
          subList.push(subscription)
          console.log("printing new sublist: " + subList)
          return db.put(userId, subList)
        } else {
          console.log("subscription already found in ")
          console.log(subList)
        }
      }).catch(err => {
        console.log("no subs found for that userid, making new entry in db")
        return db.put(userId, [subscription])
      })
  }

  addScreenNames(screenNames)
})



app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
