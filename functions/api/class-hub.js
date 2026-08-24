import {
  clearSessionCookies,
  createPasswordVerifier,
  csrfCookieName,
  isRandomToken,
  normalizeEmail,
  randomToken,
  readCookie,
  sessionCookieName,
  sessionCookies,
  sessionTtlSeconds,
  strongPasswordProblem,
  temporaryPasswordProblem,
  temporaryPasswordTtlHours,
  verifyPassword
} from '../_lib/management-credentials.js';

const EDITOR_ACTIONS = new Set([
  'task.upsert', 'notice.upsert', 'activity.upsert', 'group.upsert', 'group.freeze',
  'member.move', 'member.remove', 'file.upsert', 'date.upsert', 'profile.upsert',
  'notice.attachment.upload'
]);
const STATUSES = new Set(['draft', 'published', 'archived']);
const NOTICE_PRIORITIES = new Set(['normal', 'important', 'urgent']);
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const CLASS_REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MAX_BODY = 65536;
const MAX_NOTICE_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const MAX_NOTICE_UPLOAD_REQUEST_BYTES = MAX_NOTICE_ATTACHMENT_BYTES + 512 * 1024;
const MAX_STAGED_NOTICE_UPLOADS_PER_CLASS = 20;
const NOTICE_STAGED_UPLOAD_TTL_SECONDS = 24 * 60 * 60;
const NOTICE_DELETING_RETRY_SECONDS = 5 * 60;
const NOTICE_UPLOAD_CLEANUP_BATCH_SIZE = 25;
const NOTICE_UPLOAD_ACTION = 'notice.attachment.upload';
const NOTICE_ATTACHMENT_RESOURCE = 'notice-attachment';
const NOTICE_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'image/avif',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const DEFAULT_CLASS_ID = 's4-e';
const DEFAULT_CLASS_SLUG = 's4-e';
const LEGACY_COHORT_KEY = 'semester-4-group-e';
const CLASS_TIME_ZONE = 'America/Asuncion';
const UPCOMING_SCHEDULE_DAYS = 56;
const INVALID_CREDENTIALS_MESSAGE = 'Correo o contraseña incorrectos.';
const DEFAULT_CLASS = {
  id: DEFAULT_CLASS_ID,
  slug: DEFAULT_CLASS_SLUG,
  name: 'Medicina · 4.º E',
  semester: 4,
  group: 'E',
  theme: 'midnight-gold',
  driveUrl: 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a'
};
const DEFAULT_SUBJECTS = [
  ['bioquimica-ii', 'Bioquímica II'],
  ['epidemiologia-salud-publica', 'Epidemiología y Salud Pública'],
  ['fisiologia-ii', 'Fisiología II'],
  ['microbiologia-ii-teorica', 'Microbiología II · Teórica'],
  ['microbiologia-ii-practica', 'Microbiología II · Práctica'],
  ['nutricion', 'Nutrición']
];
const DEFAULT_SCHEDULE_SLOTS = [
  { id: 'schedule-mon-fisiologia-0700', subjectId: 'fisiologia-ii', weekday: 1, startsTime: '07:00', endsTime: '10:10', label: 'Dra. Giselle Vert' },
  { id: 'schedule-mon-micro-teorica-1010', subjectId: 'microbiologia-ii-teorica', weekday: 1, startsTime: '10:10', endsTime: '12:20', label: 'Dr. Alexander Acuña' },
  { id: 'schedule-wed-bioquimica-0910', subjectId: 'bioquimica-ii', weekday: 3, startsTime: '09:10', endsTime: '11:10', label: 'Dra. Andrea López' },
  { id: 'schedule-wed-epidemiologia-1120', subjectId: 'epidemiologia-salud-publica', weekday: 3, startsTime: '11:20', endsTime: '13:20', label: 'Dra. Andrea Isasi' },
  { id: 'schedule-thu-nutricion-0700', subjectId: 'nutricion', weekday: 4, startsTime: '07:00', endsTime: '09:40', label: 'Lic. Johana Leguizamón' },
  { id: 'schedule-thu-fisiologia-0940', subjectId: 'fisiologia-ii', weekday: 4, startsTime: '09:40', endsTime: '12:20', label: 'Dra. Giselle Vert' },
  { id: 'schedule-fri-epidemiologia-0700', subjectId: 'epidemiologia-salud-publica', weekday: 5, startsTime: '07:00', endsTime: '09:00', label: 'Dra. Andrea Isasi' },
  { id: 'schedule-fri-bioquimica-0910', subjectId: 'bioquimica-ii', weekday: 5, startsTime: '09:10', endsTime: '11:10', label: 'Dra. Andrea López' }
];
let schemaPromise;
const EPIDEMIOLOGY_GROUP_TOPICS = [
  'Virus sincitial respiratorio · Bronquiolitis',
  'Influenza',
  'Tuberculosis',
  'Sarampión',
  'Meningitis bacteriana',
  'Dengue',
  'COVID-19',
  'Sífilis',
  'Hepatitis B',
  'Malaria'
];

function withEpidemiologyAssignment(group) {
  const match = /^epi-2026-08-19-g(\d+)$/.exec(String(group?.id || ''));
  const index = match ? Number(match[1]) - 1 : -1;
  if (index < 0 || index >= EPIDEMIOLOGY_GROUP_TOPICS.length) return group;
  return {
    ...group,
    topic: EPIDEMIOLOGY_GROUP_TOPICS[index]
  };
}

const DEFAULT_PUBLIC = {
  class: DEFAULT_CLASS,
  subjects: DEFAULT_SUBJECTS.map(([id, name], index) => ({ id, name, order: index + 1 })),
  notices: [
    { id: 'week-2026-08-21', course: '', priority: 'normal', title: 'Cursos del 19 al 21 de agosto disponibles', body: 'Bioquímica, Epidemiología, Fisiología y Microbiología práctica ya están organizadas.', imageUrl: null, imageAlt: null, attachmentUploadId: null, attachmentUrl: null, attachmentTitle: null, attachmentMimeType: null, attachmentSizeBytes: null, status: 'published' },
    { id: 'tasks-2026-08-21', course: '', priority: 'important', title: 'Dos trabajos activos', body: 'Epidemiología: exposición grupal. Bioquímica: imprimir y completar a mano las actividades 3 y 4.', imageUrl: null, imageAlt: null, attachmentUploadId: null, attachmentUrl: null, attachmentTitle: null, attachmentMimeType: null, attachmentSizeBytes: null, status: 'published' }
  ],
  tasks: [
    { id: 'epi-presentation', course: 'Epidemiología', title: 'Exposición grupal de enfermedad sorteada', description: 'Máximo 10 integrantes, diapositivas, uniforme, puntualidad y evaluación individual.', dueLabel: 'Mié. 26 ago.', dueAt: '2026-08-26T11:20:00-03:00', attachmentUrl: null, attachmentTitle: null, status: 'published' },
    { id: 'bio-activities', course: 'Bioquímica II', title: 'Actividades 3 y 4 impresas y manuscritas', description: 'El práctico contiene cinco actividades y la presencia es obligatoria.', dueLabel: 'Mié. 26 ago.', dueAt: '2026-08-26T09:10:00-03:00', attachmentUrl: null, attachmentTitle: null, status: 'published' }
  ],
  activities: [{ id: 'epi-2026-08-19', course: 'Epidemiología y Salud Pública', title: 'Exposición de Epidemiología', capacity: 10, status: 'published', frozen: false }],
  groups: []
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers } });
}
function jsonWithCookies(body, status, cookies) {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  cookies.forEach((cookie) => headers.append('set-cookie', cookie));
  return new Response(JSON.stringify(body), { status, headers });
}
function fail(status, code, error, headers = {}) { return json({ ok: false, code, error }, status, headers); }
function dbFrom(env) { return env.MED_NYKUTO_DB || env.DB || null; }
function uploadsFrom(env) { return env.MED_NYKUTO_UPLOADS || null; }
function nowIso() { return new Date().toISOString(); }
function cleanText(value, max = 500) { return String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function cleanId(value) { const id = String(value || '').trim().toLowerCase(); return ID_PATTERN.test(id) ? id : ''; }
function cleanClassRef(value) { const ref = String(value || '').trim().toLowerCase(); if (ref === LEGACY_COHORT_KEY) return DEFAULT_CLASS_SLUG; return CLASS_REF_PATTERN.test(ref) ? ref : ''; }
function cleanStatus(value, fallback = 'draft') { return STATUSES.has(value) ? value : fallback; }
function cleanPriority(value) { return NOTICE_PRIORITIES.has(value) ? value : 'normal'; }
function cleanUrl(value) { const raw = cleanText(value, 1000); if (!raw) return ''; try { const parsed = new URL(raw, 'https://med.nykuto.invalid/'); if (!['http:', 'https:'].includes(parsed.protocol)) return ''; return parsed.origin === 'https://med.nykuto.invalid' ? `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\//, '') : parsed.href; } catch { return ''; } }
function cleanDriveUrl(value) { const raw = cleanText(value, 1000); if (!raw) return ''; try { const parsed = new URL(raw); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : ''; } catch { return ''; } }
function cleanAttachmentUrl(value) { const raw = cleanText(value, 1500); if (!raw) return ''; try { const parsed = new URL(raw); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : ''; } catch { return ''; } }
function cleanE164(value) {
  let raw = String(value || '').normalize('NFKC').trim();
  if (raw.startsWith('00')) raw = `+${raw.slice(2)}`;
  const canonical = raw.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(canonical) ? canonical : '';
}
function integer(value, fallback, min, max) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback; }
function hasOwn(value, key) { return Boolean(value && Object.prototype.hasOwnProperty.call(value, key)); }

function localDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLASS_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}

function upcomingScheduleDates(slots, now = new Date()) {
  const current = localDateParts(now), anchor = Date.UTC(current.year, current.month - 1, current.day);
  const weekdayLabels = ['', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
  const monthLabels = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'];
  const dates = [];
  for (let offset = 0; offset < UPCOMING_SCHEDULE_DAYS; offset += 1) {
    const date = new Date(anchor + offset * 86400000), weekday = date.getUTCDay() || 7;
    for (const slot of slots) {
      if (Number(slot.weekday) !== weekday || !TIME_PATTERN.test(String(slot.startsTime || ''))) continue;
      const [hour, minute] = slot.startsTime.split(':').map(Number);
      if (offset === 0 && hour * 60 + minute <= current.minutes) continue;
      const localDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
      dates.push({
        slotId: slot.id,
        subjectId: slot.subjectId,
        subject: slot.subject,
        date: localDate,
        startsAt: `${localDate}T${slot.startsTime}`,
        endsAt: slot.endsTime ? `${localDate}T${slot.endsTime}` : null,
        label: `${weekdayLabels[weekday]} ${date.getUTCDate()} ${monthLabels[date.getUTCMonth()]} · ${slot.startsTime}`,
        timeZone: CLASS_TIME_ZONE
      });
    }
  }
  return dates.sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}
function defaultPublicScheduleSlots() {
  const names = new Map(DEFAULT_SUBJECTS);
  return DEFAULT_SCHEDULE_SLOTS.map((slot) => ({ ...slot, subject: names.get(slot.subjectId) || slot.subjectId, status: 'published' }));
}
function sameOrigin(request) {
  const target = new URL(request.url).origin, origin = request.headers.get('origin');
  if (origin) { try { return new URL(origin).origin === target; } catch { return false; } }
  const fetchSite = String(request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;
  const referer = request.headers.get('referer');
  if (referer) { try { return new URL(referer).origin === target; } catch { return false; } }
  return true;
}
async function payload(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY) throw new Error('payload_too_large');
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('invalid_content_type');
  if (!request.body) throw new Error('invalid_json');
  const reader = request.body.getReader(), decoder = new TextDecoder();
  let size = 0, raw = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error('payload_too_large'); }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try { return JSON.parse(raw); } catch { throw new Error('invalid_json'); }
}
async function digest(value) { const bytes = new TextEncoder().encode(String(value)); const hash = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(hash)].map((part) => part.toString(16).padStart(2, '0')).join(''); }
async function rateLimit(request, env, db, classId, scope, limit, windowSeconds) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  return rateLimitSubject(env, db, classId, scope, address, limit, windowSeconds);
}
async function rateLimitSubject(env, db, classId, scope, subject, limit, windowSeconds) {
  const salt = env.MED_NYKUTO_RATE_SALT || env.MED_NYKUTO_OWNER_TOKEN || 'med-nykuto-rate-v440';
  const epochSeconds = Math.floor(Date.now() / 1000), key = await digest(`${salt}:${classId}:${scope}:${subject}`), windowStart = Math.floor(epochSeconds / windowSeconds) * windowSeconds;
  await db.prepare(`INSERT INTO hub_rate_limits (key,class_id,window_start,count) VALUES (?,?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start WHERE hub_rate_limits.class_id=excluded.class_id`).bind(key, classId, windowStart).run();
  const row = await db.prepare(`SELECT count FROM hub_rate_limits WHERE class_id=? AND key=?`).bind(classId, key).first();
  const retryAfter = Math.max(1, windowStart + windowSeconds - epochSeconds);
  return Number(row?.count) > limit ? fail(429, 'rate_limited', 'Demasiados intentos. Espera antes de volver a probar.', { 'retry-after': String(retryAfter) }) : null;
}
function safeEqual(left, right) { left = String(left || ''); right = String(right || ''); let mismatch = left.length ^ right.length; const size = Math.max(left.length, right.length); for (let i = 0; i < size; i += 1) mismatch |= (left.charCodeAt(i % Math.max(1, left.length)) || 0) ^ (right.charCodeAt(i % Math.max(1, right.length)) || 0); return mismatch === 0; }
function token() { const bytes = crypto.getRandomValues(new Uint8Array(32)); return [...bytes].map((part) => part.toString(16).padStart(2, '0')).join(''); }
function generatedId(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
function changed(result) { return Number(result?.meta?.changes ?? result?.changes ?? 0) > 0; }
function scopedId(classId, value) {
  const id = cleanId(value);
  if (!id || classId === DEFAULT_CLASS_ID || id.startsWith(`${classId}.`)) return id;
  return cleanId(`${classId}.${id}`);
}
function entityId(classId, value, prefix) { return scopedId(classId, value) || scopedId(classId, generatedId(prefix)); }

function cleanUploadName(value) {
  const segments = String(value || '').normalize('NFKC').split(/[\\/]/);
  return cleanText(segments[segments.length - 1], 180) || 'archivo';
}
function normalizeUploadMime(value) {
  const mime = String(value || '').trim().toLowerCase().split(';')[0];
  return mime === 'image/jpg' ? 'image/jpeg' : mime;
}
function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}
async function detectUploadMime(file) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') return 'application/pdf';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(ascii(bytes, 0, 6))) return 'image/gif';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4).toLowerCase();
    if (['avif', 'avis'].includes(brand)) return 'image/avif';
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) return 'image/heic';
  }
  return '';
}
function compatibleUploadMime(declared, detected) {
  if (declared === detected) return true;
  return ['image/heic', 'image/heif'].includes(declared) && ['image/heic', 'image/heif'].includes(detected);
}
function isNoticeImageMime(value) {
  const mime = normalizeUploadMime(value);
  return mime.startsWith('image/') && NOTICE_UPLOAD_MIME_TYPES.has(mime);
}
function isFilePart(value) {
  return Boolean(value && typeof value === 'object' && typeof value.name === 'string' && Number.isFinite(value.size) && typeof value.slice === 'function' && typeof value.stream === 'function');
}
function noticeAttachmentUrl(classRecord, uploadId) {
  return `/api/class-hub?class=${encodeURIComponent(classRecord.slug)}&resource=${NOTICE_ATTACHMENT_RESOURCE}&upload=${encodeURIComponent(uploadId)}`;
}
function noticeUploadObjectKey(classId, uploadId) {
  return `classes/${classId}/notices/${uploadId}`;
}
function isExpectedNoticeUploadKey(classId, uploadId, objectKey) {
  return String(objectKey || '') === noticeUploadObjectKey(classId, uploadId);
}
function decorateNoticeAttachment(row, classRecord) {
  const uploadId = cleanId(row?.attachmentUploadId);
  const size = Number(row?.attachmentSizeBytes);
  return {
    ...row,
    course: cleanText(row?.course, 80),
    attachmentUploadId: uploadId || null,
    attachmentUrl: uploadId ? noticeAttachmentUrl(classRecord, uploadId) : null,
    attachmentTitle: uploadId ? (cleanText(row?.attachmentTitle, 180) || cleanUploadName(row?.attachmentOriginalName)) : null,
    attachmentMimeType: uploadId ? normalizeUploadMime(row?.attachmentMimeType) : null,
    attachmentSizeBytes: uploadId && Number.isFinite(size) ? size : null,
    attachmentOriginalName: undefined
  };
}

function supportWhatsapp(row, env = null) {
  return cleanE164(row?.support_whatsapp)
    || cleanE164(row?.supportWhatsapp)
    || cleanE164(env?.MED_NYKUTO_SUPPORT_WHATSAPP_E164)
    || cleanE164(env?.MED_NYKUTO_SUPPORT_WHATSAPP);
}
function publicClass(row, env = null) {
  return { id: row.id, slug: row.slug, name: row.name, semester: Number(row.semester) || 0, group: row.group_code || '', theme: row.theme || '', driveUrl: row.drive_url || '', supportWhatsapp: supportWhatsapp(row, env) };
}
function adminClass(row, env = null) { return { ...publicClass(row, env), status: row.status === 'archived' ? 'archived' : 'active' }; }

async function resolveClass(request, db, data = null, env = null) {
  const url = new URL(request.url);
  const queryCandidates = [url.searchParams.get('class'), url.searchParams.get('classSlug'), url.searchParams.get('classId')].filter((value) => String(value || '').trim());
  const bodyCandidates = [data?.class, data?.classSlug, data?.classId].filter((value) => String(value || '').trim());
  const candidates = queryCandidates.length ? queryCandidates : bodyCandidates;
  const refs = [...new Set(candidates.map(cleanClassRef))];
  if (refs.includes('') || refs.length > 1) return { error: 'class_mismatch' };
  const requested = refs[0] || DEFAULT_CLASS_SLUG;
  const row = await db.prepare(`SELECT id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status FROM hub_classes WHERE (slug=? OR id=?) AND status='active'`).bind(requested, requested).first();
  if (row) row.supportWhatsapp = supportWhatsapp(row, env);
  return row ? { classRecord: row } : { error: 'class_not_found' };
}

async function ensureClassColumn(db, table) {
  if (!/^[a-z][a-z0-9_]*$/.test(table)) throw new Error('invalid_table');
  const columns = await db.prepare(`PRAGMA table_info(${table})`).all();
  if (!(columns.results || []).some((column) => column.name === 'class_id')) {
    try { await db.prepare(`ALTER TABLE ${table} ADD COLUMN class_id TEXT NOT NULL DEFAULT 's4-e'`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
  await db.prepare(`UPDATE ${table} SET class_id=? WHERE class_id IS NULL OR TRIM(class_id)=''`).bind(DEFAULT_CLASS_ID).run();
}

async function ensureTaskAttachmentColumns(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_tasks)`).all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('attachment_url')) {
    try { await db.prepare(`ALTER TABLE hub_tasks ADD COLUMN attachment_url TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
  if (!names.has('attachment_title')) {
    try { await db.prepare(`ALTER TABLE hub_tasks ADD COLUMN attachment_title TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
}

async function ensureClassSupportWhatsappColumn(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_classes)`).all();
  if (!(columns.results || []).some((column) => column.name === 'support_whatsapp')) {
    try { await db.prepare(`ALTER TABLE hub_classes ADD COLUMN support_whatsapp TEXT NOT NULL DEFAULT ''`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
}

async function ensureNoticeImageColumns(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_notices)`).all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('image_url')) {
    try { await db.prepare(`ALTER TABLE hub_notices ADD COLUMN image_url TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
  if (!names.has('image_alt')) {
    try { await db.prepare(`ALTER TABLE hub_notices ADD COLUMN image_alt TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
}

async function ensureNoticeAttachmentColumns(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_notices)`).all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('attachment_upload_id')) {
    try { await db.prepare(`ALTER TABLE hub_notices ADD COLUMN attachment_upload_id TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
  if (!names.has('attachment_title')) {
    try { await db.prepare(`ALTER TABLE hub_notices ADD COLUMN attachment_title TEXT`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
}

async function ensureCourseColumns(db) {
  for (const table of ['hub_notices', 'hub_activities', 'hub_dates']) {
    const columns = await db.prepare(`PRAGMA table_info(${table})`).all();
    if (!(columns.results || []).some((column) => column.name === 'course')) {
      try { await db.prepare(`ALTER TABLE ${table} ADD COLUMN course TEXT NOT NULL DEFAULT ''`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
    }
  }
}

async function ensureMembershipLeaderColumn(db) {
  const columns = await db.prepare(`PRAGMA table_info(hub_memberships)`).all();
  if (!(columns.results || []).some((column) => column.name === 'is_leader')) {
    try { await db.prepare(`ALTER TABLE hub_memberships ADD COLUMN is_leader INTEGER NOT NULL DEFAULT 0`).run(); } catch (error) { if (!/duplicate column/i.test(String(error))) throw error; }
  }
}

async function listClasses(db, env = null) {
  const rows = await db.prepare(`SELECT id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status FROM hub_classes ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END,semester,group_code,name`).all();
  return (rows.results || []).map((row) => adminClass(row, env));
}

async function activityState(db, classId, activityId, current = nowIso()) {
  const activity = await db.prepare(`SELECT id,course,capacity,frozen,closes_at FROM hub_activities WHERE class_id=? AND id=?`).bind(classId, activityId).first();
  if (!activity) return { exists: false, locked: true, course: '', capacity: 0, closesAt: null };
  return {
    exists: true,
    locked: Boolean(activity.frozen) || Boolean(activity.closes_at && activity.closes_at <= current),
    course: cleanText(activity.course, 80),
    capacity: Number(activity.capacity) || 0,
    closesAt: activity.closes_at || null
  };
}

async function ensureSchema(db) {
  if (!schemaPromise) schemaPromise = (async () => {
    const created = nowIso();
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_classes (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, semester INTEGER NOT NULL, group_code TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'midnight-gold', drive_url TEXT NOT NULL DEFAULT '', support_whatsapp TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_subjects (class_id TEXT NOT NULL, id TEXT NOT NULL, name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(class_id,id), FOREIGN KEY(class_id) REFERENCES hub_classes(id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_tasks (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', course TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_label TEXT NOT NULL DEFAULT '', due_at TEXT, attachment_url TEXT, attachment_title TEXT, status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_uploads (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', object_key TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL, etag TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'staged', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_notices (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', course TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'draft', push_mode INTEGER NOT NULL DEFAULT 0, image_url TEXT, image_alt TEXT, attachment_upload_id TEXT, attachment_title TEXT, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_activities (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', course TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 10, closes_at TEXT, status TEXT NOT NULL DEFAULT 'draft', frozen INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_groups (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', activity_id TEXT NOT NULL, name TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 10, frozen INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(activity_id, name), FOREIGN KEY(activity_id) REFERENCES hub_activities(id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_memberships (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', activity_id TEXT NOT NULL, group_id TEXT NOT NULL, student_hash TEXT NOT NULL, display_name TEXT NOT NULL, is_leader INTEGER NOT NULL DEFAULT 0, joined_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(activity_id, student_hash), FOREIGN KEY(activity_id) REFERENCES hub_activities(id), FOREIGN KEY(group_id) REFERENCES hub_groups(id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_files (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', course TEXT NOT NULL, lesson_date TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, url TEXT NOT NULL, file_type TEXT NOT NULL DEFAULT 'link', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_dates (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', course TEXT NOT NULL DEFAULT '', label TEXT NOT NULL, starts_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_schedule_slots (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', subject_id TEXT NOT NULL, weekday INTEGER NOT NULL CHECK(weekday BETWEEN 1 AND 7), starts_time TEXT NOT NULL, ends_time TEXT, label TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(class_id,subject_id,weekday,starts_time), FOREIGN KEY(class_id,subject_id) REFERENCES hub_subjects(class_id,id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_invites (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', token_hash TEXT NOT NULL UNIQUE, label TEXT NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT, claimed_at TEXT, created_by TEXT NOT NULL, created_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_editors (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, last_used_at TEXT)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_editor_profiles (class_id TEXT NOT NULL DEFAULT 's4-e', actor_id TEXT NOT NULL, whatsapp_e164 TEXT NOT NULL DEFAULT '', whatsapp_format_verified_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(class_id,actor_id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_editor_credentials (editor_id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', email_normalized TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, password_algorithm TEXT NOT NULL DEFAULT 'pbkdf2-sha256', password_iterations INTEGER NOT NULL, password_version INTEGER NOT NULL DEFAULT 1, must_change_password INTEGER NOT NULL DEFAULT 1, temporary_expires_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(class_id,email_normalized), FOREIGN KEY(editor_id) REFERENCES hub_editors(id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_editor_sessions (token_hash TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', editor_id TEXT NOT NULL, csrf_hash TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, last_seen_at TEXT, revoked_at TEXT, FOREIGN KEY(editor_id) REFERENCES hub_editors(id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT NOT NULL DEFAULT 's4-e', actor_id TEXT NOT NULL, actor_role TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_push_subscriptions (id TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', endpoint_hash TEXT NOT NULL UNIQUE, subscription_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS hub_rate_limits (key TEXT PRIMARY KEY, class_id TEXT NOT NULL DEFAULT 's4-e', window_start INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0)`)
    ]);
    await ensureClassSupportWhatsappColumn(db);
    await db.prepare(`INSERT OR IGNORE INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'active',?,?)`).bind(DEFAULT_CLASS_ID, DEFAULT_CLASS_SLUG, DEFAULT_CLASS.name, DEFAULT_CLASS.semester, DEFAULT_CLASS.group, DEFAULT_CLASS.theme, DEFAULT_CLASS.driveUrl, created, created).run();
    await db.batch(DEFAULT_SUBJECTS.map(([id, name], index) => db.prepare(`INSERT OR IGNORE INTO hub_subjects (class_id,id,name,sort_order,status,created_at,updated_at) VALUES (?,?,?,?,'active',?,?)`).bind(DEFAULT_CLASS_ID, id, name, index + 1, created, created)));
    for (const table of ['hub_tasks', 'hub_uploads', 'hub_notices', 'hub_activities', 'hub_groups', 'hub_memberships', 'hub_files', 'hub_dates', 'hub_schedule_slots', 'hub_invites', 'hub_editors', 'hub_editor_profiles', 'hub_editor_credentials', 'hub_editor_sessions', 'hub_audit', 'hub_push_subscriptions', 'hub_rate_limits']) await ensureClassColumn(db, table);
    await ensureTaskAttachmentColumns(db);
    await ensureNoticeImageColumns(db);
    await ensureNoticeAttachmentColumns(db);
    await ensureCourseColumns(db);
    await ensureMembershipLeaderColumn(db);
    await db.batch([
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_tasks_class_idx ON hub_tasks(class_id,updated_at DESC)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_uploads_class_status_idx ON hub_uploads(class_id,status,updated_at DESC)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_uploads_class_lifecycle_idx ON hub_uploads(class_id,status,created_at,updated_at)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_notices_class_idx ON hub_notices(class_id,updated_at DESC)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_notices_class_attachment_idx ON hub_notices(class_id,attachment_upload_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_activities_class_idx ON hub_activities(class_id,updated_at DESC)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_groups_class_idx ON hub_groups(class_id,activity_id,name)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_memberships_class_group_idx ON hub_memberships(class_id,group_id,joined_at)`),
      db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS hub_memberships_one_leader_idx ON hub_memberships(class_id,group_id) WHERE is_leader=1`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_files_class_idx ON hub_files(class_id,updated_at DESC)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_dates_class_idx ON hub_dates(class_id,starts_at)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_schedule_slots_class_idx ON hub_schedule_slots(class_id,status,weekday,starts_time)`),
      db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS hub_editor_credentials_class_email_uidx ON hub_editor_credentials(class_id,email_normalized)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_editor_profiles_class_actor_idx ON hub_editor_profiles(class_id,actor_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_editor_sessions_editor_idx ON hub_editor_sessions(class_id,editor_id,expires_at)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS hub_audit_class_created_idx ON hub_audit(class_id,created_at DESC)`)
    ]);
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO hub_tasks (id,class_id,course,title,description,due_label,status,created_by,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?,'published','system',?,?)`).bind('epi-presentation', DEFAULT_CLASS_ID, 'Epidemiología', 'Exposición grupal de enfermedad sorteada', 'Máximo 10 integrantes, diapositivas, uniforme, puntualidad y evaluación individual.', 'Semana siguiente', created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_tasks (id,class_id,course,title,description,due_label,status,created_by,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?,'published','system',?,?)`).bind('bio-activities', DEFAULT_CLASS_ID, 'Bioquímica II', 'Actividades 3 y 4 impresas y manuscritas', 'El práctico contiene cinco actividades y la presencia es obligatoria.', 'Práctico', created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_notices (id,class_id,title,body,priority,status,push_mode,created_by,created_at,updated_at,published_at) VALUES (?, ?, ?, ?,'normal','published',0,'system',?,?,?)`).bind('week-2026-08-21', DEFAULT_CLASS_ID, 'Cursos del 19 al 21 de agosto disponibles', 'Bioquímica, Epidemiología, Fisiología y Microbiología práctica ya están organizadas.', created, created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_notices (id,class_id,title,body,priority,status,push_mode,created_by,created_at,updated_at,published_at) VALUES (?, ?, ?, ?,'important','published',0,'system',?,?,?)`).bind('tasks-2026-08-21', DEFAULT_CLASS_ID, 'Dos trabajos activos', 'Epidemiología: exposición grupal. Bioquímica: imprimir y completar a mano las actividades 3 y 4.', created, created, created),
      db.prepare(`INSERT OR IGNORE INTO hub_activities (id,class_id,course,title,capacity,status,frozen,created_by,created_at,updated_at) VALUES ('epi-2026-08-19',?,'Epidemiología y Salud Pública','Exposición de Epidemiología',10,'published',0,'system',?,?)`).bind(DEFAULT_CLASS_ID, created, created),
      ...DEFAULT_SCHEDULE_SLOTS.map((slot) => db.prepare(`INSERT OR IGNORE INTO hub_schedule_slots (id,class_id,subject_id,weekday,starts_time,ends_time,label,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'published','system',?,?)`).bind(slot.id, DEFAULT_CLASS_ID, slot.subjectId, slot.weekday, slot.startsTime, slot.endsTime, slot.label, created, created)),
      ...EPIDEMIOLOGY_GROUP_TOPICS.map((_, index) => db.prepare(`INSERT OR IGNORE INTO hub_groups (id,class_id,activity_id,name,capacity,frozen,created_by,created_at,updated_at) VALUES (?, ?, 'epi-2026-08-19', ?, 10, 0, 'system', ?, ?)`).bind(`epi-2026-08-19-g${index + 1}`, DEFAULT_CLASS_ID, `Grupo ${index + 1}`, created, created))
    ]);
    await db.batch([
      db.prepare(`UPDATE hub_tasks SET due_label='Mié. 26 ago.',due_at='2026-08-26T11:20:00-03:00',updated_at=? WHERE class_id=? AND id='epi-presentation'`).bind(created, DEFAULT_CLASS_ID),
      db.prepare(`UPDATE hub_tasks SET due_label='Mié. 26 ago.',due_at='2026-08-26T09:10:00-03:00',updated_at=? WHERE class_id=? AND id='bio-activities'`).bind(created, DEFAULT_CLASS_ID),
      db.prepare(`UPDATE hub_activities SET course='Epidemiología y Salud Pública',updated_at=? WHERE class_id=? AND id='epi-2026-08-19' AND (course IS NULL OR TRIM(course)='')`).bind(created, DEFAULT_CLASS_ID)
    ]);
  })().catch((error) => { schemaPromise = null; throw error; });
  return schemaPromise;
}

function publicActor(actor) {
  return { id: actor.id, role: actor.role, name: actor.name, classId: actor.classId };
}

async function readActorProfile(db, actor) {
  const [profile, credential] = await Promise.all([
    db.prepare(`SELECT whatsapp_e164,whatsapp_format_verified_at FROM hub_editor_profiles WHERE class_id=? AND actor_id=?`).bind(actor.classId, actor.id).first(),
    actor.role === 'editor'
      ? db.prepare(`SELECT email_normalized FROM hub_editor_credentials WHERE class_id=? AND editor_id=?`).bind(actor.classId, actor.id).first()
      : Promise.resolve(null)
  ]);
  const whatsapp = cleanE164(profile?.whatsapp_e164);
  return {
    name: cleanText(actor.name, 60),
    email: normalizeEmail(credential?.email_normalized) || '',
    whatsapp,
    whatsappFormatVerifiedAt: whatsapp ? (profile?.whatsapp_format_verified_at || null) : null
  };
}

async function authenticateSession(request, db, classId) {
  const presented = readCookie(request, sessionCookieName());
  if (!isRandomToken(presented)) return null;
  const current = nowIso(), tokenHash = await digest(presented);
  const row = await db.prepare(`
    SELECT s.token_hash,s.editor_id,s.csrf_hash,s.expires_at,s.last_seen_at,e.name,e.status,c.must_change_password,c.temporary_expires_at
    FROM hub_editor_sessions s
    JOIN hub_editors e ON e.class_id=s.class_id AND e.id=s.editor_id
    JOIN hub_editor_credentials c ON c.class_id=s.class_id AND c.editor_id=s.editor_id
    WHERE s.class_id=? AND s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>?
  `).bind(classId, tokenHash, current).first();
  if (!row || row.status !== 'active') return null;
  const passwordChangeRequired = Number(row.must_change_password) === 1;
  if (passwordChangeRequired && (!row.temporary_expires_at || row.temporary_expires_at <= current)) {
    await db.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE class_id=? AND token_hash=? AND revoked_at IS NULL`).bind(current, classId, tokenHash).run();
    return null;
  }
  const refreshBefore = new Date(Date.parse(current) - 15 * 60 * 1000).toISOString();
  if (!row.last_seen_at || row.last_seen_at <= refreshBefore) {
    await db.batch([
      db.prepare(`UPDATE hub_editor_sessions SET last_seen_at=? WHERE class_id=? AND token_hash=? AND (last_seen_at IS NULL OR last_seen_at<=?)`).bind(current, classId, tokenHash, refreshBefore),
      db.prepare(`UPDATE hub_editors SET last_used_at=? WHERE class_id=? AND id=?`).bind(current, classId, row.editor_id)
    ]);
  }
  return { id: row.editor_id, role: 'editor', name: row.name, classId, authMode: 'session', sessionHash: tokenHash, csrfHash: row.csrf_hash, passwordChangeRequired };
}

async function authenticate(request, env, db, classId) {
  const header = request.headers.get('authorization') || '';
  if (header) {
    const match = header.match(/^Bearer[\t ]+([^\s].*)$/i), presented = match ? match[1].trim() : '';
    if (!presented || presented.length > 512) return null;
    if (env.MED_NYKUTO_OWNER_TOKEN && safeEqual(presented, env.MED_NYKUTO_OWNER_TOKEN)) return { id: 'owner', role: 'owner', name: 'Propietario', classId, authMode: 'bearer' };
    const tokenHash = await digest(presented);
    const editor = await db.prepare(`SELECT id,name,status,last_used_at FROM hub_editors WHERE class_id=? AND token_hash=?`).bind(classId, tokenHash).first();
    if (!editor || editor.status !== 'active') return null;
    const current = nowIso(), refreshBefore = new Date(Date.parse(current) - 15 * 60 * 1000).toISOString();
    if (!editor.last_used_at || editor.last_used_at <= refreshBefore) await db.prepare(`UPDATE hub_editors SET last_used_at=? WHERE class_id=? AND id=? AND (last_used_at IS NULL OR last_used_at<=?)`).bind(current, classId, editor.id, refreshBefore).run();
    return { id: editor.id, role: 'editor', name: editor.name, classId, authMode: 'bearer', passwordChangeRequired: false };
  }
  return authenticateSession(request, db, classId);
}

async function validSessionCsrf(request, actor) {
  if (actor?.authMode !== 'session') return true;
  const presented = request.headers.get('x-csrf-token') || '';
  const cookie = readCookie(request, csrfCookieName());
  return isRandomToken(presented)
    && isRandomToken(cookie)
    && safeEqual(presented, cookie)
    && safeEqual(await digest(presented), actor.csrfHash);
}
async function audit(db, actor, action, entityType, entityId, details = {}) { await db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)`).bind(actor.classId, actor.id, actor.role, action, entityType, entityId, JSON.stringify(details).slice(0, 2000), nowIso()).run(); }
async function auditLoginFailure(db, classId, current = nowIso()) {
  await db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,'anonymous','anonymous','auth.login.failed','authentication','management-login','{"reason":"invalid_credentials"}',?)`).bind(classId, current).run();
}

async function readScheduleSlots(db, classId, publishedOnly = true) {
  const result = publishedOnly
    ? await db.prepare(`SELECT slot.id,slot.subject_id AS subjectId,subject.name AS subject,slot.weekday,slot.starts_time AS startsTime,slot.ends_time AS endsTime,slot.label,slot.status FROM hub_schedule_slots slot JOIN hub_subjects subject ON subject.class_id=slot.class_id AND subject.id=slot.subject_id WHERE slot.class_id=? AND slot.status='published' AND subject.class_id=? AND subject.status='active' ORDER BY slot.weekday,slot.starts_time,slot.id`).bind(classId, classId).all()
    : await db.prepare(`SELECT slot.id,slot.subject_id AS subjectId,subject.name AS subject,slot.weekday,slot.starts_time AS startsTime,slot.ends_time AS endsTime,slot.label,slot.status FROM hub_schedule_slots slot JOIN hub_subjects subject ON subject.class_id=slot.class_id AND subject.id=slot.subject_id WHERE slot.class_id=? AND subject.class_id=? AND subject.status='active' ORDER BY slot.weekday,slot.starts_time,slot.id`).bind(classId, classId).all();
  return (result.results || []).map((slot) => ({ ...slot, weekday: Number(slot.weekday) }));
}

async function readPublic(db, classRecord) {
  const classId = classRecord.id;
  const [notices, tasks, activities, groups, files, dates, subjects, scheduleSlots] = await Promise.all([
    db.prepare(`SELECT n.id,n.course,n.title,n.body,n.priority,n.status,n.image_url AS imageUrl,n.image_alt AS imageAlt,u.id AS attachmentUploadId,n.attachment_title AS attachmentTitle,u.original_name AS attachmentOriginalName,u.mime_type AS attachmentMimeType,u.size_bytes AS attachmentSizeBytes,n.published_at AS publishedAt FROM hub_notices n LEFT JOIN hub_uploads u ON u.class_id=n.class_id AND u.id=n.attachment_upload_id AND u.status='linked' WHERE n.class_id=? AND n.status='published' ORDER BY CASE n.priority WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, COALESCE(n.published_at,n.updated_at) DESC`).bind(classId).all(),
    db.prepare(`SELECT id,course,title,description,due_label AS dueLabel,due_at AS dueAt,attachment_url AS attachmentUrl,attachment_title AS attachmentTitle,status FROM hub_tasks WHERE class_id=? AND status='published' ORDER BY COALESCE(due_at,'9999') ASC, updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT id,course,title,capacity,closes_at AS closesAt,status,CASE WHEN frozen=1 OR (closes_at IS NOT NULL AND closes_at<=?) THEN 1 ELSE 0 END AS frozen FROM hub_activities WHERE class_id=? AND status='published' ORDER BY updated_at DESC`).bind(nowIso(), classId).all(),
    db.prepare(`SELECT g.id,g.activity_id AS activityId,g.name,g.capacity,CASE WHEN g.frozen=1 OR a.frozen=1 OR (a.closes_at IS NOT NULL AND a.closes_at<=?) THEN 1 ELSE 0 END AS frozen,COUNT(m.id) AS memberCount FROM hub_groups g LEFT JOIN hub_memberships m ON m.class_id=g.class_id AND m.group_id=g.id JOIN hub_activities a ON a.class_id=g.class_id AND a.id=g.activity_id WHERE g.class_id=? AND a.status='published' GROUP BY g.class_id,g.id ORDER BY g.activity_id,CAST(SUBSTR(g.name,7) AS INTEGER)`).bind(nowIso(), classId).all(),
    db.prepare(`SELECT id,course,lesson_date AS lessonDate,title,url,file_type AS fileType,status FROM hub_files WHERE class_id=? AND status='published' ORDER BY updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT id,course,label,starts_at AS startsAt,status FROM hub_dates WHERE class_id=? AND status='published' ORDER BY starts_at`).bind(classId).all(),
    db.prepare(`SELECT id,name,sort_order AS "order" FROM hub_subjects WHERE class_id=? AND status='active' ORDER BY sort_order,name`).bind(classId).all(),
    readScheduleSlots(db, classId, true)
  ]);
  const decorateGroup = classId === DEFAULT_CLASS_ID ? withEpidemiologyAssignment : (group) => group;
  return { ok: true, class: publicClass(classRecord), subjects: subjects.results || [], notices: (notices.results || []).map((notice) => decorateNoticeAttachment(notice, classRecord)), tasks: tasks.results || [], activities: (activities.results || []).map((item) => ({ ...item, course: cleanText(item.course, 80), frozen: Boolean(item.frozen) })), groups: (groups.results || []).map((item) => decorateGroup({ ...item, frozen: Boolean(item.frozen), memberCount: Number(item.memberCount) || 0 })), files: files.results || [], dates: (dates.results || []).map((item) => ({ ...item, course: cleanText(item.course, 80) })), scheduleSlots, upcomingDates: upcomingScheduleDates(scheduleSlots), generatedAt: nowIso() };
}

async function adminSnapshot(db, actor, classRecord, env = null) {
  const classId = classRecord.id;
  const [subjects, tasks, notices, activities, groups, memberships, files, dates, scheduleSlots, editors, invites, profile] = await Promise.all([
    db.prepare(`SELECT id,name,sort_order AS "order",status FROM hub_subjects WHERE class_id=? ORDER BY sort_order,name`).bind(classId).all(),
    db.prepare(`SELECT *,attachment_url AS attachmentUrl,attachment_title AS attachmentTitle FROM hub_tasks WHERE class_id=? ORDER BY updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT n.*,n.image_url AS imageUrl,n.image_alt AS imageAlt,u.id AS attachmentUploadId,n.attachment_title AS attachmentTitle,u.original_name AS attachmentOriginalName,u.mime_type AS attachmentMimeType,u.size_bytes AS attachmentSizeBytes FROM hub_notices n LEFT JOIN hub_uploads u ON u.class_id=n.class_id AND u.id=n.attachment_upload_id AND u.status='linked' WHERE n.class_id=? ORDER BY n.updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT * FROM hub_activities WHERE class_id=? ORDER BY updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT * FROM hub_groups WHERE class_id=? ORDER BY activity_id,name`).bind(classId).all(),
    db.prepare(`SELECT id,activity_id,group_id,display_name,is_leader AS isLeader,joined_at,updated_at FROM hub_memberships WHERE class_id=? ORDER BY activity_id,group_id,display_name`).bind(classId).all(),
    db.prepare(`SELECT * FROM hub_files WHERE class_id=? ORDER BY updated_at DESC`).bind(classId).all(),
    db.prepare(`SELECT * FROM hub_dates WHERE class_id=? ORDER BY starts_at`).bind(classId).all(),
    readScheduleSlots(db, classId, false),
    actor.role === 'owner' ? db.prepare(`SELECT e.id,e.name,e.status,e.created_at,e.last_used_at,c.email_normalized AS email,c.must_change_password AS password_change_required,c.temporary_expires_at FROM hub_editors e LEFT JOIN hub_editor_credentials c ON c.class_id=e.class_id AND c.editor_id=e.id WHERE e.class_id=? ORDER BY e.created_at DESC`).bind(classId).all() : Promise.resolve({ results: [] }),
    actor.role === 'owner' ? db.prepare(`SELECT id,label,expires_at,revoked_at,claimed_at,created_at FROM hub_invites WHERE class_id=? ORDER BY created_at DESC LIMIT 100`).bind(classId).all() : Promise.resolve({ results: [] }),
    readActorProfile(db, actor)
  ]);
  const publishedScheduleSlots = scheduleSlots.filter((slot) => slot.status === 'published');
  return { ok: true, class: publicClass(classRecord), actor: publicActor(actor), profile, uploadPolicy: { enabled: Boolean(uploadsFrom(env)), maxBytes: MAX_NOTICE_ATTACHMENT_BYTES, maxStagedUploads: MAX_STAGED_NOTICE_UPLOADS_PER_CLASS, stagedTtlHours: NOTICE_STAGED_UPLOAD_TTL_SECONDS / 3600, acceptedMimeTypes: [...NOTICE_UPLOAD_MIME_TYPES] }, subjects: subjects.results || [], tasks: tasks.results || [], notices: (notices.results || []).map((notice) => decorateNoticeAttachment(notice, classRecord)), activities: (activities.results || []).map((item) => ({ ...item, course: cleanText(item.course, 80) })), groups: groups.results || [], memberships: (memberships.results || []).map((item) => ({ ...item, isLeader: Boolean(item.isLeader) })), files: files.results || [], dates: (dates.results || []).map((item) => ({ ...item, course: cleanText(item.course, 80) })), scheduleSlots, upcomingDates: upcomingScheduleDates(publishedScheduleSlots), editors: editors.results || [], invites: invites.results || [] };
}

async function joinGroup(data, db, classRecord) {
  const classId = classRecord.id;
  const activityId = scopedId(classId, data.activityId), groupId = scopedId(classId, data.groupId), displayName = cleanText(data.displayName, 40), suppliedStudentKey = cleanText(data.studentKey, 120);
  if (!activityId || !groupId || displayName.length < 2 || suppliedStudentKey.length < 12) return fail(400, 'invalid_membership', 'Faltan datos válidos para unirse al grupo.');
  const studentHash = await digest(classId === DEFAULT_CLASS_ID ? suppliedStudentKey : `${classId}:${suppliedStudentKey}`), current = nowIso(), membershipId = entityId(classId, '', 'member');
  try {
    const result = await db.prepare(`
      INSERT INTO hub_memberships (id,class_id,activity_id,group_id,student_hash,display_name,joined_at,updated_at)
      SELECT ?,a.class_id,a.id,g.id,?,?,?,?
      FROM hub_activities a JOIN hub_groups g ON g.class_id=a.class_id AND g.activity_id=a.id
      WHERE a.class_id=? AND a.id=? AND g.id=? AND a.status='published' AND a.frozen=0 AND g.frozen=0
        AND (a.closes_at IS NULL OR a.closes_at>?)
        AND (SELECT COUNT(*) FROM hub_memberships m WHERE m.class_id=a.class_id AND m.group_id=g.id)<MIN(a.capacity,g.capacity)
    `).bind(membershipId, studentHash, displayName, current, current, classId, activityId, groupId, current).run();
    if (!changed(result)) return fail(409, 'group_unavailable', 'El grupo está cerrado, congelado o completo.');
    const group = await db.prepare(`SELECT name FROM hub_groups WHERE class_id=? AND id=?`).bind(classId, groupId).first();
    return json({ ok: true, activityId, groupId, groupName: group?.name || 'Grupo', displayName });
  } catch (error) {
    if (/UNIQUE/i.test(String(error))) return fail(409, 'already_grouped', 'Este dispositivo ya está inscrito en un grupo de la actividad. Sal del grupo antes de cambiar.');
    throw error;
  }
}
async function leaveGroup(data, db, classRecord) { const classId = classRecord.id, activityId = scopedId(classId, data.activityId), suppliedStudentKey = cleanText(data.studentKey, 120); if (!activityId || suppliedStudentKey.length < 12) return fail(400, 'invalid_membership', 'No se pudo identificar la inscripción.'); const studentHash = await digest(classId === DEFAULT_CLASS_ID ? suppliedStudentKey : `${classId}:${suppliedStudentKey}`); const result = await db.prepare(`DELETE FROM hub_memberships WHERE class_id=? AND activity_id=? AND student_hash=? AND EXISTS (SELECT 1 FROM hub_activities a WHERE a.class_id=hub_memberships.class_id AND a.id=hub_memberships.activity_id AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?))`).bind(classId, activityId, studentHash, nowIso()).run(); return changed(result) ? json({ ok: true }) : fail(409, 'membership_locked', 'La inscripción no existe o la actividad ya está congelada.'); }

async function claimInvite(data, db, classRecord) {
  const classId = classRecord.id;
  const inviteToken = cleanText(data.inviteToken, 200), name = cleanText(data.name, 60); if (inviteToken.length < 32 || name.length < 2) return fail(400, 'invalid_invite', 'La invitación o el nombre no son válidos.');
  const inviteHash = await digest(inviteToken), current = nowIso(), invite = await db.prepare(`SELECT id FROM hub_invites WHERE class_id=? AND token_hash=? AND revoked_at IS NULL AND claimed_at IS NULL AND expires_at>?`).bind(classId, inviteHash, current).first(); if (!invite) return fail(410, 'invite_expired', 'La invitación caducó, fue revocada o ya se utilizó.');
  const claim = await db.prepare(`UPDATE hub_invites SET claimed_at=? WHERE class_id=? AND id=? AND token_hash=? AND revoked_at IS NULL AND claimed_at IS NULL AND expires_at>?`).bind(current, classId, invite.id, inviteHash, current).run();
  if (!changed(claim)) return fail(410, 'invite_expired', 'La invitación caducó, fue revocada o ya se utilizó.');
  const editorToken = token(), editorId = entityId(classId, '', 'editor');
  await db.batch([db.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?, 'active',?)`).bind(editorId, classId, name, await digest(editorToken), current), db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'editor','invite.claim','editor',?,'{}',?)`).bind(classId, editorId, editorId, current)]);
  return json({ ok: true, class: publicClass(classRecord), editorToken, editor: { id: editorId, name, role: 'editor', classId } }, 201);
}

async function createEditorSession(db, classId, editorId, actor, current = nowIso()) {
  const sessionToken = randomToken(32), csrfToken = randomToken(32), tokenHash = await digest(sessionToken), csrfHash = await digest(csrfToken);
  const expiresAt = new Date(Date.parse(current) + sessionTtlSeconds() * 1000).toISOString();
  await db.batch([
    db.prepare(`DELETE FROM hub_editor_sessions WHERE class_id=? AND (expires_at<=? OR revoked_at IS NOT NULL)`).bind(classId, current),
    db.prepare(`INSERT INTO hub_editor_sessions (token_hash,class_id,editor_id,csrf_hash,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?,?)`).bind(tokenHash, classId, editorId, csrfHash, current, expiresAt, current),
    db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'editor','auth.login','editor',?,'{}',?)`).bind(classId, actor.id, editorId, current)
  ]);
  return { sessionToken, csrfToken, tokenHash, expiresAt };
}

async function loginEditor(data, db, classRecord) {
  const classId = classRecord.id, email = normalizeEmail(data.email), password = typeof data.password === 'string' ? data.password : '';
  if (!email || temporaryPasswordProblem(password)) {
    await verifyPassword('', null);
    await auditLoginFailure(db, classId);
    return fail(401, 'invalid_credentials', INVALID_CREDENTIALS_MESSAGE);
  }
  const credential = await db.prepare(`
    SELECT c.editor_id,c.password_hash,c.password_salt,c.password_algorithm,c.password_iterations,c.password_version,c.must_change_password,c.temporary_expires_at,e.name,e.status
    FROM hub_editor_credentials c
    JOIN hub_editors e ON e.class_id=c.class_id AND e.id=c.editor_id
    WHERE c.class_id=? AND c.email_normalized=?
  `).bind(classId, email).first();
  const valid = await verifyPassword(password, credential), current = nowIso();
  const temporaryRequired = Number(credential?.must_change_password) === 1;
  const temporaryExpired = temporaryRequired && (!credential?.temporary_expires_at || credential.temporary_expires_at <= current);
  if (!valid || credential?.status !== 'active' || temporaryExpired) {
    await auditLoginFailure(db, classId, current);
    return fail(401, 'invalid_credentials', INVALID_CREDENTIALS_MESSAGE);
  }
  const actor = { id: credential.editor_id, role: 'editor', name: credential.name, classId };
  const session = await createEditorSession(db, classId, credential.editor_id, actor, current);
  return jsonWithCookies({ ok: true, class: publicClass(classRecord), actor, passwordChangeRequired: temporaryRequired, expiresAt: session.expiresAt }, 200, sessionCookies(session.sessionToken, session.csrfToken, session.expiresAt));
}

async function logoutEditor(request, db, classRecord) {
  const presented = readCookie(request, sessionCookieName());
  if (!isRandomToken(presented)) return jsonWithCookies({ ok: true }, 200, clearSessionCookies());
  const tokenHash = await digest(presented), current = nowIso();
  const row = await db.prepare(`SELECT s.editor_id,s.csrf_hash,e.name FROM hub_editor_sessions s JOIN hub_editors e ON e.class_id=s.class_id AND e.id=s.editor_id WHERE s.class_id=? AND s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>?`).bind(classRecord.id, tokenHash, current).first();
  if (!row) return jsonWithCookies({ ok: true }, 200, clearSessionCookies());
  const actor = { id: row.editor_id, role: 'editor', name: row.name, classId: classRecord.id, authMode: 'session', csrfHash: row.csrf_hash };
  if (!await validSessionCsrf(request, actor)) {
    await audit(db, actor, 'auth.csrf.rejected', 'editor', actor.id, { action: 'auth.logout' });
    return fail(403, 'csrf_rejected', 'La sesión de seguridad no coincide. Vuelve a iniciar sesión.');
  }
  await db.batch([
    db.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE class_id=? AND token_hash=? AND revoked_at IS NULL`).bind(current, classRecord.id, tokenHash),
    db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'editor','auth.logout','editor',?,'{}',?)`).bind(classRecord.id, row.editor_id, row.editor_id, current)
  ]);
  return jsonWithCookies({ ok: true }, 200, clearSessionCookies());
}

async function changeEditorPassword(data, request, actor, db, classRecord) {
  if (actor?.role !== 'editor' || actor.authMode !== 'session') return fail(403, 'session_required', 'Inicia sesión con tu correo para cambiar la contraseña.');
  if (!await validSessionCsrf(request, actor)) {
    await audit(db, actor, 'auth.csrf.rejected', 'editor', actor.id, { action: 'auth.password.change' });
    return fail(403, 'csrf_rejected', 'La sesión de seguridad no coincide. Vuelve a iniciar sesión.');
  }
  const password = typeof data.password === 'string' ? data.password : '', problem = strongPasswordProblem(password);
  if (problem) return fail(400, 'weak_password', problem);
  const existing = await db.prepare(`SELECT password_hash,password_salt,password_algorithm,password_iterations,password_version FROM hub_editor_credentials WHERE class_id=? AND editor_id=?`).bind(classRecord.id, actor.id).first();
  if (!existing) return fail(409, 'credential_missing', 'La cuenta no tiene una credencial que pueda actualizarse.');
  if (!actor.passwordChangeRequired) {
    const currentPassword = typeof data.currentPassword === 'string' ? data.currentPassword : '';
    if (!await verifyPassword(currentPassword, existing)) {
      await audit(db, actor, 'auth.password.current.rejected', 'editor', actor.id);
      return fail(401, 'invalid_current_password', 'La contraseña actual no es correcta.');
    }
  }
  if (await verifyPassword(password, existing)) return fail(400, 'password_reused', 'La nueva contraseña debe ser diferente de la contraseña temporal o anterior.');
  const verifier = await createPasswordVerifier(password), current = nowIso();
  const replacement = { sessionToken: randomToken(32), csrfToken: randomToken(32) };
  replacement.tokenHash = await digest(replacement.sessionToken);
  replacement.csrfHash = await digest(replacement.csrfToken);
  replacement.expiresAt = new Date(Date.parse(current) + sessionTtlSeconds() * 1000).toISOString();
  const results = await db.batch([
    db.prepare(`UPDATE hub_editor_credentials SET password_hash=?,password_salt=?,password_algorithm='pbkdf2-sha256',password_iterations=?,password_version=password_version+1,must_change_password=0,temporary_expires_at=NULL,updated_at=? WHERE class_id=? AND editor_id=?`).bind(verifier.hash, verifier.salt, verifier.iterations, current, classRecord.id, actor.id),
    db.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE class_id=? AND editor_id=? AND revoked_at IS NULL`).bind(current, classRecord.id, actor.id),
    db.prepare(`INSERT INTO hub_editor_sessions (token_hash,class_id,editor_id,csrf_hash,created_at,expires_at,last_seen_at) VALUES (?,?,?,?,?,?,?)`).bind(replacement.tokenHash, classRecord.id, actor.id, replacement.csrfHash, current, replacement.expiresAt, current),
    db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'editor','auth.password.change','editor',?,'{}',?)`).bind(classRecord.id, actor.id, actor.id, current)
  ]);
  if (!changed(results[0])) return fail(409, 'credential_missing', 'La cuenta no tiene una credencial que pueda actualizarse.');
  return jsonWithCookies({ ok: true, class: publicClass(classRecord), actor: publicActor(actor), passwordChangeRequired: false, expiresAt: replacement.expiresAt }, 200, sessionCookies(replacement.sessionToken, replacement.csrfToken, replacement.expiresAt));
}

async function createEditorAccount(data, actor, db, classRecord) {
  const classId = classRecord.id, name = cleanText(data.name, 60), email = normalizeEmail(data.email), password = typeof data.temporaryPassword === 'string' ? data.temporaryPassword : '';
  const passwordProblem = temporaryPasswordProblem(password);
  if (name.length < 2 || !email || passwordProblem) return fail(400, 'invalid_account', passwordProblem || 'Nombre y correo válidos son obligatorios.');
  const current = nowIso(), hours = integer(data.hours, temporaryPasswordTtlHours(), 1, temporaryPasswordTtlHours()), temporaryExpiresAt = new Date(Date.parse(current) + hours * 3600000).toISOString();
  const verifier = await createPasswordVerifier(password), editorId = entityId(classId, '', 'editor'), unusedTokenHash = await digest(randomToken(32));
  await db.batch([
    db.prepare(`INSERT INTO hub_editors (id,class_id,name,token_hash,status,created_at) VALUES (?,?,?,?,'active',?)`).bind(editorId, classId, name, unusedTokenHash, current),
    db.prepare(`INSERT INTO hub_editor_credentials (editor_id,class_id,email_normalized,password_hash,password_salt,password_algorithm,password_iterations,password_version,must_change_password,temporary_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'pbkdf2-sha256',?,1,1,?,?,?)`).bind(editorId, classId, email, verifier.hash, verifier.salt, verifier.iterations, temporaryExpiresAt, current, current),
    db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'owner','editor.account.create','editor',?,?,?)`).bind(classId, actor.id, editorId, JSON.stringify({ temporaryExpiresAt }), current)
  ]);
  return json({ ok: true, class: publicClass(classRecord), editor: { id: editorId, name, email, role: 'editor', classId, status: 'active' }, passwordChangeRequired: true, temporaryExpiresAt }, 201);
}

async function resetEditorPassword(data, actor, db, classRecord) {
  const classId = classRecord.id, editorId = scopedId(classId, data.id), password = typeof data.temporaryPassword === 'string' ? data.temporaryPassword : '', problem = temporaryPasswordProblem(password);
  if (!editorId || problem) return fail(400, 'invalid_reset', problem || 'El editor no es válido.');
  const account = await db.prepare(`SELECT c.editor_id FROM hub_editor_credentials c JOIN hub_editors e ON e.class_id=c.class_id AND e.id=c.editor_id WHERE c.class_id=? AND c.editor_id=? AND e.status='active'`).bind(classId, editorId).first();
  if (!account) return fail(404, 'credential_missing', 'La cuenta del editor no existe.');
  const current = nowIso(), hours = integer(data.hours, temporaryPasswordTtlHours(), 1, temporaryPasswordTtlHours()), temporaryExpiresAt = new Date(Date.parse(current) + hours * 3600000).toISOString(), verifier = await createPasswordVerifier(password);
  const results = await db.batch([
    db.prepare(`UPDATE hub_editor_credentials SET password_hash=?,password_salt=?,password_algorithm='pbkdf2-sha256',password_iterations=?,password_version=password_version+1,must_change_password=1,temporary_expires_at=?,updated_at=? WHERE class_id=? AND editor_id=?`).bind(verifier.hash, verifier.salt, verifier.iterations, temporaryExpiresAt, current, classId, editorId),
    db.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE class_id=? AND editor_id=? AND revoked_at IS NULL`).bind(current, classId, editorId),
    db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,'owner','editor.password.reset','editor',?,?,?)`).bind(classId, actor.id, editorId, JSON.stringify({ temporaryExpiresAt }), current)
  ]);
  if (!changed(results[0])) return fail(404, 'credential_missing', 'La cuenta del editor no existe.');
  return json({ ok: true, id: editorId, passwordChangeRequired: true, temporaryExpiresAt });
}

async function subscribePush(data, db, classRecord) {
  const classId = classRecord.id, subscription = data.subscription;
  let endpoint;
  try { endpoint = new URL(String(subscription?.endpoint || '')); } catch { endpoint = null; }
  const p256dh = String(subscription?.keys?.p256dh || ''), auth = String(subscription?.keys?.auth || '');
  if (!endpoint || endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || p256dh.length < 20 || p256dh.length > 512 || auth.length < 8 || auth.length > 256) return fail(400, 'invalid_subscription', 'La suscripción de alertas no es válida.');
  const expirationTime = subscription.expirationTime === null || subscription.expirationTime === undefined ? null : Number(subscription.expirationTime);
  const normalizedSubscription = { endpoint: endpoint.href, expirationTime: Number.isFinite(expirationTime) ? expirationTime : null, keys: { p256dh, auth } };
  const serialized = JSON.stringify(normalizedSubscription);
  if (serialized.length > 8000) return fail(413, 'subscription_too_large', 'La suscripción es demasiado grande.');
  const endpointHash = await digest(classId === DEFAULT_CLASS_ID ? endpoint.href : `${classId}:${endpoint.href}`), current = nowIso();
  await db.prepare(`INSERT INTO hub_push_subscriptions (id,class_id,endpoint_hash,subscription_json,status,created_at,updated_at) VALUES (?,?,?,?,'active',?,?) ON CONFLICT(endpoint_hash) DO UPDATE SET subscription_json=excluded.subscription_json,status='active',updated_at=excluded.updated_at WHERE hub_push_subscriptions.class_id=excluded.class_id`).bind(entityId(classId, '', 'push'), classId, endpointHash, serialized, current, current).run();
  return json({ ok: true, class: publicClass(classRecord) });
}
async function dispatchPush(env, db, classRecord, notice) {
  if (!env.MED_NYKUTO_PUSH_WEBHOOK || !notice.pushMode || !['important', 'urgent'].includes(notice.priority)) return;
  const rows = await db.prepare(`SELECT subscription_json FROM hub_push_subscriptions WHERE class_id=? AND status='active' ORDER BY updated_at DESC LIMIT 1000`).bind(classRecord.id).all();
  const subscriptions = (rows.results || []).flatMap((item) => { try { return [JSON.parse(item.subscription_json)]; } catch { return []; } });
  if (!subscriptions.length) return;
  const response = await fetch(env.MED_NYKUTO_PUSH_WEBHOOK, { method: 'POST', headers: { 'content-type': 'application/json', ...(env.MED_NYKUTO_PUSH_WEBHOOK_TOKEN ? { authorization: `Bearer ${env.MED_NYKUTO_PUSH_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify({ class: publicClass(classRecord, env), notice: { id: notice.id, title: notice.title, body: notice.body, priority: notice.priority, url: `/turma/${encodeURIComponent(classRecord.slug)}#avisos` }, subscriptions }) });
  if (!response.ok) throw new Error(`push_webhook_${response.status}`);
}

function uploadCleanupLog(event, classId, uploadId, error = null) {
  const entry = { event, classId, uploadId };
  if (error) entry.error = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify(entry));
}

async function markUploadDeleting(db, classId, candidate, options = {}) {
  const current = nowIso();
  let result;
  if (candidate.status === 'deleting') {
    const retryBefore = options.deletingRetryBefore || '';
    if (!retryBefore || !candidate.updated_at || candidate.updated_at > retryBefore) return null;
    result = await db.prepare(`UPDATE hub_uploads SET updated_at=? WHERE class_id=? AND id=? AND status='deleting' AND updated_at=? AND updated_at<=? AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(current, classId, candidate.id, candidate.updated_at, retryBefore).run();
  } else {
    const allowedStatuses = options.allowFreshStaged ? ['staged'] : ['staged', 'linked'];
    if (!allowedStatuses.includes(candidate.status)) return null;
    const staleBefore = options.staleBefore || '';
    if (!options.allowFreshStaged && (!staleBefore || !candidate.created_at || candidate.created_at > staleBefore)) return null;
    result = options.allowFreshStaged
      ? await db.prepare(`UPDATE hub_uploads SET status='deleting',updated_at=? WHERE class_id=? AND id=? AND status='staged' AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(current, classId, candidate.id).run()
      : await db.prepare(`UPDATE hub_uploads SET status='deleting',updated_at=? WHERE class_id=? AND id=? AND status IN ('staged','linked') AND created_at<=? AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(current, classId, candidate.id, staleBefore).run();
  }
  return changed(result) ? { ...candidate, deletingAt: current } : null;
}

async function deleteUnreferencedUpload(bucket, db, classId, candidate, options = {}) {
  if (!candidate || !isExpectedNoticeUploadKey(classId, candidate.id, candidate.object_key)) {
    if (candidate) uploadCleanupLog('class_hub_upload_cleanup_key_rejected', classId, candidate.id);
    return false;
  }
  const claimed = await markUploadDeleting(db, classId, candidate, options);
  if (!claimed) return false;
  try {
    await bucket.delete(claimed.object_key);
  } catch (error) {
    try {
      await db.prepare(`UPDATE hub_uploads SET status='staged',updated_at=? WHERE class_id=? AND id=? AND status='deleting' AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(nowIso(), classId, claimed.id).run();
    } catch (resetError) {
      uploadCleanupLog('class_hub_upload_cleanup_reset_error', classId, claimed.id, resetError);
    }
    uploadCleanupLog('class_hub_upload_cleanup_r2_error', classId, claimed.id, error);
    return false;
  }
  try {
    await db.prepare(`DELETE FROM hub_uploads WHERE class_id=? AND id=? AND status='deleting' AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(classId, claimed.id).run();
    return true;
  } catch (error) {
    // The R2 delete is idempotent. Leaving the row in `deleting` lets the next
    // bounded cleanup retry the metadata removal without exposing the object.
    uploadCleanupLog('class_hub_upload_cleanup_metadata_error', classId, claimed.id, error);
    return false;
  }
}

async function cleanupExpiredNoticeUploads(env, db, classId) {
  const bucket = uploadsFrom(env);
  if (!bucket) return 0;
  const currentMs = Date.now();
  const staleBefore = new Date(currentMs - NOTICE_STAGED_UPLOAD_TTL_SECONDS * 1000).toISOString();
  const deletingRetryBefore = new Date(currentMs - NOTICE_DELETING_RETRY_SECONDS * 1000).toISOString();
  const candidates = await db.prepare(`SELECT u.id,u.object_key,u.status,u.created_at,u.updated_at FROM hub_uploads u WHERE u.class_id=? AND ((u.status IN ('staged','linked') AND u.created_at<=?) OR (u.status='deleting' AND u.updated_at<=?)) AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=u.class_id AND n.attachment_upload_id=u.id) ORDER BY u.created_at,u.id LIMIT ?`).bind(classId, staleBefore, deletingRetryBefore, NOTICE_UPLOAD_CLEANUP_BATCH_SIZE).all();
  let deleted = 0;
  for (const candidate of candidates.results || []) {
    try {
      if (await deleteUnreferencedUpload(bucket, db, classId, candidate, { staleBefore, deletingRetryBefore })) deleted += 1;
    } catch (error) {
      uploadCleanupLog('class_hub_upload_cleanup_error', classId, candidate.id, error);
    }
  }
  return deleted;
}

async function cleanupDetachedNoticeUpload(env, db, classId, uploadId) {
  const bucket = uploadsFrom(env);
  if (!bucket || !uploadId) return false;
  const candidate = await db.prepare(`SELECT u.id,u.object_key,u.status,u.created_at,u.updated_at FROM hub_uploads u WHERE u.class_id=? AND u.id=? AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=u.class_id AND n.attachment_upload_id=u.id)`).bind(classId, uploadId).first();
  if (!candidate) return false;
  try {
    return await deleteUnreferencedUpload(bucket, db, classId, candidate, { allowFreshStaged: true });
  } catch (error) {
    uploadCleanupLog('class_hub_upload_detach_cleanup_error', classId, uploadId, error);
    return false;
  }
}

async function uploadNoticeAttachment(request, env, db, actor, classRecord) {
  const bucket = uploadsFrom(env);
  if (!bucket) return fail(503, 'upload_storage_unavailable', 'El almacenamiento de archivos aún no está configurado para esta versión del sitio.');
  const rawLength = String(request.headers.get('content-length') || '').trim();
  if (!/^\d+$/.test(rawLength)) return fail(411, 'upload_length_required', 'No se pudo comprobar el tamaño del archivo. Vuelve a seleccionarlo desde tu dispositivo.');
  if (Number(rawLength) > MAX_NOTICE_UPLOAD_REQUEST_BYTES) return fail(413, 'upload_too_large', 'El archivo supera el máximo permitido de 15 MB.');

  let form;
  try { form = await request.formData(); } catch { return fail(400, 'invalid_upload', 'No se pudo leer el archivo seleccionado.'); }
  const files = form.getAll('file');
  if (files.length !== 1 || !isFilePart(files[0])) return fail(400, 'invalid_upload', 'Selecciona una sola imagen o un solo PDF.');
  const file = files[0];
  if (file.size < 1) return fail(400, 'invalid_upload', 'El archivo está vacío.');
  if (file.size > MAX_NOTICE_ATTACHMENT_BYTES) return fail(413, 'upload_too_large', 'El archivo supera el máximo permitido de 15 MB.');

  const declaredMime = normalizeUploadMime(file.type);
  const detectedMime = await detectUploadMime(file);
  const genericMime = !declaredMime || ['application/octet-stream', 'binary/octet-stream'].includes(declaredMime);
  if (!detectedMime || !NOTICE_UPLOAD_MIME_TYPES.has(detectedMime) || (!genericMime && (!NOTICE_UPLOAD_MIME_TYPES.has(declaredMime) || !compatibleUploadMime(declaredMime, detectedMime)))) {
    return fail(400, 'invalid_upload_type', 'Formato no admitido. Usa PDF, JPG, PNG, WEBP, GIF, HEIC/HEIF o AVIF.');
  }

  const mimeType = genericMime ? detectedMime : declaredMime;
  const uploadId = entityId(classRecord.id, '', 'upload');
  const objectKey = noticeUploadObjectKey(classRecord.id, uploadId);
  const originalName = cleanUploadName(file.name);
  const current = nowIso();
  try {
    await cleanupExpiredNoticeUploads(env, db, classRecord.id);
  } catch (error) {
    uploadCleanupLog('class_hub_upload_preflight_cleanup_error', classRecord.id, uploadId, error);
  }
  const reservation = await db.prepare(`INSERT INTO hub_uploads (id,class_id,object_key,original_name,mime_type,size_bytes,etag,status,created_by,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'staged',?,?,? WHERE (SELECT COUNT(*) FROM hub_uploads pending WHERE pending.class_id=? AND pending.status IN ('staged','deleting'))<?`).bind(uploadId, classRecord.id, objectKey, originalName, mimeType, file.size, '', actor.id, current, current, classRecord.id, MAX_STAGED_NOTICE_UPLOADS_PER_CLASS).run();
  if (!changed(reservation)) return fail(409, 'staged_upload_quota', `Esta turma ya tiene ${MAX_STAGED_NOTICE_UPLOADS_PER_CLASS} archivos pendientes. Vincula uno a un aviso o espera a que caduquen antes de subir otro.`);
  let stored = null;
  try {
    stored = await bucket.put(objectKey, file.stream(), {
      httpMetadata: { contentType: mimeType, cacheControl: 'private, no-store' },
      customMetadata: { classId: classRecord.id, uploadId, actorId: actor.id }
    });
    await db.batch([
      db.prepare(`UPDATE hub_uploads SET etag=?,updated_at=? WHERE class_id=? AND id=? AND status='staged'`).bind(stored?.httpEtag || stored?.etag || '', nowIso(), classRecord.id, uploadId),
      db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,?,?,?,?,?,?)`).bind(classRecord.id, actor.id, actor.role, NOTICE_UPLOAD_ACTION, 'upload', uploadId, JSON.stringify({ mimeType, sizeBytes: file.size }), current)
    ]);
  } catch (error) {
    try {
      const candidate = await db.prepare(`SELECT u.id,u.object_key,u.status,u.created_at,u.updated_at FROM hub_uploads u WHERE u.class_id=? AND u.id=? AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=u.class_id AND n.attachment_upload_id=u.id)`).bind(classRecord.id, uploadId).first();
      if (candidate) await deleteUnreferencedUpload(bucket, db, classRecord.id, candidate, { allowFreshStaged: true });
    } catch (cleanupError) {
      uploadCleanupLog('class_hub_upload_rollback_error', classRecord.id, uploadId, cleanupError);
    }
    throw error;
  }

  return json({
    ok: true,
    attachment: {
      uploadId,
      originalName,
      title: originalName,
      mimeType,
      sizeBytes: file.size,
      attachmentUrl: noticeAttachmentUrl(classRecord, uploadId)
    }
  }, 201);
}

function requestedByteRange(request, totalSize) {
  const value = String(request.headers.get('range') || '').trim();
  if (!value) return { range: null };
  const match = value.match(/^bytes=(\d*)-(\d*)$/i);
  if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(totalSize) || totalSize < 1) return { error: true };
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return { error: true };
    const length = Math.min(suffix, totalSize);
    return { range: { offset: totalSize - length, length } };
  }
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : totalSize - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start < 0 || start >= totalSize || requestedEnd < start) return { error: true };
  const end = Math.min(requestedEnd, totalSize - 1);
  return { range: { offset: start, length: end - start + 1 } };
}

function encodedDispositionName(value) {
  return encodeURIComponent(cleanUploadName(value)).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function readNoticeAttachment(request, env, db, classRecord, rawUploadId) {
  const bucket = uploadsFrom(env);
  if (!bucket) return fail(503, 'upload_storage_unavailable', 'El almacenamiento de archivos aún no está configurado para esta versión del sitio.');
  const uploadId = cleanId(rawUploadId);
  if (!uploadId) return fail(404, 'attachment_not_found', 'El archivo no está disponible.');
  let metadata = await db.prepare(`SELECT u.object_key,u.original_name,u.mime_type,u.size_bytes,u.etag FROM hub_uploads u JOIN hub_notices n ON n.class_id=u.class_id AND n.attachment_upload_id=u.id WHERE u.class_id=? AND u.id=? AND u.status='linked' AND n.class_id=? AND n.status='published' LIMIT 1`).bind(classRecord.id, uploadId, classRecord.id).first();
  if (!metadata) {
    const actor = await authenticate(request, env, db, classRecord.id);
    if (!actor || actor.passwordChangeRequired) return fail(404, 'attachment_not_found', 'El archivo no está disponible.');
    metadata = await db.prepare(`SELECT u.object_key,u.original_name,u.mime_type,u.size_bytes,u.etag FROM hub_uploads u LEFT JOIN hub_notices n ON n.class_id=u.class_id AND n.attachment_upload_id=u.id WHERE u.class_id=? AND u.id=? AND u.status IN ('staged','linked') AND (u.created_by=? OR n.class_id=?) LIMIT 1`).bind(classRecord.id, uploadId, actor.id, classRecord.id).first();
  }
  if (!metadata) return fail(404, 'attachment_not_found', 'El archivo no está disponible.');

  const totalSize = Number(metadata.size_bytes);
  const requested = requestedByteRange(request, totalSize);
  if (requested.error) return fail(416, 'invalid_range', 'El fragmento solicitado no está disponible.', { 'content-range': `bytes */${Number.isSafeInteger(totalSize) ? totalSize : '*'}` });
  const object = await bucket.get(metadata.object_key, requested.range ? { range: requested.range } : undefined);
  if (!object) {
    console.error('class_hub_attachment_object_missing', { classId: classRecord.id, uploadId });
    return fail(404, 'attachment_not_found', 'El archivo no está disponible.');
  }

  const headers = new Headers({
    'content-type': normalizeUploadMime(metadata.mime_type) || 'application/octet-stream',
    'content-disposition': `inline; filename*=UTF-8''${encodedDispositionName(metadata.original_name)}`,
    'cache-control': 'private, no-store',
    'accept-ranges': 'bytes',
    'x-content-type-options': 'nosniff',
    'cross-origin-resource-policy': 'same-origin',
    'content-security-policy': "default-src 'none'; sandbox"
  });
  if (object.httpEtag || metadata.etag) headers.set('etag', object.httpEtag || metadata.etag);
  let status = 200;
  if (requested.range) {
    const { offset, length } = requested.range;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${totalSize}`);
    headers.set('content-length', String(length));
    status = 206;
  } else {
    headers.set('content-length', String(Number(object.size) || totalSize));
  }
  return new Response(object.body, { status, headers });
}

async function mutate(action, data, actor, classRecord, env, db, waitUntil) {
  const current = nowIso(), classId = classRecord.id;
  if (actor.role === 'editor' && !EDITOR_ACTIONS.has(action)) return fail(403, 'permission_denied', 'El rol editor no puede modificar cursos, preguntas, perfiles, configuración ni permisos.');
  if (action === 'editor.account.create' && actor.role === 'owner') return createEditorAccount(data, actor, db, classRecord);
  if (action === 'editor.password.reset' && actor.role === 'owner') return resetEditorPassword(data, actor, db, classRecord);
  if (action === 'profile.upsert') {
    const whatsappProvided = hasOwn(data, 'whatsapp') || hasOwn(data, 'whatsappE164') || hasOwn(data, 'whatsapp_e164');
    if (!whatsappProvided) return fail(400, 'invalid_profile', 'Indica un número de WhatsApp o deja el campo vacío para quitarlo.');
    const submittedWhatsapp = hasOwn(data, 'whatsapp') ? data.whatsapp : (hasOwn(data, 'whatsappE164') ? data.whatsappE164 : data.whatsapp_e164);
    const rawWhatsapp = cleanText(submittedWhatsapp, 40), whatsapp = cleanE164(rawWhatsapp);
    if (rawWhatsapp && !whatsapp) return fail(400, 'invalid_whatsapp', 'Escribe el número con indicativo de país, por ejemplo +595981123456.');
    const whatsappFormatVerifiedAt = whatsapp ? current : null;
    await db.prepare(`INSERT INTO hub_editor_profiles (class_id,actor_id,whatsapp_e164,whatsapp_format_verified_at,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(class_id,actor_id) DO UPDATE SET whatsapp_e164=excluded.whatsapp_e164,whatsapp_format_verified_at=excluded.whatsapp_format_verified_at,updated_at=excluded.updated_at`).bind(classId, actor.id, whatsapp, whatsappFormatVerifiedAt, current, current).run();
    await audit(db, actor, action, 'profile', actor.id, { hasWhatsapp: Boolean(whatsapp), formatVerified: Boolean(whatsappFormatVerifiedAt) });
    return json({ ok: true, profile: await readActorProfile(db, actor) });
  }
  if (action === 'class.upsert' && actor.role === 'owner') {
    const slug = cleanClassRef(data.slug), id = cleanClassRef(data.id) || slug, existing = id ? await db.prepare(`SELECT id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status FROM hub_classes WHERE id=?`).bind(id).first() : null;
    const name = cleanText(data.name, 100), semester = integer(data.semester, Number(existing?.semester) || 0, 1, 20), groupCode = data.group === undefined ? (existing?.group_code || '') : cleanText(data.group, 20);
    if (!id || !slug || !name || !semester || (data.status !== undefined && !['active', 'archived'].includes(data.status)) || (id === DEFAULT_CLASS_ID && data.status === 'archived')) return fail(400, 'invalid_class', 'Identificador, nombre, semestre y estado válidos son obligatorios. La turma base no puede archivarse.');
    const submittedDriveUrl = data.driveUrl === undefined ? null : cleanDriveUrl(data.driveUrl), driveUrl = submittedDriveUrl === null ? (existing?.drive_url || '') : submittedDriveUrl;
    if (data.driveUrl && !submittedDriveUrl) return fail(400, 'invalid_class', 'La URL de Drive no es válida.');
    const supportProvided = hasOwn(data, 'supportWhatsapp') || hasOwn(data, 'support_whatsapp'), submittedSupport = hasOwn(data, 'supportWhatsapp') ? data.supportWhatsapp : data.support_whatsapp;
    const rawSupport = supportProvided ? cleanText(submittedSupport, 40) : '', normalizedSupport = supportProvided ? cleanE164(rawSupport) : '';
    if (rawSupport && !normalizedSupport) return fail(400, 'invalid_support_whatsapp', 'El WhatsApp de contacto necesita indicativo de país, por ejemplo +595981123456.');
    const supportValue = supportProvided ? normalizedSupport : (existing?.support_whatsapp || '');
    const theme = data.theme === undefined ? (existing?.theme || 'midnight-gold') : (cleanText(data.theme, 40) || 'midnight-gold'), status = data.status === undefined ? (existing?.status || 'active') : (data.status === 'archived' ? 'archived' : 'active');
    const result = await db.prepare(`INSERT INTO hub_classes (id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,name=excluded.name,semester=excluded.semester,group_code=excluded.group_code,theme=excluded.theme,drive_url=excluded.drive_url,support_whatsapp=excluded.support_whatsapp,status=excluded.status,updated_at=excluded.updated_at`).bind(id, slug, name, semester, groupCode, theme, driveUrl, supportValue, status, current, current).run();
    if (!changed(result)) return fail(409, 'class_conflict', 'No se pudo guardar la clase.');
    await audit(db, { ...actor, classId: id }, action, 'class', id, { slug, status, hasSupportWhatsapp: Boolean(supportValue) });
    const saved = await db.prepare(`SELECT id,slug,name,semester,group_code,theme,drive_url,support_whatsapp,status FROM hub_classes WHERE id=?`).bind(id).first();
    return json({ ok: true, class: adminClass(saved, env) }, existing ? 200 : 201);
  }
  if (action === 'subject.upsert' && actor.role === 'owner') {
    const id = cleanId(data.id) || cleanId(data.slug), name = cleanText(data.name, 100), order = integer(data.order, 0, 0, 1000), status = data.status === 'archived' ? 'archived' : 'active';
    if (!id || !name || (data.status !== undefined && !['active', 'archived'].includes(data.status))) return fail(400, 'invalid_subject', 'El identificador, el nombre y el estado de la materia no son válidos.');
    await db.prepare(`INSERT INTO hub_subjects (class_id,id,name,sort_order,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(class_id,id) DO UPDATE SET name=excluded.name,sort_order=excluded.sort_order,status=excluded.status,updated_at=excluded.updated_at`).bind(classId, id, name, order, status, current, current).run();
    await audit(db, actor, action, 'subject', id, { status, order });
    return json({ ok: true, class: publicClass(classRecord), subject: { id, name, order, status } });
  }
  if (action === 'schedule.upsert' && actor.role === 'owner') {
    const id = entityId(classId, data.id, 'schedule'), subjectId = cleanId(data.subjectId), weekday = Number(data.weekday);
    const startsTime = cleanText(data.startsTime, 5), endsTime = cleanText(data.endsTime, 5), label = cleanText(data.label, 120), status = cleanStatus(data.status, 'published');
    if (!id || !subjectId || !Number.isInteger(weekday) || weekday < 1 || weekday > 7 || !TIME_PATTERN.test(startsTime) || (endsTime && !TIME_PATTERN.test(endsTime)) || (endsTime && endsTime <= startsTime) || (data.status !== undefined && !STATUSES.has(data.status))) {
      return fail(400, 'invalid_schedule', 'La materia, el día y un horario válido son obligatorios. La hora final debe ser posterior a la inicial.');
    }
    const subject = await db.prepare(`SELECT id,name FROM hub_subjects WHERE class_id=? AND id=? AND status='active'`).bind(classId, subjectId).first();
    if (!subject) return fail(404, 'subject_missing', 'La materia no existe o no está activa en esta turma.');
    const result = await db.prepare(`INSERT INTO hub_schedule_slots (id,class_id,subject_id,weekday,starts_time,ends_time,label,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET subject_id=excluded.subject_id,weekday=excluded.weekday,starts_time=excluded.starts_time,ends_time=excluded.ends_time,label=excluded.label,status=excluded.status,updated_at=excluded.updated_at WHERE hub_schedule_slots.class_id=excluded.class_id`).bind(id, classId, subjectId, weekday, startsTime, endsTime || null, label, status, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'cross_class_conflict', 'El identificador pertenece a otra clase.');
    await audit(db, actor, action, 'schedule', id, { subjectId, weekday, startsTime, status });
    return json({ ok: true, id, status, scheduleSlot: { id, subjectId, subject: subject.name, weekday, startsTime, endsTime: endsTime || null, label, status } });
  }
  if (action === 'task.upsert') {
    const id = entityId(classId, cleanId(data.id) || cleanId(data.slug), 'task'), course = cleanText(data.course, 80), title = cleanText(data.title, 180), status = cleanStatus(data.status);
    if (!course || !title) return fail(400, 'invalid_task', 'La materia y el título son obligatorios.');
    const existing = await db.prepare(`SELECT attachment_url,attachment_title FROM hub_tasks WHERE class_id=? AND id=?`).bind(classId, id).first();
    const attachmentUrlProvided = hasOwn(data, 'attachmentUrl'), attachmentTitleProvided = hasOwn(data, 'attachmentTitle');
    const rawAttachmentUrl = attachmentUrlProvided ? cleanText(data.attachmentUrl, 1500) : '';
    let attachmentUrl = attachmentUrlProvided ? cleanAttachmentUrl(data.attachmentUrl) : (existing?.attachment_url || '');
    let attachmentTitle = attachmentTitleProvided ? cleanText(data.attachmentTitle, 180) : (existing?.attachment_title || '');
    if (attachmentUrlProvided && rawAttachmentUrl && !attachmentUrl) return fail(400, 'invalid_attachment', 'El archivo debe usar una URL HTTPS válida, sin usuario ni contraseña en el enlace.');
    if (attachmentUrlProvided && !attachmentUrl && !attachmentTitleProvided) attachmentTitle = '';
    if (attachmentTitle && !attachmentUrl) return fail(400, 'invalid_attachment', 'El título del archivo necesita también una URL HTTPS válida.');
    attachmentUrl = attachmentUrl || null;
    attachmentTitle = attachmentTitle || null;
    const result = await db.prepare(`INSERT INTO hub_tasks (id,class_id,course,title,description,due_label,due_at,attachment_url,attachment_title,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,title=excluded.title,description=excluded.description,due_label=excluded.due_label,due_at=excluded.due_at,attachment_url=excluded.attachment_url,attachment_title=excluded.attachment_title,status=excluded.status,updated_at=excluded.updated_at WHERE hub_tasks.class_id=excluded.class_id`).bind(id, classId, course, title, cleanText(data.description, 1600), cleanText(data.dueLabel, 100), cleanText(data.dueAt, 40) || null, attachmentUrl, attachmentTitle, status, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'cross_class_conflict', 'El identificador pertenece a otra clase.');
    await audit(db, actor, action, 'task', id, { status, hasAttachment: Boolean(attachmentUrl) });
    return json({ ok: true, id, status, attachmentUrl, attachmentTitle });
  }
  if (action === 'notice.upsert') {
    const id = entityId(classId, data.id, 'notice'), title = cleanText(data.title, 180), status = cleanStatus(data.status), priority = cleanPriority(data.priority), pushMode = priority === 'urgent' || Boolean(data.pushMode);
    if (!title) return fail(400, 'invalid_notice', 'El título es obligatorio.');
    const body = cleanText(data.body, 1200);
    const existing = await db.prepare(`SELECT course,image_url,image_alt,attachment_upload_id,attachment_title FROM hub_notices WHERE class_id=? AND id=?`).bind(classId, id).first();
    const course = hasOwn(data, 'course') ? cleanText(data.course, 80) : cleanText(existing?.course, 80);
    const imageUrlProvided = hasOwn(data, 'imageUrl') || hasOwn(data, 'image_url'), imageAltProvided = hasOwn(data, 'imageAlt') || hasOwn(data, 'image_alt');
    const submittedImageUrl = hasOwn(data, 'imageUrl') ? data.imageUrl : data.image_url, submittedImageAlt = hasOwn(data, 'imageAlt') ? data.imageAlt : data.image_alt;
    const rawImageUrl = imageUrlProvided ? cleanText(submittedImageUrl, 1500) : '';
    let imageUrl = imageUrlProvided ? cleanAttachmentUrl(submittedImageUrl) : (existing?.image_url || '');
    let imageAlt = imageAltProvided ? cleanText(submittedImageAlt, 240) : (imageUrlProvided ? '' : (existing?.image_alt || ''));
    if (imageUrlProvided && rawImageUrl && !imageUrl) return fail(400, 'invalid_notice_image', 'La imagen debe usar una URL HTTPS válida, sin usuario ni contraseña en el enlace.');
    if (imageUrlProvided && !imageUrl && !imageAltProvided) imageAlt = '';
    const attachmentUploadIdProvided = hasOwn(data, 'attachmentUploadId') || hasOwn(data, 'attachment_upload_id');
    const attachmentTitleProvided = hasOwn(data, 'attachmentTitle') || hasOwn(data, 'attachment_title');
    const submittedAttachmentUploadId = hasOwn(data, 'attachmentUploadId') ? data.attachmentUploadId : data.attachment_upload_id;
    const submittedAttachmentTitle = hasOwn(data, 'attachmentTitle') ? data.attachmentTitle : data.attachment_title;
    const rawAttachmentUploadId = attachmentUploadIdProvided ? cleanText(submittedAttachmentUploadId, 100) : '';
    let attachmentUploadId = attachmentUploadIdProvided ? cleanId(rawAttachmentUploadId) : cleanId(existing?.attachment_upload_id);
    if (attachmentUploadIdProvided && rawAttachmentUploadId && !attachmentUploadId) return fail(400, 'invalid_notice_attachment', 'La referencia del archivo no es válida. Vuelve a seleccionarlo.');
    let upload = null;
    if (attachmentUploadId) {
      if (!uploadsFrom(env)) return fail(503, 'upload_storage_unavailable', 'El almacenamiento de archivos aún no está configurado para esta versión del sitio.');
      upload = await db.prepare(`SELECT id,original_name,mime_type,size_bytes,status FROM hub_uploads WHERE class_id=? AND id=? AND status IN ('staged','linked')`).bind(classId, attachmentUploadId).first();
      if (!upload) return fail(400, 'invalid_notice_attachment', 'El archivo no existe, fue retirado o pertenece a otra turma.');
    }
    let attachmentTitle = attachmentTitleProvided
      ? cleanText(submittedAttachmentTitle, 180)
      : (attachmentUploadIdProvided
        ? (attachmentUploadId ? (attachmentUploadId !== existing?.attachment_upload_id ? cleanUploadName(upload?.original_name) : cleanText(existing?.attachment_title, 180)) : '')
        : cleanText(existing?.attachment_title, 180));
    if (attachmentUploadId && !attachmentTitle) attachmentTitle = cleanUploadName(upload?.original_name);
    if (attachmentTitle && !attachmentUploadId) return fail(400, 'invalid_notice_attachment', 'El título necesita también un archivo seleccionado.');
    attachmentUploadId = attachmentUploadId || null;
    attachmentTitle = attachmentTitle || null;
    const attachmentIsImage = Boolean(upload && isNoticeImageMime(upload.mime_type));
    if (imageAlt && !imageUrl && !attachmentIsImage) return fail(400, 'invalid_notice_image', 'El texto alternativo necesita una imagen HTTPS o un archivo de imagen seleccionado; no puede describir un PDF.');
    imageUrl = imageUrl || null;
    imageAlt = imageAlt || null;
    const previousAttachmentUploadId = cleanId(existing?.attachment_upload_id) || null;
    const noticeValues = [id, classId, title, body, priority, status, pushMode ? 1 : 0, imageUrl, imageAlt, course, attachmentUploadId, attachmentTitle, actor.id, current, current, status === 'published' ? current : null];
    const noticeStatement = attachmentUploadId
      ? db.prepare(`INSERT INTO hub_notices (id,class_id,title,body,priority,status,push_mode,image_url,image_alt,course,attachment_upload_id,attachment_title,created_by,created_at,updated_at,published_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? FROM hub_uploads source_upload WHERE source_upload.class_id=? AND source_upload.id=? AND source_upload.status IN ('staged','linked') ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,priority=excluded.priority,status=excluded.status,push_mode=excluded.push_mode,image_url=excluded.image_url,image_alt=excluded.image_alt,course=excluded.course,attachment_upload_id=excluded.attachment_upload_id,attachment_title=excluded.attachment_title,updated_at=excluded.updated_at,published_at=excluded.published_at WHERE hub_notices.class_id=excluded.class_id`).bind(...noticeValues, classId, attachmentUploadId)
      : db.prepare(`INSERT INTO hub_notices (id,class_id,title,body,priority,status,push_mode,image_url,image_alt,course,attachment_upload_id,attachment_title,created_by,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,priority=excluded.priority,status=excluded.status,push_mode=excluded.push_mode,image_url=excluded.image_url,image_alt=excluded.image_alt,course=excluded.course,attachment_upload_id=excluded.attachment_upload_id,attachment_title=excluded.attachment_title,updated_at=excluded.updated_at,published_at=excluded.published_at WHERE hub_notices.class_id=excluded.class_id`).bind(...noticeValues);
    const statements = [noticeStatement];
    if (attachmentUploadId) statements.push(db.prepare(`UPDATE hub_uploads SET status='linked',updated_at=? WHERE class_id=? AND id=? AND status IN ('staged','linked')`).bind(current, classId, attachmentUploadId));
    if (previousAttachmentUploadId && previousAttachmentUploadId !== attachmentUploadId) statements.push(db.prepare(`UPDATE hub_uploads SET status='staged',updated_at=? WHERE class_id=? AND id=? AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(current, classId, previousAttachmentUploadId));
    const [result] = await db.batch(statements);
    if (!changed(result)) {
      if (attachmentUploadId) {
        await db.prepare(`UPDATE hub_uploads SET status='staged',updated_at=? WHERE class_id=? AND id=? AND status='linked' AND NOT EXISTS (SELECT 1 FROM hub_notices n WHERE n.class_id=hub_uploads.class_id AND n.attachment_upload_id=hub_uploads.id)`).bind(nowIso(), classId, attachmentUploadId).run();
        await cleanupDetachedNoticeUpload(env, db, classId, attachmentUploadId);
      }
      return fail(409, 'cross_class_conflict', 'El identificador pertenece a otra clase o el archivo cambió mientras se guardaba el aviso.');
    }
    if (previousAttachmentUploadId && previousAttachmentUploadId !== attachmentUploadId) await cleanupDetachedNoticeUpload(env, db, classId, previousAttachmentUploadId);
    await audit(db, actor, action, 'notice', id, { status, priority, pushMode, hasImage: Boolean(imageUrl), hasAttachment: Boolean(attachmentUploadId), course });
    if (status === 'published') { const pushJob = dispatchPush(env, db, classRecord, { id, title, body, priority, pushMode }).catch(() => audit(db, actor, 'notice.push_failed', 'notice', id)); if (typeof waitUntil === 'function') waitUntil(pushJob); else await pushJob; }
    return json({ ok: true, id, course, status, imageUrl, imageAlt, attachmentUploadId, attachmentUrl: attachmentUploadId ? noticeAttachmentUrl(classRecord, attachmentUploadId) : null, attachmentTitle, attachmentMimeType: upload ? normalizeUploadMime(upload.mime_type) : null, attachmentSizeBytes: upload ? Number(upload.size_bytes) : null });
  }
  if (action === 'activity.upsert') {
    const id = entityId(classId, data.id, 'activity'), title = cleanText(data.title, 160);
    if (!title) return fail(400, 'invalid_activity', 'El título es obligatorio.');
    const previous = await activityState(db, classId, id, current);
    if (previous.exists && previous.locked && actor.role !== 'owner') return fail(409, 'activity_locked', 'La actividad ya cerró y su composición es final.');
    const immutable = previous.exists && previous.locked, status = cleanStatus(data.status), course = hasOwn(data, 'course') ? cleanText(data.course, 80) : previous.course, capacity = immutable ? previous.capacity : integer(data.capacity, 10, 1, 50), closesAt = immutable ? previous.closesAt : (cleanText(data.closesAt, 40) || null);
    const largestGroup = await db.prepare(`SELECT COALESCE(MAX(member_count),0) AS member_count FROM (SELECT COUNT(*) AS member_count FROM hub_memberships WHERE class_id=? AND activity_id=? GROUP BY group_id)`).bind(classId, id).first();
    if (Number(largestGroup?.member_count) > capacity) return fail(409, 'capacity_below_members', 'La capacidad no puede ser menor que un grupo ya formado.');
    const result = await db.prepare(`INSERT INTO hub_activities (id,class_id,course,title,capacity,closes_at,status,frozen,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,title=excluded.title,capacity=excluded.capacity,closes_at=excluded.closes_at,status=excluded.status,updated_at=excluded.updated_at WHERE hub_activities.class_id=excluded.class_id AND excluded.capacity>=(SELECT COALESCE(MAX(member_count),0) FROM (SELECT COUNT(*) AS member_count FROM hub_memberships WHERE class_id=excluded.class_id AND activity_id=excluded.id GROUP BY group_id))`).bind(id, classId, course, title, capacity, closesAt, status, data.frozen ? 1 : 0, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'activity_conflict', 'La capacidad cambió, hay más integrantes o el identificador pertenece a otra clase.');
    await audit(db, actor, action, 'activity', id, { status, capacity, course });
    return json({ ok: true, id, course });
  }
  if (action === 'group.upsert') {
    const id = entityId(classId, data.id, 'group'), activityId = scopedId(classId, data.activityId), name = cleanText(data.name, 80);
    if (!activityId || !name) return fail(400, 'invalid_group', 'La actividad y el nombre son obligatorios.');
    const activity = await activityState(db, classId, activityId, current);
    if (!activity.exists) return fail(404, 'activity_missing', 'La actividad no existe.');
    if (activity.locked) return fail(409, 'activity_locked', 'La actividad ya cerró y su composición es final.');
    const capacity = Math.min(integer(data.capacity, 10, 1, 50), activity.capacity);
    const members = await db.prepare(`SELECT COUNT(*) AS count FROM hub_memberships WHERE class_id=? AND group_id=?`).bind(classId, id).first();
    if (Number(members?.count) > capacity) return fail(409, 'capacity_below_members', 'La capacidad no puede ser menor que el número actual de integrantes.');
    const result = await db.prepare(`INSERT INTO hub_groups (id,class_id,activity_id,name,capacity,frozen,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,capacity=excluded.capacity,updated_at=excluded.updated_at WHERE hub_groups.class_id=excluded.class_id AND hub_groups.activity_id=excluded.activity_id AND excluded.capacity>=(SELECT COUNT(*) FROM hub_memberships WHERE class_id=excluded.class_id AND group_id=excluded.id)`).bind(id, classId, activityId, name, capacity, data.frozen ? 1 : 0, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'group_conflict', 'La capacidad cambió, hay más integrantes o el identificador pertenece a otra clase o actividad.');
    await audit(db, actor, action, 'group', id, { activityId, capacity });
    return json({ ok: true, id });
  }
  if (action === 'group.freeze') {
    const activityId = scopedId(classId, data.activityId), frozen = data.frozen !== false;
    if (!activityId) return fail(400, 'invalid_activity', 'La actividad no es válida.');
    const activity = await activityState(db, classId, activityId, current);
    if (!activity.exists) return fail(404, 'activity_missing', 'La actividad no existe.');
    if (!frozen && activity.locked) return fail(409, 'activity_locked', 'Una actividad cerrada no puede volver a abrirse.');
    await db.batch([db.prepare(`UPDATE hub_activities SET frozen=?,updated_at=? WHERE class_id=? AND id=?`).bind(frozen ? 1 : 0, current, classId, activityId), db.prepare(`UPDATE hub_groups SET frozen=?,updated_at=? WHERE class_id=? AND activity_id=?`).bind(frozen ? 1 : 0, current, classId, activityId)]);
    await audit(db, actor, action, 'activity', activityId, { frozen });
    return json({ ok: true, activityId, frozen });
  }
  if (action === 'member.remove') {
    const id = scopedId(classId, data.id);
    if (!id) return fail(400, 'invalid_member', 'La inscripción no es válida.');
    const result = await db.prepare(`DELETE FROM hub_memberships WHERE class_id=? AND id=? AND EXISTS (SELECT 1 FROM hub_activities a WHERE a.class_id=hub_memberships.class_id AND a.id=hub_memberships.activity_id AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?))`).bind(classId, id, current).run();
    if (!changed(result)) return fail(409, 'membership_locked', 'La inscripción no existe o la composición ya es final.');
    await audit(db, actor, action, 'membership', id);
    return json({ ok: true });
  }
  if (action === 'member.move') {
    const id = scopedId(classId, data.id), groupId = scopedId(classId, data.groupId);
    if (!id || !groupId) return fail(400, 'invalid_member', 'La inscripción o el grupo no son válidos.');
    const result = await db.prepare(`UPDATE hub_memberships SET group_id=?,updated_at=? WHERE class_id=? AND id=? AND EXISTS (SELECT 1 FROM hub_groups target JOIN hub_activities a ON a.class_id=target.class_id AND a.id=target.activity_id WHERE target.class_id=hub_memberships.class_id AND target.id=? AND target.activity_id=hub_memberships.activity_id AND target.frozen=0 AND a.frozen=0 AND (a.closes_at IS NULL OR a.closes_at>?) AND (SELECT COUNT(*) FROM hub_memberships m WHERE m.class_id=target.class_id AND m.group_id=target.id)<MIN(a.capacity,target.capacity))`).bind(groupId, current, classId, id, groupId, current).run();
    if (!changed(result)) return fail(409, 'group_unavailable', 'El grupo de destino está lleno, cerrado o pertenece a otra actividad.');
    await audit(db, actor, action, 'membership', id, { groupId });
    return json({ ok: true });
  }
  if (action === 'file.upsert') {
    const id = entityId(classId, data.id, 'file'), title = cleanText(data.title, 180), url = cleanUrl(data.url), course = cleanText(data.course, 80), status = cleanStatus(data.status);
    if (!title || !url || !course) return fail(400, 'invalid_file', 'Materia, título y una URL HTTP(S) válida son obligatorios.');
    const result = await db.prepare(`INSERT INTO hub_files (id,class_id,course,lesson_date,title,url,file_type,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,lesson_date=excluded.lesson_date,title=excluded.title,url=excluded.url,file_type=excluded.file_type,status=excluded.status,updated_at=excluded.updated_at WHERE hub_files.class_id=excluded.class_id`).bind(id, classId, course, cleanText(data.lessonDate, 20), title, url, cleanText(data.fileType, 20) || 'link', status, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'cross_class_conflict', 'El identificador pertenece a otra clase.');
    await audit(db, actor, action, 'file', id, { status });
    return json({ ok: true, id });
  }
  if (action === 'date.upsert') {
    const id = entityId(classId, data.id, 'date'), label = cleanText(data.label, 120), startsAt = cleanText(data.startsAt, 40), status = cleanStatus(data.status);
    if (!label || !startsAt) return fail(400, 'invalid_date', 'La etiqueta y la fecha son obligatorias.');
    const existing = await db.prepare(`SELECT course FROM hub_dates WHERE class_id=? AND id=?`).bind(classId, id).first();
    const course = hasOwn(data, 'course') ? cleanText(data.course, 80) : cleanText(existing?.course, 80);
    const result = await db.prepare(`INSERT INTO hub_dates (id,class_id,course,label,starts_at,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course=excluded.course,label=excluded.label,starts_at=excluded.starts_at,status=excluded.status,updated_at=excluded.updated_at WHERE hub_dates.class_id=excluded.class_id`).bind(id, classId, course, label, startsAt, status, actor.id, current, current).run();
    if (!changed(result)) return fail(409, 'cross_class_conflict', 'El identificador pertenece a otra clase.');
    await audit(db, actor, action, 'date', id, { status, course });
    return json({ ok: true, id, course });
  }
  if (action === 'invite.create' && actor.role === 'owner') { const inviteToken = token(), id = entityId(classId, '', 'invite'), hours = integer(data.hours, 48, 1, 168), expiresAt = new Date(Date.now() + hours * 3600000).toISOString(); await db.prepare(`INSERT INTO hub_invites (id,class_id,token_hash,label,expires_at,created_by,created_at) VALUES (?,?,?,?,?,?,?)`).bind(id, classId, await digest(inviteToken), cleanText(data.label, 80) || 'Editor', expiresAt, actor.id, current).run(); await audit(db, actor, action, 'invite', id, { expiresAt }); return json({ ok: true, class: publicClass(classRecord), id, inviteToken, expiresAt }, 201); }
  if (action === 'invite.revoke' && actor.role === 'owner') { const id = scopedId(classId, data.id); if (!id) return fail(400, 'invalid_invite', 'La invitación no es válida.'); const result = await db.prepare(`UPDATE hub_invites SET revoked_at=? WHERE class_id=? AND id=? AND claimed_at IS NULL AND revoked_at IS NULL`).bind(current, classId, id).run(); if (!changed(result)) return fail(409, 'invite_unavailable', 'La invitación no existe, ya fue usada o ya fue revocada.'); await audit(db, actor, action, 'invite', id); return json({ ok: true }); }
  if (action === 'editor.revoke' && actor.role === 'owner') {
    const id = scopedId(classId, data.id);
    if (!id) return fail(400, 'invalid_editor', 'El editor no es válido.');
    const active = await db.prepare(`SELECT id FROM hub_editors WHERE class_id=? AND id=? AND status='active'`).bind(classId, id).first();
    if (!active) return fail(409, 'editor_unavailable', 'El editor no existe o ya fue revocado.');
    await db.batch([
      db.prepare(`UPDATE hub_editors SET status='revoked' WHERE class_id=? AND id=? AND status='active'`).bind(classId, id),
      db.prepare(`UPDATE hub_editor_sessions SET revoked_at=? WHERE class_id=? AND editor_id=? AND revoked_at IS NULL`).bind(current, classId, id),
      db.prepare(`DELETE FROM hub_editor_profiles WHERE class_id=? AND actor_id=?`).bind(classId, id),
      db.prepare(`INSERT INTO hub_audit (class_id,actor_id,actor_role,action,entity_type,entity_id,details,created_at) VALUES (?,?,?,?,? ,?,'{}',?)`).bind(classId, actor.id, actor.role, action, 'editor', id, current)
    ]);
    return json({ ok: true });
  }
  return fail(403, 'action_forbidden', 'La acción no está permitida para este rol.');
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url), resource = url.searchParams.get('resource') || 'public', db = dbFrom(env);
  if (resource === 'push-key') return json({ ok: true, publicKey: env.MED_NYKUTO_VAPID_PUBLIC_KEY || '' });
  if (!db) {
    const rawRefs = [url.searchParams.get('class'), url.searchParams.get('classSlug'), url.searchParams.get('classId')].filter((value) => String(value || '').trim()), refs = [...new Set(rawRefs.map(cleanClassRef))];
    if (refs.includes('') || refs.length > 1) return fail(400, 'class_mismatch', 'La clase indicada no es válida.');
    const requested = refs[0] || DEFAULT_CLASS_SLUG;
    if (resource === 'public' && requested === DEFAULT_CLASS_SLUG) {
      const scheduleSlots = defaultPublicScheduleSlots();
      return json({ ok: true, ...DEFAULT_PUBLIC, class: { ...DEFAULT_PUBLIC.class, supportWhatsapp: supportWhatsapp(DEFAULT_PUBLIC.class, env) }, scheduleSlots, upcomingDates: upcomingScheduleDates(scheduleSlots), mode: 'static-fallback' });
    }
    return fail(503, 'database_unavailable', 'La base de gestión no está configurada.');
  }
  try {
    await ensureSchema(db);
    if (resource === 'classes') {
      const limited = await rateLimit(request, env, db, DEFAULT_CLASS_ID, 'admin-read', 120, 600); if (limited) return limited;
      const actor = await authenticate(request, env, db, DEFAULT_CLASS_ID);
      if (!actor) return fail(401, 'authentication_required', 'Se necesita un acceso de propietario.');
      if (actor.role !== 'owner') return fail(403, 'permission_denied', 'El registro de clases es exclusivo del propietario.');
      return json({ ok: true, classes: await listClasses(db, env) });
    }
    const resolved = await resolveClass(request, db, null, env);
    if (resolved.error === 'class_mismatch') return fail(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
    if (!resolved.classRecord) return fail(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
    const classRecord = resolved.classRecord;
    if (resource === NOTICE_ATTACHMENT_RESOURCE) return readNoticeAttachment(request, env, db, classRecord, url.searchParams.get('upload'));
    if (resource === 'public') return json(await readPublic(db, classRecord));
    if (!['admin', 'audit', 'session'].includes(resource)) return fail(400, 'invalid_resource', 'El recurso solicitado no es válido.');
    const limited = await rateLimit(request, env, db, classRecord.id, 'admin-read', 120, 600); if (limited) return limited;
    const actor = await authenticate(request, env, db, classRecord.id);
    if (!actor) return fail(401, 'authentication_required', 'Inicia sesión como propietario o delegado de esta turma.');
    if (resource === 'session') return json({ ok: true, class: publicClass(classRecord), actor: publicActor(actor), passwordChangeRequired: Boolean(actor.passwordChangeRequired) });
    if (actor.passwordChangeRequired) return fail(403, 'password_change_required', 'Cambia la contraseña temporal antes de abrir la gestión.');
    if (resource === 'audit') {
      if (actor.role !== 'owner') return fail(403, 'permission_denied', 'El registro de auditoría es exclusivo del propietario.');
      const rows = await db.prepare(`SELECT * FROM hub_audit WHERE class_id=? ORDER BY created_at DESC LIMIT 300`).bind(classRecord.id).all();
      return json({ ok: true, class: publicClass(classRecord), audit: rows.results || [] });
    }
    if (uploadsFrom(env)) {
      const cleanupJob = cleanupExpiredNoticeUploads(env, db, classRecord.id).catch((error) => uploadCleanupLog('class_hub_upload_admin_cleanup_error', classRecord.id, '', error));
      if (typeof context.waitUntil === 'function') context.waitUntil(cleanupJob); else await cleanupJob;
    }
    return json(await adminSnapshot(db, actor, classRecord, env));
  } catch (error) {
    console.error('class_hub_get_error', error);
    return fail(500, 'server_error', 'No se pudo leer la gestión de la clase.');
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const waitUntil = typeof context.waitUntil === 'function' ? (promise) => context.waitUntil(promise) : undefined;
  if (!sameOrigin(request)) return fail(403, 'origin_rejected', 'La solicitud no proviene de este sitio.');
  const url = new URL(request.url);
  if (request.headers.get('content-type')?.toLowerCase().includes('multipart/form-data')) {
    const action = cleanText(url.searchParams.get('action'), 60), db = dbFrom(env);
    if (action !== NOTICE_UPLOAD_ACTION) return fail(400, 'invalid_upload_action', 'La operación de archivo no es válida.');
    if (!db) return fail(503, 'database_unavailable', 'La base compartida no está configurada.');
    try {
      await ensureSchema(db);
      const resolved = await resolveClass(request, db, null, env);
      if (resolved.error === 'class_mismatch') return fail(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
      if (!resolved.classRecord) return fail(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
      const classRecord = resolved.classRecord;
      const limited = await rateLimit(request, env, db, classRecord.id, 'notice-upload', 30, 3600); if (limited) return limited;
      const actor = await authenticate(request, env, db, classRecord.id);
      if (!actor) return fail(401, 'authentication_required', 'Inicia sesión como propietario o delegado de esta turma.');
      if (actor.passwordChangeRequired) return fail(403, 'password_change_required', 'Cambia la contraseña temporal antes de modificar la gestión.');
      if (!await validSessionCsrf(request, actor)) {
        await audit(db, actor, 'auth.csrf.rejected', 'editor', actor.id, { action });
        return fail(403, 'csrf_rejected', 'La sesión de seguridad no coincide. Vuelve a iniciar sesión.');
      }
      return uploadNoticeAttachment(request, env, db, actor, classRecord);
    } catch (error) {
      console.error('class_hub_upload_error', error);
      if (/UNIQUE/i.test(String(error))) return fail(409, 'upload_conflict', 'No se pudo reservar un identificador para el archivo.');
      return fail(500, 'server_error', 'No se pudo guardar el archivo.');
    }
  }
  let data; try { data = await payload(request); } catch (error) { return fail(error.message === 'payload_too_large' ? 413 : 400, error.message, 'La solicitud no es válida.'); }
  const action = cleanText(data.action, 60), db = dbFrom(env); if (!db) return fail(503, 'database_unavailable', 'La base compartida no está configurada.');
  try {
    await ensureSchema(db);
    if (action === 'class.upsert') {
      const limited = await rateLimit(request, env, db, DEFAULT_CLASS_ID, 'admin-write', 120, 600); if (limited) return limited;
      const actor = await authenticate(request, env, db, DEFAULT_CLASS_ID);
      if (!actor) return fail(401, 'authentication_required', 'Se necesita un acceso de propietario.');
      if (actor.role !== 'owner') return fail(403, 'permission_denied', 'Solo el propietario puede crear o modificar clases.');
      return mutate(action, data, actor, { id: DEFAULT_CLASS_ID }, env, db, waitUntil);
    }
    const resolved = await resolveClass(request, db, data, env);
    if (resolved.error === 'class_mismatch') return fail(400, 'class_mismatch', 'La clase indicada no es válida o no coincide.');
    if (!resolved.classRecord) return fail(404, 'class_not_found', 'La clase solicitada no existe o no está activa.');
    const classRecord = resolved.classRecord;
    if (action === 'auth.login') {
      const ipLimited = await rateLimit(request, env, db, classRecord.id, 'auth-login-ip', 10, 900); if (ipLimited) return ipLimited;
      const emailFingerprint = await digest(normalizeEmail(data.email) || 'invalid-email');
      const accountLimited = await rateLimit(request, env, db, classRecord.id, `auth-login-account:${emailFingerprint}`, 5, 900); if (accountLimited) return accountLimited;
      const distributedLimited = await rateLimitSubject(env, db, classRecord.id, 'auth-login-distributed', emailFingerprint, 50, 3600); if (distributedLimited) return distributedLimited;
      return loginEditor(data, db, classRecord);
    }
    if (action === 'auth.logout') {
      const limited = await rateLimit(request, env, db, classRecord.id, 'auth-logout', 60, 600); if (limited) return limited;
      return logoutEditor(request, db, classRecord);
    }
    const policy = action === 'invite.claim' ? ['invite-claim', 10, 3600]
      : action === 'push.subscribe' ? ['push-subscribe', 10, 3600]
        : action === 'group.join' || action === 'group.leave' ? ['group-membership', 80, 600]
          : action === 'auth.password.change' ? ['password-change', 5, 3600]
            : action === 'editor.account.create' || action === 'editor.password.reset' ? ['credential-management', 10, 3600]
              : ['admin-write', 120, 600];
    const limited = await rateLimit(request, env, db, classRecord.id, policy[0], policy[1], policy[2]); if (limited) return limited;
    if (action === 'group.join') return joinGroup(data, db, classRecord);
    if (action === 'group.leave') return leaveGroup(data, db, classRecord);
    if (action === 'invite.claim') return claimInvite(data, db, classRecord);
    if (action === 'push.subscribe') return subscribePush(data, db, classRecord);
    const actor = await authenticate(request, env, db, classRecord.id);
    if (!actor) return fail(401, 'authentication_required', 'Inicia sesión como propietario o delegado de esta turma.');
    if (action === 'auth.password.change') return changeEditorPassword(data, request, actor, db, classRecord);
    if (actor.passwordChangeRequired) return fail(403, 'password_change_required', 'Cambia la contraseña temporal antes de modificar la gestión.');
    if (!await validSessionCsrf(request, actor)) {
      await audit(db, actor, 'auth.csrf.rejected', 'editor', actor.id, { action });
      return fail(403, 'csrf_rejected', 'La sesión de seguridad no coincide. Vuelve a iniciar sesión.');
    }
    return mutate(action, data, actor, classRecord, env, db, waitUntil);
  } catch (error) {
    console.error('class_hub_post_error', error);
    if (/UNIQUE/i.test(String(error))) return fail(409, 'conflict', 'El nombre o identificador ya está en uso.');
    return fail(500, 'server_error', 'No se pudo completar la operación.');
  }
}
