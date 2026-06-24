/* v318 — Fisiología quality patch, Módulo 1 QCM 101–140.
   Scope: replaces QCM 101–140 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v318-m1-qcm-101-140";

  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function R(text, why){ return {text:text, why:why}; }
  function build(correct, wrongs, answerIndex){
    var options=[], whyWrong=[], distractorExplanations=[], w=0;
    for(var i=0;i<4;i++){
      if(i===answerIndex){ options.push(correct); whyWrong.push(null); distractorExplanations.push(null); }
      else { options.push(wrongs[w].text); whyWrong.push("Falsa. " + wrongs[w].why); distractorExplanations.push(wrongs[w].why); w++; }
    }
    return {options:options, whyWrong:whyWrong, distractorExplanations:distractorExplanations};
  }
  function item(heading,difficulty,question,correct,wrongs,answerIndex,explanation,keyPoints,topic,slug,skill,level,diff){
    var b = build(correct, wrongs, answerIndex);
    return {
      auditDecision:"B",
      heading:heading,
      difficulty:difficulty,
      question:question,
      options:b.options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:b.whyWrong,
      distractorExplanations:b.distractorExplanations,
      keyPoints:keyPoints,
      tags:{subject:"fisiologia",moduleNumber:1,format:"qcm",topic:topic,topicSlug:slug,skill:skill,cognitiveLevel:level,difficulty:diff,visible:false,adaptiveVersion:"v318"}
    };
  }
  function replaceModuleIndex(arr, index, patchItem){
    var hits = moduleHits(arr);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, patchItem);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    arr[hits[index].i] = merged;
    return true;
  }

  var items = [
    item("Fuerza electroquímica","Difícil","En reposo, ¿por qué el Na⁺ tiene una fuerte tendencia a entrar en la neurona cuando se abren sus canales?","Porque su gradiente químico y el interior negativo favorecen la entrada de Na⁺.",[
      R("Porque el Na⁺ predomina dentro de la neurona y tiende a salir.","Invierte la distribución fisiológica del Na⁺."),
      R("Porque el Na⁺ no tiene carga eléctrica y atraviesa libremente la bicapa.","El Na⁺ es un catión y requiere una vía de permeabilidad."),
      R("Porque la bomba Na⁺/K⁺ introduce 3 Na⁺ en cada ciclo.","La bomba expulsa 3 Na⁺ y no explica la entrada rápida por canales.")],0,"La respuesta correcta es A. El Na⁺ es más abundante fuera de la célula y el interior negativo lo atrae; al aumentar la permeabilidad, entra y despolariza.",["Na⁺ alto fuera.","Interior negativo atrae cationes.","Canal abierto permite entrada."],"Fuerza electroquímica del Na⁺","fuerza_na_entrada","mechanism","reasoning","hard"),

    item("Fuerza electroquímica","Difícil","En una neurona en reposo, ¿qué dos fuerzas se oponen parcialmente para el K⁺?","El gradiente químico favorece su salida y la negatividad intracelular tiende a retenerlo.",[
      R("El gradiente químico favorece su entrada y la electricidad favorece su salida.","Invierte la distribución del K⁺ y el efecto del interior negativo."),
      R("Ambas fuerzas siempre empujan al K⁺ hacia dentro.","El K⁺ alto intracelular genera fuerza química de salida."),
      R("El K⁺ no está sometido a fuerzas eléctricas por ser neutro.","El K⁺ es un catión y responde al campo eléctrico." )],1,"La respuesta correcta es B. El K⁺ tiende químicamente a salir porque predomina dentro, pero el interior negativo atrae K⁺ hacia dentro; el equilibrio surge de ambas fuerzas.",["K⁺ alto dentro.","Química: salida.","Electricidad: retención por interior negativo."],"Fuerzas sobre K⁺","fuerzas_k_reposo","mechanism","reasoning","hard"),

    item("Potencial de equilibrio","Medio","¿Qué representa el potencial de equilibrio de un ion?","El voltaje al cual la fuerza química y la fuerza eléctrica sobre ese ion se equilibran.",[
      R("El voltaje en el que la bomba Na⁺/K⁺ se detiene definitivamente.","El potencial de equilibrio no se define por apagado de la bomba."),
      R("La concentración absoluta del ion en el plasma.","No es una concentración, sino un voltaje de equilibrio electroquímico."),
      R("La velocidad máxima de conducción del axón mielinizado.","La velocidad de conducción no define el equilibrio de un ion." )],2,"La respuesta correcta es C. El potencial de equilibrio indica el voltaje en el cual las fuerzas química y eléctrica para un ion se compensan y no hay flujo neto de ese ion.",["E_ion es un voltaje.","Depende de gradientes y carga.","No equivale al potencial de reposo completo."],"Potencial de equilibrio","definicion_potencial_equilibrio","definition","application","medium"),

    item("Conductancia","Medio","En neurofisiología, ¿qué expresa mejor el aumento de conductancia para un ion?","Aumento de la facilidad con la que ese ion atraviesa la membrana por canales abiertos.",[
      R("Aumento de la cantidad total de ese ion sintetizada por la neurona.","Los iones no se sintetizan para aumentar conductancia."),
      R("Desaparición de su gradiente electroquímico.","La conductancia permite flujo; no implica desaparición inmediata del gradiente."),
      R("Cambio del ion en neurotransmisor dentro de vesículas.","Un ion no se convierte en neurotransmisor por aumentar conductancia." )],3,"La respuesta correcta es D. La conductancia refleja permeabilidad efectiva: si hay más canales abiertos para un ion, ese ion fluye con mayor facilidad según su gradiente.",["Conductancia = permeabilidad efectiva.","Canales abiertos aumentan flujo.","Gradiente y conductancia son distintos."],"Conductancia iónica","conductancia_ionica","definition","application","medium"),

    item("Excitabilidad","Difícil","Un anestésico local reduce la disponibilidad de canales de Na⁺ axonales. ¿Qué consecuencia fisiológica explica su efecto?","Disminuye la propagación del potencial de acción y, por tanto, la transmisión de la señal dolorosa.",[
      R("Aumenta la entrada de Ca²⁺ postsináptico y genera más dolor.","El efecto principal es sobre canales de Na⁺ axonales, no sobre Ca²⁺ postsináptico."),
      R("Aumenta el potencial de acción por abrir canales de K⁺.","Abrir K⁺ no explica bloqueo de conducción por anestésico local."),
      R("Destruye los gradientes iónicos de todo el organismo.","El bloqueo local de Na⁺ no destruye todos los gradientes sistémicos." )],0,"La respuesta correcta es A. Si los canales de Na⁺ no están disponibles, la fase ascendente falla y el axón no conduce eficazmente la señal.",["Na⁺ disponible = conducción.","Bloqueo de Na⁺ reduce PA.","La analgesia local se explica por bloqueo de conducción."],"Bloqueo de conducción","anestesico_local_na","clinical_application","reasoning","hard"),

    item("Potasio extracelular","Difícil","Si aumenta el K⁺ extracelular, ¿qué cambio inicial suele producirse sobre el potencial de reposo?","Se reduce el gradiente de salida de K⁺ y el reposo tiende a despolarizarse.",[
      R("Aumenta el gradiente de salida de K⁺ y la célula se hiperpolariza siempre.","Más K⁺ extracelular reduce, no aumenta, la fuerza química de salida."),
      R("El Na⁺ pierde su carga positiva y deja de entrar.","El Na⁺ conserva su carga; el cambio principal aquí afecta al gradiente de K⁺."),
      R("La bomba Na⁺/K⁺ se convierte en canal de Cl⁻.","La bomba no cambia de identidad por aumento de K⁺ extracelular." )],1,"La respuesta correcta es B. Al elevarse K⁺ fuera, disminuye la diferencia de concentración para que K⁺ salga; el interior se vuelve menos negativo, es decir, se despolariza.",["K⁺ externo alto reduce salida neta.","Vm se vuelve menos negativo.","La excitabilidad puede alterarse."],"K⁺ extracelular","hiperpotasemia_despolarizacion","clinical_application","reasoning","hard"),

    item("Potasio extracelular","Difícil","Si disminuye de forma marcada el K⁺ extracelular, ¿qué tendencia inicial se espera sobre el potencial de reposo?","Mayor tendencia a hiperpolarización por aumento de la fuerza de salida de K⁺.",[
      R("Despolarización obligatoria por entrada masiva de K⁺.","El K⁺ bajo fuera favorece más salida, no entrada masiva."),
      R("Pico inmediato a +60 mV por apertura de canales de Na⁺.","Cambiar K⁺ extracelular no equivale a abrir canales de Na⁺ hasta E_Na."),
      R("Liberación de neurotransmisor sin llegada de potencial de acción.","El K⁺ extracelular bajo no desencadena por sí solo exocitosis sináptica normal." )],2,"La respuesta correcta es C. Menor K⁺ extracelular aumenta el gradiente químico de salida de K⁺, lo que puede volver el interior más negativo y alejarlo del umbral.",["K⁺ bajo fuera favorece salida.","Salida de K⁺ hiperpolariza.","Más lejos del umbral = menor excitabilidad inicial."],"K⁺ extracelular bajo","hipopotasemia_hiperpolarizacion","clinical_application","reasoning","hard"),

    item("Sodio extracelular","Difícil","Si disminuye mucho el Na⁺ extracelular, ¿qué fase del potencial de acción neuronal se afectaría más directamente?","La fase ascendente rápida, por menor fuerza de entrada de Na⁺.",[
      R("La hiperpolarización por salida prolongada de K⁺.","La hiperpolarización depende principalmente de K⁺, no del gradiente externo de Na⁺."),
      R("La liberación vesicular por entrada de Ca²⁺.","La exocitosis depende de Ca²⁺ presináptico, aunque la conducción previa pueda alterarse."),
      R("El aislamiento eléctrico producido por la mielina.","La concentración de Na⁺ no define directamente la función aislante de la mielina." )],3,"La respuesta correcta es D. La fase ascendente requiere entrada de Na⁺; si hay menos Na⁺ extracelular, disminuye la fuerza impulsora y la amplitud/velocidad de subida puede reducirse.",["Na⁺ externo impulsa entrada.","Entrada de Na⁺ sube la curva.","K⁺ y Ca²⁺ pertenecen a otros pasos."],"Na⁺ extracelular bajo","sodio_extracelular_upstroke","clinical_application","reasoning","hard"),

    item("Calcio presináptico","Difícil","Si disminuye la entrada de Ca²⁺ en la terminal presináptica, ¿qué efecto directo se espera?","Disminución de la liberación de neurotransmisor.",[
      R("Aumento de la fase ascendente por entrada de Na⁺.","La entrada de Ca²⁺ presináptico no es la entrada de Na⁺ axonal."),
      R("Hiperpolarización obligatoria por salida de K⁺.","La salida de K⁺ no es el efecto directo de bloquear Ca²⁺ presináptico."),
      R("Conversión de la mielina en nodo de Ranvier.","No existe conversión de mielina en nodo por cambios de Ca²⁺." )],0,"La respuesta correcta es A. El Ca²⁺ presináptico desencadena fusión vesicular; si entra menos Ca²⁺, se libera menos neurotransmisor.",["Ca²⁺ presináptico = exocitosis.","Na⁺ axonal = conducción.","K⁺ = repolarización/hiperpolarización."],"Ca²⁺ y liberación","calcio_menos_liberacion","clinical_application","reasoning","hard"),

    item("Inhibición sináptica","Difícil","¿Cómo puede un IPSP disminuir la probabilidad de generar un potencial de acción?","Alejando el potencial del umbral o estabilizando la membrana frente a despolarizaciones.",[
      R("Abriendo canales de Na⁺ para llevar la membrana a +30 mV.","Eso favorece excitación, no inhibición."),
      R("Eliminando físicamente el segmento inicial del axón.","Un IPSP es un cambio funcional de voltaje, no eliminación anatómica."),
      R("Convirtiendo todos los potenciales graduados en espigas.","La inhibición no convierte señales graduadas en potenciales de acción." )],1,"La respuesta correcta es B. Los potenciales inhibidores reducen la probabilidad de alcanzar el umbral, por hiperpolarización o por estabilización de la membrana.",["IPSP reduce disparo.","Puede implicar Cl⁻ o K⁺.","Inhibición = menos probabilidad de umbral."],"IPSP funcional","ipsp_probabilidad_disparo","mechanism","reasoning","hard"),

    item("Inhibición por shunt","Difícil","¿Qué significa una inhibición por cortocircuito o shunting inhibition en términos funcionales simples?","Aumenta una conductancia que reduce el impacto de corrientes excitadoras sobre el voltaje postsináptico.",[
      R("Aumenta la amplitud de todos los EPSP hasta generar siempre una espiga.","Eso es lo contrario de una inhibición."),
      R("Bloquea la bomba Na⁺/K⁺ para que no existan gradientes.","El shunt no se define por apagar la bomba."),
      R("Hace que el neurotransmisor se libere desde la mielina.","La mielina no libera neurotransmisor." )],2,"La respuesta correcta es C. Al aumentar conductancias inhibitorias, parte de la corriente excitadora se disipa y la despolarización efectiva disminuye.",["Shunt = menor impacto del EPSP.","Conductancia inhibitoria estabiliza.","No toda inhibición requiere gran hiperpolarización visible."],"Inhibición por shunt","shunting_inhibition","mechanism","reasoning","hard"),

    item("Integración sináptica","Medio","¿Qué dato decide finalmente si los potenciales postsinápticos integrados producen un potencial de acción?","Si la despolarización neta en el segmento inicial alcanza el umbral.",[
      R("Si el neurotransmisor se desplaza hasta el núcleo.","El disparo axonal no requiere desplazamiento del neurotransmisor al núcleo."),
      R("Si los canales de K⁺ se transforman en bombas.","Los canales no se transforman en bombas para decidir el umbral."),
      R("Si la mielina libera Ca²⁺ al espacio extracelular.","La mielina no libera Ca²⁺ como mecanismo de integración." )],3,"La respuesta correcta es D. La neurona suma señales excitadoras e inhibidoras; si el resultado alcanza el umbral en el segmento inicial, se genera una espiga.",["Segmento inicial integra.","Suma neta decide.","Umbral convierte graduado en PA."],"Integración y umbral","integracion_umbral","mechanism","application","medium"),

    item("Cronología del PA","Medio","¿Cuál es el orden correcto de eventos canaliculares en un potencial de acción neuronal clásico?","Apertura rápida de Na⁺, inactivación de Na⁺ y apertura retardada de K⁺.",[
      R("Apertura de K⁺, entrada de Cl⁻ y después apertura rápida de Na⁺.","Invierte los eventos principales del PA clásico."),
      R("Inactivación de K⁺, apertura de glucosa y cierre de Ca²⁺.","Incluye eventos que no corresponden a la espiga neuronal clásica."),
      R("Cierre de todos los canales, apagado de la bomba y salida de neurotransmisor.","La espiga requiere apertura de canales, no cierre de todos." )],0,"La respuesta correcta es A. El Na⁺ abre rápido y luego se inactiva; el K⁺ abre más lentamente y favorece la repolarización.",["Na⁺ abre rápido.","Na⁺ se inactiva.","K⁺ abre retardado."],"Cronología canalicular","cronologia_canales_pa","mechanism","application","medium"),

    item("Estado del canal","Medio","¿Qué diferencia esencial hay entre un canal de Na⁺ cerrado disponible y uno inactivado?","El cerrado disponible puede abrirse con despolarización; el inactivado no está disponible hasta que se recupere.",[
      R("El cerrado disponible conduce Na⁺ continuamente; el inactivado conduce K⁺.","Cerrado no conduce y un canal de Na⁺ no se vuelve canal de K⁺."),
      R("Ambos conducen Na⁺ con la misma probabilidad durante el refractario absoluto.","El inactivado no conduce y explica el refractario absoluto."),
      R("El inactivado se abre por glucosa y el cerrado por mielina.","Ni glucosa ni mielina son los estímulos de apertura de estos estados." )],1,"La respuesta correcta es B. Cerrado disponible significa listo para abrirse; inactivado significa temporalmente no disponible, incluso si la membrana sigue despolarizada.",["Cerrado disponible ≠ inactivado.","Inactivado explica refractario.","La repolarización permite recuperación."],"Estados del canal de Na⁺","cerrado_vs_inactivado","comparison","application","medium"),

    item("Acomodación neuronal","Difícil","Una despolarización lenta y sostenida puede no generar una espiga eficaz si inactiva canales de Na⁺ antes de alcanzar un disparo adecuado. ¿Qué concepto explica mejor este fenómeno?","Disminución de disponibilidad de canales de Na⁺ por inactivación durante despolarización lenta.",[
      R("Aumento de conducción saltatoria por exceso de mielina.","La mielina no explica la pérdida de disponibilidad de Na⁺ por despolarización lenta."),
      R("Liberación automática de neurotransmisor por Cl⁻.","Cl⁻ no desencadena exocitosis automática."),
      R("Transformación de potencial graduado en bomba Na⁺/K⁺.","Un potencial graduado no se convierte en bomba." )],2,"La respuesta correcta es C. Si la membrana se despolariza lentamente, algunos canales de Na⁺ pueden inactivarse antes de participar en una espiga sincronizada, reduciendo excitabilidad.",["Disponibilidad de Na⁺ importa.","Despolarización lenta puede inactivar canales.","No todo estímulo sostenido facilita disparo."],"Acomodación neuronal","acomodacion_inactivacion_na","mechanism","reasoning","hard"),

    item("Direccionalidad axonal","Medio","¿Qué mecanismo evita que el potencial de acción vuelva inmediatamente hacia la región que acaba de disparar?","El período refractario de la región recién activada.",[
      R("La destrucción de la mielina detrás del potencial.","La mielina no se destruye durante cada espiga."),
      R("La conversión de Na⁺ en Ca²⁺ después del pico.","Los iones no se convierten unos en otros."),
      R("La difusión retrógrada de neurotransmisor por el axón.","La conducción axonal no depende de difusión de neurotransmisor." )],3,"La respuesta correcta es D. La región recién activada queda refractaria por estados de canales de Na⁺, lo que favorece la propagación hacia regiones aún excitables.",["Refractario favorece dirección.","Na⁺ inactivado no dispara otra vez.","La señal avanza hacia membrana disponible."],"Direccionalidad del PA","direccion_por_refractario","mechanism","application","medium"),

    item("Conducción continua","Medio","¿Qué describe mejor la conducción continua en un axón no mielinizado?","El potencial se regenera sucesivamente a lo largo de segmentos contiguos de membrana.",[
      R("La señal salta de nodo a nodo porque todos los segmentos están cubiertos por mielina.","Eso describe conducción saltatoria en axones mielinizados."),
      R("El neurotransmisor difunde desde el soma hasta la terminal sin usar canales.","La conducción axonal no es difusión de neurotransmisor."),
      R("La bomba Na⁺/K⁺ genera cada espiga sin canales voltaje-dependientes.","La espiga requiere canales dependientes de voltaje." )],0,"La respuesta correcta es A. En axones no mielinizados, la despolarización activa zonas vecinas de forma continua, con regeneración secuencial del potencial de acción.",["No mielinizado = conducción continua.","Mielinizado = saltatoria.","Regeneración conserva amplitud."],"Conducción continua","conduccion_continua","comparison","application","medium"),

    item("Velocidad de conducción","Medio","¿Qué combinación aumenta de manera general la velocidad de conducción axonal?","Mayor mielinización y mayor diámetro axonal.",[
      R("Menor mielina y menor diámetro axonal.","Ambos factores tienden a enlentecer la conducción."),
      R("Ausencia de canales de Na⁺ en todos los nodos.","Sin canales de Na⁺ nodales no se regenera bien la señal."),
      R("Eliminación completa de gradientes iónicos.","Sin gradientes no hay excitabilidad normal." )],1,"La respuesta correcta es B. La mielina reduce fuga y el mayor diámetro reduce resistencia interna, facilitando propagación más rápida.",["Mielina acelera.","Mayor diámetro facilita conducción.","Nodos con Na⁺ son necesarios."],"Velocidad de conducción","velocidad_mielina_diametro","mechanism","application","medium"),

    item("Sinapsis eléctrica y química","Difícil","¿Cuál diferencia general entre sinapsis química y eléctrica es correcta?","La química usa neurotransmisores y receptores; la eléctrica transmite corriente directamente por uniones comunicantes.",[
      R("La química transmite electrones por mielina; la eléctrica depende de vesículas de Ca²⁺.","Invierte y mezcla mecanismos."),
      R("Ambas dependen exclusivamente de la bomba Na⁺/K⁺ para liberar neurotransmisor.","La bomba no es el mecanismo directo de ninguna de esas transmisiones."),
      R("La eléctrica siempre requiere hendidura amplia y difusión lenta de neurotransmisor.","Eso no describe la sinapsis eléctrica." )],2,"La respuesta correcta es C. La sinapsis química implica neurotransmisores, vesículas y receptores; la eléctrica permite paso directo de corriente entre células acopladas.",["Química = neurotransmisor.","Eléctrica = acoplamiento directo.","Ca²⁺ presináptico pertenece a química."],"Sinapsis química vs eléctrica","sinapsis_quimica_electrica","comparison","reasoning","hard"),

    item("Retardo sináptico","Difícil","¿Por qué la sinapsis química suele presentar un pequeño retardo sináptico?","Porque requiere entrada de Ca²⁺, fusión vesicular, difusión del neurotransmisor y activación de receptores.",[
      R("Porque el potencial de acción debe transformarse en electrones metálicos.","La señal biológica no se basa en electrones metálicos."),
      R("Porque la bomba Na⁺/K⁺ debe invertir todo el gradiente antes de cada sinapsis.","La bomba no invierte gradientes como paso de transmisión."),
      R("Porque la mielina impide toda comunicación entre neuronas.","La mielina no impide sinapsis ni explica el retardo químico." )],3,"La respuesta correcta es D. La transmisión química tiene pasos sucesivos: Ca²⁺ presináptico, exocitosis, difusión y unión a receptores, lo que genera un retardo breve.",["Química tiene pasos intermedios.","Ca²⁺ inicia exocitosis.","Receptor postsináptico completa señal."],"Retardo sináptico","retardo_sinaptico","mechanism","reasoning","hard"),

    item("Potencial postsináptico","Medio","¿Por qué los potenciales postsinápticos suelen considerarse graduados?","Porque su amplitud depende de la cantidad de neurotransmisor/receptores activados y pueden sumarse.",[
      R("Porque siempre son todo o nada y no pueden sumarse.","Eso describe mejor un potencial de acción."),
      R("Porque se regeneran automáticamente en cada nodo de Ranvier.","Los nodos se relacionan con propagación axonal, no con PSP típico."),
      R("Porque dependen únicamente de la bomba Na⁺/K⁺ y no de receptores.","Los PSP dependen de receptores postsinápticos y canales asociados." )],0,"La respuesta correcta es A. Los potenciales postsinápticos son locales, variables y sumables; pueden contribuir a alcanzar o alejar el umbral.",["PSP = graduado.","Puede sumarse.","Depende de receptor y conductancia."],"Potencial postsináptico graduado","psp_graduado","definition","application","medium"),

    item("EPSP","Medio","Un EPSP aumenta la probabilidad de disparo porque normalmente:","despolariza la membrana postsináptica y la acerca al umbral.",[
      R("hiperpolariza siempre la membrana por entrada de Cl⁻.","Eso describe un efecto inhibidor típico, no un EPSP."),
      R("inactiva permanentemente todos los canales de Na⁺.","Eso reduciría excitabilidad y no define un EPSP."),
      R("destruye la mielina para permitir conducción continua.","El EPSP postsináptico no destruye mielina." )],1,"La respuesta correcta es B. Un potencial postsináptico excitador produce una despolarización graduada que aproxima el segmento inicial al umbral.",["EPSP acerca al umbral.","IPSP aleja o estabiliza.","PSP son graduados."],"EPSP","epsp_acerca_umbral","definition","application","medium"),

    item("IPSP","Medio","Un IPSP disminuye la probabilidad de disparo porque normalmente:","hiperpolariza o estabiliza la membrana postsináptica, alejándola funcionalmente del umbral.",[
      R("abre canales de Na⁺ suficientes para generar una espiga.","Eso aumentaría excitación."),
      R("convierte un potencial de acción en neurotransmisor líquido.","No existe tal conversión fisiológica."),
      R("aumenta la amplitud de cada potencial de acción axonal.","Un IPSP postsináptico no aumenta la amplitud de espigas axonales individuales." )],2,"La respuesta correcta es C. Los IPSP reducen la excitabilidad postsináptica al hacer más difícil alcanzar el umbral.",["IPSP inhibe.","Puede implicar Cl⁻ o K⁺.","Reduce probabilidad de PA."],"IPSP","ipsp_aleja_umbral","definition","application","medium"),

    item("Cl⁻ y potencial de membrana","Difícil","¿Por qué el efecto del Cl⁻ depende del potencial de equilibrio del Cl⁻ y del contexto celular?","Porque el sentido y magnitud de su flujo dependen de gradiente electroquímico y permeabilidad.",[
      R("Porque el Cl⁻ siempre despolariza de forma intensa en toda neurona adulta.","No siempre despolariza; suele estabilizar o inhibir según el contexto."),
      R("Porque el Cl⁻ no tiene carga y no obedece fuerzas eléctricas.","El Cl⁻ es un anión y responde al campo eléctrico."),
      R("Porque el Cl⁻ se convierte en Na⁺ al atravesar la membrana.","Los iones no se convierten unos en otros." )],3,"La respuesta correcta es D. Como cualquier ion, el Cl⁻ se mueve según su gradiente electroquímico si existen canales; por eso su efecto depende de E_Cl y del voltaje de membrana.",["Cl⁻ es anión.","Su efecto depende de E_Cl.","Gradiente + permeabilidad determinan flujo."],"Cl⁻ contexto","cloro_contexto_ecl","mechanism","reasoning","hard"),

    item("Bomba Na⁺/K⁺","Difícil","Si la bomba Na⁺/K⁺ se inhibe de forma sostenida, ¿qué consecuencia progresiva se espera?","Pérdida gradual de los gradientes de Na⁺ y K⁺ necesarios para la excitabilidad.",[
      R("Aparición inmediata de potenciales de acción ilimitados por aumento de ATP.","La inhibición de la bomba no aumenta ATP ni genera disparo ilimitado."),
      R("Regeneración más rápida en nodos por creación de mielina nueva.","La bomba no crea mielina."),
      R("Liberación directa de neurotransmisor sin Ca²⁺ presináptico.","La exocitosis requiere Ca²⁺ y no se explica por inhibir la bomba." )],0,"La respuesta correcta es A. La bomba mantiene gradientes a largo plazo; si se inhibe, los gradientes se degradan progresivamente y falla la excitabilidad normal.",["Bomba mantiene gradientes.","Inhibición sostenida altera excitabilidad.","No confundir con fase rápida de la espiga."],"Inhibición de la bomba","inhibicion_bomba_gradientes","mechanism","reasoning","hard"),

    item("Consumo energético","Medio","¿Por qué el sistema nervioso requiere energía aunque el potencial de acción dependa de canales pasivos durante sus fases rápidas?","Porque se necesita ATP para mantener gradientes iónicos mediante bombas y transportadores a largo plazo.",[
      R("Porque los electrones deben acelerarse dentro del axón como en un cable metálico.","La señal neuronal no se basa en electrones metálicos."),
      R("Porque cada canal de fuga consume ATP para dejar pasar K⁺.","Un canal de fuga permite flujo pasivo y no bombea ATP por cada ion."),
      R("Porque la mielina se reconstruye completamente tras cada espiga.","La mielina no se reconstruye tras cada potencial de acción." )],1,"La respuesta correcta es B. Las fases rápidas son flujos según gradientes, pero esos gradientes se mantienen con procesos activos que consumen ATP.",["Canales rápidos aprovechan gradientes.","Bombas mantienen gradientes con ATP.","Energía sostiene excitabilidad a largo plazo."],"Energía y excitabilidad","energia_gradientes","mechanism","application","medium"),

    item("Microcambios iónicos","Difícil","¿Por qué un potencial de acción puede modificar mucho el voltaje sin cambiar de forma masiva las concentraciones globales de Na⁺ y K⁺?","Porque pequeños desplazamientos de carga cerca de la membrana bastan para cambiar el potencial transmembrana.",[
      R("Porque todos los iones del citoplasma se vacían durante cada espiga.","Una espiga normal no vacía los compartimentos iónicos."),
      R("Porque el voltaje no depende de cargas sino de glucosa.","El voltaje transmembrana depende de separación de cargas."),
      R("Porque la membrana deja de existir durante el pico.","La membrana permanece como barrera capacitiva." )],2,"La respuesta correcta es C. La membrana actúa como capacitor biológico: pequeños movimientos iónicos en su vecindad modifican el voltaje sin grandes cambios en concentraciones totales.",["Pequeña carga, gran cambio de Vm.","Concentraciones globales cambian poco.","Membrana = capacitor."],"Microcambios iónicos","microcambios_vm","mechanism","reasoning","hard"),

    item("Lectura de caso fisiológico","Difícil","Un axón tiene potencial de reposo normal, pero al estimularlo no logra una fase ascendente adecuada. ¿Qué alteración encaja mejor?","Disminución de disponibilidad o función de canales de Na⁺ dependientes de voltaje.",[
      R("Aumento aislado de canales de fuga de K⁺ en reposo sin afectar Na⁺.","Podría modificar excitabilidad, pero la fase ascendente inadecuada apunta más directamente a Na⁺."),
      R("Aumento de Ca²⁺ presináptico después de la llegada del potencial.","Eso afecta liberación, no la fase ascendente axonal primaria."),
      R("Mayor cantidad de neurotransmisor en la hendidura sináptica.","El problema descrito está en la espiga axonal, no en receptor postsináptico." )],3,"La respuesta correcta es D. La fase ascendente depende de entrada rápida de Na⁺; si no aparece adecuadamente, debe pensarse en canales de Na⁺.",["Fase ascendente = Na⁺.","Ca²⁺ = terminal presináptica.","K⁺ = reposo/repolarización."],"Fallo de fase ascendente","fallo_upstroke_na","clinical_application","reasoning","hard"),

    item("Lectura de caso fisiológico","Difícil","Una señal local en dendritas se atenúa antes de llegar al segmento inicial. ¿Qué concepto explica mejor este fenómeno?","Propagación decremental de un potencial graduado.",[
      R("Propagación regenerativa de un potencial de acción.","La regeneración evita pérdida de amplitud."),
      R("Conducción saltatoria entre nodos de Ranvier.","La señal dendrítica local no es conducción saltatoria nodal."),
      R("Entrada presináptica de Ca²⁺ para exocitosis.","La atenuación dendrítica no se explica por Ca²⁺ presináptico." )],0,"La respuesta correcta es A. Los potenciales graduados son locales y decrementales, por eso pueden atenuarse antes de alcanzar el segmento inicial.",["Dendrita = potencial graduado frecuente.","Graduado se atenúa.","PA se regenera."],"Atenuación dendrítica","atenuacion_graduado","clinical_application","reasoning","hard"),

    item("Lectura de caso fisiológico","Difícil","Una neurona recibe muchos EPSP simultáneos desde varias dendritas y dispara un potencial de acción. ¿Qué proceso lo explica?","Sumación espacial que alcanza el umbral en el segmento inicial.",[
      R("Sumación temporal de un único estímulo repetido en el mismo punto.","El enunciado menciona varias dendritas simultáneas, lo que corresponde a espacial."),
      R("Refractario absoluto por inactivación de Na⁺.","El refractario absoluto impediría disparar."),
      R("Hiperpolarización por salida prolongada de K⁺.","La hiperpolarización aleja del disparo, no lo explica." )],1,"La respuesta correcta es B. Varias entradas excitadoras simultáneas en lugares distintos se integran espacialmente y pueden llevar al segmento inicial al umbral.",["Varias regiones = espacial.","Repetición temporal = temporal.","Umbral en segmento inicial decide."],"Sumación espacial clínica","caso_sumacion_espacial","clinical_application","reasoning","hard"),

    item("Lectura de caso fisiológico","Difícil","Un estímulo repetido rápidamente en una misma sinapsis permite alcanzar el umbral. ¿Qué proceso lo explica mejor?","Sumación temporal de potenciales postsinápticos excitadores.",[
      R("Sumación espacial por activación de muchas dendritas distintas.","El enunciado dice una misma sinapsis repetida, no varias regiones."),
      R("Conducción saltatoria por mielina.","La conducción saltatoria no explica suma de EPSP en una sinapsis."),
      R("Inactivación irreversible de canales de Na⁺.","La inactivación irreversible impediría disparo normal." )],2,"La respuesta correcta es C. Estímulos sucesivos cercanos en el tiempo pueden superponerse antes de disiparse y alcanzar el umbral.",["Misma sinapsis repetida = temporal.","Varias sinapsis = espacial.","La suma puede disparar PA."],"Sumación temporal clínica","caso_sumacion_temporal","clinical_application","reasoning","hard"),

    item("Lectura de caso fisiológico","Difícil","Un estímulo fuerte produce más potenciales de acción por segundo, pero cada espiga individual mantiene amplitud similar. ¿Qué principio se ilustra?","Codificación de intensidad por frecuencia de disparo.",[
      R("Codificación por aumento ilimitado de amplitud individual.","El enunciado dice que la amplitud se mantiene similar."),
      R("Pérdida de la ley del todo o nada.","La amplitud constante conserva la lógica todo o nada."),
      R("Conversión de potenciales de acción en potenciales graduados.","El aumento de frecuencia no convierte PA en graduados." )],3,"La respuesta correcta es D. La intensidad suprumbral suele representarse con mayor frecuencia de descarga, no con grandes cambios de amplitud de cada potencial.",["Más intensidad = más frecuencia.","PA individual = amplitud estable.","Refractario limita frecuencia máxima."],"Codificación por frecuencia clínica","caso_codificacion_frecuencia","clinical_application","reasoning","hard"),

    item("Diferencial de mecanismo","Examen","¿Cuál opción contiene una relación causa → efecto correcta?","Bloqueo de Na⁺ voltaje-dependiente → disminución de la fase ascendente.",[
      R("Bloqueo de Ca²⁺ presináptico → aumento de exocitosis.","Bloquear Ca²⁺ reduce exocitosis."),
      R("Apertura prolongada de K⁺ → despolarización rápida.","K⁺ prolongado favorece repolarización/hiperpolarización."),
      R("Entrada de Cl⁻ → fase ascendente positiva clásica.","Cl⁻ suele estabilizar o inhibir, no generar la fase ascendente neuronal clásica." )],0,"La respuesta correcta es A. La fase ascendente rápida depende de canales de Na⁺; bloquearlos reduce o impide esa fase.",["Na⁺ bloqueado = menos upstroke.","Ca²⁺ bloqueado = menos liberación.","K⁺ abierto = más negatividad."],"Causa-efecto neurofisiológico","causa_efecto_canales","exam_trap","reasoning","hard"),

    item("Diferencial de mecanismo","Examen","¿Cuál opción contiene una relación causa → efecto correcta?","Entrada de Ca²⁺ presináptico → fusión vesicular y liberación de neurotransmisor.",[
      R("Entrada de Na⁺ axonal → fusión vesicular directa.","Na⁺ conduce la espiga, pero la fusión vesicular depende de Ca²⁺."),
      R("Salida de K⁺ → apertura directa de receptores postsinápticos.","La salida de K⁺ repolariza; no abre directamente receptores postsinápticos."),
      R("Mielina → síntesis de neurotransmisor en la hendidura.","La mielina aísla axones y no sintetiza neurotransmisor en la hendidura." )],1,"La respuesta correcta es B. La entrada de Ca²⁺ en la terminal presináptica es el paso clave para la exocitosis de vesículas sinápticas.",["Ca²⁺ = exocitosis.","Na⁺ = conducción.","Mielina = aislamiento."],"Causa-efecto sináptico","causa_efecto_ca_sinapsis","exam_trap","reasoning","hard"),

    item("Diferencial de mecanismo","Examen","¿Cuál opción contiene una relación causa → efecto correcta?","Desmielinización → mayor fuga de corriente y conducción más lenta o insegura.",[
      R("Desmielinización → mayor aislamiento y conducción más rápida.","La desmielinización reduce aislamiento."),
      R("Mielina intacta → desaparición de canales de Na⁺ nodales.","La conducción saltatoria requiere canales de Na⁺ en nodos."),
      R("Nodo de Ranvier → liberación obligatoria de neurotransmisor.","El nodo regenera potencial de acción; no es terminal sináptica." )],2,"La respuesta correcta es C. La mielina permite propagación rápida con poca fuga; perderla compromete la llegada efectiva de corriente al nodo siguiente.",["Mielina aísla.","Desmielinización = fuga.","Nodo regenera PA."],"Causa-efecto mielina","causa_efecto_mielina","exam_trap","reasoning","hard"),

    item("Diferencial de mecanismo","Examen","¿Cuál opción contiene una relación causa → efecto correcta?","Apertura de canales de K⁺ → repolarización o hiperpolarización según duración.",[
      R("Apertura de K⁺ → fase ascendente rápida por entrada de Na⁺.","La apertura de K⁺ no implica entrada de Na⁺."),
      R("Apertura de K⁺ → liberación directa de neurotransmisor.","La liberación directa depende de Ca²⁺ presináptico."),
      R("Apertura de K⁺ → desaparición instantánea de gradientes.","Una apertura de K⁺ no elimina instantáneamente todos los gradientes." )],3,"La respuesta correcta es D. Cuando K⁺ sale, el interior pierde carga positiva y se hace más negativo; esto repolariza o, si persiste, hiperpolariza.",["K⁺ sale = baja Vm.","K⁺ prolongado = hiperpolarización.","No confundir con Na⁺."],"Causa-efecto K⁺","causa_efecto_k","exam_trap","reasoning","hard"),

    item("Síntesis de algoritmo","Examen","Ante una pregunta sobre “ascenso rápido de la curva”, ¿qué asociación debe elegirse primero?","Entrada de Na⁺ por canales dependientes de voltaje.",[
      R("Salida de K⁺ por canales retardados.","La salida de K⁺ corresponde al descenso."),
      R("Entrada de Cl⁻ por receptor inhibidor.","La entrada de Cl⁻ no explica el ascenso rápido clásico."),
      R("Entrada de Ca²⁺ presináptico para exocitosis.","Ca²⁺ presináptico es sinapsis, no ascenso axonal clásico." )],0,"La respuesta correcta es A. En el algoritmo de examen, ascenso rápido equivale a despolarización por entrada de Na⁺.",["Ascenso = Na⁺.","Descenso = K⁺.","Ca²⁺ = sinapsis/meseta según contexto."],"Algoritmo ascenso","algoritmo_ascenso_na","pattern_recognition","reasoning","hard"),

    item("Síntesis de algoritmo","Examen","Ante una pregunta sobre “descenso de la curva después del pico”, ¿qué asociación debe elegirse primero?","Salida de K⁺ por canales dependientes de voltaje.",[
      R("Entrada de Na⁺ por canales recién activados.","Entrada de Na⁺ se asocia a ascenso, no descenso."),
      R("Entrada de Ca²⁺ presináptico.","Ca²⁺ presináptico se asocia a liberación de neurotransmisor."),
      R("Apertura de receptores de glucosa en el axón.","No existe ese mecanismo como fase del PA." )],1,"La respuesta correcta es B. El descenso de la curva corresponde a repolarización por salida de K⁺, junto con inactivación de Na⁺.",["Descenso = K⁺ sale.","Na⁺ se inactiva en el pico.","Glucosa no dibuja la curva."],"Algoritmo descenso","algoritmo_descenso_k","pattern_recognition","reasoning","hard"),

    item("Síntesis de algoritmo","Examen","Ante una pregunta sobre “debajo del reposo antes de volver a -70 mV”, ¿qué asociación debe elegirse primero?","Hiperpolarización por persistencia de la salida de K⁺.",[
      R("Nueva despolarización por entrada de Na⁺.","Na⁺ llevaría hacia valores positivos, no por debajo del reposo."),
      R("Liberación de neurotransmisor por Ca²⁺.","La liberación sináptica no es la fase por debajo del reposo en la curva axonal."),
      R("Bomba Na⁺/K⁺ apagada de forma irreversible.","La hiperpolarización fisiológica no se debe a apagado irreversible de la bomba." )],2,"La respuesta correcta es C. Debajo del reposo corresponde a hiperpolarización, típicamente por canales de K⁺ que permanecen abiertos transitoriamente.",["Debajo de reposo = hiperpolarización.","K⁺ sigue saliendo.","Luego se recupera Vm."],"Algoritmo hiperpolarización","algoritmo_hiperpolarizacion_k","pattern_recognition","reasoning","hard"),

    item("Síntesis de algoritmo","Examen","Ante una pregunta sobre “no puede disparar aunque el estímulo sea intenso”, ¿qué asociación debe elegirse primero?","Período refractario absoluto por inactivación de canales de Na⁺.",[
      R("Período refractario relativo.","En el relativo sí puede disparar con estímulo mayor."),
      R("Potencial graduado excitador.","Un potencial graduado no define imposibilidad absoluta de disparo."),
      R("Conducción saltatoria normal.","La conducción saltatoria no describe ese estado de inexcitabilidad." )],3,"La respuesta correcta es D. La frase clave “no puede disparar aunque el estímulo sea intenso” identifica el refractario absoluto.",["Absoluto = imposible.","Relativo = posible con estímulo mayor.","Na⁺ inactivado explica el absoluto."],"Algoritmo refractario absoluto","algoritmo_refractario_absoluto","pattern_recognition","reasoning","hard"),

    item("Síntesis final","Examen","¿Cuál conjunto de asociaciones evita las confusiones más frecuentes del módulo?","Na⁺: despolarización rápida; K⁺: repolarización/hiperpolarización; Ca²⁺: liberación sináptica; Cl⁻: inhibición frecuente.",[
      R("Na⁺: repolarización; K⁺: liberación sináptica; Ca²⁺: reposo principal; Cl⁻: fase ascendente.","Invierte las funciones iónicas centrales."),
      R("Na⁺: mielina; K⁺: glucosa; Ca²⁺: electrones; Cl⁻: bomba Na⁺/K⁺.","Asocia iones con estructuras o conceptos no fisiológicos."),
      R("Na⁺: salida en reposo; K⁺: entrada rápida; Ca²⁺: hiperpolarización; Cl⁻: exocitosis.","Invierte dirección y función de los principales iones." )],0,"La respuesta correcta es A. Resume el mapa iónico útil para examen: Na⁺ sube la curva, K⁺ la baja, Ca²⁺ libera neurotransmisor y Cl⁻ suele inhibir o estabilizar.",["Na⁺ sube.","K⁺ baja.","Ca²⁺ libera; Cl⁻ inhibe."],"Mapa iónico final","mapa_ionico_final","summary","reasoning","hard"),

    item("Síntesis final","Examen","¿Cuál frase resume mejor el módulo de potencial de acción?","La excitabilidad surge de gradientes iónicos mantenidos, una membrana selectiva y canales que cambian la permeabilidad en el tiempo.",[
      R("La excitabilidad se explica por electrones que circulan libremente por el axón.","La electricidad biológica depende de iones transmembrana."),
      R("La excitabilidad no requiere gradientes porque todos los iones atraviesan la bicapa libremente.","Sin gradientes y selectividad no se mantiene el potencial."),
      R("La excitabilidad depende solo de glucosa y no de canales iónicos.","La glucosa sostiene metabolismo, pero la señal inmediata es iónica." )],1,"La respuesta correcta es B. El módulo se organiza alrededor de tres ideas: gradientes, membrana selectiva y cambios de permeabilidad por canales.",["Gradientes almacenan energía electroquímica.","Membrana separa cargas.","Canales generan cambios rápidos de Vm."],"Síntesis del módulo","sintesis_modulo_pa","summary","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.qcm, 100+i, items[i]);

  ROOT.fisiologiaQualityPatchV318 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 101-140",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:40,
    notes:"Replaces QCM 101-140 with a 40-item advanced batch: electrochemical reasoning, clinical physiology applications, synaptic integration, refractory logic, graph algorithms and final ion maps."
  };
})();
