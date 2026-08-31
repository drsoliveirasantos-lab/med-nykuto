(function(){
  'use strict';
  var practice = window.MedNykutoClassPractice;
  if(!practice || !practice.banks) return;

  function q(prompt,options,answer,explanation){return {prompt:prompt,options:options,answer:answer,explanation:explanation};}
  function vf(prompt,answer,explanation){return {prompt:prompt,options:['Verdadero','Falso'],answer:answer?0:1,explanation:explanation};}
  function clinical(scenario,prompt,options,answer,explanation){return {scenario:scenario,prompt:prompt,options:options,answer:answer,explanation:explanation};}

  practice.banks['fisiologia-2026-08-24'] = {
    courseId:'fisiologia-2026-08-24', sectionId:'fisiologia', lessonDateLabel:'24 AGO. 2026',
    title:'Sensibilidades somáticas', icon:'class-icon-physiology',
    description:'Mecanorrecepción, propiocepción, nocicepción, termorrecepción, vías ascendentes y corteza somatosensitiva.',
    grounding:'course-only', sources:[{label:'Clase utilizada · 24 ago.',url:'clase.html#fisiologia-2026-08-24'}],
    qcm:[
      q('¿Qué relación entre modalidad somática y estímulo es correcta?',['Mecanorrecepción: tacto, presión y posición corporal.','Termorrecepción: cambios térmicos dentro del rango fisiológico.','Nocicepción: luz visible.','Propiocepción: temperatura ambiental.'],0,'La mecanorrecepción incluye tacto y presión; la propiocepción detecta posición y movimiento mediante mecanorreceptores especializados.'),
      q('¿Cuáles son tres formas principales de sensibilidad táctil?',['Contacto, presión y vibración.','Frío, calor y prurito.','Dolor rápido, lento y referido.','Posición, visión y audición.'],0,'La sensibilidad táctil se organizó en contacto superficial, presión más profunda y vibración.'),
      q('¿Qué receptor cutáneo de adaptación rápida detecta tacto fino y cambios de baja frecuencia en piel glabra?',['Corpúsculo de Meissner.','Disco de Merkel.','Terminación de Ruffini.','Órgano tendinoso de Golgi.'],0,'Meissner es superficial y de adaptación rápida; participa en tacto discriminativo y vibración de baja frecuencia.'),
      q('¿Qué receptor responde especialmente a vibración de alta frecuencia y cambios mecánicos rápidos?',['Corpúsculo de Pacini.','Disco de Merkel.','Huso muscular.','Terminación nerviosa libre.'],0,'Pacini es profundo, de adaptación rápida y muy sensible a vibraciones rápidas.'),
      q('¿Qué receptor de adaptación lenta ayuda a percibir presión sostenida, bordes y textura?',['Disco de Merkel.','Corpúsculo de Pacini.','Corpúsculo de Meissner.','Nociceptor polimodal.'],0,'Merkel mantiene la descarga durante el estímulo y favorece la discriminación de forma y textura.'),
      q('¿Qué receptor cutáneo se asocia con estiramiento sostenido de la piel?',['Terminación de Ruffini.','Corpúsculo de Meissner.','Corpúsculo de Pacini.','Receptor de frío.'],0,'Ruffini es de adaptación lenta y responde al estiramiento cutáneo.'),
      q('¿Qué estructura actúa como receptor principal de dolor, prurito y cosquilleo?',['Terminación nerviosa libre.','Disco de Merkel de adaptación lenta.','Corpúsculo de Pacini para vibración profunda.','Órgano tendinoso de Golgi.'],0,'Las terminaciones libres detectan estímulos nocivos y participan también en prurito y cosquilleo.'),
      q('¿Qué describe mejor la propiocepción?',['Conciencia de la posición y del movimiento relativo de las partes del cuerpo.','Detección predominante de la presión arterial.','Percepción del color y la luz.','Reconocimiento predominante del dolor visceral.'],0,'La propiocepción informa posición estática y movimiento sin depender necesariamente de la visión.'),
      q('¿Qué receptor detecta principalmente cambios de longitud del músculo?',['Huso neuromuscular con aferencia Ia.','Órgano tendinoso de Golgi con aferencia Ib.','Corpúsculo de Pacini de adaptación rápida.','Disco de Merkel de adaptación lenta.'],0,'Las fibras intrafusales del huso informan longitud muscular y velocidad de estiramiento.'),
      q('¿Qué aferencia primaria del huso muscular conduce rápidamente la información de estiramiento?',['Fibra grupo Ia.','Fibra C.','Fibra B posganglionar.','Fibra Aδ nociceptiva.'],0,'Las aferencias Ia son grandes y muy mielinizadas, adecuadas para la señal rápida del huso.'),
      q('¿Qué receptor y fibra informan principalmente la tensión desarrollada en un tendón?',['Órgano tendinoso de Golgi y fibra Ib.','Huso muscular y fibra C.','Pacini y fibra Ia.','Merkel y fibra Aδ.'],0,'El órgano tendinoso de Golgi detecta tensión y envía la señal por aferencias Ib.'),
      q('¿Cuál es la respuesta medular típica al estirar bruscamente un músculo?',['Contracción refleja del músculo estirado.','Relajación inmediata de músculos antagonistas.','Pérdida de la propiocepción contralateral.','Activación predominante de nociceptores C.'],0,'El reflejo miotático se opone al estiramiento mediante activación rápida del músculo.'),
      q('¿Qué respuesta protectora puede desencadenar un aumento excesivo de tensión detectado por Golgi?',['Inhibición autógena y relajación del músculo.','Contracción tetánica sostenida.','Aumento de la vibración cutánea.','Activación de receptores de calor.'],0,'La señal Ib puede activar interneuronas inhibitorias y reducir la contracción cuando la tensión es excesiva.'),
      q('¿Qué fibra transmite principalmente el dolor rápido, agudo y bien localizado?',['Aδ.','C.','Aα motora.','Ia propioceptiva.'],0,'Las fibras Aδ son finamente mielinizadas y transmiten el primer dolor con mayor velocidad.'),
      q('¿Qué fibra transmite principalmente el dolor lento, urente y difuso?',['C.','Aβ.','Ia.','Ib.'],0,'Las fibras C son amielínicas y se relacionan con el segundo dolor, lento y mal localizado.'),
      q('¿Qué neurotransmisor se asocia sobre todo con la transmisión rápida del dolor en la médula?',['Glutamato.','Sustancia P como mediador principal.','Acetilcolina en placa motora.','Dopamina nigroestriatal.'],0,'El glutamato participa en la transmisión rápida de las aferencias nociceptivas.'),
      q('¿Qué mediador se relaciona con la transmisión más lenta y prolongada del dolor?',['Sustancia P.','Glicina en circuitos espinales.','Melatonina.','Aldosterona.'],0,'La sustancia P contribuye a la señal nociceptiva lenta y persistente.'),
      q('¿Qué modalidades ascienden principalmente por la columna dorsal-lemnisco medial?',['Tacto fino, vibración y propiocepción consciente.','Dolor lento, temperatura y tacto grosero.','Olfato, gusto y audición.','Dolor visceral predominante.'],0,'La columna dorsal conduce información rápida y bien localizada de tacto discriminativo, vibración y posición.'),
      q('¿Qué modalidades ascienden principalmente por el sistema anterolateral?',['Dolor, temperatura y tacto grosero.','Vibración y propiocepción inconsciente.','Visión y equilibrio.','Control voluntario de la fuerza muscular.'],0,'El sistema anterolateral transmite nocicepción, temperatura y tacto menos discriminativo.'),
      q('¿Dónde cruza típicamente la segunda neurona de la vía anterolateral?',['En la médula espinal, cerca del nivel de entrada.','En la corteza somatosensitiva.','En el ganglio de la raíz dorsal.','En el músculo estimulado.'],0,'La vía anterolateral decusa en la médula; la columna dorsal asciende ipsilateral y cruza en el bulbo.'),
    ],
    vf:[
      vf('Los corpúsculos de Pacini son receptores de adaptación rápida.',true,'Responden sobre todo al inicio y al final del estímulo y a vibraciones rápidas.'),
      vf('Los discos de Merkel dejan de responder casi inmediatamente ante una presión sostenida.',false,'Merkel es de adaptación lenta y mantiene información sobre presión y forma.'),
      vf('El equilibrio puede apoyarse en visión, sistema vestibular y propiocepción.',true,'La pérdida de más de uno de estos pilares aumenta la inestabilidad.'),
      vf('El cuerpo de la primera neurona somatosensitiva suele estar en el ganglio de la raíz dorsal.',true,'La neurona primaria es seudounipolar y su soma se localiza en ese ganglio.'),
      vf('La vía de la columna dorsal cruza inmediatamente al entrar en la médula espinal.',false,'Asciende ipsilateralmente y decusa en el bulbo después de sinapsar en núcleos dorsales.'),
      vf('El dolor rápido suele localizarse mejor que el dolor lento.',true,'La conducción Aδ y la vía neoespinotalámica favorecen una localización más precisa.'),
      vf('Las temperaturas extremas pueden activar terminaciones nerviosas libres nociceptivas.',true,'El frío o calor intensos amenazan la integridad tisular y generan dolor térmico.'),
      vf('Los receptores de frío son menos numerosos y su señal suele viajar por fibras C.',false,'En la clase se destacó que son más numerosos y su señal puede viajar por fibras Aδ.'),
      vf('La corteza somatosensitiva primaria se localiza detrás del surco central.',true,'Ocupa el giro poscentral del lóbulo parietal, correspondiente a áreas 3, 1 y 2.'),
      vf('Campos receptivos pequeños y alta densidad de receptores mejoran la discriminación de dos puntos.',true,'Por eso dedos y labios distinguen estímulos cercanos mejor que la espalda.'),
    ],
    cases:[
      clinical('Un paciente mantiene los ojos cerrados durante la exploración neurológica. Reconoce correctamente que su codo está flexionado y describe la posición sin ayuda visual.','¿Qué modalidad permite esta respuesta?',['Propiocepción.','Termorrecepción cutánea de cambios inocuos.','Nocicepción procedente de órganos internos.','Audición cortical de estímulos sonoros.'],0,'La propiocepción informa la posición de una articulación sin apoyo visual.'),
      clinical('Durante la exploración de una persona, el médico percute el tendón rotuliano. El cuádriceps se estira brevemente y luego se contrae, produciendo extensión de la pierna.','¿Qué receptor inició el reflejo?',['Huso neuromuscular.','Órgano tendinoso de Golgi.','Corpúsculo de Pacini.','Disco de Merkel.'],0,'El huso detecta el estiramiento y activa el reflejo miotático.'),
      clinical('Una persona intenta sostener una carga demasiado pesada durante varios segundos. La tensión del tendón aumenta de forma marcada y finalmente el músculo reduce su contracción, por lo que suelta la carga.','¿Qué receptor contribuye a la respuesta protectora?',['Órgano tendinoso de Golgi.','Corpúsculo de Meissner.','Receptor de calor.','Terminación de Merkel.'],0,'Golgi informa tensión por fibras Ib y puede favorecer relajación protectora.'),
      clinical('Una persona se pincha accidentalmente con una aguja en el dedo. Primero siente un dolor agudo y bien localizado; segundos después aparece una sensación urente más difusa.','¿Qué secuencia de fibras explica el fenómeno?',['Aδ seguida de C.','C seguida de Aδ.','Aβ seguida de Ia.','Ib seguida de Aα.'],0,'El primer dolor viaja por Aδ y el segundo dolor por fibras C.'),
      clinical('Una persona toca accidentalmente una superficie metálica a temperatura cercana a 50 °C. Siente dolor agudo y retira la mano de inmediato antes de prolongar el contacto.','¿Qué receptores explican el dolor por calor extremo?',['Terminaciones nerviosas libres nociceptivas.','Corpúsculos de Meissner cutáneos.','Discos de Merkel superficiales.','Órganos tendinosos de Golgi.'],0,'Por encima del rango térmico inocuo se activan nociceptores sensibles al calor dañino.'),
      clinical('Un paciente presenta una lesión medular unilateral. Por debajo de la lesión conserva dolor y temperatura, pero pierde vibración y sentido de posición en el miembro inferior derecho.','¿Qué sistema está lesionado?',['Columna dorsal derecha.','Vía anterolateral izquierda predominante.','Tracto corticoespinal bilateral.','Vía visual aferente.'],0,'Antes de cruzar en el bulbo, la columna dorsal conduce ipsilateralmente vibración y propiocepción.'),
      clinical('Una paciente presenta una lesión localizada en el sistema anterolateral izquierdo de la médula. Por debajo del nivel afectado se evalúan dolor, temperatura y tacto discriminativo en ambos lados.','¿Qué déficit sensitivo es más esperable por debajo de la lesión?',['Disminución contralateral de dolor y temperatura.','Pérdida ipsilateral predominante de vibración.','Alteración visual monocular del lado izquierdo.','Pérdida auditiva bilateral de origen periférico.'],0,'Las fibras anterolaterales ya cruzaron cerca del nivel de entrada y ascienden contralateralmente.'),
      clinical('Durante el examen neurológico, una paciente cierra los ojos y recibe una moneda en la mano. La identifica correctamente integrando su forma, textura y peso, sin utilizar la visión.','¿Qué función cortical se evalúa?',['Estereognosia.','Reflejo miotático.','Termorrecepción.','Nocicepción visceral.'],0,'La estereognosia exige sensibilidad primaria íntegra e integración cortical somatosensitiva.'),
      clinical('El examinador pide a un paciente que cierre los ojos y dibuja un número en su palma. El paciente reconoce el trazo sin mirar y conserva la sensibilidad táctil primaria.','¿Qué capacidad se evalúa?',['Grafestesia.','Agudeza visual.','Reflejo tendinoso.','Audición cortical.'],0,'La grafestesia valora la interpretación cortical de un estímulo táctil trazado en la piel.'),
      clinical('Durante una prueba en una persona, dos puntas cercanas se perciben como estímulos separados en la yema del dedo. Con la misma distancia en la espalda se perciben como un único punto.','¿Qué explica la diferencia?',['Mayor densidad de receptores y campos más pequeños en el dedo.','Representación cortical reducida para una región dorsal.','Mayor número de fibras C en la yema del dedo.','Cruce bulbar de la vía anterolateral.'],0,'Los campos receptivos pequeños y la alta densidad mejoran la discriminación espacial.'),
    ]
  };

  practice.banks['microbiologia-teorica-2026-08-24'] = {
    courseId:'microbiologia-teorica-2026-08-24',
    sectionId:'microbiologia-teorica',
    lessonDateLabel:'24 AGO. 2026',
    title:'Micosis por profundidad y casos clínicos',
    icon:'class-icon-microbiology',
    description:'Micosis superficiales, cutáneas, subcutáneas y oportunistas con cinco secuencias clínicas de la clase.',
    grounding:'course-only',
    sources:[{label:'Clase utilizada · 24 ago.',url:'clase.html#microbiologia-teorica-2026-08-24'}],
    qcm:[
      q('¿Qué dato debe determinarse primero ante una posible micosis?',[
        'La profundidad de la lesión.','El nombre comercial del antifúngico.','La edad del microscopio.','El color de la ropa del paciente.'
      ],0,'La profundidad separa micosis superficiales, cutáneas y subcutáneas y orienta el diagnóstico.'),
      q('¿Dónde se limita una micosis superficial como la pitiriasis versicolor?',[
        'Al estrato córneo.','A la médula ósea.','Al músculo y al hueso.','A la sangre como primera localización.'
      ],0,'La pitiriasis versicolor se presentó como una micosis superficial limitada principalmente al estrato córneo.'),
      q('¿Qué característica de Malassezia ayuda a explicar su predominio en zonas seborreicas?',[
        'Es lipofílica.','Es un dermatofito que invade uñas.','Necesita un trauma profundo.','Produce cuerpos escleróticos.'
      ],0,'La clase destacó que Malassezia es una levadura lipofílica y se relaciona con zonas ricas en sebo.'),
      q('¿Qué diagnóstico corresponde a máculas hipo e hiperpigmentadas del tronco, con descamación fina y poca inflamación?',[
        'Pitiriasis versicolor.','Esporotricosis linfocutánea.','Micetoma eumicótico.','Cromoblastomicosis.'
      ],0,'La combinación de máculas del tronco, descamación fina y poca inflamación correspondió a pitiriasis versicolor.'),
      q('¿Qué hallazgo con KOH apoyó el diagnóstico de pitiriasis versicolor?',[
        'Levaduras agrupadas con hifas cortas y curvas.','Macroconidios fusiformes de pared rugosa.','Cuerpos escleróticos en biopsia.','Granos dentro de trayectos fistulosos.'
      ],0,'En el primer caso, el KOH mostró levaduras y filamentos cortos, el patrón descrito como «espagueti con albóndigas».'),
      q('¿Por qué las lesiones del primer caso se hacían más evidentes después del sol?',[
        'Aumentaba el contraste de la pigmentación.','El sol transformaba la lesión en micosis subcutánea.','El hongo invadía el hueso con la luz.','La exposición producía macroconidios en la piel.'
      ],0,'La exposición solar aumentaba el contraste y hacía más visibles las máculas.'),
      q('¿Qué tejido aprovechan los dermatofitos en las micosis cutáneas?',[
        'La queratina de piel, pelo o uñas.','El cartílago sin afectar piel.','La grasa del tejido subcutáneo como único sustrato.','La hemoglobina dentro de los eritrocitos.'
      ],0,'Las dermatofitosis afectan estructuras queratinizadas: piel, pelo y uñas.'),
      q('¿Qué agente causó la tiña corporal del segundo caso?',[
        'Microsporum canis.','Malassezia spp.','Sporothrix schenckii.','Un micetoma bacteriano.'
      ],0,'La respuesta mostrada por el profesor fue Microsporum canis.'),
      q('¿Qué dato epidemiológico orientó hacia Microsporum canis?',[
        'Contacto frecuente con un gato con pérdida de pelo.','Sudoración después de meses de calor.','Punción con una espina de rosa.','Trabajo descalzo con una masa crónica del pie.'
      ],0,'El gato joven con alopecia orientó a una fuente zoofílica y a M. canis.'),
      q('¿De qué zona debe tomarse el raspado en una placa anular de tiña corporal?',[
        'Del borde activo.','Del centro más claro de la lesión.','De una uña sana.','De la mucosa oral sin lesión.'
      ],0,'La diapositiva indicó que el raspado se toma del borde activo de la lesión.'),
      q('¿Qué morfología del cultivo apoyó la identificación de M. canis?',[
        'Macroconidios abundantes, fusiformes y de pared rugosa.','Levaduras agrupadas sin hifas.','Cuerpos muriformes dentro de granulomas.','Granos negros en una fístula.'
      ],0,'El caso usó macroconidios fusiformes, abundantes y de pared rugosa como dato de identificación.'),
      q('¿Qué interpretación corresponde a los granos negros drenados por las fístulas de un micetoma?',[
        'Orientan a eumicetoma por hongos dematiáceos.','Identifican una infección por Candida en la mucosa.','Demuestran una tiña corporal por Microsporum.','Confirman una esporotricosis sin cultivo.'
      ],0,'Los granos negros orientan a un eumicetoma por hongos pigmentados, aunque la especie requiere confirmación.'),
      q('¿Qué método confirma con mayor seguridad una esporotricosis linfocutánea?',[
        'El cultivo de una muestra clínica adecuada.','La lámpara de Wood aplicada a los nódulos.','El KOH de una uña sin cambios.','El hemocultivo de una forma cutánea estable.'
      ],0,'El aislamiento de Sporothrix a partir del espécimen clínico es el método de referencia.'),
      q('¿Qué situación favorece una infección oportunista por Candida?',[
        'Neutropenia y uso de catéter venoso.','Contacto breve con un gato alopécico.','Exposición solar de una mácula del tronco.','Punción con espina seguida de nódulos lineales.'
      ],0,'La alteración de defensas y barreras, como neutropenia o catéter, aumenta el riesgo de candidiasis.'),
      q('¿Cómo debe interpretarse un cultivo con Candida obtenido de un sitio no estéril?',[
        'Debe correlacionarse con clínica, riesgo y sitio de muestra.','Demuestra por sí mismo candidiasis invasiva.','Descarta colonización de la microbiota.','Identifica un micetoma eumicótico.'
      ],0,'Candida puede colonizar mucosas y piel; un aislamiento de un sitio no estéril no prueba por sí solo enfermedad invasiva.'),
      q('¿Qué antecedente apoya la sospecha de una micosis subcutánea de implantación?',[
        'Una punción con material vegetal, incluso si fue pequeña.','Sudoración sin ruptura de la barrera cutánea.','Contacto con una placa de tiña corporal.','Colonización oral por Candida.'
      ],0,'Estas micosis suelen seguir una inoculación ambiental; el traumatismo puede ser mínimo o no recordarse.'),
      q('¿Qué patrón clínico se asoció a la esporotricosis linfocutánea?',[
        'Nódulos que siguen un trayecto linfático desde la lesión de entrada.','Máculas del tronco con descamación fina.','Placa anular con centro claro por contacto con gato.','Tumefacción con fístulas y granos.'
      ],0,'La esporotricosis se presentó como lesión de inoculación seguida de nódulos en línea por los vasos linfáticos.'),
      q('¿Qué lesión caracteriza a la cromoblastomicosis?',[
        'Una lesión verrugosa crónica y proliferativa.','Máculas hipocrómicas sin inflamación.','Una placa anular de dos semanas.','Una lesión interdigital con uña alterada.'
      ],0,'La cromoblastomicosis se describió como proliferativa, crónica y verrugosa.'),
      q('¿Qué conjunto orienta a un micetoma eumicótico?',[
        'Tumefacción, fístulas y granos con invasión profunda.','Máculas finas después del sol.','Alopecia de un gato sin lesión humana.','Prurito leve sin aumento de volumen.'
      ],0,'El micetoma se relacionó con tumefacción, trayectos fistulosos, granos y avance a tejidos profundos.'),
      q('¿Qué estudio se destacó para confirmar una micosis subcutánea?',[
        'Biopsia con estudio histopatológico.','Pulsioximetría.','Electrocardiograma.','Potencial de acción neuronal.'
      ],0,'Para las micosis subcutáneas, la clase destacó biopsia e histopatología por la profundidad de la lesión.'),
    ],
    vf:[
      vf('La pitiriasis versicolor y la tiña corporal pertenecen al mismo nivel de invasión.',false,'La pitiriasis versicolor es superficial; la tiña corporal es una micosis cutánea o dermatofitosis.'),
      vf('Malassezia spp. se asocia a zonas seborreicas del tronco.',true,'Su afinidad por lípidos ayuda a explicar esa distribución.'),
      vf('Los granos negros de un micetoma orientan a un hongo dematiáceo, pero no identifican por sí solos la especie.',true,'El color de los granos apoya el eumicetoma; examen directo, histopatología y cultivo completan la identificación.'),
      vf('Un cultivo con Candida procedente de un sitio no estéril es suficiente para diagnosticar candidiasis invasiva.',false,'Candida puede colonizar piel y mucosas; el resultado se interpreta con clínica, factores de riesgo y sitio de muestra.'),
      vf('El aclaramiento central parcial puede acompañar el borde activo de una tiña corporal.',true,'La lesión descrita era anular, con borde elevado activo y centro parcialmente más claro.'),
      vf('La inoculación traumática es una vía frecuente de las micosis subcutáneas, aunque el paciente puede no recordar el episodio.',true,'Una espina o astilla pequeña puede implantar el agente y pasar inadvertida en la historia.'),
      vf('La esporotricosis puede relacionarse con jardinería, espina de rosa o contacto con gato.',true,'Esas exposiciones fueron usadas en clase para reconocer su puerta de entrada.'),
      vf('La cromoblastomicosis se describió como infiltrativa con tumefacción y fístulas.',false,'Ese patrón correspondió al micetoma; la cromoblastomicosis se describió como proliferativa y verrugosa.'),
      vf('El micetoma puede deformar el miembro cuando avanza a tejidos profundos.',true,'La clase señaló progresión hacia músculo y hueso, con daño y deformidad.'),
      vf('El método diagnóstico se elige sin considerar la profundidad de la lesión.',false,'La profundidad orienta si basta un examen directo o si se necesita una muestra tisular.'),
    ],
    cases:[
      clinical('Un hombre de 22 años consulta por máculas claras y café claro en espalda, tórax superior y hombros desde hace tres meses. Suda mucho, tiene prurito mínimo y las manchas resaltan después del sol.','¿Qué diagnóstico integra mejor la historia y el examen?',[
        'Pitiriasis versicolor.','Tiña corporal por M. canis.','Esporotricosis linfocutánea.','Micetoma eumicótico.'
      ],0,'Es el primer caso de clase: máculas del tronco, descamación fina, poca inflamación y relación con calor y sudor.'),
      clinical('Un paciente adolescente de 15 años presenta una placa pruriginosa de 5 cm en el antebrazo. Creció durante dos semanas, tiene borde elevado activo y centro más claro. Su gato joven pierde pelo.','¿Qué agente es el más probable?',[
        'Microsporum canis.','Malassezia spp.','Un hongo de micetoma.','Sporothrix asociado a una espina.'
      ],0,'El patrón de tiña corporal y el contacto con un gato alopécico orientan a M. canis.'),
      clinical('Un hombre de 38 años que trabaja en el campo se pinchó con una espina mientras caminaba descalzo. Tres años después presenta un pie aumentado de volumen, fístulas y drenaje de granos negros.','¿Qué diagnóstico integra mejor la tríada?',[
        'Eumicetoma.','Candidiasis oral.','Tiña corporal.','Esporotricosis linfocutánea.'
      ],0,'La tumefacción, los trayectos fistulosos y los granos forman la tríada del micetoma; los granos negros orientan a etiología fúngica.'),
      clinical('Una paciente inmunosuprimida desarrolla placas blancas cremosas en la mucosa oral. Algunas se desprenden al raspado y dejan una base eritematosa sensible.','¿Qué forma clínica es la más probable?',[
        'Candidiasis oral pseudomembranosa.','Tiña corporal zoofílica.','Cromoblastomicosis.','Eumicetoma con granos negros.'
      ],0,'Las placas blancas removibles sobre una base eritematosa son compatibles con candidiasis oral pseudomembranosa.'),
      clinical('Un hombre de 62 años tuvo una herida con clavo en el pie derecho hace dos décadas. Después de recurrencias y cirugías presenta deformidad, fístulas, ulceración y limitación funcional.','¿Qué estudio permite confirmar la orientación de eumicetoma?',[
        'Biopsia y cultivo de una muestra profunda.','Pulsioximetría en reposo.','Lámpara de Wood sobre piel sana.','Raspado de una mácula del tronco.'
      ],0,'La historia orienta a eumicetoma, pero la confirmación requiere granos o biopsia, histopatología y cultivo.'),
      clinical('Una paciente de 36 años que trabaja en el campo se lesiona un dedo mientras injerta naranjos. La pápula se ulcera y nuevos nódulos ascienden en línea por el brazo.','¿Qué micosis explica el trayecto?',[
        'Esporotricosis linfocutánea.','Pitiriasis versicolor.','Tiña corporal.','Cromoblastomicosis sin trauma.'
      ],0,'La inoculación vegetal seguida de nódulos por el trayecto linfático es el patrón enseñado para esporotricosis.'),
      clinical('Un hombre que trabaja en el campo recuerda una punción antigua. Con los meses desarrolla una placa verrugosa que crece lentamente en la pierna.','¿Qué entidad corresponde al patrón proliferativo?',[
        'Cromoblastomicosis.','Micetoma eumicótico.','Pitiriasis versicolor.','Tiña pedis interdigital.'
      ],0,'La lesión verrugosa crónica y proliferativa se usó para diferenciar cromoblastomicosis.'),
      clinical('Una paciente de edad avanzada recibió antibióticos de amplio espectro. Presenta eritema pruriginoso en un pliegue húmedo, pequeñas lesiones satélite e inflamación periungueal.','¿Qué agente oportunista debe considerarse?',[
        'Candida spp.','Microsporum canis.','Sporothrix spp.','Malassezia spp.'
      ],0,'La combinación de intertrigo con lesiones satélite y afectación periungueal orienta a candidiasis mucocutánea.'),
      clinical('Una paciente joven presenta manchas superficiales con descamación fina. El médico quiere confirmar rápidamente elementos fúngicos en la capa externa.','¿Qué procedimiento inicial debe realizarse?',[
        'Raspado para examen directo con KOH.','Biopsia de músculo.','Radiografía del hueso.','Estudio de potenciales nerviosos.'
      ],0,'En una micosis superficial, el raspado y el examen directo permiten observar el hongo rápidamente.'),
      clinical('Un hombre tiene una lesión crónica después de una punción profunda. El médico sospecha compromiso subcutáneo y necesita identificar la estructura tisular afectada.','¿Qué muestra resulta más útil?',[
        'Biopsia para histopatología.','Una muestra de saliva sin lesión.','Un raspado de piel sana.','Una fotografía sin tomar muestra.'
      ],0,'La lesión subcutánea requiere una muestra tisular; la clase destacó biopsia e histopatología.'),
    ]
  };

  function distributeAnswers(bank,seed){
    ['qcm','cases'].forEach(function(type){
      bank[type].forEach(function(question,index){
        var length = question.options.length;
        var offset = ((index * 3) + seed) % length;
        if(!offset) return;
        question.options = question.options.slice(offset).concat(question.options.slice(0,offset));
        question.answer = (question.answer - offset + length) % length;
      });
    });
  }
  var micro24 = practice.banks['microbiologia-teorica-2026-08-24'];
  var microQcmFocus = ['al definir la profundidad','al ubicar el estrato afectado','al interpretar la distribución seborreica','al describir las máculas','al distinguir una dermatofitosis','al elegir el borde de muestreo','al reconocer la fuente animal','al leer el cultivo','al valorar granos negros','al confirmar Sporothrix','al valorar inmunosupresión','al interpretar un sitio no estéril','al reconstruir la puerta de entrada','al seguir el drenaje regional','al reconocer una lesión verrugosa','al identificar la tríada','al diferenciar etiologías','al elegir una muestra profunda','al valorar la extensión','al decidir la estrategia terapéutica'];
  var microVfFocus = ['en una comparación por profundidad','en zonas seborreicas','al orientar un eumicetoma','al interpretar colonización','al observar un borde activo','al investigar inoculación','en una exposición ocupacional','al diferenciar patrones crónicos','al valorar daño profundo','al indicar terapia'];
  var microCaseFocus = ['para clasificar la profundidad','para identificar el agente probable','para confirmar una lesión profunda','para reconocer el patrón linfático','para separar lesión proliferativa e infiltrativa','para valorar candidiasis mucocutánea','para orientar el examen directo','para localizar la muestra','para evaluar extensión','para elegir el siguiente paso'];
  micro24.qcm.forEach(function(item,index){ item.prompt=item.prompt.replace(/\?$/, ' ' + microQcmFocus[index] + '?'); });
  micro24.vf.forEach(function(item,index){ item.prompt += ' ' + microVfFocus[index] + '.'; });
  micro24.cases.forEach(function(item,index){ item.prompt=item.prompt.replace(/\?$/, ' ' + microCaseFocus[index] + '?'); });

  distributeAnswers(practice.banks['fisiologia-2026-08-24'],1);
  distributeAnswers(practice.banks['microbiologia-teorica-2026-08-24'],2);
})();
