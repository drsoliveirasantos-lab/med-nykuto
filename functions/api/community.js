const COHORT_KEY = 'semester-4-group-e';
const CHALLENGE_GOAL = 1000;
const MAX_SCOPES_PER_PLAYER = 32;
const MAX_RANKING_ROWS = 100;
const NICKNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._'-]{0,22}[\p{L}\p{N}]$/u;
const PLAYER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTENT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

let schemaPromise = null;

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

async function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS community_scores (
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
          UNIQUE (cohort_key, week_key, player_id, scope_id)
        )
      `),
      db.prepare(`
        CREATE INDEX IF NOT EXISTS community_scores_week_idx
        ON community_scores (cohort_key, week_key, updated_at)
      `)
    ]).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

async function readRanking(db, week, currentPlayerId = '', currentNickname = '') {
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
      WHERE cohort_key = ? AND week_key = ?
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
  `).bind(COHORT_KEY, week.key, currentPlayerId, MAX_RANKING_ROWS).all();

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

async function readChallenge(db, week) {
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
      WHERE cohort_key = ? AND week_key = ?
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
  `).bind(COHORT_KEY, week.key).first();

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

async function handleGet(request, db) {
  const url = new URL(request.url);
  const requestedPlayer = url.searchParams.get('player') || '';
  const playerId = validPlayerId(requestedPlayer) ? requestedPlayer : '';
  const nickname = cleanNickname(url.searchParams.get('nickname'));
  const week = currentWeek();
  const [{ ranking, currentUser }, challenge] = await Promise.all([
    readRanking(db, week, playerId, nickname),
    readChallenge(db, week)
  ]);

  return response({
    ok: true,
    cohort: COHORT_KEY,
    week,
    challenge,
    ranking,
    currentUser,
    generatedAt: new Date().toISOString()
  });
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch (error) {
    return false;
  }
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) throw new Error('payload_too_large');
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new Error('invalid_content_type');
  }
  return request.json();
}

async function handlePost(request, db) {
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
    WHERE cohort_key = ? AND week_key = ?
      AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
      AND scope_id = ?
    ORDER BY percentage DESC, correct DESC, updated_at DESC
    LIMIT 1
  `).bind(COHORT_KEY, week.key, nickname, scopeId).first();

  if (!previous) {
    const count = await db.prepare(`
      SELECT COUNT(DISTINCT scope_id) AS count
      FROM community_scores
      WHERE cohort_key = ? AND week_key = ?
        AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
    `).bind(COHORT_KEY, week.key, nickname).first();
    if (Number(count?.count) >= MAX_SCOPES_PER_PLAYER) {
      return errorResponse(429, 'weekly_limit', 'Has alcanzado el límite de módulos para esta semana.');
    }
  }

  await db.prepare(`
    UPDATE community_scores
    SET nickname = ?, updated_at = ?
    WHERE cohort_key = ? AND week_key = ? AND player_id = ?
  `).bind(nickname, now, COHORT_KEY, week.key, playerId).run();

  const next = { correct, total, percentage };
  const improved = scoreIsBetter(next, previous);
  if (improved) {
    await db.prepare(`
      INSERT INTO community_scores (
        cohort_key, week_key, player_id, nickname, course_id, module_id,
        scope_id, correct, total, percentage, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (cohort_key, week_key, player_id, scope_id) DO UPDATE SET
        nickname = excluded.nickname,
        course_id = excluded.course_id,
        module_id = excluded.module_id,
        correct = excluded.correct,
        total = excluded.total,
        percentage = excluded.percentage,
        updated_at = excluded.updated_at
    `).bind(
      COHORT_KEY,
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
  }

  const [best, challenge] = await Promise.all([
    db.prepare(`
      SELECT correct, total, percentage
      FROM community_scores
      WHERE cohort_key = ? AND week_key = ?
        AND LOWER(TRIM(nickname)) = LOWER(TRIM(?))
        AND scope_id = ?
      ORDER BY percentage DESC, correct DESC, updated_at DESC
      LIMIT 1
    `).bind(COHORT_KEY, week.key, nickname, scopeId).first(),
    readChallenge(db, week)
  ]);

  return response({
    ok: true,
    saved: improved,
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
    return request.method === 'GET' ? handleGet(request, db) : handlePost(request, db);
  } catch (error) {
    console.error('community_api_error', error);
    return errorResponse(500, 'temporarily_unavailable', 'La clasificación no está disponible por el momento.');
  }
}
