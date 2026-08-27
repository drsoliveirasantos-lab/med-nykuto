const DEFAULT_CLASS_ID = 's4-e';
const DEFAULT_CLASS_SLUG = 's4-e';
const LEGACY_COHORT_KEY = 'semester-4-group-e';
const CHALLENGE_GOAL = 1000;
const CHALLENGE_PRIZE_BRL = 50;
const MAX_SCOPES_PER_PLAYER = 54;
const MAX_RANKING_ROWS = 100;
const COMMUNITY_WRITE_LIMIT = 120;
const COMMUNITY_ENROLL_LIMIT = 12;
const COMMUNITY_WRITE_WINDOW_SECONDS = 600;
const PLAYER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTENT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const CLASS_REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;
const STUDENT_ID_PATTERN = /^[A-Z0-9]{4,24}$/;
const CHALLENGE_LESSON_IDS = Object.freeze({
  nutricion: ['nutricion'],
  fisiologia: ['fisiologia-2026-08-10', 'fisiologia-2026-08-13', 'fisiologia-2026-08-17', 'fisiologia-2026-08-20', 'fisiologia-2026-08-24'],
  bioquimica: ['bioquimica', 'bioquimica-2026-08-19', 'bioquimica-2026-08-21', 'bioquimica-2026-08-26'],
  epidemiologia: ['epidemiologia', 'epidemiologia-2026-08-19', 'epidemiologia-2026-08-26'],
  'microbiologia-teorica': ['microbiologia-teorica', 'microbiologia-teorica-2026-08-17', 'microbiologia-teorica-2026-08-24'],
  'microbiologia-practica': ['microbiologia-practica', 'microbiologia-practica-2026-08-20']
});
const CHALLENGE_TYPE_TOTALS = Object.freeze({ qcm: 20, vf: 10, cases: 10 });
const CHALLENGE_SCOPE_TOTALS = new Map();
Object.entries(CHALLENGE_LESSON_IDS).forEach(([courseId, lessonIds]) => {
  lessonIds.forEach((lessonId) => {
    Object.entries(CHALLENGE_TYPE_TOTALS).forEach(([type, total]) => {
      CHALLENGE_SCOPE_TOTALS.set(`${courseId}:${lessonId}-${type}`, total);
    });
  });
});
if (CHALLENGE_SCOPE_TOTALS.size !== MAX_SCOPES_PER_PLAYER) throw new Error('challenge_scope_contract_mismatch');

const DEFAULT_CLASS = {
  id: DEFAULT_CLASS_ID,
  slug: DEFAULT_CLASS_SLUG,
  name: 'Medicina · 4.º E',
  semester: 4,
  group: 'E',
  theme: 'midnight-gold',
  driveUrl: 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a'
};

const schemaPromises = new WeakMap();

function cleanClassRef(value) {
  const ref = String(value || '').trim().toLowerCase();
  if (ref === LEGACY_COHORT_KEY) return DEFAULT_CLASS_SLUG;
  return CLASS_REF_PATTERN.test(ref) ? ref : '';
}

function publicClass(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    semester: Number(row.semester) || 0,
    group: row.group_code || '',
    theme: row.theme || '',
    driveUrl: row.drive_url || ''
  };
}

async function resolveClass(request, db, data = null) {
  const url = new URL(request.url);
  const candidates = [
    ...url.searchParams.getAll('class'),
    ...url.searchParams.getAll('classSlug'),
    ...url.searchParams.getAll('classId'),
    data?.class,
    data?.classSlug,
    data?.classId
  ].filter((value) => String(value || '').trim());
  const refs = [...new Set(candidates.map(cleanClassRef))];
  if (refs.includes('') || refs.length > 1) return { error: 'class_mismatch' };
  const requested = refs[0] || DEFAULT_CLASS_SLUG;
  const row = await db.prepare(`SELECT id,slug,name,semester,group_code,theme,drive_url,status FROM hub_classes WHERE (slug=? OR id=?) AND status='active'`).bind(requested, requested).first();
  return row ? { classRecord: row } : { error: 'class_not_found' };
}

function response(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders
    }
  });
}

function errorResponse(status, code, message) {
  return response({ ok: false, code, message }, status);
}

async function digest(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((part) => part.toString(16).padStart(2, '0')).join('');
}

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(String(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(value)));
  return [...new Uint8Array(signature)].map((part) => part.toString(16).padStart(2, '0')).join('');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((part) => part.toString(16).padStart(2, '0')).join('');
}

function identitySecret(env) {
  return String(env.MED_NYKUTO_CATRACA_PEPPER || env.MED_NYKUTO_IDENTITY_SALT || env.MED_NYKUTO_OWNER_TOKEN || env.MED_NYKUTO_RATE_SALT || '').trim();
}

async function rateLimit(request, env, db, classId, scope, limit) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const salt = env.MED_NYKUTO_RATE_SALT
    || env.MED_NYKUTO_OWNER_TOKEN
    || env.MED_NYKUTO_CATRACA_PEPPER
    || env.MED_NYKUTO_IDENTITY_SALT
    || 'med-nykuto-community-rate-v479';
  const key = await digest(`${salt}:${classId}:${scope}:${address}`);
  const windowStart = Math.floor(Date.now() / 1000 / COMMUNITY_WRITE_WINDOW_SECONDS) * COMMUNITY_WRITE_WINDOW_SECONDS;
  await db.prepare(`INSERT INTO community_rate_limits (key,class_id,window_start,count) VALUES (?,?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start WHERE community_rate_limits.class_id=excluded.class_id`).bind(key, classId, windowStart).run();
  const row = await db.prepare(`SELECT count FROM community_rate_limits WHERE class_id=? AND key=?`).bind(classId, key).first();
  return Number(row?.count) > limit
    ? response({ ok: false, code: 'rate_limited', message: 'Demasiados intentos. Espera antes de volver a probar.' }, 429, { 'retry-after': String(COMMUNITY_WRITE_WINDOW_SECONDS) })
    : null;
}

function isoDate(date) { return date.toISOString().slice(0, 10); }

function paraguayDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Asuncion', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function currentWeek(now = new Date()) {
  const local = paraguayDateParts(now);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  const start = new Date(localDate);
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const closesAt = `${isoDate(end)}T20:00:00-03:00`;
  const remainingMilliseconds = Date.parse(closesAt) - now.getTime();
  return {
    key: isoDate(start),
    start: isoDate(start),
    end: isoDate(end),
    closesAt,
    timeZone: 'America/Asuncion',
    closed: remainingMilliseconds <= 0,
    secondsRemaining: Math.max(0, Math.ceil(remainingMilliseconds / 1000))
  };
}

function runtimeNow(env = {}) {
  const testValue = String(env.MED_NYKUTO_TEST_NOW || '');
  const testTimestamp = Date.parse(testValue);
  return testValue && Number.isFinite(testTimestamp) ? new Date(testTimestamp) : new Date();
}

function cleanDisplayName(value) {
  const name = String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (name.length < 5 || name.length > 60) return '';
  const parts = name.split(' ');
  if (parts.length < 2) return '';
  return parts.every((part) => /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u.test(part)) ? name : '';
}

function cleanStudentId(value) {
  const normalized = String(value || '').normalize('NFKC').toUpperCase().replace(/[\s._-]+/g, '');
  return STUDENT_ID_PATTERN.test(normalized) ? normalized : '';
}

function maskedStudentId(last4) { return last4 ? `•••• ${last4}` : ''; }

function publicParticipant(row) {
  const fullName = String(row?.display_name || '');
  const studentId = String(row?.student_id_public || '');
  const verificationStatus = String(row?.verification_status || 'pending');
  const identityComplete = Boolean(fullName && studentId);
  const prizeEligible = identityComplete && verificationStatus === 'verified';
  return {
    playerId: String(row?.player_id || ''),
    fullName,
    displayName: fullName,
    catraca: studentId,
    studentId,
    studentIdMasked: maskedStudentId(row?.student_id_last4),
    identityComplete,
    identificationPending: !identityComplete,
    verificationStatus,
    eligibleForPrize: prizeEligible,
    prizeEligible
  };
}

function cleanContentId(value) {
  const id = String(value || '').trim().toLowerCase();
  return CONTENT_ID_PATTERN.test(id) ? id : '';
}

function validPlayerId(value) { return PLAYER_ID_PATTERN.test(String(value || '').trim()); }
function validAccessToken(value) { return /^[0-9a-f]{64}$/i.test(String(value || '').trim()); }

function scoreIsBetter(next, previous) {
  if (!previous) return true;
  if (next.correct !== Number(previous.correct)) return next.correct > Number(previous.correct);
  return next.percentage > Number(previous.percentage);
}

function changed(result) { return Number(result?.meta?.changes ?? result?.changes ?? 0) > 0; }

async function ensureSchema(db) {
  if (!schemaPromises.has(db)) {
    const schemaPromise = (async () => {
      const created = new Date().toISOString();
      await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS hub_classes (id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,name TEXT NOT NULL,semester INTEGER NOT NULL,group_code TEXT NOT NULL DEFAULT '',theme TEXT NOT NULL DEFAULT 'midnight-gold',drive_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
        db.prepare(`CREATE TABLE IF NOT EXISTS community_scores (id INTEGER PRIMARY KEY AUTOINCREMENT,class_id TEXT NOT NULL DEFAULT 's4-e',cohort_key TEXT NOT NULL,week_key TEXT NOT NULL,player_id TEXT NOT NULL,nickname TEXT NOT NULL,course_id TEXT NOT NULL DEFAULT '',module_id TEXT NOT NULL DEFAULT '',scope_id TEXT NOT NULL,correct INTEGER NOT NULL,total INTEGER NOT NULL,percentage REAL NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,write_version INTEGER NOT NULL DEFAULT 0,UNIQUE (cohort_key,week_key,player_id,scope_id))`),
        db.prepare(`CREATE TABLE IF NOT EXISTS community_participants (class_id TEXT NOT NULL,player_id TEXT NOT NULL,display_name TEXT NOT NULL,student_id_hash TEXT NOT NULL,student_id_last4 TEXT NOT NULL,student_id_public TEXT NOT NULL DEFAULT '',access_token_hash TEXT NOT NULL,verification_status TEXT NOT NULL DEFAULT 'pending',consented_at TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY (class_id,player_id),UNIQUE (class_id,student_id_hash),UNIQUE (class_id,access_token_hash))`),
        db.prepare(`CREATE TABLE IF NOT EXISTS community_rate_limits (key TEXT PRIMARY KEY,class_id TEXT NOT NULL,window_start INTEGER NOT NULL,count INTEGER NOT NULL DEFAULT 0)`)
      ]);
      await db.prepare(`INSERT OR IGNORE INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`).bind(DEFAULT_CLASS_ID, DEFAULT_CLASS_SLUG, DEFAULT_CLASS.name, DEFAULT_CLASS.semester, DEFAULT_CLASS.group, DEFAULT_CLASS.theme, DEFAULT_CLASS.driveUrl, created, created).run();
      const scoreColumns = await db.prepare(`PRAGMA table_info(community_scores)`).all();
      if (!(scoreColumns.results || []).some((column) => column.name === 'class_id')) {
        try { await db.prepare(`ALTER TABLE community_scores ADD COLUMN class_id TEXT NOT NULL DEFAULT 's4-e'`).run(); }
        catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
      }
      if (!(scoreColumns.results || []).some((column) => column.name === 'write_version')) {
        try { await db.prepare(`ALTER TABLE community_scores ADD COLUMN write_version INTEGER NOT NULL DEFAULT 0`).run(); }
        catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
      }
      const participantColumns = await db.prepare(`PRAGMA table_info(community_participants)`).all();
      if (!(participantColumns.results || []).some((column) => column.name === 'student_id_public')) {
        try { await db.prepare(`ALTER TABLE community_participants ADD COLUMN student_id_public TEXT NOT NULL DEFAULT ''`).run(); }
        catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
      }
      await db.batch([
        db.prepare(`UPDATE community_scores SET class_id=? WHERE class_id IS NULL OR TRIM(class_id)=''`).bind(DEFAULT_CLASS_ID),
        db.prepare(`CREATE INDEX IF NOT EXISTS community_scores_class_week_idx ON community_scores (class_id,week_key,updated_at)`),
        db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS community_scores_class_scope_write_idx ON community_scores (class_id,week_key,player_id,scope_id) WHERE write_version=1`),
        db.prepare(`CREATE INDEX IF NOT EXISTS community_participants_class_status_idx ON community_participants (class_id,verification_status,updated_at)`),
        db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS community_participants_class_public_idx ON community_participants (class_id,student_id_public) WHERE student_id_public<>''`)
      ]);
    })().catch((error) => { schemaPromises.delete(db); throw error; });
    schemaPromises.set(db, schemaPromise);
  }
  return schemaPromises.get(db);
}

async function readRanking(db, classId, week, currentPlayerId = '') {
  const scopeOrder = classId === DEFAULT_CLASS_ID
    ? 'correct DESC,percentage DESC,created_at ASC,updated_at ASC'
    : 'percentage DESC,correct DESC,created_at ASC,updated_at ASC';
  const result = await db.prepare(`
    WITH participant_scopes AS (
      SELECT CASE
          WHEN p.student_id_public IS NOT NULL AND TRIM(p.student_id_public)<>'' THEN 'catraca:' || p.student_id_public
          WHEN p.student_id_hash IS NOT NULL AND TRIM(p.student_id_hash)<>'' THEN 'participant:' || p.student_id_hash
          ELSE 'legacy-player:' || s.player_id
        END AS identity_key,
        s.nickname,s.player_id,p.display_name,p.student_id_public,p.student_id_last4,p.verification_status,
        s.scope_id,s.correct,s.total,s.percentage,s.created_at,s.updated_at
      FROM community_scores s LEFT JOIN community_participants p ON p.class_id=s.class_id AND p.player_id=s.player_id
      WHERE s.class_id=? AND s.week_key=?
        AND (p.verification_status IS NULL OR p.verification_status IN ('pending','verified'))
    ), ranked_scopes AS (
      SELECT *,ROW_NUMBER() OVER (PARTITION BY identity_key,scope_id ORDER BY ${scopeOrder}) AS scope_rank FROM participant_scopes
    ), best_scopes AS (SELECT * FROM ranked_scopes WHERE scope_rank=1)
    SELECT identity_key,COALESCE(MAX(display_name),MAX(nickname)) AS display_name,
      MAX(student_id_public) AS student_id_public,MAX(student_id_last4) AS student_id_last4,
      MAX(verification_status) AS verification_status,
      MAX(CASE WHEN display_name IS NOT NULL AND student_id_public IS NOT NULL AND TRIM(student_id_public)<>'' THEN 1 ELSE 0 END) AS identity_complete,
      SUM(correct) AS points,SUM(total) AS questions,COUNT(*) AS challenges,
      MIN(created_at) AS first_activity,MAX(updated_at) AS last_activity,
      MAX(CASE WHEN player_id=? THEN 1 ELSE 0 END) AS direct_current
    FROM best_scopes GROUP BY identity_key
    ORDER BY points DESC,(SUM(correct)*1.0/NULLIF(SUM(total),0)) DESC,first_activity ASC,identity_key ASC LIMIT ?
  `).bind(classId, week.key, currentPlayerId, MAX_RANKING_ROWS).all();
  const ranking = (result.results || []).map((row, index) => {
    const fullName = row.display_name || '';
    const studentId = row.student_id_public || '';
    const identityComplete = Boolean(Number(row.identity_complete));
    const verificationStatus = row.verification_status || 'legacy';
    const prizeEligible = classId === DEFAULT_CLASS_ID && identityComplete && verificationStatus === 'verified';
    const points = Number(row.points) || 0;
    const questions = Number(row.questions) || 0;
    return {
      rank: index + 1,
      fullName,
      displayName: fullName,
      nickname: fullName,
      catraca: studentId,
      studentId,
      studentIdMasked: maskedStudentId(row.student_id_last4),
      identityComplete,
      identificationPending: !identityComplete,
      verificationStatus,
      eligibleForPrize: prizeEligible,
      prizeEligible,
      provisional: !prizeEligible,
      points,
      questions,
      accuracy: questions ? Math.round((points / questions) * 100) : 0,
      challenges: Number(row.challenges) || 0,
      firstActivity: row.first_activity || null,
      lastActivity: row.last_activity || null,
      isCurrent: Boolean(currentPlayerId && Number(row.direct_current) === 1)
    };
  });
  return { ranking: ranking.slice(0, 30), currentUser: ranking.find((entry) => entry.isCurrent) || null };
}

async function readChallenge(db, classId, week) {
  const scopeOrder = classId === DEFAULT_CLASS_ID
    ? 'correct DESC,percentage DESC,created_at ASC,updated_at ASC'
    : 'percentage DESC,correct DESC,created_at ASC,updated_at ASC';
  const row = await db.prepare(`
    WITH participant_scopes AS (
      SELECT CASE
          WHEN p.student_id_public IS NOT NULL AND TRIM(p.student_id_public)<>'' THEN 'catraca:' || p.student_id_public
          WHEN p.student_id_hash IS NOT NULL AND TRIM(p.student_id_hash)<>'' THEN 'participant:' || p.student_id_hash
          ELSE 'legacy-player:' || s.player_id
        END AS identity_key,
        s.scope_id,s.correct,s.total,s.percentage,s.created_at,s.updated_at
      FROM community_scores s LEFT JOIN community_participants p ON p.class_id=s.class_id AND p.player_id=s.player_id
      WHERE s.class_id=? AND s.week_key=?
        AND (p.verification_status IS NULL OR p.verification_status IN ('pending','verified'))
    ), ranked_scopes AS (
      SELECT *,ROW_NUMBER() OVER (PARTITION BY identity_key,scope_id ORDER BY ${scopeOrder}) AS scope_rank FROM participant_scopes
    ), best_scopes AS (SELECT * FROM ranked_scopes WHERE scope_rank=1)
    SELECT COUNT(DISTINCT identity_key) AS participants,COUNT(*) AS records,COALESCE(SUM(correct),0) AS points,COALESCE(SUM(total),0) AS questions FROM best_scopes
  `).bind(classId, week.key).first();
  const points = Number(row?.points) || 0;
  return {
    goal: CHALLENGE_GOAL,
    points,
    questions: Number(row?.questions) || 0,
    participants: Number(row?.participants) || 0,
    records: Number(row?.records) || 0,
    progress: Math.min(100, Math.round((points / CHALLENGE_GOAL) * 100)),
    closed: week.closed,
    prize: classId === DEFAULT_CLASS_ID
      ? { amount: CHALLENGE_PRIZE_BRL, currency: 'BRL', method: 'PIX', place: 1, classId: DEFAULT_CLASS_ID, provisional: true, verificationRequired: true }
      : null
  };
}

async function handleGet(request, db, classRecord, env) {
  const url = new URL(request.url);
  const requestedPlayer = url.searchParams.get('player') || '';
  const playerId = validPlayerId(requestedPlayer) ? requestedPlayer : '';
  const now = runtimeNow(env);
  const week = currentWeek(now);
  const [{ ranking, currentUser }, challenge] = await Promise.all([
    readRanking(db, classRecord.id, week, playerId),
    readChallenge(db, classRecord.id, week)
  ]);
  return response({ ok: true, cohort: classRecord.slug, class: publicClass(classRecord), week, challenge, ranking, currentUser, generatedAt: now.toISOString() });
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (origin) { try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; } }
  const fetchSite = String(request.headers.get('sec-fetch-site') || '').toLowerCase();
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'none';
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) throw new Error('payload_too_large');
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('invalid_content_type');
  if (!request.body) throw new Error('invalid_json');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0, raw = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new Error('payload_too_large'); }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try { return JSON.parse(raw); } catch { throw new Error('invalid_json'); }
}

async function enrollParticipant(request, db, env, classRecord, payload) {
  if (classRecord.id !== DEFAULT_CLASS_ID || cleanClassRef(payload.class) !== DEFAULT_CLASS_SLUG) return errorResponse(403, 'challenge_class_only', 'Este desafío es exclusivo para estudiantes del 4.º E.');
  const limited = await rateLimit(request, env, db, classRecord.id, 'community-enroll', COMMUNITY_ENROLL_LIMIT);
  if (limited) return limited;
  const secret = identitySecret(env);
  if (!secret) return errorResponse(503, 'identity_not_configured', 'La verificación de identidad se está activando.');
  const requestedPlayerId = String(payload.playerId || '').trim();
  const nameInputs = [payload.fullName, payload.displayName].filter((value) => String(value || '').trim());
  const studentIdInputs = [payload.catraca, payload.studentId].filter((value) => String(value || '').trim());
  const cleanNames = nameInputs.map(cleanDisplayName);
  const cleanStudentIds = studentIdInputs.map(cleanStudentId);
  const displayName = cleanNames[0] || '';
  const studentId = cleanStudentIds[0] || '';
  if (!validPlayerId(requestedPlayerId)) return errorResponse(400, 'invalid_player', 'El identificador local no es válido.');
  if (!displayName || cleanNames.some((name) => !name || name !== displayName)) return errorResponse(400, 'invalid_name', 'Escribe nombre y apellido, con entre 5 y 60 caracteres.');
  if (!studentId || cleanStudentIds.some((value) => !value || value !== studentId)) return errorResponse(400, 'invalid_student_id', 'La catraca indicada no tiene un formato válido.');
  if (payload.consent !== true || payload.classConfirmed !== true) return errorResponse(400, 'consent_required', 'Confirma que perteneces al 4.º E y que los datos son tuyos.');
  const requestedAccessToken = String(payload.accessToken || '').trim();
  if (requestedAccessToken && !validAccessToken(requestedAccessToken)) return errorResponse(400, 'invalid_access_token', 'El token local no tiene un formato válido.');
  const studentIdHash = await hmac(`${classRecord.id}:${studentId}`, secret);
  const now = new Date().toISOString();
  const participantColumns = `player_id,display_name,student_id_hash,student_id_public,student_id_last4,access_token_hash,verification_status,consented_at,created_at,updated_at`;
  const [byPlayer, byStudentHash, byStudentPublic, unresolvedLegacySuffix] = await Promise.all([
    db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND player_id=?`).bind(classRecord.id, requestedPlayerId).first(),
    db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND student_id_hash=?`).bind(classRecord.id, studentIdHash).first(),
    db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND student_id_public=?`).bind(classRecord.id, studentId).first(),
    db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND (student_id_public IS NULL OR TRIM(student_id_public)='') AND (student_id_last4=? OR TRIM(student_id_last4)='') AND player_id<>? LIMIT 1`).bind(classRecord.id, studentId.slice(-4), requestedPlayerId).first()
  ]);
  if (unresolvedLegacySuffix) {
    return errorResponse(409, 'identity_conflict', 'No se pudo confirmar la identidad. Una identificación anterior con la misma terminación debe ser reclamada primero por su perfil original.');
  }
  const existingIdentity = byPlayer || byStudentHash || byStudentPublic;

  if (!existingIdentity) {
    const accessToken = requestedAccessToken || randomToken();
    const accessTokenHash = await digest(accessToken);
    try {
      await db.prepare(`INSERT INTO community_participants (class_id,player_id,display_name,student_id_hash,student_id_last4,student_id_public,access_token_hash,verification_status,consented_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'pending',?,?,?)`)
        .bind(classRecord.id, requestedPlayerId, displayName, studentIdHash, studentId.slice(-4), studentId, accessTokenHash, now, now, now).run();
    } catch (error) {
      if (/UNIQUE|constraint/i.test(String(error))) {
        const racedParticipant = await db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND player_id=?`).bind(classRecord.id, requestedPlayerId).first();
        const idempotentCreate = racedParticipant
          && racedParticipant.display_name === displayName
          && racedParticipant.student_id_hash === studentIdHash
          && racedParticipant.student_id_public === studentId
          && racedParticipant.student_id_last4 === studentId.slice(-4)
          && racedParticipant.access_token_hash === accessTokenHash;
        if (idempotentCreate) {
          return response({ ok: true, class: publicClass(classRecord), participant: publicParticipant(racedParticipant), accessToken });
        }
        return errorResponse(409, 'identity_conflict', 'No se pudo confirmar la identidad. Usa el perfil y token que ya guardaste.');
      }
      throw error;
    }
    return response({
      ok: true,
      class: publicClass(classRecord),
      participant: publicParticipant({ player_id: requestedPlayerId, display_name: displayName, student_id_public: studentId, student_id_last4: studentId.slice(-4), verification_status: 'pending' }),
      accessToken
    }, 201);
  }

  const suppliedAccessTokenHash = requestedAccessToken ? await digest(requestedAccessToken) : '';
  const targetsAnotherPlayer = [byStudentHash, byStudentPublic].some((participant) => participant && participant.player_id !== requestedPlayerId);
  if (!byPlayer || !suppliedAccessTokenHash || suppliedAccessTokenHash !== byPlayer.access_token_hash || targetsAnotherPlayer) {
    return errorResponse(409, 'identity_conflict', 'No se pudo confirmar la identidad. Usa el perfil y token que ya guardaste.');
  }

  const requestedStateAlreadySaved = byPlayer.display_name === displayName
    && byPlayer.student_id_hash === studentIdHash
    && byPlayer.student_id_public === studentId
    && byPlayer.student_id_last4 === studentId.slice(-4);
  if (requestedStateAlreadySaved) {
    return response({ ok: true, class: publicClass(classRecord), participant: publicParticipant(byPlayer), accessToken: requestedAccessToken });
  }

  let updated;
  try {
    updated = await db.prepare(`UPDATE community_participants SET display_name=?,student_id_hash=?,student_id_last4=?,student_id_public=?,verification_status=CASE WHEN verification_status=? AND verification_status IN ('verified','rejected') AND (display_name<>? OR student_id_public<>?) THEN 'pending' ELSE verification_status END,consented_at=?,updated_at=? WHERE class_id=? AND player_id=? AND access_token_hash=? AND (display_name<>? OR student_id_hash<>? OR student_id_last4<>? OR student_id_public<>?)`)
      .bind(displayName, studentIdHash, studentId.slice(-4), studentId, byPlayer.verification_status, displayName, studentId, now, now, classRecord.id, requestedPlayerId, suppliedAccessTokenHash, displayName, studentIdHash, studentId.slice(-4), studentId).run();
  } catch (error) {
    if (/UNIQUE|constraint/i.test(String(error))) return errorResponse(409, 'identity_conflict', 'No se pudo confirmar la identidad. Usa el perfil y token que ya guardaste.');
    throw error;
  }
  const savedParticipant = await db.prepare(`SELECT ${participantColumns} FROM community_participants WHERE class_id=? AND player_id=?`).bind(classRecord.id, requestedPlayerId).first();
  const requestedStateWasSaved = savedParticipant
    && savedParticipant.display_name === displayName
    && savedParticipant.student_id_hash === studentIdHash
    && savedParticipant.student_id_public === studentId
    && savedParticipant.student_id_last4 === studentId.slice(-4)
    && savedParticipant.access_token_hash === suppliedAccessTokenHash;
  if (!requestedStateWasSaved) {
    if (!changed(updated)) return errorResponse(409, 'identity_conflict', 'No se pudo confirmar la identidad. Usa el perfil y token que ya guardaste.');
    throw new Error('participant_not_saved');
  }
  return response({
    ok: true,
    class: publicClass(classRecord),
    participant: publicParticipant(savedParticipant),
    accessToken: requestedAccessToken
  });
}

async function saveScore(request, db, env, classRecord, payload) {
  if (classRecord.id !== DEFAULT_CLASS_ID || cleanClassRef(payload.class) !== DEFAULT_CLASS_SLUG) return errorResponse(403, 'challenge_class_only', 'Este desafío es exclusivo para estudiantes del 4.º E.');
  const requestTime = runtimeNow(env);
  const week = currentWeek(requestTime);
  if (week.closed) return errorResponse(409, 'challenge_closed', 'El desafío cerró el domingo a las 20:00, hora de Paraguay. La clasificación está congelada.');
  const limited = await rateLimit(request, env, db, classRecord.id, 'community-score', COMMUNITY_WRITE_LIMIT);
  if (limited) return limited;
  const playerId = String(payload.playerId || '').trim();
  const accessToken = String(payload.accessToken || '').trim();
  const courseId = cleanContentId(payload.courseId);
  const moduleId = cleanContentId(payload.moduleId);
  const correct = Number(payload.correct);
  const total = Number(payload.total);
  if (!validPlayerId(playerId) || !validAccessToken(accessToken)) return errorResponse(401, 'identity_required', 'Guarda tu nombre y catraca antes de publicar.');
  const participant = await db.prepare(`SELECT display_name,student_id_public,verification_status FROM community_participants WHERE class_id=? AND player_id=? AND access_token_hash=?`).bind(classRecord.id, playerId, await digest(accessToken)).first();
  if (!participant) return errorResponse(401, 'identity_required', 'Guarda tu nombre y catraca antes de publicar.');
  if (!cleanDisplayName(participant.display_name) || !cleanStudentId(participant.student_id_public)) return errorResponse(401, 'identity_required', 'Vuelve a confirmar tu nombre completo y catraca antes de publicar.');
  if (!['pending', 'verified'].includes(participant.verification_status)) return errorResponse(403, 'identity_ineligible', 'Este perfil necesita una revisión antes de seguir publicando.');
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 50 || correct < 0 || correct > total) return errorResponse(400, 'invalid_score', 'El resultado del QCM no es válido.');
  const scopeId = `${courseId}:${moduleId}`;
  const expectedTotal = CHALLENGE_SCOPE_TOTALS.get(scopeId);
  if (!expectedTotal) return errorResponse(400, 'invalid_scope', 'El módulo no pertenece al desafío vigente del 4.º E.');
  if (total !== expectedTotal) return errorResponse(400, 'invalid_score', 'El total no coincide con el bloque 20/10/10 publicado.');
  const percentage = Math.round((correct / total) * 10000) / 100;
  const now = requestTime.toISOString();
  const previous = await db.prepare(`SELECT id,correct,total,percentage,created_at FROM community_scores WHERE class_id=? AND week_key=? AND player_id=? AND scope_id=? ORDER BY correct DESC,percentage DESC,created_at ASC,id ASC LIMIT 1`).bind(classRecord.id, week.key, playerId, scopeId).first();
  if (!previous) {
    const count = await db.prepare(`SELECT COUNT(DISTINCT scope_id) AS count FROM community_scores WHERE class_id=? AND week_key=? AND player_id=?`).bind(classRecord.id, week.key, playerId).first();
    if (Number(count?.count) >= MAX_SCOPES_PER_PLAYER) return errorResponse(429, 'weekly_limit', 'Has alcanzado el límite de módulos para esta semana.');
  }
  const next = { correct, total, percentage };
  const improved = scoreIsBetter(next, previous);
  let saved = false;
  if (improved) {
    const result = previous
      ? await db.prepare(`UPDATE community_scores SET nickname=?,course_id=?,module_id=?,correct=?,total=?,percentage=?,updated_at=? WHERE id=? AND class_id=? AND (correct<? OR (correct=? AND percentage<?))`)
        .bind(participant.display_name, courseId, moduleId, correct, total, percentage, now, previous.id, classRecord.id, correct, correct, percentage).run()
      : await db.prepare(`
        INSERT INTO community_scores (class_id,cohort_key,week_key,player_id,nickname,course_id,module_id,scope_id,correct,total,percentage,created_at,updated_at,write_version)
        SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,1
        WHERE (SELECT COUNT(DISTINCT scope_id) FROM community_scores WHERE class_id=? AND week_key=? AND player_id=?) < ?
        ON CONFLICT (class_id,week_key,player_id,scope_id) WHERE write_version=1 DO UPDATE SET
          nickname=excluded.nickname,course_id=excluded.course_id,module_id=excluded.module_id,
          correct=excluded.correct,total=excluded.total,percentage=excluded.percentage,updated_at=excluded.updated_at
        WHERE excluded.correct>community_scores.correct
          OR (excluded.correct=community_scores.correct AND excluded.percentage>community_scores.percentage)
      `).bind(
        classRecord.id, `class:${classRecord.id}`, week.key, playerId, participant.display_name,
        courseId, moduleId, scopeId, correct, total, percentage, now, now,
        classRecord.id, week.key, playerId, MAX_SCOPES_PER_PLAYER
      ).run();
    saved = changed(result);
  }
  const [best, challenge] = await Promise.all([
    db.prepare(`SELECT correct,total,percentage FROM community_scores WHERE class_id=? AND week_key=? AND player_id=? AND scope_id=? ORDER BY correct DESC,percentage DESC,updated_at DESC LIMIT 1`).bind(classRecord.id, week.key, playerId, scopeId).first(),
    readChallenge(db, classRecord.id, week)
  ]);
  if (!best) return errorResponse(429, 'weekly_limit', 'Has alcanzado el límite de módulos para esta semana.');
  return response({ ok: true, class: publicClass(classRecord), saved, week, best: { correct: Number(best.correct), total: Number(best.total), percentage: Number(best.percentage) }, challenge });
}

async function handlePost(request, db, env) {
  if (!sameOrigin(request)) return errorResponse(403, 'origin_rejected', 'La solicitud no proviene de este sitio.');
  let payload;
  try { payload = await readJson(request); }
  catch (error) { return errorResponse(error.message === 'payload_too_large' ? 413 : 400, 'invalid_json', 'Los datos enviados no son válidos.'); }
  const resolved = await resolveClass(request, db, payload);
  if (resolved.error === 'class_mismatch') return errorResponse(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
  if (!resolved.classRecord) return errorResponse(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
  const action = String(payload.action || '').trim();
  if (action === 'enroll') return enrollParticipant(request, db, env, resolved.classRecord, payload);
  if (action === 'score') return saveScore(request, db, env, resolved.classRecord, payload);
  return errorResponse(400, 'invalid_action', 'La acción solicitada no es válida.');
}

export async function onRequest(context) {
  const request = context.request;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS', 'cache-control': 'no-store' } });
  if (request.method !== 'GET' && request.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Método no permitido.');
  const db = context.env?.MED_NYKUTO_DB || context.env?.DB;
  if (!db) return errorResponse(503, 'not_configured', 'La clasificación compartida todavía no está conectada.');
  try {
    await ensureSchema(db);
    if (request.method === 'POST') return handlePost(request, db, context.env || {});
    const resolved = await resolveClass(request, db);
    if (resolved.error === 'class_mismatch') return errorResponse(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
    if (!resolved.classRecord) return errorResponse(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
    return handleGet(request, db, resolved.classRecord, context.env || {});
  } catch (error) {
    console.error('community_api_error', error);
    return errorResponse(500, 'temporarily_unavailable', 'La clasificación no está disponible por el momento.');
  }
}
