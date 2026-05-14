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
  let date = new Date(document.getElementById("date").value);

  console.log(date.toISOString().split('T')[0]);

  // 1. Fetch blob
  const blob = await fetchCSV(date.toISOString().split('T')[0]);

  // 2. Crear DataFrame combinado
  let df = await dataframesCreator(blob);

  // 3. Limpiar columnas innecesarias
  df = dataCleaning(df);

  // 4. Normalizar modelos
  df = df.map(row => ({
    ...row,
    Modelo: (() => {
      const match = String(row.Modelo).match(/\d+/);
      return match ? match[0] : null;
    })()
  }));

  // 5. Resultado final
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