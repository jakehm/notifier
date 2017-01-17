require('dotenv').config()
const Twitter = require('twitter')



const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

exports.convertScreenNameToId = (screen_name) => (
  client.get('users/show', { screen_name })
  .then(user => {
    const userId = user.id_str
    console.log("Found userid for "+screen_name)
    console.log(userId)
    return userId
  })
  .catch(err => {
    console.error(err)
  })
)

//takes an array of userIds and returns a promise
exports.stream = (userIds, cb) => {
  const qs = userIds.join()
  return client.stream(
    'statuses/filter', 
    { follow: qs },
    cb
  )
}