/* v321 — Fisiología quality patch, Módulo 1 V/F 001–010.
   Scope: replaces the first 10 Verdadero/Falso items of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.vf)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v321-m1-vf-001-010";

  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function replaceModuleIndex(arr, index, item){
    var hits = moduleHits(arr);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    merged.auditDecision = item.auditDecision || "B";
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:1, format:"vf", visible:false, adaptiveVersion:"v321"});
    arr[hits[index].i] = merged;
    return true;
  }
  function VF(heading,difficulty,statement,isTrue,explanation,correctionIfFalse,keyPoints,topic,slug,skill,level,diff){
    return {
      auditDecision:"B",
      heading:heading,
      difficulty:difficulty,
      question:statement,
      statement:statement,
      options:["Verdadero","Falso"],
      answerIndex:isTrue ? 0 : 1,
      explanation:explanation,
      correctionIfFalse:correctionIfFalse || "",
      whyWrong:isTrue
        ? [null,"Falsa. La afirmación es verdadera según el mecanismo fisiológico descrito en el módulo."]
        : ["Falsa. La afirmación contiene una inversión o generalización que contradice el mecanismo del módulo.",null],
      distractorExplanations:isTrue
        ? [null,"Marcar Falso sería incorrecto porque la afirmación respeta el mecanismo fisiológico."]
        : ["Marcar Verdadero sería incorrecto porque la afirmación debe corregirse según el mecanismo indicado.",null],
      keyPoints:keyPoints,
      tags:{topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}
    };
  }

  var items = [
    VF("Electricidad biológica","Base","La señal eléctrica neuronal depende del movimiento selectivo de iones a través de canales de membrana, no de electrones circulando como en un cable metálico.",true,"Verdadero. La electricidad biológica es un cambio de potencial transmembrana producido por corrientes iónicas. La membrana separa cargas y los canales modifican la permeabilidad a Na⁺, K⁺, Ca²⁺ o Cl⁻.","",["Electricidad neuronal = corrientes iónicas.","No es conducción metálica por electrones.","Los canales regulan la permeabilidad."],"Electricidad biológica","vf_electricidad_ionica","concept","recall","basic"),

    VF("Potencial de reposo","Base","En una neurona típica en reposo, la membrana es más permeable al K⁺ que al Na⁺, por eso el potencial de membrana se aproxima a E_K.",true,"Verdadero. El reposo neuronal se explica principalmente por canales de fuga de K⁺. Como la permeabilidad al K⁺ domina, Vm se acerca al potencial de equilibrio del K⁺, aunque no sea exactamente igual.","",["Reposo ≈ -70 mV.","K⁺ de fuga domina.","Vm se aproxima a E_K."],"Potencial de reposo","vf_reposo_permeabilidad_k","mechanism","recall","basic"),

    VF("Bomba Na⁺/K⁺","Medio","La bomba Na⁺/K⁺ ATPasa genera directamente la fase ascendente rápida del potencial de acción en cada espiga neuronal.",false,"Falso. La bomba Na⁺/K⁺ ATPasa mantiene los gradientes iónicos a largo plazo, pero la fase ascendente rápida depende de la apertura de canales de Na⁺ dependientes de voltaje.","Corrección: la bomba mantiene gradientes; la fase ascendente rápida se debe a entrada de Na⁺ por canales voltaje-dependientes.",["Bomba = mantenimiento de gradientes.","Canales de Na⁺ = fase ascendente.","No atribuir la espiga directamente a la bomba."],"Bomba vs canal","vf_bomba_no_espiga","exam_trap","application","medium"),

    VF("Gradiente y permeabilidad","Medio","Un gradiente electroquímico puede existir aunque el flujo real del ion sea bajo si la membrana tiene poca permeabilidad a ese ion.",true,"Verdadero. El gradiente es la fuerza impulsora, mientras que la permeabilidad es la vía efectiva de paso. Sin canales abiertos o transportadores disponibles, el flujo puede ser bajo aunque exista un gradiente importante.","",["Gradiente empuja.","Permeabilidad permite.","Ambos conceptos no son sinónimos."],"Gradiente vs permeabilidad","vf_gradiente_sin_permeabilidad","mechanism","application","medium"),

    VF("Potencial graduado","Base","Un potencial graduado tiene amplitud variable, puede sumarse y suele atenuarse con la distancia.",true,"Verdadero. Los potenciales graduados son señales locales: su tamaño depende del estímulo, pueden sumarse en tiempo o espacio y se propagan de forma decremental.","",["Graduado = variable.","Graduado = sumable.","Graduado = decremental."],"Potencial graduado","vf_graduado_propiedades","definition","recall","basic"),

    VF("Potencial de acción","Medio","Un potencial de acción neuronal clásico aumenta mucho su amplitud individual cuando el estímulo suprumbral es más intenso.",false,"Falso. Una vez alcanzado el umbral, el potencial de acción individual sigue la ley del todo o nada y tiene amplitud relativamente constante. La intensidad se codifica sobre todo por frecuencia de descarga.","Corrección: un estímulo más intenso aumenta principalmente la frecuencia de potenciales de acción, no la amplitud de cada espiga individual.",["PA = todo o nada.","Amplitud individual relativamente constante.","Más intensidad = mayor frecuencia."],"Ley del todo o nada","vf_amplitud_no_aumenta","exam_trap","application","medium"),

    VF("Fases del potencial de acción","Base","La despolarización rápida del potencial de acción neuronal se debe principalmente a la entrada de Na⁺ por canales dependientes de voltaje.",true,"Verdadero. Al alcanzarse el umbral, se abren canales de Na⁺ dependientes de voltaje y el Na⁺ entra siguiendo su gradiente electroquímico, produciendo la fase ascendente rápida.","",["Umbral abre canales de Na⁺.","Na⁺ entra.","La curva asciende."],"Despolarización","vf_despolarizacion_na","mechanism","recall","basic"),

    VF("Repolarización","Base","La repolarización neuronal se explica principalmente por entrada sostenida de Na⁺ durante la fase descendente de la curva.",false,"Falso. La entrada de Na⁺ corresponde a la fase ascendente. La repolarización se debe sobre todo a la salida de K⁺ por canales dependientes de voltaje.","Corrección: Na⁺ entra durante la despolarización rápida; K⁺ sale durante la repolarización.",["Na⁺ sube la curva.","K⁺ baja la curva.","No invertir despolarización y repolarización."],"Repolarización","vf_repolarizacion_no_na","exam_trap","recall","basic"),

    VF("Refractario absoluto","Medio","Durante el período refractario absoluto, un estímulo más intenso puede generar un nuevo potencial de acción si supera suficientemente el umbral.",false,"Falso. En el período refractario absoluto no puede generarse un nuevo potencial de acción porque una proporción crítica de canales de Na⁺ está inactivada y no disponible.","Corrección: el estímulo más intenso puede ayudar en el refractario relativo, pero no en el absoluto.",["Absoluto = imposible disparar.","Relativo = posible con estímulo mayor.","Na⁺ inactivado explica el absoluto."],"Refractario absoluto","vf_absoluto_no_supera","exam_trap","application","medium"),

    VF("Sinapsis química","Medio","La entrada de Ca²⁺ en la terminal presináptica es un paso clave para la liberación de neurotransmisor en una sinapsis química.",true,"Verdadero. La llegada del potencial de acción a la terminal presináptica abre canales de Ca²⁺; el Ca²⁺ que entra favorece la fusión vesicular y la liberación de neurotransmisor.","",["Ca²⁺ presináptico = exocitosis.","Na⁺ axonal = conducción.","Neurotransmisor actúa en receptores postsinápticos."],"Sinapsis química","vf_calcio_liberacion","mechanism","application","medium")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.vf, i, items[i]);

  ROOT.fisiologiaQualityPatchV321 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"VF 001-010",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:10,
    notes:"Replaces the first 10 V/F items of Module 1 with clear, non-ambiguous statements and specific corrections."
  };
})();
