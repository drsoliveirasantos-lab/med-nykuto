/* v103 — Module page direct reader: keep only compact header + course content on mobile. */
(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'module') return;

  window.__MED_NYKUTO_MODULE_DIRECT_READER__ = 'v103-content-first';

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  const hasModuleId = () => new URLSearchParams(window.location.search).has('id');

  function injectStyle(){
    if(document.getElementById('moduleDirectReaderV101Style')) return;
    const style = document.createElement('style');
    style.id = 'moduleDirectReaderV101Style';
    style.textContent = `
      body[data-page="module"].module-direct-ready main{padding-top:0!important}
      body[data-page="module"].module-direct-ready .reader-shell{max-width:980px!important;margin:0 auto!important;padding:8px 10px 40px!important;display:block!important}
      body[data-page="module"].module-direct-ready .toc-panel,
      body[data-page="module"].module-direct-ready .mobile-toc,
      body[data-page="module"].module-direct-ready .module-nav,
      body[data-page="module"].module-direct-ready .module-direct-hidden-nav,
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;min-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;pointer-events:none!important}
      body[data-page="module"].module-direct-ready .reader-card > :not(.reader-head):not(#moduleContent){display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;min-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;pointer-events:none!important}
      body[data-page="module"].module-direct-ready .reader-card{border-radius:22px!important;background:linear-gradient(180deg,rgba(10,19,35,.97),rgba(4,10,19,.99))!important;border:1px solid rgba(236,211,139,.14)!important;box-shadow:0 18px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.03)!important;overflow:hidden!important}
      body[data-page="module"].module-direct-ready .reader-head{display:grid!important;gap:6px!important;padding:11px 14px 10px!important;border-bottom:1px solid rgba(255,255,255,.065)!important;background:radial-gradient(circle at 12% 0%,rgba(236,211,139,.075),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.034),rgba(255,255,255,0))!important}
      body[data-page="module"].module-direct-ready .reader-head .eyebrow{margin:0!important;color:#d8bf79!important;font-size:.58rem!important;letter-spacing:.20em!important;line-height:1.1!important}
      body[data-page="module"].module-direct-ready .reader-head h1{font-size:clamp(1.08rem,4vw,1.52rem)!important;line-height:1.08!important;letter-spacing:-.04em!important;margin:0!important;max-width:880px!important}
      body[data-page="module"].module-direct-ready #moduleSummary{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions{display:flex!important;flex-wrap:nowrap!important;gap:6px!important;margin-top:1px!important;overflow-x:auto!important;padding:1px 0 2px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
      body[data-page="module"].module-direct-ready .reader-actions::-webkit-scrollbar{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn{width:auto!important;flex:0 0 auto!important;min-height:28px!important;padding:6px 9px!important;border-radius:999px!important;font-size:.67rem!important;line-height:1!important;white-space:nowrap!important;background:rgba(255,255,255,.043)!important;border-color:rgba(255,255,255,.10)!important;color:#e5ebf4!important;box-shadow:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn.primary{background:rgba(236,211,139,.12)!important;border-color:rgba(236,211,139,.22)!important;color:#ead18b!important}
      body[data-page="module"].module-direct-ready .reader-content{display:block!important;visibility:visible!important;height:auto!important;max-height:none!important;opacity:1!important;padding:13px 14px 30px!important}
      body[data-page="module"].module-direct-ready .reader-content > :first-child{margin-top:0!important}
      body[data-page="module"].module-direct-ready .content h1{font-size:clamp(1.28rem,4.7vw,1.76rem)!important;margin:0 0 10px!important;line-height:1.1!important;letter-spacing:-.035em!important}
      body[data-page="module"].module-direct-ready .content h2{font-size:clamp(1.12rem,4.1vw,1.38rem)!important;margin:18px 0 8px!important;line-height:1.16!important;color:#f1d98f!important;border-bottom:1px solid rgba(236,211,139,.18)!important;padding-bottom:6px!important}
      body[data-page="module"].module-direct-ready .content h3{font-size:clamp(1rem,3.6vw,1.18rem)!important;margin:14px 0 6px!important;line-height:1.18!important;color:#d8efff!important}
      body[data-page="module"].module-direct-ready .content p{margin:8px 0!important;color:#dbe4ee!important;line-height:1.54!important;font-size:.98rem!important}
      body[data-page="module"].module-direct-ready .content ul,body[data-page="module"].module-direct-ready .content ol{margin:8px 0 12px 20px!important}
      body[data-page="module"].module-direct-ready .content li{margin:4px 0!important}
      body[data-page="module"].module-direct-ready .content blockquote{margin:12px 0!important;padding:12px 14px!important;border-radius:14px!important}
      body[data-page="module"].module-direct-ready .content table{margin:12px 0!important}
      @media(max-width:760px){
        body[data-page="module"].module-direct-ready .reader-shell{padding:6px 8px 30px!important}
        body[data-page="module"].module-direct-ready .reader-card{border-radius:19px!important}
        body[data-page="module"].module-direct-ready .reader-head{padding:9px 11px 9px!important;gap:5px!important}
        body[data-page="module"].module-direct-ready .reader-head h1{font-size:1.04rem!important;line-height:1.08!important}
        body[data-page="module"].module-direct-ready .reader-head .eyebrow{font-size:.52rem!important;letter-spacing:.16em!important}
        body[data-page="module"].module-direct-ready .reader-actions .btn{min-height:27px!important;padding:6px 8px!important;font-size:.64rem!important}
        body[data-page="module"].module-direct-ready .reader-content{padding:11px 11px 24px!important}
        body[data-page="module"].module-direct-ready .content h1{font-size:1.18rem!important;margin-bottom:9px!important}
        body[data-page="module"].module-direct-ready .content h2{font-size:1.06rem!important;margin-top:16px!important}
        body[data-page="module"].module-direct-ready .content h3{font-size:.98rem!important;margin-top:13px!important}
        body[data-page="module"].module-direct-ready .content p{font-size:.96rem!important;line-height:1.5!important}
      }
    `;
    document.head.appendChild(style);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function hideStackedNavigationBlocks(){
    const card = document.querySelector('.reader-card');
    if(card){
      Array.from(card.children).forEach(child => {
        if(child.classList.contains('reader-head')) return;
        if(child.id === 'moduleContent') return;
        child.classList.add('module-direct-hidden-nav');
      });
    }

    Array.from(document.querySelectorAll('main div, main nav, main section, main aside, .module-nav, .mobile-toc')).forEach(el => {
      if(el.id === 'moduleContent') return;
      if(el.classList.contains('reader-head') || el.classList.contains('reader-card') || el.classList.contains('reader-shell')) return;
      if(el.closest && el.closest('#moduleContent')) return;
      const txt = textOf(el);
      const buttons = el.querySelectorAll('a,button').length;
      const isModeTabs = /Curso completo|Ficha rápida|Ultra-rápida|Fiche rapide|Ultra-rapide|QCM du module|QCM del módulo|QCM de este/i.test(txt) && buttons >= 2;
      const isCourseNav = /Navigation du cours|Navegación del curso|Índice|Introducción|Changer de module|Cambiar módulo|Mód\.?\s*\d|←\s*Volver/i.test(txt) && buttons >= 1;
      if(isModeTabs || isCourseNav){
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
    const content = document.getElementById('moduleContent');
    const headerOffset = Math.min(84, Math.max(58, document.querySelector('.site-header')?.getBoundingClientRect().height || 68));
    const y = content.getBoundingClientRect().top + window.scrollY - headerOffset - 4;
    if(y > 6){
      window.__MED_NYKUTO_MODULE_DIRECT_SCROLLED__ = true;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  }

  function run(){
    markReady();
    window.setTimeout(markReady, 60);
    window.setTimeout(markReady, 180);
    window.setTimeout(markReady, 420);
    window.setTimeout(focusCourseOnce, 140);
    window.setTimeout(focusCourseOnce, 460);
    window.setTimeout(focusCourseOnce, 900);
  }

  injectStyle();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  if(window.MutationObserver){
    try{
      new MutationObserver(() => {
        clearTimeout(window.__medModuleDirectTimer);
        window.__medModuleDirectTimer = setTimeout(run, 40);
      }).observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  }
})();
