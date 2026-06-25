/* v365 — Stable next-button guard for practice pages.
   Keeps compact buttons safe and adds a fallback when a visible “Suivant/Siguiente” click does not advance the active question.
*/
(function(){
  'use strict';
  var lockedUntil = 0;
  var forwarding = false;

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }
  function isNextText(el){
    return /siguiente|suivant|próxima|proxima|next|question suivante|pregunta siguiente/i.test(String(el && el.textContent || ''));
  }
  function nextCandidate(target){
    if(!target || !target.closest) return null;
    return target.closest('[data-action="next-question"], .compact-next-bar button, .compact-next-bar a, button, a');
  }
  function isNextButton(btn){
    if(!btn) return false;
    if(btn.getAttribute && btn.getAttribute('data-action') === 'next-question') return true;
    if(btn.closest && btn.closest('.compact-next-bar') && isNextText(btn)) return true;
    if(isNextText(btn) && btn.closest && btn.closest('.single-question-card')) return true;
    return false;
  }
  function activeQuestionId(){
    var card = document.querySelector('.single-question-card');
    return card ? (card.id || card.getAttribute('data-id') || '') : '';
  }
  function answeredVisible(){
    var card = document.querySelector('.single-question-card');
    if(!card) return false;
    var panel = card.querySelector('.answer-panel:not([hidden])');
    return !!panel;
  }
  function realNextButton(){
    return document.querySelector('.single-question-card .single-nav-actions [data-action="next-question"], #practiceList [data-action="next-question"], [data-action="next-question"]');
  }
  function stop(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function stabilizeCompactButtons(root){
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll ? root.querySelectorAll('.compact-next-bar [data-action="next-question"], .compact-next-bar button, .compact-next-bar a') : [], function(btn){
      if(btn.dataset && btn.dataset.stableNext === '1') return;
      var clean = btn.cloneNode(true);
      clean.removeAttribute('data-action');
      clean.setAttribute('type','button');
      clean.classList.add('practice-stable-next');
      clean.dataset.stableNext = '1';
      if(!isNextText(clean)) clean.textContent = 'Siguiente';
      btn.replaceWith(clean);
    });
  }

  function dispatchRealNext(){
    var real = realNextButton();
    if(!real) return false;
    if(real.disabled || real.hasAttribute('disabled')){
      if(!answeredVisible()) return false;
      real.disabled = false;
      real.removeAttribute('disabled');
    }
    forwarding = true;
    try{
      real.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    } finally {
      forwarding = false;
    }
    lockedUntil = Date.now() + 500;
    return true;
  }

  function fallbackIfStillSame(beforeId){
    setTimeout(function(){
      if(!isPractice()) return;
      if(activeQuestionId() !== beforeId) return;
      dispatchRealNext();
    }, 140);
    setTimeout(function(){
      if(!isPractice()) return;
      if(activeQuestionId() !== beforeId) return;
      dispatchRealNext();
    }, 360);
  }

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var btn = nextCandidate(e.target);
    if(!isNextButton(btn)) return;
    var beforeId = activeQuestionId();

    var now = Date.now();
    if(!forwarding && now < lockedUntil){
      stop(e);
      fallbackIfStillSame(beforeId);
      return;
    }

    if(btn.closest && btn.closest('.compact-next-bar')){
      stop(e);
      dispatchRealNext();
      fallbackIfStillSame(beforeId);
      return;
    }

    if(!forwarding){
      lockedUntil = now + 500;
      fallbackIfStillSame(beforeId);
    }
  }, true);

  function run(){ stabilizeCompactButtons(document); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 30); setTimeout(run, 140); }, true);
  try{
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes || [], function(n){
          if(n && n.nodeType === 1) stabilizeCompactButtons(n);
        });
      });
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
})();
