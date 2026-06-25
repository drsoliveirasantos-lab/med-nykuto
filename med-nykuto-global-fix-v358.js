/* v358 — Med Nykuto global repair layer.
   Scope: global click/menu reliability, visible brand cleanup, cache-visible UI safety,
   and honest Cloudflare contact-form fallback. Does not modify question-bank data. */
(function(){
  'use strict';

  var VERSION = 'v358';
  var BRAND = 'Med Nykuto';
  var lastMenuTouchAt = 0;
  var lastMenuToggleAt = 0;

  function all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function closest(target, sel){ return target && target.closest ? target.closest(sel) : null; }
  function stop(e){
    if(!e) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  function navLinks(){ return document.getElementById('navLinks') || document.querySelector('.nav-links'); }
  function menuToggle(){ return document.getElementById('menuToggle') || document.querySelector('.menu-toggle'); }

  function injectStyle(){
    if(document.getElementById('medNykutoGlobalFixV358Style')) return;
    var st = document.createElement('style');
    st.id = 'medNykutoGlobalFixV358Style';
    st.textContent = [
      '.site-header{z-index:9000!important}',
      '.nav-shell{position:relative!important}',
      '.menu-toggle{position:relative!important;z-index:9200!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}',
      '.nav-links{pointer-events:auto!important}',
      '.nav-links a,.brand,.brand-official,.home-action-card,.practice-compact-pill,.subject-progress-card,.course-card .btn,.module-card .btn,.reader-actions .btn,.card-actions .btn,.module-actions .btn,.option,[data-action],button,label,summary{pointer-events:auto;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
      '@media(max-width:920px){.nav-links.open{display:grid!important;position:fixed!important;left:12px!important;right:12px!important;top:calc(var(--header-h,77px) + env(safe-area-inset-top,0px))!important;max-height:calc(100vh - var(--header-h,77px) - env(safe-area-inset-top,0px) - 18px)!important;overflow:auto!important;z-index:9100!important;padding:14px!important;border-radius:18px!important;background:#0b111d!important;box-shadow:0 22px 60px rgba(0,0,0,.45)!important}.nav-links.open a{min-height:44px!important;display:flex!important;align-items:center!important}.med-menu-open{overflow:hidden!important}}',
      '.form-offline-note-v358{margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.05);font-size:.95rem;line-height:1.45}',
      '.form-offline-note-v358 strong{display:block;margin-bottom:4px}',
      '.form-offline-note-v358 textarea{width:100%;min-height:120px;margin-top:10px;border-radius:10px;padding:10px;background:#07101f;color:#f8fafc;border:1px solid rgba(255,255,255,.16)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function setMenu(open){
    var nav = navLinks();
    var btn = menuToggle();
    if(!nav || !btn) return;
    nav.classList.toggle('open', !!open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('med-menu-open', !!open);
  }
  function toggleMenu(e){
    var now = Date.now();
    if(now - lastMenuToggleAt < 180){ stop(e); return; }
    lastMenuToggleAt = now;
    stop(e);
    var nav = navLinks();
    setMenu(!(nav && nav.classList.contains('open')));
  }
  function closeMenu(){ setMenu(false); }
  function bindMenu(){
    var btn = menuToggle();
    var nav = navLinks();
    if(btn){
      btn.setAttribute('type','button');
      if(!btn.hasAttribute('aria-controls') && nav && nav.id) btn.setAttribute('aria-controls', nav.id);
      btn.setAttribute('aria-expanded', nav && nav.classList.contains('open') ? 'true' : 'false');
    }
  }

  function replaceString(s){
    return String(s || '')
      .replace(/Med\s+Cursos/g, BRAND)
      .replace(/med-cursos/g, 'med-nykuto')
      .replace(/MedCursos/g, BRAND)
      .replace(/Netlify\s+Forms/g, 'formulario del sitio')
      .replace(/Netlify/g, 'Cloudflare Pages');
  }

  function patchTextNodes(){
    if(!document.body || !document.createTreeWalker) return;
    var skip = {SCRIPT:1, STYLE:1, TEXTAREA:1, INPUT:1, SELECT:1};
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentNode;
        if(!p || skip[p.nodeName]) return NodeFilter.FILTER_REJECT;
        return /Med\s+Cursos|Netlify/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(n){ n.nodeValue = replaceString(n.nodeValue); });
  }

  function patchAttributes(){
    document.title = replaceString(document.title);
    all('meta[content]').forEach(function(m){
      var content = m.getAttribute('content') || '';
      if(/Med\s+Cursos|Netlify/.test(content)) m.setAttribute('content', replaceString(content));
    });
    all('img[alt]').forEach(function(img){
      var alt = img.getAttribute('alt') || '';
      if(/Med\s+Cursos|Med\s+Nykuto|med-cursos/i.test(alt)) img.setAttribute('alt', BRAND);
    });
    all('a.brand,a.brand-official').forEach(function(a){
      a.setAttribute('href','index.html');
      a.setAttribute('aria-label','Inicio');
    });
    all('a[href="mentions.html"]').forEach(function(a){
      if(String(a.textContent || '').trim() === 'Mentions') a.textContent = 'Aviso legal';
    });
  }

  function formPayload(form){
    var fd = new FormData(form);
    var rows = [];
    fd.forEach(function(value, key){
      if(key === 'form-name' || key === 'bot-field') return;
      if(String(value || '').trim()) rows.push(key + ': ' + String(value).trim());
    });
    return rows.join('\n');
  }

  function showContactFallback(form, payload){
    var old = document.getElementById('contactFormFallbackV358');
    if(old) old.remove();
    var box = document.createElement('div');
    box.id = 'contactFormFallbackV358';
    box.className = 'form-offline-note-v358';
    box.innerHTML = '<strong>Mensaje preparado.</strong><span>El sitio está en Cloudflare Pages: este formulario está guardado localmente en tu navegador, pero no se envía a un servidor externo. Copia el texto si quieres conservarlo.</span>';
    var area = document.createElement('textarea');
    area.readOnly = true;
    area.value = payload;
    box.appendChild(area);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary';
    btn.textContent = 'Copiar mensaje';
    btn.addEventListener('click', function(){
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(payload).then(function(){ btn.textContent = 'Mensaje copiado'; }).catch(function(){ area.select(); document.execCommand('copy'); btn.textContent = 'Mensaje copiado'; });
      } else {
        area.select(); document.execCommand('copy'); btn.textContent = 'Mensaje copiado';
      }
    });
    box.appendChild(btn);
    form.appendChild(box);
  }

  function patchContactForm(){
    var form = document.querySelector('form[name="site-contact"]');
    if(!form || form.dataset.medNykutoV358Bound === '1') return;
    form.dataset.medNykutoV358Bound = '1';
    form.addEventListener('submit', function(e){
      stop(e);
      var payload = formPayload(form);
      try{
        var saved = JSON.parse(localStorage.getItem('med-nykuto-contact-drafts-v358') || '[]');
        saved.push({createdAt:new Date().toISOString(), payload:payload});
        localStorage.setItem('med-nykuto-contact-drafts-v358', JSON.stringify(saved).slice(-50000));
      }catch(err){}
      showContactFallback(form, payload);
    }, true);
  }

  function run(){
    injectStyle();
    bindMenu();
    patchAttributes();
    patchTextNodes();
    patchContactForm();
    window.__MED_NYKUTO_GLOBAL_FIX__ = VERSION;
  }

  document.addEventListener('touchend', function(e){
    var btn = closest(e.target, '#menuToggle,.menu-toggle');
    if(!btn) return;
    lastMenuTouchAt = Date.now();
    toggleMenu(e);
  }, {capture:true, passive:false});

  document.addEventListener('click', function(e){
    var btn = closest(e.target, '#menuToggle,.menu-toggle');
    if(btn){
      if(Date.now() - lastMenuTouchAt < 500){ stop(e); return; }
      toggleMenu(e);
      return;
    }
    var nav = navLinks();
    if(!nav || !nav.classList.contains('open')) return;
    if(closest(e.target, '.nav-links a')){ setTimeout(closeMenu, 0); return; }
    if(!closest(e.target, '.nav-shell')) closeMenu();
  }, true);

  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function(){ if(window.innerWidth > 920) closeMenu(); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  setTimeout(run, 300);
  setTimeout(run, 1200);
  if(window.MutationObserver){
    try{
      new MutationObserver(function(){
        clearTimeout(window.__medNykutoGlobalFixTimer);
        window.__medNykutoGlobalFixTimer = setTimeout(run, 80);
      }).observe(document.documentElement,{childList:true,subtree:true});
    }catch(e){}
  }
})();
