/* v315 — Fisiología quality patch, Módulo 1 QCM 001–020.
   Scope: replaces the first 20 QCM of Module 1 by module position.
   Safe strategy: no new items are pushed; existing ids and metadata are preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v315-m1-qcm-001-020";

  function moduleHits(arr, moduleId){
    if(!Array.isArray(arr)) return [];
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === moduleId; });
  }
  function replaceModuleIndex(arr, moduleId, index, item){
    if(!Array.isArray(arr) || !item) return false;
    var hits = moduleHits(arr, moduleId);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || moduleId;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    merged.auditDecision = item.auditDecision || "B";
    if(old.tags || item.tags){
      merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {adaptiveVersion:"v315", visible:false});
    }
    arr[hits[index].i] = merged;
    return true;
  }
  function q(index, item){ replaceModuleIndex(bank.qcm, MODULE_ID, index, item); }
  function wrong(a,b,c,d){ return [a,b,c,d]; }

  q(0, {
    auditDecision:"B",
    heading:"Electricidad biológica",
    difficulty:"Base",
    question:"¿Cuál es el mecanismo inmediato que explica la señal eléctrica en una neurona?",
    options:[
      "El desplazamiento selectivo de iones a través de canales de membrana modifica el potencial transmembrana.",
      "La circulación de electrones a lo largo del axón genera una corriente similar a la de un cable metálico.",
      "La bomba Na⁺/K⁺ ATPasa produce directamente cada fase rápida del potencial de acción.",
      "La difusión de glucosa hacia el axón genera la despolarización rápida de la membrana."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La señal eléctrica neuronal depende de corrientes iónicas transmembrana. Al cambiar la permeabilidad de la membrana, Na⁺, K⁺, Ca²⁺ o Cl⁻ modifican el voltaje celular. No se trata de electrones moviéndose como en un cable metálico.",
    whyWrong:wrong(null,"Falsa. El axón no conduce como un cable metálico; el fenómeno clave es el movimiento de iones a través de la membrana.","Falsa. La bomba Na⁺/K⁺ mantiene los gradientes, pero no genera directamente la fase rápida del potencial de acción.","Falsa. La glucosa aporta energía metabólica, pero no es la corriente eléctrica inmediata de la despolarización."),
    distractorExplanations:wrong(null,"Confunde electricidad biológica con conducción metálica.","Confunde mantenimiento de gradientes con generación rápida de la espiga.","Confunde soporte energético con mecanismo eléctrico."),
    keyPoints:["La electricidad biológica es iónica.","La membrana separa cargas y los canales regulan la permeabilidad.","La bomba mantiene gradientes, no produce cada espiga."],
    tags:{topic:"Electricidad biológica",topicSlug:"electricidad_biologica",skill:"mechanism",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(1, {
    auditDecision:"C",
    heading:"Potencial de reposo",
    difficulty:"Medio",
    question:"En una neurona en reposo, ¿por qué el potencial de membrana se aproxima más al potencial de equilibrio del K⁺ que al del Na⁺?",
    options:[
      "Porque la membrana en reposo tiene mayor permeabilidad al K⁺ por canales de fuga.",
      "Porque el Na⁺ carece de gradiente electroquímico en condiciones fisiológicas.",
      "Porque la bomba Na⁺/K⁺ bloquea todos los canales de Na⁺ durante el reposo.",
      "Porque el Ca²⁺ intracelular determina de forma principal el potencial de reposo neuronal."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. En reposo predominan los canales de fuga de K⁺, por lo que el potencial de membrana se acerca a E_K. El valor final no es exactamente E_K porque también existe una pequeña permeabilidad a otros iones.",
    whyWrong:wrong(null,"Falsa. El Na⁺ sí tiene un fuerte gradiente electroquímico de entrada, pero su permeabilidad en reposo es menor.","Falsa. La bomba mantiene gradientes iónicos; no bloquea todos los canales de Na⁺.","Falsa. El Ca²⁺ es esencial en sinapsis y contracción, pero no es el determinante principal del reposo neuronal típico."),
    distractorExplanations:wrong(null,"Confunde gradiente con permeabilidad efectiva.","Atribuye a la bomba una función canalicular que no tiene.","Sobredimensiona el papel del Ca²⁺ en el reposo neuronal."),
    keyPoints:["Reposo neuronal típico ≈ -70 mV.","K⁺ domina por canales de fuga.","Vm se aproxima a E_K cuando la permeabilidad al K⁺ predomina."],
    tags:{topic:"Potencial de reposo",topicSlug:"potencial_reposo",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(2, {
    auditDecision:"C",
    heading:"Potencial graduado y potencial de acción",
    difficulty:"Medio",
    question:"¿Qué característica diferencia mejor un potencial graduado de un potencial de acción?",
    options:[
      "El potencial graduado tiene amplitud variable y puede sumarse; el potencial de acción sigue la ley del todo o nada.",
      "El potencial graduado se propaga sin atenuación; el potencial de acción se pierde rápidamente con la distancia.",
      "El potencial graduado depende exclusivamente de Ca²⁺; el potencial de acción depende exclusivamente de Cl⁻.",
      "El potencial graduado aparece solo en nodos de Ranvier; el potencial de acción aparece solo en dendritas."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El potencial graduado varía con la intensidad del estímulo, puede sumarse y se atenúa. El potencial de acción aparece completo cuando se alcanza el umbral y se regenera durante la propagación axonal.",
    whyWrong:wrong(null,"Falsa. Invierte los conceptos: el graduado se atenúa y el potencial de acción se regenera.","Falsa. No existen esos iones exclusivos para definir ambos fenómenos.","Falsa. Invierte las localizaciones típicas: los potenciales graduados predominan en dendritas y soma; el potencial de acción se inicia típicamente en el segmento inicial del axón."),
    distractorExplanations:wrong(null,"Confunde propagación pasiva con propagación regenerativa.","Reduce fenómenos complejos a iones exclusivos incorrectos.","Invierte la anatomía funcional neuronal."),
    keyPoints:["Potencial graduado: variable, sumable y decremental.","Potencial de acción: todo o nada y regenerativo.","El umbral decide si aparece el potencial de acción."],
    tags:{topic:"Potencial graduado vs potencial de acción",topicSlug:"graduado_vs_accion",skill:"comparison",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(3, {
    auditDecision:"B",
    heading:"Gradiente electroquímico",
    difficulty:"Base",
    question:"¿Qué significa que un ion se mueva según su gradiente electroquímico?",
    options:[
      "Que su movimiento depende de la combinación entre diferencia de concentración y fuerzas eléctricas.",
      "Que su movimiento depende solo de la cantidad total de ATP disponible en la célula.",
      "Que siempre se desplaza desde el interior hacia el exterior celular, sin importar su carga.",
      "Que atraviesa libremente la bicapa lipídica aunque no existan canales ni transportadores."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El gradiente electroquímico integra dos fuerzas: el gradiente químico, dado por la concentración, y el gradiente eléctrico, dado por la atracción o repulsión de cargas. El movimiento real del ion requiere además una vía de permeabilidad.",
    whyWrong:wrong(null,"Falsa. El ATP puede sostener transportes activos, pero no define por sí solo el gradiente electroquímico.","Falsa. El sentido de movimiento depende de concentración y carga, no siempre de dentro hacia fuera.","Falsa. Los iones no atraviesan libremente la bicapa; necesitan canales o transportadores."),
    distractorExplanations:wrong(null,"Confunde energía metabólica con fuerza electroquímica.","Ignora la influencia de la carga eléctrica.","Ignora la baja permeabilidad de la bicapa a iones."),
    keyPoints:["Gradiente químico = concentración.","Gradiente eléctrico = carga.","Permeabilidad permite que el gradiente se exprese."],
    tags:{topic:"Gradiente electroquímico",topicSlug:"gradiente_electroquimico",skill:"definition",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(4, {
    auditDecision:"B",
    heading:"Bomba Na⁺/K⁺ ATPasa",
    difficulty:"Medio",
    question:"¿Cuál es el papel principal de la bomba Na⁺/K⁺ ATPasa en una neurona excitable?",
    options:[
      "Mantener los gradientes de Na⁺ y K⁺ expulsando 3 Na⁺ e introduciendo 2 K⁺ con gasto de ATP.",
      "Abrir los canales de Na⁺ dependientes de voltaje durante la fase ascendente del potencial de acción.",
      "Generar directamente la hiperpolarización abriendo canales de K⁺ durante varios milisegundos.",
      "Liberar neurotransmisor en la terminal presináptica al permitir la entrada rápida de Ca²⁺."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La bomba Na⁺/K⁺ ATPasa conserva los gradientes iónicos que hacen posible la excitabilidad: saca 3 Na⁺ y entra 2 K⁺ por cada ATP. No es el canal responsable de la espiga rápida.",
    whyWrong:wrong(null,"Falsa. La apertura de canales de Na⁺ dependientes de voltaje depende del umbral, no de la bomba como canal.","Falsa. La hiperpolarización se relaciona con salida prolongada de K⁺ por canales, no con apertura directa por la bomba.","Falsa. La liberación de neurotransmisor depende de entrada de Ca²⁺ por canales voltaje-dependientes presinápticos."),
    distractorExplanations:wrong(null,"Confunde bomba con canal de Na⁺.","Confunde bomba con canal de K⁺.","Confunde mantenimiento de gradientes con sinapsis química."),
    keyPoints:["La bomba mantiene gradientes.","3 Na⁺ salen y 2 K⁺ entran.","La espiga depende de canales voltaje-dependientes."],
    tags:{topic:"Bomba Na/K ATPasa",topicSlug:"bomba_na_k",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(5, {
    auditDecision:"B",
    heading:"Umbral neuronal",
    difficulty:"Base",
    question:"¿Qué ocurre cuando el potencial de membrana alcanza el umbral en el segmento inicial del axón?",
    options:[
      "Se abren suficientes canales de Na⁺ dependientes de voltaje para iniciar un potencial de acción.",
      "Se cierran de forma permanente todos los canales de K⁺ y la neurona queda inexcitables.",
      "La bomba Na⁺/K⁺ se detiene y el potencial de acción se propaga por falta de ATP.",
      "El Ca²⁺ extracelular sale de la neurona y produce la despolarización rápida."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El umbral es el valor crítico a partir del cual la apertura de canales de Na⁺ dependientes de voltaje desencadena una retroalimentación positiva que genera el potencial de acción.",
    whyWrong:wrong(null,"Falsa. Los canales de K⁺ no se cierran permanentemente; participan después en la repolarización.","Falsa. La detención de la bomba no explica la propagación normal del potencial de acción.","Falsa. La despolarización rápida neuronal depende de entrada de Na⁺, no de salida de Ca²⁺."),
    distractorExplanations:wrong(null,"Inventa una inactivación permanente de canales de K⁺.","Confunde falla metabólica con excitabilidad normal.","Invierte el ion principal de la fase ascendente neuronal."),
    keyPoints:["Umbral neuronal típico: cerca de -55 mV.","El segmento inicial tiene alta densidad de canales de Na⁺.","El potencial de acción es todo o nada."],
    tags:{topic:"Umbral neuronal",topicSlug:"umbral",skill:"mechanism",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(6, {
    auditDecision:"B",
    heading:"Fases del potencial de acción",
    difficulty:"Base",
    question:"Durante la fase ascendente rápida del potencial de acción neuronal, ¿qué movimiento iónico predomina?",
    options:[
      "Entrada rápida de Na⁺ por canales dependientes de voltaje.",
      "Salida rápida de K⁺ por canales de fuga exclusivamente.",
      "Entrada de Cl⁻ que vuelve positivo el interior celular.",
      "Salida de Ca²⁺ desde el citoplasma hacia el espacio extracelular."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La fase ascendente o despolarización rápida del potencial de acción neuronal se debe a la entrada de Na⁺ a través de canales dependientes de voltaje.",
    whyWrong:wrong(null,"Falsa. La salida de K⁺ explica principalmente la repolarización, no la subida rápida.","Falsa. La entrada de Cl⁻ suele favorecer estabilización o inhibición, no positivar rápidamente el interior.","Falsa. El Ca²⁺ no sale para producir la fase ascendente neuronal típica."),
    distractorExplanations:wrong(null,"Invierte despolarización con repolarización.","Confunde efecto típico del Cl⁻ con excitación rápida.","Invierte sentido y función del Ca²⁺."),
    keyPoints:["Na⁺ entra = sube la curva.","K⁺ sale = baja la curva.","La fase ascendente depende de canales de Na⁺ voltaje-dependientes."],
    tags:{topic:"Despolarización",topicSlug:"despolarizacion",skill:"recall",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(7, {
    auditDecision:"B",
    heading:"Fases del potencial de acción",
    difficulty:"Base",
    question:"¿Qué movimiento iónico explica principalmente la repolarización del potencial de acción neuronal?",
    options:[
      "Salida de K⁺ por canales dependientes de voltaje que se abren más lentamente.",
      "Entrada sostenida de Na⁺ por canales de fuga durante toda la espiga.",
      "Entrada de Ca²⁺ por canales presinápticos en el soma neuronal.",
      "Salida de Cl⁻ que neutraliza el interior celular después del umbral."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La repolarización ocurre porque los canales de K⁺ dependientes de voltaje se abren de manera más lenta y permiten la salida de cargas positivas.",
    whyWrong:wrong(null,"Falsa. La entrada de Na⁺ explica la despolarización, y sus canales se inactivan en el pico.","Falsa. La entrada de Ca²⁺ presináptica se asocia a liberación de neurotransmisor, no a repolarización somática típica.","Falsa. El Cl⁻ no es el mecanismo principal de repolarización del potencial de acción neuronal clásico."),
    distractorExplanations:wrong(null,"Confunde fase ascendente con fase descendente.","Confunde sinapsis con repolarización axonal.","Asigna al Cl⁻ un papel principal que no corresponde."),
    keyPoints:["K⁺ sale durante la repolarización.","Los canales de K⁺ abren más lento que los de Na⁺.","La salida de cargas positivas vuelve negativo el interior."],
    tags:{topic:"Repolarización",topicSlug:"repolarizacion",skill:"recall",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(8, {
    auditDecision:"B",
    heading:"Hiperpolarización",
    difficulty:"Medio",
    question:"¿Por qué puede aparecer una hiperpolarización después de la repolarización neuronal?",
    options:[
      "Porque algunos canales de K⁺ permanecen abiertos y el K⁺ continúa saliendo transitoriamente.",
      "Porque los canales de Na⁺ se abren de nuevo y aumentan aún más la positividad intracelular.",
      "Porque la bomba Na⁺/K⁺ invierte su dirección y expulsa K⁺ hacia el exterior.",
      "Porque el Cl⁻ sale masivamente de la célula y arrastra cargas negativas al exterior."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La hiperpolarización aparece cuando la conductancia al K⁺ sigue elevada tras la repolarización, de modo que el potencial se acerca transitoriamente a E_K y queda más negativo que el reposo.",
    whyWrong:wrong(null,"Falsa. La reapertura de Na⁺ produciría despolarización, no hiperpolarización.","Falsa. La bomba no invierte su dirección fisiológica para generar la hiperpolarización.","Falsa. La salida masiva de Cl⁻ no es el mecanismo clásico de hiperpolarización pospotencial."),
    distractorExplanations:wrong(null,"Invierte el efecto del Na⁺.","Inventa una inversión de la bomba.","Atribuye al Cl⁻ el mecanismo que corresponde al K⁺."),
    keyPoints:["Hiperpolarización = K⁺ sigue saliendo.","El potencial se acerca a E_K.","No se debe a inversión de la bomba."],
    tags:{topic:"Hiperpolarización",topicSlug:"hiperpolarizacion",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(9, {
    auditDecision:"B",
    heading:"Canales de Na⁺",
    difficulty:"Medio",
    question:"¿Qué significa que un canal de Na⁺ dependiente de voltaje esté inactivado?",
    options:[
      "Que no puede conducir Na⁺ aunque la membrana esté despolarizada, hasta que se recupere con la repolarización.",
      "Que está cerrado pero disponible para abrirse inmediatamente ante cualquier estímulo subumbral.",
      "Que se transformó en un canal de K⁺ para permitir la fase descendente del potencial.",
      "Que mantiene una entrada constante de Na⁺ durante todo el período refractario absoluto."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La inactivación del canal de Na⁺ es un estado no disponible: el canal no conduce aunque la membrana esté despolarizada. La recuperación requiere repolarización.",
    whyWrong:wrong(null,"Falsa. Describe un canal cerrado disponible, no un canal inactivado.","Falsa. Un canal de Na⁺ no se transforma en canal de K⁺.","Falsa. Durante el refractario absoluto los canales de Na⁺ inactivados no permiten una nueva entrada funcional de Na⁺."),
    distractorExplanations:wrong(null,"Confunde cerrado disponible con inactivado no disponible.","Inventa un cambio de identidad del canal.","Invierte el concepto de refractario absoluto."),
    keyPoints:["Cerrado disponible ≠ inactivado.","Inactivado = no disponible.","La repolarización recupera canales de Na⁺."],
    tags:{topic:"Canales de Na",topicSlug:"canales_na",skill:"definition",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(10, {
    auditDecision:"B",
    heading:"Período refractario absoluto",
    difficulty:"Medio",
    question:"¿Por qué no puede generarse un segundo potencial de acción durante el período refractario absoluto?",
    options:[
      "Porque una proporción crítica de canales de Na⁺ está inactivada y no disponible para abrirse.",
      "Porque la bomba Na⁺/K⁺ consume todo el ATP y bloquea temporalmente la membrana.",
      "Porque los canales de K⁺ se cierran de forma irreversible después de la repolarización.",
      "Porque el axón pierde sus gradientes iónicos completos después de cada potencial de acción."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El refractario absoluto se debe a la inactivación de canales de Na⁺. Aunque el estímulo sea intenso, esos canales no están disponibles para iniciar otro potencial de acción hasta que la membrana repolarice.",
    whyWrong:wrong(null,"Falsa. No se debe al agotamiento completo de ATP por la bomba.","Falsa. Los canales de K⁺ no se cierran irreversiblemente.","Falsa. Un potencial de acción no agota por completo los gradientes iónicos; pequeños movimientos de iones modifican el voltaje."),
    distractorExplanations:wrong(null,"Confunde refractariedad con falla energética.","Inventa irreversibilidad canalicular.","Exagera los cambios de concentración durante una espiga."),
    keyPoints:["Refractario absoluto = canales de Na⁺ inactivados.","No se supera con estímulo más fuerte.","La repolarización permite recuperación."],
    tags:{topic:"Refractario absoluto",topicSlug:"refractario_absoluto",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(11, {
    auditDecision:"B",
    heading:"Período refractario relativo",
    difficulty:"Medio",
    question:"¿Qué caracteriza al período refractario relativo?",
    options:[
      "Puede generarse otro potencial de acción, pero se requiere un estímulo mayor porque la membrana está hiperpolarizada y algunos canales aún se recuperan.",
      "Es imposible generar otro potencial de acción, sin importar la intensidad del estímulo aplicado.",
      "Todos los canales de Na⁺ están abiertos de forma sostenida y la neurona no puede repolarizarse.",
      "La membrana queda exactamente en el potencial de reposo y responde igual que antes del primer estímulo."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. Durante el refractario relativo, parte de los canales de Na⁺ ya se recuperó, pero la conductancia al K⁺ puede seguir elevada y la membrana puede estar hiperpolarizada; por eso se necesita un estímulo más fuerte.",
    whyWrong:wrong(null,"Falsa. Eso describe el refractario absoluto, no el relativo.","Falsa. Los canales de Na⁺ no quedan todos abiertos de forma sostenida.","Falsa. Si respondiera igual que en reposo, no sería un período refractario relativo."),
    distractorExplanations:wrong(null,"Confunde relativo con absoluto.","Confunde apertura sostenida con recuperación canalicular.","Niega la hiperpolarización y la mayor exigencia de estímulo."),
    keyPoints:["Relativo = posible con estímulo mayor.","Se relaciona con hiperpolarización y recuperación incompleta.","Absoluto = imposible; relativo = difícil."],
    tags:{topic:"Refractario relativo",topicSlug:"refractario_relativo",skill:"comparison",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(12, {
    auditDecision:"B",
    heading:"Mielina",
    difficulty:"Base",
    question:"¿Cuál es el efecto principal de la mielina sobre la conducción del potencial de acción?",
    options:[
      "Aumenta la velocidad de conducción al aislar segmentos axonales y concentrar la regeneración en los nodos de Ranvier.",
      "Genera directamente el potencial de acción sin necesidad de canales de Na⁺ dependientes de voltaje.",
      "Disminuye la resistencia de membrana para que los iones salgan libremente por todo el axón.",
      "Impide la conducción saltatoria porque separa eléctricamente todos los nodos de Ranvier."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La mielina actúa como aislante y permite que la despolarización se propague rápidamente entre nodos. El potencial de acción se regenera principalmente en los nodos de Ranvier, donde hay alta densidad de canales de Na⁺.",
    whyWrong:wrong(null,"Falsa. La mielina acelera, pero no sustituye a los canales de Na⁺.","Falsa. La mielina aumenta el aislamiento y reduce pérdidas iónicas, no favorece salida libre por todo el axón.","Falsa. Precisamente permite la conducción saltatoria entre nodos."),
    distractorExplanations:wrong(null,"Confunde aceleración con generación directa.","Invierte el papel aislante de la mielina.","Niega la conducción saltatoria."),
    keyPoints:["Mielina = aislamiento.","Nodos de Ranvier = regeneración del potencial.","Conducción saltatoria = más rápida."],
    tags:{topic:"Mielina",topicSlug:"mielina",skill:"mechanism",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(13, {
    auditDecision:"B",
    heading:"Conducción saltatoria",
    difficulty:"Medio",
    question:"En la conducción saltatoria, ¿dónde se regenera principalmente el potencial de acción?",
    options:[
      "En los nodos de Ranvier, por su alta densidad de canales de Na⁺ dependientes de voltaje.",
      "En todos los segmentos cubiertos por mielina, porque allí la membrana es más permeable al Na⁺.",
      "En el núcleo neuronal, porque allí se sintetizan los neurotransmisores.",
      "En la terminal presináptica únicamente, cuando entra Ca²⁺ para liberar neurotransmisor."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. En axones mielinizados, la corriente se desplaza rápidamente bajo la mielina y el potencial de acción se regenera en los nodos de Ranvier, donde se concentran canales de Na⁺ dependientes de voltaje.",
    whyWrong:wrong(null,"Falsa. Los segmentos mielinizados están aislados y tienen menor intercambio iónico transmembrana.","Falsa. El núcleo participa en funciones celulares, pero no es el sitio de regeneración axonal del potencial de acción.","Falsa. La terminal presináptica usa Ca²⁺ para exocitosis, pero la conducción axonal se regenera en nodos."),
    distractorExplanations:wrong(null,"Invierte el papel de los internodos mielinizados.","Confunde función nuclear con conducción axonal.","Confunde conducción axonal con transmisión sináptica."),
    keyPoints:["Nodo de Ranvier = alta densidad de Na⁺.","Internodo mielinizado = conducción rápida pasiva.","Saltatoria no significa que la señal desaparece entre nodos."],
    tags:{topic:"Conducción saltatoria",topicSlug:"conduccion_saltatoria",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(14, {
    auditDecision:"B",
    heading:"Sinapsis química",
    difficulty:"Medio",
    question:"En una sinapsis química, ¿qué evento presináptico desencadena la liberación de neurotransmisor?",
    options:[
      "La entrada de Ca²⁺ por canales dependientes de voltaje en la terminal presináptica.",
      "La salida de Na⁺ desde la vesícula sináptica hacia el espacio extracelular.",
      "La entrada de K⁺ por canales de fuga en el soma postsináptico.",
      "La activación directa de la bomba Na⁺/K⁺ como mecanismo de exocitosis vesicular."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La llegada del potencial de acción a la terminal presináptica abre canales de Ca²⁺ dependientes de voltaje. El Ca²⁺ que entra favorece la fusión vesicular y la liberación de neurotransmisor.",
    whyWrong:wrong(null,"Falsa. El Na⁺ participa en la conducción axonal, pero la exocitosis sináptica depende de Ca²⁺.","Falsa. El K⁺ postsináptico no desencadena la liberación presináptica de neurotransmisor.","Falsa. La bomba mantiene gradientes; no es el mecanismo directo de fusión vesicular."),
    distractorExplanations:wrong(null,"Confunde Na⁺ axonal con Ca²⁺ presináptico.","Confunde lado postsináptico con evento presináptico.","Confunde transporte activo con exocitosis sináptica."),
    keyPoints:["Na⁺ conduce el potencial por el axón.","Ca²⁺ presináptico libera neurotransmisor.","Sinapsis química requiere exocitosis vesicular."],
    tags:{topic:"Sinapsis y Ca",topicSlug:"sinapsis_ca",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(15, {
    auditDecision:"B",
    heading:"Neurotransmisores",
    difficulty:"Base",
    question:"Después de liberarse en la hendidura sináptica, ¿cómo actúa típicamente un neurotransmisor químico?",
    options:[
      "Se une a receptores postsinápticos y modifica la probabilidad de respuesta de la célula postsináptica.",
      "Entra al núcleo de la neurona presináptica para activar la transcripción de canales de Na⁺.",
      "Sustituye al potencial de acción y viaja por el axón como una señal eléctrica continua.",
      "Abre directamente la bomba Na⁺/K⁺ para que esta libere vesículas sinápticas."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El neurotransmisor liberado se une a receptores postsinápticos, que pueden ser ionotrópicos o metabotrópicos, y modifica la excitabilidad de la célula postsináptica.",
    whyWrong:wrong(null,"Falsa. La acción típica inmediata ocurre sobre receptores postsinápticos, no en el núcleo presináptico.","Falsa. El neurotransmisor no sustituye al potencial de acción axonal; participa en la transmisión entre células.","Falsa. La bomba Na⁺/K⁺ no es el receptor ni el mecanismo directo de liberación vesicular."),
    distractorExplanations:wrong(null,"Confunde señal sináptica con regulación nuclear.","Confunde conducción axonal con transmisión sináptica.","Confunde receptor postsináptico con bomba iónica."),
    keyPoints:["Neurotransmisor = señal química intercelular.","Actúa sobre receptores postsinápticos.","Puede excitar o inhibir según receptor y canal asociado."],
    tags:{topic:"Neurotransmisores",topicSlug:"neurotransmisores",skill:"definition",cognitiveLevel:"recall",difficulty:"basic"}
  });

  q(16, {
    auditDecision:"B",
    heading:"Codificación de la información nerviosa",
    difficulty:"Medio",
    question:"Si un estímulo aumenta de intensidad por encima del umbral, ¿cómo suele codificarse esa mayor intensidad en una neurona?",
    options:[
      "Por aumento de la frecuencia de potenciales de acción, no por aumento proporcional de la amplitud de cada espiga.",
      "Por incremento progresivo de la amplitud de cada potencial de acción individual.",
      "Por conversión de los potenciales de acción en potenciales graduados durante la propagación axonal.",
      "Por desaparición del período refractario absoluto para permitir espigas simultáneas."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. El potencial de acción individual sigue la ley del todo o nada y tiene amplitud relativamente constante. Una mayor intensidad suele codificarse aumentando la frecuencia de descarga y el reclutamiento de unidades.",
    whyWrong:wrong(null,"Falsa. La amplitud de una espiga individual no aumenta proporcionalmente con la intensidad si ya se alcanzó el umbral.","Falsa. El potencial de acción se regenera; no se convierte en graduado durante la propagación axonal normal.","Falsa. El refractario absoluto no desaparece; limita la frecuencia máxima de disparo."),
    distractorExplanations:wrong(null,"Confunde intensidad del estímulo con amplitud de la espiga.","Invierte potencial graduado y potencial de acción.","Ignora la función limitante del refractario absoluto."),
    keyPoints:["Potencial de acción = amplitud relativamente constante.","Más intensidad = mayor frecuencia de descarga.","El refractario limita la frecuencia máxima."],
    tags:{topic:"Codificación nerviosa",topicSlug:"codificacion_nerviosa",skill:"mechanism",cognitiveLevel:"application",difficulty:"medium"}
  });

  q(17, {
    auditDecision:"B",
    heading:"Espiga y meseta",
    difficulty:"Difícil",
    question:"¿Qué diferencia fisiológica explica que algunos tejidos excitables presenten una meseta en lugar de una espiga breve clásica?",
    options:[
      "La participación sostenida de corrientes de Ca²⁺ puede prolongar la despolarización en ciertos tejidos, como el músculo cardíaco.",
      "La ausencia completa de canales de Na⁺ hace que todos los tejidos excitables dependan solo de Cl⁻.",
      "La bomba Na⁺/K⁺ se detiene durante varios segundos y mantiene la membrana en +30 mV.",
      "La mielina transforma cualquier potencial neuronal breve en una meseta prolongada."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. En algunos tejidos excitables, especialmente el músculo cardíaco, corrientes de Ca²⁺ sostenidas contribuyen a una fase de meseta y prolongan el potencial de acción frente a la espiga neuronal breve.",
    whyWrong:wrong(null,"Falsa. No todos los tejidos excitables dependen solo de Cl⁻ ni carecen por completo de canales de Na⁺.","Falsa. La meseta no se explica por detención de la bomba Na⁺/K⁺.","Falsa. La mielina acelera la conducción axonal, no convierte espigas en mesetas."),
    distractorExplanations:wrong(null,"Generalización falsa de los canales iónicos.","Confunde mantenimiento de gradientes con forma del potencial.","Confunde mielina con fisiología de la meseta."),
    keyPoints:["Espiga neuronal = breve.","Meseta cardíaca = participación sostenida de Ca²⁺.","No aplicar una curva única a todos los tejidos excitables."],
    tags:{topic:"Espiga y meseta",topicSlug:"espiga_meseta",skill:"comparison",cognitiveLevel:"reasoning",difficulty:"hard"}
  });

  q(18, {
    auditDecision:"B",
    heading:"Errores de examen",
    difficulty:"Examen",
    question:"En una pregunta de examen, un estudiante afirma que la despolarización rápida neuronal se debe a salida de K⁺. ¿Cuál es la corrección fisiológica adecuada?",
    options:[
      "La despolarización rápida se debe a entrada de Na⁺; la salida de K⁺ explica principalmente la repolarización.",
      "La afirmación es correcta porque el K⁺ siempre inicia la fase ascendente de la curva neuronal.",
      "La despolarización rápida se debe a salida de Cl⁻ y la repolarización a entrada de glucosa.",
      "La fase ascendente depende de la bomba Na⁺/K⁺ y no de canales iónicos."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. Es una trampa clásica: Na⁺ entra durante la despolarización rápida; K⁺ sale durante la repolarización y puede contribuir a la hiperpolarización.",
    whyWrong:wrong(null,"Falsa. El K⁺ no inicia la fase ascendente rápida del potencial neuronal clásico.","Falsa. Ni la salida de Cl⁻ ni la entrada de glucosa explican esas fases.","Falsa. La fase ascendente depende de canales de Na⁺ dependientes de voltaje, no directamente de la bomba."),
    distractorExplanations:wrong(null,"Mantiene la inversión Na⁺/K⁺.","Introduce iones y sustratos que no corresponden.","Confunde bomba con canales de la espiga."),
    keyPoints:["Despolarización rápida = Na⁺ entra.","Repolarización = K⁺ sale.","La bomba conserva gradientes, no dibuja la espiga."],
    tags:{topic:"Trampa Na/K",topicSlug:"trampa_na_k",skill:"exam_trap",cognitiveLevel:"reasoning",difficulty:"hard"}
  });

  q(19, {
    auditDecision:"B",
    heading:"Algoritmo de examen",
    difficulty:"Examen",
    question:"Un enunciado describe una señal local, de amplitud variable, que puede sumarse y se atenúa con la distancia. ¿Qué tipo de señal corresponde?",
    options:[
      "Potencial graduado.",
      "Potencial de acción axonal clásico.",
      "Período refractario absoluto.",
      "Conducción saltatoria en un nodo de Ranvier."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. Una señal local, variable, sumable y decremental corresponde a un potencial graduado. El potencial de acción es todo o nada y se regenera durante la propagación.",
    whyWrong:wrong(null,"Falsa. El potencial de acción no es una señal local decremental ni de amplitud variable.","Falsa. El refractario absoluto es un período de inexcitabilidad por inactivación de canales de Na⁺, no una señal sumable.","Falsa. La conducción saltatoria describe propagación en axón mielinizado, no una señal local sumable."),
    distractorExplanations:wrong(null,"Confunde propiedades del potencial de acción con las del graduado.","Confunde estado refractario con tipo de señal.","Confunde modo de propagación con señal local."),
    keyPoints:["Local + variable + sumable + se atenúa = potencial graduado.","Todo o nada + regenerativo = potencial de acción.","Identificar palabras clave evita errores rápidos."],
    tags:{topic:"Algoritmo de examen",topicSlug:"algoritmo_examen",skill:"pattern_recognition",cognitiveLevel:"reasoning",difficulty:"hard"}
  });

  ROOT.fisiologiaQualityPatchV315 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 001-020",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:20,
    notes:"Replaces the first 20 QCM of Module 1 with non-repetitive, homogeneous, exam-oriented items in clear medical Spanish."
  };
})();
