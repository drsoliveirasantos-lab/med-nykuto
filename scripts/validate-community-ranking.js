#!/usr/bin/env node
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'functions/api/community.js');
const ORIGIN = 'https://med.nykuto.com';
const PEPPER = 'community-ranking-catraca-pepper-fixture';
const OLD_PEPPER = 'community-ranking-previous-pepper-fixture';
const OLD_PARTICIPANT_TOKEN = 'a'.repeat(64);

const IDS = {
  main: '11111111-1111-4111-8111-111111111111',
  attacker: '22222222-2222-4222-8222-222222222222',
  other: '33333333-3333-4333-8333-333333333333',
  points: '44444444-4444-4444-8444-444444444444',
  pepper: '55555555-5555-4555-8555-555555555555',
  tieEarly: '66666666-6666-4666-8666-666666666666',
  tieLate: '77777777-7777-4777-8777-777777777777',
  oldParticipant: '88888888-8888-4888-8888-888888888888',
  legacyOne: '99999999-9999-4999-8999-999999999999',
  legacyTwo: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  race: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  cutoff: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
};

class D1StatementMock {
  constructor(owner, sql, values = []) {
    this.owner = owner;
    this.database = owner.database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) { return new D1StatementMock(this.owner, this.sql, values); }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
  async first() { return this.database.prepare(this.sql).get(...this.values) || null; }
  async run() {
    if (this.owner.beforeRun?.({ sql: this.sql, values: this.values, database: this.database })) this.owner.beforeRun = null;
    const result = this.database.prepare(this.sql).run(...this.values);
    return {
      ...result,
      meta: { changes: Number(result.changes) || 0, last_row_id: Number(result.lastInsertRowid) || 0 }
    };
  }
}

class D1DatabaseMock {
  constructor(filename) {
    this.database = new DatabaseSync(filename);
    this.beforeRun = null;
  }
  prepare(sql) { return new D1StatementMock(this, sql); }
  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }
  close() { this.database.close(); }
}

function sha256(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function clientToken(playerId) { return sha256(`client-enrollment-token:${playerId}`); }
function studentHash(studentId, pepper = PEPPER, classId = 's4-e') {
  return crypto.createHmac('sha256', pepper).update(`${classId}:${studentId}`).digest('hex');
}

function currentWeekKey(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Asuncion', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const localDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  localDate.setUTCDate(localDate.getUTCDate() - ((localDate.getUTCDay() + 6) % 7));
  return localDate.toISOString().slice(0, 10);
}

function seedPreMulticlassDatabase(sqlite) {
  const timestamp = '2026-08-01T12:00:00.000Z';
  const week = currentWeekKey();
  sqlite.exec(`
    CREATE TABLE hub_classes (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, semester INTEGER NOT NULL,
      group_code TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'midnight-gold', drive_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE community_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT, cohort_key TEXT NOT NULL, week_key TEXT NOT NULL,
      player_id TEXT NOT NULL, nickname TEXT NOT NULL, course_id TEXT NOT NULL DEFAULT '', module_id TEXT NOT NULL DEFAULT '',
      scope_id TEXT NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, percentage REAL NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE (cohort_key,week_key,player_id,scope_id)
    );
    CREATE TABLE community_participants (
      class_id TEXT NOT NULL, player_id TEXT NOT NULL, display_name TEXT NOT NULL, student_id_hash TEXT NOT NULL,
      student_id_last4 TEXT NOT NULL, access_token_hash TEXT NOT NULL, verification_status TEXT NOT NULL DEFAULT 'pending',
      consented_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY (class_id,player_id), UNIQUE (class_id,student_id_hash), UNIQUE (class_id,access_token_hash)
    );
  `);
  const insertClass = sqlite.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`);
  insertClass.run('s4-e', 's4-e', 'Medicina · 4.º E', 4, 'E', 'midnight-gold', '', timestamp, timestamp);
  insertClass.run('s3-a', 's3-a', 'Medicina · 3.º A', 3, 'A', 'midnight-gold', '', timestamp, timestamp);
  sqlite.prepare(`INSERT INTO community_participants (class_id,player_id,display_name,student_id_hash,student_id_last4,access_token_hash,verification_status,consented_at,created_at,updated_at) VALUES (?,?,?,?,?,?,'pending',?,?,?)`)
    .run('s4-e', IDS.oldParticipant, "María D'Ávila", 'f'.repeat(64), '4321', sha256(OLD_PARTICIPANT_TOKEN), timestamp, timestamp, timestamp);
  const insertScore = sqlite.prepare(`INSERT INTO community_scores (cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  insertScore.run('semester-4-group-e', week, IDS.legacyOne, 'Perfil Legacy', 'nutricion', 'legacy-one', 'nutricion:legacy-one', 3, 5, 60, timestamp, timestamp);
  insertScore.run('semester-4-group-e', week, IDS.legacyTwo, 'Perfil Legacy', 'nutricion', 'legacy-two', 'nutricion:legacy-two', 2, 5, 40, timestamp, timestamp);
  insertScore.run('historic-s4-cohort', week, IDS.oldParticipant, 'Nombre Histórico', 'nutricion', 'old-participant', 'nutricion:old-participant', 4, 5, 80, timestamp, timestamp);
}

function loadHandler(label) {
  assert.equal(fs.existsSync(sourcePath), true, 'functions/api/community.js is missing.');
  const source = fs.readFileSync(sourcePath, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${encodeURIComponent(label)}`);
}

async function call(handler, db, { method = 'GET', query = '?class=s4-e', payload = null, origin = ORIGIN, ip = '203.0.113.10', pepper = PEPPER, now = '' } = {}) {
  const headers = {};
  if (method === 'POST') headers['content-type'] = 'application/json';
  if (origin !== null) headers.origin = origin;
  if (ip !== null) headers['CF-Connecting-IP'] = ip;
  const request = new Request(`${ORIGIN}/api/community${query}`, { method, headers, body: method === 'POST' ? JSON.stringify(payload) : undefined });
  const response = await handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_CATRACA_PEPPER: pepper, MED_NYKUTO_RATE_SALT: 'community-ranking-rate-salt-fixture', ...(now ? { MED_NYKUTO_TEST_NOW: now } : {}) } });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

function expectSuccess(result, status = 200) {
  assert.equal(result.response.status, status, JSON.stringify(result.body));
  assert.equal(result.body?.ok, true, JSON.stringify(result.body));
  return result.body;
}
function expectFailure(result, status, code) {
  assert.equal(result.response.status, status, JSON.stringify(result.body));
  assert.equal(result.body?.ok, false, JSON.stringify(result.body));
  assert.equal(result.body?.code, code, JSON.stringify(result.body));
}
function enrollPayload(playerId, fullName, catraca, overrides = {}) {
  return { action: 'enroll', class: 's4-e', playerId, fullName, catraca, accessToken: clientToken(playerId), classConfirmed: true, consent: true, ...overrides };
}
function scorePayload(playerId, accessToken, moduleId, correct, total, overrides = {}) {
  return { action: 'score', class: 's4-e', playerId, accessToken, courseId: 'nutricion', moduleId, correct, total, ...overrides };
}
function scoreSnapshot(sqlite) { return JSON.stringify(sqlite.prepare(`SELECT * FROM community_scores ORDER BY id`).all()); }
function participantSnapshot(sqlite, playerIds) {
  return JSON.stringify(sqlite.prepare(`SELECT * FROM community_participants WHERE class_id='s4-e' AND player_id IN (${playerIds.map(() => '?').join(',')}) ORDER BY player_id`).all(...playerIds));
}
function participant(sqlite, playerId, classId = 's4-e') {
  return sqlite.prepare(`SELECT * FROM community_participants WHERE class_id=? AND player_id=?`).get(classId, playerId);
}

async function main() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const enrollSource = source.slice(source.indexOf('async function enrollParticipant'), source.indexOf('async function saveScore'));
  assert.match(source, /MED_NYKUTO_CATRACA_PEPPER/);
  assert.match(source, /ALTER TABLE community_scores ADD COLUMN class_id/);
  assert.match(source, /ALTER TABLE community_scores ADD COLUMN write_version INTEGER NOT NULL DEFAULT 0/);
  assert.match(source, /ALTER TABLE community_participants ADD COLUMN student_id_public TEXT NOT NULL DEFAULT ''/);
  assert.match(source, /community_scores_class_scope_write_idx/);
  assert.match(source, /community_participants_class_public_idx/);
  assert.match(source, /T20:00:00-03:00/, 'The weekly challenge must close exactly Sunday at 20:00 Paraguay time.');
  assert.match(source, /challenge_closed/, 'The API must refuse score writes after the countdown reaches zero.');
  assert.match(source, /MAX_SCOPES_PER_PLAYER\s*=\s*48/, 'The weekly scope limit must cover all 14 class themes in their three exercise formats.');
  assert.doesNotMatch(source, /UPDATE community_scores SET class_id=\? WHERE[^`]*cohort_key/i, 'A migration must not reassign an explicit class based on its legacy cohort.');
  assert.doesNotMatch(source, /\b(?:DELETE\s+FROM|DROP\s+TABLE|REPLACE\s+INTO|INSERT\s+OR\s+REPLACE)\b/i, 'Community migrations must remain additive and non-destructive.');
  assert.doesNotMatch(enrollSource, /community_scores/i, 'Enrollment must never rewrite historical score rows.');
  const participantUpdateSet = enrollSource.match(/UPDATE\s+community_participants\s+SET\s+([^`]*)/i)?.[1].split(/\s+WHERE\s+/i)[0] || '';
  assert.doesNotMatch(participantUpdateSet, /access_token_hash\s*=/i, 'Authenticated enrollment must never rotate the saved access-token hash.');

  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'med-nykuto-community-'));
  const databasePath = path.join(tempDirectory, 'community.sqlite');
  let db = null;
  try {
    db = new D1DatabaseMock(databasePath);
    seedPreMulticlassDatabase(db.database);
    const handler = await loadHandler(`community-integrity-${Date.now()}`);

    const migrated = expectSuccess(await call(handler.onRequest, db));
    assert.equal(migrated.class.id, 's4-e');
    assert.deepEqual(migrated.challenge.prize, { amount: 50, currency: 'BRL', method: 'PIX', place: 1, classId: 's4-e', provisional: true, verificationRequired: true });
    assert.equal(migrated.challenge.participants, 3, 'Legacy players sharing a nickname were merged in the participant count.');
    assert.equal(migrated.challenge.records, 3);
    const scoreColumns = db.database.prepare(`PRAGMA table_info(community_scores)`).all().map((column) => column.name);
    const participantColumns = db.database.prepare(`PRAGMA table_info(community_participants)`).all().map((column) => column.name);
    assert.ok(scoreColumns.includes('class_id'), 'The pre-multiclass score table was not migrated additively.');
    assert.ok(scoreColumns.includes('write_version'), 'The class-scoped score write marker was not migrated additively.');
    assert.ok(participantColumns.includes('student_id_public'), 'The pre-public-catraca participant table was not migrated additively.');
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores WHERE class_id='s4-e'`).get().count, 3);

    const beforeDeadline = expectSuccess(await call(handler.onRequest, db, {
      now: '2026-08-30T22:59:59.000Z'
    }));
    assert.equal(beforeDeadline.week.closesAt, '2026-08-30T20:00:00-03:00');
    assert.equal(beforeDeadline.week.closed, false);
    assert.equal(beforeDeadline.week.secondsRemaining, 1);
    const atDeadline = expectSuccess(await call(handler.onRequest, db, {
      now: '2026-08-30T23:00:00.000Z'
    }));
    assert.equal(atDeadline.week.closed, true);
    assert.equal(atDeadline.week.secondsRemaining, 0);
    assert.equal(atDeadline.challenge.closed, true);

    const legacyEntries = migrated.ranking.filter((entry) => entry.displayName === 'Perfil Legacy');
    assert.equal(legacyEntries.length, 2, 'Two legacy players with the same nickname were merged or lost.');
    assert.deepEqual(legacyEntries.map((entry) => entry.points).sort((a, b) => b - a), [3, 2]);
    for (const legacy of legacyEntries) {
      assert.equal(legacy.challenges, 1);
      assert.equal(legacy.fullName, 'Perfil Legacy');
      assert.equal(legacy.catraca, '');
      assert.equal(legacy.studentId, '');
      assert.equal(legacy.verificationStatus, 'legacy');
      assert.equal(legacy.identificationPending, true);
      assert.equal(legacy.eligibleForPrize, false);
      assert.equal(legacy.prizeEligible, false);
    }

    const oldEntry = migrated.ranking.find((entry) => entry.displayName === "María D'Ávila");
    assert.ok(oldEntry, 'A participant from the previous schema disappeared.');
    assert.equal(oldEntry.points, 4);
    assert.equal(oldEntry.studentId, '');
    assert.equal(oldEntry.identityComplete, false);
    assert.equal(oldEntry.identificationPending, true);
    assert.equal(oldEntry.prizeEligible, false);

    const scoresAfterMigration = scoreSnapshot(db.database);
    const legacyParticipantBeforePreemption = JSON.stringify(participant(db.database, IDS.oldParticipant));
    const legacyPreemption = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.attacker, 'Persona Atacante', '00004321'), ip: '203.0.113.11'
    });
    expectFailure(legacyPreemption, 409, 'identity_conflict');
    assert.equal(participant(db.database, IDS.attacker), undefined, 'A new player preempted an unresolved legacy catraca after pepper rotation.');
    assert.equal(JSON.stringify(participant(db.database, IDS.oldParticipant)), legacyParticipantBeforePreemption, 'A blocked legacy-catraca preemption changed its owner row.');
    const oldClaim = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.oldParticipant, "María D'Ávila", '00004321', { accessToken: OLD_PARTICIPANT_TOKEN }), ip: '203.0.113.12'
    }));
    assert.equal(oldClaim.participant.fullName, "María D'Ávila");
    assert.equal(oldClaim.participant.displayName, "María D'Ávila");
    assert.equal(oldClaim.participant.catraca, '00004321');
    assert.equal(oldClaim.participant.studentId, '00004321');
    assert.equal(oldClaim.participant.studentIdMasked, '•••• 4321');
    assert.equal(oldClaim.participant.verificationStatus, 'pending');
    assert.equal(oldClaim.participant.prizeEligible, false);
    assert.equal(oldClaim.accessToken, OLD_PARTICIPANT_TOKEN);
    assert.equal(scoreSnapshot(db.database), scoresAfterMigration, 'Claiming an old participant changed score bytes.');
    const claimedRow = participant(db.database, IDS.oldParticipant);
    assert.equal(claimedRow.student_id_public, '00004321');
    assert.equal(claimedRow.student_id_hash, studentHash('00004321'));
    assert.equal(claimedRow.access_token_hash, sha256(oldClaim.accessToken));

    const claimWithoutToken = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.oldParticipant, "María D'Ávila", '00004321', { accessToken: undefined }), ip: '203.0.113.13'
    });
    expectFailure(claimWithoutToken, 409, 'identity_conflict');
    assert.equal(scoreSnapshot(db.database), scoresAfterMigration);
    const claimedParticipantSnapshot = JSON.stringify(participant(db.database, IDS.oldParticipant));
    const reClaim = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.oldParticipant, "María D'Ávila", '00004321', { accessToken: oldClaim.accessToken }), ip: '203.0.113.13'
    }));
    assert.equal(reClaim.accessToken, oldClaim.accessToken);
    assert.equal(JSON.stringify(participant(db.database, IDS.oldParticipant)), claimedParticipantSnapshot, 'Retrying a legacy claim changed participant bytes.');
    assert.equal(scoreSnapshot(db.database), scoresAfterMigration, 'Re-enrollment changed historical score bytes.');
    const historicScoreBefore = db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND player_id=? AND scope_id='nutricion:old-participant'`).get(IDS.oldParticipant);
    const historicImprovement = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.oldParticipant, oldClaim.accessToken, 'old-participant', 5, 5), ip: '203.0.113.13'
    }));
    assert.equal(historicImprovement.saved, true);
    const historicRows = db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND player_id=? AND scope_id='nutricion:old-participant'`).all(IDS.oldParticipant);
    assert.equal(historicRows.length, 1, 'Updating a historical score with a different cohort created a duplicate row.');
    assert.equal(historicRows[0].created_at, historicScoreBefore.created_at, 'Updating a historical score replaced its first-created timestamp.');
    assert.equal(historicRows[0].cohort_key, 'historic-s4-cohort', 'Updating a historical score rewrote its cohort identity.');

    const invalidName = await call(handler.onRequest, db, { method: 'POST', payload: enrollPayload(IDS.attacker, 'Madonna', 'ATTACK01'), ip: '203.0.113.14' });
    expectFailure(invalidName, 400, 'invalid_name');
    const invalidClientToken = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.attacker, 'Persona Atacante', 'ATTACK01', { accessToken: 'not-a-64-hex-token' }), ip: '203.0.113.14'
    });
    expectFailure(invalidClientToken, 400, 'invalid_access_token');
    const missingClassConfirmation = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.attacker, 'Persona Atacante', 'ATTACK01', { classConfirmed: false }), ip: '203.0.113.15'
    });
    expectFailure(missingClassConfirmation, 400, 'consent_required');

    const mainEnrollmentPayload = enrollPayload(IDS.main, "Ana María O'Connor", '00-001-234', { displayName: "Ana María O'Connor", studentId: '00001234' });
    const mainEnrollment = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST',
      payload: mainEnrollmentPayload,
      ip: '203.0.113.16'
    }), 201);
    assert.equal(mainEnrollment.accessToken, clientToken(IDS.main), 'The API did not preserve the client-generated token on creation.');
    assert.equal(mainEnrollment.participant.fullName, "Ana María O'Connor");
    assert.equal(mainEnrollment.participant.displayName, "Ana María O'Connor");
    assert.equal(mainEnrollment.participant.catraca, '00001234');
    assert.equal(mainEnrollment.participant.studentId, '00001234');
    assert.equal(mainEnrollment.participant.studentIdMasked, '•••• 1234');
    assert.equal(mainEnrollment.participant.eligibleForPrize, false);
    assert.equal(mainEnrollment.participant.prizeEligible, false);
    const mainRow = participant(db.database, IDS.main);
    assert.equal(mainRow.student_id_public, '00001234', 'Leading zeroes were not preserved in the public catraca.');
    assert.equal(mainRow.student_id_hash, studentHash('00001234'));
    assert.equal(mainRow.access_token_hash, sha256(clientToken(IDS.main)));
    const mainCreateSnapshot = JSON.stringify(mainRow);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const mainCreateRetry = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: mainEnrollmentPayload, ip: '203.0.113.16'
    }));
    assert.equal(mainCreateRetry.accessToken, mainEnrollment.accessToken);
    assert.equal(JSON.stringify(participant(db.database, IDS.main)), mainCreateSnapshot, 'Retrying a client-token creation changed participant bytes.');
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_participants WHERE class_id='s4-e' AND player_id=?`).get(IDS.main).count, 1);

    const aliasEnrollment = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST',
      payload: { action: 'enroll', class: 's4-e', playerId: IDS.other, displayName: 'João da Silva', studentId: 'OUTRA0002', classConfirmed: true, consent: true },
      ip: '203.0.113.17'
    }), 201);
    assert.equal(aliasEnrollment.participant.fullName, 'João da Silva');
    assert.equal(aliasEnrollment.participant.catraca, 'OUTRA0002');
    assert.match(aliasEnrollment.accessToken, /^[0-9a-f]{64}$/, 'Legacy clients without a token did not receive a server fallback token.');
    assert.equal(participant(db.database, IDS.other).access_token_hash, sha256(aliasEnrollment.accessToken));

    for (const payload of [
      enrollPayload(IDS.attacker, 'Pessoa Atacante', '00001234'),
      enrollPayload(IDS.attacker, 'Pessoa Atacante', 'ATTACK02', { accessToken: mainEnrollment.accessToken }),
      enrollPayload(IDS.main, "Ana María O'Connor", '00001234', { accessToken: undefined }),
      enrollPayload(IDS.main, "Ana María O'Connor", '00001234', { accessToken: 'b'.repeat(64) })
    ]) {
      const rejected = await call(handler.onRequest, db, { method: 'POST', payload, ip: '203.0.113.18' });
      expectFailure(rejected, 409, 'identity_conflict');
    }
    const protectedParticipants = participantSnapshot(db.database, [IDS.main, IDS.other]);
    const stealExistingCatraca = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.other, 'Nome Alterado Indevido', '00001234', { accessToken: aliasEnrollment.accessToken }), ip: '203.0.113.19'
    });
    expectFailure(stealExistingCatraca, 409, 'identity_conflict');
    assert.equal(participantSnapshot(db.database, [IDS.main, IDS.other]), protectedParticipants, 'A collision changed another player name, catraca or token.');

    const missingScoreToken = await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(IDS.main, '', 'token-check', 1, 1), ip: '203.0.113.20' });
    expectFailure(missingScoreToken, 401, 'identity_required');
    const wrongScoreToken = await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(IDS.main, 'c'.repeat(64), 'token-check', 1, 1), ip: '203.0.113.20' });
    expectFailure(wrongScoreToken, 401, 'identity_required');
    expectSuccess(await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'token-check', 1, 1), ip: '203.0.113.20' }));

    const finalSecond = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'cutoff-second', 1, 2),
      ip: '203.0.113.32', now: '2026-08-30T22:59:59.000Z'
    }));
    assert.equal(finalSecond.week.key, '2026-08-24');
    assert.equal(finalSecond.week.secondsRemaining, 1);
    const cutoffScoreBefore = JSON.stringify(db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND week_key='2026-08-24' AND player_id=? AND scope_id='nutricion:cutoff-second'`).get(IDS.main));
    const closedWrite = await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'cutoff-second', 2, 2),
      ip: '203.0.113.32', now: '2026-08-30T23:00:00.000Z'
    });
    expectFailure(closedWrite, 409, 'challenge_closed');
    assert.equal(JSON.stringify(db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND week_key='2026-08-24' AND player_id=? AND scope_id='nutricion:cutoff-second'`).get(IDS.main)), cutoffScoreBefore, 'A score changed at or after the exact Sunday 20:00 cutoff.');
    const mondayWrite = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'cutoff-second', 2, 2),
      ip: '203.0.113.32', now: '2026-08-31T03:00:00.000Z'
    }));
    assert.equal(mondayWrite.week.key, '2026-08-31');
    assert.equal(mondayWrite.week.closed, false);

    const crossClassTimestamp = '2026-08-02T10:00:00.000Z';
    db.database.prepare(`INSERT INTO community_scores (class_id,cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run('s3-a', 'semester-4-group-e', currentWeekKey(), IDS.main, 'Sentinela Classe Três', 'nutricion', 'cross-class', 'nutricion:cross-class', 50, 50, 100, crossClassTimestamp, crossClassTimestamp);
    const s3CrossClassBefore = JSON.stringify(db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s3-a' AND player_id=? AND scope_id='nutricion:cross-class'`).get(IDS.main));
    expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'cross-class', 2, 3), ip: '203.0.113.20'
    }));
    assert.equal(JSON.stringify(db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s3-a' AND player_id=? AND scope_id='nutricion:cross-class'`).get(IDS.main)), s3CrossClassBefore, 'A 4E score write mutated another class row.');
    const s4CrossClass = db.database.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND player_id=? AND scope_id='nutricion:cross-class'`).get(IDS.main);
    assert.ok(s4CrossClass, 'The class-scoped score row was not created for 4E.');
    assert.equal(s4CrossClass.cohort_key, 'class:s4-e');
    assert.equal(s4CrossClass.write_version, 1);

    const scoresBeforeMainUpdate = scoreSnapshot(db.database);
    const mainTokenHashBeforeUpdate = participant(db.database, IDS.main).access_token_hash;
    const mainUpdatePayload = enrollPayload(IDS.main, 'Ana María O’Connor Silva', '00001234', { accessToken: mainEnrollment.accessToken });
    const mainUpdate = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: mainUpdatePayload, ip: '203.0.113.21'
    }));
    assert.equal(mainUpdate.participant.fullName, 'Ana María O’Connor Silva');
    assert.equal(mainUpdate.accessToken, mainEnrollment.accessToken);
    assert.equal(participant(db.database, IDS.main).access_token_hash, mainTokenHashBeforeUpdate, 'An authenticated update rotated the access-token hash.');
    assert.equal(scoreSnapshot(db.database), scoresBeforeMainUpdate, 'An authenticated profile update rewrote score bytes.');
    assert.equal(db.database.prepare(`SELECT nickname FROM community_scores WHERE player_id=? AND scope_id='nutricion:token-check'`).get(IDS.main).nickname, "Ana María O'Connor");
    const mainUpdateSnapshot = JSON.stringify(participant(db.database, IDS.main));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const mainUpdateRetry = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: mainUpdatePayload, ip: '203.0.113.21'
    }));
    assert.equal(mainUpdateRetry.accessToken, mainEnrollment.accessToken);
    assert.equal(JSON.stringify(participant(db.database, IDS.main)), mainUpdateSnapshot, 'Retrying an authenticated update changed participant bytes.');
    assert.equal(scoreSnapshot(db.database), scoresBeforeMainUpdate, 'Retrying an authenticated update rewrote score bytes.');
    expectSuccess(await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(IDS.main, mainEnrollment.accessToken, 'preserved-token', 1, 1), ip: '203.0.113.22' }));

    const pepperEnrollment = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.pepper, 'Pedro Pepper Antigo', 'PEP00001'), pepper: OLD_PEPPER, ip: '203.0.113.23'
    }), 201);
    assert.equal(participant(db.database, IDS.pepper).student_id_hash, studentHash('PEP00001', OLD_PEPPER));
    const pepperTokenHashBeforeMigration = participant(db.database, IDS.pepper).access_token_hash;
    const unauthenticatedPepperMigration = await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.pepper, 'Pedro Pepper Antigo', 'PEP00001', { accessToken: undefined }), pepper: PEPPER, ip: '203.0.113.24'
    });
    expectFailure(unauthenticatedPepperMigration, 409, 'identity_conflict');
    assert.equal(participant(db.database, IDS.pepper).student_id_hash, studentHash('PEP00001', OLD_PEPPER));
    const scoresBeforePepperMigration = scoreSnapshot(db.database);
    const pepperMigration = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.pepper, 'Pedro Pepper Antigo', 'PEP00001', { accessToken: pepperEnrollment.accessToken }), pepper: PEPPER, ip: '203.0.113.25'
    }));
    assert.equal(participant(db.database, IDS.pepper).student_id_hash, studentHash('PEP00001', PEPPER));
    assert.equal(pepperMigration.accessToken, pepperEnrollment.accessToken);
    assert.equal(participant(db.database, IDS.pepper).access_token_hash, pepperTokenHashBeforeMigration, 'Pepper migration rotated the access-token hash.');
    assert.equal(scoreSnapshot(db.database), scoresBeforePepperMigration, 'Pepper migration changed score bytes.');

    const raceEnrollment = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.race, 'Rita Corrida Segura', 'RACE0001'), ip: '203.0.113.31'
    }), 201);
    db.database.prepare(`UPDATE community_participants SET verification_status='verified' WHERE class_id='s4-e' AND player_id=?`).run(IDS.race);
    const verifiedIdentityChange = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.race, 'Rita Corrida Confirmada', 'RACE0001', { accessToken: raceEnrollment.accessToken }), ip: '203.0.113.31'
    }));
    assert.equal(verifiedIdentityChange.participant.verificationStatus, 'pending', 'Changing a verified identity did not reset it to pending.');
    db.database.prepare(`UPDATE community_participants SET verification_status='verified' WHERE class_id='s4-e' AND player_id=?`).run(IDS.race);
    db.beforeRun = ({ sql, database }) => {
      if (!/^\s*UPDATE community_participants SET display_name=/i.test(sql)) return false;
      database.prepare(`UPDATE community_participants SET verification_status='rejected' WHERE class_id='s4-e' AND player_id=?`).run(IDS.race);
      return true;
    };
    const racedIdentityUpdate = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.race, 'Rita Corrida Protegida', 'RACE0001', { accessToken: raceEnrollment.accessToken }), ip: '203.0.113.31'
    }));
    assert.equal(racedIdentityUpdate.accessToken, raceEnrollment.accessToken);
    assert.equal(racedIdentityUpdate.participant.verificationStatus, 'rejected', 'A concurrent rejection was overwritten by an enrollment snapshot.');
    assert.equal(participant(db.database, IDS.race).verification_status, 'rejected');
    assert.equal(db.beforeRun, null, 'The verification race hook did not intercept the participant update.');

    const pointsEnrollment = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: enrollPayload(IDS.points, 'Camila Pontos Primeiro', 'POINT001'), ip: '203.0.113.26'
    }), 201);
    const firstPoints = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.points, pointsEnrollment.accessToken, 'points-first', 9, 10), ip: '203.0.113.27'
    }));
    assert.deepEqual(firstPoints.best, { correct: 9, total: 10, percentage: 90 });
    const createdAt = db.database.prepare(`SELECT created_at FROM community_scores WHERE player_id=? AND scope_id='nutricion:points-first'`).get(IDS.points).created_at;
    const morePoints = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.points, pointsEnrollment.accessToken, 'points-first', 17, 20), ip: '203.0.113.27'
    }));
    assert.equal(morePoints.saved, true);
    assert.deepEqual(morePoints.best, { correct: 17, total: 20, percentage: 85 });
    const samePointsWorseAccuracy = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.points, pointsEnrollment.accessToken, 'points-first', 17, 25), ip: '203.0.113.27'
    }));
    assert.equal(samePointsWorseAccuracy.saved, false);
    assert.deepEqual(samePointsWorseAccuracy.best, { correct: 17, total: 20, percentage: 85 });
    const samePointsBetterAccuracy = expectSuccess(await call(handler.onRequest, db, {
      method: 'POST', payload: scorePayload(IDS.points, pointsEnrollment.accessToken, 'points-first', 17, 18), ip: '203.0.113.27'
    }));
    assert.equal(samePointsBetterAccuracy.saved, true);
    assert.deepEqual(samePointsBetterAccuracy.best, { correct: 17, total: 18, percentage: 94.44 });
    assert.equal(db.database.prepare(`SELECT created_at FROM community_scores WHERE player_id=? AND scope_id='nutricion:points-first'`).get(IDS.points).created_at, createdAt, 'Improving a score changed its first activity time.');

    const tieProfiles = [];
    for (const [id, name, catraca, ip] of [
      [IDS.tieEarly, 'Alfa Registro Temprano', 'TIE00002', '203.0.113.28'],
      [IDS.tieLate, 'Beta Registro Tardío', 'TIE00001', '203.0.113.29']
    ]) {
      const enrollment = expectSuccess(await call(handler.onRequest, db, { method: 'POST', payload: enrollPayload(id, name, catraca), ip }), 201);
      tieProfiles.push({ id, name, accessToken: enrollment.accessToken, ip });
      expectSuccess(await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(id, enrollment.accessToken, 'tie-a', 3, 5), ip }));
      expectSuccess(await call(handler.onRequest, db, { method: 'POST', payload: scorePayload(id, enrollment.accessToken, 'tie-b', 3, 5), ip }));
    }
    db.database.prepare(`UPDATE community_scores SET created_at=?,updated_at=? WHERE player_id=? AND scope_id='nutricion:tie-a'`).run('2026-08-18T08:00:00.000Z', '2026-08-30T08:00:00.000Z', IDS.tieEarly);
    db.database.prepare(`UPDATE community_scores SET created_at=?,updated_at=? WHERE player_id=? AND scope_id='nutricion:tie-b'`).run('2026-08-28T08:00:00.000Z', '2026-08-30T08:00:00.000Z', IDS.tieEarly);
    db.database.prepare(`UPDATE community_scores SET created_at=?,updated_at=? WHERE player_id=? AND scope_id='nutricion:tie-a'`).run('2026-08-19T08:00:00.000Z', '2026-08-20T08:00:00.000Z', IDS.tieLate);
    db.database.prepare(`UPDATE community_scores SET created_at=?,updated_at=? WHERE player_id=? AND scope_id='nutricion:tie-b'`).run('2026-08-20T08:00:00.000Z', '2026-08-20T08:00:00.000Z', IDS.tieLate);

    db.database.prepare(`UPDATE community_participants SET verification_status='verified' WHERE class_id='s4-e' AND player_id=?`).run(IDS.points);
    const ranked = expectSuccess(await call(handler.onRequest, db, { query: `?class=s4-e&player=${IDS.main}` }));
    const mainRank = ranked.ranking.find((entry) => entry.studentId === '00001234');
    assert.equal(mainRank.fullName, 'Ana María O’Connor Silva');
    assert.equal(mainRank.catraca, '00001234');
    assert.equal(mainRank.prizeEligible, false, 'A pending participant became prize-eligible.');
    const verifiedRank = ranked.ranking.find((entry) => entry.studentId === 'POINT001');
    assert.equal(verifiedRank.verificationStatus, 'verified');
    assert.equal(verifiedRank.eligibleForPrize, true);
    assert.equal(verifiedRank.prizeEligible, true);
    assert.ok(ranked.ranking.filter((entry) => entry.displayName === 'Perfil Legacy').every((entry) => entry.prizeEligible === false));
    const tiedNames = ranked.ranking.filter((entry) => tieProfiles.some((profile) => profile.name === entry.displayName)).map((entry) => entry.displayName);
    assert.deepEqual(tiedNames, ['Alfa Registro Temprano', 'Beta Registro Tardío'], 'Ranking ties did not use MIN(created_at).');
    assert.equal(ranked.ranking.find((entry) => entry.displayName === 'Alfa Registro Temprano').firstActivity, '2026-08-18T08:00:00.000Z');

    const otherClassTimestamp = '2026-08-10T10:00:00.000Z';
    db.database.prepare(`INSERT INTO community_participants (class_id,player_id,display_name,student_id_hash,student_id_last4,student_id_public,access_token_hash,verification_status,consented_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'verified',?,?,?)`)
      .run('s3-a', IDS.main, 'Participante Classe Três', studentHash('00001234', PEPPER, 's3-a'), '1234', '00001234', sha256('d'.repeat(64)), otherClassTimestamp, otherClassTimestamp, otherClassTimestamp);
    db.database.prepare(`INSERT INTO community_scores (class_id,cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run('s3-a', 'semester-4-group-e', currentWeekKey(), IDS.main, 'Participante Classe Três', 'nutricion', 'isolated', 'nutricion:isolated', 50, 50, 100, otherClassTimestamp, otherClassTimestamp);
    const s3Ranking = expectSuccess(await call(handler.onRequest, db, { query: '?class=s3-a' }));
    assert.equal(s3Ranking.challenge.prize, null);
    assert.ok(s3Ranking.ranking.some((entry) => entry.displayName === 'Participante Classe Três'));
    assert.ok(!s3Ranking.ranking.some((entry) => entry.displayName === 'Ana María O’Connor Silva'));
    assert.equal(s3Ranking.ranking[0].prizeEligible, false);
    const s4AfterS3 = expectSuccess(await call(handler.onRequest, db));
    assert.ok(!s4AfterS3.ranking.some((entry) => entry.displayName === 'Participante Classe Três'));
    const s3Enroll = await call(handler.onRequest, db, {
      method: 'POST', query: '?class=s3-a', payload: enrollPayload(IDS.attacker, 'Classe Três Bloqueada', 'S3A00001', { class: 's3-a' }), ip: '203.0.113.30'
    });
    expectFailure(s3Enroll, 403, 'challenge_class_only');

    const beforeRestart = {
      scores: scoreSnapshot(db.database),
      participants: JSON.stringify(db.database.prepare(`SELECT * FROM community_participants ORDER BY class_id,player_id`).all())
    };
    db.close();
    db = new D1DatabaseMock(databasePath);
    const restartedHandler = await loadHandler(`community-restarted-${Date.now()}`);
    const afterRestart = expectSuccess(await call(restartedHandler.onRequest, db));
    assert.ok(afterRestart.ranking.some((entry) => entry.studentId === '00001234'));
    assert.equal(db.database.prepare(`SELECT class_id FROM community_scores WHERE scope_id='nutricion:isolated'`).get().class_id, 's3-a', 'A deployment reassigned an explicit class because it used the legacy cohort.');
    assert.equal(db.database.prepare(`SELECT class_id FROM community_scores WHERE scope_id='nutricion:cross-class' AND nickname='Sentinela Classe Três'`).get().class_id, 's3-a', 'A deployment reassigned the cross-class sentinel row.');
    assert.equal(scoreSnapshot(db.database), beforeRestart.scores, 'Idempotent deployment changed score bytes.');
    assert.equal(JSON.stringify(db.database.prepare(`SELECT * FROM community_participants ORDER BY class_id,player_id`).all()), beforeRestart.participants, 'Idempotent deployment changed participant bytes.');

    console.log('Community ranking validation OK: Sunday 20:00 Paraguay cutoff enforced to the second, Monday reopening, additive class-safe migration, conservative legacy-catraca lock, idempotent client tokens, race-safe verification, class-scoped first-created score writes, points-first 4E ranking, verified-only Pix eligibility and discriminating activity ties.');
  } finally {
    if (db) { try { db.close(); } catch {} }
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
