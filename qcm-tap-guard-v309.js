/* v311 — QCM inert-zone and no-submit guard.
   Tapping the question text/card background should do nothing.
   Real QCM controls must stay clickable. Buttons inside #practiceList are only marked type="button";
   this file does not preventDefault on answer/Next clicks, so app.bundle.js receives them normally. */
(function(){
  'use strict';

  var moved = false;
  var sx = 0;
  var sy = 0;
  var suppressClickUntil = 0;

  function isQcm(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page'));
  }

  function isInteractive(target){
    if(!target || !target.closest) return false;
    return !!target.closest([
      'a',
      'button',
      'input',
      'select',
      'textarea',
      'label',
      'summary',
      '[role="button"]',
      '[data-action]',
      '.option',
      '.btn',
      '.mc-picker-btn',
      '.practice-compact-pill',
      '.pc-card',
      '.premium-correction-card',
      '#qcmForcePickerModal',
      '#qcmChoiceModal',
      '#v210ModulePicker'
    ].join(','));
  }

  function isInertQcmZone(target){
    if(!target || !target.closest) return false;
    if(!isQcm()) return false;
    if(isInteractive(target)) return false;
    return !!target.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list');
  }

  function swallow(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function neutraliseButton(btn){
    if(!btn || !btn.matches || !btn.matches('#practiceList button')) return;
    if(btn.getAttribute('type') !== 'button') btn.setAttribute('type','button');
  }

  function neutraliseExistingButtons(){
    if(!isQcm()) return;
    document.querySelectorAll('#practiceList button').forEach(neutraliseButton);
  }

  function markPracticeButton(e){
    if(!isQcm()) return;
    var btn = e.target && e.target.closest && e.target.closest('#practiceList button');
    if(!btn) return;
    neutraliseButton(btn);
  }

  function guardSubmit(e){
    if(!isQcm()) return;
    if(e.target && e.target.closest && e.target.closest('#practiceList')){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }

  function onTouchStart(e){
    markPracticeButton(e);
    if(!isInertQcmZone(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    sx = t.clientX;
    sy = t.clientY;
    moved = false;
  }

  function onTouchMove(e){
    if(!isInertQcmZone(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    if(Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) moved = true;
  }

  function onTouchEnd(e){
    if(!isInertQcmZone(e.target)) return;
    if(moved) return;
    suppressClickUntil = Date.now() + 500;
    swallow(e);
  }

  function onClick(e){
    markPracticeButton(e);
    if(!isInertQcmZone(e.target)) return;
    if(Date.now() < suppressClickUntil || e.type === 'click') swallow(e);
  }

  function injectStyle(){
    if(document.getElementById('qcmTapGuardStyle')) return;
    var st = document.createElement('style');
    st.id = 'qcmTapGuardStyle';
    st.textContent = [
      'body.qcm-page .single-question-card,body.qcm-page .question-prompt,body.qcm-page .structured-prompt{touch-action:pan-y}',
      'body.qcm-page .question-prompt,body.qcm-page .structured-prompt{cursor:default}',
      'body.qcm-page .practice-quick-header,body.qcm-page .page-hero{display:none!important;visibility:hidden!important}'
    ].join(';');
    document.head.appendChild(st);
  }

  document.addEventListener('touchstart', onTouchStart, {capture:true, passive:true});
  document.addEventListener('touchmove', onTouchMove, {capture:true, passive:true});
  document.addEventListener('touchend', onTouchEnd, {capture:true, passive:false});
  document.addEventListener('pointerdown', markPracticeButton, {capture:true, passive:true});
  document.addEventListener('click', onClick, true);
  document.addEventListener('submit', guardSubmit, true);

  injectStyle();
  neutraliseExistingButtons();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ injectStyle(); neutraliseExistingButtons(); });
  window.addEventListener('pageshow', neutraliseExistingButtons);
})();
