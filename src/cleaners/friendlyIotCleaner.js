/**
 * Limpia y filtra el dataset de friendlyIoT descartando los clientes de tipo "RESIDENCIAL".
 * 
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas filtradas
 */
export function prepareFriendlyIot(rows) {
    if (!Array.isArray(rows)) return [];

    return rows.filter(row => {
        const clientType = String(row["Client Type"] ?? "").trim().toUpperCase();
        return clientType !== "RESIDENCIAL";
    });
}