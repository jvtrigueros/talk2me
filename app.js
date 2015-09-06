'use strict'

var Twitter = require('twitter')
  , Firebase = require('firebase')
  , request = require('request')
  , fs = require('fs')

var twitterOpts = require('./twitter') || {}
  , firebaseOpts = require('./firebase') || {}
  , googleOpts = require('./google') || {}

var staticMap = "https://maps.googleapis.com/maps/api/staticmap?&zoom=17&size=400x400&key=" + googleOpts.key + "&markers=size:mid%7Ccolor:red%7C"
var client = new Twitter(twitterOpts)

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type'])
    console.log('content-length:', res.headers['content-length'])

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
  })
}

var ref = new Firebase(firebaseOpts.url)
ref.on('value', function (snapshot) {
  var result = snapshot.val()
  var twitterStatus;

  var tweetMedia = false

  switch(result.mask) {
    case 'sad':
      twitterStatus = "I don't really want to talk right now."
      break
    case 'meh':
      twitterStatus = "Not feeling super talkative but I'll interact."
      break
    case 'happy':
      twitterStatus = "I want to engage! Please come find me and let's chat :)"
      tweetMedia = true
      break
  }

  var updateStatus = function (mediaId) {
    twitterStatus = twitterStatus + '\n\n' + (new Date()).toUTCString()
    var status = {status: twitterStatus, lat: result.lat, long: result.lon}

    if(mediaId)
      status.media_ids = mediaId

    client.post('statuses/update', status, function (err, tweet, res) {
      console.log(tweet.id, tweet.text)
    })
  }

  if(tweetMedia) {
    var downloadUrl = staticMap + result.lat + ',' + result.lon
    download(downloadUrl, 'map.png', function () {
      var data = fs.readFileSync('map.png')
      client.post('media/upload', {media: data}, function (err, media, res) {
        if(!err) {
          updateStatus(media.media_id_string)
        }
      })
    })
  }

})