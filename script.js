let historial = [];

// Traducciones
const traducciones = {
    es: {
        titulo: "PIF Tracker",
        dia: "Día:",
        peso: "Peso del gato (kg):",
        dosis: "Dosis diaria (mg/ml):",
        comentarios: "Comentarios / Novedades:",
        guardar: "Guardar registro",
        historial: "Historial",
        editar: "Editar",
        eliminar: "Eliminar"
    },
    en: {
        titulo: "PIF Tracker",
        dia: "Day:",
        peso: "Cat weight (kg):",
        dosis: "Daily dose (mg/ml):",
        comentarios: "Comments / Updates:",
        guardar: "Save record",
        historial: "History",
        editar: "Edit",
        eliminar: "Delete"
    }
};

// Cambiar idioma
document.getElementById("languageSelect").addEventListener("change", function() {
    cambiarIdioma(this.value);
});

function cambiarIdioma(lang) {
    document.getElementById("app-title").textContent = traducciones[lang].titulo;
    document.getElementById("lbl-fecha").textContent = traducciones[lang].dia;
    document.getElementById("lbl-peso").textContent = traducciones[lang].peso;
    document.getElementById("lbl-dosis").textContent = traducciones[lang].dosis;
    document.getElementById("lbl-comentarios").textContent = traducciones[lang].comentarios;
    document.getElementById("btn-guardar").textContent = traducciones[lang].guardar;
    document.getElementById("history-title").textContent = traducciones[lang].historial;
    mostrarHistorial();
}

// Guardar historial en localStorage
function guardarHistorial() {
    localStorage.setItem("historialPIF", JSON.stringify(historial));
}

// Mostrar historial
function mostrarHistorial() {
    const lang = document.getElementById("languageSelect").value;
    const historialDiv = document.getElementById("historial");
    historialDiv.innerHTML = "";

    historial.forEach((registro, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${registro.fecha}</strong> -
            ${registro.peso} kg -
            ${registro.dosis} mg/ml <br>
            ${registro.comentarios || ""} <br>
            <button onclick="editarRegistro(${index})">${traducciones[lang].editar}</button>
            <button onclick="eliminarRegistro(${index})">${traducciones[lang].eliminar}</button>
        `;
        historialDiv.appendChild(div);
    });
}

// Editar
function editarRegistro(index) {
    const registro = historial[index];
    document.getElementById("fecha").value = registro.fecha;
    document.getElementById("peso").value = registro.peso;
    document.getElementById("dosis").value = registro.dosis;
    document.getElementById("comentarios").value = registro.comentarios;
    historial.splice(index, 1);
    guardarHistorial();
    mostrarHistorial();
}

// Eliminar
function eliminarRegistro(index) {
    historial.splice(index, 1);
    guardarHistorial();
    mostrarHistorial();
}

// Evento submit
document.getElementById("registroForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const peso = document.getElementById("peso").value;
    const dosis = document.getElementById("dosis").value;
    const comentarios = document.getElementById("comentarios").value;

    historial.push({ fecha, peso, dosis, comentarios });
    guardarHistorial();
    mostrarHistorial();

    this.reset();
});

// Cargar historial al iniciar
document.addEventListener("DOMContentLoaded", function() {
    const guardado = localStorage.getItem("historialPIF");
    if (guardado) {
        historial = JSON.parse(guardado);
    }
    cambiarIdioma("es"); // Idioma por defecto
});
