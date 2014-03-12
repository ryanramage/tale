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
  console.log(chapter_t);
  var ractive = new Ractive({
    el: '#main',
    template: chapter_t,
    data: {
      next: []
    }
  });

  ractive.on('crack', function(e){
    var id = e.context.id,
        pass = e.context.pass;
    oboe('key/' + id).done(function(key_ct){
      try {
        var c2 = JSON.parse( window.sjcl.decrypt(pass, JSON.stringify(key_ct)));
        oboe('node/' + c2.to).done(function(chapter_ct){
          var next_chapter = JSON.parse( window.sjcl.decrypt(c2.key, JSON.stringify(chapter_ct)));
        })
      } catch(e) {
        alert('invalid password');
      }
    })
  })

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
    var names = _.keys(chapter.next);
    _.each(names, function(name, i){
      console.log(name, i, chapter.next[name]);
      ractive.set('next[' + i + ']', chapter.next[name]);
    })
  }



  function start() {
    oboe('meta/package.json').done(function(pkg){
      oboe('node/' + pkg.start_id).done(function(start_chapter){
        console.log(start_chapter);
        var chapter2_id = start_chapter.next.chapter2.id;

        oboe('key/' + chapter2_id).done(function(chapter2_key){
          console.log('ok', chapter2_key);

          console.log('before');

          try {
            var c2 = JSON.parse( window.sjcl.decrypt('343jk43943jn43', JSON.stringify(chapter2_key)));
            console.log('c2', c2.to, c2.key);

            console.log('after');
          } catch(e) {
            console.log('e', e);
          }
        })


      })
    })
  }
  return {};
})