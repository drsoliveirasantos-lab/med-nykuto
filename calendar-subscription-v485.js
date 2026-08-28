(function(){
  'use strict';

  var API_PATH = '/api/class-calendar.ics?class=';
  var configuredButtons = new WeakSet();
  var bioquimicaLoaderStarted = false;

  function validSlug(value){
    var slug = String(value || '').trim().toLowerCase();
    return /^[a-z0-9][a-z0-9-]{0,30}$/.test(slug) ? slug : 's4-e';
  }

  function slugFromLocation(){
    var path = location.pathname.match(/^\/turma\/([a-z0-9-]+)\/?$/i);
    var query = new URLSearchParams(location.search).get('class');
    return validSlug((path && path[1]) || query || document.documentElement.dataset.classSlug || 's4-e');
  }

  function httpsUrl(slug){
    var url = new URL(API_PATH + encodeURIComponent(validSlug(slug)), location.href);
    url.protocol = 'https:';
    return url;
  }

  function subscriptionUrl(slug){
    var url = httpsUrl(slug);
    return 'webcal://' + url.host + url.pathname + url.search;
  }

  function legacyCopy(value){
    return new Promise(function(resolve, reject){
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      field.style.pointerEvents = 'none';
      document.body.appendChild(field);
      field.select();
      field.setSelectionRange(0, value.length);
      try {
        if (!document.execCommand('copy')) throw new Error('copy_failed');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        field.remove();
      }
    });
  }

  function copy(value){
    return Promise.resolve().then(function(){
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard_unavailable');
      return navigator.clipboard.writeText(value);
    }).catch(function(){ return legacyCopy(value); });
  }

  function messages(){
    var portuguese = /^pt\b/i.test(document.documentElement.lang || '') || (document.getElementById('classLanguageSelect') && document.getElementById('classLanguageSelect').value === 'br');
    return portuguese ? {
      copying:'Copiando o link seguro…',
      copied:'Link HTTPS copiado. Adicione-o como calendário por URL.',
      failed:'Não foi possível copiar. Pressione e segure “Adicionar ao meu calendário” para copiar o link.'
    } : {
      copying:'Copiando el enlace seguro…',
      copied:'Enlace HTTPS copiado. Añádelo como calendario por URL.',
      failed:'No se pudo copiar. Mantén pulsado “Añadir a mi calendario” para copiar el enlace.'
    };
  }

  function configure(options){
    var link = document.getElementById(options.linkId);
    var button = document.getElementById(options.copyId);
    var status = document.getElementById(options.statusId);
    if (!link || !button || !status) return false;
    var slug = validSlug(options.slug || slugFromLocation());
    var secure = httpsUrl(slug);
    link.href = subscriptionUrl(slug);
    link.dataset.httpsUrl = secure.href;
    if (!configuredButtons.has(button)) {
      button.addEventListener('click', function(){
        var copyText = messages();
        button.disabled = true;
        status.textContent = copyText.copying;
        copy(httpsUrl(validSlug(button.dataset.classSlug || slug)).href).then(function(){
          status.textContent = copyText.copied;
        }).catch(function(){
          status.textContent = copyText.failed;
        }).finally(function(){ button.disabled = false; });
      });
      configuredButtons.add(button);
    }
    button.dataset.classSlug = slug;
    return true;
  }

  function loadBioquimicaGroups(){
    if (bioquimicaLoaderStarted || slugFromLocation() !== 's4-e') return;
    var legacySurface = document.getElementById('pendientes');
    var canonicalSurface = document.getElementById('taskList');
    if (!legacySurface && !canonicalSurface) return;
    bioquimicaLoaderStarted = true;

    if (!document.querySelector('[data-bioquimica-groups-style]')) {
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = '/bioquimica-groups-v499.css?v=499';
      style.dataset.bioquimicaGroupsStyle = 'true';
      document.head.appendChild(style);
    }

    if (!window.MedNykutoBioquimicaGroups && !document.querySelector('[data-bioquimica-groups-script]')) {
      var script = document.createElement('script');
      script.src = '/bioquimica-groups-v499.js?v=499';
      script.async = true;
      script.dataset.bioquimicaGroupsScript = 'true';
      document.head.appendChild(script);
    }
  }

  function configurePage(){
    configure({ linkId:'classCalendarSubscribeLink', copyId:'classCalendarCopyLink', statusId:'classCalendarSubscriptionStatus', slug:'s4-e' });
    configure({ linkId:'calendarSubscribeLink', copyId:'calendarCopyLink', statusId:'calendarSubscriptionStatus', slug:slugFromLocation() });
    loadBioquimicaGroups();
  }

  window.MedNykutoCalendar = { configure:configure, httpsUrl:httpsUrl, subscriptionUrl:subscriptionUrl };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', configurePage, { once:true });
  else configurePage();
})();
