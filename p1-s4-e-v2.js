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
})();
