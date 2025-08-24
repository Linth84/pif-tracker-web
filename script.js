/******************************
 * PIF/FIP Tracker – script.js (sin gráfico)
 * - Calculadora
 * - Registro (fecha por defecto = hoy, fallback al guardar)
 * - Tabs (Calc / Registro / Seguimiento)
 * - Seguimiento (84 + 84, lista solo hasta hoy, notas y marcar dosis)
 * - i18n ES/EN
 ******************************/

/* ========= Helpers ========= */
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function clearChildren(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
function setElementTextByTranslateAttr() {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    const dict = i18n[languageSelect.value || "es"];
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
}

/* ========= Elementos base ========= */
const languageSelect = document.getElementById("languageSelect");

/* === Calculadora === */
const calcForm        = document.getElementById("calc-form");
const formaSelect     = document.getElementById("calc-forma");
const tipoContainer   = document.getElementById("tipo-container");
const tipoSelect      = document.getElementById("calc-tipo");
const concContainer   = document.getElementById("concentracion-container");

const customFields        = document.getElementById("custom-fields");
const customSubforma      = document.getElementById("custom-subforma");
const customDosage        = document.getElementById("custom-dosage");
const customConcentration = document.getElementById("custom-concentration");

const inputPeso = document.getElementById("calc-peso");
const resultado = document.getElementById("calc-resultado");

/* === Registro === */
const registroForm   = document.getElementById("registro-form");
const regDia         = document.getElementById("registro-dia");
const regPeso        = document.getElementById("registro-peso");
const regDosis       = document.getElementById("registro-dosis");
const regComentarios = document.getElementById("registro-comentarios");
const historialList  = document.getElementById("historial");

/* ========= i18n ========= */
const i18n = {
  es: {
    calcTitle: "PIF Tracker",
    formAdmin: "Forma de administración:",
    inyectable: "Inyectable",
    pastillas: "Pastillas",
    oral: "Oral (líquido)",
    custom: "Personalizado",
    tipoPIF: "Tipo de PIF:",
    pesoGato: "Peso del gato (kg):",
    concentracion: "Concentración:",
    concentracionUnitsMl: "mg/ml",
    concentracionUnitsTab: "mg por pastilla",
    btnCalcular: "Calcular",
    advertencia: "La calculadora es solo un estimado, consulte siempre a su veterinario/a.",
    /* Custom */
    subformaLabel: "Modo personalizado:",
    customDosage: "Dosaje (mg/kg):",
    customConcentration: "Concentración:",
    /* Labels por tipo */
    terms: { wet: "Húmedo", dry: "Seco", ocular: "Ocular", neuro: "Neurológico" },
    /* Unidades */
    ml: "ml",
    tablets: "pastillas",
    /* Registro */
    historialTitle: "Historial",
    registroDia: "Día:",
    registroPeso: "Peso:",
    registroDosis: "Dosis:",
    registroComentarios: "Comentarios / Novedades:",
    btnGuardar: "Guardar registro",
    editar: "✏️ Editar",
    borrar: "🗑️ Borrar",
    guardar: "💾 Guardar",
    cancelar: "✖️ Cancelar",
    /* Tabs */
    tabCalc: "Calculadora",
    tabRegistro: "Registro",
    tabSeguimiento: "Seguimiento",
    /* Seguimiento */
    seguimientoTitle: "Seguimiento",
    treat: "Tratamiento",
    obs: "Observación",
    markToday: "Marcar dosis de hoy ✔",
    addNote: "Agregar nota",
    regenList: "Regenerar lista",
    notePrompt: "Ingresá una nota para este día",
    saved: "Guardado"
  },
  en: {
    calcTitle: "FIP Tracker",
    formAdmin: "Administration form:",
    inyectable: "Injectable",
    pastillas: "Tablets",
    oral: "Oral (liquid)",
    custom: "Custom",
    tipoPIF: "Type of FIP:",
    pesoGato: "Cat weight (lbs):",
    concentracion: "Concentration:",
    concentracionUnitsMl: "mg/ml",
    concentracionUnitsTab: "mg per tablet",
    btnCalcular: "Calculate",
    advertencia: "Calculator is only an estimate — always consult your veterinarian.",
    /* Custom */
    subformaLabel: "Custom mode:",
    customDosage: "Dosage (mg/kg):",
    customConcentration: "Concentration:",
    /* Labels */
    terms: { wet: "Wet", dry: "Dry", ocular: "Ocular", neuro: "Neurological" },
    /* Units */
    ml: "ml",
    tablets: "tablets",
    /* Registro */
    historialTitle: "History",
    registroDia: "Day:",
    registroPeso: "Weight:",
    registroDosis: "Dose:",
    registroComentarios: "Comments / Updates:",
    btnGuardar: "Save record",
    editar: "✏️ Edit",
    borrar: "🗑️ Delete",
    guardar: "💾 Save",
    cancelar: "✖️ Cancel",
    /* Tabs */
    tabCalc: "Calculator",
    tabRegistro: "Log",
    tabSeguimiento: "Follow-up",
    /* Seguimiento */
    seguimientoTitle: "Follow-up",
    treat: "Treatment",
    obs: "Observation",
    markToday: "Mark today’s dose ✔",
    addNote: "Add note",
    regenList: "Regenerate list",
    notePrompt: "Add a note for this day",
    saved: "Saved"
  }
};
const t = (key) => i18n[languageSelect.value || "es"][key];

/* ========= Datos de tipos ========= */
const TYPES_INYECTABLE = [
  { cat: "wet", dose: 8 }, { cat: "wet", dose: 9 }, { cat: "wet", dose: 10 },
  { cat: "dry", dose: 10 }, { cat: "ocular", dose: 10 },
  { cat: "neuro", dose: 12 }, { cat: "neuro", dose: 13 },
  { cat: "neuro", dose: 14 }, { cat: "neuro", dose: 15 }
];
const TYPES_TABLETS_ORAL = [
  { cat: "wet", dose: 8 }, { cat: "wet", dose: 10 },
  { cat: "dry", dose: 10 }, { cat: "ocular", dose: 10 },
  { cat: "neuro", dose: 12 }, { cat: "neuro", dose: 15 }
];

/* ========= Utils calc ========= */
function labelType(cat, dose) {
  const lang = languageSelect.value || "es";
  const name = i18n[lang].terms[cat] || cat;
  return `${name} ${dose} mg/kg`;
}
function roundTabletsRule(n) {
  const base = Math.floor(n);
  const frac = n - base;
  if (frac < 0.3) return base;
  if (frac < 0.8) return base + 0.5;
  return base + 1;
}
function getPesoKg() {
  let peso = parseFloat(inputPeso?.value || "0");
  if ((languageSelect.value || "es") === "en") peso = peso * 0.45359237; // lbs -> kg
  return peso;
}

/* ========= Render calculadora ========= */
function renderTipoOptions() {
  if (!tipoSelect) return;
  clearChildren(tipoSelect);
  const forma = formaSelect?.value;
  let list = [];
  if (forma === "inyectable") list = TYPES_INYECTABLE;
  else if (forma === "pastillas" || forma === "oral") list = TYPES_TABLETS_ORAL;

  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = String(item.dose);
    opt.textContent = labelType(item.cat, item.dose);
    tipoSelect.appendChild(opt);
  });
}
function renderConcentrationUI() {
  if (!concContainer) return;
  clearChildren(concContainer);
  const label = document.createElement("label");
  label.setAttribute("data-translate", "concentracion");
  label.textContent = t("concentracion");
  const select = document.createElement("select");
  select.id = "calc-concentracion";
  const forma = formaSelect?.value;
  if (forma === "inyectable") {
    const opt = document.createElement("option"); opt.value = "15"; opt.textContent = "15 mg/ml"; select.appendChild(opt);
  } else if (forma === "pastillas") {
    const a = document.createElement("option"); a.value = "15"; a.textContent = "15 mg";
    const b = document.createElement("option"); b.value = "30"; b.textContent = "30 mg";
    select.appendChild(a); select.appendChild(b);
  } else if (forma === "oral") {
    const opt = document.createElement("option"); opt.value = "50"; opt.textContent = "50 mg/ml"; select.appendChild(opt);
  }
  concContainer.appendChild(label); concContainer.appendChild(select);
}
function setTipoVisibility() { if (tipoContainer && formaSelect) tipoContainer.style.display = (formaSelect.value === "custom") ? "none" : ""; }
function setCustomVisibility() { if (customFields && formaSelect) customFields.style.display = (formaSelect.value === "custom") ? "" : "none"; }
function renderAllForForma() {
  setTipoVisibility(); setCustomVisibility();
  if (formaSelect?.value !== "custom") { renderTipoOptions(); renderConcentrationUI(); }
  else { clearChildren(concContainer); }
}

/* ========= Cálculo ========= */
function calcular() {
  if (!formaSelect) return;
  const forma = formaSelect.value;
  const peso = getPesoKg();
  if (!resultado) return;
  resultado.textContent = "";
  if (!peso || peso <= 0) { resultado.textContent = "—"; return; }

  let dosisMgKg = 0, conc = 0;

  if (forma === "custom") {
    const sub = customSubforma?.value;
    const d = parseFloat(customDosage?.value || "0");
    const c = parseFloat(customConcentration?.value || "0");
    if (!d || !c) { resultado.textContent = "—"; return; }
    if (sub === "inyectable" || sub === "oral") {
      const ml = (peso * d) / c;
      resultado.textContent = `${ml.toFixed(2)} ${t("ml")} — ${t("advertencia")}`;
    } else {
      const raw = (peso * d) / c * 2;
      const tabs = roundTabletsRule(raw);
      resultado.textContent = `${tabs} ${t("tablets")} — ${t("advertencia")}`;
    }
  } else if (forma === "inyectable") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    conc = 15;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")} — ${t("advertencia")}`;
  } else if (forma === "pastillas") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    const concSel = document.getElementById("calc-concentracion");
    conc = parseFloat(concSel ? concSel.value : "15");
    const raw = (peso * dosisMgKg) / conc * 2;
    const tabs = roundTabletsRule(raw);
    resultado.textContent = `${tabs} ${t("tablets")} — ${t("advertencia")}`;
  } else if (forma === "oral") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    conc = 50;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")} — ${t("advertencia")}`;
  }
}

/* ========= Registro (localStorage) ========= */
function loadHistorial() {
  if (!historialList) return;
  const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
  historialList.innerHTML = "";
  data.forEach((item, idx) => {
    const li = document.createElement("div");
    li.classList.add("historial-item");
    li.innerHTML = `
      <div><strong>${item.fecha || "-"}</strong></div>
      <div>${t("registroPeso")} ${item.peso ?? "-"} kg</div>
      <div>${t("registroDosis")} ${item.dosis ?? "-"}</div>
      <div>${t("registroComentarios")} ${item.comentarios || "-"}</div>
      <div class="historial-btns">
        <button class="edit">${t("editar")}</button>
        <button class="delete">${t("borrar")}</button>
      </div>
    `;

    // Editar
    li.querySelector(".edit").addEventListener("click", () => {
      li.innerHTML = `
        <div><input type="date" id="e_fecha" value="${item.fecha || ""}"></div>
        <div><input type="number" step="0.1" id="e_peso" value="${item.peso ?? ""}"></div>
        <div><input type="text" id="e_dosis" value="${item.dosis ?? ""}"></div>
        <div><textarea id="e_comentarios" rows="2">${item.comentarios || ""}</textarea></div>
        <div class="historial-btns">
          <button class="save">${t("guardar")}</button>
          <button class="cancel">${t("cancelar")}</button>
        </div>
      `;
      li.querySelector(".save").addEventListener("click", () => {
        const data2 = JSON.parse(localStorage.getItem("pif_historial") || "[]");
        const it = data2[idx] || {};
        it.fecha = document.getElementById("e_fecha").value || todayISO();
        it.peso = parseFloat(document.getElementById("e_peso").value || "0");
        it.dosis = document.getElementById("e_dosis").value || "";
        it.comentarios = document.getElementById("e_comentarios").value || "";
        data2[idx] = it;
        localStorage.setItem("pif_historial", JSON.stringify(data2));
        loadHistorial();
      });
      li.querySelector(".cancel").addEventListener("click", loadHistorial);
    });

    // Borrar
    li.querySelector(".delete").addEventListener("click", () => {
      const d = JSON.parse(localStorage.getItem("pif_historial") || "[]");
      d.splice(idx, 1);
      localStorage.setItem("pif_historial", JSON.stringify(d));
      loadHistorial();
    });

    historialList.appendChild(li);
  });
}

if (registroForm) {
  registroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fechaElegida = (regDia?.value || "").trim();
    const item = {
      fecha: fechaElegida || todayISO(),   // Fallback si está vacío
      peso: parseFloat(regPeso?.value || "0"),
      dosis: regDosis?.value || "",
      comentarios: regComentarios?.value || ""
    };
    const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
    data.unshift(item);
    localStorage.setItem("pif_historial", JSON.stringify(data));
    registroForm.reset();
    if (regDia) regDia.value = todayISO(); // deja hoy para el siguiente registro
    loadHistorial();
  });
}

/* ========= Traducción dinámica ========= */
function applyTranslations() {
  setElementTextByTranslateAttr();

  // Opciones del select de "custom subforma"
  if (customSubforma) {
    Array.from(customSubforma.options).forEach(opt => {
      const k = opt.getAttribute("data-translate");
      if (k && i18n[languageSelect.value][k]) opt.textContent = i18n[languageSelect.value][k];
    });
  }

  // Tabs y Seguimiento (aseguramos data-translate)
  document.querySelector('[data-tab="calc"]')?.setAttribute("data-translate", "tabCalc");
  document.querySelector('[data-tab="registro"]')?.setAttribute("data-translate", "tabRegistro");
  document.querySelector('[data-tab="seguimiento"]')?.setAttribute("data-translate", "tabSeguimiento");
  document.querySelector('#seguimiento-section h2')?.setAttribute("data-translate", "seguimientoTitle");
  document.getElementById("mark-today")?.setAttribute("data-translate", "markToday");
  document.getElementById("add-note-today")?.setAttribute("data-translate", "addNote");
  document.getElementById("gen-days")?.setAttribute("data-translate", "regenList");
  setElementTextByTranslateAttr();

  // Re-render dependiente de idioma
  if (formaSelect?.value !== "custom") { renderTipoOptions(); renderConcentrationUI(); }
  loadHistorial();
}

/* ========= Eventos base ========= */
if (calcForm) calcForm.addEventListener("submit", e => { e.preventDefault(); calcular(); });
if (formaSelect) formaSelect.addEventListener("change", renderAllForForma);
if (customSubforma) {
  customSubforma.addEventListener("change", () => {
    const lang = languageSelect.value || "es";
    const isTabs = customSubforma.value === "pastillas";
    const concLabel = document.getElementById("label-concentration");
    if (concLabel) {
      concLabel.textContent = i18n[lang].customConcentration + " " +
        (isTabs ? `(${i18n[lang].concentracionUnitsTab})` : `(${i18n[lang].concentracionUnitsMl})`);
    }
  });
}
if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    applyTranslations();
    if (formaSelect?.value !== "custom") renderConcentrationUI();
    Seguimiento.render();
  });
}

/* ========= Init ========= */
window.addEventListener("DOMContentLoaded", () => {
  if (!languageSelect.value) languageSelect.value = "es";
  applyTranslations();
  if (formaSelect) formaSelect.value = "inyectable";
  renderAllForForma();
  if (regDia && !regDia.value) regDia.value = todayISO(); // fecha por defecto en Registro
  loadHistorial();
  Tabs.init();
  Seguimiento.init();
});

/* ====================== Tabs ======================= */
const Tabs = (() => {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);
  const sections = {
    calc: $("#calc-section"),
    registro: $("#registro-section"),
    seguimiento: $("#seguimiento-section"),
  };
  function setActiveTab(tab){
    $$("#tabs .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    Object.entries(sections).forEach(([k, el]) => {
      if (el) el.style.display = (k === tab) ? "block" : "none";
    });
    localStorage.setItem("pif.tab", JSON.stringify(tab));
    if (tab === "registro") {
      if (regDia && !regDia.value) regDia.value = todayISO(); // autocompletar fecha
    }
  }
  function init(){
    $$("#tabs .tab-btn").forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));
    const last = JSON.parse(localStorage.getItem("pif.tab") || "null") || "calc";
    setActiveTab(last);
  }
  return { init, setActiveTab };
})();

/* ================== Seguimiento (84+84) ================= */
const Seguimiento = (() => {
  const DAYS_PER_PHASE = 84;
  const TOTAL_DAYS     = 168;

  const fmtISO   = (d) => d.toISOString().slice(0,10);
  const parseISO = (s) => new Date(`${s}T00:00:00`);
  const clamp    = (n,a,b)=>Math.max(a,Math.min(b,n));

  const LS = {
    get(k, f=null){ try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };
  const refs = () => ({
    treatStartInput : document.getElementById("treat-start"),
    obsStartInput   : document.getElementById("obs-start"),
    phaseNowEl      : document.getElementById("phase-now"),
    dayInPhaseEl    : document.getElementById("day-in-phase"),
    dayGlobalEl     : document.getElementById("day-global"),
    progressFill    : document.getElementById("progress-fill"),
    progressLabel   : document.getElementById("progress-label"),
    listWrap        : document.getElementById("seguimiento-list"),
    btnMarkToday    : document.getElementById("mark-today"),
    btnAddNote      : document.getElementById("add-note-today"),
    btnGenDays      : document.getElementById("gen-days"),
  });

  function load(){
    return LS.get("pif.seguimiento", {
      treatStart: null, obsStart: null, taken: [], notes: {}
    });
  }
  function save(x){ LS.set("pif.seguimiento", x); }

  function ensureObsStart(seg){
    if (!seg.treatStart) return seg;
    if (!seg.obsStart){
      const t0 = parseISO(seg.treatStart);
      const d  = new Date(t0);
      d.setDate(d.getDate() + DAYS_PER_PHASE);
      seg.obsStart = fmtISO(d);
      const r = refs();
      if (r.obsStartInput) r.obsStartInput.value = seg.obsStart;
    }
    return seg;
  }

  function currentPhaseAndDay(todayISO, seg){
    if (!seg.treatStart) return { phase:"—", dayPhase:0, dayGlobal:0 };
    const today = parseISO(todayISO);
    const t0    = parseISO(seg.treatStart);
    const diffTreat = Math.floor((today - t0)/86400000) + 1; // 1-based
    if (diffTreat <= DAYS_PER_PHASE){
      return { phase:"treat", dayPhase: clamp(diffTreat,1,DAYS_PER_PHASE), dayGlobal: clamp(diffTreat,1,TOTAL_DAYS) };
    }
    const obs0   = parseISO(seg.obsStart);
    const diffObs= Math.floor((today - obs0)/86400000) + 1;
    const global = DAYS_PER_PHASE + diffObs;
    return { phase:"obs", dayPhase: clamp(diffObs,1,DAYS_PER_PHASE), dayGlobal: clamp(global,1,TOTAL_DAYS) };
  }

  function renderStats(){
    const r = refs();
    const seg = ensureObsStart(load());
    if (r.treatStartInput && seg.treatStart) r.treatStartInput.value = seg.treatStart;
    if (r.obsStartInput   && seg.obsStart)   r.obsStartInput.value   = seg.obsStart;

    const { phase, dayPhase, dayGlobal } = currentPhaseAndDay(fmtISO(new Date()), seg);
    if (r.phaseNowEl)   r.phaseNowEl.textContent   = (phase === "treat") ? t("treat") : (phase === "obs" ? t("obs") : "—");
    if (r.dayInPhaseEl) r.dayInPhaseEl.textContent = dayPhase || "—";
    if (r.dayGlobalEl)  r.dayGlobalEl.textContent  = dayGlobal || "—";

    const progress = Math.round((dayGlobal / TOTAL_DAYS) * 100);
    if (r.progressFill)  r.progressFill.style.width = `${isFinite(progress) ? progress : 0}%`;
    if (r.progressLabel) r.progressLabel.textContent = `${isFinite(progress) ? progress : 0}%`;
  }

  // Lista (solo hasta hoy)
  function buildDayList(){
    const r = refs();
    const seg = ensureObsStart(load());
    if (!r.listWrap) return;
    r.listWrap.innerHTML = "";
    if (!seg.treatStart) return;

    const startDate = new Date(`${seg.treatStart}T00:00:00`);
    const today     = new Date();
    let diffDays    = Math.floor((today - startDate) / 86400000);
    if (diffDays < 0) diffDays = 0;
    const maxIndex = Math.min(diffDays, 168 - 1);

    for (let i=0; i<=maxIndex; i++){
      const date = new Date(startDate); date.setDate(startDate.getDate() + i);
      const iso = date.toISOString().slice(0,10);
      const inObs = i >= 84;
      const dayNo = inObs ? (i - 84 + 1) : (i + 1);
      const phaseLabel = inObs ? t("obs") : t("treat");

      const taken = (seg.taken || []).includes(iso);
      const note  = seg.notes?.[iso] ?? "";
      const item = document.createElement("div");
      item.className = "day-item" + (taken ? " taken" : "");
      item.innerHTML = `
        <span class="date">${iso}</span>
        <span class="phase">${phaseLabel} #${dayNo}</span>
        <span class="note">${note ? ("📝 " + note) : ""}</span>
        <span class="actions">
          <button class="btn-take" data-date="${iso}">${taken ? "✔" : "○"}</button>
          <button class="btn-note" data-date="${iso}">📝</button>
        </span>
      `;
      r.listWrap.appendChild(item);
    }

    r.listWrap.querySelectorAll(".btn-take").forEach(b => b.addEventListener("click", (e) => {
      const d = e.currentTarget.getAttribute("data-date"); toggleTaken(d);
    }));
    r.listWrap.querySelectorAll(".btn-note").forEach(b => b.addEventListener("click", (e) => {
      const d = e.currentTarget.getAttribute("data-date"); addNoteForDate(d);
    }));
  }

  function toggleTaken(iso){
    const seg = load();
    const i = seg.taken.indexOf(iso);
    if (i>=0) seg.taken.splice(i,1); else seg.taken.push(iso);
    save(seg);
    render();
  }
  function addNoteForDate(iso){
    const seg = load();
    const current = seg.notes?.[iso] || "";
    const txt = prompt(t("notePrompt"), current || "");
    if (txt != null){
      seg.notes = seg.notes || {};
      seg.notes[iso] = txt.trim();
      save(seg);
      render();
      alert(t("saved"));
    }
  }
  function wireInputs(){
    const r = refs();
    if (r.treatStartInput){
      r.treatStartInput.addEventListener("change", () => {
        const seg = load();
        seg.treatStart = r.treatStartInput.value || null;
        if (seg.treatStart && !seg.obsStart){
          const d = new Date(`${seg.treatStart}T00:00:00`);
          d.setDate(d.getDate()+84);
          seg.obsStart = d.toISOString().slice(0,10);
          if (r.obsStartInput) r.obsStartInput.value = seg.obsStart;
        }
        save(seg);
        render();
      });
    }
    if (r.obsStartInput){
      r.obsStartInput.addEventListener("change", () => {
        const seg = load();
        seg.obsStart = r.obsStartInput.value || null;
        save(seg);
        render();
      });
    }
    if (r.btnMarkToday) r.btnMarkToday.addEventListener("click", () => toggleTaken(new Date().toISOString().slice(0,10)));
    if (r.btnAddNote)   r.btnAddNote.addEventListener("click", () => addNoteForDate(new Date().toISOString().slice(0,10)));
    if (r.btnGenDays)   r.btnGenDays.addEventListener("click", () => buildDayList());
  }

  function render(){ renderStats(); buildDayList(); }
  function init(){ wireInputs(); render(); }

  return { init, render, load };
})();










