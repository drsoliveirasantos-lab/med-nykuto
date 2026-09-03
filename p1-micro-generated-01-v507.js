(function(){
  'use strict';

  var PRACTICE_ID='microbiologia-practica-2026-08-27';
  var scope=window.MedNykutoP1Scope;
  var shouldReload=false;

  if(scope&&scope.id){
    var visualBankVersion='p1-micro-practica-drive-2026-09-03-v3';
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

  // P1 practical mycology follows the naming used in the teacher's material.
  // Example: "Rhizopus spp." is displayed as "Rhizopus"; precise species
  // explicitly used in class (e.g. Aspergillus fumigatus) remain unchanged.
  function courseLabel(value){
    if(typeof value!=='string') return value;
    return value.replace(/\s+spp\.?/gi,'').replace(/\s{2,}/g,' ').trim();
  }

  function normalizeVisualQuestion(question){
    if(!question||typeof question!=='object'||!question.visualRecognitionId) return question;
    question.prompt=courseLabel(question.prompt);
    if(Array.isArray(question.options)) question.options=question.options.map(courseLabel);
    question.explanation=courseLabel(question.explanation);
    if(Array.isArray(question.visualClues)) question.visualClues=question.visualClues.map(courseLabel);
    if(Array.isArray(question.whyWrong)) question.whyWrong=question.whyWrong.map(courseLabel);
    if(Array.isArray(question.distractorExplanations)) question.distractorExplanations=question.distractorExplanations.map(courseLabel);
    return question;
  }

  function installCourseNomenclature(){
    var practice=window.MedNykutoClassPractice;
    var bank=practice&&practice.banks&&practice.banks[PRACTICE_ID];
    if(!bank||!Array.isArray(bank.qcm)||bank.__courseNomenclatureV3) return;

    var current;
    function installArray(array){
      if(!Array.isArray(array)) return array;
      for(var i=0;i<array.length;i++) normalizeVisualQuestion(array[i]);
      if(!array.__courseNamesPushV3){
        Object.defineProperty(array,'__courseNamesPushV3',{value:true,configurable:true});
        Object.defineProperty(array,'push',{
          configurable:true,
          writable:true,
          value:function(){
            var items=Array.prototype.slice.call(arguments).map(normalizeVisualQuestion);
            return Array.prototype.push.apply(this,items);
          }
        });
      }
      return array;
    }

    current=installArray(bank.qcm);
    Object.defineProperty(bank,'qcm',{
      configurable:true,
      enumerable:true,
      get:function(){return current;},
      set:function(value){current=installArray(value);}
    });
    Object.defineProperty(bank,'__courseNomenclatureV3',{value:true,configurable:true});
  }

  installCourseNomenclature();

  window.MedNykutoVisual50Generated=window.MedNykutoVisual50Generated||[];
  function r(id,prompt,options,answer,explanation,imageSrc,clues,sourceLabel,angleLabel){
    return {prompt:prompt,options:options,answer:answer,explanation:explanation,imageSrc:imageSrc,imageAlt:'Imagen fúngica para reconocimiento visual',visualRecognitionId:id,visualClues:clues.concat(['Fuente: '+sourceLabel+'.']),validationPending:false,teacherAngle:'ampliacion-visual-50',teacherAngleLabel:angleLabel};
  }
  window.MedNykutoVisual50Generated.push(r(
    'micro-p1-gen-cryptococcus-v2',
    'Se observan levaduras redondas rodeadas por un halo capsular evidente. ¿Qué agente de los diaporamas prácticos corresponde mejor?',
    ['Cryptococcus neoformans','Candida albicans','Malassezia','Trichophyton rubrum'],
    0,
    'La cápsula polisacárida visible como halo alrededor de levaduras redondas orienta a Cryptococcus neoformans, patrón trabajado en el práctico de micosis oportunistas.',
    'https://wwwn.cdc.gov/phil///PHIL_Images/24004/24004_lores.jpg',
    ['Levadura redonda u ovoide.','Halo capsular evidente.','Gemación de base estrecha como pista de Cryptococcus.'],
    'CDC PHIL #24004 · referencia visual compatible con el práctico',
    'AMPLIACIÓN VISUAL · PRÁCTICA'
  ));
})();