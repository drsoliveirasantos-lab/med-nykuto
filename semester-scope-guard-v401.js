/* v401 — Keeps semester 4 and 5 students out of the legacy semester 3 library. */
(function(){
  'use strict';

  window.__MED_NYKUTO_SEMESTER_SCOPE_GUARD__ = 'v401';

  var semester = '';
  try{
    semester = localStorage.getItem('medNykuto:studentSemester') || '';
  }catch(error){}

  if(semester !== 's4' && semester !== 's5') return;

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var isLegacyLibrary = /^(matieres|matiere|modules|module|qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(page);
  if(!isLegacyLibrary) return;

  location.replace(semester === 's4'
    ? 'clase.html'
    : 'index.html?semestre=s5&contenido=proximamente');
})();
