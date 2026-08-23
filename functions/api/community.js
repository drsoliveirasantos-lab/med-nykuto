const DEFAULT_CLASS_ID = 's4-e';
const DEFAULT_CLASS_SLUG = 's4-e';
const LEGACY_COHORT_KEY = 'semester-4-group-e';
const CHALLENGE_GOAL = 1000;
const MAX_SCOPES_PER_PLAYER = 32;
const MAX_RANKING_ROWS = 100;
const COMMUNITY_WRITE_LIMIT = 120;
const COMMUNITY_WRITE_WINDOW_SECONDS = 600;
const NICKNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._'-]{0,22}[\p{L}\p{N}]$/u;
const PLAYER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTENT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const CLASS_REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;

const DEFAULT_CLASS = {
  id: DEFAULT_CLASS_ID,
  slug: DEFAULT_CLASS_SLUG,
  name: 'Medicina · 4.º E',
  semester: 4,
  group: 'E',
  theme: 'midnight-gold',
  driveUrl: 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a'
};

let schemaPromise = null;

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
  const queryCandidates = [
    url.searchParams.get('class'),
    url.searchParams.get('classSlug'),
    url.searchParams.get('classId')
  ].filter((value) => String(value || '').trim());
  const bodyCandidates = [
    data?.class,
    data?.classSlug,
    data?.classId
  ].filter((value) => String(value || '').trim());
  const candidates = queryCandidates.length ? queryCandidates : bodyCandidates;
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

async function rateLimit(request, env, db, classId) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const salt = env.MED_NYKUTO_RATE_SALT || 'med-nykuto-community-rate-v471';
  const key = await digest(`${salt}:${classId}:community-score:${address}`);
  const windowStart = Math.floor(Date.now() / 1000 / COMMUNITY_WRITE_WINDOW_SECONDS) * COMMUNITY_WRITE_WINDOW_SECONDS;
  await db.prepare(`INSERT INTO community_rate_limits (key,class_id,window_start,count) VALUES (?,?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start WHERE community_rate_limits.class_id=excluded.class_id`).bind(key, classId, windowStart).run();
  const row = await db.prepare(`SELECT count FROM community_rate_limits WHERE class_id=? AND key=?`).bind(classId, key).first();
  return Number(row?.count) > COMMUNITY_WRITE_LIMIT ? response({ ok: false, code: 'rate_limited', message: 'Demasiados resultados enviados. Espera antes de volver a probar.' }, 429, { 'retry-after': String(COMMUNITY_WRITE_WINDOW_SECONDS) }) : null;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function paraguayDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day)
  };
}

function currentWeek(now = new Date()) {
  const local = paraguayDateParts(now);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  const start = new Date(localDate);
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return { key: isoDate(start), start: isoDate(start), end: isoDate(end) };
}

function cleanNickname(value) {
  const nickname = String(value || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
  return NICKNAME_PATTERN.test(nickname) ? nickname : '';
}

function cleanContentId(value) {
  const id = String(value || '').trim().toLowerCase();
  return CONTENT_ID_PATTERN.test(id) ? id : '';
}

function validPlayerId(value) {
  return PLAYER_ID_PATTERN.test(String(value || '').trim());
}

function scoreIsBetter(next, previous) {
  if (!previous) return true;
  if (next.percentage !== Number(previous.percentage)) {
    return next.percentage > Number(previous.percentage);
  }
  return next.correct > Number(previous.correct);
}

function changed(result) {
  return Number(result?.meta?.changes ?? result?.changes ?? 0) > 0;
}

async function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const created = new Date().toISOString();
      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS hub_classes (
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
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS community_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id TEXT NOT NULL DEFAULT 's4-e',
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
            UNIQUE (cohort_key, week_key, player_id, scope_id)
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS community_rate_limits (
            key TEXT PRIMARY KEY,
            class_id TEXT NOT NULL,
            window_start INTEGER NOT NULL,
            count INTEGER NOT NULL DEFAULT 0
          )
        `)
      ]);
      await db.prepare(`INSERT OR IGNORE INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`).bind(DEFAULT_CLASS_ID, DEFAULT_CLASS_SLUG, DEFAULT_CLASS.name, DEFAULT_CLASS.semester, DEFAULT_CLASS.group, DEFAULT_CLASS.theme, DEFAULT_CLASS.driveUrl, created, created).run();
      const columns = await db.prepare(`PRAGMA table_info(community_scores)`).all();
      if (!(columns.results || []).some((column) => column.name === 'class_id')) {
        try {
          await db.prepare(`ALTER TABLE community_scores ADD COLUMN class_id TEXT NOT NULL DEFAULT 's4-e'`).run();
        } catch (error) {
          if (!/duplicate column/i.test(String(error))) throw error;
        }
      }
      await db.batch([
        db.prepare(`UPDATE community_scores SET class_id=? WHERE class_id IS NULL OR TRIM(class_id)='' OR cohort_key=?`).bind(DEFAULT_CLASS_ID, LEGACY_COHORT_KEY),
        db.prepare(`CREATE INDEX IF NOT EXISTS community_scores_class_week_idx ON community_scores (class_id,week_key,updated_at)`)
      ]);
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

async function readRanking(db, classId, week, currentPlayerId = '', currentNickname = '') {
  const result = await db.prepare(`
    WITH ranked_scopes AS (
      SELECT
        LOWER(TRIM(nickname)) AS nickname_key,
        nickname,
        player_id,
        scope_id,
        correct,
        total,
        percentage,
        updated_at,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(TRIM(nickname)), scope_id
          ORDER BY percentage DESC, correct DESC, updated_at DESC
        ) AS scope_rank
      FROM community_scores
      WHERE class_id = ? AND week_key = ?
    ),
    best_scopes AS (
      SELECT * FROM ranked_scopes WHERE scope_rank = 1
    )
    SELECT
      nickname_key,
      MAX(nickname) AS nickname,
      SUM(correct) AS points,
      SUM(total) AS questions,
      COUNT(*) AS challenges,
      MAX(updated_at) AS last_activity,
      MAX(CASE WHEN player_id = ? THEN 1 ELSE 0 END) AS direct_current
    FROM best_scopes
    GROUP BY nickname_key
    ORDER BY points DESC, (SUM(correct) * 1.0 / SUM(total)) DESC, last_activity ASC
    LIMIT ?
  `).bind(classId, week.key, currentPlayerId, MAX_RANKING_ROWS).all();

  const currentNicknameKey = currentNickname.toLocaleLowerCase('es');

  const rows = result.results || [];
  const ranking = rows.map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname,
    points: Number(row.points) || 0,
    questions: Number(row.questions) || 0,
    accuracy: row.questions ? Math.round((Number(row.points) / Number(row.questions)) * 100) : 0,
    challenges: Number(row.challenges) || 0,
    isCurrent: Boolean(
      (currentPlayerId && Number(row.direct_current) === 1) ||
      (currentNicknameKey && row.nickname_key === currentNicknameKey)
    )
  }));

  const currentUser = ranking.find((entry) => entry.isCurrent) || null;
  return { ranking: ranking.slice(0, 30), currentUser };
}

async function readChallenge(db, classId, week) {
  const row = await db.prepare(`
    WITH ranked_scopes AS (
      SELECT
        LOWER(TRIM(nickname)) AS nickname_key,
        scope_id,
        correct,
        total,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(TRIM(nickname)), scope_id
          ORDER BY percentage DESC, correct DESC, updated_at DESC
        ) AS scope_rank
      FROM community_scores
      WHERE class_id = ? AND week_key = ?
    ),
    best_scopes AS (
      SELECT * FROM ranked_scopes WHERE scope_rank = 1
    )
    SELECT
      COUNT(DISTINCT nickname_key) AS participants,
      COUNT(*) AS records,
      COALESCE(SUM(correct), 0) AS points,
      COALESCE(SUM(total), 0) AS questions
    FROM best_scopes
  `).bind(classId, week.key).first();

  const points = Number(row?.points) || 0;
  return {
    goal: CHALLENGE_GOAL,
    points,
    questions: Number(row?.questions) || 0,
    participants: Number(row?.participants) || 0,
    records: Number(row?.records) || 0,
    progress: Math.min(100, Math.round((points / CHALLENGE_GOAL) * 100))
  };
}

async function handleGet(request, db, classRecord) {
  const url = new URL(request.url);
  const requestedPlayer = url.searchParams.get('player') || '';
  const playerId = validPlayerId(requestedPlayer) ? requestedPlayer : '';
  const nickname = cleanNickname(url.searchParams.get('nickname'));
  const week = currentWeek();
  const [{ ranking, currentUser }, challenge] = await Promise.all([
    readRanking(db, classRecord.id, week, playerId, nickname),
    readChallenge(db, classRecord.id, week)
  ]);

  return response({
    ok: true,
    cohort: classRecord.slug,
    class: publicClass(classRecord),
    week,
    challenge,
    ranking,
    currentUser,
    generatedAt: new Date().toISOString()
  });
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin === new URL(request.url).origin;
    } catch (error) {
      return false;
    }
  }
  const fetchSite = String(request.headers.get('sec-fetch-site') || '').toLowerCase();
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'none';
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) throw new Error('payload_too_large');
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new Error('invalid_content_type');
  }
  if (!request.body) throw new Error('invalid_json');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let raw = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw new Error('payload_too_large');
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('invalid_json');
  }
}

async function handlePost(request, db, env) {
  if (!sameOrigin(request)) {
    return errorResponse(403, 'origin_rejected', 'La solicitud no proviene de este sitio.');
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    const status = error.message === 'payload_too_large' ? 413 : 400;
    return errorResponse(status, 'invalid_json', 'Los datos enviados no son válidos.');
  }

  const resolved = await resolveClass(request, db, payload);
  if (resolved.error === 'class_mismatch') return errorResponse(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
  if (!resolved.classRecord) return errorResponse(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
  const classRecord = resolved.classRecord;
  const limited = await rateLimit(request, env, db, classRecord.id);
  if (limited) return limited;

  const playerId = String(payload.playerId || '').trim();
  const nickname = cleanNickname(payload.nickname);
  const courseId = cleanContentId(payload.courseId);
  const moduleId = cleanContentId(payload.moduleId);
  const correct = Number(payload.correct);
  const total = Number(payload.total);

  if (!validPlayerId(playerId)) {
    return errorResponse(400, 'invalid_player', 'El identificador local no es válido.');
  }
  if (!nickname) {
    return errorResponse(400, 'invalid_nickname', 'Usa un apodo de 2 a 24 caracteres.');
  }
  if (!courseId && !moduleId) {
    return errorResponse(400, 'invalid_scope', 'Falta la materia o el módulo del QCM.');
  }
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 50 || correct < 0 || correct > total) {
    return errorResponse(400, 'invalid_score', 'El resultado del QCM no es válido.');
  }

  const week = currentWeek();
  const scopeId = moduleId ? `${courseId || 'module'}:${moduleId}` : courseId;
  const percentage = Math.round((correct / total) * 10000) / 100;
  const now = new Date().toISOString();
  const previous = await db.prepare(`
    SELECT correct, total, percentage
    FROM community_scores
    WHERE class_id = ? AND week_key = ?
      AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
      AND scope_id = ?
    ORDER BY percentage DESC, correct DESC, updated_at DESC
    LIMIT 1
  `).bind(classRecord.id, week.key, nickname, scopeId).first();

  if (!previous) {
    const count = await db.prepare(`
      SELECT COUNT(DISTINCT scope_id) AS count
      FROM community_scores
      WHERE class_id = ? AND week_key = ?
        AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
    `).bind(classRecord.id, week.key, nickname).first();
    if (Number(count?.count) >= MAX_SCOPES_PER_PLAYER) {
      return errorResponse(429, 'weekly_limit', 'Has alcanzado el límite de módulos para esta semana.');
    }
  }

  await db.prepare(`
    UPDATE community_scores
    SET nickname = ?, updated_at = ?
    WHERE class_id = ? AND week_key = ? AND player_id = ?
  `).bind(nickname, now, classRecord.id, week.key, playerId).run();

  const next = { correct, total, percentage };
  const improved = scoreIsBetter(next, previous);
  let saved = false;
  if (improved) {
    const result = await db.prepare(`
      INSERT INTO community_scores (
        class_id, cohort_key, week_key, player_id, nickname, course_id, module_id,
        scope_id, correct, total, percentage, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (cohort_key, week_key, player_id, scope_id) DO UPDATE SET
        nickname = excluded.nickname,
        course_id = excluded.course_id,
        module_id = excluded.module_id,
        correct = excluded.correct,
        total = excluded.total,
        percentage = excluded.percentage,
        updated_at = excluded.updated_at
      WHERE excluded.percentage > community_scores.percentage
         OR (excluded.percentage = community_scores.percentage AND excluded.correct > community_scores.correct)
    `).bind(
      classRecord.id,
      classRecord.id === DEFAULT_CLASS_ID ? LEGACY_COHORT_KEY : classRecord.id,
      week.key,
      playerId,
      nickname,
      courseId,
      moduleId,
      scopeId,
      correct,
      total,
      percentage,
      now,
      now
    ).run();
    saved = changed(result);
  }

  const [best, challenge] = await Promise.all([
    db.prepare(`
      SELECT correct, total, percentage
      FROM community_scores
      WHERE class_id = ? AND week_key = ?
        AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
        AND scope_id = ?
      ORDER BY percentage DESC, correct DESC, updated_at DESC
      LIMIT 1
    `).bind(classRecord.id, week.key, nickname, scopeId).first(),
    readChallenge(db, classRecord.id, week)
  ]);

  return response({
    ok: true,
    class: publicClass(classRecord),
    saved,
    week,
    best: {
      correct: Number(best.correct),
      total: Number(best.total),
      percentage: Number(best.percentage)
    },
    challenge
  });
}

export async function onRequest(context) {
  const request = context.request;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { allow: 'GET, POST, OPTIONS', 'cache-control': 'no-store' }
    });
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Método no permitido.');
  }

  const db = context.env?.MED_NYKUTO_DB || context.env?.DB;
  if (!db) {
    return errorResponse(
      503,
      'not_configured',
      'La clasificación compartida todavía no está conectada.'
    );
  }

  try {
    await ensureSchema(db);
    if (request.method === 'POST') return handlePost(request, db, context.env || {});
    const resolved = await resolveClass(request, db);
    if (resolved.error === 'class_mismatch') return errorResponse(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
    if (!resolved.classRecord) return errorResponse(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
    return handleGet(request, db, resolved.classRecord);
  } catch (error) {
    console.error('community_api_error', error);
    return errorResponse(500, 'temporarily_unavailable', 'La clasificación no está disponible por el momento.');
  }
}
