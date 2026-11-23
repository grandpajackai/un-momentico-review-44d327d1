/* Un Momentico vision deck: keyboard, click and touch navigation. No dependencies. */
(function(){
  var stage=document.querySelector('.stage');
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var hint=document.querySelector('.hint');
  var i=0, n=slides.length;
  function fit(){
    var s=Math.min(window.innerWidth/1440, window.innerHeight/810);
    stage.style.setProperty('--s', s);
  }
  function show(k, fromHash){
    k=Math.max(0,Math.min(n-1,k));
    slides.forEach(function(el,j){
      el.classList.toggle('is-active', j===k);
      el.classList.toggle('before', j<k);
      el.setAttribute('aria-hidden', j===k?'false':'true');
      if('inert' in el){ el.inert = (j!==k); }
    });
    i=k;
    if(!fromHash){ history.replaceState(null,'','#'+(k+1)); }
    document.title=(slides[k].getAttribute('data-title')||'Un Momentico')+' | Un Momentico, a vision for Danny Cabrera';
    if(k>0 && hint){ hint.classList.add('gone'); }
  }
  function next(){ show(i+1); } function prev(){ show(i-1); }
  function fs(){
    var d=document, el=d.documentElement;
    if(!d.fullscreenElement && !d.webkitFullscreenElement){
      (el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el);
    } else {
      (d.exitFullscreen||d.webkitExitFullscreen||function(){}).call(d);
    }
  }
  document.addEventListener('keydown', function(e){
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var k=e.key;
    if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||k===' '||k==='Enter'&&e.target===document.body){ e.preventDefault(); next(); }
    else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace'){ e.preventDefault(); prev(); }
    else if(k==='Home'){ e.preventDefault(); show(0); }
    else if(k==='End'){ e.preventDefault(); show(n-1); }
    else if(k==='f'||k==='F'){ e.preventDefault(); fs(); }
  });
  document.querySelectorAll('.nav-zone.next').forEach(function(z){ z.addEventListener('click', next); });
  document.querySelectorAll('.nav-zone.prev').forEach(function(z){ z.addEventListener('click', prev); });
  var tx=null;
  document.addEventListener('touchstart', function(e){ tx=e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', function(e){
    if(tx===null) return; var dx=e.changedTouches[0].clientX-tx; tx=null;
    if(Math.abs(dx)>50){ dx<0?next():prev(); }
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function(){ var h=parseInt(location.hash.slice(1),10); if(h) show(h-1,true); });
  fit();
  var h=parseInt(location.hash.slice(1),10);
  show(h?h-1:0, true);
  setTimeout(function(){ if(hint) hint.classList.add('gone'); }, 9000);
})();
