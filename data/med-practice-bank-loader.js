/* v316 — Lazy practice bank loader
   Purpose: avoid loading every large practice bank on every page.
   This keeps Cloudflare files under 25 MiB and prevents QCM/Cases/VF pages from freezing.
   v316 chains count-safe quality patches after the corresponding bank file.
*/
(function(){
  "use strict";

  var bankFiles = {"bioquimica":"practice-bank-bioquimica.js","fisiologia":"practice-bank-fisiologia.js","genetica":"practice-bank-genetica.js","inmunologia":"practice-bank-inmunologia.js","microbiologia":"practice-bank-microbiologia.js"};
  var patchFiles = {
    "fisiologia":["practice-bank-fisiologia-quality-patch-v314.js","practice-bank-fisiologia-quality-patch-v315.js"],
    "microbiologia":["practice-bank-microbiologia-quality-patch-v312.js","practice-bank-microbiologia-quality-patch-v313.js","practice-bank-microbiologia-quality-patch-v314.js","practice-bank-microbiologia-quality-patch-v315.js","practice-bank-microbiologia-quality-patch-v316.js"]
  };

  function normId(x){
    return String(x || "").toLowerCase().trim();
  }

  function courseFromModule(moduleId){
    try{
      var courses = (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || [];
      for(var i=0; i<courses.length; i++){
        var mods = courses[i].modules || [];
        for(var j=0; j<mods.length; j++){
          if(String(mods[j].id) === String(moduleId)) return courses[i].id;
        }
      }
    }catch(e){}
    return "";
  }

  function bodyPage(){
    try { return document.body && document.body.dataset ? document.body.dataset.page : ""; }
    catch(e){ return ""; }
  }

  function wantedCourses(){
    var params = new URLSearchParams(location.search || "");
    var page = bodyPage();
    var course = normId(params.get("course"));
    var moduleId = params.get("module") || params.get("id") || "";

    if(!course && moduleId) course = normId(courseFromModule(moduleId));

    // Practice pages with explicit course/module need only that course.
    if(course && bankFiles[course]) return [course];

    // Mistakes may need all banks unless filtered by course.
    if(page === "mistakes") return Object.keys(bankFiles);

    // Exam all-courses mode needs all. Course exam needs one.
    if(page === "exam") return course && bankFiles[course] ? [course] : Object.keys(bankFiles);

    // Practice page without a course means "all questions", so load all.
    if(page === "practice") return Object.keys(bankFiles);

    // Catalog, module reader, home etc. do not need full practice banks at startup.
    return [];
  }

  window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {byCourse:{}};
  window.MED_PRACTICE_BANK.byCourse = window.MED_PRACTICE_BANK.byCourse || {};
  window.MED_PRACTICE_BANK_LOADING = true;

  var wanted = wantedCourses();
  window.MED_PRACTICE_BANK_LAZY_WANTED = wanted.slice();

  for(var i=0; i<wanted.length; i++){
    var id = wanted[i];
    var file = bankFiles[id];
    if(!file) continue;
    if(!(window.MED_PRACTICE_BANK.byCourse && window.MED_PRACTICE_BANK.byCourse[id])){
      document.write('<script src="data/' + file + '?v=316"><\/script>');
    }
    var patches = patchFiles[id] || [];
    for(var j=0; j<patches.length; j++){
      document.write('<script src="data/' + patches[j] + '?v=316"><\/script>');
    }
  }

  window.MED_PRACTICE_BANK_LOADING = false;
})();
