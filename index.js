"use strict"

var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var stream = require("stream")
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('OK')
})

app.post('/horn/:id', function(req, res) {
  var id = req.params.id;
  var url = "https://integram.org/" + id;
  req.pipe(request.post({ url: url},function (error, response, body) {
      res.statusCode = error ? 500 : 200;
      res.send(body)
  }));
})

var textRawParser = bodyParser.text();
var jsonParser = bodyParser.json();

app.post('/test-horn/:id', textRawParser , function(req, res) {
  var id = req.params.id;
  var url = "https://integram.org/" + id;
  var raw = req.body;
  console.log(raw);
  var post_json = JSON.stringify({text:raw});
  var stream = require("stream")
  var a = new stream.PassThrough()
  a.write(post_json)
  a.end()

  a.pipe(
    request.post({ url: url},function (error, response, body) {
        res.statusCode = error ? 500 : 200;
        res.send(raw)
    })
  )
})

app.post('/json-horn/:id', textRawParser , function(req, res) {
  var id = req.params.id;
  var url = "https://integram.org/" + id;
  var raw = req.body;
  var json = JSON.parse(raw);
  //console.log(json);
  var pre;
  if(json.level=='error'){
    pre = "👺 "
  }else if( json.level=='info' ){
    pre = "⭐ "
  }else{
    pre = "👻 " + `[${json.level}]`
  }
  var type = json.level;
  var msg = json.message;
  var post_json = JSON.stringify({text:`${pre} ${msg} \n ${json.url}`});
  //console.log(post_json);
  var a = new stream.PassThrough()
  a.write(post_json)

  a.pipe(
    request.post({ url: url},function (error, response, body) {
        res.statusCode = error ? 500 : 200;
        res.send(post_json)
    })
  )
  a.end()
})


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})