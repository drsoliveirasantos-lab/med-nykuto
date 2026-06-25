/* v366 — Stable next-button guard for practice pages.
   Keeps compact buttons safe, adds a mobile floating next action, and adds a fallback when a visible “Suivant/Siguiente” click does not advance the active question.
*/
(function(){
  'use strict';
  var lockedUntil = 0;
  var forwarding = false;
  var BAR_ID = 'practiceMobileNextBar';

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }
  function isNextText(el){
    return /siguiente|suivant|próxima|proxima|next|question suivante|pregunta siguiente|balance|bilan/i.test(String(el && el.textContent || ''));
  }
  function nextCandidate(target){
    if(!target || !target.closest) return null;
    return target.closest('[data-action="next-question"], .compact-next-bar button, .compact-next-bar a, button, a');
  }
  function isNextButton(btn){
    if(!btn) return false;
    if(btn.getAttribute && btn.getAttribute('data-action') === 'next-question') return true;
    if(btn.closest && btn.closest('.compact-next-bar') && (isNextText(btn) || btn.classList.contains('practice-stable-next'))) return true;
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

  function injectMobileNextCss(){
    if(document.getElementById('practice-mobile-next-css-v366')) return;
    var style = document.createElement('style');
    style.id = 'practice-mobile-next-css-v366';
    style.textContent = [
      '@media (max-width: 760px){',
      '  body.practice-page.has-mobile-next-bar{ padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px)); }',
      '  .compact-next-bar.practice-mobile-next-bar{',
      '    position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px));',
      '    z-index: 2147483000; display: flex; gap: 10px; align-items: center; justify-content: center;',
      '    padding: 10px; border-radius: 18px; background: rgba(11, 18, 32, .92);',
      '    border: 1px solid rgba(148, 163, 184, .26); box-shadow: 0 18px 44px rgba(0,0,0,.35); backdrop-filter: blur(12px);',
      '  }',
      '  .compact-next-bar.practice-mobile-next-bar[hidden]{ display:none !important; }',
      '  .compact-next-bar.practice-mobile-next-bar .practice-stable-next{',
      '    width: 100%; min-height: 52px; border-radius: 15px; font-weight: 900; font-size: 1rem;',
      '  }',
      '}',
      '@media (min-width: 761px){ .compact-next-bar.practice-mobile-next-bar{ display:none !important; } }'
    ].join('\n');
    document.head.appendChild(style);
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
      if(!isNextText(clean)) clean.textContent = 'Siguiente pregunta →';
      btn.replaceWith(clean);
    });
  }

  function ensureMobileNextBar(){
    if(!isPractice() || !document.body) return;
    injectMobileNextCss();
    var real = realNextButton();
    var bar = document.getElementById(BAR_ID);
    if(!bar){
      bar = document.createElement('div');
      bar.id = BAR_ID;
      bar.className = 'compact-next-bar practice-mobile-next-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Navegación de pregunta');
      bar.hidden = true;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn secondary practice-stable-next';
      btn.dataset.stableNext = '1';
      btn.textContent = 'Siguiente pregunta →';
      bar.appendChild(btn);
      document.body.appendChild(bar);
    }
    var shouldShow = !!(real && answeredVisible());
    if(shouldShow){
      var label = String(real.textContent || '').trim();
      var stable = bar.querySelector('.practice-stable-next');
      if(stable && label) stable.textContent = label;
      bar.hidden = false;
      document.body.classList.add('has-mobile-next-bar');
    }else{
      bar.hidden = true;
      document.body.classList.remove('has-mobile-next-bar');
    }
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
    setTimeout(ensureMobileNextBar, 30);
    setTimeout(ensureMobileNextBar, 160);
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
      setTimeout(ensureMobileNextBar, 30);
      setTimeout(ensureMobileNextBar, 160);
    }
  }, true);

  function run(){ stabilizeCompactButtons(document); ensureMobileNextBar(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  window.addEventListener('resize', run);
  document.addEventListener('click', function(){ setTimeout(run, 30); setTimeout(run, 140); setTimeout(run, 420); }, true);
  try{
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes || [], function(n){
          if(n && n.nodeType === 1) stabilizeCompactButtons(n);
        });
      });
      ensureMobileNextBar();
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
})();