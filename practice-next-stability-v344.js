/* v344 — Stable next-button guard for practice pages.
   Fixes mobile double-dispatch/flicker when compact correction buttons clone the real “Siguiente” button.
   The clone used to keep data-action="next-question" and also call the real button, allowing two handlers to race.
*/
(function(){
  'use strict';
  var lockedUntil = 0;
  var forwarding = false;

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }
  function isNextText(el){
    return /siguiente|suivant|próxima|proxima|next/i.test(String(el && el.textContent || ''));
  }
  function nextCandidate(target){
    if(!target || !target.closest) return null;
    return target.closest('[data-action="next-question"], .compact-next-bar button, .compact-next-bar a, button, a');
  }
  function isNextButton(btn){
    if(!btn) return false;
    if(btn.getAttribute && btn.getAttribute('data-action') === 'next-question') return true;
    if(btn.closest && btn.closest('.compact-next-bar') && isNextText(btn)) return true;
    return false;
  }
  function realNextButton(){
    return document.querySelector('.single-nav-actions [data-action="next-question"]:not([disabled])');
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

  function forwardToRealNext(){
    var real = realNextButton();
    if(!real) return false;
    forwarding = true;
    try{ real.click(); }
    finally{ forwarding = false; }
    lockedUntil = Date.now() + 650;
    return true;
  }

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var btn = nextCandidate(e.target);
    if(!isNextButton(btn)) return;

    var now = Date.now();
    if(!forwarding && now < lockedUntil){
      stop(e);
      return;
    }

    if(btn.closest && btn.closest('.compact-next-bar')){
      stop(e);
      forwardToRealNext();
      return;
    }

    if(!forwarding){
      lockedUntil = now + 650;
    }
  }, true);

  function run(){ stabilizeCompactButtons(document); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
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
