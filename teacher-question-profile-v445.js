(function () {
  'use strict';

  var model = window.MedNykutoAcademicModel;
  var practice = window.MedNykutoClassPractice;
  if (!model || !practice || !practice.banks) return;

  var angleLabels = {
    'mecanismo': 'Mecanismo',
    'por-que': 'Por qué',
    'consecuencia': 'Consecuencia',
    'integracion-clinica': 'Integración clínica',
    'definicion-operativa': 'Definición operativa',
    'comparacion': 'Comparación',
    'secuencia': 'Secuencia',
    'conducta': 'Conducta',
    'estructura-funcion': 'Estructura → función',
    'mecanismo-ionico': 'Mecanismo iónico',
    'aplicacion': 'Aplicación',
    'profundidad-sitio': 'Profundidad y sitio',
    'reconocimiento-patron': 'Reconocimiento de patrón',
    'confirmacion': 'Confirmación',
    'comparacion-clinica': 'Comparación clínica',
    'muestra-tecnica': 'Muestra y técnica',
    'reactivo-objetivo': 'Reactivo y objetivo',
    'reconocimiento-visual': 'Reconocimiento visual',
    'bioseguridad': 'Bioseguridad',
    'clasificacion': 'Clasificación',
    'adecuacion': 'Adecuación',
    'caso-contextual': 'Caso contextual'
  };

  var angleRules = {
    'andrea-lopez': {
      'mecanismo': ['enzim', 'reacci', 'vía', 'ruta', 'sustrato', 'producto', 'cofactor', 'atp', 'nadh'],
      'por-que': ['por qué', 'porque', 'regul', 'activ', 'inhib', 'aumenta', 'disminu', 'flujo'],
      'consecuencia': ['consecuencia', 'resultado', 'produce', 'provoca', 'acumula', 'déficit', 'balance'],
      'integracion-clinica': ['paciente', 'clínic', 'laboratorio', 'diabetes', 'cetoacidosis', 'glucemia', 'ceton', 'caso']
    },
    'andrea-isasi': {
      'definicion-operativa': ['define', 'concepto', 'significa', 'urgencia', 'emergencia', 'triage', 'aps'],
      'comparacion': ['diferencia', 'frente', 'compar', 'objetiva', 'subjetiva', 'referencia', 'contrarreferencia'],
      'secuencia': ['orden', 'primero', 'paso', 'etapa', 'nivel', 'función', 'red', 'siue'],
      'conducta': ['paciente', 'caso', 'prioridad', 'atención', 'recurso', 'conducta', 'riesgo', 'color']
    },
    'giselle-vert': {
      'estructura-funcion': ['estructura', 'función', 'receptor', 'sinapsis', 'fibra', 'mielina', 'centro'],
      'mecanismo-ionico': ['na⁺', 'k⁺', 'ca²⁺', 'ion', 'canal', 'potencial', 'despolar', 'repolar'],
      'comparacion': ['diferencia', 'compar', 'frente', 'mayor', 'menor', 'rápida', 'lenta'],
      'aplicacion': ['paciente', 'caso', 'bloque', 'lidocaína', 'quemadura', 'gasometr', 'predec', 'lesión']
    },
    'alexander-acuna': {
      'profundidad-sitio': ['superficial', 'cutánea', 'subcutánea', 'piel', 'pelo', 'uña', 'sitio', 'profundidad'],
      'reconocimiento-patron': ['lesión', 'placa', 'mácula', 'borde', 'nódulo', 'hifa', 'conidio', 'patrón'],
      'confirmacion': ['muestra', 'koh', 'cultivo', 'biopsia', 'wood', 'confirma', 'diagnóstico'],
      'comparacion-clinica': ['paciente', 'caso', 'diferencia', 'compar', 'tratamiento', 'exposición', 'agente']
    },
    'ruth-castillo': {
      'muestra-tecnica': ['muestra', 'raspado', 'piel', 'pelo', 'uña', 'toma', 'montaje', 'técnica'],
      'reactivo-objetivo': ['koh', 'lactofenol', 'sabouraud', 'reactivo', 'medio', 'agar', 'objetivo', 'concentración'],
      'reconocimiento-visual': ['observa', 'imagen', 'lámina', 'colonia', 'hifa', 'conidio', 'levadura', 'moho', 'macro'],
      'bioseguridad': ['seguridad', 'guante', 'bata', 'aerosol', 'cerrado', 'descarte', 'contamina', 'riesgo']
    },
    'johana-leguizamon': {
      'clasificacion': ['clasifica', 'alimentación', 'nutrición', 'dieta', 'fuente', 'fortific', 'grupo'],
      'adecuacion': ['adecu', 'necesidad', 'contexto', 'edad', 'embarazo', 'recursos', 'sostener'],
      'comparacion': ['diferencia', 'compar', 'cantidad', 'calidad', 'armonía', 'variedad'],
      'caso-contextual': ['paciente', 'caso', 'historia', 'recomend', 'plato', 'cambio', 'persona']
    }
  };

  function questionText(question) {
    return [question.scenario, question.prompt, question.explanation].filter(Boolean).join(' ').toLocaleLowerCase('es');
  }

  function scoreAngles(profile, question, type) {
    var text = questionText(question);
    var rules = angleRules[profile.id] || {};
    var scores = {};
    profile.questionAngles.forEach(function (angle) {
      scores[angle] = (rules[angle] || []).reduce(function (score, token) {
        return score + (text.indexOf(token) >= 0 ? 1 : 0);
      }, 0);
    });
    if (type === 'cases') scores[profile.questionAngles[profile.questionAngles.length - 1]] += 3;
    if (type === 'vf') scores[profile.questionAngles[1]] += 1;
    return scores;
  }

  function bestAngle(profile, scores, fallbackIndex) {
    return profile.questionAngles.reduce(function (best, angle) {
      return scores[angle] > scores[best] ? angle : best;
    }, profile.questionAngles[fallbackIndex % profile.questionAngles.length]);
  }

  var lessonByPracticeId = {};
  Object.keys(model.subjects).forEach(function (subjectId) {
    var subject = model.subjects[subjectId];
    subject.chapters.forEach(function (chapter) {
      chapter.lessons.forEach(function (lesson) {
        lessonByPracticeId[lesson.practiceId] = {
          subjectId: subjectId,
          subject: subject,
          chapter: chapter,
          lesson: lesson
        };
      });
    });
  });

  Object.keys(practice.banks).forEach(function (bankId) {
    var bank = practice.banks[bankId];
    var mapping = lessonByPracticeId[bankId] || lessonByPracticeId[bank.courseId];
    if (!mapping) return;

    var profile = model.teachers[mapping.subject.teacherId];
    if (!profile) return;

    bank.teacherProfileId = profile.id;
    bank.teacherProfileVersion = model.version;
    bank.teacherProfileName = profile.name;
    bank.teacherProfileLabel = profile.name + ' · ' + profile.confidence;
    bank.teacherAuditSummary = profile.reasoningPath.join(' → ');
    bank.teacherQuestionAngles = profile.questionAngles.slice();
    bank.academicLessonId = mapping.lesson.id;
    bank.academicChapterId = mapping.chapter.id;

    var classified = [];
    var offset = 0;
    ['qcm', 'vf', 'cases'].forEach(function (type) {
      (bank[type] || []).forEach(function (question, questionIndex) {
        var scores = scoreAngles(profile, question, type);
        question.teacherProfileId = profile.id;
        question.teacherAngle = bestAngle(profile, scores, offset + questionIndex);
        question.teacherAngleLabel = angleLabels[question.teacherAngle] || question.teacherAngle;
        question.teacherEvidenceState = type === 'cases' ? 'application' : 'course-grounded';
        question.academicLessonId = mapping.lesson.id;
        classified.push({ question: question, scores: scores });
      });
      offset += (bank[type] || []).length;
    });

    profile.questionAngles.forEach(function (requiredAngle) {
      if (classified.some(function (item) { return item.question.teacherAngle === requiredAngle; })) return;
      var counts = {};
      classified.forEach(function (item) { counts[item.question.teacherAngle] = (counts[item.question.teacherAngle] || 0) + 1; });
      var candidate = classified.filter(function (item) { return counts[item.question.teacherAngle] > 1; }).sort(function (a, b) {
        return b.scores[requiredAngle] - a.scores[requiredAngle];
      })[0];
      if (!candidate) return;
      candidate.question.teacherAngle = requiredAngle;
      candidate.question.teacherAngleLabel = angleLabels[requiredAngle] || requiredAngle;
    });
  });
})();
