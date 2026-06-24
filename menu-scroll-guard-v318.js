/* v318 — Global scroll guard for all modal menus.
   Prevents iPhone/Safari scroll gestures inside pickers from being treated as selection taps. */
(function(){
  'use strict';

  var sx = 0;
  var sy = 0;
  var active = false;
  var moved = false;
  var lastScrollAt = 0;
  var threshold = 9;
  var suppressMs = 750;

  var MENU_SELECTOR = [
    '#qcmForcePickerModal',
    '#practiceForcePickerModal',
    '#catalogModuleForceModal',
    '#v210ModulePicker',
    '#qcmChoiceModal',
    '.qcm-force-picker-modal',
    '.pfp-modal',
    '.cmf-modal',
    '.v210-picker',
    '.mc-modal'
  ].join(',');

  function inMenu(target){
    return !!(target && target.closest && target.closest(MENU_SELECTOR));
  }

  function stop(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function point(e){
    return e.changedTouches && e.changedTouches[0] || e.touches && e.touches[0] || null;
  }

  document.addEventListener('touchstart', function(e){
    if(!inMenu(e.target)) return;
    var t = point(e);
    if(!t) return;
    active = true;
    moved = false;
    sx = t.clientX;
    sy = t.clientY;
  }, {capture:true, passive:true});

  document.addEventListener('touchmove', function(e){
    if(!active || !inMenu(e.target)) return;
    var t = point(e);
    if(!t) return;
    if(Math.abs(t.clientX - sx) > threshold || Math.abs(t.clientY - sy) > threshold){
      moved = true;
      lastScrollAt = Date.now();
    }
  }, {capture:true, passive:true});

  document.addEventListener('touchend', function(e){
    if(!active || !inMenu(e.target)) return;
    active = false;
    if(moved){
      lastScrollAt = Date.now();
      moved = false;
      stop(e);
    }
  }, {capture:true, passive:false});

  document.addEventListener('click', function(e){
    if(!inMenu(e.target)) return;
    if(Date.now() - lastScrollAt < suppressMs){
      stop(e);
    }
  }, true);

  function inject(){
    if(document.getElementById('menuScrollGuardV318Style')) return;
    var st = document.createElement('style');
    st.id = 'menuScrollGuardV318Style';
    st.textContent = [
      '#qcmForcePickerModal,#practiceForcePickerModal,#catalogModuleForceModal,#v210ModulePicker,#qcmChoiceModal{overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}',
      '#qcmForcePickerModal .qfp-panel,#qcmForcePickerModal .qfp-list,#practiceForcePickerModal .pfp-panel,#practiceForcePickerModal .pfp-list,#catalogModuleForceModal .cmf-panel,#catalogModuleForceModal .cmf-list,#v210ModulePicker .v210-picker-panel,#v210ModulePicker .v210-picker-list,#qcmChoiceModal .mc-panel,#qcmChoiceModal .mc-list{overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}',
      '#qcmForcePickerModal button,#practiceForcePickerModal button,#catalogModuleForceModal button,#v210ModulePicker a,#qcmChoiceModal button{touch-action:pan-y!important}'
    ].join('\n');
    document.head.appendChild(st);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
