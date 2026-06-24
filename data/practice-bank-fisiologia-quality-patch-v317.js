/* v317 — Fisiología quality patch, Módulo 1 QCM 061–100.
   Scope: replaces QCM 061–100 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v317-m1-qcm-061-100";

  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function place(correct, wrongs, answerIndex){
    var options = [];
    var whyWrong = [];
    var distractorExplanations = [];
    var wi = 0;
    for(var i=0;i<4;i++){
      if(i === answerIndex){
        options.push(correct);
        whyWrong.push(null);
        distractorExplanations.push(null);
      }else{
        options.push(wrongs[wi].text);
        whyWrong.push("Falsa. " + wrongs[wi].why);
        distractorExplanations.push(wrongs[wi].why);
        wi++;
      }
    }
    return {options:options, whyWrong:whyWrong, distractorExplanations:distractorExplanations};
  }
  function M(heading,difficulty,question,correct,wrongs,answerIndex,explanation,keyPoints,topic,slug,skill,level,diff){
    var p = place(correct, wrongs, answerIndex);
    return {
      auditDecision:"B",
      heading:heading,
      difficulty:difficulty,
      question:question,
      options:p.options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:p.whyWrong,
      distractorExplanations:p.distractorExplanations,
      keyPoints:keyPoints,
      tags:{subject:"fisiologia",moduleNumber:1,format:"qcm",topic:topic,topicSlug:slug,skill:skill,cognitiveLevel:level,difficulty:diff,visible:false,adaptiveVersion:"v317"}
    };
  }
  function R(t,w){ return {text:t,why:w}; }
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
    arr[hits[index].i] = merged;
    return true;
  }

  var items = [
    M("Canales de Na⁺","Difícil","Un bloqueo farmacológico selectivo de canales de Na⁺ dependientes de voltaje afectaría primero qué fase del potencial de acción neuronal?","La fase ascendente rápida por disminución de la entrada de Na⁺.",[
      R("La hiperpolarización por aumento de la salida de K⁺.","La hiperpolarización depende sobre todo de conductancia persistente al K⁺, no de entrada de Na⁺."),
      R("La liberación de neurotransmisor por entrada de Ca²⁺.","La exocitosis sináptica depende de Ca²⁺ presináptico y es un paso posterior a la conducción axonal."),
      R("El mantenimiento crónico de los gradientes por la bomba Na⁺/K⁺.","La bomba mantiene gradientes, pero no es la fase rápida bloqueada por impedir canales de Na⁺.")],0,"La respuesta correcta es A. La despolarización rápida requiere apertura de canales de Na⁺ dependientes de voltaje; si se bloquean, disminuye la fase ascendente y puede fallar la conducción.",["Na⁺ entra en la fase ascendente.","Bloquear Na⁺ reduce conducción.","Ca²⁺ pertenece a la liberación sináptica."],"Bloqueo de Na⁺","bloqueo_na_fase_ascendente","clinical_application","reasoning","hard"),

    M("Canales de K⁺","Medio","Si los canales de K⁺ dependientes de voltaje permanecen abiertos más tiempo de lo habitual, ¿qué efecto es más probable?","Una hiperpolarización más marcada o prolongada después de la repolarización.",[
      R("Una fase ascendente más rápida por entrada de Na⁺.","La fase ascendente depende de Na⁺, no de prolongación de canales de K⁺."),
      R("Una liberación vesicular directa en la hendidura sináptica.","La liberación vesicular depende de Ca²⁺ presináptico, no de K⁺ axonal prolongado."),
      R("Una eliminación completa del período refractario absoluto.","La refractariedad absoluta se relaciona con inactivación de Na⁺ y no desaparece por K⁺ prolongado.")],1,"La respuesta correcta es B. Si la conductancia al K⁺ permanece elevada, el K⁺ sigue saliendo y el potencial se acerca más a E_K, generando hiperpolarización.",["K⁺ prolongado hiperpolariza.","Na⁺ sube la curva.","K⁺ baja y puede pasar del reposo."],"Canales de K⁺ prolongados","k_prolongado_hiperpolarizacion","mechanism","application","medium"),

    M("Potencial de reposo","Difícil","Una disminución importante de la permeabilidad de reposo al K⁺ tendería a producir qué cambio en el potencial de membrana?","El potencial de membrana se alejaría de E_K y sería menos negativo.",[
      R("El potencial se haría exactamente igual a E_K.","Para acercarse a E_K debe predominar la permeabilidad al K⁺, no disminuir."),
      R("La fase ascendente dependería exclusivamente de Cl⁻.","La fase ascendente neuronal clásica depende de Na⁺, no de Cl⁻."),
      R("La bomba Na⁺/K⁺ invertiría su estequiometría.","La bomba no invierte su relación 3 Na⁺ fuera/2 K⁺ dentro por menor permeabilidad de K⁺.")],2,"La respuesta correcta es C. El reposo se acerca a E_K porque la membrana es más permeable al K⁺. Si esa permeabilidad baja, Vm se aleja de E_K y se vuelve menos negativo.",["Reposo depende mucho de K⁺.","Menos permeabilidad al K⁺ = menos cercanía a E_K.","Permeabilidad y gradiente no son sinónimos."],"Permeabilidad de reposo al K⁺","permeabilidad_reposo_k","mechanism","reasoning","hard"),

    M("Gradiente electroquímico","Medio","Un ion tiene un fuerte gradiente electroquímico, pero la membrana es casi impermeable a ese ion. ¿Qué ocurrirá de forma inmediata?","Habrá poco flujo de ese ion hasta que aumente la permeabilidad mediante canales o transportadores.",[
      R("El ion cruzará masivamente la bicapa aunque no haya canales.","Los iones no atraviesan libremente la bicapa lipídica por su carga."),
      R("El gradiente desaparecerá automáticamente sin movimiento iónico.","Un gradiente no desaparece por sí solo si no hay vía efectiva de flujo."),
      R("La bomba Na⁺/K⁺ se convertirá en canal pasivo para ese ion.","La bomba conserva su mecanismo activo y no se transforma en canal pasivo inespecífico.")],3,"La respuesta correcta es D. El gradiente es fuerza impulsora, pero la permeabilidad es la vía que permite el flujo. Sin permeabilidad suficiente, el movimiento real es limitado.",["Gradiente empuja.","Permeabilidad permite.","Canales traducen gradiente en corriente."],"Gradiente y permeabilidad","gradiente_sin_permeabilidad","mechanism","application","medium"),

    M("Umbral","Base","¿Qué condición define mejor que una despolarización local alcanzó el umbral?","La apertura de suficientes canales de Na⁺ dependientes de voltaje para iniciar una retroalimentación positiva.",[
      R("La entrada de Cl⁻ hasta hacer más negativo el interior.","Eso aleja la membrana del disparo excitador típico."),
      R("La detención completa de la bomba Na⁺/K⁺ ATPasa.","El umbral no requiere apagar la bomba."),
      R("La salida de neurotransmisor desde dendritas postsinápticas.","La liberación sináptica ocurre en terminales presinápticas y no define el umbral axonal.")],0,"La respuesta correcta es A. El umbral es el punto crítico en el cual se abren suficientes canales de Na⁺ para iniciar el potencial de acción todo o nada.",["Umbral ≈ -55 mV.","Na⁺ abre por voltaje.","Retroalimentación positiva genera la espiga."],"Umbral y Na⁺","umbral_apertura_na","definition","recall","basic"),

    M("Potencial graduado","Medio","¿Por qué un potencial graduado puede representar la intensidad de un estímulo de manera más directa que una espiga individual?","Porque su amplitud varía con la intensidad local del estímulo.",[
      R("Porque siempre tiene la misma amplitud si alcanza el umbral.","Eso describe el potencial de acción, no el potencial graduado."),
      R("Porque se regenera sin atenuación a lo largo del axón.","El potencial graduado se atenúa; la regeneración es propiedad del potencial de acción."),
      R("Porque depende exclusivamente de la bomba Na⁺/K⁺.","La bomba mantiene gradientes; no codifica directamente la amplitud graduada.")],1,"La respuesta correcta es B. Los potenciales graduados cambian de amplitud según la intensidad del estímulo, pueden sumarse y se atenúan con la distancia.",["Graduado = variable.","Puede sumarse.","Se atenúa con distancia."],"Potenciales graduados","graduado_intensidad","comparison","application","medium"),

    M("Sumación temporal","Medio","¿Qué describe mejor la sumación temporal de potenciales graduados?","Varios estímulos sucesivos en una misma zona se superponen en el tiempo y aumentan la despolarización neta.",[
      R("Varios estímulos simultáneos llegan desde sitios diferentes de la membrana.","Eso describe mejor la sumación espacial."),
      R("Un único potencial de acción aumenta mucho su amplitud con el tiempo.","El potencial de acción individual es todo o nada y no aumenta mucho su amplitud."),
      R("La mielina regenera la señal en cada internodo.","La conducción saltatoria no define la sumación temporal postsináptica.")],2,"La respuesta correcta es C. En la sumación temporal, estímulos repetidos próximos en el tiempo se superponen antes de que el potencial local desaparezca.",["Temporal = repetidos en el tiempo.","Espacial = varios sitios.","La suma puede alcanzar umbral."],"Sumación temporal","sumacion_temporal","mechanism","application","medium"),

    M("Sumación espacial","Medio","¿Qué describe mejor la sumación espacial en una neurona?","Potenciales graduados originados en diferentes regiones se integran en el segmento inicial.",[
      R("Un solo estímulo repetido muchas veces en el mismo receptor sin participación de otras sinapsis.","Eso se aproxima más a sumación temporal."),
      R("La salida de K⁺ durante la fase descendente del potencial de acción.","Eso describe repolarización, no integración sináptica espacial."),
      R("La entrada de Ca²⁺ en una terminal presináptica para liberar neurotransmisor.","Eso es transmisión sináptica presináptica, no suma espacial postsináptica." )],3,"La respuesta correcta es D. En la sumación espacial, señales de varias regiones dendríticas o somáticas se combinan y pueden llevar el segmento inicial al umbral.",["Espacial = varios lugares.","Temporal = varios momentos.","Ambas modifican probabilidad de disparo."],"Sumación espacial","sumacion_espacial","mechanism","application","medium"),

    M("Refractario absoluto","Examen","¿Cuál afirmación permite distinguir de forma segura el refractario absoluto del relativo?","En el absoluto no se genera un nuevo potencial de acción aunque el estímulo sea intenso.",[
      R("En el absoluto se genera una espiga si el estímulo es mayor de lo normal.","Eso corresponde al período refractario relativo."),
      R("En el relativo todos los canales de Na⁺ están inactivados sin posibilidad de recuperación.","En el relativo parte de los canales ya se recuperó."),
      R("Ambos períodos significan que la bomba Na⁺/K⁺ se apagó por falta de ATP.","La refractariedad fisiológica se explica por estados de canales, no por apagado de la bomba." )],0,"La respuesta correcta es A. El período refractario absoluto se debe a inactivación crítica de canales de Na⁺ y no se supera con un estímulo más fuerte.",["Absoluto = imposible.","Relativo = posible con estímulo mayor.","Na⁺ inactivado explica el absoluto."],"Refractario absoluto vs relativo","absoluto_vs_relativo","exam_trap","reasoning","hard"),

    M("Refractario relativo","Examen","Durante el refractario relativo se requiere un estímulo más fuerte principalmente porque:","la membrana puede estar hiperpolarizada y algunos canales de Na⁺ aún no se recuperaron completamente.",[
      R("todos los canales de Na⁺ permanecen abiertos de forma sostenida.","Los canales de Na⁺ no permanecen todos abiertos; se recuperan de la inactivación."),
      R("la bomba Na⁺/K⁺ invierte su dirección y expulsa K⁺.","La bomba no invierte su dirección fisiológica."),
      R("la mielina impide todo cambio de voltaje en el axón.","La mielina acelera conducción; no explica el estímulo mayor del refractario relativo." )],1,"La respuesta correcta es B. En el refractario relativo todavía puede existir hiperpolarización por K⁺ y recuperación incompleta de Na⁺; por eso cuesta más alcanzar el umbral.",["Relativo = umbral funcional más difícil.","K⁺ prolongado contribuye.","Na⁺ se recupera progresivamente."],"Refractario relativo","refractario_relativo_estimulo_mayor","mechanism","reasoning","hard"),

    M("Lectura de curva","Base","En la curva clásica del potencial de acción, ¿qué fase coincide mejor con la inactivación de canales de Na⁺?","El pico o final de la fase ascendente, antes de que predomine la salida de K⁺.",[
      R("El reposo estable antes de cualquier estímulo.","En reposo los canales de Na⁺ están principalmente cerrados disponibles, no inactivados en masa."),
      R("La fase de potencial graduado subumbral en dendritas.","La inactivación crítica de Na⁺ se vincula con la espiga axonal."),
      R("La entrada de Ca²⁺ en la terminal presináptica.","La entrada de Ca²⁺ es evento sináptico, no el pico de la curva axonal." )],2,"La respuesta correcta es C. En el pico, los canales de Na⁺ comienzan a inactivarse y la salida de K⁺ favorece la repolarización.",["Pico = Na⁺ se inactiva.","Descenso = K⁺ sale.","Reposo = K⁺ de fuga predomina."],"Pico e inactivación","pico_inactivacion_na","graph_interpretation","recall","basic"),

    M("Lectura de curva","Base","¿Qué fase de la curva se identifica por una caída del potencial hacia valores más negativos después del pico?","Repolarización por salida de K⁺.",[
      R("Despolarización por entrada de Na⁺.","La entrada de Na⁺ produce la subida, no la caída."),
      R("Umbral por apertura inicial de Na⁺.","El umbral precede a la fase ascendente y no es la caída."),
      R("Liberación de neurotransmisor por Ca²⁺.","La liberación sináptica no es la fase descendente de la curva axonal." )],3,"La respuesta correcta es D. La repolarización ocurre cuando el K⁺ sale por canales dependientes de voltaje y el interior vuelve hacia valores negativos.",["Descenso = K⁺ sale.","Ascenso = Na⁺ entra.","No confundir curva axonal con sinapsis."],"Repolarización en gráfica","grafica_repolarizacion","graph_interpretation","recall","basic"),

    M("Conducción saltatoria","Medio","¿Por qué la conducción saltatoria consume menos intercambio iónico transmembrana que la conducción continua?","Porque la regeneración activa se concentra en los nodos y no en toda la membrana axonal.",[
      R("Porque no utiliza canales de Na⁺ en ningún punto del axón.","Los nodos sí tienen canales de Na⁺ para regenerar la señal."),
      R("Porque la mielina libera ATP directamente en cada internodo.","La mielina funciona como aislante, no como fuente directa de ATP."),
      R("Porque el potencial se transforma en una señal química dentro de la vaina.","La conducción bajo la mielina sigue siendo eléctrica pasiva, no química." )],0,"La respuesta correcta es A. En axones mielinizados, la señal se regenera principalmente en nodos de Ranvier; esto reduce pérdidas y aumenta eficiencia.",["Nodos regeneran.","Internodos aíslan.","Mielina aumenta velocidad y eficiencia."],"Eficiencia de la conducción saltatoria","conduccion_saltatoria_eficiencia","mechanism","application","medium"),

    M("Mielina","Difícil","En una fibra mielinizada, ¿qué consecuencia tendría una reducción marcada de la resistencia de membrana en el internodo?","Más fuga de corriente y menor seguridad para alcanzar el siguiente nodo.",[
      R("Mayor aislamiento eléctrico y conducción más rápida.","Disminuir resistencia aumenta fuga, no aislamiento."),
      R("Mayor liberación de neurotransmisor en el internodo.","Los internodos no son terminales presinápticas principales."),
      R("Conversión del potencial de acción en potencial graduado somático.","La alteración internodal no convierte la señal axonal en señal somática." )],1,"La respuesta correcta es B. La mielina aumenta la resistencia de membrana internodal; si esa resistencia baja, se pierde más corriente y la conducción puede fallar.",["Mielina aumenta aislamiento.","Menos resistencia internodal = más fuga.","La señal debe alcanzar el nodo siguiente."],"Resistencia internodal","resistencia_internodal","mechanism","reasoning","hard"),

    M("Neurotransmisión","Medio","¿Qué secuencia de eventos describe mejor la transmisión química sináptica?","Llega el potencial de acción → entra Ca²⁺ presináptico → se fusionan vesículas → el neurotransmisor activa receptores postsinápticos.",[
      R("Entra Na⁺ en el núcleo → se libera mielina → se abren bombas postsinápticas.","Mezcla estructuras sin relación con la secuencia sináptica."),
      R("Sale K⁺ de la dendrita → desaparece la hendidura → se bloquean receptores.","No describe la exocitosis presináptica ni la recepción postsináptica."),
      R("Entra Cl⁻ en la terminal → se forma ATP → nace el potencial de reposo.","La transmisión química no se inicia por Cl⁻ como evento principal ni forma el reposo." )],2,"La respuesta correcta es C. En la sinapsis química, el potencial de acción abre canales de Ca²⁺ presinápticos; el Ca²⁺ permite fusión vesicular y el neurotransmisor actúa en receptores postsinápticos.",["PA llega a terminal.","Ca²⁺ entra.","Neurotransmisor activa receptor postsináptico."],"Secuencia sináptica","secuencia_sinaptica","mechanism","application","medium"),

    M("Sinapsis","Base","¿Qué ion es más directamente responsable de desencadenar la exocitosis de vesículas sinápticas?","Ca²⁺.",[
      R("Na⁺.","Na⁺ conduce la espiga axonal, pero la exocitosis depende de Ca²⁺."),
      R("K⁺.","K⁺ participa en reposo/repolarización, no desencadena directamente la exocitosis vesicular."),
      R("Cl⁻.","Cl⁻ suele participar en inhibición postsináptica, no en exocitosis presináptica." )],3,"La respuesta correcta es D. La entrada de Ca²⁺ en la terminal presináptica es la señal inmediata para la fusión vesicular y liberación de neurotransmisor.",["Ca²⁺ presináptico = exocitosis.","Na⁺ = conducción axonal.","K⁺ = repolarización."],"Ca²⁺ y exocitosis","calcio_exocitosis","recall","recall","basic"),

    M("Receptores postsinápticos","Difícil","Un receptor postsináptico que abre canales de Cl⁻ tiende a producir qué efecto funcional?","Disminuir la probabilidad de disparo postsináptico por estabilización o hiperpolarización relativa.",[
      R("Iniciar siempre la fase ascendente rápida del potencial de acción.","La fase ascendente rápida depende de Na⁺."),
      R("Aumentar la liberación de neurotransmisor presináptico por entrada de Ca²⁺.","El receptor postsináptico de Cl⁻ no es el canal presináptico de Ca²⁺."),
      R("Eliminar por completo el potencial de reposo de la neurona.","Abrir Cl⁻ no elimina necesariamente el reposo; modifica excitabilidad." )],0,"La respuesta correcta es A. La entrada de Cl⁻ suele hacer la membrana menos propensa a alcanzar el umbral, por lo que actúa como mecanismo inhibidor o estabilizador.",["Cl⁻ suele inhibir.","IPSP reduce disparo.","Na⁺ explica fase ascendente."],"Receptor de Cl⁻","receptor_cloro_inhibidor","mechanism","reasoning","hard"),

    M("Codificación nerviosa","Medio","¿Qué mecanismo permite a una neurona señalar que un estímulo persistente es más intenso sin aumentar mucho la amplitud de cada espiga?","Aumentar la frecuencia de potenciales de acción.",[
      R("Aumentar sin límite el pico de cada espiga.","La espiga individual mantiene amplitud relativamente constante."),
      R("Eliminar los períodos refractarios.","Los períodos refractarios limitan fisiológicamente la frecuencia y no desaparecen."),
      R("Convertir cada potencial de acción en un potencial graduado.","El potencial de acción no se vuelve graduado por mayor intensidad." )],1,"La respuesta correcta es B. La intensidad del estímulo suele codificarse por frecuencia de descarga, no por incremento proporcional de amplitud de cada potencial de acción.",["Más intensidad = más frecuencia.","PA individual todo o nada.","Refractario limita la frecuencia máxima."],"Frecuencia de descarga","frecuencia_descarga","mechanism","application","medium"),

    M("Codificación nerviosa","Difícil","¿Por qué el período refractario impone un límite fisiológico a la frecuencia de potenciales de acción?","Porque los canales de Na⁺ necesitan recuperarse de la inactivación antes de disparar de nuevo.",[
      R("Porque la mielina se consume después de cada espiga.","La mielina no se consume en cada potencial de acción."),
      R("Porque los gradientes iónicos desaparecen totalmente tras una sola espiga.","Una espiga mueve pocos iones y no agota totalmente los gradientes."),
      R("Porque el neurotransmisor postsináptico bloquea todos los axones del organismo.","La frecuencia local no se explica por bloqueo postsináptico global." )],2,"La respuesta correcta es C. Los canales de Na⁺ inactivados deben recuperar disponibilidad; esta recuperación limita la frecuencia máxima de disparo.",["Na⁺ inactivado necesita recuperación.","Refractario limita frecuencia.","No se agotan gradientes por una espiga."],"Límite de frecuencia","limite_frecuencia_refractario","mechanism","reasoning","hard"),

    M("Tejidos excitables","Medio","¿Qué asociación entre célula excitable y función es correcta?","Neurona: transmisión de información; músculo esquelético: contracción voluntaria; músculo cardíaco: contracción rítmica coordinada.",[
      R("Neurona: contracción voluntaria; músculo cardíaco: potenciales graduados únicamente.","Invierte funciones y reduce indebidamente el potencial cardíaco."),
      R("Músculo esquelético: liberación de neurotransmisor en nodos; músculo liso: conducción saltatoria rápida.","Confunde músculo con axón mielinizado."),
      R("Todas las células excitables tienen la misma curva neuronal breve sin variaciones.","El módulo advierte que los tejidos excitables pueden tener patrones diferentes." )],3,"La respuesta correcta es D. Las células excitables usan cambios de voltaje para funciones distintas: comunicación, contracción voluntaria, contracción rítmica y actividad visceral lenta.",["Células excitables no son idénticas.","Función depende del tejido.","No aplicar una curva única a todos."],"Células excitables","celulas_excitables_funcion","comparison","application","medium"),

    M("Espiga vs meseta","Difícil","¿Qué error conceptual comete quien aplica la curva neuronal breve a todos los tejidos excitables?","Ignora que algunos tejidos, como el cardíaco, pueden tener meseta y mecanismos iónicos temporales distintos.",[
      R("Reconoce correctamente que todos los tejidos tienen la misma duración de potencial de acción.","Esa igualdad es falsa; existen patrones distintos."),
      R("Comprende que el Ca²⁺ nunca participa en potenciales eléctricos.","El Ca²⁺ puede participar en meseta, sinapsis y contracción."),
      R("Demuestra que la mielina siempre genera mesetas cardíacas.","La mielina acelera conducción axonal; no genera meseta cardíaca." )],0,"La respuesta correcta es A. La espiga neuronal clásica no debe extrapolarse a todos los tejidos; la meseta cardíaca implica participación sostenida de corrientes como Ca²⁺.",["Neurona = espiga breve.","Cardíaco = meseta posible.","Ca²⁺ puede prolongar despolarización."],"Espiga vs meseta","curva_no_universal","exam_trap","reasoning","hard"),

    M("Error de examen","Examen","¿Cuál es la corrección más precisa para la frase: “la bomba Na⁺/K⁺ produce la espiga del potencial de acción”?","La bomba mantiene gradientes; la espiga se debe a cambios rápidos de permeabilidad por canales dependientes de voltaje.",[
      R("La frase es correcta porque la bomba abre directamente el canal de Na⁺.","La bomba no es el canal de Na⁺ dependiente de voltaje."),
      R("La espiga depende solo de difusión de glucosa y no de canales iónicos.","La espiga es un fenómeno iónico de membrana."),
      R("La bomba produce únicamente liberación de neurotransmisor por Ca²⁺.","La liberación de neurotransmisor depende de Ca²⁺ presináptico, no de la bomba como evento directo." )],1,"La respuesta correcta es B. La bomba conserva las condiciones de base, pero las fases rápidas del potencial de acción dependen de apertura e inactivación de canales iónicos.",["Bomba mantiene.","Canal permite flujo rápido.","Espiga = cambios de permeabilidad."],"Bomba no genera espiga","bomba_no_espiga","exam_trap","reasoning","hard"),

    M("Error de examen","Examen","¿Cuál es la corrección más precisa para la frase: “la mielina genera el potencial de acción”?","La mielina acelera y aísla; el potencial se regenera en nodos por canales de Na⁺.",[
      R("La mielina contiene vesículas que liberan neurotransmisor para crear cada espiga.","Las vesículas sinápticas están en terminales, no en la mielina."),
      R("La mielina reemplaza todos los canales de Na⁺ y K⁺.","La conducción mielinizada sigue necesitando canales, especialmente en nodos."),
      R("La mielina convierte electrones en iones dentro del axón.","No existe tal transformación como mecanismo fisiológico." )],2,"La respuesta correcta es C. La mielina es un aislante que mejora velocidad y eficiencia, pero la regeneración activa del potencial ocurre en los nodos de Ranvier.",["Mielina no genera PA.","Nodo regenera PA.","Canales de Na⁺ siguen siendo necesarios."],"Mielina no genera PA","mielina_no_genera_pa","exam_trap","reasoning","hard"),

    M("Error de examen","Examen","¿Cuál es la corrección más precisa para la frase: “el refractario absoluto se supera con un estímulo mayor”?","El refractario absoluto no se supera con estímulo mayor porque los canales de Na⁺ están inactivados.",[
      R("La frase es correcta porque el umbral siempre baja a cero durante el absoluto.","El absoluto no implica umbral cero; implica indisponibilidad de canales de Na⁺."),
      R("Se supera si entra Ca²⁺ en la terminal presináptica.","Ca²⁺ presináptico no recupera canales de Na⁺ axonales inactivados."),
      R("Se supera si la bomba Na⁺/K⁺ expulsa K⁺ en lugar de Na⁺.","La bomba no invierte su función para superar la refractariedad." )],3,"La respuesta correcta es D. En el refractario absoluto, la limitación es el estado de inactivación de los canales de Na⁺, por lo que un estímulo más fuerte no genera una nueva espiga.",["Absoluto = imposible.","Na⁺ inactivado = no disponible.","Relativo sí puede requerir estímulo mayor."],"Refractario absoluto","refractario_absoluto_no_supera","exam_trap","reasoning","hard"),

    M("Error de examen","Examen","¿Qué error contiene la frase: “la repolarización se produce por entrada de Na⁺”?","Invierte las fases: la repolarización se explica principalmente por salida de K⁺.",[
      R("No contiene error; la entrada de Na⁺ siempre repolariza.","La entrada de Na⁺ despolariza, no repolariza."),
      R("El error es que la repolarización depende de entrada de glucosa.","La glucosa no es el mecanismo iónico de repolarización."),
      R("El error es que la repolarización ocurre solo por Ca²⁺ postsináptico.","El Ca²⁺ no es el mecanismo principal de repolarización neuronal clásica." )],0,"La respuesta correcta es A. La entrada de Na⁺ corresponde a la fase ascendente; la repolarización se debe sobre todo a la salida de K⁺.",["Na⁺ entra = despolariza.","K⁺ sale = repolariza.","K⁺ prolongado = hiperpolariza."],"Trampa de repolarización","trampa_repolarizacion_na","exam_trap","reasoning","hard"),

    M("Error de examen","Examen","¿Qué error contiene la frase: “la liberación de neurotransmisor depende del Na⁺ axonal y no del Ca²⁺”?","Confunde conducción axonal por Na⁺ con exocitosis presináptica desencadenada por Ca²⁺.",[
      R("No contiene error; el Ca²⁺ no participa en sinapsis química.","El Ca²⁺ es esencial para fusión vesicular presináptica."),
      R("El error es que el neurotransmisor se libera por salida de K⁺ dendrítico.","La frase no se corrige sustituyendo por K⁺ dendrítico; el ion clave es Ca²⁺ presináptico."),
      R("El error es que el neurotransmisor es una forma de mielina líquida.","Esto no corresponde a ningún mecanismo fisiológico del módulo." )],1,"La respuesta correcta es B. Na⁺ conduce el potencial por el axón; la llegada de la señal a la terminal abre canales de Ca²⁺, y el Ca²⁺ desencadena exocitosis.",["Na⁺ = conducción axonal.","Ca²⁺ = exocitosis.","No confundir axón y terminal."],"Na⁺ vs Ca²⁺","trampa_na_ca_sinapsis","exam_trap","reasoning","hard"),

    M("Aplicación clínica","Difícil","Un paciente presenta enlentecimiento de conducción por daño de mielina. ¿Qué mecanismo explica mejor el déficit?","Aumento de fuga de corriente y menor eficacia para alcanzar los nodos siguientes.",[
      R("Aumento de la amplitud de cada potencial de acción por exceso de mielina.","El daño de mielina no aumenta amplitud por exceso de aislamiento."),
      R("Conversión de todos los canales de Na⁺ en receptores de neurotransmisor.","Los canales no cambian de identidad así."),
      R("Liberación de Ca²⁺ desde la vaina de mielina hacia la hendidura sináptica.","La mielina no es la terminal presináptica ni libera Ca²⁺ para exocitosis." )],2,"La respuesta correcta es C. La pérdida de mielina reduce el aislamiento internodal, aumenta pérdidas de corriente y compromete la conducción saltatoria.",["Desmielinización = más fuga.","Conducción más lenta o bloqueada.","El nodo necesita suficiente despolarización."],"Desmielinización clínica","desmielinizacion_mecanismo","clinical_application","reasoning","hard"),

    M("Aplicación clínica","Difícil","Una toxina impide la recuperación de canales de Na⁺ desde el estado inactivado. ¿Qué consecuencia se espera?","Disminución de la capacidad de generar potenciales de acción repetidos.",[
      R("Aumento ilimitado de frecuencia por eliminación del refractario.","Impedir recuperación prolonga la refractariedad, no la elimina."),
      R("Liberación constante de neurotransmisor sin llegada de potenciales.","La liberación depende de Ca²⁺ presináptico asociado a actividad terminal."),
      R("Desaparición inmediata de todos los canales de fuga de K⁺.","La recuperación de Na⁺ no implica desaparición de canales de fuga de K⁺." )],3,"La respuesta correcta es D. Si los canales de Na⁺ no recuperan disponibilidad, la neurona no puede disparar repetidamente de forma normal.",["Na⁺ debe recuperarse.","Sin recuperación = refractariedad prolongada.","Disminuye disparo repetido."],"Recuperación de Na⁺","recuperacion_canales_na","clinical_application","reasoning","hard"),

    M("Aplicación clínica","Difícil","Si se bloquean canales de Ca²⁺ presinápticos, ¿qué proceso se afectaría más directamente?","La liberación de neurotransmisor por disminución de la fusión vesicular.",[
      R("La fase ascendente axonal por ausencia de entrada de Na⁺.","La fase ascendente axonal depende principalmente de Na⁺, no de Ca²⁺ presináptico."),
      R("El potencial de equilibrio del K⁺ por inversión del gradiente.","Bloquear Ca²⁺ presináptico no invierte E_K."),
      R("La conducción saltatoria por destrucción inmediata de mielina.","El bloqueo de Ca²⁺ no destruye mielina de forma directa." )],0,"La respuesta correcta es A. El Ca²⁺ presináptico desencadena fusión vesicular; bloquear su entrada reduce la liberación de neurotransmisor.",["Ca²⁺ presináptico = liberación.","Na⁺ axonal = conducción.","K⁺ = reposo/repolarización."],"Bloqueo de Ca²⁺ presináptico","bloqueo_ca_sinapsis","clinical_application","reasoning","hard"),

    M("Algoritmo de examen","Examen","Un enunciado menciona “salto funcional entre nodos de Ranvier”. ¿Qué concepto debe reconocerse?","Conducción saltatoria.",[
      R("Potencial graduado dendrítico.","El potencial graduado es local y decremental; no salta entre nodos."),
      R("Refractario absoluto.","El refractario es un estado de inexcitabilidad, no el modo de conducción entre nodos."),
      R("Meseta cardíaca.","La meseta cardíaca no describe el salto entre nodos axonales." )],1,"La respuesta correcta es B. La conducción saltatoria es la propagación rápida en axones mielinizados con regeneración en los nodos de Ranvier.",["Nodos de Ranvier = saltatoria.","Mielina = aislamiento.","Nodo = regeneración activa."],"Reconocer conducción saltatoria","algoritmo_saltatoria","pattern_recognition","reasoning","hard"),

    M("Algoritmo de examen","Examen","Un enunciado menciona “entrada de Ca²⁺ en la terminal presináptica”. ¿Qué proceso debe pensarse primero?","Liberación de neurotransmisor.",[
      R("Fase ascendente del potencial de acción axonal.","La fase ascendente axonal clásica depende de entrada de Na⁺."),
      R("Potencial de reposo por canales de fuga de K⁺.","El reposo se relaciona con K⁺ de fuga, no con Ca²⁺ presináptico."),
      R("Hiperpolarización pospotencial por K⁺ prolongado.","La hiperpolarización se relaciona con salida persistente de K⁺." )],2,"La respuesta correcta es C. La entrada de Ca²⁺ en la terminal presináptica es la señal para la exocitosis de vesículas y liberación de neurotransmisor.",["Ca²⁺ terminal = exocitosis.","Na⁺ axón = conducción.","K⁺ salida = repolarización/hiperpolarización."],"Algoritmo Ca²⁺","algoritmo_calcio_sinapsis","pattern_recognition","reasoning","hard"),

    M("Algoritmo de examen","Examen","Un enunciado menciona “cambio local, variable, sumable y decremental”. ¿Qué respuesta es la más adecuada?","Potencial graduado.",[
      R("Potencial de acción.","El potencial de acción es todo o nada y regenerativo."),
      R("Conducción saltatoria.","La conducción saltatoria es propagación en axón mielinizado, no señal local sumable."),
      R("Refractario absoluto.","El refractario absoluto es un estado de imposibilidad de disparo." )],3,"La respuesta correcta es D. Local, variable, sumable y decremental son palabras clave de potencial graduado.",["Graduado = local y sumable.","PA = todo o nada.","Saltatoria = modo de propagación."],"Algoritmo potencial graduado","algoritmo_graduado","pattern_recognition","reasoning","hard"),

    M("Algoritmo de examen","Examen","Un enunciado menciona “señal regenerativa que no disminuye su amplitud durante la propagación axonal”. ¿Qué concepto corresponde?","Potencial de acción.",[
      R("Potencial graduado.","El graduado se atenúa con la distancia."),
      R("IPSP por entrada de Cl⁻.","Un IPSP es graduado e inhibidor, no una señal axonal regenerativa."),
      R("Potencial de equilibrio del Na⁺.","E_Na es un valor de referencia, no una señal propagada." )],0,"La respuesta correcta es A. El potencial de acción se regenera sucesivamente por canales dependientes de voltaje y mantiene amplitud durante la propagación.",["PA = regenerativo.","Graduado = decremental.","E_Na no es una señal."],"Algoritmo potencial de acción","algoritmo_pa_regenerativo","pattern_recognition","reasoning","hard"),

    M("Valores y fases","Examen","¿Cuál asociación de valores de referencia es correcta?","Reposo ≈ -70 mV; umbral ≈ -55 mV; E_K ≈ -90 mV; E_Na ≈ +60 mV.",[
      R("Reposo ≈ +60 mV; umbral ≈ -90 mV; E_K ≈ -55 mV; E_Na ≈ -70 mV.","Intercambia valores de reposo, umbral y potenciales de equilibrio."),
      R("Reposo ≈ 0 mV; umbral ≈ +30 mV; E_K ≈ +60 mV; E_Na ≈ -90 mV.","No corresponde a los valores fisiológicos del módulo."),
      R("Reposo ≈ -120 mV; umbral ≈ +80 mV; E_K ≈ 0 mV; E_Na ≈ -10 mV.","Son valores incompatibles con las referencias del curso." )],1,"La respuesta correcta es B. Estos valores permiten interpretar rápidamente gráficos y opciones de examen: reposo -70, umbral -55, E_K -90, E_Na +60 mV.",["Reposo -70.","Umbral -55.","E_K -90; E_Na +60."],"Valores de referencia integrados","valores_integrados","recall","reasoning","hard"),

    M("Síntesis fisiológica","Examen","¿Cuál frase resume mejor la relación entre estímulo, umbral y potencial de acción?","Un estímulo local puede generar potenciales graduados; si la suma alcanza el umbral, aparece un potencial de acción todo o nada.",[
      R("Todo estímulo local, aunque sea mínimo, genera automáticamente una espiga completa.","Ignora el requisito de umbral."),
      R("El umbral se alcanza cuando la bomba Na⁺/K⁺ se apaga completamente.","El umbral depende de despolarización y apertura de canales de Na⁺."),
      R("La suma de potenciales graduados disminuye siempre la excitabilidad.","La suma puede ser excitadora o inhibidora según las entradas." )],2,"La respuesta correcta es C. La neurona integra potenciales graduados; cuando la despolarización neta alcanza el umbral, se activa una espiga todo o nada.",["Estímulo local = graduado.","Suma puede alcanzar umbral.","Umbral = PA todo o nada."],"Síntesis estímulo-umbral","sintesis_estimulo_umbral","summary","reasoning","hard"),

    M("Síntesis final","Examen","¿Cuál conjunto de asociaciones es completamente correcto?","Bomba: mantiene gradientes; canales: permiten flujo rápido; mielina: aísla; nodos: regeneran potencial.",[
      R("Bomba: genera neurotransmisor; canales: almacenan ATP; mielina: exocitosis; nodos: glucosa.","Todas las asociaciones mezclan funciones incorrectas."),
      R("Bomba: fase ascendente rápida; canales: no participan; mielina: destruye corriente; nodos: inhibición química.","Niega el papel de canales y de la mielina en conducción."),
      R("Bomba: receptor postsináptico; canales: vesículas; mielina: Ca²⁺ presináptico; nodos: núcleo neuronal.","Confunde estructuras, funciones y localizaciones." )],3,"La respuesta correcta es D. Esta síntesis conserva la lógica del módulo: la bomba conserva gradientes, los canales generan corrientes rápidas, la mielina aísla y los nodos regeneran el potencial de acción.",["Bomba mantiene.","Canal conduce rápido.","Mielina aísla; nodo regenera."],"Síntesis estructural","sintesis_bomba_canal_mielina_nodo","summary","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.qcm, 60+i, items[i]);

  ROOT.fisiologiaQualityPatchV317 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 061-100",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:40,
    notes:"Replaces QCM 061-100 with a 40-item exam-oriented batch covering channel states, refractory logic, graph reading, conduction, synapse, coding, tissue differences and common exam traps."
  };
})();
