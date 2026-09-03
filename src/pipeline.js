import { extractIntegrify } from "./extractors/integrifyExtractor.js";
import { extractElasticnet } from "./extractors/elasticnetExtractor.js";
import { extractImaster } from "./extractors/imasterExtractor.js";

import { prepareIntegrify } from "./cleaners/integrifyCleaner.js";
import { prepareElasticnet } from "./cleaners/elasticnetCleaner.js";
import { prepareImaster } from "./cleaners/imasterCleaner.js";

/**
 * Ejecuta el pipeline completo de procesamiento de datos.
 * @param {Object} params
 * @param {boolean} params.isTestMode
 * @param {string|null} params.dateInput
 * @param {File|null} params.fileIntegrify
 * @param {File|null} params.fileElasticnet
 * @param {File|null} params.fileFriendlyIoT
 * @param {File|null} params.fileImaster
 */
export async function runDataPipeline({
    isTestMode,
    dateInput,
    fileIntegrify,
    fileElasticnet,
    fileFriendlyIoT,
    fileImaster
}) {
    let formattedDate = null;

    if (dateInput) {
        const date = new Date(dateInput);
        formattedDate = date.toISOString().split("T")[0];
    }

    // --- 1. EXTRACCIÓN ---
    const rawIntegrify = await extractIntegrify({
        isTestMode,
        file: fileIntegrify,
        dateStr: formattedDate
    });

    const rawElasticnet = await extractElasticnet({
        file: fileElasticnet
    });

    const rawImaster = await extractImaster({
        file: fileImaster
    });

    // --- 2. PREPARACIÓN / LIMPIEZA INDIVIDUAL ---
    const cleanIntegrify = prepareIntegrify(rawIntegrify);
    const cleanElasticnet = prepareElasticnet(rawElasticnet);
    const cleanImaster = prepareImaster(rawImaster);

    // --- 3. CONSOLIDACIÓN ---
    const consolidatedData = [
        ...cleanIntegrify,
        ...cleanElasticnet,
        ...cleanImaster
    ];

    // --- 4. EXPORTACIÓN A CSV ---
    exportCSV(consolidatedData, "resultado.csv");

    return consolidatedData.length;
}

/**
 * Helper para exportar un array de objetos a CSV combinando todas las columnas
 */
function exportCSV(data, fileName) {
    if (!data || data.length === 0) {
        alert("No hay datos consolidados para exportar.");
        return;
    }

    // Recolectar todas las columnas únicas de todos los objetos en consolidatedData
    const allHeaders = Array.from(
        new Set(data.flatMap(row => Object.keys(row)))
    );

    const csv = Papa.unparse({
        fields: allHeaders,
        data: data
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}