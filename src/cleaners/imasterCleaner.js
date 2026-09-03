/**
 * Filtra el dataset de ImasterNCE conservando solo los "Terminal Type" autorizados.
 * 
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas filtradas
 */
export function prepareImaster(rows) {
    if (!Array.isArray(rows)) return [];

    const allowedTypes = new Set([
        "EG8245W-6T",
        "MA5675",
        "HG8010H",
        "HG8010",
        "MA5675M",
        "HG8145X7b",
        "HG8145V5"
    ]);

    return rows.filter(row => {
        const terminalType = String(row["Terminal Type"] ?? "").trim();
        return allowedTypes.has(terminalType);
    });
}