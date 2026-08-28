const ACTIVITY_ID = 'bioquimica-pratica-2026-09-02';
const MAX_MEMBERS = 10;
const JOINABLE_GROUP = 10;
const MAX_BODY_BYTES = 8192;
const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT = 15;

const INSTRUCTIONS = Object.freeze([
  'Os grupos podem ter no máximo 10 integrantes.',
  'O caso clínico com perguntas vale 1 ponto.',
  'Leve todos os trabalhos assinados no dia da prova.',
  'Quem não levar os trabalhos ficará com nota zero, pois a ata será assinada nesse dia.',
  'A nota será a soma do caso clínico com os trabalhos realizados.',
  'A presença é obrigatória para validar os trabalhos.',
  'A professora não aceitará que outra pessoa entregue trabalhos em nome de um colega.',
  'Haverá mais uma aula de flexibilidade para a conferência dos trabalhos.',
  'Na sexta-feira, a professora conferirá os quatro trabalhos já passados.'
]);

const GROUPS = Object.freeze([
  Object.freeze({ number: 1, members: Object.freeze([
    'Alicia Vieira dos Santos',
    'Ziz Emanuelly Barros Ramos',
    'Nathália Amabile',
    'Emanuelle Teixeira Keller',
    'Guilherme Henrique Cisotto Marques',
    'João Vitor Dalcin Portela',
    'Hiago Cotrim Friedrich',
    'Yanick Modesto Ribeiro',
    'Manuela Ribeiro Quanz',
    'Kellen Ruane Barros Carvalho'
  ]) }),
  Object.freeze({ number: 2, members: Object.freeze([
    'Ana Clara Ferraz Guimarães',
    'Karen Beatriz Melo Piva',
    'Paolla de Paiva Pinto',
    'Daniele Lourdes Domingues Maia',
    'Camila Idilia Rodrigues Correa Maria',
    'Clayve de Oliveira Santos',
    'Daniel Santana Ramos de Ataides',
    'Ana Paula Vicente',
    'Paulo Renato Lima Araújo'
  ]) }),
  Object.freeze({ number: 3, members: Object.freeze([
    'Camila de Jesus Maciel',
    'Murillo Gabriel Batista de Oliveira',
    'Luana Dos Santos',
    'Igor Matheus Moraes Fedrici',
    'Ana Luiza Ribeiro dos Santos',
    'Bruna Carolina Vanderley Lima',
    'Maria Luísa Rostelato',
    'João Victor Paulino',
    'Vitoria Hidaka de Souza',
    'Maria Eduarda Hidaka Coelho'
  ]) }),
  Object.freeze({ number: 4, members: Object.freeze([
    'Ester Moya',
    'Kamyla Valêncio',
    'Ayandra Alves de Souza',
    'Camila Ferreira Lima Morais',
    'Emily Eduarda Martins Borba',
    'Tayssa Rodrigues',
    'Nicolle Vitoria Ortiz Adriano',
    'Ronise Lima',
    'Djangler Rocha',
    'Mateus Pacheco'
  ]) }),
  Object.freeze({ number: 5, members: Object.freeze([
    'Adna Juliana Nunes Silva Pinheiro',
    'Layssa Karoline Barbosa',
    'Stephany Januario Matos',
    'Maria Vitória Teles Fernandes',
    'Maryanna Araujo da Silva',
    'Maslow Gabriel Neis Pontes',
    'Giovana Sabatke',
    'Camila Alencar Delmutti',
    'Thallys Gabriel Rigo'
  ]) }),
  Object.freeze({ number: 6, members: Object.freeze([
    'Barbara Jullian Amaral de Paula',
    'Samanta Nunes de Miranda Amaral',
    'Vinícius da Costa Jardim',
    'Elielton Arquimedes de Oliveira Silva',
    'Amanda Carolina Ludvichak Rodrigues',
    'Gilcimar Alves Silva',
    'Kathleen Rafaely Ferreira Lopes',
    'Silvane Maria Costa',
    'Carlos Aparecido da Silva Santos',
    'Anne Caroline Mesquita Pereira',
    'Samuel Batista dos Santos'
  ]) }),
  Object.freeze({ number: 7, members: Object.freeze([
    'Giovanna de Oliveira Alves',
    'Adriane de Castro Silva Alencar',
    'Letícia Cristo Galvão',
    'Yan Hubner Augusto',
    'Anna Beatriz Lessa Oliveira',
    'José Antônio Ferreira de Souza',
    'Gabriel Lourenço Diniz',
    'Giovani Barcellos',
    'Victor Habner Rodrigues',
    'Tarcisio Breno Pereira da Silva'
  ]) }),
  Object.freeze({ number: 8, members: Object.freeze([
    'Anderson Marcos',
    'Anne Melo',
    'Bruno Gomes',
    'Ianna',
    'Andreza Andrade',
    'Dantom',
    'Geovana Mendonça',
    'Mauro',
    'Letícia',
    'Renata Coltro'
  ]) }),
  Object.freeze({ number: 9, members: Object.freeze([
    'Byanka Gomes Barros',
    'Pamela Larissa Gomes de Lima',
    'Hugo Vinícius Pereira Silva',
    'Lara Daronch',
    'Geovani Garcia de Oliveira',
    'Beatriz Gomes Barros',
    'Julia Miriam Vilela',
    'Francieli Aparecida Zerbato',
    'Gabriele Alice Gelmi Fregati'
  ]) }),
  Object.freeze({ number: 10, members: Object.freeze([
    'Ellen Cordeiro Nunes',
    'Diego Oliveira Santos',
    'Clara Oliveira Santos'
  ]) })
]);

const SEEDED_NAME_KEYS = new Set(GROUPS.flatMap((group) => group.members.map(canonicalName)));
const SEEDED_JOINABLE_COUNT = GROUPS.find((group) => group.number === JOINABLE_GROUP)?.members.length || 0;
const DYNAMIC_JOINABLE_LIMIT = Math.max(0, MAX_MEMBERS - SEEDED_JOINABLE_COUNT);
const schemaPromises = new WeakMap();

function dbFrom(env = {}) {
  return env.MED_NYKUTO_DB || env.DB || null;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'x-robots-tag': 'noindex, nofollow',
      ...extraHeaders
    }
  });
}

function failure(status, code, error, extraHeaders = {}) {
  return json({ ok: false, code, error }, status, extraHeaders);
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

function cleanDisplayName(value) {
  if (typeof value !== 'string') return '';
  const name = value
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 5 || name.length > 100) return '';
  if (!/[\p{L}]/u.test(name) || /[<>{}\[\]\\/]/.test(name)) return '';
  if (name.split(' ').filter(Boolean).length < 2) return '';
  return name;
}

function canonicalName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function cleanMatricula(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const raw = String(value).normalize('NFKC').trim();
  if (!/^[\d\s._-]+$/.test(raw)) return '';
  const digits = raw.replace(/\D/g, '');
  return /^\d{4,24}$/.test(digits) ? digits : '';
}

function bytesToHex(bytes) {
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function randomToken(bytes = 16) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return bytesToHex(value);
}

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(value)));
  return bytesToHex(new Uint8Array(signature));
}

function privacySecret(env = {}) {
  return String(
    env.MED_NYKUTO_GROUP_PEPPER
    || env.MED_NYKUTO_CATRACA_PEPPER
    || env.MED_NYKUTO_IDENTITY_SALT
    || env.MED_NYKUTO_OWNER_TOKEN
    || ''
  ).trim();
}

async function readPayload(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) throw new Error('payload_too_large');
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    throw new Error('invalid_content_type');
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error('payload_too_large');
  try { return JSON.parse(raw); } catch { throw new Error('invalid_json'); }
}

async function ensureSchema(db) {
  if (schemaPromises.has(db)) return schemaPromises.get(db);
  const promise = (async () => {
    await db.prepare(`CREATE TABLE IF NOT EXISTS bioquimica_ii_group_members (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      group_number INTEGER NOT NULL CHECK(group_number BETWEEN 1 AND 10),
      display_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      matricula_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`).run();
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bioquimica_ii_group_members_name_unique
      ON bioquimica_ii_group_members(activity_id, normalized_name)`).run();
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bioquimica_ii_group_members_matricula_unique
      ON bioquimica_ii_group_members(activity_id, matricula_hash)`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS bioquimica_ii_group_rate_limits (
      key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL
    )`).run();
  })().catch((error) => {
    schemaPromises.delete(db);
    throw error;
  });
  schemaPromises.set(db, promise);
  return promise;
}

async function rateLimit(request, db, secret) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / RATE_WINDOW_SECONDS) * RATE_WINDOW_SECONDS;
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await hmac(`bioquimica-groups:v1:${windowStart}:${address}`, secret);
  await db.prepare(`INSERT INTO bioquimica_ii_group_rate_limits (key, window_start, count)
    VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET count = count + 1`).bind(key, windowStart).run();
  const row = await db.prepare('SELECT count FROM bioquimica_ii_group_rate_limits WHERE key = ?').bind(key).first();
  if (Math.random() < 0.05) {
    db.prepare('DELETE FROM bioquimica_ii_group_rate_limits WHERE window_start < ?')
      .bind(windowStart - RATE_WINDOW_SECONDS * 6)
      .run()
      .catch(() => {});
  }
  if (Number(row?.count || 0) > RATE_LIMIT) {
    return failure(429, 'rate_limited', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', {
      'retry-after': String(Math.max(1, windowStart + RATE_WINDOW_SECONDS - now))
    });
  }
  return null;
}

async function dynamicRows(db) {
  if (!db) return [];
  const result = await db.prepare(`SELECT display_name AS displayName, group_number AS groupNumber, created_at AS createdAt
    FROM bioquimica_ii_group_members
    WHERE activity_id = ?
    ORDER BY created_at ASC, display_name COLLATE NOCASE ASC`).bind(ACTIVITY_ID).all();
  return Array.isArray(result?.results) ? result.results : [];
}

function publicState(rows, options = {}) {
  const dynamicByGroup = new Map();
  for (const row of rows) {
    const number = Number(row.groupNumber);
    if (!dynamicByGroup.has(number)) dynamicByGroup.set(number, []);
    dynamicByGroup.get(number).push({ displayName: String(row.displayName || '').trim() });
  }
  const groups = GROUPS.map((seed) => {
    const dynamic = dynamicByGroup.get(seed.number) || [];
    const members = seed.members.map((displayName) => ({ displayName, source: 'initial' })).concat(
      dynamic.map((member) => ({ ...member, source: 'registration' }))
    );
    const count = members.length;
    const available = Math.max(0, MAX_MEMBERS - count);
    const overBy = Math.max(0, count - MAX_MEMBERS);
    return {
      number: seed.number,
      name: `Grupo ${seed.number}`,
      capacity: MAX_MEMBERS,
      count,
      available,
      overBy,
      status: overBy ? 'over-capacity' : count >= MAX_MEMBERS ? 'full' : seed.number === JOINABLE_GROUP ? 'open' : 'registered',
      joinOpen: seed.number === JOINABLE_GROUP && available > 0 && Boolean(options.joinAvailable),
      members
    };
  });
  const group10 = groups.find((group) => group.number === JOINABLE_GROUP);
  return {
    ok: true,
    activity: {
      id: ACTIVITY_ID,
      subject: 'Bioquímica II',
      title: 'Prova prática: caso clínico, trabalhos assinados e grupos',
      examDate: '2026-09-02',
      examDateLabel: '02/09/2026 · quarta-feira',
      capacity: MAX_MEMBERS,
      joinableGroup: JOINABLE_GROUP,
      instructions: INSTRUCTIONS,
      totalRegistered: groups.reduce((total, group) => total + group.count, 0),
      group10Available: group10?.available || 0,
      needsCorrection: groups.some((group) => group.overBy > 0),
      privacyNote: 'A matrícula é usada apenas para impedir duplicidade e nunca é exibida na lista pública.'
    },
    groups,
    joinAvailable: Boolean(options.joinAvailable),
    generatedAt: new Date().toISOString()
  };
}

async function handleGet(context) {
  const db = dbFrom(context.env || {});
  const secret = privacySecret(context.env || {});
  try {
    if (!db) return json(publicState([], { joinAvailable: false }));
    await ensureSchema(db);
    return json(publicState(await dynamicRows(db), { joinAvailable: Boolean(secret) }));
  } catch (error) {
    console.error('bioquimica_groups_get_error', error);
    return json(publicState([], { joinAvailable: false }));
  }
}

async function handlePost(context) {
  const { request, env = {} } = context;
  if (!sameOrigin(request)) return failure(403, 'origin_rejected', 'A solicitação não veio deste site.');
  const db = dbFrom(env);
  const secret = privacySecret(env);
  if (!db || !secret) return failure(503, 'registration_unavailable', 'A inscrição compartilhada ainda não está configurada. A lista continua disponível para consulta.');

  let data;
  try { data = await readPayload(request); }
  catch (error) {
    return failure(error.message === 'payload_too_large' ? 413 : 400, error.message, 'Os dados enviados não são válidos.');
  }

  if (String(data.action || 'join') !== 'join') return failure(400, 'unknown_action', 'Ação não reconhecida.');
  const displayName = cleanDisplayName(data.displayName ?? data.name);
  const matricula = cleanMatricula(data.matricula);
  const groupNumber = Number(data.groupNumber || JOINABLE_GROUP);
  if (!displayName) return failure(400, 'invalid_name', 'Informe seu nome completo.');
  if (!matricula) return failure(400, 'invalid_matricula', 'Informe uma matrícula válida com 4 a 24 dígitos.');
  if (groupNumber !== JOINABLE_GROUP) return failure(400, 'invalid_group', 'As novas inscrições devem entrar no Grupo 10.');

  const normalizedName = canonicalName(displayName);
  if (SEEDED_NAME_KEYS.has(normalizedName)) return failure(409, 'already_registered', 'Esse nome já aparece na lista de grupos.');

  try {
    await ensureSchema(db);
    const limited = await rateLimit(request, db, secret);
    if (limited) return limited;
    const matriculaHash = await hmac(`bioquimica-groups:v1:${ACTIVITY_ID}:${matricula}`, secret);
    const existing = await db.prepare(`SELECT group_number AS groupNumber, display_name AS displayName
      FROM bioquimica_ii_group_members
      WHERE activity_id = ? AND (normalized_name = ? OR matricula_hash = ?)
      LIMIT 1`).bind(ACTIVITY_ID, normalizedName, matriculaHash).first();
    if (existing) return failure(409, 'already_registered', `${existing.displayName} já está no Grupo ${existing.groupNumber}.`);

    const inserted = await db.prepare(`INSERT INTO bioquimica_ii_group_members (
        id, activity_id, group_number, display_name, normalized_name, matricula_hash, created_at
      )
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM bioquimica_ii_group_members WHERE activity_id = ? AND group_number = ?) < ?`)
      .bind(
        `bq-${randomToken(16)}`,
        ACTIVITY_ID,
        JOINABLE_GROUP,
        displayName,
        normalizedName,
        matriculaHash,
        new Date().toISOString(),
        ACTIVITY_ID,
        JOINABLE_GROUP,
        DYNAMIC_JOINABLE_LIMIT
      )
      .run();
    const changes = Number(inserted?.meta?.changes ?? inserted?.changes ?? 0);
    if (changes < 1) return failure(409, 'group_full', 'O Grupo 10 acabou de atingir o limite de 10 integrantes.');
    return json({
      ...publicState(await dynamicRows(db), { joinAvailable: true }),
      message: `${displayName} foi adicionado ao Grupo 10.`
    }, 201);
  } catch (error) {
    console.error('bioquimica_groups_post_error', error);
    if (/UNIQUE/i.test(String(error))) return failure(409, 'already_registered', 'Esse nome ou essa matrícula já está cadastrado.');
    return failure(500, 'server_error', 'Não foi possível salvar a inscrição agora.');
  }
}

export async function onRequestGet(context) {
  return handleGet(context);
}

export async function onRequestPost(context) {
  return handlePost(context);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: 'GET, POST, OPTIONS',
      'cache-control': 'no-store',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400'
    }
  });
}

export const __test = Object.freeze({
  ACTIVITY_ID,
  MAX_MEMBERS,
  JOINABLE_GROUP,
  canonicalName,
  cleanDisplayName,
  cleanMatricula,
  publicState,
  sameOrigin
});
