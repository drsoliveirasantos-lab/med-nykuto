/* v320 — Fisiología quality patch, Módulo 1 QCM 181–200.
   Scope: replaces QCM 181–200 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v320-m1-qcm-181-200";

  function hits(){ return bank.qcm.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; }); }
  function R(text, why){ return {text:text, why:why}; }
  function build(correct, wrongs, ai){
    var options=[], whyWrong=[], distractorExplanations=[], w=0;
    for(var i=0;i<4;i++){
      if(i===ai){ options.push(correct); whyWrong.push(null); distractorExplanations.push(null); }
      else { options.push(wrongs[w].text); whyWrong.push("Falsa. " + wrongs[w].why); distractorExplanations.push(wrongs[w].why); w++; }
    }
    return {options:options, whyWrong:whyWrong, distractorExplanations:distractorExplanations};
  }
  function Q(heading,difficulty,question,correct,wrongs,ai,explanation,keyPoints,topic,slug,skill,level,diff){
    var b = build(correct, wrongs, ai);
    return {
      auditDecision:"B", heading:heading, difficulty:difficulty, question:question,
      options:b.options, answerIndex:ai, explanation:explanation,
      whyWrong:b.whyWrong, distractorExplanations:b.distractorExplanations,
      keyPoints:keyPoints,
      tags:{subject:"fisiologia",moduleNumber:1,format:"qcm",topic:topic,topicSlug:slug,skill:skill,cognitiveLevel:level,difficulty:diff,visible:false,adaptiveVersion:"v320"}
    };
  }
  function replaceModuleIndex(index,item){
    var h = hits();
    if(!h[index]) return false;
    var old = h[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    bank.qcm[h[index].i] = merged;
    return true;
  }

  var items = [
    Q("Cierre integrador","Examen","¿Cuál opción diferencia mejor potencial graduado, potencial de acción y liberación sináptica?","Graduado: local y sumable; acción: todo o nada y regenerativo; liberación sináptica: depende de Ca²⁺ presináptico.",[
      R("Graduado: todo o nada; acción: decremental; liberación: depende de K⁺ de fuga.","Invierte propiedades de potencial graduado y de acción, y atribuye la liberación al ion equivocado."),
      R("Graduado: conducción saltatoria; acción: unión a receptor postsináptico; liberación: depende de Cl⁻.","Mezcla propagación axonal, recepción postsináptica e inhibición por Cl⁻."),
      R("Graduado: electrones; acción: glucosa; liberación: mielina.","Usa distractores no fisiológicos y ajenos al mecanismo real.")],0,"La respuesta correcta es A. El módulo exige separar tres niveles: señales locales graduadas, espiga axonal todo o nada y transmisión química dependiente de Ca²⁺ en la terminal.",["Graduado = local/sumable.","PA = todo o nada/regenerativo.","Ca²⁺ presináptico = liberación."],"Síntesis graduado-acción-sinapsis","sintesis_graduado_accion_sinapsis","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción ordena correctamente los eventos desde una señal dendrítica excitadora hasta la respuesta postsináptica siguiente?","EPSP se suma → segmento inicial alcanza umbral → PA se propaga → Ca²⁺ entra en terminal → neurotransmisor actúa en receptor postsináptico.",[
      R("PA se propaga → EPSP aparece en dendrita previa → mielina libera neurotransmisor → Cl⁻ genera pico positivo.","Invierte la secuencia y asigna funciones falsas a mielina y Cl⁻."),
      R("Bomba se apaga → glucosa despolariza → K⁺ entra para ascenso → receptor desaparece.","No representa la fisiología del PA ni de la sinapsis."),
      R("Ca²⁺ entra en soma → Na⁺ libera vesículas → K⁺ abre receptores → no existe umbral.","Confunde iones, localización y requisito de umbral." )],1,"La respuesta correcta es B. Una señal excitadora local puede contribuir al umbral; la espiga se propaga por Na⁺/K⁺ y la terminal usa Ca²⁺ para liberar neurotransmisor.",["EPSP puede alcanzar umbral.","PA se propaga por axón.","Terminal usa Ca²⁺ para liberar neurotransmisor."],"Secuencia integración-sinapsis","secuencia_integracion_sinapsis","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál combinación de conceptos explica mejor la conservación de la amplitud del potencial de acción durante su propagación?","Corrientes locales despolarizan el segmento vecino hasta umbral y abren nuevos canales de Na⁺.",[
      R("La glucosa se difunde sin pérdida hasta el final del axón.","La glucosa no es la señal eléctrica propagada."),
      R("La mielina transforma la señal en electrones metálicos.","La mielina no cambia la naturaleza iónica de la señal."),
      R("La bomba Na⁺/K⁺ produce directamente una espiga nueva en cada micrómetro.","La regeneración rápida depende de canales voltaje-dependientes; la bomba mantiene gradientes." )],2,"La respuesta correcta es C. El PA no se conserva por difusión pasiva simple; se regenera en segmentos sucesivos cuando canales de Na⁺ se abren al llegar al umbral.",["PA = regenerativo.","Corrientes locales alcanzan umbral vecino.","Na⁺ abre y renueva la señal."],"Conservación de amplitud","conservacion_amplitud_pa","mechanism","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción representa una aplicación correcta de la ley del todo o nada?","Un estímulo suprumbral genera una espiga individual completa; un estímulo más intenso aumenta sobre todo la frecuencia de disparo.",[
      R("Un estímulo subumbral siempre genera una espiga completa si dura poco.","Sin alcanzar umbral no hay PA completo."),
      R("Un estímulo más intenso aumenta sin límite la amplitud de cada espiga individual.","La amplitud individual es relativamente constante."),
      R("La ley del todo o nada solo se aplica a potenciales postsinápticos graduados.","Se aplica al potencial de acción, no al graduado." )],3,"La respuesta correcta es D. Una vez alcanzado el umbral, la respuesta individual es completa; la intensidad se codifica principalmente por frecuencia, no por altura de cada espiga.",["Todo o nada = PA.","Más intensidad = más frecuencia.","Subumbral = no PA completo."],"Ley del todo o nada final","todo_o_nada_final","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción resume correctamente la función de Na⁺, K⁺, Ca²⁺ y Cl⁻ en este módulo?","Na⁺ despolariza rápido; K⁺ repolariza/hiperpolariza; Ca²⁺ libera neurotransmisor; Cl⁻ suele estabilizar o inhibir.",[
      R("Na⁺ repolariza; K⁺ libera neurotransmisor; Ca²⁺ genera reposo principal; Cl⁻ produce fase ascendente.","Invierte las funciones principales de todos los iones."),
      R("Na⁺ y K⁺ son neurotransmisores; Ca²⁺ y Cl⁻ son vainas de mielina.","Confunde iones con moléculas o estructuras."),
      R("Na⁺ solo mantiene gradientes; K⁺ solo abre receptores; Ca²⁺ solo transporta glucosa; Cl⁻ no tiene carga.","Asocia funciones incorrectas y niega que Cl⁻ sea anión." )],0,"La respuesta correcta es A. Esta es la tabla mental esencial: Na⁺ sube la curva, K⁺ la baja, Ca²⁺ participa en exocitosis y Cl⁻ suele mediar inhibición o estabilización.",["Na⁺ sube.","K⁺ baja.","Ca²⁺ libera; Cl⁻ inhibe/estabiliza."],"Mapa iónico definitivo","mapa_ionico_definitivo","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción corrige simultáneamente dos trampas frecuentes: bomba y canal?","La bomba mantiene gradientes con ATP; los canales permiten flujos rápidos que cambian el voltaje.",[
      R("La bomba genera cada fase rápida; los canales almacenan ATP.","Invierte las funciones: la fase rápida depende de canales, la bomba usa ATP."),
      R("Bomba y canal son sinónimos exactos.","Son proteínas con mecanismos distintos."),
      R("Los canales mueven siempre 3 Na⁺ hacia fuera y 2 K⁺ hacia dentro.","Esa estequiometría corresponde a la bomba Na⁺/K⁺." )],1,"La respuesta correcta es B. Para no fallar en examen: la bomba conserva las condiciones de base, mientras los canales explican los cambios rápidos de Vm.",["Bomba = ATP/gradientes.","Canal = flujo rápido.","No atribuir la espiga a la bomba."],"Bomba y canal final","bomba_canal_final","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción corrige simultáneamente dos trampas frecuentes: mielina y nodo?","La mielina aísla el internodo; el nodo concentra canales para regenerar el potencial de acción.",[
      R("La mielina genera neurotransmisor; el nodo contiene vesículas sinápticas.","Mielina y nodo no cumplen esas funciones sinápticas."),
      R("La mielina elimina la necesidad de canales de Na⁺.","La conducción saltatoria requiere canales de Na⁺ en nodos."),
      R("El nodo impide toda regeneración y la mielina produce el pico de +30 mV.","Invierte las funciones de nodo y mielina." )],2,"La respuesta correcta es C. La mielina mejora aislamiento y velocidad; los nodos de Ranvier regeneran la señal mediante canales voltaje-dependientes.",["Mielina = aislamiento.","Nodo = regeneración.","Canales de Na⁺ nodales son clave."],"Mielina y nodo final","mielina_nodo_final","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción corrige simultáneamente dos trampas frecuentes: Na⁺ axonal y Ca²⁺ presináptico?","Na⁺ conduce la espiga por el axón; Ca²⁺ desencadena exocitosis en la terminal presináptica.",[
      R("Ca²⁺ conduce la espiga axonal clásica y Na⁺ fusiona vesículas.","Invierte los papeles de Na⁺ y Ca²⁺."),
      R("Na⁺ y Ca²⁺ solo sirven para mantener el reposo por canales de fuga.","El reposo depende sobre todo de K⁺ de fuga."),
      R("Ambos actúan como electrones libres dentro de la mielina.","La señal no es metálica ni ocurre dentro de la mielina como electrones." )],3,"La respuesta correcta es D. Una pregunta de examen suele separar conducción axonal y transmisión sináptica: Na⁺ para el PA, Ca²⁺ para liberación de neurotransmisor.",["Na⁺ = conducción axonal.","Ca²⁺ = exocitosis.","No confundir fases."],"Na⁺ y Ca²⁺ final","na_ca_final","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Difícil","Un estudiante dice: “si bloqueo Ca²⁺ presináptico, el axón ya no puede tener fase ascendente”. ¿Cuál es la corrección?","Bloquear Ca²⁺ presináptico afecta sobre todo la liberación de neurotransmisor, no la fase ascendente axonal por Na⁺.",[
      R("La frase es correcta porque Ca²⁺ siempre reemplaza al Na⁺ en neuronas.","En la neurona clásica, la fase ascendente rápida depende de Na⁺."),
      R("Debe cambiarse por bloqueo de Cl⁻ como causa de fallo de exocitosis.","El ion crítico de exocitosis es Ca²⁺, no Cl⁻."),
      R("El problema real sería desaparición de mielina por ausencia de Ca²⁺.","La ausencia de Ca²⁺ presináptico no destruye mielina como mecanismo directo." )],0,"La respuesta correcta es A. El bloqueo de Ca²⁺ presináptico puede impedir la transmisión química aunque la conducción axonal por Na⁺ haya ocurrido.",["Ca²⁺ = liberación.","Na⁺ = fase ascendente.","Conducción y sinapsis son pasos distintos."],"Bloqueo Ca²⁺ final","bloqueo_calcio_final","clinical_application","reasoning","hard"),

    Q("Cierre integrador","Difícil","Un estudiante dice: “si bloqueo Na⁺ axonal, la vesícula presináptica todavía se libera igual porque Ca²⁺ está normal”. ¿Cuál es la mejor respuesta?","Sin conducción axonal adecuada puede no llegar la señal que abre canales de Ca²⁺ presinápticos.",[
      R("La frase es siempre correcta porque la terminal nunca depende del potencial de acción.","La llegada del PA normalmente abre canales de Ca²⁺ presinápticos."),
      R("El Na⁺ solo sirve para hiperpolarizar después de la repolarización.","Na⁺ es clave en la fase ascendente."),
      R("El bloqueo de Na⁺ convierte directamente neurotransmisor en K⁺.","No existe conversión de neurotransmisor en ion." )],1,"La respuesta correcta es B. Aunque Ca²⁺ sea el disparador inmediato de exocitosis, la señal axonal por Na⁺ suele ser necesaria para activar la terminal.",["Na⁺ permite llegada del PA.","PA abre Ca²⁺ terminal.","Ca²⁺ libera vesículas."],"Bloqueo Na⁺ y sinapsis","bloqueo_na_sinapsis","clinical_application","reasoning","hard"),

    Q("Cierre integrador","Difícil","Una neurona con muchos EPSP no dispara porque simultáneamente recibe IPSP potentes. ¿Qué concepto explica mejor esta situación?","Integración sináptica: la suma neta no alcanza el umbral en el segmento inicial.",[
      R("Ley del todo o nada aplicada a cada EPSP individual.","Los EPSP son graduados y se integran; el todo o nada corresponde al PA."),
      R("Conducción saltatoria entre dendritas.","Las dendritas no conducen saltatoriamente entre nodos de Ranvier."),
      R("Fallo de exocitosis por falta de mielina.","La integración EPSP/IPSP no se explica por mielina." )],2,"La respuesta correcta es C. El disparo depende del balance excitador-inhibidor que llega al segmento inicial; muchos EPSP pueden no bastar si los IPSP compensan.",["EPSP e IPSP se integran.","Suma neta decide.","Umbral está en segmento inicial."],"Integración excitadora-inhibidora final","integracion_final","clinical_application","reasoning","hard"),

    Q("Cierre integrador","Difícil","Un potencial postsináptico excitador se atenúa antes de alcanzar el segmento inicial. ¿Qué propiedad explica mejor este hecho?","Los potenciales graduados son decrementales y pueden perder amplitud con la distancia.",[
      R("Los potenciales de acción son decrementales y nunca se regeneran.","El PA se regenera; el potencial graduado se atenúa."),
      R("La bomba Na⁺/K⁺ destruye activamente todos los EPSP.","La bomba no destruye de forma específica los EPSP."),
      R("La mielina libera Cl⁻ para eliminar toda señal dendrítica.","La mielina no libera Cl⁻ como mecanismo dendrítico." )],3,"La respuesta correcta es D. Los potenciales postsinápticos graduados se propagan pasivamente y se atenúan; por eso su localización e intensidad importan.",["Graduado = decremental.","PA = regenerativo.","Distancia importa en señales locales."],"Atenuación EPSP final","atenuacion_epsp_final","clinical_application","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción es la mejor frase clave para memorizar las fases del potencial de acción?","Na⁺ sube la curva, K⁺ baja la curva y K⁺ prolongado produce hiperpolarización.",[
      R("K⁺ sube la curva, Na⁺ baja la curva y Ca²⁺ produce reposo.","Invierte los iones de subida y bajada."),
      R("Cl⁻ sube la curva, glucosa baja la curva y mielina libera vesículas.","No corresponde a fases del PA."),
      R("La bomba sube la curva, la mielina la baja y el nodo produce Cl⁻.","Asigna fases a estructuras que no generan esos movimientos iónicos." )],0,"La respuesta correcta es A. Esta frase resume la lectura rápida de la gráfica neuronal clásica y evita las inversiones más frecuentes.",["Na⁺ sube.","K⁺ baja.","K⁺ prolongado hiperpolariza."],"Frase clave del PA","frase_na_k","summary","recall","basic"),

    Q("Cierre integrador","Examen","¿Cuál opción es la mejor frase clave para memorizar gradiente y permeabilidad?","El gradiente empuja; la permeabilidad permite.",[
      R("La permeabilidad empuja; el gradiente bloquea.","Invierte las definiciones."),
      R("Gradiente y permeabilidad son exactamente lo mismo.","Son conceptos relacionados pero distintos."),
      R("El gradiente solo aparece cuando no existen canales.","Los gradientes existen y los canales permiten que se expresen como corriente." )],1,"La respuesta correcta es B. El gradiente es fuerza impulsora; la permeabilidad es la posibilidad real de paso a través de la membrana.",["Gradiente = fuerza.","Permeabilidad = vía.","Canal abierto permite flujo."],"Frase gradiente-permeabilidad","frase_gradiente_permeabilidad","summary","recall","basic"),

    Q("Cierre integrador","Examen","¿Cuál opción es la mejor frase clave para diferenciar absoluto y relativo?","Absoluto: imposible disparar; relativo: posible con estímulo mayor.",[
      R("Absoluto: posible con estímulo mayor; relativo: imposible.","Invierte ambas definiciones."),
      R("Ambos significan apertura máxima de canales de Na⁺.","El absoluto se debe a inactivación de Na⁺."),
      R("Ambos dependen únicamente de Ca²⁺ presináptico.","La refractariedad axonal depende de estados de canales de Na⁺ y K⁺." )],2,"La respuesta correcta es C. Esta diferencia es una de las trampas más frecuentes del módulo.",["Absoluto = imposible.","Relativo = estímulo mayor.","Na⁺ inactivado explica absoluto."],"Frase refractarios","frase_absoluto_relativo","summary","recall","basic"),

    Q("Cierre integrador","Examen","¿Cuál opción es la mejor frase clave para mielina y nodos?","La mielina aísla; el nodo regenera.",[
      R("La mielina regenera; el nodo aísla.","Invierte la función principal de cada estructura."),
      R("La mielina libera neurotransmisor; el nodo produce Ca²⁺.","Confunde conducción con sinapsis."),
      R("La mielina reemplaza los canales; el nodo reemplaza la bomba.","La conducción necesita canales y gradientes." )],3,"La respuesta correcta es D. En conducción saltatoria, el internodo mielinizado conserva corriente y el nodo renueva el potencial de acción.",["Mielina = aislamiento.","Nodo = regeneración.","Saltatoria = rápida."],"Frase mielina-nodo","frase_mielina_nodo","summary","recall","basic"),

    Q("Cierre integrador","Examen","¿Cuál opción reúne solo afirmaciones verdaderas sobre el potencial de acción neuronal clásico?","Tiene umbral, se propaga de forma regenerativa y presenta período refractario.",[
      R("No tiene umbral, se atenúa siempre y no tiene refractariedad.","Describe lo contrario de un PA clásico."),
      R("Es graduado, sumable como un EPSP y siempre local.","Eso describe potenciales graduados, no PA."),
      R("Depende solo de glucosa y no de canales iónicos.","El PA depende de canales de Na⁺ y K⁺." )],0,"La respuesta correcta es A. El PA clásico requiere umbral, se regenera durante la propagación y presenta períodos refractarios por estados canaliculares.",["Umbral.","Regeneración.","Refractariedad."],"Verdades del PA","verdades_pa","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción reúne solo afirmaciones verdaderas sobre potenciales graduados?","Tienen amplitud variable, pueden sumarse y se atenúan con la distancia.",[
      R("Son todo o nada, no se suman y siempre se regeneran.","Eso corresponde al PA, no al graduado."),
      R("Solo ocurren en nodos de Ranvier y dependen de mielina.","Los graduados predominan en regiones receptoras/somadendríticas, no en nodos."),
      R("Son causados exclusivamente por la bomba Na⁺/K⁺.","Pueden depender de canales y receptores; la bomba mantiene gradientes." )],1,"La respuesta correcta es B. Estas tres propiedades identifican al potencial graduado frente al potencial de acción.",["Variable.","Sumable.","Decremental."],"Verdades del graduado","verdades_graduado","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción reúne solo afirmaciones verdaderas sobre transmisión sináptica química?","Requiere llegada de señal presináptica, entrada de Ca²⁺ y acción del neurotransmisor en receptores postsinápticos.",[
      R("Se basa en electrones que cruzan la hendidura sináptica.","La sinapsis química usa neurotransmisores, no electrones metálicos."),
      R("No requiere Ca²⁺ ni vesículas en ningún caso.","La liberación química clásica depende de Ca²⁺ y vesículas."),
      R("Ocurre únicamente en nodos de Ranvier mielinizados.","Los nodos son sitios de regeneración axonal, no sinapsis química típica." )],2,"La respuesta correcta es C. La secuencia química clásica es llegada del PA, Ca²⁺ presináptico, vesículas, neurotransmisor y receptor postsináptico.",["PA llega a terminal.","Ca²⁺ entra.","Neurotransmisor actúa en receptor."],"Verdades de sinapsis química","verdades_sinapsis_quimica","summary","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción debe marcarse como incorrecta en una pregunta de examen?","La bomba Na⁺/K⁺ produce directamente la fase ascendente rápida de cada potencial de acción.",[
      R("La membrana en reposo es más permeable al K⁺ que al Na⁺.","Esta afirmación es correcta en el modelo neuronal clásico."),
      R("La entrada de Ca²⁺ presináptico favorece la liberación de neurotransmisor.","Esta afirmación es correcta para sinapsis química."),
      R("Los canales de Na⁺ inactivados explican el refractario absoluto.","Esta afirmación es correcta." )],3,"La respuesta correcta es D. Es la afirmación incorrecta: la fase ascendente rápida depende de canales de Na⁺ voltaje-dependientes, no directamente de la bomba.",["Bomba mantiene gradientes.","Canales generan fase rápida.","Na⁺ inactivado = refractario absoluto."],"Identificar falsa: bomba","identificar_falsa_bomba","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción debe marcarse como incorrecta en una pregunta de examen?","El período refractario absoluto se supera aumentando la intensidad del estímulo.",[
      R("El período refractario relativo puede requerir estímulo mayor.","Esta afirmación es correcta."),
      R("La hiperpolarización puede deberse a salida prolongada de K⁺.","Esta afirmación es correcta."),
      R("El potencial de acción se inicia si se alcanza el umbral.","Esta afirmación es correcta." )],0,"La respuesta correcta es A. La afirmación incorrecta es que el absoluto se supera con más estímulo; eso corresponde al relativo, no al absoluto.",["Absoluto no se supera.","Relativo requiere estímulo mayor.","K⁺ prolongado hiperpolariza."],"Identificar falsa: refractario","identificar_falsa_refractario","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción debe marcarse como incorrecta en una pregunta de examen?","La mielina libera neurotransmisor en cada internodo para acelerar la conducción.",[
      R("La conducción saltatoria regenera el potencial principalmente en nodos.","Correcta."),
      R("La mielina reduce pérdidas de corriente en internodos.","Correcta."),
      R("La desmielinización puede enlentecer la conducción.","Correcta." )],1,"La respuesta correcta es B. La mielina no libera neurotransmisor; actúa como aislante y permite que la señal llegue con eficacia al nodo siguiente.",["Mielina no es terminal sináptica.","Mielina aísla.","Nodo regenera."],"Identificar falsa: mielina","identificar_falsa_mielina","exam_trap","reasoning","hard"),

    Q("Cierre integrador","Examen","¿Cuál opción debe marcarse como incorrecta en una pregunta de examen?","El potencial graduado se propaga sin atenuación igual que un potencial de acción.",[
      R("El potencial graduado puede sumarse.","Correcta."),
      R("El potencial de acción se regenera durante la propagación.","Correcta."),
      R("El potencial graduado tiene amplitud variable.","Correcta." )],2,"La respuesta correcta es C. La afirmación incorrecta es que el graduado no se atenúa; por definición es decremental.",["Graduado se atenúa.","PA se regenera.","Graduado puede sumarse."],"Identificar falsa: graduado","identificar_falsa_graduado","exam_trap","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(180+i, items[i]);

  ROOT.fisiologiaQualityPatchV320 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 181-200",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:20,
    notes:"Finishes Module 1 QCM with a 20-item synthesis and exam-trap batch."
  };
})();
