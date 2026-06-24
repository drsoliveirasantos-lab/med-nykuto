/* v350 — Fisiología quality patch, Módulo 2 Casos clínicos 001–015.
   Scope: replaces clinical cases 001–015 of Module 2 by module position.
   Count-safe: no push, no delete, existing ids preserved.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["fisiologia"];
  if(!bank || !Array.isArray(bank.cases)) return;

  var COURSE = "fisiologia";
  var MODULE_ID = "01-fisiologia-02-transporte-de-membrana";
  var MODULE_TITLE = "Transporte de membrana";
  var PATCH = "fisiologia-v350-m2-cases-001-015";

  function slug(x){
    return String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  }
  function moduleHits(arr){
    return arr.map(function(x,i){ return {x:x,i:i}; }).filter(function(o){ return o.x && o.x.moduleId === MODULE_ID; });
  }
  function replaceModuleIndex(arr,index,item){
    var hits = moduleHits(arr);
    if(!hits[index]) return false;
    var old = hits[index].x;
    var merged = Object.assign({}, old, item);
    merged.id = old.id;
    merged.courseId = old.courseId || COURSE;
    merged.moduleId = old.moduleId || MODULE_ID;
    merged.moduleNumber = old.moduleNumber || 2;
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
      casePedagogicalStandard:"med_nykuto_v350_short_clinical_story",
      tags:{subject:COURSE,subjectLabel:"Fisiología",moduleNumber:2,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"case",topic:topic,topicSlug:slug(topic),skill:skill||"clinical_reasoning",cognitiveLevel:level||"reasoning",difficulty:diff||"medium",adaptiveVersion:"v350",visible:false},
      tagList:["subject:fisiologia","module:2","format:case","standard:med_nykuto_v350","topic:"+slug(topic)]
    };
  }

  var items = [
    C("Difusión simple de gases","Medio",
      "Un hombre con neumonía presenta engrosamiento de la barrera alveolocapilar y disnea de esfuerzo. El médico explica que el O₂ debe atravesar membranas celulares y una barrera más larga antes de llegar a la sangre.",
      "¿Qué mecanismo de transporte permite normalmente el paso de O₂ a través de las membranas alveolocapilares?",
      ["Difusión simple a favor del gradiente de presión parcial.","Cotransporte activo secundario con Na⁺.","Endocitosis mediada por receptor de oxígeno.","Bomba ATPasa específica de O₂."],0,
      "Correcta. El O₂ es una molécula pequeña y no polar que cruza la bicapa por difusión simple siguiendo su gradiente de presión parcial; el engrosamiento de la barrera dificulta el flujo.",
      [null,"Falsa. El O₂ no necesita acoplarse a Na⁺ para cruzar la bicapa.","Falsa. El O₂ no se internaliza por endocitosis mediada por receptor.","Falsa. No existe una ATPasa fisiológica específica para bombear O₂ a través de la membrana."],
      ["O₂/CO₂ cruzan por difusión simple.","El gradiente de presión parcial impulsa el flujo.","Mayor distancia reduce difusión."],"clinical_reasoning","application","medium"),

    C("Fallo de Na⁺/K⁺ ATPasa","Examen",
      "Una paciente en shock prolongado desarrolla hipoxia tisular. En la biopsia se observan células tumefactas, con aumento de Na⁺ intracelular y entrada de agua.",
      "¿Qué alteración del transporte de membrana explica mejor el edema celular inicial?",
      ["Fallo de bombas dependientes de ATP, especialmente Na⁺/K⁺ ATPasa.","Aumento de difusión simple de albúmina hacia el citosol.","Apertura selectiva de canales de O₂ hacia el núcleo.","Endocitosis de agua por receptores apicales."],0,
      "Correcta. La hipoxia reduce ATP; al fallar la Na⁺/K⁺ ATPasa, se acumula Na⁺ intracelular y el agua entra por efecto osmótico, causando tumefacción celular.",
      [null,"Falsa. La albúmina no difunde libremente hacia el citosol por la bicapa.","Falsa. El O₂ no entra por canales selectivos ni explica la tumefacción por Na⁺.","Falsa. El agua se mueve por ósmosis, no por endocitosis mediada por receptor."],
      ["Hipoxia ↓ ATP.","Na⁺/K⁺ ATPasa mantiene gradientes.","Na⁺ intracelular atrae agua."],"clinical_reasoning","reasoning","hard"),

    C("SGLT y rehidratación oral","Medio",
      "Un niño con diarrea acuosa recibe solución de rehidratación oral con glucosa y sodio. Aunque sigue eliminando líquido, mejora su hidratación porque el intestino conserva un mecanismo de absorción acoplada.",
      "¿Qué transportador explica mejor la absorción conjunta útil en este contexto?",
      ["SGLT apical que introduce Na⁺ y glucosa en el mismo sentido.","GLUT apical que bombea Na⁺ contra gradiente.","Canal de Cl⁻ que internaliza glucosa por vesículas.","Fagocitosis luminal de moléculas de glucosa."],0,
      "Correcta. SGLT usa el gradiente de Na⁺ para cotransportar glucosa hacia el enterocito; el agua puede seguir el gradiente osmótico generado por la absorción de solutos.",
      [null,"Falsa. GLUT transporta glucosa por difusión facilitada y no bombea Na⁺.","Falsa. Un canal de Cl⁻ no internaliza glucosa por vesículas.","Falsa. La glucosa se absorbe por carriers, no por fagocitosis."],
      ["SGLT = simporte Na⁺/glucosa.","Transporte activo secundario.","La absorción de solutos favorece absorción de agua."],"clinical_reasoning","application","medium"),

    C("GLUT4 e insulina","Medio",
      "Después de una comida, una mujer sana libera insulina. En músculo esquelético aumenta la presencia de transportadores de glucosa en la membrana plasmática y mejora la captación de glucosa.",
      "¿Qué mecanismo explica mejor este aumento de captación?",
      ["Inserción de transportadores GLUT en la membrana y difusión facilitada de glucosa.","Conversión de glucosa en Na⁺ para entrar por ENaC.","Difusión simple libre de glucosa por el núcleo lipídico.","Fagocitosis de glucosa por fibras musculares."],0,
      "Correcta. La insulina favorece la translocación de GLUT4 hacia la membrana; GLUT permite difusión facilitada de glucosa a favor de gradiente.",
      [null,"Falsa. La glucosa no se convierte en Na⁺ para entrar por canales epiteliales.","Falsa. La glucosa es polar y requiere transportadores para cruzar eficazmente.","Falsa. La glucosa individual no entra por fagocitosis."],
      ["GLUT = difusión facilitada.","Insulina aumenta GLUT4 en membrana.","Más transportadores aumentan captación."],"clinical_reasoning","application","medium"),

    C("Secreción de Cl⁻ y diarrea","Examen",
      "Un paciente presenta diarrea secretora abundante. El profesor describe activación persistente de canales apicales de Cl⁻ en enterocitos, con salida de Cl⁻ hacia la luz intestinal.",
      "¿Por qué esta salida de Cl⁻ favorece pérdida de agua?",
      ["Porque aumenta osmoles en la luz y el agua sigue el gradiente osmótico.","Porque el Cl⁻ se transforma químicamente en agua dentro de la luz.","Porque los canales de Cl⁻ bombean agua usando ATP directamente.","Porque la salida de Cl⁻ bloquea toda vía paracelular de Na⁺."],0,
      "Correcta. La secreción luminal de Cl⁻ contribuye a crear un gradiente osmótico; Na⁺ y agua pueden seguir hacia la luz, produciendo diarrea acuosa.",
      [null,"Falsa. El Cl⁻ no se convierte en agua.","Falsa. Los canales de Cl⁻ no son bombas de agua dependientes de ATP.","Falsa. La pérdida de agua se explica por fuerzas osmóticas, no por bloqueo absoluto paracelular."],
      ["Cl⁻ luminal atrae solutos y agua.","Agua sigue osmoles efectivos.","Secreción epitelial integra iones y agua."],"clinical_reasoning","reasoning","hard"),

    C("CFTR y secreciones espesas","Examen",
      "Un adolescente con fibrosis quística tiene secreciones respiratorias espesas e infecciones recurrentes. El defecto afecta una proteína epitelial que regula el paso de Cl⁻ y condiciona el movimiento de agua.",
      "¿Qué mecanismo está alterado de forma principal?",
      ["Función de un canal regulado de Cl⁻ en epitelios.","Difusión simple de O₂ por la membrana mitocondrial.","Bomba Na⁺/K⁺ ATPasa de la membrana basolateral como única causa.","Fagocitosis de moco por células epiteliales."],0,
      "Correcta. CFTR funciona como canal regulado de Cl⁻; su alteración modifica el transporte de sal y agua, favoreciendo secreciones viscosas.",
      [null,"Falsa. El problema central no es la difusión simple de O₂.","Falsa. La Na⁺/K⁺ ATPasa participa en gradientes, pero CFTR es el defecto principal descrito.","Falsa. El moco no se resuelve por fagocitosis epitelial como mecanismo principal."],
      ["CFTR = canal de Cl⁻.","Sal y agua determinan hidratación del moco.","Canal alterado cambia secreción epitelial."],"clinical_reasoning","reasoning","hard"),

    C("ADH y acuaporinas","Medio",
      "Un paciente deshidratado presenta aumento de ADH. En el túbulo colector renal, las células insertan más canales de agua en la membrana apical y la orina se concentra.",
      "¿Qué proteína de transporte explica mejor este efecto?",
      ["Acuaporinas que aumentan la permeabilidad al agua.","GLUT que bombea agua contra gradiente.","Na⁺/K⁺ ATPasa apical que transporta agua directamente.","Clatrina como canal selectivo de agua."],0,
      "Correcta. La ADH favorece la inserción de acuaporinas, lo que aumenta el paso pasivo de agua según el gradiente osmótico medular.",
      [null,"Falsa. GLUT transporta glucosa, no agua.","Falsa. La Na⁺/K⁺ ATPasa no bombea agua directamente.","Falsa. La clatrina participa en vesículas, no es un canal de agua."],
      ["ADH aumenta AQP2 apical.","Acuaporina = canal de agua.","Agua se mueve pasivamente por gradiente osmótico."],"clinical_reasoning","application","medium"),

    C("H⁺/K⁺ ATPasa gástrica","Medio",
      "Un paciente con reflujo gastroesofágico recibe un inhibidor de bomba de protones. Días después disminuye la acidez gástrica y mejora la pirosis.",
      "¿Qué transporte se inhibe principalmente?",
      ["Bomba H⁺/K⁺ ATPasa que secreta protones usando ATP.","Canal pasivo de O₂ en células parietales.","Simporte Na⁺/glucosa de la mucosa gástrica.","Transcitosis de ácido clorhídrico intacto."],0,
      "Correcta. La H⁺/K⁺ ATPasa es una bomba activa primaria de células parietales que usa ATP para secretar H⁺ hacia la luz gástrica.",
      [null,"Falsa. La acidez gástrica no depende de un canal de O₂.","Falsa. SGLT no explica la secreción de protones por células parietales.","Falsa. El ácido no se secreta como molécula intacta por transcitosis."],
      ["H/K ATPasa usa ATP.","Célula parietal secreta H⁺.","IBP reduce secreción ácida."],"clinical_reasoning","application","medium"),

    C("Digoxina y Na⁺/Ca²⁺","Difícil",
      "Un adulto mayor recibe digoxina por insuficiencia cardíaca. El docente explica que al inhibir parcialmente la Na⁺/K⁺ ATPasa aumenta Na⁺ intracelular y se modifica el intercambio Na⁺/Ca²⁺.",
      "¿Cuál consecuencia de transporte ayuda a aumentar Ca²⁺ intracelular en el miocito?",
      ["Menor expulsión de Ca²⁺ por el intercambiador Na⁺/Ca²⁺ al reducirse el gradiente de Na⁺.","Mayor difusión simple de Ca²⁺ a través de la bicapa lipídica.","Transformación de GLUT en canal de Ca²⁺.","Endocitosis de Ca²⁺ por vesículas de clatrina."],0,
      "Correcta. Si disminuye el gradiente de Na⁺, el antiporte Na⁺/Ca²⁺ expulsa menos Ca²⁺; esto favorece mayor Ca²⁺ intracelular disponible para contracción.",
      [null,"Falsa. El Ca²⁺ cargado no difunde libremente por la bicapa.","Falsa. GLUT no se transforma en canal de Ca²⁺.","Falsa. El Ca²⁺ iónico no se regula principalmente por endocitosis de clatrina."],
      ["Na/K sostiene gradiente de Na⁺.","Na/Ca depende de ese gradiente.","Menor extrusión de Ca²⁺ aumenta Ca²⁺ celular."],"clinical_reasoning","reasoning","hard"),

    C("Hiperpotasemia y gradiente de K⁺","Examen",
      "Un paciente con enfermedad renal tiene K⁺ plasmático elevado. En células excitables, el aumento de K⁺ extracelular modifica la fuerza que impulsa la salida de K⁺.",
      "¿Qué cambio es más esperable sobre el potencial de reposo?",
      ["Tendencia a despolarización porque disminuye el gradiente químico de salida de K⁺.","Hiperpolarización extrema por aumento de entrada pasiva de K⁺.","Desaparición inmediata de todos los canales de Na⁺.","Conversión de la Na⁺/K⁺ ATPasa en canal de Cl⁻."],0,
      "Correcta. Al aumentar K⁺ extracelular, disminuye la fuerza química para salida de K⁺; el potencial de membrana puede hacerse menos negativo.",
      [null,"Falsa. El punto principal es menor salida neta de K⁺, no hiperpolarización extrema obligatoria.","Falsa. La hiperpotasemia no elimina instantáneamente los canales de Na⁺.","Falsa. La bomba no cambia de identidad a canal de Cl⁻."],
      ["K⁺ extracelular alto reduce gradiente de salida.","Vm tiende a ser menos negativo.","Gradientes iónicos modifican excitabilidad."],"clinical_reasoning","reasoning","hard"),

    C("Fagocitosis bacteriana","Medio",
      "Un neutrófilo llega a un foco de infección y rodea una bacteria con prolongaciones de membrana. Luego internaliza la partícula en una vesícula que podrá fusionarse con lisosomas.",
      "¿Qué mecanismo de transporte celular se describe?",
      ["Fagocitosis de una partícula grande.","Difusión simple de una molécula no polar.","Uniporte de glucosa por GLUT.","Canal iónico de fuga."],0,
      "Correcta. La fagocitosis internaliza partículas grandes mediante remodelación de membrana y citoesqueleto, formando un fagosoma.",
      [null,"Falsa. Una bacteria no cruza por difusión simple.","Falsa. GLUT transporta glucosa, no bacterias.","Falsa. Un canal de fuga transporta iones, no partículas grandes."],
      ["Fagocitosis = partículas grandes.","Forma fagosoma.","Puede fusionarse con lisosomas."],"clinical_reasoning","application","medium"),

    C("Endocitosis de LDL","Medio",
      "Un hepatocito capta LDL desde la sangre mediante receptores específicos de membrana. El complejo receptor-LDL se concentra en zonas cubiertas y entra en vesículas.",
      "¿Qué mecanismo explica mejor la entrada de LDL?",
      ["Endocitosis mediada por receptor.","Difusión simple por bicapa lipídica.","Canal iónico selectivo para lipoproteínas.","Simporte Na⁺/LDL por gradiente de sodio."],0,
      "Correcta. LDL es una macromolécula que entra por unión a receptores y formación de vesículas, no por difusión simple.",
      [null,"Falsa. LDL es demasiado grande y compleja para cruzar libremente la bicapa.","Falsa. No existe un canal iónico para lipoproteínas.","Falsa. El mecanismo clásico de LDL no es simporte con Na⁺."],
      ["LDL usa receptor.","Endocitosis selectiva.","La carga puede ir a endosomas y lisosomas."],"clinical_reasoning","application","medium"),

    C("Transcitosis de inmunoglobulinas","Medio",
      "Un recién nacido recibe anticuerpos maternos a través de un epitelio. Las proteínas se internalizan en una cara celular, viajan en vesículas y se liberan en la cara opuesta sin degradarse completamente.",
      "¿Qué proceso permite este transporte de lado a lado?",
      ["Transcitosis vesicular.","Difusión simple por el núcleo hidrofóbico.","Canal de K⁺ dependiente de voltaje.","Bomba H⁺/K⁺ ATPasa."],0,
      "Correcta. La transcitosis combina endocitosis, transporte vesicular intracelular y exocitosis en el polo opuesto de la célula.",
      [null,"Falsa. Las inmunoglobulinas no atraviesan la bicapa por difusión simple.","Falsa. Un canal de K⁺ no transporta anticuerpos.","Falsa. La H⁺/K⁺ ATPasa secreta protones, no transfiere proteínas intactas."],
      ["Transcitosis = endocitosis + tráfico + exocitosis.","Permite mover proteínas.","Depende de polaridad celular."],"clinical_reasoning","application","medium"),

    C("Pérdida de uniones estrechas","Difícil",
      "Una toxina daña las uniones estrechas de un epitelio intestinal. El paciente desarrolla diarrea porque aumenta el paso entre células de iones y agua.",
      "¿Qué vía de transporte se altera principalmente?",
      ["Vía paracelular regulada por uniones estrechas.","Difusión transcelular de O₂ por la bicapa.","Cotransporte SGLT de glucosa exclusivamente.","Fagocitosis de agua hacia el intersticio."],0,
      "Correcta. Las uniones estrechas controlan el paso paracelular; si se dañan, aumenta la permeabilidad entre células y puede perderse líquido.",
      [null,"Falsa. El problema descrito es entre células, no difusión transcelular de O₂.","Falsa. SGLT puede absorber solutos, pero el daño de tight junctions afecta la vía paracelular.","Falsa. El agua no se transporta por fagocitosis."],
      ["Tight junctions regulan paracelular.","Paracelular = entre células.","Mayor permeabilidad puede causar diarrea."],"clinical_reasoning","reasoning","hard"),

    C("Umbral renal de glucosa","Examen",
      "Una paciente con hiperglucemia marcada presenta glucosuria. El profesor explica que los transportadores tubulares de glucosa tienen capacidad máxima y se saturan cuando la carga filtrada es excesiva.",
      "¿Qué propiedad de los carriers explica la glucosuria en este contexto?",
      ["Saturación por número limitado de transportadores y velocidad máxima de transporte.","Difusión simple ilimitada de glucosa por la bicapa.","Conversión de glucosa en agua por acuaporinas.","Endocitosis obligatoria de glucosa filtrada."],0,
      "Correcta. Los carriers de glucosa tienen capacidad máxima; cuando la carga filtrada supera la reabsorción máxima, aparece glucosa en orina.",
      [null,"Falsa. La glucosa no difunde libremente de forma ilimitada por la bicapa.","Falsa. Las acuaporinas transportan agua, no convierten glucosa en agua.","Falsa. La glucosa se reabsorbe por transportadores, no por endocitosis obligatoria."],
      ["Carrier saturable = Tm.","Carga filtrada alta supera reabsorción.","Glucosuria aparece cuando se excede capacidad."],"clinical_reasoning","reasoning","hard")
  ];

  var applied = 0;
  for(var i=0;i<items.length;i++) if(replaceModuleIndex(bank.cases, i, items[i])) applied++;

  ROOT.qualityPatchReports = ROOT.qualityPatchReports || [];
  ROOT.qualityPatchReports.push({patch:PATCH,courseId:COURSE,moduleId:MODULE_ID,format:"case",range:"001-015",replacements:applied,attempted:items.length,countSafe:true});
})();