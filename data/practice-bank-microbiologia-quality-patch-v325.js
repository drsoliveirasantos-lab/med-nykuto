/* v325 — Microbiología Module 1 quality patch, clinical cases 049-050
   Safe replacement patch: replaces final module-indexed clinical cases, no count inflation.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["microbiologia"];
  if(!bank || !Array.isArray(bank.cases)) return;

  var COURSE="microbiologia";
  var MODULE_ID="02-microbiologia-01-estructura-bacteriana-y-patogenicidad";
  var MODULE_TITLE="Estructura bacteriana y patogenicidad";
  function pad(n){return String(n).padStart(3,"0");}
  function slug(x){return String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
  function base(topic,difficulty){return {courseId:COURSE,moduleId:MODULE_ID,moduleNumber:1,moduleTitle:MODULE_TITLE,heading:topic,difficulty:difficulty||"Examen",tags:{subject:COURSE,subjectLabel:"Microbiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"case",topic:topic,topicSlug:slug(topic),concepts:["estructura_bacteriana","patogenicidad_virulencia","integracion_clinica"],skill:"clinical_reasoning",cognitiveLevel:"reasoning",difficulty:difficulty==="Examen"?"hard":(difficulty==="Moyen"?"medium":"basic"),adaptiveVersion:"v325",visible:false}};}
  function caso(n,topic,difficulty,stem,question,options,answerIndex,explanation,whyWrong,keyPoints){return Object.assign(base(topic,difficulty),{id:MODULE_ID+"-case-"+pad(n)+"-v325",stem:stem,question:question,options:options,answerIndex:answerIndex,explanation:explanation,whyWrong:whyWrong,distractorExplanations:whyWrong,keyPoints:keyPoints||[],casePedagogicalStandard:"med_nykuto_v325_short_clinical_story",tagList:["subject:microbiologia","module:1","format:case","standard:med_nykuto_v325","topic:"+slug(topic)]});}
  function replaceModuleIndex(arr,index,item){var hits=arr.map(function(x,i){return {x:x,i:i};}).filter(function(o){return o.x&&o.x.moduleId===MODULE_ID;}); if(hits[index]) arr[hits[index].i]=Object.assign({},hits[index].x,item);}

  [
    caso(49,"Integración estructura-virulencia","Examen","Un paciente con catéter venoso central desarrolla fiebre y hemocultivos positivos. La bacteria procede de piel, se adhiere al dispositivo, forma biopelícula y luego invade la sangre.","¿Qué secuencia integra mejor la patogénesis del caso?",["Colonización cutánea, adhesión al dispositivo, biopelícula, invasión de sitio estéril y bacteriemia.","Esterilización cutánea, desaparición de biopelícula y colonización normal de la sangre.","Transformación de la bacteria en virus, cápside y transmisión por toxoide.","Tinción de Gram como mecanismo directo de invasión sanguínea."],0,"Correcta. El caso integra conceptos centrales del módulo: microbiota o colonización cutánea, adhesión por estructuras de superficie, biopelícula en dispositivo, entrada a sangre y relevancia de un sitio normalmente estéril.",[null,"Falsa. La sangre no tiene colonización normal y la biopelícula no desaparece como parte de la infección.","Falsa. Las bacterias no se transforman en virus y un toxoide no transmite bacterias.","Falsa. La tinción de Gram es diagnóstica; no produce invasión sanguínea."],["Dispositivo = puerta de entrada.","Biopelícula favorece persistencia.","Sangre = sitio estéril."],"clinical_reasoning"),
    caso(50,"Síntesis final de patogenicidad","Examen","Una bacteria causa enfermedad después de adherirse a mucosa, evadir fagocitosis con cápsula, captar hierro con sideróforos, producir toxinas y transmitirse por secreciones respiratorias. El huésped estaba inmunodeprimido.","¿Qué conclusión resume mejor la patogenicidad bacteriana?",["Es multifactorial: depende de factores bacterianos, defensas del huésped y vía de transmisión.","Se explica únicamente por el color final de la tinción de Gram.","Depende solo de la presencia de ribosomas 70S.","Siempre depende de una única toxina, sin influencia del huésped."],0,"Correcta. La enfermedad bacteriana resulta de una interacción compleja entre adhesión, evasión inmune, captación de nutrientes, daño por toxinas/enzimas, estado del huésped y transmisión.",[null,"Falsa. La tinción de Gram orienta estructura, pero no resume toda la patogenicidad.","Falsa. Los ribosomas 70S son un rasgo bacteriano, pero no explican virulencia, transmisión ni susceptibilidad del huésped.","Falsa. Muchas infecciones dependen de varios factores y del contexto del huésped."],["Patogenicidad = bacteria + huésped + transmisión.","Virulencia es multifactorial.","Integración final del módulo."],"integration")
  ].forEach(function(item,idx){ replaceModuleIndex(bank.cases, idx+48, item); });

  ROOT.version = (ROOT.version || "") + " | v325: Microbiología M1 cases 049-050 corrected; module 1 complete.";
  ROOT.__MICROBIOLOGIA_M1_CASES_049_050_PATCH__ = "v325";
})();
