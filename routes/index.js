var express = require('express');
var router = express.Router();
var link = require('../classes/link');
var request = require('request');

router.get('/', function (req, res, next) { // Homepage
  res.render('index', {
    title: 'ι.xyz -- URL Shortener',
    shortUrl: req.query.shortUrl
  });
});

router.get('/show', function (req, res, next) {
      var newLink = new link();
    newLink.url = req.query.url;
    if(typeof newLink.url !== "undefined")
    newLink.generateShortUrl().then(() => {
        console.log("Generated a shortURL", newLink.shortUrl)
        if (newLink.isInDB === false) {
            newLink.addToDB().then(() => {
            });
        }
        res.render('show',{
          title: newLink.shortUrl,
          shortUrl: newLink.shortUrl
        })
    })
});

router.get('/l/*', function (req, res, next) { // Needs to be last
  var newLink = new link();
  var shortUrl = req.url.replace('/l/', '');
  newLink.shortUrl = shortUrl;
  newLink.lookup().then((result) => {
    if (result === false) {
      res.redirect('/');
    } else {
      res.redirect(result);
    }
  });
});

module.exports = router;