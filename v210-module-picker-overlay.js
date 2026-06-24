/* v286 — Robust module picker overlay + Med Nykuto interface polish */
(function(){
  const DATA = window.MED_COURSES_DATA || {courses:[]};
  const courses = DATA.courses || [];
  const BRAND_NAME = "Med Nykuto";
  const CANONICAL_ORIGIN = "https://med.nykuto.com";

  const labels = {
    fr: {show:"Voir modules", close:"Fermer", title:"Choisir un module", empty:"Modules bientôt disponibles"},
    es: {show:"Ver módulos", close:"Cerrar", title:"Elegir un módulo", empty:"Módulos disponibles pronto"},
    br: {show:"Ver módulos", close:"Fechar", title:"Escolher um módulo", empty:"Módulos em breve"}
  };

  const uiText = {
    fr: {
      menuOpen:"Ouvrir le menu", menuClose:"Fermer le menu", navLabel:"Navigation principale", searchLabel:"Recherche globale",
      "home.quick.eyebrow":"RÉVISION IMMÉDIATE", "home.quick.title":"Que veux-tu réviser maintenant ?", "home.quick.subtitle":"Choisis une entrée et commence directement : matière, QCM, cas cliniques ou erreurs.",
      "home.quick.materias.title":"Choisir une matière", "home.quick.materias.text":"Voir les cours et modules", "home.quick.qcm.title":"QCM rapide", "home.quick.qcm.text":"S’entraîner maintenant", "home.quick.cases.title":"Cas cliniques", "home.quick.cases.text":"Raisonner comme à l’examen", "home.quick.errors.title":"Revoir les erreurs", "home.quick.errors.text":"Corriger ce qui bloque",
      currentSemesterBadge:"Semestre 3", currentSemesterText:"Contenu actuel : matières du troisième semestre",
      aboutTitle:"À propos de Med Nykuto", aboutLead:"Med Nykuto transforme des cours longs, des notes dispersées et des révisions stressantes en un espace clair : lire, comprendre, s’entraîner, corriger.",
      aboutText:"Med Nykuto est une bibliothèque médicale gratuite pensée pour réviser activement : cours, fiches, QCM, cas cliniques, vrai/faux et révision des erreurs.",
      legalFormsText:"Les formulaires de contact et de signalement servent à transmettre les retours nécessaires pour identifier un bug, une question ou une correction à faire.",
      seoShareTitle:"Med Nykuto — cours médicaux, QCM et cas cliniques gratuits",
      practiceKicker:"ENTRAÎNEMENT", qcmQuickTitle:"QCM rapide", qcmQuickSubtitle:"20 questions, correction immédiate et erreurs enregistrées.", caseQuickTitle:"Cas cliniques", caseQuickSubtitle:"Raisonnement par cas, correction immédiate et révision des erreurs.", vfQuickTitle:"Vrai/Faux", vfQuickSubtitle:"Révise les concepts clés un par un avec feedback immédiat.", mistakesQuickTitle:"Revoir les erreurs", mistakesQuickSubtitle:"Reviens sur ce que tu as raté et consolide tes points faibles.", examQuickTitle:"Mode examen", examQuickSubtitle:"Entraîne-toi avec une session plus proche d’une vraie épreuve.",
      compactQcm:"QCM", compactCases:"Cas", compactVf:"V/F", compactErrors:"Erreurs", compactSubjects:"← Matières", backHome:"← Retour accueil", dontKnow:"Voir la réponse"
    },
    es: {
      menuOpen:"Abrir menú", menuClose:"Cerrar menú", navLabel:"Navegación principal", searchLabel:"Búsqueda global",
      "home.quick.eyebrow":"REVISIÓN INMEDIATA", "home.quick.title":"¿Qué quieres revisar ahora?", "home.quick.subtitle":"Elige una entrada y empieza directo: materia, QCM, casos clínicos o errores.",
      "home.quick.materias.title":"Elegir materia", "home.quick.materias.text":"Ver cursos y módulos", "home.quick.qcm.title":"QCM rápido", "home.quick.qcm.text":"Entrenar ahora", "home.quick.cases.title":"Casos clínicos", "home.quick.cases.text":"Razonar como en examen", "home.quick.errors.title":"Revisar errores", "home.quick.errors.text":"Corregir lo que bloquea",
      currentSemesterBadge:"Semestre 3", currentSemesterText:"Contenido actual: materias del tercer semestre",
      aboutTitle:"Sobre Med Nykuto", aboutLead:"Med Nykuto transforma cursos largos, notas dispersas y revisiones estresantes en un espacio claro: leer, comprender, entrenar y corregir.",
      aboutText:"Med Nykuto es una biblioteca médica gratuita pensada para revisar de forma activa: cursos, fichas, QCM, casos clínicos, verdadero/falso y revisión de errores.",
      legalFormsText:"Los formularios de contacto y reporte sirven para transmitir los datos necesarios para identificar un bug, una pregunta o una corrección pendiente.",
      seoShareTitle:"Med Nykuto — cursos médicos, QCM y casos clínicos gratis",
      practiceKicker:"ENTRENAMIENTO", qcmQuickTitle:"QCM rápido", qcmQuickSubtitle:"20 preguntas, corrección inmediata y errores guardados.", caseQuickTitle:"Casos clínicos", caseQuickSubtitle:"Razonamiento por caso, corrección inmediata y revisión de errores.", vfQuickTitle:"Verdadero/Falso", vfQuickSubtitle:"Revisa conceptos clave uno por uno con feedback inmediato.", mistakesQuickTitle:"Revisar errores", mistakesQuickSubtitle:"Vuelve sobre lo que fallaste y consolida tus puntos débiles.", examQuickTitle:"Modo examen", examQuickSubtitle:"Entrena con una sesión más cercana a una prueba real.",
      compactQcm:"QCM", compactCases:"Casos", compactVf:"V/F", compactErrors:"Errores", compactSubjects:"← Materias", backHome:"← Volver al inicio", dontKnow:"Ver respuesta"
    },
    br: {
      menuOpen:"Abrir menu", menuClose:"Fechar menu", navLabel:"Navegação principal", searchLabel:"Busca global",
      "home.quick.eyebrow":"REVISÃO IMEDIATA", "home.quick.title":"O que você quer revisar agora?", "home.quick.subtitle":"Escolha uma entrada e comece direto: matéria, QCM, casos clínicos ou erros.",
      "home.quick.materias.title":"Escolher matéria", "home.quick.materias.text":"Ver cursos e módulos", "home.quick.qcm.title":"QCM rápido", "home.quick.qcm.text":"Treinar agora", "home.quick.cases.title":"Casos clínicos", "home.quick.cases.text":"Raciocinar como na prova", "home.quick.errors.title":"Revisar erros", "home.quick.errors.text":"Corrigir o que bloqueia",
      currentSemesterBadge:"Semestre 3", currentSemesterText:"Conteúdo atual: matérias do terceiro semestre",
      aboutTitle:"Sobre o Med Nykuto", aboutLead:"Med Nykuto transforma cursos longos, notas dispersas e revisões estressantes em um espaço claro: ler, compreender, treinar e corrigir.",
      aboutText:"Med Nykuto é uma biblioteca médica gratuita pensada para revisar de forma ativa: cursos, fichas, QCM, casos clínicos, verdadeiro/falso e revisão de erros.",
      legalFormsText:"Os formulários de contato e reporte servem para transmitir os dados necessários para identificar um bug, uma pergunta ou uma correção pendente.",
      seoShareTitle:"Med Nykuto — cursos médicos, QCM e casos clínicos gratuitos",
      practiceKicker:"TREINO", qcmQuickTitle:"QCM rápido", qcmQuickSubtitle:"20 perguntas, correção imediata e erros salvos.", caseQuickTitle:"Casos clínicos", caseQuickSubtitle:"Raciocínio por caso, correção imediata e revisão de erros.", vfQuickTitle:"Verdadeiro/Falso", vfQuickSubtitle:"Revise conceitos-chave um por um com feedback imediato.", mistakesQuickTitle:"Revisar erros", mistakesQuickSubtitle:"Volte ao que você errou e consolide seus pontos fracos.", examQuickTitle:"Modo simulado", examQuickSubtitle:"Treine com uma sessão mais próxima de uma prova real.",
      compactQcm:"QCM", compactCases:"Casos", compactVf:"V/F", compactErrors:"Erros", compactSubjects:"← Matérias", backHome:"← Voltar ao início", dontKnow:"Ver resposta"
    }
  };

  function lang(){
    try { return localStorage.getItem("medLang") || document.body.dataset.lang || "fr"; }
    catch(e){ return document.body.dataset.lang || "fr"; }
  }
  function L(k){ return (labels[lang()] && labels[lang()][k]) || labels.fr[k] || k; }
  function T(k){ return (uiText[lang()] && uiText[lang()][k]) || uiText.fr[k] || k; }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }
  function txt(v){
    if(v && typeof v === "object") return v[lang()] || v.es || v.fr || v.br || Object.values(v)[0] || "";
    return String(v || "");
  }
  function moduleUrl(m){ return "module.html?id=" + encodeURIComponent(m.id); }

  function ensureOverlay(){
    let root = document.querySelector("#v210ModulePicker");
    if(root) return root;
    root = document.createElement("div");
    root.id = "v210ModulePicker";
    root.className = "v210-picker";
    root.hidden = true;
    root.innerHTML = `
      <div class="v210-picker-backdrop" data-v210-close="1"></div>
      <section class="v210-picker-panel" role="dialog" aria-modal="true" aria-labelledby="v210PickerTitle">
        <div class="v210-picker-head">
          <div>
            <small id="v210PickerCourseCode"></small>
            <h2 id="v210PickerTitle">${L("title")}</h2>
          </div>
          <button class="v210-picker-close" type="button" data-v210-close="1" aria-label="${L("close")}">×</button>
        </div>
        <div class="v210-picker-list"></div>
      </section>
    `;
    document.body.appendChild(root);
    root.addEventListener("click", e => {
      if(e.target && e.target.getAttribute("data-v210-close") === "1") closeOverlay();
    });
    document.addEventListener("keydown", e => {
      if(e.key === "Escape") closeOverlay();
    });
    return root;
  }

  function closeOverlay(){
    const root = document.querySelector("#v210ModulePicker");
    if(!root) return;
    root.hidden = true;
    document.body.classList.remove("v210-picker-open");
  }

  function openOverlay(course){
    const root = ensureOverlay();
    const courseTitle = txt(course.title);
    const code = course.code || course.id || "";
    const mods = Array.isArray(course.modules) ? course.modules : [];
    root.querySelector("#v210PickerCourseCode").textContent = code;
    root.querySelector("#v210PickerTitle").textContent = courseTitle + " — " + L("title");
    const list = root.querySelector(".v210-picker-list");
    if(!mods.length){
      list.innerHTML = `<div class="v210-picker-empty">${L("empty")}</div>`;
    } else {
      list.innerHTML = mods.map(m => `
        <a class="v210-picker-link" href="${moduleUrl(m)}">
          <span>Mód. ${esc(m.number || "")}</span>
          <strong>${esc(txt(m.title))}</strong>
        </a>
      `).join("");
    }
    root.hidden = false;
    document.body.classList.add("v210-picker-open");
    setTimeout(() => {
      const first = root.querySelector(".v210-picker-link, .v210-picker-close");
      if(first) first.focus({preventScroll:true});
    }, 30);
  }

  function enhanceCatalog(){
    if(document.body.dataset.page !== "catalog") return;
    const grid = document.querySelector("#courseGrid");
    if(!grid) return;

    // Remove previous v208/v209 inline/dropdown artifacts if they exist.
    document.querySelectorAll(".course-module-drawer,.v209-module-menu").forEach(el => el.remove());
    document.querySelectorAll(".course-card").forEach(card => {
      card.classList.remove("expanded","v209-open");
    });

    Array.from(grid.querySelectorAll(".course-card")).forEach((card, index) => {
      const course = courses[index];
      if(!course || card.dataset.v210Enhanced === "1") return;
      const actions = card.querySelector(".card-actions");
      const mainButton = actions ? actions.querySelector(".btn.primary") : null;
      if(!mainButton) return;

      mainButton.href = "#";
      mainButton.setAttribute("role", "button");
      mainButton.setAttribute("data-v210-toggle", "1");
      mainButton.textContent = L("show") + " ▾";
      mainButton.classList.remove("v209-toggle","v208-module-toggle");
      mainButton.classList.add("v210-toggle");
      mainButton.addEventListener("click", e => {
        e.preventDefault();
        openOverlay(course);
      });
      card.dataset.v210Enhanced = "1";
    });
  }

  function enhanceReader(){
    if(document.body.dataset.page !== "module") return;
    document.body.classList.add("v208-reader-comfort");
    const active = document.querySelector(".reader-tab.active");
    if(active) active.setAttribute("aria-current","page");
    const content = document.querySelector("#moduleContent");
    if(content && !content.dataset.v210Enhanced){
      content.querySelectorAll("p").forEach(p => {
        const t = p.textContent || "";
        if(t.length > 500) p.classList.add("reader-long-paragraph");
        if(t.includes(" | ") && t.length > 180) p.classList.add("reader-soft-block");
      });
      content.dataset.v210Enhanced = "1";
    }
  }

  function injectUiPolishStyles(){
    if(document.getElementById("v286UiPolishStyles")) return;
    const style = document.createElement("style");
    style.id = "v286UiPolishStyles";
    style.textContent = `
      .site-header{overflow:visible!important}.brand-context small{line-height:1.15}.brand-logo{object-fit:contain;background:rgba(255,255,255,.03)}
      .footer a[href$="README_DEPLOIEMENT.txt"]{display:none!important}.footer strong{letter-spacing:.01em}
      .practice-quick-header{max-width:1180px;margin:22px auto 0;padding:16px 22px 4px}.practice-quick-kicker{color:var(--gold2);font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}.practice-quick-title{font-size:clamp(28px,4vw,44px);line-height:1.08;letter-spacing:-.8px}.practice-quick-subtitle{color:var(--muted);max-width:720px;margin-top:8px}
      .practice-compact-controls{max-width:1180px;margin:14px auto 0;padding:0 22px;display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.practice-compact-controls::-webkit-scrollbar{display:none}.practice-compact-pill{white-space:nowrap;border:1px solid var(--line);border-radius:999px;padding:9px 13px;background:rgba(255,255,255,.045);color:var(--muted);font-weight:850}.practice-compact-pill.is-primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#111827;border-color:transparent}.practice-compact-pill:hover{border-color:rgba(216,180,91,.45);color:var(--gold2)}.practice-compact-pill.is-primary:hover{color:#111827}
      .home-action-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.home-action-card{min-width:0}.home-action-card small,.home-action-card strong{overflow-wrap:anywhere}.home-v41-proof{gap:10px}.donate-visual{position:relative}.support-image{border-radius:22px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);box-shadow:0 18px 48px rgba(0,0,0,.28)}
      @media(max-width:920px){.nav-shell{position:relative;flex-wrap:wrap}.nav-links{left:14px!important;right:14px!important;top:calc(100% + 8px)!important;width:auto!important;min-width:0!important;max-height:calc(100vh - 116px);overflow:auto;padding:10px!important;gap:4px!important}.nav-links.open{display:grid!important}.nav-links a{padding:11px 12px!important;border-radius:12px}.nav-links a:hover{background:rgba(255,255,255,.06)}.global-tools{order:3;flex-basis:100%;width:100%;min-width:0!important}.global-search{min-width:0!important}.home-action-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.home-v41-proof{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:620px){body{overflow-x:hidden}.home-action-grid{grid-template-columns:1fr}.home-quick-actions,.home-v41-hero-card,.home-v42-donate-card,.home-v41-dashboard,.home-v41-steps article,.home-v41-bottom{border-radius:20px!important}.practice-quick-header{padding-left:14px;padding-right:14px}.practice-compact-controls{padding-left:14px;padding-right:14px}.practice-compact-pill{padding:8px 11px;font-size:13.5px}.global-search-results{width:calc(100vw - 28px)!important}.toast{left:14px!important;right:14px!important;bottom:14px!important;text-align:center}.subject-progress-grid{grid-template-columns:1fr!important}.stat-row-mini{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function replaceBrandInTextNodes(root){
    if(!root || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if(!parent || parent.closest("script,style,textarea,input,select")) return NodeFilter.FILTER_REJECT;
        return node.nodeValue && node.nodeValue.includes("Med Cursos") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { n.nodeValue = n.nodeValue.replace(/Med Cursos/g, BRAND_NAME); });
  }

  function cleanBranding(){
    document.title = document.title.replace(/Med Cursos/g, BRAND_NAME);
    document.querySelectorAll("meta[content]").forEach(meta => {
      const val = meta.getAttribute("content") || "";
      meta.setAttribute("content", val.replace(/Med Cursos/g, BRAND_NAME).replace(/https:\/\/med-cursos\.netlify\.app/g, CANONICAL_ORIGIN));
    });
    document.querySelectorAll("link[rel='canonical']").forEach(link => {
      const path = location.pathname && location.pathname !== "/" ? location.pathname : "/index.html";
      link.setAttribute("href", CANONICAL_ORIGIN + path);
    });
    document.querySelectorAll("img[alt]").forEach(img => {
      img.alt = img.alt.replace(/Med Cursos/g, BRAND_NAME);
    });
    document.querySelectorAll(".creator-signature-v67 small, .legal-sidebar-v67 h2").forEach(el => { el.textContent = BRAND_NAME; });
    replaceBrandInTextNodes(document.body);
  }

  function applyStaticI18n(){
    const htmlLang = lang() === "br" ? "pt-BR" : lang();
    document.documentElement.setAttribute("lang", htmlLang);
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = uiText[lang()] && uiText[lang()][key];
      if(val) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      const val = uiText[lang()] && uiText[lang()][key];
      if(val) el.setAttribute("aria-label", val);
    });
    document.querySelectorAll("nav[aria-label]").forEach(nav => nav.setAttribute("aria-label", T("navLabel")));
    document.querySelectorAll(".global-search input").forEach(input => input.setAttribute("aria-label", T("searchLabel")));
  }

  function enhanceMenu(){
    const button = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    if(!button || !links) return;
    button.setAttribute("aria-controls", "navLinks");
    function sync(open){
      const isOpen = open == null ? links.classList.contains("open") : !!open;
      links.classList.toggle("open", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute("aria-label", isOpen ? T("menuClose") : T("menuOpen"));
      document.body.classList.toggle("nav-open", isOpen);
    }
    if(button.dataset.v286Menu !== "1"){
      button.addEventListener("click", e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        sync(!links.classList.contains("open"));
      }, true);
      document.addEventListener("click", e => {
        if(!links.classList.contains("open")) return;
        if(e.target === button || button.contains(e.target) || links.contains(e.target)) return;
        sync(false);
      });
      document.addEventListener("keydown", e => {
        if(e.key === "Escape") sync(false);
      });
      links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => sync(false)));
      button.dataset.v286Menu = "1";
    }
    sync(links.classList.contains("open"));
  }

  function practiceQuickCopy(){
    const type = document.body.dataset.practiceType;
    const page = document.body.dataset.page;
    let titleKey = "";
    let subKey = "";
    if(type === "qcm"){ titleKey = "qcmQuickTitle"; subKey = "qcmQuickSubtitle"; }
    else if(type === "case"){ titleKey = "caseQuickTitle"; subKey = "caseQuickSubtitle"; }
    else if(type === "vf"){ titleKey = "vfQuickTitle"; subKey = "vfQuickSubtitle"; }
    else if(page === "mistakes"){ titleKey = "mistakesQuickTitle"; subKey = "mistakesQuickSubtitle"; }
    else if(page === "exam"){ titleKey = "examQuickTitle"; subKey = "examQuickSubtitle"; }
    const kicker = document.querySelector(".practice-quick-kicker");
    const title = document.querySelector(".practice-quick-title");
    const subtitle = document.querySelector(".practice-quick-subtitle");
    if(kicker) kicker.textContent = T("practiceKicker");
    if(title && titleKey) title.textContent = T(titleKey);
    if(subtitle && subKey) subtitle.textContent = T(subKey);

    document.querySelectorAll(".practice-compact-pill").forEach(a => {
      const href = a.getAttribute("href") || "";
      let key = "";
      if(href.includes("qcm.html")) key = "compactQcm";
      else if(href.includes("cas-cliniques.html")) key = "compactCases";
      else if(href.includes("vrai-faux.html")) key = "compactVf";
      else if(href.includes("erreurs.html")) key = "compactErrors";
      else if(href.includes("matieres.html")) key = "compactSubjects";
      if(key) a.innerHTML = href.includes("matieres.html") ? esc(T(key)) : `<strong>${esc(T(key))}</strong>`;
    });
    const backHome = document.querySelector('.erreurs-page .back-link[href="index.html"]');
    if(backHome) backHome.textContent = T("backHome");
  }

  function fixStatsFromData(){
    const moduleCount = courses.reduce((sum, c) => sum + ((c.modules && c.modules.length) || 0), 0);
    const statCourses = document.getElementById("statCursoes");
    const statModules = document.getElementById("statModules");
    if(statCourses && courses.length) statCourses.textContent = String(courses.length);
    if(statModules && moduleCount) statModules.textContent = String(moduleCount);
  }

  function fixKnownMixedStrings(){
    const map = {
      fr: {"Ver respuesta":"Voir la réponse","Entrenar maintenant":"S’entraîner maintenant","Casos":"Cas","Errores":"Erreurs","Materias":"Matières","Modo examen":"Mode examen","Verdadero/Falso":"Vrai/Faux"},
      es: {"Entrenar maintenant":"Entrenar ahora"},
      br: {"Ver respuesta":"Ver resposta","Entrenar maintenant":"Treinar agora","Errores":"Erros","Materias":"Matérias","Modo examen":"Modo simulado","Verdadero/Falso":"Verdadeiro/Falso"}
    }[lang()] || {};
    const selector = "button,a,span,strong,small,p,h1,h2,h3,option,summary";
    document.querySelectorAll(selector).forEach(el => {
      if(el.children.length) return;
      const raw = (el.textContent || "").trim();
      if(map[raw]) el.textContent = map[raw];
    });
  }

  function applyUiPolish(){
    injectUiPolishStyles();
    cleanBranding();
    applyStaticI18n();
    enhanceMenu();
    practiceQuickCopy();
    fixStatsFromData();
    fixKnownMixedStrings();
  }

  function apply(){
    enhanceCatalog();
    enhanceReader();
    applyUiPolish();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => { setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900); });
  } else {
    setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900);
  }
  window.addEventListener("load", () => { setTimeout(apply,0); setTimeout(apply,500); setTimeout(apply,1500); });
  window.addEventListener("storage", e => { if(e.key === "medLang") setTimeout(apply,0); });
  document.addEventListener("click", e => {
    if(e.target && e.target.closest && e.target.closest(".lang-switch button")) setTimeout(apply,0);
  });
})();
