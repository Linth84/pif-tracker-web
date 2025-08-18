// ===================== Elementos base =====================
const languageSelect = document.getElementById("languageSelect");

// Calculadora
const formaSelect = document.getElementById("calc-forma");
const tipoSelect = document.getElementById("calc-tipo");
const concContainer = document.getElementById("concentracion-container");
const concSelect = document.getElementById("calc-concentracion");
const calcForm = document.getElementById("calc-form");
const resultado = document.getElementById("calc-resultado");

// Registro / Historial
const registroForm = document.getElementById("registroForm");
const historialDiv = document.getElementById("historial");

// ===================== Traducciones =====================
const i18n = {
  es: {
    languageLabel: "Idioma / Language:",
    calcTitle: "Calculadora de dosis",
    formAdmin: "Forma de administración:",
    injectable: "Inyectable",
    tablets: "Pastillas",
    tipoPIF: "Tipo de PIF:",
    pesoGato: "Peso del gato (kg):",
    concentracion: "Concentración (mg):",
    btnCalcular: "Calcular",
    resultadoLabel: "Dosis:",
    advertencia: "La calculadora es solo un estimado, consulte siempre a su veterinario/a.",
    // Registro
    registroDia: "Día:",
    registroPeso: "Peso del gato (kg):",
    registroDosis: "Dosis diaria (mg/ml):",
    registroComentarios: "Comentarios / Novedades:",
    btnGuardar: "Guardar registro",
    historialTitle: "Historial",
    // Acciones
    editar: "✏️ Editar",
    eliminar: "🗑️ Eliminar",
    guardar: "💾 Guardar",
    cancelar: "✖️ Cancelar",
    // Unidades
    unidadesMl: "ml",
    unidadesTablets: "pastillas",
    // Tipos (etiquetas visibles)
    pif: {
      wet8: "Húmedo 8 mg/kg",
      wet10: "Húmedo 10 mg/kg",
      dry10: "Seco 10 mg/kg",
      ocular10: "Ocular 10 mg/kg",
      neuro12: "Neurológico 12 mg/kg",
      neuro13: "Neurológico 13 mg/kg",
      neuro14: "Neurológico 14 mg/kg",
      neuro15: "Neurológico 15 mg/kg"
    }
  },
  en: {
    languageLabel: "Language:",
    calcTitle: "Dosage Calculator",
    formAdmin: "Administration form:",
    injectable: "Injectable",
    tablets: "Tablets",
    tipoPIF: "Type of FIP:",
    pesoGato: "Cat weight (kg):",
    concentracion: "Concentration (mg):",
    btnCalcular: "Calculate",
    resultadoLabel: "Dosage:",
    advertencia: "This calculator is only an estimate; always consult your veterinarian.",
    // Registro
    registroDia: "Day:",
    registroPeso: "Cat weight (kg):",
    registroDosis: "Daily dose (mg/ml):",
    registroComentarios: "Comments / Updates:",
    btnGuardar: "Save record",
    historialTitle: "History",
    // Acciones
    editar: "✏️ Edit",
    eliminar: "🗑️ Delete",
    guardar: "💾 Save",
    cancelar: "✖️ Cancel",
    // Unidades
    unidadesMl: "ml",
    unidadesTablets: "tablets",
    // Tipos
    pif: {
      wet8: "Wet 8 mg/kg",
      wet10: "Wet 10 mg/kg",
      dry10: "Dry 10 mg/kg",
      ocular10: "Ocular 10 mg/kg",
      neuro12: "Neurological 12 mg/kg",
      neuro13: "Neurological 13 mg/kg",
      neuro14: "Neurological 14 mg/kg",
      neuro15: "Neurological 15 mg/kg"
    }
  }
};

// ===================== Tipos por forma =====================
const PIF_TYPES = {
  inyectable: [
    { key: "wet8", dose: 8 },
    { key: "wet10", dose: 10 },
    { key: "dry10", dose: 10 },
    { key: "ocular10", dose: 10 },
    { key: "neuro12", dose: 12 },
    { key: "neuro13", dose: 13 },
    { key: "neuro14", dose: 14 },
    { key: "neuro15", dose: 15 }
  ],
  pastillas: [
    { key: "wet8", dose: 8 },
    { key: "wet10", dose: 10 },
    { key: "dry10", dose: 10 },
    { key: "ocular10", dose: 10 },
    { key: "neuro12", dose: 12 },
    { key: "neuro15", dose: 15 }
  ]
};

// ===================== Utilidades =====================
const t = (key) => i18n[languageSelect.value][key];

function translateStaticTexts() {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    const txt = i18n[languageSelect.value][key];
    if (txt) el.textContent = txt;
  });
}

function ceilToHalf(x) {
  // redondear SIEMPRE hacia arriba al múltiplo 0.5
  return Math.ceil((x - 1e-9) * 2) / 2;
}

// ===================== Poblar selects =====================
function populateForma() {
  const lang = languageSelect.value;
  formaSelect.innerHTML = "";
  const optIny = document.createElement("option");
  optIny.value = "inyectable";
  optIny.textContent = i18n[lang].injectable;

  const optTab = document.createElement("option");
  optTab.value = "pastillas";
  optTab.textContent = i18n[lang].tablets;

  formaSelect.appendChild(optIny);
  formaSelect.appendChild(optTab);
}

function populateTipos() {
  const lang = languageSelect.value;
  const forma = formaSelect.value;
  tipoSelect.innerHTML = "";

  // Mostrar/ocultar concentración según forma
  concContainer.style.display = (forma === "pastillas") ? "block" : "none";

  (PIF_TYPES[forma] || []).forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.dose;      // valor numérico de mg/kg
    opt.dataset.key = item.key; // clave para traducir
    opt.textContent = i18n[lang].pif[item.key];
    tipoSelect.appendChild(opt);
  });
}

function refreshTipoLabels() {
  const lang = languageSelect.value;
  Array.from(tipoSelect.options).forEach(opt => {
    const k = opt.dataset.key;
    if (k && i18n[lang].pif[k]) {
      opt.textContent = i18n[lang].pif[k];
    }
  });
}

// ===================== Cálculo =====================
calcForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const peso = parseFloat(document.getElementById("calc-peso").value || "0");
  if (!peso || peso <= 0) {
    resultado.textContent = t("resultadoLabel") + " —";
    return;
  }

  const dosisMgKg = parseFloat(tipoSelect.value);

  if (formaSelect.value === "inyectable") {
    // 15 mg/ml fijo
    const ml = (peso * dosisMgKg) / 15;
    resultado.innerHTML = `${t("resultadoLabel")} ${ml.toFixed(2)} ${t("unidadesMl")} <span class="calc-warning"> ${t("advertencia")}</span>`;
  } else {
    // Pastillas: usar mg efectivos por tableta según concentración
    // 15 mg ⇒ 8 mg efectivos/tab; 30 mg ⇒ 16 mg efectivos/tab
    const conc = parseFloat(concSelect.value || "15");
    const mgEfectivos = (conc === 15) ? 8 : 16;

    const rawTabs = (peso * dosisMgKg) / mgEfectivos;
    const tabs = ceilToHalf(rawTabs);

    resultado.innerHTML = `${t("resultadoLabel")} ${tabs} ${t("unidadesTablets")} <span class="calc-warning"> ${t("advertencia")}</span>`;
  }

  // Mostrar anuncio (si corre dentro de Android)
  try {
    if (window.Android && typeof window.Android.showAd === "function") {
      window.Android.showAd();
    }
  } catch (_) {}
});

// ===================== Registro & Historial =====================
function loadHistorial() {
  const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
  historialDiv.innerHTML = "";
  data.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "historial-item";

    const left = document.createElement("div");
    left.innerHTML = `
      <div><strong>${item.fecha}</strong></div>
      <div>${i18n[languageSelect.value].registroPeso} ${item.peso} kg</div>
      <div>${i18n[languageSelect.value].registroDosis} ${item.dosis}</div>
      <div>${i18n[languageSelect.value].registroComentarios} ${item.comentarios || "-"}</div>
    `;

    const btns = document.createElement("div");
    btns.className = "historial-btns";

    const bEdit = document.createElement("button");
    bEdit.className = "edit";
    bEdit.textContent = i18n[languageSelect.value].editar;

    const bDel = document.createElement("button");
    bDel.className = "delete";
    bDel.textContent = i18n[languageSelect.value].eliminar;

    bEdit.addEventListener("click", () => startEdit(idx));
    bDel.addEventListener("click", () => deleteItem(idx));

    btns.appendChild(bEdit);
    btns.appendChild(bDel);

    row.appendChild(left);
    row.appendChild(btns);
    historialDiv.appendChild(row);
  });
}

function startEdit(index) {
  const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
  const item = data[index];
  if (!item) return;

  const rows = historialDiv.querySelectorAll(".historial-item");
  const row = rows[index];
  row.innerHTML = "";

  const left = document.createElement("div");
  left.style.flex = "1";
  left.innerHTML = `
    <div><input type="date" id="e_fecha" value="${item.fecha}"></div>
    <div><input type="number" step="0.01" id="e_peso" value="${item.peso}"></div>
    <div><input type="number" step="0.01" id="e_dosis" value="${item.dosis}"></div>
    <div><textarea id="e_comentarios" rows="2">${item.comentarios || ""}</textarea></div>
  `;

  const btns = document.createElement("div");
  btns.className = "historial-btns";

  const bSave = document.createElement("button");
  bSave.className = "edit";
  bSave.textContent = i18n[languageSelect.value].guardar;

  const bCancel = document.createElement("button");
  bCancel.className = "delete";
  bCancel.textContent = i18n[languageSelect.value].cancelar;

  bSave.addEventListener("click", () => {
    item.fecha = document.getElementById("e_fecha").value;
    item.peso = parseFloat(document.getElementById("e_peso").value || "0");
    item.dosis = parseFloat(document.getElementById("e_dosis").value || "0");
    item.comentarios = document.getElementById("e_comentarios").value || "";
    data[index] = item;
    localStorage.setItem("pif_historial", JSON.stringify(data));
    loadHistorial();
  });

  bCancel.addEventListener("click", loadHistorial);

  btns.appendChild(bSave);
  btns.appendChild(bCancel);

  row.appendChild(left);
  row.appendChild(btns);
}

function deleteItem(index) {
  const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
  data.splice(index, 1);
  localStorage.setItem("pif_historial", JSON.stringify(data));
  loadHistorial();
}

if (registroForm) {
  registroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const item = {
      fecha: document.getElementById("fecha").value,
      peso: parseFloat(document.getElementById("peso").value || "0"),
      dosis: parseFloat(document.getElementById("dosis").value || "0"),
      comentarios: document.getElementById("comentarios").value || ""
    };
    const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
    data.unshift(item);
    localStorage.setItem("pif_historial", JSON.stringify(data));
    registroForm.reset();
    loadHistorial();

    // Anuncio al guardar (Android)
    try {
      if (window.Android && typeof window.Android.showAd === "function") {
        window.Android.showAd();
      }
    } catch (_) {}
  });
}

// ===================== Idioma y arranque =====================
function applyTranslations() {
  translateStaticTexts();
  populateForma();     // inyecta etiquetas traducidas
  populateTipos();     // inyecta tipos traducidos
  refreshTipoLabels(); // por si ya existían
  loadHistorial();     // refresca textos en historial
}

languageSelect.addEventListener("change", applyTranslations);
formaSelect.addEventListener("change", populateTipos);

window.addEventListener("DOMContentLoaded", () => {
  // por defecto ES + inyectable
  languageSelect.value = "es";
  applyTranslations();
  formaSelect.value = "inyectable";
  populateTipos(); // asegura que aparezcan las opciones desde el inicio
});



