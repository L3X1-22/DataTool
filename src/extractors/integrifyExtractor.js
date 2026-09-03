/**
 * Obtiene los datos crudos de Integrify (desde API o archivo local de prueba).
 * @param {Object} options
 * @param {boolean} options.isTestMode - Indica si se usa el archivo local de prueba
 * @param {File|null} options.file - Archivo local si isTestMode es true
 * @param {string|null} options.dateStr - Fecha formateada (YYYY-MM-DD) si isTestMode es false
 * @returns {Promise<Array<Object>>} Array de objetos representando las filas del CSV
 */
export async function extractIntegrify({ isTestMode, file, dateStr }) {
    let blob;

    if (isTestMode) {
        if (!file) throw new Error("Debe seleccionar un archivo para el modo de prueba.");
        blob = file;
    } else {
        if (!dateStr) throw new Error("Debe seleccionar una fecha para consultar Integrify.");
        blob = await fetchIntegrifyCSV(dateStr);
    }

    const text = await blob.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    return parsed.data;
}

/**
 * Petición HTTP directa al endpoint de Dash Integrify
 */
async function fetchIntegrifyCSV(date) {
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
                { id: "textinput_fecha", property: "value", value: date },
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
    });

    if (!res.ok) throw new Error(`Error HTTP al consultar Integrify: ${res.status}`);

    const data = await res.json();
    const fileData = data.response.descargar_archivo.data;

    return new Blob([fileData.content], { type: "text/csv" });
}