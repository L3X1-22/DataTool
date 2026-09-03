/**
 * Extractor para ImasterNCE.
 * Lee el CSV local mediante FileReader, detecta la fila del encabezado real
 * omitiendo el preámbulo aleatorio y parsea los registros.
 * 
 * @param {Object} options
 * @param {File|null} options.file - Archivo CSV de ImasterNCE
 * @returns {Promise<Array<Object>>} Registros parseados en crudo
 */
export async function extractImaster({ file }) {
    if (!file || !(file instanceof Blob)) {
        throw new Error("Debe seleccionar un archivo válido para ImasterNCE.");
    }

    // Leer el archivo con FileReader
    const rawText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file, "utf-8");
    });

    const lines = rawText.split(/\r?\n/);

    // Buscar dinámicamente la fila donde empiezan los nombres de columna
    const headerIndex = lines.findIndex(line =>
        line.includes("Device Name") || line.includes("Terminal Type")
    );

    if (headerIndex === -1) {
        throw new Error("No se encontraron los encabezados válidos en el archivo de ImasterNCE.");
    }

    // Recortar desde la fila del encabezado en adelante
    const cleanedCsvText = lines.slice(headerIndex).join("\n");

    const parsed = Papa.parse(cleanedCsvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    return parsed.data;
}