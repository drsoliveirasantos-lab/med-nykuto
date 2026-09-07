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
      var body = document.createElement('div'); body.className = 's4-navigation-dialog-body'; dialog.appendChild(body);
      dialog.addEventListener('click', function (event) {
        var rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
      });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('s4-navigation-open');
        document.querySelectorAll('[data-s4-menu-toggle], [data-s4-index-toggle]').forEach(function (node) { node.setAttribute('aria-expanded', 'false'); });
        if (opener && opener.isConnected && visible(opener)) opener.focus({ preventScroll: true });
      });
      document.body.appendChild(dialog);
      return { dialog: dialog, title: title, body: body };
    }
    var menu = makeDialog('s4SiteMenu', 's4-site-drawer');
    var index = makeDialog('s4CourseIndex', 's4-index-sheet');
    function openDialog(surface, trigger) {
      closeDialog(menu.dialog); closeDialog(index.dialog);
      opener = trigger; trigger.setAttribute('aria-expanded', 'true');
      surface.dialog.showModal(); document.body.classList.add('s4-navigation-open');
    }
    function proxy(target, text, container) {
      if (!target) return;
      var node = button(text || target.textContent.trim(), function () {
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
      menu.title.textContent = label('Menú', 'Menu'); menu.body.replaceChildren();
      var root = activeRoot();
      if (root) {
        var local = document.createElement('section');
        var title = document.createElement('h3'); title.textContent = label('Este curso', 'Este curso'); local.appendChild(title);
        root.querySelectorAll('[data-lesson-tab], [data-theme-tab]').forEach(function (target) {
          var mode = target.dataset.lessonTab || target.dataset.themeTab;
          if (!['rapida', 'rapido', 'ultra', 'training'].includes(mode)) proxy(target, /^(curso|course)$/.test(mode) ? label('Volver al curso', 'Voltar ao curso') : '', local);
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
      var headings = panel ? Array.from(panel.querySelectorAll('.course-chapter-section h4, .course-chapter-section h3, .content-theme-chapter > header h4')) : [];
      headings.forEach(function (heading) {
        index.body.appendChild(button(heading.textContent.trim(), function () {
          var target = heading.closest('.course-chapter-section, .content-theme-chapter') || heading;
          opener = target; closeDialog(index.dialog);
          target.scrollIntoView({ block: 'start' }); target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
        }));
      });
      if (!headings.length) index.body.appendChild(button(label('Inicio del curso', 'Início do curso'), function () { closeDialog(index.dialog); root.scrollIntoView({ block: 'start' }); }));
      openDialog(index, trigger);
    }
    var menuButton = button(label('Menú', 'Menu'), function () { openMenu(menuButton); });
    menuButton.dataset.s4MenuToggle = ''; menuButton.setAttribute('aria-controls', menu.dialog.id); menuButton.setAttribute('aria-expanded', 'false');
    header.appendChild(menuButton);
    var bar = document.createElement('nav'); bar.className = 's4-reading-actions'; bar.setAttribute('aria-label', label('Acciones del curso', 'Ações do curso'));
    var indexButton = button(label('Índice', 'Índice'), function () { openIndex(indexButton); });
    indexButton.dataset.s4IndexToggle = ''; indexButton.setAttribute('aria-controls', index.dialog.id); indexButton.setAttribute('aria-expanded', 'false');
    var train = button(label('Entrenar', 'Treinar'), function () {
      var root = activeRoot(); lastReadingY = window.scrollY;
      var target = courseButton(root, 'training'); if (target) target.click(); schedule();
    }); train.dataset.s4Train = '';
    var back = button(label('Volver al curso', 'Voltar ao curso'), function () {
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
      if (root !== lastRoot) { lastReadingY = 0; lastRoot = root; }
      bar.hidden = !root;
      indexButton.hidden = !reading; train.hidden = !reading; back.hidden = reading;
      document.body.classList.toggle('s4-reading-active', Boolean(root));
      var bottom = document.querySelector('.mobile-bottom-nav');
      if (bottom && bottom.hidden !== Boolean(root)) bottom.hidden = Boolean(root);
      menuButton.textContent = label('Menú', 'Menu'); train.textContent = label('Entrenar', 'Treinar'); back.textContent = label('Volver al curso', 'Voltar ao curso');
    }
    function schedule() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(sync); } }
    document.addEventListener('click', schedule);
    window.addEventListener('hashchange', function () { closeDialog(menu.dialog); closeDialog(index.dialog); schedule(); });
    window.addEventListener('popstate', schedule);
    document.addEventListener('mednykuto:content-updated', schedule);
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
