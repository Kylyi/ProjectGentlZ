import PouchDB from 'pouchdb'
import username from 'username'
const SecurePouch = require('polyonic-secure-pouch')
import store from '../../store/index'

PouchDB.plugin(SecurePouch)
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))
PouchDB.plugin(require('pouchdb-upsert-bulk'))

const {ipcRenderer} = require('electron')

const remoteProjects = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/projects', { revs_limit: 2 })
const remoteUsers = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/users')
const remoteBillings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/billings')
const remoteSettings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/settings')
const remoteTemplates = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/templates')
const remoteLog = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/log')

const projects = new PouchDB('src/db/projects', { revs_limit: 2 })
// const people = new PouchDB('src/db/people')
const templates = new PouchDB('src/db/templates')
// const quots = new PouchDB('src/db/quotations')
const billings = new PouchDB('src/db/billings', { revs_limit: 2 })
const settings = new PouchDB('src/db/settings')
const user = new PouchDB('src/db/user')
const log = new PouchDB('src/db/log')

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

billings.sync(remoteBillings, { live: true, retry: true })

settings.sync(remoteSettings, { live: true, retry: true })


user.sync(remoteUsers, {
  selector: {
    _id: username.sync()
  },
  live: true,
  retry: true
}).on('change', e => {
  store.dispatch('addNotification', {
    notification: {
      name: 'User changed',
      info: 'Your account was changed.',
      notify: true,
      type: 'info'
    }
  })
  getUserInfo()
})

log.sync(remoteLog, {
  live: true,
  retry: true
}).on('change', e => {
    if (e.direction === 'pull') {
      console.log('Pulled')

      const uniqueActions = e.change.docs.reduce((agg, e) => {
        const isIn = agg.filter(x => {
          return (x.notification.action === e.notification.action) && (x.notification.actionArgs === e.notification.actionArgs) 
        })

        return isIn ? agg : [...agg, e]
      }, [e.change.docs[0]])

      uniqueActions.forEach(action => {
        action.log = false;
        store.dispatch("addNotification", action);
      })
    }
})

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
  projects,
  templates,
  billings,
  settings,
  user,
  log
}
