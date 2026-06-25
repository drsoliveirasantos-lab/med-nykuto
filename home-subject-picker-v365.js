(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'home') return;

  const DATA = window.MED_COURSES_DATA || { courses: [] };
  const courses = Array.isArray(DATA.courses)
    ? DATA.courses.filter(course => Array.isArray(course.modules) && course.modules.length)
    : [];

  if(!courses.length) return;

  window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ = 'v367-delegated-modal';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const tx = value => value && typeof value === 'object'
    ? (value.es || value.fr || value.br || Object.values(value)[0] || '')
    : String(value || '');

  const moduleUrl = module => `module.html?id=${encodeURIComponent(module.id)}`;

  function injectStyle(){
    if(document.getElementById('homeSubjectPickerStyle')) return;
    const style = document.createElement('style');
    style.id = 'homeSubjectPickerStyle';
    style.textContent = `
      .home-pick-modal{position:fixed;inset:0;z-index:12000;display:none;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 58px) 22px calc(env(safe-area-inset-bottom,0px) + 28px);background:rgba(0,0,0,.86);overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
      .home-pick-modal.open{display:flex}
      body.home-pick-open{overflow:hidden}
      .home-pick-panel{width:min(680px,100%);background:#07101f;border:1px solid rgba(245,211,124,.34);border-radius:30px;box-shadow:0 30px 80px rgba(0,0,0,.58);overflow:hidden;color:#f8fafc}
      .home-pick-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 26px 22px;border-bottom:1px solid rgba(255,255,255,.1)}
      .home-pick-head small{display:block;color:#ffe59b;font-size:.82rem;font-weight:950;letter-spacing:.18em;text-transform:uppercase;margin-bottom:10px}
      .home-pick-head h2{margin:0;color:#f8fafc;font-size:clamp(1.5rem,5.8vw,2.05rem);line-height:1.08;font-weight:950}
      .home-pick-close{width:72px;height:72px;flex:0 0 auto;border-radius:24px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-size:3.3rem;line-height:1;display:grid;place-items:center;cursor:pointer}
      .home-pick-close:active{transform:scale(.98)}
      .home-pick-list{display:grid;gap:14px;padding:22px 22px 24px}
      .home-pick-link,.home-pick-button{display:flex;align-items:center;gap:18px;width:100%;min-height:78px;text-align:left;text-decoration:none;border:1px solid rgba(255,255,255,.12);border-radius:26px;background:#0b1220;color:#f8fafc;padding:14px 18px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02);cursor:pointer;font:inherit}
      .home-pick-link:hover,.home-pick-button:hover{border-color:rgba(245,211,124,.42);background:#101827}
      .home-pick-badge{display:inline-flex;align-items:center;justify-content:center;min-width:108px;padding:12px 16px;border-radius:999px;background:#ffe79b;color:#07101f;font-weight:950;font-size:1.05rem;white-space:nowrap}
      .home-pick-main{display:block;min-width:0;overflow:hidden}
      .home-pick-main strong{display:block;font-size:1.35rem;line-height:1.1;font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f8fafc}
      .home-pick-main span{display:block;margin-top:6px;color:rgba(226,232,240,.62);font-size:.9rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .home-pick-back{display:inline-flex;align-items:center;gap:8px;margin:0 22px 0;padding:11px 14px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.06);color:#e5e7eb;font-weight:900;cursor:pointer}
      .home-pick-empty{padding:20px;border:1px dashed rgba(255,255,255,.18);border-radius:22px;color:rgba(226,232,240,.74)}
      @media (max-width:560px){.home-pick-modal{padding:calc(env(safe-area-inset-top,0px) + 48px) 10px calc(env(safe-area-inset-bottom,0px) + 18px)}.home-pick-panel{border-radius:26px}.home-pick-head{padding:22px 18px 20px}.home-pick-close{width:62px;height:62px;border-radius:22px;font-size:3rem}.home-pick-list{gap:12px;padding:18px 12px 20px}.home-pick-link,.home-pick-button{min-height:82px;border-radius:22px;padding:13px 14px;gap:14px}.home-pick-badge{min-width:96px;font-size:1rem;padding:11px 14px}.home-pick-main strong{font-size:1.22rem}.home-pick-main span{font-size:.82rem}.home-pick-back{margin-left:12px}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    let modal = document.getElementById('homeSubjectModal');
    if(modal) return modal;

    modal = document.createElement('div');
    modal.id = 'homeSubjectModal';
    modal.className = 'home-pick-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <section class="home-pick-panel" role="dialog" aria-modal="true" aria-labelledby="homePickTitle">
        <div class="home-pick-head">
          <div>
            <small id="homePickCode">MATERIAS</small>
            <h2 id="homePickTitle">Elegir una materia</h2>
          </div>
          <button class="home-pick-close" type="button" data-home-pick-close aria-label="Cerrar">×</button>
        </div>
        <div class="home-pick-body"></div>
      </section>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', event => {
      if(event.target === modal || event.target.closest('[data-home-pick-close]')) closeModal();
      const subjectButton = event.target.closest('[data-home-course-id]');
      if(subjectButton){
        event.preventDefault();
        const course = courses.find(item => String(item.id) === String(subjectButton.dataset.homeCourseId));
        if(course) openModuleModal(course);
      }
    });

    document.addEventListener('keydown', event => {
      if(event.key === 'Escape') closeModal();
    });

    return modal;
  }

  function closeModal(){
    const modal = document.getElementById('homeSubjectModal');
    if(modal){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('home-pick-open');
  }

  function openModal(){
    const modal = ensureModal();
    renderSubjects();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('home-pick-open');
    window.setTimeout(() => modal.querySelector('[data-home-pick-close]')?.focus({ preventScroll:true }), 30);
  }

  function renderSubjects(){
    const modal = ensureModal();
    modal.querySelector('#homePickCode').textContent = 'MATERIAS';
    modal.querySelector('#homePickTitle').textContent = 'Elegir una materia';
    modal.querySelector('.home-pick-body').innerHTML = `
      <div class="home-pick-list" data-testid="home-subject-modal-list">
        ${courses.map(course => `
          <button class="home-pick-button" type="button" data-home-course-id="${esc(course.id)}" data-testid="home-subject-choice">
            <span class="home-pick-badge">${esc((course.modules || []).length)} mód.</span>
            <span class="home-pick-main">
              <strong>${esc(tx(course.title))}</strong>
              <span>${esc(course.description || 'Módulos, QCM, casos clínicos y V/F')}</span>
            </span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function openModuleModal(course){
    const modal = ensureModal();
    const modules = Array.isArray(course.modules) ? course.modules : [];
    modal.querySelector('#homePickCode').textContent = tx(course.title).toUpperCase();
    modal.querySelector('#homePickTitle').textContent = `${tx(course.title)} — Elegir un módulo`;
    modal.querySelector('.home-pick-body').innerHTML = `
      <button class="home-pick-back" type="button" data-home-back-subjects>← Cambiar materia</button>
      <div class="home-pick-list" data-testid="home-module-modal-list">
        ${modules.length ? modules.map(module => `
          <a class="home-pick-link" href="${moduleUrl(module)}" data-testid="home-module-choice">
            <span class="home-pick-badge">Mód. ${esc(module.number || '')}</span>
            <span class="home-pick-main">
              <strong>${esc(tx(module.title))}</strong>
              <span>Curso completo · entrenamiento disponible</span>
            </span>
          </a>
        `).join('') : '<div class="home-pick-empty">No hay módulos disponibles.</div>'}
      </div>
    `;
    modal.querySelector('[data-home-back-subjects]')?.addEventListener('click', renderSubjects, { once:false });
  }

  function isSubjectLauncher(target){
    const el = target && target.closest && target.closest('[data-home-subject-launch], [data-testid="home-subject-picker-trigger"], .home-action-card.primary, .home-v41-actions .btn.primary');
    if(!el) return null;
    if(el.closest('#homeSubjectModal')) return null;
    return el;
  }

  function markTriggers(){
    const triggers = [
      document.querySelector('.home-action-card.primary'),
      document.querySelector('.home-v41-actions .btn.primary')
    ].filter(Boolean);

    triggers.forEach(trigger => {
      trigger.dataset.homeSubjectLaunch = '1';
      trigger.dataset.testid = 'home-subject-picker-trigger';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'homeSubjectModal');
    });
  }

  document.addEventListener('click', event => {
    const trigger = isSubjectLauncher(event.target);
    if(!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openModal();
  }, true);

  document.addEventListener('touchend', event => {
    const trigger = isSubjectLauncher(event.target);
    if(!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openModal();
  }, { capture:true, passive:false });

  injectStyle();
  ensureModal();
  markTriggers();
  window.setTimeout(markTriggers, 350);
  window.setTimeout(markTriggers, 1200);
})();
