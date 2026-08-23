const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const html = read('clase.html');
const runtime = read('class-hub-runtime-v440.js');
const api = read('functions/api/class-hub.js');
const management = read('gestion.html') + read('gestion-v440.js');
global.window = {};
require(path.join(root, 'academic-model-v445.js'));
const academicModel = global.window.MedNykutoAcademicModel;
delete global.window;

const lessons = [
  'bioquimica-2026-08-19',
  'epidemiologia-2026-08-19',
  'fisiologia-2026-08-20',
  'microbiologia-practica-2026-08-20',
  'bioquimica-2026-08-21'
];

function extractElementById(source, id) {
  const idIndex = source.indexOf(`id="${id}"`);
  if (idIndex < 0) return '';
  const opening = source.lastIndexOf('<div', idIndex);
  if (opening < 0) return '';
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = opening;
  let depth = 0;
  let match;
  while ((match = tags.exec(source))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return source.slice(opening, tags.lastIndex);
  }
  return '';
}

lessons.forEach((id) => {
  const block = extractElementById(html, id);
  expect(Boolean(block), `Missing dated lesson ${id}.`);
  expect((block.match(/data-lesson-tab="/g) || []).length === 6, `${id} must expose the six lesson tabs.`);
  expect(block.includes(`data-practice-slot="${id}"`), `${id} is missing its isolated practice slot.`);
  ['curso', 'rapida', 'ultra', 'training', 'material', 'ia'].forEach((tab) => expect(block.includes(`data-lesson-tab-panel="${tab}"`), `${id} is missing the ${tab} panel.`));
  expect(block.includes('course-chapter-2026'), `${id} must present Curso completo as a continuous chapter.`);
  expect((block.match(/course-chapter-section/g) || []).length >= 6, `${id} must develop at least six narrative course sections.`);
  expect(!block.includes('concept-grid-2026'), `${id} still presents Curso completo as a concept-card grid.`);
});

[
  'assets/class-hub/epidemiology/2026-08-19/organizacion-urgencias-emergencias.pptx',
  'assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx',
  'assets/class-hub/epidemiology/2026-08-19/teacher-guidance/0746E8D5-EFF3-46DF-99C4-CD3D83376F7A.jpeg',
  'assets/class-hub/physiology/2026-08-20/ejercicios-fijacion-sistema-nervioso.pdf',
  'assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx',
  'manifest.webmanifest', 'service-worker.js', 'gestion.html', 'profesores.html', 'archivos.html'
].forEach((file) => expect(exists(file), `Missing required deliverable ${file}.`));

const originalHashes = {
  'assets/class-hub/epidemiology/2026-08-19/organizacion-urgencias-emergencias.pptx': 'bbd160a577240b11de4357f32123d59e2464c8a653e3aa9a5c1ce7bc79f49428',
  'assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx': '44cbcc560a6533358a99e2d8576103296cabacc1165c3ce83aa5c3b1280fbbae',
  'assets/class-hub/epidemiology/2026-08-19/teacher-guidance/0746E8D5-EFF3-46DF-99C4-CD3D83376F7A.jpeg': '8650767e09c0b8ab2e136bf40b449d1703afb064323ef9fd8323f2d44eca5de7',
  'assets/class-hub/physiology/2026-08-20/ejercicios-fijacion-sistema-nervioso.pdf': 'd799b39823b886101634e6407c9298ebe11e98479b666e26ae787ec819388110',
  'assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx': '26780a5fe86ee056d438b2e4889a6315d3f9a0d127573759aa6e81e008c6077e'
};
Object.entries(originalHashes).forEach(([file, hash]) => {
  if (!exists(file)) return;
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  expect(actual === hash, `Original teacher file changed: ${file}.`);
});

const countFiles = (directory, extension) => fs.readdirSync(path.join(root, directory)).filter((file) => file.endsWith(extension)).length;
expect(countFiles('assets/class-hub/epidemiology/2026-08-19/slides', '.webp') === 57, 'Epidemiology must expose 57 ordered slide previews.');
expect(countFiles('assets/class-hub/physiology/2026-08-20/pages', '.webp') === 13, 'Physiology must expose 13 ordered page previews.');
expect(countFiles('assets/class-hub/biochemistry/2026-08-21/task-pages', '.webp') === 4, 'Biochemistry activities must expose four page previews.');
expect(countFiles('assets/class-hub/biochemistry/2026-08-19/board', '.svg') === 2, 'The 19 August Biochemistry lesson must expose two clean SVG boards.');
expect(countFiles('assets/class-hub/biochemistry/2026-08-21/board', '.svg') === 3, 'The 21 August Biochemistry lesson must expose three clean SVG boards.');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
const classAssets = walk(path.join(root, 'assets', 'class-hub')).map((file) => path.relative(root, file));
const teacherGuidance = 'assets/class-hub/epidemiology/2026-08-19/teacher-guidance/0746E8D5-EFF3-46DF-99C4-CD3D83376F7A.jpeg';
expect(!classAssets.some((file) => /whatsapp|photo-original/i.test(file) || (/\.(?:jpe?g)$/i.test(file) && file !== teacherGuidance)), 'Unapproved raw board photos or message captures remain in the published class assets.');
expect(!/apartamento|número de teléfono|whatsapp/i.test(html), 'Private off-topic conversation leaked into the public class page.');
const epidemiologyStart = html.indexOf('<section id="epidemiologia"');
const epidemiologyLesson = html.indexOf('id="epidemiologia-2026-08-19"', epidemiologyStart);
const epidemiologyProject = html.indexOf('id="epi19-tarea"', epidemiologyStart);
expect(epidemiologyProject > epidemiologyStart && epidemiologyProject < epidemiologyLesson, 'The active Epidemiology project must appear before the dated lessons.');
expect(html.includes('<strong>TODOS</strong><span>los integrantes deben hablar</span>') && html.includes('diapositivas como máximo') && html.includes('notebook para toda la sala'), 'The teacher clarification is not summarized in the active project.');
expect(html.includes(`data-image-lightbox="${teacherGuidance}"`), 'The original teacher clarification is not available from the project card.');

['Cuaderno', 'Temas', 'Archivos', 'Progreso'].forEach((label) => expect(runtime.includes(label), `Course workspace is missing ${label}.`));
expect(runtime.includes('data-image-lightbox'), 'Tap-to-enlarge scientific boards are not wired.');
expect(runtime.includes('serviceWorker.register'), 'PWA registration is missing.');
expect(runtime.includes('push.subscribe'), 'Optional push subscription is missing.');
expect(runtime.includes("el('details','live-task live-task-details')") && runtime.includes('data-live-task-id'), 'Active tasks do not expand inside the Tareas view.');
expect(runtime.includes("item.href='#pendientes'") && runtime.includes('expandLiveTasks'), 'Task notifications do not route to and unfold Tareas.');
expect(runtime.includes('trabajo-practico-salud-publica-epidemiologia.docx') && runtime.includes('actividades-3-y-4-bioquimica-ii.docx'), 'In-place task briefs are missing their original downloads.');
expect(runtime.includes("groupActivity:'epi-2026-08-19'") && runtime.includes('live-task-groups group-activity-card'), 'The Epidemiology task does not own the shared group workspace.');
expect(!html.includes('id="epi-project-groups"') && html.includes('href="#task-epi-presentation">Ver grupos en Tareas</a>'), 'The course still duplicates the interactive roster instead of routing to Tareas.');
expect(html.includes('<time datetime="2026-08-12">12 AGO 2026</time>'), 'The previous Epidemiology lesson is not dated 12 August 2026.');
expect(runtime.includes("action:'group.join'") && runtime.includes("action:'group.leave'"), 'Student group join/leave controls are incomplete.');
expect(runtime.includes('group-roster-board') && runtime.includes('group-roster-column') && runtime.includes('activityMembers') && runtime.includes('--group-count'), 'The public multi-column group roster is missing.');

expect(api.includes("role: 'owner'"), 'Owner authorization is missing.');
expect(api.includes("role: 'editor'"), 'Editor authorization is missing.');
expect(api.includes('EDITOR_ACTIONS'), 'Server-side editor allowlist is missing.');
expect(api.includes('invite.create') && api.includes('invite.revoke') && api.includes('editor.revoke'), 'Revocable invitation lifecycle is incomplete.');
expect(api.includes('hub_audit'), 'Audit log schema is missing.');
expect(api.includes('UNIQUE(activity_id, student_hash)'), 'One-student-per-activity server constraint is missing.');
expect(api.includes('COUNT(*) FROM hub_memberships') && api.includes('MIN(a.capacity,g.capacity)'), 'Atomic group capacity guard is missing.');
expect(api.includes('m.display_name AS displayName') && api.includes('members: members.results || []'), 'Published group rosters do not expose their recorded display names.');
expect(api.includes('cleanUrl') && api.includes("['http:', 'https:']"), 'Managed file URLs are not restricted to HTTP(S).');
expect(api.includes('hub_rate_limits') && api.includes('rate_limited'), 'Public and management routes are missing server-side abuse limits.');
expect(api.includes('waitUntil(pushJob)'), 'Push delivery is not delegated to a Pages background task.');
expect(api.includes("['important', 'urgent']"), 'Important and urgent push dispatch is missing.');
expect(!/\b(?:csv|xlsx|excel)\b/i.test(management), 'Management offers a forbidden CSV/Excel export.');
expect(management.includes('Copiar para WhatsApp') && management.includes('Exportar en PDF'), 'WhatsApp and PDF group exports are missing.');
expect(Boolean(academicModel) && Object.keys(academicModel.teachers || {}).length === 6, 'Exactly six cumulative teacher audits are required.');
expect(read('profesores.html').includes('id="teacherProfiles"'), 'Teacher audits must be rendered from the cumulative academic model.');

if (failures.length) {
  console.error('21 August handoff validation failed:');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}
console.log('21 August handoff validation OK: 5 original handoff lessons, 57+13 source previews, 5 clean boards, CMS/RBAC/groups/PWA and 6 cumulative teacher audits.');
