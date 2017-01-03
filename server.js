const express = require('express');
const app = express();

const twitter = require('./twitterAPI')

app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
//endpoint is /api/tweets?q=realDonaldTrump
app.get('/api/tweets', (req, res) => {
/*  const param = req.query.q;

  if (!param) {
    res.json({
      error: 'Missing required parameter `q`',
    });
    return;
  }
*/  
  twitter
    .then(tweets => {
      const response = tweets.map(tweet => {
        return { 
          created_at: tweet.created_at, 
          text: tweet.text
        }
      })
      console.log(response)
      res.json(response)

    })

});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
