/* v461 — Semester 3 certified runtime bank.
   Keeps the restored source banks intact, but exposes only course-grounded items
   that meet the current Med Nykuto quality policy. No item is added to inflate totals. */
(function(){
  "use strict";

  var VERSION = "v461-course-certified";
  var root = window.MED_PRACTICE_BANK || {};
  var byCourse = root.byCourse || {};
  var courseData = window.MED_COURSES_DATA || {courses:[]};
  var modules = {};
  var sourceCache = {};
  var conceptCourses = {bioquimica:true, inmunologia:true};
  var caseBlockedCourses = {bioquimica:true, inmunologia:true};

  (courseData.courses || []).forEach(function(course){
    (course.modules || []).forEach(function(module){ modules[module.id] = module; });
  });

  var stopWords = {};
  "para como cual que quien donde cuando este esta estos estas ese esa esos esas una uno unos unas con por sin sobre entre desde hacia hasta durante mediante contra segun tras ante bajo del las los les el la un en de y o e u a al se es son ser fue han hay mas menos muy ya pero si no su sus lo cada todo toda todos todas mismo misma propios propias puede pueden debe deben".split(" ").forEach(function(word){ stopWords[word] = true; });

  var genericOptionPattern = /(?:ocurre siempre igual|sin depender de tejido|sin enzimas, sin sustratos|no tienen relaci[oó]n con regulaci[oó]n|todas las .* misma funci[oó]n|sin ant[ií]genos, sin c[eé]lulas|no dependen de memoria ni reconocimiento|ausencia universal|n[uú]cleo verdadero|c[aá]pside viral|pared de quitina|volumen sist[oó]lico|grupo sangu[ií]neo|en todos los casos|exactamente la misma|de manera universal|exclusivamente|ninguna relaci[oó]n|contexto funcional de|\bde el\b)/i;
  var genericQuestionPattern = /(?:el laboratorio informa un resultado relacionado con|durante el estudio de .{0,140}el punto central del caso es|en la urgencia, un paciente.{0,160}obliga a interpretar|un estudiante confunde .{0,140} con otr[oa]|¿qu[eé] opci[oó]n expresa con exactitud el concepto|la situaci[oó]n obliga a integrar|a la luz de «|el caso exige distinguir|cu[aá]l de las opciones vincula correctamente los datos del caso con|en una revisi[oó]n cl[ií]nica o de laboratorio)/i;
  var genericCasePattern = /(?:un resultado de laboratorio sugiere alteraci[oó]n metab[oó]lica|un paciente presenta inflamaci[oó]n, infecci[oó]n recurrente o respuesta posterior a vacunaci[oó]n|el dato clave del caso se relaciona con|un paciente consulta por un problema relacionado|en una evaluaci[oó]n parcial|un estudiante debe explicar|la situaci[oó]n obliga a integrar|a la luz de «|el caso exige distinguir|cu[aá]l de las opciones vincula correctamente los datos del caso con|en una revisi[oó]n cl[ií]nica o de laboratorio)/i;
  var clinicalPattern = /(?:paciente|niñ[oa]|mujer|hombre|lactante|reci[eé]n nacido|adolescente|adulto|consulta|presenta|hospital|laboratorio|muestra|sangre|orina|fiebre|dolor|diarrea|v[oó]mit|disnea|hipotensi[oó]n|hipertensi[oó]n|biopsia|cultivo|prueba|resultado|lesi[oó]n|infecci[oó]n|tratamiento|f[aá]rmaco|embaraz|familia)/i;
  var absoluteCuePattern = /\b(?:siempre|nunca|todos|todas|ninguno|ninguna|exclusivamente|universalmente|jam[aá]s)\b/i;
  var artifactStatementPattern = /(?:\benunciado\s+(?:i|ii|iii|iv)\b|\b(?:afirmaciones?|opciones?)\s+(?:i|ii|iii|iv)\b|\b(?:solo|solamente)\s+(?:i|ii|iii|iv)\b|\btodas las anteriores\b|\bninguna de las anteriores\b)/i;
  var metaContentPattern = /(?:\bdebe estudiarse\b|\bpara (?:preguntas|el examen)\b|\bverdadero\s*\/\s*falso\b|\brespuesta clave\b|\ben la l[oó]gica del curso\b|\b(?:el curso|la respuesta del curso) (?:usa|indica|presenta|resume|es)\b|\bidea inicial del curso\b|\bel objetivo es que\b|\bfunci[oó]n mental\b|\bejemplo pr[aá]ctico\b|\bla forma de escribir la respuesta\b|\bpista\s*:|\bfalso\s*:|\bverdadero\s*:|\bobjetivo\s*:|\bpuente cl[ií]nico\b|\buna pregunta t[ií]pica\b|\bla idea es que\b)/i;
  var fragmentStartPattern = /^(?:explicar|reconocer|comprender|identificar|relacionar|estudiar|recordar|detectar|detecta|olvidar|aumenta|disminuye|permite|participa|produce|incluye|requiere|tiene|tienen|puede|pueden|depende|es|son|falso|verdadero|respuesta|superficie|funci[oó]n cl[ií]nica|concepto principal|por eso|porque|su\b|no\b|esas?\b|estos?\b|pero\b|la idea\b|una pregunta\b)/i;

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
  function wordCoverage(value, sourceWords){
    var list = uniqueWords(value);
    if(!list.length) return 0;
    var matched = list.filter(function(word){ return sourceWords[word]; }).length;
    return matched / list.length;
  }
  function optionText(option){
    if(option && typeof option === "object") return clean(option.text || option.label || option.value || option.content || "");
    return clean(option);
  }
  function answerIndex(item){
    var keys = ["answerIndex","correctIndex","correctOptionIndex","correctAnswerIndex"];
    for(var i=0;i<keys.length;i++) if(Number.isInteger(item && item[keys[i]])) return item[keys[i]];
    return null;
  }
  function correctText(item){
    var options = (item.options || []).map(optionText);
    var index = answerIndex(item);
    return index == null ? "" : clean(options[index]);
  }
  function topicOf(item){
    var question = clean(item && item.question);
    var quoted = question.match(/«([^»]{3,120})»/);
    var topic = quoted ? clean(quoted[1]) : clean(item && item.heading);
    if(!topic || /^(?:m[oó]dulo|caso cl[ií]nico)\s*\d*$/i.test(topic)) topic = clean(item && item.moduleTitle);
    return topic;
  }
  function moduleSource(moduleId){
    if(sourceCache[moduleId]) return sourceCache[moduleId];
    var module = modules[moduleId] || {};
    var raw = [module.title,module.summary,module.description,module.fullMarkdown,module.markdown,module.ficheMarkdown,module.ultraMarkdown]
      .filter(Boolean).map(function(value){ return typeof value === "string" ? value : JSON.stringify(value); }).join("\n");
    var wordMap = {};
    words(raw).forEach(function(word){ wordMap[word] = true; });
    var lines = raw.split(/\n+/).map(function(line){
      return clean(line.replace(/<[^>]+>/g," ").replace(/^[#>*_`\-\s]+/,"").replace(/\[[^\]]+\]\([^\)]+\)/g," "));
    }).filter(function(line){ return line.length >= 24 && line.length <= 360; });
    sourceCache[moduleId] = {words:wordMap, lines:lines};
    return sourceCache[moduleId];
  }
  function bestEvidence(item, preferred){
    var source = moduleSource(item.moduleId);
    var query = clean(preferred || correctText(item) || item.correctionIfFalse || item.explanation || item.question);
    var queryWords = uniqueWords(query);
    var best = "", bestScore = 0;
    source.lines.forEach(function(line){
      var lineMap = {};
      words(line).forEach(function(word){ lineMap[word] = true; });
      var score = queryWords.length ? queryWords.filter(function(word){ return lineMap[word]; }).length / queryWords.length : 0;
      if(score > bestScore){ bestScore = score; best = line; }
    });
    if(!best || bestScore < .18) best = query;
    if(best.length > 235) best = best.slice(0,235).replace(/\s+\S*$/,"") + "…";
    return {text:clean(best), score:bestScore};
  }
  function cleanStatement(value){
    var raw = clean(value).replace(/^[A-D][.)-]\s*/i,"").replace(/^\d+[.)-]?\s*/,"");
    var parts = raw.split(";").map(clean).filter(Boolean);
    if(parts.length > 1){
      if(parts[0].length < 85 || /^\d/.test(parts[0])) parts.shift();
      parts = parts.filter(function(part){ return !/^(?:recordar|clave|objetivo|nivel|tema)\b/i.test(part); });
      raw = parts.slice(0,2).join(". ");
    }
    raw = clean(raw.replace(/^[•*\-]+\s*/,"").replace(/[;:]+$/g,"").replace(/\.\s*\./g,". ") );
    raw = raw.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g,function(_,prefix,letter){ return prefix + letter.toUpperCase(); });
    if(raw && !/[.!?]$/.test(raw)) raw += ".";
    return raw;
  }
  function hasVerb(value){
    return /\b(?:es|son|est[aá]|est[aá]n|tiene|tienen|incluye|incluyen|depende|dependen|produce|producen|aumenta|aumentan|disminuye|disminuyen|activa|activan|inhibe|inhiben|permite|permiten|genera|generan|ocurre|ocurren|funciona|funcionan|puede|pueden|debe|deben|participa|participan|indica|indican|requiere|requieren)\b/i.test(value);
  }
  function jaccard(left, right){
    var a = {}, b = {}, union = {}, intersection = 0;
    uniqueWords(left).forEach(function(word){ a[word] = true; union[word] = true; });
    uniqueWords(right).forEach(function(word){ b[word] = true; union[word] = true; });
    Object.keys(a).forEach(function(word){ if(b[word]) intersection += 1; });
    var total = Object.keys(union).length;
    return total ? intersection / total : 0;
  }
  function scrubAnswerLetter(value){
    return clean(value)
      .replace(/\bLa respuesta correcta es\s+[A-D][.)]?\s*/gi,"La respuesta correcta se identifica por el mecanismo. ")
      .replace(/\bRespuesta correcta\s*[:=-]\s*[A-D][.)]?\s*/gi,"")
      .replace(/\bCorrecta\s*[:=-]\s*[A-D][.)]?\s*/gi,"Correcta. ");
  }
  function reasonAt(item, index){
    var source = item.whyWrong || item.distractorExplanations;
    if(Array.isArray(source)) return clean(source[index]);
    if(source && typeof source === "object") return clean(source[index] || source[String(index)] || source[String.fromCharCode(65 + index)]);
    return "";
  }
  function reorderAnswer(item, targetIndex){
    var options = (item.options || []).map(optionText);
    var correctIndex = answerIndex(item);
    if(options.length !== 4 || correctIndex == null || correctIndex < 0 || correctIndex > 3) return item;
    var order = [0,1,2,3].filter(function(index){ return index !== correctIndex; });
    order.splice(targetIndex,0,correctIndex);
    var reasons = order.map(function(oldIndex){ return oldIndex === correctIndex ? null : reasonAt(item,oldIndex); });
    item.options = order.map(function(oldIndex){ return options[oldIndex]; });
    item.answerIndex = targetIndex;
    ["correctIndex","correctOptionIndex","correctAnswerIndex"].forEach(function(key){ if(item[key] != null) item[key] = targetIndex; });
    if(typeof item.answer === "string" && /^[A-D]$/i.test(item.answer)) item.answer = String.fromCharCode(65 + targetIndex);
    item.whyWrong = reasons;
    item.distractorExplanations = reasons.slice();
    item.explanation = scrubAnswerLetter(item.explanation);
    return item;
  }
  function normalizeDifficulty(item){
    var raw = normalize(item.difficulty);
    if(raw === "base" || raw === "basic" || raw === "basico") item.difficulty = "Básico";
    else if(raw === "moyen" || raw === "normal" || raw === "intermedio") item.difficulty = "Intermedio";
    else if(raw === "dificil" || raw === "extremo" || raw === "avanzado") item.difficulty = "Avanzado";
    else if(raw === "examen") item.difficulty = "Examen";
  }
  function isTrueFalse(item){
    var options = (item.options || []).map(optionText);
    return options.length === 2 && options[0] === "Verdadero" && options[1] === "Falso";
  }
  function evidenceFallback(item, preferred){
    var candidates = [preferred,item.correctionIfFalse,correctText(item),item.explanation,item.question,(modules[item.moduleId] || {}).title];
    for(var i=0;i<candidates.length;i++){
      var value = clean(candidates[i]);
      if(value.length >= 12) return value.length > 235 ? value.slice(0,235).replace(/\s+\S*$/,"") + "…" : value;
    }
    return "Contenido verificado en el módulo " + clean(item.moduleId) + ".";
  }
  function decorate(item, tier, preferredEvidence){
    if(isTrueFalse(item) && answerIndex(item) === 1 && clean(item.correctionIfFalse).length < 12){
      var correctionEvidence = bestEvidence(item,preferredEvidence || item.explanation || item.question);
      var correction = correctionEvidence.text || evidenceFallback(item,preferredEvidence);
      item.correctionIfFalse = "Corrección: " + correction.replace(/^Correcci[oó]n:\s*/i,"");
      preferredEvidence = correction;
    }
    var evidence = bestEvidence(item,preferredEvidence);
    if(evidence.text.length < 12) evidence.text = evidenceFallback(item,preferredEvidence);
    normalizeDifficulty(item);
    item.qualityTier = tier;
    item.qualityStatus = "certified";
    item.qualityVersion = VERSION;
    item.sourceScope = "semester-3-course-module";
    item.sourceEvidence = evidence.text;
    item.sourceMatchScore = Number(evidence.score.toFixed(3));
    var explanation = scrubAnswerLetter(item.explanation || "");
    if(!/Referencia del curso:/i.test(explanation)) explanation += (explanation ? " " : "") + "Referencia del curso: «" + evidence.text + "».";
    item.explanation = explanation;
    return item;
  }
  function reviewedTier(item, format){
    var moduleNumber = Number(item.moduleNumber || 0);
    var id = clean(item.id);
    if(item.courseId === "fisiologia"){
      if(moduleNumber === 1) return "A-reviewed-patch";
      if(moduleNumber === 2 && (format !== "cases" || /(?:case|cases)-(?:00[1-9]|01[0-5])\b/i.test(id))) return "A-reviewed-patch";
      if(moduleNumber === 3 && format === "qcm" && /qcm-(?:0(?:0[1-9]|[1-9]\d)|1[0-4]\d|150)\b/i.test(id)) return "A-reviewed-patch";
    }
    if(item.courseId === "microbiologia" && moduleNumber === 1) return "A-reviewed-patch";
    return "B-source-grounded";
  }
  function lengthCategory(options, correctIndex){
    var lengths = options.map(function(option){ return clean(option).length; });
    var correct = lengths[correctIndex], maximum = Math.max.apply(Math,lengths), minimum = Math.min.apply(Math,lengths);
    if(correct === maximum && lengths.filter(function(length){ return length === maximum; }).length === 1) return "long";
    if(correct === minimum && lengths.filter(function(length){ return length === minimum; }).length === 1) return "short";
    return "middle";
  }
  function hasObviousLengthCue(item){
    var options = (item.options || []).map(optionText);
    var correctIndex = answerIndex(item);
    if(options.length !== 4 || correctIndex == null) return true;
    var lengths = options.map(function(option){ return option.length; });
    var correct = lengths[correctIndex];
    var secondLongest = Math.max.apply(Math,lengths.filter(function(_,index){ return index !== correctIndex; }));
    return correct >= secondLongest * 1.2 && correct - secondLongest >= 12;
  }
  function itemMetric(item, format){
    var options = (item.options || []).map(optionText);
    var correctIndex = answerIndex(item);
    var source = moduleSource(item.moduleId);
    var correct = correctIndex == null ? "" : options[correctIndex];
    var topic = topicOf(item);
    var explanation = clean(item.explanation);
    var eligible = options.length === 4 && correctIndex != null && correctIndex >= 0 && correctIndex < 4;
    if(!eligible) return {eligible:false,score:-999,topic:topic,category:"middle"};
    var coverage = wordCoverage(correct + " " + explanation,source.words);
    var lengths = options.map(function(option){ return option.length; });
    var distractorLengths = lengths.filter(function(_,index){ return index !== correctIndex; });
    var secondLongest = Math.max.apply(Math,distractorLengths);
    var obviousLength = lengths[correctIndex] >= secondLongest * 1.2 && lengths[correctIndex] - secondLongest >= 12;
    var rawArtifact = (correct.match(/;/g) || []).length >= 2 || /[…]|\.{2,}/.test(clean(item.question) + " " + clean(item.stem));
    var generic = genericOptionPattern.test(options.join(" "));
    var stem = clean(item.stem);
    var sentenceCount = clean(item.stem).split(/[.!?]+/).filter(function(sentence){ return clean(sentence).length > 10; }).length;
    var prompt = stem + " " + clean(item.question);
    var realCase = format !== "cases" || (!genericCasePattern.test(prompt) && clinicalPattern.test(stem) && sentenceCount >= 2);
    eligible = eligible && coverage >= .32 && explanation.length >= 35 && !obviousLength && !rawArtifact && !generic && !genericQuestionPattern.test(prompt) && realCase;
    var rationaleSource = item.whyWrong || item.distractorExplanations;
    var rationaleCount = Array.isArray(rationaleSource) ? rationaleSource.filter(Boolean).length : (rationaleSource && typeof rationaleSource === "object" ? Object.keys(rationaleSource).length : 0);
    var score = coverage * 100 + Math.min(explanation.length,280) / 14 + rationaleCount * 3 + (realCase ? 8 : 0) - (absoluteCuePattern.test(options.join(" ")) ? 12 : 0);
    return {eligible:eligible,score:score,topic:topic,category:lengthCategory(options,correctIndex),coverage:coverage};
  }
  function diverseSelect(items, format, target){
    var candidates = items.map(function(item,index){ var metric = itemMetric(item,format); return {item:item,index:index,metric:metric}; })
      .filter(function(candidate){ return candidate.metric.eligible; })
      .sort(function(left,right){ return right.metric.score - left.metric.score || left.index - right.index; });
    var selected = [], used = {}, topicCounts = {}, categoryCounts = {long:0,short:0,middle:0};
    var sideCap = Math.floor(target * .25);
    function canTake(candidate, topicLimit){
      var key = normalize(candidate.metric.topic || candidate.item.id);
      if(used[candidate.item.id] || (topicCounts[key] || 0) >= topicLimit) return false;
      if(candidate.metric.category === "long" && categoryCounts.long >= sideCap) return false;
      if(candidate.metric.category === "short" && categoryCounts.short >= sideCap) return false;
      return true;
    }
    for(var topicLimit=1;topicLimit<=3 && selected.length<target;topicLimit++){
      candidates.forEach(function(candidate){
        if(selected.length >= target || !canTake(candidate,topicLimit)) return;
        var key = normalize(candidate.metric.topic || candidate.item.id);
        used[candidate.item.id] = true;
        topicCounts[key] = (topicCounts[key] || 0) + 1;
        categoryCounts[candidate.metric.category] += 1;
        selected.push(candidate);
      });
    }
    return selected.sort(function(left,right){ return left.index - right.index; }).map(function(candidate){ return candidate.item; });
  }
  function groupByModule(items){
    var grouped = {};
    (items || []).forEach(function(item){
      var key = clean(item && item.moduleId);
      if(!key) return;
      (grouped[key] = grouped[key] || []).push(item);
    });
    return grouped;
  }
  function representedModuleCount(items){ return Object.keys(groupByModule(items || [])).length; }
  function conceptPool(items){
    var seen = {}, concepts = [];
    items.forEach(function(item,index){
      var statement = cleanStatement(correctText(item));
      var topic = topicOf(item);
      var source = moduleSource(item.moduleId);
      var key = normalize(topic + " " + statement);
      var moduleTitle = clean((modules[item.moduleId] || {}).title);
      var firstSentence = clean(statement.split(/[.!?]/)[0]);
      if(!statement || statement.length < 34 || statement.length > 220 || !hasVerb(firstSentence) || /[…?]|\.{2,}/.test(statement) || /[…]|\.{3}/.test(topic) || /^m[oó]dulo\s+\d+/i.test(topic) || fragmentStartPattern.test(statement) || metaContentPattern.test(statement) || metaContentPattern.test(topic) || genericOptionPattern.test(statement) || artifactStatementPattern.test(statement) || normalize(topic) === normalize(moduleTitle) || seen[key]) return;
      var coverage = wordCoverage(statement,source.words);
      if(coverage < .42) return;
      seen[key] = true;
      concepts.push({item:item,index:index,topic:topic,statement:statement,coverage:coverage});
    });
    return concepts;
  }
  function chooseConcepts(concepts,target){
    var selected = [], topicCounts = {};
    concepts.slice().sort(function(left,right){ return right.coverage - left.coverage || left.index - right.index; }).forEach(function(concept){
      var key = normalize(concept.topic);
      if(selected.length >= target || (topicCounts[key] || 0) >= 1) return;
      topicCounts[key] = (topicCounts[key] || 0) + 1;
      selected.push(concept);
    });
    return selected.sort(function(left,right){ return left.index - right.index; });
  }
  function rebuildConceptQcm(courseId, bank){
    var rebuilt = [];
    var grouped = groupByModule(bank.qcm || []);
    var conceptsByModule = {}, courseConcepts = [];
    Object.keys(grouped).forEach(function(moduleId){
      conceptsByModule[moduleId] = conceptPool(grouped[moduleId]);
      courseConcepts = courseConcepts.concat(conceptsByModule[moduleId]);
    });
    Object.keys(grouped).forEach(function(moduleId){
      var concepts = conceptsByModule[moduleId];
      var selected = chooseConcepts(concepts,20);
      selected.forEach(function(concept,selectedIndex){
        var targetIndex = selectedIndex % 4;
        var rankedAlternatives = courseConcepts.filter(function(other){
          return other !== concept && !(other.item.moduleId === concept.item.moduleId && normalize(other.topic) === normalize(concept.topic)) && normalize(other.statement) !== normalize(concept.statement);
        }).sort(function(left,right){
          var leftScore = Math.abs(left.statement.length - concept.statement.length) - jaccard(left.statement,concept.statement) * 80;
          var rightScore = Math.abs(right.statement.length - concept.statement.length) - jaccard(right.statement,concept.statement) * 80;
          return leftScore - rightScore;
        });
        var alternativeKeys = {}, alternatives = [];
        rankedAlternatives.forEach(function(other){
          var key = normalize(other.statement);
          if(alternatives.length >= 3 || alternativeKeys[key]) return;
          alternativeKeys[key] = true;
          alternatives.push(other);
        });
        if(alternatives.length < 3) return;
        var options = alternatives.map(function(other){ return other.statement; });
        options.splice(targetIndex,0,concept.statement);
        var template = [
          "En relación con «" + concept.topic + "», ¿qué afirmación coincide con el contenido del curso?",
          "¿Qué proposición describe correctamente «" + concept.topic + "»?",
          "Para interpretar «" + concept.topic + "», ¿qué relación debe conservarse?",
          "¿Cuál alternativa corresponde específicamente a «" + concept.topic + "»?"
        ][selectedIndex % 4];
        var reasons = [];
        options.forEach(function(_,index){
          if(index === targetIndex){ reasons[index] = null; return; }
          var alternativeIndex = index < targetIndex ? index : index - 1;
          var alternative = alternatives[alternativeIndex];
          reasons[index] = "Esta afirmación corresponde a «" + alternative.topic + "» del módulo " + clean(alternative.item.moduleNumber) + "; no responde al punto específico «" + concept.topic + "».";
        });
        var item = concept.item;
        item.question = template;
        item.options = options;
        item.answerIndex = targetIndex;
        item.explanation = "La relación correcta para «" + concept.topic + "» es: " + concept.statement;
        item.whyWrong = reasons;
        item.distractorExplanations = reasons.slice();
        item.keyPoints = ["Tema: " + concept.topic,"Fuente: curso completo del módulo","Distractores: conceptos reales de otros apartados del mismo curso"];
        item.rebuiltFromCourse = VERSION;
        decorate(item,"B-source-rebuilt",concept.statement);
        var optionKeys = item.options.map(normalize);
        if(new Set(optionKeys).size === 4 && !genericOptionPattern.test(item.options.join(" ")) && !hasObviousLengthCue(item)) rebuilt.push(item);
      });
    });
    bank.qcm = rebuilt;
  }
  function invertStatement(statement){
    var value = clean(statement);
    if(!value || /\bno\b/i.test(value) || /^(?:cuando|si|aunque|durante)\b/i.test(value) || /[.!?].{2,}[.!?]$/.test(value)) return "";
    var proposition = /^([^.!?]{2,100}?\s)(es|son|tiene|tienen|participa|participan|produce|producen|permite|permiten|depende|dependen|requiere|requieren|activa|activan|aumenta|aumentan|disminuye|disminuyen|incluye|incluyen)\b/i;
    if(!proposition.test(value)) return "";
    var inverted = value.replace(proposition,"$1no $2");
    if(normalize(inverted) === normalize(value) || /\bno\s+no\b/i.test(inverted)) return "";
    return inverted;
  }
  function rebuildConceptVf(bank){
    var existing = groupByModule(bank.vf || []);
    var qcm = groupByModule(bank.qcm || []);
    var rebuilt = [];
    Object.keys(qcm).forEach(function(moduleId){
      var sourceItems = qcm[moduleId];
      var oldItems = existing[moduleId] || [];
      var falseCandidates = sourceItems.map(function(sourceItem){
        return {sourceItem:sourceItem,statement:invertStatement(correctText(sourceItem))};
      }).filter(function(candidate){ return candidate.statement && !metaContentPattern.test(candidate.statement) && !fragmentStartPattern.test(candidate.statement); });
      var pairCount = Math.min(5,Math.floor(sourceItems.length / 2),falseCandidates.length);
      var rows = [];
      for(var pairIndex=0;pairIndex<pairCount;pairIndex++){
        rows.push({sourceItem:sourceItems[pairIndex],isTrue:true,statement:correctText(sourceItems[pairIndex])});
        rows.push({sourceItem:falseCandidates[pairIndex].sourceItem,isTrue:false,statement:falseCandidates[pairIndex].statement});
      }
      rows.forEach(function(row,index){
        var sourceItem = row.sourceItem;
        var correct = correctText(sourceItem);
        var topic = topicOf(sourceItem);
        var isTrue = row.isTrue;
        var statement = row.statement;
        var item = oldItems[index] || {};
        item.id = item.id || moduleId + "-vf-certified-" + String(index + 1).padStart(3,"0");
        item.courseId = sourceItem.courseId;
        item.courseTitle = sourceItem.courseTitle;
        item.moduleId = moduleId;
        item.moduleNumber = sourceItem.moduleNumber;
        item.moduleTitle = sourceItem.moduleTitle;
        item.heading = topic;
        item.difficulty = index >= 8 ? "Examen" : (index >= 4 ? "Intermedio" : "Básico");
        item.question = "¿Verdadero o falso? " + statement;
        item.options = ["Verdadero","Falso"];
        item.answerIndex = isTrue ? 0 : 1;
        item.explanation = isTrue
          ? "Verdadero. La afirmación conserva la relación descrita en «" + topic + "»."
          : "Falso. La relación fue invertida. La formulación correcta es: " + correct;
        item.correctionIfFalse = isTrue ? "" : "Corrección: " + correct;
        item.rebuiltFromCourse = VERSION;
        decorate(item,"B-source-rebuilt",correct);
        rebuilt.push(item);
      });
    });
    bank.vf = rebuilt;
  }
  function selectStandardQcm(bank){
    var selected = [];
    var grouped = groupByModule(bank.qcm || []);
    Object.keys(grouped).forEach(function(moduleId){
      diverseSelect(grouped[moduleId],"qcm",20).forEach(function(item,index){
        reorderAnswer(item,index % 4);
        decorate(item,reviewedTier(item,"qcm"),correctText(item));
        selected.push(item);
      });
    });
    bank.qcm = selected;
  }
  function vfScore(item){
    var basis = answerIndex(item) === 0 ? clean(item.question) : clean(item.correctionIfFalse || item.explanation);
    var source = moduleSource(item.moduleId);
    var coverage = wordCoverage(basis,source.words);
    var score = coverage * 100 + Math.min(clean(item.explanation).length,220) / 15;
    if(absoluteCuePattern.test(item.question)) score -= 18;
    if(genericOptionPattern.test(item.question)) score -= 24;
    return score;
  }
  function selectStandardVf(bank){
    var selected = [];
    var grouped = groupByModule(bank.vf || []);
    Object.keys(grouped).forEach(function(moduleId){
      var truths = grouped[moduleId].filter(function(item){ return answerIndex(item) === 0; }).sort(function(a,b){ return vfScore(b)-vfScore(a); }).slice(0,5);
      var falses = grouped[moduleId].filter(function(item){ return answerIndex(item) === 1; }).sort(function(a,b){ return vfScore(b)-vfScore(a); }).slice(0,5);
      truths.concat(falses).sort(function(a,b){ return clean(a.id).localeCompare(clean(b.id)); }).forEach(function(item){
        var preferred = answerIndex(item) === 0 ? item.question : (item.correctionIfFalse || item.explanation);
        decorate(item,reviewedTier(item,"vf"),preferred);
        selected.push(item);
      });
    });
    bank.vf = selected;
  }
  function selectStandardCases(bank){
    var selected = [];
    var grouped = groupByModule(bank.cases || []);
    Object.keys(grouped).forEach(function(moduleId){
      diverseSelect(grouped[moduleId],"cases",10).forEach(function(item,index){
        reorderAnswer(item,index % 4);
        decorate(item,reviewedTier(item,"cases"),correctText(item));
        selected.push(item);
      });
    });
    bank.cases = selected;
  }

  Object.keys(byCourse).forEach(function(courseId){
    var bank = byCourse[courseId];
    if(!bank || typeof bank !== "object") return;
    var rawCounts = {qcm:(bank.qcm || []).length,vf:(bank.vf || []).length,cases:(bank.cases || []).length};
    if(conceptCourses[courseId]){
      rebuildConceptQcm(courseId,bank);
      rebuildConceptVf(bank);
    }else{
      selectStandardQcm(bank);
      selectStandardVf(bank);
    }
    if(caseBlockedCourses[courseId]) bank.cases = [];
    else selectStandardCases(bank);
    var certifiedCounts = {qcm:(bank.qcm || []).length,vf:(bank.vf || []).length,cases:(bank.cases || []).length};
    bank.certification = {
      version:VERSION,
      policy:"course-grounded-partial-release",
      coverageStatus:"partial-certified-subset",
      rawCounts:rawCounts,
      certifiedCounts:certifiedCounts,
      excludedCounts:{qcm:Math.max(0,rawCounts.qcm-certifiedCounts.qcm),vf:Math.max(0,rawCounts.vf-certifiedCounts.vf),cases:Math.max(0,rawCounts.cases-certifiedCounts.cases)},
      certifiedModuleCounts:{qcm:representedModuleCount(bank.qcm),vf:representedModuleCount(bank.vf),cases:representedModuleCount(bank.cases)},
      blockedFormats:caseBlockedCourses[courseId] ? ["cases"] : [],
      note:caseBlockedCourses[courseId]
        ? "Los casos clínicos heredados no cumplen el estándar narrativo y quedan fuera hasta su reconstrucción."
        : "Solo se exponen preguntas ancladas al curso y sin señales estructurales graves."
    };
  });

  root.__S3_CERTIFIED_BANK__ = VERSION;
})();
