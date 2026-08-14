(function(){
  'use strict';

  var previews = {
    completo: {
      eyebrow: 'MAPA COMPLETO · CLASE DEL 14/08',
      title: 'La lógica de la glucólisis en cinco bloques',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · ENTRADA</span><strong>Glucosa atrapada</strong><small>Hexoquinasa o glucoquinasa forma G6P y consume el primer ATP.</small></li><li><span>02 · INVERSIÓN</span><strong>Preparar y dividir</strong><small>PFK-1 consume otro ATP; la aldolasa produce G3P y DHAP.</small></li><li><span>03 · DUPLICACIÓN</span><strong>Dos moléculas de G3P</strong><small>Desde la reacción 6 todos los productos se cuentan por duplicado.</small></li><li><span>04 · BENEFICIO</span><strong>Recuperar energía</strong><small>Se forman 4 ATP, 2 NADH y 2 piruvatos.</small></li><li><span>05 · CONTROL</span><strong>Tres pasos irreversibles</strong><small>Hexoquinasa/glucoquinasa, PFK-1 y piruvato quinasa.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'FICHA RÁPIDA · 7 IDEAS',
      title: 'El mapa central en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La glucólisis es la principal vía citosólica de degradación de la glucosa.</li><li>La vía común comprende 10 reacciones desde glucosa hasta piruvato.</li><li>La fase preparatoria consume 2 ATP y genera 2 moléculas de G3P.</li><li>La fase de beneficio produce 4 ATP, 2 NADH y 2 piruvatos.</li><li>La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.</li><li>Los pasos 1, 3 y 10 son irreversibles y regulados.</li><li>La vía no utiliza O₂ directamente; el O₂ determina el destino posterior del piruvato y del NADH.</li></ul>'
    },
    ultra: {
      eyebrow: 'ULTRA RÁPIDA · OBLIGATORIO',
      title: 'Lo que no puedes olvidar',
      duration: '2 min',
      html: '<ul class="preview-list"><li><strong>Lugar:</strong> citosol.</li><li><strong>Balance:</strong> 2 piruvatos + 2 ATP netos + 2 NADH.</li><li><strong>Inversión:</strong> −2 ATP; <strong>producción:</strong> +4 ATP.</li><li><strong>Irreversibles:</strong> hexoquinasa/glucoquinasa, PFK-1 y piruvato quinasa.</li><li><strong>Sin suficiente O₂:</strong> piruvato → lactato para regenerar NAD⁺.</li></ul>'
    },
    oral: {
      eyebrow: 'REPASO ORAL · ESTILO DE CLASE',
      title: 'Responde sin mirar la explicación',
      duration: '8 preguntas',
      html: '<ol class="oral-list"><li>¿Cuál es el objetivo y dónde ocurre la glucólisis?</li><li>¿Qué se consume y qué se obtiene en la fase preparatoria?</li><li>¿Por qué todos los productos se multiplican por dos desde la reacción 6?</li><li>¿Cuál es el balance neto por cada glucosa?</li><li>¿Cuáles son las tres enzimas irreversibles de la vía?</li><li>¿Qué diferencias principales existen entre hexoquinasa y glucoquinasa?</li><li>¿Por qué la glucólisis puede continuar sin consumir oxígeno directamente?</li><li>¿Cómo permite el lactato mantener la glucólisis cuando falta oxígeno?</li></ol>'
    }
  };

  var epiPreviews = {
    completo: {
      eyebrow: 'MAPA COMPLETO · TRANSCRIPCIÓN ACUMULADA',
      title: 'Del bloque anterior al último curso',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · APS</span><strong>Primer contacto</strong><small>Asistencia esencial, accesible, participativa, sostenible y próxima a la comunidad.</small></li><li><span>02 · PARAGUAY</span><strong>Implementación en 2008</strong><small>La estrategia se ejecuta mediante Equipos y Unidades de Salud de la Familia.</small></li><li><span>03 · INTEGRALIDAD</span><strong>Cuatro dimensiones</strong><small>Persona, familia, comunidad y ambiente con enfoque biopsicosocial.</small></li><li><span>04 · FAMILIA</span><strong>Cuatro etapas</strong><small>Formación, expansión, dispersión y contracción.</small></li><li><span>05 · SECTOR</span><strong>Territorio y vigilancia</strong><small>Delimitar, mapear, clasificar riesgos, asignar responsables y seguir.</small></li><li><span>06 · TRIAGE</span><strong>Prioridad clínica</strong><small>Urgencia requiere atención pronta; emergencia exige acción inmediata.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'FICHA RÁPIDA · 10 IDEAS',
      title: 'Lo esencial de Epidemiología en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La APS es el primer contacto de la persona, familia y comunidad con el sistema de salud.</li><li>Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.</li><li>Principios: equidad, cobertura, participación, trabajo multidisciplinario y acción multisectorial.</li><li>Significado concreto: operativo y dependiente del sistema; abstracto: ideológico y ligado al derecho a la salud.</li><li>Integralidad: persona, familia, comunidad y ambiente.</li><li>La atención integral incluye promoción, prevención, recuperación y rehabilitación.</li><li>Ciclo familiar: formación, expansión, dispersión y contracción.</li><li>Sectorizar es dividir el territorio y asignar responsables para identificar y vigilar riesgos.</li><li>El triage clasifica por gravedad y posibilidad de deterioro, no por orden de llegada.</li><li>Urgencia = pronta; emergencia = inmediata por amenaza vital o de órgano.</li></ul>'
    },
    ultra: {
      eyebrow: 'ULTRA RÁPIDA · OBLIGATORIO',
      title: 'Fechas y diferencias que no puedes confundir',
      duration: '2 min',
      html: '<ul class="preview-list"><li><strong>1978:</strong> Alma-Ata.</li><li><strong>2008:</strong> implementación de la APS en Paraguay.</li><li><strong>Concreto:</strong> operativo · <strong>abstracto:</strong> ideológico.</li><li><strong>4 dimensiones:</strong> persona, familia, comunidad, ambiente.</li><li><strong>4 etapas familiares:</strong> formación, expansión, dispersión, contracción.</li><li><strong>Sectorización:</strong> territorio + responsables + vigilancia + recursos.</li><li><strong>Urgencia:</strong> atención pronta · <strong>emergencia:</strong> inmediata.</li></ul>'
    },
    oral: {
      eyebrow: 'REPASO ORAL · ESTILO DE CLASE',
      title: 'Responde sin mirar la explicación',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Qué es la Atención Primaria de la Salud?</li><li>¿Qué ocurrió en 1978 y qué ocurrió en Paraguay en 2008?</li><li>¿Cuáles son los cuatro grupos de dispensarización?</li><li>¿Qué principios de la APS puedes citar?</li><li>¿Cuál es la diferencia entre el significado concreto y el abstracto?</li><li>¿Cuáles son las cuatro dimensiones de la integralidad?</li><li>¿Cuáles son las etapas del ciclo familiar?</li><li>¿Qué es la sectorización y cuál es su objetivo?</li><li>¿Qué se observa y mide durante la recepción y el triage?</li><li>¿Cuál es la diferencia entre urgencia y emergencia?</li></ol>'
    }
  };

  var fisioPreviews = {
    completo: {
      eyebrow: 'MAPA COMPLETO · JUEVES 13',
      title: 'Del cambio químico a la respuesta ventilatoria',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · CAMBIO</span><strong>CO₂, O₂, pH o distensión</strong><small>El sistema respiratorio recibe una alteración química o mecánica.</small></li><li><span>02 · SENSORES</span><strong>Quimio y mecanorreceptores</strong><small>Los cuerpos carotídeos/aórticos y los receptores pulmonares generan aferencias.</small></li><li><span>03 · INTEGRACIÓN</span><strong>Bulbo y puente</strong><small>GRD, GRV con complejo pre-Bötzinger y grupo pontino organizan el patrón.</small></li><li><span>04 · SALIDA</span><strong>Nervios motores</strong><small>La señal llega al diafragma y a otros músculos respiratorios.</small></li><li><span>05 · RESPUESTA</span><strong>Frecuencia + profundidad</strong><small>La ventilación alveolar cambia para corregir gases y pH.</small></li><li><span>06 · CLÍNICA</span><strong>EPOC e hipercapnia</strong><small>La obstrucción reduce la ventilación efectiva y puede causar acidosis respiratoria.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'FICHA RÁPIDA FIS · 10 IDEAS',
      title: 'Control respiratorio en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La regulación sigue el circuito sensor → controlador → efector.</li><li>El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.</li><li>El GRD es sobre todo inspiratorio e integra aferencias en el núcleo del tracto solitario.</li><li>El GRV contiene neuronas inspiratorias y espiratorias y se recluta más con demanda elevada.</li><li>El grupo pontino ajusta el cambio entre inspiración y espiración.</li><li>Los quimiorreceptores centrales responden al pH del LCR producido por cambios de PaCO₂.</li><li>Los cuerpos carotídeos son los sensores periféricos más importantes de PaO₂ baja.</li><li>La inspiración tranquila es activa y la espiración tranquila, principalmente pasiva.</li><li>El ejercicio aumenta la ventilación mediante comando central y propiocepción antes de grandes cambios químicos.</li><li>En EPOC, hipoventilación alveolar e hipercapnia pueden producir acidosis respiratoria.</li></ul>'
    },
    centros: {
      eyebrow: 'TABLA MENTAL · CENTROS Y SENSORES',
      title: 'Qué detecta cada uno y qué hace después',
      duration: '3 min',
      html: '<ul class="preview-list"><li><strong>GRD:</strong> bulbo dorsal · inspiración e integración sensorial.</li><li><strong>GRV:</strong> bulbo ventrolateral · inspiración/espiración forzada; incluye pre-Bötzinger.</li><li><strong>Grupo pontino:</strong> puente · modula duración y transición de las fases.</li><li><strong>Central:</strong> bulbo ventrolateral · pH del LCR dependiente de CO₂.</li><li><strong>Carotídeo:</strong> bifurcación carotídea · PaO₂, PaCO₂ y pH · nervio IX.</li><li><strong>Aórtico:</strong> arco aórtico · gases y pH · nervio X.</li><li><strong>Estiramiento:</strong> vía aérea · distensión · reflejo de Hering–Breuer.</li><li><strong>Irritantes/J:</strong> irritantes o líquido intersticial · tos, broncoconstricción o taquipnea.</li></ul>'
    },
    oral: {
      eyebrow: 'REPASO ORAL FIS · ESTILO DE CLASE',
      title: 'Responde sin mirar el esquema',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Cuáles son los tres componentes del bucle de control respiratorio?</li><li>¿Qué funciones cumplen el GRD, el GRV y el grupo pontino?</li><li>¿Dónde está el complejo pre-Bötzinger y por qué es importante?</li><li>¿Qué detectan realmente los quimiorreceptores centrales?</li><li>¿Dónde están los cuerpos carotídeos y aórticos y por qué nervios informan?</li><li>¿Cuál es el principal estímulo hipóxico de los quimiorreceptores periféricos?</li><li>¿Qué provoca el reflejo de Hering–Breuer?</li><li>¿Cómo aumenta la ventilación al comenzar el ejercicio?</li><li>¿Cómo se transportan O₂ y CO₂ en sangre?</li><li>¿Por qué la retención de CO₂ puede causar acidosis respiratoria?</li></ol>'
    }
  };

  var microPreviews = {
    completo: {
      eyebrow: 'MAPA DE LA PRÁCTICA · GRUPO 3',
      title: 'Del alimento al reconocimiento microscópico',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · MUESTRA</span><strong>Alimento sólido con moho</strong><small>Preferir pan duro; transportarlo cerrado y abrirlo solo bajo indicación docente.</small></li><li><span>02 · CULTIVO</span><strong>Agar dextrosa Sabouraud</strong><small>Peptonas, glucosa, agar y pH ácido favorecen el crecimiento fúngico.</small></li><li><span>03 · COLONIA</span><strong>Observar la forma macroscópica</strong><small>Registrar textura, relieve, color y aspecto sin oler ni agitar el cultivo.</small></li><li><span>04 · MICROSCOPIO</span><strong>Reconocer estructuras</strong><small>Distinguir gemación, hifas, micelio, conidios, esporangios y rizoides.</small></li><li><span>05 · INTERPRETACIÓN</span><strong>Levadura, moho o dimórfico</strong><small>Integrar organización celular, morfología y condiciones de crecimiento.</small></li><li><span>06 · CIERRE</span><strong>Desecho seguro</strong><small>Mantener y eliminar la muestra según el protocolo institucional.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'FICHA RÁPIDA LAB · 8 IDEAS',
      title: 'Hongos y Sabouraud en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Las levaduras son principalmente unicelulares y suelen reproducirse por gemación.</li><li>Los mohos son filamentosos: sus hifas forman un micelio.</li><li>Un hongo dimórfico cambia de forma según las condiciones; la temperatura es una señal frecuente, no una regla absoluta.</li><li>Los conidios son esporas asexuales externas sostenidas por conidióforos.</li><li>El esporangio es un saco de esporas sostenido por un esporangióforo.</li><li>El agar Sabouraud aporta peptonas, glucosa y agar, con un pH ácido cercano a 5,6.</li><li>La fórmula y la esterilización se ejecutan según el fabricante y el protocolo del laboratorio.</li><li>Una colonia visible orienta, pero no identifica por sí sola una especie.</li></ul>'
    },
    checklist: {
      eyebrow: 'CHECKLIST · PRÓXIMA PRÁCTICA',
      title: 'Muestra preparada sin riesgo innecesario',
      duration: '1 min',
      html: '<ul class="preview-list"><li><strong>Elegir:</strong> pan duro con crecimiento visible; como alternativa, una fruta o queso aún sólidos.</li><li><strong>Evitar:</strong> alimentos totalmente líquidos, deshechos o con derrames.</li><li><strong>Cerrar:</strong> colocar la muestra en un recipiente o bolsa resistente y sellada.</li><li><strong>Identificar:</strong> escribir nombre y tipo de muestra por fuera.</li><li><strong>Transportar:</strong> separada de alimentos, bebidas y objetos personales.</li><li><strong>No manipular:</strong> no abrir, oler, tocar ni agitar en casa.</li><li><strong>En el laboratorio:</strong> esperar la indicación docente y cumplir el protocolo de bioseguridad.</li></ul>'
    },
    oral: {
      eyebrow: 'REPASO ORAL LAB · ESTILO DE CLASE',
      title: 'Responde antes de mirar al microscopio',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Cuál es la diferencia central entre una levadura y un moho?</li><li>¿Qué es una hifa y qué es un micelio?</li><li>¿Qué significa que un hongo sea dimórfico?</li><li>¿Cuál es la diferencia entre conidio y conidióforo?</li><li>¿Cuál es la diferencia entre esporangio y esporangióforo?</li><li>¿Qué función pueden cumplir los rizoides?</li><li>¿Qué componentes básicos tiene el agar dextrosa Sabouraud?</li><li>¿Por qué su pH ácido favorece el aislamiento de hongos?</li><li>¿Por qué la preparación debe seguir la etiqueta del fabricante?</li><li>¿Qué medidas de bioseguridad debes respetar con la muestra?</li></ol>'
    }
  };

  var storageKey = 'med-nykuto-grupo3-plan-v404';
  var labStorageKey = 'med-nykuto-lab-group-v403';
  var bioPrepStorageKey = 'med-nykuto-bio-prep-v404';
  var epiPrepStorageKey = 'med-nykuto-epi-prep-v405';
  var microPrepStorageKey = 'med-nykuto-micro-prep-v407';
  var toastTimer;

  var classSchedule = [
    {day:1,start:'07:00',end:'10:10',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:1,start:'10:10',end:'12:20',subject:'Microbiología II',teacher:'Dr. Alexander Acuña'},
    {day:1,start:'15:00',end:'17:00',subject:'Bioética · plataforma',teacher:'Lic. Silvia Nuarte'},
    {day:3,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'},
    {day:3,start:'11:20',end:'13:20',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:4,start:'07:00',end:'09:40',subject:'Nutrición',teacher:'Lic. Johana Leguizamón'},
    {day:4,start:'09:40',end:'12:20',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:5,start:'07:00',end:'09:00',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:5,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'}
  ];

  var labSlots = {
    '1':{day:4,start:'14:00',end:'16:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 1'},
    '2':{day:4,start:'16:00',end:'18:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 2'},
    '3':{day:4,start:'18:00',end:'20:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 3'}
  };

  var latestTranscript = {
    subject:'Bioquímica II',
    oralDate:'2026-08-14',
    sourceMode:'legacy-cumulative',
    latestSegment:'tail',
    estimatedPreparation:{date:'2026-08-19',start:'09:10',end:'11:10'}
  };

  var latestEpiTranscript = {
    subject:'Epidemiología y Salud Pública',
    oralDate:null,
    receivedDate:'2026-08-14',
    sourceMode:'legacy-cumulative',
    latestSegment:'tail',
    segments:[
      {position:'previous',oralDate:null,topic:'APS y modelo de atención integral'},
      {position:'latest',oralDate:null,topic:'Sectorización, triage, urgencia y emergencia'}
    ],
    estimatedPreparation:{date:'2026-08-19',start:'11:20',end:'13:20'}
  };

  var latestFisioTranscript = {
    subject:'Fisiología II',
    oralMarker:'jueves 13',
    resolvedDate:'2026-08-13',
    receivedDate:'2026-08-14',
    sourceMode:'legacy-cumulative',
    dateResolution:'weekday-and-day-matched-to-schedule',
    segments:[
      {position:'previous',estimatedDate:'2026-08-10',topic:'Difusión y transporte de gases'},
      {position:'latest',resolvedDate:'2026-08-13',topic:'Control nervioso y químico de la respiración'}
    ]
  };

  var latestMicroTranscript = {
    subject:'Laboratorio de Microbiología II',
    scope:'personal-group-3',
    oralDate:null,
    receivedDate:'2026-08-14',
    estimatedClassDate:'2026-08-13',
    sourceMode:'single-class',
    estimatedPreparation:{date:'2026-08-20',start:'18:00',end:'20:00'}
  };

  function renderPreview(mode){
    var data = previews[mode] || previews.completo;
    document.getElementById('studyPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('study-preview-title').textContent = data.title;
    document.getElementById('studyPreviewDuration').textContent = data.duration;
    document.getElementById('studyPreviewBody').innerHTML = data.html;
    document.querySelectorAll('[data-study-mode]').forEach(function(button){
      var active = button.dataset.studyMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderEpiPreview(mode){
    var data = epiPreviews[mode] || epiPreviews.completo;
    document.getElementById('epiPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('epi-preview-title').textContent = data.title;
    document.getElementById('epiPreviewDuration').textContent = data.duration;
    document.getElementById('epiPreviewBody').innerHTML = data.html;
    document.querySelectorAll('[data-epi-mode]').forEach(function(button){
      var active = button.dataset.epiMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderFisioPreview(mode){
    var data = fisioPreviews[mode] || fisioPreviews.completo;
    document.getElementById('fisioPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('fisio-preview-title').textContent = data.title;
    document.getElementById('fisioPreviewDuration').textContent = data.duration;
    document.getElementById('fisioPreviewBody').innerHTML = data.html;
    document.querySelectorAll('[data-fisio-mode]').forEach(function(button){
      var active = button.dataset.fisioMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderMicroPreview(mode){
    var data = microPreviews[mode] || microPreviews.completo;
    document.getElementById('microPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('micro-preview-title').textContent = data.title;
    document.getElementById('microPreviewDuration').textContent = data.duration;
    document.getElementById('microPreviewBody').innerHTML = data.html;
    document.querySelectorAll('[data-micro-mode]').forEach(function(button){
      var active = button.dataset.microMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function showToast(message){
    var toast = document.getElementById('classToast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function(){ toast.classList.remove('is-visible'); }, 2600);
  }

  function readPlan(){
    try{return JSON.parse(localStorage.getItem(storageKey) || '[]');}catch(error){return [];}
  }

  function savePlan(){
    var checked = Array.from(document.querySelectorAll('#studyChecklist input:checked')).map(function(input){return input.value;});
    try{localStorage.setItem(storageKey, JSON.stringify(checked));}catch(error){}
    updatePlanProgress();
  }

  function updatePlanProgress(){
    var all = document.querySelectorAll('#studyChecklist input');
    var done = document.querySelectorAll('#studyChecklist input:checked').length;
    document.getElementById('planCount').textContent = done + '/' + all.length;
    document.getElementById('planProgressBar').style.width = (all.length ? done / all.length * 100 : 0) + '%';
  }

  function restorePlan(){
    var saved = readPlan();
    document.querySelectorAll('#studyChecklist input').forEach(function(input){input.checked = saved.indexOf(input.value) !== -1;});
    updatePlanProgress();
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){return navigator.clipboard.writeText(text);}
    return new Promise(function(resolve, reject){
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly','');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try{document.execCommand('copy');resolve();}catch(error){reject(error);}
      area.remove();
    });
  }

  function setUpdatedDate(){
    var node = document.getElementById('lastUpdated');
    try{
      var label = new Intl.DateTimeFormat('es-PY',{day:'numeric',month:'short',timeZone:'America/Asuncion'}).format(new Date());
      node.textContent = 'Actualizado ' + label;
    }catch(error){node.textContent = 'Actualizado hoy';}
  }

  function getParaguayWallClock(){
    try{
      var parts = new Intl.DateTimeFormat('en-US',{
        timeZone:'America/Asuncion',year:'numeric',month:'numeric',day:'numeric',
        hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'
      }).formatToParts(new Date());
      var values = {};
      parts.forEach(function(part){if(part.type !== 'literal') values[part.type] = Number(part.value);});
      return new Date(Date.UTC(values.year,values.month-1,values.day,values.hour,values.minute,values.second));
    }catch(error){return new Date();}
  }

  function candidateFor(day,start,offset,now){
    var date = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+offset));
    if(date.getUTCDay() !== day) return null;
    var time = start.split(':').map(Number);
    date.setUTCHours(time[0],time[1],0,0);
    return date;
  }

  function nextOccurrence(items,filter){
    var now = getParaguayWallClock();
    var candidates = [];
    for(var offset=0;offset<15;offset+=1){
      items.forEach(function(item){
        if(filter && !filter(item)) return;
        var date = candidateFor(item.day,item.start,offset,now);
        if(date && date.getTime() > now.getTime()) candidates.push({item:item,date:date});
      });
    }
    candidates.sort(function(a,b){return a.date-b.date;});
    return candidates[0] || null;
  }

  function formatOccurrence(occurrence){
    if(!occurrence) return 'Sin próxima fecha disponible';
    var dateLabel = new Intl.DateTimeFormat('es-PY',{
      weekday:'long',day:'numeric',month:'short',timeZone:'UTC'
    }).format(occurrence.date);
    dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
    return dateLabel + ' · ' + occurrence.item.start + '–' + occurrence.item.end;
  }

  function formatEstimatedPreparation(preparation){
    var parts = preparation.date.split('-').map(Number);
    var date = new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
    return formatOccurrence({
      date:date,
      item:{start:preparation.start,end:preparation.end}
    }) + ' · por confirmar';
  }

  function readLabGroup(){
    try{return localStorage.getItem(labStorageKey) || '';}catch(error){return '';}
  }

  function renderSchedule(){
    var select = document.getElementById('labGroupSelect');
    var group = select.value;
    var items = classSchedule.slice();
    if(group && labSlots[group]) items.push(labSlots[group]);

    var next = nextOccurrence(items);
    if(next){
      document.getElementById('nextScheduleSubject').textContent = next.item.subject;
      document.getElementById('nextScheduleWhen').textContent = formatOccurrence(next);
      document.getElementById('nextScheduleTeacher').textContent = (next.item.group ? next.item.group + ' · ' : '') + next.item.teacher;
    }

    document.querySelectorAll('[data-schedule-day]').forEach(function(card){
      card.classList.toggle('is-next-day',!!next && Number(card.dataset.scheduleDay) === next.item.day);
    });

    var timeNode = document.getElementById('labScheduleTime');
    var groupNode = document.getElementById('labScheduleGroup');
    var nextLabNode = document.getElementById('nextLabWhen');
    if(group && labSlots[group]){
      var lab = labSlots[group];
      timeNode.textContent = lab.start + '–' + lab.end;
      groupNode.textContent = lab.group + ' · ' + lab.teacher;
      nextLabNode.textContent = formatOccurrence(nextOccurrence([lab]));
    }else{
      timeNode.textContent = 'G1 14:00 · G2 16:00 · G3 18:00';
      groupNode.textContent = 'Selecciona tu subgrupo';
      nextLabNode.textContent = 'Selecciona tu subgrupo';
    }

    document.getElementById('bioEstimatedDate').textContent = formatEstimatedPreparation(latestTranscript.estimatedPreparation);
    document.getElementById('epiEstimatedDate').textContent = formatEstimatedPreparation(latestEpiTranscript.estimatedPreparation);
    document.getElementById('microEstimatedDate').textContent = formatEstimatedPreparation(latestMicroTranscript.estimatedPreparation);
  }

  function restorePersonalSchedule(){
    var select = document.getElementById('labGroupSelect');
    var saved = readLabGroup();
    if(labSlots[saved]) select.value = saved;
    select.addEventListener('change',function(){
      try{
        if(select.value) localStorage.setItem(labStorageKey,select.value);
        else localStorage.removeItem(labStorageKey);
      }catch(error){}
      renderSchedule();
      if(select.value) showToast('Subgrupo guardado solo en este dispositivo.');
    });

    var prep = document.getElementById('bioPrepDone');
    try{prep.checked = localStorage.getItem(bioPrepStorageKey) === '1';}catch(error){}
    document.getElementById('bioPrepCard').classList.toggle('is-complete',prep.checked);
    prep.addEventListener('change',function(){
      try{localStorage.setItem(bioPrepStorageKey,prep.checked ? '1' : '0');}catch(error){}
      document.getElementById('bioPrepCard').classList.toggle('is-complete',prep.checked);
    });

    var epiPrep = document.getElementById('epiPrepDone');
    try{epiPrep.checked = localStorage.getItem(epiPrepStorageKey) === '1';}catch(error){}
    document.getElementById('epiPrepCard').classList.toggle('is-complete',epiPrep.checked);
    epiPrep.addEventListener('change',function(){
      try{localStorage.setItem(epiPrepStorageKey,epiPrep.checked ? '1' : '0');}catch(error){}
      document.getElementById('epiPrepCard').classList.toggle('is-complete',epiPrep.checked);
    });

    var microPrep = document.getElementById('microPrepDone');
    try{microPrep.checked = localStorage.getItem(microPrepStorageKey) === '1';}catch(error){}
    document.getElementById('microPrepCard').classList.toggle('is-complete',microPrep.checked);
    microPrep.addEventListener('change',function(){
      try{localStorage.setItem(microPrepStorageKey,microPrep.checked ? '1' : '0');}catch(error){}
      document.getElementById('microPrepCard').classList.toggle('is-complete',microPrep.checked);
    });
    renderSchedule();
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderPreview('completo');
    renderEpiPreview('completo');
    renderFisioPreview('completo');
    renderMicroPreview('completo');
    restorePlan();
    restorePersonalSchedule();
    setUpdatedDate();

    document.querySelectorAll('[data-study-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderPreview(button.dataset.studyMode);
        document.getElementById('repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-epi-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderEpiPreview(button.dataset.epiMode);
        document.getElementById('epi-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-fisio-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderFisioPreview(button.dataset.fisioMode);
        document.getElementById('fisio-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-micro-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderMicroPreview(button.dataset.microMode);
        document.getElementById('micro-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.getElementById('studyChecklist').addEventListener('change', savePlan);

    document.getElementById('delegateQuestionForm').addEventListener('submit', function(event){
      event.preventDefault();
      var subject = document.getElementById('questionSubject').value.trim();
      var question = document.getElementById('questionText').value.trim();
      if(!question) return;
      var message = 'Materia: ' + subject + '\nDuda para transmitir: ' + question;
      copyText(message).then(function(){showToast('Mensaje copiado. Ya puedes compartirlo.');}).catch(function(){showToast('No se pudo copiar automáticamente.');});
    });
  });

  window.MED_NYKUTO_CLASS_SCHEDULE = classSchedule.slice();
  window.MED_NYKUTO_LATEST_TRANSCRIPT = Object.assign({},latestTranscript);
  window.MED_NYKUTO_LATEST_TRANSCRIPTS = {
    bioquimica:Object.assign({},latestTranscript),
    epidemiologia:Object.assign({},latestEpiTranscript),
    fisiologia:Object.assign({},latestFisioTranscript),
    microbiologiaPractica:Object.assign({},latestMicroTranscript)
  };
  window.MED_NYKUTO_TRANSCRIPTION_RULES = {
    legacyCumulative:'Cada fecha oral inicia un nuevo bloque y el tramo final es siempre la clase más reciente.',
    newTranscripts:'Una transcripción nueva corresponde a una sola clase.',
    missingLatestDate:'El último bloque queda por confirmar y no hereda una fecha anterior.'
  };
})();
