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
      }
    }))
  }
}

