/**
 * Obtiene los datos crudos de ElasticNet/ZTE (ONU_QUERY), paginando hasta traer todo el dataset.
 * @param {Object} options
 * @param {boolean} options.isTestMode
 * @returns {Promise<Array<Object>>}
 */
export async function extractElasticnet({ isTestMode }) {
    if (isTestMode) {
        // TODO: definir fuente local de prueba para Elasticnet (¿archivo? ¿mock fijo?)
        throw new Error("Modo de prueba no implementado aún para Elasticnet.");
    }

    const pageSize = 5000;
    let pageIndex = 1;
    let allRecords = [];
    let totalNum = Infinity;

    while (allRecords.length < totalNum) {
        const page = await fetchOnuQueryPage({ pageIndex, pageSize });
        totalNum = page.totalNum;
        allRecords = allRecords.concat(page.table.records);
        pageIndex++;
    }

    return allRecords;
}

/**
 * Petición HTTP directa al endpoint ONU_QUERY de ElasticNet
 */
async function fetchOnuQueryPage({ pageIndex, pageSize }) {
    const res = await fetch("https://100.123.27.183:28001/api/an-rm/v1/resource-query-statistics-wireline-an-resources/ONU_QUERY", {
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "forgerydefense": "86dc7779363fd9ba79b0dad103f263a76804f76d6385717709ccb882fdec663b",
            "language-option": "en-US",
            "timezoneinfo": "Default,America/Bogota,",
            "x-requested-with": "XMLHttpRequest"
        },
        credentials: "include",
        body: JSON.stringify({
            info: {
                function: "ONU_QUERY",
                pageInfo: { paging: "YES", pageIndex, pageSize },
                condition: {
                    "@class": "com.zte.ums.ume.an.commonsh.resquerystats.query.onu.querystats.entity.OnuQueryCondition",
                    locationPaths: [],
                    neIds: [],
                    neNames: [],
                    onuName: "",
                    onuDescription: "",
                    onuConfiguredType: "",
                    onuActualType: "F680V6.OP,F660",
                    onuAdministrativeStatus: "UNSELECTED",
                    onuUsedStatus: "UNSELECTED",
                    onuOperationalStatus: [],
                    onuStartingDate: "",
                    onuEndingDate: "",
                    vendorId: "",
                    softwareVersion: "",
                    onuProfile: "",
                    onuServiceLevel: "",
                    onuChipModel: "",
                    onuManufactureDate: "",
                    onuResourceAttribute1: "",
                    onuResourceAttribute2: "",
                    onuResourceAttribute3: "",
                    onuProtectionGroupOnly: "NO",
                    includeProtectionPONPortOnu: "YES",
                    onuFiberLength: -1
                }
            }
        })
    });

    if (!res.ok) throw new Error(`Error HTTP al consultar Elasticnet: ${res.status}`);

    return res.json();
}