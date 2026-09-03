/**
 * Procesa un archivo ZIP subido manualmente para Elasticnet,
 * descomprime los CSVs internos y los concatena en un solo array.
 * 
 * @param {Object} options
 * @param {File|null} options.file - Archivo ZIP seleccionado en el input
 * @returns {Promise<Array<Object>>} Array consolidado con los registros de todos los CSVs
 */
export async function extractElasticnet({ file }) {
    if (!file) {
        throw new Error("Debe seleccionar el archivo ZIP de Elasticnet.");
    }

    // 1. Leer el archivo local como ArrayBuffer
    const zipData = await file.arrayBuffer();

    // 2. Cargar el ZIP con JSZip
    const zip = await JSZip.loadAsync(zipData);
    const combinedData = [];

    // 3. Iterar por cada elemento dentro del ZIP
    for (const relativePath of Object.keys(zip.files)) {
        const zipEntry = zip.files[relativePath];

        // Procesar solo archivos con extensión .csv (ignorando carpetas y archivos ocultos)
        if (!zipEntry.dir && relativePath.toLowerCase().endsWith(".csv")) {
            const csvText = await zipEntry.async("string");

            // Parsear el contenido del CSV
            const parsed = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            });

            if (parsed.data && parsed.data.length > 0) {
                combinedData.push(...parsed.data);
            }
        }
    }

    return combinedData;
}