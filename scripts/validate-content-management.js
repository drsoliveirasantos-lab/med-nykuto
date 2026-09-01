const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

async function importSource(file) {
  let source = read(file);
  if (file === 'functions/api/class-hub.js') {
    const helperUrl = `data:text/javascript;base64,${Buffer.from(read('functions/_lib/management-credentials.js')).toString('base64')}`;
    source = source.replace('../_lib/management-credentials.js', helperUrl);
  }
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#content-${Date.now()}-${Math.random()}`);
}

function practiceQuestion(kind, index) {
  const number = index + 1;
  const base = {
    question: `${kind} pregunta clínica ${number}`,
    answerIndex: index % (kind === 'trueFalse' ? 2 : 4),
    explanation: `Explicación clínica suficientemente clara para la pregunta ${number}.`
  };
  if (kind !== 'trueFalse') base.options = [`Opción ${number} A`, `Opción ${number} B`, `Opción ${number} C`, `Opción ${number} D`];
  if (kind === 'clinicalCases') base.stem = `Paciente del caso clínico ${number} con signos descritos de forma suficiente.`;
  return base;
}

function completePractice() {
  return {
    qcm: Array.from({ length: 20 }, (_, index) => practiceQuestion('qcm', index)),
    trueFalse: Array.from({ length: 10 }, (_, index) => practiceQuestion('trueFalse', index)),
    clinicalCases: Array.from({ length: 10 }, (_, index) => practiceQuestion('clinicalCases', index))
  };
}

async function validateNormalizationContract() {
  const api = await importSource('functions/api/class-hub.js');
  expect(typeof api.normalizeContentLessonInput === 'function', 'The content lesson normalizer is not exported for deterministic validation.');
  expect(typeof api.normalizeContentPractice === 'function', 'The practice normalizer is not exported for deterministic validation.');
  expect(typeof api.contentLessonPublishProblem === 'function', 'The publish contract helper is not exported for deterministic validation.');
  if (typeof api.normalizeContentLessonInput !== 'function') return;

  const lesson = {
    id: 'managed-fixture-2026-08-26',
    subjectId: 'fisiologia-ii',
    lessonDate: '2026-08-26',
    title: 'Fisiología cardiovascular',
    description: 'Fixture synthétique sans donnée personnelle.',
    status: 'published',
    full: '# Curso completo\nContenido revisado.',
    quick: '## Ficha rápida\nPuntos clave.',
    ultra: '## Ultra rápida\nRecordatorio.',
    practice: completePractice()
  };
  const first = api.normalizeContentLessonInput(lesson);
  expect(first.ok, `A complete 20/10/10 published lesson was rejected: ${first.error || first.code || 'unknown error'}.`);
  if (!first.ok) return;
  expect(first.lesson.practice.qcm.every((question) => question.id && question.revision === 1), 'Initial QCM questions do not receive stable IDs and revision 1.');
  expect(first.lesson.practice.trueFalse.every((question) => question.options.length === 2), 'True/false questions are not normalized to two choices.');

  const unchanged = api.normalizeContentLessonInput(lesson, first.lesson);
  expect(unchanged.ok && unchanged.practiceChanged === false, 'An unchanged practice package incorrectly increments its practice revision.');
  expect(unchanged.ok && unchanged.lesson.practice.qcm[0].id === first.lesson.practice.qcm[0].id && unchanged.lesson.practice.qcm[0].revision === 1, 'An unchanged question lost its stable ID or revision.');

  const changedLesson = JSON.parse(JSON.stringify(lesson));
  changedLesson.practice.qcm[0].question = 'qcm pregunta clínica 1 modificada';
  const changed = api.normalizeContentLessonInput(changedLesson, first.lesson);
  expect(changed.ok && changed.practiceChanged === true, 'A changed practice question is not detected.');
  expect(changed.ok && changed.lesson.practice.qcm[0].id === first.lesson.practice.qcm[0].id && changed.lesson.practice.qcm[0].revision === 2, 'A changed question does not preserve its ID and increment its revision.');

  const incomplete = JSON.parse(JSON.stringify(lesson));
  incomplete.practice.qcm.pop();
  const incompleteResult = api.normalizeContentLessonInput(incomplete);
  expect(!incompleteResult.ok && incompleteResult.code === 'publish_incomplete', 'Publishing 19/10/10 questions is not rejected.');

  const draft = { ...incomplete, lessonDate: '', full: '', quick: '', ultra: '', status: 'draft' };
  const draftResult = api.normalizeContentLessonInput(draft);
  expect(draftResult.ok, `An intentionally incomplete draft was rejected: ${draftResult.error || draftResult.code || 'unknown error'}.`);

  const duplicateOptions = JSON.parse(JSON.stringify(lesson));
  duplicateOptions.practice.qcm[0].options[1] = duplicateOptions.practice.qcm[0].options[0];
  const duplicateOptionsResult = api.normalizeContentLessonInput(duplicateOptions);
  expect(!duplicateOptionsResult.ok && duplicateOptionsResult.code === 'duplicate_options', 'Duplicate answer options are not rejected.');

  for (const kind of ['qcm', 'clinicalCases']) {
    for (const invalidAnswerIndex of [null, '', true, false]) {
      const invalidAnswer = JSON.parse(JSON.stringify(lesson));
      invalidAnswer.practice[kind][0].answerIndex = invalidAnswerIndex;
      const invalidAnswerResult = api.normalizeContentLessonInput(invalidAnswer);
      expect(
        !invalidAnswerResult.ok && invalidAnswerResult.code === 'invalid_answer',
        `${kind} answerIndex ${JSON.stringify(invalidAnswerIndex)} is implicitly coerced instead of rejected.`
      );
    }
  }

  const zeroAnswer = JSON.parse(JSON.stringify(lesson));
  zeroAnswer.practice.qcm[0].answerIndex = 0;
  zeroAnswer.practice.clinicalCases[0].answerIndex = 0;
  const zeroAnswerResult = api.normalizeContentLessonInput(zeroAnswer);
  expect(zeroAnswerResult.ok && zeroAnswerResult.lesson.practice.qcm[0].answerIndex === 0 && zeroAnswerResult.lesson.practice.clinicalCases[0].answerIndex === 0, 'A numeric answerIndex of 0 is not preserved.');

  const booleanTrueFalseAnswer = JSON.parse(JSON.stringify(lesson));
  delete booleanTrueFalseAnswer.practice.trueFalse[0].answerIndex;
  booleanTrueFalseAnswer.practice.trueFalse[0].answer = false;
  const booleanTrueFalseResult = api.normalizeContentLessonInput(booleanTrueFalseAnswer);
  expect(booleanTrueFalseResult.ok && booleanTrueFalseResult.lesson.practice.trueFalse[0].answerIndex === 1, 'The true/false boolean answer alias is not preserved.');

  const duplicateQuestion = JSON.parse(JSON.stringify(lesson));
  duplicateQuestion.practice.qcm[1].question = duplicateQuestion.practice.qcm[0].question;
  const duplicateQuestionResult = api.normalizeContentLessonInput(duplicateQuestion);
  expect(!duplicateQuestionResult.ok && duplicateQuestionResult.code === 'duplicate_question', 'Duplicate questions are not rejected.');

  const unsafe = { ...lesson, full: '<script>alert(1)</script>' };
  const unsafeResult = api.normalizeContentLessonInput(unsafe);
  expect(!unsafeResult.ok && unsafeResult.code === 'unsafe_content', 'Unsafe lesson markup is not rejected.');
}

const required = [
  'functions/api/class-hub.js',
  'gestion-shell/index.html',
  'gestion-v440.js',
  'gestion-v440.css',
  'class-content-runtime-v483.js',
  'class-notebook-v445.js',
  'clase.html'
];

required.forEach((file) => expect(exists(file), `Missing managed-content file: ${file}.`));

if (!failures.length) {
  const api = read('functions/api/class-hub.js');
  const html = read('gestion-shell/index.html');
  const management = read('gestion-v440.js');
  const managementCss = read('gestion-v440.css');
  const runtime = read('class-content-runtime-v483.js');
  const notebook = read('class-notebook-v445.js');
  const classHtml = read('clase.html');

  expect(/CREATE TABLE IF NOT EXISTS hub_editor_permissions\s*\(/i.test(api), 'The class-scoped editor permission table is missing.');
  expect(/CREATE TABLE IF NOT EXISTS hub_editor_invite_permissions\s*\(/i.test(api), 'The isolated class-scoped invitation permission table is missing.');
  expect(/CREATE TABLE IF NOT EXISTS hub_site_owner_account\s*\(/i.test(api) && /account_key TEXT PRIMARY KEY CHECK\(account_key='primary'\)/.test(api), 'The singleton site-owner account table is missing or can hold multiple owners.');
  expect(/CREATE TABLE IF NOT EXISTS hub_content_lessons\s*\(/i.test(api), 'The current managed-lesson table is missing.');
  expect(/CREATE TABLE IF NOT EXISTS hub_content_revisions\s*\(/i.test(api), 'The immutable managed-lesson revision table is missing.');
  expect((api.match(/content\.manage/g) || []).length >= 3, 'The content.manage permission is not enforced and serialized consistently.');
  expect(api.includes("const INVITE_PERMISSION = 'invite.manage'") && api.includes('actorCanManageInvites') && api.includes('hub_editor_invite_permissions'), 'The invite.manage permission is not enforced and serialized consistently.');
  expect(/accountClassId/.test(api) && /manageAllClasses/.test(api) && /owner\.account_key='primary'/.test(api), 'The secure session actor does not distinguish its canonical credential class from its target class.');
  expect(/auth-login-global-account/.test(api), 'Site-owner login attempts can bypass the account limit by rotating class slugs.');
  expect(/action === 'class\.upsert'[\s\S]{0,1200}validSessionCsrf\(request, actor\)/.test(api), 'Session-based class administration is missing its explicit CSRF check.');
  expect(/owner_self_revoke_forbidden/.test(api) && /UPDATE hub_site_owner_account SET enabled=0/.test(api), 'The site-owner lifecycle is missing self-lockout protection or recovery revocation.');
  expect(/editor\.permission\.update/.test(api), 'The owner-only permission mutation is missing.');
  expect(/updateEditorContentPermission[\s\S]{0,1600}hub_editor_credentials[\s\S]{0,800}credential_required/.test(api), 'Content permission grants do not require a class-scoped email/password credential.');
  expect(/lesson\.upsert/.test(api), 'The managed lesson mutation is missing.');
  expect(/expectedRevision/.test(api) && /revision_conflict/.test(api), 'Managed lessons are missing optimistic concurrency checks.');
  expect(/CONTENT_MAX_BODY|MAX_CONTENT_BODY|CONTENT_BODY_MAX/.test(api) && /512\s*\*\s*1024/.test(api), 'The dedicated bounded content request limit is missing.');
  expect(/legacy|token/i.test(api) && /authMode|auth_mode/.test(api), 'The source does not make the legacy-token/content-capability distinction explicit.');

  [
    'manageTabContent', 'managePanelContent', 'lessonForm', 'lessonSubjectId', 'lessonDate',
    'lessonFullMarkdown', 'lessonQuickMarkdown', 'lessonUltraMarkdown', 'lessonPracticeJson',
    'practiceQcmCount', 'practiceTrueFalseCount', 'practiceClinicalCount', 'lessonPreview'
  ].forEach((id) => expect(html.includes(`id="${id}"`), `The management UI is missing #${id}.`));
  expect(html.includes('data-content-admin-only'), 'The managed-content panel is missing its capability visibility marker.');
  expect(html.includes('href="/gestion-v440.css?v=489"') && html.includes('src="/gestion-v440.js?v=492"'), 'The management content assets are not cache-busted at the current versions.');
  expect(html.includes('data-invite-admin-only'), 'The invitation manager panel is missing its dedicated capability visibility marker.');
  expect(html.includes('id="noticeAdvancedOptions"') && html.includes('id="noticePrimarySubmit"') && html.includes('data-notice-status="published"') && html.includes('data-notice-status="draft"'), 'The mobile quick-notice flow is missing its folded options or distinct publish/draft actions.');
  expect(/id="noticeAiAssistant"[^>]*hidden/.test(html), 'The notice AI assistant must stay hidden until an attachment is selected.');
  expect(management.includes('event.submitter') && management.includes("noticeNeedsDetailedReview()") && management.includes("confirm('¿Publicar") && management.includes('if(!data.id)delete data.id'), 'The notice runtime does not preserve explicit publish intent, human confirmation or assisted-review safeguards.');
  expect(/@media\(max-width:520px\)[\s\S]*#noticeForm\s*\{\s*grid-template-columns\s*:\s*minmax\(0,1fr\)/.test(managementCss), 'The notice form is not forced to one column on iPhone widths.');
  expect(html.includes('data-lesson-status="draft"') && html.includes('data-lesson-status="published"'), 'Draft and publish actions are not distinct.');
  expect(management.includes("action:'lesson.upsert'") || management.includes("action: 'lesson.upsert'"), 'The management runtime does not submit lesson.upsert.');
  expect(management.includes("action:'editor.permission.update'") || management.includes("action: 'editor.permission.update'"), 'The owner UI cannot grant or revoke content.manage.');
  expect(management.includes("permission:'invite.manage'") && management.includes('canManageInvites'), 'The owner UI cannot grant invite.manage independently.');
  expect(management.includes('PROPIETARIO GLOBAL') && management.includes('currentOwner') && management.includes('is_site_owner'), 'The owner account is not clearly marked or protected from self-management in the editor list.');
  expect((html.match(/class="manage-action-disclosure"/g) || []).length >= 4 && html.includes('id="auditToggle"'), 'Occasional owner actions are not collapsed or the recent-activity control is missing.');
  expect(management.includes('[data-owner-only]:not([data-manage-panel])') && management.includes('activateManageTab(selected&&!selected.hidden?selected:document.getElementById(\'manageTabTasks\'),false,false)'), 'Capability rendering can override the single-active management panel.');
  expect(management.includes('auditEntries.slice(0,5)') && management.includes("auditExpanded?'Ver menos':'Ver todo ("), 'The audit trail is not limited to five recent items before expansion.');
  expect(/\.manage-item strong,[^{]*\.manage-item small\s*\{[^}]*overflow-wrap\s*:\s*anywhere/i.test(managementCss), 'Long management identifiers can still create horizontal overflow.');
  expect(/20[^\n]{0,80}10[^\n]{0,80}10/.test(`${html}\n${management}`), 'The client does not communicate the exact 20/10/10 contract.');
  expect(!/lessonPreview[\s\S]{0,3000}innerHTML/.test(management), 'The lesson preview appears to inject raw HTML.');
  expect(/min-height\s*:\s*44px/i.test(managementCss), 'The content editor has no explicit 44 px touch target.');

  expect(classHtml.includes('<script type="module" src="class-content-runtime-v483.js?v=484"></script>'), 'The class page does not load the managed-content overlay as a versioned module.');
  expect(classHtml.includes('class-notebook-v445.js?v=501'), 'The modified notebook runtime cache version was not bumped.');
  expect(/await\s+fetch\(/.test(runtime), 'The overlay does not finish its public fetch before notebook initialization.');
  expect(/bioquimica-ii/.test(runtime) && /microbiologia-ii-practica/.test(runtime), 'The explicit S4 API-to-notebook subject alias map is incomplete.');
  expect(/data-managed-lesson|managedLesson/.test(runtime), 'Managed lesson panels are not marked for the notebook renderer.');
  expect(/practice-r/.test(runtime) && /practiceRevision/.test(runtime), 'Managed practice progress is not isolated by practice revision.');
  expect(!/\.innerHTML\s*=/.test(runtime), 'The managed-content runtime uses raw innerHTML.');
  expect(/managedContent/.test(notebook), 'The notebook does not preserve server-authored full/quick/ultra panels.');

  const personalEmailPattern = /[a-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo)\.[a-z]{2,}/i;
  expect(!personalEmailPattern.test(`${api}\n${html}\n${management}\n${runtime}`), 'A personal email address was hard-coded into managed-content sources.');
}

async function main() {
  if (!failures.length) {
    try {
      await validateNormalizationContract();
    } catch (error) {
      failures.push(`The deterministic content contract could not be loaded: ${error && error.message ? error.message : error}.`);
    }
  }
  if (failures.length) {
    console.error('Managed content validation failed:');
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exitCode = 1;
    return;
  }
  console.log('Managed content validation OK: scoped permission, versioned D1 lessons, deterministic 20/10/10 normalization and safe static fallback are wired.');
}

main();
