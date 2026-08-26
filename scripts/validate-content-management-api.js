#!/usr/bin/env node
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');

async function importClassHub() {
  let source = fs.readFileSync(path.join(root, 'functions/api/class-hub.js'), 'utf8');
  const helper = fs.readFileSync(path.join(root, 'functions/_lib/management-credentials.js'), 'utf8');
  const helperUrl = `data:text/javascript;base64,${Buffer.from(helper).toString('base64')}`;
  source = source.replace('../_lib/management-credentials.js', helperUrl);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#content-api-${Date.now()}`);
}

class D1StatementMock {
  constructor(owner, sql, values = []) {
    this.owner = owner;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) { return new D1StatementMock(this.owner, this.sql, values); }
  async all() { return { results: this.owner.database.prepare(this.sql).all(...this.values) }; }
  async first() { return this.owner.database.prepare(this.sql).get(...this.values) || null; }
  async run() {
    const result = this.owner.database.prepare(this.sql).run(...this.values);
    return {
      ...result,
      meta: { changes: Number(result.changes) || 0, last_row_id: Number(result.lastInsertRowid) || 0 }
    };
  }
}

class D1DatabaseMock {
  constructor() {
    this.database = new DatabaseSync(':memory:');
    this.database.exec('PRAGMA foreign_keys=ON');
  }

  prepare(sql) { return new D1StatementMock(this, sql); }
  async batch(statements) {
    const results = [];
    this.database.exec('BEGIN');
    try {
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
  close() { this.database.close(); }
}

function practiceQuestion(kind, index) {
  const number = index + 1;
  const question = {
    question: `${kind} pregunta clínica ${number}`,
    answerIndex: index % (kind === 'trueFalse' ? 2 : 4),
    explanation: `Explicación clínica suficientemente clara para la pregunta ${number}.`
  };
  if (kind !== 'trueFalse') question.options = [`Opción ${number} A`, `Opción ${number} B`, `Opción ${number} C`, `Opción ${number} D`];
  if (kind === 'clinicalCases') question.stem = `Paciente del caso clínico ${number} con signos descritos de forma suficiente.`;
  return question;
}

function completePractice() {
  return {
    qcm: Array.from({ length: 20 }, (_, index) => practiceQuestion('qcm', index)),
    trueFalse: Array.from({ length: 10 }, (_, index) => practiceQuestion('trueFalse', index)),
    clinicalCases: Array.from({ length: 10 }, (_, index) => practiceQuestion('clinicalCases', index))
  };
}

function fixtureLesson(id, overrides = {}) {
  return {
    action: 'lesson.upsert',
    classId: 's4-e',
    id,
    expectedRevision: 0,
    subjectId: 'fisiologia-ii',
    lessonDate: '',
    title: `Lección ${id}`,
    description: 'Fixture API sans donnée personnelle.',
    status: 'draft',
    full: '',
    quick: '',
    ultra: '',
    practice: { qcm: [], trueFalse: [], clinicalCases: [] },
    ...overrides
  };
}

async function post(api, env, data, auth = {}) {
  const queryAction = data.action === 'lesson.upsert' ? '&action=lesson.upsert' : '';
  const headers = new Headers({ 'content-type': 'application/json', origin: 'https://med.nykuto.com' });
  if (auth.bearer) headers.set('authorization', `Bearer ${auth.bearer}`);
  if (auth.sessionToken) {
    const cookies = [`__Host-med-nykuto-management=${auth.sessionToken}`];
    if (auth.csrfToken) {
      cookies.push(`__Host-med-nykuto-management-csrf=${auth.csrfToken}`);
      headers.set('x-csrf-token', auth.csrfToken);
    }
    headers.set('cookie', cookies.join('; '));
  }
  const response = await api.onRequestPost({
    request: new Request(`https://med.nykuto.com/api/class-hub?class=s4-e${queryAction}`, { method: 'POST', headers, body: JSON.stringify(data) }),
    env,
    waitUntil() {}
  });
  return { status: response.status, body: await response.json() };
}

async function get(api, env, resource = 'public', auth = {}) {
  const headers = new Headers();
  if (auth.bearer) headers.set('authorization', `Bearer ${auth.bearer}`);
  if (auth.sessionToken && auth.csrfToken) headers.set('cookie', `__Host-med-nykuto-management=${auth.sessionToken}; __Host-med-nykuto-management-csrf=${auth.csrfToken}`);
  const response = await api.onRequestGet({
    request: new Request(`https://med.nykuto.com/api/class-hub?class=s4-e&resource=${resource}`, { headers }),
    env,
    waitUntil() {}
  });
  return { status: response.status, body: await response.json() };
}

async function main() {
  const api = await importClassHub();
  const db = new D1DatabaseMock();
  const ownerToken = 'c'.repeat(64), legacyToken = 'legacy-content-token';
  const sessionToken = 'a'.repeat(64), csrfToken = 'b'.repeat(64);
  const sessionAuth = { sessionToken, csrfToken }, ownerAuth = { bearer: ownerToken };
  const env = { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: ownerToken, MED_NYKUTO_RATE_SALT: 'content-api-rate-fixture' };
  const digest = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
  const created = '2026-08-26T12:00:00.000Z';

  try {
    const initialized = await get(api, env);
    assert.equal(initialized.status, 200, 'D1 schema initialization failed');

    db.database.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,?,?)`).run('legacy-editor', 's4-e', 'Legacy fixture', digest(legacyToken), 'active', created);
    db.database.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,?,?)`).run('session-editor', 's4-e', 'Session fixture', digest('unused-session-token'), 'active', created);
    db.database.prepare(`INSERT INTO hub_editor_credentials (editor_id,class_id,email_normalized,password_hash,password_salt,password_algorithm,password_iterations,password_version,must_change_password,temporary_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'pbkdf2-sha256',100000,1,0,NULL,?,?)`).run('session-editor', 's4-e', 'session.fixture@example.test', '0'.repeat(64), '1'.repeat(32), created, created);
    db.database.prepare(`INSERT INTO hub_editor_sessions (token_hash,class_id,editor_id,csrf_hash,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?,?)`).run(digest(sessionToken), 's4-e', 'session-editor', digest(csrfToken), created, '2099-01-01T00:00:00.000Z', created);

    const legacyDenied = await post(api, env, fixtureLesson('legacy-denied'), { bearer: legacyToken });
    assert.deepEqual([legacyDenied.status, legacyDenied.body.code], [403, 'permission_denied']);
    const sessionDenied = await post(api, env, fixtureLesson('ordinary-session-denied'), sessionAuth);
    assert.deepEqual([sessionDenied.status, sessionDenied.body.code], [403, 'permission_denied']);
    const deniedWrites = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_content_lessons WHERE class_id='s4-e' AND id IN ('legacy-denied','ordinary-session-denied')`).get();
    assert.equal(Number(deniedWrites.count), 0, 'denied content writes persisted rows');

    const nonOwnerGrant = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'session-editor', enabled: true }, { bearer: legacyToken });
    assert.deepEqual([nonOwnerGrant.status, nonOwnerGrant.body.code], [403, 'permission_denied']);
    const legacyGrant = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'legacy-editor', enabled: true }, ownerAuth);
    assert.deepEqual([legacyGrant.status, legacyGrant.body.code], [409, 'credential_required']);

    const sessionGrant = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'session-editor', enabled: true }, ownerAuth);
    assert.equal(sessionGrant.status, 200);
    const sessionView = await get(api, env, 'session', sessionAuth);
    assert.equal(sessionView.body.actor?.capabilities?.manageContent, true);
    const csrfDenied = await post(api, env, fixtureLesson('csrf-denied'), { sessionToken });
    assert.deepEqual([csrfDenied.status, csrfDenied.body.code], [403, 'csrf_rejected']);
    const csrfDeniedRows = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_content_lessons WHERE class_id='s4-e' AND id='csrf-denied'`).get();
    assert.equal(Number(csrfDeniedRows.count), 0, 'CSRF-rejected content write persisted a row');
    const capableDraft = await post(api, env, fixtureLesson('capable-session-draft'), sessionAuth);
    assert.deepEqual([capableDraft.status, capableDraft.body.lesson?.revision], [201, 1]);

    const published = fixtureLesson('published-api-fixture', {
      lessonDate: '2026-08-26',
      status: 'published',
      full: '# Curso completo\nContenido clínico revisado.',
      quick: '## Ficha rápida\nPuntos clave.',
      ultra: '## Ficha ultra\nRecordatorio.',
      practice: completePractice()
    });
    const publishedCreate = await post(api, env, published, ownerAuth);
    assert.deepEqual([publishedCreate.status, publishedCreate.body.lesson?.revision], [201, 1]);

    const publicView = await get(api, env);
    const publicIds = (publicView.body.lessons || []).map((lesson) => lesson.id);
    assert.equal(publicIds.includes('published-api-fixture'), true);
    assert.equal(publicIds.includes('capable-session-draft'), false, 'draft leaked into public snapshot');

    const stale = await post(api, env, { ...published, expectedRevision: 0, title: 'Actualización obsoleta' }, ownerAuth);
    assert.deepEqual([stale.status, stale.body.code, stale.body.currentRevision], [409, 'revision_conflict', 1]);
    const revisions = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_content_revisions WHERE class_id='s4-e' AND lesson_id='published-api-fixture'`).get();
    assert.equal(Number(revisions.count), 1, 'stale update created a phantom revision');

    const duplicateDate = await post(api, env, fixtureLesson('duplicate-date-fixture', { lessonDate: '2026-08-26' }), ownerAuth);
    assert.deepEqual([duplicateDate.status, duplicateDate.body.code], [409, 'lesson_date_conflict']);
    const duplicateRows = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_content_lessons WHERE class_id='s4-e' AND id='duplicate-date-fixture'`).get();
    assert.equal(Number(duplicateRows.count), 0, 'date-conflicting lesson persisted');

    console.log('Managed content API validation OK: session-only capability, owner-only grants, published visibility and optimistic/date conflicts are enforced.');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
