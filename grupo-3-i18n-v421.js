(function(){
  'use strict';

  var supported = ['es','br'];
  var localeByLang = {es:'es-PY',br:'pt-BR'};
  var htmlLangByLang = {es:'es',br:'pt-BR'};

  var messages = {
    es:{
      updated:'Actualizado {date} · {time} PY',
      updatedFallback:'Actualizado 14 ago. · 22:38 PY',
      scheduleWeek:'Semana del {start} al {end}',
      noNextDate:'Sin próxima fecha disponible',
      estimated:'estimada',
      toConfirm:'por confirmar',
      selectGroup:'Selecciona tu subgrupo',
      savedGroup:'Subgrupo guardado solo en este dispositivo.',
      selectedLesson:'SELECCIONADA',
      openLesson:'ABRIR CLASE',
      openDetail:'Abrir desarrollo completo',
      closeDetail:'Cerrar desarrollo completo',
      signedCount:'{signed}/{total} copias firmadas',
      signed:'Copia firmada',
      unsigned:'Firma sin marcar',
      groupSaved:'Grupo {group} guardado en este dispositivo.',
      questionMessage:'Materia: {subject}\nDuda para transmitir: {question}',
      copied:'Mensaje copiado. Ya puedes compartirlo.',
      copyFailed:'No se pudo copiar automáticamente.',
      practiceCourse:'ENTRENAMIENTO DEL CURSO',
      practiceLesson:'ENTRENAMIENTO · {date}',
      practiceTitle:'Entrenamiento · {title}',
      qcm:'QCM',
      vf:'Verdadero / Falso',
      cases:'Casos clínicos',
      startPractice:'Comenzar entrenamiento',
      closePractice:'Cerrar entrenamiento',
      resetCourse:'Reiniciar curso',
      questionsDone:'{done}/{total} preguntas completadas',
      questionsTotal:'{total} preguntas para dominar este curso',
      correctAnswer:'Respuesta correcta',
      incorrectAnswer:'Respuesta a corregir',
      yourAnswer:'Tu respuesta: {answer}.',
      correctAnswerLabel:'Respuesta correcta: ',
      activeUnderstanding:'COMPRENSIÓN ACTIVA',
      clinicalApplication:'APLICACIÓN CLÍNICA',
      caseLabel:'CASO',
      answerOptions:'Opciones de respuesta',
      validateAnswer:'Validar mi respuesta',
      nextQuestion:'Pregunta siguiente →',
      blockDone:'{type} · BLOQUE TERMINADO',
      correctCount:'{score}/{total} respuestas correctas',
      goodResult:'Buen dominio. Revisa solo las explicaciones de tus errores.',
      repeatResult:'Repite el bloque después de revisar la ficha y la clase completa.',
      chooseFormat:'Elegir otro formato',
      hideFormats:'Ocultar formatos',
      repeatType:'Repetir {type}',
      finished:'terminado',
      continue:'continuar',
      resetConfirm:'¿Reiniciar todo el progreso de este curso?',
      verificationBase:'BASE DE VERIFICACIÓN',
      trainingType:'Tipo de entrenamiento'
    },
    br:{
      updated:'Atualizado em {date} · {time} PY',
      updatedFallback:'Atualizado em 14 ago. · 22:38 PY',
      scheduleWeek:'Semana de {start} a {end}',
      noNextDate:'Nenhuma próxima data disponível',
      estimated:'estimada',
      toConfirm:'a confirmar',
      selectGroup:'Selecione seu subgrupo',
      savedGroup:'Subgrupo salvo apenas neste dispositivo.',
      selectedLesson:'SELECIONADA',
      openLesson:'ABRIR AULA',
      openDetail:'Abrir conteúdo completo',
      closeDetail:'Fechar conteúdo completo',
      signedCount:'{signed}/{total} cópias assinadas',
      signed:'Cópia assinada',
      unsigned:'Assinatura não marcada',
      groupSaved:'Grupo {group} salvo neste dispositivo.',
      questionMessage:'Matéria: {subject}\nDúvida para encaminhar: {question}',
      copied:'Mensagem copiada. Você já pode compartilhá-la.',
      copyFailed:'Não foi possível copiar automaticamente.',
      practiceCourse:'TREINO DO CURSO',
      practiceLesson:'TREINO · {date}',
      practiceTitle:'Treino · {title}',
      qcm:'QCM',
      vf:'Verdadeiro / Falso',
      cases:'Casos clínicos',
      startPractice:'Começar treino',
      closePractice:'Fechar treino',
      resetCourse:'Reiniciar curso',
      questionsDone:'{done}/{total} perguntas concluídas',
      questionsTotal:'{total} perguntas para dominar este curso',
      correctAnswer:'Resposta correta',
      incorrectAnswer:'Resposta a corrigir',
      yourAnswer:'Sua resposta: {answer}.',
      correctAnswerLabel:'Resposta correta: ',
      activeUnderstanding:'COMPREENSÃO ATIVA',
      clinicalApplication:'APLICAÇÃO CLÍNICA',
      caseLabel:'CASO',
      answerOptions:'Alternativas de resposta',
      validateAnswer:'Validar minha resposta',
      nextQuestion:'Próxima pergunta →',
      blockDone:'{type} · BLOCO CONCLUÍDO',
      correctCount:'{score}/{total} respostas corretas',
      goodResult:'Bom domínio. Revise apenas as explicações dos seus erros.',
      repeatResult:'Repita o bloco depois de revisar a ficha e a aula completa.',
      chooseFormat:'Escolher outro formato',
      hideFormats:'Ocultar formatos',
      repeatType:'Repetir {type}',
      finished:'concluído',
      continue:'continuar',
      resetConfirm:'Reiniciar todo o progresso deste curso?',
      verificationBase:'BASE DE VERIFICAÇÃO',
      trainingType:'Tipo de treino'
    }
  };

  var ptByEs = {
    'Ir al contenido':'Ir para o conteúdo',
    'Espacio de clase':'Espaço da turma',
    'Semestre 4':'4.º semestre',
    'Volver':'Voltar',
    'Inicio':'Início',
    'Ahora':'Agora',
    'Horario':'Horário',
    'Semana':'Semana',
    'Tareas':'Tarefas',
    'Actuales + archivo':'Atuais + arquivo',
    'Cursos':'Cursos',
    '6 materias':'6 matérias',
    'Plan':'Plano',
    'Seminario':'Seminário',
    'Dudas':'Dúvidas',
    'Mensaje':'Mensagem',
    'Espacio activo':'Espaço ativo',
    '4.º E · Semestre 4':'4.º E · 4.º semestre',
    'Panel de estudio':'Painel de estudos',
    'Tu semana, de un vistazo.':'Sua semana em um relance.',
    'Primero el horario y lo urgente. Después, abre solo la materia o el contenido que necesitas.':'Primeiro, veja o horário e o que é urgente. Depois, abra apenas a matéria ou o conteúdo de que precisa.',
    'PRÓXIMA CLASE':'PRÓXIMA AULA',
    'Hora de Paraguay':'Horário do Paraguai',
    'Calculando…':'Calculando…',
    'Horario de Paraguay':'Horário do Paraguai',
    'Abrir el horario completo':'Abrir o horário completo',
    'EN PORTADA':'EM DESTAQUE',
    '3 prioridades':'3 prioridades',
    'Dos actividades confirmadas y un repaso recomendado.':'Duas atividades confirmadas e uma revisão recomendada.',
    'ÚLTIMA CLASE':'ÚLTIMA AULA',
    'Nutrición':'Nutrição',
    'Leyes de la alimentación · 13 ago. estimado':'Leis da alimentação · 13 ago. estimado',
    'Abrir Tareas y el historial':'Abrir Tarefas e histórico',
    'MICROBIOLOGÍA II · TEÓRICA':'MICROBIOLOGIA II · TEÓRICA',
    'Fecha estimada':'Data estimada',
    'Preparar tres micosis subcutáneas':'Preparar três micoses subcutâneas',
    'Esporotricosis, cromoblastomicosis y micetoma eumicótico.':'Esporotricose, cromoblastomicose e micetoma eumicótico.',
    'Abrir Tareas →':'Abrir Tarefas →',
    'NUTRICIÓN · SEMINARIO':'NUTRIÇÃO · SEMINÁRIO',
    'Guías + regiones y platos':'Guias + regiões e pratos',
    '2 presentaciones PowerPoint independientes + 1 informe para firma y sello.':'2 apresentações PowerPoint independentes + 1 relatório para assinatura e carimbo.',
    'Ver mi grupo y los entregables →':'Ver meu grupo e as entregas →',
    'BIOQUÍMICA II':'BIOQUÍMICA II',
    'Completar la regulación de la glucólisis':'Completar a regulação da glicólise',
    'Hexoquinasa, glucoquinasa, PFK-1, piruvato quinasa y destinos del piruvato.':'Hexoquinase, glicoquinase, PFK-1, piruvato quinase e destinos do piruvato.',
    'Agenda oficial':'Agenda oficial',
    'Horario del 4.º E':'Horário do 4.º E',
    'LECTURA RÁPIDA':'LEITURA RÁPIDA',
    'Cuatro días presenciales':'Quatro dias presenciais',
    'Lunes, miércoles, jueves y viernes. El bloque azul marca el día de la próxima clase calculada.':'Segunda, quarta, quinta e sexta-feira. O bloco azul marca o dia da próxima aula calculada.',
    'Ver tareas de la semana →':'Ver tarefas da semana →',
    'PREFERENCIA PERSONAL':'PREFERÊNCIA PESSOAL',
    'Mi laboratorio':'Meu laboratório',
    'Mi subgrupo de Microbiología II · Práctica':'Meu subgrupo de Microbiologia II · Prática',
    'Seleccionar subgrupo':'Selecionar subgrupo',
    'Grupo 1 · jueves 14:00–16:00':'Grupo 1 · quinta-feira 14:00–16:00',
    'Grupo 2 · jueves 16:00–18:00':'Grupo 2 · quinta-feira 16:00–18:00',
    'Grupo 3 · jueves 18:00–20:00':'Grupo 3 · quinta-feira 18:00–20:00',
    'Se guarda solo en este dispositivo; no cambia el horario de la clase.':'Fica salvo apenas neste dispositivo; não altera o horário da aula.',
    'Próximo laboratorio':'Próxima prática',
    'Selecciona tu subgrupo':'Selecione seu subgrupo',
    'LUN':'SEG',
    'Lunes':'Segunda-feira',
    'MIÉ':'QUA',
    'Miércoles':'Quarta-feira',
    'JUE':'QUI',
    'Jueves':'Quinta-feira',
    'VIE':'SEX',
    'Viernes':'Sexta-feira',
    'Fisiología II':'Fisiologia II',
    'Microbiología II':'Microbiologia II',
    'Microbiología II · Teórica':'Microbiologia II · Teórica',
    'Microbiología II · Práctica':'Microbiologia II · Prática',
    'TEÓRICA':'TEÓRICA',
    'PRÁCTICA':'PRÁTICA',
    'Tarea':'Tarefa',
    'Preparación':'Preparação',
    'Lectura':'Leitura',
    'Muestra':'Amostra',
    'Bioética · plataforma':'Bioética · plataforma',
    'Epidemiología y Salud Pública':'Epidemiologia e Saúde Pública',
    'Martes y sábado no presentan clases en el horario recibido. Cualquier modificación oficial debe prevalecer sobre esta vista.':'Terça-feira e sábado não têm aulas no horário recebido. Qualquer alteração oficial prevalece sobre esta visualização.',
    'Por hacer + archivo':'A fazer + arquivo',
    'Tareas de la clase':'Tarefas da turma',
    'Primero aparecen las actividades actuales. Debajo queda el historial por materia para recuperar las consignas y contar tus copias firmadas.':'Primeiro aparecem as atividades atuais. Abaixo fica o histórico por matéria para recuperar as instruções e contar suas cópias assinadas.',
    'Confirmada':'Confirmada',
    'Estimada':'Estimada',
    'Verificar':'Verificar',
    'POR HACER':'A FAZER',
    'Actividades y preparaciones actuales':'Atividades e preparações atuais',
    'ACTIVIDAD CONFIRMADA':'ATIVIDADE CONFIRMADA',
    'Seminario y presentación oral':'Seminário e apresentação oral',
    'SEMANA 3':'SEMANA 3',
    'Cada grupo debe preparar dos trabajos independientes y un informe breve. Selecciona tu grupo para ver los dos títulos exactos.':'Cada grupo deve preparar dois trabalhos independentes e um relatório breve. Selecione seu grupo para ver os dois títulos exatos.',
    'presentaciones PowerPoint separadas':'apresentações PowerPoint separadas',
    'diapositivas como máximo por presentación':'slides no máximo por apresentação',
    'informe para firma y sello':'relatório para assinatura e carimbo',
    'MI GRUPO':'MEU GRUPO',
    '¿Qué temas me corresponden?':'Quais temas são do meu grupo?',
    'Seleccionar grupo':'Selecionar grupo',
    'Selecciona del Grupo 1 al Grupo 6 para mostrar tus dos temas.':'Selecione do Grupo 1 ao Grupo 6 para mostrar seus dois temas.',
    'Próxima clase estimada':'Próxima aula estimada',
    'Próxima clase de Nutrición':'Próxima aula de Nutrição',
    'Ver la consigna completa':'Ver as instruções completas',
    'Los 3 entregables, el informe y la organización':'As 3 entregas, o relatório e a organização',
    'Trabajo 1 · Guías Alimentarias':'Trabalho 1 · Guias Alimentares',
    'Presentación PowerPoint independiente de hasta 4 diapositivas.':'Apresentação PowerPoint independente com até 4 slides.',
    'Trabajo 2 · Platos típicos / regiones':'Trabalho 2 · Pratos típicos / regiões',
    'Otra presentación PowerPoint independiente de hasta 4 diapositivas.':'Outra apresentação PowerPoint independente com até 4 slides.',
    'Informe breve':'Relatório breve',
    'Portada, integrantes, ambos desarrollos y bibliografía; llevar para firma y sello.':'Capa, integrantes, desenvolvimento dos dois trabalhos e bibliografia; levar para assinatura e carimbo.',
    'Exposición:':'Apresentação:',
    'aproximadamente hasta 5 minutos por grupo. La comida es opcional y puede reemplazarse por imágenes claras.':'aproximadamente até 5 minutos por grupo. Levar comida é opcional e pode ser substituído por imagens claras.',
    'Ver instructivo y descargar':'Ver instruções e baixar',
    'Ver modelo de portada':'Ver modelo de capa',
    'La actividad está confirmada. La fecha del jueves 20 se calcula con el horario habitual y permanece por confirmar.':'A atividade está confirmada. A data de quinta-feira, dia 20, foi calculada pelo horário habitual e ainda deve ser confirmada.',
    'Marcar las 2 presentaciones y el informe como preparados':'Marcar as 2 apresentações e o relatório como preparados',
    'Microbiología II · Teórica':'Microbiologia II · Teórica',
    'Preparar tiñas y tres micosis subcutáneas':'Preparar tineas e três micoses subcutâneas',
    'Repasar las tiñas y estudiar esporotricosis linfocutánea, cromoblastomicosis y micetoma eumicótico para iniciar la próxima clase con casos clínicos.':'Revisar as tineas e estudar esporotricose linfocutânea, cromoblastomicose e micetoma eumicótico para iniciar a próxima aula com casos clínicos.',
    'Próxima clase de Microbiología II':'Próxima aula de Microbiologia II',
    'La consigna fue explícita. La fecha no fue pronunciada y se calcula con el horario habitual del lunes; debe confirmarse.':'A orientação foi explícita. A data não foi informada e foi calculada pelo horário habitual de segunda-feira; deve ser confirmada.',
    'Marcar preparación como realizada':'Marcar preparação como concluída',
    'Microbiología II · Práctica · Grupo 3':'Microbiologia II · Prática · Grupo 3',
    'Llevar una muestra de alimento con moho':'Levar uma amostra de alimento com mofo',
    'Preferir pan duro con crecimiento visible. También se mencionaron naranja sólida, tomate, banana o queso; evitar muestras totalmente líquidas.':'Preferir pão duro com crescimento visível. Também foram mencionados laranja firme, tomate, banana ou queijo; evitar amostras totalmente líquidas.',
    'Próxima práctica estimada':'Próxima prática estimada',
    'Próximo laboratorio del Grupo 3':'Próxima prática do Grupo 3',
    'La consigna fue explícita, pero la fecha no se pronunció. Llevar la muestra cerrada y no abrirla ni olerla fuera del laboratorio.':'A orientação foi explícita, mas a data não foi informada. Levar a amostra fechada e não abrir nem cheirar fora do laboratório.',
    'Marcar muestra como preparada':'Marcar amostra como preparada',
    'Completar la regulación de la glucólisis':'Completar a regulação da glicólise',
    'Comparar hexoquinasa y glucoquinasa; revisar PFK-1, piruvato quinasa y los destinos del piruvato.':'Comparar hexoquinase e glicoquinase; revisar PFK-1, piruvato quinase e os destinos do piruvato.',
    'Fecha propuesta':'Data proposta',
    'Próxima clase de Bioquímica':'Próxima aula de Bioquímica',
    'Marcar preparación como realizada':'Marcar preparação como concluída',
    'Leer el triage por colores':'Ler a triagem por cores',
    'Preparar amarillo, naranja, verde y azul: prioridad, tiempo máximo y motivos de consulta que requieren atención rápida.':'Preparar amarelo, laranja, verde e azul: prioridade, tempo máximo e motivos de consulta que exigem atendimento rápido.',
    'Próxima sesión propuesta':'Próxima aula proposta',
    'Próxima clase de Epidemiología':'Próxima aula de Epidemiologia',
    'Marcar lectura como realizada':'Marcar leitura como concluída',
    'Cómo se calcula una fecha':'Como uma data é calculada',
    'Toda fecha calculada permanece como':'Toda data calculada permanece como',
    'estimada':'estimada',
    'hasta su confirmación.':'até ser confirmada.',
    'HISTORIAL POR MATERIA':'HISTÓRICO POR MATÉRIA',
    'Actividades ya realizadas':'Atividades já realizadas',
    'Las consignas quedan guardadas aunque ya no estén pendientes. Marca solo tus propias hojas firmadas; el dato permanece en este dispositivo.':'As instruções ficam salvas mesmo quando não estão mais pendentes. Marque apenas suas próprias folhas assinadas; o dado fica neste dispositivo.',
    'Actividades de la materia':'Atividades da matéria',
    '0 actividades':'0 atividades',
    'Aún no hay actividades realizadas registradas.':'Ainda não há atividades concluídas registradas.',
    '1 actividad guardada':'1 atividade salva',
    'Abre la materia y después la actividad que necesites.':'Abra a matéria e depois a atividade de que precisa.',
    '1 actividad':'1 atividade',
    'ACTIVIDAD 1 · REALIZADA EN CLASE':'ATIVIDADE 1 · REALIZADA EM AULA',
    'REALIZADA EN CLASE':'REALIZADA EM AULA',
    'Firma sin marcar':'Assinatura não marcada',
    'Mi copia está firmada por la docente':'Minha cópia está assinada pela professora',
    'Marca únicamente tu hoja personal. Se guarda solo en este dispositivo.':'Marque apenas sua folha pessoal. Fica salvo somente neste dispositivo.',
    'MICROBIOLOGÍA II · PRÁCTICA':'MICROBIOLOGIA II · PRÁTICA',
    'Biblioteca del 4.º E':'Biblioteca do 4.º E',
    'Elige una materia':'Escolha uma matéria',
    'Se muestra un solo curso a la vez. Dentro de cada materia puedes elegir una ficha rápida o abrir la clase completa.':'Apenas um curso é exibido por vez. Em cada matéria, você pode escolher uma ficha rápida ou abrir a aula completa.',
    'Leyes de la alimentación':'Leis da alimentação',
    'Cantidad, calidad, armonía, adecuación, variedad y aplicación clínica.':'Quantidade, qualidade, harmonia, adequação, variedade e aplicação clínica.',
    'Control respiratorio':'Controle respiratório',
    'Control nervioso y químico de la respiración':'Controle nervoso e químico da respiração',
    'Difusión y transporte de gases':'Difusão e transporte de gases',
    'Fisiología II · clase del 13 de agosto':'Fisiologia II · aula de 13 de agosto',
    'Fisiología II · clase del 10 de agosto':'Fisiologia II · aula de 10 de agosto',
    'Sesión del jueves 13 de agosto de 2026: centros respiratorios, sensores, respuesta ventilatoria y aplicación clínica.':'Aula de quinta-feira, 13 de agosto de 2026: centros respiratórios, sensores, resposta ventilatória e aplicação clínica.',
    'Sesión estimada del lunes 10 de agosto de 2026: barrera alveolocapilar, relación V/Q y transporte sanguíneo de O₂ y CO₂.':'Aula estimada de segunda-feira, 10 de agosto de 2026: barreira alvéolo-capilar, relação V/Q e transporte sanguíneo de O₂ e CO₂.',
    'Fecha oral interpretada · 13 ago.':'Data oral interpretada · 13 ago.',
    'Fecha estimada · 10 ago. · confirmar':'Data estimada · 10 ago. · confirmar',
    'Glucólisis':'Glicólise',
    'Epidemiología':'Epidemiologia',
    'APS, sectorización y triage':'APS, setorização e triagem',
    'Atención primaria, integralidad, familia, territorio y prioridad asistencial.':'Atenção primária, integralidade, família, território e prioridade assistencial.',
    'Dermatofitosis y tiñas':'Dermatofitoses e tineas',
    'Agentes, transmisión, localización, diagnóstico y razonamiento terapéutico.':'Agentes, transmissão, localização, diagnóstico e raciocínio terapêutico.',
    'Hongos y agar Sabouraud':'Fungos e ágar Sabouraud',
    'Muestra, morfología fúngica, cultivo y bioseguridad de laboratorio.':'Amostra, morfologia fúngica, cultura e biossegurança laboratorial.',
    'Centros respiratorios, sensores, transporte de gases y aplicación clínica.':'Centros respiratórios, sensores, transporte de gases e aplicação clínica.',
    'Glucólisis y regulación':'Glicólise e regulação',
    'Diez reacciones, balance energético, control y conexión con GLUT4.':'Dez reações, balanço energético, controle e conexão com GLUT4.',
    'Solo la clase del 10 de agosto: Fick, barrera, V/Q, O₂, CO₂, Bohr y Haldane.':'Somente a aula de 10 de agosto: Fick, barreira, V/Q, O₂, CO₂, Bohr e Haldane.',
    'DRIVE COMPARTIDO DEL 4.º E':'DRIVE COMPARTILHADO DO 4.º E',
    'PDF y PowerPoint del semestre':'PDFs e PowerPoints do semestre',
    'Los archivos se actualizan directamente en Drive, sin volver a cargarlos en este sitio.':'Os arquivos são atualizados diretamente no Drive, sem precisar enviá-los novamente para este site.',
    'Abrir Drive':'Abrir Drive',
    'Nueva pestaña ↗':'Nova aba ↗',
    'CLASE COMPLETA':'AULA COMPLETA',
    'Abrir desarrollo completo':'Abrir conteúdo completo',
    'Cerrar desarrollo completo':'Fechar conteúdo completo',
    'ACTUAL':'ATUAL',
    'FECHA ESTIMADA':'DATA ESTIMADA',
    'FECHA NO DICHA':'DATA NÃO INFORMADA',
    'HISTORIAL DE TAREAS':'HISTÓRICO DE TAREFAS',
    'Ver actividad →':'Ver atividade →',
    'IDEA CENTRAL':'IDEIA CENTRAL',
    'REPASO VISUAL':'REVISÃO VISUAL',
    'CORRECCIONES IMPORTANTES':'CORREÇÕES IMPORTANTES',
    'VERIFICACIÓN':'VERIFICAÇÃO',
    'Ficha rápida':'Ficha rápida',
    'Repaso oral':'Revisão oral',
    'Responder como en clase':'Responder como em aula',
    'PLAN DEL SEMINARIO':'PLANO DO SEMINÁRIO',
    'Plan del seminario':'Plano do seminário',
    'GRUPO Y TEMAS':'GRUPO E TEMAS',
    'Ver el nombre exacto de los dos trabajos':'Ver o nome exato dos dois trabalhos',
    'La selección queda sincronizada con Tareas y con el curso de Nutrición en este dispositivo.':'A seleção fica sincronizada com Tarefas e com o curso de Nutrição neste dispositivo.',
    'GRUPO DE NUTRICIÓN':'GRUPO DE NUTRIÇÃO',
    'Selecciona del Grupo 1 al Grupo 6':'Selecione do Grupo 1 ao Grupo 6',
    '2 presentaciones + 1 informe':'2 apresentações + 1 relatório',
    'PowerPoint · Trabajo 1':'PowerPoint · Trabalho 1',
    'Guías Alimentarias · hasta 4 diapositivas.':'Guias Alimentares · até 4 slides.',
    'PowerPoint · Trabajo 2':'PowerPoint · Trabalho 2',
    'Platos típicos / regiones · hasta 4 diapositivas.':'Pratos típicos / regiões · até 4 slides.',
    'Portada, 2 desarrollos, bibliografía, firma y sello.':'Capa, 2 desenvolvimentos, bibliografia, assinatura e carimbo.',
    'Grupo y temas confirmados':'Grupo e temas confirmados',
    'Desarrollar el Trabajo 1':'Desenvolver o Trabalho 1',
    'Desarrollar el Trabajo 2':'Desenvolver o Trabalho 2',
    'Crear las 2 presentaciones':'Criar as 2 apresentações',
    'Completar el informe':'Concluir o relatório',
    'Ensayar y revisar la entrega':'Ensaiar e revisar a entrega',
    'ARCHIVOS LISTOS':'ARQUIVOS PRONTOS',
    'Descarga la base oficial antes de empezar':'Baixe a base oficial antes de começar',
    'Ver instructivo':'Ver instruções',
    'Ver portada':'Ver capa',
    'Abrir Drive ↗':'Abrir Drive ↗',
    'Canal de la clase':'Canal da turma',
    '¿Qué debemos preguntar o aclarar?':'O que devemos perguntar ou esclarecer?',
    'Prepara una duda clara para que pueda ser reunida con las demás y transmitida de forma organizada.':'Prepare uma dúvida clara para que possa ser reunida com as demais e encaminhada de forma organizada.',
    'No compartas información clínica identificable.':'Não compartilhe informações clínicas identificáveis.',
    'Indica materia y tema.':'Informe a matéria e o tema.',
    'Formula una sola duda por mensaje.':'Envie apenas uma dúvida por mensagem.',
    'Materia':'Matéria',
    'Otra materia':'Outra matéria',
    'Tu duda':'Sua dúvida',
    'Copiar mensaje preparado':'Copiar mensagem preparada',
    'El mensaje se copia en tu dispositivo; no se envía automáticamente.':'A mensagem é copiada no seu dispositivo; ela não é enviada automaticamente.',
    'Apoyo académico no oficial · 4.º E':'Apoio acadêmico não oficial · 4.º E',
    'Aviso legal':'Aviso legal',
    'EXPLICACIÓN':'EXPLICAÇÃO',
    'Respuesta':'Resposta',
    'Cerrar respuesta':'Fechar resposta',
    'Verdadero':'Verdadeiro',
    'Falso':'Falso',
    'Verdadero / Falso':'Verdadeiro / Falso',
    'Casos clínicos':'Casos clínicos',
    'ENTRENAMIENTO DEL CURSO':'TREINO DO CURSO',
    'Comenzar entrenamiento':'Começar treino',
    'Cerrar entrenamiento':'Fechar treino',
    'Reiniciar curso':'Reiniciar curso',
    'BASE DE VERIFICACIÓN':'BASE DE VERIFICAÇÃO',
    'Respuesta correcta':'Resposta correta',
    'Respuesta a corregir':'Resposta a corrigir',
    'Validar mi respuesta':'Validar minha resposta',
    'Pregunta siguiente →':'Próxima pergunta →',
    'Elegir otro formato':'Escolher outro formato',
    'Ocultar formatos':'Ocultar formatos'
  };

  var attributeTranslations = {
    'Idioma del espacio de clase':'Idioma do espaço da turma',
    'Secciones del espacio de clase':'Seções do espaço da turma',
    'Resumen de la semana':'Resumo da semana',
    'Prioridades actuales':'Prioridades atuais',
    'Horario semanal':'Horário semanal',
    'Estados de las fechas':'Status das datas',
    'Actividades organizadas por materia':'Atividades organizadas por matéria',
    'Materias disponibles':'Matérias disponíveis',
    'Navegación de clase':'Navegação da turma',
    'Cerrar respuesta':'Fechar resposta',
    'Opciones de respuesta':'Alternativas de resposta',
    'Tipo de entrenamiento':'Tipo de treino',
    'Ej.: ¿La glucólisis necesita oxígeno directamente?':'Ex.: a glicólise precisa diretamente de oxigênio?'
  };

  function readLang(){
    try{
      var saved = localStorage.getItem('medLang');
      return supported.indexOf(saved) !== -1 ? saved : 'es';
    }catch(error){return 'es';}
  }

  function interpolate(value,variables){
    return String(value || '').replace(/\{([^}]+)\}/g,function(match,key){
      return variables && Object.prototype.hasOwnProperty.call(variables,key) ? variables[key] : match;
    });
  }

  function t(key,variables){
    var lang = readLang();
    var value = (messages[lang] && messages[lang][key]) || messages.es[key] || key;
    return interpolate(value,variables);
  }

  function translateTextNode(node){
    if(readLang() !== 'br') return;
    var raw = node.nodeValue;
    var trimmed = raw && raw.trim();
    if(!trimmed || !Object.prototype.hasOwnProperty.call(ptByEs,trimmed)) return;
    var start = raw.indexOf(trimmed);
    node.nodeValue = raw.slice(0,start) + ptByEs[trimmed] + raw.slice(start + trimmed.length);
  }

  function translateAttributes(element){
    if(readLang() !== 'br' || !element || element.nodeType !== 1) return;
    ['aria-label','title','placeholder','alt'].forEach(function(name){
      var value = element.getAttribute(name);
      if(value && attributeTranslations[value]) element.setAttribute(name,attributeTranslations[value]);
    });
  }

  function refresh(root){
    var scope = root || document.body;
    if(!scope) return;
    translateAttributes(scope);
    scope.querySelectorAll('*').forEach(translateAttributes);
    var walker = document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var parent = node.parentElement;
      if(!parent || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
  }

  function configureDocument(){
    var lang = readLang();
    document.documentElement.lang = htmlLangByLang[lang];
    if(document.body) document.body.dataset.lang = lang;
    var select = document.getElementById('classLanguageSelect');
    if(select){
      select.value = lang;
      select.addEventListener('change',function(){
        var next = supported.indexOf(select.value) !== -1 ? select.value : 'es';
        try{localStorage.setItem('medLang',next);}catch(error){}
        window.location.reload();
      });
    }
    if(lang === 'br'){
      document.title = '4.º E · 4.º semestre | Med Nykuto';
      var description = document.querySelector('meta[name="description"]');
      if(description) description.content = 'Espaço acadêmico não oficial do 4.º E: horário, tarefas, histórico de atividades e revisões organizadas em um só lugar.';
    }
    refresh(document.body);
  }

  window.MedNykutoClassI18n = {
    getLang:readLang,
    getLocale:function(){return localeByLang[readLang()] || localeByLang.es;},
    t:t,
    refresh:refresh,
    exact:ptByEs
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',configureDocument,{once:true});
  else configureDocument();
})();
