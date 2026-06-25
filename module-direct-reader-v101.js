/* v102 — Module page direct premium reader: remove stacked navigation and surface course content first. */
(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'module') return;

  window.__MED_NYKUTO_MODULE_DIRECT_READER__ = 'v102-premium-direct-course';

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  const hasModuleId = () => new URLSearchParams(window.location.search).has('id');

  function injectStyle(){
    if(document.getElementById('moduleDirectReaderV101Style')) return;
    const style = document.createElement('style');
    style.id = 'moduleDirectReaderV101Style';
    style.textContent = `
      body[data-page="module"].module-direct-ready main{padding-top:0!important}
      body[data-page="module"].module-direct-ready .reader-shell{max-width:980px!important;margin:0 auto!important;padding:10px 12px 42px!important;display:block!important}
      body[data-page="module"].module-direct-ready .toc-panel,
      body[data-page="module"].module-direct-ready .mobile-toc,
      body[data-page="module"].module-direct-ready .module-nav,
      body[data-page="module"].module-direct-ready .module-direct-hidden-nav{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important}
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important}
      body[data-page="module"].module-direct-ready .reader-card{border-radius:23px!important;background:linear-gradient(180deg,rgba(11,20,36,.96),rgba(5,11,21,.98))!important;border:1px solid rgba(236,211,139,.14)!important;box-shadow:0 18px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.03)!important;overflow:hidden!important}
      body[data-page="module"].module-direct-ready .reader-head{display:grid!important;gap:7px!important;padding:13px 16px 12px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:radial-gradient(circle at 12% 0%,rgba(236,211,139,.075),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0))!important}
      body[data-page="module"].module-direct-ready .reader-head .eyebrow{margin:0!important;color:#d8bf79!important;font-size:.62rem!important;letter-spacing:.21em!important;line-height:1.1!important}
      body[data-page="module"].module-direct-ready .reader-head h1{font-size:clamp(1.22rem,4.2vw,1.72rem)!important;line-height:1.08!important;letter-spacing:-.04em!important;margin:0!important;max-width:880px!important}
      body[data-page="module"].module-direct-ready #moduleSummary{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions{display:flex!important;flex-wrap:nowrap!important;gap:7px!important;margin-top:2px!important;overflow-x:auto!important;padding:1px 0 2px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
      body[data-page="module"].module-direct-ready .reader-actions::-webkit-scrollbar{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn{width:auto!important;flex:0 0 auto!important;min-height:31px!important;padding:7px 10px!important;border-radius:999px!important;font-size:.73rem!important;line-height:1!important;white-space:nowrap!important;background:rgba(255,255,255,.043)!important;border-color:rgba(255,255,255,.10)!important;color:#e5ebf4!important;box-shadow:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn.primary{background:rgba(236,211,139,.12)!important;border-color:rgba(236,211,139,.22)!important;color:#ead18b!important}
      body[data-page="module"].module-direct-ready .reader-content{padding:15px 16px 30px!important}
      body[data-page="module"].module-direct-ready .reader-content > :first-child{margin-top:0!important}
      body[data-page="module"].module-direct-ready .content h1{font-size:clamp(1.38rem,4.8vw,1.86rem)!important;margin:0 0 12px!important;line-height:1.1!important;letter-spacing:-.035em!important}
      body[data-page="module"].module-direct-ready .content h2{font-size:clamp(1.18rem,4.2vw,1.46rem)!important;margin:22px 0 9px!important;line-height:1.16!important;color:#f1d98f!important;border-bottom:1px solid rgba(236,211,139,.18)!important;padding-bottom:7px!important}
      body[data-page="module"].module-direct-ready .content h3{font-size:clamp(1.02rem,3.7vw,1.22rem)!important;margin:16px 0 7px!important;line-height:1.18!important;color:#d8efff!important}
      body[data-page="module"].module-direct-ready .content p{margin:9px 0!important;color:#dbe4ee!important;line-height:1.58!important;font-size:1rem!important}
      body[data-page="module"].module-direct-ready .content ul,body[data-page="module"].module-direct-ready .content ol{margin:9px 0 13px 20px!important}
      body[data-page="module"].module-direct-ready .content li{margin:4px 0!important}
      body[data-page="module"].module-direct-ready .content blockquote{margin:12px 0!important;padding:12px 14px!important;border-radius:14px!important}
      body[data-page="module"].module-direct-ready .content table{margin:14px 0!important}
      @media(max-width:760px){
        body[data-page="module"].module-direct-ready .reader-shell{padding:7px 9px 32px!important}
        body[data-page="module"].module-direct-ready .reader-card{border-radius:20px!important}
        body[data-page="module"].module-direct-ready .reader-head{padding:10px 12px 10px!important;gap:5px!important}
        body[data-page="module"].module-direct-ready .reader-head h1{font-size:1.13rem!important;line-height:1.08!important}
        body[data-page="module"].module-direct-ready .reader-head .eyebrow{font-size:.55rem!important;letter-spacing:.17em!important}
        body[data-page="module"].module-direct-ready .reader-actions .btn{min-height:29px!important;padding:6px 9px!important;font-size:.69rem!important}
        body[data-page="module"].module-direct-ready .reader-content{padding:12px 12px 25px!important}
        body[data-page="module"].module-direct-ready .content h1{font-size:1.24rem!important;margin-bottom:10px!important}
        body[data-page="module"].module-direct-ready .content h2{font-size:1.11rem!important;margin-top:18px!important}
        body[data-page="module"].module-direct-ready .content h3{font-size:1rem!important;margin-top:14px!important}
        body[data-page="module"].module-direct-ready .content p{font-size:.98rem!important;line-height:1.54!important}
      }
    `;
    document.head.appendChild(style);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function isReaderCardAncestor(el){
    return !!(el && el.closest && el.closest('.reader-card'));
  }

  function hideStackedNavigationBlocks(){
    const selectors = 'main > div, main > nav, main > section, .module-nav, .mobile-toc';
    Array.from(document.querySelectorAll(selectors)).forEach(el => {
      if(el.classList.contains('reader-shell')) return;
      const txt = textOf(el);
      const buttons = el.querySelectorAll('a,button').length;
      const isModeTabs = /Curso completo|Ficha rápida|Ultra-rápida|QCM du module|QCM del módulo|QCM de este/i.test(txt) && buttons >= 2;
      const isCourseNav = /Navigation du cours|Navegación del curso|Índice|Introducción|Changer de module|Cambiar módulo|Mód\.\s*\d|←\s*Volver/i.test(txt) && buttons >= 1;
      if(isModeTabs || isCourseNav){
        el.classList.add('module-direct-hidden-nav');
      }
    });

    Array.from(document.querySelectorAll('main div, main nav, main section')).forEach(el => {
      if(isReaderCardAncestor(el)) return;
      if(el.classList.contains('reader-shell')) return;
      const txt = textOf(el);
      const buttons = el.querySelectorAll('a,button').length;
      if(buttons >= 2 && /Curso completo|Ficha rápida|Ultra-rápida|QCM/i.test(txt)){
        el.classList.add('module-direct-hidden-nav');
      }
    });
  }

  function markReady(){
    document.body.classList.add('module-direct-ready');
    hideStackedNavigationBlocks();
  }

  function contentReady(){
    const content = document.getElementById('moduleContent');
    return !!(content && content.textContent && content.textContent.trim().length > 80);
  }

  function focusCourseOnce(){
    if(!isMobile() || !hasModuleId() || location.hash) return;
    if(window.__MED_NYKUTO_MODULE_DIRECT_SCROLLED__) return;
    if(!contentReady()) return;
    const card = document.querySelector('.reader-card') || document.getElementById('moduleContent');
    const headerOffset = Math.min(88, Math.max(62, document.querySelector('.site-header')?.getBoundingClientRect().height || 70));
    const y = card.getBoundingClientRect().top + window.scrollY - headerOffset - 6;
    if(y > 6){
      window.__MED_NYKUTO_MODULE_DIRECT_SCROLLED__ = true;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  }

  function run(){
    markReady();
    window.setTimeout(markReady, 80);
    window.setTimeout(markReady, 260);
    window.setTimeout(focusCourseOnce, 160);
    window.setTimeout(focusCourseOnce, 520);
    window.setTimeout(focusCourseOnce, 980);
  }

  injectStyle();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  if(window.MutationObserver){
    try{
      new MutationObserver(() => {
        clearTimeout(window.__medModuleDirectTimer);
        window.__medModuleDirectTimer = setTimeout(run, 50);
      }).observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  }
})();
