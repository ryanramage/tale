var Sublevel = require('level-sublevel'),
    Store = require('level-store'),
    lodash = require('lodash');

module.exports = Serve;

function Serve(main_db) {
  this._main_db = main_db
}

Serve.prototype.appcache = function(story_id, pipe) {
  var db = Sublevel(this._main_db).sublevel(story_id),
      meta_db = db.sublevel('meta');

  meta_db.get('graph', function(err, graph_j){
    var graph = JSON.parse(graph_j);
    var nodes = Object.keys(graph.nodes),
         keys = Object.keys(graph.keys),
         files = Object.keys(graph.files);


    pipe.write('CACHE MANIFEST\n\n');
    pipe.write('# ' + graph.id + '\n');
    pipe.write('# ' + graph.version + '\n\n');
    nodes.forEach(function(node){
      pipe.write('node/' + graph.nodes[node].id + '\n');
    })

    keys.forEach(function(key){
      pipe.write('key/' + graph.keys[key].id + '\n');
    })

    files.forEach(function(file){
      pipe.write('file/' + file + '\n');
    })


    pipe.end();
  })
};

Serve.prototype.file = function(story_id, path) {
  var parts = path.split('/'),
      db = Sublevel(this._main_db).sublevel(story_id),
      meta_db = db.sublevel('meta'),
      resources_db = Store(db.sublevel('resources')),
      keys_db = db.sublevel('keys'),
      chapters_db = db.sublevel('chapters');

  if (parts.length > 2) return null;

  if (parts[0] === 'node') return chapters_db.createValueStream({start: parts[1], end: parts[1]});
  if (parts[0] === 'key' ) return keys_db.createValueStream({start: parts[1], end: parts[1]});
  if (parts[0] === 'file') return resources_db.createReadStream(parts[1]);

};

