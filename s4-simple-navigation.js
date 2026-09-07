(function () {
  'use strict';
  // One navigation owner for the S4 shell. Academic routers and banks remain authoritative.
  function start() {
    if (document.getElementById('s4SiteMenu')) return;
    var header = document.querySelector('.class-header-inner');
    var navigation = document.querySelector('.workspace-nav');
    if (!header || !navigation) return;
    var opener;
    var language = document.querySelector('.class-language-switcher');
    var scheduled = false;
    var lastRoot = null;
    var lastReadingY = 0;
    var positionKey = 'med-nykuto-s4-reader-v511';
    var positions;
    try { positions = JSON.parse(localStorage.getItem(positionKey) || '{}') || {}; } catch (_) { positions = {}; }
    if (typeof positions !== 'object' || Array.isArray(positions)) positions = {};
    var restoring = false;
    var returnPoint = null;
    var menuReadingRoot = null;
    var menuReadingPoint = null;
    var catalogSignature = '';
    var expandedSubjects = {};
    var wide = window.matchMedia('(min-width:1100px)');
    function reader() { return window.MedNykutoCourseReader; }
    function rootKey(root) { return root && (root.dataset.courseThemeWorkspace || root.id); }
    function readingPoint(root) {
      var panel = activePanel(root);
      var sections = panel ? Array.from(panel.querySelectorAll('[data-reader-section], .course-chapter-section:not(.s4-reader-section)')) : [];
      var section = sections.filter(function (node) { return node.getBoundingClientRect().top <= 120; }).pop() || sections[0];
      return { anchor: section && (section.dataset.readerSection || section.id), offset: section ? 100 - section.getBoundingClientRect().top : 0, y: window.scrollY };
    }
    function savePosition() {
      var root = activeRoot();
      if (restoring || !root || !isReading(root) || menu.dialog.open || index.dialog.open || document.querySelector('.practice-dialog[open]')) return;
      positions[rootKey(root)] = readingPoint(root);
      try { localStorage.setItem(positionKey, JSON.stringify(positions)); } catch (_) {}
    }
    function restorePosition(root, point, focus) {
      if (!root || !point) return;
      restoring = true;
      window.requestAnimationFrame(function () {
        if (activeRoot() !== root) { restoring = false; return; }
        var section = Array.from(root.querySelectorAll('[data-reader-section], .course-chapter-section')).find(function (node) {
          return (node.dataset.readerSection || node.id) === point.anchor;
        });
        window.scrollTo({ top: section ? window.scrollY + section.getBoundingClientRect().top - 100 + (Number(point.offset) || 0) : Math.max(0, Number(point.y) || 0), behavior: 'instant' });
        var target = section || root;
        if (focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
        window.requestAnimationFrame(function () { restoring = false; });
      });
    }
    function selectCourse(id, sectionKey) {
      savePosition();
      var current = activeRoot();
      if (sectionKey && current && isReading(current)) returnPoint = { id: rootKey(current), point: positions[rootKey(current)] || readingPoint(current) };
      else if (!sectionKey) returnPoint = null;
      closeDialog(menu.dialog); closeDialog(index.dialog);
      if (!reader() || !reader().open(id)) return;
      search.value = '';
      var root = activeRoot();
      lastRoot = root;
      restorePosition(root, sectionKey ? { anchor: sectionKey, offset: 0 } : positions[id] || { y: 0 }, true);
      schedule();
    }
    function label(es, pt) {
      var lang = document.documentElement.lang || 'es';
      return /^(pt|br)/.test(lang) ? pt : es;
    }
    function button(text, action) {
      var node = document.createElement('button');
      node.type = 'button'; node.textContent = text;
      node.addEventListener('click', action);
      return node;
    }
    function visible(node) { return node && !node.closest('[hidden]') && node.getClientRects().length > 0; }
    function activeRoot() {
      return Array.from(document.querySelectorAll('[data-course-theme-workspace], [data-lesson-panel]')).find(visible) || null;
    }
    function activePanel(root) {
      return root && Array.from(root.querySelectorAll(':scope > [data-lesson-tab-panel], :scope > [data-theme-panel]')).find(visible);
    }
    function isReading(root) {
      var panel = activePanel(root);
      return panel && (panel.dataset.lessonTabPanel === 'curso' || panel.dataset.themePanel === 'course');
    }
    function courseButton(root, mode) {
      return root && root.querySelector(root.hasAttribute('data-course-theme-workspace')
        ? '[data-theme-tab="' + (mode === 'curso' ? 'course' : mode) + '"]'
        : '[data-lesson-tab="' + mode + '"]');
    }
    function closeDialog(dialog) { if (dialog.open) dialog.close(); }
    function makeDialog(id, kind) {
      var dialog = document.createElement('dialog');
      dialog.id = id; dialog.className = 's4-navigation-dialog ' + kind;
      var head = document.createElement('header');
      var title = document.createElement('h2'); title.id = id + 'Title';
      head.appendChild(title);
      head.appendChild(button(label('Cerrar', 'Fechar'), function () { closeDialog(dialog); }));
      dialog.setAttribute('aria-labelledby', title.id);
      dialog.appendChild(head);
      dialog.addEventListener('keydown', function (event) {
        // A search input otherwise consumes Escape to clear its query first.
        if (event.key === 'Escape') { event.preventDefault(); closeDialog(dialog); }
      });
      var body = document.createElement('div'); body.className = 's4-navigation-dialog-body'; dialog.appendChild(body);
      dialog.addEventListener('click', function (event) {
        var rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
      });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('s4-navigation-open');
        document.querySelectorAll('[data-s4-menu-toggle], [data-s4-index-toggle]').forEach(function (node) { node.setAttribute('aria-expanded', 'false'); });
        if (opener && opener.isConnected && visible(opener)) opener.focus({ preventScroll: true });
        placeCatalog();
        if (dialog.id === 's4SiteMenu' && menuReadingRoot === activeRoot() && isReading(menuReadingRoot)) restorePosition(menuReadingRoot, menuReadingPoint, false);
      });
      document.body.appendChild(dialog);
      return { dialog: dialog, title: title, body: body };
    }
    var menu = makeDialog('s4SiteMenu', 's4-site-drawer');
    var index = makeDialog('s4CourseIndex', 's4-index-sheet');
    var sidebar = document.createElement('aside'); sidebar.id = 's4CourseSidebar';
    sidebar.setAttribute('aria-label', label('Cursos S4', 'Cursos S4')); document.body.appendChild(sidebar);
    var catalog = document.createElement('section'); catalog.id = 's4CourseCatalog';
    var searchLabel = document.createElement('label'); searchLabel.textContent = label('Buscar un curso o una noción', 'Buscar um curso ou uma noção');
    var search = document.createElement('input'); search.type = 'search'; search.id = 's4CourseSearch'; search.autocomplete = 'off';
    searchLabel.htmlFor = search.id; catalog.append(searchLabel, search);
    var results = document.createElement('nav'); results.setAttribute('aria-label', label('Cursos por materia', 'Cursos por matéria')); catalog.appendChild(results);
    var resultCount = document.createElement('p'); resultCount.setAttribute('role', 'status'); catalog.appendChild(resultCount);
    function placeCatalog() {
      var persistent = wide.matches && document.body.dataset.activeView === 'cursos';
      sidebar.hidden = !persistent;
      document.body.classList.toggle('s4-catalog-persistent', persistent);
      var host = persistent && !menu.dialog.open ? sidebar : menu.body;
      if (catalog.parentNode !== host) host.prepend(catalog);
    }
    function normalized(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    function drawCatalog() {
      if (!reader()) return;
      var groups = reader().catalog();
      var root = activeRoot(); var current = rootKey(root);
      var subject = root ? root.closest('.subject-section') : Array.from(document.querySelectorAll('.subject-section')).find(visible);
      var query = normalized(search.value.trim());
      results.replaceChildren(); resultCount.textContent = '';
      function courseButton(course, title, sectionKey) {
        var item = button(title, function () { selectCourse(course.id, sectionKey); });
        item.dataset.s4CourseOpen = course.id;
        if (sectionKey) item.dataset.s4SearchSection = sectionKey;
        if (course.id === current && !sectionKey) item.setAttribute('aria-current', 'page');
        return item;
      }
      if (query) {
        var matches = [];
        groups.forEach(function (group) { group.courses.forEach(function (course) {
          if (normalized(course.label).includes(query)) matches.push({ course: course, title: course.label });
          var seen = new Set();
          course.sections.forEach(function (section) {
            if (!section.label || seen.has(section.key) || !normalized(section.label + ' ' + section.text).includes(query)) return;
            seen.add(section.key); matches.push({ course: course, title: section.label + ' · ' + course.label, key: section.key });
          });
        }); });
        matches.slice(0, 24).forEach(function (match) { results.appendChild(courseButton(match.course, match.title, match.key)); });
        resultCount.textContent = matches.length ? (matches.length > 24 ? '24 / ' : '') + matches.length + label(' resultados', ' resultados') : label('Sin resultados', 'Sem resultados');
      } else {
        groups.forEach(function (group) {
          if (!group.courses.length) return;
          var details = document.createElement('details'); details.dataset.s4Subject = group.id;
          details.open = Boolean(subject && subject.id === group.id) || Boolean(expandedSubjects[group.id]);
          var summary = document.createElement('summary'); summary.textContent = group.label; details.appendChild(summary);
          group.courses.forEach(function (course) { details.appendChild(courseButton(course, course.label)); });
          details.addEventListener('toggle', function () { expandedSubjects[group.id] = details.open; });
          results.appendChild(details);
        });
      }
      searchLabel.textContent = label('Buscar un curso o una noción', 'Buscar um curso ou uma noção');
    }
    search.addEventListener('input', drawCatalog);
    wide.addEventListener('change', function () { placeCatalog(); schedule(); });
    function openDialog(surface, trigger) {
      closeDialog(menu.dialog); closeDialog(index.dialog);
      opener = trigger; trigger.setAttribute('aria-expanded', 'true');
      surface.dialog.showModal(); document.body.classList.add('s4-navigation-open');
    }
    function proxy(target, text, container) {
      if (!target) return;
      var node = button(text || target.textContent.trim(), function () {
        savePosition();
        var root = activeRoot();
        if (root && isReading(root) && (target.dataset.lessonId || target.dataset.themeTab || target.dataset.lessonTab)) {
          returnPoint = { id: rootKey(root), point: positions[rootKey(root)] || readingPoint(root) };
        }
        closeDialog(menu.dialog); closeDialog(index.dialog);
        target.click(); schedule();
      });
      ['lessonTab', 'themeTab', 'notebookMode', 'viewLink', 'lessonId'].forEach(function (key) {
        if (target.dataset[key]) node.dataset['s4Target' + key[0].toUpperCase() + key.slice(1)] = target.dataset[key];
      });
      if (target.id) node.dataset.s4TargetId = target.id;
      if (target.hasAttribute('data-public-theme-toggle')) node.dataset.s4TargetThemeToggle = '';
      if (target.classList.contains('delegate-link')) node.dataset.s4TargetManagement = '';
      if (target.getAttribute('aria-selected') === 'true' || target.getAttribute('aria-current') === 'page') node.setAttribute('aria-current', 'page');
      container.appendChild(node);
    }
    function openMenu(trigger) {
      // Opening/focusing a navigation control can itself scroll the document.
      // Keep the last reading position, not that incidental focus movement.
      menuReadingRoot = activeRoot();
      menuReadingPoint = menuReadingRoot && (positions[rootKey(menuReadingRoot)] || readingPoint(menuReadingRoot));
      menu.title.textContent = label('Cursos y menú', 'Cursos e menu');
      catalog.remove(); menu.body.replaceChildren(); menu.body.appendChild(catalog); drawCatalog();
      var root = activeRoot();
      if (root) {
        var local = document.createElement('details'); local.dataset.s4Tools = '';
        var title = document.createElement('summary'); title.textContent = label('Herramientas y fuentes', 'Ferramentas e fontes'); local.appendChild(title);
        root.querySelectorAll('[data-lesson-tab], [data-theme-tab]').forEach(function (target) {
          var mode = target.dataset.lessonTab || target.dataset.themeTab;
          // Reading already exposes Train in the primary bar. Other views still
          // need a public route to training without returning to the course first.
          if (!['rapida', 'rapido', 'ultra'].includes(mode)) proxy(target, /^(curso|course)$/.test(mode) ? label('Volver al curso', 'Voltar ao curso') : (mode === 'training' ? label('Todos los ejercicios', 'Todos os exercícios') : ''), local);
        });
        menu.body.appendChild(local);
      }
      var site = document.createElement('nav'); site.setAttribute('aria-label', label('Navegación del sitio', 'Navegação do site'));
      navigation.querySelectorAll('a').forEach(function (target) { proxy(target, (target.querySelector('strong') || target).textContent.trim(), site); });
      menu.body.appendChild(site);
      var subject = root ? root.closest('.subject-section') : Array.from(document.querySelectorAll('.subject-section')).find(visible);
      if (subject) {
        var tools = document.createElement('section');
        subject.querySelectorAll('[data-notebook-mode]').forEach(function (target) { proxy(target, '', tools); });
        menu.body.appendChild(tools);
        var sessions = document.createElement('details');
        var summary = document.createElement('summary'); summary.textContent = label('Sesiones por fecha', 'Aulas por data'); sessions.appendChild(summary);
        subject.querySelectorAll('.notebook-date[data-lesson-id]').forEach(function (target) { proxy(target, '', sessions); });
        menu.body.appendChild(sessions);
      }
      var preferences = document.createElement('section');
      document.querySelectorAll('.class-header-actions > *, .header-back').forEach(function (target) {
        if (!target.hidden) proxy(target, target.getAttribute('aria-label') || '', preferences);
      });
      // Move the real language picker so its listeners and current selection remain intact.
      if (language) preferences.appendChild(language);
      menu.body.appendChild(preferences);
      openDialog(menu, trigger);
    }
    function openIndex(trigger) {
      var root = activeRoot(); if (!root) return;
      index.title.textContent = label('Índice del curso', 'Índice do curso'); index.body.replaceChildren();
      var panel = activePanel(root);
      var headings = panel ? Array.from(panel.querySelectorAll(panel.querySelector('[data-reader-section]') ? '[data-reader-section] h4, [data-reader-section] h3' : '.course-chapter-section h4, .course-chapter-section h3, .content-theme-chapter > header h4')) : [];
      headings.forEach(function (heading) {
        index.body.appendChild(button(heading.textContent.trim(), function () {
          var target = heading.closest('.course-chapter-section, .content-theme-chapter') || heading;
          opener = target; closeDialog(index.dialog);
          window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - 100, behavior: 'instant' }); target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
        }));
      });
      if (!headings.length) index.body.appendChild(button(label('Inicio del curso', 'Início do curso'), function () { closeDialog(index.dialog); root.scrollIntoView({ block: 'start' }); }));
      openDialog(index, trigger);
    }
    var menuButton = button(label('Cursos', 'Cursos'), function () { openMenu(menuButton); });
    menuButton.dataset.s4MenuToggle = ''; menuButton.setAttribute('aria-controls', menu.dialog.id); menuButton.setAttribute('aria-expanded', 'false');
    header.appendChild(menuButton);
    var bar = document.createElement('nav'); bar.className = 's4-reading-actions'; bar.setAttribute('aria-label', label('Acciones del curso', 'Ações do curso'));
    var indexButton = button(label('Índice', 'Índice'), function () { openIndex(indexButton); });
    indexButton.dataset.s4IndexToggle = ''; indexButton.setAttribute('aria-controls', index.dialog.id); indexButton.setAttribute('aria-expanded', 'false');
    var train = button(label('Entrenar', 'Treinar'), function () {
      var root = activeRoot(); lastReadingY = window.scrollY;
      savePosition();
      if (root && root.dataset.courseThemeWorkspace && reader()) {
        var point = readingPoint(root);
        var section = Array.from(root.querySelectorAll('[data-reader-section]')).find(function (node) { return node.dataset.readerSection === point.anchor; });
        if (reader().practice(root.dataset.courseThemeWorkspace, section && section.dataset.readerLesson)) {
          var practice = document.querySelector('.practice-dialog[open]');
          if (practice) practice.addEventListener('close', function () { restorePosition(root, point, true); }, { once: true });
          return;
        }
      }
      var target = courseButton(root, 'training'); if (target) target.click(); schedule();
    }); train.dataset.s4Train = '';
    var back = button(label('Volver al curso', 'Voltar ao curso'), function () {
      if (returnPoint && reader()) {
        var saved = returnPoint; returnPoint = null;
        if (reader().open(saved.id)) { lastRoot = activeRoot(); restorePosition(lastRoot, saved.point, true); schedule(); return; }
      }
      var target = courseButton(activeRoot(), 'curso'); if (target) target.click();
      window.requestAnimationFrame(function () { window.scrollTo(0, lastReadingY); }); schedule();
    }); back.dataset.s4ReturnCourse = '';
    bar.append(indexButton, train, back); document.body.appendChild(bar);
    function sync() {
      scheduled = false;
      // Preserve historical nodes for old anchors, but never expose retired formats.
      document.querySelectorAll('[data-lesson-tab="rapida"], [data-lesson-tab="rapido"], [data-lesson-tab="ultra"]').forEach(function (node) { if (!node.hidden) node.hidden = true; });
      var root = activeRoot();
      var panel = activePanel(root);
      if (panel && /^(rapida|rapido|ultra)$/.test(panel.dataset.lessonTabPanel || '')) {
        var full = courseButton(root, 'curso'); if (full) full.click();
      }
      var reading = isReading(root);
      if (root !== lastRoot) {
        lastRoot = root;
        if (root && reading) restorePosition(root, positions[rootKey(root)] || { y: 0 }, false);
      }
      bar.hidden = !root;
      indexButton.hidden = !reading; train.hidden = !reading; back.hidden = reading && !returnPoint;
      document.body.classList.toggle('s4-reading-active', Boolean(root));
      document.body.classList.toggle('s4-theme-open', Boolean(root && root.dataset.courseThemeWorkspace));
      var bottom = document.querySelector('.mobile-bottom-nav');
      if (bottom && bottom.hidden !== Boolean(root)) bottom.hidden = Boolean(root);
      menuButton.textContent = label('Cursos', 'Cursos'); train.textContent = label('Practicar', 'Praticar'); back.textContent = returnPoint && reading ? label('Volver a mi lectura', 'Voltar à minha leitura') : label('Volver al curso', 'Voltar ao curso');
      placeCatalog();
      var signature = rootKey(root) + ':' + document.body.dataset.activeView + ':' + document.documentElement.lang;
      if (signature !== catalogSignature) { catalogSignature = signature; drawCatalog(); }
    }
    function schedule() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(sync); } }
    document.addEventListener('click', schedule);
    document.addEventListener('click', function (event) {
      var source = event.target.closest('[data-theme-source], [data-theme-session-open]');
      var root = activeRoot();
      if (source && root) { savePosition(); returnPoint = { id: rootKey(root), point: positions[rootKey(root)] || readingPoint(root) }; }
      if (event.target.closest('[data-course-theme-open]')) { savePosition(); returnPoint = null; }
    }, true);
    var scrollTimer;
    window.addEventListener('scroll', function () { clearTimeout(scrollTimer); scrollTimer = setTimeout(savePosition, 180); }, { passive: true });
    window.addEventListener('pagehide', savePosition);
    window.addEventListener('hashchange', function () { closeDialog(menu.dialog); closeDialog(index.dialog); schedule(); });
    window.addEventListener('popstate', schedule);
    document.addEventListener('mednykuto:content-updated', function () { catalogSignature = ''; schedule(); });
    var observer = new MutationObserver(function (records) {
      if (records.some(function (record) { return !record.target.closest || !record.target.closest('.s4-navigation-dialog, .s4-reading-actions'); })) schedule();
    });
    observer.observe(document.querySelector('.class-app'), { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-notebook-active-mode'] });
    document.documentElement.classList.add('s4-simple-navigation-ready');
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
