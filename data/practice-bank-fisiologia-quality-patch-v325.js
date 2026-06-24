/* v325 — Fisiología quality patch, Módulo 1 Casos clínicos 001–015.
   Scope: replaces the first 15 clinical cases of Module 1 by module position.
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
  var PATCH = "fisiologia-v325-m1-cases-001-015";

  function slug(x){
    return String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  }
  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function replaceModuleIndex(arr, index, item){
    var hits = moduleHits(arr);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || COURSE;
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || MODULE_TITLE;
    merged.qualityPatch = PATCH;
    merged.auditDecision = "B";
    arr[hits[index].i] = merged;
    return true;
  }
  function C(topic,difficulty,stem,question,options,answerIndex,explanation,whyWrong,keyPoints,skill,level,diff){
    return {
      auditDecision:"B",
      heading:topic,
      difficulty:difficulty,
      stem:stem,
      question:question,
      options:options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:whyWrong,
      distractorExplanations:whyWrong,
      keyPoints:keyPoints,
      casePedagogicalStandard:"med_nykuto_v325_short_clinical_story",
      tags:{subject:COURSE,subjectLabel:"Fisiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"case",topic:topic,topicSlug:slug(topic),skill:skill||"clinical_reasoning",cognitiveLevel:level||"reasoning",difficulty:diff||"medium",adaptiveVersion:"v325",visible:false},
      tagList:["subject:fisiologia","module:1","format:case","standard:med_nykuto_v325","topic:"+slug(topic)]
    };
  }

  var items = [
    C("Estímulo subumbral","Medio",
      "Un estudiante recibe una estimulación eléctrica leve sobre una fibra nerviosa en un experimento de laboratorio. El voltaje local cambia, pero no alcanza el umbral aproximado de -55 mV y la señal se atenúa con la distancia.",
      "¿Qué fenómeno explica mejor lo observado?",
      ["Potencial graduado subumbral.","Potencial de acción completo.","Período refractario absoluto.","Liberación presináptica de neurotransmisor."],0,
      "Correcta. Un estímulo que no alcanza el umbral produce un cambio local de amplitud variable, que puede atenuarse y no genera una espiga todo o nada.",
      [null,"Falsa. El potencial de acción completo requiere alcanzar el umbral y se propaga de forma regenerativa.","Falsa. El refractario absoluto describe imposibilidad de disparo tras una espiga por canales de Na⁺ inactivados.","Falsa. La liberación de neurotransmisor exige llegada de la señal a la terminal y entrada de Ca²⁺."],
      ["Subumbral = potencial graduado.","Umbral ≈ -55 mV.","Graduado = local y decremental."],"clinical_reasoning","application","medium"),

    C("Ley del todo o nada","Medio",
      "En una práctica, se estimula una neurona con intensidades progresivamente mayores. A partir de cierta intensidad aparece una espiga completa, y al aumentar más el estímulo la espiga individual mantiene amplitud similar.",
      "¿Qué principio fisiológico se demuestra?",
      ["Ley del todo o nada del potencial de acción.","Saturación de receptores metabotrópicos.","Entrada de Cl⁻ como corriente excitadora principal.","Desaparición del gradiente electroquímico."],0,
      "Correcta. Una vez alcanzado el umbral, la espiga individual es completa y su amplitud es relativamente constante; la intensidad se codifica sobre todo por frecuencia.",
      [null,"Falsa. La saturación de receptores no explica la amplitud constante de la espiga axonal.","Falsa. El Cl⁻ suele estabilizar o inhibir, no generar la espiga neuronal clásica.","Falsa. Los gradientes no desaparecen durante una espiga normal."],
      ["PA = todo o nada.","Más estímulo no aumenta indefinidamente la amplitud.","Intensidad = frecuencia."],"clinical_reasoning","application","medium"),

    C("Bloqueo de canales de Na⁺","Examen",
      "Un paciente recibe anestesia local antes de suturar una herida. Minutos después, deja de percibir dolor en la zona, aunque el tejido sigue recibiendo estímulos mecánicos.",
      "¿Cuál mecanismo explica mejor la pérdida local de conducción nerviosa?",
      ["Disminución de la disponibilidad funcional de canales de Na⁺ dependientes de voltaje.","Aumento de la liberación de Ca²⁺ en la terminal presináptica.","Apertura permanente de receptores de Cl⁻ en el músculo cardíaco.","Estimulación directa de la bomba Na⁺/K⁺ como generadora de espigas."],0,
      "Correcta. Los anestésicos locales bloquean canales de Na⁺ y dificultan la fase ascendente del potencial de acción, impidiendo la propagación de la señal dolorosa.",
      [null,"Falsa. El Ca²⁺ presináptico participa en liberación de neurotransmisor, no es el blanco principal de anestesia local.","Falsa. La pregunta trata de conducción axonal periférica, no de receptores de Cl⁻ cardíacos.","Falsa. La bomba mantiene gradientes, pero no genera directamente la fase ascendente rápida."],
      ["Na⁺ = fase ascendente.","Bloqueo de Na⁺ = bloqueo de conducción.","Anestesia local = pérdida de señal dolorosa."],"clinical_reasoning","reasoning","hard"),

    C("Hiperpotasemia y reposo","Examen",
      "Un paciente con insuficiencia renal presenta hiperpotasemia. El profesor pregunta por qué el aumento de K⁺ extracelular puede modificar el potencial de reposo de células excitables.",
      "¿Cuál explicación es más correcta?",
      ["Disminuye el gradiente de salida de K⁺ y el potencial de reposo tiende a volverse menos negativo.","Aumenta la entrada de Cl⁻ y siempre lleva el potencial a +60 mV.","Transforma la bomba Na⁺/K⁺ en un canal de Ca²⁺.","Elimina instantáneamente todos los canales de Na⁺ dependientes de voltaje."],0,
      "Correcta. Al aumentar K⁺ fuera de la célula, se reduce la fuerza química para que K⁺ salga; el interior puede despolarizarse y cambiar la excitabilidad.",
      [null,"Falsa. El dato central es el gradiente de K⁺, no una entrada obligatoria de Cl⁻ hacia +60 mV.","Falsa. La bomba no cambia de identidad por hiperpotasemia.","Falsa. La hiperpotasemia no elimina instantáneamente canales de Na⁺."],
      ["K⁺ externo alto reduce salida.","Vm se vuelve menos negativo.","Cambios de K⁺ alteran excitabilidad."],"clinical_reasoning","reasoning","hard"),

    C("Refractario absoluto","Medio",
      "En un laboratorio, una fibra nerviosa acaba de disparar un potencial de acción. Un segundo estímulo muy intenso aplicado de inmediato no genera una nueva espiga.",
      "¿Qué estado explica mejor esta falta de respuesta?",
      ["Período refractario absoluto por inactivación de canales de Na⁺.","Potencial graduado excitador por entrada de Na⁺.","Conducción saltatoria por aumento de mielina.","Liberación de neurotransmisor por Ca²⁺ postsináptico."],0,
      "Correcta. Durante el refractario absoluto, los canales de Na⁺ están inactivados y no disponibles; por eso no se genera otra espiga aunque el estímulo sea intenso.",
      [null,"Falsa. Un potencial graduado excitador no explica imposibilidad absoluta de disparo.","Falsa. La mielina acelera conducción, no produce este estado transitorio de inexcitabilidad.","Falsa. La liberación química depende de Ca²⁺ presináptico, no postsináptico."],
      ["Absoluto = no dispara.","Na⁺ inactivado = no disponible.","Relativo = posible con estímulo mayor."],"clinical_reasoning","application","medium"),

    C("Refractario relativo","Medio",
      "Después de una espiga, una fibra nerviosa vuelve a responder solo si el estímulo aplicado es más fuerte que el habitual. La curva aún está cerca de una fase de hiperpolarización.",
      "¿Qué concepto identifica esta situación?",
      ["Período refractario relativo.","Potencial de equilibrio del Na⁺.","Sinapsis eléctrica directa.","Fase de reposo sin cambios de excitabilidad."],0,
      "Correcta. En el refractario relativo, algunos canales de Na⁺ ya se recuperaron, pero la salida persistente de K⁺ puede mantener la membrana más negativa y exigir mayor estímulo.",
      [null,"Falsa. E_Na es un voltaje de equilibrio, no un período de recuperación funcional.","Falsa. La sinapsis eléctrica no describe la recuperación tras una espiga axonal.","Falsa. La necesidad de un estímulo mayor indica que la excitabilidad aún no volvió completamente a reposo."],
      ["Relativo = posible con más estímulo.","K⁺ persistente hiperpolariza.","Na⁺ se recupera progresivamente."],"clinical_reasoning","application","medium"),

    C("Desmielinización","Examen",
      "Una paciente con enfermedad desmielinizante presenta debilidad intermitente y enlentecimiento de la conducción nerviosa. La lesión afecta internodos de fibras mielinizadas.",
      "¿Cuál mecanismo explica mejor el enlentecimiento?",
      ["Aumento de fuga de corriente y menor eficacia para despolarizar el siguiente nodo.","Mayor liberación de neurotransmisor desde la mielina dañada.","Conversión de la conducción saltatoria en transmisión por electrones metálicos.","Aumento automático del diámetro axonal por pérdida de mielina."],0,
      "Correcta. La mielina reduce la fuga de corriente; al perderse, la corriente local puede no alcanzar bien el siguiente nodo y la conducción se vuelve lenta o insegura.",
      [null,"Falsa. La mielina no libera neurotransmisor.","Falsa. La conducción nerviosa no se transforma en corriente metálica de electrones.","Falsa. La pérdida de mielina no aumenta automáticamente el diámetro axonal."],
      ["Mielina = aislamiento.","Desmielinización = fuga.","Nodo necesita despolarización suficiente."],"clinical_reasoning","reasoning","hard"),

    C("Nodo de Ranvier","Medio",
      "En un modelo experimental se conserva la mielina, pero se bloquean canales de Na⁺ en los nodos de Ranvier. La señal internodal llega débil y no se renueva adecuadamente.",
      "¿Qué función nodal se perdió?",
      ["Regeneración del potencial de acción por canales dependientes de voltaje.","Producción de ATP por la vaina de mielina.","Liberación de neurotransmisor hacia la hendidura sináptica.","Síntesis de receptores metabotrópicos nucleares."],0,
      "Correcta. En la conducción saltatoria, los nodos concentran canales dependientes de voltaje, especialmente de Na⁺, que regeneran la espiga.",
      [null,"Falsa. La producción de ATP no es la función nodal clave para regenerar la señal.","Falsa. La liberación de neurotransmisor ocurre en terminales presinápticas, no en nodos.","Falsa. Los receptores metabotrópicos no explican la regeneración nodal del PA."],
      ["Nodo = regeneración.","Na⁺ nodal = fase ascendente local.","Mielina aísla, no regenera."],"clinical_reasoning","application","medium"),

    C("Ca²⁺ presináptico","Examen",
      "Una toxina bloquea canales de Ca²⁺ en la terminal presináptica de una motoneurona. El potencial de acción llega al botón terminal, pero la respuesta muscular disminuye mucho.",
      "¿Qué paso se afecta directamente?",
      ["Fusión vesicular y liberación de neurotransmisor.","Fase ascendente del potencial de acción en el segmento inicial.","Salida de K⁺ durante la repolarización axonal.","Aislamiento eléctrico por mielina internodal."],0,
      "Correcta. La entrada de Ca²⁺ en la terminal presináptica desencadena la fusión de vesículas con la membrana y la liberación de neurotransmisor.",
      [null,"Falsa. La fase ascendente axonal depende de Na⁺, y el caso dice que el PA llega a la terminal.","Falsa. La salida de K⁺ repolariza el axón, pero no es el paso bloqueado por canales de Ca²⁺ terminales.","Falsa. La mielina no explica la exocitosis sináptica."],
      ["Ca²⁺ presináptico = exocitosis.","Na⁺ axonal = conducción.","PA llega, pero falla liberación."],"clinical_reasoning","reasoning","hard"),

    C("EPSP postsináptico","Medio",
      "Una interneurona libera un neurotransmisor que abre canales catiónicos en la membrana postsináptica. La célula receptora se despolariza de forma local y se acerca al umbral.",
      "¿Qué tipo de potencial se produjo?",
      ["Potencial postsináptico excitador.","Potencial postsináptico inhibidor por Cl⁻.","Período refractario absoluto.","Hiperpolarización por salida prolongada de K⁺."],0,
      "Correcta. La entrada neta de cargas positivas genera un EPSP: una despolarización graduada que aumenta la probabilidad de alcanzar el umbral.",
      [null,"Falsa. Un IPSP suele alejar o estabilizar frente al umbral, no acercar por despolarización catiónica.","Falsa. El refractario absoluto es un estado axonal tras un PA.","Falsa. La salida prolongada de K⁺ tiende a hiperpolarizar, no a despolarizar."],
      ["EPSP = despolarización local.","Acerca al umbral.","Es graduado y sumable."],"clinical_reasoning","application","medium"),

    C("IPSP postsináptico","Medio",
      "Una neurona recibe un neurotransmisor que aumenta la conductancia de Cl⁻. Aunque llegan pequeños estímulos excitadores, la membrana se mantiene menos propensa a alcanzar el umbral.",
      "¿Qué fenómeno explica este efecto?",
      ["Potencial postsináptico inhibidor o estabilización postsináptica.","Fase ascendente rápida por entrada de Na⁺.","Conducción saltatoria internodal.","Aumento de la amplitud individual del potencial de acción."],0,
      "Correcta. El aumento de conductancia de Cl⁻ suele estabilizar o hiperpolarizar funcionalmente la membrana, reduciendo la probabilidad de disparo.",
      [null,"Falsa. La entrada de Na⁺ produciría despolarización, no inhibición por Cl⁻.","Falsa. La conducción saltatoria ocurre en axones mielinizados, no en la membrana postsináptica del caso.","Falsa. El PA individual conserva amplitud relativamente constante."],
      ["IPSP = menor probabilidad de disparo.","Cl⁻ suele inhibir.","La suma neta decide el umbral."],"clinical_reasoning","application","medium"),

    C("Sumación espacial","Medio",
      "Una neurona recibe al mismo tiempo varios EPSP pequeños desde dendritas diferentes. Ninguno por separado alcanza el umbral, pero juntos disparan una espiga en el segmento inicial.",
      "¿Qué proceso explica el disparo?",
      ["Sumación espacial de potenciales graduados excitadores.","Refractario absoluto por inactivación de Na⁺.","Entrada presináptica de Ca²⁺ sin potencial de acción.","Desmielinización con aumento de fuga."],0,
      "Correcta. La sumación espacial integra señales excitadoras provenientes de regiones distintas; si la suma alcanza el umbral en el segmento inicial, se genera un PA.",
      [null,"Falsa. El refractario absoluto impediría una nueva espiga.","Falsa. La entrada de Ca²⁺ presináptico se relaciona con liberación, no con suma dendrítica de EPSP.","Falsa. La desmielinización dificulta la conducción y no explica la integración descrita."],
      ["Varias regiones = sumación espacial.","EPSP son graduados.","Segmento inicial decide."],"clinical_reasoning","application","medium"),

    C("Sumación temporal","Medio",
      "Una sinapsis excitadora se activa repetidamente en intervalos muy cortos. Los EPSP se superponen antes de disiparse y finalmente la neurona alcanza el umbral.",
      "¿Qué proceso se reconoce?",
      ["Sumación temporal de potenciales postsinápticos.","Conducción continua por axón no mielinizado.","Repolarización por entrada de Na⁺.","Liberación de neurotransmisor por mielina."],0,
      "Correcta. La sumación temporal ocurre cuando estímulos repetidos en la misma vía se superponen en el tiempo y aumentan la despolarización neta.",
      [null,"Falsa. La conducción continua describe propagación axonal, no superposición de EPSP.","Falsa. La repolarización se debe principalmente a salida de K⁺, no entrada de Na⁺.","Falsa. La mielina no libera neurotransmisor."],
      ["Misma sinapsis repetida = temporal.","Varias sinapsis simultáneas = espacial.","EPSP puede alcanzar umbral por suma."],"clinical_reasoning","application","medium"),

    C("Codificación por frecuencia","Medio",
      "Un receptor sensorial recibe un estímulo cada vez más intenso. La amplitud de cada potencial de acción se mantiene parecida, pero aumenta el número de espigas por segundo.",
      "¿Qué forma de codificación se ilustra?",
      ["Codificación de intensidad por frecuencia de descarga.","Codificación por crecimiento ilimitado de amplitud de cada espiga.","Ausencia de ley del todo o nada.","Conversión de potenciales de acción en potenciales graduados."],0,
      "Correcta. Los potenciales de acción individuales son todo o nada; la intensidad se comunica aumentando la frecuencia de disparo y, en otros contextos, el reclutamiento.",
      [null,"Falsa. La amplitud individual no crece sin límite.","Falsa. La amplitud constante respeta la ley del todo o nada.","Falsa. Aumentar frecuencia no convierte PA en potencial graduado."],
      ["Intensidad = frecuencia.","PA individual = amplitud estable.","Refractario limita frecuencia máxima."],"clinical_reasoning","application","medium"),

    C("Síntesis iónica clínica","Examen",
      "Durante una discusión clínica, un alumno confunde las fases de la espiga con la transmisión sináptica. Afirma que el Ca²⁺ genera la fase ascendente rápida y que el Na⁺ libera las vesículas presinápticas.",
      "¿Cuál corrección es la más precisa?",
      ["Na⁺ genera la fase ascendente axonal; Ca²⁺ presináptico desencadena liberación vesicular.","K⁺ genera la fase ascendente; Cl⁻ libera vesículas presinápticas.","La bomba Na⁺/K⁺ libera neurotransmisor directamente y reemplaza al Ca²⁺.","La mielina produce el pico positivo y el nodo secreta neurotransmisor."],0,
      "Correcta. El Na⁺ explica la despolarización rápida del PA neuronal clásico; el Ca²⁺ en la terminal presináptica desencadena la exocitosis de neurotransmisor.",
      [null,"Falsa. K⁺ participa sobre todo en repolarización/hiperpolarización, y Cl⁻ no desencadena exocitosis vesicular.","Falsa. La bomba mantiene gradientes; no reemplaza al Ca²⁺ en la liberación.","Falsa. Mielina y nodo participan en conducción, no en secreción sináptica como se plantea."],
      ["Na⁺ = ascenso axonal.","Ca²⁺ = exocitosis.","K⁺ = descenso/hiperpolarización."],"clinical_reasoning","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.cases, i, items[i]);

  ROOT.fisiologiaQualityPatchV325 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"Casos clínicos 001-015",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:15,
    notes:"Starts Module 1 clinical cases with 15 short clinical stories focused on threshold, channels, refractory periods, myelin, synapse and integration."
  };
})();
