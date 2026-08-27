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

async function post(api, env, data, auth = {}, classRef = 's4-e') {
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
    request: new Request(`https://med.nykuto.com/api/class-hub?class=${encodeURIComponent(classRef)}${queryAction}`, { method: 'POST', headers, body: JSON.stringify(data) }),
    env,
    waitUntil() {}
  });
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
  return { status: response.status, body: await response.json(), setCookies };
}

function sessionAuthFromResponse(result) {
  const source = (result.setCookies || []).join('\n');
  const sessionToken = source.match(/__Host-med-nykuto-management=([a-f0-9]{64})/i)?.[1] || '';
  const csrfToken = source.match(/__Host-med-nykuto-management-csrf=([a-f0-9]{64})/i)?.[1] || '';
  assert.equal(sessionToken.length, 64, 'login did not set a 256-bit HttpOnly session cookie');
  assert.equal(csrfToken.length, 64, 'login did not set an independent 256-bit CSRF cookie');
  return { sessionToken, csrfToken };
}

async function get(api, env, resource = 'public', auth = {}, classRef = 's4-e') {
  const headers = new Headers();
  if (auth.bearer) headers.set('authorization', `Bearer ${auth.bearer}`);
  if (auth.sessionToken && auth.csrfToken) headers.set('cookie', `__Host-med-nykuto-management=${auth.sessionToken}; __Host-med-nykuto-management-csrf=${auth.csrfToken}`);
  const response = await api.onRequestGet({
    request: new Request(`https://med.nykuto.com/api/class-hub?class=${encodeURIComponent(classRef)}&resource=${encodeURIComponent(resource)}`, { headers }),
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
  const env = { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: ownerToken, MED_NYKUTO_RATE_SALT: 'content-api-rate-fixture', MED_NYKUTO_TEST_NOW: '2026-08-26T12:00:00.000Z' };
  const digest = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
  const created = '2026-08-26T12:00:00.000Z';

  try {
    const initialized = await get(api, env);
    assert.equal(initialized.status, 200, 'D1 schema initialization failed');

    const permanentPassword = 'Invitation-Delegate-2026!';
    const invitation = await post(api, env, { action: 'invite.create', label: 'Delegate signup fixture', hours: 168 }, ownerAuth);
    assert.equal(invitation.status, 201, 'the owner could not create a one-time delegate signup invitation');
    assert.equal(invitation.body.invitePath, `/gestion/s4-e#invite=${invitation.body.inviteToken}`, 'the invitation was not returned as a fragment-only signup path');
    const invitationClaim = await post(api, env, { action: 'invite.claim', inviteToken: invitation.body.inviteToken, name: 'Invited delegate fixture', email: 'INVITED.FIXTURE@example.test', password: permanentPassword });
    assert.deepEqual([invitationClaim.status, invitationClaim.body.passwordChangeRequired], [201, false], 'the invitation did not create a permanent delegate account');
    assert.equal(Object.hasOwn(invitationClaim.body, 'editorToken'), false, 'the signup response exposed a legacy bearer token');
    assert.equal(Object.hasOwn(invitationClaim.body, 'sessionToken'), false, 'the signup response exposed its session token in JSON');
    const invitationAuth = sessionAuthFromResponse(invitationClaim);
    const invitedCredential = db.database.prepare(`SELECT c.editor_id,c.email_normalized,c.must_change_password,c.temporary_expires_at,i.claimed_at,i.claimed_editor_id FROM hub_editor_credentials c JOIN hub_invites i ON i.class_id=c.class_id AND i.claimed_editor_id=c.editor_id WHERE c.class_id='s4-e' AND c.email_normalized='invited.fixture@example.test'`).get();
    assert.equal(invitedCredential.email_normalized, 'invited.fixture@example.test');
    assert.deepEqual([Number(invitedCredential.must_change_password), invitedCredential.temporary_expires_at], [0, null]);
    assert.equal(invitedCredential.claimed_editor_id, invitedCredential.editor_id, 'the invite CAS was not bound to the created editor');
    assert.ok(invitedCredential.claimed_at, 'the successfully used invitation was not marked as claimed');
    assert.equal((await get(api, env, 'session', invitationAuth)).status, 200, 'the invitation did not install an immediately usable secure session');
    const invitationReplay = await post(api, env, { action: 'invite.claim', inviteToken: invitation.body.inviteToken, name: 'Replay delegate', email: 'replay.fixture@example.test', password: permanentPassword });
    assert.deepEqual([invitationReplay.status, invitationReplay.body.code], [410, 'invite_expired'], 'a one-time invitation could be replayed');

    const duplicateEmailInvite = await post(api, env, { action: 'invite.create', label: 'Duplicate email rollback fixture', hours: 168 }, ownerAuth);
    const duplicateEmailClaim = await post(api, env, { action: 'invite.claim', inviteToken: duplicateEmailInvite.body.inviteToken, name: 'Duplicate email fixture', email: 'invited.fixture@example.test', password: permanentPassword });
    assert.deepEqual([duplicateEmailClaim.status, duplicateEmailClaim.body.code], [409, 'email_in_use']);
    const duplicateInviteRow = db.database.prepare(`SELECT claimed_at,claimed_editor_id FROM hub_invites WHERE id=?`).get(duplicateEmailInvite.body.id);
    assert.deepEqual([duplicateInviteRow.claimed_at, duplicateInviteRow.claimed_editor_id], [null, null], 'a duplicate email consumed the invitation');
    const duplicateRetry = await post(api, env, { action: 'invite.claim', inviteToken: duplicateEmailInvite.body.inviteToken, name: 'Rollback retry fixture', email: 'rollback.retry@example.test', password: permanentPassword });
    assert.equal(duplicateRetry.status, 201, 'an invitation rejected for duplicate email could not be retried safely');

    const weakInvite = await post(api, env, { action: 'invite.create', label: 'Weak password fixture', hours: 168 }, ownerAuth);
    const weakClaim = await post(api, env, { action: 'invite.claim', inviteToken: weakInvite.body.inviteToken, name: 'Weak password fixture', email: 'weak.fixture@example.test', password: '123456789012' });
    assert.deepEqual([weakClaim.status, weakClaim.body.code], [400, 'weak_password']);
    assert.deepEqual(Object.values(db.database.prepare(`SELECT claimed_at,claimed_editor_id FROM hub_invites WHERE id=?`).get(weakInvite.body.id)), [null, null], 'a weak password consumed the invitation');

    db.database.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,?,?)`).run('legacy-editor', 's4-e', 'Legacy fixture', digest(legacyToken), 'active', created);
    db.database.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,?,?)`).run('session-editor', 's4-e', 'Session fixture', digest('unused-session-token'), 'active', created);
    db.database.prepare(`INSERT INTO hub_editor_credentials (editor_id,class_id,email_normalized,password_hash,password_salt,password_algorithm,password_iterations,password_version,must_change_password,temporary_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'pbkdf2-sha256',100000,1,0,NULL,?,?)`).run('session-editor', 's4-e', 'session.fixture@example.test', '0'.repeat(64), '1'.repeat(32), created, created);
    db.database.prepare(`INSERT INTO hub_editor_sessions (token_hash,class_id,editor_id,csrf_hash,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?,?)`).run(digest(sessionToken), 's4-e', 'session-editor', digest(csrfToken), created, '2099-01-01T00:00:00.000Z', created);

    const sessionPlayerId = '11111111-1111-4111-8111-111111111111';
    const legacyPlayerId = '22222222-2222-4222-8222-222222222222';
    const otherClassPlayerId = '33333333-3333-4333-8333-333333333333';
    db.database.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES ('s5-a','s5-a','Medicina · 5.º A',5,'A','midnight-gold','','active',?,?)`).run(created, created);
    const participantInsert = db.database.prepare(`INSERT INTO community_participants (class_id,player_id,display_name,student_id_hash,student_id_last4,student_id_public,access_token_hash,verification_status,consented_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    participantInsert.run('s4-e', sessionPlayerId, 'Ana Moderación', 'student-hash-secret-one', '1001', 'CAT1001', 'access-token-hash-secret-one', 'pending', created, created, created);
    participantInsert.run('s4-e', legacyPlayerId, 'Luis Moderación', 'student-hash-secret-two', '1002', 'CAT1002', 'access-token-hash-secret-two', 'pending', created, created, created);
    participantInsert.run('s5-a', otherClassPlayerId, 'Otra Turma', 'student-hash-secret-other', '9001', 'CAT9001', 'access-token-hash-secret-other', 'pending', created, created, created);
    const scoreInsert = db.database.prepare(`INSERT INTO community_scores (class_id,cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at,write_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`);
    scoreInsert.run('s4-e', 'semester-4-group-e', '2026-08-24', sessionPlayerId, 'Ana Moderación', 'fisiologia', 'module-1', 'fisiologia:module-1:qcm', 8, 10, 80, created, created);
    scoreInsert.run('s4-e', 'semester-4-group-e', '2026-08-24', legacyPlayerId, 'Luis Moderación', 'bioquimica', 'module-1', 'bioquimica:module-1:qcm', 7, 10, 70, created, created);

    const challengeAdmin = await get(api, env, 'admin', sessionAuth);
    assert.equal(challengeAdmin.status, 200, 'an ordinary authenticated delegate could not open the challenge review queue');
    assert.equal(challengeAdmin.body.actor?.capabilities?.reviewChallenge, true, 'the authenticated delegate did not receive the narrow review capability');
    assert.equal(challengeAdmin.body.actor?.capabilities?.manageContent, false, 'challenge review accidentally granted content management');
    assert.equal(challengeAdmin.body.actor?.capabilities?.manageInvites, false, 'an ordinary delegate accidentally received invitation management');
    const ordinaryCrossClass = await get(api, env, 'admin', sessionAuth, 's5-a');
    assert.deepEqual([ordinaryCrossClass.status, ordinaryCrossClass.body.code], [401, 'authentication_required'], 'an ordinary class session crossed into another class');
    const ordinaryCrossWrite = await post(api, env, { action: 'date.upsert', label: 'No cruzar', startsAt: '2026-09-02T08:00:00-03:00' }, sessionAuth, 's5-a');
    assert.deepEqual([ordinaryCrossWrite.status, ordinaryCrossWrite.body.code], [401, 'authentication_required'], 'an ordinary class session mutated another class');
    assert.equal(Number(db.database.prepare(`SELECT COUNT(*) AS count FROM hub_dates WHERE class_id='s5-a' AND label='No cruzar'`).get().count), 0, 'a rejected cross-class write persisted');
    assert.equal(challengeAdmin.body.challengeReview?.pendingCount, 2);
    assert.deepEqual(challengeAdmin.body.challengeReview?.week, { key: '2026-08-24', start: '2026-08-24', end: '2026-08-30', timeZone: 'America/Asuncion' });
    const serializedChallengeAdmin = JSON.stringify(challengeAdmin.body);
    [sessionPlayerId, legacyPlayerId, 'student-hash-secret-one', 'student-hash-secret-two', 'access-token-hash-secret-one', 'access-token-hash-secret-two'].forEach((secret) => assert.equal(serializedChallengeAdmin.includes(secret), false, `challenge review leaked ${secret}`));
    const sessionCandidate = challengeAdmin.body.challengeReview.candidates.find((candidate) => candidate.fullName === 'Ana Moderación');
    const legacyCandidate = challengeAdmin.body.challengeReview.candidates.find((candidate) => candidate.fullName === 'Luis Moderación');
    assert.deepEqual([sessionCandidate.status, sessionCandidate.points, sessionCandidate.questions, sessionCandidate.catraca], ['pending', 8, 10, 'CAT1001']);
    assert.match(sessionCandidate.reviewId, /^[a-f0-9]{64}$/);
    assert.match(legacyCandidate.reviewId, /^[a-f0-9]{64}$/);
    assert.equal(Object.hasOwn(sessionCandidate, 'playerId'), false, 'the review queue exposed the internal player id');

    const sessionInviteDenied = await post(api, env, { action: 'invite.create', label: 'Unauthorized invitation fixture', hours: 24 }, sessionAuth);
    assert.deepEqual([sessionInviteDenied.status, sessionInviteDenied.body.code], [403, 'permission_denied'], 'an ordinary delegate created an invitation without invite.manage');

    const challengeCsrfDenied = await post(api, env, { action: 'challenge.participant.review', reviewId: sessionCandidate.reviewId, status: 'verified', expectedStatus: 'pending' }, { sessionToken });
    assert.deepEqual([challengeCsrfDenied.status, challengeCsrfDenied.body.code], [403, 'csrf_rejected']);
    assert.equal(db.database.prepare(`SELECT verification_status FROM community_participants WHERE class_id='s4-e' AND player_id=?`).get(sessionPlayerId).verification_status, 'pending', 'CSRF-rejected challenge review changed the participant');

    const sessionReview = await post(api, env, { action: 'challenge.participant.review', reviewId: sessionCandidate.reviewId, status: 'verified', expectedStatus: 'pending' }, sessionAuth);
    assert.deepEqual([sessionReview.status, sessionReview.body.status], [200, 'verified'], 'an ordinary session delegate could not validate a candidature');
    const staleReview = await post(api, env, { action: 'challenge.participant.review', reviewId: sessionCandidate.reviewId, status: 'rejected', expectedStatus: 'pending' }, sessionAuth);
    assert.deepEqual([staleReview.status, staleReview.body.code, staleReview.body.currentStatus], [409, 'challenge_status_conflict', 'verified']);
    const legacyReview = await post(api, env, { action: 'challenge.participant.review', reviewId: legacyCandidate.reviewId, status: 'rejected', expectedStatus: 'pending' }, { bearer: legacyToken });
    assert.deepEqual([legacyReview.status, legacyReview.body.status], [200, 'rejected'], 'an authenticated legacy class editor could not reject a candidature');

    const crossClassReviewId = crypto.createHmac('sha256', ownerToken).update(`challenge-review:v1:s5-a:${otherClassPlayerId}`).digest('hex');
    const crossClassReview = await post(api, env, { action: 'challenge.participant.review', reviewId: crossClassReviewId, status: 'verified', expectedStatus: 'pending' }, ownerAuth);
    assert.deepEqual([crossClassReview.status, crossClassReview.body.code], [404, 'challenge_candidate_missing'], 'a review id from another class crossed the tenant boundary');
    assert.equal(db.database.prepare(`SELECT verification_status FROM community_participants WHERE class_id='s5-a' AND player_id=?`).get(otherClassPlayerId).verification_status, 'pending');
    const challengeAudit = db.database.prepare(`SELECT entity_id,details FROM hub_audit WHERE class_id='s4-e' AND action='challenge.participant.review' ORDER BY id LIMIT 1`).get();
    assert.equal(challengeAudit.entity_id, sessionCandidate.reviewId);
    assert.deepEqual(JSON.parse(challengeAudit.details), { previousStatus: 'pending', status: 'verified' });
    assert.equal(`${challengeAudit.entity_id}${challengeAudit.details}`.includes(sessionPlayerId), false, 'challenge audit stored the private player id');

    const multiDevicePassword = 'Fixture-Multi-Device-2026!';
    const multiDeviceSalt = '2'.repeat(32);
    const multiDeviceHash = crypto.pbkdf2Sync(multiDevicePassword, Buffer.from(multiDeviceSalt, 'hex'), 100000, 32, 'sha256').toString('hex');
    db.database.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,?,?)`).run('multi-device-editor', 's4-e', 'Multi-device fixture', digest('unused-multi-device-token'), 'active', created);
    db.database.prepare(`INSERT INTO hub_editor_credentials (editor_id,class_id,email_normalized,password_hash,password_salt,password_algorithm,password_iterations,password_version,must_change_password,temporary_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'pbkdf2-sha256',100000,1,0,NULL,?,?)`).run('multi-device-editor', 's4-e', 'multi.device@example.test', multiDeviceHash, multiDeviceSalt, created, created);

    const tabletLogin = await post(api, env, { action: 'auth.login', email: 'multi.device@example.test', password: multiDevicePassword });
    const phoneLogin = await post(api, env, { action: 'auth.login', email: 'MULTI.DEVICE@example.test', password: multiDevicePassword });
    assert.deepEqual([tabletLogin.status, phoneLogin.status], [200, 200], 'a second device could not log in while the first session was active');
    const tabletAuth = sessionAuthFromResponse(tabletLogin), phoneAuth = sessionAuthFromResponse(phoneLogin);
    assert.notEqual(tabletAuth.sessionToken, phoneAuth.sessionToken, 'two devices received the same session token');
    assert.notEqual(tabletAuth.csrfToken, phoneAuth.csrfToken, 'two devices received the same CSRF token');
    const activeAfterBothLogins = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_editor_sessions WHERE class_id='s4-e' AND editor_id='multi-device-editor' AND revoked_at IS NULL AND expires_at>?`).get(new Date().toISOString());
    assert.equal(Number(activeAfterBothLogins.count), 2, 'the second login revoked or replaced the first active device session');
    assert.equal((await get(api, env, 'session', tabletAuth)).status, 200, 'the tablet session did not survive the phone login');
    assert.equal((await get(api, env, 'session', phoneAuth)).status, 200, 'the phone session was not independently usable');

    const crossedCsrf = await post(api, env, { action: 'date.upsert', label: 'No guardar', startsAt: '2026-09-01T08:00:00-03:00' }, { sessionToken: tabletAuth.sessionToken, csrfToken: phoneAuth.csrfToken });
    assert.deepEqual([crossedCsrf.status, crossedCsrf.body.code], [403, 'csrf_rejected'], 'a CSRF token from one device authenticated another device session');
    const tabletLogout = await post(api, env, { action: 'auth.logout' }, tabletAuth);
    assert.equal(tabletLogout.status, 200, 'the tablet could not revoke its own session');
    assert.equal((await get(api, env, 'session', tabletAuth)).status, 401, 'logout left the tablet session active');
    assert.equal((await get(api, env, 'session', phoneAuth)).status, 200, 'logging out the tablet revoked the independent phone session');

    const changedPassword = 'Fixture-Multi-Device-Changed-2026!';
    const passwordChange = await post(api, env, { action: 'auth.password.change', currentPassword: multiDevicePassword, password: changedPassword }, phoneAuth);
    assert.equal(passwordChange.status, 200, 'the remaining device could not change its password');
    const replacementAuth = sessionAuthFromResponse(passwordChange);
    assert.equal((await get(api, env, 'session', phoneAuth)).status, 401, 'password change did not globally revoke the prior device session');
    assert.equal((await get(api, env, 'session', replacementAuth)).status, 200, 'password change did not install its secure replacement session');

    const promotedAt = new Date().toISOString();
    db.database.exec('BEGIN');
    try {
      db.database.prepare(`INSERT INTO hub_site_owner_account (account_key,editor_id,enabled,granted_by,created_at,updated_at) VALUES ('primary',?,1,'owner',?,?)`).run('multi-device-editor', promotedAt, promotedAt);
      db.database.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE editor_id=? AND revoked_at IS NULL`).run(promotedAt, 'multi-device-editor');
      db.database.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES ('s4-e','owner','owner','site.owner.grant','editor',?,'{"scope":"site"}',?)`).run('multi-device-editor', promotedAt);
      db.database.exec('COMMIT');
    } catch (error) {
      db.database.exec('ROLLBACK');
      throw error;
    }
    assert.equal((await get(api, env, 'session', replacementAuth)).status, 401, 'privilege promotion did not require a fresh password login');

    const ownerPhoneLogin = await post(api, env, { action: 'auth.login', email: 'multi.device@example.test', password: changedPassword }, {}, 's5-a');
    const ownerTabletLogin = await post(api, env, { action: 'auth.login', email: 'MULTI.DEVICE@example.test', password: changedPassword });
    assert.deepEqual([ownerPhoneLogin.status, ownerTabletLogin.status, ownerPhoneLogin.body.actor?.role, ownerTabletLogin.body.actor?.role], [200, 200, 'owner', 'owner'], 'the promoted account did not create independent owner sessions from two classes');
    assert.equal(ownerPhoneLogin.body.actor?.capabilities?.manageAllClasses, true, 'the site owner response omitted its global scope');
    const ownerPhoneAuth = sessionAuthFromResponse(ownerPhoneLogin), ownerTabletAuth = sessionAuthFromResponse(ownerTabletLogin);
    assert.notEqual(ownerPhoneAuth.sessionToken, ownerTabletAuth.sessionToken, 'two owner devices received the same session token');
    assert.notEqual(ownerPhoneAuth.csrfToken, ownerTabletAuth.csrfToken, 'two owner devices received the same CSRF token');
    const activeOwnerSessions = db.database.prepare(`SELECT COUNT(*) AS count FROM hub_editor_sessions WHERE class_id='s4-e' AND editor_id='multi-device-editor' AND revoked_at IS NULL AND expires_at>?`).get(new Date().toISOString());
    assert.equal(Number(activeOwnerSessions.count), 2, 'the second owner login replaced the first device session');

    const globalOwnerS5 = await get(api, env, 'admin', ownerPhoneAuth, 's5-a');
    assert.deepEqual([globalOwnerS5.status, globalOwnerS5.body.actor?.role, globalOwnerS5.body.class?.id, globalOwnerS5.body.profile?.email], [200, 'owner', 's5-a', 'multi.device@example.test'], 'the canonical owner credential was not recognized in another class');
    assert.ok(Array.isArray(globalOwnerS5.body.gradeReleases), 'the global owner did not receive owner-only grade administration in another class');
    const globalOwnerS4 = await get(api, env, 'admin', ownerPhoneAuth);
    assert.equal(globalOwnerS4.body.editors?.find((editor) => editor.id === 'multi-device-editor')?.is_site_owner, true, 'the owner account was not identified safely in its canonical editor list');
    assert.equal(globalOwnerS4.body.editors?.find((editor) => editor.id === 'multi-device-editor')?.is_current_actor, true, 'the current owner account was not protected from self-management in the UI contract');
    const ownerClasses = await get(api, env, 'classes', ownerPhoneAuth, 's5-a');
    assert.equal(ownerClasses.status, 200, 'a global owner session could not open the class registry');
    assert.equal(ownerClasses.body.classes?.some((entry) => entry.id === 's5-a'), true, 'the global owner class registry omitted the secondary class');
    const ownerAudit = await get(api, env, 'audit', ownerPhoneAuth, 's5-a');
    assert.equal(ownerAudit.status, 200, 'a global owner session could not read the target-class audit');
    const ownerLoginAudit = db.database.prepare(`SELECT class_id,actor_role FROM hub_audit WHERE actor_id='multi-device-editor' AND action='auth.login' ORDER BY id DESC LIMIT 1`).get();
    assert.deepEqual([ownerLoginAudit.class_id, ownerLoginAudit.actor_role], ['s4-e', 'owner'], 'owner login audit did not preserve the real role and target class');

    const promotedLegacyBearer = await get(api, env, 'admin', { bearer: 'unused-multi-device-token' });
    assert.deepEqual([promotedLegacyBearer.status, promotedLegacyBearer.body.actor?.role], [200, 'editor'], 'a legacy editor bearer inherited the site owner role');
    assert.equal(Object.hasOwn(promotedLegacyBearer.body, 'gradeReleases'), false, 'the promoted account legacy bearer received owner-only grade data');

    const ownerEmailInvite = await post(api, env, { action: 'invite.create', label: 'Owner email collision fixture', hours: 24 }, ownerPhoneAuth, 's5-a');
    assert.equal(ownerEmailInvite.status, 201, 'the global owner could not create a secondary-class invitation');
    const ownerEmailCollision = await post(api, env, { action: 'invite.claim', inviteToken: ownerEmailInvite.body.inviteToken, name: 'Collision fixture', email: 'multi.device@example.test', password: 'Collision-Fixture-2026!' }, {}, 's5-a');
    assert.deepEqual([ownerEmailCollision.status, ownerEmailCollision.body.code], [409, 'email_in_use'], 'another class duplicated the active site owner email');

    const classFixture = { action: 'class.upsert', id: 's5-a', slug: 's5-a', name: 'Medicina · 5.º A', semester: 5, group: 'A', theme: 'midnight-gold', driveUrl: '', supportWhatsapp: '', status: 'active' };
    const ownerClassCrossCsrf = await post(api, env, classFixture, { sessionToken: ownerPhoneAuth.sessionToken, csrfToken: ownerTabletAuth.csrfToken }, 's5-a');
    assert.deepEqual([ownerClassCrossCsrf.status, ownerClassCrossCsrf.body.code], [403, 'csrf_rejected'], 'class.upsert accepted the CSRF token from another owner device');
    const ownerClassUpdate = await post(api, env, classFixture, ownerPhoneAuth, 's5-a');
    assert.equal(ownerClassUpdate.status, 200, 'the global owner could not update the class registry with valid CSRF');

    const ownerCrossWrite = await post(api, env, { action: 'date.upsert', label: 'Fecha global fixture', startsAt: '2026-09-03T08:00:00-03:00', status: 'draft' }, ownerPhoneAuth, 's5-a');
    assert.equal(ownerCrossWrite.status, 200, 'the global owner could not write inside the requested secondary class');
    assert.equal(Number(db.database.prepare(`SELECT COUNT(*) AS count FROM hub_dates WHERE class_id='s5-a' AND label='Fecha global fixture'`).get().count), 1, 'the global owner write did not stay in the requested class');
    const selfRevoke = await post(api, env, { action: 'editor.revoke', id: 'multi-device-editor' }, ownerPhoneAuth);
    assert.deepEqual([selfRevoke.status, selfRevoke.body.code], [409, 'owner_self_revoke_forbidden'], 'the active site owner could revoke its own recovery account');

    const ownerTabletLogout = await post(api, env, { action: 'auth.logout' }, ownerTabletAuth, 's5-a');
    assert.equal(ownerTabletLogout.status, 200, 'the owner could not log out from a class different from the credential class');
    assert.equal((await get(api, env, 'session', ownerTabletAuth)).status, 401, 'cross-class logout left the exact owner device session active');
    assert.equal((await get(api, env, 'session', ownerPhoneAuth, 's5-a')).status, 200, 'logging out one owner device revoked another device');

    const ownerChangedPassword = 'Fixture-Site-Owner-Changed-2026!';
    const ownerPasswordChange = await post(api, env, { action: 'auth.password.change', currentPassword: changedPassword, password: ownerChangedPassword }, ownerPhoneAuth, 's5-a');
    assert.deepEqual([ownerPasswordChange.status, ownerPasswordChange.body.actor?.role], [200, 'owner'], 'the owner could not change its canonical password from another class');
    const replacementOwnerAuth = sessionAuthFromResponse(ownerPasswordChange);
    assert.equal((await get(api, env, 'session', ownerPhoneAuth, 's5-a')).status, 401, 'owner password change left the previous device active');
    assert.deepEqual([(await get(api, env, 'session', replacementOwnerAuth)).body.actor?.role, (await get(api, env, 'session', replacementOwnerAuth, 's5-a')).body.actor?.role], ['owner', 'owner'], 'the replacement owner session was not global');

    const passwordReset = await post(api, env, { action: 'editor.password.reset', id: 'multi-device-editor', temporaryPassword: 'Fixture-Temporary-Reset-2026!', hours: 24 }, ownerAuth);
    assert.equal(passwordReset.status, 200, 'the owner could not reset the multi-device fixture credential');
    assert.equal((await get(api, env, 'session', replacementOwnerAuth, 's5-a')).status, 401, 'owner password reset did not globally revoke the replacement owner session');
    const temporaryLogin = await post(api, env, { action: 'auth.login', email: 'multi.device@example.test', password: 'Fixture-Temporary-Reset-2026!' }, {}, 's5-a');
    assert.deepEqual([temporaryLogin.status, temporaryLogin.body.passwordChangeRequired, temporaryLogin.body.actor?.role], [200, true, 'owner'], 'the reset global credential could not create its bounded password-change session from another class');
    const temporaryAuth = sessionAuthFromResponse(temporaryLogin);
    assert.equal((await get(api, env, 'session', temporaryAuth, 's5-a')).status, 200, 'the reset credential session was not readable before account revocation');
    const multiDeviceInviteGrant = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'multi-device-editor', permission: 'invite.manage', enabled: true }, ownerAuth);
    assert.equal(multiDeviceInviteGrant.status, 200, 'the owner could not grant invite.manage before the account revocation fixture');
    const accountRevoke = await post(api, env, { action: 'editor.revoke', id: 'multi-device-editor' }, ownerAuth);
    assert.equal(accountRevoke.status, 200, 'the owner could not revoke the multi-device fixture account');
    assert.equal((await get(api, env, 'session', temporaryAuth, 's5-a')).status, 401, 'account revocation did not globally revoke its remaining session');
    assert.equal(Number(db.database.prepare(`SELECT enabled FROM hub_editor_invite_permissions WHERE class_id='s4-e' AND editor_id='multi-device-editor'`).get().enabled), 0, 'account revocation left invite.manage dormant');
    assert.equal(Number(db.database.prepare(`SELECT enabled FROM hub_site_owner_account WHERE account_key='primary' AND editor_id='multi-device-editor'`).get().enabled), 0, 'account revocation left the site owner role dormant');

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
    assert.equal(sessionView.body.actor?.capabilities?.manageInvites, false, 'content.manage implicitly granted invitation management');

    const unknownPermission = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'session-editor', permission: 'owner.manage', enabled: true }, ownerAuth);
    assert.deepEqual([unknownPermission.status, unknownPermission.body.code], [400, 'invalid_permission'], 'the permission allowlist accepted an unknown capability');
    const inviteGrant = await post(api, env, { action: 'editor.permission.update', classId: 's4-e', id: 'session-editor', permission: 'invite.manage', enabled: true }, ownerAuth);
    assert.deepEqual([inviteGrant.status, inviteGrant.body.permission, inviteGrant.body.enabled], [200, 'invite.manage', true], 'the owner could not grant invite.manage independently');
    const inviteManagerView = await get(api, env, 'admin', sessionAuth);
    assert.equal(inviteManagerView.body.actor?.capabilities?.manageInvites, true, 'the granted session did not receive invitation management');
    assert.equal(inviteManagerView.body.actor?.capabilities?.manageContent, true, 'granting invitation management removed the independent content permission');
    assert.deepEqual(inviteManagerView.body.editors, [], 'an invitation manager received the owner-only editor list');
    assert.ok(Array.isArray(inviteManagerView.body.invites), 'an invitation manager could not read the invitation lifecycle');
    const managedInvitation = await post(api, env, { action: 'invite.create', label: 'Invitation manager fixture', hours: 24 }, sessionAuth);
    assert.equal(managedInvitation.status, 201, 'invite.manage could not create a one-time invitation');
    assert.equal(db.database.prepare(`SELECT created_by FROM hub_invites WHERE id=?`).get(managedInvitation.body.id).created_by, 'session-editor', 'the invitation did not preserve its delegated creator');
    const managedRevoke = await post(api, env, { action: 'invite.revoke', id: managedInvitation.body.id }, sessionAuth);
    assert.equal(managedRevoke.status, 200, 'invite.manage could not revoke its class invitation');
    assert.ok(db.database.prepare(`SELECT revoked_at FROM hub_invites WHERE id=?`).get(managedInvitation.body.id).revoked_at, 'the delegated invitation revocation was not persisted');
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

    console.log('Managed content API validation OK: challenge review and delegated capabilities stay class-scoped; the singleton site owner supports fresh multi-device sessions across classes with CSRF, scoped logout, global credential revocation and recovery-safe account lifecycle; published visibility and optimistic/date conflicts are enforced.');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
