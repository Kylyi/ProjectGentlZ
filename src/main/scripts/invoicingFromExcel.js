const XLSX = require('xlsx')

async function importInvoicing(path) {
  const file = XLSX.readFile(path, {
    cellDates: true
  })

  const sheet = file.Sheets['181102']

  return XLSX.utils.sheet_to_json(sheet, {
    header: ['', '', '', '', '', '',
    '', '', '', '', '',
    '', '', '', '', '',
    '', '', '', '', '', '',
    '', '', '', '', '', '',
    'comments', 'ppes_comments'],
    range: 1
  })
}

export let invoicingImport = importInvoicing



const a = {
  inv_date: '', // NETUSIM
  net_num: 'Network Num',
  project_id: 'Project Definition',
  net_descr: 'Network Description',
  net_panels_no: 'Number of Panels',
  net_type: 'Swtichgear Type',
  net_status: 'Net Status from Tasks',
  net_bpo: 'Initial BPO',
  net_orig_delivery: '', // WORKFLOW DB
  net_contract_delivery: 'Contractual Delivery Date',
  net_transport: '', // WORKFLOW DB
  contract_dispatch: 'Contractual Expedition Date',
  project_inco: 'INCO Type',
  project_destination: '',
  net_package_date: '', // VZOREC na constraint on finish - Date z taskNum 420
  fixed: 'Expedition Fixed',
  actual_dispatch_date: 'Delivery Date',
  project_packaging: 'Packaging',
  project_pm: 'Project Manager',
  pm_group: '', //vytvorit vlastni
  net_fat: '', // VZOREC tomu nerozumim, nekaej list FATs?
  net_revenues: '', // OB Daily + VZOREC
  project_ob: '', // OB Daily
  comments: 'Network Note',
  empty: 'Number of Modules'
}