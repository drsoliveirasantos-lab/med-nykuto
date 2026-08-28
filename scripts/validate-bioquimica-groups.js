const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = {
  api: path.join(root, 'functions/api/bioquimica-groups.js'),
  client: path.join(root, 'bioquimica-groups-v499.js'),
  css: path.join(root, 'bioquimica-groups-v499.css'),
  page: path.join(root, 'bioquimica-grupos.html'),
  calendar: path.join(root, 'calendar-subscription-v485.js'),
  serviceWorker: path.join(root, 'service-worker.js')
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [label, file] of Object.entries(files)) {
  assert(fs.existsSync(file), `Missing ${label}: ${path.relative(root, file)}`);
}

for (const file of [files.api, files.client, files.calendar, files.serviceWorker]) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

const api = fs.readFileSync(files.api, 'utf8');
const client = fs.readFileSync(files.client, 'utf8');
const page = fs.readFileSync(files.page, 'utf8');
const calendar = fs.readFileSync(files.calendar, 'utf8');
const serviceWorker = fs.readFileSync(files.serviceWorker, 'utf8');
const combined = [api, client, page, calendar, serviceWorker].join('\n');

const groupMatches = [...api.matchAll(/Object\.freeze\(\{ number: (\d+), members: Object\.freeze\(\[(.*?)\]\) \}\)/gs)];
assert(groupMatches.length === 10, `Expected 10 Bioquímica groups, found ${groupMatches.length}.`);
const expectedCounts = [10, 9, 10, 10, 9, 11, 10, 10, 9, 3];
const groups = new Map();
for (const match of groupMatches) {
  const number = Number(match[1]);
  const names = [...match[2].matchAll(/^\s*'([^']+)'[,]?$/gm)].map((item) => item[1]);
  groups.set(number, names);
  assert(names.length === expectedCounts[number - 1], `Group ${number}: expected ${expectedCounts[number - 1]} names, found ${names.length}.`);
}

const group10 = groups.get(10) || [];
assert(group10.join('|') === ['Ellen Cordeiro Nunes', 'Diego Oliveira Santos', 'Clara Oliveira Santos'].join('|'), 'Group 10 seed must contain only Ellen, Diego and Clara in that order.');
assert((groups.get(6) || []).length === 11, 'Group 6 must remain flagged at 11/10 until one member is confirmed for relocation.');
assert([...groups.values()].reduce((total, names) => total + names.length, 0) === 91, 'The seeded list must contain exactly 91 names across groups 1–10.');
assert(!/Paixao/i.test(combined), 'The WhatsApp alias must not be exposed in the task or public group page.');
assert(!/29852|29683|31831|29433|31634/.test(api), 'Raw student registration numbers must not be committed in the public seed.');
assert(/matricula_hash/.test(api) && /privacySecret/.test(api) && /HMAC/.test(api), 'New registrations must store only a protected matrícula hash.');
assert(/confirmUngrouped/.test(api) && /JOINABLE_GROUP = 10/.test(api), 'Only confirmed ungrouped students may join Group 10.');
assert(/\.sort\(\)\s*\.join\(' '\)/.test(api) && /function nameMatches/.test(client), 'Name matching must tolerate reversed name order such as Oliveira Santos Diego.');
assert(/noindex,nofollow,noarchive/.test(page), 'The public names page must be excluded from search indexing.');
assert(/data-bioquimica-groups-app="full"/.test(page), 'The full interactive application mount is missing.');
assert(/bioquimica-groups-v499\.js\?v=499/.test(calendar), 'The class hub loader does not include the Bioquímica groups client.');
assert(/bioquimica-groups-v499\.css\?v=499/.test(calendar), 'The class hub loader does not include the Bioquímica groups stylesheet.');
assert(/document\.getElementById\('taskList'\)/.test(calendar), 'The canonical turma shell is not enabled in the Bioquímica loader.');
assert(/bioquimica-grupos\.html/.test(serviceWorker), 'The service worker does not cache the full groups page.');
assert(/task-bioquimica-pratica-2026-09-02/.test(client), 'The Bioquímica practical task is not injected into Tareas.');
assert(/createTurmaTaskCard/.test(client) && /createTurmaHomeCard/.test(client), 'The canonical turma Tareas and home integrations are missing.');
assert(/02\/09\/2026/.test(client) && /trabalhos assinados/i.test(client), 'The task summary is missing the confirmed exam date or signed-work instruction.');

console.log('Bioquímica II group organizer validation passed.');
