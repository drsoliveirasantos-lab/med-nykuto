(function () {
  'use strict';

  var model = window.MedNykutoAcademicModel;
  if (!model || !model.subjects || !model.narratives) return;

  function appendLesson(subjectId, chapterId, lesson) {
    var subject = model.subjects[subjectId];
    if (!subject) return;
    var chapter = subject.chapters.find(function (item) { return item.id === chapterId; });
    if (!chapter || chapter.lessons.some(function (item) { return item.id === lesson.id; })) return;
    chapter.lessons.push(lesson);
  }

  appendLesson('nutricion', 'nutricion-capitulo-1', {
    id: 'nutricion-2026-08-27',
    practiceId: 'nutricion-2026-08-27',
    date: '27 AGO.',
    dateLong: '27 de agosto de 2026',
    title: 'Guías alimentarias, etiquetado y lectura crítica',
    status: 'confirmed'
  });
  model.subjects.nutricion.note = 'El 20 de agosto se realizó el seminario. La clase teórica del 27 de agosto quedó confirmada con la transcripción, material académico del Drive y dos imágenes asociadas a la sesión.';

  appendLesson('fisiologia', 'fisiologia-capitulo-2', {
    id: 'fisiologia-2026-08-27',
    practiceId: 'fisiologia-2026-08-27',
    date: '27 AGO.',
    dateLong: '27 de agosto de 2026',
    title: 'Vías sensitivas, decusación y localización de lesiones',
    status: 'confirmed'
  });

  appendLesson('microbiologia-practica', 'microbiologia-practica-capitulo-1', {
    id: 'microbiologia-practica-2026-08-27',
    practiceId: 'microbiologia-practica-2026-08-27',
    date: '27 AGO.',
    dateLong: '27 de agosto de 2026',
    title: 'Reconocimiento microscópico y casos de micosis oportunistas',
    status: 'confirmed'
  });

  model.narratives['nutricion-2026-08-27'] = {
    title: 'Leer una guía y un envase sin confundir mensaje con evidencia',
    lead: 'En esta clase aprenderás dos cosas. Primero, cómo las guías alimentarias convierten conocimientos de nutrición en mensajes que una población puede comprender y aplicar. Después, cómo leer un envase paso a paso: porción, ingredientes, nutrientes, lote y vencimiento. La idea principal es no decidir por la publicidad del frente, sino comprobar la información completa.',
    sections: [
      ['Guías alimentarias', 'Una guía traduce nutrición a decisiones comprensibles', 'Una guía alimentaria intenta explicar de forma visual qué decisiones ayudan a organizar la alimentación. Los colores, las imágenes, el tamaño y la posición de cada elemento facilitan la comprensión, pero necesitan una explicación para que el mensaje no se interprete de forma incorrecta.', 'Para entender una guía hay que preguntarse a quién está dirigida. La cultura, los alimentos disponibles, la situación económica y los problemas de salud cambian de una población a otra. Por eso, una pirámide o un gráfico pueden ser útiles en un lugar sin ser el modelo perfecto para todos.'],
      ['Paraguay', 'La Olla y el Sendero Saludable integran alimentación y hábitos', 'En Paraguay, la Olla Nutricional reúne los grupos de alimentos en una imagen cercana a la población. Su función es orientar de manera general, no indicar automáticamente qué debe comer cada paciente.', 'El Sendero Saludable completa ese mensaje al incluir agua y actividad física. Cuando se aplica a niños, la actividad también puede entenderse como juego activo. Si existe una condición clínica, la guía sigue siendo una referencia poblacional y la decisión individual requiere otra evaluación.'],
      ['Complementación', 'Cereales y legumbres mejoran juntos el perfil de aminoácidos', 'La complementación proteica consiste en combinar alimentos cuyos perfiles de aminoácidos se ayudan entre sí. Un ejemplo trabajado en clase es unir arroz o fideos con porotos.', 'Lo importante no es afirmar que cada alimento cambia de naturaleza. La mejora aparece al considerar el conjunto de la comida. Además, es una combinación familiar, accesible y útil para valorar preparaciones de bajo costo.'],
      ['Porción', 'La tabla describe una cantidad declarada, no siempre el envase entero', 'Antes de mirar calorías, azúcar o sodio, hay que localizar el tamaño de la porción y cuántas porciones contiene el envase. La tabla informa valores para esa cantidad declarada, que no siempre corresponde a todo el paquete.', 'Si una persona consume dos porciones, debe interpretar dos veces los valores indicados por porción. Esto se aplica a energía, carbohidratos, azúcares, sodio y los demás nutrientes. El porcentaje de valor diario también parte de esa porción y no representa exactamente la necesidad de todas las personas.'],
      ['Trazabilidad', 'Ingredientes, vencimiento y lote responden preguntas diferentes', 'Cada dato del envase responde a una pregunta distinta. Los ingredientes ayudan a reconocer los componentes del alimento; el vencimiento señala el límite de uso declarado; y el lote identifica la partida de producción a la que pertenece esa unidad.', 'Estos datos también son importantes cuando un alimento se cambia de recipiente. Conservar el lote y el vencimiento permite relacionarlo con su origen si aparece un aviso de contaminación, defecto o retiro del producto.'],
      ['Marketing', 'La portada atrae; la composición se comprueba detrás', 'El frente del envase está diseñado para llamar la atención. Palabras como «natural», «fitness», «light» o «sin azúcar» no permiten conocer por sí solas toda la composición.', 'La comprobación se realiza comparando la promesa frontal con la porción, la tabla nutricional y la lista de ingredientes. Tampoco se juzga un alimento de manera aislada: se observan cantidad, frecuencia, posibles sustituciones y el patrón alimentario completo.'],
      ['Aplicación clínica', 'La misma etiqueta se lee con una pregunta diferente según el paciente', 'La etiqueta es la misma, pero la pregunta cambia según la situación. En hipertensión se presta atención al sodio total y al sodio que puede pasar desapercibido. En diabetes se revisan la porción, los carbohidratos y los ingredientes, aunque el frente diga «sin azúcar».', 'En celiaquía se comprueba que el producto tenga una declaración apta y también se considera la contaminación cruzada. En deporte, la cantidad de proteína no se decide con una cifra igual para todos: depende del peso, la actividad, el objetivo y la situación clínica.'],
      ['Actividad', 'El registro personal vuelve visible el patrón real', 'La actividad consiste en registrar lo que realmente se consume. Deben aparecer alimentos, bebidas, horarios y suficiente contexto para entender cómo se organiza la alimentación diaria.', 'El objetivo es hacer visible el patrón: frecuencia, variedad y posibles oportunidades de cambio. No se utiliza para calificar moralmente a la persona ni para construir una lista rígida de alimentos prohibidos.']
    ]
  };

  model.narratives['fisiologia-2026-08-27'] = {
    title: 'De cada receptor al lado del cuerpo donde aparece el déficit',
    lead: 'Para entender una vía sensitiva, sigue siempre la misma secuencia: qué estímulo aparece, qué receptor lo detecta, por qué fibra viaja, por dónde asciende y en qué lugar cruza al otro lado. Esta secuencia permite comprender propiocepción, tacto, dolor y temperatura. También ayuda a localizar una lesión según el lado del cuerpo donde aparece el déficit.',
    sections: [
      ['Propiocepción', 'Huso y órgano tendinoso miden variables diferentes', 'La propiocepción informa sobre lo que ocurre en músculos y tendones. El huso neuromuscular detecta la longitud del músculo y la velocidad con la que se estira. Esta información viaja por aferencias Ia y II.', 'Dentro del huso, las fibras de cadena nuclear y las fibras de bolsa nuclear tipo 2 aportan principalmente información estática; las fibras de bolsa nuclear tipo 1 destacan los cambios dinámicos. El órgano tendinoso de Golgi mide otra variable: la tensión en la unión musculotendinosa, transmitida por aferencias Ib.', 'No toda esta información necesita llegar primero a la conciencia. La médula puede organizar una respuesta refleja antes de que la persona perciba de manera consciente lo sucedido.'],
      ['Tacto', 'Contacto, presión y vibración describen patrones mecánicos', 'Meissner, Merkel, Pacini, Ruffini y las terminaciones libres son receptores cutáneos. No todos responden de la misma forma: se relacionan con distintos patrones mecánicos y presentan diferencias de adaptación.', 'Para estudiar la vía, primero hay que distinguir el tipo de tacto. El tacto fino, la vibración y gran parte de la presión discriminativa ascienden sobre todo por la columna dorsal. El tacto grosero se relaciona con el sistema anterolateral.'],
      ['Nocicepción', 'Terminaciones libres mantienen la señal de un estímulo dañino', 'Los nociceptores son terminaciones libres que responden a estímulos capaces de producir daño. Pueden activarse por estímulos mecánicos intensos, temperaturas extremas o sustancias químicas. Mientras el daño continúa, su adaptación es mínima.', 'El dolor rápido suele ser agudo y mejor localizado. Viaja por fibras Aδ y se relaciona con el componente neoespinotalámico. El dolor lento suele ser urente o difuso, viaja por fibras C y se relaciona con el componente paleoespinotalámico.'],
      ['Termorrecepción', 'Frío y calor inocuos dejan paso al dolor en los extremos', 'El frío y el calor se detectan mediante terminaciones nerviosas libres sensibles a la temperatura. La información viaja principalmente por fibras pequeñas, y los receptores de frío son más numerosos que los de calor.', 'Los valores de temperatura se entienden como umbrales aproximados, no como una única cifra rígida para memorizar. Cuando la temperatura deja de ser inocua y amenaza el tejido, también se activan nociceptores y aparece dolor.'],
      ['Columna dorsal', 'Las fibras ascienden del mismo lado y cruzan en el bulbo', 'La columna dorsal conduce propiocepción consciente, vibración y tacto discriminativo. Estas fibras ascienden por la médula del mismo lado por el que entraron, hasta llegar a los núcleos grácil y cuneiforme.', 'El cruce ocurre después, en el bulbo. Desde allí, la segunda neurona asciende por el lemnisco medial hasta el núcleo ventral posterolateral del tálamo; una tercera neurona proyecta luego hacia la corteza somatosensitiva. Sus fibras grandes y mielinizadas permiten una conducción rápida.'],
      ['Anterolateral', 'Dolor y temperatura cruzan cerca de la entrada medular', 'En esta vía, la primera neurona entra por la raíz dorsal y realiza sinapsis en el asta posterior. La segunda neurona cruza cerca del nivel de entrada, dentro de la médula, y luego asciende por el cordón anterolateral.', 'Este sistema transporta principalmente dolor, temperatura y tacto grosero. Utiliza fibras más pequeñas, poco mielinizadas o amielínicas. La diferencia esencial con la columna dorsal es el lugar donde ocurre el cruce.'],
      ['Lesiones', 'Antes del cruce es ipsilateral; después, contralateral', 'Para localizar una lesión, primero pregunta si la vía ya cruzó. Antes del cruce, el déficit aparece del mismo lado de la vía lesionada; después del cruce, aparece en el lado contrario.', 'Por ejemplo, una lesión del cordón posterior derecho en la médula altera vibración y posición del lado derecho por debajo de la lesión, porque esas fibras todavía no cruzaron. En cambio, una lesión anterolateral derecha altera principalmente dolor y temperatura del lado izquierdo, porque esas fibras ya cruzaron.', 'Cuando la lesión está en la corteza, las vías ya realizaron su cruce. Por eso, el déficit sensitivo es predominantemente contralateral.'],
      ['Alcance', 'Este bloque de neurofisiología queda fuera del P1 respiratorio', 'Esta clase de neurofisiología sigue disponible para estudio general, pero no pertenece al contenido confirmado del primer parcial respiratorio. La docente indicó oralmente que el P1 de Fisiología abarca solamente respiratorio.', 'Neurofisiología fue adelantada por su extensión. Por ese motivo, sus preguntas no deben mezclarse con el simulacro P1 mientras no exista una nueva indicación oficial.']
    ]
  };

  model.narratives['microbiologia-practica-2026-08-27'] = {
    title: 'Reconocer una referencia visual sin sobreinterpretar una muestra',
    lead: 'Esta práctica enseña a observar antes de identificar. Primero se enfoca la preparación, después se describen las estructuras visibles y solo entonces se propone una posible identidad. Las láminas rotuladas sirven para aprender a comparar, pero una fotografía aislada no confirma una especie ni una infección: debe integrarse con la muestra, el cultivo, la microscopía y la situación clínica.',
    sections: [
      ['Método', 'Primero se enfoca y describe; después se propone una identidad', 'La observación comienza con bajo aumento para localizar la preparación. Después se ajustan la iluminación y el enfoque. Cuando la zona está bien ubicada, se aumenta con cuidado y se utiliza el control fino.', 'Antes de decir el nombre de un hongo, se describe lo que realmente aparece en la imagen. Puede hablarse de hifas, micelio o estructuras reproductivas visibles. Este orden evita convertir una semejanza visual en una identificación automática.', 'En las fotografías de clase, los rótulos indican la referencia docente. En una muestra desconocida, el parecido solo orienta y necesita confirmación.'],
      ['Mohos', 'Mucor, Rhizopus, Penicillium y Aspergillus se comparan en conjunto', 'Las referencias de la serie permiten comparar Mucor, Rhizopus, Penicillium y Aspergillus. La comparación debe centrarse en la organización de las hifas y en las estructuras reproductivas observadas.', 'Mucor y Rhizopus se estudian mediante estructuras esporangiales. Penicillium y Aspergillus se relacionan con una organización conidial. Esta diferencia ayuda a ordenar la observación antes de intentar recordar el nombre.', 'El rótulo de una lámina confirma qué quiso mostrar el material docente. No significa que cualquier fotografía con una forma parecida corresponda necesariamente al mismo género.'],
      ['Estructuras', 'Micelio, artroconidios y conidios nombran niveles distintos', 'El micelio no es una estructura aislada: es el conjunto de hifas. Los artroconidios aparecen por fragmentación de una hifa, mientras que los conidios son estructuras asexuales externas.', 'También hay que diferenciar conidios de esporangiosporas. Una cadena externa no se interpreta igual que elementos contenidos dentro de un esporangio. Nombrar primero la estructura reduce la confusión entre los distintos mohos.'],
      ['Levaduras', 'Candida y Cryptococcus requieren descripción y contexto', 'La serie contiene referencias rotuladas de Candida albicans y Cryptococcus neoformans. En Candida pueden observarse blastoconidias y pseudohifas. Cryptococcus se estudia como una levadura encapsulada.', 'En una muestra real, la imagen no responde por sí sola si existe infección. El sitio de obtención, los factores de riesgo y las pruebas complementarias ayudan a distinguir colonización, contaminación e infección.'],
      ['Caso 1', 'Levaduras en sangre y catéter orientan a candidemia', 'El primer caso reúne varios datos que deben leerse juntos: diabetes, hospitalización, fiebre persistente, catéter venoso central y uso de antibióticos de amplio espectro.', 'En el hemocultivo aparecen levaduras con blastoconidias y pseudohifas. La diapositiva resuelve el caso como candidemia por Candida albicans y destaca el catéter como una brecha de defensa.', 'La enseñanza del caso no depende de una sola imagen. La orientación aparece al integrar los factores clínicos, el dispositivo y el resultado microbiológico.'],
      ['Caso 2', 'Neutropenia profunda y signo del halo orientan a aspergilosis invasiva', 'El segundo caso presenta una paciente con leucemia mieloide aguda en quimioterapia, neutropenia severa, tos seca y dolor torácico pleurítico. Estos elementos forman el contexto clínico.', 'Los nódulos pulmonares con signo del halo apoyan, dentro de este caso docente, una aspergilosis invasiva por Aspergillus fumigatus. La conclusión se obtiene al unir imagen, clínica y microbiología.', 'El signo visual no debe separarse del resto del caso. La neutropenia y los síntomas forman parte del razonamiento presentado en la diapositiva.'],
      ['Bioseguridad', 'Una buena imagen no justifica abrir u oler un cultivo', 'Observar una imagen clara no autoriza a manipular un cultivo de manera insegura. Los cultivos de moho pueden aerosolizar esporas o conidios; por eso se mantienen cerrados y se utilizan la bata, la protección indicada y el descarte institucional.', 'La rotulación y la trazabilidad también forman parte del resultado. Una fotografía sin información sobre el origen de la muestra permite describir lo visible, pero no permite afirmar invasión ni identificar con seguridad una especie.'],
      ['Límite', 'El tercer caso no está disponible y no se reconstruye', 'El material disponible documenta solamente dos de los tres casos anunciados. El tercer caso no debe completarse mediante suposiciones y queda fuera de esta ficha y del banco de preguntas.', 'La selección también respeta el contexto académico y la privacidad de las personas. Conversaciones domésticas, vídeos accidentales y contenidos privados de la grabación no se convierten en material de estudio.']
    ]
  };

  var nutritionTeacher = model.teachers['johana-leguizamon'];
  if (nutritionTeacher) {
    nutritionTeacher.confidence = 'Media-alta en el método · examen todavía no observado';
    nutritionTeacher.confidenceReason = 'La clase completa del 27 de agosto, dos imágenes académicas asociadas a la sesión y los PDF oficiales permiten reconocer un método repetido de lectura visual, etiquetado y aplicación clínica. La forma exacta del examen todavía no fue observada.';
    nutritionTeacher.evidence.push({ date: '27 ago.', state: 'confirmed', label: 'Guías alimentarias, porciones, ingredientes, trazabilidad, marketing y aplicación clínica.' });
    nutritionTeacher.likelyExamTargets = [
      'Adaptar una guía alimentaria a la población y explicar su mensaje visual.',
      'Leer la porción, las porciones por envase, los ingredientes, el porcentaje del valor diario, el vencimiento y el lote.',
      'Contrastar marketing frontal con la composición declarada.',
      'Aplicar la lectura a hipertensión, diabetes y celiaquía sin usar absolutos.'
    ];
  }

  var physiologyTeacher = model.teachers['giselle-vert'];
  if (physiologyTeacher) {
    physiologyTeacher.evidence.push({ date: '27 ago.', state: 'confirmed', label: 'Tabla comparativa, decusación y lateralidad de lesiones; P1 oralmente limitado a respiratorio.' });
  }

  var microTeacher = model.teachers['ruth-castillo'];
  if (microTeacher) {
    microTeacher.evidence.push({ date: '27 ago.', state: 'confirmed', label: 'Serie rotulada de láminas y dos casos de micosis oportunistas documentados en las imágenes recibidas.' });
    microTeacher.likelyExamTargets = [
      'Reconocimiento visual prudente de mohos, levaduras y estructuras.',
      'Micelio, artroconidios, conidios y esporangiosporas.',
      'Candida frente a Cryptococcus en una referencia rotulada.',
      'Candidemia asociada a catéter y aspergilosis invasiva en neutropenia.',
      'Enfoque, trazabilidad y bioseguridad durante la observación.'
    ];
  }

  model.version = 'v494';
  model.updatedAt = '2026-08-27';
})();
