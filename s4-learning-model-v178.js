(function () {
  'use strict';

  var SOURCE_LABELS = [
    'PROFESORA · CONFIRMADO',
    'REFORMULACIÓN NYKUTO',
    'AMPLIACIÓN CLÍNICA',
    'PRECISIÓN MÉDICA',
    'POR CONFIRMAR'
  ];

  var MODES = [
    { id: 'curso', panelId: 'curso', key: 'comprender', label: { es: 'Comprender', pt: 'Compreender', br: 'Compreender' }, labelEs: 'Comprender', labelPtBr: 'Compreender' },
    { id: 'rapida', panelId: 'rapida', key: 'repasar', label: { es: 'Repasar', pt: 'Revisar', br: 'Revisar' }, labelEs: 'Repasar', labelPtBr: 'Revisar' },
    { id: 'ultra', panelId: 'ultra', key: 'recordar', label: { es: 'Recordar', pt: 'Recordar', br: 'Recordar' }, labelEs: 'Recordar', labelPtBr: 'Recordar' },
    { id: 'training', panelId: 'training', key: 'entrenar', label: { es: 'Entrenar', pt: 'Treinar', br: 'Treinar' }, labelEs: 'Entrenar', labelPtBr: 'Treinar' }
  ];

  var THEMES = [
    { id: 'soft', label: { es: 'Claro suave', pt: 'Claro suave', br: 'Claro suave' } },
    { id: 'sepia', label: { es: 'Sepia lectura', pt: 'Sépia leitura', br: 'Sépia leitura' } },
    { id: 'focus', label: { es: 'Oscuro concentración', pt: 'Escuro concentração', br: 'Escuro concentração' } }
  ];

  var SUBJECTS = {
    nutricion: {
      id: 'nutricion',
      label: { es: 'Nutrición', pt: 'Nutrição' },
      learningPath: ['evaluar', 'comparar', 'adaptar', 'decidir'],
      centralQuestionTemplate: {
        es: '¿Cómo ayuda «{title}» a evaluar una alimentación y justificar decisiones para una persona concreta?',
        pt: 'Como «{title}» ajuda a avaliar uma alimentação e justificar decisões para uma pessoa específica?'
      },
      objectives: {
        es: ['Definir con el vocabulario del curso los conceptos que organizan la clase.', 'Reconstruir en orden los criterios o pasos de evaluación presentados.', 'Comparar opciones con los criterios documentados en la clase.', 'Justificar una decisión aplicable al contexto descrito, sin agregar datos ausentes.'],
        pt: ['Definir, com o vocabulário do curso, os conceitos que organizam a aula.', 'Reconstruir em ordem os critérios ou passos de avaliação apresentados.', 'Comparar opções com os critérios documentados na aula.', 'Justificar uma decisão aplicável ao contexto descrito, sem acrescentar dados ausentes.']
      },
      prerequisites: {
        es: ['Distinguir observación, interpretación y recomendación.', 'Leer cantidades, proporciones y contexto antes de emitir un juicio.', 'Reconocer que una orientación poblacional no sustituye la evaluación individual.'],
        pt: ['Distinguir observação, interpretação e recomendação.', 'Ler quantidades, proporções e contexto antes de emitir um julgamento.', 'Reconhecer que uma orientação populacional não substitui a avaliação individual.']
      },
      frequentError: {
        es: 'Memorizar una lista de criterios sin explicar cuál se aplica ni qué dato de la clase sostiene la elección.',
        pt: 'Memorizar uma lista de critérios sem explicar qual se aplica nem qual dado da aula sustenta a escolha.'
      }
    },
    fisiologia: {
      id: 'fisiologia',
      label: { es: 'Fisiología II', pt: 'Fisiologia II' },
      learningPath: ['detectar', 'transmitir', 'integrar', 'responder'],
      centralQuestionTemplate: {
        es: '¿Qué secuencia funcional explica «{title}» y cómo permite razonar desde la entrada hasta la respuesta?',
        pt: 'Que sequência funcional explica «{title}» e como ela permite raciocinar desde a entrada até a resposta?'
      },
      objectives: {
        es: ['Identificar la variable, el estímulo o la entrada que inicia el proceso estudiado.', 'Reconstruir la cadena entre estructura, mecanismo y respuesta con el orden de la clase.', 'Comparar vías o condiciones mediante los criterios expresados en el curso.', 'Predecir la consecuencia descrita por el mecanismo sin inventar variables clínicas.'],
        pt: ['Identificar a variável, o estímulo ou a entrada que inicia o processo estudado.', 'Reconstruir a cadeia entre estrutura, mecanismo e resposta na ordem da aula.', 'Comparar vias ou condições pelos critérios apresentados no curso.', 'Prever a consequência descrita pelo mecanismo sem inventar variáveis clínicas.']
      },
      prerequisites: {
        es: ['Separar estructura, función y consecuencia.', 'Seguir flechas y relaciones causales en el orden en que ocurren.', 'Distinguir el dato observado de una inferencia.'],
        pt: ['Separar estrutura, função e consequência.', 'Seguir setas e relações causais na ordem em que ocorrem.', 'Distinguir o dado observado de uma inferência.']
      },
      frequentError: {
        es: 'Saltar directamente al resultado y recitar nombres sin reconstruir los eslabones que lo explican.',
        pt: 'Pular diretamente para o resultado e recitar nomes sem reconstruir os elos que o explicam.'
      }
    },
    bioquimica: {
      id: 'bioquimica',
      label: { es: 'Bioquímica II', pt: 'Bioquímica II' },
      learningPath: ['sustrato', 'transformación', 'balance', 'regulación'],
      centralQuestionTemplate: {
        es: '¿Cómo transforma materia, energía o electrones «{title}» y qué balance permite comprobarlo?',
        pt: 'Como «{title}» transforma matéria, energia ou elétrons e qual balanço permite conferir isso?'
      },
      objectives: {
        es: ['Ordenar sustratos, productos y enzimas según la secuencia mostrada en la clase.', 'Seguir carbonos, energía y electrones cuando el material aporta esos balances.', 'Distinguir reacciones reversibles, irreversibles y puntos de regulación señalados.', 'Usar el mecanismo para justificar una consecuencia presente en el curso.'],
        pt: ['Ordenar substratos, produtos e enzimas conforme a sequência apresentada na aula.', 'Acompanhar carbonos, energia e elétrons quando o material fornece esses balanços.', 'Distinguir reações reversíveis, irreversíveis e pontos de regulação indicados.', 'Usar o mecanismo para justificar uma consequência presente no curso.']
      },
      prerequisites: {
        es: ['Reconocer sustrato, producto, enzima y cofactor.', 'Diferenciar ATP de transportadores de electrones como NADH o NADPH.', 'Comprobar conservación de carbonos antes de memorizar un balance.'],
        pt: ['Reconhecer substrato, produto, enzima e cofator.', 'Diferenciar ATP de transportadores de elétrons como NADH ou NADPH.', 'Conferir a conservação dos carbonos antes de memorizar um balanço.']
      },
      frequentError: {
        es: 'Aprender nombres aislados sin contar moléculas, carbonos ni equivalentes energéticos en cada punto.',
        pt: 'Aprender nomes isolados sem contar moléculas, carbonos nem equivalentes energéticos em cada ponto.'
      }
    },
    epidemiologia: {
      id: 'epidemiologia',
      label: { es: 'Epidemiología y Salud Pública', pt: 'Epidemiologia e Saúde Pública' },
      learningPath: ['reconocer', 'priorizar', 'derivar', 'reevaluar'],
      centralQuestionTemplate: {
        es: '¿Cómo se usa «{title}» para organizar, priorizar o sostener una decisión de salud con los datos disponibles?',
        pt: 'Como «{title}» é usado para organizar, priorizar ou sustentar uma decisão em saúde com os dados disponíveis?'
      },
      objectives: {
        es: ['Definir los términos organizativos o de clasificación empleados en la clase.', 'Reconstruir el recorrido, nivel o algoritmo en el orden enseñado.', 'Distinguir métodos y niveles por su propósito y contexto de uso.', 'Justificar una clasificación solo con los datos incluidos en el caso.'],
        pt: ['Definir os termos de organização ou classificação usados na aula.', 'Reconstruir o percurso, o nível ou o algoritmo na ordem ensinada.', 'Distinguir métodos e níveis por sua finalidade e contexto de uso.', 'Justificar uma classificação somente com os dados incluídos no caso.']
      },
      prerequisites: {
        es: ['Diferenciar clasificación, diagnóstico y conducta.', 'Leer contexto, riesgo y capacidad resolutiva antes de elegir una categoría.', 'No completar con supuestos los datos que un caso no ofrece.'],
        pt: ['Diferenciar classificação, diagnóstico e conduta.', 'Ler contexto, risco e capacidade de resolução antes de escolher uma categoria.', 'Não completar com suposições os dados que o caso não fornece.']
      },
      frequentError: {
        es: 'Elegir una categoría por una palabra llamativa del caso sin recorrer todos los criterios del método solicitado.',
        pt: 'Escolher uma categoria por uma palavra chamativa do caso sem percorrer todos os critérios do método solicitado.'
      }
    },
    'microbiologia-teorica': {
      id: 'microbiologia-teorica',
      label: { es: 'Microbiología II · Teórica', pt: 'Microbiologia II · Teórica' },
      learningPath: ['describir', 'comparar', 'orientar', 'confirmar'],
      centralQuestionTemplate: {
        es: '¿Cómo conecta «{title}» profundidad, agente, lesión, muestra y confirmación sin saltar etapas?',
        pt: 'Como «{title}» conecta profundidade, agente, lesão, amostra e confirmação sem pular etapas?'
      },
      objectives: {
        es: ['Clasificar el proceso por profundidad y localización con los criterios del curso.', 'Relacionar exposición, lesión y agente como hipótesis, no como confirmación automática.', 'Elegir la muestra y las pruebas descritas para el problema estudiado.', 'Distinguir un dato orientador de un resultado confirmatorio.'],
        pt: ['Classificar o processo por profundidade e localização com os critérios do curso.', 'Relacionar exposição, lesão e agente como hipótese, não como confirmação automática.', 'Escolher a amostra e os testes descritos para o problema estudado.', 'Distinguir um dado orientador de um resultado confirmatório.']
      },
      prerequisites: {
        es: ['Separar morfología clínica, exposición y resultado de laboratorio.', 'Reconocer que la calidad de la muestra condiciona la interpretación.', 'Mantener diferenciadas hipótesis, orientación y confirmación.'],
        pt: ['Separar morfologia clínica, exposição e resultado laboratorial.', 'Reconhecer que a qualidade da amostra condiciona a interpretação.', 'Manter diferenciadas hipótese, orientação e confirmação.']
      },
      frequentError: {
        es: 'Asignar una especie a partir de una sola imagen o exposición sin completar la secuencia diagnóstica de la clase.',
        pt: 'Atribuir uma espécie a partir de uma única imagem ou exposição sem completar a sequência diagnóstica da aula.'
      }
    },
    'microbiologia-practica': {
      id: 'microbiologia-practica',
      label: { es: 'Microbiología II · Práctica', pt: 'Microbiologia II · Prática' },
      learningPath: ['preparar', 'observar', 'registrar', 'integrar'],
      centralQuestionTemplate: {
        es: '¿Cómo ejecutar e interpretar «{title}» con seguridad, separando observación, orientación y confirmación?',
        pt: 'Como executar e interpretar «{title}» com segurança, separando observação, orientação e confirmação?'
      },
      objectives: {
        es: ['Ordenar la preparación, la técnica y la lectura según el protocolo trabajado.', 'Describir por separado los hallazgos macroscópicos y microscópicos.', 'Relacionar muestra, técnica, lectura e interpretación sin omitir bioseguridad.', 'Justificar hasta dónde llega una conclusión y qué dato faltaría para confirmarla.'],
        pt: ['Ordenar o preparo, a técnica e a leitura conforme o protocolo trabalhado.', 'Descrever separadamente os achados macroscópicos e microscópicos.', 'Relacionar amostra, técnica, leitura e interpretação sem omitir a biossegurança.', 'Justificar até onde uma conclusão chega e qual dado faltaria para confirmá-la.']
      },
      prerequisites: {
        es: ['Seguir las indicaciones de bioseguridad durante toda la práctica.', 'Describir antes de interpretar.', 'Distinguir crecimiento visible, estructura microscópica e identificación.'],
        pt: ['Seguir as orientações de biossegurança durante toda a prática.', 'Descrever antes de interpretar.', 'Distinguir crescimento visível, estrutura microscópica e identificação.']
      },
      frequentError: {
        es: 'Convertir una observación aislada en identificación final sin documentar el procedimiento y sus límites.',
        pt: 'Transformar uma observação isolada em identificação final sem documentar o procedimento e seus limites.'
      }
    }
  };

  Object.keys(SUBJECTS).forEach(function (subjectId) {
    var subject = SUBJECTS[subjectId];
    subject.objectives = subject.objectives.es.map(function (text, index) {
      return { es: text, pt: subject.objectives.pt[index] };
    });
    subject.prerequisites = subject.prerequisites.es.map(function (text, index) {
      return { es: text, pt: subject.prerequisites.pt[index] };
    });
  });

  var LESSON_IDS = [
    'nutricion-2026-08-13',
    'nutricion-2026-08-27',
    'fisiologia-2026-08-10',
    'fisiologia-2026-08-13',
    'fisiologia-2026-08-17',
    'fisiologia-2026-08-20',
    'fisiologia-2026-08-24',
    'fisiologia-2026-08-27',
    'bioquimica-2026-08-14',
    'bioquimica-2026-08-19',
    'bioquimica-2026-08-21',
    'bioquimica-2026-08-26',
    'bioquimica-2026-08-28',
    'epidemiologia-bloque-anterior',
    'epidemiologia-2026-08-19',
    'epidemiologia-2026-08-26',
    'epidemiologia-2026-08-28',
    'microbiologia-teorica-2026-08-10',
    'microbiologia-teorica-2026-08-17',
    'microbiologia-teorica-2026-08-24',
    'microbiologia-practica-anterior',
    'microbiologia-practica-2026-08-20',
    'microbiologia-practica-2026-08-27'
  ];

  var LESSON_SUBJECT_BY_ID = {
    'nutricion-2026-08-13': 'nutricion',
    'nutricion-2026-08-27': 'nutricion',
    'fisiologia-2026-08-10': 'fisiologia',
    'fisiologia-2026-08-13': 'fisiologia',
    'fisiologia-2026-08-17': 'fisiologia',
    'fisiologia-2026-08-20': 'fisiologia',
    'fisiologia-2026-08-24': 'fisiologia',
    'fisiologia-2026-08-27': 'fisiologia',
    'bioquimica-2026-08-14': 'bioquimica',
    'bioquimica-2026-08-19': 'bioquimica',
    'bioquimica-2026-08-21': 'bioquimica',
    'bioquimica-2026-08-26': 'bioquimica',
    'bioquimica-2026-08-28': 'bioquimica',
    'epidemiologia-bloque-anterior': 'epidemiologia',
    'epidemiologia-2026-08-19': 'epidemiologia',
    'epidemiologia-2026-08-26': 'epidemiologia',
    'epidemiologia-2026-08-28': 'epidemiologia',
    'microbiologia-teorica-2026-08-10': 'microbiologia-teorica',
    'microbiologia-teorica-2026-08-17': 'microbiologia-teorica',
    'microbiologia-teorica-2026-08-24': 'microbiologia-teorica',
    'microbiologia-practica-anterior': 'microbiologia-practica',
    'microbiologia-practica-2026-08-20': 'microbiologia-practica',
    'microbiologia-practica-2026-08-27': 'microbiologia-practica'
  };

  var ESTIMATED_LESSON_IDS = [
    'nutricion-2026-08-13',
    'fisiologia-2026-08-10',
    'microbiologia-teorica-2026-08-10'
  ];

  function buildNodes(labels) {
    return labels.map(function (label, index) {
      return {
        id: 'notion-' + (index + 1),
        label: label,
        sectionIndex: index,
        target: 'section:' + index
      };
    });
  }

  function createSpecialization(config) {
    var labels = config.sectionLabels.slice();
    var indices = labels.map(function (_, index) { return index; });
    return {
      lessonId: config.lessonId,
      subjectId: config.subjectId,
      type: config.type,
      key: config.rendererKind,
      rendererKind: config.type,
      title: config.title,
      allSections: true,
      sourceStatus: SOURCE_LABELS[1],
      dateStatus: ESTIMATED_LESSON_IDS.indexOf(config.lessonId) === -1
        ? null
        : SOURCE_LABELS[4],
      dataMapping: {
        source: 'academic-model.sections-or-rendered-course',
        strategy: 'all-sections-in-order',
        allSections: true,
        sectionIndices: indices,
        titleHints: labels
      },
      nodes: buildNodes(labels),
      interaction: { kind: config.interaction },
      guardrail: 'derive-only'
    };
  }

  var SPECIALIZATION_CONFIGS = [
    {
      lessonId: 'nutricion-2026-08-13', subjectId: 'nutricion', type: 'decision-flow',
      rendererKind: 'assessment-compass', interaction: 'classify',
      title: { es: 'Brújula de evaluación alimentaria', pt: 'Bússola de avaliação alimentar' },
      sectionLabels: ['Lenguaje básico', 'Cantidad y balance', 'Calidad', 'Armonía', 'Adecuación', 'Variedad y cambio']
    },
    {
      lessonId: 'nutricion-2026-08-27', subjectId: 'nutricion', type: 'comparison-matrix',
      rendererKind: 'label-evidence-audit', interaction: 'classify',
      title: { es: 'Auditoría de guía, envase y evidencia', pt: 'Auditoria de guia, rótulo e evidência' },
      sectionLabels: ['Guías alimentarias', 'Paraguay', 'Complementación', 'Porción', 'Trazabilidad', 'Marketing', 'Aplicación clínica', 'Actividad']
    },
    {
      lessonId: 'fisiologia-2026-08-10', subjectId: 'fisiologia', type: 'clinical-cascade',
      rendererKind: 'oxygen-journey', interaction: 'select-stage',
      title: { es: 'Viaje del oxígeno', pt: 'Viagem do oxigênio' },
      sectionLabels: ['Cuatro etapas', 'Ley de Fick', 'Relación V/Q', 'Oxígeno', 'Dióxido de carbono', 'Afinidad de hemoglobina', 'Integración clínica']
    },
    {
      lessonId: 'fisiologia-2026-08-13', subjectId: 'fisiologia', type: 'regulation-loop',
      rendererKind: 'feedback-loop', interaction: 'select-stage',
      title: { es: 'Bucle de control ventilatorio', pt: 'Ciclo de controle ventilatório' },
      sectionLabels: ['Circuito de control', 'Redes bulbares', 'Modulación pontina', 'Quimiorreceptores centrales', 'Quimiorreceptores periféricos', 'Receptores pulmonares', 'Aplicación clínica']
    },
    {
      lessonId: 'fisiologia-2026-08-17', subjectId: 'fisiologia', type: 'structure-function',
      rendererKind: 'neural-signal-chain', interaction: 'select-stage',
      title: { es: 'Cadena de la señal nerviosa', pt: 'Cadeia do sinal nervoso' },
      sectionLabels: ['Organización', 'Neurona', 'Potencial de acción', 'Conducción', 'Sinapsis', 'Receptores y respuesta', 'Transducción sensorial', 'Circuitos']
    },
    {
      lessonId: 'fisiologia-2026-08-20', subjectId: 'fisiologia', type: 'clinical-cascade',
      rendererKind: 'mechanism-effect-circuit', interaction: 'select-stage',
      title: { es: 'Circuito mecanismo–efecto', pt: 'Circuito mecanismo–efeito' },
      sectionLabels: ['01 · ORGANIZACIÓN', '02 · POTENCIAL DE ACCIÓN', '03 · CONDUCCIÓN', '04 · SINAPSIS', '05 · TRANSDUCCIÓN SENSITIVA', '06 · APLICACIÓN CLÍNICA']
    },
    {
      lessonId: 'fisiologia-2026-08-24', subjectId: 'fisiologia', type: 'structure-function',
      rendererKind: 'receptor-pathway-map', interaction: 'compare',
      title: { es: 'Mapa receptor–vía–corteza', pt: 'Mapa receptor–via–córtex' },
      sectionLabels: ['Mapa sensorial', 'Receptores cutáneos', 'Propiocepción', 'Dolor', 'Temperatura', 'Vías ascendentes', 'Corteza']
    },
    {
      lessonId: 'fisiologia-2026-08-27', subjectId: 'fisiologia', type: 'diagnostic-tree',
      rendererKind: 'lesion-localizer', interaction: 'branch',
      title: { es: 'Localizador de lesiones sensitivas', pt: 'Localizador de lesões sensitivas' },
      sectionLabels: ['Propiocepción', 'Tacto', 'Nocicepción', 'Termorrecepción', 'Columna dorsal', 'Anterolateral', 'Lesiones', 'Alcance']
    },
    {
      lessonId: 'bioquimica-2026-08-14', subjectId: 'bioquimica', type: 'pathway',
      rendererKind: 'glycolysis-simulator', interaction: 'counter',
      title: { es: 'Simulador de glucólisis', pt: 'Simulador de glicólise' },
      sectionLabels: ['Objetivo y lugar', 'Inversión', 'División', 'Oxidación y electrones', 'Beneficio', 'Tres puertas irreversibles', 'Control hormonal', 'Destino del piruvato']
    },
    {
      lessonId: 'bioquimica-2026-08-19', subjectId: 'bioquimica', type: 'pathway',
      rendererKind: 'pyruvate-crossroads', interaction: 'branch',
      title: { es: 'Encrucijada del piruvato', pt: 'Encruzilhada do piruvato' },
      sectionLabels: ['01 · BALANCE DE LA GLUCÓLISIS', '02 · PUNTOS DE REGULACIÓN', '03 · DESTINOS DEL PIRUVATO', '04 · COMPLEJO PIRUVATO DESHIDROGENASA', '05 · CONTROL DEL COMPLEJO', '06 · CONEXIÓN CLÍNICA']
    },
    {
      lessonId: 'bioquimica-2026-08-21', subjectId: 'bioquimica', type: 'clinical-cascade',
      rendererKind: 'dual-causal-chain', interaction: 'branch',
      title: { es: 'Doble cadena causal de la cetoacidosis', pt: 'Dupla cadeia causal da cetoacidose' },
      sectionLabels: ['01 · DISPARADOR HORMONAL', '02 · HIPERGLUCEMIA Y PÉRDIDA DE AGUA', '03 · LIPÓLISIS Y CETOGÉNESIS', '04 · RESPUESTA COMPENSATORIA', '05 · BALANCE DE POTASIO', '06 · OSMOLARIDAD Y CEREBRO']
    },
    {
      lessonId: 'bioquimica-2026-08-26', subjectId: 'bioquimica', type: 'pathway',
      rendererKind: 'metabolic-crossroads', interaction: 'branch',
      title: { es: 'Encrucijada metabólica', pt: 'Encruzilhada metabólica' },
      sectionLabels: ['01 · ENCRUCIJADA METABÓLICA', '02 · REPASO CORREGIDO DE CAD', '03 · LIPÓLISIS Y CETOGÉNESIS', '04 · POTASIO Y PRINCIPIOS DE CORRECCIÓN', '05 · LACTATO Y LACTATO DESHIDROGENASA', '06 · CICLO DE CORI', '07 · BALANCE ENERGÉTICO', '08 · VÍA DE LAS PENTOSAS FOSFATO', '09 · DOS FASES, DOS LÓGICAS', '10 · NADPH, RIBOSA Y G6PD']
    },
    {
      lessonId: 'bioquimica-2026-08-28', subjectId: 'bioquimica', type: 'pathway',
      rendererKind: 'carbon-electron-ledger', interaction: 'counter',
      title: { es: 'Libro mayor de carbonos y electrones', pt: 'Razão de carbonos e elétrons' },
      sectionLabels: ['Objetivos', 'Entrada regulada', 'Fase oxidativa', 'Balance de carbonos', 'Pentosas', 'Reordenamiento', 'Balance no oxidativo', 'Necesidad de nucleótidos', 'Necesidad de NADPH', 'Protección y síntesis', 'Preparación siguiente', 'Actividad oral anunciada']
    },
    {
      lessonId: 'epidemiologia-bloque-anterior', subjectId: 'epidemiologia', type: 'levels-map',
      rendererKind: 'care-network-priority-map', interaction: 'branch',
      title: { es: 'Mapa de red y prioridad asistencial', pt: 'Mapa de rede e prioridade assistencial' },
      sectionLabels: ['Atención Primaria', 'Integralidad', 'Sectorización', 'Referencia', 'Urgencia y emergencia', 'Recepción y triage', 'Cinco niveles', 'Conducta inicial']
    },
    {
      lessonId: 'epidemiologia-2026-08-19', subjectId: 'epidemiologia', type: 'timeline',
      rendererKind: 'emergency-system-flow', interaction: 'select-stage',
      title: { es: 'Flujo del sistema de urgencias', pt: 'Fluxo do sistema de urgências' },
      sectionLabels: ['01 · COMPRENDER LA DEMANDA', '02 · ORGANIZACIÓN DEL SIUE', '03 · CENTRO COORDINADOR', '04 · ASISTENCIA Y TRANSPORTE', '05 · TRIAGE DE CINCO NIVELES', '06 · ORGANIZACIÓN HOSPITALARIA', '07 · MÚLTIPLES VÍCTIMAS', '08 · CONTINUIDAD EN LA RED', '09 · PROYECTO DE LA CLASE']
    },
    {
      lessonId: 'epidemiologia-2026-08-26', subjectId: 'epidemiologia', type: 'decision-flow',
      rendererKind: 'triage-decision-tree', interaction: 'branch',
      title: { es: 'Árbol de decisión de triaje', pt: 'Árvore de decisão de triagem' },
      sectionLabels: ['01 · PROPÓSITO DE LA RAC', '02 · CINCO NIVELES', '03 · URGENCIA O EMERGENCIA', '04 · MÉTODO FIJO DE LA PROFESORA', '05 · SIGNOS VITALES Y ALARMAS', '06 · TRAUMA, HERIDAS Y QUEMADURAS', '07 · EXPOSICIONES Y CUADROS MÉDICOS', '08 · NOTIFICACIÓN EPIDEMIOLÓGICA', '09 · SISTEMA DE SALUD EN PARAGUAY', '10 · REGLA DE EXAMEN']
    },
    {
      lessonId: 'epidemiologia-2026-08-28', subjectId: 'epidemiologia', type: 'levels-map',
      rendererKind: 'health-network-router', interaction: 'branch',
      title: { es: 'Enrutador de la red de salud', pt: 'Roteador da rede de saúde' },
      sectionLabels: ['Mapa del sistema', 'MSPBS', 'Otros subsistemas', 'RIISS', 'Microred', 'Nivel y complejidad', 'Primer nivel', 'Segundo y tercer nivel', 'Cuarto nivel', 'Apoyo transversal', 'Tres métodos de triage', 'Preparación práctica']
    },
    {
      lessonId: 'microbiologia-teorica-2026-08-10', subjectId: 'microbiologia-teorica', type: 'diagnostic-tree',
      rendererKind: 'dermatophyte-diagnostic-matrix', interaction: 'compare',
      title: { es: 'Matriz diagnóstica de dermatofitos', pt: 'Matriz diagnóstica de dermatófitos' },
      sectionLabels: ['Profundidad', 'Dermatofitos', 'Transmisión', 'Tiñas por sitio', 'Muestra y examen directo', 'Cultivo y Wood', 'Tratamiento', 'Caso integrado']
    },
    {
      lessonId: 'microbiologia-teorica-2026-08-17', subjectId: 'microbiologia-teorica', type: 'comparison-matrix',
      rendererKind: 'differential-comparator', interaction: 'compare',
      title: { es: 'Comparador diferencial', pt: 'Comparador diferencial' },
      sectionLabels: ['Profundidad', 'Caso de pitiriasis', 'Malassezia', 'Caso de tiña', 'Fuente animal', 'Cultivo']
    },
    {
      lessonId: 'microbiologia-teorica-2026-08-24', subjectId: 'microbiologia-teorica', type: 'diagnostic-tree',
      rendererKind: 'depth-first-diagnostic-tree', interaction: 'branch',
      title: { es: 'Árbol diagnóstico por profundidad', pt: 'Árvore diagnóstica por profundidade' },
      sectionLabels: ['Mapa por profundidad', 'Caso 1', 'Caso 2', 'Comparación', 'Entrada subcutánea', 'Esporotricosis', 'Cromoblastomicosis', 'Micetoma eumicótico', 'Segundo eumicetoma', 'Candida oportunista', 'Decisión segura']
    },
    {
      lessonId: 'microbiologia-practica-anterior', subjectId: 'microbiologia-practica', type: 'lab-protocol',
      rendererKind: 'safe-lab-workflow', interaction: 'select-stage',
      title: { es: 'Flujo seguro de laboratorio', pt: 'Fluxo seguro de laboratório' },
      sectionLabels: ['Formas de crecimiento', 'Estructuras', 'Muestra', 'Sabouraud', 'Preparación', 'Lectura integrada', 'Bioseguridad']
    },
    {
      lessonId: 'microbiologia-practica-2026-08-20', subjectId: 'microbiologia-practica', type: 'lab-protocol',
      rendererKind: 'mycology-lab-pipeline', interaction: 'select-stage',
      title: { es: 'Circuito de diagnóstico micológico', pt: 'Circuito de diagnóstico micológico' },
      sectionLabels: ['01 · FASE PREANALÍTICA', '02 · EXAMEN DIRECTO CON KOH', '03 · LÁMPARA DE WOOD', '04 · MONTAJE CON AZUL DE LACTOFENOL', '05 · CULTIVO', '06 · INTEGRACIÓN DIAGNÓSTICA', '07 · EJEMPLOS DE LECTURA']
    },
    {
      lessonId: 'microbiologia-practica-2026-08-27', subjectId: 'microbiologia-practica', type: 'recognition-map',
      rendererKind: 'morphology-recognition-station', interaction: 'classify',
      title: { es: 'Estación de reconocimiento morfológico', pt: 'Estação de reconhecimento morfológico' },
      sectionLabels: ['Método', 'Mohos', 'Estructuras', 'Levaduras', 'Caso 1', 'Caso 2', 'Bioseguridad', 'Límite']
    }
  ];

  var SPECIALIZATIONS_BY_LESSON = {};
  SPECIALIZATION_CONFIGS.forEach(function (config) {
    SPECIALIZATIONS_BY_LESSON[config.lessonId] = createSpecialization(config);
  });

  // courseSectionIndex is deliberately zero-based against the eight rendered
  // course blocks: 1 = Inversión, 2 = División, 3 = Oxidación, 4 = Beneficio.
  var GLYCOLYSIS_STEPS = [
    {
      number: 1, phase: 'inversión', enzyme: 'Hexoquinasa / glucoquinasa',
      substrate: 'D-glucosa', product: 'Glucosa-6-fosfato', reversible: false,
      multiplier: 1, carbons: 6, inputs: ['ATP'], outputs: ['ADP'],
      atpDelta: -1, atpCumulative: -1, nadhDelta: 0, nadhCumulative: 0, piDelta: 0, waterDelta: 0,
      reactionType: 'Fosforilación',
      mechanism: 'Fosforilación de la glucosa en C6.',
      whatChanges: 'Se añade un fosfato al carbono 6.',
      whatStays: 'Se conservan los 6 carbonos.',
      whyItMatters: 'Retiene y prepara la glucosa para su metabolismo.',
      visualFocus: 'Transferencia del fosfato terminal de ATP al C6.',
      boardId: 'fase-preparatoria-1-3', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 1,
      substrateStructureId: 'd-glucose', productStructureId: 'glucose-6-phosphate',
      modifiedCarbons: [6], moleculesAfter: 1,
      carbonMap: { 1: 'Glucosa-6-fosfato C1', 2: 'Glucosa-6-fosfato C2', 3: 'Glucosa-6-fosfato C3', 4: 'Glucosa-6-fosfato C4', 5: 'Glucosa-6-fosfato C5', 6: 'Glucosa-6-fosfato C6' },
      carbonMapText: 'C1–C6 se conservan; el fosfato se añade en C6.',
      recallQuestion: '¿Qué molécula dona el fosfato de esta reacción?',
      recallAnswer: 'El ATP dona el fosfato y se convierte en ADP; el fosfato queda en C6.'
    },
    {
      number: 2, phase: 'inversión', enzyme: 'Fosfoglucosa isomerasa',
      substrate: 'Glucosa-6-fosfato', product: 'Fructosa-6-fosfato', reversible: true,
      multiplier: 1, carbons: 6, inputs: [], outputs: [],
      atpDelta: 0, atpCumulative: -1, nadhDelta: 0, nadhCumulative: 0, piDelta: 0, waterDelta: 0,
      reactionType: 'Isomerización aldosa–cetosa',
      mechanism: 'Isomerización funcional aldosa–cetosa; no es una epimerización.',
      whatChanges: 'El carbonilo pasa funcionalmente de C1 a C2.',
      whatStays: 'Se conservan 6 carbonos y el fosfato permanece en C6.',
      whyItMatters: 'Prepara la molécula para la segunda fosforilación y la futura escisión.',
      visualFocus: 'Comparación lineal C1=O frente a C2=O.',
      boardId: 'fase-preparatoria-1-3', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 1,
      substrateStructureId: 'glucose-6-phosphate', productStructureId: 'fructose-6-phosphate',
      modifiedCarbons: [1, 2], moleculesAfter: 1,
      carbonMap: { 1: 'Fructosa-6-fosfato C1', 2: 'Fructosa-6-fosfato C2', 3: 'Fructosa-6-fosfato C3', 4: 'Fructosa-6-fosfato C4', 5: 'Fructosa-6-fosfato C5', 6: 'Fructosa-6-fosfato C6' },
      carbonMapText: 'C1–C6 se conservan; la función carbonilo pasa de C1 a C2.',
      recallQuestion: '¿La conversión de glucosa-6-fosfato en fructosa-6-fosfato es una epimerización?',
      recallAnswer: 'No. Es una isomerización aldosa–cetosa: el carbonilo pasa funcionalmente de C1 a C2.'
    },
    {
      number: 3, phase: 'inversión', enzyme: 'Fosfofructoquinasa-1 (PFK-1)',
      substrate: 'Fructosa-6-fosfato', product: 'Fructosa-1,6-bisfosfato', reversible: false,
      multiplier: 1, carbons: 6, inputs: ['ATP'], outputs: ['ADP'],
      atpDelta: -1, atpCumulative: -2, nadhDelta: 0, nadhCumulative: 0, piDelta: 0, waterDelta: 0,
      reactionType: 'Fosforilación',
      mechanism: 'Fosforilación en C1 y paso comprometido de la vía.',
      whatChanges: 'Se añade un fosfato al carbono 1.',
      whatStays: 'Se conservan los 6 carbonos y el fosfato de C6.',
      whyItMatters: 'Compromete la molécula con la vía y constituye el principal punto de control.',
      visualFocus: 'Dos fosfatos en los extremos C1 y C6.',
      boardId: 'fase-preparatoria-1-3', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 1,
      substrateStructureId: 'fructose-6-phosphate', productStructureId: 'fructose-1-6-bisphosphate',
      modifiedCarbons: [1], moleculesAfter: 1,
      carbonMap: { 1: 'Fructosa-1,6-bisfosfato C1', 2: 'Fructosa-1,6-bisfosfato C2', 3: 'Fructosa-1,6-bisfosfato C3', 4: 'Fructosa-1,6-bisfosfato C4', 5: 'Fructosa-1,6-bisfosfato C5', 6: 'Fructosa-1,6-bisfosfato C6' },
      carbonMapText: 'C1–C6 se conservan; el segundo fosfato se añade en C1.',
      recallQuestion: '¿Cuál es el principal punto de control de la glucólisis?',
      recallAnswer: 'La fosfofructoquinasa-1 (PFK-1), que cataliza el paso 3 irreversible.'
    },
    {
      number: 4, phase: 'división', enzyme: 'Aldolasa',
      substrate: 'Fructosa-1,6-bisfosfato', product: 'Dihidroxiacetona fosfato + gliceraldehído-3-fosfato', reversible: true,
      multiplier: 1, carbons: '6 → 3 + 3', inputs: [], outputs: [],
      atpDelta: 0, atpCumulative: -2, nadhDelta: 0, nadhCumulative: 0, piDelta: 0, waterDelta: 0,
      reactionType: 'Escisión aldólica',
      mechanism: 'Ruptura del enlace entre C3 y C4: C1–C3 originan DHAP y C4–C6 originan G3P.',
      whatChanges: 'Se rompe el enlace entre C3 y C4.',
      whatStays: 'Los 6 carbonos se conservan como dos fragmentos de 3 carbonos.',
      whyItMatters: 'Crea las dos triosas que alimentarán la fase de beneficio.',
      visualFocus: 'Seguimiento C1–C3 hacia DHAP y C4–C6 hacia G3P.',
      boardId: 'fase-preparatoria-4-5', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 2,
      substrateStructureId: 'fructose-1-6-bisphosphate',
      productStructureIds: ['dihydroxyacetone-phosphate', 'glyceraldehyde-3-phosphate'],
      modifiedCarbons: [3, 4], moleculesAfter: 2,
      carbonMap: { 1: 'DHAP C3', 2: 'DHAP C2', 3: 'DHAP C1', 4: 'G3P C1', 5: 'G3P C2', 6: 'G3P C3' },
      carbonMapText: 'La ruptura C3–C4 conserva C1–C3 en DHAP y C4–C6 en G3P con la numeración exacta indicada.',
      recallQuestion: '¿La aldolasa produce dos G3P directamente?',
      recallAnswer: 'No. Primero produce DHAP y G3P al romper el enlace entre C3 y C4.'
    },
    {
      number: 5, phase: 'división', enzyme: 'Triosa fosfato isomerasa',
      substrate: 'Dihidroxiacetona fosfato', product: 'Gliceraldehído-3-fosfato', reversible: true,
      multiplier: 1, carbons: 3, inputs: [], outputs: ['2 G3P por glucosa'],
      atpDelta: 0, atpCumulative: -2, nadhDelta: 0, nadhCumulative: 0, piDelta: 0, waterDelta: 0,
      reactionType: 'Isomerización cetotriosa–aldotriosa',
      mechanism: 'DHAP se isomeriza a G3P; desde aquí las reacciones posteriores ocurren dos veces.',
      whatChanges: 'La función carbonilo se reorganiza.',
      whatStays: 'Se conservan los 3 carbonos y el fosfato.',
      whyItMatters: 'Permite que las dos triosas continúen como G3P; desde aquí todo ocurre ×2.',
      visualFocus: 'DHAP y G3P lado a lado con aparición del indicador ×2.',
      boardId: 'fase-preparatoria-4-5', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 2,
      substrateStructureId: 'dihydroxyacetone-phosphate', productStructureId: 'glyceraldehyde-3-phosphate',
      modifiedCarbons: [1, 2], moleculesAfter: 2,
      carbonMap: { 1: 'G3P rama A C3', 2: 'G3P rama A C2', 3: 'G3P rama A C1', 4: 'G3P rama B C1', 5: 'G3P rama B C2', 6: 'G3P rama B C3' },
      carbonMapText: 'Las dos ramas quedan como G3P; la rama A procede de DHAP y la rama B es el G3P directo.',
      recallQuestion: '¿Por qué las reacciones siguientes ocurren dos veces?',
      recallAnswer: 'Porque el DHAP se convierte en un segundo G3P: quedan dos G3P por cada glucosa.',
      transitionBadge: 'DESDE AQUÍ ×2'
    },
    {
      number: 6, phase: 'beneficio', enzyme: 'Gliceraldehído-3-fosfato deshidrogenasa',
      substrate: '2 gliceraldehído-3-fosfato', product: '2 1,3-bisfosfoglicerato', reversible: true,
      multiplier: 2, carbons: '2 × 3', inputs: ['2 Pi libre', '2 NAD+'], outputs: ['2 NADH', '2 H+'],
      atpDelta: 0, atpCumulative: -2, nadhDelta: 2, nadhCumulative: 2, piDelta: -2, waterDelta: 0,
      reactionType: 'Oxidación y fosforilación con Pi',
      mechanism: 'Oxidación y fosforilación con fosfato inorgánico libre; no consume ATP.',
      whatChanges: 'El sustrato se oxida, entra Pi y NAD+ se reduce a NADH.',
      whatStays: 'No se consume ATP para incorporar este fosfato.',
      whyItMatters: 'Conserva energía de oxidación en NADH y en un intermediario de alta energía.',
      visualFocus: 'Flujo G3P + Pi + NAD+ hacia 1,3-BPG + NADH + H+.',
      boardId: 'fase-beneficio-6-10', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 3,
      substrateStructureId: 'glyceraldehyde-3-phosphate', productStructureId: '1-3-bisphosphoglycerate',
      modifiedCarbons: [1], moleculesAfter: 2,
      carbonMap: { 1: '1,3-bisfosfoglicerato rama A C3', 2: '1,3-bisfosfoglicerato rama A C2', 3: '1,3-bisfosfoglicerato rama A C1', 4: '1,3-bisfosfoglicerato rama B C1', 5: '1,3-bisfosfoglicerato rama B C2', 6: '1,3-bisfosfoglicerato rama B C3' },
      carbonMapText: 'Los seis carbonos de origen se conservan en las dos ramas; cada C1 de G3P se oxida y recibe Pi.',
      recallQuestion: '¿El fosfato incorporado en el paso 6 viene de ATP?',
      recallAnswer: 'No. Viene del fosfato inorgánico libre (Pi); NAD+ se reduce a NADH y no se consume ATP.'
    },
    {
      number: 7, phase: 'beneficio', enzyme: 'Fosfoglicerato quinasa',
      substrate: '2 1,3-bisfosfoglicerato', product: '2 3-fosfoglicerato', reversible: true,
      multiplier: 2, carbons: '2 × 3', inputs: ['2 ADP'], outputs: ['2 ATP'],
      atpDelta: 2, atpCumulative: 0, nadhDelta: 0, nadhCumulative: 2, piDelta: 0, waterDelta: 0,
      reactionType: 'Fosforilación a nivel de sustrato',
      mechanism: 'Fosforilación a nivel de sustrato.',
      whatChanges: 'El fosfato de C1 se transfiere a ADP.',
      whatStays: 'El fosfato de C3 permanece en el producto.',
      whyItMatters: 'Recupera los dos ATP invertidos; el ATP neto acumulado vuelve a 0.',
      visualFocus: 'Dos transferencias paralelas ADP → ATP.',
      boardId: 'fase-beneficio-6-10', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 4,
      substrateStructureId: '1-3-bisphosphoglycerate', productStructureId: '3-phosphoglycerate',
      modifiedCarbons: [1], moleculesAfter: 2,
      carbonMap: { 1: '3-fosfoglicerato rama A C3', 2: '3-fosfoglicerato rama A C2', 3: '3-fosfoglicerato rama A C1', 4: '3-fosfoglicerato rama B C1', 5: '3-fosfoglicerato rama B C2', 6: '3-fosfoglicerato rama B C3' },
      carbonMapText: 'Los seis carbonos de origen se conservan en las dos ramas; el fosfato de C1 pasa a ADP en cada copia.',
      recallQuestion: '¿Cuál es el ATP neto acumulado después del paso 7?',
      recallAnswer: 'Cero: los dos ATP formados recuperan los dos ATP invertidos en los pasos 1 y 3.'
    },
    {
      number: 8, phase: 'beneficio', enzyme: 'Fosfoglicerato mutasa',
      substrate: '2 3-fosfoglicerato', product: '2 2-fosfoglicerato', reversible: true,
      multiplier: 2, carbons: '2 × 3', inputs: [], outputs: [],
      atpDelta: 0, atpCumulative: 0, nadhDelta: 0, nadhCumulative: 2, piDelta: 0, waterDelta: 0,
      reactionType: 'Isomerización de posición',
      mechanism: 'El fosfato se desplaza de C3 a C2.',
      whatChanges: 'El fosfato se desplaza de C3 a C2.',
      whatStays: 'No entra ni sale fosfato; se conservan los 3 carbonos.',
      whyItMatters: 'Prepara la molécula para la deshidratación de la etapa siguiente.',
      visualFocus: 'Movimiento visual P: C3 → C2.',
      boardId: 'fase-beneficio-6-10', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 4,
      substrateStructureId: '3-phosphoglycerate', productStructureId: '2-phosphoglycerate',
      modifiedCarbons: [2, 3], moleculesAfter: 2,
      carbonMap: { 1: '2-fosfoglicerato rama A C3', 2: '2-fosfoglicerato rama A C2', 3: '2-fosfoglicerato rama A C1', 4: '2-fosfoglicerato rama B C1', 5: '2-fosfoglicerato rama B C2', 6: '2-fosfoglicerato rama B C3' },
      carbonMapText: 'Los seis carbonos de origen se conservan en las dos ramas; el fosfato se desplaza de C3 a C2 en cada copia.',
      recallQuestion: '¿Qué hace la fosfoglicerato mutasa en esta reacción?',
      recallAnswer: 'Desplaza el fosfato dentro de la misma molécula, de C3 a C2; no entra ni sale fosfato.'
    },
    {
      number: 9, phase: 'beneficio', enzyme: 'Enolasa',
      substrate: '2 2-fosfoglicerato', product: '2 fosfoenolpiruvato', reversible: true,
      multiplier: 2, carbons: '2 × 3', inputs: [], outputs: ['2 H2O'],
      atpDelta: 0, atpCumulative: 0, nadhDelta: 0, nadhCumulative: 2, piDelta: 0, waterDelta: 2,
      reactionType: 'Deshidratación',
      mechanism: 'Deshidratación; se liberan dos moléculas de agua por glucosa.',
      whatChanges: 'Se elimina agua y aparece un doble enlace.',
      whatStays: 'Se conservan los 3 carbonos y el fosfato.',
      whyItMatters: 'Genera PEP, con alto potencial de transferencia de fosfato.',
      visualFocus: 'H + OH → H2O y aparición de un doble enlace.',
      boardId: 'fase-beneficio-6-10', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 4,
      substrateStructureId: '2-phosphoglycerate', productStructureId: 'phosphoenolpyruvate',
      modifiedCarbons: [2, 3], moleculesAfter: 2,
      carbonMap: { 1: 'Fosfoenolpiruvato rama A C3', 2: 'Fosfoenolpiruvato rama A C2', 3: 'Fosfoenolpiruvato rama A C1', 4: 'Fosfoenolpiruvato rama B C1', 5: 'Fosfoenolpiruvato rama B C2', 6: 'Fosfoenolpiruvato rama B C3' },
      carbonMapText: 'Los seis carbonos de origen se conservan en las dos ramas; C2–C3 forman el doble enlace al liberar H2O en cada copia.',
      recallQuestion: '¿Qué molécula se elimina en el paso 9?',
      recallAnswer: 'Agua. Se eliminan dos H2O por glucosa porque la reacción ocurre dos veces.'
    },
    {
      number: 10, phase: 'beneficio', enzyme: 'Piruvato quinasa',
      substrate: '2 fosfoenolpiruvato', product: '2 piruvato', reversible: false,
      multiplier: 2, carbons: '2 × 3', inputs: ['2 ADP'], outputs: ['2 ATP'],
      atpDelta: 2, atpCumulative: 2, nadhDelta: 0, nadhCumulative: 2, piDelta: 0, waterDelta: 0,
      reactionType: 'Transferencia de fosfato y tautomerización',
      mechanism: 'Transfiere el fosfato del PEP al ADP por fosforilación a nivel de sustrato, seguida de tautomerización enol–ceto.',
      whatChanges: 'El fosfato pasa a ADP y el enolpiruvato se tautomeriza a piruvato.',
      whatStays: 'Se conservan los 3 carbonos en cada piruvato.',
      whyItMatters: 'Produce los dos ATP de beneficio neto y forma el producto final.',
      visualFocus: 'PEP → ATP + enolpiruvato → piruvato.',
      boardId: 'fase-beneficio-6-10', sourceStatus: SOURCE_LABELS[3], courseSectionIndex: 4,
      substrateStructureId: 'phosphoenolpyruvate', productStructureId: 'pyruvate',
      modifiedCarbons: [2], moleculesAfter: 2,
      carbonMap: { 1: 'Piruvato rama A C3', 2: 'Piruvato rama A C2', 3: 'Piruvato rama A C1', 4: 'Piruvato rama B C1', 5: 'Piruvato rama B C2', 6: 'Piruvato rama B C3' },
      carbonMapText: 'Los seis carbonos de origen se conservan en dos piruvatos; el fosfato pasa al ADP antes de la tautomerización.',
      recallQuestion: '¿Cuál es el balance directo final por glucosa?',
      recallAnswer: 'Dos piruvatos, dos ATP netos y dos NADH; la glucólisis ocurre en el citosol y no consume O2 de forma directa.'
    }
  ];

  var GLYCOLYSIS_STEP_PT = {
    phase: ['investimento', 'investimento', 'investimento', 'divisão', 'divisão', 'benefício', 'benefício', 'benefício', 'benefício', 'benefício'],
    enzyme: ['Hexoquinase / glicocinase', 'Fosfoglicose isomerase', 'Fosfofrutoquinase-1 (PFK-1)', 'Aldolase', 'Triose-fosfato isomerase', 'Gliceraldeído-3-fosfato desidrogenase', 'Fosfoglicerato quinase', 'Fosfoglicerato mutase', 'Enolase', 'Piruvato quinase'],
    substrate: ['D-glicose', 'Glicose-6-fosfato', 'Frutose-6-fosfato', 'Frutose-1,6-bisfosfato', 'Di-hidroxiacetona fosfato', '2 gliceraldeído-3-fosfato', '2 1,3-bisfosfoglicerato', '2 3-fosfoglicerato', '2 2-fosfoglicerato', '2 fosfoenolpiruvato'],
    product: ['Glicose-6-fosfato', 'Frutose-6-fosfato', 'Frutose-1,6-bisfosfato', 'Di-hidroxiacetona fosfato + gliceraldeído-3-fosfato', 'Gliceraldeído-3-fosfato', '2 1,3-bisfosfoglicerato', '2 3-fosfoglicerato', '2 2-fosfoglicerato', '2 fosfoenolpiruvato', '2 piruvato'],
    reactionType: ['Fosforilação', 'Isomerização aldose–cetose', 'Fosforilação', 'Clivagem aldólica', 'Isomerização cetotriose–aldotriose', 'Oxidação e fosforilação com Pi', 'Fosforilação em nível de substrato', 'Isomerização de posição', 'Desidratação', 'Transferência de fosfato e tautomerização'],
    mechanism: ['Fosforilação da glicose no C6.', 'Isomerização funcional aldose–cetose; não é uma epimerização.', 'Fosforilação no C1 e etapa de comprometimento da via.', 'Ruptura da ligação entre C3 e C4: C1–C3 originam DHAP e C4–C6 originam G3P.', 'O DHAP é isomerizado em G3P; a partir daqui, as reações seguintes ocorrem duas vezes.', 'Oxidação e fosforilação com fosfato inorgânico livre; não consome ATP.', 'Fosforilação em nível de substrato.', 'O fosfato é deslocado do C3 para o C2.', 'Desidratação; duas moléculas de água são liberadas por glicose.', 'Transfere o fosfato do PEP para o ADP por fosforilação em nível de substrato, seguida de tautomerização enol–ceto.'],
    whatChanges: ['Adiciona-se um fosfato ao carbono 6.', 'A carbonila passa funcionalmente do C1 para o C2.', 'Adiciona-se um fosfato ao carbono 1.', 'Rompe-se a ligação entre C3 e C4.', 'A função carbonila é reorganizada.', 'O substrato é oxidado, entra Pi e o NAD+ é reduzido a NADH.', 'O fosfato do C1 é transferido para o ADP.', 'O fosfato é deslocado do C3 para o C2.', 'Elimina-se água e surge uma ligação dupla.', 'O fosfato passa para o ADP e o enolpiruvato é tautomerizado em piruvato.'],
    whatStays: ['Os 6 carbonos são conservados.', 'Os 6 carbonos são conservados e o fosfato permanece no C6.', 'Os 6 carbonos e o fosfato do C6 são conservados.', 'Os 6 carbonos são conservados como dois fragmentos de 3 carbonos.', 'Os 3 carbonos e o fosfato são conservados.', 'Não se consome ATP para incorporar esse fosfato.', 'O fosfato do C3 permanece no produto.', 'Não entra nem sai fosfato; os 3 carbonos são conservados.', 'Os 3 carbonos e o fosfato são conservados.', 'Os 3 carbonos são conservados em cada piruvato.'],
    whyItMatters: ['Retém e prepara a glicose para seu metabolismo.', 'Prepara a molécula para a segunda fosforilação e a futura clivagem.', 'Compromete a molécula com a via e constitui o principal ponto de controle.', 'Cria as duas trioses que alimentarão a fase de benefício.', 'Permite que as duas trioses prossigam como G3P; a partir daqui, tudo ocorre ×2.', 'Conserva energia da oxidação no NADH e em um intermediário de alta energia.', 'Recupera os dois ATP investidos; o ATP líquido acumulado volta a 0.', 'Prepara a molécula para a desidratação da etapa seguinte.', 'Gera PEP, com alto potencial de transferência de fosfato.', 'Produz os dois ATP de ganho líquido e forma o produto final.'],
    visualFocus: ['Transferência do fosfato terminal do ATP para o C6.', 'Comparação linear entre C1=O e C2=O.', 'Dois fosfatos nas extremidades C1 e C6.', 'Rastreamento de C1–C3 para DHAP e de C4–C6 para G3P.', 'DHAP e G3P lado a lado com o aparecimento do indicador ×2.', 'Fluxo de G3P + Pi + NAD+ para 1,3-BPG + NADH + H+.', 'Duas transferências paralelas de ADP para ATP.', 'Movimento visual do P: C3 → C2.', 'H + OH → H2O e aparecimento de uma ligação dupla.', 'PEP → ATP + enolpiruvato → piruvato.'],
    inputs: [['ATP'], [], ['ATP'], [], [], ['2 Pi livres', '2 NAD+'], ['2 ADP'], [], [], ['2 ADP']],
    outputs: [['ADP'], [], ['ADP'], [], ['2 G3P por glicose'], ['2 NADH', '2 H+'], ['2 ATP'], [], ['2 H2O'], ['2 ATP']],
    carbonMapText: ['C1–C6 são conservados; o fosfato é adicionado ao C6.', 'C1–C6 são conservados; a função carbonila passa do C1 para o C2.', 'C1–C6 são conservados; o segundo fosfato é adicionado ao C1.', 'A ruptura C3–C4 conserva C1–C3 no DHAP e C4–C6 no G3P com a numeração exata indicada.', 'Os dois ramos ficam como G3P; o ramo A vem do DHAP e o ramo B é o G3P direto.', 'Os seis carbonos de origem são conservados nos dois ramos; cada C1 do G3P é oxidado e recebe Pi.', 'Os seis carbonos de origem são conservados nos dois ramos; o fosfato do C1 passa para o ADP em cada cópia.', 'Os seis carbonos de origem são conservados nos dois ramos; o fosfato é deslocado do C3 para o C2 em cada cópia.', 'Os seis carbonos de origem são conservados nos dois ramos; C2–C3 formam a ligação dupla ao liberar H2O em cada cópia.', 'Os seis carbonos de origem são conservados em dois piruvatos; o fosfato passa para o ADP antes da tautomerização.'],
    recallQuestion: ['Qual molécula doa o fosfato dessa reação?', 'A conversão de glicose-6-fosfato em frutose-6-fosfato é uma epimerização?', 'Qual é o principal ponto de controle da glicólise?', 'A aldolase produz dois G3P diretamente?', 'Por que as reações seguintes ocorrem duas vezes?', 'O fosfato incorporado na etapa 6 vem do ATP?', 'Qual é o ATP líquido acumulado após a etapa 7?', 'O que a fosfoglicerato mutase faz nessa reação?', 'Qual molécula é eliminada na etapa 9?', 'Qual é o balanço direto final por glicose?'],
    recallAnswer: ['O ATP doa o fosfato e se converte em ADP; o fosfato fica no C6.', 'Não. É uma isomerização aldose–cetose: a carbonila passa funcionalmente do C1 para o C2.', 'A fosfofrutoquinase-1 (PFK-1), que catalisa a etapa 3 irreversível.', 'Não. Primeiro produz DHAP e G3P ao romper a ligação entre C3 e C4.', 'Porque o DHAP se converte em um segundo G3P: ficam dois G3P para cada glicose.', 'Não. Vem do fosfato inorgânico livre (Pi); o NAD+ é reduzido a NADH e não se consome ATP.', 'Zero: os dois ATP formados recuperam os dois ATP investidos nas etapas 1 e 3.', 'Desloca o fosfato dentro da mesma molécula, do C3 para o C2; não entra nem sai fosfato.', 'Água. São eliminadas duas H2O por glicose porque a reação ocorre duas vezes.', 'Dois piruvatos, dois ATP líquidos e dois NADH; a glicólise ocorre no citosol e não consome O2 diretamente.'],
    transitionBadge: [null, null, null, null, 'A PARTIR DAQUI ×2', null, null, null, null, null]
  };

  GLYCOLYSIS_STEPS.forEach(function (step, index) {
    ['phase', 'enzyme', 'substrate', 'product', 'reactionType', 'mechanism', 'whatChanges', 'whatStays', 'whyItMatters', 'visualFocus', 'carbonMapText', 'recallQuestion', 'recallAnswer'].forEach(function (field) {
      step[field] = { es: step[field], pt: GLYCOLYSIS_STEP_PT[field][index] };
    });
    step.inputs = { es: step.inputs.slice(), pt: GLYCOLYSIS_STEP_PT.inputs[index].slice() };
    step.outputs = { es: step.outputs.slice(), pt: GLYCOLYSIS_STEP_PT.outputs[index].slice() };
    if (step.transitionBadge) step.transitionBadge = { es: step.transitionBadge, pt: GLYCOLYSIS_STEP_PT.transitionBadge[index] };
  });

  var STRUCTURES = [
    {
      id: 'd-glucose', name: 'D-glucosa', carbons: 6, representation: 'Fischer',
      linearNotation: 'CHO | H–C–OH | HO–C–H | H–C–OH | H–C–OH | CH2OH',
      carbonGroups: ['C1 CHO', 'C2 OH derecha', 'C3 OH izquierda', 'C4 OH derecha', 'C5 OH derecha', 'C6 CH2OH'],
      role: 'sustrato inicial'
    },
    {
      id: 'l-glucose', name: 'L-glucosa', carbons: 6,
      representation: 'Fischer',
      linearNotation: 'CHO | HO–C–H | H–C–OH | HO–C–H | HO–C–H | CH2OH',
      carbonGroups: ['C1 CHO', 'C2 OH izquierda', 'C3 OH derecha', 'C4 OH izquierda', 'C5 OH izquierda', 'C6 CH2OH'],
      role: 'enantiómero especular de la D-glucosa'
    },
    {
      id: 'd-mannose', name: 'D-manosa', carbons: 6,
      representation: 'Fischer',
      linearNotation: 'CHO | HO–C–H | HO–C–H | H–C–OH | H–C–OH | CH2OH',
      carbonGroups: ['C1 CHO', 'C2 OH izquierda', 'C3 OH izquierda', 'C4 OH derecha', 'C5 OH derecha', 'C6 CH2OH'],
      role: 'epímero de la D-glucosa en C2'
    },
    {
      id: 'd-galactose', name: 'D-galactosa', carbons: 6,
      representation: 'Fischer',
      linearNotation: 'CHO | H–C–OH | HO–C–H | HO–C–H | H–C–OH | CH2OH',
      carbonGroups: ['C1 CHO', 'C2 OH derecha', 'C3 OH izquierda', 'C4 OH izquierda', 'C5 OH derecha', 'C6 CH2OH'],
      role: 'epímero de la D-glucosa en C4'
    },
    {
      id: 'alpha-d-glucopyranose', name: 'α-D-glucopiranosa', carbons: 6,
      representation: 'Haworth',
      linearNotation: 'C1–OH abajo | C2–OH abajo | C3–OH arriba | C4–OH abajo | C5–CH2OH arriba',
      carbonGroups: ['C1 OH abajo', 'C2 OH abajo', 'C3 OH arriba', 'C4 OH abajo', 'C5 CH2OH arriba', 'C6 en CH2OH'],
      role: 'anómero α de la D-glucosa'
    },
    {
      id: 'beta-d-glucopyranose', name: 'β-D-glucopiranosa', carbons: 6,
      representation: 'Haworth',
      linearNotation: 'C1–OH arriba | C2–OH abajo | C3–OH arriba | C4–OH abajo | C5–CH2OH arriba',
      carbonGroups: ['C1 OH arriba', 'C2 OH abajo', 'C3 OH arriba', 'C4 OH abajo', 'C5 CH2OH arriba', 'C6 en CH2OH'],
      role: 'anómero β de la D-glucosa'
    },
    {
      id: 'glucose-6-phosphate', name: 'Glucosa-6-fosfato', carbons: 6,
      linearNotation: 'CHO | CHOH | CHOH | CHOH | CHOH | CH2–O–PO3²⁻',
      carbonGroups: ['C1 aldehído', 'C2–C5 cadena de aldosa', 'C6 fosfato'], role: 'intermediario del paso 1'
    },
    {
      id: 'fructose-6-phosphate', name: 'Fructosa-6-fosfato', carbons: 6,
      linearNotation: 'CH2OH | C=O | CHOH | CHOH | CHOH | CH2–O–PO3²⁻',
      carbonGroups: ['C1 CH2OH', 'C2 cetona', 'C3–C5 cadena', 'C6 fosfato'], role: 'intermediario del paso 2'
    },
    {
      id: 'fructose-1-6-bisphosphate', name: 'Fructosa-1,6-bisfosfato', carbons: 6,
      linearNotation: '²⁻O3PO–CH2 | C=O | CHOH | CHOH | CHOH | CH2–O–PO3²⁻',
      carbonGroups: ['C1 fosfato', 'C2 cetona', 'C3–C5 cadena', 'C6 fosfato'], role: 'intermediario del paso 3'
    },
    {
      id: 'dihydroxyacetone-phosphate', name: 'Dihidroxiacetona fosfato (DHAP)', carbons: 3,
      linearNotation: 'CH2OH–C(=O)–CH2–O–PO3²⁻',
      carbonGroups: ['C1 CH2OH', 'C2 cetona', 'C3 fosfato'], role: 'triosa del paso 4'
    },
    {
      id: 'glyceraldehyde-3-phosphate', name: 'Gliceraldehído-3-fosfato (G3P)', carbons: 3,
      linearNotation: 'CHO–CH(OH)–CH2–O–PO3²⁻',
      carbonGroups: ['C1 aldehído', 'C2 alcohol', 'C3 fosfato'], role: 'triosa que continúa desde el paso 5'
    },
    {
      id: '1-3-bisphosphoglycerate', name: '1,3-bisfosfoglicerato', carbons: 3,
      linearNotation: '²⁻O3PO–O–C(=O)–CH(OH)–CH2–O–PO3²⁻',
      carbonGroups: ['C1 acil fosfato', 'C2 alcohol', 'C3 fosfato'], role: 'intermediario del paso 6'
    },
    {
      id: '3-phosphoglycerate', name: '3-fosfoglicerato', carbons: 3,
      linearNotation: '⁻OOC–CH(OH)–CH2–O–PO3²⁻',
      carbonGroups: ['C1 carboxilato', 'C2 alcohol', 'C3 fosfato'], role: 'intermediario del paso 7'
    },
    {
      id: '2-phosphoglycerate', name: '2-fosfoglicerato', carbons: 3,
      linearNotation: '⁻OOC–CH(O–PO3²⁻)–CH2OH',
      carbonGroups: ['C1 carboxilato', 'C2 fosfato', 'C3 CH2OH'], role: 'intermediario del paso 8'
    },
    {
      id: 'phosphoenolpyruvate', name: 'Fosfoenolpiruvato (PEP)', carbons: 3,
      linearNotation: '⁻OOC–C(O–PO3²⁻)=CH2',
      carbonGroups: ['C1 carboxilato', 'C2 enol fosfato', 'C3 CH2'], role: 'intermediario del paso 9'
    },
    {
      id: 'pyruvate', name: 'Piruvato', carbons: 3,
      linearNotation: '⁻OOC–C(=O)–CH3',
      carbonGroups: ['C1 carboxilato', 'C2 cetona', 'C3 metilo'], role: 'producto directo del paso 10'
    },
    {
      id: 'l-lactate', name: 'L-lactato', carbons: 3,
      linearNotation: '⁻OOC–CH(OH)–CH3 · configuración (S) en C2',
      carbonGroups: ['C1 carboxilato', 'C2 alcohol · configuración (S)', 'C3 metilo'],
      role: 'destino del piruvato; no es uno de los diez intermediarios de la glucólisis'
    }
  ];

  var STRUCTURE_PT = {
    'd-glucose': { name: 'D-glicose', role: 'substrato inicial' },
    'l-glucose': { name: 'L-glicose', role: 'enantiômero especular da D-glicose' },
    'd-mannose': { name: 'D-manose', role: 'epímero da D-glicose no C2' },
    'd-galactose': { name: 'D-galactose', role: 'epímero da D-glicose no C4' },
    'alpha-d-glucopyranose': { name: 'α-D-glicopiranose', role: 'anômero α da D-glicose' },
    'beta-d-glucopyranose': { name: 'β-D-glicopiranose', role: 'anômero β da D-glicose' },
    'glucose-6-phosphate': { name: 'Glicose-6-fosfato', role: 'intermediário da etapa 1' },
    'fructose-6-phosphate': { name: 'Frutose-6-fosfato', role: 'intermediário da etapa 2' },
    'fructose-1-6-bisphosphate': { name: 'Frutose-1,6-bisfosfato', role: 'intermediário da etapa 3' },
    'dihydroxyacetone-phosphate': { name: 'Di-hidroxiacetona fosfato (DHAP)', role: 'triose da etapa 4' },
    'glyceraldehyde-3-phosphate': { name: 'Gliceraldeído-3-fosfato (G3P)', role: 'triose que prossegue a partir da etapa 5' },
    '1-3-bisphosphoglycerate': { name: '1,3-bisfosfoglicerato', role: 'intermediário da etapa 6' },
    '3-phosphoglycerate': { name: '3-fosfoglicerato', role: 'intermediário da etapa 7' },
    '2-phosphoglycerate': { name: '2-fosfoglicerato', role: 'intermediário da etapa 8' },
    'phosphoenolpyruvate': { name: 'Fosfoenolpiruvato (PEP)', role: 'intermediário da etapa 9' },
    pyruvate: { name: 'Piruvato', role: 'produto direto da etapa 10' },
    'l-lactate': { name: 'L-lactato', role: 'destino do piruvato; não é um dos dez intermediários da glicólise' }
  };

  STRUCTURES.forEach(function (structure) {
    var pt = STRUCTURE_PT[structure.id];
    structure.name = { es: structure.name, pt: pt.name };
    structure.role = { es: structure.role, pt: pt.role };
  });

  var COMPARISONS = [
    {
      id: 'd-l-glucose', pair: ['D-glucosa', 'L-glucosa'], relation: 'enantiómeros',
      leftStructureId: 'd-glucose', rightStructureId: 'l-glucose', representation: 'Fischer',
      highlightCarbons: [2, 3, 4, 5],
      discriminant: 'configuración especular de todos los centros quirales; D/L se asigna por el centro quiral más alejado del carbonilo',
      whatChanges: 'Se invierte la configuración de C2, C3, C4 y C5.',
      whatStays: 'Se conservan la fórmula, la conectividad, el aldehído en C1 y el CH2OH en C6.',
      recallQuestion: '¿Qué centros quirales deben invertirse para pasar de D-glucosa a L-glucosa?',
      recallAnswer: 'C2, C3, C4 y C5: son imágenes especulares no superponibles.'
    },
    {
      id: 'glucose-mannose', pair: ['D-glucosa', 'D-manosa'], relation: 'epímeros',
      leftStructureId: 'd-glucose', rightStructureId: 'd-mannose', representation: 'Fischer',
      highlightCarbons: [2],
      discriminant: 'difieren solo en la configuración de C2',
      whatChanges: 'Cambia únicamente la orientación del OH en C2.',
      whatStays: 'Se conservan la conectividad y la configuración de C3, C4 y C5.',
      recallQuestion: '¿En qué carbono son epímeras la glucosa y la manosa?',
      recallAnswer: 'En C2.'
    },
    {
      id: 'glucose-galactose', pair: ['D-glucosa', 'D-galactosa'], relation: 'epímeros',
      leftStructureId: 'd-glucose', rightStructureId: 'd-galactose', representation: 'Fischer',
      highlightCarbons: [4],
      discriminant: 'difieren solo en la configuración de C4',
      whatChanges: 'Cambia únicamente la orientación del OH en C4.',
      whatStays: 'Se conservan la conectividad y la configuración de C2, C3 y C5.',
      recallQuestion: '¿En qué carbono son epímeras la glucosa y la galactosa?',
      recallAnswer: 'En C4.'
    },
    {
      id: 'alpha-beta-glucose', pair: ['α-D-glucosa', 'β-D-glucosa'], relation: 'anómeros',
      leftStructureId: 'alpha-d-glucopyranose', rightStructureId: 'beta-d-glucopyranose', representation: 'Haworth',
      highlightCarbons: [1],
      discriminant: 'difieren en la configuración del carbono anomérico C1',
      whatChanges: 'Cambia la orientación del OH anomérico en C1: abajo en α y arriba en β para D-glucosa.',
      whatStays: 'Se conservan la configuración de los otros centros y el CH2OH de C5 orientado arriba.',
      recallQuestion: '¿Qué carbono distingue los anómeros α y β de la D-glucosa?',
      recallAnswer: 'C1, el carbono anomérico.'
    },
    {
      id: 'g6p-f6p', pair: ['Glucosa-6-fosfato', 'Fructosa-6-fosfato'], relation: 'isómeros funcionales aldosa–cetosa',
      leftStructureId: 'glucose-6-phosphate', rightStructureId: 'fructose-6-phosphate', representation: 'cadena abierta',
      highlightCarbons: [1, 2],
      discriminant: 'el carbonilo cambia de aldehído en C1 a cetona en C2; no es epimerización',
      whatChanges: 'La función carbonilo pasa de aldehído en C1 a cetona en C2.',
      whatStays: 'Se conservan los 6 carbonos y el fosfato en C6.',
      recallQuestion: '¿Por qué G6P y F6P no son epímeros?',
      recallAnswer: 'Porque cambia la función y la posición del carbonilo, no la configuración de un solo centro quiral.'
    },
    {
      id: '3pg-2pg', pair: ['3-fosfoglicerato', '2-fosfoglicerato'], relation: 'isómeros de posición',
      leftStructureId: '3-phosphoglycerate', rightStructureId: '2-phosphoglycerate', representation: 'cadena abierta',
      highlightCarbons: [2, 3],
      discriminant: 'el fosfato se desplaza de C3 a C2',
      whatChanges: 'Cambia la posición del fosfato: C3 → C2.',
      whatStays: 'Se conservan los 3 carbonos, el carboxilato en C1 y el mismo fosfato.',
      recallQuestion: '¿Entra o sale fosfato al convertir 3PG en 2PG?',
      recallAnswer: 'No: el fosfato se desplaza dentro de la misma molécula.'
    },
    {
      id: 'stereochemical-terms', pair: ['Conformación', 'Configuración', 'Tautomerización'], relation: 'conceptos distintos',
      discriminant: 'la conformación cambia por rotación alrededor de enlaces simples, sin romper enlaces ni cambiar la conectividad; la configuración describe la disposición estereoquímica; la tautomerización redistribuye protones y enlaces dobles',
      whatChanges: 'La conformación modifica la disposición espacial por rotación; la configuración cambia la disposición estereoquímica; la tautomerización redistribuye protones y enlaces dobles.',
      whatStays: 'Los tres términos no son intercambiables y conservan el esqueleto carbonado de la molécula.',
      recallQuestion: '¿Qué proceso convierte el enolpiruvato en piruvato después de transferir el fosfato?',
      recallAnswer: 'Una tautomerización enol–ceto; no es un cambio de conformación ni de configuración.'
    }
  ];

  var COMPARISON_PT = {
    'd-l-glucose': {
      pair: ['D-glicose', 'L-glicose'], relation: 'enantiômeros',
      discriminant: 'configuração especular de todos os centros quirais; D/L é atribuído pelo centro quiral mais distante da carbonila',
      whatChanges: 'A configuração de C2, C3, C4 e C5 é invertida.', whatStays: 'Conservam-se a fórmula, a conectividade, o aldeído no C1 e o CH2OH no C6.',
      recallQuestion: 'Quais centros quirais devem ser invertidos para passar de D-glicose a L-glicose?', recallAnswer: 'C2, C3, C4 e C5: são imagens especulares não sobreponíveis.'
    },
    'glucose-mannose': {
      pair: ['D-glicose', 'D-manose'], relation: 'epímeros', discriminant: 'diferem apenas na configuração do C2',
      whatChanges: 'Muda somente a orientação do OH no C2.', whatStays: 'Conservam-se a conectividade e a configuração de C3, C4 e C5.',
      recallQuestion: 'Em qual carbono a glicose e a manose são epímeras?', recallAnswer: 'No C2.'
    },
    'glucose-galactose': {
      pair: ['D-glicose', 'D-galactose'], relation: 'epímeros', discriminant: 'diferem apenas na configuração do C4',
      whatChanges: 'Muda somente a orientação do OH no C4.', whatStays: 'Conservam-se a conectividade e a configuração de C2, C3 e C5.',
      recallQuestion: 'Em qual carbono a glicose e a galactose são epímeras?', recallAnswer: 'No C4.'
    },
    'alpha-beta-glucose': {
      pair: ['α-D-glicose', 'β-D-glicose'], relation: 'anômeros', discriminant: 'diferem na configuração do carbono anomérico C1',
      whatChanges: 'Muda a orientação do OH anomérico no C1: para baixo em α e para cima em β na D-glicose.', whatStays: 'Conservam-se a configuração dos outros centros e o CH2OH do C5 orientado para cima.',
      recallQuestion: 'Qual carbono distingue os anômeros α e β da D-glicose?', recallAnswer: 'C1, o carbono anomérico.'
    },
    'g6p-f6p': {
      pair: ['Glicose-6-fosfato', 'Frutose-6-fosfato'], relation: 'isômeros funcionais aldose–cetose',
      discriminant: 'a carbonila muda de aldeído no C1 para cetona no C2; não é epimerização',
      whatChanges: 'A função carbonila passa de aldeído no C1 para cetona no C2.', whatStays: 'Conservam-se os 6 carbonos e o fosfato no C6.',
      recallQuestion: 'Por que G6P e F6P não são epímeros?', recallAnswer: 'Porque mudam a função e a posição da carbonila, não a configuração de um único centro quiral.'
    },
    '3pg-2pg': {
      pair: ['3-fosfoglicerato', '2-fosfoglicerato'], relation: 'isômeros de posição', discriminant: 'o fosfato é deslocado do C3 para o C2',
      whatChanges: 'Muda a posição do fosfato: C3 → C2.', whatStays: 'Conservam-se os 3 carbonos, o carboxilato no C1 e o mesmo fosfato.',
      recallQuestion: 'Entra ou sai fosfato ao converter 3PG em 2PG?', recallAnswer: 'Não: o fosfato é deslocado dentro da mesma molécula.'
    },
    'stereochemical-terms': {
      pair: ['Conformação', 'Configuração', 'Tautomerização'], relation: 'conceitos distintos',
      discriminant: 'a conformação muda por rotação em torno de ligações simples, sem romper ligações nem mudar a conectividade; a configuração descreve a disposição estereoquímica; a tautomerização redistribui prótons e ligações duplas',
      whatChanges: 'A conformação modifica a disposição espacial por rotação; a configuração muda a disposição estereoquímica; a tautomerização redistribui prótons e ligações duplas.',
      whatStays: 'Os três termos não são intercambiáveis e conservam o esqueleto carbônico da molécula.',
      recallQuestion: 'Qual processo converte o enolpiruvato em piruvato após a transferência do fosfato?', recallAnswer: 'Uma tautomerização enol–ceto; não é uma mudança de conformação nem de configuração.'
    }
  };

  COMPARISONS.forEach(function (comparison) {
    var pt = COMPARISON_PT[comparison.id];
    comparison.pair = { es: comparison.pair.slice(), pt: pt.pair.slice() };
    ['relation', 'discriminant', 'whatChanges', 'whatStays', 'recallQuestion', 'recallAnswer'].forEach(function (field) {
      comparison[field] = { es: comparison[field], pt: pt[field] };
    });
  });

  var BOARD_BASE = 'assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2/';
  var BOARDS = {
    sourceStatus: SOURCE_LABELS[0],
    core: [
      { id: 'mapa-general', title: 'Mapa general', path: BOARD_BASE + '01-mapa-general.webp' },
      { id: 'fase-preparatoria-1-3', title: 'Fase preparatoria · pasos 1–3', path: BOARD_BASE + '02-fase-preparatoria-1-3.webp' },
      { id: 'fase-preparatoria-4-5', title: 'Fase preparatoria · pasos 4–5', path: BOARD_BASE + '03-fase-preparatoria-4-5.webp' },
      { id: 'fase-beneficio-6-10', title: 'Fase de beneficio · pasos 6–10', path: BOARD_BASE + '04-fase-beneficio-6-10.webp' }
    ],
    archive: [
      { id: 'mapa-general', title: 'Mapa general', path: BOARD_BASE + '01-mapa-general.webp' },
      { id: 'fase-preparatoria-1-3', title: 'Fase preparatoria · pasos 1–3', path: BOARD_BASE + '02-fase-preparatoria-1-3.webp' },
      { id: 'fase-preparatoria-4-5', title: 'Fase preparatoria · pasos 4–5', path: BOARD_BASE + '03-fase-preparatoria-4-5.webp' },
      { id: 'fase-beneficio-6-10', title: 'Fase de beneficio · pasos 6–10', path: BOARD_BASE + '04-fase-beneficio-6-10.webp' },
      { id: 'balance-final', title: 'Balance final', path: BOARD_BASE + '05-balance-final.webp' },
      { id: 'regulacion-resumen', title: 'Regulación · resumen', path: BOARD_BASE + '06-regulacion-resumen.webp' },
      { id: 'regulacion-anotada', title: 'Regulación · anotada', path: BOARD_BASE + '07-regulacion-anotada.webp' }
    ]
  };

  BOARDS.core.concat(BOARDS.archive).forEach(function (board) {
    board.sourceStatus = SOURCE_LABELS[0];
  });

  var GLYCOLYSIS = {
    lessonId: 'bioquimica-2026-08-14',
    title: { es: 'Glucólisis: vía común y balance energético', pt: 'Glicólise: via comum e balanço energético' },
    centralQuestion: {
      es: '¿Cómo transforma la célula una glucosa en dos piruvatos y obtiene energía?',
      pt: 'Como a célula transforma uma glicose em dois piruvatos e obtém energia?'
    },
    location: { es: 'citosol', pt: 'citosol' },
    oxygen: { es: 'No consume O2 de forma directa.', pt: 'Não consome O2 diretamente.' },
    steps: GLYCOLYSIS_STEPS,
    structures: STRUCTURES,
    comparisons: COMPARISONS,
    boards: BOARDS,
    invariants: {
      orderedStepCount: 10,
      irreversibleSteps: [1, 3, 10],
      multiplierTwoSteps: [6, 7, 8, 9, 10],
      multiplierBeginsAfterStep: 5,
      split: { step: 4, bond: 'C3–C4', products: ['DHAP', 'G3P'] },
      cumulativeATP: { 1: -1, 3: -2, 7: 0, 10: 2 },
      nadhProducedAtStep: { step: 6, total: 2 },
      waterProducedAtStep: { step: 9, total: 2 },
      substrateLevelPhosphorylationSteps: [7, 10]
    },
    balance: {
      glucose: -1,
      atpInvested: 2,
      atpProduced: 4,
      atpNet: 2,
      nadhNet: 2,
      pyruvateNet: 2,
      waterNet: 2,
      directSummary: {
        es: '1 glucosa → 2 piruvatos + 2 ATP netos + 2 NADH',
        pt: '1 glicose → 2 piruvatos + 2 ATP líquidos + 2 NADH'
      },
      nadhYieldCaveat: {
        es: 'El balance directo informa 2 NADH citosólicos; no asigna un rendimiento fijo de ATP a esos NADH.',
        pt: 'O balanço direto informa 2 NADH citosólicos; não atribui um rendimento fixo de ATP a esses NADH.'
      }
    },
    directNetBalance: { atp: 2, nadh: 2, pyruvate: 2 }
  };

  var DATE_STATUS_BY_LESSON = {};
  LESSON_IDS.forEach(function (lessonId) {
    DATE_STATUS_BY_LESSON[lessonId] = ESTIMATED_LESSON_IDS.indexOf(lessonId) === -1
      ? null
      : SOURCE_LABELS[4];
  });

  Object.keys(SUBJECTS).forEach(function (subjectId) {
    SUBJECTS[subjectId].lessonIds = LESSON_IDS.filter(function (lessonId) {
      return LESSON_SUBJECT_BY_ID[lessonId] === subjectId;
    });
  });

  var MODE_BY_ID = {};
  var MODE_BY_KEY = {};
  MODES.forEach(function (mode) {
    MODE_BY_ID[mode.id] = mode;
    MODE_BY_KEY[mode.key] = mode;
  });

  var LESSON_IDS_BY_SUBJECT = {};
  Object.keys(SUBJECTS).forEach(function (subjectId) {
    LESSON_IDS_BY_SUBJECT[subjectId] = SUBJECTS[subjectId].lessonIds.slice();
  });

  window.MedNykutoS4LearningModel = {
    version: 'v178',
    modes: MODES,
    modeById: MODE_BY_ID,
    modeByKey: MODE_BY_KEY,
    sourceLabels: SOURCE_LABELS,
    sourceStatuses: SOURCE_LABELS,
    themes: THEMES,
    readingThemes: THEMES,
    subjectOrder: ['nutricion', 'fisiologia', 'bioquimica', 'epidemiologia', 'microbiologia-teorica', 'microbiologia-practica'],
    subjects: SUBJECTS,
    subjectMeta: SUBJECTS,
    lessonIds: LESSON_IDS,
    lessonIdsBySubject: LESSON_IDS_BY_SUBJECT,
    lessonSubjectById: LESSON_SUBJECT_BY_ID,
    estimatedLessonIds: ESTIMATED_LESSON_IDS,
    dateStatusByLesson: DATE_STATUS_BY_LESSON,
    specializationsByLesson: SPECIALIZATIONS_BY_LESSON,
    glycolysis: GLYCOLYSIS,
    structures: STRUCTURES,
    comparisons: COMPARISONS,
    boards: BOARDS,
    getSubjectForLesson: function (lessonId) {
      return LESSON_SUBJECT_BY_ID[lessonId] || null;
    },
    getSpecializationForLesson: function (lessonId) {
      return SPECIALIZATIONS_BY_LESSON[lessonId] || null;
    }
  };
})();
