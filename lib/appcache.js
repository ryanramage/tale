var lodash = require('lodash'),
    glob = require('glob');

exports.dir = function(dir, graph, options, pipe, cb){
  var prefix = options.prefix || '';

  pipe.write('CACHE MANIFEST\n\n');
  pipe.write('# ' + graph.id + '\n');
  pipe.write('# ' + graph.version + '\n\n');

  pipe.write('CACHE:\n');

  glob('**/*', {cwd: dir, mark: true }, function(err, files){

    if (err) return cb(err);

    files.forEach(function(file){
      if (file === 'index.html') return;
      if ( /\/$/.test(file))  return // ignore directories (ending in / )

      pipe.write(prefix + file + '\n')
    })

    pipe.write('../bootstrap.js\n')
    pipe.write('../bootstrap.min.css\n')



    pipe.write('\n\nNETWORK:\n')
    pipe.write('*\n');
    pipe.write('http://*\n');
    pipe.write('https://*\n');
    pipe.end();
    cb()
  })



}



exports.manifest = function(graph, options, pipe) {
  var opts = options || {},
      nodes = Object.keys(graph.nodes),
      keys = Object.keys(graph.keys),
      files = Object.keys(graph.files);


  pipe.write('CACHE MANIFEST\n\n');
  pipe.write('# ' + graph.id + '\n');
  pipe.write('# ' + graph.version + '\n\n');


  pipe.write('CACHE:\n');
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
  pipe.write('*\n');
  pipe.write('http://*\n');
  pipe.write('https://*\n');
  pipe.end();
};


