/* v320 — Microbiología Module 1 quality patch, VF 006-025
   Safe replacement patch: replaces module-indexed VF items, no count inflation.
*/
(function(){
  "use strict";
  var ROOT = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {};
  ROOT.byCourse = ROOT.byCourse || {};
  var bank = ROOT.byCourse["microbiologia"];
  if(!bank || !Array.isArray(bank.vf)) return;

  var COURSE="microbiologia";
  var MODULE_ID="02-microbiologia-01-estructura-bacteriana-y-patogenicidad";
  var MODULE_TITLE="Estructura bacteriana y patogenicidad";
  function pad(n){return String(n).padStart(3,"0");}
  function slug(x){return String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
  function base(topic,difficulty){return {courseId:COURSE,moduleId:MODULE_ID,moduleNumber:1,moduleTitle:MODULE_TITLE,heading:topic,difficulty:difficulty||"Base",tags:{subject:COURSE,subjectLabel:"Microbiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"vf",topic:topic,topicSlug:slug(topic),concepts:["estructura_bacteriana","patogenicidad_virulencia"],skill:"conceptual_precision",cognitiveLevel:"reasoning",difficulty:difficulty==="Examen"?"hard":(difficulty==="Moyen"?"medium":"basic"),adaptiveVersion:"v320",visible:false}};}
  function vf(n,topic,difficulty,statement,answerIndex,explanation,correction){return Object.assign(base(topic,difficulty),{id:MODULE_ID+"-vf-"+pad(n)+"-v320",question:statement,options:["Verdadero","Falso"],answerIndex:answerIndex,explanation:explanation,correctionIfFalse:correction||"",keyPoints:[answerIndex===0?"Afirmación verdadera con precisión conceptual.":"Afirmación falsa corregida explícitamente."],vfPedagogicalStandard:"med_nykuto_v320_specific_corrections",tagList:["subject:microbiologia","module:1","format:vf","standard:med_nykuto_v320","topic:"+slug(topic)]});}
  function replaceModuleIndex(arr,index,item){var hits=arr.map(function(x,i){return {x:x,i:i};}).filter(function(o){return o.x&&o.x.moduleId===MODULE_ID;}); if(hits[index]) arr[hits[index].i]=Object.assign({},hits[index].x,item);}

  [
    vf(6,"Gram y pared bacteriana","Base","Las bacterias Gram negativas poseen una membrana externa con lipopolisacárido y una capa fina de peptidoglicano.",0,"Verdadero. La membrana externa con LPS es una característica clave de Gram negativas y el peptidoglicano es más delgado que en Gram positivas.",""),
    vf(7,"Gram y pared bacteriana","Base","Las bacterias Gram positivas tienen una membrana externa rica en LPS.",1,"Falso. Las Gram positivas no poseen membrana externa con LPS; presentan peptidoglicano grueso y pueden tener ácidos teicoicos.","Las bacterias Gram positivas tienen peptidoglicano grueso y no membrana externa con LPS."),
    vf(8,"Endotoxina","Base","El lípido A del lipopolisacárido es el principal responsable de la actividad endotóxica de muchas bacterias Gram negativas.",0,"Verdadero. El lípido A activa la respuesta inflamatoria innata y puede contribuir a fiebre, hipotensión y shock séptico.",""),
    vf(9,"Exotoxinas","Moyen","Las exotoxinas bacterianas son siempre componentes estructurales fijos de la membrana externa Gram negativa.",1,"Falso. Muchas exotoxinas son proteínas secretadas o liberadas por bacterias y tienen blancos celulares específicos; no son el LPS de la membrana externa.","Las exotoxinas suelen ser proteínas con acción específica; la endotoxina clásica es el lípido A del LPS."),
    vf(10,"Toxoides","Moyen","Un toxoide es una exotoxina inactivada que conserva capacidad antigénica para inducir respuesta inmune.",0,"Verdadero. La inactivación reduce toxicidad, pero mantiene antigenicidad útil para vacunación.",""),
    vf(11,"Cápsula","Base","La cápsula bacteriana puede actuar como factor antifagocítico al dificultar la opsonización.",0,"Verdadero. Al impedir o reducir el depósito eficaz de anticuerpos y complemento, la cápsula favorece evasión de fagocitosis.",""),
    vf(12,"Pili y flagelos","Base","Los flagelos se asocian principalmente a adhesión al urotelio, mientras que las fimbrias se encargan de la motilidad bacteriana.",1,"Falso. Está invertido: los flagelos permiten motilidad y quimiotaxis; las fimbrias o pili comunes facilitan adhesión.","Los flagelos permiten motilidad; las fimbrias/pili favorecen adhesión."),
    vf(13,"Biopelícula","Moyen","La biopelícula puede hacer que una infección asociada a catéter persista aunque el antibiótico sea activo in vitro.",0,"Verdadero. La matriz, la baja penetración y bacterias de crecimiento lento reducen la eficacia antimicrobiana en el sitio.",""),
    vf(14,"Endospora","Base","La endospora es una forma de reproducción bacteriana que aumenta inmediatamente el número de bacterias.",1,"Falso. La endospora es una forma de resistencia y supervivencia; no es un mecanismo de reproducción.","La endospora permite sobrevivir a condiciones adversas y germinar después, pero no multiplica la bacteria."),
    vf(15,"Mycoplasma","Moyen","Mycoplasma carece de pared de peptidoglicano, por lo que los beta-lactámicos no son útiles por su mecanismo clásico.",0,"Verdadero. Los beta-lactámicos actúan sobre síntesis de pared; si no hay peptidoglicano, falta el blanco principal.",""),
    vf(16,"Micobacterias","Moyen","Las micobacterias se reconocen mejor con técnicas ácido-alcohol resistentes debido a su pared rica en ácidos micólicos.",0,"Verdadero. Los ácidos micólicos dificultan la tinción de Gram convencional y justifican Ziehl-Neelsen u otras técnicas BAAR.",""),
    vf(17,"Colonización","Base","Colonización e infección son sinónimos: toda bacteria presente en una mucosa causa enfermedad.",1,"Falso. La colonización puede ser asintomática; infección implica daño, invasión, toxinas o respuesta clínica del huésped.","Colonización significa presencia/multiplicación sin enfermedad obligatoria; infección implica manifestación patológica."),
    vf(18,"Sitios estériles","Moyen","El aislamiento de bacterias en sangre o líquido cefalorraquídeo suele tener mayor relevancia clínica que un hisopo superficial de piel.",0,"Verdadero. Sangre y LCR son sitios normalmente estériles, mientras la piel tiene microbiota y puede contaminar muestras.",""),
    vf(19,"Contaminación de muestra","Moyen","Un cultivo positivo siempre confirma infección y siempre requiere antibiótico.",1,"Falso. Un cultivo positivo puede representar infección, colonización o contaminación; debe interpretarse con clínica, sitio anatómico y calidad de muestra.","Un cultivo positivo no equivale automáticamente a infección ni a indicación antibiótica."),
    vf(20,"Sepsis","Moyen","La sepsis implica una respuesta desregulada del huésped frente a infección con riesgo de disfunción orgánica.",0,"Verdadero. No es solo presencia de bacterias en sangre; incluye gravedad clínica y respuesta sistémica perjudicial.",""),
    vf(21,"Shock séptico","Examen","El shock séptico puede presentarse con hipotensión persistente que requiere vasopresores pese a reanimación adecuada.",0,"Verdadero. Es una forma grave de sepsis con alteraciones circulatorias y metabólicas asociadas a alta mortalidad.",""),
    vf(22,"Transferencia genética","Moyen","La conjugación bacteriana requiere contacto directo y puede transferir plásmidos entre bacterias.",0,"Verdadero. Suele involucrar pilus sexual y es importante en transferencia de genes de resistencia o virulencia.",""),
    vf(23,"Transformación","Moyen","La transformación bacteriana consiste en transferencia de ADN mediante bacteriófagos.",1,"Falso. La transformación es captación de ADN desnudo del ambiente; la transferencia por bacteriófagos se llama transducción.","Transformación = ADN libre; transducción = bacteriófago; conjugación = contacto directo."),
    vf(24,"Resistencia antibiótica","Moyen","Las bombas de eflujo pueden reducir la concentración intracelular de antibióticos y contribuir a resistencia.",0,"Verdadero. El eflujo activo expulsa fármacos y puede afectar múltiples antibióticos.",""),
    vf(25,"Antisepsia y desinfección","Base","La antisepsia se aplica sobre tejido vivo, mientras que la desinfección se aplica sobre objetos o superficies inanimadas.",0,"Verdadero. Esta distinción es básica para control de infección y procedimientos clínicos.","")
  ].forEach(function(item,idx){ replaceModuleIndex(bank.vf, idx+5, item); });

  ROOT.version = (ROOT.version || "") + " | v320: Microbiología M1 VF 006-025 corrected.";
  ROOT.__MICROBIOLOGIA_M1_VF_006_025_PATCH__ = "v320";
})();
