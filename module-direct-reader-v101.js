/* v101 — Module page direct reader: compact mobile course layout and direct course focus. */
(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'module') return;

  window.__MED_NYKUTO_MODULE_DIRECT_READER__ = 'v101-direct-course';

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  const hasModuleId = () => new URLSearchParams(window.location.search).has('id');

  function injectStyle(){
    if(document.getElementById('moduleDirectReaderV101Style')) return;
    const style = document.createElement('style');
    style.id = 'moduleDirectReaderV101Style';
    style.textContent = `
      body[data-page="module"].module-direct-ready main{padding-top:0!important}
      body[data-page="module"].module-direct-ready .reader-shell{max-width:1060px!important;margin:0 auto!important;padding:14px 14px 42px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;align-items:start!important}
      body[data-page="module"].module-direct-ready .toc-panel{display:none!important}
      body[data-page="module"].module-direct-ready .reader-card{border-radius:24px!important;background:linear-gradient(180deg,rgba(12,21,37,.92),rgba(7,13,25,.96))!important;border:1px solid rgba(236,211,139,.13)!important;box-shadow:0 18px 52px rgba(0,0,0,.32)!important;overflow:hidden!important}
      body[data-page="module"].module-direct-ready .reader-head{display:grid!important;gap:8px!important;padding:15px 18px 13px!important;border-bottom:1px solid rgba(255,255,255,.075)!important;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0))!important}
      body[data-page="module"].module-direct-ready .reader-head .eyebrow{margin:0!important;color:#d7bd72!important;font-size:.66rem!important;letter-spacing:.22em!important;line-height:1.1!important}
      body[data-page="module"].module-direct-ready .reader-head h1{font-size:clamp(1.35rem,4.4vw,2rem)!important;line-height:1.08!important;letter-spacing:-.04em!important;margin:0!important;max-width:920px!important}
      body[data-page="module"].module-direct-ready #moduleSummary{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions{display:flex!important;flex-wrap:nowrap!important;gap:8px!important;margin-top:3px!important;overflow-x:auto!important;padding-bottom:2px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
      body[data-page="module"].module-direct-ready .reader-actions::-webkit-scrollbar{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn{width:auto!important;flex:0 0 auto!important;min-height:34px!important;padding:8px 11px!important;border-radius:999px!important;font-size:.78rem!important;line-height:1!important;white-space:nowrap!important;background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.10)!important;color:#e8edf5!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn.primary{background:rgba(236,211,139,.12)!important;border-color:rgba(236,211,139,.20)!important;color:#ead18b!important}
      body[data-page="module"].module-direct-ready .mobile-toc{display:none!important}
      body[data-page="module"].module-direct-ready .reader-content{padding:18px 18px 30px!important}
      body[data-page="module"].module-direct-ready .reader-content > :first-child{margin-top:0!important}
      body[data-page="module"].module-direct-ready .content h1{font-size:clamp(1.55rem,5vw,2.05rem)!important;margin:0 0 16px!important;line-height:1.1!important;letter-spacing:-.035em!important}
      body[data-page="module"].module-direct-ready .content h2{font-size:clamp(1.25rem,4.4vw,1.62rem)!important;margin:24px 0 10px!important;line-height:1.16!important;color:#f1d98f!important}
      body[data-page="module"].module-direct-ready .content h3{font-size:clamp(1.08rem,3.8vw,1.28rem)!important;margin:18px 0 8px!important;line-height:1.18!important;color:#d8efff!important}
      body[data-page="module"].module-direct-ready .content p{margin:10px 0!important;color:#dbe4ee!important;line-height:1.62!important}
      body[data-page="module"].module-direct-ready .content ul,body[data-page="module"].module-direct-ready .content ol{margin:10px 0 14px 20px!important}
      body[data-page="module"].module-direct-ready .content li{margin:5px 0!important}
      body[data-page="module"].module-direct-ready .module-nav{padding:14px 18px!important;gap:8px!important;background:rgba(255,255,255,.025)!important}
      body[data-page="module"].module-direct-ready .module-nav .btn{width:auto!important;min-height:34px!important;padding:8px 11px!important;font-size:.78rem!important}
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs{max-width:1060px!important;margin:8px auto 0!important;padding:7px!important;border-radius:18px!important;background:rgba(7,13,25,.72)!important;border:1px solid rgba(236,211,139,.12)!important;box-shadow:0 10px 28px rgba(0,0,0,.20)!important;display:flex!important;gap:7px!important;overflow-x:auto!important;scrollbar-width:none!important}
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs::-webkit-scrollbar{display:none!important}
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs a,body[data-page="module"].module-direct-ready .module-direct-mode-tabs button{flex:0 0 auto!important;min-height:32px!important;padding:7px 10px!important;font-size:.76rem!important;border-radius:999px!important;white-space:nowrap!important}
      @media(max-width:760px){
        body[data-page="module"].module-direct-ready .site-header{position:sticky!important;top:0!important}
        body[data-page="module"].module-direct-ready .reader-shell{padding:8px 10px 34px!important;gap:8px!important}
        body[data-page="module"].module-direct-ready .reader-card{border-radius:20px!important}
        body[data-page="module"].module-direct-ready .reader-head{padding:12px 13px 11px!important;gap:6px!important}
        body[data-page="module"].module-direct-ready .reader-head h1{font-size:1.28rem!important;line-height:1.09!important}
        body[data-page="module"].module-direct-ready .reader-head .eyebrow{font-size:.58rem!important;letter-spacing:.18em!important}
        body[data-page="module"].module-direct-ready .reader-content{padding:14px 14px 26px!important}
        body[data-page="module"].module-direct-ready .content h1{font-size:1.35rem!important;margin-bottom:12px!important}
        body[data-page="module"].module-direct-ready .content h2{font-size:1.18rem!important;margin-top:20px!important}
        body[data-page="module"].module-direct-ready .content h3{font-size:1.02rem!important;margin-top:16px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function tagModeTabs(){
    const candidates = Array.from(document.querySelectorAll('main div, main nav, main section'));
    candidates.forEach(el => {
      if(el.classList.contains('module-direct-mode-tabs')) return;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const hasCourse = /Curso completo|Cours complet|Curso completo/i.test(txt);
      const hasSheet = /Ficha rápida|Fiche rapide|Ficha rápida/i.test(txt);
      const hasQcm = /QCM/i.test(txt);
      const children = el.querySelectorAll('a,button').length;
      if(hasCourse && hasSheet && hasQcm && children >= 2 && children <= 8){
        el.classList.add('module-direct-mode-tabs');
      }
    });
  }

  function markReady(){
    document.body.classList.add('module-direct-ready');
    tagModeTabs();
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
    const headerOffset = Math.min(92, Math.max(66, document.querySelector('.site-header')?.getBoundingClientRect().height || 74));
    const y = content.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
    if(y > 10){
      window.__MED_NYKUTO_MODULE_DIRECT_SCROLLED__ = true;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  }

  function run(){
    markReady();
    window.setTimeout(markReady, 120);
    window.setTimeout(focusCourseOnce, 180);
    window.setTimeout(focusCourseOnce, 550);
    window.setTimeout(focusCourseOnce, 1100);
  }

  injectStyle();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  if(window.MutationObserver){
    try{
      new MutationObserver(() => {
        clearTimeout(window.__medModuleDirectTimer);
        window.__medModuleDirectTimer = setTimeout(run, 80);
      }).observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  }
})();
