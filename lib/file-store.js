var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    appcache = require('./appcache');

module.exports = function(story_dir, proof_dir, options) {
  var opts = options || {};
      meta_dir = story_dir,
      keys_dir = path.resolve(story_dir, 'key'),
      node_dir = path.resolve(story_dir, 'node'),
      file_dir = path.resolve(story_dir, 'file')

  mkdirp.sync(proof_dir)
  mkdirp.sync(meta_dir);

  rimraf.sync(keys_dir);
  mkdirp.sync(keys_dir);

  rimraf.sync(node_dir);
  mkdirp.sync(node_dir);

  rimraf.sync(file_dir);
  mkdirp.sync(file_dir);

  function graph(graph, cb) {
    var pipe = fs.createWriteStream( path.resolve(meta_dir, 'story.appcache'));
    appcache.manifest(graph, opts, pipe);

    if (opts.write_index_html){
      if (!fs.existsSync(path.join(story_dir, "index.html"))) {
        fs.createReadStream(path.resolve(__dirname, '../html/index.html' ) )
          .pipe( fs.createWriteStream( path.resolve(story_dir, 'index.html') ) )
      }
    }
    if (opts.write_tale_js) {
      mkdirp.sync( path.resolve(story_dir, 'js') );

      fs.createReadStream(path.resolve(__dirname, '../html/js/tale.min.js' ) )
        .pipe( fs.createWriteStream( path.resolve(story_dir, 'js/tale.min.js') ) )
    }

    return cb();
  }

  function pkg(pkg, cb) {
    fs.writeFile( path.resolve(meta_dir, 'package.json'), JSON.stringify(pkg), cb );
  }

  function proofs(prfs, cb) {
    fs.writeFile( path.resolve(proof_dir, 'proofs.json'), JSON.stringify(prfs, null, 2), cb );
  }

  function keys(id, key, cb){
    fs.writeFile( path.resolve(keys_dir, id), key, cb );
  }
  function node(id, node, cb){
    fs.writeFile( path.resolve(node_dir, id), node, cb );
  }

  function createWriteStream(id) {
    return fs.createWriteStream( path.resolve(file_dir, id) );
  }

  return {
    graph: graph,
    pkg: pkg,
    proofs: proofs,
    keys: keys,
    node: node,
    createWriteStream: createWriteStream
  }
}