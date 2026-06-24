/* v299 — Med Nykuto stability overlay: default ES, Biofísica soon, Cloudflare forms, data guards. */
(function(){
  'use strict';

  var DEFAULT_LANG = 'es';
  var SUPPORT_EMAIL = 'drs.oliveirasantos@gmail.com';
  var DATA = window.MED_COURSES_DATA || {courses:[]};
  var courses = DATA.courses || [];
  var labels = {
    fr:{show:'Voir modules',close:'Fermer',title:'Choisir un module',empty:'Modules bientôt disponibles',soon:'Bientôt disponible'},
    es:{show:'Ver módulos',close:'Cerrar',title:'Elegir un módulo',empty:'Módulos disponibles pronto',soon:'Próximamente'},
    br:{show:'Ver módulos',close:'Fechar',title:'Escolher um módulo',empty:'Módulos em breve',soon:'Em breve'}
  };

  function safeGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function safeSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function normalizeLang(v){return /^(fr|es|br)$/.test(v||'') ? v : DEFAULT_LANG;}
  function ensureDefaultLang(){
    var current = safeGet('medLang');
    if(!current || !/^(fr|es|br)$/.test(current)) safeSet('medLang', DEFAULT_LANG);
    document.documentElement.lang = normalizeLang(safeGet('medLang'));
    if(document.body) document.body.dataset.lang = normalizeLang(safeGet('medLang'));
  }
  ensureDefaultLang();

  function lang(){return normalizeLang(safeGet('medLang') || (document.body && document.body.dataset.lang) || DEFAULT_LANG);}
  function L(k){return (labels[lang()]&&labels[lang()][k])||labels.es[k]||k;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function tx(v){return v&&typeof v==='object'?(v[lang()]||v.es||v.fr||v.br||Object.values(v)[0]||''):String(v||'');}
  function t(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
  function moduleUrl(m){return 'module.html?id='+encodeURIComponent(m.id);}
  function isBiofisica(course){return /biof[ií]sica/i.test(String(course && (course.id+' '+tx(course.title)+' '+course.title)) || '');}
  function isSoonCourse(course){return isBiofisica(course) || !((course && course.modules) || []).length || Number(course && course.moduleCount || 0) === 0;}

  function ensurePicker(){
    var root=document.querySelector('#v210ModulePicker'); if(root)return root;
    root=document.createElement('div'); root.id='v210ModulePicker'; root.className='v210-picker'; root.hidden=true;
    root.innerHTML='<div class="v210-picker-backdrop" data-v210-close="1"></div><section class="v210-picker-panel" role="dialog" aria-modal="true"><div class="v210-picker-head"><div><small id="v210PickerCourseCode"></small><h2 id="v210PickerTitle">'+L('title')+'</h2></div><button class="v210-picker-close" type="button" data-v210-close="1">×</button></div><div class="v210-picker-list"></div></section>';
    document.body.appendChild(root);
    root.addEventListener('click',function(e){if(e.target&&e.target.getAttribute('data-v210-close')==='1')closePicker();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closePicker();});
    return root;
  }
  function closePicker(){var r=document.querySelector('#v210ModulePicker'); if(r)r.hidden=true; document.body.classList.remove('v210-picker-open');}
  function openPicker(course){
    var r=ensurePicker(), mods=Array.isArray(course.modules)?course.modules:[];
    r.querySelector('#v210PickerCourseCode').textContent=course.code||course.id||'';
    r.querySelector('#v210PickerTitle').textContent=tx(course.title)+' — '+L('title');
    r.querySelector('.v210-picker-list').innerHTML=mods.length?mods.map(function(m){return '<a class="v210-picker-link" href="'+moduleUrl(m)+'"><span>Mód. '+esc(m.number||'')+'</span><strong>'+esc(tx(m.title))+'</strong></a>';}).join(''):'<div class="v210-picker-empty">'+L('empty')+'</div>';
    r.hidden=false; document.body.classList.add('v210-picker-open');
  }
  function enhanceCatalog(){
    if(document.body.dataset.page!=='catalog')return; var grid=document.querySelector('#courseGrid'); if(!grid)return;
    document.querySelectorAll('.course-module-drawer,.v209-module-menu').forEach(function(el){el.remove();});
    Array.from(grid.querySelectorAll('.course-card')).forEach(function(card,i){
      var c=courses[i]; if(!c||card.dataset.v210Enhanced==='1')return;
      if(isSoonCourse(c)){
        card.classList.add('is-coming-soon','biofisica-soon-card');
        var action=card.querySelector('.card-actions');
        var btn=card.querySelector('.card-actions .btn.primary,.card-actions .btn.secondary,.card-actions a');
        if(btn){btn.removeAttribute('href'); btn.setAttribute('aria-disabled','true'); btn.classList.add('disabled'); btn.textContent=L('soon'); btn.onclick=function(e){e.preventDefault();};}
        if(action && !action.querySelector('.soon-badge')) action.insertAdjacentHTML('afterbegin','<span class="soon-badge">'+L('soon')+'</span>');
        card.querySelectorAll('.module-count,.course-count,.stat').forEach(function(el){if(/0\s*module/i.test(t(el)))el.textContent=L('soon');});
      } else {
        var b=card.querySelector('.card-actions .btn.primary');
        if(b){b.href='#'; b.textContent=L('show')+' ▾'; b.classList.add('v210-toggle'); b.onclick=function(e){e.preventDefault();openPicker(c);};}
      }
      card.dataset.v210Enhanced='1';
    });
  }
  function enhanceReader(){if(document.body.dataset.page==='module')document.body.classList.add('v208-reader-comfort');}

  function injectQcmStyle(){
    if(document.getElementById('qcmCleanSkipStyle'))return; var st=document.createElement('style'); st.id='qcmCleanSkipStyle';
    st.textContent='body.qcm-page .answer-panel{display:none!important;visibility:hidden!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}body.qcm-page.qcm-skip-enabled .preanswer-tools,body.qcm-page.qcm-skip-enabled .hint-panel,body.qcm-page.qcm-skip-enabled .unknown-action-wrap,body.qcm-page.qcm-skip-enabled .confidence-panel,body.qcm-page.qcm-skip-enabled .confidence-btn,body.qcm-page.qcm-skip-enabled [data-action="confidence"]{display:none!important;visibility:hidden!important;opacity:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important}body.qcm-page.qcm-skip-enabled .single-nav-actions,body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"]),body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"][disabled]){display:grid!important;grid-template-columns:1fr!important;gap:.45rem!important;margin:.75rem 0 0!important;padding:.75rem 0 0!important;border-top:1px solid rgba(255,255,255,.10)!important}body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;order:1!important;min-height:50px!important;border-color:rgba(245,211,124,.60)!important;background:linear-gradient(135deg,rgba(245,211,124,.36),rgba(245,211,124,.13))!important;color:#ffe7a0!important}body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="previous-question"]{order:2!important;min-height:34px!important;opacity:.62!important}body.qcm-page.qcm-skip-enabled .question-shortcuts{display:none!important}body.qcm-page .premium-bottom-actions{display:none!important}body.qcm-page .single-question-card{scroll-margin-top:calc(175px + env(safe-area-inset-top,0px))!important}.soon-badge,.stability-badge{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(245,211,124,.42);background:rgba(245,211,124,.12);color:#ffe7a0;border-radius:999px;padding:.32rem .62rem;font-weight:900;font-size:.78rem}.is-coming-soon{opacity:.78}.is-coming-soon .btn.disabled{pointer-events:none;opacity:.78}.data-load-warning{margin:1rem 0;padding:1rem;border:1px solid rgba(245,211,124,.35);border-radius:18px;background:rgba(245,211,124,.10);color:#ffe7a0}.data-load-warning strong{display:block;margin-bottom:.35rem;color:#fff}.data-load-warning p{margin:.2rem 0;color:rgba(226,232,240,.86)}@media(max-width:760px){body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{min-height:48px!important;font-size:.96rem!important}}';
    document.head.appendChild(st);
  }
  function upgradePickerLabels(){document.querySelectorAll('.mc-picker-btn').forEach(function(b){if(b.dataset.premiumLabel==='1')return;var raw=t(b),isM=b.classList.contains('module')||/^Mod\./i.test(raw),label=isM?'Módulo':'Materia',val=raw.replace(/^Mat\.:?\s*/i,'').replace(/^Mod\.:?\s*/i,'').trim();b.innerHTML='<span class="premium-filter-label">'+label+'</span><strong>'+esc(val||'Todas')+'</strong><span class="premium-filter-change">Cambiar ▾</span>';b.dataset.premiumLabel='1';});}
  function progressNumbers(){var s=t(document.querySelector('.practice-focus-section')||document.body),m=s.match(/\b(\d{1,2})\s*\/\s*(20)\b/),c=m?Math.max(1,Math.min(20,parseInt(m[1],10))):1,total=m?parseInt(m[2],10):20;return{c:c,total:total,p:Math.round(c/total*100)};}
  function ensureProgress(){var picker=document.querySelector('.mc-picker-shell'); if(!picker)return; var bar=document.querySelector('.premium-progress'); if(!bar){bar=document.createElement('div');bar.className='premium-progress';picker.insertAdjacentElement('afterend',bar);} var p=progressNumbers(); bar.innerHTML='<div class="premium-progress-head"><strong>Pregunta '+p.c+'/'+p.total+'</strong><span>'+p.p+'%</span></div><div class="premium-progress-track"><i style="width:'+p.p+'%"></i></div>';}
  function collapseWeakness(){var root=document.querySelector('.practice-focus-section')||document.body;Array.from(root.querySelectorAll('section,article,div')).forEach(function(el){if(el.closest('.single-question-card,.premium-progress,.mc-picker-shell'))return;var s=t(el);if(s.length>45&&s.length<1700&&/Mes points faibles|Puntos débiles|Pontos fracos|ADAPTATIF|ADAPTATIVO/i.test(s)&&/réponses|respuestas|respostas|erreurs|errores|je ne sais pas|no sé|não sei/i.test(s)){el.classList.add('premium-weak-hidden','premium-weak-removed');el.style.display='none';el.setAttribute('aria-hidden','true');}});document.querySelectorAll('.premium-weak-summary,.premium-weak-summary-v2').forEach(function(el){el.remove();});}
  function enableSkip(){document.body.classList.add('qcm-skip-enabled');document.querySelectorAll('.single-nav-actions .btn[data-action="next-question"]').forEach(function(b){b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false');});document.querySelectorAll('.preanswer-tools,.hint-panel,.unknown-action-wrap').forEach(function(el){el.hidden=true;el.setAttribute('aria-hidden','true');});}
  function cleanQuestionText(){var r=document.querySelector('#practiceList')||document.body,w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(function(n){var s=n.nodeValue,o=s;s=s.replace(/,?\s*¿qué afirmación es correcta, célula, fase ni localización\?/gi,', ¿cuál afirmación es correcta?').replace(/¿qué proposición mantiene la relación correcta entre causa, mecanismo y consecuencia\?/gi,'¿cuál proposición es correcta?');if(s!==o)n.nodeValue=s;});}
  function loadPremiumCorrection(){if(document.getElementById('premiumCorrectionScript'))return;var s=document.createElement('script');s.id='premiumCorrectionScript';s.src='premium-correction-v295.js?v=296';s.defer=true;document.body.appendChild(s);}
  function enhanceQcm(){if(!document.body.classList.contains('qcm-page'))return;document.body.classList.add('premium-qcm');injectQcmStyle();upgradePickerLabels();ensureProgress();collapseWeakness();enableSkip();cleanQuestionText();loadPremiumCorrection();}

  function patchBrandAndStaticSpanish(){
    document.documentElement.lang=lang();
    var title=document.title||''; if(/Med Cursos/i.test(title)) document.title=title.replace(/Med Cursos/g,'Med Nykuto').replace('Accueil','Inicio');
    document.querySelectorAll('img[alt="Med Cursos"]').forEach(function(img){img.alt='Med Nykuto';});
    document.querySelectorAll('meta[property="og:site_name"],meta[property="og:title"],meta[name="description"],meta[property="og:description"]').forEach(function(m){var v=m.getAttribute('content')||''; if(v)m.setAttribute('content',v.replace(/Med Cursos/g,'Med Nykuto').replace(/med-cursos\.netlify\.app/g,'med.nykuto.com'));});
    document.querySelectorAll('link[rel="canonical"],meta[property="og:url"]').forEach(function(el){var attr=el.tagName==='LINK'?'href':'content';var v=el.getAttribute(attr)||''; if(v)el.setAttribute(attr,v.replace('https://med-cursos.netlify.app','https://med.nykuto.com'));});
    var replacements=[
      ['Med Cursos','Med Nykuto'],['RÉVISION IMMÉDIATE','REVISIÓN INMEDIATA'],['Médecine · révision structurée','Medicina · revisión estructurada'],['Étudie médecine avec un plan clair, actif et rapide.','Estudia medicina con un plan claro, activo y rápido.'],['Choisis une matière, révise le cours, entraîne-toi avec des QCM et corrige tes erreurs sans perdre de temps.','Elige una materia, revisa el curso, entrena con QCM y corrige tus errores sin perder tiempo.'],['Commencer à réviser','Comenzar a revisar'],['Voir tous les modules','Ver todos los módulos'],['Revoir mes erreurs','Revisar mis errores'],['Projet gratuit · soutien libre','Proyecto gratuito · apoyo voluntario'],['Soutenir le projet','Apoyar el proyecto'],['Copier le code Pix','Copiar código Pix'],['Si Julius voyait la facture du serveur, il aurait déjà coupé le routeur.','Si Julius viera la factura del servidor, ya habría apagado el router.'],['Un petit Pix et les QCM continuent de tourner.','Con un Pix, los QCM siguen funcionando.'],['Choisis une matière','Elige una materia'],['Ouvre Physiologie, Biochimie, Microbiologie, Génétique ou Immunologie.','Abre Fisiología, Bioquímica, Microbiología, Genética o Inmunología.'],['Lis le cours ou la fiche','Lee el curso o la ficha'],['Passe du cours complet à la fiche rapide ou à l’ultra-résumé.','Pasa del curso completo a la ficha rápida o al ultra-resumen.'],['Entraîne-toi activement','Entrena de forma activa'],['Fais des QCM, cas cliniques et vrai/faux, puis revois tes erreurs.','Haz QCM, casos clínicos y verdadero/falso, luego revisa tus errores.'],['Matières présentes','Materias presentes'],['Matières','Materias'],['Modules intégrés','Módulos integrados'],['Progression totale','Progreso total'],['Réinitialiser','Reiniciar'],['Projet ouvert','Proyecto abierto'],['Gratuit pour étudier, soutenu par la communauté.','Gratis para estudiar, sostenido por la comunidad.'],['L’objectif est simple : rendre les cours, les fiches et les entraînements accessibles sans barrière.','El objetivo es simple: hacer que cursos, fichas y entrenamientos sean accesibles sin barreras.'],['Bibliothèque médicale organisée pour réviser plus vite.','Biblioteca médica organizada para revisar más rápido.'],['À propos','Acerca de'],['Mentions','Aviso legal'],['cas cliniques','casos clínicos'],['vrai/faux','verdadero/falso'],['0 module','Próximamente'],['Entrenar maintenant','Entrenar ahora'],['Razonar como examen','Razonar como en examen'],['Corriger ce qui bloque','Corregir lo que bloquea']
    ];
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(n){var s=n.nodeValue,o=s; replacements.forEach(function(pair){s=s.split(pair[0]).join(pair[1]);}); if(s!==o)n.nodeValue=s;});
  }

  function patchHomeStatsAndBiofisica(){
    var stat=document.querySelector('#statCursoes'); if(stat) stat.textContent='5';
    var small=stat&&stat.parentElement&&stat.parentElement.querySelector('small'); if(small) small.textContent='Materias activas';
    document.querySelectorAll('.subject-progress-card').forEach(function(card){
      if(/Biof[ií]sica/i.test(t(card))){card.classList.add('is-coming-soon','biofisica-soon-card'); var span=card.querySelector('span'); if(span) span.textContent=L('soon'); var pct=card.querySelector('.subject-progress-pct'); if(pct)pct.textContent='—'; var bar=card.querySelector('.mini-progress i'); if(bar)bar.style.width='0%';}
    });
  }

  function patchContactForms(){
    document.querySelectorAll('form[data-netlify],form[netlify-honeypot],form[name="site-contact"],form[name="question-feedback"]').forEach(function(form){
      if(form.dataset.cloudflarePatched==='1')return;
      form.dataset.cloudflarePatched='1'; form.removeAttribute('data-netlify'); form.removeAttribute('netlify-honeypot'); form.setAttribute('method','POST'); form.setAttribute('action','#');
      if(form.name==='site-contact' && form.parentNode && !document.querySelector('.cloudflare-contact-note')){
        var note=document.createElement('div'); note.className='data-load-warning cloudflare-contact-note'; note.innerHTML='<strong>Formulario Cloudflare</strong><p>Esta versión ya no depende de Netlify Forms. El envío abre un email prellenado para evitar perder mensajes.</p>'; form.parentNode.insertBefore(note,form);
      }
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var fd=new FormData(form), subject='Med Nykuto — '+(fd.get('type')||fd.get('issue_type')||form.name||'mensaje');
        var body=['Página: '+location.href,'Formulario: '+(form.name||''),'Nombre: '+(fd.get('name')||''),'Email: '+(fd.get('email')||''),'Tipo: '+(fd.get('type')||fd.get('issue_type')||''),'Materia: '+(fd.get('course')||''),'Módulo: '+(fd.get('module')||fd.get('module_id')||''),'Pregunta: '+(fd.get('question_id')||''),'','Mensaje:',fd.get('message')||fd.get('comment')||''].join('\n');
        location.href='mailto:'+SUPPORT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      },true);
    });
  }

  function patchLegalNetlifyText(){
    var replacements=[['Netlify Forms','Cloudflare Pages'],['Les formulaires de contact et de signalement sont envoyés via Cloudflare Pages.','Los formularios de contacto y reporte funcionan en modo compatible con Cloudflare Pages.'],['Les formulaires de contact et de signalement passent par Cloudflare Pages afin de consulter les retours et corriger le site.','Los formularios de contacto y reporte funcionan en modo compatible con Cloudflare Pages para revisar comentarios y corregir el sitio.']];
    document.querySelectorAll('p,li,span,strong,h1,h2,h3').forEach(function(el){var s=t(el); if(!s)return; replacements.forEach(function(pair){if(s.indexOf(pair[0])>-1)el.textContent=s.replace(pair[0],pair[1]);});});
  }

  function dataGuard(){
    var hasCourseData=!!(window.MED_COURSES_DATA && Array.isArray(window.MED_COURSES_DATA.courses) && window.MED_COURSES_DATA.courses.length);
    var hasBank=!!(window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse);
    window.__MED_NYKUTO_STABILITY__={version:'v299',defaultLang:DEFAULT_LANG,courseCount:hasCourseData?window.MED_COURSES_DATA.courses.length:0,hasBank:hasBank,protectedDataFiles:true};
    if(hasCourseData)return;
    var target=document.querySelector('main')||document.body;
    if(target && !document.querySelector('.data-load-warning.data-guard')){
      var warn=document.createElement('div'); warn.className='data-load-warning data-guard'; warn.innerHTML='<strong>Datos no cargados</strong><p>Los archivos /data no se han cargado todavía. Recarga la página antes de concluir que faltan módulos o preguntas.</p><button class="btn secondary" type="button" onclick="location.reload()">Recargar</button>'; target.insertBefore(warn,target.firstChild);
    }
  }

  function apply(){ensureDefaultLang();injectQcmStyle();enhanceCatalog();enhanceReader();enhanceQcm();patchBrandAndStaticSpanish();patchHomeStatsAndBiofisica();patchContactForms();patchLegalNetlifyText();dataGuard();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){[0,120,350,900,1800,3200].forEach(function(ms){setTimeout(apply,ms);});});else[0,120,350,900,1800,3200].forEach(function(ms){setTimeout(apply,ms);});
  if(window.MutationObserver)new MutationObserver(function(){clearTimeout(window.__premiumQcmTimer);window.__premiumQcmTimer=setTimeout(apply,90);}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});
})();
