import { extractIntegrify } from "./extractors/integrifyExtractor.js";
import { extractElasticnet } from "./extractors/elasticnetExtractor.js";
import { extractImaster } from "./extractors/imasterExtractor.js";
import { extractFriendlyIot } from "./extractors/friendlyIotExtractor.js";

import { prepareIntegrify } from "./cleaners/integrifyCleaner.js";
import { prepareElasticnet } from "./cleaners/elasticnetCleaner.js";
import { prepareImaster } from "./cleaners/imasterCleaner.js";
import { prepareFriendlyIot } from "./cleaners/friendlyIotCleaner.js";

/**
 * Ejecuta el pipeline de procesamiento de datos procesando únicamente las fuentes presentes.
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

    let consolidatedData = [];

    // --- 1. INTEGRITY ---
    if ((!isTestMode && formattedDate) || (isTestMode && fileIntegrify)) {
        const rawIntegrify = await extractIntegrify({
            isTestMode,
            file: fileIntegrify,
            dateStr: formattedDate
        });
        const cleanIntegrify = prepareIntegrify(rawIntegrify);
        consolidatedData = consolidatedData.concat(cleanIntegrify);
    }

    // --- 2. ELASTICNET ---
    if (fileElasticnet) {
        const rawElasticnet = await extractElasticnet({ file: fileElasticnet });
        const cleanElasticnet = prepareElasticnet(rawElasticnet);
        consolidatedData = consolidatedData.concat(cleanElasticnet);
    }

    // --- 3. IMASTER NCE ---
    if (fileImaster) {
        const rawImaster = await extractImaster({ file: fileImaster });
        const cleanImaster = prepareImaster(rawImaster);
        consolidatedData = consolidatedData.concat(cleanImaster);
    }

    // --- 4. FRIENDLY IOT ---
    if (fileFriendlyIoT) {
        const rawFriendlyIot = await extractFriendlyIot({ file: fileFriendlyIoT });
        const cleanFriendlyIot = prepareFriendlyIot(rawFriendlyIot);
        consolidatedData = consolidatedData.concat(cleanFriendlyIot);
    }

    // --- 5. EXPORTACIÓN A CSV ---
    if (consolidatedData.length === 0) {
        throw new Error("No se seleccionó ninguna fuente de datos válida para procesar.");
    }

    exportCSV(consolidatedData, "resultado.csv");

    return consolidatedData.length;
}

/**
 * Helper para exportar un array de objetos a CSV combinando todas las columnas únicas sin saturar el stack
 */
function exportCSV(data, fileName) {
    // Recolectar las columnas usando Set e iteración para evitar stack overflow con datos masivos
    const headerSet = new Set();
    for (let i = 0; i < data.length; i++) {
        const keys = Object.keys(data[i]);
        for (let j = 0; j < keys.length; j++) {
            headerSet.add(keys[j]);
        }
    }
    const allHeaders = Array.from(headerSet);

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