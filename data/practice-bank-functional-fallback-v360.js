/* v370 — Functional fallback practice bank for Med Nykuto.
   Marker kept for validators: v360-functional-fallback.
   Rebuilds usable training arrays only when a restored full bank is absent
   or when a specific format is missing. It never overwrites restored QCM,
   V/F or clinical cases that already exist. */
(function(){
  "use strict";

  var root = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {byCourse:{}};
  root.byCourse = root.byCourse || {};
  var data = window.MED_COURSES_DATA || {courses:[]};
  var wanted = window.MED_PRACTICE_BANK_LAZY_WANTED || [];
  var allowed = wanted.length ? wanted : (data.courses || []).map(function(c){ return c.id; });

  function clean(s){ return String(s || "").replace(/\s+/g," ").trim(); }
  function optSet(correct, wrongs, answerIndex){
    var arr = wrongs.slice(0,4);
    arr[answerIndex] = correct;
    return arr;
  }
  function topic(m){ return clean(m.title || m.shortTitle || m.id || "este módulo"); }
  function answerIndexOf(item){
    var value = item && item.answerIndex;
    if(Number.isInteger(value)) return value;
    value = item && item.correctIndex;
    if(Number.isInteger(value)) return value;
    return 0;
  }
  function moduleQuestions(items, moduleId){
    var matching = (Array.isArray(items) ? items : []).filter(function(item){ return String(item.moduleId || "") === String(moduleId || ""); });
    var usable = matching.filter(function(item){
      if(/(?:combinaci[oó]n|enunciados.*verdader|seg[uú]n sean verdaderos)/i.test(clean(item.question))) return false;
      return (item.options || []).every(function(option){ return !/(?:el enunciado|los enunciados|\bI, II|\bII y III)/i.test(clean(option)); });
    });
    return usable.length >= 10 ? usable : matching;
  }
  function statementFromOption(option){
    var raw = clean(option && typeof option === "object" ? (option.text || option.label || option.value || option.content) : option);
    var parts = raw.split(";").map(clean).filter(Boolean);
    var statement = raw;
    if(parts.length >= 2){
      statement = parts[1];
      if(/\?$/.test(statement) && parts[2]) statement = parts[2];
      if(!/\b(es|son|est[aá]|est[aá]n|tiene|tienen|incluye|incluyen|depende|dependen|produce|producen|aumenta|aumentan|disminuye|disminuyen|activa|activan|inhibe|inhiben|permite|permiten|genera|generan|ocurre|ocurren|funciona|funcionan|forma|forman|puede|pueden|debe|deben|se\s+\w+)\b/i.test(statement)){
        statement = parts[0].replace(/^\d+[.)-]?\s*/, "") + ": " + statement.charAt(0).toLowerCase() + statement.slice(1);
      }
    }
    statement = clean(statement).replace(/^[¿?]+/, "").replace(/[;:]+$/, "");
    if(statement && !/[.!?]$/.test(statement)) statement += ".";
    return statement;
  }
  function wrongReason(item, index){
    var reasons = item && (item.whyWrong || item.distractorExplanations);
    if(Array.isArray(reasons)) return clean(reasons[index]);
    if(reasons && typeof reasons === "object") return clean(reasons[String.fromCharCode(65 + index)] || reasons[index]);
    return "";
  }
  function negativeQuestion(item){
    return /\b(excepto|opci[oó]n incorrecta|afirmaci[oó]n incorrecta|enunciado incorrecto|afirmaci[oó]n falsa|no corresponde|no es correcta)\b/i.test(clean(item && item.question));
  }
  function sourceFocus(item, fallbackTopic){
    var options = item && Array.isArray(item.options) ? item.options : [];
    var correctIndex = answerIndexOf(item);
    var order = [correctIndex].concat(options.map(function(_, index){ return index; }).filter(function(index){ return index !== correctIndex; }));
    for(var i=0; i<order.length; i++){
      var parts = clean(options[order[i]]).split(";").map(clean).filter(Boolean);
      if(parts.length > 1){
        var label = clean(parts[0]).replace(/^\d+[.)-]?\s*/, "").replace(/^[A-D][.)-]\s*/i, "");
        if(label.length >= 3 && label.length <= 80) return label;
      }
    }
    var heading = clean(item && (item.heading || item.tags && item.tags.topic));
    if(heading && !/^(m[oó]dulo|caso cl[ií]nico)\s*\d*/i.test(heading)) return heading;
    return fallbackTopic;
  }
  function difficulty(n){
    return n % 10 === 0 ? "Examen" : (n % 5 === 0 ? "Extremo" : (n % 3 === 0 ? "Difícil" : "Normal"));
  }
  function baseMeta(course, m, idx, kind, n){
    return {
      id: m.id + "-" + kind + "-fallback-" + String(n).padStart(3,"0"),
      courseId: course.id,
      courseTitle: course.title,
      moduleId: m.id,
      moduleNumber: m.number || idx + 1,
      moduleTitle: topic(m),
      difficulty: difficulty(n),
      source: "v360-functional-fallback"
    };
  }
  function makeQcm(course, m, idx, n){
    var t = topic(m);
    var answerIndex = (n + idx) % 4;
    var modes = [
      {
        q: "En el módulo “" + t + "”, ¿qué estrategia permite responder mejor una pregunta tipo examen?",
        c: "Identificar el dato clave, relacionarlo con el mecanismo y deducir la consecuencia.",
        w: [
          "Elegir la opción con más palabras técnicas, aunque no explique el mecanismo.",
          "Memorizar una frase aislada sin comprobar si respeta la causalidad.",
          "Buscar una opción absoluta, porque las respuestas extremas suelen ser las mejores.",
          "Ignorar el contexto clínico o de laboratorio y responder solo por familiaridad."
        ],
        e: "La respuesta correcta sigue la lógica dato clave → mecanismo → consecuencia, que es la forma más segura de resolver preguntas de integración."
      },
      {
        q: "¿Cuál es el error más peligroso al estudiar “" + t + "”?",
        c: "Invertir la relación causal entre definición, mecanismo y consecuencia.",
        w: [
          "Leer primero el título del módulo antes de revisar los objetivos.",
          "Usar ejemplos clínicos para fijar un mecanismo fisiológico o patológico.",
          "Comparar dos opciones parecidas antes de elegir la más precisa.",
          "Revisar los errores después de terminar una serie de preguntas."
        ],
        e: "Muchos distractores contienen términos correctos, pero se vuelven falsos cuando invierten causa, dirección, localización o consecuencia."
      },
      {
        q: "Cuando una opción parece correcta en “" + t + "”, ¿qué debes comprobar antes de marcarla?",
        c: "Que no cambie la dirección, la localización ni el nivel de explicación del mecanismo.",
        w: [
          "Que sea la opción más larga, porque normalmente contiene más información.",
          "Que use una palabra vista en el curso, aunque la relación sea incorrecta.",
          "Que elimine todos los matices y presente el fenómeno como siempre igual.",
          "Que repita literalmente una parte del enunciado sin añadir razonamiento."
        ],
        e: "Una opción puede sonar familiar y aun así ser falsa si altera dirección, localización, causalidad o contexto."
      },
      {
        q: "¿Qué tipo de razonamiento se busca entrenar con el módulo “" + t + "”?",
        c: "Un razonamiento activo que conecte concepto, mecanismo, consecuencia y aplicación.",
        w: [
          "Una lectura pasiva sin comparación entre opciones.",
          "Una memorización de palabras sueltas desconectadas del contexto.",
          "Una selección por intuición rápida antes de leer todas las opciones.",
          "Una búsqueda de palabras idénticas entre la pregunta y la respuesta."
        ],
        e: "El entrenamiento útil no consiste en reconocer palabras aisladas, sino en conectar el concepto con su mecanismo y su aplicación."
      }
    ];
    var p = modes[n % modes.length];
    var item = baseMeta(course, m, idx, "qcm", n);
    item.question = p.q;
    item.options = optSet(p.c, p.w, answerIndex);
    item.answerIndex = answerIndex;
    item.explanation = p.e;
    item.whyWrong = {};
    item.options.forEach(function(o, i){
      if(i !== answerIndex) item.whyWrong[String.fromCharCode(65+i)] = "Esta opción es distractora porque no respeta con precisión la relación mecanismo → consecuencia del tema.";
    });
    return item;
  }
  function makeVf(course, m, idx, n, sourceItems, usedQuestions){
    var t = topic(m);
    var isTrue = n % 2 === 0;
    var item = baseMeta(course, m, idx, "vf", n);
    var sources = moduleQuestions(sourceItems, m.id);
    var source = null;
    var options = [];
    var correctIndex = 0;
    var wrongIndexes = [];
    var sourceIsNegative = false;
    var selectedIndex = 0;
    var correctionIndex = 0;
    var selectedStatement = "";
    var correctStatement = "";
    var focus = t;
    var question = "";

    for(var sourceStep=0; sourceStep<Math.max(sources.length, 1) && !question; sourceStep++){
      var candidateSource = sources.length ? sources[(n - 1 + sourceStep) % sources.length] : null;
      var candidateOptions = candidateSource && Array.isArray(candidateSource.options) ? candidateSource.options : [];
      var candidateCorrectIndex = candidateSource ? answerIndexOf(candidateSource) : 0;
      var candidateWrongIndexes = candidateOptions.map(function(_, optionIndex){ return optionIndex; }).filter(function(optionIndex){ return optionIndex !== candidateCorrectIndex; });
      var candidateIsNegative = negativeQuestion(candidateSource);
      var trueIndexes = candidateIsNegative ? candidateWrongIndexes : [candidateCorrectIndex];
      var falseIndexes = candidateIsNegative ? [candidateCorrectIndex] : candidateWrongIndexes;
      var selectedPool = isTrue ? trueIndexes : falseIndexes;
      var correctionPool = candidateIsNegative ? candidateWrongIndexes : [candidateCorrectIndex];

      for(var optionStep=0; optionStep<Math.max(selectedPool.length, 1) && !question; optionStep++){
        var candidateSelectedIndex = selectedPool.length ? selectedPool[(n + idx + optionStep) % selectedPool.length] : candidateCorrectIndex;
        var candidateCorrectionIndex = correctionPool.length ? correctionPool[(n + idx + optionStep + 1) % correctionPool.length] : candidateCorrectIndex;
        var candidateStatement = statementFromOption(candidateOptions[candidateSelectedIndex]);
        var candidateFocus = sourceFocus(candidateSource, t);
        var candidateQuestion = candidateStatement
          ? "En “" + candidateFocus + "”, " + candidateStatement.charAt(0).toLowerCase() + candidateStatement.slice(1)
          : ("El análisis de “" + t + "” exige conservar la relación correcta entre mecanismo y consecuencia.");
        var key = clean(candidateQuestion).toLowerCase();
        if(!usedQuestions[key]){
          source = candidateSource;
          options = candidateOptions;
          correctIndex = candidateCorrectIndex;
          wrongIndexes = candidateWrongIndexes;
          sourceIsNegative = candidateIsNegative;
          selectedIndex = candidateSelectedIndex;
          correctionIndex = candidateCorrectionIndex;
          selectedStatement = candidateStatement;
          correctStatement = statementFromOption(candidateOptions[candidateCorrectionIndex]);
          focus = candidateFocus;
          question = candidateQuestion;
          usedQuestions[key] = true;
        }
      }
    }

    if(!question){
      question = "En “" + t + "”, el análisis debe conservar la relación entre el dato clave, el mecanismo y su consecuencia específica.";
      usedQuestions[clean(question).toLowerCase()] = true;
    }
    item.options = ["Verdadero","Falso"];
    item.answerIndex = isTrue ? 0 : 1;
    item.question = question;
    item.explanation = isTrue
      ? "Verdadero. La afirmación conserva la relación validada en “" + focus + "”."
      : "Falso. " + ((sourceIsNegative ? clean(source && source.explanation) : wrongReason(source, selectedIndex)) || ("La afirmación contradice el mecanismo correcto de “" + focus + "”."));
    item.correctionIfFalse = isTrue ? "" : (correctStatement ? "Corrección: " + correctStatement : "La relación debe formularse de acuerdo con el mecanismo correcto del módulo.");
    if(source && source.id) item.derivedFromQuestionId = source.id;
    item.source = "v370-topic-derived-fallback";
    return item;
  }
  function makeCase(course, m, idx, n){
    var t = topic(m);
    var answerIndex = (n + 1) % 4;
    var item = baseMeta(course, m, idx, "case", n);
    item.stem = "Un estudiante revisa el módulo “" + t + "” antes de un examen. Al resolver una pregunta, reconoce una opción con palabras familiares, pero duda porque la relación causal parece invertida. Decide analizar el dato clave, el mecanismo y la consecuencia antes de responder.";
    item.question = "¿Cuál es la conducta de razonamiento más adecuada en este caso?";
    item.options = optSet(
      "Priorizar la opción que conserva correctamente la secuencia dato clave → mecanismo → consecuencia.",
      [
        "Elegir la opción familiar aunque contradiga el mecanismo.",
        "Responder por intuición sin comparar las demás opciones.",
        "Marcar la alternativa más absoluta porque suele ser más precisa.",
        "Ignorar el contexto del enunciado y buscar solo palabras conocidas."
      ],
      answerIndex
    );
    item.answerIndex = answerIndex;
    item.explanation = "El caso entrena razonamiento clínico o académico: no basta reconocer palabras; hay que verificar si la relación causal se mantiene.";
    return item;
  }
  function buildMissing(course){
    if(!course || !course.id || !Array.isArray(course.modules) || !course.modules.length) return;
    var existing = root.byCourse[course.id] = root.byCourse[course.id] || {title:course.title, version:"v363-mixed-restored-with-fallback"};

    if(!Array.isArray(existing.qcm) || existing.qcm.length === 0){
      existing.qcm = [];
      course.modules.forEach(function(m, idx){ for(var i=1;i<=20;i++) existing.qcm.push(makeQcm(course, m, idx, i)); });
    }
    if(!Array.isArray(existing.vf) || existing.vf.length === 0){
      existing.vf = [];
      var usedVfQuestions = {};
      course.modules.forEach(function(m, idx){ for(var j=1;j<=10;j++) existing.vf.push(makeVf(course, m, idx, j, existing.qcm, usedVfQuestions)); });
    }
    if(!Array.isArray(existing.cases) || existing.cases.length === 0){
      existing.cases = [];
      course.modules.forEach(function(m, idx){ for(var k=1;k<=5;k++) existing.cases.push(makeCase(course, m, idx, k)); });
    }
  }

  (data.courses || []).filter(function(c){ return allowed.indexOf(c.id) !== -1; }).forEach(buildMissing);
})();
