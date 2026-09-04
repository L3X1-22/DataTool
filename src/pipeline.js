import { extractIntegrify } from "./extractors/integrifyExtractor.js";
import { extractElasticnet } from "./extractors/elasticnetExtractor.js";
import { extractImaster } from "./extractors/imasterExtractor.js";
import { extractFriendlyIot } from "./extractors/friendlyIotExtractor.js";

import { prepareIntegrify } from "./cleaners/integrifyCleaner.js";
import { prepareElasticnet } from "./cleaners/elasticnetCleaner.js";
import { prepareImaster } from "./cleaners/imasterCleaner.js";
import { prepareFriendlyIot } from "./cleaners/friendlyIotCleaner.js";

/**
 * Ejecuta el pipeline completo y genera tanto el CSV consolidado como el CSV de modelos y su .txt.
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
    let modelosRecopilados = [];

    // 1. INTEGRITY
    if ((!isTestMode && formattedDate) || (isTestMode && fileIntegrify)) {
        const rawIntegrify = await extractIntegrify({
            isTestMode,
            file: fileIntegrify,
            dateStr: formattedDate
        });
        const cleanIntegrify = prepareIntegrify(rawIntegrify);
        consolidatedData = consolidatedData.concat(cleanIntegrify);

        // Extraer columna "Modelo"
        cleanIntegrify.forEach(row => {
            if (row.Modelo) modelosRecopilados.push({ Modelo: String(row.Modelo).trim() });
        });
    }

    // 2. ELASTICNET
    if (fileElasticnet) {
        const rawElasticnet = await extractElasticnet({ file: fileElasticnet });
        const cleanElasticnet = prepareElasticnet(rawElasticnet);
        consolidatedData = consolidatedData.concat(cleanElasticnet);

        // Extraer columna "Actual Type"
        cleanElasticnet.forEach(row => {
            const val = row["Actual Type"] || row["ActualType"] || row["Actual_Type"];
            if (val) modelosRecopilados.push({ Modelo: String(val).trim() });
        });
    }

    // 3. IMASTER NCE
    if (fileImaster) {
        const rawImaster = await extractImaster({ file: fileImaster });
        const cleanImaster = prepareImaster(rawImaster);
        consolidatedData = consolidatedData.concat(cleanImaster);

        // Extraer columna "Terminal Type"
        cleanImaster.forEach(row => {
            const val = row["Terminal Type"] || row["TerminalType"];
            if (val) modelosRecopilados.push({ Modelo: String(val).trim() });
        });
    }

    // 4. FRIENDLY IOT
    if (fileFriendlyIoT) {
        const rawFriendlyIot = await extractFriendlyIot({ file: fileFriendlyIoT });
        const cleanFriendlyIot = prepareFriendlyIot(rawFriendlyIot);
        consolidatedData = consolidatedData.concat(cleanFriendlyIot);

        // Extraer columna "Model name"
        cleanFriendlyIot.forEach(row => {
            const val = row["Model name"] || row["ModelName"] || row["Model_name"];
            if (val) modelosRecopilados.push({ Modelo: String(val).trim() });
        });
    }

    if (consolidatedData.length === 0) {
        throw new Error("No se seleccionó ninguna fuente de datos válida para procesar.");
    }

    // --- 5. EXPORTACIÓN DE ARCHIVOS ---

    // A) Descargar CSV 1: Unificado completo
    exportCSV(consolidatedData, "resultado_consolidado.csv");

    // B) Descargar CSV 2: Recopilatorio solo con la columna "Modelo"
    exportCSV(modelosRecopilados, "modelos_recopilatorio.csv");

    // C) Descargar TXT: Conteo de cada modelo
    exportSummaryTXT(modelosRecopilados, "resumen_modelos.txt");

    return consolidatedData.length;
}

/**
 * Helper para exportar un array de objetos a CSV sin saturar memoria
 */
function exportCSV(data, fileName) {
    if (!data || data.length === 0) return;

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

    downloadBlob(csv, fileName, "text/csv;charset=utf-8;");
}

/**
 * Genera y descarga un archivo .txt con el conteo de cada modelo
 */
function exportSummaryTXT(modelosData, fileName) {
    // Contar frecuencias
    const counts = {};
    modelosData.forEach(item => {
        const modelName = item.Modelo;
        if (modelName) {
            counts[modelName] = (counts[modelName] || 0) + 1;
        }
    });

    // Construir el texto del resumen
    const lines = [];
    lines.push("=== RESUMEN DE MODELOS ===");
    lines.push(`Fecha de generación: ${new Date().toLocaleString()}`);
    lines.push(`Total registros procesados: ${modelosData.length}`);
    lines.push("-----------------------------------");

    for (const [modelo, cantidad] of Object.entries(counts)) {
        lines.push(`${cantidad} cantidad del modelo ${modelo}`);
    }

    const txtContent = lines.join("\n");
    downloadBlob(txtContent, fileName, "text/plain;charset=utf-8;");
}

/**
 * Helper para forzar la descarga de un string como archivo
 */
function downloadBlob(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}