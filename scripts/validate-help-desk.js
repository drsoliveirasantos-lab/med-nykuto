#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'functions/api/help-desk.js');
const ORIGIN = 'https://med.nykuto.com';
const S4_SUPPORT = '+595981000111';
const S3_SUPPORT = '+595982000222';
const ENV_SUPPORT = '+595983000333';

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

function loadHandler(label) {
  assert.equal(fs.existsSync(sourcePath), true, 'functions/api/help-desk.js is missing.');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${encodeURIComponent(label)}`;
  return import(moduleUrl);
}

function validPayload(overrides = {}) {
  return {
    requestId: 'request-fixture-00000001',
    class: 's4-e',
    role: 'student',
    category: 'bug',
    subject: 'Fisiología',
    location: 'study',
    pagePath: '/comunidade.html?course=fisiologia#ranking',
    name: 'Estudiante Fixture',
    replyContact: 'fixture.student@example.test',
    message: 'La página de entrenamiento no abre desde mi teléfono.',
    website: '',
    ...overrides
  };
}

async function request(handler, db, {
  method = 'POST',
  query = '',
  payload = validPayload(),
  rawBody,
  contentType = 'application/json',
  origin = ORIGIN,
  ip = '203.0.113.42',
  extraEnv = {},
  extraHeaders = {}
} = {}) {
  const headers = { ...extraHeaders };
  if (contentType !== null) headers['content-type'] = contentType;
  if (origin !== null) headers.origin = origin;
  if (ip !== null) headers['CF-Connecting-IP'] = ip;
  const body = method === 'POST'
    ? (rawBody !== undefined ? rawBody : JSON.stringify(payload))
    : undefined;
  const webRequest = new Request(`${ORIGIN}/api/help-desk${query}`, { method, headers, body });
  const response = await handler({
    request: webRequest,
    env: {
      MED_NYKUTO_DB: db,
      MED_NYKUTO_RATE_SALT: 'help-desk-test-rate-salt',
      MED_NYKUTO_SUPPORT_WHATSAPP: ENV_SUPPORT,
      ...extraEnv
    }
  });
  let result = null;
  if (response.status !== 204) result = await response.json();
  return { response, body: result };
}

function expectFailure(result, status, code) {
  assert.equal(result.response.status, status, JSON.stringify(result.body));
  assert.equal(result.body?.ok, false, JSON.stringify(result.body));
  assert.equal(result.body?.code, code, JSON.stringify(result.body));
}

function countRows(sqlite, table) {
  return Number(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count) || 0;
}

function seedLegacyDatabase(sqlite) {
  const current = '2026-08-01T12:00:00.000Z';
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
    CREATE TABLE hub_support_tickets (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL DEFAULT ''
    );
  `);
  sqlite.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`)
    .run('s4-e', 's4-e', 'Medicina · 4.º E', 4, 'E', 'midnight-gold', '', current, current);
  sqlite.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`)
    .run('s3-a', 's3-a', 'Medicina · 3.º A', 3, 'A', 'midnight-gold', '', current, current);
  sqlite.prepare(`INSERT INTO hub_support_tickets (id,message) VALUES (?,?)`)
    .run('legacy-help-ticket-1', 'Mensaje legacy que debe sobrevivir a la migración.');
}

async function main() {
  const frontendSource = fs.readFileSync(path.join(root, 'help-desk-v479.js'), 'utf8');
  const frontendStyle = fs.readFileSync(path.join(root, 'help-desk-v479.css'), 'utf8');
  assert.match(frontendSource, /data-helpdesk-form/);
  assert.match(frontendSource, /\/api\/help-desk/);
  assert.match(frontendSource, /value\(form,['"]role['"]\)===['"]future-delegate['"]\|\|value\(form,['"]category['"]\)===['"]delegate-access['"]/);
  assert.match(frontendSource, /mailto:['"]?\+SUPPORT_EMAIL/);
  assert.match(frontendSource, /contact@nykuto\.com/);
  assert.match(frontendSource, /deberás revisarlo y enviarlo tú/);
  assert.doesNotMatch(frontendSource, /(?:correo|email|WhatsApp) (?:fue )?enviado/iu);
  assert.match(frontendStyle, /\.helpdesk-fab/);
  for (const file of [
    'index.html', 'matieres.html', 'matiere.html', 'modules.html', 'module.html',
    'qcm.html', 'cas-cliniques.html', 'vrai-faux.html', 'erreurs.html', 'examen.html',
    'clase.html', 'comunidade.html', 'contact.html', 'turma-shell/index.html', 'gestion-shell/index.html'
  ]) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /help-desk-v479\.css\?v=481/, `${file} is missing the Help Desk stylesheet.`);
    assert.match(html, /help-desk-v479\.js\?v=481/, `${file} is missing the Help Desk client.`);
  }
  const contactPage = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
  assert.match(contactPage, /data-helpdesk-form/);
  assert.match(contactPage, /obligatorios para pedir acceso de delegado/i);
  assert.doesNotMatch(contactPage, /formulario aún no tiene envío real/i);
  const legalPage = fs.readFileSync(path.join(root, 'mentions.html'), 'utf8');
  assert.match(legalPage, /WhatsApp y el correo no se envían automáticamente/i);

  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'med-nykuto-help-desk-'));
  const databasePath = path.join(tempDirectory, 'help-desk.sqlite');
  let db = null;
  try {
    db = new D1DatabaseMock(databasePath);
    seedLegacyDatabase(db.database);
    const firstModule = await loadHandler(`first-${Date.now()}`);

    const first = await request(firstModule.onRequest, db, {
      query: '?class=s4-e',
      payload: validPayload(),
      extraEnv: { MED_NYKUTO_SUPPORT_WHATSAPP: ENV_SUPPORT }
    });
    assert.equal(first.response.status, 200, JSON.stringify(first.body));
    assert.equal(first.body?.ok, true, JSON.stringify(first.body));
    assert.match(first.body?.reference || '', /^HD-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    const migratedColumns = db.database.prepare(`PRAGMA table_info(hub_support_tickets)`).all().map((column) => column.name);
    for (const column of [
      'id', 'class_id', 'public_reference', 'request_id_hash', 'role', 'category', 'subject',
      'location', 'page_path', 'requester_name', 'reply_contact', 'message', 'status',
      'submitter_hash', 'created_at', 'updated_at'
    ]) {
      assert.equal(migratedColumns.includes(column), true, `Legacy help-desk migration did not add ${column}.`);
    }
    const supportColumn = db.database.prepare(`PRAGMA table_info(hub_classes)`).all().find((column) => column.name === 'support_whatsapp');
    assert.ok(supportColumn, 'Legacy hub_classes migration did not add support_whatsapp.');
    db.database.prepare(`UPDATE hub_classes SET support_whatsapp=? WHERE id='s4-e'`).run(S4_SUPPORT);
    db.database.prepare(`UPDATE hub_classes SET support_whatsapp=? WHERE id='s3-a'`).run(S3_SUPPORT);

    const legacy = db.database.prepare(`SELECT id,message,class_id FROM hub_support_tickets WHERE id=?`).get('legacy-help-ticket-1');
    assert.equal(legacy?.message, 'Mensaje legacy que debe sobrevivir a la migración.');
    assert.equal(legacy?.class_id, 's4-e');
    assert.equal(countRows(db.database, 'hub_support_tickets'), 2, 'One successful request must create exactly one ticket alongside the legacy row.');

    const saved = db.database.prepare(`SELECT * FROM hub_support_tickets WHERE id<>?`).get('legacy-help-ticket-1');
    assert.deepEqual(
      {
        classId: saved.class_id,
        role: saved.role,
        category: saved.category,
        subject: saved.subject,
        location: saved.location,
        pagePath: saved.page_path,
        requesterName: saved.requester_name,
        replyContact: saved.reply_contact,
        message: saved.message,
        status: saved.status
      },
      {
        classId: 's4-e',
        role: 'student',
        category: 'bug',
        subject: 'Fisiología',
        location: 'study',
        pagePath: '/comunidade.html?course=fisiologia#ranking',
        requesterName: 'Estudiante Fixture',
        replyContact: 'fixture.student@example.test',
        message: 'La página de entrenamiento no abre desde mi teléfono.',
        status: 'open'
      }
    );
    assert.notEqual(saved.submitter_hash, '203.0.113.42');
    assert.match(saved.submitter_hash, /^[0-9a-f]{64}$/);

    const replay = await request(firstModule.onRequest, db, {
      query: '?class=s4-e',
      payload: validPayload({ message: 'Este cambio no debe crear una segunda fila para el mismo requestId.' })
    });
    assert.equal(replay.response.status, 200, JSON.stringify(replay.body));
    assert.equal(replay.body?.reference, first.body.reference);
    assert.equal(countRows(db.database, 'hub_support_tickets'), 2, 'Idempotent replay created a duplicate ticket.');

    const beforeConcurrentReplay = countRows(db.database, 'hub_support_tickets');
    const concurrentPayload = validPayload({ requestId: 'request-concurrent-replay-1' });
    const concurrent = await Promise.all([
      request(firstModule.onRequest, db, { payload: concurrentPayload, ip: '203.0.113.43' }),
      request(firstModule.onRequest, db, { payload: concurrentPayload, ip: '203.0.113.43' })
    ]);
    assert.equal(concurrent[0].response.status, 200, JSON.stringify(concurrent[0].body));
    assert.equal(concurrent[1].response.status, 200, JSON.stringify(concurrent[1].body));
    assert.equal(concurrent[0].body?.reference, concurrent[1].body?.reference);
    assert.equal(countRows(db.database, 'hub_support_tickets'), beforeConcurrentReplay + 1, 'Concurrent idempotent submissions created more than one ticket.');

    const badOrigin = await request(firstModule.onRequest, db, {
      payload: validPayload({ requestId: 'request-bad-origin-0001' }),
      origin: 'https://attacker.example'
    });
    expectFailure(badOrigin, 403, 'origin_rejected');

    const badContentType = await request(firstModule.onRequest, db, {
      rawBody: JSON.stringify(validPayload({ requestId: 'request-bad-type-000001' })),
      contentType: 'text/plain'
    });
    expectFailure(badContentType, 400, 'invalid_content_type');

    const invalidJson = await request(firstModule.onRequest, db, {
      rawBody: '{not-json',
      contentType: 'application/json'
    });
    expectFailure(invalidJson, 400, 'invalid_json');

    const oversized = await request(firstModule.onRequest, db, {
      rawBody: JSON.stringify(validPayload({
        requestId: 'request-oversized-000001',
        message: 'x'.repeat(17 * 1024)
      }))
    });
    expectFailure(oversized, 413, 'payload_too_large');

    const invalidCases = [
      ['invalid_field_type', { requestId: 'request-invalid-field-type', name: { nested: 'not text' } }],
      ['invalid_request_id', { requestId: 'short' }],
      ['invalid_role', { requestId: 'request-invalid-role-001', role: 'owner' }],
      ['invalid_category', { requestId: 'request-invalid-cat-0001', category: 'payment' }],
      ['invalid_location', { requestId: 'request-invalid-loc-0001', location: 'hospital' }],
      ['invalid_subject', { requestId: 'request-long-subject-001', subject: 's'.repeat(101) }],
      ['invalid_name', { requestId: 'request-long-name-000001', name: 'n'.repeat(101) }],
      ['invalid_reply_contact', { requestId: 'request-bad-contact-001', replyContact: 'not a contact' }],
      ['invalid_reply_contact', { requestId: 'request-bad-phone-zero', replyContact: '0000000' }],
      ['invalid_reply_contact', { requestId: 'request-bad-phone-plus', replyContact: '123+4567' }],
      ['invalid_message', { requestId: 'request-short-message-01', message: 'too short' }],
      ['invalid_message', { requestId: 'request-long-message-0001', message: 'm'.repeat(3001) }],
      ['invalid_page_path', { requestId: 'request-bad-page-path-01', pagePath: 'https://attacker.example/private' }]
    ];
    for (const [code, override] of invalidCases) {
      const result = await request(firstModule.onRequest, db, { payload: validPayload(override) });
      expectFailure(result, 400, code);
    }

    const delegateRequiredCases = [
      ['delegate_name_required', {
        requestId: 'request-future-no-name-01',
        role: 'future-delegate',
        category: 'bug',
        name: '',
        replyContact: 'future.delegate@example.test'
      }],
      ['delegate_reply_contact_required', {
        requestId: 'request-future-no-reply-1',
        role: 'future-delegate',
        category: 'bug',
        name: 'Futura Delegada',
        replyContact: ''
      }],
      ['delegate_name_required', {
        requestId: 'request-access-no-name-01',
        role: 'student',
        category: 'delegate-access',
        name: '',
        replyContact: 'access.student@example.test'
      }],
      ['invalid_reply_contact', {
        requestId: 'request-access-bad-reply',
        role: 'student',
        category: 'delegate-access',
        name: 'Estudiante Acceso',
        replyContact: 'contacto inválido'
      }]
    ];
    for (const [code, override] of delegateRequiredCases) {
      const result = await request(firstModule.onRequest, db, { payload: validPayload(override) });
      expectFailure(result, 400, code);
      assert.match(result.body?.error || '', /nombre|correo|WhatsApp|dígitos/i, JSON.stringify(result.body));
    }

    const futureDelegate = await request(firstModule.onRequest, db, {
      payload: validPayload({
        requestId: 'request-future-valid-phone',
        role: 'future-delegate',
        category: 'bug',
        name: 'Futura Delegada',
        replyContact: 'WhatsApp: +595 981 123 456'
      }),
      ip: '203.0.113.60'
    });
    assert.equal(futureDelegate.response.status, 200, JSON.stringify(futureDelegate.body));

    const delegateAccess = await request(firstModule.onRequest, db, {
      payload: validPayload({
        requestId: 'request-access-valid-email',
        role: 'student',
        category: 'delegate-access',
        name: 'Estudiante Acceso',
        replyContact: 'access.student@example.test'
      }),
      ip: '203.0.113.61'
    });
    assert.equal(delegateAccess.response.status, 200, JSON.stringify(delegateAccess.body));

    const generalAnonymous = await request(firstModule.onRequest, db, {
      payload: validPayload({
        requestId: 'request-general-anonymous',
        role: 'student',
        category: 'subject-help',
        name: '',
        replyContact: ''
      }),
      ip: '203.0.113.62'
    });
    assert.equal(generalAnonymous.response.status, 200, JSON.stringify(generalAnonymous.body));

    const delegateRows = db.database.prepare(`SELECT role,category,requester_name,reply_contact FROM hub_support_tickets WHERE public_reference IN (?,?) ORDER BY role`)
      .all(futureDelegate.body.reference, delegateAccess.body.reference);
    assert.equal(delegateRows.length, 2);
    assert.equal(delegateRows.every((row) => Boolean(row.requester_name && row.reply_contact)), true, 'A delegate ticket was stored without identity and reply contact.');

    const beforeHoneypot = countRows(db.database, 'hub_support_tickets');
    const honeypot = await request(firstModule.onRequest, db, {
      payload: validPayload({ requestId: 'request-honeypot-000001', website: 'https://spam.example' })
    });
    assert.equal(honeypot.response.status, 200, JSON.stringify(honeypot.body));
    assert.equal(honeypot.body?.ok, true);
    assert.match(honeypot.body?.reference || '', /^HD-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    assert.equal(countRows(db.database, 'hub_support_tickets'), beforeHoneypot, 'Honeypot submission was persisted.');

    const sharedRequestId = 'request-shared-tenants-0001';
    const s4Tenant = await request(firstModule.onRequest, db, {
      query: '?class=s4-e',
      payload: validPayload({ requestId: sharedRequestId, class: 's4-e' }),
      ip: '203.0.113.50'
    });
    const s3Tenant = await request(firstModule.onRequest, db, {
      query: '?class=s3-a',
      payload: validPayload({ requestId: sharedRequestId, class: 's3-a' }),
      ip: '203.0.113.50'
    });
    assert.equal(s4Tenant.response.status, 200, JSON.stringify(s4Tenant.body));
    assert.equal(s3Tenant.response.status, 200, JSON.stringify(s3Tenant.body));
    assert.equal(s4Tenant.body?.supportWhatsapp, S4_SUPPORT);
    assert.equal(s3Tenant.body?.supportWhatsapp, S3_SUPPORT);
    assert.notEqual(s4Tenant.body?.reference, s3Tenant.body?.reference);
    const tenantRows = db.database.prepare(`SELECT class_id,request_id_hash FROM hub_support_tickets WHERE public_reference IN (?,?) ORDER BY class_id`)
      .all(s4Tenant.body.reference, s3Tenant.body.reference);
    assert.deepEqual(tenantRows.map((row) => row.class_id), ['s3-a', 's4-e']);
    assert.notEqual(tenantRows[0].request_id_hash, tenantRows[1].request_id_hash, 'Request id hashes must be tenant-separated.');

    const mismatch = await request(firstModule.onRequest, db, {
      query: '?class=s4-e',
      payload: validPayload({ requestId: 'request-class-mismatch-01', class: 's3-a' })
    });
    expectFailure(mismatch, 400, 'class_mismatch');
    const unknown = await request(firstModule.onRequest, db, {
      query: '?class=missing-class',
      payload: validPayload({ requestId: 'request-unknown-class-001', class: 'missing-class' })
    });
    expectFailure(unknown, 404, 'class_not_found');

    db.database.prepare(`UPDATE hub_classes SET support_whatsapp='invalid' WHERE id='s3-a'`).run();
    const supportFallback = await request(firstModule.onRequest, db, {
      query: '?class=s3-a',
      payload: validPayload({ requestId: 'request-support-fallback-1', class: 's3-a' }),
      ip: '203.0.113.51'
    });
    assert.equal(supportFallback.response.status, 200, JSON.stringify(supportFallback.body));
    assert.equal(supportFallback.body?.supportWhatsapp, ENV_SUPPORT);

    const rateIp = '198.51.100.77';
    for (let index = 0; index < 12; index += 1) {
      const allowed = await request(firstModule.onRequest, db, {
        payload: validPayload({ requestId: `request-rate-limit-${String(index).padStart(4, '0')}` }),
        ip: rateIp
      });
      assert.equal(allowed.response.status, 200, `Rate limit rejected write ${index + 1}: ${JSON.stringify(allowed.body)}`);
    }
    const limited = await request(firstModule.onRequest, db, {
      payload: validPayload({ requestId: 'request-rate-limit-blocked' }),
      ip: rateIp
    });
    expectFailure(limited, 429, 'rate_limited');
    assert.match(limited.response.headers.get('retry-after') || '', /^\d+$/);

    const serializedPrivateRows = JSON.stringify({
      tickets: db.database.prepare(`SELECT * FROM hub_support_tickets`).all(),
      rateLimits: db.database.prepare(`SELECT * FROM hub_rate_limits`).all()
    });
    assert.equal(serializedPrivateRows.includes('203.0.113.42'), false, 'A raw submitter IP was persisted.');
    assert.equal(serializedPrivateRows.includes(rateIp), false, 'A raw rate-limit IP was persisted.');

    const beforeReinitialize = countRows(db.database, 'hub_support_tickets');
    const secondModule = await loadHandler(`second-${Date.now()}`);
    const afterSecondInitialization = await request(secondModule.onRequest, db, {
      payload: validPayload({ requestId: 'request-double-init-0001' }),
      ip: '203.0.113.90'
    });
    assert.equal(afterSecondInitialization.response.status, 200, JSON.stringify(afterSecondInitialization.body));
    assert.equal(countRows(db.database, 'hub_support_tickets'), beforeReinitialize + 1);
    assert.equal(db.database.prepare(`SELECT COUNT(*) AS count FROM hub_support_tickets WHERE id=?`).get('legacy-help-ticket-1').count, 1);
    const durableReference = afterSecondInitialization.body.reference;

    db.close();
    db = new D1DatabaseMock(databasePath);
    const deployedModule = await loadHandler(`deployment-${Date.now()}`);
    const afterDeployment = await request(deployedModule.onRequest, db, {
      payload: validPayload({ requestId: 'request-double-init-0001' }),
      ip: '203.0.113.90'
    });
    assert.equal(afterDeployment.response.status, 200, JSON.stringify(afterDeployment.body));
    assert.equal(afterDeployment.body?.reference, durableReference, 'A simulated deployment lost the idempotent ticket reference.');
    assert.equal(countRows(db.database, 'hub_support_tickets'), beforeReinitialize + 1, 'A simulated deployment duplicated or lost a ticket.');
    assert.equal(db.database.prepare(`SELECT message FROM hub_support_tickets WHERE id=?`).get('legacy-help-ticket-1')?.message, 'Mensaje legacy que debe sobrevivir a la migración.');

    console.log('Help Desk validation OK: additive migration, durable idempotence, delegate contact requirements, mail/WhatsApp draft honesty, honeypot, rate limit, tenant isolation and IP hashing.');
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
