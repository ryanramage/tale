var packager = require('../lib/packager'),
    Serve = require('../lib/serve'),
    levelup = require('levelup'),
    concat = require('concat-stream'),
    sjcl = require('sjcl'),
    test = require('tape');

test('app cache', function(t){
  var dir = 'tests/assets/story1',
      pkg = packager.load_package_json(dir),
      graph = packager.generate_graph(dir, pkg),
      main_db = levelup('/does/not/matter2/ds', { db: require('memdown') })


  packager.store(dir, pkg, graph, main_db, function(err, story_db){

    var server = new Serve(main_db);
    server.appcache(graph.id, concat(function(contents){
      console.log(contents.toString());
      t.end();
    }))
  })

});