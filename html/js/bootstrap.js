Function.prototype.bind=Function.prototype.bind||function(d){var a=Array.prototype.splice.call(arguments,1),c=this;var b=function(){var e=a.concat(Array.prototype.splice.call(arguments,0));if(!(this instanceof b)){return c.apply(d,e)}c.apply(this,e)};b.prototype=c.prototype;return b};

(function(){
  var $loader = document.getElementById('applicationCache'),
      $spinner = document.getElementById('spinner'),
      $progress = document.getElementById('progress'),
      loaded = false;

  window.applicationCache.addEventListener('updateready', onUpdateReady);
  window.applicationCache.addEventListener('cached', onUpdateReady, false)
  window.applicationCache.addEventListener('noupdate', allReady, false)
  window.applicationCache.addEventListener('error', allReady, false)

  function allReady(e){
    if (loaded) return; else loaded = true;
    var script = document.createElement("script");
    script.src = 'build/tale.js';
    script.onload = function(){$loader.parentNode.removeChild($loader); };
    document.head.appendChild( script );
  }
  function onUpdateReady(e) {
    try { window.applicationCache.swapCache() } catch(e){}
    allReady()
  }
  window.applicationCache.addEventListener('downloading', function(e){
    $spinner.classList.add('loader');
  }, false);

  window.applicationCache.addEventListener('progress', function(e){
    if (e.total) {
      $progress.innerHTML = e.loaded + " / " + e.total;
      if (e.loaded === e.total) setTimeout(onUpdateReady, 500);
    }
  }, false);
  if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
    onUpdateReady();
  }
})()