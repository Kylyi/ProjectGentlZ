import PouchDB from 'pouchdb'
import username from 'username'
const SecurePouch = require('polyonic-secure-pouch')

PouchDB.plugin(SecurePouch)
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))
PouchDB.plugin(require('pouchdb-upsert-bulk'))

const {ipcRenderer} = require('electron')
const {ipcMain} = require('electron')

const fs = require('fs');
const path = require('path')

const remoteProjects = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/projects')
const remoteUsers = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/users')
const remoteBillings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/billings')
const remoteSettings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/settings')
const remoteTemplates = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/templates')

const projects = new PouchDB('src/db/projects')
// const people = new PouchDB('src/db/people')
const templates = new PouchDB('src/db/templates')
// const quots = new PouchDB('src/db/quotations')
const billings = new PouchDB('src/db/billings', { revs_limit: 2 })
const settings = new PouchDB('src/db/settings')
const user = new PouchDB('src/db/user')

user.encrypt('#')

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

projects.sync(remoteProjects, { live: true, retry: true })
  .on('change', (change) => {
    if (change.direction === 'pull') {
      change.change.docs.forEach(e => {
        ipcRenderer.send('new-project-downloaded', e)
      })
    }
  })

// people.sync(remotePeople, {live: true, retry: true})
//   .on('change', (change) => {
//     console.dir(change)
//   })

templates.sync(remoteTemplates, { live: true, retry: true })
  .on('change', (change) => {
    if (change.direction === 'pull') {

      let atts = []

      change.change.docs.forEach(e => {
        if (e.hasOwnProperty('_attachments')) {

          atts = [...atts, e._id]

          // Object.keys(e._attachments).forEach(k => {
          //   const att = e._attachments[k]

          //   // fs.writeFile(path.resolve(__static, k), att.data, (err) => {
          //   //   if (err) throw err
          //   // })
          // })
        }
      })

      ipcRenderer.send('new-template-downloaded', atts)
    }
  })

// quots.sync(remoteQuots, {
//     live: true,
//     retry: true
//   })
//   .on('change', (change) => {
//     console.dir(change)
//   })

billings.sync(remoteBillings, {
    live: true,
    retry: true
  })
  .on('change', (change) => {
    console.dir(change)
  })

settings.sync(remoteSettings, {
  live: true,
  retry: true
})
  .on('change', (change) => {
    console.dir(change)
  })

user.sync(remoteUsers, {
  selector: {
    _id: username.sync()
  },
  live: true,
  retry: true
}).on('change', e => {
  console.log(e)
  getUserInfo()
})

// var changes = remoteUsers.changes({
//   selector: {
//     _id: username.sync()
//   },
//   since: 'now',
//   live: true,
//   include_docs: true
// }).on('change', function (change) {
//   getUserInfo()
// })

async function getUserInfo() {
  const loggedUser = username.sync()
  try {
    const currentUser = await user.get(loggedUser)
    ipcRenderer.send('userInfo', currentUser)
  } catch {
    ipcRenderer.send('userInfo', null)
  }
}
getUserInfo()

export default {
  projects: projects,
  templates: templates,
  billings: billings,
  settings: settings,
  user: user
}
