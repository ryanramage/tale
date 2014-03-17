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
  './hints',
  'text!../css/bootstrap.min.css',
  'text!../chapter.template.html',
  'ractive-events-tap',
  'ractive-events-keys'
], function(
  $,
  _,
  director,
  oboe,
  sjcl,
  jscss,
  marked,
  Ractive,
  xxtea,
  builtin_hints,
  bootstrap,
  chapter_t
){

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


    var invalid_count = 0,
        chapter_hint_count = 0,
        internal_hint_count = 0,
        ractive = new Ractive({
          el: opts.el,
          template: opts.template,
          data: {
            chapter: null,
            next: [],
            all_hints: [],
            unlocking: false
          }
        });

    router = director.Router(routes);
    router.init('/');

    function clearInvalidMessage(keypath){
      ractive.set(keypath + '.error','');
    }

    var clearInvalidDebounce = _.debounce(clearInvalidMessage, 1000);

    ractive.on('crack', function(e){
      var id = e.context.id,
          pass = e.context.pass + '',
          keypath = e.keypath,
          next_hints = _.clone(e.context.hints),
          crack = crack_chapter.bind(null, id, pass, function(err, next){
            if (err) return showErrorMsg(keypath, next_hints);
            invalid_count = 0; chapter_hint_count = 0; internal_hint_count = 0;
            ractive.set('all_hints', []);
            render_chapter(next.chapter, next.key);
          });
      ractive.set('unlocking', true);
      setTimeout(crack, 0);
    });

    function showErrorMsg(keypath, next_hints) {
      ractive.set('unlocking', false);
      if (invalid_count++ >= 3){
        // show a hint
        var hint;
        if (next_hints && chapter_hint_count < next_hints.length ) hint = next_hints[chapter_hint_count++];
        if (!hint) {
          hint = builtin_hints[internal_hint_count++];
        }
        if (!hint) return;
        var all_hints = ractive.get('all_hints');
        all_hints.push(hint);
        invalid_count = 0;
      }
      ractive.set(keypath + '.error',"Invalid Password");
      return clearInvalidDebounce(keypath);
    }

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
      ractive.set('chapter', chapter);

      function done(err){
        render_clues(chapter);
        ractive.set('unlocking', false);
      }

      if (chapter.type === 'text') render_text(chapter, key, done);
      if (chapter.type === 'markdown') render_markdown(chapter, key, done);
      if (chapter.type === 'audio') render_audio(chapter, key, done);
      if (chapter.type === 'image') render_img(chapter, key, done);

    }

    function render_text(chapter, key, done){
       ractive.set('content', chapter.text);
       done();
    }

    function render_img(chapter, key, done) {
      var filename = chapter.file;
      var file = _.find(chapter.files, function(file){ return file.name === filename });
      if (key) {
        xxtea('file/' + file.id, key, false, function(err, imgdata){
          var blob = new Blob([imgdata], {type: file.content_type});
          var img_url = URL.createObjectURL(blob);
          ractive.set('chapter.img', {url: img_url});
          done();
        })
      }
      else {
        ractive.set('chapter.img', {url: 'file/' + file.id});
        done();
      }

    }


    function render_audio(chapter, key, done) {
      var filename = chapter.file;
      var file = _.find(chapter.files, function(file){ return file.name === filename })
      xxtea('file/' + file.id, key, false, function(err, audio){

        var blob = new Blob([audio], {type: file.content_type});
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audio.play();
        ractive.set('content', "Playing audio");
        done();
      })
    }

    function render_markdown(chapter, key, done) {
      var file = _.find(chapter.files, function(file){ return file.name === 'README.md' })
      if (!key) {
        $.get('file/' + file.id, function(md){
          ractive.set('content', marked(md));
          done();
        })
      } else {
        xxtea('file/' + file.id, key, true, function(err, md){
          ractive.set('content', marked(md));
          done()
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