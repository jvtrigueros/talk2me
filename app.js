'use strict'

var Twitter = require('twitter')
  , Firebase = require('firebase')

var twitterOpts = require('./twitter') || {}
  , firebaseOpts = require('./firebase') || {}
var client = new Twitter(twitterOpts)

var ref = new Firebase(firebaseOpts.url)
ref.on('value', function (snapshot) {
  var result = snapshot.val()
  var twitterStatus;

  switch(result.mask) {
    case 'sad':
      twitterStatus = "I don't really want to talk right now."
      break
    case 'meh':
      twitterStatus = "Not feeling super talkative but I'll interact."
      break
    case 'happy':
      twitterStatus = "I want to engage! Please come find me and let's chat :)"
      break
  }

  twitterStatus = twitterStatus + '\n\n' + (new Date()).toUTCString()
  client.post('statuses/update', {status: twitterStatus}, function (err, tweet, res) {
    console.log(tweet)
  })
})