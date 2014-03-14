var packager = require('../lib/packager'),
    appcache = require('../lib/appcache'),
    concat = require('concat-stream'),
    test = require('tape');

test('app cache', function(t){
  var dir = 'tests/assets/story1',
      pkg = packager.load_package_json(dir),
      graph = packager.generate_graph(dir, pkg);

    appcache.manifest(graph, {}, concat(function(contents){
      console.log(contents.toString());
      t.end();
    }))

});

