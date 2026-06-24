/* v346 — Fisiología quality patch, Módulo 2 V/F 001–025.
   Scope: replaces Verdadero/Falso 001–025 of Module 2 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.vf)) return;

  var MODULE_ID = "01-fisiologia-02-transporte-de-membrana";
  var MODULE_TITLE = "Transporte de membrana";
  var PATCH = "fisiologia-v346-m2-vf-001-025";

  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function replaceModuleIndex(arr,index,item){
    var hits = moduleHits(arr);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || "fisiologia";
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 2;
    merged.moduleTitle = old.moduleTitle || MODULE_TITLE;
    merged.qualityPatch = PATCH;
    merged.auditDecision = "B";
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:2, format:"vf", visible:false, adaptiveVersion:"v346"});
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
      whyWrong:isTrue
        ? [null,"Falsa. La afirmación es verdadera y respeta el mecanismo fisiológico del transporte de membrana."]
        : ["Falsa. Marcar Verdadero sería incorrecto porque la afirmación invierte o simplifica mal el mecanismo de transporte.",null],
      distractorExplanations:isTrue
        ? [null,"Marcar Falso sería incorrecto porque la afirmación describe correctamente el mecanismo."]
        : ["Marcar Verdadero sería incorrecto; debe aplicarse la corrección indicada.",null],
      keyPoints:keyPoints,
      correction:correctionIfFalse || explanation,
      tags:{topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}
    };
  }

  var items = [
    VF("Bicapa lipídica","Base","La bicapa lipídica permite con mayor facilidad el paso de moléculas pequeñas y no polares que el de iones hidratados.",true,"Verdadero. El núcleo hidrofóbico de la bicapa favorece el paso de sustancias liposolubles o no polares, mientras que los iones hidratados necesitan canales o transportadores.","",["Bicapa = barrera hidrofóbica.","Moléculas no polares cruzan mejor.","Iones necesitan proteínas."],"Bicapa lipídica","vf_bicapa_liposoluble","concept","recall","basic"),

    VF("Difusión simple","Base","La difusión simple de O₂ y CO₂ requiere hidrólisis directa de ATP por una bomba específica.",false,"Falso. O₂ y CO₂ cruzan muchas membranas por difusión simple a favor de sus gradientes, sin gasto directo de ATP.","Corrección: O₂ y CO₂ difunden por la bicapa según su gradiente; no requieren una ATPasa específica.",["O₂/CO₂ = difusión simple.","Sin ATP directo.","Depende del gradiente."],"Difusión simple","vf_difusion_gases_no_atp","exam_trap","recall","basic"),

    VF("Gradiente y permeabilidad","Medio","Un gradiente de concentración puede existir sin generar flujo importante si la membrana tiene muy baja permeabilidad para ese soluto.",true,"Verdadero. El gradiente es la fuerza impulsora, pero el flujo real necesita una vía de paso. Sin permeabilidad suficiente, el movimiento neto puede ser pequeño.","",["Gradiente no basta.","Permeabilidad permite el flujo.","Ambos conceptos son distintos."],"Gradiente y permeabilidad","vf_gradiente_permeabilidad_m2","mechanism","application","medium"),

    VF("Iones y voltaje","Medio","Para un ion, la dirección neta de movimiento depende solo de la concentración y nunca del voltaje de membrana.",false,"Falso. Los iones tienen carga eléctrica; por eso su movimiento depende del gradiente electroquímico, que integra concentración y voltaje.","Corrección: la dirección neta de un ion depende del gradiente electroquímico: fuerza química más fuerza eléctrica.",["Ion = concentración + voltaje.","Gradiente electroquímico decide dirección.","No analizar iones como moléculas neutras."],"Gradiente electroquímico","vf_ion_no_solo_concentracion","exam_trap","reasoning","medium"),

    VF("Canales iónicos","Base","Un canal iónico abierto aumenta la permeabilidad de la membrana para un ion específico y permite flujo pasivo según el gradiente electroquímico.",true,"Verdadero. Los canales son poros selectivos; cuando están abiertos, el ion se mueve rápidamente a favor de su fuerza electroquímica.","",["Canal = poro selectivo.","Flujo pasivo.","Dirección por gradiente electroquímico."],"Canales iónicos","vf_canal_flujo_pasivo","mechanism","recall","basic"),

    VF("Canales y ATP","Medio","Todo canal iónico hidroliza ATP directamente para mover cada ion que atraviesa el poro.",false,"Falso. Muchos canales permiten flujo pasivo sin hidrólisis directa de ATP; las bombas ATPasas son las que consumen ATP para mover solutos contra gradiente.","Corrección: los canales suelen permitir paso pasivo; las ATPasas usan ATP directamente.",["Canal no es bomba.","Canal abierto facilita flujo pasivo.","ATP directo caracteriza transporte activo primario."],"Canales versus bombas","vf_canal_no_atp_directo","comparison","application","medium"),

    VF("Carrier saturable","Medio","Los carriers pueden mostrar saturación porque tienen sitios de unión y ciclos conformacionales limitados.",true,"Verdadero. A diferencia de una difusión simple ideal, el transporte por carrier depende del número de proteínas disponibles y de la velocidad de su ciclo de unión, cambio conformacional y liberación.","",["Carrier = sitio de unión.","Carrier = cambio conformacional.","Puede alcanzar Tm o Vmax."],"Carrier saturable","vf_carrier_saturable","mechanism","application","medium"),

    VF("GLUT","Base","GLUT es un ejemplo de difusión facilitada de glucosa que no cotransporta Na⁺ de forma obligatoria.",true,"Verdadero. GLUT facilita el paso de glucosa a favor de su gradiente. El cotransporte con Na⁺ corresponde a SGLT, no a GLUT.","",["GLUT = uniporte.","GLUT = difusión facilitada.","SGLT = Na⁺/glucosa."],"GLUT","vf_glut_uniporte","classification","recall","basic"),

    VF("SGLT","Medio","SGLT puede transportar glucosa contra su gradiente usando de forma indirecta la energía almacenada en el gradiente de Na⁺.",true,"Verdadero. SGLT es transporte activo secundario: el Na⁺ entra a favor de su gradiente y permite acoplar la entrada de glucosa.","",["SGLT = simporte.","Usa gradiente de Na⁺.","Activo secundario = energía indirecta."],"SGLT","vf_sglt_gradiente_na","mechanism","application","medium"),

    VF("Activo secundario","Medio","El transporte activo secundario siempre hidroliza ATP directamente en la misma proteína que mueve el soluto.",false,"Falso. En el transporte activo secundario, la energía inmediata proviene de un gradiente iónico creado previamente por transporte activo primario.","Corrección: el transporte activo primario usa ATP directo; el secundario usa energía almacenada en un gradiente, por ejemplo de Na⁺.",["Primario = ATP directo.","Secundario = gradiente previo.","No confundir la fuente de energía."],"Activo secundario","vf_secundario_no_atp_directo","exam_trap","application","medium"),

    VF("Na⁺/K⁺ ATPasa","Base","La Na⁺/K⁺ ATPasa mantiene gradientes de Na⁺ y K⁺ al expulsar Na⁺ e introducir K⁺ usando ATP.",true,"Verdadero. Esta bomba activa primaria sostiene una concentración baja de Na⁺ intracelular y alta de K⁺ intracelular, fundamentales para múltiples transportes.","",["Na/K ATPasa usa ATP.","Saca Na⁺.","Entra K⁺.","Sostiene gradientes."],"Na/K ATPasa","vf_na_k_atpasa_gradientes","mechanism","recall","basic"),

    VF("Electrogenicidad","Medio","La Na⁺/K⁺ ATPasa clásica es electroneutra porque mueve exactamente la misma carga positiva hacia ambos lados.",false,"Falso. La bomba clásica expulsa 3 Na⁺ e introduce 2 K⁺ por ciclo, generando una salida neta de una carga positiva; por eso es electrogénica.","Corrección: la Na⁺/K⁺ ATPasa es electrogénica porque saca 3 cargas positivas y entra 2.",["3 Na⁺ salen.","2 K⁺ entran.","Movimiento neto de carga positiva hacia fuera."],"Electrogenicidad","vf_na_k_electrogenica","exam_trap","reasoning","medium"),

    VF("Osmosis","Base","El agua tiende a moverse hacia el compartimento con mayor concentración de solutos osmóticamente efectivos si existe permeabilidad al agua.",true,"Verdadero. La ósmosis es el movimiento pasivo de agua determinado por gradientes osmóticos efectivos y por la permeabilidad de la membrana al agua.","",["Agua sigue osmoles efectivos.","Ósmosis es pasiva.","Acuaporinas aumentan permeabilidad al agua."],"Ósmosis","vf_agua_osmoles","mechanism","recall","basic"),

    VF("Acuaporinas","Base","Las acuaporinas son bombas ATPasas que transportan Na⁺ contra gradiente para arrastrar agua.",false,"Falso. Las acuaporinas son canales de agua. No bombean Na⁺ ni hidrolizan ATP directamente para transportar agua.","Corrección: las acuaporinas facilitan el paso pasivo de agua según gradientes osmóticos.",["Acuaporina = canal de agua.","No es bomba de Na⁺.","No usa ATP directo."],"Acuaporinas","vf_acuaporina_no_bomba","exam_trap","recall","basic"),

    VF("Solutos impermeantes","Medio","Los solutos que no atraviesan fácilmente la membrana son especialmente importantes para sostener gradientes osmóticos efectivos.",true,"Verdadero. Un soluto impermeante permanece en su compartimento y mantiene una fuerza osmótica capaz de atraer agua.","",["Impermeante = osmóticamente efectivo.","Mantiene gradiente osmótico.","Influye en volumen celular."],"Solutos impermeantes","vf_solutos_impermeantes","mechanism","application","medium"),

    VF("Edema celular","Difícil","El fallo severo de la Na⁺/K⁺ ATPasa puede favorecer edema celular por acumulación intracelular de Na⁺ y entrada osmótica de agua.",true,"Verdadero. Si falta ATP, la bomba se debilita, aumenta Na⁺ intracelular y el agua entra siguiendo la carga osmótica efectiva.","",["Fallo energético reduce bombas.","Na⁺ intracelular aumenta.","Agua entra por ósmosis."],"Edema celular","vf_edema_celular_bomba","clinical_application","reasoning","hard"),

    VF("Endocitosis receptor-mediada","Medio","La endocitosis mediada por receptor es poco selectiva porque no depende de reconocimiento ligando-receptor.",false,"Falso. La especificidad de este mecanismo se basa precisamente en la unión de ligandos a receptores específicos de membrana.","Corrección: la endocitosis mediada por receptor es selectiva porque depende del reconocimiento ligando-receptor.",["Receptor da especificidad.","Ligando se concentra.","Luego se forma vesícula."],"Endocitosis receptor-mediada","vf_endocitosis_receptor_selectiva","exam_trap","application","medium"),

    VF("Clatrina","Medio","La clatrina participa en la formación de algunas vesículas de endocitosis y ayuda a deformar la membrana.",true,"Verdadero. Las cubiertas proteicas como clatrina contribuyen a seleccionar carga y curvar la membrana para formar vesículas.","",["Clatrina = cubierta vesicular.","Ayuda a formar vesículas.","No es canal iónico."],"Clatrina","vf_clatrina_vesiculas","mechanism","recall","medium"),

    VF("Pinocitosis","Base","La pinocitosis capta líquido extracelular y solutos disueltos mediante vesículas.",true,"Verdadero. La pinocitosis es una forma de endocitosis orientada a captar líquido y moléculas disueltas, generalmente menos específica que la mediada por receptor.","",["Pinocitosis = líquido.","Es endocitosis.","Usa vesículas."],"Pinocitosis","vf_pinocitosis_liquido","definition","recall","basic"),

    VF("Fagocitosis","Base","La fagocitosis es el mecanismo habitual para transportar glucosa individual hacia el citosol.",false,"Falso. La fagocitosis internaliza partículas grandes, como bacterias o detritos. La glucosa usa transportadores como GLUT o SGLT.","Corrección: la glucosa entra por carriers; la fagocitosis internaliza partículas grandes.",["Fagocitosis = partículas grandes.","Glucosa = GLUT/SGLT.","No confundir vesículas con carriers."],"Fagocitosis","vf_fagocitosis_no_glucosa","exam_trap","recall","basic"),

    VF("Exocitosis","Medio","La exocitosis puede liberar contenido al exterior y también añadir proteínas de la vesícula a la membrana plasmática.",true,"Verdadero. Al fusionarse con la membrana plasmática, la vesícula libera su contenido y aporta lípidos o proteínas a la superficie celular.","",["Exocitosis libera contenido.","También añade membrana.","Puede insertar receptores o canales."],"Exocitosis","vf_exocitosis_membrana","integration","application","medium"),

    VF("Transcitosis","Medio","La transcitosis combina endocitosis en una superficie celular, transporte vesicular interno y exocitosis en la superficie opuesta.",true,"Verdadero. Este mecanismo permite atravesar una célula polarizada con material vesicular sin depender de canales o carriers para solutos pequeños.","",["Transcitosis = entrada + tráfico + salida.","Útil para proteínas.","Depende de vesículas."],"Transcitosis","vf_transcitosis_secuencia","definition","application","medium"),

    VF("Vía paracelular","Medio","La vía paracelular atraviesa la célula por sus membranas apical y basolateral.",false,"Falso. La vía paracelular pasa entre células, regulada por uniones estrechas. La vía transcelular atraviesa la célula.","Corrección: paracelular = entre células; transcelular = a través de la célula.",["Paracelular = entre células.","Transcelular = por la célula.","Uniones estrechas regulan paracelular."],"Vía paracelular","vf_paracelular_no_transcelular","exam_trap","application","medium"),

    VF("Polaridad epitelial","Medio","La localización apical o basolateral de un transportador puede determinar si un epitelio absorbe o secreta un soluto.",true,"Verdadero. La polaridad epitelial organiza transportadores en dominios distintos, permitiendo transporte vectorial hacia la luz o hacia el intersticio.","",["Apical mira a la luz.","Basolateral mira al intersticio.","Polaridad dirige transporte."],"Polaridad epitelial","vf_polaridad_vectorial","integration","application","medium"),

    VF("Uniones estrechas","Medio","Las uniones estrechas solo sirven para unir mecánicamente células y no influyen en el paso de solutos.",false,"Falso. Las uniones estrechas regulan la permeabilidad paracelular, pueden seleccionar por tamaño o carga y ayudan a mantener la polaridad epitelial.","Corrección: las uniones estrechas regulan el paso paracelular y contribuyen a separar dominios apicales y basolaterales.",["Tight junctions regulan paracelular.","Influyen en tamaño y carga.","Mantienen polaridad."],"Uniones estrechas","vf_uniones_estrechas_funcion","exam_trap","reasoning","medium")
  ];

  var applied = 0;
  for(var i=0;i<items.length;i++) if(replaceModuleIndex(bank.vf, i, items[i])) applied++;

  ROOT.qualityPatchReports = ROOT.qualityPatchReports || [];
  ROOT.qualityPatchReports.push({patch:PATCH,courseId:"fisiologia",moduleId:MODULE_ID,format:"vf",range:"001-025",replacements:applied,attempted:items.length,countSafe:true});
})();