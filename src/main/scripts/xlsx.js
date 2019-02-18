const XlsxTemplate = require('xlsx-template')
const fs = require('fs');
const path = require('path');

async function generate(data, callback) {

  // const content = data.tmplData

  const template = new XlsxTemplate(data.tmplData)
  const sheetNumber = 1

  const values = data.projData

  template.substitute(sheetNumber, values)

  const buf = template.generate({
      type: 'nodebuffer'
    });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(data.savePath), buf);
  callback(data.savePath, data.docOpen)
}

export let generateXlsx = generate