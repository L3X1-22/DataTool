/**
 * Limpia y filtra el dataset de friendlyIoT descartando los clientes de tipo "RESIDENCIAL",
 * y normaliza/reemplaza la columna "Model name" buscando coincidencias con los modelos oficiales.
 * 
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas filtradas y con el modelo oficial asignado en "Model name"
 */
export function prepareFriendlyIot(rows) {
    if (!Array.isArray(rows)) return [];

    // Reglas de coincidencia parcial ordenadas por prioridad
    const matchingRules = [
        // 1. Modelos con variantes/sufijos específicos
        { pattern: "NP3081GA", target: "NP3081GA" },
        { pattern: "G-240W", target: "G-240W-G" },

        // 2. Modelos base de la lista
        { pattern: "GN630V", target: "GN630V" },
        { pattern: "F6601P", target: "F6601P" },
        { pattern: "NP2035G", target: "NP2035G" },
        { pattern: "GN543V", target: "GN543V" },
        { pattern: "F6600P", target: "F6600P" },
        { pattern: "SG1696D2VR", target: "SG1696D2VR" },
        { pattern: "NP3039GB", target: "NP3039GB" },
        { pattern: "HG5852SA", target: "HG5852SA" },

        // 3. Patrones cortos
        { pattern: "R8", target: "R8" }
    ];

    return rows
        // 1. Filtrar registros de tipo "RESIDENCIAL"
        .filter(row => {
            const clientType = String(row["Client Type"] ?? "").trim().toUpperCase();
            return clientType !== "RESIDENCIAL";
        })
        // 2. Procesar y reemplazar la columna "Model name"
        .map(row => {
            const cleanRow = { ...row };

            const rawModel = String(cleanRow["Model name"] ?? "").toUpperCase().trim();

            if (!rawModel) {
                cleanRow["Model name"] = null;
                return cleanRow;
            }

            // Buscar si el texto contiene alguno de los patrones oficiales
            const match = matchingRules.find(rule => rawModel.includes(rule.pattern));

            // Asignar el modelo oficial encontrado o mantener el texto de entrada
            cleanRow["Model name"] = match ? match.target : rawModel;

            return cleanRow;
        });
}