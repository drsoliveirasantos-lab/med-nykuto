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

  function appendTeacherEvidence(teacherId, evidence) {
    var teacher = model.teachers && model.teachers[teacherId];
    if (!teacher || !Array.isArray(teacher.evidence)) return;
    if (teacher.evidence.some(function (item) {
      return item.date === evidence.date && item.label === evidence.label;
    })) return;
    teacher.evidence.push(evidence);
  }

  function appendUnique(list, value) {
    if (Array.isArray(list) && list.indexOf(value) === -1) list.push(value);
  }

  appendLesson('bioquimica', 'bioquimica-capitulo-2', {
    id: 'bioquimica-2026-08-28',
    practiceId: 'bioquimica-2026-08-28',
    date: '28 AGO.',
    dateLong: '28 de agosto de 2026',
    title: 'Vía de las pentosas fosfato: regulación, balances y destinos',
    status: 'confirmed'
  });

  appendLesson('epidemiologia', 'epidemiologia-capitulo-1', {
    id: 'epidemiologia-2026-08-28',
    practiceId: 'epidemiologia-2026-08-28',
    date: '28 AGO.',
    dateLong: '28 de agosto de 2026',
    title: 'Sistema de salud del Paraguay, redes y niveles de atención',
    status: 'confirmed'
  });

  model.narratives['bioquimica-2026-08-28'] = {
    title: 'La vía de las pentosas: conservar electrones y redistribuir carbonos',
    lead: 'La clase profundiza una ruta citosólica que parte de glucosa-6-fosfato. Su fase oxidativa produce NADPH de manera irreversible; su fase no oxidativa reorganiza pentosas de forma reversible para ajustar ribosa-5-fosfato, intermediarios glucolíticos y poder reductor a la necesidad celular.',
    sections: [
      ['Objetivos', 'NADPH y ribosa-5-fosfato son los dos productos funcionales centrales', 'La vía de las pentosas fosfato no tiene como objetivo directo producir ATP. Desvía glucosa-6-fosfato para obtener NADPH y esqueletos de cinco carbonos.', 'El NADPH sostiene reacciones reductoras y defensa antioxidante; la ribosa-5-fosfato aporta el azúcar necesario para sintetizar nucleótidos. La proporción requerida determina el recorrido posterior.'],
      ['Entrada regulada', 'La glucosa-6-fosfato deshidrogenasa controla el primer paso', 'La G6PD oxida glucosa-6-fosfato y transfiere un hidruro a NADP+, formando NADPH y 6-fosfoglucono-δ-lactona. Es la reacción reguladora principal de la ruta.', 'La disponibilidad de NADP+ favorece el flujo, mientras una relación NADPH/NADP+ elevada lo frena. Oxidar el sustrato significa que pierde electrones; NADP+ se reduce al recibirlos.'],
      ['Fase oxidativa', 'Cada glucosa-6-fosfato genera dos NADPH, CO2 y una pentosa', 'La lactonasa hidrata la lactona y forma 6-fosfogluconato. Luego, la 6-fosfogluconato deshidrogenasa produce un segundo NADPH y realiza una descarboxilación oxidativa.', 'El producto carbonado es ribulosa-5-fosfato: la molécula inicial de seis carbonos libera uno como CO2 y conserva cinco. Esta fase es irreversible.'],
      ['Balance de carbonos', 'Tres moléculas permiten visualizar el reordenamiento sin convertirlo en requisito de entrada', 'Para seguir la fase no oxidativa, la clase contabiliza tres glucosas-6-fosfato: la fase oxidativa entrega tres ribulosas-5-fosfato, seis NADPH y tres CO2.', 'Una glucosa-6-fosfato puede entrar por sí sola y siempre produce dos NADPH. El grupo de tres es una herramienta estequiométrica para mostrar cómo quince carbonos se redistribuyen después.'],
      ['Pentosas', 'Epimerasa e isomerasa preparan dos xilulosas y una ribosa', 'De tres ribulosas-5-fosfato, dos se convierten en xilulosa-5-fosfato mediante una epimerasa y una se convierte en ribosa-5-fosfato mediante una isomerasa.', 'La epimerasa modifica la configuración de un carbono; la isomerasa reorganiza el grupo carbonilo. Así se generan los sustratos adecuados para transferir fragmentos carbonados.'],
      ['Reordenamiento', 'Transcetolasa mueve dos carbonos y transaldolasa mueve tres', 'Primero, xilulosa-5-fosfato y ribosa-5-fosfato forman gliceraldehído-3-fosfato y sedoheptulosa-7-fosfato. La transcetolasa transfiere dos carbonos y utiliza tiamina pirofosfato.', 'La transaldolasa transfiere tres carbonos para formar fructosa-6-fosfato y eritrosa-4-fosfato. Una segunda transcetolasa produce otra fructosa-6-fosfato y otro gliceraldehído-3-fosfato.'],
      ['Balance no oxidativo', 'Quince carbonos de pentosas se conservan en productos glucolíticos', 'El balance neto de tres pentosas es dos fructosas-6-fosfato más un gliceraldehído-3-fosfato. No se pierde carbono durante esta fase.', 'Las reacciones son reversibles: los mismos intermediarios conectan la vía con glucólisis o permiten reconstruir pentosas cuando la demanda de ribosa es mayor.'],
      ['Necesidad de nucleótidos', 'La célula puede priorizar ribosa sin fabricar NADPH innecesario', 'Cuando se requieren ribosa-5-fosfato y NADPH en proporciones semejantes, la fase oxidativa aporta ambos. La ribosa entra en la síntesis de ribonucleótidos para ARN y otras funciones.', 'Si la demanda de ribosa supera a la de NADPH, la fase no oxidativa puede funcionar en sentido inverso desde fructosa-6-fosfato y gliceraldehído-3-fosfato. Parte de los ribonucleótidos se reduce después para aportar desoxirribonucleótidos al ADN.'],
      ['Necesidad de NADPH', 'Los carbonos se reciclan para repetir la fase oxidativa', 'Cuando predomina la demanda de NADPH, las pentosas se convierten en fructosa-6-fosfato y gliceraldehído-3-fosfato. Estos intermediarios pueden regresar a glucosa-6-fosfato mediante reacciones de sentido gluconeogénico y reiniciar la fase oxidativa.', 'Cada nueva vuelta produce más NADPH y libera carbono como CO2. Si disminuye esa demanda, los intermediarios dejan de reciclarse y continúan hacia glucólisis según el estado energético.'],
      ['Protección y síntesis', 'NADPH dona electrones; no aporta energía como ATP', 'NADPH participa en biosíntesis reductora de ácidos grasos y colesterol, y mantiene glutatión reducido frente a especies oxidantes. Los eritrocitos dependen especialmente de esta defensa para proteger hemoglobina y membrana.', 'Una actividad insuficiente de G6PD reduce la capacidad antioxidante y puede favorecer hemólisis ante estrés oxidativo. Esta consecuencia nace del déficit de NADPH, no de una falta directa de ATP.'],
      ['Preparación siguiente', 'La estructura de la glucosa anticipa glucogénesis y enlaces glucosídicos', 'Para la próxima clase se indicó repasar α-glucosa, β-glucosa y la nomenclatura de los enlaces. La orientación del carbono anomérico distingue los dos anómeros.', 'El glucógeno utiliza enlaces α(1→4) en las cadenas y α(1→6) en las ramificaciones. Un enlace β(1→4) tiene geometría y propiedades distintas y no forma la estructura del glucógeno.'],
      ['Actividad oral anunciada', 'La preparación se hace en grupo, pero cada explicación debe salir de la memoria', 'La profesora indicó formar los grupos al llegar, completar el paso asignado con libros y apuntes durante la preparación y llevar los trabajos firmados.', 'Al momento de responder, cada estudiante debe explicar el producto o paso que le corresponda sin teléfono, sin leer apuntes y con la respuesta preparada de forma individual. No se confirmó una hora exacta para esta actividad.']
    ]
  };

  model.narratives['epidemiologia-2026-08-28'] = {
    title: 'Del sistema fragmentado a una red que conserva la continuidad',
    lead: 'La clase presenta los principales subsistemas de salud del Paraguay y los ordena mediante redes, microredes y niveles de complejidad. El criterio útil no es solo el nombre del establecimiento: importa qué capacidad resuelve, cómo refiere y qué apoyo permite que el paciente continúe su atención.',
    sections: [
      ['Mapa del sistema', 'Paraguay combina provisión pública, seguridad social, servicios institucionales y sector privado', 'El sistema no funciona como un proveedor único. MSPBS, IPS, Hospital de Clínicas, sanidad militar y policial, y prestadores privados atienden poblaciones y utilizan mecanismos de financiamiento diferentes.', 'La coexistencia de subsistemas puede ampliar opciones, pero también fragmentar información y continuidad. Los porcentajes de cobertura mencionados oralmente no se fijan aquí porque requieren una fuente oficial actualizada.'],
      ['MSPBS', 'La red pública organiza rectoría y atención para la población', 'El Ministerio de Salud Pública y Bienestar Social conduce políticas sanitarias y sostiene establecimientos desde atención primaria hasta hospitales y servicios de referencia.', 'La disponibilidad efectiva depende de personal, medicamentos, diagnóstico, camas y transporte. Declarar un servicio en una estructura no garantiza que esté operativo todos los días y horarios.'],
      ['Otros subsistemas', 'Cada institución tiene población cubierta y reglas propias', 'IPS es un seguro social contributivo para cotizantes y sus beneficiarios. El Hospital de Clínicas depende de la Universidad Nacional de Asunción y combina asistencia, docencia y formación profesional.', 'La sanidad militar y la policial atienden a sus colectivos institucionales; el sector privado ofrece coberturas variables según contrato. Los convenios puntuales no convierten estos componentes en una única red automática.'],
      ['RIISS', 'Una red integrada e integral enlaza territorio, servicios y seguimiento', 'Las redes integradas e integrales de servicios de salud buscan acceso, integralidad, continuidad, calidad y uso coordinado de recursos. La persona, la familia y la comunidad son el centro del recorrido.', 'Integrar no significa acumular establecimientos: exige población y territorio definidos, responsabilidades claras, comunicación clínica y capacidad para acompañar al paciente entre niveles.'],
      ['Microred', 'La organización territorial empieza cerca del lugar donde vive la población', 'Las USF y otros puntos de primer contacto se articulan en microredes locales con establecimientos distritales, regionales y de referencia nacional.', 'Conocer población, vías de acceso y barreras geográficas permite anticipar necesidades. Liderazgo, gobernanza y participación de actores locales sostienen la coordinación.'],
      ['Nivel y complejidad', 'La capacidad instalada define lo que un establecimiento puede resolver', 'Los niveles ordenan recursos, profesionales, apoyo diagnóstico, hospitalización y tecnología. A mayor complejidad, mayor capacidad para problemas que requieren equipos especializados.', 'El rótulo del hospital no reemplaza una evaluación real de disponibilidad. Si ecografía, tomografía, laboratorio o especialista funcionan solo en ciertos horarios, la red debe prever una alternativa segura.'],
      ['Primer nivel', 'La APS resuelve lo frecuente, previene y coordina el acceso', 'Las Unidades de Salud de la Familia realizan promoción, prevención, atención inicial, seguimiento y trabajo comunitario. También identifican riesgo y necesidad de derivación.', 'Primer nivel no significa atención de poca importancia. Es la puerta que evita fragmentación y mantiene el plan cuando el paciente regresa de otro servicio.'],
      ['Segundo y tercer nivel', 'Especialidades, diagnóstico y hospitalización aumentan de forma progresiva', 'Centros de atención especializada y hospitales distritales o básicos amplían consulta, estudios y procedimientos. Hospitales regionales concentran mayor capacidad resolutiva, internación y especialidades.', 'La asignación concreta entre niveles depende de la cartera efectiva de cada establecimiento. La conducta correcta es derivar al recurso disponible que pueda resolver el problema, no al nombre teórico más cercano.'],
      ['Cuarto nivel', 'Los institutos nacionales concentran atención de alta especialización', 'Servicios de referencia para trauma, enfermedades infecciosas o respiratorias, oncología, salud mental, diálisis y otras áreas complejas suelen concentrarse en centros nacionales.', 'La centralización obliga a planificar coordinación y traslado. Sin comunicación, cama receptora y transporte adecuado, una derivación escrita no produce continuidad real.'],
      ['Apoyo transversal', 'Información, insumos y transporte hacen funcionar la red clínica', 'Laboratorio, imágenes, farmacia, sangre, logística, personal, regulación, comunicación y sistemas de información apoyan todos los niveles.', 'Referencia comunica motivo, estado y atención necesaria; contrarreferencia devuelve diagnóstico, conducta y seguimiento. Ambos movimientos deben acompañar al paciente y evitar repetición o abandono.'],
      ['Tres métodos de triage', 'Manchester no cumple la misma función operativa que START y SHORT', 'Manchester estructura el triage habitual de urgencias mediante diagramas, discriminadores y cinco prioridades con tiempos máximos. START se usa en incidentes con múltiples víctimas y clasifica rápidamente según marcha, respiración, perfusión y estado mental.', 'SHORT también se diseñó para múltiples víctimas: Sale caminando, Habla sin dificultad, Obedece órdenes sencillas, Respira y Taponar hemorragias. Son herramientas de prioridad, no diagnósticos definitivos.'],
      ['Preparación práctica', 'La clasificación debe justificarse con los datos del caso', 'La actividad anunciada será individual: cada estudiante recibirá una ficha clínica en papel, sin celular ni tablet, y dispondrá de aproximadamente treinta minutos para clasificar al paciente con el método solicitado.', 'Conviene practicar una secuencia fija: reconocer el contexto, localizar amenaza vital, aplicar el algoritmo sin saltos, asignar prioridad y escribir la justificación. No se inventan constantes ni información ausente del caso.']
    ]
  };

  appendTeacherEvidence('andrea-lopez', {
    date: '28 ago.',
    state: 'confirmed',
    label: 'Pentosas fosfato en profundidad: fases, balances de carbono, transcetolasa/transaldolasa y ajuste a la demanda de NADPH o ribosa.'
  });

  appendTeacherEvidence('andrea-isasi', {
    date: '28 ago.',
    state: 'confirmed',
    label: 'Sistema de salud paraguayo, RIISS, microredes, niveles de complejidad y preparación individual de triage Manchester, START y SHORT.'
  });

  var biochemistryTeacher = model.teachers && model.teachers['andrea-lopez'];
  if (biochemistryTeacher) {
    biochemistryTeacher.confidenceReason = 'Cinco clases orales completas, pizarras, actividades manuscritas y preguntas explícitas de la docente permiten reconocer un patrón repetido. La forma exacta del examen escrito todavía necesita más evaluaciones reales.';
    appendUnique(biochemistryTeacher.importanceSignals, 'Asigna un producto o paso para prepararlo en grupo y luego exige una explicación oral individual sin lectura.');
    appendUnique(biochemistryTeacher.observedQuestionFormats, 'Explicación oral individual después de una preparación grupal, sin teléfono ni apuntes durante la respuesta.');
    appendUnique(biochemistryTeacher.likelyExamTargets, 'Objetivo, regulación y balances de la vía de las pentosas según la demanda de NADPH o ribosa.');
    biochemistryTeacher.aiPrompt += ' Para la clase del 28 de agosto, pide además explicar de memoria un paso o producto después de una breve preparación, sin tratar esta dinámica oral como prueba de un formato escrito confirmado.';
  }

  var epidemiologyTeacher = model.teachers && model.teachers['andrea-isasi'];
  if (epidemiologyTeacher) {
    epidemiologyTeacher.confidenceReason = 'Seis bloques observados, casos clínicos, materiales de apoyo y una práctica individual confirmada repiten definiciones operativas, listas, redes y decisiones de clasificación. El formato exacto del examen teórico todavía debe confirmarse con una evaluación real.';
    appendUnique(epidemiologyTeacher.importanceSignals, 'Pide aplicar un algoritmo de clasificación completo y justificar la prioridad con los datos disponibles.');
    appendUnique(epidemiologyTeacher.observedQuestionFormats, 'Ficha clínica individual en papel para aplicar Manchester, START o SHORT sin dispositivos electrónicos.');
    appendUnique(epidemiologyTeacher.likelyExamTargets, 'Aplicación y diferencias operativas de Manchester, START y SHORT.');
    appendUnique(epidemiologyTeacher.likelyExamTargets, 'RIISS, microredes y cuatro niveles de atención con referencia y contrarreferencia.');
    epidemiologyTeacher.aiPrompt += ' Para la práctica confirmada, alterna Manchester, START y SHORT en fichas individuales y exige justificar la clasificación sin convertirla en diagnóstico.';
  }

  model.version = 'v500';
  model.updatedAt = '2026-08-28';
})();
