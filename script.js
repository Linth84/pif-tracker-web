/**************************************************************
 * PIF / FIP TRACKER — script.js
 *
 * ÍNDICE
 * 01. Helpers generales
 * 02. Referencias del DOM
 * 03. Tema claro / oscuro
 * 04. Traducciones ES / EN
 * 05. Datos de la calculadora
 * 06. Render de la calculadora
 * 07. Cálculo de dosis
 * 08. Registro diario + localStorage
 * 09. Bienestar diario
 * 10. Gráficos de evolución (peso + bienestar)
 * 11. Traducción dinámica
 * 12. Eventos generales
 * 13. Inicialización
 * 14. Navegación por pestañas
 * 15. Seguimiento 84 + 84
 * 16. Puentes Android
 *
 * NOTA:
 * Los gráficos se generan con SVG nativo.
 * No requiere Chart.js ni ninguna dependencia externa.
 **************************************************************/

/* =========================================================
   01. HELPERS GENERALES
   ========================================================= */
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

/* =========================================================
   02. REFERENCIAS DEL DOM
   ========================================================= */
const languageSelect = document.getElementById("languageSelect");

/* =========================================================
   03. TEMA CLARO / OSCURO
   ========================================================= */
const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.getElementById("theme-color-meta");
const systemDarkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function getStoredTheme() {
  const value = localStorage.getItem("pif.theme");
  return value === "light" || value === "dark" ? value : null;
}
function getPreferredTheme() {
  return getStoredTheme() || (systemDarkQuery?.matches ? "dark" : "light");
}
function applyTheme(theme, persist = false) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  if (themeColorMeta) themeColorMeta.setAttribute("content", nextTheme === "dark" ? "#11131b" : "#f5f6fa");
  if (themeToggle) {
    const lang = languageSelect?.value || "es";
    const label = nextTheme === "dark"
      ? (lang === "en" ? "Switch to light mode" : "Cambiar a modo claro")
      : (lang === "en" ? "Switch to dark mode" : "Cambiar a modo oscuro");
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
  }
  if (persist) localStorage.setItem("pif.theme", nextTheme);
}
applyTheme(getPreferredTheme());
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    applyTheme(current === "dark" ? "light" : "dark", true);
  });
}
if (systemDarkQuery) {
  const onSystemThemeChange = (event) => {
    if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light");
  };
  if (typeof systemDarkQuery.addEventListener === "function") systemDarkQuery.addEventListener("change", onSystemThemeChange);
  else if (typeof systemDarkQuery.addListener === "function") systemDarkQuery.addListener(onSystemThemeChange);
}

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

/* Bienestar diario
   Los botones son radios con values: good / okay / bad. */
const wellnessInputs = document.querySelectorAll('input[name="registro-bienestar"]');

/* Contenedores de los gráficos.
   Si todavía no agregaste el HTML correspondiente,
   el script simplemente los ignora sin romper la app. */
const weightChart = document.getElementById("weight-chart");
const wellnessChart = document.getElementById("wellness-chart");

/* =========================================================
   04. TRADUCCIONES ES / EN
   ========================================================= */
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
    weightUnit: "kg",
    weightUnitUpper: "KG",
    registroDosis: "Dosis:",
    registroComentarios: "Comentarios / Novedades:",

    /* Bienestar diario */
    bienestarPregunta: "¿Cómo estuvo tu michi hoy?",
    bienestarGood: "Bien",
    bienestarOkay: "Más o menos",
    bienestarBad: "Mal",
    bienestarLabel: "Bienestar:",

    /* Textos de Seguimiento 84 + 84 */
    treatStartLabel: "Inicio tratamiento",
    obsStartLabel: "Inicio observación",
    phaseDayLabel: "Día de la fase",
    totalDayLabel: "Día total",
    evolutionEyebrow: "EVOLUCIÓN",
    weightChartKicker: "PESO",
    wellnessChartKicker: "BIENESTAR",

    /* Gráficos */
    evolutionTitle: "Evolución",
    weightEvolution: "Evolución del peso",
    wellnessEvolution: "Evolución del bienestar",
    chartNeedWeight: "Registrá al menos dos controles de peso para ver la evolución.",
    chartNeedWellness: "Registrá al menos dos días de bienestar para ver la evolución.",

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
    pesoGato: "Cat weight (lb):",
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
    weightUnit: "lb",
    weightUnitUpper: "LB",
    registroDosis: "Dose:",
    registroComentarios: "Comments / Updates:",

    /* Daily wellness */
    bienestarPregunta: "How was your kitty today?",
    bienestarGood: "Good",
    bienestarOkay: "So-so",
    bienestarBad: "Bad",
    bienestarLabel: "Wellness:",

    /* 84 + 84 follow-up labels */
    treatStartLabel: "Treatment start",
    obsStartLabel: "Observation start",
    phaseDayLabel: "Phase day",
    totalDayLabel: "Total day",
    evolutionEyebrow: "EVOLUTION",
    weightChartKicker: "WEIGHT",
    wellnessChartKicker: "WELLNESS",

    /* Charts */
    evolutionTitle: "Evolution",
    weightEvolution: "Weight evolution",
    wellnessEvolution: "Wellness evolution",
    chartNeedWeight: "Add at least two weight records to see the evolution.",
    chartNeedWellness: "Add at least two wellness entries to see the evolution.",

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

/* =========================================================
   05. DATOS DE LA CALCULADORA
   ========================================================= */
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

/* =========================================================
   05.B UTILIDADES DE LA CALCULADORA
   ========================================================= */
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
/* =========================================================
   05.B UNIDADES DE PESO // KG ↔ LB

   REGLA DE DATOS:
   - Internamente SIEMPRE trabajamos y guardamos kg.
   - Español muestra/recibe kg.
   - Inglés muestra/recibe lb (pounds).

   Esto mantiene compatibles los registros viejos:
   item.peso de versiones anteriores ya estaba expresado en kg.
   ========================================================= */

const LB_TO_KG = 0.45359237;
const KG_TO_LB = 1 / LB_TO_KG;

function currentWeightUnit() {
  return (languageSelect.value || "es") === "en" ? "lb" : "kg";
}

function displayWeightFromKg(kg, lang = languageSelect.value || "es") {
  const value = Number(kg);
  if (!Number.isFinite(value)) return 0;
  return lang === "en" ? value * KG_TO_LB : value;
}

function weightInputToKg(value, lang = languageSelect.value || "es") {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return lang === "en" ? number * LB_TO_KG : number;
}

function formatWeightFromKg(kg, lang = languageSelect.value || "es") {
  const displayed = displayWeightFromKg(kg, lang);
  return `${displayed.toFixed(1)} ${lang === "en" ? "lb" : "kg"}`;
}

/* Calculadora:
   el usuario escribe kg en ES o lb en EN;
   el cálculo siempre recibe kg. */
function getPesoKg() {
  return weightInputToKg(inputPeso?.value || "0");
}

/* Actualiza los pequeños indicadores de unidad del HTML. */
function updateWeightUnitLabels() {
  const lang = languageSelect.value || "es";
  const unit = lang === "en" ? "lb" : "kg";
  const unitUpper = unit.toUpperCase();

  const calcUnit = document.getElementById("calc-weight-unit");
  const regUnit = document.getElementById("registro-weight-unit");
  const chartUnit = document.getElementById("weight-chart-unit");

  if (calcUnit) calcUnit.textContent = unit;
  if (regUnit) regUnit.textContent = unit;
  if (chartUnit) chartUnit.textContent = unitUpper;
}

/* Si el usuario cambia ES ↔ EN con un peso ya escrito,
   convertimos el número visible para conservar el mismo peso real. */
function convertVisibleWeightInputs(fromLang, toLang) {
  if (fromLang === toLang) return;

  [inputPeso, regPeso].forEach(input => {
    if (!input || input.value === "") return;

    const raw = Number(input.value);
    if (!Number.isFinite(raw) || raw <= 0) return;

    const kg = weightInputToKg(raw, fromLang);
    const converted = displayWeightFromKg(kg, toLang);

    input.value = converted.toFixed(1);
  });
}

/* =========================================================
   06. RENDER DE LA CALCULADORA
   ========================================================= */
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

/* =========================================================
   07. CÁLCULO DE DOSIS
   ========================================================= */
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
      resultado.textContent = `${ml.toFixed(2)} ${t("ml")}`;
    } else {
      const raw = (peso * d) / c * 2;
      const tabs = roundTabletsRule(raw);
      resultado.textContent = `${tabs} ${t("tablets")}`;
    }
  } else if (forma === "inyectable") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    conc = 15;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")}`;
  } else if (forma === "pastillas") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    const concSel = document.getElementById("calc-concentracion");
    conc = parseFloat(concSel ? concSel.value : "15");
    const raw = (peso * dosisMgKg) / conc * 2;
    const tabs = roundTabletsRule(raw);
    resultado.textContent = `${tabs} ${t("tablets")}`;
  } else if (forma === "oral") {
    dosisMgKg = parseFloat(tipoSelect?.value || "0");
    conc = 50;
    const ml = (peso * dosisMgKg) / conc;
    resultado.textContent = `${ml.toFixed(2)} ${t("ml")}`;
  }
}

/* =========================================================
   08. REGISTRO DIARIO + LOCALSTORAGE
   ========================================================= */

/* =========================================================
   09. BIENESTAR DIARIO

   El usuario ve:
   😺 Bien / Good
   😐 Más o menos / So-so
   😿 Mal / Bad

   Internamente usamos:
   good = 1
   okay = 0
   bad  = -1

   El número nunca se muestra al usuario. Solo sirve
   para dibujar la línea de evolución.
   ========================================================= */

const WELLNESS_VALUES = {
  good: 1,
  okay: 0,
  bad: -1
};

function getSelectedWellness() {
  const selected = document.querySelector(
    'input[name="registro-bienestar"]:checked'
  );

  return selected?.value || "";
}

function clearSelectedWellness() {
  wellnessInputs.forEach(input => {
    input.checked = false;
  });
}

function wellnessText(value) {
  if (value === "good") return t("bienestarGood");
  if (value === "okay") return t("bienestarOkay");
  if (value === "bad") return t("bienestarBad");
  return "—";
}

function wellnessEmoji(value) {
  if (value === "good") return "😺";
  if (value === "okay") return "😐";
  if (value === "bad") return "😿";
  return "";
}


/* =========================================================
   10. GRÁFICOS DE EVOLUCIÓN

   - Gráfico 1: peso registrado a lo largo del tiempo.
   - Gráfico 2: bienestar diario percibido.

   Se usa SVG nativo:
   - no instala dependencias;
   - funciona offline;
   - funciona dentro del WebView Android;
   - responde al modo claro / oscuro mediante CSS.
   ========================================================= */

const SVG_NS = "http://www.w3.org/2000/svg";

function parseHistoryDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortedHistory() {
  const data = JSON.parse(
    localStorage.getItem("pif_historial") || "[]"
  );

  return data
    .map(item => ({
      ...item,
      _date: parseHistoryDate(item.fecha)
    }))
    .filter(item => item._date)
    .sort((a, b) => a._date - b._date);
}

function shortDateLabel(iso) {
  if (!iso) return "";

  const [year, month, day] = iso.split("-");

  return (languageSelect.value || "es") === "en"
    ? `${month}/${day}`
    : `${day}/${month}`;
}

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });

  return el;
}

/**
 * Dibuja una línea simple dentro de un contenedor.
 *
 * config:
 * - points: [{ date, value }]
 * - minY / maxY: límites verticales
 * - formatY: texto del eje Y
 * - emptyText: mensaje si hay menos de 2 registros
 * - fixedTicks: valores concretos del eje Y (opcional)
 */
function renderLineChart(container, config) {
  if (!container) return;

  container.innerHTML = "";

  const {
    points,
    minY,
    maxY,
    formatY,
    emptyText,
    fixedTicks
  } = config;

  if (!points || points.length < 2) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  const width = 600;
  const height = 220;

  const padding = {
    top: 20,
    right: 20,
    bottom: 38,
    left: 56
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const svg = createSvgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-hidden": "true",
    preserveAspectRatio: "xMidYMid meet"
  });

  svg.classList.add("evolution-chart-svg");

  /* -------------------------------------------------------
     Escalas X / Y
     ------------------------------------------------------- */

  const xFor = index => (
    points.length === 1
      ? padding.left + plotWidth / 2
      : padding.left +
        (index / (points.length - 1)) * plotWidth
  );

  const safeRange = maxY - minY || 1;

  const yFor = value => (
    padding.top +
    ((maxY - value) / safeRange) * plotHeight
  );


  /* -------------------------------------------------------
     Líneas horizontales + etiquetas del eje Y
     ------------------------------------------------------- */

  const ticks = fixedTicks || [
    maxY,
    minY + safeRange / 2,
    minY
  ];

  ticks.forEach(value => {
    const y = yFor(value);

    const grid = createSvgElement("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: y,
      y2: y
    });

    grid.classList.add("chart-grid-line");
    svg.appendChild(grid);

    const label = createSvgElement("text", {
      x: padding.left - 10,
      y: y + 4,
      "text-anchor": "end"
    });

    label.classList.add("chart-axis-label");
    label.textContent = formatY(value);
    svg.appendChild(label);
  });


  /* -------------------------------------------------------
     Línea principal
     ------------------------------------------------------- */

  const coordinates = points.map((point, index) => ({
    x: xFor(index),
    y: yFor(point.value),
    point
  }));

  const pathData = coordinates
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const path = createSvgElement("path", {
    d: pathData,
    fill: "none"
  });

  path.classList.add("chart-line");
  svg.appendChild(path);


  /* -------------------------------------------------------
     Puntos de cada registro
     ------------------------------------------------------- */

  coordinates.forEach(({ x, y }) => {
    const dot = createSvgElement("circle", {
      cx: x,
      cy: y,
      r: 4.5
    });

    dot.classList.add("chart-point");
    svg.appendChild(dot);
  });


  /* -------------------------------------------------------
     Fechas del primer y último punto
     ------------------------------------------------------- */

  const first = points[0];
  const last = points[points.length - 1];

  const firstLabel = createSvgElement("text", {
    x: padding.left,
    y: height - 10,
    "text-anchor": "start"
  });

  firstLabel.classList.add("chart-axis-label");
  firstLabel.textContent = shortDateLabel(first.date);
  svg.appendChild(firstLabel);

  const lastLabel = createSvgElement("text", {
    x: width - padding.right,
    y: height - 10,
    "text-anchor": "end"
  });

  lastLabel.classList.add("chart-axis-label");
  lastLabel.textContent = shortDateLabel(last.date);
  svg.appendChild(lastLabel);

  container.appendChild(svg);
}


function renderWeightChart(history) {
  if (!weightChart) return;

  const lang = languageSelect.value || "es";

  /* item.peso se conserva SIEMPRE en kg.
     Para EN convertimos únicamente el valor que se dibuja. */
  const points = history
    .filter(item =>
      Number.isFinite(Number(item.peso)) &&
      Number(item.peso) > 0
    )
    .map(item => ({
      date: item.fecha,
      value: displayWeightFromKg(Number(item.peso), lang)
    }));

  if (points.length < 2) {
    renderLineChart(weightChart, {
      points,
      minY: 0,
      maxY: 1,
      formatY: value => String(value),
      emptyText: t("chartNeedWeight")
    });
    return;
  }

  const values = points.map(point => point.value);
  let minY = Math.min(...values);
  let maxY = Math.max(...values);

  const range = maxY - minY;
  const padding = range > 0
    ? range * 0.18
    : (lang === "en" ? 0.5 : 0.25);

  minY = Math.max(0, minY - padding);
  maxY = maxY + padding;

  renderLineChart(weightChart, {
    points,
    minY,
    maxY,
    formatY: value =>
      `${value.toFixed(1)} ${lang === "en" ? "lb" : "kg"}`,
    emptyText: t("chartNeedWeight")
  });
}


function renderWellnessChart(history) {
  if (!wellnessChart) return;

  const points = history
    .filter(item =>
      Object.prototype.hasOwnProperty.call(
        WELLNESS_VALUES,
        item.bienestar
      )
    )
    .map(item => ({
      date: item.fecha,
      value: WELLNESS_VALUES[item.bienestar]
    }));

  renderLineChart(wellnessChart, {
    points,
    minY: -1,
    maxY: 1,
    fixedTicks: [1, 0, -1],
    formatY: value => {
      if (value === 1) return `😺 ${t("bienestarGood")}`;
      if (value === 0) return `😐 ${t("bienestarOkay")}`;
      return `😿 ${t("bienestarBad")}`;
    },
    emptyText: t("chartNeedWellness")
  });
}


function renderCharts() {
  const history = sortedHistory();

  renderWeightChart(history);
  renderWellnessChart(history);
}


function loadHistorial() {
  if (!historialList) return;
  const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
  historialList.innerHTML = "";
  data.forEach((item, idx) => {
    const li = document.createElement("div");
    li.classList.add("historial-item");
    li.innerHTML = `
      <div><strong>${item.fecha || "-"}</strong></div>
      <div>${t("registroPeso")} ${item.peso ? formatWeightFromKg(item.peso) : "-"}</div>
      <div>${t("registroDosis")} ${item.dosis ?? "-"}</div>
      <div class="historial-wellness">
        ${t("bienestarLabel")}
        <span class="wellness-history-value wellness-${item.bienestar || "none"}">
          ${wellnessEmoji(item.bienestar)} ${wellnessText(item.bienestar)}
        </span>
      </div>
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
        <div class="history-edit-weight">
          <input
            type="number"
            step="0.1"
            id="e_peso"
            value="${item.peso ? displayWeightFromKg(item.peso).toFixed(1) : ""}"
          >
          <span>${currentWeightUnit()}</span>
        </div>
        <div><input type="text" id="e_dosis" value="${item.dosis ?? ""}"></div>

        <div>
          <select id="e_bienestar">
            <option value="">${t("bienestarLabel")} —</option>
            <option value="good" ${item.bienestar === "good" ? "selected" : ""}>
              😺 ${t("bienestarGood")}
            </option>
            <option value="okay" ${item.bienestar === "okay" ? "selected" : ""}>
              😐 ${t("bienestarOkay")}
            </option>
            <option value="bad" ${item.bienestar === "bad" ? "selected" : ""}>
              😿 ${t("bienestarBad")}
            </option>
          </select>
        </div>

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
        /* El editor muestra kg o lb según el idioma,
           pero el almacenamiento vuelve siempre a kg. */
        it.peso = weightInputToKg(
          document.getElementById("e_peso").value || "0"
        );
        it.dosis = document.getElementById("e_dosis").value || "";
        it.bienestar = document.getElementById("e_bienestar")?.value || "";
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

  /* Cada vez que cambia el historial,
     actualizamos también ambos gráficos. */
  renderCharts();
}

if (registroForm) {
  registroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fechaElegida = (regDia?.value || "").trim();
    const item = {
      fecha: fechaElegida || todayISO(),   // Fallback si está vacío
      /* El usuario puede escribir kg (ES) o lb (EN).
         Guardamos SIEMPRE kg para mantener una única fuente de verdad. */
      peso: weightInputToKg(regPeso?.value || "0"),
      dosis: regDosis?.value || "",
      bienestar: getSelectedWellness(),
      comentarios: regComentarios?.value || ""
    };
    const data = JSON.parse(localStorage.getItem("pif_historial") || "[]");
    data.unshift(item);
    localStorage.setItem("pif_historial", JSON.stringify(data));
    registroForm.reset();
    clearSelectedWellness();

    if (regDia) {
      regDia.value = todayISO();
    }

    loadHistorial();
  });
}

/* =========================================================
   11. TRADUCCIÓN DINÁMICA
   ========================================================= */
function applyTranslations() {
  setElementTextByTranslateAttr();
  updateWeightUnitLabels();

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

/* =========================================================
   12. EVENTOS GENERALES
   ========================================================= */
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
  /* Guardamos el idioma anterior para poder convertir
     cualquier peso que el usuario tenga escrito al cambiar ES ↔ EN. */
  let previousLanguage = languageSelect.value || "es";

  languageSelect.addEventListener("change", () => {
    const nextLanguage = languageSelect.value || "es";

    convertVisibleWeightInputs(previousLanguage, nextLanguage);
    previousLanguage = nextLanguage;

    applyTranslations();
    applyTheme(
      document.documentElement.getAttribute("data-theme") ||
      getPreferredTheme()
    );

    if (formaSelect?.value !== "custom") {
      renderConcentrationUI();
    }

    /* Historial y gráficos se vuelven a dibujar con kg o lb. */
    loadHistorial();
    Seguimiento.render();
  });
}

/* =========================================================
   13. INICIALIZACIÓN
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  if (!languageSelect.value) languageSelect.value = "es";
  applyTranslations();
  updateWeightUnitLabels();
  if (formaSelect) formaSelect.value = "inyectable";
  renderAllForForma();
  if (regDia && !regDia.value) regDia.value = todayISO(); // fecha por defecto en Registro
  loadHistorial();
  Tabs.init();
  Seguimiento.init();
});

/* =========================================================
   14. NAVEGACIÓN POR PESTAÑAS
   ========================================================= */
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
      if (regDia && !regDia.value) {
        regDia.value = todayISO();
      }

      /* Refrescamos al entrar a Registro para que
         los SVG usen siempre el tamaño correcto. */
      window.requestAnimationFrame(renderCharts);
    }

    // 👉 Avisar a Android para intentar interstitial (con cooldown de 90s)
    if (window.Android && Android.onTabChanged) {
      Android.onTabChanged();
    }
  }
  function init(){
    $$("#tabs .tab-btn").forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));
    const last = JSON.parse(localStorage.getItem("pif.tab") || "null") || "calc";
    setActiveTab(last);
  }
  return { init, setActiveTab };
})();

/* =========================================================
   15. SEGUIMIENTO 84 + 84
   ========================================================= */
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

/* =========================================================
   16. PUENTES ANDROID
   ========================================================= */
/** Android llama a Android.onCalculate() → MainActivity muestra ad → luego llama a doCalculate() */
function doCalculate() {
  // Enviar el formulario de la calculadora
  if (calcForm && typeof calcForm.requestSubmit === "function") calcForm.requestSubmit();
  else if (calcForm) calcForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
}
/** Android llama a Android.onSaveRecord() → MainActivity muestra ad → luego llama a doSaveRecord() */
function doSaveRecord() {
  if (registroForm && typeof registroForm.requestSubmit === "function") registroForm.requestSubmit();
  else if (registroForm) registroForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
}










