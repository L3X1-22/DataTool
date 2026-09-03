import { runDataPipeline } from "./pipeline.js";

/*
  Dark/light theme handler
*/
const toggle = document.getElementById("themeToggle");

// Al cargar, lee el estado guardado y aplícalo
toggle.checked = localStorage.getItem("theme") === "dark";
if (toggle.checked) document.documentElement.setAttribute("data-theme", "dark");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  // Guarda el nuevo estado
  localStorage.setItem("theme", toggle.checked ? "dark" : "light");
});

/*
  Local mode handler (fetch <-> upload en celdas 1 y 2)
*/
const localModeToggle = document.getElementById("localModeToggle");
const sourcesGrid = document.getElementById("sourcesGrid");

localModeToggle.addEventListener("change", () => {
  sourcesGrid.dataset.mode = localModeToggle.checked ? "local" : "fetch";
});

/* 
  Event Handlers
*/
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", async () => {
  const dateInputEl = document.getElementById("date");

  const fileSource3El = document.getElementById("fileSource3");
  const fileSource4El = document.getElementById("fileSource4");

  const file3 = fileSource3El ? fileSource3El.files[0] : null;
  const file4 = fileSource4El ? fileSource4El.files[0] : null;

  try {
    if (!dateInputEl.value) {
      alert("Por favor selecciona una fecha de consulta.");
      return;
    }

    if (!file3 || !file4) {
      alert("Debes cargar los archivos CSV requeridos para la Fuente 3 y la Fuente 4.");
      return;
    }

    startBtn.disabled = true;
    startBtn.textContent = "Procesando...";

    const totalRows = await runDataPipeline({
      dateInput: dateInputEl ? dateInputEl.value : null,
      fileSource3: file3,
      fileSource4: file4
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