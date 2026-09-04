/**
 * Limpia y reemplaza el modelo buscando subcadenas específicas por orden de prioridad.
 * @param {Array<Object>} rows - Filas extraídas en crudo
 * @returns {Array<Object>} Filas procesadas con el Modelo Oficial asignado
 */
export function prepareIntegrify(rows) {
  const dropCols = ["Serial", "Hostname", "Version", "PE", "Interface en pe", "Last Login"];

  // Reglas de coincidencia parcial por orden de prioridad (de más específica a más general)
  const matchingRules = [
    // 1. Variantes específicas y sufijos (se deben evaluar ANTES que los números base)
    { pattern: "1111X", target: "1111X" },
    { pattern: "C1121", target: "C1121X" },
    { pattern: "1121", target: "C1121X" },
    { pattern: "892", target: "892FSP" },
    { pattern: "1941", target: "1941W" },
    { pattern: "1861", target: "1861E" },
    { pattern: "617VW", target: "617VW" },
    { pattern: "129CGVW", target: "AR129CGVW" },
    { pattern: "6140E", target: "AR6140E" },
    { pattern: "6121E", target: "AR6121E" },
    { pattern: "1220E", target: "AR1220E" },
    { pattern: "2220E", target: "AR2220E" },
    { pattern: "611W", target: "AR611W" },
    { pattern: "ISR1100", target: "ISR1100X" },
    { pattern: "1100X", target: "ISR1100X" },

    // 2. Familia ASR y ISR
    { pattern: "ASR1001", target: "ASR1001" },
    { pattern: "ASR1002", target: "ASR1002" },
    { pattern: "ASR1004", target: "ASR1004" },
    { pattern: "4221", target: "ISR4221" },
    { pattern: "4321", target: "ISR4321" },
    { pattern: "4331", target: "ISR4331" },
    { pattern: "4351", target: "ISR4351" },
    { pattern: "4431", target: "ISR4431" },
    { pattern: "4451", target: "ISR4451" },

    // 3. Modelos numéricos de 4 dígitos (evaluar 2921 y 1921 antes que 921 para evitar falsos positivos)
    { pattern: "2921", target: "2921" },
    { pattern: "1921", target: "1921" },
    { pattern: "1111", target: "1111" },
    { pattern: "867", target: "867VAE" },
    { pattern: "881", target: "881" },
    { pattern: "871", target: "871" },
    { pattern: "891", target: "891" },
    { pattern: "921", target: "921" },
    { pattern: "1841", target: "1841" },
    { pattern: "1905", target: "1905" },
    { pattern: "2801", target: "2801" },
    { pattern: "2811", target: "2811" },
    { pattern: "2821", target: "2821" },
    { pattern: "2901", target: "2901" },
    { pattern: "2911", target: "2911" },
    { pattern: "2951", target: "2951" },
    { pattern: "3825", target: "3825" },
    { pattern: "3845", target: "3845" },
    { pattern: "3925", target: "3925" },
    { pattern: "3945", target: "3945" },
    { pattern: "7606", target: "7606" },
    { pattern: "7609", target: "7609" },
    { pattern: "8200", target: "8200" },
    { pattern: "8300", target: "8300" },
    { pattern: "8500", target: "8500" },

    // 4. Serie Huawei AR
    { pattern: "151", target: "AR151" },
    { pattern: "161", target: "AR161" },
    { pattern: "651", target: "AR651" },
    { pattern: "6120", target: "AR6120" },
    { pattern: "6280", target: "AR6280" },
    { pattern: "2240", target: "AR2240" },
    { pattern: "6300", target: "AR6300" }
  ];

  return rows.map(row => {
    const cleanRow = { ...row };

    // 1. Eliminar columnas no deseadas
    dropCols.forEach(col => delete cleanRow[col]);

    // 2. Normalización básica inicial
    const rawModel = String(cleanRow.Modelo ?? "").toUpperCase().trim();

    if (!rawModel) {
      cleanRow.Modelo = null;
      return cleanRow;
    }

    // 3. Buscador secuencial de coincidencias parciales
    const match = matchingRules.find(rule => rawModel.includes(rule.pattern));

    // Si encuentra la subcadena asigna el target oficial; si no, deja el valor limpio original
    cleanRow.Modelo = match ? match.target : rawModel;

    return cleanRow;
  });
}