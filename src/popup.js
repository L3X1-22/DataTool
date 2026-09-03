import { runDataPipeline } from "./pipeline.js";

/*
  Dark/light theme handler
*/
const toggle = document.getElementById("themeToggle");

toggle.checked = localStorage.getItem("theme") === "dark";
if (toggle.checked) document.documentElement.setAttribute("data-theme", "dark");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("theme", toggle.checked ? "dark" : "light");
});

/*
  Local mode handler (Fetch <-> Upload en Celda 1)
*/
const localModeToggle = document.getElementById("localModeToggle");
const sourcesGrid = document.getElementById("sourcesGrid");
const dateSection = document.getElementById("dateSection");

localModeToggle.addEventListener("change", () => {
  const isLocal = localModeToggle.checked;
  sourcesGrid.dataset.mode = isLocal ? "local" : "fetch";

  if (dateSection) {
    dateSection.style.display = isLocal ? "none" : "block";
  }
});

/* 
  Event Handlers
*/
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", async () => {
  const isTestMode = localModeToggle.checked;
  const dateInputEl = document.getElementById("date");

  const fileSource1El = document.getElementById("fileSource1");
  const fileSource2El = document.getElementById("fileSource2");
  const fileSource3El = document.getElementById("fileSource3");
  const fileSource4El = document.getElementById("fileSource4");

  const file1 = fileSource1El?.files?.[0] || null; // Integrify
  const file2 = fileSource2El?.files?.[0] || null; // Elasticnet
  const file3 = fileSource3El?.files?.[0] || null; // friendlyIoT
  const file4 = fileSource4El?.files?.[0] || null; // ImasterNCE

  try {
    // Validar fecha solo si Integrify se va a consultar por Fetch
    if (!isTestMode && (!dateInputEl || !dateInputEl.value)) {
      alert("Por favor selecciona una fecha de consulta para Integrify.");
      return;
    }

    startBtn.disabled = true;
    startBtn.textContent = "Procesando...";

    const totalRows = await runDataPipeline({
      isTestMode,
      dateInput: dateInputEl ? dateInputEl.value : null,
      fileIntegrify: file1,
      fileElasticnet: file2,
      fileFriendlyIoT: file3,
      fileImaster: file4
    });

    console.log(`Pipeline finalizado con éxito. Registros procesados: ${totalRows}`);
  } catch (error) {
    console.error("Error ejecutando el pipeline:", error);
    alert(`Ocurrió un error: ${error.message}`);
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = "Iniciar Procesamiento";
  }
});