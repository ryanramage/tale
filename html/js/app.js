define([
  'jquery',
  'lodash',
  'director',
  'oboe',
  'sjcl',
  'jscss',
  'marked',
  'Ractive',
  'store',
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
  store,
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
      '/*': show_chapter,
      '/': first_chapter

    }
    if (opts.routes) routes = _.extend(routes, opts.routes);


    var current_chapter,
        current_key,
        invalid_count = 0,
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
      var id = e.context.id.toString(),
          pass = e.context.pass + '',
          keypath = e.keypath,
          next_hints = _.clone(e.context.hints),
          crack = crack_chapter.bind(null, id, pass, function(err, next){
            if (err) return showErrorMsg(keypath, next_hints);
            invalid_count = 0; chapter_hint_count = 0; internal_hint_count = 0;
            ractive.set('all_hints', []);
            current_chapter = next.chapter;
            current_key = next.key;
            store_key(next.chapter.id, next.key);
            router.setRoute('/' + next.chapter.id)
          });
      ractive.set('unlocking', true);
      setTimeout(crack, 0);
    });

    ractive.on('end_link', function(e){
      // we might want to add some query params here
      window.location = e.context.chapter.end_link;
    })


    function store_key(chapter_id, key){
      store.set(chapter_id, key);
    }

    function show_chapter(chapter_id) {
      // the current route is pointing to the currently unlocked
      if (current_chapter && current_key && current_chapter.id === chapter_id){
        return render_chapter(current_chapter, current_key)
      }
      var key = store.get(chapter_id);
      if (!key) return showEncryptedMsg();

      oboe('node/' + chapter_id).done(function(chapter_ct){
        var chapter = JSON.parse( window.sjcl.decrypt(key, JSON.stringify(chapter_ct)));
        chapter.id = chapter_id;
        render_chapter(chapter, key)
      })

    }


    function first_chapter() {
      oboe('package.json').done(function(pkg){
        oboe('node/' + pkg.start_id).done(function(start_chapter){
          current_chapter = start_chapter;
          current_key = null;
          render_chapter(start_chapter);
        })
      });
    }

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
            chapter.id = c2.to;
            return callback(null, {key: c2.key, chapter: chapter});
          })
        } catch(e) {
          return callback(e);
        }
      })
    }




    function render_chapter(chapter, key) {
      ractive.set('chapter', chapter);

      function done(err){
        render_clues(chapter);
        ractive.set('unlocking', false);
      }

      if (chapter.type === 'text') return render_text(chapter, key, done);
      if (chapter.type === 'markdown') return render_markdown(chapter, key, done);
      if (chapter.type === 'audio') return render_audio(chapter, key, done);
      if (chapter.type === 'image') return render_img(chapter, key, done);

      // try loading a plugin
      require(['plugins/' + chapter.type], function (plugin) {
        var args = {
          ractive: ractive,
          chapter: chapter,
          key: key,
          xxtea: xxtea
        }
        plugin(args, done);
      }, function(err){
        console.log('load error');
        done();
      });


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

          var image_post_process = [];
          var renderer = new marked.Renderer();
          renderer.image = function (href, title, text) {
            var img = _.find(chapter.files, function(file){ return file.name === href })
            if (img) {
              image_post_process.push(img);
              return '<img id="'+ img.id +'" src="" title="' + title + '" alt="' + text + '" />';
            }
            else return '<img src="'+ href +'" title="' + title + '" alt="' + text + '" />';
          }

          ractive.set('content', marked(md, { renderer: renderer }));
          markdown_image_replace(image_post_process, key);
          done()
        })
      }
    }

    function markdown_image_replace(images, key) {
      _.each(images, function(image){
        xxtea('file/' + image.id, key, false, function(err, image_data){

          var blob = new Blob([image_data], {type: image.content_type});
          var url = URL.createObjectURL(blob);
          $('#' + image.id).attr('src', url);
        })
      })
    }


    function render_clues(chapter) {
      ractive.set('next', []);
      var names = _.keys(chapter.next_folder);
      _.each(names, function(name, i){
        ractive.set('next[' + i + ']', chapter.next_folder[name]);
      })
    }

    return ractive;
  }
  return init;
})