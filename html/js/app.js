define([
  'jquery',
  'lodash',
  'director',
  'oboe',
  'sjcl',
  'jscss',
  'marked',
  'Ractive',
  'text!../css/bootstrap.min.css',
  'text!../chapter.template.html',
  'ractive-events-tap'
], function($, _, director, oboe, sjcl, jscss, marked, Ractive, bootstrap, chapter_t){
  jscss.embed(bootstrap);

  var routes = {
    '/': first_chapter,
  }
  router = director.Router(routes);
  router.init('/');
  var ractive = new Ractive({
    el: '#main',
    template: chapter_t,
    data: {
      next: []
    }
  });

  ractive.on('crack', function(e){
    var id = e.context.id,
        pass = e.context.pass,
        keypath = e.keypath;

        crack = crack_chapter.bind(null, id, pass, function(err, next_chapter){
          if (err) return ractive.set(keypath + '.error',"Invalid Password");
          render_chapter(next_chapter);
        });
        ;
    setTimeout(crack, 0);
  })

  function crack_chapter(key_id, pass, callback) {
    oboe('key/' + key_id).done(function(key_ct){
      try {
        var c2 = JSON.parse( window.sjcl.decrypt(pass, JSON.stringify(key_ct)));
        oboe('node/' + c2.to).done(function(chapter_ct){
          var next_chapter = JSON.parse( window.sjcl.decrypt(c2.key, JSON.stringify(chapter_ct)));
          return callback(null, next_chapter);
        })
      } catch(e) {
        return callback(e);
      }
    })
  }


  function first_chapter() {
    oboe('meta/package.json').done(function(pkg){
      oboe('node/' + pkg.start_id).done(function(start_chapter){
        render_chapter(start_chapter);
      })
    });
  }

  function render_chapter(chapter) {
    if (chapter.type === 'markdown') render_markdown(chapter);

    render_clues(chapter)
  }

  function render_markdown(chapter) {
    var file = _.find(chapter.files, function(file){ return file.name === 'README.md' })
    $.get('file/' + file.id, function(md){
      ractive.set('content', marked(md));
    })
  }

  function render_clues(chapter) {
    ractive.set('next', []);
    var names = _.keys(chapter.next);
    _.each(names, function(name, i){
      ractive.set('next[' + i + ']', chapter.next[name]);
    })
  }

  return {};
})