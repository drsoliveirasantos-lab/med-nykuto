const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const DEFAULT_CLASS_ID = 's4-e';
const SECOND_CLASS_ID = 's3-a';
const LEGACY_COHORT_KEY = 'semester-4-group-e';
const SYNTHETIC_SUPPORT_WHATSAPP = '+595981000111';

const protectedHashes = {
  'data/med-courses-data.js': '96af099ed79fd09065d97f7c2c5d32c17a3005fb56dc3151ce6ff48dfbd6beab',
  'data/med-practice-bank-init.js': '0e64c0647aeabd477628f3ddbd234a90099477836e921c4b20ca5b9391175ba6',
  'data/med-practice-bank-loader.js': '9049a0b00e7b24bc944cf53b6441abf43da17ba76829d5a29a59638a0bbb4140',
  'data/practice-bank-fisiologia.js': '9c178a48be4f14a4fd1289948203d8b321260c2512642ce216d384ffee610606',
  'data/practice-bank-microbiologia.js': '25cf194a1e227401373314b3f012588fecc755b9e19ff68b5df162fbe812fca9',
  'data/practice-bank-genetica.js': 'e1ece4ceb39e59284f44dd6c04ba2e65230e42ca265bb5a54a6d612a56ffc82c',
  'data/practice-bank-bioquimica.js': '7d73bbf133a7650769007fa5931a9f9c1c68b0fb0af76c295567db33f79fe6d9',
  'data/practice-bank-inmunologia.js': 'a1aa6137631db266497cd9c0d4bcb3723b67c835e686f5a6cba3ad83faa61f0c'
};

const hubTenantTables = [
  'hub_subjects',
  'hub_tasks',
  'hub_uploads',
  'hub_notices',
  'hub_activities',
  'hub_groups',
  'hub_memberships',
  'hub_files',
  'hub_dates',
  'hub_schedule_slots',
  'hub_invites',
  'hub_editors',
  'hub_editor_profiles',
  'hub_editor_credentials',
  'hub_editor_sessions',
  'hub_audit',
  'hub_push_subscriptions',
  'hub_rate_limits'
];
const communityTenantTables = ['community_scores', 'community_rate_limits'];

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const normalizeSql = (sql) => sql.replace(/--[^\n]*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function preparedSql(source) {
  const statements = [];
  const pattern = /\.prepare\(\s*`([\s\S]*?)`\s*\)/g;
  let match;
  while ((match = pattern.exec(source))) statements.push(match[1]);
  return statements;
}

function referencedTables(sql, candidates) {
  const normalized = normalizeSql(sql);
  return candidates.filter((table) => new RegExp(`\\b${table}\\b`, 'i').test(normalized));
}

function isSchemaSql(sql) {
  return /^(?:create|alter|pragma|drop)\b/i.test(normalizeSql(sql));
}

function isDataSql(sql) {
  return /^(?:with\b[\s\S]*?\b(?:select|insert|update|delete)\b|select|insert|update|delete|replace)\b/i.test(normalizeSql(sql));
}

function insertColumns(sql, table) {
  const match = normalizeSql(sql).match(new RegExp(`(?:insert|replace)(?:\\s+or\\s+\\w+)?\\s+into\\s+${table}\\s*\\(([^)]*)\\)`, 'i'));
  return match ? match[1].split(',').map((column) => column.trim()) : [];
}

function validateTenantSql(file, statements, tables) {
  statements.forEach((sql, index) => {
    const referenced = referencedTables(sql, tables);
    if (!referenced.length || isSchemaSql(sql) || !isDataSql(sql)) return;
    const normalized = normalizeSql(sql);
    const classMentions = (normalized.match(/\bclass_id\b/g) || []).length;
    expect(
      classMentions >= referenced.length,
      `${file}: SQL #${index + 1} references ${referenced.join(', ')} without one class_id guard per tenant table: ${normalized.slice(0, 220)}`
    );
    referenced.forEach((table) => {
      if (!new RegExp(`(?:insert|replace)(?:\\s+or\\s+\\w+)?\\s+into\\s+${table}\\b`, 'i').test(normalized)) return;
      expect(
        insertColumns(sql, table).includes('class_id'),
        `${file}: INSERT/REPLACE into ${table} does not persist class_id.`
      );
    });
  });
}

function tableDefinition(source, table) {
  const match = source.match(new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${table}\\s*\\(([\\s\\S]*?)\\)\\s*\``, 'i'));
  return match ? normalizeSql(match[1]) : '';
}

function responseCode(body) {
  return body && typeof body === 'object' ? body.code : '';
}

function responseClassId(body) {
  if (!body || typeof body !== 'object') return '';
  return body.classId || body.class?.id || body.class?.slug || body.cohort || '';
}

function hashToken(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

class GuardedStatement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new GuardedStatement(this.database, this.sql, values);
  }

  async all() {
    this.database.inspect(this.sql, this.values, 'all');
    return { results: this.database.rows(this.sql, this.values) };
  }

  async first() {
    this.database.inspect(this.sql, this.values, 'first');
    return this.database.first(this.sql, this.values);
  }

  async run() {
    this.database.inspect(this.sql, this.values, 'run');
    return this.database.run(this.sql, this.values);
  }
}

class GuardedD1Mock {
  constructor() {
    this.calls = [];
    this.errors = new Set();
    this.tableColumns = new Map();
    this.classStatuses = new Map([
      [DEFAULT_CLASS_ID, 'active'],
      [SECOND_CLASS_ID, 'active']
    ]);
    this.classSupport = new Map();
    this.scheduleSlots = new Map();
    this.tasks = new Map();
    this.notices = new Map();
    this.uploads = new Map();
    this.profiles = new Map();
    this.editorTokenHash = hashToken('editor-s4-token');
  }

  prepare(sql) {
    return new GuardedStatement(this, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  inspect(sql, values, method) {
    const normalized = normalizeSql(sql);
    this.calls.push({ sql: normalized, values, method });
    const referenced = referencedTables(sql, [...hubTenantTables, ...communityTenantTables]);
    if (!referenced.length || isSchemaSql(sql) || !isDataSql(sql)) return;

    const classMentions = (normalized.match(/\bclass_id\b/g) || []).length;
    if (classMentions < referenced.length) {
      this.errors.add(`Runtime SQL references ${referenced.join(', ')} without complete class_id isolation: ${normalized.slice(0, 220)}`);
    }

    referenced.forEach((table) => {
      if (/^(?:insert|replace)\b/i.test(normalized) && new RegExp(`\\binto\\s+${table}\\b`, 'i').test(normalized) && !insertColumns(sql, table).includes('class_id')) {
        this.errors.add(`Runtime INSERT into ${table} omitted class_id.`);
      }
    });
  }

  classFrom(values) {
    return values.find((value) => value === DEFAULT_CLASS_ID || value === SECOND_CLASS_ID) || '';
  }

  classRow(id) {
    if (id !== DEFAULT_CLASS_ID && id !== SECOND_CLASS_ID) return null;
    return {
      id,
      slug: id,
      name: id === DEFAULT_CLASS_ID ? '4.º E' : '3.º A',
      semester: id === DEFAULT_CLASS_ID ? 4 : 3,
      group_code: id === DEFAULT_CLASS_ID ? 'E' : 'A',
      groupCode: id === DEFAULT_CLASS_ID ? 'E' : 'A',
      theme: 'med-nykuto',
      drive_url: '',
      driveUrl: '',
      status: this.classStatuses.get(id) || 'active',
      support_whatsapp: this.classSupport.get(id) || '',
      supportWhatsapp: this.classSupport.get(id) || ''
    };
  }

  rows(sql, values) {
    const normalized = normalizeSql(sql);
    const pragma = normalized.match(/^pragma\s+table_info\(([^)]+)\)/i);
    if (pragma) {
      return [...(this.tableColumns.get(pragma[1]) || [])].map((name) => ({ name }));
    }
    if (/\bfrom\s+hub_classes\b/i.test(normalized)) {
      if (/\bwhere\b/i.test(normalized)) {
        const row = this.classRow(this.classFrom(values) || String(values[0] || ''));
        return row ? [row] : [];
      }
      return [this.classRow(DEFAULT_CLASS_ID), this.classRow(SECOND_CLASS_ID)];
    }
    if (/\bfrom\s+hub_schedule_slots\b/i.test(normalized)) {
      const classId = this.classFrom(values);
      const subjectNames = new Map([
        ['bioquimica-ii', 'Bioquímica II'],
        ['epidemiologia-salud-publica', 'Epidemiología y Salud Pública'],
        ['fisiologia-ii', 'Fisiología II'],
        ['microbiologia-ii-teorica', 'Microbiología II · Teórica'],
        ['microbiologia-ii-practica', 'Microbiología II · Práctica'],
        ['nutricion', 'Nutrición']
      ]);
      return [...this.scheduleSlots.values()]
        .filter((slot) => slot.classId === classId && (!/slot\.status='published'/i.test(normalized) || slot.status === 'published'))
        .map((slot) => ({ id: slot.id, subjectId: slot.subjectId, subject: subjectNames.get(slot.subjectId) || slot.subjectId, weekday: slot.weekday, startsTime: slot.startsTime, endsTime: slot.endsTime, label: slot.label, status: slot.status }));
    }
    if (/\bfrom\s+hub_uploads\s+u\b/i.test(normalized) && /\bu\.object_key\b/i.test(normalized)) {
      const classId = this.classFrom(values), staleBefore = String(values[1] || ''), deletingRetryBefore = String(values[2] || '');
      return [...this.uploads.values()]
        .filter((upload) => upload.classId === classId)
        .filter((upload) => ![...this.notices.values()].some((notice) => notice.classId === classId && notice.attachmentUploadId === upload.id))
        .filter((upload) => (['staged', 'linked'].includes(upload.status) && upload.createdAt <= staleBefore) || (upload.status === 'deleting' && upload.updatedAt <= deletingRetryBefore))
        .slice(0, Number(values[3]) || 25)
        .map((upload) => ({ id: upload.id, object_key: upload.objectKey, status: upload.status, created_at: upload.createdAt, updated_at: upload.updatedAt }));
    }
    if (/\bfrom\s+hub_notices\b/i.test(normalized)) {
      const classId = this.classFrom(values);
      return [...this.notices.values()]
        .filter((notice) => notice.classId === classId && (!/status='published'/i.test(normalized) || notice.status === 'published'))
        .map((notice) => {
          const upload = this.uploads.get(notice.attachmentUploadId);
          return {
          id: notice.id, title: notice.title, body: notice.body, priority: notice.priority, status: notice.status,
          course: notice.course || '',
          image_url: notice.imageUrl, image_alt: notice.imageAlt, imageUrl: notice.imageUrl, imageAlt: notice.imageAlt,
          attachmentUploadId: upload?.status === 'linked' ? upload.id : null,
          attachmentTitle: notice.attachmentTitle || null,
          attachmentOriginalName: upload?.originalName || null,
          attachmentMimeType: upload?.mimeType || null,
          attachmentSizeBytes: upload?.sizeBytes ?? null,
          publishedAt: notice.publishedAt
          };
        });
    }
    if (/\bfrom\s+hub_subjects\b/i.test(normalized)) return [];
    return [];
  }

  first(sql, values) {
    const normalized = normalizeSql(sql);
    const pragma = normalized.match(/^pragma\s+table_info\(([^)]+)\)/i);
    if (pragma) {
      const columns = [...(this.tableColumns.get(pragma[1]) || [])];
      return columns.length ? { name: columns[0] } : null;
    }
    if (/\bfrom\s+hub_classes\b/i.test(normalized)) {
      const row = this.classRow(this.classFrom(values) || String(values[0] || ''));
      if (/\bstatus\s*=\s*'active'/i.test(normalized) && row?.status !== 'active') return null;
      return row;
    }
    if (/\bfrom\s+hub_tasks\b/i.test(normalized)) {
      const classId = this.classFrom(values), id = String(values[1] || '');
      const task = this.tasks.get(id);
      return task?.classId === classId ? { attachment_url: task.attachmentUrl, attachment_title: task.attachmentTitle } : null;
    }
    if (/\bfrom\s+hub_uploads\s+u\s+(?:left\s+)?join\s+hub_notices\s+n\b/i.test(normalized)) {
      const classId = this.classFrom(values), uploadId = String(values[1] || ''), upload = this.uploads.get(uploadId);
      if (!upload || upload.classId !== classId) return null;
      const linkedNotice = [...this.notices.values()].find((notice) => notice.classId === classId && notice.attachmentUploadId === uploadId && (!/n\.status='published'/i.test(normalized) || notice.status === 'published'));
      const actorId = values.length > 2 ? String(values[2] || '') : '';
      if (!linkedNotice && !values.includes(upload.createdBy) && actorId !== upload.createdBy) return null;
      if (/u\.status='linked'/i.test(normalized) && upload.status !== 'linked') return null;
      return { object_key: upload.objectKey, original_name: upload.originalName, mime_type: upload.mimeType, size_bytes: upload.sizeBytes, etag: upload.etag };
    }
    if (/\bfrom\s+hub_uploads\b/i.test(normalized)) {
      const classId = this.classFrom(values), uploadId = String(values[1] || ''), upload = this.uploads.get(uploadId);
      if (!upload || upload.classId !== classId || (/status\s+in\s*\('staged','linked'\)/i.test(normalized) && !['staged', 'linked'].includes(upload.status))) return null;
      if (/not\s+exists\s*\(select\s+1\s+from\s+hub_notices/i.test(normalized) && [...this.notices.values()].some((notice) => notice.classId === classId && notice.attachmentUploadId === uploadId)) return null;
      return { id: upload.id, object_key: upload.objectKey, original_name: upload.originalName, mime_type: upload.mimeType, size_bytes: upload.sizeBytes, etag: upload.etag, status: upload.status, created_at: upload.createdAt, updated_at: upload.updatedAt };
    }
    if (/\bfrom\s+hub_notices\b/i.test(normalized)) {
      const classId = this.classFrom(values), id = String(values[1] || '');
      const notice = this.notices.get(id);
      return notice?.classId === classId ? { course: notice.course || '', image_url: notice.imageUrl, image_alt: notice.imageAlt, attachment_upload_id: notice.attachmentUploadId || null, attachment_title: notice.attachmentTitle || null } : null;
    }
    if (/\bfrom\s+hub_editor_profiles\b/i.test(normalized)) {
      const classId = this.classFrom(values), actorId = String(values[1] || '');
      const profile = this.profiles.get(`${classId}:${actorId}`);
      return profile ? { whatsapp_e164: profile.whatsapp, whatsapp_format_verified_at: profile.verifiedAt } : null;
    }
    if (/\bfrom\s+hub_editor_credentials\b/i.test(normalized) && /email_normalized/i.test(normalized)) {
      return { email_normalized: 'delegate.fixture@example.test' };
    }
    if (/\bfrom\s+hub_subjects\b/i.test(normalized)) {
      const classId = this.classFrom(values), id = String(values[1] || '');
      const known = new Set(['bioquimica-ii', 'epidemiologia-salud-publica', 'fisiologia-ii', 'microbiologia-ii-teorica', 'microbiologia-ii-practica', 'nutricion']);
      return classId && known.has(id) ? { id, name: id } : null;
    }
    if (/\bselect\s+count\s+from\s+hub_rate_limits\b/i.test(normalized)) return { count: 1 };
    if (/\bfrom\s+hub_editors\b/i.test(normalized)) {
      if (/\bid\s*=\s*\?/i.test(normalized) && /status='active'/i.test(normalized) && values.includes('editor-s4')) {
        return { id: 'editor-s4', name: 'Delegado 4.º E', status: 'active', class_id: DEFAULT_CLASS_ID };
      }
      const hasToken = values.includes(this.editorTokenHash);
      const requestedClass = this.classFrom(values);
      if (!hasToken) return null;
      // A missing class predicate intentionally behaves like the vulnerable legacy
      // query and authenticates the S4 editor everywhere. The isolation test below
      // will consequently fail until the query binds the requested class.
      if (!/\bclass_id\b/i.test(normalized) || !requestedClass || requestedClass === DEFAULT_CLASS_ID) {
        return { id: 'editor-s4', name: 'Delegado 4.º E', status: 'active', class_id: DEFAULT_CLASS_ID };
      }
      return null;
    }
    if (/\bfrom\s+hub_activities\b/i.test(normalized)) {
      return { id: 'activity-test', course: '', capacity: 10, frozen: 0, closes_at: null };
    }
    if (/\b(?:count|max)\s*\(/i.test(normalized)) return { count: 0, member_count: 0 };
    if (/\bfrom\s+hub_groups\b/i.test(normalized)) return { id: 'group-test', name: 'Grupo 1', capacity: 10, frozen: 0 };
    if (/\bfrom\s+community_scores\b/i.test(normalized)) return { count: 0, points: 0, questions: 0, participants: 0, records: 0 };
    return null;
  }

  run(sql, values = []) {
    const normalized = normalizeSql(sql);
    const create = normalized.match(/^create\s+table\s+if\s+not\s+exists\s+([a-z0-9_]+)\s*\(/i);
    if (create && !this.tableColumns.has(create[1])) {
      const columns = new Set();
      ['class_id', 'course', 'attachment_url', 'attachment_title', 'attachment_upload_id', 'image_url', 'image_alt', 'object_key', 'original_name', 'mime_type', 'size_bytes', 'etag', 'status', 'is_leader', 'support_whatsapp', 'actor_id', 'whatsapp_e164', 'whatsapp_format_verified_at'].forEach((column) => {
        if (new RegExp(`\\b${column}\\b`, 'i').test(normalized)) columns.add(column);
      });
      this.tableColumns.set(create[1], columns);
    }
    const alter = normalized.match(/^alter\s+table\s+([a-z0-9_]+)\s+add\s+column\s+([a-z0-9_]+)\b/i);
    if (alter) {
      if (!this.tableColumns.has(alter[1])) this.tableColumns.set(alter[1], new Set());
      this.tableColumns.get(alter[1]).add(alter[2]);
    }
    if (/^insert\s+into\s+hub_classes\b/i.test(normalized)) {
      const columns = insertColumns(sql, 'hub_classes'), valueByColumn = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
      const id = String(valueByColumn.id || '');
      if (this.classStatuses.has(id)) this.classStatuses.set(id, valueByColumn.status === 'archived' ? 'archived' : 'active');
      if (this.classStatuses.has(id) && valueByColumn.support_whatsapp !== undefined) this.classSupport.set(id, String(valueByColumn.support_whatsapp || ''));
    }
    if (/^insert\s+or\s+ignore\s+into\s+hub_schedule_slots\b/i.test(normalized)) {
      this.scheduleSlots.set(String(values[0]), {
        id: String(values[0]), classId: String(values[1]), subjectId: String(values[2]), weekday: Number(values[3]),
        startsTime: String(values[4]), endsTime: values[5] ? String(values[5]) : null, label: String(values[6] || ''), status: 'published'
      });
    }
    if (/^insert\s+into\s+hub_schedule_slots\b/i.test(normalized)) {
      this.scheduleSlots.set(String(values[0]), {
        id: String(values[0]), classId: String(values[1]), subjectId: String(values[2]), weekday: Number(values[3]),
        startsTime: String(values[4]), endsTime: values[5] ? String(values[5]) : null, label: String(values[6] || ''), status: String(values[7] || 'draft')
      });
    }
    if (/^insert\s+into\s+hub_tasks\b/i.test(normalized)) {
      this.tasks.set(String(values[0]), {
        id: String(values[0]), classId: String(values[1]), attachmentUrl: values[7] || null, attachmentTitle: values[8] || null
      });
    }
    if (/^insert\s+into\s+hub_notices\b/i.test(normalized)) {
      const columns = insertColumns(sql, 'hub_notices'), valueByColumn = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
      const id = String(valueByColumn.id), classId = String(valueByColumn.class_id);
      const existing = this.notices.get(id);
      if (existing && existing.classId !== classId) return { meta: { changes: 0 } };
      if (/from\s+hub_uploads\s+source_upload/i.test(normalized)) {
        const uploadId = String(values[values.length - 1] || ''), upload = this.uploads.get(uploadId);
        if (!upload || upload.classId !== classId || !['staged', 'linked'].includes(upload.status)) return { meta: { changes: 0 } };
      }
      this.notices.set(id, {
        id, classId, title: String(valueByColumn.title || ''), body: String(valueByColumn.body || ''),
        priority: String(valueByColumn.priority || 'normal'), status: String(valueByColumn.status || 'draft'),
        course: String(valueByColumn.course || ''), imageUrl: valueByColumn.image_url || null, imageAlt: valueByColumn.image_alt || null,
        attachmentUploadId: valueByColumn.attachment_upload_id || null, attachmentTitle: valueByColumn.attachment_title || null,
        publishedAt: valueByColumn.published_at || null
      });
    }
    if (/^insert\s+into\s+hub_uploads\b/i.test(normalized)) {
      const columns = insertColumns(sql, 'hub_uploads'), valueByColumn = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
      const classId = String(valueByColumn.class_id || '');
      const conditionalReservation = /select\s+count\(\*\)\s+from\s+hub_uploads\s+pending/i.test(normalized);
      if (conditionalReservation) {
        const quota = Number(values[values.length - 1]);
        const pending = [...this.uploads.values()].filter((upload) => upload.classId === classId && ['staged', 'deleting'].includes(upload.status)).length;
        if (pending >= quota) return { meta: { changes: 0 } };
      }
      this.uploads.set(String(valueByColumn.id), {
        id: String(valueByColumn.id), classId, objectKey: String(valueByColumn.object_key),
        originalName: String(valueByColumn.original_name), mimeType: String(valueByColumn.mime_type), sizeBytes: Number(valueByColumn.size_bytes),
        etag: String(valueByColumn.etag || ''), status: conditionalReservation ? 'staged' : String(valueByColumn.status || 'staged'),
        createdBy: conditionalReservation ? String(values[7] || '') : String(valueByColumn.created_by || ''),
        createdAt: conditionalReservation ? String(values[8] || '') : String(valueByColumn.created_at || new Date().toISOString()),
        updatedAt: conditionalReservation ? String(values[9] || '') : String(valueByColumn.updated_at || new Date().toISOString())
      });
    }
    if (/^update\s+hub_uploads\s+set\s+etag=/i.test(normalized)) {
      const uploadId = values.find((value) => this.uploads.has(String(value)));
      const upload = this.uploads.get(String(uploadId));
      if (upload) {
        upload.etag = String(values[0] || '');
        upload.updatedAt = String(values[1] || upload.updatedAt);
      }
    }
    if (/^update\s+hub_uploads\s+set\s+(?:status='(?:linked|staged|deleting)',)?updated_at=|^update\s+hub_uploads\s+set\s+status='(?:linked|staged|deleting)'/i.test(normalized)) {
      const uploadId = values.find((value) => this.uploads.has(String(value)));
      const upload = this.uploads.get(String(uploadId));
      if (!upload) return { meta: { changes: 0 } };
      const classId = this.classFrom(values);
      if (upload.classId !== classId) return { meta: { changes: 0 } };
      const hasReference = [...this.notices.values()].some((notice) => notice.classId === classId && notice.attachmentUploadId === upload.id);
      if (/not\s+exists\s*\(select\s+1\s+from\s+hub_notices/i.test(normalized) && hasReference) return { meta: { changes: 0 } };
      if (/status='deleting'/i.test(normalized) && upload.status === 'deleting' && /and\s+updated_at=\?/i.test(normalized)) {
        const expected = values.find((value) => value === upload.updatedAt);
        if (!expected) return { meta: { changes: 0 } };
      }
      if (/status\s+in\s*\('staged','linked'\)/i.test(normalized) && !['staged', 'linked'].includes(upload.status)) return { meta: { changes: 0 } };
      if (/and\s+status='staged'/i.test(normalized) && upload.status !== 'staged') return { meta: { changes: 0 } };
      if (/and\s+status='linked'/i.test(normalized) && upload.status !== 'linked') return { meta: { changes: 0 } };
      if (/and\s+status='deleting'/i.test(normalized) && upload.status !== 'deleting') return { meta: { changes: 0 } };
      if (/set\s+status='linked'/i.test(normalized)) upload.status = 'linked';
      else if (/set\s+status='staged'/i.test(normalized)) upload.status = 'staged';
      else if (/set\s+status='deleting'/i.test(normalized)) upload.status = 'deleting';
      upload.updatedAt = String(values[0] || upload.updatedAt);
    }
    if (/^delete\s+from\s+hub_uploads\b/i.test(normalized)) {
      const uploadId = values.find((value) => this.uploads.has(String(value)));
      const upload = this.uploads.get(String(uploadId));
      const classId = this.classFrom(values);
      if (!upload || upload.classId !== classId || upload.status !== 'deleting') return { meta: { changes: 0 } };
      const hasReference = [...this.notices.values()].some((notice) => notice.classId === classId && notice.attachmentUploadId === upload.id);
      if (hasReference) return { meta: { changes: 0 } };
      this.uploads.delete(upload.id);
    }
    if (/^insert\s+into\s+hub_editor_profiles\b/i.test(normalized)) {
      const columns = insertColumns(sql, 'hub_editor_profiles'), valueByColumn = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
      this.profiles.set(`${valueByColumn.class_id}:${valueByColumn.actor_id}`, {
        whatsapp: String(valueByColumn.whatsapp_e164 || ''), verifiedAt: valueByColumn.whatsapp_format_verified_at || null
      });
    }
    if (/^delete\s+from\s+hub_editor_profiles\b/i.test(normalized)) {
      this.profiles.delete(`${String(values[0] || '')}:${String(values[1] || '')}`);
    }
    return { meta: { changes: 1 } };
  }
}

class GuardedR2Mock {
  constructor() {
    this.objects = new Map();
    this.calls = [];
    this.failDeleteKeys = new Set();
  }

  async put(key, value, options = {}) {
    const bytes = new Uint8Array(await new Response(value).arrayBuffer());
    const etag = `"fixture-${bytes.byteLength}"`;
    this.calls.push({ method: 'put', key, options, size: bytes.byteLength });
    this.objects.set(key, { bytes, options, etag });
    return { key, size: bytes.byteLength, etag: etag.replaceAll('"', ''), httpEtag: etag, httpMetadata: options.httpMetadata || {}, customMetadata: options.customMetadata || {} };
  }

  async get(key, options = {}) {
    const stored = this.objects.get(key);
    this.calls.push({ method: 'get', key, options });
    if (!stored) return null;
    const range = options?.range || null;
    const bytes = range ? stored.bytes.slice(range.offset, range.offset + range.length) : stored.bytes;
    return {
      key,
      size: stored.bytes.byteLength,
      httpEtag: stored.etag,
      body: new Blob([bytes]).stream(),
      range: range || undefined
    };
  }

  async delete(key) {
    this.calls.push({ method: 'delete', key });
    if (this.failDeleteKeys.has(key)) throw new Error('synthetic_r2_delete_failure');
    this.objects.delete(key);
  }
}

async function importSource(file) {
  let source = read(file);
  if (file === 'functions/api/class-hub.js') {
    const helperUrl = `data:text/javascript;base64,${Buffer.from(read('functions/_lib/management-credentials.js')).toString('base64')}`;
    source = source.replace('../_lib/management-credentials.js', helperUrl);
  }
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${Date.now()}-${Math.random()}`);
}

async function classHubGet(handler, db, query, token = '', extraEnv = {}) {
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });
  const response = await handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt', MED_NYKUTO_SUPPORT_WHATSAPP: SYNTHETIC_SUPPORT_WHATSAPP, ...extraEnv } });
  return { response, body: await response.json() };
}

async function classHubRawGet(handler, db, query, token = '', extraEnv = {}, extraHeaders = {}) {
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...extraHeaders }
  });
  return handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt', ...extraEnv } });
}

async function classHubPost(handler, db, query, body, token, extraEnv = {}) {
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      origin: 'https://med.nykuto.com'
    },
    body: JSON.stringify(body)
  });
  const response = await handler({
    request,
    env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt', MED_NYKUTO_SUPPORT_WHATSAPP: SYNTHETIC_SUPPORT_WHATSAPP, ...extraEnv },
    waitUntil: (promise) => promise
  });
  return { response, body: await response.json() };
}

async function classHubUpload(handler, db, query, file, token, extraEnv = {}) {
  const form = new FormData();
  form.append('file', file);
  const serialized = new Response(form);
  const bytes = await serialized.arrayBuffer();
  const request = new Request(`https://med.nykuto.com/api/class-hub${query}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': serialized.headers.get('content-type'),
      'content-length': String(bytes.byteLength),
      origin: 'https://med.nykuto.com'
    },
    body: bytes
  });
  const response = await handler({
    request,
    env: { MED_NYKUTO_DB: db, MED_NYKUTO_OWNER_TOKEN: 'owner-token', MED_NYKUTO_RATE_SALT: 'test-salt', ...extraEnv },
    waitUntil: (promise) => promise
  });
  return { response, body: await response.json() };
}

async function communityGet(handler, db, query) {
  const request = new Request(`https://med.nykuto.com/api/community${query}`);
  const response = await handler({ request, env: { MED_NYKUTO_DB: db } });
  return { response, body: await response.json() };
}

async function communityPost(handler, db, query, body) {
  const request = new Request(`https://med.nykuto.com/api/community${query}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://med.nykuto.com',
      'CF-Connecting-IP': '203.0.113.40'
    },
    body: JSON.stringify(body)
  });
  const response = await handler({ request, env: { MED_NYKUTO_DB: db, MED_NYKUTO_RATE_SALT: 'test-salt' } });
  return { response, body: await response.json() };
}

async function validateRuntimeIsolation() {
  const db = new GuardedD1Mock();
  const classHub = await importSource('functions/api/class-hub.js');
  const community = await importSource('functions/api/community.js');

  const legacyPublic = await classHubGet(classHub.onRequestGet, db, '?resource=public');
  expect(legacyPublic.response.status === 200, `Class hub default 4.º E request failed (${legacyPublic.response.status}: ${JSON.stringify(legacyPublic.body)}).`);
  expect(responseClassId(legacyPublic.body) === DEFAULT_CLASS_ID, 'Class hub request without class must resolve to s4-e.');
  expect(legacyPublic.body.class?.supportWhatsapp === SYNTHETIC_SUPPORT_WHATSAPP, 'The configured public support WhatsApp is missing from the class contract.');
  db.classSupport.set(DEFAULT_CLASS_ID, 'invalid-legacy-value');
  const fallbackSupport = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public');
  expect(fallbackSupport.body.class?.supportWhatsapp === SYNTHETIC_SUPPORT_WHATSAPP, 'An invalid legacy class contact masks the valid environment support WhatsApp fallback.');
  db.classSupport.delete(DEFAULT_CLASS_ID);
  expect(legacyPublic.body.scheduleSlots?.length === 8, `The seeded S4 schedule must expose 8 recurring slots, got ${legacyPublic.body.scheduleSlots?.length || 0}.`);
  expect(legacyPublic.body.upcomingDates?.length > 0 && legacyPublic.body.upcomingDates.every((date) => date.subjectId && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date.startsAt)), 'Public upcoming course dates are missing their tenant subject or local datetime contract.');
  expect(!Object.prototype.hasOwnProperty.call(legacyPublic.body, 'memberships'), 'The public class response exposes nominative memberships or leader flags.');

  const s4Admin = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=admin', 'editor-s4-token');
  expect(s4Admin.response.status === 200, `The existing 4.º E editor lost access (${s4Admin.response.status}: ${JSON.stringify(s4Admin.body)}).`);
  expect(s4Admin.body.scheduleSlots?.length === 8 && s4Admin.body.upcomingDates?.length > 0, 'The delegate snapshot does not expose the recurring schedule and its upcoming dates.');

  const s3PublicSchedule = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(s3PublicSchedule.response.status === 200, `The second active class cannot read its empty schedule (${s3PublicSchedule.response.status}: ${JSON.stringify(s3PublicSchedule.body)}).`);
  expect(s3PublicSchedule.body.scheduleSlots?.length === 0 && s3PublicSchedule.body.upcomingDates?.length === 0, 'The S4 schedule leaked into another class.');

  const crossRead = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=admin', 'editor-s4-token');
  expect([401, 403].includes(crossRead.response.status), `A 4.º E editor can read another class (${crossRead.response.status}: ${JSON.stringify(crossRead.body)}).`);

  const beforeMismatchWrite = db.calls.length;
  const mismatchWrite = await classHubPost(classHub.onRequestPost, db, '?class=s3-a&classId=s4-e', {
    action: 'task.upsert',
    id: 'cross-class-probe',
    course: 'Fisiología',
    title: 'Cross-class probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect(
    mismatchWrite.response.status === 400 && responseCode(mismatchWrite.body) === 'class_mismatch',
    `Conflicting URL/body classes were not rejected (${mismatchWrite.response.status}: ${JSON.stringify(mismatchWrite.body)}).`
  );
  const mismatchWriteCalls = db.calls.slice(beforeMismatchWrite);
  expect(
    !mismatchWriteCalls.some((call) => /\b(?:insert|update)\s+(?:or\s+\w+\s+)?(?:into\s+)?hub_tasks\b/i.test(call.sql)),
    'The rejected URL/body class mismatch still wrote to hub_tasks.'
  );

  const beforeCrossWrite = db.calls.length;
  const crossWrite = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'task.upsert',
    classId: SECOND_CLASS_ID,
    id: 'cross-class-probe',
    course: 'Fisiología',
    title: 'Cross-class probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect([401, 403].includes(crossWrite.response.status), `A 4.º E editor can write to another class (${crossWrite.response.status}: ${JSON.stringify(crossWrite.body)}).`);
  const crossWriteCalls = db.calls.slice(beforeCrossWrite);
  expect(
    !crossWriteCalls.some((call) => /\b(?:insert|update)\s+(?:or\s+\w+\s+)?(?:into\s+)?hub_tasks\b/i.test(call.sql)),
    'The rejected cross-class editor request still wrote to hub_tasks.'
  );

  const s4Write = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert',
    id: 's4-compatibility-probe',
    course: 'Fisiología',
    title: 'S4 compatibility probe',
    status: 'draft'
  }, 'editor-s4-token');
  expect(s4Write.response.status === 200, `The existing 4.º E editor cannot write its own class (${s4Write.response.status}: ${JSON.stringify(s4Write.body)}).`);

  const attachmentStart = db.calls.length;
  const attachmentTask = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert', id: 'attachment-probe', course: 'Fisiología II', title: 'Guía del práctico',
    attachmentUrl: 'https://drive.google.com/file/d/backend-fixture/view', attachmentTitle: 'Guía en PDF', status: 'published'
  }, 'editor-s4-token');
  expect(attachmentTask.response.status === 200 && attachmentTask.body.attachmentUrl === 'https://drive.google.com/file/d/backend-fixture/view' && attachmentTask.body.attachmentTitle === 'Guía en PDF', `A valid HTTPS task attachment was rejected (${attachmentTask.response.status}: ${JSON.stringify(attachmentTask.body)}).`);
  const attachmentWrite = db.calls.slice(attachmentStart).find((call) => /^insert\s+into\s+hub_tasks\b/i.test(call.sql) && call.values[0] === 'attachment-probe');
  expect(Boolean(attachmentWrite) && attachmentWrite.values[1] === DEFAULT_CLASS_ID && attachmentWrite.values[7] === 'https://drive.google.com/file/d/backend-fixture/view' && attachmentWrite.values[8] === 'Guía en PDF', 'Task attachment INSERT bindings are missing, reordered or not class-scoped.');

  const preservedAttachment = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert', id: 'attachment-probe', course: 'Fisiología II', title: 'Guía actualizada', status: 'published'
  }, 'editor-s4-token');
  expect(preservedAttachment.response.status === 200 && preservedAttachment.body.attachmentUrl === 'https://drive.google.com/file/d/backend-fixture/view' && preservedAttachment.body.attachmentTitle === 'Guía en PDF', 'Updating an old task payload without attachment fields erased its existing attachment.');

  const invalidAttachmentStart = db.calls.length;
  const invalidAttachment = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert', id: 'unsafe-attachment-probe', course: 'Fisiología II', title: 'Enlace inseguro',
    attachmentUrl: 'http://example.test/file.pdf', attachmentTitle: 'No aceptar', status: 'draft'
  }, 'editor-s4-token');
  expect(invalidAttachment.response.status === 400 && responseCode(invalidAttachment.body) === 'invalid_attachment', `An insecure task attachment URL was accepted (${invalidAttachment.response.status}: ${JSON.stringify(invalidAttachment.body)}).`);
  expect(!db.calls.slice(invalidAttachmentStart).some((call) => /^insert\s+into\s+hub_tasks\b/i.test(call.sql)), 'A rejected insecure attachment still wrote to hub_tasks.');

  const noticeImageStart = db.calls.length;
  const imageNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'official-exam-notice', title: 'Fecha oficial del examen', body: 'Consulta el cronograma.',
    priority: 'important', status: 'published', imageUrl: 'https://example.test/official-exam.webp', imageAlt: 'Cronograma oficial del examen'
  }, 'editor-s4-token');
  expect(imageNotice.response.status === 200 && imageNotice.body.imageUrl === 'https://example.test/official-exam.webp' && imageNotice.body.imageAlt === 'Cronograma oficial del examen', `A valid HTTPS notice image was rejected (${imageNotice.response.status}: ${JSON.stringify(imageNotice.body)}).`);
  const noticeWrite = db.calls.slice(noticeImageStart).find((call) => /^insert\s+into\s+hub_notices\b/i.test(call.sql) && call.values[0] === 'official-exam-notice');
  expect(Boolean(noticeWrite) && noticeWrite.values[1] === DEFAULT_CLASS_ID && noticeWrite.values[7] === 'https://example.test/official-exam.webp' && noticeWrite.values[8] === 'Cronograma oficial del examen', 'Notice image INSERT bindings are missing, reordered or not class-scoped.');

  const preservedNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'official-exam-notice', title: 'Fecha oficial actualizada', body: 'Consulta el cronograma.', priority: 'important', status: 'published'
  }, 'editor-s4-token');
  expect(preservedNotice.response.status === 200 && preservedNotice.body.imageUrl === 'https://example.test/official-exam.webp' && preservedNotice.body.imageAlt === 'Cronograma oficial del examen', 'Updating a notice without image fields erased its existing image.');

  const changedNoticeImage = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'official-exam-notice', title: 'Nueva imagen oficial', body: 'Consulta la nueva imagen.', priority: 'important', status: 'published', imageUrl: 'https://example.test/official-exam-v2.webp'
  }, 'editor-s4-token');
  expect(changedNoticeImage.response.status === 200 && changedNoticeImage.body.imageUrl === 'https://example.test/official-exam-v2.webp' && changedNoticeImage.body.imageAlt === null, 'Changing a notice image without a new alt text preserved a misleading description from the previous image.');

  const invalidNoticeStart = db.calls.length;
  const invalidNoticeImage = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'unsafe-notice-image', title: 'Imagen insegura', imageUrl: 'http://example.test/exam.jpg', status: 'draft'
  }, 'editor-s4-token');
  expect(invalidNoticeImage.response.status === 400 && responseCode(invalidNoticeImage.body) === 'invalid_notice_image', `An insecure notice image URL was accepted (${invalidNoticeImage.response.status}: ${JSON.stringify(invalidNoticeImage.body)}).`);
  expect(!db.calls.slice(invalidNoticeStart).some((call) => /^insert\s+into\s+hub_notices\b/i.test(call.sql)), 'A rejected insecure notice image still wrote to hub_notices.');

  const r2 = new GuardedR2Mock();
  const pdfFile = new File([new TextEncoder().encode('%PDF-1.7\nMed Nykuto fixture')], 'cronograma oficial.pdf', { type: 'application/pdf' });
  const missingStorage = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token');
  expect(missingStorage.response.status === 503 && responseCode(missingStorage.body) === 'upload_storage_unavailable', `A missing R2 binding does not fail explicitly (${missingStorage.response.status}: ${JSON.stringify(missingStorage.body)}).`);

  const uploaded = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  const uploadId = uploaded.body.attachment?.uploadId;
  expect(uploaded.response.status === 201 && /^upload-[a-f0-9-]{36}$/.test(uploadId || '') && uploaded.body.attachment?.mimeType === 'application/pdf' && uploaded.body.attachment?.sizeBytes === pdfFile.size, `A valid PDF upload failed (${uploaded.response.status}: ${JSON.stringify(uploaded.body)}).`);
  const uploadedMetadata = db.uploads.get(uploadId);
  expect(uploadedMetadata?.classId === DEFAULT_CLASS_ID && uploadedMetadata?.status === 'staged' && uploadedMetadata?.objectKey === `classes/${DEFAULT_CLASS_ID}/notices/${uploadId}`, 'Uploaded metadata is not staged and isolated under the class R2 key prefix.');
  const r2Put = r2.calls.find((call) => call.method === 'put' && call.key === uploadedMetadata?.objectKey);
  expect(r2Put?.options?.httpMetadata?.contentType === 'application/pdf' && r2Put?.options?.customMetadata?.classId === DEFAULT_CLASS_ID, 'The R2 object is missing safe HTTP metadata or class-scoped custom metadata.');

  const spoofedFile = new File([new TextEncoder().encode('<svg onload=alert(1)>')], 'fausse-image.png', { type: 'image/png' });
  const beforeSpoofedPut = r2.calls.filter((call) => call.method === 'put').length;
  const spoofedUpload = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', spoofedFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(spoofedUpload.response.status === 400 && responseCode(spoofedUpload.body) === 'invalid_upload_type', `A file whose bytes contradict its image MIME type was accepted (${spoofedUpload.response.status}: ${JSON.stringify(spoofedUpload.body)}).`);
  expect(r2.calls.filter((call) => call.method === 'put').length === beforeSpoofedPut, 'A rejected spoofed image was still written to R2.');

  const orphanAlt = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'alt-without-image', title: 'Texto alternativo huérfano', status: 'draft', imageAlt: 'No debe aceptarse'
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(orphanAlt.response.status === 400 && responseCode(orphanAlt.body) === 'invalid_notice_image', `Alt text without any image was accepted (${orphanAlt.response.status}: ${JSON.stringify(orphanAlt.body)}).`);

  const pdfAlt = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'pdf-alt-probe', title: 'PDF sin imagen', status: 'draft', attachmentUploadId: uploadId, imageAlt: 'No puede describir un PDF'
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(pdfAlt.response.status === 400 && responseCode(pdfAlt.body) === 'invalid_notice_image', `A PDF attachment was incorrectly accepted as the image required by alt text (${pdfAlt.response.status}: ${JSON.stringify(pdfAlt.body)}).`);
  expect(db.uploads.get(uploadId)?.status === 'staged', 'Rejecting PDF-only alt text changed the staged upload lifecycle.');

  const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x4d, 0x65, 0x64]);
  const pngFile = new File([pngBytes], 'aviso oficial.png', { type: 'image/png' });
  const imageUpload = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pngFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  const imageUploadId = imageUpload.body.attachment?.uploadId;
  expect(imageUpload.response.status === 201 && imageUpload.body.attachment?.mimeType === 'image/png', `A valid PNG notice upload failed (${imageUpload.response.status}: ${JSON.stringify(imageUpload.body)}).`);
  const uploadedImageNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'uploaded-image-notice', title: 'Aviso con imagen subida', status: 'published', attachmentUploadId: imageUploadId, imageAlt: 'Afiche oficial de la facultad'
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(uploadedImageNotice.response.status === 200 && uploadedImageNotice.body.imageUrl === null && uploadedImageNotice.body.imageAlt === 'Afiche oficial de la facultad' && uploadedImageNotice.body.attachmentMimeType === 'image/png', `Alt text was rejected or lost for an uploaded raster image (${uploadedImageNotice.response.status}: ${JSON.stringify(uploadedImageNotice.body)}).`);

  const attachedNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'notice-with-upload', course: 'Bioquímica II', title: 'Cronograma oficial', body: 'Consulta el PDF.',
    priority: 'important', status: 'published', attachmentUploadId: uploadId, attachmentTitle: 'Cronograma de exámenes'
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(attachedNotice.response.status === 200 && attachedNotice.body.course === 'Bioquímica II' && attachedNotice.body.attachmentUploadId === uploadId && attachedNotice.body.attachmentMimeType === 'application/pdf', `A staged upload could not be linked to a notice (${attachedNotice.response.status}: ${JSON.stringify(attachedNotice.body)}).`);
  expect(db.uploads.get(uploadId)?.status === 'linked', 'Linking the notice did not promote its upload metadata from staged to linked.');

  const publicWithAttachment = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public', '', { MED_NYKUTO_UPLOADS: r2 });
  const publicNotice = publicWithAttachment.body.notices?.find((notice) => notice.id === 'notice-with-upload');
  expect(publicNotice?.course === 'Bioquímica II' && publicNotice?.attachmentUploadId === uploadId && publicNotice?.attachmentUrl?.includes(`upload=${uploadId}`), 'The public notice snapshot omits its explicit subject or safe attachment contract.');
  const publicAsset = await classHubRawGet(classHub.onRequestGet, db, `?class=s4-e&resource=notice-attachment&upload=${encodeURIComponent(uploadId)}`, '', { MED_NYKUTO_UPLOADS: r2 });
  expect(publicAsset.status === 200 && publicAsset.headers.get('x-content-type-options') === 'nosniff' && publicAsset.headers.get('content-disposition')?.startsWith('inline;'), `A published notice attachment is not streamed with safe headers (${publicAsset.status}).`);
  expect((await publicAsset.text()).startsWith('%PDF-1.7'), 'The published attachment endpoint did not stream the original R2 bytes.');

  const rangeAsset = await classHubRawGet(classHub.onRequestGet, db, `?class=s4-e&resource=notice-attachment&upload=${encodeURIComponent(uploadId)}`, '', { MED_NYKUTO_UPLOADS: r2 }, { range: 'bytes=0-4' });
  expect(rangeAsset.status === 206 && rangeAsset.headers.get('content-range') === `bytes 0-4/${pdfFile.size}` && await rangeAsset.text() === '%PDF-', 'The attachment endpoint does not honor a safe single byte range.');

  const draftUpload = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  const draftUploadId = draftUpload.body.attachment?.uploadId;
  const draftNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'draft-with-upload', title: 'Borrador privado', status: 'draft', attachmentUploadId: draftUploadId
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(draftNotice.response.status === 200, `A draft notice could not retain its attachment (${draftNotice.response.status}: ${JSON.stringify(draftNotice.body)}).`);
  const draftPublicAsset = await classHubRawGet(classHub.onRequestGet, db, `?class=s4-e&resource=notice-attachment&upload=${encodeURIComponent(draftUploadId)}`, '', { MED_NYKUTO_UPLOADS: r2 });
  expect(draftPublicAsset.status === 404, 'An unauthenticated reader can download an attachment linked only to a draft notice.');
  const draftAdminAsset = await classHubRawGet(classHub.onRequestGet, db, `?class=s4-e&resource=notice-attachment&upload=${encodeURIComponent(draftUploadId)}`, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(draftAdminAsset.status === 200, 'The authenticated delegate cannot review the attachment of their draft notice.');

  const detachedNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'draft-with-upload', title: 'Borrador privado', status: 'draft', attachmentUploadId: null
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(detachedNotice.response.status === 200 && detachedNotice.body.attachmentUploadId === null && detachedNotice.body.attachmentTitle === null, `A client cannot detach a notice upload by sending attachmentUploadId:null alone (${detachedNotice.response.status}: ${JSON.stringify(detachedNotice.body)}).`);
  expect(!db.uploads.has(draftUploadId) && !r2.objects.has(`classes/${DEFAULT_CLASS_ID}/notices/${draftUploadId}`), 'Detaching the last notice reference did not atomically mark, delete and remove the unreferenced upload.');

  const retryUpload = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  const retryUploadId = retryUpload.body.attachment?.uploadId;
  const retryObjectKey = `classes/${DEFAULT_CLASS_ID}/notices/${retryUploadId}`;
  const retryNotice = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'notice.upsert', id: 'delete-retry-notice', title: 'Prueba de recuperación R2', status: 'draft', attachmentUploadId: retryUploadId
  }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(retryNotice.response.status === 200, `The delete-retry fixture could not link its upload (${retryNotice.response.status}: ${JSON.stringify(retryNotice.body)}).`);
  r2.failDeleteKeys.add(retryObjectKey);
  const cleanupCallStart = db.calls.length;
  const originalConsoleError = console.error;
  console.error = () => {};
  let failedDeleteDetach;
  try {
    failedDeleteDetach = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
      action: 'notice.upsert', id: 'delete-retry-notice', title: 'Prueba de recuperación R2', status: 'draft', attachmentUploadId: null
    }, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  } finally {
    console.error = originalConsoleError;
  }
  expect(failedDeleteDetach.response.status === 200 && db.uploads.get(retryUploadId)?.status === 'staged' && r2.objects.has(retryObjectKey), 'An R2 delete failure did not preserve the detached notice while resetting its metadata to staged for a safe retry.');
  const cleanupCalls = db.calls.slice(cleanupCallStart);
  expect(cleanupCalls.some((call) => /^update\s+hub_uploads\s+set\s+status='deleting'/i.test(call.sql)) && cleanupCalls.some((call) => /^update\s+hub_uploads\s+set\s+status='staged'/i.test(call.sql)), 'Detached cleanup did not atomically mark `deleting` before R2 or reset to `staged` after failure.');
  db.uploads.get(retryUploadId).createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  db.uploads.get(retryUploadId).updatedAt = db.uploads.get(retryUploadId).createdAt;
  r2.failDeleteKeys.delete(retryObjectKey);
  const cleanupTrigger = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(cleanupTrigger.response.status === 201 && !db.uploads.has(retryUploadId) && !r2.objects.has(retryObjectKey), 'The 24-hour staged-upload TTL did not reclaim an abandoned object before reserving the next upload.');

  const crossClassAttachment = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'notice.upsert', id: 'cross-class-upload', title: 'No aceptar', status: 'published', attachmentUploadId: uploadId
  }, 'owner-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(crossClassAttachment.response.status === 400 && responseCode(crossClassAttachment.body) === 'invalid_notice_attachment', `A notice linked an upload belonging to another class (${crossClassAttachment.response.status}: ${JSON.stringify(crossClassAttachment.body)}).`);

  const uploadAdmin = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=admin', 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(uploadAdmin.body.uploadPolicy?.enabled === true && uploadAdmin.body.uploadPolicy?.maxBytes === 15 * 1024 * 1024 && uploadAdmin.body.uploadPolicy?.maxStagedUploads === 20 && uploadAdmin.body.uploadPolicy?.stagedTtlHours === 24, 'The authenticated snapshot does not expose the active R2 size, quota and staged-TTL policy.');

  const quotaTimestamp = new Date().toISOString();
  let pendingS4 = [...db.uploads.values()].filter((item) => item.classId === DEFAULT_CLASS_ID && ['staged', 'deleting'].includes(item.status)).length;
  while (pendingS4 < uploadAdmin.body.uploadPolicy.maxStagedUploads) {
    const quotaId = `upload-quota-${String(pendingS4).padStart(2, '0')}`;
    db.uploads.set(quotaId, { id: quotaId, classId: DEFAULT_CLASS_ID, objectKey: `classes/${DEFAULT_CLASS_ID}/notices/${quotaId}`, originalName: 'pendiente.pdf', mimeType: 'application/pdf', sizeBytes: 12, etag: '', status: 'staged', createdBy: 'editor-s4', createdAt: quotaTimestamp, updatedAt: quotaTimestamp });
    pendingS4 += 1;
  }
  const putsBeforeQuota = r2.calls.filter((call) => call.method === 'put').length;
  const quotaRejected = await classHubUpload(classHub.onRequestPost, db, '?class=s4-e&action=notice.attachment.upload', pdfFile, 'editor-s4-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(quotaRejected.response.status === 409 && responseCode(quotaRejected.body) === 'staged_upload_quota' && r2.calls.filter((call) => call.method === 'put').length === putsBeforeQuota, `The atomic per-class staged quota did not reject before writing to R2 (${quotaRejected.response.status}: ${JSON.stringify(quotaRejected.body)}).`);
  const secondClassUpload = await classHubUpload(classHub.onRequestPost, db, '?class=s3-a&action=notice.attachment.upload', pdfFile, 'owner-token', { MED_NYKUTO_UPLOADS: r2 });
  expect(secondClassUpload.response.status === 201 && db.uploads.get(secondClassUpload.body.attachment?.uploadId)?.classId === SECOND_CLASS_ID, 'The S4 staged quota leaked across tenants and blocked an independent class.');

  const profileStart = db.calls.length;
  const savedProfile = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'profile.upsert', whatsapp: '00 595 (981) 123-456'
  }, 'editor-s4-token');
  expect(savedProfile.response.status === 200 && savedProfile.body.profile?.whatsapp === '+595981123456' && savedProfile.body.profile?.whatsappFormatVerifiedAt, `A valid formatted WhatsApp was not normalized (${savedProfile.response.status}: ${JSON.stringify(savedProfile.body)}).`);
  const profileWrite = db.calls.slice(profileStart).find((call) => /^insert\s+into\s+hub_editor_profiles\b/i.test(call.sql));
  expect(Boolean(profileWrite) && profileWrite.values[0] === DEFAULT_CLASS_ID && profileWrite.values[1] === 'editor-s4' && profileWrite.values[2] === '+595981123456', 'The private WhatsApp profile write is not bound to the authenticated actor and class.');
  const profileAudit = db.calls.slice(profileStart).find((call) => /^insert\s+into\s+hub_audit\b/i.test(call.sql) && call.values.includes('profile.upsert'));
  expect(Boolean(profileAudit) && !JSON.stringify(profileAudit.values).includes('+595981123456'), 'The private WhatsApp number leaked into the audit log.');

  const profileAdmin = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=admin', 'editor-s4-token');
  expect(profileAdmin.response.status === 200 && profileAdmin.body.profile?.whatsapp === '+595981123456', 'The authenticated actor cannot read their saved WhatsApp profile.');
  const profilePublic = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public');
  expect(!JSON.stringify(profilePublic.body).includes('+595981123456') && !Object.prototype.hasOwnProperty.call(profilePublic.body, 'profile'), 'The private WhatsApp profile leaked into the public class response.');

  const invalidProfileStart = db.calls.length;
  const invalidProfile = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', { action: 'profile.upsert', whatsapp: '595981123456' }, 'editor-s4-token');
  expect(invalidProfile.response.status === 400 && responseCode(invalidProfile.body) === 'invalid_whatsapp', `A WhatsApp number without an international prefix was accepted (${invalidProfile.response.status}: ${JSON.stringify(invalidProfile.body)}).`);
  expect(!db.calls.slice(invalidProfileStart).some((call) => /^insert\s+into\s+hub_editor_profiles\b/i.test(call.sql)), 'A rejected WhatsApp number still changed the private profile.');

  const editorScheduleWrite = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'schedule.upsert', id: 'editor-schedule-probe', subjectId: 'fisiologia-ii', weekday: 2, startsTime: '08:00', endsTime: '10:00'
  }, 'editor-s4-token');
  expect(editorScheduleWrite.response.status === 403, 'A delegate can modify the class schedule reserved for the owner.');
  const s3ScheduleWrite = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'schedule.upsert', id: 'schedule-probe', subjectId: 'fisiologia-ii', weekday: 2, startsTime: '08:00', endsTime: '10:00', label: 'Horario S3', status: 'published'
  }, 'owner-token');
  expect(s3ScheduleWrite.response.status === 200 && s3ScheduleWrite.body.id === 's3-a.schedule-probe', `An owner cannot configure a namespaced schedule for another class (${s3ScheduleWrite.response.status}: ${JSON.stringify(s3ScheduleWrite.body)}).`);
  const s3ConfiguredSchedule = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(s3ConfiguredSchedule.body.scheduleSlots?.length === 1 && s3ConfiguredSchedule.body.scheduleSlots[0].id === 's3-a.schedule-probe', 'The configured S3 schedule is missing or mixed with S4 slots.');
  const s4ScheduleAfterS3Write = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public');
  expect(s4ScheduleAfterS3Write.body.scheduleSlots?.length === 8, 'Configuring S3 changed the seeded S4 schedule.');

  const namespaceStart = db.calls.length;
  const sharedTaskS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'task.upsert', id: 'shared-task', course: 'Fisiología', title: 'Shared task S4', status: 'draft'
  }, 'owner-token');
  const sharedTaskS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'task.upsert', id: 'shared-task', course: 'Fisiología', title: 'Shared task S3', status: 'draft'
  }, 'owner-token');
  const sharedActivityS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'activity.upsert', id: 'shared-activity', title: 'Shared activity S4', status: 'draft'
  }, 'owner-token');
  const sharedActivityS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'activity.upsert', id: 'shared-activity', title: 'Shared activity S3', status: 'draft'
  }, 'owner-token');
  const sharedGroupS4 = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', {
    action: 'group.upsert', id: 'shared-group', activityId: 'shared-activity', name: 'Grupo compartido S4'
  }, 'owner-token');
  const sharedGroupS3 = await classHubPost(classHub.onRequestPost, db, '?class=s3-a', {
    action: 'group.upsert', id: 'shared-group', activityId: 'shared-activity', name: 'Grupo compartido S3'
  }, 'owner-token');

  [sharedTaskS4, sharedTaskS3, sharedActivityS4, sharedActivityS3, sharedGroupS4, sharedGroupS3].forEach(({ response, body }) => {
    expect(response.status === 200, `Namespaced owner mutation failed (${response.status}: ${JSON.stringify(body)}).`);
  });
  expect(sharedTaskS4.body.id === 'shared-task' && sharedTaskS3.body.id === 's3-a.shared-task', 'Identical task IDs are not namespaced per class while preserving the historic S4 ID.');
  expect(sharedActivityS4.body.id === 'shared-activity' && sharedActivityS3.body.id === 's3-a.shared-activity', 'Identical activity IDs are not namespaced per class while preserving the historic S4 ID.');
  expect(sharedGroupS4.body.id === 'shared-group' && sharedGroupS3.body.id === 's3-a.shared-group', 'Identical group IDs are not namespaced per class while preserving the historic S4 ID.');

  const namespaceCalls = db.calls.slice(namespaceStart);
  const insertBindings = (table) => namespaceCalls
    .filter((call) => new RegExp(`^insert\\s+into\\s+${table}\\b`, 'i').test(call.sql))
    .map((call) => ({ id: call.values[0], classId: call.values[1], referenceId: call.values[2] }));
  expect(
    insertBindings('hub_tasks').some(({ id, classId }) => id === 'shared-task' && classId === DEFAULT_CLASS_ID)
      && insertBindings('hub_tasks').some(({ id, classId }) => id === 's3-a.shared-task' && classId === SECOND_CLASS_ID),
    'Task INSERT bindings do not carry distinct class-scoped IDs.'
  );
  expect(
    insertBindings('hub_activities').some(({ id, classId }) => id === 'shared-activity' && classId === DEFAULT_CLASS_ID)
      && insertBindings('hub_activities').some(({ id, classId }) => id === 's3-a.shared-activity' && classId === SECOND_CLASS_ID),
    'Activity INSERT bindings do not carry distinct class-scoped IDs.'
  );
  expect(
    insertBindings('hub_groups').some(({ id, classId, referenceId }) => id === 'shared-group' && classId === DEFAULT_CLASS_ID && referenceId === 'shared-activity')
      && insertBindings('hub_groups').some(({ id, classId, referenceId }) => id === 's3-a.shared-group' && classId === SECOND_CLASS_ID && referenceId === 's3-a.shared-activity'),
    'Group INSERT bindings do not carry distinct class-scoped group/activity IDs.'
  );

  const archive = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: SECOND_CLASS_ID, slug: SECOND_CLASS_ID, name: '3.º A', semester: 3, group: 'A', status: 'archived'
  }, 'owner-token');
  expect(archive.response.status === 200 && archive.body.class?.status === 'archived', `An owner cannot archive a secondary class (${archive.response.status}: ${JSON.stringify(archive.body)}).`);
  const archivedPublic = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(archivedPublic.response.status === 404 && responseCode(archivedPublic.body) === 'class_not_found', 'An archived class remains accessible from its public route.');
  const classRegistry = await classHubGet(classHub.onRequestGet, db, '?resource=classes', 'owner-token');
  expect(classRegistry.response.status === 200 && classRegistry.body.classes?.some((entry) => entry.id === SECOND_CLASS_ID && entry.status === 'archived'), 'The owner registry hides an archived class, preventing reactivation.');
  const reactivate = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: SECOND_CLASS_ID, slug: SECOND_CLASS_ID, name: '3.º A', semester: 3, group: 'A', status: 'active'
  }, 'owner-token');
  expect(reactivate.response.status === 200 && reactivate.body.class?.status === 'active', `An archived class cannot be reactivated (${reactivate.response.status}: ${JSON.stringify(reactivate.body)}).`);
  const reactivatedPublic = await classHubGet(classHub.onRequestGet, db, '?class=s3-a&resource=public');
  expect(reactivatedPublic.response.status === 200, `A reactivated class is still unavailable (${reactivatedPublic.response.status}: ${JSON.stringify(reactivatedPublic.body)}).`);
  const defaultArchive = await classHubPost(classHub.onRequestPost, db, '', {
    action: 'class.upsert', id: DEFAULT_CLASS_ID, slug: DEFAULT_CLASS_ID, name: '4.º E', semester: 4, group: 'E', status: 'archived'
  }, 'owner-token');
  expect(defaultArchive.response.status === 400 && responseCode(defaultArchive.body) === 'invalid_class', 'The compatibility class s4-e can be archived.');
  const defaultAfterArchiveAttempt = await classHubGet(classHub.onRequestGet, db, '?class=s4-e&resource=public');
  expect(defaultAfterArchiveAttempt.response.status === 200, 'A rejected archive attempt still disabled the compatibility class s4-e.');

  const revokeProfileStart = db.calls.length;
  const revokedEditor = await classHubPost(classHub.onRequestPost, db, '?class=s4-e', { action: 'editor.revoke', id: 'editor-s4' }, 'owner-token');
  expect(revokedEditor.response.status === 200, `The owner could not revoke the profile-bearing editor (${revokedEditor.response.status}: ${JSON.stringify(revokedEditor.body)}).`);
  expect(!db.profiles.has(`${DEFAULT_CLASS_ID}:editor-s4`), 'Revoking an editor left their private WhatsApp profile orphaned.');
  const profileDelete = db.calls.slice(revokeProfileStart).find((call) => /^delete\s+from\s+hub_editor_profiles\b/i.test(call.sql));
  expect(Boolean(profileDelete) && profileDelete.values[0] === DEFAULT_CLASS_ID && profileDelete.values[1] === 'editor-s4', 'The revoke flow does not delete the private profile with class/actor scoping.');

  const missingClass = await classHubGet(classHub.onRequestGet, db, '?class=does-not-exist&resource=public');
  expect(missingClass.response.status === 404 && responseCode(missingClass.body) === 'class_not_found', 'Unknown class slug must return class_not_found instead of falling back or leaking data.');

  const legacyCommunity = await communityGet(community.onRequest, db, '');
  expect(legacyCommunity.response.status === 200, `Community default request failed (${legacyCommunity.response.status}: ${JSON.stringify(legacyCommunity.body)}).`);
  expect(responseClassId(legacyCommunity.body) === DEFAULT_CLASS_ID, 'Community request without class must resolve to s4-e.');

  const beforeS3Ranking = db.calls.length;
  const s3Community = await communityGet(community.onRequest, db, '?class=s3-a');
  expect(s3Community.response.status === 200, `Community cannot resolve a second active class (${s3Community.response.status}: ${JSON.stringify(s3Community.body)}).`);
  const s3RankingCalls = db.calls.slice(beforeS3Ranking).filter((call) => /\bcommunity_scores\b/i.test(call.sql));
  expect(s3RankingCalls.length > 0, 'Second-class community request did not query the ranking bank.');
  s3RankingCalls.forEach((call) => {
    expect(/\bclass_id\b/i.test(call.sql), `Community S3 query omitted class_id: ${call.sql.slice(0, 220)}`);
    expect(call.values.includes(SECOND_CLASS_ID), `Community S3 query did not bind s3-a: ${call.sql.slice(0, 220)}`);
  });

  const rateLimitStart = db.calls.length;
  const score = {
    playerId: '123e4567-e89b-42d3-a456-426614174000',
    nickname: 'Testeur',
    courseId: 'fisiologia',
    moduleId: 'module-1',
    correct: 8,
    total: 10
  };
  const s4Score = await communityPost(community.onRequest, db, '?class=s4-e', score);
  const s3Score = await communityPost(community.onRequest, db, '?class=s3-a', score);
  expect(s4Score.response.status === 200 && s3Score.response.status === 200, `Community score submission failed while checking rate isolation (${s4Score.response.status}/${s3Score.response.status}).`);
  const rateLimitWrites = db.calls.slice(rateLimitStart).filter((call) => /^insert\s+into\s+community_rate_limits\b/i.test(call.sql));
  const s4RateWrite = rateLimitWrites.find((call) => call.values[1] === DEFAULT_CLASS_ID);
  const s3RateWrite = rateLimitWrites.find((call) => call.values[1] === SECOND_CLASS_ID);
  expect(Boolean(s4RateWrite && s3RateWrite), 'Community writes do not persist separate rate-limit rows for both classes.');
  expect(Boolean(s4RateWrite && s3RateWrite && s4RateWrite.values[0] !== s3RateWrite.values[0]), 'Community rate-limit keys collide across classes for the same client address.');
  const rateLimitReads = db.calls.slice(rateLimitStart).filter((call) => /^select\s+count\s+from\s+community_rate_limits\b/i.test(call.sql));
  expect(Boolean(s4RateWrite && rateLimitReads.some((call) => call.values[0] === DEFAULT_CLASS_ID && call.values[1] === s4RateWrite.values[0])), 'Community rate-limit read does not use the s4-e class/key pair.');
  expect(Boolean(s3RateWrite && rateLimitReads.some((call) => call.values[0] === SECOND_CLASS_ID && call.values[1] === s3RateWrite.values[0])), 'Community rate-limit read does not use the s3-a class/key pair.');

  const missingCommunity = await communityGet(community.onRequest, db, '?class=does-not-exist');
  expect(missingCommunity.response.status === 404 && responseCode(missingCommunity.body) === 'class_not_found', 'Unknown community class slug must return class_not_found.');

  [...hubTenantTables, ...communityTenantTables].forEach((table) => {
    expect(db.tableColumns.get(table)?.has('class_id'), `${table} does not contain class_id after the legacy-schema migration path.`);
  });
  expect(db.tableColumns.get('hub_tasks')?.has('attachment_url') && db.tableColumns.get('hub_tasks')?.has('attachment_title'), 'hub_tasks is missing attachment columns after schema initialization.');
  expect(db.tableColumns.get('hub_notices')?.has('image_url') && db.tableColumns.get('hub_notices')?.has('image_alt'), 'hub_notices is missing image columns after schema initialization.');
  expect(db.tableColumns.get('hub_notices')?.has('attachment_upload_id') && db.tableColumns.get('hub_notices')?.has('attachment_title'), 'hub_notices is missing its R2 attachment reference columns after schema initialization.');
  expect(db.tableColumns.get('hub_uploads')?.has('object_key') && db.tableColumns.get('hub_uploads')?.has('mime_type') && db.tableColumns.get('hub_uploads')?.has('size_bytes'), 'hub_uploads is missing its object metadata after schema initialization.');
  ['hub_notices', 'hub_activities', 'hub_dates'].forEach((table) => expect(db.tableColumns.get(table)?.has('course'), `${table} is missing its optional explicit subject link.`));
  expect(db.tableColumns.get('hub_classes')?.has('support_whatsapp'), 'hub_classes is missing support_whatsapp after schema initialization.');
  expect(db.tableColumns.get('hub_editor_profiles')?.has('whatsapp_e164') && db.tableColumns.get('hub_editor_profiles')?.has('actor_id'), 'hub_editor_profiles is missing its private WhatsApp contract.');
  expect(db.tableColumns.get('hub_memberships')?.has('is_leader'), 'hub_memberships is missing is_leader after schema initialization.');
  db.errors.forEach((error) => failures.push(error));
}

async function validateMulticlassShell() {
  const requiredFiles = [
    'turma-shell/index.html',
    'turma-v471.css',
    'turma-v471.js',
    'turma-manifest-boot-v471.js',
    'gestion-shell/index.html',
    'gestion-v440.css',
    'gestion-v440.js',
    'functions/_lib/management-credentials.js',
    'offline.html',
    'functions/api/class-manifest.js'
  ];
  requiredFiles.forEach((file) => expect(fs.existsSync(path.join(root, file)), `Multiclass shell file is missing: ${file}.`));
  if (requiredFiles.some((file) => !fs.existsSync(path.join(root, file)))) return;

  const turmaHtml = read('turma-shell/index.html');
  const turmaRuntime = read('turma-v471.js');
  const legacyClassHtml = read('clase.html');
  const legacyClassCss = read('class-hub-2026-08-21-v440.css');
  const managementHtml = read('gestion-shell/index.html');
  const managementRuntime = read('gestion-v440.js');
  const credentialHelper = read('functions/_lib/management-credentials.js');
  const legacyClassRuntime = read('class-hub-runtime-v440.js');
  const redirects = read('_redirects');
  const headers = read('_headers');
  const worker = read('service-worker.js');

  expect((turmaHtml.match(/data-nav-view=/g) || []).length === 5, 'The generic class hub must expose exactly five mobile navigation tabs.');
  expect((turmaHtml.match(/data-view="/g) || []).length === 6, 'The generic class hub must expose five navigation views plus the dedicated notices view.');
  expect(turmaHtml.includes('name="robots" content="noindex,nofollow"'), 'The generic class hub is missing its noindex directive.');
  expect(turmaHtml.indexOf('turma-manifest-boot-v471.js') < turmaHtml.indexOf('turma-v471.js'), 'The class manifest is not selected before the main class runtime.');
  expect(turmaRuntime.includes("API+'&resource=public'") && turmaRuntime.includes("'/gestion/'+encodeURIComponent(slug)"), 'The generic hub is not querying or linking the selected class explicitly.');
  expect(!/state\.(?:members|memberships)|data\.(?:members|memberships)/.test(turmaRuntime), 'The generic student hub still consumes nominative group records.');
  expect(turmaRuntime.includes("action:'group.join'") && turmaRuntime.includes("action:'group.leave'") && turmaRuntime.includes('memberCount'), 'Students cannot join and leave generic class groups using anonymous occupancy data.');

  expect(managementHtml.includes('src="/gestion-v440.js?v=476"') && managementHtml.includes('href="/gestion-v440.css?v=476"'), 'The nested management route does not use absolute v476 assets.');
  expect(managementHtml.includes('id="credentialForm"') && managementHtml.includes('name="action" value="auth.login"') && managementHtml.includes('autocomplete="username"') && managementHtml.includes('autocomplete="current-password"'), 'The v472 delegate email/password login form is incomplete.');
  expect(managementHtml.includes('id="passwordChangeForm"') && managementHtml.includes('name="action" value="auth.password.change"') && (managementHtml.match(/autocomplete="new-password"/g) || []).length >= 2, 'The mandatory temporary-password change form is incomplete.');
  expect(managementHtml.includes('id="delegateAccountForm"') && managementHtml.includes('name="action" value="editor.account.create"') && managementHtml.includes('name="temporaryPassword"'), 'The owner cannot create a tenant-scoped delegate credential from the v472 panel.');
  ['loginEmail', 'loginPassword', 'newPassword', 'confirmPassword'].forEach((id) => {
    const input = managementHtml.match(new RegExp(`<input[^>]+id=["']${id}["'][^>]*>`, 'i'))?.[0] || '';
    expect(Boolean(input) && !/\svalue\s*=/i.test(input), `Credential input ${id} is missing or contains a hard-coded value.`);
  });
  expect(!/[a-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo)\.[a-z]{2,}/i.test(`${managementHtml}\n${managementRuntime}\n${credentialHelper}`), 'A real-looking personal email address was committed in the management credential sources.');
  expect(credentialHelper.includes('PBKDF2') && credentialHelper.includes("hash: 'SHA-256'") && credentialHelper.includes('PASSWORD_ITERATIONS = 100000') && credentialHelper.includes('crypto.subtle.deriveBits'), 'The credential helper is missing the expected salted PBKDF2-SHA-256 verifier.');
  expect(credentialHelper.includes('crypto.getRandomValues') && credentialHelper.includes('randomToken(16)') && credentialHelper.includes('Secure; HttpOnly; SameSite=Strict'), 'The credential helper is missing random salts/tokens or hardened session-cookie attributes.');
  expect(credentialHelper.includes("SESSION_TTL_SECONDS = 8 * 60 * 60") && credentialHelper.includes("__Host-med-nykuto-management-csrf"), 'The credential helper is missing the bounded session or CSRF cookie contract.');
  expect(/credentials\s*[:=]\s*["']same-origin["']/.test(managementRuntime) && /\[["']x-csrf-token["']\]\s*=/.test(managementRuntime) && /csrfCookieName\s*=\s*["']__Host-med-nykuto-management-csrf["']/.test(managementRuntime), 'Management requests do not use same-origin cookies and the CSRF header contract.');
  expect(managementRuntime.includes("'session'") && managementRuntime.includes("action:'auth.logout'") && managementRuntime.includes("action:'auth.password.change'"), 'The management runtime is missing session restore, logout or password-change actions.');
  expect(managementRuntime.includes("'delegateAccountForm'") && /editor\.password\.reset/.test(managementRuntime), 'The management runtime is missing delegate credential creation/reset actions.');
  expect(!/(?:loginPassword|temporaryPassword|newPassword)\s*[:=]\s*["'][^"']+["']/i.test(managementRuntime), 'The management runtime contains a hard-coded credential value.');
  expect(managementHtml.includes('list="subjectOptions"') && managementHtml.includes('id="groupActivitySelect"'), 'The management panel still relies on free-text subject/activity references.');
  expect(managementHtml.includes('id="taskSuggestedDate"') && managementHtml.includes('name="attachmentUrl"') && managementHtml.includes('name="attachmentTitle"'), 'The task form is missing suggested course dates or optional attachment fields.');
  expect(managementHtml.includes('id="requestAccessLink"') && managementRuntime.includes('loadLoginSupport') && managementRuntime.includes('https://wa.me/'), 'The login page is missing its configurable delegate-access request action.');
  expect(managementHtml.includes('id="profileForm"') && managementHtml.includes('name="action" value="profile.upsert"') && managementHtml.includes('id="profileWhatsapp"'), 'The authenticated delegate profile form is incomplete.');
  expect(managementHtml.includes('name="imageUrl"') && managementHtml.includes('name="imageAlt"') && managementRuntime.includes('notice-preview'), 'The notice editor is missing its optional HTTPS image fields or preview.');
  expect(!managementHtml.includes('id="freezeGroups"') && !managementHtml.includes('id="exportWhatsapp"') && !managementHtml.includes('id="exportPdf"'), 'Global group export controls still make activity scope ambiguous.');
  expect(managementRuntime.includes('function activityExportText') && managementRuntime.includes('dataset.groupAction') && ['freeze', 'copy', 'whatsapp', 'pdf'].every((action) => managementRuntime.includes(`'${action}'`)), 'Per-activity group tools or their explicit action mapping are incomplete.');
  expect((managementHtml.match(/data-password-toggle/g) || []).length >= 6 && managementRuntime.includes('function bindPasswordToggles'), 'Password fields are missing accessible show/hide controls.');
  expect(managementRuntime.includes('state&&state.upcomingDates') && managementRuntime.includes('function bindTaskDateSuggestions'), 'The delegate task form is not connected to tenant upcoming course dates.');
  expect(managementRuntime.includes("'Panel de la clase · '") && !managementRuntime.includes("'Publicación · '"), 'The delegate heading still uses technical publication wording.');
  expect(managementHtml.includes('Opciones técnicas (normalmente no tocar)') && managementRuntime.includes("'Modificar'") && managementRuntime.includes("'Archivar'"), 'The delegate panel is missing edit/archive controls or technical identifiers.');
  expect(managementRuntime.includes("function classMutation") && managementRuntime.includes("'Reactivar'") && managementRuntime.includes("info.slug!=='s4-e'"), 'The owner panel is missing safe class edit/archive/reactivation controls.');
  expect(managementRuntime.includes('if(result&&reset){form.reset();clearEditMode(form);}') && managementRuntime.includes('return null;'), 'A failed management mutation can still clear the editor form.');
  expect(managementRuntime.includes("popup.opener=null") && !managementRuntime.includes("'noopener,noreferrer'"), 'The printable group export still uses the broken noopener window-open path.');
  expect(managementRuntime.includes('Copiar invitación') && managementRuntime.includes('copyText(result.inviteToken)'), 'The one-time editor invitation cannot be copied explicitly.');

  expect(!legacyClassRuntime.includes('activityMembers') && legacyClassRuntime.includes("filled?'Ocupado':'Libre'"), 'The legacy 4.º E student roster is not anonymized.');
  expect(turmaHtml.includes('id="homeNoticeCarousel"') && turmaHtml.includes('data-view="avisos"') && turmaHtml.includes('id="noticePageList"'), 'The generic class hub is missing its compact official-notice carousel or full notices view.');
  expect(turmaRuntime.includes('6000') && turmaRuntime.includes('prefers-reduced-motion: reduce') && turmaRuntime.includes('destroyNoticeCarousel') && turmaRuntime.includes("addEventListener('hashchange'"), 'The generic notice carousel is missing its readable timing, reduced-motion gate, timer teardown or hash routing.');
  expect(!/(?:noticeDialog|noticeDialogList|homeNotices)/.test(`${turmaHtml}\n${turmaRuntime}`), 'The generic class hub still references the retired notice dialog or duplicate Home list.');
  expect(legacyClassHtml.includes('id="classHomeNoticeCarousel"') && legacyClassHtml.includes('data-view="avisos"') && legacyClassHtml.includes('id="classNoticePageList"'), 'The 4.º E hub is missing its compact official-notice carousel or full notices view.');
  expect(legacyClassRuntime.includes('6000') && legacyClassRuntime.includes('prefers-reduced-motion: reduce') && legacyClassRuntime.includes('destroyNoticeCarousel'), 'The 4.º E notice carousel is missing its readable timing, reduced-motion gate or timer teardown.');
  expect(!/(?:noticeDrawer|urgentNoticeBanner|notice-drawer|urgent-notice-banner)/.test(`${legacyClassHtml}\n${legacyClassRuntime}\n${legacyClassCss}`), 'The 4.º E hub still references the retired notice drawer or urgent banner.');
  expect(legacyClassRuntime.includes('function taskAttachment') && turmaRuntime.includes('function taskAttachment'), 'Optional task attachments are not rendered in both student hubs.');
  expect(['/turma/:slug', '/turma/:slug/', '/gestion/:slug', '/gestion/:slug/'].every((route) => redirects.includes(`${route} /${route.startsWith('/turma') ? 'turma' : 'gestion'}-shell/?class=:slug 200`)), 'Cloudflare rewrites for class and management slugs, with and without trailing slash, are missing.');
  expect(!/\/(?:turma|gestion)\/:slug\s+\/(?:turma|gestion)\.html\b/.test(redirects), 'A class route still proxies to a canonical .html URL and can loop on Cloudflare Pages.');
  ['/turma/*', '/turma-shell/*', '/clase.html', '/gestion/*', '/gestion-shell/*', '/api/*'].forEach((route) => expect(headers.includes(route), `Security/cache headers are missing for ${route}.`));

  const shellMatch = worker.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\];/);
  expect(Boolean(shellMatch), 'The service-worker shell list is missing.');
  if (shellMatch) {
    const shellEntries = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);
    expect(shellEntries.includes('/offline.html') && shellEntries.includes('/turma-shell/'), 'The neutral offline and generic class shells are not precached.');
    expect(!shellEntries.some((entry) => /\/api\/|\/gestion|\/turma\/s\d|clase\.html|practice-bank|med-courses-data|grupo-3/i.test(entry)), 'The service worker precaches tenant, management, API or protected course content.');
  }
  expect(worker.includes("url.pathname.startsWith('/api/')") && worker.includes("url.pathname.startsWith('/gestion')"), 'The service worker does not bypass API and management requests.');

  const listeners = {};
  const workerContext = vm.createContext({
    URL,
    self: {
      location: { origin: 'https://med.nykuto.com' },
      addEventListener(type, handler) { listeners[type] = handler; }
    }
  });
  vm.runInContext(worker, workerContext, { filename: 'service-worker.js' });
  const notificationTarget = (value) => vm.runInContext(`safeNotificationTarget(${JSON.stringify(value)})`, workerContext);
  expect(notificationTarget('https://evil.example/turma/s5-a') === '/turma/s4-e#avisos', 'An external notification target is accepted.');
  expect(notificationTarget('/gestion/s5-a') === '/turma/s4-e#avisos', 'A notification can escape into management.');
  expect(notificationTarget('/turma/s5-a#tareas') === '/turma/s5-a#tareas', 'A valid same-origin class notification target is rejected.');

  const manifestModule = await importSource('functions/api/class-manifest.js');
  const manifestResponse = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=s3-a'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  const manifest = await manifestResponse.json();
  expect(manifestResponse.status === 200 && manifest.id === '/turma/s3-a/' && manifest.start_url === '/turma/s3-a#inicio' && manifest.scope === '/turma/', 'The generated manifest is not isolated to the selected active class shell.');
  const unknownManifest = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=does-not-exist'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  expect(unknownManifest.status === 404, 'An unknown or archived class can still expose an installable manifest.');
  const invalidManifest = await manifestModule.onRequestGet({ request: new Request('https://med.nykuto.com/api/class-manifest?class=bad_slug'), env: { MED_NYKUTO_DB: new GuardedD1Mock() } });
  expect(invalidManifest.status === 400, 'An invalid class slug can still expose an installable manifest.');
}

async function validateCredentialHelper() {
  const helper = await importSource('functions/_lib/management-credentials.js');
  const password = 'Fixture-Study-2026!';
  const verifier = await helper.createPasswordVerifier(password);
  const credential = {
    password_algorithm: 'pbkdf2-sha256',
    password_iterations: verifier.iterations,
    password_version: 1,
    password_salt: verifier.salt,
    password_hash: verifier.hash
  };

  expect(helper.normalizeEmail(' Delegate.Fixture@EXAMPLE.test ') === 'delegate.fixture@example.test', 'Delegate emails are not normalized consistently.');
  expect(Boolean(helper.temporaryPasswordProblem('12345')), 'A temporary password shorter than six characters was accepted.');
  expect(Boolean(helper.strongPasswordProblem('123456789012')), 'A numeric-only permanent password was accepted.');
  expect(verifier.iterations === 100000 && /^[a-f0-9]{32}$/.test(verifier.salt) && /^[a-f0-9]{64}$/.test(verifier.hash), 'The generated PBKDF2 verifier has invalid metadata or dimensions.');
  expect(await helper.verifyPassword(password, credential), 'The generated PBKDF2 verifier does not accept its source password.');
  expect(!await helper.verifyPassword('Wrong-Fixture-2026!', credential), 'The PBKDF2 verifier accepted an incorrect password.');
  expect(helper.isRandomToken(helper.randomToken(32)), 'Management session tokens are not exact 256-bit random hex values.');
  const cookies = helper.sessionCookies('a'.repeat(64), 'b'.repeat(64), new Date(Date.now() + 60000).toISOString());
  expect(cookies.length === 2 && cookies[0].includes('Secure; HttpOnly; SameSite=Strict') && cookies[1].includes('Secure; SameSite=Strict') && !cookies[1].includes('HttpOnly'), 'Session and CSRF cookie attributes do not match the hardened contract.');
}

async function main() {
  Object.entries(protectedHashes).forEach(([file, expectedHash]) => {
    expect(fs.existsSync(path.join(root, file)), `Protected bank file is missing: ${file}.`);
    if (fs.existsSync(path.join(root, file))) {
      expect(sha256(file) === expectedHash, `Protected bank changed during multiclass work: ${file}.`);
    }
  });

  const hubSource = read('functions/api/class-hub.js');
  const communitySource = read('functions/api/community.js');
  const hubSql = preparedSql(hubSource);
  const communitySql = preparedSql(communitySource);

  const classesDefinition = tableDefinition(hubSource, 'hub_classes');
  expect(Boolean(classesDefinition), 'hub_classes schema is missing.');
  expect(/\bid\s+text\s+primary\s+key\b/i.test(classesDefinition), 'hub_classes.id must be the stable primary key.');
  expect(/\bslug\s+text\s+not\s+null\s+unique\b|\bunique\s*\(\s*slug\s*\)/i.test(classesDefinition), 'hub_classes.slug must be unique.');

  hubTenantTables.forEach((table) => {
    const definition = tableDefinition(hubSource, table);
    const hasInlineClass = /\bclass_id\s+text\s+not\s+null\b/i.test(definition);
    const hasSafeMigration = hubSource.includes(`ensureClassColumn(db, '${table}')`)
      || hubSource.includes(`'${table}'`) && /ensureClassColumn/.test(hubSource);
    expect(Boolean(definition), `${table} schema is missing.`);
    expect(hasInlineClass || hasSafeMigration, `${table} has neither an inline class_id nor the safe legacy migration.`);
  });

  const taskDefinition = tableDefinition(hubSource, 'hub_tasks');
  expect(/\battachment_url\s+text\b/i.test(taskDefinition) && /\battachment_title\s+text\b/i.test(taskDefinition), 'hub_tasks does not declare optional attachment URL/title columns.');
  expect(/ensureTaskAttachmentColumns/.test(hubSource) && /alter\s+table\s+hub_tasks\s+add\s+column\s+attachment_url/i.test(hubSource) && /alter\s+table\s+hub_tasks\s+add\s+column\s+attachment_title/i.test(hubSource), 'The additive legacy-task attachment migration is missing.');
  expect(/function\s+cleanAttachmentUrl/.test(hubSource) && /parsed\.protocol\s*===\s*['"]https:['"]/.test(hubSource) && /invalid_attachment/.test(hubSource), 'Task attachments are not restricted to validated HTTPS URLs.');
  expect((hubSource.match(/attachment_url\s+AS\s+attachmentUrl/g) || []).length >= 2 && (hubSource.match(/attachment_title\s+AS\s+attachmentTitle/g) || []).length >= 2, 'Task attachment metadata is not exposed in both public and admin snapshots.');

  const noticeDefinition = tableDefinition(hubSource, 'hub_notices');
  expect(/\bimage_url\s+text\b/i.test(noticeDefinition) && /\bimage_alt\s+text\b/i.test(noticeDefinition), 'hub_notices does not declare optional image URL/alt columns.');
  expect(/ensureNoticeImageColumns/.test(hubSource) && /alter\s+table\s+hub_notices\s+add\s+column\s+image_url/i.test(hubSource), 'The additive legacy notice-image migration is missing.');
  expect(/invalid_notice_image/.test(hubSource) && /image_url\s+AS\s+imageUrl/.test(hubSource), 'Notice images are not validated and exposed with the public camel-case contract.');
  expect(/\battachment_upload_id\s+text\b/i.test(noticeDefinition) && /\battachment_title\s+text\b/i.test(noticeDefinition), 'hub_notices does not declare its optional R2 attachment reference/title.');
  expect(/ensureNoticeAttachmentColumns/.test(hubSource) && /alter\s+table\s+hub_notices\s+add\s+column\s+attachment_upload_id/i.test(hubSource), 'The additive legacy notice-attachment migration is missing.');

  const uploadDefinition = tableDefinition(hubSource, 'hub_uploads');
  expect(/\bobject_key\s+text\s+not\s+null\s+unique\b/i.test(uploadDefinition) && /\boriginal_name\s+text\s+not\s+null\b/i.test(uploadDefinition) && /\bmime_type\s+text\s+not\s+null\b/i.test(uploadDefinition) && /\bsize_bytes\s+integer\s+not\s+null\b/i.test(uploadDefinition), 'hub_uploads must store only class-scoped R2 object metadata.');
  expect(/function\s+uploadsFrom\s*\([^)]*\)\s*\{\s*return\s+env\.MED_NYKUTO_UPLOADS\s*\|\|\s*null/.test(hubSource), 'The notice upload does not use the dedicated MED_NYKUTO_UPLOADS binding.');
  expect(/NOTICE_UPLOAD_ACTION\s*=\s*['"]notice\.attachment\.upload['"]/.test(hubSource) && /request\.formData\(\)/.test(hubSource) && /validSessionCsrf\(request, actor\)/.test(hubSource), 'The multipart notice upload is missing its stable action, parser or session anti-CSRF check.');
  expect(/MAX_NOTICE_ATTACHMENT_BYTES\s*=\s*15\s*\*\s*1024\s*\*\s*1024/.test(hubSource) && /invalid_upload_type/.test(hubSource) && /detectUploadMime/.test(hubSource), 'The notice upload is missing its 15 MiB limit or byte-signature type validation.');
  expect(/MAX_STAGED_NOTICE_UPLOADS_PER_CLASS\s*=\s*20/.test(hubSource) && /NOTICE_STAGED_UPLOAD_TTL_SECONDS\s*=\s*24\s*\*\s*60\s*\*\s*60/.test(hubSource) && /staged_upload_quota/.test(hubSource), 'Notice uploads are missing their bounded per-class staged quota or 24-hour TTL.');
  expect(/function\s+isNoticeImageMime/.test(hubSource) && /imageAlt\s*&&\s*!imageUrl\s*&&\s*!attachmentIsImage/.test(hubSource), 'Uploaded raster images cannot safely satisfy the notice alt-text contract, or PDF/orphan alt text is not rejected.');
  expect(/function\s+markUploadDeleting/.test(hubSource) && /status='deleting'/.test(hubSource) && /NOT EXISTS \(SELECT 1 FROM hub_notices n WHERE n\.class_id=hub_uploads\.class_id AND n\.attachment_upload_id=hub_uploads\.id\)/.test(hubSource), 'Upload cleanup is missing its atomic deleting claim and same-class unreferenced guard.');
  expect(/await bucket\.delete\(claimed\.object_key\)/.test(hubSource) && /class_hub_upload_cleanup_r2_error/.test(hubSource) && /SET status='staged',updated_at=\?/.test(hubSource), 'R2 cleanup does not reset deleting metadata to staged after an object-delete failure.');
  expect(/hub_uploads_class_lifecycle_idx/.test(hubSource) && /cleanupExpiredNoticeUploads/.test(hubSource) && /cleanupDetachedNoticeUpload/.test(hubSource), 'Expired and freshly detached unreferenced uploads are not covered by the bounded lifecycle cleanup.');
  expect(/crypto\.randomUUID\(\)/.test(hubSource) && !/Math\.random\(\)/.test(hubSource), 'Security-sensitive entity/upload IDs are not exclusively generated with Web Crypto.');
  expect(/n\.status='published'/.test(hubSource) && /u\.status='linked'/.test(hubSource) && /content-security-policy/.test(hubSource) && /x-content-type-options/.test(hubSource), 'The public R2 stream is not restricted to published notices or is missing safe response headers.');
  expect(!/api\.cloudflare\.com/.test(hubSource), 'The Function calls the Cloudflare REST API instead of using its in-process R2 binding.');

  const activityDefinition = tableDefinition(hubSource, 'hub_activities');
  const dateDefinition = tableDefinition(hubSource, 'hub_dates');
  expect(/\bcourse\s+text\s+not\s+null\s+default\s+''/i.test(noticeDefinition) && /\bcourse\s+text\s+not\s+null\s+default\s+''/i.test(activityDefinition) && /\bcourse\s+text\s+not\s+null\s+default\s+''/i.test(dateDefinition), 'Notices, activities and dates do not expose their optional explicit subject link.');
  expect(/ensureCourseColumns/.test(hubSource) && /alter\s+table\s+\$\{table\}\s+add\s+column\s+course/i.test(hubSource), 'The additive course-link migration is missing for legacy notice/activity/date tables.');

  const profileDefinition = tableDefinition(hubSource, 'hub_editor_profiles');
  expect(/\bclass_id\s+text\s+not\s+null\b/i.test(profileDefinition) && /\bactor_id\s+text\s+not\s+null\b/i.test(profileDefinition) && /\bwhatsapp_e164\s+text\s+not\s+null\b/i.test(profileDefinition), 'hub_editor_profiles is missing its tenant/actor/E.164 fields.');
  expect(/profile\.upsert/.test(hubSource) && /invalid_whatsapp/.test(hubSource) && /whatsappFormatVerifiedAt/.test(hubSource), 'The authenticated private WhatsApp profile lifecycle is incomplete.');
  expect(/editor\.revoke[\s\S]*?DELETE FROM hub_editor_profiles WHERE class_id=\? AND actor_id=\?/.test(hubSource), 'Revoking an editor does not remove the now-orphaned private WhatsApp profile.');
  const publicReaderForProfile = hubSource.slice(hubSource.indexOf('async function readPublic'), hubSource.indexOf('async function adminSnapshot'));
  expect(!/hub_editor_profiles|whatsapp_e164/.test(publicReaderForProfile), 'The public reader queries private delegate WhatsApp profiles.');
  expect(/support_whatsapp\s+text\s+not\s+null/i.test(classesDefinition) && /MED_NYKUTO_SUPPORT_WHATSAPP/.test(hubSource), 'The public support WhatsApp class/environment fallback is missing.');

  const scheduleDefinition = tableDefinition(hubSource, 'hub_schedule_slots');
  expect(/\bsubject_id\s+text\s+not\s+null\b/i.test(scheduleDefinition) && /\bweekday\s+integer\s+not\s+null\b/i.test(scheduleDefinition) && /\bstarts_time\s+text\s+not\s+null\b/i.test(scheduleDefinition), 'hub_schedule_slots is missing its subject/day/time recurrence fields.');
  expect(/DEFAULT_SCHEDULE_SLOTS/.test(hubSource) && /schedule-mon-fisiologia-0700/.test(hubSource) && /schedule-thu-fisiologia-0940/.test(hubSource), 'The idempotent S4 schedule seed is missing its two Physiology slots.');
  expect(/upcomingDates:\s*upcomingScheduleDates/.test(hubSource) && /scheduleSlots/.test(hubSource), 'Public/admin class snapshots do not expose recurring slots and upcoming dates.');

  const membershipDefinition = tableDefinition(hubSource, 'hub_memberships');
  expect(/\bis_leader\s+integer\s+not\s+null\s+default\s+0\b/i.test(membershipDefinition), 'hub_memberships does not declare the additive leader marker.');
  expect(/alter\s+table\s+hub_memberships\s+add\s+column\s+is_leader\s+integer\s+not\s+null\s+default\s+0/i.test(hubSource), 'The legacy membership leader migration is missing.');
  expect(/create\s+unique\s+index\s+if\s+not\s+exists\s+hub_memberships_one_leader_idx[\s\S]*?where\s+is_leader=1/i.test(hubSource), 'The one-leader-per-class-group partial unique index is missing.');
  expect(/is_leader\s+AS\s+isLeader/i.test(hubSource) && /isLeader:\s*Boolean\(item\.isLeader\)/.test(hubSource), 'The admin snapshot does not expose the membership leader as a boolean.');

  const communityDefinition = tableDefinition(communitySource, 'community_scores');
  expect(Boolean(communityDefinition), 'community_scores schema is missing.');
  expect(/\bclass_id\s+text\s+not\s+null\b/i.test(communityDefinition), 'community_scores must declare class_id TEXT NOT NULL.');
  const communityRateDefinition = tableDefinition(communitySource, 'community_rate_limits');
  expect(Boolean(communityRateDefinition), 'community_rate_limits schema is missing.');
  expect(/\bclass_id\s+text\s+not\s+null\b/i.test(communityRateDefinition), 'community_rate_limits must declare class_id TEXT NOT NULL.');

  validateTenantSql('functions/api/class-hub.js', hubSql, hubTenantTables);
  validateTenantSql('functions/api/community.js', communitySql, communityTenantTables);

  expect(hubSource.includes(`'${DEFAULT_CLASS_ID}'`) || hubSource.includes(`\"${DEFAULT_CLASS_ID}\"`), 'The 4.º E s4-e compatibility identifier is missing from class-hub.js.');
  expect(communitySource.includes(`'${DEFAULT_CLASS_ID}'`) || communitySource.includes(`\"${DEFAULT_CLASS_ID}\"`), 'The 4.º E s4-e compatibility identifier is missing from community.js.');
  expect(communitySource.includes(LEGACY_COHORT_KEY), 'The legacy 4.º E ranking key is not accounted for during migration.');
  expect(!/const\s+COHORT_KEY\s*=/.test(communitySource), 'Community still relies on one hard-coded COHORT_KEY.');
  expect(/class_not_found/.test(hubSource), 'Class hub does not explicitly reject unknown class slugs.');
  expect(/class_not_found/.test(communitySource), 'Community does not explicitly reject unknown class slugs.');
  expect(/subjects/.test(hubSource) && /hub_subjects/.test(hubSource), 'Public class response does not expose the class subjects.');
  expect(/searchParams\.get\(['\"]class['\"]\)/.test(hubSource), 'Class hub does not resolve the class from the URL query.');
  expect(/searchParams\.get\(['\"]class['\"]\)/.test(communitySource), 'Community does not resolve the class from the URL query.');
  expect(/classSlug|classId/.test(hubSource), 'Class hub POST payload does not support classSlug/classId compatibility fields.');
  expect(hubSource.includes("from '../_lib/management-credentials.js'") && /auth\.login/.test(hubSource) && /auth\.password\.change/.test(hubSource), 'Class hub does not use the shared credential helper for delegate login/password change.');
  expect(/password_change_required/.test(hubSource) && /editor\.account\.create/.test(hubSource) && /editor\.password\.reset/.test(hubSource), 'Class hub is missing mandatory password change or owner credential lifecycle actions.');

  await validateCredentialHelper();
  await validateRuntimeIsolation();
  await validateMulticlassShell();

  if (failures.length) {
    console.error('Multiclass foundation validation failed:');
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }

  console.log('Multiclass foundation validation OK: tenant-scoped D1/R2 schema and queries, notice upload lifecycle/alt text, subject cockpit links, cross-class editor refusal, protected banks unchanged and 4.º E compatibility preserved.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
