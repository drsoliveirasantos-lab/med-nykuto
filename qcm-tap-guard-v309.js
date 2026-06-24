/* v309 — QCM inert-zone guard.
   Tapping the question text/card background should do nothing.
   Only real controls (answers, buttons, links, picker, correction actions) remain clickable. */
(function(){
  'use strict';

  var moved = false;
  var sx = 0;
  var sy = 0;
  var suppressClickUntil = 0;

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
    if(!document.body.classList.contains('qcm-page')) return false;
    if(isInteractive(target)) return false;
    return !!target.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list');
  }

  function swallow(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function onTouchStart(e){
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
    if(!isInertQcmZone(e.target)) return;
    if(Date.now() < suppressClickUntil || e.type === 'click') swallow(e);
  }

  function injectStyle(){
    if(document.getElementById('qcmTapGuardStyle')) return;
    var st = document.createElement('style');
    st.id = 'qcmTapGuardStyle';
    st.textContent = 'body.qcm-page .single-question-card,body.qcm-page .question-prompt,body.qcm-page .structured-prompt{touch-action:pan-y;}body.qcm-page .question-prompt,body.qcm-page .structured-prompt{cursor:default;}';
    document.head.appendChild(st);
  }

  document.addEventListener('touchstart', onTouchStart, {capture:true, passive:true});
  document.addEventListener('touchmove', onTouchMove, {capture:true, passive:true});
  document.addEventListener('touchend', onTouchEnd, {capture:true, passive:false});
  document.addEventListener('click', onClick, true);

  injectStyle();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyle);
})();
