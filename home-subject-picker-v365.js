(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'home') return;

  const DATA = window.MED_COURSES_DATA || { courses: [] };
  const courses = Array.isArray(DATA.courses)
    ? DATA.courses.filter(course => Array.isArray(course.modules) && course.modules.length)
    : [];

  if(!courses.length) return;

  window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ = 'v370-scroll-safe-modal';

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

  const moduleUrl = module => `/module.html?id=${encodeURIComponent(module.id)}`;
  const two = value => String(value || 0).padStart(2, '0');
  let lastModalActionAt = 0;
  let ignoreTapUntil = 0;
  let modalTouch = null;
  let launcherTouch = null;

  const TAP_MOVE_LIMIT = 12;
  const TAP_TIME_LIMIT = 750;

  function pointFromEvent(event){
    const touch = event.changedTouches && event.changedTouches[0] || event.touches && event.touches[0];
    return touch || event;
  }

  function beginGesture(event, target){
    const p = pointFromEvent(event);
    return {
      target,
      x: Number(p.clientX || 0),
      y: Number(p.clientY || 0),
      time: Date.now(),
      moved: false
    };
  }

  function updateGesture(gesture, event){
    if(!gesture) return gesture;
    const p = pointFromEvent(event);
    const dx = Math.abs(Number(p.clientX || 0) - gesture.x);
    const dy = Math.abs(Number(p.clientY || 0) - gesture.y);
    if(dx > TAP_MOVE_LIMIT || dy > TAP_MOVE_LIMIT) gesture.moved = true;
    return gesture;
  }

  function isStableTap(gesture, event){
    if(!gesture) return true;
    updateGesture(gesture, event);
    const elapsed = Date.now() - gesture.time;
    return !gesture.moved && elapsed <= TAP_TIME_LIMIT;
  }

  function injectStyle(){
    if(document.getElementById('homeSubjectPickerStyle')) return;
    const style = document.createElement('style');
    style.id = 'homeSubjectPickerStyle';
    style.textContent = `
      .home-action-code{font-size:.72rem!important;letter-spacing:.14em;text-transform:uppercase;font-weight:950;color:#ecd38b!important;background:linear-gradient(180deg,rgba(236,211,139,.14),rgba(236,211,139,.04))!important;border:1px solid rgba(236,211,139,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important}
      .home-pick-modal{position:fixed;inset:0;z-index:12000;display:none;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 42px) 14px calc(env(safe-area-inset-bottom,0px) + 18px);background:radial-gradient(circle at top,rgba(16,32,57,.72),rgba(0,0,0,.88) 46%,rgba(0,0,0,.94));overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;backdrop-filter:blur(10px)}
      .home-pick-modal.open{display:flex;animation:homePickFade .18s ease-out both}
      body.home-pick-open{overflow:hidden}
      .home-pick-panel{width:min(618px,100%);max-height:calc(100vh - 82px);display:flex;flex-direction:column;background:radial-gradient(circle at 14% 0%,rgba(236,211,139,.09),transparent 34%),linear-gradient(180deg,#071222 0%,#040914 100%);border:1px solid rgba(236,211,139,.20);border-radius:26px;box-shadow:0 30px 90px rgba(0,0,0,.62),0 0 0 1px rgba(255,255,255,.035) inset;color:#f8fafc;overflow:hidden;transform-origin:top center;animation:homePickRise .22s cubic-bezier(.2,.8,.2,1) both}
      .home-pick-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 22px 17px;border-bottom:1px solid rgba(255,255,255,.075);background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0))}
      .home-pick-head small{display:block;color:#d7bd72;font-size:.67rem;font-weight:950;letter-spacing:.24em;text-transform:uppercase;margin-bottom:8px}
      .home-pick-head h2{margin:0;color:#f6f7fb;font-size:clamp(1.34rem,4.8vw,1.9rem);line-height:1.07;font-weight:900;letter-spacing:-.035em}
      .home-pick-close{width:52px;height:52px;flex:0 0 auto;border-radius:18px;border:1px solid rgba(255,255,255,.105);background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.025));color:#f4f4f5;font-size:2rem;line-height:1;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
      .home-pick-close:active{transform:scale(.98)}
      .home-pick-body{min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;touch-action:pan-y}
      .home-pick-list{display:grid;gap:10px;padding:16px}
      .home-pick-link,.home-pick-button{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;width:100%;min-height:68px;text-align:left;text-decoration:none;border:1px solid rgba(255,255,255,.085);border-radius:20px;background:linear-gradient(180deg,rgba(14,24,42,.96),rgba(7,15,29,.98));color:#f8fafc;padding:12px 14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.026),0 10px 24px rgba(0,0,0,.12);cursor:pointer;font:inherit;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;touch-action:manipulation}
      .home-pick-link:hover,.home-pick-button:hover{transform:translateY(-1px);border-color:rgba(236,211,139,.28);background:linear-gradient(180deg,rgba(18,30,52,.98),rgba(8,17,33,1));box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 14px 30px rgba(0,0,0,.18)}
      .home-pick-index{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:15px;background:linear-gradient(180deg,rgba(236,211,139,.16),rgba(236,211,139,.055));border:1px solid rgba(236,211,139,.22);color:#ead18b;font-size:.76rem;letter-spacing:.11em;font-weight:950;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)}
      .home-pick-main{display:block;min-width:0;overflow:hidden}
      .home-pick-main strong{display:block;font-size:1.06rem;line-height:1.12;font-weight:880;color:#f7f8fb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.015em}
      .home-pick-main span{display:block;margin-top:4px;color:rgba(210,219,233,.62);font-size:.78rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .home-pick-count{justify-self:end;display:inline-flex;align-items:center;justify-content:center;min-width:76px;padding:7px 10px;border-radius:999px;background:rgba(236,211,139,.09);border:1px solid rgba(236,211,139,.15);color:#e4ca81;font-size:.73rem;font-weight:900;letter-spacing:.02em;white-space:nowrap}
      .home-pick-back{display:inline-flex;align-items:center;gap:8px;margin:14px 16px 0;padding:8px 11px;border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(255,255,255,.045);color:#dbe2ec;font-size:.8rem;font-weight:850;cursor:pointer;touch-action:manipulation}
      .home-pick-empty{padding:18px;border:1px dashed rgba(255,255,255,.14);border-radius:18px;color:rgba(226,232,240,.72)}
      @keyframes homePickFade{from{opacity:0}to{opacity:1}}
      @keyframes homePickRise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      @media (max-width:560px){.home-pick-modal{padding:calc(env(safe-area-inset-top,0px) + 32px) 10px calc(env(safe-area-inset-bottom,0px) + 14px)}.home-pick-panel{width:min(100%,620px);max-height:calc(100vh - 64px);border-radius:24px}.home-pick-head{padding:17px 15px 15px}.home-pick-head small{font-size:.62rem;margin-bottom:7px}.home-pick-head h2{font-size:clamp(1.28rem,6vw,1.64rem)}.home-pick-close{width:48px;height:48px;border-radius:16px;font-size:1.85rem}.home-pick-list{gap:9px;padding:13px}.home-pick-link,.home-pick-button{min-height:64px;border-radius:18px;padding:10px 11px;gap:11px;grid-template-columns:auto minmax(0,1fr) auto}.home-pick-index{width:40px;height:40px;border-radius:13px;font-size:.7rem}.home-pick-main strong{font-size:1rem}.home-pick-main span{font-size:.74rem}.home-pick-count{min-width:auto;padding:6px 8px;font-size:.68rem}.home-pick-back{margin:12px 13px 0}}
    `;
    document.head.appendChild(style);
  }

  function stopEvent(event){
    if(!event) return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function guardModalAction(){
    const now = Date.now();
    if(now - lastModalActionAt < 300) return false;
    lastModalActionAt = now;
    return true;
  }

  function markScrollGesture(event){
    updateGesture(modalTouch, event);
    if(modalTouch && modalTouch.moved) ignoreTapUntil = Date.now() + 450;
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

    modal.addEventListener('touchstart', event => {
      modalTouch = beginGesture(event, event.target);
    }, { capture:true, passive:true });

    modal.addEventListener('touchmove', event => {
      markScrollGesture(event);
    }, { capture:true, passive:true });

    modal.addEventListener('pointerdown', event => {
      if(event.pointerType === 'mouse') return;
      modalTouch = beginGesture(event, event.target);
    }, { capture:true, passive:true });

    modal.addEventListener('pointermove', event => {
      if(event.pointerType === 'mouse') return;
      markScrollGesture(event);
    }, { capture:true, passive:true });

    const handleModalClick = event => {
      const close = event.target.closest && event.target.closest('[data-home-pick-close]');
      const back = event.target.closest && event.target.closest('[data-home-back-subjects]');
      const subjectButton = event.target.closest && event.target.closest('[data-home-course-id]');
      const moduleButton = event.target.closest && event.target.closest('[data-home-module-href]');
      const actionable = close || back || subjectButton || moduleButton || event.target === modal;

      if(actionable && Date.now() < ignoreTapUntil){
        stopEvent(event);
        return;
      }

      if(event.target === modal || close){
        stopEvent(event);
        closeModal();
        return;
      }
      if(back){
        stopEvent(event);
        renderSubjects();
        return;
      }
      if(subjectButton){
        stopEvent(event);
        if(!guardModalAction()) return;
        const course = courses.find(item => String(item.id) === String(subjectButton.dataset.homeCourseId));
        if(course) openModuleModal(course);
        return;
      }
      if(moduleButton){
        stopEvent(event);
        if(!guardModalAction()) return;
        const href = moduleButton.dataset.homeModuleHref;
        if(href) window.location.assign(href);
      }
    };

    modal.addEventListener('click', handleModalClick, { capture:true, passive:false });

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
    modalTouch = null;
    launcherTouch = null;
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
        ${courses.map((course, index) => `
          <button class="home-pick-button" type="button" data-home-course-id="${esc(course.id)}" data-testid="home-subject-choice">
            <span class="home-pick-index">${two(index + 1)}</span>
            <span class="home-pick-main">
              <strong>${esc(tx(course.title))}</strong>
              <span>${esc(course.description || 'Módulos integrados para estudio.')}</span>
            </span>
            <span class="home-pick-count">${esc((course.modules || []).length)} módulos</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function openModuleModal(course){
    const modal = ensureModal();
    const modules = Array.isArray(course.modules) ? course.modules : [];
    modalTouch = null;
    ignoreTapUntil = Date.now() + 120;
    modal.querySelector('#homePickCode').textContent = tx(course.title).toUpperCase();
    modal.querySelector('#homePickTitle').textContent = `${tx(course.title)} — Elegir un módulo`;
    modal.querySelector('.home-pick-body').innerHTML = `
      <button class="home-pick-back" type="button" data-home-back-subjects>← Cambiar materia</button>
      <div class="home-pick-list" data-testid="home-module-modal-list">
        ${modules.length ? modules.map((module, index) => {
          const href = moduleUrl(module);
          return `
          <button class="home-pick-link" type="button" data-home-module-href="${esc(href)}" data-testid="home-module-choice">
            <span class="home-pick-index">${two(module.number || index + 1)}</span>
            <span class="home-pick-main">
              <strong>${esc(tx(module.title))}</strong>
              <span>Curso completo · entrenamiento disponible</span>
            </span>
            <span class="home-pick-count">Módulo</span>
          </button>`;
        }).join('') : '<div class="home-pick-empty">No hay módulos disponibles.</div>'}
      </div>
    `;
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

  document.addEventListener('touchstart', event => {
    const trigger = isSubjectLauncher(event.target);
    if(!trigger) return;
    launcherTouch = beginGesture(event, trigger);
  }, { capture:true, passive:true });

  document.addEventListener('touchmove', event => {
    updateGesture(launcherTouch, event);
  }, { capture:true, passive:true });

  document.addEventListener('touchend', event => {
    const trigger = isSubjectLauncher(event.target);
    if(!trigger) return;
    if(!isStableTap(launcherTouch, event)) return;
    stopEvent(event);
    openModal();
    launcherTouch = null;
  }, { capture:true, passive:false });

  document.addEventListener('click', event => {
    const trigger = isSubjectLauncher(event.target);
    if(!trigger) return;
    if(launcherTouch && !isStableTap(launcherTouch, event)) return;
    stopEvent(event);
    openModal();
    launcherTouch = null;
  }, true);

  injectStyle();
  ensureModal();
  markTriggers();
  window.setTimeout(markTriggers, 350);
  window.setTimeout(markTriggers, 1200);
})();
