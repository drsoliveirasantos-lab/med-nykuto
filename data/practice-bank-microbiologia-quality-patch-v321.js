/* v321 — Microbiología Module 1 quality patch, VF 026-050
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
  function base(topic,difficulty){return {courseId:COURSE,moduleId:MODULE_ID,moduleNumber:1,moduleTitle:MODULE_TITLE,heading:topic,difficulty:difficulty||"Base",tags:{subject:COURSE,subjectLabel:"Microbiología",moduleNumber:1,moduleId:MODULE_ID,moduleTitle:MODULE_TITLE,format:"vf",topic:topic,topicSlug:slug(topic),concepts:["estructura_bacteriana","patogenicidad_virulencia","integracion_clinica"],skill:"conceptual_precision",cognitiveLevel:"reasoning",difficulty:difficulty==="Examen"?"hard":(difficulty==="Moyen"?"medium":"basic"),adaptiveVersion:"v321",visible:false}};}
  function vf(n,topic,difficulty,statement,answerIndex,explanation,correction){return Object.assign(base(topic,difficulty),{id:MODULE_ID+"-vf-"+pad(n)+"-v321",question:statement,options:["Verdadero","Falso"],answerIndex:answerIndex,explanation:explanation,correctionIfFalse:correction||"",keyPoints:[answerIndex===0?"Afirmación verdadera con precisión conceptual.":"Afirmación falsa corregida explícitamente."],vfPedagogicalStandard:"med_nykuto_v321_specific_corrections",tagList:["subject:microbiologia","module:1","format:vf","standard:med_nykuto_v321","topic:"+slug(topic)]});}
  function replaceModuleIndex(arr,index,item){var hits=arr.map(function(x,i){return {x:x,i:i};}).filter(function(o){return o.x&&o.x.moduleId===MODULE_ID;}); if(hits[index]) arr[hits[index].i]=Object.assign({},hits[index].x,item);}

  [
    vf(26,"Tinción de Gram","Base","La decoloración con alcohol o acetona-alcohol es un paso crítico para diferenciar Gram positivas y Gram negativas.",0,"Verdadero. Las Gram positivas retienen el complejo cristal violeta-yodo; las Gram negativas se decoloran y luego toman la contratiñción.",""),
    vf(27,"Peptidoglicano","Moyen","El peptidoglicano contiene N-acetilglucosamina y N-acetilmurámico como parte de su esqueleto.",0,"Verdadero. NAG y NAM forman cadenas que se entrecruzan mediante puentes peptídicos para dar rigidez a la pared.",""),
    vf(28,"Transpeptidación","Moyen","La transpeptidación debilita la pared bacteriana porque rompe enlaces del peptidoglicano ya formado.",1,"Falso. La transpeptidación forma enlaces cruzados entre cadenas de peptidoglicano; inhibirla debilita la pared.","La transpeptidación entrecruza el peptidoglicano; los beta-lactámicos la inhiben."),
    vf(29,"Ácidos teicoicos","Base","Los ácidos teicoicos y lipoteicoicos son características asociadas a bacterias Gram positivas.",0,"Verdadero. Se encuentran en la pared de Gram positivas y ayudan a diferenciarla de la membrana externa con LPS de Gram negativas.",""),
    vf(30,"Antígenos bacterianos","Moyen","El antígeno H se relaciona con el flagelo, el antígeno K con la cápsula y el antígeno O con el LPS.",0,"Verdadero. Esta asociación es útil para serotipificación y para relacionar estructura con función.",""),
    vf(31,"Quimiotaxis","Base","La quimiotaxis es el movimiento dirigido de bacterias móviles frente a gradientes químicos.",0,"Verdadero. Puede acercar bacterias a nutrientes o alejarlas de sustancias nocivas, generalmente mediante cambios en la actividad flagelar.",""),
    vf(32,"Autoclave","Base","El autoclave utiliza vapor a presión y puede esterilizar material, incluidas endosporas si se aplican condiciones adecuadas.",0,"Verdadero. La esterilización por calor húmedo a presión es un método estándar para eliminar formas resistentes.",""),
    vf(33,"Esterilización","Base","La esterilización reduce parcialmente los microorganismos, pero no busca eliminar endosporas.",1,"Falso. La esterilización busca eliminar todas las formas de vida microbiana, incluidas endosporas.","La esterilización elimina microorganismos viables y endosporas; es más exigente que desinfección."),
    vf(34,"Bacteriostático","Moyen","Un efecto bacteriostático inhibe la multiplicación bacteriana sin matar necesariamente de forma directa.",0,"Verdadero. La eliminación final puede depender de las defensas del huésped.",""),
    vf(35,"Bactericida","Moyen","Un antibiótico bactericida se define por aumentar la multiplicación bacteriana de forma controlada.",1,"Falso. Un bactericida reduce bacterias viables; aumentar multiplicación no es efecto terapéutico.","Bactericida significa que mata bacterias o reduce de forma marcada su viabilidad."),
    vf(36,"CIM","Moyen","La concentración inhibitoria mínima es la menor concentración de antimicrobiano que inhibe crecimiento visible in vitro.",0,"Verdadero. Es un dato de laboratorio que ayuda a interpretar sensibilidad antimicrobiana junto con el contexto clínico.",""),
    vf(37,"Toxicidad selectiva","Base","La toxicidad selectiva se basa en atacar blancos bacterianos ausentes o diferentes en células humanas.",0,"Verdadero. Peptidoglicano y ribosoma 70S son ejemplos de diferencias aprovechables terapéuticamente.",""),
    vf(38,"PAMP","Moyen","LPS, peptidoglicano y flagelina pueden funcionar como patrones moleculares reconocidos por la inmunidad innata.",0,"Verdadero. Son PAMP reconocidos por receptores del huésped que activan respuestas inflamatorias.",""),
    vf(39,"TLR4","Examen","TLR4 se asocia clásicamente al reconocimiento de LPS de bacterias Gram negativas.",0,"Verdadero. La activación de TLR4 contribuye a producción de mediadores inflamatorios frente a LPS.",""),
    vf(40,"Opsonización","Moyen","La opsonización dificulta la fagocitosis porque oculta la bacteria a neutrófilos y macrófagos.",1,"Falso. La opsonización marca al microorganismo con anticuerpos o complemento para facilitar fagocitosis.","La opsonización facilita la fagocitosis; la cápsula puede dificultarla."),
    vf(41,"Complemento","Moyen","La vía alternativa del complemento puede activarse sobre superficies bacterianas sin requerir anticuerpo previo.",0,"Verdadero. Es un mecanismo de inmunidad innata que favorece opsonización y, en algunos casos, lisis.",""),
    vf(42,"Conversión lisogénica","Examen","La conversión lisogénica puede conferir a una bacteria genes de toxinas aportados por un bacteriófago.",0,"Verdadero. La integración de un fago puede modificar la virulencia bacteriana.",""),
    vf(43,"Islas de patogenicidad","Examen","Las islas de patogenicidad son regiones genómicas que pueden contener genes de virulencia adquiridos por transferencia horizontal.",0,"Verdadero. Su presencia puede diferenciar cepas más virulentas dentro de una misma especie.",""),
    vf(44,"Plásmidos R","Moyen","Los plásmidos R pueden portar genes de resistencia antimicrobiana y transferirse entre bacterias.",0,"Verdadero. Son importantes en la diseminación de resistencia bacteriana.",""),
    vf(45,"Microbiota","Moyen","La microbiota normal puede ofrecer resistencia a la colonización al competir por nutrientes y nichos.",0,"Verdadero. La pérdida de microbiota por antibióticos puede favorecer disbiosis y sobrecrecimiento de patógenos oportunistas.",""),
    vf(46,"Fómites","Base","Los fómites son objetos o superficies contaminadas capaces de participar en transmisión indirecta.",0,"Verdadero. La higiene de manos y la limpieza ambiental reducen este tipo de transmisión.",""),
    vf(47,"Aerosoles","Moyen","Los aerosoles son partículas grandes que caen de inmediato y solo transmiten por contacto directo piel-piel.",1,"Falso. Los aerosoles son partículas pequeñas que pueden permanecer suspendidas y permitir transmisión aérea de ciertos patógenos.","Aerosoles = partículas pequeñas suspendidas; gotas = partículas respiratorias más grandes a corta distancia."),
    vf(48,"Asepsia","Base","La asepsia busca evitar introducir microorganismos en sitios o materiales estériles durante procedimientos.",0,"Verdadero. Es un principio central en procedimientos invasivos y control de infecciones.",""),
    vf(49,"Control de foco","Examen","En infecciones asociadas a biopelícula sobre dispositivos, el antibiótico activo in vitro siempre evita la necesidad de retirar o drenar el foco.",1,"Falso. La biopelícula puede requerir control de foco, retiro o recambio del dispositivo cuando esté indicado.","El tratamiento de infecciones con biopelícula puede requerir antibiótico y control de foco."),
    vf(50,"Patogenicidad bacteriana","Examen","La patogenicidad bacteriana es multifactorial y depende de factores microbianos, defensas del huésped y vía de transmisión.",0,"Verdadero. Adhesión, invasión, toxinas, evasión inmune, estado del huésped y contexto epidemiológico interactúan para producir enfermedad.","")
  ].forEach(function(item,idx){ replaceModuleIndex(bank.vf, idx+25, item); });

  ROOT.version = (ROOT.version || "") + " | v321: Microbiología M1 VF 026-050 corrected.";
  ROOT.__MICROBIOLOGIA_M1_VF_026_050_PATCH__ = "v321";
})();
