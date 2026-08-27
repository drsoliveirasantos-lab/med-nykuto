const CURRENT_CLASS_PUBLIC_FIXTURE = {
  ok: true,
  notices: [],
  tasks: [
    {
      id: 'epi-presentation',
      course: 'Epidemiología',
      title: 'Exposición grupal de enfermedad sorteada',
      description: 'Preparar la exposición con el grupo y revisar la consigna completa.',
      status: 'published',
      dueLabel: 'Mié. 2 sep.',
      dueAt: '2099-09-02T11:20:00-03:00'
    },
    {
      id: 'bio-activities',
      course: 'Bioquímica II',
      title: 'Actividades 3 y 4 impresas y manuscritas',
      description: 'Imprimir las actividades y completar el desarrollo a mano.',
      status: 'published',
      dueLabel: 'Jue. 3 sep.',
      dueAt: '2099-09-03T09:10:00-03:00'
    }
  ],
  activities: [],
  groups: [],
  members: [],
  files: [],
  dates: [],
  generatedAt: '2026-08-27T20:28:00-03:00'
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
