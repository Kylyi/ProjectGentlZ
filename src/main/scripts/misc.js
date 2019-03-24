  const fs = require('fs')
  const iconvlite = require('iconv-lite')
  const path = require('path')
  const isDev = require('electron-is-dev')

export let readFile = function readFileSync_encoding(filename, encoding) {
  var content = fs.readFileSync(filename);
  return iconvlite.decode(content, encoding);
}

export let configDatabaseSettings = function () {
  // const p = isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8'))
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json')
  const fileFound = fs.existsSync(p)
  
  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify({
      "database": "ppes",
      "server": "czbrq-s-apl1133",
      "driver": "msnodesqlv8",
      "options": {
        "trustedConnection": true
      },
      pool: {
        requestTimeout: 600000
      }
    }))
  }
}

export let configInvoicingColumns = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingColumns.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify([{
        "name": "Project #",
        "value": "project_id",
        "editable": false,
        "visible": true,
        "dataType": "string"
      },
      {
        "name": "Net #",
        "value": "net_num",
        "editable": false,
        "visible": true,
        "dataType": "string"
      },
      {
        "name": "Net description",
        "value": "net_descr",
        "editable": false,
        "visible": true,
        "alignment": "left",
        "dataType": "string"
      },
      {
        "name": "Net panels no.",
        "value": "net_panels_no",
        "editable": false,
        "visible": false,
        "dataType": "number"
      },
      {
        "name": "Net type",
        "value": "net_type",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Net status",
        "value": "net_status",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Net BPO",
        "value": "net_bpo",
        "editable": false,
        "visible": true,
        "dataType": "number"
      },
      {
        "name": "Net original delivery",
        "value": "net_orig_delivery",
        "editable": false,
        "visible": false,
        "dataType": "date"
      },
      {
        "name": "Net contractual date",
        "value": "net_contract_delivery",
        "editable": false,
        "visible": false,
        "dataType": "date"
      },
      {
        "name": "Net transport",
        "value": "net_transport",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Contractual dispatch",
        "value": "contract_dispatch",
        "editable": false,
        "visible": false,
        "dataType": "date"
      },
      {
        "name": "Project incoterms",
        "value": "project_inco",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Project destination",
        "value": "project_destination",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Net package date",
        "value": "net_package_date",
        "editable": false,
        "visible": false,
        "dataType": "date"
      },
      {
        "name": "Fixed",
        "value": "fixed",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Actual dispatch date",
        "value": "actual_dispatch_date",
        "editable": false,
        "visible": false,
        "dataType": "date"
      },
      {
        "name": "Project packaging",
        "value": "project_packaging",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Project PM",
        "value": "project_pm",
        "editable": false,
        "visible": true,
        "dataType": "string"
      },
      {
        "name": "PM group",
        "value": "pm_group",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Net FAT",
        "value": "net_fat",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Net revenues",
        "value": "net_revenues",
        "editable": true,
        "visible": true,
        "dataType": "number"
      },
      {
        "name": "Project OB",
        "value": "project_ob",
        "editable": false,
        "visible": true,
        "dataType": "number"
      },
      {
        "name": "Delay type",
        "value": "delay_type",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Delay reason",
        "value": "delay_cause",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Invoicing attention",
        "value": "invoicing_attention",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Escalation attention",
        "value": "escalation_attention",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Potential upside",
        "value": "potential_upside",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "Comments",
        "value": "comments",
        "editable": false,
        "visible": false,
        "dataType": "string"
      },
      {
        "name": "PPES comments",
        "value": "ppes_comments",
        "editable": false,
        "visible": false,
        "dataType": "string"
      }
    ]))
  }
}

export let configInvoicingDetails = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingDetails.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify([]))
  }
}

export let configProjectsDetail = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'projectDetails.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'projectDetails.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify([{
      "name": "Plant",
      "value": "Plant",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Net #",
      "value": "Network Num",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Net Description",
      "value": "Network Description",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Project #",
      "value": "Project Definition",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "PM",
      "value": "Project Manager",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Status - ENG",
      "value": "Net Statuts - Engineering Phase",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "Status - Tasks",
      "value": "Net Status from Tasks",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "SSO",
      "value": "SSO",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "SWG type",
      "value": "Switchgear Type",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "# of panels",
      "value": "Number of Panels",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }, {
      "name": "Packaging",
      "value": "Packaging",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Project support center",
      "value": "Project Support Center",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "INCO",
      "value": "INCO Type",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "Buffer - Overall",
      "value": "Buffer Size - Overall Project",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }, {
      "name": "Buffer - ENG",
      "value": "Buffer Size - Enginnering Phase",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }, {
      "name": "Progress - Overall",
      "value": "Project Progress - Overal Project",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }, {
      "name": "Progress - ENG",
      "value": "Project Progress - Engineering Phase",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }, {
      "name": "Protections",
      "value": "Protections",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Interlocking",
      "value": "Interlocking",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Communication",
      "value": "Communication",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Electrical ENG",
      "value": "Electrical Engineer",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Mechanical ENG",
      "value": "Mechanical Engineer",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Foreman",
      "value": "Foreman",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Testing",
      "value": "Testing",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "IED Programmer",
      "value": "IED Programmer",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "LV Pannel Installation",
      "value": "LV Pannel Installation",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "FAT Fixed Date",
      "value": "FAT Fixed Date",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "boolean"
    }, {
      "name": "FAT Actual Date",
      "value": "FAT Actual Date",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "date"
    }, {
      "name": "Expedition fixed",
      "value": "Expedition Fixed",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "boolean"
    }, {
      "name": "Delivery date",
      "value": "Delivery Date",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "Contract. expedition date",
      "value": "Contractual Expedition Date",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "Network note",
      "value": "Network Note",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "BPO",
      "value": "Initial BPO",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "number"
    }, {
      "name": "BPE",
      "value": "Initial BPE",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "number"
    }, {
      "name": "Delivery date [%]",
      "value": "Delivery Date Probability",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "number"
    }, {
      "name": "Packing fixed",
      "value": "Packing fixed",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "boolean"
    }, {
      "name": "Contract. delivery date",
      "value": "Contractual Delivery Date",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "Invoicing period",
      "value": "Invoicing Period",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "string"
    }, {
      "name": "Tolerated delay",
      "value": "Tolerated delay",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "string"
    }, {
      "name": "Actual delivery date",
      "value": "Actual Delivery Date",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "PSD",
      "value": "PSD",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "ZVR",
      "value": "ZVR",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "ZVL",
      "value": "ZVL",
      "editable": false,
      "alignment": "center",
      "visible": false,
      "dataType": "date"
    }, {
      "name": "# of modules",
      "value": "Number of Modules",
      "editable": false,
      "alignment": "center",
      "visible": true,
      "dataType": "number"
    }]))
  }
}
