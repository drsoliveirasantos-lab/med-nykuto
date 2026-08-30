(function(){
  'use strict';

  var STORAGE_KEY = 'med-nykuto-theme-v1';
  var DARK = 'dark';
  var LIGHT = 'light';
  var root = document.documentElement;

  function safeRead(){
    try { var saved = localStorage.getItem(STORAGE_KEY); return saved === LIGHT || saved === DARK ? saved : DARK; }
    catch (error) { return DARK; }
  }
  function safeWrite(value){ try { localStorage.setItem(STORAGE_KEY, value); } catch (error) {} }
  function isPortuguese(){
    var communityLanguage=document.getElementById('communityLanguage'),classLanguage=document.getElementById('classLanguageSelect');
    if(communityLanguage&&communityLanguage.value==='br')return true;if(classLanguage&&classLanguage.value==='br')return true;
    if(communityLanguage||classLanguage){try{if(localStorage.getItem('medLang')==='br')return true;}catch(error){}}
    return /^pt\b/i.test(root.lang||'');
  }
  function labels(theme){var portuguese=isPortuguese(),light=theme===LIGHT;if(portuguese)return light?{icon:'☾',visible:'Escuro',action:'Tema claro ativo. Mudar para o modo escuro.'}:{icon:'☀',visible:'Claro',action:'Tema escuro ativo. Mudar para o modo claro.'};return light?{icon:'☾',visible:'Oscuro',action:'Tema claro activo. Cambiar al modo oscuro.'}:{icon:'☀',visible:'Claro',action:'Tema oscuro activo. Cambiar al modo claro.'};}
  function updateControls(theme){var copy=labels(theme);document.querySelectorAll('[data-public-theme-toggle]').forEach(function(button){var icon=button.querySelector('[data-public-theme-icon]'),label=button.querySelector('[data-public-theme-label]');if(icon)icon.textContent=copy.icon;if(label)label.textContent=copy.visible;button.setAttribute('aria-label',copy.action);button.setAttribute('title',copy.action);button.setAttribute('aria-pressed',theme===LIGHT?'true':'false');});}
  function darkThemeColor(){var community=(document.body&&document.body.classList.contains('community-page'))||/(?:^|\/)comunidade\.html$/i.test(location.pathname||'');return community?'#06131f':'#07111f';}
  function apply(theme,persist){var next=theme===LIGHT?LIGHT:DARK;root.dataset.theme=next;root.style.colorScheme=next;var themeColor=document.querySelector('meta[name="theme-color"]');if(themeColor)themeColor.content=next===LIGHT?'#f4f7fb':darkThemeColor();if(persist)safeWrite(next);updateControls(next);try{window.dispatchEvent(new CustomEvent('mednykuto:themechange',{detail:{theme:next}}));}catch(error){}return next;}
  function addScript(src,marker){if(document.querySelector('script['+marker+']'))return;var script=document.createElement('script');script.src=src;script.defer=true;script.setAttribute(marker,'true');document.head.appendChild(script);}
  function loadPageEnhancements(){
    if(/(?:^|\/)p1\.html$/i.test(location.pathname||''))return;
    if(/(?:^|\/)clase\.html$/i.test(location.pathname||'')){
      function revealTaskSections(){var current=document.querySelector('#pendientes .pending-grid'),archive=document.querySelector('#pendientes .assignment-archive');[current,archive].forEach(function(section){if(!section)return;section.hidden=false;section.removeAttribute('aria-hidden');});}
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealTaskSections,{once:true});else revealTaskSections();
      addScript('/class-practical-exams-2026-p1-v500.js?v=500','data-class-practical-exams-p1');
    }
  }
  function bind(){updateControls(root.dataset.theme||DARK);window.setTimeout(function(){updateControls(root.dataset.theme||DARK);},0);document.querySelectorAll('[data-public-theme-toggle]').forEach(function(button){button.addEventListener('click',function(){apply(root.dataset.theme===LIGHT?DARK:LIGHT,true);});});['communityLanguage','classLanguageSelect'].forEach(function(id){var select=document.getElementById(id);if(select)select.addEventListener('change',function(){window.setTimeout(function(){updateControls(root.dataset.theme||DARK);},0);});});}
  loadPageEnhancements();apply(safeRead(),false);window.MedNykutoTheme={apply:apply,current:function(){return root.dataset.theme||DARK;},storageKey:STORAGE_KEY};window.addEventListener('storage',function(event){if(event.key===STORAGE_KEY&&(event.newValue===LIGHT||event.newValue===DARK))apply(event.newValue,false);});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
