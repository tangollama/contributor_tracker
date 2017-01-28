var express = require('express');
var app = express();
var newrelic = require('newrelic');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/webhook', secret: process.env.SECRET_TOKEN });

app.all('*', function(req, res, next) {
  console.log(`Processing for ${req.body}`);
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  });  
  next();
});

app.listen(4567);

console.log('Listening on port 4567 with secret '+process.env.SECRET_TOKEN);

handler.on('error', function (err) {
  console.error('Error:', err.message);
});

handler.on('*', function (event) {
  console.log('Received an event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.ref,
    event.payload.sender.login);
  newrelic.addCustomParameters({
    "user": event.payload.sender.login,
    "event": event
  });
  console.log(JSON.stringify(event));
});