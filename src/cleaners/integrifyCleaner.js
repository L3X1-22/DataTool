/**
 * Limpia y normaliza el dataset específico de Integrify.
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas procesadas
 */
export function prepareIntegrify(rows) {
  const dropCols = ["Serial", "Hostname", "Version", "PE", "Interface en pe", "Last Login"];

  return rows.map(row => {
    const cleanRow = { ...row };

    // 1. Eliminar columnas no deseadas
    dropCols.forEach(col => delete cleanRow[col]);

    // 2. Normalizar la columna Modelo usando Regex
    const rawModel = String(cleanRow.Modelo ?? "");
    const matchedModel = (rawModel.match(/[A-Z]*\d+[A-Z0-9-]*/i) || [null])[0];
    cleanRow.Modelo = matchedModel;

    return cleanRow;
  });
}