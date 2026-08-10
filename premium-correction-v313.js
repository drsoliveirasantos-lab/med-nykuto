/* v315 — Localized, authoritative correction for Verdadero/Falso.
   Event-driven only: no infinite repaint loop and no observer. */
(function(){
  'use strict';

  window.__MED_NYKUTO_PREMIUM_PRACTICE_CORRECTION__ = 'v315-localized-single-vf-correction';

  function bank(){ return window.MED_PRACTICE_BANK || {byCourse:{}}; }
  function all(selector, root){ return Array.from((root || document).querySelectorAll(selector)); }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(character){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }
  function clean(value){ return String(value || '').replace(/\s+/g, ' ').trim(); }
  function letter(index){ return String.fromCharCode(65 + Number(index || 0)); }
  function targetPage(){ return document.body && document.body.classList.contains('vrai-faux-page'); }

  function language(){
    var active = document.querySelector('.brand-lang button.active, .lang-switch button.active, .lang-btn.active, button[data-lang].active');
    var raw = String((active && (active.getAttribute('data-lang') || active.textContent)) || document.documentElement.lang || 'es').toLowerCase();
    if(raw.indexOf('fr') >= 0) return 'fr';
    if(raw.indexOf('br') >= 0 || raw.indexOf('pt') >= 0) return 'br';
    return 'es';
  }

  function labels(){
    var dictionaries = {
      es:{
        title:'Corrección', correctStatus:'Correcta', wrongStatus:'A corregir', correctAnswer:'Correcta', yourAnswer:'Tu respuesta',
        full:'Ver explicación completa', reasoning:'Razonamiento esperado', exam:'Para el examen',
        correctOption:'Correcta', chosenWrong:'Elegida · falsa', wrongOption:'Falsa',
        correctFallback:'La opción conserva el mecanismo esperado.', wrongFallback:'La opción no respeta exactamente el mecanismo esperado.',
        explanationFallback:'La corrección se basa en el mecanismo esperado del módulo.',
        trap:'Verifica siempre definición, órgano, sentido del mecanismo y consecuencia. Las palabras absolutas suelen ser una trampa.'
      },
      fr:{
        title:'Correction', correctStatus:'Correct', wrongStatus:'À corriger', correctAnswer:'Correcte', yourAnswer:'Ta réponse',
        full:'Voir l’explication complète', reasoning:'Raisonnement attendu', exam:'Pour l’examen',
        correctOption:'Correcte', chosenWrong:'Choisie · fausse', wrongOption:'Fausse',
        correctFallback:'L’option respecte le mécanisme attendu.', wrongFallback:'L’option ne respecte pas exactement le mécanisme attendu.',
        explanationFallback:'La correction repose sur le mécanisme attendu dans le module.',
        trap:'Vérifie toujours la définition, l’organe, le sens du mécanisme et la conséquence. Les formulations absolues sont souvent des pièges.'
      },
      br:{
        title:'Correção', correctStatus:'Correta', wrongStatus:'A corrigir', correctAnswer:'Correta', yourAnswer:'Sua resposta',
        full:'Ver explicação completa', reasoning:'Raciocínio esperado', exam:'Para a prova',
        correctOption:'Correta', chosenWrong:'Escolhida · falsa', wrongOption:'Falsa',
        correctFallback:'A opção preserva o mecanismo esperado.', wrongFallback:'A opção não respeita exatamente o mecanismo esperado.',
        explanationFallback:'A correção se baseia no mecanismo esperado do módulo.',
        trap:'Verifique sempre a definição, o órgão, o sentido do mecanismo e a consequência. Palavras absolutas costumam ser armadilhas.'
      }
    };
    return dictionaries[language()] || dictionaries.es;
  }

  function itemById(id){
    var groups = Object.values(bank().byCourse || {});
    for(var groupIndex=0; groupIndex<groups.length; groupIndex+=1){
      var group = groups[groupIndex] || {};
      for(var typeIndex=0; typeIndex<3; typeIndex+=1){
        var type = ['cases','vf','qcm'][typeIndex];
        var found = (group[type] || []).find(function(item){ return String(item.id) === String(id); });
        if(found) return found;
      }
    }
    return null;
  }

  function sentence(value, max){
    var output = clean(value);
    if(!output) return '';
    if(output.length > (max || 250)) output = output.slice(0, max || 250).replace(/\s+\S*$/, '') + '…';
    return output;
  }

  function inject(){
    if(document.getElementById('premiumPracticeCorrectionStyle')) return;
    var style = document.createElement('style');
    style.id = 'premiumPracticeCorrectionStyle';
    style.textContent = [
      '.vrai-faux-page .answer-panel{display:none!important}',
      '.ppc-card{margin:.72rem 0 .16rem;border:1px solid rgba(245,211,124,.32);border-radius:20px;background:linear-gradient(180deg,rgba(13,20,34,.96),rgba(6,10,20,.96));box-shadow:0 14px 34px rgba(0,0,0,.26);overflow:hidden;color:#f8fafc}',
      '.ppc-top{padding:.86rem;border-bottom:1px solid rgba(255,255,255,.08);display:grid;gap:.46rem}',
      '.ppc-k{display:flex;justify-content:space-between;gap:.55rem;text-transform:uppercase;letter-spacing:.12em;font-size:.64rem;color:#f5d37c;font-weight:950}',
      '.ppc-status{border-radius:999px;padding:.22rem .52rem;background:rgba(34,197,94,.14);color:#86efac;border:1px solid rgba(34,197,94,.28)}',
      '.ppc-status.ko{background:rgba(248,113,113,.12);color:#fecaca;border-color:rgba(248,113,113,.34)}',
      '.ppc-line{display:flex;gap:.45rem;font-size:.84rem;color:rgba(226,232,240,.84)}',
      '.ppc-line b{color:#ffe7a0;min-width:82px}',
      '.ppc-toggle{width:100%;border:0;border-top:1px solid rgba(255,255,255,.08);background:rgba(245,211,124,.08);color:#ffe7a0;text-align:left;padding:.72rem .86rem;font-weight:950;display:grid;grid-template-columns:1fr auto}',
      '.ppc-toggle:after{content:"▾"}.ppc-card.open .ppc-toggle:after{transform:rotate(180deg)}',
      '.ppc-panel[hidden]{display:none!important}',
      '.ppc-body{display:grid;gap:.62rem;padding:.86rem}',
      '.ppc-box{border:1px solid rgba(255,255,255,.10);border-radius:16px;background:rgba(255,255,255,.045);padding:.72rem}',
      '.ppc-box strong{display:block;margin-bottom:.28rem;font-size:.82rem}',
      '.ppc-box p{margin:0;font-size:.83rem;line-height:1.42;color:rgba(226,232,240,.82)}',
      '.ppc-options{display:grid;gap:.42rem}',
      '.ppc-opt{display:grid;grid-template-columns:auto 1fr;gap:.5rem;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:.58rem;background:rgba(255,255,255,.035)}',
      '.ppc-opt.ok{border-color:rgba(34,197,94,.38);background:rgba(34,197,94,.075)}',
      '.ppc-opt.bad{border-color:rgba(248,113,113,.42);background:rgba(248,113,113,.075)}',
      '.ppc-l{width:27px;height:27px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:rgba(245,211,124,.12);border:1px solid rgba(245,211,124,.26);color:#ffe7a0;font-weight:950}',
      '.ppc-opt h4{margin:0 0 .18rem;font-size:.8rem}.ppc-opt p{margin:0;color:rgba(226,232,240,.76);font-size:.76rem;line-height:1.36}',
      '@media(min-width:680px){.ppc-top,.ppc-body{padding:1rem}.ppc-toggle{padding:.82rem 1rem}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function reason(item, index, correct, copy){
    if(!item) return correct ? copy.correctFallback : copy.wrongFallback;
    var source = item.whyWrong || item.distractorExplanations;
    if(source && typeof source === 'object'){
      var direct = source[letter(index)] || source[String(index)] || '';
      if(direct) return direct;
    }
    return correct ? sentence(item.explanation || copy.correctFallback, 250) : copy.wrongFallback;
  }

  function render(){
    if(!targetPage()) return;
    inject();
    var copy = labels();
    all('.single-question-card').forEach(function(card){
      var options = all('.option', card);
      var box = card.querySelector('.options');
      if(!box) return;
      var answered = box.classList.contains('answered') || !!card.querySelector('.option.correct,.option.wrong,.option.chosen');
      var old = card.querySelector('.ppc-card');
      if(!answered){ if(old) old.remove(); return; }

      var item = itemById(card.id);
      var correctIndex = item && item.answerIndex != null ? Number(item.answerIndex) : Math.max(0, options.findIndex(function(option){ return option.classList.contains('correct'); }));
      var wrongIndex = options.findIndex(function(option){ return option.classList.contains('wrong') || option.classList.contains('chosen'); });
      var chosenIndex = wrongIndex >= 0 ? wrongIndex : correctIndex;
      var isCorrect = wrongIndex < 0 && chosenIndex === correctIndex;
      var texts = item && item.options ? item.options.map(clean) : options.map(function(option){ return clean(option.textContent); });
      var correctText = texts[correctIndex] || '';
      var chosenText = texts[chosenIndex] || '';
      var explanation = sentence(item && item.explanation || copy.explanationFallback, 280);
      var rows = texts.map(function(textValue, index){
        var good = index === correctIndex;
        var bad = index === chosenIndex && !good;
        var title = good ? copy.correctOption : (bad ? copy.chosenWrong : copy.wrongOption);
        return '<div class="ppc-opt ' + (good ? 'ok' : '') + ' ' + (bad ? 'bad' : '') + '"><span class="ppc-l">' + letter(index) + '</span><div><h4>' + esc(title) + ' — ' + esc(textValue) + '</h4><p>' + esc(sentence(reason(item, index, good, copy), 240)) + '</p></div></div>';
      }).join('');
      var wasOpen = old && old.classList.contains('open');
      var html = '<section class="ppc-card ' + (wasOpen ? 'open' : '') + '"><div class="ppc-top"><div class="ppc-k"><span>' + esc(copy.title) + '</span><span class="ppc-status ' + (isCorrect ? '' : 'ko') + '">' + esc(isCorrect ? copy.correctStatus : copy.wrongStatus) + '</span></div><div class="ppc-line"><b>' + esc(copy.correctAnswer) + '</b><span>' + letter(correctIndex) + ' — ' + esc(correctText) + '</span></div><div class="ppc-line"><b>' + esc(copy.yourAnswer) + '</b><span>' + letter(chosenIndex) + ' — ' + esc(chosenText) + '</span></div></div><button class="ppc-toggle" type="button">' + esc(copy.full) + '</button><div class="ppc-panel" ' + (wasOpen ? '' : 'hidden') + '><div class="ppc-body"><div class="ppc-box"><strong>' + esc(copy.reasoning) + '</strong><p>' + esc(explanation) + '</p></div><div class="ppc-box"><strong>' + esc(copy.exam) + '</strong><p>' + esc(copy.trap) + '</p></div><div class="ppc-options">' + rows + '</div></div></div></section>';
      if(old) old.outerHTML = html;
      else (card.querySelector('.single-nav-actions') || card).insertAdjacentHTML('beforebegin', html);
      var correction = card.querySelector('.ppc-card');
      if(correction && correction.dataset.bound !== '1'){
        correction.dataset.bound = '1';
        correction.addEventListener('click', function(event){
          var button = event.target.closest('.ppc-toggle');
          if(!button) return;
          event.preventDefault();
          var open = !correction.classList.contains('open');
          correction.classList.toggle('open', open);
          var panel = correction.querySelector('.ppc-panel');
          if(panel) panel.hidden = !open;
        });
      }
    });
  }

  function schedule(){
    if(!targetPage()) return;
    clearTimeout(window.__premiumCorrectionV315Timer);
    window.__premiumCorrectionV315Timer = setTimeout(render, 70);
  }
  function initial(){ render(); setTimeout(render, 120); }

  document.addEventListener('click', function(event){
    var target = event.target;
    if(target && target.closest && target.closest('.option,[data-action="next-question"],[data-action="previous-question"],[data-action="restart-session"],[data-action="start-next-batch"]')) schedule();
  }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initial);
  else initial();
  window.addEventListener('pageshow', initial);
})();
