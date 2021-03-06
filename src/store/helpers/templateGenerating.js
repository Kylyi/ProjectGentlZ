import JSZip from 'jszip'
import Docxtemplater from 'docxtemplater'
const XlsxTemplate = require('xlsx-template')
const XLSX = require('xlsx')
import fs from 'fs'
import path from 'path'

export let generateDocx = async function (data, fillData = true) {
  const content = data.tmplData
  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  doc.loadZip(zip);
  doc.setData(data.projData)

  try {
    if (fillData) doc.render() 
  } catch (error) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({ error: e }));

    throw error
  }
  const buf = doc.getZip()
    .generate({
      type: 'nodebuffer'
    });

  return fs.writeFileSync(path.resolve(data.savePath), buf);
}

export let generateXlsx = async function (data, fillData = true) {
  const template = new XlsxTemplate(data.tmplData)
  const wb = XLSX.read(data.tmplData, {
    type: 'array'
  })

  const values = data.projData
  if (fillData) {
    for (let shNum = 1; shNum <= wb.SheetNames.length; shNum++) {
      template.substitute(shNum, values)
    }
  }

  const buf = template.generate({
      type: 'nodebuffer'
    });

  return fs.writeFileSync(path.resolve(data.savePath), buf);



  // const wb = XLSX.read(data.tmplData, {
  //   type: 'array'
  // })

  // const regExp = /([${]{2}[a-z ]+\})/gi
  // wb.SheetNames.forEach(sh => {
  //   Object.values(wb.Sheets[sh]).forEach(cell => {
  //     if (cell.hasOwnProperty('v')) {
  //       (String(cell.v).match(regExp) || []).forEach(val => {
  //         cell.v = cell.v.replace(val, data.projData[val.slice(2, val.length - 1)])
  //       })
  //     }
  //   })
  // })
  
  // XLSX.writeFile(wb, data.savePath, {
  //   Props: {
  //     'Program name': 'Gentl.'
  //   }
  // })

}