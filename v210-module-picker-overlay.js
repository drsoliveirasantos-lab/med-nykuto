/* v210 — Robust module picker overlay + comfortable reader */
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

  function apply(){
    enhanceCatalog();
    enhanceReader();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => { setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900); });
  } else {
    setTimeout(apply,0); setTimeout(apply,250); setTimeout(apply,900);
  }
  window.addEventListener("load", () => { setTimeout(apply,0); setTimeout(apply,500); });
})();
