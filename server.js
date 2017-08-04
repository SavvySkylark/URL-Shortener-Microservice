// require modules 
var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var shortid = require('shortid');

//init express server
var app = express();
var pw = encodeURIComponent('skyMAN112#FrE12');
var mongoUrl = 'mongodb://SavvySkylark:' + pw + '@ds133162.mlab.com:33162/freecodecamp';

var mongoCache;
var serverDomainName = "https://square-hovercraft.glitch.me/";
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/new/*", function (req, res) {
  var urlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
  var resPayload;
  var url = req.params[0];
  //console.log(urlRegex.test(req.params[0]));
  if (urlRegex.test(url)) {
    mongoClient.connect(mongoUrl, function(err, db) {
      if (err) {
        res.statusCode = 400;
        res.statusMessage = "invalid uri parameter";
        resPayload = {error: "internal Server Error"};
        console.error('failed to connect to freecodecamp db');
        res.end(JSON.stringify(resPayload));
      } else {
        var urlsCol = db.collection('urls');
        console.log('connected to db');
        urlsCol.find({original_url: url}).limit(1).toArray(function(err, docs) {
          if(docs.length === 0) {
            var urlDoc = {
              original_url: url,
              short_url: serverDomainName + shortid.generate()
            }
            urlsCol.insertOne(urlDoc, function(err, result) {
              if (err) {
                console.error('insert failed');
                resPayload = {error: "Internal Server Error"};
                res.end(JSON.stringify(resPayload));
              } else {
                resPayload = urlDoc;
                res.end(JSON.stringify(resPayload));
              }
              db.close();
            });
          } else {
            resPayload = {
              original_url: docs[0].original_url,
              short_url: docs[0].short_url
            };
            res.end(JSON.stringify(resPayload));
          }
        });
      }
    });
      
  } else {
    console.log(url);
    res.statusCode = 400;
    res.statusMessage = "invalid uri parameter";
    resPayload = {error: "Wrong url format, make sure you have a valid protocol and real site."};
    res.end(JSON.stringify(resPayload));
  }
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
