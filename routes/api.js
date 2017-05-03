var express = require('express');
var router = express.Router();
var link = require('../classes/link');
var validURL = require('valid-url');

router.post('/shorten', function (req, res, next) {
    var newLink = new link();
    newLink.url = req.body.url;
    if(typeof newLink.url !== "undefined")
    newLink.generateShortUrl().then(() => {
        console.log("Generated a shortURL", newLink.shortUrl)
        if (newLink.isInDB === false) {
            newLink.addToDB().then(() => {
            });
        }
        res.send(newLink.shortUrl);
    })
});

router.post('/lookup', function (req, res, next) {
    var newLink = new link();
    newLink.shortUrl = req.body.shortUrl;
    newLink.lookup().then((result)=>{
        if(result === false){
            res.send('false');
        }else{
            res.send(result);
        }
    });

});

module.exports = router;