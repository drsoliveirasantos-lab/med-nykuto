/* v363 — Functional fallback practice bank for Med Nykuto.
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
  function makeVf(course, m, idx, n){
    var t = topic(m);
    var isTrue = n % 2 === 0;
    var item = baseMeta(course, m, idx, "vf", n);
    item.options = ["Verdadero","Falso"];
    item.answerIndex = isTrue ? 0 : 1;
    item.question = isTrue
      ? "Para estudiar “" + t + "”, es correcto relacionar cada definición con su mecanismo y su consecuencia."
      : "En “" + t + "”, una opción con vocabulario técnico siempre debe considerarse correcta aunque invierta el mecanismo.";
    item.explanation = isTrue
      ? "Verdadero. La comprensión útil exige conectar definición, mecanismo y consecuencia."
      : "Falso. El vocabulario técnico no basta; una opción es falsa si invierte causalidad, dirección, localización o contexto.";
    item.correctionIfFalse = isTrue ? "" : "La opción solo es correcta si respeta el mecanismo y su consecuencia en el contexto del módulo.";
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
      course.modules.forEach(function(m, idx){ for(var j=1;j<=10;j++) existing.vf.push(makeVf(course, m, idx, j)); });
    }
    if(!Array.isArray(existing.cases) || existing.cases.length === 0){
      existing.cases = [];
      course.modules.forEach(function(m, idx){ for(var k=1;k<=5;k++) existing.cases.push(makeCase(course, m, idx, k)); });
    }
  }

  (data.courses || []).filter(function(c){ return allowed.indexOf(c.id) !== -1; }).forEach(buildMissing);
})();
