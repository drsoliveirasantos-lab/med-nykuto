/* v311 — Microbiología Module 1 quality patch
   Correction ciblée sans réécrire le gros fichier compacté practice-bank-microbiologia.js.
   Module: Estructura bacteriana y patogenicidad.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["microbiologia"];
  if(!bank) return;

  var COURSE = "microbiologia";
  var MODULE_ID = "02-microbiologia-01-estructura-bacteriana-y-patogenicidad";
  var MODULE_TITLE = "Estructura bacteriana y patogenicidad";

  function idQ(n){ return MODULE_ID + "-qcm-" + String(n).padStart(3,"0") + "-v167"; }
  function base(format, topic, difficulty){
    return {
      courseId:COURSE,
      moduleId:MODULE_ID,
      moduleNumber:1,
      moduleTitle:MODULE_TITLE,
      heading:topic,
      difficulty:difficulty || "Base",
      tags:{
        subject:COURSE,
        subjectLabel:"Microbiología",
        moduleNumber:1,
        moduleId:MODULE_ID,
        moduleTitle:MODULE_TITLE,
        format:format,
        topic:topic,
        topicSlug:String(topic||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),
        concepts:["estructura_bacteriana","patogenicidad_virulencia","diagnostico_microbiologico"],
        skill:format === "case" ? "clinical_reasoning" : "mechanism",
        cognitiveLevel:"reasoning",
        difficulty:difficulty === "Examen" ? "hard" : (difficulty === "Moyen" ? "medium" : "basic"),
        adaptiveVersion:"v311",
        visible:false
      }
    };
  }
  function upsert(arr,item){
    if(!Array.isArray(arr) || !item || !item.id) return;
    var i = arr.findIndex(function(x){ return x && x.id === item.id; });
    if(i >= 0) arr[i] = Object.assign({}, arr[i], item);
    else arr.push(item);
  }
  function q(n, topic, difficulty, question, options, answerIndex, explanation, whyWrong, keyPoints){
    return Object.assign(base("qcm", topic, difficulty), {
      id:idQ(n),
      question:question,
      options:options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:whyWrong,
      distractorExplanations:whyWrong,
      keyPoints:keyPoints || [],
      qcmPedagogicalStandard:"med_nykuto_v311_specific_corrections",
      qcmNarrativeVersion:"v311"
    });
  }
  function vf(n, question, answerIndex, explanation){
    return Object.assign(base("vf", "V/F estructura y patogenicidad", "Base"), {
      id:MODULE_ID + "-vf-quality-" + String(n).padStart(3,"0") + "-v311",
      question:question,
      options:["Verdadero","Falso"],
      answerIndex:answerIndex,
      explanation:explanation,
      keyPoints:["V/F corregido con justificación específica."],
      vfPedagogicalStandard:"med_nykuto_v311_literal_precision"
    });
  }
  function caso(n, stem, question, options, answerIndex, explanation, whyWrong){
    return Object.assign(base("case", "Caso clínico estructura y patogenicidad", "Moyen"), {
      id:MODULE_ID + "-case-quality-" + String(n).padStart(3,"0") + "-v311",
      stem:stem,
      question:question,
      options:options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:whyWrong,
      distractorExplanations:whyWrong,
      keyPoints:["Caso clínico con historia breve y corrección específica."],
      casePedagogicalStandard:"med_nykuto_v311_short_clinical_story"
    });
  }

  var qcms = [
    q(1,"Pared bacteriana Gram positiva","Base",
      "Un informe de Gram describe cocos Gram positivos. ¿Qué característica estructural explica mejor esa coloración?",
      ["Pared gruesa de peptidoglicano con ácidos teicoicos y sin membrana externa.","Membrana externa rica en lipopolisacárido con capa fina de peptidoglicano.","Ausencia completa de pared celular y resistencia natural a beta-lactámicos.","Núcleo verdadero delimitado por membrana nuclear."],
      0,
      "Correcta. Las bacterias Gram positivas retienen el cristal violeta porque tienen una pared gruesa de peptidoglicano; además pueden presentar ácidos teicoicos. No poseen membrana externa.",
      [null,"Falsa. Esa descripción corresponde a bacterias Gram negativas: membrana externa con LPS y peptidoglicano delgado.","Falsa. La ausencia de pared celular orienta a Mycoplasma, no a bacterias Gram positivas típicas.","Falsa. Un núcleo verdadero con envoltura nuclear es rasgo eucariota; las bacterias son procariotas."],
      ["Gram positivo: peptidoglicano grueso.","Sin membrana externa.","Ácidos teicoicos: dato típico."]
    ),
    q(2,"Pared bacteriana Gram negativa","Base",
      "En una muestra con bacilos Gram negativos, ¿qué estructura diferencia mejor a estas bacterias de las Gram positivas?",
      ["Pared gruesa de peptidoglicano sin espacio periplásmico.","Membrana externa con LPS, porinas y peptidoglicano delgado.","Membrana nuclear y organelos intracitoplasmáticos.","Pared de quitina con ergosterol en la membrana."],
      1,
      "Correcta. Las Gram negativas tienen membrana externa con lipopolisacárido, porinas y una capa fina de peptidoglicano ubicada en el periplasma.",
      ["Falsa. La pared gruesa de peptidoglicano es característica de Gram positivas.",null,"Falsa. Membrana nuclear y organelos corresponden a células eucariotas, no a bacterias.","Falsa. Quitina y ergosterol orientan a hongos, no a bacterias Gram negativas."],
      ["Gram negativo: membrana externa.","LPS: endotoxina.","Porinas: paso de moléculas pequeñas."]
    ),
    q(3,"Lipopolisacárido y endotoxina","Base",
      "Un paciente con sepsis por bacilos Gram negativos desarrolla fiebre, vasodilatación e hipotensión. ¿Qué componente bacteriano se relaciona directamente con este cuadro?",
      ["Cápsula polisacárida que actúa como lípido A.","Ácido teicoico de la pared Gram positiva.","Porción lípido A del lipopolisacárido de la membrana externa.","Ribosoma bacteriano 80S liberado durante la lisis."],
      2,
      "Correcta. El lípido A del LPS es la endotoxina de las bacterias Gram negativas y activa una respuesta inflamatoria intensa, con riesgo de shock séptico.",
      ["Falsa. La cápsula puede ser antifagocítica, pero no es el lípido A ni la endotoxina.","Falsa. El ácido teicoico pertenece a Gram positivas y no corresponde al LPS endotóxico.",null,"Falsa. Las bacterias tienen ribosomas 70S, no 80S; además el ribosoma no es la endotoxina."],
      ["Endotoxina = lípido A.","LPS está en Gram negativas.","Clínica: fiebre, hipotensión, shock."]
    ),
    q(4,"Cápsula y evasión inmune","Base",
      "Una bacteria encapsulada produce infección invasiva porque evita mejor la eliminación por neutrófilos. ¿Cuál es la función principal de la cápsula?",
      ["Aumentar la fagocitosis al exponer peptidoglicano.","Sustituir los ribosomas bacterianos durante la división.","Impedir toda adhesión bacteriana a tejidos y catéteres.","Dificultar la opsonización y la fagocitosis."],
      3,
      "Correcta. La cápsula es un factor de virulencia antifagocítico: dificulta la opsonización por complemento/anticuerpos y reduce la fagocitosis.",
      ["Falsa. La cápsula no aumenta la fagocitosis; al contrario, ayuda a evadirla.","Falsa. La cápsula no participa como ribosoma ni sustituye maquinaria de síntesis proteica.","Falsa. No impide toda adhesión; algunas bacterias encapsuladas también pueden adherirse por adhesinas o formar biopelículas.",null],
      ["Cápsula = antifagocítica.","Aumenta virulencia.","Importa en bacterias invasivas."]
    ),
    q(5,"Pili y fimbrias","Base",
      "Una cepa de Escherichia coli se adhiere al urotelio antes de producir infección urinaria. ¿Qué estructura participa de forma más directa en esa adhesión inicial?",
      ["Pili o fimbrias de adhesión.","Beta-lactamasa periplásmica.","Cápside viral icosaédrica.","Endospora metabólicamente inactiva."],
      0,
      "Correcta. Los pili o fimbrias son estructuras de superficie que facilitan la adhesión bacteriana a células, mucosas o dispositivos.",
      [null,"Falsa. La beta-lactamasa participa en resistencia a antibióticos beta-lactámicos, no en adhesión al urotelio.","Falsa. La cápside es una estructura viral, no bacteriana.","Falsa. La endospora permite resistencia ambiental, no adhesión activa al tejido."],
      ["Pili/fimbrias = adhesión.","Adhesión precede colonización.","Importante en mucosas y dispositivos."]
    ),
    q(6,"Biopelícula","Base",
      "Un catéter venoso colonizado mantiene bacterias protegidas dentro de una matriz extracelular. ¿Qué concepto describe mejor este fenómeno?",
      ["Crecimiento libre de bacterias aisladas en plasma.","Biopelícula adherida con matriz protectora.","Cápside viral formada por proteínas estructurales.","Mitosis de células del huésped inducida por bacterias."],
      1,
      "Correcta. La biopelícula es una comunidad microbiana adherida a una superficie y rodeada por una matriz que dificulta la acción inmune y antimicrobiana.",
      ["Falsa. El crecimiento libre no explica la protección por matriz ni la adherencia al catéter.",null,"Falsa. La cápside es viral; la biopelícula es una forma de organización bacteriana o microbiana.","Falsa. La mitosis del huésped no define una comunidad bacteriana protegida."],
      ["Biopelícula = adherencia + matriz.","Dificulta antibióticos.","Frecuente en catéteres y prótesis."]
    ),
    q(7,"Endospora bacteriana","Base",
      "Después de desinfección incompleta, una bacteria sobrevive durante meses en el ambiente y vuelve a germinar. ¿Qué estructura explica mejor esa resistencia?",
      ["Endospora resistente al calor, desecación y agentes químicos.","Membrana externa con porinas para entrada de nutrientes.","Flagelo usado para quimiotaxis durante infección.","Cápsula que aumenta la sensibilidad a fagocitosis."],
      0,
      "Correcta. La endospora es una forma de resistencia metabólicamente inactiva que permite sobrevivir a calor, desecación y químicos; puede germinar cuando mejoran las condiciones.",
      [null,"Falsa. La membrana externa es típica de Gram negativas, pero no explica supervivencia extrema prolongada.","Falsa. El flagelo permite motilidad, no resistencia ambiental extrema.","Falsa. La cápsula no aumenta la sensibilidad a fagocitosis; además no confiere la resistencia extrema de una endospora."],
      ["Endospora = supervivencia ambiental.","No es reproducción.","Germinación cuando el ambiente mejora."]
    ),
    q(8,"Flagelos y motilidad","Base",
      "En un medio semisólido, una bacteria se dispersa desde la línea de siembra por movimiento activo. ¿Qué estructura explica mejor ese hallazgo?",
      ["Ácidos teicoicos de la pared Gram positiva.","Fimbrias exclusivamente sexuales.","Flagelos bacterianos.","Peptidoglicano periplásmico."],
      2,
      "Correcta. Los flagelos permiten motilidad bacteriana y quimiotaxis, lo que explica la dispersión en medios semisólidos.",
      ["Falsa. Los ácidos teicoicos son componentes de pared Gram positiva; no producen motilidad.","Falsa. Las fimbrias/pili participan sobre todo en adhesión o conjugación; no explican la motilidad principal en el medio.",null,"Falsa. El peptidoglicano da soporte estructural, no movimiento activo."],
      ["Flagelo = motilidad.","Quimiotaxis = movimiento dirigido.","No confundir con pili de adhesión."]
    ),
    q(9,"Peptidoglicano y beta-lactámicos","Moyen",
      "Un antibiótico inhibe la síntesis de la pared bacteriana al bloquear el entrecruzamiento del peptidoglicano. ¿Qué proceso se afecta principalmente?",
      ["Síntesis de ergosterol de la membrana fúngica.","Transpeptidación de cadenas de peptidoglicano.","Replicación del genoma viral en el núcleo.","Formación de cápside bacteriana."],
      1,
      "Correcta. Los beta-lactámicos inhiben proteínas fijadoras de penicilina y bloquean la transpeptidación, debilitando el peptidoglicano.",
      ["Falsa. El ergosterol es blanco de antifúngicos, no del mecanismo principal de beta-lactámicos.",null,"Falsa. La replicación viral nuclear no es síntesis de pared bacteriana.","Falsa. Las bacterias no forman cápside; la cápside es viral."],
      ["Peptidoglicano = blanco de beta-lactámicos.","Transpeptidación = entrecruzamiento.","Pared débil → lisis."]
    ),
    q(10,"Micobacterias y ácido-alcohol resistencia","Moyen",
      "Una bacteria no se tiñe bien con Gram y requiere tinción ácido-alcohol resistente por su pared rica en lípidos. ¿Qué componente explica mejor esta propiedad?",
      ["Ácidos micólicos de la pared micobacteriana.","Lipopolisacárido de membrana externa clásica.","Ácidos teicoicos de cocos Gram positivos.","Quitina de pared celular fúngica."],
      0,
      "Correcta. Las micobacterias tienen una pared rica en ácidos micólicos, lo que dificulta la tinción de Gram y explica la ácido-alcohol resistencia.",
      [null,"Falsa. El LPS caracteriza muchas Gram negativas, pero no explica la ácido-alcohol resistencia micobacteriana.","Falsa. Los ácidos teicoicos son de Gram positivas, no de micobacterias ácido-alcohol resistentes.","Falsa. La quitina corresponde a hongos, no a micobacterias."],
      ["Micobacterias: ácidos micólicos.","Tinción Ziehl-Neelsen/BAAR.","Gram no es la técnica ideal."]
    )
  ];

  qcms.forEach(function(item){ upsert(bank.qcm, item); });

  if(Array.isArray(bank.vf)){
    [
      vf(1,"Las bacterias Gram positivas tienen una pared gruesa de peptidoglicano y no poseen membrana externa.",0,"Verdadero. Ese patrón explica la retención del cristal violeta y diferencia a Gram positivas de Gram negativas."),
      vf(2,"El lípido A del LPS es una exotoxina proteica secretada por bacterias Gram positivas.",1,"Falso. El lípido A es la endotoxina del LPS de bacterias Gram negativas; no es una proteína secretada."),
      vf(3,"La cápsula bacteriana puede disminuir la fagocitosis al dificultar la opsonización.",0,"Verdadero. La cápsula es un factor de virulencia antifagocítico y favorece evasión inmune."),
      vf(4,"La biopelícula facilita la eliminación bacteriana porque expone a las bacterias al sistema inmune y a los antibióticos.",1,"Falso. La biopelícula protege a la comunidad microbiana mediante una matriz y dificulta la respuesta inmune y antimicrobiana."),
      vf(5,"La endospora es una forma de resistencia y supervivencia; no debe interpretarse como reproducción bacteriana.",0,"Verdadero. La endospora permite resistir condiciones adversas y luego germinar, pero no aumenta directamente el número de bacterias.")
    ].forEach(function(item){ upsert(bank.vf, item); });
  }

  if(Array.isArray(bank.cases)){
    [
      caso(1,"Un hombre de 68 años internado en UCI presenta fiebre e hipotensión. El hemocultivo informa bacilos Gram negativos y el equipo sospecha respuesta inflamatoria sistémica por endotoxina.","¿Qué componente bacteriano explica mejor el mecanismo fisiopatológico inicial?",["Ácido teicoico de pared Gram positiva.","Lípido A del LPS de membrana externa.","Cápside viral proteica.","Quitina de pared fúngica."],1,"Correcta. En bacilos Gram negativos, el lípido A del LPS actúa como endotoxina y puede inducir liberación intensa de mediadores inflamatorios, fiebre, vasodilatación e hipotensión.",["Falsa. El ácido teicoico pertenece a Gram positivas y no es el LPS endotóxico.",null,"Falsa. La cápside es una estructura viral, no bacteriana.","Falsa. La quitina corresponde a hongos."]),
      caso(2,"Una mujer con infección urinaria recurrente presenta cultivo positivo para E. coli. El docente explica que el primer paso fue la fijación bacteriana al epitelio urogenital.","¿Qué estructura bacteriana participa más directamente en esa fijación inicial?",["Pili o fimbrias de adhesión.","Endospora de resistencia ambiental.","Ribosoma 70S citoplasmático.","Ácidos micólicos de la pared."],0,"Correcta. Los pili/fimbrias permiten adherencia a mucosas y son claves en la colonización inicial, especialmente en infecciones urinarias por E. coli.",[null,"Falsa. La endospora permite supervivencia ambiental, no adhesión al urotelio.","Falsa. El ribosoma permite síntesis proteica, pero no es el principal factor de adhesión.","Falsa. Los ácidos micólicos orientan a micobacterias, no a adhesión de E. coli."]),
      caso(3,"Un paciente con prótesis articular desarrolla infección persistente. A pesar del antibiótico, las bacterias permanecen adheridas a la superficie del material protésico dentro de una matriz.","¿Qué mecanismo explica mejor la persistencia?",["Biopelícula con matriz extracelular protectora.","Lisis inmediata por ausencia de pared celular.","Formación de núcleo bacteriano verdadero.","Conversión de bacterias en levaduras."],0,"Correcta. La biopelícula permite adherencia a superficies y protección frente a antibióticos y defensas del huésped, favoreciendo infecciones persistentes asociadas a dispositivos.",[null,"Falsa. La ausencia de pared no explica la matriz protectora adherida a prótesis.","Falsa. Las bacterias no tienen núcleo verdadero.","Falsa. Las bacterias no se convierten en levaduras."])
    ].forEach(function(item){ upsert(bank.cases, item); });
  }

  ROOT.version = (ROOT.version || "") + " | v311: Microbiología M1 quality patch loaded.";
  ROOT.__MICROBIOLOGIA_M1_QUALITY_PATCH__ = "v311";
})();
