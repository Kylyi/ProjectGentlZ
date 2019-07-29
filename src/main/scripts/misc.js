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
      "server": "czbrq-s-apl0115",
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
    fs.writeFileSync(p, JSON.stringify([
      {"name":"Project PM","value":"Project Manager","editable":false,"visible":true,"dataType":"string", "width": 106},
      {"name":"Project #","value":"Project Definition","editable":false,"visible":true,"dataType":"string", "width": 86, "cellTemplate": "escalatedCell"},
      {"name":"Network #","value":"Network Num","editable":false,"visible":true,"dataType":"string", "width": 150, "cellTemplate": "cellTemplate"},
      {"name":"Net description","value":"Network Description","editable":false,"visible":true,"alignment":"left","dataType":"string", "width": "30%"},
      {"name":"SWG type","value":"Switchgear Type","editable":false,"visible":true,"dataType":"string", "width": 60},
      {"name":"No. of Panels","value":"Number of Panels","editable":false,"visible":true,"dataType":"number", "width": 65},
      {"name":"SSO","value":"SSO","editable":false,"visible":true,"dataType":"string", "alignment": "center", "width": 70, "cellTemplate": "ssoTemplate"},
      {"name":"Initial BPO","value":"Initial BPO","editable":false,"visible":false,"dataType":"number", "width": 65},
      {"name":"BPO","value":"Buffer Size - Overall Project","editable":false,"visible":true,"dataType":"number", "width": 65},
      {"name":"INCO","value":"INCO Type","editable":false,"visible":true,"dataType":"string", "alignment": "center", "width": 75},
      {"name":"Revenues","value":"Net Revenues","editable":true,"visible":true,"dataType":"number", "width": 100},
      {"name":"Priority","value":"priority","editable":false,"visible":false,"dataType":"string", "width": 100},
      {"name":"Plant","value":"Plant","editable":false,"visible":false,"dataType":"string"},
      {"name":"Project name","value":"Project Name","editable":false,"visible":false,"dataType":"string"},
      {"name":"Customer","value":"Customer Name","editable":false,"visible":false,"dataType":"string"},
      {"name":"Customer country","value":"Customer Country","editable":false,"visible":false,"dataType":"string"},
      {"name":"Modules no.","value":"Number of Modules","editable":false,"visible":false,"dataType":"number"},
      {"name":"Net status","value":"Net Status from Tasks","editable":false,"visible":false,"dataType":"string"},
      {"name":"Net status - ENG","value":"Net Statuts - Engineering Phase","editable":false,"visible":false,"dataType":"string"},
      {"name":"Packaging","value":"Packaging","editable":false,"visible":false,"dataType":"string"},
      {"name":"Support center","value":"Project Support Center","editable":false,"visible":false,"dataType":"string"},
      {"name":"Buffer - ENG","value":"Buffer Size - Enginnering Phase","editable":false,"visible":false,"dataType":"number"},
      {"name":"Progress - overall","value":"Project Progress - Overal Project","editable":false,"visible":false,"dataType":"number"},
      {"name":"Progress - ENG","value":"Project Progress - Engineering Phase","editable":false,"visible":false,"dataType":"number"},
      {"name":"Protections","value":"Protections","editable":false,"visible":false,"dataType":"string"},
      {"name":"Interlocking","value":"Interlocking","editable":false,"visible":false,"dataType":"string"},
      {"name":"Communication","value":"Communication","editable":false,"visible":false,"dataType":"string"},
      {"name":"Electrical ENG","value":"Electrical Engineer","editable":false,"visible":false,"dataType":"string"},
      {"name":"Mechanical ENG","value":"Mechanical Engineer","editable":false,"visible":false,"dataType":"string"},
      {"name":"Foreman","value":"Foreman","editable":false,"visible":false,"dataType":"string"},
      {"name":"Testing","value":"Testing","editable":false,"visible":false,"dataType":"string"},
      {"name":"IED Programmer","value":"IED Programmer","editable":false,"visible":false,"dataType":"string"},
      {"name":"LV panel install","value":"LV Pannel Installation","editable":false,"visible":false,"dataType":"string"},
      {"name":"FAT","value":"FAT Fixed Date","editable":false,"visible":true,"dataType":"date", "width": 65},
      {"name":"FAT actual date","value":"FAT Actual Date","editable":false,"visible":false,"dataType":"date"},
      // {"name":"Dispatch date fixed","value":"Expedition Fixed","editable":false,"visible":false,"dataType":"string"},
      {"name":"Dispatch date","value":"Delivery Date","editable":false,"visible":true,"dataType":"date", "width": 80, "cellTemplate": "formattedCellDispatchDate"},
      {"name":"Contract expedition date","value":"Contractual Expedition Date","editable":false,"visible":false,"dataType":"date"},
      {"name":"Note","value":"Network Note","editable":false,"visible":false,"dataType":"string"},
      {"name":"BPE","value":"Initial BPE","editable":false,"visible":false,"dataType":"number"},
      {"name":"Delivery date [%]","value":"Delivery Date Probability","editable":false,"visible":false,"dataType":"number"},
      {"name":"Packing fixed","value":"Packing fixed","editable":false,"visible":false,"dataType":"date"},
      {"name":"Contract delivery date","value":"Contractual Delivery Date","editable":false,"visible":true,"dataType":"date", "width": 90},
      {"name":"Tolerated delay","value":"Tolerated delay","editable":false,"visible":false,"dataType":"string"},
      {"name":"Actual delivery date","value":"Actual Delivery Date","editable":false,"visible":false,"dataType":"date"},
      {"name":"PSD","value":"PSD","editable":false,"visible":false,"dataType":"date"},
      {"name":"ZVR","value":"ZVR","editable":false,"visible":false,"dataType":"date"},
      {"name":"ZVL","value":"ZVL","editable":false,"visible":false,"dataType":"date"},
      {"name":"Revenues - project","value":"Project Revenues","editable":false,"visible":false,"dataType":"number"},
      {"name":"OB","value":"Project OB","editable":false,"visible":false,"dataType":"number"},
      {"name":"Panels no. - project","value":"Project Panels","editable":false,"visible":false,"dataType":"number"},
      // {"name":"Invoice date Fixed","value":"Invoice Date Fixed","editable":false,"visible":false,"dataType":"boolean"}
      {"name":"Invoice Date","value":"Current Invoice Date","editable":true,"visible":false,"dataType":"date", "source": "sap", "sourceField": "InvoiceDate", "sapFixingField": "FixationInvoice", "couchFieldIfFixed": "Invoice Date Fixed"}
    ]))
  }
}

export let configInvoicingDetails = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingDetails.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify(
      [
        {"name":"Network #","value":"Network Num","editable":false,"visible":true,"dataType":"string"},
        {"name":"Net revenues","value":"Net Revenues","editable":true,"visible":true,"dataType":"number"},
        {"name":"Order backlog","value":"Project OB","editable":false,"visible":true,"dataType":"number"}
      ]
    ))
  }
}

export let configProjectsDetail = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'projectDetails.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'projectDetails.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify([
      {"name":"Plant","value":"Plant","editable":false,"alignment":"center","visible":true,"dataType":"string"}
    ]))
  }
}

export let configTaskColumns = function () {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'taskColumns.json') : path.join(path.dirname(__dirname), 'defaultSettings', 'taskColumns.json')
  const fileFound = fs.existsSync(p)

  if (!fileFound) {
    fs.writeFileSync(p, JSON.stringify(
      [
        {"name":"Task #","value":"ActivityNumber","editable":true,"visible":true,"dataType":"string"},
        {"name":"Task description","value":"ActivityName","editable":true,"visible":true,"dataType":"string"},
        {"name":"Work","value":"Work","editable":true,"visible":true,"dataType":"string"},
        {"name":"Duration","value":"Duration","editable":true,"visible":true,"dataType":"string"},
        {"name":"May start","value":"MayStart","editable":true,"visible":true,"dataType":"boolean"},
        {"name":"Task ID","value":"TaskID","editable":false,"visible":false,"dataType":"string"},
        {"name":"Total float","value":"TotalFloat","editable":true,"visible":false,"dataType":"string"},
        {"name":"Thread has to be finished by","value":"ThreadHasToBeFinishedBy","editable":true,"visible":false,"dataType":"string"},
        {"name":"Thread establishment ID","value":"ThreadEstablishmentID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Task note","value":"d:TaskNote","editable":true,"visible":false,"dataType":"string"},
        {"name":"Status","value":"Status","editable":true,"visible":false,"dataType":"string"},
        {"name":"Selection type","value":"SelectionType","editable":true,"visible":false,"dataType":"string"},
        {"name":"Reposible role","value":"ResponsibleRole","editable":true,"visible":false,"dataType":"string"},
        {"name":"Project #","value":"ProjectNumber","editable":true,"visible":false,"dataType":"string"},
        {"name":"Project name","value":"ProjectName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Project ID","value":"ProjectID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Planned start date","value":"PlannedStartDate","editable":true,"visible":false,"dataType":"string"},
        {"name":"Person surname","value":"PersonSurname","editable":true,"visible":false,"dataType":"string"},
        {"name":"Person name","value":"PersonName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Person ID","value":"PersonID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Obsolete prognosis","value":"Obsolete prognosis","editable":true,"visible":false,"dataType":"string"},
        {"name":"Network #","value":"NetworkNumber","editable":true,"visible":false,"dataType":"string"},
        {"name":"Network description","value":"NetworkName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Network ID","value":"NetworkID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Incompleteness","value":"Incompleteness","editable":true,"visible":false,"dataType":"boolean"},
        {"name":"Fullfilment check required","value":"FullfilmentCheckRequired","editable":true,"visible":false,"dataType":"boolean"},
        {"name":"Description","value":"Description","editable":true,"visible":false,"dataType":"string"},
        {"name":"Created date","value":"CreatedDate","editable":true,"visible":false,"dataType":"date"},
        {"name":"Created by surname","value":"CreatedBySurname","editable":true,"visible":false,"dataType":"string"},
        {"name":"Created by name","value":"CreatedByName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Created by ID","value":"CreatedByID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Completed date","value":"CompletedDate","editable":true,"visible":false,"dataType":"date"},
        {"name":"Completed by surname","value":"CompletedBySurname","editable":true,"visible":false,"dataType":"string"},
        {"name":"Completed by name","value":"CompletedByName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Completed by ID","value":"CompletedByID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Actual start date","value":"ActualStartDate","editable":true,"visible":false,"dataType":"date"},
        {"name":"Actual prognosis H","value":"ActualPrognosisH","editable":true,"visible":false,"dataType":"string"},
        {"name":"Actual prognosis","value":"ActualPrognosis","editable":true,"visible":false,"dataType":"string"},
        {"name":"Act. start by surname","value":"ActStartBySurname","editable":true,"visible":false,"dataType":"string"},
        {"name":"Act. start by name","value":"ActStartByName","editable":true,"visible":false,"dataType":"string"},
        {"name":"Act. start by ID","value":"ActStartByID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Activity ID","value":"ActivityID","editable":true,"visible":false,"dataType":"string"},
        {"name":"Release possible","value":"ReleasePossible","editable":true,"visible":false,"dataType":"boolean"},
        {"name":"Must end date","value":"MustEndDate","editable":true,"visible":false,"dataType":"date"}
      ]
    ))
  }
}
