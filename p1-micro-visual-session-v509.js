(function () {
  'use strict';

  var scope = window.MedNykutoP1Scope;
  if (!scope || !scope.id) return;

  // Increment this value whenever the P1 practical-mycolology visual bank changes.
  // On first load of a new bank version, only an old visual-recognition session is
  // invalidated. Standard P1 sessions are preserved.
  var VISUAL_BANK_VERSION = 'p1-micro-practica-drive-2026-09-03-v2';
  var sessionKey = 'medNykuto:p1Exam:' + scope.id;
  var markerKey = 'medNykuto:p1VisualBankVersion:' + scope.id;

  try {
    var previousVersion = localStorage.getItem(markerKey);
    if (previousVersion === VISUAL_BANK_VERSION) return;

    var rawSession = localStorage.getItem(sessionKey);
    if (rawSession) {
      var savedSession = JSON.parse(rawSession);
      if (savedSession && savedSession.kind === 'visual-recognition') {
        localStorage.removeItem(sessionKey);
      }
    }

    localStorage.setItem(markerKey, VISUAL_BANK_VERSION);
  } catch (error) {
    // Storage can be unavailable in private/restricted contexts; the P1 page
    // remains usable and simply falls back to the current in-memory bank.
  }
})();
