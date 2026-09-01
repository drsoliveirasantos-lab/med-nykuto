(function () {
  'use strict';

  var VERSION = 'v178';
  var learningModel = window.MedNykutoS4LearningModel || {};
  var academicModel = window.MedNykutoAcademicModel || {};
  var masteryStorageKey = 'med-nykuto-s4-mastery-v178';
  var reviewStorageKey = 'med-nykuto-s4-review-v178';
  var themeStorageKeyPrefix = 'mednykuto:s4:theme:';
  var observerQueued = false;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function svgElement(tag, attributes, text) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes || {}).forEach(function (name) {
      node.setAttribute(name, String(attributes[name]));
    });
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function currentLanguage() {
    var i18n = window.MedNykutoClassI18n;
    if (i18n && typeof i18n.getLang === 'function') return i18n.getLang() === 'br' ? 'pt' : 'es';
    return /^pt(?:-|$)/i.test(document.documentElement.lang || '') ? 'pt' : 'es';
  }

  function text(es, pt) {
    return currentLanguage() === 'pt' ? pt : es;
  }

  function localized(value, fallbackEs, fallbackPt) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      var key = currentLanguage();
      var chosen = value[key] || value[key === 'pt' ? 'br' : 'es'] || value.es || value.pt || value.br;
      if (typeof chosen === 'string' && chosen.trim()) return chosen.trim();
    }
    return text(fallbackEs || '', fallbackPt || fallbackEs || '');
  }

  function localizedList(values) {
    var list = values;
    if (!Array.isArray(list) && list && typeof list === 'object') {
      var key = currentLanguage();
      list = list[key] || list[key === 'pt' ? 'br' : 'es'] || list.es || list.pt || list.br;
    }
    return (Array.isArray(list) ? list : []).map(function (value) {
      return localized(value);
    }).filter(Boolean);
  }

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function localizedSource(value) {
    var source = clean(value);
    if (currentLanguage() !== 'pt' || !source) return source;
    var i18n = window.MedNykutoClassI18n;
    return i18n && i18n.exact && typeof i18n.exact[source] === 'string'
      ? i18n.exact[source]
      : source;
  }

  function biochemicalLocalized(value) {
    var result = localized(value);
    if (currentLanguage() !== 'pt' || !result) return result;
    [
      [/\bGlucosa\b/g, 'Glicose'],
      [/\bFructosa\b/g, 'Frutose'],
      [/\brama\b/gi, 'ramo'],
      [/\bderecha\b/gi, 'direita'],
      [/\bizquierda\b/gi, 'esquerda'],
      [/\barriba\b/gi, 'acima'],
      [/\babajo\b/gi, 'abaixo'],
      [/\ben CH2OH\b/gi, 'no CH2OH'],
      [/\baldehído\b/gi, 'aldeído'],
      [/\bcadena de aldosa\b/gi, 'cadeia de aldose'],
      [/\bcadena\b/gi, 'cadeia'],
      [/\balcohol\b/gi, 'álcool'],
      [/\bmetilo\b/gi, 'metila'],
      [/\bconfiguración\b/gi, 'configuração'],
      [/\bMapa general\b/g, 'Mapa geral'],
      [/\bFase preparatoria\b/g, 'Fase preparatória'],
      [/\bFase de beneficio\b/g, 'Fase de benefício'],
      [/\bpasos\b/gi, 'etapas'],
      [/\bBalance final\b/g, 'Balanço final'],
      [/\bRegulación\b/g, 'Regulação'],
      [/\bresumen\b/gi, 'resumo']
    ].forEach(function (replacement) {
      result = result.replace(replacement[0], replacement[1]);
    });
    return result;
  }

  function truncate(value, maximum) {
    var result = clean(value);
    if (!maximum || result.length <= maximum) return result;
    return result.slice(0, maximum - 1).replace(/[\s,;:.!?-]+$/, '') + '…';
  }

  function firstSentence(value) {
    var result = clean(value);
    if (!result) return '';
    var match = result.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0].trim() : result;
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      var normalized = clean(value).toLocaleLowerCase();
      if (!normalized || seen[normalized]) return false;
      seen[normalized] = true;
      return true;
    });
  }

  function safeToken(value) {
    var result = clean(value).toLocaleLowerCase();
    if (result.normalize) result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return result.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'item';
  }

  function readStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) {}
  }

  function appendBadge(container, label, modifier) {
    var badge = element('span', 's4-source-badge' + (modifier ? ' ' + modifier : ''), label);
    badge.dataset.s4SourceStatus = label;
    container.appendChild(badge);
    return badge;
  }

  function sourceLabel(name) {
    var labels = learningModel.sourceLabels;
    var fallbacks = {
      professor: 'PROFESORA · CONFIRMADO',
      reformulation: 'REFORMULACIÓN NYKUTO',
      clinical: 'AMPLIACIÓN CLÍNICA',
      precision: 'PRECISIÓN MÉDICA',
      pending: 'POR CONFIRMAR'
    };
    if (labels && !Array.isArray(labels)) {
      var aliases = {
        professor: ['professor', 'teacher', 'confirmed'],
        reformulation: ['reformulation', 'nykuto'],
        clinical: ['clinical', 'clinicalExpansion'],
        precision: ['precision', 'medicalPrecision'],
        pending: ['pending', 'toConfirm']
      };
      var candidates = aliases[name] || [name];
      for (var index = 0; index < candidates.length; index += 1) {
        var candidate = labels[candidates[index]];
        if (typeof candidate === 'string') return candidate;
        if (candidate && typeof candidate.label === 'string') return candidate.label;
      }
    }
    if (Array.isArray(labels)) {
      var expected = fallbacks[name];
      var found = labels.find(function (label) {
        return (typeof label === 'string' ? label : label && label.label) === expected;
      });
      if (found) return typeof found === 'string' ? found : found.label;
    }
    return fallbacks[name];
  }

  function lessonContext(panel) {
    var lessonId = panel.getAttribute('data-lesson-panel') || panel.id;
    var context = { id: lessonId, subjectId: '', lesson: null, subject: null };
    var subjects = academicModel.subjects || {};
    Object.keys(subjects).some(function (subjectId) {
      var subject = subjects[subjectId] || {};
      return (subject.chapters || []).some(function (chapter) {
        var lesson = (chapter.lessons || []).find(function (candidate) { return candidate.id === lessonId; });
        if (!lesson) return false;
        context.subjectId = subjectId;
        context.lesson = lesson;
        context.subject = subject;
        return true;
      });
    });
    if (!context.subjectId) {
      if (typeof learningModel.getSubjectForLesson === 'function') {
        try { context.subjectId = learningModel.getSubjectForLesson(lessonId) || ''; }
        catch (error) {}
      }
      if (!context.subjectId && learningModel.lessonSubjectById) {
        context.subjectId = learningModel.lessonSubjectById[lessonId] || '';
      }
      if (!context.subjectId) {
        var subjectNode = panel.closest('.subject-section');
        context.subjectId = subjectNode ? subjectNode.id : '';
      }
    }
    return context;
  }

  function courseRoot(coursePanel) {
    if (!coursePanel) return null;
    return coursePanel.querySelector(':scope > .notebook-course-flow, :scope > article.notebook-course-flow') || coursePanel;
  }

  function ensureManagedSections(root, lessonId) {
    if (!root) return [];
    var existing = Array.prototype.slice.call(root.querySelectorAll('.course-chapter-section'));
    if (existing.length) return existing;
    var markdown = root.querySelector('.notebook-managed-markdown[data-managed-markdown], .notebook-managed-markdown');
    if (!markdown) return existing;
    var container = markdown.querySelector(':scope > .managed-markdown') || markdown;
    if (container.dataset.s4Sectionized === 'true') {
      return Array.prototype.slice.call(container.querySelectorAll(':scope > .course-chapter-section'));
    }
    var children = Array.prototype.slice.call(container.children);
    if (!children.length) return existing;
    var fragment = document.createDocumentFragment();
    var section = null;
    var sectionIndex = 0;
    function startSection() {
      sectionIndex += 1;
      section = element('section', 'course-chapter-section');
      section.id = lessonId + '-section-' + sectionIndex;
      fragment.appendChild(section);
    }
    children.forEach(function (child) {
      if (/^H[1-5]$/.test(child.tagName) || !section) startSection();
      section.appendChild(child);
    });
    container.replaceChildren(fragment);
    container.dataset.s4Sectionized = 'true';
    return Array.prototype.slice.call(container.querySelectorAll(':scope > .course-chapter-section'));
  }

  function directOriginalChildren(section) {
    return Array.prototype.slice.call(section.children).filter(function (child) {
      return !child.matches('[data-s4-notion-guide], [data-s4-specialization], [data-s4-glycolysis-lab]');
    });
  }

  function outlineFromSections(sections) {
    return sections.map(function (section, index) {
      var children = directOriginalChildren(section);
      var step = children.find(function (child) { return child.classList.contains('course-chapter-step'); });
      var heading = children.find(function (child) { return /^H[1-5]$/.test(child.tagName); });
      var content = children.filter(function (child) {
        return child !== step && child !== heading && !child.classList.contains('course-inline-figure');
      }).map(function (child) { return localizedSource(child.textContent); }).filter(Boolean);
      var title = localizedSource(heading ? heading.textContent : (step ? step.textContent : ''));
      var label = localizedSource(step ? step.textContent.replace(/^\s*\d+\s*[·.–—-]\s*/, '') : title);
      if (!label) label = text('Idea ', 'Ideia ') + (index + 1);
      if (!title) title = label;
      var explanation = content[0] || title;
      var consequence = content[1] || explanation;
      return {
        index: index,
        section: section,
        id: section.id,
        label: label,
        title: title,
        explanation: explanation,
        consequence: consequence,
        full: unique(content).join(' ')
      };
    });
  }

  function ensureStableTargets(outline, lessonId) {
    var used = {};
    outline.forEach(function (item, index) {
      var preferred = item.section.id || lessonId + '-notion-' + (index + 1);
      var id = preferred;
      var suffix = 2;
      while (used[id] || (document.getElementById(id) && document.getElementById(id) !== item.section)) {
        id = preferred + '-' + suffix;
        suffix += 1;
      }
      used[id] = true;
      item.section.id = id;
      item.section.dataset.s4Notion = '';
      item.section.dataset.s4NotionIndex = String(index + 1);
      item.section.tabIndex = -1;
      item.id = id;
    });
  }

  function focusBlock(panel, targetId) {
    var courseTab = panel.querySelector('[data-lesson-tab="curso"]');
    if (courseTab) courseTab.click();
    window.requestAnimationFrame(function () {
      var target = document.getElementById(targetId);
      if (!target) return;
      try { target.focus({ preventScroll: true }); }
      catch (error) { target.focus(); }
      target.scrollIntoView({ behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.classList.add('is-s4-targeted');
      window.setTimeout(function () { target.classList.remove('is-s4-targeted'); }, 1400);
    });
  }

  function lessonTitle(panel, root, context) {
    var heading = root && root.querySelector(':scope > header h3, :scope > header h2');
    return localizedSource((context.lesson && context.lesson.title) || panel.dataset.lessonTitle || (heading && heading.textContent) || context.id);
  }

  function provenanceFor(context) {
    return sourceLabel('reformulation');
  }

  function appendLearningProvenance(container, context, primaryStatus) {
    appendBadge(container, primaryStatus || provenanceFor(context), 'is-method');
    var dateStatus = learningModel.dateStatusByLesson && learningModel.dateStatusByLesson[context.id];
    if (dateStatus === sourceLabel('pending')) appendBadge(container, dateStatus, 'is-pending');
  }

  function modeDefinitions() {
    var defaults = [
      { id: 'curso', es: 'Comprender', pt: 'Compreender', intent: 'understand' },
      { id: 'rapida', es: 'Repasar', pt: 'Revisar', intent: 'review' },
      { id: 'ultra', es: 'Recordar', pt: 'Recordar', intent: 'remember' },
      { id: 'training', es: 'Entrenar', pt: 'Treinar', intent: 'train' }
    ];
    var configured = Array.isArray(learningModel.modes) ? learningModel.modes : [];
    return defaults.map(function (fallback) {
      var found = configured.find(function (mode) { return mode.id === fallback.id || mode.key === fallback.intent; });
      return {
        id: fallback.id,
        intent: fallback.intent,
        label: localized(found && found.label, fallback.es, fallback.pt)
      };
    }).concat([
      { id: 'material', intent: 'sources', label: text('Materiales y fuentes', 'Materiais e fontes') },
      { id: 'ia', intent: 'tutor', label: 'Tutor IA' }
    ]);
  }

  function cloneWithUniqueIds(source, prefix) {
    var clone = source.cloneNode(true);
    var idMap = {};
    clone.querySelectorAll('[id]').forEach(function (node, index) {
      var previous = node.id;
      var next = prefix + '-' + (index + 1);
      idMap[previous] = next;
      node.id = next;
    });
    clone.querySelectorAll('[for], [aria-controls], [aria-labelledby], [aria-describedby]').forEach(function (node) {
      ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby'].forEach(function (attribute) {
        var value = node.getAttribute(attribute);
        if (!value) return;
        node.setAttribute(attribute, value.split(/\s+/).map(function (token) { return idMap[token] || token; }).join(' '));
      });
    });
    return clone;
  }

  function ensureUtilityTabs(panel, context) {
    var nav = panel.querySelector('[data-lesson-tabs]');
    if (!nav || panel.querySelector('[data-lesson-tab="material"]')) return;
    var materialButton = element('button', '', text('Materiales y fuentes', 'Materiais e fontes'));
    materialButton.type = 'button';
    materialButton.dataset.lessonTab = 'material';
    materialButton.setAttribute('role', 'tab');
    materialButton.setAttribute('aria-selected', 'false');
    var iaButton = nav.querySelector('[data-lesson-tab="ia"]');
    if (iaButton) nav.insertBefore(materialButton, iaButton);
    else nav.appendChild(materialButton);

    var materialPanel = element('section', 'lesson-tab-panel');
    materialPanel.dataset.lessonTabPanel = 'material';
    materialPanel.hidden = true;
    var staticSource = Array.prototype.find.call(document.querySelectorAll('[data-managed-static-source-for]'), function (candidate) {
      return candidate.dataset.managedStaticSourceFor === context.id;
    });
    var sourcePanel = staticSource && staticSource.querySelector('[data-lesson-tab-panel="material"]');
    if (sourcePanel) {
      Array.prototype.slice.call(sourcePanel.children).forEach(function (child, index) {
        materialPanel.appendChild(cloneWithUniqueIds(child, context.id + '-managed-material-' + (index + 1)));
      });
    } else {
      materialPanel.appendChild(element('p', 'notebook-empty', text('Las fuentes permanecen asociadas a esta clase publicada.', 'As fontes permanecem associadas a esta aula publicada.')));
    }
    var iaPanel = panel.querySelector('[data-lesson-tab-panel="ia"]');
    if (iaPanel) panel.insertBefore(materialPanel, iaPanel);
    else panel.appendChild(materialPanel);
  }

  function wireLiveTabs(panel) {
    if (panel.dataset.s4LiveTabs === 'true') return;
    var nav = panel.querySelector('[data-lesson-tabs]');
    if (!nav) return;
    nav.addEventListener('keydown', function (event) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) < 0) return;
      var buttons = Array.prototype.slice.call(nav.querySelectorAll('[data-lesson-tab]'));
      var current = event.target && event.target.closest ? event.target.closest('[data-lesson-tab]') : null;
      var index = buttons.indexOf(current);
      if (index < 0 || !buttons.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    }, true);
    nav.querySelectorAll('[data-lesson-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        var selectedId = button.dataset.lessonTab;
        nav.querySelectorAll('[data-lesson-tab]').forEach(function (candidate) {
          var active = candidate.dataset.lessonTab === selectedId;
          candidate.setAttribute('aria-selected', active ? 'true' : 'false');
          candidate.tabIndex = active ? 0 : -1;
        });
        panel.querySelectorAll(':scope > [data-lesson-tab-panel]').forEach(function (tabPanel) {
          tabPanel.hidden = tabPanel.dataset.lessonTabPanel !== selectedId;
        });
      });
    });
    panel.dataset.s4LiveTabs = 'true';
  }

  function relabelTabs(panel) {
    var nav = panel.querySelector('[data-lesson-tabs]');
    if (!nav) return;
    nav.setAttribute('aria-label', text('Intenciones de aprendizaje de la clase', 'Intenções de aprendizagem da aula'));
    modeDefinitions().forEach(function (definition, index) {
      var button = nav.querySelector('[data-lesson-tab="' + definition.id + '"]');
      if (!button) return;
      button.textContent = definition.label;
      button.dataset.s4Intent = definition.intent;
      button.dataset.s4Priority = index < 4 ? 'primary' : 'utility';
      button.id = panel.id + '-tab-' + definition.id;
      button.setAttribute('aria-controls', panel.id + '-panel-' + definition.id);
      var tabPanel = panel.querySelector('[data-lesson-tab-panel="' + definition.id + '"]');
      if (tabPanel) {
        tabPanel.id = panel.id + '-panel-' + definition.id;
        tabPanel.setAttribute('role', 'tabpanel');
        tabPanel.setAttribute('aria-labelledby', button.id);
      }
    });
    wireLiveTabs(panel);
  }

  function prerequisiteItems(subjectId) {
    var configured = learningModel.subjects && learningModel.subjects[subjectId];
    var items = configured && configured.prerequisites;
    if (Array.isArray(items) && items.length) {
      return items.map(function (item) { return localized(item); }).filter(Boolean).slice(0, 4);
    }
    var fallbacks = {
      nutricion: [
        text('Reconocer los términos que la propia clase define.', 'Reconhecer os termos que a própria aula define.'),
        text('Separar dato observado, interpretación y aplicación.', 'Separar dado observado, interpretação e aplicação.')
      ],
      fisiologia: [
        text('Distinguir variable, mecanismo y respuesta en el texto.', 'Distinguir variável, mecanismo e resposta no texto.'),
        text('Seguir la dirección de cada relación antes de memorizarla.', 'Seguir a direção de cada relação antes de memorizá-la.')
      ],
      bioquimica: [
        text('Seguir sustrato, transformación y producto en el orden de la clase.', 'Seguir substrato, transformação e produto na ordem da aula.'),
        text('Separar balance, regulación y consecuencia.', 'Separar balanço, regulação e consequência.')
      ],
      epidemiologia: [
        text('Distinguir criterio, nivel y conducta descritos en la clase.', 'Distinguir critério, nível e conduta descritos na aula.'),
        text('Leer cada decisión en el orden indicado.', 'Ler cada decisão na ordem indicada.')
      ],
      'microbiologia-teorica': [
        text('Relacionar cada descripción con el bloque del que procede.', 'Relacionar cada descrição com o bloco de origem.'),
        text('Separar observación, orientación y confirmación.', 'Separar observação, orientação e confirmação.')
      ],
      'microbiologia-practica': [
        text('Respetar la secuencia y la bioseguridad descritas.', 'Respeitar a sequência e a biossegurança descritas.'),
        text('No identificar a partir de un dato aislado.', 'Não identificar a partir de um dado isolado.')
      ]
    };
    return fallbacks[subjectId] || [
      text('Reconocer el vocabulario usado por la clase.', 'Reconhecer o vocabulário usado pela aula.'),
      text('Seguir el orden de sus ideas principales.', 'Seguir a ordem de suas ideias principais.')
    ];
  }

  function learningObjectives(title, outline, subjectId) {
    var configured = learningModel.subjects && learningModel.subjects[subjectId];
    if (configured && Array.isArray(configured.objectives) && configured.objectives.length >= 3) {
      return configured.objectives.map(function (objective) {
        return localized(objective).replace(/\{title\}/g, title);
      }).filter(Boolean).slice(0, 5);
    }
    var first = outline[0];
    var last = outline[outline.length - 1] || first;
    var middle = outline[Math.floor((outline.length - 1) / 2)] || first;
    return unique([
      text('Identificar la idea central de «' + title + '».', 'Identificar a ideia central de «' + title + '».'),
      first ? text('Explicar «' + first.label + '» con las palabras de la clase.', 'Explicar «' + first.label + '» com as palavras da aula.') : '',
      middle && middle !== first ? text('Relacionar «' + first.label + '» con «' + middle.label + '».', 'Relacionar «' + first.label + '» com «' + middle.label + '».') : '',
      first && last ? text('Reconstruir el recorrido desde «' + first.label + '» hasta «' + last.label + '».', 'Reconstruir o percurso de «' + first.label + '» até «' + last.label + '».') : '',
      text('Comprobar el recuerdo sin mirar y volver al bloque exacto cuando haya duda.', 'Verificar a lembrança sem olhar e voltar ao bloco exato quando houver dúvida.')
    ]).slice(0, 5);
  }

  function updateProgress(panel) {
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-s4-recall-card]'));
    var mastered = cards.filter(function (card) { return card.dataset.s4MasteryState === 'dominado'; }).length;
    var progress = panel.querySelector('[data-s4-progress-value]');
    if (progress) progress.textContent = mastered + '/' + cards.length;
    var meter = panel.querySelector('[data-s4-progress-meter]');
    if (meter) {
      meter.max = Math.max(cards.length, 1);
      meter.value = mastered;
      meter.setAttribute('aria-valuetext', mastered + ' / ' + cards.length);
    }
  }

  function applyTheme(panel, theme) {
    var allowed = ['soft', 'sepia', 'focus'];
    var selected = allowed.indexOf(theme) >= 0 ? theme : 'soft';
    panel.dataset.s4Theme = selected;
    panel.setAttribute('data-s4-reading-theme-active', selected);
    var select = panel.querySelector('[data-s4-reading-theme]');
    if (select) select.value = selected;
  }

  function buildThemeControl(panel, lessonId) {
    var wrap = element('label', 's4-theme-control');
    wrap.appendChild(element('span', '', text('Tema de lectura', 'Tema de leitura')));
    var select = element('select');
    select.dataset.s4ReadingTheme = '';
    select.setAttribute('aria-label', text('Tema de lectura de esta clase', 'Tema de leitura desta aula'));
    [
      ['soft', text('Claro suave', 'Claro suave')],
      ['sepia', text('Sepia lectura', 'Sépia leitura')],
      ['focus', text('Oscuro concentración', 'Escuro concentração')]
    ].forEach(function (definition) {
      var option = element('option', '', definition[1]);
      option.value = definition[0];
      select.appendChild(option);
    });
    select.addEventListener('change', function () {
      try { localStorage.setItem(themeStorageKeyPrefix + lessonId, select.value); }
      catch (error) {}
      applyTheme(panel, select.value);
    });
    wrap.appendChild(select);
    var saved = '';
    try { saved = localStorage.getItem(themeStorageKeyPrefix + lessonId) || ''; }
    catch (error) {}
    var activeTheme = ['soft', 'sepia', 'focus'].indexOf(saved) >= 0 ? saved : 'soft';
    select.value = activeTheme;
    applyTheme(panel, activeTheme);
    return wrap;
  }

  function buildHero(panel, root, context, outline) {
    var title = lessonTitle(panel, root, context);
    var first = outline[0];
    var last = outline[outline.length - 1] || first;
    var hero = element('section', 's4-course-hero');
    hero.dataset.s4CourseHero = '';
    hero.setAttribute('aria-labelledby', context.id + '-s4-question');

    var top = element('div', 's4-hero-topline');
    var sources = element('div', 's4-source-row');
    appendLearningProvenance(sources, context);
    top.appendChild(sources);
    top.appendChild(buildThemeControl(panel, context.id));
    hero.appendChild(top);

    hero.appendChild(element('span', 's4-eyebrow', text('PREGUNTA CENTRAL', 'PERGUNTA CENTRAL')));
    var subjectMeta = learningModel.subjects && learningModel.subjects[context.subjectId];
    var configuredQuestion = context.id === 'bioquimica-2026-08-14' && learningModel.glycolysis && learningModel.glycolysis.centralQuestion
      ? localized(learningModel.glycolysis.centralQuestion)
      : localized(subjectMeta && subjectMeta.centralQuestionTemplate);
    var question = configuredQuestion
      ? configuredQuestion.replace(/\{title\}/g, title)
      : (first && last
        ? text('¿Cómo conecta «' + first.label + '» con «' + last.label + '» para comprender «' + title + '»?', 'Como «' + first.label + '» se conecta a «' + last.label + '» para compreender «' + title + '»?')
        : text('¿Cómo explica esta clase «' + title + '»?', 'Como esta aula explica «' + title + '»?'));
    var heading = element('h3', '', question);
    heading.id = context.id + '-s4-question';
    heading.dataset.s4CourseQuestion = '';
    hero.appendChild(heading);

    var grid = element('div', 's4-hero-grid');
    var objectives = element('section', 's4-hero-objectives');
    objectives.appendChild(element('h4', '', text('Al terminar, podrás', 'Ao terminar, você poderá')));
    var objectiveList = element('ul');
    learningObjectives(title, outline, context.subjectId).forEach(function (objective) {
      var item = element('li', '', objective);
      item.dataset.s4Objective = '';
      objectiveList.appendChild(item);
    });
    objectives.appendChild(objectiveList);
    grid.appendChild(objectives);

    var prerequisites = element('section', 's4-hero-prerequisites');
    prerequisites.appendChild(element('h4', '', text('Antes de empezar', 'Antes de começar')));
    var prerequisiteList = element('ul');
    prerequisiteItems(context.subjectId).forEach(function (item) {
      var prerequisite = element('li', '', item);
      prerequisite.dataset.s4Prerequisite = '';
      prerequisiteList.appendChild(prerequisite);
    });
    prerequisites.appendChild(prerequisiteList);
    grid.appendChild(prerequisites);
    hero.appendChild(grid);

    var map = element('nav', 's4-hero-map');
    map.dataset.s4CourseMap = '';
    map.setAttribute('aria-label', text('Mapa del curso en menos de un minuto', 'Mapa da aula em menos de um minuto'));
    map.appendChild(element('span', '', text('MAPA · MENOS DE 60 S', 'MAPA · MENOS DE 60 S')));
    var route = element('ol');
    outline.forEach(function (item, index) {
      var row = element('li');
      var button = element('button', '', item.label);
      button.type = 'button';
      button.dataset.s4Target = item.id;
      button.setAttribute('aria-label', text('Ir a la noción ', 'Ir para a noção ') + (index + 1) + ': ' + item.label);
      button.addEventListener('click', function () { focusBlock(panel, item.id); });
      row.appendChild(button);
      route.appendChild(row);
    });
    map.appendChild(route);

    var progress = element('div', 's4-hero-progress');
    progress.appendChild(element('span', '', text('Progreso por nociones', 'Progresso por noções')));
    var progressValue = element('strong', '', '0/0');
    progressValue.dataset.s4ProgressValue = '';
    progress.appendChild(progressValue);
    var meter = element('progress');
    meter.dataset.s4ProgressMeter = '';
    meter.setAttribute('aria-label', text('Nociones dominadas', 'Noções dominadas'));
    meter.value = 0;
    meter.max = 1;
    progress.appendChild(meter);
    map.appendChild(progress);
    hero.appendChild(map);
    return hero;
  }

  function insertLearningLayer(root, hero, specialization, glycolysis) {
    var header = root.querySelector(':scope > header');
    var anchor = header || null;
    [hero, specialization, glycolysis].filter(Boolean).forEach(function (node) {
      if (anchor) anchor.insertAdjacentElement('afterend', node);
      else root.prepend(node);
      anchor = node;
    });
  }

  function buildNotionGuide(item, context) {
    var guide = element('aside', 's4-notion-guide');
    guide.dataset.s4NotionGuide = '';
    guide.setAttribute('aria-label', text('Guía activa de esta noción', 'Guia ativo desta noção'));

    var head = element('header', 's4-notion-head');
    head.appendChild(element('span', '', text('PREGUNTA DEL BLOQUE', 'PERGUNTA DO BLOCO')));
    head.appendChild(element('h5', '', text('¿Qué debes explicar sobre «' + item.title + '»?', 'O que você deve explicar sobre «' + item.title + '»?')));
    guide.appendChild(head);

    var flash = element('div', 's4-notion-flash');
    flash.appendChild(element('span', '', text('RESPUESTA FLASH', 'RESPOSTA FLASH')));
    flash.appendChild(element('p', '', firstSentence(item.explanation) || item.title));
    guide.appendChild(flash);

    var chainValues = unique([item.label, item.title, firstSentence(item.explanation), firstSentence(item.consequence)]).slice(0, 4);
    var chain = element('div', 's4-notion-chain');
    chain.appendChild(element('span', '', text('CADENA DEL BLOQUE', 'CADEIA DO BLOCO')));
    var chainList = element('ol');
    chainValues.forEach(function (value) { chainList.appendChild(element('li', '', value)); });
    chain.appendChild(chainList);
    guide.appendChild(chain);

    var meaning = element('div', 's4-notion-meaning');
    var why = element('p');
    why.appendChild(element('strong', '', text('Por qué importa · ', 'Por que importa · ')));
    why.appendChild(document.createTextNode(firstSentence(item.consequence || item.explanation)));
    meaning.appendChild(why);
    var error = element('p');
    error.appendChild(element('strong', '', text('Error frecuente · ', 'Erro frequente · ')));
    var subjectMeta = learningModel.subjects && learningModel.subjects[context.subjectId];
    var configuredError = localized(subjectMeta && subjectMeta.frequentError);
    error.appendChild(document.createTextNode(configuredError || text(
      'Nombrar «' + item.label + '» sin conectarlo con la explicación y la consecuencia que aparecen en este bloque.',
      'Nomear «' + item.label + '» sem conectá-lo à explicação e à consequência que aparecem neste bloco.'
    )));
    meaning.appendChild(error);
    guide.appendChild(meaning);

    var provenance = element('div', 's4-source-row');
    appendLearningProvenance(provenance, context);
    guide.appendChild(provenance);

    var recall = element('details', 's4-notion-recall');
    recall.appendChild(element('summary', '', text('Recordar sin mirar', 'Recordar sem olhar')));
    recall.appendChild(element('p', '', firstSentence(item.explanation) || item.title));
    guide.appendChild(recall);

    var deepen = element('details', 's4-notion-deepening');
    deepen.appendChild(element('summary', '', text('Profundizar con el texto de la clase', 'Aprofundar com o texto da aula')));
    deepen.appendChild(element('p', '', truncate(item.full || item.explanation, 900)));
    guide.appendChild(deepen);
    return guide;
  }

  function enhanceNotions(outline, context) {
    outline.forEach(function (item) {
      if (item.section.querySelector(':scope > [data-s4-notion-guide]')) return;
      var guide = buildNotionGuide(item, context);
      var heading = directOriginalChildren(item.section).find(function (child) { return /^H[1-5]$/.test(child.tagName); });
      if (heading) heading.insertAdjacentElement('afterend', guide);
      else item.section.prepend(guide);
    });
  }

  function specializationFor(lessonId) {
    if (typeof learningModel.getSpecializationForLesson === 'function') {
      try {
        var configured = learningModel.getSpecializationForLesson(lessonId);
        if (configured) return configured;
      } catch (error) {}
    }
    return learningModel.specializationsByLesson && learningModel.specializationsByLesson[lessonId] || null;
  }

  function normalizedRenderer(typeName) {
    var type = safeToken(typeName);
    if (/glycolysis|journey|signal-chain|pathway|carbon-electron|metabolic-crossroads/.test(type)) return 'pathway';
    if (/feedback|regulation|loop/.test(type)) return 'regulation-loop';
    if (/cascade|causal|mechanism-effect/.test(type)) return 'clinical-cascade';
    if (/epidemiology-chain|care-network/.test(type)) return 'epidemiology-chain';
    if (/diagnostic|decision|localizer|router|triage|tree|crossroads/.test(type)) return 'diagnostic-tree';
    if (/comparison|comparator|matrix|structure-function|audit|compass/.test(type)) return 'comparison-matrix';
    if (/level|hierarchy|priority-map|receptor-pathway-map/.test(type)) return 'levels-map';
    if (/lab|protocol|workflow|pipeline/.test(type)) return 'lab-protocol';
    if (/recognition|morphology|station/.test(type)) return 'recognition-map';
    if (/timeline|sequence|flow/.test(type)) return 'timeline';
    return 'pathway';
  }

  function rendererCopy(renderer) {
    var copies = {
      pathway: [text('RECORRIDO ESPECIALIZADO', 'PERCURSO ESPECIALIZADO'), text('Selecciona cada etapa para reconstruir el recorrido completo.', 'Selecione cada etapa para reconstruir o percurso completo.')],
      timeline: [text('SECUENCIA DE LA CLASE', 'SEQUÊNCIA DA AULA'), text('Avanza en el orden real de los grandes temas.', 'Avance na ordem real dos grandes temas.')],
      'regulation-loop': [text('BUCLE DE REGULACIÓN', 'CICLO DE REGULAÇÃO'), text('Recorre los componentes del circuito y vuelve al bloque que explica cada relación.', 'Percorra os componentes do circuito e volte ao bloco que explica cada relação.')],
      'clinical-cascade': [text('CADENA CAUSAL', 'CADEIA CAUSAL'), text('Sigue el mecanismo y sus consecuencias sin saltar bloques.', 'Siga o mecanismo e suas consequências sem pular blocos.')],
      'epidemiology-chain': [text('CADENA EPIDEMIOLÓGICA', 'CADEIA EPIDEMIOLÓGICA'), text('Relaciona criterios, niveles y continuidad en el orden de la clase.', 'Relacione critérios, níveis e continuidade na ordem da aula.')],
      'diagnostic-tree': [text('ÁRBOL DE DECISIÓN', 'ÁRVORE DE DECISÃO'), text('Cada nodo abre el contenido real que orienta esa decisión; no se agregan ramas.', 'Cada nó abre o conteúdo real que orienta essa decisão; nenhum ramo é acrescentado.')],
      'comparison-matrix': [text('MATRIZ DE COMPARACIÓN', 'MATRIZ DE COMPARAÇÃO'), text('Usa los mismos criterios de la clase para comparar sus grandes temas.', 'Use os mesmos critérios da aula para comparar seus grandes temas.')],
      'levels-map': [text('MAPA DE NIVELES', 'MAPA DE NÍVEIS'), text('Selecciona un nivel o componente para ver su explicación de origen.', 'Selecione um nível ou componente para ver sua explicação de origem.')],
      'lab-protocol': [text('FLUJO DE LABORATORIO', 'FLUXO DE LABORATÓRIO'), text('Sigue cada etapa en el orden del protocolo descrito.', 'Siga cada etapa na ordem do protocolo descrito.')],
      'recognition-map': [text('MAPA DE RECONOCIMIENTO', 'MAPA DE RECONHECIMENTO'), text('Pasa de la observación a la integración usando únicamente los bloques de la clase.', 'Passe da observação à integração usando apenas os blocos da aula.')]
    };
    return copies[renderer] || copies.pathway;
  }

  function orderedSpecializationOutline(outline, specialization) {
    var configuredNodes = specialization && Array.isArray(specialization.nodes) ? specialization.nodes : [];
    if (!configuredNodes.length) return outline.slice();
    var ordered = [];
    var zeroBased = configuredNodes.some(function (configured) { return Number(configured.sectionIndex) === 0; });
    configuredNodes.forEach(function (configured) {
      var target = clean(configured.target || configured.id);
      var index = Number(configured.sectionIndex);
      var match = outline.find(function (item) {
        return target && (item.id === target || item.section.id === target);
      });
      if (!match && Number.isFinite(index)) match = outline[zeroBased ? index : index - 1];
      if (match && ordered.indexOf(match) < 0) ordered.push(match);
    });
    outline.forEach(function (item) { if (ordered.indexOf(item) < 0) ordered.push(item); });
    return ordered;
  }

  function buildSpecialization(panel, context, outline) {
    var specialization = specializationFor(context.id) || {};
    var rawType = specialization.type || specialization.rendererKind || specialization.kind || 'pathway';
    var renderer = normalizedRenderer(rawType);
    var copy = rendererCopy(renderer);
    var ordered = orderedSpecializationOutline(outline, specialization);
    var section = element('section', 's4-specialization s4-specialization-' + renderer);
    section.dataset.s4Specialization = '';
    section.dataset.s4Kind = safeToken(rawType);
    section.dataset.s4Renderer = renderer;
    section.dataset.s4SpecializationKey = safeToken(specialization.key || specialization.rendererKey || rawType);
    section.dataset.s4Interaction = safeToken(specialization.interaction && specialization.interaction.kind || specialization.interaction || 'select-stage');
    section.setAttribute('aria-labelledby', context.id + '-s4-specialization-title');

    var head = element('header', 's4-specialization-head');
    head.appendChild(element('span', '', copy[0]));
    var specializationTitle = localized(specialization.title, text('Taller especializado de esta clase', 'Oficina especializada desta aula'), text('Oficina especializada desta aula', 'Oficina especializada desta aula'));
    var titleNode = element('h3', '', specializationTitle);
    titleNode.id = context.id + '-s4-specialization-title';
    head.appendChild(titleNode);
    head.appendChild(element('p', '', localized(specialization.question, copy[1], copy[1])));
    section.appendChild(head);

    var workspace = element('div', 's4-specialization-workspace');
    var map = element('div', 's4-specialization-map');
    map.setAttribute('role', 'list');
    map.setAttribute('aria-label', text('Grandes temas de esta clase', 'Grandes temas desta aula'));
    var detail = element('article', 's4-specialization-detail');
    detail.dataset.s4SpecializationDetail = '';
    detail.setAttribute('aria-live', 'polite');

    function renderDetail(item, position) {
      detail.replaceChildren();
      detail.dataset.s4Target = item.id;
      detail.appendChild(element('span', '', copy[0] + ' · ' + String(position + 1).padStart(2, '0')));
      detail.appendChild(element('h4', '', item.title));
      detail.appendChild(element('p', '', truncate(item.explanation, 520)));
      if (clean(item.consequence) && clean(item.consequence) !== clean(item.explanation)) {
        var consequence = element('p', 's4-specialization-consequence');
        consequence.appendChild(element('strong', '', text('Conexión del bloque · ', 'Conexão do bloco · ')));
        consequence.appendChild(document.createTextNode(firstSentence(item.consequence)));
        detail.appendChild(consequence);
      }
      var source = element('div', 's4-source-row');
      appendLearningProvenance(source, context, localized(specialization.sourceStatus) || provenanceFor(context));
      detail.appendChild(source);
      var returnButton = element('button', 's4-specialization-return', text('Abrir el bloque fuente', 'Abrir o bloco de origem'));
      returnButton.type = 'button';
      returnButton.dataset.s4SpecializationReturn = '';
      returnButton.dataset.s4Target = item.id;
      returnButton.addEventListener('click', function () { focusBlock(panel, item.id); });
      detail.appendChild(returnButton);
    }

    var nodeButtons = [];
    ordered.forEach(function (item, position) {
      var group = element('div', 's4-specialization-node-group');
      group.setAttribute('role', 'listitem');
      var button = element('button', 's4-specialization-node');
      button.type = 'button';
      button.dataset.s4SpecializationNode = '';
      button.dataset.s4Target = item.id;
      button.setAttribute('aria-pressed', position === 0 ? 'true' : 'false');
      button.appendChild(element('span', '', String(position + 1).padStart(2, '0')));
      button.appendChild(element('strong', '', item.label));
      button.addEventListener('click', function () {
        nodeButtons.forEach(function (candidate) {
          var active = candidate === button;
          candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
          candidate.classList.toggle('is-active', active);
        });
        renderDetail(item, position);
      });
      button.addEventListener('keydown', function (event) {
        if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].indexOf(event.key) < 0) return;
        event.preventDefault();
        var next = position;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = nodeButtons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (position + 1) % nodeButtons.length;
        else next = (position - 1 + nodeButtons.length) % nodeButtons.length;
        nodeButtons[next].focus();
        nodeButtons[next].click();
      });
      if (position === 0) button.classList.add('is-active');
      nodeButtons.push(button);
      group.appendChild(button);

      var jump = element('button', 's4-specialization-jump', text('Ver bloque', 'Ver bloco'));
      jump.type = 'button';
      jump.dataset.s4SpecializationJump = '';
      jump.dataset.s4Target = item.id;
      jump.setAttribute('aria-label', text('Abrir el bloque fuente: ', 'Abrir o bloco de origem: ') + item.label);
      jump.addEventListener('click', function () { focusBlock(panel, item.id); });
      group.appendChild(jump);
      map.appendChild(group);
    });
    workspace.appendChild(map);
    workspace.appendChild(detail);
    section.appendChild(workspace);
    if (ordered.length) renderDetail(ordered[0], 0);
    return section;
  }

  function buildReviewChecklist(context, outline) {
    var section = element('section', 's4-review-checklist');
    section.dataset.s4ReviewChecklist = '';
    section.appendChild(element('span', '', text('LISTA DE DOMINIO', 'LISTA DE DOMÍNIO')));
    section.appendChild(element('h3', '', text('Comprueba la clase por grandes temas', 'Verifique a aula por grandes temas')));
    section.appendChild(element('p', '', text('Marca solo lo que puedes reconstruir sin volver a leer.', 'Marque apenas o que você consegue reconstruir sem reler.')));
    var saved = readStorage(reviewStorageKey);
    var lessonState = saved[context.id] || {};
    var list = element('div', 's4-review-checklist-items');
    outline.forEach(function (item, index) {
      var label = element('label');
      var checkbox = element('input');
      checkbox.type = 'checkbox';
      checkbox.checked = lessonState[item.id] === true;
      checkbox.dataset.s4ReviewCheck = item.id;
      checkbox.addEventListener('change', function () {
        var next = readStorage(reviewStorageKey);
        if (!next[context.id]) next[context.id] = {};
        next[context.id][item.id] = checkbox.checked;
        writeStorage(reviewStorageKey, next);
      });
      label.appendChild(checkbox);
      label.appendChild(element('span', '', String(index + 1).padStart(2, '0') + ' · ' + item.label));
      list.appendChild(label);
    });
    section.appendChild(list);
    return section;
  }

  function enhanceReviewPanel(panel, context, outline) {
    var review = panel.querySelector('[data-lesson-tab-panel="rapida"]');
    if (!review || review.querySelector('[data-s4-review-checklist]')) return;
    review.appendChild(buildReviewChecklist(context, outline));
  }

  function glycolysisSteps() {
    var glycolysis = learningModel.glycolysis || {};
    return Array.isArray(glycolysis.steps) ? glycolysis.steps.slice() : [];
  }

  function recallItems(context, outline) {
    if (context.id === 'bioquimica-2026-08-14' && glycolysisSteps().length === 10) {
      return glycolysisSteps().map(function (step, index) {
        var configuredSection = Number(step.courseSectionIndex);
        var target = Number.isFinite(configuredSection)
          ? outline[Math.min(outline.length - 1, Math.max(0, configuredSection))]
          : outline[Math.min(outline.length - 1, Math.floor(index * outline.length / 10))];
        target = target || outline[0];
        var substrate = localized(step.substrate);
        var product = localized(step.product);
        var enzyme = localized(step.enzyme);
        var mechanism = localized(step.mechanism);
        var balance = [];
        if (Number(step.atpDelta)) balance.push('ATP ' + (Number(step.atpDelta) > 0 ? '+' : '') + Number(step.atpDelta));
        if (Number(step.nadhDelta)) balance.push('NADH ' + (Number(step.nadhDelta) > 0 ? '+' : '') + Number(step.nadhDelta));
        return {
          key: 'step-' + (step.number || index + 1),
          question: text('Paso ' + (step.number || index + 1) + ' · ¿cuáles son sustrato, enzima, producto y efecto sobre el balance?', 'Etapa ' + (step.number || index + 1) + ' · quais são substrato, enzima, produto e efeito sobre o balanço?'),
          answer: [substrate && product ? substrate + ' → ' + product : '', enzyme, mechanism, balance.join(' · ')].filter(Boolean).join(' · '),
          target: target && target.id,
          label: text('Paso ', 'Etapa ') + (step.number || index + 1)
        };
      });
    }
    return outline.map(function (item) {
      return {
        key: item.id,
        question: text('¿Cómo explicarías «' + item.label + '» sin mirar?', 'Como você explicaria «' + item.label + '» sem olhar?'),
        answer: unique([firstSentence(item.explanation), firstSentence(item.consequence)]).join(' '),
        target: item.id,
        label: item.label
      };
    });
  }

  function masteryLabels() {
    return [
      { value: 'dominado', label: text('Dominado', 'Dominado') },
      { value: 'dudo', label: text('Dudo', 'Dúvida') },
      { value: 'revisar', label: text('Revisar', 'Revisar') }
    ];
  }

  function renderRecallPanel(panel, context, outline) {
    var recallPanel = panel.querySelector('[data-lesson-tab-panel="ultra"]');
    if (!recallPanel) return;
    var items = recallItems(context, outline);
    var allState = readStorage(masteryStorageKey);
    var lessonState = allState[context.id] || {};
    var shell = element('div', 's4-recall');
    shell.dataset.s4Recall = '';

    var header = element('header', 's4-recall-head');
    header.appendChild(element('span', '', text('RECORDAR · RESPUESTA OCULTA', 'RECORDAR · RESPOSTA OCULTA')));
    header.appendChild(element('h3', '', text('Recupera la idea antes de comprobarla', 'Recupere a ideia antes de verificá-la')));
    header.appendChild(element('p', '', text('Responde, revela y califica tu seguridad. Si dudas, vuelve al bloque exacto.', 'Responda, revele e classifique sua segurança. Se houver dúvida, volte ao bloco exato.')));
    shell.appendChild(header);

    var cards = element('div', 's4-recall-grid');
    items.forEach(function (item, index) {
      var card = element('article', 's4-recall-card');
      card.dataset.s4RecallCard = '';
      card.dataset.s4Target = item.target || '';
      card.dataset.s4MasteryState = lessonState[item.key] || '';
      card.appendChild(element('span', 's4-recall-number', String(index + 1).padStart(2, '0') + ' · ' + item.label));
      card.appendChild(element('h4', '', item.question));

      var revealId = context.id + '-s4-answer-' + (index + 1);
      var reveal = element('button', 's4-recall-reveal', text('Revelar respuesta', 'Revelar resposta'));
      reveal.type = 'button';
      reveal.dataset.s4RecallReveal = '';
      reveal.setAttribute('aria-controls', revealId);
      reveal.setAttribute('aria-expanded', 'false');
      var answer = element('div', 's4-recall-answer');
      answer.id = revealId;
      answer.dataset.s4RecallAnswer = '';
      answer.hidden = true;
      answer.appendChild(element('p', '', item.answer || text('Vuelve al bloque para reconstruir la respuesta.', 'Volte ao bloco para reconstruir a resposta.')));
      var source = element('div', 's4-source-row');
      appendLearningProvenance(source, context);
      answer.appendChild(source);
      reveal.addEventListener('click', function () {
        answer.hidden = !answer.hidden;
        reveal.setAttribute('aria-expanded', answer.hidden ? 'false' : 'true');
        reveal.textContent = answer.hidden ? text('Revelar respuesta', 'Revelar resposta') : text('Ocultar respuesta', 'Ocultar resposta');
      });
      card.appendChild(reveal);
      card.appendChild(answer);

      var mastery = element('div', 's4-mastery');
      mastery.setAttribute('role', 'group');
      mastery.setAttribute('aria-label', text('Nivel de dominio', 'Nível de domínio'));
      var masteryButtons = [];
      masteryLabels().forEach(function (definition) {
        var button = element('button', '', definition.label);
        button.type = 'button';
        button.dataset.s4Mastery = definition.value;
        button.setAttribute('aria-pressed', lessonState[item.key] === definition.value ? 'true' : 'false');
        button.addEventListener('click', function () {
          masteryButtons.forEach(function (candidate) {
            candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
          });
          card.dataset.s4MasteryState = definition.value;
          var saved = readStorage(masteryStorageKey);
          if (!saved[context.id]) saved[context.id] = {};
          saved[context.id][item.key] = definition.value;
          writeStorage(masteryStorageKey, saved);
          updateProgress(panel);
        });
        masteryButtons.push(button);
        mastery.appendChild(button);
      });
      card.appendChild(mastery);

      if (item.target) {
        var returnButton = element('button', 's4-recall-return', text('Volver al bloque exacto', 'Voltar ao bloco exato'));
        returnButton.type = 'button';
        returnButton.dataset.s4RecallReturn = '';
        returnButton.dataset.s4Target = item.target;
        returnButton.addEventListener('click', function () { focusBlock(panel, item.target); });
        card.appendChild(returnButton);
      }
      cards.appendChild(card);
    });
    shell.appendChild(cards);
    // Recordar enriches the lesson without deleting the authored ultra sheet.
    // Several lessons keep documented figures and photo cards there; replacing
    // the panel would silently discard source material and alter gallery counts.
    recallPanel.appendChild(shell);
  }

  function structureForStep(step, side) {
    var nested = learningModel.glycolysis && learningModel.glycolysis.structures;
    var structures = Array.isArray(nested) ? nested : (Array.isArray(learningModel.structures) ? learningModel.structures : []);
    var substrateSide = side === 'substrate';
    var explicit = clean(substrateSide ? step.substrateStructureId : (step.structureId || step.productStructureId));
    if (explicit) {
      var byId = structures.find(function (structure) { return structure.id === explicit; });
      if (byId) return byId;
    }
    var product = safeToken(localized(substrateSide ? step.substrate : step.product)).replace(/^2-/, '');
    var byName = structures.find(function (structure) {
      var name = safeToken(localized(structure.name));
      return name && (product.indexOf(name) >= 0 || name.indexOf(product) >= 0);
    });
    if (byName) return byName;
    var position = Number(step.number);
    if (!Number.isFinite(position)) return structures[0];
    return substrateSide ? structures[Math.max(0, position - 1)] : structures[position] || structures[structures.length - 1];
  }

  function carbonGroupFor(groups, carbonNumber) {
    var candidates = Array.isArray(groups) ? groups : [];
    var matched = candidates.find(function (candidate) {
      var match = localized(candidate).match(/^C(\d+)(?:\s*[–—-]\s*C?(\d+))?/i);
      if (!match) return false;
      var start = Number(match[1]);
      var end = Number(match[2] || match[1]);
      return carbonNumber >= start && carbonNumber <= end;
    });
    return localized(matched || candidates[carbonNumber - 1]);
  }

  function chemicalGroupLabel(group) {
    var localizedGroup = localized(group);
    return localizedGroup.replace(/^C\d+(?:\s*[–—-]\s*C?\d+)?\s*/i, '') || localizedGroup;
  }

  function chemicalClassAliases(className) {
    var name = className || '';
    var aliases = {
      's4-comparison-molecule-bond': 's4-comparison-bond',
      's4-comparison-molecule-double-bond': 's4-comparison-bond',
      's4-comparison-molecule-carbon': 's4-comparison-carbon',
      's4-comparison-molecule-carbon-label': 's4-comparison-carbon-label',
      's4-comparison-molecule-group': 's4-comparison-carbon-group',
      's4-comparison-molecule-oxygen': 's4-comparison-carbon-group'
    };
    return aliases[name] ? name + ' ' + aliases[name] : name;
  }

  function chemicalLine(svg, x1, y1, x2, y2, className) {
    svg.appendChild(svgElement('line', {
      x1: x1, y1: y1, x2: x2, y2: y2,
      class: chemicalClassAliases(className || 's4-chemical-bond'),
      stroke: 'currentColor',
      'stroke-width': 2,
      'vector-effect': 'non-scaling-stroke'
    }));
  }

  function chemicalLabel(svg, x, y, value, className, anchor) {
    svg.appendChild(svgElement('text', {
      x: x, y: y,
      class: chemicalClassAliases(className || 's4-chemical-label'),
      'text-anchor': anchor || 'middle'
    }, value));
  }

  function chemicalHighlight(svg, x, y, highlighted, className) {
    if (!highlighted) return;
    svg.appendChild(svgElement('rect', {
      x: x - 28, y: y - 23, width: 56, height: 46, rx: 12,
      class: chemicalClassAliases(className || 's4-chemical-carbon') + ' is-highlighted',
      fill: 'none', stroke: 'currentColor', 'stroke-width': 3,
      'vector-effect': 'non-scaling-stroke'
    }));
  }

  function drawFischer(svg, molecule, highlights, prefix) {
    var count = Math.min(Math.max(Number(molecule.carbons) || 6, 2), 6);
    var startY = 82;
    var spacing = 38;
    var centerX = 280;
    var segments = clean(molecule.notation).split('|').map(clean);
    for (var carbon = 1; carbon <= count; carbon += 1) {
      var y = startY + (carbon - 1) * spacing;
      if (carbon > 1) chemicalLine(svg, centerX, y - spacing + 10, centerX, y - 10, prefix + '-bond');
      chemicalHighlight(svg, centerX, y, highlights.indexOf(carbon) >= 0, prefix + '-carbon');
      chemicalLabel(svg, centerX - 36, y + 5, 'C' + carbon, prefix + '-carbon-label', 'end');
      var group = chemicalGroupLabel(carbonGroupFor(molecule.carbonGroups, carbon));
      var lower = group.toLocaleLowerCase();
      if (carbon === 1 || carbon === count || (!/(derecha|direita)/.test(lower) && !/(izquierda|esquerda)/.test(lower))) {
        chemicalLabel(svg, centerX, y + 5, segments[carbon - 1] || group || 'C', prefix + '-group');
      } else {
        chemicalLine(svg, centerX - 52, y, centerX + 52, y, prefix + '-bond');
        var ohRight = /(derecha|direita)/.test(lower);
        chemicalLabel(svg, centerX - 62, y + 5, ohRight ? 'H' : 'OH', prefix + '-group', 'end');
        chemicalLabel(svg, centerX + 62, y + 5, ohRight ? 'OH' : 'H', prefix + '-group', 'start');
      }
    }
    chemicalLabel(svg, 280, 322, clean(molecule.notation), prefix + '-notation');
  }

  function drawHaworth(svg, molecule, highlights, prefix) {
    var points = {
      1: [400, 135], 2: [370, 230], 3: [280, 270], 4: [185, 230], 5: [155, 135], O: [280, 78]
    };
    var order = ['O', 1, 2, 3, 4, 5, 'O'];
    for (var edge = 1; edge < order.length; edge += 1) {
      var from = points[order[edge - 1]];
      var to = points[order[edge]];
      chemicalLine(svg, from[0], from[1], to[0], to[1], prefix + '-bond');
    }
    chemicalLabel(svg, points.O[0], points.O[1] + 5, 'O', prefix + '-oxygen');
    for (var carbon = 1; carbon <= 5; carbon += 1) {
      var point = points[carbon];
      chemicalHighlight(svg, point[0], point[1], highlights.indexOf(carbon) >= 0, prefix + '-carbon');
      chemicalLabel(svg, point[0], point[1] + 5, 'C' + carbon, prefix + '-carbon-label');
      var group = chemicalGroupLabel(carbonGroupFor(molecule.carbonGroups, carbon));
      var upward = /(arriba|acima|cima)/.test(group.toLocaleLowerCase());
      var branchY = point[1] + (upward ? -52 : 52);
      chemicalLine(svg, point[0], point[1] + (upward ? -15 : 15), point[0], branchY + (upward ? 10 : -10), prefix + '-bond');
      chemicalLabel(svg, point[0], branchY, group.replace(/\s+(arriba|abajo|acima|abaixo|cima).*$/i, '') || 'OH', prefix + '-group');
    }
    var c5 = points[5];
    chemicalLine(svg, c5[0] - 12, c5[1] - 12, 105, 82, prefix + '-bond');
    chemicalHighlight(svg, 88, 72, highlights.indexOf(6) >= 0, prefix + '-carbon');
    chemicalLabel(svg, 88, 76, 'C6', prefix + '-carbon-label');
    chemicalLabel(svg, 280, 322, clean(molecule.notation), prefix + '-notation');
  }

  function drawOpenChain(svg, molecule, highlights, prefix) {
    var count = Math.min(Math.max(Number(molecule.carbons) || molecule.carbonGroups.length || 3, 1), 6);
    var startX = 55;
    var spacing = count > 1 ? 450 / (count - 1) : 0;
    var y = 155;
    var segments = clean(molecule.notation).split('|').map(clean);
    for (var carbon = 1; carbon <= count; carbon += 1) {
      var x = count > 1 ? startX + (carbon - 1) * spacing : 280;
      if (carbon > 1) chemicalLine(svg, x - spacing + 22, y, x - 22, y, prefix + '-bond');
      chemicalHighlight(svg, x, y, highlights.indexOf(carbon) >= 0, prefix + '-carbon');
      chemicalLabel(svg, x, y + 5, 'C' + carbon, prefix + '-carbon-label');
      var group = chemicalGroupLabel(carbonGroupFor(molecule.carbonGroups, carbon));
      var formula = segments.length === count ? segments[carbon - 1] : group;
      var branchUp = carbon % 2 === 1;
      var labelY = y + (branchUp ? -58 : 68);
      chemicalLine(svg, x, y + (branchUp ? -18 : 18), x, labelY + (branchUp ? 12 : -16), prefix + '-bond');
      chemicalLabel(svg, x, labelY, formula || group || 'C', prefix + '-group');
      if (/carbonil|carbonila|aldeh|cetona|C\s*=\s*O/i.test(group + ' ' + formula)) {
        chemicalLine(svg, x + 6, y - 18, x + 28, y - 42, prefix + '-double-bond');
        chemicalLine(svg, x + 12, y - 14, x + 34, y - 38, prefix + '-double-bond');
        chemicalLabel(svg, x + 42, y - 43, 'O', prefix + '-group');
      }
    }
    chemicalLabel(svg, 280, 300, clean(molecule.notation), prefix + '-notation');
  }

  function molecularSvg(molecule, highlightedCarbons, prefix) {
    var highlights = (highlightedCarbons || []).map(Number);
    var svg = svgElement('svg', {
      viewBox: '0 0 560 340', role: 'img',
      'aria-label': molecule.name + (molecule.notation ? ' · ' + molecule.notation : '')
    });
    svg.appendChild(svgElement('title', {}, molecule.name));
    chemicalLabel(svg, 280, 28, molecule.name, prefix + '-name');
    var representation = safeToken(molecule.representation || 'open-chain');
    if (representation.indexOf('fischer') >= 0) drawFischer(svg, molecule, highlights, prefix);
    else if (representation.indexOf('haworth') >= 0) drawHaworth(svg, molecule, highlights, prefix);
    else drawOpenChain(svg, molecule, highlights, prefix);
    return svg;
  }

  function buildStructureFigure(structure, highlightedCarbons) {
    var figure = element('figure', 's4-glycolysis-structure');
    if (!structure) {
      figure.appendChild(element('p', '', text('Estructura no disponible en el modelo.', 'Estrutura não disponível no modelo.')));
      return figure;
    }
    var molecule = {
      name: localized(structure.name),
      notation: biochemicalLocalized(structure.linearNotation),
      carbonGroups: localizedList(structure.carbonGroups).map(biochemicalLocalized),
      carbons: Number(structure.carbons) || 0,
      representation: localized(structure.representation) || 'open-chain'
    };
    var svg = molecularSvg(molecule, highlightedCarbons, 's4-structure');
    figure.appendChild(svg);
    var caption = element('figcaption');
    var structureName = element('strong', 's4-maskable', localized(structure.name));
    structureName.dataset.s4Maskable = '';
    caption.appendChild(structureName);
    caption.appendChild(element('span', '', text('Esquema estructural simplificado y reproducible · ', 'Esquema estrutural simplificado e reproduzível · ') + localized(structure.role)));
    figure.appendChild(caption);
    return figure;
  }

  function structuresForStep(step, side) {
    var nested = learningModel.glycolysis && learningModel.glycolysis.structures;
    var structures = Array.isArray(nested) ? nested : (Array.isArray(learningModel.structures) ? learningModel.structures : []);
    var ids = side === 'substrate' ? step.substrateStructureIds : step.productStructureIds;
    if (Array.isArray(ids) && ids.length) {
      var matches = ids.map(function (id) {
        return structures.find(function (structure) { return structure.id === id; });
      }).filter(Boolean);
      if (matches.length) return matches;
    }
    var single = structureForStep(step, side);
    return single ? [single] : [];
  }

  function comparisonStructures() {
    var nested = learningModel.glycolysis && learningModel.glycolysis.structures;
    return Array.isArray(nested) ? nested : (Array.isArray(learningModel.structures) ? learningModel.structures : []);
  }

  function comparisonMember(comparison, side, index) {
    var configured = comparison[side];
    if (!configured && Array.isArray(comparison.members)) configured = comparison.members[index];
    if (!configured) configured = localizedList(comparison.pair)[index];
    if (typeof configured === 'string') configured = { name: configured };
    if (configured && typeof configured === 'object' && (configured.es || configured.pt || configured.br) && !configured.name && !configured.structureId) {
      configured = { name: configured };
    }
    configured = configured || {};
    var configuredStructureId = configured.structureId || comparison[side + 'StructureId'];
    var structures = comparisonStructures();
    var structure = structures.find(function (candidate) {
      return configuredStructureId && candidate.id === configuredStructureId;
    });
    if (!structure && configured.name) {
      structure = structures.find(function (candidate) { return localized(candidate.name) === localized(configured.name); });
    }
    return {
      name: localized(configured.name || (structure && structure.name) || localizedList(comparison.pair)[index] || text('Molécula ', 'Molécula ') + (index + 1)),
      notation: biochemicalLocalized(configured.notation || configured.linearNotation || (structure && structure.linearNotation)),
      carbonGroups: localizedList(configured.carbonGroups || structure && structure.carbonGroups).map(biochemicalLocalized),
      carbons: Number(configured.carbons || structure && structure.carbons) || 0,
      representation: localized(configured.representation || structure && structure.representation || comparison.representation) || 'open-chain'
    };
  }

  function comparisonHighlights(comparison, side) {
    var configured = comparison.highlightCarbons;
    if (Array.isArray(configured)) return configured.map(Number);
    if (configured && Array.isArray(configured[side])) return configured[side].map(Number);
    if (configured && Array.isArray(configured.both)) return configured.both.map(Number);
    return [];
  }

  function buildComparisonMolecule(comparison, side, index) {
    var member = comparisonMember(comparison, side, index);
    var highlights = comparisonHighlights(comparison, side);
    var figure = element('figure', 's4-comparison-molecule');
    figure.dataset.s4Representation = safeToken(member.representation);
    figure.appendChild(molecularSvg(member, highlights, 's4-comparison-molecule'));
    var caption = element('figcaption');
    var captionName = element('strong', 's4-maskable', member.name);
    captionName.dataset.s4Maskable = '';
    caption.appendChild(captionName);
    if (member.notation) caption.appendChild(element('span', '', member.notation));
    figure.appendChild(caption);
    return figure;
  }

  function buildComparisonTool(contextId) {
    var nested = learningModel.glycolysis && learningModel.glycolysis.comparisons;
    var comparisons = Array.isArray(nested) ? nested : (Array.isArray(learningModel.comparisons) ? learningModel.comparisons : []);
    var section = element('section', 's4-glycolysis-comparator');
    section.appendChild(element('span', '', text('COMPARADOR MOLECULAR', 'COMPARADOR MOLECULAR')));
    section.appendChild(element('h4', '', text('Distingue la relación exacta', 'Distinga a relação exata')));
    var tabs = element('div', 's4-comparison-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', text('Comparaciones moleculares', 'Comparações moleculares'));
    var detail = element('article', 's4-comparison-detail');
    detail.id = contextId + '-s4-comparison-detail';
    detail.setAttribute('role', 'tabpanel');
    detail.setAttribute('aria-live', 'polite');
    var buttons = [];

    function showComparison(comparison, index) {
      buttons.forEach(function (button, buttonIndex) {
        button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false');
        button.tabIndex = buttonIndex === index ? 0 : -1;
      });
      detail.replaceChildren();
      detail.setAttribute('aria-labelledby', contextId + '-s4-comparison-tab-' + index);
      var relation = localized(comparison.relation || comparison.classification);
      var discriminant = localized(comparison.discriminant);
      var pair = localizedList(comparison.pair);
      detail.appendChild(element('span', '', relation.toLocaleUpperCase()));
      var comparisonTitle = element('h5', 's4-maskable', pair.join(' ↔ '));
      comparisonTitle.dataset.s4Maskable = '';
      detail.appendChild(comparisonTitle);
      var grid = element('div', 's4-comparison-grid');
      grid.appendChild(buildComparisonMolecule(comparison, 'left', 0));
      grid.appendChild(buildComparisonMolecule(comparison, 'right', 1));
      detail.appendChild(grid);
      if (comparison.representation) detail.appendChild(element('small', 's4-comparison-representation', localized(comparison.representation)));
      var changeGrid = element('div', 's4-comparison-changes');
      var changes = element('p');
      changes.appendChild(element('strong', '', text('Qué cambia · ', 'O que muda · ')));
      changes.appendChild(document.createTextNode(localized(comparison.whatChanges || comparison.changes || comparison.discriminant)));
      changeGrid.appendChild(changes);
      var stays = element('p');
      stays.appendChild(element('strong', '', text('Qué no cambia · ', 'O que não muda · ')));
      stays.appendChild(document.createTextNode(localized(comparison.whatStays || comparison.stays, text('Compara únicamente el criterio señalado; el resto se mantiene según el modelo mostrado.', 'Compare apenas o critério indicado; o restante se mantém conforme o modelo mostrado.'), text('Compare apenas o critério indicado; o restante se mantém conforme o modelo mostrado.', 'Compare apenas o critério indicado; o restante se mantém conforme o modelo mostrado.'))));
      changeGrid.appendChild(stays);
      detail.appendChild(changeGrid);
      var recall = element('details', 's4-comparison-recall');
      recall.appendChild(element('summary', '', localized(comparison.recallQuestion || comparison.recallPrompt || comparison.recall, text('Sin mirar la clasificación, ¿qué criterio separa estas moléculas?', 'Sem olhar a classificação, qual critério separa estas moléculas?'), text('Sem olhar a classificação, qual critério separa estas moléculas?', 'Sem olhar a classificação, qual critério separa estas moléculas?'))));
      recall.appendChild(element('p', '', localized(comparison.recallAnswer) || [relation, discriminant].filter(Boolean).join(' · ')));
      detail.appendChild(recall);
      if (section.closest('.s4-labels-masked')) {
        detail.querySelectorAll('[data-s4-maskable]').forEach(function (node) {
          node.dataset.s4OriginalText = node.textContent;
          node.textContent = '••••••';
          node.setAttribute('aria-label', text('Nombre oculto', 'Nome oculto'));
        });
      }
    }

    comparisons.slice(0, 6).forEach(function (comparison, index) {
      var button = element('button', 's4-comparator-tab', localizedList(comparison.pair).join(' / '));
      button.type = 'button';
      button.classList.add('s4-maskable');
      button.dataset.s4Maskable = '';
      button.dataset.s4Comparison = comparison.id || String(index + 1);
      button.setAttribute('role', 'tab');
      button.id = contextId + '-s4-comparison-tab-' + index;
      button.setAttribute('aria-controls', detail.id);
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener('click', function () { showComparison(comparison, index); });
      button.addEventListener('keydown', function (event) {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) < 0) return;
        event.preventDefault();
        var next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
      buttons.push(button);
      tabs.appendChild(button);
    });
    section.appendChild(tabs);
    section.appendChild(detail);
    if (comparisons.length) showComparison(comparisons[0], 0);

    if (comparisons[6]) {
      var terminology = element('details', 's4-comparison-terminology');
      terminology.dataset.s4Terminology = '';
      terminology.appendChild(element('summary', '', localizedList(comparisons[6].pair).join(' · ')));
      terminology.appendChild(element('p', '', localized(comparisons[6].discriminant)));
      section.appendChild(terminology);
    }
    return section;
  }

  function buildBoardDialog(contextId) {
    var dialog = element('dialog', 's4-board-dialog');
    dialog.id = contextId + '-s4-board-dialog';
    dialog.setAttribute('aria-labelledby', dialog.id + '-title');
    var header = element('header');
    var title = element('h4', '', text('Pizarra de la profesora', 'Quadro da professora'));
    title.id = dialog.id + '-title';
    header.appendChild(title);
    var close = element('button', '', '×');
    close.type = 'button';
    close.setAttribute('aria-label', text('Cerrar pizarra', 'Fechar quadro'));
    header.appendChild(close);
    dialog.appendChild(header);
    var image = element('img');
    image.alt = '';
    dialog.appendChild(image);
    dialog.appendChild(element('p', 's4-board-dialog-caption'));
    close.addEventListener('click', function () {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
    return dialog;
  }

  function buildBoards(contextId) {
    var boardModel = learningModel.glycolysis && learningModel.glycolysis.boards || learningModel.boards || {};
    var wrap = element('section', 's4-glycolysis-boards');
    wrap.appendChild(element('span', '', text('PIZARRAS NÚCLEO · 4', 'QUADROS CENTRAIS · 4')));
    wrap.appendChild(element('h4', '', text('El trazado docente en el punto útil', 'O traçado docente no ponto útil')));
    var source = element('div', 's4-source-row');
    appendBadge(source, localized(boardModel.sourceStatus) || sourceLabel('professor'), 'is-source');
    wrap.appendChild(source);
    var grid = element('div', 's4-board-grid');
    var dialog = buildBoardDialog(contextId);
    var previousTrigger = null;
    var boards = Array.isArray(boardModel.core) ? boardModel.core : [];
    boards.slice(0, 4).forEach(function (board, index) {
      var button = element('button', 's4-board-card');
      button.type = 'button';
      button.dataset.s4Board = board.id || String(index + 1);
      var image = element('img');
      image.src = board.path || board.src || '';
      image.alt = biochemicalLocalized(board.title) || text('Pizarra ', 'Quadro ') + (index + 1);
      image.loading = 'lazy';
      button.appendChild(image);
      button.appendChild(element('span', '', biochemicalLocalized(board.title)));
      button.addEventListener('click', function () {
        previousTrigger = button;
        dialog.querySelector('h4').textContent = biochemicalLocalized(board.title);
        var dialogImage = dialog.querySelector('img');
        dialogImage.src = board.path || board.src || '';
        dialogImage.alt = biochemicalLocalized(board.title);
        dialog.querySelector('.s4-board-dialog-caption').textContent = text('Pizarra docente conservada · ampliar para leer.', 'Quadro docente preservado · amplie para ler.');
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      });
      grid.appendChild(button);
    });
    dialog.addEventListener('close', function () { if (previousTrigger) previousTrigger.focus(); });
    wrap.appendChild(grid);
    wrap.appendChild(dialog);
    var archive = Array.isArray(boardModel.archive) ? boardModel.archive : [];
    if (archive.length > 4) {
      var note = element('p', 's4-board-archive-note', text('Las 7 pizarras completas siguen conservadas en Materiales y fuentes.', 'Os 7 quadros completos continuam preservados em Materiais e fontes.'));
      wrap.appendChild(note);
    }
    return wrap;
  }

  function stepHaystack(step) {
    return [step.substrate, step.product, step.enzyme, step.mechanism]
      .map(localized)
      .concat(localizedList(step.inputs), localizedList(step.outputs))
      .join(' ').toLocaleLowerCase();
  }

  function buildGlycolysisLab(panel, context, outline) {
    var pathway = learningModel.glycolysis || {};
    var steps = Array.isArray(pathway.steps) ? pathway.steps.slice() : [];
    if (steps.length !== 10) return null;
    var lab = element('section', 's4-glycolysis-lab');
    lab.dataset.s4GlycolysisLab = '';
    lab.setAttribute('aria-labelledby', context.id + '-glycolysis-title');

    var head = element('header', 's4-glycolysis-head');
    head.appendChild(element('span', '', text('ATELIER MOLÉCULAIRE · 10 PASOS', 'OFICINA MOLECULAR · 10 ETAPAS')));
    var title = element('h3', '', localized(pathway.title, 'Glucólisis paso a paso', 'Glicólise passo a passo'));
    title.id = context.id + '-glycolysis-title';
    head.appendChild(title);
    var directSummary = pathway.balance && pathway.balance.directSummary;
    head.appendChild(element('p', '', localized(directSummary, 'Selecciona un paso para reconstruir la vía y su balance.', 'Selecione uma etapa para reconstruir a via e seu balanço.')));
    var sources = element('div', 's4-source-row');
    appendBadge(sources, sourceLabel('precision'), 'is-precision');
    appendBadge(sources, sourceLabel('reformulation'), 'is-method');
    head.appendChild(sources);
    lab.appendChild(head);

    var toolbar = element('div', 's4-glycolysis-toolbar');
    var views = element('div', 's4-glycolysis-view-switch');
    views.setAttribute('role', 'tablist');
    views.setAttribute('aria-label', text('Vista de la glucólisis', 'Vista da glicólise'));
    var viewDefinitions = [
      ['simple', 'Simple'],
      ['chemistry', text('Química', 'Química')],
      ['board', text('Pizarra', 'Quadro')]
    ];
    var viewButtons = [];
    var viewPanels = [];
    viewDefinitions.forEach(function (definition, index) {
      var button = element('button', '', definition[1]);
      button.type = 'button';
      button.dataset.s4GlycolysisView = definition[0];
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', context.id + '-glycolysis-' + definition[0]);
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener('keydown', function (event) {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) < 0) return;
        event.preventDefault();
        var next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = viewButtons.length - 1;
        else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + viewButtons.length) % viewButtons.length;
        viewButtons[next].focus();
        viewButtons[next].click();
      });
      viewButtons.push(button);
      views.appendChild(button);
    });
    toolbar.appendChild(views);

    var namesMasked = false;
    var maskButton = element('button', 's4-glycolysis-mask', text('Ocultar nombres', 'Ocultar nomes'));
    maskButton.type = 'button';
    maskButton.setAttribute('aria-pressed', 'false');
    maskButton.dataset.s4MaskNames = '';
    function applyNameMask() {
      lab.querySelectorAll('[data-s4-maskable]').forEach(function (node) {
        if (!node.dataset.s4OriginalText) node.dataset.s4OriginalText = node.textContent;
        node.textContent = namesMasked ? '••••••' : node.dataset.s4OriginalText;
        node.setAttribute('aria-label', namesMasked ? text('Nombre oculto', 'Nome oculto') : node.dataset.s4OriginalText);
      });
      maskButton.setAttribute('aria-pressed', namesMasked ? 'true' : 'false');
      maskButton.textContent = namesMasked ? text('Mostrar nombres', 'Mostrar nomes') : text('Ocultar nombres', 'Ocultar nomes');
      lab.classList.toggle('s4-labels-masked', namesMasked);
    }
    maskButton.addEventListener('click', function () {
      namesMasked = !namesMasked;
      applyNameMask();
    });
    toolbar.appendChild(maskButton);
    lab.appendChild(toolbar);

    var simplePanel = element('section', 's4-glycolysis-panel s4-glycolysis-simple');
    simplePanel.id = context.id + '-glycolysis-simple';
    simplePanel.setAttribute('role', 'tabpanel');
    simplePanel.dataset.s4GlycolysisViewPanel = 'simple';
    var counters = element('div', 's4-glycolysis-counters');
    var counterDefinitions = [
      ['atp', 'ATP'], ['nadh', 'NADH'],
      ['carbons', text('Carbonos', 'Carbonos')],
      ['molecules', text('Moléculas', 'Moléculas')]
    ];
    var counterNodes = {};
    counterDefinitions.forEach(function (definition) {
      var article = element('article');
      article.dataset.s4Counter = definition[0];
      article.dataset.s4Value = '0';
      article.appendChild(element('span', '', definition[1]));
      var value = element('strong', '', '0');
      article.appendChild(value);
      counterNodes[definition[0]] = { article: article, value: value };
      counters.appendChild(article);
    });
    simplePanel.appendChild(counters);

    var filters = element('div', 's4-glycolysis-filters');
    filters.appendChild(element('span', '', text('Resaltar pasos con', 'Destacar etapas com')));
    var activeFilters = {};
    var stepButtons = [];
    ['ATP', 'NADH', 'Pi', 'H2O'].forEach(function (filter) {
      var button = element('button', '', filter);
      button.type = 'button';
      button.dataset.s4EnergyFilter = filter.toLocaleLowerCase();
      button.dataset.s4Filter = filter.toLocaleLowerCase();
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        activeFilters[filter] = !activeFilters[filter];
        button.setAttribute('aria-pressed', activeFilters[filter] ? 'true' : 'false');
        var selectedFilters = Object.keys(activeFilters).filter(function (key) { return activeFilters[key]; });
        stepButtons.forEach(function (stepButton, stepIndex) {
          var haystack = stepHaystack(steps[stepIndex]);
          var matches = !selectedFilters.length || selectedFilters.every(function (key) {
            var needle = key.toLocaleLowerCase();
            if (needle === 'pi') return /(^|\W)pi(\W|$)|fosfato inorgánico/.test(haystack);
            return haystack.indexOf(needle) >= 0;
          });
          stepButton.classList.toggle('is-filtered-out', !matches);
        });
      });
      filters.appendChild(button);
    });
    simplePanel.appendChild(filters);

    var stepsNav = element('div', 's4-glycolysis-steps');
    stepsNav.setAttribute('aria-label', text('Diez pasos de la glucólisis', 'Dez etapas da glicólise'));
    var stepDetail = element('article', 's4-glycolysis-detail');
    stepDetail.setAttribute('aria-live', 'polite');
    var chemistryPanel = element('section', 's4-glycolysis-panel s4-glycolysis-chemistry');
    chemistryPanel.id = context.id + '-glycolysis-chemistry';
    chemistryPanel.setAttribute('role', 'tabpanel');
    chemistryPanel.dataset.s4GlycolysisViewPanel = 'chemistry';
    chemistryPanel.hidden = true;
    var structureStage = element('div', 's4-glycolysis-structure-stage');
    var carbonTracker = element('div', 's4-glycolysis-carbon');
    carbonTracker.setAttribute('aria-label', text('Seguimiento de carbonos C1 a C6', 'Acompanhamento dos carbonos C1 a C6'));
    var activeCarbonNumber = 1;
    for (var carbon = 1; carbon <= 6; carbon += 1) {
      var chip = element('button', 's4-carbon-chip', 'C' + carbon);
      chip.type = 'button';
      chip.dataset.carbon = String(carbon);
      chip.dataset.s4Carbon = String(carbon);
      chip.setAttribute('aria-pressed', carbon === 1 ? 'true' : 'false');
      chip.addEventListener('click', function () {
        activeCarbonNumber = Number(this.dataset.carbon);
        updateCarbonSelection();
      });
      carbonTracker.appendChild(chip);
    }
    var carbonMapNote = element('p', 's4-carbon-map-note');
    carbonMapNote.dataset.s4CarbonMap = '';
    carbonTracker.appendChild(carbonMapNote);
    var carbonSelectionNote = element('p', 's4-carbon-selection-note');
    carbonSelectionNote.dataset.s4CarbonSelection = '';
    carbonSelectionNote.setAttribute('aria-live', 'polite');
    carbonTracker.appendChild(carbonSelectionNote);
    chemistryPanel.appendChild(carbonTracker);
    chemistryPanel.appendChild(structureStage);
    chemistryPanel.appendChild(buildComparisonTool(context.id));
    var boardPanel = element('section', 's4-glycolysis-panel s4-glycolysis-board');
    boardPanel.id = context.id + '-glycolysis-board';
    boardPanel.setAttribute('role', 'tabpanel');
    boardPanel.dataset.s4GlycolysisViewPanel = 'board';
    boardPanel.hidden = true;
    boardPanel.appendChild(buildBoards(context.id));

    function cumulativeValue(lastIndex, property) {
      return steps.slice(0, lastIndex + 1).reduce(function (total, step) {
        var delta = Number(step[property]);
        return total + (Number.isFinite(delta) ? delta : 0);
      }, 0);
    }

    function updateCounter(name, value, renderedValue) {
      if (!counterNodes[name]) return;
      counterNodes[name].article.dataset.s4Value = String(value);
      counterNodes[name].value.textContent = renderedValue === undefined ? String(value) : String(renderedValue);
    }

    function updateCarbonSelection() {
      var selected = null;
      carbonTracker.querySelectorAll('[data-s4-carbon]').forEach(function (chip) {
        var active = Number(chip.dataset.s4Carbon) === activeCarbonNumber;
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        chip.classList.toggle('is-active', active);
        if (active) selected = chip;
      });
      var destination = selected && selected.dataset.s4CarbonDestination || '';
      carbonSelectionNote.textContent = selected
        ? 'C' + activeCarbonNumber + (destination ? ' → ' + destination : '')
        : '';
    }

    function updateCarbonTracker(step) {
      var splitStep = pathway.invariants && pathway.invariants.split && Number(pathway.invariants.split.step) || 4;
      var modified = Array.isArray(step.modifiedCarbons) ? step.modifiedCarbons.map(Number) : [];
      var mapping = step.carbonMap || step.carbonTracking || {};
      var mapNote = carbonTracker.querySelector('[data-s4-carbon-map]');
      mapNote.textContent = localized(step.carbonMapText) || (typeof mapping === 'string' ? mapping : '');
      mapNote.hidden = !mapNote.textContent;
      carbonTracker.querySelectorAll('[data-carbon]').forEach(function (chip) {
        var carbonNumber = Number(chip.dataset.carbon);
        var mapped = Array.isArray(mapping)
          ? mapping[carbonNumber - 1]
          : (mapping && typeof mapping === 'object' ? mapping[carbonNumber] || mapping['C' + carbonNumber] : '');
        var destination = mapped && typeof mapped === 'object'
          ? localized(mapped.destination || mapped.product || mapped.label)
          : localized(mapped);
        destination = biochemicalLocalized(destination);
        if (!destination && Number(step.number) >= splitStep && pathway.invariants && pathway.invariants.split) {
          destination = localizedList(pathway.invariants.split.products)[carbonNumber <= 3 ? 0 : 1] || '';
        }
        if (!destination && Number(step.number) < splitStep) destination = localized(step.product);
        chip.replaceChildren(document.createTextNode('C' + carbonNumber));
        if (destination) chip.appendChild(element('small', '', destination));
        chip.dataset.s4CarbonDestination = destination;
        chip.setAttribute('aria-label', 'C' + carbonNumber + (destination ? ' → ' + destination : ''));
        chip.classList.toggle('is-modified', modified.indexOf(carbonNumber) >= 0);
        chip.classList.toggle('is-fragment-a', Number(step.number) >= splitStep && carbonNumber <= 3);
        chip.classList.toggle('is-fragment-b', Number(step.number) >= splitStep && carbonNumber > 3);
      });
      updateCarbonSelection();
    }

    function renderStep(step, index) {
      stepButtons.forEach(function (button, buttonIndex) {
        var active = buttonIndex === index;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('is-active', active);
      });
      var atp = cumulativeValue(index, 'atpDelta');
      var nadh = cumulativeValue(index, 'nadhDelta');
      var splitStep = pathway.invariants && pathway.invariants.split && Number(pathway.invariants.split.step) || 4;
      var molecules = Number(step.moleculesAfter) || (Number(step.number) >= splitStep ? 2 : 1);
      updateCounter('atp', atp, atp > 0 ? '+' + atp : atp);
      updateCounter('nadh', nadh, nadh > 0 ? '+' + nadh : nadh);
      updateCounter('carbons', Number(steps[0].carbons) || 6);
      updateCounter('molecules', molecules);

      stepDetail.replaceChildren();
      stepDetail.dataset.s4ActiveStep = String(step.number || index + 1);
      stepDetail.appendChild(element('span', '', text('PASO ', 'ETAPA ') + (step.number || index + 1) + ' · ' + localized(step.phase).toLocaleUpperCase()));
      if (Number(step.number) === 5 || Number(step.number) >= 6) {
        var transition = element('span', 's4-glycolysis-transition', Number(step.number) === 5
          ? localized(step.transitionBadge, 'DESDE AQUÍ ×2', 'A PARTIR DAQUI ×2')
          : '×2');
        transition.dataset.s4Transition = Number(step.number) === 5 ? 'starts-here' : 'active';
        stepDetail.appendChild(transition);
      }
      if (step.reactionType) {
        var reactionType = element('small', 's4-glycolysis-reaction-type s4-maskable', localized(step.reactionType));
        reactionType.dataset.s4Maskable = '';
        stepDetail.appendChild(reactionType);
      }
      var enzyme = element('h4', 's4-maskable', localized(step.enzyme));
      enzyme.dataset.s4Maskable = '';
      stepDetail.appendChild(enzyme);
      var reaction = element('p', 's4-glycolysis-reaction');
      var substrate = element('strong', 's4-maskable', localized(step.substrate));
      substrate.dataset.s4Maskable = '';
      var product = element('strong', 's4-maskable', localized(step.product));
      product.dataset.s4Maskable = '';
      reaction.appendChild(substrate);
      reaction.appendChild(document.createTextNode(' → '));
      reaction.appendChild(product);
      stepDetail.appendChild(reaction);
      stepDetail.appendChild(element('p', '', localized(step.mechanism)));
      var changes = element('div', 's4-glycolysis-changes');
      if (step.whatChanges) {
        var changed = element('p');
        changed.appendChild(element('strong', '', text('Qué cambia · ', 'O que muda · ')));
        changed.appendChild(document.createTextNode(localized(step.whatChanges)));
        changes.appendChild(changed);
      }
      if (step.whatStays) {
        var stays = element('p');
        stays.appendChild(element('strong', '', text('Qué se conserva · ', 'O que se conserva · ')));
        stays.appendChild(document.createTextNode(localized(step.whatStays)));
        changes.appendChild(stays);
      }
      if (step.whyItMatters) {
        var matters = element('p');
        matters.appendChild(element('strong', '', text('Por qué importa · ', 'Por que importa · ')));
        matters.appendChild(document.createTextNode(localized(step.whyItMatters)));
        changes.appendChild(matters);
      }
      if (changes.children.length) stepDetail.appendChild(changes);
      var facts = element('ul', 's4-glycolysis-step-facts');
      facts.appendChild(element('li', '', step.reversible ? text('Reversible', 'Reversível') : text('Irreversible', 'Irreversível')));
      facts.appendChild(element('li', '', text('Multiplicador · ×', 'Multiplicador · ×') + (step.multiplier || 1)));
      var inputLabels = localizedList(step.inputs);
      var outputLabels = localizedList(step.outputs);
      if (inputLabels.length) facts.appendChild(element('li', '', text('Entra · ', 'Entra · ') + inputLabels.join(' + ')));
      if (outputLabels.length) facts.appendChild(element('li', '', text('Sale · ', 'Sai · ') + outputLabels.join(' + ')));
      stepDetail.appendChild(facts);
      var recall = element('details', 's4-glycolysis-recall');
      recall.dataset.s4StepRecall = String(step.number || index + 1);
      recall.appendChild(element('summary', '', localized(step.recallQuestion, text('Sin mirar, ¿qué transforma este paso y qué cambia?', 'Sem olhar, o que esta etapa transforma e o que muda?'), text('Sem olhar, o que esta etapa transforma e o que muda?', 'Sem olhar, o que esta etapa transforma e o que muda?'))));
      var recallAnswer = element('p', 's4-maskable', localized(step.recallAnswer) || [localized(step.substrate) + ' → ' + localized(step.product), localized(step.mechanism)].filter(Boolean).join(' · '));
      recallAnswer.dataset.s4Maskable = '';
      recall.appendChild(recallAnswer);
      stepDetail.appendChild(recall);
      var stepSource = element('div', 's4-source-row');
      appendBadge(stepSource, localized(step.sourceStatus) || sourceLabel('precision'), 'is-precision');
      appendLearningProvenance(stepSource, context);
      stepDetail.appendChild(stepSource);

      var actions = element('div', 's4-glycolysis-step-actions');
      var sourceIndex = step.courseSectionIndex === undefined || step.courseSectionIndex === null ? NaN : Number(step.courseSectionIndex);
      var sourceItem = Number.isFinite(sourceIndex) && Array.isArray(outline) ? outline[sourceIndex] : null;
      if (sourceItem) {
        var sourceReturn = element('button', '', text('Volver al bloque del curso', 'Voltar ao bloco da aula'));
        sourceReturn.type = 'button';
        sourceReturn.dataset.s4StepSourceReturn = '';
        sourceReturn.dataset.s4Target = sourceItem.id;
        sourceReturn.addEventListener('click', function () { focusBlock(panel, sourceItem.id); });
        actions.appendChild(sourceReturn);
      }
      if (step.boardId) {
        var boardReturn = element('button', '', text('Ver la pizarra de este paso', 'Ver o quadro desta etapa'));
        boardReturn.type = 'button';
        boardReturn.dataset.s4StepBoardReturn = step.boardId;
        boardReturn.addEventListener('click', function () {
          showView('board');
          window.requestAnimationFrame(function () {
            var board = Array.prototype.find.call(lab.querySelectorAll('[data-s4-board]'), function (candidate) {
              return candidate.dataset.s4Board === step.boardId;
            });
            if (!board) return;
            board.focus({ preventScroll: true });
            board.scrollIntoView({ behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
          });
        });
        actions.appendChild(boardReturn);
      }
      if (actions.children.length) stepDetail.appendChild(actions);

      var structureComparison = element('div', 's4-glycolysis-structure-comparison');
      var before = element('section');
      before.appendChild(element('h5', '', text('Antes', 'Antes')));
      structuresForStep(step, 'substrate').forEach(function (structure) {
        before.appendChild(buildStructureFigure(structure, step.modifiedCarbons));
      });
      var after = element('section');
      after.appendChild(element('h5', '', text('Después', 'Depois')));
      structuresForStep(step, 'product').forEach(function (structure) {
        after.appendChild(buildStructureFigure(structure, step.modifiedCarbons));
      });
      structureComparison.appendChild(before);
      structureComparison.appendChild(after);
      structureStage.replaceChildren(structureComparison);
      updateCarbonTracker(step);
      applyNameMask();
    }

    steps.forEach(function (step, index) {
      var button = element('button', 's4-glycolysis-step');
      button.type = 'button';
      button.dataset.s4GlycolysisStep = String(step.number || index + 1);
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.appendChild(element('span', '', String(step.number || index + 1).padStart(2, '0')));
      var stepName = element('strong', 's4-maskable', localized(step.enzyme));
      stepName.dataset.s4Maskable = '';
      button.appendChild(stepName);
      button.addEventListener('click', function () { renderStep(step, index); });
      button.addEventListener('keydown', function (event) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(event.key) < 0) return;
        event.preventDefault();
        var next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = stepButtons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % stepButtons.length;
        else next = (index - 1 + stepButtons.length) % stepButtons.length;
        stepButtons[next].focus();
        stepButtons[next].click();
      });
      if (index === 0) button.classList.add('is-active');
      stepButtons.push(button);
      stepsNav.appendChild(button);
    });
    simplePanel.appendChild(stepsNav);
    simplePanel.appendChild(stepDetail);
    lab.appendChild(simplePanel);
    lab.appendChild(chemistryPanel);
    lab.appendChild(boardPanel);

    function showView(view) {
      viewButtons.forEach(function (button) {
        var active = button.dataset.s4GlycolysisView === view;
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.tabIndex = active ? 0 : -1;
      });
      viewPanels.forEach(function (panel) { panel.hidden = panel.dataset.s4GlycolysisViewPanel !== view; });
      lab.dataset.s4ActiveGlycolysisView = view;
    }
    viewPanels = [simplePanel, chemistryPanel, boardPanel];
    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () { showView(button.dataset.s4GlycolysisView); });
    });
    renderStep(steps[0], 0);
    showView('simple');
    return lab;
  }

  function removePreviousLearningLayer(panel) {
    panel.querySelectorAll('[data-s4-course-hero], [data-s4-specialization], [data-s4-glycolysis-lab], [data-s4-review-checklist], [data-s4-notion-guide]').forEach(function (node) {
      node.remove();
    });
  }

  function panelIsComplete(panel) {
    var recall = panel.querySelector('[data-lesson-tab-panel="ultra"]');
    return panel.dataset.s4LearningExperience === VERSION
      && panel.querySelectorAll('[data-s4-course-hero]').length === 1
      && panel.querySelectorAll('[data-s4-specialization]').length === 1
      && (!recall || recall.querySelector('[data-s4-recall]'));
  }

  function enhancePanel(panel) {
    if (!panel || !panel.matches('[data-lesson-panel]') || panelIsComplete(panel)) return;
    var nav = panel.querySelector('[data-lesson-tabs]');
    var coursePanel = panel.querySelector('[data-lesson-tab-panel="curso"]');
    if (!nav || !coursePanel) return;
    learningModel = window.MedNykutoS4LearningModel || learningModel || {};
    academicModel = window.MedNykutoAcademicModel || academicModel || {};
    var context = lessonContext(panel);
    if (!context.id) return;
    ensureUtilityTabs(panel, context);
    var root = courseRoot(coursePanel);
    var sections = ensureManagedSections(root, context.id);
    if (!sections.length) return;

    removePreviousLearningLayer(panel);
    var outline = outlineFromSections(sections);
    ensureStableTargets(outline, context.id);
    relabelTabs(panel);
    var hero = buildHero(panel, root, context, outline);
    var specialization = buildSpecialization(panel, context, outline);
    var glycolysis = context.id === 'bioquimica-2026-08-14' ? buildGlycolysisLab(panel, context, outline) : null;
    insertLearningLayer(root, hero, specialization, glycolysis);
    enhanceNotions(outline, context);
    enhanceReviewPanel(panel, context, outline);
    renderRecallPanel(panel, context, outline);
    panel.dataset.s4LearningExperience = VERSION;
    panel.classList.add('s4-learning-experience-ready');
    updateProgress(panel);
  }

  function enhanceAll() {
    document.querySelectorAll('[data-lesson-panel]').forEach(function (panel) {
      try { enhancePanel(panel); }
      catch (error) {
        panel.dataset.s4LearningExperienceError = 'true';
      }
    });
    document.documentElement.classList.add('s4-learning-experience-v178-ready');
  }

  function queueEnhancement() {
    if (observerQueued) return;
    observerQueued = true;
    window.requestAnimationFrame(function () {
      observerQueued = false;
      enhanceAll();
    });
  }

  function watchManagedOverlays() {
    if (!window.MutationObserver || !document.body) return;
    var observer = new MutationObserver(function (mutations) {
      var relevant = mutations.some(function (mutation) {
        return Array.prototype.some.call(mutation.addedNodes, function (node) {
          return node.nodeType === 1 && (node.matches('[data-lesson-panel]') || node.querySelector('[data-lesson-panel]'));
        });
      });
      if (relevant) queueEnhancement();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    enhanceAll();
    watchManagedOverlays();
  }

  window.MedNykutoS4LearningExperience = {
    version: VERSION,
    enhanceAll: enhanceAll,
    enhancePanel: enhancePanel
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

})();
