/* v323 — Fisiología quality patch, Módulo 1 V/F 011–030.
   Scope: replaces V/F 011–030 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.vf)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v323-m1-vf-011-030";

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
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:1, format:"vf", visible:false, adaptiveVersion:"v323"});
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
      whyWrong:isTrue ? [null,"Falsa. La afirmación es verdadera y respeta el mecanismo fisiológico del módulo."] : ["Falsa. La afirmación debe corregirse porque contradice el mecanismo fisiológico del módulo.",null],
      distractorExplanations:isTrue ? [null,"Marcar Falso sería incorrecto porque el enunciado es fisiológicamente correcto."] : ["Marcar Verdadero sería incorrecto porque la afirmación contiene una inversión conceptual.",null],
      keyPoints:keyPoints,
      tags:{topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}
    };
  }

  var items = [
    VF("Mielina","Base","La mielina aumenta la velocidad de conducción porque reduce la fuga de corriente en los internodos y favorece la conducción saltatoria.",true,"Verdadero. La mielina actúa como aislante eléctrico, aumenta la resistencia de membrana internodal y permite que la despolarización alcance con mayor eficacia el siguiente nodo de Ranvier.","",["Mielina = aislamiento.","Menos fuga internodal.","Conducción saltatoria más rápida."],"Mielina","vf_mielina_velocidad","mechanism","recall","basic"),

    VF("Nodo de Ranvier","Base","Los nodos de Ranvier son regiones donde el potencial de acción se regenera gracias a alta densidad de canales dependientes de voltaje.",true,"Verdadero. En fibras mielinizadas, los internodos están aislados y los nodos concentran canales que regeneran la espiga, especialmente canales de Na⁺ dependientes de voltaje.","",["Nodo = regeneración.","Canales de Na⁺ nodales.","Mielina no reemplaza los canales."],"Nodos de Ranvier","vf_nodo_regenera","mechanism","recall","basic"),

    VF("Mielina y sinapsis","Medio","La mielina libera neurotransmisor en cada internodo para permitir que el potencial de acción avance de nodo a nodo.",false,"Falso. La mielina no libera neurotransmisor. Su función principal es aislar el internodo; la señal se regenera en los nodos mediante canales iónicos.","Corrección: la mielina aísla y los nodos regeneran el potencial de acción; la liberación de neurotransmisor ocurre en terminales presinápticas.",["Mielina = aislante.","Nodo = regeneración.","Neurotransmisor = terminal sináptica."],"Mielina no sináptica","vf_mielina_no_libera","exam_trap","application","medium"),

    VF("Canal de Na⁺","Medio","Un canal de Na⁺ inactivado está temporalmente no disponible para abrirse, aunque la membrana esté despolarizada.",true,"Verdadero. La inactivación es un estado diferente del estado cerrado disponible. Un canal inactivado debe recuperarse antes de poder participar en otra espiga.","",["Inactivado = no disponible.","Cerrado disponible puede abrirse.","Inactivación explica refractario."],"Estado de canal de Na⁺","vf_na_inactivado","mechanism","application","medium"),

    VF("Canal cerrado vs inactivado","Medio","Un canal de Na⁺ cerrado disponible y un canal de Na⁺ inactivado son equivalentes porque ambos conducen Na⁺ con la misma facilidad.",false,"Falso. Un canal cerrado disponible no conduce, pero puede abrirse si llega el estímulo adecuado. Un canal inactivado tampoco conduce y además no está disponible hasta recuperarse.","Corrección: cerrado disponible significa listo para abrirse; inactivado significa temporalmente no disponible.",["Cerrado disponible ≠ inactivado.","Inactivado no responde de inmediato.","La recuperación permite nueva espiga."],"Estados del canal de Na⁺","vf_cerrado_no_inactivado","comparison","application","medium"),

    VF("Refractario relativo","Medio","Durante el período refractario relativo puede generarse un nuevo potencial de acción, pero suele requerirse un estímulo más intenso.",true,"Verdadero. En el refractario relativo, parte de los canales de Na⁺ ya se recuperó, pero la membrana puede seguir hiperpolarizada por salida persistente de K⁺.","",["Relativo = posible.","Requiere estímulo mayor.","K⁺ prolongado contribuye."],"Refractario relativo","vf_refractario_relativo","mechanism","application","medium"),

    VF("Conducción axonal","Base","La propagación del potencial de acción conserva su amplitud porque la señal se regenera sucesivamente por apertura de canales dependientes de voltaje.",true,"Verdadero. El potencial de acción no se propaga como una señal pasiva que se atenúa; cada región vecina alcanza el umbral y abre nuevos canales.","",["PA = regenerativo.","No se atenúa como graduado.","Canales voltaje-dependientes renuevan la señal."],"Propagación axonal","vf_pa_regenerativo","mechanism","recall","basic"),

    VF("Potencial graduado","Base","Los potenciales graduados se propagan de forma regenerativa y mantienen siempre la misma amplitud hasta la terminal axonal.",false,"Falso. Esa descripción corresponde al potencial de acción. Los potenciales graduados se atenúan con la distancia y tienen amplitud variable.","Corrección: el potencial graduado es local, variable, sumable y decremental; el potencial de acción es regenerativo.",["Graduado = decremental.","PA = regenerativo.","No confundir ambos formatos."],"Potencial graduado vs PA","vf_graduado_no_regenerativo","exam_trap","recall","basic"),

    VF("Segmento inicial","Medio","El segmento inicial del axón es una región clave porque integra señales locales y posee alta densidad de canales de Na⁺ dependientes de voltaje.",true,"Verdadero. La suma de potenciales graduados excitadores e inhibidores se evalúa funcionalmente en el segmento inicial, donde puede alcanzarse el umbral para disparar el potencial de acción.","",["Segmento inicial integra.","Alta densidad de Na⁺.","Umbral inicia PA."],"Segmento inicial","vf_segmento_inicial","mechanism","application","medium"),

    VF("Integración sináptica","Medio","Una neurona dispara solo por la cantidad total de neurotransmisor liberado, sin importar la suma de señales excitadoras e inhibitorias en la membrana postsináptica.",false,"Falso. El disparo depende de la suma neta de cambios de voltaje excitadores e inhibidores que llegan al segmento inicial, no solo de una cantidad total de neurotransmisor.","Corrección: la neurona integra EPSP e IPSP; si la suma neta alcanza el umbral en el segmento inicial, dispara.",["EPSP acerca al umbral.","IPSP aleja o estabiliza.","Suma neta decide."],"Integración sináptica","vf_no_solo_neurotransmisor","exam_trap","application","medium"),

    VF("EPSP","Base","Un potencial postsináptico excitador suele acercar la membrana al umbral mediante una despolarización graduada.",true,"Verdadero. Un EPSP es una señal local que aumenta la probabilidad de disparo al aproximar el potencial de membrana al umbral.","",["EPSP = excitador.","Acerca al umbral.","Es graduado y sumable."],"EPSP","vf_epsp_despolariza","definition","recall","basic"),

    VF("IPSP","Base","Un potencial postsináptico inhibidor aumenta siempre la probabilidad de disparo porque abre canales de Na⁺ postsinápticos.",false,"Falso. Un IPSP disminuye la probabilidad de disparo, con frecuencia por entrada de Cl⁻ o salida de K⁺ que estabiliza o hiperpolariza la membrana.","Corrección: un IPSP aleja funcionalmente del umbral o reduce el impacto de señales excitadoras.",["IPSP = inhibidor.","Cl⁻ o K⁺ pueden mediar inhibición.","Disminuye probabilidad de PA."],"IPSP","vf_ipsp_no_excita","exam_trap","recall","basic"),

    VF("Cloro","Medio","La entrada de Cl⁻ en una neurona postsináptica adulta suele estabilizar la membrana o disminuir la probabilidad de alcanzar el umbral.",true,"Verdadero. El Cl⁻ es un anión y, según su gradiente, suele participar en respuestas inhibitorias al limitar la despolarización o favorecer hiperpolarización relativa.","",["Cl⁻ suele inhibir.","Reduce probabilidad de umbral.","Su efecto depende de E_Cl y contexto."],"Cl⁻ e inhibición","vf_cloro_inhibe","mechanism","application","medium"),

    VF("Ca²⁺ presináptico","Medio","El Ca²⁺ presináptico reemplaza al Na⁺ como ion principal de la fase ascendente rápida del potencial de acción neuronal clásico.",false,"Falso. En la neurona clásica, la fase ascendente rápida depende de la entrada de Na⁺. El Ca²⁺ presináptico es clave para la fusión vesicular y liberación de neurotransmisor.","Corrección: Na⁺ conduce la espiga axonal; Ca²⁺ desencadena exocitosis en la terminal presináptica.",["Na⁺ = fase ascendente.","Ca²⁺ = exocitosis.","No confundir axón con terminal."],"Na⁺ vs Ca²⁺","vf_calcio_no_upstroke","exam_trap","application","medium"),

    VF("Difusión del neurotransmisor","Base","En una sinapsis química, el neurotransmisor liberado debe unirse a receptores postsinápticos para modificar la respuesta de la célula receptora.",true,"Verdadero. La transmisión química no termina con la liberación; el neurotransmisor debe actuar sobre receptores que modifican canales, conductancias o vías intracelulares.","",["Neurotransmisor actúa en receptor.","Receptor postsináptico genera respuesta.","Puede producir EPSP o IPSP."],"Receptor postsináptico","vf_neurotransmisor_receptor","mechanism","recall","basic"),

    VF("Retardo sináptico","Medio","La sinapsis química puede presentar un pequeño retardo porque incluye entrada de Ca²⁺, fusión vesicular, difusión y unión a receptores.",true,"Verdadero. A diferencia de una transmisión puramente eléctrica, la sinapsis química requiere pasos sucesivos que consumen tiempo, aunque sean rápidos.","",["Química = pasos intermedios.","Ca²⁺ y vesículas.","Receptor postsináptico completa la señal."],"Retardo sináptico","vf_retardo_sinaptico","mechanism","application","medium"),

    VF("Frecuencia de descarga","Medio","La intensidad de un estímulo suprumbral suele codificarse aumentando la frecuencia de potenciales de acción, no aumentando de forma ilimitada la amplitud de cada espiga.",true,"Verdadero. La espiga individual mantiene amplitud relativamente constante; la intensidad se expresa principalmente por frecuencia de descarga y reclutamiento de fibras.","",["Amplitud individual estable.","Frecuencia codifica intensidad.","Refractario limita frecuencia máxima."],"Codificación por frecuencia","vf_frecuencia_intensidad","mechanism","application","medium"),

    VF("Tejidos excitables","Medio","Todos los tejidos excitables tienen exactamente la misma curva de potencial de acción que una neurona típica, sin diferencias de duración ni meseta.",false,"Falso. Diferentes tejidos excitables pueden tener curvas distintas. Por ejemplo, el músculo cardíaco puede presentar una meseta relacionada con corrientes de Ca²⁺.","Corrección: la neurona típica tiene una espiga breve; otros tejidos excitables pueden presentar patrones eléctricos diferentes.",["No extrapolar una curva a todos los tejidos.","Neurona = espiga breve.","Cardíaco = meseta posible."],"Tejidos excitables","vf_no_misma_curva","exam_trap","application","medium"),

    VF("Músculo cardíaco","Medio","La meseta del potencial de acción cardíaco se relaciona con corrientes sostenidas de Ca²⁺ y no debe confundirse con la espiga neuronal breve.",true,"Verdadero. El módulo diferencia la espiga neuronal clásica de otros patrones excitables; en cardiomiocitos, la entrada sostenida de Ca²⁺ contribuye a la meseta.","",["Cardíaco = meseta.","Ca²⁺ sostiene parte de la despolarización.","Neurona típica = espiga breve."],"Meseta cardíaca","vf_meseta_calcio","comparison","application","medium"),

    VF("Energía y gradientes","Medio","Aunque una espiga individual use flujos pasivos por canales, el sistema necesita ATP para mantener los gradientes iónicos a largo plazo.",true,"Verdadero. Los canales permiten flujos rápidos siguiendo gradientes, pero bombas como la Na⁺/K⁺ ATPasa consumen ATP para preservar las diferencias de concentración necesarias para la excitabilidad.","",["Canales usan gradientes.","Bombas mantienen gradientes.","ATP sostiene excitabilidad a largo plazo."],"Energía y excitabilidad","vf_atp_gradientes","mechanism","application","medium")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.vf, 10+i, items[i]);

  ROOT.fisiologiaQualityPatchV323 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"VF 011-030",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:20,
    notes:"Replaces V/F 011-030 of Module 1 with clear complete statements and specific corrections."
  };
})();
