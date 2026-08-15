/* v405 — Persistent semester switcher shared across Med Nykuto. */
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
      '@media(max-width:680px){.semester-switcher-v402{left:auto;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));grid-template-columns:1fr;min-height:42px;padding:4px;border-radius:14px}.semester-switcher-v402>span{display:none}.semester-switcher-v402 select{width:124px;min-width:0;min-height:38px;padding:0 28px 0 9px;font-size:.72rem}body.has-class-bottom-nav-v402 .semester-switcher-v402{bottom:72px}}',
      '@media(max-width:370px){.semester-switcher-v402>span{display:none}.semester-switcher-v402{grid-template-columns:1fr;padding-left:6px}.semester-switcher-v402 select{min-width:126px}}',
      '.semester-switcher-v402.is-class-header-v402{position:static;inset:auto;z-index:auto;display:flex;grid-template-columns:none;gap:6px;min-height:0;padding:4px 5px;border-radius:999px;background:rgba(255,255,255,.035);box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none}',
      '.semester-switcher-v402.is-class-header-v402>span{display:none}',
      '.semester-switcher-v402.is-class-header-v402 select{width:auto;min-width:112px;min-height:32px;padding:0 24px 0 9px;border:0;border-radius:999px;background:#0d1b2c;font-size:.7rem}',
      '.semester-switcher-v402 .semester-class-v402{display:inline-flex;align-items:center;min-height:28px;padding:0 8px;border-left:1px solid rgba(198,218,244,.16);color:#ffe2a3;font-size:.68rem;font-weight:900;white-space:nowrap}',
      '@media(max-width:680px){.semester-switcher-v402.is-class-header-v402{position:static;right:auto;bottom:auto;padding:3px 4px}.semester-switcher-v402.is-class-header-v402 select{width:92px;min-width:92px;min-height:30px;padding-left:7px;font-size:.62rem}.semester-switcher-v402 .semester-class-v402{min-height:26px;padding:0 6px;font-size:.61rem}}',
      '@media print{.semester-switcher-v402{display:none!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function installSwitcher() {
    if (!document.body || document.getElementById('semesterSwitcherV402')) return;

    installStyles();
    var classScope = document.querySelector('.class-header-inner .class-scope');
    var useClassHeader = !!classScope;
    if (!useClassHeader && document.querySelector('.mobile-bottom-nav')) {
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
      '</select>',
      useClassHeader ? '<strong class="semester-class-v402">4.º E</strong>' : ''
    ].join('');

    if (useClassHeader) {
      wrapper.classList.add('is-class-header-v402');
      classScope.replaceWith(wrapper);
    } else {
      document.body.appendChild(wrapper);
    }
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
