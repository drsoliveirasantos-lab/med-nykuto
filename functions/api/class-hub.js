const EDITOR_ACTIONS = new Set([
  'task.upsert', 'notice.upsert', 'activity.upsert', 'group.upsert', 'group.freeze',
  'member.move', 'member.remove', 'file.upsert', 'date.upsert'
]);
const STATUSES = new Set(['draft', 'published', 'archived']);
const NOTICE_PRIORITIES = new Set(['normal', 'important', 'urgent']);
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const MAX_BODY = 65536;
let schemaPromise;
const EPIDEMIOLOGY_ROSTER = [
  ['Alicia Vieira dos Santos','Ziz Emanuelly Barros Ramos','Nathália Amabile','Emanuelle Teixeira Keller','Guilherme Henrique Cisotto Marques','João Vitor Dalcin Portela','Hiago Cotrim Friedrich','Yanick Modesto Ribeiro','Manuela Ribeiro Quanz'],
  ['Camila de Jesus Maciel','Murillo Gabriel Batista de Oliveira','Luana Dos Santos','Igor Matheus Moraes Fedrici','Ana Luiza Ribeiro dos Santos','Bruna Carolina Vanderley Lima','Maria Luísa Rostelato','João Victor Paulino','Vitoria Hidaka de Souza','Maria Eduarda Hidaka Coelho'],
  ['Ester Moya','Kamyla Valêncio','Ayandra Alves de Souza','Camila Ferreira Lima Morais','Emily Eduarda Martins Borba','Tayssa Rodrigues','Nicolle Vitoria Ortiz Adriano','Ronise Lima','Djangler Rocha','Mateus Pacheco'],
  ['Giovanna de Oliveira Alves','Adriane de Castro Silva Alencar','Letícia Cristo Galvão','Yan Hubner Augusto','Anna Beatriz Lessa Oliveira','José Antônio Ferreira de Souza','Gabriel Lourenço Diniz','Giovani Barcellos','Fabiane Letícia','Victor Habner Rodrigues'],
  ['Byanka Gomes Barros','Pamela Larissa Gomes de Lima','Hugo Vinícius Pereira Silva','Lara Daronch','Geovani Garcia de Oliveira','Beatriz Gomes Barros','Julia Miriam Vilela','Francieli Aparecida Zerbato','Gabriele Alice Gelmi Fregati','Tiago Ferreira Araújo'],
  ['Barbara Jullian Amaral de Paula','Samanta Nunes de Miranda Amaral','Vinícius da Costa Jardim','Elielton Arquimedes de Oliveira Silva','Amanda Carolina Ludvichak Rodrigues','Gilcimar Alves Silva','Kathleen Rafaely Ferreira Lopes','Silvane Maria Costa','Carlos Aparecido da Silva Santos','Samuel Batista dos Santos'],
  ['Ianna Tamiña Batista Leite Ruiz','Anne Karoline Martins Fernandes de Melo','Renata Coltro','Bruno Chevi','Anderson do Nascimento','Andreza Andrade Nascimento','Geovana Mendonça','Dantom Oliveira de Farias','Mauro Lino Teixeira Barbosa'],
  ['Ana Clara Ferraz Guimarães','Karen Beatriz Melo Piva','Paolla de Paiva Pinto','Daniele Lourdes Domingues Maia','Camila Idilia Rodrigues Correa Maria','Clayve de Oliveira Santos','Daniel Santana Ramos de Ataides','Ana Paula Vicente','Paulo Renato Lima Araújo'],
  ['Adna Juliana Nunes Silva Pinheiro','Layssa Karoline Barbosa','Stephany Januario Matos','Maria Vitória Teles Fernandes','Maryanna Araujo da Silva','Maslow Gabriel Neis Pontes','Giovana Sabatke','Camila Alencar Delmutti','Thallys Gabriel Rigo'],
  ['Mariellen Ayane de Freitas','Michael da Silva de Mesquita','Marizely L de Freitas Veras','Marcos Dhemerson Ferreira Feitosa','Danilo Evandro Silva Lima','José Maria de Souza Neto','Davi Mateus Vasconcelos','Clara Oliveira Santos','Diego Oliveira Santos','Ellen Cordeiro Nunes']
];
const EPIDEMIOLOGY_GROUP_TOPICS = [
  'Virus sincitial respiratorio · Bronquiolitis',
  'Influenza',
  'Tuberculosis',
  'Sarampión',
  'Meningitis bacteriana',
  'Dengue',
  'COVID-19',
  'Sífilis',
  'Hepatitis B',
  'Malaria'
];

function withEpidemiologyAssignment(group) {
  const match = /^epi-2026-08-19-g(\d+)$/.exec(String(group?.id || ''));
  const index = match ? Number(match[1]) - 1 : -1;
  if (index < 0 || index >= EPIDEMIOLOGY_ROSTER.length) return group;
  return {
    ...group,
    leader: EPIDEMIOLOGY_ROSTER[index][0],
    topic: EPIDEMIOLOGY_GROUP_TOPICS[index]
  };
}

const DEFAULT_PUBLIC = {
  notices: [
    { id: 'week-2026-08-21', priority: 'normal', title: 'Cursos del 19 al 21 de agosto disponibles', body: 'Bioquímica, Epidemiología, Fisiología y Microbiología práctica ya están organizadas.', status: 'published' },
    { id: 'tasks-2026-08-21', priority: 'important', title: 'Dos trabajos activos', body: 'Epidemiología: exposición grupal. Bioquímica: imprimir y completar a mano las actividades 3 y 4.', status: 'published' }
  ],
  tasks: [
    { id: 'epi-presentation', course: 'Epidemiología', title: 'Exposición grupal de enfermedad sorteada', description: 'Máximo 10 integrantes, diapositivas, uniforme, puntualidad y evaluación individual.', dueLabel: 'Mié. 26 ago.', dueAt: '2026-08-26T11:20:00-03:00', status: 'published' },
    { id: 'bio-activities', course: 'Bioquímica II', title: 'Actividades 3 y 4 impresas y manuscritas', description: 'El práctico contiene cinco actividades y la presencia es obligatoria.', dueLabel: 'Vie. 21 ago.', dueAt: '2026-08-21T09:10:00-03:00', status: 'published' }
  ],
  activities: [{ id: 'epi-2026-08-19', title: 'Exposición de Epidemiología', capacity: 10, status: 'published', frozen: false }],
  groups: [],
  members: []
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers } });
}
function fail(status, code, error, headers = {}) { return json({ ok: false, code, error }, status, headers); }
function dbFrom(env) { return env.MED_NYKUTO_DB || env.DB || null; }
function nowIso() { return new Date().toISOString(); }
function cleanText(value, max = 500) { return String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function cleanId(value) { const id = String(value || '').trim().toLowerCase(); return ID_PATTERN.test(id) ? id : ''; }
function cleanStatus(value, fallback = 'draft') { return STATUSES.has(value) ? value : fallback; }
function cleanPriority(value) { return NOTICE_PRIORITIES.has(value) ? value : 'normal'; }
function cleanUrl(value) { const raw = cleanText(value, 1000); if (!raw) return ''; try { const parsed = new URL(raw, 'https://med.nykuto.invalid/'); if (!['http:', 'https:'].includes(parsed.protocol)) return ''; return parsed.origin === 'https://med.nykuto.invalid' ? `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\//, '') : parsed.href; } catch { return ''; } }
function integer(value, fallback, min, max) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback; }
function sameOrigin(request) { const origin = request.headers.get('origin'); if (!origin) return true; try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; } }
async function payload(request) { const length = Number(request.headers.get('content-length') || 0); if (length > MAX_BODY) throw new Error('payload_too_large'); if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('invalid_content_type'); return request.json(); }
async function digest(value) { const bytes = new TextEncoder().encode(String(value)); const hash = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(hash)].map((part) => part.toString(16).padStart(2, '0')).join(''); }
async function rateLimit(request, env, db, scope, limit, windowSeconds) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const salt = env.MED_NYKUTO_RATE_SALT || env.MED_NYKUTO_OWNER_TOKEN || 'med-nykuto-rate-v440';
  const key = await digest(`${salt}:${scope}:${address}`), windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
  await db.prepare(`INSERT INTO hub_rate_limits (key,window_start,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start`).bind(key, windowStart).run();
  const row = await db.prepare(`SELECT count FROM hub_rate_limits WHERE key=?`).bind(key).first();
  return Number(row?.count) > limit ? fail(429, 'rate_limited', 'Demasiados intentos. Espera antes de volver a probar.', { 'retry-after': String(windowSeconds) }) : null;
}
function safeEqual(left, right) { left = String(left || ''); right = String(right || ''); let mismatch = left.length ^ right.length; const size = Math.max(left.length, right.length); for (let i = 0; i < size; i += 1) mismatch |= (left.charCodeAt(i % Math.max(1, left.length)) || 0) ^ (right.charCodeAt(i % Math.max(1, right.length)) || 0); return mismatch === 0; }
function token() { const bytes = crypto.getRandomValues(new Uint8Array(32)); return [...bytes].map((part) => part.toString(16).padStart(2, '0')).join(''); }
function generatedId(prefix) { return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`; }

async function activityState(db, activityId, current = nowIso()) {
  const activity = await db.prepare(`SELECT id,capacity,frozen,closes_at FROM hub_activities WHERE id=?`).bind(activityId).first();
  if (!activity) return { exists: false, locked: true, capacity: 0, closesAt: null };
  return {
    exists: true,
    locked: Boolean(activity.frozen) || Boolean(activity.closes_at && activity.closes_at <= current),
    capacity: Number(activity.capacity) || 0,
    closesAt: activity.closes_at || null
  };
}

async function ensureSchema(db) {
  if (!schemaPromise) schemaPromise = db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_tasks (id TEXT PRIMARY KEY, course TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_label TEXT NOT NULL DEFAULT '', due_at TEXT, status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_notices (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'draft', push_mode INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_activities (id TEXT PRIMARY KEY, title TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 10, closes_at TEXT, status TEXT NOT NULL DEFAULT 'draft', frozen INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_groups (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, name TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 10, frozen INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(activity_id, name), FOREIGN KEY(activity_id) REFERENCES hub_activities(id))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_memberships (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, group_id TEXT NOT NULL, student_hash TEXT NOT NULL, display_name TEXT NOT NULL, joined_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(activity_id, student_hash), FOREIGN KEY(activity_id) REFERENCES hub_activities(id), FOREIGN KEY(group_id) REFERENCES hub_groups(id))`),
    db.prepare(`CREATE INDEX IF NOT EXISTS hub_memberships_group_idx ON hub_memberships(group_id, joined_at)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_files (id TEXT PRIMARY KEY, course TEXT NOT NULL, lesson_date TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, url TEXT NOT NULL, file_type TEXT NOT NULL DEFAULT 'link', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_dates (id TEXT PRIMARY KEY, label TEXT NOT NULL, starts_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_invites (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, label TEXT NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT, claimed_at TEXT, created_by TEXT NOT NULL, created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_editors (id TEXT PRIMARY KEY, name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, last_used_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL, actor_role TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS hub_audit_created_idx ON hub_audit(created_at DESC)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_push_subscriptions (id TEXT PRIMARY KEY, endpoint_hash TEXT NOT NULL UNIQUE, subscription_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS hub_rate_limits (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0)`)
  ]).then(async () => {
    const created = nowIso();
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO hub_tasks (id,course,title,description,due_label,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'published','system',?,?)`).bind('epi-presentation', 'Epidemiología', 'Exposición grupal de enfermedad sorteada', 'Máximo 10 integrantes, diapositivas, uniforme, puntualidad y evaluación individual.', 'Semana siguiente', created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_tasks (id,course,title,description,due_label,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'published','system',?,?)`).bind('bio-activities', 'Bioquímica II', 'Actividades 3 y 4 impresas y manuscritas', 'El práctico contiene cinco actividades y la presencia es obligatoria.', 'Práctico', created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_notices (id,title,body,priority,status,push_mode,created_by,created_at,updated_at,published_at) VALUES (?,?,?,'normal','published',0,'system',?,?,?)`).bind('week-2026-08-21', 'Cursos del 19 al 21 de agosto disponibles', 'Bioquímica, Epidemiología, Fisiología y Microbiología práctica ya están organizadas.', created, created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_notices (id,title,body,priority,status,push_mode,created_by,created_at,updated_at,published_at) VALUES (?,?,?,'important','published',0,'system',?,?,?)`).bind('tasks-2026-08-21', 'Dos trabajos activos', 'Epidemiología: exposición grupal. Bioquímica: imprimir y completar a mano las actividades 3 y 4.', created, created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_activities (id,title,capacity,status,frozen,created_by,created_at,updated_at) VALUES ('epi-2026-08-19','Exposición de Epidemiología',10,'published',0,'system',?,?)`).bind(created, created),
      ...EPIDEMIOLOGY_ROSTER.map((_, index) => db.prepare(`INSERT OR IGNORE INTO hub_groups (id,activity_id,name,capacity,frozen,created_by,created_at,updated_at) VALUES (?, 'epi-2026-08-19', ?, 10, 0, 'system', ?, ?)`).bind(`epi-2026-08-19-g${index + 1}`, `Grupo ${index + 1}`, created, created))
    ]);
    await db.batch(EPIDEMIOLOGY_ROSTER.flatMap((names, groupIndex) => names.map((displayName, memberIndex) => db.prepare(`INSERT OR IGNORE INTO hub_memberships (id,activity_id,group_id,student_hash,display_name,joined_at,updated_at) VALUES (?, 'epi-2026-08-19', ?, ?, ?, ?, ?)`).bind(`roster-g${groupIndex + 1}-m${memberIndex + 1}`, `epi-2026-08-19-g${groupIndex + 1}`, `roster:g${groupIndex + 1}:m${memberIndex + 1}`, displayName, created, created))));
    await db.batch([
      db.prepare(`UPDATE hub_tasks SET due_label='Mié. 26 ago.',due_at='2026-08-26T11:20:00-03:00',updated_at=? WHERE id='epi-presentation'`).bind(created),
      db.prepare(`UPDATE hub_tasks SET due_label='Vie. 21 ago.',due_at='2026-08-21T09:10:00-03:00',updated_at=? WHERE id='bio-activities'`).bind(created)
    ]);
  }).catch((error) => { schemaPromise = null; throw error; });
  return schemaPromise;
}

async function authenticate(request, env, db) {
  const header = request.headers.get('authorization') || '';
  const presented = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!presented) return null;
  if (env.MED_NYKUTO_OWNER_TOKEN && safeEqual(presented, env.MED_NYKUTO_OWNER_TOKEN)) return { id: 'owner', role: 'owner', name: 'Propietario' };
  const tokenHash = await digest(presented);
  const editor = await db.prepare(`SELECT id,name,status FROM hub_editors WHERE token_hash=?`).bind(tokenHash).first();
  if (!editor || editor.status !== 'active') return null;
  await db.prepare(`UPDATE hub_editors SET last_used_at=? WHERE id=?`).bind(nowIso(), editor.id).run();
  return { id: editor.id, role: 'editor', name: editor.name };
}
async function audit(db, actor, action, entityType, entityId, details = {}) { await db.prepare(`INSERT INTO hub_audit (actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,?,?,?,?,?)`).bind(actor.id, actor.role, action, entityType, entityId, JSON.stringify(details).slice(0, 2000), nowIso()).run(); }

async function readPublic(db) {
  const [notices, tasks, activities, groups, members, files, dates] = await Promise.all([
    db.prepare(`SELECT id,title,body,priority,status,published_at AS publishedAt FROM hub_notices WHERE status='published' ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, COALESCE(published_at,updated_at) DESC`).all(),
    db.prepare(`SELECT id,course,title,description,due_label AS dueLabel,due_at AS dueAt,status FROM hub_tasks WHERE status='published' ORDER BY COALESCE(due_at,'9999') ASC, updated_at DESC`).all(),
    db.prepare(`SELECT id,title,capacity,closes_at AS closesAt,status,CASE WHEN frozen=1 OR (closes_at IS NOT NULL AND closes_at<=?) THEN 1 ELSE 0 END AS frozen FROM hub_activities WHERE status='published' ORDER BY updated_at DESC`).bind(nowIso()).all(),
    db.prepare(`SELECT g.id,g.activity_id AS activityId,g.name,g.capacity,CASE WHEN g.frozen=1 OR a.frozen=1 OR (a.closes_at IS NOT NULL AND a.closes_at<=?) THEN 1 ELSE 0 END AS frozen,COUNT(m.id) AS memberCount FROM hub_groups g LEFT JOIN hub_memberships m ON m.group_id=g.id JOIN hub_activities a ON a.id=g.activity_id WHERE a.status='published' GROUP BY g.id ORDER BY g.activity_id,CAST(SUBSTR(g.name,7) AS INTEGER)`).bind(nowIso()).all(),
    db.prepare(`SELECT m.activity_id AS activityId,m.group_id AS groupId,m.display_name AS displayName,m.joined_at AS joinedAt FROM hub_memberships m JOIN hub_activities a ON a.id=m.activity_id WHERE a.status='published' ORDER BY m.activity_id,m.group_id,m.joined_at,m.display_name`).all(),
    db.prepare(`SELECT id,course,lesson_date AS lessonDate,title,url,file_type AS fileType,status FROM hub_files WHERE status='published' ORDER BY updated_at DESC`).all(),
    db.prepare(`SELECT id,label,starts_at AS startsAt,status FROM hub_dates WHERE status='published' ORDER BY starts_at`).all()
  ]);
  return { ok: true, notices: notices.results || [], tasks: tasks.results || [], activities: (activities.results || []).map((item) => ({ ...item, frozen: Boolean(item.frozen) })), groups: (groups.results || []).map((item) => withEpidemiologyAssignment({ ...item, frozen: Boolean(item.frozen), memberCount: Number(item.memberCount) || 0 })), members: members.results || [], files: files.results || [], dates: dates.results || [], generatedAt: nowIso() };
}

async function adminSnapshot(db, actor) {
  const [tasks, notices, activities, groups, memberships, files, dates, editors, invites] = await Promise.all([
    db.prepare(`SELECT * FROM hub_tasks ORDER BY updated_at DESC`).all(), db.prepare(`SELECT * FROM hub_notices ORDER BY updated_at DESC`).all(), db.prepare(`SELECT * FROM hub_activities ORDER BY updated_at DESC`).all(), db.prepare(`SELECT * FROM hub_groups ORDER BY activity_id,name`).all(), db.prepare(`SELECT id,activity_id,group_id,display_name,joined_at,updated_at FROM hub_memberships ORDER BY activity_id,group_id,display_name`).all(), db.prepare(`SELECT * FROM hub_files ORDER BY updated_at DESC`).all(), db.prepare(`SELECT * FROM hub_dates ORDER BY starts_at`).all(), actor.role === 'owner' ? db.prepare(`SELECT id,name,status,created_at,last_used_at FROM hub_editors ORDER BY created_at DESC`).all() : Promise.resolve({ results: [] }), actor.role === 'owner' ? db.prepare(`SELECT id,label,expires_at,revoked_at,claimed_at,created_at FROM hub_invites ORDER BY created_at DESC LIMIT 100`).all() : Promise.resolve({ results: [] })
  ]);
  return { ok: true, actor, tasks: tasks.results || [], notices: notices.results || [], activities: activities.results || [], groups: groups.results || [], memberships: memberships.results || [], files: files.results || [], dates: dates.results || [], editors: editors.results || [], invites: invites.results || [] };
}

async function joinGroup(data, db) {
  const activityId = cleanId(data.activityId), groupId = cleanId(data.groupId), displayName = cleanText(data.displayName, 40), suppliedStudentKey = cleanText(data.studentKey, 120);
  if (!activityId || !groupId || displayName.length < 2 || suppliedStudentKey.length < 12) return fail(400, 'invalid_membership', 'Faltan datos válidos para unirse al grupo.');
  const studentHash = await digest(suppliedStudentKey), current = nowIso(), membershipId = generatedId('member');
  try {
    const result = await db.prepare(`
      INSERT INTO hub_memberships (id,activity_id,group_id,student_hash,display_name,joined_at,updated_at)
      SELECT ?,a.id,g.id,?,?,?,?
      FROM hub_activities a JOIN hub_groups g ON g.activity_id=a.id
      WHERE a.id=? AND g.id=? AND a.status='published' AND a.frozen=0 AND g.frozen=0
        AND (a.closes_at IS NULL OR a.closes_at>?)
        AND (SELECT COUNT(*) FROM hub_memberships m WHERE m.group_id=g.id)<MIN(a.capacity,g.capacity)
    `).bind(membershipId, studentHash, displayName, current, current, activityId, groupId, current).run();
    if (!result.meta?.changes) return fail(409, 'group_unavailable', 'El grupo está cerrado, congelado o completo.');
    const group = await db.prepare(`SELECT name FROM hub_groups WHERE id=?`).bind(groupId).first();
    return json({ ok: true, activityId, groupId, groupName: group?.name || 'Grupo', displayName });
  } catch (error) {
    if (/UNIQUE/i.test(String(error))) return fail(409, 'already_grouped', 'Este dispositivo ya está inscrito en un grupo de la actividad. Sal del grupo antes de cambiar.');
    throw error;
  }
}
async function leaveGroup(data, db) { const activityId = cleanId(data.activityId), suppliedStudentKey = cleanText(data.studentKey, 120); if (!activityId || suppliedStudentKey.length < 12) return fail(400, 'invalid_membership', 'No se pudo identificar la inscripción.'); const studentHash = await digest(suppliedStudentKey); const result = await db.prepare(`DELETE FROM hub_memberships WHERE activity_id=? AND student_hash=? AND EXISTS (SELECT 1 FROM hub_activities a WHERE a.id=activity_id AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?))`).bind(activityId, studentHash, nowIso()).run(); return result.meta?.changes ? json({ ok: true }) : fail(409, 'membership_locked', 'La inscripción no existe o la actividad ya está congelada.'); }

async function claimInvite(data, db) {
  const inviteToken = cleanText(data.inviteToken, 200), name = cleanText(data.name, 60); if (inviteToken.length < 32 || name.length < 2) return fail(400, 'invalid_invite', 'La invitación o el nombre no son válidos.');
  const inviteHash = await digest(inviteToken), current = nowIso(), invite = await db.prepare(`SELECT id FROM hub_invites WHERE token_hash=? AND revoked_at IS NULL AND claimed_at IS NULL AND expires_at>?`).bind(inviteHash, current).first(); if (!invite) return fail(410, 'invite_expired', 'La invitación caducó, fue revocada o ya se utilizó.');
  const claim = await db.prepare(`UPDATE hub_invites SET claimed_at=? WHERE id=? AND token_hash=? AND revoked_at IS NULL AND claimed_at IS NULL AND expires_at>?`).bind(current, invite.id, inviteHash, current).run();
  if (!claim.meta?.changes) return fail(410, 'invite_expired', 'La invitación caducó, fue revocada o ya se utilizó.');
  const editorToken = token(), editorId = generatedId('editor');
  await db.batch([db.prepare(`INSERT INTO hub_editors (id,name,token_hash,status,created_at) VALUES (?,?,?,'active',?)`).bind(editorId, name, await digest(editorToken), current), db.prepare(`INSERT INTO hub_audit (actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,'editor','invite.claim','editor',?,'{}',?)`).bind(editorId, editorId, current)]);
  return json({ ok: true, editorToken, editor: { id: editorId, name, role: 'editor' } }, 201);
}
async function subscribePush(data, db) { const subscription = data.subscription; if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) return fail(400, 'invalid_subscription', 'La suscripción de alertas no es válida.'); const serialized = JSON.stringify(subscription); if (serialized.length > 8000) return fail(413, 'subscription_too_large', 'La suscripción es demasiado grande.'); const endpointHash = await digest(subscription.endpoint), current = nowIso(); await db.prepare(`INSERT INTO hub_push_subscriptions (id,endpoint_hash,subscription_json,status,created_at,updated_at) VALUES (?,?,?,'active',?,?) ON CONFLICT(endpoint_hash) DO UPDATE SET subscription_json=excluded.subscription_json,status='active',updated_at=excluded.updated_at`).bind(generatedId('push'), endpointHash, serialized, current, current).run(); return json({ ok: true }); }
async function dispatchPush(env, db, notice) { if (!env.MED_NYKUTO_PUSH_WEBHOOK || !notice.pushMode || !['important', 'urgent'].includes(notice.priority)) return; const subscriptions = await db.prepare(`SELECT subscription_json FROM hub_push_subscriptions WHERE status='active'`).all(); await fetch(env.MED_NYKUTO_PUSH_WEBHOOK, { method: 'POST', headers: { 'content-type': 'application/json', ...(env.MED_NYKUTO_PUSH_WEBHOOK_TOKEN ? { authorization: `Bearer ${env.MED_NYKUTO_PUSH_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify({ notice: { id: notice.id, title: notice.title, body: notice.body, priority: notice.priority, url: '/clase.html' }, subscriptions: (subscriptions.results || []).map((item) => JSON.parse(item.subscription_json)) }) }); }

async function mutate(action, data, actor, env, db, waitUntil) {
  const current = nowIso();
  if (actor.role === 'editor' && !EDITOR_ACTIONS.has(action)) return fail(403, 'permission_denied', 'El rol editor no puede modificar cursos, preguntas, perfiles, configuración ni permisos.');
  if (action === 'task.upsert') { const id = cleanId(data.id) || cleanId(data.slug) || generatedId('task'); const course = cleanText(data.course, 80), title = cleanText(data.title, 180); if (!course || !title) return fail(400, 'invalid_task', 'La materia y el título son obligatorios.'); const status = cleanStatus(data.status); await db.prepare(`INSERT INTO hub_tasks (id,course,title,description,due_label,due_at,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,title=excluded.title,description=excluded.description,due_label=excluded.due_label,due_at=excluded.due_at,status=excluded.status,updated_at=excluded.updated_at`).bind(id, course, title, cleanText(data.description, 1600), cleanText(data.dueLabel, 100), cleanText(data.dueAt, 40) || null, status, actor.id, current, current).run(); await audit(db, actor, action, 'task', id, { status }); return json({ ok: true, id, status }); }
  if (action === 'notice.upsert') { const id = cleanId(data.id) || generatedId('notice'), title = cleanText(data.title, 180); if (!title) return fail(400, 'invalid_notice', 'El título es obligatorio.'); const status = cleanStatus(data.status), priority = cleanPriority(data.priority), pushMode = priority === 'urgent' || Boolean(data.pushMode); await db.prepare(`INSERT INTO hub_notices (id,title,body,priority,status,push_mode,created_by,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,priority=excluded.priority,status=excluded.status,push_mode=excluded.push_mode,updated_at=excluded.updated_at,published_at=excluded.published_at`).bind(id, title, cleanText(data.body, 1200), priority, status, pushMode ? 1 : 0, actor.id, current, current, status === 'published' ? current : null).run(); await audit(db, actor, action, 'notice', id, { status, priority, pushMode }); if (status === 'published') { const pushJob = dispatchPush(env, db, { id, title, body: cleanText(data.body, 1200), priority, pushMode }).catch(() => audit(db, actor, 'notice.push_failed', 'notice', id)); if (typeof waitUntil === 'function') waitUntil(pushJob); else await pushJob; } return json({ ok: true, id, status }); }
  if (action === 'activity.upsert') {
    const id = cleanId(data.id) || generatedId('activity'), title = cleanText(data.title, 160);
    if (!title) return fail(400, 'invalid_activity', 'El título es obligatorio.');
    const previous = await activityState(db, id, current);
    if (previous.exists && previous.locked && actor.role !== 'owner') return fail(409, 'activity_locked', 'La actividad ya cerró y su composición es final.');
    const immutable = previous.exists && previous.locked;
    const status = cleanStatus(data.status), capacity = immutable ? previous.capacity : integer(data.capacity, 10, 1, 50), closesAt = immutable ? previous.closesAt : (cleanText(data.closesAt, 40) || null);
    const largestGroup = await db.prepare(`SELECT COALESCE(MAX(member_count),0) AS member_count FROM (SELECT COUNT(*) AS member_count FROM hub_memberships WHERE activity_id=? GROUP BY group_id)`).bind(id).first();
    if (Number(largestGroup?.member_count) > capacity) return fail(409, 'capacity_below_members', 'La capacidad no puede ser menor que un grupo ya formado.');
    await db.prepare(`INSERT INTO hub_activities (id,title,capacity,closes_at,status,frozen,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,capacity=excluded.capacity,closes_at=excluded.closes_at,status=excluded.status,updated_at=excluded.updated_at`).bind(id, title, capacity, closesAt, status, data.frozen ? 1 : 0, actor.id, current, current).run();
    await audit(db, actor, action, 'activity', id, { status, capacity });
    return json({ ok: true, id });
  }
  if (action === 'group.upsert') {
    const id = cleanId(data.id) || generatedId('group'), activityId = cleanId(data.activityId), name = cleanText(data.name, 80);
    if (!activityId || !name) return fail(400, 'invalid_group', 'La actividad y el nombre son obligatorios.');
    const activity = await activityState(db, activityId, current);
    if (!activity.exists) return fail(404, 'activity_missing', 'La actividad no existe.');
    if (activity.locked) return fail(409, 'activity_locked', 'La actividad ya cerró y su composición es final.');
    const capacity = Math.min(integer(data.capacity, 10, 1, 50), activity.capacity);
    const members = await db.prepare(`SELECT COUNT(*) AS count FROM hub_memberships WHERE group_id=?`).bind(id).first();
    if (Number(members?.count) > capacity) return fail(409, 'capacity_below_members', 'La capacidad no puede ser menor que el número actual de integrantes.');
    await db.prepare(`INSERT INTO hub_groups (id,activity_id,name,capacity,frozen,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,capacity=excluded.capacity,updated_at=excluded.updated_at`).bind(id, activityId, name, capacity, data.frozen ? 1 : 0, actor.id, current, current).run();
    await audit(db, actor, action, 'group', id, { activityId, capacity });
    return json({ ok: true, id });
  }
  if (action === 'group.freeze') {
    const activityId = cleanId(data.activityId);
    if (!activityId) return fail(400, 'invalid_activity', 'La actividad no es válida.');
    const activity = await activityState(db, activityId, current), frozen = data.frozen !== false;
    if (!activity.exists) return fail(404, 'activity_missing', 'La actividad no existe.');
    if (!frozen && activity.locked) return fail(409, 'activity_locked', 'Una actividad cerrada no puede volver a abrirse.');
    await db.batch([db.prepare(`UPDATE hub_activities SET frozen=?,updated_at=? WHERE id=?`).bind(frozen ? 1 : 0, current, activityId), db.prepare(`UPDATE hub_groups SET frozen=?,updated_at=? WHERE activity_id=?`).bind(frozen ? 1 : 0, current, activityId)]);
    await audit(db, actor, action, 'activity', activityId, { frozen });
    return json({ ok: true, activityId, frozen });
  }
  if (action === 'member.remove') {
    const id = cleanId(data.id);
    if (!id) return fail(400, 'invalid_member', 'La inscripción no es válida.');
    const result = await db.prepare(`DELETE FROM hub_memberships WHERE id=? AND EXISTS (SELECT 1 FROM hub_activities a WHERE a.id=hub_memberships.activity_id AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?))`).bind(id, current).run();
    if (!result.meta?.changes) return fail(409, 'membership_locked', 'La inscripción no existe o la composición ya es final.');
    await audit(db, actor, action, 'membership', id);
    return json({ ok: true });
  }
  if (action === 'member.move') {
    const id = cleanId(data.id), groupId = cleanId(data.groupId);
    if (!id || !groupId) return fail(400, 'invalid_member', 'La inscripción o el grupo no son válidos.');
    const result = await db.prepare(`UPDATE hub_memberships SET group_id=?,updated_at=? WHERE id=? AND EXISTS (SELECT 1 FROM hub_groups target JOIN hub_activities a ON a.id=target.activity_id WHERE target.id=? AND target.activity_id=hub_memberships.activity_id AND target.frozen=0 AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?) AND (SELECT COUNT(*) FROM hub_memberships m WHERE m.group_id=target.id)<MIN(a.capacity,target.capacity))`).bind(groupId, current, id, groupId, current).run();
    if (!result.meta?.changes) return fail(409, 'group_unavailable', 'El grupo de destino está lleno, cerrado o pertenece a otra actividad.');
    await audit(db, actor, action, 'membership', id, { groupId });
    return json({ ok: true });
  }
  if (action === 'file.upsert') { const id = cleanId(data.id) || generatedId('file'), title = cleanText(data.title, 180), url = cleanUrl(data.url), course = cleanText(data.course, 80); if (!title || !url || !course) return fail(400, 'invalid_file', 'Materia, título y una URL HTTP(S) válida son obligatorios.'); const status = cleanStatus(data.status); await db.prepare(`INSERT INTO hub_files (id,course,lesson_date,title,url,file_type,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,lesson_date=excluded.lesson_date,title=excluded.title,url=excluded.url,file_type=excluded.file_type,status=excluded.status,updated_at=excluded.updated_at`).bind(id, course, cleanText(data.lessonDate, 20), title, url, cleanText(data.fileType, 20) || 'link', status, actor.id, current, current).run(); await audit(db, actor, action, 'file', id, { status }); return json({ ok: true, id }); }
  if (action === 'date.upsert') { const id = cleanId(data.id) || generatedId('date'), label = cleanText(data.label, 120), startsAt = cleanText(data.startsAt, 40); if (!label || !startsAt) return fail(400, 'invalid_date', 'La etiqueta y la fecha son obligatorias.'); const status = cleanStatus(data.status); await db.prepare(`INSERT INTO hub_dates (id,label,starts_at,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET label=excluded.label,starts_at=excluded.starts_at,status=excluded.status,updated_at=excluded.updated_at`).bind(id, label, startsAt, status, actor.id, current, current).run(); await audit(db, actor, action, 'date', id, { status }); return json({ ok: true, id }); }
  if (action === 'invite.create' && actor.role === 'owner') { const inviteToken = token(), id = generatedId('invite'), hours = integer(data.hours, 48, 1, 168), expiresAt = new Date(Date.now() + hours * 3600000).toISOString(); await db.prepare(`INSERT INTO hub_invites (id,token_hash,label,expires_at,created_by,created_at) VALUES (?,?,?,?,?,?)`).bind(id, await digest(inviteToken), cleanText(data.label, 80) || 'Editor', expiresAt, actor.id, current).run(); await audit(db, actor, action, 'invite', id, { expiresAt }); return json({ ok: true, id, inviteToken, expiresAt }, 201); }
  if (action === 'invite.revoke' && actor.role === 'owner') { const id = cleanId(data.id); if (!id) return fail(400, 'invalid_invite', 'La invitación no es válida.'); const result = await db.prepare(`UPDATE hub_invites SET revoked_at=? WHERE id=? AND claimed_at IS NULL AND revoked_at IS NULL`).bind(current, id).run(); if (!result.meta?.changes) return fail(409, 'invite_unavailable', 'La invitación no existe, ya fue usada o ya fue revocada.'); await audit(db, actor, action, 'invite', id); return json({ ok: true }); }
  if (action === 'editor.revoke' && actor.role === 'owner') { const id = cleanId(data.id); if (!id) return fail(400, 'invalid_editor', 'El editor no es válido.'); const result = await db.prepare(`UPDATE hub_editors SET status='revoked' WHERE id=? AND status='active'`).bind(id).run(); if (!result.meta?.changes) return fail(409, 'editor_unavailable', 'El editor no existe o ya fue revocado.'); await audit(db, actor, action, 'editor', id); return json({ ok: true }); }
  return fail(403, 'action_forbidden', 'La acción no está permitida para este rol.');
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url), resource = url.searchParams.get('resource') || 'public', db = dbFrom(env);
  if (resource === 'push-key') return json({ ok: true, publicKey: env.MED_NYKUTO_VAPID_PUBLIC_KEY || '' });
  if (!db) return resource === 'public' ? json({ ok: true, ...DEFAULT_PUBLIC, mode: 'static-fallback' }) : fail(503, 'database_unavailable', 'La base de gestión no está configurada.');
  try { await ensureSchema(db); if (resource === 'public') return json(await readPublic(db)); const limited = await rateLimit(request, env, db, 'admin-read', 120, 600); if (limited) return limited; const actor = await authenticate(request, env, db); if (!actor) return fail(401, 'authentication_required', 'Se necesita un token de propietario o editor.'); if (resource === 'audit') { if (actor.role !== 'owner') return fail(403, 'permission_denied', 'El registro de auditoría es exclusivo del propietario.'); const rows = await db.prepare(`SELECT * FROM hub_audit ORDER BY created_at DESC LIMIT 300`).all(); return json({ ok: true, audit: rows.results || [] }); } return json(await adminSnapshot(db, actor)); } catch (error) { return fail(500, 'server_error', 'No se pudo leer la gestión de la clase.'); }
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!sameOrigin(request)) return fail(403, 'origin_rejected', 'La solicitud no proviene de este sitio.');
  let data; try { data = await payload(request); } catch (error) { return fail(error.message === 'payload_too_large' ? 413 : 400, error.message, 'La solicitud no es válida.'); }
  const action = cleanText(data.action, 60), db = dbFrom(env); if (!db) return fail(503, 'database_unavailable', 'La base compartida no está configurada.');
  try { await ensureSchema(db); const policy = action === 'invite.claim' ? ['invite-claim', 10, 3600] : action === 'push.subscribe' ? ['push-subscribe', 10, 3600] : action === 'group.join' || action === 'group.leave' ? ['group-membership', 80, 600] : ['admin-write', 120, 600]; const limited = await rateLimit(request, env, db, policy[0], policy[1], policy[2]); if (limited) return limited; if (action === 'group.join') return joinGroup(data, db); if (action === 'group.leave') return leaveGroup(data, db); if (action === 'invite.claim') return claimInvite(data, db); if (action === 'push.subscribe') return subscribePush(data, db); const actor = await authenticate(request, env, db); if (!actor) return fail(401, 'authentication_required', 'Se necesita un token de propietario o editor.'); return mutate(action, data, actor, env, db, waitUntil); } catch (error) { if (/UNIQUE/i.test(String(error))) return fail(409, 'conflict', 'El nombre o identificador ya está en uso.'); return fail(500, 'server_error', 'No se pudo completar la operación.'); }
}
