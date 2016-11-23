exports.initialize = initialize;
exports.build = build;

var fs = require('fs'),
    url = require('url'),
    cpr = require('cpr'),
    path = require('path'),
    uuid = require('uuid'),
    read = require('read'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    browserify = require('browserify'),
    init = require('init-package-json'),
    packager = require('./lib/packager'),
    app_cache = require('./lib/appcache'),
    FileStore = require('./lib/file-store');


function initialize(dir){

  var initFile = require.resolve('./lib/init-prompt.js')

  init(dir, initFile, function (err, data) {

    if (err) return console.error('could not write package.json');

    var dist_dir = path.resolve(dir, 'dist'),
        build_dir = path.resolve(dist_dir, 'build'),
        tale_dir = path.resolve(dir, 'tale'),
        npm_dst = path.resolve(dir, 'node_modules'),

        loader_js_src = path.resolve(__dirname, './html/js/loader.js' )
        loader_js_dst  = path.resolve(dir, 'index.js'),
        index_html_src = path.resolve(__dirname, './html/index.html' ),
        index_html_dst = path.resolve(dist_dir, 'index.html'),
        bootstrap_js_src = path.resolve(__dirname, './html/js/bootstrap.js' ),
        bootstrap_js_dst = path.resolve(dist_dir, 'bootstrap.js' ),
        bootstrap_css_src = path.resolve(__dirname, './html/css/bootstrap.min.css' ),
        bootstrap_css_dst = path.resolve(dist_dir, 'bootstrap.min.css' ),

    mkdirp.sync( build_dir );
    mkdirp.sync( tale_dir );
    mkdirp.sync( npm_dst );


    async.parallel([
      make_chapters.bind(null, tale_dir),
      fast_copy.bind(null, loader_js_src, loader_js_dst),
      fast_copy.bind(null, index_html_src, index_html_dst),
      fast_copy.bind(null, bootstrap_js_src, bootstrap_js_dst),
      fast_copy.bind(null, bootstrap_css_src, bootstrap_css_dst)
    ], function(err){
      if (err) return console.log(err);
      console.log('installing modules...');
      npm_install(['tale-browser', 'tale-plugin-markdown'], function(err){
        if (err) return console.log(err);

        oboe_hack(npm_dst, function(){
          console.log('done');
        })
      })
    })
  })
}


function build(dir, proof_dir){
  var loader_js_path  = path.resolve(dir, 'index.js'),
      package_path = path.resolve(dir, 'package.json'),
      dist_dir = path.resolve(dir, 'dist'),
      build_dir = path.resolve(dist_dir, 'build'),
      browserify_dst_path = path.resolve(build_dir, 'tale.js'),
      app_cache_dst_path = path.resolve(build_dir, 'story.appcache'),
      tale_dir = path.resolve(dir, 'tale'),
      proof_dir = proof_dir || path.resolve(dir, './proofs'),
      file_store = FileStore(path.normalize(build_dir), path.normalize(proof_dir), {});
  console.log('starting...')
  console.log('building tale dir', tale_dir)
  packager( path.normalize(tale_dir), package_path, file_store, function(err, graph){
    if (err) return console.error("Error:", err);
    console.log('building tale complete')
    console.log('browserify ', loader_js_path)
    browserify_index(loader_js_path, browserify_dst_path, function(err){
      if (err) return console.log(err);

      app_cache.dir(build_dir, graph, {}, fs.createWriteStream(app_cache_dst_path), function(err){
        if (err) return console.log(err);
        console.log('\tbuild dir: ', build_dir);
        console.log('\tproof dir: ', proof_dir);
        console.log("Build complete. ");
      })
    })


  })
}



function make_chapters(tale_dir, cb) {
  read({prompt: "Number of chapters to create? ", default: "2" }, function (err, num) {
    if (err) cb('I did not understand that.');

    var num_chapters = Number(num);
    async.times(num_chapters, function(n, cb){
      var human = n + 1;
      var end = (human == num_chapters);
      writeChapter(human, end, tale_dir, cb);
    }, cb)
  })
}


function writeChapter(number, end, dir, cb){
  var chapter = {
    "markdown":true,
    "next_folder": {}
  }, next_folder = {
    "clue": "What is the password?",
    "pass": uuid.v4().substr(0,5)
  };

  if (end) {
    chapter.text = "The End. Fin."
    chapter.end_link = "http://place.com/whats_next"
  } else {
    chapter.next_folder[ 'chapter' + (number + 1) ] = next_folder;
  }
  var chapter_dir = path.resolve(dir, 'chapter' + number);
  mkdirp.sync( chapter_dir );
  fs.writeFileSync( path.resolve(chapter_dir, 'README.md'), 'Once upon a time...')
  fs.writeFile( path.resolve(chapter_dir, 'chapter.json') , JSON.stringify(chapter,null, 4), cb);
}

function npm_install(packages, cb){
  var npm = require("npm")
  npm.on('log', function(){})
  npm.load(function (err) {
    if (err) return cb(err);
    npm.commands.install(packages, cb);
  });
}

function oboe_hack(npm_dir, cb){
  var to_hack = path.resolve(npm_dir, 'tale-browser/node_modules/tale-read-api/node_modules/oboe/package.json')
  var json = require(to_hack);
  json.browser =  "./dist/oboe-browser.js"
  fs.writeFileSync(to_hack, JSON.stringify(json));


  var to_overwrite = path.resolve(npm_dir, 'tale-browser/node_modules/tale-read-api/node_modules/oboe/dist/oboe-browser.js'),
      src = path.resolve(__dirname, './html/js/oboe-browser.js')

  fast_copy(src, to_overwrite, cb)

}


function fast_copy(src, dst, cb) {
  var index_js = fs.createWriteStream( dst )
  index_js.on('close', cb)

  fs.createReadStream( src )
    .pipe( index_js )
}

function browserify_index(loader_js_path, browserify_dst_path, cb ){
  var b = browserify();
  b.add( loader_js_path )
  b.bundle(cb).pipe( fs.createWriteStream( browserify_dst_path ) )
}
