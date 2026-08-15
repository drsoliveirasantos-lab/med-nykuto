/* v101 — Mobile menu and small-screen layout safety. */
(function(){
  'use strict';

  function injectStyle(){
    if(document.getElementById('mobileMenuLayoutFixV101Style')) return;
    var st = document.createElement('style');
    st.id = 'mobileMenuLayoutFixV101Style';
    st.textContent = [
      'html,body{max-width:100%!important;overflow-x:hidden!important}',
      '*{box-sizing:border-box}',
      '@media(max-width:920px){',
      '  .site-header,.nav-shell,main,.home-only-main,.home-v43,.home-v41-hero,.home-v41-hero-card,.home-v41-dashboard,.home-v41-bottom,.section,.page-hero{max-width:100vw!important;box-sizing:border-box!important}',
      '  .nav-shell{width:100%!important;padding-left:12px!important;padding-right:12px!important;gap:8px!important;overflow:visible!important}',
      '  .brand,.brand-official{min-width:0!important;max-width:calc(100vw - 120px)!important;overflow:hidden!important}',
      '  .brand-context{min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}',
      '  .brand-logo,.brand-logo-official{max-width:72px!important;height:auto!important}',
      '  .lang-switch,.language-switcher,[aria-label="Changer la langue"]{max-width:100%!important;flex-wrap:wrap!important}',
      '  #navLinks,.nav-links{display:none!important;position:absolute!important;right:12px!important;top:64px!important;max-width:calc(100vw - 24px)!important;min-width:220px!important;z-index:999!important}',
      '  #navLinks.open,.nav-links.open{display:grid!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '  .home-action-grid,.home-v41-proof,.stat-row-mini,.home-v41-stat-row,.footer-links{max-width:100%!important;grid-template-columns:1fr!important}',
      '  #supportProject,.home-v42-donate-card,.home-v41-donate-card,.donate-visual,.donate-text,.support-actions{max-width:100%!important;min-width:0!important;overflow:hidden!important}',
      '  .support-banner,.support-ribbon,.support-strip,.solidarity-banner,.donate-fun-bubble{max-width:calc(100vw - 24px)!important;min-width:0!important;overflow-wrap:anywhere!important}',
      '  img,svg,video,canvas{max-width:100%!important;height:auto}',
      '}',
      '@media(max-width:430px){.home-action-icon,.home-action-code{min-width:0!important}.home-action-card{max-width:100%!important;min-width:0!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function bindMenu(){
    var toggles = Array.from(document.querySelectorAll('#menuToggle,.menu-toggle'));
    toggles.forEach(function(toggle){
      if(toggle.dataset.mobileMenuFixV101 === '1') return;
      toggle.dataset.mobileMenuFixV101 = '1';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function(event){
        var nav = document.getElementById('navLinks') || document.querySelector('.nav-links');
        if(!nav) return;
        event.preventDefault();
        event.stopPropagation();
        var open = !nav.classList.contains('open');
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        window.__MED_NYKUTO_MOBILE_MENU_FIX_LAST_TOGGLE__ = open ? 'open' : 'closed';
      }, true);
    });
    document.addEventListener('click', function(event){
      var nav = document.getElementById('navLinks') || document.querySelector('.nav-links');
      if(!nav || !nav.classList.contains('open')) return;
      if(event.target.closest && event.target.closest('#navLinks,.nav-links,#menuToggle,.menu-toggle')) return;
      nav.classList.remove('open');
      toggles.forEach(function(t){ t.setAttribute('aria-expanded','false'); });
    }, true);
  }

  function run(){
    injectStyle();
    bindMenu();
    window.__MED_NYKUTO_MOBILE_MENU_LAYOUT_FIX__ = 'v101';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('pageshow', run);
})();
