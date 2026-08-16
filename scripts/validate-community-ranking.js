const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');

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
    return this.database.prepare(this.sql).run(...this.values);
  }
}

class D1DatabaseMock {
  constructor() {
    this.database = new DatabaseSync(':memory:');
  }

  prepare(sql) {
    return new D1StatementMock(this.database, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }
}

function score(playerId, nickname, courseId, moduleId, correct, total) {
  return { playerId, nickname, courseId, moduleId, correct, total };
}

async function call(onRequest, db, method, payload, query = '') {
  const request = new Request(`https://med.nykuto.com/api/community${query}`, {
    method,
    headers: method === 'POST'
      ? { 'content-type': 'application/json', origin: 'https://med.nykuto.com' }
      : undefined,
    body: method === 'POST' ? JSON.stringify(payload) : undefined
  });
  const response = await onRequest({ request, env: { MED_NYKUTO_DB: db } });
  const body = await response.json();
  assert.equal(response.ok, true, JSON.stringify(body));
  return body;
}

async function main() {
  const source = fs.readFileSync(path.join(root, 'functions/api/community.js'), 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const { onRequest } = await import(moduleUrl);
  const db = new D1DatabaseMock();

  const firstId = '11111111-1111-4111-8111-111111111111';
  const currentId = '22222222-2222-4222-8222-222222222222';
  const thirdId = '33333333-3333-4333-8333-333333333333';
  const fourthId = '44444444-4444-4444-8444-444444444444';
  const fifthId = '55555555-5555-4555-8555-555555555555';

  await call(onRequest, db, 'POST', score(firstId, 'Nykuto', 'fisiologia', 'fisiologia-qcm', 10, 20));
  await call(onRequest, db, 'POST', score(currentId, 'Nykuto', 'nutricion', 'nutricion-cases', 9, 10));

  const merged = await call(
    onRequest,
    db,
    'GET',
    null,
    `?player=${encodeURIComponent(currentId)}&nickname=${encodeURIComponent('Nykuto')}`
  );
  assert.equal(merged.ranking.length, 1);
  assert.deepEqual(
    { nickname: merged.ranking[0].nickname, points: merged.ranking[0].points, questions: merged.ranking[0].questions, challenges: merged.ranking[0].challenges, isCurrent: merged.ranking[0].isCurrent },
    { nickname: 'Nykuto', points: 19, questions: 30, challenges: 2, isCurrent: true }
  );
  assert.deepEqual(
    { participants: merged.challenge.participants, records: merged.challenge.records, points: merged.challenge.points, questions: merged.challenge.questions },
    { participants: 1, records: 2, points: 19, questions: 30 }
  );

  await call(onRequest, db, 'POST', score(thirdId, 'Mango', 'nutricion', 'nutricion-qcm', 10, 20));
  const improved = await call(onRequest, db, 'POST', score(fourthId, 'Mango', 'nutricion', 'nutricion-qcm', 9, 10));
  assert.equal(improved.saved, true);
  const kept = await call(onRequest, db, 'POST', score(fifthId, 'Mango', 'nutricion', 'nutricion-qcm', 8, 10));
  assert.equal(kept.saved, false);
  assert.deepEqual(kept.best, { correct: 9, total: 10, percentage: 90 });

  const afterRetry = await call(onRequest, db, 'GET', null, '?nickname=Mango');
  const mango = afterRetry.ranking.find((entry) => entry.nickname === 'Mango');
  assert.deepEqual(
    { points: mango.points, questions: mango.questions, challenges: mango.challenges, isCurrent: mango.isCurrent },
    { points: 9, questions: 10, challenges: 1, isCurrent: true }
  );

  console.log('Community ranking validation OK: same nickname merges anonymous browser IDs and keeps one best score per scope.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
