const DEFAULT_CLASS_SLUG = 's4-e';
const CLASS_REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;
const CLASS_TIME_ZONE = 'America/Asuncion';
const UID_DOMAIN = 'calendar.med.nykuto.com';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=300, must-revalidate';
const encoder = new TextEncoder();

function dbFrom(env) {
  return env?.MED_NYKUTO_DB || env?.DB || null;
}

function errorResponse(status, code, message) {
  return new Response(JSON.stringify({ ok: false, code, error: message }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function classReference(request) {
  const raw = String(new URL(request.url).searchParams.get('class') || DEFAULT_CLASS_SLUG).trim().toLowerCase();
  return CLASS_REF_PATTERN.test(raw) ? raw : '';
}

function safePublicText(value, maxLength = 4000) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function escapeIcsText(value) {
  return safePublicText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function foldIcsLine(value) {
  const line = String(value ?? '').replace(/[\r\n]/g, '');
  const parts = [];
  let current = '';
  let currentBytes = 0;
  let limit = 75;

  for (const character of line) {
    const bytes = encoder.encode(character).byteLength;
    if (current && currentBytes + bytes > limit) {
      parts.push(current);
      current = character;
      currentBytes = bytes;
      limit = 74;
    } else {
      current += character;
      currentBytes += bytes;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function validDateParts(year, month, day, hour = 0, minute = 0, second = 0) {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day
    && candidate.getUTCHours() === hour
    && candidate.getUTCMinutes() === minute
    && candidate.getUTCSeconds() === second;
}

function basicDateTime(parts) {
  return `${String(parts.year).padStart(4, '0')}${String(parts.month).padStart(2, '0')}${String(parts.day).padStart(2, '0')}T${String(parts.hour).padStart(2, '0')}${String(parts.minute).padStart(2, '0')}${String(parts.second).padStart(2, '0')}`;
}

function zonedParts(date) {
  const values = {};
  new Intl.DateTimeFormat('en-CA', {
    timeZone: CLASS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).forEach((part) => {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  });
  return values;
}

export function calendarDateProperty(value) {
  const raw = String(value ?? '').trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnly) {
    const parts = { year: Number(dateOnly[1]), month: Number(dateOnly[2]), day: Number(dateOnly[3]) };
    if (!validDateParts(parts.year, parts.month, parts.day)) return '';
    return `DTSTART;VALUE=DATE:${String(parts.year).padStart(4, '0')}${String(parts.month).padStart(2, '0')}${String(parts.day).padStart(2, '0')}`;
  }

  const local = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/.exec(raw);
  if (local) {
    const parts = {
      year: Number(local[1]),
      month: Number(local[2]),
      day: Number(local[3]),
      hour: Number(local[4]),
      minute: Number(local[5]),
      second: Number(local[6] || 0)
    };
    if (!validDateParts(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second)) return '';
    return `DTSTART;TZID=${CLASS_TIME_ZONE}:${basicDateTime(parts)}`;
  }

  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)) return '';
  const instant = new Date(raw);
  if (!Number.isFinite(instant.getTime())) return '';
  return `DTSTART;TZID=${CLASS_TIME_ZONE}:${basicDateTime(zonedParts(instant))}`;
}

function utcProperty(name, value) {
  const instant = new Date(String(value ?? ''));
  if (!Number.isFinite(instant.getTime())) return '';
  return `${name}:${instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
}

function uidPart(value) {
  return encodeURIComponent(String(value ?? '').normalize('NFKC')).replace(/'/g, '%27');
}

function addLine(lines, property) {
  if (property) lines.push(foldIcsLine(property));
}

function eventLines(classRecord, type, row) {
  const dateValue = type === 'date' ? row.startsAt : row.dueAt;
  const starts = calendarDateProperty(dateValue);
  if (!starts) return [];

  const title = safePublicText(type === 'date' ? row.label : row.title, 300) || (type === 'date' ? 'Fecha de clase' : 'Tarea');
  const course = safePublicText(row.course, 120);
  const summary = course ? `${course} · ${title}` : title;
  const descriptionParts = type === 'task'
    ? [safePublicText(row.description, 3000), safePublicText(row.dueLabel, 300)].filter(Boolean)
    : [course ? `Materia: ${course}` : ''].filter(Boolean);
  const lines = ['BEGIN:VEVENT'];
  addLine(lines, `UID:${type}-${uidPart(classRecord.id)}-${uidPart(row.id)}@${UID_DOMAIN}`);
  addLine(lines, utcProperty('DTSTAMP', row.updatedAt) || 'DTSTAMP:19700101T000000Z');
  addLine(lines, utcProperty('LAST-MODIFIED', row.updatedAt));
  addLine(lines, starts);
  addLine(lines, `SUMMARY:${escapeIcsText(summary)}`);
  if (descriptionParts.length) addLine(lines, `DESCRIPTION:${escapeIcsText(descriptionParts.join('\n'))}`);
  addLine(lines, `CATEGORIES:${type === 'date' ? 'FECHA' : 'TAREA'}`);
  addLine(lines, `X-MED-NYKUTO-TYPE:${type === 'date' ? 'DATE' : 'TASK'}`);
  lines.push('STATUS:CONFIRMED', 'TRANSP:TRANSPARENT', 'END:VEVENT');
  return lines;
}

export function buildCalendar(classRecord, dates, tasks) {
  const calendarName = safePublicText(classRecord.name, 200) || `Med Nykuto · ${safePublicText(classRecord.slug, 40)}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Med Nykuto//Calendario de turma//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldIcsLine(`X-WR-CALNAME:${escapeIcsText(calendarName)}`),
    `X-WR-TIMEZONE:${CLASS_TIME_ZONE}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT5M',
    'X-PUBLISHED-TTL:PT5M',
    'BEGIN:VTIMEZONE',
    `TZID:${CLASS_TIME_ZONE}`,
    `X-LIC-LOCATION:${CLASS_TIME_ZONE}`,
    'BEGIN:STANDARD',
    'DTSTART:20241006T000000',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0300',
    'TZNAME:-03',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  (Array.isArray(dates) ? dates : []).forEach((row) => lines.push(...eventLines(classRecord, 'date', row)));
  (Array.isArray(tasks) ? tasks : []).forEach((row) => lines.push(...eventLines(classRecord, 'task', row)));
  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

async function etagFor(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `"${hex}"`;
}

function requestMatchesEtag(request, etag) {
  const candidate = request.headers.get('if-none-match');
  if (!candidate) return false;
  return candidate.split(',').some((value) => {
    const normalized = value.trim();
    return normalized === '*' || normalized === etag || normalized.replace(/^W\//i, '') === etag;
  });
}

async function calendarResponse(context, headOnly = false) {
  const classRef = classReference(context.request);
  if (!classRef) return errorResponse(400, 'invalid_class', 'La turma solicitada no es válida.');
  const db = dbFrom(context.env);
  if (!db) return errorResponse(503, 'calendar_unavailable', 'El calendario no está disponible temporalmente.');

  try {
    const classRecord = await db.prepare(`SELECT id,slug,name FROM hub_classes WHERE (slug=? OR id=?) AND status='active'`).bind(classRef, classRef).first();
    if (!classRecord) return errorResponse(404, 'class_not_found', 'La turma solicitada no existe.');

    const [datesResult, tasksResult] = await Promise.all([
      db.prepare(`SELECT id,course,label,starts_at AS startsAt,updated_at AS updatedAt FROM hub_dates WHERE class_id=? AND status='published' ORDER BY starts_at,id`).bind(classRecord.id).all(),
      db.prepare(`SELECT id,course,title,description,due_label AS dueLabel,due_at AS dueAt,updated_at AS updatedAt FROM hub_tasks WHERE class_id=? AND status='published' AND due_at IS NOT NULL AND TRIM(due_at)<>'' ORDER BY due_at,id`).bind(classRecord.id).all()
    ]);
    const body = buildCalendar(classRecord, datesResult.results || [], tasksResult.results || []);
    const etag = await etagFor(body);
    const downloadSlug = CLASS_REF_PATTERN.test(String(classRecord.slug || '').toLowerCase()) ? String(classRecord.slug).toLowerCase() : classRef;
    const headers = new Headers({
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="med-nykuto-${downloadSlug}.ics"`,
      'cache-control': CACHE_CONTROL,
      etag,
      'x-content-type-options': 'nosniff',
      'content-language': 'es'
    });
    if (requestMatchesEtag(context.request, etag)) return new Response(null, { status: 304, headers });
    return new Response(headOnly ? null : body, { status: 200, headers });
  } catch (error) {
    console.error('calendar_feed_failed', error instanceof Error ? error.message : 'unknown_error');
    return errorResponse(500, 'calendar_failed', 'No se pudo generar el calendario.');
  }
}

export function onRequestGet(context) {
  return calendarResponse(context, false);
}

export function onRequestHead(context) {
  return calendarResponse(context, true);
}
