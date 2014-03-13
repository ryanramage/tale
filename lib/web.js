var fs = require('fs'),
    express = require('express'),
    Appcache = require('./appcache'),
    static_dir = path.resolve(__dirname + '/../html');

module.exports = function(db) {
  var app = express(),
      appcache = new Appcache(db);


  app.use('/story/:story/', express.static(static_dir));

  app.get('/story/:story/story.appcache', function(req, resp){
    resp.type('text/cache-manifest');
    appcache.manifest(req.params.story, resp);
  });

  app.get('/story/:story/meta/package.json', function(req, resp){
    resp.type('application/json');
    appcache.file(req.params.story, 'meta/package.json').pipe(resp);
  })

  app.get('/story/:story/node/:id', function(req, resp){
    resp.type('application/json');
    appcache.file(req.params.story, 'node/' + req.params.id).pipe(resp);
  })

  app.get('/story/:story/key/:id', function(req, resp){
    resp.type('application/json');
    appcache.file(req.params.story, 'key/' + req.params.id).pipe(resp);
  })

  app.get('/story/:story/file/:id', function(req, resp){
    resp.type('application/binary');
    appcache.file(req.params.story, 'file/' + req.params.id).pipe(resp);
  })

  return app;
}