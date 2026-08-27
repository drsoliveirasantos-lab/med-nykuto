#!/usr/bin/env node
const assert = require('node:assert/strict');
const nodeCrypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

if (!globalThis.crypto) globalThis.crypto = nodeCrypto.webcrypto;

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

async function importCalendar() {
  const source = read('functions/api/class-calendar.ics.js');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#calendar-${Date.now()}`);
}

class StatementMock {
  constructor(owner, sql, values = []) {
    this.owner = owner;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new StatementMock(this.owner, this.sql, values);
  }

  async first() {
    this.owner.calls.push({ method: 'first', sql: this.sql, values: this.values });
    if (!/FROM hub_classes/i.test(this.sql)) throw new Error(`Unexpected first query: ${this.sql}`);
    const ref = this.values[0];
    return this.owner.classes.find((item) => item.status === 'active' && (item.slug === ref || item.id === ref)) || null;
  }

  async all() {
    this.owner.calls.push({ method: 'all', sql: this.sql, values: this.values });
    const classId = this.values[0];
    if (/FROM hub_dates/i.test(this.sql)) {
      return {
        results: this.owner.dates
          .filter((item) => item.classId === classId && item.status === 'published')
          .map((item) => ({ id: item.id, course: item.course, label: item.label, startsAt: item.startsAt, updatedAt: item.updatedAt, createdBy: item.createdBy }))
      };
    }
    if (/FROM hub_tasks/i.test(this.sql)) {
      return {
        results: this.owner.tasks
          .filter((item) => item.classId === classId && item.status === 'published' && String(item.dueAt || '').trim())
          .map((item) => ({ id: item.id, course: item.course, title: item.title, description: item.description, dueLabel: item.dueLabel, dueAt: item.dueAt, updatedAt: item.updatedAt, createdBy: item.createdBy }))
      };
    }
    throw new Error(`Unexpected all query: ${this.sql}`);
  }
}

class D1Mock {
  constructor() {
    this.calls = [];
    this.classes = [
      { id: 's4-e', slug: 's4-e', name: 'Medicina · 4.º E', status: 'active' },
      { id: 's5-a-id', slug: 's5-a', name: 'Medicina · 5.º A', status: 'active' }
    ];
    this.dates = [
      {
        id: 'parcial-uno',
        classId: 's4-e',
        course: 'Fisiología II',
        label: `Parcial, respiración; ${'ñandutí '.repeat(15)}\\ repaso`,
        startsAt: '2026-08-26T11:20:00-03:00',
        status: 'published',
        updatedAt: '2026-08-20T15:00:00Z',
        createdBy: 'private-date-owner@example.test'
      },
      { id: 'fecha-borrador', classId: 's4-e', course: 'Privada', label: 'Fecha privada borrador', startsAt: '2026-08-27T08:00', status: 'draft', updatedAt: '2026-08-20T15:00:00Z' },
      { id: 'fecha-invalida', classId: 's4-e', course: 'Fisiología II', label: 'Fecha inválida', startsAt: '2026-02-31T08:00', status: 'published', updatedAt: '2026-08-20T15:00:00Z' },
      { id: 'otra-turma', classId: 's5-a-id', course: 'Patología', label: 'Dato de otra turma', startsAt: '2026-08-28T08:00', status: 'published', updatedAt: '2026-08-20T15:00:00Z' }
    ];
    this.tasks = [
      {
        id: 'trabajo-fisio',
        classId: 's4-e',
        course: 'Fisiología II',
        title: 'Trabajo final',
        description: 'Primera línea, con coma; punto y coma.\nSegunda línea \\ guía.',
        dueLabel: 'Entregar en clase',
        dueAt: '2026-08-26T12:20:00Z',
        status: 'published',
        updatedAt: '2026-08-21T12:00:00-03:00',
        createdBy: 'private-task-owner@example.test'
      },
      { id: 'sin-fecha', classId: 's4-e', course: 'Fisiología II', title: 'Sin fecha', description: '', dueLabel: '', dueAt: '', status: 'published', updatedAt: '2026-08-21T12:00:00Z' },
      { id: 'tarea-borrador', classId: 's4-e', course: 'Privada', title: 'Tarea privada borrador', description: 'No publicar', dueLabel: '', dueAt: '2026-08-30T10:00', status: 'draft', updatedAt: '2026-08-21T12:00:00Z' }
    ];
  }

  prepare(sql) {
    return new StatementMock(this, sql);
  }
}

function eventUids(body) {
  const unfolded = body.replace(/\r\n[ \t]/g, '');
  assert.match(unfolded, /X-WR-CALNAME:Medicina · 4\.º E\r\n/);
  return unfolded.split('\r\n').filter((line) => line.startsWith('UID:')).sort();
}

async function responseFor(api, db, query = '?class=s4-e', headers = {}) {
  return api.onRequestGet({
    request: new Request(`https://med.nykuto.com/api/class-calendar.ics${query}`, { headers }),
    env: { MED_NYKUTO_DB: db }
  });
}

async function main() {
  const api = await importCalendar();
  const db = new D1Mock();
  const response = await responseFor(api, db);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /^text\/calendar; charset=utf-8$/);
  assert.match(response.headers.get('content-disposition') || '', /med-nykuto-s4-e\.ics/);
  assert.match(response.headers.get('cache-control') || '', /public, max-age=300, s-maxage=300/);
  assert.match(response.headers.get('cache-control') || '', /must-revalidate/);
  assert.ok(!(response.headers.get('cache-control') || '').includes('stale-while-revalidate'), 'Calendar cache may serve stale deadlines after expiry.');
  assert.match(response.headers.get('etag') || '', /^"[a-f0-9]{64}"$/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');

  const body = await response.text();
  assert.ok(body.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(body.endsWith('END:VCALENDAR\r\n'));
  assert.equal(body.replace(/\r\n/g, '').includes('\n'), false, 'ICS contains a bare LF.');
  assert.equal(body.replace(/\r\n/g, '').includes('\r'), false, 'ICS contains a bare CR.');
  body.split('\r\n').forEach((line) => assert.ok(Buffer.byteLength(line, 'utf8') <= 75, `Folded ICS line exceeds 75 octets: ${line}`));

  const unfolded = body.replace(/\r\n[ \t]/g, '');
  assert.match(unfolded, /TZID:America\/Asuncion\r\n/);
  assert.match(unfolded, /DTSTART;TZID=America\/Asuncion:20260826T112000/);
  assert.match(unfolded, /DTSTART;TZID=America\/Asuncion:20260826T092000/);
  assert.match(unfolded, /SUMMARY:Fisiología II · Parcial\\, respiración\\; ñandutí/);
  assert.match(unfolded, /DESCRIPTION:Primera línea\\, con coma\\; punto y coma\.\\nSegunda línea \\\\ guía\.\\nEntregar en clase/);
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.equal(eventUids(body).length, 2);
  ['Fecha privada borrador', 'Tarea privada borrador', 'Dato de otra turma', 'Fecha inválida', 'private-date-owner@example.test', 'private-task-owner@example.test'].forEach((privateValue) => assert.ok(!body.includes(privateValue), `Calendar leaks excluded/private value: ${privateValue}`));

  const eventQueries = db.calls.filter((call) => call.method === 'all');
  assert.equal(eventQueries.length, 2);
  eventQueries.forEach((call) => {
    assert.deepEqual(call.values, ['s4-e']);
    assert.match(call.sql, /status='published'/);
    assert.ok(!/created_by|member|profile|editor/i.test(call.sql), `Calendar query selects a private field: ${call.sql}`);
  });
  assert.match(eventQueries.find((call) => /hub_tasks/i.test(call.sql)).sql, /due_at IS NOT NULL/);

  const etag = response.headers.get('etag');
  const notModified = await responseFor(api, db, '?class=s4-e', { 'if-none-match': `W/${etag}` });
  assert.equal(notModified.status, 304);
  assert.equal(await notModified.text(), '');
  assert.equal(notModified.headers.get('etag'), etag);

  const originalUids = eventUids(body);
  db.dates[0].label = 'Parcial modificado';
  db.dates[0].startsAt = '2026-09-02T08:00:00-03:00';
  db.dates[0].updatedAt = '2026-08-22T10:00:00Z';
  const changed = await responseFor(api, db);
  const changedBody = await changed.text();
  assert.deepEqual(eventUids(changedBody), originalUids, 'UIDs changed after mutable calendar fields were edited.');
  assert.notEqual(changed.headers.get('etag'), etag, 'ETag did not change with public calendar content.');

  const head = await api.onRequestHead({
    request: new Request('https://med.nykuto.com/api/class-calendar.ics?class=s4-e', { method: 'HEAD' }),
    env: { MED_NYKUTO_DB: db }
  });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.match(head.headers.get('etag') || '', /^"[a-f0-9]{64}"$/);

  const callsBeforeInvalid = db.calls.length;
  const invalid = await responseFor(api, db, '?class=bad_slug');
  assert.equal(invalid.status, 400);
  assert.equal(db.calls.length, callsBeforeInvalid, 'Invalid class input reached D1.');
  const missing = await responseFor(api, db, '?class=does-not-exist');
  assert.equal(missing.status, 404);
  const unavailable = await api.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-calendar.ics?class=s4-e'), env: {} });
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get('cache-control'), 'no-store');

  const html = read('turma-shell/index.html');
  const classHtml = read('clase.html');
  const runtime = read('calendar-subscription-v485.js');
  const css = read('turma-v471.css');
  const publicThemeCss = read('public-theme-v485.css');
  const worker = read('service-worker.js');
  ['calendarSubscription', 'calendarSubscribeLink', 'calendarCopyLink', 'calendarSubscriptionStatus'].forEach((id) => assert.ok(html.includes(`id="${id}"`), `Calendar subscription UI is missing #${id}.`));
  ['classCalendarSubscription', 'classCalendarSubscribeLink', 'classCalendarCopyLink', 'classCalendarSubscriptionStatus'].forEach((id) => assert.ok(classHtml.includes(`id="${id}"`), `The main Horario view is missing #${id}.`));
  assert.ok(classHtml.indexOf('id="classCalendarSubscription"') > classHtml.indexOf('id="horario"') && classHtml.indexOf('id="classCalendarSubscription"') < classHtml.indexOf('id="weeklyAgenda"'), 'The iCal controls are not discoverable inside the main Horario view.');
  assert.ok(html.includes('/turma-v471.css?v=486') && html.includes('/turma-v471.js?v=486'), 'Turma shell cache-busting version is stale.');
  assert.ok(html.includes('/calendar-subscription-v485.js?v=485') && classHtml.includes('calendar-subscription-v485.js?v=485'), 'The shared calendar subscription runtime is not loaded by both student calendar surfaces.');
  assert.ok(runtime.includes("'/api/class-calendar.ics?class='") && runtime.includes("'webcal://'") && runtime.includes('navigator.clipboard') && runtime.includes('legacyCopy'), 'Calendar URL is not class-scoped, subscribable or copyable.');
  assert.match(css, /\.calendar-subscription-actions[^}]*grid-template-columns/);
  assert.match(css, /\.calendar-subscription-actions a,[^{]*\{[^}]*min-height:46px/);
  assert.match(publicThemeCss, /\.schedule-calendar-actions :is\(a,button\)[^{]*\{[^}]*min-height:46px/);
  assert.ok(worker.includes("med-nykuto-shell-v486") && worker.includes("/turma-v471.js?v=486") && worker.includes("/turma-v471.css?v=486") && worker.includes("/calendar-subscription-v485.js?v=485"), 'Service worker does not precache the current turma and calendar assets.');

  console.log('Calendar subscription validation passed.');
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
