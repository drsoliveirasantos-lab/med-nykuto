const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const DEFAULT_CLASS_ID = 's4-e';
const SECOND_CLASS_ID = 's3-a';
const LEGACY_COHORT_KEY = 'semester-4-group-e';

const protectedHashes = {
  'data/med-courses-data.js': '96af099ed79fd09065d97f7c2c5d32c17a3005fb56dc3151ce6ff48dfbd6beab',
  'data/med-practice-bank-init.js': '0e64c0647aeabd477628f3ddbd234a90099477836e921c4b20ca5b9391175ba6',
  'data/med-practice-bank-loader.js': '9049a0b00e7b24bc944cf53b6441abf43da17ba76829d5a29a59638a0bbb4140',
  'data/practice-bank-fisiologia.js': '9c178a48be4f14a4fd1289948203d8b321260c2512642ce216d384ffee610606',
  'data/practice-bank-microbiologia.js': '25cf194a1e227401373314b3f012588fecc755b9e19ff68b5df162fbe812fca9',
  'data/practice-bank-genetica.js': 'e1ece4ceb39e59284f44dd6c04ba2e65230e42ca265bb5a54a6d612a56ffc82c',
  'data/practice-bank-bioquimica.js': '7d73bbf133a7650769007fa5931a9f9c1c68b0fb0af76c295567db33f79fe6d9',
  'data/practice-bank-inmunologia.js': 'a1aa6137631db266497cd9c0d4bcb3723b67c835e686f5a6cba3ad83faa61f0c'
};

const hubTenantTables = [
  'hub_subjects',
  'hub_tasks',
  'hub_notices',
  'hub_activities',
  'hub_groups',
  'hub_memberships',
  'hub_files',
  'hub_dates',
  'hub_invites',
  'hub_editors',
  'hub_editor_credentials',
  'hub_editor_sessions',
  'hub_audit',
  'hub_push_subscriptions',
  'hub_rate_limits'
];
const communityTenantTables = ['community_scores', 'community_rate_limits'];

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const normalizeSql = (sql) => sql.replace(/--[^\n]*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function preparedSql(source) {
  const statements = [];
  const pattern = /\.prepare\(\s*`([\s\S]*?)`\s*\)/g;
  let match;
  while ((match = pattern.exec(source))) statements.push(match[1]);
  return statements;
}

function referencedTables(sql, candidates) {
  const normalized = normalizeSql(sql);
  return candidates.filter((table) => new RegExp(`\\b${table}\\b`, 'i').test(normalized));
}

function isSchemaSql(sql) {
  return /^(?:create|alter|pragma|drop)\b/i.test(normalizeSql(sql));
}

function isDataSql(sql) {
  return /^(?:with\b[\s\S]*?\b(?:select|insert|update|delete)\b|select|insert|update|delete|replace)\b/i.test(normalizeSql(sql));
}

function insertColumns(sql, table) {
  const match = normalizeSql(sql).match(new RegExp(`(?:insert|replace)(?:\\s+or\\s+\\w+)?\\s+into\\s+${table}\\s*\\(([^)]*)\\)`, 'i'));
  return match ? match[1].split(',').map((column) => column.trim()) : [];
}

function validateTenantSql(file, statements, tables) {
  statements.forEach((sql, index) => {
    const referenced = referencedTables(sql, tables);
    if (!referenced.length || isSchemaSql(sql) || !isDataSql(sql)) return;
    const normalized = normalizeSql(sql);
    const classMentions = (normalized.match(/\bclass_id\b/g) || []).length;
    expect(
      classMentions >= referenced.length,
      `${file}: SQL #${index + 1} references ${referenced.join(', ')} without one class_id guard per tenant table: ${normalized.slice(0, 220)}`
    );
    referenced.forEach((table) => {
      if (!new RegExp(`(?:insert|replace)(?:\\s+or\\s+\\w+)?\\s+into\\s+${table}\\b`, 'i').test(normalized)) return;
      expect(
        insertColumns(sql, table).includes('class_id'),
        `${file}: INSERT/REPLACE into ${table} does not persist class_id.`
      );
    });
  });
}

function tableDefinition(source, table) {
  const match = source.match(new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${table}\\s*\\(([\\s\\S]*?)\\)\\s*\``, 'i'));
  return match ? normalizeSql(match[1]) : '';
}

function responseCode(body) {
  return body && typeof body === 'object' ? body.code : '';
}

function responseClassId(body) {
  if (!body || typeof body !== 'object') return '';
  return body.classId || body.class?.id || body.class?.slug || body.cohort || '';
}

function hashToken(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

class GuardedStatement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new GuardedStatement(this.database, this.sql, values);
  }

  async all() {
    this.database.inspect(this.sql, this.values, 'all');
    return { results: this.database.rows(this.sql, this.values) };
  }

  async first() {
    this.database.inspect(this.sql, this.values, 'first');
    return this.database.first(this.sql, this.values);
  }

  async run() {
    this.database.inspect(this.sql, this.values, 'run');
    return this.database.run(this.sql, this.values);
  }
}

class GuardedD1Mock {
  constructor() {
    this.calls = [];
    this.errors = new Set();
    this.tableColumns = new Map();
    this.classStatuses = new Map([
      [DEFAULT_CLASS_ID, 'active'],
      [SECOND_CLASS_ID, 'active']
    ]);
    this.editorTokenHash = hashToken('editor-s4-token');
  }

  prepare(sql) {
    return new GuardedStatement(this, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  inspect(sql, values, method) {
    const normalized = normalizeSql(sql);
    this.calls.push({ sql: normalized, values, method });
    const referenced = referencedTables(sql, [...hubTenantTables, ...communityTenantTables]);
    if (!referenced.length || isSchemaSql(sql) || !isDataSql(sql)) return;

    const classMentions = (normalized.match(/\bclass_id\b/g) || []).length;
    if (classMentions < referenced.length) {
      this.errors.add(`Runtime SQL references ${referenced.join(', ')} without complete class_id isolation: ${normalized.slice(0, 220)}`);
    }

    referenced.forEach((table) => {
      if (/^(?:insert|replace)\b/i.test(normalized) && new RegExp(`\\binto\\s+${table}\\b`, 'i').test(normalized) && !insertColumns(sql, table).includes('class_id')) {
        this.errors.add(`Runtime INSERT into ${table} omitted class_id.`);
      }
    });
  }

  classFrom(values) {
    return values.find((value) => value === DEFAULT_CLASS_ID || value === SECOND_CLASS_ID) || '';
  }

  classRow(id) {
    if (id !== DEFAULT_CLASS_ID && id !== SECOND_CLASS_ID) return null;
    return {
      id,
      slug: id,
      name: id === DEFAULT_CLASS_ID ? '4.º E' : '3.º A',
      semester: id === DEFAULT_CLASS_ID ? 4 : 3,
      group_code: id === DEFAULT_CLASS_ID ? 'E' : 'A',
      groupCode: id === DEFAULT_CLASS_ID ? 'E' : 'A',
      theme: 'med-nykuto',
      drive_url: '',
      driveUrl: '',
      status: this.classStatuses.get(id) || 'active'
    };
  }

  rows(sql, values) {
    const normalized = normalizeSql(sql);
    const pragma = normalized.match(/^pragma\s+table_info\(([^)]+)\)/i);
    if (pragma) {
      return [...(this.tableColumns.get(pragma[1]) || [])].map((name) => ({ name }));
    }
    if (/\bfrom\s+hub_classes\b/i.test(normalized)) {
      if (/\bwhere\b/i.test(normalized)) {
        const row = this.classRow(this.classFrom(values) || String(values[0] || ''));
        return row ? [row] : [];
      }
      return [this.classRow(DEFAULT_CLASS_ID), this.classRow(SECOND_CLASS_ID)];
    }
    if (/\bfrom\s+hub_subjects\b/i.test(normalized)) return [];
    return [];
  }

  first(sql, values) {
    const normalized = normalizeSql(sql);
    const pragma = normalized.match(/^pragma\s+table_info\(([^)]+)\)/i);
    if (pragma) {
      const columns = [...(this.tableColumns.get(pragma[1]) || [])];
      return columns.length ? { name: columns[0] } : null;
    }
    if (/\bfrom\s+hub_classes\b/i.test(normalized)) {
      const row = this.classRow(this.classFrom(values) || String(values[0] || ''));
      if (/\bstatus\s*=\s*'active'/i.test(normalized) && row?.status !== 'active') return null;
      return row;
    }
    if (/\bselect\s+count\s+from\s+hub_rate_limits\b/i.test(normalized)) return { count: 1 };
    if (/\bfrom\s+hub_editors\b/i.test(normalized)) {
      const hasToken = values.includes(this.editorTokenHash);
      const requestedClass = this.classFrom(values);
      if (!hasToken) return null;
      // A missing class predicate intentionally behaves like the vulnerable legacy
      // query and authenticates the S4 editor everywhere. The isolation test below
      // will consequently fail until the query binds the requested class.
      if (!/\bclass_id\b/i.test(normalized) || !requestedClass || requestedClass === DEFAULT_CLASS_ID) {
        return { id: 'editor-s4', name: 'Delegado 4.º E', status: 'active', class_id: DEFAULT_CLASS_ID };
      }
      return null;
    }
    if (/\bfrom\s+hub_activities\b/i.test(normalized)) {
      return { id: 'activity-test', capacity: 10, frozen: 0, closes_at: null };
    }
    if (/\b(?:count|max)\s*\(/i.test(normalized)) return { count: 0, member_count: 0 };
    if (/\bfrom\s+hub_groups\b/i.test(normalized)) return { id: 'group-test', name: 'Grupo 1', capacity: 10, frozen: 0 };
    if (/\bfrom\s+community_scores\b/i.test(normalized)) return { count: 0, points: 0, questions: 0, participants: 0, records: 0 };
    return null;
  }

  run(sql, values = []) {
    const normalized = normalizeSql(sql);
    const create = normalized.match(/^create\s+table\s+if\s+not\s+exists\s+([a-z0-9_]+)\s*\(/i);
    if (create && !this.tableColumns.has(create[1])) {
      const columns = new Set();
      if (/\bclass_id\b/i.test(normalized)) columns.add('class_id');
      this.tableColumns.set(create[1], columns);
    }
    const alter = normalized.match(/^alter\s+table\s+([a-z0-9_]+)\s+add\s+column\s+class_id\b/i);
    if (alter) {
      if (!this.tableColumns.has(alter[1])) this.tableColumns.set(alter[1], new Set());
      this.tableColumns.get(alter[1]).add('class_id');
    }
    if (/^insert\s+into\s+hub_classes\b/i.test(normalized)) {
      const id = String(values[0] || '');
      if (this.classStatuses.has(id)) this.classStatuses.set(id, values[7] === 'archived' ? 'archived' : 'active');
    }
    return { meta: { changes: 1 } };
  }
}

async function importSource(file) {
  let source = read(file);
  if (file === 'functions/api/class-hub.js') {
    const helperUrl = `data:text/javascript;base64,${Buffer.from(read('functions/_lib/management-credentials.js')).toString('base64')}`;
    source = source.replace('../_lib/management-credentials.js', helperUrl);
  }
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${Date.now()}-${Math.random()}`);
}

async function classHubGet(handler, db, query, token = '') {
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });
  const response = await handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt' } });
  return { response, body: await response.json() };
}

async function classHubPost(handler, db, query, body, token) {
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      origin: 'https://med.nykuto.com'
    },
    body: JSON.stringify(body)
  });
  const response = await handler({
    request,
    env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt' },
    waitUntil: (promise) => promise
  });
  return { response, body: await response.json() };
}

async function communityGet(handler, db, query) {
  const request = new Request(`https://med.nykuto.com/api/community${query}`);
  const response = await handler({ request, env: { MED_NYKUTO_DB: db } });
  return { response, body: await response.json() };
}

async function communityPost(handler, db, query, body) {
  const request = new Request(`https://med.nykuto.com/api/community${query}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://med.nykuto.com',
      'CF-Connecting-IP': '203.0.113.40'
    },
    body: JSON.stringify(body)
  });
  const response = await handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_RATE_SALT: 'test-salt' } });
  return { response, body: await response.json() };
}

async function validateRuntimeIsolation() {
  const db = new GuardedD1Mock();
  const classHub = await importSource('functions/api/class-hub.js');
  const community = await importSource('functions/api/community.js');

  const legacyPublic = await classHubGet(classHub.onRequestGet, db, '?resource=public');
  expect(legacyPublic.response.status === 200, `Class hub default 4.º E request failed (${legacyPublic.response.status}: ${JSON.stringify(legacyPublic.body)}).`);
  expect(responseClassId(legacyPublic.body) === DEFAULT_CLASS_ID, 'Class hub request without class must resolve to s4-e.');

  const s4Admin = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=admin', 'editor-s4-token');
  expect(s4Admin.response.status === 200, `The existing 4.º E editor lost access (${s4Admin.response.status}: ${JSON.stringify(s4Admin.body)}).`);

  const crossRead = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=admin', 'editor-s4-token');
  expect([401, 403].includes(crossRead.response.status), `A 4.º E editor can read another class (${crossRead.response.status}: ${JSON.stringify(crossRead.body)}).`);

  const beforeMismatchWrite = db.calls.length;
  const mismatchWrite = await classHubPost(classHub.onRequestPost, db, '?class=s3-a&classId=s4-e', {
    action: 'task.upsert',
    id: 'cross-class-probe',
    course: 'Fisiología',
    title: 'Cross-class probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect(
    mismatchWrite.response.status === 400 && responseCode(mismatchWrite.body) === 'class_mismatch',
    `Conflicting URL/body classes were not rejected (${mismatchWrite.response.status}: ${JSON.stringify(mismatchWrite.body)}).`
  );
  const mismatchWriteCalls = db.calls.slice(beforeMismatchWrite);
  expect(
    !mismatchWriteCalls.some((call) => /\b(?:insert|update)\s+(?:or\s+\w+\s+)?(?:into\s+)?hub_tasks\b/i.test(call.sql)),
    'The rejected URL/body class mismatch still wrote to hub_tasks.'
  );

  const beforeCrossWrite = db.calls.length;
  const crossWrite = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'task.upsert',
    classId: SECOND_CLASS_ID,
    id: 'cross-class-probe',
    course: 'Fisiología',
    title: 'Cross-class probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect([401, 403].includes(crossWrite.response.status), `A 4.º E editor can write to another class (${crossWrite.response.status}: ${JSON.stringify(crossWrite.body)}).`);
  const crossWriteCalls = db.calls.slice(beforeCrossWrite);
  expect(
    !crossWriteCalls.some((call) => /\b(?:insert|update)\s+(?:or\s+\w+\s+)?(?:into\s+)?hub_tasks\b/i.test(call.sql)),
    'The rejected cross-class editor request still wrote to hub_tasks.'
  );

  const s4Write = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert',
    id: 's4-compatibility-probe',
    course: 'Fisiología',
    title: 'S4 compatibility probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect(s4Write.response.status === 200, `The existing 4.º E editor cannot write its own class (${s4Write.response.status}: ${JSON.stringify(s4Write.body)}).`);

  const namespaceStart = db.calls.length;
  const sharedTaskS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert', id: 'shared-task', course: 'Fisiología', title: 'Shared task S4', status: 'draft'
  }, 'owner-token');
  const sharedTaskS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'task.upsert', id: 'shared-task', course: 'Fisiología', title: 'Shared task S3', status: 'draft'
  }, 'owner-token');
  const sharedActivityS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'activity.upsert', id: 'shared-activity', title: 'Shared activity S4', status: 'draft'
  }, 'owner-token');
  const sharedActivityS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'activity.upsert', id: 'shared-activity', title: 'Shared activity S3', status: 'draft'
  }, 'owner-token');
  const sharedGroupS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'group.upsert', id: 'shared-group', activityId: 'shared-activity', name: 'Grupo compartido S4'
  }, 'owner-token');
  const sharedGroupS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'group.upsert', id: 'shared-group', activityId: 'shared-activity', name: 'Grupo compartido S3'
  }, 'owner-token');

  [sharedTaskS4, sharedTaskS3, sharedActivityS4, sharedActivityS3, sharedGroupS4, sharedGroupS3].forEach(({ response, body }) => {
    expect(response.status === 200, `Namespaced owner mutation failed (${response.status}: ${JSON.stringify(body)}).`);
  });
  expect(sharedTaskS4.body.id === 'shared-task' && sharedTaskS3.body.id === 's3-a.shared-task', 'Identical task IDs are not namespaced per class while preserving the historic S4 ID.');
  expect(sharedActivityS4.body.id === 'shared-activity' && sharedActivityS3.body.id === 's3-a.shared-activity', 'Identical activity IDs are not namespaced per class while preserving the historic S4 ID.');
  expect(sharedGroupS4.body.id === 'shared-group' && sharedGroupS3.body.id === 's3-a.shared-group', 'Identical group IDs are not namespaced per class while preserving the historic S4 ID.');

  const namespaceCalls = db.calls.slice(namespaceStart);
  const insertBindings = (table) => namespaceCalls
    .filter((call) => new RegExp(`^insert\\s+into\\s+${table}\\b`, 'i').test(call.sql))
    .map((call) => ({ id: call.values[0], classId: call.values[1], referenceId: call.values[2] }));
  expect(
    insertBindings('hub_tasks').some(({ id, classId }) => id === 'shared-task' && classId === DEFAULT_CLASS_ID)
      && insertBindings('hub_tasks').some(({ id, classId }) => id === 's3-a.shared-task' && classId === SECOND_CLASS_ID),
    'Task INSERT bindings do not carry distinct class-scoped IDs.'
  );
  expect(
    insertBindings('hub_activities').some(({ id, classId }) => id === 'shared-activity' && classId === DEFAULT_CLASS_ID)
      && insertBindings('hub_activities').some(({ id, classId }) => id === 's3-a.shared-activity' && classId === SECOND_CLASS_ID),
    'Activity INSERT bindings do not carry distinct class-scoped IDs.'
  );
  expect(
    insertBindings('hub_groups').some(({ id, classId, referenceId }) => id === 'shared-group' && classId === DEFAULT_CLASS_ID && referenceId === 'shared-activity')
      && insertBindings('hub_groups').some(({ id, classId, referenceId }) => id === 's3-a.shared-group' && classId === SECOND_CLASS_ID && referenceId === 's3-a.shared-activity'),
    'Group INSERT bindings do not carry distinct class-scoped group/activity IDs.'
  );

  const archive = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: SECOND_CLASS_ID, slug: SECOND_CLASS_ID, name: '3.º A', semester: 3, group: 'A', status: 'archived'
  }, 'owner-token');
  expect(archive.response.status === 200 && archive.body.class?.status === 'archived', `An owner cannot archive a secondary class (${archive.response.status}: ${JSON.stringify(archive.body)}).`);
  const archivedPublic = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(archivedPublic.response.status === 404 && responseCode(archivedPublic.body) === 'class_not_found', 'An archived class remains accessible from its public route.');
  const classRegistry = await classHubGet(classHub.onRequestGet, db, '?resource=classes', 'owner-token');
  expect(classRegistry.response.status === 200 && classRegistry.body.classes?.some((entry) => entry.id === SECOND_CLASS_ID && entry.status === 'archived'), 'The owner registry hides an archived class, preventing reactivation.');
  const reactivate = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: SECOND_CLASS_ID, slug: SECOND_CLASS_ID, name: '3.º A', semester: 3, group: 'A', status: 'active'
  }, 'owner-token');
  expect(reactivate.response.status === 200 && reactivate.body.class?.status === 'active', `An archived class cannot be reactivated (${reactivate.response.status}: ${JSON.stringify(reactivate.body)}).`);
  const reactivatedPublic = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(reactivatedPublic.response.status === 200, `A reactivated class is still unavailable (${reactivatedPublic.response.status}: ${JSON.stringify(reactivatedPublic.body)}).`);
  const defaultArchive = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: DEFAULT_CLASS_ID, slug: DEFAULT_CLASS_ID, name: '4.º E', semester: 4, group: 'E', status: 'archived'
  }, 'owner-token');
  expect(defaultArchive.response.status === 400 && responseCode(defaultArchive.body) === 'invalid_class', 'The compatibility class s4-e can be archived.');
  const defaultAfterArchiveAttempt = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public');
  expect(defaultAfterArchiveAttempt.response.status === 200, 'A rejected archive attempt still disabled the compatibility class s4-e.');

  const missingClass = await classHubGet(classHub.onRequestGet, db, '?class=does-not-exist&resource=public');
  expect(missingClass.response.status === 404 && responseCode(missingClass.body) === 'class_not_found', 'Unknown class slug must return class_not_found instead of falling back or leaking data.');

  const legacyCommunity = await communityGet(community.onRequest, db, '');
  expect(legacyCommunity.response.status === 200, `Community default request failed (${legacyCommunity.response.status}: ${JSON.stringify(legacyCommunity.body)}).`);
  expect(responseClassId(legacyCommunity.body) === DEFAULT_CLASS_ID, 'Community request without class must resolve to s4-e.');

  const beforeS3Ranking = db.calls.length;
  const s3Community = await communityGet(community.onRequest, db, '?class=s3-a');
  expect(s3Community.response.status === 200, `Community cannot resolve a second active class (${s3Community.response.status}: ${JSON.stringify(s3Community.body)}).`);
  const s3RankingCalls = db.calls.slice(beforeS3Ranking).filter((call) => /\bcommunity_scores\b/i.test(call.sql));
  expect(s3RankingCalls.length > 0, 'Second-class community request did not query the ranking bank.');
  s3RankingCalls.forEach((call) => {
    expect(/\bclass_id\b/i.test(call.sql), `Community S3 query omitted class_id: ${call.sql.slice(0, 220)}`);
    expect(call.values.includes(SECOND_CLASS_ID), `Community S3 query did not bind s3-a: ${call.sql.slice(0, 220)}`);
  });

  const rateLimitStart = db.calls.length;
  const score = {
    playerId: '123e4567-e89b-42d3-a456-426614174000',
    nickname: 'Testeur',
    courseId: 'fisiologia',
    moduleId: 'module-1',
    correct: 8,
    total: 10
  };
  const s4Score = await communityPost(community.onRequest, db, '?class=s4-e', score);
  const s3Score = await communityPost(community.onRequest, db, '?class=s3-a', score);
  expect(s4Score.response.status === 200 && s3Score.response.status === 200, `Community score submission failed while checking rate isolation (${s4Score.response.status}/${s3Score.response.status}).`);
  const rateLimitWrites = db.calls.slice(rateLimitStart).filter((call) => /^insert\s+into\s+community_rate_limits\b/i.test(call.sql));
  const s4RateWrite = rateLimitWrites.find((call) => call.values[1] === DEFAULT_CLASS_ID);
  const s3RateWrite = rateLimitWrites.find((call) => call.values[1] === SECOND_CLASS_ID);
  expect(Boolean(s4RateWrite && s3RateWrite), 'Community writes do not persist separate rate-limit rows for both classes.');
  expect(Boolean(s4RateWrite && s3RateWrite && s4RateWrite.values[0] !== s3RateWrite.values[0]), 'Community rate-limit keys collide across classes for the same client address.');
  const rateLimitReads = db.calls.slice(rateLimitStart).filter((call) => /^select\s+count\s+from\s+community_rate_limits\b/i.test(call.sql));
  expect(Boolean(s4RateWrite && rateLimitReads.some((call) => call.values[0] === DEFAULT_CLASS_ID && call.values[1] === s4RateWrite.values[0])), 'Community rate-limit read does not use the s4-e class/key pair.');
  expect(Boolean(s3RateWrite && rateLimitReads.some((call) => call.values[0] === SECOND_CLASS_ID && call.values[1] === s3RateWrite.values[0])), 'Community rate-limit read does not use the s3-a class/key pair.');

  const missingCommunity = await communityGet(community.onRequest, db, '?class=does-not-exist');
  expect(missingCommunity.response.status === 404 && responseCode(missingCommunity.body) === 'class_not_found', 'Unknown community class slug must return class_not_found.');

  [...hubTenantTables, ...communityTenantTables].forEach((table) => {
    expect(db.tableColumns.get(table)?.has('class_id'), `${table} does not contain class_id after the legacy-schema migration path.`);
  });
  db.errors.forEach((error) => failures.push(error));
}

async function validateMulticlassShell() {
  const requiredFiles = [
    'turma-shell/index.html',
    'turma-v471.css',
    'turma-v471.js',
    'turma-manifest-boot-v471.js',
    'gestion-shell/index.html',
    'gestion-v440.css',
    'gestion-v440.js',
    'functions/_lib/management-credentials.js',
    'offline.html',
    'functions/api/class-manifest.js'
  ];
  requiredFiles.forEach((file) => expect(fs.existsSync(path.join(root, file)), `Multiclass shell file is missing: ${file}.`));
  if (requiredFiles.some((file) => !fs.existsSync(path.join(root, file)))) return;

  const turmaHtml = read('turma-shell/index.html');
  const turmaRuntime = read('turma-v471.js');
  const managementHtml = read('gestion-shell/index.html');
  const managementRuntime = read('gestion-v440.js');
  const credentialHelper = read('functions/_lib/management-credentials.js');
  const legacyClassRuntime = read('class-hub-runtime-v440.js');
  const redirects = read('_redirects');
  const headers = read('_headers');
  const worker = read('service-worker.js');

  expect((turmaHtml.match(/data-nav-view=/g) || []).length === 5, 'The generic class hub must expose exactly five mobile navigation tabs.');
  expect((turmaHtml.match(/data-view="/g) || []).length === 5, 'The generic class hub must expose exactly five class views.');
  expect(turmaHtml.includes('name="robots" content="noindex,nofollow"'), 'The generic class hub is missing its noindex directive.');
  expect(turmaHtml.indexOf('turma-manifest-boot-v471.js') < turmaHtml.indexOf('turma-v471.js'), 'The class manifest is not selected before the main class runtime.');
  expect(turmaRuntime.includes("API+'&resource=public'") && turmaRuntime.includes("'/gestion/'+encodeURIComponent(slug)"), 'The generic hub is not querying or linking the selected class explicitly.');
  expect(!/state\.(?:members|memberships)|data\.(?:members|memberships)/.test(turmaRuntime), 'The generic student hub still consumes nominative group records.');
  expect(turmaRuntime.includes("action:'group.join'") && turmaRuntime.includes("action:'group.leave'") && turmaRuntime.includes('memberCount'), 'Students cannot join and leave generic class groups using anonymous occupancy data.');

  expect(managementHtml.includes('src="/gestion-v440.js?v=472"') && managementHtml.includes('href="/gestion-v440.css?v=472"'), 'The nested management route does not use absolute v472 assets.');
  expect(managementHtml.includes('id="credentialForm"') && managementHtml.includes('name="action" value="auth.login"') && managementHtml.includes('autocomplete="username"') && managementHtml.includes('autocomplete="current-password"'), 'The v472 delegate email/password login form is incomplete.');
  expect(managementHtml.includes('id="passwordChangeForm"') && managementHtml.includes('name="action" value="auth.password.change"') && (managementHtml.match(/autocomplete="new-password"/g) || []).length >= 2, 'The mandatory temporary-password change form is incomplete.');
  expect(managementHtml.includes('id="delegateAccountForm"') && managementHtml.includes('name="action" value="editor.account.create"') && managementHtml.includes('name="temporaryPassword"'), 'The owner cannot create a tenant-scoped delegate credential from the v472 panel.');
  ['loginEmail', 'loginPassword', 'newPassword', 'confirmPassword'].forEach((id) => {
    const input = managementHtml.match(new RegExp(`<input[^>]+id=["']${id}["'][^>]*>`, 'i'))?.[0] || '';
    expect(Boolean(input) && !/\svalue\s*=/i.test(input), `Credential input ${id} is missing or contains a hard-coded value.`);
  });
  expect(!/[a-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo)\.[a-z]{2,}/i.test(`${managementHtml}\n${managementRuntime}\n${credentialHelper}`), 'A real-looking personal email address was committed in the management credential sources.');
  expect(credentialHelper.includes('PBKDF2') && credentialHelper.includes("hash: 'SHA-256'") && credentialHelper.includes('PASSWORD_ITERATIONS = 600000') && credentialHelper.includes('crypto.subtle.deriveBits'), 'The credential helper is missing the expected salted PBKDF2-SHA-256 verifier.');
  expect(credentialHelper.includes('crypto.getRandomValues') && credentialHelper.includes('randomToken(16)') && credentialHelper.includes('Secure; HttpOnly; SameSite=Strict'), 'The credential helper is missing random salts/tokens or hardened session-cookie attributes.');
  expect(credentialHelper.includes("SESSION_TTL_SECONDS = 8 * 60 * 60") && credentialHelper.includes("__Host-med-nykuto-management-csrf"), 'The credential helper is missing the bounded session or CSRF cookie contract.');
  expect(/credentials\s*[:=]\s*["']same-origin["']/.test(managementRuntime) && /\[["']x-csrf-token["']\]\s*=/.test(managementRuntime) && /csrfCookieName\s*=\s*["']__Host-med-nykuto-management-csrf["']/.test(managementRuntime), 'Management requests do not use same-origin cookies and the CSRF header contract.');
  expect(managementRuntime.includes("'session'") && managementRuntime.includes("action:'auth.logout'") && managementRuntime.includes("action:'auth.password.change'"), 'The management runtime is missing session restore, logout or password-change actions.');
  expect(managementRuntime.includes("'delegateAccountForm'") && /editor\.password\.reset/.test(managementRuntime), 'The management runtime is missing delegate credential creation/reset actions.');
  expect(!/(?:loginPassword|temporaryPassword|newPassword)\s*[:=]\s*["'][^"']+["']/i.test(managementRuntime), 'The management runtime contains a hard-coded credential value.');
  expect(managementHtml.includes('list="subjectOptions"') && managementHtml.includes('id="groupActivitySelect"'), 'The management panel still relies on free-text subject/activity references.');
  expect(managementHtml.includes('Opciones avanzadas') && managementRuntime.includes("'Modificar'") && managementRuntime.includes("'Archivar'"), 'The delegate panel is missing edit/archive controls or advanced identifiers.');
  expect(managementRuntime.includes("function classMutation") && managementRuntime.includes("'Reactivar'") && managementRuntime.includes("info.slug!=='s4-e'"), 'The owner panel is missing safe class edit/archive/reactivation controls.');
  expect(managementRuntime.includes('if(result&&reset){form.reset();clearEditMode(form);}') && managementRuntime.includes('return null;'), 'A failed management mutation can still clear the editor form.');
  expect(managementRuntime.includes("popup.opener=null") && !managementRuntime.includes("'noopener,noreferrer'"), 'The printable group export still uses the broken noopener window-open path.');
  expect(managementRuntime.includes('Copiar invitación') && managementRuntime.includes('copyText(result.inviteToken)'), 'The one-time editor invitation cannot be copied explicitly.');

  expect(!legacyClassRuntime.includes('activityMembers') && legacyClassRuntime.includes("filled?'Ocupado':'Libre'"), 'The legacy 4.º E student roster is not anonymized.');
  expect(['/turma/:slug', '/turma/:slug/', '/gestion/:slug', '/gestion/:slug/'].every((route) => redirects.includes(`${route} /${route.startsWith('/turma') ? 'turma' : 'gestion'}-shell/?class=:slug 200`)), 'Cloudflare rewrites for class and management slugs, with and without trailing slash, are missing.');
  expect(!/\/(?:turma|gestion)\/:slug\s+\/(?:turma|gestion)\.html\b/.test(redirects), 'A class route still proxies to a canonical .html URL and can loop on Cloudflare Pages.');
  ['/turma/*', '/turma-shell/*', '/clase.html', '/gestion/*', '/gestion-shell/*', '/api/*'].forEach((route) => expect(headers.includes(route), `Security/cache headers are missing for ${route}.`));

  const shellMatch = worker.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\];/);
  expect(Boolean(shellMatch), 'The service-worker shell list is missing.');
  if (shellMatch) {
    const shellEntries = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);
    expect(shellEntries.includes('/offline.html') && shellEntries.includes('/turma-shell/'), 'The neutral offline and generic class shells are not precached.');
    expect(!shellEntries.some((entry) => /\/api\/|\/gestion|\/turma\/s\d|clase\.html|practice-bank|med-courses-data|grupo-3/i.test(entry)), 'The service worker precaches tenant, management, API or protected course content.');
  }
  expect(worker.includes("url.pathname.startsWith('/api/')") && worker.includes("url.pathname.startsWith('/gestion')"), 'The service worker does not bypass API and management requests.');

  const listeners = {};
  const workerContext = vm.createContext({
    URL,
    self: {
      location: { origin: 'https://med.nykuto.com' },
      addEventListener(type, handler) { listeners[type] = handler; }
    }
  });
  vm.runInContext(worker, workerContext, { filename: 'service-worker.js' });
  const notificationTarget = (value) => vm.runInContext(`safeNotificationTarget(${JSON.stringify(value)})`, workerContext);
  expect(notificationTarget('https://evil.example/turma/s5-a') === '/turma/s4-e#inicio', 'An external notification target is accepted.');
  expect(notificationTarget('/gestion/s5-a') === '/turma/s4-e#inicio', 'A notification can escape into management.');
  expect(notificationTarget('/turma/s5-a#tareas') === '/turma/s5-a#tareas', 'A valid same-origin class notification target is rejected.');

  const manifestModule = await importSource('functions/api/class-manifest.js');
  const manifestResponse = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=s3-a'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  const manifest = await manifestResponse.json();
  expect(manifestResponse.status === 200 && manifest.id === '/turma/s3-a/' && manifest.start_url === '/turma/s3-a#inicio' && manifest.scope === '/turma/', 'The generated manifest is not isolated to the selected active class shell.');
  const unknownManifest = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=does-not-exist'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  expect(unknownManifest.status === 404, 'An unknown or archived class can still expose an installable manifest.');
  const invalidManifest = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=bad_slug'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  expect(invalidManifest.status === 400, 'An invalid class slug can still expose an installable manifest.');
}

async function validateCredentialHelper() {
  const helper = await importSource('functions/_lib/management-credentials.js');
  const password = 'Fixture-Study-2026!';
  const verifier = await helper.createPasswordVerifier(password);
  const credential = {
    password_algorithm: 'pbkdf2-sha256',
    password_iterations: verifier.iterations,
    password_version: 1,
    password_salt: verifier.salt,
    password_hash: verifier.hash
  };

  expect(helper.normalizeEmail(' Delegate.Fixture@EXAMPLE.test ') === 'delegate.fixture@example.test', 'Delegate emails are not normalized consistently.');
  expect(Boolean(helper.temporaryPasswordProblem('12345')), 'A temporary password shorter than six characters was accepted.');
  expect(Boolean(helper.strongPasswordProblem('123456789012')), 'A numeric-only permanent password was accepted.');
  expect(verifier.iterations === 600000 && /^[a-f0-9]{32}$/.test(verifier.salt) && /^[a-f0-9]{64}$/.test(verifier.hash), 'The generated PBKDF2 verifier has invalid metadata or dimensions.');
  expect(await helper.verifyPassword(password, credential), 'The generated PBKDF2 verifier does not accept its source password.');
  expect(!await helper.verifyPassword('Wrong-Fixture-2026!', credential), 'The PBKDF2 verifier accepted an incorrect password.');
  expect(helper.isRandomToken(helper.randomToken(32)), 'Management session tokens are not exact 256-bit random hex values.');
  const cookies = helper.sessionCookies('a'.repeat(64), 'b'.repeat(64), new Date(Date.now() + 60000).toISOString());
  expect(cookies.length === 2 && cookies[0].includes('Secure; HttpOnly; SameSite=Strict') && cookies[1].includes('Secure; SameSite=Strict') && !cookies[1].includes('HttpOnly'), 'Session and CSRF cookie attributes do not match the hardened contract.');
}

async function main() {
  Object.entries(protectedHashes).forEach(([file, expectedHash]) => {
    expect(fs.existsSync(path.join(root, file)), `Protected bank file is missing: ${file}.`);
    if (fs.existsSync(path.join(root, file))) {
      expect(sha256(file) === expectedHash, `Protected bank changed during multiclass work: ${file}.`);
    }
  });

  const hubSource = read('functions/api/class-hub.js');
  const communitySource = read('functions/api/community.js');
  const hubSql = preparedSql(hubSource);
  const communitySql = preparedSql(communitySource);

  const classesDefinition = tableDefinition(hubSource, 'hub_classes');
  expect(Boolean(classesDefinition), 'hub_classes schema is missing.');
  expect(/\bid\s+text\s+primary\s+key\b/i.test(classesDefinition), 'hub_classes.id must be the stable primary key.');
  expect(/\bslug\s+text\s+not\s+null\s+unique\b|\bunique\s*\(\s*slug\s*\)/i.test(classesDefinition), 'hub_classes.slug must be unique.');

  hubTenantTables.forEach((table) => {
    const definition = tableDefinition(hubSource, table);
    const hasInlineClass = /\bclass_id\s+text\s+not\s+null\b/i.test(definition);
    const hasSafeMigration = hubSource.includes(`ensureClassColumn(db, '${table}')`)
      || hubSource.includes(`'${table}'`) && /ensureClassColumn/.test(hubSource);
    expect(Boolean(definition), `${table} schema is missing.`);
    expect(hasInlineClass || hasSafeMigration, `${table} has neither an inline class_id nor the safe legacy migration.`);
  });

  const communityDefinition = tableDefinition(communitySource, 'community_scores');
  expect(Boolean(communityDefinition), 'community_scores schema is missing.');
  expect(/\bclass_id\s+text\s+not\s+null\b/i.test(communityDefinition), 'community_scores must declare class_id TEXT NOT NULL.');
  const communityRateDefinition = tableDefinition(communitySource, 'community_rate_limits');
  expect(Boolean(communityRateDefinition), 'community_rate_limits schema is missing.');
  expect(/\bclass_id\s+text\s+not\s+null\b/i.test(communityRateDefinition), 'community_rate_limits must declare class_id TEXT NOT NULL.');

  validateTenantSql('functions/api/class-hub.js', hubSql, hubTenantTables);
  validateTenantSql('functions/api/community.js', communitySql, communityTenantTables);

  expect(hubSource.includes(`'${DEFAULT_CLASS_ID}'`) || hubSource.includes(`\"${DEFAULT_CLASS_ID}\"`), 'The 4.º E s4-e compatibility identifier is missing from class-hub.js.');
  expect(communitySource.includes(`'${DEFAULT_CLASS_ID}'`) || communitySource.includes(`\"${DEFAULT_CLASS_ID}\"`), 'The 4.º E s4-e compatibility identifier is missing from community.js.');
  expect(communitySource.includes(LEGACY_COHORT_KEY), 'The legacy 4.º E ranking key is not accounted for during migration.');
  expect(!/const\s+COHORT_KEY\s*=/.test(communitySource), 'Community still relies on one hard-coded COHORT_KEY.');
  expect(/class_not_found/.test(hubSource), 'Class hub does not explicitly reject unknown class slugs.');
  expect(/class_not_found/.test(communitySource), 'Community does not explicitly reject unknown class slugs.');
  expect(/subjects/.test(hubSource) && /hub_subjects/.test(hubSource), 'Public class response does not expose the class subjects.');
  expect(/searchParams\.get\(['\"]class['\"]\)/.test(hubSource), 'Class hub does not resolve the class from the URL query.');
  expect(/searchParams\.get\(['\"]class['\"]\)/.test(communitySource), 'Community does not resolve the class from the URL query.');
  expect(/classSlug|classId/.test(hubSource), 'Class hub POST payload does not support classSlug/classId compatibility fields.');
  expect(hubSource.includes("from '../_lib/management-credentials.js'") && /auth\.login/.test(hubSource) && /auth\.password\.change/.test(hubSource), 'Class hub does not use the shared credential helper for delegate login/password change.');
  expect(/password_change_required/.test(hubSource) && /editor\.account\.create/.test(hubSource) && /editor\.password\.reset/.test(hubSource), 'Class hub is missing mandatory password change or owner credential lifecycle actions.');

  await validateCredentialHelper();
  await validateRuntimeIsolation();
  await validateMulticlassShell();

  if (failures.length) {
    console.error('Multiclass foundation validation failed:');
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }

  console.log('Multiclass foundation validation OK: tenant-scoped D1 schema/queries and credential sessions, v472 delegate login contract, cross-class editor refusal, protected banks unchanged and 4.º E compatibility preserved.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
