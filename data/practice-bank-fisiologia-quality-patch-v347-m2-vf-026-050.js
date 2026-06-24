/* v347 — Fisiología quality patch, Módulo 2 V/F 026–050.
   Scope: replaces Verdadero/Falso 026–050 of Module 2 by module position.
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
  var PATCH = "fisiologia-v347-m2-vf-026-050";

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
    merged.tags = Object.assign({}, old.tags || {}, item.tags || {}, {subject:"fisiologia", moduleNumber:2, format:"vf", visible:false, adaptiveVersion:"v347"});
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
        ? [null,"Falsa. La afirmación es verdadera y describe correctamente el transporte de membrana."]
        : ["Falsa. Marcar Verdadero sería incorrecto porque la afirmación debe corregirse según el mecanismo fisiológico.",null],
      distractorExplanations:isTrue
        ? [null,"Marcar Falso sería incorrecto porque el enunciado es fisiológicamente correcto."]
        : ["Marcar Verdadero sería incorrecto; la afirmación contiene el error indicado en la corrección.",null],
      keyPoints:keyPoints,
      correction:correctionIfFalse || explanation,
      tags:{topic:topic, topicSlug:slug, skill:skill, cognitiveLevel:level, difficulty:diff}
    };
  }

  var items = [
    VF("Transporte transcelular","Medio","La vía transcelular exige que el soluto atraviese al menos una membrana celular y, en epitelios, suele requerir coordinación entre membrana apical y basolateral.",true,"Verdadero. En epitelios polarizados, el transporte transcelular cruza la célula; por eso depende de transportadores, canales o bombas ubicados estratégicamente en superficies opuestas.","",["Transcelular = a través de la célula.","Apical y basolateral cooperan.","La polaridad permite dirección neta."],"Transporte transcelular","vf_transcelular_epitelio","definition","application","medium"),

    VF("Transporte paracelular","Medio","El transporte paracelular ocurre entre células y está influido por las uniones estrechas.",true,"Verdadero. La vía paracelular no atraviesa el citoplasma; pasa por espacios intercelulares regulados por tight junctions, que condicionan tamaño, carga y permeabilidad.","",["Paracelular = entre células.","Uniones estrechas regulan.","No atraviesa el citoplasma."],"Transporte paracelular","vf_paracelular_tight","mechanism","recall","medium"),

    VF("Epitelio permeable","Medio","Un epitelio con uniones estrechas muy permeables puede permitir mayor flujo paracelular de agua e iones que un epitelio con uniones muy cerradas.",true,"Verdadero. Los epitelios leaky permiten más movimiento paracelular; los epitelios tight restringen más el paso entre células.","",["Leaky = más paracelular.","Tight = más barrera.","La permeabilidad epitelial varía por tejido."],"Epitelios tight y leaky","vf_epitelio_leaky","comparison","application","medium"),

    VF("Selectividad paracelular","Difícil","La vía paracelular es siempre un hueco libre sin selectividad por tamaño ni carga.",false,"Falso. La vía paracelular puede ser selectiva porque las proteínas de uniones estrechas regulan el paso según tamaño, carga y tipo de epitelio.","Corrección: la vía paracelular está regulada y puede mostrar selectividad por tamaño y carga.",["Paracelular no es hueco libre.","Claudinas y tight junctions regulan paso.","La selectividad depende del epitelio."],"Selectividad paracelular","vf_paracelular_no_hueco","exam_trap","reasoning","hard"),

    VF("Transporte vectorial","Medio","El transporte vectorial epitelial depende de que los transportadores estén distribuidos de forma asimétrica en membranas apical y basolateral.",true,"Verdadero. La asimetría permite que un soluto entre por una superficie y salga por otra, generando absorción o secreción neta.","",["Vectorial = dirección neta.","Requiere polaridad.","Transportadores apicales y basolaterales no son equivalentes."],"Transporte vectorial","vf_transporte_vectorial","integration","application","medium"),

    VF("Na/K basolateral","Medio","En muchos epitelios absorbentes, la Na⁺/K⁺ ATPasa basolateral ayuda a mantener bajo el Na⁺ intracelular y favorece la entrada apical de Na⁺.",true,"Verdadero. Al expulsar Na⁺ hacia el intersticio, la bomba mantiene el gradiente que impulsa entrada de Na⁺ desde la luz por canales o cotransportadores.","",["Na/K basolateral sostiene gradiente.","Na⁺ intracelular bajo favorece entrada apical.","Absorción depende de gradientes."],"Na/K basolateral","vf_na_k_basolateral","mechanism","application","medium"),

    VF("Absorción de glucosa","Medio","La absorción intestinal de glucosa puede combinar SGLT apical y GLUT basolateral para mover glucosa desde la luz hacia la sangre.",true,"Verdadero. SGLT introduce Na⁺ y glucosa desde la luz, mientras GLUT permite salida basolateral de glucosa a favor de gradiente.","",["SGLT apical introduce glucosa.","GLUT basolateral permite salida.","Ejemplo clásico de transporte vectorial."],"Absorción de glucosa","vf_absorcion_glucosa_epitelial","clinical_application","application","medium"),

    VF("GLUT basolateral","Medio","En la absorción epitelial de glucosa, GLUT basolateral suele expulsar glucosa usando ATP directo.",false,"Falso. GLUT realiza difusión facilitada: permite salida de glucosa a favor de gradiente, sin hidrólisis directa de ATP.","Corrección: la salida basolateral de glucosa por GLUT es difusión facilitada, no transporte activo primario.",["GLUT = pasivo facilitado.","No usa ATP directo.","La energía indirecta está en SGLT apical."],"GLUT basolateral","vf_glut_no_atp","exam_trap","application","medium"),

    VF("Antiporte Na/Ca","Difícil","El intercambiador Na⁺/Ca²⁺ puede usar el gradiente de Na⁺ para expulsar Ca²⁺ del citosol.",true,"Verdadero. Es un ejemplo de transporte activo secundario: la entrada de Na⁺ a favor de gradiente puede acoplarse a la salida de Ca²⁺ contra gradiente.","",["Na/Ca = antiporte.","Gradiente de Na⁺ aporta energía indirecta.","Ayuda a mantener bajo Ca²⁺ citosólico."],"Intercambiador Na/Ca","vf_na_ca_expulsa_calcio","mechanism","reasoning","hard"),

    VF("Calcio citosólico","Medio","El Ca²⁺ libre citosólico se mantiene bajo por bombas, intercambiadores y secuestro en compartimentos intracelulares.",true,"Verdadero. El Ca²⁺ citosólico bajo permite que pequeños aumentos funcionen como señal intracelular; bombas e intercambiadores lo expulsan o secuestran.","",["Ca²⁺ citosólico bajo.","PMCA/SERCA/intercambiadores participan.","Ca²⁺ funciona como señal."],"Homeostasis de calcio","vf_calcio_citosol_bajo","integration","application","medium"),

    VF("Ca²⁺ como señal","Medio","El Ca²⁺ intracelular no puede funcionar como señal porque su concentración citosólica permanece siempre igual.",false,"Falso. Justamente porque el Ca²⁺ basal citosólico es bajo, aumentos transitorios pueden actuar como señales para secreción, contracción o activación enzimática.","Corrección: el Ca²⁺ citosólico puede aumentar de forma transitoria y actuar como segundo mensajero.",["Ca²⁺ basal bajo.","Aumento transitorio = señal.","No confundir homeostasis con ausencia de variación."],"Calcio señalizador","vf_calcio_senal","exam_trap","reasoning","medium"),

    VF("Bomba de protones","Medio","Una bomba de H⁺ dependiente de ATP puede acidificar compartimentos intracelulares como endosomas o lisosomas.",true,"Verdadero. Las bombas de protones introducen H⁺ en compartimentos vesiculares, reduciendo el pH y permitiendo separación ligando-receptor o degradación lisosomal.","",["H⁺ ATPasa acidifica vesículas.","Endosoma ácido clasifica carga.","Lisosoma ácido degrada."],"Bomba de protones","vf_bomba_protones_vesiculas","mechanism","application","medium"),

    VF("H/K ATPasa","Medio","La H⁺/K⁺ ATPasa gástrica es un ejemplo de transporte activo primario porque utiliza ATP para mover protones.",true,"Verdadero. Esta bomba usa ATP directamente para secretar H⁺ y participa en la acidificación del lumen gástrico.","",["H/K ATPasa usa ATP.","Transporte activo primario.","Importante en secreción ácida."],"H/K ATPasa","vf_h_k_atpasa","clinical_application","recall","medium"),

    VF("Inhibidores de bombas","Difícil","Inhibir una bomba primaria puede afectar transportes secundarios que dependen del gradiente creado por esa bomba.",true,"Verdadero. Las bombas primarias mantienen gradientes iónicos; si estos gradientes caen, los cotransportes y antiportes secundarios pierden fuerza impulsora.","",["Primario crea gradientes.","Secundario usa gradientes.","Un bloqueo primario tiene efectos indirectos."],"Inhibición de bombas","vf_inhibicion_bomba_secundario","integration","reasoning","hard"),

    VF("Competencia por carrier","Difícil","Dos solutos que comparten el mismo carrier pueden competir y reducir el transporte efectivo de uno de ellos.",true,"Verdadero. El carrier tiene sitios de unión limitados; por eso moléculas con afinidad por el mismo transportador pueden competir.","",["Carrier tiene sitios limitados.","Competencia reduce transporte.","Importante en fármacos y nutrientes."],"Competencia por carrier","vf_competencia_carrier","clinical_application","reasoning","hard"),

    VF("Difusión simple saturable","Medio","La difusión simple por la bicapa muestra una saturación típica por ocupación de sitios de unión proteicos.",false,"Falso. La saturación por sitios de unión es característica de carriers y transportes mediados por proteínas, no de la difusión simple ideal por la bicapa.","Corrección: los carriers se saturan; la difusión simple depende sobre todo de gradiente y permeabilidad.",["Difusión simple no tiene sitio proteico obligatorio.","Carrier sí se satura.","No confundir flujo por bicapa con transporte mediado."],"Difusión simple versus carrier","vf_difusion_simple_no_saturable","comparison","application","medium"),

    VF("Equilibrio electroquímico","Difícil","Cuando un ion alcanza su potencial de equilibrio, su flujo neto por canales abiertos tiende a cero, aunque pueda existir movimiento microscópico en ambos sentidos.",true,"Verdadero. En el potencial de equilibrio, las fuerzas química y eléctrica se compensan para ese ion; el resultado macroscópico es flujo neto nulo.","",["Equilibrio = fuerza neta cero.","Movimiento microscópico puede persistir.","Flujo neto no equivale a ausencia absoluta de movimiento."],"Equilibrio electroquímico","vf_equilibrio_ionico","reasoning","reasoning","hard"),

    VF("Estado estacionario","Difícil","Un estado estacionario implica necesariamente que no exista ningún flujo a través de la membrana.",false,"Falso. En estado estacionario pueden existir flujos continuos, pero las concentraciones se mantienen estables porque los flujos se equilibran o son compensados por bombas.","Corrección: estado estacionario significa estabilidad dinámica, no ausencia total de flujo.",["Estado estacionario ≠ equilibrio absoluto.","Puede haber flujo continuo.","Bombas pueden mantener gradientes."],"Estado estacionario","vf_estado_estacionario_no_sin_flujo","exam_trap","reasoning","hard"),

    VF("Electroneutralidad celular","Difícil","Aunque existan gradientes iónicos importantes, los compartimentos biológicos mantienen una electroneutralidad aproximada a gran escala.",true,"Verdadero. Pequeñas separaciones de carga cerca de la membrana generan voltaje, pero el volumen total de cada compartimento suele conservar electroneutralidad aproximada.","",["Gradientes no implican carga macroscópica enorme.","Separación de carga es local.","Vm depende de pequeñas diferencias cerca de membrana."],"Electroneutralidad","vf_electroneutralidad_global","conceptual","reasoning","hard"),

    VF("Arrastre de solvente","Difícil","El arrastre de solvente significa que el movimiento de agua puede favorecer el paso de solutos pequeños por una vía permeable.",true,"Verdadero. Si el agua fluye por una vía paracelular o porosa, puede arrastrar solutos pequeños compatibles con esa vía.","",["Agua en movimiento puede arrastrar solutos.","Depende de permeabilidad de la vía.","Importante en epitelios leaky."],"Arrastre de solvente","vf_arrastre_solvente","mechanism","reasoning","hard"),

    VF("Secreción de Cl⁻","Difícil","La secreción epitelial de Cl⁻ puede generar un gradiente osmótico que favorece el movimiento de agua hacia la luz.",true,"Verdadero. El Cl⁻ secretado aumenta osmoles luminales; Na⁺ y agua pueden seguir por fuerzas eléctricas y osmóticas.","",["Cl⁻ luminal atrae Na⁺/agua.","Agua sigue osmoles.","Secreción integra iones y agua."],"Secreción de cloruro","vf_secrecion_cl_agua","integration","reasoning","hard"),

    VF("CFTR","Medio","CFTR se entiende funcionalmente como un canal regulado de Cl⁻ importante para secreción epitelial de sal y agua.",true,"Verdadero. CFTR regula la permeabilidad al Cl⁻ en epitelios y su función condiciona el transporte de sal y agua.","",["CFTR = canal de Cl⁻.","Regulado.","Impacta secreción de sal y agua."],"CFTR","vf_cftr_canal_cl","clinical_application","application","medium"),

    VF("Receptor reciclado","Medio","Después de una endocitosis mediada por receptor, todos los receptores deben degradarse obligatoriamente en lisosomas.",false,"Falso. Muchos receptores se reciclan hacia la membrana plasmática, mientras que otros pueden degradarse según la señal y el tipo de receptor.","Corrección: los receptores pueden reciclarse o degradarse; no todos se destruyen obligatoriamente.",["Receptor puede reciclarse.","Ligando puede degradarse.","Endosomas clasifican carga."],"Reciclaje de receptores","vf_receptor_no_siempre_degrada","exam_trap","application","medium"),

    VF("Membrana y área celular","Medio","La exocitosis tiende a añadir membrana plasmática y la endocitosis tiende a retirarla; su equilibrio ayuda a mantener el área celular.",true,"Verdadero. La célula coordina ambos procesos para renovar membrana, insertar proteínas y evitar cambios extremos de superficie.","",["Exocitosis añade membrana.","Endocitosis retira membrana.","Balance conserva superficie."],"Reciclaje de membrana","vf_balance_endo_exo","integration","application","medium"),

    VF("Síntesis del módulo","Difícil","El transporte de membrana se explica integrando barrera lipídica, gradientes electroquímicos, proteínas específicas y energía metabólica cuando se requiere mover solutos contra gradiente.",true,"Verdadero. Ningún concepto aislado explica todo el transporte: difusión, canales, carriers, bombas y vesículas actúan de forma complementaria según el soluto y el contexto fisiológico.","",["Barrera lipídica selecciona.","Gradientes dirigen.","Proteínas dan especificidad.","Energía permite transporte contra gradiente."],"Síntesis del transporte de membrana","vf_sintesis_modulo2","summary","reasoning","hard")
  ];

  var applied = 0;
  for(var i=0;i<items.length;i++) if(replaceModuleIndex(bank.vf, 25+i, items[i])) applied++;

  ROOT.qualityPatchReports = ROOT.qualityPatchReports || [];
  ROOT.qualityPatchReports.push({patch:PATCH,courseId:"fisiologia",moduleId:MODULE_ID,format:"vf",range:"026-050",replacements:applied,attempted:items.length,countSafe:true});
})();