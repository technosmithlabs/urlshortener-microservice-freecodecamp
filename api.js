const dns = require("dns");
var mongoose = require("mongoose");

// Making connection
mongoose.connect(
  "mongodb+srv://anshulgammy:anshulgammy@cluster0-dvhlk.mongodb.net/test?retryWrites=true&w=majority"
);
// Getting reference to database
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// Defining Schema
const URLEntrySchema = mongoose.Schema({
  hash: String,
  shortURL: String,
  originalURL: String,
});

// Compiling schema to model
const URLEntry = mongoose.model("URLEntry", URLEntrySchema, "URL-Entires");

var webService = function (app, bodyParser) {
  app.post("/api/shorturl/new", (req, res, next) => {
    app.use(bodyParser.json());
    var reqUrl = null;
    try {
      reqUrl = new URL(req.body.url);
    } catch (err) {
      res.json({ error: "invalid URL" });
      next();
    }
    dns.lookup(reqUrl.hostname, (err, address, family) => {
      if (err) {
        console.log(err);
        res.json({ error: "invalid URL" });
      } else {
        var hash = Math.random().toString(36).slice(2);
        var URLEntry = new URLEntry({
          hash: hash,
          shortURL: hash,
          originalURL: reqUrl,
        });
        URLEntry.save((err, done, data) => {
          if (err) console.log(err);
          done(null, data);
        });
        res.json({ original_url: reqUrl, short_url: URLEntry.shortURL });
      }
    });
  });
};

exports.webService = webService;
