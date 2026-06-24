/* v313 — Microbiología Module 1 quality patch, QCM 011-020
   Safe replacement patch: only replaces existing QCM ids, no count inflation.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["microbiologia"];
  if(!bank || !Array.isArray(bank.qcm)) return;

  var COURSE = "microbiologia";
  var MODULE_ID = "02-microbiologia-01-estructura-bacteriana-y-patogenicidad";
  var MODULE_TITLE = "Estructura bacteriana y patogenicidad";
  function pad(n){ return String(n).padStart(3,"0"); }
  function idQ(n){ return MODULE_ID + "-qcm-" + pad(n) + "-v167"; }
  function slug(x){ return String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""); }
  function base(topic,difficulty){
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
        format:"qcm",
        topic:topic,
        topicSlug:slug(topic),
        concepts:["estructura_bacteriana","patogenicidad_virulencia"],
        skill:"mechanism",
        cognitiveLevel:"reasoning",
        difficulty:difficulty === "Examen" ? "hard" : (difficulty === "Moyen" ? "medium" : "basic"),
        adaptiveVersion:"v313",
        visible:false
      }
    };
  }
  function q(n,topic,difficulty,question,options,answerIndex,explanation,whyWrong,keyPoints){
    return Object.assign(base(topic,difficulty),{
      id:idQ(n),
      question:question,
      options:options,
      answerIndex:answerIndex,
      explanation:explanation,
      whyWrong:whyWrong,
      distractorExplanations:whyWrong,
      keyPoints:keyPoints || [],
      qcmPedagogicalStandard:"med_nykuto_v313_specific_corrections",
      qcmNarrativeVersion:"v313",
      tagList:["subject:microbiologia","module:1","format:qcm","standard:med_nykuto_v313","topic:"+slug(topic)]
    });
  }
  function replaceById(item){
    var i = bank.qcm.findIndex(function(x){ return x && x.id === item.id; });
    if(i >= 0) bank.qcm[i] = Object.assign({}, bank.qcm[i], item);
  }
  [
    q(11,"Exotoxinas bacterianas","Moyen","Una bacteria produce una toxina proteica secretada que actúa a baja concentración sobre células del huésped. ¿Qué característica corresponde mejor a una exotoxina?",["Es una proteína secretada o liberada por bacterias, con acción específica sobre células diana.","Es siempre el lípido A del LPS de bacterias Gram negativas.","Es una estructura de pared formada por peptidoglicano y ácidos teicoicos.","Es una porina de membrana externa encargada del paso de nutrientes."],0,"Correcta. Las exotoxinas suelen ser proteínas con alta especificidad biológica; pueden ser secretadas o liberadas durante el crecimiento bacteriano y dañar células diana concretas.",[null,"Falsa. El lípido A del LPS define la endotoxina, no una exotoxina proteica.","Falsa. El peptidoglicano y los ácidos teicoicos son componentes estructurales de pared, no toxinas secretadas.","Falsa. Las porinas permiten paso de moléculas pequeñas en Gram negativas; no son toxinas."],["Exotoxina = proteína.","Alta especificidad.","No confundir con endotoxina LPS."]),
    q(12,"Endotoxina frente a exotoxina","Moyen","Durante una sepsis por bacilos Gram negativos, el docente insiste en diferenciar endotoxina y exotoxina. ¿Cuál afirmación compara mejor ambos conceptos?",["La endotoxina clásica es el lípido A del LPS, mientras muchas exotoxinas son proteínas con blanco celular específico.","La endotoxina es una proteína secretada y la exotoxina es siempre parte del peptidoglicano humano.","Ambas son cápsulas polisacáridas con la misma función antifagocítica.","Ambas son ribosomas bacterianos que bloquean la tinción de Gram."],0,"Correcta. La endotoxina clásica corresponde al lípido A del LPS en Gram negativas; las exotoxinas, en cambio, suelen ser proteínas con acción específica.",[null,"Falsa. Invierte el concepto de endotoxina y agrega una idea imposible: no existe peptidoglicano humano.","Falsa. La cápsula es un factor antifagocítico, no la definición de endotoxina ni exotoxina.","Falsa. Los ribosomas no son toxinas ni explican la tinción de Gram."],["Endotoxina = LPS/lípido A.","Exotoxina = proteína específica.","Comparación típica de examen."]),
    q(13,"Toxinas A-B","Moyen","Una toxina bacteriana se une a la membrana celular mediante una subunidad y otra subunidad entra para alterar una vía intracelular. ¿Qué modelo explica mejor este mecanismo?",["Toxina A-B, con componente B de unión y componente A activo enzimáticamente.","Endospora, con componente B de germinación y componente A de resistencia térmica.","Flagelo polar, con componente B adhesivo y componente A antifagocítico.","Porina externa, con componente A de cápside y componente B de ácido micólico."],0,"Correcta. En muchas toxinas A-B, la subunidad B se une al receptor celular y facilita entrada, mientras la subunidad A ejerce la acción tóxica intracelular.",[null,"Falsa. La endospora es una forma de resistencia ambiental, no un sistema de toxina A-B.","Falsa. El flagelo permite motilidad; no corresponde al modelo A-B de toxinas.","Falsa. Mezcla porinas, cápside viral y ácidos micólicos; no define el mecanismo A-B."],["B = binding/unión.","A = active/acción tóxica.","Mecanismo frecuente en exotoxinas."]),
    q(14,"Enzimas de invasión","Moyen","Una bacteria disemina en tejidos al degradar componentes de matriz extracelular y facilitar su avance local. ¿Qué tipo de factor de virulencia describe mejor este proceso?",["Enzimas de invasión, como hialuronidasa o colagenasa.","Ribosomas 70S responsables de la traducción bacteriana.","Cápside icosaédrica encargada de proteger el genoma viral.","Ácidos micólicos que explican la tinción ácido-alcohol resistente."],0,"Correcta. Algunas bacterias producen enzimas que degradan matriz o barreras tisulares, favoreciendo invasión y diseminación local.",[null,"Falsa. El ribosoma 70S es esencial para síntesis proteica bacteriana, pero no es un factor directo de invasión tisular.","Falsa. La cápside es viral, no bacteriana.","Falsa. Los ácidos micólicos son importantes en micobacterias, pero aquí se pregunta por invasión tisular enzimática."],["Invasión tisular: enzimas degradativas.","Hialuronidasa/colagenasa: ejemplos.","No confundir estructura con virulencia activa."]),
    q(15,"Sideróforos","Moyen","En un tejido del huésped, el hierro libre es escaso porque está unido a proteínas como transferrina y lactoferrina. ¿Qué factor bacteriano ayuda a captar hierro en ese contexto?",["Sideróforos con alta afinidad por hierro.","Endotoxina lípido A del LPS.","Peptidoglicano grueso con ácidos teicoicos.","Flagelo usado exclusivamente para conjugación."],0,"Correcta. Los sideróforos captan hierro con alta afinidad y permiten a la bacteria crecer en un ambiente donde el hierro libre es limitado.",[null,"Falsa. El lípido A participa en inflamación por endotoxina, no en captación específica de hierro.","Falsa. El peptidoglicano es estructural; no es el sistema principal de adquisición de hierro.","Falsa. El flagelo participa en motilidad; la conjugación se relaciona con pili sexuales, no flagelos."],["Hierro libre bajo en huésped.","Sideróforo = captación de hierro.","Factor de virulencia nutricional."]),
    q(16,"Quorum sensing","Moyen","Una población bacteriana aumenta la producción de factores de virulencia cuando alcanza alta densidad celular. ¿Qué mecanismo regula mejor este comportamiento colectivo?",["Quorum sensing mediado por moléculas señal.","Tinción de Gram dependiente del cristal violeta.","Formación de núcleo verdadero bacteriano.","Germinación de una endospora individual como única señal."],0,"Correcta. El quorum sensing permite que bacterias coordinen expresión génica según densidad poblacional mediante señales químicas.",[null,"Falsa. La tinción de Gram es una técnica diagnóstica, no un mecanismo de regulación poblacional.","Falsa. Las bacterias no poseen núcleo verdadero.","Falsa. La germinación de una endospora no explica la coordinación de toda una población bacteriana."],["Quorum sensing = comunicación bacteriana.","Alta densidad celular.","Puede regular biopelícula y virulencia."]),
    q(17,"Plásmidos de virulencia","Moyen","Una cepa bacteriana adquiere genes que codifican toxinas y adhesinas en un elemento genético extracromosómico. ¿Qué estructura explica mejor esa adquisición?",["Plásmido con genes de virulencia.","Membrana nuclear bacteriana con cromatina lineal.","Cápside viral que forma la pared bacteriana.","Peptidoglicano humano incorporado al genoma."],0,"Correcta. Los plásmidos son elementos extracromosómicos que pueden portar genes de virulencia, resistencia o metabolismo y transferirse entre bacterias.",[null,"Falsa. Las bacterias no tienen membrana nuclear ni cromatina eucariota.","Falsa. La cápside es viral y no forma la pared bacteriana.","Falsa. No existe peptidoglicano humano ni se incorpora como genoma bacteriano."],["Plásmidos: ADN extracromosómico.","Pueden portar virulencia.","También resistencia antimicrobiana."]),
    q(18,"Conjugación bacteriana","Moyen","Dos bacterias entran en contacto directo y una transfiere material genético plasmídico a la otra. ¿Qué mecanismo de transferencia horizontal describe mejor este evento?",["Conjugación mediada por contacto celular, frecuentemente asociada a pilus sexual.","Transducción por incorporación de ADN desnudo desde el ambiente.","Transformación por bacteriófago que transporta ADN bacteriano.","Esporulación como mecanismo de intercambio genético entre bacterias."],0,"Correcta. La conjugación requiere contacto entre bacterias y suele involucrar pilus sexual para transferir plásmidos u otros elementos genéticos.",[null,"Falsa. La incorporación de ADN desnudo desde el ambiente corresponde a transformación, no conjugación.","Falsa. La transferencia mediada por bacteriófagos corresponde a transducción, no transformación.","Falsa. La esporulación es supervivencia ambiental, no intercambio genético."],["Conjugación = contacto directo.","Pilus sexual.","Plásmidos frecuentes."]),
    q(19,"Transformación y transducción","Moyen","Una bacteria incorpora ADN libre presente en el ambiente después de la lisis de otras bacterias. ¿Qué mecanismo explica mejor este fenómeno?",["Transformación bacteriana.","Conjugación por pilus sexual.","Transducción mediada por bacteriófago.","Quimiotaxis por flagelos."],0,"Correcta. La transformación es la captación de ADN desnudo del ambiente por una bacteria competente.",[null,"Falsa. La conjugación requiere contacto directo entre bacterias y transferencia desde una célula donadora.","Falsa. La transducción requiere un bacteriófago como vector de ADN.","Falsa. La quimiotaxis es movimiento dirigido por estímulos, no adquisición de ADN."],["Transformación = ADN desnudo.","Transducción = fago.","Conjugación = contacto." ]),
    q(20,"Esterilización y esporas","Moyen","Un material contaminado con bacterias esporuladas requiere un método que destruya formas vegetativas y esporas. ¿Qué concepto microbiológico justifica usar esterilización y no solo desinfección básica?",["Las endosporas resisten condiciones ambientales y algunos desinfectantes, por lo que requieren métodos más intensos.","Las bacterias Gram positivas no tienen peptidoglicano y por eso son indestructibles.","Las cápsulas bacterianas son núcleos verdaderos resistentes al calor.","Las porinas convierten a todas las bacterias en virus encapsulados."],0,"Correcta. Las endosporas son altamente resistentes; por eso la eliminación de esporas exige esterilización adecuada, no solo limpieza o desinfección superficial.",[null,"Falsa. Las Gram positivas sí tienen peptidoglicano grueso; no son indestructibles.","Falsa. La cápsula no es un núcleo verdadero ni explica resistencia extrema al calor.","Falsa. Las porinas no convierten bacterias en virus ni explican resistencia esporulada."],["Esporas: alta resistencia.","Esterilización elimina esporas.","Desinfección básica puede ser insuficiente."])
  ].forEach(replaceById);
  ROOT.version = (ROOT.version || "") + " | v313: Microbiología M1 QCM 011-020 corrected.";
  ROOT.__MICROBIOLOGIA_M1_QCM_011_020_PATCH__ = "v313";
})();
