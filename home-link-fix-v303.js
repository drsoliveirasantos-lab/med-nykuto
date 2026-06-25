/* v365 — Force the Med Nykuto logo/brand to return to the homepage on click, touch and pointer devices. */
(function(){
  'use strict';
  var lastNav = 0;

  function homeUrl(){
    return new URL('/index.html', window.location.origin).href;
  }

  function patchBrandLinks(){
    document.querySelectorAll('a.brand,a.brand-official,.brand a,.brand-official a').forEach(function(a){
      if(a.tagName !== 'A') return;
      a.setAttribute('href','/index.html');
      a.setAttribute('aria-label','Inicio');
      a.style.pointerEvents = 'auto';
      a.style.cursor = 'pointer';
    });
    document.querySelectorAll('.brand,.brand-official,.brand-logo,.brand-logo-official').forEach(function(el){
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
    });
  }

  function closestBrand(target){
    return target && target.closest && target.closest('a.brand,a.brand-official,.brand,.brand-official,.brand-logo,.brand-logo-official');
  }

  function handleBrandNavigation(e){
    var target = closestBrand(e.target);
    if(!target) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var now = Date.now();
    if(now - lastNav < 700){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      return;
    }
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
  window.addEventListener('pageshow', patchBrandLinks);
  setTimeout(patchBrandLinks, 100);
  setTimeout(patchBrandLinks, 400);
  setTimeout(patchBrandLinks, 1400);

  ['pointerup','click','touchend'].forEach(function(evt){
    document.addEventListener(evt, handleBrandNavigation, {capture:true, passive:false});
  });
})();
