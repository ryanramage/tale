define([
  'jquery',
  'lodash',
  'director',
  'oboe',
  'sjcl',
  'jscss',
  'marked',
  'Ractive',
  '../jam/xxtea',
  'text!../css/bootstrap.min.css',
  'text!../chapter.template.html',
  'ractive-events-tap'
], function($, _, director, oboe, sjcl, jscss, marked, Ractive, xxtea, bootstrap, chapter_t){

  function init(options) {
    var opts = options || {};
    if (!opts.el) opts.el = '#tale';
    if (!opts.template) opts.template = chapter_t;
    if (!opts.no_bootstrap) opts.no_bootstrap = false;

    if (!opts.no_bootstrap) jscss.embed(bootstrap);
    var routes = {
      '/': first_chapter,
    }
    if (opts.routes) routes = _.extend(routes, opts.routes);


    var ractive = new Ractive({
      el: opts.el,
      template: opts.template,
      data: {
        next: []
      }
    });
    router = director.Router(routes);
    router.init('/');

    ractive.on('crack', function(e){
      var id = e.context.id,
          pass = e.context.pass,
          keypath = e.keypath,
          crack = crack_chapter.bind(null, id, pass, function(err, next){
            if (err) return ractive.set(keypath + '.error',"Invalid Password");
            render_chapter(next.chapter, next.key);
          });
      setTimeout(crack, 0);
    });

    function crack_chapter(key_id, pass, callback) {
      oboe('key/' + key_id).done(function(key_ct){
        try {
          var c2 = JSON.parse( window.sjcl.decrypt(pass, JSON.stringify(key_ct)));
          oboe('node/' + c2.to).done(function(chapter_ct){
            var chapter = JSON.parse( window.sjcl.decrypt(c2.key, JSON.stringify(chapter_ct)));
            return callback(null, {key: c2.key, chapter: chapter});
          })
        } catch(e) {
          return callback(e);
        }
      })
    }


    function first_chapter() {
      oboe('package.json').done(function(pkg){
        oboe('node/' + pkg.start_id).done(function(start_chapter){
          render_chapter(start_chapter);
        })
      });
    }

    function render_chapter(chapter, key) {
      if (chapter.type === 'text') render_text(chapter, key);
      if (chapter.type === 'markdown') render_markdown(chapter, key);
      if (chapter.type === 'audio') render_audio(chapter, key);
      render_clues(chapter);
    }

    function render_text(chapter, key){
       ractive.set('content', chapter.text);
    }

    function render_audio(chapter, key) {
      var filename = chapter.file;
      var file = _.find(chapter.files, function(file){ return file.name === filename })
      xxtea('file/' + file.id, key, false, function(err, audio){

        var blob = new Blob(audio, {type: file.content_type});
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audio.play();
        console.log('audio decoded. should play?');
      })
      ractive.set('content', "coming soon");
    }

    function render_markdown(chapter, key) {
      var file = _.find(chapter.files, function(file){ return file.name === 'README.md' })
      if (!key) {
        $.get('file/' + file.id, function(md){
          ractive.set('content', marked(md));
        })
      } else {
        xxtea('file/' + file.id, key, true, function(err, md){
          ractive.set('content', marked(md));
        })
      }
    }

    function render_clues(chapter) {
      ractive.set('next', []);
      var names = _.keys(chapter.next);
      _.each(names, function(name, i){
        ractive.set('next[' + i + ']', chapter.next[name]);
      })
    }

    return ractive;
  }
  return init;
})