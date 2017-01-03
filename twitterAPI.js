const Twitter = require('twitter')
const config = require('./config')

const client = new Twitter(config.twitter)
const params = { screen_name: 'realDonaldTrump' }

module.exports =
  client.get('statuses/user_timeline', params)
      .then(tweets => {
        return tweets
      })
      .catch(error => {
        return error
      })