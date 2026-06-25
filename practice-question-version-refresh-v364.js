/* v364 — Practice question-bank version refresh.
   Forces practice pages to rebuild old local question batches after bank/patch changes.
   This prevents very old cached questions from surviving after restoring newer patch files.
*/
(function(){
  'use strict';
  var VERSION = 'med-nykuto-practice-bank-v364-2026-06-25';
  var VERSION_KEY = 'medNykuto.practiceBankVersion';
  var DEBUG_KEY = '__MED_NYKUTO_BANK_REFRESH__';
  var MATCH = /(practice|qcm|quiz|case|cas|vf|vrai|faux|exam|currentBatch|currentIndex|answers|confidence|med[_-]?nykuto)/i;
  var KEEP = /(theme|appearance|accent|language|lang|auth|token|user|profile)/i;

  function storageList(storage){
    var out = [];
    if(!storage) return out;
    try{
      for(var i = 0; i < storage.length; i++){
        var k = storage.key(i);
        if(k) out.push(k);
      }
    }catch(e){}
    return out;
  }

  function removePracticeKeys(storage){
    var removed = [];
    storageList(storage).forEach(function(k){
      if(k === VERSION_KEY) return;
      if(KEEP.test(k)) return;
      if(MATCH.test(k)){
        try{ storage.removeItem(k); removed.push(k); }catch(e){}
      }
    });
    return removed;
  }

  function run(){
    var old = null;
    try{ old = window.localStorage && window.localStorage.getItem(VERSION_KEY); }catch(e){}
    if(old === VERSION){
      window[DEBUG_KEY] = {version:VERSION, refreshed:false, reason:'same-version'};
      return;
    }

    var removedLocal = [];
    var removedSession = [];
    try{ removedLocal = removePracticeKeys(window.localStorage); }catch(e){}
    try{ removedSession = removePracticeKeys(window.sessionStorage); }catch(e){}
    try{ window.localStorage && window.localStorage.setItem(VERSION_KEY, VERSION); }catch(e){}

    window[DEBUG_KEY] = {
      version: VERSION,
      previous: old,
      refreshed: true,
      removedLocal: removedLocal,
      removedSession: removedSession
    };
  }

  run();
})();
