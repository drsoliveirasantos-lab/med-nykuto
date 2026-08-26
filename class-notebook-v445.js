(function () {
  'use strict';

  var model = window.MedNykutoAcademicModel;
  if (!model) return;

  var progressKey = 'med-nykuto-course-progress-v440';
  var activeLessonBySubject = {};
  var activeModeBySubject = {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(progressKey) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeProgress(value) {
    try { localStorage.setItem(progressKey, JSON.stringify(value)); }
    catch (error) {}
  }

  function flattenLessons(subjectModel) {
    var result = [];
    subjectModel.chapters.forEach(function (chapter) {
      chapter.lessons.forEach(function (lesson) {
        result.push({ chapter: chapter, lesson: lesson });
      });
    });
    return result;
  }

  function findLesson(subjectModel, lessonId) {
    return flattenLessons(subjectModel).find(function (entry) { return entry.lesson.id === lessonId; });
  }

  function statusLabel(status) {
    return {
      completed: 'Capítulo terminado',
      current: 'Capítulo en curso',
      confirmed: 'Clase confirmada',
      estimated: 'Fecha estimada',
      undated: 'Fecha por confirmar'
    }[status] || status;
  }

  function teacherAuditContent(teacher, lesson) {
    var wrap = el('div', 'lesson-teacher-audit');
    var intro = el('div', 'lesson-teacher-intro');
    intro.appendChild(el('span', '', teacher.subject));
    intro.appendChild(el('h3', '', 'Cómo estudiar con ' + teacher.name));
    intro.appendChild(el('p', '', teacher.confidenceReason));
    var link = el('a', '', 'Ver auditoría docente completa →');
    link.href = 'profesores.html#' + teacher.id;
    intro.appendChild(link);
    wrap.appendChild(intro);

    var grid = el('div', 'lesson-teacher-grid');
    [
      ['Recorrido esperado', teacher.reasoningPath],
      ['Señales de importancia', teacher.importanceSignals],
      ['Preguntas que conviene preparar', teacher.likelyExamTargets],
      ['Distractores permitidos', teacher.distractorPolicy]
    ].forEach(function (group) {
      var section = el('section');
      section.appendChild(el('h4', '', group[0]));
      var list = el('ul');
      group[1].forEach(function (item) { list.appendChild(el('li', '', item)); });
      section.appendChild(list);
      grid.appendChild(section);
    });
    wrap.appendChild(grid);

    var prompt = el('details', 'lesson-teacher-prompt');
    var summary = el('summary', '', 'Prompt personalizado para esta clase');
    prompt.appendChild(summary);
    prompt.appendChild(el('p', '', teacher.aiPrompt + ' Clase activa: «' + lesson.title + '» (' + lesson.dateLong + ').'));
    var limit = el('small', '', 'Límite: usar únicamente el contenido y las fuentes de esta fecha. Las hipótesis del perfil no se presentan como preguntas reales del docente.');
    prompt.appendChild(limit);
    wrap.appendChild(prompt);
    return wrap;
  }

  function wireLessonTabs(nav, panels) {
    var buttons = Array.prototype.slice.call(nav.querySelectorAll('[data-lesson-tab]'));
    function show(id, focus) {
      buttons.forEach(function (button) {
        var active = button.dataset.lessonTab === id;
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach(function (panel) { panel.hidden = panel.dataset.lessonTabPanel !== id; });
      if (focus) {
        var selected = nav.querySelector('[data-lesson-tab="' + id + '"]');
        if (selected) selected.focus();
      }
    }
    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { show(button.dataset.lessonTab, false); });
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        show(buttons[next].dataset.lessonTab, true);
      });
    });
    show('curso', false);
  }

  var svgNamespace = 'http://www.w3.org/2000/svg';
  var lessonVisuals = {
    'nutricion-2026-08-13': [{
      section: 5,
      type: 'grid',
      kicker: 'LEY DE ADECUACIÓN',
      title: 'La dieta se construye alrededor de la persona',
      caption: 'Necesidades, ingesta, gasto y contexto deben leerse juntos antes de ajustar el plan.',
      center: ['PACIENTE', 'plan posible'],
      nodes: [
        { title: ['Necesidades'], detail: ['edad · clínica'] },
        { title: ['Ingesta'], detail: ['cantidad · calidad'] },
        { title: ['Gasto'], detail: ['actividad · metabolismo'] },
        { title: ['Contexto'], detail: ['hábitos · acceso'] }
      ]
    }],
    'fisiologia-2026-08-10': [{
      section: 2,
      type: 'flow',
      kicker: 'DIFUSIÓN ALVEOLOCAPILAR',
      title: 'El flujo aumenta con área y gradiente, y cae con el espesor',
      caption: 'Lectura visual de la ley de Fick aplicada al paso de O₂ desde el alvéolo hasta la sangre.',
      nodes: [
        { title: ['Alvéolo'], detail: ['PAO₂ alta'] },
        { title: ['Membrana'], detail: ['área ↑', 'espesor ↓'] },
        { title: ['Plasma'], detail: ['O₂ disuelto'] },
        { title: ['Eritrocito'], detail: ['O₂ + Hb'] }
      ],
      edges: ['gradiente', 'difusión', 'captación'],
      note: 'CO₂ recorre el sentido opuesto y difunde con gran facilidad.'
    }],
    'fisiologia-2026-08-13': [{
      section: 1,
      type: 'flow',
      kicker: 'RETROCONTROL RESPIRATORIO',
      title: 'La ventilación cambia para corregir la variable detectada',
      caption: 'El circuito integra señal química, centros respiratorios y músculos ventilatorios.',
      nodes: [
        { title: ['PaCO₂ / pH'], detail: ['variable'] },
        { title: ['Quimiorreceptor'], detail: ['sensor'] },
        { title: ['Bulbo + puente'], detail: ['controlador'] },
        { title: ['Músculos'], detail: ['efector'] },
        { title: ['Ventilación'], detail: ['respuesta'] }
      ],
      edges: ['detecta', 'informa', 'activa', 'modifica'],
      cycle: true,
      note: 'La respuesta vuelve a modificar PaCO₂ y pH: eso cierra el circuito.'
    }],
    'fisiologia-2026-08-24': [{
      section: 6, type: 'compare', kicker: 'DOS VÍAS ASCENDENTES', title: 'La modalidad decide dónde cruza la señal', caption: 'Columna dorsal y sistema anterolateral conducen información distinta.', nodes: [{title:['COLUMNA DORSAL'],detail:['tacto fino · vibración · propiocepción','cruza en bulbo']},{title:['ANTEROLATERAL'],detail:['dolor · temperatura · tacto grosero','cruza en médula']}]
    }],
    'fisiologia-2026-08-17': [{
      section: 2,
      type: 'neuron',
      kicker: 'DIRECCIÓN FUNCIONAL',
      title: 'La forma de la neurona acompaña el recorrido de la señal',
      caption: 'Dendritas y soma integran; el axón conduce; la terminal comunica con la célula siguiente.'
    }],
    'fisiologia-2026-08-20': [{
      target: '#fisio20-potencial',
      type: 'flow',
      kicker: 'POTENCIAL DE ACCIÓN',
      title: 'Cada fase depende de un movimiento iónico concreto',
      caption: 'Secuencia mínima para no confundir despolarización, repolarización y periodo refractario.',
      nodes: [
        { title: ['Reposo'], detail: ['gradientes listos'] },
        { title: ['Umbral'], detail: ['abre Na⁺'] },
        { title: ['Despolariza'], detail: ['Na⁺ entra'] },
        { title: ['Repolariza'], detail: ['K⁺ sale'] },
        { title: ['Refractario'], detail: ['ordena la señal'] }
      ],
      edges: ['estímulo', 'canal', 'inactivación', 'recuperación'],
      note: 'La bomba Na⁺/K⁺ mantiene los gradientes; no dibuja por sí sola cada fase rápida.'
    }],
    'bioquimica-2026-08-14': [{
      section: 1,
      type: 'board',
      src: 'assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2/01-mapa-general.webp',
      title: 'Mapa original de la glucólisis',
      caption: 'Composición, colores, flechas y anotaciones del profesor, repasados en limpio.'
    }, {
      section: 2,
      type: 'board',
      src: 'assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2/02-fase-preparatoria-1-3.webp',
      title: 'Fase preparatoria · reacciones 1 a 3',
      caption: 'El orden visual del tablero se conserva sin convertirlo en una infografía nueva.'
    }, {
      section: 6,
      type: 'board',
      src: 'assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2/06-regulacion-resumen.webp',
      title: 'Puntos de regulación',
      caption: 'Hexoquinasa, glucoquinasa, GKRP y PFK-1 según la pizarra original.'
    }],
    'bioquimica-2026-08-19': [{
      target: '#bio19-piruvato',
      type: 'branch',
      kicker: 'CRUCE METABÓLICO',
      title: 'El piruvato cambia de destino según la necesidad celular',
      caption: 'Oxidación, regeneración de NAD⁺ y anaplerosis parten del mismo intermediario.',
      center: ['PIRUVATO', '3 carbonos'],
      nodes: [
        { title: ['Acetil-CoA'], detail: ['PDH · CO₂ + NADH'] },
        { title: ['Lactato'], detail: ['regenera NAD⁺'] },
        { title: ['Oxalacetato'], detail: ['piruvato carboxilasa'] },
        { title: ['Alanina'], detail: ['transaminación'] }
      ]
    }],
    'bioquimica-2026-08-21': [{
      target: '#cad-insulina',
      type: 'board',
      src: 'assets/class-hub/biochemistry/2026-08-21/board/01-deficit-insulina.svg',
      title: 'Insulina, glucosa y combustibles',
      caption: 'Reconstrucción semántica de la pizarra 1: célula, adipocitos, músculo e hígado reconocibles; posiciones, flechas, relaciones y colores conservados.'
    }, {
      target: '#cad-cetonas',
      type: 'board',
      src: 'assets/class-hub/biochemistry/2026-08-21/board/02-cetogenesis-acidosis.svg',
      title: 'Hepatocito, cetogénesis y acidosis',
      caption: 'Reconstrucción semántica de la pizarra 2: hepatocito, mitocondria, sangre y pulmones clarificados sin modificar la bifurcación metabólica de la profesora.'
    }, {
      target: '#cad-cerebro',
      type: 'board',
      src: 'assets/class-hub/biochemistry/2026-08-21/board/03-cerebro-osmoles.svg',
      title: 'Osmoles cerebrales y edema',
      caption: 'Reconstrucción semántica de la pizarra 3: célula cerebral, cerebro adaptado y cerebro edematoso identificables; ramas de edema e hipocalemia separadas.'
    }],
    'epidemiologia-bloque-anterior': [{
      section: 4,
      type: 'flow',
      kicker: 'CONTINUIDAD DE LA RED',
      title: 'Referir lleva al recurso; contrarreferir devuelve el plan',
      caption: 'La información debe viajar en ambos sentidos para que el cuidado no se fragmente.',
      nodes: [
        { title: ['Territorio'], detail: ['persona + familia'] },
        { title: ['APS'], detail: ['acceso · seguimiento'] },
        { title: ['Referencia'], detail: ['motivo + datos'] },
        { title: ['Hospital'], detail: ['mayor complejidad'] },
        { title: ['Contrarreferencia'], detail: ['conducta + control'] }
      ],
      edges: ['detecta', 'deriva', 'recibe', 'devuelve'],
      cycle: true,
      note: 'La continuidad termina de nuevo en el territorio y en el seguimiento.'
    }],
    'epidemiologia-2026-08-19': [{
      target: '#epi19-triage',
      type: 'triage',
      wide: true,
      kicker: 'TRIAGE DE CINCO NIVELES',
      title: 'Prioridad clínica, no orden de llegada',
      caption: 'El color resume riesgo y tiempo de respuesta; cualquier espera exige reevaluación.',
      nodes: [
        { title: ['I · ROJO'], detail: ['reanimación · inmediato'] },
        { title: ['II · NARANJA'], detail: ['emergencia · muy urgente'] },
        { title: ['III · AMARILLO'], detail: ['urgente · vigilancia'] },
        { title: ['IV · VERDE'], detail: ['menor urgencia'] },
        { title: ['V · AZUL'], detail: ['no urgente'] }
      ],
      note: 'Si el estado cambia, se vuelve a clasificar.'
    }],
    'microbiologia-teorica-2026-08-10': [{
      section: 1,
      type: 'layers',
      kicker: 'MAPA POR PROFUNDIDAD',
      title: 'La profundidad decide la muestra y el tratamiento',
      caption: 'Superficial, cutánea y subcutánea no son sinónimos: ocupan tejidos distintos.',
      nodes: [
        { title: ['SUPERFICIAL'], detail: ['estrato córneo · tallo piloso'] },
        { title: ['CUTÁNEA'], detail: ['piel · pelo · uña queratinizados'] },
        { title: ['SUBCUTÁNEA'], detail: ['dermis profunda · inoculación'] }
      ],
      note: 'A mayor profundidad, la muestra suele necesitar mayor profundidad y el tratamiento deja de ser solo local.'
    }],
    'microbiologia-teorica-2026-08-24': [{
      section: 5, type: 'flow', kicker: 'MICOSIS SUBCUTÁNEAS', title: 'La puerta de entrada conduce a la muestra profunda', caption: 'Historia, patrón y profundidad se integran antes de nombrar el agente.', nodes: [{title:['Inoculación'],detail:['espina · clavo · tierra']},{title:['Lesión'],detail:['nódulos · fístulas · granos']},{title:['Muestra'],detail:['granos · biopsia · cultivo']},{title:['Extensión'],detail:['tejidos blandos · hueso']}], edges:['origina','orienta','confirma']
    }],
    'microbiologia-teorica-2026-08-17': [{
      section: 4,
      type: 'compare',
      kicker: 'PRIMEROS 2 CASOS · 2 PROFUNDIDADES',
      title: 'La lesión guía el sitio de la muestra',
      caption: 'Pitiriasis versicolor y tiña corporal se separan por tejido, patrón y hallazgo directo.',
      nodes: [
        { title: ['Pitiriasis versicolor'], detail: ['máculas + escama fina', 'Malassezia spp.', 'levaduras + hifas cortas'] },
        { title: ['Tiña corporal'], detail: ['placa + borde activo', 'Microsporum canis', 'hifas septadas'] }
      ]
    }],
    'microbiologia-practica-anterior': [{
      section: 5,
      type: 'flow',
      kicker: 'PREPARACIÓN DEL SABOURAUD',
      title: 'Cada gesto prepara el siguiente sin confundir calor y esterilidad',
      caption: 'La concentración se toma de la fórmula utilizada y la esterilización sigue el protocolo.',
      nodes: [
        { title: ['Pesar'], detail: ['fórmula exacta'] },
        { title: ['Añadir agua'], detail: ['destilada'] },
        { title: ['Mezclar'], detail: ['homogeneizar'] },
        { title: ['Calentar'], detail: ['disolver'] },
        { title: ['Esterilizar'], detail: ['según protocolo'] }
      ],
      edges: ['medir', 'incorporar', 'disolver', 'no equivale a'],
      note: 'Ejemplo observado: 10 g / 100 mL. No se generaliza a otras formulaciones.'
    }],
    'microbiologia-practica-2026-08-20': [{
      target: '#micro20-morfologia',
      type: 'flow',
      kicker: 'SECUENCIA DIAGNÓSTICA',
      title: 'Ningún hallazgo aislado identifica de forma segura',
      caption: 'La conclusión nace de integrar el sitio, el examen directo, el cultivo y la morfología.',
      nodes: [
        { title: ['Muestra'], detail: ['piel · pelo · uña'] },
        { title: ['Directo'], detail: ['KOH / Wood'] },
        { title: ['Cultivo'], detail: ['Sabouraud'] },
        { title: ['Morfología'], detail: ['macro + micro'] },
        { title: ['Integración'], detail: ['clínica + laboratorio'] }
      ],
      edges: ['selecciona', 'orienta', 'describe', 'concluye'],
      note: 'Bioseguridad y trazabilidad acompañan todas las etapas.'
    }]
  };

  /*
   * The full course keeps teacher boards exactly where they belong. The two
   * Biochemistry ultra sheets use a separate synthesis diagram so a 90-second
   * review never passes a reconstructed board off as a new editorial graphic.
   */
  var ultraLessonVisuals = {
    'bioquimica-2026-08-14': {
      type: 'pathway',
      wide: true,
      kicker: 'GLUCÓLISIS · RUTA DE 90 SEGUNDOS',
      title: 'Una glucosa se divide y entrega dos piruvatos',
      caption: 'Primero se invierten 2 ATP; después, dos G3P producen 4 ATP y 2 NADH. Balance neto: 2 ATP, 2 NADH y 2 piruvatos.',
      nodes: [
        { title: ['Glucosa'], detail: ['6 C'] },
        { title: ['Glucosa-6-P'], detail: ['ATP → ADP'] },
        { title: ['Fructosa-1,6-BP'], detail: ['segundo ATP'] },
        { title: ['2 × G3P'], detail: ['fase duplicada'] },
        { title: ['2 × Piruvato'], detail: ['3 C + 3 C'] }
      ],
      edges: ['hexo/glucoquinasa', 'PFK-1', 'aldolasa', '+4 ATP · +2 NADH'],
      note: 'NETO · 2 ATP + 2 NADH + 2 PIRUVATOS'
    },
    'bioquimica-2026-08-21': {
      type: 'flow',
      wide: true,
      kicker: 'CETOACIDOSIS · CADENA CAUSAL',
      title: 'El déficit de insulina abre dos rutas que deben vigilarse juntas',
      caption: 'Hiperglucemia causa diuresis osmótica; lipólisis y cetogénesis consumen bicarbonato. Ambas rutas convergen en deshidratación, alteraciones del K⁺ y riesgo neurológico.',
      nodes: [
        { title: ['Insulina ↓'], detail: ['contrarregulación ↑'] },
        { title: ['Glucosa + lipólisis ↑'], detail: ['dos rutas'] },
        { title: ['Agua + K⁺ ↓'], detail: ['pérdidas urinarias'] },
        { title: ['Cetonas ↑'], detail: ['HCO₃⁻ ↓'] },
        { title: ['CAD'], detail: ['Kussmaul · cerebro'] }
      ],
      edges: ['desbloquea', 'glucosuria', 'en paralelo', 'acidosis'],
      note: 'El K⁺ sérico inicial no representa el déficit corporal total.'
    }
  };

  function svgEl(tag, attrs, textValue) {
    var node = document.createElementNS(svgNamespace, tag);
    Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function svgText(svg, x, y, lines, className, anchor) {
    var textNode = svgEl('text', { x: x, y: y, class: className || '', 'text-anchor': anchor || 'middle' });
    (Array.isArray(lines) ? lines : [lines]).forEach(function (line, index) {
      var span = svgEl('tspan', { x: x, dy: index ? 19 : 0 }, line);
      textNode.appendChild(span);
    });
    svg.appendChild(textNode);
    return textNode;
  }

  function drawArrow(svg, x1, y1, x2, y2, label, labelY) {
    svg.appendChild(svgEl('line', { x1: x1, y1: y1, x2: x2 - 9, y2: y2, class: 'diagram-arrow' }));
    svg.appendChild(svgEl('path', { d: 'M ' + (x2 - 10) + ' ' + (y2 - 5) + ' L ' + x2 + ' ' + y2 + ' L ' + (x2 - 10) + ' ' + (y2 + 5) + ' Z', class: 'diagram-arrow-head' }));
    if (label) svgText(svg, (x1 + x2) / 2, labelY === undefined ? y1 - 13 : labelY, label, 'diagram-edge-label');
  }

  function drawCard(svg, x, y, width, height, node, index) {
    svg.appendChild(svgEl('rect', { x: x, y: y, width: width, height: height, rx: 16, class: 'diagram-card diagram-card-' + (index % 5) }));
    svgText(svg, x + width / 2, y + 34, node.title, 'diagram-card-title');
    if (node.detail) svgText(svg, x + width / 2, y + 64, node.detail, 'diagram-card-detail');
  }

  function drawFlow(svg, definition) {
    var nodes = definition.nodes || [];
    var gap = 22;
    var margin = 28;
    var width = (800 - (margin * 2) - (gap * (nodes.length - 1))) / nodes.length;
    var y = 68;
    nodes.forEach(function (node, index) {
      var x = margin + index * (width + gap);
      drawCard(svg, x, y, width, 104, node, index);
      if (index < nodes.length - 1) drawArrow(svg, x + width + 3, y + 52, x + width + gap - 3, y + 52, (definition.edges || [])[index], 51);
    });
    if (definition.cycle && nodes.length > 1) {
      svg.appendChild(svgEl('path', { d: 'M 738 178 C 738 225, 62 225, 62 178', class: 'diagram-feedback' }));
      svg.appendChild(svgEl('path', { d: 'M 57 183 L 62 173 L 67 183 Z', class: 'diagram-arrow-head' }));
    }
    if (definition.note) svgText(svg, 400, 226, definition.note, 'diagram-note');
  }

  function drawGrid(svg, definition) {
    var positions = [[44, 55], [526, 55], [44, 182], [526, 182]];
    (definition.nodes || []).forEach(function (node, index) {
      drawCard(svg, positions[index][0], positions[index][1], 230, 84, node, index);
      var x1 = positions[index][0] < 400 ? positions[index][0] + 230 : positions[index][0];
      var y1 = positions[index][1] + 42;
      var x2 = positions[index][0] < 400 ? 344 : 456;
      var y2 = index < 2 ? 117 : 223;
      svg.appendChild(svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: 'diagram-grid-link' }));
    });
    svg.appendChild(svgEl('circle', { cx: 400, cy: 170, r: 66, class: 'diagram-center' }));
    svgText(svg, 400, 158, definition.center[0], 'diagram-center-title');
    svgText(svg, 400, 184, definition.center[1], 'diagram-center-detail');
  }

  function drawLayers(svg, definition) {
    (definition.nodes || []).forEach(function (node, index) {
      var y = 55 + index * 62;
      svg.appendChild(svgEl('rect', { x: 42, y: y, width: 716, height: 50, rx: 12, class: 'diagram-layer diagram-layer-' + index }));
      svgText(svg, 66, y + 22, node.title, 'diagram-layer-title', 'start');
      svgText(svg, 330, y + 22, node.detail, 'diagram-layer-detail', 'start');
    });
    if (definition.note) svgText(svg, 400, 260, definition.note, 'diagram-note');
  }

  function drawCompare(svg, definition) {
    (definition.nodes || []).slice(0, 2).forEach(function (node, index) {
      var x = index ? 414 : 42;
      svg.appendChild(svgEl('rect', { x: x, y: 55, width: 344, height: 166, rx: 18, class: 'diagram-compare-card diagram-card-' + index }));
      svgText(svg, x + 172, 90, node.title, 'diagram-compare-title');
      (node.detail || []).forEach(function (line, lineIndex) {
        svg.appendChild(svgEl('circle', { cx: x + 37, cy: 125 + lineIndex * 29, r: 4, class: 'diagram-bullet' }));
        svgText(svg, x + 54, 130 + lineIndex * 29, line, 'diagram-compare-detail', 'start');
      });
    });
    svgText(svg, 400, 248, 'comparar tejido · lesión · muestra · hallazgo', 'diagram-note');
  }

  function drawBranch(svg, definition) {
    svg.appendChild(svgEl('rect', { x: 38, y: 100, width: 196, height: 82, rx: 18, class: 'diagram-center-card' }));
    svgText(svg, 136, 130, definition.center[0], 'diagram-center-title');
    svgText(svg, 136, 157, definition.center[1], 'diagram-center-detail');
    (definition.nodes || []).forEach(function (node, index) {
      var x = index % 2 ? 568 : 300;
      var y = index < 2 ? 48 : 174;
      svg.appendChild(svgEl('path', { d: 'M 234 141 C 266 141, 265 ' + (y + 43) + ', ' + (x - 10) + ' ' + (y + 43), class: 'diagram-branch-line' }));
      drawCard(svg, x, y, 198, 86, node, index);
    });
  }

  function drawNeuron(svg) {
    [[72, 68, 155, 110], [58, 134, 155, 124], [82, 205, 155, 140], [112, 37, 166, 104], [112, 228, 166, 148]].forEach(function (line) {
      svg.appendChild(svgEl('line', { x1: line[0], y1: line[1], x2: line[2], y2: line[3], class: 'diagram-neuron-line' }));
    });
    svg.appendChild(svgEl('circle', { cx: 190, cy: 126, r: 48, class: 'diagram-neuron-soma' }));
    svg.appendChild(svgEl('circle', { cx: 190, cy: 126, r: 15, class: 'diagram-neuron-nucleus' }));
    svg.appendChild(svgEl('line', { x1: 238, y1: 126, x2: 708, y2: 126, class: 'diagram-neuron-axon' }));
    [282, 374, 466, 558].forEach(function (x) { svg.appendChild(svgEl('rect', { x: x, y: 104, width: 68, height: 44, rx: 20, class: 'diagram-neuron-myelin' })); });
    [[708, 126, 757, 82], [708, 126, 765, 126], [708, 126, 757, 174]].forEach(function (line) { svg.appendChild(svgEl('line', { x1: line[0], y1: line[1], x2: line[2], y2: line[3], class: 'diagram-neuron-terminal' })); });
    svgText(svg, 92, 26, 'DENDRITAS', 'diagram-label');
    svgText(svg, 190, 196, 'SOMA · INTEGRA', 'diagram-label');
    svgText(svg, 465, 78, 'AXÓN MIELINIZADO · CONDUCE', 'diagram-label');
    svgText(svg, 728, 220, 'TERMINAL · COMUNICA', 'diagram-label');
    drawArrow(svg, 244, 184, 690, 184, 'dirección de la información', 211);
  }

  function drawTriage(svg, definition) {
    (definition.nodes || []).forEach(function (node, index) {
      var y = 52 + index * 50;
      var width = 700 - index * 62;
      svg.appendChild(svgEl('rect', { x: 50, y: y, width: width, height: 38, rx: 10, class: 'diagram-triage-level diagram-triage-' + index }));
      svgText(svg, 69, y + 24, node.title, 'diagram-triage-title', 'start');
      svgText(svg, 330, y + 24, node.detail, 'diagram-triage-detail', 'start');
    });
    if (definition.note) svgText(svg, 400, 318, definition.note, 'diagram-note');
  }

  function drawPathway(svg, definition) {
    drawFlow(svg, Object.assign({}, definition, { note: '' }));
    svg.appendChild(svgEl('rect', { x: 164, y: 244, width: 472, height: 36, rx: 18, class: 'diagram-balance' }));
    svgText(svg, 400, 267, definition.note, 'diagram-balance-text');
  }

  function diagramSvg(definition) {
    var heights = { grid: 310, layers: 285, compare: 270, branch: 280, neuron: 250, triage: 335, pathway: 295 };
    var height = heights[definition.type] || 250;
    var svg = svgEl('svg', {
      viewBox: '0 0 800 ' + height,
      role: 'img',
      'aria-label': definition.title,
      class: 'course-inline-svg diagram-' + definition.type,
      preserveAspectRatio: 'xMidYMid meet'
    });
    svgText(svg, 400, 25, definition.kicker, 'diagram-kicker');
    if (definition.type === 'grid') drawGrid(svg, definition);
    else if (definition.type === 'layers') drawLayers(svg, definition);
    else if (definition.type === 'compare') drawCompare(svg, definition);
    else if (definition.type === 'branch') drawBranch(svg, definition);
    else if (definition.type === 'neuron') drawNeuron(svg);
    else if (definition.type === 'triage') drawTriage(svg, definition);
    else if (definition.type === 'pathway') drawPathway(svg, definition);
    else drawFlow(svg, definition);
    return svg;
  }

  function diagramVisual(definition) {
    if (definition.type !== 'board') return diagramSvg(definition);
    var image = el('img', 'course-inline-image');
    image.src = definition.src;
    image.alt = definition.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function closeDiagramDialog(dialog) {
    document.body.classList.remove('course-diagram-open');
    dialog.classList.remove('is-zoomed');
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function ensureDiagramDialog() {
    var existing = document.getElementById('courseDiagramDialog');
    if (existing) return existing;
    var dialog = el('dialog', 'course-diagram-dialog');
    dialog.id = 'courseDiagramDialog';
    var shell = el('div', 'course-diagram-dialog-shell');
    var header = el('header');
    var copy = el('div');
    copy.appendChild(el('span', '', 'ESQUEMA DE LA CLASE'));
    copy.appendChild(el('strong', '', ''));
    var actions = el('div', 'course-diagram-dialog-actions');
    var zoom = el('button', 'course-diagram-zoom', 'Ampliar');
    zoom.type = 'button';
    zoom.hidden = true;
    zoom.setAttribute('aria-pressed', 'false');
    zoom.setAttribute('aria-label', 'Ampliar la pizarra para leer los detalles');
    var close = el('button', 'course-diagram-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar esquema');
    header.appendChild(copy);
    actions.appendChild(zoom);
    actions.appendChild(close);
    header.appendChild(actions);
    shell.appendChild(header);
    shell.appendChild(el('div', 'course-diagram-dialog-stage'));
    shell.appendChild(el('p', 'course-diagram-dialog-caption', ''));
    dialog.appendChild(shell);
    zoom.addEventListener('click', function () {
      var expanded = dialog.classList.toggle('is-zoomed');
      zoom.setAttribute('aria-pressed', expanded ? 'true' : 'false');
      zoom.textContent = expanded ? 'Ajustar' : 'Ampliar';
      dialog.querySelector('.course-diagram-dialog-stage').scrollTo({ top: 0, left: 0 });
    });
    close.addEventListener('click', function () { closeDiagramDialog(dialog); });
    dialog.addEventListener('cancel', function () { document.body.classList.remove('course-diagram-open'); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) closeDiagramDialog(dialog); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function openDiagram(definition) {
    var dialog = ensureDiagramDialog();
    dialog.classList.toggle('is-teacher-board', definition.type === 'board');
    dialog.classList.remove('is-zoomed');
    var zoom = dialog.querySelector('.course-diagram-zoom');
    zoom.hidden = definition.type !== 'board';
    zoom.textContent = 'Ampliar';
    zoom.setAttribute('aria-pressed', 'false');
    dialog.querySelector('header span').textContent = definition.type === 'board' ? 'PIZARRA DEL PROFESOR · RECONSTRUIDA' : 'ESQUEMA EXPLICATIVO DEL CURSO';
    dialog.querySelector('header strong').textContent = definition.title;
    dialog.querySelector('.course-diagram-dialog-stage').replaceChildren(diagramVisual(definition));
    dialog.querySelector('.course-diagram-dialog-caption').textContent = definition.caption;
    document.body.classList.add('course-diagram-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function diagramFigure(definition, compact) {
    var figure = el('figure', 'course-inline-figure' + (definition.wide ? ' is-wide' : '') + (definition.type === 'board' ? ' is-teacher-board' : '') + (compact ? ' is-summary' : ''));
    var trigger = el('button', 'course-inline-diagram-trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-label', (definition.type === 'board' ? 'Ampliar pizarra: ' : 'Ampliar esquema: ') + definition.title);
    trigger.appendChild(diagramVisual(definition));
    var caption = el('figcaption');
    caption.appendChild(el('strong', '', definition.title));
    caption.appendChild(el('span', '', definition.caption));
    caption.appendChild(el('small', '', definition.type === 'board' ? 'Pizarra del profesor · ampliar' : 'Esquema explicativo · ampliar'));
    figure.appendChild(trigger);
    figure.appendChild(caption);
    trigger.addEventListener('click', function () { openDiagram(definition); });
    return figure;
  }

  function firstParagraph(section) {
    return Array.prototype.slice.call(section.children).find(function (child) {
      return child.tagName === 'P' && !child.classList.contains('course-chapter-step');
    });
  }

  function decorateCourseVisuals(courseRoot, lessonId) {
    if (!courseRoot || courseRoot.dataset.lessonVisuals === 'true') return;
    var definitions = lessonVisuals[lessonId] || [];
    var sections = Array.prototype.slice.call(courseRoot.querySelectorAll('.course-chapter-section'));
    definitions.forEach(function (definition) {
      var target = definition.target ? courseRoot.querySelector(definition.target) : sections[(definition.section || 1) - 1];
      if (!target) return;
      var figure = diagramFigure(definition, false);
      var paragraph = firstParagraph(target);
      if (paragraph) paragraph.insertAdjacentElement('afterend', figure);
      else target.appendChild(figure);
    });
    courseRoot.dataset.lessonVisuals = 'true';
  }

  function addUltraVisual(panel, lessonId) {
    if (!panel || panel.querySelector('.course-inline-figure.is-summary')) return;
    var definition = ultraLessonVisuals[lessonId] || (lessonVisuals[lessonId] || [])[0];
    if (!definition) return;
    var header = panel.querySelector(':scope > header');
    var visual = diagramFigure(definition, true);
    if (header) header.insertAdjacentElement('afterend', visual);
    else panel.prepend(visual);
  }

  function standardizeLessonTabs(panel, nav) {
    if (!nav) return;
    var labels = {
      curso: 'Curso completo',
      rapida: 'Ficha rápida',
      rapido: 'Ficha rápida',
      ultra: 'Ficha ultra rápida',
      training: 'Entrenamiento',
      material: 'Material de la clase',
      ia: 'Recursos IA'
    };
    nav.setAttribute('role', 'tablist');
    nav.querySelectorAll('[data-lesson-tab]').forEach(function (button) {
      var tabId = button.dataset.lessonTab === 'rapido' ? 'rapida' : button.dataset.lessonTab;
      if (button.dataset.lessonTab === 'rapido') button.dataset.lessonTab = tabId;
      button.textContent = labels[tabId] || button.textContent;
      button.setAttribute('role', 'tab');
      button.id = panel.id + '-tab-' + tabId;
      button.setAttribute('aria-controls', panel.id + '-panel-' + tabId);
    });
    panel.querySelectorAll('[data-lesson-tab-panel]').forEach(function (tabPanel) {
      var tabId = tabPanel.dataset.lessonTabPanel === 'rapido' ? 'rapida' : tabPanel.dataset.lessonTabPanel;
      if (tabPanel.dataset.lessonTabPanel === 'rapido') tabPanel.dataset.lessonTabPanel = tabId;
      tabPanel.id = panel.id + '-panel-' + tabId;
      tabPanel.setAttribute('role', 'tabpanel');
      tabPanel.setAttribute('aria-labelledby', panel.id + '-tab-' + tabId);
    });
    if (panel.firstElementChild !== nav) panel.insertBefore(nav, panel.firstElementChild);
  }

  function narrativeCourse(narrative, entry, subjectModel) {
    var article = el('article', 'course-chapter-2026 notebook-course-flow');
    var header = el('header', 'notebook-course-intro');
    header.appendChild(el('span', '', subjectModel.label + ' · ' + entry.lesson.dateLong));
    header.appendChild(el('h3', '', narrative.title));
    header.appendChild(el('p', '', narrative.lead));
    article.appendChild(header);

    var body = el('div', 'course-chapter-body');
    narrative.sections.forEach(function (section, sectionIndex) {
      var sectionNode = el('section', 'course-chapter-section');
      sectionNode.id = entry.lesson.id + '-section-' + (sectionIndex + 1);
      sectionNode.appendChild(el('p', 'course-chapter-step', String(sectionIndex + 1).padStart(2, '0') + ' · ' + section[0].toUpperCase()));
      sectionNode.appendChild(el('h4', '', section[1]));
      section.slice(2).forEach(function (paragraph) { sectionNode.appendChild(el('p', '', paragraph)); });
      body.appendChild(sectionNode);
    });
    article.appendChild(body);
    decorateCourseVisuals(article, entry.lesson.id);
    return article;
  }

  function cleanReviewText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function firstReviewSentence(value) {
    var text = cleanReviewText(value);
    var sentence = text.match(/^.*?[.!?](?:\s|$)/);
    return sentence ? sentence[0].trim() : text;
  }

  function reviewText(spanish, portuguese) {
    var i18n = window.MedNykutoClassI18n;
    return i18n && typeof i18n.getLang === 'function' && i18n.getLang() === 'br' ? portuguese : spanish;
  }

  function outlineFromNarrative(narrative) {
    if (!narrative || !Array.isArray(narrative.sections)) return [];
    return narrative.sections.map(function (section, index) {
      return {
        number: index + 1,
        label: cleanReviewText(section[0]),
        title: cleanReviewText(section[1]),
        explanation: cleanReviewText(section[2]),
        consequence: cleanReviewText(section[3])
      };
    });
  }

  function outlineFromCourse(courseRoot) {
    if (!courseRoot) return [];
    return Array.prototype.slice.call(courseRoot.querySelectorAll('.course-chapter-section')).map(function (section, index) {
      var step = section.querySelector('.course-chapter-step');
      var title = section.querySelector('h4');
      var paragraphs = Array.prototype.slice.call(section.children).filter(function (child) {
        return child.tagName === 'P' && !child.classList.contains('course-chapter-step');
      });
      return {
        number: index + 1,
        label: cleanReviewText(step ? step.textContent.replace(/^\s*\d+\s*[·.–—-]\s*/, '') : 'Idea ' + (index + 1)),
        title: cleanReviewText(title ? title.textContent : 'Idea esencial'),
        explanation: cleanReviewText(paragraphs[0] ? paragraphs[0].textContent : ''),
        consequence: cleanReviewText(paragraphs[1] ? paragraphs[1].textContent : '')
      };
    });
  }

  function sampledOutline(outline, count) {
    if (outline.length <= count) return outline.slice();
    var result = [];
    for (var index = 0; index < count; index += 1) {
      var position = Math.round(index * (outline.length - 1) / (count - 1));
      if (result.indexOf(outline[position]) < 0) result.push(outline[position]);
    }
    return result;
  }

  function existingReviewAnchors(sourcePanel, ultra) {
    if (!sourcePanel) return [];
    if (ultra) {
      return Array.prototype.slice.call(sourcePanel.querySelectorAll('.ultra-sheet li, .notebook-ultra-sheet li')).map(function (item) {
        return cleanReviewText(item.textContent);
      }).filter(Boolean);
    }
    return Array.prototype.slice.call(sourcePanel.querySelectorAll('.quick-sheet article, .notebook-quick-sheet li')).map(function (item) {
      var label = item.querySelector('span');
      var title = item.querySelector('strong');
      var detail = item.querySelector('small, p');
      return {
        label: cleanReviewText(label ? label.textContent : ''),
        title: cleanReviewText(title ? title.textContent : item.textContent),
        detail: cleanReviewText(detail ? detail.textContent : '')
      };
    }).filter(function (item) { return item.title; });
  }

  function appendReviewHeader(panel, ultra, lead) {
    var header = el('header', 'notebook-sheet-head');
    header.appendChild(el('span', '', ultra ? reviewText('FICHA ULTRA RÁPIDA · 90 S', 'FICHA ULTRARRÁPIDA · 90 S') : reviewText('FICHA RÁPIDA · 5 MIN', 'FICHA RÁPIDA · 5 MIN')));
    header.appendChild(el('h3', '', ultra ? reviewText('Una imagen, cuatro pasos, cero confusión', 'Uma imagem, quatro passos, sem confusão') : reviewText('La clase convertida en una ficha de estudio', 'A aula transformada em ficha de estudo')));
    header.appendChild(el('p', '', ultra ? reviewText('Mira el esquema, sigue los cuatro pasos y recita la ruta sin volver al curso.', 'Observe o esquema, siga os quatro passos e recite a rota sem voltar à aula.') : lead));
    panel.appendChild(header);
  }

  function reviewRoute(outline) {
    var route = el('section', 'notebook-review-route');
    route.setAttribute('aria-label', reviewText('Ruta de la clase', 'Rota da aula'));
    route.appendChild(el('span', '', reviewText('RUTA DEL CURSO', 'ROTA DA AULA')));
    var list = el('ol');
    outline.forEach(function (item, index) {
      var row = el('li');
      row.appendChild(el('b', '', String(index + 1).padStart(2, '0')));
      row.appendChild(el('strong', '', item.label));
      list.appendChild(row);
    });
    route.appendChild(list);
    return route;
  }

  function derivedQuickAnchors(outline) {
    return sampledOutline(outline, 4).map(function (item) {
      return { label: item.label, title: item.title, detail: firstReviewSentence(item.consequence || item.explanation) };
    });
  }

  function quickReviewPanel(outline, entry, lead, anchors) {
    var panel = el('div', 'notebook-summary notebook-review-sheet');
    panel.dataset.lessonReview = 'standard';
    appendReviewHeader(panel, false, lead);
    panel.appendChild(reviewRoute(outline));

    var layout = el('div', 'notebook-review-layout');
    var core = el('section', 'notebook-review-core');
    var coreHeading = el('header', 'notebook-review-section-title');
    coreHeading.appendChild(el('span', '', reviewText('RESUMEN RAZONADO', 'RESUMO RACIOCINADO')));
    coreHeading.appendChild(el('h4', '', reviewText('Mecanismo primero; consecuencia después', 'Primeiro o mecanismo; depois a consequência')));
    core.appendChild(coreHeading);
    var cards = el('div', 'notebook-review-cards');
    outline.forEach(function (item, index) {
      var card = el('article', 'notebook-review-card');
      card.appendChild(el('span', '', String(index + 1).padStart(2, '0') + ' · ' + item.label));
      card.appendChild(el('strong', '', item.title));
      card.appendChild(el('p', '', firstReviewSentence(item.explanation)));
      var consequence = el('small');
      consequence.appendChild(el('b', '', reviewText('POR QUÉ IMPORTA · ', 'POR QUE IMPORTA · ')));
      consequence.appendChild(document.createTextNode(firstReviewSentence(item.consequence || item.explanation)));
      card.appendChild(consequence);
      cards.appendChild(card);
    });
    core.appendChild(cards);
    layout.appendChild(core);

    var side = el('aside', 'notebook-review-memory');
    side.appendChild(el('span', '', reviewText('ANCLAS DE EXAMEN', 'ÂNCORAS DE PROVA')));
    side.appendChild(el('h4', '', reviewText('Lo que debes poder decir sin leer', 'O que você deve conseguir dizer sem ler')));
    var anchorList = el('ul');
    (anchors.length ? anchors : derivedQuickAnchors(outline)).slice(0, 6).forEach(function (anchor) {
      var item = el('li');
      if (anchor.label) item.appendChild(el('span', '', anchor.label));
      item.appendChild(el('strong', '', anchor.title));
      if (anchor.detail) item.appendChild(el('small', '', anchor.detail));
      anchorList.appendChild(item);
    });
    side.appendChild(anchorList);

    var sample = sampledOutline(outline, 4);
    var recall = el('div', 'notebook-review-recall');
    recall.appendChild(el('span', '', reviewText('PRUEBA SIN MIRAR', 'TESTE SEM OLHAR')));
    recall.appendChild(el('strong', '', outline.length > 1 ? reviewText('¿Puedes unir «' + outline[0].label + '» con «' + outline[outline.length - 1].label + '» sin saltar el mecanismo?', 'Você consegue ligar «' + outline[0].label + '» a «' + outline[outline.length - 1].label + '» sem pular o mecanismo?') : reviewText('¿Puedes explicar esta idea sin leer?', 'Você consegue explicar esta ideia sem ler?')));
    recall.appendChild(el('small', '', reviewText('Recorre: ', 'Percorra: ') + sample.map(function (item) { return item.label; }).join(' → ')));
    side.appendChild(recall);
    layout.appendChild(side);
    panel.appendChild(layout);
    return panel;
  }

  function derivedUltraRules(outline) {
    return sampledOutline(outline, 5).map(function (item) {
      return firstReviewSentence(item.consequence || item.explanation);
    }).filter(Boolean);
  }

  function ultraReviewPanel(outline, entry, lead, rules) {
    var panel = el('div', 'notebook-ultra notebook-review-sheet notebook-review-sheet-ultra');
    panel.dataset.lessonReview = 'standard';
    appendReviewHeader(panel, true, lead);
    addUltraVisual(panel, entry.lesson.id);

    var scan = el('div', 'notebook-ultra-scan');
    var path = el('section', 'notebook-ultra-path');
    path.appendChild(el('span', '', reviewText('LECTURA EN CUATRO PASOS', 'LEITURA EM QUATRO PASSOS')));
    var pathList = el('ol');
    sampledOutline(outline, 4).forEach(function (item, index) {
      var row = el('li');
      row.appendChild(el('b', '', String(index + 1).padStart(2, '0')));
      var copy = el('div');
      copy.appendChild(el('strong', '', item.label));
      copy.appendChild(el('small', '', item.title));
      row.appendChild(copy);
      pathList.appendChild(row);
    });
    path.appendChild(pathList);
    scan.appendChild(path);

    var limits = el('aside', 'notebook-ultra-rules');
    limits.appendChild(el('span', '', reviewText('NO CONFUNDAS', 'NÃO CONFUNDA')));
    limits.appendChild(el('h4', '', reviewText('Los límites que cambian la respuesta', 'Os limites que mudam a resposta')));
    var ruleList = el('ul');
    (rules.length ? rules : derivedUltraRules(outline)).slice(0, 5).forEach(function (rule) {
      ruleList.appendChild(el('li', '', rule));
    });
    limits.appendChild(ruleList);
    scan.appendChild(limits);
    panel.appendChild(scan);

    var route = sampledOutline(outline, 4).map(function (item) { return item.label; }).join(' → ');
    var close = el('p', 'notebook-ultra-close');
    close.appendChild(el('span', '', reviewText('CIERRA LA FICHA Y RECITA', 'FECHE A FICHA E RECITE')));
    close.appendChild(el('strong', '', route));
    panel.appendChild(close);
    return panel;
  }

  function summaryPanel(narrative, ultra, entry, courseRoot, sourcePanel) {
    var outline = outlineFromCourse(courseRoot);
    if (!outline.length) outline = outlineFromNarrative(narrative);
    var courseLead = courseRoot && courseRoot.querySelector(':scope > header p');
    var lead = cleanReviewText(courseLead ? courseLead.textContent : (narrative && narrative.lead));
    var anchors = existingReviewAnchors(sourcePanel, ultra);
    return ultra ? ultraReviewPanel(outline, entry, lead, anchors) : quickReviewPanel(outline, entry, lead, anchors);
  }

  function buildLegacyLesson(panel, narrative, entry, subjectModel, teacher) {
    var original = el('div', 'notebook-original-material');
    Array.prototype.slice.call(panel.children).forEach(function (child) { original.appendChild(child); });
    var practice = original.querySelector('.practice-module[data-practice-root="' + entry.lesson.practiceId + '"]') || original.querySelector('.practice-module');

    var nav = el('nav', 'lesson-section-tabs notebook-lesson-tabs');
    nav.dataset.lessonTabs = '';
    nav.setAttribute('aria-label', 'Formatos de la clase');
    var definitions = [
      ['curso', 'Curso completo'],
      ['rapida', 'Ficha rápida'],
      ['ultra', 'Ficha ultra rápida'],
      ['training', 'Entrenamiento'],
      ['material', 'Material de la clase'],
      ['ia', 'Recursos IA']
    ];
    definitions.forEach(function (definition, index) {
      var button = el('button', '', definition[1]);
      button.type = 'button';
      button.dataset.lessonTab = definition[0];
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      nav.appendChild(button);
    });

    var panels = [];
    function tabPanel(id, content) {
      var tab = el('section', id === 'curso' ? 'lesson-tab-panel course-chapter-2026' : 'lesson-tab-panel');
      tab.dataset.lessonTabPanel = id;
      if (id !== 'curso') tab.hidden = true;
      tab.appendChild(content);
      panels.push(tab);
      return tab;
    }

    var course = narrativeCourse(narrative, entry, subjectModel);
    panel.replaceChildren(nav);
    panel.appendChild(tabPanel('curso', course));
    panel.appendChild(tabPanel('rapida', summaryPanel(narrative, false, entry, course, null)));
    panel.appendChild(tabPanel('ultra', summaryPanel(narrative, true, entry, course, null)));

    var training = el('div', 'notebook-training');
    if (practice) training.appendChild(practice);
    else training.appendChild(el('p', 'notebook-empty', 'El entrenamiento de esta clase todavía no está disponible.'));
    panel.appendChild(tabPanel('training', training));

    var material = el('div', 'notebook-material');
    material.appendChild(el('p', 'notebook-material-intro', 'Material original, pizarras, correcciones y referencias conservados sin mezclar fechas.'));
    material.appendChild(original);
    panel.appendChild(tabPanel('material', material));
    panel.appendChild(tabPanel('ia', teacherAuditContent(teacher, entry.lesson)));
    panel.dataset.notebookNarrative = 'true';
    panel.classList.add('lesson-notebook-standard');
    if (!panel.style.getPropertyValue('--lesson-accent') && teacher && teacher.accent) panel.style.setProperty('--lesson-accent', teacher.accent);
    standardizeLessonTabs(panel, nav);
    wireLessonTabs(nav, panels);
  }

  function enhanceNarrativeLesson(panel, entry, teacher) {
    panel.querySelectorAll('.course-chapter-index, .notebook-course-index').forEach(function (index) { index.remove(); });
    var nav = panel.querySelector('[data-lesson-tabs]');
    standardizeLessonTabs(panel, nav);
    var course = panel.querySelector('[data-lesson-tab-panel="curso"]');
    var quick = panel.querySelector('[data-lesson-tab-panel="rapida"]');
    var ultra = panel.querySelector('[data-lesson-tab-panel="ultra"]');
    decorateCourseVisuals(course, entry.lesson.id);
    var quickReview = quick ? summaryPanel(null, false, entry, course, quick) : null;
    var ultraReview = ultra ? summaryPanel(null, true, entry, course, ultra) : null;
    if (quickReview) quick.replaceChildren(quickReview);
    if (ultraReview) ultra.replaceChildren(ultraReview);
    var ia = panel.querySelector('[data-lesson-tab-panel="ia"]');
    if (ia) ia.replaceChildren(teacherAuditContent(teacher, entry.lesson));
    panel.dataset.notebookNarrative = 'true';
    panel.classList.add('lesson-notebook-standard');
    if (!panel.style.getPropertyValue('--lesson-accent') && teacher && teacher.accent) panel.style.setProperty('--lesson-accent', teacher.accent);
  }

  function enhanceManagedLesson(panel, entry, teacher) {
    var nav = panel.querySelector('[data-lesson-tabs]');
    if (!nav) return;
    standardizeLessonTabs(panel, nav);
    var panels = Array.prototype.slice.call(panel.querySelectorAll('[data-lesson-tab-panel]'));
    var ia = panel.querySelector('[data-lesson-tab-panel="ia"]');
    if (ia && teacher) ia.replaceChildren(teacherAuditContent(teacher, entry.lesson));
    panel.dataset.notebookManaged = 'true';
    panel.classList.add('lesson-notebook-standard');
    if (!panel.style.getPropertyValue('--lesson-accent') && teacher && teacher.accent) panel.style.setProperty('--lesson-accent', teacher.accent);
    wireLessonTabs(nav, panels);
  }

  function collectFiles(subject) {
    var seen = {};
    return Array.prototype.slice.call(subject.querySelectorAll('a[href]')).map(function (link) {
      var href = link.getAttribute('href') || '';
      if (!/\.(?:pdf|pptx|docx)(?:$|[?#])/i.test(href) || seen[href]) return null;
      seen[href] = true;
      var name = href.split('?')[0].split('#')[0].split('/').pop();
      try { name = decodeURIComponent(name); } catch (error) {}
      var label = (link.textContent || '').trim();
      if (!label || /^(abrir|descargar|ver)/i.test(label)) label = name;
      return { href: href, label: label, type: (name.split('.').pop() || 'archivo').toUpperCase() };
    }).filter(Boolean);
  }

  function renderThemes(panel, subjectModel, selectLesson) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'MAPA DEL CURSO'));
    header.appendChild(el('h3', '', 'Temas por capítulo'));
    panel.appendChild(header);
    var list = el('div', 'notebook-chapter-list');
    subjectModel.chapters.forEach(function (chapter) {
      var group = el('section', 'notebook-chapter-row');
      var heading = el('div');
      heading.appendChild(el('span', '', 'CAP. ' + chapter.number + ' · ' + statusLabel(chapter.status).toUpperCase()));
      heading.appendChild(el('strong', '', chapter.title));
      group.appendChild(heading);
      var lessons = el('div');
      chapter.lessons.forEach(function (lesson) {
        var button = el('button');
        button.type = 'button';
        button.appendChild(el('time', '', lesson.date));
        button.appendChild(el('span', '', lesson.title));
        button.addEventListener('click', function () { selectLesson(lesson.id, true); });
        lessons.appendChild(button);
      });
      group.appendChild(lessons);
      list.appendChild(group);
    });
    panel.appendChild(list);
  }

  function renderFiles(panel, files) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'DOCUMENTOS DE LA MATERIA'));
    header.appendChild(el('h3', '', 'Archivos'));
    panel.appendChild(header);
    var list = el('div', 'notebook-file-list');
    if (!files.length) list.appendChild(el('p', 'notebook-empty', 'No hay archivos descargables en esta materia.'));
    files.forEach(function (file) {
      var row = el('a', 'notebook-file-row');
      row.href = file.href;
      row.target = '_blank';
      row.rel = 'noopener';
      row.appendChild(el('span', '', file.type));
      row.appendChild(el('strong', '', file.label));
      row.appendChild(el('b', '', '↗'));
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  function renderProgress(panel, subjectId, subjectModel) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'SEGUIMIENTO PERSONAL'));
    header.appendChild(el('h3', '', 'Progreso del cuaderno'));
    panel.appendChild(header);
    var state = readProgress();
    var subjectState = state[subjectId] || {};
    var flat = flattenLessons(subjectModel);
    var summary = el('p', 'notebook-progress-summary');
    var meter = el('div', 'notebook-progress-meter');
    meter.appendChild(el('i'));
    panel.appendChild(summary);
    panel.appendChild(meter);
    var list = el('div', 'notebook-progress-list');
    function refresh() {
      var done = flat.filter(function (entry) { return Boolean(subjectState[entry.lesson.id]); }).length;
      summary.textContent = done + ' de ' + flat.length + ' clases revisadas';
      meter.firstChild.style.width = Math.round((done / flat.length) * 100) + '%';
      state[subjectId] = subjectState;
      writeProgress(state);
    }
    subjectModel.chapters.forEach(function (chapter) {
      var chapterLabel = el('span', 'notebook-progress-chapter', 'CAP. ' + chapter.number + ' · ' + chapter.title);
      list.appendChild(chapterLabel);
      chapter.lessons.forEach(function (lesson) {
        var row = el('label', 'notebook-progress-row');
        var checkbox = el('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(subjectState[lesson.id]);
        var copy = el('span');
        copy.appendChild(el('strong', '', lesson.date + ' · ' + lesson.title));
        copy.appendChild(el('small', '', checkbox.checked ? 'Revisada' : 'Pendiente'));
        checkbox.addEventListener('change', function () {
          subjectState[lesson.id] = checkbox.checked;
          copy.querySelector('small').textContent = checkbox.checked ? 'Revisada' : 'Pendiente';
          refresh();
        });
        row.appendChild(checkbox);
        row.appendChild(copy);
        list.appendChild(row);
      });
    });
    panel.appendChild(list);
    refresh();
  }

  function prepareNutrition(subject) {
    if (document.getElementById('nutricion-2026-08-13')) return;
    var panel = el('div', 'dated-lesson-panel lesson-notebook-generated');
    panel.id = 'nutricion-2026-08-13';
    panel.dataset.lessonPanel = panel.id;
    panel.dataset.lessonTitle = 'Leyes de la alimentación y evaluación del paciente';
    var excluded = ['subject-heading', 'class-history', 'course-workspace', 'course-workspace-panel'];
    Array.prototype.slice.call(subject.children).forEach(function (child) {
      if (!excluded.some(function (name) { return child.classList.contains(name); })) panel.appendChild(child);
    });
    subject.appendChild(panel);
  }

  function initSubject(subjectId) {
    var subject = document.getElementById(subjectId);
    var subjectModel = model.subjects[subjectId];
    if (!subject || !subjectModel) return;

    subject.querySelectorAll(':scope > .course-workspace, :scope > .course-workspace-panel').forEach(function (node) { node.remove(); });
    if (subjectId === 'nutricion') prepareNutrition(subject);
    var files = collectFiles(subject);
    var flat = flattenLessons(subjectModel);
    var teacher = model.teachers[subjectModel.teacherId];

    flat.forEach(function (entry) {
      var panel = document.getElementById(entry.lesson.id);
      if (!panel) return;
      var narrative = model.narratives[entry.lesson.id];
      if (entry.lesson.managedContent || panel.dataset.managedLesson === 'true') enhanceManagedLesson(panel, entry, teacher);
      else if (narrative) buildLegacyLesson(panel, narrative, entry, subjectModel, teacher);
      else enhanceNarrativeLesson(panel, entry, teacher);
    });

    var heading = subject.querySelector(':scope > .subject-heading');
    var historyStrip = subject.querySelector(':scope > .class-history');
    if (historyStrip) historyStrip.hidden = true;

    var shell = el('section', 'notebook-shell');
    shell.setAttribute('aria-label', 'Cuaderno cronológico de ' + subjectModel.label);
    var cover = el('header', 'notebook-cover');
    var coverCopy = el('div');
    coverCopy.appendChild(el('span', 'notebook-kicker', subjectModel.label));
    coverCopy.appendChild(el('h2', '', 'Cuaderno'));
    coverCopy.appendChild(el('p', 'notebook-current-title', ''));
    var chapterStatus = el('div', 'notebook-chapter-current');
    cover.appendChild(coverCopy);
    cover.appendChild(chapterStatus);
    shell.appendChild(cover);

    var modes = el('nav', 'notebook-modes');
    modes.setAttribute('aria-label', 'Vistas de la materia');
    [['cuaderno', 'Cuaderno'], ['temas', 'Temas'], ['archivos', 'Archivos'], ['progreso', 'Progreso']].forEach(function (mode) {
      var button = el('button', '', mode[1]);
      button.type = 'button';
      button.dataset.notebookMode = mode[0];
      button.setAttribute('aria-selected', mode[0] === 'cuaderno' ? 'true' : 'false');
      modes.appendChild(button);
    });
    shell.appendChild(modes);

    var dateControls = el('div', 'notebook-date-controls');
    var previous = el('button', 'notebook-date-arrow', '‹');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Clase anterior');
    var rail = el('div', 'notebook-date-rail');
    var next = el('button', 'notebook-date-arrow', '›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Clase siguiente');
    dateControls.appendChild(previous);
    dateControls.appendChild(rail);
    dateControls.appendChild(next);
    shell.appendChild(dateControls);

    flat.forEach(function (entry) {
      var button = el('button', 'notebook-date');
      button.type = 'button';
      button.dataset.lessonId = entry.lesson.id;
      button.appendChild(el('small', '', 'CAP. ' + entry.chapter.number));
      button.appendChild(el('strong', '', entry.lesson.date));
      button.setAttribute('aria-label', entry.lesson.dateLong + ' · ' + entry.lesson.title);
      rail.appendChild(button);
    });

    var viewPanel = el('section', 'notebook-view-panel');
    viewPanel.hidden = true;
    if (heading) heading.insertAdjacentElement('afterend', shell);
    else subject.prepend(shell);
    shell.insertAdjacentElement('afterend', viewPanel);

    Array.prototype.slice.call(subject.children).forEach(function (child) {
      if (child === heading || child === shell || child === viewPanel || child.hasAttribute('data-lesson-panel') || child.hasAttribute('data-notebook-persistent')) return;
      child.hidden = true;
      child.dataset.notebookLegacy = 'true';
    });

    function showLesson(lessonId, updateHash) {
      var selected = findLesson(subjectModel, lessonId) || flat[flat.length - 1];
      if (!selected) return;
      activeLessonBySubject[subjectId] = selected.lesson.id;
      subject.querySelectorAll(':scope > [data-lesson-panel]').forEach(function (panel) {
        panel.hidden = panel.id !== selected.lesson.id || activeModeBySubject[subjectId] !== 'cuaderno';
      });
      rail.querySelectorAll('.notebook-date').forEach(function (button) {
        var active = button.dataset.lessonId === selected.lesson.id;
        button.setAttribute('aria-current', active ? 'date' : 'false');
        if (active) button.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      cover.querySelector('.notebook-current-title').textContent = selected.lesson.dateLong + ' · ' + selected.lesson.title;
      chapterStatus.replaceChildren();
      chapterStatus.appendChild(el('span', '', 'CAPÍTULO ' + selected.chapter.number));
      chapterStatus.appendChild(el('strong', '', selected.chapter.title));
      chapterStatus.appendChild(el('small', 'chapter-state chapter-state-' + selected.chapter.status, statusLabel(selected.chapter.status)));
      var index = flat.findIndex(function (entry) { return entry.lesson.id === selected.lesson.id; });
      previous.disabled = index <= 0;
      next.disabled = index >= flat.length - 1;
      if (updateHash) window.history.replaceState(null, '', '#' + selected.lesson.id);
    }

    function activateMode(mode) {
      activeModeBySubject[subjectId] = mode;
      modes.querySelectorAll('button').forEach(function (button) {
        button.setAttribute('aria-selected', button.dataset.notebookMode === mode ? 'true' : 'false');
      });
      dateControls.hidden = mode !== 'cuaderno';
      viewPanel.hidden = mode === 'cuaderno';
      subject.querySelectorAll(':scope > [data-lesson-panel]').forEach(function (panel) { panel.hidden = true; });
      if (mode === 'cuaderno') showLesson(activeLessonBySubject[subjectId], false);
      if (mode === 'temas') renderThemes(viewPanel, subjectModel, function (lessonId) { activateMode('cuaderno'); showLesson(lessonId, true); });
      if (mode === 'archivos') renderFiles(viewPanel, files);
      if (mode === 'progreso') renderProgress(viewPanel, subjectId, subjectModel);
    }

    rail.querySelectorAll('.notebook-date').forEach(function (button) {
      button.addEventListener('click', function () { activateMode('cuaderno'); showLesson(button.dataset.lessonId, true); });
    });
    previous.addEventListener('click', function () {
      var index = flat.findIndex(function (entry) { return entry.lesson.id === activeLessonBySubject[subjectId]; });
      if (index > 0) showLesson(flat[index - 1].lesson.id, true);
    });
    next.addEventListener('click', function () {
      var index = flat.findIndex(function (entry) { return entry.lesson.id === activeLessonBySubject[subjectId]; });
      if (index < flat.length - 1) showLesson(flat[index + 1].lesson.id, true);
    });
    modes.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('click', function () { activateMode(button.dataset.notebookMode); });
    });

    var hashLesson = findLesson(subjectModel, window.location.hash.slice(1));
    activeModeBySubject[subjectId] = 'cuaderno';
    showLesson(hashLesson ? hashLesson.lesson.id : flat[flat.length - 1].lesson.id, false);
    subject.classList.add('notebook-ready');
    if (window.MedNykutoClassI18n && typeof window.MedNykutoClassI18n.refresh === 'function') window.MedNykutoClassI18n.refresh(subject);
  }

  function syncHash() {
    var lessonId = window.location.hash.slice(1);
    Object.keys(model.subjects).some(function (subjectId) {
      var entry = findLesson(model.subjects[subjectId], lessonId);
      if (!entry) return false;
      var subject = document.getElementById(subjectId);
      if (!subject || !subject.classList.contains('notebook-ready')) return true;
      var date = subject.querySelector('.notebook-date[data-lesson-id="' + lessonId + '"]');
      if (date) date.click();
      return true;
    });
  }

  function revealSubject(subject) {
    document.querySelectorAll('[data-view]').forEach(function (panel) {
      panel.hidden = panel.dataset.view !== 'cursos';
    });
    var hub = document.getElementById('materias');
    if (hub) hub.hidden = false;
    document.querySelectorAll('.subject-section[data-view="cursos"]').forEach(function (section) {
      section.hidden = section !== subject;
    });
    document.querySelectorAll('[data-view-link]').forEach(function (link) {
      if (link.dataset.viewLink === 'cursos') link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-course-target]').forEach(function (link) {
      link.setAttribute('aria-current', link.dataset.courseTarget === subject.id ? 'true' : 'false');
    });
    document.body.dataset.activeView = 'cursos';
  }

  function revealDeepTarget() {
    var hashId = window.location.hash.slice(1);
    if (!hashId) return;
    var target = document.getElementById(hashId);
    if (!target) return;
    var lessonPanel = target.closest('[data-lesson-panel]');
    var subject = target.closest('.subject-section');
    if (!subject || !subject.classList.contains('notebook-ready')) return;
    revealSubject(subject);
    if (!lessonPanel) {
      window.history.replaceState(null, '', '#' + hashId);
      window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start', inline: 'nearest' }); });
      return;
    }
    var date = subject.querySelector('.notebook-date[data-lesson-id="' + lessonPanel.id + '"]');
    if (date) date.click();
    var tab = 'curso';
    if (target.closest('.notebook-original-material')) tab = 'material';
    if (target.closest('.practice-module')) tab = 'training';
    var tabButton = lessonPanel.querySelector('[data-lesson-tab="' + tab + '"]');
    if (tabButton) tabButton.click();
    var legacyDetail = target.matches('[data-course-detail]') ? target : target.closest('[data-course-detail]');
    if (legacyDetail) {
      legacyDetail.hidden = false;
      var legacyToggle = lessonPanel.querySelector('[data-detail-toggle][aria-controls="' + legacyDetail.id + '"]');
      if (legacyToggle) legacyToggle.setAttribute('aria-expanded', 'true');
    }
    window.history.replaceState(null, '', '#' + hashId);
    window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start', inline: 'nearest' }); });
  }

  function handleHash() {
    syncHash();
    revealDeepTarget();
  }

  function init() {
    Object.keys(model.subjects).forEach(initSubject);
    window.addEventListener('hashchange', handleHash);
    document.documentElement.classList.add('academic-notebook-ready');
    revealDeepTarget();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
