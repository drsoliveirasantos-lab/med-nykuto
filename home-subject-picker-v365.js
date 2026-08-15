(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'home') return;

  const DATA = window.MED_COURSES_DATA || { courses: [] };
  const legacyCourses = Array.isArray(DATA.courses)
    ? DATA.courses.filter(course => Array.isArray(course.modules) && course.modules.length)
    : [];

  if(!legacyCourses.length) return;

  window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ = 'v372-semester-catalog-isolation';

  const SEMESTER_STORAGE_KEY = 'medNykuto:studentSemester';
  const SEMESTERS = [
    { id:'s3', number:'3', status:'available', period:'Disponible ahora' },
    { id:'s4', number:'4', status:'building', period:'Agosto–diciembre de 2026' },
    { id:'s5', number:'5', status:'planned', period:'A partir de febrero de 2027' }
  ];
  const S4_COURSES = [
    { id:'fisiologia-2', title:{ es:'Fisiología II' }, description:'Contenido en preparación.', modules:[] },
    { id:'microbiologia-2', title:{ es:'Microbiología II' }, description:'Contenido en preparación.', modules:[] },
    { id:'bioquimica-2', title:{ es:'Bioquímica II' }, description:'Contenido en preparación.', modules:[] },
    { id:'nutricion', title:{ es:'Nutrición' }, description:'Contenido en preparación.', modules:[] },
    { id:'epidemiologia-salud-publica', title:{ es:'Epidemiología y Salud Pública' }, description:'Contenido en preparación.', modules:[] },
    { id:'bioetica', title:{ es:'Bioética' }, description:'Contenido en preparación.', modules:[] }
  ];

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
      .home-semester-card{max-width:1180px;margin:0 auto 18px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid rgba(236,211,139,.2);border-radius:22px;background:linear-gradient(135deg,rgba(236,211,139,.09),rgba(8,20,37,.86) 48%,rgba(18,42,68,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 16px 42px rgba(0,0,0,.16);color:#f8fafc}
      .home-semester-card-copy{min-width:0}.home-semester-eyebrow{margin:0 0 5px;color:#d7bd72;font-size:.68rem;font-weight:950;letter-spacing:.18em;text-transform:uppercase}.home-semester-card h2{margin:0;font-size:clamp(1.05rem,3vw,1.32rem);letter-spacing:-.025em}.home-semester-card p{margin:6px 0 0;color:rgba(220,228,239,.72);font-size:.84rem;line-height:1.45}.home-semester-change{flex:0 0 auto;padding:11px 15px;border:1px solid rgba(236,211,139,.28);border-radius:14px;background:rgba(236,211,139,.1);color:#f0d993;font:inherit;font-size:.8rem;font-weight:900;cursor:pointer}
      .home-semester-modal{position:fixed;inset:0;z-index:12500;display:none;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 22px) 14px calc(env(safe-area-inset-bottom,0px) + 22px);background:radial-gradient(circle at top,rgba(16,34,60,.82),rgba(0,0,0,.93) 55%);backdrop-filter:blur(12px)}.home-semester-modal.open{display:flex;animation:homePickFade .18s ease-out both}.home-semester-panel{width:min(650px,100%);max-height:calc(100vh - 44px);overflow:auto;padding:24px;border:1px solid rgba(236,211,139,.22);border-radius:28px;background:radial-gradient(circle at 8% 0%,rgba(236,211,139,.1),transparent 34%),linear-gradient(180deg,#081526,#030914);box-shadow:0 30px 90px rgba(0,0,0,.65);color:#f8fafc}.home-semester-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.home-semester-panel .home-semester-close{width:44px;height:44px;flex:0 0 auto;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.05);color:#fff;font-size:1.6rem;cursor:pointer}.home-semester-panel h2{margin:5px 0 8px;font-size:clamp(1.55rem,6vw,2.1rem);letter-spacing:-.04em}.home-semester-lead{margin:0;color:rgba(220,228,239,.7);line-height:1.5}.home-semester-options{display:grid;gap:11px;margin-top:20px}.home-semester-option{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;padding:15px;border:1px solid rgba(255,255,255,.1);border-radius:19px;background:linear-gradient(180deg,rgba(16,29,49,.98),rgba(7,15,29,.98));color:#f8fafc;text-align:left;font:inherit;cursor:pointer}.home-semester-option:hover,.home-semester-option[aria-pressed="true"]{border-color:rgba(236,211,139,.42);background:linear-gradient(180deg,rgba(45,42,35,.9),rgba(12,24,41,.98))}.home-semester-number{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;border:1px solid rgba(236,211,139,.24);background:rgba(236,211,139,.11);color:#eed58b;font-weight:950}.home-semester-option strong,.home-semester-option small{display:block}.home-semester-option strong{font-size:1rem}.home-semester-option small{margin-top:5px;color:rgba(218,226,238,.65);line-height:1.35}.home-semester-status{padding:6px 9px;border-radius:999px;font-size:.66rem;font-weight:950;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap}.home-semester-status.available{background:rgba(35,180,113,.14);color:#77e2ae}.home-semester-status.building{background:rgba(236,211,139,.13);color:#ecd38b}.home-semester-status.planned{background:rgba(99,159,220,.13);color:#9ccdf5}.home-semester-note{margin:18px 0 0;padding:13px 15px;border-left:3px solid rgba(236,211,139,.48);border-radius:0 12px 12px 0;background:rgba(236,211,139,.055);color:rgba(225,231,240,.74);font-size:.78rem;line-height:1.5}
      .home-pick-count.empty{color:#9ccdf5;background:rgba(99,159,220,.09);border-color:rgba(99,159,220,.16)}.home-semester-empty-notice{margin:12px 16px 16px;padding:14px 15px;border:1px solid rgba(236,211,139,.17);border-radius:16px;background:rgba(236,211,139,.055);color:rgba(229,234,242,.76);font-size:.8rem;line-height:1.5}body[data-student-semester="s4"] .home-action-card:not(.primary),body[data-student-semester="s5"] .home-action-card:not(.primary),body[data-student-semester="s4"] .home-v41-actions a:not(:first-child),body[data-student-semester="s5"] .home-v41-actions a:not(:first-child){opacity:.58}
      @keyframes homePickFade{from{opacity:0}to{opacity:1}}
      @keyframes homePickRise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      @media (max-width:560px){.home-pick-modal{padding:calc(env(safe-area-inset-top,0px) + 32px) 10px calc(env(safe-area-inset-bottom,0px) + 14px)}.home-pick-panel{width:min(100%,620px);max-height:calc(100vh - 64px);border-radius:24px}.home-pick-head{padding:17px 15px 15px}.home-pick-head small{font-size:.62rem;margin-bottom:7px}.home-pick-head h2{font-size:clamp(1.28rem,6vw,1.64rem)}.home-pick-close{width:48px;height:48px;border-radius:16px;font-size:1.85rem}.home-pick-list{gap:9px;padding:13px}.home-pick-link,.home-pick-button{min-height:64px;border-radius:18px;padding:10px 11px;gap:11px;grid-template-columns:auto minmax(0,1fr) auto}.home-pick-index{width:40px;height:40px;border-radius:13px;font-size:.7rem}.home-pick-main strong{font-size:1rem}.home-pick-main span{font-size:.74rem}.home-pick-count{min-width:auto;padding:6px 8px;font-size:.68rem}.home-pick-back{margin:12px 13px 0}.home-semester-card{margin:0 12px 16px;padding:15px;align-items:flex-start;flex-direction:column}.home-semester-change{width:100%}.home-semester-panel{padding:19px 15px;border-radius:24px}.home-semester-option{grid-template-columns:auto minmax(0,1fr);padding:12px}.home-semester-status{grid-column:2;justify-self:start}.home-semester-number{width:44px;height:44px}}
    `;
    document.head.appendChild(style);
  }

  function stopEvent(event){
    if(!event) return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function selectedSemester(){
    const stored = localStorage.getItem(SEMESTER_STORAGE_KEY);
    return SEMESTERS.find(item => item.id === stored) || null;
  }

  function coursesForSemester(){
    const id = selectedSemester()?.id || 's3';
    if(id === 's4') return S4_COURSES;
    if(id === 's5') return [];
    return legacyCourses;
  }

  function semesterStatusLabel(semester){
    return semester.status === 'available' ? 'Disponible' : semester.status === 'building' ? 'En curso' : 'Próximamente';
  }

  function updateSemesterCard(){
    const semester = selectedSemester();
    const card = document.getElementById('homeSemesterCard');
    if(!card || !semester) return;
    card.querySelector('[data-semester-title]').textContent = `Semestre ${semester.number} seleccionado`;
    card.querySelector('[data-semester-detail]').textContent = semester.status === 'available'
      ? 'Contenido disponible ahora · puedes conservarlo para revisar los prerrequisitos.'
      : semester.status === 'building'
        ? 'En curso de publicación · nuevos contenidos entre agosto y diciembre de 2026.'
        : 'Próximamente · contenidos previstos a partir de febrero de 2027.';
    document.body.dataset.studentSemester = semester.id;
    updateHomepageScope(semester);
  }

  function updateHomepageScope(semester){
    const moduleCount = semester.id === 's3'
      ? legacyCourses.reduce((sum, course) => sum + (course.modules || []).length, 0)
      : 0;
    const subjectCount = semester.id === 's4' ? S4_COURSES.length : semester.id === 's5' ? 0 : legacyCourses.length;
    ['statModulesHero','statModules'].forEach(id => {
      const element = document.getElementById(id);
      if(element) element.textContent = String(moduleCount);
    });
    const subjectStat = document.getElementById('statCursoes');
    if(subjectStat) subjectStat.textContent = String(subjectCount);
    document.querySelectorAll('.home-action-card:not(.primary), .home-v41-actions a:not(:first-child), .home-v41-bottom-actions a, #navLinks a[href="matieres.html"], #navLinks a[href="modules.html"], #navLinks a[href="qcm.html"], #navLinks a[href="cas-cliniques.html"], #navLinks a[href="vrai-faux.html"], #navLinks a[href="erreurs.html"], #navLinks a[href="examen.html"], .footer a[href="matieres.html"], .footer a[href="modules.html"]').forEach(link => {
      if(semester.id === 's3'){
        if(link.dataset.semesterHref) link.setAttribute('href', link.dataset.semesterHref);
        link.removeAttribute('aria-disabled');
        link.removeAttribute('title');
      } else {
        if(!link.dataset.semesterHref) link.dataset.semesterHref = link.getAttribute('href') || '';
        link.setAttribute('href', '#');
        link.setAttribute('aria-disabled', 'true');
        link.title = `Semestre ${semester.number}: contenido próximamente`;
      }
    });
    if(semester.id === 's4'){
      const steps = document.querySelector('.home-v41-steps');
      const firstStep = steps?.querySelector('article:first-child p');
      if(firstStep) firstStep.textContent = 'Fisiología II, Microbiología II, Bioquímica II, Nutrición, Epidemiología y Salud Pública o Bioética.';
      const secondStep = steps?.querySelector('article:nth-child(2) p');
      if(secondStep) secondStep.textContent = 'Los módulos aparecerán aquí progresivamente con el avance de las clases.';
      const grid = document.getElementById('subjectProgressGrid');
      if(grid) grid.innerHTML = S4_COURSES.map(course => `<article class="subject-progress-card"><div class="subject-progress-link" aria-disabled="true"><div><strong>${esc(tx(course.title))}</strong><span>0 módulos · próximamente</span></div><div class="subject-progress-pct">0%</div><div class="mini-progress"><i style="width:0%"></i></div></div></article>`).join('');
      const dashboard = document.getElementById('learningDashboard');
      if(dashboard) dashboard.innerHTML = '';
      const clear = document.getElementById('clearProgress');
      if(clear) clear.hidden = true;
    }
  }

  function ensureSemesterExperience(){
    if(document.getElementById('homeSemesterModal')) return;
    const card = document.createElement('section');
    card.id = 'homeSemesterCard';
    card.className = 'home-semester-card';
    card.setAttribute('aria-label', 'Semestre de estudio');
    card.innerHTML = `<div class="home-semester-card-copy"><p class="home-semester-eyebrow">Tu recorrido</p><h2 data-semester-title>Elige tu semestre</h2><p data-semester-detail>Personaliza el contenido según tu avance en medicina.</p></div><button class="home-semester-change" type="button" data-semester-open>Cambiar semestre</button>`;
    const main = document.querySelector('main');
    const hero = main && main.querySelector('.home-v41-hero');
    if(main) main.insertBefore(card, hero || main.firstChild);

    const modal = document.createElement('div');
    modal.id = 'homeSemesterModal';
    modal.className = 'home-semester-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `<section class="home-semester-panel" role="dialog" aria-modal="true" aria-labelledby="semesterTitle"><div class="home-semester-panel-head"><div><p class="home-semester-eyebrow">Personaliza tu inicio</p><h2 id="semesterTitle">¿Cuál es tu semestre?</h2><p class="home-semester-lead">Elige tu nivel actual. Podrás cambiarlo en cualquier momento.</p></div><button class="home-semester-close" type="button" data-semester-close aria-label="Cerrar">×</button></div><div class="home-semester-options">${SEMESTERS.map(semester => `<button class="home-semester-option" type="button" data-semester-select="${semester.id}" aria-pressed="false"><span class="home-semester-number">S${semester.number}</span><span><strong>Semestre ${semester.number}</strong><small>${semester.period}</small></span><span class="home-semester-status ${semester.status}">${semesterStatusLabel(semester)}</span></button>`).join('')}</div><p class="home-semester-note">Med Nykuto evoluciona al ritmo del curso de medicina. El contenido del semestre actual se publica progresivamente según las clases y las evaluaciones.</p></section>`;
    document.body.appendChild(modal);

    const openSemesterModal = () => {
      const current = selectedSemester();
      modal.querySelectorAll('[data-semester-select]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.semesterSelect === current?.id)));
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('home-pick-open');
    };
    const closeSemesterModal = () => {
      if(!selectedSemester()) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('home-pick-open');
    };
    card.querySelector('[data-semester-open]').addEventListener('click', openSemesterModal);
    modal.addEventListener('click', event => {
      const choice = event.target.closest('[data-semester-select]');
      if(choice){
        localStorage.setItem(SEMESTER_STORAGE_KEY, choice.dataset.semesterSelect);
        updateSemesterCard();
        closeSemesterModal();
      } else if(event.target === modal || event.target.closest('[data-semester-close]')) closeSemesterModal();
    });
    updateSemesterCard();
    if(!selectedSemester()) window.setTimeout(openSemesterModal, 80);
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
        const course = coursesForSemester().find(item => String(item.id) === String(subjectButton.dataset.homeCourseId));
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
    const visibleCourses = coursesForSemester();
    const semester = selectedSemester() || SEMESTERS[0];
    modal.querySelector('#homePickCode').textContent = 'MATERIAS';
    modal.querySelector('#homePickTitle').textContent = 'Elegir una materia';
    modal.querySelector('.home-pick-body').innerHTML = `
      <div class="home-pick-list" data-testid="home-subject-modal-list">
        ${visibleCourses.map((course, index) => `
          <button class="home-pick-button" type="button" data-home-course-id="${esc(course.id)}" data-testid="home-subject-choice">
            <span class="home-pick-index">${two(index + 1)}</span>
            <span class="home-pick-main">
              <strong>${esc(tx(course.title))}</strong>
              <span>${esc(course.description || 'Módulos integrados para estudio.')}</span>
            </span>
            <span class="home-pick-count${(course.modules || []).length ? '' : ' empty'}">${esc((course.modules || []).length)} módulos</span>
          </button>
        `).join('') || '<div class="home-pick-empty">Las materias del semestre 5 se publicarán más adelante.</div>'}
      </div>
      ${semester.id === 's4' ? '<p class="home-semester-empty-notice">Las materias ya están creadas, pero todavía no contienen módulos. Se añadirán progresivamente con el avance de las clases.</p>' : ''}
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
  ensureSemesterExperience();
  ensureModal();
  markTriggers();
  window.addEventListener('pageshow', updateSemesterCard);
  window.setTimeout(updateSemesterCard, 250);
  window.setTimeout(updateSemesterCard, 800);
  window.setTimeout(updateSemesterCard, 1800);
  window.setTimeout(markTriggers, 350);
  window.setTimeout(markTriggers, 1200);
})();
