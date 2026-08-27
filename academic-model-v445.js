(function () {
  'use strict';

  var teachers = {
    'andrea-lopez': {
      id: 'andrea-lopez',
      name: 'Dra. Andrea López',
      subject: 'Bioquímica II',
      accent: '#34d399',
      confidence: 'Alta en el método · media en el formato de examen',
      confidenceReason: 'Tres clases orales completas, pizarras, actividades manuscritas y preguntas explícitas de la docente permiten reconocer un patrón repetido. La forma exacta del examen todavía necesita más evaluaciones reales.',
      evidence: [
        { date: '14 ago.', state: 'observed', label: 'Glucólisis: vía, balance, regulación y correcciones de la pizarra.' },
        { date: '19 ago.', state: 'confirmed', label: 'Preguntas orales repetidas sobre enzimas, PFK-1/F2,6BP, destinos del piruvato y PDH.' },
        { date: '21 ago.', state: 'confirmed', label: 'Cadena de cetoacidosis: objetivo, por qué ocurre, consecuencia y manifestación clínica.' },
        { date: '21 ago.', state: 'observed', label: 'Actividades 3 y 4: desarrollo manuscrito y razonamiento paso a paso.' },
        { date: '26 ago.', state: 'confirmed', label: 'Ciclo de Cori y pentosas fosfato: objetivo, balance energético, conexiones entre tejidos y productos de cada fase.' }
      ],
      teachingArchitecture: [
        'Parte de una vía o problema metabólico y mantiene una cadena causal hasta la consecuencia clínica.',
        'Vuelve a las enzimas reguladoras, balances, compartimentos y cofactores para comprobar que la ruta se entiende.',
        'Usa la nomenclatura de las enzimas como pista: sustrato, tipo de reacción y producto esperado.',
        'Interrumpe la explicación con preguntas cortas y pide justificar, no solo nombrar.'
      ],
      reasoningPath: [
        'Definir el objetivo fisiológico de la vía.',
        'Localizar compartimento, sustrato, producto y balance.',
        'Identificar la enzima o el punto regulador que cambia el flujo.',
        'Responder por qué cambia y qué consecuencia metabólica produce.',
        'Conectar la consecuencia con un dato clínico o de laboratorio.'
      ],
      importanceSignals: [
        'Repite una enzima o un regulador y vuelve a preguntar su función.',
        'Formula “¿cuál es el objetivo?”, “¿por qué ocurre?” o “¿cuál es la consecuencia?”.',
        'Dibuja flechas entre vías o compara concentración sérica con contenido corporal.',
        'Relaciona una vitamina con cofactor, reacción bloqueada y manifestación.'
      ],
      observedQuestionFormats: [
        'Pregunta oral breve seguida de una segunda pregunta causal.',
        'Completar una secuencia metabólica con enzima, producto o cofactor.',
        'Explicar un caso desde el mecanismo hasta el hallazgo clínico.',
        'Comparar dos estados metabólicos sin perder el balance global.'
      ],
      likelyExamTargets: [
        'Mecanismo → por qué → consecuencia → manifestación clínica.',
        'Regulación de una vía cuando cambia el estado energético u hormonal.',
        'Déficit vitamínico o enzimático interpretado desde la reacción afectada.',
        'Errores de razonamiento frecuentes: confundir concentración, reserva y flujo.'
      ],
      distractorPolicy: [
        'Usar enzimas o cofactores de la misma ruta como distractores plausibles.',
        'Invertir activación e inhibición solo cuando la explicación corrige el mecanismo exacto.',
        'Evitar opciones absurdas o de otra categoría bioquímica.',
        'No revelar la respuesta por una opción mucho más larga.'
      ],
      hypotheses: [
        'La evaluación escrita podría conservar la secuencia causal de las preguntas orales; aún debe confirmarse con una prueba real.',
        'Los esquemas incompletos podrían tener peso porque las actividades exigen desarrollo manuscrito; todavía es una tendencia.'
      ],
      questionAngles: ['mecanismo', 'por-que', 'consecuencia', 'integracion-clinica'],
      aiPrompt: 'Actúa como la Dra. Andrea López usando únicamente la clase seleccionada. Empieza por el objetivo de la vía, luego pregunta compartimento, sustrato, producto y balance. Continúa con una enzima reguladora y exige que explique por qué cambia el flujo. Termina con una consecuencia clínica o de laboratorio. Haz una sola pregunta por turno, repregunta si falta el mecanismo y no introduzcas contenido de otra fecha.'
    },
    'andrea-isasi': {
      id: 'andrea-isasi',
      name: 'Dra. Andrea Isasi',
      subject: 'Epidemiología y Salud Pública',
      accent: '#fbbf24',
      confidence: 'Alta en el método y en los objetivos evaluables',
      confidenceReason: 'Las clases, el PowerPoint, el Manual RAC y la transcripción repiten definiciones operativas, listas, situaciones y decisiones de conducta.',
      evidence: [
        { date: 'Bloque previo', state: 'observed', label: 'APS, integralidad, sectorización, referencia y contrarreferencia.' },
        { date: 'Bloque previo', state: 'observed', label: 'Signos vitales, recepción, acogida y clasificación por riesgo.' },
        { date: '19 ago.', state: 'confirmed', label: 'Urgencia objetiva/subjetiva, emergencia, SIUE y centro coordinador.' },
        { date: '19 ago.', state: 'confirmed', label: 'Ejemplos concretos, conducta inicial, recursos y cinco niveles de triage.' },
        { date: '26 ago.', state: 'confirmed', label: 'Casos clínicos completos: nivel I–V, urgencia o emergencia, signos vitales, riesgo del retraso y ficha epidemiológica.' }
      ],
      teachingArchitecture: [
        'Abre con una situación concreta y pregunta qué haría el estudiante antes de formalizar el concepto.',
        'Define términos próximos y obliga a distinguirlos por riesgo, tiempo o función.',
        'Organiza sistemas complejos en actores, etapas, niveles y circuitos de referencia.',
        'Usa experiencias y escenarios para mostrar por qué una definición cambia la conducta.'
      ],
      reasoningPath: [
        'Reconocer el riesgo y los datos que faltan.',
        'Distinguir urgencia, emergencia, triage y diagnóstico.',
        'Elegir conducta inicial, prioridad y recurso disponible.',
        'Ubicar al paciente dentro de la red o del SIUE.',
        'Explicar continuidad mediante referencia y contrarreferencia.'
      ],
      importanceSignals: [
        'Compara dos palabras que suelen confundirse.',
        'Enumera funciones, niveles, tiempos o componentes de una red.',
        'Pregunta “¿qué harían?” antes de dar la definición.',
        'Vuelve a un ejemplo para corregir una prioridad o una conducta.'
      ],
      observedQuestionFormats: [
        'Definición breve seguida de diferencia operativa.',
        'Lista ordenada de funciones o pasos.',
        'Situación corta para escoger prioridad, nivel o recurso.',
        'Correspondencia entre color, riesgo, tiempo y lugar de atención.'
      ],
      likelyExamTargets: [
        'Urgencia frente a emergencia y triage frente a diagnóstico.',
        'Funciones del SIUE, centro coordinador y transporte.',
        'Niveles I–V y reevaluación durante la espera.',
        'APS, sectorización, integralidad y continuidad de la red.'
      ],
      distractorPolicy: [
        'Usar conceptos vecinos de Salud Pública, no enfermedades sin relación.',
        'Cambiar prioridad, tiempo o función manteniendo el mismo escenario.',
        'Evitar absolutos que vuelvan obvio el distractor.',
        'En casos, cada opción debe ser una conducta comparable.'
      ],
      hypotheses: [
        'La correspondencia completa nivel–color–tiempo podría aparecer en tabla; el formato exacto todavía no está confirmado.',
        'Los ejemplos vividos pueden inspirar casos, pero no deben atribuirse como preguntas reales sin evidencia.'
      ],
      questionAngles: ['definicion-operativa', 'comparacion', 'secuencia', 'conducta'],
      aiPrompt: 'Simula el razonamiento visible de la Dra. Andrea Isasi con la clase seleccionada. Presenta primero una situación breve, pregunta qué dato falta y qué conducta inicial corresponde. Después exige diferenciar los dos conceptos cercanos implicados, ubicar el caso en la red y justificar prioridad o recurso. Alterna definiciones, listas y casos; no conviertas el triage en diagnóstico y no añadas datos fuera del material.'
    },
    'giselle-vert': {
      id: 'giselle-vert',
      name: 'Dra. Giselle Vert',
      subject: 'Fisiología II',
      accent: '#38bdf8',
      confidence: 'Alta en el método de ejercicios · media en el examen',
      confidenceReason: 'El PDF de fijación, las tablas, los casos y dos clases nerviosas muestran de forma repetida que estructura, canal, movimiento iónico y respuesta deben conectarse.',
      evidence: [
        { date: '10 ago.', state: 'observed', label: 'Difusión, relación V/Q y transporte de gases organizados por mecanismo.' },
        { date: '13 ago.', state: 'observed', label: 'Sensores, centros, efectores y aplicación gasométrica.' },
        { date: '17 ago.', state: 'confirmed', label: 'Organización nerviosa, sinapsis, receptores, circuitos y pizarra.' },
        { date: '20 ago.', state: 'confirmed', label: 'Ejercicios reales de asociación, tablas y casos de lidocaína y quemadura.' },
        { date: '24 ago.', state: 'confirmed', label: 'Sensibilidades somáticas: receptores, propiocepción, dolor, temperatura, vías y corteza.' }
      ],
      teachingArchitecture: [
        'Parte de una estructura o estímulo y sigue la señal hasta la respuesta funcional.',
        'Alterna explicación, comparación y ejercicio de aplicación.',
        'Pide relacionar canal o receptor con el cambio eléctrico o fisiológico resultante.',
        'Usa tablas y casos para comprobar si el mecanismo puede transferirse.'
      ],
      reasoningPath: [
        'Identificar estímulo, compartimento o estructura.',
        'Nombrar canal, receptor o vía que cambia.',
        'Precisar dirección del ion, gas o señal.',
        'Predecir potencial, velocidad, ventilación o respuesta.',
        'Aplicar la cadena a un hallazgo o bloqueo.'
      ],
      importanceSignals: [
        'Incluye el concepto en una tabla de asociación.',
        'Pregunta qué cambia si se bloquea un canal o receptor.',
        'Compara dos fibras, sinapsis, receptores o regiones V/Q.',
        'Propone un caso en el que debe localizarse el punto de fallo.'
      ],
      observedQuestionFormats: [
        'Comparación de dos sistemas con explicación del porqué.',
        'Consecuencia de bloquear un canal o una etapa.',
        'Asociación estructura–función–respuesta.',
        'Caso clínico corto resuelto desde el mecanismo.'
      ],
      likelyExamTargets: [
        'Movimiento iónico y fases del potencial de acción.',
        'Conducción según mielina y diámetro.',
        'Sinapsis, calcio, neurotransmisor y receptor.',
        'Transducción sensorial, adaptación y circuitos.',
        'Respiración: sensor, controlador, efector y gasometría.'
      ],
      distractorPolicy: [
        'Cambiar un solo eslabón fisiológico manteniendo opciones de la misma categoría.',
        'Usar movimientos iónicos o receptores plausibles, no términos ajenos.',
        'En comparaciones, todas las opciones deben describir el mismo criterio.',
        'La explicación debe recorrer la cadena y no limitarse a “correcto”.'
      ],
      hypotheses: [
        'La prueba podría reutilizar la lógica de los ejercicios de fijación con datos diferentes; esto es muy probable, pero el formato debe confirmarse.',
        'Las tablas podrían convertirse en asociaciones directas de examen; no se presenta como hecho hasta observar una evaluación.'
      ],
      questionAngles: ['estructura-funcion', 'mecanismo-ionico', 'comparacion', 'aplicacion'],
      aiPrompt: 'Trabaja como la Dra. Giselle Vert usando solo la fecha seleccionada. Presenta un estímulo, estructura o bloqueo; pide identificar el canal, receptor o vía, la dirección del cambio y la respuesta final. Alterna una asociación, una comparación y una aplicación clínica. Si la respuesta nombra solo el resultado, repregunta por el mecanismo. No mezcles respiración y neurofisiología cuando pertenecen a fechas diferentes.'
    },
    'alexander-acuna': {
      id: 'alexander-acuna',
      name: 'Dr. Alexander Acuña',
      subject: 'Microbiología II · Teórica',
      accent: '#2dd4bf',
      confidence: 'Media-alta en el razonamiento clínico',
      confidenceReason: 'Tres PDF, dos series de fotografías y la transcripción muestran un recorrido estable desde profundidad y lesión hasta muestra, agente y tratamiento.',
      evidence: [
        { date: '10 ago.', state: 'observed', label: 'Generalidades, dermatofitos, tiñas por sitio, diagnóstico y tratamiento.' },
        { date: '10 ago.', state: 'observed', label: 'Caso de tiña capitis y vínculo con exposición animal.' },
        { date: '17 ago.', state: 'confirmed', label: 'Pitiriasis versicolor y tiña corporal mostradas paso a paso.' },
        { date: '24 ago.', state: 'confirmed', label: 'Dos historias independientes de eumicetoma y un caso ocupacional de esporotricosis.' },
        { date: '24 ago.', state: 'confirmed', label: 'Micología oportunista: riesgo, laboratorio y formas mucocutáneas de Candida.' }
      ],
      teachingArchitecture: [
        'Clasifica primero por profundidad y después por localización anatómica.',
        'Construye el diagnóstico con historia, lesión, exposición y muestra.',
        'Muestra pistas progresivas antes de revelar agente y justificación.',
        'Compara entidades cercanas para fijar la diferencia clínica y diagnóstica.'
      ],
      reasoningPath: [
        'Definir la profundidad o reconocer un contexto oportunista.',
        'Localizar tejido y describir lesión o patrón.',
        'Buscar exposición y puerta de entrada.',
        'Elegir muestra, examen directo y confirmación.',
        'Proponer agente y tratamiento coherentes con la profundidad.'
      ],
      importanceSignals: [
        'Presenta una fotografía clínica o una pista de exposición.',
        'Contrasta dos casos en una misma diapositiva.',
        'Insiste en el borde activo, el tejido queratinizado, la inoculación o la tríada del micetoma.',
        'Relaciona el examen directo con la especie sin confundir orientación y confirmación.'
      ],
      observedQuestionFormats: [
        'Caso clínico progresivo con diagnóstico y agente.',
        'Comparación entre profundidad, lesión y muestra.',
        'Reconocimiento de patrón clínico o micológico.',
        'Elección de confirmación o tratamiento según el sitio.'
      ],
      likelyExamTargets: [
        'Superficial, cutánea y subcutánea.',
        'Tiña por localización y géneros dermatofíticos.',
        'Pitiriasis versicolor frente a dermatofitosis.',
        'Esporotricosis, cromoblastomicosis y micetoma eumicótico.',
        'Colonización por Candida frente a candidiasis mucocutánea o invasiva.',
        'KOH, cultivo, biopsia y límites de la lámpara de Wood.'
      ],
      distractorPolicy: [
        'Mantener agentes del mismo grupo o diagnósticos de profundidad comparable.',
        'No usar un tratamiento invasivo como distractor caricaturesco.',
        'En reconocimiento, variar una pista relevante y no toda la historia.',
        'Explicar por qué el sitio o la profundidad descartan cada alternativa.'
      ],
      hypotheses: [
        'La evaluación podría conservar casos por revelación progresiva porque esa secuencia se repitió en clase; falta una prueba real.',
        'La morfología de cultivo puede ganar peso en clases posteriores; por ahora se mantiene como tendencia.'
      ],
      questionAngles: ['profundidad-sitio', 'reconocimiento-patron', 'confirmacion', 'comparacion-clinica'],
      aiPrompt: 'Imita el recorrido docente visible del Dr. Alexander Acuña con una sola clase. Da historia, lesión y exposición de forma progresiva. Pregunta primero profundidad y sitio; luego muestra o examen, agente y tratamiento. Exige comparar el caso con una alternativa cercana y justificar la diferencia. No reveles todas las pistas de una vez y no uses hechos ausentes de los PDF o de la transcripción.'
    },
    'ruth-castillo': {
      id: 'ruth-castillo',
      name: 'Dra. Ruth Castillo',
      subject: 'Microbiología II · Práctica',
      accent: '#a78bfa',
      confidence: 'Alta en la secuencia práctica',
      confidenceReason: 'Las dos prácticas y la indicación explícita de reconocer láminas rápidamente muestran un patrón operativo y visual repetido.',
      evidence: [
        { date: 'Clase anterior', state: 'observed', label: 'Levadura, moho, dimorfismo, estructuras y preparación de Sabouraud.' },
        { date: 'Clase anterior', state: 'observed', label: 'Muestra cerrada, preparación del medio y bioseguridad.' },
        { date: '20 ago.', state: 'confirmed', label: 'Toma de piel, uña y pelo; KOH, Wood, lactofenol y cultivo.' },
        { date: '20 ago.', state: 'confirmed', label: 'Reconocimiento rápido de láminas y morfologías anunciado para examen.' }
      ],
      teachingArchitecture: [
        'Ordena el trabajo desde la muestra y la bioseguridad hasta la integración diagnóstica.',
        'Explica para qué sirve cada reactivo o instrumento antes de interpretar el resultado.',
        'Relaciona aspecto macroscópico de la colonia con estructuras microscópicas.',
        'Distingue una prueba orientadora de una identificación integrada.'
      ],
      reasoningPath: [
        'Elegir muestra representativa y transportarla de forma segura.',
        'Seleccionar técnica o reactivo y declarar su objetivo.',
        'Reconocer estructura o patrón visual.',
        'Describir colonia y microscopía sin saltar a la especie.',
        'Integrar sitio, directo, cultivo y bioseguridad.'
      ],
      importanceSignals: [
        'Demuestra una secuencia manual o una concentración de reactivo.',
        'Muestra una lámina y pide reconocimiento rápido.',
        'Corrige el orden de toma, montaje o lectura.',
        'Repite una precaución que evita contaminación o aerosolización.'
      ],
      observedQuestionFormats: [
        'Estación práctica: muestra → reactivo → hallazgo → siguiente paso.',
        'Reconocimiento visual rápido de hifas, conidios o estructuras.',
        'Comparación de levadura, moho y hongo dimórfico.',
        'Pregunta de bioseguridad vinculada a una maniobra.'
      ],
      likelyExamTargets: [
        'Muestra adecuada según piel, pelo o uña.',
        'KOH, azul de lactofenol, cinta adhesiva y lámpara de Wood.',
        'Macroconidios, microconidios, conidióforos y esporangios.',
        'Sabouraud: composición, pH, preparación y límites.',
        'Reconocimiento visual y bioseguridad.'
      ],
      distractorPolicy: [
        'Comparar técnicas que podrían usarse en la misma fase del laboratorio.',
        'Cambiar objetivo o tipo de muestra sin volver absurda la opción.',
        'No identificar una especie con un solo rasgo si la clase exige integración.',
        'Toda corrección debe indicar la fase y la precaución correcta.'
      ],
      hypotheses: [
        'El examen podría organizarse como estaciones breves; el reconocimiento rápido está confirmado, pero el formato de estación no.',
        'Las concentraciones exactas pueden preguntarse cuando fueron repetidas; deben mantenerse vinculadas al protocolo de la clase.'
      ],
      questionAngles: ['muestra-tecnica', 'reactivo-objetivo', 'reconocimiento-visual', 'bioseguridad'],
      aiPrompt: 'Simula una estación de la Dra. Ruth Castillo basada solo en la práctica elegida. Presenta una muestra o una imagen descrita, pide técnica, objetivo del reactivo, hallazgo esperado y siguiente paso. Añade una pregunta de bioseguridad vinculada a la maniobra. Da una sola pista por turno, exige descripción macro y micro antes de identificar y no conviertas una prueba orientadora en confirmación absoluta.'
    },
    'johana-leguizamon': {
      id: 'johana-leguizamon',
      name: 'Lic. Johana Leguizamón',
      subject: 'Nutrición',
      accent: '#fb7185',
      confidence: 'Inicial · evaluación todavía no observada',
      confidenceReason: 'Existe una clase reconstruida y una consigna de seminario, pero el 20 de agosto fue presentación del proyecto y no una nueva clase. No se inventa un patrón de examen.',
      evidence: [
        { date: '13 ago. · estimada', state: 'observed', label: 'Leyes de la alimentación, variedad, plato y adecuación clínica.' },
        { date: 'Semana 3', state: 'observed', label: 'Consigna de dos presentaciones breves y un informe.' },
        { date: '20 ago.', state: 'confirmed', label: 'Presentación realizada; no hubo nueva clase teórica.' }
      ],
      teachingArchitecture: [
        'Organiza la evaluación alimentaria por cantidad, calidad, armonía, adecuación y variedad.',
        'Conecta conceptos nutricionales con una persona, su contexto y la posibilidad real de sostener cambios.',
        'Usa clasificaciones y ejemplos de alimentos para volver operativa la teoría.',
        'La actividad grupal priorizó síntesis breve, fuentes y comunicación oral.'
      ],
      reasoningPath: [
        'Separar alimentación, nutrición y dieta.',
        'Evaluar cantidad, calidad, proporción, contexto y diversidad.',
        'Identificar el problema principal sin juzgar una comida aislada.',
        'Adaptar la recomendación a etapa de vida, patología y recursos.',
        'Proponer un cambio gradual y verificable.'
      ],
      importanceSignals: [
        'Repite una de las leyes o la aplica a un caso.',
        'Compara alimentos fuente, enriquecidos, fortificados o biofortificados.',
        'Pide adaptar un plato a una persona concreta.',
        'La consigna limita diapositivas y tiempo, señal de prioridad por síntesis.'
      ],
      observedQuestionFormats: [
        'No se dispone todavía de preguntas reales de examen.',
        'Se observaron clasificaciones, comparación y aplicación a un caso dietario.',
        'El seminario evaluó síntesis y comunicación, no demuestra el formato de la prueba escrita.',
        'La actividad oral separó dos temas y exigió desarrollarlos con fuentes en presentaciones independientes.'
      ],
      likelyExamTargets: [
        'Hipótesis de estudio: aplicar las leyes a un caso alimentario.',
        'Hipótesis de estudio: distinguir alimentación, nutrición y dieta.',
        'Hipótesis de estudio: adecuar el plato al contexto clínico.',
        'Estas hipótesis deben actualizarse cuando aparezcan preguntas reales.'
      ],
      distractorPolicy: [
        'Mantener categorías nutricionales comparables.',
        'Evitar moralizar alimentos o usar prohibiciones absolutas.',
        'No convertir una guía visual en prescripción universal.',
        'Explicar qué dimensión de la evaluación no cumple cada opción.'
      ],
      hypotheses: [
        'El razonamiento por adecuación podría aparecer en casos; aún no está confirmado.',
        'Las categorías del seminario podrían reutilizarse en evaluación oral; no hay evidencia suficiente.'
      ],
      questionAngles: ['clasificacion', 'adecuacion', 'comparacion', 'caso-contextual'],
      aiPrompt: 'Usa únicamente la clase de Nutrición disponible. Presenta una historia alimentaria breve y pregunta por cantidad, calidad, armonía, adecuación y variedad. Exige separar dato observado de conclusión, adaptar la recomendación al contexto y proponer un cambio gradual. No inventes una clase del 20/08 ni atribuyas a la docente un formato de examen no observado.'
    }
  };

  var subjects = {
    nutricion: {
      label: 'Nutrición',
      teacherId: 'johana-leguizamon',
      chapters: [
        { id: 'nutricion-capitulo-1', number: 1, title: 'Evaluación de la alimentación', status: 'current', lessons: [
          { id: 'nutricion-2026-08-13', practiceId: 'nutricion', date: '13 AGO.', dateLong: '13 de agosto de 2026 · estimada', title: 'Leyes de la alimentación y evaluación del paciente', status: 'estimated' }
        ] }
      ],
      note: 'El 20 de agosto se realizó la presentación del seminario. No hubo una nueva clase teórica y no se creó una página de curso.'
    },
    fisiologia: {
      label: 'Fisiología II',
      teacherId: 'giselle-vert',
      chapters: [
        { id: 'fisiologia-capitulo-1', number: 1, title: 'Intercambio y control respiratorio', status: 'completed', lessons: [
          { id: 'fisiologia-2026-08-10', practiceId: 'fisiologia-2026-08-10', date: '10 AGO.', dateLong: '10 de agosto de 2026 · estimada', title: 'Difusión y transporte de gases', status: 'estimated' },
          { id: 'fisiologia-2026-08-13', practiceId: 'fisiologia-2026-08-13', date: '13 AGO.', dateLong: '13 de agosto de 2026', title: 'Control nervioso y químico de la respiración', status: 'confirmed' }
        ] },
        { id: 'fisiologia-capitulo-2', number: 2, title: 'Organización del sistema nervioso', status: 'current', lessons: [
          { id: 'fisiologia-2026-08-17', practiceId: 'fisiologia-2026-08-17', date: '17 AGO.', dateLong: '17 de agosto de 2026', title: 'Organización, sinapsis y receptores', status: 'confirmed' },
          { id: 'fisiologia-2026-08-20', practiceId: 'fisiologia-2026-08-20', date: '20 AGO.', dateLong: '20 de agosto de 2026', title: 'Ejercicios integradores del sistema nervioso', status: 'confirmed' },
          { id: 'fisiologia-2026-08-24', practiceId: 'fisiologia-2026-08-24', date: '24 AGO.', dateLong: '24 de agosto de 2026', title: 'Sensibilidades somáticas', status: 'confirmed' }
        ] }
      ]
    },
    bioquimica: {
      label: 'Bioquímica II',
      teacherId: 'andrea-lopez',
      chapters: [
        { id: 'bioquimica-capitulo-1', number: 1, title: 'Glucólisis y destino del piruvato', status: 'completed', lessons: [
          { id: 'bioquimica-2026-08-14', practiceId: 'bioquimica', date: '14 AGO.', dateLong: '14 de agosto de 2026', title: 'Glucólisis: vía común y balance energético', status: 'confirmed' },
          { id: 'bioquimica-2026-08-19', practiceId: 'bioquimica-2026-08-19', date: '19 AGO.', dateLong: '19 de agosto de 2026', title: 'Glucólisis, piruvato y complejo PDH', status: 'confirmed' }
        ] },
        { id: 'bioquimica-capitulo-2', number: 2, title: 'Integración metabólica y cetoacidosis', status: 'current', lessons: [
          { id: 'bioquimica-2026-08-21', practiceId: 'bioquimica-2026-08-21', date: '21 AGO.', dateLong: '21 de agosto de 2026', title: 'Cetoacidosis diabética', status: 'confirmed' },
          { id: 'bioquimica-2026-08-26', practiceId: 'bioquimica-2026-08-26', date: '26 AGO.', dateLong: '26 de agosto de 2026', title: 'Ciclo de Cori y vía de las pentosas fosfato', status: 'confirmed' }
        ] }
      ]
    },
    epidemiologia: {
      label: 'Epidemiología y Salud Pública',
      teacherId: 'andrea-isasi',
      chapters: [
        { id: 'epidemiologia-capitulo-1', number: 1, title: 'APS y organización de urgencias', status: 'current', lessons: [
          { id: 'epidemiologia-bloque-anterior', practiceId: 'epidemiologia', date: '12 AGO.', dateLong: '12 de agosto de 2026', title: 'APS, sectorización y triage', status: 'confirmed' },
          { id: 'epidemiologia-2026-08-19', practiceId: 'epidemiologia-2026-08-19', date: '19 AGO.', dateLong: '19 de agosto de 2026', title: 'Organización de urgencias y emergencias', status: 'confirmed' },
          { id: 'epidemiologia-2026-08-26', practiceId: 'epidemiologia-2026-08-26', date: '26 AGO.', dateLong: '26 de agosto de 2026', title: 'Casos clínicos de triaje y sistema de salud', status: 'confirmed' }
        ] }
      ]
    },
    'microbiologia-teorica': {
      label: 'Microbiología II · Teórica',
      teacherId: 'alexander-acuna',
      chapters: [
        { id: 'microbiologia-teorica-capitulo-1', number: 1, title: 'Micosis superficiales, cutáneas, subcutáneas y oportunistas', status: 'current', lessons: [
          { id: 'microbiologia-teorica-2026-08-10', practiceId: 'microbiologia-teorica', date: '10 AGO.', dateLong: '10 de agosto de 2026 · estimada', title: 'Dermatofitosis y tiñas', status: 'estimated' },
          { id: 'microbiologia-teorica-2026-08-17', practiceId: 'microbiologia-teorica-2026-08-17', date: '17 AGO.', dateLong: '17 de agosto de 2026', title: 'Pitiriasis versicolor y tiña corporal', status: 'confirmed' },
          { id: 'microbiologia-teorica-2026-08-24', practiceId: 'microbiologia-teorica-2026-08-24', date: '24 AGO.', dateLong: '24 de agosto de 2026', title: 'Micosis subcutáneas, oportunistas y casos clínicos', status: 'confirmed' }
        ] }
      ]
    },
    'microbiologia-practica': {
      label: 'Microbiología II · Práctica',
      teacherId: 'ruth-castillo',
      chapters: [
        { id: 'microbiologia-practica-capitulo-1', number: 1, title: 'Cultivo e identificación micológica', status: 'current', lessons: [
          { id: 'microbiologia-practica-anterior', practiceId: 'microbiologia-practica', date: '13 AGO.', dateLong: '13 de agosto de 2026', title: 'Hongos y preparación del agar Sabouraud', status: 'confirmed' },
          { id: 'microbiologia-practica-2026-08-20', practiceId: 'microbiologia-practica-2026-08-20', date: '20 AGO.', dateLong: '20 de agosto de 2026', title: 'Diagnóstico práctico de micosis superficiales', status: 'confirmed' }
        ] }
      ]
    }
  };

  var narratives = {
    'nutricion-2026-08-13': {
      title: 'Evaluar una alimentación antes de prescribir cambios',
      lead: 'La clase no reduce la nutrición a contar calorías. Sigue una evaluación progresiva: distinguir alimentación, nutrición y dieta; comprobar cantidad y calidad; revisar proporciones; adaptar al paciente real; y proponer cambios que puedan mantenerse.',
      sections: [
        ['Lenguaje básico', 'Alimentación, nutrición y dieta describen procesos diferentes', 'La alimentación comprende la elección, preparación e ingestión de alimentos. Es una conducta influida por cultura, economía, preferencias, horarios y disponibilidad.', 'La nutrición reúne digestión, absorción, transporte y utilización de nutrientes. La dieta es el patrón habitual de alimentos y bebidas; toda persona tiene una, aunque no siempre sea adecuada.'],
        ['Cantidad y balance', 'Cubrir necesidades exige relacionar ingesta y gasto', 'La ley de cantidad pregunta si la energía y los nutrientes alcanzan para edad, tamaño corporal, actividad, estado fisiológico y enfermedad. Tanto el déficit como el exceso sostenidos pueden alterar el estado nutricional.', 'El peso de un día no representa por sí solo el balance energético. Agua, glucógeno y contenido intestinal varían; se interpreta la tendencia junto con historia dietaria y datos clínicos.'],
        ['Calidad', 'Las calorías necesitan una composición nutricional', 'Una ingesta puede aportar energía y seguir siendo insuficiente en proteína, fibra, vitaminas, minerales o agua. Por eso se identifican alimentos fuente y la función predominante de cada grupo.', 'Fuente no significa exclusividad. Carnes aportan proteína y hierro; lácteos, calcio y proteína; frutas y verduras, combinaciones variables de fibra y micronutrientes.'],
        ['Armonía', 'La proporción entre grupos modifica el valor del conjunto', 'Armonía significa que los componentes guardan relación entre sí. Una comida dominada por almidones o formada solo por verduras no cubre necesariamente todos los objetivos.', 'El método del plato traduce esta idea de forma visual: aproximadamente la mitad con verduras y frutas, un cuarto con proteína y otro con cereales o tubérculos. Es una guía que se adapta, no una prescripción universal.'],
        ['Adecuación', 'El mejor plan es el que responde a la persona concreta', 'La recomendación cambia con embarazo, adolescencia, envejecimiento, disfagia, enfermedad, actividad y objetivos. También debe poder comprarse, prepararse, masticarse y sostenerse.', 'Adecuar no significa borrar la cultura. Arroz, mandioca, porotos, carnes y preparaciones regionales pueden reorganizarse en porciones y combinaciones compatibles con el objetivo.'],
        ['Variedad y cambio', 'Diversificar ayuda a cubrir nutrientes y evita la monotonía', 'Rotar alimentos dentro y entre grupos aumenta la probabilidad de cubrir micronutrientes. Los colores son una herramienta educativa, pero no sustituyen el análisis de composición y porciones.', 'En el caso de una dieta centrada en café azucarado y pan, primero se completa la historia. Luego se buscan ausencias y se negocian uno o dos cambios posibles, en lugar de pasar de cero a cien.']
      ]
    },
    'fisiologia-2026-08-10': {
      title: 'Del aire alveolar al oxígeno que recibe el tejido',
      lead: 'La clase separa cuatro procesos que suelen confundirse: ventilación, difusión, perfusión y transporte sanguíneo. El razonamiento avanza desde la barrera alveolocapilar hasta la hemoglobina y explica por qué una alteración V/Q produce hipoxemia.',
      sections: [
        ['Cuatro etapas', 'Ventilar, difundir, perfundir y transportar no son sinónimos', 'La ventilación renueva el gas alveolar. La difusión mueve O₂ y CO₂ a través de la barrera según sus gradientes de presión parcial.', 'La perfusión aporta sangre al capilar y el transporte lleva gases en formas disueltas o unidas. Una etapa normal no corrige automáticamente el fallo de otra.'],
        ['Ley de Fick', 'Área, gradiente y espesor determinan la difusión', 'Una superficie amplia y un gradiente mayor favorecen el flujo. Enfisema reduce área, mientras edema o fibrosis aumentan la distancia que debe atravesar el gas.', 'El CO₂ difunde con facilidad por su mayor solubilidad. Por eso una lesión de la barrera suele comprometer primero al O₂, aunque ambos gases utilicen la misma interfaz.'],
        ['Relación V/Q', 'Cada región necesita aire y sangre en proporción útil', 'Una región perfundida con poca ventilación tiene V/Q baja y contribuye a hipoxemia. Cuando V/Q se aproxima a cero, el comportamiento se acerca al shunt.', 'Una región ventilada sin perfusión útil se comporta como espacio muerto alveolar y V/Q tiende a infinito. El pulmón normal ya posee un gradiente entre ápice y base.'],
        ['Oxígeno', 'La PaO₂ no equivale al contenido arterial total', 'La PaO₂ refleja el oxígeno disuelto. La mayor parte del O₂ viaja unida a hemoglobina, de modo que contenido depende también de concentración de Hb y saturación.', 'Una PaO₂ aceptable no garantiza contenido normal si existe anemia. Del mismo modo, presión, saturación y contenido describen dimensiones relacionadas pero distintas.'],
        ['Dióxido de carbono', 'El bicarbonato transporta la mayor parte del CO₂', 'En el eritrocito, la anhidrasa carbónica facilita la conversión entre CO₂, ácido carbónico, H⁺ y bicarbonato. Otra fracción viaja como compuestos carbamino o disuelta.', 'La desoxihemoglobina acepta mejor CO₂ y H⁺; al oxigenarse en pulmón facilita su liberación. Esta relación corresponde al efecto Haldane.'],
        ['Afinidad de hemoglobina', 'Bohr favorece la descarga de O₂ en tejidos activos', 'Aumento de CO₂, H⁺, temperatura o 2,3-BPG desplaza la curva a la derecha y reduce la afinidad Hb–O₂. Así el tejido con mayor metabolismo recibe oxígeno con más facilidad.', 'Bohr describe afinidad por O₂; Haldane describe transporte de CO₂ y H⁺ según la oxigenación. Separarlos evita confundir dos mecanismos complementarios.'],
        ['Integración clínica', 'La hipoxemia se localiza siguiendo el proceso alterado', 'Una V/Q baja, una barrera engrosada, un shunt o una ventilación alveolar insuficiente pueden reducir oxigenación mediante mecanismos distintos.', 'Para interpretarlos se combinan clínica, PaO₂, PaCO₂ y contexto. El objetivo no es memorizar una etiqueta, sino localizar dónde se interrumpe el recorrido del gas.']
      ]
    },
    'fisiologia-2026-08-13': {
      title: 'Cómo el sistema respiratorio detecta y corrige un cambio químico',
      lead: 'La ventilación se regula como un circuito de retroalimentación. Sensores centrales, periféricos y pulmonares informan a redes bulbares y pontinas; los músculos respiratorios modifican frecuencia y profundidad para estabilizar gases y pH.',
      sections: [
        ['Circuito de control', 'Sensores, controlador y efectores forman una unidad', 'Los sensores detectan cambios químicos, estiramiento o irritación. La señal llega al tronco encefálico, donde se integra con control voluntario, emoción, temperatura y ejercicio.', 'La respuesta alcanza diafragma y músculos respiratorios. Aumentar frecuencia sin suficiente volumen corriente no garantiza una ventilación alveolar eficaz.'],
        ['Redes bulbares', 'El ritmo no depende de un único centro', 'El grupo respiratorio dorsal integra aferencias y participa sobre todo en inspiración. El grupo ventral contiene neuronas inspiratorias y espiratorias que ganan importancia cuando aumenta la demanda.', 'El complejo pre-Bötzinger es clave en la generación del ritmo. Hablar de redes permite entender mejor la interacción que imaginar un marcapasos aislado.'],
        ['Modulación pontina', 'El puente organiza la transición entre inspiración y espiración', 'El grupo respiratorio pontino modifica duración y cambio de fase. Los términos clásicos neumotáxico y apnéustico describen influencias que hoy se integran en una red más amplia.', 'La corteza puede intervenir durante habla, canto o apnea voluntaria, pero el estímulo químico creciente acaba limitando esa supresión.'],
        ['Quimiorreceptores centrales', 'El CO₂ modifica el pH del LCR y cambia la ventilación', 'El CO₂ atraviesa la barrera hematoencefálica y genera H⁺ en el líquido cefalorraquídeo. Los quimiorreceptores centrales responden principalmente a ese cambio de pH.', 'No son sensores directos de PaO₂. Su influencia explica la potente respuesta ventilatoria ante hipercapnia.'],
        ['Quimiorreceptores periféricos', 'Los cuerpos carotídeos responden con rapidez a la hipoxemia', 'Los cuerpos carotídeos, en la bifurcación carotídea, detectan sobre todo PaO₂ baja y también PaCO₂ y pH. Sus aferencias viajan por el nervio glosofaríngeo.', 'Los cuerpos aórticos envían información por el vago. La respuesta periférica se vuelve especialmente importante cuando la PaO₂ cae de forma relevante.'],
        ['Receptores pulmonares', 'Distensión, irritantes y líquido intersticial modifican el patrón', 'Receptores de estiramiento participan en el reflejo de Hering–Breuer. Receptores irritantes pueden inducir tos y broncoconstricción.', 'Receptores yuxtacapilares responden a congestión o edema y favorecen respiración rápida y superficial. Estas aferencias protegen y adaptan la mecánica.'],
        ['Aplicación en EPOC', 'Obstrucción e hipoventilación pueden producir hipercapnia', 'Espiración prolongada, sibilancias y FEV₁/FVC bajo orientan a obstrucción. Si la ventilación alveolar no elimina CO₂, aumenta PaCO₂ y puede aparecer acidosis respiratoria.', 'PaO₂, PaCO₂, pH y bicarbonato se leen juntos. El oxígeno no se niega a un paciente hipoxémico: se titula y se monitoriza según la situación clínica.']
      ]
    },
    'fisiologia-2026-08-17': {
      title: 'Del estímulo a una respuesta nerviosa organizada',
      lead: 'La clase sigue una señal completa: un receptor detecta un cambio, la vía aferente lo conduce, el sistema nervioso central integra entradas y la vía eferente produce una respuesta. Neurona, potencial de acción, sinapsis y receptor son eslabones de ese recorrido.',
      sections: [
        ['Organización', 'Receptor, aferencia, integración y eferencia describen el trayecto', 'Un receptor convierte un cambio del medio en señal. La información entra por una vía aferente y se procesa en circuitos del sistema nervioso central.', 'La salida eferente alcanza un efector. Localizar el problema en uno de estos pasos ayuda a interpretar una pérdida sensitiva, un fallo motor o una respuesta inadecuada.'],
        ['Neurona', 'La forma acompaña la dirección de la información', 'Dendritas reciben señales, el soma integra y el axón conduce el potencial de acción. La terminal axónica transforma la señal eléctrica en comunicación con otra célula.', 'La función no depende de una pieza aislada: el gradiente iónico, la membrana excitable y la sinapsis permiten que la anatomía se convierta en respuesta.'],
        ['Potencial de acción', 'Entrada de sodio y salida de potasio cambian el voltaje', 'Al alcanzar umbral, canales de Na⁺ dependientes de voltaje favorecen despolarización. Su inactivación y la apertura de canales de K⁺ permiten repolarización.', 'La bomba Na⁺/K⁺ mantiene gradientes a largo plazo; no genera por sí sola cada fase rápida. Los periodos refractarios ordenan dirección y frecuencia de disparo.'],
        ['Conducción', 'Mielina y diámetro aumentan la velocidad', 'La mielina concentra la regeneración del potencial en los nodos de Ranvier y permite conducción saltatoria. Un axón más ancho ofrece menor resistencia interna.', 'Por eso una fibra grande y mielinizada conduce más rápido que una pequeña amielínica. Bloquear canales de Na⁺, como hace la lidocaína, impide propagar la señal.'],
        ['Sinapsis', 'El calcio conecta el potencial presináptico con la liberación química', 'Cuando el potencial llega a la terminal, abre canales de Ca²⁺. El calcio desencadena fusión de vesículas y liberación de neurotransmisor.', 'El transmisor se une a receptores postsinápticos. En una sinapsis eléctrica, en cambio, la corriente pasa directamente por uniones comunicantes.'],
        ['Receptores y respuesta', 'Ionotrópico es rápido; metabotrópico amplifica y modula', 'Un receptor ionotrópico contiene un canal que se abre al unirse el ligando. Un receptor metabotrópico activa proteína G y segundos mensajeros antes de modificar canales o procesos.', 'Excitación o inhibición dependen del receptor y del ion movilizado, no solo del nombre del neurotransmisor. GABA y glutamato sirven como ejemplos predominantes, no como reglas sin contexto.'],
        ['Transducción sensorial', 'Cada receptor transforma una forma de energía', 'Mecanorreceptores, termorreceptores, nociceptores, quimiorreceptores y fotorreceptores responden a estímulos distintos. La transducción genera un potencial receptor.', 'Receptores tónicos mantienen respuesta y los fásicos destacan cambios. En una quemadura profunda, destruir terminaciones puede reducir dolor local pese al daño intenso.'],
        ['Circuitos', 'Sumación, convergencia y divergencia deciden la salida', 'Sumación espacial combina entradas simultáneas; sumación temporal acumula descargas próximas. Convergencia reúne señales y divergencia distribuye una salida.', 'Circuitos reverberantes prolongan actividad y la fatiga sináptica puede limitarla. La integración final depende del balance entre señales excitadoras e inhibidoras.']
      ]
    },
    'fisiologia-2026-08-24': {
      title: 'De un estímulo somático a una percepción consciente',
      lead: 'La clase organiza las sensibilidades somáticas desde el receptor periférico hasta la corteza: tacto, propiocepción, dolor y temperatura viajan por fibras y vías específicas cuya lesión produce déficits previsibles.',
      sections: [
        ['Mapa sensorial', 'Mecanorrecepción, nocicepción y termorrecepción responden a estímulos distintos', 'Contacto, presión y vibración son modalidades táctiles. La propiocepción informa posición y movimiento; la nocicepción detecta amenaza tisular y la termorrecepción cambios inocuos de frío o calor.', 'Cada señal comienza en un receptor, entra por una aferencia y alcanza médula, tronco, tálamo y corteza según la vía.'],
        ['Receptores cutáneos', 'Adaptación y profundidad explican qué cambio se detecta', 'Meissner y Pacini se adaptan rápido; Merkel y Ruffini mantienen la descarga. Las terminaciones libres participan en dolor, temperatura, prurito y cosquilleo.', 'Campos receptivos pequeños y alta densidad permiten mejor discriminación de dos puntos en dedos y labios que en espalda.'],
        ['Propiocepción', 'Huso muscular y órgano tendinoso miden variables diferentes', 'El huso detecta longitud y velocidad de estiramiento mediante aferencias Ia y II. El órgano tendinoso de Golgi detecta tensión por fibras Ib.', 'El reflejo miotático contrae el músculo estirado; la señal de tensión excesiva puede favorecer inhibición autógena y relajación.'],
        ['Dolor', 'El primer dolor y el segundo dolor usan fibras y transmisores diferentes', 'El dolor rápido es agudo, mejor localizado y viaja principalmente por Aδ con glutamato. El dolor lento es urente, difuso y viaja por C con participación de sustancia P.', 'Nociceptores son terminaciones libres activadas por estímulos mecánicos, térmicos o químicos capaces de amenazar el tejido.'],
        ['Temperatura', 'Frío y calor inocuos se separan del dolor térmico', 'Los receptores de frío son más numerosos y pueden enviar señal por Aδ; los de calor suelen usar fibras C.', 'Cuando la temperatura sale del rango seguro se activan nociceptores térmicos y aparece dolor protector.'],
        ['Vías ascendentes', 'La columna dorsal cruza en bulbo y la anterolateral en médula', 'Columna dorsal-lemnisco medial conduce tacto fino, vibración y propiocepción consciente por fibras rápidas.', 'Sistema anterolateral conduce dolor, temperatura y tacto grosero; la localización de la decusación permite predecir el lado del déficit.'],
        ['Corteza', 'Percibir exige localizar, comparar e interpretar', 'La corteza somatosensitiva primaria se ubica en el giro poscentral, áreas 3, 1 y 2, con organización somatotópica.', 'Estereognosia, grafestesia, peso, textura y discriminación de dos puntos dependen de sensibilidad primaria íntegra e integración cortical.']
      ]
    },
    'bioquimica-2026-08-14': {
      title: 'La lógica completa de la glucólisis',
      lead: 'La glucólisis convierte una glucosa de seis carbonos en dos piruvatos de tres carbonos. Para seguirla sin memorizar nombres aislados, la clase separa inversión, división, beneficio, balance y regulación.',
      sections: [
        ['Objetivo y lugar', 'Una vía citosólica prepara glucosa para producir energía y piruvato', 'La glucólisis ocurre en el citosol y no consume oxígeno como sustrato directo. Su continuidad depende de disponer de NAD⁺ para la reacción de oxidación.', 'El oxígeno modifica el destino posterior del piruvato y la reoxidación del NADH. Por eso la vía puede continuar en hipoxia si el piruvato se reduce a lactato.'],
        ['Inversión', 'Las primeras reacciones gastan dos ATP', 'Hexoquinasa o glucoquinasa fosforilan glucosa. PFK-1 añade el segundo fosfato y compromete el sustrato con la vía.', 'La inversión no es una pérdida inútil: retiene y activa la molécula para que pueda dividirse y generar productos de alta energía.'],
        ['División', 'Una molécula de seis carbonos origina dos triosas', 'Aldolasa separa fructosa-1,6-bisfosfato en G3P y DHAP. Triosa fosfato isomerasa convierte DHAP en G3P.', 'Desde ese punto existen dos G3P, de modo que cada reacción de la fase de beneficio ocurre dos veces por glucosa.'],
        ['Oxidación y NADH', 'GAPDH captura electrones y forma un intermediario de alta energía', 'G3P se oxida a 1,3-bisfosfoglicerato y NAD⁺ se reduce a NADH. El fosfato inorgánico se incorpora sin gasto adicional de ATP.', 'Si NAD⁺ no se regenera, la vía se detiene en esta etapa. La fermentación láctica sostiene el flujo precisamente porque reoxida NADH.'],
        ['Beneficio', 'La fosforilación a nivel de sustrato produce cuatro ATP', 'Fosfoglicerato quinasa y piruvato quinasa transfieren fosfato directamente a ADP. Como la secuencia ocurre dos veces, se forman cuatro ATP.', 'Restando los dos ATP invertidos, el balance neto es dos ATP, dos NADH y dos piruvatos por glucosa.'],
        ['Tres puertas irreversibles', 'Hexo/glucoquinasa, PFK-1 y piruvato quinasa regulan el flujo', 'Estas reacciones están lejos del equilibrio y funcionan como puntos de control. PFK-1 es el principal paso limitante de la vía.', 'ATP y citrato señalan abundancia e inhiben PFK-1; AMP, ADP y fructosa-2,6-bisfosfato favorecen la glucólisis.'],
        ['Control hormonal', 'Insulina y glucagón modifican fructosa-2,6-bisfosfato en hígado', 'PFK-2/FBPasa-2 controla la concentración de fructosa-2,6-bisfosfato. Esa molécula activa PFK-1 e inhibe fructosa-1,6-bisfosfatasa.', 'Insulina favorece el estado que estimula glucólisis hepática; glucagón favorece gluconeogénesis. La regulación responde al estado del organismo, no solo a la enzima aislada.'],
        ['Destino del piruvato', 'La salida de la vía depende del contexto redox y metabólico', 'Con capacidad oxidativa, piruvato puede entrar en mitocondria y convertirse en acetil-CoA. También puede originar oxalacetato o alanina según necesidad.', 'Cuando la reoxidación mitocondrial es insuficiente, lactato deshidrogenasa forma lactato y regenera NAD⁺. El objetivo inmediato es sostener la glucólisis.']
      ]
    },
    'epidemiologia-bloque-anterior': {
      title: 'De la Atención Primaria a la clasificación del riesgo',
      lead: 'El bloque une territorio y puerta de urgencias. Primero organiza población, familia y seguimiento mediante APS; después muestra cómo recepción y triage priorizan a quien puede deteriorarse, sin confundir clasificación con diagnóstico.',
      sections: [
        ['Atención Primaria', 'La APS es una estrategia de acceso y continuidad', 'La Atención Primaria acerca promoción, prevención, cuidado y seguimiento a la comunidad. No se limita a una consulta simple ni es atención de menor valor.', 'Su función incluye resolver lo frecuente, detectar riesgo y coordinar acceso a otros niveles cuando la necesidad supera su capacidad.'],
        ['Integralidad', 'La persona se atiende dentro de familia y contexto', 'Un modelo integral considera dimensiones biológicas, psicológicas y sociales. La enfermedad no se separa de condiciones de vida, redes de apoyo y barreras de acceso.', 'Continuidad significa que la información y el plan acompañan al paciente. Una derivación sin retorno fragmenta el cuidado.'],
        ['Sectorización', 'Territorio definido permite conocer población y riesgo', 'Dividir un territorio en sectores asigna equipos y facilita identificar embarazadas, niños, crónicos, vacunación pendiente y problemas ambientales.', 'El mapa no es solo geográfico: organiza visitas, vigilancia y prioridades. Permite pasar de esperar demanda a buscar activamente necesidades.'],
        ['Referencia', 'Derivar y contrarreferir conectan niveles de atención', 'La referencia envía al paciente con información y motivo claros hacia un recurso adecuado. La contrarreferencia devuelve diagnóstico, conducta y seguimiento.', 'Ambos movimientos evitan repetir estudios y perder continuidad. La red funciona cuando la comunicación es bidireccional.'],
        ['Urgencia y emergencia', 'El riesgo y el tiempo necesario determinan la respuesta', 'Urgencia requiere atención oportuna porque existe sufrimiento o posibilidad de empeorar. Emergencia implica amenaza inmediata para vida, órgano o función.', 'La percepción subjetiva puede iniciar la demanda, pero la prioridad final se apoya en evaluación clínica y riesgo de deterioro.'],
        ['Recepción y triage', 'Primero se observa, pregunta, mide y prioriza', 'Aspecto general, conciencia, trabajo respiratorio y perfusión orientan desde el primer contacto. Después se completa motivo, inicio, evolución y antecedentes.', 'Signos vitales aportan datos objetivos. El triage asigna prioridad; no reemplaza la evaluación médica ni produce el diagnóstico final.'],
        ['Cinco niveles', 'Color y tiempo traducen gravedad en una espera máxima', 'Rojo requiere atención inmediata; naranja, muy urgente; amarillo, urgente; verde y azul toleran esperas mayores según el protocolo RAC.', 'El nivel puede cambiar. Un paciente que espera debe ser reevaluado si aparecen nuevos síntomas o signos de deterioro.'],
        ['Conducta inicial', 'La prioridad se basa en riesgo, no en orden de llegada', 'Una amenaza de vía aérea, ventilación o circulación exige estabilización inmediata. Una consulta de menor riesgo no desplaza a quien puede perder vida u órgano.', 'Relleno capilar informa perfusión y no sustituye pulsioximetría. Frecuencia respiratoria se cuenta; no se lee del valor de SpO₂.']
      ]
    },
    'microbiologia-teorica-2026-08-10': {
      title: 'De la queratina al diagnóstico de una tiña',
      lead: 'La clase empieza por profundidad y localización. Después relaciona exposición, lesión, muestra, examen directo, cultivo y tratamiento. Así se evita llamar “tiña” a cualquier micosis superficial.',
      sections: [
        ['Profundidad', 'Superficial y cutánea no significan lo mismo', 'Una micosis superficial permanece en estrato córneo o tallo piloso y suele causar poca inflamación. La pitiriasis versicolor es un ejemplo.', 'Las dermatofitosis son micosis cutáneas de tejidos queratinizados: piel, pelo y uñas. Las subcutáneas necesitan inoculación profunda y otra estrategia diagnóstica.'],
        ['Dermatofitos', 'Tres géneros clásicos comparten afinidad por queratina', 'Trichophyton puede afectar piel, pelo y uña. Microsporum suele afectar piel y pelo, mientras Epidermophyton afecta piel y uña pero no invade pelo.', 'Malassezia no pertenece a esos tres géneros. Asociarla a pitiriasis versicolor evita confundir levadura superficial con dermatofito.'],
        ['Transmisión', 'La fuente orienta la intensidad y el agente', 'Especies antropofílicas pasan entre humanos o por fómites. Zoofílicas se relacionan con animales y pueden producir inflamación intensa.', 'Geofílicas proceden del suelo. La exposición ayuda a priorizar hipótesis, pero la especie requiere confirmación.'],
        ['Tiñas por sitio', 'El segundo término nombra la región anatómica', 'Tinea capitis afecta cuero cabelludo y pelo; corporis, tronco o extremidades; cruris, ingle; pedis y manuum, pie y mano; unguium, uña.', 'La localización cambia muestra y tratamiento. Una placa anular con borde activo orienta a corporis, mientras pelo roto y alopecia sugieren capitis.'],
        ['Muestra y KOH', 'El material se obtiene de la zona donde el hongo está activo', 'En piel se raspa el borde activo; en capitis se recogen pelos y escamas; en uña, recorte y detrito subungueal.', 'KOH aclara queratina y permite ver hifas o artroconidios. Confirma elementos fúngicos, pero no siempre identifica especie.'],
        ['Cultivo y Wood', 'Las pruebas complementan la clínica con límites claros', 'El cultivo permite observar colonia y estructuras microscópicas. La identificación integra morfología y, cuando corresponde, otras pruebas.', 'La lámpara de Wood ayuda en algunas especies de Microsporum, pero muchas infecciones no fluorescen. Una prueba negativa no excluye tiña.'],
        ['Tratamiento', 'Piel localizada y folículo requieren estrategias distintas', 'Varias tiñas cutáneas localizadas responden a azol o alilamina tópicos. Corticoide aislado puede enmascarar y agravar la lesión.', 'Tinea capitis necesita antifúngico sistémico para alcanzar el folículo; champú es adyuvante. Uña o enfermedad extensa requieren confirmación e individualización.'],
        ['Caso integrado', 'Alopecia, pelo roto y contacto animal forman una cadena diagnóstica', 'Un niño con placa de alopecia, pelos fracturados y perro con lesión orienta a tiña capitis zoofílica. Si existe inflamación intensa puede aparecer querion.', 'La muestra se obtiene antes del antifúngico cuando sea posible. Evaluar la fuente animal y reducir fómites completa el control.']
      ]
    },
    'microbiologia-teorica-2026-08-17': {
      title: 'Pitiriasis versicolor frente a tiña corporal',
      lead: 'Dos casos enseñan a separar una micosis superficial por Malassezia de una dermatofitosis por Microsporum canis usando profundidad, morfología, exposición, muestra y examen micológico.',
      sections: [
        ['Profundidad', 'Superficial y cutánea comprometen tejidos diferentes', 'La pitiriasis versicolor permanece en el estrato córneo y produce poca inflamación. La tiña corporal invade queratina epidérmica y forma un borde activo.', 'Definir el nivel de invasión orienta dónde obtener la muestra y evita llamar tiña a cualquier mancha fúngica.'],
        ['Caso de pitiriasis', 'Máculas del tronco con escama fina', 'Calor, sudoración y zonas seborreicas favorecen máculas hipo o hiperpigmentadas que confluyen y descaman con el raspado.', 'El prurito puede ser leve y la alteración del pigmento se vuelve más evidente después de la exposición solar.'],
        ['Malassezia', 'Levaduras e hifas cortas orientan el examen directo', 'El KOH aclara la queratina y permite observar elementos compatibles con Malassezia spp., una levadura lipofílica de la microbiota cutánea.', 'El resultado se integra con distribución y lesión; no sustituye la correlación clínica del caso.'],
        ['Caso de tiña', 'La placa anular crece desde un borde activo', 'Prurito, expansión centrífuga, descamación y aclaramiento central parcial orientan a tinea corporis.', 'El raspado se obtiene del borde, donde el dermatofito está metabólicamente más activo y aporta mayor rendimiento diagnóstico.'],
        ['Fuente animal', 'Un gato alopécico orienta a un dermatofito zoofílico', 'El contacto con un animal que pierde pelo aumenta la sospecha de Microsporum canis y explica una respuesta inflamatoria más visible.', 'La exposición prioriza la hipótesis, pero la especie se confirma con examen micológico y cultivo.'],
        ['Cultivo', 'Los macroconidios apoyan la identificación', 'Macroconidios abundantes, fusiformes y de pared rugosa son compatibles con M. canis en el contexto adecuado.', 'La conclusión final integra paciente, lesión, fuente, KOH y morfología; ningún dato aislado debe reemplazar la secuencia completa.']
      ]
    },
    'microbiologia-teorica-2026-08-24': {
      title: 'Micosis subcutáneas y oportunistas: de la puerta de entrada a la confirmación',
      lead: 'Los casos enseñan un orden diagnóstico estable: profundidad, lesión, exposición, muestra y confirmación. La clase contrasta infecciones superficiales y cutáneas con micosis subcutáneas por implantación y termina con el contexto oportunista de Candida.',
      sections: [
        ['Mapa por profundidad', 'El nivel de invasión cambia lesión, muestra y terapia', 'Superficial se limita a capas externas; cutánea invade tejidos queratinizados; subcutánea alcanza dermis profunda y tejido celular tras una inoculación que puede no recordarse.', 'Determinar profundidad evita elegir una muestra superficial para una lesión que requiere biopsia o indicar tratamiento local donde hace falta terapia sistémica.'],
        ['Caso 1', 'Pitiriasis versicolor produce máculas con descamación fina', 'Un adulto joven con calor y sudoración presenta máculas hipo o hiperpigmentadas en tronco, poco pruriginosas y con descamación al raspado.', 'KOH muestra levaduras y hifas cortas, patrón asociado a Malassezia spp. La poca inflamación concuerda con una micosis superficial.'],
        ['Caso 2', 'Una placa anular con borde activo orienta a tiña corporal', 'Una adolescente con lesión pruriginosa expansiva y contacto con gato alopécico presenta borde elevado, descamación y aclaramiento central.', 'Raspado del borde muestra hifas septadas. Macroconidios fusiformes y rugosos en cultivo apoyan Microsporum canis.'],
        ['Comparación', 'Pitiriasis y tiña ocupan niveles y tejidos distintos', 'Pitiriasis afecta estrato córneo y suele localizarse en zonas seborreicas. Tiña corporal es dermatofitosis de queratina y produce un borde activo.', 'En la primera se buscan levaduras con hifas cortas; en la segunda, hifas septadas y datos de dermatofito. La muestra nace de la lesión característica.'],
        ['Entrada subcutánea', 'La implantación introduce el agente por debajo de la piel', 'Espinas, astillas, suelo o animales pueden inocular microorganismos; el traumatismo puede ser pequeño o no recordarse. La lesión suele comenzar en el punto de entrada y evolucionar de forma crónica.', 'El raspado superficial puede ser insuficiente. Biopsia, histopatología, examen directo y cultivo de tejido adquieren mayor importancia.'],
        ['Esporotricosis', 'Los nódulos siguen trayectos linfáticos', 'Tras lesión de inoculación aparecen nódulos ascendentes a lo largo de vasos linfáticos. El caso documentado comienza después de injertar naranjos; jardinería, espinas o contacto con gato son exposiciones orientadoras.', 'El patrón linfocutáneo relaciona puerta de entrada y distribución regional, pero no equivale por sí mismo a diseminación sistémica. El cultivo confirma el diagnóstico.'],
        ['Cromoblastomicosis', 'La lesión verrugosa crónica contiene cuerpos muriformes', 'Hongos pigmentados implantados traumáticamente producen placas o nódulos verrugosos de evolución lenta.', 'Los cuerpos escleróticos o muriformes son un dato histológico característico. La profundidad y cronicidad explican por qué el tratamiento suele ser prolongado.'],
        ['Micetoma eumicótico', 'Tumefacción, fístulas y granos forman la tríada', 'El primer paciente documentado tiene 38 años, punción con espina, evolución de tres años y granos negros; estos orientan a un hongo dematiáceo como Madurella spp.', 'El eumicetoma es fúngico y debe diferenciarse del actinomicetoma bacteriano. Granos, biopsia, histopatología, cultivo e imagen de extensión guían agente y tratamiento.'],
        ['Segundo eumicetoma', 'La historia de 62 años se conserva como un caso independiente', 'Una herida con clavo precede al aumento de volumen del pie, las recurrencias, las cirugías y la limitación funcional a lo largo de dos décadas.', 'La fotografía orienta por cronicidad, deformidad y fístulas, pero no identifica la especie. La confirmación exige muestra profunda y estudio microbiológico.'],
        ['Candida oportunista', 'Colonización, riesgo y enfermedad no son equivalentes', 'Candida puede colonizar tubo digestivo, mucosa genital, piel y región periungueal. Antibióticos, catéteres, cirugía, neutropenia, trasplante o inmunosupresión aumentan el riesgo de infección.', 'Las formas orales, cutáneas y ungueales se interpretan con la exploración y el sitio de muestra. Un cultivo de un sitio no estéril no demuestra por sí solo candidiasis invasiva.'],
        ['Decisión segura', 'La profundidad y el agente determinan la estrategia', 'Raspado y KOH orientan cuadros superficiales o cutáneos; las lesiones subcutáneas requieren granos, biopsia, histopatología y cultivo, además de imagen cuando se sospecha extensión.', 'Tratamiento tópico, sistémico, cirugía o combinaciones se individualizan por entidad y gravedad. No se indican antibióticos ni corticoides de rutina por el aspecto de una lesión fúngica.']
      ]
    },
    'microbiologia-practica-anterior': {
      title: 'Preparar un cultivo y leer la morfología fúngica con seguridad',
      lead: 'La práctica introduce las formas de crecimiento, las estructuras que deben reconocerse y la preparación de agar Sabouraud. El objetivo no es identificar por una colonia aislada, sino integrar muestra, macro y microscopía bajo bioseguridad.',
      sections: [
        ['Formas de crecimiento', 'Levadura, moho y dimorfismo describen organizaciones distintas', 'La levadura es principalmente unicelular y forma colonias cremosas. El moho produce hifas que constituyen un micelio y colonias algodonosas o pulverulentas.', 'Un hongo dimórfico cambia según condiciones y puede presentar forma ambiental y tisular diferentes. La regla térmica es orientativa y tiene excepciones.'],
        ['Estructuras', 'Hifas y estructuras reproductivas orientan la identificación', 'Hifa es un filamento y micelio el conjunto de hifas. Conidióforo sostiene conidios externos, mientras esporangióforo sostiene un saco con esporangiosporas.', 'Macroconidios y microconidios se comparan por tamaño, forma y células. Rizoides ayudan a fijar algunos hongos al sustrato.'],
        ['Muestra', 'La preparación empieza antes de abrir el recipiente', 'La tarea indicó llevar una muestra sólida con moho, preferentemente pan, dentro de recipiente cerrado e identificado.', 'No se abre, huele ni toca en casa. La muestra solo se manipula en laboratorio cuando la docente lo indique.'],
        ['Sabouraud', 'Peptonas, glucosa, agar y pH ácido favorecen hongos', 'El medio aporta nutrientes y soporte. El pH cercano a 5,6 en formulaciones clásicas limita muchas bacterias y favorece levaduras y mohos.', 'La cantidad de polvo depende del fabricante. La demostración usó 10 g en 100 mL, pero esa proporción no se generaliza a todas las fórmulas.'],
        ['Preparación', 'Pesar, mezclar, disolver y calentar son etapas distintas', 'La práctica mostró pesado, adición de agua destilada, agitación y calentamiento. Evitar golpes y contaminación forma parte de la técnica.', 'Calentar no equivale automáticamente a esterilizar. El protocolo y la etiqueta definen si corresponde autoclave u otro proceso.'],
        ['Lectura integrada', 'Colonia visible orienta, pero no identifica por sí sola', 'Color, textura, superficie, reverso y velocidad describen la macro. Al microscopio se valoran hifas y estructuras reproductivas.', 'La identificación final relaciona ambas escalas con origen de la muestra. Saltar directamente a una especie aumenta errores.'],
        ['Bioseguridad', 'La técnica protege al estudiante y a la muestra', 'Bata, guantes y protección indicada reducen exposición. Placas no se huelen ni agitan porque las esporas pueden aerosolizarse.', 'Incubación, apertura y descarte siguen el protocolo institucional. La seguridad no es una lista separada: acompaña cada fase.']
      ]
    }
  };

  window.MedNykutoAcademicModel = {
    version: 'v445',
    updatedAt: '2026-08-26',
    teachers: teachers,
    subjects: subjects,
    narratives: narratives
  };
})();
