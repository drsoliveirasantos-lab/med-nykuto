/* v331 — Fisiología quality patch, Módulo 1 Casos clínicos 046–050.
   Scope: replaces clinical cases 046–050 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.cases)) return;

  var COURSE = "fisiologia";
  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var MODULE_TITLE = "Neurofisiología y potencial de acción";
  var PATCH = "fisiologia-v331-m1-cases-046-050";

  function slug(x){return String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
  function moduleHits(arr){return arr.map(function(x,i){return {x:x,i:i};}).filter(function(o){return o.x&&o.x.moduleId===MODULE_ID;});}
  function replaceModuleIndex(arr,index,item){var hits=moduleHits(arr); if(!hits[index]) return false; var old=hits[index].x; var merged=Object.assign({},old,item); merged.id=old.id; merged.courseId=old.courseId||COURSE; merged.moduleId=old.moduleId||MODULE_ID; merged.moduleNumber=old.moduleNumber||1; merged.moduleTitle=old.moduleTitle||MODULE_TITLE; merged.qualityPatch=PATCH; merged.auditDecision="B"; arr[hits[index].i]=merged; return true;}
  function C(topic,difficulty,stem,question,options,answerIndex,explanation,whyWrong,keyPoints,skill,level,diff){return {auditDecision:"B",heading:topic,difficulty:difficulty,stem:stem,question:question,options:options,answerIndex:answerIndex,explanation:explanation,whyWrong:whyWrong,distractorExplanations:whyWrong,keyPoints:keyPoints,casePedagogicalStandard:"med_nykuto_v331_short_clinical_story",tags:{subject:COURSE,subjectLabel:"Fisiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"case",topic:topic,topicSlug:slug(topic),skill:skill||"clinical_reasoning",cognitiveLevel:level||"reasoning",difficulty:diff||"medium",adaptiveVersion:"v331",visible:false},tagList:["subject:fisiologia","module:1","format:case","standard:med_nykuto_v331","topic:"+slug(topic)]};}

  var items = [
    C("Síntesis de refractariedad","Examen",
      "En una prueba neurofisiológica, una fibra responde al primer estímulo con una espiga completa. Un segundo estímulo inmediato no genera respuesta, pero otro aplicado unos milisegundos después sí responde si es más intenso.",
      "¿Cuál interpretación integra mejor estos dos momentos?",
      ["Primero hay refractario absoluto por Na⁺ inactivado; luego refractario relativo con recuperación parcial y K⁺ aún elevado.","Primero hay conducción saltatoria por Ca²⁺; luego sinapsis eléctrica por salida de Cl⁻.","Primero hay potencial graduado decremental; luego desaparición irreversible de la membrana.","Primero actúa la bomba Na⁺/K⁺ como único canal; luego la mielina libera neurotransmisor."],0,
      "Correcta. La ausencia total de respuesta inmediata corresponde al refractario absoluto por canales de Na⁺ inactivados. Después, durante el refractario relativo, algunos canales ya se recuperaron, pero puede requerirse mayor estímulo por hiperpolarización residual.",
      [null,"Falsa. Mezcla Ca²⁺, Cl⁻ y sinapsis eléctrica sin relación con la secuencia refractaria descrita.","Falsa. El caso describe recuperación progresiva tras una espiga, no desaparición de membrana.","Falsa. La bomba mantiene gradientes y la mielina no libera neurotransmisor."],
      ["Absoluto = no dispara.","Relativo = dispara con estímulo mayor.","Na⁺ inactivado y K⁺ persistente explican la secuencia."],"clinical_reasoning","reasoning","hard"),

    C("Síntesis de potencial receptor","Medio",
      "Durante una exploración sensitiva, una presión débil produce una señal local pequeña en el receptor cutáneo. Una presión más fuerte aumenta esa señal hasta generar descargas repetidas en el axón sensitivo.",
      "¿Qué relación explica mejor la transición observada?",
      ["Un potencial receptor graduado puede alcanzar umbral y convertir intensidad en frecuencia de potenciales de acción.","Toda presión débil produce obligatoriamente una espiga de amplitud máxima.","La intensidad se codifica por aumentar sin límite la amplitud de cada potencial de acción.","La presión libera neurotransmisor desde la mielina antes de cualquier cambio de voltaje."],0,
      "Correcta. La transducción sensorial inicia con señales graduadas; si alcanzan umbral, aparecen potenciales de acción. La intensidad se expresa sobre todo por frecuencia de descarga y reclutamiento.",
      [null,"Falsa. Los estímulos débiles pueden producir señales subumbrales sin espiga.","Falsa. La espiga individual mantiene amplitud relativamente constante.","Falsa. La mielina no libera neurotransmisor ni es el evento inicial de presión."],
      ["Potencial receptor = graduado.","Umbral convierte señal local en PA.","Intensidad = frecuencia/reclutamiento."],"clinical_reasoning","application","medium"),

    C("Síntesis de lesión axonal","Examen",
      "Un paciente presenta enlentecimiento de la conducción por lesión de mielina y, además, un fármaco reduce la disponibilidad de canales de Na⁺. La señal llega peor al siguiente nodo y se regenera con dificultad.",
      "¿Cuál combinación explica mejor el déficit?",
      ["Más fuga internodal por desmielinización y menor regeneración nodal por menor disponibilidad de Na⁺.","Mayor liberación de neurotransmisor desde internodos y aumento de amplitud ilimitada de cada espiga.","Entrada de Cl⁻ como fase ascendente principal y bomba Na⁺/K⁺ como receptor postsináptico.","Conversión de la conducción nerviosa en transporte vesicular lento por cápsides."],0,
      "Correcta. La mielina conserva corriente entre nodos y los canales de Na⁺ nodales regeneran el PA. Si fallan ambos, la conducción se enlentece o bloquea.",
      [null,"Falsa. Los internodos no liberan neurotransmisor y la amplitud del PA no aumenta ilimitadamente.","Falsa. El Cl⁻ no es la fase ascendente clásica y la bomba no es receptor postsináptico.","Falsa. La conducción axonal no se convierte en transporte vesicular por cápsides."],
      ["Mielina = menos fuga.","Nodo/Na⁺ = regeneración.","Doble fallo = conducción lenta o bloqueada."],"clinical_reasoning","reasoning","hard"),

    C("Síntesis sináptica","Examen",
      "En una preparación experimental, el potencial de acción llega a la terminal presináptica, pero se bloquea la entrada de Ca²⁺. La célula postsináptica casi no muestra respuesta pese a que la conducción axonal previa fue normal.",
      "¿Qué conclusión es más precisa?",
      ["La conducción axonal puede estar intacta, pero la transmisión química falla si no entra Ca²⁺ presináptico.","Si el PA llega a la terminal, la exocitosis ocurre siempre aunque no entre Ca²⁺.","El Na⁺ presináptico reemplaza por completo al Ca²⁺ en la fusión vesicular.","La respuesta postsináptica depende únicamente de la mielina internodal."],0,
      "Correcta. La conducción axonal por Na⁺/K⁺ y la liberación química por Ca²⁺ presináptico son pasos distintos. Puede conservarse la primera y fallar la segunda.",
      [null,"Falsa. La entrada de Ca²⁺ es el disparador clásico de la fusión vesicular.","Falsa. El Na⁺ conduce la espiga, pero no sustituye al Ca²⁺ en la exocitosis.","Falsa. La mielina participa en conducción, no en la respuesta química postsináptica directa."],
      ["Na⁺/K⁺ = conducción.","Ca²⁺ presináptico = exocitosis.","Conducción y transmisión son pasos distintos."],"clinical_reasoning","reasoning","hard"),

    C("Caso final integrador","Examen",
      "Un profesor presenta una secuencia completa: reposo cercano a -70 mV, estímulo que alcanza umbral, espiga axonal, conducción saltatoria y respuesta postsináptica. Pide elegir la síntesis más útil para examen.",
      "¿Cuál opción resume mejor el Módulo 1?",
      ["Los gradientes iónicos y la permeabilidad selectiva permiten reposo, potencial de acción, propagación y sinapsis; Na⁺, K⁺ y Ca²⁺ cumplen funciones distintas.","La bomba Na⁺/K⁺ genera por sí sola todas las espigas, libera neurotransmisor y reemplaza a canales y receptores.","La mielina es la fuente principal de neurotransmisores y los nodos solo almacenan glucosa.","El potencial graduado y el potencial de acción son idénticos: ambos son todo o nada, no se suman y no se atenúan."],0,
      "Correcta. El módulo integra gradientes, membrana selectiva, canales, potenciales graduados, potencial de acción, mielina, nodos y sinapsis. Na⁺ despolariza, K⁺ repolariza y Ca²⁺ permite liberación química.",
      [null,"Falsa. La bomba mantiene gradientes; no reemplaza canales, receptores ni Ca²⁺ presináptico.","Falsa. La mielina aísla; los nodos regeneran la señal, no almacenan glucosa como función central.","Falsa. Los potenciales graduados son variables y sumables; el PA es todo o nada y regenerativo."],
      ["Gradientes + permeabilidad = excitabilidad.","Na⁺ sube; K⁺ baja; Ca²⁺ libera.","Graduado ≠ potencial de acción."],"clinical_reasoning","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.cases, 45+i, items[i]);

  ROOT.fisiologiaQualityPatchV331 = {applied:true,module:1,moduleId:MODULE_ID,block:"Casos clínicos 046-050",strategy:"replaceModuleIndex without increasing item counts",expectedChanged:5,notes:"Finishes Module 1 clinical cases with five integrative mini-stories focused on refractoriness, sensory transduction, conduction lesions, synaptic transmission and full-module synthesis."};
})();
