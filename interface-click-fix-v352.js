/* v352 — Global interface and click stability layer for Med Nykuto.
   Scope: menu reliability, mobile tap behavior, modal/control hit-zones and cache-visible UI safety.
   Does not modify question-bank data. */
(function(){
  'use strict';

  var VERSION = 'v352';
  var lastMenuTouchAt = 0;
  var lastMenuToggleAt = 0;

  function all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function closest(target, sel){ return target && target.closest ? target.closest(sel) : null; }
  function stop(e){
    if(!e) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  function navLinks(){ return document.getElementById('navLinks') || document.querySelector('.nav-links'); }
  function menuToggle(){ return document.getElementById('menuToggle') || document.querySelector('.menu-toggle'); }

  function setMenu(open){
    var nav = navLinks();
    var btn = menuToggle();
    if(!nav || !btn) return;
    nav.classList.toggle('open', !!open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('med-menu-open', !!open);
  }
  function toggleMenu(e){
    var now = Date.now();
    if(now - lastMenuToggleAt < 180){ stop(e); return; }
    lastMenuToggleAt = now;
    stop(e);
    var nav = navLinks();
    setMenu(!(nav && nav.classList.contains('open')));
  }
  function closeMenu(){ setMenu(false); }

  function bindMenu(){
    var btn = menuToggle();
    var nav = navLinks();
    if(btn){
      btn.setAttribute('type','button');
      if(!btn.hasAttribute('aria-controls') && nav && nav.id) btn.setAttribute('aria-controls', nav.id);
      btn.setAttribute('aria-expanded', nav && nav.classList.contains('open') ? 'true' : 'false');
    }
  }

  function injectStyle(){
    if(document.getElementById('interfaceClickFixV352Style')) return;
    var st = document.createElement('style');
    st.id = 'interfaceClickFixV352Style';
    st.textContent = [
      '.site-header{z-index:9000!important}',
      '.nav-shell{position:relative!important}',
      '.menu-toggle{position:relative!important;z-index:9200!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}',
      '.nav-links{pointer-events:auto!important}',
      '.nav-links a,.brand,.brand-official,.home-action-card,.practice-compact-pill,.subject-progress-card,.course-card .btn,.module-card .btn,.reader-actions .btn,.card-actions .btn,.module-actions .btn,.option,[data-action],button,label,summary{pointer-events:auto;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
      '#qcmForcePickerModal,#practiceForcePickerModal,#catalogModuleForceModal,#v210ModulePicker,#qcmChoiceModal{pointer-events:auto!important}',
      '#qcmForcePickerModal button,#practiceForcePickerModal button,#catalogModuleForceModal button,#v210ModulePicker a,#qcmChoiceModal button,.qfp-choice,.pfp-choice,.cmf-row,.mc-choice,.v210-picker-link{touch-action:manipulation!important;pointer-events:auto!important;cursor:pointer!important}',
      '#qcmForcePickerModal .qfp-panel,#practiceForcePickerModal .pfp-panel,#catalogModuleForceModal .cmf-panel,#v210ModulePicker .v210-picker-panel,#qcmChoiceModal .mc-panel{pointer-events:auto!important}',
      '#qcmForcePickerModal .qfp-backdrop,#practiceForcePickerModal .pfp-backdrop,#catalogModuleForceModal .cmf-backdrop,#v210ModulePicker .v210-picker-backdrop,#qcmChoiceModal .mc-backdrop{pointer-events:auto!important}',
      '@media(max-width:920px){.nav-links.open{display:grid!important;position:fixed!important;left:12px!important;right:12px!important;top:calc(var(--header-h,77px) + env(safe-area-inset-top,0px))!important;max-height:calc(100vh - var(--header-h,77px) - env(safe-area-inset-top,0px) - 18px)!important;overflow:auto!important;z-index:9100!important;padding:14px!important;border-radius:18px!important;background:#0b111d!important;box-shadow:0 22px 60px rgba(0,0,0,.45)!important}.nav-links.open a{min-height:44px!important;display:flex!important;align-items:center!important}.med-menu-open{overflow:hidden!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function normalizeInteractiveState(){
    all('a.brand,a.brand-official').forEach(function(a){
      a.setAttribute('href','index.html');
      a.setAttribute('aria-label','Inicio');
    });
    all('a[href],button').forEach(function(el){
      if(el.dataset.interfaceFixBound === '1') return;
      el.dataset.interfaceFixBound = '1';
      el.addEventListener('focus', function(){ el.classList.add('is-keyboard-focused'); }, false);
      el.addEventListener('blur', function(){ el.classList.remove('is-keyboard-focused'); }, false);
    });
    window.__MED_NYKUTO_INTERFACE_FIX__ = VERSION;
  }

  function run(){
    injectStyle();
    bindMenu();
    normalizeInteractiveState();
  }

  document.addEventListener('touchend', function(e){
    var btn = closest(e.target, '#menuToggle,.menu-toggle');
    if(!btn) return;
    lastMenuTouchAt = Date.now();
    toggleMenu(e);
  }, {capture:true, passive:false});

  document.addEventListener('click', function(e){
    var btn = closest(e.target, '#menuToggle,.menu-toggle');
    if(btn){
      if(Date.now() - lastMenuTouchAt < 500){ stop(e); return; }
      toggleMenu(e);
      return;
    }

    var nav = navLinks();
    if(!nav || !nav.classList.contains('open')) return;

    if(closest(e.target, '.nav-links a')){
      setTimeout(closeMenu, 0);
      return;
    }
    if(!closest(e.target, '.nav-shell')) closeMenu();
  }, true);

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function(){
    if(window.innerWidth > 920) closeMenu();
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  setTimeout(run, 300);
  setTimeout(run, 1200);
  if(window.MutationObserver){
    try{ new MutationObserver(function(){ clearTimeout(window.__medInterfaceFixTimer); window.__medInterfaceFixTimer = setTimeout(run, 80); }).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
  }
})();
