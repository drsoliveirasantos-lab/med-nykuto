/* v364 — Lazy practice bank loader after question-bank refresh.
   Loads restored split banks first, then fallback only to complete missing formats,
   then the newest quality patches. */
(function(){
  "use strict";
  var VERSION = "364";
  var bankFiles = {"bioquimica":"practice-bank-bioquimica.js","fisiologia":"practice-bank-fisiologia.js","genetica":"practice-bank-genetica.js","inmunologia":"practice-bank-inmunologia.js","microbiologia":"practice-bank-microbiologia.js"};
  var patchFiles = {
    "fisiologia":["practice-bank-fisiologia-quality-patch-v314.js","practice-bank-fisiologia-quality-patch-v315.js","practice-bank-fisiologia-quality-patch-v316.js","practice-bank-fisiologia-quality-patch-v317.js","practice-bank-fisiologia-quality-patch-v318.js","practice-bank-fisiologia-quality-patch-v319.js","practice-bank-fisiologia-quality-patch-v320.js","practice-bank-fisiologia-quality-patch-v321.js","practice-bank-fisiologia-quality-patch-v322.js","practice-bank-fisiologia-quality-patch-v323.js","practice-bank-fisiologia-quality-patch-v324.js","practice-bank-fisiologia-quality-patch-v325.js","practice-bank-fisiologia-quality-patch-v326.js","practice-bank-fisiologia-quality-patch-v327.js","practice-bank-fisiologia-quality-patch-v328.js","practice-bank-fisiologia-quality-patch-v329.js","practice-bank-fisiologia-quality-patch-v330.js","practice-bank-fisiologia-quality-patch-v331.js","practice-bank-fisiologia-quality-patch-v332.js","practice-bank-fisiologia-quality-patch-v333-m2-qcm-081-120.js","practice-bank-fisiologia-quality-patch-v344-m2-qcm-121-160.js","practice-bank-fisiologia-quality-patch-v345-m2-qcm-161-200.js","practice-bank-fisiologia-quality-patch-v345-m3-qcm-031-070.js","practice-bank-fisiologia-quality-patch-v346-m2-vf-001-025.js","practice-bank-fisiologia-quality-patch-v347-m3-qcm-071-110.js","practice-bank-fisiologia-quality-patch-v347-m2-vf-026-050.js","practice-bank-fisiologia-quality-patch-v350-m2-cases-001-015.js","practice-bank-fisiologia-quality-patch-v348-m3-qcm-111-150.js"],
    "microbiologia":["practice-bank-microbiologia-quality-patch-v312.js","practice-bank-microbiologia-quality-patch-v313.js","practice-bank-microbiologia-quality-patch-v314.js","practice-bank-microbiologia-quality-patch-v315.js","practice-bank-microbiologia-quality-patch-v316.js","practice-bank-microbiologia-quality-patch-v317.js","practice-bank-microbiologia-quality-patch-v318.js","practice-bank-microbiologia-quality-patch-v319.js","practice-bank-microbiologia-quality-patch-v320.js","practice-bank-microbiologia-quality-patch-v321.js","practice-bank-microbiologia-quality-patch-v322.js","practice-bank-microbiologia-quality-patch-v323.js","practice-bank-microbiologia-quality-patch-v324.js","practice-bank-microbiologia-quality-patch-v325.js","practice-bank-microbiologia-readable-options-patch-v326.js","practice-bank-microbiologia-readable-options-patch-v327.js","practice-bank-microbiologia-readable-options-patch-v328.js","practice-bank-microbiologia-readable-options-patch-v329.js","practice-bank-microbiologia-readable-options-patch-v330.js","practice-bank-microbiologia-readable-options-patch-v331.js","practice-bank-microbiologia-readable-options-patch-v332.js","practice-bank-microbiologia-readable-options-patch-v333.js","practice-bank-microbiologia-readable-options-patch-v334.js","practice-bank-microbiologia-readable-options-patch-v335.js"]
  };
  function normId(x){ return String(x || "").toLowerCase().trim(); }
  function courseFromModule(moduleId){
    try{
      var courses = (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || [];
      for(var i=0; i<courses.length; i++){
        var mods = courses[i].modules || [];
        for(var j=0; j<mods.length; j++) if(String(mods[j].id) === String(moduleId)) return courses[i].id;
      }
    }catch(e){}
    return "";
  }
  function bodyPage(){ try { return document.body && document.body.dataset ? document.body.dataset.page : ""; } catch(e){ return ""; } }
  function wantedCourses(){
    var params = new URLSearchParams(location.search || "");
    var page = bodyPage();
    var course = normId(params.get("course"));
    var moduleId = params.get("module") || params.get("id") || "";
    if(!course && moduleId) course = normId(courseFromModule(moduleId));
    if(course && bankFiles[course]) return [course];
    if(page === "mistakes") return Object.keys(bankFiles);
    if(page === "exam") return course && bankFiles[course] ? [course] : Object.keys(bankFiles);
    if(page === "practice") return Object.keys(bankFiles);
    return [];
  }
  function loadDataScript(path){
    var open = '<' + 'script src="data/' + path + '?v=' + VERSION + '">';
    var close = '<' + '/script>';
    document.write(open + close);
  }
  window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {byCourse:{}};
  window.MED_PRACTICE_BANK.byCourse = window.MED_PRACTICE_BANK.byCourse || {};
  window.MED_PRACTICE_BANK_LOADING = true;
  var wanted = wantedCourses();
  window.MED_PRACTICE_BANK_LAZY_WANTED = wanted.slice();
  for(var i=0; i<wanted.length; i++){
    var id = wanted[i], file = bankFiles[id];
    if(file && !(window.MED_PRACTICE_BANK.byCourse && window.MED_PRACTICE_BANK.byCourse[id])) loadDataScript(file);
  }
  if(wanted.length) loadDataScript("practice-bank-functional-fallback-v360.js");
  for(var k=0; k<wanted.length; k++){
    var patches = patchFiles[wanted[k]] || [];
    for(var j=0; j<patches.length; j++) loadDataScript(patches[j]);
  }
  window.MED_PRACTICE_BANK_LOADING = false;
  window.__MED_NYKUTO_PRACTICE_LOADER__ = "v364";
})();