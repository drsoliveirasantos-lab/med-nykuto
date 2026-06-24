/* v324 — Fisiología quality patch, Módulo 1 V/F 031–050.
   Scope: replaces V/F 031–050 of Module 1 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.vf)) return;

  var MODULE_ID = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";
  var PATCH = "fisiologia-v324-m1-vf-031-050";

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
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:1, format:"vf", visible:false, adaptiveVersion:"v324"});
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
      whyWrong:isTrue ? [null,"Falsa. La afirmación es verdadera según la fisiología del módulo."] : ["Falsa. La afirmación contiene una inversión conceptual o una generalización incorrecta.",null],
      distractorExplanations:isTrue ? [null,"Marcar Falso sería incorrecto porque la afirmación respeta el mecanismo descrito."] : ["Marcar Verdadero sería incorrecto porque el enunciado debe corregirse.",null],
      keyPoints:keyPoints,
      tags:{topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}
    };
  }

  var items = [
    VF("Valores de referencia","Base","En una neurona típica, el potencial de reposo se aproxima a -70 mV, el umbral a -55 mV y el pico del potencial de acción puede acercarse a +30 mV.",true,"Verdadero. Estos valores permiten interpretar la gráfica clásica del potencial de acción: reposo cercano a -70 mV, umbral alrededor de -55 mV y pico positivo durante la despolarización.","",["Reposo ≈ -70 mV.","Umbral ≈ -55 mV.","Pico ≈ +30 mV."],"Valores de referencia","vf_valores_referencia","recall","recall","basic"),

    VF("Potencial de equilibrio","Base","El potencial de equilibrio del Na⁺ suele aproximarse a +60 mV, mientras que el potencial de equilibrio del K⁺ se aproxima a -90 mV.",true,"Verdadero. El Na⁺ tiende a llevar el potencial hacia valores positivos cuando aumenta su permeabilidad; el K⁺ tiende a llevarlo hacia valores más negativos.","",["E_Na ≈ +60 mV.","E_K ≈ -90 mV.","La permeabilidad dominante desplaza Vm hacia E_ion."],"Potenciales de equilibrio","vf_ena_ek","recall","recall","basic"),

    VF("Permeabilidad dominante","Medio","Si aumenta mucho la permeabilidad de la membrana al K⁺, el potencial de membrana tiende a acercarse al potencial de equilibrio del K⁺.",true,"Verdadero. Cuando predomina la permeabilidad a un ion, el potencial de membrana se desplaza hacia el potencial de equilibrio de ese ion. En el caso del K⁺, tiende hacia valores más negativos.","",["Permeabilidad dominante acerca Vm a E_ion.","K⁺ dominante → Vm hacia E_K.","Salida de K⁺ vuelve el interior más negativo."],"Permeabilidad dominante","vf_permeabilidad_k","mechanism","application","medium"),

    VF("Permeabilidad al Na⁺","Medio","Si aumenta mucho la permeabilidad al Na⁺ durante el umbral, la membrana tiende a hiperpolarizarse por salida de cargas positivas.",false,"Falso. Al aumentar la permeabilidad al Na⁺, el Na⁺ entra siguiendo su gradiente electroquímico y la membrana se despolariza hacia valores más positivos.","Corrección: el aumento de permeabilidad al Na⁺ produce despolarización; la hiperpolarización se relaciona más con salida persistente de K⁺ o entrada inhibitoria de Cl⁻ según contexto.",["Na⁺ entra y despolariza.","K⁺ sale y repolariza/hiperpolariza.","No invertir Na⁺ y K⁺."],"Permeabilidad al Na⁺","vf_permeabilidad_na_no_hiperpolariza","exam_trap","application","medium"),

    VF("K⁺ extracelular","Difícil","Un aumento importante del K⁺ extracelular reduce el gradiente de salida de K⁺ y puede despolarizar el potencial de reposo.",true,"Verdadero. Si aumenta el K⁺ fuera de la célula, disminuye la fuerza química que empuja K⁺ hacia fuera. El interior se vuelve menos negativo, lo que puede alterar la excitabilidad.","",["K⁺ extracelular alto reduce salida neta.","Vm se vuelve menos negativo.","La excitabilidad puede cambiar."],"K⁺ extracelular","vf_k_extracelular_alto","clinical_application","reasoning","hard"),

    VF("K⁺ extracelular bajo","Difícil","Una disminución marcada del K⁺ extracelular tiende a reducir la salida de K⁺ y despolarizar siempre la membrana.",false,"Falso. Menos K⁺ extracelular suele aumentar el gradiente químico de salida de K⁺, lo que puede favorecer hiperpolarización y alejar la membrana del umbral.","Corrección: K⁺ extracelular bajo aumenta la tendencia de K⁺ a salir y puede hiperpolarizar inicialmente.",["K⁺ bajo fuera favorece salida.","Salida de K⁺ vuelve el interior más negativo.","Puede disminuir excitabilidad inicial."],"K⁺ extracelular bajo","vf_k_bajo_no_despolariza","clinical_application","reasoning","hard"),

    VF("Canal activado por ligando","Base","Un canal activado por ligando modifica su estado cuando una molécula específica, como un neurotransmisor, se une al receptor o al canal.",true,"Verdadero. Los canales activados por ligando responden a señales químicas, a diferencia de los canales dependientes de voltaje, que responden a cambios del potencial de membrana.","",["Ligando = molécula que se une.","Puede producir EPSP o IPSP.","No confundir con canal voltaje-dependiente."],"Canales por ligando","vf_canal_ligando","definition","recall","basic"),

    VF("Canal dependiente de voltaje","Base","Un canal dependiente de voltaje se abre o cambia de estado principalmente por cambios en el potencial de membrana.",true,"Verdadero. Los canales dependientes de voltaje son esenciales para el potencial de acción porque responden a la despolarización de la membrana.","",["Voltaje-dependiente = responde a Vm.","Na⁺ dependiente de voltaje inicia espiga.","K⁺ dependiente de voltaje repolariza."],"Canales dependientes de voltaje","vf_canal_voltaje","definition","recall","basic"),

    VF("Canal vs bomba","Medio","Un canal iónico y una bomba iónica son equivalentes porque ambos mueven 3 Na⁺ hacia fuera y 2 K⁺ hacia dentro por cada ciclo.",false,"Falso. La estequiometría 3 Na⁺ fuera y 2 K⁺ dentro corresponde a la bomba Na⁺/K⁺ ATPasa. Un canal permite flujo rápido según gradiente cuando está abierto.","Corrección: bomba = transporte activo con ATP; canal = vía de flujo pasivo rápido según gradiente electroquímico.",["Bomba Na⁺/K⁺: 3 Na⁺ fuera, 2 K⁺ dentro.","Canal = flujo rápido.","No confundir bomba con canal."],"Canal vs bomba","vf_canal_no_bomba","exam_trap","application","medium"),

    VF("Bomba electrogénica","Difícil","La bomba Na⁺/K⁺ ATPasa es electrogénica porque expulsa más carga positiva de la que introduce en cada ciclo.",true,"Verdadero. La bomba saca 3 Na⁺ e introduce 2 K⁺; por tanto, hay un pequeño balance neto de carga positiva hacia el exterior. Su función central sigue siendo mantener gradientes.","",["3 Na⁺ salen.","2 K⁺ entran.","Pequeño efecto electrogénico."],"Bomba electrogénica","vf_bomba_electrogenica","mechanism","reasoning","hard"),

    VF("Acomodación neuronal","Difícil","Una despolarización lenta y sostenida puede reducir la disponibilidad de canales de Na⁺ si algunos se inactivan antes de una espiga sincronizada.",true,"Verdadero. La disponibilidad de canales de Na⁺ depende de sus estados. Una despolarización lenta puede favorecer inactivación sin producir un disparo eficaz, reduciendo la excitabilidad.","",["Na⁺ inactivado = no disponible.","Despolarización lenta puede acomodar.","No todo estímulo sostenido facilita disparo."],"Acomodación neuronal","vf_acomodacion_na","mechanism","reasoning","hard"),

    VF("Direccionalidad","Medio","La propagación axonal suele avanzar hacia delante porque la región recién activada entra en refractariedad y no dispara inmediatamente hacia atrás.",true,"Verdadero. La inactivación de canales de Na⁺ en la zona recién activada limita el retroceso inmediato de la espiga y favorece propagación hacia regiones aún excitables.","",["Refractario favorece dirección.","Na⁺ inactivado no dispara otra vez.","La señal avanza hacia membrana disponible."],"Direccionalidad del PA","vf_direccion_refractario","mechanism","application","medium"),

    VF("Conducción continua","Medio","En un axón no mielinizado, la conducción continua implica regeneración sucesiva del potencial de acción en segmentos contiguos de membrana.",true,"Verdadero. Sin mielina, la propagación no salta entre nodos; cada segmento vecino de membrana debe alcanzar el umbral y regenerar la señal.","",["No mielinizado = continuo.","Regeneración segmento a segmento.","Mielinizado = saltatorio."],"Conducción continua","vf_conduccion_continua","comparison","application","medium"),

    VF("Velocidad de conducción","Medio","Mayor mielinización y mayor diámetro axonal suelen aumentar la velocidad de conducción.",true,"Verdadero. La mielina reduce fuga de corriente y el mayor diámetro reduce resistencia interna, facilitando propagación más rápida.","",["Mielina acelera.","Mayor diámetro reduce resistencia interna.","Ambos aumentan velocidad."],"Velocidad de conducción","vf_mielina_diametro","mechanism","application","medium"),

    VF("Desmielinización","Difícil","La desmielinización suele acelerar la conducción porque obliga al axón a regenerar potenciales de acción en todos los internodos.",false,"Falso. La desmielinización reduce el aislamiento, aumenta la fuga de corriente y puede enlentecer o bloquear la conducción.","Corrección: la mielina acelera y asegura la conducción; su pérdida aumenta la fuga y reduce la eficacia de la conducción saltatoria.",["Mielina = menos fuga.","Desmielinización = conducción lenta/insegura.","Los nodos necesitan suficiente despolarización."],"Desmielinización","vf_desmielinizacion_no_acelera","clinical_application","reasoning","hard"),

    VF("Sinapsis eléctrica","Difícil","Una sinapsis eléctrica transmite corriente directamente entre células acopladas, mientras que una sinapsis química utiliza neurotransmisores y receptores.",true,"Verdadero. La sinapsis eléctrica usa comunicación directa por uniones comunicantes; la sinapsis química requiere liberación de neurotransmisor y activación de receptores postsinápticos.","",["Eléctrica = acoplamiento directo.","Química = neurotransmisor.","Ca²⁺ presináptico pertenece a química."],"Sinapsis eléctrica y química","vf_sinapsis_electrica_quimica","comparison","reasoning","hard"),

    VF("Receptor ionotrópico","Medio","Un receptor ionotrópico se asocia a un canal iónico directo y puede modificar rápidamente la conductancia postsináptica.",true,"Verdadero. Los receptores ionotrópicos permiten cambios rápidos de flujo iónico, a diferencia de receptores metabotrópicos que actúan por vías intracelulares.","",["Ionotrópico = canal/receptor.","Respuesta rápida.","Cambia conductancia."],"Receptor ionotrópico","vf_receptor_ionotropico","definition","application","medium"),

    VF("Receptor metabotrópico","Medio","Un receptor metabotrópico actúa exclusivamente como un poro iónico siempre abierto y no participa en señalización intracelular.",false,"Falso. Los receptores metabotrópicos actúan mediante proteínas G o vías de señalización intracelular, no como un poro iónico siempre abierto.","Corrección: ionotrópico = canal directo; metabotrópico = señalización intracelular moduladora.",["Metabotrópico = vía intracelular.","Ionotrópico = canal directo.","No confundir mecanismos postsinápticos."],"Receptor metabotrópico","vf_metabotropico_no_poro","comparison","application","medium"),

    VF("Microcambios iónicos","Difícil","Un potencial de acción modifica el voltaje por pequeños movimientos de carga cerca de la membrana, sin vaciar masivamente los compartimentos de Na⁺ y K⁺.",true,"Verdadero. La membrana se comporta como un capacitor biológico: pequeños desplazamientos iónicos cerca de la bicapa cambian mucho el voltaje sin agotar concentraciones globales.","",["Membrana = capacitor.","Pequeños movimientos cambian Vm.","Una espiga no vacía compartimentos."],"Microcambios iónicos","vf_microcambios_ionicos","mechanism","reasoning","hard"),

    VF("Síntesis final","Examen","La excitabilidad neuronal depende de gradientes iónicos, una membrana selectiva y canales regulables que modifican la permeabilidad en el tiempo.",true,"Verdadero. Esta frase resume el módulo: los gradientes almacenan energía electroquímica, la membrana separa cargas y los canales convierten cambios de permeabilidad en señales eléctricas.","",["Gradientes iónicos.","Membrana selectiva.","Canales regulables."],"Síntesis de excitabilidad","vf_sintesis_excitabilidad","summary","reasoning","hard")
  ];

  for(var i=0;i<items.length;i++) replaceModuleIndex(bank.vf, 30+i, items[i]);

  ROOT.fisiologiaQualityPatchV324 = {
    applied:true,
    module:1,
    moduleId:MODULE_ID,
    block:"VF 031-050",
    strategy:"replaceModuleIndex without increasing item counts",
    expectedChanged:20,
    notes:"Finishes Module 1 V/F with clear complete statements covering values, ion gradients, channel states, conduction, synapses and synthesis traps."
  };
})();
