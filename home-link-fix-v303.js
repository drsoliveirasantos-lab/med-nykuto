/* v303 — Force the Med Nykuto logo/brand to return to the homepage, including on iOS/Safari. */
(function(){
  'use strict';
  var lastNav = 0;

  function homeUrl(){
    return new URL('index.html', window.location.href).href;
  }

  function patchBrandLinks(){
    document.querySelectorAll('a.brand,a.brand-official').forEach(function(a){
      a.setAttribute('href','index.html');
      a.setAttribute('aria-label','Inicio');
      a.style.pointerEvents = 'auto';
    });
  }

  function handleBrandNavigation(e){
    var target = e.target && e.target.closest && e.target.closest('a.brand,a.brand-official');
    if(!target) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var now = Date.now();
    if(now - lastNav < 650) return;
    lastNav = now;

    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();

    window.location.assign(homeUrl());
  }

  patchBrandLinks();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', patchBrandLinks);
  }
  window.addEventListener('load', patchBrandLinks);
  setTimeout(patchBrandLinks, 400);
  setTimeout(patchBrandLinks, 1400);

  document.addEventListener('click', handleBrandNavigation, true);
  document.addEventListener('touchend', handleBrandNavigation, {capture:true, passive:false});
})();
