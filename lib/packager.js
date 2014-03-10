var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    sjcl = require('sjcl'),
    async  = require('async'),
    uuid = require('node-uuid'),
    ls = require('ls-stream'),
    bops = require('bops'),
    xxtea = require('xxtea-stream'),
    Sublevel = require('level-sublevel'),
    Store = require('level-store'),
    _ = require('lodash');

function packager(indir, outdir) {
  var pkg = packager.load_package_json(indir);

}

packager.load_package_json = function(dir) {
  return require( path.resolve(dir, 'package.json') );
}

packager.load_chaper_json = function(dir) {
  return require( path.resolve(dir, 'chapter.json') );
}

packager.load_start_chaper = function(pkg) {
  var start = pkg.start;
  var keys = Object.keys(start);
  if (keys.length !== 1) throw new Exception('Inproper start chapter');
  var name = keys[0];
  return {
    name: name,
    details: start[name]
  }
}


packager.load_next_chapters = function(chapter) {
  var results = [];
  var next = chapter.next;
  if (!next)return results;
  var keys = Object.keys(next);

  if (keys.length === 0) return results;



  keys.forEach(function(name){
    results.push ({
      name: name,
      details: next[name]
    })
  })
  return results;
}


packager.generate_graph = function(dir, pkg) {


  var queue = [];
  var graph = {
    id: uuid.v4(),
    nodes: {},
    edges: {},
    keys: {}
  }


  var start = packager.load_start_chaper(pkg);
  graph.edges._ =  [start.name];
  graph.nodes[start.name]  = {
    id: uuid.v4(),
    key: crypto.randomBytes(16).toString('base64')
  };
  graph.keys[ '_|' + start.name  ] = {
    pass: start.details.key,
    id: uuid.v4(),
    to: graph.nodes[start.name].id,
    key: graph.nodes[start.name].key
  }
  var chapter =  packager.load_chaper_json( path.resolve(dir, start.name) );
  chapter.name = start.name;
  queue.push(chapter);

  while(queue.length > 0) {
    var next_batch = [];
    queue.forEach(function(cur){
      if (cur.end) return;
      var next_chapters =  packager.load_next_chapters( cur );

      next_chapters.forEach(function(next_chapter){

        if (!graph.nodes[next_chapter.name]) {
          graph.nodes[next_chapter.name]  = {
            id: uuid.v4(),
            key: crypto.randomBytes(16).toString('base64')
          };
        }
        graph.edges[cur.name] = _.union( graph.edges[cur.name], [next_chapter.name] )

        var chapter = packager.load_chaper_json( path.resolve(dir, next_chapter.name) );
        chapter.name = next_chapter.name;

        graph.keys[ cur.name + '|' + next_chapter.name  ] = {
          pass: next_chapter.details.key,
          id: uuid.v4(),
          to: graph.nodes[next_chapter.name].id,
          key: graph.nodes[next_chapter.name].key
        }
        next_batch.push(chapter);
      })
    })
    queue = next_batch;

  }
  return graph;
}

packager.store = function(dir, pkg, graph, maindb, done) {
  var db = Sublevel(maindb).sublevel(graph.id),
      resources_db = Store(db.sublevel('resources')),
      keys_db = db.sublevel('keys'),
      chapters_db = db.sublevel('chapters');

  async.parallel([
    async.apply(store_chapters, dir, graph, chapters_db, resources_db),
    async.apply(store_chapter_keys, graph, keys_db)
  ], function(err){
    done(err, db);
  });
}


function store_chapters(dir, graph, chapters_db, resources_db, done) {

  async.each(Object.keys(graph.nodes), function(node, cb1){
    var chapter_dir = path.resolve(dir, node),
        key = graph.nodes[node].key;

    var files = [];
    ls(chapter_dir).on('data', function(file){
      if (file.stat.isDirectory()) return;
      files.push(file);
    }).on('end', function(){
      console.log('done chapter')
      async.each(files, function(file, cb2) {

        if (path.basename(file.path) === 'chapter.json')
          process_chapter(graph.nodes[node], file, graph, chapters_db, cb2);
        else
          process_file(file, key, resources_db, cb2);

      }, cb1) // end of each files

    }); // on 'end'
  }, done) // async each graph.node
}


function store_chapter_keys(graph, keys_db, done) {
  async.each(Object.keys(graph.keys), function(key, cb){
    var chapter_key = graph.keys[key];
    keys_db.put(chapter_key.id, sjcl.encrypt(chapter_key.pass, JSON.stringify(chapter_key)), cb )
  }, done)
}


function process_chapter(node, file, graph, chapters, cb) {
  var chapter = require(file.path);
  chapter = substitute_next_key_with_id(chapter, graph);
  chapters.put(node.id, sjcl.encrypt(node.key, JSON.stringify(chapter)), cb);
}

function process_file(file, key, resources, cb) {
  fs.createReadStream(file.path)
    .pipe(new xxtea.Encrypt( bops.from(key, 'base64') ))
    .pipe(resources.createWriteStream(file.path))
    .on('close', cb);
}


function substitute_next_key_with_id(chapter, graph) {
  _.each(chapter.next, function(next, name){
    var id = graph.keys[ chapter.name + '|' + name ].id
    delete next.key;
    next.id = id;
  })
  return chapter;
}

module.exports = packager;
