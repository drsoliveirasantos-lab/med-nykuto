/* v303 — Med Nykuto lightweight QCM picker/progress layer.
   QCM rule: app.bundle.js owns questions, answers and navigation.
   This file may add the course/module picker and mirror the visible native progress bar only.
   It must not hide corrections, enable skip, load correction scripts, or observe QCM rerenders. */
(function(){
  'use strict';
  var SITE_VERSION = 'v303-qcm-picker-progress-only';
  var DATA = window.MED_COURSES_DATA || {courses:[]};
  var courses = DATA.courses || [];
  var labels = {
    fr:{subject:'Matière',module:'Module',change:'Changer',allSubjects:'Toutes les matières',allModules:'Tous les modules',allBank:'Toute la banque',soon:'Bientôt disponible'},
    es:{subject:'Materia',module:'Módulo',change:'Cambiar',allSubjects:'Todas las materias',allModules:'Todos los módulos',allBank:'Toda la banca',soon:'Próximamente'},
    br:{subject:'Matéria',module:'Módulo',change:'Trocar',allSubjects:'Todas as matérias',allModules:'Todos os módulos',allBank:'Todo o banco',soon:'Em breve'}
  };

  function safeGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function safeSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function lang(){var l=safeGet('medLang') || (document.body && document.body.dataset.lang) || 'es';return /^(fr|es|br)$/.test(l)?l:'es';}
  function L(k){return (labels[lang()] && labels[lang()][k]) || labels.es[k] || k;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function tx(v){return v&&typeof v==='object'?(v[lang()]||v.es||v.fr||v.br||Object.values(v)[0]||''):String(v||'');}
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function params(){return new URLSearchParams(location.search);}
  function isQcm(){return !!(document.body && document.body.classList.contains('qcm-page'));}
  function isBiofisica(course){return /biof[ií]sica/i.test(String((course&&course.id)||'')+' '+tx(course&&course.title||''));}
  function isSoonCourse(course){return isBiofisica(course)||!((course&&course.modules)||[]).length;}
  function raw(x){return clean(x&&typeof x==='object'?(x.title||x.name||x.label||x.fr||x.es||x.br||Object.values(x)[0]):x);}
  function titleCase(s){return clean(String(s||'').replace(/[-_]+/g,' ')).replace(/\b\w/g,function(a){return a.toUpperCase();});}
  function fromId(id){var s=String(id||'').toLowerCase();s=s.replace(/^(course|module|mod|physio|fisiologia|fisiología|bioquimica|genetica|microbiologia|inmunologia)[-_]*/g,'').replace(/v\d+/g,'').replace(/\d{2,}/g,'').replace(/[-_]+/g,' ');return titleCase(s);}
  function courseById(id){return courses.find(function(c){return String(c.id)===String(id);});}
  function moduleInfo(id){var r=null;courses.forEach(function(c){(c.modules||[]).forEach(function(m,i){if(String(m.id)===String(id))r={course:c,module:m,index:i};});});return r;}
  function courseLabel(c){var s=raw(c);if(/fisiolog/i.test(s))return 'Fisiología';if(/gen/i.test(s))return 'Genética';if(/micro/i.test(s))return 'Microbiología';if(/bioqu/i.test(s))return 'Bioquímica';if(/inmun/i.test(s))return 'Inmunología';if(/biof/i.test(s))return 'Biofísica';return s.length>28?s.slice(0,27)+'…':s;}
  function moduleLabel(m,i,c){var label=raw(m&&m.shortTitle)||raw(m&&m.moduleTitle)||raw(m);var cn=courseLabel(c||'');label=label.replace(/fisiolog[ií]a\s+fisiolog[ií]a/ig,'Fisiología').replace(/^fisiolog[ií]a\s*/i,'');if(!label||label===cn||/^fisiolog/i.test(label)||/^module\s*\d*$/i.test(label))label=fromId(m&&m.id)||('Módulo '+(i+1));if(/cardio/i.test(label))label='Cardio';if(label.length<3)label='Módulo '+(i+1);return label.length>34?label.slice(0,33)+'…':label;}
  function current(){var p=params(),mi=moduleInfo(p.get('module')||''),cid=p.get('course')||(mi&&mi.course.id)||'',c=courseById(cid),mid=p.get('module')||'',m=mi&&mi.module,ix=mi?mi.index:0;return{cid:cid,c:c,mid:mid,m:m,index:ix};}

  function ensureDefaultLang(){if(!safeGet('medLang'))safeSet('medLang','es');document.documentElement.lang=lang();if(document.body)document.body.dataset.lang=lang();}

  function injectQcmStyle(){
    if(document.getElementById('qcmCleanPickerStyleV303')) return;
    var old = document.getElementById('qcmCleanSkipStyle');
    if(old) old.remove();
    var st=document.createElement('style');
    st.id='qcmCleanPickerStyleV303';
    st.textContent = [
      '.mc-picker-shell{display:grid;gap:.48rem;margin:.32rem 0 .42rem;max-width:100%;grid-template-columns:repeat(2,minmax(0,1fr))}',
      '.mc-picker-btn{width:100%;min-height:40px;border-radius:16px;border:1px solid rgba(245,211,124,.55);background:rgba(245,211,124,.12);color:#ffe7a0;font-weight:900;text-align:left;padding:.45rem 4.75rem .45rem .58rem;font-size:.78rem;line-height:1.06;touch-action:manipulation;position:relative;overflow:hidden}',
      '.mc-picker-btn.module{border-color:rgba(86,180,255,.55);background:rgba(56,189,248,.10);color:#dff3ff}',
      '.premium-filter-label{display:block;text-transform:uppercase;font-size:.54rem;letter-spacing:.12em;opacity:.62;margin-bottom:.08rem}',
      '.mc-picker-btn strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.92rem}',
      '.premium-filter-change{position:absolute;right:.58rem;top:50%;transform:translateY(-50%);font-size:.64rem;opacity:.68}',
      '.premium-progress{margin:.2rem 0 .72rem;padding:.62rem .72rem;border-radius:18px;border:1px solid rgba(245,211,124,.22);background:rgba(255,255,255,.035)}',
      '.premium-progress-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:.42rem;color:#f8fafc;font-size:.78rem;font-weight:900}',
      '.premium-progress-head span{color:#ffe7a0}',
      '.premium-progress-track{height:7px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden}',
      '.premium-progress-track i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#f5d37c,#ffe7a0);transition:width .18s ease}',
      '@media(max-width:760px){.mc-picker-shell{grid-template-columns:repeat(2,minmax(0,1fr));gap:.48rem}}',
      '@media(max-width:360px){.mc-picker-shell{grid-template-columns:1fr}.mc-picker-btn{padding-right:4.75rem}}'
    ].join('');
    document.head.appendChild(st);
  }

  function ensureQcmPicker(){
    if(!isQcm()) return;
    var anchor = document.querySelector('#practiceList') || document.querySelector('#courseFilters');
    if(!anchor || !anchor.parentNode) return;
    var shell = document.querySelector('.mc-picker-shell');
    if(!shell){
      shell = document.createElement('div');
      shell.className = 'mc-picker-shell';
      shell.innerHTML = '<button type="button" class="mc-picker-btn subject"></button><button type="button" class="mc-picker-btn module"></button>';
      anchor.parentNode.insertBefore(shell, anchor);
    }
    var c = current();
    var b1 = shell.querySelector('.subject');
    var b2 = shell.querySelector('.module');
    if(b1){
      b1.dataset.premiumLabel = '1';
      b1.innerHTML = '<span class="premium-filter-label">'+esc(L('subject'))+'</span><strong>'+esc(c.c?courseLabel(c.c):L('allSubjects'))+'</strong><span class="premium-filter-change">'+esc(L('change'))+' ▾</span>';
    }
    if(b2){
      b2.dataset.premiumLabel = '1';
      b2.innerHTML = '<span class="premium-filter-label">'+esc(L('module'))+'</span><strong>'+esc(c.m?moduleLabel(c.m,c.index,c.c):(c.c?L('allModules'):L('allBank')))+'</strong><span class="premium-filter-change">'+esc(L('change'))+' ▾</span>';
    }
    window.__MED_NYKUTO_STABILITY__ = {version:SITE_VERSION, defaultLang:'es', protectedDataFiles:true, qcmPickerOnly:true};
  }

  function progressNumbers(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.single-question-card .quiz-head .badge, .question-count-stat strong, .premium-progress strong'));
    for(var i=0;i<nodes.length;i+=1){
      var m = clean(nodes[i].textContent).match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if(m){
        var c = Math.max(1, Number(m[1] || 1));
        var total = Math.max(1, Number(m[2] || 20));
        return {c:c,total:total,p:Math.max(0,Math.min(100,Math.round(c/total*100)))};
      }
    }
    return {c:1,total:20,p:5};
  }

  function ensureProgress(){
    if(!isQcm()) return;
    var picker = document.querySelector('.mc-picker-shell');
    if(!picker) return;
    var bar = document.querySelector('.premium-progress');
    if(!bar){
      bar = document.createElement('div');
      bar.className = 'premium-progress';
      picker.insertAdjacentElement('afterend', bar);
    }
    var p = progressNumbers();
    bar.innerHTML = '<div class="premium-progress-head"><strong>Pregunta '+p.c+'/'+p.total+'</strong><span>'+p.p+'%</span></div><div class="premium-progress-track"><i style="width:'+p.p+'%"></i></div>';
  }

  function patchSmallStaticBits(){
    document.title=(document.title||'').replace(/Med Cursos/g,'Med Nykuto').replace('Accueil','Inicio');
    document.querySelectorAll('img[alt="Med Cursos"]').forEach(function(img){img.alt='Med Nykuto';});
  }

  function apply(){
    ensureDefaultLang();
    injectQcmStyle();
    ensureQcmPicker();
    ensureProgress();
    patchSmallStaticBits();
  }

  function scheduleProgress(){
    requestAnimationFrame(function(){ ensureProgress(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  window.addEventListener('pageshow', apply);
  window.addEventListener('load', apply);
  document.addEventListener('click', scheduleProgress, true);
})();
