  const fs = require('fs')
  const iconvlite = require('iconv-lite')

export let readFile = function readFileSync_encoding(filename, encoding) {
  var content = fs.readFileSync(filename);
  return iconvlite.decode(content, encoding);
}