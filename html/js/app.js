define(['oboe', 'sjcl'], function(oboe, sjcl){


  console.log('ok, here we go', window.sjcl);


  window.applicationCache.addEventListener('cached', function(){
    console.log('all done');
  }, false);
  window.applicationCache.addEventListener('noupdate', function(){
    console.log('loaded prev');
    // start();
  }, false)

  window.applicationCache.addEventListener('downloading', function(){
    console.log('starting to download');
  }, false);

  window.applicationCache.addEventListener('progress', function(e){
    console.log('downloading', (e.loaded / e.total) * 100, '%' ) ;
  }, false);

  window.applicationCache.addEventListener('error', function(e){
    console.log('error', e) ;
    // start();
  }, false);


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
  start();

  return {};
})