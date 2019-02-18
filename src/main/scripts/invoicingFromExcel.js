const XLSX = require('xlsx')

async function importInvoicing(path) {
  const file = XLSX.readFile(path, {
    cellDates: true
  })

  const sheet = file.Sheets['181102']

  return XLSX.utils.sheet_to_json(sheet, {
    header: ['inv_date', 'net_num', 'project_id', 'net_descr', 'net_panels_no', 'net_type',
    'net_status', 'net_bpo', 'net_orig_delivery', 'net_contract_delivery', 'net_transport',
    'contract_dispatch', 'project_inco', 'project_destination', 'net_package_date', 'fixed',
    'actual_dispatch_date', 'project_packaging', 'project_pm', 'pm_group', 'net_fat', 'net_revenues',
    'project_ob', 'delay_type', 'delay_cause', 'invoicing_attention', 'escalation_attention', 'potential_upside',
    'comments', 'ppes_comments'],
    range: 1
  })
}

export let invoicingImport = importInvoicing