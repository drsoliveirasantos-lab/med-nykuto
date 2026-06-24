/* v306 — Compact premium QCM Materia/Módulo picker on iOS/Safari.
   Stable tap capture + lighter, less zoomed UI. */
(function(){
  'use strict';

  var touchMoved = false;
  var sx = 0;
  var sy = 0;
  var lastOpen = 0;

  function courses(){ return (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || []; }
  function params(){ return new URLSearchParams(location.search); }
  function clean(s){ return String(s || '').replace(/\s+/g,' ').trim(); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function raw(x){ if(x && typeof x === 'object') return clean(x.title || x.name || x.label || x.es || x.fr || x.br || Object.values(x)[0]); return clean(x); }
  function titleCase(s){ return clean(String(s||'').replace(/[-_]+/g,' ').replace(/\s+/g,' ')).replace(/\b\w/g,function(a){return a.toUpperCase();}); }
  function fromId(id){ var s=String(id||'').toLowerCase(); s=s.replace(/^(course|module|mod|physio|fisiologia|fisiología|bioquimica|genetica|microbiologia|inmunologia)[-_]*/g,'').replace(/v\d+/g,'').replace(/\d{2,}/g,'').replace(/[-_]+/g,' '); return titleCase(s); }
  function courseLabel(c){ var t=raw(c); if(/fisiolog/i.test(t))return'Fisiología'; if(/gen/i.test(t))return'Genética'; if(/micro/i.test(t))return'Microbiología'; if(/bioqu/i.test(t))return'Bioquímica'; if(/inmun/i.test(t))return'Inmunología'; if(/biof/i.test(t))return'Biofísica'; return t.length>28?t.slice(0,27)+'…':t; }
  function moduleLabel(m,i,c){ var label=raw(m&&m.shortTitle)||raw(m&&m.moduleTitle)||raw(m); var cn=courseLabel(c||''); label=label.replace(/fisiolog[ií]a\s+fisiolog[ií]a/ig,'Fisiología').replace(/^fisiolog[ií]a\s*/i,''); if(!label||label===cn||/^fisiolog/i.test(label)||/^module\s*\d*$/i.test(label))label=fromId(m&&m.id)||('Módulo '+(i+1)); if(/cardio/i.test(label))label='Cardio'; if(label.length<3)label='Módulo '+(i+1); return label; }
  function moduleDisplayNumber(m,i){ return (m && (m.number || m.num || m.order)) || (i + 1); }
  function courseById(id){ return courses().find(function(c){ return String(c.id) === String(id); }); }
  function moduleInfo(id){ var r=null; courses().forEach(function(c){ (c.modules||[]).forEach(function(m,i){ if(String(m.id)===String(id))r={course:c,module:m,index:i}; }); }); return r; }
  function current(){ var p=params(); var mi=moduleInfo(p.get('module')||''); var cid=p.get('course')||(mi&&mi.course.id)||''; var c=courseById(cid); var mid=p.get('module')||''; return {cid:cid,c:c,mid:mid,m:mi&&mi.module,index:mi?mi.index:0}; }
  function isSoonCourse(c){ return /biof[ií]sica/i.test(String((c&&c.id)||'')+' '+raw(c)) || !((c&&c.modules)||[]).length; }
  function go(kind,id){ var p=params(); if(kind==='course'){ id?p.set('course',id):p.delete('course'); p.delete('module'); } else if(kind==='module'){ id?p.set('module',id):p.delete('module'); } location.href=location.pathname+(p.toString()?'?'+p.toString():''); }
  function modal(){ var m=document.getElementById('qcmForcePickerModal'); if(m)return m; m=document.createElement('div'); m.id='qcmForcePickerModal'; m.className='qcm-force-picker-modal'; document.body.appendChild(m); return m; }
  function close(){ var m=document.getElementById('qcmForcePickerModal'); if(m)m.classList.remove('open'); document.body.classList.remove('mc-modal-open'); }
  function countQuestionsForCourse(c){ try{ var bank=window.MED_PRACTICE_BANK&&window.MED_PRACTICE_BANK.byCourse&&window.MED_PRACTICE_BANK.byCourse[c.id]; if(!bank)return 0; return (bank.qcm||[]).length+(bank.cases||[]).length+(bank.vf||[]).length; }catch(e){ return 0; } }
  function courseCard(c,active){ var mods=(c.modules||[]).length; var qs=countQuestionsForCourse(c); return '<button class="qfp-choice qfp-course '+(active?'active':'')+'" data-kind="course" data-id="'+esc(c.id)+'"><span class="qfp-icon">📚</span><span class="qfp-choice-main"><strong>'+esc(courseLabel(c))+'</strong><small>'+mods+' módulos'+(qs?' · '+qs+' preguntas':'')+'</small></span><em>'+(active?'Actual':'Elegir')+'</em></button>'; }
  function moduleCard(mod,i,cur){ var active=mod.id===cur.mid; return '<button class="qfp-choice qfp-module '+(active?'active':'')+'" data-kind="module" data-id="'+esc(mod.id)+'"><span class="qfp-badge">Mód. '+esc(moduleDisplayNumber(mod,i))+'</span><span class="qfp-choice-main"><strong>'+esc(moduleLabel(mod,i,cur.c))+'</strong><small>'+esc(courseLabel(cur.c))+'</small></span><em>'+(active?'Actual':'Abrir')+'</em></button>'; }

  function open(type){
    var now=Date.now(); if(now-lastOpen<180)return; lastOpen=now;
    var cur=current(); var isModule=type==='module';
    var eyebrow=isModule&&cur.c?courseLabel(cur.c).toUpperCase():'QCM';
    var title=isModule&&cur.c?courseLabel(cur.c)+' — Elegir módulo':(isModule?'Elegir módulo':'Elegir materia');
    var note=isModule?'Selecciona un módulo para entrenar.':'Selecciona una materia para filtrar.';
    var html='<div class="qfp-backdrop" data-qfp-close="1"></div><section class="qfp-panel" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><header class="qfp-head"><div><p class="qfp-eyebrow">'+esc(eyebrow)+'</p><h2>'+esc(title)+'</h2><span>'+esc(note)+'</span></div><button class="qfp-close" type="button" aria-label="Cerrar" data-qfp-close="1">×</button></header>';
    if(type==='course'){
      html+='<div class="qfp-toolbar"><input class="qfp-search" type="search" placeholder="Buscar materia…" autocomplete="off" inputmode="search" /></div><div class="qfp-list">';
      html+='<button class="qfp-choice qfp-course '+(!cur.cid?'active':'')+'" data-kind="course" data-id=""><span class="qfp-icon">✨</span><span class="qfp-choice-main"><strong>Todas</strong><small>Toda la banca disponible</small></span><em>'+(!cur.cid?'Actual':'Elegir')+'</em></button>';
      courses().forEach(function(c){ if(!isSoonCourse(c))html+=courseCard(c,c.id===cur.cid); });
      html+='</div>';
    }else{
      html+='<div class="qfp-toolbar"><input class="qfp-search" type="search" placeholder="Buscar módulo…" autocomplete="off" inputmode="search" /></div><div class="qfp-list">';
      if(!cur.c){ html+='<button class="qfp-choice qfp-module" data-kind="module" data-id=""><span class="qfp-badge">Todos</span><span class="qfp-choice-main"><strong>Toda la banca</strong><small>Sin filtro</small></span><em>Abrir</em></button>'; }
      else{ html+='<button class="qfp-choice qfp-module '+(!cur.mid?'active':'')+'" data-kind="module" data-id=""><span class="qfp-badge">Todos</span><span class="qfp-choice-main"><strong>Todos los módulos</strong><small>'+esc(courseLabel(cur.c))+'</small></span><em>'+(!cur.mid?'Actual':'Abrir')+'</em></button>'; (cur.c.modules||[]).forEach(function(mod,i){ html+=moduleCard(mod,i,cur); }); }
      html+='</div>';
    }
    html+='</section>';
    var m=modal(); m.innerHTML=html; m.classList.add('open'); document.body.classList.add('mc-modal-open');
    // No autofocus: avoids iOS keyboard/viewport jump that felt like a loading flicker.
  }
  function pickerKindFromTarget(target){ var btn=target&&target.closest&&target.closest('.mc-picker-btn'); if(!btn)return null; if(btn.classList.contains('subject'))return'course'; if(btn.classList.contains('module'))return'module'; return null; }
  function handlePickerTap(e){ var kind=pickerKindFromTarget(e.target); if(!kind)return; e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); open(kind); }
  function handleModalClick(e){ var inModal=e.target&&e.target.closest&&e.target.closest('#qcmForcePickerModal'); if(!inModal)return; if(e.target.getAttribute&&e.target.getAttribute('data-qfp-close')==='1'){ e.preventDefault(); e.stopPropagation(); close(); return; } var choice=e.target.closest('.qfp-choice'); if(choice){ e.preventDefault(); e.stopPropagation(); go(choice.getAttribute('data-kind'),choice.getAttribute('data-id')); } }
  function handleSearch(e){ var input=e.target&&e.target.closest&&e.target.closest('#qcmForcePickerModal .qfp-search'); if(!input)return; var q=clean(input.value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); document.querySelectorAll('#qcmForcePickerModal .qfp-choice').forEach(function(btn){ var s=clean(btn.textContent).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); btn.hidden=q&&s.indexOf(q)===-1; }); }

  function patchStyles(){
    if(document.getElementById('qcmForcePickerStyle'))return;
    var st=document.createElement('style'); st.id='qcmForcePickerStyle';
    st.textContent='.mc-picker-btn{pointer-events:auto!important;cursor:pointer!important}.mc-picker-btn *{pointer-events:none!important}.qcm-force-picker-modal{position:fixed;inset:0;z-index:12000;display:none;padding:calc(env(safe-area-inset-top,0px) + 10px) 10px calc(env(safe-area-inset-bottom,0px) + 10px);background:rgba(2,6,14,.76);backdrop-filter:blur(8px);overflow:auto;-webkit-overflow-scrolling:touch}.qcm-force-picker-modal.open{display:block!important}.qfp-backdrop{position:fixed;inset:0}.qfp-panel{position:relative;max-width:660px;margin:0 auto;border-radius:22px;border:1px solid rgba(245,211,124,.34);background:linear-gradient(180deg,rgba(8,16,31,.98),rgba(5,10,20,.98));box-shadow:0 22px 64px rgba(0,0,0,.48);overflow:hidden}.qfp-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:15px 16px 12px;border-bottom:1px solid rgba(255,255,255,.09)}.qfp-eyebrow{margin:0 0 5px;color:#ffe7a0;font-size:.58rem;letter-spacing:.17em;text-transform:uppercase;font-weight:950}.qfp-head h2{margin:0;color:#f8fafc;font-size:1.05rem;line-height:1.13;font-weight:950}.qfp-head span{display:block;margin-top:6px;color:rgba(226,232,240,.58);font-size:.74rem;line-height:1.28}.qfp-close{width:40px;height:40px;min-width:40px;border-radius:13px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#f8fafc;font-size:1.55rem;line-height:1;display:inline-flex;align-items:center;justify-content:center}.qfp-toolbar{padding:10px 16px 0}.qfp-search{width:100%;height:38px;border-radius:13px;border:1px solid rgba(245,211,124,.35);background:rgba(255,255,255,.055);color:#f8fafc;font-weight:800;font-size:.82rem;padding:0 12px;outline:none}.qfp-search::placeholder{color:rgba(226,232,240,.44)}.qfp-search:focus{border-color:rgba(245,211,124,.55);box-shadow:0 0 0 2px rgba(245,211,124,.08)}.qfp-list{display:grid;gap:7px;padding:10px 16px 16px}.qfp-choice{width:100%;min-height:48px;border-radius:15px;border:1px solid rgba(255,255,255,.105);background:rgba(255,255,255,.042);color:#f8fafc;text-align:left;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:8px 10px;touch-action:manipulation}.qfp-choice.active{border-color:rgba(245,211,124,.62);background:linear-gradient(135deg,rgba(245,211,124,.13),rgba(255,255,255,.04))}.qfp-choice:active{transform:scale(.994)}.qfp-badge,.qfp-icon{height:30px;min-width:60px;padding:0 10px;border-radius:999px;background:#ffe7a0;color:#07101f;border:1px solid rgba(245,211,124,.62);font-weight:950;font-size:.78rem;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}.qfp-icon{min-width:34px;width:34px;padding:0;background:rgba(245,211,124,.14);color:#ffe7a0}.qfp-choice-main{min-width:0;display:block}.qfp-choice-main strong{display:block;font-size:.86rem;line-height:1.13;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qfp-choice-main small{display:block;margin-top:3px;color:rgba(226,232,240,.50);font-weight:800;font-size:.66rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qfp-choice em{font-style:normal;color:rgba(226,232,240,.50);font-size:.62rem;font-weight:900;border:1px solid rgba(255,255,255,.10);border-radius:999px;padding:.18rem .42rem}.qfp-choice.active em{color:#ffe7a0;border-color:rgba(245,211,124,.40);background:rgba(245,211,124,.09)}@media(max-width:520px){.qcm-force-picker-modal{padding:calc(env(safe-area-inset-top,0px) + 8px) 8px calc(env(safe-area-inset-bottom,0px) + 8px)}.qfp-panel{border-radius:20px}.qfp-head{padding:14px 14px 10px}.qfp-head h2{font-size:1rem}.qfp-head span{font-size:.72rem}.qfp-close{width:38px;height:38px;min-width:38px;border-radius:12px}.qfp-toolbar{padding:9px 13px 0}.qfp-list{padding:9px 13px 14px;gap:7px}.qfp-choice{grid-template-columns:auto 1fr;min-height:46px;padding:8px 9px;border-radius:14px}.qfp-choice em{display:none}.qfp-badge{height:29px;min-width:58px;padding:0 9px;font-size:.76rem}.qfp-choice-main strong{font-size:.84rem}.qfp-choice-main small{font-size:.64rem}}';
    document.head.appendChild(st);
  }

  document.addEventListener('touchstart',function(e){ if(!pickerKindFromTarget(e.target))return; var t=e.changedTouches&&e.changedTouches[0]; if(!t)return; sx=t.clientX; sy=t.clientY; touchMoved=false; },{capture:true,passive:true});
  document.addEventListener('touchmove',function(e){ if(!pickerKindFromTarget(e.target))return; var t=e.changedTouches&&e.changedTouches[0]; if(!t)return; if(Math.abs(t.clientX-sx)>10||Math.abs(t.clientY-sy)>10)touchMoved=true; },{capture:true,passive:true});
  document.addEventListener('touchend',function(e){ if(!pickerKindFromTarget(e.target)||touchMoved)return; handlePickerTap(e); },{capture:true,passive:false});
  document.addEventListener('click',handlePickerTap,true);
  document.addEventListener('click',handleModalClick,true);
  document.addEventListener('touchend',handleModalClick,{capture:true,passive:false});
  document.addEventListener('input',handleSearch,true);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape')close(); });
  patchStyles(); if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchStyles);
})();
