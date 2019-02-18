import PouchDB from 'pouchdb'
var replicationStream = require('pouchdb-replication-stream')

PouchDB.plugin(replicationStream.plugin)
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))
PouchDB.plugin(require('pouchdb-upsert-bulk'))

const {ipcRenderer} = require('electron')
const {ipcMain} = require('electron')

const fs = require('fs');
const path = require('path')

const remoteProjects = new PouchDB('https://admin:bf9cc5c5bfb6@couchdb-615ac0.smileupps.com/projects/')
const remotePeople = new PouchDB('https://admin:bf9cc5c5bfb6@couchdb-615ac0.smileupps.com/people/')
const remoteTemplates = new PouchDB('https://admin:bf9cc5c5bfb6@couchdb-615ac0.smileupps.com/templates/')
const remoteQuots = new PouchDB('https://admin:bf9cc5c5bfb6@couchdb-615ac0.smileupps.com/quotations/')
const remoteBillings = new PouchDB('https://admin:bf9cc5c5bfb6@couchdb-615ac0.smileupps.com/billings/')

const projects = new PouchDB('src/db/projects')
const people = new PouchDB('src/db/people')
const templates = new PouchDB('src/db/templates')
const quots = new PouchDB('src/db/quotations')
const billings = new PouchDB('src/db/billings')
const settings = new PouchDB('src/db/settings')

settings.allDocs({
  include_docs: true,
  attachments: true
}).then( res => {
  if (res.total_rows === 0) {
    return settings.put({
      _id: 'billings',
      dates_modified: []
    })
  }
})

// projects.sync(remoteProjects, { live: true, retry: true })
//   .on('change', (change) => {
//     if (change.direction === 'pull') {
//       change.change.docs.forEach(e => {
//         ipcRenderer.send('new-project-downloaded', e)
//       })
//     }
//   })

// people.sync(remotePeople, {live: true, retry: true})
//   .on('change', (change) => {
//     console.dir(change)
//   })

// templates.sync(remoteTemplates, { live: true, retry: true })
//   .on('change', (change) => {
//     if (change.direction === 'pull') {

//       let atts = []

//       change.change.docs.forEach(e => {
//         if (e.hasOwnProperty('_attachments')) {

//           atts = [...atts, e._id]

//           // Object.keys(e._attachments).forEach(k => {
//           //   const att = e._attachments[k]

//           //   // fs.writeFile(path.resolve(__static, k), att.data, (err) => {
//           //   //   if (err) throw err
//           //   // })
//           // })
//         }
//       })

//       ipcRenderer.send('new-template-downloaded', atts)
//     }
//   })

// quots.sync(remoteQuots, {
//     live: true,
//     retry: true
//   })
//   .on('change', (change) => {
//     console.dir(change)
//   })

// billings.sync(remoteBillings, {
//     live: true,
//     retry: true
//   })
//   .on('change', (change) => {
//     console.dir(change)
//   })

export default {
  projects: projects,
  people: people,
  templates: templates,
  quots: quots,
  billings: billings,
  settings: settings
}
