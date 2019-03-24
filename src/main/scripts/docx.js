const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');

const fs = require('fs');
const path = require('path');


// const zip = new JSZip(content);

async function generate(data, callback) {
  // Load the docx file as a binary
  // const content = fs.readFileSync(path.resolve(__static, data.tmplName), 'binary');

  const content = data.tmplData

  const zip = new JSZip(content);

  const doc = new Docxtemplater();
  doc.loadZip(zip);

  doc.setData(data.projData)

  try {
    doc.render()
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

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(data.savePath), buf);
  callback(data.savePath)

}

export default generate