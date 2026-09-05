(function (root, factory) {
  'use strict';

  var api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.MedNykutoS4CourseThemes = api;
    if (root.MedNykutoS4LearningModel) {
      api.install(root.MedNykutoS4LearningModel);
    }
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  var VERSION = 'v182';
  var SCHEMA_VERSION = 1;
  var UPDATED_AT = '2026-08-31';
  var REFORMULATION = 'REFORMULACIÓN NYKUTO';
  var CONTRIBUTIONS = ['foundation', 'repetition', 'precision', 'example', 'extension', 'divergence'];
  var UPDATE_KINDS = ['repetition', 'precision', 'example', 'new-notion', 'new-chapter', 'new-theme', 'divergence'];
  var THEME_MODES = [
    { id: 'course', label: { es: 'Curso', pt: 'Curso' } },
    { id: 'sessions', label: { es: 'Clases', pt: 'Aulas' } },
    { id: 'training', label: { es: 'Entrenar', pt: 'Treinar' } },
    { id: 'documents', label: { es: 'Documentos', pt: 'Documentos' } }
  ];

  /* Seed dates stay explicit because two historical ids are deliberately
     non-date-shaped. Future contributions may use an explicit source date or,
     as a final ordering fallback, an ISO date embedded in their lesson id. */
  var LESSON_UPDATED_AT = {
    'nutricion-2026-08-13': '2026-08-13',
    'nutricion-2026-08-27': '2026-08-27',
    'fisiologia-2026-08-10': '2026-08-10',
    'fisiologia-2026-08-13': '2026-08-13',
    'fisiologia-2026-08-17': '2026-08-17',
    'fisiologia-2026-08-20': '2026-08-20',
    'fisiologia-2026-08-24': '2026-08-24',
    'fisiologia-2026-08-27': '2026-08-27',
    'bioquimica-2026-08-14': '2026-08-14',
    'bioquimica-2026-08-19': '2026-08-19',
    'bioquimica-2026-08-21': '2026-08-21',
    'bioquimica-2026-08-26': '2026-08-26',
    'bioquimica-2026-08-28': '2026-08-28',
    'epidemiologia-bloque-anterior': '2026-08-12',
    'epidemiologia-2026-08-19': '2026-08-19',
    'epidemiologia-2026-08-26': '2026-08-26',
    'epidemiologia-2026-08-28': '2026-08-28',
    'microbiologia-teorica-2026-08-10': '2026-08-10',
    'microbiologia-teorica-2026-08-17': '2026-08-17',
    'microbiologia-teorica-2026-08-24': '2026-08-24',
    'microbiologia-practica-anterior': '2026-08-13',
    'microbiologia-practica-2026-08-20': '2026-08-20',
    'microbiologia-practica-2026-08-27': '2026-08-27'
  };

  var EXPECTED_SECTIONS_BY_LESSON = {
    'nutricion-2026-08-13': 6,
    'nutricion-2026-08-27': 8,
    'fisiologia-2026-08-10': 7,
    'fisiologia-2026-08-13': 7,
    'fisiologia-2026-08-17': 8,
    'fisiologia-2026-08-20': 6,
    'fisiologia-2026-08-24': 7,
    'fisiologia-2026-08-27': 8,
    'bioquimica-2026-08-14': 8,
    'bioquimica-2026-08-19': 6,
    'bioquimica-2026-08-21': 6,
    'bioquimica-2026-08-26': 10,
    'bioquimica-2026-08-28': 12,
    'epidemiologia-bloque-anterior': 8,
    'epidemiologia-2026-08-19': 9,
    'epidemiologia-2026-08-26': 10,
    'epidemiologia-2026-08-28': 12,
    'microbiologia-teorica-2026-08-10': 8,
    'microbiologia-teorica-2026-08-17': 6,
    'microbiologia-teorica-2026-08-24': 11,
    'microbiologia-practica-anterior': 7,
    'microbiologia-practica-2026-08-20': 7,
    'microbiologia-practica-2026-08-27': 8
  };

  function localized(es, pt) {
    return { es: es, pt: pt };
  }

  function uniqueStrings(items) {
    var seen = {};
    return (items || []).filter(function (item) {
      if (typeof item !== 'string' || !item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  function uniqueIndices(items) {
    var seen = {};
    return (items || []).filter(function (item) {
      return Number.isInteger(item) && item >= 0 && !seen[item] && (seen[item] = true);
    }).sort(function (left, right) { return left - right; });
  }

  function maxUpdatedAt(items, fallback) {
    return (items || []).reduce(function (latest, item) {
      var value = item && item.updatedAt;
      return value && value > latest ? value : latest;
    }, fallback || '');
  }

  function sessionDateForLesson(lessonId, sessionUpdatedAt) {
    var explicit = sessionUpdatedAt && sessionUpdatedAt[lessonId];
    if (explicit && typeof explicit === 'object') explicit = explicit.updatedAt || explicit.date;
    if (typeof explicit === 'string' && /^\d{4}-\d{2}-\d{2}/.test(explicit)) return explicit;
    if (LESSON_UPDATED_AT[lessonId]) return LESSON_UPDATED_AT[lessonId];
    var matchedDate = String(lessonId || '').match(/\d{4}-\d{2}-\d{2}/);
    return matchedDate ? matchedDate[0] : '';
  }

  function chronologicalLessonIds(items, sessionUpdatedAt) {
    return uniqueStrings(items).sort(function (left, right) {
      var leftDate = sessionDateForLesson(left, sessionUpdatedAt);
      var rightDate = sessionDateForLesson(right, sessionUpdatedAt);
      if (leftDate !== rightDate) return leftDate < rightDate ? -1 : 1;
      return left < right ? -1 : (left > right ? 1 : 0);
    });
  }

  function sourceRef(lessonId, sectionIndices, contribution) {
    if (!LESSON_UPDATED_AT[lessonId]) throw new Error('Unknown seed lesson: ' + lessonId);
    if (CONTRIBUTIONS.indexOf(contribution) === -1) throw new Error('Unknown contribution: ' + contribution);
    return {
      lessonId: lessonId,
      sectionIndices: uniqueIndices(sectionIndices),
      contribution: contribution,
      sourceStatus: REFORMULATION,
      revision: 1,
      updatedAt: LESSON_UPDATED_AT[lessonId]
    };
  }

  function notion(id, es, pt, refs) {
    var sourceRefs = refs.slice();
    return {
      id: id,
      label: localized(es, pt),
      revision: 1,
      updatedAt: maxUpdatedAt(sourceRefs, ''),
      sourceStatus: REFORMULATION,
      sourceRefs: sourceRefs,
      repetitions: [],
      precisions: [],
      examples: [],
      divergences: [],
      updates: []
    };
  }

  function chapter(id, es, pt, notions) {
    return {
      id: id,
      label: localized(es, pt),
      revision: 1,
      updatedAt: maxUpdatedAt(notions, ''),
      notions: notions,
      updates: []
    };
  }

  function course(themeId, es, pt, chapters) {
    return {
      id: 'course-' + themeId,
      label: localized(es, pt),
      revision: 1,
      updatedAt: maxUpdatedAt(chapters, ''),
      chapters: chapters,
      updates: []
    };
  }

  function theme(config) {
    var sessionUpdatedAt = {};
    uniqueStrings((config.primary || []).concat(config.secondary || [])).forEach(function (lessonId) {
      sessionUpdatedAt[lessonId] = LESSON_UPDATED_AT[lessonId];
    });
    var primary = chronologicalLessonIds(config.primary, sessionUpdatedAt);
    var secondary = chronologicalLessonIds(config.secondary || [], sessionUpdatedAt).filter(function (lessonId) {
      return primary.indexOf(lessonId) === -1;
    });
    var consolidatedCourse = course(config.id, config.courseEs, config.coursePt, config.chapters);
    return {
      id: config.id,
      subjectId: config.subjectId,
      label: localized(config.labelEs, config.labelPt),
      summary: localized(config.summaryEs, config.summaryPt),
      revision: 1,
      updatedAt: consolidatedCourse.updatedAt,
      coverage: { primary: primary.slice(), secondary: secondary.slice() },
      primarySessionIds: primary.slice(),
      secondarySessionIds: secondary.slice(),
      sessionIds: chronologicalLessonIds(primary.concat(secondary), sessionUpdatedAt),
      sessionUpdatedAt: sessionUpdatedAt,
      course: consolidatedCourse,
      updates: []
    };
  }

  var DETAILED_THEMES = [
    theme({
      id: 'nutricion-evaluacion-alimentaria-critica',
      subjectId: 'nutricion',
      labelEs: 'Evaluación alimentaria y lectura crítica',
      labelPt: 'Avaliação alimentar e leitura crítica',
      summaryEs: 'De las leyes de la alimentación a una lectura contextualizada de guías, envases y decisiones.',
      summaryPt: 'Das leis da alimentação a uma leitura contextualizada de guias, rótulos e decisões.',
      courseEs: 'Curso consolidado · Evaluación alimentaria crítica',
      coursePt: 'Curso consolidado · Avaliação alimentar crítica',
      primary: ['nutricion-2026-08-13', 'nutricion-2026-08-27'],
      chapters: [
        chapter('nut-eval-fundamentos', 'Fundamentos de evaluación', 'Fundamentos da avaliação', [
          notion('nut-eval-vocabulario', 'Lenguaje básico de evaluación', 'Vocabulário básico da avaliação', [sourceRef('nutricion-2026-08-13', [0], 'foundation')]),
          notion('nut-eval-cantidad-balance', 'Cantidad y balance', 'Quantidade e equilíbrio', [sourceRef('nutricion-2026-08-13', [1], 'foundation')]),
          notion('nut-eval-calidad-armonia', 'Calidad y armonía', 'Qualidade e harmonia', [sourceRef('nutricion-2026-08-13', [2, 3], 'foundation')]),
          notion('nut-eval-adecuacion-variedad', 'Adecuación, variedad y cambio', 'Adequação, variedade e mudança', [sourceRef('nutricion-2026-08-13', [4, 5], 'foundation')])
        ]),
        chapter('nut-eval-guias-etiquetas', 'Guías, etiquetas y evidencia', 'Guias, rótulos e evidência', [
          notion('nut-eval-guias-paraguay', 'Guías alimentarias del Paraguay', 'Guias alimentares do Paraguai', [sourceRef('nutricion-2026-08-27', [0, 1], 'extension')]),
          notion('nut-eval-complementacion', 'Complementación proteica', 'Complementação proteica', [sourceRef('nutricion-2026-08-27', [2], 'precision')]),
          notion('nut-eval-porcion-trazabilidad', 'Porción y trazabilidad', 'Porção e rastreabilidade', [sourceRef('nutricion-2026-08-27', [3, 4], 'precision')]),
          notion('nut-eval-marketing-evidencia', 'Marketing frente a evidencia', 'Marketing frente à evidência', [sourceRef('nutricion-2026-08-27', [5], 'precision')]),
          notion('nut-eval-aplicacion-registro', 'Aplicación clínica y registro', 'Aplicação clínica e registro', [sourceRef('nutricion-2026-08-27', [6, 7], 'example')])
        ])
      ]
    }),
    theme({
      id: 'fisiologia-intercambio-control-respiratorio',
      subjectId: 'fisiologia',
      labelEs: 'Intercambio gaseoso y control respiratorio',
      labelPt: 'Trocas gasosas e controle respiratório',
      summaryEs: 'Recorrido de O2 y CO2 desde la difusión hasta el control neural y químico de la ventilación.',
      summaryPt: 'Percurso de O2 e CO2 desde a difusão até o controle neural e químico da ventilação.',
      courseEs: 'Curso consolidado · Respiración e intercambio gaseoso',
      coursePt: 'Curso consolidado · Respiração e trocas gasosas',
      primary: ['fisiologia-2026-08-10', 'fisiologia-2026-08-13'],
      chapters: [
        chapter('fis-resp-intercambio', 'Intercambio y transporte', 'Trocas e transporte', [
          notion('fis-resp-etapas', 'Cuatro etapas de la respiración', 'Quatro etapas da respiração', [sourceRef('fisiologia-2026-08-10', [0], 'foundation')]),
          notion('fis-resp-fick-vq', 'Ley de Fick y relación V/Q', 'Lei de Fick e relação V/Q', [sourceRef('fisiologia-2026-08-10', [1, 2], 'foundation')]),
          notion('fis-resp-o2-co2-hb', 'Transporte de O2, CO2 y afinidad de Hb', 'Transporte de O2, CO2 e afinidade da Hb', [sourceRef('fisiologia-2026-08-10', [3, 4, 5], 'foundation')]),
          notion('fis-resp-integracion-clinica', 'Integración clínica del intercambio', 'Integração clínica das trocas', [sourceRef('fisiologia-2026-08-10', [6], 'example')])
        ]),
        chapter('fis-resp-control', 'Control ventilatorio', 'Controle ventilatório', [
          notion('fis-resp-circuito-centros', 'Circuito bulbar y modulación pontina', 'Circuito bulbar e modulação pontina', [sourceRef('fisiologia-2026-08-13', [0, 1, 2], 'extension')]),
          notion('fis-resp-quimiorreceptores', 'Quimiorreceptores centrales y periféricos', 'Quimiorreceptores centrais e periféricos', [sourceRef('fisiologia-2026-08-13', [3, 4], 'precision')]),
          notion('fis-resp-receptores-pulmonares', 'Receptores pulmonares', 'Receptores pulmonares', [sourceRef('fisiologia-2026-08-13', [5], 'precision')]),
          notion('fis-resp-control-clinico', 'Aplicación clínica del control', 'Aplicação clínica do controle', [sourceRef('fisiologia-2026-08-13', [6], 'example')])
        ])
      ]
    }),
    theme({
      id: 'fisiologia-senal-neuronal-sinapsis',
      subjectId: 'fisiologia',
      labelEs: 'Señal nerviosa, sinapsis y transducción',
      labelPt: 'Sinal nervoso, sinapse e transdução',
      summaryEs: 'Cadena funcional desde la organización neural y el potencial de acción hasta la respuesta y la aplicación.',
      summaryPt: 'Cadeia funcional desde a organização neural e o potencial de ação até a resposta e a aplicação.',
      courseEs: 'Curso consolidado · Señal nerviosa',
      coursePt: 'Curso consolidado · Sinal nervoso',
      primary: ['fisiologia-2026-08-17', 'fisiologia-2026-08-20'],
      chapters: [
        chapter('fis-neuro-organizacion', 'Organización y neurona', 'Organização e neurônio', [
          notion('fis-neuro-sistema-neurona', 'Organización del sistema y neurona', 'Organização do sistema e neurônio', [
            sourceRef('fisiologia-2026-08-17', [0, 1], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [0], 'repetition')
          ])
        ]),
        chapter('fis-neuro-senal-electrica', 'Señal eléctrica y conducción', 'Sinal elétrico e condução', [
          notion('fis-neuro-potencial', 'Potencial de acción', 'Potencial de ação', [
            sourceRef('fisiologia-2026-08-17', [2], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [1], 'precision')
          ]),
          notion('fis-neuro-conduccion', 'Conducción de la señal', 'Condução do sinal', [
            sourceRef('fisiologia-2026-08-17', [3], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [2], 'repetition')
          ])
        ]),
        chapter('fis-neuro-sinapsis-respuesta', 'Sinapsis, receptores y respuesta', 'Sinapse, receptores e resposta', [
          notion('fis-neuro-sinapsis', 'Sinapsis', 'Sinapse', [
            sourceRef('fisiologia-2026-08-17', [4], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [3], 'example')
          ]),
          notion('fis-neuro-receptores-respuesta', 'Receptores y respuesta', 'Receptores e resposta', [sourceRef('fisiologia-2026-08-17', [5], 'foundation')])
        ]),
        chapter('fis-neuro-transduccion', 'Transducción e integración', 'Transdução e integração', [
          notion('fis-neuro-transduccion-sensorial', 'Transducción sensorial', 'Transdução sensorial', [
            sourceRef('fisiologia-2026-08-17', [6], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [4], 'precision')
          ]),
          notion('fis-neuro-circuitos-clinica', 'Circuitos y aplicación clínica', 'Circuitos e aplicação clínica', [
            sourceRef('fisiologia-2026-08-17', [7], 'foundation'),
            sourceRef('fisiologia-2026-08-20', [5], 'example')
          ])
        ])
      ]
    }),
    theme({
      id: 'fisiologia-sensibilidad-somatica-vias',
      subjectId: 'fisiologia',
      labelEs: 'Sensibilidad somática, vías y lesiones',
      labelPt: 'Sensibilidade somática, vias e lesões',
      summaryEs: 'De las modalidades y receptores a las vías ascendentes, la corteza y la localización de lesiones.',
      summaryPt: 'Das modalidades e receptores às vias ascendentes, ao córtex e à localização de lesões.',
      courseEs: 'Curso consolidado · Sensibilidad somática',
      coursePt: 'Curso consolidado · Sensibilidade somática',
      primary: ['fisiologia-2026-08-24', 'fisiologia-2026-08-27'],
      chapters: [
        chapter('fis-soma-modalidades', 'Modalidades y receptores', 'Modalidades e receptores', [
          notion('fis-soma-mapa', 'Mapa sensorial', 'Mapa sensorial', [sourceRef('fisiologia-2026-08-24', [0], 'foundation')]),
          notion('fis-soma-tacto-propiocepcion', 'Tacto y propiocepción', 'Tato e propriocepção', [
            sourceRef('fisiologia-2026-08-24', [1, 2], 'foundation'),
            sourceRef('fisiologia-2026-08-27', [0, 1], 'precision')
          ]),
          notion('fis-soma-dolor-temperatura', 'Dolor y temperatura', 'Dor e temperatura', [
            sourceRef('fisiologia-2026-08-24', [3, 4], 'foundation'),
            sourceRef('fisiologia-2026-08-27', [2, 3], 'precision')
          ])
        ]),
        chapter('fis-soma-vias-corteza', 'Vías, corteza y localización', 'Vias, córtex e localização', [
          notion('fis-soma-vias-ascendentes', 'Columnas dorsales y sistema anterolateral', 'Colunas dorsais e sistema anterolateral', [
            sourceRef('fisiologia-2026-08-24', [5], 'foundation'),
            sourceRef('fisiologia-2026-08-27', [4, 5], 'precision')
          ]),
          notion('fis-soma-corteza', 'Integración cortical', 'Integração cortical', [sourceRef('fisiologia-2026-08-24', [6], 'foundation')]),
          notion('fis-soma-lesiones', 'Decusación y localización de lesiones', 'Decussação e localização de lesões', [sourceRef('fisiologia-2026-08-27', [6, 7], 'example')])
        ])
      ]
    }),
    theme({
      id: 'bioquimica-glucolisis-piruvato-pdh',
      subjectId: 'bioquimica',
      labelEs: 'Glucólisis, piruvato y PDH',
      labelPt: 'Glicólise, piruvato e PDH',
      summaryEs: 'Balance, fases y regulación de la glucólisis hasta los destinos del piruvato y el complejo PDH.',
      summaryPt: 'Balanço, fases e regulação da glicólise até os destinos do piruvato e o complexo PDH.',
      courseEs: 'Curso consolidado · Glucólisis y piruvato',
      coursePt: 'Curso consolidado · Glicólise e piruvato',
      primary: ['bioquimica-2026-08-14', 'bioquimica-2026-08-19'],
      chapters: [
        chapter('bio-glic-panorama', 'Panorama y balance', 'Panorama e balanço', [
          notion('bio-glic-objetivo-balance', 'Objetivo, lugar y balance', 'Objetivo, local e balanço', [
            sourceRef('bioquimica-2026-08-14', [0], 'foundation'),
            sourceRef('bioquimica-2026-08-19', [0], 'repetition')
          ])
        ]),
        chapter('bio-glic-fases', 'Fases de la vía', 'Fases da via', [
          notion('bio-glic-inversion-division', 'Inversión y división', 'Investimento e divisão', [sourceRef('bioquimica-2026-08-14', [1, 2], 'foundation')]),
          notion('bio-glic-oxidacion-beneficio', 'Oxidación y beneficio', 'Oxidação e benefício', [sourceRef('bioquimica-2026-08-14', [3, 4], 'foundation')])
        ]),
        chapter('bio-glic-control-destinos', 'Control y destinos', 'Controle e destinos', [
          notion('bio-glic-regulacion', 'Puertas irreversibles y regulación', 'Etapas irreversíveis e regulação', [
            sourceRef('bioquimica-2026-08-14', [5, 6], 'foundation'),
            sourceRef('bioquimica-2026-08-19', [1], 'precision')
          ]),
          notion('bio-glic-destinos-piruvato', 'Destinos del piruvato', 'Destinos do piruvato', [
            sourceRef('bioquimica-2026-08-14', [7], 'foundation'),
            sourceRef('bioquimica-2026-08-19', [2], 'precision')
          ]),
          notion('bio-glic-pdh', 'Complejo PDH y su control', 'Complexo PDH e seu controle', [sourceRef('bioquimica-2026-08-19', [3, 4], 'extension')]),
          notion('bio-glic-clinica', 'Conexión clínica', 'Conexão clínica', [sourceRef('bioquimica-2026-08-19', [5], 'example')])
        ])
      ]
    }),
    theme({
      id: 'bioquimica-cetoacidosis-cori-integracion',
      subjectId: 'bioquimica',
      labelEs: 'Cetoacidosis, lactato y ciclo de Cori',
      labelPt: 'Cetoacidose, lactato e ciclo de Cori',
      summaryEs: 'Integración causal de la cetoacidosis diabética con lactato, Cori y balance energético.',
      summaryPt: 'Integração causal da cetoacidose diabética com lactato, Cori e balanço energético.',
      courseEs: 'Curso consolidado · Cetoacidosis e integración metabólica',
      coursePt: 'Curso consolidado · Cetoacidose e integração metabólica',
      primary: ['bioquimica-2026-08-21', 'bioquimica-2026-08-26'],
      chapters: [
        chapter('bio-cad-cadena', 'Cadena causal de la CAD', 'Cadeia causal da CAD', [
          notion('bio-cad-disparador-hiperglucemia', 'Disparador hormonal, hiperglucemia y agua', 'Gatilho hormonal, hiperglicemia e água', [
            sourceRef('bioquimica-2026-08-21', [0, 1], 'foundation'),
            sourceRef('bioquimica-2026-08-26', [0, 1], 'repetition')
          ]),
          notion('bio-cad-lipolisis-cetogenesis', 'Lipólisis y cetogénesis', 'Lipólise e cetogênese', [
            sourceRef('bioquimica-2026-08-21', [2], 'foundation'),
            sourceRef('bioquimica-2026-08-26', [2], 'precision')
          ]),
          notion('bio-cad-compensacion', 'Respuesta compensatoria', 'Resposta compensatória', [sourceRef('bioquimica-2026-08-21', [3], 'foundation')]),
          notion('bio-cad-potasio', 'Balance de potasio y corrección', 'Balanço de potássio e correção', [
            sourceRef('bioquimica-2026-08-21', [4], 'foundation'),
            sourceRef('bioquimica-2026-08-26', [3], 'precision')
          ]),
          notion('bio-cad-osmolaridad', 'Osmolaridad y cerebro', 'Osmolaridade e cérebro', [sourceRef('bioquimica-2026-08-21', [5], 'foundation')])
        ]),
        chapter('bio-cori-integracion', 'Lactato y ciclo de Cori', 'Lactato e ciclo de Cori', [
          notion('bio-cori-lactato-ldh', 'Lactato y lactato deshidrogenasa', 'Lactato e lactato desidrogenase', [sourceRef('bioquimica-2026-08-26', [4], 'extension')]),
          notion('bio-cori-ciclo', 'Ciclo de Cori', 'Ciclo de Cori', [sourceRef('bioquimica-2026-08-26', [5], 'extension')]),
          notion('bio-cori-balance', 'Balance energético integrado', 'Balanço energético integrado', [sourceRef('bioquimica-2026-08-26', [6], 'precision')])
        ])
      ]
    }),
    theme({
      id: 'bioquimica-pentosas-nadph-ribosa',
      subjectId: 'bioquimica',
      labelEs: 'Vía de las pentosas: NADPH y ribosa',
      labelPt: 'Via das pentoses: NADPH e ribose',
      summaryEs: 'Dos fases que ajustan carbonos, ribosa y NADPH a la necesidad celular.',
      summaryPt: 'Duas fases que ajustam carbonos, ribose e NADPH à necessidade celular.',
      courseEs: 'Curso consolidado · Vía de las pentosas fosfato',
      coursePt: 'Curso consolidado · Via das pentoses-fosfato',
      primary: ['bioquimica-2026-08-28'],
      secondary: ['bioquimica-2026-08-26'],
      chapters: [
        chapter('bio-ppp-entrada-oxidativa', 'Entrada y fase oxidativa', 'Entrada e fase oxidativa', [
          notion('bio-ppp-objetivo-entrada', 'Objetivo y entrada regulada', 'Objetivo e entrada regulada', [
            sourceRef('bioquimica-2026-08-26', [7], 'foundation'),
            sourceRef('bioquimica-2026-08-28', [0, 1], 'precision')
          ]),
          notion('bio-ppp-fase-oxidativa', 'Fase oxidativa y balance de carbonos', 'Fase oxidativa e balanço de carbonos', [
            sourceRef('bioquimica-2026-08-26', [8], 'extension'),
            sourceRef('bioquimica-2026-08-28', [2, 3], 'precision')
          ])
        ]),
        chapter('bio-ppp-no-oxidativa', 'Pentosas y reordenamiento', 'Pentoses e rearranjo', [
          notion('bio-ppp-pentosas', 'Pentosas y destinos', 'Pentoses e destinos', [sourceRef('bioquimica-2026-08-28', [4], 'foundation')]),
          notion('bio-ppp-reordenamiento', 'Reordenamiento y balance no oxidativo', 'Rearranjo e balanço não oxidativo', [sourceRef('bioquimica-2026-08-28', [5, 6], 'foundation')])
        ]),
        chapter('bio-ppp-demandas', 'Demandas celulares y clínica', 'Demandas celulares e clínica', [
          notion('bio-ppp-ribosa-nadph', 'Demanda de ribosa frente a NADPH', 'Demanda de ribose frente a NADPH', [
            sourceRef('bioquimica-2026-08-26', [9], 'foundation'),
            sourceRef('bioquimica-2026-08-28', [7, 8], 'precision')
          ]),
          notion('bio-ppp-proteccion-g6pd', 'Protección, síntesis y G6PD', 'Proteção, síntese e G6PD', [
            sourceRef('bioquimica-2026-08-26', [9], 'repetition'),
            sourceRef('bioquimica-2026-08-28', [9], 'precision')
          ])
        ]),
        chapter('bio-ppp-continuidad', 'Continuidad de aprendizaje', 'Continuidade da aprendizagem', [
          notion('bio-ppp-preparacion-siguiente', 'Preparación del tema siguiente', 'Preparação do tema seguinte', [sourceRef('bioquimica-2026-08-28', [10], 'extension')]),
          notion('bio-ppp-actividad-oral', 'Actividad oral anunciada', 'Atividade oral anunciada', [sourceRef('bioquimica-2026-08-28', [11], 'example')])
        ])
      ]
    }),
    theme({
      id: 'epidemiologia-aps-redes-sistema-salud',
      subjectId: 'epidemiologia',
      labelEs: 'APS, redes y sistema de salud',
      labelPt: 'APS, redes e sistema de saúde',
      summaryEs: 'Territorio, continuidad, subsistemas y niveles de atención como una red coordinada.',
      summaryPt: 'Território, continuidade, subsistemas e níveis de atenção como uma rede coordenada.',
      courseEs: 'Curso consolidado · APS y redes de salud',
      coursePt: 'Curso consolidado · APS e redes de saúde',
      primary: ['epidemiologia-bloque-anterior', 'epidemiologia-2026-08-28'],
      secondary: ['epidemiologia-2026-08-19', 'epidemiologia-2026-08-26'],
      chapters: [
        chapter('epi-red-aps-territorio', 'APS y territorio', 'APS e território', [
          notion('epi-red-aps-integralidad', 'APS e integralidad', 'APS e integralidade', [sourceRef('epidemiologia-bloque-anterior', [0, 1], 'foundation')]),
          notion('epi-red-sectorizacion', 'Sectorización y microred', 'Setorização e microrrede', [
            sourceRef('epidemiologia-bloque-anterior', [2], 'foundation'),
            sourceRef('epidemiologia-2026-08-28', [4], 'precision')
          ])
        ]),
        chapter('epi-red-continuidad', 'Referencia y continuidad', 'Referência e continuidade', [
          notion('epi-red-referencia', 'Referencia y contrarreferencia', 'Referência e contrarreferência', [sourceRef('epidemiologia-bloque-anterior', [3], 'foundation')]),
          notion('epi-red-riiss-continuidad', 'RIISS y continuidad en la red', 'RIISS e continuidade na rede', [
            sourceRef('epidemiologia-2026-08-19', [7], 'example'),
            sourceRef('epidemiologia-2026-08-28', [3, 4], 'precision')
          ])
        ]),
        chapter('epi-red-sistema', 'Sistema y subsistemas', 'Sistema e subsistemas', [
          notion('epi-red-mapa-sistema', 'Mapa del sistema de salud', 'Mapa do sistema de saúde', [
            sourceRef('epidemiologia-2026-08-26', [8], 'foundation'),
            sourceRef('epidemiologia-2026-08-28', [0], 'precision')
          ]),
          notion('epi-red-mspbs-subsistemas', 'MSPBS y otros subsistemas', 'MSPBS e outros subsistemas', [sourceRef('epidemiologia-2026-08-28', [1, 2], 'extension')])
        ]),
        chapter('epi-red-niveles', 'Niveles y capacidad resolutiva', 'Níveis e capacidade resolutiva', [
          notion('epi-red-nivel-complejidad', 'Nivel y complejidad', 'Nível e complexidade', [sourceRef('epidemiologia-2026-08-28', [5], 'foundation')]),
          notion('epi-red-cuatro-niveles', 'Cuatro niveles de atención', 'Quatro níveis de atenção', [sourceRef('epidemiologia-2026-08-28', [6, 7, 8], 'extension')]),
          notion('epi-red-apoyo-transversal', 'Apoyo transversal', 'Apoio transversal', [sourceRef('epidemiologia-2026-08-28', [9], 'extension')])
        ])
      ]
    }),
    theme({
      id: 'epidemiologia-urgencias-triage',
      subjectId: 'epidemiologia',
      labelEs: 'Urgencias, emergencias y triaje',
      labelPt: 'Urgências, emergências e triagem',
      summaryEs: 'De la demanda y la coordinación del sistema a la clasificación de riesgo y la conducta inicial.',
      summaryPt: 'Da demanda e coordenação do sistema à classificação de risco e à conduta inicial.',
      courseEs: 'Curso consolidado · Urgencias y triaje',
      coursePt: 'Curso consolidado · Urgências e triagem',
      primary: ['epidemiologia-2026-08-19', 'epidemiologia-2026-08-26'],
      secondary: ['epidemiologia-bloque-anterior', 'epidemiologia-2026-08-28'],
      chapters: [
        chapter('epi-triage-demanda-sistema', 'Demanda y organización', 'Demanda e organização', [
          notion('epi-triage-urgencia-emergencia', 'Urgencia, emergencia y demanda', 'Urgência, emergência e demanda', [
            sourceRef('epidemiologia-bloque-anterior', [4], 'foundation'),
            sourceRef('epidemiologia-2026-08-19', [0], 'precision'),
            sourceRef('epidemiologia-2026-08-26', [2], 'repetition')
          ]),
          notion('epi-triage-siue-coordinacion', 'SIUE, coordinación y transporte', 'SIUE, coordenação e transporte', [sourceRef('epidemiologia-2026-08-19', [1, 2, 3], 'extension')]),
          notion('epi-triage-organizacion-hospitalaria', 'Organización hospitalaria', 'Organização hospitalar', [sourceRef('epidemiologia-2026-08-19', [5], 'extension')])
        ]),
        chapter('epi-triage-clasificacion', 'Clasificación de riesgo', 'Classificação de risco', [
          notion('epi-triage-recepcion-cinco-niveles', 'Recepción, cinco niveles y conducta', 'Recepção, cinco níveis e conduta', [
            sourceRef('epidemiologia-bloque-anterior', [5, 6, 7], 'foundation'),
            sourceRef('epidemiologia-2026-08-19', [4], 'precision'),
            sourceRef('epidemiologia-2026-08-26', [0, 1, 3, 4, 9], 'precision')
          ]),
          notion('epi-triage-metodos', 'Métodos de triaje', 'Métodos de triagem', [sourceRef('epidemiologia-2026-08-28', [10], 'extension')])
        ]),
        chapter('epi-triage-casos', 'Casos y situaciones especiales', 'Casos e situações especiais', [
          notion('epi-triage-multiples-victimas', 'Múltiples víctimas', 'Múltiplas vítimas', [sourceRef('epidemiologia-2026-08-19', [6], 'example')]),
          notion('epi-triage-trauma-exposiciones', 'Trauma, heridas, quemaduras y exposiciones', 'Trauma, feridas, queimaduras e exposições', [sourceRef('epidemiologia-2026-08-26', [5, 6], 'example')]),
          notion('epi-triage-notificacion', 'Notificación epidemiológica', 'Notificação epidemiológica', [sourceRef('epidemiologia-2026-08-26', [7], 'precision')])
        ]),
        chapter('epi-triage-continuidad-practica', 'Continuidad y práctica', 'Continuidade e prática', [
          notion('epi-triage-continuidad-proyecto', 'Continuidad y proyecto de clase', 'Continuidade e projeto de aula', [sourceRef('epidemiologia-2026-08-19', [7, 8], 'example')]),
          notion('epi-triage-preparacion-practica', 'Preparación práctica', 'Preparação prática', [sourceRef('epidemiologia-2026-08-28', [11], 'extension')])
        ])
      ]
    }),
    theme({
      id: 'microbiologia-teorica-micosis-diagnostico',
      subjectId: 'microbiologia-teorica',
      labelEs: 'Micosis: profundidad, agentes y diagnóstico',
      labelPt: 'Micoses: profundidade, agentes e diagnóstico',
      summaryEs: 'Un razonamiento único conecta profundidad, lesión, exposición, muestra y confirmación en las micosis estudiadas.',
      summaryPt: 'Um único raciocínio conecta profundidade, lesão, exposição, amostra e confirmação nas micoses estudadas.',
      courseEs: 'Curso consolidado · Micosis y diagnóstico',
      coursePt: 'Curso consolidado · Micoses e diagnóstico',
      primary: ['microbiologia-teorica-2026-08-10', 'microbiologia-teorica-2026-08-17', 'microbiologia-teorica-2026-08-24'],
      chapters: [
        chapter('micro-teo-superficiales', 'Micosis superficiales y cutáneas', 'Micoses superficiais e cutâneas', [
          notion('micro-teo-profundidad', 'Mapa por profundidad', 'Mapa por profundidade', [
            sourceRef('microbiologia-teorica-2026-08-10', [0], 'foundation'),
            sourceRef('microbiologia-teorica-2026-08-17', [0], 'repetition'),
            sourceRef('microbiologia-teorica-2026-08-24', [0], 'precision')
          ]),
          notion('micro-teo-dermatofitos', 'Dermatofitos, transmisión y tiñas por sitio', 'Dermatófitos, transmissão e tíneas por local', [
            sourceRef('microbiologia-teorica-2026-08-10', [1, 2, 3], 'foundation'),
            sourceRef('microbiologia-teorica-2026-08-17', [3, 4], 'example')
          ]),
          notion('micro-teo-pitiriasis-malassezia', 'Pitiriasis versicolor y Malassezia', 'Pitiríase versicolor e Malassezia', [sourceRef('microbiologia-teorica-2026-08-17', [1, 2], 'extension')])
        ]),
        chapter('micro-teo-confirmacion', 'Muestra y confirmación', 'Amostra e confirmação', [
          notion('micro-teo-muestra-examen', 'Muestra, examen directo, cultivo y Wood', 'Amostra, exame direto, cultura e Wood', [
            sourceRef('microbiologia-teorica-2026-08-10', [4, 5], 'foundation'),
            sourceRef('microbiologia-teorica-2026-08-17', [5], 'precision')
          ]),
          notion('micro-teo-tratamiento-integracion', 'Tratamiento y caso integrado', 'Tratamento e caso integrado', [sourceRef('microbiologia-teorica-2026-08-10', [6, 7], 'example')]),
          notion('micro-teo-casos-comparacion', 'Casos de repaso y comparación', 'Casos de revisão e comparação', [sourceRef('microbiologia-teorica-2026-08-24', [1, 2, 3], 'example')])
        ]),
        chapter('micro-teo-subcutaneas', 'Micosis subcutáneas', 'Micoses subcutâneas', [
          notion('micro-teo-implantacion', 'Entrada por implantación', 'Entrada por implantação', [sourceRef('microbiologia-teorica-2026-08-24', [4], 'extension')]),
          notion('micro-teo-esporotricosis', 'Esporotricosis', 'Esporotricose', [sourceRef('microbiologia-teorica-2026-08-24', [5], 'extension')]),
          notion('micro-teo-cromoblastomicosis', 'Cromoblastomicosis', 'Cromoblastomicose', [sourceRef('microbiologia-teorica-2026-08-24', [6], 'extension')]),
          notion('micro-teo-eumicetoma', 'Micetoma eumicótico', 'Micetoma eumicótico', [sourceRef('microbiologia-teorica-2026-08-24', [7, 8], 'example')])
        ]),
        chapter('micro-teo-oportunistas', 'Micosis oportunistas y decisión segura', 'Micoses oportunistas e decisão segura', [
          notion('micro-teo-candida', 'Candida oportunista', 'Candida oportunista', [sourceRef('microbiologia-teorica-2026-08-24', [9], 'extension')]),
          notion('micro-teo-decision-segura', 'Límites y decisión segura', 'Limites e decisão segura', [sourceRef('microbiologia-teorica-2026-08-24', [10], 'precision')])
        ])
      ]
    }),
    theme({
      id: 'microbiologia-practica-diagnostico-laboratorio',
      subjectId: 'microbiologia-practica',
      labelEs: 'Diagnóstico micológico de laboratorio',
      labelPt: 'Diagnóstico micológico de laboratório',
      summaryEs: 'Secuencia segura desde muestra y medio hasta observación, integración y límites de identificación.',
      summaryPt: 'Sequência segura desde amostra e meio até observação, integração e limites de identificação.',
      courseEs: 'Curso consolidado · Diagnóstico micológico de laboratorio',
      coursePt: 'Curso consolidado · Diagnóstico micológico de laboratório',
      primary: ['microbiologia-practica-anterior', 'microbiologia-practica-2026-08-20', 'microbiologia-practica-2026-08-27'],
      chapters: [
        chapter('micro-pra-preanalitica', 'Preparación y fase preanalítica', 'Preparação e fase pré-analítica', [
          notion('micro-pra-formas-estructuras', 'Formas de crecimiento y estructuras', 'Formas de crescimento e estruturas', [
            sourceRef('microbiologia-practica-anterior', [0, 1], 'foundation'),
            sourceRef('microbiologia-practica-2026-08-27', [1, 2, 3], 'precision')
          ]),
          notion('micro-pra-muestra-preparacion', 'Muestra, método y preparación', 'Amostra, método e preparação', [
            sourceRef('microbiologia-practica-anterior', [2, 4], 'foundation'),
            sourceRef('microbiologia-practica-2026-08-20', [0], 'precision'),
            sourceRef('microbiologia-practica-2026-08-27', [0], 'repetition')
          ]),
          notion('micro-pra-sabouraud-cultivo', 'Sabouraud y cultivo', 'Sabouraud e cultura', [
            sourceRef('microbiologia-practica-anterior', [3], 'foundation'),
            sourceRef('microbiologia-practica-2026-08-20', [4], 'precision')
          ])
        ]),
        chapter('micro-pra-observacion', 'Observación macro y microscópica', 'Observação macro e microscópica', [
          notion('micro-pra-koh-wood-lactofenol', 'KOH, Wood y azul de lactofenol', 'KOH, Wood e azul de lactofenol', [sourceRef('microbiologia-practica-2026-08-20', [1, 2, 3], 'extension')]),
          notion('micro-pra-lectura-morfologica', 'Lectura macro y morfológica', 'Leitura macro e morfológica', [
            sourceRef('microbiologia-practica-anterior', [5], 'foundation'),
            sourceRef('microbiologia-practica-2026-08-20', [6], 'example'),
            sourceRef('microbiologia-practica-2026-08-27', [1, 2, 3], 'precision')
          ])
        ]),
        chapter('micro-pra-integracion', 'Integración y casos', 'Integração e casos', [
          notion('micro-pra-integracion-diagnostica', 'Integración diagnóstica', 'Integração diagnóstica', [sourceRef('microbiologia-practica-2026-08-20', [5], 'precision')]),
          notion('micro-pra-casos-oportunistas', 'Casos y micosis oportunistas', 'Casos e micoses oportunistas', [sourceRef('microbiologia-practica-2026-08-27', [4, 5], 'example')])
        ]),
        chapter('micro-pra-seguridad', 'Bioseguridad y límites', 'Biossegurança e limites', [
          notion('micro-pra-bioseguridad', 'Bioseguridad', 'Biossegurança', [
            sourceRef('microbiologia-practica-anterior', [6], 'foundation'),
            sourceRef('microbiologia-practica-2026-08-27', [6], 'precision')
          ]),
          notion('micro-pra-limite-identificacion', 'Límite de identificación', 'Limite de identificação', [sourceRef('microbiologia-practica-2026-08-27', [7], 'precision')])
        ])
      ]
    })
  ];

  /* One consolidated notion per real chapter keeps the seed deliberately
     compact (2–4 notions per theme) without dropping any section provenance. */
  function compactChapter(chapterItem) {
    var refsByKey = {};
    var labels = (chapterItem.notions || []).map(function (notionItem) { return notionItem.label; });
    (chapterItem.notions || []).forEach(function (notionItem) {
      (notionItem.sourceRefs || []).forEach(function (ref) {
        var key = [ref.lessonId, ref.contribution, ref.sourceStatus].join('|');
        if (!refsByKey[key]) {
          refsByKey[key] = {
            lessonId: ref.lessonId,
            sectionIndices: [],
            contribution: ref.contribution,
            sourceStatus: ref.sourceStatus,
            revision: ref.revision,
            updatedAt: ref.updatedAt
          };
        }
        refsByKey[key].sectionIndices = uniqueIndices(refsByKey[key].sectionIndices.concat(ref.sectionIndices));
      });
    });
    var refs = Object.keys(refsByKey).map(function (key) { return refsByKey[key]; }).sort(function (left, right) {
      var leftDate = left.updatedAt || '';
      var rightDate = right.updatedAt || '';
      if (leftDate !== rightDate) return leftDate < rightDate ? -1 : 1;
      var leftKey = sourceFingerprint(left);
      var rightKey = sourceFingerprint(right);
      return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
    });
    return {
      id: chapterItem.id,
      label: chapterItem.label,
      revision: chapterItem.revision,
      updatedAt: chapterItem.updatedAt,
      notions: [{
        id: chapterItem.id + '-notion',
        label: chapterItem.label,
        summary: localized(
          labels.map(function (label) { return label.es; }).join(' · '),
          labels.map(function (label) { return label.pt; }).join(' · ')
        ),
        keyPoints: labels,
        revision: 1,
        updatedAt: maxUpdatedAt(refs, chapterItem.updatedAt),
        sourceStatus: REFORMULATION,
        sourceRefs: refs,
        repetitions: [],
        precisions: [],
        examples: [],
        divergences: [],
        updates: []
      }],
      updates: []
    };
  }

  var THEMES = DETAILED_THEMES.map(function (themeItem) {
    var chapters = themeItem.course.chapters.map(compactChapter);
    return {
      id: themeItem.id,
      subjectId: themeItem.subjectId,
      label: themeItem.label,
      summary: themeItem.summary,
      revision: themeItem.revision,
      updatedAt: themeItem.updatedAt,
      coverage: {
        primary: themeItem.coverage.primary.slice(),
        secondary: themeItem.coverage.secondary.slice()
      },
      primarySessionIds: themeItem.primarySessionIds.slice(),
      secondarySessionIds: themeItem.secondarySessionIds.slice(),
      sessionIds: themeItem.sessionIds.slice(),
      sessionUpdatedAt: Object.keys(themeItem.sessionUpdatedAt || {}).reduce(function (dates, lessonId) {
        dates[lessonId] = themeItem.sessionUpdatedAt[lessonId];
        return dates;
      }, {}),
      course: {
        id: themeItem.course.id,
        label: themeItem.course.label,
        revision: themeItem.course.revision,
        updatedAt: themeItem.course.updatedAt,
        chapters: chapters,
        updates: []
      },
      updates: []
    };
  });

  var BASE_GRAPH = {
    version: VERSION,
    schemaVersion: SCHEMA_VERSION,
    revision: 1,
    updatedAt: UPDATED_AT,
    sourceStatus: REFORMULATION,
    contributionKinds: CONTRIBUTIONS.slice(),
    updateKinds: UPDATE_KINDS.slice(),
    themeModes: THEME_MODES,
    subjectOrder: ['nutricion', 'fisiologia', 'bioquimica', 'epidemiologia', 'microbiologia-teorica', 'microbiologia-practica'],
    themes: THEMES,
    updates: [{
      id: 'seed-s4-course-themes-v182',
      fingerprint: 'seed-s4-course-themes-v182',
      kind: 'seed',
      revision: 1,
      updatedAt: UPDATED_AT
    }],
    divergences: []
  };

  function deepClone(value) {
    if (Array.isArray(value)) return value.map(deepClone);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).reduce(function (copy, key) {
      copy[key] = deepClone(value[key]);
      return copy;
    }, {});
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    if (!value || typeof value !== 'object') return JSON.stringify(value);
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableStringify(value[key]);
    }).join(',') + '}';
  }

  function hashText(text) {
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function buildIndexes(graph) {
    var indexes = {
      themeById: {},
      courseById: {},
      chapterById: {},
      notionById: {},
      pathByChapterId: {},
      pathByNotionId: {},
      themeIdsBySubject: {},
      primaryThemeByLesson: {},
      themeIdsByLesson: {}
    };

    (graph.themes || []).forEach(function (themeItem) {
      indexes.themeById[themeItem.id] = themeItem;
      indexes.courseById[themeItem.course.id] = themeItem.course;
      if (!indexes.themeIdsBySubject[themeItem.subjectId]) indexes.themeIdsBySubject[themeItem.subjectId] = [];
      indexes.themeIdsBySubject[themeItem.subjectId].push(themeItem.id);

      (themeItem.coverage.primary || []).forEach(function (lessonId) {
        if (!indexes.primaryThemeByLesson[lessonId]) indexes.primaryThemeByLesson[lessonId] = themeItem.id;
        if (!indexes.themeIdsByLesson[lessonId]) indexes.themeIdsByLesson[lessonId] = [];
        if (indexes.themeIdsByLesson[lessonId].indexOf(themeItem.id) === -1) indexes.themeIdsByLesson[lessonId].push(themeItem.id);
      });
      (themeItem.coverage.secondary || []).forEach(function (lessonId) {
        if (!indexes.themeIdsByLesson[lessonId]) indexes.themeIdsByLesson[lessonId] = [];
        if (indexes.themeIdsByLesson[lessonId].indexOf(themeItem.id) === -1) indexes.themeIdsByLesson[lessonId].push(themeItem.id);
      });

      (themeItem.course.chapters || []).forEach(function (chapterItem) {
        indexes.chapterById[chapterItem.id] = chapterItem;
        indexes.pathByChapterId[chapterItem.id] = { theme: themeItem, course: themeItem.course, chapter: chapterItem };
        (chapterItem.notions || []).forEach(function (notionItem) {
          indexes.notionById[notionItem.id] = notionItem;
          indexes.pathByNotionId[notionItem.id] = {
            theme: themeItem,
            course: themeItem.course,
            chapter: chapterItem,
            notion: notionItem
          };
        });
      });
    });

    return indexes;
  }

  function graphOrBase(graph) {
    return graph && Array.isArray(graph.themes) ? graph : BASE_GRAPH;
  }

  function getTheme(themeId, graph) {
    return buildIndexes(graphOrBase(graph)).themeById[themeId] || null;
  }

  function getCourse(courseOrThemeId, graph) {
    var indexes = buildIndexes(graphOrBase(graph));
    if (indexes.courseById[courseOrThemeId]) return indexes.courseById[courseOrThemeId];
    return indexes.themeById[courseOrThemeId] ? indexes.themeById[courseOrThemeId].course : null;
  }

  function getChapter(chapterId, graph) {
    return buildIndexes(graphOrBase(graph)).chapterById[chapterId] || null;
  }

  function getNotion(notionId, graph) {
    return buildIndexes(graphOrBase(graph)).notionById[notionId] || null;
  }

  function getThemesForSubject(subjectId, graph) {
    var current = graphOrBase(graph);
    var indexes = buildIndexes(current);
    return (indexes.themeIdsBySubject[subjectId] || []).map(function (themeId) { return indexes.themeById[themeId]; });
  }

  function getThemesForLesson(lessonId, graph) {
    var current = graphOrBase(graph);
    var indexes = buildIndexes(current);
    return (indexes.themeIdsByLesson[lessonId] || []).map(function (themeId) { return indexes.themeById[themeId]; });
  }

  function getPrimaryThemeForLesson(lessonId, graph) {
    var current = graphOrBase(graph);
    var indexes = buildIndexes(current);
    var themeId = indexes.primaryThemeByLesson[lessonId];
    return themeId ? indexes.themeById[themeId] : null;
  }

  function getSourceRefsForLesson(lessonId, graph) {
    var refs = [];
    var indexes = buildIndexes(graphOrBase(graph));
    Object.keys(indexes.pathByNotionId).forEach(function (notionId) {
      var path = indexes.pathByNotionId[notionId];
      (path.notion.sourceRefs || []).forEach(function (ref) {
        if (ref.lessonId !== lessonId) return;
        refs.push({
          themeId: path.theme.id,
          courseId: path.course.id,
          chapterId: path.chapter.id,
          notionId: notionId,
          lessonId: ref.lessonId,
          sectionIndices: ref.sectionIndices.slice(),
          contribution: ref.contribution,
          revision: ref.revision,
          updatedAt: ref.updatedAt
        });
      });
    });
    return refs;
  }

  function resolvePath(query, graph) {
    var indexes = buildIndexes(graphOrBase(graph));
    if (!query) return null;
    if (typeof query === 'string') {
      if (indexes.pathByNotionId[query]) return indexes.pathByNotionId[query];
      if (indexes.pathByChapterId[query]) return indexes.pathByChapterId[query];
      if (indexes.themeById[query]) return { theme: indexes.themeById[query], course: indexes.themeById[query].course };
      if (indexes.courseById[query]) {
        var owner = (graphOrBase(graph).themes || []).filter(function (item) { return item.course.id === query; })[0];
        return owner ? { theme: owner, course: owner.course } : null;
      }
      return null;
    }
    if (query.notionId && indexes.pathByNotionId[query.notionId]) return indexes.pathByNotionId[query.notionId];
    if (query.chapterId && indexes.pathByChapterId[query.chapterId]) return indexes.pathByChapterId[query.chapterId];
    if (query.themeId && indexes.themeById[query.themeId]) return { theme: indexes.themeById[query.themeId], course: indexes.themeById[query.themeId].course };
    if (query.lessonId) {
      var primary = indexes.primaryThemeByLesson[query.lessonId];
      return primary ? { theme: indexes.themeById[primary], course: indexes.themeById[primary].course } : null;
    }
    return null;
  }

  function flattenAcademicLessons(academicModel) {
    var lessons = [];
    if (!academicModel) return lessons;
    if (Array.isArray(academicModel.lessons)) return academicModel.lessons.slice();
    Object.keys(academicModel.subjects || {}).forEach(function (subjectId) {
      ((academicModel.subjects[subjectId] || {}).chapters || []).forEach(function (chapterItem) {
        (chapterItem.lessons || []).forEach(function (lessonItem) { lessons.push(lessonItem); });
      });
    });
    return lessons;
  }

  function getSessionsForTheme(themeId, academicModel, graph) {
    var themeItem = getTheme(themeId, graph);
    if (!themeItem) return [];
    var byId = {};
    flattenAcademicLessons(academicModel).forEach(function (lesson) { byId[lesson.id] = lesson; });
    return themeItem.sessionIds.map(function (lessonId) {
      return byId[lessonId] || { id: lessonId, unavailable: true };
    });
  }

  function normalizeSource(input, fallbackContribution, fallbackUpdatedAt) {
    if (!input || typeof input.lessonId !== 'string' || !input.lessonId) {
      throw new TypeError('An incremental source requires lessonId.');
    }
    var contribution = input.contribution || fallbackContribution;
    if (CONTRIBUTIONS.indexOf(contribution) === -1) {
      throw new TypeError('Unsupported source contribution: ' + contribution);
    }
    var indices = uniqueIndices(input.sectionIndices || []);
    if (!indices.length) throw new TypeError('An incremental source requires at least one section index.');
    var updatedAt = input.updatedAt || input.date || fallbackUpdatedAt;
    return {
      lessonId: input.lessonId,
      sectionIndices: indices,
      contribution: contribution,
      sourceStatus: input.sourceStatus || REFORMULATION,
      revision: Number.isInteger(input.revision) && input.revision > 0 ? input.revision : 1,
      updatedAt: updatedAt
    };
  }

  function sourceFingerprint(ref) {
    return [ref.lessonId, ref.sectionIndices.join(','), ref.contribution].join('|');
  }

  function appendUniqueSource(notionItem, ref) {
    var key = sourceFingerprint(ref);
    var exists = (notionItem.sourceRefs || []).some(function (item) { return sourceFingerprint(item) === key; });
    if (exists) return false;
    notionItem.sourceRefs.push(ref);
    notionItem.sourceRefs.sort(function (left, right) {
      var leftDate = left.updatedAt || '';
      var rightDate = right.updatedAt || '';
      if (leftDate !== rightDate) return leftDate < rightDate ? -1 : 1;
      var leftKey = sourceFingerprint(left);
      var rightKey = sourceFingerprint(right);
      return leftKey < rightKey ? -1 : (leftKey > rightKey ? 1 : 0);
    });
    return true;
  }

  function normalizeUpdate(update, graph) {
    if (!update || typeof update !== 'object') throw new TypeError('Incremental update must be an object.');
    if (UPDATE_KINDS.indexOf(update.kind) === -1) throw new TypeError('Unsupported incremental update kind: ' + update.kind);
    var target = deepClone(update.target || {});
    ['themeId', 'courseId', 'chapterId', 'notionId'].forEach(function (field) {
      if (!target[field] && update[field]) target[field] = update[field];
    });
    var payload = deepClone(update.payload || update.data || {});
    var updatedAt = update.updatedAt
      || (update.source && (update.source.updatedAt || update.source.date))
      || (update.source && sessionDateForLesson(update.source.lessonId))
      || graph.updatedAt;
    var semantic = {
      kind: update.kind,
      target: target,
      source: update.source ? {
        lessonId: update.source.lessonId,
        sectionIndices: uniqueIndices(update.source.sectionIndices || []),
        contribution: update.source.contribution || (update.kind === 'new-theme' || update.kind === 'new-chapter' || update.kind === 'new-notion' ? 'extension' : update.kind)
      } : null,
      coverageRole: update.coverageRole || 'secondary',
      payload: payload,
      theme: update.theme || null,
      chapter: update.chapter || null,
      notion: update.notion || null
    };
    var fingerprint = hashText(stableStringify(semantic));
    return {
      id: update.id || 's4-theme-update-' + fingerprint,
      fingerprint: fingerprint,
      kind: update.kind,
      target: target,
      source: update.source ? normalizeSource(update.source, semantic.source.contribution, updatedAt) : null,
      coverageRole: update.coverageRole === 'primary' ? 'primary' : 'secondary',
      payload: payload,
      theme: deepClone(update.theme || null),
      chapter: deepClone(update.chapter || null),
      notion: deepClone(update.notion || null),
      requestedRevision: Number.isInteger(update.revision) && update.revision > 0 ? update.revision : null,
      updatedAt: updatedAt
    };
  }

  function normalizeIncomingNotion(input, normalizedUpdate) {
    if (!input || typeof input.id !== 'string' || !input.id) throw new TypeError('A new notion requires an id.');
    var item = deepClone(input);
    item.label = item.label || localized(item.title || item.id, item.title || item.id);
    item.revision = Number.isInteger(item.revision) && item.revision > 0 ? item.revision : 1;
    item.updatedAt = item.updatedAt || normalizedUpdate.updatedAt;
    item.sourceStatus = item.sourceStatus || REFORMULATION;
    item.sourceRefs = (item.sourceRefs || []).map(function (ref) {
      return normalizeSource(ref, ref.contribution || 'extension', item.updatedAt);
    });
    if (!item.sourceRefs.length && normalizedUpdate.source) item.sourceRefs.push(deepClone(normalizedUpdate.source));
    item.repetitions = item.repetitions || [];
    item.precisions = item.precisions || [];
    item.examples = item.examples || [];
    item.divergences = item.divergences || [];
    item.updates = item.updates || [];
    return item;
  }

  function normalizeIncomingChapter(input, normalizedUpdate) {
    if (!input || typeof input.id !== 'string' || !input.id) throw new TypeError('A new chapter requires an id.');
    var item = deepClone(input);
    item.label = item.label || localized(item.title || item.id, item.title || item.id);
    item.revision = Number.isInteger(item.revision) && item.revision > 0 ? item.revision : 1;
    item.updatedAt = item.updatedAt || normalizedUpdate.updatedAt;
    item.notions = (item.notions || []).map(function (notionItem) { return normalizeIncomingNotion(notionItem, normalizedUpdate); });
    item.updates = item.updates || [];
    return item;
  }

  function normalizeIncomingTheme(input, normalizedUpdate) {
    if (!input || typeof input.id !== 'string' || !input.id || typeof input.subjectId !== 'string' || !input.subjectId) {
      throw new TypeError('A new theme requires id and subjectId.');
    }
    var item = deepClone(input);
    item.label = item.label || localized(item.title || item.id, item.title || item.id);
    item.summary = item.summary || localized('', '');
    item.revision = Number.isInteger(item.revision) && item.revision > 0 ? item.revision : 1;
    item.updatedAt = item.updatedAt || normalizedUpdate.updatedAt;
    item.coverage = item.coverage || { primary: [], secondary: [] };
    item.sessionUpdatedAt = deepClone(item.sessionUpdatedAt || {});
    uniqueStrings((item.coverage.primary || item.primarySessionIds || []).concat(item.coverage.secondary || item.secondarySessionIds || [])).forEach(function (lessonId) {
      if (!item.sessionUpdatedAt[lessonId]) item.sessionUpdatedAt[lessonId] = sessionDateForLesson(lessonId, item.sessionUpdatedAt);
    });
    item.coverage.primary = chronologicalLessonIds(item.coverage.primary || item.primarySessionIds || [], item.sessionUpdatedAt);
    item.coverage.secondary = chronologicalLessonIds(item.coverage.secondary || item.secondarySessionIds || [], item.sessionUpdatedAt).filter(function (lessonId) {
      return item.coverage.primary.indexOf(lessonId) === -1;
    });
    if (normalizedUpdate.source) {
      addCoverage(item, normalizedUpdate.source.lessonId, normalizedUpdate.coverageRole, normalizedUpdate.source.updatedAt);
    }
    item.primarySessionIds = item.coverage.primary.slice();
    item.secondarySessionIds = item.coverage.secondary.slice();
    item.sessionIds = chronologicalLessonIds(item.coverage.primary.concat(item.coverage.secondary), item.sessionUpdatedAt);
    item.course = item.course || { id: 'course-' + item.id, label: item.label, chapters: [] };
    item.course.id = item.course.id || 'course-' + item.id;
    item.course.label = item.course.label || item.label;
    item.course.revision = Number.isInteger(item.course.revision) && item.course.revision > 0 ? item.course.revision : 1;
    item.course.updatedAt = item.course.updatedAt || item.updatedAt;
    item.course.chapters = (item.course.chapters || []).map(function (chapterItem) { return normalizeIncomingChapter(chapterItem, normalizedUpdate); });
    item.course.updates = item.course.updates || [];
    item.updates = item.updates || [];
    return item;
  }

  function addCoverage(themeItem, lessonId, role, updatedAt) {
    if (!lessonId) return false;
    var changed = false;
    themeItem.sessionUpdatedAt = themeItem.sessionUpdatedAt || {};
    var sessionDate = updatedAt || sessionDateForLesson(lessonId, themeItem.sessionUpdatedAt);
    if (sessionDate && sessionDate > (themeItem.sessionUpdatedAt[lessonId] || '')) {
      themeItem.sessionUpdatedAt[lessonId] = sessionDate;
      changed = true;
    }
    var primary = themeItem.coverage.primary;
    var secondary = themeItem.coverage.secondary;
    if (role === 'primary') {
      if (primary.indexOf(lessonId) === -1) {
        primary.push(lessonId);
        changed = true;
      }
      var secondaryIndex = secondary.indexOf(lessonId);
      if (secondaryIndex !== -1) {
        secondary.splice(secondaryIndex, 1);
        changed = true;
      }
    } else if (primary.indexOf(lessonId) === -1 && secondary.indexOf(lessonId) === -1) {
      secondary.push(lessonId);
      changed = true;
    }
    themeItem.coverage.primary = chronologicalLessonIds(primary, themeItem.sessionUpdatedAt);
    themeItem.coverage.secondary = chronologicalLessonIds(secondary, themeItem.sessionUpdatedAt);
    themeItem.primarySessionIds = themeItem.coverage.primary.slice();
    themeItem.secondarySessionIds = themeItem.coverage.secondary.slice();
    themeItem.sessionIds = chronologicalLessonIds(themeItem.coverage.primary.concat(themeItem.coverage.secondary), themeItem.sessionUpdatedAt);
    return changed;
  }

  function nextRevision(entity, requestedRevision) {
    var current = Number.isInteger(entity.revision) ? entity.revision : 0;
    return Math.max(current + 1, requestedRevision || 0);
  }

  function touch(entity, revision, updatedAt, updateId) {
    entity.revision = Math.max(entity.revision || 0, revision);
    if (updatedAt > (entity.updatedAt || '')) entity.updatedAt = updatedAt;
    if (Array.isArray(entity.updates) && entity.updates.indexOf(updateId) === -1) entity.updates.push(updateId);
  }

  function artifactFor(update) {
    return {
      id: update.id,
      revision: update.requestedRevision || 1,
      updatedAt: update.updatedAt,
      sourceRef: update.source ? deepClone(update.source) : null,
      content: deepClone(update.payload)
    };
  }

  function appendArtifact(items, artifact) {
    if (items.some(function (item) { return item.id === artifact.id || stableStringify(item) === stableStringify(artifact); })) return false;
    items.push(artifact);
    return true;
  }

  function locateTarget(graph, target) {
    var indexes = buildIndexes(graph);
    if (target.notionId && indexes.pathByNotionId[target.notionId]) return indexes.pathByNotionId[target.notionId];
    if (target.chapterId && indexes.pathByChapterId[target.chapterId]) return indexes.pathByChapterId[target.chapterId];
    if (target.themeId && indexes.themeById[target.themeId]) return { theme: indexes.themeById[target.themeId], course: indexes.themeById[target.themeId].course };
    if (target.courseId && indexes.courseById[target.courseId]) {
      var themeItem = graph.themes.filter(function (item) { return item.course.id === target.courseId; })[0];
      return themeItem ? { theme: themeItem, course: themeItem.course } : null;
    }
    return null;
  }

  function recordDivergence(graph, update, path, reason) {
    var artifact = artifactFor(update);
    artifact.kind = 'divergence';
    artifact.status = 'unresolved';
    artifact.reason = reason || update.payload.reason || 'Conflicting material requires review.';
    artifact.target = deepClone(update.target);
    appendArtifact(graph.divergences, artifact);
    if (path && path.notion) appendArtifact(path.notion.divergences, artifact);
    return true;
  }

  function applyOne(graph, rawUpdate) {
    var update = normalizeUpdate(rawUpdate, graph);
    var alreadyApplied = (graph.updates || []).some(function (item) {
      return item.id === update.id || item.fingerprint === update.fingerprint;
    });
    if (alreadyApplied) return { id: update.id, kind: update.kind, status: 'unchanged', reason: 'already-applied' };

    var path = locateTarget(graph, update.target);
    var changed = false;
    var status = 'applied';

    if (update.kind === 'repetition' || update.kind === 'precision' || update.kind === 'example') {
      if (!path || !path.notion) throw new Error(update.kind + ' requires an existing notion target.');
      if (!update.source) throw new Error(update.kind + ' requires a source.');
      changed = appendUniqueSource(path.notion, update.source) || changed;
      var collection = update.kind === 'repetition' ? path.notion.repetitions
        : (update.kind === 'precision' ? path.notion.precisions : path.notion.examples);
      changed = appendArtifact(collection, artifactFor(update)) || changed;
      changed = addCoverage(path.theme, update.source.lessonId, update.coverageRole, update.source.updatedAt) || changed;
    } else if (update.kind === 'new-notion') {
      if (!path || !path.chapter) throw new Error('new-notion requires an existing chapter target.');
      var incomingNotion = normalizeIncomingNotion(update.notion || update.payload.notion, update);
      if (buildIndexes(graph).notionById[incomingNotion.id]) throw new Error('Notion id already exists: ' + incomingNotion.id);
      path.chapter.notions.push(incomingNotion);
      if (update.source) addCoverage(path.theme, update.source.lessonId, update.coverageRole, update.source.updatedAt);
      changed = true;
    } else if (update.kind === 'new-chapter') {
      if (!path || !path.theme) throw new Error('new-chapter requires an existing theme target.');
      var incomingChapter = normalizeIncomingChapter(update.chapter || update.payload.chapter, update);
      if (buildIndexes(graph).chapterById[incomingChapter.id]) throw new Error('Chapter id already exists: ' + incomingChapter.id);
      path.theme.course.chapters.push(incomingChapter);
      if (update.source) addCoverage(path.theme, update.source.lessonId, update.coverageRole, update.source.updatedAt);
      changed = true;
    } else if (update.kind === 'new-theme') {
      var incomingTheme = normalizeIncomingTheme(update.theme || update.payload.theme, update);
      if (buildIndexes(graph).themeById[incomingTheme.id]) throw new Error('Theme id already exists: ' + incomingTheme.id);
      graph.themes.push(incomingTheme);
      path = { theme: incomingTheme, course: incomingTheme.course };
      changed = true;
    } else if (update.kind === 'divergence') {
      if (!path) throw new Error('divergence requires an existing target.');
      if (update.source && path.notion) appendUniqueSource(path.notion, update.source);
      if (update.source && path.theme) addCoverage(path.theme, update.source.lessonId, update.coverageRole, update.source.updatedAt);
      changed = recordDivergence(graph, update, path);
      status = 'review-required';
    }

    if (!changed) return { id: update.id, kind: update.kind, status: 'unchanged', reason: 'deduplicated' };

    var graphRevision = Math.max((graph.revision || 0) + 1, update.requestedRevision || 0);
    if (path && path.notion) touch(path.notion, nextRevision(path.notion, update.requestedRevision), update.updatedAt, update.id);
    if (path && path.chapter) touch(path.chapter, nextRevision(path.chapter, update.requestedRevision), update.updatedAt, update.id);
    if (path && path.course) touch(path.course, nextRevision(path.course, update.requestedRevision), update.updatedAt, update.id);
    if (path && path.theme) touch(path.theme, nextRevision(path.theme, update.requestedRevision), update.updatedAt, update.id);
    graph.revision = graphRevision;
    if (update.updatedAt > graph.updatedAt) graph.updatedAt = update.updatedAt;
    graph.updates.push({
      id: update.id,
      fingerprint: update.fingerprint,
      kind: update.kind,
      target: deepClone(update.target),
      source: update.source ? deepClone(update.source) : null,
      coverageRole: update.coverageRole,
      revision: graphRevision,
      updatedAt: update.updatedAt,
      status: status
    });

    return { id: update.id, kind: update.kind, status: status, revision: graphRevision };
  }

  function mergeIncrementalWithReport(graph, updates) {
    var next = deepClone(graphOrBase(graph));
    next.updates = next.updates || [];
    next.divergences = next.divergences || [];
    var list = Array.isArray(updates) ? updates : [updates];
    var results = list.map(function (update) { return applyOne(next, update); });
    return { graph: next, results: results };
  }

  function mergeIncremental(graph, updates) {
    return mergeIncrementalWithReport(graph, updates).graph;
  }

  function mergeContentThemeContributions(graph, contributions) {
    if (arguments.length === 1) return mergeIncremental(BASE_GRAPH, graph);
    return mergeIncremental(graph, contributions);
  }

  function validateGraph(graph) {
    var current = graphOrBase(graph);
    var indexes = buildIndexes(current);
    var errors = [];
    var sourceSectionsByLesson = {};
    var primaryCountByLesson = {};
    var entityIds = {};

    function recordEntityId(id, kind) {
      if (typeof id !== 'string' || !id) {
        errors.push('Missing ' + kind + ' id.');
        return;
      }
      if (entityIds[id]) errors.push('Duplicate entity id: ' + id + ' (' + entityIds[id] + ' and ' + kind + ').');
      else entityIds[id] = kind;
    }

    if (current.themes.length !== 11 && current.version === VERSION && current.revision === 1) {
      errors.push('The v182 seed must contain exactly 11 themes.');
    }

    current.themes.forEach(function (themeItem) {
      recordEntityId(themeItem.id, 'theme');
      if (!themeItem.course || !Array.isArray(themeItem.course.chapters)) errors.push('Theme has no course hierarchy: ' + themeItem.id);
      else recordEntityId(themeItem.course.id, 'course');
      ((themeItem.coverage && themeItem.coverage.primary) || []).forEach(function (lessonId) {
        primaryCountByLesson[lessonId] = (primaryCountByLesson[lessonId] || 0) + 1;
      });
      ((themeItem.course && themeItem.course.chapters) || []).forEach(function (chapterItem) {
        recordEntityId(chapterItem.id, 'chapter');
        (chapterItem.notions || []).forEach(function (notionItem) {
          recordEntityId(notionItem.id, 'notion');
          if (!(notionItem.sourceRefs || []).length) errors.push('Notion has no provenance: ' + notionItem.id);
          (notionItem.sourceRefs || []).forEach(function (ref) {
            if (!sourceSectionsByLesson[ref.lessonId]) sourceSectionsByLesson[ref.lessonId] = {};
            ref.sectionIndices.forEach(function (sectionIndex) { sourceSectionsByLesson[ref.lessonId][sectionIndex] = true; });
          });
        });
      });
    });

    if (current.version === VERSION && current.revision === 1) {
      Object.keys(EXPECTED_SECTIONS_BY_LESSON).forEach(function (lessonId) {
        if (primaryCountByLesson[lessonId] !== 1) errors.push('Lesson must have exactly one primary theme: ' + lessonId);
        var seen = sourceSectionsByLesson[lessonId] || {};
        for (var sectionIndex = 0; sectionIndex < EXPECTED_SECTIONS_BY_LESSON[lessonId]; sectionIndex += 1) {
          if (!seen[sectionIndex]) errors.push('Missing source section ' + lessonId + '#' + sectionIndex);
        }
      });
    }

    if (Object.keys(indexes.themeById).length !== current.themes.length) errors.push('Duplicate theme id.');
    return { valid: errors.length === 0, errors: errors };
  }

  var validation = validateGraph(BASE_GRAPH);
  if (!validation.valid) throw new Error('Invalid S4 course-theme seed: ' + validation.errors.join('; '));

  var BASE_INDEXES = buildIndexes(BASE_GRAPH);
  deepFreeze(BASE_GRAPH);

  function install(s4Model) {
    if (!s4Model || typeof s4Model !== 'object') return null;

    /* Existing `themes` remains the three reading appearances (soft/sepia/focus).
       All academic-theme fields use the content/course prefix deliberately. */
    s4Model.courseThemeVersion = VERSION;
    s4Model.themeModes = BASE_GRAPH.themeModes;
    var activeGraph = BASE_GRAPH;

    function activateGraph(graph) {
      if (!graph || !Array.isArray(graph.themes)) throw new TypeError('An active content-theme graph requires themes[].');
      var graphValidation = validateGraph(graph);
      if (!graphValidation.valid) throw new Error('Cannot activate an invalid content-theme graph: ' + graphValidation.errors.join('; '));
      activeGraph = graph;
      var indexes = buildIndexes(activeGraph);
      s4Model.courseThemeGraph = activeGraph;
      s4Model.courseThemes = activeGraph.themes;
      s4Model.contentThemes = activeGraph.themes;
      s4Model.contentThemeById = indexes.themeById;
      s4Model.contentThemeOrderBySubject = indexes.themeIdsBySubject;
      s4Model.primaryContentThemeByLesson = indexes.primaryThemeByLesson;
      s4Model.contentThemeIdsByLesson = indexes.themeIdsByLesson;
      s4Model.contentNotionsById = indexes.notionById;
      return activeGraph;
    }

    function mergeAndActivate(graph, contributions) {
      var merged = arguments.length === 1
        ? mergeContentThemeContributions(activeGraph, graph)
        : mergeContentThemeContributions(graph, contributions);
      activateGraph(merged);
      return merged;
    }

    s4Model.setContentThemeGraph = activateGraph;
    s4Model.activateContentThemeGraph = activateGraph;
    s4Model.activateGraph = activateGraph;
    s4Model.getActiveContentThemeGraph = function () { return activeGraph; };
    s4Model.getContentTheme = function (themeId) { return getTheme(themeId, activeGraph); };
    s4Model.getContentCourse = function (courseOrThemeId) { return getCourse(courseOrThemeId, activeGraph); };
    s4Model.getContentChapter = function (chapterId) { return getChapter(chapterId, activeGraph); };
    s4Model.getContentNotion = function (notionId) { return getNotion(notionId, activeGraph); };
    s4Model.getContentThemesForSubject = function (subjectId) { return getThemesForSubject(subjectId, activeGraph); };
    s4Model.getContentThemesForLesson = function (lessonId) { return getThemesForLesson(lessonId, activeGraph); };
    s4Model.getPrimaryContentThemeForLesson = function (lessonId) { return getPrimaryThemeForLesson(lessonId, activeGraph); };
    s4Model.getContentSourceRefsForLesson = function (lessonId) { return getSourceRefsForLesson(lessonId, activeGraph); };
    s4Model.resolveContentThemePath = function (query) { return resolvePath(query, activeGraph); };
    s4Model.getSessionsForContentTheme = function (themeId, academicModel) { return getSessionsForTheme(themeId, academicModel, activeGraph); };
    s4Model.mergeContentThemeContributions = mergeAndActivate;
    s4Model.mergeCourseThemeGraph = mergeIncremental;
    s4Model.mergeCourseThemeGraphWithReport = mergeIncrementalWithReport;
    activateGraph(BASE_GRAPH);
    return s4Model;
  }

  return {
    version: VERSION,
    schemaVersion: SCHEMA_VERSION,
    graph: BASE_GRAPH,
    themes: BASE_GRAPH.themes,
    themeModes: BASE_GRAPH.themeModes,
    contributionKinds: BASE_GRAPH.contributionKinds,
    updateKinds: BASE_GRAPH.updateKinds,
    lessonUpdatedAt: deepFreeze(deepClone(LESSON_UPDATED_AT)),
    expectedSectionsByLesson: deepFreeze(deepClone(EXPECTED_SECTIONS_BY_LESSON)),
    themeById: BASE_INDEXES.themeById,
    courseById: BASE_INDEXES.courseById,
    chapterById: BASE_INDEXES.chapterById,
    notionById: BASE_INDEXES.notionById,
    primaryThemeByLesson: BASE_INDEXES.primaryThemeByLesson,
    themeIdsByLesson: BASE_INDEXES.themeIdsByLesson,
    themeIdsBySubject: BASE_INDEXES.themeIdsBySubject,
    getTheme: getTheme,
    getContentTheme: getTheme,
    getCourse: getCourse,
    getChapter: getChapter,
    getNotion: getNotion,
    getThemesForSubject: getThemesForSubject,
    getThemesForLesson: getThemesForLesson,
    getPrimaryThemeForLesson: getPrimaryThemeForLesson,
    getSourceRefsForLesson: getSourceRefsForLesson,
    getSessionsForTheme: getSessionsForTheme,
    resolvePath: resolvePath,
    buildIndexes: buildIndexes,
    validateGraph: validateGraph,
    mergeIncremental: mergeIncremental,
    mergeIncrementalWithReport: mergeIncrementalWithReport,
    mergeContentThemeContributions: mergeContentThemeContributions,
    applyIncrementalUpdate: mergeIncremental,
    install: install
  };
});
