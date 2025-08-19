/******************************
 * PIF/FIP Tracker – script.js
 ******************************/

// ---------- Elementos de UI ----------
const languageSelect = document.getElementById("languageSelect");

// Calculadora
const calcForm = document.getElementById("calc-form");
const formaSelect = document.getElementById("calc-forma");
const tipoContainer = document.getElementById("tipo-container");
const tipoSelect = document.getElementById("calc-tipo");
const concContainer = document.getElementById("concentracion-container");

const customFields = document.getElementById("custom-fields");
const customSubforma = document.getElementById("custom-subforma");
const customDosage = document.getElementById("custom-dosage");
const customConcentration = document.getElementById("custom-concentration");

const inputPeso = document.getElementById("calc-peso");
const resultado = document.getElementById("calc-resultado");

// Registro / historial
const registroForm = document.getElementById("registro-form");
const regDia = document.getElementById("registro-dia");
const regPeso = document.getElementById("registro-peso");
const regDosis = document.getElementById("registro-dosis");
const regComentarios = document.getElementById("registro-comentarios");
const historialList = document.getElementById("historial");

// ---------- i18n ----------
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
    // Etiquetas Custom
    subformaLabel: "Modo personalizado:",
    customDosage: "Dosaje (mg/kg):",
    customConcentration: "Concentración:",
    // Términos para tipos
    terms: {
      wet: "Húmedo",
      dry: "Seco",
      ocular: "Ocular",
      neuro: "Neurológico"
    },
    // Unidades
    ml: "ml",
    tablets: "pastillas",
    // Historial
    historialTitle: "Historial",
    registroDia: "Día:",
    registroPeso: "Peso:",
    registroDosis: "Dosis:",
    registroComentarios: "Comentarios / Novedades:",
    btnGuardar: "Guardar registro",
    editar: "✏️ Editar",
    borrar: "🗑️ Borrar",
    guardar: "💾 Guardar",
    cancelar: "✖️ Cancelar"
  },
  en: {
    calcTitle: "FIP Tracker",
    formAdmin: "Administration form:",
    inyectable: "Injectable",
    pastillas: "Tablets",
    oral: "Oral (liquid)",
    custom: "Custom",
    tipoPIF: "Type of FIP:",
    pesoGato: "Cat weight (lbs):",  // 👈 ahora muestra libras
    concentracion: "Concentration:",
    concentracionUnitsMl: "mg/ml",
    concentracionUnitsTab: "mg per tablet",
    btnCalcular: "Calculate",
    advertencia: "Calculator is only an estimate — always consult your veterinarian.",
    subformaLabel: "Custom mode:",
    customDosage: "Dosage (mg/kg):",
    customConcentration: "Concentration:",
    terms: {
      wet: "Wet",
      dry: "Dry",
      ocular: "Ocular",
      neuro: "Neurological"
    },
    ml: "ml",
    tablets: "tablets",
    historialTitle: "History",
    registroDia: "Day:",
    registroPeso: "Weight:",
    registroDosis: "Dose:",
    registroComentarios: "Comments / Updates:",
    btnGuardar: "Save record",
    editar: "✏️ Edit",
    borrar: "🗑️ Delete",
    guardar: "💾 Save",
    cancelar: "✖️ Cancel"
  }
};

// ---------- Datos de tipos ----------
const TYPES_INYECTABLE = [
  { cat: "wet", dose: 8 },
  { cat: "wet", dose: 9 },
  { cat: "wet", dose: 10 },
  { cat: "dry", dose: 10 },
  { cat: "ocular", dose: 10 },
  { cat: "neuro", dose: 12 },
  { cat: "neuro", dose: 13 },
  { cat: "neuro", dose: 14 },
  { cat: "neuro", dose: 15 }
];

const TYPES_TABLETS_ORAL = [
  { cat: "wet", dose: 8 },
  { cat: "wet", dose: 10 },
  { cat: "dry", dose: 10 },
  { cat: "ocular", dose: 10 },
  { cat: "neuro", dose: 12 },
  { cat: "neuro", dose: 15 }
];

// ---------- Utilidades ----------
const t = (key) => i18n[languageSelect.value || "es"][key];

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

function setElementTextByTranslateAttr() {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    if (i18n[languageSelect.value][key] !== undefined) {
      el.textContent = i18n[languageSelect.value][key];
    }
  });
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// Convertir input a kg según idioma
function getPesoKg() {
  let peso = parseFloat(inputPeso.value || "0");
  if (languageSelect.value === "en") {
    peso = peso * 0.45359237; // convertir de lbs a kg
  }
  return peso;
}

// ---------- Render dinámico ----------
function renderTipoOptions() {
  clearChildren(tipoSelect);
  const forma = formaSelect.value;
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
  clearChildren(concContainer);
  const label = document.createElement("label");
  label.setAttribute("data-translate", "concentracion");
  label.textContent = t("concentracion");

  const select = document.createElement("select");
  select.id = "calc-concentracion";
  const forma = formaSelect.value;

  if (forma === "inyectable") {
    const opt = document.createElement("option");
    opt.value = "15";
    opt.textContent = "15 mg/ml";
    select.appendChild(opt);
  } else if (forma === "pastillas") {
    const opt15 = document.createElement("option");
    opt15.value = "15"; opt15.textContent = "15 mg";
    const opt30 = document.createElement("option");
    opt30.value = "30"; opt30.textContent = "30 mg";
    select.appendChild(opt15); select.appendChild(opt30);
  } else if (forma === "oral") {
    const opt = document.createElement("option");
    opt.value = "50"; opt.textContent = "50 mg/ml";
    select.appendChild(opt);
  } else return;

  concContainer.appendChild(label);
  concContainer.appendChild(select);
}

function setTipoVisibility() {
  tipoContainer.style.display = (formaSelect.value === "custom") ? "none" : "";
}
function setCustomVisibility() {
  customFields.style.display = (formaSelect.value === "custom") ? "" : "none";
}
function renderAllForForma() {
  setTipoVisibility();
  setCustomVisibility();
  if (formaSelect.value !== "custom") {
    renderTipoOptions();
    renderConcentrationUI();
  } else {
    clearChildren(concContainer);
  }
}

// ---------- Cálculo ----------
function calcular() {
  const forma = formaSelect.value;
  const peso = getPesoKg(); // siempre en kg
  resultado.textContent = "";

  if (!peso || peso <= 0) {
    resultado.textContent = "—"; return;
  }

  let dosisMgKg = 0, conc = 0;

  if (forma === "custom") {
    const sub = customSubforma.value;
    const d = parseFloat(customDosage.value || "0");
    const c = parseFloat(customConcentration.value || "0");
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
    dosisMgKg = parseFloat(tipoSelect.value || "0");
    conc = 15;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")} — ${t("advertencia")}`;
  } else if (forma === "pastillas") {
    dosisMgKg = parseFloat(tipoSelect.value || "0");
    const concSel = document.getElementById("calc-concentracion");
    conc = parseFloat(concSel ? concSel.value : "15");
    const raw = (peso * dosisMgKg) / conc * 2;
    const tabs = roundTabletsRule(raw);
    resultado.textContent = `${tabs} ${t("tablets")} — ${t("advertencia")}`;
  } else if (forma === "oral") {
    dosisMgKg = parseFloat(tipoSelect.value || "0");
    conc = 50;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")} — ${t("advertencia")}`;
  }
}

// ---------- Registro / Historial ----------
function loadHistorial() {
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
        item.fecha = document.getElementById("e_fecha").value;
        item.peso = parseFloat(document.getElementById("e_peso").value || "0");
        item.dosis = document.getElementById("e_dosis").value || "";
        item.comentarios = document.getElementById("e_comentarios").value || "";
        data[idx] = item;
        localStorage.setItem("pif_historial", JSON.stringify(data));
        loadHistorial();
      });
      li.querySelector(".cancel").addEventListener("click", loadHistorial);
    });
    li.querySelector(".delete").addEventListener("click", () => {
      data.splice(idx, 1);
      localStorage.setItem("pif_historial", JSON.stringify(data));
      loadHistorial();
    });
    historialList.appendChild(li);
  });
}

if (registroForm) {
  registroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const item = {
      fecha: regDia.value,
      peso: parseFloat(regPeso.value || "0"),
      dosis: regDosis.value || "",
      comentarios: regComentarios.value || ""
    };
    const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
    data.unshift(item);
    localStorage.setItem("pif_historial", JSON.stringify(data));
    registroForm.reset();
    loadHistorial();
  });
}

// ---------- Traducción dinámica ----------
function applyTranslations() {
  setElementTextByTranslateAttr();
  if (formaSelect.value !== "custom") renderTipoOptions();
  if (customSubforma) {
    Array.from(customSubforma.options).forEach(opt => {
      const k = opt.getAttribute("data-translate");
      if (k && i18n[languageSelect.value][k]) {
        opt.textContent = i18n[languageSelect.value][k];
      }
    });
  }
  loadHistorial();
}

// ---------- Eventos ----------
if (calcForm) {
  calcForm.addEventListener("submit", e => { e.preventDefault(); calcular(); });
}
if (formaSelect) formaSelect.addEventListener("change", renderAllForForma);
if (customSubforma) {
  customSubforma.addEventListener("change", () => {
    const lang = languageSelect.value;
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
    if (formaSelect.value !== "custom") renderConcentrationUI();
  });
}

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", () => {
  if (!languageSelect.value) languageSelect.value = "es";
  applyTranslations();
  if (formaSelect) formaSelect.value = "inyectable";
  renderAllForForma();
  loadHistorial();
});


