/* v316 — Fisiología quality patch, Módulo 1 QCM 021–060.
   Scope: replaces QCM 021–060 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v316-m1-qcm-021-060";

  function hits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function replaceModuleIndex(arr, index, item){
    var h = hits(arr);
    if(!h[index]) return false;
    var old = h[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 1;
    merged.moduleTitle = old.moduleTitle || "Neurofisiología y potencial de acción";
    merged.qualityPatch = PATCH;
    merged.auditDecision = item.auditDecision || "B";
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:1, format:"qcm", visible:false, adaptiveVersion:"v316"});
    arr[h[index].i] = merged;
    return true;
  }
  function W(a,b,c,d){ return [a,b,c,d]; }
  function T(topic, slug, skill, level, diff){ return {topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}; }

  var items = [
    {
      auditDecision:"B", heading:"Membrana como capacitor", difficulty:"Medio",
      question:"¿Por qué se compara la membrana plasmática de una neurona con un capacitor biológico?",
      options:["Porque separa cargas a ambos lados de una bicapa poco permeable a iones.","Porque almacena ATP dentro de los canales de Na⁺ dependientes de voltaje.","Porque permite el paso libre de todos los iones sin necesidad de canales.","Porque transforma directamente proteínas citoplasmáticas en electrones móviles."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La bicapa lipídica separa cargas y limita el paso libre de iones; pequeños movimientos iónicos cerca de la membrana modifican el voltaje sin cambiar de forma masiva las concentraciones globales.",
      whyWrong:W(null,"Falsa. El ATP no se almacena dentro de los canales de Na⁺ como base del voltaje.","Falsa. La bicapa no permite paso libre de iones; se requieren canales o transportadores.","Falsa. La señal eléctrica neuronal no se basa en electrones ni en transformación de proteínas."),
      distractorExplanations:W(null,"Confunde energía metabólica con capacitancia de membrana.","Niega la selectividad de la membrana.","Confunde electricidad biológica con corriente metálica."),
      keyPoints:["La bicapa separa cargas.","Pequeños flujos iónicos cambian Vm.","La membrana no deja pasar iones libremente."],
      tags:T("Membrana como capacitor","membrana_capacitor","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Canales de fuga", difficulty:"Base",
      question:"¿Cuál es la función principal de los canales de fuga de K⁺ en la neurona en reposo?",
      options:["Permitir una permeabilidad basal al K⁺ que contribuye al potencial de reposo.","Abrirse solo en el pico del potencial de acción para permitir entrada de Na⁺.","Bloquear la bomba Na⁺/K⁺ cuando el potencial alcanza el umbral.","Liberar neurotransmisor directamente desde el soma neuronal."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los canales de fuga de K⁺ permiten salida basal de K⁺ y hacen que el potencial de reposo se acerque al potencial de equilibrio del K⁺.",
      whyWrong:W(null,"Falsa. Describe canales de Na⁺ dependientes de voltaje, no canales de fuga de K⁺.","Falsa. Los canales de fuga no bloquean la bomba Na⁺/K⁺.","Falsa. La liberación de neurotransmisor ocurre en terminales sinápticas y depende de Ca²⁺."),
      distractorExplanations:W(null,"Confunde canal de fuga con canal voltaje-dependiente.","Atribuye una función reguladora inexistente.","Confunde reposo con sinapsis."),
      keyPoints:["K⁺ de fuga domina el reposo.","Vm se aproxima a E_K.","Canal de fuga ≠ canal voltaje-dependiente."],
      tags:T("Canales de fuga","canales_fuga_k","definition","recall","basic")
    },
    {
      auditDecision:"B", heading:"Canales activados por ligando", difficulty:"Medio",
      question:"¿Qué caracteriza a un canal activado por ligando en una neurona?",
      options:["Se abre o modifica su estado cuando una molécula específica se une al receptor-canal.","Se abre exclusivamente cuando el potencial de membrana alcanza +30 mV.","Consume ATP para transportar siempre 3 Na⁺ hacia fuera y 2 K⁺ hacia dentro.","Funciona solo en nodos de Ranvier durante la conducción saltatoria."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los canales activados por ligando responden a la unión de una molécula, como un neurotransmisor, y pueden modificar la excitabilidad postsináptica.",
      whyWrong:W(null,"Falsa. Eso corresponde mejor a canales dependientes de voltaje.","Falsa. Describe la bomba Na⁺/K⁺ ATPasa, no un canal activado por ligando.","Falsa. Los nodos concentran canales voltaje-dependientes para conducción, no definen todos los canales por ligando."),
      distractorExplanations:W(null,"Confunde voltaje con ligando.","Confunde bomba con canal.","Confunde localización axonal con mecanismo de apertura."),
      keyPoints:["Ligando = molécula que se une.","Puede generar potenciales postsinápticos.","No todos los canales dependen del voltaje."],
      tags:T("Canales por ligando","canales_ligando","definition","application","medium")
    },
    {
      auditDecision:"B", heading:"Canales dependientes de voltaje", difficulty:"Base",
      question:"¿Qué estímulo abre típicamente los canales de Na⁺ dependientes de voltaje durante el inicio del potencial de acción?",
      options:["Una despolarización suficiente de la membrana hasta el umbral.","La unión directa de glucosa al poro del canal.","La salida continua de Cl⁻ desde la terminal presináptica.","La entrada de K⁺ por la bomba Na⁺/K⁺ ATPasa."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los canales de Na⁺ dependientes de voltaje se activan cuando la membrana se despolariza hasta un valor crítico, lo que inicia la fase ascendente.",
      whyWrong:W(null,"Falsa. La glucosa no es el ligando directo de esos canales.","Falsa. El Cl⁻ no abre los canales de Na⁺ dependientes de voltaje para iniciar la espiga.","Falsa. La bomba introduce K⁺ y expulsa Na⁺, pero no abre directamente esos canales."),
      distractorExplanations:W(null,"Confunde metabolismo con activación por voltaje.","Asigna al Cl⁻ un papel incorrecto.","Confunde bomba con canal voltaje-dependiente."),
      keyPoints:["Despolarización hasta umbral abre Na⁺.","Na⁺ dependiente de voltaje inicia espiga.","La bomba no abre el canal."],
      tags:T("Canales voltaje-dependientes","canales_voltaje","mechanism","recall","basic")
    },
    {
      auditDecision:"B", heading:"Distribución del Na⁺", difficulty:"Base",
      question:"En condiciones fisiológicas, ¿dónde se encuentra principalmente el Na⁺ y hacia dónde tiende a moverse cuando se abren sus canales?",
      options:["Predomina en el líquido extracelular y tiende a entrar a la célula.","Predomina en el citoplasma y tiende a salir siempre por canales de fuga.","Predomina en el núcleo y tiende a unirse a receptores postsinápticos.","Predomina en vesículas sinápticas y tiende a liberar neurotransmisor."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El Na⁺ es mucho más abundante en el líquido extracelular y su gradiente electroquímico favorece la entrada celular cuando aumenta la permeabilidad al Na⁺.",
      whyWrong:W(null,"Falsa. El Na⁺ no predomina en el citoplasma en condiciones normales.","Falsa. El Na⁺ no se define por predominio nuclear ni por unión a receptores postsinápticos.","Falsa. Las vesículas contienen neurotransmisores; la liberación depende de Ca²⁺ presináptico."),
      distractorExplanations:W(null,"Invierte la distribución del Na⁺.","Confunde ion con receptor.","Confunde Na⁺ con Ca²⁺ y vesículas."),
      keyPoints:["Na⁺ alto fuera.","Na⁺ entra durante despolarización.","Entrada de Na⁺ vuelve menos negativo el interior."],
      tags:T("Sodio","sodio_distribucion","definition","recall","basic")
    },
    {
      auditDecision:"B", heading:"Distribución del K⁺", difficulty:"Base",
      question:"En una neurona, ¿cuál es la distribución fisiológica típica del K⁺ y su movimiento cuando aumenta la permeabilidad al K⁺?",
      options:["Predomina dentro de la célula y tiende a salir siguiendo su gradiente químico.","Predomina fuera de la célula y entra para producir la repolarización.","Predomina en la hendidura sináptica y abre receptores postsinápticos.","Predomina en la mielina y se libera en los nodos de Ranvier."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El K⁺ es el principal catión intracelular. Cuando se abren canales de K⁺, tiende a salir, lo que contribuye al reposo, la repolarización y la hiperpolarización.",
      whyWrong:W(null,"Falsa. El K⁺ no predomina extracelularmente y su entrada no explica la repolarización clásica.","Falsa. No es el neurotransmisor principal de la hendidura sináptica.","Falsa. La mielina no almacena K⁺ para liberarlo en los nodos."),
      distractorExplanations:W(null,"Invierte distribución y dirección.","Confunde ion intracelular con neurotransmisor.","Atribuye a la mielina una función inexistente."),
      keyPoints:["K⁺ alto dentro.","K⁺ sale en repolarización.","Salida prolongada de K⁺ puede hiperpolarizar."],
      tags:T("Potasio","potasio_distribucion","definition","recall","basic")
    },
    {
      auditDecision:"B", heading:"Papel del Ca²⁺", difficulty:"Medio",
      question:"¿Cuál es una función fisiológica importante del Ca²⁺ en la neurofisiología del módulo?",
      options:["Entrar en la terminal presináptica para desencadenar liberación de neurotransmisor.","Sustituir al Na⁺ como principal ion de la fase ascendente neuronal clásica.","Salir de la célula para producir la hiperpolarización pospotencial.","Mantener por sí solo el potencial de reposo en -70 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. En la sinapsis química, la llegada del potencial de acción abre canales de Ca²⁺ presinápticos; la entrada de Ca²⁺ favorece la fusión vesicular y la liberación del neurotransmisor.",
      whyWrong:W(null,"Falsa. En la neurona clásica, la fase ascendente rápida depende de Na⁺.","Falsa. La hiperpolarización se relaciona sobre todo con salida persistente de K⁺.","Falsa. El reposo neuronal típico depende principalmente de la permeabilidad al K⁺."),
      distractorExplanations:W(null,"Confunde Na⁺ axonal con Ca²⁺ sináptico.","Atribuye al Ca²⁺ el papel del K⁺.","Atribuye al Ca²⁺ el papel dominante del K⁺ en reposo."),
      keyPoints:["Ca²⁺ presináptico libera neurotransmisor.","Na⁺ conduce la espiga neuronal.","K⁺ domina reposo/repolarización."],
      tags:T("Calcio sináptico","calcio_sinaptico","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Papel del Cl⁻", difficulty:"Medio",
      question:"¿Qué efecto suele tener la entrada de Cl⁻ en una neurona postsináptica adulta típica?",
      options:["Favorecer estabilización o hiperpolarización relativa, disminuyendo la excitabilidad.","Generar la fase ascendente rápida del potencial de acción por entrada de cargas positivas.","Reemplazar al Ca²⁺ en la liberación de neurotransmisor presináptico.","Abrir la bomba Na⁺/K⁺ para iniciar la conducción saltatoria."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El Cl⁻ suele favorecer respuestas inhibitorias o estabilizadoras porque su entrada introduce carga negativa o limita la despolarización postsináptica.",
      whyWrong:W(null,"Falsa. La fase ascendente rápida se debe a entrada de Na⁺, no de Cl⁻.","Falsa. La liberación vesicular depende de Ca²⁺ presináptico.","Falsa. La bomba Na⁺/K⁺ no inicia la conducción saltatoria."),
      distractorExplanations:W(null,"Invierte carga y función del Cl⁻.","Confunde Cl⁻ con Ca²⁺.","Confunde transporte activo con conducción axonal."),
      keyPoints:["Cl⁻ suele inhibir o estabilizar.","Na⁺ despolariza rápidamente.","Ca²⁺ libera neurotransmisor."],
      tags:T("Cloro e inhibición","cloro_inhibicion","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Potenciales de equilibrio", difficulty:"Base",
      question:"¿Qué valor aproximado se asocia al potencial de equilibrio del Na⁺ en una neurona típica?",
      options:["+60 mV.","-90 mV.","-70 mV.","-55 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de equilibrio del Na⁺ suele aproximarse a +60 mV; por eso, cuando la permeabilidad al Na⁺ aumenta, el potencial de membrana tiende a valores más positivos.",
      whyWrong:W(null,"Falsa. -90 mV se aproxima más al potencial de equilibrio del K⁺.","Falsa. -70 mV corresponde al potencial de reposo neuronal típico.","Falsa. -55 mV se usa como valor aproximado de umbral."),
      distractorExplanations:W(null,"Confunde ENa con EK.","Confunde ENa con reposo.","Confunde ENa con umbral."),
      keyPoints:["ENa ≈ +60 mV.","EK ≈ -90 mV.","Reposo ≈ -70 mV; umbral ≈ -55 mV."],
      tags:T("Valores de referencia","valores_referencia","recall","recall","basic")
    },
    {
      auditDecision:"B", heading:"Potenciales de equilibrio", difficulty:"Base",
      question:"¿Qué valor aproximado se asocia al potencial de equilibrio del K⁺?",
      options:["-90 mV.","+60 mV.","+30 mV.","-55 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de equilibrio del K⁺ se aproxima a -90 mV. Por eso la salida de K⁺ tiende a hacer el interior más negativo.",
      whyWrong:W(null,"Falsa. +60 mV se asocia al Na⁺.","Falsa. +30 mV es un pico aproximado del potencial de acción neuronal.","Falsa. -55 mV es un umbral aproximado, no E_K."),
      distractorExplanations:W(null,"Confunde EK con ENa.","Confunde equilibrio de K⁺ con pico de espiga.","Confunde EK con umbral."),
      keyPoints:["EK ≈ -90 mV.","K⁺ alto dentro tiende a salir.","Salida de K⁺ vuelve el interior más negativo."],
      tags:T("Valores de referencia","ek_potasio","recall","recall","basic")
    },
    {
      auditDecision:"B", heading:"Valores de referencia", difficulty:"Base",
      question:"¿Cuál es el valor aproximado del potencial de reposo neuronal típico mencionado en el módulo?",
      options:["-70 mV.","+60 mV.","+30 mV.","0 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de reposo neuronal típico se aproxima a -70 mV, principalmente por la mayor permeabilidad al K⁺ en reposo.",
      whyWrong:W(null,"Falsa. +60 mV se aproxima a E_Na.","Falsa. +30 mV corresponde al pico aproximado del potencial de acción.","Falsa. 0 mV no corresponde al reposo neuronal típico."),
      distractorExplanations:W(null,"Confunde reposo con equilibrio del Na⁺.","Confunde reposo con pico.","Pierde la negatividad basal de la neurona."),
      keyPoints:["Reposo ≈ -70 mV.","Umbral ≈ -55 mV.","Pico ≈ +30 mV."],
      tags:T("Valores de referencia","reposo_70mv","recall","recall","basic")
    },
    {
      auditDecision:"B", heading:"Valores de referencia", difficulty:"Base",
      question:"¿Cuál es el valor aproximado del umbral neuronal clásico usado para iniciar un potencial de acción?",
      options:["-55 mV.","-90 mV.","+60 mV.","-120 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El umbral neuronal típico se aproxima a -55 mV; al alcanzarlo se abre una cantidad suficiente de canales de Na⁺ dependientes de voltaje.",
      whyWrong:W(null,"Falsa. -90 mV se aproxima a E_K.","Falsa. +60 mV se aproxima a E_Na.","Falsa. -120 mV es demasiado negativo para el umbral clásico del módulo."),
      distractorExplanations:W(null,"Confunde umbral con EK.","Confunde umbral con ENa.","Valor incompatible con la referencia del módulo."),
      keyPoints:["Umbral ≈ -55 mV.","Reposo ≈ -70 mV.","Al umbral se dispara la ley del todo o nada."],
      tags:T("Umbral","umbral_55mv","recall","recall","basic")
    },
    {
      auditDecision:"B", heading:"Pico del potencial de acción", difficulty:"Base",
      question:"¿Qué valor aproximado puede alcanzar el pico del potencial de acción neuronal clásico?",
      options:["+30 mV.","-70 mV.","-90 mV.","-55 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Durante la fase ascendente, la entrada rápida de Na⁺ puede llevar el potencial de membrana a un pico aproximado cercano a +30 mV antes de la inactivación de Na⁺ y la salida de K⁺.",
      whyWrong:W(null,"Falsa. -70 mV es reposo.","Falsa. -90 mV se aproxima a E_K.","Falsa. -55 mV se aproxima al umbral."),
      distractorExplanations:W(null,"Confunde pico con reposo.","Confunde pico con equilibrio del K⁺.","Confunde pico con umbral."),
      keyPoints:["Pico ≈ +30 mV.","El pico termina con inactivación de Na⁺.","Luego predomina salida de K⁺."],
      tags:T("Pico del potencial","pico_accion","recall","recall","basic")
    },
    {
      auditDecision:"B", heading:"Ley del todo o nada", difficulty:"Medio",
      question:"¿Qué implica la ley del todo o nada en el potencial de acción neuronal?",
      options:["Si se alcanza el umbral, el potencial de acción se genera con amplitud relativamente constante.","Cada estímulo subumbral genera una espiga completa si dura suficiente tiempo.","La amplitud de cada espiga aumenta de forma proporcional con la intensidad del estímulo.","La bomba Na⁺/K⁺ decide directamente si la respuesta será parcial o total."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de acción aparece como respuesta completa si se alcanza el umbral. Los estímulos más intensos no aumentan mucho la amplitud de una espiga individual, sino la frecuencia de descarga.",
      whyWrong:W(null,"Falsa. Un estímulo subumbral puede generar potencial graduado, pero no una espiga completa por sí solo.","Falsa. Confunde intensidad del estímulo con amplitud de la espiga.","Falsa. La bomba mantiene gradientes, pero el umbral y los canales de Na⁺ determinan la espiga."),
      distractorExplanations:W(null,"Niega el requisito de umbral.","Confunde codificación por frecuencia con amplitud.","Atribuye decisión de disparo a la bomba."),
      keyPoints:["Umbral alcanzado = espiga completa.","Subumbral = no hay PA.","Más intensidad = mayor frecuencia, no mayor espiga."],
      tags:T("Todo o nada","todo_o_nada","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Potenciales graduados", difficulty:"Medio",
      question:"¿Qué propiedad permite que varios potenciales graduados acerquen la membrana al umbral?",
      options:["La sumación espacial o temporal de cambios locales de voltaje.","La inactivación permanente de todos los canales de Na⁺.","La desaparición de la permeabilidad al K⁺ en reposo.","La conducción saltatoria dentro de la vaina de mielina."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los potenciales graduados pueden sumarse en el tiempo o en el espacio; si la suma despolariza suficientemente el segmento inicial, puede alcanzarse el umbral.",
      whyWrong:W(null,"Falsa. La inactivación de Na⁺ impide disparar, no facilita la sumación.","Falsa. La permeabilidad al K⁺ no desaparece como mecanismo normal de sumación.","Falsa. La conducción saltatoria es propagación axonal, no suma local postsináptica."),
      distractorExplanations:W(null,"Confunde sumación con refractariedad.","Propone un cambio extremo no fisiológico.","Confunde integración sináptica con conducción axonal."),
      keyPoints:["Potenciales graduados pueden sumarse.","Sumación temporal = repetición en el tiempo.","Sumación espacial = varias entradas simultáneas."],
      tags:T("Sumación","sumacion_graduados","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Segmento inicial del axón", difficulty:"Medio",
      question:"¿Por qué el segmento inicial del axón es un sitio clave para iniciar el potencial de acción?",
      options:["Porque posee alta densidad de canales de Na⁺ dependientes de voltaje y evalúa la suma de señales locales.","Porque contiene la mayoría de las vesículas sinápticas que liberan neurotransmisor.","Porque allí la mielina impide por completo cualquier cambio de voltaje.","Porque allí la bomba Na⁺/K⁺ deja de funcionar para permitir el umbral."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El segmento inicial integra la despolarización que llega desde soma y dendritas y tiene alta densidad de canales de Na⁺ dependientes de voltaje, lo que facilita el disparo del potencial de acción.",
      whyWrong:W(null,"Falsa. Las vesículas sinápticas se localizan principalmente en terminales presinápticas.","Falsa. El segmento inicial no se define por bloqueo completo del voltaje por mielina.","Falsa. La bomba no debe detenerse para alcanzar el umbral."),
      distractorExplanations:W(null,"Confunde segmento inicial con terminal sináptica.","Confunde aislamiento con inicio de espiga.","Confunde metabolismo iónico con disparo por canales."),
      keyPoints:["Segmento inicial = alta densidad de Na⁺.","Integra potenciales graduados.","Es zona típica de inicio del PA."],
      tags:T("Segmento inicial","segmento_inicial","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Pico e inactivación", difficulty:"Medio",
      question:"¿Qué evento limita la fase ascendente del potencial de acción y favorece el cambio hacia la repolarización?",
      options:["La inactivación de canales de Na⁺ y la apertura retardada de canales de K⁺.","La apertura permanente de canales de Na⁺ de fuga en todo el axón.","La entrada masiva de Cl⁻ que vuelve positivo el interior celular.","La detención completa de todos los gradientes iónicos neuronales."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Al llegar al pico, los canales de Na⁺ se inactivan y los canales de K⁺ dependientes de voltaje permiten salida de K⁺, lo que inicia la repolarización.",
      whyWrong:W(null,"Falsa. La entrada sostenida de Na⁺ no explica el final de la fase ascendente.","Falsa. El Cl⁻ no vuelve positivo el interior celular.","Falsa. Los gradientes no se detienen por completo durante una espiga."),
      distractorExplanations:W(null,"Niega la inactivación de Na⁺.","Invierte el efecto del Cl⁻.","Exagera los cambios iónicos de una espiga."),
      keyPoints:["Pico = Na⁺ se inactiva.","K⁺ se abre con retraso.","Cambio Na⁺→K⁺ baja la curva."],
      tags:T("Pico e inactivación","pico_inactivacion","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Canales de K⁺ retardados", difficulty:"Medio",
      question:"¿Por qué la apertura de canales de K⁺ dependientes de voltaje se considera más lenta que la de canales de Na⁺ en el potencial de acción?",
      options:["Porque su activación retardada contribuye a la fase descendente después de la despolarización rápida.","Porque solo se abren cuando entra Ca²⁺ en la terminal presináptica.","Porque se inactivan antes de que la membrana alcance el umbral.","Porque se abren únicamente por unión de neurotransmisor en la hendidura sináptica."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los canales de Na⁺ se activan rápidamente al umbral y generan la subida; los canales de K⁺ se activan más lentamente y favorecen la repolarización.",
      whyWrong:W(null,"Falsa. La entrada de Ca²⁺ presináptico se relaciona con liberación de neurotransmisor.","Falsa. La función de los canales de K⁺ no es inactivarse antes del umbral para iniciar la espiga.","Falsa. Eso describe canales activados por ligando, no canales de K⁺ voltaje-dependientes del PA."),
      distractorExplanations:W(null,"Confunde repolarización con sinapsis.","Invierte la cronología del canal.","Confunde voltaje-dependencia con ligando."),
      keyPoints:["Na⁺ abre rápido.","K⁺ abre más lento.","K⁺ retardado repolariza."],
      tags:T("Canales de K retardados","canales_k_retardados","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Lectura de gráfica", difficulty:"Examen",
      question:"En una gráfica de potencial de acción neuronal, ¿qué representa el ascenso rápido de la curva desde el umbral?",
      options:["Entrada rápida de Na⁺ por canales dependientes de voltaje.","Salida de K⁺ que lleva el potencial hacia E_K.","Entrada de Cl⁻ que hiperpolariza la membrana.","Entrada de Ca²⁺ que libera neurotransmisor postsináptico."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El ascenso rápido de la gráfica corresponde a la despolarización por entrada de Na⁺ a través de canales dependientes de voltaje.",
      whyWrong:W(null,"Falsa. La salida de K⁺ corresponde al descenso o repolarización.","Falsa. La entrada de Cl⁻ no explica el ascenso positivo de la espiga.","Falsa. El Ca²⁺ presináptico se asocia a liberación de neurotransmisor, no al ascenso axonal típico."),
      distractorExplanations:W(null,"Confunde subida con bajada.","Confunde inhibición con despolarización rápida.","Confunde axón con terminal presináptica."),
      keyPoints:["Ascenso = Na⁺ entra.","Descenso = K⁺ sale.","Ca²⁺ = sinapsis/meseta según contexto."],
      tags:T("Gráfica del PA","grafica_ascenso","graph_interpretation","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Lectura de gráfica", difficulty:"Examen",
      question:"En una gráfica del potencial de acción, ¿qué indica que el potencial baje por debajo del reposo antes de recuperarse?",
      options:["Hiperpolarización por persistencia transitoria de la conductancia al K⁺.","Nueva fase ascendente causada por entrada adicional de Na⁺.","Desaparición completa de todos los gradientes iónicos.","Liberación de neurotransmisor en la hendidura sináptica."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Si el potencial cae por debajo del reposo, suele deberse a que los canales de K⁺ siguen abiertos transitoriamente y el potencial se acerca a E_K.",
      whyWrong:W(null,"Falsa. La entrada de Na⁺ despolarizaría, no llevaría por debajo del reposo.","Falsa. Los gradientes no desaparecen por una espiga normal.","Falsa. La liberación sináptica no explica por sí misma la hiperpolarización de la gráfica axonal."),
      distractorExplanations:W(null,"Invierte el efecto del Na⁺.","Exagera los cambios de concentración.","Confunde fenómeno axonal con evento sináptico."),
      keyPoints:["Debajo del reposo = hiperpolarización.","K⁺ sigue saliendo.","Luego se recupera el reposo."],
      tags:T("Gráfica del PA","grafica_hiperpolarizacion","graph_interpretation","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Propagación axonal", difficulty:"Medio",
      question:"¿Qué permite que el potencial de acción se propague a lo largo del axón sin perder amplitud?",
      options:["La regeneración sucesiva del potencial de acción por apertura de canales dependientes de voltaje.","La difusión pasiva de glucosa desde el soma hasta la terminal axonal.","La circulación de electrones libres por el citoplasma axonal.","La apertura permanente de todos los canales de fuga en toda la membrana."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de acción se mantiene porque cada región activa corrientes locales que despolarizan la siguiente zona hasta el umbral, abriendo nuevos canales dependientes de voltaje.",
      whyWrong:W(null,"Falsa. La glucosa no transmite el potencial de acción.","Falsa. La conducción neuronal no es una corriente metálica de electrones.","Falsa. La apertura permanente de canales de fuga disiparía gradientes y no explica la propagación regenerativa."),
      distractorExplanations:W(null,"Confunde energía con señal.","Confunde electricidad biológica con metálica.","Confunde fuga basal con regeneración activa."),
      keyPoints:["PA se regenera.","Corrientes locales alcanzan umbral en la zona vecina.","La amplitud se conserva."],
      tags:T("Propagación axonal","propagacion_axonal","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Direccionalidad", difficulty:"Difícil",
      question:"¿Por qué la propagación del potencial de acción suele avanzar hacia adelante y no regresar inmediatamente a la zona recién activada?",
      options:["Porque la zona recién activada entra en período refractario por inactivación de canales de Na⁺.","Porque la mielina destruye los canales de Na⁺ detrás del frente de propagación.","Porque la bomba Na⁺/K⁺ invierte todos los gradientes hacia atrás.","Porque el neurotransmisor solo puede difundirse en dirección axonal anterógrada."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La región que acaba de disparar queda refractaria, sobre todo por inactivación de canales de Na⁺, lo que evita un nuevo disparo inmediato hacia atrás.",
      whyWrong:W(null,"Falsa. La mielina no destruye canales de Na⁺.","Falsa. La bomba no invierte gradientes para definir la dirección del PA.","Falsa. La propagación axonal no depende de difusión de neurotransmisor."),
      distractorExplanations:W(null,"Atribuye a la mielina una destrucción inexistente.","Confunde gradientes con refractariedad.","Confunde conducción axonal con transmisión sináptica."),
      keyPoints:["Refractario impide retroceso inmediato.","Na⁺ inactivado = no disponible.","La dirección se favorece por recuperación secuencial."],
      tags:T("Direccionalidad del PA","direccion_propagacion","mechanism","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Desmielinización", difficulty:"Difícil",
      question:"Si se pierde mielina en un axón, ¿qué consecuencia fisiológica se espera principalmente?",
      options:["Disminución de la velocidad y seguridad de conducción por pérdida de aislamiento eléctrico.","Aumento ilimitado de la amplitud de cada potencial de acción individual.","Conversión de todos los canales de K⁺ en canales de Ca²⁺.","Liberación de neurotransmisor en todos los internodos mielinizados."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La mielina reduce pérdidas de corriente y acelera la conducción saltatoria. Su pérdida dificulta que la despolarización alcance eficazmente el siguiente nodo.",
      whyWrong:W(null,"Falsa. La amplitud de la espiga no aumenta ilimitadamente por desmielinización.","Falsa. No existe conversión de canales de K⁺ en Ca²⁺.","Falsa. Los internodos no son sitios principales de liberación de neurotransmisor."),
      distractorExplanations:W(null,"Confunde velocidad con amplitud.","Inventa cambio de identidad del canal.","Confunde axón mielinizado con terminal sináptica."),
      keyPoints:["Mielina acelera y asegura conducción.","Desmielinización enlentece o bloquea.","Los nodos regeneran la señal."],
      tags:T("Desmielinización","desmielinizacion","clinical_application","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Nodo e internodo", difficulty:"Medio",
      question:"¿Cuál es la diferencia funcional esencial entre un nodo de Ranvier y un segmento internodal mielinizado?",
      options:["El nodo concentra canales de Na⁺ para regenerar el potencial; el internodo está aislado por mielina.","El nodo almacena neurotransmisor; el internodo libera Ca²⁺ hacia la hendidura sináptica.","El nodo impide todo cambio de voltaje; el internodo genera la espiga principal.","El nodo contiene la bomba apagada; el internodo contiene la bomba activa."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. En la conducción saltatoria, el internodo mielinizado permite desplazamiento rápido con poca fuga, y el nodo regenera el potencial por canales de Na⁺.",
      whyWrong:W(null,"Falsa. Neurotransmisor y Ca²⁺ pertenecen a la terminal sináptica, no a la diferencia nodo-internodo.","Falsa. Invierte los papeles: el nodo regenera la espiga.","Falsa. La diferencia no se define por bomba apagada o activa."),
      distractorExplanations:W(null,"Confunde conducción con sinapsis.","Invierte nodo e internodo.","Atribuye el fenómeno a la bomba."),
      keyPoints:["Nodo = canales de Na⁺.","Internodo = mielina aislante.","Saltatoria = salto funcional entre nodos."],
      tags:T("Nodo e internodo","nodo_internodo","comparison","application","medium")
    },
    {
      auditDecision:"B", heading:"Bloqueo de canales de Na⁺", difficulty:"Difícil",
      question:"Un fármaco bloquea canales de Na⁺ dependientes de voltaje en un axón. ¿Qué efecto directo se espera sobre el potencial de acción?",
      options:["Disminución o bloqueo de la fase ascendente rápida y de la conducción axonal.","Aumento de la salida de K⁺ hasta producir espigas de mayor amplitud.","Aumento de la liberación de neurotransmisor por entrada directa de Na⁺ en vesículas.","Desaparición del potencial de reposo por cierre de todos los canales de fuga de K⁺."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Sin canales de Na⁺ funcionales, la despolarización rápida no se produce adecuadamente y la señal no se propaga de forma normal por el axón.",
      whyWrong:W(null,"Falsa. Bloquear Na⁺ no aumenta directamente la salida de K⁺ para ampliar espigas.","Falsa. La liberación vesicular depende de Ca²⁺ presináptico, no de Na⁺ vesicular.","Falsa. El reposo depende sobre todo de K⁺ de fuga; no desaparece por bloquear canales de Na⁺ voltaje-dependientes."),
      distractorExplanations:W(null,"Confunde Na⁺ con K⁺.","Confunde conducción axonal con exocitosis.","Confunde canales de Na⁺ voltaje-dependientes con canales de fuga de K⁺."),
      keyPoints:["Bloqueo de Na⁺ bloquea fase ascendente.","Sin fase ascendente no hay conducción eficaz.","Ca²⁺, no Na⁺, desencadena liberación sináptica."],
      tags:T("Bloqueo de Na","bloqueo_na","clinical_application","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Gradiente vs permeabilidad", difficulty:"Examen",
      question:"¿Cuál frase distingue correctamente gradiente y permeabilidad en la excitabilidad neuronal?",
      options:["El gradiente empuja al ion; la permeabilidad permite que ese movimiento ocurra a través de la membrana.","La permeabilidad empuja al ion; el gradiente es solo el nombre del canal abierto.","Gradiente y permeabilidad son sinónimos exactos y siempre cambian juntos.","El gradiente solo existe cuando la bomba Na⁺/K⁺ está apagada."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El gradiente electroquímico representa la fuerza impulsora; la permeabilidad depende de canales o transportadores que permiten el flujo efectivo del ion.",
      whyWrong:W(null,"Falsa. Invierte fuerza impulsora y vía de paso.","Falsa. Son conceptos relacionados pero no equivalentes.","Falsa. Los gradientes se mantienen precisamente por la bomba activa y por distribución iónica."),
      distractorExplanations:W(null,"Invierte definiciones.","Elimina una distinción central del módulo.","Invierte el papel de la bomba."),
      keyPoints:["Gradiente empuja.","Permeabilidad permite.","Canal abierto traduce gradiente en corriente."],
      tags:T("Gradiente vs permeabilidad","gradiente_permeabilidad","exam_trap","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Bomba vs canal", difficulty:"Examen",
      question:"¿Cuál opción diferencia mejor una bomba iónica de un canal iónico?",
      options:["La bomba usa energía para mantener gradientes; el canal permite flujo rápido según el gradiente cuando está abierto.","La bomba siempre genera la espiga; el canal solo almacena ATP para el reposo.","La bomba y el canal son la misma estructura con nombres diferentes.","El canal mueve 3 Na⁺ hacia fuera y 2 K⁺ hacia dentro en cada ciclo de ATP."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La bomba Na⁺/K⁺ ATPasa consume ATP para mantener gradientes; los canales permiten corrientes rápidas que modifican el potencial de membrana.",
      whyWrong:W(null,"Falsa. La espiga depende de canales voltaje-dependientes, no de que la bomba la genere directamente.","Falsa. Bomba y canal tienen mecanismos diferentes.","Falsa. Esa estequiometría corresponde a la bomba, no a un canal."),
      distractorExplanations:W(null,"Confunde mantenimiento y espiga.","Niega diferencias estructurales y funcionales.","Atribuye al canal la estequiometría de la bomba."),
      keyPoints:["Bomba = ATP y gradientes.","Canal = flujo rápido.","No atribuir la espiga a la bomba."],
      tags:T("Bomba vs canal","bomba_vs_canal","comparison","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Excitabilidad celular", difficulty:"Base",
      question:"¿Qué condición es necesaria para que una célula sea excitable?",
      options:["Tener gradientes iónicos, membrana selectiva y canales capaces de modificar la permeabilidad.","Carecer por completo de diferencias de concentración entre interior y exterior.","Permitir que todos los iones atraviesen libremente la bicapa lipídica.","Depender exclusivamente de electrones citoplasmáticos para transmitir información."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La excitabilidad requiere gradientes iónicos mantenidos, una membrana que separe cargas y proteínas de membrana que cambien la permeabilidad en respuesta a estímulos.",
      whyWrong:W(null,"Falsa. Sin gradientes no hay fuerza impulsora para corrientes iónicas.","Falsa. Si todos los iones pasan libremente, no se mantiene el potencial de membrana.","Falsa. La señal biológica neuronal depende de iones, no de electrones libres."),
      distractorExplanations:W(null,"Niega los gradientes.","Niega la selectividad de membrana.","Confunde señal biológica con metal."),
      keyPoints:["Excitable = cambia Vm ante estímulo.","Requiere gradientes.","Requiere canales y membrana selectiva."],
      tags:T("Excitabilidad celular","excitabilidad","definition","recall","basic")
    },
    {
      auditDecision:"B", heading:"Tipos de células excitables", difficulty:"Medio",
      question:"¿Qué diferencia fisiológica general distingue al músculo cardíaco de una neurona típica en la forma del potencial de acción?",
      options:["El músculo cardíaco puede presentar una meseta prolongada relacionada con Ca²⁺, mientras la neurona típica tiene una espiga breve.","La neurona típica siempre presenta meseta larga por Ca²⁺ y el músculo cardíaco solo potenciales graduados.","Ambos tejidos tienen curvas idénticas y no existe diferencia funcional entre sus potenciales.","El músculo cardíaco no tiene membrana excitable ni canales dependientes de voltaje."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El módulo advierte que no debe aplicarse la curva neuronal clásica a todos los tejidos; el potencial cardíaco puede tener meseta por participación sostenida de Ca²⁺.",
      whyWrong:W(null,"Falsa. Invierte las formas típicas.","Falsa. Los tejidos excitables pueden tener curvas distintas.","Falsa. El músculo cardíaco es un tejido excitable con canales iónicos."),
      distractorExplanations:W(null,"Invierte neuron/cardiaco.","Borra una diferencia esencial.","Niega excitabilidad cardíaca."),
      keyPoints:["Neurona = espiga breve.","Cardíaco = meseta posible.","No usar una sola curva para todos los tejidos."],
      tags:T("Tejidos excitables","tejidos_excitables","comparison","application","medium")
    },
    {
      auditDecision:"B", heading:"Músculo liso", difficulty:"Medio",
      question:"¿Por qué el músculo liso se describe como un tejido excitable con actividad eléctrica variable?",
      options:["Porque puede presentar patrones eléctricos más lentos y variables asociados a contracción visceral.","Porque siempre conduce potenciales de acción idénticos a los de axones mielinizados rápidos.","Porque carece de canales iónicos y se contrae solo por electrones libres.","Porque libera neurotransmisor en nodos de Ranvier para iniciar cada contracción."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El músculo liso puede presentar actividad eléctrica variable, relacionada con contracciones viscerales lentas y reguladas por contexto fisiológico.",
      whyWrong:W(null,"Falsa. No todos los tejidos excitables tienen el patrón de axón mielinizado.","Falsa. El músculo liso sí depende de mecanismos iónicos y señales celulares.","Falsa. Los nodos de Ranvier pertenecen a axones mielinizados, no al músculo liso."),
      distractorExplanations:W(null,"Aplica indebidamente la curva neuronal.","Niega la base iónica.","Confunde músculo con axón mielinizado."),
      keyPoints:["Músculo liso = actividad variable.","Contracción visceral lenta.","No todo tejido excitable usa la curva neuronal clásica."],
      tags:T("Músculo liso","musculo_liso","comparison","application","medium")
    },
    {
      auditDecision:"B", heading:"Estímulo subumbral", difficulty:"Base",
      question:"¿Qué ocurre con un estímulo que despolariza la membrana pero no alcanza el umbral?",
      options:["Puede generar un potencial graduado, pero no desencadena un potencial de acción completo.","Genera siempre un potencial de acción completo si la bomba Na⁺/K⁺ está activa.","Produce una meseta cardíaca en cualquier neurona.","Bloquea de forma irreversible los canales de K⁺."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Un estímulo subumbral puede modificar localmente el voltaje como potencial graduado, pero no abre suficientes canales de Na⁺ para activar la ley del todo o nada.",
      whyWrong:W(null,"Falsa. La bomba activa no elimina el requisito de umbral.","Falsa. Una neurona no genera meseta cardíaca por cualquier estímulo subumbral.","Falsa. No hay bloqueo irreversible de K⁺ por un estímulo subumbral."),
      distractorExplanations:W(null,"Ignora el umbral.","Confunde tejido cardíaco con neurona.","Inventa una lesión canalicular."),
      keyPoints:["Subumbral = graduado posible.","Sin umbral no hay PA.","Todo o nada requiere umbral."],
      tags:T("Estímulo subumbral","estimulo_subumbral","definition","recall","basic")
    },
    {
      auditDecision:"B", heading:"Estímulo suprumbral", difficulty:"Medio",
      question:"Si dos estímulos suprumbrales de distinta intensidad generan potenciales de acción en el mismo axón, ¿qué característica suele mantenerse similar en cada espiga individual?",
      options:["La amplitud del potencial de acción individual.","La cantidad total de neurotransmisor en todo el sistema nervioso.","La concentración extracelular de K⁺ en todo el organismo.","La desaparición completa del período refractario absoluto."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Una vez alcanzado el umbral, cada potencial de acción individual mantiene una amplitud relativamente constante; la intensidad se codifica sobre todo por frecuencia de disparo.",
      whyWrong:W(null,"Falsa. El neurotransmisor global no define la amplitud de una espiga axonal individual.","Falsa. La concentración extracelular sistémica de K⁺ no cambia por comparar dos estímulos locales.","Falsa. El refractario absoluto no desaparece con estímulos suprumbrales."),
      distractorExplanations:W(null,"Confunde señal local con cantidad global.","Confunde fisiología sistémica con espiga local.","Niega la refractariedad."),
      keyPoints:["PA individual = amplitud estable.","Más estímulo = más frecuencia.","Refractario limita frecuencia."],
      tags:T("Codificación por frecuencia","codificacion_frecuencia","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"EPSP e IPSP", difficulty:"Difícil",
      question:"¿Cuál descripción corresponde mejor a un potencial postsináptico excitador?",
      options:["Una despolarización graduada que acerca la membrana postsináptica al umbral.","Una hiperpolarización obligatoria por entrada de Cl⁻ que aleja la membrana del umbral.","Una espiga todo o nada que siempre nace en la terminal presináptica.","Una meseta cardíaca que reemplaza a la transmisión química."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Un potencial postsináptico excitador es un cambio graduado que aumenta la probabilidad de alcanzar el umbral en la neurona postsináptica.",
      whyWrong:W(null,"Falsa. Describe mejor un potencial inhibidor típico, no excitador.","Falsa. El potencial postsináptico excitador es graduado, no una espiga todo o nada presináptica.","Falsa. La meseta cardíaca no reemplaza la transmisión química neuronal."),
      distractorExplanations:W(null,"Confunde excitador con inhibidor.","Confunde potencial graduado con potencial de acción.","Confunde fisiología cardíaca con sinapsis."),
      keyPoints:["EPSP acerca al umbral.","IPSP aleja o estabiliza.","Postsináptico suele ser graduado."],
      tags:T("Potencial postsináptico","epsp_ipsp","comparison","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"IPSP", difficulty:"Difícil",
      question:"¿Cuál descripción corresponde mejor a un potencial postsináptico inhibidor típico?",
      options:["Un cambio que reduce la probabilidad de alcanzar el umbral, por ejemplo por entrada de Cl⁻ o salida de K⁺.","Una entrada rápida de Na⁺ que siempre inicia un potencial de acción completo.","Una apertura de canales de Ca²⁺ presinápticos que genera meseta cardíaca.","Una detención de la bomba Na⁺/K⁺ para aumentar la excitabilidad."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Un potencial inhibidor disminuye la probabilidad de disparo postsináptico, ya sea estabilizando el voltaje o hiperpolarizando la membrana.",
      whyWrong:W(null,"Falsa. Entrada rápida de Na⁺ se asocia a despolarización y potencial de acción, no inhibición típica.","Falsa. Mezcla Ca²⁺ presináptico con meseta cardíaca, sin describir IPSP.","Falsa. Detener la bomba no es el mecanismo fisiológico de inhibición postsináptica."),
      distractorExplanations:W(null,"Confunde excitación con inhibición.","Combina fenómenos de contextos distintos.","Confunde fallo energético con inhibición sináptica."),
      keyPoints:["IPSP reduce probabilidad de disparo.","Cl⁻ o K⁺ pueden mediar inhibición.","Inhibición no significa apagar la bomba."],
      tags:T("Potencial inhibidor","ipsp","comparison","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Integración sináptica", difficulty:"Difícil",
      question:"Una neurona recibe simultáneamente varios potenciales excitadores y uno inhibidor. ¿Qué decide si se alcanza el umbral?",
      options:["La suma neta de los cambios de voltaje que llegan al segmento inicial del axón.","La cantidad de electrones que circula por la mielina en los internodos.","La conversión automática de todos los potenciales inhibidores en excitadores.","La liberación de neurotransmisor desde el núcleo neuronal."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La neurona integra señales excitadoras e inhibidoras; si la suma neta despolariza el segmento inicial hasta el umbral, se dispara un potencial de acción.",
      whyWrong:W(null,"Falsa. La mielina no conduce electrones como un cable metálico.","Falsa. Un potencial inhibidor no se convierte automáticamente en excitador.","Falsa. El núcleo no libera neurotransmisor para decidir el umbral."),
      distractorExplanations:W(null,"Confunde electricidad biológica con metálica.","Niega el balance excitación/inhibición.","Confunde función nuclear con sinapsis."),
      keyPoints:["Integración = suma neta.","Segmento inicial decide disparo.","Excitación e inhibición compiten."],
      tags:T("Integración sináptica","integracion_sinaptica","reasoning","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Período refractario y frecuencia", difficulty:"Difícil",
      question:"¿Cómo influye el período refractario absoluto en la frecuencia máxima de disparo neuronal?",
      options:["Impone un intervalo mínimo entre potenciales de acción porque los canales de Na⁺ deben recuperarse.","Permite disparos infinitos porque elimina la inactivación de los canales de Na⁺.","Aumenta la amplitud de cada espiga hasta que desaparece el potencial de reposo.","Convierte la conducción saltatoria en transmisión química postsináptica."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Durante el refractario absoluto no puede iniciarse otra espiga; eso limita la frecuencia máxima de descarga al exigir recuperación de canales de Na⁺.",
      whyWrong:W(null,"Falsa. El refractario absoluto depende precisamente de inactivación de Na⁺.","Falsa. No aumenta progresivamente la amplitud hasta perder reposo.","Falsa. No convierte conducción axonal en transmisión química."),
      distractorExplanations:W(null,"Invierte la función del refractario.","Confunde frecuencia con amplitud.","Mezcla propagación axonal y sinapsis."),
      keyPoints:["Refractario absoluto limita frecuencia.","Na⁺ necesita recuperarse.","No puede superarse con estímulo mayor."],
      tags:T("Refractario y frecuencia","refractario_frecuencia","mechanism","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Recuperación del reposo", difficulty:"Medio",
      question:"Después de un potencial de acción, ¿qué proceso permite mantener a largo plazo los gradientes de Na⁺ y K⁺?",
      options:["La actividad de la bomba Na⁺/K⁺ ATPasa.","La entrada irreversible de Na⁺ por canales inactivados.","La difusión libre de todos los iones a través de la bicapa lipídica.","La liberación de neurotransmisor por canales de Cl⁻."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Aunque una espiga mueve una pequeña fracción de iones, la bomba Na⁺/K⁺ ATPasa mantiene a largo plazo las diferencias de concentración necesarias para la excitabilidad.",
      whyWrong:W(null,"Falsa. Un canal inactivado no conduce Na⁺ de forma funcional.","Falsa. La bicapa no permite difusión libre de todos los iones.","Falsa. El Cl⁻ no libera neurotransmisor; la liberación depende de Ca²⁺ presináptico."),
      distractorExplanations:W(null,"Confunde canal inactivado con abierto.","Niega la selectividad de membrana.","Confunde Cl⁻ con Ca²⁺ y exocitosis."),
      keyPoints:["La bomba mantiene gradientes a largo plazo.","Una espiga no agota gradientes.","Gradientes permiten futuras espigas."],
      tags:T("Recuperación iónica","recuperacion_gradientes","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Electrogenicidad de la bomba", difficulty:"Difícil",
      question:"¿Por qué la bomba Na⁺/K⁺ ATPasa se considera electrogénica?",
      options:["Porque expulsa 3 Na⁺ e introduce 2 K⁺, generando un pequeño balance neto de carga hacia el exterior.","Porque abre directamente los canales de Na⁺ en el pico de cada potencial de acción.","Porque libera neurotransmisor al transportar Ca²⁺ hacia la hendidura sináptica.","Porque neutraliza todos los gradientes iónicos y lleva la membrana a 0 mV."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La bomba es electrogénica porque mueve más carga positiva hacia fuera que hacia dentro en cada ciclo, aunque su papel principal en el módulo es mantener gradientes.",
      whyWrong:W(null,"Falsa. La bomba no abre directamente los canales de Na⁺ del pico.","Falsa. No transporta Ca²⁺ para liberar neurotransmisor.","Falsa. No neutraliza gradientes; los conserva."),
      distractorExplanations:W(null,"Confunde bomba con canal de Na⁺.","Confunde bomba Na⁺/K⁺ con mecanismo sináptico de Ca²⁺.","Invierte el objetivo de la bomba."),
      keyPoints:["3 Na⁺ salen, 2 K⁺ entran.","Pequeño efecto electrogénico.","Función central: mantener gradientes."],
      tags:T("Bomba electrogénica","bomba_electrogenica","mechanism","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Potencial local", difficulty:"Medio",
      question:"¿Por qué un potencial graduado disminuye con la distancia?",
      options:["Porque se propaga de forma pasiva y parte de la corriente se pierde a través de la membrana.","Porque se regenera activamente en cada nodo de Ranvier como un potencial de acción.","Porque todos los canales de Na⁺ se inactivan permanentemente en las dendritas.","Porque la bomba Na⁺/K⁺ destruye el voltaje local al consumir glucosa."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los potenciales graduados son cambios locales y pasivos; se atenúan porque la corriente se dispersa y parte se fuga a través de la membrana.",
      whyWrong:W(null,"Falsa. La regeneración nodal corresponde al potencial de acción en axones mielinizados.","Falsa. No hay inactivación permanente de todos los canales de Na⁺ dendríticos como explicación.","Falsa. La bomba no destruye potenciales graduados al consumir glucosa."),
      distractorExplanations:W(null,"Confunde graduado con potencial de acción.","Inventa un bloqueo permanente.","Confunde transporte activo con atenuación pasiva."),
      keyPoints:["Graduado = decremental.","PA = regenerativo.","La distancia reduce señales pasivas."],
      tags:T("Potencial graduado","potencial_graduado_decremental","mechanism","application","medium")
    },
    {
      auditDecision:"B", heading:"Receptores postsinápticos", difficulty:"Medio",
      question:"¿Qué diferencia general hay entre un receptor ionotrópico y uno metabotrópico?",
      options:["El ionotrópico se asocia a un canal iónico directo; el metabotrópico actúa mediante vías de señalización intracelular.","El ionotrópico siempre es una bomba Na⁺/K⁺; el metabotrópico siempre es una vaina de mielina.","El ionotrópico solo se localiza en el núcleo; el metabotrópico solo en nodos de Ranvier.","Ambos son canales de K⁺ de fuga sin relación con neurotransmisores."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. En la transmisión sináptica, los receptores ionotrópicos modifican directamente el flujo iónico, mientras los metabotrópicos actúan por segundos mensajeros o vías intracelulares.",
      whyWrong:W(null,"Falsa. Confunde receptor con bomba y con mielina.","Falsa. Ubicaciones propuestas no corresponden a la función sináptica general.","Falsa. Ambos se relacionan con neurotransmisores, no son simplemente canales de fuga."),
      distractorExplanations:W(null,"Mezcla estructuras sin relación.","Confunde localización celular.","Niega la función receptora."),
      keyPoints:["Ionotrópico = canal/receptor rápido.","Metabotrópico = vía intracelular.","Ambos pueden modificar excitabilidad."],
      tags:T("Receptores sinápticos","receptores_sinapticos","comparison","application","medium")
    },
    {
      auditDecision:"B", heading:"Algoritmo de examen", difficulty:"Examen",
      question:"Un enunciado dice: “señal todo o nada, regenerativa y de amplitud relativamente constante”. ¿A qué fenómeno corresponde?",
      options:["Potencial de acción.","Potencial graduado.","Potencial de equilibrio del K⁺.","Liberación de neurotransmisor por Ca²⁺."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Las palabras todo o nada, regenerativa y amplitud constante identifican el potencial de acción, no un potencial graduado.",
      whyWrong:W(null,"Falsa. El potencial graduado es variable, sumable y decremental.","Falsa. E_K es un valor de equilibrio, no una señal regenerativa.","Falsa. La liberación por Ca²⁺ es un evento sináptico, no la señal axonal todo o nada."),
      distractorExplanations:W(null,"Confunde graduado con acción.","Confunde valor termodinámico con fenómeno eléctrico propagado.","Confunde conducción axonal con sinapsis."),
      keyPoints:["Todo o nada = PA.","Variable y sumable = graduado.","Ca²⁺ = liberación sináptica."],
      tags:T("Algoritmo de examen","identificar_pa","pattern_recognition","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Algoritmo de examen", difficulty:"Examen",
      question:"Un enunciado dice: “necesita un estímulo mayor para disparar de nuevo”. ¿Qué estado fisiológico sugiere?",
      options:["Período refractario relativo.","Período refractario absoluto.","Fase ascendente por entrada de Na⁺.","Potencial de equilibrio del Na⁺."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Si todavía puede disparar pero requiere un estímulo mayor, se trata del período refractario relativo. En el absoluto, no puede disparar aunque el estímulo sea intenso.",
      whyWrong:W(null,"Falsa. En el refractario absoluto es imposible disparar de nuevo en ese momento.","Falsa. La fase ascendente describe entrada de Na⁺, no necesidad de estímulo mayor.","Falsa. E_Na es un valor de equilibrio, no un estado refractario."),
      distractorExplanations:W(null,"Confunde relativo con absoluto.","Confunde fase de espiga con estado posterior.","Confunde valor de equilibrio con excitabilidad."),
      keyPoints:["Relativo = posible con estímulo mayor.","Absoluto = imposible.","Palabras clave guían la respuesta."],
      tags:T("Algoritmo de examen","identificar_refractario_relativo","pattern_recognition","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"No confundir", difficulty:"Examen",
      question:"¿Cuál asociación es correcta para evitar una confusión frecuente del módulo?",
      options:["Na⁺ en el axón: conducción del potencial; Ca²⁺ en la terminal: liberación de neurotransmisor.","Na⁺ en la terminal: liberación vesicular; Ca²⁺ en el axón: repolarización clásica.","K⁺ en el axón: fase ascendente rápida; Cl⁻ en la terminal: exocitosis vesicular.","Glucosa en la membrana: corriente eléctrica inmediata; electrones en el axón: potencial de reposo."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Una trampa central es confundir Na⁺ y Ca²⁺: Na⁺ explica la conducción axonal del potencial de acción, mientras Ca²⁺ presináptico desencadena liberación de neurotransmisor.",
      whyWrong:W(null,"Falsa. Invierte Na⁺ y Ca²⁺.","Falsa. Invierte K⁺ y asigna al Cl⁻ una función de exocitosis que no corresponde.","Falsa. La señal inmediata no depende de glucosa ni de electrones axonales."),
      distractorExplanations:W(null,"Inversión clásica Na⁺/Ca²⁺.","Combina varias asignaciones iónicas falsas.","Regresa al error de electricidad metálica."),
      keyPoints:["Na⁺ conduce en axón.","Ca²⁺ libera neurotransmisor.","K⁺ repolariza."],
      tags:T("No confundir iones","no_confundir_na_ca","exam_trap","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"No confundir", difficulty:"Examen",
      question:"¿Cuál afirmación corrige mejor la idea falsa de que un estímulo más fuerte aumenta mucho la amplitud de cada potencial de acción?",
      options:["Una vez alcanzado el umbral, la intensidad se codifica principalmente por frecuencia, no por gran aumento de amplitud individual.","La amplitud individual aumenta sin límite mientras haya más neurotransmisor en sangre.","El potencial de acción se vuelve graduado cuando el estímulo supera el umbral.","El estímulo fuerte elimina la necesidad de canales de Na⁺ dependientes de voltaje."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. El potencial de acción individual mantiene amplitud relativamente constante. La intensidad del estímulo se refleja sobre todo en frecuencia de descarga y reclutamiento.",
      whyWrong:W(null,"Falsa. La amplitud no aumenta sin límite ni depende de neurotransmisor en sangre.","Falsa. El potencial de acción no se vuelve graduado por superar el umbral.","Falsa. Los canales de Na⁺ siguen siendo necesarios para la fase ascendente."),
      distractorExplanations:W(null,"Exagera amplitud y mezcla conceptos.","Invierte graduado y acción.","Niega el mecanismo de Na⁺."),
      keyPoints:["PA individual = amplitud estable.","Más intensidad = más frecuencia.","Todo o nada no significa más alto con más estímulo."],
      tags:T("Trampa de amplitud","trampa_amplitud","exam_trap","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Aplicación fisiológica", difficulty:"Difícil",
      question:"Si una neurona presenta muchos canales de Na⁺ inactivados, ¿qué efecto inmediato se espera sobre su excitabilidad?",
      options:["Disminuye la posibilidad de generar un nuevo potencial de acción.","Aumenta la probabilidad de una espiga porque todos los canales están abiertos.","Se facilita la liberación de neurotransmisor sin entrada de Ca²⁺.","El potencial de reposo se vuelve exactamente igual a E_Na."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Los canales de Na⁺ inactivados no están disponibles para abrirse; por eso reducen la capacidad de disparar una nueva espiga, como ocurre durante el refractario absoluto.",
      whyWrong:W(null,"Falsa. Inactivado no significa abierto; significa no disponible.","Falsa. La liberación vesicular depende de Ca²⁺.","Falsa. El reposo no se vuelve E_Na por inactivación de canales de Na⁺."),
      distractorExplanations:W(null,"Confunde inactivado con abierto.","Confunde excitabilidad axonal con sinapsis.","Confunde estado de canal con potencial de equilibrio."),
      keyPoints:["Inactivado = no disponible.","Menos Na⁺ disponible = menos excitabilidad.","Refractario absoluto se basa en esta idea."],
      tags:T("Inactivación y excitabilidad","inactivacion_excitabilidad","clinical_application","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Aplicación fisiológica", difficulty:"Difícil",
      question:"Si aumenta mucho la permeabilidad de la membrana al K⁺, ¿hacia qué valor tenderá el potencial de membrana?",
      options:["Hacia el potencial de equilibrio del K⁺.","Hacia el potencial de equilibrio del Na⁺.","Hacia el pico fijo de +30 mV sin importar el contexto.","Hacia 0 mV porque desaparece toda separación de cargas."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Cuando la permeabilidad a un ion predomina, el potencial de membrana tiende hacia el potencial de equilibrio de ese ion; si predomina K⁺, Vm tiende hacia E_K.",
      whyWrong:W(null,"Falsa. Vm tendería a E_Na si predominara la permeabilidad al Na⁺.","Falsa. +30 mV es un pico aproximado, no el destino de alta permeabilidad al K⁺.","Falsa. Aumentar permeabilidad al K⁺ no implica desaparición completa de cargas."),
      distractorExplanations:W(null,"Confunde ion dominante.","Confunde pico con equilibrio.","Exagera el efecto eléctrico."),
      keyPoints:["Permeabilidad dominante acerca Vm a E_ion.","K⁺ dominante → Vm hacia E_K.","Na⁺ dominante → Vm hacia E_Na."],
      tags:T("Permeabilidad dominante","permeabilidad_dominante","mechanism","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Aplicación fisiológica", difficulty:"Difícil",
      question:"Si aumenta mucho la permeabilidad de la membrana al Na⁺ durante el umbral, ¿qué cambio se espera?",
      options:["El potencial de membrana se desplaza hacia valores más positivos por entrada de Na⁺.","El potencial se acerca a E_K por salida predominante de K⁺.","La membrana se hiperpolariza por entrada de Cl⁻ obligatoria.","El neurotransmisor se libera en el soma sin participación de Ca²⁺."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Al aumentar la permeabilidad al Na⁺, el Na⁺ entra siguiendo su gradiente y desplaza el potencial hacia valores positivos, iniciando la despolarización rápida.",
      whyWrong:W(null,"Falsa. Eso corresponde a predominio de permeabilidad al K⁺.","Falsa. La entrada de Cl⁻ no explica la despolarización por Na⁺.","Falsa. La liberación de neurotransmisor ocurre en terminales y depende de Ca²⁺."),
      distractorExplanations:W(null,"Confunde Na⁺ con K⁺.","Confunde despolarización con inhibición por Cl⁻.","Confunde axón/soma/terminal."),
      keyPoints:["Permeabilidad al Na⁺ aumenta → Na⁺ entra.","Vm se vuelve más positivo.","Este es el inicio de la fase ascendente."],
      tags:T("Permeabilidad al Na","permeabilidad_na","mechanism","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Síntesis de fases", difficulty:"Examen",
      question:"¿Cuál secuencia resume mejor el potencial de acción neuronal clásico?",
      options:["Reposo → umbral → entrada de Na⁺ → inactivación de Na⁺/salida de K⁺ → repolarización → posible hiperpolarización.","Reposo → salida de Na⁺ → entrada de K⁺ → liberación de glucosa → meseta obligatoria → sinapsis.","Umbral → entrada de Cl⁻ → desaparición de gradientes → conducción por electrones → reposo.","Reposo → bomba apagada → entrada de Ca²⁺ somática → salida de neurotransmisor por dendritas."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. La secuencia integra los pasos centrales: reposo, llegada al umbral, entrada rápida de Na⁺, inactivación de Na⁺, salida de K⁺, repolarización y a veces hiperpolarización.",
      whyWrong:W(null,"Falsa. Invierte Na⁺/K⁺ y añade glucosa/meseta obligatoria sin fundamento.","Falsa. Cl⁻ y electrones no explican la espiga neuronal clásica.","Falsa. La bomba no debe apagarse y el Ca²⁺ somático no es la secuencia axonal principal."),
      distractorExplanations:W(null,"Secuencia iónica errónea.","Mezcla inhibición y electricidad metálica.","Mezcla bomba, Ca²⁺ y dendritas incorrectamente."),
      keyPoints:["Na⁺ sube la curva.","K⁺ baja la curva.","K⁺ prolongado hiperpolariza."],
      tags:T("Secuencia del PA","secuencia_pa","summary","reasoning","hard")
    },
    {
      auditDecision:"B", heading:"Síntesis de examen", difficulty:"Examen",
      question:"¿Cuál opción contiene solo asociaciones correctas del módulo?",
      options:["K⁺: reposo/repolarización; Na⁺: fase ascendente; Ca²⁺: liberación sináptica.","Na⁺: hiperpolarización; K⁺: fase ascendente; Ca²⁺: potencial de reposo principal.","Cl⁻: fase ascendente rápida; glucosa: repolarización; electrones: conducción axonal.","Mielina: liberación de neurotransmisor; bomba Na⁺/K⁺: receptor postsináptico."],
      answerIndex:0,
      explanation:"La respuesta correcta es A. Resume las asociaciones fisiológicas clave: K⁺ domina reposo y repolarización, Na⁺ produce la fase ascendente y Ca²⁺ desencadena liberación de neurotransmisor en la terminal presináptica.",
      whyWrong:W(null,"Falsa. Invierte Na⁺ y K⁺ y asigna reposo principal al Ca²⁺.","Falsa. Usa Cl⁻, glucosa y electrones en funciones incorrectas.","Falsa. Mielina acelera conducción; la bomba no es receptor postsináptico."),
      distractorExplanations:W(null,"Inversión iónica clásica.","Combinación de distractores no fisiológicos.","Confunde estructuras y funciones."),
      keyPoints:["K⁺ reposo/repolarización.","Na⁺ despolarización rápida.","Ca²⁺ liberación sináptica."],
      tags:T("Síntesis iónica","sintesis_ionica","summary","reasoning","hard")
    }
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.qcm, 20+i, items[i]);

  ROOT.fisiologiaQualityPatchV316 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"QCM 021-060",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:40,
    notes:"Replaces QCM 021-060 with a 40-item non-repetitive batch covering membrane, ions, gradients, action potential phases, refractory periods, conduction, synapse and exam traps."
  };
})();
