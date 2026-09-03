(function(){
  'use strict';

  var scope=window.MedNykutoP1Scope;
  var shouldReload=false;
  if(scope&&scope.id){
    var visualBankVersion='p1-micro-practica-drive-2026-09-03-v2';
    var sessionKey='medNykuto:p1Exam:'+scope.id;
    var markerKey='medNykuto:p1VisualBankVersion:'+scope.id;
    try{
      if(localStorage.getItem(markerKey)!==visualBankVersion){
        var rawSession=localStorage.getItem(sessionKey);
        if(rawSession){
          try{
            var savedSession=JSON.parse(rawSession);
            if(savedSession&&savedSession.kind==='visual-recognition'){
              localStorage.removeItem(sessionKey);
              shouldReload=true;
            }
          }catch(parseError){
            localStorage.removeItem(sessionKey);
          }
        }
        localStorage.setItem(markerKey,visualBankVersion);
      }
    }catch(storageError){
      // Storage can be unavailable in private/restricted contexts.
    }
  }

  if(shouldReload){
    window.location.replace(window.location.href);
    return;
  }

  window.MedNykutoVisual50Generated=window.MedNykutoVisual50Generated||[];
  function r(id,prompt,options,answer,explanation,imageSrc,clues,sourceLabel,angleLabel){
    return {prompt:prompt,options:options,answer:answer,explanation:explanation,imageSrc:imageSrc,imageAlt:'Imagen fúngica para reconocimiento visual',visualRecognitionId:id,visualClues:clues.concat(['Fuente: '+sourceLabel+'.']),validationPending:false,teacherAngle:'ampliacion-visual-50',teacherAngleLabel:angleLabel};
  }
  window.MedNykutoVisual50Generated.push(r(
    'micro-p1-gen-cryptococcus-v2',
    'Se observan levaduras redondas rodeadas por un halo capsular evidente. ¿Qué agente de los diaporamas prácticos corresponde mejor?',
    ['Cryptococcus neoformans','Candida albicans','Malassezia spp.','Trichophyton rubrum'],
    0,
    'La cápsula polisacárida visible como halo alrededor de levaduras redondas orienta a Cryptococcus neoformans, patrón trabajado en el práctico de micosis oportunistas.',
    'https://wwwn.cdc.gov/phil///PHIL_Images/24004/24004_lores.jpg',
    ['Levadura redonda u ovoide.','Halo capsular evidente.','Gemación de base estrecha como pista de Cryptococcus.'],
    'CDC PHIL #24004 · referencia visual compatible con el práctico',
    'AMPLIACIÓN VISUAL · PRÁCTICA'
  ));
})();