(function(){
  'use strict';
  var practice = window.MedNykutoClassPractice;
  if(!practice || !practice.banks) return;

  /*
   * Mapeo previsto de las imágenes académicas del WhatsApp del 27 de agosto:
   * - micro-mucor.webp: lámina rotulada «Mucor».
   * - micro-rhizopus.webp: lámina rotulada «Rhizopus».
   * - micro-penicillium.webp: lámina rotulada «Penicillium».
   * - micro-aspergillus-fumigatus.webp: lámina rotulada «Aspergillus fumigatus».
   * - micro-mycelium.webp: esquema rotulado de micelio/hifas.
   * - micro-arthroconidia.webp: esquema rotulado de artroconidios.
   * - micro-candida-albicans.webp: lámina rotulada «Candida albicans».
   * - micro-cryptococcus-neoformans.webp: lámina rotulada «Cryptococcus neoformans».
   * - micro-spores-conidia-a.webp y micro-spores-conidia-b.webp: referencias de esporas/conidios.
   * - micro-case-candidemia.webp: caso fotografiado de candidemia, diabetes y catéter.
   * - micro-case-aspergillosis.webp: caso fotografiado de leucemia,
   *   neutropenia, aspergilosis invasiva y signo del halo.
   *
   * Las imágenes sirven como material docente rotulado. Una identificación de especie
   * en una muestra real siempre exige integrar cultivo, microscopía y contexto clínico.
   */
  var imageRoot = 'assets/courses/2026-08-27/';

  function withImage(question,image){
    if(image) question.imageSrc = imageRoot + image;
    return question;
  }
  function q(prompt,options,answer,explanation,image){
    return withImage({prompt:prompt,options:options,answer:answer,explanation:explanation},image);
  }
  function vf(prompt,answer,explanation){
    return {prompt:prompt,options:['Verdadero','Falso'],answer:answer?0:1,explanation:explanation};
  }
  function clinical(scenario,prompt,options,answer,explanation,image){
    return withImage({scenario:scenario,prompt:prompt,options:options,answer:answer,explanation:explanation},image);
  }

  var bank = {
    courseId:'microbiologia-practica-2026-08-27',
    sectionId:'microbiologia-practica',
    lessonDateLabel:'27 AGO. 2026',
    title:'Reconocimiento práctico de hongos y casos invasivos',
    icon:'class-icon-lab',
    description:'Micelio, artroconidios, conidios, mohos de referencia y correlación de candidemia y aspergilosis invasiva.',
    grounding:'course-only',
    sources:[{label:'Clase y láminas utilizadas · 27 ago.',url:'clase.html#microbiologia-practica-2026-08-27'}],
    qcm:[
      q('¿Qué relación entre estructuras debe reconocerse en la lámina rotulada de micelio?',['El micelio es el conjunto de hifas del cuerpo vegetativo fúngico.','El micelio es una espora aislada dentro de un esporangio.','Cada micelio corresponde a una levadura encapsulada aislada.','El micelio es el colorante utilizado para montar la preparación.'],0,'Una hifa es un filamento individual; el conjunto organizado de hifas constituye el micelio.','micro-mycelium.webp'),
      q('¿Qué descripción corresponde mejor a una hifa?',['Un filamento fúngico que puede ser septado o cenocítico.','Una agrupación de eritrocitos alrededor de una levadura.','Un saco que contiene esporangiosporas internas.','El conjunto completo de colonias visibles en una placa.'],0,'La hifa es la unidad filamentosa del moho y puede presentar tabiques o ser cenocítica.','micro-mycelium.webp'),
      q('¿Cómo se forman los artroconidios representados en la lámina docente?',['Por fragmentación de hifas en unidades celulares.','Por gemación de una levadura dentro de una cápsula.','Por división de un esporangio en dos colonias.','Por fusión de pseudohifas con eritrocitos.'],0,'Los artroconidios resultan de la fragmentación de hifas preexistentes en elementos de propagación.','micro-arthroconidia.webp'),
      q('¿Qué diferencia práctica separa a un conidio de una esporangiospora?',['El conidio es externo; la esporangiospora se forma dentro de un esporangio.','El conidio es de origen sexual; la esporangiospora, de origen bacteriano.','El conidio caracteriza a levaduras; la esporangiospora, a tejidos humanos.','No existe diferencia de organización ni de localización entre ambas estructuras.'],0,'Los conidios son esporas asexuales externas, mientras las esporangiosporas se originan dentro de un saco o esporangio.','micro-spores-conidia-a.webp'),
      q('¿Qué conjunto debe describirse en la lámina rotulada «Mucor» sin convertir la fotografía en una identificación definitiva?',['Hifas anchas cenocíticas con estructuras esporangiales.','Levaduras encapsuladas con gemación de base estrecha.','Hifas septadas con conidióforos en forma de pincel.','Blastoconidias acompañadas por pseudohifas en la preparación.'],0,'La referencia de Mucor orienta a hifas anchas cenocíticas y esporangios, pero una muestra real requiere confirmación integrada.','micro-mucor.webp'),
      q('¿Qué rasgo de la lámina rotulada «Rhizopus» ayuda a diferenciar su organización de la referencia de Mucor?',['Rizoides asociados a estolones y esporangióforos.','Una cápsula prominente alrededor de cada levadura.','Conidióforos ramificados con aspecto de pincel.','Artroconidios rectangulares como único elemento visible.'],0,'Rhizopus presenta de forma característica rizoides y estolones vinculados con esporangióforos; el conjunto debe confirmarse en el aislamiento.','micro-rhizopus.webp'),
      q('¿Qué organización microscópica orienta a la lámina docente rotulada «Penicillium»?',['Conidióforos en pincel con cadenas de conidios.','Esporangios cerrados sostenidos por rizoides opuestos.','Levaduras encapsuladas sin estructuras filamentosas.','Hifas anchas con esporangios como único patrón posible.'],0,'El aspecto de pincel de los conidióforos y las cadenas de conidios es una referencia clásica de Penicillium.','micro-penicillium.webp'),
      q('¿Qué estructura organiza la cabeza conidial característica de Aspergillus en la lámina rotulada?',['Vesícula terminal con células conidiógenas y conidios.','Un esporangio cerrado unido a rizoides y estolones.','Una cápsula polisacárida alrededor de una levadura gemante.','Una sucesión de artroconidios producida por fragmentación hifal.'],0,'En Aspergillus, el conidióforo termina en una vesícula que sostiene las células conidiógenas y las cadenas de conidios.','micro-aspergillus-fumigatus.webp'),
      q('¿Qué conclusión es metodológicamente correcta al estudiar la imagen rotulada «Aspergillus fumigatus»?',['Es una referencia; una muestra desconocida requiere confirmación.','Una cabeza conidial fotografiada confirma la asignación de A. fumigatus.','El color azul de la preparación determina la especie observada.','La forma macroscópica de una colonia vuelve innecesaria la microscopía.'],0,'La rotulación permite estudiar la referencia; en diagnóstico, la especie no debe asignarse solo por una fotografía aislada.','micro-aspergillus-fumigatus.webp'),
      q('¿Qué diferencia general existe entre una levadura y un moho?',['Levadura unicelular; moho formado por hifas y micelio.','La levadura forma esporangios, mientras el moho carece de esporas.','La levadura es una bacteria y el moho un protozoo.','Ambos términos describen el color de una colonia.'],0,'Las levaduras se organizan principalmente como células individuales, mientras los mohos son filamentosos.','micro-candida-albicans.webp'),
      q('¿Qué combinación puede observarse en una preparación compatible con Candida albicans?',['Levaduras gemantes o blastoconidias acompañadas de pseudohifas.','Rizoides y estolones como única forma de crecimiento.','Una cápsula muy prominente como criterio suficiente de especie.','Esporangios cerrados llenos de esporangiosporas.'],0,'Candida puede mostrar gemación, blastoconidias y pseudohifas; la interpretación depende de la muestra y del contexto.','micro-candida-albicans.webp'),
      q('¿Qué rasgo orientador destaca en la referencia docente de Cryptococcus neoformans?',['Levadura encapsulada gemante.','Moho con rizoides y grandes esporangios.','Conidióforo en pincel con cadenas de conidios.','Hifa fragmentada formada por artroconidios.'],0,'Cryptococcus neoformans es una levadura encapsulada; la cápsula orienta, pero no sustituye las pruebas de identificación.','micro-cryptococcus-neoformans.webp'),
      q('¿Qué función general cumplen muchas esporas y conidios fúngicos?',['Participan en reproducción o dispersión del hongo.','Transportan oxígeno dentro del micelio.','Convierten el agar en una cápsula bacteriana.','Representan una fase invasiva cuando aparecen en sangre.'],0,'Esporas y conidios son estructuras de propagación; su presencia no demuestra por sí sola invasión tisular.','micro-spores-conidia-b.webp'),
      q('¿Qué observaciones macroscópicas conviene registrar antes de identificar una colonia fúngica?',['Color, textura, relieve, reverso y crecimiento.','El nombre supuesto de la especie.','El diámetro externo del recipiente.','El color del microscopio y la intensidad de la lámpara.'],0,'La descripción sistemática de la colonia aporta datos que luego se integran con la microscopía y el contexto.','micro-penicillium.webp'),
      q('¿Para qué se usa un montaje con azul de lactofenol en una práctica de mohos?',['Para contrastar hifas y estructuras reproductivas.','Para medir la glucemia de una persona con candidemia.','Para demostrar sensibilidad antifúngica directamente por el color.','Para convertir levaduras en mohos durante la observación.'],0,'El azul de lactofenol facilita la visualización morfológica de hifas, conidios y estructuras relacionadas; no identifica por sí solo la especie.'),
      q('¿Qué secuencia reduce errores al enfocar una preparación fúngica en el microscopio?',['Bajo aumento, localización de la zona y ajuste fino al aumentar.','Empezar con el mayor aumento y mover bruscamente la platina.','Aplicar aceite antes de localizar la estructura de interés.','Cerrar el diafragma por completo y evitar ajustar la iluminación.'],0,'Localizar primero con bajo aumento protege la preparación y permite seleccionar una zona representativa antes de aumentar.'),
      q('¿Por qué no debe abrirse ni olerse directamente un cultivo con moho?',['Porque dispersa conidios o esporas y aumenta la exposición.','Porque el olor confirma la especie y altera el resultado.','Porque el aire convierte automáticamente el moho en levadura.','Porque el recipiente pierde su color diagnóstico.'],0,'Los cultivos se manipulan con medidas de bioseguridad; abrirlos u olerlos puede aerosolizar elementos fúngicos.'),
      q('¿Cuál es la interpretación más segura de una estructura fúngica vista en una única fotografía?',['Describir y correlacionar antes de nombrar la especie.','Asignar la especie por parecido visual sin revisar la muestra.','Ignorar la rotulación y elegir el agente más frecuente.','Considerar que una hifa visible demuestra infección invasiva.'],0,'La morfología orienta, pero la identificación exige concordancia entre fuente, cultivo, microscopía y contexto clínico.'),
      q('¿Qué dato diferencia una colonización o contaminación de una micosis invasiva?',['Invasión demostrada junto con clínica y muestra.','El color oscuro de la colonia aislada.','La presencia aislada de una espora en el ambiente.','El tamaño de la fotografía recibida por mensajería.'],0,'La invasión no se concluye por una imagen ambiental: requiere una muestra pertinente y correlación clínica o tisular.'),
      q('¿Qué combinación ofrece la interpretación práctica más sólida de un hongo desconocido?',['Muestra, morfología, cultivo y contexto clínico.','Una fotografía aislada sin rotulación ni datos clínicos.','El color de la colonia en el anverso.','La forma de una espora observada fuera de la muestra.'],0,'La identificación fiable surge de datos concordantes y no de un solo rasgo visual.'),
    ],
    vf:[
      vf('El micelio está formado por un conjunto de hifas.',true,'Las hifas son filamentos individuales y su red constituye el micelio. Puede revisarse el esquema micro-mycelium.webp.'),
      vf('Los artroconidios se forman dentro de un esporangio cerrado.',false,'Los artroconidios se originan por fragmentación de una hifa, no por formación dentro de un esporangio.'),
      vf('Los conidios se forman externamente y participan en la propagación asexual.',true,'A diferencia de las esporangiosporas, los conidios no se forman dentro de un esporangio.'),
      vf('La presencia de rizoides en una referencia de Rhizopus puede ser un dato útil para compararla con Mucor.',true,'Los rizoides y estolones forman parte de la organización característica estudiada para Rhizopus.'),
      vf('Una fotografía parecida a Penicillium basta para confirmar la especie de una muestra desconocida.',false,'El aspecto en pincel orienta, pero la identificación requiere datos del cultivo y de la microscopía integrada.'),
      vf('Candida albicans puede producir blastoconidias y pseudohifas.',true,'La combinación de levaduras gemantes, blastoconidias y pseudohifas puede observarse en Candida.'),
      vf('Cryptococcus neoformans se estudia como una levadura encapsulada.',true,'La cápsula es un rasgo orientador clásico, aunque la identificación debe confirmarse.'),
      vf('La observación de una espora fúngica en una muestra ambiental demuestra una micosis invasiva.',false,'Una espora ambiental puede representar exposición o contaminación; la invasión exige correlación clínica y una muestra significativa.'),
      vf('El signo del halo en una persona con neutropenia puede apoyar la sospecha de aspergilosis pulmonar invasiva.',true,'En el contexto adecuado, un nódulo rodeado de vidrio esmerilado apoya la sospecha, pero no constituye confirmación microbiológica aislada.'),
      vf('Abrir y oler un cultivo de moho es un método recomendado para reconocerlo.',false,'Esa práctica puede dispersar conidios o esporas y no debe utilizarse como prueba de identificación.'),
    ],
    cases:[
      clinical('Una persona con diabetes y catéter venoso presenta fiebre persistente. En los hemocultivos crecen levaduras y la lámina del caso muestra blastoconidias con pseudohifas.','¿Qué interpretación integra mejor los hallazgos?',['Candidemia probable asociada a catéter, pendiente de identificación.','Contaminación ambiental interpretada porque la levadura en sangre se considera irrelevante.','Criptococosis confirmada a partir de la presencia de gemación.','Mucormicosis confirmada por la diabetes sin revisar el cultivo.'],0,'El crecimiento de levaduras en sangre en una persona febril con catéter es significativo; blastoconidias y pseudohifas orientan a Candida, pero la especie debe confirmarse.','micro-case-candidemia.webp'),
      clinical('Una persona con leucemia y neutropenia prolongada presenta fiebre y síntomas respiratorios. La tomografía muestra un nódulo rodeado por vidrio esmerilado, descrito como signo del halo.','¿Qué hipótesis debe priorizarse y confirmarse?',['Aspergilosis pulmonar invasiva por confirmar con datos integrados.','Tinea superficial, porque el halo identifica un dermatofito.','Candidemia confirmada por la tomografía sin obtener muestras.','Colonización ambiental sin riesgo por tratarse de una persona neutropénica.'],0,'La neutropenia, la fiebre respiratoria y el signo del halo apoyan aspergilosis invasiva; hacen falta pruebas microbiológicas o histológicas según el caso.','micro-case-aspergillosis.webp'),
      clinical('Una persona inmunocomprometida aporta una muestra respiratoria que produce una colonia desconocida. La microscopía se parece a la referencia rotulada «Mucor», con hifas anchas y estructuras esporangiales.','¿Qué conducta evita sobreinterpretar la fotografía?',['Describir y confirmar antes de asignar género o especie.','Nombrar Mucor de forma definitiva por el parecido.','Diagnosticar infección invasiva sin conocer el origen de la muestra.','Descartar otros mucorales porque la hifa es ancha.'],0,'La lámina rotulada es una referencia. Una muestra desconocida requiere procedencia, cultivo y examen integrado para sostener la identificación.','micro-mucor.webp'),
      clinical('Una persona analiza dos aislamientos fúngicos con estructuras esporangiales. En uno se señalan estolones y rizoides asociados a esporangióforos al compararlo con las referencias Mucor y Rhizopus.','¿A cuál referencia corresponde ese rasgo diferencial?',['A Rhizopus.','A Cryptococcus neoformans.','A Candida albicans.','A Penicillium.'],0,'Los rizoides y estolones orientan a la organización de Rhizopus frente a la referencia de Mucor.','micro-rhizopus.webp'),
      clinical('Una persona con lesión cutánea aporta una muestra que produce una colonia filamentosa. En el montaje se observan conidióforos ramificados en forma de pincel con cadenas de conidios, pero todavía falta completar la identificación.','¿Qué informe preliminar es más responsable?',['Morfología tipo Penicillium; identificación pendiente.','Penicillium confirmado a nivel de especie a partir del montaje.','Rhizopus informado porque la estructura aérea se interpreta como un esporangio.','Cryptococcus confirmado por la presencia de cadenas externas.'],0,'El patrón en pincel orienta a Penicillium, pero un informe responsable distingue una compatibilidad morfológica de la identificación final.','micro-penicillium.webp'),
      clinical('Una persona con síntomas respiratorios aporta una muestra que produce una colonia desconocida. La microscopía muestra una cabeza conidial semejante a la referencia rotulada «Aspergillus fumigatus».','¿Qué paso mantiene la calidad de la identificación?',['Integrar morfología, cultivo y pruebas antes de informar.','Informar A. fumigatus debido al parecido entre las imágenes.','Usar el color azul del montaje como prueba específica.','Descartar Aspergillus porque produce conidios externos.'],0,'La semejanza sirve para orientar el estudio, no para reemplazar la confirmación del aislamiento.','micro-aspergillus-fumigatus.webp'),
      clinical('Una persona con una lesión descamativa aporta una muestra para estudio micológico. En la preparación se observan fragmentos rectangulares separados a partir de una hifa y la referencia indica «artroconidios».','¿Qué mecanismo explica el hallazgo?',['Fragmentación hifal en unidades de propagación.','Gemación desde una levadura encapsulada.','Liberación desde un esporangio cerrado.','Formación de una vesícula terminal con fiálides.'],0,'Los artroconidios se forman cuando la hifa se segmenta y sus células se separan.','micro-arthroconidia.webp'),
      clinical('Una persona inmunocomprometida presenta síntomas respiratorios y aporta una muestra con levaduras redondeadas. En la preparación se aprecia un halo claro y se consulta la referencia rotulada «Cryptococcus neoformans».','¿Qué conclusión es adecuada en esta etapa?',['La cápsula orienta a Cryptococcus; requiere confirmación.','El halo confirma C. neoformans sin pruebas complementarias.','La imagen demuestra Aspergillus invasivo.','La levadura encapsulada se informa como Candida albicans.'],0,'Una levadura encapsulada orienta a Cryptococcus; la especie no se establece solo por el halo de una fotografía.','micro-cryptococcus-neoformans.webp'),
      clinical('Una persona con sospecha de infección fúngica aporta una muestra con estructuras reproductivas. En la microscopía se compara un esporangio con una cadena de elementos asexuales externos sobre un conidióforo.','¿Cuál es el término apropiado para la segunda estructura?',['Conidios.','Esporangiosporas.','Rizoides.','Pseudohifas.'],0,'Los conidios se producen externamente sobre células conidiógenas; las esporangiosporas se forman dentro de un esporangio.','micro-spores-conidia-b.webp'),
      clinical('Una persona inmunocomprometida aporta una muestra respiratoria que desarrolla una colonia ambiental. El material se parece a una lámina de referencia, pero llegó sin rótulo, sitio de origen ni control de contaminación.','¿Qué acción mejora primero la validez de la interpretación?',['Solicitar procedencia y una muestra bien rotulada.','Confirmar una micosis invasiva por el color de la colonia.','Elegir la especie más conocida y omitir el cultivo.','Tratar la fotografía como si fuera una muestra clínica de sangre.'],0,'Sin trazabilidad ni contexto, solo puede describirse la morfología; una nueva muestra bien rotulada permite una interpretación válida.'),
    ]
  };

  function distributeAnswers(items,seed){
    items.forEach(function(question,index){
      var length = question.options.length;
      var offset = ((index * 3) + seed) % length;
      if(!offset) return;
      question.options = question.options.slice(offset).concat(question.options.slice(0,offset));
      question.answer = (question.answer - offset + length) % length;
    });
  }

  distributeAnswers(bank.qcm,2);
  distributeAnswers(bank.cases,3);
  practice.banks[bank.courseId] = bank;
})();
