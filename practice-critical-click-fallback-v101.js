/* v106 — Critical practice correction fallback.
   Details controls stay open when needed.
   Next-question navigation remains native first; on iOS Safari, a touchend fallback retries only if the real tap did not change the question. */
(function(){
  'use strict';
  var VERSION = 'v106-details-and-safe-next-retry';
  var nextPending = null;
  window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ = VERSION;

  function isPractice(){ return document.body && document.body.classList && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }

  function questionIdentity(){
    var card = document.querySelector('.single-question-card');
    if(!card) return '';
    if(card.id) return 'id:' + card.id;
    var prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return 'text:' + clean(prompt && prompt.textContent);
  }

  function questionCounter(){
    try{ if(typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__(); }catch(e){}
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge'));
    for(var i=0;i<nodes.length;i+=1){
      var match = String(nodes[i].textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if(match) return match[1] + '/' + match[2];
    }
    return '';
  }

  function isNextControl(el){
    if(!el || !el.closest) return false;
    var c = el.closest('[data-action="next-question"], .practice-stable-next, .single-nav-actions button, .compact-next-bar button, button, a');
    if(!c) return false;
    var txt = clean(c.textContent);
    return c.getAttribute('data-action') === 'next-question' || /siguiente|suivant|próxima|proxima|next|balance|bilan/i.test(txt);
  }

  function nextButton(el){
    if(!el || !el.closest) return null;
    var btn = el.closest('[data-action="next-question"], button, a');
    if(!btn || !isNextControl(btn)) return null;
    return btn;
  }

  function isUsableNext(btn){
    if(!btn || !btn.isConnected) return false;
    if(btn.disabled || btn.getAttribute('disabled') != null || btn.getAttribute('aria-disabled') === 'true') return false;
    var st = getComputedStyle(btn);
    if(st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
    var r = btn.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  }

  function scheduleNextRetry(btn){
    if(!isPractice() || !isUsableNext(btn)) return;
    var beforeId = questionIdentity();
    var beforeCounter = questionCounter();
    if(!beforeId) return;
    if(nextPending && nextPending.beforeId === beforeId && Date.now() - nextPending.startedAt < 900) return;
    nextPending = {beforeId: beforeId, beforeCounter: beforeCounter, startedAt: Date.now()};
    setTimeout(function(){
      var pending = nextPending;
      if(!pending || pending.beforeId !== beforeId) return;
      var currentId = questionIdentity();
      var currentCounter = questionCounter();
      if(currentId && (currentId !== beforeId || currentCounter !== beforeCounter)){
        nextPending = null;
        return;
      }
      if(!isUsableNext(btn)){
        nextPending = null;
        return;
      }
      window.__MED_NYKUTO_NEXT_TOUCH_RETRY_LAST__ = Date.now();
      try{ btn.click(); }
      catch(e){
        try{ btn.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window})); }catch(_){}
      }
      setTimeout(function(){ nextPending = null; }, 250);
    }, 320);
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

  document.addEventListener('touchend', function(e){
    if(!isPractice()) return;
    var btn = nextButton(e.target);
    if(btn) scheduleNextRetry(btn);
  }, {capture:true, passive:true});

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var btn = nextButton(e.target);
    if(btn) scheduleNextRetry(btn);
    if(isNextControl(e.target)) return;
    if(isDetailsControl(e.target)) setTimeout(function(){ openDetailsNear(e.target); }, 30);
  }, true);

  function injectStyle(){
    if(document.getElementById('practiceCriticalClickFallbackV106Style')) return;
    var old104 = document.getElementById('practiceCriticalClickFallbackV104Style');
    var old105 = document.getElementById('practiceCriticalClickFallbackV105Style');
    if(old104) old104.remove();
    if(old105) old105.remove();
    var st = document.createElement('style');
    st.id = 'practiceCriticalClickFallbackV106Style';
    st.textContent = 'body.practice-page .answer-panel:not([hidden]){display:block!important;visibility:visible!important;max-height:none!important;overflow:visible!important}body.practice-page .answer-panel details[open]{display:block!important}body.practice-page .detailed-correction,body.practice-page .premium-correction-card,body.practice-page .pc-card,body.practice-page .ppc-card,body.practice-page .ppc-panel{visibility:visible!important}body.practice-page .single-question-card [data-action="next-question"]{touch-action:manipulation!important;pointer-events:auto!important}';
    document.head.appendChild(st);
  }
  function run(){ injectStyle(); keepAnsweredUiOpen(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 80); setTimeout(run, 260); }, true);
  try{ new MutationObserver(function(){ setTimeout(run, 120); }).observe(document.documentElement, {childList:true, subtree:true}); }catch(e){}
})();
