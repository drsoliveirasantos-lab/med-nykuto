#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'functions/api/community.js');
const ORIGIN = 'https://med.nykuto.com';
const PEPPER = 'community-ranking-catraca-pepper-fixture';

const IDS = {
  main: '11111111-1111-4111-8111-111111111111',
  secondDevice: '22222222-2222-4222-8222-222222222222',
  tieFirst: '33333333-3333-4333-8333-333333333333',
  tieSecond: '44444444-4444-4444-8444-444444444444',
  limited: '55555555-5555-4555-8555-555555555555',
  legacy: '99999999-9999-4999-8999-999999999999'
};

class D1StatementMock {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new D1StatementMock(this.database, this.sql, values);
  }

  async all() {
    return { results: this.database.prepare(this.sql).all(...this.values) };
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) || null;
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return {
      ...result,
      meta: {
        changes: Number(result.changes) || 0,
        last_row_id: Number(result.lastInsertRowid) || 0
      }
    };
  }
}

class D1DatabaseMock {
  constructor(filename) {
    this.database = new DatabaseSync(filename);
  }

  prepare(sql) {
    return new D1StatementMock(this.database, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  close() {
    this.database.close();
  }
}

function currentWeekKey(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const localDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  localDate.setUTCDate(localDate.getUTCDate() - ((localDate.getUTCDay() + 6) % 7));
  return localDate.toISOString().slice(0, 10);
}

function seedLegacyDatabase(sqlite) {
  const timestamp = '2026-08-01T12:00:00.000Z';
  sqlite.exec(`
    CREATE TABLE hub_classes (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      semester INTEGER NOT NULL,
      group_code TEXT NOT NULL DEFAULT '',
      theme TEXT NOT NULL DEFAULT 'midnight-gold',
      drive_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE community_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cohort_key TEXT NOT NULL,
      week_key TEXT NOT NULL,
      player_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      course_id TEXT NOT NULL DEFAULT '',
      module_id TEXT NOT NULL DEFAULT '',
      scope_id TEXT NOT NULL,
      correct INTEGER NOT NULL,
      total INTEGER NOT NULL,
      percentage REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (cohort_key,week_key,player_id,scope_id)
    );
  `);
  const insertClass = sqlite.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`);
  insertClass.run('s4-e', 's4-e', 'Medicina · 4.º E', 4, 'E', 'midnight-gold', '', timestamp, timestamp);
  insertClass.run('s3-a', 's3-a', 'Medicina · 3.º A', 3, 'A', 'midnight-gold', '', timestamp, timestamp);
  sqlite.prepare(`INSERT INTO community_scores (cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run('semester-4-group-e', currentWeekKey(), IDS.legacy, 'Perfil Legacy', 'nutricion', 'legacy-module', 'nutricion:legacy-module', 3, 5, 60, timestamp, timestamp);
}

function loadHandler(label) {
  assert.equal(fs.existsSync(sourcePath), true, 'functions/api/community.js is missing.');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${encodeURIComponent(label)}`;
  return import(moduleUrl);
}

async function call(handler, db, {
  method = 'GET',
  query = '?class=s4-e',
  payload = null,
  origin = ORIGIN,
  ip = '203.0.113.10',
  extraEnv = {}
} = {}) {
  const headers = {};
  if (method === 'POST') headers['content-type'] = 'application/json';
  if (origin !== null) headers.origin = origin;
  if (ip !== null) headers['CF-Connecting-IP'] = ip;
  const request = new Request(`${ORIGIN}/api/community${query}`, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(payload) : undefined
  });
  const response = await handler({
    request,
    env: {
      MED_NYKUTO_DB: db,
      MED_NYKUTO_CATRACA_PEPPER: PEPPER,
      MED_NYKUTO_RATE_SALT: 'community-ranking-rate-salt-fixture',
      ...extraEnv
    }
  });
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

function enrollPayload(playerId, displayName, studentId, overrides = {}) {
  return {
    action: 'enroll',
    class: 's4-e',
    playerId,
    displayName,
    studentId,
    consent: true,
    ...overrides
  };
}

function scorePayload(playerId, accessToken, moduleId, correct, total, overrides = {}) {
  return {
    action: 'score',
    class: 's4-e',
    playerId,
    accessToken,
    courseId: 'nutricion',
    moduleId,
    correct,
    total,
    ...overrides
  };
}

function scoreRows(sqlite, playerId) {
  return sqlite.prepare(`SELECT * FROM community_scores WHERE class_id='s4-e' AND player_id=? ORDER BY scope_id`).all(playerId);
}

async function main() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  assert.match(source, /MED_NYKUTO_CATRACA_PEPPER/);
  assert.match(source, /ALTER TABLE community_scores ADD COLUMN class_id/);
  assert.doesNotMatch(source, /\b(?:DELETE\s+FROM|DROP\s+TABLE|REPLACE\s+INTO|INSERT\s+OR\s+REPLACE)\b/i, 'Community migrations must be additive and non-destructive.');

  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'med-nykuto-community-'));
  const databasePath = path.join(tempDirectory, 'community.sqlite');
  let db = null;
  try {
    db = new D1DatabaseMock(databasePath);
    seedLegacyDatabase(db.database);
    const firstModule = await loadHandler(`community-first-${Date.now()}`);

    const migrated = expectSuccess(await call(firstModule.onRequest, db));
    assert.equal(migrated.class.id, 's4-e');
    assert.equal(migrated.challenge.prize.amount, 50);
    assert.equal(migrated.challenge.prize.currency, 'BRL');
    assert.equal(migrated.challenge.prize.method, 'PIX');
    assert.equal(migrated.challenge.prize.classId, 's4-e');
    const legacyEntry = migrated.ranking.find((entry) => entry.displayName === 'Perfil Legacy');
    assert.ok(legacyEntry, 'A pre-existing legacy score disappeared during migration.');
    assert.equal(legacyEntry.verificationStatus, 'legacy');
    assert.equal(legacyEntry.identityComplete, false);
    assert.equal(legacyEntry.studentIdMasked, '');
    assert.equal(db.database.prepare(`SELECT class_id FROM community_scores WHERE player_id=?`).get(IDS.legacy)?.class_id, 's4-e');

    const fullCatraca = 'UCP-9876-5432';
    const canonicalCatraca = 'UCP98765432';
    const firstEnrollment = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: enrollPayload(IDS.main, 'Ana Oliveira', fullCatraca),
      ip: '203.0.113.11'
    });
    const firstParticipant = expectSuccess(firstEnrollment, 201);
    assert.equal(firstParticipant.participant.playerId, IDS.main);
    assert.equal(firstParticipant.participant.displayName, 'Ana Oliveira');
    assert.equal(firstParticipant.participant.studentIdMasked, '•••• 5432');
    assert.equal(firstParticipant.participant.verificationStatus, 'pending');
    assert.match(firstParticipant.accessToken, /^[0-9a-f]{64}$/);
    assert.equal(JSON.stringify(firstParticipant).includes(fullCatraca), false);
    assert.equal(JSON.stringify(firstParticipant).includes(canonicalCatraca), false);

    const participantRow = db.database.prepare(`SELECT * FROM community_participants WHERE class_id='s4-e' AND player_id=?`).get(IDS.main);
    assert.match(participantRow.student_id_hash, /^[0-9a-f]{64}$/);
    assert.equal(participantRow.student_id_last4, '5432');
    assert.match(participantRow.access_token_hash, /^[0-9a-f]{64}$/);
    assert.notEqual(participantRow.access_token_hash, firstParticipant.accessToken);
    const privateSnapshot = JSON.stringify({
      participants: db.database.prepare(`SELECT * FROM community_participants`).all(),
      scores: db.database.prepare(`SELECT * FROM community_scores`).all()
    });
    assert.equal(privateSnapshot.includes(fullCatraca), false, 'The complete catraca was persisted.');
    assert.equal(privateSnapshot.includes(canonicalCatraca), false, 'The canonical complete catraca was persisted.');

    const publicProfile = expectSuccess(await call(firstModule.onRequest, db, {
      query: `?class=s4-e&player=${IDS.main}`
    }));
    assert.equal(JSON.stringify(publicProfile).includes(fullCatraca), false);
    assert.equal(JSON.stringify(publicProfile).includes(canonicalCatraca), false);
    assert.equal(publicProfile.ranking.find((entry) => entry.displayName === 'Ana Oliveira'), undefined, 'Participants without a score must not be fabricated into the ranking.');

    const missingAction = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: { ...scorePayload(IDS.main, firstParticipant.accessToken, 'required-fields', 1, 1), action: undefined },
      ip: '203.0.113.12'
    });
    expectFailure(missingAction, 400, 'invalid_action');
    const missingClass = await call(firstModule.onRequest, db, {
      method: 'POST',
      query: '',
      payload: { ...scorePayload(IDS.main, firstParticipant.accessToken, 'required-fields', 1, 1), class: undefined },
      ip: '203.0.113.13'
    });
    expectFailure(missingClass, 403, 'challenge_class_only');
    const missingToken = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: { ...scorePayload(IDS.main, '', 'required-fields', 1, 1), accessToken: undefined },
      ip: '203.0.113.14'
    });
    expectFailure(missingToken, 401, 'identity_required');

    const otherClassEnroll = await call(firstModule.onRequest, db, {
      method: 'POST',
      query: '?class=s3-a',
      payload: enrollPayload(IDS.secondDevice, 'Classe Trois', 'S3A12345', { class: 's3-a' }),
      ip: '203.0.113.15'
    });
    expectFailure(otherClassEnroll, 403, 'challenge_class_only');
    const otherClassScore = await call(firstModule.onRequest, db, {
      method: 'POST',
      query: '?class=s3-a',
      payload: scorePayload(IDS.main, firstParticipant.accessToken, 'foreign-class', 1, 1, { class: 's3-a' }),
      ip: '203.0.113.16'
    });
    expectFailure(otherClassScore, 403, 'challenge_class_only');
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores WHERE class_id='s3-a'`).get().count, 0);

    const secondDeviceEnrollment = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: enrollPayload(IDS.secondDevice, 'Ana Oliveira Actualizada', fullCatraca),
      ip: '203.0.113.17'
    });
    const rotated = expectSuccess(secondDeviceEnrollment, 200);
    assert.equal(rotated.participant.playerId, IDS.main, 'The same catraca on another device must reuse the original participant.');
    assert.notEqual(rotated.accessToken, firstParticipant.accessToken, 'A repeat enrollment must rotate the access token.');
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_participants WHERE class_id='s4-e' AND student_id_last4='5432'`).get().count, 1);

    const staleToken = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.main, firstParticipant.accessToken, 'stale-token', 1, 1),
      ip: '203.0.113.18'
    });
    expectFailure(staleToken, 401, 'identity_required');

    const firstBest = expectSuccess(await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.main, rotated.accessToken, 'best-score', 5, 10),
      ip: '203.0.113.19'
    }));
    assert.equal(firstBest.saved, true);
    const improvedBest = expectSuccess(await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.main, rotated.accessToken, 'best-score', 9, 10),
      ip: '203.0.113.19'
    }));
    assert.equal(improvedBest.saved, true);
    assert.deepEqual(improvedBest.best, { correct: 9, total: 10, percentage: 90 });
    const rejectedLower = expectSuccess(await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.main, rotated.accessToken, 'best-score', 8, 10),
      ip: '203.0.113.19'
    }));
    assert.equal(rejectedLower.saved, false);
    assert.deepEqual(rejectedLower.best, { correct: 9, total: 10, percentage: 90 });
    assert.equal(scoreRows(db.database, IDS.main).filter((row) => row.scope_id === 'nutricion:best-score').length, 1);

    const ranked = expectSuccess(await call(firstModule.onRequest, db, {
      query: `?class=s4-e&player=${IDS.main}`
    }));
    const ana = ranked.ranking.find((entry) => entry.isCurrent);
    assert.ok(ana);
    assert.equal(ana.displayName, 'Ana Oliveira Actualizada');
    assert.equal(ana.studentIdMasked, '•••• 5432');
    assert.equal(ana.verificationStatus, 'pending');
    assert.equal(ana.identityComplete, true);
    assert.equal(ana.points, 9);

    const legacyEnrollment = expectSuccess(await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: enrollPayload(IDS.legacy, 'Perfil Legacy Confirmado', 'LEGACY7788'),
      ip: '203.0.113.20'
    }), 201);
    assert.equal(legacyEnrollment.participant.verificationStatus, 'pending');
    const legacyProfile = expectSuccess(await call(firstModule.onRequest, db, {
      query: `?class=s4-e&player=${IDS.legacy}`
    }));
    assert.equal(legacyProfile.currentUser.displayName, 'Perfil Legacy Confirmado');
    assert.equal(legacyProfile.currentUser.studentIdMasked, '•••• 7788');
    assert.equal(legacyProfile.currentUser.verificationStatus, 'pending');
    assert.equal(legacyProfile.currentUser.points, 3, 'The legacy score must remain visible after profile enrollment.');

    for (const participant of [
      { id: IDS.tieFirst, name: 'Alfa Tie', catraca: 'TIE00001', ip: '203.0.113.21' },
      { id: IDS.tieSecond, name: 'Beta Tie', catraca: 'TIE00002', ip: '203.0.113.22' }
    ]) {
      const enrollment = expectSuccess(await call(firstModule.onRequest, db, {
        method: 'POST',
        payload: enrollPayload(participant.id, participant.name, participant.catraca),
        ip: participant.ip
      }), 201);
      expectSuccess(await call(firstModule.onRequest, db, {
        method: 'POST',
        payload: scorePayload(participant.id, enrollment.accessToken, 'stable-tie', 6, 10),
        ip: participant.ip
      }));
    }
    db.database.prepare(`UPDATE community_scores SET updated_at=? WHERE player_id IN (?,?) AND scope_id=?`)
      .run('2026-08-24T12:00:00.000Z', IDS.tieFirst, IDS.tieSecond, 'nutricion:stable-tie');
    const tieRankingOne = expectSuccess(await call(firstModule.onRequest, db));
    const tieRankingTwo = expectSuccess(await call(firstModule.onRequest, db));
    const tiedNamesOne = tieRankingOne.ranking.filter((entry) => ['Alfa Tie', 'Beta Tie'].includes(entry.displayName)).map((entry) => entry.displayName);
    const tiedNamesTwo = tieRankingTwo.ranking.filter((entry) => ['Alfa Tie', 'Beta Tie'].includes(entry.displayName)).map((entry) => entry.displayName);
    assert.deepEqual(tiedNamesOne, ['Alfa Tie', 'Beta Tie'], 'Equal scores must use the stable identity-key tie-break.');
    assert.deepEqual(tiedNamesTwo, tiedNamesOne, 'Tie order changed between identical reads.');

    const limitedEnrollment = expectSuccess(await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: enrollPayload(IDS.limited, 'Limite Semanal', 'LIMIT032'),
      ip: '203.0.113.23'
    }), 201);
    const invalidTotal = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.limited, limitedEnrollment.accessToken, 'too-large', 51, 51),
      ip: '203.0.113.24'
    });
    expectFailure(invalidTotal, 400, 'invalid_score');
    for (let index = 0; index < 32; index += 1) {
      const allowed = await call(firstModule.onRequest, db, {
        method: 'POST',
        payload: scorePayload(IDS.limited, limitedEnrollment.accessToken, `limit-${String(index).padStart(2, '0')}`, 1, 1),
        ip: '203.0.113.24'
      });
      expectSuccess(allowed);
    }
    const weeklyLimit = await call(firstModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.limited, limitedEnrollment.accessToken, 'limit-32', 1, 1),
      ip: '203.0.113.24'
    });
    expectFailure(weeklyLimit, 429, 'weekly_limit');
    assert.equal(scoreRows(db.database, IDS.limited).length, 32);

    const beforeRestart = {
      participants: db.database.prepare(`SELECT COUNT(*) AS count FROM community_participants`).get().count,
      scores: db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores`).get().count,
      legacy: db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores WHERE player_id=?`).get(IDS.legacy).count,
      tiedNames: tiedNamesOne
    };
    db.close();
    db = new D1DatabaseMock(databasePath);
    const deployedModule = await loadHandler(`community-deployed-${Date.now()}`);
    const afterRestart = expectSuccess(await call(deployedModule.onRequest, db, {
      query: `?class=s4-e&player=${IDS.main}`,
      ip: '198.51.100.90'
    }));
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_participants`).get().count, beforeRestart.participants);
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores`).get().count, beforeRestart.scores);
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM community_scores WHERE player_id=?`).get(IDS.legacy).count, beforeRestart.legacy);
    const restartedTies = afterRestart.ranking.filter((entry) => ['Alfa Tie', 'Beta Tie'].includes(entry.displayName)).map((entry) => entry.displayName);
    assert.deepEqual(restartedTies, beforeRestart.tiedNames);
    const durableToken = expectSuccess(await call(deployedModule.onRequest, db, {
      method: 'POST',
      payload: scorePayload(IDS.main, rotated.accessToken, 'best-score', 7, 10),
      ip: '198.51.100.91'
    }));
    assert.equal(durableToken.saved, false);
    assert.deepEqual(durableToken.best, { correct: 9, total: 10, percentage: 90 });
    const durableLegacy = afterRestart.ranking.find((entry) => entry.displayName === 'Perfil Legacy Confirmado');
    assert.equal(durableLegacy?.verificationStatus, 'pending');
    assert.equal(durableLegacy?.studentIdMasked, '•••• 7788');

    console.log('Community ranking validation OK: S4-E identity enrollment, masked catraca, token rotation, score authorization, best-score rules, limits, stable ties, legacy migration and file persistence.');
  } finally {
    if (db) {
      try { db.close(); } catch {}
    }
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
