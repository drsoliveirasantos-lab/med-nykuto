(function(){
  'use strict';

  var classI18n = window.MedNykutoClassI18n || null;

  function classLang(){
    return classI18n && typeof classI18n.getLang === 'function' ? classI18n.getLang() : 'es';
  }

  function tr(key,variables){
    return classI18n && typeof classI18n.t === 'function' ? classI18n.t(key,variables) : key;
  }

  function localizeText(value){
    if(classLang() === 'br' && classI18n && classI18n.exact && classI18n.exact[value]) return classI18n.exact[value];
    return value;
  }

  function refreshLanguage(root){
    if(classI18n && typeof classI18n.refresh === 'function') classI18n.refresh(root || document.body);
  }

  var previews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · CLASE DEL 14/08',
      title: 'La lógica de la glucólisis en cinco bloques',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · ENTRADA</span><strong>Glucosa atrapada</strong><small>Hexoquinasa o glucoquinasa forma G6P y consume el primer ATP.</small></li><li><span>02 · INVERSIÓN</span><strong>Preparar y dividir</strong><small>PFK-1 consume otro ATP; la aldolasa produce G3P y DHAP.</small></li><li><span>03 · DUPLICACIÓN</span><strong>Dos moléculas de G3P</strong><small>Desde la reacción 6 todos los productos se cuentan por duplicado.</small></li><li><span>04 · BENEFICIO</span><strong>Recuperar energía</strong><small>Se forman 4 ATP, 2 NADH y 2 piruvatos.</small></li><li><span>05 · CONTROL</span><strong>Tres pasos irreversibles</strong><small>Hexoquinasa/glucoquinasa, PFK-1 y piruvato quinasa.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 7 IDEAS',
      title: 'El mapa central en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La glucólisis es la principal vía citosólica de degradación de la glucosa.</li><li>La vía común comprende 10 reacciones desde glucosa hasta piruvato.</li><li>La fase preparatoria consume 2 ATP y genera 2 moléculas de G3P.</li><li>La fase de beneficio produce 4 ATP, 2 NADH y 2 piruvatos.</li><li>La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.</li><li>Los pasos 1, 3 y 10 son irreversibles y regulados.</li><li>La vía no utiliza O₂ directamente; el O₂ determina el destino posterior del piruvato y del NADH.</li></ul>'
    },
    ultra: {
      eyebrow: 'LO MÁS IMPORTANTE',
      title: 'Lo que no puedes olvidar',
      duration: '2 min',
      html: '<ul class="preview-list"><li><strong>Lugar:</strong> citosol.</li><li><strong>Balance:</strong> 2 piruvatos + 2 ATP netos + 2 NADH.</li><li><strong>Inversión:</strong> −2 ATP; <strong>producción:</strong> +4 ATP.</li><li><strong>Irreversibles:</strong> hexoquinasa/glucoquinasa, PFK-1 y piruvato quinasa.</li><li><strong>Sin suficiente O₂:</strong> piruvato → lactato para regenerar NAD⁺.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde sin mirar la explicación',
      duration: '8 preguntas',
      html: '<ol class="oral-list"><li>¿Cuál es el objetivo y dónde ocurre la glucólisis?</li><li>¿Qué se consume y qué se obtiene en la fase preparatoria?</li><li>¿Por qué todos los productos se multiplican por dos desde la reacción 6?</li><li>¿Cuál es el balance neto por cada glucosa?</li><li>¿Cuáles son las tres enzimas irreversibles de la vía?</li><li>¿Qué diferencias principales existen entre hexoquinasa y glucoquinasa?</li><li>¿Por qué la glucólisis puede continuar sin consumir oxígeno directamente?</li><li>¿Cómo permite el lactato mantener la glucólisis cuando falta oxígeno?</li></ol>'
    }
  };

  var epiPreviews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · CLASES ANTERIORES',
      title: 'Del bloque anterior al último curso',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · APS</span><strong>Primer contacto</strong><small>Asistencia esencial, accesible, participativa, sostenible y próxima a la comunidad.</small></li><li><span>02 · PARAGUAY</span><strong>Implementación en 2008</strong><small>La estrategia se ejecuta mediante Equipos y Unidades de Salud de la Familia.</small></li><li><span>03 · INTEGRALIDAD</span><strong>Cuatro dimensiones</strong><small>Persona, familia, comunidad y ambiente con enfoque biopsicosocial.</small></li><li><span>04 · FAMILIA</span><strong>Cuatro etapas</strong><small>Formación, expansión, dispersión y contracción.</small></li><li><span>05 · SECTOR</span><strong>Territorio y vigilancia</strong><small>Delimitar, mapear, clasificar riesgos, asignar responsables y seguir.</small></li><li><span>06 · TRIAGE</span><strong>Prioridad clínica</strong><small>Urgencia requiere atención pronta; emergencia exige acción inmediata.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 10 IDEAS',
      title: 'Lo esencial de Epidemiología en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La APS es el primer contacto de la persona, familia y comunidad con el sistema de salud.</li><li>Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.</li><li>Principios: equidad, cobertura, participación, trabajo multidisciplinario y acción multisectorial.</li><li>Significado concreto: operativo y dependiente del sistema; abstracto: ideológico y ligado al derecho a la salud.</li><li>Integralidad: persona, familia, comunidad y ambiente.</li><li>La atención integral incluye promoción, prevención, recuperación y rehabilitación.</li><li>Ciclo familiar: formación, expansión, dispersión y contracción.</li><li>Sectorizar es dividir el territorio y asignar responsables para identificar y vigilar riesgos.</li><li>El triage clasifica por gravedad y posibilidad de deterioro, no por orden de llegada.</li><li>Urgencia = pronta; emergencia = inmediata por amenaza vital o de órgano.</li></ul>'
    },
    ultra: {
      eyebrow: 'LO MÁS IMPORTANTE',
      title: 'Fechas y diferencias que no puedes confundir',
      duration: '2 min',
      html: '<ul class="preview-list"><li><strong>1978:</strong> Alma-Ata.</li><li><strong>2008:</strong> implementación de la APS en Paraguay.</li><li><strong>Concreto:</strong> operativo · <strong>abstracto:</strong> ideológico.</li><li><strong>4 dimensiones:</strong> persona, familia, comunidad, ambiente.</li><li><strong>4 etapas familiares:</strong> formación, expansión, dispersión, contracción.</li><li><strong>Sectorización:</strong> territorio + responsables + vigilancia + recursos.</li><li><strong>Urgencia:</strong> atención pronta · <strong>emergencia:</strong> inmediata.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde sin mirar la explicación',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Qué es la Atención Primaria de la Salud?</li><li>¿Qué ocurrió en 1978 y qué ocurrió en Paraguay en 2008?</li><li>¿Cuáles son los cuatro grupos de dispensarización?</li><li>¿Qué principios de la APS puedes citar?</li><li>¿Cuál es la diferencia entre el significado concreto y el abstracto?</li><li>¿Cuáles son las cuatro dimensiones de la integralidad?</li><li>¿Cuáles son las etapas del ciclo familiar?</li><li>¿Qué es la sectorización y cuál es su objetivo?</li><li>¿Qué se observa y mide durante la recepción y el triage?</li><li>¿Cuál es la diferencia entre urgencia y emergencia?</li></ol>'
    }
  };

  var fisioPreviews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · JUEVES 13',
      title: 'Del cambio químico a la respuesta ventilatoria',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · CAMBIO</span><strong>CO₂, O₂, pH o distensión</strong><small>El sistema respiratorio recibe una alteración química o mecánica.</small></li><li><span>02 · SENSORES</span><strong>Quimio y mecanorreceptores</strong><small>Los cuerpos carotídeos/aórticos y los receptores pulmonares generan aferencias.</small></li><li><span>03 · INTEGRACIÓN</span><strong>Bulbo y puente</strong><small>GRD, GRV con complejo pre-Bötzinger y grupo pontino organizan el patrón.</small></li><li><span>04 · SALIDA</span><strong>Nervios motores</strong><small>La señal llega al diafragma y a otros músculos respiratorios.</small></li><li><span>05 · RESPUESTA</span><strong>Frecuencia + profundidad</strong><small>La ventilación alveolar cambia para corregir gases y pH.</small></li><li><span>06 · CLÍNICA</span><strong>EPOC e hipercapnia</strong><small>La obstrucción reduce la ventilación efectiva y puede causar acidosis respiratoria.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 10 IDEAS',
      title: 'Control respiratorio en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>La regulación sigue el circuito sensor → controlador → efector.</li><li>El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.</li><li>El GRD es sobre todo inspiratorio e integra aferencias en el núcleo del tracto solitario.</li><li>El GRV contiene neuronas inspiratorias y espiratorias y se recluta más con demanda elevada.</li><li>El grupo pontino ajusta el cambio entre inspiración y espiración.</li><li>Los quimiorreceptores centrales responden al pH del LCR producido por cambios de PaCO₂.</li><li>Los cuerpos carotídeos son los sensores periféricos más importantes de PaO₂ baja.</li><li>La inspiración tranquila es activa y la espiración tranquila, principalmente pasiva.</li><li>El ejercicio aumenta la ventilación mediante comando central y propiocepción antes de grandes cambios químicos.</li><li>En EPOC, hipoventilación alveolar e hipercapnia pueden producir acidosis respiratoria.</li></ul>'
    },
    centros: {
      eyebrow: 'CENTROS Y SENSORES · RESUMEN',
      title: 'Qué detecta cada uno y qué hace después',
      duration: '3 min',
      html: '<ul class="preview-list"><li><strong>GRD:</strong> bulbo dorsal · inspiración e integración sensorial.</li><li><strong>GRV:</strong> bulbo ventrolateral · inspiración/espiración forzada; incluye pre-Bötzinger.</li><li><strong>Grupo pontino:</strong> puente · modula duración y transición de las fases.</li><li><strong>Central:</strong> bulbo ventrolateral · pH del LCR dependiente de CO₂.</li><li><strong>Carotídeo:</strong> bifurcación carotídea · PaO₂, PaCO₂ y pH · nervio IX.</li><li><strong>Aórtico:</strong> arco aórtico · gases y pH · nervio X.</li><li><strong>Estiramiento:</strong> vía aérea · distensión · reflejo de Hering–Breuer.</li><li><strong>Irritantes/J:</strong> irritantes o líquido intersticial · tos, broncoconstricción o taquipnea.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde sin mirar el esquema',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Cuáles son los tres componentes del bucle de control respiratorio?</li><li>¿Qué funciones cumplen el GRD, el GRV y el grupo pontino?</li><li>¿Dónde está el complejo pre-Bötzinger y por qué es importante?</li><li>¿Qué detectan realmente los quimiorreceptores centrales?</li><li>¿Dónde están los cuerpos carotídeos y aórticos y por qué nervios informan?</li><li>¿Cuál es el principal estímulo hipóxico de los quimiorreceptores periféricos?</li><li>¿Qué provoca el reflejo de Hering–Breuer?</li><li>¿Cómo aumenta la ventilación al comenzar el ejercicio?</li><li>¿Qué diferencia los receptores de estiramiento de los receptores irritantes?</li><li>¿Por qué la retención de CO₂ puede causar acidosis respiratoria?</li></ol>'
    }
  };

  var fisioGasPreviews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · 10 AGO.',
      title: 'Del alvéolo a los tejidos',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · VENTILACIÓN</span><strong>Aire hasta los alvéolos</strong><small>Los gradientes de presión mueven el aire entre atmósfera y alvéolo.</small></li><li><span>02 · DIFUSIÓN</span><strong>Cruzar la barrera</strong><small>Área, gradiente, grosor y propiedades del gas determinan el flujo.</small></li><li><span>03 · PERFUSIÓN</span><strong>Sangre disponible</strong><small>El intercambio eficaz exige acoplar ventilación alveolar y flujo capilar.</small></li><li><span>04 · OXÍGENO</span><strong>Principalmente unido a Hb</strong><small>PaO₂, saturación y contenido arterial describen variables diferentes.</small></li><li><span>05 · DIÓXIDO DE CARBONO</span><strong>Principalmente bicarbonato</strong><small>También viaja unido a proteínas y en forma disuelta.</small></li><li><span>06 · TEJIDOS</span><strong>Bohr descarga O₂</strong><small>CO₂, H⁺, temperatura y 2,3-BPG desplazan la curva a la derecha.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · CLASE DEL 10/08',
      title: 'Difusión y transporte en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Ventilación, difusión, perfusión y transporte son procesos distintos y encadenados.</li><li>La difusión aumenta con el área y el gradiente de presión parcial.</li><li>La difusión disminuye cuando aumenta el grosor de la barrera.</li><li>El enfisema reduce área; el edema y la fibrosis aumentan distancia de difusión.</li><li>Una región con V/Q baja recibe sangre pero poco aire.</li><li>Una región con V/Q alta recibe aire pero poco flujo sanguíneo.</li><li>El O₂ viaja sobre todo unido a la hemoglobina.</li><li>El CO₂ viaja sobre todo como bicarbonato.</li><li>El efecto Bohr facilita la descarga de O₂ en tejidos activos.</li><li>El efecto Haldane facilita la captación de CO₂ por la Hb desoxigenada y su eliminación pulmonar.</li></ul>'
    },
    comparar: {
      eyebrow: 'COMPARACIÓN · BOHR / HALDANE',
      title: 'Dos efectos, dos preguntas diferentes',
      duration: '3 min',
      html: '<ul class="preview-list"><li><strong>Bohr pregunta:</strong> ¿cómo modifican CO₂ y H⁺ la afinidad de la Hb por el O₂?</li><li><strong>Bohr en tejidos:</strong> ↑CO₂ y ↑H⁺ reducen afinidad y favorecen liberación de O₂.</li><li><strong>Haldane pregunta:</strong> ¿cómo modifica la oxigenación de la Hb el transporte de CO₂ y H⁺?</li><li><strong>Haldane en tejidos:</strong> la Hb desoxigenada acepta mejor CO₂ y H⁺.</li><li><strong>Haldane en pulmón:</strong> la oxigenación de la Hb favorece la liberación de CO₂.</li><li><strong>No confundir:</strong> el desplazamiento de cloruro acompaña el transporte de bicarbonato, pero no define el efecto Haldane.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR · CLASE DEL 10/08',
      title: 'Responde sin mezclarlo con regulación respiratoria',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Qué diferencia ventilación, difusión, perfusión y transporte?</li><li>¿Qué variables de la ley de Fick favorecen o dificultan la difusión?</li><li>¿Qué estructuras forman la barrera alveolocapilar?</li><li>¿Qué significa una relación V/Q baja y una V/Q alta?</li><li>¿Por qué el ápice tiene una V/Q relativamente mayor que la base?</li><li>¿Cómo se transporta la mayor parte del oxígeno?</li><li>¿Cómo se transporta la mayor parte del dióxido de carbono?</li><li>¿Qué representa la P50?</li><li>¿Qué es el efecto Bohr?</li><li>¿Qué es el efecto Haldane?</li></ol>'
    }
  };

  var nutritionPreviews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · 13 AGO. ESTIMADO',
      title: 'De la alimentación al consejo individualizado',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · CANTIDAD</span><strong>¿Cuánto necesita?</strong><small>Comparar ingesta con gasto, estado fisiológico, enfermedad y objetivo clínico.</small></li><li><span>02 · CALIDAD</span><strong>¿Qué nutrientes aporta?</strong><small>Revisar proteínas, carbohidratos, grasas, fibra, agua, vitaminas y minerales.</small></li><li><span>03 · ARMONÍA</span><strong>¿En qué proporción?</strong><small>Detectar grupos ausentes, platos dominados por un solo alimento y desequilibrios.</small></li><li><span>04 · ADECUACIÓN</span><strong>¿Para quién es?</strong><small>Adaptar a edad, embarazo, patología, cultura, economía, preferencias y función.</small></li><li><span>05 · VARIEDAD</span><strong>¿Qué rota durante la semana?</strong><small>Introducir gradualmente alimentos distintos dentro y entre grupos.</small></li><li><span>06 · INTERVENCIÓN</span><strong>Negociar cambios posibles</strong><small>Priorizar uno o dos objetivos sostenibles, verificar comprensión y reevaluar.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 10 IDEAS',
      title: 'Leyes de la alimentación en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Alimentación es la elección e ingestión voluntaria; nutrición reúne procesos fisiológicos posteriores.</li><li>Dieta significa patrón habitual, no necesariamente plan hipocalórico.</li><li>Cantidad busca cubrir necesidades sin carencia ni exceso.</li><li>Calidad exige nutrientes, no solo calorías.</li><li>Armonía evalúa la proporción entre grupos y nutrientes.</li><li>Adecuación adapta el plan a la persona y a su contexto.</li><li>Variedad amplía la diversidad semanal y evita monotonía.</li><li>El plato saludable es una guía visual, no una receta universal.</li><li>Enriquecido suele describir reposición; fortificado, adición deliberada, pero la norma local puede superponer ambos términos.</li><li>La intervención útil es gradual, negociada y clínicamente reevaluada.</li></ul>'
    },
    paciente: {
      eyebrow: 'PREGUNTAS IMPORTANTES AL PACIENTE',
      title: 'Cómo evaluar sin limitarte a “¿come bien?”',
      duration: '3 min',
      html: '<ul class="preview-list"><li><strong>Rutina:</strong> ¿qué comió y bebió ayer, a qué hora y en qué cantidad?</li><li><strong>Cantidad:</strong> ¿cambió el apetito, el peso o la actividad?</li><li><strong>Calidad:</strong> ¿hay proteína, frutas, verduras, legumbres, agua y fuentes de grasa?</li><li><strong>Armonía:</strong> ¿qué grupo predomina y cuál falta?</li><li><strong>Variedad:</strong> ¿cuántos alimentos diferentes rota durante la semana?</li><li><strong>Adecuación:</strong> ¿existen embarazo, enfermedad, disfagia, problemas dentales o medicación relevante?</li><li><strong>Contexto:</strong> ¿qué puede comprar, cocinar, conservar y aceptar?</li><li><strong>Significado:</strong> ¿qué alimentos generan placer, memoria o sensación de control?</li><li><strong>Meta:</strong> ¿qué cambio concreto está dispuesto a intentar?</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde aplicándolo a un paciente',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Cuál es la diferencia entre alimentación, nutrición y dieta?</li><li>¿Qué evalúa cada una de las cuatro leyes de Escudero?</li><li>¿Por qué una dieta puede cubrir calorías y aun ser de mala calidad?</li><li>¿Qué significa armonía y cómo se representa con la técnica del plato?</li><li>¿Qué datos del paciente determinan la adecuación?</li><li>¿Por qué la variedad se evalúa mejor a lo largo de la semana?</li><li>¿Qué funciones predominantes tienen alimentos energéticos, constructores y reguladores?</li><li>¿Cuál es la diferencia didáctica entre enriquecido, fortificado y biofortificado?</li><li>¿Cómo analizarías una dieta basada en café azucarado y pan?</li><li>¿Cuáles son los dos temas y qué hay que entregar en el seminario de la próxima semana?</li></ol>'
    }
  };

  var microTheoryPreviews = {
    completo: {
      eyebrow: 'RESUMEN COMPLETO · FECHA POR CONFIRMAR',
      title: 'De la queratina al diagnóstico y tratamiento',
      duration: '15 min',
      html: '<ol class="study-map"><li><span>01 · CLASIFICAR</span><strong>Nivel de afectación</strong><small>Superficial, cutáneo o profundo según tejido invadido, agente y respuesta.</small></li><li><span>02 · LOCALIZAR</span><strong>Nombrar la tiña</strong><small>Capitis, barbae, corporis, cruris, pedis, manuum o unguium.</small></li><li><span>03 · EXPOSICIÓN</span><strong>Buscar el reservorio</strong><small>Antropofílico, zoofílico o geofílico; preguntar por fómites y animales.</small></li><li><span>04 · CONFIRMAR</span><strong>KOH + cultivo</strong><small>La microscopía confirma elementos fúngicos; el cultivo ayuda a identificar el agente.</small></li><li><span>05 · TRATAR</span><strong>La localización manda</strong><small>Piel limitada suele admitir tópico; pelo, uña o enfermedad extensa puede requerir vía sistémica.</small></li><li><span>06 · PREVENIR</span><strong>Controlar exposición</strong><small>No compartir fómites y evaluar animales infectados sin olvidar adherencia.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 10 IDEAS',
      title: 'Dermatofitosis en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Los dermatofitos colonizan tejidos queratinizados: piel, pelo y uñas.</li><li>Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.</li><li>Trichophyton puede afectar piel, pelo y uñas; Microsporum, piel y pelo; Epidermophyton, piel y uñas.</li><li>La transmisión puede ser antropofílica, zoofílica o geofílica, además de fómites.</li><li>La tiña se nombra por el sitio anatómico afectado.</li><li>Tinea capitis y tiña del cuero cabelludo son el mismo diagnóstico.</li><li>Un querion es una forma inflamatoria de tiña capitis y puede dejar alopecia cicatricial.</li><li>El KOH muestra hifas o artroconidios, pero no identifica por sí solo la especie.</li><li>La lámpara de Wood solo ayuda en especies fluorescentes seleccionadas.</li><li>La piel localizada suele tratarse tópicamente; la tiña capitis necesita tratamiento sistémico.</li></ul>'
    },
    sitios: {
      eyebrow: 'TIÑAS POR ZONA DEL CUERPO',
      title: 'Una palabra para cada localización',
      duration: '3 min',
      html: '<ul class="preview-list"><li><strong>Capitis:</strong> cuero cabelludo y pelo; pelos rotos, escamas, placas alopécicas o querion.</li><li><strong>Barbae:</strong> barba y bigote; compromiso folicular frecuente.</li><li><strong>Corporis:</strong> tronco y extremidades; placa anular descamativa.</li><li><strong>Cruris:</strong> ingle y muslo proximal.</li><li><strong>Pedis:</strong> pie, sobre todo espacios interdigitales o planta.</li><li><strong>Manuum:</strong> mano.</li><li><strong>Unguium:</strong> uña por dermatofito; es un subtipo de onicomicosis.</li><li><strong>Faciei:</strong> piel glabra de la cara.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde y descarta las otras opciones',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Qué diferencia una micosis superficial de una dermatofitosis?</li><li>¿Qué significan queratinofílico y queratinolítico?</li><li>¿Cuáles son los tres géneros dermatofitos y qué tejidos infecta cada uno?</li><li>¿Qué significan antropofílico, zoofílico y geofílico?</li><li>¿Cómo se nombra una tiña según su localización?</li><li>¿Qué datos hacen pensar en tiña capitis inflamatoria o querion?</li><li>¿Qué muestra se toma y qué aporta el examen con KOH?</li><li>¿Cuándo puede ayudar la lámpara de Wood?</li><li>¿Por qué la tiña capitis no se trata solo con crema o champú?</li><li>¿Qué debes preparar sobre esporotricosis, cromoblastomicosis y eumicetoma?</li></ol>'
    }
  };

  var microPreviews = {
    completo: {
      eyebrow: 'RESUMEN DE LA PRÁCTICA · GRUPO 3',
      title: 'Del alimento al reconocimiento microscópico',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · MUESTRA</span><strong>Alimento sólido con moho</strong><small>Preferir pan duro; transportarlo cerrado y abrirlo solo bajo indicación docente.</small></li><li><span>02 · CULTIVO</span><strong>Agar dextrosa Sabouraud</strong><small>Peptonas, glucosa, agar y pH ácido favorecen el crecimiento fúngico.</small></li><li><span>03 · COLONIA</span><strong>Observar la forma macroscópica</strong><small>Registrar textura, relieve, color y aspecto sin oler ni agitar el cultivo.</small></li><li><span>04 · MICROSCOPIO</span><strong>Reconocer estructuras</strong><small>Distinguir gemación, hifas, micelio, conidios, esporangios y rizoides.</small></li><li><span>05 · INTERPRETACIÓN</span><strong>Levadura, moho o dimórfico</strong><small>Integrar organización celular, morfología y condiciones de crecimiento.</small></li><li><span>06 · CIERRE</span><strong>Desecho seguro</strong><small>Mantener y eliminar la muestra según el protocolo institucional.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'RESUMEN RÁPIDO · 8 IDEAS',
      title: 'Hongos y Sabouraud en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Las levaduras son principalmente unicelulares y suelen reproducirse por gemación.</li><li>Los mohos son filamentosos: sus hifas forman un micelio.</li><li>Un hongo dimórfico cambia de forma según las condiciones; la temperatura es una señal frecuente, no una regla absoluta.</li><li>Los conidios son esporas asexuales externas sostenidas por conidióforos.</li><li>El esporangio es un saco de esporas sostenido por un esporangióforo.</li><li>El agar Sabouraud aporta peptonas, glucosa y agar, con un pH ácido cercano a 5,6.</li><li>La fórmula y la esterilización se ejecutan según el fabricante y el protocolo del laboratorio.</li><li>Una colonia visible orienta, pero no identifica por sí sola una especie.</li></ul>'
    },
    checklist: {
      eyebrow: 'QUÉ LLEVAR · PRÓXIMA PRÁCTICA',
      title: 'Muestra preparada sin riesgo innecesario',
      duration: '1 min',
      html: '<ul class="preview-list"><li><strong>Elegir:</strong> pan duro con crecimiento visible; como alternativa, una fruta o queso aún sólidos.</li><li><strong>Evitar:</strong> alimentos totalmente líquidos, deshechos o con derrames.</li><li><strong>Cerrar:</strong> colocar la muestra en un recipiente o bolsa resistente y sellada.</li><li><strong>Identificar:</strong> escribir nombre y tipo de muestra por fuera.</li><li><strong>Transportar:</strong> separada de alimentos, bebidas y objetos personales.</li><li><strong>No manipular:</strong> no abrir, oler, tocar ni agitar en casa.</li><li><strong>En el laboratorio:</strong> esperar la indicación docente y cumplir el protocolo de bioseguridad.</li></ul>'
    },
    oral: {
      eyebrow: 'PREGUNTAS PARA REPASAR',
      title: 'Responde antes de mirar al microscopio',
      duration: '10 preguntas',
      html: '<ol class="oral-list"><li>¿Cuál es la diferencia central entre una levadura y un moho?</li><li>¿Qué es una hifa y qué es un micelio?</li><li>¿Qué significa que un hongo sea dimórfico?</li><li>¿Cuál es la diferencia entre conidio y conidióforo?</li><li>¿Cuál es la diferencia entre esporangio y esporangióforo?</li><li>¿Qué función pueden cumplir los rizoides?</li><li>¿Qué componentes básicos tiene el agar dextrosa Sabouraud?</li><li>¿Por qué su pH ácido favorece el aislamiento de hongos?</li><li>¿Por qué la preparación debe seguir la etiqueta del fabricante?</li><li>¿Qué medidas de bioseguridad debes respetar con la muestra?</li></ol>'
    }
  };

  var oralAnswers = {
    bioquimica:[
      'La glucólisis transforma una glucosa en dos piruvatos para obtener energía e intermediarios metabólicos. Sus diez reacciones ocurren en el citosol.',
      'La fase preparatoria consume 2 ATP y divide la hexosa en dos triosas; al final quedan dos moléculas de gliceraldehído-3-fosfato.',
      'La aldolasa genera G3P y DHAP, y la triosa-fosfato isomerasa convierte el DHAP en otro G3P. Por eso cada reacción desde el paso 6 ocurre dos veces por glucosa.',
      'El balance neto es 2 piruvatos, 2 ATP netos, 2 NADH y 2 moléculas de agua por cada glucosa.',
      'Las enzimas de los pasos irreversibles son hexoquinasa o glucoquinasa, fosfofructoquinasa-1 y piruvato quinasa.',
      'La hexoquinasa está en la mayoría de los tejidos, tiene alta afinidad y se inhibe por G6P. La glucoquinasa predomina en hígado y célula beta, tiene mayor capacidad y no se inhibe por G6P.',
      'La vía no utiliza oxígeno como reactivo. Para continuar necesita regenerar NAD+, lo que puede lograrse por la cadena respiratoria o mediante formación de lactato.',
      'La lactato deshidrogenasa reduce piruvato a lactato y oxida NADH a NAD+. Ese NAD+ permite que continúe la reacción de la gliceraldehído-3-fosfato deshidrogenasa.'
    ],
    epidemiologia:[
      'La Atención Primaria de la Salud es una estrategia integral y el primer contacto accesible entre la población y el sistema, con participación comunitaria, continuidad, promoción, prevención, atención y rehabilitación.',
      'En 1978 se adoptó la Declaración de Alma-Ata. En Paraguay, la estrategia de APS mediante Equipos y Unidades de Salud de la Familia comenzó a implementarse en 2008.',
      'Grupo I: aparentemente sanos; Grupo II: personas con factores de riesgo; Grupo III: enfermos; Grupo IV: personas con discapacidad o secuelas que requieren seguimiento.',
      'Entre sus principios están equidad, accesibilidad, cobertura universal, participación comunitaria, trabajo multidisciplinario, continuidad e intersectorialidad.',
      'El significado concreto describe la forma operativa que adopta la APS dentro de un sistema. El abstracto expresa sus valores, como derecho a la salud, equidad y participación.',
      'Las cuatro dimensiones son persona, familia, comunidad y ambiente.',
      'Las etapas didácticas son formación, expansión, dispersión y contracción de la familia.',
      'Sectorizar es delimitar un territorio y asignar población y responsables. Sirve para conocer riesgos, recursos, barreras y planificar seguimiento y acciones.',
      'Se observan motivo de consulta, signos vitales, estado mental, dolor, perfusión, respiración y riesgo de deterioro para decidir la prioridad; no se establece todavía el diagnóstico definitivo.',
      'Una urgencia requiere atención pronta. Una emergencia amenaza de forma inmediata la vida o un órgano y exige estabilización sin demora.'
    ],
    fisiologia:[
      'El bucle incluye sensores o receptores, un centro integrador y efectores respiratorios.',
      'El GRD participa sobre todo en inspiración e integración sensorial; el GRV se recluta más en respiración forzada e incluye el generador de ritmo; el grupo pontino modula la transición entre inspiración y espiración.',
      'El complejo pre-Bötzinger se localiza en el bulbo ventrolateral, dentro de la región del GRV, y participa de forma esencial en la generación del ritmo respiratorio.',
      'Detectan principalmente el descenso del pH del líquido cefalorraquídeo producido cuando el CO2 atraviesa la barrera hematoencefálica y genera H+.',
      'Los cuerpos carotídeos están en la bifurcación carotídea y envían información por el IX par; los aórticos están en el arco aórtico y lo hacen por el X par.',
      'El estímulo hipóxico más importante es una disminución marcada de la PaO2 arterial, especialmente por debajo de aproximadamente 60 mmHg.',
      'La distensión pulmonar activa receptores que, por vía vagal, limitan la inspiración y favorecen el cambio a espiración para evitar sobredistensión.',
      'Al inicio intervienen comando central y señales propioceptivas de músculos y articulaciones; después se suman ajustes químicos y térmicos.',
      'Los receptores de estiramiento informan sobre distensión y limitan una inspiración excesiva; los receptores irritantes responden a partículas o sustancias nocivas y favorecen tos, broncoconstricción o cambios del patrón.',
      'El CO2 retenido forma ácido carbónico y aumenta H+, por lo que baja el pH y aparece acidosis respiratoria.'
    ],
    'fisiologia-2026-08-10':[
      'La ventilación mueve aire hasta los alvéolos; la difusión cruza la barrera alveolocapilar; la perfusión aporta sangre capilar; el transporte lleva los gases en la sangre.',
      'La difusión aumenta con el área, el gradiente de presión parcial y la solubilidad, y disminuye al aumentar el grosor de la barrera y el peso molecular.',
      'La barrera incluye la película de surfactante, el epitelio alveolar, membranas basales e intersticio, y el endotelio capilar.',
      'V/Q baja significa perfusión relativamente conservada con ventilación insuficiente; V/Q alta significa ventilación conservada con perfusión insuficiente.',
      'Ventilación y perfusión disminuyen hacia el ápice, pero la perfusión cae proporcionalmente más; por eso la V/Q apical es relativamente mayor.',
      'La mayor parte del O2 viaja unida de forma reversible a la hemoglobina; solo una pequeña fracción está disuelta y determina la PaO2.',
      'La mayor parte del CO2 se convierte en bicarbonato; el resto viaja como compuestos carbamino o disuelto.',
      'La P50 es la PO2 necesaria para alcanzar 50 % de saturación de hemoglobina y expresa su afinidad: una P50 mayor indica menor afinidad.',
      'El efecto Bohr es la reducción de afinidad de la hemoglobina por O2 cuando aumentan CO2 y H+, lo que favorece la descarga tisular.',
      'El efecto Haldane indica que la hemoglobina desoxigenada transporta mejor CO2 y H+; al oxigenarse en pulmón, facilita su liberación.'
    ],
    nutricion:[
      'Alimentación es la selección, preparación e ingesta voluntaria; nutrición son los procesos fisiológicos posteriores; dieta es el patrón habitual de alimentos y bebidas, sea terapéutico o no.',
      'Cantidad evalúa suficiencia; calidad, presencia de nutrientes; armonía, proporciones; y adecuación, adaptación a la persona. La variedad complementa el análisis a lo largo del tiempo.',
      'Porque alcanzar energía no garantiza proteínas, fibra, vitaminas, minerales ni una calidad adecuada de grasas y carbohidratos.',
      'Armonía es la relación equilibrada entre grupos y nutrientes. El plato la representa de forma educativa con aproximadamente medio plato de verduras/frutas y dos cuartos para proteínas y cereales o tubérculos, siempre con adaptación clínica.',
      'Edad, sexo, actividad, estado fisiológico, enfermedad, medicación, función, cultura, economía, disponibilidad, preferencias y capacidad para preparar y consumir alimentos.',
      'Una comida aislada no muestra la rotación habitual. Observar varios días permite saber qué alimentos y grupos se repiten, alternan o faltan.',
      'Los energéticos aportan sobre todo carbohidratos y grasas; los constructores, proteínas para síntesis y reparación; los reguladores, fibra, agua, vitaminas, minerales y compuestos bioactivos.',
      'Enriquecido suele referirse a reponer nutrientes perdidos; fortificado, a añadirlos deliberadamente; biofortificado, a aumentar el contenido durante el crecimiento del cultivo. La norma local puede superponer términos.',
      'Primero cuantificaría todo el día y el contexto. Luego revisaría calidad, proporciones, variedad y adecuación, y negociaría uno o dos cambios posibles en vez de concluir solo por ese desayuno.',
      'Los dos temas exactos aparecen al seleccionar el grupo. La entrega común es una presentación PowerPoint independiente para el Trabajo 1, otra para el Trabajo 2 y un informe breve para firma y sello.'
    ],
    'microbiologia-teorica':[
      'Una micosis superficial se limita a capas externas o al tallo piloso y suele causar poca inflamación. La dermatofitosis invade tejidos queratinizados —piel, pelo o uñas— mediante dermatofitos.',
      'Queratinofílico significa afinidad por la queratina; queratinolítico, capacidad de degradarla y utilizarla como nutriente.',
      'Trichophyton afecta piel, pelo y uñas; Microsporum, piel y pelo; Epidermophyton, piel y uñas.',
      'Antropofílico indica reservorio humano; zoofílico, animal; geofílico, suelo. El origen ayuda a comprender transmisión e intensidad inflamatoria.',
      'Se usa tinea seguida del sitio: capitis, barbae, corporis, cruris, pedis, manuum, unguium o faciei.',
      'Placas dolorosas y muy inflamadas, pústulas, costras, secreción, pelos rotos y alopecia orientan a querion, con riesgo de cicatriz.',
      'Se raspa el borde activo de piel, se toman pelos afectados o material ungueal. El KOH aclara la queratina y permite observar hifas o artroconidios.',
      'Puede apoyar cuando la especie produce fluorescencia, sobre todo en algunas infecciones por Microsporum. Una lámpara negativa no excluye la tiña.',
      'El hongo compromete tallo y folículo; los tópicos no alcanzan adecuadamente esa localización, por lo que suele requerirse tratamiento sistémico.',
      'Debes comparar vía de inoculación, lesión típica, agente y diagnóstico: cadena linfangítica en esporotricosis, cuerpos escleróticos en cromoblastomicosis y granos/fístulas en eumicetoma.'
    ],
    'microbiologia-practica':[
      'La levadura es principalmente unicelular y suele reproducirse por gemación; el moho crece como filamentos o hifas que forman un micelio.',
      'Una hifa es un filamento fúngico individual. El micelio es la red o conjunto de hifas.',
      'Significa que puede cambiar de forma según las condiciones ambientales; en hongos de importancia médica, la temperatura es una señal frecuente.',
      'El conidio es una espora asexual externa. El conidióforo es la estructura especializada que la produce o sostiene.',
      'El esporangio es un saco que contiene esporas; el esporangióforo es el tallo que lo sostiene.',
      'Los rizoides ayudan a fijar el hongo al sustrato y pueden participar en la absorción de nutrientes.',
      'Sus componentes básicos son peptonas, glucosa o dextrosa, agar y agua, con un pH ácido cercano a 5,6.',
      'El pH ácido limita parte del crecimiento bacteriano y favorece el aislamiento de muchos hongos, aunque no reemplaza la técnica aséptica.',
      'Porque la concentración y formulación cambian entre fabricantes y presentaciones; la etiqueta define gramos por litro, esterilización y aditivos.',
      'Transportar la muestra cerrada, identificada y separada de alimentos; no abrir, oler ni tocar en casa; manipularla solo con indicación docente y eliminarla según protocolo.'
    ]
  };

  var storageKey = 'med-nykuto-grupo3-plan-v416';
  var labStorageKey = 'med-nykuto-lab-group-v403';
  var bioPrepStorageKey = 'med-nykuto-bio-prep-v404';
  var epiPrepStorageKey = 'med-nykuto-epi-prep-v405';
  var microPrepStorageKey = 'med-nykuto-micro-prep-v407';
  var microTheoryPrepStorageKey = 'med-nykuto-micro-theory-prep-v409';
  var nutritionPrepStorageKey = 'med-nykuto-nutrition-prep-v410';
  var nutritionGroupStorageKey = 'med-nykuto-nutrition-seminar-group-v412';
  var signedAssignmentsStorageKey = 'med-nykuto-signed-assignments-v412';
  var toastTimer;

  var classSchedule = [
    {day:1,start:'07:00',end:'10:10',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:1,start:'10:10',end:'12:20',subject:'Microbiología II · Teórica',teacher:'Dr. Alexander Acuña'},
    {day:1,start:'15:00',end:'17:00',subject:'Bioética · plataforma',teacher:'Lic. Silvia Nuarte'},
    {day:3,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'},
    {day:3,start:'11:20',end:'13:20',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:4,start:'07:00',end:'09:40',subject:'Nutrición',teacher:'Lic. Johana Leguizamón'},
    {day:4,start:'09:40',end:'12:20',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:5,start:'07:00',end:'09:00',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:5,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'}
  ];

  var labSlots = {
    '1':{day:4,start:'14:00',end:'16:00',subject:'Microbiología II · Práctica',teacher:'Dra. Ruth Castillo',group:'Grupo 1'},
    '2':{day:4,start:'16:00',end:'18:00',subject:'Microbiología II · Práctica',teacher:'Dra. Ruth Castillo',group:'Grupo 2'},
    '3':{day:4,start:'18:00',end:'20:00',subject:'Microbiología II · Práctica',teacher:'Dra. Ruth Castillo',group:'Grupo 3'}
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
    subject:'Microbiología II · Práctica',
    scope:'personal-group-3',
    oralDate:null,
    receivedDate:'2026-08-14',
    estimatedClassDate:'2026-08-13',
    sourceMode:'single-class',
    estimatedPreparation:{date:'2026-08-20',start:'18:00',end:'20:00'}
  };

  var latestMicroTheoryTranscript = {
    subject:'Microbiología II · Teórica',
    scope:'class-4e',
    oralDate:null,
    receivedDate:'2026-08-14',
    estimatedClassDate:'2026-08-10',
    sourceMode:'single-class',
    topic:'Dermatofitosis y tiñas',
    estimatedPreparation:{date:'2026-08-17',start:'10:10',end:'12:20'},
    assignedTopics:['Esporotricosis linfocutánea','Cromoblastomicosis','Micetoma eumicótico']
  };

  var nutritionSeminarGroups = {
    '1':{
      presentation1:{code:'P1 (5)',title:'Guía Alimentaria para la Población Brasileña',detail:'Qué es, objetivos, estructura y características principales.'},
      presentation2:{code:'P2 (3)',title:'Región Nordeste de Brasil',detail:'Contexto cultural y 3 platos típicos.'}
    },
    '2':{
      presentation1:{code:'P1 (3)',title:'Mensajes/Guías 5 al 8 del Paraguay',detail:'Explicación y ejemplos prácticos.'},
      presentation2:{code:'P2 (4)',title:'Región Centro-Oeste de Brasil',detail:'Contexto cultural y 3 platos típicos.'}
    },
    '3':{
      presentation1:{code:'P1 (4)',title:'Mensajes/Guías 9 al 12 del Paraguay',detail:'Explicación y ejemplos prácticos.'},
      presentation2:{code:'P2 (5)',title:'Región Sudeste de Brasil',detail:'Contexto cultural y 3 platos típicos.'}
    },
    '4':{
      presentation1:{code:'P1 (2)',title:'Mensajes/Guías 1 al 4 del Paraguay',detail:'Explicación y ejemplos prácticos.'},
      presentation2:{code:'P2 (6)',title:'Región Sur de Brasil',detail:'Contexto cultural y 3 platos típicos.'}
    },
    '5':{
      presentation1:{code:'P1 (6)',title:'Guía Alimentaria para la Población Brasileña',detail:'Recomendaciones principales y aplicación práctica.'},
      presentation2:{code:'P2 (2)',title:'Región Norte de Brasil',detail:'Contexto cultural y 3 platos típicos.'}
    },
    '6':{
      presentation1:{code:'P1 (1)',title:'Guías Alimentarias del Paraguay',detail:'Qué son, objetivos, estructura general y representación gráfica.'},
      presentation2:{code:'P2 (1)',title:'Platos típicos del Paraguay',detail:'Presentación de platos típicos del país.'}
    }
  };

  var latestNutritionTranscript = {
    subject:'Nutrición',
    scope:'class-4e',
    oralDate:null,
    receivedDate:'2026-08-14',
    estimatedClassDate:'2026-08-13',
    sourceMode:'single-class',
    topic:'Leyes de la alimentación y clasificación funcional de alimentos',
    estimatedPreparation:{date:'2026-08-20',start:'07:00',end:'09:40'},
    assignment:{
      confirmed:true,
      source:'Tarea oficial · Semana 3 · 17–23 ago. 2026',
      groups:nutritionSeminarGroups,
      maxMinutesPerGroup:5,
      maxSlidesPerPresentation:4,
      deliverables:['Presentación PowerPoint independiente del Trabajo 1','Presentación PowerPoint independiente del Trabajo 2','Informe breve para firma y sello'],
      evaluation:{
        totalPoints:5,
        criteria:['Investigación bibliográfica','Calidad del informe escrito','Exposición oral','Plato típico o apoyo visual equivalente','Análisis nutricional y conclusiones']
      },
      important:'Son dos presentaciones diferentes; no es necesario relacionar las Guías Alimentarias con las regiones o los platos típicos en una misma exposición.'
    }
  };

  function answerDisclosure(step,title,hint,kind,answer){
    var disclosure = document.createElement('details');
    disclosure.className = 'preview-answer-disclosure';
    var summary = document.createElement('summary');
    if(step){
      var stepNode = document.createElement('span');
      stepNode.textContent = step;
      summary.appendChild(stepNode);
    }
    var titleNode = document.createElement('strong');
    titleNode.textContent = title;
    summary.appendChild(titleNode);
    var hintNode = document.createElement('small');
    hintNode.className = 'preview-answer-hint';
    hintNode.textContent = localizeText(hint);
    summary.appendChild(hintNode);

    var answerNode = document.createElement('div');
    answerNode.className = 'preview-answer-inline';
    answerNode.setAttribute('role','region');
    answerNode.setAttribute('aria-label',localizeText(kind) + ' · ' + localizeText(title));
    var kindNode = document.createElement('span');
    kindNode.textContent = localizeText(kind);
    answerNode.appendChild(kindNode);
    var textNode = document.createElement('p');
    textNode.textContent = localizeText(answer);
    answerNode.appendChild(textNode);

    disclosure.appendChild(summary);
    disclosure.appendChild(answerNode);
    disclosure.addEventListener('toggle',function(){
      var closedLabel = hint === 'Ver explicación' ? 'Ocultar explicación' : 'Ocultar respuesta';
      hintNode.textContent = localizeText(disclosure.open ? closedLabel : hint);
    });
    return disclosure;
  }

  function enhanceStudyPreview(body,courseId,mode){
    if(!body) return;
    body.querySelectorAll('.study-map li').forEach(function(item){
      var step = item.querySelector('span');
      var title = item.querySelector('strong');
      var detail = item.querySelector('small');
      if(!title || !detail) return;
      var disclosure = answerDisclosure(step ? step.textContent.trim() : '',title.textContent.trim(),'Ver explicación','EXPLICACIÓN',detail.textContent.trim());
      item.innerHTML = '';
      item.classList.add('is-answer-card');
      item.appendChild(disclosure);
    });

    if(mode !== 'oral') return;
    var answers = oralAnswers[courseId] || [];
    body.querySelectorAll('.oral-list li').forEach(function(item,index){
      var question = item.textContent.trim();
      var answer = answers[index] || 'Revisa el mapa y la ficha rápida de este curso para construir la respuesta.';
      item.innerHTML = '';
      item.classList.add('is-answer-card');
      item.appendChild(answerDisclosure('',question,'Ver respuesta','RESPUESTA DEL REPASO',answer));
    });
  }

  function renderPreview(mode){
    var data = previews[mode] || previews.completo;
    document.getElementById('studyPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('study-preview-title').textContent = data.title;
    document.getElementById('studyPreviewDuration').textContent = data.duration;
    document.getElementById('studyPreviewBody').innerHTML = data.html;
    enhanceStudyPreview(document.getElementById('studyPreviewBody'),'bioquimica',mode);
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
    enhanceStudyPreview(document.getElementById('epiPreviewBody'),'epidemiologia',mode);
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
    enhanceStudyPreview(document.getElementById('fisioPreviewBody'),'fisiologia',mode);
    document.querySelectorAll('[data-fisio-mode]').forEach(function(button){
      var active = button.dataset.fisioMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderFisioGasPreview(mode){
    var data = fisioGasPreviews[mode] || fisioGasPreviews.completo;
    document.getElementById('fisioGasPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('fisio-gas-preview-title').textContent = data.title;
    document.getElementById('fisioGasPreviewDuration').textContent = data.duration;
    document.getElementById('fisioGasPreviewBody').innerHTML = data.html;
    enhanceStudyPreview(document.getElementById('fisioGasPreviewBody'),'fisiologia-2026-08-10',mode);
    document.querySelectorAll('[data-fisio-gas-mode]').forEach(function(button){
      var active = button.dataset.fisioGasMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderNutritionPreview(mode){
    var data = nutritionPreviews[mode] || nutritionPreviews.completo;
    document.getElementById('nutritionPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('nutrition-preview-title').textContent = data.title;
    document.getElementById('nutritionPreviewDuration').textContent = data.duration;
    document.getElementById('nutritionPreviewBody').innerHTML = data.html;
    enhanceStudyPreview(document.getElementById('nutritionPreviewBody'),'nutricion',mode);
    document.querySelectorAll('[data-nutrition-mode]').forEach(function(button){
      var active = button.dataset.nutritionMode === mode;
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
    enhanceStudyPreview(document.getElementById('microPreviewBody'),'microbiologia-practica',mode);
    document.querySelectorAll('[data-micro-mode]').forEach(function(button){
      var active = button.dataset.microMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderMicroTheoryPreview(mode){
    var data = microTheoryPreviews[mode] || microTheoryPreviews.completo;
    document.getElementById('microTheoryPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('micro-theory-preview-title').textContent = data.title;
    document.getElementById('microTheoryPreviewDuration').textContent = data.duration;
    document.getElementById('microTheoryPreviewBody').innerHTML = data.html;
    enhanceStudyPreview(document.getElementById('microTheoryPreviewBody'),'microbiologia-teorica',mode);
    document.querySelectorAll('[data-micro-theory-mode]').forEach(function(button){
      var active = button.dataset.microTheoryMode === mode;
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

  function readNutritionGroup(){
    try{return localStorage.getItem(nutritionGroupStorageKey) || '';}catch(error){return '';}
  }

  function nutritionGroupMarkup(groupId){
    var group = nutritionSeminarGroups[groupId];
    var portuguese = classLang() === 'br';
    if(!group) return '<p>' + (portuguese ? 'Selecione do Grupo 1 ao Grupo 6 para mostrar seus dois temas.' : 'Selecciona del Grupo 1 al Grupo 6 para mostrar tus dos temas.') + '</p>';
    return '<div class="nutrition-group-result-head"><span>GRUPO ' + groupId + '</span><strong>' + (portuguese ? 'Duas apresentações PowerPoint independentes' : 'Dos presentaciones PowerPoint independientes') + '</strong></div>' +
      '<article><span>' + (portuguese ? 'TRABALHO' : 'TRABAJO') + ' 1 · ' + group.presentation1.code + '</span><strong>' + group.presentation1.title + '</strong><small>' + group.presentation1.detail + '</small></article>' +
      '<article><span>' + (portuguese ? 'TRABALHO' : 'TRABAJO') + ' 2 · ' + group.presentation2.code + '</span><strong>' + group.presentation2.title + '</strong><small>' + group.presentation2.detail + '</small></article>';
  }

  function renderNutritionGroup(groupId){
    document.querySelectorAll('[data-nutrition-group-select]').forEach(function(select){select.value = nutritionSeminarGroups[groupId] ? groupId : '';});
    document.querySelectorAll('[data-nutrition-group-output]').forEach(function(output){output.innerHTML = nutritionGroupMarkup(groupId);});
    var planStep = document.querySelector('#studyChecklist input[value="nutrition-group"]');
    if(planStep && nutritionSeminarGroups[groupId] && !planStep.checked){
      planStep.checked = true;
      savePlan();
    }
    document.querySelectorAll('[data-nutrition-group-output]').forEach(function(output){refreshLanguage(output);});
  }

  function restoreNutritionGroup(){
    var saved = readNutritionGroup();
    renderNutritionGroup(saved);
    document.querySelectorAll('[data-nutrition-group-select]').forEach(function(select){
      select.addEventListener('change',function(){
        var groupId = select.value;
        try{
          if(nutritionSeminarGroups[groupId]) localStorage.setItem(nutritionGroupStorageKey,groupId);
          else localStorage.removeItem(nutritionGroupStorageKey);
        }catch(error){}
        renderNutritionGroup(groupId);
        if(nutritionSeminarGroups[groupId]) showToast(tr('groupSaved',{group:groupId}));
      });
    });
  }

  function readSignedAssignments(){
    try{
      var saved = JSON.parse(localStorage.getItem(signedAssignmentsStorageKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    }catch(error){return [];}
  }

  function updateSignedAssignments(){
    var inputs = Array.from(document.querySelectorAll('[data-signed-assignment]'));
    var signed = inputs.filter(function(input){return input.checked;});
    var count = document.getElementById('signedAssignmentCount');
    if(count) count.textContent = tr('signedCount',{signed:signed.length,total:inputs.length});
    inputs.forEach(function(input){
      var key = input.dataset.signedAssignment;
      document.querySelectorAll('[data-signed-mirror="' + key + '"]').forEach(function(mirror){
        mirror.textContent = input.checked ? tr('signed') : tr('unsigned');
        mirror.classList.toggle('is-signed',input.checked);
      });
    });
  }

  function saveSignedAssignments(){
    var signed = Array.from(document.querySelectorAll('[data-signed-assignment]:checked')).map(function(input){return input.dataset.signedAssignment;});
    try{localStorage.setItem(signedAssignmentsStorageKey,JSON.stringify(signed));}catch(error){}
    updateSignedAssignments();
  }

  function restoreSignedAssignments(){
    var saved = readSignedAssignments();
    document.querySelectorAll('[data-signed-assignment]').forEach(function(input){
      input.checked = saved.indexOf(input.dataset.signedAssignment) !== -1;
      input.addEventListener('change',saveSignedAssignments);
    });
    updateSignedAssignments();
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
    if(!node) return;
    try{
      var updatedAt = new Date(node.getAttribute('datetime'));
      if(Number.isNaN(updatedAt.getTime())) throw new Error('Invalid update timestamp');
      var locale = classI18n && classI18n.getLocale ? classI18n.getLocale() : 'es-PY';
      var dateLabel = new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',timeZone:'America/Asuncion'}).format(updatedAt);
      var timeLabel = new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'America/Asuncion'}).format(updatedAt);
      node.textContent = tr('updated',{date:dateLabel,time:timeLabel});
    }catch(error){node.textContent = tr('updatedFallback');}
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
    if(!occurrence) return tr('noNextDate');
    var locale = classI18n && classI18n.getLocale ? classI18n.getLocale() : 'es-PY';
    var dateLabel = new Intl.DateTimeFormat(locale,{
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
    }) + ' · ' + tr('toConfirm');
  }

  function formatHomePreparation(preparation){
    var parts = preparation.date.split('-').map(Number);
    var date = new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
    var locale = classI18n && classI18n.getLocale ? classI18n.getLocale() : 'es-PY';
    var label = new Intl.DateTimeFormat(locale,{
      weekday:'short',day:'numeric',month:'short',timeZone:'UTC'
    }).format(date);
    label = label.charAt(0).toUpperCase() + label.slice(1);
    return label + ' · ' + tr('estimated');
  }

  function mondayOfWeek(date){
    var weekday = date.getUTCDay();
    var daysSinceMonday = (weekday + 6) % 7;
    return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate() - daysSinceMonday));
  }

  function renderScheduleWeekDates(nextDate){
    var now = getParaguayWallClock();
    var monday = mondayOfWeek(now);
    var sunday = new Date(monday.getTime() + (6 * 86400000));
    if(nextDate && nextDate.getTime() > sunday.getTime()){
      monday = mondayOfWeek(nextDate);
      sunday = new Date(monday.getTime() + (6 * 86400000));
    }
    var locale = classI18n && classI18n.getLocale ? classI18n.getLocale() : 'es-PY';
    var compact = new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',timeZone:'UTC'});
    var longDate = new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
    document.querySelectorAll('[data-week-date]').forEach(function(node){
      var day = Number(node.dataset.weekDate);
      var date = new Date(monday.getTime() + ((day - 1) * 86400000));
      node.dateTime = date.toISOString().slice(0,10);
      node.textContent = compact.format(date);
    });
    var range = document.getElementById('scheduleWeekRange');
    if(range) range.textContent = tr('scheduleWeek',{start:compact.format(monday),end:longDate.format(sunday)});
  }

  function renderHomePreparation(nodeId,preparation){
    var node = document.getElementById(nodeId);
    node.dateTime = preparation.date;
    node.textContent = formatHomePreparation(preparation);
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
      document.getElementById('nextScheduleSubject').textContent = localizeText(next.item.subject);
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
      groupNode.textContent = tr('selectGroup');
      nextLabNode.textContent = tr('selectGroup');
    }

    document.getElementById('bioEstimatedDate').textContent = formatEstimatedPreparation(latestTranscript.estimatedPreparation);
    document.getElementById('epiEstimatedDate').textContent = formatEstimatedPreparation(latestEpiTranscript.estimatedPreparation);
    document.getElementById('microEstimatedDate').textContent = formatEstimatedPreparation(latestMicroTranscript.estimatedPreparation);
    document.getElementById('microTheoryEstimatedDate').textContent = formatEstimatedPreparation(latestMicroTheoryTranscript.estimatedPreparation);
    document.getElementById('nutritionEstimatedDate').textContent = formatEstimatedPreparation(latestNutritionTranscript.estimatedPreparation);
    renderHomePreparation('homeMicroTheoryDate',latestMicroTheoryTranscript.estimatedPreparation);
    renderHomePreparation('homeNutritionDate',latestNutritionTranscript.estimatedPreparation);
    renderHomePreparation('homeBioDate',latestTranscript.estimatedPreparation);
    renderScheduleWeekDates(next && next.date);
    refreshLanguage(document.getElementById('horario'));
    refreshLanguage(document.getElementById('inicio'));
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
      if(select.value) showToast(tr('savedGroup'));
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

    var microTheoryPrep = document.getElementById('microTheoryPrepDone');
    try{microTheoryPrep.checked = localStorage.getItem(microTheoryPrepStorageKey) === '1';}catch(error){}
    document.getElementById('microTheoryPrepCard').classList.toggle('is-complete',microTheoryPrep.checked);
    microTheoryPrep.addEventListener('change',function(){
      try{localStorage.setItem(microTheoryPrepStorageKey,microTheoryPrep.checked ? '1' : '0');}catch(error){}
      document.getElementById('microTheoryPrepCard').classList.toggle('is-complete',microTheoryPrep.checked);
    });

    var nutritionPrep = document.getElementById('nutritionPrepDone');
    try{nutritionPrep.checked = localStorage.getItem(nutritionPrepStorageKey) === '1';}catch(error){}
    document.getElementById('nutritionPrepCard').classList.toggle('is-complete',nutritionPrep.checked);
    nutritionPrep.addEventListener('change',function(){
      try{localStorage.setItem(nutritionPrepStorageKey,nutritionPrep.checked ? '1' : '0');}catch(error){}
      document.getElementById('nutritionPrepCard').classList.toggle('is-complete',nutritionPrep.checked);
    });
    renderSchedule();
  }

  var courseIds = ['nutricion','fisiologia','bioquimica','epidemiologia','microbiologia-teorica','microbiologia-practica'];
  var activeCourseId = 'nutricion';
  var activeLessonByCourse = {fisiologia:'fisiologia-2026-08-13'};
  var datedLessonMeta = {
    'fisiologia-2026-08-13':{
      title:'Control nervioso y químico de la respiración',
      kicker:'Fisiología II · clase del 13 de agosto',
      description:'Sesión del jueves 13 de agosto de 2026: centros respiratorios, sensores, respuesta ventilatoria y aplicación clínica.',
      status:'Fecha oral interpretada · 13 ago.',
      statusClass:'status-estimated'
    },
    'fisiologia-2026-08-10':{
      title:'Difusión y transporte de gases',
      kicker:'Fisiología II · clase del 10 de agosto',
      description:'Sesión estimada del lunes 10 de agosto de 2026: barrera alveolocapilar, relación V/Q y transporte sanguíneo de O₂ y CO₂.',
      status:'Fecha estimada · 10 ago. · confirmar',
      statusClass:'status-estimated'
    }
  };

  function activateDatedLesson(lessonId){
    var panel = document.getElementById(lessonId);
    if(!panel || !panel.hasAttribute('data-lesson-panel')) return;
    var subject = panel.closest('.subject-section');
    if(!subject) return;
    activeLessonByCourse[subject.id] = lessonId;
    subject.querySelectorAll('[data-lesson-panel]').forEach(function(item){
      item.hidden = item.id !== lessonId;
    });
    subject.querySelectorAll('[data-lesson-target]').forEach(function(link){
      var active = link.dataset.lessonTarget === lessonId;
      link.classList.toggle('history-current',active);
      link.setAttribute('aria-current',active ? 'true' : 'false');
      var state = link.querySelector(':scope > span:last-child');
      if(state) state.textContent = active ? tr('selectedLesson') : tr('openLesson');
    });
    var meta = datedLessonMeta[lessonId];
    if(!meta) return;
    var heading = subject.querySelector('.subject-heading');
    var title = heading && heading.querySelector('h2');
    var kicker = heading && heading.querySelector('.section-kicker');
    var description = heading && heading.querySelector(':scope > div > p:last-child');
    var status = heading && heading.querySelector('.source-pill');
    if(title) title.textContent = localizeText(meta.title);
    if(kicker) kicker.textContent = localizeText(meta.kicker);
    if(description) description.textContent = localizeText(meta.description);
    if(status){
      status.textContent = localizeText(meta.status);
      status.className = 'source-pill ' + meta.statusClass;
    }
    refreshLanguage(subject);
  }

  function setCourseDetail(detail, expanded){
    if(!detail) return;
    detail.hidden = !expanded;
    var button = document.querySelector('[data-detail-toggle][aria-controls="' + detail.id + '"]');
    if(!button) return;
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    var label = button.querySelector('strong');
    if(label) label.textContent = expanded ? tr('closeDetail') : tr('openDetail');
  }

  function activateCourse(courseId){
    if(courseIds.indexOf(courseId) === -1) courseId = activeCourseId;
    activeCourseId = courseId;
    document.querySelectorAll('.subject-section[data-view="cursos"]').forEach(function(section){
      section.hidden = section.id !== courseId;
    });
    document.querySelectorAll('[data-course-target]').forEach(function(link){
      var active = link.dataset.courseTarget === courseId;
      link.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function activateView(view, courseId){
    var validViews = ['inicio','horario','pendientes','cursos','plan','dudas'];
    if(validViews.indexOf(view) === -1) view = 'inicio';

    document.querySelectorAll('[data-view]').forEach(function(panel){
      panel.hidden = panel.dataset.view !== view;
    });

    if(view === 'cursos'){
      var courseHub = document.getElementById('materias');
      if(courseHub) courseHub.hidden = false;
      activateCourse(courseId || activeCourseId);
    }

    document.querySelectorAll('[data-view-link]').forEach(function(link){
      var active = link.dataset.viewLink === view;
      if(active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.body.dataset.activeView = view;
  }

  function routeFromHash(shouldScroll){
    var hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : 'inicio';
    var target = document.getElementById(hashId);
    var subject = target && (target.classList.contains('subject-section') ? target : target.closest('.subject-section'));
    var viewPanel = target && (target.hasAttribute('data-view') ? target : target.closest('[data-view]'));
    var view = subject ? 'cursos' : (viewPanel ? viewPanel.dataset.view : 'inicio');

    activateView(view, subject ? subject.id : null);

    if(subject){
      var lessonPanel = target && (target.hasAttribute('data-lesson-panel') ? target : target.closest('[data-lesson-panel]'));
      if(lessonPanel) activateDatedLesson(lessonPanel.id);
      else if(activeLessonByCourse[subject.id]) activateDatedLesson(activeLessonByCourse[subject.id]);
    }

    if(target){
      var detail = target.hasAttribute('data-course-detail') ? target : target.closest('[data-course-detail]');
      if(detail) setCourseDetail(detail,true);
      var assignmentHistory = target.matches('[data-assignment-history]') ? target : target.closest('[data-assignment-history]');
      if(assignmentHistory){
        assignmentHistory.open = true;
        var archiveSubject = assignmentHistory.closest('[data-archive-subject]');
        if(archiveSubject) archiveSubject.open = true;
      }
    }

    if(shouldScroll && target){
      window.requestAnimationFrame(function(){target.scrollIntoView({behavior:'auto',block:'start'});});
    }else if(!window.location.hash){
      window.scrollTo(0,0);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderPreview('completo');
    renderEpiPreview('completo');
    renderFisioPreview('completo');
    renderFisioGasPreview('completo');
    renderNutritionPreview('completo');
    renderMicroTheoryPreview('completo');
    renderMicroPreview('completo');
    restorePlan();
    restorePersonalSchedule();
    restoreNutritionGroup();
    restoreSignedAssignments();
    setUpdatedDate();

    document.querySelectorAll('[data-detail-toggle]').forEach(function(button){
      button.addEventListener('click',function(){
        var detail = document.getElementById(button.getAttribute('aria-controls'));
        var expanded = button.getAttribute('aria-expanded') === 'true';
        setCourseDetail(detail,!expanded);
      });
    });

    routeFromHash(Boolean(window.location.hash));
    window.addEventListener('hashchange',function(){routeFromHash(true);});

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

    document.querySelectorAll('[data-fisio-gas-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderFisioGasPreview(button.dataset.fisioGasMode);
        document.getElementById('fisio-gas-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-nutrition-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderNutritionPreview(button.dataset.nutritionMode);
        document.getElementById('nutrition-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-micro-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderMicroPreview(button.dataset.microMode);
        document.getElementById('micro-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-micro-theory-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderMicroTheoryPreview(button.dataset.microTheoryMode);
        document.getElementById('micro-theory-repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.getElementById('studyChecklist').addEventListener('change', savePlan);

    document.getElementById('delegateQuestionForm').addEventListener('submit', function(event){
      event.preventDefault();
      var subject = document.getElementById('questionSubject').value.trim();
      var question = document.getElementById('questionText').value.trim();
      if(!question) return;
      var message = tr('questionMessage',{subject:subject,question:question});
      copyText(message).then(function(){showToast(tr('copied'));}).catch(function(){showToast(tr('copyFailed'));});
    });

    refreshLanguage(document.body);
  });

  window.MED_NYKUTO_CLASS_SCHEDULE = classSchedule.slice();
  window.MED_NYKUTO_NUTRITION_SEMINAR_GROUPS = Object.assign({},nutritionSeminarGroups);
  window.MED_NYKUTO_LATEST_TRANSCRIPT = Object.assign({},latestNutritionTranscript);
  window.MED_NYKUTO_LATEST_TRANSCRIPTS = {
    bioquimica:Object.assign({},latestTranscript),
    epidemiologia:Object.assign({},latestEpiTranscript),
    fisiologia:Object.assign({},latestFisioTranscript),
    nutricion:Object.assign({},latestNutritionTranscript),
    microbiologiaTeorica:Object.assign({},latestMicroTheoryTranscript),
    microbiologiaPractica:Object.assign({},latestMicroTranscript)
  };
  window.MED_NYKUTO_TRANSCRIPTION_RULES = {
    legacyCumulative:'Cada fecha oral inicia un nuevo bloque y el tramo final es siempre la clase más reciente.',
    newTranscripts:'Una transcripción nueva corresponde a una sola clase.',
    missingLatestDate:'El último bloque queda por confirmar y no hereda una fecha anterior.'
  };
})();
