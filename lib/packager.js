var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    sjcl = require('sjcl'),
    async  = require('async'),
    uuid = require('node-uuid'),
    ls = require('ls-stream'),
    bops = require('bops'),
    xxtea = require('xxtea-stream'),
    mime = require('mime'),
    _ = require('lodash');

function packager(dir, package_path, store, cb) {
  var pkg = packager.load_package_json(package_path),
    graph = packager.generate_graph(dir, pkg);

  packager.store(dir, pkg, graph, store, function(err){
    cb(err, graph);
  })
}

packager.load_package_json = function(package_path) {
  return _.cloneDeep(require( package_path ) );
}

packager.load_chaper_json = function(dir) {
  var chapter =  require( path.resolve(dir, 'chapter.json') );
  return _.cloneDeep(chapter);
}

packager.load_start_chaper = function(pkg) {
  var start_folder = pkg.start_folder;
  return {
    name: start_folder,
    details: {}
  }
}


packager.load_next_chapters = function(chapter) {
  var results = [];
  var next_folder = chapter.next_folder;
  if (!next_folder)return results;
  var keys = Object.keys(next_folder);

  if (keys.length === 0) return results;



  keys.forEach(function(name){
    results.push ({
      name: name,
      details: next_folder[name]
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
    keys: {},
    files: {}
  }


  var start = packager.load_start_chaper(pkg);
  graph.edges._ =  [start.name];
  graph.nodes[start.name]  = {
    id: uuid.v4(),
    name: start.name
  };
  graph.keys[ '_|' + start.name  ] = {
    pass: start.details.pass,
    id: uuid.v4(),
    to: graph.nodes[start.name].id
  }
  graph.start = graph.nodes[start.name].id;

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
            name: next_chapter.name,
            id: uuid.v4(),
            key: crypto.randomBytes(16).toString('base64'),
            proof: uuid.v4()
          };
        }
        graph.edges[cur.name] = _.union( graph.edges[cur.name], [next_chapter.name] )

        var chapter = packager.load_chaper_json( path.resolve(dir, next_chapter.name) );
        chapter.name = next_chapter.name;
        graph.keys[ cur.name + '|' + next_chapter.name  ] = {
          pass: next_chapter.details.pass,
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

packager.store = function(dir, pkg, graph, store, done) {

  graph.version = pkg.version;
  pkg.start_id = graph.start;

  var proofs = {};
  Object.keys(graph.nodes).forEach(function(n){
    var d = graph.nodes[n];
    proofs[d.id] = {
      name: d.name,
      proof: d.proof
    }
  })


  async.series([
    async.apply(store_chapters, dir, graph, store),
    async.apply(store_chapter_keys, graph, store),

    function(cb){ store.graph(graph, cb);   },
    function(cb){ store.pkg(pkg, cb);       },
    function(cb){ store.proofs(proofs, cb)  }
  ], function(err){
    done(err);
  });
}


function store_chapters(dir, graph, store, done) {

  async.each(Object.keys(graph.nodes), function(node, cb1){
    var chapter_dir = path.resolve(dir, node),
        key = graph.nodes[node].key;

    var files = [], chapter_files = [];
    ls(chapter_dir).on('data', function(file){
      if (file.stat.isDirectory()) return;
      if (path.basename(file.path) === 'chapter.json') return;
      files.push(file);
    }).on('end', function(){
      async.each(files, function(file, cb2) {


        var id = uuid.v4(),
            ct = mime.lookup(file.path),
            p = file.path.substring(chapter_dir.length + 1);

        chapter_files.push({id: id, content_type: ct, name: p})
        if (key)
          process_file(id, file, graph, key, store, cb2);
        else
          process_first_file(id, file, graph, store, cb2);



      }, function(err){
        if (err) return done(err);

        // do the chapter
        var chapter_json_path = path.resolve(chapter_dir, 'chapter.json');
        if (key)   process_chapter(graph.nodes[node], chapter_json_path, graph, chapter_files, store, cb1)
        else process_first_chapter(graph.nodes[node], chapter_json_path, graph, chapter_files, store, cb1)
      }) // end of each files

    }); // on 'end'
  }, done) // async each graph.node
}


function store_chapter_keys(graph, store, done) {
  async.each(Object.keys(graph.keys), function(key, cb){
    var chapter_key = graph.keys[key];
    if (!chapter_key.pass) return cb();
    var ct = sjcl.encrypt(chapter_key.pass + '', JSON.stringify(chapter_key));
    store.keys(chapter_key.id, ct, cb);
  }, done)
}

function process_first_chapter(node, chapter_json_path, graph, chapter_files, store, cb) {
  var chapter = _.cloneDeep(require(chapter_json_path));
  chapter.name = node.name;
  chapter = substitute_next_key_with_id(chapter, graph);
  chapter.files = chapter_files;
  store.node(node.id, JSON.stringify(chapter), cb);
}

function process_chapter(node, chapter_json_path, graph, chapter_files, store, cb) {
  var chapter = _.cloneDeep(require(chapter_json_path));
  chapter.name = node.name;
  chapter.proof = node.proof;
  chapter = substitute_next_key_with_id(chapter, graph);
  chapter.files = chapter_files;
  store.node(node.id, sjcl.encrypt(node.key, JSON.stringify(chapter)), cb);
}

function process_first_file(id, file, graph, store, cb) {

  graph.files[id] = file.path;

  fs.createReadStream(file.path)
    .pipe(store.createWriteStream(id))
    .on('close', cb);
}

function process_file(id, file, graph, key, store, cb) {

  graph.files[id] = file.path;

  fs.createReadStream(file.path)
    .pipe(new xxtea.Encrypt(bops.from(key, 'base64')))
    .pipe(store.createWriteStream(id))
    .on('close', function verify_file(err){
      if (err) return cb(err);
      fs.stat(file.path, function(err, stats){
        if (err) return cb(err);
        if (stats.size === 0) return cb('file issue: ' + id + ' from ' + file.path + '. Has size 0.');

        cb(err);
      });
    });
}


function substitute_next_key_with_id(chapter, graph) {
  _.each(chapter.next_folder, function(next_folder, name){
    var id = graph.keys[ chapter.name + '|' + name ].id
    delete next_folder.key;
    delete next_folder.pass;
    next_folder.id = id;
  })
  return chapter;
}

module.exports = packager;
