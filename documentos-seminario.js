(function(){
  'use strict';

  var validDocuments = ['instructivo','modelo-portada'];

  function activeDocument(){
    var value = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : 'instructivo';
    return validDocuments.indexOf(value) === -1 ? 'instructivo' : value;
  }

  function renderDocument(){
    var current = activeDocument();
    document.querySelectorAll('[data-document-panel]').forEach(function(panel){
      panel.hidden = panel.dataset.documentPanel !== current;
    });
    document.querySelectorAll('[data-document-tab]').forEach(function(tab){
      if(tab.dataset.documentTab === current) tab.setAttribute('aria-current','page');
      else tab.removeAttribute('aria-current');
    });
    document.title = (current === 'modelo-portada' ? 'Ejemplo de la primera página' : 'Instrucciones') + ' | Med Nykuto';
    window.scrollTo(0,0);
  }

  document.addEventListener('DOMContentLoaded',renderDocument);
  window.addEventListener('hashchange',renderDocument);
})();
