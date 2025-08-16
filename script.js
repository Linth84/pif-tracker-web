const formaSelect = document.getElementById("calc-forma");
const tipoSelect = document.getElementById("calc-tipo");
const concContainer = document.getElementById("concentracion-container");
const concSelect = document.getElementById("calc-concentracion");
const calcForm = document.getElementById("calc-form");
const resultado = document.getElementById("calc-resultado");

// Tipos de PIF por forma
const tiposPIF = {
    inyectable: [
        { text: "Húmedo 8 mg/kg", value: 8 },
        { text: "Húmedo 10 mg/kg", value: 10 },
        { text: "Seco 10 mg/kg", value: 10 },
        { text: "Ocular 10 mg/kg", value: 10 },
        { text: "Neurológico 12 mg/kg", value: 12 },
        { text: "Neurológico 13 mg/kg", value: 13 },
        { text: "Neurológico 14 mg/kg", value: 14 },
        { text: "Neurológico 15 mg/kg", value: 15 }
    ],
    pastillas: [
        { text: "Húmedo 8 mg/kg", value: 8 },
        { text: "Húmedo 10 mg/kg", value: 10 },
        { text: "Seco 10 mg/kg", value: 10 },
        { text: "Ocular 10 mg/kg", value: 10 },
        { text: "Neurológico 12 mg/kg", value: 12 },
        { text: "Neurológico 15 mg/kg", value: 15 }
    ]
};

// Cargar opciones según forma
formaSelect.addEventListener("change", () => {
    tipoSelect.innerHTML = "";
    if (formaSelect.value === "pastillas") {
        concContainer.style.display = "block";
    } else {
        concContainer.style.display = "none";
    }
    if (tiposPIF[formaSelect.value]) {
        tiposPIF[formaSelect.value].forEach(opt => {
            let option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.text;
            tipoSelect.appendChild(option);
        });
    }
});

// Calcular dosis
calcForm.addEventListener("submit", e => {
    e.preventDefault();
    const peso = parseFloat(document.getElementById("calc-peso").value);
    const dosisMgKg = parseFloat(tipoSelect.value);

    if (formaSelect.value === "inyectable") {
        let concentracion = 15; // mg/ml fijo
        let dosisTotalMg = peso * dosisMgKg;
        let dosisMl = dosisTotalMg / concentracion;
        resultado.textContent = `Dosis: ${dosisMl.toFixed(2)} ml`;
    } else {
        let concentracion = parseFloat(concSelect.value);
        let dosisTotalMg = peso * dosisMgKg;
        let pastillas = dosisTotalMg / concentracion;

        // Redondeo a .0 o .5
        let entero = Math.floor(pastillas);
        let decimal = pastillas - entero;
        if (decimal > 0 && decimal <= 0.5) decimal = 0.5;
        else if (decimal > 0.5) { entero += 1; decimal = 0; }
        pastillas = entero + decimal;

        resultado.textContent = `Dosis: ${pastillas} pastillas`;
    }
});









