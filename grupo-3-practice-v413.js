(function(){
  'use strict';

  function q(prompt,options,answer,explanation){
    return {prompt:prompt,options:options,answer:answer,explanation:explanation};
  }

  function vf(prompt,answer,explanation){
    return {prompt:prompt,options:['Verdadero','Falso'],answer:answer ? 0 : 1,explanation:explanation};
  }

  function clinical(scenario,prompt,options,answer,explanation){
    return {scenario:scenario,prompt:prompt,options:options,answer:answer,explanation:explanation};
  }

  var banks = {
    nutricion:{
      courseId:'nutricion',
      title:'Leyes de la alimentación',
      icon:'class-icon-nutrition',
      description:'Cantidad, calidad, armonía, adecuación, variedad y aplicación clínica.',
      sources:[
        {label:'OMS · Alimentación saludable',url:'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'}
      ],
      qcm:[
        q('¿Cuál opción diferencia correctamente alimentación, nutrición y dieta?',[
          'La alimentación es involuntaria, la nutrición es voluntaria y la dieta solo existe cuando se busca perder peso.',
          'Alimentación: elección e ingesta; nutrición: procesos fisiológicos; dieta: patrón habitual.',
          'La nutrición y la dieta son sinónimos, mientras que la alimentación se limita a contar calorías.',
          'La dieta describe únicamente una prescripción terapéutica realizada por un nutricionista.'
        ],1,'La alimentación incluye actos voluntarios de selección e ingestión; la nutrición incluye digestión, absorción, metabolismo y utilización; dieta es el patrón habitual, con o sin objetivo terapéutico.'),
        q('Un paciente cubre sus calorías diarias casi exclusivamente con bebidas azucaradas y pan blanco. ¿Qué ley está más claramente comprometida?',[
          'Cantidad, porque toda ingesta calórica es insuficiente.',
          'Adecuación, porque ninguna persona puede consumir pan.',
          'Calidad, porque las calorías no garantizan nutrientes ni fibra.',
          'Variedad, pero solo si repite el mismo desayuno dos días seguidos.'
        ],2,'Cubrir energía no garantiza proteínas, micronutrientes, fibra ni calidad de grasas y carbohidratos. Por eso la calidad puede fallar aun con cantidad energética suficiente.'),
        q('¿Qué dato pesa más al evaluar la adecuación de una alimentación?',[
          'El color predominante del plato.',
          'La popularidad de la dieta en redes sociales.',
          'La cantidad de recetas diferentes en un mes.',
          'Edad, estado clínico y contexto personal.'
        ],3,'La adecuación responde a “¿para quién?”. Integra necesidades biológicas, situación clínica, acceso, cultura, preferencias y posibilidades reales.'),
        q('En la técnica educativa del plato, ¿qué interpretación es la más correcta?',[
          'Una guía visual adaptable, no una prescripción universal.',
          'Obliga a que toda persona consuma exactamente la misma cantidad de cada grupo.',
          'Sustituye la historia clínica y el cálculo nutricional individual.',
          'Prohíbe raíces, arroz, mandioca y alimentos tradicionales.'
        ],0,'El plato ayuda a visualizar proporciones, pero debe adaptarse a edad, gasto, patología, cultura, disponibilidad y objetivo terapéutico.'),
        q('¿Por qué el jugo no equivale siempre a la fruta entera?',[
          'Porque el jugo no contiene agua.',
          'Menos fibra y azúcares considerados libres.',
          'Porque la fruta entera carece de carbohidratos.',
          'Porque todo jugo bloquea la absorción de vitaminas.'
        ],1,'La fruta entera conserva mejor la matriz y la fibra. Incluso sin azúcar añadida, gran parte del azúcar del jugo se considera azúcar libre.'),
        q('¿Cuál afirmación sobre alimentos enriquecidos y fortificados es la más rigurosa?',[
          'Enriquecido siempre significa añadir un nutriente que nunca estuvo presente.',
          'Fortificado significa únicamente restaurar pérdidas por procesamiento.',
          'La distinción depende de la norma local.',
          'Los dos términos significan que el alimento es necesariamente saludable en cualquier cantidad.'
        ],2,'La terminología regulatoria se superpone entre países. Conviene identificar qué nutriente se añadió, en qué cantidad y con qué finalidad, en vez de memorizar una frontera universal.'),
        q('¿Cuáles son los cuatro principios centrales destacados por la OMS para una dieta saludable?',[
          'Adecuación, balance, moderación y diversidad.',
          'Ayuno, suplementación, restricción y cetosis.',
          'Cantidad, cocción, textura y temperatura.',
          'Proteína, grasa, vitamina C y agua.'
        ],0,'La OMS resume una dieta saludable en adecuación, balance, moderación y diversidad, además de seguridad alimentaria.'),
      ],
      vf:[
        vf('Si una dieta aporta las calorías necesarias, su calidad nutricional está automáticamente garantizada.',false,'La energía puede ser suficiente mientras faltan proteínas, fibra, vitaminas, minerales o grasas de buena calidad.'),
        vf('La variedad se aprecia mejor observando el patrón de varios días que una sola comida aislada.',true,'Una comida no representa toda la rotación semanal; la diversidad se evalúa dentro y entre grupos de alimentos a lo largo del tiempo.'),
        vf('La misma pauta alimentaria es adecuada para cualquier paciente si tiene proporciones “perfectas”.',false,'La adecuación cambia con edad, actividad, embarazo, enfermedad, función, economía, cultura y preferencias.'),
        vf('Las grasas dietarias son necesarias y ayudan a absorber las vitaminas A, D, E y K.',true,'Las grasas son nutrientes esenciales y facilitan la absorción de vitaminas liposolubles; importa priorizar fuentes y cantidades apropiadas.'),
      ],
      cases:[
        clinical('Una embarazada de 24 semanas perdió apetito, presenta náuseas y está ganando menos peso de lo esperado. Su alimentación se basa en lo que toleraba antes del embarazo.','¿Cuál es el primer enfoque nutricional más adecuado?',[
          'Mantener el mismo plan porque una dieta previa nunca debe cambiar.',
          'Indicar pérdida de peso para compensar la gestación.',
          'Valorar clínica e ingesta y adaptar con seguimiento.',
          'Eliminar todos los carbohidratos sin evaluar el resto de la dieta.'
        ],2,'La adecuación exige valorar la situación materno-fetal y las barreras actuales. La intervención debe individualizarse y reevaluarse, no imponer una regla universal.'),
        clinical('Un estudiante consume mandioca, arroz, porotos y carne porque son accesibles y culturalmente habituales. Quiere “comer mejor”, pero no puede comprar productos importados.','¿Qué consejo aplica mejor las leyes de la alimentación?',[
          'Eliminar todos los alimentos locales y sustituirlos por productos dietéticos.',
          'Reorganizar porciones y negociar cambios accesibles.',
          'Mantener todo igual porque la cultura impide cualquier modificación.',
          'Recomendar suplementos como sustituto permanente de los alimentos.'
        ],1,'La adecuación respeta cultura y economía. La armonía, calidad y variedad pueden mejorarse reorganizando alimentos disponibles y acordando cambios realistas.'),
      ]
    },
    epidemiologia:{
      courseId:'epidemiologia',
      title:'APS, sectorización y triage',
      icon:'class-icon-epidemiology',
      description:'Atención primaria, integralidad, familia, territorio y prioridad asistencial.',
      sources:[
        {label:'OPS · Atención Primaria de Salud',url:'https://www.paho.org/en/topics/primary-health-care'},
        {label:'OMS · Herramienta integrada de triage',url:'https://www.who.int/tools/triage'}
      ],
      qcm:[
        q('¿Qué definición describe mejor la Atención Primaria de la Salud?',[
          'Atención exclusiva de enfermedades leves sin participación comunitaria.',
          'Atención esencial, accesible, participativa y cercana.',
          'Conjunto de procedimientos disponibles solo en hospitales de alta complejidad.',
          'Programa temporal centrado únicamente en campañas de vacunación.'
        ],1,'La APS es el primer nivel de contacto y una estrategia integral del sistema, no solo atención básica de cuadros leves.'),
        q('¿En qué año se adoptó la Declaración de Alma-Ata?',[
          '1948.',
          '1968.',
          '1978.',
          '2008.'
        ],2,'La Declaración de Alma-Ata fue adoptada en 1978 y estableció la APS como clave para “salud para todos”.'),
        q('Según el contenido de la clase, ¿en qué año Paraguay implementó su estrategia de APS mediante ESF/USF?',[
          '1978.',
          '1994.',
          '2008.',
          '2020.'
        ],2,'La fecha destacada para Paraguay en la clase es 2008; no debe confundirse con Alma-Ata, que ocurrió en 1978.'),
        q('¿Qué expresa la integralidad en el modelo de atención?',[
          'Atender solo el órgano que motivó la consulta.',
          'Persona, familia, comunidad y ambiente.',
          'Derivar a todos los pacientes al hospital.',
          'Excluir prevención para concentrarse en tratamiento.'
        ],1,'La integralidad supera el enfoque fragmentado y considera dimensiones biológicas, psicológicas, sociales, familiares, comunitarias y ambientales.'),
        q('¿Cuál es el objetivo principal de la sectorización?',[
          'Dividir pacientes según capacidad de pago.',
          'Conocer el territorio para planificar acciones.',
          'Reducir el número de profesionales de una USF.',
          'Evitar visitas domiciliarias.'
        ],1,'Sectorizar permite responsabilizar equipos por poblaciones definidas, identificar riesgos y organizar acciones territoriales.'),
        q('¿Qué criterio debe guiar primero un triage clínico?',[
          'Orden de llegada sin excepciones.',
          'Edad del profesional que recibe al paciente.',
          'Urgencia y riesgo de deterioro o muerte.',
          'Cantidad de acompañantes.'
        ],2,'El triage prioriza por gravedad y tiempo seguro de espera; no sustituye el diagnóstico definitivo ni funciona solo por orden de llegada.'),
        q('¿Cuál situación define mejor una emergencia?',[
          'Problema que incomoda pero puede esperar sin riesgo.',
          'Amenaza vital o de órgano con atención inmediata.',
          'Consulta administrativa sin síntomas.',
          'Enfermedad crónica estable con control programado.'
        ],1,'En una emergencia existe riesgo inmediato para vida u órgano; se inicia estabilización sin demoras evitables.'),
        q('¿Qué elemento corresponde a una orientación de APS renovada?',[
          'Equidad, participación, continuidad y acción conjunta.',
          'Fragmentación, selección económica y atención episódica.',
          'Hospitalocentrismo como única puerta de entrada.',
          'Ausencia de responsabilidad gubernamental.'
        ],0,'Los sistemas basados en APS se orientan a equidad, solidaridad, participación, continuidad, calidad, rendición de cuentas e intersectorialidad.'),
      ],
      vf:[
        vf('La APS equivale únicamente al edificio físico de una Unidad de Salud Familiar.',false,'La USF es una forma operativa; la APS es una estrategia y orientación de todo el sistema de salud.'),
        vf('El triage ordena la atención según riesgo y urgencia, no únicamente por orden de llegada.',true,'Su objetivo es identificar quién necesita intervención inmediata y quién puede esperar con seguridad.'),
        vf('Urgencia y emergencia significan exactamente lo mismo en priorización asistencial.',false,'La emergencia implica amenaza vital o de órgano e intervención inmediata; una urgencia requiere atención pronta, pero puede no tener amenaza inmediata.'),
        vf('La participación comunitaria forma parte de los principios históricos de la APS.',true,'Alma-Ata incluye el derecho y el deber de las personas de participar en la planificación e implementación de su atención.'),
      ],
      cases:[
        clinical('En una sala de espera llega un paciente con dolor torácico opresivo, diaforesis, hipotensión y alteración del estado mental. Otras personas llegaron antes con síntomas estables.','¿Qué conducta de triage es correcta?',[
          'Mantener el orden de llegada para ser justo.',
          'Prioridad inmediata e inicio de estabilización.',
          'Pedirle que espere hasta completar todos los formularios.',
          'Derivarlo a consulta programada de APS sin valoración.'
        ],1,'Los signos sugieren amenaza vital. El triage por acuidad debe priorizar intervención inmediata por encima del orden de llegada.'),
        clinical('Una USF identifica muchos embarazos sin control en un barrio distante y barreras de transporte. El equipo analiza el territorio con líderes comunitarios.','¿Qué acción refleja mejor APS y sectorización?',[
          'Esperar pasivamente a que las pacientes consulten.',
          'Cerrar el registro porque el problema ocurre fuera del edificio.',
          'Mapear el territorio, buscar activamente y coordinar el control prenatal.',
          'Transferir toda responsabilidad a un hospital terciario.'
        ],2,'La responsabilidad territorial permite reconocer barreras, priorizar grupos y organizar acciones accesibles e intersectoriales.'),
      ]
    },

    'microbiologia-teorica':{
      courseId:'microbiologia-teorica',
      title:'Dermatofitosis y tiñas',
      icon:'class-icon-microbiology',
      description:'Agentes, transmisión, localización, diagnóstico y razonamiento terapéutico.',
      sources:[
        {label:'CDC · Ringworm',url:'https://www.cdc.gov/ringworm/about/index.html'},
        {label:'NCBI · Tinea corporis',url:'https://www.ncbi.nlm.nih.gov/books/NBK544360/'}
      ],
      qcm:[
        q('¿Qué tejidos colonizan principalmente los dermatofitos?',[
          'Tejidos queratinizados: estrato córneo, pelo y uñas.',
          'Parénquima hepático sano como localización exclusiva.',
          'Músculo cardíaco sin afectar piel.',
          'Sistema nervioso central en todos los casos.'
        ],0,'Los dermatofitos utilizan queratina y producen infecciones de piel superficial, pelo y uñas.'),
        q('¿Qué combinación de géneros dermatofitos clásicos es correcta?',[
          'Candida, Cryptococcus y Aspergillus.',
          'Trichophyton, Microsporum y Epidermophyton.',
          'Rhizopus, Mucor y Pneumocystis.',
          'Histoplasma, Paracoccidioides y Sporothrix.'
        ],1,'Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.'),
        q('¿Qué patrón tisular corresponde a Microsporum?',[
          'Piel y pelo.',
          'Solo uñas.',
          'Piel, pelo y uñas.',
          'Únicamente mucosas.'
        ],0,'De forma didáctica: Trichophyton afecta piel/pelo/uñas; Microsporum piel/pelo; Epidermophyton piel/uñas.'),
        q('Una dermatofitosis adquirida de un gato se clasifica por reservorio como:',[
          'Antropofílica.',
          'Geofílica.',
          'Zoofílica.',
          'Iatrogénica.'
        ],2,'Zoofílico indica reservorio animal; antropofílico, humano; geofílico, suelo.'),
        q('¿Qué nombre recibe la dermatofitosis del cuero cabelludo?',[
          'Tinea cruris.',
          'Tinea capitis.',
          'Tinea pedis.',
          'Tinea unguium.'
        ],1,'La nomenclatura “tinea + sitio” identifica la localización anatómica. Capitis corresponde al cuero cabelludo y pelo.'),
        q('¿Qué aporta el examen directo con KOH?',[
          'Hifas o artroconidios en la muestra.',
          'Identifica siempre la especie y su sensibilidad sin cultivo.',
          'Cuantifica anticuerpos circulantes.',
          'Sustituye toda valoración clínica.'
        ],0,'KOH aclara queratina y facilita ver elementos fúngicos; la identificación de especie puede requerir cultivo u otras técnicas.'),
        q('¿Cuándo resulta especialmente útil un cultivo?',[
          'Confirmación e identificación en casos dudosos o refractarios.',
          'Solo cuando el KOH fue positivo y ya se conoce la especie con certeza.',
          'Nunca, porque todos los dermatofitos son idénticos.',
          'Únicamente para medir glucosa.'
        ],0,'El cultivo tarda más, pero ayuda a identificar el organismo y resolver diagnósticos dudosos o tratamientos fallidos.'),
        q('¿Por qué la tinea capitis suele requerir tratamiento sistémico?',[
          'Porque compromete pelo y folículo.',
          'Porque toda lesión cutánea necesita cirugía.',
          'Porque los antifúngicos tópicos empeoran cualquier tiña.',
          'Porque el cuero cabelludo carece de queratina.'
        ],0,'La infección del tallo piloso/folículo exige fármaco sistémico; champús pueden reducir transmisión, pero no bastan como monoterapia.'),
        q('¿Qué es un querion?',[
          'Una forma inflamatoria intensa de tinea capitis que puede dejar cicatriz.',
          'Una infección viral de la uña.',
          'Un tumor benigno del folículo.',
          'Una colonia bacteriana en sangre.'
        ],0,'El querion es una respuesta inflamatoria marcada a dermatofitos del cuero cabelludo y puede producir alopecia cicatricial.'),
      ],
      vf:[
        vf('Tinea capitis y tiña del cuero cabelludo describen el mismo sitio anatómico.',true,'Capitis se refiere al cuero cabelludo y pelo; no son dos diagnósticos separados.'),
        vf('La lámpara de Wood es negativa en muchas especies, por lo que un resultado negativo no excluye dermatofitosis.',true,'Solo algunas especies producen fluorescencia característica.'),
        vf('Toda dermatofitosis localizada de piel requiere tratamiento sistémico.',false,'Muchas lesiones cutáneas limitadas responden a terapia tópica; pelo, uñas o enfermedad extensa pueden requerir vía oral.'),
        vf('Los corticoides tópicos usados solos pueden enmascarar o empeorar una tiña.',true,'Pueden reducir inflamación visible sin tratar al hongo y producir tinea incognito.'),
        vf('Una prueba de KOH negativa excluye con certeza absoluta una dermatofitosis.',false,'La calidad de la muestra y la técnica influyen; persiste posibilidad de falso negativo y puede indicarse repetición/cultivo.'),
      ],
      cases:[
        clinical('Niño con placas alopécicas, pelos rotos y descamación del cuero cabelludo. Un hermano tiene síntomas similares.','¿Cuál es el diagnóstico y enfoque más probables?',[
          'Tinea capitis con tratamiento antifúngico sistémico.',
          'Tinea pedis; usar solo polvo en los zapatos.',
          'Dermatitis sin necesidad de considerar hongos.',
          'Onicomicosis; extraer todas las uñas.'
        ],0,'La combinación de alopecia, pelos rotos y escama orienta a tinea capitis. El tratamiento debe alcanzar el folículo/pelo, por eso suele ser sistémico.'),
        clinical('Adulto con placa anular pruriginosa, borde eritematoso descamativo activo y aclaramiento central en el antebrazo.','¿Qué procedimiento apoya el diagnóstico en consulta?',[
          'Raspado del borde activo con KOH.',
          'Punción lumbar.',
          'Gasometría arterial.',
          'Electrocardiograma como única prueba.'
        ],0,'El borde activo contiene mayor carga fúngica. El raspado con KOH puede mostrar hifas hialinas septadas.'),
        clinical('Paciente usa por semanas una crema con corticoide sobre una lesión sospechosa; el eritema disminuye, pero la placa se extiende y pierde su forma típica.','¿Cuál explicación es más probable?',[
          'Curación completa de la infección.',
          'Tinea incognito por uso de corticoide.',
          'Transformación obligatoria en cáncer.',
          'Alergia al oxígeno.'
        ],1,'El corticoide puede suprimir signos inflamatorios, favorecer extensión y dificultar el reconocimiento de la dermatofitosis.'),
      ]
    },

    'microbiologia-practica':{
      courseId:'microbiologia-practica',
      title:'Hongos y agar Sabouraud',
      icon:'class-icon-lab',
      description:'Muestra, morfología fúngica, cultivo y bioseguridad de laboratorio.',
      sources:[
        {label:'CDC · Bioseguridad',url:'https://www.cdc.gov/training/quicklearns/biosafety/'},
        {label:'NCBI · Cultivo de dermatofitos',url:'https://www.ncbi.nlm.nih.gov/books/NBK544360/'}
      ],
      qcm:[
        q('¿Cuál diferencia morfológica básica separa levaduras y mohos?',[
          'Levadura unicelular; moho filamentoso.',
          'Los mohos son siempre bacterias y las levaduras son virus.',
          'Las levaduras carecen de membrana celular.',
          'Los mohos solo existen dentro del cuerpo humano.'
        ],0,'Las levaduras suelen ser unicelulares y gemantes; los mohos presentan crecimiento filamentoso formado por hifas.'),
        q('¿Qué es un micelio?',[
          'Una única espora sexual.',
          'Red de hifas.',
          'La pared de una bacteria.',
          'Un pigmento del agar.'
        ],1,'La organización de múltiples hifas forma el micelio, visible como estructura vegetativa del moho.'),
        q('¿Cuál relación es correcta?',[
          'Conidio externo; conidióforo de sostén.',
          'Conidio: saco cerrado; conidióforo: medio de cultivo.',
          'Conidio: célula humana; conidióforo: antibiótico.',
          'Conidio y conidióforo son sinónimos exactos.'
        ],0,'Los conidios se forman externamente; el conidióforo es la hifa especializada que los porta.'),
        q('¿Qué diferencia un esporangio de un conidio?',[
          'Esporangio interno; conidio externo.',
          'El esporangio solo existe en bacterias.',
          'El conidio siempre contiene cientos de esporas internas.',
          'No existe diferencia morfológica.'
        ],0,'El esporangio encierra esporangiosporas; los conidios son estructuras asexuales externas.'),
        q('¿Por qué el agar dextrosa Sabouraud favorece el cultivo de muchos hongos?',[
          'Por sus peptonas, dextrosa y pH relativamente ácido.',
          'Porque contiene sangre humana obligatoriamente.',
          'Porque elimina toda necesidad de esterilización.',
          'Porque identifica automáticamente la especie por color.'
        ],0,'La formulación aporta nutrientes y un pH alrededor de 5,6 que favorece hongos y dificulta parte de la flora bacteriana.'),
        q('¿Cuál regla es correcta al preparar un medio de cultivo comercial?',[
          'Usar siempre una receta memorizada aunque cambie el fabricante.',
          'Seguir fabricante y protocolo institucional.',
          'Omitir la esterilización si el medio se calienta.',
          'Probar el pH oliendo el medio.'
        ],1,'Las formulaciones varían. Deben respetarse concentración, calentamiento, esterilización y controles indicados por fabricante/laboratorio.'),
        q('¿Qué dato macroscópico por sí solo NO identifica una especie fúngica con certeza?',[
          'Color, textura y relieve de una colonia.',
          'Secuenciación molecular validada.',
          'Conjunto de caracteres macro y microscópicos integrado.',
          'Prueba específica interpretada con controles.'
        ],0,'La morfología macroscópica orienta, pero especies distintas pueden parecerse; se integra con microscopía y pruebas adicionales.'),
      ],
      vf:[
        vf('Una muestra con moho debe transportarse cerrada y abrirse solo bajo indicación del laboratorio.',true,'Cerrar reduce derrames y aerosolización; la manipulación debe seguir el protocolo institucional.'),
        vf('Oler una placa de cultivo es una forma segura de identificar hongos.',false,'Oler o agitar puede aerosolizar esporas y exponer al estudiante; está contraindicado.'),
        vf('“Moho en frío y levadura en calor” es una regla absoluta para todos los hongos.',false,'La temperatura favorece el dimorfismo de varios hongos, pero existen excepciones y otros patrones morfológicos.'),
        vf('Calentar un medio sustituye siempre al proceso de esterilización indicado.',false,'Disolver/calentar y esterilizar no son equivalentes; debe seguirse el protocolo específico, con autoclave cuando corresponda.'),
      ],
      cases:[
        clinical('Un estudiante lleva una naranja totalmente licuada y con fuga dentro de una bolsa abierta para la práctica de micología.','¿Qué corrección es más segura?',[
          'Abrirla y olerla para verificar si tiene hongos.',
          'Usar una muestra sólida, resistente y cerrada.',
          'Mezclarla con alimentos personales.',
          'Agitarla antes de entrar al laboratorio.'
        ],1,'Una muestra sólida y sellada reduce derrames y aerosolización. La apertura se hace únicamente bajo indicación docente y con equipo de protección.'),
        clinical('Tras incubación aparece una colonia algodonosa. Un alumno afirma que el color basta para nombrar la especie.','¿Cuál respuesta es correcta?',[
          'El color identifica con certeza cualquier hongo.',
          'La colonia confirma que es una bacteria grampositiva.',
          'Integrar hallazgos macro y microscópicos.',
          'Debe olerse la placa para completar la identificación.'
        ],2,'Textura, relieve y pigmento son útiles, pero la identificación requiere correlación microscópica y, según el caso, métodos bioquímicos o moleculares.'),
      ]
    },

    fisiologia:{
      courseId:'fisiologia',
      title:'Control nervioso y químico de la respiración',
      icon:'class-icon-physiology',
      description:'Centros respiratorios, sensores, transporte de gases y aplicación clínica.',
      sources:[
        {label:'NCBI · Respiratory Drive',url:'https://www.ncbi.nlm.nih.gov/books/NBK482414/'}
      ],
      qcm:[
        q('¿Qué detectan principalmente los quimiorreceptores centrales?',[
          'La PaO₂ arterial de forma directa.',
          'La presión pleural durante cada inspiración.',
          'pH del LCR, modificado por la PaCO₂.',
          'La concentración plasmática de hemoglobina.'
        ],2,'El CO₂ cruza la barrera hematoencefálica, modifica H⁺ y pH en el LCR y estimula los quimiorreceptores centrales.'),
        q('Los cuerpos carotídeos envían su información al tronco encefálico principalmente por el:',[
          'Glosofaríngeo (IX).',
          'Nervio vago, X par.',
          'Nervio frénico.',
          'Nervio hipogloso, XII par.'
        ],0,'Los cuerpos carotídeos se conectan mediante el glosofaríngeo; los cuerpos aórticos lo hacen principalmente mediante el vago.'),
        q('¿Cuál es el principal estímulo hipóxico de los quimiorreceptores periféricos?',[
          'Aumento de la saturación venosa central.',
          'Descenso importante de la PaO₂ arterial.',
          'Aumento aislado del bicarbonato plasmático.',
          'Disminución de la temperatura corporal.'
        ],1,'Los cuerpos carotídeos y aórticos responden con fuerza cuando desciende la PaO₂, especialmente en hipoxemia marcada.'),
        q('¿Por qué es importante el complejo pre-Bötzinger?',[
          'Porque produce surfactante pulmonar.',
          'Porque regula la difusión de O₂ a través de la membrana alveolar.',
          'Porque genera el ritmo respiratorio automático.',
          'Porque transporta CO₂ unido a hemoglobina.'
        ],2,'El complejo pre-Bötzinger, situado en la región ventrolateral del bulbo, participa de forma esencial en la generación del ritmo.'),
        q('¿Qué función describe mejor al grupo respiratorio dorsal?',[
          'Inspiración e integración aferente en el NTS.',
          'Producción exclusiva de espiración forzada durante el reposo.',
          'Control voluntario cortical de la respiración.',
          'Detección directa de la PaO₂ en el arco aórtico.'
        ],0,'El grupo dorsal es principalmente inspiratorio e integra señales aferentes en el núcleo del tracto solitario.'),
        q('El reflejo de Hering–Breuer se activa por:',[
          'Quimiorreceptores centrales ante acidosis del LCR.',
          'Estiramiento pulmonar excesivo.',
          'Barorreceptores carotídeos ante hipertensión.',
          'Nociceptores musculares ante ejercicio.'
        ],1,'Los receptores de estiramiento transmiten por el vago una señal inhibitoria que ayuda a limitar la inspiración excesiva.'),
        q('¿En qué forma se transporta la mayor parte del CO₂ en sangre?',[
          'Disuelto sin transformación en plasma.',
          'Unido de manera irreversible al hierro del hemo.',
          'Como bicarbonato tras la hidratación del CO₂.',
          'Dentro de quilomicrones.'
        ],2,'La mayor fracción se convierte en bicarbonato, proceso acelerado por la anhidrasa carbónica en los eritrocitos.'),
        q('El efecto Bohr facilita la entrega periférica de O₂ porque:',[
          'CO₂ y H⁺ disminuyen la afinidad Hb–O₂.',
          'La alcalosis desplaza siempre la curva a la derecha.',
          'El CO₂ impide que la hemoglobina llegue a los tejidos.',
          'La hemoglobina aumenta su afinidad cuando el tejido produce ácido.'
        ],0,'En tejidos metabólicamente activos, CO₂, H⁺ y temperatura favorecen la liberación de O₂ al desplazar la curva a la derecha.'),
        q('Al inicio del ejercicio, la ventilación aumenta antes de cambios grandes en gases arteriales por:',[
          'Supresión completa de los centros bulbares.',
          'Comando central y propiocepción.',
          'Pérdida inmediata del reflejo vagal.',
          'Aumento obligatorio de la PaCO₂ a valores patológicos.'
        ],1,'La respuesta inicial incluye mecanismos anticipatorios neurales; después se integran señales metabólicas y químicas.'),
      ],
      vf:[
        vf('En una persona sana, la PaCO₂ es un determinante principal del impulso ventilatorio a través de cambios del pH del LCR.',true,'El CO₂ cruza con rapidez hacia el LCR y genera H⁺, señal central potente para ajustar la ventilación.'),
        vf('Los quimiorreceptores centrales detectan directamente la PaO₂ arterial baja.',false,'La hipoxemia es detectada sobre todo por quimiorreceptores periféricos; los centrales responden principalmente al pH del LCR ligado al CO₂.'),
        vf('La inspiración tranquila es activa y la espiración tranquila es principalmente pasiva.',true,'El diafragma y los intercostales externos se contraen en inspiración; la retracción elástica predomina durante la espiración tranquila.'),
        vf('En la EPOC, administrar oxígeno de manera controlada está absolutamente contraindicado por riesgo de detener la respiración.',false,'La hipoxemia debe tratarse con objetivos y monitorización. La hipercapnia inducida por O₂ es multifactorial y no justifica negar oxígeno.'),
        vf('La hipoventilación alveolar puede elevar la PaCO₂ y producir acidosis respiratoria.',true,'Si la eliminación alveolar de CO₂ cae, aumenta la PaCO₂ y el equilibrio se desplaza hacia mayor concentración de H⁺.'),
      ],
      cases:[
        clinical('Un paciente con enfermedad obstructiva presenta PaCO₂ de 55 mmHg, pH 7,31 y respiración rápida. La PaO₂ es de 54 mmHg.','¿Qué interpretación integra mejor los datos?',[
          'Alcalosis respiratoria por eliminación excesiva de CO₂.',
          'Acidosis metabólica pura con ventilación normal.',
          'Acidosis respiratoria hipercápnica con hipoxemia.',
          'Gasometría normal para un adulto.'
        ],2,'La PaCO₂ alta con pH bajo señala acidosis respiratoria; la PaO₂ baja demuestra hipoxemia. La taquipnea puede ser compensatoria pero no garantiza ventilación alveolar eficaz.'),
        clinical('Después de recibir un opioide, un paciente se vuelve somnoliento, reduce la frecuencia respiratoria y retiene CO₂.','¿Qué estructura explica mejor la depresión del ritmo automático?',[
          'Complejo pre-Bötzinger.',
          'Corteza visual occipital.',
          'Nódulo sinoauricular.',
          'Cuerpos cavernosos.'
        ],0,'Los opioides deprimen redes generadoras del ritmo en el tronco encefálico, incluido el complejo pre-Bötzinger, y reducen la respuesta ventilatoria al CO₂.'),
        clinical('Una persona asciende rápidamente a gran altitud y desarrolla PaO₂ baja con aumento de la ventilación.','¿Qué sensores inician principalmente esta respuesta?',[
          'Quimiorreceptores centrales que detectan O₂ directamente.',
          'Quimiorreceptores periféricos carotídeos y aórticos.',
          'Receptores articulares sin participación química.',
          'Osmorreceptores hipotalámicos.'
        ],1,'La caída de PaO₂ activa quimiorreceptores periféricos. Los cuerpos carotídeos son particularmente importantes para la respuesta ventilatoria hipóxica.'),
      ]
    },

    bioquimica:{
      courseId:'bioquimica',
      title:'Glucólisis y regulación',
      icon:'class-icon-biochemistry',
      description:'Diez reacciones, balance energético, control y conexión con GLUT4.',
      sources:[
        {label:'NCBI · Aerobic Glycolysis',url:'https://www.ncbi.nlm.nih.gov/books/NBK470170/'},
        {label:'PMC · Exercise and GLUT4',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4315445/'}
      ],
      qcm:[
        q('¿Dónde ocurre la glucólisis?',[
          'Matriz mitocondrial.',
          'Citosol.',
          'Retículo endoplásmico.',
          'Núcleo.'
        ],1,'Las diez reacciones de la glucólisis ocurren en el citosol. El destino posterior del piruvato puede involucrar la mitocondria.'),
        q('¿Cuál es el balance neto principal por una molécula de glucosa?',[
          '1 piruvato, 4 ATP netos y 1 NADH.',
          '2 acetil-CoA, 2 ATP netos y 6 NADH.',
          '2 piruvatos, 2 ATP netos y 2 NADH.',
          '2 lactatos y ningún ATP en cualquier condición.'
        ],2,'Se invierten 2 ATP y se producen 4, para un balance neto de 2 ATP; además se forman 2 NADH y 2 piruvatos.'),
        q('¿Por qué los productos de la fase de beneficio se cuentan por duplicado?',[
          'Una glucosa produce dos G3P.',
          'Porque cada ATP se divide espontáneamente.',
          'Porque la glucosa entra dos veces en la célula.',
          'Porque el piruvato vuelve al inicio de la vía.'
        ],0,'La aldolasa genera DHAP y G3P; la triosa fosfato isomerasa convierte DHAP en G3P. Desde allí avanzan dos moléculas de G3P.'),
        q('¿Qué enzima cataliza el paso comprometido y principal punto regulador de la glucólisis?',[
          'Lactato deshidrogenasa.',
          'Fosfoglucosa isomerasa.',
          'Aldolasa.',
          'Fosfofructoquinasa-1.'
        ],3,'PFK-1 convierte fructosa-6-fosfato en fructosa-1,6-bisfosfato y constituye un paso irreversible, comprometido y altamente regulado.'),
        q('¿Cuáles son los tres pasos irreversibles clásicos de la glucólisis?',[
          'Hexoquinasa/glucoquinasa, PFK-1 y piruvato quinasa.',
          'Aldolasa, enolasa y lactato deshidrogenasa.',
          'Fosfoglucosa isomerasa, triosa fosfato isomerasa y fosfoglicerato mutasa.',
          'Glucosa-6-fosfatasa, glucógeno fosforilasa y piruvato carboxilasa.'
        ],0,'Las reacciones 1, 3 y 10 son irreversibles y funcionan como puntos de control.'),
        q('¿En qué reacciones se produce ATP por fosforilación a nivel de sustrato?',[
          'Hexoquinasa y PFK-1.',
          'Fosfoglicerato quinasa y piruvato quinasa.',
          'Aldolasa y enolasa.',
          'GAPDH y lactato deshidrogenasa.'
        ],1,'La transferencia directa de fosfato a ADP ocurre en las reacciones catalizadas por fosfoglicerato quinasa y piruvato quinasa.'),
        q('En condiciones de disponibilidad limitada de O₂, convertir piruvato en lactato permite:',[
          'Crear glucosa directamente dentro del músculo.',
          'Consumir todo el ATP de la célula.',
          'Regenerar NAD⁺ y sostener la glucólisis.',
          'Transportar oxígeno unido al lactato.'
        ],2,'La lactato deshidrogenasa oxida NADH a NAD⁺. Sin NAD⁺, la glucólisis se detendría en el paso de GAPDH.'),
        q('¿Cuál comparación entre hexoquinasa y glucoquinasa es correcta?',[
          'La glucoquinasa está en todos los tejidos y tiene mayor afinidad que la hexoquinasa.',
          'Hexoquinasa: tejidos; glucoquinasa: hígado/célula beta y glucosa alta.',
          'Ambas enzimas liberan glucosa libre desde glucosa-6-fosfato.',
          'Ninguna consume ATP.'
        ],1,'La hexoquinasa tiene amplia distribución y alta afinidad; la glucoquinasa hepática/beta pancreática tiene mayor Km y capacidad, útil cuando la glucemia aumenta.'),
        q('¿Cómo favorece el ejercicio la captación muscular de glucosa?',[
          'La contracción también transloca GLUT4.',
          'El ejercicio destruye los GLUT4 para impedir hipoglucemia.',
          'La contracción convierte GLUT4 en un transportador de fructosa intestinal.',
          'Solo puede aumentar la captación si se administra insulina intravenosa.'
        ],0,'La contracción y la insulina activan mecanismos proximales diferentes que convergen en mayor presencia de GLUT4 en la membrana muscular.'),
      ],
      vf:[
        vf('El oxígeno es un sustrato consumido directamente en una de las diez reacciones de la glucólisis.',false,'La glucólisis no utiliza O₂ directamente; el O₂ modifica la reoxidación de NADH y el destino posterior del piruvato.'),
        vf('La fase preparatoria consume dos ATP por glucosa.',true,'Se consume ATP en las reacciones de hexoquinasa/glucoquinasa y PFK-1.'),
        vf('PFK-1 es estimulada por una señal de energía abundante como ATP alto.',false,'ATP y citrato tienden a inhibir PFK-1; AMP y fructosa-2,6-bisfosfato favorecen la actividad.'),
        vf('La formación de lactato ayuda a regenerar NAD⁺ cuando la reoxidación mitocondrial de NADH es insuficiente.',true,'Esa regeneración permite sostener el paso de GAPDH y la producción rápida de ATP glucolítico.'),
        vf('La insulina y la contracción muscular activan GLUT4 mediante mecanismos proximales idénticos.',false,'Convergen en la translocación de GLUT4, pero la contracción puede estimularla por vías diferentes de la señalización del receptor de insulina.'),
      ],
      cases:[
        clinical('Durante un sprint intenso, el músculo necesita ATP con rapidez y la entrega de O₂ no cubre toda la demanda inmediata.','¿Qué adaptación citosólica sostiene temporalmente la glucólisis?',[
          'Conversión de lactato en glucosa dentro de la misma reacción.',
          'Conversión de piruvato en lactato con regeneración de NAD⁺.',
          'Bloqueo completo de GAPDH.',
          'Entrada del piruvato al núcleo.'
        ],1,'La lactato deshidrogenasa regenera NAD⁺, indispensable para continuar la glucólisis y producir ATP con rapidez.'),
        clinical('Un paciente con diabetes tipo 1 realiza pesas de muy alta intensidad sin suficiente insulina. Al terminar, su glucemia es mayor que antes.','¿Qué mecanismo explica mejor el aumento?',[
          'Desaparición definitiva de todos los GLUT4.',
          'Inhibición absoluta de la producción hepática de glucosa.',
          'Contrarregulación con producción hepática.',
          'Conversión inmediata de todo el glucógeno en grasa.'
        ],2,'El esfuerzo intenso puede elevar catecolaminas, glucagón, cortisol y GH. Sin insulina suficiente, la producción hepática puede superar la captación inducida por contracción.'),
        clinical('Tras una comida rica en carbohidratos, aumenta la glucosa portal y el hígado debe captar y almacenar parte de esa carga.','¿Qué propiedad de la glucoquinasa favorece esta función?',[
          'Alta capacidad cuando la glucosa aumenta.',
          'Inhibición irreversible por cualquier concentración de glucosa.',
          'Localización exclusiva en músculo esquelético.',
          'Producción directa de fructosa-1,6-bisfosfato sin ATP.'
        ],0,'La glucoquinasa hepática tiene mayor Km y capacidad que la hexoquinasa, por lo que responde bien cuando la glucosa portal aumenta.'),
      ]
    }
  };

  var storageKey = 'med-nykuto-class-practice-v420';
  var typeOrder = ['qcm','vf','cases'];
  var typeLabels = {
    qcm:'QCM',
    vf:'Verdadero / Falso',
    cases:'Casos clínicos'
  };

  function balanceAnswerPositions(){
    Object.keys(banks).forEach(function(courseId,courseIndex){
      ['qcm','cases'].forEach(function(type,typeIndex){
        banks[courseId][type].forEach(function(question,questionIndex){
          var desired = (questionIndex + courseIndex + (typeIndex * 2)) % question.options.length;
          if(question.answer === desired) return;
          var displaced = question.options[desired];
          question.options[desired] = question.options[question.answer];
          question.options[question.answer] = displaced;
          question.answer = desired;
        });
      });
    });
  }

  balanceAnswerPositions();

  function createNode(tag,className,text){
    var node = document.createElement(tag);
    if(className) node.className = className;
    if(typeof text === 'string') node.textContent = text;
    return node;
  }

  function loadProgress(){
    try{
      var saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    }catch(error){return {};}
  }

  function saveProgress(progress){
    try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch(error){}
  }

  function courseProgress(progress,courseId){
    if(!progress[courseId]) progress[courseId] = {qcm:[],vf:[],cases:[]};
    typeOrder.forEach(function(type){
      if(!Array.isArray(progress[courseId][type])) progress[courseId][type] = [];
    });
    return progress[courseId];
  }

  function answeredCount(results){
    return results.filter(function(result){return result && typeof result.correct === 'boolean';}).length;
  }

  function correctCount(results){
    return results.filter(function(result){return result && result.correct;}).length;
  }

  function firstUnanswered(questions,results){
    for(var index=0;index<questions.length;index+=1){
      if(!results[index]) return index;
    }
    return -1;
  }

  function buildPracticeModule(bank,progress){
    var state = courseProgress(progress,bank.courseId);
    var root = createNode('section','practice-module');
    root.id = bank.rootId || ('practice-' + bank.courseId);
    root.dataset.practiceRoot = bank.courseId;
    root.setAttribute('aria-labelledby',root.id + '-title');

    var overview = createNode('div','practice-overview');
    var heading = createNode('div','practice-heading');
    var icon = createNode('span','practice-icon');
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML = '<svg><use href="#' + bank.icon + '"></use></svg>';
    var copy = createNode('div','practice-heading-copy');
    copy.appendChild(createNode('span','practice-eyebrow',bank.lessonDateLabel ? 'ENTRENAMIENTO · ' + bank.lessonDateLabel : 'ENTRENAMIENTO DEL CURSO'));
    var title = createNode('h3','','Entrenamiento · ' + bank.title);
    title.id = root.id + '-title';
    copy.appendChild(title);
    copy.appendChild(createNode('p','',bank.description));
    heading.appendChild(icon);
    heading.appendChild(copy);

    var counts = createNode('div','practice-counts');
    typeOrder.forEach(function(type){
      var count = createNode('span');
      count.appendChild(createNode('strong','',String(bank[type].length)));
      count.appendChild(document.createTextNode(typeLabels[type]));
      counts.appendChild(count);
    });

    var overviewFooter = createNode('div','practice-overview-footer');
    var totalQuestions = typeOrder.reduce(function(total,type){return total + bank[type].length;},0);
    var progressLabel = createNode('span','practice-total-progress');
    progressLabel.setAttribute('aria-live','polite');
    var startButton = createNode('button','practice-start','Comenzar entrenamiento');
    startButton.type = 'button';
    startButton.setAttribute('aria-controls',root.id + '-workspace');
    startButton.setAttribute('aria-expanded','false');
    overviewFooter.appendChild(progressLabel);
    overviewFooter.appendChild(startButton);
    overview.appendChild(heading);
    overview.appendChild(counts);
    overview.appendChild(overviewFooter);

    var workspace = createNode('div','practice-workspace');
    workspace.id = root.id + '-workspace';
    workspace.hidden = true;
    var toolbar = createNode('div','practice-toolbar');
    var tabs = createNode('div','practice-tabs');
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Tipo de entrenamiento');
    var resetButton = createNode('button','practice-reset','Reiniciar curso');
    resetButton.type = 'button';
    toolbar.appendChild(tabs);
    toolbar.appendChild(resetButton);

    var questionHost = createNode('div','practice-question-host');
    questionHost.setAttribute('aria-live','polite');
    var sources = createNode('div','practice-sources');
    sources.appendChild(createNode('span','','BASE DE VERIFICACIÓN'));
    bank.sources.forEach(function(source){
      var link = createNode('a','',source.label);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      sources.appendChild(link);
    });

    workspace.appendChild(toolbar);
    workspace.appendChild(questionHost);
    workspace.appendChild(sources);
    root.appendChild(overview);
    root.appendChild(workspace);

    var activeType = 'qcm';
    var currentIndex = 0;
    var selectedIndex = null;
    var summaryVisible = false;
    var tabButtons = {};

    function totalAnswered(){
      return typeOrder.reduce(function(total,type){return total + answeredCount(state[type]);},0);
    }

    function updateProgressLabels(){
      var done = totalAnswered();
      progressLabel.textContent = done ? done + '/' + totalQuestions + ' preguntas completadas' : totalQuestions + ' preguntas para dominar este curso';
      typeOrder.forEach(function(type){
        if(!tabButtons[type]) return;
        var complete = answeredCount(state[type]);
        tabButtons[type].querySelector('small').textContent = complete + '/' + bank[type].length;
        tabButtons[type].classList.toggle('is-complete',complete === bank[type].length);
      });
    }

    function chooseType(type){
      activeType = type;
      selectedIndex = null;
      summaryVisible = false;
      Object.keys(tabButtons).forEach(function(key){
        var active = key === type;
        tabButtons[key].classList.toggle('is-active',active);
        tabButtons[key].setAttribute('aria-selected',active ? 'true' : 'false');
      });
      var next = firstUnanswered(bank[type],state[type]);
      if(next === -1) renderSummary();
      else{
        currentIndex = next;
        renderQuestion();
      }
    }

    typeOrder.forEach(function(type){
      var button = createNode('button','practice-tab');
      button.type = 'button';
      button.setAttribute('role','tab');
      button.appendChild(createNode('strong','',typeLabels[type]));
      button.appendChild(createNode('small','','0/' + bank[type].length));
      button.addEventListener('click',function(){chooseType(type);});
      tabs.appendChild(button);
      tabButtons[type] = button;
    });

    function optionLetter(index){
      return String.fromCharCode(65 + index);
    }

    function renderFeedback(container,question,result){
      var feedback = createNode('div','practice-feedback ' + (result.correct ? 'is-correct' : 'is-incorrect'));
      feedback.setAttribute('role','status');
      feedback.appendChild(createNode('strong','',result.correct ? 'Respuesta correcta' : 'Respuesta a corregir'));
      if(!result.correct){
        feedback.appendChild(createNode('p','practice-your-answer','Tu respuesta: ' + question.options[result.selected] + '.'));
      }
      var correctAnswer = createNode('p','practice-correct-answer');
      correctAnswer.appendChild(createNode('strong','','Respuesta correcta: '));
      correctAnswer.appendChild(document.createTextNode(question.options[question.answer] + '.'));
      feedback.appendChild(correctAnswer);
      feedback.appendChild(createNode('p','practice-explanation',question.explanation));
      container.appendChild(feedback);
    }

    function renderQuestion(){
      summaryVisible = false;
      questionHost.innerHTML = '';
      var questions = bank[activeType];
      var question = questions[currentIndex];
      var result = state[activeType][currentIndex] || null;
      selectedIndex = result ? result.selected : null;

      var card = createNode('article','practice-question-card');
      var meta = createNode('div','practice-question-meta');
      meta.appendChild(createNode('span','',typeLabels[activeType] + ' · ' + (currentIndex + 1) + '/' + questions.length));
      var level = activeType === 'cases' ? 'APLICACIÓN CLÍNICA' : 'COMPRENSIÓN ACTIVA';
      meta.appendChild(createNode('span','',level));
      card.appendChild(meta);

      if(question.scenario){
        var scenario = createNode('div','practice-scenario');
        scenario.appendChild(createNode('span','','CASO'));
        scenario.appendChild(createNode('p','',question.scenario));
        card.appendChild(scenario);
      }

      card.appendChild(createNode('h4','',question.prompt));
      var optionList = createNode('div','practice-options');
      optionList.setAttribute('role','radiogroup');
      optionList.setAttribute('aria-label','Opciones de respuesta');

      question.options.forEach(function(optionText,index){
        var option = createNode('button','practice-option');
        option.type = 'button';
        option.setAttribute('role','radio');
        option.setAttribute('aria-checked',selectedIndex === index ? 'true' : 'false');
        option.appendChild(createNode('span','practice-option-letter',optionLetter(index)));
        option.appendChild(createNode('span','practice-option-text',optionText));
        if(result){
          option.disabled = true;
          option.classList.toggle('is-correct-option',index === question.answer);
          option.classList.toggle('is-wrong-option',index === result.selected && !result.correct);
        }else{
          option.classList.toggle('is-selected',selectedIndex === index);
          option.addEventListener('click',function(){
            selectedIndex = index;
            optionList.querySelectorAll('.practice-option').forEach(function(item,optionIndex){
              var selected = optionIndex === index;
              item.classList.toggle('is-selected',selected);
              item.setAttribute('aria-checked',selected ? 'true' : 'false');
            });
            validateButton.disabled = false;
          });
        }
        optionList.appendChild(option);
      });
      card.appendChild(optionList);

      var actions = createNode('div','practice-actions');
      var validateButton = createNode('button','practice-validate','Validar mi respuesta');
      validateButton.type = 'button';
      validateButton.disabled = selectedIndex === null || Boolean(result);
      var nextButton = createNode('button','practice-next','Pregunta siguiente →');
      nextButton.type = 'button';
      nextButton.hidden = !result;
      actions.appendChild(validateButton);
      actions.appendChild(nextButton);
      card.appendChild(actions);

      if(result) renderFeedback(card,question,result);

      validateButton.addEventListener('click',function(){
        if(selectedIndex === null) return;
        state[activeType][currentIndex] = {
          selected:selectedIndex,
          correct:selectedIndex === question.answer
        };
        saveProgress(progress);
        updateProgressLabels();
        renderQuestion();
      });

      nextButton.addEventListener('click',function(){
        var next = firstUnanswered(questions,state[activeType]);
        if(next === -1) renderSummary();
        else{
          currentIndex = next;
          selectedIndex = null;
          renderQuestion();
        }
      });

      questionHost.appendChild(card);
    }

    function renderSummary(){
      summaryVisible = true;
      questionHost.innerHTML = '';
      var questions = bank[activeType];
      var results = state[activeType];
      var score = correctCount(results);
      var percentage = Math.round((score / questions.length) * 100);
      var summary = createNode('article','practice-summary');
      summary.appendChild(createNode('span','practice-eyebrow',typeLabels[activeType] + ' · BLOQUE TERMINADO'));
      summary.appendChild(createNode('h4','',score + '/' + questions.length + ' respuestas correctas'));
      summary.appendChild(createNode('strong','practice-score',percentage + '%'));
      var message = percentage >= 80 ? 'Buen dominio. Revisa solo las explicaciones de tus errores.' : 'Repite el bloque después de revisar la ficha y la clase completa.';
      summary.appendChild(createNode('p','',message));
      var formatPicker = createNode('div','practice-format-picker');
      formatPicker.hidden = true;
      formatPicker.setAttribute('aria-label','Elegir otro formato de entrenamiento');
      typeOrder.forEach(function(type){
        var done = answeredCount(state[type]);
        var choice = createNode('button','practice-format-choice');
        choice.type = 'button';
        choice.disabled = type === activeType;
        choice.appendChild(createNode('strong','',typeLabels[type]));
        choice.appendChild(createNode('small','',done + '/' + bank[type].length + (done === bank[type].length ? ' · terminado' : ' · continuar')));
        choice.addEventListener('click',function(){
          chooseType(type);
          window.requestAnimationFrame(function(){questionHost.scrollIntoView({behavior:'smooth',block:'start'});});
        });
        formatPicker.appendChild(choice);
      });
      var actions = createNode('div','practice-actions');
      var repeat = createNode('button','practice-validate','Repetir ' + typeLabels[activeType]);
      repeat.type = 'button';
      repeat.addEventListener('click',function(){
        state[activeType] = [];
        saveProgress(progress);
        updateProgressLabels();
        currentIndex = 0;
        renderQuestion();
        window.requestAnimationFrame(function(){questionHost.scrollIntoView({behavior:'smooth',block:'start'});});
      });
      var switchType = createNode('button','practice-next','Elegir otro formato');
      switchType.type = 'button';
      switchType.addEventListener('click',function(){
        formatPicker.hidden = !formatPicker.hidden;
        switchType.textContent = formatPicker.hidden ? 'Elegir otro formato' : 'Ocultar formatos';
      });
      actions.appendChild(repeat);
      actions.appendChild(switchType);
      summary.appendChild(formatPicker);
      summary.appendChild(actions);
      questionHost.appendChild(summary);
    }

    function openWorkspace(){
      workspace.hidden = false;
      root.classList.add('is-open');
      startButton.textContent = 'Cerrar entrenamiento';
      startButton.setAttribute('aria-expanded','true');
      chooseType(activeType);
    }

    function closeWorkspace(){
      workspace.hidden = true;
      root.classList.remove('is-open');
      startButton.textContent = 'Comenzar entrenamiento';
      startButton.setAttribute('aria-expanded','false');
    }

    startButton.addEventListener('click',function(){
      if(workspace.hidden) openWorkspace();
      else closeWorkspace();
    });

    resetButton.addEventListener('click',function(){
      if(!window.confirm('¿Reiniciar todo el progreso de este curso?')) return;
      state.qcm = [];
      state.vf = [];
      state.cases = [];
      saveProgress(progress);
      updateProgressLabels();
      chooseType('qcm');
    });

    updateProgressLabels();
    chooseType('qcm');
    workspace.hidden = true;
    root.classList.remove('is-open');

    return {
      root:root,
      open:function(){
        openWorkspace();
        window.requestAnimationFrame(function(){root.scrollIntoView({behavior:'auto',block:'start'});});
      }
    };
  }

  function mountPractice(){
    var progress = loadProgress();
    var controllers = {};
    Object.keys(banks).forEach(function(courseId){
      var courseSection = document.getElementById(banks[courseId].sectionId || courseId);
      if(!courseSection) return;
      var toggle = courseSection.querySelector('[data-detail-toggle]');
      if(!toggle) return;
      var controller = buildPracticeModule(banks[courseId],progress);
      var slot = document.querySelector('[data-practice-slot="' + courseId + '"]');
      var detail = document.getElementById(toggle.getAttribute('aria-controls'));
      if(slot) slot.replaceChildren(controller.root);
      else if(detail) detail.insertAdjacentElement('afterend',controller.root);
      else toggle.insertAdjacentElement('afterend',controller.root);
      controllers[courseId] = controller;
    });

    function openFromHash(){
      var match = window.location.hash.match(/^#practice-(.+)$/);
      if(match && controllers[match[1]]) controllers[match[1]].open();
      else if(match && match[1] === 'fisiologia' && controllers['fisiologia-2026-08-13']) controllers['fisiologia-2026-08-13'].open();
    }

    openFromHash();
    window.addEventListener('hashchange',openFromHash);
    window.MedNykutoClassPractice = {banks:banks,controllers:controllers,mount:mountPractice};
  }

  window.MedNykutoClassPractice = {banks:banks,controllers:{},mount:mountPractice};
  if(document && typeof document.addEventListener === 'function' && document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',mountPractice,{once:true});
  }else if(document && typeof document.getElementById === 'function'){
    mountPractice();
  }
})();
