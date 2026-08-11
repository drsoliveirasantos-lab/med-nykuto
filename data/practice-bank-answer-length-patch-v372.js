/* v372 — Neutralise les indices de longueur évidents sans changer les réponses.
   Un distracteur trop bref est reformulé comme une proposition complète et
   contextualisée. La proposition médicale d'origine reste inchangée. */
(function(){
  "use strict";
  var root = window.MED_PRACTICE_BANK || {};
  var byCourse = root.byCourse || {};
  var formulations = [
    "presentado aquí como mecanismo principal de acuerdo con el contexto descrito",
    "considerado la explicación dominante de los datos aportados por el enunciado",
    "interpretado como causa directa del fenómeno clínico o funcional observado",
    "considerado el elemento determinante que permitiría explicar esta situación",
    "propuesto como relación fisiopatológica central en este contexto específico",
    "planteado como mecanismo prioritario para relacionar los hallazgos entre sí",
    "elegido como explicación inmediata del resultado señalado en la pregunta",
    "planteado como factor causal principal a partir de la información disponible",
    "utilizado como interpretación central del mecanismo solicitado en este caso",
    "considerado consecuencia directa y predominante del proceso mencionado",
    "adoptado como hipótesis principal para integrar todos los datos disponibles",
    "presentado como mecanismo determinante y no como un fenómeno secundario",
    "interpretado como explicación prioritaria de la relación descrita en el caso",
    "planteado como causa esencial de la modificación funcional comunicada",
    "propuesto como mecanismo directamente responsable del cuadro presentado",
    "considerado la conclusión principal tras integrar los elementos del enunciado"
  ];
  function hash(text){
    var h = 2166136261, value = String(text || "");
    for(var i=0; i<value.length; i++){ h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function text(option){ return typeof option === "string" ? option.replace(/\s+/g," ").trim() : ""; }
  function answerIndex(item){
    if(Number.isInteger(item.answerIndex)) return item.answerIndex;
    if(Number.isInteger(item.correctIndex)) return item.correctIndex;
    return null;
  }
  function neutralise(item){
    if(!item || !Array.isArray(item.options) || item.options.length !== 4) return false;
    if(item.options.some(function(option){ return typeof option !== "string"; })) return false;
    var correct = answerIndex(item);
    if(correct == null || correct < 0 || correct > 3) return false;
    var distractors = [0,1,2,3].filter(function(index){ return index !== correct; });
    var lengths = item.options.map(function(option){ return text(option).length; });
    var shortestDistractor = Math.min.apply(Math, distractors.map(function(index){ return lengths[index]; }));
    var changed = false;
    if(shortestDistractor >= lengths[correct] * 1.2 && shortestDistractor - lengths[correct] >= 12){
      var correctOriginal = text(item.options[correct]).replace(/[.;:,\s]+$/g, "");
      var correctOffset = hash((item.id || "") + "|correct-formulation") % formulations.length;
      item.options[correct] = correctOriginal + ", " + formulations[correctOffset] + ".";
      changed = true;
      lengths = item.options.map(function(option){ return text(option).length; });
    }
    var second = Math.max.apply(Math, distractors.map(function(index){ return lengths[index]; }));
    var correctLength = lengths[correct];
    if(correctLength < second * 1.2 || correctLength - second < 12){
      if(changed) item.__lengthBalancedV372 = true;
      return changed;
    }
    distractors.sort(function(a,b){ return lengths[b] - lengths[a]; });
    var chosen = distractors[hash(item.id || item.question) % Math.min(2, distractors.length)];
    var original = text(item.options[chosen]).replace(/[.;:,\s]+$/g, "");
    var offset = hash((item.id || "") + "|formulation") % formulations.length;
    var suffix = formulations[offset];
    var rewritten = original + ", " + suffix + ".";
    if(rewritten.length < correctLength - 5){
      rewritten = original + ", " + suffix + " et " + formulations[(offset + 7) % formulations.length] + ".";
    }
    item.options[chosen] = rewritten;
    item.__lengthBalancedV372 = true;
    return true;
  }
  var changed = 0;
  Object.keys(byCourse).forEach(function(courseId){
    var bank = byCourse[courseId] || {};
    ["qcm","cases"].forEach(function(format){
      (bank[format] || []).forEach(function(item){ if(neutralise(item)) changed += 1; });
    });
  });
  root.__ANSWER_LENGTH_PATCH__ = {version:"v372", changed:changed};
})();
