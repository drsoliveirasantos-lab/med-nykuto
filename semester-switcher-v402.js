/* v403 — Persistent semester switcher shared across Med Nykuto. */
(function () {
  'use strict';

  if (window.__MED_NYKUTO_SEMESTER_SWITCHER_V402__) return;
  window.__MED_NYKUTO_SEMESTER_SWITCHER_V402__ = true;

  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var semesterFourPages = ['clase', 'clase.html', 'grupo-3', 'grupo-3.html'];
  var currentSemester = semesterFourPages.indexOf(page) !== -1 ? '4' : '3';

  function installStyles() {
    if (document.getElementById('semesterSwitcherV402Styles')) return;

    var style = document.createElement('style');
    style.id = 'semesterSwitcherV402Styles';
    style.textContent = [
      '.semester-switcher-v402{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:950;display:grid;grid-template-columns:auto auto;align-items:center;gap:10px;min-height:54px;padding:7px 8px 7px 14px;border:1px solid rgba(198,218,244,.18);border-radius:18px;background:rgba(6,14,25,.94);box-shadow:0 18px 48px rgba(0,0,0,.42);backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15);color:#f5f8ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '.semester-switcher-v402>span{display:grid;gap:1px;line-height:1}',
      '.semester-switcher-v402>span strong{font-size:.62rem;letter-spacing:.13em;color:#91a7c2}',
      '.semester-switcher-v402>span small{font-size:.72rem;font-weight:850;color:#f5f8ff}',
      '.semester-switcher-v402 .sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}',
      '.semester-switcher-v402 select{min-width:132px;min-height:42px;padding:0 34px 0 12px;border:1px solid rgba(113,218,255,.28);border-radius:12px;background:#101c2d;color:#f5f8ff;font:800 .8rem/1 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;color-scheme:dark}',
      '.semester-switcher-v402 select:hover{border-color:rgba(113,218,255,.58)}',
      '.semester-switcher-v402 select:focus-visible{outline:3px solid rgba(113,218,255,.28);outline-offset:2px;border-color:#71daff}',
      '.semester-switcher-v402[data-semester="4"]{border-color:rgba(114,224,171,.28)}',
      '.semester-switcher-v402[data-semester="4"] select{border-color:rgba(114,224,171,.35)}',
      '@media(max-width:680px){.semester-switcher-v402{left:10px;bottom:max(10px,env(safe-area-inset-bottom));min-height:48px;padding:5px 6px 5px 11px;border-radius:15px}.semester-switcher-v402>span strong{font-size:.56rem}.semester-switcher-v402>span small{font-size:.66rem}.semester-switcher-v402 select{min-width:112px;min-height:40px;padding-left:9px;font-size:.73rem}body.has-class-bottom-nav-v402 .semester-switcher-v402{bottom:82px}}',
      '@media(max-width:370px){.semester-switcher-v402>span{display:none}.semester-switcher-v402{grid-template-columns:1fr;padding-left:6px}.semester-switcher-v402 select{min-width:126px}}',
      '@media print{.semester-switcher-v402{display:none!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function installSwitcher() {
    if (!document.body || document.getElementById('semesterSwitcherV402')) return;

    installStyles();
    if (document.querySelector('.mobile-bottom-nav')) {
      document.body.classList.add('has-class-bottom-nav-v402');
    }

    var wrapper = document.createElement('div');
    wrapper.id = 'semesterSwitcherV402';
    wrapper.className = 'semester-switcher-v402';
    wrapper.dataset.semester = currentSemester;
    wrapper.setAttribute('aria-label', 'Selector de semestre');
    wrapper.innerHTML = [
      '<span aria-hidden="true"><strong>SEMESTRE</strong><small>Cambiar vista</small></span>',
      '<label class="sr-only" for="semesterSelectV402">Elegir semestre</label>',
      '<select id="semesterSelectV402" aria-label="Elegir semestre">',
      '<option value="3">3.º semestre</option>',
      '<option value="4">4.º semestre</option>',
      '<option value="5" disabled>5.º · próximamente</option>',
      '</select>'
    ].join('');

    document.body.appendChild(wrapper);
    var select = wrapper.querySelector('select');
    select.value = currentSemester;

    select.addEventListener('change', function () {
      var semester = select.value;
      if (semester === currentSemester) return;

      try { localStorage.setItem('medNykutoSemester', semester); } catch (error) {}
      window.location.assign(semester === '4' ? 'clase.html' : 'index.html');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installSwitcher, { once: true });
  } else {
    installSwitcher();
  }
})();
