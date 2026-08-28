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
    lead: 'La clase une comunicación poblacional y decisión individual. Primero explica por qué una guía debe adaptarse a la cultura; después enseña a leer porción, ingredientes, nutrientes, lote y vencimiento antes de aceptar una promesa del frente del envase.',
    sections: [
      ['Guías alimentarias', 'Una guía traduce nutrición a decisiones comprensibles', 'Colores, tamaño, posición e imágenes organizan un mensaje que debe entender la población general. La forma visual ayuda a indicar frecuencia o cantidad, pero no reemplaza la explicación.', 'La guía se adapta a cultura, disponibilidad, economía y problemas de salud de cada población. Por eso ninguna pirámide es universalmente perfecta.'],
      ['Paraguay', 'La Olla y el Sendero Saludable integran alimentación y hábitos', 'La Olla Nutricional organiza grupos alimentarios en una representación propia de Paraguay. El Sendero Saludable recuerda agua y actividad física; en niños también significa favorecer el juego activo.', 'El gráfico orienta a la población y no prescribe automáticamente la dieta de cada paciente. Una condición clínica exige una evaluación individual.'],
      ['Complementación', 'Cereales y legumbres mejoran juntos el perfil de aminoácidos', 'Arroz o fideos con porotos combinan perfiles de aminoácidos complementarios. Es una estrategia culturalmente familiar, accesible y útil para valorar comidas de bajo costo.', 'La expresión precisa es complementación proteica: la calidad del conjunto mejora sin convertir cada ingrediente por separado en una proteína distinta.'],
      ['Porción', 'La tabla describe una cantidad declarada, no siempre el envase entero', 'La lectura empieza por tamaño de porción y número de porciones. Si se consume el doble, también se duplican energía, carbohidratos, azúcares, sodio y los demás valores por porción.', 'El porcentaje de valor diario se interpreta con esa base y con la referencia indicada en el envase; no representa la necesidad exacta de toda persona.'],
      ['Trazabilidad', 'Ingredientes, vencimiento y lote responden preguntas diferentes', 'La lista de ingredientes permite reconocer qué componentes predominan. La fecha de vencimiento informa el límite de uso declarado y el lote vincula la unidad con una partida de producción.', 'Conservar lote y vencimiento al cambiar el alimento de envase permite responder ante un retiro por contaminación o defecto.'],
      ['Marketing', 'La portada atrae; la composición se comprueba detrás', 'Términos publicitarios como «natural», «fitness», «light» o «sin azúcar» no demuestran por sí solos una composición adecuada. Se contrastan con la porción, la tabla y los ingredientes.', 'No se demoniza un alimento aislado: se valoran cantidad, frecuencia, sustituciones y patrón completo. La publicidad no se usa como criterio clínico.'],
      ['Aplicación clínica', 'La misma etiqueta se lee con una pregunta diferente según el paciente', 'En hipertensión se busca sodio total y oculto; en diabetes se revisan carbohidratos, porción e ingredientes, no solo la frase «sin azúcar».', 'En celiaquía se comprueba la declaración apta y se previene la contaminación cruzada. En deporte, el requerimiento proteico depende de peso, actividad, objetivo y situación clínica.'],
      ['Actividad', 'El registro personal vuelve visible el patrón real', 'La tarea propuesta es registrar la alimentación actual por escrito o de forma visual. Deben aparecer alimentos, bebidas, horarios y contexto suficiente para observar el patrón.', 'El registro sirve para identificar frecuencia, variedad y oportunidades de cambio; no es una evaluación moral ni una lista de alimentos prohibidos.']
    ]
  };

  model.narratives['fisiologia-2026-08-27'] = {
    title: 'De cada receptor al lado del cuerpo donde aparece el déficit',
    lead: 'La clase organiza propiocepción, tacto, dolor y temperatura en una misma cadena: estímulo, receptor, fibra, vía, decusación y corteza. El objetivo final es usar el lugar del cruce para localizar una lesión.',
    sections: [
      ['Propiocepción', 'Huso y órgano tendinoso miden variables diferentes', 'El huso neuromuscular detecta longitud y velocidad de estiramiento mediante aferencias Ia y II. Las fibras de cadena nuclear aportan sobre todo información estática y las de bolsa nuclear participan en la respuesta dinámica.', 'El órgano tendinoso de Golgi está en la unión musculotendinosa, detecta tensión y envía aferencias Ib. La médula puede producir respuestas reflejas antes de la percepción consciente.'],
      ['Tacto', 'Contacto, presión y vibración describen patrones mecánicos', 'Meissner, Merkel, Pacini, Ruffini y terminaciones libres son mecanorreceptores cutáneos con funciones y adaptación diferentes.', 'Tacto fino, vibración y gran parte de la presión discriminativa viajan sobre todo por columna dorsal; el tacto grosero se asocia al sistema anterolateral.'],
      ['Nocicepción', 'Terminaciones libres mantienen la señal de un estímulo dañino', 'Estímulos mecánicos intensos, temperaturas extremas y sustancias químicas pueden activar nociceptores. Estos receptores presentan adaptación mínima mientras persiste el daño.', 'El dolor rápido es agudo y mejor localizado, viaja por Aδ y se asocia al componente neoespinotalámico. El dolor lento es urente o difuso, viaja por C y se asocia al componente paleoespinotalámico.'],
      ['Termorrecepción', 'Frío y calor inocuos dejan paso al dolor en los extremos', 'Terminaciones nerviosas libres sensibles a temperatura transmiten frío y calor, principalmente por fibras pequeñas. Los receptores de frío son más numerosos que los de calor.', 'Los umbrales son aproximados y no se convierten en una cifra única de examen. Cuando la temperatura amenaza el tejido también se activan nociceptores.'],
      ['Columna dorsal', 'Las fibras ascienden del mismo lado y cruzan en el bulbo', 'Propiocepción consciente, vibración y tacto discriminativo ascienden por cordones posteriores hasta los núcleos grácil y cuneiforme.', 'La segunda neurona cruza en el bulbo y continúa por el lemnisco medial hacia tálamo y corteza somatosensitiva. Fibras grandes y mielinizadas explican la conducción rápida.'],
      ['Anterolateral', 'Dolor y temperatura cruzan cerca de la entrada medular', 'La primera neurona entra por la raíz dorsal y hace sinapsis en el asta posterior. La segunda cruza por la médula y asciende en el cordón anterolateral.', 'Este sistema conduce dolor, temperatura y tacto grosero mediante fibras más pequeñas, poco mielinizadas o amielínicas.'],
      ['Lesiones', 'Antes del cruce es ipsilateral; después, contralateral', 'Una lesión medular del cordón posterior derecho altera vibración y posición del lado derecho por debajo de la lesión porque la vía aún no cruzó.', 'Una lesión anterolateral derecha altera sobre todo dolor y temperatura del lado izquierdo porque esas fibras ya cruzaron. Una lesión cortical produce un déficit predominante contralateral.'],
      ['Alcance', 'Este bloque de neurofisiología queda fuera del P1 respiratorio', 'La docente indicó oralmente que el primer parcial de Fisiología abarca solamente respiratorio y explicó que neurofisiología se adelantó por su extensión.', 'La clase permanece disponible para revisión general y preparación posterior, pero sus preguntas no se mezclan en el simulacro P1 salvo nueva indicación oficial.']
    ]
  };

  model.narratives['microbiologia-practica-2026-08-27'] = {
    title: 'Reconocer una referencia visual sin sobreinterpretar una muestra',
    lead: 'La práctica reúne láminas rotuladas, manipulación del microscopio y dos casos oportunistas. Las imágenes sirven para entrenar descripción y comparación; una fotografía aislada nunca sustituye la integración de muestra, cultivo, microscopía y clínica.',
    sections: [
      ['Método', 'Primero se enfoca y describe; después se propone una identidad', 'La preparación se localiza con bajo aumento, se ajustan iluminación y enfoque, y luego se aumenta con control fino. Se describe lo visible antes de nombrar un género.', 'Las fotografías están rotuladas como material docente. Para una muestra desconocida, la semejanza visual solo orienta y requiere confirmación.'],
      ['Mohos', 'Mucor, Rhizopus, Penicillium y Aspergillus se comparan en conjunto', 'La serie compartida identifica cuatro referencias de mohos. La comparación utiliza organización de hifas y estructuras reproductivas ya estudiadas en prácticas anteriores.', 'Mucor y Rhizopus se estudian con estructuras esporangiales; Penicillium y Aspergillus, con organización conidial. El rótulo de la clase no convierte cualquier imagen parecida en identificación definitiva.'],
      ['Estructuras', 'Micelio, artroconidios y conidios nombran niveles distintos', 'El micelio es el conjunto de hifas. Los artroconidios se originan por fragmentación de una hifa y los conidios son estructuras asexuales externas.', 'Distinguir conidios de esporangiosporas evita confundir una cadena externa con elementos contenidos dentro de un esporangio.'],
      ['Levaduras', 'Candida y Cryptococcus requieren descripción y contexto', 'La serie incluye referencias rotuladas de Candida albicans y Cryptococcus neoformans. Candida puede mostrar blastoconidias y pseudohifas; Cryptococcus se estudia como levadura encapsulada.', 'En una muestra real, sitio, factores de riesgo y pruebas complementarias separan colonización, contaminación e infección.'],
      ['Caso 1', 'Levaduras en sangre y catéter orientan a candidemia', 'El caso presenta un paciente diabético, hospitalizado, con fiebre persistente, catéter venoso central y antibióticos de amplio espectro.', 'El hemocultivo muestra levaduras con blastoconidias y pseudohifas; la diapositiva resuelve candidemia por Candida albicans y destaca el catéter como brecha de defensa.'],
      ['Caso 2', 'Neutropenia profunda y signo del halo orientan a aspergilosis invasiva', 'La paciente con leucemia mieloide aguda en quimioterapia presenta tos seca y dolor torácico pleurítico con neutropenia severa.', 'Los nódulos pulmonares con signo del halo apoyan aspergilosis invasiva por Aspergillus fumigatus en el caso docente. Imagen, clínica y microbiología deben integrarse.'],
      ['Bioseguridad', 'Una buena imagen no justifica abrir u oler un cultivo', 'Los cultivos de moho pueden aerosolizar esporas o conidios. Bata, protección indicada, recipiente cerrado y descarte institucional acompañan toda la práctica.', 'Trazabilidad y rotulación son parte del resultado: una fotografía sin origen de muestra permite describir, pero no concluir invasión ni especie.'],
      ['Límite', 'El tercer caso no está disponible y no se reconstruye', 'El material recibido documenta dos de los tres casos indicados. El caso faltante queda expresamente fuera de esta ficha y del banco de preguntas.', 'Ninguna conversación doméstica, vídeo accidental ni contenido privado de la grabación se utiliza como material académico.']
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
