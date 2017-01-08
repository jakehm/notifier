const Twitter = require('twitter')

const config = require('./config')
const client = new Twitter(config.twitter)
const params = { follow: '811198401379495940' }
const stream = client.stream('statuses/filter', params)

stream.on('data', event => {
  console.log(event && event.text)
})

stream.on('error', error => {
  throw error
})

