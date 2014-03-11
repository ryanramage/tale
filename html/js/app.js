define(['oboe'], function(oboe){

  console.log('ok, here we go');


  window.applicationCache.addEventListener('cached', function(){
    console.log('all done');
  }, false);
  window.applicationCache.addEventListener('noupdate', function(){
    console.log('loaded prev');
  }, false)

  window.applicationCache.addEventListener('downloading', function(){
    console.log('starting to download');
  }, false);

  window.applicationCache.addEventListener('progress', function(e){
    console.log('downloading', (e.loaded / e.total) * 100, '%' ) ;
  }, false);


  return {};
})