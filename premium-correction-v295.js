/* v295 — Premium QCM correction drawer */
(function(){
  'use strict';
  const BANK = () => window.MED_PRACTICE_BANK || {byCourse:{}};
  const $all = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = s => String(s||'').replace(/\b(CORRECTA|ELEGIDA|CORRECT|CHOSEN|ESCOLHIDA)\b/gi,'').replace(/\s+/g,' ').trim();
  const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const letter = i => String.fromCharCode(65 + Number(i||0));
  function itemById(id){
    for(const b of Object.values(BANK().byCourse||{})){
      for(const k of ['qcm','cases','vf']){
        const found=(b[k]||[]).find(x=>String(x.id)===String(id));
        if(found) return found;
      }
    }
    return null;
  }
  function oneSentence(s,max=240){
    s=clean(s); if(!s) return '';
    const parts=s.split(/(?<=[.!?])\s+/).filter(Boolean);
    s=parts.find(p=>p.length>35)||parts[0]||s;
    if(s.length>max) s=s.slice(0,max).replace(/\s+\S*$/,'')+'…';
    return s;
  }
  function indexedReason(item,idx){
    if(!item) return '';
    const src=item.whyWrong||item.distractorExplanations||item.porQueLasOtrasSonFalsas;
    if(Array.isArray(src)) return src[idx]||'';
    if(src && typeof src==='object') return src[letter(idx)]||src[String(idx)]||src[item.options&&item.options[idx]]||'';
    return '';
  }
  function heuristic(opt,topic,isCorrect){
    const low=norm(opt);
    if(isCorrect) return `Cette option garde le mécanisme central de « ${topic} » sans changer l’organe, le sens ou la conséquence.`;
    if(/siempre|nunca|jamas|solamente|unicamente|todo|total/.test(low)) return 'Mot absolu détecté : “siempre / nunca / solamente” rend souvent une option médicale fausse ou trop générale.';
    if(/no |sin |ausencia|no existe|sin funciones/.test(low)) return 'Négation excessive : l’option supprime un mécanisme ou une fonction qui existe réellement.';
    if(/alveol|pulmon|rinon|renal|glomerul|tubul|hepat|card/.test(low)) return 'Piège de localisation : l’organe ou la structure citée ne correspond pas au mécanisme demandé.';
    if(/inactiva|activa|aumenta|disminuye|estimula|inhibe|produce/.test(low)) return 'Piège de sens : le distracteur inverse ou déplace la relation cause → mécanisme → conséquence.';
    return 'Distracteur plausible : il utilise des mots du cours, mais ne respecte pas précisément le mécanisme demandé.';
  }
  function trap(opt,ok){
    const low=norm(opt);
    if(ok) return 'Reconnaissance correcte du mécanisme';
    if(/siempre|nunca|jamas|solamente|unicamente|todo|total/.test(low)) return 'Piège de mot absolu';
    if(/no |sin |ausencia|no existe|sin funciones/.test(low)) return 'Piège de négation';
    if(/alveol|pulmon|rinon|renal|glomerul|tubul|hepat|card/.test(low)) return 'Piège de localisation';
    if(/inactiva|activa|aumenta|disminuye|estimula|inhibe|produce/.test(low)) return 'Piège de mécanisme inversé';
    return 'Piège de distracteur plausible';
  }
  function injectStyle(){
    if(document.getElementById('premiumCorrectionStyle')) return;
    const st=document.createElement('style'); st.id='premiumCorrectionStyle';
    st.textContent=`
      body.qcm-page .answer-panel{display:none!important;visibility:hidden!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}
      .pc-card{margin:.85rem 0 .25rem;border:1px solid rgba(245,211,124,.32);border-radius:22px;background:linear-gradient(180deg,rgba(13,20,34,.96),rgba(6,10,20,.96));box-shadow:0 14px 34px rgba(0,0,0,.28);overflow:hidden;color:#f8fafc;}
      .pc-top{display:grid;gap:.55rem;padding:1rem;border-bottom:1px solid rgba(255,255,255,.08)}
      .pc-k{display:flex;justify-content:space-between;gap:.65rem;align-items:center;text-transform:uppercase;letter-spacing:.12em;font-size:.67rem;color:#f5d37c;font-weight:950}.pc-status{border-radius:999px;padding:.25rem .55rem;background:rgba(34,197,94,.14);color:#86efac;border:1px solid rgba(34,197,94,.28);white-space:nowrap}.pc-status.ko{background:rgba(248,113,113,.12);color:#fecaca;border-color:rgba(248,113,113,.34)}
      .pc-title{font-size:1rem;line-height:1.28;font-weight:950;margin:0}.pc-line{display:flex;gap:.45rem;color:rgba(226,232,240,.82);font-size:.86rem;line-height:1.32}.pc-line b{color:#ffe7a0;white-space:nowrap}
      .pc-more summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:.7rem;align-items:center;padding:.85rem 1rem;color:#ffe7a0;font-weight:950;background:rgba(245,211,124,.08)}.pc-more summary::-webkit-details-marker{display:none}.pc-more summary em{font-style:normal;color:rgba(226,232,240,.62);font-size:.75rem;font-weight:800}.pc-more summary:after{content:'▾'}.pc-more[open] summary:after{transform:rotate(180deg)}
      .pc-body{display:grid;gap:.7rem;padding:1rem}.pc-box{border:1px solid rgba(255,255,255,.10);border-radius:17px;background:rgba(255,255,255,.045);padding:.78rem .82rem}.pc-box strong{display:block;font-size:.84rem;margin-bottom:.3rem}.pc-box p{margin:0;color:rgba(226,232,240,.82);font-size:.86rem;line-height:1.45}
      .pc-options{display:grid;gap:.48rem}.pc-opt{display:grid;grid-template-columns:auto 1fr;gap:.55rem;border:1px solid rgba(255,255,255,.10);border-radius:15px;padding:.65rem;background:rgba(255,255,255,.035)}.pc-opt.ok{border-color:rgba(34,197,94,.38);background:rgba(34,197,94,.075)}.pc-opt.bad{border-color:rgba(248,113,113,.42);background:rgba(248,113,113,.075)}.pc-l{width:29px;height:29px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:rgba(245,211,124,.12);border:1px solid rgba(245,211,124,.26);color:#ffe7a0;font-weight:950}.pc-opt.ok .pc-l{background:rgba(34,197,94,.18);border-color:rgba(34,197,94,.34);color:#86efac}.pc-opt.bad .pc-l{background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.35);color:#fecaca}.pc-opt h4{margin:0 0 .2rem;font-size:.84rem;line-height:1.25}.pc-opt p{margin:0;color:rgba(226,232,240,.76);font-size:.79rem;line-height:1.38}
      .pc-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;padding:0 1rem 1rem}.pc-actions button,.pc-actions a{min-height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);color:#f8fafc;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:.76rem;padding:.45rem .55rem;text-align:center}.pc-actions .gold{border-color:rgba(245,211,124,.42);background:rgba(245,211,124,.12);color:#ffe7a0}.pc-feedback{display:none;padding:0 1rem 1rem;color:#86efac;font-size:.78rem;font-weight:800}.pc-feedback.on{display:block}
      @media(max-width:760px){.pc-card{border-radius:20px;margin:.72rem 0 .1rem}.pc-top{padding:.85rem}.pc-body{padding:.85rem;gap:.62rem}.pc-more summary{padding:.78rem .85rem}.pc-actions{grid-template-columns:1fr;padding:0 .85rem .85rem}}
    `;
    document.head.appendChild(st);
  }
  function ficha(d){return [`Question: ${d.q}`,`Réponse correcte: ${d.cl} — ${d.ct}`,`Ma réponse: ${d.yl} — ${d.yt}`,`Mécanisme: ${d.exp}`,`Piège: ${d.trap}`,`À retenir: ${d.mem}`].join('\n');}
  function render(){
    if(!document.body.classList.contains('qcm-page')) return; injectStyle();
    $all('.single-question-card').forEach(card=>{
      const opts=$all('.option',card), box=card.querySelector('.options'); if(!box) return;
      const answered=box.classList.contains('answered')||!!card.querySelector('.option.correct,.option.wrong,.option.chosen');
      const old=card.querySelector('.pc-card'); if(!answered){if(old) old.remove(); return;}
      const item=itemById(card.id), ci=item&&item.answerIndex!=null?Number(item.answerIndex):Math.max(0,opts.findIndex(o=>o.classList.contains('correct')));
      const wi=opts.findIndex(o=>o.classList.contains('wrong')||o.classList.contains('chosen'));
      const yi=wi>=0?wi:ci, ok=wi<0 && yi===ci;
      const dom=i=>clean((opts[i]?.querySelector('em')||opts[i]||{}).textContent||'');
      const texts=item&&item.options&&item.options.length?item.options.map(clean):opts.map((_,i)=>dom(i));
      const q=clean((card.querySelector('.question-prompt h3,.question-prompt')||{}).textContent||item?.question||'Question');
      const topic=clean(item?.heading||item?.moduleTitle||q)||'ce thème';
      const ct=texts[ci]||dom(ci), yt=texts[yi]||dom(yi), exp=oneSentence(item?.explanation||clean((card.querySelector('.answer-panel')||{}).textContent)||`La réponse correcte est ${letter(ci)} car elle respecte le mécanisme demandé.`,260);
      const cr=oneSentence(exp||heuristic(ct,topic,true),260), yr=ok?'Tu as identifié le bon mécanisme et évité les distracteurs.':oneSentence(indexedReason(item,yi)||heuristic(yt,topic,false),260);
      const tr=trap(yt,ok), mem=oneSentence(`${topic} → ${ct}. En examen, vérifie l’organe, le sens du mécanisme et les mots absolus.`,210);
      const rows=texts.map((t,i)=>{const good=i===ci,bad=i===yi&&!good,r=good?cr:oneSentence(indexedReason(item,i)||heuristic(t,topic,false),230);return `<div class="pc-opt ${good?'ok':''} ${bad?'bad':''}"><span class="pc-l">${letter(i)}</span><div><h4>${esc(good?'Correcta':(bad?'Elegida · falsa':'Falsa'))} — ${esc(t)}</h4><p>${esc(r)}</p></div></div>`}).join('');
      const href=item?.moduleId?`module.html?id=${encodeURIComponent(item.moduleId)}`:(card.querySelector('.module-actions.slim a[href^="module.html"]')?.href||'#');
      const d={q,cl:letter(ci),ct,yl:letter(yi),yt,exp,trap:tr,mem};
      const html=`<section class="pc-card"><div class="pc-top"><div class="pc-k"><span>Correction premium</span><span class="pc-status ${ok?'':'ko'}">${ok?'Correct':'À corriger'}</span></div><p class="pc-title">${ok?'Bonne réponse.':`Bonne réponse : ${letter(ci)}. Tu as choisi : ${letter(yi)}.`}</p><div class="pc-line"><b>✅ Correcte</b><span>${esc(letter(ci))} — ${esc(ct)}</span></div><div class="pc-line"><b>${ok?'🎯 Ton choix':'❌ Ton choix'}</b><span>${esc(letter(yi))} — ${esc(yt)}</span></div></div><details class="pc-more"><summary><span>Voir l’explication complète</span><em>mécanisme · piège · options</em></summary><div class="pc-body"><div class="pc-box"><strong>Pourquoi la bonne réponse est vraie</strong><p>${esc(cr)}</p></div><div class="pc-box"><strong>${ok?'Pourquoi c’était le bon raisonnement':'Pourquoi ta réponse est fausse'}</strong><p>${esc(yr)}</p></div><div class="pc-box"><strong>Type de piège</strong><p>${esc(tr)}. Compare définition, organe, sens du mécanisme et conséquence clinique.</p></div><div class="pc-box"><strong>À retenir pour l’examen</strong><p>${esc(mem)}</p></div><div class="pc-options">${rows}</div></div><div class="pc-actions"><button class="gold" type="button" data-pc="save">Ajouter aux erreurs</button><button type="button" data-pc="copy">Copier mini-fiche</button><a href="${esc(href)}">Revoir le cours</a></div><div class="pc-feedback">Action réalisée.</div></details></section>`;
      if(old) old.outerHTML=html; else (card.querySelector('.single-nav-actions')||card.querySelector('.module-actions.slim')||card).insertAdjacentHTML('beforebegin',html);
      const pc=card.querySelector('.pc-card'); if(pc&&pc.dataset.bound!=='1'){pc.dataset.bound='1'; pc.addEventListener('click',e=>{const b=e.target.closest('[data-pc]'); if(!b)return; const fb=pc.querySelector('.pc-feedback'); if(b.dataset.pc==='copy'){navigator.clipboard&&navigator.clipboard.writeText&&navigator.clipboard.writeText(ficha(d)).catch(()=>{}); if(fb){fb.textContent='Mini-fiche copiée.';fb.classList.add('on');setTimeout(()=>fb.classList.remove('on'),1700)}} if(b.dataset.pc==='save'){card.querySelector('.preanswer-tools [data-action="mark-review"]')?.click(); try{const k='med-premium-review-notes',a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({...d,id:card.id,savedAt:Date.now()});localStorage.setItem(k,JSON.stringify(a.slice(0,120)))}catch(_){} if(fb){fb.textContent='Ajouté à la révision locale.';fb.classList.add('on');setTimeout(()=>fb.classList.remove('on'),1700)}}});}
    });
  }
  function loop(){render(); if(!document.body.dataset.pcObs&&window.MutationObserver){document.body.dataset.pcObs='1'; new MutationObserver(()=>{clearTimeout(window.__pcTimer);window.__pcTimer=setTimeout(render,80)}).observe(document.querySelector('#practiceList')||document.body,{childList:true,subtree:true,attributes:true,characterData:true});}}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>[0,200,800,1600].forEach(t=>setTimeout(loop,t))); else [0,200,800,1600].forEach(t=>setTimeout(loop,t));
})();
