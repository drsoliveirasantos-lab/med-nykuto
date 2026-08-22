(function () {
  'use strict';

  var model = window.MedNykutoAcademicModel;
  var host = document.getElementById('teacherProfiles');
  if (!model || !host) return;

  var stateLabels = {
    observed: 'Observado',
    confirmed: 'Repetido / confirmado',
    trend: 'Tendencia',
    hypothesis: 'Hipótesis'
  };

  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function list(title, items, state) {
    var section = node('section', 'audit-block');
    if (state) section.dataset.state = state;
    section.appendChild(node('h3', '', title));
    var ul = node('ul');
    items.forEach(function (item) { ul.appendChild(node('li', '', item)); });
    section.appendChild(ul);
    return section;
  }

  function details(title, eyebrow, content, open) {
    var disclosure = node('details', 'audit-disclosure');
    disclosure.open = Boolean(open);
    var summary = node('summary');
    var copy = node('span');
    copy.appendChild(node('small', '', eyebrow));
    copy.appendChild(node('strong', '', title));
    summary.appendChild(copy);
    summary.appendChild(node('b', '', '+'));
    disclosure.appendChild(summary);
    disclosure.appendChild(content);
    return disclosure;
  }

  Object.keys(model.teachers).forEach(function (teacherId) {
    var teacher = model.teachers[teacherId];
    var card = node('article', 'teacher-card teacher-audit-card');
    card.id = teacher.id;
    card.style.setProperty('--accent', teacher.accent);

    var header = node('header', 'teacher-audit-head');
    var identity = node('div');
    identity.appendChild(node('span', '', teacher.subject));
    identity.appendChild(node('h2', '', teacher.name));
    identity.appendChild(node('p', '', teacher.confidenceReason));
    header.appendChild(identity);
    header.appendChild(node('b', 'confidence-badge', teacher.confidence));
    card.appendChild(header);

    var evidence = node('div', 'evidence-timeline');
    teacher.evidence.forEach(function (item) {
      var row = node('article');
      row.dataset.state = item.state;
      row.appendChild(node('time', '', item.date));
      var copy = node('div');
      copy.appendChild(node('span', '', stateLabels[item.state] || item.state));
      copy.appendChild(node('p', '', item.label));
      row.appendChild(copy);
      evidence.appendChild(row);
    });
    card.appendChild(details('Base de evidencia', teacher.evidence.length + ' observaciones fechadas', evidence, true));

    var method = node('div', 'audit-grid audit-grid-primary');
    method.appendChild(list('Arquitectura de la clase', teacher.teachingArchitecture, 'observed'));
    method.appendChild(list('Recorrido de razonamiento', teacher.reasoningPath, 'confirmed'));
    method.appendChild(list('Señales de importancia', teacher.importanceSignals, 'trend'));
    card.appendChild(details('Cómo funciona la clase', 'MÉTODO DOCENTE', method, true));

    var assessment = node('div', 'audit-grid');
    assessment.appendChild(list('Formatos observados', teacher.observedQuestionFormats, 'observed'));
    assessment.appendChild(list('Objetivos que conviene preparar', teacher.likelyExamTargets, 'trend'));
    assessment.appendChild(list('Reglas para distractores', teacher.distractorPolicy, 'confirmed'));
    card.appendChild(details('Cómo preparar preguntas y QCM', 'EVALUACIÓN', assessment, false));

    var hypothesisWrap = node('div', 'audit-hypotheses');
    hypothesisWrap.appendChild(list('Lo que todavía debe confirmarse', teacher.hypotheses, 'hypothesis'));
    var angleList = node('div', 'question-angle-list');
    teacher.questionAngles.forEach(function (angle) { angleList.appendChild(node('span', '', angle.replace(/-/g, ' '))); });
    hypothesisWrap.appendChild(angleList);
    card.appendChild(details('Límites, hipótesis y ángulos', 'GRADO DE CERTEZA', hypothesisWrap, false));

    var prompt = node('div', 'teacher-prompt');
    prompt.appendChild(node('p', '', teacher.aiPrompt));
    var copyButton = node('button', '', 'Copiar el prompt completo');
    copyButton.type = 'button';
    copyButton.addEventListener('click', function () {
      navigator.clipboard.writeText(teacher.aiPrompt).then(function () {
        copyButton.textContent = 'Prompt copiado';
        window.setTimeout(function () { copyButton.textContent = 'Copiar el prompt completo'; }, 1800);
      });
    });
    prompt.appendChild(copyButton);
    card.appendChild(details('Prompt docente completo', 'TUTOR IA', prompt, false));

    host.appendChild(card);
  });

  var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
  if (target) window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
})();
