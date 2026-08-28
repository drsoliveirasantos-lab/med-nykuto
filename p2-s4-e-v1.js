(function () {
  'use strict';

  window.MedNykutoP2Scope = {
    id: 's4-e-p2-2026-v1',
    label: 'P2',
    title: 'Segunda prueba parcial',
    updatedAt: '2026-08-28',
    status: 'provisional',
    statusLabel: 'Alcance provisional',
    description: 'Neurofisiología reunida en una sola ruta para repasar y practicar.',
    note: 'Este P2 es una preparación anticipada. Incluye únicamente las clases de Neurofisiología ya disponibles, pero la cátedra todavía no confirmó oficialmente el alcance de la segunda parcial.',
    defaultLength: 40,
    formatRatios: { qcm: 0.5, vf: 0.25, cases: 0.25 },
    subjects: {
      fisiologia: {
        label: 'Fisiología II · Neurofisiología',
        shortLabel: 'Neurofisiología',
        icon: 'class-icon-physiology',
        accent: '#38bdf8',
        status: 'provisional',
        statusLabel: 'Provisional · 17–27 ago.',
        note: 'Preparación temprana basada en las clases del 17, 20, 24 y 27 de agosto. La inclusión definitiva de estos temas en P2 aún debe ser confirmada por la cátedra.',
        reasoningPath: [
          'Identificar el estímulo, la estructura o el bloqueo inicial.',
          'Nombrar canal, receptor o sinapsis implicada.',
          'Precisar la dirección del ion o de la señal.',
          'Seguir la fibra y la vía hasta su nivel de decusación.',
          'Predecir la respuesta o el lado corporal afectado.'
        ],
        likelyExamTargets: [
          'Potencial de acción, canales iónicos y conducción según mielina y diámetro.',
          'Sinapsis, calcio, neurotransmisores, receptores y circuitos.',
          'Transducción, adaptación y clasificación de fibras sensitivas.',
          'Propiocepción, tacto, nocicepción y termorrecepción.',
          'Columna dorsal, sistema anterolateral, decusación y lateralidad de lesiones.'
        ],
        practiceIds: [
          'fisiologia-2026-08-17',
          'fisiologia-2026-08-20',
          'fisiologia-2026-08-24',
          'fisiologia-2026-08-27'
        ]
      }
    }
  };
})();
