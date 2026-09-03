/**
 * Extractor para friendlyIoT.
 * Lee el archivo CSV cargado manualmente y devuelve los registros.
 * 
 * @param {Object} options
 * @param {File|null} options.file - Archivo CSV de friendlyIoT
 * @returns {Promise<Array<Object>>} Registros parseados en crudo
 */
export async function extractFriendlyIot({ file }) {
    if (!file || !(file instanceof Blob)) {
        throw new Error("Debe seleccionar un archivo CSV válido para friendlyIoT.");
    }

    const rawText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file, "utf-8");
    });

    const parsed = Papa.parse(rawText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    return parsed.data;
}