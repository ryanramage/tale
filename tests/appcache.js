var packager = require('../lib/packager'),
    Appcache = require('../lib/appcache'),
    async = require('async'),
    levelup = require('levelup'),
    concat = require('concat-stream'),
    bops = require('bops'),
    xxtea = require('xxtea-stream'),
    sjcl = require('sjcl'),
    test = require('tape');

test('app cache', function(t){
  var dir = 'tests/assets/story1',
      pkg = packager.load_package_json(dir),
      graph = packager.generate_graph(dir, pkg),
      main_db = levelup('/does/not/matter2/ds', { db: require('memdown') });


  packager.store(dir, pkg, graph, main_db, function(err, story_db){

    var appcache = new Appcache(main_db);
    appcache.manifest(graph.id, concat(function(contents){
      console.log(contents.toString());
      t.end();
    }))
  })

});

test('file serving', function(t){
  var dir = 'tests/assets/story1',
      pkg = packager.load_package_json(dir),
      graph = packager.generate_graph(dir, pkg),
      main_db = levelup('/does/not/matter3', { db: require('memdown'), encoding : 'binary' });


  packager.store(dir, pkg, graph, main_db, function(err, story_db){

    var appcache = new Appcache(main_db);

    async.parallel([
      function(cb){
        // test the node
        var node = 'node/' + graph.nodes[Object.keys(graph.nodes)[0]].id;
        appcache.file(graph.id, node).pipe(concat(function(contents){
          //console.log(contents.toString());
          cb();
        }));

      },
      function(cb){
        // test the key
        var key = 'key/' + graph.keys[Object.keys(graph.keys)[0]].id;
        appcache.file(graph.id, key).pipe(concat(function(contents){
          //console.log(contents.toString());
          cb()
        }));
      },
      function(cb){
        // test a file
        var decryption_key = graph.nodes['chapter1'].key;

        var file = 'file/' + Object.keys(graph.files)[0];



        appcache.file(graph.id, file)
          .pipe(new xxtea.Decrypt( bops.from(decryption_key, 'base64') ))
          .pipe(concat(function(contents){
            console.log(contents.toString('utf-8'));
            cb()
        }));
      }
    ], function(){
      t.end();
    })

  })

})