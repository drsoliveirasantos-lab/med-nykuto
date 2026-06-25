(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'home') return;

  const DATA = window.MED_COURSES_DATA || { courses: [] };
  const courses = Array.isArray(DATA.courses)
    ? DATA.courses.filter(course => Array.isArray(course.modules) && course.modules.length)
    : [];

  if(!courses.length) return;
  if(document.getElementById('homeSubjectPicker')) return;

  window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ = 'v365';

  const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));

  const subjectUrl = courseId => `matiere.html?course=${encodeURIComponent(courseId)}`;
  const moduleUrl = moduleId => `module.html?id=${encodeURIComponent(moduleId)}`;
  const qcmUrl = (courseId, moduleId) => `qcm.html?course=${encodeURIComponent(courseId)}${moduleId ? `&module=${encodeURIComponent(moduleId)}` : ''}`;
  const caseUrl = (courseId, moduleId) => `cas-cliniques.html?course=${encodeURIComponent(courseId)}${moduleId ? `&module=${encodeURIComponent(moduleId)}` : ''}`;
  const vfUrl = (courseId, moduleId) => `vrai-faux.html?course=${encodeURIComponent(courseId)}${moduleId ? `&module=${encodeURIComponent(moduleId)}` : ''}`;

  function injectStyle(){
    if(document.getElementById('homeSubjectPickerStyle')) return;
    const style = document.createElement('style');
    style.id = 'homeSubjectPickerStyle';
    style.textContent = `
      .home-subject-picker-section{width:min(1120px,calc(100% - 32px));margin:26px auto 18px;padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03));box-shadow:0 24px 70px rgba(0,0,0,.22)}
      .home-subject-picker-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}
      .home-subject-picker-head h2{margin:.2rem 0 .35rem;font-size:clamp(1.35rem,2.5vw,2.05rem)}
      .home-subject-picker-head p{margin:0;max-width:680px;color:rgba(255,255,255,.72)}
      .home-subject-picker-control{display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:18px;align-items:center;margin:18px 0 16px}
      .home-subject-picker-control label{display:block;font-weight:800;margin-bottom:8px}
      .home-subject-picker-control select{width:100%;border:1px solid rgba(255,255,255,.18);border-radius:16px;background:#111827;color:#fff;padding:14px 44px 14px 14px;font:inherit;font-weight:750;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.03)}
      .home-subject-picker-control select:focus{border-color:rgba(96,165,250,.9);box-shadow:0 0 0 4px rgba(96,165,250,.22)}
      .home-subject-picker-hint{margin:0;color:rgba(255,255,255,.6);font-size:.95rem}
      .home-selected-modules{min-height:96px}
      .home-picker-placeholder{border:1px dashed rgba(255,255,255,.18);border-radius:22px;padding:20px;color:rgba(255,255,255,.68);background:rgba(0,0,0,.16)}
      .home-selected-summary{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:14px;padding:16px 18px;border-radius:22px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.1)}
      .home-selected-summary h3{margin:0 0 4px;font-size:1.16rem}.home-selected-summary p{margin:0;color:rgba(255,255,255,.66)}
      .home-selected-summary-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.home-selected-summary-actions .btn{white-space:nowrap}
      .home-module-scroll{max-height:460px;overflow:auto;padding-right:8px;scrollbar-width:thin}
      .home-module-picker-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:12px}
      .home-module-card{display:flex;flex-direction:column;gap:12px;min-height:190px;padding:16px;border-radius:20px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.045)}
      .home-module-card small{color:rgba(255,255,255,.52);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.home-module-card h4{margin:0;font-size:1rem;line-height:1.28}.home-module-card p{margin:0;color:rgba(255,255,255,.62);font-size:.92rem;line-height:1.42}
      .home-module-card-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}.home-module-card-actions a{font-size:.86rem;padding:8px 10px;border-radius:999px;text-decoration:none;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff}.home-module-card-actions a.primary-link{background:rgba(59,130,246,.22);border-color:rgba(96,165,250,.35)}
      @media (max-width:720px){.home-subject-picker-section{width:min(100% - 18px,1120px);padding:18px;border-radius:22px}.home-subject-picker-head,.home-selected-summary{display:block}.home-subject-picker-control{grid-template-columns:1fr}.home-selected-summary-actions{justify-content:flex-start;margin-top:12px}.home-module-scroll{max-height:520px;padding-right:0}}
    `;
    document.head.appendChild(style);
  }

  function buildSection(){
    const section = document.createElement('section');
    section.id = 'homeSubjectPicker';
    section.className = 'home-subject-picker-section';
    section.setAttribute('aria-labelledby', 'homeSubjectPickerTitle');
    section.innerHTML = `
      <div class="home-subject-picker-head">
        <div>
          <p class="eyebrow">SELECCIÓN RÁPIDA</p>
          <h2 id="homeSubjectPickerTitle">Elige una materia y abre sus módulos</h2>
          <p>Selecciona una materia en el menú desplegable. Sus módulos aparecerán aquí, sin pasar por una página intermedia con todas las materias.</p>
        </div>
      </div>
      <div class="home-subject-picker-control">
        <div>
          <label for="homeSubjectSelect">Materia</label>
          <select id="homeSubjectSelect" autocomplete="off" data-testid="home-subject-select">
            <option value="">Selecciona una materia…</option>
          </select>
        </div>
        <p class="home-subject-picker-hint">Después puedes abrir el curso, lanzar QCM, casos clínicos o V/F directamente desde el módulo.</p>
      </div>
      <div class="home-selected-modules" id="homeSelectedModules" data-testid="home-selected-modules">
        <div class="home-picker-placeholder">Primero selecciona una materia para mostrar sus módulos.</div>
      </div>
    `;
    return section;
  }

  function moduleSummary(module){
    const summary = String(module.summary || '').trim();
    if(summary) return summary.length > 135 ? `${summary.slice(0, 132)}…` : summary;
    const headings = Array.isArray(module.headings) ? module.headings.filter(Boolean).slice(0, 3).join(' · ') : '';
    return headings || 'Curso, entrenamiento y revisión disponibles.';
  }

  function renderCourse(courseId){
    const holder = document.getElementById('homeSelectedModules');
    if(!holder) return;
    const course = courses.find(item => item.id === courseId);
    if(!course){
      holder.innerHTML = '<div class="home-picker-placeholder">Primero selecciona una materia para mostrar sus módulos.</div>';
      return;
    }

    const modules = Array.isArray(course.modules) ? course.modules : [];
    holder.innerHTML = `
      <div class="home-selected-summary">
        <div>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${modules.length} módulos disponibles para esta materia.</p>
        </div>
        <div class="home-selected-summary-actions">
          <a class="btn secondary" href="${subjectUrl(course.id)}">Página de la materia</a>
          <a class="btn primary" href="${qcmUrl(course.id)}">QCM de la materia</a>
        </div>
      </div>
      <div class="home-module-scroll" tabindex="0" aria-label="Módulos de ${escapeHtml(course.title)}">
        <div class="home-module-picker-grid">
          ${modules.map(module => `
            <article class="home-module-card">
              <small>Módulo ${escapeHtml(module.number || '')}</small>
              <h4>${escapeHtml(module.title || 'Módulo')}</h4>
              <p>${escapeHtml(moduleSummary(module))}</p>
              <div class="home-module-card-actions">
                <a class="primary-link" href="${moduleUrl(module.id)}">Abrir curso</a>
                <a href="${qcmUrl(course.id, module.id)}">QCM</a>
                <a href="${caseUrl(course.id, module.id)}">Casos</a>
                <a href="${vfUrl(course.id, module.id)}">V/F</a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }

  function setupTriggers(section, select){
    const triggers = [
      document.querySelector('.home-action-card.primary'),
      document.querySelector('.home-v41-actions .btn.primary')
    ].filter(Boolean);

    triggers.forEach(trigger => {
      trigger.setAttribute('href', '#homeSubjectPicker');
      trigger.setAttribute('aria-controls', 'homeSubjectPicker');
      trigger.dataset.testid = 'home-subject-picker-trigger';
      trigger.addEventListener('click', event => {
        event.preventDefault();
        history.replaceState(null, '', '#homeSubjectPicker');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => select.focus({ preventScroll: true }), 350);
      });
    });
  }

  injectStyle();

  const section = buildSection();
  const insertBefore = document.querySelector('.home-v41-dashboard') || document.querySelector('.home-v41-bottom') || document.querySelector('main > section:last-of-type');
  if(insertBefore && insertBefore.parentNode) insertBefore.parentNode.insertBefore(section, insertBefore);
  else document.querySelector('main')?.appendChild(section);

  const select = document.getElementById('homeSubjectSelect');
  if(!select) return;

  select.insertAdjacentHTML('beforeend', courses.map(course => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)} — ${(course.modules || []).length} módulos</option>`).join(''));
  setupTriggers(section, select);

  select.addEventListener('change', () => {
    const value = select.value;
    if(value) localStorage.setItem('med-nykuto-last-home-course', value);
    renderCourse(value);
    const holder = document.getElementById('homeSelectedModules');
    if(holder && value) holder.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  const stored = localStorage.getItem('med-nykuto-last-home-course');
  if(stored && courses.some(course => course.id === stored)){
    select.value = stored;
    renderCourse(stored);
  }

  if(location.hash === '#homeSubjectPicker'){
    window.setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      select.focus({ preventScroll: true });
    }, 120);
  }
})();
