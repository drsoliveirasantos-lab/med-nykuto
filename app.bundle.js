/* v281 Cloudflare full split: data moved out of app.bundle.js to keep every file under 25 MiB. */
/* v281: MED_COURSES_DATA moved to data/med-courses-data.js */

/* v281: MED_PRACTICE_BANK moved to split data/practice-bank-*.js */

(function(){
  const DATA = window.MED_COURSES_DATA || {courses:[]};
  const courses = DATA.courses || [];
  const allModules = courses.flatMap(course => (course.modules || []).map(module => ({...module, courseId:course.id, courseTitle:course.title, courseFolder:course.folder})));
  const progressKey = 'med-cursos-progress-v37';
  const BANK = window.MED_PRACTICE_BANK || {byCourse:{}};
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  const UI = {
    es: {
      back:'← Volver', course:'Curso', qcm:'QCM', clinical:'Casos clínicos', vf:'Verdadero/Falso', subjects:'Materias', modules:'Módulos', all:'Todo',
      searchLabel:'Buscar', searchPlaceholder:'QRS, Na/K, osmolaridad...', noSearch:'Ningún resultado encontrado.', searchHint:'Escribe al menos 2 letras para buscar en todos los módulos.',
      dontKnow:'Ver respuesta', dontKnowChosen:'Elegiste: No sé', correctAnswer:'Respuesta correcta', previous:'← Pregunta anterior', next:'Siguiente pregunta →', balance:'Ver balance de la serie', reviewCourse:'Revisar el curso', restart:'Reiniciar sesión',
      global:'Global', series:'Serie', progress:'Avance', unknown:'No sé', review:'rev.', seriesBar:'Serie', successBar:'Acierto', finishSeries:'Fin de la serie', correct:'respuestas correctas', globalScore:'Score global actual', nextBatch:'Iniciar la siguiente serie', backModules:'Volver a módulos', sessionDone:'Sesión terminada',
      true:'Verdadero', false:'Falso', trueFalseQuestion:'¿Verdadero o falso?', noContent:'No hay preguntas disponibles para esta selección.'
    },
    fr: {
      back:'← Retour', course:'Cours', qcm:'QCM', clinical:'Cas clinique', vf:'Vrai/Faux', subjects:'Matières', modules:'Modules', all:'Tout',
      searchLabel:'Rechercher', searchPlaceholder:'QRS, Na/K, osmolarité...', noSearch:'Aucun résultat trouvé.', searchHint:'Écris au moins 2 lettres pour chercher dans tous les modules.',
      dontKnow:'Ver respuesta', dontKnowChosen:'Tu as choisi : Je ne sais pas', correctAnswer:'Réponse correcte', previous:'← Question précédente', next:'Question suivante →', balance:'Voir le bilan de la série', reviewCourse:'Revoir le cours', restart:'Recommencer la session',
      global:'Global', series:'Série', progress:'Avancement', unknown:'Je ne sais pas', review:'rév.', seriesBar:'Série', successBar:'Réussite', finishSeries:'Fin de la série', correct:'réponses correctes', globalScore:'Score global actuel', nextBatch:'Démarrer la série suivante', backModules:'Retour aux modules', sessionDone:'Session terminée',
      true:'Vrai', false:'Faux', trueFalseQuestion:'Vrai ou faux ?', noContent:'Aucune question disponible pour cette sélection.'
    },
    br: {
      back:'← Voltar', course:'Curso', qcm:'QCM', clinical:'Casos clínicos', vf:'Verdadeiro/Falso', subjects:'Matérias', modules:'Módulos', all:'Tudo',
      searchLabel:'Pesquisar', searchPlaceholder:'QRS, Na/K, osmolaridade...', noSearch:'Nenhum resultado encontrado.', searchHint:'Digite pelo menos 2 letras para pesquisar em todos os módulos.',
      dontKnow:'Ver respuesta', dontKnowChosen:'Você escolheu: Não sei', correctAnswer:'Resposta correta', previous:'← Pergunta anterior', next:'Próxima pergunta →', balance:'Ver balanço da série', reviewCourse:'Revisar o curso', restart:'Reiniciar sessão',
      global:'Global', series:'Série', progress:'Avanço', unknown:'Não sei', review:'rev.', seriesBar:'Série', successBar:'Acerto', finishSeries:'Fim da série', correct:'respostas corretas', globalScore:'Pontuação global atual', nextBatch:'Iniciar próxima série', backModules:'Voltar aos módulos', sessionDone:'Sessão finalizada',
      true:'Verdadeiro', false:'Falso', trueFalseQuestion:'Verdadeiro ou falso?', noContent:'Não há perguntas disponíveis para esta seleção.'
    }
  };
  Object.assign(UI.es, {
    brandSubtitle:'Biblioteca médica organizada', navSubjects:'Materias', navModules:'Módulos', navQcm:'QCM', navClinical:'Casos clínicos',
    homeEyebrow:'Medicina · revisión estructurada', homeTitle:'Una plataforma limpia para estudiar tus cursos de medicina.', homeText:'Accede a materias, módulos, QCM, casos clínicos, verdadero/falso y búsqueda global desde una interfaz simple.', exploreSubjects:'Explorar materias', openModules:'Ver todos los módulos',
    statSubjects:'Materias', statModules:'Módulos integrados', statProgress:'Progreso total', homeOverviewEyebrow:'Avance', homeOverviewTitle:'Materias presentes', resetProgress:'Reiniciar progreso', footerText:'Biblioteca médica organizada para revisar más rápido.',
    backHome:'← Volver al inicio', subjectsEyebrow:'Organización', subjectsTitle:'Materias disponibles', subjectsText:'Cada materia abre una página dedicada con sus módulos, QCM, casos clínicos y verdadero/falso.',
    modulesEyebrow:'Búsqueda global', modulesTitle:'Todos los módulos', modulesText:'Busca una palabra clave y abre directamente el módulo correspondiente.', moduleListEyebrow:'Módulos integrados', moduleListTitle:'Lista de cursos', moduleSearchPlaceholder:'Buscar en los módulos...', noModuleFound:'No se encontró ningún módulo.',
    viewCourses:'Ver cursos', doQcm:'Hacer QCM', doClinical:'Hacer caso clínico', doVf:'Verdadero/Falso', openCourse:'Abrir curso', markSeen:'Marcar visto', removeSeen:'Quitar visto', seen:'Visto', coursePlan:'Plan del curso', planEmpty:'Plan detallado disponible en la página del curso.', titles:'títulos', allModules:'Todos los módulos', localProgress:'Progreso local', subjectProgress:'Progreso de la materia',
    searchResultIn:'Aparece en', searchOpenModule:'Abrir módulo', searchNoResult:'No hay resultado para esta palabra. Prueba otra forma: QRS, onda T, Na/K, osmolaridad.',
    searchLabel:'Buscar', searchPlaceholder:'QRS, Na/K, osmolaridad...', searchHint:'Escribe al menos 2 letras para buscar en todos los módulos.', noSearch:'Ningún resultado encontrado.'
  });
  Object.assign(UI.fr, {
    brandSubtitle:'Bibliothèque médicale organisée', navSubjects:'Matières', navModules:'Modules', navQcm:'QCM', navClinical:'Cas cliniques',
    homeEyebrow:'Médecine · révision structurée', homeTitle:'Une plateforme propre pour étudier tes cours de médecine.', homeText:'Accède aux matières, aux modules, aux QCM, aux cas cliniques, aux vrai/faux et à la recherche globale depuis une interface simple.', exploreSubjects:'Explorer les matières', openModules:'Voir tous les modules',
    statSubjects:'Matières', statModules:'Modules intégrés', statProgress:'Progression totale', homeOverviewEyebrow:'Avancement', homeOverviewTitle:'Matières présentes', resetProgress:'Réinitialiser la progression', footerText:'Bibliothèque médicale organisée pour réviser plus vite.',
    backHome:'← Retour à l’accueil', subjectsEyebrow:'Organisation', subjectsTitle:'Matières disponibles', subjectsText:'Chaque matière ouvre une page dédiée avec ses modules, QCM, cas cliniques et vrai/faux.',
    modulesEyebrow:'Recherche globale', modulesTitle:'Tous les modules', modulesText:'Recherche un mot-clé et ouvre directement le module correspondant.', moduleListEyebrow:'Modules intégrés', moduleListTitle:'Liste des cours', moduleSearchPlaceholder:'Rechercher dans les modules...', noModuleFound:'Aucun module trouvé.',
    viewCourses:'Voir les cours', doQcm:'Faire QCM', doClinical:'Faire cas clinique', doVf:'Vrai/Faux', openCourse:'Ouvrir le cours', markSeen:'Marquer vu', removeSeen:'Retirer vu', seen:'Vu', coursePlan:'Plan du cours', planEmpty:'Plan détaillé disponible dans la page du cours.', titles:'titres', allModules:'Tous les modules', localProgress:'Progression locale', subjectProgress:'Progression de la matière',
    searchResultIn:'Apparaît dans', searchOpenModule:'Ouvrir le module', searchNoResult:'Aucun résultat pour ce mot. Essaie une autre forme : QRS, onde T, Na/K, osmolarité.',
    searchLabel:'Rechercher', searchPlaceholder:'QRS, Na/K, osmolarité...', searchHint:'Écris au moins 2 lettres pour chercher dans tous les modules.', noSearch:'Aucun résultat trouvé.'
  });
  Object.assign(UI.br, {
    brandSubtitle:'Biblioteca médica organizada', navSubjects:'Matérias', navModules:'Módulos', navQcm:'QCM', navClinical:'Casos clínicos',
    homeEyebrow:'Medicina · revisão estruturada', homeTitle:'Uma plataforma limpa para estudar seus cursos de medicina.', homeText:'Acesse matérias, módulos, QCM, casos clínicos, verdadeiro/falso e busca global em uma interface simples.', exploreSubjects:'Explorar matérias', openModules:'Ver todos os módulos',
    statSubjects:'Matérias', statModules:'Módulos integrados', statProgress:'Progresso total', homeOverviewEyebrow:'Avanço', homeOverviewTitle:'Matérias presentes', resetProgress:'Reiniciar progresso', footerText:'Biblioteca médica organizada para revisar mais rápido.',
    backHome:'← Voltar ao início', subjectsEyebrow:'Organização', subjectsTitle:'Matérias disponíveis', subjectsText:'Cada matéria abre uma página dedicada com seus módulos, QCM, casos clínicos e verdadeiro/falso.',
    modulesEyebrow:'Busca global', modulesTitle:'Todos os módulos', modulesText:'Pesquise uma palavra-chave e abra diretamente o módulo correspondente.', moduleListEyebrow:'Módulos integrados', moduleListTitle:'Lista de cursos', moduleSearchPlaceholder:'Pesquisar nos módulos...', noModuleFound:'Nenhum módulo encontrado.',
    viewCourses:'Ver cursos', doQcm:'Fazer QCM', doClinical:'Fazer caso clínico', doVf:'Verdadeiro/Falso', openCourse:'Abrir curso', markSeen:'Marcar visto', removeSeen:'Remover visto', seen:'Visto', coursePlan:'Plano do curso', planEmpty:'Plano detalhado disponível na página do curso.', titles:'títulos', allModules:'Todos os módulos', localProgress:'Progresso local', subjectProgress:'Progresso da matéria',
    searchResultIn:'Aparece em', searchOpenModule:'Abrir módulo', searchNoResult:'Nenhum resultado para essa palavra. Tente outra forma: QRS, onda T, Na/K, osmolaridade.',
    searchLabel:'Pesquisar', searchPlaceholder:'QRS, Na/K, osmolaridade...', searchHint:'Digite pelo menos 2 letras para pesquisar em todos os módulos.', noSearch:'Nenhum resultado encontrado.'
  });

  Object.assign(UI.es, {
    donateEyebrow:'Proyecto gratuito · apoyo voluntario', donateTitle:'Apoya el proyecto', donateText:'El sitio seguirá siendo gratuito y abierto para todos. Una pequeña contribución ayuda a pagar el alojamiento, mejorar los cursos y mantener accesibles las herramientas de entrenamiento.', donateBubbleTitle:'Si Julius viera la factura del servidor, ya habría apagado el router.', donateBubbleText:'Con un Pix, los QCM siguen funcionando.', pixPayloadLabel:'Código Pix copia y pega', copyPix:'Copiar código Pix', scanPix:'Ver QR Pix', pixHint:'', copyPixAria:'Copiar el código Pix', pixCopied:'Código Pix copiado.', pixManualCopy:'Si la copia automática falla, intenta de nuevo o usa el QR.', pixIntegratedNote:'El código Pix está integrado en el botón de copia. No aparece el código largo en la página.'
  });
  Object.assign(UI.fr, {
    donateEyebrow:'Projet gratuit · soutien libre', donateTitle:'Soutenir le projet', donateText:'Le site restera gratuit et ouvert à tous. Une petite contribution aide à payer l’hébergement, améliorer les cours et garder les outils d’entraînement accessibles.', donateBubbleTitle:'Si Julius voyait la facture du serveur, il aurait déjà coupé le routeur.', donateBubbleText:'Un petit Pix et les QCM continuent de tourner.', pixPayloadLabel:'Code Pix à copier', copyPix:'Copier le code Pix', scanPix:'Voir le QR Pix', pixHint:'', copyPixAria:'Copier le code Pix', pixCopied:'Code Pix copié.', pixManualCopy:'Si la copie automatique échoue, réessaie ou utilise le QR.', pixIntegratedNote:'Le code Pix est intégré dans le bouton de copie. Le code long n’est pas affiché sur la page.'
  });
  Object.assign(UI.br, {
    donateEyebrow:'Projeto gratuito · apoio voluntário', donateTitle:'Apoie o projeto', donateText:'O site vai continuar gratuito e aberto para todos. Uma pequena contribuição ajuda a pagar a hospedagem, melhorar os cursos e manter as ferramentas de treino acessíveis.', donateBubbleTitle:'Se o Julius visse a conta do servidor, ele já teria desligado o roteador.', donateBubbleText:'Com um Pix, os QCM continuam rodando.', pixPayloadLabel:'Código Pix copia e cola', copyPix:'Copiar código Pix', scanPix:'Ver QR Pix', pixHint:'', copyPixAria:'Copiar o código Pix', pixCopied:'Código Pix copiado.', pixManualCopy:'Se a cópia automática falhar, tente novamente ou use o QR.', pixIntegratedNote:'O código Pix está integrado no botão de copiar. O código longo não aparece na página.'
  });

  Object.assign(UI.es, {
    startStudying:'Comenzar a revisar', statModulesShort:'módulos', clinicalCasesShort:'casos clínicos', vfShort:'verdadero/falso',
    stepOneTitle:'Elige una materia', stepOneText:'Abre Fisiología, Bioquímica, Microbiología, Genética o Inmunología.',
    stepTwoTitle:'Lee el curso o la ficha', stepTwoText:'Pasa del curso completo a la ficha rápida o al ultra-resumen.',
    stepThreeTitle:'Entrena de forma activa', stepThreeText:'Haz QCM, casos clínicos y verdadero/falso, luego revisa tus errores.',
    freeProjectEyebrow:'Proyecto abierto', freeProjectTitle:'Gratis para estudiar, sostenido por la comunidad.', freeProjectText:'El objetivo es simple: hacer que cursos, fichas y entrenamientos sean accesibles sin barrera.'
  });
  Object.assign(UI.fr, {
    startStudying:'Commencer à réviser', statModulesShort:'modules', clinicalCasesShort:'cas cliniques', vfShort:'vrai/faux',
    stepOneTitle:'Choisis une matière', stepOneText:'Ouvre Physiologie, Biochimie, Microbiologie, Génétique ou Immunologie.',
    stepTwoTitle:'Lis le cours ou la fiche', stepTwoText:'Passe du cours complet à la fiche rapide ou à l’ultra-résumé.',
    stepThreeTitle:'Entraîne-toi activement', stepThreeText:'Fais des QCM, cas cliniques et vrai/faux, puis revois tes erreurs.',
    freeProjectEyebrow:'Projet ouvert', freeProjectTitle:'Gratuit pour étudier, soutenu par la communauté.', freeProjectText:'L’objectif est simple : rendre les cours, les fiches et les entraînements accessibles sans barrière.'
  });
  Object.assign(UI.br, {
    startStudying:'Começar a revisar', statModulesShort:'módulos', clinicalCasesShort:'casos clínicos', vfShort:'verdadeiro/falso',
    stepOneTitle:'Escolha uma matéria', stepOneText:'Abra Fisiologia, Bioquímica, Microbiologia, Genética ou Imunologia.',
    stepTwoTitle:'Leia o curso ou a ficha', stepTwoText:'Passe do curso completo para a ficha rápida ou para o ultra-resumo.',
    stepThreeTitle:'Treine de forma ativa', stepThreeText:'Faça QCM, casos clínicos e verdadeiro/falso, depois revise seus erros.',
    freeProjectEyebrow:'Projeto aberto', freeProjectTitle:'Gratuito para estudar, sustentado pela comunidade.', freeProjectText:'O objetivo é simples: tornar cursos, fichas e treinos acessíveis sem barreira.'
  });


  Object.assign(UI.es, {
    reportError:'Reportar error', reportQuestion:'Reportar esta pregunta', feedbackTitle:'Reportar un problema', feedbackIntro:'El reporte enviará automáticamente la materia, el módulo, la pregunta, las opciones y la respuesta prevista.', feedbackProblem:'Tipo de problema', feedbackComment:'Comentario', feedbackSend:'Enviar reporte', feedbackCancel:'Cancelar', feedbackThanks:'Gracias, el reporte se enviará al validar.', issueWrongAnswer:'La respuesta correcta parece falsa', issueBadWording:'La pregunta está mal formulada', issueTranslation:'Error de traducción', issueAmbiguous:'Opciones ambiguas', issueExplanation:'Explicación insuficiente', issueMismatch:'No corresponde al curso', issueBug:'Bug técnico', issueOther:'Otro problema', confidenceTitle:'Nivel de confianza', confidenceSure:'Seguro', confidenceHesitated:'Dudé', confidenceGuessed:'Adiviné', confidenceSaved:'Confianza guardada', reviewCourseErrors:'Errores de esta materia', confidenceHelp:'Si acertaste dudando, márcalo: volverá en revisión.'
  });
  Object.assign(UI.fr, {
    reportError:'Signaler une erreur', reportQuestion:'Signaler cette question', feedbackTitle:'Signaler un problème', feedbackIntro:'Le signalement enverra automatiquement la matière, le module, la question, les options et la réponse prévue.', feedbackProblem:'Type de problème', feedbackComment:'Commentaire', feedbackSend:'Envoyer le signalement', feedbackCancel:'Annuler', feedbackThanks:'Merci, le signalement sera envoyé après validation.', issueWrongAnswer:'La réponse correcte semble fausse', issueBadWording:'La question est mal formulée', issueTranslation:'Erreur de traduction', issueAmbiguous:'Propositions ambiguës', issueExplanation:'Explication insuffisante', issueMismatch:'Ne correspond pas au cours', issueBug:'Bug technique', issueOther:'Autre problème', confidenceTitle:'Niveau de confiance', confidenceSure:'Sûr', confidenceHesitated:'J’ai hésité', confidenceGuessed:'J’ai deviné', confidenceSaved:'Confiance enregistrée', reviewCourseErrors:'Erreurs de cette matière', confidenceHelp:'Si tu as réussi en hésitant, indique-le : la question reviendra en révision.'
  });
  Object.assign(UI.br, {
    reportError:'Reportar erro', reportQuestion:'Reportar esta pergunta', feedbackTitle:'Reportar um problema', feedbackIntro:'O reporte envia automaticamente a matéria, o módulo, a pergunta, as opções e a resposta prevista.', feedbackProblem:'Tipo de problema', feedbackComment:'Comentário', feedbackSend:'Enviar reporte', feedbackCancel:'Cancelar', feedbackThanks:'Obrigado, o reporte será enviado ao confirmar.', issueWrongAnswer:'A resposta correta parece errada', issueBadWording:'A pergunta está mal formulada', issueTranslation:'Erro de tradução', issueAmbiguous:'Alternativas ambíguas', issueExplanation:'Explicação insuficiente', issueMismatch:'Não corresponde ao curso', issueBug:'Bug técnico', issueOther:'Outro problema', confidenceTitle:'Nível de confiança', confidenceSure:'Seguro', confidenceHesitated:'Fiquei em dúvida', confidenceGuessed:'Chutei', confidenceSaved:'Confiança salva', reviewCourseErrors:'Erros desta matéria', confidenceHelp:'Se você acertou com dúvida, marque isso: a pergunta voltará na revisão.'
  });


  Object.assign(UI.es, {
    navContact:'Contacto',
    contactEyebrow:'Contacto y mejoras',
    contactTitle:'Contactar el proyecto',
    contactText:'Para una sugerencia, un error general o una propuesta de mejora, envía un mensaje aquí. Para una pregunta específica en un QCM, usa mejor el botón “Reportar error” directamente en la pregunta.',
    contactFormEyebrow:'Formulario',
    contactFormTitle:'Enviar un mensaje',
    contactFormText:'Puedes dejar tu nombre y tu email si quieres recibir una respuesta. Si no, el mensaje también puede ser anónimo.',
    contactType:'Tipo de mensaje',
    contactChooseType:'Elegir una categoría',
    contactTypeCourseError:'Error en un curso',
    contactTypeTechnical:'Problema técnico',
    contactTypeSuggestion:'Sugerencia de mejora',
    contactTypeCollab:'Propuesta de colaboración',
    contactTypeGeneral:'Pregunta general',
    contactName:'Nombre',
    contactNamePlaceholder:'Ej.: Diego',
    contactEmail:'Email',
    contactEmailPlaceholder:'nombre@email.com',
    contactMessage:'Mensaje',
    contactMessagePlaceholder:'Describe el problema, la idea o la mejora que propones.',
    contactSend:'Enviar mensaje',
    contactTipsEyebrow:'Antes de enviar',
    contactTipsTitle:'Cómo hacer un buen feedback',
    contactTip1:'Para un error concreto en un QCM, usa el botón “Reportar error” directamente en la pregunta: la materia, el módulo y la pregunta ya estarán precargados.',
    contactTip2:'Para un problema visual, indica si puedes el dispositivo y el navegador: iPhone, Android, Safari, Chrome, etc.',
    contactTip3:'Para corregir un curso, indica al menos la materia, el módulo y qué te parece incorrecto o incompleto.',
    contactDirectTitle:'Consejo',
    contactDirectText:'Esta página sirve sobre todo para comentarios generales. Para preguntas concretas, el reporte integrado en los QCM sigue siendo la mejor opción.',
    contactThanksEyebrow:'Mensaje enviado',
    contactThanksTitle:'Gracias por tu mensaje',
    contactThanksText:'Tu feedback se envió correctamente. Puede servir para mejorar el sitio poco a poco.',
    contactSendAnother:'Enviar otro mensaje'
  });
  Object.assign(UI.fr, {
    navContact:'Contact',
    contactEyebrow:'Contact et améliorations',
    contactTitle:'Contacter le projet',
    contactText:'Pour une suggestion, un bug général ou une proposition d’amélioration, envoie un message ici. Pour une question précise dans un QCM, utilise plutôt le bouton “Signaler une erreur” directement sur la question.',
    contactFormEyebrow:'Formulaire',
    contactFormTitle:'Envoyer un message',
    contactFormText:'Tu peux laisser ton nom et ton email si tu veux recevoir une réponse. Sinon, le message peut rester anonyme.',
    contactType:'Type de message',
    contactChooseType:'Choisir une catégorie',
    contactTypeCourseError:'Erreur dans un cours',
    contactTypeTechnical:'Problème technique',
    contactTypeSuggestion:'Suggestion d’amélioration',
    contactTypeCollab:'Proposition de collaboration',
    contactTypeGeneral:'Question générale',
    contactName:'Nom ou prénom',
    contactNamePlaceholder:'Ex. Diego',
    contactEmail:'Email',
    contactEmailPlaceholder:'nom@email.com',
    contactMessage:'Message',
    contactMessagePlaceholder:'Décris le problème, l’idée ou l’amélioration que tu proposes.',
    contactSend:'Envoyer le message',
    contactTipsEyebrow:'Avant d’envoyer',
    contactTipsTitle:'Comment faire un bon retour',
    contactTip1:'Pour une erreur précise dans un QCM, utilise le bouton “Signaler une erreur” directement sur la question : la matière, le module et la question seront déjà préremplis.',
    contactTip2:'Pour un bug d’affichage, précise si possible ton appareil et ton navigateur : iPhone, Android, Safari, Chrome, etc.',
    contactTip3:'Pour une correction de cours, indique au minimum la matière, le module et ce qui te paraît faux ou incomplet.',
    contactDirectTitle:'Astuce',
    contactDirectText:'Cette page sert surtout aux retours généraux. Pour les questions précises, le signalement intégré dans les QCM reste la meilleure option.',
    contactThanksEyebrow:'Message envoyé',
    contactThanksTitle:'Merci pour ton message',
    contactThanksText:'Ton retour a bien été envoyé. Il pourra servir à améliorer le site progressivement.',
    contactSendAnother:'Envoyer un autre message'
  });
  Object.assign(UI.br, {
    navContact:'Contato',
    contactEyebrow:'Contato e melhorias',
    contactTitle:'Entrar em contato com o projeto',
    contactText:'Para uma sugestão, um bug geral ou uma proposta de melhoria, envie uma mensagem aqui. Para uma pergunta específica em um QCM, prefira usar o botão “Reportar erro” diretamente na pergunta.',
    contactFormEyebrow:'Formulário',
    contactFormTitle:'Enviar uma mensagem',
    contactFormText:'Você pode deixar seu nome e seu email se quiser receber uma resposta. Se preferir, a mensagem também pode ser anônima.',
    contactType:'Tipo de mensagem',
    contactChooseType:'Escolher uma categoria',
    contactTypeCourseError:'Erro em um curso',
    contactTypeTechnical:'Problema técnico',
    contactTypeSuggestion:'Sugestão de melhoria',
    contactTypeCollab:'Proposta de colaboração',
    contactTypeGeneral:'Pergunta geral',
    contactName:'Nome',
    contactNamePlaceholder:'Ex.: Diego',
    contactEmail:'Email',
    contactEmailPlaceholder:'nome@email.com',
    contactMessage:'Mensagem',
    contactMessagePlaceholder:'Descreva o problema, a ideia ou a melhoria que você propõe.',
    contactSend:'Enviar mensagem',
    contactTipsEyebrow:'Antes de enviar',
    contactTipsTitle:'Como fazer um bom feedback',
    contactTip1:'Para um erro específico em um QCM, use o botão “Reportar erro” diretamente na pergunta: a matéria, o módulo e a pergunta já estarão preenchidos.',
    contactTip2:'Para um problema de visualização, informe se puder o aparelho e o navegador: iPhone, Android, Safari, Chrome etc.',
    contactTip3:'Para corrigir um curso, indique pelo menos a matéria, o módulo e o que parece incorreto ou incompleto.',
    contactDirectTitle:'Dica',
    contactDirectText:'Esta página serve principalmente para retornos gerais. Para perguntas pontuais, o reporte integrado nos QCM continua sendo a melhor opção.',
    contactThanksEyebrow:'Mensagem enviada',
    contactThanksTitle:'Obrigado pela sua mensagem',
    contactThanksText:'Seu feedback foi enviado com sucesso. Ele pode ajudar a melhorar o site aos poucos.',
    contactSendAnother:'Enviar outra mensagem'
  });


  Object.assign(UI.es, {
    navAbout:'Sobre el proyecto',
    navLegal:'Aviso legal',
    aboutEyebrow:'Transparencia',
    aboutTitle:'Sobre Med Cursos',
    aboutText:'Med Cursos es una biblioteca médica gratuita pensada para revisar de forma activa: cursos, fichas, QCM, casos clínicos, verdadero/falso y revisión de errores.',
    aboutMissionTitle:'Misión',
    aboutMissionText:'El objetivo es simple: hacer que el estudio médico sea más claro, rápido y accesible, sin bloquear el acceso por pago.',
    aboutHowTitle:'Cómo se organiza el contenido',
    aboutHowText:'Los módulos están organizados por materia. Cada curso puede tener lectura completa, ficha rápida, QCM, casos clínicos y verdadero/falso para pasar de la teoría al entrenamiento.',
    aboutQualityTitle:'Calidad y mejora continua',
    aboutQualityText:'El sitio permite reportar errores en preguntas y enviar sugerencias. La prioridad es corregir ambigüedades, mejorar explicaciones y hacer preguntas más útiles para examen.',
    aboutSupportTitle:'Proyecto gratuito y solidario',
    aboutSupportText:'El acceso sigue siendo gratuito. El apoyo voluntario ayuda a mantener el alojamiento, mejorar las herramientas y continuar agregando contenido.',
    aboutCtaStudy:'Empezar a estudiar',
    aboutCtaContact:'Contactar',
    legalEyebrow:'Información importante',
    legalTitle:'Aviso legal y uso educativo',
    legalText:'Este sitio es una herramienta educativa para estudiantes. No sustituye una consulta médica, una recomendación profesional ni el material oficial de tu universidad.',
    legalEducationalTitle:'Uso educativo',
    legalEducationalText:'El contenido sirve para revisar, memorizar y entrenar el razonamiento. Siempre verifica la información importante con tus clases, bibliografía y docentes.',
    legalMedicalTitle:'No es consejo médico',
    legalMedicalText:'La información publicada no debe usarse para diagnosticar, tratar o modificar conductas clínicas en pacientes reales.',
    legalErrorsTitle:'Errores y correcciones',
    legalErrorsText:'Puede haber errores, traducciones imperfectas o preguntas ambiguas. Si detectas un problema, utiliza el botón de reporte o la página de contacto.',
    legalFormsTitle:'Formularios',
    legalFormsText:'Los formularios de contacto y reporte se envían a través de Netlify Forms para poder revisar comentarios y corregir el sitio.',
    legalPrivacyTitle:'Privacidad básica',
    legalPrivacyText:'No escribas datos médicos personales sensibles en los formularios. Para recibir respuesta, puedes dejar un email, pero no es obligatorio.',
    seoShareTitle:'Med Cursos — cursos médicos, QCM y casos clínicos gratis'
  });
  Object.assign(UI.fr, {
    navAbout:'À propos',
    navLegal:'Mentions',
    aboutEyebrow:'Transparence',
    aboutTitle:'À propos de Med Cursos',
    aboutText:'Med Cursos est une bibliothèque médicale gratuite pensée pour réviser activement : cours, fiches, QCM, cas cliniques, vrai/faux et révision des erreurs.',
    aboutMissionTitle:'Mission',
    aboutMissionText:'L’objectif est simple : rendre l’étude médicale plus claire, plus rapide et plus accessible, sans bloquer l’accès par un paiement.',
    aboutHowTitle:'Organisation du contenu',
    aboutHowText:'Les modules sont organisés par matière. Chaque cours peut proposer lecture complète, fiche rapide, QCM, cas cliniques et vrai/faux pour passer de la théorie à l’entraînement.',
    aboutQualityTitle:'Qualité et amélioration continue',
    aboutQualityText:'Le site permet de signaler les erreurs dans les questions et d’envoyer des suggestions. La priorité est de corriger les ambiguïtés, améliorer les explications et rendre les questions plus utiles pour l’examen.',
    aboutSupportTitle:'Projet gratuit et solidaire',
    aboutSupportText:'L’accès reste gratuit. Le soutien volontaire aide à maintenir l’hébergement, améliorer les outils et continuer à ajouter du contenu.',
    aboutCtaStudy:'Commencer à étudier',
    aboutCtaContact:'Contacter',
    legalEyebrow:'Information importante',
    legalTitle:'Mentions et usage éducatif',
    legalText:'Ce site est un outil éducatif pour étudiants. Il ne remplace pas une consultation médicale, un avis professionnel ni le matériel officiel de ton université.',
    legalEducationalTitle:'Usage éducatif',
    legalEducationalText:'Le contenu sert à réviser, mémoriser et entraîner le raisonnement. Vérifie toujours les informations importantes avec tes cours, ta bibliographie et tes enseignants.',
    legalMedicalTitle:'Pas un conseil médical',
    legalMedicalText:'Les informations publiées ne doivent pas être utilisées pour diagnostiquer, traiter ou modifier une conduite clinique chez de vrais patients.',
    legalErrorsTitle:'Erreurs et corrections',
    legalErrorsText:'Il peut rester des erreurs, traductions imparfaites ou questions ambiguës. Si tu détectes un problème, utilise le bouton de signalement ou la page Contact.',
    legalFormsTitle:'Formulaires',
    legalFormsText:'Les formulaires de contact et de signalement passent par Netlify Forms afin de consulter les retours et corriger le site.',
    legalPrivacyTitle:'Confidentialité de base',
    legalPrivacyText:'N’écris pas de données médicales personnelles sensibles dans les formulaires. Pour recevoir une réponse, tu peux laisser un email, mais ce n’est pas obligatoire.',
    seoShareTitle:'Med Cursos — cours médicaux, QCM et cas cliniques gratuits'
  });
  Object.assign(UI.br, {
    navAbout:'Sobre',
    navLegal:'Aviso legal',
    aboutEyebrow:'Transparência',
    aboutTitle:'Sobre o Med Cursos',
    aboutText:'Med Cursos é uma biblioteca médica gratuita pensada para revisar de forma ativa: cursos, fichas, QCM, casos clínicos, verdadeiro/falso e revisão de erros.',
    aboutMissionTitle:'Missão',
    aboutMissionText:'O objetivo é simples: tornar o estudo médico mais claro, rápido e acessível, sem bloquear o acesso por pagamento.',
    aboutHowTitle:'Como o conteúdo é organizado',
    aboutHowText:'Os módulos são organizados por matéria. Cada curso pode ter leitura completa, ficha rápida, QCM, casos clínicos e verdadeiro/falso para passar da teoria ao treino.',
    aboutQualityTitle:'Qualidade e melhoria contínua',
    aboutQualityText:'O site permite reportar erros nas perguntas e enviar sugestões. A prioridade é corrigir ambiguidades, melhorar explicações e tornar as perguntas mais úteis para prova.',
    aboutSupportTitle:'Projeto gratuito e solidário',
    aboutSupportText:'O acesso continua gratuito. O apoio voluntário ajuda a manter a hospedagem, melhorar as ferramentas e continuar adicionando conteúdo.',
    aboutCtaStudy:'Começar a estudar',
    aboutCtaContact:'Entrar em contato',
    legalEyebrow:'Informação importante',
    legalTitle:'Aviso legal e uso educativo',
    legalText:'Este site é uma ferramenta educativa para estudantes. Ele não substitui consulta médica, orientação profissional nem o material oficial da sua universidade.',
    legalEducationalTitle:'Uso educativo',
    legalEducationalText:'O conteúdo serve para revisar, memorizar e treinar o raciocínio. Sempre verifique informações importantes com suas aulas, bibliografia e professores.',
    legalMedicalTitle:'Não é aconselhamento médico',
    legalMedicalText:'As informações publicadas não devem ser usadas para diagnosticar, tratar ou modificar condutas clínicas em pacientes reais.',
    legalErrorsTitle:'Erros e correções',
    legalErrorsText:'Pode haver erros, traduções imperfeitas ou perguntas ambíguas. Se detectar um problema, use o botão de reporte ou a página de contato.',
    legalFormsTitle:'Formulários',
    legalFormsText:'Os formulários de contato e reporte passam pelo Netlify Forms para permitir revisar feedbacks e corrigir o site.',
    legalPrivacyTitle:'Privacidade básica',
    legalPrivacyText:'Não escreva dados médicos pessoais sensíveis nos formulários. Para receber resposta, você pode deixar um email, mas isso não é obrigatório.',
    seoShareTitle:'Med Cursos — cursos médicos, QCM e casos clínicos gratuitos'
  });

  Object.assign(UI.es, {home:'Inicio', backSubjects:'← Volver a materias', subjectBrandSubtitle:'Módulos por materia', readingCourse:'Lectura del curso', subjectCourseEyebrow:'Curso de la materia', subjectModulesTitle:'Módulos disponibles', subjectSearchPlaceholder:'Buscar en esta materia...', readerFooterText:'Lectura en páginas separadas con navegación por títulos.', toc:'Índice', courseIndex:'Índice del curso', moduleQcm:'QCM de este curso', moduleClinical:'Casos clínicos', qcmMode:'Modo QCM', clinicalCases:'Casos clínicos', vfMode:'Modo Verdadero/Falso', practiceQcmDesc:'Selecciona una materia o repasa las preguntas disponibles.', practiceCaseDesc:'Trabaja las aplicaciones clínicas de los módulos.', practiceVfDesc:'Selecciona una materia o repasa los enunciados disponibles.', practiceDescriptionDefault:'Elige una materia o un módulo. Las preguntas aparecen una por una con reciclaje automático de errores.', practiceDescriptionSeries:'Revisión por series de 20 preguntas: los errores vuelven en la serie siguiente, mezclados con preguntas nuevas.', practiceDescriptionSeriesVf:'Revisión verdadero/falso por series de 20 enunciados: los errores vuelven en la serie siguiente.', emptyQcm:'No hay contenido QCM para esta selección.', emptyCase:'No hay casos clínicos para esta selección.', emptyVf:'No hay contenido verdadero/falso para esta selección.', noQuestions:'No hay preguntas disponibles para esta selección.', level:'Nivel', allLevels:'Todos', sessionFinished:'Sesión terminada', globalResultLabel:'Resultado global', successSentence:'Obtuviste {pct}% de aciertos. Las preguntas falladas se reciclan en las series siguientes hasta agotar el banco disponible.', redoSession:'Rehacer sesión', backToModules:'Volver a módulos', matterLabel:'Materia', courseLabel:'Curso', openArrow:'Abrir →', resetSubjectProgress:'Reiniciar', subjectProgressReset:'Progreso de la materia reiniciado', difficulty:'Dificultad', allDifficulties:'Aleatorio · todos los niveles', questionLevel:'Nivel de la pregunta', normalLevel:'Normal', difficultLevel:'Difícil', extremeLevel:'Extremo', examLevel:'Examen', questionCounter:'Pregunta', bankTotal:'Banco total', selectedBank:'Nivel elegido', currentLevel:'Nivel actual', fullCourse:'Curso completo', quickSheet:'Ficha rápida', courseMode:'Modo de lectura' });
  Object.assign(UI.fr, {home:'Accueil', backSubjects:'← Retour aux matières', subjectBrandSubtitle:'Modules par matière', readingCourse:'Lecture du cours', subjectCourseEyebrow:'Cours de la matière', subjectModulesTitle:'Modules disponibles', subjectSearchPlaceholder:'Rechercher dans cette matière...', readerFooterText:'Lecture en pages séparées avec navigation par titres.', toc:'Sommaire', courseIndex:'Sommaire du cours', moduleQcm:'QCM de ce cours', moduleClinical:'Cas cliniques', qcmMode:'Mode QCM', clinicalCases:'Cas cliniques', vfMode:'Mode Vrai/Faux', practiceQcmDesc:'Sélectionne une matière ou révise les questions disponibles.', practiceCaseDesc:'Travaille les applications cliniques des modules.', practiceVfDesc:'Sélectionne une matière ou révise les énoncés disponibles.', practiceDescriptionDefault:'Choisis une matière ou un module. Les questions apparaissent une par une avec recyclage automatique des erreurs.', practiceDescriptionSeries:'Révision par séries de 20 questions : les erreurs reviennent dans la série suivante, mélangées à de nouvelles questions.', practiceDescriptionSeriesVf:'Révision vrai/faux par séries de 20 énoncés : les erreurs reviennent dans la série suivante.', emptyQcm:'Aucun contenu QCM pour cette sélection.', emptyCase:'Aucun cas clinique pour cette sélection.', emptyVf:'Aucun contenu vrai/faux pour cette sélection.', noQuestions:'Aucune question disponible pour cette sélection.', level:'Niveau', allLevels:'Tous', sessionFinished:'Session terminée', globalResultLabel:'Résultat global', successSentence:'Tu as obtenu {pct}% de réussite. Les questions ratées sont recyclées dans les séries suivantes jusqu’à épuisement de la banque disponible.', redoSession:'Refaire la session', backToModules:'Retour aux modules', matterLabel:'Matière', courseLabel:'Cours', openArrow:'Ouvrir →', resetSubjectProgress:'Réinitialiser', subjectProgressReset:'Progression de la matière réinitialisée', difficulty:'Difficulté', allDifficulties:'Aléatoire · tous niveaux', questionLevel:'Niveau de la question', normalLevel:'Normal', difficultLevel:'Difficile', extremeLevel:'Extrême', examLevel:'Examen', questionCounter:'Question', bankTotal:'Banque totale', selectedBank:'Niveau choisi', currentLevel:'Niveau actuel', fullCourse:'Cours complet', quickSheet:'Fiche rapide', courseMode:'Mode de lecture' });
  Object.assign(UI.br, {home:'Início', backSubjects:'← Voltar às matérias', subjectBrandSubtitle:'Módulos por matéria', readingCourse:'Leitura do curso', subjectCourseEyebrow:'Curso da matéria', subjectModulesTitle:'Módulos disponíveis', subjectSearchPlaceholder:'Pesquisar nesta matéria...', readerFooterText:'Leitura em páginas separadas com navegação por títulos.', toc:'Índice', courseIndex:'Índice do curso', moduleQcm:'QCM deste curso', moduleClinical:'Casos clínicos', qcmMode:'Modo QCM', clinicalCases:'Casos clínicos', vfMode:'Modo Verdadeiro/Falso', practiceQcmDesc:'Selecione uma matéria ou revise as perguntas disponíveis.', practiceCaseDesc:'Trabalhe as aplicações clínicas dos módulos.', practiceVfDesc:'Selecione uma matéria ou revise os enunciados disponíveis.', practiceDescriptionDefault:'Escolha uma matéria ou um módulo. As perguntas aparecem uma por uma com reciclagem automática dos erros.', practiceDescriptionSeries:'Revisão em séries de 20 perguntas: os erros voltam na série seguinte, misturados com perguntas novas.', practiceDescriptionSeriesVf:'Revisão verdadeiro/falso em séries de 20 enunciados: os erros voltam na série seguinte.', emptyQcm:'Não há conteúdo QCM para esta seleção.', emptyCase:'Não há casos clínicos para esta seleção.', emptyVf:'Não há conteúdo verdadeiro/falso para esta seleção.', noQuestions:'Não há perguntas disponíveis para esta seleção.', level:'Nível', allLevels:'Todos', sessionFinished:'Sessão finalizada', globalResultLabel:'Resultado global', successSentence:'Você obteve {pct}% de acertos. As perguntas erradas são recicladas nas séries seguintes até esgotar o banco disponível.', redoSession:'Refazer sessão', backToModules:'Voltar aos módulos', matterLabel:'Matéria', courseLabel:'Curso', openArrow:'Abrir →', resetSubjectProgress:'Reiniciar', subjectProgressReset:'Progresso da matéria reiniciado', difficulty:'Dificuldade', allDifficulties:'Aleatório · todos os níveis', questionLevel:'Nível da questão', normalLevel:'Normal', difficultLevel:'Difícil', extremeLevel:'Extremo', examLevel:'Exame', questionCounter:'Questão', bankTotal:'Banco total', selectedBank:'Nível escolhido', currentLevel:'Nível atual', fullCourse:'Curso completo', quickSheet:'Ficha rápida', courseMode:'Modo de leitura' });

  function lang(){ return safeGetItem('medLang') || 'fr'; }
  function t(key){ const l = lang(); return (UI[l] && UI[l][key]) || UI.es[key] || key; }

  Object.assign(UI.es, {mistakes:'Mis errores', reviewToday:'Repasar hoy', examMode:'Examen blanco', dashboard:'Panel de estudio', continueLearning:'Continuar', weakPoints:'Puntos débiles', noMistakes:'No hay errores guardados todavía.', mistakesText:'Aquí aparecen las preguntas falladas o marcadas como “No sé”, con revisión espaciada.', dueToday:'Para hoy', laterReview:'Más tarde', mastered:'Dominado', markMastered:'Marcar dominado', retryQuestion:'Rehacer pregunta', openCourseSection:'Abrir curso', detailedCorrection:'Corrección detallada', whyCorrect:'Por qué es correcta', whyWrong:'Por qué las otras son falsas', keyTakeaway:'Punto clave', ultraSheet:'Ficha ultra-rápida', startExam:'Iniciar examen blanco', examIntro:'Simulación con preguntas tipo examen, corrección al final y detección de puntos débiles.', examCorrectionHidden:'Modo examen: la corrección aparecerá al final.', reviewMistakes:'Revisar mis errores', todayPlan:'Plan de hoy', quickActions:'Acciones rápidas', questionsToReview:'preguntas para revisar', recentErrors:'errores recientes', startRevision:'Iniciar revisión', allClear:'Todo limpio por ahora', examResult:'Resultado del examen', examReview:'Corrección del examen'});
  Object.assign(UI.fr, {mistakes:'Mes erreurs', reviewToday:'À réviser aujourd’hui', examMode:'Examen blanc', dashboard:'Tableau de bord', continueLearning:'Continuer', weakPoints:'Points faibles', noMistakes:'Aucune erreur enregistrée pour l’instant.', mistakesText:'Ici apparaissent les questions ratées ou marquées “Je ne sais pas”, avec révision espacée.', dueToday:'Pour aujourd’hui', laterReview:'Plus tard', mastered:'Maîtrisé', markMastered:'Marquer maîtrisé', retryQuestion:'Refaire la question', openCourseSection:'Ouvrir le cours', detailedCorrection:'Correction détaillée', whyCorrect:'Pourquoi c’est correct', whyWrong:'Pourquoi les autres sont fausses', keyTakeaway:'Point clé', ultraSheet:'Fiche ultra-rapide', startExam:'Lancer un examen blanc', examIntro:'Simulation avec questions type examen, correction à la fin et détection des points faibles.', examCorrectionHidden:'Mode examen : la correction apparaîtra à la fin.', reviewMistakes:'Revoir mes erreurs', todayPlan:'Plan du jour', quickActions:'Actions rapides', questionsToReview:'questions à revoir', recentErrors:'erreurs récentes', startRevision:'Lancer la révision', allClear:'Rien à revoir pour l’instant', examResult:'Résultat de l’examen', examReview:'Correction de l’examen'});
  Object.assign(UI.br, {mistakes:'Meus erros', reviewToday:'Revisar hoje', examMode:'Simulado', dashboard:'Painel de estudo', continueLearning:'Continuar', weakPoints:'Pontos fracos', noMistakes:'Nenhum erro salvo por enquanto.', mistakesText:'Aqui aparecem perguntas erradas ou marcadas como “Não sei”, com revisão espaçada.', dueToday:'Para hoje', laterReview:'Mais tarde', mastered:'Dominado', markMastered:'Marcar dominado', retryQuestion:'Refazer pergunta', openCourseSection:'Abrir curso', detailedCorrection:'Correção detalhada', whyCorrect:'Por que está correta', whyWrong:'Por que as outras estão erradas', keyTakeaway:'Ponto-chave', ultraSheet:'Ficha ultrarrápida', startExam:'Iniciar simulado', examIntro:'Simulação com perguntas tipo prova, correção no final e detecção dos pontos fracos.', examCorrectionHidden:'Modo simulado: a correção aparecerá no final.', reviewMistakes:'Revisar meus erros', todayPlan:'Plano de hoje', quickActions:'Ações rápidas', questionsToReview:'perguntas para revisar', recentErrors:'erros recentes', startRevision:'Iniciar revisão', allClear:'Nada para revisar por enquanto', examResult:'Resultado do simulado', examReview:'Correção do simulado'});

  // v33 — audit linguistique global : toutes les chaînes générées par les pages d'étude passent par cette couche.
  Object.assign(UI.es, {
    homeTitle:'Estudia medicina con un plan claro, activo y rápido.',
    homeText:'Elige una materia, revisa el curso, entrena con QCM y corrige tus errores sin perder tiempo.',
    startFast:'Empezar rápido', continueStudy:'Continuar estudio', reviewNow:'Revisar ahora', language:'Idioma',
    questionMethod:'Método', methodConcept:'concepto', methodMechanism:'mecanismo', methodConsequence:'consecuencia', methodDistractor:'distractor', methodClinicalData:'dato clínico', methodEliminate:'descartar', methodReadLiteral:'leer literal', methodExcess:'buscar exceso', methodCompare:'comparar con curso', methodDecide:'decidir V/F',
    objectiveCase:'Objetivo: relacionar el signo clínico con el mecanismo de «{topic}».', objectiveVf:'Objetivo: verificar si el enunciado respeta exactamente el mecanismo de «{topic}».', objectiveQcm:'Objetivo: reconocer la proposición exacta sobre «{topic}», no solo una palabra familiar del curso.',
    hint:'Pista', targetedHint:'Pista dirigida', eliminateTwo:'Eliminar 2 distractores', markReview:'Marcar para revisar', addedToReview:'Pregunta añadida a “Mis errores / Repasar”.',
    hintVf:'Pista: primero busca si el enunciado contiene una palabra demasiado absoluta o invierte una relación del curso. Tema: {topic}.', hintCase:'Pista: parte del síntoma o del dato clínico y pregúntate qué cambio funcional lo produce. Tema: {topic}.', hintQcm:'Pista: la opción correcta conserva la cadena definición → mecanismo → consecuencia. {clue}', hintFallback:'Elimina las opciones que invierten causa, ion, célula o localización.', usefulRecall:'Recordatorio útil: {clue}',
    qVf:'El enunciado sobre «{topic}» respeta el curso? Responde verdadero o falso revisando sobre todo palabras absolutas, inversiones y excepciones.', qCase:'¿Qué mecanismo explica mejor el signo o resultado clínico presentado?', qNormal:'Sobre «{topic}», ¿qué proposición es correcta?', qDifficult:'Sobre «{topic}», ¿qué proposición mantiene la relación correcta entre causa, mecanismo y consecuencia?', qExtreme:'Sobre «{topic}», ¿qué afirmación es correcta, célula, fase ni localización?', qExam:'Pregunta: «{topic}».',
    clinicalCase:'Casos clínicos', module:'Módulo', shortcutHelp:'Atajos: A–D para responder · I para pista · E para eliminar · N para “No sé”.', correctBadge:'correcta', chosenBadge:'elegida',
    diagUnknown:'Usaste “No sé”: buena estrategia si estabas bloqueado. Ahora convierte esta pregunta en un punto activo de revisión.', diagCorrect:'Respuesta correcta: identificaste el mecanismo prioritario y eliminaste los distractores.', diagUnclassified:'Error no clasificado: vuelve a leer la corrección buscando la relación causa → mecanismo → consecuencia.',
    trapAbsolute:'Formulación demasiado absoluta: en medicina, “siempre / nunca / solamente” suele ser una trampa.', trapNegation:'Negación excesiva: la opción elimina un mecanismo que existe o exagera su ausencia.', trapIon:'Trampa iónica: verifica si el ion, el sentido del flujo o la fase están invertidos.', trapDirection:'Trampa de sentido: la acción parece posible, pero la relación causa → efecto puede estar invertida.', trapLocation:'Trampa de localización: la estructura citada puede ser verdadera en otro contexto, no necesariamente aquí.', trapConcept:'Distractor conceptual: usa palabras del curso pero no respeta el mecanismo principal solicitado.',
    noKnownYet:'Inicio de sesión: todavía no hay respuestas, empieza con calma.', coachExcellent:'Excelente inicio: sigue así y revisa la justificación para fijar el mecanismo.', coachGood:'Buen ritmo: estás separando la respuesta correcta de los distractores.', coachMixed:'Resultado intermedio: lee la corrección y busca exactamente dónde cambió el mecanismo.', coachHard:'Inicio complicado: sin pánico, el tema mejora cuando corriges las relaciones causa → efecto.',
    noKnowFunny1:'No sé: buena decisión. Mejor ver la respuesta que inventar un mecanismo.', noKnowFunny2:'No sé: ahora transforma la duda en un punto seguro.', noKnowFunny3:'No sé: lee la explicación y vuelve a intentar con método.',
    endSeries:'Fin de la serie', currentGlobalScore:'Score global actual', correctAnswers:'respuestas correctas', accuracy:'aciertos', nextMissed:'Las {n} pregunta(s) falladas de esta serie se mezclarán en la próxima serie con preguntas nuevas.', nextClean:'No hubo preguntas falladas en esta serie: la próxima serie empezará con preguntas nuevas.', reviewNextSeries:'A revisar en la próxima serie:', noRecycle:'Muy bien: no hay errores para reciclar en esta serie.', startNextSeries:'Empezar la serie siguiente',
    examQcm:'QCM examen', general:'General', revision:'Revisión'
  });
  Object.assign(UI.fr, {
    homeTitle:'Étudie médecine avec un plan clair, actif et rapide.',
    homeText:'Choisis une matière, révise le cours, entraîne-toi avec des QCM et corrige tes erreurs sans perdre de temps.',
    startFast:'Démarrer vite', continueStudy:'Continuer l’étude', reviewNow:'Réviser maintenant', language:'Langue',
    questionMethod:'Méthode', methodConcept:'concept', methodMechanism:'mécanisme', methodConsequence:'conséquence', methodDistractor:'distracteur', methodClinicalData:'donnée clinique', methodEliminate:'écarter', methodReadLiteral:'lire littéralement', methodExcess:'repérer l’excès', methodCompare:'comparer au cours', methodDecide:'décider V/F',
    objectiveCase:'Objectif : relier le signe clinique au mécanisme de «{topic}».', objectiveVf:'Objectif : vérifier si l’énoncé respecte exactement le mécanisme de «{topic}».', objectiveQcm:'Objectif : reconnaître la proposition exacte sur «{topic}», pas seulement un mot familier du cours.',
    hint:'Indice', targetedHint:'Indice ciblé', eliminateTwo:'Éliminer 2 distracteurs', markReview:'Marquer à revoir', addedToReview:'Question ajoutée à “Mes erreurs / À revoir”.',
    hintVf:'Indice : cherche d’abord si l’énoncé contient un mot trop absolu ou inverse une relation du cours. Thème : {topic}.', hintCase:'Indice : pars du symptôme ou du signe clinique, puis demande-toi quelle modification fonctionnelle le produit. Thème : {topic}.', hintQcm:'Indice : la bonne option garde la chaîne définition → mécanisme → conséquence. {clue}', hintFallback:'Élimine les options qui inversent cause, ion, cellule ou localisation.', usefulRecall:'Rappel utile : {clue}',
    qVf:'L’énoncé proposé sur «{topic}» respecte-t-il le cours ? Réponds vrai ou faux en vérifiant surtout les mots absolus, les inversions et les exceptions.', qCase:'Quel mécanisme explique le mieux le signe ou le résultat clinique présenté ?', qNormal:'Sur «{topic}», quelle proposition est correcte ?', qDifficult:'Sur «{topic}», quelle proposition garde la bonne relation entre cause, mécanisme et conséquence ?', qExtreme:'Dans une situation intégrative autour de «{topic}», quelle option reste correcte sans inverser l’ion, la cellule, la phase ou la localisation ?', qExam:'Question type examen sur «{topic}» : choisis l’option la plus précise et élimine les distracteurs plausibles.',
    clinicalCase:'Cas clinique', module:'Module', shortcutHelp:'Raccourcis : A–D pour répondre · I pour indice · E pour éliminer · N pour “Je ne sais pas”.', correctBadge:'correct', chosenBadge:'choisi',
    diagUnknown:'Tu as utilisé “Je ne sais pas” : bonne stratégie si tu étais bloqué. Maintenant, transforme cette question en point de révision actif.', diagCorrect:'Réponse correcte : tu as identifié le mécanisme prioritaire et éliminé les distracteurs.', diagUnclassified:'Erreur non classée : relis la correction en cherchant la relation cause → mécanisme → conséquence.',
    trapAbsolute:'Formulation trop absolue : en médecine, “toujours / jamais / seulement” est souvent un piège.', trapNegation:'Négation excessive : l’option supprime un mécanisme qui existe ou exagère son absence.', trapIon:'Piège ionique : vérifie si l’ion, le sens du flux ou la phase sont inversés.', trapDirection:'Piège de sens : l’action est plausible, mais le sens cause → effet peut être inversé.', trapLocation:'Piège de localisation : la structure citée peut être vraie dans un autre contexte, pas forcément ici.', trapConcept:'Distracteur conceptuel : il reprend des mots du cours mais ne respecte pas le mécanisme principal demandé.',
    noKnownYet:'Début de session : aucune réponse pour l’instant, commence tranquillement.', coachExcellent:'Excellent départ : continue et lis la justification pour fixer le mécanisme.', coachGood:'Bon rythme : tu sépares bien la réponse correcte des distracteurs.', coachMixed:'Résultat intermédiaire : lis la correction et repère exactement où le mécanisme change.', coachHard:'Début difficile : pas de panique, le sujet progresse quand tu corriges les relations cause → effet.',
    noKnowFunny1:'Je ne sais pas : bonne décision. Mieux vaut voir la réponse qu’inventer un mécanisme.', noKnowFunny2:'Je ne sais pas : transforme maintenant le doute en point sûr.', noKnowFunny3:'Je ne sais pas : lis l’explication puis réessaie avec méthode.',
    endSeries:'Fin de la série', currentGlobalScore:'Score global actuel', correctAnswers:'réponses correctes', accuracy:'réussite', nextMissed:'Les {n} question(s) ratée(s) de cette série seront mélangée(s) dans la prochaine série avec de nouvelles questions.', nextClean:'Aucune question ratée dans cette série : la prochaine série commencera avec de nouvelles questions.', reviewNextSeries:'À revoir dans la prochaine série :', noRecycle:'Très bien : aucune erreur à recycler pour cette série.', startNextSeries:'Démarrer la série suivante',
    examQcm:'QCM examen', general:'Général', revision:'Révision'
  });
  Object.assign(UI.br, {
    homeTitle:'Estude medicina com um plano claro, ativo e rápido.',
    homeText:'Escolha uma matéria, revise o curso, treine com QCM e corrija seus erros sem perder tempo.',
    startFast:'Começar rápido', continueStudy:'Continuar estudo', reviewNow:'Revisar agora', language:'Idioma',
    questionMethod:'Método', methodConcept:'conceito', methodMechanism:'mecanismo', methodConsequence:'consequência', methodDistractor:'distrator', methodClinicalData:'dado clínico', methodEliminate:'descartar', methodReadLiteral:'ler literalmente', methodExcess:'procurar excesso', methodCompare:'comparar com o curso', methodDecide:'decidir V/F',
    objectiveCase:'Objetivo: relacionar o sinal clínico ao mecanismo de «{topic}».', objectiveVf:'Objetivo: verificar se a afirmação respeita exatamente o mecanismo de «{topic}».', objectiveQcm:'Objetivo: reconhecer a proposição exata sobre «{topic}», não apenas uma palavra familiar do curso.',
    hint:'Dica', targetedHint:'Dica direcionada', eliminateTwo:'Eliminar 2 distratores', markReview:'Marcar para revisar', addedToReview:'Pergunta adicionada a “Meus erros / Revisar”.',
    hintVf:'Dica: primeiro veja se a afirmação contém uma palavra absoluta demais ou inverte uma relação do curso. Tema: {topic}.', hintCase:'Dica: parta do sintoma ou dado clínico e pergunte qual alteração funcional o produz. Tema: {topic}.', hintQcm:'Dica: a opção correta preserva a cadeia definição → mecanismo → consequência. {clue}', hintFallback:'Elimine opções que invertem causa, íon, célula ou localização.', usefulRecall:'Lembrete útil: {clue}',
    qVf:'A afirmação sobre «{topic}» respeita o curso? Responda verdadeiro ou falso verificando principalmente palavras absolutas, inversões e exceções.', qCase:'Qual mecanismo explica melhor o sinal ou resultado clínico apresentado?', qNormal:'Sobre «{topic}», qual proposição está correta?', qDifficult:'Sobre «{topic}», qual proposição mantém a relação correta entre causa, mecanismo e consequência?', qExtreme:'Em uma situação integrativa sobre «{topic}», qual opção continua correta sem inverter íon, célula, fase ou localização?', qExam:'Questão tipo prova sobre «{topic}»: escolha a opção mais precisa e elimine os distratores plausíveis.',
    clinicalCase:'Casos clínicos', module:'Módulo', shortcutHelp:'Atalhos: A–D para responder · I para dica · E para eliminar · N para “Não sei”.', correctBadge:'correta', chosenBadge:'escolhida',
    diagUnknown:'Você usou “Não sei”: boa estratégia se estava bloqueado. Agora transforme essa pergunta em ponto ativo de revisão.', diagCorrect:'Resposta correta: você identificou o mecanismo prioritário e eliminou os distratores.', diagUnclassified:'Erro não classificado: releia a correção procurando a relação causa → mecanismo → consequência.',
    trapAbsolute:'Formulação absoluta demais: em medicina, “sempre / nunca / somente” costuma ser uma armadilha.', trapNegation:'Negação excessiva: a opção elimina um mecanismo que existe ou exagera sua ausência.', trapIon:'Armadilha iônica: verifique se o íon, o sentido do fluxo ou a fase estão invertidos.', trapDirection:'Armadilha de sentido: a ação parece plausível, mas a relação causa → efeito pode estar invertida.', trapLocation:'Armadilha de localização: a estrutura citada pode ser verdadeira em outro contexto, não necessariamente aqui.', trapConcept:'Distrator conceitual: usa palavras do curso, mas não respeita o mecanismo principal pedido.',
    noKnownYet:'Início de sessão: ainda não há respostas, comece com calma.', coachExcellent:'Excelente início: continue e leia a justificativa para fixar o mecanismo.', coachGood:'Bom ritmo: você está separando a resposta correta dos distratores.', coachMixed:'Resultado intermediário: leia a correção e veja exatamente onde o mecanismo mudou.', coachHard:'Início complicado: sem pânico, o tema melhora quando você corrige as relações causa → efeito.',
    noKnowFunny1:'Não sei: boa decisão. Melhor ver a resposta do que inventar um mecanismo.', noKnowFunny2:'Não sei: agora transforme a dúvida em ponto seguro.', noKnowFunny3:'Não sei: leia a explicação e tente novamente com método.',
    endSeries:'Fim da série', currentGlobalScore:'Pontuação global atual', correctAnswers:'respostas corretas', accuracy:'acerto', nextMissed:'As {n} pergunta(s) erradas desta série serão misturadas na próxima série com perguntas novas.', nextClean:'Nenhuma pergunta errada nesta série: a próxima série começará com perguntas novas.', reviewNextSeries:'A revisar na próxima série:', noRecycle:'Muito bem: nenhum erro para reciclar nesta série.', startNextSeries:'Iniciar a próxima série',
    examQcm:'QCM prova', general:'Geral', revision:'Revisão'
  });





  // v35 — correctif complet après bug de chargement ; base v34 éditoriale matière par matière : lexique augmenté, nettoyage des textes et traduction plus cohérente.
  const EDITORIAL_PHRASE_MAP = {"fr": [["Médecine · révision structurée", "Médecine · révision structurée"], ["Módulos integrados para estudio.", "Modules intégrés pour l’étude."], ["Módulo", "Module"], ["MÓDULO", "MODULE"], ["Módulos", "Modules"], ["módulos", "modules"], ["Plan del módulo", "Plan du module"], ["Mapa del módulo", "Carte du module"], ["Objetivos de aprendizaje", "Objectifs d’apprentissage"], ["Objetivos operativos ampliados", "Objectifs opérationnels élargis"], ["Cómo estudiar este módulo de forma completa", "Comment étudier ce module efficacement"], ["Explicación ampliada por bloques", "Explication détaillée par blocs"], ["Puntos de examen integrados", "Points d’examen intégrés"], ["Síntesis final de razonamiento", "Synthèse finale du raisonnement"], ["Idea central", "Idée centrale"], ["Idea clave", "Idée clé"], ["Clave de examen", "Point clé d’examen"], ["Mínimo de examen", "Minimum à maîtriser"], ["Para memorizar", "À mémoriser"], ["Trampas de examen", "Pièges d’examen"], ["Errores frecuentes de examen", "Erreurs fréquentes d’examen"], ["Errores frecuentes", "Erreurs fréquentes"], ["Preguntas integradoras", "Questions intégratrices"], ["Resumen integrador", "Résumé intégrateur"], ["Resumen final", "Résumé final"], ["Aplicación clínica", "Application clinique"], ["Mini caso clínico", "Mini-cas clinique"], ["Casos clínicos", "Cas clinique"], ["Frases finales para memorizar", "Phrases finales à mémoriser"], ["Versión V2 detallada en español - apunte universitario para Notability", "Version éditoriale détaillée — note universitaire pour Notability"], ["Fuente principal: texto bruto de la transcripción del curso de", "Source principale : transcription brute du cours de"], ["Criterio de elaboración", "Critère d’élaboration"], ["Aproximadamente", "Environ"], ["estructura proviene del texto bruto", "la structure provient du texte brut"], ["El 20% restante son conectores fisiológicos y explicaciones añadidas para que el apunte sea estudiable.", "Le reste correspond à des connecteurs physiologiques et à des explications ajoutées pour rendre le cours réellement étudiable."], ["Conceptos principales", "Concepts principaux"], ["Mecanismos", "Mécanismes"], ["Aplicación clínica", "Application clinique"], ["Lo que debes saber responder", "Ce que tu dois savoir répondre"], ["Método de revisión", "Méthode de révision"], ["Lee primero el resumen corto.", "Lis d’abord le résumé court."], ["Repasa el plan esencial y verifica que puedes explicar cada título sin mirar.", "Révise le plan essentiel et vérifie que tu peux expliquer chaque titre sans regarder."], ["Pasa al QCM/caso clínico.", "Passe au QCM ou au cas clinique."], ["Si fallas, vuelve al curso completo y busca el bloque correspondiente.", "Si tu te trompes, reviens au cours complet et cherche le bloc correspondant."], ["Este curso completo conserva el plan original del módulo y añade una lectura más explicativa.", "Ce cours complet conserve le plan original du module et ajoute une lecture plus explicative."], ["La lógica recomendada es: leer el bloque, identificar el mecanismo, relacionarlo con una consecuencia clínica y luego entrenar con QCM/casos clínicos.", "La logique recommandée est : lire le bloc, identifier le mécanisme, le relier à une conséquence clinique, puis s’entraîner avec les QCM et les cas cliniques."], ["Este módulo se estudia relacionando cada definición con su mecanismo y su consecuencia clínica.", "Ce module se travaille en reliant chaque définition à son mécanisme et à sa conséquence clinique."], ["Para dominar este módulo, no memorices frases aisladas.", "Pour maîtriser ce module, ne mémorise pas des phrases isolées."], ["Reconstruye siempre la cadena:", "Reconstruis toujours la chaîne :"], ["concepto → mecanismo → consecuencia → aplicación clínica o pregunta de examen", "concept → mécanisme → conséquence → application clinique ou question d’examen"], ["Si una opción de QCM cambia una dirección, un ion, una célula, una enzima, una vía o una relación causa-efecto, probablemente está usando una trampa clásica.", "Si une option de QCM change une direction, un ion, une cellule, une enzyme, une voie ou une relation cause-effet, elle utilise probablement un piège classique."], ["Punto clave", "Point clé"], ["Respuesta esperada", "Réponse attendue"], ["Pregunta", "Question"], ["Respuesta", "Réponse"], ["Explicación", "Explication"], ["El caso se resuelve identificando el vínculo entre el dato presentado y el mecanismo de", "Le cas se résout en identifiant le lien entre la donnée présentée et le mécanisme de"], ["Caso formulado para entrenar razonamiento, no solo memoria.", "Cas formulé pour entraîner le raisonnement, pas seulement la mémoire."], ["Tema:", "Thème :"], ["Nivel:", "Niveau :"], ["En formato de examen, ¿cuál respuesta es la más precisa y evita el distractor principal?", "En format examen, quelle réponse est la plus précise et évite le distracteur principal ?"], ["En este caso, todos los razonamientos siguientes son compatibles, EXCEPTO:", "Dans ce cas, tous les raisonnements suivants sont compatibles, SAUF :"], ["El dato clave del caso se relaciona con", "La donnée clé du cas se relie à"], ["Un paciente", "Un patient"], ["Una paciente", "Une patiente"], ["paciente", "patient"], ["Pacientes", "Patients"], ["aumenta", "augmente"], ["disminuye", "diminue"], ["reduce", "réduit"], ["inhibe", "inhibe"], ["estimula", "stimule"], ["entrada", "entrée"], ["sale", "sort"], ["salida", "sortie"], ["entra", "entre"], ["se encuentra", "se trouve"], ["se localiza", "se localise"], ["célula", "cellule"], ["células", "cellules"], ["membrana plasmática", "membrane plasmique"], ["membrana", "membrane"], ["mitocondria", "mitochondrie"], ["núcleo", "noyau"], ["retículo endoplasmático", "réticulum endoplasmique"], ["aparato de Golgi", "appareil de Golgi"], ["intracelular", "intracellulaire"], ["extracelular", "extracellulaire"], ["líquido extracelular", "liquide extracellulaire"], ["líquido intracelular", "liquide intracellulaire"], ["sodio", "sodium"], ["potasio", "potassium"], ["calcio", "calcium"], ["cloruro", "chlorure"], ["glucosa", "glucose"], ["proteínas", "protéines"], ["lípidos", "lipides"], ["carbohidratos", "glucides"], ["potencial de acción", "potentiel d’action"], ["potencial de reposo", "potentiel de repos"], ["despolarización", "dépolarisation"], ["repolarización", "repolarisation"], ["hiperpolarización", "hyperpolarisation"], ["umbral", "seuil"], ["ley del todo o nada", "loi du tout ou rien"], ["espiga", "pic"], ["meseta", "plateau"], ["bomba Na+/K+ ATPasa", "pompe Na+/K+ ATPase"], ["canales voltaje-dependientes", "canaux voltage-dépendants"], ["canales", "canaux"], ["transporte activo", "transport actif"], ["transporte pasivo", "transport passif"], ["difusión facilitada", "diffusion facilitée"], ["ósmosis", "osmose"], ["osmolaridad", "osmolarité"], ["tonicidad", "tonicité"], ["ácido-base", "acido-basique"], ["anion gap", "trou anionique"], ["acidosis metabólica", "acidose métabolique"], ["alcalosis", "alcalose"], ["bacteria", "bactérie"], ["bacteriana", "bactérienne"], ["patogenicidad", "pathogénicité"], ["medio de cultivo", "milieu de culture"], ["medios de cultivo", "milieux de culture"], ["tinción de Gram", "coloration de Gram"], ["cocos gram positivos", "cocci Gram positifs"], ["bacilos gram negativos", "bacilles Gram négatifs"], ["toxina", "toxine"], ["antibiótico", "antibiotique"], ["genético", "génétique"], ["material genético", "matériel génétique"], ["ADN", "ADN"], ["ARN", "ARN"], ["replicación", "réplication"], ["transcripción", "transcription"], ["traducción", "traduction"], ["mutación", "mutation"], ["ciclo celular", "cycle cellulaire"], ["mitosis", "mitose"], ["meiosis", "méiose"], ["apoptosis", "apoptose"], ["enzima", "enzyme"], ["enzimas", "enzymes"], ["metabolismo", "métabolisme"], ["glucólisis", "glycolyse"], ["ciclo de Krebs", "cycle de Krebs"], ["cadena respiratoria", "chaîne respiratoire"], ["fosforilación oxidativa", "phosphorylation oxydative"], ["ATP", "ATP"], ["NADH", "NADH"], ["FADH2", "FADH2"], ["inmunidad innata", "immunité innée"], ["inmunidad adaptativa", "immunité adaptative"], ["anticuerpo", "anticorps"], ["anticuerpos", "anticorps"], ["antígeno", "antigène"], ["antígenos", "antigènes"], ["linfocito", "lymphocyte"], ["linfocitos", "lymphocytes"], ["macrófago", "macrophage"], ["macrófagos", "macrophages"], ["neutrófilo", "neutrophile"], ["neutrófilos", "neutrophiles"], ["fagocitosis", "phagocytose"], ["inflamación", "inflammation"], ["vacuna", "vaccin"], ["vacunas", "vaccins"], ["hipersensibilidad", "hypersensibilité"], ["autoinmune", "auto-immune"], ["autoinmunes", "auto-immunes"], ["correcta", "correcte"], ["incorrecta", "incorrecte"], ["verdadero", "vrai"], ["falso", "faux"], ["a favor del gradiente", "dans le sens du gradient"], ["contra el gradiente", "contre le gradient"], ["no requiere ATP directo", "ne nécessite pas d’ATP direct"], ["requiere energía", "nécessite de l’énergie"], ["estudiante", "étudiant"], ["examen", "examen"], ["pregunta de examen", "question d’examen"], ["distractor", "distracteur"], ["distractores", "distracteurs"], ["respuesta correcta", "réponse correcte"], ["responder", "répondre"], ["identificar", "identifier"], ["relacionar", "relier"], ["diferenciar", "différencier"], ["Este módulo", "Ce module"], ["El módulo", "Le module"], ["El profesor", "Le professeur"], ["La profesora", "La professeure"], ["el profesor", "le professeur"], ["la profesora", "la professeure"], ["la transcripción", "la transcription"], ["el curso", "le cours"], ["del curso", "du cours"], ["según el curso", "selon le cours"]], "br": [["Módulos integrados para estudio.", "Módulos integrados para estudo."], ["Módulo", "Módulo"], ["MÓDULO", "MÓDULO"], ["Módulos", "Módulos"], ["módulos", "módulos"], ["Plan del módulo", "Plano do módulo"], ["Mapa del módulo", "Mapa do módulo"], ["Objetivos de aprendizaje", "Objetivos de aprendizagem"], ["Objetivos operativos ampliados", "Objetivos operacionais ampliados"], ["Cómo estudiar este módulo de forma completa", "Como estudar este módulo de forma completa"], ["Explicación ampliada por bloques", "Explicação ampliada por blocos"], ["Puntos de examen integrados", "Pontos de prova integrados"], ["Síntesis final de razonamiento", "Síntese final do raciocínio"], ["Idea central", "Ideia central"], ["Idea clave", "Ideia-chave"], ["Clave de examen", "Ponto-chave de prova"], ["Mínimo de examen", "Mínimo para prova"], ["Para memorizar", "Para memorizar"], ["Trampas de examen", "Armadilhas de prova"], ["Errores frecuentes de examen", "Erros frequentes de prova"], ["Errores frecuentes", "Erros frequentes"], ["Preguntas integradoras", "Perguntas integradoras"], ["Resumen final", "Resumo final"], ["Resumen integrador", "Resumo integrador"], ["Aplicación clínica", "Aplicação clínica"], ["Mini caso clínico", "Minicaso clínico"], ["Casos clínicos", "Casos clínicos"], ["Versión V2 detallada en español - apunte universitario para Notability", "Versão editorial detalhada — apontamento universitário para Notability"], ["Fuente principal: texto bruto de la transcripción del curso de", "Fonte principal: texto bruto da transcrição do curso de"], ["Criterio de elaboración", "Critério de elaboração"], ["Aproximadamente", "Aproximadamente"], ["estructura proviene del texto bruto", "a estrutura vem do texto bruto"], ["El 20% restante son conectores fisiológicos y explicaciones añadidas para que el apunte sea estudiable.", "O restante corresponde a conectores fisiológicos e explicações adicionadas para tornar o material realmente estudável."], ["Conceptos principales", "Conceitos principais"], ["Mecanismos", "Mecanismos"], ["Lo que debes saber responder", "O que você deve saber responder"], ["Método de revisión", "Método de revisão"], ["Lee primero el resumen corto.", "Leia primeiro o resumo curto."], ["Repasa el plan esencial y verifica que puedes explicar cada título sin mirar.", "Revise o plano essencial e verifique se consegue explicar cada título sem olhar."], ["Pasa al QCM/caso clínico.", "Passe ao QCM ou ao caso clínico."], ["Si fallas, vuelve al curso completo y busca el bloque correspondiente.", "Se errar, volte ao curso completo e procure o bloco correspondente."], ["Este curso completo conserva el plan original del módulo y añade una lectura más explicativa.", "Este curso completo conserva o plano original do módulo e acrescenta uma leitura mais explicativa."], ["La lógica recomendada es: leer el bloque, identificar el mecanismo, relacionarlo con una consecuencia clínica y luego entrenar con QCM/casos clínicos.", "A lógica recomendada é: ler o bloco, identificar o mecanismo, relacioná-lo com uma consequência clínica e depois treinar com QCM/casos clínicos."], ["Este módulo se estudia relacionando cada definición con su mecanismo y su consecuencia clínica.", "Este módulo é estudado relacionando cada definição com seu mecanismo e sua consequência clínica."], ["Para dominar este módulo, no memorices frases aisladas.", "Para dominar este módulo, não memorize frases isoladas."], ["Reconstruye siempre la cadena:", "Reconstrua sempre a cadeia:"], ["concepto → mecanismo → consecuencia → aplicación clínica o pregunta de examen", "conceito → mecanismo → consequência → aplicação clínica ou pergunta de prova"], ["Si una opción de QCM cambia una dirección, un ion, una célula, una enzima, una vía o una relación causa-efecto, probablemente está usando una trampa clásica.", "Se uma alternativa de QCM muda uma direção, um íon, uma célula, uma enzima, uma via ou uma relação causa-efeito, provavelmente está usando uma armadilha clássica."], ["Punto clave", "Ponto-chave"], ["Respuesta esperada", "Resposta esperada"], ["Pregunta", "Pergunta"], ["Respuesta", "Resposta"], ["Explicación", "Explicação"], ["El caso se resuelve identificando el vínculo entre el dato presentado y el mecanismo de", "O caso se resolve identificando o vínculo entre o dado apresentado e o mecanismo de"], ["Caso formulado para entrenar razonamiento, no solo memoria.", "Caso formulado para treinar raciocínio, não apenas memória."], ["Tema:", "Tema:"], ["Nivel:", "Nível:"], ["En formato de examen, ¿cuál respuesta es la más precisa y evita el distractor principal?", "Em formato de prova, qual resposta é a mais precisa e evita o distrator principal?"], ["En este caso, todos los razonamientos siguientes son compatibles, EXCEPTO:", "Neste caso, todos os raciocínios seguintes são compatíveis, EXCETO:"], ["El dato clave del caso se relaciona con", "O dado-chave do caso se relaciona com"], ["Un paciente", "Um paciente"], ["Una paciente", "Uma paciente"], ["paciente", "paciente"], ["Pacientes", "Pacientes"], ["aumenta", "aumenta"], ["disminuye", "diminui"], ["reduce", "reduz"], ["entrada", "entrada"], ["sale", "sai"], ["salida", "saída"], ["entra", "entra"], ["se encuentra", "encontra-se"], ["se localiza", "localiza-se"], ["célula", "célula"], ["células", "células"], ["membrana plasmática", "membrana plasmática"], ["membrana", "membrana"], ["mitocondria", "mitocôndria"], ["núcleo", "núcleo"], ["retículo endoplasmático", "retículo endoplasmático"], ["aparato de Golgi", "complexo de Golgi"], ["intracelular", "intracelular"], ["extracelular", "extracelular"], ["líquido extracelular", "líquido extracelular"], ["líquido intracelular", "líquido intracelular"], ["sodio", "sódio"], ["potasio", "potássio"], ["calcio", "cálcio"], ["cloruro", "cloreto"], ["glucosa", "glicose"], ["proteínas", "proteínas"], ["lípidos", "lipídios"], ["carbohidratos", "carboidratos"], ["potencial de acción", "potencial de ação"], ["potencial de reposo", "potencial de repouso"], ["despolarización", "despolarização"], ["repolarización", "repolarização"], ["hiperpolarización", "hiperpolarização"], ["umbral", "limiar"], ["ley del todo o nada", "lei do tudo ou nada"], ["espiga", "espícula"], ["meseta", "platô"], ["bomba Na+/K+ ATPasa", "bomba Na+/K+ ATPase"], ["canales voltaje-dependientes", "canais voltagem-dependentes"], ["canales", "canais"], ["transporte activo", "transporte ativo"], ["transporte pasivo", "transporte passivo"], ["difusión facilitada", "difusão facilitada"], ["ósmosis", "osmose"], ["osmolaridad", "osmolaridade"], ["tonicidad", "tonicidade"], ["ácido-base", "ácido-base"], ["anion gap", "ânion gap"], ["acidosis metabólica", "acidose metabólica"], ["alcalosis", "alcalose"], ["bacteria", "bactéria"], ["bacteriana", "bacteriana"], ["patogenicidad", "patogenicidade"], ["medio de cultivo", "meio de cultura"], ["medios de cultivo", "meios de cultura"], ["tinción de Gram", "coloração de Gram"], ["cocos gram positivos", "cocos Gram-positivos"], ["bacilos gram negativos", "bacilos Gram-negativos"], ["toxina", "toxina"], ["antibiótico", "antibiótico"], ["genético", "genético"], ["material genético", "material genético"], ["replicación", "replicação"], ["transcripción", "transcrição"], ["traducción", "tradução"], ["mutación", "mutação"], ["ciclo celular", "ciclo celular"], ["mitosis", "mitose"], ["meiosis", "meiose"], ["apoptosis", "apoptose"], ["enzima", "enzima"], ["enzimas", "enzimas"], ["metabolismo", "metabolismo"], ["glucólisis", "glicólise"], ["ciclo de Krebs", "ciclo de Krebs"], ["cadena respiratoria", "cadeia respiratória"], ["fosforilación oxidativa", "fosforilação oxidativa"], ["inmunidad innata", "imunidade inata"], ["inmunidad adaptativa", "imunidade adaptativa"], ["anticuerpo", "anticorpo"], ["anticuerpos", "anticorpos"], ["antígeno", "antígeno"], ["antígenos", "antígenos"], ["linfocito", "linfócito"], ["linfocitos", "linfócitos"], ["macrófago", "macrófago"], ["macrófagos", "macrófagos"], ["neutrófilo", "neutrófilo"], ["neutrófilos", "neutrófilos"], ["fagocitosis", "fagocitose"], ["inflamación", "inflamação"], ["vacuna", "vacina"], ["vacunas", "vacinas"], ["hipersensibilidad", "hipersensibilidade"], ["autoinmune", "autoimune"], ["autoinmunes", "autoimunes"], ["correcta", "correta"], ["incorrecta", "incorreta"], ["verdadero", "verdadeiro"], ["falso", "falso"], ["a favor del gradiente", "a favor do gradiente"], ["contra el gradiente", "contra o gradiente"], ["no requiere ATP directo", "não requer ATP direto"], ["requiere energía", "requer energia"], ["estudiante", "estudante"], ["examen", "prova"], ["pregunta de examen", "questão de prova"], ["distractor", "distrator"], ["distractores", "distratores"], ["respuesta correcta", "resposta correta"], ["responder", "responder"], ["identificar", "identificar"], ["relacionar", "relacionar"], ["diferenciar", "diferenciar"], ["Este módulo", "Este módulo"], ["El módulo", "O módulo"], ["El profesor", "O professor"], ["La profesora", "A professora"], ["el profesor", "o professor"], ["la profesora", "a professora"], ["la transcripción", "a transcrição"], ["el curso", "o curso"], ["del curso", "do curso"], ["según el curso", "segundo o curso"]]};
  Object.assign(UI.es, {
    editorialCourses:'Cursos revisados', editorialStatus:'Revisión editorial', editorialValidated:'Contenido revisado por materia', editorialNote:'Terminología, títulos, consignas y correcciones normalizados.',
    yourAnswer:'Tu respuesta', correctAnswerLabel:'Respuesta correcta', pedagogicDiagnosis:'Diagnóstico pedagógico', reviewTag:'A revisar',
    editorialBannerTitle:'Pase editorial aplicado', editorialBannerText:'Módulo revisado para lectura médica: plan conservado, terminología normalizada y traducción coherente según el idioma seleccionado.',
    editorialCoverage:'Cobertura editorial', glossaryTitle:'Glosario clave del módulo', homepageMainCta:'Empezar a estudiar', homepageSecondaryCta:'Entrenar preguntas'
  });
  Object.assign(UI.fr, {
    editorialCourses:'Cours éditorialisés', editorialStatus:'Révision éditoriale', editorialValidated:'Contenu révisé par matière', editorialNote:'Terminologie, titres, consignes et corrections normalisés.',
    yourAnswer:'Ta réponse', correctAnswerLabel:'Réponse correcte', pedagogicDiagnosis:'Diagnostic pédagogique', reviewTag:'À revoir',
    editorialBannerTitle:'Passe éditoriale appliquée', editorialBannerText:'Module relu pour une lecture médicale : plan conservé, terminologie normalisée et traduction cohérente selon la langue choisie.',
    editorialCoverage:'Couverture éditoriale', glossaryTitle:'Glossaire clé du module', homepageMainCta:'Commencer à étudier', homepageSecondaryCta:'S’entraîner'
  });
  Object.assign(UI.br, {
    editorialCourses:'Cursos revisados', editorialStatus:'Revisão editorial', editorialValidated:'Conteúdo revisado por matéria', editorialNote:'Terminologia, títulos, comandos e correções normalizados.',
    yourAnswer:'Sua resposta', correctAnswerLabel:'Resposta correta', pedagogicDiagnosis:'Diagnóstico pedagógico', reviewTag:'Revisar',
    editorialBannerTitle:'Revisão editorial aplicada', editorialBannerText:'Módulo revisado para leitura médica: plano conservado, terminologia normalizada e tradução coerente conforme o idioma escolhido.',
    editorialCoverage:'Cobertura editorial', glossaryTitle:'Glossário-chave do módulo', homepageMainCta:'Começar a estudar', homepageSecondaryCta:'Treinar perguntas'
  });
  function applyEditorialPhrases(out, l){
    const list = EDITORIAL_PHRASE_MAP[l] || [];
    list.forEach(pair => { try { out = out.split(pair[0]).join(pair[1]); } catch(e){} });
    return out;
  }
  function editorialCleanText(str=''){
    return String(str || '')
      .replace(/\bEl dato clave del caso se relaciona con\s*/gi,'')
      .replace(/\bO dado-chave do caso se relaciona com\s*/gi,'')
      .replace(/\bLa donnée clé du cas se relie à\s*/gi,'')
      .replace(/\bEn formato de examen,\s*/gi,'')
      .replace(/\bA partir del caso,?\s*/gi,'')
      .replace(/\bDesde el punto de vista\s+(fisiológico|clínico),?\s*/gi,'')
      .replace(/\bCon respecto a\s*/gi,'')
      .replace(/\bmarque la alternativa correcta\s*/gi,'seleccione la opción correcta ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function rehydrateCollapsedMarkdown(md=''){
    let out = String(md || '').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ');
    const lineCount = (out.match(/\n/g) || []).length;
    if(lineCount > 6) return out;
    // Plusieurs anciens cours étaient stockés sur une seule ligne dans le JS.
    // Le lecteur complet et la fiche rapide avaient alors un bloc illisible ou vide visuellement.
    // On restaure les séparateurs Markdown essentiels avant le rendu HTML.
    out = out.replace(/^---\s+(.{1,260}?)\s+---\s+/s, '---\n$1\n---\n\n');
    out = out.replace(/\s+(#{1,4}\s+)/g, '\n\n$1');
    out = out.replace(/\s+(M[ÓO]DULO\s+\d+\s+)/g, '\n\n$1');
    out = out.replace(/\s+(Plan del módulo\b|Plan del curso\b|Objetivos de aprendizaje\b|Mapa del módulo\b|Resumen corto\b|Ideas esenciales\b|Punto clave\b|Aplicación clínica\b|Errores frecuentes\b|Trampas de examen\b|Preguntas integradoras\b|Mini caso clínico\b)/gi, '\n\n$1');
    out = out.replace(/\s+(\d{1,2}[.)]\s+(?=[A-ZÁÉÍÓÚÑ¿]))/g, '\n$1');
    out = out.replace(/([.;:])\s+(-\s+(?=[A-ZÁÉÍÓÚÑ¿]))/g, '$1\n$2');
    out = out.replace(/\s+(\|\s*---\s*\|)/g, '\n$1');
    out = out.replace(/\s+(\|\s*[A-ZÁÉÍÓÚÑ][^\n]{0,180}\s*\|)/g, '\n$1');
    out = out.replace(/^(#{1,4})\s*\n+\s*([^\n]+)/gm, '$1 $2');
    out = out.replace(/(#{1,4}\s+(Resumen corto|Plan esencial|Lo que debes saber responder|Extracto de examen|Ideas esenciales|Mecanismo en una línea|Trampas rápidas|Plan del módulo|Plan del curso|Objetivos de aprendizaje|Mapa del módulo|Punto clave|Aplicación clínica|Errores frecuentes|Trampas de examen|Preguntas integradoras|Mini caso clínico))\s+([A-ZÁÉÍÓÚÑ¿])/g, '$1\n\n$3');
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  function editorializeMarkdown(md='', module=null, mode='full'){
    let out = rehydrateCollapsedMarkdown(String(md || '').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' '));
    out = stripFrontMatter(out);
    out = normalizeMarkdownCourseText(out, module, mode);
    if(mode === 'fiche') out = ensureReaderLead(out, module, 'quick');
    if(mode === 'ultra') out = ensureReaderLead(out, module, 'ultra');
    out = out.replace(/\n{3,}/g,'\n\n').trim();
    return out;
  }

  function ensureReaderLead(md='', module=null, kind='quick'){
    let out = String(md || '').trim();
    out = out.replace(/^#\s+.*(?:Ficha|Fiche|Módulo|Module).*\n+/i,'');
    if(kind === 'quick'){
      return `## ${t('quickSheet')}\n\n${out}`;
    }
    return `## ${t('ultraSheet')}\n\n${out}`;
  }

  function normalizeMarkdownCourseText(md='', module=null, mode='full'){
    let out = String(md || '').replace(/\t/g,'  ');
    const title = module && module.title ? String(module.title) : '';
    const titleNorm = title ? norm(title) : '';
    const cleaned = [];
    let inMetaTable = false;
    let atTop = true;
    for(const rawLine of out.split('\n')){
      let line = rawLine.replace(/\s+$/,'');
      const tline = line.trim();
      if(!tline){ cleaned.push(''); continue; }
      const low = norm(tline);
      if(/^M[ÓO]DULO\s+\d+$/i.test(tline)) continue;
      if(/^Versi[oó]n\s+/i.test(tline)) continue;
      if(/^Fuente principal\s*:/i.test(tline)) continue;
      if(/apunte universitario|Notability|texto bruto de la transcripci[oó]n/i.test(tline) && tline.length < 180) continue;
      if(/^\|\s*Criterio de elaboraci[oó]n/i.test(tline)){ inMetaTable = true; continue; }
      if(inMetaTable){ if(/^\|\s*-+/.test(tline) || tline.includes('Aproximadamente')) continue; inMetaTable = false; }
      if(/^\|\s*---\s*\|\s*$/.test(tline)) continue;
      if(/^#\s+/.test(tline)){
        const headerText = tline.replace(/^#+\s*/,'').replace(/^M[óo]dulo\s+\d+\s*[-–—:]\s*/i,'').trim();
        if(mode === 'full' && titleNorm && norm(headerText).includes(titleNorm.slice(0, Math.min(22, titleNorm.length)))) continue;
        if(mode !== 'full' && /ficha|résumé|resumen|ultra/i.test(tline)) continue;
      }
      if(atTop && titleNorm && low.includes(titleNorm.slice(0, Math.min(18, titleNorm.length))) && tline === tline.toUpperCase() && tline.length < 120) continue;
      if(/^(course|module_number|title|language|format)\s*:/i.test(tline)) continue;
      cleaned.push(line);
      if(tline) atTop = false;
    }
    out = cleaned.join('\n');
    out = repairGeneratedMarkdownArtifacts(out);
    out = out.replace(/\n{3,}/g,'\n\n');
    return out.trim();
  }

  function repairGeneratedMarkdownArtifacts(md=''){
    let out = String(md || '');
    out = out.split('\n').map(line => {
      const m = line.match(/^\s*-\s*\|(.+)\|\s*$/);
      if(!m) return line;
      const cells = m[1].split('|').map(x => x.trim()).filter(Boolean);
      if(!cells.length || cells.every(c => /^-+$/.test(c))) return '';
      const first = cells[0].replace(/\*\*/g,'');
      if(/^(Alteraci[oó]n|T[ée]rmino|Ion|Movimiento|Concepto|Dato)$/i.test(first) && cells.length > 1){
        return `- **${first}** — ${cells.slice(1).join(' · ')}`;
      }
      if(cells.length >= 2) return `- **${first}**: ${cells.slice(1).join(' · ')}`;
      return `- ${first}`;
    }).filter(line => line.trim() !== '').join('\n');
    out = out.replace(/\n#{2,3}\s*Revisi[oó]n editorial aplicada[\s\S]*?(?=\n#{2,3}\s|$)/gi,'\n');
    out = out.replace(/\n>\s*\*\*Revisi[oó]n editorial aplicada\*\*[\s\S]*?(?=\n\n|$)/gi,'\n');
    out = out.replace(/\bEl profesor\s+/gi,'');
    out = out.replace(/\bEn la transcripci[oó]n,?\s*/gi,'');
    out = out.replace(/\btexto bruto\b/gi,'curso fuente');
    out = out.replace(/\bdel profesor\b/gi,'del curso');
    out = out.replace(/\n{3,}/g,'\n\n');
    return out;
  }


  const TITLE_MAP = {
    fr:{
      'Fisiología':'Physiologie','Microbiología':'Microbiologie','Genética':'Génétique','Bioquímica':'Biochimie','Inmunología':'Immunologie','Biofísica':'Biophysique',
      'Neurofisiología y potencial de acción':'Neurophysiologie et potentiel d’action','Transporte de membrana':'Transport membranaire','Osmolaridad, ósmosis y tonicidad':'Osmolarité, osmose et tonicité','Glucólisis y metabolismo energético':'Glycolyse et métabolisme énergétique','Contracción muscular':'Contraction musculaire','Cardiovascular':'Cardiovasculaire','Electrocardiograma':'Électrocardiogramme','Fisiología respiratoria':'Physiologie respiratoire','Fisiología renal':'Physiologie rénale'
    },
    br:{
      'Fisiología':'Fisiologia','Microbiología':'Microbiologia','Genética':'Genética','Bioquímica':'Bioquímica','Inmunología':'Imunologia','Biofísica':'Biofísica',
      'Neurofisiología y potencial de acción':'Neurofisiologia e potencial de ação','Transporte de membrana':'Transporte de membrana','Osmolaridad, ósmosis y tonicidad':'Osmolaridade, osmose e tonicidade','Glucólisis y metabolismo energético':'Glicólise e metabolismo energético','Contracción muscular':'Contração muscular','Cardiovascular':'Cardiovascular','Electrocardiograma':'Eletrocardiograma','Fisiología respiratoria':'Fisiologia respiratória','Fisiología renal':'Fisiologia renal'
    }
  };

  Object.assign(TITLE_MAP.fr, {
    "Equilibrio ácido-base": "Équilibre acido-basique",
    "Anion gap y acidosis metabólica": "Trou anionique et acidose métabolique",
    "Fisiología respiratoria y casos clínicos": "Physiologie respiratoire et cas cliniques",
    "Fisiología cardiovascular, circulación y presión arterial": "Physiologie cardiovasculaire, circulation et pression artérielle",
    "Electrocardiograma: interpretación básica": "Électrocardiogramme : interprétation de base",
    "Estructura bacteriana y patogenicidad": "Structure bactérienne et pathogénicité",
    "Diagnóstico microbiológico y medios de cultivo": "Diagnostic microbiologique et milieux de culture",
    "Metabolismo y crecimiento bacteriano": "Métabolisme et croissance bactérienne",
    "Vibrio cholerae y cólera": "Vibrio cholerae et choléra",
    "Gardnerella vaginalis y vaginosis bacteriana": "Gardnerella vaginalis et vaginose bactérienne",
    "Chlamydia, Mycoplasma y Ureaplasma": "Chlamydia, Mycoplasma et Ureaplasma",
    "Helicobacter pylori": "Helicobacter pylori",
    "Pseudomonas aeruginosa": "Pseudomonas aeruginosa",
    "Mycobacterium tuberculosis y leprae": "Mycobacterium tuberculosis et leprae",
    "Staphylococcus y cocos gram positivos": "Staphylococcus et cocci Gram positifs",
    "Streptococcus, catalasa y hemólisis": "Streptococcus, catalase et hémolyse",
    "Resistencia bacteriana y antibiograma": "Résistance bactérienne et antibiogramme",
    "Diagnóstico diferencial genital: Candida, Trichomonas y gonorrea": "Diagnostic différentiel génital : Candida, Trichomonas et gonorrhée",
    "Bases celulares y material genético": "Bases cellulaires et matériel génétique",
    "ADN, ARN y síntesis de proteínas": "ADN, ARN et synthèse protéique",
    "Cromosomas, cariotipo y tipos cromosómicos": "Chromosomes, caryotype et types chromosomiques",
    "Ciclo celular, mitosis, meiosis y checkpoints": "Cycle cellulaire, mitose, méiose et checkpoints",
    "No disyunción, aneuploidías, trisomías y monosomías": "Non-disjonction, aneuploïdies, trisomies et monosomies",
    "Genética mendeliana: alelos, genotipo y fenotipo": "Génétique mendélienne : allèles, génotype et phénotype",
    "Patrones de herencia y árboles genealógicos": "Modes de transmission et arbres généalogiques",
    "Síndrome de Down, Edwards y Patau": "Syndromes de Down, Edwards et Patau",
    "Alteraciones de cromosomas sexuales: monosomía X, 47,XXX y 47,XXY": "Anomalies des chromosomes sexuels : monosomie X, 47,XXX et 47,XXY",
    "Enfermedad de Huntington y expansión de trinucleótidos": "Maladie de Huntington et expansion de trinucléotides",
    "Síndrome de Marfan y enfermedades del tejido conectivo": "Syndrome de Marfan et maladies du tissu conjonctif",
    "Genética multifactorial, ambiente y predisposición": "Génétique multifactorielle, environnement et prédisposition",
    "Agua, pH y equilibrio hídrico": "Eau, pH et équilibre hydrique",
    "Soluciones, electrolitos y ósmosis": "Solutions, électrolytes et osmose",
    "Proteínas y aminoácidos": "Protéines et acides aminés",
    "Clasificación de proteínas y perfil proteico": "Classification des protéines et profil protéique",
    "Metabolismo nitrogenado y perfil renal": "Métabolisme azoté et profil rénal",
    "Lípidos, colesterol y triglicéridos": "Lipides, cholestérol et triglycérides",
    "Lípidos complejos, membranas y vitaminas liposolubles": "Lipides complexes, membranes et vitamines liposolubles",
    "Carbohidratos: clasificación y digestión": "Glucides : classification et digestion",
    "Metabolismo de carbohidratos y control hormonal": "Métabolisme des glucides et contrôle hormonal",
    "Vitaminas hidrosolubles y liposolubles": "Vitamines hydrosolubles et liposolubles",
    "Examen de orina e interpretación bioquímica": "Examen urinaire et interprétation biochimique",
    "Protocolos laboratoriales integradores": "Protocoles de laboratoire intégrateurs",
    "Introducción a la inmunología: inmunidad innata y adaptativa": "Introduction à l’immunologie : immunité innée et adaptative",
    "Sistema de complemento: C3, C5, C9 y vías de activación": "Système du complément : C3, C5, C9 et voies d’activation",
    "Inflamación: concepto, necrosis, apoptosis y sufijo “-itis”": "Inflammation : concept, nécrose, apoptose et suffixe « -ite »",
    "Exudado, trasudado, edema, pus y empiema": "Exsudat, transsudat, œdème, pus et empyème",
    "Inflamación aguda: vasodilatación, permeabilidad y mediadores": "Inflammation aiguë : vasodilatation, perméabilité et médiateurs",
    "Migración leucocitaria: marginación, rodamiento, adhesión y diapedesis": "Migration leucocytaire : margination, roulement, adhésion et diapédèse",
    "Fagocitosis, neutrófilos, monocitos y macrófagos": "Phagocytose, neutrophiles, monocytes et macrophages",
    "Inflamación crónica, hipersensibilidad y enfermedades autoinmunes": "Inflammation chronique, hypersensibilité et maladies auto-immunes",
    "Reparación tisular: angiogénesis, fibrosis y cicatrización": "Réparation tissulaire : angiogenèse, fibrose et cicatrisation",
    "Macrófagos: funciones y vías de activación clásica/alternativa": "Macrophages : fonctions et voies d’activation classique/alternative",
    "Vacunas: toxoides, vivas atenuadas, inactivadas, conjugadas y combinadas": "Vaccins : anatoxines, vivants atténués, inactivés, conjugués et combinés",
    "Vacunación del recién nacido y contraindicaciones": "Vaccination du nouveau-né et contre-indications"
});
  Object.assign(TITLE_MAP.br, {
    "Equilibrio ácido-base": "Equilíbrio ácido-base",
    "Anion gap y acidosis metabólica": "Ânion gap e acidose metabólica",
    "Fisiología respiratoria y casos clínicos": "Fisiologia respiratória e casos clínicos",
    "Fisiología cardiovascular, circulación y presión arterial": "Fisiologia cardiovascular, circulação e pressão arterial",
    "Electrocardiograma: interpretación básica": "Eletrocardiograma: interpretação básica",
    "Estructura bacteriana y patogenicidad": "Estrutura bacteriana e patogenicidade",
    "Diagnóstico microbiológico y medios de cultivo": "Diagnóstico microbiológico e meios de cultura",
    "Metabolismo y crecimiento bacteriano": "Metabolismo e crescimento bacteriano",
    "Vibrio cholerae y cólera": "Vibrio cholerae e cólera",
    "Gardnerella vaginalis y vaginosis bacteriana": "Gardnerella vaginalis e vaginose bacteriana",
    "Chlamydia, Mycoplasma y Ureaplasma": "Chlamydia, Mycoplasma e Ureaplasma",
    "Helicobacter pylori": "Helicobacter pylori",
    "Pseudomonas aeruginosa": "Pseudomonas aeruginosa",
    "Mycobacterium tuberculosis y leprae": "Mycobacterium tuberculosis e leprae",
    "Staphylococcus y cocos gram positivos": "Staphylococcus e cocos Gram positivos",
    "Streptococcus, catalasa y hemólisis": "Streptococcus, catalase e hemólise",
    "Resistencia bacteriana y antibiograma": "Resistência bacteriana e antibiograma",
    "Diagnóstico diferencial genital: Candida, Trichomonas y gonorrea": "Diagnóstico diferencial genital: Candida, Trichomonas e gonorreia",
    "Bases celulares y material genético": "Bases celulares e material genético",
    "ADN, ARN y síntesis de proteínas": "DNA, RNA e síntese de proteínas",
    "Cromosomas, cariotipo y tipos cromosómicos": "Cromossomos, cariótipo e tipos cromossômicos",
    "Ciclo celular, mitosis, meiosis y checkpoints": "Ciclo celular, mitose, meiose e checkpoints",
    "No disyunción, aneuploidías, trisomías y monosomías": "Não disjunção, aneuploidias, trissomias e monossomias",
    "Genética mendeliana: alelos, genotipo y fenotipo": "Genética mendeliana: alelos, genótipo e fenótipo",
    "Patrones de herencia y árboles genealógicos": "Padrões de herança e heredogramas",
    "Síndrome de Down, Edwards y Patau": "Síndromes de Down, Edwards e Patau",
    "Alteraciones de cromosomas sexuales: monosomía X, 47,XXX y 47,XXY": "Alterações dos cromossomos sexuais: monossomia X, 47,XXX e 47,XXY",
    "Enfermedad de Huntington y expansión de trinucleótidos": "Doença de Huntington e expansão de trinucleotídeos",
    "Síndrome de Marfan y enfermedades del tejido conectivo": "Síndrome de Marfan e doenças do tecido conjuntivo",
    "Genética multifactorial, ambiente y predisposición": "Genética multifatorial, ambiente e predisposição",
    "Agua, pH y equilibrio hídrico": "Água, pH e equilíbrio hídrico",
    "Soluciones, electrolitos y ósmosis": "Soluções, eletrólitos e osmose",
    "Proteínas y aminoácidos": "Proteínas e aminoácidos",
    "Clasificación de proteínas y perfil proteico": "Classificação de proteínas e perfil proteico",
    "Metabolismo nitrogenado y perfil renal": "Metabolismo nitrogenado e perfil renal",
    "Lípidos, colesterol y triglicéridos": "Lipídios, colesterol e triglicerídeos",
    "Lípidos complejos, membranas y vitaminas liposolubles": "Lipídios complexos, membranas e vitaminas lipossolúveis",
    "Carbohidratos: clasificación y digestión": "Carboidratos: classificação e digestão",
    "Metabolismo de carbohidratos y control hormonal": "Metabolismo de carboidratos e controle hormonal",
    "Vitaminas hidrosolubles y liposolubles": "Vitaminas hidrossolúveis e lipossolúveis",
    "Examen de orina e interpretación bioquímica": "Exame de urina e interpretação bioquímica",
    "Protocolos laboratoriales integradores": "Protocolos laboratoriais integradores",
    "Introducción a la inmunología: inmunidad innata y adaptativa": "Introdução à imunologia: imunidade inata e adaptativa",
    "Sistema de complemento: C3, C5, C9 y vías de activación": "Sistema complemento: C3, C5, C9 e vias de ativação",
    "Inflamación: concepto, necrosis, apoptosis y sufijo “-itis”": "Inflamação: conceito, necrose, apoptose e sufixo “-ite”",
    "Exudado, trasudado, edema, pus y empiema": "Exsudato, transudato, edema, pus e empiema",
    "Inflamación aguda: vasodilatación, permeabilidad y mediadores": "Inflamação aguda: vasodilatação, permeabilidade e mediadores",
    "Migración leucocitaria: marginación, rodamiento, adhesión y diapedesis": "Migração leucocitária: marginação, rolamento, adesão e diapedese",
    "Fagocitosis, neutrófilos, monocitos y macrófagos": "Fagocitose, neutrófilos, monócitos e macrófagos",
    "Inflamación crónica, hipersensibilidad y enfermedades autoinmunes": "Inflamação crônica, hipersensibilidade e doenças autoimunes",
    "Reparación tisular: angiogénesis, fibrosis y cicatrización": "Reparação tecidual: angiogênese, fibrose e cicatrização",
    "Macrófagos: funciones y vías de activación clásica/alternativa": "Macrófagos: funções e vias de ativação clássica/alternativa",
    "Vacunas: toxoides, vivas atenuadas, inactivadas, conjugadas y combinadas": "Vacinas: toxoides, vivas atenuadas, inativadas, conjugadas e combinadas",
    "Vacunación del recién nacido y contraindicaciones": "Vacinação do recém-nascido e contraindicações"
});
  const PHRASE_MAP = {
    fr:[
      ['Módulos integrados para estudio.','Modules intégrés pour l’étude.'],['Statut : non encore transformé en modules texte dans cette archive.','Statut : pas encore transformé en modules texte dans cette archive.'],['Módulo','Module'],['Módulos','Modules'],['materia','matière'],['Materia','Matière'],['curso','cours'],['Curso','Cours'],['cursos','cours'],['Cursos','Cours'],['Verdadero','Vrai'],['Falso','Faux'],['Respuesta correcta','Réponse correcte'],[t('noContent'),'Aucune question disponible pour cette sélection.'],['Marque la respuesta correcta','Coche la réponse correcte'],['MARQUE LO CORRECTO','COCHE LA RÉPONSE CORRECTE'],['Con respecto a','Concernant'],['desde el punto de vista fisiológico','du point de vue physiologique'],['potencial de acción','potentiel d’action'],['potencial de reposo','potentiel de repos'],['bomba Na+/K+ ATPasa','pompe Na+/K+ ATPase'],['despolarización','dépolarisation'],['repolarización','repolarisation'],['hiperpolarización','hyperpolarisation'],['canales','canaux'],['membrana','membrane'],['paciente','patient'],['Paciente','Patient'],['contracción','contraction'],['músculo','muscle'],['cardíaco','cardiaque'],['gasto cardíaco','débit cardiaque'],['retorno venoso','retour veineux'],['sodio','sodium'],['potasio','potassium'],['calcio','calcium'],['glucosa','glucose']
    ],
    br:[
      ['Módulos integrados para estudio.','Módulos integrados para estudo.'],['Statut : non encore transformé en modules texte dans cette archive.','Status: ainda não transformado em módulos de texto nesta pasta.'],['Módulo','Módulo'],['Módulos','Módulos'],['materia','matéria'],['Materia','Matéria'],['curso','curso'],['Curso','Curso'],['cursos','cursos'],['Cursos','Cursos'],['Verdadero','Verdadeiro'],['Falso','Falso'],['Respuesta correcta','Resposta correta'],[t('noContent'),'Não há perguntas disponíveis para esta seleção.'],['Marque la respuesta correcta','Marque a resposta correta'],['MARQUE LO CORRECTO','MARQUE O CORRETO'],['Con respecto a','Em relação a'],['desde el punto de vista fisiológico','do ponto de vista fisiológico'],['potencial de acción','potencial de ação'],['potencial de reposo','potencial de repouso'],['bomba Na+/K+ ATPasa','bomba Na+/K+ ATPase'],['despolarización','despolarização'],['repolarización','repolarização'],['hiperpolarización','hiperpolarização'],['canales','canais'],['membrana','membrana'],['paciente','paciente'],['Paciente','Paciente'],['contracción','contração'],['músculo','músculo'],['cardíaco','cardíaco'],['gasto cardíaco','débito cardíaco'],['retorno venoso','retorno venoso'],['sodio','sódio'],['potasio','potássio'],['calcio','cálcio'],['glucosa','glicose']
    ]
  };

  // v36: compléments lexicaux pour les titres et les sections des cours.
  const EXTRA_READER_PHRASES = {
    fr:[
      ['Resumen corto','Résumé court'],['Plan esencial','Plan essentiel'],['Lo que debes saber responder','Ce que tu dois savoir répondre'],['Extracto de examen','Extrait d’examen'],['Ideas esenciales','Idées essentielles'],['Mecanismo en una línea','Mécanisme en une ligne'],['Trampas rápidas','Pièges rapides'],['Objetivo:','Objectif :'],['Revisa el curso completo para ver los mecanismos principales.','Revois le cours complet pour comprendre les mécanismes principaux.'],['Los puntos de examen aparecerán aquí cuando estén disponibles en el módulo.','Les points d’examen apparaîtront ici lorsqu’ils sont disponibles dans le module.'],['Cómo razonarlo','Comment le raisonner'],['Idea del bloque','Idée du bloc'],['Aplicación clínica o de examen','Application clinique ou d’examen'],['Bloque ampliado','Bloc détaillé'],['Lo que debes saber','Ce que tu dois savoir'],['Plan del módulo','Plan du module'],['Plan del curso','Plan du cours']
    ],
    br:[
      ['Resumen corto','Resumo curto'],['Plan esencial','Plano essencial'],['Lo que debes saber responder','O que você deve saber responder'],['Extracto de examen','Trecho de prova'],['Ideas esenciales','Ideias essenciais'],['Mecanismo en una línea','Mecanismo em uma linha'],['Trampas rápidas','Pegadinhas rápidas'],['Objetivo:','Objetivo:'],['Revisa el curso completo para ver los mecanismos principales.','Revise o curso completo para entender os mecanismos principais.'],['Los puntos de examen aparecerán aquí cuando estén disponibles en el módulo.','Os pontos de prova aparecerão aqui quando estiverem disponíveis no módulo.'],['Cómo razonarlo','Como raciocinar'],['Idea del bloque','Ideia do bloco'],['Aplicación clínica o de examen','Aplicação clínica ou de prova'],['Bloque ampliado','Bloco ampliado'],['Lo que debes saber','O que você deve saber'],['Plan del módulo','Plano do módulo'],['Plan del curso','Plano do curso']
    ]
  };
  Object.keys(EXTRA_READER_PHRASES).forEach(k => {
    PHRASE_MAP[k] = EXTRA_READER_PHRASES[k].concat(PHRASE_MAP[k] || []);
    if(EDITORIAL_PHRASE_MAP[k]) EDITORIAL_PHRASE_MAP[k] = EXTRA_READER_PHRASES[k].concat(EDITORIAL_PHRASE_MAP[k] || []);
  });

  function lt(str=''){
    const l = lang();
    let out = editorialCleanText(String(str || ''));
    if(l === 'es') return out;
    if(TITLE_MAP[l] && TITLE_MAP[l][out]) return TITLE_MAP[l][out];
    out = applyEditorialPhrases(out, l);
    (PHRASE_MAP[l] || []).forEach(([a,b]) => { out = out.split(a).join(b); });
    out = applyEditorialPhrases(out, l);
    return out;
  }
  function ltitle(str=''){ return lt(str); }
  function applyI18n(root=document){
    document.documentElement.lang = lang() === 'br' ? 'pt-BR' : lang();
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }

  function escapeHtml(str=''){
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function inline(md=''){
    // v36: traduction ligne par ligne. Ne jamais traduire tout le Markdown en une seule fois.
    let raw = translateInlineForReader(String(md || ''));
    let s = escapeHtml(raw);
    s = s.replace(/`([^`]+)`/g,'<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function translateInlineForReader(text=''){
    const trimmed = String(text || '');
    if(!trimmed) return '';
    if(/^\s*[-:]{3,}\s*$/.test(trimmed)) return trimmed;
    return translateReaderLight(editorialCleanText(trimmed));
  }

  function translateReaderLight(text=''){
    // Traduction éditoriale non destructive : on traduit les intitulés/labels, pas les longs paragraphes mot à mot.
    let out = String(text || '');
    const l = lang();
    if(l === 'es') return out;
    const extras = (typeof EXTRA_READER_PHRASES !== 'undefined' && EXTRA_READER_PHRASES[l]) ? EXTRA_READER_PHRASES[l] : [];
    extras.forEach(([a,b]) => { out = out.split(a).join(b); });
    // Traduire uniquement si toute la ligne correspond à un titre connu.
    const bare = out.replace(/^\d+[.)]?\s*/,'').replace(/^\*\*|\*\*:?$/g,'').trim();
    if(TITLE_MAP[l] && TITLE_MAP[l][bare]) out = out.replace(bare, TITLE_MAP[l][bare]);
    return out;
  }

  function readerSummaryText(text=''){
    // Le résumé source reste cohérent : pas de traduction mot à mot qui mélange les langues.
    return editorialCleanText(String(text || ''));
  }

  function norm(str=''){
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[⁺]/g,'+').replace(/[^a-z0-9+\/]+/g,' ').replace(/\s+/g,' ').trim();
  }
  function slugify(str=''){
    return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'section';
  }
  function uniqueId(base, used){
    let id = base, i = 2;
    while(used.has(id)){ id = `${base}-${i++}`; }
    used.add(id); return id;
  }
  function stripFrontMatter(md=''){
    if(md.startsWith('---')){
      const parts = md.split('---');
      if(parts.length >= 3) return parts.slice(2).join('---').trim();
    }
    return md.trim();
  }
  function isTableStart(lines, i){
    return lines[i] && lines[i].includes('|') && lines[i+1] && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i+1]);
  }
  function parseTable(lines, start){
    const rows=[]; let i=start;
    while(i<lines.length && lines[i].includes('|') && lines[i].trim()){
      if(i!==start+1) rows.push(lines[i]);
      i++;
    }
    const cells = row => row.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c => inline(c.trim()));
    const head = cells(rows[0] || '');
    const body = rows.slice(1).map(cells);
    let html = '<table><thead><tr>' + head.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    html += body.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('');
    html += '</tbody></table>';
    return {html, next:i};
  }
  function markdownToHtml(markdown='', options={}){
    const md = stripFrontMatter(markdown).replace(/\r\n/g,'\n');
    const lines = md.split('\n');
    let html='', para=[], list=null;
    const toc=[], used=new Set();
    const withIds = !!options.withIds;
    const maxTocLevel = options.maxTocLevel || 3;
    const flushPara = () => { if(para.length){ html += `<p>${inline(para.join(' '))}</p>`; para=[]; } };
    const closeList = () => { if(list){ html += `</${list}>`; list=null; } };
    for(let i=0;i<lines.length;i++){
      const raw = lines[i];
      const line = raw.trim();
      if(!line){ flushPara(); closeList(); continue; }
      const img = line.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
      if(img){
        flushPara(); closeList();
        const alt = translateInlineForReader(img[1] || '');
        const src = String(img[2] || '').trim();
        html += `<figure class="course-figure"><button class="course-figure-zoom" type="button" aria-label="Agrandir la figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></button><figcaption>${inline(img[1] || '')}</figcaption></figure>`;
        continue;
      }
      if(isTableStart(lines,i)){
        flushPara(); closeList(); const t=parseTable(lines,i); html += t.html; i=t.next-1; continue;
      }
      const h = line.match(/^(#{1,4})\s+(.+)$/);
      const knownBareHeading = /^(Mapa del módulo|Objetivos de aprendizaje|Trampas de examen|Preguntas integradoras|Resumen final|Mini caso clínico|Aplicación clínica)$/i.test(line);
      const numberedBareHeading = /^\d{1,2}\.\s+[^.?!]{4,120}$/.test(line);
      if(h || (withIds && (knownBareHeading || numberedBareHeading))){
        flushPara(); closeList();
        const level = h ? Math.min(h[1].length,3) : 2;
        const text = h ? h[2].trim() : line;
        let idAttr = '';
        if(withIds){
          const id = uniqueId(slugify(text), used);
          idAttr = ` id="${id}"`;
          if(level <= maxTocLevel) toc.push({id, text:text.replace(/\*\*/g,''), level});
        }
        html += `<h${level}${idAttr}>${inline(text)}</h${level}>`;
        continue;
      }
      if(/^>\s?/.test(line)){ flushPara(); closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/,''))}</blockquote>`; continue; }
      const ul = line.match(/^[-*]\s+(.+)$/);
      const ol = line.match(/^\d+[.)]\s+(.+)$/);
      if(ul || ol){
        flushPara(); const type = ul ? 'ul' : 'ol';
        if(list !== type){ closeList(); list=type; html += `<${type}>`; }
        html += `<li>${inline((ul||ol)[1])}</li>`; continue;
      }
      para.push(line);
    }
    flushPara(); closeList();
    return {html, toc};
  }
  function safeGetItem(k){ try { return window.localStorage ? localStorage.getItem(k) : null; } catch(e){ return null; } }
  function safeSetItem(k,v){ try { if(window.localStorage) localStorage.setItem(k,v); } catch(e){} }
  function safeRemoveItem(k){ try { if(window.localStorage) localStorage.removeItem(k); } catch(e){} }
  function loadProgress(){
    try { return JSON.parse(safeGetItem(progressKey) || '{}'); } catch(e){ return {}; }
  }
  function saveProgress(p){ safeSetItem(progressKey, JSON.stringify(p)); }
  function isDone(id){ return !!loadProgress()[id]; }
  function setDone(id, value=true){ const p=loadProgress(); if(value) p[id]=new Date().toISOString(); else delete p[id]; saveProgress(p); updateStats(); }

  const mistakesKey = 'medMistakes:v32';
  function allPracticeItems(typeFilter){
    const out=[];
    Object.entries(BANK.byCourse || {}).forEach(([cid,b]) => {
      ['qcm','case','vf'].forEach(tp => {
        if(typeFilter && tp !== typeFilter) return;
        practiceItemsFromBank(b, tp).forEach(item => out.push({...item, practiceType:tp}));
      });
    });
    return out;
  }
  function itemTypeFromPage(){ return document.body.dataset.practiceType || 'qcm'; }
  function loadMistakes(){ try { return JSON.parse(safeGetItem(mistakesKey) || '{}'); } catch(e){ return {}; } }
  function saveMistakes(obj){ safeSetItem(mistakesKey, JSON.stringify(obj || {})); }
  function mistakeDelayDays(record){
    if(record && record.unknown) return 1;
    return 2;
  }
  function storeMistake(item, type, record){
    if(!item) return;
    const data = loadMistakes();
    const now = Date.now();
    const prev = data[item.id] || {};
    const delay = mistakeDelayDays(record);
    data[item.id] = {
      id:item.id, type:type || item.practiceType || itemTypeFromPage(), courseId:item.courseId, moduleId:item.moduleId,
      moduleNumber:item.moduleNumber, moduleTitle:item.moduleTitle, courseTitle:(courseById(item.courseId)||{}).title || item.courseId,
      difficulty:practiceDifficultyKey(item), question:cleanGeneratedText(item.question || item.stem || ''), stem:cleanGeneratedText(item.stem || ''),
      answerIndex:item.answerIndex, options:item.options || [], explanation:item.explanation || '',
      attempts:(prev.attempts || 0) + 1, wrongs:(prev.wrongs || 0) + 1, unknowns:(prev.unknowns || 0) + (record && record.unknown ? 1 : 0),
      lastChosen:record ? record.chosen : null, lastAt:now, nextReviewAt:now + delay*86400000, mastered:false
    };
    saveMistakes(data);
  }
  function clearMistake(id){ const data=loadMistakes(); if(data[id]){ delete data[id]; saveMistakes(data); } }
  function markMistakeMastered(id){ const data=loadMistakes(); if(data[id]){ data[id].mastered=true; data[id].masteredAt=Date.now(); data[id].nextReviewAt=Date.now()+30*86400000; saveMistakes(data); } }
  function dueMistakes(){ const now=Date.now(); return Object.values(loadMistakes()).filter(x => x && !x.mastered && (!x.nextReviewAt || x.nextReviewAt <= now)); }
  function pendingMistakes(){ return Object.values(loadMistakes()).filter(x => x && !x.mastered); }
  function findPracticeItem(id, type){
    return allPracticeItems(type).find(x => x.id === id) || allPracticeItems().find(x => x.id === id);
  }

  const confidenceKey = 'medConfidence:v46';
  function loadConfidence(){ try { return JSON.parse(safeGetItem(confidenceKey) || '{}'); } catch(e){ return {}; } }
  function saveConfidence(obj){ safeSetItem(confidenceKey, JSON.stringify(obj || {})); }
  function setConfidence(item, level, type, record){
    if(!item || !item.id) return;
    const data = loadConfidence();
    data[item.id] = {level, at:Date.now(), type:type || item.practiceType || itemTypeFromPage(), courseId:item.courseId, moduleId:item.moduleId};
    saveConfidence(data);
    if((level === 'hesitated' || level === 'guessed') && record && record.correct){
      const clone = Object.assign({}, record, {confidence:level, correct:false, hesitated:true});
      storeMistake(item, type, clone);
    }
    if(level === 'sure' && record && record.correct){ clearMistake(item.id); }
  }
  function confidenceFor(id){ const data=loadConfidence(); return data && data[id] ? data[id].level : ''; }
  function feedbackPayload(item, type){
    const course = courseById(item.courseId) || {};
    const correctIdx = Number(item.answerIndex || 0);
    return {
      language: lang(), page_url: location.href, question_type:type || item.practiceType || itemTypeFromPage(),
      course_id:item.courseId || '', course_title:ltitle(course.title || item.courseId || ''), module_id:item.moduleId || '', module_title:ltitle(item.moduleTitle || ''), module_number:item.moduleNumber || '',
      question_id:item.id || '', difficulty:difficultyLabel(practiceDifficultyKey(item)), question:lt(cleanGeneratedText(item.question || item.stem || '')), options:(item.options || []).map((o,i)=>`${optionLetter(i)}. ${lt(cleanGeneratedText(o))}`).join('\n'), correct_index:type==='vf' ? (correctIdx===0?t('true'):t('false')) : optionLetter(correctIdx), correct_answer:lt(cleanGeneratedText((item.options||[])[correctIdx] || ''))
    };
  }
  function ensureFeedbackModal(){
    let modal = document.querySelector('#questionFeedbackModal');
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = 'questionFeedbackModal';
    modal.className = 'feedback-modal';
    modal.hidden = true;
    modal.innerHTML = `<div class="feedback-backdrop" data-feedback-close="1"></div><section class="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle"><form name="question-feedback" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/">
      <input type="hidden" name="form-name" value="question-feedback" /><p class="hidden"><label>Ne pas remplir <input name="bot-field" /></label></p>
      <div class="feedback-head"><div><p class="eyebrow">Feedback</p><h2 id="feedbackTitle">${t('feedbackTitle')}</h2></div><button type="button" class="feedback-x" data-feedback-close="1">×</button></div>
      <p class="feedback-intro">${t('feedbackIntro')}</p>
      <label><span>${t('feedbackProblem')}</span><select name="issue_type" required>
        <option value="wrong_answer">${t('issueWrongAnswer')}</option><option value="bad_wording">${t('issueBadWording')}</option><option value="translation">${t('issueTranslation')}</option><option value="ambiguous">${t('issueAmbiguous')}</option><option value="explanation">${t('issueExplanation')}</option><option value="course_mismatch">${t('issueMismatch')}</option><option value="bug">${t('issueBug')}</option><option value="other">${t('issueOther')}</option>
      </select></label>
      <label><span>${t('feedbackComment')}</span><textarea name="comment" rows="4" placeholder="..." required></textarea></label>
      ${['language','page_url','question_type','course_id','course_title','module_id','module_title','module_number','question_id','difficulty','question','options','correct_index','correct_answer'].map(n=>`<input type="hidden" name="${n}" />`).join('')}
      <div class="feedback-actions"><button type="submit" class="btn primary">${t('feedbackSend')}</button><button type="button" class="btn ghost" data-feedback-close="1">${t('feedbackCancel')}</button></div>
    </form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target.closest('[data-feedback-close]')) modal.hidden = true; });
    modal.querySelector('form').addEventListener('submit', () => toast(t('feedbackThanks')));
    return modal;
  }
  function openFeedbackModal(item, type){
    const modal = ensureFeedbackModal();
    const payload = feedbackPayload(item, type);
    Object.entries(payload).forEach(([k,v]) => { const el=modal.querySelector(`[name="${k}"]`); if(el) el.value = v; });
    const ta = modal.querySelector('textarea[name="comment"]'); if(ta) ta.value='';
    modal.hidden = false;
    setTimeout(()=>{ const first=modal.querySelector('select,textarea,button'); if(first) first.focus(); }, 20);
  }

  function retryUrlForMistake(m){
    const type = m.type || 'qcm';
    const base = type === 'case' ? 'cas-cliniques.html' : (type === 'vf' ? 'vrai-faux.html' : 'qcm.html');
    const q = new URLSearchParams();
    if(m.courseId) q.set('course', m.courseId);
    if(m.moduleId) q.set('module', m.moduleId);
    if(m.difficulty && m.difficulty !== 'all') q.set('difficulty', m.difficulty);
    return base + '?' + q.toString();
  }
  function getLastModule(){
    const p=loadProgress();
    const ids=Object.keys(p||{}).sort((a,b)=>String(p[b]).localeCompare(String(p[a])));
    return ids.length ? moduleById(ids[0]) : allModules[0];
  }
  function weakCourseSummary(){
    const counts={};
    pendingMistakes().forEach(m => { const k=m.courseId || 'all'; counts[k]=(counts[k]||0)+1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([cid,n]) => ({course:courseById(cid), count:n}));
  }
  function makeUltraSheetMarkdown(m){
    const heads=(m.headings||[]).filter(h => h && !/preguntas|mini caso|frases finales/i.test(h)).slice(0,8);
    const exam=(m.exam||[]).join('\n\n').replace(/#+\s*/g,'').replace(/\|/g,' ').slice(0,1200);
    return `## Ficha ultra-rápida\n\n**Objetivo:** repasar en 3–5 minutos lo que más probablemente cae en examen.\n\n## Ideas esenciales\n\n${heads.map(h => `- ${String(h).replace(/^\d+[.)]?\s*/,'')}`).join('\n') || '- Revisa el curso completo para ver los mecanismos principales.'}\n\n## Mecanismo en una línea\n\nRelaciona siempre la definición con el mecanismo, la consecuencia funcional y la traducción clínica.\n\n## Trampas rápidas\n\n- No memorizar palabras aisladas: identifica causa → mecanismo → consecuencia.\n- No invertir iones, células, fases, enzimas ni localizaciones.\n- En un caso clínico, identifica primero el dato clave y luego el mecanismo que lo explica.\n\n## Extracto de examen\n\n${exam || 'Los puntos de examen aparecerán aquí cuando estén disponibles en el módulo.'}`;
  }

  function optionPlain(item, idx){ return cleanGeneratedText((item.options || [])[idx] || ''); }
  function correctionHtml(item, type, record, compact=false){
    const correctIdx=Number(item.answerIndex || 0);
    const correctLabel = type === 'vf' ? (correctIdx===0?t('true'):t('false')) : optionLetter(correctIdx);
    const correctText = optionPlain(item, correctIdx);
    const chosen = record ? Number(record.chosen) : null;
    const chosenText = chosen >= 0 ? optionPlain(item, chosen) : '';
    const exp = cleanGeneratedText(item.explanation || `La respuesta correcta es la que respeta el mecanismo del módulo ${item.moduleNumber || ''}.`);
    const isCorrect = record && record.correct;
    const verdictClass = record && record.unknown ? 'unknown' : (isCorrect ? 'ok' : 'ko');
    const verdictText = record && record.unknown ? 'Réponse affichée' : (isCorrect ? 'Correct' : 'À corriger');
    const diag = errorDiagnosis(item, type, record || {});
    const wrongs = (item.options || []).map((opt,idx)=>({opt,idx})).filter(x=>x.idx!==correctIdx).map(x => {
      const label = type === 'vf' ? (x.idx===0?t('true'):t('false')) : optionLetter(x.idx);
      return `<li><div><strong>${label}.</strong> ${escapeHtml(lt(cleanGeneratedText(x.opt)))}</div><small>${escapeHtml(lt(distractorReason(x.opt, item)))}</small></li>`;
    }).join('');
    const courseLink = item.moduleId ? `module.html?id=${encodeURIComponent(item.moduleId)}` : '#';
    return `<div class="detailed-correction v32-correction ${compact?'compact-correction':''}">
      <div class="correction-verdict ${verdictClass}">
        <strong>${verdictText}</strong>
        <span>${escapeHtml(lt(questionMicroObjective(item, type)))}</span>
      </div>
      ${record && record.unknown ? `<p class="correction-note">${t('dontKnowChosen')}</p>` : ''}
      ${chosen !== null && chosen >= 0 ? `<div class="answer-compare"><div><span>${t('yourAnswer')}</span><strong>${type==='vf'?(chosen===0?t('true'):t('false')):optionLetter(chosen)}</strong><p>${escapeHtml(lt(chosenText))}</p></div><div><span>${t('correctAnswerLabel')}</span><strong>${correctLabel}</strong><p>${escapeHtml(lt(correctText))}</p></div></div>` : `<section><strong>${t('correctAnswer')}: ${correctLabel}</strong><p>${escapeHtml(lt(correctText))}</p></section>`}
      <section class="correction-diagnosis"><strong>${t('pedagogicDiagnosis')}</strong><p>${escapeHtml(lt(diag))}</p></section>
      <section><strong>${t('whyCorrect')}</strong><p>${escapeHtml(lt(exp))}</p></section>
      <section><strong>${t('whyWrong')}</strong><ul class="distractor-list">${wrongs}</ul></section>
      <section class="takeaway-box"><strong>${t('keyTakeaway')}</strong><p>${escapeHtml(lt('Pour maîtriser la question, formule mentalement : donnée du cours → mécanisme → conséquence. Toute option qui inverse une étape devient fausse, même si elle contient des mots justes.'))}</p></section>
      ${record ? `<section class="confidence-panel" data-question-id="${escapeHtml(item.id)}"><strong>${t('confidenceTitle')}</strong><small>${t('confidenceHelp')}</small><div><button type="button" class="confidence-btn ${confidenceFor(item.id)==='sure'?'active':''}" data-action="confidence" data-confidence="sure">${t('confidenceSure')}</button><button type="button" class="confidence-btn ${confidenceFor(item.id)==='hesitated'?'active':''}" data-action="confidence" data-confidence="hesitated">${t('confidenceHesitated')}</button><button type="button" class="confidence-btn ${confidenceFor(item.id)==='guessed'?'active':''}" data-action="confidence" data-confidence="guessed">${t('confidenceGuessed')}</button></div></section>` : ''}
      <div class="module-actions slim correction-actions"><a class="btn ghost" href="${courseLink}">${t('openCourseSection')}</a><button class="btn ghost" type="button" data-action="mark-review">${t('reviewTag')}</button></div>
    </div>`;
  }
  function updateStats(){
    const c = $('#statCursoes'), m = $('#statModules'), p = $('#statProgress');
    if(c) c.textContent = courses.length;
    if(m) m.textContent = allModules.length;
    if(p){ const done = allModules.filter(x => isDone(x.id)).length; p.textContent = allModules.length ? Math.round(done/allModules.length*100)+'%' : '0%'; }
    renderSubjectProgressOverview();
  }
  function courseProgress(course){
    const mods = course.modules || [];
    if(!mods.length) return {done:0,total:0,pct:0};
    const done = mods.filter(m => isDone(m.id)).length;
    return {done,total:mods.length,pct:Math.round(done/mods.length*100)};
  }
  function resetCourseProgress(courseId){
    const course = courseById(courseId);
    if(!course) return;
    const progress = loadProgress();
    (course.modules || []).forEach(m => { delete progress[m.id]; });
    saveProgress(progress);
    updateStats();
    toast(t('subjectProgressReset'));
  }
  function renderSubjectProgressOverview(){
    const grid = $('#subjectProgressGrid'); if(!grid) return;
    grid.innerHTML = courses.map(c => {
      const pr = courseProgress(c);
      const href = c.moduleCount ? subjectUrl(c.id) : '#';
      return `<article class="subject-progress-card">
        <a class="subject-progress-link" href="${href}" ${c.moduleCount?'':'aria-disabled="true"'}>
          <div><strong>${escapeHtml(ltitle(c.title))}</strong><span>${c.moduleCount} ${t('modules')}</span></div>
          <div class="subject-progress-pct">${pr.pct}%</div>
          <div class="mini-progress"><i style="width:${pr.pct}%"></i></div>
        </a>
        <button class="subject-reset-btn" type="button" data-course-id="${escapeHtml(c.id)}" ${c.moduleCount?'':'disabled'}>${t('resetSubjectProgress')}</button>
      </article>`;
    }).join('');
    grid.querySelectorAll('.subject-reset-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        resetCourseProgress(btn.dataset.courseId);
      });
    });
  }
  function courseById(id){ return courses.find(c => c.id === id) || courses.find(c => (c.modules||[]).length); }
  function moduleById(id){ return allModules.find(m => m.id === id) || allModules[0]; }
  function moduleUrl(m){ return `module.html?id=${encodeURIComponent(m.id)}`; }
  function subjectUrl(courseId){ return `matiere.html?course=${encodeURIComponent(courseId)}`; }
  function qcmUrl(courseId){ return courseId ? `qcm.html?course=${encodeURIComponent(courseId)}` : 'qcm.html'; }
  function caseUrl(courseId){ return courseId ? `cas-cliniques.html?course=${encodeURIComponent(courseId)}` : 'cas-cliniques.html'; }
  function truthUrl(courseId){ return courseId ? `vrai-faux.html?course=${encodeURIComponent(courseId)}` : 'vrai-faux.html'; }
  function moduleQcmUrl(m){ return `qcm.html?course=${encodeURIComponent(m.courseId)}&module=${encodeURIComponent(m.id)}`; }
  function moduleCaseUrl(m){ return `cas-cliniques.html?course=${encodeURIComponent(m.courseId)}&module=${encodeURIComponent(m.id)}`; }
  function moduleTruthUrl(m){ return `vrai-faux.html?course=${encodeURIComponent(m.courseId)}&module=${encodeURIComponent(m.id)}`; }
  function shortPlan(headings=[], limit=5){
    const bad = /^(plan del m[oó]dulo|objetivos de aprendizaje|preguntas integradoras|mini caso cl[ií]nico|frases finales|resumen|aplicaci[oó]n cl[ií]nica|errores frecuentes)$/i;
    const questionLike = /^(si|qu[eé]|cu[aá]l|cu[aá]ndo|c[oó]mo|por qu[eé]|d[oó]nde)\b/i;
    const useful = (headings||[])
      .map(h => String(h||'').replace(/^\d{1,2}[.)]?\s+/, '').trim())
      .filter(h => h && !bad.test(h) && !questionLike.test(h) && !h.includes('?'))
      .slice(0, limit);
    if(!useful.length) return `<div class="module-plan"><strong>${t('coursePlan')}</strong><p class="plan-empty">${t('planEmpty')}</p></div>`;
    const more = (headings||[]).length > useful.length;
    return `<div class="module-plan"><strong>${t('coursePlan')}</strong><ol>${useful.map(h => `<li>${escapeHtml(lt(h))}</li>`).join('')}${more?'<li class="etc">…</li>':''}</ol></div>`;
  }
  function toast(msg){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),1700);
  }
  function setupMenu(){
    const toggle = $('#menuToggle'), links = $('#navLinks');
    if(toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
  }


  Object.assign(UI.es, {
    donateTitle:'Apoya el proyecto',
    donateText:'El sitio seguirá siendo gratuito y abierto para todos. Una pequeña contribución ayuda a pagar el alojamiento, mejorar los cursos y mantener accesibles las herramientas de entrenamiento.',
    donateJuliusTitle:'Hasta Julius diría: “Gratis para ti… pero el servidor no trabaja gratis.”',
    donateJuliusText:'Un pequeño Pix mantiene despiertos los QCM.',
    pixHint:'',
    scanPix:''
  });
  Object.assign(UI.fr, {
    donateTitle:'Soutenir le projet',
    donateText:'Le site restera gratuit et ouvert à tous. Une petite contribution aide à payer l’hébergement, améliorer les cours et garder les outils d’entraînement accessibles.',
    donateJuliusTitle:'Même Julius dirait : « Gratuit pour toi… mais le serveur ne travaille pas gratuitement. »',
    donateJuliusText:'Un petit Pix garde les QCM réveillés.',
    pixHint:'',
    scanPix:''
  });
  Object.assign(UI.br, {
    donateTitle:'Apoie o projeto',
    donateText:'O site continuará gratuito e aberto para todos. Uma pequena contribuição ajuda a pagar a hospedagem, melhorar os cursos e manter acessíveis as ferramentas de treino.',
    donateJuliusTitle:'Até o Julius diria: “Grátis para você… mas o servidor não trabalha de graça.”',
    donateJuliusText:'Um pequeno Pix mantém os QCM acordados.',
    pixHint:'',
    scanPix:''
  });


Object.assign(UI.es, {
  supportRibbonPrefix:'Proyecto solidario',
  supportRibbonCta:'Apoyar',
  supportRibbonClose:'Cerrar el aviso de apoyo'
});
Object.assign(UI.fr, {
  supportRibbonPrefix:'Projet solidaire',
  supportRibbonCta:'Soutenir',
  supportRibbonClose:'Fermer le bandeau de soutien'
});
Object.assign(UI.br, {
  supportRibbonPrefix:'Projeto solidário',
  supportRibbonCta:'Apoiar',
  supportRibbonClose:'Fechar o aviso de apoio'
});

const SUPPORT_RIBBON_MESSAGES = {
  es:[
    'Proyecto gratuito · Si este sitio te ayuda a estudiar, un pequeño Pix ayuda a mantenerlo en línea.',
    '58 módulos, QCM, casos clínicos y verdadero/falso gratuitos · el apoyo voluntario ayuda a sostener el proyecto.',
    'Si el sitio te ahorra tiempo, un pequeño Pix ayuda a pagar el alojamiento y mejorar los cursos.',
    'El contenido sigue abierto para todos · el apoyo ayuda a mantener las herramientas accesibles.'
  ],
  fr:[
    'Projet gratuit · Si ce site t’aide à réviser, un petit Pix aide à le garder en ligne.',
    '58 modules, QCM, cas cliniques et vrai/faux gratuits · le soutien volontaire aide à faire durer le projet.',
    'Si ce site te fait gagner du temps, un petit Pix aide à payer l’hébergement et à améliorer les cours.',
    'Le contenu reste ouvert à tous · le soutien aide à garder les outils accessibles.'
  ],
  br:[
    'Projeto gratuito · Se este site te ajuda a estudar, um pequeno Pix ajuda a mantê-lo no ar.',
    '58 módulos, QCM, casos clínicos e verdadeiro/falso gratuitos · o apoio voluntário ajuda a sustentar o projeto.',
    'Se o site te faz ganhar tempo, um pequeno Pix ajuda a pagar a hospedagem e melhorar os cursos.',
    'O conteúdo continua aberto para todos · o apoio ajuda a manter as ferramentas acessíveis.'
  ]
};

  
  Object.assign(UI.es, {
    aboutEyebrow:'Historia del proyecto',
    aboutTitle:'Un sitio que nació de un problema muy simple: estudiar medicina exige orden.',
    aboutLead:'Med Cursos fue creado para transformar cursos largos, apuntes dispersos y repasos estresantes en un espacio claro: leer, entender, entrenar y corregir.',
    aboutStory1:'Cuando estudias medicina, lo más difícil no es solo la cantidad. También es saber qué repasar, en qué orden y cómo transformar una explicación de clase en una respuesta correcta el día del examen.',
    aboutStory2:'Med Cursos nació de esa realidad: estudiantes con poco tiempo, muchas materias, idiomas diferentes, documentos pesados y la necesidad de una herramienta simple que acompañe sin complicar.',
    aboutStory3:'El sitio reúne cursos, fichas, QCM, casos clínicos y verdadero/falso en una lógica activa. La idea no es leer de forma pasiva, sino volver sobre los errores, detectar puntos débiles y progresar serie tras serie.',
    aboutStory4:'El proyecto se mantiene gratuito. La idea es que el acceso a lo básico — entender un mecanismo, revisar un módulo, entrenar antes de un examen — no dependa solamente de poder pagar una plataforma.',
    aboutQuote:'“Si este sitio le ahorra una hora de repaso a un estudiante, ya tiene una razón para existir.”',
    aboutHumanTitle:'Detrás del sitio',
    aboutHumanText:'Detrás de Med Cursos hay un estudiante de medicina que conoció la misma dificultad: organizar mucha información, pasar de un idioma a otro y buscar una forma más directa de aprender sin perderse.',
    aboutHumanText2:'El sitio no pretende reemplazar profesores, libros ni clases oficiales. Sirve como puente: un lugar para ordenar, entrenar y volver más fuerte sobre los temas que bloquean.',
    aboutCreatorEyebrow:'Creador del proyecto',
    aboutCreatorTitle:'Un proyecto de estudiante, construido para estudiantes.',
    aboutCreatorText:'La prioridad es mantener una interfaz clara, herramientas útiles y acceso abierto. Los comentarios de los usuarios ayudan a corregir errores y mejorar el contenido progresivamente.',
    aboutPrinciplesTitle:'Principios del sitio',
    aboutPrinciple1:'Claridad antes que decoración.',
    aboutPrinciple2:'Repaso activo antes que lectura pasiva.',
    aboutPrinciple3:'Correcciones abiertas gracias a los reportes.',
    aboutPrinciple4:'Acceso gratuito, apoyo voluntario.',
    aboutSupportHeading:'Ayudar al sitio es ayudar a que las herramientas sigan accesibles.',
    aboutSupportLong:'El apoyo voluntario sirve para mantener la hospedaje, mejorar la experiencia móvil, corregir preguntas y seguir estructurando contenidos.',
    legalEyebrow:'Marco de uso',
    legalTitle:'Aviso, límites y uso educativo',
    legalLead:'Med Cursos es una herramienta de estudio. El contenido puede ayudar a repasar y entrenar, pero siempre debe usarse con pensamiento crítico y verificación académica.',
    legalEducationalText:'Los contenidos publicados en Med Cursos están destinados al aprendizaje, la memorización y el entrenamiento. No constituyen un documento oficial de facultad, un protocolo hospitalario o una recomendación institucional.',
    legalEducationalText2:'Antes de un examen o de un uso académico importante, el estudiante siempre debe contrastar la información con sus clases, bibliografía e indicaciones docentes.',
    legalMedicalText:'La información del sitio no debe usarse para diagnosticar, tratar, prescribir, modificar una conducta clínica o tomar una decisión sobre un paciente real.',
    legalMedicalText2:'El sitio está dirigido a estudiantes y sirve para comprender nociones. Toda situación médica real debe ser evaluada por un profesional de salud calificado.',
    legalErrorsText:'A pesar de las verificaciones, pueden quedar errores, traducciones imperfectas, ambigüedades o formulaciones incompletas. Por eso el sitio incluye botones de reporte en las preguntas y una página de contacto.',
    legalErrorsText2:'Los reportes ayudan a mejorar progresivamente la calidad pedagógica del sitio, pero una corrección puede requerir tiempo.',
    legalFormsText:'Los formularios de contacto y reporte se envían mediante Netlify Forms. Los mensajes pueden incluir el tipo de problema, el comentario y, para los QCM, los datos técnicos necesarios para identificar la pregunta.',
    legalFormsText2:'El usuario no debe enviar datos médicos personales sensibles, expedientes de pacientes ni información que permita identificar a una persona enferma.',
    legalPrivacyText:'El sitio no pide cuenta de usuario para acceder a cursos y ejercicios. Los datos de progreso se conservan principalmente de forma local en el navegador del usuario.',
    legalPrivacyText2:'Si se deja un email en el formulario de contacto, sirve únicamente para permitir una eventual respuesta. El email no es necesario para usar el sitio.',
    legalFinalTitle:'Resumen simple',
    legalFinalText:'Med Cursos ayuda a estudiar. No reemplaza clases oficiales, libros, docentes ni profesionales de salud. En caso de duda, siempre hay que verificar.'
  });

  Object.assign(UI.fr, {
    aboutEyebrow:'Histoire du projet',
    aboutTitle:'Un site né d’un problème très simple : étudier médecine demande de l’ordre.',
    aboutLead:'Med Cursos a été créé pour transformer des cours longs, des notes dispersées et des révisions stressantes en un espace clair : lire, comprendre, s’entraîner, corriger.',
    aboutStory1:'Quand on étudie médecine, le plus difficile n’est pas seulement la quantité. C’est de savoir quoi revoir, dans quel ordre, et comment transformer une explication de cours en une réponse correcte le jour de l’examen.',
    aboutStory2:'Med Cursos est parti de cette réalité : des étudiants avec peu de temps, beaucoup de matières, des langues différentes, des documents parfois lourds, et le besoin d’un outil simple qui ne juge pas, ne complique pas, mais accompagne.',
    aboutStory3:'Le site rassemble les cours, les fiches, les QCM, les cas cliniques et les vrai/faux dans une logique active. L’objectif n’est pas de lire passivement, mais de revenir sur ses erreurs, repérer ses points faibles et progresser série après série.',
    aboutStory4:'Le projet reste volontairement gratuit. L’idée est que l’accès au travail de base — comprendre un mécanisme, réviser un module, s’entraîner avant un examen — ne devrait pas être réservé uniquement à ceux qui peuvent payer une plateforme.',
    aboutQuote:'“Si ce site fait gagner une heure de révision à un étudiant, il a déjà une raison d’exister.”',
    aboutHumanTitle:'Derrière le site',
    aboutHumanText:'Derrière Med Cursos, il y a un étudiant en médecine qui a connu la même difficulté : organiser beaucoup d’informations, passer d’une langue à l’autre, et chercher une méthode plus directe pour apprendre sans se perdre.',
    aboutHumanText2:'Le site n’a pas vocation à remplacer les professeurs, les livres ou les cours officiels. Il sert de pont : un endroit pour remettre de l’ordre, s’entraîner et revenir plus fort sur les notions qui bloquent.',
    aboutCreatorEyebrow:'Créateur du projet',
    aboutCreatorTitle:'Un projet étudiant, construit pour les étudiants.',
    aboutCreatorText:'La priorité est de garder une interface claire, des outils utiles et un accès ouvert. Les retours des utilisateurs servent à corriger les erreurs et à améliorer progressivement le contenu.',
    aboutPrinciplesTitle:'Principes du site',
    aboutPrinciple1:'Clarté avant décoration.',
    aboutPrinciple2:'Révision active avant lecture passive.',
    aboutPrinciple3:'Corrections ouvertes grâce aux signalements.',
    aboutPrinciple4:'Accès gratuit, soutien volontaire.',
    aboutSupportHeading:'Aider le site, c’est aider les outils à rester accessibles.',
    aboutSupportLong:'Le soutien volontaire sert à maintenir l’hébergement, améliorer l’expérience mobile, corriger les questions et continuer à structurer les contenus.',
    legalEyebrow:'Cadre d’utilisation',
    legalTitle:'Mentions, limites et usage éducatif',
    legalLead:'Med Cursos est un outil d’étude. Le contenu peut aider à réviser et à s’entraîner, mais il doit toujours être utilisé avec esprit critique et vérification académique.',
    legalEducationalText:'Les contenus publiés sur Med Cursos sont destinés à l’apprentissage, à la mémorisation et à l’entraînement. Ils ne constituent pas un document officiel de faculté, un protocole hospitalier ou une recommandation institutionnelle.',
    legalEducationalText2:'Avant un examen ou une utilisation académique importante, l’étudiant doit toujours confronter les informations à ses cours, à sa bibliographie et aux consignes de ses enseignants.',
    legalMedicalText:'Les informations du site ne doivent pas être utilisées pour diagnostiquer, traiter, prescrire, modifier une conduite clinique ou prendre une décision concernant un patient réel.',
    legalMedicalText2:'Le site s’adresse aux étudiants et sert à comprendre des notions. Toute situation médicale réelle doit être évaluée par un professionnel de santé qualifié.',
    legalErrorsText:'Malgré les vérifications, des erreurs, traductions imparfaites, ambiguïtés ou formulations incomplètes peuvent rester présentes. Le site inclut donc des boutons de signalement dans les questions et une page de contact.',
    legalErrorsText2:'Les signalements servent à améliorer progressivement la qualité pédagogique du site, mais une correction peut nécessiter un délai.',
    legalFormsText:'Les formulaires de contact et de signalement sont envoyés via Netlify Forms. Les messages peuvent contenir le type de problème, le commentaire, et pour les QCM les informations techniques nécessaires à identifier la question concernée.',
    legalFormsText2:'L’utilisateur ne doit pas envoyer de données médicales personnelles sensibles, de dossier patient ou d’informations permettant d’identifier une personne malade.',
    legalPrivacyText:'Le site ne demande pas de compte utilisateur pour accéder aux cours et exercices. Les données de progression sont principalement conservées localement dans le navigateur de l’utilisateur.',
    legalPrivacyText2:'Si un email est laissé dans le formulaire de contact, il sert uniquement à permettre une réponse éventuelle. L’email n’est pas nécessaire pour utiliser le site.',
    legalFinalTitle:'Résumé simple',
    legalFinalText:'Med Cursos aide à étudier. Il ne remplace pas les cours officiels, les livres, les enseignants ni un professionnel de santé. En cas de doute, il faut toujours vérifier.'
  });

  Object.assign(UI.br, {
    aboutEyebrow:'História do projeto',
    aboutTitle:'Um site que nasceu de um problema muito simples: estudar medicina exige ordem.',
    aboutLead:'Med Cursos foi criado para transformar cursos longos, anotações dispersas e revisões estressantes em um espaço claro: ler, entender, treinar e corrigir.',
    aboutStory1:'Quando se estuda medicina, o mais difícil não é apenas a quantidade. É saber o que revisar, em que ordem e como transformar uma explicação de aula em uma resposta correta no dia da prova.',
    aboutStory2:'Med Cursos nasceu dessa realidade: estudantes com pouco tempo, muitas matérias, idiomas diferentes, documentos pesados e a necessidade de uma ferramenta simples que acompanhe sem complicar.',
    aboutStory3:'O site reúne cursos, fichas, QCM, casos clínicos e verdadeiro/falso em uma lógica ativa. A ideia não é ler passivamente, mas voltar aos erros, detectar pontos fracos e progredir série após série.',
    aboutStory4:'O projeto continua gratuito. A ideia é que o acesso ao básico — entender um mecanismo, revisar um módulo, treinar antes de uma prova — não dependa apenas de poder pagar uma plataforma.',
    aboutQuote:'“Se este site economiza uma hora de revisão de um estudante, ele já tem uma razão para existir.”',
    aboutHumanTitle:'Por trás do site',
    aboutHumanText:'Por trás do Med Cursos existe um estudante de medicina que conheceu a mesma dificuldade: organizar muita informação, passar de um idioma para outro e buscar uma forma mais direta de aprender sem se perder.',
    aboutHumanText2:'O site não pretende substituir professores, livros nem aulas oficiais. Ele serve como ponte: um lugar para organizar, treinar e voltar mais forte aos temas que bloqueiam.',
    aboutCreatorEyebrow:'Criador do projeto',
    aboutCreatorTitle:'Um projeto estudantil, construído para estudantes.',
    aboutCreatorText:'A prioridade é manter uma interface clara, ferramentas úteis e acesso aberto. Os retornos dos usuários ajudam a corrigir erros e melhorar o conteúdo progressivamente.',
    aboutPrinciplesTitle:'Princípios do site',
    aboutPrinciple1:'Clareza antes de decoração.',
    aboutPrinciple2:'Revisão ativa antes de leitura passiva.',
    aboutPrinciple3:'Correções abertas graças aos reportes.',
    aboutPrinciple4:'Acesso gratuito, apoio voluntário.',
    aboutSupportHeading:'Ajudar o site é ajudar as ferramentas a continuarem acessíveis.',
    aboutSupportLong:'O apoio voluntário serve para manter a hospedagem, melhorar a experiência mobile, corrigir perguntas e continuar estruturando conteúdos.',
    legalEyebrow:'Quadro de uso',
    legalTitle:'Aviso, limites e uso educativo',
    legalLead:'Med Cursos é uma ferramenta de estudo. O conteúdo pode ajudar a revisar e treinar, mas deve sempre ser usado com pensamento crítico e verificação acadêmica.',
    legalEducationalText:'Os conteúdos publicados no Med Cursos são destinados ao aprendizado, memorização e treinamento. Eles não constituem documento oficial de faculdade, protocolo hospitalar ou recomendação institucional.',
    legalEducationalText2:'Antes de uma prova ou de um uso acadêmico importante, o estudante deve sempre confrontar as informações com suas aulas, bibliografia e orientações dos professores.',
    legalMedicalText:'As informações do site não devem ser usadas para diagnosticar, tratar, prescrever, modificar conduta clínica ou tomar decisão sobre paciente real.',
    legalMedicalText2:'O site é destinado a estudantes e serve para compreender conceitos. Toda situação médica real deve ser avaliada por um profissional de saúde qualificado.',
    legalErrorsText:'Apesar das verificações, podem permanecer erros, traduções imperfeitas, ambiguidades ou formulações incompletas. O site inclui botões de reporte nas perguntas e uma página de contato.',
    legalErrorsText2:'Os reportes servem para melhorar progressivamente a qualidade pedagógica do site, mas uma correção pode exigir tempo.',
    legalFormsText:'Os formulários de contato e reporte são enviados via Netlify Forms. As mensagens podem conter o tipo de problema, o comentário e, para QCM, as informações técnicas necessárias para identificar a pergunta.',
    legalFormsText2:'O usuário não deve enviar dados médicos pessoais sensíveis, prontuários ou informações que permitam identificar uma pessoa doente.',
    legalPrivacyText:'O site não exige conta de usuário para acessar cursos e exercícios. Os dados de progresso são conservados principalmente localmente no navegador do usuário.',
    legalPrivacyText2:'Se um email for deixado no formulário de contato, ele serve apenas para permitir uma eventual resposta. O email não é necessário para usar o site.',
    legalFinalTitle:'Resumo simples',
    legalFinalText:'Med Cursos ajuda a estudar. Ele não substitui aulas oficiais, livros, professores nem profissionais de saúde. Em caso de dúvida, sempre verifique.'
  });



  Object.assign(UI.es, {
    currentSemesterBadge:'Semestre 3',
    currentSemesterText:'Contenido actual: materias del tercer semestre',
    semesterCatalogNote:'Las materias mostradas corresponden actualmente al tercer semestre. El sitio evolucionará después con los próximos semestres.',
    aboutScopeTitle:'Lo que cubre actualmente el sitio',
    aboutScopeText:'Med Cursos no pretende cubrir toda la medicina de una sola vez. Hoy, el sitio presenta sobre todo las materias del tercer semestre, porque sigue un recorrido real de estudiante y se construye al ritmo de los cursos estudiados.',
    aboutScopeText2:'Cuando empiece el semestre 4, se podrán añadir nuevos módulos progresivamente. El objetivo es que el sitio avance con el recorrido, semestre tras semestre, conservando los contenidos ya disponibles para los estudiantes que los necesiten.',
    aboutMethodTitle:'Cómo se construyen los contenidos',
    aboutMethodText:'Los contenidos se preparan a partir de un trabajo personal de estudio: apuntes, transcripciones de revisión, explicaciones escuchadas en clase, búsquedas complementarias y reorganización pedagógica.',
    aboutMethodText2:'La inteligencia artificial se utiliza como herramienta de ayuda para organizar la información, aclarar explicaciones, crear fichas y generar entrenamientos. El objetivo no es reemplazar a los profesores o libros, sino transformar un contenido bruto en un soporte de revisión más claro y activo.'
  });
  Object.assign(UI.fr, {
    currentSemesterBadge:'Semestre 3',
    currentSemesterText:'Contenu actuel : matières du troisième semestre',
    semesterCatalogNote:'Les matières affichées correspondent actuellement au troisième semestre. Le site évoluera ensuite avec les prochains semestres.',
    aboutScopeTitle:'Ce que le site couvre actuellement',
    aboutScopeText:'Med Cursos ne prétend pas couvrir toute la médecine d’un seul coup. Aujourd’hui, le site présente surtout les matières du troisième semestre, parce qu’il suit un parcours réel d’étudiant et se construit au rythme des cours étudiés.',
    aboutScopeText2:'Quand le semestre 4 commencera, de nouveaux modules pourront être ajoutés progressivement. L’objectif est que le site avance avec le parcours, semestre après semestre, tout en gardant les contenus déjà disponibles pour les étudiants qui en ont besoin.',
    aboutMethodTitle:'Comment les contenus sont construits',
    aboutMethodText:'Les contenus sont préparés à partir d’un travail personnel d’étude : notes, transcriptions de révision, explications entendues en cours, recherches complémentaires et restructuration pédagogique.',
    aboutMethodText2:'L’intelligence artificielle est utilisée comme outil d’aide pour organiser les informations, clarifier les explications, créer des fiches et générer des entraînements. Le but n’est pas de remplacer les professeurs ou les livres, mais de transformer un contenu brut en support de révision plus clair et plus actif.'
  });
  Object.assign(UI.br, {
    currentSemesterBadge:'Semestre 3',
    currentSemesterText:'Conteúdo atual: matérias do terceiro semestre',
    semesterCatalogNote:'As matérias exibidas correspondem atualmente ao terceiro semestre. O site evoluirá depois com os próximos semestres.',
    aboutScopeTitle:'O que o site cobre atualmente',
    aboutScopeText:'Med Cursos não pretende cobrir toda a medicina de uma vez. Hoje, o site apresenta principalmente as matérias do terceiro semestre, porque acompanha um percurso real de estudante e é construído no ritmo dos cursos estudados.',
    aboutScopeText2:'Quando o semestre 4 começar, novos módulos poderão ser adicionados progressivamente. O objetivo é que o site avance com o percurso, semestre após semestre, mantendo os conteúdos já disponíveis para os estudantes que precisarem deles.',
    aboutMethodTitle:'Como os conteúdos são construídos',
    aboutMethodText:'Os conteúdos são preparados a partir de um trabalho pessoal de estudo: anotações, transcrições de revisão, explicações ouvidas em aula, pesquisas complementares e reorganização pedagógica.',
    aboutMethodText2:'A inteligência artificial é usada como ferramenta de apoio para organizar informações, esclarecer explicações, criar fichas e gerar treinos. O objetivo não é substituir professores ou livros, mas transformar um conteúdo bruto em um material de revisão mais claro e ativo.'
  });


  Object.assign(UI.es, {
    pixModalTitle:'Escanea el QR Pix',
    pixModalText:'Abre la app de tu banco en el teléfono y escanea el QR. También puedes copiar el código Pix manualmente.',
    pixModalCopy:'Copiar código Pix',
    pixModalClose:'Cerrar',
    pixDesktopOpened:'QR Pix abierto para escanear.',
    pixMobileCopied:'Código Pix copiado. Abre tu app bancaria y pega el código Pix.'
  });
  Object.assign(UI.fr, {
    pixModalTitle:'Scanner le QR Pix',
    pixModalText:'Ouvre l’application de ta banque sur ton téléphone et scanne le QR. Tu peux aussi copier le code Pix manuellement.',
    pixModalCopy:'Copier le code Pix',
    pixModalClose:'Fermer',
    pixDesktopOpened:'QR Pix ouvert pour scan.',
    pixMobileCopied:'Code Pix copié. Ouvre ton application bancaire et colle le code Pix.'
  });
  Object.assign(UI.br, {
    pixModalTitle:'Escanear o QR Pix',
    pixModalText:'Abra o app do seu banco no celular e escaneie o QR. Você também pode copiar o código Pix manualmente.',
    pixModalCopy:'Copiar código Pix',
    pixModalClose:'Fechar',
    pixDesktopOpened:'QR Pix aberto para escanear.',
    pixMobileCopied:'Código Pix copiado. Abra seu app bancário e cole o código Pix.'
  });


  Object.assign(UI.es, {
    pixDropdownCopy:'Copiar',
    pixDropdownHint:'Escanea el QR con tu app bancaria o copia el código Pix.',
    pixDropdownAlt:'QR Pix de apoyo'
  });
  Object.assign(UI.fr, {
    pixDropdownCopy:'Copier',
    pixDropdownHint:'Scanne le QR avec ton application bancaire ou copie le code Pix.',
    pixDropdownAlt:'QR Pix de soutien'
  });
  Object.assign(UI.br, {
    pixDropdownCopy:'Copiar',
    pixDropdownHint:'Escaneie o QR com seu app bancário ou copie o código Pix.',
    pixDropdownAlt:'QR Pix de apoio'
  });

  const PIX_PAYLOAD = '00020126790014BR.GOV.BCB.PIX0136eecb3361-64a3-4b33-be01-8cb605fc87600217med curso website5204000053039865802BR5921DIEGO OLIVEIRA SANTOS6009Sao Paulo62290525REC6A374D87073C77736769996304AB14';

  async function copyText(text=''){
    const value = String(text || '');
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch(e){}
    try {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      area.style.pointerEvents = 'none';
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return !!ok;
    } catch(e){ return false; }
  }

  function isTouchLikeDevice(){
    const ua = navigator.userAgent || '';

    // v62 hard rule:
    // Copy Pix only for explicit mobile/tablet user agents.
    // Everything else, including MacBook/PC/Safari desktop, opens the QR modal.
    return /iPhone|iPod|iPad|Android|Windows Phone|Mobi|Mobile/i.test(ua);
  }

  function ensurePixModal(){
    let modal = document.querySelector('#pixSupportModal');
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = 'pixSupportModal';
    modal.className = 'pix-modal-overlay';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="pix-modal-card" role="dialog" aria-modal="true" aria-labelledby="pixModalTitle">
        <button class="pix-modal-close" type="button" data-pix-modal-close aria-label="${escapeHtml(t('pixModalClose') || 'Fermer')}">×</button>
        <div class="pix-modal-copy">
          <p class="eyebrow">${escapeHtml(t('supportRibbonPrefix') || 'Projet solidaire')}</p>
          <h2 id="pixModalTitle">${escapeHtml(t('pixModalTitle') || 'Scanner le QR Pix')}</h2>
          <p>${escapeHtml(t('pixModalText') || 'Scanne le QR ou copie le code Pix.')}</p>
          <button class="btn primary" type="button" data-pix-modal-copy>${escapeHtml(t('pixModalCopy') || t('copyPix') || 'Copier le code Pix')}</button>
        </div>
        <div class="pix-modal-qr">
          <img src="assets/pix-qr-code.jpeg" alt="QR Pix de soutien" />
        </div>
      </div>`;
    document.body.appendChild(modal);

    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('pix-modal-open');
    };

    modal.addEventListener('click', e => {
      if(e.target === modal || e.target.closest('[data-pix-modal-close]')) close();
    });

    const copyBtn = modal.querySelector('[data-pix-modal-copy]');
    if(copyBtn){
      copyBtn.addEventListener('click', async e => {
        e.preventDefault();
        const ok = await copyText(PIX_PAYLOAD);
        toast(ok ? t('pixCopied') : t('pixManualCopy'));
      });
    }

    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && !modal.hidden) close();
    });

    return modal;
  }

  function openPixModal(){
    const modal = ensurePixModal();
    modal.hidden = false;
    document.body.classList.add('pix-modal-open');
    const closeBtn = modal.querySelector('[data-pix-modal-close]');
    if(closeBtn) setTimeout(() => closeBtn.focus(), 0);
    toast(t('pixDesktopOpened') || t('pixModalTitle') || t('pixCopied'));
  }

  async function smartPixSupportAction(){
    // v64: always open QR modal. No device detection.
    // The modal still includes a button to copy the Pix code.
    openPixModal();
  }

  function setupPixSupport(){
    const field = $('#pixPayloadField');
    const copyBtn = $('#copyPixBtn');
    const qrBtn = $('#copyPixQr');
    if(field){
      field.value = PIX_PAYLOAD;
      if(!field.dataset.bound){
        field.dataset.bound = '1';
        const selectField = () => { try { field.focus(); field.select(); } catch(e){} };
        field.addEventListener('focus', selectField);
        field.addEventListener('click', selectField);
      }
    }
    const bindCopy = el => {
      if(!el || el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('click', async e => {
        e.preventDefault();
        const ok = await copyText(PIX_PAYLOAD);
        if(field){ try { field.focus(); field.select(); } catch(err){} }
        toast(ok ? t('pixCopied') : t('pixManualCopy'));
      });
    };
    bindCopy(copyBtn);
    bindCopy(qrBtn);
  }


function setupSupportRibbon(){
  const host = document.querySelector('.site-header');
  if(!host || document.querySelector('#supportRibbon')) return;
  if(safeGetItem('supportRibbonDismissed') === '1') return;
  const ribbon = document.createElement('div');
  ribbon.className = 'support-ribbon';
  ribbon.id = 'supportRibbon';
  ribbon.innerHTML = `
    <div class="support-ribbon-inner">
      <span class="support-ribbon-prefix">${escapeHtml(t('supportRibbonPrefix') || 'Projet solidaire')}</span>
      <div class="support-ribbon-message-wrap"><span class="support-ribbon-message" id="supportRibbonMessage"></span></div>
      <button class="support-ribbon-cta" id="supportRibbonCta" type="button" aria-expanded="false" aria-controls="supportPixDropdown">${escapeHtml(t('supportRibbonCta') || 'Soutenir')}</button>
      <button class="support-ribbon-close" id="supportRibbonClose" type="button" aria-label="${escapeHtml(t('supportRibbonClose') || 'Fermer')}">×</button>
    </div>
    <div class="support-pix-dropdown" id="supportPixDropdown" hidden>
      <div class="support-pix-dropdown-card">
        <img src="assets/pix-qr-code.jpeg" alt="${escapeHtml(t('pixDropdownAlt') || 'QR Pix')}" />
        <p>${escapeHtml(t('pixDropdownHint') || 'Scanne le QR ou copie le code Pix.')}</p>
        <button class="btn primary support-pix-copy" id="supportPixCopy" type="button">${escapeHtml(t('pixDropdownCopy') || 'Copier')}</button>
      </div>
    </div>`;
  host.appendChild(ribbon);
  const messageNode = ribbon.querySelector('#supportRibbonMessage');
  const cta = ribbon.querySelector('#supportRibbonCta');
  const close = ribbon.querySelector('#supportRibbonClose');
  const dropdown = ribbon.querySelector('#supportPixDropdown');
  const copyPixBtn = ribbon.querySelector('#supportPixCopy');
  const messages = (SUPPORT_RIBBON_MESSAGES[lang()] || SUPPORT_RIBBON_MESSAGES.es || []).slice();
  let index = 0;
  const compactMode = ['practice','exam'].includes(page);
  function setMessage(nextIndex, animate){
    if(!messageNode || !messages.length) return;
    index = nextIndex % messages.length;
    if(animate){
      messageNode.classList.add('is-changing');
      setTimeout(() => {
        messageNode.textContent = messages[index];
        messageNode.classList.remove('is-changing');
      }, 160);
    } else {
      messageNode.textContent = messages[index];
    }
  }
  setMessage(0, false);
  let timer = null;
  if(!compactMode && messages.length > 1){
    timer = setInterval(() => setMessage(index + 1, true), 9000);
  }
  if(cta && dropdown && !cta.dataset.bound){
    cta.dataset.bound = '1';
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = dropdown.hidden;
      dropdown.hidden = !willOpen;
      cta.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }
  if(copyPixBtn && !copyPixBtn.dataset.bound){
    copyPixBtn.dataset.bound = '1';
    copyPixBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const ok = await copyText(PIX_PAYLOAD);
      toast(ok ? t('pixCopied') : t('pixManualCopy'));
    });
  }
  if(close && !close.dataset.bound){
    close.dataset.bound = '1';
    close.addEventListener('click', () => {
      if(timer) clearInterval(timer);
      if(dropdown) dropdown.hidden = true;
      safeSetItem('supportRibbonDismissed', '1');
      ribbon.remove();
    });
  }
}

function renderHome(){
  updateStats();
  applyI18n();
  const clear = $('#clearProgress');
  if(clear && !clear.dataset.bound){ clear.dataset.bound='1'; clear.addEventListener('click', () => { safeRemoveItem(progressKey); updateStats(); toast(t('resetProgress')); }); }
  setupPixSupport();
}

  function renderCatalog(){
    applyI18n();
    const grid = $('#courseGrid'); if(!grid) return;
    grid.innerHTML = '';
    courses.forEach(c => {
      const hasModules = c.moduleCount > 0;
      const pr = courseProgress(c);
      const card = document.createElement('article');
      card.className = 'course-card';
      card.innerHTML = `
        <span class="badge">${escapeHtml(c.folder)}</span>
        <h3>${escapeHtml(ltitle(c.title))}</h3>
        <p>${escapeHtml(lt(c.description || 'Matière disponible pour la révision.'))}</p>
        <div class="count">${c.moduleCount} ${t('modules')} · ${pr.pct}%</div>
        <div class="mini-progress"><i style="width:${pr.pct}%"></i></div>
        <div class="card-actions">
          <a class="btn primary" href="${hasModules ? subjectUrl(c.id) : '#'}" ${hasModules?'':'aria-disabled="true"'}>${t('viewCourses')}</a>
          <a class="btn secondary" href="${hasModules ? qcmUrl(c.id) : '#'}" ${hasModules?'':'aria-disabled="true"'}>${t('doQcm')}</a>
          <a class="btn secondary" href="${hasModules ? caseUrl(c.id) : '#'}" ${hasModules?'':'aria-disabled="true"'}>${t('doClinical')}</a>
          <a class="btn secondary" href="${hasModules ? truthUrl(c.id) : '#'}" ${hasModules?'':'aria-disabled="true"'}>${t('doVf')}</a>
        </div>`;
      grid.appendChild(card);
    });
  }

  function renderModuleCatalog(){
    applyI18n();
    const grid = $('#moduleGrid'), search = $('#searchInput'), empty = $('#emptyState'), filters = $('#courseFilters');
    if(!grid) return;
    let active = params.get('course') || 'all';
    function buildFilters(){
      if(!filters) return;
      const mk = (id,label,count) => `<a class="chip ${active===id?'active':''}" href="modules.html${id==='all'?'':'?course='+encodeURIComponent(id)}">${escapeHtml(label)} (${count})</a>`;
      filters.innerHTML = mk('all', t('all'), allModules.length) + courses.filter(c=>c.moduleCount>0).map(c => mk(c.id, ltitle(c.title).replace(' ',''), c.moduleCount)).join('');
    }
    function render(){
      const q = (search && search.value || '').trim();
      const words = norm(q).split(/\s+/).filter(Boolean);
      let modules = allModules.filter(m => active==='all' || m.courseId === active);
      if(words.length){
        modules = modules.filter(m => {
          const hay = norm([m.title,m.courseTitle,m.summary,(m.headings||[]).join(' '),m.markdown||''].join(' '));
          return words.every(w => hay.includes(w));
        });
      }
      grid.innerHTML = '';
      if(empty) empty.hidden = modules.length > 0;
      modules.forEach(m => {
        const plan = shortPlan(m.headings || [], 5);
        const card = document.createElement('article');
        card.className = 'module-card' + (isDone(m.id) ? ' done' : '');
        card.innerHTML = `
          <div class="module-top"><span class="badge">${t('course')} ${m.number}</span>${isDone(m.id)?`<span class="badge done-badge">${t('seen')}</span>`:''}</div>
          <h3>${escapeHtml(ltitle(m.title))}</h3>
          ${plan}
          <div class="module-meta"><span><strong>${escapeHtml(ltitle(m.courseTitle))}</strong></span><span>${(m.headings||[]).length} ${t('titles')}</span></div>
          <div class="module-actions">
            <a class="btn primary" href="${moduleUrl(m)}">${t('openCourse')}</a>
            <a class="btn secondary" href="${moduleQcmUrl(m)}">QCM</a>
            <a class="btn secondary" href="${moduleCaseUrl(m)}">${t('clinical')}</a>
            <a class="btn secondary" href="${moduleTruthUrl(m)}">${t('vf')}</a>
          </div>`;
        grid.appendChild(card);
      });
    }
    buildFilters();
    if(search) search.addEventListener('input', render);
    render();
  }


  function renderSubject(){
    applyI18n();
    const course = courseById(params.get('course'));
    if(!course) return;
    document.title = `${ltitle(course.title)} | Med Cursos`;
    $('#subjectFolder').textContent = course.folder || 'Matière';
    $('#subjectTitle').textContent = ltitle(course.title);
    $('#subjectDescription').textContent = lt(course.description || t('modules'));
    ['subjectQcmLink','goQcm'].forEach(id => { const el=$('#'+id); if(el) el.href = qcmUrl(course.id); });
    ['subjectCaseLink','goCases'].forEach(id => { const el=$('#'+id); if(el) el.href = caseUrl(course.id); });
    const grid = $('#subjectModuleGrid'), search = $('#searchInput'), empty = $('#emptyState');
    function render(){
      const q = norm(search && search.value || '');
      const modules = (course.modules || []).map(m => ({...m, courseId:course.id, courseTitle:course.title})).filter(m => {
        if(!q) return true;
        const hay = norm([m.title, ltitle(m.title), m.summary, lt(m.summary||''), (m.headings||[]).join(' '), m.markdown.slice(0,9000)].join(' '));
        return q.split(/\s+/).filter(Boolean).every(word => hay.includes(word));
      });
      grid.innerHTML = '';
      if(empty) empty.hidden = modules.length > 0;
      modules.forEach(m => {
        const plan = shortPlan(m.headings || [], 6) || `<p>${escapeHtml(lt(m.summary || 'Module prêt pour la lecture.'))}</p>`;
        const card = document.createElement('article');
        card.className = 'module-card' + (isDone(m.id) ? ' done' : '');
        card.innerHTML = `
          <div class="module-top"><span class="badge">${t('course')} ${m.number}</span>${isDone(m.id)?`<span class="badge done-badge">${t('seen')}</span>`:''}</div>
          <h3>${escapeHtml(ltitle(m.title))}</h3>
          ${plan}
          <div class="module-meta"><span><strong>${escapeHtml(ltitle(course.title))}</strong></span><span>${(m.headings||[]).length} ${t('titles')}</span></div>
          <div class="module-actions">
            <a class="btn primary" href="${moduleUrl(m)}">${t('openCourse')}</a>
            <a class="btn secondary" href="${moduleQcmUrl(m)}">QCM</a>
            <a class="btn secondary" href="${moduleCaseUrl(m)}">${t('clinical')}</a>
            <a class="btn secondary" href="${moduleTruthUrl(m)}">${t('vf')}</a>
            <button class="btn ghost" type="button" data-done="${m.id}">${isDone(m.id)?t('removeSeen'):t('markSeen')}</button>
          </div>`;
        grid.appendChild(card);
      });
    }
    if(search) search.addEventListener('input', render);
    grid.addEventListener('click', e => {
      const b = e.target.closest('[data-done]');
      if(!b) return;
      setDone(b.dataset.done, !isDone(b.dataset.done));
      render(); toast(t('localProgress'));
    });
    render();
  }

  function moduleReadModeUrl(module, mode){
    const q = new URLSearchParams();
    q.set('id', module.id);
    if(mode === 'fiche') q.set('view','fiche');
    if(mode === 'ultra') q.set('view','ultra');
    const searchTerm = params.get('q');
    if(searchTerm) q.set('q', searchTerm);
    return `module.html?${q.toString()}`;
  }
  function renderModule(){
    const m = moduleById(params.get('id'));
    if(!m) return;
    const course = courseById(m.courseId);
    const viewParam = params.get('view');
    const readMode = viewParam === 'fiche' ? 'fiche' : (viewParam === 'ultra' ? 'ultra' : 'full');
    const selectedMarkdown = readMode === 'fiche'
      ? (m.ficheMarkdown || m.summary || m.markdown || '')
      : (readMode === 'ultra' ? (m.ultraMarkdown || makeUltraSheetMarkdown(m)) : (m.fullMarkdown || m.markdown || ''));
    document.body.dataset.readerMode = readMode;
    document.title = `${ltitle(m.title)} | Med Cursos`;
    $('#moduleCursoe').textContent = `${ltitle(m.courseTitle)} · ${t('course')} ${m.number}`;
    $('#moduleTitle').textContent = ltitle(m.title);
    $('#moduleSummary').textContent = readerSummaryText(m.summary || t('course'));
    const subjectLink = subjectUrl(m.courseId);
    ['moduleSubjectLink','readerBackLink'].forEach(id => { const el=$('#'+id); if(el) el.href = subjectLink; });
    ['moduleQcmLink','openQcmBtn'].forEach(id => { const el=$('#'+id); if(el) el.href = moduleQcmUrl(m); });
    ['moduleCaseLink','openCaseBtn'].forEach(id => { const el=$('#'+id); if(el) el.href = moduleCaseUrl(m); });
    const contentEl = $('#moduleContent');
    const oldTabs = document.querySelector('.reader-view-tabs');
    if(oldTabs) oldTabs.remove();
    if(contentEl){
      contentEl.insertAdjacentHTML('beforebegin', `<div class="reader-view-tabs" aria-label="${t('courseMode')}">
        <a class="reader-tab ${readMode==='full'?'active':''}" href="${moduleReadModeUrl(m,'full')}">${t('fullCourse')}</a>
        <a class="reader-tab ${readMode==='fiche'?'active':''}" href="${moduleReadModeUrl(m,'fiche')}">${t('quickSheet')}</a>
        <a class="reader-tab ${readMode==='ultra'?'active':''}" href="${moduleReadModeUrl(m,'ultra')}">${t('ultraSheet')}</a>
      </div>`);
    }
    const rendered = markdownToHtml(editorializeMarkdown(selectedMarkdown, m, readMode), {withIds:true, maxTocLevel:3});
    $('#moduleContent').innerHTML = rendered.html;
    const searchTerm = params.get('q');
    if(searchTerm){ try{ const rx = new RegExp('('+searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')','ig'); $('#moduleContent').innerHTML = $('#moduleContent').innerHTML.replace(rx, '<mark class="search-hit">$1</mark>'); setTimeout(()=>{ const hit=document.querySelector('.search-hit'); if(hit) hit.scrollIntoView({behavior:'smooth', block:'center'}); }, 80); }catch(e){} }
    const tocHtml = rendered.toc.length ? rendered.toc.map(item => `<a class="level-${item.level}" href="#${item.id}">${escapeHtml(translateReaderLight(item.text))}</a>`).join('') : `<p class="toc-empty">${t('noContent')}</p>`;
    $('#tocList').innerHTML = tocHtml;
    $('#mobileTocList').innerHTML = tocHtml;
    const markBtn = $('#markDoneBtn');
    function refreshBtn(){ markBtn.textContent = isDone(m.id) ? t('removeSeen') : t('markSeen'); }
    markBtn.addEventListener('click', () => { setDone(m.id, !isDone(m.id)); refreshBtn(); toast(t('localProgress')); });
    refreshBtn();
    const siblings = (course && course.modules || []).map(x => ({...x, courseId:m.courseId, courseTitle:m.courseTitle}));
    const idx = siblings.findIndex(x => x.id === m.id);
    const prev = siblings[idx-1], next = siblings[idx+1];
    $('#moduleNav').innerHTML = `
      <div>${prev ? `<a class="btn ghost" href="${moduleUrl(prev)}">← Módulo ${prev.number}</a>` : ''}</div>
      <a class="btn secondary" href="${subjectLink}">${t('allModules')}</a>
      <div>${next ? `<a class="btn ghost" href="${moduleUrl(next)}">Módulo ${next.number} →</a>` : ''}</div>`;
  }

  function currentQuery(extra={}){
    const q = new URLSearchParams(location.search);
    Object.entries(extra).forEach(([k,v]) => {
      if(v === null || v === undefined || v === '') q.delete(k);
      else q.set(k, v);
    });
    const s = q.toString();
    return s ? `?${s}` : '';
  }
  function parseCorrectRomanLabels(text=''){
    const s = norm(text).replace(/\by\b/g,' ').replace(/\be\b/g,' ');
    const labels = ['I','II','III','IV','V'];
    if(/ninguna|nada|no hay/.test(s)) return new Set();
    if(/i\s+ii\s+iii|i,\s*ii\s*y\s*iii|todos|todas/.test(String(text).toLowerCase())) return new Set(['I','II','III']);
    const set = new Set();
    labels.forEach(l => {
      const low = l.toLowerCase();
      const rx = new RegExp('(^|\\s)'+low+'(\\s|$)');
      if(rx.test(s)) set.add(l);
    });
    return set;
  }
  function makeTrueFalseItems(arr=[]){
    const out = [];
    (arr || []).forEach((item, idx) => {
      const split = splitRomanStatements(item.question || '');
      const opts = item.options || [];
      const correctIdx = Number(item.answerIndex || 0);
      if(split && split.statements && split.statements.length){
        const trueLabels = parseCorrectRomanLabels(opts[correctIdx] || '');
        split.statements.forEach((st, j) => {
          const isTrue = trueLabels.has(st.label);
          out.push({
            ...item,
            id: `${item.id}-vf-${st.label.toLowerCase()}`,
            question: st.text,
            options: ['Verdadero','Falso'],
            answerIndex: isTrue ? 0 : 1,
            explanation: `${isTrue ? 'Verdadero' : 'Falso'}. ${isTrue ? 'El enunciado respeta el mecanismo fisiológico esperado.' : 'El enunciado altera una relación del mecanismo o introduce una afirmación excesiva.'} ${cleanGeneratedText(item.explanation || '')}`,
            practiceMode:'vf'
          });
        });
        return;
      }
      const wrongCandidates = opts.map((_,i)=>i).filter(i => i !== correctIdx && !/ninguna|nda|todas las anteriores|toutes les/i.test(String(opts[i]||'')));
      const wrongIdx = wrongCandidates.length ? wrongCandidates[(idx + correctIdx) % wrongCandidates.length] : opts.map((_,i)=>i).find(i => i !== correctIdx);
      const useCorrect = idx % 2 === 0 || wrongIdx === undefined;
      const statementIndex = useCorrect ? correctIdx : wrongIdx;
      const statement = opts[statementIndex] || item.question || '';
      const correctStatement = opts[correctIdx] || '';
      out.push({
        ...item,
        id: `${item.id}-vf`,
        question: statement,
        options: ['Verdadero', 'Falso'],
        answerIndex: useCorrect ? 0 : 1,
        explanation: useCorrect
          ? `Verdadero. El enunciado corresponde al mecanismo esperado. ${cleanGeneratedText(item.explanation || '')}`
          : `Falso. Este enunciado deforma el mecanismo. La formulación correcta a retener es: ${cleanGeneratedText(correctStatement)}. ${cleanGeneratedText(item.explanation || '')}`,
        practiceMode: 'vf'
      });
    });
    return out;
  }
  function practiceItemsFromBank(b, type){
    if(!b) return [];
    if(type === 'case') return b.cases || [];
    if(type === 'vf') return b.vf || makeTrueFalseItems(b.qcm || []);
    return b.qcm || [];
  }
  function practiceUrl(type, courseId){
    if(type === 'case') return caseUrl(courseId);
    if(type === 'vf') return truthUrl(courseId);
    return qcmUrl(courseId);
  }
  function renderFilters(activeCursoe, type, baseItems, activeDifficulty){
    const wrap = $('#courseFilters'); if(!wrap) return;
    const moduleMode = !!params.get('module');
    wrap.hidden = false;
    wrap.innerHTML = '';
    const countFor = id => {
      if(id === 'all') return Object.values(BANK.byCourse || {}).reduce((s,b) => s + practiceItemsFromBank(b, type).length, 0);
      const b = BANK.byCourse && BANK.byCourse[id];
      return practiceItemsFromBank(b, type).length;
    };
    if(!moduleMode){
      const mk = (id,label) => {
        const url = practiceUrl(type, id==='all'?'':id);
        const b = document.createElement('a');
        b.className = 'chip' + (activeCursoe===id ? ' active' : '');
        b.href = url;
        b.textContent = `${label} (${countFor(id)})`;
        wrap.appendChild(b);
      };
      mk('all',t('all'));
      courses.filter(c => c.moduleCount > 0).forEach(c => mk(c.id, ltitle(c.title).replace(' ','')));
    }
    const totalBase = (baseItems || []).length;
    const levelCounts = {};
    difficultyOptions().forEach(k => { levelCounts[k] = k === 'all' ? totalBase : (baseItems || []).filter(x => practiceDifficultyKey(x) === k).length; });
    const select = document.createElement('label');
    select.className = 'difficulty-select-wrap';
    select.innerHTML = `<span>${t('difficulty')}</span><select class="difficulty-select" aria-label="${t('difficulty')}">
      ${difficultyOptions().map(k => `<option value="${currentQuery({difficulty:k==='all'?'':k,level:'',page:1})}" ${activeDifficulty===k?'selected':''}>${difficultyLabel(k)} (${levelCounts[k] || 0})</option>`).join('')}
    </select><small>${t('bankTotal')} : ${totalBase}</small>`;
    const sel = select.querySelector('select');
    sel.addEventListener('change', () => { location.href = sel.value; });
    wrap.appendChild(select);
  }

  function renderFocusDifficultyControl(baseItems, activeDifficulty){
    // v28: difficulty is no longer attached to the sticky topbar; it is rendered immediately above the question.
    return '';
  }
  function renderQuestionDifficultyControl(baseItems, activeDifficulty){
    const totalBase = (baseItems || []).length;
    const levelCounts = {};
    difficultyOptions().forEach(k => { levelCounts[k] = k === 'all' ? totalBase : (baseItems || []).filter(x => practiceDifficultyKey(x) === k).length; });
    return `<div class="question-difficulty-panel">
      <label class="inline-difficulty-control difficulty-select-wrap question-difficulty-control">
        <span>${t('difficulty')}</span>
        <select class="difficulty-select" aria-label="${t('difficulty')}">
          ${difficultyOptions().map(k => `<option value="${currentQuery({difficulty:k==='all'?'':k,level:'',page:1})}" ${activeDifficulty===k?'selected':''}>${difficultyLabel(k)} (${levelCounts[k] || 0})</option>`).join('')}
        </select>
      </label>
      <small>${t('bankTotal')} : ${totalBase} · ${activeDifficulty === 'all' ? t('allDifficulties') : difficultyLabel(activeDifficulty)}</small>
      ${(() => { const mid=params.get('module')||''; const mod=mid?moduleById(mid):null; const cid=params.get('course') || (mod?mod.courseId:''); return cid ? `<a class="question-errors-link" href="erreurs.html?course=${encodeURIComponent(cid)}">${t('reviewCourseErrors')}</a>` : ''; })()}
    </div>`;
  }
  function renderPracticeModeNav(type, selectedModule, selectedCursoe){
    const nav = $('#practiceModeNav');
    const back = $('#practiceBackLink');
    if(!nav) return;
    const courseId = selectedModule ? selectedModule.courseId : (selectedCursoe ? selectedCursoe.id : (params.get('course') || ''));
    const moduleId = selectedModule ? selectedModule.id : (params.get('module') || '');
    const backUrl = selectedModule ? subjectUrl(selectedModule.courseId) : (selectedCursoe ? subjectUrl(selectedCursoe.id) : 'matieres.html');
    if(back) back.href = backUrl;
    const links = [];
    if(moduleId){
      links.push([t('course'), `module.html?id=${encodeURIComponent(moduleId)}`]);
      links.push(['QCM', moduleQcmUrl(selectedModule)]);
      links.push([t('clinical'), moduleCaseUrl(selectedModule)]);
      links.push([t('vf'), moduleTruthUrl(selectedModule)]);
    } else if(courseId){
      links.push([t('course'), subjectUrl(courseId)]);
      links.push(['QCM', qcmUrl(courseId)]);
      links.push([t('clinical'), caseUrl(courseId)]);
      links.push([t('vf'), truthUrl(courseId)]);
    } else {
      links.push([t('subjects'), 'matieres.html']);
      links.push(['QCM', 'qcm.html']);
      links.push([t('clinical'), 'cas-cliniques.html']);
      links.push([t('vf'), 'vrai-faux.html']);
    }
    nav.innerHTML = links.map(([label,url]) => {
      const active = (type==='qcm' && label==='QCM') || (type==='case' && label===t('clinical')) || (type==='vf' && label===t('vf'));
      return `<a class="mode-tab ${active?'active':''}" href="${url}">${label}</a>`;
    }).join('');
    const firstTab = nav.querySelector('.mode-tab');
    if(back && firstTab && firstTab.getAttribute('href') === back.getAttribute('href')) back.hidden = true; else if(back) back.hidden = false;
  }

  function optionLetter(i){ return String.fromCharCode(65+i); }
  function stableHash(str=''){
    let h = 0;
    const s = String(str || '');
    for(let i=0;i<s.length;i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }
  function practiceDifficultyKey(item){
    const raw = String(item && item.difficulty || '').toLowerCase();
    if(/normal|base|básico|basico/.test(raw)) return 'normal';
    if(/difficile|difícil|dificil|moyen|medio/.test(raw)) return 'difficile';
    if(/extr/.test(raw)) return 'extreme';
    if(/exam/.test(raw)) return stableHash(item.id || item.question || '') % 2 === 0 ? 'examen' : 'extreme';
    return 'normal';
  }
  function difficultyOrder(d){
    const key = typeof d === 'string' ? d : practiceDifficultyKey(d);
    return key === 'normal' ? 0 : key === 'difficile' ? 1 : key === 'extreme' ? 2 : key === 'examen' ? 3 : 4;
  }
  function difficultyLabel(key){
    if(key === 'normal') return t('normalLevel');
    if(key === 'difficile') return t('difficultLevel');
    if(key === 'extreme') return t('extremeLevel');
    if(key === 'examen') return t('examLevel');
    return t('allDifficulties');
  }
  function difficultyOptions(){ return ['all','normal','difficile','extreme','examen']; }
  function cleanGeneratedText(str=''){
    return String(str)
      .replace(/\b(Selon|D'après|Dans) le cours[^?.!]*[?.!]\s*/gi,'')
      .replace(/\bSelon le module[^?.!]*[?.!]\s*/gi,'')
      .replace(/\bSegún el curso[^?.!]*[?.!]\s*/gi,'')
      .replace(/\bSegún el módulo[^?.!]*[?.!]\s*/gi,'')
      .replace(/\bEn la transcripción,?\s*/gi,'')
      .replace(/\bDesde el punto de vista (fisiológico|clínico),?\s*/gi,'')
      .replace(/\bA partir del caso,?\s*/gi,'')
      .replace(/\bdel profesor\b/gi,'')
      .replace(/\bprofesor\b/gi,'')
      .replace(/\s+/g,' ')
      .trim();
  }
  function splitRomanStatements(text=''){
    const clean = cleanGeneratedText(text);
    const re = /\b(I{1,3}|IV|V)\.\s*/g;
    const marks = [];
    let m;
    while((m = re.exec(clean)) !== null){ marks.push({label:m[1], index:m.index, end:re.lastIndex}); }
    if(marks.length < 2) return null;
    const intro = clean.slice(0, marks[0].index).trim().replace(/[;:,.]\s*$/,'');
    let command = '';
    const statements = marks.map((mark, idx) => {
      const next = marks[idx+1] ? marks[idx+1].index : clean.length;
      let txt = clean.slice(mark.end, next).trim();
      txt = txt.replace(/\b(MARQUE\s+LO\s+CORRECTO|MARQUE\s+LA\s+RESPUESTA\s+CORRECTA)\.?\s*$/i, function(x){ command = x.replace(/\.+$/,'') + '.'; return ''; }).trim();
      return {label: mark.label, text: txt.replace(/[;]+\s*$/,'')};
    }).filter(x => x.text);
    return {intro, statements, command};
  }

  function sentenceTrim(text='', max=190){
    let s = cleanGeneratedText(text || '').replace(/\s+/g,' ').trim();
    if(!s) return '';
    const parts = s.split(/(?<=[.!?])\s+/).filter(Boolean);
    s = parts.find(p => p.length > 35 && !/dato clave|relaciona|formato de examen|distractor principal/i.test(p)) || parts[0] || s;
    if(s.length > max) s = s.slice(0,max).replace(/\s+\S*$/,'') + '…';
    return s;
  }
  function clinicalClue(item){
    let s = sentenceTrim(item && item.stem || '', 210);
    if(!s || /^(un caso clínico|se analiza|después del contacto|un paciente presenta inflamación)/i.test(s)){
      const q = cleanGeneratedText(item && item.question || '');
      const opt = optionPlain(item || {}, Number(item && item.answerIndex || 0));
      s = q && !/qué mecanismo explica|opción|respuesta/i.test(q) ? q : `Tema clínico: ${topicForQuestion(item)}. Pista del curso: ${opt ? opt.slice(0,140) : 'identifica la relación causa → mecanismo → consecuencia.'}`;
    }
    return s;
  }
  function optionPlainSafe(item, idx){
    try { return optionPlain(item, idx); } catch(e){ return cleanGeneratedText(((item && item.options) || [])[idx] || ''); }
  }
  function studyInstructionForType(type){
    if(type === 'case') return [t('methodClinicalData'),t('methodMechanism'),t('methodConsequence'),t('methodEliminate')];
    if(type === 'vf') return [t('methodReadLiteral'),t('methodExcess'),t('methodCompare'),t('methodDecide')];
    return [t('methodConcept'),t('methodMechanism'),t('methodConsequence'),t('methodDistractor')];
  }
  function questionMicroObjective(item, type){
    const topic = ltitle(topicForQuestion(item));
    const key = type === 'case' ? 'objectiveCase' : (type === 'vf' ? 'objectiveVf' : 'objectiveQcm');
    return t(key).replace('{topic}', topic);
  }
  function hintForItem(item, type){
    const topic = ltitle(topicForQuestion(item));
    const correct = optionPlainSafe(item, Number(item && item.answerIndex || 0));
    const exp = cleanGeneratedText(item && item.explanation || '');
    let clue = exp || correct;
    clue = clue.replace(correct,'').trim() || correct;
    clue = clue ? lt(sentenceTrim(clue, 170)) : '';
    if(type === 'vf') return t('hintVf').replace('{topic}', topic);
    if(type === 'case') return t('hintCase').replace('{topic}', topic);
    return t('hintQcm').replace('{clue}', clue ? t('usefulRecall').replace('{clue}', clue) : t('hintFallback'));
  }
  function distractorReason(opt='', item=null){
    const s = cleanGeneratedText(opt);
    if(item){
      const opts = item.options || [];
      const idx = opts.findIndex(o => cleanGeneratedText(o) === s);
      const indexed = item.whyWrong || item.distractorExplanations || item.porQueLasOtrasSonFalsas;
      if(Array.isArray(indexed) && idx >= 0 && indexed[idx]) return cleanGeneratedText(indexed[idx]);
      if(indexed && !Array.isArray(indexed)){
        const byLetter = idx >= 0 ? indexed[optionLetter(idx)] : '';
        if(byLetter) return cleanGeneratedText(byLetter);
        if(indexed[s]) return cleanGeneratedText(indexed[s]);
      }
    }
    const low = norm(s);
    if(/siempre|jam[aá]s|nunca|todo|todos|completamente|total|solo|solamente|únicamente|unicamente/.test(low)) return t('trapAbsolute');
    if(/no\s+|sin\s+|ausencia|elimina por completo|no atraviesa|no existe/.test(low)) return t('trapNegation');
    if(/na\+|sodio|k\+|potasio|ca2|calcio|cl-|cloro/.test(low)) return t('trapIon');
    if(/aumenta|disminuye|reduce|inhibe|estimula|entra|sale/.test(low)) return t('trapDirection');
    if(/ret[ií]culo|membrana|mitocondria|n[úu]cleo|extracelular|intracelular|canal|bomba/.test(low)) return t('trapLocation');
    return t('trapConcept');
  }
  function errorDiagnosis(item, type, record){
    if(record && record.unknown) return t('diagUnknown');
    const chosen = record ? Number(record.chosen) : -1;
    const correctIdx = Number(item && item.answerIndex || 0);
    if(chosen === correctIdx) return t('diagCorrect');
    const chosenText = chosen >= 0 ? optionPlainSafe(item, chosen) : '';
    return chosenText ? distractorReason(chosenText, item) : t('diagUnclassified');
  }
  function makeStudyStrip(type){
    const steps = studyInstructionForType(type);
    return `<div class="question-study-strip" aria-label="${escapeHtml(t('questionMethod'))}">${steps.map((s,i)=>`<span><b>${i+1}</b>${escapeHtml(s)}</span>`).join('')}</div>`;
  }

function topicForQuestion(item){
    let candidates = [item.heading, item.moduleTitle, item.question, item.stem].map(x => cleanGeneratedText(x || '')).filter(Boolean);
    let topic = candidates.find(x => !/(caso cl[ií]nico aplicado|caso cl[ií]nico|pregunta|errores frecuentes|preguntas integradoras|c[oó]mo responder en examen|marca la opci[oó]n|identifica la opci[oó]n|desde el punto de vista)/i.test(x)) || cleanGeneratedText(item.moduleTitle || 'este tema');
    topic = topic.replace(/^Módulo\s+\d+\s*-\s*/i,'').trim();
    topic = topic.replace(/^[¿?]?qu[eé]\s+opci[oó]n\s+describe\s+correctamente\s*/i,'').trim();
    if(topic.length > 70) topic = topic.slice(0,70).replace(/\s+\S*$/,'') + '…';
    if(!topic) topic = 'este tema';
    return topic;
  }
  function clearQuestionForItem(item, type){
    const topic = topicForQuestion(item);
    const level = practiceDifficultyKey(item);
    const translatedTopic = ltitle(topic);
    if(type === 'vf') return cleanGeneratedText(item.question || item.stem || topic);
    if(type === 'case') return t('qCase');
    if(level === 'normal') return t('qNormal').replace('{topic}', translatedTopic);
    if(level === 'difficile') return t('qDifficult').replace('{topic}', translatedTopic);
    if(level === 'extreme') return t('qExtreme').replace('{topic}', translatedTopic);
    return t('qExam').replace('{topic}', translatedTopic);
  }
    function renderQuestionPrompt(text='', isCase=false, isVf=false){
    const clean = cleanGeneratedText(text);
    const split = splitRomanStatements(clean);
    if(split){
      return `<div class="question-prompt structured-prompt">
        ${split.intro ? `<h3>${escapeHtml(lt(split.intro))}</h3>` : ''}
        <div class="roman-statements">
          ${split.statements.map(s => `<div class="roman-statement"><strong>${escapeHtml(s.label)}.</strong><span>${escapeHtml(lt(s.text))}</span></div>`).join('')}
        </div>
        <p class="question-command">${escapeHtml(lt(split.command || 'MARQUE LO CORRECTO.'))}</p>
      </div>`;
    }
    return `<div class="question-prompt ${isVf?'vf-prompt':''}"><h3>${escapeHtml(lt(clean))}</h3>${isVf?`<p class="question-command">${t('trueFalseQuestion')}</p>`:''}</div>`;
  }
  function renderOptionText(opt=''){
    const clean = cleanGeneratedText(opt);
    const parts = clean.split(/;\s+/).map(x => x.trim()).filter(Boolean);
    if(parts.length >= 3){
      return parts.map(x => `<span class="option-line">${escapeHtml(lt(x))}</span>`).join('');
    }
    return escapeHtml(lt(clean));
  }
  function renderOptionList(item, type){
    return `<div class="options" data-answer="${item.answerIndex}">
      ${item.options.map((opt,idx) => `<button type="button" class="option" data-option="${idx}"><span>${type==='vf'?(idx===0?'V':'F'):optionLetter(idx)}</span><em>${renderOptionText(opt)}</em></button>`).join('')}
    </div>
    <div class="answer-panel" hidden>
      <strong>${t('correctAnswer')} : ${type==='vf' ? (item.answerIndex===0 ? t('true') : t('false')) : optionLetter(item.answerIndex)}</strong>
      <p>${escapeHtml(lt(cleanGeneratedText(item.explanation || 'Explication fondée sur le cours.')))}</p>
    </div>`;
  }
  function renderLevelChips(items, activeLevel){
    const levels = [
      ['all',t('allLevels')],
      ['Base','Base'],
      ['Moyen','Moyen'],
      ['Examen','Examen']
    ];
    const count = level => level === 'all' ? items.length : items.filter(x => x.difficulty === level).length;
    return `<div class="practice-toolbar">
      <div><p class="eyebrow mini">${t('level')}</p><div class="chips level-chips">
        ${levels.map(([id,label]) => `<a class="chip ${activeLevel===id?'active':''}" href="${currentQuery({level:id==='all'?'':id,page:1})}">${label} (${count(id)})</a>`).join('')}
      </div></div>
    </div>`;
  }
  function renderPagination(total, page, perPage){
    const pages = Math.max(1, Math.ceil(total/perPage));
    const start = total ? (page-1)*perPage + 1 : 0;
    const end = Math.min(total, page*perPage);
    return `<div class="practice-pagination">
      <div class="page-status"><strong>${start}-${end}</strong> sur ${total}</div>
      <div class="page-buttons">
        <a class="btn ghost ${page<=1?'disabled':''}" href="${page<=1?'#':currentQuery({page:page-1})}">← Précédent</a>
        <span class="page-pill">Page ${page}/${pages}</span>
        <a class="btn secondary ${page>=pages?'disabled':''}" href="${page>=pages?'#':currentQuery({page:page+1})}">Suivant →</a>
      </div>
    </div>`;
  }
  function practiceScopeKey(type, activeCursoe, moduleParam, activeDifficulty){
    return `medPractice:v35-bugfix:${params.get('exam')?'exam':'study'}:${type}:${moduleParam || activeCursoe || 'all'}:${activeDifficulty || 'all'}`;
  }
  function scopeLabel(selectedModule, selectedCursoe, type){
    const label = type === 'case' ? t('clinical') : (type === 'vf' ? t('vf') : 'QCM');
    if(selectedModule) return `${label} · ${ltitle(selectedModule.title)}`;
    if(selectedCursoe) return `${label} · ${ltitle(selectedCursoe.title)}`;
    return label;
  }
  function orderSignature(items){
    return items.map(x => x.id).join('|');
  }
  function shuffleCopy(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random() * (i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }
  function uniqueIds(ids){
    const out = [], seen = new Set();
    (ids || []).forEach(id => {
      if(id && !seen.has(id)){ seen.add(id); out.push(id); }
    });
    return out;
  }
  function buildBatchFromPools(carryIds, unseenIds, size=20){
    const carry = uniqueIds(carryIds).slice(0, size);
    const needed = Math.max(0, size - carry.length);
    const fresh = (unseenIds || []).filter(id => !carry.includes(id)).slice(0, needed);
    return shuffleCopy(carry.concat(fresh));
  }
  function makeInitialSession(items, batchSize=20){
    const order = items.map(x => x.id);
    const firstBatch = buildBatchFromPools([], order, batchSize);
    const usedFirst = new Set(firstBatch);
    return {
      order,
      unseenIds: order.filter(id => !usedFirst.has(id)),
      currentBatch: firstBatch,
      currentIndex: 0,
      seriesNumber: 1,
      currentAnswers: {},
      currentMissedIds: [],
      history: {},
      correct: 0,
      answered: 0,
      streak: 0,
      missStreak: 0,
      unknown: 0,
      unknownStreak: 0,
      lastAction: 'start',
      bestStreak: 0,
      batchFinished: false,
      createdAt: Date.now()
    };
  }
  function normaliseSession(state, items){
    const valid = new Set(items.map(x => x.id));
    state.order = (state.order || items.map(x=>x.id)).filter(id => valid.has(id));
    state.unseenIds = (state.unseenIds || []).filter(id => valid.has(id));
    state.currentBatch = uniqueIds(state.currentBatch || []).filter(id => valid.has(id));
    if(!state.currentBatch.length){
      const fallback = makeInitialSession(items);
      Object.assign(state, fallback);
    }
    state.currentIndex = Math.min(Math.max(0, state.currentIndex || 0), Math.max(0, state.currentBatch.length-1));
    state.currentAnswers = state.currentAnswers || {};
    state.currentMissedIds = uniqueIds(state.currentMissedIds || []).filter(id => valid.has(id));
    state.history = state.history || {};
    state.correct = state.correct || 0;
    state.answered = state.answered || 0;
    state.streak = state.streak || 0;
    state.missStreak = state.missStreak || 0;
    state.unknown = state.unknown || 0;
    state.unknownStreak = state.unknownStreak || 0;
    state.lastAction = state.lastAction || 'start';
    state.bestStreak = state.bestStreak || 0;
    state.seriesNumber = state.seriesNumber || 1;
    state.batchFinished = !!state.batchFinished;
    return state;
  }
  function loadSession(key, items, batchSize=20){
    const signature = orderSignature(items);
    try{
      const raw = localStorage.getItem(key);
      if(raw){
        const state = JSON.parse(raw);
        if(state && state.signature === signature && Array.isArray(state.currentBatch)){
          return normaliseSession(state, items);
        }
      }
    }catch(e){}
    const fresh = makeInitialSession(items, batchSize);
    fresh.signature = signature;
    return fresh;
  }
  function saveSession(key, state){
    try{ localStorage.setItem(key, JSON.stringify(state)); }catch(e){}
  }
  function resetSession(key, items, batchSize=20){
    const fresh = makeInitialSession(items, batchSize);
    fresh.signature = orderSignature(items);
    saveSession(key, fresh);
    return fresh;
  }
  function itemMap(items){ return new Map(items.map(x => [x.id, x])); }
  function currentBatchItems(items, state){
    const map = itemMap(items);
    return (state.currentBatch || []).map(id => map.get(id)).filter(Boolean);
  }
  function currentRecord(state, item){
    return state.currentAnswers ? state.currentAnswers[item.id] : null;
  }
  function batchAnsweredCount(state){
    return Object.keys(state.currentAnswers || {}).length;
  }
  function batchCorrectCount(state){
    return Object.values(state.currentAnswers || {}).filter(r => r && r.correct).length;
  }
  function batchMissedIds(state){
    return Object.entries(state.currentAnswers || {}).filter(([id,r]) => r && !r.correct).map(([id]) => id);
  }
  function hasMoreQuestionsAfterBatch(state){
    return uniqueIds(batchMissedIds(state)).length > 0 || (state.unseenIds || []).length > 0;
  }
  function coachMessage(state, globalPct, batchPct){
    const answered = state.answered || 0;
    const streak = Math.min(20, state.streak || 0);
    const misses = Math.min(20, state.missStreak || 0);
    const unknownIndex = Math.max(0, ((state.unknown || 1) - 1) % 10);
    const unknownMsgs = [
      '🤔 No la sé: mejor ver la corrección que inventar una respuesta.',
      '🕵️ No la sé: buena decisión. Mejor leer la corrección que improvisar fisiología.',
      '🧭 No sé: brújula activada. Ahora lee la explicación y vuelve con GPS neuronal.',
      '📚 No sé: momento humilde. La memoria dijo “hoy no trabajo gratis”.',
      '🧠 No sé: la neurona levantó la mano. Eso también es estudiar.',
      '🛟 No sé: salvavidas pedagógico lanzado. Agárrate a la justificación.',
      '☕ No sé: pausa cognitiva. La respuesta acaba de entrar por vía intravenosa.',
      '🔦 No sé: encendimos la linterna en el túnel del QCM.',
      '🧪 No sé: experimento fallido, pero con resultado útil. Lee la explicación.',
      '🎯 No sé: honestidad académica detectada. Ahora toca transformar duda en punto seguro.'
    ];
    const positive = [
      '✅ 1 correcta: arranque limpio, las sinapsis encendieron la luz.',
      '🌱 2 correctas seguidas: esto crece. La neurona sale de la siesta.',
      '💪 3 correctas: serie seria, los distractores empiezan a sudar.',
      '⚡ 4 correctas: conducción correcta, la mielina está trabajando.',
      '🔥 5 correctas: sólido. Se superó el umbral, seguimos.',
      '🧠 6 correctas: la corteza prefrontal acaba de pedir aumento.',
      '🎯 7 correctas: precisión limpia, hasta las opciones trampa se ponen nerviosas.',
      '🚀 8 correctas: sube rápido, cuidado con poner el parcial en órbita.',
      '🏎️ 9 correctas: ritmo de carrera. Los canales de sodio abren la vía real.',
      '👑 10 correctas: dueño de la serie. El potencial de acción pide selfie.',
      '🧬 11 correctas: ADN bien ordenado, la información circula sin mutación pedagógica.',
      '🫀 12 correctas: el corazón aprueba, el gasto cognitivo es excelente.',
      '🔬 13 correctas: no hace falta microscopio, la maestría se ve a simple vista.',
      '🧪 14 correctas: experimento exitoso, ninguna sinapsis herida durante el test.',
      '🧯 15 correctas: las trampas arden, tú sigues calmado como canal cerrado.',
      '🦾 16 correctas: modo cyborg médico activado, con bata limpia.',
      '🏆 17 correctas: huele a parcial dominado; ya viene la próxima trampa.',
      '🧠 18 correctas: neuroplasticidad premium. Las correcciones ya son decorativas.',
      '🌟 19 correctas: casi insolente. Hasta la bomba Na⁺/K⁺ te pide consejo.',
      '👑 20 correctas seguidas: monstruoso. A este nivel ya no revisas fisiología, la patrocinas.'
    ];
    const negative = [
      '🩹 1 error: nada grave, fue una sinapsis que tropezó.',
      '😅 2 errores: derrape controlado. Lee la corrección y seguimos.',
      '😬 3 errores: las neuronas piden pausa sindical, pero todavía se recuperan.',
      '🧯 4 errores: pequeño incendio pedagógico. Nada dramático, pero sacamos el extintor.',
      '🚑 5 errores: el paciente “fisio” está inestable. Corrección obligatoria.',
      '🫠 6 errores: esto se está derritiendo. Respira y deja de responder por intuición cósmica.',
      '🧟 7 errores: el QCM te mira raro. Hay que volver al mecanismo.',
      '📉 8 errores: la curva baja más rápido que una repolarización mal entendida.',
      '🧊 9 errores: cerebro en modo congelador. Descongelamos con una mini revisión.',
      '💀 10 errores: antes de cambiar de profesión, cambia la estrategia.',
      '🪦 11 errores: los distractores organizaron una fiesta. Hay que recuperar el control.',
      '🚨 12 errores: alerta roja pedagógica. Vuelta al curso, sin negociar.',
      '🧠 13 errores: el cerebro salió del grupo de WhatsApp. Lo reinvitamos con la corrección.',
      '🧪 14 errores: el experimento explotó, pero el laboratorio sigue de pie.',
      '📚 15 errores: el curso te llama. Dice: “ven, tenemos que hablar”.',
      '🫀 16 errores: baja el gasto cardíaco de confianza, pero la reanimación es posible.',
      '🕳️ 17 errores: estás cavando, pero buena noticia: encontramos el capítulo a revisar.',
      '🛟 18 errores: Titanic pedagógico. Sacamos el chaleco salvavidas y el resumen.',
      '🧯 19 errores: las sinapsis gritan “mayday”. Pausa, agua y vuelta al plan del curso.',
      '☠️ 20 errores: catástrofe controlada. Cierra el QCM, lee el curso y vuelve a humillar las preguntas.'
    ];
    if(!answered) return {cls:'neutral', text:t('noKnownYet')};
    if(state.lastAction === 'unknown') return {cls:'unknown', text: unknownMsgs[unknownIndex]};
    if(misses > 0) return {cls: misses >= 10 ? 'danger' : (misses >= 5 ? 'low' : 'warn'), text: negative[misses-1]};
    if(streak > 0) return {cls: streak >= 20 ? 'legend' : (streak >= 10 ? 'excellent' : (streak >= 5 ? 'good' : 'ok')), text: positive[streak-1]};
    if(globalPct >= 90 && answered >= 5) return {cls:'excellent', text:'🏆 Excelente: precisión quirúrgica. Incluso la bomba Na⁺/K⁺ trabaja con respeto.'};
    if(globalPct >= 75) return {cls:'good', text:t('coachGood')};
    if(globalPct >= 60) return {cls:'ok', text:t('coachExcellent')};
    if(globalPct >= 40) return {cls:'warn', text:t('coachMixed')};
    return {cls:'danger', text:t('coachHard')};
  }
  function renderSessionStats(state, total, bankTotal, filteredTotal, activeDifficulty){
    const globalPct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    const batchAnswered = batchAnsweredCount(state);
    const batchCorrect = batchCorrectCount(state);
    const batchPct = batchAnswered ? Math.round((batchCorrect / batchAnswered) * 100) : 0;
    const qProgress = total ? Math.round((batchAnswered / total) * 100) : 0;
    const currentQuestion = total ? Math.min(total, (state.currentIndex || 0) + 1) : 0;
    const coach = coachMessage(state, globalPct, batchPct);
    return `<section class="session-dashboard compact-dashboard ultra-compact-dashboard" aria-label="Progression de la session">
      <div class="session-stat question-count-stat"><span>${t('questionCounter')}</span><strong>${currentQuestion}/${total}</strong><small>${filteredTotal} ${t('selectedBank').toLowerCase()}</small></div>
      <div class="session-stat"><span>${t('bankTotal')}</span><strong>${bankTotal}</strong><small>${difficultyLabel(activeDifficulty)}</small></div>
      <div class="session-stat"><span>${t('global')}</span><strong>${state.correct}/${state.answered}</strong><small>${globalPct}%</small></div>
      <div class="session-stat"><span>${t('series')} ${state.seriesNumber || 1}</span><strong>${batchCorrect}/${batchAnswered}</strong><small>${batchPct}%</small></div>
      <div class="session-stat"><span>${t('unknown')}</span><strong>${state.unknown || 0}</strong><small>${t('review')}</small></div>
      <div class="session-bars compact-bars">
        <div><span class="bar-label">${t('seriesBar')} <strong>${qProgress}%</strong></span><div class="progress-track"><i style="width:${qProgress}%"></i></div></div>
        <div><span class="bar-label">${t('successBar')} <strong>${globalPct}%</strong></span><div class="progress-track success"><i style="width:${globalPct}%"></i></div></div>
      </div>
    </section><div class="coach-banner ${coach.cls}" role="status">${escapeHtml(coach.text)}</div>`;
  }
  function renderBatchSummary(state, items, selectedModule, selectedCursoe, type){
    const batchAnswered = batchAnsweredCount(state);
    const batchCorrect = batchCorrectCount(state);
    const batchPct = batchAnswered ? Math.round((batchCorrect / batchAnswered) * 100) : 0;
    const globalPct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    const missed = uniqueIds(batchMissedIds(state));
    const hasNext = hasMoreQuestionsAfterBatch(state);
    const courseUrl = selectedModule ? subjectUrl(selectedModule.courseId) : selectedCursoe ? subjectUrl(selectedCursoe.id) : 'matieres.html';
    const nextText = missed.length
      ? t('nextMissed').replace('{n}', missed.length)
      : t('nextClean');
    return `<article class="practice-card completion-card batch-summary-card">
      <p class="eyebrow">${t('endSeries')} ${state.seriesNumber || 1}</p>
      <h2>${batchCorrect}/${batchAnswered} ${t('correctAnswers')} · ${batchPct}%</h2>
      <p>${t('currentGlobalScore')} : ${state.correct}/${state.answered}, ${globalPct}% ${t('accuracy')}.</p>
      <p>${nextText}</p>
      <div class="completion-score"><div class="progress-track success"><i style="width:${batchPct}%"></i></div></div>
      <div class="batch-review-list">
        ${missed.length ? `<strong>${t('reviewNextSeries')}</strong><ul>${missed.map(id => {
          const it = items.find(x => x.id === id);
          return `<li>${escapeHtml(it ? clearQuestionForItem(it, type) : id)}</li>`;
        }).join('')}</ul>` : `<strong>${t('noRecycle')}</strong>`}
      </div>
      <div class="module-actions">
        ${hasNext ? `<button class="btn secondary" data-action="start-next-batch">${t('startNextSeries')}</button>` : `<button class="btn secondary" data-action="restart-session">${t('redoSession')}</button>`}
        <a class="btn ghost" href="${courseUrl}">${t('backToModules')}</a>
        ${selectedModule ? `<a class="btn ghost" href="module.html?id=${encodeURIComponent(selectedModule.id)}">${t('reviewCourse')}</a>` : ''}
      </div>
    </article>`;
  }
  function renderOneQuestion(item, state, total, type, bankTotal, filteredTotal, activeDifficulty, examMode=false){
    const record = currentRecord(state, item);
    const alreadyAnswered = !!record;
    const chosen = record ? record.chosen : null;
    const stemHtml = type === 'case' ? `<div class="case-stem clinical-clue-card"><span>${t('clinicalCase')}</span><p>${escapeHtml(lt(clinicalClue(item)))}</p></div>` : '';
    const body = stemHtml + renderQuestionPrompt(clearQuestionForItem(item, type), type === 'case', type === 'vf');
    const options = `<div class="options ${type==='vf'?'tf-options':''} ${alreadyAnswered?'answered':''}" data-answer="${item.answerIndex}" ${alreadyAnswered?'data-locked="1"':''}>
      ${item.options.map((opt,idx) => {
        const cls = alreadyAnswered ? (examMode ? (idx === chosen ? ' chosen' : '') : (idx === item.answerIndex ? ' correct' : (idx === chosen && idx !== item.answerIndex ? ' wrong' : ''))) : '';
        const label = type === 'vf' ? (idx === 0 ? 'V' : 'F') : optionLetter(idx);
        const stateBadge = alreadyAnswered && !examMode ? (idx === item.answerIndex ? `<i class="option-state ok">${t('correctBadge')}</i>` : (idx === chosen && idx !== item.answerIndex ? `<i class="option-state ko">${t('chosenBadge')}</i>` : '')) : '';
        return `<button type="button" class="option${cls}" data-option="${idx}" ${alreadyAnswered?'disabled':''}><span>${label}</span><em>${renderOptionText(opt)}${stateBadge}</em></button>`;
      }).join('')}
    </div>
    <div class="preanswer-tools" ${alreadyAnswered || examMode ? 'hidden' : ''}>
      <button type="button" class="tool-btn" data-action="show-hint">${t('hint')}</button>
      <button type="button" class="tool-btn" data-action="eliminate-two">${t('eliminateTwo')}</button>
      <button type="button" class="tool-btn" data-action="mark-review">${t('markReview')}</button>
    </div>
    <div class="hint-panel" hidden><strong>${t('targetedHint')}</strong><p>${escapeHtml(lt(hintForItem(item, type)))}</p></div>
    <div class="unknown-action-wrap" ${alreadyAnswered?'hidden':''}>
      <button type="button" class="btn unknown-btn" data-action="dont-know">${t('dontKnow')}</button>
    </div>
    <div class="answer-panel ${record && record.unknown ? 'unknown-panel' : ''}" ${alreadyAnswered && !examMode?'':'hidden'}>
      ${correctionHtml(item, type, record, false)}
    </div>`;
    const currentQuestion = total ? Math.min(total, (state.currentIndex || 0) + 1) : 0;
    return `<article class="practice-card quiz-card single-question-card v32-question-card" id="${item.id}">
      <div class="quiz-head"><span class="badge">${t('questionCounter')} ${currentQuestion}/${total}</span><span class="badge question-level-badge">${t('questionLevel') || t('currentLevel')} : ${difficultyLabel(practiceDifficultyKey(item))}</span><span class="badge">${t('module')} ${item.moduleNumber || ''} · ${escapeHtml(ltitle(item.moduleTitle || ''))}</span></div>
      ${examMode ? `<div class="exam-hidden-note">${t('examCorrectionHidden')}</div>` : ''}
      ${makeStudyStrip(type)}
      ${body}
      ${options}
      <div class="question-shortcuts">${t('shortcutHelp')}</div>
      ${options.includes('answer-panel') ? '' : ''}
      <div class="single-nav-actions">
        <button class="btn ghost" data-action="previous-question" ${state.currentIndex<=0?'disabled':''}>${t('previous')}</button>
        <button class="btn secondary" data-action="next-question" ${alreadyAnswered?'':'disabled'}>${state.currentIndex >= total-1 ? t('balance') : t('next')}</button>
      </div>
      <div class="module-actions slim"><a class="btn ghost" href="module.html?id=${encodeURIComponent(item.moduleId)}">${t('reviewCourse')}</a><button class="btn ghost report-btn" data-action="open-feedback">${t('reportError')}</button><button class="btn ghost" data-action="restart-session">${t('restart')}</button></div>
    </article>`;
  }
  function startNextBatch(state, items){
    const missed = uniqueIds(batchMissedIds(state));
    const nextBatch = buildBatchFromPools(missed, state.unseenIds || [], 20);
    const usedFresh = new Set(nextBatch.filter(id => !missed.includes(id)));
    state.unseenIds = (state.unseenIds || []).filter(id => !usedFresh.has(id));
    state.currentBatch = nextBatch;
    state.currentIndex = 0;
    state.currentAnswers = {};
    state.currentMissedIds = [];
    state.batchFinished = false;
    state.seriesNumber = (state.seriesNumber || 1) + 1;
    return state;
  }
  function renderCompletion(state, selectedModule, selectedCursoe, items=[], type='qcm', examMode=false){
    const pct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    const courseUrl = selectedModule ? subjectUrl(selectedModule.courseId) : selectedCursoe ? subjectUrl(selectedCursoe.id) : 'matieres.html';
    const reviewHtml = examMode ? `<div class="exam-review-list"><h3>${t('examReview')}</h3>${Object.entries(state.currentAnswers||{}).map(([id,rec]) => { const it=(items||[]).find(x=>x.id===id); return it ? `<article class="exam-review-item ${rec.correct?'ok':'ko'}"><strong>${escapeHtml(cleanGeneratedText(it.question || it.stem || it.moduleTitle))}</strong>${correctionHtml(it,type,rec,true)}</article>` : ''; }).join('')}</div>` : '';
    return `<article class="practice-card completion-card">
      <p class="eyebrow">${t('sessionFinished')}</p>
      <h2>${t('globalResultLabel')} : ${state.correct}/${state.answered} ${t('correct')}</h2>
      <p>${t('successSentence').replace('{pct}', pct)}</p>
      <div class="completion-score"><div class="progress-track success"><i style="width:${pct}%"></i></div></div>
      ${reviewHtml}
      <div class="module-actions"><button class="btn secondary" data-action="restart-session">${t('redoSession')}</button><a class="btn ghost" href="${courseUrl}">${t('backToModules')}</a></div>
    </article>`;
  }
  function renderPractice(){
    const type = document.body.dataset.practiceType || 'qcm';
    const examMode = params.get('exam') === '1';
    const courseParam = params.get('course');
    const moduleParam = params.get('module');
    const activeCursoe = courseParam || 'all';
    const selectedCursoe = courseParam ? courseById(courseParam) : null;
    const selectedModule = moduleParam ? moduleById(moduleParam) : null;
    const title = type === 'case' ? t('clinical') : (type === 'vf' ? t('vf') : 'QCM');
    const requestedDifficulty = params.get('difficulty') || params.get('level') || 'all';
    const activeDifficulty = difficultyOptions().includes(requestedDifficulty) ? requestedDifficulty : 'all';
    renderPracticeModeNav(type, selectedModule, selectedCursoe);
    const isFocusedPractice = !!(moduleParam || courseParam);
    document.body.classList.toggle('practice-focus', isFocusedPractice);
    $('#practiceEyebrow').textContent = selectedModule ? `${ltitle(selectedModule.courseTitle)} · ${t('course')} ${selectedModule.number}` : (selectedCursoe ? ltitle(selectedCursoe.title) : title);
    $('#practiceTitle').textContent = examMode ? `${t('examMode')} · ${selectedCursoe ? ltitle(selectedCursoe.title) : title}` : (selectedModule ? `${title} · ${ltitle(selectedModule.title)}` : (selectedCursoe ? `${title} · ${ltitle(selectedCursoe.title)}` : title));
    $('#practiceDescription').textContent = selectedModule
      ? type === 'vf' ? t('practiceDescriptionSeriesVf') : t('practiceDescriptionSeries')
      : t('practiceDescriptionDefault');
    const list = $('#practiceList'), empty = $('#emptyState');
    list.innerHTML = '';
    let baseItems = [];
    Object.entries(BANK.byCourse || {}).forEach(([cid,b]) => {
      if(activeCursoe !== 'all' && cid !== activeCursoe) return;
      const arr = practiceItemsFromBank(b, type);
      baseItems.push(...arr);
    });
    if(moduleParam) baseItems = baseItems.filter(x => x.moduleId === moduleParam);
    baseItems = baseItems.slice().sort((a,b) => difficultyOrder(a) - difficultyOrder(b) || (a.moduleNumber||0) - (b.moduleNumber||0) || String(a.id).localeCompare(String(b.id)));
    renderFilters(activeCursoe, type, baseItems, activeDifficulty);
    renderFocusDifficultyControl(baseItems, activeDifficulty);
    const inlineDifficultyControl = examMode ? '' : renderQuestionDifficultyControl(baseItems, activeDifficulty);
    const bankTotal = baseItems.length;
    let items = examMode ? baseItems.filter(x => practiceDifficultyKey(x) === 'examen') : (activeDifficulty === 'all' ? baseItems : baseItems.filter(x => practiceDifficultyKey(x) === activeDifficulty));
    if(activeDifficulty === 'all'){
      items = items.slice().sort((a,b) => stableHash(`${type}|${activeCursoe}|${moduleParam || ''}|${a.id}`) - stableHash(`${type}|${activeCursoe}|${moduleParam || ''}|${b.id}`));
    } else {
      items = items.slice().sort((a,b) => difficultyOrder(a) - difficultyOrder(b) || (a.moduleNumber||0) - (b.moduleNumber||0) || String(a.id).localeCompare(String(b.id)));
    }
    const filteredTotal = items.length;
    if(empty) empty.hidden = items.length > 0;
    if(!items.length){
      list.innerHTML = `<div class="notice">${t('noQuestions')}</div>`;
      return;
    }
    const key = practiceScopeKey(type, activeCursoe, moduleParam, examMode ? 'examen' : activeDifficulty);
    const batchSize = examMode ? Math.min(40, items.length) : 20;
    let state = loadSession(key, items, batchSize);
    const batchItems = currentBatchItems(items, state);
    const total = batchItems.length;
    if(state.batchFinished || state.currentIndex >= total){
      if(hasMoreQuestionsAfterBatch(state)){
        list.innerHTML = renderSessionStats(state, total, bankTotal, filteredTotal, activeDifficulty) + renderBatchSummary(state, items, selectedModule, selectedCursoe, type);
      } else {
        list.innerHTML = renderSessionStats(state, total, bankTotal, filteredTotal, activeDifficulty) + renderCompletion(state, selectedModule, selectedCursoe, items, type, examMode);
      }
    } else {
      const currentItem = batchItems[state.currentIndex];
      list.innerHTML = `<div class="practice-headbox">${renderSessionStats(state, total, bankTotal, filteredTotal, activeDifficulty)}</div>` + inlineDifficultyControl + renderOneQuestion(currentItem, state, total, type, bankTotal, filteredTotal, activeDifficulty, examMode);
    }
    function focusQuestionTop(behavior='smooth'){
      requestAnimationFrame(() => {
        const target = document.querySelector('.question-difficulty-panel') || document.querySelector('.single-question-card') || document.querySelector('#practiceList');
        if(target) target.scrollIntoView({behavior, block:'start'});
      });
    }
    list.onchange = e => {
      const sel = e.target.closest('.question-difficulty-panel .difficulty-select');
      if(sel && sel.value) location.href = sel.value;
    };
    document.onkeydown = e => {
      if(document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName)) return;
      const keyName = String(e.key || '').toLowerCase();
      const card = document.querySelector('.single-question-card');
      if(!card) return;
      if(['a','b','c','d'].includes(keyName)){
        const idx = keyName.charCodeAt(0)-97;
        const btn = card.querySelector(`.option[data-option="${idx}"]:not([disabled])`);
        if(btn){ e.preventDefault(); btn.click(); }
      }
      if(keyName === 'v'){
        const btn = card.querySelector('.tf-options .option[data-option="0"]:not([disabled])');
        if(btn){ e.preventDefault(); btn.click(); }
      }
      if(keyName === 'f'){
        const btn = card.querySelector('.tf-options .option[data-option="1"]:not([disabled])');
        if(btn){ e.preventDefault(); btn.click(); }
      }
      if(keyName === 'i'){
        const btn = card.querySelector('[data-action="show-hint"]');
        if(btn){ e.preventDefault(); btn.click(); }
      }
      if(keyName === 'e'){
        const btn = card.querySelector('[data-action="eliminate-two"]');
        if(btn && !btn.disabled){ e.preventDefault(); btn.click(); }
      }
      if(keyName === 'n'){
        const btn = card.querySelector('[data-action="dont-know"]');
        if(btn){ e.preventDefault(); btn.click(); }
      }
    };
    list.onclick = e => {
      const opt = e.target.closest('.option');
      const actionBtn = e.target.closest('[data-action]');
      if(opt){
        const box = opt.closest('.options');
        if(!box || box.dataset.locked) return;
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        if(!currentItem) return;
        const answer = Number(box.dataset.answer);
        const chosen = Number(opt.dataset.option);
        const isCorrect = chosen === answer;
        state.currentAnswers[currentItem.id] = {chosen, correct:isCorrect, answeredAt:Date.now(), series:state.seriesNumber || 1};
        if(!state.history[currentItem.id]) state.history[currentItem.id] = [];
        state.history[currentItem.id].push({chosen, correct:isCorrect, answeredAt:Date.now(), series:state.seriesNumber || 1});
        state.answered += 1;
        if(isCorrect){ state.correct += 1; state.streak += 1; state.missStreak = 0; state.unknownStreak = 0; state.lastAction = 'correct'; state.bestStreak = Math.max(state.bestStreak || 0, state.streak); clearMistake(currentItem.id); }
        else { state.streak = 0; state.unknownStreak = 0; state.missStreak = (state.missStreak || 0) + 1; state.lastAction = 'wrong'; storeMistake(currentItem, type, state.currentAnswers[currentItem.id]); }
        saveSession(key, state);
        renderPractice();
        focusQuestionTop('smooth');
        return;
      }
      if(!actionBtn) return;
      const action = actionBtn.dataset.action;
      if(action === 'open-feedback'){
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        if(currentItem) openFeedbackModal(currentItem, type);
        return;
      }
      if(action === 'confidence'){
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        if(currentItem){ setConfidence(currentItem, actionBtn.dataset.confidence || 'hesitated', type, currentRecord(state, currentItem)); toast(t('confidenceSaved')); renderPractice(); }
        return;
      }
      if(action === 'show-hint'){
        const card = actionBtn.closest('.single-question-card');
        const panel = card && card.querySelector('.hint-panel');
        if(panel) panel.hidden = !panel.hidden;
        actionBtn.classList.toggle('active', panel && !panel.hidden);
        return;
      }
      if(action === 'eliminate-two'){
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        const card = actionBtn.closest('.single-question-card');
        if(!currentItem || !card || currentRecord(state, currentItem)) return;
        const correct = Number(currentItem.answerIndex || 0);
        let wrongBtns = Array.from(card.querySelectorAll('.option')).filter(btn => Number(btn.dataset.option) !== correct && !btn.classList.contains('eliminated'));
        wrongBtns = wrongBtns.sort((a,b) => stableHash(currentItem.id + '|elim|' + a.dataset.option) - stableHash(currentItem.id + '|elim|' + b.dataset.option));
        wrongBtns.slice(0, Math.min(2, Math.max(0, wrongBtns.length-1))).forEach(btn => { btn.classList.add('eliminated'); btn.disabled = true; });
        actionBtn.disabled = true;
        return;
      }
      if(action === 'mark-review'){
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        if(!currentItem) return;
        storeMistake(currentItem, type, {chosen:-1, correct:false, reviewOnly:true, answeredAt:Date.now(), series:state.seriesNumber || 1});
        toast(t('addedToReview'));
        return;
      }
      if(action === 'dont-know'){
        const batchItemsNow = currentBatchItems(items, state);
        const currentItem = batchItemsNow[state.currentIndex];
        if(!currentItem || currentRecord(state, currentItem)) return;
        state.currentAnswers[currentItem.id] = {chosen:-1, correct:false, unknown:true, answeredAt:Date.now(), series:state.seriesNumber || 1};
        if(!state.history[currentItem.id]) state.history[currentItem.id] = [];
        state.history[currentItem.id].push({chosen:-1, correct:false, unknown:true, answeredAt:Date.now(), series:state.seriesNumber || 1});
        state.answered += 1;
        state.unknown = (state.unknown || 0) + 1;
        state.unknownStreak = (state.unknownStreak || 0) + 1;
        state.lastAction = 'unknown';
        storeMistake(currentItem, type, state.currentAnswers[currentItem.id]);
        state.streak = 0;
        state.missStreak = (state.missStreak || 0) + 1;
        saveSession(key, state);
        renderPractice();
        focusQuestionTop('smooth');
        return;
      }
      if(action === 'next-question'){
        if(state.currentIndex >= total - 1){ state.batchFinished = true; }
        else { state.currentIndex += 1; }
        saveSession(key, state);
        renderPractice();
        focusQuestionTop('smooth');
      }
      if(action === 'previous-question'){
        state.currentIndex = Math.max(0, state.currentIndex - 1);
        saveSession(key, state);
        renderPractice();
        focusQuestionTop('smooth');
      }
      if(action === 'restart-session'){
        state = resetSession(key, items, batchSize);
        renderPractice();
        focusQuestionTop('smooth');
      }
      if(action === 'start-next-batch'){
        state = startNextBatch(state, items);
        saveSession(key, state);
        renderPractice();
        focusQuestionTop('smooth');
      }
    };
  }


  function renderLearningDashboard(){
    const holder = document.querySelector('#learningDashboard'); if(!holder) return;
    const due = dueMistakes();
    const pending = pendingMistakes();
    const last = getLastModule();
    const weak = weakCourseSummary();
    holder.innerHTML = `<section class="learning-dashboard learning-dashboard-v31">
      <div class="dashboard-head dashboard-head-v31">
        <div><p class="eyebrow">${t('dashboard')}</p><h2>${t('todayPlan')}</h2></div>
        <a class="btn ghost tiny" href="examen.html">${t('examMode')}</a>
      </div>
      <div class="dashboard-grid dashboard-grid-v31">
        <article class="dash-card priority"><span>${t('reviewToday')}</span><strong>${due.length}</strong><small>${t('questionsToReview')}</small><a class="btn secondary" href="erreurs.html">${t('startRevision')}</a></article>
        <article class="dash-card"><span>${t('recentErrors')}</span><strong>${pending.length}</strong><small>${t('weakPoints')}</small><a class="btn ghost" href="erreurs.html">${t('reviewMistakes')}</a></article>
        <article class="dash-card"><span>${t('continueLearning')}</span><strong>${last ? t('module')+' '+last.number : '—'}</strong><small>${last ? escapeHtml(ltitle(last.title)) : t('allClear')}</small>${last ? `<a class="btn ghost" href="${moduleUrl(last)}">${t('openCourse')}</a>`:`<a class="btn ghost" href="modules.html">${t('openModules')}</a>`}</article>
        <article class="dash-card exam-card"><span>${t('examMode')}</span><strong>40</strong><small>${t('examQcm')}</small><a class="btn primary" href="examen.html">${t('startExam')}</a></article>
      </div>
      ${weak.length ? `<div class="weak-strip"><strong>${t('weakPoints')} :</strong> ${weak.map(w => `<a href="erreurs.html?course=${encodeURIComponent(w.course?w.course.id:'')}">${escapeHtml(w.course?ltitle(w.course.title):t('general'))} (${w.count})</a>`).join(' · ')}</div>` : ''}
    </section>`;
  }

  function renderMistakesPage(){
    applyI18n();
    const list=$('#mistakesList'); if(!list) return;
    const courseFilter=params.get('course') || '';
    const all=pendingMistakes().filter(m => !courseFilter || m.courseId===courseFilter).sort((a,b)=>(a.nextReviewAt||0)-(b.nextReviewAt||0));
    const due=all.filter(m => !m.nextReviewAt || m.nextReviewAt <= Date.now());
    const later=all.filter(m => m.nextReviewAt && m.nextReviewAt > Date.now());
    function card(m){
      const it=findPracticeItem(m.id, m.type) || m;
      const rec={chosen:m.lastChosen, correct:false, unknown:m.unknowns>0};
      const dueDate=m.nextReviewAt ? new Date(m.nextReviewAt).toLocaleDateString() : '—';
      return `<article class="mistake-card">
        <div class="quiz-head"><span class="badge">${escapeHtml(ltitle(m.courseTitle||''))}</span><span class="badge">${t('module')} ${m.moduleNumber||''}</span><span class="badge">${difficultyLabel(m.difficulty)}</span><span class="badge">${t('revision')}: ${dueDate}</span></div>
        <h3>${escapeHtml(lt(cleanGeneratedText(m.question || m.stem || it.question || it.stem || 'Question')))}</h3>
        ${correctionHtml(it, m.type || 'qcm', rec, true)}
        <div class="module-actions"><a class="btn secondary" href="${retryUrlForMistake(m)}">${t('retryQuestion')}</a><a class="btn ghost" href="module.html?id=${encodeURIComponent(m.moduleId)}">${t('openCourseSection')}</a><button class="btn ghost" data-mastered="${escapeHtml(m.id)}">${t('markMastered')}</button></div>
      </article>`;
    }
    if(!all.length){ list.innerHTML = `<div class="notice"><strong>${t('noMistakes')}</strong><p>${t('mistakesText')}</p></div>`; return; }
    list.innerHTML = `<div class="mistakes-summary"><strong>${due.length}</strong> ${t('questionsToReview')} · <strong>${all.length}</strong> ${t('recentErrors')}</div>
      <h2>${t('dueToday')}</h2>${due.length ? due.map(card).join('') : `<p class="empty-state">${t('allClear')}</p>`}
      <h2>${t('laterReview')}</h2>${later.length ? later.map(card).join('') : ''}`;
    list.onclick=e=>{ const b=e.target.closest('[data-mastered]'); if(!b) return; markMistakeMastered(b.dataset.mastered); renderMistakesPage(); };
  }
  function renderExamPage(){
    applyI18n();
    const wrap=$('#examSetup'); if(!wrap) return;
    const options = courses.filter(c=>c.moduleCount>0).map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(ltitle(c.title))}</option>`).join('');
    wrap.innerHTML = `<article class="exam-setup-card"><p class="eyebrow">${t('examMode')}</p><h1>${t('startExam')}</h1><p>${t('examIntro')}</p>
      <label class="difficulty-select-wrap"><span>${t('matterLabel')}</span><select id="examCourse"><option value="">${t('all')}</option>${options}</select></label>
      <div class="module-actions"><button class="btn primary" id="startExamBtn">${t('startExam')}</button><a class="btn ghost" href="erreurs.html">${t('reviewMistakes')}</a></div></article>`;
    $('#startExamBtn').onclick=()=>{ const cid=$('#examCourse').value; const q=new URLSearchParams(); if(cid) q.set('course',cid); q.set('difficulty','examen'); q.set('exam','1'); location.href='qcm.html?'+q.toString(); };
  }


  function setupGlobalTools(){
    const nav = document.querySelector('.nav-shell');
    if(!nav || document.querySelector('.global-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'global-tools';
    tools.innerHTML = `
      <div class="global-search" role="search">
        <span class="global-search-label">${t('searchLabel') || 'Buscar'}</span>
        <input id="globalSearchInput" type="search" placeholder="${t('searchPlaceholder')}" autocomplete="off" />
        <div id="globalSearchResults" class="global-search-results" hidden></div>
      </div>`;
    const toggle = nav.querySelector('.menu-toggle');
    nav.insertBefore(tools, toggle || nav.querySelector('#navLinks'));
    const brand = nav.querySelector('.brand');
    if(brand && !nav.querySelector('.brand-lang')){
      brand.insertAdjacentHTML('afterend', `<div class="brand-lang lang-switch compact-lang" aria-label="Changer la langue"><button type="button" data-lang="fr">FR</button><button type="button" data-lang="es">ES</button><button type="button" data-lang="br">BR</button></div>`);
    }
    const navLinks = nav.querySelector('#navLinks');
    if(navLinks){
      const currentLinks = Array.from(navLinks.querySelectorAll('a'));
      const hrefMap = new Map();
      currentLinks.forEach(link => {
        const raw = (link.getAttribute('href') || '').trim();
        const key = raw.split('#')[0].split('?')[0] || raw;
        if(!key) return;
        if(!hrefMap.has(key)) hrefMap.set(key, link);
        else link.remove();
      });

      const desiredNav = [
        ['index.html', 'home', t('home')],
        ['matieres.html', 'navSubjects', t('navSubjects')],
        ['modules.html', 'navModules', t('navModules')],
        ['qcm.html', 'navQcm', t('navQcm') || 'QCM'],
        ['cas-cliniques.html', 'navClinical', t('navClinical')],
        ['vrai-faux.html', 'doVf', t('doVf')],
        ['erreurs.html', 'mistakes', t('mistakes')],
        ['examen.html', 'examMode', t('examMode')],
        ['contact.html', 'navContact', t('navContact') || 'Contact']
      ];

      navLinks.innerHTML = desiredNav.map(([href, key, label]) => {
        const active = location.pathname.endsWith('/' + href) || (href === 'index.html' && (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')));
        return `<a href="${href}" data-i18n="${key}" ${active ? 'aria-current="page"' : ''}>${escapeHtml(label)}</a>`;
      }).join('');
    }


    const input = tools.querySelector('#globalSearchInput');
    const results = tools.querySelector('#globalSearchResults');
    function searchModules(q){
      const query = norm(q);
      if(query.length < 2) return [];
      const syn = {
        qrs:['qrs','complejo qrs','complexe qrs','complexo qrs'],
        ecg:['ecg','electrocardiograma','eletrocardiograma','électrocardiogramme'],
        electrocardiogramme:['ecg','electrocardiograma','eletrocardiograma','électrocardiogramme'],
        eletrocardiograma:['ecg','electrocardiograma','eletrocardiograma','électrocardiogramme'],
        onde:['onda','onde'], onda:['onda','onde'],
        sodium:['sodium','sodio','sódio','na'], sodio:['sodium','sodio','sódio','na'], na:['sodium','sodio','sódio','na'],
        potassium:['potassium','potasio','potássio','k'], potasio:['potassium','potasio','potássio','k'], potassio:['potassium','potasio','potássio','k'], k:['potassium','potasio','potássio','k'],
        calcium:['calcium','calcio','cálcio','ca'], calcio:['calcium','calcio','cálcio','ca'], ca:['calcium','calcio','cálcio','ca'],
        potentiel:['potentiel','potencial','potencial de accion','potencial de ação'], potencial:['potentiel','potencial','potencial de accion','potencial de ação'],
        membrane:['membrane','membrana'], membrana:['membrane','membrana'],
        osmolarite:['osmolarité','osmolaridad','osmolaridade','osmose','osmosis','ósmosis'], osmolaridad:['osmolarité','osmolaridad','osmolaridade'], osmolaridade:['osmolarité','osmolaridad','osmolaridade'], osmose:['osmose','osmosis','ósmosis'],
        renal:['renal','rénal','rim','riñón','riñon','rein'], rein:['renal','rénal','riñón','rim'], rinon:['renal','riñón','rim'], rim:['renal','riñón','rim'],
        respiratoire:['respiratoire','respiratoria','respiratória'], respiratoria:['respiratoire','respiratoria','respiratória'],
        cardiaque:['cardiaque','cardíaco','cardiaco','cardíaca','cardiovascular'], cardiaco:['cardiaque','cardíaco','cardiaco','cardiovascular'], cardiovasculaire:['cardiovascular','cardiovasculaire'],
        muscle:['músculo','muscle','muscular'], muscular:['músculo','muscle','muscular'], contraccion:['contracción','contraction','contração'], contraction:['contracción','contraction','contração'], contracao:['contracción','contraction','contração'],
        glycolyse:['glucólisis','glicólise','glycolyse'], glicolise:['glucólisis','glicólise','glycolyse'], glucolisis:['glucólisis','glicólise','glycolyse'],
        immunologie:['inmunología','imunologia','immunologie'], inmunologia:['inmunología','imunologia','immunologie'], imunologia:['inmunología','imunologia','immunologie'],
        microbiologie:['microbiología','microbiologia','microbiologie'], microbiologia:['microbiología','microbiologia','microbiologie'],
        genetique:['genética','genetica','génétique'], genetica:['genética','genetica','génétique'], biochimie:['bioquímica','bioquimica','biochimie'], bioquimica:['bioquímica','bioquimica','biochimie'],
        bacteria:['bactéria','bacteria','bactérie','bactérienne','bacteriana'], bacterie:['bactéria','bacteria','bactérie','bactérienne','bacteriana'],
        lipides:['lípidos','lipídios','lipides'], lipidos:['lípidos','lipídios','lipides'], lipídios:['lípidos','lipídios','lipides'],
        glucides:['carbohidratos','carboidratos','glucides'], carbohidratos:['carbohidratos','carboidratos','glucides'], carboidratos:['carbohidratos','carboidratos','glucides'],
        vaccins:['vacunas','vacinas','vaccins'], vacunas:['vacunas','vacinas','vaccins'], vacinas:['vacunas','vacinas','vaccins'],
        inflamacion:['inflamación','inflamação','inflammation'], inflamacao:['inflamación','inflamação','inflammation'], inflammation:['inflamación','inflamação','inflammation']
      };
      const rawWords = query.split(/\s+/).filter(Boolean);
      const rawGroups = rawWords.map(w => {
        const key = norm(w);
        const variants = new Set([w, key]);
        (syn[key] || []).forEach(x => variants.add(x));
        return Array.from(variants).filter(Boolean);
      });
      const groups = rawGroups.map(group => Array.from(new Set(group.map(x => norm(x)).filter(Boolean))));
      const displayTokens = rawGroups.flat();
      function cleanSearchText(str){
        return String(str || '').replace(/[#*_`>|-]+/g,' ').replace(/\s+/g,' ').trim();
      }
      function normMap(str){
        const original = String(str || '');
        let text = '';
        const map = [];
        for(let i=0; i<original.length; i++){
          let part = original[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[⁺]/g,'+').replace(/[^a-z0-9+\/]+/g,' ');
          for(let j=0; j<part.length; j++){ text += part[j]; map.push(i); }
        }
        return {text, map};
      }
      function findGroupMatch(rawText, group){
        const nm = normMap(rawText);
        let best = null;
        group.forEach(tok => {
          if(!tok || tok.length < 2) return;
          let pos = nm.text.indexOf(tok);
          if(pos < 0) return;
          const rawPos = nm.map[pos] || 0;
          if(!best || rawPos < best.rawPos) best = {token:tok, rawPos, normPos:pos};
        });
        return best;
      }
      function contextAround(rawText, match){
        const text = cleanSearchText(rawText);
        const nm = normMap(text);
        let rawPos = 0;
        const idx = nm.text.indexOf(match.token);
        if(idx >= 0) rawPos = nm.map[idx] || 0;
        else rawPos = Math.max(0, match.rawPos || 0);
        let start = Math.max(0, rawPos - 115);
        let end = Math.min(text.length, rawPos + 230);
        const leftBreak = text.lastIndexOf('.', start);
        if(leftBreak > 0 && leftBreak > rawPos - 170) start = leftBreak + 1;
        const rightBreak = text.indexOf('.', rawPos + 70);
        if(rightBreak > rawPos && rightBreak < rawPos + 260) end = rightBreak + 1;
        return (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '');
      }
      const found = [];
      courses.forEach(course => (course.modules || []).forEach(m => {
        const contentRaw = cleanSearchText([m.title, course.title, course.folder, m.summary, (m.headings||[]).join('. '), (m.exam||[]).join(' '), (m.markdown||'')].join(' '));
        const titleMatterRaw = cleanSearchText([m.title, course.title, course.folder].join(' '));
        const allGroupMatches = groups.map(group => findGroupMatch(contentRaw, group));
        if(allGroupMatches.some(x => !x)) return;
        const firstContentMatch = allGroupMatches.slice().sort((a,b) => a.rawPos - b.rawPos)[0];
        const snippet = contextAround(contentRaw, firstContentMatch);
        const visibleRaw = cleanSearchText([titleMatterRaw, snippet].join(' '));
        const visibleOk = groups.every(group => !!findGroupMatch(visibleRaw, group));
        if(!visibleOk) return;
        const exactBonus = rawWords.reduce((s,w) => s + (norm(contentRaw).includes(norm(w)) ? 3 : 0), 0);
        const titleBonus = groups.reduce((s,group) => s + (findGroupMatch(titleMatterRaw, group) ? 2 : 0), 0);
        const score = 1000 - Math.min(firstContentMatch.rawPos || 0, 900) + exactBonus + titleBonus;
        found.push({course, module:m, snippet:lt(snippet), score, tokens:displayTokens});
      }));
      return found.sort((a,b) => b.score - a.score || a.course.title.localeCompare(b.course.title) || a.module.number - b.module.number).slice(0,8);
    }
    function escapeRegExp(str){ return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function highlightText(text, tokens){
      let html = escapeHtml(String(text || ''));
      const list = Array.from(new Set((tokens || []).map(x => String(x || '').trim()).filter(x => x.length >= 2))).sort((a,b) => b.length - a.length).slice(0,18);
      list.forEach(token => {
        try { html = html.replace(new RegExp('(' + escapeRegExp(escapeHtml(token)) + ')', 'ig'), '<mark class="global-hit">$1</mark>'); } catch(e){}
      });
      return html;
    }
    function renderGlobalResults(){
      const q = input.value.trim();
      const found = searchModules(q);
      if(q.length < 2){ results.hidden = false; results.innerHTML=`<div class="global-result-empty">${t('searchHint')}</div>`; return; }
      results.hidden = false;
      if(!found.length){ results.innerHTML = `<div class="global-result-empty">${t('searchNoResult')}</div>`; return; }
      results.innerHTML = found.map(r => {
        const titleHtml = highlightText(ltitle(r.module.title), r.tokens);
        const matterHtml = highlightText(ltitle(r.course.title), r.tokens);
        const snippetHtml = highlightText(String(r.snippet || '').slice(0,210), r.tokens);
        return `<a class="global-result" href="module.html?id=${encodeURIComponent(r.module.id)}&q=${encodeURIComponent(q)}">
          <strong>${titleHtml}</strong>
          <span><b>${t('matterLabel')} :</b> ${matterHtml} · <b>${t('courseLabel')} :</b> ${t('course')} ${r.module.number}</span>
          <small>${snippetHtml}</small>
          <em>${t('openArrow')}</em>
        </a>`;
      }).join('');
    }
    input.addEventListener('input', renderGlobalResults);
    input.addEventListener('focus', renderGlobalResults);
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const first = results.querySelector('.global-result');
        if(first){ e.preventDefault(); location.href = first.href; }
      }
    });
    document.addEventListener('click', e => { if(!tools.contains(e.target)) results.hidden = true; });
    setupLanguageSwitch(document);
  }
  function setupLanguageSwitch(scope){
    const buttons = (scope || document).querySelectorAll('[data-lang]');
    const map = {fr:'fr', es:'es', br:'pt-BR'};
    let current = lang();
    function apply(){
      document.documentElement.lang = map[current] || 'es';
      document.body.dataset.lang = current;
      buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === current));
      const search = document.querySelector('#globalSearchInput');
      const label = document.querySelector('.global-search-label'); if(label) label.textContent = t('searchLabel') || 'Buscar'; if(search) search.placeholder = t('searchPlaceholder'); applyI18n();
    }
    buttons.forEach(b => b.addEventListener('click', () => {
      current = b.dataset.lang;
      safeSetItem('medLang', current);
      apply();
      location.reload();
    }));
    apply();
  }

  function safeRender(label, fn){
    try { fn(); }
    catch(err){
      console.error('Render error:', label, err);
      const main = document.querySelector('main');
      if(main && !document.querySelector('.fatal-render-error')){
        const box = document.createElement('div');
        box.className = 'fatal-render-error';
        box.innerHTML = `<strong>Erreur de chargement corrigible</strong><br><small>${escapeHtml(String(err && err.message || err || 'Erreur inconnue'))}</small>`;
        main.prepend(box);
      }
    }
  }

  setupMenu();
  setupGlobalTools();
  setupSupportRibbon();
  applyI18n();
  if(page === 'home') safeRender('home', () => { renderHome(); renderLearningDashboard(); });
  if(page === 'catalog') safeRender('catalog', renderCatalog);
  if(page === 'modules') safeRender('modules', renderModuleCatalog);
  if(page === 'subject') safeRender('subject', renderSubject);
  if(page === 'module') safeRender('module', renderModule);
  if(page === 'practice') safeRender('practice', renderPractice);
  if(page === 'mistakes') safeRender('mistakes', renderMistakesPage);
  if(page === 'exam') safeRender('exam', renderExamPage);
})();


(function(){
  const extra = {
    fr: {
      "home.quick.eyebrow": "RÉVISION IMMÉDIATE",
      "home.quick.title": "Que veux-tu réviser maintenant ?",
      "home.quick.subtitle": "Choisis une entrée et commence directement : matière, QCM, cas cliniques ou erreurs.",
      "home.quick.materias.title": "Choisir une matière",
      "home.quick.materias.text": "Voir cours et modules",
      "home.quick.qcm.title": "QCM rapide",
      "home.quick.qcm.text": "S’entraîner maintenant",
      "home.quick.cases.title": "Cas cliniques",
      "home.quick.cases.text": "Raisonner comme à l’examen",
      "home.quick.errors.title": "Revoir les erreurs",
      "home.quick.errors.text": "Corriger ce qui bloque"
    },
    es: {
      "home.quick.eyebrow": "REVISIÓN INMEDIATA",
      "home.quick.title": "¿Qué quieres revisar ahora?",
      "home.quick.subtitle": "Elige una entrada y empieza directo: materia, QCM, casos clínicos o errores.",
      "home.quick.materias.title": "Elegir materia",
      "home.quick.materias.text": "Ver cursos y módulos",
      "home.quick.qcm.title": "QCM rápido",
      "home.quick.qcm.text": "Entrenar ahora",
      "home.quick.cases.title": "Casos clínicos",
      "home.quick.cases.text": "Razonar como examen",
      "home.quick.errors.title": "Revisar errores",
      "home.quick.errors.text": "Corregir lo que bloquea"
    },
    br: {
      "home.quick.eyebrow": "REVISÃO IMEDIATA",
      "home.quick.title": "O que você quer revisar agora?",
      "home.quick.subtitle": "Escolha uma entrada e comece direto: matéria, QCM, casos clínicos ou erros.",
      "home.quick.materias.title": "Escolher matéria",
      "home.quick.materias.text": "Ver cursos e módulos",
      "home.quick.qcm.title": "QCM rápido",
      "home.quick.qcm.text": "Treinar agora",
      "home.quick.cases.title": "Casos clínicos",
      "home.quick.cases.text": "Raciocinar como prova",
      "home.quick.errors.title": "Revisar erros",
      "home.quick.errors.text": "Corrigir o que trava"
    }
  };
  window.MED_EXTRA_I18N = Object.assign({}, window.MED_EXTRA_I18N || {}, extra);
  function applyExtraI18n(){
    const lang = document.documentElement.lang || localStorage.getItem("medCursosLang") || "es";
    const dict = extra[lang] || extra.es;
    document.querySelectorAll("[data-i18n^='home.quick.']").forEach(function(el){
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
  }
  document.addEventListener("DOMContentLoaded", applyExtraI18n);
  document.addEventListener("click", function(ev){
    if (ev.target && ev.target.closest && ev.target.closest("[data-lang], .lang-btn, [data-set-lang]")) {
      setTimeout(applyExtraI18n, 50);
    }
  });
})();




(function(){
  function normalizePracticeText(){
    document.querySelectorAll("button, a, option, span, strong, small, label, p").forEach(function(el){
      if (!el || !el.textContent) return;
      const t = el.textContent.trim();
      if (t === "Casos clínicos") el.textContent = "Casos clínicos";
      if (t.includes("todos los niveles")) el.textContent = el.textContent.replace("todos los niveles", "todos los niveles");
    });
  }

  function compactPracticeMobile(){
    if (!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;
    normalizePracticeText();

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    if (!isMobile) return;

    // Make long intro less dominant: if an intro paragraph appears before filters, keep it short.
    const candidates = Array.from(document.querySelectorAll("main p, .practice-intro p, .quiz-intro p, .training-intro p"));
    candidates.slice(0, 4).forEach(function(p){
      const txt = (p.textContent || "").trim();
      if (txt.length > 115 && /preguntas|materia|módulo|errores|Elige/i.test(txt)) {
        p.textContent = "Elige el modo, ajusta filtros rápidos y responde una pregunta por vez.";
      }
    });

    // Add a concise mobile filter hint before the first filter-heavy block.
    const firstFilter = document.querySelector(".practice-filters, .quiz-filters, .training-filters, .filters-panel, .practice-filter-panel, .quiz-filter-panel");
    if (firstFilter && !document.querySelector(".practice-mobile-filter-hint")) {
      const hint = document.createElement("div");
      hint.className = "practice-mobile-filter-hint practice-compact-controls";
      hint.innerHTML = '<span class="practice-compact-pill is-primary"><strong>Filtro:</strong> desliza →</span><span class="practice-compact-pill">Materia</span><span class="practice-compact-pill">Dificultad</span><span class="practice-compact-pill">Banco</span>';
      firstFilter.parentNode.insertBefore(hint, firstFilter);
    }
  }

  document.addEventListener("DOMContentLoaded", compactPracticeMobile);
  window.addEventListener("load", compactPracticeMobile);
  document.addEventListener("click", function(){ setTimeout(compactPracticeMobile, 60); });
})();




(function(){
  function cleanPracticeLabels(){
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      let s = node.nodeValue || "";
      const original = s;
      s = s.replace(/Casos clínicos/g, "Casos clínicos");
      s = s.replace(/todos los niveles+s*/g, "todos los niveles");
      s = s.replace(/todos los niveles+s*/g, "todos los niveles");
      s = s.replace(/niveles/g, "niveles");
      s = s.replace(/niveles/g, "niveles");
      if(s !== original) node.nodeValue = s;
    });
  }

  function currentCourseName(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge:nth-child(3)");
    if(!badge) {
      const title = document.querySelector("#practiceEyebrow");
      return title ? title.textContent.trim().replace(/\s+/g, " ") : "";
    }
    const txt = badge.textContent || "";
    const parts = txt.split("·");
    return (parts[1] || parts[0] || "").trim();
  }

  function makePracticeSummary(){
    if(!document.body.classList.contains("practice-focus")) return;
    const list = document.querySelector("#practiceList");
    if(!list) return;

    cleanPracticeLabels();

    const card = document.querySelector(".single-question-card");
    if(!card) return;

    let summary = list.querySelector(".practice-live-summary");
    if(!summary) {
      summary = document.createElement("div");
      summary.className = "practice-live-summary";
      list.insertBefore(summary, list.firstChild);
    }

    const q = card.querySelector(".quiz-head .badge");
    const count = q ? q.textContent.trim().replace(/^Pregunta\s*/i, "") : "";
    const type = document.body.dataset.practiceType || "qcm";
    const mode = type === "case" ? "Casos" : (type === "vf" ? "V/F" : "QCM");
    const course = currentCourseName();
    const diffPanel = document.querySelector(".question-difficulty-panel small");
    let diff = diffPanel ? diffPanel.textContent.trim() : "";
    diff = diff.replace(/Banco total\s*:\s*/i, "Banco ");
    diff = diff.replace(/todos los niveles+s*/i, "todos los niveles");
    diff = diff.replace(/niveles/g, "niveles").replace(/niveles/g, "niveles");

    summary.innerHTML = [
      "<span>" + mode + "</span>",
      course ? "<span>" + course + "</span>" : "",
      count ? "<span>" + count + "</span>" : "",
      diff ? "<span>" + diff + "</span>" : ""
    ].filter(Boolean).join("");
  }

  function questionFirstMobile(){
    if(!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;
    cleanPracticeLabels();
    makePracticeSummary();
  }

  document.addEventListener("DOMContentLoaded", questionFirstMobile);
  window.addEventListener("load", questionFirstMobile);
  document.addEventListener("click", function(){ setTimeout(questionFirstMobile, 80); });
  document.addEventListener("change", function(){ setTimeout(questionFirstMobile, 80); });
})();




(function(){
  function cleanTextNodeValue(s){
    return (s || "")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/niveles/g, "niveles")
      .replace(/niveles/g, "niveles")
      .replace(/Casos clínicos/g, "Casos clínicos");
  }

  function cleanVisibleText(){
    if(!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const old = node.nodeValue || "";
      const cleaned = cleanTextNodeValue(old);
      if(cleaned !== old) node.nodeValue = cleaned;
    });
  }

  function shortCourseName(raw){
    raw = cleanTextNodeValue(String(raw || "")).trim();
    raw = raw.replace(/^Fisiología\s*[,·:-]?\s*/i, "Fisiología ");
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/electrocardiograma|ECG/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/transporte de membrana/i.test(raw)) return "Membrana";
    if(/neurofisiología|potencial de acción/i.test(raw)) return "Neuro";
    if(/anion gap|acidosis/i.test(raw)) return "Acid-base";
    if(/renal/i.test(raw)) return "Renal";
    if(/respiratoria/i.test(raw)) return "Resp.";
    return raw.length > 18 ? raw.slice(0, 17).trim() + "…" : raw;
  }

  function getPracticeMode(){
    const path = location.pathname;
    if(/cas-cliniques/.test(path)) return "Casos";
    if(/vrai-faux/.test(path)) return "V/F";
    if(/erreurs/.test(path)) return "Errores";
    if(/examen/.test(path)) return "Examen";
    return "QCM";
  }

  function getQuestionNumber(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge");
    if(!badge) return "";
    const txt = cleanTextNodeValue(badge.textContent || "").trim();
    const m = txt.match(/(\d+\s*\/\s*\d+)/);
    return m ? m[1].replace(/\s+/g, "") : txt.replace(/^Pregunta\s*/i, "");
  }

  function getCourseLabel(){
    const badges = Array.from(document.querySelectorAll(".single-question-card .quiz-head .badge"));
    let longest = "";
    badges.forEach(function(b){
      const txt = cleanTextNodeValue(b.textContent || "");
      if(/Fisiología|Microbiología|Genética|Bioquímica|Inmunología|cardiovascular|ECG|osmolaridad|membrana|renal|respiratoria/i.test(txt) && txt.length > longest.length) {
        longest = txt;
      }
    });
    if(!longest) {
      const chips = Array.from(document.querySelectorAll("button, .chip, .practice-compact-pill"));
      chips.forEach(function(c){
        const txt = cleanTextNodeValue(c.textContent || "");
        if(/Fisiología|Microbiología|Genética|Bioquímica|Inmunología/i.test(txt) && txt.length > longest.length) longest = txt;
      });
    }
    return shortCourseName(longest);
  }

  function getBankCount(){
    let text = "";
    const panel = document.querySelector(".question-difficulty-panel");
    if(panel) text = cleanTextNodeValue(panel.textContent || "");
    const m = text.match(/Banco\s*(?:total)?\s*:?\s*(\d+)/i) || text.match(/\((\d{2,5})\)/);
    return m ? "Banco " + m[1] : "";
  }

  function compactDifficultyPanel(){
    const panel = document.querySelector(".question-difficulty-panel");
    if(!panel) return;
    cleanVisibleText();

    const select = panel.querySelector("select");
    if(select) {
      Array.from(select.options || []).forEach(function(opt){
        opt.textContent = cleanTextNodeValue(opt.textContent || "").replace(/\s+/g, " ").trim();
      });
    }

    // Remove any raw duplicated text after select by hiding small/link through CSS and cleaning text nodes.
    Array.from(panel.childNodes).forEach(function(node){
      if(node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = cleanTextNodeValue(node.nodeValue);
      }
    });
  }

  function updateUltraSummary(){
    if(!document.body.classList.contains("practice-focus")) return;
    const list = document.querySelector("#practiceList");
    if(!list) return;

    let summary = list.querySelector(".practice-live-summary");
    if(!summary) {
      summary = document.createElement("div");
      summary.className = "practice-live-summary";
      list.insertBefore(summary, list.firstChild);
    }

    const mode = getPracticeMode();
    const course = getCourseLabel();
    const qNum = getQuestionNumber();
    const bank = getBankCount();

    summary.innerHTML = [
      '<span>' + mode + '</span>',
      course ? '<span class="course-pill">' + course + '</span>' : "",
      qNum ? '<span>' + qNum + '</span>' : "",
      bank ? '<span class="bank-pill">' + bank + '</span>' : ""
    ].filter(Boolean).join("");
  }

  function applyV82PracticeUX(){
    if(!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;
    cleanVisibleText();
    compactDifficultyPanel();
    updateUltraSummary();
  }

  document.addEventListener("DOMContentLoaded", applyV82PracticeUX);
  window.addEventListener("load", applyV82PracticeUX);
  document.addEventListener("click", function(){ setTimeout(applyV82PracticeUX, 80); });
  document.addEventListener("change", function(){ setTimeout(applyV82PracticeUX, 80); });
})();




(function(){
  function cleanV83Text(s){
    return String(s || "")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/niveles/g, "niveles")
      .replace(/niveles/g, "niveles")
      .replace(/Casos clínicos/g, "Casos clínicos")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanVisibleTextV83(){
    if(!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const original = node.nodeValue || "";
      const cleaned = original
        .replace(/todos los niveles+s*/g, "todos los niveles")
        .replace(/todos los niveles+s*/g, "todos los niveles")
        .replace(/niveles/g, "niveles")
        .replace(/niveles/g, "niveles")
        .replace(/Casos clínicos/g, "Casos clínicos");
      if(cleaned !== original) node.nodeValue = cleaned;
    });
  }

  function shortCourseV83(raw){
    raw = cleanV83Text(raw);
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/electrocardiograma|ECG/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/transporte de membrana|membrana/i.test(raw)) return "Membrana";
    if(/neurofisiología|potencial de acción/i.test(raw)) return "Neuro";
    if(/anion gap|acidosis/i.test(raw)) return "Acid-base";
    if(/renal/i.test(raw)) return "Renal";
    if(/respiratoria/i.test(raw)) return "Resp.";
    if(/fisiología/i.test(raw)) return "Fisiología";
    if(/microbiología/i.test(raw)) return "Microbio";
    if(/genética/i.test(raw)) return "Genética";
    if(/bioquímica/i.test(raw)) return "Bioquímica";
    if(/inmunología/i.test(raw)) return "Inmuno";
    return raw.length > 14 ? raw.slice(0, 13).trim() + "…" : raw;
  }

  function practiceModeV83(){
    const path = location.pathname;
    if(/cas-cliniques/.test(path)) return "Casos";
    if(/vrai-faux/.test(path)) return "V/F";
    if(/erreurs/.test(path)) return "Errores";
    if(/examen/.test(path)) return "Examen";
    return "QCM";
  }

  function questionNumberV83(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge");
    if(!badge) return "";
    const txt = cleanV83Text(badge.textContent || "");
    const m = txt.match(/(\d+\s*\/\s*\d+)/);
    return m ? m[1].replace(/\s+/g, "") : txt.replace(/^Pregunta\s*/i, "");
  }

  function courseLabelV83(){
    const badges = Array.from(document.querySelectorAll(".single-question-card .quiz-head .badge"));
    let found = "";
    badges.forEach(function(b){
      const txt = cleanV83Text(b.textContent || "");
      if(/Módulo|Modulo|Fisiología|Microbiología|Genética|Bioquímica|Inmunología|cardiovascular|ECG|osmolaridad|membrana|renal|respiratoria/i.test(txt) && txt.length > found.length) {
        found = txt;
      }
    });
    return shortCourseV83(found);
  }

  function bankLabelV83(){
    const panel = document.querySelector(".question-difficulty-panel");
    const txt = cleanV83Text(panel ? panel.textContent : "");
    const m = txt.match(/Banco total\s*:?\s*(\d+)/i) || txt.match(/\((\d{2,5})\)/);
    return m ? "Banco " + m[1] : "";
  }

  function selectedDifficultyTextV83(select){
    if(!select) return "Aleatorio";
    const opt = select.options[select.selectedIndex];
    let txt = cleanV83Text(opt ? opt.textContent : "");
    txt = txt.replace(/\(\d+\)/g, "").trim();
    txt = txt.replace(/Aleatorio · todos los niveles/i, "Aleatorio");
    txt = txt.replace(/todos los niveles/i, "Aleatorio");
    return txt || "Aleatorio";
  }

  function miniDifficultySelectV83(originalSelect){
    if(!originalSelect) return "";
    const wrap = document.createElement("div");
    wrap.className = "practice-mini-difficulty-wrap";
    const sel = document.createElement("select");
    sel.className = "practice-mini-difficulty";
    sel.setAttribute("aria-label", "Dificultad");
    Array.from(originalSelect.options || []).forEach(function(opt){
      const o = document.createElement("option");
      o.value = opt.value;
      o.selected = opt.selected;
      o.textContent = selectedDifficultyTextV83({options:[opt], selectedIndex:0});
      sel.appendChild(o);
    });
    sel.addEventListener("change", function(){ if(sel.value) location.href = sel.value; });
    wrap.appendChild(sel);
    return wrap;
  }

  function updateV83Summary(){
    if(!document.body.classList.contains("practice-focus")) return;
    const list = document.querySelector("#practiceList");
    const card = document.querySelector(".single-question-card");
    if(!list || !card) return;

    cleanVisibleTextV83();

    let summary = list.querySelector(".practice-live-summary");
    if(!summary) {
      summary = document.createElement("div");
      summary.className = "practice-live-summary";
      list.insertBefore(summary, list.firstChild);
    }

    const mode = practiceModeV83();
    const course = courseLabelV83();
    const qn = questionNumberV83();
    const bank = bankLabelV83();
    const originalSelect = document.querySelector(".question-difficulty-panel select");

    summary.innerHTML = "";
    [
      {text: mode, cls: ""},
      {text: course, cls: "course-pill"},
      {text: qn, cls: ""},
      {text: bank, cls: "bank-pill"}
    ].forEach(function(item){
      if(!item.text) return;
      const span = document.createElement("span");
      if(item.cls) span.className = item.cls;
      span.textContent = item.text;
      summary.appendChild(span);
    });

    const diff = miniDifficultySelectV83(originalSelect);
    if(diff) summary.appendChild(diff);

    // Clean original select options too, even if hidden.
    if(originalSelect) {
      Array.from(originalSelect.options || []).forEach(function(opt){
        opt.textContent = selectedDifficultyTextV83({options:[opt], selectedIndex:0});
      });
    }
  }

  function applyV83Focus(){
    if(!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;
    cleanVisibleTextV83();
    updateV83Summary();
  }

  document.addEventListener("DOMContentLoaded", applyV83Focus);
  window.addEventListener("load", applyV83Focus);
  document.addEventListener("click", function(){ setTimeout(applyV83Focus, 80); });
  document.addEventListener("change", function(){ setTimeout(applyV83Focus, 80); });
})();




(function(){
  function applyV84TopFix(){
    if(!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;
    document.body.classList.add("practice-focus");
    const header = document.querySelector(".site-header, header");
    if(header){
      header.style.marginTop = "0px";
      header.style.paddingTop = "0px";
    }
    const main = document.querySelector("main");
    if(main){
      main.style.marginTop = "0px";
      main.style.paddingTop = "0px";
    }
  }
  document.addEventListener("DOMContentLoaded", applyV84TopFix);
  window.addEventListener("load", applyV84TopFix);
  window.addEventListener("pageshow", applyV84TopFix);
})();




(function(){
  function isPracticePage(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function cleanTextV85(s){
    return String(s || "")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/todos los niveles+s*/g, "todos los niveles")
      .replace(/niveles/g, "niveles")
      .replace(/niveles/g, "niveles")
      .replace(/Pista/g, "Pista")
      .replace(/Eliminar 2 distractores/g, "Eliminar 2")
      .replace(/Marcar para revisar/g, "Revisar")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactToolButtons(){
    const labels = [
      [/^Pista$/i, "Pista"],
      [/Eliminar\s*2\s*distractores/i, "Eliminar 2"],
      [/Marcar\s*para\s*revisar/i, "Revisar"],
      [/No\s*la\s*sé/i, "Ver respuesta"]
    ];

    Array.from(document.querySelectorAll("button, a")).forEach(function(el){
      const txt = cleanTextV85(el.textContent);
      labels.forEach(function(pair){
        if(pair[0].test(txt)) el.textContent = pair[1];
      });
    });
  }

  function optionLetterFromText(text){
    const m = String(text || "").trim().match(/^([A-D])\b/i);
    return m ? m[1].toUpperCase() : "";
  }

  function getOptionTexts(){
    const opts = [];
    const optionEls = Array.from(document.querySelectorAll(".single-question-card .option, .single-question-card button.option, .single-question-card [data-option-index]"));
    optionEls.forEach(function(el, idx){
      const letterNode = el.querySelector("span, .letter, .option-letter");
      let letter = letterNode ? cleanTextV85(letterNode.textContent).replace(/[^A-D]/gi, "").slice(0,1).toUpperCase() : "";
      if(!letter) letter = "ABCD"[idx] || "";
      let text = cleanTextV85(el.textContent || "");
      if(letter) text = text.replace(new RegExp("^" + letter + "\\s*"), "").trim();
      if(text && letter) opts.push({letter: letter, text: text});
    });
    return opts;
  }

  function findFeedbackContainer(){
    const candidates = Array.from(document.querySelectorAll(
      ".single-question-card .feedback, .single-question-card .answer-feedback, .single-question-card .correction, .single-question-card .result-panel, .single-question-card .explanation-panel, .single-question-card [class*='feedback'], .single-question-card [class*='correction'], .single-question-card [class*='explanation']"
    ));
    const visible = candidates.filter(function(el){
      const txt = cleanTextV85(el.textContent);
      return txt.length > 20 && /(correct|incorrect|respuesta|explicación|tu respuesta|objetivo)/i.test(txt);
    });
    if(visible.length) {
      visible.sort(function(a,b){ return (b.textContent || "").length - (a.textContent || "").length; });
      return visible[0];
    }

    // Fallback: after answer, some apps append a panel after tools.
    const all = Array.from(document.querySelectorAll(".single-question-card > div, .single-question-card section, .single-question-card article"));
    const found = all.find(function(el){
      const txt = cleanTextV85(el.textContent);
      return txt.length > 40 && /(CORRECT|INCORRECT|RESPUESTA CORRECTA|TU RESPUESTA|Objetivo)/i.test(txt);
    });
    return found || null;
  }

  function detectCorrectState(container){
    const txt = cleanTextV85(container ? container.textContent : "");
    if(/incorrect|falso|wrong|mal/i.test(txt)) return false;
    if(/correct/i.test(txt)) return true;
    return null;
  }

  function findChosenAndCorrect(container, options){
    const txt = cleanTextV85(container ? container.textContent : "");
    let chosen = "";
    let correct = "";

    const chosenMatch = txt.match(/TU RESPUESTA\s*([A-D])/i) || txt.match(/Tu respuesta\s*([A-D])/i);
    const correctMatch = txt.match(/RESPUESTA CORRECTA\s*([A-D])/i) || txt.match(/Respuesta correcta\s*([A-D])/i);
    if(chosenMatch) chosen = chosenMatch[1].toUpperCase();
    if(correctMatch) correct = correctMatch[1].toUpperCase();

    // If not found, infer correct from green/correct option class.
    if(!correct) {
      const correctEl = document.querySelector(".single-question-card .option.correct, .single-question-card .option.is-correct, .single-question-card .option[data-correct='true']");
      if(correctEl) {
        const idx = Array.from(document.querySelectorAll(".single-question-card .option")).indexOf(correctEl);
        correct = "ABCD"[idx] || "";
      }
    }

    // If only correct state and clicked selected is styled.
    if(!chosen) {
      const selectedEl = document.querySelector(".single-question-card .option.selected, .single-question-card .option.is-selected, .single-question-card .option[aria-pressed='true']");
      if(selectedEl) {
        const idx = Array.from(document.querySelectorAll(".single-question-card .option")).indexOf(selectedEl);
        chosen = "ABCD"[idx] || "";
      }
    }

    if(!chosen && correct) chosen = correct;
    if(!correct && chosen) correct = chosen;

    return {chosen: chosen, correct: correct};
  }

  function extractMainExplanation(container){
    const raw = cleanTextV85(container ? container.textContent : "");
    if(!raw) return "";

    // Prefer text after Objetivo or Explicación, but keep compact.
    let exp = raw;
    const markers = ["Objetivo:", "Explicación:", "Explicacion:", "Por qué:", "Por que:"];
    for(const marker of markers){
      const i = raw.toLowerCase().indexOf(marker.toLowerCase());
      if(i >= 0) {
        exp = raw.slice(i + marker.length).trim();
        break;
      }
    }

    exp = exp
      .replace(/TU RESPUESTA\s*[A-D]?.*$/i, "")
      .replace(/RESPUESTA CORRECTA\s*[A-D]?.*$/i, "")
      .replace(/^correcto?\s*/i, "")
      .replace(/^incorrecto?\s*/i, "")
      .trim();

    if(exp.length > 260) exp = exp.slice(0, 257).trim() + "…";
    return exp || "Revisa la relación entre el concepto preguntado y la opción correcta.";
  }

  function buildDistractorDetails(options, correct, chosen){
    const rows = [];
    options.forEach(function(opt){
      if(opt.letter === correct) return;
      let reason = "No corresponde al concepto central preguntado.";
      if(chosen && opt.letter === chosen) {
        reason = "Fue tu distractor: parece plausible, pero no responde con precisión al mecanismo central.";
      }
      rows.push('<div class="compact-option-row"><strong>' + opt.letter + '.</strong> ' + opt.text + '<br><em>' + reason + '</em></div>');
    });
    return rows.join("");
  }

  function makeCompactFeedback(){
    if(!isPracticePage()) return;
    if(!document.body.classList.contains("practice-focus")) return;

    compactToolButtons();

    const container = findFeedbackContainer();
    if(!container || container.classList.contains("compact-feedback-ready")) return;
    if(container.closest(".compact-feedback-card") || container.querySelector(".compact-feedback-card")) return;

    const txt = cleanTextV85(container.textContent);
    if(!/(correct|incorrect|respuesta|objetivo|explicación)/i.test(txt)) return;

    const options = getOptionTexts();
    const state = detectCorrectState(container);
    const letters = findChosenAndCorrect(container, options);
    const chosen = letters.chosen || "";
    const correct = letters.correct || chosen || "A";
    const correctOption = options.find(function(o){ return o.letter === correct; });
    const chosenOption = options.find(function(o){ return o.letter === chosen; });
    const explanation = extractMainExplanation(container);
    const isCorrect = state === false ? false : (chosen && correct ? chosen === correct : state !== false);

    const title = isCorrect ? "Correcto ✅" : "Incorrecto ❌";
    const line = isCorrect
      ? '<p class="compact-feedback-line"><strong>' + correct + '</strong> era la buena respuesta.</p>'
      : '<p class="compact-feedback-line"><strong>Tu respuesta:</strong> ' + (chosen || "—") + '</p><p class="compact-feedback-line"><strong>Correcta:</strong> ' + correct + '</p>';

    const correctText = correctOption ? correctOption.text : "";
    const chosenText = chosenOption ? chosenOption.text : "";
    const whyWrong = !isCorrect && chosenText
      ? "Tu opción era un distractor plausible, pero la respuesta correcta es más precisa para el mecanismo preguntado."
      : explanation;

    const why = isCorrect
      ? explanation
      : (whyWrong + (correctText ? " La opción correcta afirma: “" + correctText + "”." : ""));

    const card = document.createElement("div");
    card.className = "compact-feedback-card " + (isCorrect ? "is-correct" : "is-wrong");
    card.innerHTML =
      '<h4 class="compact-feedback-title">' + title + '</h4>' +
      line +
      '<div class="compact-feedback-why"><strong>Por qué</strong><p>' + why + '</p></div>';

    const details = document.createElement("details");
    details.className = "compact-option-details";
    details.innerHTML =
      '<summary data-v86-see-more="1">Ver más</summary>' +
      '<div class="compact-option-list">' + buildDistractorDetails(options, correct, chosen) + '</div>';

    const nextBar = document.createElement("div");
    nextBar.className = "compact-next-bar";

    // Try to clone existing next button if present.
    const nextBtn = Array.from(document.querySelectorAll(".single-question-card button, .single-question-card a")).find(function(el){
      return /siguiente|continuer|próxima|proxima|next/i.test(el.textContent || "");
    });

    if(nextBtn) {
      const clone = nextBtn.cloneNode(true);
      clone.textContent = "Siguiente";
      clone.addEventListener("click", function(ev){
        ev.preventDefault();
        nextBtn.click();
      });
      nextBar.appendChild(clone);
    } else {
      const b = document.createElement("button");
      b.className = "btn primary";
      b.type = "button";
      b.textContent = "Siguiente";
      b.addEventListener("click", function(){
        const btn = Array.from(document.querySelectorAll("button, a")).find(function(el){
          return /siguiente|continuer|próxima|proxima|next/i.test(el.textContent || "");
        });
        if(btn) btn.click();
      });
      nextBar.appendChild(b);
    }

    container.classList.add("compact-feedback-ready");
    container.prepend(nextBar);
    container.prepend(details);
    container.prepend(card);
  }

  function applyV85CompactCorrection(){
    if(!isPracticePage()) return;
    compactToolButtons();
    makeCompactFeedback();
  }

  document.addEventListener("DOMContentLoaded", applyV85CompactCorrection);
  window.addEventListener("load", applyV85CompactCorrection);
  document.addEventListener("click", function(){ setTimeout(applyV85CompactCorrection, 100); });
  document.addEventListener("change", function(){ setTimeout(applyV85CompactCorrection, 100); });
})();




(function(){
  const LABELS_V86 = {
    es: {
      hint: "Pista",
      eliminate: "Eliminar 2",
      review: "Revisar",
      seeAnswer: "Ver respuesta",
      seeMore: "Ver más",
      next: "Siguiente",
      why: "Por qué",
      correct: "Correcto ✅",
      incorrect: "Incorrecto ❌",
      yourAnswer: "Tu respuesta",
      correctAnswer: "Correcta"
    },
    fr: {
      hint: "Indice",
      eliminate: "Éliminer 2",
      review: "À revoir",
      seeAnswer: "Voir la réponse",
      seeMore: "Voir plus",
      next: "Suivant",
      why: "Pourquoi",
      correct: "Correct ✅",
      incorrect: "Incorrect ❌",
      yourAnswer: "Ta réponse",
      correctAnswer: "Réponse correcte"
    },
    br: {
      hint: "Dica",
      eliminate: "Eliminar 2",
      review: "Revisar",
      seeAnswer: "Ver resposta",
      seeMore: "Ver mais",
      next: "Próxima",
      why: "Por quê",
      correct: "Correto ✅",
      incorrect: "Incorreto ❌",
      yourAnswer: "Sua resposta",
      correctAnswer: "Correta"
    }
  };

  function langV86(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .language-switcher .active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function tV86(key){
    const lang = langV86();
    return (LABELS_V86[lang] && LABELS_V86[lang][key]) || LABELS_V86.es[key] || key;
  }

  function cleanGenericV86(s){
    return String(s || "")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/nivele{1}s{2,}/gi, "niveles")
      .replace(/Casos clínicos/g, "Casos clínicos");
  }

  function applyLabelsV86(){
    if(!/qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname)) return;

    document.querySelectorAll("button, a, summary").forEach(function(el){
      let txt = cleanGenericV86((el.textContent || "").trim()).replace(/\s+/g, " ");

      if(/^Pista$/i.test(txt) || /^Indice$/i.test(txt) || /^Dica$/i.test(txt)) el.textContent = tV86("hint");
      else if(/Eliminar\s*2/i.test(txt) || /^Éliminer\s*2$/i.test(txt)) el.textContent = tV86("eliminate");
      else if(/Marcar\s*para\s*revisar/i.test(txt) || /^Revisar$/i.test(txt) || /^À revoir$/i.test(txt)) el.textContent = tV86("review");
      else if(/No\s*(la\s*)?sé/i.test(txt) || /^Ver respuesta$/i.test(txt) || /^Voir la réponse$/i.test(txt) || /^Ver resposta$/i.test(txt)) el.textContent = tV86("seeAnswer");
      else if(/^Ver más/i.test(txt) || /^Voir plus/i.test(txt) || /^Ver mais/i.test(txt)) el.textContent = tV86("seeMore");
      else if(/^Siguiente$/i.test(txt) || /^Suivant$/i.test(txt) || /^Próxima$/i.test(txt)) el.textContent = tV86("next");
    });

    document.querySelectorAll("[data-v86-see-more='1'], details.compact-option-details summary").forEach(function(el){
      el.textContent = tV86("seeMore");
    });

    document.querySelectorAll(".compact-feedback-title").forEach(function(el){
      const txt = el.textContent || "";
      if(/incorrect/i.test(txt) || /incorreto/i.test(txt)) el.textContent = tV86("incorrect");
      else if(/correct/i.test(txt) || /correto/i.test(txt)) el.textContent = tV86("correct");
    });

    document.querySelectorAll(".compact-feedback-why strong").forEach(function(el){
      el.textContent = tV86("why");
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const old = node.nodeValue || "";
      const cleaned = cleanGenericV86(old);
      if(old !== cleaned) node.nodeValue = cleaned;
    });
  }

  window.MED_LABELS_V86 = { apply: applyLabelsV86, labels: LABELS_V86 };

  document.addEventListener("DOMContentLoaded", applyLabelsV86);
  window.addEventListener("load", applyLabelsV86);
  document.addEventListener("pageshow", applyLabelsV86);
  document.addEventListener("click", function(){ setTimeout(applyLabelsV86, 90); });
  document.addEventListener("change", function(){ setTimeout(applyLabelsV86, 90); });
})();




(function(){
  function isPracticeV87(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function txtV87(el){
    return String(el && el.textContent || "")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/niveles/gi, "niveles")
      .replace(/niveles/gi, "niveles")
      .replace(/\s+/g, " ")
      .trim();
  }

  function langV87(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function labelV87(key){
    const d = {
      es: { stats: "Ver estadísticas", serie: "Serie", acierto: "Acierto", banco: "Banco", pregunta: "Pregunta", nos: "No sé" },
      fr: { stats: "Voir statistiques", serie: "Série", acierto: "Réussite", banco: "Banque", pregunta: "Question", nos: "Je ne sais pas" },
      br: { stats: "Ver estatísticas", serie: "Série", acierto: "Acerto", banco: "Banco", pregunta: "Pergunta", nos: "Não sei" }
    };
    const lang = langV87();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function parseStatsV87(){
    const headbox = document.querySelector(".practice-headbox:not(.practice-stats-clone)");
    const allText = txtV87(headbox || document.body);

    function grab(label){
      const re = new RegExp(label + "\\s*(\\d+\\s*/\\s*\\d+|\\d+)", "i");
      const m = allText.match(re);
      return m ? m[1].replace(/\s+/g, "") : "";
    }

    let question = grab("PREGUNTA") || grab("Pregunta");
    let banco = grab("BANCO TOTAL") || grab("Banco total") || "";
    let global = grab("GLOBAL") || "";
    let serie = grab("SERIE 1") || grab("Serie 1") || "";
    let noSe = grab("NO SÉ") || grab("No sé") || "0";

    const percentages = Array.from(allText.matchAll(/(\d{1,3})%/g)).map(m => m[1] + "%");
    let seriePct = percentages[0] || "";
    let aciertoPct = percentages[1] || percentages[0] || "";

    if(!question) {
      const summary = document.querySelector(".practice-live-summary");
      const sumText = txtV87(summary);
      const m = sumText.match(/(\d+\/\d+)/);
      if(m) question = m[1];
    }

    if(!banco) {
      const sumText = txtV87(document.querySelector(".practice-live-summary"));
      const m = sumText.match(/Banco\s*(\d+)/i);
      if(m) banco = m[1];
    } else {
      banco = banco.replace(/\D/g, "") || banco;
    }

    return {question, banco, global, serie, noSe, seriePct, aciertoPct, headbox};
  }

  function correctWrongCounts(global){
    let correct = "0", wrong = "0";
    const m = String(global || "").match(/(\d+)\s*\/\s*(\d+)/);
    if(m){
      correct = m[1];
      wrong = String(Math.max(0, parseInt(m[2], 10) - parseInt(m[1], 10)));
    }
    return {correct, wrong};
  }

  function makeProgress(label, pct){
    const val = pct || "0%";
    return '<div class="practice-mini-progress-line"><span>' + label + '</span><div class="practice-mini-progress-bar"><span class="practice-mini-progress-fill" style="--w:' + val + '"></span></div><strong>' + val + '</strong></div>';
  }

  function makeCompactTrackerV87(){
    if(!isPracticeV87()) return;
    if(!document.body.classList.contains("practice-focus")) return;

    const list = document.querySelector("#practiceList");
    const card = document.querySelector(".single-question-card");
    if(!list || !card) return;

    const data = parseStatsV87();
    const counts = correctWrongCounts(data.global);

    let tracker = list.querySelector(".practice-compact-tracker");
    if(!tracker){
      tracker = document.createElement("div");
      tracker.className = "practice-compact-tracker";
      card.insertAdjacentElement("afterend", tracker);
    }

    tracker.innerHTML =
      '<div class="practice-compact-tracker-row">' +
        '<span class="practice-track-pill is-main">' + (data.question || "1/20") + '</span>' +
        '<span class="practice-track-pill is-good">✅ ' + counts.correct + '</span>' +
        '<span class="practice-track-pill is-bad">❌ ' + counts.wrong + '</span>' +
        '<span class="practice-track-pill is-neutral">🤷 ' + (data.noSe || "0") + '</span>' +
        '<span class="practice-track-pill">' + (data.aciertoPct || "0%") + '</span>' +
        (data.banco ? '<span class="practice-track-pill is-neutral">' + labelV87("banco") + ' ' + data.banco + '</span>' : '') +
      '</div>' +
      '<div class="practice-mini-progress">' +
        makeProgress(labelV87("serie"), data.seriePct || "0%") +
        makeProgress(labelV87("acierto"), data.aciertoPct || "0%") +
      '</div>';

    // Hide original stats and move clone into details.
    if(data.headbox && !data.headbox.classList.contains("practice-stats-original-hidden")){
      data.headbox.classList.add("practice-stats-original-hidden");
    }

    let details = list.querySelector("details.practice-stats-details");
    if(!details){
      details = document.createElement("details");
      details.className = "practice-stats-details";
      details.innerHTML = '<summary>' + labelV87("stats") + '</summary><div class="practice-stats-details-body"></div>';
      tracker.insertAdjacentElement("afterend", details);
    } else {
      const summary = details.querySelector("summary");
      if(summary) summary.textContent = labelV87("stats");
    }

    const body = details.querySelector(".practice-stats-details-body");
    if(body && data.headbox){
      const clone = data.headbox.cloneNode(true);
      clone.classList.remove("practice-stats-original-hidden");
      clone.classList.add("practice-stats-clone");
      body.innerHTML = "";
      body.appendChild(clone);
    }

    // Convert big coach banner into a tiny toast.
    const coach = document.querySelector(".coach-banner:not(.practice-mini-toast)");
    if(coach){
      let toast = list.querySelector(".practice-mini-toast");
      if(!toast){
        toast = document.createElement("div");
        toast.className = "practice-mini-toast";
        details.insertAdjacentElement("afterend", toast);
      }
      let message = txtV87(coach);
      if(message.length > 72) message = message.slice(0, 69).trim() + "…";
      toast.textContent = message;
    }
  }

  function applyV87Tracker(){
    makeCompactTrackerV87();
  }

  document.addEventListener("DOMContentLoaded", applyV87Tracker);
  window.addEventListener("load", applyV87Tracker);
  document.addEventListener("pageshow", applyV87Tracker);
  document.addEventListener("click", function(){ setTimeout(applyV87Tracker, 120); });
  document.addEventListener("change", function(){ setTimeout(applyV87Tracker, 120); });
})();




(function(){
  function isPracticeV88(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV88(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function labelV88(key){
    const d = {
      es: {
        subject: "Materia",
        module: "Módulo",
        subjectBank: "Total",
        moduleBank: "Total",
        bankNoteSubject: "Total = todas las preguntas QCM disponibles en la materia seleccionada.",
        bankNoteModule: "Total = preguntas disponibles solo en el módulo seleccionado."
      },
      fr: {
        subject: "Matière",
        module: "Module",
        subjectBank: "Total",
        moduleBank: "Total",
        bankNoteSubject: "Total = toutes les questions QCM disponibles dans la matière sélectionnée.",
        bankNoteModule: "Total = questions disponibles seulement dans le module sélectionné."
      },
      br: {
        subject: "Matéria",
        module: "Módulo",
        subjectBank: "Total",
        moduleBank: "Total",
        bankNoteSubject: "Total = todas as questões QCM disponíveis na matéria selecionada.",
        bankNoteModule: "Total = questões disponíveis apenas no módulo selecionado."
      }
    };
    const lang = langV88();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txtV88(x){
    return String((x && x.textContent) || x || "")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/niveles/gi, "niveles")
      .replace(/niveles/gi, "niveles")
      .replace(/\s+/g, " ")
      .trim();
  }

  function coursesV88(){
    const data = window.MED_COURSES_DATA || {};
    return data.courses || [];
  }

  function moduleByIdV88(id){
    if(!id) return null;
    for(const c of coursesV88()){
      for(const m of (c.modules || [])){
        if(m.id === id) return Object.assign({}, m, {courseId:c.id, courseTitle:c.title});
      }
    }
    return null;
  }

  function courseByIdV88(id){
    return coursesV88().find(c => c.id === id) || null;
  }

  function shortCourseV88(raw){
    raw = txtV88(raw);
    if(/fisiología|fisiologia/i.test(raw)) return "Fisiología";
    if(/microbiología|microbiologia/i.test(raw)) return "Microbiología";
    if(/genética|genetica/i.test(raw)) return "Genética";
    if(/bioquímica|bioquimica/i.test(raw)) return "Bioquímica";
    if(/inmunología|imunologia|immunologie/i.test(raw)) return "Inmunología";
    return raw.length > 18 ? raw.slice(0,17).trim() + "…" : raw;
  }

  function shortModuleV88(raw){
    raw = txtV88(raw).replace(/^Módulo\s*\d+\s*·?\s*/i, "").replace(/^Module\s*\d+\s*·?\s*/i, "");
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/electrocardiograma|ECG/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/transporte de membrana|membrana/i.test(raw)) return "Membrana";
    if(/neurofisiología|potencial de acción/i.test(raw)) return "Neuro";
    if(/anion gap|acidosis/i.test(raw)) return "Anion gap";
    if(/ácido-base|acido-base|acid-base|equilibrio ácido/i.test(raw)) return "Ácido-base";
    if(/renal/i.test(raw)) return "Renal";
    if(/respiratoria/i.test(raw)) return "Resp.";
    return raw.length > 18 ? raw.slice(0,17).trim() + "…" : raw;
  }

  function practiceModeV88(){
    const path = location.pathname;
    if(/cas-cliniques/.test(path)) return "Casos";
    if(/vrai-faux/.test(path)) return "V/F";
    if(/erreurs/.test(path)) return "Errores";
    if(/examen/.test(path)) return "Examen";
    return "QCM";
  }

  function queryV88(){
    return new URLSearchParams(location.search);
  }

  function selectedScopeV88(){
    const q = queryV88();
    const moduleId = q.get("module") || "";
    const mod = moduleByIdV88(moduleId);
    const courseId = q.get("course") || (mod && mod.courseId) || "";
    const course = courseByIdV88(courseId);
    return {
      moduleId,
      courseId,
      moduleTitle: mod ? mod.title : "",
      courseTitle: course ? course.title : ""
    };
  }

  function questionModuleV88(){
    const badge = Array.from(document.querySelectorAll(".single-question-card .quiz-head .badge")).find(b => /Módulo|Module/i.test(txtV88(b)));
    if(badge) return shortModuleV88(txtV88(badge));
    const scope = selectedScopeV88();
    if(scope.moduleTitle) return shortModuleV88(scope.moduleTitle);
    return "";
  }

  function questionNumberV88(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge");
    if(!badge) {
      const summary = document.querySelector(".practice-live-summary");
      const m = txtV88(summary).match(/(\d+\/\d+)/);
      return m ? m[1] : "";
    }
    const m = txtV88(badge).match(/(\d+\s*\/\s*\d+)/);
    return m ? m[1].replace(/\s+/g, "") : "";
  }

  function bankCountV88(){
    const panel = document.querySelector(".question-difficulty-panel");
    const text = txtV88(panel || document.querySelector(".practice-headbox") || "");
    const m = text.match(/Banco total\s*:?\s*(\d+)/i) || text.match(/\((\d{2,5})\)/);
    if(m) return m[1];
    const summary = txtV88(document.querySelector(".practice-live-summary"));
    const m2 = summary.match(/Banco\s*(?:materia|módulo|module)?\s*(\d+)/i);
    return m2 ? m2[1] : "";
  }

  function selectedDifficultyTextV88(){
    const sel = document.querySelector(".question-difficulty-panel select, .practice-mini-difficulty");
    if(!sel) return "";
    const opt = sel.options[sel.selectedIndex];
    let text = txtV88(opt ? opt.textContent : "");
    text = text.replace(/\(\d+\)/g, "").replace(/Aleatorio · todos los niveles/i, "Aleatorio").replace(/todos los niveles/i, "Aleatorio").trim();
    return text || "Aleatorio";
  }

  function copyDifficultySelectV88(){
    const original = document.querySelector(".question-difficulty-panel select, .practice-mini-difficulty");
    if(!original) return null;
    const wrap = document.createElement("div");
    wrap.className = "practice-mini-difficulty-wrap";
    const sel = document.createElement("select");
    sel.className = "practice-mini-difficulty";
    sel.setAttribute("aria-label", "Dificultad");
    Array.from(original.options || []).forEach(function(opt){
      const o = document.createElement("option");
      o.value = opt.value;
      o.selected = opt.selected;
      let text = txtV88(opt.textContent).replace(/\(\d+\)/g, "").replace(/Aleatorio · todos los niveles/i, "Aleatorio").replace(/todos los niveles/i, "Aleatorio").trim() || "Aleatorio";
      o.textContent = text;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function(){ if(sel.value) location.href = sel.value; });
    wrap.appendChild(sel);
    return wrap;
  }

  function rebuildSummaryV88(){
    if(!document.body.classList.contains("practice-focus")) return;
    const list = document.querySelector("#practiceList");
    const card = document.querySelector(".single-question-card");
    if(!list || !card) return;

    let summary = list.querySelector(".practice-live-summary");
    if(!summary){
      summary = document.createElement("div");
      summary.className = "practice-live-summary";
      list.insertBefore(summary, list.firstChild);
    }

    const scope = selectedScopeV88();
    const courseName = shortCourseV88(scope.courseTitle || scope.courseId || "");
    const moduleName = questionModuleV88();
    const qNum = questionNumberV88();
    const bank = bankCountV88();
    const moduleMode = !!scope.moduleId;
    const bankLabel = moduleMode ? labelV88("moduleBank") : labelV88("subjectBank");
    const diff = copyDifficultySelectV88();

    summary.innerHTML = "";

    function add(text, cls){
      if(!text) return;
      const span = document.createElement("span");
      if(cls) span.className = cls;
      span.textContent = text;
      summary.appendChild(span);
    }

    add(practiceModeV88(), "");
    add(courseName ? labelV88("subject") + ": " + courseName : "", "scope-pill subject-pill");
    add(qNum, "");
    add(moduleName ? labelV88("module") + ": " + moduleName : "", "module-pill");
    add(bank ? bankLabel + " " + bank : "", "bank-pill is-subject-bank");
    if(diff) summary.appendChild(diff);

    // Add a tiny note once, only if bank is subject-wide and current question module exists.
    let note = list.querySelector(".practice-bank-note");
    if(!note){
      note = document.createElement("div");
      note.className = "practice-bank-note";
      summary.insertAdjacentElement("afterend", note);
    }
    if(bank && moduleName && !moduleMode){
      note.innerHTML = "<strong>" + bankLabel + " " + bank + "</strong> · " + labelV88("bankNoteSubject");
      note.hidden = false;
    } else if(bank && moduleMode) {
      note.innerHTML = "<strong>" + bankLabel + " " + bank + "</strong> · " + labelV88("bankNoteModule");
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }

  function relabelTrackerV88(){
    const tracker = document.querySelector(".practice-compact-tracker");
    if(!tracker) return;
    const scope = selectedScopeV88();
    const bank = bankCountV88();
    const moduleMode = !!scope.moduleId;
    const bankLabel = moduleMode ? labelV88("moduleBank") : labelV88("subjectBank");
    if(bank){
      const pills = Array.from(tracker.querySelectorAll(".practice-track-pill"));
      const bankPill = pills.find(p => /Banco|Banque/.test(txtV88(p)) && /\d/.test(txtV88(p)));
      if(bankPill){
        bankPill.textContent = bankLabel + " " + bank;
        bankPill.classList.add("bank-scope-pill");
      }
    }
  }

  function applyV88BankScope(){
    if(!isPracticeV88()) return;
    rebuildSummaryV88();
    relabelTrackerV88();
  }

  document.addEventListener("DOMContentLoaded", applyV88BankScope);
  window.addEventListener("load", applyV88BankScope);
  document.addEventListener("pageshow", applyV88BankScope);
  document.addEventListener("click", function(){ setTimeout(applyV88BankScope, 180); });
  document.addEventListener("change", function(){ setTimeout(applyV88BankScope, 180); });
})();




(function(){
  function cleanV89Text(s){
    return String(s || "")
      .replace(/No\s+la\s+sé\s*[·\-]\s*corrección/gi, "Ver respuesta")
      .replace(/No\s+la\s+sé\s*[·\-]\s*ver\s+la\s+corrección/gi, "Ver respuesta")
      .replace(/Ver\s+autres\s+options/gi, "Ver más")
      .replace(/Ver\s+autre\s+option/gi, "Ver más")
      .replace(/todos\s+los\s+nivelesss/gi, "todos los niveles")
      .replace(/todos\s+los\s+niveless/gi, "todos los niveles")
      .replace(/nivelesss/gi, "niveles")
      .replace(/niveless/gi, "niveles");
  }
  function applyV89FinalCleanup(){
    if(!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const old = node.nodeValue || "";
      const cleaned = cleanV89Text(old);
      if(old !== cleaned) node.nodeValue = cleaned;
    });
    document.querySelectorAll("button, a, summary, option").forEach(function(el){
      const old = el.textContent || "";
      const cleaned = cleanV89Text(old);
      if(old !== cleaned) el.textContent = cleaned;
    });
  }
  document.addEventListener("DOMContentLoaded", applyV89FinalCleanup);
  window.addEventListener("load", applyV89FinalCleanup);
  document.addEventListener("click", function(){ setTimeout(applyV89FinalCleanup, 120); });
  document.addEventListener("change", function(){ setTimeout(applyV89FinalCleanup, 120); });
})();




(function(){
  function isPracticeV90(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV90(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function labelV90(key){
    const d = {
      es: { subject:"Materia", module:"Módulo", total:"Total" },
      fr: { subject:"Matière", module:"Module", total:"Total" },
      br: { subject:"Matéria", module:"Módulo", total:"Total" }
    };
    const lang = langV90();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txtV90(x){
    return String((x && x.textContent) || x || "")
      .replace(/Banco materia/gi, "Total")
      .replace(/Banco módulo/gi, "Total")
      .replace(/Banco matéria/gi, "Total")
      .replace(/Banque matière/gi, "Total")
      .replace(/Banque module/gi, "Total")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/nivelesss/gi, "niveles")
      .replace(/niveless/gi, "niveles")
      .replace(/\s+/g, " ")
      .trim();
  }

  function dataCoursesV90(){
    const data = window.MED_COURSES_DATA || {};
    return data.courses || [];
  }

  function bankV90(){
    return window.MED_PRACTICE_BANK || {};
  }

  function currentModeKeyV90(){
    const path = location.pathname;
    if(/cas-cliniques/.test(path)) return "cases";
    if(/vrai-faux/.test(path)) return "vf";
    if(/erreurs/.test(path)) return "qcm";
    if(/examen/.test(path)) return "qcm";
    return "qcm";
  }

  function queryV90(){
    return new URLSearchParams(location.search);
  }

  function moduleByIdV90(id){
    for(const c of dataCoursesV90()){
      for(const m of (c.modules || [])){
        if(m.id === id) return Object.assign({}, m, {courseId:c.id, courseTitle:c.title});
      }
    }
    return null;
  }

  function courseByIdV90(id){
    return dataCoursesV90().find(c => c.id === id) || null;
  }

  function scopeV90(){
    const q = queryV90();
    const moduleId = q.get("module") || "";
    const mod = moduleByIdV90(moduleId);
    const courseId = q.get("course") || (mod && mod.courseId) || inferCourseIdV90() || "";
    const course = courseByIdV90(courseId) || dataCoursesV90()[0] || null;
    return {
      moduleId,
      courseId: course ? course.id : courseId,
      courseTitle: course ? course.title : "",
      moduleTitle: mod ? mod.title : ""
    };
  }

  function inferCourseIdV90(){
    const summaryText = txtV90(document.querySelector(".practice-live-summary"));
    const cards = dataCoursesV90();
    for(const c of cards){
      if(summaryText.toLowerCase().includes(String(c.title || "").toLowerCase())) return c.id;
    }
    const badgeText = txtV90(document.querySelector(".single-question-card .quiz-head"));
    for(const c of cards){
      if(badgeText.toLowerCase().includes(String(c.title || "").toLowerCase())) return c.id;
    }
    return "";
  }

  function shortCourseV90(raw){
    raw = txtV90(raw);
    if(/fisiología|fisiologia/i.test(raw)) return "Fisiología";
    if(/microbiología|microbiologia/i.test(raw)) return "Microbiología";
    if(/genética|genetica/i.test(raw)) return "Genética";
    if(/bioquímica|bioquimica/i.test(raw)) return "Bioquímica";
    if(/inmunología|imunologia|immunologie/i.test(raw)) return "Inmunología";
    return raw.length > 18 ? raw.slice(0,17).trim() + "…" : raw;
  }

  function shortModuleV90(raw){
    raw = txtV90(raw).replace(/^Módulo\s*\d+\s*·?\s*/i, "").replace(/^Module\s*\d+\s*·?\s*/i, "");
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/streptococcus/i.test(raw)) return "Streptococcus";
    if(/staphylococcus/i.test(raw)) return "Staphylococcus";
    if(/enterobacter/i.test(raw)) return "Enterobacterias";
    if(/electrocardiograma|ECG/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/transporte de membrana|membrana/i.test(raw)) return "Membrana";
    if(/neurofisiología|potencial de acción/i.test(raw)) return "Neuro";
    if(/anion gap|acidosis/i.test(raw)) return "Anion gap";
    if(/ácido-base|acido-base|acid-base|equilibrio ácido/i.test(raw)) return "Ácido-base";
    if(/renal/i.test(raw)) return "Renal";
    if(/respiratoria/i.test(raw)) return "Resp.";
    return raw.length > 22 ? raw.slice(0,21).trim() + "…" : raw;
  }

  function questionModuleV90(){
    const badge = Array.from(document.querySelectorAll(".single-question-card .quiz-head .badge")).find(b => /Módulo|Module/i.test(txtV90(b)));
    if(badge) return txtV90(badge).replace(/^Módulo\s*\d+\s*·?\s*/i, "");
    const s = scopeV90();
    return s.moduleTitle || "";
  }

  function questionNumberV90(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge");
    if(badge){
      const m = txtV90(badge).match(/(\d+\s*\/\s*\d+)/);
      if(m) return m[1].replace(/\s+/g, "");
    }
    const summary = txtV90(document.querySelector(".practice-live-summary"));
    const m2 = summary.match(/(\d+\/\d+)/);
    return m2 ? m2[1] : "";
  }

  function totalCountV90(){
    const panel = document.querySelector(".question-difficulty-panel");
    const text = txtV90(panel || document.querySelector(".practice-headbox") || "");
    const m = text.match(/Banco total\s*:?\s*(\d+)/i) || text.match(/\((\d{2,5})\)/);
    if(m) return m[1];
    const summary = txtV90(document.querySelector(".practice-live-summary"));
    const m2 = summary.match(/(?:Total|Banco)\s*(\d+)/i);
    return m2 ? m2[1] : "";
  }

  function buildUrlV90(params){
    const q = queryV90();
    Object.keys(params).forEach(function(k){
      const v = params[k];
      if(v === null || v === undefined || v === "") q.delete(k);
      else q.set(k, v);
    });
    const qs = q.toString();
    return location.pathname + (qs ? "?" + qs : "");
  }

  function makeCourseSelectV90(scope){
    const wrap = document.createElement("div");
    wrap.className = "scope-select-wrap subject-select-wrap";
    const sel = document.createElement("select");
    sel.className = "scope-select subject-select";
    sel.setAttribute("aria-label", labelV90("subject"));
    dataCoursesV90().forEach(function(c){
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = labelV90("subject") + ": " + shortCourseV90(c.title);
      o.selected = c.id === scope.courseId;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function(){
      location.href = buildUrlV90({course: sel.value, module: null});
    });
    wrap.appendChild(sel);
    return wrap;
  }

  function makeModuleSelectV90(scope){
    const course = courseByIdV90(scope.courseId);
    const wrap = document.createElement("div");
    wrap.className = "scope-select-wrap module-select-wrap";
    const sel = document.createElement("select");
    sel.className = "scope-select module-select";
    sel.setAttribute("aria-label", labelV90("module"));

    const all = document.createElement("option");
    all.value = "";
    all.textContent = labelV90("module") + ": " + (questionModuleV90() ? shortModuleV90(questionModuleV90()) : "Todos");
    all.selected = !scope.moduleId;
    sel.appendChild(all);

    (course && course.modules || []).forEach(function(m){
      const o = document.createElement("option");
      o.value = m.id;
      o.textContent = labelV90("module") + ": " + shortModuleV90(m.title);
      o.selected = m.id === scope.moduleId;
      sel.appendChild(o);
    });

    sel.addEventListener("change", function(){
      if(sel.value) location.href = buildUrlV90({course: scope.courseId, module: sel.value});
      else location.href = buildUrlV90({course: scope.courseId, module: null});
    });
    wrap.appendChild(sel);
    return wrap;
  }

  function copyDifficultySelectV90(){
    const original = document.querySelector(".question-difficulty-panel select, .practice-mini-difficulty");
    if(!original) return null;
    const wrap = document.createElement("div");
    wrap.className = "practice-mini-difficulty-wrap";
    const sel = document.createElement("select");
    sel.className = "practice-mini-difficulty";
    sel.setAttribute("aria-label", "Dificultad");
    Array.from(original.options || []).forEach(function(opt){
      const o = document.createElement("option");
      o.value = opt.value;
      o.selected = opt.selected;
      let text = txtV90(opt.textContent).replace(/\(\d+\)/g, "").replace(/Aleatorio · todos los niveles/i, "Aleatorio").replace(/todos los niveles/i, "Aleatorio").trim() || "Aleatorio";
      o.textContent = text;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function(){ if(sel.value) location.href = sel.value; });
    wrap.appendChild(sel);
    return wrap;
  }

  function rebuildSummaryV90(){
    if(!document.body.classList.contains("practice-focus")) return;
    const list = document.querySelector("#practiceList");
    const card = document.querySelector(".single-question-card");
    if(!list || !card) return;

    const scope = scopeV90();
    const summary = list.querySelector(".practice-live-summary") || document.createElement("div");
    summary.className = "practice-live-summary";
    if(!summary.parentNode) list.insertBefore(summary, list.firstChild);
    summary.innerHTML = "";

    function add(text, cls){
      if(!text) return;
      const span = document.createElement("span");
      if(cls) span.className = cls;
      span.textContent = text;
      summary.appendChild(span);
    }

    // Do not add QCM/Casos mode here, because it already exists in the mode bar.
    summary.appendChild(makeCourseSelectV90(scope));

    const qNum = questionNumberV90();
    if(qNum) add(qNum, "question-pill");

    summary.appendChild(makeModuleSelectV90(scope));

    const total = totalCountV90();
    if(total) add(labelV90("total") + " " + total, "total-pill bank-pill");

    const diff = copyDifficultySelectV90();
    if(diff) summary.appendChild(diff);

    const note = list.querySelector(".practice-bank-note");
    if(note) note.hidden = true;
  }

  function relabelTrackerV90(){
    const tracker = document.querySelector(".practice-compact-tracker");
    if(!tracker) return;
    const total = totalCountV90();
    if(!total) return;
    const pills = Array.from(tracker.querySelectorAll(".practice-track-pill"));
    const bankPill = pills.find(p => /Banco|Banque|Total/.test(txtV90(p)) && /\d/.test(txtV90(p)));
    if(bankPill){
      bankPill.textContent = labelV90("total") + " " + total;
      bankPill.classList.add("bank-scope-pill");
    }
  }

  function applyV90ScopeFilters(){
    if(!isPracticeV90()) return;
    rebuildSummaryV90();
    relabelTrackerV90();
  }

  document.addEventListener("DOMContentLoaded", applyV90ScopeFilters);
  window.addEventListener("load", applyV90ScopeFilters);
  document.addEventListener("pageshow", applyV90ScopeFilters);
  document.addEventListener("click", function(){ setTimeout(applyV90ScopeFilters, 180); });
  document.addEventListener("change", function(){ setTimeout(applyV90ScopeFilters, 180); });
})();




(function(){
  function isPracticeV91(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV91(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function labelsV91(){
    const d = {
      es: { subject:"Mat.", module:"Mód.", total:"Total" },
      fr: { subject:"Mat.", module:"Mod.", total:"Total" },
      br: { subject:"Mat.", module:"Mód.", total:"Total" }
    };
    return d[langV91()] || d.es;
  }

  function cleanV91(s){
    return String(s || "")
      .replace(/Materia:/gi, "")
      .replace(/Matière:/gi, "")
      .replace(/Matéria:/gi, "")
      .replace(/Módulo:/gi, "")
      .replace(/Module:/gi, "")
      .replace(/Banco materia/gi, "Total")
      .replace(/Banco módulo/gi, "Total")
      .replace(/Banco matéria/gi, "Total")
      .replace(/Banque matière/gi, "Total")
      .replace(/Banque module/gi, "Total")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactSubjectNameV91(raw){
    raw = cleanV91(raw);
    if(/microbiología|microbiologia/i.test(raw)) return "Microbiología";
    if(/fisiología|fisiologia/i.test(raw)) return "Fisiología";
    if(/genética|genetica/i.test(raw)) return "Genética";
    if(/bioquímica|bioquimica/i.test(raw)) return "Bioquímica";
    if(/inmunología|imunologia/i.test(raw)) return "Inmunología";
    return raw.length > 18 ? raw.slice(0,17).trim() + "…" : raw;
  }

  function compactModuleNameV91(raw){
    raw = cleanV91(raw);
    if(/streptococcus/i.test(raw)) return "Streptococcus";
    if(/staphylococcus/i.test(raw)) return "Staphylococcus";
    if(/enterobacter/i.test(raw)) return "Enterobacterias";
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/electrocardiograma|ecg/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/membrana/i.test(raw)) return "Membrana";
    return raw.length > 20 ? raw.slice(0,19).trim() + "…" : raw;
  }

  function applyV91ReadableScopes(){
    if(!isPracticeV91()) return;
    const labels = labelsV91();

    document.querySelectorAll(".subject-select option").forEach(function(opt){
      const selected = opt.selected;
      const name = compactSubjectNameV91(opt.textContent);
      opt.textContent = labels.subject + " " + name;
      if(selected) opt.selected = true;
    });

    document.querySelectorAll(".module-select option").forEach(function(opt){
      const selected = opt.selected;
      const name = compactModuleNameV91(opt.textContent);
      opt.textContent = labels.module + " " + name;
      if(selected) opt.selected = true;
    });

    document.querySelectorAll(".total-pill, .bank-scope-pill").forEach(function(el){
      el.textContent = el.textContent.replace(/Banco materia|Banco módulo|Banco matéria|Banque matière|Banque module/gi, labels.total).replace(/\s+/g, " ").trim();
    });
  }

  document.addEventListener("DOMContentLoaded", applyV91ReadableScopes);
  window.addEventListener("load", applyV91ReadableScopes);
  document.addEventListener("pageshow", applyV91ReadableScopes);
  document.addEventListener("click", function(){ setTimeout(applyV91ReadableScopes, 200); });
  document.addEventListener("change", function(){ setTimeout(applyV91ReadableScopes, 200); });
})();



(function(){
  function applyV92ScopeSelectFixes(){
    if(!document.body.classList.contains("practice-focus")) return;
    document.querySelectorAll(".scope-select-wrap, .practice-mini-difficulty-wrap").forEach(function(el){
      if(el.tagName === "SPAN") {
        const repl = document.createElement("div");
        repl.className = el.className;
        while(el.firstChild) repl.appendChild(el.firstChild);
        el.replaceWith(repl);
      }
    });
  }
  document.addEventListener("DOMContentLoaded", applyV92ScopeSelectFixes);
  window.addEventListener("load", applyV92ScopeSelectFixes);
  document.addEventListener("pageshow", applyV92ScopeSelectFixes);
  document.addEventListener("click", function(){ setTimeout(applyV92ScopeSelectFixes, 120); });
})();



(function(){
  function isPracticeV93(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function applyV93DesktopClean(){
    if(!isPracticeV93()) return;
    document.body.classList.add("practice-focus");

    // Hide donation/support blocks that were designed for the home page but may remain in practice layout.
    document.querySelectorAll(".support-ribbon, .donation-panel, .support-panel, .pix-panel, .project-support, .solidarity, .donation-card").forEach(function(el){
      el.setAttribute("hidden", "hidden");
      el.style.display = "none";
    });

    // Normalize old difficulty text if still rendered by previous components.
    document.querySelectorAll("small, p, span, div").forEach(function(el){
      if(!el || !el.childNodes || el.childNodes.length > 1) return;
      const txt = el.textContent || "";
      if(/Aleatorio.*Normal.*Difícil.*Extremo/i.test(txt)){
        el.textContent = txt.replace(/Normal.*$/i, "").replace(/\s+/g, " ").trim();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", applyV93DesktopClean);
  window.addEventListener("load", applyV93DesktopClean);
  document.addEventListener("pageshow", applyV93DesktopClean);
  document.addEventListener("click", function(){ setTimeout(applyV93DesktopClean, 120); });
})();




(function(){
  function isPracticeV94(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function applyV94DesktopLaptopCleanup(){
    if(!isPracticeV94()) return;
    document.body.classList.add("practice-focus");

    // Remove old bottom difficulty/meta panels that were still visible on desktop.
    document.querySelectorAll(".question-difficulty-panel, .difficulty-row, .difficulty-filter, .bank-row, .practice-meta-row").forEach(function(el){
      if(!el.closest(".practice-live-summary")) {
        el.setAttribute("hidden", "hidden");
        el.style.display = "none";
      }
    });

    // Hide support/donation blocks while training.
    document.querySelectorAll(".support-ribbon, .donation-panel, .support-panel, .pix-panel, .project-support, .solidarity, .donation-card, .coach-banner").forEach(function(el){
      el.setAttribute("hidden", "hidden");
      el.style.display = "none";
    });

    // Clean impossible long difficulty text if any clone is generated later.
    document.querySelectorAll("small, p, span, div").forEach(function(el){
      if(!el || !el.childNodes || el.childNodes.length > 1) return;
      const txt = el.textContent || "";
      if(/Aleatorio.*Normal.*Difícil.*Extremo/i.test(txt)){
        el.textContent = txt.replace(/Normal.*$/i, "").replace(/\s+/g, " ").trim();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", applyV94DesktopLaptopCleanup);
  window.addEventListener("load", applyV94DesktopLaptopCleanup);
  document.addEventListener("pageshow", applyV94DesktopLaptopCleanup);
  document.addEventListener("click", function(){ setTimeout(applyV94DesktopLaptopCleanup, 140); });
  document.addEventListener("change", function(){ setTimeout(applyV94DesktopLaptopCleanup, 140); });
})();




(function(){
  function isPracticeV95(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV95(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function labelV95(key){
    const d = {
      es: {
        serie:"Serie",
        correct:"Correctas",
        errors:"Errores",
        unknown:"No sé",
        accuracy:"Acierto",
        total:"Total"
      },
      fr: {
        serie:"Série",
        correct:"Correctes",
        errors:"Erreurs",
        unknown:"Je ne sais pas",
        accuracy:"Réussite",
        total:"Total"
      },
      br: {
        serie:"Série",
        correct:"Corretas",
        errors:"Erros",
        unknown:"Não sei",
        accuracy:"Acerto",
        total:"Total"
      }
    };
    const lang = langV95();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txtV95(el){
    return String((el && el.textContent) || el || "")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/nivelesss/gi, "niveles")
      .replace(/niveless/gi, "niveles")
      .replace(/\s+/g, " ")
      .trim();
  }

  function statTextV95(){
    const parts = [];
    const selectors = [
      ".practice-headbox",
      ".practice-compact-tracker",
      "details.practice-stats-details",
      ".practice-live-summary"
    ];
    selectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        parts.push(txtV95(el));
      });
    });
    return parts.join(" ");
  }

  function parseV95Stats(){
    const all = statTextV95();

    function first(re, fallback){
      const m = all.match(re);
      return m ? m[1].replace(/\s+/g, "") : (fallback || "");
    }

    let q = first(/PREGUNTA\s*(\d+\s*\/\s*\d+)/i) || first(/(\d+\s*\/\s*\d+)/);
    let total = first(/Total\s*(\d+)/i) || first(/Banco\s*(?:total)?\s*:?\s*(\d+)/i);
    let global = first(/GLOBAL\s*(\d+\s*\/\s*\d+)/i);
    let serie = first(/SERIE\s*1?\s*(\d+\s*\/\s*\d+)/i);
    let unknown = first(/NO S[ÉE]\s*(\d+)/i, "0");

    const pcts = Array.from(all.matchAll(/(\d{1,3})%/g)).map(function(m){ return m[1] + "%"; });
    let seriePct = pcts[0] || "0%";
    let accuracy = pcts[pcts.length - 1] || pcts[0] || "0%";

    let correct = "0";
    let errors = "0";
    const gm = global.match(/(\d+)\/(\d+)/);
    if(gm){
      correct = gm[1];
      errors = String(Math.max(0, parseInt(gm[2], 10) - parseInt(gm[1], 10)));
    } else {
      const successPill = all.match(/✅\s*(\d+)/);
      const errorPill = all.match(/❌\s*(\d+)/);
      if(successPill) correct = successPill[1];
      if(errorPill) errors = errorPill[1];
    }

    if(!serie) serie = q || "1/20";

    return {
      q: q || "1/20",
      total: total || "",
      serie: serie,
      seriePct: seriePct,
      correct: correct,
      errors: errors,
      unknown: unknown,
      accuracy: accuracy
    };
  }

  function makePill(cls, label, value){
    const span = document.createElement("span");
    span.className = "hud-pill " + (cls || "");
    span.innerHTML = label ? label + " <strong>" + value + "</strong>" : "<strong>" + value + "</strong>";
    return span;
  }

  function buildV95Hud(){
    if(!isPracticeV95()) return;
    document.body.classList.add("practice-focus");

    const list = document.querySelector("#practiceList");
    const summary = document.querySelector(".practice-live-summary");
    if(!list || !summary) return;

    let hud = list.querySelector(".practice-hud-row");
    if(!hud){
      hud = document.createElement("div");
      hud.className = "practice-hud-row";
      summary.insertAdjacentElement("afterend", hud);
    }

    const s = parseV95Stats();
    hud.innerHTML = "";
    hud.appendChild(makePill("main", "", s.q));
    if(s.total) hud.appendChild(makePill("accent", labelV95("total"), s.total));
    hud.appendChild(makePill("neutral", labelV95("serie"), s.seriePct || s.serie));
    hud.appendChild(makePill("success", labelV95("correct"), s.correct));
    hud.appendChild(makePill("error", labelV95("errors"), s.errors));
    hud.appendChild(makePill("neutral", labelV95("unknown"), s.unknown));
    hud.appendChild(makePill("accent", labelV95("accuracy"), s.accuracy));

    // Remove duplicate visible score pills from filter row.
    summary.querySelectorAll(".question-pill, .total-pill").forEach(function(el){
      el.style.display = "none";
    });

    // Hide old lower blocks on desktop/tablet through runtime too.
    if(window.matchMedia("(min-width: 721px)").matches){
      document.querySelectorAll(".practice-compact-tracker, details.practice-stats-details, .practice-mini-toast, .coach-banner, .practice-headbox").forEach(function(el){
        if(!el.closest(".practice-hud-row")) {
          el.setAttribute("hidden", "hidden");
          el.style.display = "none";
        }
      });
    }
  }

  function applyV95PracticeHud(){
    buildV95Hud();
  }

  document.addEventListener("DOMContentLoaded", applyV95PracticeHud);
  window.addEventListener("load", applyV95PracticeHud);
  document.addEventListener("pageshow", applyV95PracticeHud);
  document.addEventListener("click", function(){ setTimeout(applyV95PracticeHud, 150); });
  document.addEventListener("change", function(){ setTimeout(applyV95PracticeHud, 150); });
})();




(function(){
  function isPracticeV96(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV96(){
    const active = document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function L96(key){
    const d = {
      es: {
        allModules: "Materia completa",
        allModulesShort: "Mat. completa",
        totalSubject: "Total materia",
        totalModule: "Total módulo",
        subject: "Mat.",
        module: "Mód."
      },
      fr: {
        allModules: "Matière complète",
        allModulesShort: "Mat. complète",
        totalSubject: "Total matière",
        totalModule: "Total module",
        subject: "Mat.",
        module: "Mod."
      },
      br: {
        allModules: "Matéria completa",
        allModulesShort: "Mat. completa",
        totalSubject: "Total matéria",
        totalModule: "Total módulo",
        subject: "Mat.",
        module: "Mód."
      }
    };
    const lang = langV96();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function text96(x){
    return String((x && x.textContent) || x || "")
      .replace(/todos los niveles+s*/gi, "todos los niveles")
      .replace(/nivelesss/gi, "niveles")
      .replace(/niveless/gi, "niveles")
      .replace(/\s+/g, " ")
      .trim();
  }

  function query96(){
    return new URLSearchParams(location.search);
  }

  function isModuleScoped96(){
    const q = query96();
    return !!(q.get("module"));
  }

  function cleanModuleAllOptions96(){
    document.querySelectorAll(".module-select option").forEach(function(opt, idx){
      const v = opt.value || "";
      const t = text96(opt);
      if(!v || idx === 0 || /todos|todas|completa|complete|completo/i.test(t)){
        opt.textContent = L96("module") + " " + L96("allModulesShort");
      }
    });

    document.querySelectorAll(".module-select").forEach(function(sel){
      if(!sel.value){
        const opt = sel.options[sel.selectedIndex] || sel.options[0];
        if(opt) opt.textContent = L96("module") + " " + L96("allModulesShort");
      }
    });
  }

  function relabelTotals96(){
    const scoped = isModuleScoped96();
    const totalLabel = scoped ? L96("totalModule") : L96("totalSubject");

    document.querySelectorAll(".total-pill, .bank-scope-pill, .hud-pill").forEach(function(el){
      let t = text96(el);
      const m = t.match(/(?:Total|Banco|Banque|Total materia|Total módulo|Total matière|Total module|Total matéria)\s*(\d+)/i);
      if(m){
        el.textContent = totalLabel + " " + m[1];
        el.classList.toggle("total-module", scoped);
        el.classList.toggle("total-subject", !scoped);
      }
    });
  }

  function removeInvisibleGaps96(){
    if(!isPracticeV96()) return;
    document.body.classList.add("practice-focus");

    document.querySelectorAll(".practice-quick-header, .practice-hero, .page-hero, .practice-mobile-filter-hint, #courseFilters, #practiceModeNav, #practiceBackLink, .question-difficulty-panel, .difficulty-row, .difficulty-filter, .bank-row, .practice-meta-row").forEach(function(el){
      if(!el.closest(".practice-live-summary")){
        el.setAttribute("hidden", "hidden");
        el.style.display = "none";
        el.style.height = "0px";
        el.style.margin = "0px";
        el.style.padding = "0px";
        el.style.pointerEvents = "none";
      }
    });
  }

  function applyV96ScopeFix(){
    if(!isPracticeV96()) return;
    cleanModuleAllOptions96();
    relabelTotals96();
    removeInvisibleGaps96();
  }

  document.addEventListener("DOMContentLoaded", applyV96ScopeFix);
  window.addEventListener("load", applyV96ScopeFix);
  document.addEventListener("pageshow", applyV96ScopeFix);
  document.addEventListener("click", function(){ setTimeout(applyV96ScopeFix, 160); });
  document.addEventListener("change", function(){ setTimeout(applyV96ScopeFix, 160); });
})();




(function(){
  function isPracticeV97(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function cleanTextV97(x){
    return String((x && x.textContent) || x || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeCounterV97(raw){
    raw = cleanTextV97(raw);
    // Fix merged counters like 1/20200, 2/20200, etc.
    let m = raw.match(/(\d{1,3})\s*\/\s*(20)(?:\d{2,5})\b/);
    if(m) return m[1] + "/" + m[2];

    m = raw.match(/(\d{1,3})\s*\/\s*(20)\b/);
    if(m) return m[1] + "/" + m[2];

    m = raw.match(/(\d{1,3})\s*\/\s*(\d{1,3})\b/);
    if(m) {
      const a = parseInt(m[1],10), b = parseInt(m[2],10);
      if(b > 0 && b <= 100) return a + "/" + b;
    }

    return raw;
  }

  function getQuestionCounterV97(){
    // Prefer exact badge inside the question card, because hidden stat text may merge 1/20 + 200.
    const badges = Array.from(document.querySelectorAll(".single-question-card .quiz-head .badge"));
    for(const b of badges){
      const t = cleanTextV97(b);
      if(/pregunta/i.test(t) && /\d+\s*\/\s*\d+/.test(t)){
        return normalizeCounterV97(t);
      }
    }

    const visible = Array.from(document.querySelectorAll(".question-pill, .hud-pill.main, .practice-live-summary span")).map(cleanTextV97).join(" ");
    return normalizeCounterV97(visible) || "1/20";
  }

  function removeGhostGapV97(){
    if(!isPracticeV97()) return;
    document.body.classList.add("practice-focus");

    document.querySelectorAll("#courseFilters, #practiceModeNav, #practiceBackLink, .practice-mobile-filter-hint, .practice-quick-header, .practice-hero, .page-hero, .question-difficulty-panel, .difficulty-row, .difficulty-filter, .bank-row, .practice-meta-row, .practice-bank-note").forEach(function(el){
      if(!el.closest(".practice-live-summary")){
        el.setAttribute("hidden", "hidden");
        el.style.display = "none";
        el.style.visibility = "hidden";
        el.style.opacity = "0";
        el.style.height = "0";
        el.style.maxHeight = "0";
        el.style.minHeight = "0";
        el.style.margin = "0";
        el.style.padding = "0";
        el.style.pointerEvents = "none";
        el.style.overflow = "hidden";
      }
    });
  }

  function fixCountersV97(){
    if(!isPracticeV97()) return;
    const clean = getQuestionCounterV97();

    document.querySelectorAll(".question-pill, .hud-pill.main").forEach(function(el){
      const t = cleanTextV97(el);
      if(/\d+\s*\/\s*\d+/.test(t)){
        if(el.classList.contains("hud-pill")){
          el.innerHTML = "<strong>" + clean + "</strong>";
        } else {
          el.textContent = clean;
        }
      }
    });

    // If v95 rebuilds the HUD later, force the first HUD pill to the clean counter.
    const hud = document.querySelector(".practice-hud-row");
    if(hud){
      const first = hud.querySelector(".hud-pill.main");
      if(first) first.innerHTML = "<strong>" + clean + "</strong>";
    }
  }

  function relabelAllModulesV97(){
    if(!isPracticeV97()) return;
    const q = new URLSearchParams(location.search);
    const moduleScoped = !!q.get("module");

    document.querySelectorAll(".module-select option").forEach(function(opt, idx){
      if(!opt.value || idx === 0){
        const txt = opt.textContent || "";
        if(!/completa|complete/i.test(txt)){
          if(document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith("fr")){
            opt.textContent = "Mod. Mat. complète";
          } else {
            opt.textContent = "Mód. Mat. completa";
          }
        }
      }
    });

    document.querySelectorAll(".total-pill, .hud-pill.accent").forEach(function(el){
      const t = cleanTextV97(el);
      const m = t.match(/(\d{2,5})/);
      if(m && /total/i.test(t)){
        if(moduleScoped) el.textContent = "Total módulo " + m[1];
        else el.textContent = "Total materia " + m[1];
      }
    });
  }

  function applyV97Fix(){
    removeGhostGapV97();
    fixCountersV97();
    relabelAllModulesV97();
  }

  document.addEventListener("DOMContentLoaded", applyV97Fix);
  window.addEventListener("load", applyV97Fix);
  document.addEventListener("pageshow", applyV97Fix);
  document.addEventListener("click", function(){ setTimeout(applyV97Fix, 120); });
  document.addEventListener("change", function(){ setTimeout(applyV97Fix, 120); });
})();




(function(){
  function isPracticeV98(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function desktopV98(){
    return window.matchMedia('(min-width: 1180px)').matches;
  }

  function fitSelectV98(sel, minW, maxW){
    if(!sel) return;
    const txt = (sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : sel.value || '').trim();
    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    const cs = getComputedStyle(sel);
    span.style.font = cs.font;
    span.style.fontWeight = cs.fontWeight;
    span.textContent = txt;
    document.body.appendChild(span);
    const w = Math.ceil(span.getBoundingClientRect().width) + 42;
    span.remove();
    const finalW = Math.max(minW || 110, Math.min(maxW || 250, w));
    sel.style.width = finalW + 'px';
    const wrap = sel.closest('.scope-select-wrap');
    if(wrap) wrap.style.width = finalW + 'px';
  }

  function wrapTopBarV98(){
    if(!isPracticeV98()) return;
    const summary = document.querySelector('.practice-live-summary');
    const hud = document.querySelector('.practice-hud-row');
    if(!summary || !hud) return;

    if(desktopV98()){
      let wrap = document.querySelector('.practice-summary-combined');
      if(!wrap){
        wrap = document.createElement('div');
        wrap.className = 'practice-summary-combined';
        summary.parentNode.insertBefore(wrap, summary);
      }
      wrap.appendChild(summary);
      wrap.appendChild(hud);
    } else {
      const wrap = document.querySelector('.practice-summary-combined');
      if(wrap){
        const parent = wrap.parentNode;
        parent.insertBefore(summary, wrap);
        parent.insertBefore(hud, summary.nextSibling);
        wrap.remove();
      }
      [summary, hud].forEach(function(el){
        el.style.width = '';
      });
    }
  }

  function compactHudLabelsV98(){
    if(!isPracticeV98()) return;
    document.querySelectorAll('.practice-hud-row .hud-pill').forEach(function(el){
      const raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if(/^Total\s+m[óo]dulo\s+/i.test(raw)){
        const num = raw.match(/(\d{1,5})$/);
        if(num) el.innerHTML = 'Total <strong>' + num[1] + '</strong>';
      }
      if(/^Total\s+materia\s+/i.test(raw)){
        const num = raw.match(/(\d{1,5})$/);
        if(num) el.innerHTML = 'Total <strong>' + num[1] + '</strong>';
      }
    });
  }

  function applyV98(){
    if(!isPracticeV98()) return;
    wrapTopBarV98();
    compactHudLabelsV98();
    const summary = document.querySelector('.practice-live-summary');
    if(summary && desktopV98()){
      fitSelectV98(summary.querySelector('.subject-select, .scope-select.subject-select'), 150, 230);
      fitSelectV98(summary.querySelector('.module-select, .scope-select.module-select'), 135, 220);
    } else if(summary) {
      summary.querySelectorAll('.scope-select').forEach(function(sel){ sel.style.width=''; const wrap = sel.closest('.scope-select-wrap'); if(wrap) wrap.style.width=''; });
    }
  }

  document.addEventListener('DOMContentLoaded', applyV98);
  window.addEventListener('load', applyV98);
  window.addEventListener('resize', function(){ clearTimeout(window.__v98rt); window.__v98rt=setTimeout(applyV98,120); });
  document.addEventListener('pageshow', applyV98);
  document.addEventListener('click', function(){ setTimeout(applyV98,120); });
  document.addEventListener('change', function(){ setTimeout(applyV98,120); });
})();



(function(){
  function currentLangV101(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function placeholderV101(){
    const lang = currentLangV101();
    if(lang === "fr") return "Rechercher...";
    if(lang === "br") return "Buscar...";
    return "Buscar...";
  }

  function applyHeaderSearchV101(){
    document.querySelectorAll(".global-search").forEach(function(box){
      const input = box.querySelector("input[type='search'], #globalSearchInput");
      if(!input) return;

      box.classList.add("global-search-v101");
      input.setAttribute("placeholder", placeholderV101());

      if(!box.querySelector(".global-search-submit-v101")){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "global-search-submit-v101";
        btn.setAttribute("aria-label", currentLangV101() === "fr" ? "Rechercher" : "Buscar");
        btn.textContent = "⌕";
        btn.addEventListener("click", function(){
          input.focus();
          input.dispatchEvent(new Event("input", {bubbles:true}));
        });
        box.appendChild(btn);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", applyHeaderSearchV101);
  window.addEventListener("load", applyHeaderSearchV101);
  document.addEventListener("pageshow", applyHeaderSearchV101);
  document.addEventListener("click", function(){ setTimeout(applyHeaderSearchV101, 80); });
})();




(function(){
  function isPracticeV102(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV102(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function L102(key){
    const d = {
      es: {
        confidence: "Confianza",
        sure: "Seguro",
        doubt: "Dudé",
        guess: "Adiviné",
        full: "Ver explicación completa",
        distractors: "Ver distractores",
        next: "Siguiente",
        correct: "Correcto",
        incorrect: "Incorrecto",
        goodAnswer: "Buena respuesta",
        why: "Por qué"
      },
      fr: {
        confidence: "Confiance",
        sure: "Sûr",
        doubt: "J’ai douté",
        guess: "J’ai deviné",
        full: "Voir l’explication complète",
        distractors: "Voir les distracteurs",
        next: "Suivant",
        correct: "Correct",
        incorrect: "Incorrect",
        goodAnswer: "Bonne réponse",
        why: "Pourquoi"
      },
      br: {
        confidence: "Confiança",
        sure: "Seguro",
        doubt: "Duvidei",
        guess: "Adivinhei",
        full: "Ver explicação completa",
        distractors: "Ver distratores",
        next: "Próxima",
        correct: "Correto",
        incorrect: "Incorreto",
        goodAnswer: "Resposta correta",
        why: "Por quê"
      }
    };
    const lang = langV102();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function textV102(x){
    return String((x && x.textContent) || x || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getQuestionCardV102(){
    return document.querySelector(".single-question-card") || document.querySelector(".question-card") || document.querySelector(".practice-card");
  }

  function findToolAreaV102(){
    const card = getQuestionCardV102();
    if(!card) return null;
    const toolCandidates = Array.from(card.querySelectorAll(".preanswer-tools, .single-tools, .question-tools, .answer-tools"));
    if(toolCandidates.length) return toolCandidates[0];

    const buttons = Array.from(card.querySelectorAll("button, a")).filter(function(el){
      return /Pista|Indice|Dica|Eliminar|Revisar|Marcar/i.test(textV102(el));
    });
    if(buttons.length){
      let parent = buttons[0].parentElement;
      while(parent && parent !== card){
        const count = Array.from(parent.querySelectorAll("button,a")).filter(function(b){
          return /Pista|Indice|Dica|Eliminar|Revisar|Marcar/i.test(textV102(b));
        }).length;
        if(count >= 2) return parent;
        parent = parent.parentElement;
      }
    }
    return null;
  }

  function moveConfidenceV102(){
    if(!isPracticeV102()) return;
    const tools = findToolAreaV102();
    if(!tools || tools.querySelector(".confidence-inline-v102")) return;

    // Hide old confidence blocks if present.
    document.querySelectorAll(".confidence-panel, .confidence-box, .nivel-confianza, [class*='confidence'], [class*='confianza']").forEach(function(el){
      if(!el.classList.contains("confidence-inline-v102")){
        el.classList.add("confidence-hidden-v102");
      }
    });

    const wrap = document.createElement("div");
    wrap.className = "confidence-inline-v102";
    wrap.setAttribute("aria-label", L102("confidence"));
    wrap.innerHTML =
      '<span class="confidence-label-v102">' + L102("confidence") + '</span>' +
      '<button type="button" data-confidence-v102="sure">' + L102("sure") + '</button>' +
      '<button type="button" data-confidence-v102="doubt">' + L102("doubt") + '</button>' +
      '<button type="button" data-confidence-v102="guess">' + L102("guess") + '</button>';

    tools.appendChild(wrap);

    wrap.querySelectorAll("button").forEach(function(btn){
      btn.addEventListener("click", function(){
        wrap.querySelectorAll("button").forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        try { localStorage.setItem("medCursosConfidence", btn.getAttribute("data-confidence-v102")); } catch(e) {}
      });
    });

    try {
      const saved = localStorage.getItem("medCursosConfidence");
      if(saved) {
        const b = wrap.querySelector('[data-confidence-v102="' + saved + '"]');
        if(b) b.classList.add("active");
      }
    } catch(e) {}
  }

  function getOptionsV102(){
    const card = getQuestionCardV102();
    if(!card) return [];
    const optionEls = Array.from(card.querySelectorAll(".option, button.option, [data-option-index]"));
    return optionEls.map(function(el, idx){
      let letter = "ABCD"[idx] || "";
      const letterNode = el.querySelector(".letter, .option-letter, span");
      if(letterNode){
        const raw = textV102(letterNode).replace(/[^A-D]/gi, "").slice(0,1).toUpperCase();
        if(raw) letter = raw;
      }
      let t = textV102(el);
      if(letter) t = t.replace(new RegExp("^" + letter + "\\s*"), "").trim();
      return {letter: letter, text: t};
    }).filter(function(o){ return o.letter && o.text; });
  }

  function findFeedbackContainerV102(){
    const card = getQuestionCardV102();
    if(!card) return null;
    const candidates = Array.from(card.querySelectorAll(
      ".compact-feedback-ready, .feedback, .answer-feedback, .correction, .result-panel, .explanation-panel, [class*='feedback'], [class*='correction'], [class*='explanation']"
    ));
    const visible = candidates.filter(function(el){
      const t = textV102(el);
      return t.length > 30 && /(correct|incorrect|respuesta|réponse|resposta|diagnóstico|diagnostico|punto clave|distractor|explicación|explicacao|explication)/i.test(t);
    });
    if(visible.length){
      visible.sort(function(a,b){ return textV102(b).length - textV102(a).length; });
      return visible[0];
    }
    return null;
  }

  function detectStateV102(txt){
    if(/incorrect|incorreto|faux|erron/i.test(txt)) return false;
    if(/correct|correto|bonne réponse|buena respuesta/i.test(txt)) return true;
    return null;
  }

  function parseLettersV102(txt, options){
    let chosen = "";
    let correct = "";
    const cm = txt.match(/(?:TU RESPUESTA|Ta réponse|Sua resposta)\s*([A-D])/i);
    const rm = txt.match(/(?:RESPUESTA CORRECTA|Réponse correcte|Resposta correta|Correcta)\s*([A-D])/i);
    if(cm) chosen = cm[1].toUpperCase();
    if(rm) correct = rm[1].toUpperCase();

    if(!correct){
      const correctEl = document.querySelector(".option.correct, .option.is-correct, .option[data-correct='true']");
      if(correctEl){
        const idx = Array.from(document.querySelectorAll(".option")).indexOf(correctEl);
        correct = "ABCD"[idx] || "";
      }
    }
    if(!chosen){
      const selectedEl = document.querySelector(".option.selected, .option.is-selected, .option[aria-pressed='true']");
      if(selectedEl){
        const idx = Array.from(document.querySelectorAll(".option")).indexOf(selectedEl);
        chosen = "ABCD"[idx] || "";
      }
    }
    if(!correct && chosen) correct = chosen;
    if(!chosen && correct) chosen = correct;

    return {chosen: chosen, correct: correct};
  }

  function extractShortWhyV102(txt){
    txt = String(txt || "").replace(/\s+/g, " ").trim();

    // Remove noisy headings.
    txt = txt
      .replace(/Punto clave.*$/i, "")
      .replace(/Por qué las otras son falsas.*$/i, "")
      .replace(/TU RESPUESTA.*?RESPUESTA CORRECTA/gi, "RESPUESTA CORRECTA")
      .replace(/Diagnóstico pedagógico/gi, "")
      .replace(/Diagnostico pedagogico/gi, "")
      .replace(/CORRECTO?|INCORRECTO?/gi, "")
      .replace(/Correct ✅|Correcto ✅|Correto ✅/gi, "");

    let markers = ["Por qué es correcta", "Por qué", "Porque", "Explicación", "Explication", "Por quê"];
    for(const m of markers){
      const idx = txt.toLowerCase().indexOf(m.toLowerCase());
      if(idx >= 0){
        txt = txt.slice(idx + m.length).replace(/^[:：\-]\s*/, "").trim();
        break;
      }
    }

    // Keep only first 1–2 sentences.
    const sentence = txt.match(/^(.{40,260}?[.!?])\s/);
    if(sentence) txt = sentence[1];

    if(txt.length > 220) txt = txt.slice(0, 217).trim() + "…";
    if(!txt) txt = "La respuesta correcta respeta el mecanismo central de la pregunta.";
    return txt;
  }

  function buildDistractorsV102(options, correct, chosen){
    return options.filter(function(o){ return o.letter !== correct; }).map(function(o){
      const extra = chosen === o.letter
        ? "Distractor elegido: parecía plausible, pero no era el mecanismo más preciso."
        : "Distractor: no responde con precisión al mecanismo solicitado.";
      return '<div class="distractor-row-v102"><strong>' + o.letter + '.</strong> ' + o.text + '<small>' + extra + '</small></div>';
    }).join("");
  }

  function compactFeedbackV102(){
    if(!isPracticeV102()) return;
    const container = findFeedbackContainerV102();
    if(!container || container.classList.contains("feedback-v102-ready")) return;

    const raw = textV102(container);
    if(!/(correct|incorrect|respuesta|réponse|resposta|diagnóstico|punto clave|distractor|explicación|explication)/i.test(raw)) return;

    const options = getOptionsV102();
    const letters = parseLettersV102(raw, options);
    const correct = letters.correct || "A";
    const chosen = letters.chosen || correct;
    const correctOption = options.find(function(o){ return o.letter === correct; });
    const isCorrect = detectStateV102(raw);
    const finalCorrect = isCorrect === false ? false : chosen === correct || isCorrect === true;
    const why = extractShortWhyV102(raw);

    const box = document.createElement("div");
    box.className = "answer-compact-v102 " + (finalCorrect ? "is-correct" : "is-wrong");
    box.innerHTML =
      '<div class="answer-topline-v102">' +
        '<strong>' + (finalCorrect ? L102("correct") : L102("incorrect")) + '</strong>' +
        '<span>' + L102("goodAnswer") + ' : <b>' + correct + '</b></span>' +
      '</div>' +
      '<p><b>' + L102("why") + ' :</b> ' + why + '</p>';

    const detailsFull = document.createElement("details");
    detailsFull.className = "answer-details-v102 explanation-v102";
    detailsFull.innerHTML = '<summary>' + L102("full") + '</summary><div class="answer-details-body-v102"></div>';
    detailsFull.querySelector(".answer-details-body-v102").appendChild(container.cloneNode(true));

    const detailsDistractors = document.createElement("details");
    detailsDistractors.className = "answer-details-v102 distractors-v102";
    detailsDistractors.innerHTML =
      '<summary>' + L102("distractors") + '</summary>' +
      '<div class="answer-details-body-v102">' + buildDistractorsV102(options, correct, chosen) + '</div>';

    container.classList.add("feedback-v102-ready");
    container.innerHTML = "";
    container.appendChild(box);
    container.appendChild(detailsFull);
    if(options.length > 1) container.appendChild(detailsDistractors);

    // Move next button visually closer if found outside feedback.
    const card = getQuestionCardV102();
    const next = Array.from((card || document).querySelectorAll("button, a")).find(function(el){
      return /Siguiente|Suivant|Próxima|Next/i.test(textV102(el)) && !container.contains(el);
    });
    if(next && !container.querySelector(".next-v102")){
      const clone = next.cloneNode(true);
      clone.classList.add("next-v102");
      clone.addEventListener("click", function(e){ e.preventDefault(); next.click(); });
      container.appendChild(clone);
    }
  }

  function removePuntoClaveV102(){
    if(!isPracticeV102()) return;
    document.querySelectorAll("*").forEach(function(el){
      if(el.children.length > 0) return;
      const t = textV102(el);
      if(/^Punto clave/i.test(t) || /^Point clé/i.test(t) || /^Ponto-chave/i.test(t)){
        const parent = el.closest("section, article, div, li") || el;
        parent.classList.add("punto-clave-hidden-v102");
      }
    });
  }

  function applyV102(){
    moveConfidenceV102();
    compactFeedbackV102();
    removePuntoClaveV102();
  }

  document.addEventListener("DOMContentLoaded", applyV102);
  window.addEventListener("load", applyV102);
  document.addEventListener("pageshow", applyV102);
  document.addEventListener("click", function(){ setTimeout(applyV102, 160); });
  document.addEventListener("change", function(){ setTimeout(applyV102, 160); });
})();




(function(){
  function isPracticeV103(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV103(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function L103(key){
    const d = {
      es: {
        sure: "Seguro",
        doubt: "Dudé",
        guess: "Adiviné",
        full: "Ver explicación útil",
        distractors: "Ver distractores",
        why: "Por qué"
      },
      fr: {
        sure: "Sûr",
        doubt: "J’ai douté",
        guess: "J’ai deviné",
        full: "Voir l’explication utile",
        distractors: "Voir les distracteurs",
        why: "Pourquoi"
      },
      br: {
        sure: "Seguro",
        doubt: "Duvidei",
        guess: "Adivinhei",
        full: "Ver explicação útil",
        distractors: "Ver distratores",
        why: "Por quê"
      }
    };
    const lang = langV103();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txtV103(x){
    return String((x && x.textContent) || x || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setConfidenceLabelsV103(){
    document.querySelectorAll("[data-confidence-v102='sure']").forEach(function(b){ b.textContent = L103("sure"); });
    document.querySelectorAll("[data-confidence-v102='doubt']").forEach(function(b){ b.textContent = L103("doubt"); });
    document.querySelectorAll("[data-confidence-v102='guess']").forEach(function(b){ b.textContent = L103("guess"); });
  }

  function extractAfterV103(text, labels){
    const low = text.toLowerCase();
    let start = -1;
    let used = "";
    labels.forEach(function(label){
      const idx = low.indexOf(label.toLowerCase());
      if(idx >= 0 && (start < 0 || idx < start)){
        start = idx;
        used = label;
      }
    });
    if(start < 0) return "";
    return text.slice(start + used.length).replace(/^[:：\-\s]+/, "").trim();
  }

  function stopAtV103(text, stops){
    let end = text.length;
    const low = text.toLowerCase();
    stops.forEach(function(stop){
      const idx = low.indexOf(stop.toLowerCase());
      if(idx > 0 && idx < end) end = idx;
    });
    return text.slice(0, end).trim();
  }

  function sentencesV103(text, maxChars){
    text = String(text || "").replace(/\s+/g, " ").trim();
    if(text.length <= maxChars) return text;
    const m = text.match(/^(.{50,300}?[.!?])\s/);
    if(m && m[1].length <= maxChars + 40) return m[1];
    return text.slice(0, maxChars - 1).trim() + "…";
  }

  function extractRealWhyV103(sourceText){
    let t = String(sourceText || "").replace(/\s+/g, " ").trim();

    // Prefer the real explanatory section, not the objective sentence.
    let why = extractAfterV103(t, [
      "Por qué es correcta",
      "Por que es correcta",
      "Por qué é correta",
      "Pourquoi c’est correct",
      "Pourquoi c'est correct",
      "Pourquoi elle est correcte"
    ]);

    if(why){
      why = stopAtV103(why, [
        "Por qué las otras son falsas",
        "Por que las otras son falsas",
        "Pourquoi les autres",
        "Por que as outras",
        "Punto clave",
        "Point clé",
        "Ponto-chave"
      ]);
      return sentencesV103(why, 240);
    }

    // Fallback: avoid the objective wording if possible.
    why = extractAfterV103(t, ["Por qué", "Porque", "Explicación", "Explication", "Por quê"]);
    why = stopAtV103(why, [
      "Ver más",
      "Siguiente",
      "Tu respuesta",
      "Respuesta correcta",
      "Diagnóstico pedagógico",
      "Por qué las otras son falsas",
      "Punto clave"
    ]);
    return sentencesV103(why, 220) || "La respuesta correcta respeta el mecanismo central de la pregunta.";
  }

  function removeOldDetailedNoiseV103(root){
    if(!root) return;
    const noisySelectors = [
      ".answer-compact-v102",
      ".next-v102",
      ".punto-clave-hidden-v102",
      ".compact-feedback-card",
      ".compact-feedback-ready"
    ];
    root.querySelectorAll(noisySelectors.join(",")).forEach(function(el){
      if(!el.closest(".answer-details-v102")) return;
      el.classList.add("details-noise-hidden-v103");
    });

    root.querySelectorAll("*").forEach(function(el){
      const t = txtV103(el);
      if(!t) return;

      if(/^Correcto? ✅?$/i.test(t) || /^Correct ✅?$/i.test(t) || /^Correto ✅?$/i.test(t)){
        el.classList.add("details-noise-hidden-v103");
      }
      if(/^Tu respuesta$/i.test(t) || /^Ta réponse$/i.test(t) || /^Sua resposta$/i.test(t)){
        const box = el.closest("div,section,article") || el;
        box.classList.add("details-noise-hidden-v103");
      }
      if(/^Respuesta correcta$/i.test(t) || /^Réponse correcte$/i.test(t) || /^Resposta correta$/i.test(t)){
        const box = el.closest("div,section,article") || el;
        box.classList.add("details-noise-hidden-v103");
      }
      if(/^Diagnóstico pedagógico$/i.test(t) || /^Diagnostico pedagogico$/i.test(t)){
        const box = el.closest("div,section,article") || el;
        box.classList.add("details-noise-hidden-v103");
      }
      if(/^Por qué es correcta$/i.test(t) || /^Por que es correcta$/i.test(t)){
        // This content is now promoted to the top "Por qué"; hide heading/block in details.
        const box = el.closest("div,section,article") || el;
        box.classList.add("details-noise-hidden-v103");
      }
      if(/^Punto clave/i.test(t) || /^Point clé/i.test(t) || /^Ponto-chave/i.test(t)){
        const box = el.closest("div,section,article") || el;
        box.classList.add("details-noise-hidden-v103");
      }
    });
  }

  function updateCompactWhyV103(){
    const feedbacks = document.querySelectorAll(".feedback-v102-ready");
    feedbacks.forEach(function(container){
      if(container.classList.contains("feedback-v103-cleaned")) return;

      // Get the original detailed text from the details clone if available.
      const detailsBody = container.querySelector(".answer-details-v102 .answer-details-body-v102");
      const source = detailsBody ? txtV103(detailsBody) : txtV103(container);
      const realWhy = extractRealWhyV103(source);

      const p = container.querySelector(".answer-compact-v102 p");
      if(p){
        p.innerHTML = "<b>" + L103("why") + " :</b> " + realWhy;
      }

      const fullSummary = container.querySelector(".answer-details-v102.explanation-v102 > summary");
      if(fullSummary) fullSummary.textContent = L103("full");

      const disSummary = container.querySelector(".answer-details-v102.distractors-v102 > summary");
      if(disSummary) disSummary.textContent = L103("distractors");

      removeOldDetailedNoiseV103(container);
      container.classList.add("feedback-v103-cleaned");
    });
  }

  function fixGluedTextV103(){
    // Fix small visual gluing like "...curso.Ver másB."
    document.querySelectorAll(".answer-compact-v102 p, .answer-details-body-v102").forEach(function(el){
      let html = el.innerHTML;
      html = html.replace(/curso\.Ver másB\./g, "curso.");
      html = html.replace(/curso\.Ver más/g, "curso.");
      html = html.replace(/\.Ver\s+/g, ". Ver ");
      if(html !== el.innerHTML) el.innerHTML = html;
    });
  }

  function applyV103(){
    setConfidenceLabelsV103();
    updateCompactWhyV103();
    fixGluedTextV103();
  }

  document.addEventListener("DOMContentLoaded", applyV103);
  window.addEventListener("load", applyV103);
  document.addEventListener("pageshow", applyV103);
  document.addEventListener("click", function(){ setTimeout(applyV103, 170); });
  document.addEventListener("change", function(){ setTimeout(applyV103, 170); });
})();




(function(){
  function isPracticeV104(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV104(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function L104(key){
    const d = {
      es: {
        useful: "Ver explicación útil",
        whyCorrect: "Por qué es correcta",
        reasoning: "Razonamiento",
        examTrap: "Trampa de examen",
        distractors: "Ver distractores",
        noDetail: "Esta respuesta es correcta porque respeta el mecanismo central de la pregunta y descarta los distractores que invierten causa, mecanismo o consecuencia."
      },
      fr: {
        useful: "Voir l’explication utile",
        whyCorrect: "Pourquoi c’est correct",
        reasoning: "Raisonnement",
        examTrap: "Piège d’examen",
        distractors: "Voir les distracteurs",
        noDetail: "Cette réponse est correcte car elle respecte le mécanisme central de la question et écarte les distracteurs qui inversent cause, mécanisme ou conséquence."
      },
      br: {
        useful: "Ver explicação útil",
        whyCorrect: "Por que está correta",
        reasoning: "Raciocínio",
        examTrap: "Pegadinha de prova",
        distractors: "Ver distratores",
        noDetail: "Esta resposta está correta porque respeita o mecanismo central da pergunta e elimina os distratores que invertem causa, mecanismo ou consequência."
      }
    };
    const lang = langV104();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txt104(x){
    return String((x && x.textContent) || x || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clean104(s){
    return String(s || "")
      .replace(/\s+/g, " ")
      .replace(/Correcto ✅?/gi, "")
      .replace(/Correct ✅?/gi, "")
      .replace(/Correto ✅?/gi, "")
      .replace(/TU RESPUESTA/gi, "")
      .replace(/RESPUESTA CORRECTA/gi, "")
      .replace(/Diagnóstico pedagógico/gi, "")
      .replace(/Diagnostico pedagogico/gi, "")
      .replace(/Punto clave.*$/gi, "")
      .replace(/curso\.Ver másB\./g, "curso.")
      .replace(/curso\.Ver más/g, "curso.")
      .trim();
  }

  function extractSection104(text, startLabels, stopLabels){
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    const low = raw.toLowerCase();
    let start = -1, used = "";
    startLabels.forEach(function(label){
      const idx = low.indexOf(label.toLowerCase());
      if(idx >= 0 && (start < 0 || idx < start)){
        start = idx;
        used = label;
      }
    });
    if(start < 0) return "";
    let out = raw.slice(start + used.length).replace(/^[:：\-\s]+/, "");
    const outLow = out.toLowerCase();
    let end = out.length;
    stopLabels.forEach(function(label){
      const idx = outLow.indexOf(label.toLowerCase());
      if(idx > 0 && idx < end) end = idx;
    });
    return clean104(out.slice(0, end));
  }

  function splitSentences104(text, maxSentences){
    const t = clean104(text);
    if(!t) return [];
    const parts = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [t];
    return parts.map(function(x){ return x.trim(); }).filter(Boolean).slice(0, maxSentences || 3);
  }

  function selectedOptionText104(letter){
    const options = Array.from(document.querySelectorAll(".option, button.option, [data-option-index]"));
    const idx = "ABCD".indexOf(letter || "");
    if(idx >= 0 && options[idx]){
      return txt104(options[idx]).replace(new RegExp("^" + letter + "\\s*"), "").trim();
    }
    return "";
  }

  function findCorrectLetter104(containerText){
    const txt = String(containerText || "");
    let m = txt.match(/(?:RESPUESTA CORRECTA|Resposta correta|Réponse correcte)\s*([A-D])/i);
    if(m) return m[1].toUpperCase();
    m = txt.match(/(?:Buena respuesta|Bonne réponse|Resposta correta)\s*:\s*([A-D])/i);
    if(m) return m[1].toUpperCase();
    const selected = document.querySelector(".option.correct, .option.is-correct, .option[data-correct='true']");
    if(selected){
      const idx = Array.from(document.querySelectorAll(".option")).indexOf(selected);
      return "ABCD"[idx] || "A";
    }
    return "A";
  }

  function buildUsefulExplanation104(sourceText, correctLetter){
    const why = extractSection104(sourceText, [
      "Por qué es correcta",
      "Por que es correcta",
      "Por qué é correta",
      "Pourquoi c’est correct",
      "Pourquoi c'est correct",
      "Por que está correta"
    ], [
      "Por qué las otras son falsas",
      "Por que las otras son falsas",
      "Pourquoi les autres",
      "Por que as outras",
      "Punto clave",
      "Point clé",
      "Ponto-chave"
    ]);

    const diagnosis = extractSection104(sourceText, [
      "Diagnóstico pedagógico",
      "Diagnostico pedagogico",
      "Diagnostic pédagogique",
      "Diagnóstico pedagógico"
    ], [
      "Por qué es correcta",
      "Por que es correcta",
      "Por qué las otras son falsas",
      "Punto clave"
    ]);

    let trap = extractSection104(sourceText, [
      "Por qué las otras son falsas",
      "Por que las otras son falsas",
      "Pourquoi les autres",
      "Por que as outras"
    ], [
      "Punto clave",
      "Point clé",
      "Ponto-chave"
    ]);

    const optionText = selectedOptionText104(correctLetter);
    const whySentences = splitSentences104(why || sourceText, 3);
    const diagnosisSentences = splitSentences104(diagnosis, 2);
    const trapSentences = splitSentences104(trap, 3);

    let html = "";
    html += '<div class="useful-explanation-v104">';
    html += '<div class="useful-block-v104">';
    html += '<strong>' + L104("whyCorrect") + '</strong>';
    if(optionText){
      html += '<p><b>' + correctLetter + '.</b> ' + optionText + '</p>';
    }
    if(whySentences.length){
      html += '<p>' + whySentences.join(" ") + '</p>';
    } else {
      html += '<p>' + L104("noDetail") + '</p>';
    }
    html += '</div>';

    if(diagnosisSentences.length){
      html += '<div class="useful-block-v104">';
      html += '<strong>' + L104("reasoning") + '</strong>';
      html += '<p>' + diagnosisSentences.join(" ") + '</p>';
      html += '</div>';
    }

    if(trapSentences.length){
      html += '<div class="useful-block-v104">';
      html += '<strong>' + L104("examTrap") + '</strong>';
      html += '<ul>' + trapSentences.map(function(s){ return '<li>' + s + '</li>'; }).join("") + '</ul>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function repairUsefulExplanation104(){
    if(!isPracticeV104()) return;
    document.querySelectorAll(".feedback-v102-ready").forEach(function(container){
      const full = container.querySelector("details.answer-details-v102.explanation-v102");
      if(!full) return;

      const body = full.querySelector(".answer-details-body-v102");
      const originalText = body ? txt104(body) : txt104(container);
      const correctLetter = findCorrectLetter104(txt104(container) + " " + originalText);

      const summary = full.querySelector("summary");
      if(summary) summary.textContent = L104("useful");

      if(body && !body.classList.contains("useful-v104-ready")){
        body.innerHTML = buildUsefulExplanation104(originalText || txt104(container), correctLetter);
        body.classList.add("useful-v104-ready");
      }

      const dis = container.querySelector("details.answer-details-v102.distractors-v102 > summary");
      if(dis) dis.textContent = L104("distractors");
    });
  }

  function applyV104(){
    repairUsefulExplanation104();
  }

  document.addEventListener("DOMContentLoaded", applyV104);
  window.addEventListener("load", applyV104);
  document.addEventListener("pageshow", applyV104);
  document.addEventListener("click", function(){ setTimeout(applyV104, 180); });
  document.addEventListener("change", function(){ setTimeout(applyV104, 180); });
})();




(function(){
  function isPracticeV105(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function textV105(el){
    return String((el && el.textContent) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function removeUsefulExplanationV105(){
    if(!isPracticeV105()) return;

    document.querySelectorAll("details.answer-details-v102.explanation-v102, details.explanation-v102").forEach(function(el){
      el.classList.add("removed-useful-explanation-v105");
      el.setAttribute("hidden", "hidden");
      el.style.display = "none";
    });

    // Defensive cleanup for any detail created without the expected class.
    document.querySelectorAll("details").forEach(function(el){
      var label = textV105(el.querySelector("summary") || el);
      if(/explicación útil|explication utile|explicação útil|explicación completa|explication complète|explicação completa/i.test(label)){
        el.classList.add("removed-useful-explanation-v105");
        el.setAttribute("hidden", "hidden");
        el.style.display = "none";
      }
    });

    // Keep distractors, but make sure it is not visually glued to the compact explanation.
    document.querySelectorAll("details.answer-details-v102.distractors-v102 > summary").forEach(function(summary){
      summary.textContent = summary.textContent
        .replace(/Ver explicación útil/i, "")
        .replace(/Voir l’explication utile/i, "")
        .replace(/Ver explicação útil/i, "")
        .trim() || "Ver distractores";
    });

    // Clean possible glued text in the short correction.
    document.querySelectorAll(".answer-compact-v102 p").forEach(function(p){
      p.innerHTML = p.innerHTML
        .replace(/Ver explicación útil/gi, "")
        .replace(/Voir l’explication utile/gi, "")
        .replace(/Ver explicação útil/gi, "")
        .replace(/\.Ver\s*/g, ". ")
        .replace(/\s+/g, " ")
        .trim();
    });
  }

  document.addEventListener("DOMContentLoaded", removeUsefulExplanationV105);
  window.addEventListener("load", removeUsefulExplanationV105);
  document.addEventListener("pageshow", removeUsefulExplanationV105);
  document.addEventListener("click", function(){ setTimeout(removeUsefulExplanationV105, 140); });
  document.addEventListener("change", function(){ setTimeout(removeUsefulExplanationV105, 140); });
})();




(function(){
  function isPracticeV106(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function langV106(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }

  function L106(key){
    const d = {
      es: {
        distractors: "Ver distractores",
        whyFalse: "Por qué es falsa",
        fallbackAbs: "La opción usa una formulación absoluta o aislada. En fisiología, el mecanismo depende de varias variables y no de un único factor.",
        fallbackOpposite: "La opción invierte el mecanismo correcto: cambia la causa o la consecuencia fisiológica esperada.",
        fallbackUnrelated: "La opción introduce un mecanismo que pertenece a otro sistema o a otra etapa del razonamiento.",
        fallbackGeneral: "La opción parece plausible por vocabulario, pero falla porque no explica el mecanismo solicitado en la pregunta."
      },
      fr: {
        distractors: "Voir les distracteurs",
        whyFalse: "Pourquoi c’est faux",
        fallbackAbs: "L’option utilise une formulation absolue ou isolée. En physiologie, le mécanisme dépend de plusieurs variables et pas d’un seul facteur.",
        fallbackOpposite: "L’option inverse le mécanisme correct : elle change la cause ou la conséquence physiologique attendue.",
        fallbackUnrelated: "L’option introduit un mécanisme appartenant à un autre système ou à une autre étape du raisonnement.",
        fallbackGeneral: "L’option paraît plausible par son vocabulaire, mais elle ne répond pas au mécanisme demandé par la question."
      },
      br: {
        distractors: "Ver distratores",
        whyFalse: "Por que é falsa",
        fallbackAbs: "A opção usa uma formulação absoluta ou isolada. Em fisiologia, o mecanismo depende de várias variáveis, não de um único fator.",
        fallbackOpposite: "A opção inverte o mecanismo correto: troca a causa ou a consequência fisiológica esperada.",
        fallbackUnrelated: "A opção introduz um mecanismo de outro sistema ou de outra etapa do raciocínio.",
        fallbackGeneral: "A opção parece plausível pelo vocabulário, mas não explica o mecanismo solicitado na pergunta."
      }
    };
    const lang = langV106();
    return (d[lang] && d[lang][key]) || d.es[key] || key;
  }

  function txt106(x){
    return String((x && x.textContent) || x || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clean106(s){
    return String(s || "")
      .replace(/\s+/g, " ")
      .replace(/Distractor elegido:.*$/i, "")
      .replace(/Distractor:.*$/i, "")
      .replace(/no responde con precisión al mecanismo solicitado\.?/gi, "")
      .replace(/parecía plausible, pero no era el mecanismo más preciso\.?/gi, "")
      .trim();
  }

  function getOptions106(){
    const card = document.querySelector(".single-question-card") || document;
    const optionEls = Array.from(card.querySelectorAll(".option, button.option, [data-option-index]"));
    return optionEls.map(function(el, idx){
      let letter = "ABCD"[idx] || "";
      const maybe = txt106(el.querySelector(".letter, .option-letter, span"));
      if(/^[A-D]$/i.test(maybe)) letter = maybe.toUpperCase();
      let text = txt106(el);
      if(letter) text = text.replace(new RegExp("^" + letter + "\\s*"), "").trim();
      text = text.replace(/\s*CORRECTA?$/i, "").trim();
      return {letter: letter, text: text};
    }).filter(function(o){ return o.letter && o.text; });
  }

  function correctLetter106(){
    const text = txt106(document.querySelector(".feedback-v102-ready") || document);
    let m = text.match(/(?:Buena respuesta|Bonne réponse|Resposta correta)\s*:\s*([A-D])/i);
    if(m) return m[1].toUpperCase();
    m = text.match(/(?:RESPUESTA CORRECTA|Réponse correcte|Resposta correta)\s*([A-D])/i);
    if(m) return m[1].toUpperCase();

    const correctEl = document.querySelector(".option.correct, .option.is-correct, .option[data-correct='true']");
    if(correctEl){
      const idx = Array.from(document.querySelectorAll(".option")).indexOf(correctEl);
      return "ABCD"[idx] || "A";
    }
    return "A";
  }

  function originalCorrectionText106(container){
    // Prefer hidden original clones, because they often still contain "Por qué las otras son falsas".
    const all = [];
    if(container) all.push(txt106(container));
    document.querySelectorAll(".answer-details-body-v102, .compact-feedback-card, .compact-feedback-ready, .feedback-v102-ready").forEach(function(el){
      all.push(txt106(el));
    });
    return all.join(" ");
  }

  function sectionAfter106(text, markers, stops){
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    const low = raw.toLowerCase();
    let start = -1, used = "";
    markers.forEach(function(m){
      const idx = low.indexOf(m.toLowerCase());
      if(idx >= 0 && (start < 0 || idx < start)){
        start = idx; used = m;
      }
    });
    if(start < 0) return "";
    let part = raw.slice(start + used.length).replace(/^[:：\-\s]+/, "");
    const lowPart = part.toLowerCase();
    let end = part.length;
    stops.forEach(function(s){
      const idx = lowPart.indexOf(s.toLowerCase());
      if(idx > 0 && idx < end) end = idx;
    });
    return clean106(part.slice(0, end));
  }

  function extractOriginalDistractorMap106(text){
    const map = {};
    const block = sectionAfter106(text, [
      "Por qué las otras son falsas",
      "Por que las otras son falsas",
      "Por qué los otros son falsos",
      "Pourquoi les autres",
      "Por que as outras"
    ], [
      "Punto clave",
      "Point clé",
      "Ponto-chave",
      "Siguiente",
      "Pregunta anterior"
    ]);

    if(!block) return map;

    // Match chunks like "B. text. justification. C. text..."
    const re = /(?:^|\s)([A-D])\.\s+(.+?)(?=\s+[A-D]\.\s+|$)/g;
    let m;
    while((m = re.exec(block)) !== null){
      const letter = m[1].toUpperCase();
      let content = clean106(m[2]);
      content = content.replace(/^[A-D]\s+/, "").trim();
      if(content.length > 8) map[letter] = content;
    }
    return map;
  }

  function inferWhyFalse106(optionText, correctText, questionText){
    const o = String(optionText || "").toLowerCase();
    const q = String(questionText || "").toLowerCase();

    if(/siempre|nunca|solo|único|unico|isolado|aislado|sin límite|sin limite|independiente/.test(o)){
      return L106("fallbackAbs");
    }

    if(/aumenta.*sin límite|introduce.*3\s*na|expulsa.*2\s*k|restando|diastólica.*sistólica|sistólica.*diastólica/.test(o)){
      return L106("fallbackOpposite");
    }

    if(/renal|ventilación|ventilacion|anion gap|hco3|respiratoria|túbulo|tubulo/.test(o) && !/renal|ventilación|anion gap|hco3|respiratoria|túbulo|tubulo/.test(q)){
      return L106("fallbackUnrelated");
    }

    return L106("fallbackGeneral");
  }

  function rebuildDistractors106(container){
    const details = container.querySelector("details.answer-details-v102.distractors-v102");
    if(!details) return;

    const summary = details.querySelector("summary");
    if(summary) summary.textContent = L106("distractors");

    const body = details.querySelector(".answer-details-body-v102");
    if(!body) return;

    const options = getOptions106();
    const correct = correctLetter106();
    const correctOpt = options.find(function(o){ return o.letter === correct; });
    const correctText = correctOpt ? correctOpt.text : "";
    const qText = txt106(document.querySelector(".question-prompt, .quiz-question, .question-text, .single-question-card h3") || "");
    const originalText = originalCorrectionText106(container);
    const originalMap = extractOriginalDistractorMap106(originalText);

    const rows = options.filter(function(o){ return o.letter !== correct; }).map(function(o){
      let why = originalMap[o.letter] || "";
      // If original map contains only the option wording and no reason, replace by inferred reason.
      const normalizedWhy = why.toLowerCase();
      const normalizedOpt = o.text.toLowerCase();
      if(!why || normalizedWhy === normalizedOpt || normalizedWhy.length < 25){
        why = inferWhyFalse106(o.text, correctText, qText);
      }

      return '<div class="distractor-row-v106">' +
        '<div class="distractor-option-v106"><strong>' + o.letter + '.</strong> ' + o.text + '</div>' +
        '<div class="distractor-reason-v106"><b>' + L106("whyFalse") + ' :</b> ' + why + '</div>' +
      '</div>';
    }).join("");

    body.innerHTML = rows || body.innerHTML;
    details.classList.add("distractors-v106-ready");
  }

  function applyV106(){
    if(!isPracticeV106()) return;
    document.querySelectorAll(".feedback-v102-ready").forEach(function(container){
      if(container.classList.contains("feedback-v106-ready")) return;
      rebuildDistractors106(container);
      container.classList.add("feedback-v106-ready");
    });
  }

  document.addEventListener("DOMContentLoaded", applyV106);
  window.addEventListener("load", applyV106);
  document.addEventListener("pageshow", applyV106);
  document.addEventListener("click", function(){ setTimeout(applyV106, 180); });
  document.addEventListener("change", function(){ setTimeout(applyV106, 180); });
})();




(function(){
  function isPracticeV107(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname);
  }

  function paramsV107(){
    return new URLSearchParams(location.search || "");
  }

  function pathTypeV107(){
    const p = location.pathname;
    if(/cas-cliniques/.test(p)) return "cases";
    if(/vrai-faux/.test(p)) return "vf";
    return "qcm";
  }

  function practiceTypeForKeyV107(){
    const p = location.pathname;
    if(/cas-cliniques/.test(p)) return "case";
    if(/vrai-faux/.test(p)) return "vf";
    return "qcm";
  }

  function getCoursesV107(){
    return (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || [];
  }

  function bankV107(){
    return window.MED_PRACTICE_BANK || {};
  }

  function moduleInfoV107(moduleId){
    for(const c of getCoursesV107()){
      for(const m of (c.modules || [])){
        if(m.id === moduleId) return {course:c, module:m};
      }
    }
    return null;
  }

  function courseIdV107(){
    const q = paramsV107();
    const moduleId = q.get("module") || "";
    if(q.get("course")) return q.get("course");
    if(moduleId){
      const info = moduleInfoV107(moduleId);
      if(info && info.course) return info.course.id;
      const b = bankV107();
      for(const cid in (b.byCourse || {})){
        const arr = (((b.byCourse || {})[cid] || {})[pathTypeV107()] || []);
        if(arr.some(x => x.moduleId === moduleId)) return cid;
      }
    }
    return "all";
  }

  function difficultyKeyV107(item){
    const raw = String(item && item.difficulty || "").toLowerCase();
    if(/normal|base|básico|basico/.test(raw)) return "normal";
    if(/difficile|difícil|dificil|moyen|medio|intermedio/.test(raw)) return "difficile";
    if(/extr/.test(raw)) return "extreme";
    if(/exam/.test(raw)) {
      const id = String(item.id || item.question || "");
      let h = 0;
      for(let i=0;i<id.length;i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      return Math.abs(h) % 2 === 0 ? "examen" : "extreme";
    }
    return "normal";
  }

  function activeDifficultyV107(){
    const q = paramsV107();
    const raw = q.get("difficulty") || q.get("level") || "all";
    return ["all","normal","difficile","extreme","examen"].includes(raw) ? raw : "all";
  }

  function baseItemsV107(){
    const b = bankV107();
    const type = pathTypeV107();
    const q = paramsV107();
    const cid = courseIdV107();
    const moduleId = q.get("module") || "";
    let items = [];
    Object.entries(b.byCourse || {}).forEach(function(entry){
      const courseId = entry[0], courseBank = entry[1] || {};
      if(cid !== "all" && courseId !== cid) return;
      items = items.concat(courseBank[type] || []);
    });
    if(moduleId) items = items.filter(x => x.moduleId === moduleId);
    return items;
  }

  function filteredItemsV107(){
    const diff = activeDifficultyV107();
    const base = baseItemsV107();
    if(diff === "all") return base;
    return base.filter(x => difficultyKeyV107(x) === diff);
  }

  function selectedScopeTotalV107(){
    // User meaning: full matter/module total, independent of current 20-question series.
    return baseItemsV107().length;
  }

  function sessionKeyV107(){
    const q = paramsV107();
    const exam = q.get("exam") === "1" ? "exam" : "study";
    const type = practiceTypeForKeyV107();
    const cid = q.get("course") || (courseIdV107() === "all" ? "all" : courseIdV107());
    const scope = q.get("module") || cid || "all";
    const diff = exam === "exam" ? "examen" : activeDifficultyV107();
    return "medPractice:v35-bugfix:" + exam + ":" + type + ":" + scope + ":" + diff;
  }

  function stateV107(){
    try{
      const raw = localStorage.getItem(sessionKeyV107());
      if(raw) return JSON.parse(raw) || {};
    }catch(e){}
    return {};
  }

  function readCounterFromCardV107(){
    const badge = document.querySelector(".single-question-card .quiz-head .badge");
    const t = (badge && badge.textContent || "").replace(/\s+/g," ").trim();
    const m = t.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if(m) return {current: Number(m[1]), total: Number(m[2])};
    return null;
  }

  function statsV107(){
    const st = stateV107();
    const cardCounter = readCounterFromCardV107();
    const filtered = filteredItemsV107();
    const batchLen = Array.isArray(st.currentBatch) && st.currentBatch.length ? st.currentBatch.length : Math.min(20, filtered.length || 20);
    const current = cardCounter ? cardCounter.current : Math.min(batchLen || 20, Number(st.currentIndex || 0) + 1);
    const totalSeries = cardCounter ? cardCounter.total : (batchLen || 20);
    const answered = Number(st.answered || 0);
    const correct = Number(st.correct || 0);
    const unknown = Number(st.unknown || 0);
    const errors = Math.max(0, answered - correct - unknown);
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    const seriesNumber = Number(st.seriesNumber || 1);
    return {
      current,
      totalSeries,
      scopeTotal: selectedScopeTotalV107(),
      answered,
      correct,
      errors,
      unknown,
      accuracy,
      seriesNumber
    };
  }

  function labelsV107(){
    const active = document.querySelector(".brand-lang button.active, .lang-switch button.active, [data-lang].active");
    const raw = (active && (active.getAttribute("data-lang") || active.textContent) || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return {series:"Série", ok:"OK", err:"Err", ns:"NS", acc:"Réussite", total:"Total"};
    if(raw.includes("br") || raw.includes("pt")) return {series:"Série", ok:"OK", err:"Err", ns:"NS", acc:"Acerto", total:"Total"};
    return {series:"Serie", ok:"OK", err:"Err", ns:"NS", acc:"Acierto", total:"Total"};
  }

  function pillV107(cls, label, value){
    const span = document.createElement("span");
    span.className = "hud-pill stable-v107 " + (cls || "");
    span.innerHTML = label ? label + " <strong>" + value + "</strong>" : "<strong>" + value + "</strong>";
    return span;
  }

  function ensureHudV107(){
    const list = document.querySelector("#practiceList");
    const summary = document.querySelector(".practice-live-summary");
    if(!list || !summary) return null;
    let hud = document.querySelector(".practice-hud-row");
    if(!hud){
      hud = document.createElement("div");
      hud.className = "practice-hud-row";
      summary.insertAdjacentElement("afterend", hud);
    }
    return hud;
  }

  function updateTotalPillsV107(total){
    const q = paramsV107();
    const scopeClass = q.get("module") ? "total-module" : "total-subject";
    const targetText = "Total " + total;
    document.querySelectorAll(".total-pill, .bank-scope-pill").forEach(function(el){
      if(el.textContent !== targetText) el.textContent = targetText;
      if(!el.classList.contains(scopeClass)){
        el.classList.remove("total-module","total-subject");
        el.classList.add(scopeClass);
      }
    });
  }

  function stabilizeSelectsV107(){
    // Do not modify the selected values; only clean accidental numeric suffixes in labels.
    document.querySelectorAll(".subject-select option, .module-select option").forEach(function(opt){
      const cleaned = (opt.textContent || "")
        .replace(/\s+\d{1,5}\s*$/," ")
        .replace(/1\/20\d+/g,"1/20")
        .replace(/\s+/g," ")
        .trim();
      if(opt.textContent !== cleaned) opt.textContent = cleaned;
    });
  }

  function rebuildHudV107(){
    if(!isPracticeV107()) return;
    document.body.classList.add("practice-focus");
    const hud = ensureHudV107();
    if(!hud) return;

    const s = statsV107();
    const L = labelsV107();

    var sig = [s.current, s.totalSeries, s.scopeTotal, s.seriesNumber, s.correct, s.errors, s.unknown, s.accuracy, L.total, L.series, L.ok, L.err, L.ns, L.acc].join("|");
    if(hud.dataset.v107Sig !== sig){
      hud.dataset.v107Sig = sig;
      hud.innerHTML = "";
      hud.appendChild(pillV107("main", "", s.current + "/" + s.totalSeries));
      hud.appendChild(pillV107("accent", L.total, s.scopeTotal));
      hud.appendChild(pillV107("neutral", L.series, s.seriesNumber));
      hud.appendChild(pillV107("success", L.ok, s.correct));
      hud.appendChild(pillV107("error", L.err, s.errors));
      hud.appendChild(pillV107("neutral", L.ns, s.unknown));
      hud.appendChild(pillV107("accent", L.acc, s.accuracy + "%"));
    }

    updateTotalPillsV107(s.scopeTotal);
    stabilizeSelectsV107();

    document.querySelectorAll(".question-pill").forEach(function(el){
      var pillText = s.current + "/" + s.totalSeries;
      if(el.textContent !== pillText) el.textContent = pillText;
    });
  }

  function applyV107(){
    rebuildHudV107();
  }

  document.addEventListener("DOMContentLoaded", function(){ applyV107(); setTimeout(applyV107, 260); setTimeout(applyV107, 700); });
  window.addEventListener("load", function(){ applyV107(); setTimeout(applyV107, 260); setTimeout(applyV107, 700); });
  document.addEventListener("pageshow", function(){ applyV107(); setTimeout(applyV107, 260); });
  document.addEventListener("click", function(){ setTimeout(applyV107, 260); setTimeout(applyV107, 650); });
  document.addEventListener("change", function(){ setTimeout(applyV107, 260); setTimeout(applyV107, 650); });

  try{
    const obs = new MutationObserver(function(){
      clearTimeout(window.__v107StableHudTimer);
      window.__v107StableHudTimer = setTimeout(applyV107, 120);
    });
    obs.observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
})();




/* v152 — Fix practice scope selects: no more misleading "Mat. Fisiología" when bank is global,
   no current-question module as "all module", and module list is always restricted to selected subject. */
(function(){
  function isPracticePage(){
    return /qcm|cas-cliniques|vrai-faux|erreurs|examen/.test(location.pathname || "");
  }
  function lang(){
    const raw = ((document.querySelector(".lang-btn.active, [data-lang].active, .compact-lang .active") || {}).textContent || document.documentElement.lang || localStorage.getItem("medCursosLang") || "es").toLowerCase();
    if(raw.includes("fr")) return "fr";
    if(raw.includes("br") || raw.includes("pt")) return "br";
    return "es";
  }
  function label(key){
    const L = {
      es:{subject:"Mat.", module:"Mód.", allSubjects:"Todas", allModules:"Mat. completa", allBank:"Todo el banco"},
      fr:{subject:"Mat.", module:"Mod.", allSubjects:"Toutes", allModules:"Mat. complète", allBank:"Toute la banque"},
      br:{subject:"Mat.", module:"Mód.", allSubjects:"Todas", allModules:"Mat. completa", allBank:"Todo o banco"}
    };
    const l = lang();
    return (L[l] && L[l][key]) || L.es[key] || key;
  }
  function courses(){
    return ((window.MED_COURSES_DATA || {}).courses || []).filter(function(c){ return c && c.id; });
  }
  function getCourse(id){ return courses().find(function(c){ return c.id === id; }) || null; }
  function getModule(id){
    let found = null;
    courses().forEach(function(c){
      (c.modules || []).forEach(function(m){
        if(m.id === id) found = Object.assign({}, m, {courseId:c.id, courseTitle:c.title});
      });
    });
    return found;
  }
  function shortCourse(raw){
    raw = String(raw || "").trim();
    if(/fisiolog/i.test(raw)) return "Fisiología";
    if(/microbiolog/i.test(raw)) return "Microbiología";
    if(/gen[eé]tic/i.test(raw)) return "Genética";
    if(/bioqu[ií]mic/i.test(raw)) return "Bioquímica";
    if(/inmunolog|immunolog|imunolog/i.test(raw)) return "Inmunología";
    return raw.length > 18 ? raw.slice(0,17).trim() + "…" : raw;
  }
  function shortModule(raw){
    raw = String(raw || "").replace(/^M[oó]dulo\s*\d+\s*·?\s*/i,"").trim();
    if(/cardiovascular|circulación|presión arterial/i.test(raw)) return "Cardio";
    if(/electrocardiograma|ECG/i.test(raw)) return "ECG";
    if(/osmolaridad|ósmosis|tonicidad/i.test(raw)) return "Osmolaridad";
    if(/transporte de membrana/i.test(raw)) return "Membrana";
    if(/neurofisiología|potencial de acción/i.test(raw)) return "Neuro";
    if(/anion gap|acidosis/i.test(raw)) return "Anion gap";
    if(/[aá]cido-base|acid-base|equilibrio [aá]cido/i.test(raw)) return "Ácido-base";
    if(/renal avanzada|hidroelectrol/i.test(raw)) return "Renal av.";
    if(/renal/i.test(raw)) return "Renal";
    if(/respiratoria|pulmonar/i.test(raw)) return "Resp.";
    return raw.length > 23 ? raw.slice(0,22).trim() + "…" : raw;
  }
  function buildUrl(set){
    const q = new URLSearchParams(location.search);
    Object.keys(set).forEach(function(k){
      const v = set[k];
      if(v === null || v === undefined || v === "") q.delete(k);
      else q.set(k, v);
    });
    const qs = q.toString();
    return location.pathname + (qs ? "?" + qs : "");
  }
  function resetSelect(sel){
    while(sel.firstChild) sel.removeChild(sel.firstChild);
  }
  function addOption(sel, value, text, selected){
    const o = document.createElement("option");
    o.value = value;
    o.textContent = text;
    o.selected = !!selected;
    sel.appendChild(o);
  }
  function currentScope(){
    const q = new URLSearchParams(location.search);
    const moduleId = q.get("module") || "";
    const mod = moduleId ? getModule(moduleId) : null;
    const courseId = q.get("course") || (mod && mod.courseId) || "";
    return {courseId, moduleId, mod};
  }
  function rebuildSubjectSelect(sel, scope){
    if(!sel || sel.dataset.v152fixed === "1") return;
    sel.dataset.v152fixed = "1";
    resetSelect(sel);
    addOption(sel, "", label("subject") + ": " + label("allSubjects"), !scope.courseId);
    courses().forEach(function(c){
      addOption(sel, c.id, label("subject") + ": " + shortCourse(c.title), c.id === scope.courseId);
    });
    sel.addEventListener("change", function(){
      if(sel.value) location.href = buildUrl({course: sel.value, module: null});
      else location.href = buildUrl({course: null, module: null});
    });
  }
  function rebuildModuleSelect(sel, scope){
    if(!sel || sel.dataset.v152fixed === "1") return;
    sel.dataset.v152fixed = "1";
    resetSelect(sel);
    if(!scope.courseId){
      addOption(sel, "", label("module") + ": " + label("allBank"), true);
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    addOption(sel, "", label("module") + ": " + label("allModules"), !scope.moduleId);
    const c = getCourse(scope.courseId);
    (c && c.modules || []).forEach(function(m){
      addOption(sel, m.id, label("module") + ": " + shortModule(m.title), m.id === scope.moduleId);
    });
    sel.addEventListener("change", function(){
      if(sel.value) location.href = buildUrl({course: scope.courseId, module: sel.value});
      else location.href = buildUrl({course: scope.courseId, module: null});
    });
  }
  function fixSelects(){
    if(!isPracticePage()) return;
    const scope = currentScope();
    const subject = document.querySelector(".subject-select");
    const module = document.querySelector(".module-select");
    rebuildSubjectSelect(subject, scope);
    rebuildModuleSelect(module, scope);
  }
  function fixMisleadingAllModuleText(){
    const scope = currentScope();
    document.querySelectorAll(".module-select option").forEach(function(opt, idx){
      if(idx === 0 || !opt.value){
        opt.textContent = scope.courseId ? (label("module") + ": " + label("allModules")) : (label("module") + ": " + label("allBank"));
      }
    });
  }
  function apply(){
    fixSelects();
    fixMisleadingAllModuleText();
  }
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(apply, 0); setTimeout(apply, 250); setTimeout(apply, 900); });
  window.addEventListener("load", function(){ setTimeout(apply, 0); setTimeout(apply, 500); });
  document.addEventListener("click", function(){ setTimeout(apply, 120); });
  document.addEventListener("change", function(){ setTimeout(apply, 120); });
})();

function setupCourseFigureLightbox(){
  if(document.querySelector('.figure-lightbox')) return;
  const overlay = document.createElement('div');
  overlay.className = 'figure-lightbox';
  overlay.innerHTML = '<button class="figure-lightbox-close" type="button" aria-label="Fermer">×</button><img alt="">';
  document.body.appendChild(overlay);
  const img = overlay.querySelector('img');
  const close = () => {
    overlay.classList.remove('open');
    img.removeAttribute('src');
    img.setAttribute('alt','');
  };
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay || e.target.classList.contains('figure-lightbox-close')) close();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') close();
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.course-figure-zoom');
    if(!btn) return;
    const source = btn.querySelector('img');
    if(!source) return;
    img.src = source.currentSrc || source.src;
    img.alt = source.alt || '';
    overlay.classList.add('open');
  });
}

try{document.addEventListener('DOMContentLoaded', setupCourseFigureLightbox);}catch(e){}



/* v228 — inline module switcher inside reader */
function setupReaderModuleSwitcherV228_DISABLED(){
  try{
    if(!document.body || document.body.dataset.page !== 'module') return;
    const data = window.MED_COURSES_DATA || {};
    const params = new URLSearchParams(location.search);
    const currentId = params.get('id');
    if(!currentId) return;

    let course = null;
    let current = null;
    (data.courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        if(m.id === currentId){
          course = c;
          current = m;
        }
      });
    });
    if(!course || !current) return;

    const modules = (course.modules || []).slice().sort((a,b)=>(Number(a.number||0)-Number(b.number||0)));
    if(!modules.length) return;

    const old = document.querySelector('.v228-module-switcher');
    if(old) old.remove();

    const view = params.get('view');
    const viewParam = (view === 'fiche' || view === 'ultra') ? '&view=' + encodeURIComponent(view) : '';
    const idx = modules.findIndex(m => m.id === current.id);
    const prev = modules[idx-1] || null;
    const next = modules[idx+1] || null;

    const card = document.createElement('section');
    card.className = 'v228-module-switcher';
    card.setAttribute('aria-label','Changer de module');
    card.innerHTML = `
      <div class="v228-switcher-head">
        <span class="v228-switcher-kicker">Navigation du cours</span>
        <strong>Changer de module</strong>
      </div>
      <div class="v228-switcher-row">
        ${prev ? `<a class="v228-switcher-btn" href="module.html?id=${encodeURIComponent(prev.id)}${viewParam}">← Mód. ${prev.number}</a>` : `<span class="v228-switcher-btn disabled">← Mód.</span>`}
        <label class="v228-switcher-select-wrap">
          <span>Module actuel</span>
          <select class="v228-module-select">
            ${modules.map(m => `<option value="${String(m.id).replace(/"/g,'&quot;')}" ${m.id===current.id?'selected':''}>Mód. ${m.number} — ${String(m.title || m.name || 'Module').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('')}
          </select>
        </label>
        ${next ? `<a class="v228-switcher-btn" href="module.html?id=${encodeURIComponent(next.id)}${viewParam}">Mód. ${next.number} →</a>` : `<span class="v228-switcher-btn disabled">Mód. →</span>`}
      </div>
    `;

    const tabs = document.querySelector('.reader-view-tabs');
    const content = document.querySelector('#moduleContent');
    if(tabs) tabs.insertAdjacentElement('beforebegin', card);
    else if(content) content.insertAdjacentElement('beforebegin', card);
    else {
      const head = document.querySelector('.reader-head');
      if(head) head.insertAdjacentElement('afterend', card);
    }

    const select = card.querySelector('.v228-module-select');
    if(select){
      select.addEventListener('change', () => {
        const target = select.value;
        if(!target || target === current.id) return;
        window.location.href = `module.html?id=${encodeURIComponent(target)}${viewParam}`;
      });
    }
  }catch(err){
    console.warn('v228 module switcher failed', err);
  }
}
document.addEventListener('DOMContentLoaded', () => setTimeout(setupReaderModuleSwitcherV228_DISABLED, 80));
window.addEventListener('pageshow', () => setTimeout(setupReaderModuleSwitcherV228_DISABLED, 120));




/* v237 — premium custom module switcher, replaces native select */
function setupReaderModuleSwitcherV237(){
  try{
    if(!document.body || document.body.dataset.page !== 'module') return;
    const data = window.MED_COURSES_DATA || {};
    const params = new URLSearchParams(location.search);
    const currentId = params.get('id');
    if(!currentId) return;

    let course = null;
    let current = null;
    (data.courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        if(m.id === currentId){
          course = c;
          current = m;
        }
      });
    });
    if(!course || !current) return;

    const modules = (course.modules || []).slice().sort((a,b)=>(Number(a.number||0)-Number(b.number||0)));
    const idx = modules.findIndex(m => m.id === current.id);
    const prev = modules[idx-1] || null;
    const next = modules[idx+1] || null;
    const view = params.get('view');
    const viewParam = (view === 'fiche' || view === 'ultra') ? '&view=' + encodeURIComponent(view) : '';

    document.querySelectorAll('.v228-module-switcher,.v237-module-switcher').forEach(el => el.remove());

    const safe = (x) => String(x || '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    })[ch]);

    const card = document.createElement('section');
    card.className = 'v237-module-switcher';
    card.setAttribute('aria-label','Changer de module');
    card.innerHTML = `
      <div class="v237-switcher-main">
        <div class="v237-switcher-copy">
          <span class="v237-switcher-kicker">Navigation du cours</span>
          <strong>Mód. ${safe(current.number)} — ${safe(current.title || current.name || 'Module')}</strong>
        </div>
        <div class="v237-switcher-actions">
          ${prev ? `<a class="v237-nav-mini" href="module.html?id=${encodeURIComponent(prev.id)}${viewParam}">← Mód. ${safe(prev.number)}</a>` : `<span class="v237-nav-mini disabled">←</span>`}
          <div class="v237-dropdown">
            <button class="v237-dropdown-btn" type="button" aria-expanded="false">
              Changer de module
              <span>▾</span>
            </button>
            <div class="v237-dropdown-menu" role="menu">
              ${modules.map(m => `
                <a class="v237-module-option ${m.id===current.id?'active':''}" role="menuitem" href="module.html?id=${encodeURIComponent(m.id)}${viewParam}">
                  <span class="v237-option-num">Mód. ${safe(m.number)}</span>
                  <span class="v237-option-title">${safe(m.title || m.name || 'Module')}</span>
                </a>
              `).join('')}
            </div>
          </div>
          ${next ? `<a class="v237-nav-mini" href="module.html?id=${encodeURIComponent(next.id)}${viewParam}">Mód. ${safe(next.number)} →</a>` : `<span class="v237-nav-mini disabled">→</span>`}
        </div>
      </div>
    `;

    const tabs = document.querySelector('.reader-view-tabs');
    const content = document.querySelector('#moduleContent');
    if(tabs) tabs.insertAdjacentElement('beforebegin', card);
    else if(content) content.insertAdjacentElement('beforebegin', card);
    else {
      const head = document.querySelector('.reader-head');
      if(head) head.insertAdjacentElement('afterend', card);
    }

    const btn = card.querySelector('.v237-dropdown-btn');
    const dropdown = card.querySelector('.v237-dropdown');
    if(btn && dropdown){
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const open = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if(!dropdown.contains(e.target)){
          dropdown.classList.remove('open');
          btn.setAttribute('aria-expanded','false');
        }
      }, {capture:true});
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
          dropdown.classList.remove('open');
          btn.setAttribute('aria-expanded','false');
        }
      });
    }
  }catch(err){
    console.warn('v237 module switcher failed', err);
  }
}
document.addEventListener('DOMContentLoaded', () => setTimeout(setupReaderModuleSwitcherV237, 100));
window.addEventListener('pageshow', () => setTimeout(setupReaderModuleSwitcherV237, 120));



/* v259 — Move practice next button above correction panel */
(function(){
  function moveNextButtonHigher(){
    try{
      if(!document.body || document.body.dataset.page !== "practice") return;
      document.querySelectorAll(".single-question-card").forEach(function(card){
        var nav = card.querySelector(".single-nav-actions");
        var answer = card.querySelector(".answer-panel");
        if(!nav || !answer) return;
        if(nav.dataset.v259Moved === "1") return;
        // Put previous/next before the correction panel so the next action is visible immediately.
        answer.parentNode.insertBefore(nav, answer);
        nav.dataset.v259Moved = "1";
      });
    }catch(e){}
  }
  document.addEventListener("DOMContentLoaded", moveNextButtonHigher);
  window.addEventListener("load", moveNextButtonHigher);
  document.addEventListener("click", function(){ setTimeout(moveNextButtonHigher, 80); });
  document.addEventListener("change", function(){ setTimeout(moveNextButtonHigher, 80); });
  window.addEventListener("popstate", function(){ setTimeout(moveNextButtonHigher, 120); });

  var mo = new MutationObserver(function(){ moveNextButtonHigher(); });
  document.addEventListener("DOMContentLoaded", function(){
    if(document.body) mo.observe(document.body, {childList:true, subtree:true});
  });
})();


/* v260 — Local adaptive engine using hidden tags */
(function(){
  "use strict";
  var STORAGE_KEY = "medAdaptive:v260";
  var EVENT_KEY = "medAdaptiveEvents:v260";
  var MAX_EVENTS = 900;

  function now(){ return Date.now(); }

  function safeParse(raw, fallback){
    try { return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; }
  }

  function load(){
    var data = safeParse(localStorage.getItem(STORAGE_KEY), null);
    if(!data || typeof data !== "object"){
      data = {
        version: "v260",
        createdAt: now(),
        updatedAt: now(),
        totals: {attempts:0, correct:0, wrong:0, unknown:0, fragile:0},
        byQuestion: {},
        byTopic: {},
        byConcept: {},
        byModule: {},
        bySubject: {},
        recentWeak: [],
        lastEvent: null
      };
    }
    return data;
  }

  function save(data){
    data.updatedAt = now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){}
  }

  function loadEvents(){
    return safeParse(localStorage.getItem(EVENT_KEY), []);
  }

  function saveEvent(event){
    var events = loadEvents();
    events.push(event);
    if(events.length > MAX_EVENTS) events = events.slice(events.length - MAX_EVENTS);
    try { localStorage.setItem(EVENT_KEY, JSON.stringify(events)); } catch(e){}
  }

  function normalizeTags(item){
    var t = item && item.tags && typeof item.tags === "object" ? item.tags : {};
    var list = Array.isArray(item && item.tagList) ? item.tagList : [];
    return {
      subject: t.subject || item.courseId || "",
      subjectLabel: t.subjectLabel || t.subject || item.courseId || "",
      moduleNumber: t.moduleNumber || item.moduleNumber || "",
      moduleId: t.moduleId || item.moduleId || "",
      moduleTitle: t.moduleTitle || item.moduleTitle || "",
      format: t.format || item.practiceType || document.body.dataset.practiceType || "qcm",
      topic: t.topic || item.heading || item.moduleTitle || "Concepto general",
      topicSlug: t.topicSlug || slug(t.topic || item.heading || item.moduleTitle || "general"),
      concepts: Array.isArray(t.concepts) ? t.concepts : [],
      skill: t.skill || "concept_application",
      cognitiveLevel: t.cognitiveLevel || "application",
      difficulty: t.difficulty || item.difficulty || "medium",
      tagList: list
    };
  }

  function slug(x){
    return String(x || "general")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "general";
  }

  function bankItems(){
    var bank = window.MED_PRACTICE_BANK || {};
    var items = [];
    var byCourse = bank.byCourse || {};
    Object.keys(byCourse).forEach(function(courseId){
      var course = byCourse[courseId] || {};
      ["qcm", "vf", "cases"].forEach(function(kind){
        var arr = Array.isArray(course[kind]) ? course[kind] : [];
        arr.forEach(function(it){
          if(!it || !it.id) return;
          items.push(it);
        });
      });
    });
    return items;
  }

  var indexCache = null;
  function itemIndex(){
    if(indexCache) return indexCache;
    indexCache = {};
    bankItems().forEach(function(it){ indexCache[it.id] = it; });
    return indexCache;
  }

  function getItemById(id){
    if(!id) return null;
    return itemIndex()[id] || null;
  }

  function ensureBucket(obj, key, label, tags){
    if(!key) key = "unknown";
    if(!obj[key]){
      obj[key] = {
        key: key,
        label: label || key,
        attempts: 0,
        correct: 0,
        wrong: 0,
        unknown: 0,
        fragile: 0,
        lastAt: 0,
        lastWrongAt: 0,
        subject: tags && tags.subject || "",
        moduleNumber: tags && tags.moduleNumber || "",
        moduleId: tags && tags.moduleId || "",
        moduleTitle: tags && tags.moduleTitle || "",
        skillBreakdown: {},
        difficultyBreakdown: {}
      };
    }
    return obj[key];
  }

  function updateBucket(bucket, outcome, tags){
    bucket.attempts += 1;
    bucket.lastAt = now();
    if(outcome.correct) bucket.correct += 1;
    if(outcome.wrong) {
      bucket.wrong += 1;
      bucket.lastWrongAt = now();
    }
    if(outcome.unknown) {
      bucket.unknown += 1;
      bucket.lastWrongAt = now();
    }
    if(outcome.fragile) bucket.fragile += 1;

    var skill = tags.skill || "concept_application";
    var diff = tags.difficulty || "medium";
    bucket.skillBreakdown[skill] = (bucket.skillBreakdown[skill] || 0) + 1;
    bucket.difficultyBreakdown[diff] = (bucket.difficultyBreakdown[diff] || 0) + 1;

    bucket.accuracy = bucket.attempts ? Math.round((bucket.correct / bucket.attempts) * 100) : 0;
    bucket.weakScore = computeWeakScore(bucket);
  }

  function computeWeakScore(b){
    var attempts = b.attempts || 0;
    if(!attempts) return 0;
    var wrongWeight = (b.wrong || 0) * 2.2;
    var unknownWeight = (b.unknown || 0) * 2.4;
    var fragileWeight = (b.fragile || 0) * 1.3;
    var lowAccuracy = Math.max(0, 75 - (b.accuracy || 0)) / 10;
    var recency = b.lastWrongAt ? Math.max(0, 7 - ((now() - b.lastWrongAt) / 86400000)) : 0;
    return Math.round((wrongWeight + unknownWeight + fragileWeight + lowAccuracy + recency) * 10) / 10;
  }

  function recomputeWeak(data){
    var all = Object.values(data.byTopic || {}).filter(function(x){
      return x && x.attempts >= 1 && ((x.wrong || 0) || (x.unknown || 0) || (x.fragile || 0));
    });
    all.sort(function(a,b){
      return (b.weakScore || 0) - (a.weakScore || 0) || (b.lastWrongAt || 0) - (a.lastWrongAt || 0);
    });
    data.recentWeak = all.slice(0, 12).map(function(x){
      return {
        key: x.key,
        label: x.label,
        subject: x.subject,
        moduleNumber: x.moduleNumber,
        moduleId: x.moduleId,
        moduleTitle: x.moduleTitle,
        attempts: x.attempts,
        correct: x.correct,
        wrong: x.wrong,
        unknown: x.unknown,
        fragile: x.fragile,
        accuracy: x.accuracy,
        weakScore: x.weakScore,
        lastWrongAt: x.lastWrongAt
      };
    });
  }

  function outcomeFromAnswer(correct, unknown){
    return {
      correct: !!correct,
      wrong: !correct && !unknown,
      unknown: !!unknown,
      fragile: false
    };
  }

  function recordResult(item, rawOutcome){
    if(!item || !item.id) return;
    var tags = normalizeTags(item);
    var data = load();
    var outcome = rawOutcome || {};
    var isCorrect = !!outcome.correct;
    var isUnknown = !!outcome.unknown;
    var isWrong = !isCorrect && !isUnknown;

    data.totals.attempts += 1;
    if(isCorrect) data.totals.correct += 1;
    if(isWrong) data.totals.wrong += 1;
    if(isUnknown) data.totals.unknown += 1;

    var q = data.byQuestion[item.id] || {
      id: item.id,
      question: item.question || item.stem || "",
      subject: tags.subject,
      moduleNumber: tags.moduleNumber,
      moduleId: tags.moduleId,
      moduleTitle: tags.moduleTitle,
      topic: tags.topic,
      topicSlug: tags.topicSlug,
      concepts: tags.concepts,
      skill: tags.skill,
      difficulty: tags.difficulty,
      attempts: 0,
      correct: 0,
      wrong: 0,
      unknown: 0,
      fragile: 0,
      lastAt: 0,
      lastChosen: null,
      lastCorrect: null
    };
    q.attempts += 1;
    q.lastAt = now();
    q.lastChosen = outcome.chosen;
    q.lastCorrect = isCorrect;
    if(isCorrect) q.correct += 1;
    if(isWrong) q.wrong += 1;
    if(isUnknown) q.unknown += 1;
    data.byQuestion[item.id] = q;

    var out = {correct:isCorrect, wrong:isWrong, unknown:isUnknown, fragile:false};

    updateBucket(ensureBucket(data.byTopic, tags.topicSlug, tags.topic, tags), out, tags);
    updateBucket(ensureBucket(data.byModule, tags.moduleId || ("module_" + tags.moduleNumber), tags.moduleTitle || ("Module " + tags.moduleNumber), tags), out, tags);
    updateBucket(ensureBucket(data.bySubject, tags.subject || "unknown", tags.subjectLabel || tags.subject, tags), out, tags);

    if(tags.concepts && tags.concepts.length){
      tags.concepts.forEach(function(c){
        updateBucket(ensureBucket(data.byConcept, c, c.replace(/_/g, " "), tags), out, tags);
      });
    } else {
      updateBucket(ensureBucket(data.byConcept, "general", "General", tags), out, tags);
    }

    var event = {
      at: now(),
      id: item.id,
      correct: isCorrect,
      wrong: isWrong,
      unknown: isUnknown,
      chosen: outcome.chosen,
      answerIndex: item.answerIndex,
      subject: tags.subject,
      moduleNumber: tags.moduleNumber,
      moduleId: tags.moduleId,
      topic: tags.topic,
      topicSlug: tags.topicSlug,
      concepts: tags.concepts,
      skill: tags.skill,
      difficulty: tags.difficulty,
      format: tags.format
    };
    data.lastEvent = event;
    recomputeWeak(data);
    save(data);
    saveEvent(event);
    dispatchEvent(new CustomEvent("medAdaptive:recorded", {detail:event}));
  }

  function recordConfidence(item, level){
    if(!item || !item.id || !level) return;
    var data = load();
    var q = data.byQuestion[item.id];
    if(!q) return;
    q.confidence = level;
    q.confidenceAt = now();

    var fragile = (level === "hesitated" || level === "guessed") && q.lastCorrect === true;
    if(fragile){
      q.fragile = (q.fragile || 0) + 1;
      data.totals.fragile = (data.totals.fragile || 0) + 1;
      var tags = normalizeTags(item);
      var out = {correct:false, wrong:false, unknown:false, fragile:true};
      updateBucket(ensureBucket(data.byTopic, tags.topicSlug, tags.topic, tags), out, tags);
      updateBucket(ensureBucket(data.byModule, tags.moduleId || ("module_" + tags.moduleNumber), tags.moduleTitle || ("Module " + tags.moduleNumber), tags), out, tags);
      updateBucket(ensureBucket(data.bySubject, tags.subject || "unknown", tags.subjectLabel || tags.subject, tags), out, tags);
      (tags.concepts && tags.concepts.length ? tags.concepts : ["general"]).forEach(function(c){
        updateBucket(ensureBucket(data.byConcept, c, c.replace(/_/g, " "), tags), out, tags);
      });
    }
    recomputeWeak(data);
    save(data);
  }

  function reset(){
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(EVENT_KEY); } catch(e){}
  }

  function weakTopics(limit){
    var data = load();
    return (data.recentWeak || []).slice(0, limit || 10);
  }

  function cardItemFromElement(el){
    var card = el && el.closest ? el.closest(".single-question-card") : null;
    if(!card || !card.id) return null;
    return getItemById(card.id);
  }

  function captureClick(e){
    if(!document.body || document.body.dataset.page !== "practice") return;
    var option = e.target.closest && e.target.closest(".single-question-card .option");
    if(option){
      var box = option.closest(".options");
      if(!box || box.dataset.locked) return;
      var item = cardItemFromElement(option);
      if(!item) return;
      var chosen = Number(option.dataset.option);
      var answer = Number(box.dataset.answer);
      recordResult(item, {chosen:chosen, correct:chosen === answer, unknown:false});
      return;
    }

    var action = e.target.closest && e.target.closest(".single-question-card [data-action]");
    if(!action) return;
    var actionName = action.dataset.action;
    if(actionName === "dont-know"){
      var itemUnknown = cardItemFromElement(action);
      if(itemUnknown) recordResult(itemUnknown, {chosen:-1, correct:false, unknown:true});
      return;
    }
    if(actionName === "confidence"){
      var itemConfidence = cardItemFromElement(action);
      if(itemConfidence) setTimeout(function(){
        recordConfidence(itemConfidence, action.dataset.confidence || "");
      }, 0);
    }
  }

  document.addEventListener("click", captureClick, true);

  window.MedAdaptiveV260 = {
    load: load,
    reset: reset,
    weakTopics: weakTopics,
    recordResult: recordResult,
    recordConfidence: recordConfidence,
    storageKey: STORAGE_KEY,
    eventKey: EVENT_KEY,
    version: "v260"
  };
})();


/* v261 — Weak points dashboard using local adaptive engine */
(function(){
  "use strict";

  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function pct(n){
    if(typeof n !== "number" || isNaN(n)) return "0%";
    return Math.max(0, Math.min(100, Math.round(n))) + "%";
  }

  function labelStatus(item){
    var acc = item.accuracy || 0;
    var attempts = item.attempts || 0;
    if(attempts < 2) return {label:"à confirmer", cls:"warn"};
    if(acc < 50) return {label:"faible", cls:"bad"};
    if(acc < 70) return {label:"à renforcer", cls:"warn"};
    if(acc < 85) return {label:"moyen", cls:"mid"};
    return {label:"maîtrisé", cls:"good"};
  }

  function getStats(){
    if(!window.MedAdaptiveV260 || typeof window.MedAdaptiveV260.load !== "function"){
      return null;
    }
    try { return window.MedAdaptiveV260.load(); } catch(e){ return null; }
  }

  function weakItems(){
    if(!window.MedAdaptiveV260 || typeof window.MedAdaptiveV260.weakTopics !== "function"){
      return [];
    }
    try { return window.MedAdaptiveV260.weakTopics(8) || []; } catch(e){ return []; }
  }

  function currentPracticeRoot(){
    return document.querySelector(".practice-shell, .practice-page, main .container, main, .page-main, body");
  }

  function ensureDashboard(){
    if(!document.body || document.body.dataset.page !== "practice") return;

    var root = currentPracticeRoot();
    if(!root) return;

    var existing = document.getElementById("adaptiveWeakDashboardV261");
    var data = getStats();
    var items = weakItems();
    var totals = data && data.totals ? data.totals : {attempts:0, correct:0, wrong:0, unknown:0, fragile:0};
    var attempts = totals.attempts || 0;
    var accuracy = attempts ? Math.round(((totals.correct || 0) / attempts) * 100) : 0;

    if(!existing){
      existing = document.createElement("section");
      existing.id = "adaptiveWeakDashboardV261";
      existing.className = "adaptive-weak-dashboard v261";

      var anchor =
        document.querySelector(".practice-filters") ||
        document.querySelector(".practice-toolbar") ||
        document.querySelector(".filters-row") ||
        document.querySelector(".single-question-card") ||
        root.firstElementChild;

      if(anchor && anchor.parentNode){
        anchor.parentNode.insertBefore(existing, anchor.nextSibling);
      } else {
        root.insertBefore(existing, root.firstChild);
      }
    }

    var collapseKey = "medWeakDashboardV261Open";
    var isOpen = false;
    try { isOpen = localStorage.getItem(collapseKey) === "1"; } catch(e){}

    var rows = "";
    if(items.length){
      rows = items.map(function(item, idx){
        var st = labelStatus(item);
        var topic = item.label || item.topic || item.key || "Concept";
        var moduleText = item.moduleNumber ? ("M" + item.moduleNumber) : "";
        var subject = item.subject ? item.subject : "";
        return '' +
          '<button class="weak-row" type="button" data-topic="' + escapeHtml(item.key || "") + '">' +
            '<span class="weak-rank">' + (idx + 1) + '</span>' +
            '<span class="weak-main">' +
              '<strong>' + escapeHtml(topic) + '</strong>' +
              '<small>' + escapeHtml([subject, moduleText].filter(Boolean).join(" · ")) + '</small>' +
            '</span>' +
            '<span class="weak-meter" aria-label="réussite">' +
              '<i style="width:' + Math.max(3, Math.min(100, item.accuracy || 0)) + '%"></i>' +
            '</span>' +
            '<span class="weak-score">' + pct(item.accuracy || 0) + '</span>' +
            '<span class="weak-status ' + st.cls + '">' + st.label + '</span>' +
          '</button>';
      }).join("");
    } else {
      rows = '<div class="weak-empty">Fais quelques questions : tes points faibles apparaîtront ici automatiquement.</div>';
    }

    var weakCount = items.length;
    var weakSummary = weakCount ? (weakCount + " point" + (weakCount > 1 ? "s" : "") + " détecté" + (weakCount > 1 ? "s" : "")) : "Aucun point faible détecté";
    var dashboardHtml = '' +
      '<div class="weak-head" role="button" tabindex="0" aria-controls="adaptiveWeakDetailsV261" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
        '<div class="weak-title">' +
          '<p class="eyebrow">Adaptatif local</p>' +
          '<h2>Mes points faibles</h2>' +
          '<p class="weak-summary">' + weakSummary + ' · clique pour ' + (isOpen ? 'masquer' : 'afficher') + ' le détail</p>' +
        '</div>' +
        '<div class="weak-stats">' +
          '<span><strong>' + attempts + '</strong><small>réponses</small></span>' +
          '<span><strong>' + pct(accuracy) + '</strong><small>réussite</small></span>' +
          '<span><strong>' + (totals.wrong || 0) + '</strong><small>erreurs</small></span>' +
          '<span><strong>' + (totals.unknown || 0) + '</strong><small>je ne sais pas</small></span>' +
        '</div>' +
        '<button class="weak-toggle" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="adaptiveWeakDetailsV261">' +
          '<span class="weak-toggle-text">' + (isOpen ? 'Masquer' : 'Afficher') + '</span>' +
          '<span class="weak-chevron" aria-hidden="true">⌄</span>' +
        '</button>' +
      '</div>' +
      '<div class="weak-collapsible" id="adaptiveWeakDetailsV261" aria-hidden="' + (isOpen ? 'false' : 'true') + '">' +
        '<div class="weak-body">' + rows + '</div>' +
        '<div class="weak-foot">' +
          '<span>Calculé uniquement sur cet appareil. Les tags restent cachés.</span>' +
          '<button class="weak-reset" type="button">Réinitialiser</button>' +
        '</div>' +
      '</div>';

    if(existing.dataset.v261Html !== dashboardHtml){
      existing.dataset.v261Html = dashboardHtml;
      existing.innerHTML = dashboardHtml;
    }

    setWeakDashboardOpen(existing, isOpen, false);

    var head = existing.querySelector(".weak-head");
    var toggleBtn = existing.querySelector(".weak-toggle");
    var toggle = function(){ setWeakDashboardOpen(existing, !existing.classList.contains("is-open"), true); };
    if(head){
      head.onclick = function(e){
        if(e.target && e.target.closest && e.target.closest(".weak-toggle")) return;
        toggle();
      };
      head.onkeydown = function(e){
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          toggle();
        }
      };
    }
    if(toggleBtn){
      toggleBtn.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        toggle();
      };
    }

    var reset = existing.querySelector(".weak-reset");
    if(reset){
      reset.onclick = function(){
        if(!window.MedAdaptiveV260 || typeof window.MedAdaptiveV260.reset !== "function") return;
        if(confirm("Réinitialiser tes statistiques locales sur cet appareil ?")){
          window.MedAdaptiveV260.reset();
          setTimeout(ensureDashboard, 80);
        }
      };
    }
  }

  function escapeHtml(x){
    return String(x || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
  }

  function setWeakDashboardOpen(box, open, persist){
    if(!box) return;
    box.classList.toggle("is-open", !!open);
    var head = box.querySelector(".weak-head");
    var details = box.querySelector("#adaptiveWeakDetailsV261");
    var toggleBtn = box.querySelector(".weak-toggle");
    var toggleText = box.querySelector(".weak-toggle-text");
    var summary = box.querySelector(".weak-summary");
    if(head) head.setAttribute("aria-expanded", open ? "true" : "false");
    if(details) details.setAttribute("aria-hidden", open ? "false" : "true");
    if(toggleBtn) toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if(toggleText) toggleText.textContent = open ? "Masquer" : "Afficher";
    if(summary){
      summary.textContent = summary.textContent.replace(open ? "clique pour afficher" : "clique pour masquer", open ? "clique pour masquer" : "clique pour afficher");
    }
    if(persist){
      try { localStorage.setItem("medWeakDashboardV261Open", open ? "1" : "0"); } catch(e){}
    }
  }

  ready(function(){
    ensureDashboard();
    document.addEventListener("medAdaptive:recorded", function(){ setTimeout(ensureDashboard, 60); });
    document.addEventListener("click", function(){ setTimeout(ensureDashboard, 120); });
    document.addEventListener("change", function(){ setTimeout(ensureDashboard, 120); });
    var dashboardTimer = null;
    var mo = new MutationObserver(function(){
      clearTimeout(dashboardTimer);
      dashboardTimer = setTimeout(ensureDashboard, 120);
    });
    if(document.body) mo.observe(document.body, {childList:true, subtree:true});
  });

  window.MedWeakDashboardV261 = {
    render: ensureDashboard,
    version: "v261"
  };
})();


/* v263 — Reader Premium Step 1: official identity band */
(function(){
  "use strict";

  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function getReaderContext(){
    var title =
      textOf(document.querySelector("[data-module-title]")) ||
      textOf(document.querySelector(".reader-title")) ||
      textOf(document.querySelector(".module-title")) ||
      textOf(document.querySelector("h1")) ||
      "Cours";

    var subject =
      textOf(document.querySelector("[data-subject-title]")) ||
      textOf(document.querySelector(".subject-title")) ||
      textOf(document.querySelector(".reader-kicker")) ||
      "Med Cursos";

    var module =
      textOf(document.querySelector("[data-module-badge]")) ||
      textOf(document.querySelector(".module-badge")) ||
      "";

    return {title:title, subject:subject, module:module};
  }

  function textOf(el){
    return el && el.textContent ? el.textContent.trim() : "";
  }

  function ensurePremiumBand(){
    if(!document.body || document.body.dataset.page !== "module") return;

    var shell =
      document.querySelector(".reader-shell") ||
      document.querySelector(".reader-layout") ||
      document.querySelector("main") ||
      document.body;

    if(!shell) return;
    if(document.getElementById("readerPremiumBandV263")) return;

    var ctx = getReaderContext();

    var band = document.createElement("section");
    band.id = "readerPremiumBandV263";
    band.className = "reader-premium-band-v263";
    band.innerHTML =
      '<div class="reader-premium-brand-v263">' +
        '<img src="assets/logo-medcursos-official.png" alt="Med Cursos" class="reader-premium-logo-v263">' +
      '</div>' +
      '<div class="reader-premium-copy-v263">' +
        '<p class="reader-premium-eyebrow-v263">' +
          '<span>Reader premium</span>' +
          '<i></i>' +
          '<span>' + escapeHtml(ctx.subject) + '</span>' +
          (ctx.module ? '<i></i><span>' + escapeHtml(ctx.module) + '</span>' : '') +
        '</p>' +
        '<h1>' + escapeHtml(ctx.title) + '</h1>' +
        '<div class="reader-premium-actions-v263">' +
          '<button type="button" data-v263-tab="course">Curso completo</button>' +
          '<button type="button" data-v263-tab="fast">Ficha rápida</button>' +
          '<button type="button" data-v263-tab="ultra">Ultra-rápida</button>' +
          '<a href="qcm.html" data-v263-link="qcm">QCM du module</a>' +
        '</div>' +
      '</div>';

    var anchor =
      document.querySelector(".reader-header") ||
      document.querySelector(".module-hero") ||
      document.querySelector(".reader-tabs") ||
      shell.firstElementChild;

    if(anchor && anchor.parentNode){
      anchor.parentNode.insertBefore(band, anchor);
    } else {
      shell.insertBefore(band, shell.firstChild);
    }

    wireButtons(band);
    document.body.classList.add("reader-premium-v263");
  }

  function wireButtons(band){
    band.addEventListener("click", function(e){
      var btn = e.target.closest("[data-v263-tab]");
      if(!btn) return;
      var target = btn.getAttribute("data-v263-tab");

      var candidates = [];
      if(target === "course") candidates = ["[data-tab='course']", "[data-view='course']", "#courseTab", ".reader-tab-course", "button[data-mode='course']"];
      if(target === "fast") candidates = ["[data-tab='fast']", "[data-tab='quick']", "[data-view='fast']", "#fastTab", ".reader-tab-fast", "button[data-mode='fast']"];
      if(target === "ultra") candidates = ["[data-tab='ultra']", "[data-view='ultra']", "#ultraTab", ".reader-tab-ultra", "button[data-mode='ultra']"];

      for(var i=0; i<candidates.length; i++){
        var el = document.querySelector(candidates[i]);
        if(el){
          el.click();
          return;
        }
      }

      // Fallback: scroll to content if native tabs are not detectable.
      var content = document.querySelector("#moduleContent, .reader-content, article, main");
      if(content) content.scrollIntoView({behavior:"smooth", block:"start"});
    });
  }

  function escapeHtml(x){
    return String(x || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
  }

  ready(function(){
    ensurePremiumBand();
    var mo = new MutationObserver(function(){ ensurePremiumBand(); });
    if(document.body) mo.observe(document.body, {childList:true, subtree:true});
  });

  window.MedReaderPremiumV263 = {
    render: ensurePremiumBand,
    version: "v263-step1"
  };
})();


/* v267 — Compact reader premium header */
(function(){
  "use strict";

  function compactPremiumReader(){
    try{
      if(!document.body || document.body.dataset.page !== "module") return;
      var band = document.getElementById("readerPremiumBandV263");
      if(!band) return;

      band.classList.add("reader-premium-compact-v267");

      var h1 = band.querySelector("h1");
      if(h1){
        var full = h1.textContent.trim();
        if(full.length > 58){
          h1.setAttribute("title", full);
          h1.textContent = full.slice(0, 55).replace(/\s+\S*$/, "") + "…";
        }
      }

      var logo = band.querySelector(".reader-premium-logo-v263");
      if(logo){
        logo.setAttribute("loading", "eager");
        logo.setAttribute("decoding", "async");
      }

      document.body.classList.add("reader-premium-compact-active-v267");
    }catch(e){}
  }

  document.addEventListener("DOMContentLoaded", function(){
    compactPremiumReader();
    setTimeout(compactPremiumReader, 100);
    setTimeout(compactPremiumReader, 500);
    var mo = new MutationObserver(function(){ compactPremiumReader(); });
    if(document.body) mo.observe(document.body, {childList:true, subtree:true});
  });

  window.MedReaderCompactV267 = {
    render: compactPremiumReader,
    version: "v267"
  };
})();


/* v282 — Practice page interactivity safety */
(function(){
  "use strict";

  function params(){ return new URLSearchParams(location.search || ""); }

  function currentCourse(){
    var p = params();
    var c = p.get("course");
    if(c) return c;
    var moduleId = p.get("module") || p.get("id");
    try{
      var courses = (window.MED_COURSES_DATA && window.MED_COURSES_DATA.courses) || [];
      for(var i=0;i<courses.length;i++){
        var mods = courses[i].modules || [];
        for(var j=0;j<mods.length;j++){
          if(String(mods[j].id) === String(moduleId)) return courses[i].id;
        }
      }
    }catch(e){}
    return "";
  }

  function ensurePracticeClickable(){
    if(!document.body || document.body.dataset.page !== "practice") return;

    document.querySelectorAll(".option, .tool-btn, .single-nav-actions .btn, .unknown-btn, .report-btn").forEach(function(el){
      if(el.style.pointerEvents !== "auto") el.style.pointerEvents = "auto";
      if(!el.style.position) el.style.position = "relative";
      if(!el.style.zIndex) el.style.zIndex = "20";
    });

    var list = document.getElementById("practiceList");
    if(!list) return;

    var course = currentCourse();
    var bank = window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse;
    var missingCourse = course && bank && !bank[course];

    if(missingCourse && !document.getElementById("v282BankWarning")){
      var warn = document.createElement("div");
      warn.id = "v282BankWarning";
      warn.className = "notice";
      warn.innerHTML = "<strong>Données de questions non chargées.</strong><br><small>Recharge la page. Si le problème continue, vérifie que le dossier /data a bien été uploadé.</small>";
      list.prepend(warn);
    }

    // If a question is already locked from localStorage, keep the Next button very visible.
    var card = document.querySelector(".single-question-card");
    if(card && card.querySelector(".options[data-locked='1']")){
      var next = card.querySelector("[data-action='next-question']");
      if(next){
        if(next.style.pointerEvents !== "auto") next.style.pointerEvents = "auto";
        if(next.style.zIndex !== "50") next.style.zIndex = "50";
        if(!next.classList.contains("v282-next-visible")) next.classList.add("v282-next-visible");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    ensurePracticeClickable();
    [100,400,1000,2000].forEach(function(ms){ setTimeout(ensurePracticeClickable, ms); });
    var mo = new MutationObserver(function(){ ensurePracticeClickable(); });
    if(document.body) mo.observe(document.body, {childList:true, subtree:true, attributes:true});
  });

  window.MedPracticeSafetyV282 = {
    check: ensurePracticeClickable,
    version: "v282"
  };
})();
