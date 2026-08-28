(function () {
  'use strict';

  var API = '/api/bioquimica-groups';
  var STORAGE_KEY = 'med-nykuto-bioquimica-groups-membership-v1';
  var TASK_ID = 'task-bioquimica-pratica-2026-09-02';
  var FULL_PAGE = '/bioquimica-grupos.html';
  var currentState = null;
  var statePromise = null;
  var mounts = [];
  var reinjectTimer = 0;

  function el(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function append(parent) {
    for (var index = 1; index < arguments.length; index += 1) {
      var child = arguments[index];
      if (child === null || child === undefined) continue;
      parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return parent;
  }

  function readMembership() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return value && value.leaveToken && value.displayName ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveMembership(value) {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (error) {}
  }

  function nameTokens(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function canonical(value) {
    return nameTokens(value).sort().join(' ');
  }

  function nameMatches(displayName, query) {
    var requested = nameTokens(query);
    var available = nameTokens(displayName);
    return requested.length > 0 && requested.every(function (part) {
      return available.some(function (candidate) { return candidate.indexOf(part) === 0; });
    });
  }

  function requestState(force) {
    if (currentState && !force) return Promise.resolve(currentState);
    if (statePromise && !force) return statePromise;
    statePromise = fetch(API, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok || !body || body.ok === false) throw new Error(body && body.error ? body.error : 'Não foi possível carregar os grupos.');
        return body;
      });
    }).then(function (body) {
      currentState = body;
      statePromise = null;
      reconcileMembership(body);
      renderAll();
      return body;
    }).catch(function (error) {
      statePromise = null;
      throw error;
    });
    return statePromise;
  }

  function post(action, data) {
    return fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(Object.assign({ action: action }, data || {}))
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok || body.ok === false) throw new Error(body.error || 'Não foi possível concluir a solicitação.');
        return body;
      });
    });
  }

  function reconcileMembership(state) {
    var membership = readMembership();
    if (!membership || !state || !Array.isArray(state.groups)) return;
    var group = state.groups.find(function (item) { return Number(item.number) === Number(membership.groupNumber); });
    var found = group && group.members.some(function (member) {
      return canonical(member.displayName) === canonical(membership.displayName);
    });
    if (!found) saveMembership(null);
  }

  function stateGroup(state, number) {
    return state && Array.isArray(state.groups)
      ? state.groups.find(function (group) { return Number(group.number) === Number(number); })
      : null;
  }

  function statusLabel(group) {
    if (!group) return 'Carregando';
    if (group.overBy > 0) return 'AJUSTE NECESSÁRIO';
    if (group.count >= group.capacity) return 'COMPLETO';
    if (group.joinOpen) return group.available + (group.available === 1 ? ' VAGA' : ' VAGAS');
    return 'LISTA REGISTRADA';
  }

  function statusClass(group) {
    if (!group) return '';
    if (group.overBy > 0) return ' is-over';
    if (group.count >= group.capacity) return ' is-full';
    if (group.joinOpen) return ' is-open';
    return '';
  }

  function groupOccupancy(group) {
    return String(group.count) + '/' + String(group.capacity);
  }

  function fact(value, label) {
    var item = el('div', 'bq-fact');
    append(item, el('strong', '', value), el('small', '', label));
    return item;
  }

  function renderInstructions(container, state, compact) {
    var activity = state.activity;
    var section = el('section', 'bq-instructions');
    var heading = el('div', 'bq-section-heading');
    append(heading, el('span', '', 'CONSIGNAS'), el('h2', '', compact ? 'O essencial para a prova' : 'Consignas da prova prática'));
    section.appendChild(heading);

    var facts = el('div', 'bq-facts');
    append(
      facts,
      fact('02/09', 'quarta-feira'),
      fact('10', 'integrantes no máximo'),
      fact('1 ponto', 'caso clínico'),
      fact('OBRIGATÓRIA', 'presença')
    );
    section.appendChild(facts);

    var list = el('ul', 'bq-instruction-list');
    var instructions = compact ? activity.instructions.slice(0, 6) : activity.instructions;
    instructions.forEach(function (instruction) {
      var item = el('li');
      append(item, el('span', 'bq-check', '✓'), el('p', '', instruction));
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function renderSearch(container, state, compact) {
    var section = el('section', 'bq-search-card');
    var heading = el('div', 'bq-section-heading');
    append(heading, el('span', '', 'BUSCA RÁPIDA'), el('h2', '', 'Encontre seu nome'));
    section.appendChild(heading);
    section.appendChild(el('p', 'bq-muted', 'Digite parte do nome para verificar em qual grupo você já aparece.'));

    var form = el('form', 'bq-search-form');
    form.setAttribute('role', 'search');
    var label = el('label');
    label.appendChild(el('span', 'bq-visually-hidden', 'Nome do estudante'));
    var input = el('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Ex.: Diego Oliveira Santos';
    input.maxLength = 100;
    input.setAttribute('aria-label', 'Buscar nome nos grupos');
    var button = el('button', '', 'Buscar');
    button.type = 'submit';
    label.appendChild(input);
    append(form, label, button);
    section.appendChild(form);

    var results = el('div', 'bq-search-results');
    results.setAttribute('aria-live', 'polite');
    section.appendChild(results);

    function showResults() {
      results.replaceChildren();
      var query = canonical(input.value);
      if (query.length < 2) {
        results.appendChild(el('p', 'bq-muted', 'Digite pelo menos duas letras.'));
        return;
      }
      var matches = [];
      state.groups.forEach(function (group) {
        group.members.forEach(function (member) {
          if (nameMatches(member.displayName, input.value)) matches.push({ group: group, member: member });
        });
      });
      if (!matches.length) {
        var empty = el('div', 'bq-search-empty');
        append(
          empty,
          el('strong', '', 'Seu nome não foi encontrado.'),
          el('p', '', 'Se você realmente ainda estiver sem grupo, o Grupo 10 está aberto enquanto houver vaga.')
        );
        results.appendChild(empty);
        return;
      }
      var list = el('div', 'bq-search-match-list');
      matches.slice(0, compact ? 5 : 12).forEach(function (match) {
        var row = el('div', 'bq-search-match');
        append(row, el('strong', '', match.member.displayName), el('span', '', 'Grupo ' + match.group.number));
        list.appendChild(row);
      });
      results.appendChild(list);
      if (matches.length > (compact ? 5 : 12)) results.appendChild(el('p', 'bq-muted', 'Refine a busca para ver menos resultados.'));
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      showResults();
    });
    input.addEventListener('input', function () {
      if (input.value.trim().length >= 3) showResults();
      else results.replaceChildren();
    });
    return section;
  }

  function renderMembershipPanel(state, compact) {
    var group = stateGroup(state, 10);
    var membership = readMembership();
    var section = el('section', 'bq-join-card' + (group && group.joinOpen ? ' is-available' : ''));
    var header = el('div', 'bq-join-header');
    var copy = el('div');
    append(copy, el('span', '', 'GRUPO 10'), el('h2', '', group ? groupOccupancy(group) + ' integrantes' : 'Carregando…'));
    var badge = el('strong', 'bq-status' + statusClass(group), statusLabel(group));
    append(header, copy, badge);
    section.appendChild(header);

    if (group) {
      var members = el('ol', 'bq-group10-members');
      group.members.forEach(function (member, index) {
        var item = el('li');
        append(item, el('span', '', String(index + 1).padStart(2, '0')), el('strong', '', member.displayName));
        members.appendChild(item);
      });
      for (var slot = group.count; slot < group.capacity; slot += 1) {
        var openItem = el('li', 'is-open');
        append(openItem, el('span', '', String(slot + 1).padStart(2, '0')), el('strong', '', 'Vaga disponível'));
        members.appendChild(openItem);
      }
      section.appendChild(members);
    }

    var status = el('p', 'bq-form-status');
    status.setAttribute('aria-live', 'polite');

    if (membership && group && group.members.some(function (member) { return canonical(member.displayName) === canonical(membership.displayName); })) {
      var confirmed = el('div', 'bq-membership-confirmed');
      append(
        confirmed,
        el('strong', '', 'Inscrição confirmada'),
        el('p', '', membership.displayName + ' está no Grupo 10 neste aparelho.')
      );
      var leave = el('button', 'bq-secondary-button', 'Retirar meu nome');
      leave.type = 'button';
      leave.addEventListener('click', function () {
        if (!window.confirm('Retirar seu nome do Grupo 10?')) return;
        leave.disabled = true;
        status.textContent = 'Atualizando a lista…';
        post('leave', { leaveToken: membership.leaveToken }).then(function (body) {
          saveMembership(null);
          currentState = body.state;
          renderAll();
        }).catch(function (error) {
          status.textContent = error.message;
          leave.disabled = false;
        });
      });
      append(confirmed, leave, status);
      section.appendChild(confirmed);
      return section;
    }

    if (!group || group.available <= 0) {
      section.appendChild(el('p', 'bq-warning-copy', 'O Grupo 10 está completo. Não é possível adicionar novos nomes.'));
      return section;
    }

    if (!state.joinAvailable) {
      section.appendChild(el('p', 'bq-warning-copy', 'A lista pode ser consultada, mas a inscrição compartilhada está temporariamente indisponível.'));
      return section;
    }

    var details = el('details', 'bq-join-details');
    if (!compact) details.open = true;
    var summary = el('summary');
    append(summary, el('strong', '', 'Ainda estou sem grupo'), el('span', '', 'Entrar no Grupo 10'));
    details.appendChild(summary);

    var form = el('form', 'bq-join-form');
    var nameLabel = el('label');
    append(nameLabel, el('span', '', 'Nome e sobrenome completos'));
    var name = el('input');
    name.name = 'name';
    name.type = 'text';
    name.autocomplete = 'name';
    name.maxLength = 100;
    name.required = true;
    name.placeholder = 'Nome completo';
    nameLabel.appendChild(name);

    var matriculaLabel = el('label');
    append(matriculaLabel, el('span', '', 'Matrícula'));
    var matricula = el('input');
    matricula.name = 'matricula';
    matricula.type = 'text';
    matricula.inputMode = 'numeric';
    matricula.autocomplete = 'off';
    matricula.maxLength = 24;
    matricula.required = true;
    matricula.placeholder = 'Somente números';
    matriculaLabel.appendChild(matricula);

    var honeypot = el('label', 'bq-honeypot');
    honeypot.setAttribute('aria-hidden', 'true');
    honeypot.appendChild(el('span', '', 'Website'));
    var website = el('input');
    website.name = 'website';
    website.type = 'text';
    website.tabIndex = -1;
    website.autocomplete = 'off';
    honeypot.appendChild(website);

    var confirmation = el('label', 'bq-confirmation');
    var checkbox = el('input');
    checkbox.type = 'checkbox';
    checkbox.required = true;
    append(confirmation, checkbox, el('span', '', 'Confirmo que procurei meu nome e ainda não apareço em nenhum outro grupo.'));

    var privacy = el('p', 'bq-privacy-note', 'Seu nome ficará visível na lista. A matrícula é convertida em um código de verificação e nunca aparece publicamente.');
    var submit = el('button', 'bq-primary-button', 'Confirmar no Grupo 10');
    submit.type = 'submit';
    append(form, nameLabel, matriculaLabel, honeypot, confirmation, privacy, submit, status);
    details.appendChild(form);
    section.appendChild(details);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      submit.disabled = true;
      submit.textContent = 'Confirmando…';
      post('join', {
        name: name.value,
        matricula: matricula.value,
        website: website.value,
        groupNumber: 10,
        confirmUngrouped: checkbox.checked
      }).then(function (body) {
        saveMembership(body.membership);
        currentState = body.state;
        renderAll();
        announce('Inscrição confirmada no Grupo 10.');
      }).catch(function (error) {
        status.textContent = error.message;
        submit.disabled = false;
        submit.textContent = 'Confirmar no Grupo 10';
      });
    });
    return section;
  }

  function renderGroupCard(group) {
    var card = el('details', 'bq-group-card' + statusClass(group));
    if (group.number === 10 || group.overBy > 0) card.open = true;
    var summary = el('summary');
    var title = el('div');
    append(title, el('span', '', 'GRUPO ' + group.number), el('strong', '', groupOccupancy(group)));
    append(summary, title, el('em', '', statusLabel(group)));
    card.appendChild(summary);

    if (group.overBy > 0) {
      card.appendChild(el('p', 'bq-over-warning', 'Este grupo tem ' + group.overBy + ' integrante acima do limite e precisa ser ajustado.'));
    } else if (group.number !== 10 && group.available > 0) {
      card.appendChild(el('p', 'bq-registered-note', 'A lista já foi informada. As vagas não estão abertas por esta página para evitar alterações sem confirmação.'));
    }

    var list = el('ol', 'bq-member-list');
    group.members.forEach(function (member, index) {
      var item = el('li');
      append(item, el('span', '', String(index + 1).padStart(2, '0')), el('strong', '', member.displayName));
      list.appendChild(item);
    });
    if (group.number === 10) {
      for (var slot = group.count; slot < group.capacity; slot += 1) {
        var open = el('li', 'is-open');
        append(open, el('span', '', String(slot + 1).padStart(2, '0')), el('strong', '', 'Vaga disponível'));
        list.appendChild(open);
      }
    }
    card.appendChild(list);
    return card;
  }

  function renderGroupsBoard(state) {
    var section = el('section', 'bq-groups-section');
    var heading = el('div', 'bq-section-heading bq-groups-heading');
    var copy = el('div');
    append(copy, el('span', '', 'LISTA ATUAL'), el('h2', '', 'Grupos de Bioquímica II'));
    var total = el('strong', 'bq-total', state.activity.totalRegistered + ' nomes registrados');
    append(heading, copy, total);
    section.appendChild(heading);
    if (state.activity.needsCorrection) {
      section.appendChild(el('p', 'bq-global-warning', '⚠️ O Grupo 6 está com 11/10. Uma pessoa precisa ser realocada para respeitar o limite da professora.'));
    }
    var grid = el('div', 'bq-groups-grid');
    state.groups.forEach(function (group) { grid.appendChild(renderGroupCard(group)); });
    section.appendChild(grid);
    return section;
  }

  function renderShareActions() {
    var actions = el('div', 'bq-share-actions');
    var share = el('button', 'bq-secondary-button', 'Compartilhar a página');
    share.type = 'button';
    var copy = el('button', 'bq-secondary-button', 'Copiar link');
    copy.type = 'button';
    var status = el('span', 'bq-share-status');
    status.setAttribute('aria-live', 'polite');
    share.addEventListener('click', function () {
      var url = new URL(FULL_PAGE, location.href).href;
      if (navigator.share) {
        navigator.share({ title: 'Grupos — Bioquímica II', text: 'Confira seu grupo para a prova prática de Bioquímica II.', url: url }).catch(function () {});
      } else {
        copyLink(url, status);
      }
    });
    copy.addEventListener('click', function () { copyLink(new URL(FULL_PAGE, location.href).href, status); });
    append(actions, share, copy, status);
    return actions;
  }

  function copyLink(value, status) {
    var promise = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(value)
      : Promise.reject(new Error('clipboard'));
    promise.then(function () { status.textContent = 'Link copiado.'; }).catch(function () {
      var field = el('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy');
        status.textContent = 'Link copiado.';
      } catch (error) {
        status.textContent = value;
      }
      field.remove();
    });
  }

  function renderFull(root, state) {
    root.replaceChildren();
    var hero = el('section', 'bq-hero');
    var meta = el('div', 'bq-hero-meta');
    append(meta, el('span', '', 'BIOQUÍMICA II'), el('time', '', state.activity.examDateLabel));
    meta.lastChild.dateTime = state.activity.examDate;
    append(
      hero,
      meta,
      el('h1', '', 'Prova prática e organização dos grupos'),
      el('p', '', 'Consulte a lista já preenchida. Só precisa agir quem ainda não aparece em nenhum grupo.'),
      renderShareActions()
    );
    root.appendChild(hero);
    root.appendChild(renderInstructions(root, state, false));
    root.appendChild(renderSearch(root, state, false));
    root.appendChild(renderMembershipPanel(state, false));
    root.appendChild(renderGroupsBoard(state));
    var footer = el('p', 'bq-footer-note', 'Lista organizada a partir das informações enviadas pela turma. Em caso de divergência, confirme diretamente com a professora ou com a delegação.');
    root.appendChild(footer);
  }

  function renderCompact(root, state) {
    root.replaceChildren();
    var layout = el('div', 'bq-compact-layout');
    layout.appendChild(renderInstructions(layout, state, true));
    layout.appendChild(renderSearch(layout, state, true));
    layout.appendChild(renderMembershipPanel(state, true));
    root.appendChild(layout);
    var actions = el('div', 'bq-compact-actions');
    var full = el('a', 'bq-primary-link', 'Ver os 10 grupos em tela cheia →');
    full.href = FULL_PAGE;
    append(actions, full);
    root.appendChild(actions);
  }

  function renderError(root, error) {
    root.replaceChildren();
    var box = el('div', 'bq-error');
    append(box, el('strong', '', 'Não foi possível carregar a lista.'), el('p', '', error.message || 'Tente novamente.'));
    var retry = el('button', 'bq-primary-button', 'Tentar novamente');
    retry.type = 'button';
    retry.addEventListener('click', function () {
      root.replaceChildren(el('p', 'bq-loading', 'Atualizando os grupos…'));
      requestState(true).catch(function (nextError) { renderError(root, nextError); });
    });
    box.appendChild(retry);
    root.appendChild(box);
  }

  function mount(root, mode) {
    if (!root || root.dataset.bqMounted === 'true') return;
    root.dataset.bqMounted = 'true';
    mounts.push({ root: root, mode: mode || root.dataset.bioquimicaGroupsApp || 'full' });
    root.replaceChildren(el('p', 'bq-loading', 'Atualizando os grupos…'));
    requestState(false).catch(function (error) { renderError(root, error); });
  }

  function renderAll() {
    if (!currentState) return;
    mounts = mounts.filter(function (mountPoint) { return document.documentElement.contains(mountPoint.root); });
    mounts.forEach(function (mountPoint) {
      if (mountPoint.mode === 'compact') renderCompact(mountPoint.root, currentState);
      else renderFull(mountPoint.root, currentState);
    });
  }

  function announce(message) {
    var live = document.getElementById('bioquimicaGroupsLiveRegion');
    if (!live) {
      live = el('div', 'bq-visually-hidden');
      live.id = 'bioquimicaGroupsLiveRegion';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    live.textContent = '';
    window.setTimeout(function () { live.textContent = message; }, 20);
  }

  function createTaskCard() {
    var card = el('details', 'live-task live-task-details bq-task-card');
    card.id = TASK_ID;
    card.dataset.bioquimicaGroupsTask = 'true';

    var summary = el('summary', 'live-task-summary');
    var copy = el('div', 'live-task-summary-copy');
    append(
      copy,
      el('span', 'live-task-meta', 'Bioquímica II · 02/09/2026 · CONFIRMADA'),
      el('strong', '', 'Prova prática: trabalhos assinados e grupos')
    );
    var action = el('b', 'live-task-action', 'Abrir');
    action.dataset.bqTaskToggleLabel = 'true';
    append(summary, copy, action);
    card.appendChild(summary);

    var body = el('div', 'live-task-body bq-task-body');
    body.appendChild(el('p', 'live-task-intro', 'Confira as consignas da professora, procure seu nome e entre no Grupo 10 somente se você ainda estiver sem grupo.'));
    var host = el('div', 'bq-task-app');
    host.dataset.bioquimicaGroupsApp = 'compact';
    body.appendChild(host);
    card.appendChild(body);

    card.addEventListener('toggle', function () {
      action.textContent = card.open ? 'Fechar' : 'Abrir';
      if (card.open && currentState) renderAll();
    });
    return card;
  }

  function createTurmaTaskCard() {
    var card = el('details', 'task-card bq-turma-task-card');
    card.id = TASK_ID;
    card.dataset.bioquimicaGroupsTask = 'true';

    var summary = el('summary');
    var copy = el('div');
    append(
      copy,
      el('span', 'task-meta', 'Bioquímica II · 02/09/2026 · CONFIRMADA'),
      el('strong', '', 'Prova prática: trabalhos assinados e grupos')
    );
    var action = el('b', '', 'Abrir');
    append(summary, copy, action);
    card.appendChild(summary);

    var body = el('div', 'task-body bq-task-body');
    body.appendChild(el('p', '', 'Confira as consignas da professora, procure seu nome e entre no Grupo 10 somente se você ainda estiver sem grupo.'));
    var facts = el('div', 'task-facts');
    append(facts, el('span', '', 'Prova: 02/09/2026'), el('span', '', 'Máximo: 10 integrantes'), el('span', '', 'Presença obrigatória'));
    body.appendChild(facts);
    var host = el('div', 'bq-task-app');
    host.dataset.bioquimicaGroupsApp = 'compact';
    body.appendChild(host);
    card.appendChild(body);

    card.addEventListener('toggle', function () {
      action.textContent = card.open ? 'Cerrar' : 'Abrir';
      if (card.open && currentState) renderAll();
    });
    return card;
  }

  function createTurmaHomeCard() {
    var card = el('details', 'task-card bq-turma-home-task-card');
    card.dataset.bioquimicaGroupsHomeTask = 'true';
    var summary = el('summary');
    var copy = el('div');
    append(copy, el('span', 'task-meta', 'Bioquímica II · 02/09/2026'), el('strong', '', 'Prova prática e organização dos grupos'));
    var action = el('b', '', 'Abrir');
    append(summary, copy, action);
    card.appendChild(summary);
    var body = el('div', 'task-body');
    body.appendChild(el('p', '', 'Leve todos os trabalhos assinados, confirme seu grupo e verifique se seu nome já aparece na lista.'));
    var facts = el('div', 'task-facts');
    append(facts, el('span', '', 'Caso clínico: 1 ponto'), el('span', '', 'Presença obrigatória'));
    body.appendChild(facts);
    var actions = el('div', 'bq-turma-home-actions');
    var tasks = el('button', 'bq-primary-button', 'Abrir em Tarefas');
    tasks.type = 'button';
    tasks.addEventListener('click', openTurmaTask);
    var full = el('a', 'bq-secondary-button', 'Ver lista completa');
    full.href = FULL_PAGE;
    append(actions, tasks, full);
    body.appendChild(actions);
    card.appendChild(body);
    card.addEventListener('toggle', function () { action.textContent = card.open ? 'Cerrar' : 'Abrir'; });
    return card;
  }

  function openTurmaTask() {
    var navigation = document.querySelector('[data-nav-view="tareas"]') || document.querySelector('[data-open-view="tareas"]');
    if (navigation) navigation.click();
    else location.hash = 'tareas';
    window.setTimeout(function () {
      ensureTurmaTask();
      var card = document.getElementById(TASK_ID);
      if (!card) return;
      card.open = true;
      var label = card.querySelector('summary > b');
      if (label) label.textContent = 'Cerrar';
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var summary = card.querySelector('summary');
      if (summary) summary.focus({ preventScroll: true });
    }, 100);
  }

  function ensureTurmaTask() {
    var taskList = document.getElementById('taskList');
    if (!taskList) return;
    var taskCard = document.getElementById(TASK_ID);
    if (!taskCard || taskCard.parentElement !== taskList) {
      taskCard = createTurmaTaskCard();
      taskList.prepend(taskCard);
      var emptyTask = taskList.querySelector('.empty-card');
      if (emptyTask) emptyTask.remove();
      mount(taskCard.querySelector('[data-bioquimica-groups-app]'), 'compact');
    }

    var home = document.getElementById('homeTasks');
    if (home && !home.querySelector('[data-bioquimica-groups-home-task]')) {
      home.prepend(createTurmaHomeCard());
      var emptyHome = home.querySelector('.empty-card');
      if (emptyHome) emptyHome.remove();
    }
  }

  function scheduleEnsureTurmaTask() {
    window.clearTimeout(reinjectTimer);
    reinjectTimer = window.setTimeout(ensureTurmaTask, 35);
  }

  function updateTaskCount(host) {
    var count = document.getElementById('homeHomeworkCount');
    if (!count || !host) return;
    var total = host.querySelectorAll('details.live-task-details').length;
    var portuguese = /^pt(?:-|$)/i.test(document.documentElement.lang || '');
    if (total) count.textContent = total + ' ' + (portuguese ? (total === 1 ? 'tarefa ativa' : 'tarefas ativas') : (total === 1 ? 'tarea activa' : 'tareas activas'));
  }

  function addScheduleBadges() {
    document.querySelectorAll('.schedule-slot[data-subject="biochemistry"]').forEach(function (slot) {
      if (slot.querySelector('[data-bq-groups-schedule]')) return;
      var badge = el('a', 'schedule-task-badge', 'Grupos');
      badge.href = '#' + TASK_ID;
      badge.dataset.bqGroupsSchedule = 'true';
      slot.appendChild(badge);
    });
  }

  function revealTaskFromHash() {
    if (decodeURIComponent(location.hash.slice(1)) !== TASK_ID) return;
    var card = document.getElementById(TASK_ID);
    if (!card) return;
    card.open = true;
    var pendingLink = document.querySelector('[data-view-link="pendientes"]');
    if (pendingLink && document.getElementById('pendientes') && document.getElementById('pendientes').hidden) pendingLink.click();
    window.setTimeout(function () { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }

  function ensureClassTask() {
    if (!document.getElementById('pendientes')) return;
    var host = document.getElementById('classHubLiveTasks');
    if (!host) {
      window.clearTimeout(reinjectTimer);
      reinjectTimer = window.setTimeout(ensureClassTask, 120);
      return;
    }
    var card = document.getElementById(TASK_ID);
    if (!card || card.parentElement !== host) {
      card = createTaskCard();
      host.prepend(card);
      var empty = host.querySelector('.notice-empty');
      if (empty) empty.remove();
      mount(card.querySelector('[data-bioquimica-groups-app]'), 'compact');
    }
    addScheduleBadges();
    updateTaskCount(host);
    revealTaskFromHash();
  }

  function scheduleEnsureClassTask() {
    window.clearTimeout(reinjectTimer);
    reinjectTimer = window.setTimeout(ensureClassTask, 30);
  }

  function boot() {
    document.querySelectorAll('[data-bioquimica-groups-app]').forEach(function (root) {
      mount(root, root.dataset.bioquimicaGroupsApp || 'full');
    });
    if (document.getElementById('pendientes')) {
      document.addEventListener('mednykuto:class-public-data', scheduleEnsureClassTask);
      window.addEventListener('hashchange', revealTaskFromHash);
      var pending = document.getElementById('pendientes');
      if (window.MutationObserver && pending) {
        var legacyObserver = new MutationObserver(function () {
          if (!document.getElementById(TASK_ID)) scheduleEnsureClassTask();
        });
        legacyObserver.observe(pending, { childList: true, subtree: true });
      }
      scheduleEnsureClassTask();
    }
    if (document.getElementById('taskList')) {
      var taskList = document.getElementById('taskList');
      var homeTasks = document.getElementById('homeTasks');
      if (window.MutationObserver) {
        var turmaObserver = new MutationObserver(function () {
          if (!document.getElementById(TASK_ID) || (homeTasks && !homeTasks.querySelector('[data-bioquimica-groups-home-task]'))) scheduleEnsureTurmaTask();
        });
        turmaObserver.observe(taskList, { childList: true });
        if (homeTasks) turmaObserver.observe(homeTasks, { childList: true });
      }
      scheduleEnsureTurmaTask();
    }
  }

  window.MedNykutoBioquimicaGroups = {
    refresh: function () { return requestState(true); },
    open: function () { location.href = FULL_PAGE; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
