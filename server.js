var express = require('express');
var app = express();
var newrelic = require('newrelic');
var createHandler = require('github-webhook-handler');
var github_handler = createHandler({ path: '/github', secret: process.env.SECRET_TOKEN });

app.all('*', function(req, res, next) {
  //console.log(`Processing for ${req.body}`);
  github_handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  });  
  next();
});

app.listen(4567);
console.log('Listening on port 4567');

github_handler.on('error', function (err) {
  console.error('Error:', err.message);
});

github_handler.on('*', function (event) {
  console.log('Received an event for repo=%s user=%s event=%s',
    event.payload.repository.name,
    event.payload.sender.login,
    event.event);
  newrelic.addCustomParameters({
    "contributor": event.payload.sender.login,
    "contrib_source": 'GitHub',
    "contrib_project": event.payload.repository.name,
    "contrib_repo": event.payload.repository.name,
    "contrib_event": event.event 
  });
  // console.log("\n\n")
  // console.log(JSON.stringify(event));
});