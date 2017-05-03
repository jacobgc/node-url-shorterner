var Hashids = require('hashids');
var hashids = new Hashids('url_id'); // Used to convert Database ID to 'random' looking string
var r = require('rethinkdbdash')({
    db: "url_shortener"
});

class link {
    constructor(nID, url, shortUrl, isInDB) {
        this.nID = nID;
        this.url = url;
        this.shortUrl = shortUrl;
        this.isInDB = isInDB;
    }

    generateShortUrl() {
        return r.table('urls').getAll(this.url, { // Look to see if he URL is already in the db
            index: "url"
        }).run().then((result) => {
            if (typeof result[0] === 'undefined') { // if it isn't
                return r.table('meta').filter(r.row('type').eq("urlCount")).run() // get the meta for the url count
                    .then((result) => {
                        var currentCount = result[0].value;
                        var nextCount = currentCount + 1;
                        this.shortUrl = hashids.encode(nextCount); // Increase the meta url count
                        this.nID = nextCount;
                        this.isInDB = false;
                        r.table('meta').filter(r.row('type').eq('urlCount')).update({ // update db
                                value: nextCount
                            }).run()
                            .then(() => {
                                return this.shortUrl;
                            });
                    });
            } else { // URL already exists, so copy its data
                console.log("URL exists, returning isInDB = true");
                this.shortUrl = result[0].shortUrl;
                this.nID = result[0].nID;
                this.isInDB = true; // Tells us it's already in the db
                return
            }
        })
    }

    addToDB() {
        return r.table('urls').insert({
            nID: this.nID,
            url: this.url,
            shortUrl: this.shortUrl
        }).run();
    }

    lookup() {
        var this1 = this;
        return new Promise(function (resolve, reject) {
            this1.nID = hashids.decode(this1.shortUrl).join("");
            console.log("Decoded ID =", this1.nID);
            return r.table("urls").getAll(parseInt(this1.nID) | 0 , {
                    index: 'nID'
                }).run()
                .then((result) => {
                    console.log(result);
                    if (typeof result[0] === "undefined") {
                        resolve(false);
                    } else {
                        this1.url = result[0].url;
                        resolve(result[0].url);
                    }
                });
        })
    }
}

module.exports = link