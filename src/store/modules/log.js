import store from '../index'
import username from 'username'
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteLog = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/log')
const log = new PouchDB('src/db/log')

log.sync(remoteLog, {
  live: true,
  retry: true,
  batch_size: 100,
  "selector": {
    "target": {
        "$in": [
          "all",
          username.sync()
        ]
    }
  }
}).on('change', e => {
  if (c.direction === 'pull') {
    store.dispatch('addNotifications', e.change.docs)
  }
})

const state = {

}

const getters = {

}

const actions = {

}

const mutations = {

}

export default {
  state,
  getters,
  actions,
  mutations
}