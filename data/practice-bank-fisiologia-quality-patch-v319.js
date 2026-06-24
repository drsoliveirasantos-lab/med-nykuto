/* v319 — Fisiología quality patch, Módulo 1 QCM 141–180.
   Scope: replaces QCM 141–180 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v319-m1-qcm-141-180";

  function moduleHits(arr){ return arr.map(function(x,i){return {x:x,i:i};}).filter(function(o){return o.x && o.x.moduleId === MODULE_ID;}); }
  function R(text, why){ return {text:text, why:why}; }
  function pack(correct, wrongs, ai){
    var options=[], whyWrong=[], distractorExplanations=[], k=0;
    for(var i=0;i<4;i++){
      if(i===ai){ options.push(correct); whyWrong.push(null); distractorExplanations.push(null); }
      else { options.push(wrongs[k].text); whyWrong.push("Falsa. " + wrongs[k].why); distractorExplanations.push(wrongs[k].why); k++; }
    }
    return {options:options, whyWrong:whyWrong, distractorExplanations:distractorExplanations};
  }
  function Q(heading,difficulty,question,correct,wrongs,ai,explanation,keyPoints,topic,slug,skill,level,diff){
    var p = pack(correct, wrongs, ai);
    return {auditDecision:"B",heading:heading,difficulty:difficulty,question:question,options:p.options,answerIndex:ai,explanation:explanation,whyWrong:p.whyWrong,distractorExplanations:p.distractorExplanations,keyPoints:keyPoints,tags:{subject:"fisiologia",moduleNumber:1,format:"qcm",topic:topic,topicSlug:slug,skill:skill,cognitiveLevel:level,difficulty:diff,visible:false,adaptiveVersion:"v319"}};
  }
  function replaceModuleIndex(arr, index, item){
    var h = moduleHits(arr);
    if(!h[index]) return false;
    var old = h[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    arr[h[index].i] = merged;
    return true;
  }

  var items = [
    Q("Caso fisiológico breve","Difícil","Un axón se estimula desde reposo, pero la despolarización local no alcanza -55 mV. ¿Qué respuesta es la más probable?","Se produce un cambio graduado local, pero no un potencial de acción completo.",[
      R("Se genera una espiga completa porque todo estímulo neuronal es todo o nada.","La ley del todo o nada exige alcanzar el umbral."),
      R("Se libera neurotransmisor de manera obligatoria aunque no llegue la señal a la terminal.","La liberación depende de llegada del potencial y entrada de Ca²⁺ presináptico."),
      R("Se produce hiperpolarización por entrada rápida de Na⁺.","La entrada de Na⁺ despolariza y requiere apertura suficiente de canales." )],0,"La respuesta correcta es A. Un estímulo subumbral puede generar potencial graduado local, pero no activa suficiente entrada de Na⁺ para iniciar una espiga.",["Subumbral = no PA.","Umbral aproximado: -55 mV.","El potencial graduado puede sumarse."],"Subumbral aplicado","caso_subumbral","clinical_application","reasoning","hard"),

    Q("Caso fisiológico breve","Difícil","Una neurona recibe un estímulo que supera claramente el umbral. ¿Qué afirmación describe mejor la amplitud de la espiga individual?","La amplitud será relativamente constante porque el potencial de acción es todo o nada.",[
      R("La amplitud crecerá indefinidamente con la intensidad del estímulo.","La intensidad se codifica sobre todo por frecuencia, no por amplitud ilimitada."),
      R("La espiga se volverá un potencial graduado decremental.","El potencial de acción no se convierte en graduado por ser suprumbral."),
      R("La bomba Na⁺/K⁺ decidirá la altura exacta de cada pico en tiempo real.","La fase rápida depende de canales de Na⁺ y K⁺, no de la bomba como generador directo." )],1,"La respuesta correcta es B. Tras alcanzar el umbral, la espiga individual conserva amplitud similar; los estímulos más intensos aumentan la frecuencia de disparo.",["Suprumbral = PA completo.","Amplitud individual estable.","Más intensidad = más frecuencia."],"Suprumbral y amplitud","suprumbral_amplitud","mechanism","application","medium"),

    Q("Caso fisiológico breve","Difícil","Tras una primera espiga, un segundo estímulo inmediato no produce respuesta aunque sea intenso. ¿Cuál es el mecanismo principal?","Inactivación de canales de Na⁺ durante el período refractario absoluto.",[
      R("Hiperactividad de receptores postsinápticos de Cl⁻.","El fenómeno descrito es axonal y depende de canales de Na⁺."),
      R("Conversión de K⁺ en Na⁺ dentro del axón.","Los iones no se convierten unos en otros."),
      R("Destrucción transitoria de la bomba Na⁺/K⁺.","La refractariedad absoluta fisiológica no se explica por destrucción de la bomba." )],2,"La respuesta correcta es C. Durante el refractario absoluto, canales de Na⁺ están inactivados y no disponibles para iniciar una nueva espiga.",["Absoluto = imposible.","Na⁺ inactivado = no disponible.","Relativo = posible con estímulo mayor."],"Segundo estímulo inmediato","caso_refractario_absoluto","clinical_application","reasoning","hard"),

    Q("Caso fisiológico breve","Difícil","Un estímulo aplicado poco después de una espiga solo genera respuesta cuando es más fuerte de lo habitual. ¿Qué estado se reconoce?","Período refractario relativo.",[
      R("Período refractario absoluto.","En el absoluto no se genera respuesta aunque el estímulo sea intenso."),
      R("Potencial de equilibrio del Na⁺.","E_Na es un valor de voltaje, no un estado de excitabilidad."),
      R("Sinapsis química presináptica.","La necesidad de estímulo mayor se explica por excitabilidad axonal, no por exocitosis." )],3,"La respuesta correcta es D. En el refractario relativo, algunos canales ya se recuperaron, pero la membrana puede seguir hiperpolarizada; se necesita un estímulo mayor.",["Relativo = respuesta posible.","Se requiere estímulo mayor.","K⁺ prolongado contribuye a hiperpolarización."],"Segundo estímulo tardío","caso_refractario_relativo","clinical_application","reasoning","hard"),

    Q("Gráfica clínica","Examen","En una gráfica, el punto marcado corresponde al inicio brusco del ascenso tras alcanzar -55 mV. ¿Qué evento molecular se debe elegir?","Apertura de canales de Na⁺ dependientes de voltaje.",[
      R("Cierre irreversible de canales de K⁺.","K⁺ participa en repolarización, no en el inicio brusco de ascenso."),
      R("Entrada de Ca²⁺ para exocitosis vesicular.","Eso corresponde a la terminal presináptica, no al ascenso axonal clásico."),
      R("Activación directa de la bomba Na⁺/K⁺ como generadora de la espiga.","La bomba mantiene gradientes y no genera directamente el ascenso rápido." )],0,"La respuesta correcta es A. El inicio brusco de la fase ascendente se debe a apertura de canales de Na⁺ dependientes de voltaje.",["-55 mV ≈ umbral.","Ascenso = Na⁺ entra.","La bomba no dibuja la espiga."],"Gráfica: inicio de ascenso","grafica_inicio_ascenso","graph_interpretation","reasoning","hard"),

    Q("Gráfica clínica","Examen","En una gráfica, el punto marcado está en el pico cercano a +30 mV. ¿Qué cambio canalicular explica el paso a la fase descendente?","Inactivación de canales de Na⁺ y apertura retardada de canales de K⁺.",[
      R("Apertura sostenida de canales de Na⁺ sin inactivación.","Eso impediría el cambio normal hacia repolarización."),
      R("Entrada de Cl⁻ como corriente excitadora principal.","Cl⁻ no explica el pico ni la repolarización clásica."),
      R("Apagado completo de todos los gradientes iónicos.","Los gradientes no desaparecen durante una espiga normal." )],1,"La respuesta correcta es B. El pico se limita por inactivación de Na⁺ y por salida de K⁺ al abrirse canales de K⁺.",["Pico ≈ +30 mV.","Na⁺ se inactiva.","K⁺ sale para repolarizar."],"Gráfica: pico","grafica_pico","graph_interpretation","reasoning","hard"),

    Q("Gráfica clínica","Examen","La curva cae de +30 mV hacia valores negativos. ¿Qué corriente domina esa fase?","Salida de K⁺ hacia el exterior celular.",[
      R("Entrada de Na⁺ hacia el interior celular.","Na⁺ corresponde al ascenso rápido."),
      R("Entrada de Ca²⁺ para fusión vesicular.","Ca²⁺ presináptico no explica la fase descendente axonal."),
      R("Difusión de glucosa por la membrana neuronal.","La glucosa no es la corriente de repolarización." )],2,"La respuesta correcta es C. La caída de la curva se debe principalmente a salida de K⁺, que hace el interior más negativo.",["Descenso = K⁺ sale.","Ascenso = Na⁺ entra.","Glucosa no repolariza."],"Gráfica: descenso","grafica_descenso","graph_interpretation","reasoning","hard"),

    Q("Gráfica clínica","Examen","La curva cae por debajo de -70 mV antes de volver al reposo. ¿Qué explicación es correcta?","Persistencia transitoria de canales de K⁺ abiertos.",[
      R("Entrada adicional de Na⁺ por canales abiertos.","La entrada de Na⁺ despolariza, no lleva por debajo del reposo."),
      R("Entrada de Ca²⁺ postsináptico como señal inhibitoria obligatoria.","No es el mecanismo de hiperpolarización pospotencial axonal."),
      R("Conversión de potencial de acción en potencial graduado.","La hiperpolarización no significa conversión de la señal." )],3,"La respuesta correcta es D. La hiperpolarización aparece porque el K⁺ sigue saliendo durante un tiempo, acercando Vm a E_K.",["Debajo de reposo = hiperpolarización.","K⁺ sigue saliendo.","Luego se recupera reposo."],"Gráfica: hiperpolarización","grafica_por_debajo_reposo","graph_interpretation","reasoning","hard"),

    Q("Análisis de opción","Examen","Una opción dice: “la despolarización rápida se debe a la salida de K⁺”. ¿Cómo debe corregirse?","La despolarización rápida se debe a entrada de Na⁺; la salida de K⁺ repolariza.",[
      R("La opción es correcta porque K⁺ siempre inicia la espiga.","K⁺ no inicia la fase ascendente neuronal clásica."),
      R("Debe cambiarse por entrada de Cl⁻ para la fase ascendente.","Cl⁻ no explica el ascenso rápido clásico."),
      R("Debe atribuirse a la bomba Na⁺/K⁺ como canal de Na⁺.","La bomba no es el canal que genera la fase ascendente." )],0,"La respuesta correcta es A. Esta es una inversión clásica: Na⁺ sube la curva y K⁺ la baja.",["Na⁺ entra = despolariza.","K⁺ sale = repolariza.","No atribuir espiga a bomba."],"Trampa inversión Na/K","trampa_inversion_na_k","exam_trap","reasoning","hard"),

    Q("Análisis de opción","Examen","Una opción afirma: “el Ca²⁺ es el ion principal de la fase ascendente neuronal clásica”. ¿Qué corrección es mejor?","En la neurona clásica, la fase ascendente depende principalmente de Na⁺; el Ca²⁺ es clave en la terminal presináptica.",[
      R("La frase es correcta porque el Na⁺ solo participa en la repolarización.","Na⁺ participa en la despolarización rápida."),
      R("Debe reemplazarse por Cl⁻ como ion principal excitador.","Cl⁻ suele estabilizar o inhibir."),
      R("Debe atribuirse a K⁺ como ion de entrada rápida.","K⁺ sale durante repolarización, no entra para ascenso." )],1,"La respuesta correcta es B. El Ca²⁺ se asocia a liberación sináptica y meseta en algunos tejidos, pero la espiga neuronal rápida depende de Na⁺.",["Na⁺ = fase ascendente neuronal.","Ca²⁺ = terminal presináptica/meseta.","K⁺ = fase descendente."],"Trampa Na vs Ca","trampa_na_ca_fase_ascendente","exam_trap","reasoning","hard"),

    Q("Análisis de opción","Examen","Una opción dice: “el potencial graduado es todo o nada”. ¿Qué error contiene?","Confunde potencial graduado con potencial de acción.",[
      R("No contiene error porque ambos fenómenos son idénticos.","Son fenómenos distintos por amplitud, propagación y sumación."),
      R("Solo falta añadir que depende de Ca²⁺ presináptico.","El problema principal no es Ca²⁺, sino confundir graduado con PA."),
      R("Debe decir que el graduado se regenera en nodos de Ranvier.","La regeneración nodal corresponde al potencial de acción." )],2,"La respuesta correcta es C. El potencial graduado tiene amplitud variable, se atenúa y puede sumarse; la ley del todo o nada corresponde al potencial de acción.",["Graduado = variable.","PA = todo o nada.","Graduado se suma y se atenúa."],"Trampa graduado todo-o-nada","trampa_graduado_todo_nada","exam_trap","reasoning","hard"),

    Q("Análisis de opción","Examen","Una opción dice: “la señal se propaga como electrones por un cable metálico”. ¿Cuál es la corrección correcta?","La señal neuronal depende de corrientes iónicas transmembrana y regeneración por canales.",[
      R("La opción es correcta si el axón está mielinizado.","La mielina no convierte el axón en cable metálico de electrones."),
      R("Debe decir que las proteínas citoplasmáticas son los electrones móviles.","La señal no se basa en proteínas que actúan como electrones."),
      R("Debe decir que la glucosa reemplaza a los iones en la señal eléctrica.","La glucosa aporta energía, pero no es la corriente inmediata." )],3,"La respuesta correcta es D. La electricidad biológica se explica por movimiento selectivo de iones a través de canales, no por electrones metálicos.",["Electricidad biológica = iones.","Canales cambian permeabilidad.","Mielina no crea cable metálico."],"Trampa electricidad metálica","trampa_electrones","exam_trap","reasoning","hard"),

    Q("Caso de desmielinización","Difícil","En una fibra desmielinizada, la corriente local no alcanza con seguridad el siguiente nodo. ¿Cuál es la causa más directa?","Aumento de fuga de corriente por pérdida de aislamiento internodal.",[
      R("Aumento de la densidad de canales de Na⁺ en todos los internodos.","El problema central de la pérdida de mielina es la fuga, no un aumento protector automático."),
      R("Entrada de Ca²⁺ en el soma para liberar neurotransmisor.","La dificultad descrita es de conducción internodal, no de exocitosis somática."),
      R("Disminución obligatoria del gradiente de glucosa.","La conducción saltatoria no se explica por gradiente de glucosa." )],0,"La respuesta correcta es A. La mielina aumenta resistencia de membrana y reduce fuga; perderla hace menos eficiente la propagación hacia nodos.",["Mielina = aislamiento.","Desmielinización = fuga.","Nodo necesita despolarización suficiente."],"Desmielinización y fuga","desmielinizacion_fuga","clinical_application","reasoning","hard"),

    Q("Caso de conducción","Difícil","Un axón tiene buen aislamiento, pero carece de canales de Na⁺ funcionales en los nodos. ¿Qué ocurrirá con la conducción saltatoria?","Fallará la regeneración nodal del potencial de acción.",[
      R("Será más rápida porque la mielina basta para generar la espiga.","La mielina acelera, pero no reemplaza los canales nodales."),
      R("Se transformará en sinapsis química continua.","La conducción axonal no se convierte en sinapsis química."),
      R("Dependerá solo de entrada de Cl⁻ para alcanzar +30 mV.","Cl⁻ no genera el pico positivo clásico." )],1,"La respuesta correcta es B. En axones mielinizados, la regeneración activa ocurre en los nodos por canales de Na⁺; sin ellos, la señal no se renueva adecuadamente.",["Mielina aísla.","Nodo regenera.","Canales de Na⁺ nodales son esenciales."],"Fallo nodal","canales_na_nodales","clinical_application","reasoning","hard"),

    Q("Caso de sinapsis","Difícil","Una terminal presináptica recibe el potencial de acción, pero se bloquean sus canales de Ca²⁺. ¿Qué paso se altera primero?","La fusión de vesículas sinápticas con la membrana presináptica.",[
      R("La fase ascendente axonal inicial.","La fase ascendente axonal depende de Na⁺ y ya llegó a la terminal."),
      R("El potencial de equilibrio del K⁺.","Bloquear Ca²⁺ presináptico no redefine E_K."),
      R("La formación de mielina internodal.","La mielina no se forma como paso de exocitosis." )],2,"La respuesta correcta es C. El Ca²⁺ presináptico es la señal inmediata para fusión vesicular; si se bloquea, cae la liberación de neurotransmisor.",["PA llega.","Ca²⁺ entra.","Vesículas se fusionan."],"Bloqueo de Ca²⁺ terminal","bloqueo_calcio_terminal","clinical_application","reasoning","hard"),

    Q("Caso postsináptico","Difícil","Un neurotransmisor abre canales que permiten entrada de Na⁺ en la membrana postsináptica. ¿Qué efecto local se espera?","Un EPSP por despolarización local postsináptica.",[
      R("Un IPSP por hiperpolarización obligatoria.","Entrada de Na⁺ tiende a despolarizar, no a inhibir."),
      R("Un período refractario absoluto presináptico.","El evento descrito es postsináptico y graduado."),
      R("Una conducción saltatoria entre nodos.","No describe propagación axonal mielinizada." )],3,"La respuesta correcta es D. La entrada de Na⁺ postsináptica produce un cambio local excitador que acerca al umbral.",["Na⁺ postsináptico despolariza.","EPSP = excitador graduado.","No todo cambio postsináptico es PA."],"EPSP por Na⁺","epsp_entrada_na","clinical_application","reasoning","hard"),

    Q("Caso postsináptico","Difícil","Un neurotransmisor abre canales de Cl⁻ y la neurona postsináptica se vuelve menos propensa a disparar. ¿Qué fenómeno es más probable?","IPSP o inhibición postsináptica.",[
      R("Fase ascendente rápida de un potencial axonal.","La entrada de Cl⁻ no explica la fase ascendente rápida."),
      R("Pico del potencial de acción a +30 mV.","El pico depende de entrada de Na⁺ durante la espiga."),
      R("Conducción saltatoria por internodos.","No describe axón mielinizado sino receptor postsináptico." )],0,"La respuesta correcta es A. La entrada de Cl⁻ suele estabilizar o hiperpolarizar la membrana, reduciendo la probabilidad de alcanzar el umbral.",["Cl⁻ suele inhibir.","IPSP reduce disparo.","EPSP/IPSP son graduados."],"IPSP por Cl⁻","ipsp_cloro","clinical_application","reasoning","hard"),

    Q("Caso de integración","Difícil","Un IPSP ocurre al mismo tiempo que varios EPSP. ¿Qué determina si la neurona dispara?","La suma neta de corrientes excitadoras e inhibidoras en el segmento inicial.",[
      R("La amplitud aislada del IPSP sin considerar los EPSP.","La neurona integra señales, no evalúa una sola entrada aislada en todos los casos."),
      R("La liberación de neurotransmisor por la mielina.","La mielina no libera neurotransmisor."),
      R("La conversión del Cl⁻ en Na⁺ dentro del receptor.","Los iones no se convierten en otros." )],1,"La respuesta correcta es B. El disparo depende del balance entre entradas excitadoras e inhibitorias que llega al segmento inicial.",["Integración = suma neta.","EPSP acerca al umbral.","IPSP aleja o estabiliza."],"Integración EPSP/IPSP","integracion_epsp_ipsp","clinical_application","reasoning","hard"),

    Q("Farmacología fisiológica","Difícil","Una sustancia mantiene abiertos canales de K⁺ postsinápticos. ¿Qué efecto funcional se espera?","Tendencia a hiperpolarización o menor excitabilidad postsináptica.",[
      R("Aumento de la entrada de Na⁺ y despolarización rápida obligatoria.","Abrir K⁺ favorece salida de cargas positivas, no entrada de Na⁺."),
      R("Aumento directo de exocitosis presináptica por Ca²⁺.","Canales K⁺ postsinápticos no son canales Ca²⁺ presinápticos."),
      R("Aceleración por creación de nueva mielina.","Abrir canales postsinápticos no crea mielina." )],2,"La respuesta correcta es C. Al abrir canales de K⁺, K⁺ tiende a salir y puede hiperpolarizar o estabilizar la membrana postsináptica.",["K⁺ sale = más negativo.","Menor excitabilidad.","No confundir postsináptico con presináptico."],"K⁺ postsináptico","canales_k_postsinapticos","clinical_application","reasoning","hard"),

    Q("Farmacología fisiológica","Difícil","Una sustancia aumenta la apertura de receptores de Cl⁻ postsinápticos. ¿Cuál es el efecto esperado sobre el umbral funcional?","La neurona tendrá más dificultad para alcanzar el umbral.",[
      R("La neurona alcanzará el umbral con estímulos menores por entrada de Na⁺.","La apertura de Cl⁻ suele inhibir, no facilitar."),
      R("La terminal presináptica liberará neurotransmisor sin Ca²⁺.","El receptor postsináptico de Cl⁻ no reemplaza el Ca²⁺ presináptico."),
      R("El axón se volverá un cable metálico de electrones.","No cambia la naturaleza iónica de la señal." )],3,"La respuesta correcta es D. La conductancia de Cl⁻ puede estabilizar la membrana o hiperpolarizarla, disminuyendo la probabilidad de disparo.",["Cl⁻ inhibe frecuentemente.","Más difícil alcanzar umbral.","No reemplaza Ca²⁺ presináptico."],"Receptor de Cl⁻ aumentado","receptor_cl_aumentado","clinical_application","reasoning","hard"),

    Q("Comparación de formatos","Medio","¿Cuál opción compara correctamente un EPSP y un potencial de acción?","El EPSP es graduado y local; el potencial de acción es todo o nada y regenerativo.",[
      R("Ambos son todo o nada y se regeneran en nodos.","El EPSP no es todo o nada ni nodal."),
      R("El EPSP depende siempre de salida de K⁺; el potencial de acción depende siempre de Cl⁻.","Asociaciones iónicas incorrectas y absolutas."),
      R("El EPSP solo ocurre en mielina; el potencial de acción solo en el núcleo.","Ubicaciones incorrectas." )],0,"La respuesta correcta es A. Los EPSP son potenciales postsinápticos graduados; el potencial de acción es una señal axonal regenerativa.",["EPSP = graduado local.","PA = todo o nada.","La suma de EPSP puede disparar PA."],"EPSP vs PA","epsp_vs_pa","comparison","application","medium"),

    Q("Comparación de formatos","Medio","¿Cuál opción compara correctamente un IPSP y un período refractario absoluto?","El IPSP disminuye la probabilidad de umbral; el refractario absoluto impide una nueva espiga por inactivación de Na⁺.",[
      R("Ambos se deben a liberación de Ca²⁺ desde la mielina.","Ninguno se explica así."),
      R("El IPSP es una espiga axonal; el refractario absoluto es un potencial graduado excitador.","Invierte fenómenos."),
      R("El IPSP siempre abre Na⁺; el refractario absoluto siempre abre K⁺ de fuga.","IPSP no siempre abre Na⁺, y el absoluto se centra en Na⁺ inactivado." )],1,"La respuesta correcta es B. El IPSP es una señal postsináptica inhibitoria graduada; el refractario absoluto es un estado axonal de indisponibilidad de Na⁺.",["IPSP reduce disparo.","Absoluto impide disparo.","Na⁺ inactivado explica absoluto."],"IPSP vs refractario","ipsp_vs_refractario","comparison","application","medium"),

    Q("Comparación de formatos","Medio","¿Cuál opción compara correctamente conducción continua y saltatoria?","La continua regenera en segmentos contiguos; la saltatoria regenera principalmente en nodos de Ranvier.",[
      R("La continua solo ocurre en sinapsis química; la saltatoria solo en dendritas.","Ambas se refieren a propagación axonal."),
      R("La continua no requiere canales; la saltatoria no requiere gradientes.","Ambas requieren bases iónicas y canales."),
      R("La continua es por Ca²⁺ presináptico; la saltatoria por glucosa.","Asociaciones incorrectas." )],2,"La respuesta correcta es C. La conducción continua ocurre en axones no mielinizados; la saltatoria aprovecha mielina y nodos para acelerar la propagación.",["Continua = segmentos contiguos.","Saltatoria = nodos.","Mielina acelera."],"Continua vs saltatoria","continua_vs_saltatoria","comparison","application","medium"),

    Q("Comparación de formatos","Medio","¿Cuál opción compara correctamente canal activado por ligando y canal dependiente de voltaje?","El primero responde a unión molecular; el segundo responde a cambios del potencial de membrana.",[
      R("Ambos se abren solo por ATP y transportan 3 Na⁺/2 K⁺.","Eso describe la bomba, no canales."),
      R("El canal por ligando solo existe en mielina; el de voltaje solo en vesículas.","Ubicaciones y funciones incorrectas."),
      R("El canal por voltaje es siempre receptor metabotrópico nuclear.","Un canal de voltaje no es un receptor metabotrópico nuclear." )],3,"La respuesta correcta es D. Los canales por ligando se activan por unión de sustancias como neurotransmisores; los voltaje-dependientes responden a cambios de Vm.",["Ligando = molécula.","Voltaje = cambio de Vm.","Bomba ≠ canal."],"Ligando vs voltaje","ligando_vs_voltaje","comparison","application","medium"),

    Q("Integración avanzada","Difícil","Una neurona está cerca del umbral, pero se activa un canal de K⁺ postsináptico. ¿Qué efecto tiene sobre el disparo?","Disminuye la probabilidad de disparo al volver el interior más negativo o estabilizarlo.",[
      R("Aumenta la probabilidad de disparo por entrada de K⁺ positiva.","El K⁺ suele salir siguiendo su gradiente, no entrar para excitar."),
      R("Genera automáticamente una espiga por apertura de Na⁺.","Abrir K⁺ no equivale a abrir Na⁺ voltaje-dependiente."),
      R("Libera neurotransmisor desde la dendrita hacia la terminal.","No corresponde al mecanismo postsináptico descrito." )],0,"La respuesta correcta es A. La salida de K⁺ hace la membrana más negativa y reduce la probabilidad de alcanzar el umbral.",["K⁺ sale = inhibe/estabiliza.","Cerca del umbral no garantiza PA.","El balance neto decide."],"Canal K postsináptico cerca del umbral","k_post_cerca_umbral","reasoning","reasoning","hard"),

    Q("Integración avanzada","Difícil","Una neurona recibe EPSP pequeños que por separado no alcanzan el umbral. ¿Cómo podrían generar un potencial de acción?","Por sumación temporal o espacial hasta alcanzar el umbral en el segmento inicial.",[
      R("Por aumento ilimitado de la amplitud de cada EPSP aislado sin suma.","El mecanismo fisiológico es integración/sumación, no crecimiento ilimitado aislado."),
      R("Por transformación de Cl⁻ en Na⁺ dentro del soma.","No existe conversión iónica."),
      R("Por destrucción de la mielina para permitir paso de electrones.","La señal no depende de electrones metálicos ni de destruir mielina." )],1,"La respuesta correcta es B. Potenciales graduados subumbrales pueden sumarse y alcanzar el umbral en el segmento inicial.",["EPSP pequeños pueden sumarse.","Temporal o espacial.","Umbral convierte suma en PA."],"Sumación de EPSP pequeños","sumacion_epsp_pequenos","reasoning","application","medium"),

    Q("Integración avanzada","Difícil","Si una neurona está hiperpolarizada, ¿qué ocurre con la distancia eléctrica hasta el umbral?","Aumenta la distancia hasta el umbral y suele disminuir la excitabilidad.",[
      R("Disminuye siempre la distancia al umbral porque el interior es más positivo.","Hiperpolarizar significa volver más negativo el interior."),
      R("El umbral desaparece y todo estímulo genera espiga.","El umbral no desaparece por hiperpolarización."),
      R("Se libera neurotransmisor sin potencial de acción.","Hiperpolarización postsináptica no desencadena exocitosis presináptica." )],2,"La respuesta correcta es C. Una membrana más negativa suele requerir mayor despolarización para alcanzar el umbral, por lo que baja la probabilidad de disparo.",["Hiperpolarización = más negativo.","Más lejos del umbral.","Menor excitabilidad."],"Hiperpolarización y umbral","hiperpolarizacion_umbral","reasoning","application","medium"),

    Q("Integración avanzada","Difícil","Si una neurona se despolariza parcialmente pero no alcanza el umbral, ¿qué concepto la describe mejor?","Potencial graduado despolarizante subumbral.",[
      R("Potencial de acción completo.","Sin umbral no hay PA completo."),
      R("Refractario absoluto.","El refractario absoluto es imposibilidad de disparar por Na⁺ inactivado."),
      R("Conducción saltatoria nodal.","No se describe propagación en axón mielinizado." )],3,"La respuesta correcta es D. Una despolarización parcial que no alcanza umbral es un potencial graduado subumbral.",["Despolarización parcial = graduado.","Sin umbral = no PA.","Puede sumarse con otros estímulos."],"Despolarización subumbral","despolarizacion_subumbral","reasoning","application","medium"),

    Q("Aplicación: temperatura","Difícil","Una reducción marcada de temperatura enlentece la cinética de canales iónicos. ¿Qué efecto general podría observarse en la excitabilidad?","Conducción más lenta por cambios en apertura, cierre e inactivación de canales.",[
      R("Conversión del potencial de acción en corriente de electrones metálicos.","La base sigue siendo iónica."),
      R("Liberación de neurotransmisor independiente de Ca²⁺.","La exocitosis química sigue dependiendo de Ca²⁺."),
      R("Eliminación de gradientes iónicos por desaparición de membrana.","La membrana no desaparece por enfriamiento." )],0,"La respuesta correcta es A. La velocidad y la excitabilidad dependen de la cinética de canales; si esta se enlentece, la conducción puede ser más lenta.",["Canales tienen cinética.","Apertura/cierre importan.","La señal sigue siendo iónica."],"Temperatura y canales","temperatura_canales","clinical_application","reasoning","hard"),

    Q("Aplicación: lesión axonal","Difícil","Una lesión reduce el diámetro efectivo de un axón. ¿Qué efecto general se espera sobre la conducción?","Mayor resistencia interna y tendencia a conducción más lenta.",[
      R("Conducción más rápida por menor resistencia interna.","Menor diámetro aumenta resistencia interna."),
      R("Liberación de neurotransmisor en todos los internodos.","El diámetro axonal no convierte internodos en terminales sinápticas."),
      R("Cambio obligatorio de Na⁺ por Cl⁻ en la fase ascendente.","La fase ascendente neuronal sigue dependiendo de Na⁺." )],1,"La respuesta correcta es B. Un mayor diámetro reduce resistencia interna y facilita conducción; si el diámetro efectivo disminuye, la propagación se vuelve menos eficiente.",["Mayor diámetro = más rápido.","Menor diámetro = más resistencia.","Mielina y diámetro afectan velocidad."],"Diámetro axonal","diametro_axonal","clinical_application","reasoning","hard"),

    Q("Aplicación: terminal sináptica","Difícil","Un potencial de acción llega a la terminal, pero no hay vesículas disponibles para fusionarse. ¿Qué se altera más directamente?","La liberación de neurotransmisor, aunque la conducción axonal haya ocurrido.",[
      R("La fase ascendente inicial por ausencia de Na⁺.","La conducción ya llegó a la terminal; el problema es vesicular."),
      R("El potencial de equilibrio del K⁺ en reposo.","La disponibilidad vesicular no define E_K."),
      R("La presencia de nodos de Ranvier.","Las vesículas no determinan los nodos." )],2,"La réponse correcte es C. La transmisión química requiere vesículas disponibles, además de entrada de Ca²⁺; si faltan, disminuye la liberación.",["Conducción axonal ≠ liberación vesicular.","Ca²⁺ y vesículas son necesarios.","Terminal presináptica ejecuta exocitosis."],"Vesículas sinápticas","vesiculas_disponibles","clinical_application","reasoning","hard"),

    Q("Aplicación: receptor postsináptico","Difícil","Si hay neurotransmisor normal en la hendidura, pero el receptor postsináptico está bloqueado, ¿qué falla primero?","La generación del potencial postsináptico correspondiente.",[
      R("La llegada axonal del potencial de acción a la terminal.","El bloqueo postsináptico no impide la llegada presináptica."),
      R("La entrada de Ca²⁺ presináptico antes de la liberación.","El receptor postsináptico actúa después de la liberación."),
      R("La síntesis de mielina en el internodo.","El receptor postsináptico no controla la mielina internodal." )],3,"La respuesta correcta es D. El neurotransmisor necesita un receptor funcional para producir EPSP, IPSP u otra respuesta postsináptica.",["Neurotransmisor necesita receptor.","Presináptico y postsináptico son pasos distintos.","PSP depende del receptor."],"Bloqueo receptor postsináptico","bloqueo_receptor_post","clinical_application","reasoning","hard"),

    Q("Aplicación: bomba","Difícil","Una célula conserva canales normales, pero no puede producir ATP suficiente durante tiempo prolongado. ¿Qué componente de la excitabilidad se afectará progresivamente?","El mantenimiento de gradientes iónicos por bombas dependientes de ATP.",[
      R("La existencia inmediata de todos los canales de fuga.","Los canales pueden existir, pero los gradientes que aprovechan se deterioran."),
      R("La conversión directa de Ca²⁺ en neurotransmisor.","Ca²⁺ no se convierte en neurotransmisor."),
      R("La creación instantánea de mielina nueva.","El ATP bajo no crea mielina nueva instantáneamente." )],0,"La respuesta correcta es A. Las bombas necesitan ATP para sostener gradientes; sin energía, la excitabilidad falla progresivamente aunque los canales sigan presentes.",["ATP sostiene bombas.","Bombas mantienen gradientes.","Canales sin gradientes no funcionan igual."],"ATP y bomba","atp_bomba_gradientes","clinical_application","reasoning","hard"),

    Q("Pregunta de integración","Examen","¿Cuál opción integra correctamente reposo, ascenso y descenso de la curva neuronal?","Reposo: K⁺ de fuga; ascenso: Na⁺ entra; descenso: K⁺ sale.",[
      R("Reposo: Ca²⁺; ascenso: Cl⁻; descenso: Na⁺ entra.","Invierte los iones principales."),
      R("Reposo: electrones; ascenso: glucosa; descenso: mielina.","No corresponde a electricidad biológica iónica."),
      R("Reposo: bomba apagada; ascenso: K⁺ entra; descenso: Ca²⁺ sale.","La bomba no está apagada y las direcciones son incorrectas." )],1,"La respuesta correcta es B. Esta tríada resume el algoritmo básico de la curva: K⁺ sostiene reposo, Na⁺ sube y K⁺ baja.",["Reposo = K⁺.","Ascenso = Na⁺.","Descenso = K⁺."],"Integración curva","integracion_curva_ionica","summary","reasoning","hard"),

    Q("Pregunta de integración","Examen","¿Cuál opción integra correctamente conducción y sinapsis?","Na⁺ regenera el potencial en el axón; Ca²⁺ presináptico desencadena liberación de neurotransmisor.",[
      R("Ca²⁺ regenera el potencial axonal clásico; Na⁺ libera vesículas.","Invierte Na⁺ axonal y Ca²⁺ presináptico."),
      R("Cl⁻ conduce la señal por nodos; glucosa abre receptores postsinápticos.","Cl⁻ y glucosa no tienen esas funciones."),
      R("La bomba Na⁺/K⁺ libera neurotransmisor directamente.","La bomba mantiene gradientes; no es el mecanismo directo de exocitosis." )],2,"La respuesta correcta es C. La conducción axonal y la liberación sináptica son pasos distintos: Na⁺ para la espiga y Ca²⁺ para exocitosis.",["Na⁺ = conducción.","Ca²⁺ = exocitosis.","No confundir pasos."],"Integración conducción-sinapsis","integracion_na_ca","summary","reasoning","hard"),

    Q("Pregunta de integración","Examen","¿Cuál opción integra correctamente señales locales y señal axonal?","Los potenciales graduados se integran; si alcanzan umbral, disparan un potencial de acción.",[
      R("Los potenciales de acción se suman como señales locales en dendritas.","Los potenciales de acción no se suman como potenciales graduados."),
      R("Los potenciales graduados no pueden modificar la probabilidad de disparo.","Sí pueden acercar o alejar del umbral."),
      R("El umbral depende de que la mielina libere neurotransmisor.","El umbral depende de despolarización y canales de Na⁺." )],3,"La respuesta correcta es D. Las señales locales graduadas se suman en la neurona; al alcanzar umbral, aparece una espiga axonal todo o nada.",["Graduados integran.","Umbral decide.","PA se propaga."],"Integración local-axonal","integracion_local_axonal","summary","reasoning","hard"),

    Q("Pregunta de integración","Examen","¿Cuál opción resume mejor la función de la mielina y los nodos?","La mielina reduce pérdidas de corriente y los nodos regeneran el potencial de acción.",[
      R("La mielina libera neurotransmisor y los nodos almacenan glucosa.","Mielina y nodos no tienen esas funciones."),
      R("La mielina destruye canales de Na⁺ y los nodos bloquean toda conducción.","La conducción saltatoria requiere canales de Na⁺ nodales."),
      R("La mielina reemplaza los gradientes iónicos y los nodos reemplazan la bomba.","Ni mielina ni nodos reemplazan gradientes o bombas." )],0,"La respuesta correcta es A. La mielina actúa como aislante y los nodos concentran canales para regenerar la señal.",["Mielina aísla.","Nodo regenera.","Saltatoria acelera."],"Integración mielina-nodo","integracion_mielina_nodo","summary","reasoning","hard"),

    Q("Pregunta de integración","Examen","¿Cuál opción resume correctamente por qué la neurona es excitable?","Porque posee gradientes iónicos, membrana selectiva y canales regulables que cambian el voltaje.",[
      R("Porque todos los iones atraviesan libremente la bicapa sin canales.","La selectividad de membrana es indispensable."),
      R("Porque los electrones circulan por el axón como en un metal.","La electricidad neuronal es iónica, no metálica."),
      R("Porque la glucosa produce directamente cada fase de la curva.","La glucosa aporta energía, pero no es la corriente inmediata." )],1,"La respuesta correcta es B. La excitabilidad surge de la interacción entre gradientes, barrera selectiva y cambios de permeabilidad por canales.",["Gradientes + membrana + canales.","Iones modifican Vm.","La bomba sostiene gradientes."],"Síntesis de excitabilidad","sintesis_excitabilidad","summary","reasoning","hard"),

    Q("Pregunta final de algoritmo","Examen","Un enunciado pregunta por la causa inmediata de la señal eléctrica neuronal. ¿Qué respuesta debe priorizarse?","Movimiento selectivo de iones a través de canales de membrana.",[
      R("Movimiento de electrones por el citoplasma.","Es el error de cable metálico."),
      R("Difusión de glucosa que sustituye a los iones.","La glucosa no es la corriente inmediata."),
      R("Contracción de proteínas en todos los axones.","La contracción proteica no explica la señal eléctrica neuronal." )],2,"La respuesta correcta es C. La base inmediata de la señal eléctrica neuronal es el cambio de voltaje por corrientes iónicas transmembrana.",["Señal inmediata = iones.","Canales regulan permeabilidad.","No electrones ni glucosa."],"Algoritmo base eléctrica","algoritmo_base_electrica","pattern_recognition","reasoning","hard"),

    Q("Pregunta final de algoritmo","Examen","Un enunciado pregunta por el sitio típico donde la suma de señales decide el disparo. ¿Qué debe elegirse?","Segmento inicial del axón.",[
      R("Vaina de mielina internodal.","La mielina aísla, no decide la suma sináptica."),
      R("Hendidura sináptica como única zona de umbral.","La hendidura permite comunicación química, pero no es el sitio típico de disparo axonal."),
      R("Núcleo neuronal como generador inmediato de espigas.","El núcleo no es el disparador inmediato del PA." )],3,"La respuesta correcta es D. El segmento inicial tiene alta densidad de canales de Na⁺ y recibe la suma funcional de señales graduadas.",["Segmento inicial integra.","Alta densidad de Na⁺.","Umbral inicia PA."],"Algoritmo segmento inicial","algoritmo_segmento_inicial","pattern_recognition","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.qcm, 140+i, items[i]);

  ROOT.fisiologiaQualityPatchV319 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 141-180",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:40,
    notes:"Replaces QCM 141-180 with an exam-oriented batch focused on case-style reasoning, graph interpretation, ion/channel traps, conduction and synaptic integration."
  };
})();
