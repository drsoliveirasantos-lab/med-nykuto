/* v317 — Stable premium practice picker for Casos clínicos and V/F.
   Fix: choosing a Materia now writes a real bank course id (fisiologia, genetica, etc.) and does not fall back to all. */
(function(){
  'use strict';

  var FIXED_COURSES = [
    {id:'fisiologia', label:'Fisiología'},
    {id:'microbiologia', label:'Microbiología'},
    {id:'genetica', label:'Genética'},
    {id:'bioquimica', label:'Bioquímica'},
    {id:'inmunologia', label:'Inmunología'}
  ];

  function bank(){ return (window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse) || {}; }
  function dataCourses(){ return (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || []; }
  function params(){ return new URLSearchParams(location.search || ''); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function raw(x){ if(x&&typeof x==='object') return clean(x.title||x.name||x.label||x.es||x.fr||x.br||Object.values(x)[0]); return clean(x); }
  function labelFromId(id){ var f=FIXED_COURSES.find(function(c){return c.id===id}); return f?f.label:id; }
  function pageType(){ return document.body.dataset.practiceType || 'qcm'; }
  function isTargetPage(){ return document.body && document.body.dataset.page==='practice' && !document.body.classList.contains('qcm-page'); }
  function activeCourseId(){ return params().get('course') || ''; }
  function activeModuleId(){ return params().get('module') || ''; }

  function courses(){
    var ids = new Set(FIXED_COURSES.map(function(c){return c.id;}));
    Object.keys(bank()).forEach(function(id){ if(id) ids.add(id); });
    dataCourses().forEach(function(c){ if(c && c.id && !/biof/i.test(c.id)) ids.add(c.id); });
    return Array.from(ids).map(function(id){ return {id:id, label:labelFromId(id), data:dataCourses().find(function(c){return c.id===id})||null}; })
      .filter(function(c){ return !/biof/i.test(c.id); });
  }

  function inferModules(courseId){
    var fromData = (dataCourses().find(function(c){return c.id===courseId}) || {}).modules || [];
    if(fromData.length){
      return fromData.map(function(m,i){ return {id:m.id, number:m.number||i+1, title:raw(m.shortTitle||m.moduleTitle||m.title||m.name)||('Módulo '+(i+1))}; });
    }
    var b = bank()[courseId] || {};
    var map = new Map();
    ['qcm','cases','vf'].forEach(function(kind){
      (b[kind]||[]).forEach(function(it){
        var mid = it.moduleId || it.module || it.module_id || '';
        if(!mid) return;
        var num = it.moduleNumber || it.module_number || '';
        var title = raw(it.moduleTitle || it.module_title || '') || (num ? 'Módulo '+num : mid);
        if(!map.has(mid)) map.set(mid,{id:mid, number:num||map.size+1, title:title});
      });
    });
    return Array.from(map.values()).sort(function(a,b){ return Number(a.number||999)-Number(b.number||999); });
  }

  function moduleInfo(mid){
    var cid = activeCourseId();
    var list = cid ? inferModules(cid) : [];
    var found = list.find(function(m){ return String(m.id)===String(mid); });
    return found || null;
  }

  function go(kind,id){
    var p = params();
    if(kind === 'course'){
      if(id) p.set('course', id); else p.delete('course');
      p.delete('module');
    }else if(kind === 'module'){
      if(id) p.set('module', id); else p.delete('module');
      var cid = activeCourseId();
      if(cid) p.set('course', cid);
    }
    var url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    window.location.assign(url);
  }

  function ensureShell(){
    if(!isTargetPage()) return;
    var anchor = document.querySelector('#practiceList') || document.querySelector('#courseFilters');
    if(!anchor) return;
    var shell = document.querySelector('.practice-force-picker-shell');
    if(!shell){
      shell = document.createElement('div');
      shell.className = 'practice-force-picker-shell';
      shell.innerHTML = '<button type="button" class="pfp-btn subject"></button><button type="button" class="pfp-btn module"></button>';
      anchor.parentNode.insertBefore(shell, anchor);
    }
    var cid = activeCourseId();
    var mid = activeModuleId();
    var m = mid ? moduleInfo(mid) : null;
    var b1 = shell.querySelector('.subject');
    var b2 = shell.querySelector('.module');
    if(b1) b1.innerHTML = '<small>Materia</small><strong>' + (cid ? esc(labelFromId(cid)) : 'Todas las materias') + '</strong><em>Cambiar</em>';
    if(b2) b2.innerHTML = '<small>Módulo</small><strong>' + (m ? esc(m.title) : (cid ? 'Todos los módulos' : 'Toda la banca')) + '</strong><em>Cambiar</em>';
  }

  function modal(){
    var m = document.getElementById('practiceForcePickerModal');
    if(m) return m;
    m = document.createElement('div');
    m.id = 'practiceForcePickerModal';
    m.className = 'pfp-modal';
    document.body.appendChild(m);
    return m;
  }
  function close(){
    var m = document.getElementById('practiceForcePickerModal');
    if(m) m.classList.remove('open');
    document.body.classList.remove('pfp-open');
  }
  function open(kind){
    var cid = activeCourseId();
    var mid = activeModuleId();
    var title = kind==='course' ? 'Elegir materia' : (cid ? labelFromId(cid)+' — elegir módulo' : 'Elegir módulo');
    var html = '<div class="pfp-backdrop" data-pfp-close="1"></div><section class="pfp-panel" role="dialog" aria-modal="true"><header><div><p>'+esc(pageType()==='case'?'Casos clínicos':'V/F')+'</p><h2>'+esc(title)+'</h2></div><button type="button" data-pfp-close="1">×</button></header><div class="pfp-list">';
    if(kind==='course'){
      html += '<button class="pfp-choice '+(!cid?'active':'')+'" data-kind="course" data-id=""><span>Todo</span><strong>Todas las materias</strong></button>';
      courses().forEach(function(c){ html += '<button class="pfp-choice '+(c.id===cid?'active':'')+'" data-kind="course" data-id="'+esc(c.id)+'"><span>Mat.</span><strong>'+esc(c.label)+'</strong></button>'; });
    }else{
      if(!cid){
        html += '<button class="pfp-choice active" data-kind="module" data-id=""><span>Todo</span><strong>Toda la banca</strong></button><p class="pfp-help">Elige primero una materia para filtrar por módulo.</p>';
      }else{
        html += '<button class="pfp-choice '+(!mid?'active':'')+'" data-kind="module" data-id=""><span>Todo</span><strong>Todos los módulos</strong></button>';
        inferModules(cid).forEach(function(mod,i){ html += '<button class="pfp-choice '+(mod.id===mid?'active':'')+'" data-kind="module" data-id="'+esc(mod.id)+'"><span>Mód. '+esc(mod.number||i+1)+'</span><strong>'+esc(mod.title)+'</strong></button>'; });
      }
    }
    html += '</div></section>';
    var m = modal();
    m.innerHTML = html;
    m.classList.add('open');
    document.body.classList.add('pfp-open');
  }

  function inject(){
    if(document.getElementById('practicePickerForceStyle')) return;
    var st = document.createElement('style');
    st.id = 'practicePickerForceStyle';
    st.textContent = '.practice-force-picker-shell{display:grid;grid-template-columns:1fr 1fr;gap:.48rem;margin:.32rem 0 .5rem}.pfp-btn{min-height:40px;border-radius:16px;border:1px solid rgba(245,211,124,.50);background:rgba(245,211,124,.11);color:#ffe7a0;text-align:left;padding:.45rem 4.5rem .45rem .58rem;position:relative;overflow:hidden;font-weight:900}.pfp-btn.module{border-color:rgba(86,180,255,.50);background:rgba(56,189,248,.10);color:#dff3ff}.pfp-btn small{display:block;text-transform:uppercase;font-size:.54rem;letter-spacing:.12em;opacity:.62}.pfp-btn strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.9rem}.pfp-btn em{position:absolute;right:.58rem;top:50%;transform:translateY(-50%);font-style:normal;font-size:.64rem;opacity:.68}.pfp-modal{position:fixed;inset:0;z-index:13050;display:none;background:rgba(2,6,14,.86);backdrop-filter:blur(9px);padding:calc(env(safe-area-inset-top,0px) + 10px) 10px calc(env(safe-area-inset-bottom,0px) + 10px);overflow:auto}.pfp-modal.open{display:block}.pfp-backdrop{position:fixed;inset:0}.pfp-panel{position:relative;max-width:680px;margin:0 auto;border:1px solid rgba(245,211,124,.34);border-radius:22px;background:#07101f;overflow:hidden}.pfp-panel header{display:flex;justify-content:space-between;gap:12px;padding:15px;border-bottom:1px solid rgba(255,255,255,.10)}.pfp-panel header p{margin:0 0 4px;color:#ffe7a0;text-transform:uppercase;font-size:.6rem;letter-spacing:.15em;font-weight:950}.pfp-panel h2{margin:0;color:#f8fafc;font-size:1.06rem}.pfp-panel header button{width:38px;height:38px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff;font-size:1.5rem}.pfp-list{display:grid;gap:7px;padding:12px}.pfp-choice{width:100%;min-height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.045);color:#f8fafc;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:10px;text-align:left;padding:8px 10px}.pfp-choice span{height:29px;min-width:58px;border-radius:999px;background:#ffe7a0;color:#07101f;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:950;padding:0 9px}.pfp-choice strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.85rem}.pfp-choice.active{border-color:rgba(245,211,124,.62);background:rgba(245,211,124,.12)}.pfp-help{margin:.2rem .3rem;color:rgba(226,232,240,.68);font-size:.82rem}@media(max-width:520px){.practice-force-picker-shell{gap:.42rem}.pfp-btn{padding-right:3.9rem}.pfp-btn em{font-size:.6rem}.pfp-panel{border-radius:20px}.pfp-list{padding:10px}}';
    document.head.appendChild(st);
  }

  function swallow(e){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
  function handle(e){
    if(!isTargetPage()) return;
    var b = e.target.closest && e.target.closest('.practice-force-picker-shell .pfp-btn,.mc-picker-shell .mc-picker-btn');
    if(b){ swallow(e); open(b.classList.contains('subject') ? 'course' : 'module'); return; }
    var c = e.target.closest && e.target.closest('#practiceForcePickerModal [data-pfp-close="1"]');
    if(c){ swallow(e); close(); return; }
    var ch = e.target.closest && e.target.closest('#practiceForcePickerModal .pfp-choice');
    if(ch){ swallow(e); go(ch.getAttribute('data-kind'), ch.getAttribute('data-id')); return; }
  }

  document.addEventListener('click', handle, true);
  document.addEventListener('touchend', function(e){
    var t = e.target.closest && e.target.closest('#practiceForcePickerModal .pfp-choice,.practice-force-picker-shell .pfp-btn');
    if(!t || !isTargetPage()) return;
    handle(e);
  }, {capture:true, passive:false});

  function apply(){ inject(); ensureShell(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ apply(); setTimeout(apply,400); setTimeout(apply,1200); });
  else { apply(); setTimeout(apply,400); setTimeout(apply,1200); }
  if(window.MutationObserver) new MutationObserver(function(){ clearTimeout(window.__pfpTimer); window.__pfpTimer=setTimeout(apply,80); }).observe(document.body,{childList:true,subtree:true});
})();
