import { API_URL, TEST_MODE } from "./config.js";

/*
  Dark/light theme handler
*/
const toggle = document.getElementById("themeToggle");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
});

/* 
  TestMode Handler
*/

if (TEST_MODE) {
  document.getElementById("date").style.display = "none";
} else {
  document.getElementById("fileInput").style.display = "none";
}

/* 
  Functions to fetch, normalize and return data
*/

async function downloadCSV() {
  const df = await process();

  const csv = Papa.unparse(df);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "resultado.csv";
  a.click();

  URL.revokeObjectURL(url);
}

async function process() {
  let df;

  if (TEST_MODE) {
    // 👉 MODO TEST (archivo local)
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Sube un archivo CSV");
      return;
    }

    df = await dataframesCreator(file);
  } else {
    // 👉 MODO REAL (fetch)
    const input = document.getElementById("startDate").value;

    if (!input) {
      alert("Selecciona una fecha");
      return;
    }

    let date = new Date(input);
    const formattedDate = date.toISOString().split('T')[0];

    const blob = await fetchCSV(formattedDate);
    df = await dataframesCreator(blob);
  }

  // 🔽 pipeline común
  df = dataCleaning(df);

  df = df.map(row => ({
    ...row,
    Modelo: (String(row.Modelo ?? "").match(/[A-Z]*\d+[A-Z0-9-]*/i) || [null])[0]
  }));

  console.log(df);
  return df;
}

async function fetchCSV(date) {
  const res = await fetch("https://integrify.claro.net.co:8443/_dash-update-component", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      output: "descargar_archivo.data",
      outputs: {
        id: "descargar_archivo",
        property: "data"
      },
      inputs: [
        {
          id: "dowload_equipos",
          property: "n_clicks",
          value: 2
        }
      ],
      changedPropIds: ["dowload_equipos.n_clicks"],
      parsedChangedPropsIds: ["dowload_equipos.n_clicks"],
      state: [
        {
          id: "textinput_fecha",
          property: "value",
          value: date
        },
        { id: "input_hostname", property: "value", value: null },
        { id: "input_serial", property: "value", value: null },
        { id: "input_ip_cpe", property: "value", value: null },
        { id: "input_modelo", property: "value", value: null },
        { id: "input_fabricante", property: "value", value: null },
        { id: "input_pe", property: "value", value: null },
        { id: "input_version", property: "value", value: null },
        { id: "input_version_soft", property: "value", value: null },
        { id: "input_vrf_pe", property: "value", value: null }
      ]
    })
  })

  const data = await res.json();
  const fileData = data.response.descargar_archivo.data;

  const blob = new Blob([fileData.content], { type: "text/csv" });

  return blob;
}

async function dataframesCreator(blob) {
  let dataframe;

  const text = await blob.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  dataframe = result.data;

  return dataframe;
}

function dataCleaning(df) {
  const dropCols = ["Serial", "Hostname", "Version", "PE", "Interface en pe", "Last Login"];
  return df.map(row => {
    const clean = { ...row };
    dropCols.forEach(col => delete clean[col]);
    return clean;
  });
}

const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", downloadCSV);