(function () {
  'use strict';

  window.MedNykutoP1Scope = {
    id: 's4-e-p1-2026-v2',
    label: 'P1',
    title: 'Primera prueba parcial',
    updatedAt: '2026-08-30',
    defaultLength: 40,
    formatRatios: { qcm: 0.5, vf: 0.25, cases: 0.25 },
    subjects: {
      nutricion: {
        label: 'Nutrición',
        shortLabel: 'Nutrición',
        icon: 'class-icon-nutrition',
        accent: '#fb7185',
        status: 'ready',
        statusLabel: 'Hasta 27 ago.',
        note: 'Incluye las guías alimentarias, la lectura crítica del etiquetado y la aplicación clínica trabajadas hasta el 27 de agosto.',
        practiceIds: [
          'nutricion',
          'nutricion-2026-08-27'
        ],
        sources: [
          { label: 'Introducción al estudio nutricional', url: 'https://drive.google.com/file/d/1QhAdIZkjQ9NXn_17ZZDkVZ3Su2xz5oju/view' },
          { label: 'Leyes fundamentales y Guías Alimentarias', url: 'https://drive.google.com/file/d/1QRn6MLO3DxUCY_TEJZtumrdjBIGBneQV/view' }
        ]
      },
      fisiologia: {
        label: 'Fisiología II',
        shortLabel: 'Fisiología',
        icon: 'class-icon-physiology',
        accent: '#38bdf8',
        status: 'ready',
        statusLabel: 'Respiratorio · hasta 13 ago.',
        note: 'Incluye únicamente el bloque respiratorio del 10 y 13 de agosto. Neurofisiología queda fuera del alcance de esta P1.',
        reasoningPath: [
          'Identificar el gas, compartimento o variable respiratoria.',
          'Relacionar ventilación, difusión, perfusión y transporte.',
          'Ubicar sensor, centro controlador y efector respiratorio.',
          'Predecir el cambio en ventilación, PaCO₂, pH u oxigenación.',
          'Aplicar la cadena a V/Q, ejercicio, EPOC o una gasometría.'
        ],
        likelyExamTargets: [
          'Ley de Fick, difusión alveolocapilar y factores que la modifican.',
          'Relación ventilación/perfusión y diferencias regionales.',
          'Transporte de O₂ y CO₂, P50 y efectos Bohr y Haldane.',
          'Centros respiratorios, quimiorreceptores y mecanorreceptores.',
          'Respuesta ventilatoria en ejercicio, EPOC y alteraciones gasométricas.'
        ],
        practiceIds: [
          'fisiologia-2026-08-10',
          'fisiologia-2026-08-13'
        ]
      },
      bioquimica: {
        label: 'Bioquímica II',
        shortLabel: 'Bioquímica',
        icon: 'class-icon-biochemistry',
        accent: '#34d399',
        status: 'ready',
        statusLabel: 'Hasta 28 ago.',
        note: 'Incluye la clase del 28 de agosto en las preguntas P1 por decisión de estudio. Su curso completo permanece en el cuaderno de la clase y no se duplica en esta ficha acumulativa.',
        practiceIds: [
          'bioquimica',
          'bioquimica-2026-08-19',
          'bioquimica-2026-08-21',
          'bioquimica-2026-08-26',
          'bioquimica-2026-08-28'
        ],
        sheetPracticeIds: [
          'bioquimica',
          'bioquimica-2026-08-19',
          'bioquimica-2026-08-21',
          'bioquimica-2026-08-26'
        ]
      },
      epidemiologia: {
        label: 'Epidemiología',
        shortLabel: 'Epidemiología',
        icon: 'class-icon-epidemiology',
        accent: '#fbbf24',
        status: 'ready',
        statusLabel: 'Hasta 26 ago.',
        practiceIds: [
          'epidemiologia',
          'epidemiologia-2026-08-19',
          'epidemiologia-2026-08-26'
        ]
      },
      'microbiologia-teorica': {
        label: 'Microbiología II · Teórica',
        shortLabel: 'Micro · Teórica',
        icon: 'class-icon-microbiology',
        accent: '#2dd4bf',
        status: 'ready',
        statusLabel: 'Hasta 24 ago.',
        practiceIds: [
          'microbiologia-teorica',
          'microbiologia-teorica-2026-08-17',
          'microbiologia-teorica-2026-08-24'
        ]
      },
      'microbiologia-practica': {
        label: 'Microbiología II · Práctica',
        shortLabel: 'Micro · Práctica',
        icon: 'class-icon-lab',
        accent: '#a78bfa',
        status: 'ready',
        statusLabel: 'Hasta 27 ago.',
        practiceIds: [
          'microbiologia-practica',
          'microbiologia-practica-2026-08-20',
          'microbiologia-practica-2026-08-27'
        ]
      }
    }
  };

  // P1-only visual supplement. The 10 teacher fields remain untouched in their
  // dated practice bank. These public-domain CDC PHIL references are injected
  // only for the dedicated visual-recognition click, then removed immediately,
  // so the certified 720-question P1 contract and 20/10/10 dated banks do not change.
  var supplementalVisuals = [
    visualReference(
      'micro-p1-cdc-mucor-3961',
      'En esta micrografía de referencia se observa un esporangio maduro. ¿Qué género es el más compatible?',
      ['Mucor spp.', 'Rhizopus spp.', 'Aspergillus spp.', 'Penicillium spp.'],
      0,
      'La referencia CDC PHIL #3961 está identificada como Mucor. El esporangio con esporangiosporas orienta a Mucorales; para separar Mucor de Rhizopus hay que buscar además rizoides y estolones, que no siempre se ven en un solo campo.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/3961/3961_lores.jpg',
      ['Esporangio globoso lleno de esporangiosporas.', 'Patrón de Mucorales, no una cabeza conidial de Aspergillus.', 'La especie no debe asignarse solo por este campo.'],
      'CDC PHIL #3961'
    ),
    visualReference(
      'micro-p1-cdc-penicillium-8398',
      'El conidióforo se ramifica y termina en cadenas de conidios. ¿Qué género reconoce mejor este patrón?',
      ['Aspergillus spp.', 'Penicillium spp.', 'Rhizopus spp.', 'Mucor spp.'],
      1,
      'La referencia CDC PHIL #8398 corresponde a Penicillium. La ramificación en aspecto de pincel y las cadenas de conidios ayudan a diferenciarlo de la vesícula terminal típica de Aspergillus.',
      'https://phil.cdc.gov//PHIL_Images/8398/8398_lores.jpg',
      ['Conidióforo ramificado.', 'Cadenas de conidios en los extremos.', 'Aspecto de pincel: pista clásica de Penicillium.'],
      'CDC PHIL #8398'
    ),
    visualReference(
      'micro-p1-cdc-aspergillus-fumigatus-300',
      '¿Qué especie de referencia documenta el CDC en esta micrografía con conidióforo y cadenas de conidios?',
      ['Aspergillus fumigatus', 'Penicillium glabrum', 'Rhizopus arrhizus', 'Mucor circinelloides'],
      0,
      'CDC PHIL #300 documenta Aspergillus fumigatus. La imagen permite entrenar la organización conidial de Aspergillus; en una muestra desconocida, la identificación definitiva de especie exige integrar morfología completa y métodos de laboratorio.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/04032002/00002/PHIL_300_lores.jpg',
      ['Hifa septada con conidióforo especializado.', 'Conidios producidos desde fiálides, no dentro de un esporangio.', 'Referencia catalogada por CDC como A. fumigatus.'],
      'CDC PHIL #300'
    ),
    visualReference(
      'micro-p1-cdc-candida-albicans-21793',
      'Se observan levaduras con prolongaciones compatibles con tubos germinales. ¿Qué especie de referencia es la más probable?',
      ['Candida albicans', 'Cryptococcus neoformans', 'Malassezia furfur', 'Blastomyces dermatitidis'],
      0,
      'CDC PHIL #21793 muestra Candida albicans formando tubos germinales en suero. Es una pista clásica para C. albicans, aunque C. dubliniensis también puede ser germ-tube positiva; por eso una prueba aislada no sustituye la identificación completa.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/21793/21793_lores.jpg',
      ['Levaduras gemantes.', 'Prolongaciones filamentosas sin constricción basal marcada: tubos germinales.', 'Pista fuerte para C. albicans, con la salvedad de C. dubliniensis.'],
      'CDC PHIL #21793'
    ),
    visualReference(
      'micro-p1-cdc-cryptococcus-24004',
      'En una preparación con tinta negativa se ven levaduras rodeadas por un halo capsular. ¿Qué género debe reconocer primero?',
      ['Cryptococcus spp.', 'Candida spp.', 'Malassezia spp.', 'Trichosporon spp.'],
      0,
      'La referencia CDC PHIL #24004 corresponde a Cryptococcus neoformans. La cápsula evidente apoya fuertemente Cryptococcus; una sola imagen no separa con seguridad C. neoformans de C. gattii, por eso aquí se pregunta el género.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/24004/24004_lores.jpg',
      ['Halo claro alrededor de la levadura: cápsula.', 'Preparación negativa tipo tinta china.', 'La morfología visual sostiene género antes que especie.'],
      'CDC PHIL #24004'
    ),
    visualReference(
      'micro-p1-cdc-histoplasma-10961',
      '¿Qué hongo dimórfico se asocia clásicamente con macroconidios tuberculados como los de esta referencia?',
      ['Histoplasma capsulatum', 'Blastomyces dermatitidis', 'Sporothrix schenckii', 'Cryptococcus neoformans'],
      0,
      'CDC PHIL #10961 identifica Histoplasma capsulatum y muestra macroconidios tuberculados junto con microconidios. Esta es una de las pistas de la fase micelial del hongo dimórfico.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/10961/10961_lores.jpg',
      ['Macroconidios globosos con pared tuberculada.', 'Microconidios pequeños asociados.', 'Fase micelial de un hongo dimórfico.'],
      'CDC PHIL #10961'
    ),
    visualReference(
      'micro-p1-cdc-blastomyces-3788',
      'En tejido se observa una levadura grande en gemación. ¿Qué hongo dimórfico corresponde a esta referencia CDC?',
      ['Blastomyces dermatitidis', 'Histoplasma capsulatum', 'Candida albicans', 'Cryptococcus neoformans'],
      0,
      'CDC PHIL #3788 documenta Blastomyces dermatitidis en fase levaduriforme en tejido pulmonar. La gemación de base ancha es una pista clásica cuando es claramente visible, pero el diagnóstico de laboratorio no debe depender de una sola foto.',
      'https://wwwn.cdc.gov/phil/PHIL_Images/3788/3788_lores.jpg',
      ['Levadura tisular relativamente grande.', 'Gemación como pista morfológica central.', 'Dimorfismo: levadura en tejido y moho en condiciones ambientales.'],
      'CDC PHIL #3788'
    ),
    visualReference(
      'micro-p1-cdc-sporothrix-4208',
      'Las conidias aparecen en grupos alrededor del extremo de un conidióforo. ¿Qué especie de referencia encaja mejor?',
      ['Sporothrix schenckii', 'Trichophyton rubrum', 'Microsporum canis', 'Penicillium glabrum'],
      0,
      'CDC PHIL #4208 corresponde a Sporothrix schenckii. En la fase micelial pueden verse conidios piriformes dispuestos en pequeños grupos o rosetas; esta morfología conecta con la esporotricosis linfocutánea trabajada en clase.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/4208/4208_lores.jpg',
      ['Hifas septadas.', 'Conidios piriformes.', 'Agrupación terminal en roseta o “flor” como pista de Sporothrix.'],
      'CDC PHIL #4208'
    ),
    visualReference(
      'micro-p1-cdc-chromoblastomycosis-28111',
      '¿Qué estructura diagnóstica se debe reconocer en una cromoblastomicosis cuando aparecen células marrones, gruesas y tabicadas?',
      ['Cuerpos muriformes o escleróticos', 'Artroconidios hialinos', 'Esporangiosporas', 'Tubos germinales'],
      0,
      'La referencia CDC PHIL #28111 muestra cuerpos muriformes/escleróticos de cromoblastomicosis. Esta estructura sí es una pista morfológica clave; la especie causal no debe inventarse a partir del cuerpo esclerótico aislado.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/28111/28111_lores.jpg',
      ['Células pigmentadas de pared gruesa.', 'Septos transversales y longitudinales: aspecto muriforme.', 'Reconocer la estructura y la enfermedad antes que forzar una especie.'],
      'CDC PHIL #28111'
    ),
    visualReference(
      'micro-p1-cdc-madurella-4209',
      'En un eumicetoma con granos oscuros, ¿qué especie de referencia trabajada en el material del curso es especialmente importante?',
      ['Madurella mycetomatis', 'Sporothrix schenckii', 'Microsporum canis', 'Candida albicans'],
      0,
      'CDC PHIL #4209 documenta Madurella mycetomatis. En el curso esta especie aparece como causa principal de eumicetoma; la correlación con granos negros y trayectos fistulosos es más útil que intentar reconocer especie únicamente por una imagen aislada.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/4209/4209_lores.jpg',
      ['Pensar primero en eumicetoma ante granos fúngicos.', 'Madurella es un género central en eumicetoma de grano negro.', 'La especie se confirma con estudio microbiológico, no por fotografía aislada.'],
      'CDC PHIL #4209'
    ),
    visualReference(
      'micro-p1-cdc-microsporum-canis-3209',
      '¿Qué dermatofito de la clase corresponde a esta micrografía teñida con azul de lactofenol?',
      ['Microsporum canis', 'Trichophyton rubrum', 'Epidermophyton floccosum', 'Malassezia spp.'],
      0,
      'CDC PHIL #3209 identifica Microsporum canis. Para el examen conviene relacionar el género Microsporum con pelo y piel y buscar macroconidios fusiformes, de pared gruesa y rugosa cuando el campo los muestra bien.',
      'https://phil.cdc.gov//PHIL_Images/3209/3209_lores.jpg',
      ['Dermatofito zoofílico asociado a gatos y perros.', 'Macroconidios fusiformes son una pista clásica del género/especie.', 'En la clase se comparó M. canis con Malassezia en tiña corporal.'],
      'CDC PHIL #3209'
    ),
    visualReference(
      'micro-p1-cdc-trichophyton-rubrum-22309',
      'Se ven hifas filamentosas y numerosos microconidios pequeños dispuestos individualmente a lo largo de ellas. ¿Qué especie de referencia es la más compatible?',
      ['Trichophyton rubrum', 'Microsporum canis', 'Epidermophyton floccosum', 'Malassezia furfur'],
      0,
      'CDC PHIL #22309 corresponde a Trichophyton rubrum. Los microconidios pequeños, laterales y numerosos ayudan a reconocer el patrón, pero el laboratorio integra además cultivo y otras características para la identificación definitiva.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/22309/22309_lores.jpg',
      ['Hifas septadas.', 'Microconidios laterales pequeños y numerosos.', 'Trichophyton afecta piel, uñas y pelo.'],
      'CDC PHIL #22309'
    ),
    visualReference(
      'micro-p1-cdc-malassezia-24943',
      'En un raspado cutáneo aparecen levaduras redondeadas junto con elementos hifales cortos. ¿Qué género es el más compatible?',
      ['Malassezia spp.', 'Candida spp.', 'Cryptococcus spp.', 'Trichophyton spp.'],
      0,
      'CDC PHIL #24943 muestra Malassezia spp. en un raspado de pitiriasis versicolor, con células levaduriformes y elementos pseudohifales cortos. Es el patrón que en clase se resumió como levaduras + hifas cortas.',
      'https://wwwn.cdc.gov/phil///PHIL_Images/24943/24943_lores.jpg',
      ['Levaduras redondeadas agrupadas.', 'Elementos hifales/pseudohifales cortos.', 'Patrón compatible con pitiriasis versicolor por Malassezia.'],
      'CDC PHIL #24943'
    )
  ];

  function visualReference(id, prompt, options, answer, explanation, imageSrc, clues, sourceLabel) {
    return {
      prompt: prompt,
      options: options,
      answer: answer,
      explanation: explanation,
      imageSrc: imageSrc,
      imageAlt: 'Micrografía fúngica de referencia para reconocimiento visual',
      visualRecognitionId: id,
      visualClues: clues.concat(['Fuente: ' + sourceLabel + ' · dominio público.']),
      validationPending: false,
      teacherAngle: 'ampliacion-clinica-cdc',
      teacherAngleLabel: 'AMPLIACIÓN CLÍNICA · CDC PHIL'
    };
  }

  function practicalBank() {
    var practice = window.MedNykutoClassPractice;
    return practice && practice.banks && practice.banks['microbiologia-practica-2026-08-27'];
  }

  function hasVisualId(question, ids) {
    return Boolean(question && ids[question.visualRecognitionId]);
  }

  function addSupplementalForVisualStart() {
    if (window.MedNykutoP1PdfExerciseEnabled) return;
    var bank = practicalBank();
    if (!bank || !Array.isArray(bank.qcm)) return;
    var ids = {};
    supplementalVisuals.forEach(function (question) { ids[question.visualRecognitionId] = true; });
    supplementalVisuals.forEach(function (question) {
      if (!bank.qcm.some(function (current) { return current.visualRecognitionId === question.visualRecognitionId; })) {
        bank.qcm.push(question);
      }
    });
    window.setTimeout(function () {
      bank.qcm = bank.qcm.filter(function (question) { return !hasVisualId(question, ids); });
    }, 0);
  }

  function visualReferenceTotal() {
    var bank = practicalBank();
    var teacherCount = bank && Array.isArray(bank.qcm)
      ? bank.qcm.filter(function (question) { return Boolean(question.visualRecognitionId); }).length
      : 10;
    return teacherCount + supplementalVisuals.length;
  }

  function syncVisualButtonCopy() {
    if (window.MedNykutoP1PdfExerciseEnabled) return;
    var button = document.getElementById('p1StartVisual');
    if (!button) return;
    var strong = button.querySelector('strong');
    var small = button.querySelector('small');
    var selected = document.querySelector('input[name="p1-correction-mode"]:checked');
    var training = !selected || selected.value === 'training';
    if (strong) strong.textContent = 'Reconocer ' + visualReferenceTotal() + ' imágenes · ' + (training ? 'corrección inmediata' : 'corrección al final');
    if (small) small.textContent = '10 campos docentes + ' + supplementalVisuals.length + ' referencias CDC PHIL · fuentes diferenciadas';
  }

  if (typeof document !== 'undefined' && typeof window.addEventListener === 'function') {
    var visualButton = document.getElementById('p1StartVisual');
    if (visualButton) {
      visualButton.addEventListener('click', addSupplementalForVisualStart, true);
    }

    window.addEventListener('load', function () {
      syncVisualButtonCopy();
      document.querySelectorAll('input[name="p1-correction-mode"]').forEach(function (input) {
        input.addEventListener('change', function () {
          window.setTimeout(syncVisualButtonCopy, 0);
        });
      });
    });
  }
})();
