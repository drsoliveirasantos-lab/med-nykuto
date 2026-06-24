/* v314 — Fisiología quality patch, Módulo 1.
   Scope: safe in-place corrections after data/practice-bank-fisiologia.js.
   Does not change item counts. It corrects visible repetitive QCM items and normalizes difficulty labels.
*/
(function(){
  "use strict";

  var root = window.MED_PRACTICE_BANK = window.MED_PRACTICE_BANK || {byCourse:{}};
  root.byCourse = root.byCourse || {};
  var bank = root.byCourse.fisiologia;
  if(!bank) return;

  var MODULE_1 = "01-fisiologia-01-neurofisiologia-y-potencial-de-accion";

  function arr(name){ return Array.isArray(bank[name]) ? bank[name] : []; }
  function byId(id){
    var lists = [arr("qcm"), arr("vf"), arr("case"), arr("cases")];
    for(var i=0;i<lists.length;i++){
      for(var j=0;j<lists[i].length;j++){
        if(lists[i][j] && lists[i][j].id === id) return lists[i][j];
      }
    }
    return null;
  }
  function merge(id, patch){
    var item = byId(id);
    if(!item) return false;
    Object.keys(patch).forEach(function(k){ item[k] = patch[k]; });
    item.qualityPatch = "fisiologia-v314";
    item.auditDecision = patch.auditDecision || "B";
    return true;
  }
  function normalizeDifficulty(x){
    if(x == null) return x;
    var s = String(x).trim();
    var map = {
      "Moyen":"Medio", "moyen":"Medio", "Medium":"Medio", "medium":"Medio",
      "Difficile":"Difícil", "difficile":"Difícil", "Dificil":"Difícil", "difícil":"Difícil",
      "Base":"Base", "Básico":"Base", "Basico":"Base",
      "Examen":"Examen"
    };
    return map[s] || s;
  }

  [arr("qcm"), arr("vf"), arr("case"), arr("cases")].forEach(function(list){
    list.forEach(function(item){
      if(!item) return;
      item.difficulty = normalizeDifficulty(item.difficulty);
      if(item.tags && item.tags.difficulty) item.tags.difficulty = String(normalizeDifficulty(item.tags.difficulty)).toLowerCase().replace("difícil","hard").replace("medio","medium").replace("base","basic");
    });
  });

  merge("01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-001", {
    auditDecision:"B",
    difficulty:"Base",
    heading:"Electricidad biológica",
    question:"¿Cuál es el mecanismo inmediato que explica la señal eléctrica en una neurona?",
    options:[
      "El desplazamiento selectivo de iones a través de canales de membrana modifica el potencial transmembrana.",
      "La circulación de electrones a lo largo del axón genera una corriente similar a la de un cable metálico.",
      "La bomba Na⁺/K⁺ ATPasa produce directamente cada fase rápida del potencial de acción.",
      "La difusión de glucosa hacia el axón genera la despolarización rápida de la membrana."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. La señal eléctrica neuronal depende de corrientes iónicas transmembrana. Cuando se abren canales específicos, Na⁺, K⁺, Ca²⁺ o Cl⁻ modifican el voltaje de la membrana. No se trata de una corriente de electrones como en un metal.",
    whyWrong:[
      null,
      "Falsa. El axón no conduce como un cable metálico clásico; el cambio de voltaje depende de movimientos iónicos a través de la membrana.",
      "Falsa. La bomba Na⁺/K⁺ ATPasa mantiene los gradientes iónicos, pero no produce directamente la fase rápida del potencial de acción.",
      "Falsa. La glucosa aporta energía metabólica, pero la despolarización rápida depende principalmente de la entrada de Na⁺ por canales voltaje-dependientes."
    ],
    distractorExplanations:[
      null,
      "El axón no conduce como un cable metálico clásico; el cambio de voltaje depende de movimientos iónicos transmembrana.",
      "La bomba Na⁺/K⁺ mantiene los gradientes, pero la espiga rápida depende de canales de Na⁺ voltaje-dependientes.",
      "La glucosa es soporte energético, no la corriente eléctrica inmediata del potencial de acción."
    ],
    teachingFocus:"Distinguir electricidad biológica por corrientes iónicas transmembrana de la conducción metálica por electrones.",
    examPearl:"En neurofisiología, la señal eléctrica inmediata es iónica: Na⁺, K⁺, Ca²⁺ y Cl⁻ modifican el voltaje según la permeabilidad de la membrana."
  });

  merge("01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-002", {
    auditDecision:"C",
    difficulty:"Medio",
    heading:"Potencial de reposo",
    question:"En una neurona en reposo, ¿por qué el potencial de membrana se aproxima más al potencial de equilibrio del K⁺ que al del Na⁺?",
    options:[
      "Porque la membrana en reposo es más permeable al K⁺ por canales de fuga.",
      "Porque el Na⁺ no tiene gradiente electroquímico en condiciones fisiológicas.",
      "Porque la bomba Na⁺/K⁺ bloquea todos los canales de Na⁺ durante el reposo.",
      "Porque el Ca²⁺ intracelular determina directamente el potencial de reposo neuronal."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. En reposo, la permeabilidad al K⁺ predomina por los canales de fuga. Por eso el potencial de membrana se acerca más a E_K, aunque no sea exactamente igual a E_K.",
    whyWrong:[
      null,
      "Falsa. El Na⁺ sí tiene un fuerte gradiente electroquímico de entrada, pero la membrana en reposo es mucho menos permeable al Na⁺ que al K⁺.",
      "Falsa. La bomba Na⁺/K⁺ mantiene gradientes, pero no bloquea todos los canales de Na⁺.",
      "Falsa. El Ca²⁺ es crucial en sinapsis, contracción y meseta cardíaca, pero no es el determinante principal del reposo neuronal típico."
    ],
    distractorExplanations:[
      null,
      "Confunde existencia de gradiente con permeabilidad efectiva de la membrana.",
      "Atribuye a la bomba una función de bloqueo canalicular que no tiene.",
      "Sobredimensiona el papel del Ca²⁺ en el potencial de reposo neuronal."
    ],
    teachingFocus:"Relacionar potencial de reposo con permeabilidad dominante al K⁺ y canales de fuga.",
    examPearl:"Reposo neuronal típico: Vm se acerca a E_K porque la membrana es más permeable al K⁺."
  });

  merge("01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-003", {
    auditDecision:"C",
    difficulty:"Examen",
    heading:"Potencial graduado y potencial de acción",
    question:"¿Qué diferencia mejor un potencial graduado de un potencial de acción?",
    options:[
      "El potencial graduado tiene amplitud variable y puede sumarse; el potencial de acción sigue la ley del todo o nada.",
      "El potencial graduado siempre se propaga sin atenuación; el potencial de acción se pierde rápidamente con la distancia.",
      "El potencial graduado depende exclusivamente de Ca²⁺; el potencial de acción depende exclusivamente de Cl⁻.",
      "El potencial graduado aparece solo en el nodo de Ranvier; el potencial de acción aparece solo en dendritas."
    ],
    answerIndex:0,
    explanation:"La respuesta correcta es A. Los potenciales graduados varían según la intensidad del estímulo, pueden sumarse y se atenúan con la distancia. El potencial de acción aparece completo cuando se alcanza el umbral y se regenera durante la propagación axonal.",
    whyWrong:[
      null,
      "Falsa. Invierte las propiedades: el potencial graduado se atenúa; el potencial de acción se regenera.",
      "Falsa. Atribuye iones exclusivos que no corresponden al mecanismo general.",
      "Falsa. Invierte las localizaciones típicas: los potenciales graduados predominan en dendritas y soma; el potencial de acción se inicia típicamente en el segmento inicial del axón."
    ],
    distractorExplanations:[
      null,
      "Confunde propagación pasiva graduada con propagación regenerativa del potencial de acción.",
      "Reduce de forma errónea dos fenómenos complejos a iones exclusivos.",
      "Invierte la anatomía funcional de soma/dendritas y axón."
    ],
    teachingFocus:"Diferenciar potencial graduado, umbral, suma y ley del todo o nada.",
    examPearl:"Graduado = variable, sumable y decreciente. Potencial de acción = todo o nada y regenerativo."
  });

  root.fisiologiaQualityPatchV314 = {
    applied:true,
    module:1,
    moduleId:MODULE_1,
    changedItems:[
      "01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-001",
      "01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-002",
      "01-fisiologia-01-neurofisiologia-y-potencial-de-accion-qcm-v113-003"
    ],
    notes:"Initial safe patch: normalizes difficulty labels and replaces the repetitive visible opening QCM block without changing bank counts."
  };
})();
