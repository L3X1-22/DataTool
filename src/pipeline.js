import { extractIntegrify } from "./extractors/integrifyExtractor.js";
import { extractElasticnet } from "./extractors/elasticnetExtractor.js";
import { prepareIntegrify } from "./cleaners/integrifyCleaner.js";
import { prepareElasticnet } from "./cleaners/elasticnetCleaner.js";

/**
 * Ejecuta el pipeline completo de procesamiento de datos.
 * @param {Object} params
 * @param {boolean} params.isTestMode
 * @param {File|null} params.fileInput
 * @param {string|null} params.dateInput
 */
export async function runDataPipeline({ isTestMode, fileInput, dateInput }) {
    let formattedDate = null;

    if (dateInput) {
        const date = new Date(dateInput);
        formattedDate = date.toISOString().split("T")[0];
    }

    // --- 1. EXTRACCIÓN ---
    // Por ahora solo tenemos la fuente Integrify
    const rawIntegrify = await extractIntegrify({ isTestMode, file: fileInput, dateStr: formattedDate });
    //const rawElasticnet = await extractElasticnet({ isTestMode });

    // Aquí se irán sumando:
    // const rawSource2 = await extractSource2(...);
    // const rawSource3 = await extractSource3(...);
    // const rawSource4 = await extractSource4(...);

    // --- 2. PREPARACIÓN / LIMPIEZA INDIVIDUAL ---
    const cleanIntegrify = prepareIntegrify(rawIntegrify);
    //const cleanElasticnet = prepareElasticnet(rawElasticnet);
    // const cleanSource2 = prepareSource2(rawSource2); ...

    // --- 3. CONSOLIDACIÓN ---
    const consolidatedData = [
        ...cleanIntegrify,
        //...cleanElasticnet
    ];

    // --- 4. EXPORTACIÓN A CSV ---
    exportCSV(consolidatedData, "resultado.csv");

    return consolidatedData.length;
}

/**
 * Helper para exportar un array de objetos a CSV y descargarlo
 */
function exportCSV(data, fileName) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}