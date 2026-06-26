/* v105 — Critical practice correction fallback.
   Important: this script no longer intercepts "Siguiente pregunta".
   Next-question navigation must bubble to the native practice engine in app.bundle.js.
*/
(function(){
  'use strict';
  var VERSION = 'v105-details-only';
  window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ = VERSION;

  function isPractice(){ return document.body && document.body.classList && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }

  function isNextControl(el){
    if(!el || !el.closest) return false;
    var c = el.closest('[data-action="next-question"], .practice-stable-next, .single-nav-actions button, .compact-next-bar button, button, a');
    if(!c) return false;
    var txt = clean(c.textContent);
    return c.getAttribute('data-action') === 'next-question' || /siguiente|suivant|próxima|proxima|next|balance|bilan/i.test(txt);
  }

  function isDetailsControl(el){
    if(!el || !el.closest) return false;
    if(isNextControl(el)) return false;
    var c = el.closest('summary, [data-action*="detail"], [aria-controls], button, a');
    if(!c) return false;
    var txt = clean(c.textContent);
    return c.tagName === 'SUMMARY' || /detalle|detalles|d[eé]tail|d[eé]tails|voir plus|ver m[aá]s|mostrar m[aá]s|plus de/i.test(txt);
  }

  function openDetailsNear(el){
    var panel = el && el.closest ? (el.closest('.answer-panel') || document.querySelector('.single-question-card .answer-panel:not([hidden])')) : document.querySelector('.single-question-card .answer-panel:not([hidden])');
    if(!panel) return false;
    panel.hidden = false;
    panel.style.setProperty('display','block','important');
    panel.style.setProperty('visibility','visible','important');
    panel.style.setProperty('max-height','none','important');
    panel.style.setProperty('overflow','visible','important');
    Array.prototype.forEach.call(panel.querySelectorAll('details'), function(d){ d.open = true; d.hidden = false; });
    Array.prototype.forEach.call(panel.querySelectorAll('[hidden], .is-hidden'), function(n){
      if(n.matches && n.matches('script,style')) return;
      n.hidden = false;
      n.classList.remove('is-hidden');
    });
    Array.prototype.forEach.call(panel.querySelectorAll('.detailed-correction,.pc-card,.ppc-card,.ppc-panel,.premium-correction-card,.correction-detail,.details-panel'), function(n){
      n.hidden = false;
      n.style.setProperty('display','block','important');
      n.style.setProperty('visibility','visible','important');
      n.style.setProperty('max-height','none','important');
      n.style.setProperty('overflow','visible','important');
    });
    return true;
  }

  function keepAnsweredUiOpen(){
    if(!isPractice()) return;
    var panel = document.querySelector('.single-question-card .answer-panel:not([hidden])');
    if(panel) openDetailsNear(panel);
  }

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    if(isNextControl(e.target)) return;
    if(isDetailsControl(e.target)) setTimeout(function(){ openDetailsNear(e.target); }, 30);
  }, true);

  function injectStyle(){
    if(document.getElementById('practiceCriticalClickFallbackV105Style')) return;
    var old = document.getElementById('practiceCriticalClickFallbackV104Style');
    if(old) old.remove();
    var st = document.createElement('style');
    st.id = 'practiceCriticalClickFallbackV105Style';
    st.textContent = 'body.practice-page .answer-panel:not([hidden]){display:block!important;visibility:visible!important;max-height:none!important;overflow:visible!important}body.practice-page .answer-panel details[open]{display:block!important}body.practice-page .detailed-correction,body.practice-page .premium-correction-card,body.practice-page .pc-card,body.practice-page .ppc-card,body.practice-page .ppc-panel{visibility:visible!important}';
    document.head.appendChild(st);
  }
  function run(){ injectStyle(); keepAnsweredUiOpen(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 80); setTimeout(run, 260); }, true);
  try{ new MutationObserver(function(){ setTimeout(run, 120); }).observe(document.documentElement, {childList:true, subtree:true}); }catch(e){}
})();
