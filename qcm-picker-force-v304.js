/* v304 — Hard-fix QCM Materia/Módulo picker on iOS/Safari.
   Captures the tap before other scripts can close/re-render it. */
(function(){
  'use strict';

  var touchMoved = false;
  var sx = 0;
  var sy = 0;
  var lastOpen = 0;

  function courses(){
    return (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || [];
  }
  function params(){ return new URLSearchParams(location.search); }
  function clean(s){ return String(s || '').replace(/\s+/g,' ').trim(); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function raw(x){
    if(x && typeof x === 'object') return clean(x.title || x.name || x.label || x.es || x.fr || x.br || Object.values(x)[0]);
    return clean(x);
  }
  function titleCase(s){
    return clean(String(s||'').replace(/[-_]+/g,' ').replace(/\s+/g,' ')).replace(/\b\w/g,function(a){return a.toUpperCase();});
  }
  function fromId(id){
    var s = String(id || '').toLowerCase();
    s = s.replace(/^(course|module|mod|physio|fisiologia|fisiología|bioquimica|genetica|microbiologia|inmunologia)[-_]*/g,'')
      .replace(/v\d+/g,'')
      .replace(/\d{2,}/g,'')
      .replace(/[-_]+/g,' ');
    return titleCase(s);
  }
  function courseLabel(c){
    var t = raw(c);
    if(/fisiolog/i.test(t)) return 'Fisiología';
    if(/gen/i.test(t)) return 'Genética';
    if(/micro/i.test(t)) return 'Microbiología';
    if(/bioqu/i.test(t)) return 'Bioquímica';
    if(/inmun/i.test(t)) return 'Inmunología';
    if(/biof/i.test(t)) return 'Biofísica';
    return t.length > 28 ? t.slice(0,27) + '…' : t;
  }
  function moduleLabel(m,i,c){
    var label = raw(m && m.shortTitle) || raw(m && m.moduleTitle) || raw(m);
    var cn = courseLabel(c || '');
    label = label.replace(/fisiolog[ií]a\s+fisiolog[ií]a/ig,'Fisiología').replace(/^fisiolog[ií]a\s*/i,'');
    if(!label || label === cn || /^fisiolog/i.test(label) || /^module\s*\d*$/i.test(label)) label = fromId(m && m.id) || ('Módulo ' + (i + 1));
    if(/cardio/i.test(label)) label = 'Cardio';
    if(label.length < 3) label = 'Módulo ' + (i + 1);
    return label.length > 34 ? label.slice(0,33) + '…' : label;
  }
  function courseById(id){ return courses().find(function(c){ return String(c.id) === String(id); }); }
  function moduleInfo(id){
    var r = null;
    courses().forEach(function(c){
      (c.modules || []).forEach(function(m,i){
        if(String(m.id) === String(id)) r = {course:c,module:m,index:i};
      });
    });
    return r;
  }
  function current(){
    var p = params();
    var mi = moduleInfo(p.get('module') || '');
    var cid = p.get('course') || (mi && mi.course.id) || '';
    var c = courseById(cid);
    var mid = p.get('module') || '';
    return {cid:cid,c:c,mid:mid,m:mi && mi.module,index:mi ? mi.index : 0};
  }
  function isSoonCourse(c){
    return /biof[ií]sica/i.test(String((c && c.id) || '') + ' ' + raw(c)) || !((c && c.modules) || []).length;
  }
  function go(kind,id){
    var p = params();
    if(kind === 'course'){
      id ? p.set('course',id) : p.delete('course');
      p.delete('module');
    } else if(kind === 'module'){
      id ? p.set('module',id) : p.delete('module');
    }
    location.href = location.pathname + (p.toString() ? '?' + p.toString() : '');
  }
  function modal(){
    var m = document.getElementById('qcmForcePickerModal');
    if(m) return m;
    m = document.createElement('div');
    m.id = 'qcmForcePickerModal';
    m.className = 'mc-modal qcm-force-picker-modal';
    document.body.appendChild(m);
    return m;
  }
  function close(){
    var m = document.getElementById('qcmForcePickerModal');
    if(m) m.classList.remove('open');
    document.body.classList.remove('mc-modal-open');
  }
  function open(type){
    var now = Date.now();
    if(now - lastOpen < 220) return;
    lastOpen = now;

    var cur = current();
    var html = '<div class="mc-panel"><div class="mc-head"><h2 class="mc-title">' + (type === 'course' ? 'Elegir materia' : 'Elegir módulo') + '</h2><button class="mc-close" type="button">Cerrar</button></div>';
    if(type === 'course'){
      html += '<p class="mc-note">Elige la materia. El QCM se recarga con el filtro correcto.</p><div class="mc-list">';
      html += '<button class="mc-choice ' + (!cur.cid ? 'active' : '') + '" data-kind="course" data-id="">Todas las materias</button>';
      courses().forEach(function(c){
        if(isSoonCourse(c)) return;
        html += '<button class="mc-choice ' + (c.id === cur.cid ? 'active' : '') + '" data-kind="course" data-id="' + esc(c.id) + '">' + esc(courseLabel(c)) + '</button>';
      });
      html += '</div>';
    } else {
      html += '<p class="mc-note">Elige el módulo a trabajar.</p><div class="mc-list">';
      if(!cur.c){
        html += '<button class="mc-choice" data-kind="module" data-id="">Toda la banca</button>';
      } else {
        html += '<button class="mc-choice ' + (!cur.mid ? 'active' : '') + '" data-kind="module" data-id="">Todos los módulos · ' + esc(courseLabel(cur.c)) + '</button>';
        (cur.c.modules || []).forEach(function(mod,i){
          html += '<button class="mc-choice ' + (mod.id === cur.mid ? 'active' : '') + '" data-kind="module" data-id="' + esc(mod.id) + '">' + esc(moduleLabel(mod,i,cur.c)) + '<small>' + esc(courseLabel(cur.c)) + '</small></button>';
        });
      }
      html += '</div>';
    }
    html += '</div>';
    var m = modal();
    m.innerHTML = html;
    m.classList.add('open');
    document.body.classList.add('mc-modal-open');
  }
  function pickerKindFromTarget(target){
    var btn = target && target.closest && target.closest('.mc-picker-btn');
    if(!btn) return null;
    if(btn.classList.contains('subject')) return 'course';
    if(btn.classList.contains('module')) return 'module';
    return null;
  }
  function handlePickerTap(e){
    var kind = pickerKindFromTarget(e.target);
    if(!kind) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    open(kind);
  }
  function handleModalClick(e){
    var inModal = e.target && e.target.closest && e.target.closest('#qcmForcePickerModal');
    if(!inModal) return;
    var c = e.target.closest('.mc-close');
    var choice = e.target.closest('.mc-choice');
    if(c){ e.preventDefault(); e.stopPropagation(); close(); return; }
    if(choice){ e.preventDefault(); e.stopPropagation(); go(choice.getAttribute('data-kind'), choice.getAttribute('data-id')); }
  }
  function patchStyles(){
    if(document.getElementById('qcmForcePickerStyle')) return;
    var st = document.createElement('style');
    st.id = 'qcmForcePickerStyle';
    st.textContent = '.mc-picker-btn{pointer-events:auto!important;cursor:pointer!important}.mc-picker-btn *{pointer-events:none!important}.qcm-force-picker-modal{z-index:12000!important}.qcm-force-picker-modal.open{display:block!important}';
    document.head.appendChild(st);
  }

  document.addEventListener('touchstart',function(e){
    if(!pickerKindFromTarget(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    sx = t.clientX; sy = t.clientY; touchMoved = false;
  },{capture:true,passive:true});
  document.addEventListener('touchmove',function(e){
    if(!pickerKindFromTarget(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    if(Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) touchMoved = true;
  },{capture:true,passive:true});
  document.addEventListener('touchend',function(e){
    if(!pickerKindFromTarget(e.target) || touchMoved) return;
    handlePickerTap(e);
  },{capture:true,passive:false});
  document.addEventListener('click',handlePickerTap,true);
  document.addEventListener('click',handleModalClick,true);
  document.addEventListener('touchend',handleModalClick,{capture:true,passive:false});
  document.addEventListener('keydown',function(e){ if(e.key === 'Escape') close(); });

  patchStyles();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',patchStyles);
})();
