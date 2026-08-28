const ACTIVITY_ID = 'bioquimica-pratica-2026-09-02';
const MAX_MEMBERS = 10;
const JOINABLE_GROUP = 10;
const MAX_BODY_BYTES = 8192;
const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT = 15;

const INSTRUCTIONS = Object.freeze([
  'Os grupos podem ter no máximo 10 integrantes.',
  'O caso clínico com perguntas vale 1 ponto.',
  'Leve TODOS os trabalhos assinados no dia da prova.',
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
const schemaPromises = new WeakMap();

function dbFrom(env) {
  return env.MED_NYKUTO_DB || env.DB || null;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      ...extraHeaders
    }
  });
}

function failure(status, code, message, extraHeaders = {}) {
  return json({ ok: false, code, error: message }, status, extraHeaders);
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
  if (/[<>{}\[\]\\/]/.test(name) || !/[\p{L}]/u.test(name)) return '';
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
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

function cleanMatricula(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const raw = String(value).normalize('NFKC').trim();
  if (!/^[\d\s._-]+$/.test(raw)) return '';
  const digits = raw.replace(/\D/g, '');
  return /^\d{4,24}$/.test(digits) ? digits : '';
}

function cleanToken(value) {
  const token = String(value || '').trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(token) ? token : '';
}

function bytesToHex(bytes) {
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
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

function privacySecret(env) {
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
    await db.prepare(`CREATE TABLE IF NOT EXISTS bioquimica_group_members (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      group_number INTEGER NOT NULL CHECK(group_number BETWEEN 1 AND 10),
      display_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      matricula_hash TEXT NOT NULL,
      leave_token_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`).run();
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bioquimica_group_members_name_unique
      ON bioquimica_group_members(activity_id, normalized_name)`).run();
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bioquimica_group_members_matricula_unique
      ON bioquimica_group_members(activity_id, matricula_hash)`).run();
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bioquimica_group_members_leave_unique
      ON bioquimica_group_members(activity_id, leave_token_hash)`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS bioquimica_group_rate_limits (
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

async function rateLimit(request, db, secret, scope) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / RATE_WINDOW_SECONDS) * RATE_WINDOW_SECONDS;
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await hmac(`bioquimica-groups:v1:${scope}:${windowStart}:${address}`, secret);
  await db.prepare(`INSERT INTO bioquimica_group_rate_limits (key, window_start, count)
    VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET count = count + 1`).bind(key, windowStart).run();
  const row = await db.prepare('SELECT count FROM bioquimica_group_rate_limits WHERE key = ?').bind(key).first();
  if (Math.random() < 0.05) {
    db.prepare('DELETE FROM bioquimica_group_rate_limits WHERE window_start < ?')
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
    FROM bioquimica_group_members
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
    const members = seed.members.map((displayName) => ({ displayName })).concat(dynamic);
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
      needsCorrection: groups.some((group) => group.overBy > 0)
    },
    groups,
    joinAvailable: Boolean(options.joinAvailable),
    generatedAt: new Date().toISOString()
  };
}

async function getState(env) {
  const db = dbFrom(env);
  if (!db) return publicState([], { joinAvailable: false });
  await ensureSchema(db);
  return publicState(await dynamicRows(db), { joinAvailable: Boolean(privacySecret(env)) });
}

async function joinGroup(request, env, data) {
  if (!sameOrigin(request)) return failure(403, 'origin_rejected', 'Abra o formulário pelo próprio site Med Nykuto.');
  const db = dbFrom(env);
  if (!db) return failure(503, 'database_unavailable', 'A base compartilhada ainda não está disponível. Tente novamente em alguns minutos.');
  const secret = privacySecret(env);
  if (!secret) return failure(503, 'privacy_secret_missing', 'A inscrição está temporariamente indisponível por segurança.');
  await ensureSchema(db);
  const limited = await rateLimit(request, db, secret, 'join');
  if (limited) return limited;

  if (String(data.website || '').trim()) return json({ ok: true }, 202);
  if (data.confirmUngrouped !== true) return failure(400, 'confirmation_required', 'Confirme que você ainda não aparece em outro grupo.');
  if (Number(data.groupNumber) !== JOINABLE_GROUP) return failure(400, 'group_locked', 'Somente o Grupo 10 está aberto para novas inscrições nesta página.');

  const displayName = cleanDisplayName(data.name);
  const normalizedName = canonicalName(displayName);
  const matricula = cleanMatricula(data.matricula);
  if (!displayName || !normalizedName) return failure(400, 'invalid_name', 'Digite seu nome e sobrenome completos.');
  if (!matricula) return failure(400, 'invalid_matricula', 'Digite uma matrícula válida, somente com números.');
  if (SEEDED_NAME_KEYS.has(normalizedName)) return failure(409, 'already_grouped', 'Esse nome já aparece em um dos grupos. Use a busca para conferir.');

  const matriculaHash = await hmac(`bioquimica-groups:v1:matricula:${matricula}`, secret);
  const leaveToken = randomToken();
  const leaveTokenHash = await hmac(`bioquimica-groups:v1:leave:${leaveToken}`, secret);
  const createdAt = new Date().toISOString();
  const dynamicCapacity = MAX_MEMBERS - GROUPS.find((group) => group.number === JOINABLE_GROUP).members.length;

  try {
    const result = await db.prepare(`INSERT INTO bioquimica_group_members
      (id, activity_id, group_number, display_name, normalized_name, matricula_hash, leave_token_hash, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM bioquimica_group_members WHERE activity_id = ? AND group_number = ?) < ?`)
      .bind(
        crypto.randomUUID(),
        ACTIVITY_ID,
        JOINABLE_GROUP,
        displayName,
        normalizedName,
        matriculaHash,
        leaveTokenHash,
        createdAt,
        ACTIVITY_ID,
        JOINABLE_GROUP,
        dynamicCapacity
      )
      .run();
    const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
    if (!changes) return failure(409, 'group_full', 'O Grupo 10 acabou de ficar completo. Atualize a lista para conferir.');
  } catch (error) {
    const message = String(error || '');
    if (/normalized_name|name_unique/i.test(message)) return failure(409, 'name_already_registered', 'Esse nome já foi inscrito no Grupo 10.');
    if (/matricula_hash|matricula_unique/i.test(message)) return failure(409, 'matricula_already_registered', 'Essa matrícula já foi usada em uma inscrição.');
    console.error('bioquimica_groups_join_error', error);
    return failure(500, 'join_failed', 'Não foi possível concluir a inscrição agora. Tente novamente.');
  }

  return json({
    ok: true,
    membership: {
      activityId: ACTIVITY_ID,
      groupNumber: JOINABLE_GROUP,
      displayName,
      leaveToken,
      createdAt
    },
    state: publicState(await dynamicRows(db), { joinAvailable: true })
  }, 201);
}

async function leaveGroup(request, env, data) {
  if (!sameOrigin(request)) return failure(403, 'origin_rejected', 'Abra o formulário pelo próprio site Med Nykuto.');
  const db = dbFrom(env);
  if (!db) return failure(503, 'database_unavailable', 'A base compartilhada não está disponível.');
  const secret = privacySecret(env);
  if (!secret) return failure(503, 'privacy_secret_missing', 'A alteração está temporariamente indisponível por segurança.');
  await ensureSchema(db);
  const limited = await rateLimit(request, db, secret, 'leave');
  if (limited) return limited;
  const token = cleanToken(data.leaveToken);
  if (!token) return failure(400, 'invalid_leave_token', 'Não foi possível identificar sua inscrição neste aparelho.');
  const leaveTokenHash = await hmac(`bioquimica-groups:v1:leave:${token}`, secret);
  const result = await db.prepare(`DELETE FROM bioquimica_group_members
    WHERE activity_id = ? AND leave_token_hash = ?`).bind(ACTIVITY_ID, leaveTokenHash).run();
  const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
  if (!changes) return failure(404, 'membership_not_found', 'A inscrição já não aparece na lista.');
  return json({ ok: true, state: publicState(await dynamicRows(db), { joinAvailable: true }) });
}

async function handleGet(env) {
  try {
    return json(await getState(env));
  } catch (error) {
    console.error('bioquimica_groups_get_error', error);
    return json(publicState([], { joinAvailable: false }));
  }
}

async function handlePost(request, env) {
  let data;
  try {
    data = await readPayload(request);
  } catch (error) {
    const code = String(error?.message || 'invalid_json');
    if (code === 'payload_too_large') return failure(413, code, 'A solicitação é grande demais.');
    if (code === 'invalid_content_type') return failure(415, code, 'Envie os dados em formato JSON.');
    return failure(400, 'invalid_json', 'Não foi possível ler o formulário.');
  }
  const action = String(data?.action || '').trim().toLowerCase();
  if (action === 'join') return joinGroup(request, env, data);
  if (action === 'leave') return leaveGroup(request, env, data);
  return failure(400, 'invalid_action', 'A ação solicitada não existe.');
}

export async function onRequest(context) {
  const method = String(context.request?.method || '').toUpperCase();
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS', 'cache-control': 'no-store' } });
  }
  if (method === 'GET' || method === 'HEAD') return handleGet(context.env || {});
  if (method === 'POST') return handlePost(context.request, context.env || {});
  return failure(405, 'method_not_allowed', 'Método não permitido.', { allow: 'GET, POST, OPTIONS' });
}

export const __test = Object.freeze({ canonicalName, cleanDisplayName, cleanMatricula, publicState });
