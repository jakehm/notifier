const twitterApi = require('./twitterApi')
const test = require('tape')



test('twitter api tests', (t) => {
  
  let expected
  let actual

  expected = '811198401379495940'
  twitterApi.convertScreenNameToId('jake_hm')
  .then(actual => {
    t.equal(actual, expected,
      'convertScreenNameToId should return an id when passed a screen name'
    )
  })


  // twitterApi.stream(['811198401379495940'], stream => {
  // 	t.pass('twitterApi should work when passing a list of one screen name')
  // })

  twitterApi.stream([ '25073877', '811198401379495940' ], stream => {
  	stream.on('data', event => {
  		t.pass('twitterApi should receive data from twitter')
  	})
  })


})