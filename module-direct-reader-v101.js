/* v106 — Module page direct reader: stable reading without click refresh, expanded abbreviation popovers. */
(function(){
  'use strict';

  if(!document.body || document.body.dataset.page !== 'module') return;

  window.__MED_NYKUTO_MODULE_DIRECT_READER__ = 'v106-no-reader-click-refresh-expanded-abbreviations';

  const ABBR = {
    TFG:'Tasa de filtración glomerular',
    RFG:'Ritmo de filtración glomerular',
    FG:'Filtración glomerular',
    ATP:'Adenosina trifosfato',
    ADP:'Adenosina difosfato',
    AMP:'Adenosina monofosfato',
    ADN:'Ácido desoxirribonucleico',
    ARN:'Ácido ribonucleico',
    ECG:'Electrocardiograma',
    EKG:'Electrocardiograma',
    PA:'Presión arterial',
    TA:'Tensión arterial',
    FC:'Frecuencia cardíaca',
    FR:'Frecuencia respiratoria',
    LCR:'Líquido cefalorraquídeo',
    SNC:'Sistema nervioso central',
    SNP:'Sistema nervioso periférico',
    SNA:'Sistema nervioso autónomo',
    LDL:'Lipoproteína de baja densidad',
    HDL:'Lipoproteína de alta densidad',
    VLDL:'Lipoproteína de muy baja densidad',
    TG:'Triglicéridos',
    Hb:'Hemoglobina',
    Hto:'Hematocrito',
    VCM:'Volumen corpuscular medio',
    HCM:'Hemoglobina corpuscular media',
    CHCM:'Concentración de hemoglobina corpuscular media',
    NaCl:'Cloruro de sodio',
    Na:'Sodio',
    K:'Potasio',
    Cl:'Cloro',
    Ca:'Calcio',
    Mg:'Magnesio',
    P:'Fósforo',
    Pi:'Fosfato inorgánico',
    HCO3:'Bicarbonato',
    CO2:'Dióxido de carbono',
    O2:'Oxígeno',
    PO4:'Fosfato',
    HPO4:'Hidrogenofosfato',
    H2PO4:'Dihidrogenofosfato',
    pH:'Potencial de hidrógeno',
    SRAA:'Sistema renina-angiotensina-aldosterona',
    ADH:'Hormona antidiurética',
    PTH:'Parathormona',
    TSH:'Hormona estimulante de la tiroides',
    T3:'Triyodotironina',
    T4:'Tiroxina',
    TRH:'Hormona liberadora de tirotropina',
    ACTH:'Hormona adrenocorticotropa',
    CRH:'Hormona liberadora de corticotropina',
    FSH:'Hormona foliculoestimulante',
    LH:'Hormona luteinizante',
    GnRH:'Hormona liberadora de gonadotropinas',
    GH:'Hormona del crecimiento',
    IGF1:'Factor de crecimiento similar a la insulina tipo 1',
    EPO:'Eritropoyetina',
    ANP:'Péptido natriurético auricular',
    BNP:'Péptido natriurético cerebral',
    HTA:'Hipertensión arterial',
    DM:'Diabetes mellitus',
    DM2:'Diabetes mellitus tipo 2',
    IMC:'Índice de masa corporal',
    IRA:'Insuficiencia renal aguda',
    IRC:'Insuficiencia renal crónica',
    ERC:'Enfermedad renal crónica',
    ITU:'Infección del tracto urinario',
    IVU:'Infección de vías urinarias',
    AINE:'Antiinflamatorio no esteroideo',
    IECA:'Inhibidor de la enzima convertidora de angiotensina',
    ARAII:'Antagonista del receptor de angiotensina II',
    'ARA-II':'Antagonista del receptor de angiotensina II',
    EPOC:'Enfermedad pulmonar obstructiva crónica',
    VEF1:'Volumen espiratorio forzado en el primer segundo',
    CVF:'Capacidad vital forzada',
    SatO2:'Saturación de oxígeno',
    SpO2:'Saturación periférica de oxígeno',
    PaO2:'Presión arterial de oxígeno',
    PaCO2:'Presión arterial de dióxido de carbono'
  };
  const ABBR_RE = /\b(NaCl|H2PO4|PaCO2|PaO2|SatO2|SpO2|ARA-II|ARAII|HCO3|HPO4|PO4|SRAA|ADH|PTH|TFG|RFG|ATP|ADP|AMP|ADN|ARN|ECG|EKG|PA|TA|FC|FR|LCR|SNC|SNP|SNA|LDL|HDL|VLDL|TG|Hb|Hto|VCM|HCM|CHCM|Na|K|Cl|Ca|Mg|P|Pi|CO2|O2|pH|TSH|T3|T4|TRH|ACTH|CRH|FSH|LH|GnRH|GH|IGF1|EPO|ANP|BNP|HTA|DM2|DM|IMC|IRA|IRC|ERC|ITU|IVU|AINE|IECA|EPOC|VEF1|CVF|FG)\b/g;

  function markUserReading(){
    window.__MED_NYKUTO_MODULE_DIRECT_USER_READING__ = true;
    window.__MED_NYKUTO_MODULE_DIRECT_SCROLLED__ = true;
  }

  function injectStyle(){
    if(document.getElementById('moduleDirectReaderV101Style')) return;
    const style = document.createElement('style');
    style.id = 'moduleDirectReaderV101Style';
    style.textContent = `
      body[data-page="module"].module-direct-ready main{padding-top:0!important}
      body[data-page="module"].module-direct-ready .reader-shell{max-width:980px!important;margin:0 auto!important;padding:8px 10px 40px!important;display:block!important}
      body[data-page="module"].module-direct-ready .toc-panel,
      body[data-page="module"].module-direct-ready .mobile-toc,
      body[data-page="module"].module-direct-ready .module-nav,
      body[data-page="module"].module-direct-ready .module-direct-hidden-nav,
      body[data-page="module"].module-direct-ready .module-direct-mode-tabs{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;min-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;pointer-events:none!important}
      body[data-page="module"].module-direct-ready .reader-card > :not(.reader-head):not(#moduleContent){display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;min-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;pointer-events:none!important}
      body[data-page="module"].module-direct-ready .reader-card{border-radius:22px!important;background:linear-gradient(180deg,rgba(10,19,35,.97),rgba(4,10,19,.99))!important;border:1px solid rgba(236,211,139,.14)!important;box-shadow:0 18px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.03)!important;overflow:hidden!important}
      body[data-page="module"].module-direct-ready .reader-head{display:grid!important;gap:6px!important;padding:11px 14px 10px!important;border-bottom:1px solid rgba(255,255,255,.065)!important;background:radial-gradient(circle at 12% 0%,rgba(236,211,139,.075),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.034),rgba(255,255,255,0))!important}
      body[data-page="module"].module-direct-ready .reader-head .eyebrow{margin:0!important;color:#d8bf79!important;font-size:.58rem!important;letter-spacing:.20em!important;line-height:1.1!important}
      body[data-page="module"].module-direct-ready .reader-head h1{font-size:clamp(1.08rem,4vw,1.52rem)!important;line-height:1.08!important;letter-spacing:-.04em!important;margin:0!important;max-width:880px!important}
      body[data-page="module"].module-direct-ready #moduleSummary{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions{display:flex!important;flex-wrap:nowrap!important;gap:6px!important;margin-top:1px!important;overflow-x:auto!important;padding:1px 0 2px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
      body[data-page="module"].module-direct-ready .reader-actions::-webkit-scrollbar{display:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn{width:auto!important;flex:0 0 auto!important;min-height:28px!important;padding:6px 9px!important;border-radius:999px!important;font-size:.67rem!important;line-height:1!important;white-space:nowrap!important;background:rgba(255,255,255,.043)!important;border-color:rgba(255,255,255,.10)!important;color:#e5ebf4!important;box-shadow:none!important}
      body[data-page="module"].module-direct-ready .reader-actions .btn.primary{background:rgba(236,211,139,.12)!important;border-color:rgba(236,211,139,.22)!important;color:#ead18b!important}
      body[data-page="module"].module-direct-ready .reader-content{display:block!important;visibility:visible!important;height:auto!important;max-height:none!important;opacity:1!important;padding:13px 14px 30px!important}
      body[data-page="module"].module-direct-ready .reader-content > :first-child{margin-top:0!important}
      body[data-page="module"].module-direct-ready .content h1{font-size:clamp(1.28rem,4.7vw,1.76rem)!important;margin:0 0 10px!important;line-height:1.1!important;letter-spacing:-.035em!important}
      body[data-page="module"].module-direct-ready .content h2{font-size:clamp(1.12rem,4.1vw,1.38rem)!important;margin:18px 0 8px!important;line-height:1.16!important;color:#f1d98f!important;border-bottom:1px solid rgba(236,211,139,.18)!important;padding-bottom:6px!important}
      body[data-page="module"].module-direct-ready .content h3{font-size:clamp(1rem,3.6vw,1.18rem)!important;margin:14px 0 6px!important;line-height:1.18!important;color:#d8efff!important}
      body[data-page="module"].module-direct-ready .content p{margin:8px 0!important;color:#dbe4ee!important;line-height:1.54!important;font-size:.98rem!important}
      body[data-page="module"].module-direct-ready .content ul,body[data-page="module"].module-direct-ready .content ol{margin:8px 0 12px 20px!important}
      body[data-page="module"].module-direct-ready .content li{margin:4px 0!important}
      body[data-page="module"].module-direct-ready .content blockquote{margin:12px 0!important;padding:12px 14px!important;border-radius:14px!important}
      body[data-page="module"].module-direct-ready .content table{margin:12px 0!important}
      body[data-page="module"] .mn-abbr{display:inline;border:0;background:rgba(236,211,139,.11);color:#ffe6a3;border-bottom:1px dotted rgba(255,230,163,.82);border-radius:5px;padding:0 .12em;font:inherit;font-weight:800;line-height:inherit;cursor:pointer;touch-action:manipulation}
      body[data-page="module"] .mn-abbr-popover{position:fixed;z-index:14000;max-width:min(300px,calc(100vw - 28px));padding:9px 11px;border-radius:13px;background:rgba(4,10,19,.98);border:1px solid rgba(236,211,139,.34);box-shadow:0 16px 45px rgba(0,0,0,.46);color:#f8fafc;font-size:.86rem;line-height:1.35;pointer-events:none}
      body[data-page="module"] .mn-abbr-popover strong{color:#ffe6a3;margin-right:5px}
      @media(max-width:760px){
        body[data-page="module"].module-direct-ready .reader-shell{padding:6px 8px 30px!important}
        body[data-page="module"].module-direct-ready .reader-card{border-radius:19px!important}
        body[data-page="module"].module-direct-ready .reader-head{padding:9px 11px 9px!important;gap:5px!important}
        body[data-page="module"].module-direct-ready .reader-head h1{font-size:1.04rem!important;line-height:1.08!important}
        body[data-page="module"].module-direct-ready .reader-head .eyebrow{font-size:.52rem!important;letter-spacing:.16em!important}
        body[data-page="module"].module-direct-ready .reader-actions .btn{min-height:27px!important;padding:6px 8px!important;font-size:.64rem!important}
        body[data-page="module"].module-direct-ready .reader-content{padding:11px 11px 24px!important}
        body[data-page="module"].module-direct-ready .content h1{font-size:1.18rem!important;margin-bottom:9px!important}
        body[data-page="module"].module-direct-ready .content h2{font-size:1.06rem!important;margin-top:16px!important}
        body[data-page="module"].module-direct-ready .content h3{font-size:.98rem!important;margin-top:13px!important}
        body[data-page="module"].module-direct-ready .content p{font-size:.96rem!important;line-height:1.5!important}
      }
    `;
    document.head.appendChild(style);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function hideStackedNavigationBlocks(){
    const card = document.querySelector('.reader-card');
    if(card){
      Array.from(card.children).forEach(child => {
        if(child.classList.contains('reader-head')) return;
        if(child.id === 'moduleContent') return;
        child.classList.add('module-direct-hidden-nav');
      });
    }

    Array.from(document.querySelectorAll('main div, main nav, main section, main aside, .module-nav, .mobile-toc')).forEach(el => {
      if(el.id === 'moduleContent') return;
      if(el.classList.contains('reader-head') || el.classList.contains('reader-card') || el.classList.contains('reader-shell')) return;
      if(el.closest && el.closest('#moduleContent')) return;
      const txt = textOf(el);
      const buttons = el.querySelectorAll('a,button').length;
      const isModeTabs = /Curso completo|Ficha rápida|Ultra-rápida|Fiche rapide|Ultra-rapide|QCM du module|QCM del módulo|QCM de este/i.test(txt) && buttons >= 2;
      const isCourseNav = /Navigation du cours|Navegación del curso|Índice|Introducción|Changer de module|Cambiar módulo|Mód\.?\s*\d|←\s*Volver/i.test(txt) && buttons >= 1;
      if(isModeTabs || isCourseNav){
        el.classList.add('module-direct-hidden-nav');
      }
    });
  }

  function markReady(){
    document.body.classList.add('module-direct-ready');
    hideStackedNavigationBlocks();
  }

  function contentReady(){
    const content = document.getElementById('moduleContent');
    return !!(content && content.textContent && content.textContent.trim().length > 80);
  }

  function applyAbbreviations(){
    const content = document.getElementById('moduleContent');
    if(!contentReady() || !content || content.dataset.mnAbbrApplied === '1') return;
    content.dataset.mnAbbrApplied = '1';
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        const p = node.parentElement;
        if(!p || /SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|CODE|PRE|BUTTON|A/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        if(p.closest && p.closest('.mn-abbr,.reader-head,.reader-actions,.toc-panel,.mobile-toc')) return NodeFilter.FILTER_REJECT;
        ABBR_RE.lastIndex = 0;
        return ABBR_RE.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue || '';
      ABBR_RE.lastIndex = 0;
      let last = 0, match, frag = document.createDocumentFragment();
      while((match = ABBR_RE.exec(text))){
        const term = match[1];
        if(match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        const ab = document.createElement('span');
        ab.className = 'mn-abbr';
        ab.setAttribute('role','button');
        ab.setAttribute('tabindex','0');
        ab.dataset.term = term;
        ab.dataset.full = ABBR[term];
        ab.textContent = term;
        frag.appendChild(ab);
        last = match.index + term.length;
      }
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      if(node.parentNode) node.parentNode.replaceChild(frag, node);
    });
  }

  function hidePopover(){
    const old = document.querySelector('.mn-abbr-popover');
    if(old) old.remove();
  }

  function showPopover(target){
    hidePopover();
    const pop = document.createElement('div');
    pop.className = 'mn-abbr-popover';
    pop.innerHTML = '<strong>' + target.dataset.term + '</strong>' + target.dataset.full;
    document.body.appendChild(pop);
    const r = target.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const left = Math.max(14, Math.min(window.innerWidth - pr.width - 14, r.left + r.width / 2 - pr.width / 2));
    let top = r.top - pr.height - 8;
    if(top < 12) top = r.bottom + 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    clearTimeout(window.__mnAbbrPopoverTimer);
    window.__mnAbbrPopoverTimer = setTimeout(hidePopover, 2600);
  }

  function bindAbbreviationEvents(){
    if(document.body.dataset.mnAbbrBound === '1') return;
    document.body.dataset.mnAbbrBound = '1';
    document.addEventListener('click', function(e){
      const ab = e.target && e.target.closest && e.target.closest('.mn-abbr');
      if(ab){
        e.preventDefault();
        e.stopPropagation();
        markUserReading();
        showPopover(ab);
      }
    }, true);
    document.addEventListener('keydown', function(e){
      const ab = e.target && e.target.closest && e.target.closest('.mn-abbr');
      if(ab && (e.key === 'Enter' || e.key === ' ')){
        e.preventDefault();
        markUserReading();
        showPopover(ab);
      }
    }, true);
    window.addEventListener('scroll', hidePopover, {passive:true});
  }

  function run(){
    markReady();
    applyAbbreviations();
    bindAbbreviationEvents();
    window.setTimeout(markReady, 60);
    window.setTimeout(markReady, 180);
    window.setTimeout(markReady, 420);
    window.setTimeout(applyAbbreviations, 80);
    window.setTimeout(applyAbbreviations, 260);
  }

  document.addEventListener('touchstart', markUserReading, {capture:true, passive:true});
  document.addEventListener('pointerdown', markUserReading, {capture:true, passive:true});
  window.addEventListener('scroll', function(){ if(window.scrollY > 32) markUserReading(); }, {passive:true});

  injectStyle();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
})();
