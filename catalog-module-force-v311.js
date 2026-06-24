/* v311 — Stable catalog module picker for the Materias page.
   Fixes “Ver módulos / Voir modules” by handling the click independently from older drawers. */
(function(){
  'use strict';

  function courses(){ return (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || []; }
  function clean(s){ return String(s || '').replace(/\s+/g,' ').trim(); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function raw(x){ if(x && typeof x === 'object') return clean(x.title || x.name || x.label || x.es || x.fr || x.br || Object.values(x)[0]); return clean(x); }
  function courseLabel(c){ var t=raw(c); if(/fisiolog/i.test(t))return'Fisiología'; if(/gen/i.test(t))return'Genética'; if(/micro/i.test(t))return'Microbiología'; if(/bioqu/i.test(t))return'Bioquímica'; if(/inmun/i.test(t))return'Inmunología'; if(/biof/i.test(t))return'Biofísica'; return t; }
  function moduleTitle(m){ return raw(m && (m.shortTitle || m.moduleTitle || m.title || m.name)) || 'Módulo'; }
  function moduleUrl(m){ return 'module.html?id=' + encodeURIComponent(m.id); }
  function isSoonCourse(c){ return /biof[ií]sica/i.test(String((c && c.id) || '') + ' ' + raw(c)) || !((c && c.modules) || []).length; }

  function modal(){
    var m = document.getElementById('catalogModuleForceModal');
    if(m) return m;
    m = document.createElement('div');
    m.id = 'catalogModuleForceModal';
    m.className = 'cmf-modal';
    document.body.appendChild(m);
    return m;
  }
  function close(){
    var m = document.getElementById('catalogModuleForceModal');
    if(m) m.classList.remove('open');
    document.body.classList.remove('cmf-open');
  }
  function open(course){
    if(!course || isSoonCourse(course)) return;
    var mods = course.modules || [];
    var html = '<div class="cmf-backdrop" data-cmf-close="1"></div><section class="cmf-panel" role="dialog" aria-modal="true"><header class="cmf-head"><div><p>Materia</p><h2>'+esc(courseLabel(course))+' — elegir módulo</h2><span>'+mods.length+' módulos disponibles</span></div><button type="button" data-cmf-close="1">×</button></header><div class="cmf-list">';
    mods.forEach(function(mod,i){
      html += '<a class="cmf-row" href="'+moduleUrl(mod)+'"><span>Mód. '+esc(mod.number || i+1)+'</span><strong>'+esc(moduleTitle(mod))+'</strong></a>';
    });
    html += '</div></section>';
    var m = modal();
    m.innerHTML = html;
    m.classList.add('open');
    document.body.classList.add('cmf-open');
  }
  function courseFromButton(btn){
    var card = btn && btn.closest && btn.closest('.course-card');
    if(!card) return null;
    var cards = Array.from(document.querySelectorAll('#courseGrid .course-card'));
    var idx = cards.indexOf(card);
    return courses()[idx] || null;
  }
  function handleClick(e){
    var closeBtn = e.target && e.target.closest && e.target.closest('[data-cmf-close="1"]');
    if(closeBtn){ e.preventDefault(); e.stopPropagation(); close(); return; }

    var btn = e.target && e.target.closest && e.target.closest('.course-card .btn.primary,.course-card .v210-toggle,[data-v210-toggle="1"]');
    if(!btn || !document.body || document.body.dataset.page !== 'catalog') return;
    var course = courseFromButton(btn);
    if(!course || isSoonCourse(course)) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    open(course);
  }
  function patchCards(){
    if(!document.body || document.body.dataset.page !== 'catalog') return;
    Array.from(document.querySelectorAll('#courseGrid .course-card')).forEach(function(card,idx){
      var c = courses()[idx];
      var btn = card.querySelector('.card-actions .btn.primary,.v210-toggle,[data-v210-toggle="1"]');
      if(!btn || !c || isSoonCourse(c)) return;
      btn.setAttribute('href','#');
      btn.setAttribute('role','button');
      btn.textContent = 'Ver módulos ▾';
      btn.classList.add('catalog-force-toggle');
    });
  }
  function injectStyle(){
    if(document.getElementById('catalogModuleForceStyle')) return;
    var st = document.createElement('style');
    st.id = 'catalogModuleForceStyle';
    st.textContent = '.catalog-force-toggle{pointer-events:auto!important}.cmf-modal{position:fixed;inset:0;z-index:13000;display:none;padding:calc(env(safe-area-inset-top,0px) + 14px) 12px calc(env(safe-area-inset-bottom,0px) + 14px);background:rgba(2,6,14,.82);backdrop-filter:blur(10px);overflow:auto}.cmf-modal.open{display:block}.cmf-backdrop{position:fixed;inset:0}.cmf-panel{position:relative;max-width:720px;margin:0 auto;border-radius:24px;border:1px solid rgba(245,211,124,.36);background:linear-gradient(180deg,rgba(9,18,34,.98),rgba(5,10,20,.98));box-shadow:0 28px 80px rgba(0,0,0,.56);overflow:hidden}.cmf-head{display:flex;justify-content:space-between;gap:14px;padding:18px;border-bottom:1px solid rgba(255,255,255,.10)}.cmf-head p{margin:0 0 5px;color:#ffe7a0;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;font-weight:950}.cmf-head h2{margin:0;color:#f8fafc;font-size:1.16rem;line-height:1.14;font-weight:950}.cmf-head span{display:block;margin-top:6px;color:rgba(226,232,240,.58);font-size:.8rem}.cmf-head button{width:42px;height:42px;min-width:42px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#f8fafc;font-size:1.7rem;line-height:1}.cmf-list{display:grid;gap:8px;padding:14px 18px 18px}.cmf-row{min-height:50px;border-radius:16px;border:1px solid rgba(255,255,255,.105);background:rgba(255,255,255,.045);color:#f8fafc;text-decoration:none;display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:9px 11px}.cmf-row span{height:30px;min-width:66px;padding:0 10px;border-radius:999px;background:#ffe7a0;color:#07101f;font-weight:950;font-size:.8rem;display:inline-flex;align-items:center;justify-content:center}.cmf-row strong{font-size:.9rem;line-height:1.16;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:520px){.cmf-modal{padding:calc(env(safe-area-inset-top,0px) + 9px) 8px calc(env(safe-area-inset-bottom,0px) + 9px)}.cmf-panel{border-radius:20px}.cmf-head{padding:15px 14px}.cmf-head h2{font-size:1rem}.cmf-head button{width:38px;height:38px;min-width:38px}.cmf-list{padding:10px 13px 14px;gap:7px}.cmf-row{min-height:46px;border-radius:14px;padding:8px 9px}.cmf-row span{height:29px;min-width:58px;font-size:.76rem}.cmf-row strong{font-size:.84rem}}';
    document.head.appendChild(st);
  }
  function apply(){ injectStyle(); patchCards(); }

  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ apply(); setTimeout(apply,300); setTimeout(apply,1000); });
  else { apply(); setTimeout(apply,300); setTimeout(apply,1000); }
  if(window.MutationObserver) new MutationObserver(function(){ clearTimeout(window.__cmfTimer); window.__cmfTimer=setTimeout(apply,80); }).observe(document.body,{childList:true,subtree:true});
})();
