define(['oboe'], function(oboe){

  console.log('ok, here we go');


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
      })
    })
  }
  start();

  return {};
})