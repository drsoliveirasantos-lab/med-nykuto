(function(){
  'use strict';
  var practice = window.MedNykutoClassPractice;
  if(!practice || !practice.banks) return;

  function q(prompt,options,answer,explanation){return {prompt:prompt,options:options,answer:answer,explanation:explanation};}
  function vf(prompt,answer,explanation){return {prompt:prompt,options:['Verdadero','Falso'],answer:answer?0:1,explanation:explanation};}
  function clinical(scenario,prompt,options,answer,explanation){return {scenario:scenario,prompt:prompt,options:options,answer:answer,explanation:explanation};}

  practice.banks['fisiologia-2026-08-17'] = {
    courseId:'fisiologia-2026-08-17',
    sectionId:'fisiologia',
    lessonDateLabel:'17 AGO. 2026',
    title:'Organización, sinapsis y receptores',
    icon:'class-icon-physiology',
    description:'Sistema nervioso, potencial de acción, sinapsis, receptores sensitivos y circuitos.',
    grounding:'course-only',
    sources:[{label:'Clase utilizada · 17 ago.',url:'clase.html#fisiologia-2026-08-17'}],
    qcm:[
      q('¿Cuál secuencia representa el recorrido funcional de una señal nerviosa?',[
        'Eferencia → receptor → integración → aferencia.',
        'Receptor → aferencia → integración → eferencia.',
        'Integración → receptor → eferencia → aferencia.',
        'Receptor → eferencia → aferencia → integración.'
      ],1,'El receptor detecta el cambio, la aferencia lleva la señal, el sistema nervioso central la integra y la eferencia conduce la respuesta.'),
      q('¿Qué parte de la neurona recibe gran parte de las señales que llegan desde otras células?',[
        'Las dendritas.','La vaina de mielina.','La terminal axónica.','El espacio sináptico.'
      ],0,'Las dendritas constituyen una zona de entrada de información hacia el cuerpo neuronal.'),
      q('¿Dónde se localiza el núcleo de una neurona típica?',[
        'En el espacio sináptico.','En el soma o cuerpo celular.','Dentro de la vaina de mielina.','En la hendidura entre dos neuronas.'
      ],1,'El soma contiene el núcleo y participa en la integración de la información recibida.'),
      q('¿Qué estructura conduce el potencial de acción desde el cuerpo neuronal hacia la terminal?',[
        'La dendrita.','El receptor sensitivo.','El axón.','La enzima sináptica.'
      ],2,'El axón es la prolongación especializada en conducir el potencial de acción hacia la zona de salida.'),
      q('¿Qué dos elementos fueron destacados como importantes para mantener los gradientes del potencial de reposo?',[
        'La bomba sodio-potasio y los canales de fuga de potasio.',
        'La acetilcolinesterasa y los fotorreceptores.',
        'Los canales de calcio y las vesículas sinápticas.',
        'La mielina y los mecanorreceptores.'
      ],0,'La bomba sodio-potasio y la permeabilidad de reposo, especialmente al potasio, ayudan a conservar los gradientes iónicos.'),
      q('¿Qué movimiento iónico favorece la despolarización durante la fase ascendente del potencial de acción?',[
        'Entrada de sodio.','Salida de cloruro.','Entrada de potasio.','Salida de calcio.'
      ],0,'La apertura de canales de sodio permite su entrada y vuelve el interior menos negativo.'),
      q('¿Qué movimiento participa de forma destacada en la repolarización?',[
        'Entrada de potasio.','Salida de potasio.','Entrada de proteínas G.','Salida de neurotransmisores desde la dendrita.'
      ],1,'La salida de potasio ayuda a que el potencial de membrana vuelva hacia valores negativos.'),
      q('¿Cuál descripción corresponde a una sinapsis química?',[
        'Es la más común, unidireccional y modulable.',
        'Conecta citoplasmas sin neurotransmisores y no puede regularse.',
        'Envía la señal en ambos sentidos con la misma intensidad.',
        'Se limita a los receptores de la piel.'
      ],0,'La clase destacó que la sinapsis química es la más común, funciona en una dirección y puede modularse.'),
      q('¿Qué provoca la entrada de calcio en la terminal presináptica?',[
        'La liberación de neurotransmisores desde las vesículas.',
        'La formación de mielina alrededor de la dendrita.',
        'El cierre permanente de la neurona postsináptica.',
        'La transformación de un mecanorreceptor en fotorreceptor.'
      ],0,'La despolarización abre canales de calcio y el calcio favorece la liberación vesicular del neurotransmisor.'),
      q('¿Qué enzima termina la señal de la acetilcolina en el espacio sináptico?',[
        'Acetilcolinesterasa.','Proteína G.','Bomba sodio-potasio.','Glutamato.'
      ],0,'La acetilcolinesterasa degrada la acetilcolina y ayuda a terminar su acción.'),
      q('¿Cómo actúa un receptor ionotrópico?',[
        'El propio receptor funciona como canal y se abre al unirse el neurotransmisor.',
        'Activa primero varios genes antes de modificar un canal.',
        'Produce mielina alrededor del axón.',
        'Degrada el neurotransmisor en la hendidura.'
      ],0,'En el receptor ionotrópico, la unión del neurotransmisor abre directamente un canal iónico.'),
      q('¿Qué característica identifica a un receptor metabotrópico?',[
        'Activa proteína G y otros intermediarios antes de producir la respuesta.',
        'Es un canal que se abre de forma directa y no usa intermediarios.',
        'Transporta el potencial de acción por la vaina de mielina.',
        'Funciona como enzima que degrada acetilcolina.'
      ],0,'El receptor metabotrópico inicia una cadena con proteína G y segundos mensajeros, por eso su respuesta es más lenta.'),
      q('¿Cuál cambio puede excitar una neurona postsináptica?',[
        'Abrir canales de sodio.','Abrir canales de cloruro.','Aumentar la salida de potasio.','Reducir los receptores excitadores.'
      ],0,'La entrada de sodio hace que el interior sea menos negativo y favorece la despolarización.'),
      q('¿Cuál cambio favorece la inhibición postsináptica?',[
        'Entrada de cloruro.','Entrada de sodio.','Cierre de canales de potasio.','Aumento de receptores excitadores.'
      ],0,'La entrada de cloruro favorece la hiperpolarización y reduce la probabilidad de disparo.'),
      q('¿Qué ocurre durante una inhibición presináptica?',[
        'Se reduce la entrada de calcio y se libera menos neurotransmisor.',
        'Se abren más canales de calcio y aumenta la liberación.',
        'Se acelera la conducción por aumento de mielina.',
        'Se transforma una sinapsis química en un receptor sensitivo.'
      ],0,'Si disminuye la entrada de calcio en la terminal, se reduce la liberación de neurotransmisor.'),
      q('¿Qué neurotransmisor se presentó como inhibidor asociado a la apertura de canales de cloruro?',[
        'GABA.','Glutamato.','ATP.','Noradrenalina.'
      ],0,'En la clase, GABA se usó como ejemplo de neurotransmisor inhibidor que favorece la entrada de cloruro.'),
      q('¿Qué receptor detecta una deformación producida al presionar la piel?',[
        'Mecanorreceptor.','Fotorreceptor.','Quimiorreceptor.','Termorreceptor.'
      ],0,'Los mecanorreceptores responden a deformaciones, presión y estiramiento.'),
      q('¿Cómo se llama la conversión de la energía de un estímulo en una señal eléctrica del receptor?',[
        'Transducción sensorial.','Repolarización axónica.','Fatiga muscular.','Divergencia motora.'
      ],0,'La transducción transforma el estímulo adecuado en un potencial receptor.'),
      q('¿Qué diferencia se destacó entre un receptor tónico y uno fásico?',[
        'El tónico se adapta lentamente y el fásico responde sobre todo al cambio.',
        'El tónico detecta luz y el fásico detecta químicos.',
        'El tónico es una neurona motora y el fásico una glía.',
        'El tónico conduce por fibras C y el fásico por fibras A.'
      ],0,'Los receptores tónicos mantienen la respuesta; los fásicos se adaptan con rapidez y destacan los cambios.'),
      q('¿Qué relación entre las fibras A y C coincide con la clasificación presentada?',[
        'Las A son mielinizadas y más rápidas; las C son amielínicas y más lentas.',
        'Las C tienen mayor diámetro y conducen más rápido que las A.',
        'Las A carecen de mielina y las C están muy mielinizadas.',
        'Ambas tienen la misma velocidad aunque cambie el diámetro.'
      ],0,'La mielina y un mayor diámetro aumentan la velocidad; las fibras C son pequeñas y amielínicas.'),
    ],
    vf:[
      vf('El sistema nervioso periférico conecta los receptores y efectores con el sistema nervioso central.',true,'La información aferente llega al centro y la respuesta eferente sale hacia los efectores por vías periféricas.'),
      vf('En una sinapsis química, la neurona postsináptica libera el neurotransmisor hacia la presináptica.',false,'La terminal presináptica libera el neurotransmisor y la membrana postsináptica posee los receptores.'),
      vf('Un potencial receptor puede variar con la intensidad del estímulo.',true,'La intensidad del estímulo modifica la magnitud del potencial receptor antes de la codificación nerviosa.'),
      vf('La sumación espacial combina señales procedentes de distintas entradas.',true,'En la sumación espacial, varias neuronas aportan señales que llegan a la misma célula.'),
      vf('La sumación temporal depende de impulsos repetidos y próximos en el tiempo.',true,'La repetición rápida de una entrada permite que sus efectos se acumulen.'),
      vf('La divergencia reúne varias entradas en una neurona.',false,'Esa descripción corresponde a la convergencia; la divergencia distribuye o amplifica una señal hacia varias neuronas.'),
      vf('La mielina y un diámetro mayor favorecen una conducción más rápida.',true,'Ambas características se relacionaron con mayor velocidad de conducción.'),
      vf('La fatiga sináptica puede limitar una actividad nerviosa mantenida.',true,'La disminución de la transmisión ayuda a evitar que la actividad se sostenga sin control.'),
      vf('Un circuito reverberante puede prolongar una respuesta después del estímulo inicial.',true,'La señal vuelve a entrar en el circuito y mantiene la actividad durante un tiempo.'),
      vf('Los nociceptores se especializan en detectar luz.',false,'Los fotorreceptores detectan luz; los nociceptores responden a estímulos potencialmente dañinos.'),
    ],
    cases:[
      clinical('Una paciente presenta daño de la mielina. Al cerrar los ojos, tarda más en reconocer si su brazo está flexionado o extendido.','¿Qué cambio explica mejor la lentitud de la señal?',[
        'La pérdida de mielina reduce la velocidad de conducción.','La presencia de más mielina vuelve lenta la fibra.','El soma dejó de contener núcleo.','La acetilcolinesterasa bloqueó los mecanorreceptores.'
      ],0,'La clase relacionó desmielinización con conducción más lenta y alteración de percepciones rápidas como la propiocepción.'),
      clinical('Un paciente recibe un fármaco que bloquea canales de calcio presinápticos. El potencial de acción llega a la terminal, pero esos canales no se abren.','¿Qué resultado se espera en la sinapsis?',[
        'Disminuye la liberación del neurotransmisor.','Aumenta la exocitosis de vesículas.','Se acelera la conducción por el axón.','Se abre directamente un fotorreceptor.'
      ],0,'Sin entrada de calcio, las vesículas liberan menos neurotransmisor al espacio sináptico.'),
      clinical('Un paciente recibe una sustancia que reduce mucho la actividad de la acetilcolinesterasa. La acetilcolina permanece más tiempo en la hendidura.','¿Qué proceso fue alterado?',[
        'La terminación enzimática de la señal.','La formación de la vaina de mielina.','La transducción de la luz.','La clasificación de las fibras A y C.'
      ],0,'La acetilcolinesterasa degrada acetilcolina; si actúa menos, la señal puede durar más.'),
      clinical('En una persona, un neurotransmisor llega a una neurona postsináptica y se une a un receptor. El propio receptor abre de inmediato un canal de sodio.','¿Qué tipo de receptor está actuando?',[
        'Ionotrópico.','Metabotrópico.','Mecanorreceptor.','Receptor fásico de adaptación.'
      ],0,'Un receptor ionotrópico es también un canal que se abre directamente al unirse el neurotransmisor.'),
      clinical('En una paciente, un neurotransmisor se une a un receptor que activa proteína G. Después se modifica la apertura de un canal y la respuesta tarda un poco más.','¿Qué receptor explica la secuencia?',[
        'Metabotrópico.','Ionotrópico.','Nociceptor libre.','Canal de fuga sin receptor.'
      ],0,'La participación de proteína G y pasos intermedios caracteriza al receptor metabotrópico.'),
      clinical('En una persona, una neurona en reposo abre canales que permiten entrar cloruro. El interior se vuelve más negativo y cuesta más iniciar un potencial de acción.','¿Cómo se clasifica este efecto?',[
        'Inhibidor por hiperpolarización.','Excitador por despolarización.','Repolarización por entrada de sodio.','Divergencia de la señal.'
      ],0,'La entrada de cloruro favorece hiperpolarización e inhibición.'),
      clinical('Durante una exploración, el examinador presiona suavemente la piel del antebrazo de un paciente. El paciente reconoce la deformación producida.','¿Qué tipo de receptor inició la señal?',[
        'Mecanorreceptor.','Quimiorreceptor.','Fotorreceptor.','Receptor metabotrópico sin estímulo.'
      ],0,'La presión deforma el tejido y activa mecanorreceptores.'),
      clinical('Una persona acerca la mano a una superficie muy caliente. Nota la temperatura y la retira antes de que el tejido se lesione.','¿Qué receptores participan en detectar la temperatura y la amenaza de daño?',[
        'Termorreceptores y nociceptores.','Fotorreceptores y quimiorreceptores.','Receptores ionotrópicos y enzimas.','Somas y terminales axónicas.'
      ],0,'Los termorreceptores detectan temperatura y los nociceptores señales potencialmente dañinas.'),
      clinical('Durante una prueba en una persona, una neurona presináptica envía varios impulsos muy próximos. Cada efecto se suma al anterior hasta que la neurona postsináptica responde.','¿Qué fenómeno describe el caso?',[
        'Sumación temporal.','Sumación espacial.','Convergencia anatómica.','Fatiga sináptica inmediata.'
      ],0,'La repetición rápida de una misma entrada corresponde a sumación temporal.'),
      clinical('Durante una prueba en una persona, tres neuronas distintas envían señales débiles a una misma neurona. Juntas alcanzan el nivel necesario para excitarla.','¿Qué fenómeno explica la respuesta?',[
        'Sumación espacial.','Adaptación fásica.','Conducción saltatoria.','Inhibición presináptica.'
      ],0,'La combinación simultánea de varias entradas corresponde a sumación espacial.'),
    ]
  };

  practice.banks['microbiologia-teorica-2026-08-17'] = {
    courseId:'microbiologia-teorica-2026-08-17',
    sectionId:'microbiologia-teorica',
    lessonDateLabel:'17 AGO. 2026',
    title:'Pitiriasis versicolor y tiña corporal',
    icon:'class-icon-microbiology',
    description:'Dos casos clínicos sobre micosis superficial y dermatofitosis.',
    grounding:'course-only',
    sources:[{label:'Clase utilizada · 17 ago.',url:'clase.html#microbiologia-teorica-2026-08-17'}],
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
      q('¿Qué tejidos puede afectar Trichophyton según la comparación de géneros?',[
        'Piel, pelo y uñas.','Piel y pelo, pero no uñas.','Piel y uñas, pero no pelo.','Estrato córneo del tronco.'
      ],0,'La tabla de clase indicó piel, pelo y uñas para Trichophyton.'),
      q('¿Qué patrón corresponde a Microsporum?',[
        'Afecta piel y pelo; no suele afectar uñas.','Afecta piel y uñas; no invade pelo.','Afecta uñas y mucosa oral.','Se limita a tejido subcutáneo.'
      ],0,'Microsporum se relacionó con piel y pelo y no suele invadir uñas.'),
      q('¿Qué patrón corresponde a Epidermophyton?',[
        'Afecta piel y uñas; no invade el pelo.','Afecta piel, pelo y uñas.','Afecta pelo y cerebro.','Produce micosis subcutáneas.'
      ],0,'Epidermophyton afecta piel y uñas y no invade el pelo.'),
      q('¿Qué localización se destacó para la tiña pedis?',[
        'La zona interdigital del pie.','El estrato córneo del tronco.','El trayecto linfático del brazo.','El tejido subcutáneo de la cara.'
      ],0,'La clase destacó la afectación interdigital y su posible relación con compromiso de la uña.'),
      q('¿Qué antecedente es necesario para pensar en una micosis subcutánea?',[
        'Una inoculación traumática profunda.','Una exposición solar breve.','Una exposición sin lesión cutánea.','Una sinapsis química lenta.'
      ],0,'Las micosis subcutáneas se relacionaron con trauma que atraviesa la piel e introduce el agente.'),
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
      vf('En el segundo caso, la ausencia de fiebre impidió diagnosticar una tiña corporal.',false,'El caso no tenía fiebre ni síntomas sistémicos y aun así correspondía a tiña corporal.'),
      vf('El contacto con un gato con alopecia fue una pista epidemiológica del segundo caso.',true,'Ese antecedente orientó a una fuente animal y a Microsporum canis.'),
      vf('El aclaramiento central parcial puede acompañar el borde activo de una tiña corporal.',true,'La lesión descrita era anular, con borde elevado activo y centro parcialmente más claro.'),
      vf('Una micosis subcutánea se produce sin una lesión traumática de entrada.',false,'La inoculación traumática profunda fue presentada como requisito para las micosis subcutáneas.'),
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
      clinical('Una persona consulta por descamación y prurito entre los dedos del pie. Después nota que la uña cercana empieza a alterarse.','¿Qué localización de tiña se debe reconocer primero?',[
        'Tinea pedis.','Tinea corporis.','Pitiriasis versicolor.','Esporotricosis.'
      ],0,'La afectación interdigital corresponde a tiña pedis y puede acompañarse de compromiso ungueal.'),
      clinical('Un niño presenta placas de alopecia con pelos rotos. El cuero cabelludo muestra descamación en las mismas zonas.','¿Qué tejido está afectado en esta dermatofitosis?',[
        'Pelo y cuero cabelludo.','Tejido subcutáneo sin pelo.','Músculo y hueso.','Estrato córneo del tronco.'
      ],0,'La tiña capitis afecta cuero cabelludo y pelo, tejidos queratinizados.'),
      clinical('Una paciente tiene máculas del tronco sin inflamación importante. El examen directo muestra levaduras e hifas cortas, pero no hifas hialinas septadas de dermatofito.','¿Cómo debe clasificarse la profundidad?',[
        'Micosis superficial.','Micosis subcutánea.','Micosis ósea.','Dermatofitosis ungueal.'
      ],0,'El patrón corresponde a una infección limitada al estrato córneo: pitiriasis versicolor.'),
      clinical('Una paciente que trabaja en jardinería se pincha profundamente con una espina de rosa. Semanas después aparece un nódulo en la mano y otros nódulos ascienden en línea por el brazo.','¿Qué micosis explica el trayecto?',[
        'Esporotricosis linfocutánea.','Pitiriasis versicolor.','Tiña corporal.','Cromoblastomicosis sin trauma.'
      ],0,'Trauma vegetal seguido de nódulos por el trayecto linfático es el patrón enseñado para esporotricosis.'),
      clinical('Un hombre que trabaja en el campo recuerda una punción antigua. Con los meses desarrolla una placa verrugosa que crece lentamente en la pierna.','¿Qué entidad corresponde al patrón proliferativo?',[
        'Cromoblastomicosis.','Micetoma eumicótico.','Pitiriasis versicolor.','Tiña pedis interdigital.'
      ],0,'La lesión verrugosa crónica y proliferativa se usó para diferenciar cromoblastomicosis.'),
      clinical('Un paciente que trabaja descalzo presenta aumento marcado del volumen del pie, orificios que drenan y granos. La lesión ha avanzado en profundidad.','¿Qué diagnóstico es el más probable?',[
        'Micetoma eumicótico.','Pitiriasis versicolor.','Tiña corporal.','Esporotricosis con nódulos lineales.'
      ],0,'Tumefacción, fístulas y granos forman el cuadro presentado para micetoma eumicótico.'),
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
  distributeAnswers(practice.banks['fisiologia-2026-08-17'],1);
  distributeAnswers(practice.banks['microbiologia-teorica-2026-08-17'],2);
})();
