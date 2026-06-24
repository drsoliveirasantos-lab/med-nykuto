/* v210 — Robust module picker overlay + comfortable reader + premium QCM mobile layer */
(function(){
  const DATA = window.MED_COURSES_DATA || {courses:[]};
  const courses = DATA.courses || [];

  const labels = {
    fr: {show:"Voir modules", close:"Fermer", title:"Choisir un module", empty:"Modules bientôt disponibles"},
    es: {show:"Ver módulos", close:"Cerrar", title:"Elegir un módulo", empty:"Módulos disponibles pronto"},
    br: {show:"Ver módulos", close:"Fechar", title:"Escolher um módulo", empty:"Módulos em breve"}
  };

  function lang(){
    try { return localStorage.getItem("medLang") || document.body.dataset.lang || "fr"; }
    catch(e){ return document.body.dataset.lang || "fr"; }
  }
  function L(k){ return (labels[lang()] && labels[lang()][k]) || labels.fr[k] || k; }
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

  /* Premium QCM mobile layer */
  function enhanceQcm(){
    if(!document.body.classList.contains("qcm-page")) return;
    document.body.classList.add("premium-qcm");
    compactFocusButton();
    upgradePickerLabels();
    ensureProgress();
    collapseWeaknessPanel();
    cleanQuestionText();
    buildStickyActions();
  }

  function compactFocusButton(){
    const btn = document.querySelector(".practice-focus-open");
    if(btn && btn.textContent.trim() !== "⛶ Focus") btn.textContent = "⛶ Focus";
  }

  function upgradePickerLabels(){
    document.querySelectorAll(".mc-picker-btn").forEach(btn => {
      if(btn.dataset.premiumLabel === "1") return;
      const raw = btn.textContent.replace(/\s+/g," ").trim();
      const isModule = btn.classList.contains("module") || /^Mod\./i.test(raw);
      const label = isModule ? "Module" : "Matière";
      const value = raw.replace(/^Mat\.:?\s*/i,"").replace(/^Mod\.:?\s*/i,"").trim();
      btn.innerHTML = `<span class="premium-filter-label">${label}</span><strong>${esc(value || (isModule ? "Toute la banque" : "Toutes"))}</strong><span class="premium-filter-change">Changer ▾</span>`;
      btn.dataset.premiumLabel = "1";
    });
  }

  function getProgressNumbers(){
    const section = document.querySelector(".practice-focus-section") || document.body;
    const text = (section.textContent || "").replace(/\s+/g," ");
    const match = text.match(/\b(\d{1,2})\s*\/\s*(20)\b/);
    const current = match ? Math.max(1, Math.min(20, parseInt(match[1],10))) : 1;
    const total = match ? parseInt(match[2],10) : 20;
    return {current,total,percent:Math.round((current/total)*100)};
  }

  function ensureProgress(){
    const section = document.querySelector(".practice-focus-section");
    const picker = document.querySelector(".mc-picker-shell");
    if(!section || !picker) return;
    let bar = document.querySelector(".premium-progress");
    if(!bar){
      bar = document.createElement("div");
      bar.className = "premium-progress";
      picker.insertAdjacentElement("afterend", bar);
    }
    const p = getProgressNumbers();
    bar.innerHTML = `<div class="premium-progress-head"><strong>Question ${p.current}/${p.total}</strong><span>${p.percent}%</span></div><div class="premium-progress-track"><i style="width:${p.percent}%"></i></div>`;
  }

  function findWeaknessBlock(){
    const section = document.querySelector(".practice-focus-section");
    if(!section) return null;
    const candidates = Array.from(section.querySelectorAll("section,article,div"));
    let best = null;
    candidates.forEach(el => {
      if(el.classList.contains("premium-weak-summary") || el.closest(".premium-weak-summary")) return;
      const t = (el.textContent || "").replace(/\s+/g," ");
      if(t.includes("Mes points faibles") && t.includes("ADAPTATIF")){
        if(!best || (el.textContent || "").length < (best.textContent || "").length) best = el;
      }
    });
    return best;
  }

  function collapseWeaknessPanel(){
    const block = findWeaknessBlock();
    if(!block || block.dataset.premiumWeak === "1") return;
    block.dataset.premiumWeak = "1";
    block.classList.add("premium-weak-hidden");
    const t = (block.textContent || "").replace(/\s+/g," ");
    const nums = Array.from(t.matchAll(/\b\d+\b/g)).map(m => m[0]);
    const responses = nums[0] || "0";
    const errors = nums[2] || nums[1] || "0";
    const unsure = nums[3] || "0";
    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "premium-weak-summary";
    summary.innerHTML = `<strong>Points faibles</strong><span>${responses} réponses · ${errors} erreurs · ${unsure} je ne sais pas</span><em>Afficher ▾</em>`;
    block.parentNode.insertBefore(summary, block);
    summary.addEventListener("click", () => {
      block.classList.toggle("premium-weak-hidden");
      const open = !block.classList.contains("premium-weak-hidden");
      summary.querySelector("em").textContent = open ? "Masquer ▴" : "Afficher ▾";
    });
  }

  function cleanQuestionText(){
    const root = document.querySelector("#practiceList") || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let s = n.nodeValue;
      const old = s;
      s = s.replace(/,?\s*¿qué afirmación es correcta, célula, fase ni localización\?/gi, ", ¿cuál afirmación es correcta?");
      s = s.replace(/¿qué afirmación es correcta, célula, fase ni localización\?/gi, "¿cuál afirmación es correcta?");
      s = s.replace(/,?\s*célula, fase ni localización\?/gi, "?");
      s = s.replace(/¿qué proposición mantiene la relación correcta entre causa, mecanismo y consecuencia\?/gi, "¿cuál proposición es correcta?");
      if(s !== old) n.nodeValue = s;
    });
  }

  function buildStickyActions(){
    let bar = document.querySelector(".premium-bottom-actions");
    if(!bar){
      bar = document.createElement("div");
      bar.className = "premium-bottom-actions";
      document.body.appendChild(bar);
    }
    const root = document.querySelector("#practiceList") || document.body;
    const buttons = Array.from(root.querySelectorAll("button,a")).filter(el => {
      const t = (el.textContent || "").toLowerCase();
      if(el.closest(".premium-bottom-actions") || el.closest(".mc-modal")) return false;
      return /je ne sais pas|no sé|nao sei|não sei|valider|validar|corriger|corregir|suivant|siguiente|próxima|prochaine/.test(t);
    }).slice(-2);
    if(!buttons.length){ bar.classList.remove("visible"); return; }
    bar.innerHTML = "";
    buttons.forEach(original => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = original.textContent.trim() || "Action";
      b.className = /suivant|siguiente|próxima|prochaine|valider|validar/i.test(b.textContent) ? "primary" : "secondary";
      b.onclick = () => original.click();
      bar.appendChild(b);
    });
    bar.classList.add("visible");
  }

  function applyQcmLoop(){
    enhanceQcm();
    if(document.body.classList.contains("qcm-page") && !document.body.dataset.premiumQcmObserver && window.MutationObserver){
      document.body.dataset.premiumQcmObserver = "1";
      const root = document.querySelector(".practice-focus-section") || document.body;
      new MutationObserver(() => { window.clearTimeout(window.__premiumQcmTimer); window.__premiumQcmTimer = window.setTimeout(enhanceQcm, 80); }).observe(root,{childList:true,subtree:true,characterData:true});
    }
  }

  function apply(){
    enhanceCatalog();
    enhanceReader();
    applyQcmLoop();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => { setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900); setTimeout(apply,1800); });
  } else {
    setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900); setTimeout(apply,1800);
  }
  window.addEventListener("load", () => { setTimeout(apply,0); setTimeout(apply,500); setTimeout(apply,1600); });
})();