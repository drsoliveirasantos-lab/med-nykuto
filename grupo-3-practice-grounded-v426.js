(function(){
  'use strict';

  var practice = window.MedNykutoClassPractice;
  if(!practice || !practice.banks) return;

  var POLICY = 'course-only-v431';
  var banks = practice.banks;

  function naturalDistractor(value){
    return String(value || '')
      .replace(/en todos los casos, sin ninguna excepción/gi,'')
      .replace(/sin (?:ninguna )?excepciones?/gi,'')
      .replace(/por sí sol[oa]s?/gi,'de manera aislada')
      .replace(/de forma definitiva/gi,'de manera persistente')
      .replace(/\bcualquier paciente\b/gi,'un paciente')
      .replace(/\bcualquier cambio\b/gi,'los cambios')
      .replace(/\bcualquier problema\b/gi,'un problema')
      .replace(/\bcualquier gas\b/gi,'un gas')
      .replace(/\bcualquier especie\b/gi,'una especie')
      .replace(/\bcualquier observación\b/gi,'la observación')
      .replace(/\bcualquier forma\b/gi,'una forma')
      .replace(/\bnada se multiplica\b/gi,'los resultados no se duplican')
      .replace(/\bnada se une a hemoglobina\b/gi,'una fracción se une a hemoglobina')
      .replace(/\btodos los\b/gi,'los')
      .replace(/\btodas las\b/gi,'las')
      .replace(/\btodo el\b/gi,'el')
      .replace(/\btoda la\b/gi,'la')
      .replace(/\bningún\b/gi,'un')
      .replace(/\bninguna\b/gi,'una')
      .replace(/\bninguno\b/gi,'uno')
      .replace(/\bno\s+nunca\b/gi,'no')
      .replace(/\bnunca\b/gi,'no')
      .replace(/\b(?:siempre|solamente|exclusivamente|obligatoriamente|exactamente)\b/gi,'')
      .replace(/únicamente/gi,'')
      .replace(/\bexclusiv[oa]s?\b/gi,'')
      .replace(/\bobligatori([oa]s?)\b/gi,'necesari$1')
      .replace(/\b(?:solo|sola|solos|solas)\b/gi,'')
      .replace(/(?:un|una)\s+únic[oa]/gi,function(match){ return /^un\s/i.test(match) ? 'un' : 'una'; })
      .replace(/\s+/g,' ')
      .replace(/\s+([,.;:])/g,'$1')
      .replace(/\s+\./g,'.')
      .trim();
  }

  function fact(key,label,evidence,correct,wrong,falseStatement){
    return {
      key:key,
      label:label,
      evidence:evidence,
      correct:correct,
      wrong:wrong.map(naturalDistractor),
      falseStatement:naturalDistractor(falseStatement)
    };
  }

  var topics = {
    nutricion:{
      anchor:'clase.html#nutrition-detail',
      containerId:'nutrition-detail',
      facts:[
        fact('alimentacion','la alimentación','Elección, preparación e ingestión de alimentos: qué, cuándo y cómo comemos.','La alimentación incluye elegir, preparar e ingerir alimentos.',['La alimentación es solo la digestión involuntaria de nutrientes.','La alimentación significa únicamente contar las calorías del día.','La alimentación existe solo cuando un profesional indica una dieta.'],'La alimentación se limita a la digestión y no incluye elegir alimentos.'),
        fact('cantidad','la ley de cantidad','Suficiente, sin déficit ni exceso','La cantidad busca cubrir las necesidades sin déficit ni exceso.',['La cantidad exige la misma ingesta para todas las personas, sin considerar necesidades individuales.','La cantidad se valora únicamente por el peso de un plato.','La cantidad obliga a eliminar todos los alimentos energéticos.'],'La ley de cantidad indica que todas las personas necesitan la misma ingesta.'),
        fact('calidad','la ley de calidad','No basta alcanzar calorías. Hay que revisar proteínas, carbohidratos, grasas, fibra, agua, vitaminas y minerales.','La calidad revisa nutrientes, fibra y agua, no solo calorías.',['La calidad queda asegurada cuando se alcanzan suficientes calorías.','La calidad se decide solo por el color predominante del plato.','La calidad depende únicamente de la cantidad de proteína.'],'Alcanzar las calorías necesarias garantiza por sí solo la calidad nutricional.'),
        fact('armonia','la armonía','Los grupos de alimentos deben guardar relación entre sí; ni una ensalada sola ni un plato dominado por almidones es completo.','La armonía busca una proporción equilibrada entre grupos de alimentos.',['La armonía significa comer un solo grupo en cada comida.','La armonía se mide únicamente por el tamaño total del plato.','La armonía exige que todos los alimentos tengan el mismo color y pertenezcan al mismo grupo.'],'Un plato dominado por un solo grupo siempre cumple la ley de armonía.'),
        fact('adecuacion','la adecuación','Considera etapa de vida, patología, cultura, preferencias, economía, disponibilidad, dentición, deglución y capacidad para preparar alimentos.','La adecuación adapta la alimentación a la persona y a su contexto real.',['La adecuación aplica el mismo consejo a cualquier paciente.','La adecuación ignora cultura, economía y capacidad funcional.','La adecuación depende solo de que el plato sea visualmente atractivo y tenga una presentación agradable.'],'La adecuación no cambia con la etapa de vida, la enfermedad ni el contexto.'),
        fact('variedad','la variedad','Rotar alimentos dentro y entre grupos','La variedad consiste en rotar alimentos dentro y entre grupos.',['La variedad consiste en repetir siempre el mismo alimento saludable.','La variedad se demuestra con muchos colores en una sola comida.','La variedad obliga a cambiar todos los alimentos en cada bocado.'],'La variedad se consigue repitiendo cada día los mismos alimentos.'),
        fact('balance','el balance energético','Si la ingesta energética supera de forma sostenida al gasto, se favorece el almacenamiento; si queda por debajo, se movilizan reservas.','El balance depende de la relación acumulada entre ingesta y gasto.',['El balance depende únicamente del peso observado en un día, sin relacionar la ingesta con el gasto.','El balance siempre es positivo aunque la ingesta quede bajo el gasto.','El balance no guarda relación con la ingesta ni con el gasto.'],'Cuando la ingesta queda de forma sostenida por debajo del gasto, se favorece el almacenamiento.'),
        fact('plato','la técnica del plato','½ Verduras y frutas','El modelo del plato dedica la mitad a verduras y frutas.',['El modelo del plato dedica la mitad únicamente a proteínas.','El modelo del plato elimina cereales, tubérculos y legumbres.','El modelo del plato prescribe una cantidad fija para cada persona.'],'En la técnica del plato, la mitad corresponde únicamente a proteínas.'),
        fact('energeticos','los alimentos energéticos','Principalmente carbohidratos y grasas','Los alimentos energéticos aportan principalmente carbohidratos y grasas.',['Los alimentos energéticos aportan exclusivamente vitaminas y agua.','Los alimentos energéticos son solamente carnes, huevos y lácteos.','Los alimentos energéticos no participan en el aporte de energía y se clasifican por su contenido de agua.'],'Los alimentos energéticos aportan principalmente agua y no carbohidratos ni grasas.'),
        fact('enriquecido','un alimento enriquecido','En clase se usa para describir la reposición de nutrientes perdidos durante el procesamiento, como vitaminas del grupo B y hierro en harinas refinadas.','Enriquecido significa reponer nutrientes perdidos durante el procesamiento.',['Enriquecido significa retirar micronutrientes del alimento durante el procesamiento.','Enriquecido significa cultivar sin añadir ni reponer nutrientes.','Enriquecido significa que el alimento no fue procesado.'],'Enriquecido significa eliminar nutrientes durante el procesamiento.')
      ]
    },
    'fisiologia-2026-08-13':{
      anchor:'clase.html#fisio-detail',
      containerId:'fisio-detail',
      facts:[
        fact('retroalimentacion','la regulación de la ventilación','El sistema detecta cambios químicos o mecánicos, los integra en el tronco encefálico y modifica la frecuencia y la profundidad respiratorias.','La ventilación se ajusta tras detectar e integrar cambios químicos o mecánicos.',['La ventilación se regula sin sensores ni integración nerviosa.','La ventilación depende solo de una decisión consciente permanente y funciona sin detectar cambios químicos o mecánicos.','La ventilación cambia sin modificar frecuencia ni profundidad.'],'La regulación ventilatoria funciona sin detectar cambios químicos o mecánicos.'),
        fact('grd','el grupo respiratorio dorsal','Predominio inspiratorio e integración de aferencias en el núcleo del tracto solitario; contribuye al patrón inspiratorio.','El GRD tiene predominio inspiratorio e integra aferencias.',['El GRD actúa únicamente como centro espiratorio durante el reposo.','El GRD se localiza en el arco aórtico y detecta oxígeno.','El GRD solo controla movimientos voluntarios de la respiración.'],'El grupo respiratorio dorsal tiene predominio exclusivamente espiratorio.'),
        fact('grv','el grupo respiratorio ventral','Contiene neuronas inspiratorias y espiratorias; participa especialmente cuando aumenta la demanda. Incluye el complejo pre-Bötzinger, clave para generar ritmo.','El GRV contiene neuronas inspiratorias y espiratorias y participa más con demanda alta.',['El GRV contiene solo neuronas sensitivas del cuerpo carotídeo.','El GRV deja de participar cuando aumenta la demanda respiratoria y contiene únicamente neuronas sensitivas del cuerpo carotídeo.','El GRV se limita a controlar el habla desde la corteza motora.'],'El grupo respiratorio ventral deja de participar cuando aumenta la demanda.'),
        fact('grp','el grupo respiratorio pontino','Modula la transición entre inspiración y espiración.','El grupo pontino modula el paso entre inspiración y espiración.',['El grupo pontino mide directamente la PaO₂ en la sangre.','El grupo pontino produce el surfactante de los alvéolos.','El grupo pontino transporta el oxígeno unido a hemoglobina y mide directamente la PaO₂ arterial.'],'El grupo respiratorio pontino no participa en la transición respiratoria.'),
        fact('central','el quimiorreceptor central','Cambio de pH del LCR generado sobre todo por PaCO₂','El quimiorreceptor central responde al pH del LCR influido por la PaCO₂.',['El quimiorreceptor central responde solo a la PaO₂ de los tejidos.','El quimiorreceptor central se activa por la distensión pulmonar marcada.','El quimiorreceptor central se encuentra en la bifurcación carotídea.'],'El quimiorreceptor central responde principalmente a una caída aislada de PaO₂.'),
        fact('carotideo','el cuerpo carotídeo','PaO₂ baja, además de PaCO₂ y pH','El cuerpo carotídeo responde a PaO₂ baja y también a PaCO₂ y pH.',['El cuerpo carotídeo responde únicamente a la distensión del pulmón.','El cuerpo carotídeo mide solo la temperatura del aire inspirado.','El cuerpo carotídeo no participa en cambios de gases arteriales.'],'El cuerpo carotídeo no responde a una PaO₂ baja.'),
        fact('aortico','el cuerpo aórtico','Nervio X hacia el tronco encefálico','Las aferencias del cuerpo aórtico llegan por el nervio X.',['Las aferencias del cuerpo aórtico llegan únicamente por el nervio IX.','Las aferencias del cuerpo aórtico llegan por nervios motores espinales.','El cuerpo aórtico carece de vía hacia el tronco encefálico.'],'Las aferencias del cuerpo aórtico llegan al tronco por el nervio IX.'),
        fact('hering','el reflejo de Hering–Breuer','Reflejo de Hering–Breuer por el vago','La distensión pulmonar marcada puede activar el reflejo de Hering–Breuer por el vago.',['El reflejo de Hering–Breuer depende de la corteza visual.','El reflejo de Hering–Breuer transporta oxígeno por hemoglobina.','El reflejo de Hering–Breuer se activa solo por glucosa sanguínea y viaja por el nervio IX hacia el tronco encefálico.'],'El reflejo de Hering–Breuer viaja únicamente por el nervio IX.'),
        fact('voluntario','el control voluntario','Permite hablar, cantar o contener la respiración, pero el impulso químico termina imponiéndose.','La corteza permite hablar, cantar o contener temporalmente la respiración.',['La corteza elimina de forma definitiva el impulso químico respiratorio.','El control voluntario impide cualquier cambio de la respiración al hablar.','El control voluntario depende exclusivamente de los cuerpos aórticos.'],'El control voluntario puede anular para siempre el impulso químico respiratorio.'),
        fact('epoc','un cuadro compatible con EPOC','Una espiración prolongada, sibilancias y un FEV₁ reducido orientan a obstrucción.','Espiración prolongada, sibilancias y FEV₁ reducido orientan a obstrucción.',['Una espiración prolongada, sibilancias y FEV₁ reducido orientan a restricción y descartan un patrón obstructivo.','Un FEV₁ reducido descarta cualquier problema obstructivo.','La obstrucción se reconoce únicamente por una PaO₂ normal.'],'Las sibilancias y el FEV₁ reducido descartan un patrón obstructivo.')
      ]
    },
    'fisiologia-2026-08-10':{
      anchor:'clase.html#fisio-detail-2026-08-10',
      containerId:'fisio-detail-2026-08-10',
      facts:[
        fact('secuencia','la secuencia del intercambio gaseoso','La ventilación lleva aire al alvéolo, la difusión cruza la barrera alveolocapilar, la perfusión aporta sangre y la hemoglobina transporta la mayor parte del O₂.','Ventilación, difusión, perfusión y transporte cumplen funciones diferentes.',['La ventilación y la difusión son exactamente el mismo proceso.','La perfusión lleva aire al alvéolo, mientras la ventilación aporta sangre a los capilares pulmonares.','La hemoglobina realiza por sí sola la ventilación pulmonar.'],'Ventilación, difusión, perfusión y transporte son un único proceso sin diferencias.'),
        fact('fick','la ley de Fick','Más área y gradiente favorecen el flujo; más grosor lo dificulta.','Más área y gradiente favorecen la difusión; más grosor la dificulta.',['Más grosor favorece la difusión, mientras el área y el gradiente no modifican el flujo de gases.','Menos gradiente siempre aumenta el flujo de cualquier gas.','La difusión no cambia con el área ni con el grosor.'],'Según Fick, un mayor grosor facilita el paso de los gases.'),
        fact('gradiente','el gradiente de presión','El gas se desplaza desde mayor hacia menor presión parcial.','Un gas se mueve desde mayor hacia menor presión parcial.',['Un gas se mueve siempre desde menor hacia mayor presión parcial.','Un gas se desplaza sin relación con las presiones parciales.','Un gas solo se mueve cuando ambas presiones son idénticas.'],'El gas se desplaza de menor hacia mayor presión parcial.'),
        fact('enfisema','el enfisema y la difusión','La pérdida de superficie, como en enfisema, reduce la capacidad de difusión.','El enfisema reduce la difusión al perder superficie disponible.',['El enfisema aumenta la superficie disponible para difundir y mejora el intercambio a través de la barrera.','El enfisema mejora la difusión al engrosar la barrera.','El enfisema no modifica la superficie de intercambio.'],'El enfisema aumenta la capacidad de difusión al crear más superficie.'),
        fact('grosor','el grosor de la barrera','Edema o fibrosis aumentan el espesor y enlentecen el intercambio.','Edema o fibrosis engrosan la barrera y enlentecen el intercambio.',['Edema o fibrosis adelgazan la barrera, aceleran el intercambio y reducen la distancia de difusión.','Edema o fibrosis aumentan siempre la superficie alveolar.','Edema o fibrosis no cambian la distancia de difusión.'],'Edema y fibrosis reducen el espesor y aceleran el intercambio gaseoso.'),
        fact('oxigeno','el transporte de O₂','Principalmente unido a hemoglobina; pequeña fracción disuelta','La mayor parte del O₂ sanguíneo viaja unida a hemoglobina.',['La mayor parte del O₂ sanguíneo viaja solo como bicarbonato.','Todo el O₂ sanguíneo está disuelto y nada se une a hemoglobina.','El O₂ viaja principalmente dentro de las plaquetas.'],'La mayor parte del O₂ sanguíneo se transporta disuelta y no unida a hemoglobina.'),
        fact('co2','el transporte de CO₂','Sobre todo bicarbonato; además carbamino y disuelto','El CO₂ viaja sobre todo como bicarbonato, además de carbamino y disuelto.',['El CO₂ viaja únicamente unido al hemo de la hemoglobina.','El CO₂ se transporta solo como gas libre dentro de los alvéolos y no utiliza bicarbonato ni forma disuelta.','El CO₂ no utiliza ninguna forma disuelta en la sangre.'],'El CO₂ sanguíneo viaja principalmente unido al hemo y nunca como bicarbonato.'),
        fact('vq','la relación V/Q','Cuando una región recibe sangre pero poca ventilación, su V/Q disminuye.','Si hay sangre pero poca ventilación, la relación V/Q disminuye.',['Si hay sangre pero poca ventilación, la relación V/Q aumenta al infinito.','La relación V/Q no depende de ventilación ni perfusión.','La ausencia de perfusión siempre produce una V/Q baja cercana a cero.'],'Una región con perfusión y poca ventilación tiene una relación V/Q muy alta.'),
        fact('bohr','el efecto Bohr','La curva se desplaza a la derecha y facilita la descarga de O₂ en tejidos activos.','El efecto Bohr desplaza la curva a la derecha y facilita liberar O₂.',['El efecto Bohr desplaza la curva a la izquierda y reduce la descarga de O₂ en tejidos activos.','El efecto Bohr describe únicamente el transporte de bicarbonato.','El efecto Bohr elimina la hemoglobina de la sangre.'],'El efecto Bohr desplaza la curva a la izquierda y dificulta liberar O₂.'),
        fact('haldane','el efecto Haldane','La desoxihemoglobina acepta mejor CO₂ y H⁺','En el efecto Haldane, la desoxihemoglobina acepta mejor CO₂ y H⁺.',['En el efecto Haldane, la oxihemoglobina acepta mejor todo el CO₂.','El efecto Haldane describe el paso de aire hasta el alvéolo.','El efecto Haldane significa que el CO₂ no puede viajar en sangre.'],'El efecto Haldane indica que la desoxihemoglobina rechaza CO₂ y H⁺.')
      ]
    },
    bioquimica:{
      anchor:'clase.html#bio-detail',
      containerId:'bio-detail',
      facts:[
        fact('objetivo','el objetivo de la glucólisis','Convertir una glucosa en dos piruvatos','La glucólisis convierte una glucosa en dos piruvatos.',['La glucólisis convierte dos piruvatos en una sola glucosa.','La glucólisis transforma una glucosa directamente en glucógeno.','La glucólisis produce una sola molécula final de seis carbonos.'],'La glucólisis convierte dos piruvatos en una glucosa.'),
        fact('lugar','el lugar de la glucólisis','Ocurre en el citosol y puede continuar aunque no haya suficiente oxígeno.','La glucólisis ocurre en el citosol y puede continuar con poco oxígeno.',['La glucólisis ocurre únicamente dentro del núcleo celular.','La glucólisis necesita oxígeno como sustrato directo obligatorio y ocurre en la membrana mitocondrial interna.','La glucólisis ocurre solo en la membrana mitocondrial interna.'],'La glucólisis ocurre solo en la mitocondria y necesita O₂ directamente.'),
        fact('balance','el balance neto','2 piruvatos + 2 ATP + 2 NADH','Por cada glucosa, el balance neto incluye 2 piruvatos, 2 ATP y 2 NADH.',['Por cada glucosa, el balance neto es 1 piruvato, ningún ATP y cuatro moléculas de NADH.','Por cada glucosa, el balance neto es 4 piruvatos y 8 ATP.','Por cada glucosa, se consumen todos los ATP sin formar NADH.'],'El balance neto por glucosa es un piruvato, cero ATP y cero NADH.'),
        fact('preparatoria','la fase preparatoria','La célula invierte energía, fosforila la glucosa y la divide en dos triosas.','En la fase preparatoria se invierte energía y se forman dos triosas.',['En la fase preparatoria se producen cuatro ATP sin consumir energía.','En la fase preparatoria se forman directamente dos moléculas de lactato.','En la fase preparatoria la glucosa no se fosforila ni se divide.'],'La fase preparatoria produce energía sin invertir ATP ni dividir la glucosa.'),
        fact('beneficio','la fase de beneficio','Cada G3P se oxida y genera energía; por eso todos los resultados de esta fase se multiplican por dos.','En la fase de beneficio, cada uno de los dos G3P genera energía.',['En la fase de beneficio participa un solo G3P y nada se multiplica.','En la fase de beneficio se consumen cuatro ATP y no se forma NADH.','En la fase de beneficio se reconstruye una glucosa de seis carbonos.'],'En la fase de beneficio solo participa un G3P y los resultados no se duplican.'),
        fact('reaccion1','la primera reacción','Glucosa → glucosa-6-fosfato','La primera reacción convierte glucosa en glucosa-6-fosfato.',['La primera reacción convierte glucosa directamente en piruvato.','La primera reacción convierte PEP en glucosa-6-fosfato.','La primera reacción divide glucosa en G3P y DHAP.'],'La primera reacción de la glucólisis convierte PEP en glucosa.'),
        fact('pfk1','la reacción de PFK-1','F6P → fructosa-1,6-bisfosfato','PFK-1 convierte F6P en fructosa-1,6-bisfosfato.',['PFK-1 convierte piruvato en fosfoenolpiruvato.','PFK-1 convierte glucosa directamente en dos piruvatos.','PFK-1 convierte 3-PG en 2-fosfoglicerato.'],'PFK-1 convierte piruvato en fructosa-6-fosfato.'),
        fact('division','la división en triosas','F1,6BP → G3P + DHAP','La aldolasa divide F1,6BP en G3P y DHAP.',['La aldolasa une dos piruvatos para formar glucosa.','La aldolasa transforma PEP directamente en lactato.','La aldolasa convierte 3-PG en 2-PG sin dividir moléculas.'],'La aldolasa une G3P y DHAP para formar piruvato en esta reacción.'),
        fact('nadh','la formación de NADH','G3P → 1,3-bisfosfoglicerato','La conversión de G3P en 1,3-BPG forma NADH.',['La conversión de G3P en 1,3-BPG consume todo el NADH.','La formación de NADH ocurre al convertir PEP en piruvato.','La reacción de G3P produce glucosa y no añade fosfato.'],'La conversión de G3P en 1,3-BPG consume NADH y no lo forma.'),
        fact('atp','la formación de ATP','1,3-BPG → 3-fosfoglicerato','El paso de 1,3-BPG a 3-PG forma ATP a nivel de sustrato.',['El paso de 1,3-BPG a 3-PG consume ATP de manera irreversible.','El paso de 1,3-BPG a 3-PG forma glucosa de seis carbonos.','El paso de 1,3-BPG a 3-PG ocurre únicamente en la mitocondria.'],'El paso de 1,3-BPG a 3-PG consume ATP y no produce energía.')
      ]
    },
    epidemiologia:{
      anchor:'clase.html#epi-detail',
      containerId:'epi-detail',
      facts:[
        fact('aps','la APS','Es el primer nivel de contacto con el Sistema Nacional de Salud.','La APS es el primer nivel de contacto con el sistema de salud.',['La APS funciona únicamente como atención hospitalaria especializada.','La APS excluye la participación de individuos y familias.','La APS se limita a campañas temporales sin continuidad.'],'La APS corresponde únicamente al último nivel de contacto hospitalario.'),
        fact('almaata','Alma-Ata','1978: Declaración de Alma-Ata.','La Declaración de Alma-Ata corresponde a 1978.',['La Declaración de Alma-Ata corresponde a 2008.','La Declaración de Alma-Ata corresponde a 2018.','La Declaración de Alma-Ata corresponde a 2026.'],'La Declaración de Alma-Ata fue presentada en 2008.'),
        fact('paraguay','la APS en Paraguay','2008: implementación de la estrategia APS en Paraguay.','La implementación de la estrategia APS en Paraguay se sitúa en 2008.',['La implementación de APS en Paraguay se sitúa en 1978, junto con la Declaración de Alma-Ata.','La implementación de APS en Paraguay se sitúa en 2018.','La implementación de APS en Paraguay se sitúa en 2026.'],'El inicio de la estrategia APS en Paraguay se sitúa en 1978.'),
        fact('principios','los principios de APS','Equidad y cobertura universal.','Equidad y cobertura universal forman parte de los principios de APS.',['Selección por capacidad de pago es un principio de APS.','Atención distante de la comunidad es un principio de APS.','El trabajo sin participación comunitaria y la selección por capacidad de pago son principios de APS.'],'La selección por capacidad de pago es un principio central de la APS.'),
        fact('dispensarizacion','la dispensarización','GRUPO II Con factores de riesgo','El Grupo II corresponde a personas con factores de riesgo.',['El Grupo II corresponde únicamente a personas con discapacidad.','El Grupo II corresponde únicamente a personas enfermas.','El Grupo II corresponde únicamente a personas aparentemente sanas.'],'En la dispensarización, el Grupo II corresponde a personas con discapacidad.'),
        fact('integralidad','la atención integral','Persona, familia, comunidad y ambiente durante todo el curso de vida.','La atención integral considera persona, familia, comunidad y ambiente.',['La atención integral considera solo el órgano con síntomas.','La atención integral excluye familia, comunidad y ambiente y se centra en el órgano con síntomas.','La atención integral se limita únicamente a recuperación.'],'La atención integral considera solo a la persona y excluye su entorno.'),
        fact('familia','el ciclo familiar','Formación Pareja reciente, todavía sin hijos.','La etapa de formación corresponde a una pareja reciente sin hijos.',['La etapa de formación empieza cuando todos los hijos se independizan.','La etapa de formación corresponde únicamente a afrontar pérdidas.','La etapa de formación comienza en la dispersión de los hijos.'],'La formación familiar comienza cuando los hijos se independizan.'),
        fact('sectorizacion','la sectorización','Su objetivo es identificar y vigilar familias o comunidades con riesgo sanitario y distribuir recursos con equidad.','La sectorización identifica riesgos y ayuda a distribuir recursos con equidad.',['La sectorización divide a las personas según su capacidad de pago y asigna recursos con ese criterio.','La sectorización evita asignar responsables a cada territorio.','La sectorización elimina el seguimiento de familias de riesgo.'],'La sectorización busca evitar la vigilancia de riesgos y la distribución equitativa.'),
        fact('triage','el triage','Prioriza por gravedad clínica; no por orden de llegada.','El triage prioriza por gravedad clínica y no por orden de llegada.',['El triage atiende siempre por orden de llegada sin excepciones.','El triage clasifica únicamente por edad, número de acompañantes y orden de llegada.','El triage sustituye el diagnóstico y el tratamiento definitivo.'],'El triage debe seguir únicamente el orden de llegada.'),
        fact('emergencia','la emergencia','Existe amenaza vital o de órgano y no puede esperar.','Una emergencia implica amenaza vital o de órgano y atención inmediata.',['Una emergencia es una consulta estable que puede esperar sin riesgo de deterioro vital o de órgano.','Una emergencia se decide solo por la percepción del acompañante.','Una emergencia nunca requiere interrumpir una actividad menos urgente.'],'Una emergencia puede esperar porque no existe amenaza vital ni de órgano.')
      ]
    },
    'microbiologia-teorica':{
      anchor:'clase.html#micro-theory-detail',
      containerId:'micro-theory-detail',
      facts:[
        fact('definicion','las dermatofitosis','Las dermatofitosis son micosis cutáneas producidas por hongos que colonizan tejidos queratinizados.','Las dermatofitosis afectan tejidos queratinizados.',['Las dermatofitosis afectan únicamente órganos internos no queratinizados.','Las dermatofitosis son siempre infecciones bacterianas profundas.','Las dermatofitosis se limitan exclusivamente a la sangre.'],'Las dermatofitosis son infecciones bacterianas de tejidos no queratinizados.'),
        fact('generos','los géneros clásicos','Agentes clásicos: Trichophyton, Microsporum y Epidermophyton.','Trichophyton, Microsporum y Epidermophyton son los tres géneros clásicos.',['Candida, Aspergillus y Cryptococcus son los tres dermatofitos clásicos descritos en las dermatofitosis.','Malassezia, Rhizopus y Mucor son los tres dermatofitos clásicos.','Sporothrix, Histoplasma y Candida son los tres dermatofitos clásicos.'],'Candida, Aspergillus y Cryptococcus son los tres géneros dermatofitos clásicos.'),
        fact('tejidos','los tejidos afectados por Trichophyton','Puede afectar los tres tejidos queratinizados.','Trichophyton puede afectar piel, pelo y uñas.',['Trichophyton afecta solamente el pelo y nunca la piel.','Trichophyton afecta solo las uñas y nunca el pelo.','Trichophyton no afecta ningún tejido queratinizado.'],'Trichophyton afecta únicamente las uñas y no la piel ni el pelo.'),
        fact('transmision','la transmisión zoofílica','Animal → humano','Zoofílico significa transmisión de animal a humano.',['Zoofílico significa transmisión exclusiva de humano a humano.','Zoofílico significa transmisión del suelo directamente al humano.','Zoofílico significa ausencia completa de un reservorio animal.'],'Zoofílico significa transmisión exclusivamente de humano a humano.'),
        fact('capitis','la tinea capitis','Cuero cabelludo y pelo: descamación, pelos rotos, alopecia en placas o querion.','Tinea capitis afecta cuero cabelludo y pelo.',['Tinea capitis afecta únicamente la ingle y el muslo proximal.','Tinea capitis afecta solo las uñas de manos y pies.','Tinea capitis nombra una infección exclusiva del tronco.'],'Tinea capitis afecta únicamente la ingle y no el cuero cabelludo.'),
        fact('caso','un cuadro compatible con tiña capitis inflamatoria','El conjunto orienta a tiña capitis inflamatoria','El caso del niño con alopecia, pelos fracturados y contacto con perro orienta a tiña capitis inflamatoria.',['El cuadro de alopecia, pelos fracturados y contacto con perro orienta a una infección bacteriana de la uña y descarta compromiso del cuero cabelludo.','El caso descarta una lesión del cuero cabelludo y del pelo.','El caso orienta a tinea cruris sin necesidad de confirmación.'],'El caso de alopecia y pelos fracturados descarta una tiña capitis.'),
        fact('muestra','la muestra en dermatofitosis','Raspado del borde activo; pelo/escama en capitis; recorte y detrito subungueal en uñas.','La muestra cambia según el sitio: borde, pelo o material ungueal.',['La misma muestra de sangre se usa obligatoriamente para todas las tiñas.','En capitis nunca se toman pelos ni escamas afectados.','En uñas se toma únicamente saliva y se descartan el recorte y el material subungueal.'],'La muestra es igual para todos los sitios y nunca incluye pelo ni uña.'),
        fact('koh','el examen con KOH','El hidróxido de potasio aclara queratina y permite ver hifas septadas o artroconidios; no define por sí solo la especie.','El KOH aclara queratina y ayuda a ver hifas o artroconidios.',['El KOH identifica por sí solo y con certeza cualquier especie.','El KOH impide observar hifas y oscurece la queratina.','El KOH se usa únicamente para medir signos vitales.'],'El KOH define por sí solo la especie exacta del dermatofito.'),
        fact('cultivo','el cultivo','Sabouraud u otro medio apropiado, morfología y pruebas adicionales para identificar el agente.','El cultivo y la morfología ayudan a identificar el agente.',['La apariencia clínica sola identifica siempre la especie exacta.','El cultivo no participa nunca en la identificación del agente.','Sabouraud se usa únicamente para medir la presión arterial.'],'El cultivo y la morfología no ayudan a identificar el agente.'),
        fact('tratamiento','el tratamiento de tinea capitis','La tiña capitis necesita un antifúngico oral para alcanzar el folículo.','La tiña capitis necesita tratamiento antifúngico oral.',['La tiña capitis se trata siempre solo con champú como monoterapia.','La tiña capitis nunca requiere alcanzar el folículo piloso.','La tiña capitis se trata únicamente con corticoide tópico aislado.'],'El champú antifúngico solo siempre basta para tratar la tiña capitis.')
      ]
    },
    'microbiologia-practica':{
      anchor:'clase.html#micro-detail',
      containerId:'micro-detail',
      facts:[
        fact('objetivo','el objetivo de la práctica','Cultivar, observar y diferenciar hongos','La práctica busca cultivar, observar y diferenciar hongos.',['La práctica busca únicamente contar bacterias en una muestra de sangre.','La práctica busca evitar cualquier observación macro o microscópica.','La práctica busca medir solo la presión arterial del estudiante.'],'La práctica no busca observar ni diferenciar hongos.'),
        fact('muestra','la muestra para la práctica','Pan duro con moho','La muestra preferida es pan duro con moho dentro de un recipiente cerrado.',['La muestra preferida es un líquido abierto y sin identificar.','La muestra debe abrirse y olerse en casa antes de llevarla.','La muestra preferida es un alimento destinado todavía al consumo y transportado en un recipiente abierto.'],'La muestra debe llevarse abierta y olerse antes de entrar al laboratorio.'),
        fact('levadura','la levadura','Principalmente unicelular','La levadura es principalmente unicelular.',['La levadura es siempre un organismo filamentoso multicelular.','La levadura está formada únicamente por un micelio aéreo.','La levadura carece de cualquier forma celular individual.'],'La levadura es siempre filamentosa y multicelular.'),
        fact('moho','el moho','Hifas que forman un micelio','El moho presenta hifas que forman un micelio.',['El moho está compuesto solo por células sanguíneas aisladas.','El moho no presenta hifas ni ninguna estructura filamentosa.','El moho corresponde únicamente a una bacteria unicelular.'],'El moho no forma hifas ni micelio.'),
        fact('dimorfico','el hongo dimórfico','Cambia de morfología según las condiciones','Un hongo dimórfico cambia de morfología según las condiciones.',['Un hongo dimórfico conserva siempre una única forma sin cambios.','Un hongo dimórfico es obligatoriamente una bacteria esférica.','Un hongo dimórfico no presenta una forma ambiental ni una forma tisular y conserva la misma morfología.'],'Un hongo dimórfico mantiene siempre la misma morfología.'),
        fact('hifa','la hifa','Filamento individual; puede ser septado o cenocítico.','Una hifa es un filamento individual que puede ser septado o cenocítico.',['Una hifa es el conjunto completo de todas las colonias bacterianas que forman el cuerpo vegetativo.','Una hifa es únicamente una espora sexual libre y sin filamento.','Una hifa es un medio de cultivo compuesto por agar y glucosa.'],'Una hifa es el conjunto de hifas y no un filamento individual.'),
        fact('micelio','el micelio','Conjunto de hifas que constituye el cuerpo vegetativo.','El micelio es el conjunto de hifas del cuerpo vegetativo.',['El micelio es una sola hifa aislada sin relación con otras.','El micelio es únicamente el recipiente donde se prepara el agar.','El micelio es una célula sanguínea que transporta oxígeno.'],'El micelio corresponde a una sola hifa aislada.'),
        fact('conidios','los conidios','Tallo especializado que sostiene esporas asexuales externas.','El conidióforo sostiene conidios, que son esporas asexuales externas.',['El conidióforo contiene siempre un saco cerrado con esporangiosporas.','Los conidios son células humanas que forman el tejido muscular y se almacenan dentro de un esporangio.','El conidióforo es el nombre del pH ácido del agar Sabouraud.'],'Los conidios se forman siempre dentro de un esporangio cerrado.'),
        fact('sabouraud','el agar Sabouraud','Contiene peptonas, glucosa y agar.','El agar Sabouraud contiene peptonas, glucosa y agar.',['El agar Sabouraud contiene únicamente agua y sal sin nutrientes.','El agar Sabouraud contiene solo sangre y no posee agar.','El agar Sabouraud carece de glucosa y de peptonas.'],'El agar Sabouraud no contiene glucosa, peptonas ni agar.'),
        fact('preparacion','la preparación observada','La demostración utilizó 10 g de polvo.','La demostración utilizó 10 g de polvo con 100 mL de agua destilada.',['La demostración utilizó 100 g de polvo sin añadir agua.','La demostración sembró la muestra antes de preparar el medio.','La demostración indicó abrir y oler el cultivo durante el calentamiento y utilizar 100 g de polvo sin agua destilada.'],'La demostración utilizó 100 g de polvo sin agua destilada.')
      ]
    }
  };

  var directPrompts = {
    nutricion:{
      alimentacion:'¿Qué acciones forman parte de la alimentación?',
      cantidad:'¿Qué debe comprobarse al aplicar la ley de cantidad?',
      calidad:'¿Qué falta revisar para valorar la calidad cuando las calorías son suficientes?',
      armonia:'¿Cómo deben relacionarse los grupos de alimentos para cumplir la armonía?',
      adecuacion:'¿Qué elementos obligan a adaptar una recomendación alimentaria?',
      variedad:'¿Qué práctica mejora realmente la variedad de la dieta?',
      balance:'¿Qué ocurre cuando la ingesta y el gasto se mantienen desequilibrados en el tiempo?',
      plato:'¿Qué grupo ocupa la mitad en la técnica del plato?',
      energeticos:'¿Qué nutrientes predominan en los alimentos energéticos?',
      enriquecido:'¿Qué significa «enriquecido» en el uso presentado para una harina refinada?'
    },
    'fisiologia-2026-08-13':{
      retroalimentacion:'¿Cómo responde el organismo ante un cambio químico o mecánico que altera la respiración?',
      grd:'¿Qué función cumple el grupo respiratorio dorsal?',
      grv:'¿Cuándo participa más el grupo respiratorio ventral y qué neuronas contiene?',
      grp:'¿Qué transición respiratoria ayuda a coordinar el grupo pontino?',
      central:'¿Qué cambio detecta principalmente el quimiorreceptor central?',
      carotideo:'¿Ante qué cambios arteriales responde el cuerpo carotídeo?',
      aortico:'¿Por qué nervio llegan al tronco las aferencias del cuerpo aórtico?',
      hering:'¿Qué vía aferente interviene en el reflejo de Hering–Breuer?',
      voluntario:'¿Hasta dónde puede imponerse el control voluntario sobre la respiración?',
      epoc:'¿Qué patrón sugieren una espiración prolongada, sibilancias y un FEV₁ reducido?'
    },
    'fisiologia-2026-08-10':{
      secuencia:'¿Qué función corresponde a ventilación, difusión, perfusión y transporte?',
      fick:'¿Cómo modifican el área, el gradiente y el grosor la difusión gaseosa?',
      gradiente:'¿En qué dirección se desplaza un gas según su presión parcial?',
      enfisema:'¿Por qué el enfisema reduce la capacidad de difusión?',
      grosor:'¿Qué efecto tienen el edema o la fibrosis sobre el intercambio gaseoso?',
      oxigeno:'¿Cómo se transporta la mayor parte del O₂ en la sangre?',
      co2:'¿Cuál es la forma principal de transporte del CO₂ y cuáles la acompañan?',
      vq:'¿Cómo cambia la relación V/Q en una región perfundida pero poco ventilada?',
      bohr:'¿Qué efecto tiene el fenómeno de Bohr sobre la liberación de O₂?',
      haldane:'¿Qué acepta mejor la desoxihemoglobina en el efecto Haldane?'
    },
    bioquimica:{
      objetivo:'¿Qué productos carbonados se obtienen de una glucosa al terminar la glucólisis?',
      lugar:'¿Dónde ocurre la glucólisis y qué sucede si hay poco oxígeno?',
      balance:'¿Cuál es el balance neto de una molécula de glucosa?',
      preparatoria:'¿Qué ocurre con la glucosa durante la fase preparatoria?',
      beneficio:'¿Por qué los productos de la fase de beneficio aparecen duplicados?',
      reaccion1:'¿Qué producto se forma en la primera reacción de la glucólisis?',
      pfk1:'¿Qué transformación cataliza la PFK-1?',
      division:'¿Qué moléculas produce la aldolasa al dividir F1,6BP?',
      nadh:'¿En qué paso de la vía se forma NADH?',
      atp:'¿Qué ocurre al pasar de 1,3-BPG a 3-PG?'
    },
    epidemiologia:{
      aps:'¿Qué lugar ocupa la APS dentro del sistema de salud?',
      almaata:'¿En qué año se firmó la Declaración de Alma-Ata?',
      paraguay:'¿En qué año comenzó la estrategia de APS en Paraguay?',
      principios:'¿Qué principios garantizan que la APS llegue a toda la población?',
      dispensarizacion:'¿A quién corresponde el Grupo II de dispensarización?',
      integralidad:'¿Qué dimensiones incluye una atención verdaderamente integral?',
      familia:'¿Qué situación identifica la etapa de formación del ciclo familiar?',
      sectorizacion:'¿Para qué sirve dividir un territorio en sectores sanitarios?',
      triage:'¿Qué criterio determina primero el orden de atención en el triage?',
      emergencia:'¿Qué hallazgo convierte una situación en emergencia?'
    },
    'microbiologia-teorica':{
      definicion:'¿Qué tejidos colonizan los hongos que producen dermatofitosis?',
      generos:'¿Cuáles son los tres géneros clásicos de dermatofitos?',
      tejidos:'¿Qué tejidos queratinizados puede afectar Trichophyton?',
      transmision:'¿Qué significa que un dermatofito tenga transmisión zoofílica?',
      capitis:'¿Qué zona afecta la tinea capitis?',
      caso:'¿Qué diagnóstico reúne alopecia, pelos fracturados, inflamación y contacto con un perro?',
      muestra:'¿Cómo debe elegirse la muestra según el sitio afectado?',
      koh:'¿Para qué sirve el examen directo con KOH y cuál es su límite?',
      cultivo:'¿Qué información aporta el cultivo junto con la morfología?',
      tratamiento:'¿Por qué la tinea capitis necesita un antifúngico por vía oral?'
    },
    'microbiologia-practica':{
      objetivo:'¿Cuál es el objetivo de la práctica con hongos?',
      muestra:'¿Cómo debe transportarse la muestra de pan con moho?',
      levadura:'¿Qué organización celular caracteriza a una levadura?',
      moho:'¿Qué estructuras forman el cuerpo vegetativo de un moho?',
      dimorfico:'¿Qué significa que un hongo sea dimórfico?',
      hifa:'¿Qué es una hifa y qué formas puede presentar?',
      micelio:'¿Qué relación existe entre el micelio y las hifas?',
      conidios:'¿Qué estructuras sostiene un conidióforo?',
      sabouraud:'¿Qué componentes forman el agar Sabouraud?',
      preparacion:'¿Qué proporción se utilizó para preparar el medio observado?'
    }
  };

  var casePairIndexes = {
    nutricion:[4,6,5,7,2,3,1,3,2,2],
    'fisiologia-2026-08-13':[4,3,9,1,5,6,5,8,4,2],
    'fisiologia-2026-08-10':[1,4,1,1,1,8,9,0,5,6],
    bioquimica:[2,0,4,7,2,6,7,4,4,4],
    epidemiologia:[3,0,0,0,5,7,7,4,9,8],
    'microbiologia-teorica':[1,2,4,5,6,4,7,8,9,4],
    'microbiologia-practica':[8,9,3,6,2,6,5,3,9,8]
  };

  var clinicalStories = {
    nutricion:{
      alimentacion:'La paciente Lucía consulta porque quiere ordenar su alimentación. Cuenta que elige los alimentos, los compra, prepara sus comidas y decide a qué hora y de qué manera las consume.',
      cantidad:'Un paciente alterna días con porciones insuficientes y otros con ingestas excesivas. Durante la evaluación se busca cubrir sus necesidades sin quedar por debajo ni superarlas.',
      calidad:'El paciente Mateo alcanza la cantidad de calorías prevista, pero su alimentación se concentra en pocos alimentos. El equipo revisa proteínas, carbohidratos, grasas, fibra, agua, vitaminas y minerales antes de considerarla adecuada.',
      armonia:'Una paciente presenta un plato dominado por almidones y con muy poca participación de los otros grupos. Aunque la cantidad total parece suficiente, se analiza la relación entre sus componentes.',
      adecuacion:'La paciente Rosa necesita una orientación alimentaria, pero tiene dificultad para masticar, presupuesto limitado y preferencias culturales definidas. La indicación debe considerar también su etapa de vida y su capacidad para preparar alimentos.',
      variedad:'Un paciente come exactamente el mismo menú todos los días porque piensa que repetir un alimento saludable es suficiente. En la consulta se evalúa cómo ampliar su selección sin perder la organización.',
      balance:'Durante varios meses, la ingesta energética de una paciente ha superado de manera sostenida su gasto. El equipo analiza la tendencia acumulada y no una variación aislada del peso de un solo día.',
      plato:'Un paciente quiere una guía visual sencilla para organizar su almuerzo. Pregunta qué proporción del plato debería reservar para verduras y frutas antes de completar los demás grupos.',
      energeticos:'Durante la entrevista alimentaria, un paciente pregunta por la función principal del pan, el arroz y los aceites que consume. El profesional debe ubicar estos alimentos según el aporte que predomina en ellos.',
      enriquecido:'Una paciente lee que una harina refinada está “enriquecida” después de su procesamiento. Quiere saber si el término indica que se repusieron nutrientes perdidos o que el alimento quedó sin procesar.'
    },
    'fisiologia-2026-08-13':{
      retroalimentacion:'Un paciente presenta un cambio químico que altera su respiración. El organismo detecta el cambio, lo integra en el tronco encefálico y ajusta la frecuencia y la profundidad respiratorias.',
      grd:'Durante la evaluación de un paciente se estudia el grupo con predominio inspiratorio que recibe e integra aferencias en el núcleo del tracto solitario. Se quiere identificar qué componente contribuye al patrón inspiratorio.',
      grv:'Un paciente aumenta mucho su demanda ventilatoria. En ese momento participa con mayor intensidad un grupo que contiene neuronas inspiratorias y espiratorias e incluye el complejo pre-Bötzinger.',
      grp:'En un paciente, la inspiración debe terminar de forma coordinada para dar paso a la espiración. Se analiza el grupo que modula esa transición entre ambas fases respiratorias.',
      central:'Un paciente presenta aumento de PaCO₂ y el pH de su líquido cefalorraquídeo cambia. Se busca identificar el sensor que responde principalmente a esa variación de pH.',
      carotideo:'Un paciente desarrolla una PaO₂ arterial baja, acompañada de cambios de PaCO₂ y pH. El equipo analiza qué sensor periférico detecta de manera directa esta combinación.',
      aortico:'En un paciente se activan los cuerpos aórticos y la señal debe llegar al tronco encefálico. Se pregunta por qué nervio viaja esa aferencia.',
      hering:'Durante una ventilación con distensión pulmonar marcada, el paciente activa un reflejo protector. La señal aferente se transmite por el nervio vago hacia el tronco encefálico.',
      voluntario:'Una paciente contiene voluntariamente la respiración durante unos segundos. Con el tiempo, el impulso químico aumenta y termina imponiéndose sobre el control cortical.',
      epoc:'Un paciente consulta por dificultad respiratoria y presenta espiración prolongada, sibilancias y FEV₁ reducido. El equipo debe reconocer el patrón funcional que reúne estos hallazgos.'
    },
    'fisiologia-2026-08-10':{
      secuencia:'Un paciente recibe aire hasta los alvéolos, pero para oxigenar los tejidos también necesita difusión, perfusión y transporte sanguíneo. El equipo sigue el recorrido completo para localizar dónde podría fallar el intercambio.',
      fick:'Un paciente presenta una barrera alveolocapilar más gruesa. Aunque existe gradiente, el equipo analiza cómo el aumento del espesor modifica el paso de los gases.',
      gradiente:'En los alvéolos de un paciente, un gas tiene mayor presión parcial que en la sangre que llega al capilar. Se debe predecir la dirección de su desplazamiento.',
      enfisema:'Un paciente ha perdido superficie disponible para el intercambio gaseoso por enfisema. El equipo analiza por qué esa pérdida reduce su capacidad de difusión.',
      grosor:'Un paciente presenta edema que aumenta el espesor de la barrera alveolocapilar. Se evalúa cómo esa mayor distancia afecta la velocidad del intercambio gaseoso.',
      oxigeno:'En una muestra sanguínea de un paciente se compara el oxígeno unido a hemoglobina con la pequeña fracción disuelta. El equipo debe identificar la forma de transporte predominante.',
      co2:'En la sangre de un paciente se cuantifican bicarbonato, compuestos carbamino y CO₂ disuelto. Se pregunta cuál de estas formas representa la vía principal de transporte del CO₂.',
      vq:'Una región pulmonar de un paciente recibe sangre, pero muy poca ventilación. El equipo debe interpretar cómo cambia la relación entre ventilación y perfusión en esa zona.',
      bohr:'Durante actividad tisular, un paciente necesita facilitar la descarga de oxígeno desde la hemoglobina. Se analiza el desplazamiento de la curva asociado con el efecto Bohr.',
      haldane:'En los tejidos de un paciente aumenta la proporción de desoxihemoglobina. El equipo evalúa cómo este estado influye en la aceptación de CO₂ y H⁺.'
    },
    bioquimica:{
      objetivo:'Un paciente necesita obtener energía a partir de una molécula de glucosa. El equipo sigue la vía hasta sus productos finales y debe reconocer cuántos piruvatos se forman.',
      lugar:'Durante un período de baja disponibilidad de oxígeno, las células de un paciente mantienen activa la glucólisis. Se analiza en qué compartimento celular ocurre esta vía.',
      balance:'En una muestra celular de un paciente se metaboliza una molécula de glucosa completa. El laboratorio debe registrar el balance neto de piruvato, ATP y NADH.',
      preparatoria:'Al comenzar la glucólisis en las células de un paciente, la glucosa se fosforila y luego se divide. El equipo distingue esta etapa de inversión de la fase que recupera energía.',
      beneficio:'En una muestra de un paciente ya se formaron dos moléculas de G3P. Ambas avanzan por la fase de beneficio, por lo que los productos de esas reacciones aparecen duplicados.',
      reaccion1:'En las células de un paciente acaba de entrar glucosa y comienza la primera reacción glucolítica. El equipo debe identificar el producto que se forma tras añadir el primer fosfato.',
      pfk1:'En una muestra celular de un paciente se estudia la reacción catalizada por PFK-1. Se observa el paso desde F6P hacia el compuesto bisfosforilado correspondiente.',
      division:'En una muestra de un paciente, la aldolasa actúa sobre F1,6BP. El equipo sigue la división de esa molécula en las dos triosas resultantes.',
      nadh:'Durante el análisis de la glucólisis de un paciente, el G3P se convierte en 1,3-BPG. El laboratorio quiere identificar qué transportador reducido se forma en ese paso.',
      atp:'En las células de un paciente, el 1,3-BPG se transforma en 3-PG. El equipo estudia la formación de energía a nivel de sustrato durante esta reacción.'
    },
    epidemiologia:{
      aps:'Una persona con un problema de salud busca por primera vez atención dentro del Sistema Nacional de Salud. La unidad cercana a su comunidad debe funcionar como puerta de entrada y mantener continuidad.',
      almaata:'Una familia participa en una actividad comunitaria sobre el origen internacional de la atención primaria. El equipo debe ubicar en el tiempo la Declaración de Alma-Ata mencionada en la explicación.',
      paraguay:'Una paciente pregunta desde cuándo se implementa la estrategia de atención primaria en Paraguay. El profesional debe distinguir esa fecha de la Declaración internacional de 1978.',
      principios:'Una familia con recursos limitados necesita acceder al mismo sistema de salud que el resto de la comunidad. El equipo analiza qué principios sostienen una atención equitativa y con cobertura universal.',
      dispensarizacion:'Durante una visita domiciliaria, una persona no presenta una enfermedad diagnosticada, pero sí factores de riesgo que requieren seguimiento. El equipo debe asignarla al grupo correspondiente de dispensarización.',
      integralidad:'Una paciente consulta por un síntoma, pero su situación también depende de la familia, la comunidad y el ambiente. El equipo organiza una atención que la acompañe a lo largo de la vida.',
      familia:'Una pareja reciente, todavía sin hijos, solicita orientación en la unidad de salud. Para planificar el acompañamiento se debe reconocer la etapa de su ciclo familiar.',
      sectorizacion:'En un territorio se identifican varias familias con riesgo sanitario y recursos limitados. El equipo necesita asignar responsables, vigilar esos riesgos y distribuir la atención con equidad.',
      triage:'Dos pacientes llegan casi al mismo tiempo: uno está estable y el otro presenta mayor gravedad clínica. El personal debe decidir el orden de atención sin basarse solo en quién llegó primero.',
      emergencia:'Un paciente llega con una amenaza inmediata para la vida o para un órgano. El equipo debe clasificar la situación y actuar sin demora.'
    },
    'microbiologia-teorica':{
      definicion:'Un paciente presenta una micosis limitada a piel, pelo o uñas. El equipo sospecha hongos capaces de colonizar tejidos queratinizados.',
      generos:'En el estudio de una lesión queratinizada de un paciente se consideran los dermatofitos clásicos. El laboratorio debe reconocer los tres géneros incluidos en ese grupo.',
      tejidos:'Un paciente presenta lesiones compatibles en piel, pelo y uñas. El laboratorio valora un género de dermatofito capaz de afectar los tres tejidos queratinizados.',
      transmision:'Un niño desarrolla una lesión después del contacto cercano con un animal infectado. El equipo debe nombrar el tipo de transmisión que va del animal al ser humano.',
      capitis:'Un niño consulta por descamación del cuero cabelludo, pelos rotos y alopecia en placas. El equipo debe identificar la localización de la tiña que mejor reúne esos datos.',
      caso:'Un niño presenta alopecia, pelos fracturados y una lesión inflamatoria después de contacto con un perro. El conjunto de antecedentes y hallazgos debe orientar el diagnóstico.',
      muestra:'Un paciente tiene una lesión en el borde de la piel, otro compromiso del cuero cabelludo y otro alteración ungueal. El laboratorio debe elegir una muestra diferente según cada sitio afectado.',
      koh:'De una lesión queratinizada de un paciente se obtiene una muestra para examen directo. El laboratorio busca aclarar la queratina y observar hifas septadas o artroconidios sin afirmar todavía la especie.',
      cultivo:'Después del examen directo de una muestra de un paciente, todavía falta identificar el agente. El laboratorio considera el crecimiento en Sabouraud, la morfología y pruebas adicionales.',
      tratamiento:'Un niño presenta tinea capitis con afectación del folículo piloso. El equipo debe elegir una vía terapéutica capaz de alcanzar esa localización.'
    },
    'microbiologia-practica':{
      objetivo:'Para comprender un posible hongo aislado de un paciente, el laboratorio organiza una secuencia de cultivo, observación y diferenciación. Se debe reconocer el objetivo general de ese trabajo.',
      muestra:'Antes de analizar muestras de pacientes, el equipo practica con pan duro con moho. El material debe llegar dentro de un recipiente cerrado y no abrirse para olerlo.',
      levadura:'En una muestra de un paciente se observa un hongo formado principalmente por células individuales. El equipo debe distinguir esta morfología de una red de filamentos.',
      moho:'En el cultivo relacionado con un paciente se observan filamentos que se conectan y forman una masa vegetativa. El equipo debe reconocer la organización propia de un moho.',
      dimorfico:'El hongo estudiado en un paciente cambia de morfología cuando cambian las condiciones. El laboratorio debe identificar cómo se denomina esa capacidad.',
      hifa:'En la preparación microscópica de una muestra de un paciente se observa un filamento individual, con posibilidad de ser septado o cenocítico. El equipo debe nombrar esa estructura.',
      micelio:'En el cultivo de una muestra de un paciente se observa el conjunto de numerosos filamentos que constituye el cuerpo vegetativo. Se debe diferenciar el conjunto de cada filamento individual.',
      conidios:'En un aislamiento de un paciente se observa un tallo especializado con esporas asexuales externas. El equipo debe relacionar el conidióforo con las estructuras que sostiene.',
      sabouraud:'Para cultivar un posible hongo procedente de un paciente, el laboratorio prepara un medio con peptonas, glucosa y agar. Se debe identificar el medio que reúne esos componentes.',
      preparacion:'Antes de procesar la muestra de un paciente, el equipo reproduce la preparación observada del medio. Utiliza 10 g de polvo con 100 mL de agua destilada y verifica esa proporción antes de sembrar.'
    }
  };

  function cleanSentence(value){
    return String(value || '').replace(/[.;:]\s*$/,'').trim();
  }

  function lowerStart(value){
    var text = cleanSentence(value);
    return text ? text.charAt(0).toLocaleLowerCase('es') + text.slice(1) : text;
  }

  function upperStart(value){
    var text = cleanSentence(value);
    return text ? text.charAt(0).toLocaleUpperCase('es') + text.slice(1) : text;
  }

  function combine(left,right,connector){
    return cleanSentence(left) + '. ' + connector + ', ' + lowerStart(right) + '.';
  }

  function explanationFor(item,partner){
    var explanation = 'Dato que justifica la respuesta: «' + item.evidence + '»';
    if(partner) explanation += ' Relación utilizada: «' + partner.evidence + '»';
    return explanation;
  }

  function balancedOptions(item){
    return [item.correct].concat(item.wrong);
  }

  function pairedOptions(item,partner,mode,index){
    var comparisonConnectors = [
      'Además','A la vez','En paralelo','Junto con esto','Por otra parte',
      'En esa misma comparación','Como dato complementario','En relación con el segundo punto','Al integrar ambas ideas','De forma simultánea'
    ];
    var caseConnectors = [
      'Para completar la interpretación','En la misma decisión','Al valorar el caso','Como segundo dato','Para orientar la conducta',
      'Dentro del mismo razonamiento clínico','Al integrar el otro hallazgo','Como parte de la valoración','Para cerrar el análisis','En la conducta propuesta'
    ];
    var connectors = mode === 'case' ? caseConnectors : comparisonConnectors;
    var connector = connectors[index % connectors.length];
    return [
      combine(item.correct,partner.correct,connector),
      combine(item.wrong[0],partner.correct,connector),
      combine(item.correct,partner.wrong[1],connector),
      combine(item.wrong[2],partner.wrong[2],connector)
    ];
  }

  function comparisonPrompt(item,partner,index){
    var prompts = [
      '¿Qué opción relaciona correctamente ' + item.label + ' con ' + partner.label + '?',
      '¿Qué combinación es correcta al comparar ' + item.label + ' y ' + partner.label + '?',
      '¿Qué relación entre ' + item.label + ' y ' + partner.label + ' mantiene correctos los dos datos?',
      '¿Cómo se conectan correctamente ' + item.label + ' y ' + partner.label + '?',
      '¿Qué respuesta distingue sin confundir ' + item.label + ' y ' + partner.label + '?',
      '¿Cuál es la asociación correcta entre ' + item.label + ' y ' + partner.label + '?',
      '¿Qué comparación conserva la función de ' + item.label + ' y la de ' + partner.label + '?',
      '¿Qué opción presenta correctamente tanto ' + item.label + ' como ' + partner.label + '?',
      '¿Cuál de estas relaciones permite diferenciar ' + item.label + ' de ' + partner.label + '?',
      '¿Qué par de afirmaciones describe bien ' + item.label + ' y ' + partner.label + '?'
    ];
    return prompts[index % prompts.length];
  }

  function clinicalPrompt(item,index){
    var prompts = [
      '¿Qué interpretación reúne mejor los hallazgos del caso al analizar ' + item.label + '?',
      '¿Cómo debe razonarse ante esta situación al evaluar ' + item.label + '?',
      '¿Qué conclusión es correcta para este caso en relación con ' + item.label + '?',
      '¿Qué respuesta explica mejor los hallazgos vinculados con ' + item.label + '?',
      '¿Qué decisión integra los datos del caso al considerar ' + item.label + '?',
      '¿Qué interpretación clínica corresponde a los datos observados sobre ' + item.label + '?',
      '¿Cuál es la mejor explicación del caso al valorar ' + item.label + '?',
      '¿Qué opción permite resolver este caso usando correctamente ' + item.label + '?',
      '¿Qué conclusión orienta mejor la valoración de ' + item.label + ' en este paciente?',
      '¿Cómo se aplicaría correctamente ' + item.label + ' a la situación descrita?'
    ];
    return prompts[index % prompts.length];
  }

  function metadata(item,topic,angle,partner){
    var result = {
      grounding:POLICY,
      evidenceId:topic.containerId + ':' + item.key,
      evidence:item.evidence,
      sourceAnchor:topic.anchor,
      learningAngle:angle
    };
    if(partner) result.supportingEvidenceId = topic.containerId + ':' + partner.key;
    return result;
  }

  function qcm(item,topic,courseId,variant,index){
    var relational = variant === 1;
    var partner = relational ? topic.facts[(index + 1) % topic.facts.length] : null;
    var prompt = relational
      ? comparisonPrompt(item,partner,index)
      : directPrompts[courseId] && directPrompts[courseId][item.key];
    if(!prompt) throw new Error('Pregunta directa ausente: ' + courseId + '/' + item.key);
    var question = {
      questionKind:relational ? 'relation' : 'direct',
      prompt:prompt,
      options:relational ? pairedOptions(item,partner,'comparison',index) : balancedOptions(item),
      answer:0,
      explanation:explanationFor(item,partner)
    };
    return Object.assign(question,metadata(item,topic,relational ? 'relation' : 'direct',partner));
  }

  function trueFalse(item,topic,index){
    var isTrue = index % 2 === 0;
    var trueStems = [
      'Es correcto afirmar que, en ' + item.label + ', ' + lowerStart(item.evidence) + '.',
      upperStart(item.label) + ' se caracteriza por lo siguiente: ' + cleanSentence(item.evidence) + '.',
      'Al analizar ' + item.label + ', debe cumplirse esta relación: ' + cleanSentence(item.evidence) + '.',
      'Respecto a ' + item.label + ', el dato correcto es: ' + cleanSentence(item.evidence) + '.',
      'En ' + item.label + ', la relación propuesta es: ' + cleanSentence(item.evidence) + '.'
    ];
    var falseStems = [
      'Es correcto afirmar que, en ' + item.label + ', ' + lowerStart(item.falseStatement) + '.',
      upperStart(item.label) + ' se define así: ' + cleanSentence(item.falseStatement) + '.',
      'Al analizar ' + item.label + ', se obtiene esta conclusión: ' + cleanSentence(item.falseStatement) + '.',
      'Respecto a ' + item.label + ', se propone que ' + lowerStart(item.falseStatement) + '.',
      'En ' + item.label + ', se cumple que ' + lowerStart(item.falseStatement) + '.'
    ];
    var statement = (isTrue ? trueStems : falseStems)[index % 5];
    var question = {
      prompt:statement,
      options:['Verdadero','Falso'],
      answer:isTrue ? 0 : 1,
      explanation:explanationFor(item)
    };
    return Object.assign(question,metadata(item,topic,'verification'));
  }

  function application(item,topic,courseId,index){
    var scenario = clinicalStories[courseId] && clinicalStories[courseId][item.key];
    if(!scenario) throw new Error('Historia clínica ausente: ' + courseId + '/' + item.key);
    var pairIndexes = casePairIndexes[courseId];
    var partner = topic.facts[pairIndexes[index]];
    if(!partner) throw new Error('Relación clínica ausente: ' + courseId + '/' + item.key);
    var question = {
      scenario:scenario,
      prompt:clinicalPrompt(item,index),
      options:pairedOptions(item,partner,'case',index),
      answer:0,
      explanation:explanationFor(item,partner)
    };
    return Object.assign(question,metadata(item,topic,'clinical-integration',partner));
  }

  Object.keys(topics).forEach(function(courseId,courseIndex){
    var bank = banks[courseId];
    var topic = topics[courseId];
    if(!bank) throw new Error('Banco de clase ausente: ' + courseId);

    bank.descriptionKey = 'practiceCourseOnlyDescription';
    bank.sources = [{labelKey:'courseSource',label:'Ver la clase usada',url:topic.anchor}];
    bank.grounding = {
      policy:POLICY,
      containerId:topic.containerId,
      sourceAnchor:topic.anchor,
      evidenceCount:topic.facts.length
    };
    bank.qcm = [];
    bank.vf = [];
    bank.cases = [];

    topic.facts.forEach(function(item,index){
      bank.qcm.push(qcm(item,topic,courseId,0,index));
    });
    topic.facts.forEach(function(item,index){
      bank.qcm.push(qcm(item,topic,courseId,1,index));
    });
    topic.facts.forEach(function(item,index){
      bank.vf.push(trueFalse(item,topic,index));
      bank.cases.push(application(item,topic,courseId,index));
    });

    ['qcm','cases'].forEach(function(type,typeIndex){
      bank[type].forEach(function(question,questionIndex){
        var desired = (questionIndex + courseIndex + (typeIndex * 2)) % question.options.length;
        if(question.answer === desired) return;
        var displaced = question.options[desired];
        question.options[desired] = question.options[question.answer];
        question.options[question.answer] = displaced;
        question.answer = desired;
      });
    });
  });

  practice.banks = banks;
  practice.groundingPolicy = POLICY;
})();
