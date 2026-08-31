/* v462 — Semester 3 exact-source runtime bank.
   QCM and Verdadero/Falso are rebuilt only from complete statements found in
   the current course modules. Restored banks stay untouched as source history.
   Inherited clinical cases remain unavailable until a manual, course-grounded review. */
(function(){
  "use strict";

  var VERSION = "v462-exact-course-source";
  var QCM_PER_MODULE = 8;
  var VF_PER_MODULE = 4;
  var root = window.MED_PRACTICE_BANK || {};
  var byCourse = root.byCourse || {};
  var courseData = window.MED_COURSES_DATA || {courses:[]};
  var courseById = {};
  var moduleById = {};
  var conceptsByModule = {};
  var conceptsByCourse = {};

  (courseData.courses || []).forEach(function(course){
    courseById[course.id] = course;
    (course.modules || []).forEach(function(module){
      moduleById[module.id] = {course:course,module:module};
    });
  });

  var stopWords = {};
  "para como cual que quien donde cuando este esta estos estas ese esa esos esas una uno unos unas con por sin sobre entre desde hacia hasta durante mediante contra segun tras ante bajo del las los les el la un en de y o e u a al se es son ser fue han hay mas menos muy ya pero si no su sus lo cada todo toda todos todas mismo misma propios propias puede pueden debe deben".split(" ").forEach(function(word){ stopWords[word] = true; });

  var absoluteCuePattern = /\b(?:siempre|nunca|todos|todas|ninguno|ninguna|exclusivamente|universalmente|jam[aá]s)\b/i;
  var metaPattern = /(?:\b(?:curso|m[oó]dulos?|bloque|profesor|profesora|clase|transcripci[oó]n|estudiar|memorizar|pregunta|examen|distractor|objetivos? de aprendizaje|(?:la\s+)?l[oó]gica|idea (?:central|importante|pedag[oó]gica)|razonamiento|palabras? clave|respuesta esperada|respuesta correcta|debes dominar|debe estudiarse|debes saber|hay que recordar|para revisar|para responder|m[eé]todo de revisi[oó]n|busca qu[eé] dato del enunciado|descarta las opciones|primero identifica el concepto|despu[eé]s pregunta qu[eé] variable|la figura|la tabla|el esquema|en este apartado|en esta secci[oó]n|apunte universitario|protocolo aplicado|criterio de elaboraci[oó]n|complemento pedag[oó]gico|p[aá]ginas blancas|relleno artificial|no confundir|no decir|no aceptar|no olvidar|no interpretar|prepara el contenido|contenido siguiente|m[aá]s adelante se|punto central|punto de partida|destino correcto|luego menciona|proteinuria, glucosuria y cetonuria|urocultivo si)\b|\b(?:course|module_?number|modulenumber|language|format|markdown_?site_?ready|markdownsiteready|title)\s*:)/i;
  var fragmentPattern = /^(?:porque|por eso|por tanto|adem[aá]s|sin embargo|aunque|cuando|cuanto|si(?: bien)?|mientras|tambi[eé]n|es decir|ejemplo|nota|clave|objetivo|respuesta|pregunta|verdadero|falso|recordar|reconocer|identificar|explicar|comprender|relacionar|diferenciar|creer|pensar|para|primero|luego|se|protege|pierde|su|sus|esto|este|esta|eso|ese|esa|estos|estas|ambas?|entre (?:ellos|ellas)|en (?:ellos|ellas)|el primero|la primera|otro caso|no descarta|compatible|en cambio|como|al inicio|cl[ií]nicamente|despu[eé]s|antes|en (?:ese|este|esa|esta)\b)\b/i;
  var unsafeStatementPattern = /(?:\b(?:i|ii|iii|iv)\b\s*(?:es|son)|\b(?:esto|eso)\b|\btodas las anteriores\b|\bninguna de las anteriores\b|\.{2,}|…|\b(?:verdadero|falso)\s*[:/])/i;
  var genericTopicPattern = /^(?:introducci[oó]n|resumen(?: final| integrador)?|s[ií]ntesis(?: final)?|conclusi[oó]n|puntos clave|idea central|idea clave|aplicaci[oó]n cl[ií]nica|integraci[oó]n(?: cl[ií]nica)?|correlaci[oó]n cl[ií]nica|mapa general del m[oó]dulo|c[oó]mo estudiar.*|objetivos? de aprendizaje|desarrollo del curso.*|curso completo)$/i;
  var verbPattern = /\b(?:es|son|est[aá]|est[aá]n|puede|pueden|tiene|tienen|posee|poseen|incluye|incluyen|depende|dependen|produce|producen|sintetiza|sintetizan|aumenta|aumentan|disminuye|disminuyen|activa|activan|inhibe|inhiben|permite|permiten|genera|generan|ocurre|ocurren|funciona|funcionan|requiere|requieren|participa|participan|indica|indican|orienta|orientan|eval[uú]a|eval[uú]an|ayuda|ayudan|justifica|justifican|supera|superan|relaciona|relacionan|entra|entran|sale|salen|transporta|transportan|mantiene|mantienen|regula|regulan|favorece|favorecen|evita|evitan|estimula|estimulan|convierte|convierten|forma|forman|libera|liberan|reconoce|reconocen|presenta|presentan|caracteriza|caracterizan|corresponde|corresponden|resulta|resultan|determina|determinan|contribuye|contribuyen)\b/i;
  var invertibleVerbPattern = /\b(es|son|est[aá]|est[aá]n|puede|pueden|tiene|tienen|posee|poseen|incluye|incluyen|depende|dependen|produce|producen|sintetiza|sintetizan|aumenta|aumentan|disminuye|disminuyen|activa|activan|inhibe|inhiben|permite|permiten|genera|generan|ocurre|ocurren|funciona|funcionan|requiere|requieren|participa|participan|indica|indican|orienta|orientan|eval[uú]a|eval[uú]an|ayuda|ayudan|justifica|justifican|supera|superan|relaciona|relacionan|entra|entran|sale|salen|transporta|transportan|mantiene|mantienen|regula|regulan|favorece|favorecen|evita|evitan|estimula|estimulan|convierte|convierten|libera|liberan|reconoce|reconocen|presenta|presentan|caracteriza|caracterizan|corresponde|corresponden|resulta|resultan|determina|determinan|contribuye|contribuyen)\b/i;
  var leadingVerbPattern = /^(?:es|son|est[aá]|est[aá]n|puede|pueden|tiene|tienen|posee|poseen|incluye|incluyen|depende|dependen|produce|producen|sintetiza|sintetizan|aumenta|aumentan|disminuye|disminuyen|activa|activan|inhibe|inhiben|permite|permiten|genera|generan|ocurre|ocurren|funciona|funcionan|requiere|requieren|participa|participan|indica|indican|orienta|orientan|eval[uú]a|eval[uú]an|ayuda|ayudan|justifica|justifican|supera|superan|relaciona|relacionan|entra|entran|sale|salen|transporta|transportan|mantiene|mantienen|regula|regulan|favorece|favorecen|evita|evitan|estimula|estimulan|convierte|convierten|forma|forman|libera|liberan|reconoce|reconocen|presenta|presentan|caracteriza|caracterizan|corresponde|corresponden|resulta|resultan|determina|determinan|contribuye|contribuyen|apoya|apoyan|conserva|conservan|secreta|secretan)\b/i;
  var clinicalNarrativePattern = /^(?:(?:Un|Una)\s+(?:paciente|niñ[oa]|mujer|hombre|lactante|adolescente|adulto|reci[eé]n nacido)|(?:Dos|Tres|Varios|Varias)\s+(?:padres|hermanos|pacientes|personas|familiares))\b/i;
  var oppositeVerbs = {
    "aumenta":"disminuye","aumentan":"disminuyen","disminuye":"aumenta","disminuyen":"aumentan",
    "activa":"inhibe","activan":"inhiben","inhibe":"activa","inhiben":"activan",
    "entra":"sale","entran":"salen","sale":"entra","salen":"entran",
    "permite":"impide","permiten":"impiden","favorece":"dificulta","favorecen":"dificultan"
  };

  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g," ").trim(); }
  function normalize(value){
    return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9ñ+]+/g," ").trim();
  }
  function words(value){
    return normalize(value).split(/\s+/).filter(function(word){ return word.length >= 4 && !stopWords[word]; });
  }
  function uniqueWords(value){
    var found = {};
    words(value).forEach(function(word){ found[word] = true; });
    return Object.keys(found);
  }
  function stripMarkdown(value){
    return clean(String(value || "")
      .replace(/!\[[^\]]*\]\([^\)]+\)/g," ")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g,"$1")
      .replace(/<[^>]+>/g," ")
      .replace(/[`*_~]/g,"")
      .replace(/^[>•\-*+\s]+/,"")
      .replace(/^\d+[.)-]\s+/,""));
  }
  function splitSentences(value){
    return String(value || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  }
  function contentWordCount(value){ return uniqueWords(value).length; }
  function jaccard(left,right){
    var a = {}, b = {}, union = {}, overlap = 0;
    uniqueWords(left).forEach(function(word){ a[word] = true; union[word] = true; });
    uniqueWords(right).forEach(function(word){ b[word] = true; union[word] = true; });
    Object.keys(a).forEach(function(word){ if(b[word]) overlap += 1; });
    var total = Object.keys(union).length;
    return total ? overlap / total : 0;
  }
  function displayTopic(raw,module){
    var topic = stripMarkdown(raw).replace(/^\d+(?:\.\d+)*[.)-]?\s*/,"").replace(/[.:]+$/g,"");
    if(/^m[oó]dulo\s+\d+\b/i.test(topic) || /\bm[oó]dulo\s+\d+\b.*\bm[oó]dulo\s+\d+\b/i.test(topic)) topic = clean(module.title);
    if(!topic || genericTopicPattern.test(topic) || topic.length > 96) topic = clean(module.title);
    return topic;
  }
  function cleanCandidateStatement(value){
    var statement = stripMarkdown(value)
      .replace(/^(?:[A-F][.)]\s*)?(?:idea central(?: del m[oó]dulo)?|idea del profesor|concepto principal|definici[oó]n(?: para examen)?|explicaci[oó]n(?: del profesor reorganizada| fisiol[oó]gica complementaria)?|punto clave|frase clave|clave(?: del profesor)?|dato clave|mecanismo|funci[oó]n|consecuencia|interpretaci[oó]n|regla cl[ií]nica)\s*[:.-]?\s+/i,"")
      .replace(/^[^.!?]{2,60}?\s+(?=(?:El|La|Los|Las|Un|Una|Su|Sus|Esto|Esta|Este|Estos|Estas)\b)/,"");
    return clean(statement);
  }
  function splitHeadingAndBody(value){
    var match = String(value || "").match(/\s+(?=(?:El|La|Los|Las|Un|Una|En|Este|Esta|Estos|Estas|Como|Cuando|Antes|Despu[eé]s|Durante|Por eso|La idea|Idea del profesor|Definici[oó]n|Concepto)\b)/);
    if(!match || match.index < 4) return null;
    return {heading:value.slice(0,match.index),body:value.slice(match.index).trim()};
  }
  function statementScore(statement,topic){
    var lengthScore = 70 - Math.abs(statement.length - 118) * .35;
    var wordScore = Math.min(contentWordCount(statement),18) * 2;
    var topicOverlap = jaccard(statement,topic) * 18;
    return lengthScore + wordScore + topicOverlap;
  }
  function acceptableStatement(statement,minContentWords){
    if(statement.length < 48 || statement.length > 220) return false;
    if(/[¿?=]|\bhttps?:\/\//i.test(statement)) return false;
    if(!/^[A-ZÁÉÍÓÚÜÑ0-9]/.test(statement) || leadingVerbPattern.test(normalize(statement)) || clinicalNarrativePattern.test(statement)) return false;
    if(!/[.!]$/.test(statement)) return false;
    if(!verbPattern.test(normalize(statement)) || contentWordCount(statement) < (minContentWords || 6)) return false;
    if(absoluteCuePattern.test(statement) || metaPattern.test(statement) || fragmentPattern.test(statement) || unsafeStatementPattern.test(statement)) return false;
    if(/^(?:figura|tabla|esquema|imagen|caso|ejemplo|nota|objetivo|pregunta|respuesta)\b/i.test(statement)) return false;
    return true;
  }
  function moduleConcepts(course,module){
    var raw = String(module.fullMarkdown || module.markdown || "")
      .replace(/\s+(#{1,6})\s+/g,"\n$1 ")
      .replace(/\s*\|\s*/g,"\n")
      .replace(/\s+---\s+/g,"\n");
    var heading = clean(module.title);
    var seen = {};
    var concepts = [], conciseFallbacks = [];
    raw.split(/\n+/).forEach(function(rawLine,lineIndex){
      var headingMatch = rawLine.match(/^\s*#{1,6}\s+(.+)$/);
      if(headingMatch){
        var splitHeading = splitHeadingAndBody(headingMatch[1]);
        if(!splitHeading){ heading = displayTopic(headingMatch[1],module); return; }
        heading = displayTopic(splitHeading.heading,module);
        rawLine = splitHeading.body;
      }
      if(/^\s*(?:```|---+$|===+$)/.test(rawLine)) return;
      var line = stripMarkdown(rawLine);
      if(!line) return;
      splitSentences(line).forEach(function(part,sentenceIndex){
        var statement = cleanCandidateStatement(part);
        if(statement && !/[.!]$/.test(statement)) statement += ".";
        if(!acceptableStatement(statement,4)) return;
        var isStrict = acceptableStatement(statement,6);
        var key = normalize(statement);
        if(!key || seen[key]) return;
        seen[key] = true;
        (isStrict ? concepts : conciseFallbacks).push({
          courseId:course.id,
          courseTitle:course.title,
          moduleId:module.id,
          moduleNumber:Number(module.number || 0),
          moduleTitle:clean(module.title),
          topic:displayTopic(heading,module),
          statement:statement,
          sourceLine:lineIndex + 1,
          sourceSentence:sentenceIndex + 1,
          score:statementScore(statement,heading) - (isStrict ? 0 : 24),
          sourceStrength:isStrict ? "strict" : "concise-fallback"
        });
      });
    });
    if(concepts.length >= 16) return concepts;
    return concepts.concat(conciseFallbacks.slice(0,16 - concepts.length));
  }
  function orderDiverse(concepts){
    var sorted = concepts.slice().sort(function(left,right){ return right.score - left.score || left.sourceLine - right.sourceLine || left.sourceSentence - right.sourceSentence; });
    var selected = [], used = {}, topicCounts = {};
    for(var topicLimit=1;topicLimit<=12;topicLimit++){
      sorted.forEach(function(concept){
        var key = normalize(concept.statement);
        var topicKey = normalize(concept.topic);
        if(used[key] || (topicCounts[topicKey] || 0) >= topicLimit) return;
        used[key] = true;
        topicCounts[topicKey] = (topicCounts[topicKey] || 0) + 1;
        selected.push(concept);
      });
    }
    return selected.slice(0,28);
  }
  function distractorsFor(concept,coursePool){
    var ranked = coursePool.filter(function(other){
      return other.moduleId !== concept.moduleId && normalize(other.statement) !== normalize(concept.statement);
    }).sort(function(left,right){
      var leftScore = Math.abs(left.statement.length - concept.statement.length);
      var rightScore = Math.abs(right.statement.length - concept.statement.length);
      return leftScore - rightScore || left.moduleNumber - right.moduleNumber || left.sourceLine - right.sourceLine;
    });
    var selected = [], usedStatements = {}, usedModules = {};
    ranked.forEach(function(other){
      var key = normalize(other.statement);
      if(selected.length >= 3 || usedStatements[key] || usedModules[other.moduleId]) return;
      usedStatements[key] = true;
      usedModules[other.moduleId] = true;
      selected.push(other);
    });
    if(selected.length < 3){
      ranked.forEach(function(other){
        var key = normalize(other.statement);
        if(selected.length >= 3 || usedStatements[key]) return;
        usedStatements[key] = true;
        selected.push(other);
      });
    }
    return selected;
  }
  function hasObviousLengthCue(options,correctIndex){
    var lengths = options.map(function(option){ return clean(option).length; });
    var correct = lengths[correctIndex];
    var distractors = lengths.filter(function(_,index){ return index !== correctIndex; });
    var secondLongest = Math.max.apply(Math,distractors);
    var shortest = Math.min.apply(Math,distractors);
    return (correct >= secondLongest * 1.2 && correct - secondLongest >= 12)
      || (shortest >= correct * 1.2 && shortest - correct >= 12);
  }
  function pad(value){ return String(value).padStart(3,"0"); }
  function qcmQuestion(topic,index,moduleNumber){
    var scope = "En el módulo " + moduleNumber + ", ";
    return [
      scope + "respecto de «" + topic + "», ¿qué relación es correcta?",
      scope + "al analizar «" + topic + "», ¿qué afirmación mantiene la relación correcta?",
      scope + "en «" + topic + "», ¿qué enunciado describe correctamente el mecanismo?",
      scope + "¿qué relación corresponde a «" + topic + "»?"
    ][index % 4];
  }
  function buildQcm(module,ordered,coursePool){
    var rebuilt = [];
    for(var candidateIndex=0;candidateIndex<ordered.length && rebuilt.length<QCM_PER_MODULE;candidateIndex++){
      var concept = ordered[candidateIndex];
      var distractors = distractorsFor(concept,coursePool);
      if(distractors.length < 3) continue;
      var correctIndex = rebuilt.length % 4;
      var options = distractors.map(function(other){ return other.statement; });
      options.splice(correctIndex,0,concept.statement);
      if(new Set(options.map(normalize)).size !== 4 || hasObviousLengthCue(options,correctIndex)) continue;
      var rationale = [];
      var distractorSources = [];
      options.forEach(function(_,optionIndex){
        if(optionIndex === correctIndex){ rationale[optionIndex] = null; return; }
        var distractorIndex = optionIndex < correctIndex ? optionIndex : optionIndex - 1;
        var source = distractors[distractorIndex];
        rationale[optionIndex] = "Este enunciado pertenece a «" + source.topic + "» del módulo «" + source.moduleTitle + "»; no define el punto preguntado.";
        distractorSources.push({
          optionIndex:optionIndex,
          courseId:source.courseId,
          moduleId:source.moduleId,
          moduleNumber:source.moduleNumber,
          moduleTitle:source.moduleTitle,
          topic:source.topic,
          sourceStatement:source.statement
        });
      });
      rebuilt.push({
        id:module.id + "-qcm-v462-" + pad(rebuilt.length + 1),
        courseId:concept.courseId,
        courseTitle:concept.courseTitle,
        moduleId:concept.moduleId,
        moduleNumber:concept.moduleNumber,
        moduleTitle:concept.moduleTitle,
        heading:concept.topic,
        difficulty:rebuilt.length < 3 ? "Básico" : (rebuilt.length < 6 ? "Intermedio" : "Examen"),
        question:qcmQuestion(concept.topic,rebuilt.length,concept.moduleNumber),
        options:options,
        answerIndex:correctIndex,
        explanation:"La relación correcta es: " + concept.statement + " Referencia del curso: «" + concept.statement + "».",
        whyWrong:rationale,
        distractorExplanations:rationale.slice(),
        keyPoints:["Tema: " + concept.topic,"Respuesta y evidencia: frase exacta del curso","Distractores: frases exactas de otros módulos de la misma materia"],
        qualityStatus:"certified",
        qualityTier:"A-exact-course-source",
        qualityVersion:VERSION,
        generatedFromCourse:VERSION,
        sourceScope:"semester-3-course-module-exact",
        sourceTopic:concept.topic,
        sourceStatement:concept.statement,
        sourceEvidence:concept.statement,
        sourceLine:concept.sourceLine,
        sourceSentence:concept.sourceSentence,
        distractorSources:distractorSources
      });
    }
    return rebuilt;
  }
  function invertStatement(statement){
    var value = clean(statement);
    if(!value || /\b(?:no|ni|sin|excepto|cuando|si|aunque|mientras|pero)\b/i.test(value)) return "";
    if((value.match(/[.!?]/g) || []).length > 1) return "";
    var verbMatches = value.match(new RegExp(invertibleVerbPattern.source,"gi")) || [];
    if(!verbMatches.length) return "";
    var candidates = [], finder = new RegExp(invertibleVerbPattern.source,"gi"), found;
    while((found = finder.exec(value))) candidates.push(found);
    var verbMatch = candidates.filter(function(candidate){ return !!oppositeVerbs[normalize(candidate[0])]; })[0] || candidates[0];
    if(!verbMatch || verbMatch.index > 120 || verbMatch.index > value.length * .72) return "";
    var verb = verbMatch[0];
    var opposite = oppositeVerbs[normalize(verb)];
    if(opposite && /^[A-ZÁÉÍÓÚÑ]/.test(verb)) opposite = opposite.charAt(0).toUpperCase() + opposite.slice(1);
    var replacement = opposite || ("no " + verb), replaceAt = verbMatch.index;
    if(!opposite){
      var prefix = value.slice(0,replaceAt);
      var also = prefix.match(/\btambi[eé]n\s+((?:se\s+)?)$/i);
      var clitic = prefix.match(/\bse\s+$/i);
      if(also){
        replaceAt = also.index;
        replacement = "tampoco " + (also[1] || "") + verb;
      }else if(clitic){
        replaceAt = clitic.index;
        replacement = "no " + clitic[0] + verb;
      }
    }
    var inverted = value.slice(0,replaceAt) + replacement + value.slice(verbMatch.index + verb.length);
    if(normalize(inverted) === normalize(value) || /\bno\s+no\b/i.test(inverted)) return "";
    return inverted;
  }
  function buildVf(module,ordered,excludedStatements){
    var truths = [], falses = [], used = {};
    function takeTruth(allowQcmReuse){
      for(var index=0;index<ordered.length;index++){
        var concept = ordered[index], key = normalize(concept.statement);
        if(used[key] || (!allowQcmReuse && excludedStatements[key])) continue;
        used[key] = true;
        truths.push({concept:concept,assertion:concept.statement,isTrue:true,reusedFromQcm:!!excludedStatements[key]});
        return;
      }
    }
    function takeFalse(allowQcmReuse){
      for(var index=0;index<ordered.length;index++){
        var concept = ordered[index], key = normalize(concept.statement);
        if(used[key] || (!allowQcmReuse && excludedStatements[key])) continue;
        var inverted = invertStatement(concept.statement);
        if(!inverted) continue;
        used[key] = true;
        falses.push({concept:concept,assertion:inverted,isTrue:false,reusedFromQcm:!!excludedStatements[key]});
        return;
      }
    }
    while(falses.length<VF_PER_MODULE/2){ var beforeFalses=falses.length; takeFalse(false); if(falses.length===beforeFalses) break; }
    while(truths.length<VF_PER_MODULE/2){ var beforeTruths=truths.length; takeTruth(false); if(truths.length===beforeTruths) break; }
    while(falses.length<VF_PER_MODULE/2){ var beforeFallbackFalses=falses.length; takeFalse(true); if(falses.length===beforeFallbackFalses) break; }
    while(truths.length<VF_PER_MODULE/2){ var beforeFallbackTruths=truths.length; takeTruth(true); if(truths.length===beforeFallbackTruths) break; }
    var rows = [];
    for(var pair=0;pair<VF_PER_MODULE/2;pair++){
      if(truths[pair]) rows.push(truths[pair]);
      if(falses[pair]) rows.push(falses[pair]);
    }
    return rows.map(function(row,index){
      var concept = row.concept;
      return {
        id:module.id + "-vf-v462-" + pad(index + 1),
        courseId:concept.courseId,
        courseTitle:concept.courseTitle,
        moduleId:concept.moduleId,
        moduleNumber:concept.moduleNumber,
        moduleTitle:concept.moduleTitle,
        heading:concept.topic,
        difficulty:index < 2 ? "Básico" : "Intermedio",
        question:"¿Verdadero o falso? " + row.assertion,
        options:["Verdadero","Falso"],
        answerIndex:row.isTrue ? 0 : 1,
        explanation:row.isTrue
          ? "Verdadero. La afirmación reproduce la relación del curso. Referencia del curso: «" + concept.statement + "»."
          : "Falso. La relación fue modificada y contradice la fuente. La formulación correcta es: " + concept.statement + " Referencia del curso: «" + concept.statement + "».",
        correctionIfFalse:row.isTrue ? "" : "Corrección: " + concept.statement,
        qualityStatus:"certified",
        qualityTier:"A-exact-course-source",
        qualityVersion:VERSION,
        generatedFromCourse:VERSION,
        sourceScope:"semester-3-course-module-exact",
        sourceTopic:concept.topic,
        sourceStatement:concept.statement,
        sourceEvidence:concept.statement,
        sourceLine:concept.sourceLine,
        sourceSentence:concept.sourceSentence,
        sourceVariant:row.isTrue ? "exact" : "controlled-false",
        crossFormatReuse:row.reusedFromQcm
      };
    });
  }

  (courseData.courses || []).forEach(function(course){
    if(!byCourse[course.id] || !(course.modules || []).length) return;
    conceptsByCourse[course.id] = [];
    (course.modules || []).forEach(function(module){
      var concepts = orderDiverse(moduleConcepts(course,module));
      conceptsByModule[module.id] = concepts;
      conceptsByCourse[course.id] = conceptsByCourse[course.id].concat(concepts);
    });
  });

  Object.keys(byCourse).forEach(function(courseId){
    var bank = byCourse[courseId];
    var course = courseById[courseId];
    if(!bank || typeof bank !== "object" || !course || !(course.modules || []).length) return;
    var rawCounts = {qcm:(bank.qcm || []).length,vf:(bank.vf || []).length,cases:(bank.cases || []).length};
    var qcm = [], vf = [];
    (course.modules || []).forEach(function(module){
      var ordered = conceptsByModule[module.id] || [];
      var moduleQcm = buildQcm(module,ordered,conceptsByCourse[courseId] || []);
      var usedStatements = {};
      moduleQcm.forEach(function(item){ usedStatements[normalize(item.sourceStatement)] = true; });
      qcm = qcm.concat(moduleQcm);
      vf = vf.concat(buildVf(module,ordered,usedStatements));
    });
    bank.qcm = qcm;
    bank.vf = vf;
    bank.cases = [];
    var certifiedCounts = {qcm:qcm.length,vf:vf.length,cases:0};
    bank.certification = {
      version:VERSION,
      policy:"exact-course-source-only",
      coverageStatus:"all-modules-source-derived",
      rawCounts:rawCounts,
      certifiedCounts:certifiedCounts,
      excludedCounts:{qcm:Math.max(0,rawCounts.qcm-certifiedCounts.qcm),vf:Math.max(0,rawCounts.vf-certifiedCounts.vf),cases:rawCounts.cases},
      certifiedModuleCounts:{qcm:new Set(qcm.map(function(item){ return item.moduleId; })).size,vf:new Set(vf.map(function(item){ return item.moduleId; })).size,cases:0},
      blockedFormats:["cases"],
      sourceContract:{
        correctAnswer:"exact sentence from the item module",
        distractors:"exact sentences from other modules of the same course",
        trueFalse:"exact source sentence or controlled negation with exact correction",
        clinicalCases:"blocked pending manual source-grounded review"
      },
      note:"Se prioriza fidelidad verificable sobre volumen. Los casos heredados permanecen ocultos hasta una revisión clínica manual por módulo."
    };
  });

  root.__S3_CERTIFIED_BANK__ = VERSION;
})();
