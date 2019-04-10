// import PouchDB from 'pouchdb'
// import username from 'username'
// const SecurePouch = require('polyonic-secure-pouch')
// import store from '../../store/index'

// PouchDB.plugin(SecurePouch)
// PouchDB.plugin(require('pouchdb-find'))
// PouchDB.plugin(require('pouchdb-upsert'))
// PouchDB.plugin(require('pouchdb-upsert-bulk'))

// const {ipcRenderer} = require('electron')

// MY DB
// const remoteUsers = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/users')
// const remoteBillings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/billings')
// const remoteSettings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/settings')
// const remoteTemplates = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/templates')
// const remoteLog = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/log')

// ABB DB
// const remoteUsers = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/users')
// const remoteBillings = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/billings')
// const remoteSettings = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/settings')
// const remoteTemplates = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/templates')
// const remoteLog = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/log')

// LOCAL DB
// const projects = new PouchDB('src/db/projects', { revs_limit: 3 })
// const templates = new PouchDB('src/db/templates', { revs_limit: 3 })
// const billings = new PouchDB('src/db/billings', { revs_limit: 2 })
// const settings = new PouchDB('src/db/settings')
// const user = new PouchDB('src/db/user')
// const log = new PouchDB('src/db/log')


// user.encrypt('#')

// settings.allDocs({
//   include_docs: true
// }).then(res => {
//   if (res.total_rows === 0) {
//     return settings.put({
//       _id: 'billings',
//       dates_modified: []
//     })
//   }
// })


// projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
//   .on('change', (c) => {
//     console.log(c)
//     store.dispatch('fetchAllProjectsBasic', true)
//   })

// templates.sync(remoteTemplates, { live: true, retry: true, batch_size: 50 })
//   .on('change', (c) => {
//     if (c.direction === 'pull') {
//       store.dispatch('fetchAllTemplates', true)
//     }
//   })

// billings.sync(remoteBillings, { live: true, retry: true })
// settings.sync(remoteSettings, { live: true, retry: true })


// user.sync(remoteUsers, {
//   live: true,
//   retry: true,
//   "selector": {
//     "_id": {
//        "$eq": username.sync()
//     }
//   }
// }).on('change', e => {
//   getUserInfo()
// })

// log.sync(remoteLog, {
//   live: true,
//   retry: true,
//   batch_size: 100,
//   "selector": {
//     "target": {
//        "$in": [
//          "all",
//          username.sync()
//        ]
//     }
//   }
// }).on('change', e => {
//   store.dispatch('addNotifications', e.change.docs)
// })

// async function getUserInfo() {
//   const loggedUser = username.sync()
//   try {
//     const currentUser = await user.get(loggedUser)
//     ipcRenderer.send('userInfo', currentUser)
//   } catch {
//     ipcRenderer.send('userInfo', null)
//   }
// }
// getUserInfo()

// export default {
  // projects,
  // templates,
  // billings,
  // settings,
  // user,
  // log
// }
