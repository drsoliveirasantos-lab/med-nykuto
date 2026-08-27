(function () {
  'use strict';

  window.MedNykutoP1Scope = {
    id: 's4-e-p1-2026-v1',
    label: 'P1',
    title: 'Primera prueba parcial',
    updatedAt: '2026-08-27',
    defaultLength: 40,
    formatRatios: { qcm: 0.5, vf: 0.25, cases: 0.25 },
    subjects: {
      nutricion: {
        label: 'Nutrición',
        shortLabel: 'Nutrición',
        icon: 'class-icon-nutrition',
        accent: '#fb7185',
        status: 'provisional',
        statusLabel: 'Alcance provisional',
        note: 'Incluye la clase reconstruida y el material oficial disponible. La forma exacta del examen todavía no fue observada.',
        practiceIds: ['nutricion'],
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
        statusLabel: 'Hasta 24 ago.',
        practiceIds: [
          'fisiologia-2026-08-10',
          'fisiologia-2026-08-13',
          'fisiologia-2026-08-17',
          'fisiologia-2026-08-20',
          'fisiologia-2026-08-24'
        ]
      },
      bioquimica: {
        label: 'Bioquímica II',
        shortLabel: 'Bioquímica',
        icon: 'class-icon-biochemistry',
        accent: '#34d399',
        status: 'ready',
        statusLabel: 'Hasta 26 ago.',
        practiceIds: [
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
        statusLabel: 'Hasta 20 ago.',
        practiceIds: [
          'microbiologia-practica',
          'microbiologia-practica-2026-08-20'
        ]
      }
    }
  };
})();
