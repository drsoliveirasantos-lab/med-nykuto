/* v313 — Practice inert-zone guard for Casos clínicos and V/F.
   Prevents accidental reload/tap on question text/background. */
(function(){
  'use strict';
  var moved=false,sx=0,sy=0,suppress=0;
  function targetPage(){return document.body&&document.body.dataset.page==='practice'&&!document.body.classList.contains('qcm-page')}
  function interactive(t){return !!(t&&t.closest&&t.closest('a,button,input,select,textarea,label,summary,[role="button"],[data-action],.option,.btn,.practice-force-picker-shell,#practiceForcePickerModal,.ppc-card'))}
  function inert(t){return targetPage()&&t&&t.closest&&!interactive(t)&&!!t.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list,.case-stem')}
  function swallow(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
  document.addEventListener('touchstart',function(e){if(!inert(e.target))return;var t=e.changedTouches&&e.changedTouches[0];if(!t)return;sx=t.clientX;sy=t.clientY;moved=false},{capture:true,passive:true});
  document.addEventListener('touchmove',function(e){if(!inert(e.target))return;var t=e.changedTouches&&e.changedTouches[0];if(!t)return;if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8)moved=true},{capture:true,passive:true});
  document.addEventListener('touchend',function(e){if(!inert(e.target))return;if(moved)return;suppress=Date.now()+500;swallow(e)},{capture:true,passive:false});
  document.addEventListener('click',function(e){if(!inert(e.target))return;if(Date.now()<suppress||e.type==='click')swallow(e)},true);
  function style(){if(document.getElementById('practiceTapGuardStyle'))return;var st=document.createElement('style');st.id='practiceTapGuardStyle';st.textContent='body.practice-page .single-question-card,body.practice-page .question-prompt,body.practice-page .structured-prompt,body.practice-page .case-stem{touch-action:pan-y;}';document.head.appendChild(st)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',style);else style();
})();
