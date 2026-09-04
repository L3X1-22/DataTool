/**
 * Limpia y normaliza el dataset de Elasticnet reemplazando los valores en la columna "Actual Type"
 * según contengan "F680V6.OP" o "F660".
 * 
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas procesadas con los modelos reemplazados en "Actual Type"
 */
export function prepareElasticnet(rows) {
  if (!Array.isArray(rows)) return [];

  // Reglas de coincidencia ordenada por prioridad
  const matchingRules = [
    { pattern: "F680V6.OP", target: "F680V6.OP" },
    { pattern: "F660", target: "F660" }
  ];

  return rows.map(row => {
    const cleanRow = { ...row };

    // Extraer y normalizar el valor de la columna "Actual Type"
    const rawModel = String(cleanRow["Actual Type"] ?? "").toUpperCase().trim();

    if (!rawModel) {
      cleanRow["Actual Type"] = null;
      return cleanRow;
    }

    // Buscar si el texto contiene alguna de las subcadenas
    const match = matchingRules.find(rule => rawModel.includes(rule.pattern));

    // Si coincide con alguna regla, reemplaza por la meta objetivo; de lo contrario mantiene el valor de entrada
    cleanRow["Actual Type"] = match ? match.target : rawModel;

    return cleanRow;
  });
}