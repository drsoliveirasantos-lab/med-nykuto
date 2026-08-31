const CURRENT_CLASS_PUBLIC_FIXTURE = {
  ok: true,
  notices: [],
  tasks: [
    {
      id: 'epi-presentation',
      course: 'Epidemiología',
      title: 'Exposición grupal de enfermedad sorteada',
      description: 'Presentación reprogramada; fecha exacta por confirmar y evaluación individual.',
      status: 'published',
      dueLabel: 'Semana 31 ago.–4 sep. · fecha por confirmar',
      dueAt: null
    },
    {
      id: 'bio-activities',
      course: 'Bioquímica II',
      title: 'Actividades 3 y 4 impresas y manuscritas',
      description: 'Lleva los cuatro trabajos firmados; la presencia es obligatoria.',
      status: 'published',
      dueLabel: 'Vie. 4 sep. · práctica',
      dueAt: null
    }
  ],
  activities: [],
  groups: [],
  members: [],
  files: [],
  dates: [],
  contentUpdatedAt: '2026-08-28T20:28:00-03:00',
  generatedAt: '2026-08-30T00:00:00-03:00'
};

async function routeCurrentClassPublic(page) {
  await page.route('**/api/class-hub**', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'GET' && url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CURRENT_CLASS_PUBLIC_FIXTURE) });
    }
    return route.continue();
  });
}

module.exports = { CURRENT_CLASS_PUBLIC_FIXTURE, routeCurrentClassPublic };
