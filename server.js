var express = require('express'),
    impact = require('impact');
  
var server = express.createServer();

server.configure(function(){
  server.set('views', __dirname + '/views');
  server.use(express.methodOverride());
  server.use(express.bodyDecoder());
  server.use(server.router);
});

server.get('/', function(req, res){
  res.render('index.ejs', {
    locals: { title: 'Example node-impact server' }
  });
});

server.get('/edit', function(req, res){
  res.render('weltmeister.ejs', {
    locals: { title: 'Example node-impact server' }
  });
});

var im = impact.listen(server, { root: __dirname + '/public' });
server.use(express.staticProvider(im.root));
server.listen(8080);