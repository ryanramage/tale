var Sublevel = require('level-sublevel'),
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