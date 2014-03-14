var Sublevel = require('level-sublevel'),
    Store = require('level-store'),
    lodash = require('lodash');

exports.manifest = function(graph, options, pipe) {
  var opts = options || {},
      nodes = Object.keys(graph.nodes),
      keys = Object.keys(graph.keys),
      files = Object.keys(graph.files);


  pipe.write('CACHE MANIFEST\n\n');
  pipe.write('# ' + graph.id + '\n');
  pipe.write('# ' + graph.version + '\n\n');

  if (opts.js_in_manifest) {
    pipe.write('js/tale.min.js' + '\n');
  }

  pipe.write('package.json' + '\n');
  nodes.forEach(function(node){
    pipe.write('node/' + graph.nodes[node].id + '\n');
  })

  keys.forEach(function(key_name){
    var key = graph.keys[key_name];
    if (key.pass) pipe.write('key/' + key.id + '\n');
  })

  files.forEach(function(file){
    pipe.write('file/' + file + '\n');
  })

  pipe.write('\n\nNETWORK:\n')
  pipe.write('*');
  pipe.end();
};

exports.file = function(main_db, story_id, path) {
  var parts = path.split('/'),
      db = Sublevel(main_db).sublevel(story_id),
      meta_db = db.sublevel('meta'),
      resources_db = Store(db.sublevel('resources')),
      keys_db = db.sublevel('keys'),
      chapters_db = db.sublevel('chapters');

  if (parts.length > 2) return null;

  if (parts[0] === 'node') return chapters_db.createValueStream({start: parts[1], end: parts[1]});
  if (parts[0] === 'key' ) return keys_db.createValueStream({start: parts[1], end: parts[1]});
  if (parts[0] === 'file') return resources_db.createReadStream(parts[1]);
  if (path === 'meta/package.json') return meta_db.createValueStream({start: 'package', end: 'package'});

};

