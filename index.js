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


var request_to_horn = function(id){
  var url = "https://integram.org/" + id;
  return request.post({ url: url},function (error, response, body) {
      res.statusCode = error ? 500 : 200;
      res.send( body)
  })

};
app.post('/direct/:id', function(req, res) {
  var id = req.params.id;
  req.pipe( request_to_horn(id) );
})

var textRawParser = bodyParser.text();

app.post('/test-horn/:id', textRawParser , function(req, res) {
  var id = req.params.id;
  var url = "https://integram.org/" + id;
  var raw = req.body;
  var post_json = JSON.stringify({text:raw});
  var stream = require("stream")
  var a = new stream.PassThrough()
  a.write(post_json)

  a.pipe( request_to_horn(id) )
  a.end()
})

app.post('/horn/:id', textRawParser , function(req, res) {
  var id = req.params.id;
  var url = "https://integram.org/" + id;
  var raw = req.body;
  var json = JSON.parse(raw);
  var pre;
  if(json.level=='error' || json.level=='fatal'){
    pre = "👺 "
  }else if( json.level=='info' ){
    pre = "⭐ "
  }else if( json.level=='warning' || json.level=='debug' ){
    pre = "👻 "
  }else{
    pre = "👻 "
  }
  pre += `[${json.level}]`
  var msg = json.message ;
  var link = `${json.url} (${json.project})`
  var post_json = JSON.stringify({text:`${pre} ${msg} \n ${link}`});
  //console.log(post_json);
  var a = new stream.PassThrough()
  a.write(post_json)
  a.pipe( request_to_horn(id) )
  a.end()
})


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})