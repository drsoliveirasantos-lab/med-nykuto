const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}$/;

function database(env) {
  return env.MED_NYKUTO_DB || env.DB || null;
}

function cleanSlug(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (!slug) return 's4-e';
  return SLUG_PATTERN.test(slug) ? slug : '';
}

function fallback(slug) {
  if (slug === 's4-e') return { slug, name: 'Med Nykuto · 4.º E' };
  return { slug, name: `Med Nykuto · ${slug.toUpperCase()}` };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = cleanSlug(url.searchParams.get('class'));
  if (!slug) {
    return new Response(JSON.stringify({ ok: false, code: 'invalid_class' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
    });
  }
  let classInfo = fallback(slug);
  const db = database(env);

  if (db) {
    try {
      const row = await db.prepare(`SELECT slug,name FROM hub_classes WHERE slug=? AND status='active'`).bind(slug).first();
      if (!row && slug !== 's4-e') {
        return new Response(JSON.stringify({ ok: false, code: 'class_not_found' }), {
          status: 404,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
        });
      }
      if (row) classInfo = { slug: row.slug, name: row.name };
    } catch (_) {
      // The static fallback keeps the manifest installable while the first migration runs.
      if (slug !== 's4-e') {
        return new Response(JSON.stringify({ ok: false, code: 'database_unavailable' }), {
          status: 503,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
        });
      }
    }
  } else if (slug !== 's4-e') {
    return new Response(JSON.stringify({ ok: false, code: 'database_unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
    });
  }

  const start = `/turma/${encodeURIComponent(classInfo.slug)}`;
  const body = {
    id: `${start}/`,
    name: classInfo.name,
    short_name: classInfo.slug === 's4-e' ? 'Med Nykuto 4E' : `Nykuto ${classInfo.slug.toUpperCase()}`,
    description: 'Tareas, materias, calendario, grupos y revisión de la turma.',
    lang: 'es',
    start_url: `${start}#inicio`,
    scope: '/turma/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#07111f',
    theme_color: '#07111f',
    categories: ['education', 'medical'],
    icons: [
      { src: '/assets/pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ],
    shortcuts: [
      { name: 'Tareas', short_name: 'Tareas', url: `${start}#tareas` },
      { name: 'Materias', short_name: 'Materias', url: `${start}#materias` },
      classInfo.slug === 's4-e'
        ? { name: 'Entrenamiento', short_name: 'P1', url: '/p1.html' }
        : { name: 'Entrenamiento', short_name: 'Entrenar', url: `${start}#estudiar` }
    ]
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff'
    }
  });
}
