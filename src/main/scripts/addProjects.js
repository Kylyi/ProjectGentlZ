const XLSX = require('xlsx')
import db from './database'

// const file = XLSX.readFile("C:/Users/kyli/Desktop/projects.xlsx", {
//   cellDates: true
// })
// const sheetName = file.SheetNames[0]
// const sheet = file.Sheets[sheetName]

// const content = XLSX.utils.sheet_to_json(sheet, {
//   range: 3,
//   header: ['BU', '_id', 'project_name', 'opportunity_name', 'customer', 'customer_country', 'contact_person', 'tender_issue_date', 'end_user',
//     'end_user_country', 'responsible_bid_manager', 'responsible_sales_manager', 'indicative_price_Mczk', 'opportunity_status', 'price_czk', 'quotation_date',
//     'rev_no', 'last_revision_date', 'language', 'scope_of_supply', 'pro_sales_input', 'gm_percent', 'gm_czk', 'project_occure', 'abb_probability', 'opportunity_probability',
//     'expected_award_date', 'order_date', 'interne', 'pro_sales', 'interne_2', 'ps2_vlozeno', 'ps2_schvaleno', 'interne_3', 'ps2_vlozeno4', 'ps2_schvaleno5', 'project_no', 'comment']
// })


async function addProjects(path) {
  const file = XLSX.readFile(path, {
    cellDates: true
  })

  const sheetName = file.SheetNames[0]
  const sheet = file.Sheets[sheetName]

  return XLSX.utils.sheet_to_json(sheet, {
    header: ['_id', 'project_name', 'project_PM', 'pm_phone', 'pm_email', 'customer', 'customer_address',
    'customer_contact_person', 'customer_contact_person_email', 'customer_contact_person_phone', 'quotation_number'],
    range: 1
  })
} 

export let projectsImport = addProjects