/* v371 — Final runtime quality corrections detected by the complete-bank validator.
   Replaces wording by stable ID without changing counts, answers or medical content. */
(function(){
  "use strict";
  var root = window.MED_PRACTICE_BANK || {};
  var byCourse = root.byCourse || {};
  function updateQuestion(courseId, format, id, question){
    var bank = byCourse[courseId];
    var items = bank && bank[format];
    if(!Array.isArray(items)) return;
    var item = items.find(function(candidate){ return candidate && candidate.id === id; });
    if(item) item.question = question;
  }
  updateQuestion(
    "fisiologia",
    "cases",
    "01-fisiologia-01-neurofisiologia-y-potencial-de-accion-case-v113-034",
    "¿Cómo explica la menor conductancia de Cl⁻ el aumento de excitabilidad postsináptica?"
  );
  updateQuestion(
    "microbiologia",
    "cases",
    "02-microbiologia-01-estructura-bacteriana-y-patogenicidad-case-013-v322",
    "¿Qué mecanismo explica mejor el inicio de los síntomas a las dos horas?"
  );
  updateQuestion(
    "microbiologia",
    "cases",
    "02-microbiologia-01-estructura-bacteriana-y-patogenicidad-case-021-v323",
    "¿Qué significado tienen dos hemocultivos concordantes en este contexto clínico?"
  );
  updateQuestion(
    "microbiologia",
    "cases",
    "02-microbiologia-06-chlamydia-mycoplasma-y-ureaplasma-case-036-v171",
    "¿Qué hallazgo permite diferenciar una infección por Chlamydia de otras causas de uretritis o cervicitis?"
  );
  root.__RUNTIME_QUALITY_PATCH__ = "v371";
})();
