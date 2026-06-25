/* v101 — Optional public-first account layer for Med Nykuto.
   This never blocks pages. It only adds an optional local account shell for future auth/premium work.
*/
(function(){
  'use strict';

  var STORAGE_KEY = 'medNykutoOptionalAccount';
  window.__MED_NYKUTO_AUTH_OPTIONAL__ = 'v101-public-first';
  window.MED_NYKUTO_AUTH_REQUIRED = false;
  window.MED_NYKUTO_PUBLIC_FIRST = true;

  function readAccount(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function saveAccount(account){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(account)); return true; }
    catch(e){ return false; }
  }
  function clearAccount(){
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  }
  function clean(v){ return String(v || '').replace(/\s+/g, ' ').trim(); }

  function publicRoutes(){
    return [
      'index.html','matieres.html','matiere.html','modules.html','module.html',
      'qcm.html','cas-cliniques.html','vrai-faux.html','erreurs.html','examen.html',
      'contact.html','contact-success.html','a-propos.html','mentions.html','login.html','compte.html'
    ];
  }

  function isPublicRoute(){
    var page = location.pathname.split('/').pop() || 'index.html';
    return publicRoutes().indexOf(page) !== -1;
  }

  function ensurePublicAccess(){
    document.documentElement.classList.add('auth-optional');
    document.documentElement.classList.add('public-first');
    if(document.body){
      document.body.classList.add('auth-optional');
      document.body.dataset.authRequired = 'false';
      document.body.dataset.publicFirst = 'true';
    }
    return true;
  }

  function navLinks(){ return Array.from(document.querySelectorAll('.nav-links')); }

  function accountLabel(){
    var account = readAccount();
    if(account && account.name) return 'Cuenta';
    return 'Cuenta';
  }

  function injectNavAccountLink(){
    navLinks().forEach(function(nav){
      if(nav.querySelector('[data-auth-account-link]')) return;
      var a = document.createElement('a');
      a.href = 'compte.html';
      a.textContent = accountLabel();
      a.setAttribute('data-auth-account-link', 'true');
      a.setAttribute('aria-label', 'Cuenta opcional');
      nav.appendChild(a);
    });
  }

  function injectStyle(){
    if(document.getElementById('authOptionalV101Style')) return;
    var style = document.createElement('style');
    style.id = 'authOptionalV101Style';
    style.textContent = [
      '.auth-card{max-width:760px;margin:0 auto;padding:28px;border:1px solid rgba(148,163,184,.24);border-radius:24px;background:rgba(15,23,42,.72);box-shadow:0 24px 70px rgba(0,0,0,.22)}',
      '.auth-card h1,.auth-card h2{margin-top:0}',
      '.auth-note{padding:14px 16px;border-radius:16px;background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.22);color:#d1fae5}',
      '.auth-warning{padding:14px 16px;border-radius:16px;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.22);color:#fde68a}',
      '.auth-form{display:grid;gap:14px;margin-top:18px}',
      '.auth-form label{display:grid;gap:8px;font-weight:700}',
      '.auth-form input{min-height:46px;border-radius:14px;border:1px solid rgba(148,163,184,.34);background:rgba(2,6,23,.64);color:inherit;padding:0 14px;font:inherit}',
      '.auth-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}',
      '.auth-small{color:#94a3b8;font-size:.94rem;line-height:1.55}',
      '.auth-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.24);color:#bfdbfe;font-weight:800;font-size:.84rem}',
      '.auth-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-top:18px}',
      '.auth-grid .mini-card{padding:16px;border-radius:18px;background:rgba(15,23,42,.58);border:1px solid rgba(148,163,184,.18)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function initLoginPage(){
    var form = document.querySelector('[data-optional-login-form]');
    if(!form) return;
    var nameInput = form.querySelector('[name="name"]');
    var emailInput = form.querySelector('[name="email"]');
    var existing = readAccount();
    if(existing){
      if(nameInput) nameInput.value = existing.name || '';
      if(emailInput) emailInput.value = existing.email || '';
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = clean(nameInput && nameInput.value) || 'Estudiante';
      var email = clean(emailInput && emailInput.value);
      saveAccount({ name:name, email:email, mode:'local-optional', createdAt:new Date().toISOString() });
      location.href = 'compte.html';
    });
  }

  function initAccountPage(){
    var root = document.querySelector('[data-account-root]');
    if(!root) return;
    var account = readAccount();
    var nameEl = root.querySelector('[data-account-name]');
    var emailEl = root.querySelector('[data-account-email]');
    var stateEl = root.querySelector('[data-account-state]');
    if(account){
      if(nameEl) nameEl.textContent = account.name || 'Estudiante';
      if(emailEl) emailEl.textContent = account.email || 'Sin email guardado';
      if(stateEl) stateEl.textContent = 'Modo cuenta local opcional activo';
      root.classList.add('has-local-account');
    }else{
      if(nameEl) nameEl.textContent = 'Visitante público';
      if(emailEl) emailEl.textContent = 'Sin cuenta opcional';
      if(stateEl) stateEl.textContent = 'Todo el sitio sigue disponible sin conexión';
      root.classList.remove('has-local-account');
    }
    var logout = root.querySelector('[data-account-clear]');
    if(logout){
      logout.addEventListener('click', function(){
        clearAccount();
        location.reload();
      });
    }
  }

  function run(){
    ensurePublicAccess();
    injectStyle();
    injectNavAccountLink();
    initLoginPage();
    initAccountPage();
    window.MedNykutoAuth = {
      required:false,
      publicFirst:true,
      isPublicRoute:isPublicRoute,
      readAccount:readAccount,
      saveAccount:saveAccount,
      clearAccount:clearAccount
    };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('pageshow', run);
  setTimeout(run, 300);
})();
