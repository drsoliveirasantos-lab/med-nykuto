const DEFAULT_CLASS_ID = 's4-e';
const DEFAULT_CLASS_SLUG = 's4-e';
const LEGACY_COHORT_KEY = 'semester-4-group-e';
const DEFAULT_CLASS_DRIVE_URL = 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a';
const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_MESSAGE_LENGTH = 3000;
const MIN_MESSAGE_LENGTH = 10;
const SUPPORT_WRITE_LIMIT = 12;
const SUPPORT_WRITE_WINDOW_SECONDS = 10 * 60;
const CLASS_REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const ROLES = new Set(['student', 'delegate', 'future-delegate']);
const CATEGORIES = new Set([
  'subject-help',
  'task-group',
  'question-error',
  'course-error',
  'file',
  'bug',
  'improvement',
  'delegate-access',
  'other'
]);
const LOCATIONS = new Set([
  'class-home',
  'schedule',
  'tasks',
  'subjects',
  'study',
  'groups-files',
  'delegate-panel',
  'general',
  'other'
]);
const PUBLIC_REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SUPPORT_TICKET_COLUMN_DEFINITIONS = [
  ['class_id', `TEXT NOT NULL DEFAULT 's4-e'`],
  ['public_reference', `TEXT NOT NULL DEFAULT ''`],
  ['request_id_hash', `TEXT NOT NULL DEFAULT ''`],
  ['role', `TEXT NOT NULL DEFAULT 'student'`],
  ['category', `TEXT NOT NULL DEFAULT 'other'`],
  ['subject', `TEXT NOT NULL DEFAULT ''`],
  ['location', `TEXT NOT NULL DEFAULT 'general'`],
  ['page_path', `TEXT NOT NULL DEFAULT ''`],
  ['requester_name', `TEXT NOT NULL DEFAULT ''`],
  ['reply_contact', `TEXT NOT NULL DEFAULT ''`],
  ['message', `TEXT NOT NULL DEFAULT ''`],
  ['status', `TEXT NOT NULL DEFAULT 'open'`],
  ['submitter_hash', `TEXT NOT NULL DEFAULT ''`],
  ['created_at', `TEXT NOT NULL DEFAULT ''`],
  ['updated_at', `TEXT NOT NULL DEFAULT ''`]
];
const schemaPromises = new WeakMap();

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

function fail(status, code, error, extraHeaders = {}) {
  return response({ ok: false, code, error }, status, extraHeaders);
}

function database(env) {
  return env?.MED_NYKUTO_DB || env?.DB || null;
}

function cleanSingleLine(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanMessage(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanClassRef(value) {
  const ref = cleanSingleLine(value).toLowerCase();
  if (ref === LEGACY_COHORT_KEY) return DEFAULT_CLASS_SLUG;
  return CLASS_REF_PATTERN.test(ref) ? ref : '';
}

function cleanEnum(value, allowed) {
  const normalized = cleanSingleLine(value).toLowerCase();
  return allowed.has(normalized) ? normalized : '';
}

function cleanE164(value) {
  let raw = cleanSingleLine(value);
  if (raw.startsWith('00')) raw = `+${raw.slice(2)}`;
  const canonical = raw.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(canonical) ? canonical : '';
}

function supportWhatsapp(row, env) {
  return cleanE164(row?.support_whatsapp)
    || cleanE164(row?.supportWhatsapp)
    || cleanE164(env?.MED_NYKUTO_SUPPORT_WHATSAPP_E164)
    || cleanE164(env?.MED_NYKUTO_SUPPORT_WHATSAPP);
}

function sameOrigin(request) {
  const target = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin) {
    try { return new URL(origin).origin === target; } catch { return false; }
  }
  const fetchSite = String(request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;
  const referer = request.headers.get('referer');
  if (referer) {
    try { return new URL(referer).origin === target; } catch { return false; }
  }
  return true;
}

async function readJson(request) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) throw new Error('payload_too_large');
  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) throw new Error('invalid_content_type');
  if (!request.body) throw new Error('invalid_json');

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let raw = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new Error('payload_too_large');
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();

  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('invalid_json'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid_json');
  return data;
}

async function digest(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((part) => part.toString(16).padStart(2, '0')).join('');
}

function randomReference() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let value = '';
  for (const byte of bytes) value += PUBLIC_REFERENCE_ALPHABET[byte % PUBLIC_REFERENCE_ALPHABET.length];
  return `HD-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

function decoyReference(requestHash) {
  const value = String(requestHash || '').toUpperCase();
  return `HD-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

function validReplyContact(value) {
  if (!value) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value)) return true;
  const withoutLabel = value.replace(/^(?:whats?app|wa|tel(?:ephone|éfono)?)\s*:\s*/iu, '');
  if (!/^\+?(?:\(\d{1,4}\)|\d)[\d\s().-]*$/u.test(withoutLabel)) return false;
  const digits = withoutLabel.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && !/^0+$/.test(digits);
}

function cleanPagePath(value, request) {
  const raw = String(value ?? '').normalize('NFKC').trim();
  if (!raw) return '';
  if (raw.length > 500 || /[\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const targetOrigin = new URL(request.url).origin;
    const parsed = new URL(raw, targetOrigin);
    if (parsed.origin !== targetOrigin || parsed.username || parsed.password) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function requestedClass(request, data) {
  const url = new URL(request.url);
  const rawCandidates = [
    ...url.searchParams.getAll('class'),
    ...url.searchParams.getAll('classSlug'),
    ...url.searchParams.getAll('classId'),
    data?.class
  ].filter((value) => cleanSingleLine(value));
  if (!rawCandidates.length) return { ref: DEFAULT_CLASS_SLUG };
  const refs = rawCandidates.map(cleanClassRef);
  if (refs.includes('') || new Set(refs).size !== 1) return { error: 'class_mismatch' };
  return { ref: refs[0] };
}

async function ensureClassSupportWhatsappColumn(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_classes)`).all();
  if (!(columns.results || []).some((column) => column.name === 'support_whatsapp')) {
    try {
      await db.prepare(`ALTER TABLE hub_classes ADD COLUMN support_whatsapp TEXT NOT NULL DEFAULT ''`).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error))) throw error;
    }
  }
}

async function ensureSupportTicketColumns(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_support_tickets)`).all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('id')) throw new Error('invalid_support_ticket_schema');
  for (const [name, definition] of SUPPORT_TICKET_COLUMN_DEFINITIONS) {
    if (names.has(name)) continue;
    try {
      await db.prepare(`ALTER TABLE hub_support_tickets ADD COLUMN ${name} ${definition}`).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error))) throw error;
    }
  }

  await db.prepare(`UPDATE hub_support_tickets SET class_id=? WHERE class_id IS NULL OR TRIM(class_id)=''`)
    .bind(DEFAULT_CLASS_ID)
    .run();
  const incomplete = await db.prepare(`SELECT id,class_id,public_reference,request_id_hash,submitter_hash,created_at,updated_at FROM hub_support_tickets WHERE public_reference IS NULL OR TRIM(public_reference)='' OR request_id_hash IS NULL OR TRIM(request_id_hash)='' OR submitter_hash IS NULL OR TRIM(submitter_hash)='' OR created_at IS NULL OR TRIM(created_at)='' OR updated_at IS NULL OR TRIM(updated_at)=''`).all();
  const rows = incomplete.results || [];
  for (let offset = 0; offset < rows.length; offset += 50) {
    const statements = [];
    for (const row of rows.slice(offset, offset + 50)) {
      const current = new Date().toISOString();
      const classId = cleanClassRef(row.class_id) || DEFAULT_CLASS_ID;
      const reference = cleanSingleLine(row.public_reference) || randomReference();
      const requestHash = cleanSingleLine(row.request_id_hash)
        || await digest(`help-desk-legacy-request-v1:${classId}:${row.id}`);
      const sourceHash = cleanSingleLine(row.submitter_hash)
        || await digest(`help-desk-legacy-submitter-v1:${classId}:${row.id}`);
      statements.push(db.prepare(`UPDATE hub_support_tickets SET class_id=?,public_reference=?,request_id_hash=?,submitter_hash=?,created_at=CASE WHEN created_at IS NULL OR TRIM(created_at)='' THEN ? ELSE created_at END,updated_at=CASE WHEN updated_at IS NULL OR TRIM(updated_at)='' THEN ? ELSE updated_at END WHERE id=?`)
        .bind(classId, reference, requestHash, sourceHash, current, current, row.id));
    }
    if (statements.length) await db.batch(statements);
  }
}

async function ensureSchema(db) {
  if (schemaPromises.has(db)) return schemaPromises.get(db);
  const promise = (async () => {
    const current = new Date().toISOString();
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_classes (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, semester INTEGER NOT NULL, group_code TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'midnight-gold', drive_url TEXT NOT NULL DEFAULT '', support_whatsapp TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_rate_limits (key TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', window_start INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0)`)
    ]);
    await ensureClassSupportWhatsappColumn(db);
    await db.prepare(`INSERT OR IGNORE INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'','active',?,?)`)
      .bind(DEFAULT_CLASS_ID, DEFAULT_CLASS_SLUG, 'Medicina · 4.º E', 4, 'E', 'midnight-gold', DEFAULT_CLASS_DRIVE_URL, current, current)
      .run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS hub_support_tickets (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        public_reference TEXT NOT NULL UNIQUE,
        request_id_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student','delegate','future-delegate')),
        category TEXT NOT NULL CHECK(category IN ('subject-help','task-group','question-error','course-error','file','bug','improvement','delegate-access','other')),
        subject TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL CHECK(location IN ('class-home','schedule','tasks','subjects','study','groups-files','delegate-panel','general','other')),
        page_path TEXT NOT NULL DEFAULT '',
        requester_name TEXT NOT NULL DEFAULT '',
        reply_contact TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed','spam')),
        submitter_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(class_id,request_id_hash),
        FOREIGN KEY(class_id) REFERENCES hub_classes(id) ON DELETE RESTRICT
      )`).run();
    await ensureSupportTicketColumns(db);
    await db.batch([
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_support_tickets_class_status_idx ON hub_support_tickets(class_id,status,created_at DESC)`),
      db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS hub_support_tickets_reference_uidx ON hub_support_tickets(public_reference)`),
      db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS hub_support_tickets_request_uidx ON hub_support_tickets(class_id,request_id_hash)`)
    ]);
  })().catch((error) => {
    schemaPromises.delete(db);
    throw error;
  });
  schemaPromises.set(db, promise);
  return promise;
}

async function resolveClass(db, ref) {
  return db.prepare(`SELECT id,slug,support_whatsapp FROM hub_classes WHERE (slug=? OR id=?) AND status='active'`)
    .bind(ref, ref)
    .first();
}

function validationResult(data, request) {
  for (const field of ['requestId', 'role', 'category', 'subject', 'location', 'pagePath', 'name', 'replyContact', 'message']) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
      return { error: ['invalid_field_type', 'Los campos del formulario deben contener texto.'] };
    }
  }
  const requestId = cleanSingleLine(data.requestId);
  if (!REQUEST_ID_PATTERN.test(requestId)) return { error: ['invalid_request_id', 'El identificador de la solicitud no es válido.'] };

  const role = cleanEnum(data.role, ROLES);
  if (!role) return { error: ['invalid_role', 'Elige quién solicita ayuda.'] };
  const category = cleanEnum(data.category, CATEGORIES);
  if (!category) return { error: ['invalid_category', 'Elige una categoría válida.'] };
  const location = cleanEnum(data.location, LOCATIONS);
  if (!location) return { error: ['invalid_location', 'Elige dónde ocurre el problema.'] };

  const subject = cleanSingleLine(data.subject);
  if (subject.length > 100) return { error: ['invalid_subject', 'La materia es demasiado larga.'] };
  const name = cleanSingleLine(data.name);
  if (name.length > 100) return { error: ['invalid_name', 'El nombre es demasiado largo.'] };
  const replyContact = cleanSingleLine(data.replyContact);
  const delegateRequest = role === 'future-delegate' || category === 'delegate-access';
  if (delegateRequest && !name) {
    return { error: ['delegate_name_required', 'Escribe tu nombre para que podamos verificar la solicitud de acceso de delegado.'] };
  }
  if (delegateRequest && !replyContact) {
    return { error: ['delegate_reply_contact_required', 'Escribe un correo o WhatsApp válido para que podamos responder sobre el acceso de delegado.'] };
  }
  if (replyContact.length > 120 || !validReplyContact(replyContact)) {
    return { error: ['invalid_reply_contact', 'Escribe un correo como nombre@dominio.com o un WhatsApp con 7 a 15 dígitos.'] };
  }
  const pagePath = cleanPagePath(data.pagePath, request);
  if (pagePath === null) return { error: ['invalid_page_path', 'La ubicación de la página no es válida.'] };
  const message = cleanMessage(data.message);
  if (message.length < MIN_MESSAGE_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return { error: ['invalid_message', `El mensaje debe tener entre ${MIN_MESSAGE_LENGTH} y ${MAX_MESSAGE_LENGTH} caracteres.`] };
  }

  return { requestId, role, category, subject, location, pagePath, name, replyContact, message };
}

function rateSalt(env) {
  return env?.MED_NYKUTO_RATE_SALT || env?.MED_NYKUTO_OWNER_TOKEN || 'med-nykuto-help-desk-rate-v1';
}

async function rateLimit(request, env, db, classId) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await digest(`${rateSalt(env)}:${classId}:help-desk-rate:${address}`);
  const epochSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(epochSeconds / SUPPORT_WRITE_WINDOW_SECONDS) * SUPPORT_WRITE_WINDOW_SECONDS;
  await db.prepare(`INSERT INTO hub_rate_limits (key,class_id,window_start,count) VALUES (?,?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start WHERE hub_rate_limits.class_id=excluded.class_id`)
    .bind(key, classId, windowStart)
    .run();
  const row = await db.prepare(`SELECT count FROM hub_rate_limits WHERE class_id=? AND key=?`).bind(classId, key).first();
  if (Number(row?.count) <= SUPPORT_WRITE_LIMIT) return null;
  const retryAfter = Math.max(1, windowStart + SUPPORT_WRITE_WINDOW_SECONDS - epochSeconds);
  return fail(429, 'rate_limited', 'Se enviaron demasiadas solicitudes. Espera antes de volver a probar.', { 'retry-after': String(retryAfter) });
}

async function submitterHash(request, env, classId) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  return digest(`${rateSalt(env)}:${classId}:help-desk-submitter:${address}`);
}

async function saveTicket(db, classRecord, values, requestHash, sourceHash) {
  const current = new Date().toISOString();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const id = crypto.randomUUID();
    const reference = randomReference();
    try {
      await db.prepare(`INSERT INTO hub_support_tickets (
        id,class_id,public_reference,request_id_hash,role,category,subject,location,page_path,requester_name,reply_contact,message,status,submitter_hash,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'open',?,?,?)
      ON CONFLICT(class_id,request_id_hash) DO NOTHING`)
        .bind(
          id,
          classRecord.id,
          reference,
          requestHash,
          values.role,
          values.category,
          values.subject,
          values.location,
          values.pagePath,
          values.name,
          values.replyContact,
          values.message,
          sourceHash,
          current,
          current
        )
        .run();
    } catch (error) {
      if (!/UNIQUE/i.test(String(error))) throw error;
    }
    const stored = await db.prepare(`SELECT public_reference FROM hub_support_tickets WHERE class_id=? AND request_id_hash=?`)
      .bind(classRecord.id, requestHash)
      .first();
    if (stored?.public_reference) return stored.public_reference;
  }
  throw new Error('support_reference_conflict');
}

async function handlePost(context) {
  const { request, env = {} } = context;
  if (!sameOrigin(request)) return fail(403, 'origin_rejected', 'La solicitud no proviene de este sitio.');

  let data;
  try {
    data = await readJson(request);
  } catch (error) {
    const status = error.message === 'payload_too_large' ? 413 : 400;
    return fail(status, error.message, 'La solicitud no es válida.');
  }

  const db = database(env);
  if (!db) return fail(503, 'database_unavailable', 'La base de ayuda no está configurada.');

  try {
    await ensureSchema(db);
    const requested = requestedClass(request, data);
    if (requested.error) return fail(400, 'class_mismatch', 'La clase indicada no es válida o no coincide con la URL.');
    const classRecord = await resolveClass(db, requested.ref);
    if (!classRecord) return fail(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');

    const requestId = cleanSingleLine(data.requestId);
    if (!REQUEST_ID_PATTERN.test(requestId)) return fail(400, 'invalid_request_id', 'El identificador de la solicitud no es válido.');
    const requestHash = await digest(`help-desk-request-v1:${classRecord.id}:${requestId}`);
    const whatsapp = supportWhatsapp(classRecord, env);

    if (cleanSingleLine(data.website)) {
      return response({ ok: true, reference: decoyReference(requestHash), supportWhatsapp: whatsapp });
    }

    const values = validationResult(data, request);
    if (values.error) return fail(400, values.error[0], values.error[1]);

    const existing = await db.prepare(`SELECT public_reference FROM hub_support_tickets WHERE class_id=? AND request_id_hash=?`)
      .bind(classRecord.id, requestHash)
      .first();
    if (existing?.public_reference) {
      return response({ ok: true, reference: existing.public_reference, supportWhatsapp: whatsapp });
    }

    const limited = await rateLimit(request, env, db, classRecord.id);
    if (limited) return limited;
    const sourceHash = await submitterHash(request, env, classRecord.id);
    const reference = await saveTicket(db, classRecord, values, requestHash, sourceHash);
    return response({ ok: true, reference, supportWhatsapp: whatsapp });
  } catch (error) {
    console.error('help_desk_post_error', error);
    return fail(500, 'server_error', 'No se pudo guardar la solicitud de ayuda.');
  }
}

export async function onRequest(context) {
  const method = String(context.request?.method || '').toUpperCase();
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { allow: 'POST, OPTIONS', 'cache-control': 'no-store' }
    });
  }
  if (method !== 'POST') return fail(405, 'method_not_allowed', 'Método no permitido.', { allow: 'POST, OPTIONS' });
  return handlePost(context);
}

export const __test = Object.freeze({
  cleanClassRef,
  cleanPagePath,
  decoyReference,
  requestedClass,
  sameOrigin,
  validReplyContact,
  validationResult
});
