var fs = require('fs'),
    express = require('express'),
    packager = require('./packager'),
    Appcache = require('./appcache'),
    levelup = require('levelup'),
    _ = require('lodash'),
    template = _.template( fs.readFileSync('./html/story.ejs.html', 'utf-8') ),
    app = express(),
    dir = 'tests/assets/story1',
    pkg = packager.load_package_json(dir),
    graph = packager.generate_graph(dir, pkg),
    main_db = levelup('/does/not/matter2/ds', { db: require('memdown') }),
    port = process.env.PORT || 8559,
    appcache;

packager.store(dir, pkg, graph, main_db, function(err, story_db){
  console.log('story available at: http://localhost:' + port + '/story/' + graph.id + '/')
  appcache = new Appcache(main_db);
})


app.use( '/', express.static('./html'));




app.get('/story/:story/', function(req, resp){
  var story_id = req.params.story;
  resp.send(template({story_id: story_id}));
})

app.use('/story/:story/', express.static('./html'));

app.get('/story/:story/story.appcache', function(req, resp){
  resp.type('text/cache-manifest');
  appcache.manifest(req.params.story, resp);
});

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

app.get('/story/:story/meta/package.json', function(req, resp){
  resp.type('application/json');
  appcache.file(req.params.story, 'meta/package.json').pipe(resp);
})



app.listen(port);
console.log('started on port', port);