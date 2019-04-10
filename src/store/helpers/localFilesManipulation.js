const isDev = require('electron-is-dev')
const fs = require('fs')
const iconvlite = require('iconv-lite')
const path = require('path')

const readFile = function readFileSync_encoding(filename, encoding) {
  const content = fs.readFileSync(filename);
  return iconvlite.decode(content, encoding);
}

export let rewriteDefaultSettingFile = async function ( fileName, data ) {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', `${fileName}.json`) : path.join(path.dirname(__dirname), 'defaultSettings', `${fileName}.json`)
  return fs.writeFileSync(p, JSON.stringify(data), 'utf8')
}

export let readDefaultSettingFile = function ( fileName ) {
  const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', `${fileName}.json`) : path.join(path.dirname(__dirname), 'defaultSettings', `${fileName}.json`)
  return readFile( p, 'utf-8' )
}

