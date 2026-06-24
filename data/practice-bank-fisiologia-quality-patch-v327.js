/* v327 — Fisiología quality patch, Módulo 1 Casos clínicos 016–030.
   Scope: replaces clinical cases 016–030 of Module 1 by module position.
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
  var PATCH = "fisiologia-v327-m1-cases-016-030";

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
      casePedagogicalStandard:"med_nykuto_v327_short_clinical_story",
      tags:{subject:COURSE,subjectLabel:"Fisiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"case",topic:topic,topicSlug:slug(topic),skill:skill||"clinical_reasoning",cognitiveLevel:level||"reasoning",difficulty:diff||"medium",adaptiveVersion:"v327",visible:false},
      tagList:["subject:fisiologia","module:1","format:case","standard:med_nykuto_v327","topic:"+slug(topic)]
    };
  }

  var items = [
    C("Acomodación neuronal","Examen",
      "En un experimento, una neurona recibe una despolarización lenta y sostenida. Aunque el voltaje se acerca al umbral, la espiga es débil o no aparece porque muchos canales de Na⁺ ya no están disponibles.",
      "¿Qué fenómeno explica mejor este resultado?",
      ["Acomodación por inactivación progresiva de canales de Na⁺.","Conducción saltatoria normal por mielina intacta.","Entrada presináptica de Ca²⁺ con exocitosis aumentada.","Potencial de equilibrio del Cl⁻ como único factor."],0,
      "Correcta. Una despolarización lenta puede inactivar canales de Na⁺ antes de una apertura sincronizada suficiente, reduciendo la capacidad de generar un potencial de acción eficaz.",
      [null,"Falsa. La mielina afecta la propagación, no explica la pérdida de disponibilidad de Na⁺ por despolarización lenta.","Falsa. El Ca²⁺ presináptico se relaciona con liberación de neurotransmisor, no con la acomodación axonal descrita.","Falsa. El Cl⁻ puede participar en inhibición, pero no explica el estado de canales de Na⁺ aquí."],
      ["Despolarización lenta puede inactivar Na⁺.","Disponibilidad de canales importa.","No todo estímulo sostenido facilita la espiga."],"clinical_reasoning","reasoning","hard"),

    C("Fallo energético y gradientes","Examen",
      "Tras un período prolongado de hipoxia, una neurona mantiene canales estructuralmente presentes, pero disminuye mucho la producción de ATP. Con el tiempo, la excitabilidad se deteriora progresivamente.",
      "¿Qué proceso se afecta de forma más directa a largo plazo?",
      ["Mantenimiento de gradientes iónicos por bombas dependientes de ATP.","Apertura instantánea de canales de Na⁺ por voltaje normal.","Liberación de neurotransmisor por mielina internodal.","Conversión de K⁺ extracelular en Ca²⁺ presináptico."],0,
      "Correcta. Los canales usan gradientes ya existentes, pero las bombas como la Na⁺/K⁺ ATPasa consumen ATP para sostener esos gradientes a largo plazo.",
      [null,"Falsa. La apertura de canales no corrige la pérdida progresiva de gradientes por falta de energía.","Falsa. La mielina no libera neurotransmisor.","Falsa. Los iones no se convierten unos en otros."],
      ["ATP mantiene bombas.","Bombas sostienen gradientes.","Sin gradientes falla la excitabilidad."],"clinical_reasoning","reasoning","hard"),

    C("Bomba Na⁺/K⁺","Medio",
      "Un docente muestra un esquema con una ATPasa que expulsa 3 Na⁺ e introduce 2 K⁺. Luego pregunta por su función principal en la neurona.",
      "¿Cuál respuesta es más adecuada?",
      ["Mantener los gradientes de Na⁺ y K⁺ que permiten la excitabilidad.","Generar directamente la fase ascendente rápida de cada potencial de acción.","Abrir receptores postsinápticos de Cl⁻.","Regenerar el potencial en los nodos de Ranvier como canal de Na⁺."],0,
      "Correcta. La bomba Na⁺/K⁺ ATPasa conserva los gradientes iónicos y tiene efecto electrogénico pequeño; la fase rápida de la espiga depende de canales.",
      [null,"Falsa. La fase ascendente rápida depende de entrada de Na⁺ por canales voltaje-dependientes.","Falsa. La bomba no es un receptor postsináptico de Cl⁻.","Falsa. Los nodos regeneran por canales de Na⁺, no por convertir la bomba en canal."],
      ["Bomba: 3 Na⁺ fuera, 2 K⁺ dentro.","Mantiene gradientes.","Canales generan la espiga rápida."],"clinical_reasoning","application","medium"),

    C("Microcambios iónicos","Difícil",
      "Durante una clase, un alumno cree que cada potencial de acción vacía gran parte del Na⁺ extracelular y del K⁺ intracelular. El profesor corrige que el voltaje cambia con desplazamientos iónicos muy pequeños cerca de la membrana.",
      "¿Qué concepto explica mejor esta corrección?",
      ["La membrana actúa como capacitor biológico que separa cargas.","La neurona pierde toda su membrana durante cada espiga.","El potencial de acción depende de glucosa que cruza libremente la bicapa.","La mielina convierte los iones en electrones metálicos."],0,
      "Correcta. Pequeños movimientos de carga cerca de la bicapa modifican mucho el potencial transmembrana sin cambiar masivamente las concentraciones globales.",
      [null,"Falsa. La membrana permanece y permite separación de cargas.","Falsa. La glucosa no es la corriente inmediata de la espiga.","Falsa. La señal neuronal sigue siendo iónica, no metálica."],
      ["Membrana = capacitor.","Pequeñas cargas cambian Vm.","Una espiga no vacía compartimentos."],"clinical_reasoning","reasoning","hard"),

    C("Canal activado por ligando","Medio",
      "En una sinapsis, un neurotransmisor se une a un receptor postsináptico y abre un canal iónico. El cambio de voltaje aparece rápidamente en la célula receptora.",
      "¿Qué tipo de mecanismo se describe?",
      ["Canal activado por ligando con respuesta postsináptica rápida.","Bomba Na⁺/K⁺ como receptor nuclear.","Conducción saltatoria por internodos mielinizados.","Transporte vesicular de todo el soma neuronal."],0,
      "Correcta. Un canal activado por ligando se abre por unión de una molécula específica, como un neurotransmisor, y puede producir EPSP o IPSP.",
      [null,"Falsa. La bomba Na⁺/K⁺ no es receptor nuclear ni canal activado por ligando.","Falsa. La conducción saltatoria pertenece al axón mielinizado, no a la apertura postsináptica por neurotransmisor.","Falsa. No se describe transporte vesicular de grandes estructuras."],
      ["Ligando = molécula que se une.","Neurotransmisor puede abrir canal.","Respuesta rápida postsináptica."],"clinical_reasoning","application","medium"),

    C("Receptor metabotrópico","Medio",
      "Un neurotransmisor activa un receptor postsináptico que no forma un poro directo. La respuesta es más lenta y ocurre mediante una cascada intracelular moduladora.",
      "¿Qué tipo de receptor se reconoce?",
      ["Receptor metabotrópico.","Canal de Na⁺ voltaje-dependiente nodal.","Canal de K⁺ de fuga en reposo exclusivamente.","Bomba Na⁺/K⁺ ATPasa."],0,
      "Correcta. Los receptores metabotrópicos actúan mediante proteínas G o vías intracelulares; no son poros iónicos directos como los ionotrópicos.",
      [null,"Falsa. El canal de Na⁺ voltaje-dependiente responde a voltaje y participa en la espiga, no en cascada metabotrópica.","Falsa. Un canal de fuga no describe una cascada intracelular por neurotransmisor.","Falsa. La bomba Na⁺/K⁺ mantiene gradientes y no es receptor metabotrópico."],
      ["Metabotrópico = vía intracelular.","Ionotrópico = canal directo.","Más lento y modulador."],"clinical_reasoning","application","medium"),

    C("Sinapsis eléctrica","Difícil",
      "En un tejido excitable, dos células acopladas transmiten corriente de forma muy rápida a través de uniones comunicantes, sin liberación de neurotransmisor en una hendidura química.",
      "¿Qué tipo de comunicación se describe?",
      ["Sinapsis eléctrica.","Sinapsis química clásica dependiente de vesículas.","Exocitosis presináptica por Ca²⁺.","Potencial graduado dendrítico aislado."],0,
      "Correcta. La sinapsis eléctrica transmite corriente directamente entre células acopladas, a diferencia de la sinapsis química que utiliza neurotransmisores y receptores.",
      [null,"Falsa. La sinapsis química usa vesículas, neurotransmisor y receptores.","Falsa. La exocitosis por Ca²⁺ es parte de la sinapsis química, no de la unión directa descrita.","Falsa. Un potencial graduado aislado no define comunicación célula-célula por uniones comunicantes."],
      ["Eléctrica = acoplamiento directo.","Química = neurotransmisor.","La velocidad suele ser mayor en eléctrica."],"clinical_reasoning","reasoning","hard"),

    C("Retardo sináptico","Medio",
      "En una vía neuronal, la señal llega a la terminal presináptica, entra Ca²⁺, se fusionan vesículas, el neurotransmisor difunde y luego se une al receptor postsináptico. El profesor señala un pequeño retraso entre llegada y respuesta.",
      "¿Qué explica mejor ese retardo?",
      ["Los pasos sucesivos de la transmisión química.","La destrucción obligatoria de la mielina en cada sinapsis.","La salida de K⁺ como única causa de exocitosis.","La conversión del potencial de acción en glucosa."],0,
      "Correcta. La sinapsis química requiere varios pasos: entrada de Ca²⁺, exocitosis, difusión y activación del receptor; por eso puede tener un retardo breve.",
      [null,"Falsa. La mielina no se destruye en cada sinapsis.","Falsa. La exocitosis depende de Ca²⁺ presináptico, no de salida de K⁺ como único paso.","Falsa. No existe conversión del PA en glucosa."],
      ["Química = pasos intermedios.","Ca²⁺ + vesículas.","Receptor postsináptico completa la señal."],"clinical_reasoning","application","medium"),

    C("Músculo cardíaco y meseta","Examen",
      "Un profesor compara una neurona típica con un cardiomiocito. En la neurona se observa una espiga breve, mientras que en el cardiomiocito aparece una fase prolongada de meseta.",
      "¿Qué idea fisiológica debe recordarse?",
      ["Distintos tejidos excitables pueden tener curvas diferentes; la meseta cardíaca se relaciona con corrientes sostenidas de Ca²⁺.","Todos los tejidos excitables tienen exactamente la misma espiga breve neuronal.","La meseta cardíaca se debe a entrada exclusiva de Cl⁻ como corriente excitadora.","La neurona típica tiene meseta prolongada obligatoria por Ca²⁺."],0,
      "Correcta. La espiga neuronal clásica es breve; en cardiomiocitos, corrientes de Ca²⁺ contribuyen a la meseta y prolongan el potencial de acción.",
      [null,"Falsa. Diferentes tejidos excitables tienen patrones eléctricos distintos.","Falsa. El Cl⁻ no explica la meseta cardíaca excitadora.","Falsa. La neurona típica no presenta meseta prolongada obligatoria."],
      ["Neurona = espiga breve.","Cardíaco = meseta.","Ca²⁺ contribuye a meseta."],"clinical_reasoning","comparison","hard"),

    C("Músculo liso","Difícil",
      "En una clase de fisiología, se observa que una célula de músculo liso no siempre dispara espigas rápidas como una neurona. Su actividad eléctrica puede ser lenta, variable y asociarse a contracción visceral gradual.",
      "¿Qué conclusión es más adecuada?",
      ["Los tejidos excitables pueden usar patrones eléctricos distintos según su función.","El músculo liso no es excitable porque no copia la espiga neuronal.","Toda contracción visceral depende de nodos de Ranvier.","La actividad lenta del músculo liso se debe a cápsides virales."],0,
      "Correcta. La excitabilidad se adapta a la función del tejido; músculo liso, corazón y neuronas no tienen necesariamente la misma forma de potencial eléctrico.",
      [null,"Falsa. Un tejido puede ser excitable sin reproducir exactamente la espiga neuronal típica.","Falsa. Los nodos de Ranvier son estructuras axonales, no requisito de toda contracción visceral.","Falsa. Las cápsides virales no explican excitabilidad del músculo liso."],
      ["Excitabilidad no es idéntica en todos los tejidos.","Músculo liso = actividad variable.","Función tisular condiciona patrón eléctrico."],"clinical_reasoning","reasoning","hard"),

    C("E_Na y pico","Difícil",
      "En una gráfica, el pico del potencial de acción neuronal se acerca a valores positivos, pero no suele igualar exactamente el potencial de equilibrio del Na⁺. El profesor pregunta por qué.",
      "¿Cuál explicación es más correcta?",
      ["Porque los canales de Na⁺ se inactivan y se activa la salida de K⁺ antes de alcanzar completamente E_Na.","Porque el Na⁺ pierde su carga positiva al entrar en la neurona.","Porque el K⁺ entra masivamente durante la fase ascendente.","Porque la bomba Na⁺/K⁺ se apaga de forma irreversible en el pico."],0,
      "Correcta. El pico se limita por inactivación de Na⁺ y por apertura de canales de K⁺, de modo que Vm no alcanza necesariamente E_Na.",
      [null,"Falsa. El Na⁺ conserva su carga positiva.","Falsa. Durante la fase ascendente clásica entra Na⁺; K⁺ sale durante la repolarización.","Falsa. La bomba no se apaga irreversiblemente en cada pico."],
      ["E_Na ≈ +60 mV.","Pico ≈ +30 mV.","Na⁺ se inactiva y K⁺ sale."],"clinical_reasoning","reasoning","hard"),

    C("E_K e hiperpolarización","Medio",
      "Después del pico de un potencial de acción, la membrana cae por debajo del reposo antes de recuperarse. La curva se aproxima transitoriamente a valores más cercanos a E_K.",
      "¿Qué mecanismo explica mejor esta fase?",
      ["Persistencia temporal de la salida de K⁺ por canales aún abiertos.","Entrada masiva de Na⁺ por canales recién abiertos.","Fusión vesicular por Ca²⁺ presináptico.","Apertura de receptores metabotrópicos nucleares."],0,
      "Correcta. Si los canales de K⁺ permanecen abiertos, K⁺ sigue saliendo y el interior se vuelve más negativo, produciendo hiperpolarización transitoria.",
      [null,"Falsa. La entrada de Na⁺ despolarizaría, no hiperpolarizaría.","Falsa. La fusión vesicular es sináptica y no explica la fase por debajo del reposo.","Falsa. Los receptores metabotrópicos no explican la hiperpolarización pospotencial clásica."],
      ["Hiperpolarización = K⁺ sigue saliendo.","Vm se acerca a E_K.","Luego vuelve a reposo."],"clinical_reasoning","application","medium"),

    C("Gradiente vs permeabilidad","Medio",
      "Un ion tiene un fuerte gradiente electroquímico, pero casi no atraviesa la membrana porque sus canales están cerrados. El alumno dice que no hay gradiente porque no hay flujo visible.",
      "¿Cuál corrección es adecuada?",
      ["Puede existir gradiente aunque el flujo sea bajo si la permeabilidad es baja.","Si no hay flujo, el ion no tiene carga eléctrica.","La permeabilidad siempre empuja al ion contra su gradiente.","Todo gradiente requiere apertura permanente de canales."],0,
      "Correcta. El gradiente es la fuerza impulsora; la permeabilidad es la posibilidad de paso. Si la membrana no permite paso, el flujo puede ser bajo aunque exista fuerza electroquímica.",
      [null,"Falsa. La ausencia de flujo visible no elimina la carga del ion.","Falsa. La permeabilidad no empuja; permite que el gradiente se exprese como flujo.","Falsa. Un gradiente puede mantenerse incluso con canales cerrados."],
      ["Gradiente empuja.","Permeabilidad permite.","No son sinónimos."],"clinical_reasoning","application","medium"),

    C("Caso integrador de examen","Examen",
      "En un examen, se describe una neurona con reposo cercano a -70 mV, umbral en -55 mV, ascenso rápido, descenso y fase por debajo del reposo. La pregunta pide asociar cada fase con su mecanismo iónico principal.",
      "¿Cuál asociación es más correcta?",
      ["Reposo: predominio de K⁺; ascenso: entrada de Na⁺; descenso e hiperpolarización: salida de K⁺.","Reposo: entrada de Ca²⁺; ascenso: salida de K⁺; descenso: entrada de Na⁺.","Reposo: electrones metálicos; ascenso: glucosa; descenso: mielina.","Reposo: Cl⁻ exclusivamente; ascenso: bomba Na⁺/K⁺; descenso: neurotransmisor."],0,
      "Correcta. El algoritmo de examen del PA neuronal clásico es: reposo por predominio de permeabilidad al K⁺, ascenso por entrada de Na⁺, descenso e hiperpolarización por salida de K⁺.",
      [null,"Falsa. Invierte los iones principales de ascenso y descenso.","Falsa. La señal es iónica, no metálica ni por glucosa.","Falsa. La bomba mantiene gradientes, pero no genera directamente el ascenso rápido."],
      ["Reposo ≈ K⁺.","Ascenso = Na⁺ entra.","Descenso/hiperpolarización = K⁺ sale."],"clinical_reasoning","reasoning","hard"),

    C("Caso integrador sináptico","Examen",
      "Un potencial de acción llega correctamente a la terminal de una neurona, pero una toxina impide la fusión de vesículas. La célula postsináptica no recibe señal química suficiente.",
      "¿Qué diferencia conceptual debe destacarse?",
      ["La conducción axonal puede estar conservada mientras falla la transmisión química presináptica.","Si llega el potencial de acción, la liberación química nunca puede fallar.","La mielina libera el neurotransmisor cuando fallan las vesículas.","El receptor postsináptico siempre genera una espiga sin neurotransmisor."],0,
      "Correcta. Conducción axonal y transmisión sináptica son pasos distintos: puede llegar el PA, pero fallar Ca²⁺, vesículas o receptores y disminuir la respuesta postsináptica.",
      [null,"Falsa. La liberación puede fallar aunque el PA llegue, si se bloquean pasos presinápticos.","Falsa. La mielina no reemplaza la exocitosis vesicular.","Falsa. El receptor necesita señal adecuada para producir respuesta postsináptica."],
      ["Conducción ≠ liberación.","PA llega a terminal.","Transmisión química requiere vesículas/receptor."],"clinical_reasoning","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.cases, 15+i, items[i]);

  ROOT.fisiologiaQualityPatchV327 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"Casos clínicos 016-030",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:15,
    notes:"Continues Module 1 clinical cases with 15 mini-stories covering accommodation, ATP, pumps, synapses, tissue differences, equilibrium potentials and integrated exam algorithms."
  };
})();
