/* v296 — compact premium overlay: picker, mobile QCM cleanup, skip mode, correction loader */
(function(){
  'use strict';
  var DATA=window.MED_COURSES_DATA||{courses:[]}, courses=DATA.courses||[];
  var labels={fr:{show:'Voir modules',close:'Fermer',title:'Choisir un module',empty:'Modules bientôt disponibles'},es:{show:'Ver módulos',close:'Cerrar',title:'Elegir un módulo',empty:'Módulos disponibles pronto'},br:{show:'Ver módulos',close:'Fechar',title:'Escolher um módulo',empty:'Módulos em breve'}};
  function lang(){try{return localStorage.getItem('medLang')||document.body.dataset.lang||'fr'}catch(e){return document.body.dataset.lang||'fr'}}
  function L(k){return (labels[lang()]&&labels[lang()][k])||labels.fr[k]||k}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function tx(v){return v&&typeof v==='object'?(v[lang()]||v.es||v.fr||v.br||Object.values(v)[0]||''):String(v||'')}
  function t(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function moduleUrl(m){return 'module.html?id='+encodeURIComponent(m.id)}

  function ensurePicker(){
    var root=document.querySelector('#v210ModulePicker'); if(root)return root;
    root=document.createElement('div'); root.id='v210ModulePicker'; root.className='v210-picker'; root.hidden=true;
    root.innerHTML='<div class="v210-picker-backdrop" data-v210-close="1"></div><section class="v210-picker-panel" role="dialog" aria-modal="true"><div class="v210-picker-head"><div><small id="v210PickerCourseCode"></small><h2 id="v210PickerTitle">'+L('title')+'</h2></div><button class="v210-picker-close" type="button" data-v210-close="1">×</button></div><div class="v210-picker-list"></div></section>';
    document.body.appendChild(root); root.addEventListener('click',function(e){if(e.target&&e.target.getAttribute('data-v210-close')==='1')closePicker()}); document.addEventListener('keydown',function(e){if(e.key==='Escape')closePicker()}); return root;
  }
  function closePicker(){var r=document.querySelector('#v210ModulePicker'); if(r)r.hidden=true; document.body.classList.remove('v210-picker-open')}
  function openPicker(course){
    var r=ensurePicker(), mods=Array.isArray(course.modules)?course.modules:[];
    r.querySelector('#v210PickerCourseCode').textContent=course.code||course.id||'';
    r.querySelector('#v210PickerTitle').textContent=tx(course.title)+' — '+L('title');
    r.querySelector('.v210-picker-list').innerHTML=mods.length?mods.map(function(m){return '<a class="v210-picker-link" href="'+moduleUrl(m)+'"><span>Mód. '+esc(m.number||'')+'</span><strong>'+esc(tx(m.title))+'</strong></a>'}).join(''):'<div class="v210-picker-empty">'+L('empty')+'</div>';
    r.hidden=false; document.body.classList.add('v210-picker-open');
  }
  function enhanceCatalog(){
    if(document.body.dataset.page!=='catalog')return; var grid=document.querySelector('#courseGrid'); if(!grid)return;
    document.querySelectorAll('.course-module-drawer,.v209-module-menu').forEach(function(el){el.remove()});
    Array.from(grid.querySelectorAll('.course-card')).forEach(function(card,i){var c=courses[i]; if(!c||card.dataset.v210Enhanced==='1')return; var b=card.querySelector('.card-actions .btn.primary'); if(!b)return; b.href='#'; b.textContent=L('show')+' ▾'; b.classList.add('v210-toggle'); b.onclick=function(e){e.preventDefault();openPicker(c)}; card.dataset.v210Enhanced='1'});
  }
  function enhanceReader(){if(document.body.dataset.page==='module')document.body.classList.add('v208-reader-comfort')}

  function injectQcmStyle(){
    if(document.getElementById('qcmCleanSkipStyle'))return; var st=document.createElement('style'); st.id='qcmCleanSkipStyle';
    st.textContent='body.qcm-page .answer-panel{display:none!important;visibility:hidden!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}body.qcm-page.qcm-skip-enabled .preanswer-tools,body.qcm-page.qcm-skip-enabled .hint-panel,body.qcm-page.qcm-skip-enabled .unknown-action-wrap,body.qcm-page.qcm-skip-enabled .confidence-panel,body.qcm-page.qcm-skip-enabled .confidence-btn,body.qcm-page.qcm-skip-enabled [data-action="confidence"]{display:none!important;visibility:hidden!important;opacity:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important}body.qcm-page.qcm-skip-enabled .single-nav-actions,body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"]),body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"][disabled]){display:grid!important;grid-template-columns:1fr!important;gap:.45rem!important;margin:.75rem 0 0!important;padding:.75rem 0 0!important;border-top:1px solid rgba(255,255,255,.10)!important}body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;order:1!important;min-height:50px!important;border-color:rgba(245,211,124,.60)!important;background:linear-gradient(135deg,rgba(245,211,124,.36),rgba(245,211,124,.13))!important;color:#ffe7a0!important}body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="previous-question"]{order:2!important;min-height:34px!important;opacity:.62!important}body.qcm-page.qcm-skip-enabled .question-shortcuts{display:none!important}body.qcm-page .premium-bottom-actions{display:none!important}body.qcm-page .single-question-card{scroll-margin-top:calc(175px + env(safe-area-inset-top,0px))!important}@media(max-width:760px){body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{min-height:48px!important;font-size:.96rem!important}}';
    document.head.appendChild(st);
  }
  function upgradePickerLabels(){document.querySelectorAll('.mc-picker-btn').forEach(function(b){if(b.dataset.premiumLabel==='1')return;var raw=t(b),isM=b.classList.contains('module')||/^Mod\./i.test(raw),label=isM?'Module':'Matière',val=raw.replace(/^Mat\.:?\s*/i,'').replace(/^Mod\.:?\s*/i,'').trim();b.innerHTML='<span class="premium-filter-label">'+label+'</span><strong>'+esc(val||'Toutes')+'</strong><span class="premium-filter-change">Changer ▾</span>';b.dataset.premiumLabel='1'})}
  function progressNumbers(){var s=t(document.querySelector('.practice-focus-section')||document.body),m=s.match(/\b(\d{1,2})\s*\/\s*(20)\b/),c=m?Math.max(1,Math.min(20,parseInt(m[1],10))):1,total=m?parseInt(m[2],10):20;return{c:c,total:total,p:Math.round(c/total*100)}}
  function ensureProgress(){var picker=document.querySelector('.mc-picker-shell'); if(!picker)return; var bar=document.querySelector('.premium-progress'); if(!bar){bar=document.createElement('div');bar.className='premium-progress';picker.insertAdjacentElement('afterend',bar)} var p=progressNumbers(); bar.innerHTML='<div class="premium-progress-head"><strong>Question '+p.c+'/'+p.total+'</strong><span>'+p.p+'%</span></div><div class="premium-progress-track"><i style="width:'+p.p+'%"></i></div>'}
  function collapseWeakness(){var root=document.querySelector('.practice-focus-section')||document.body;Array.from(root.querySelectorAll('section,article,div')).forEach(function(el){if(el.closest('.single-question-card,.premium-progress,.mc-picker-shell'))return;var s=t(el);if(s.length>45&&s.length<1700&&/Mes points faibles|Puntos débiles|Pontos fracos|ADAPTATIF|ADAPTATIVO/i.test(s)&&/réponses|respuestas|respostas|erreurs|errores|je ne sais pas|no sé|não sei/i.test(s)){el.classList.add('premium-weak-hidden','premium-weak-removed');el.style.display='none';el.setAttribute('aria-hidden','true')}});document.querySelectorAll('.premium-weak-summary,.premium-weak-summary-v2').forEach(function(el){el.remove()})}
  function enableSkip(){document.body.classList.add('qcm-skip-enabled');document.querySelectorAll('.single-nav-actions .btn[data-action="next-question"]').forEach(function(b){b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false')});document.querySelectorAll('.preanswer-tools,.hint-panel,.unknown-action-wrap').forEach(function(el){el.hidden=true;el.setAttribute('aria-hidden','true')})}
  function cleanQuestionText(){var r=document.querySelector('#practiceList')||document.body,w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(function(n){var s=n.nodeValue,o=s;s=s.replace(/,?\s*¿qué afirmación es correcta, célula, fase ni localización\?/gi,', ¿cuál afirmación es correcta?').replace(/¿qué proposición mantiene la relación correcta entre causa, mecanismo y consecuencia\?/gi,'¿cuál proposición es correcta?');if(s!==o)n.nodeValue=s})}
  function loadPremiumCorrection(){if(document.getElementById('premiumCorrectionScript'))return;var s=document.createElement('script');s.id='premiumCorrectionScript';s.src='premium-correction-v295.js?v=296';s.defer=true;document.body.appendChild(s)}
  function enhanceQcm(){if(!document.body.classList.contains('qcm-page'))return;document.body.classList.add('premium-qcm');injectQcmStyle();upgradePickerLabels();ensureProgress();collapseWeakness();enableSkip();cleanQuestionText();loadPremiumCorrection()}
  function apply(){enhanceCatalog();enhanceReader();enhanceQcm()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){[0,120,350,900,1800,3200].forEach(function(ms){setTimeout(apply,ms)})});else[0,120,350,900,1800,3200].forEach(function(ms){setTimeout(apply,ms)});
  if(window.MutationObserver)new MutationObserver(function(){clearTimeout(window.__premiumQcmTimer);window.__premiumQcmTimer=setTimeout(apply,60)}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});
})();
