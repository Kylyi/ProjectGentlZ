import store from '../index'
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteSettings = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/settings')
const settings = new PouchDB('src/db/settings')
settings.sync(remoteSettings, { live: true, retry: true, batch_size: 50 })
  .on('change', (c) => {
    if (c.direction === 'pull') {
      store.dispatch('fetchInvoicingSettings', true)
    }
  })

const state = {
  invoicingSettings: null
}

const getters = {
  invoicingSettings: state => state.invoicingSettings
}

const actions = {
  async fetchInvoicingSettings({ commit }) {
    const invSettings = await settings.get('invoicing')
    console.log(invSettings)
    commit('setInvoicingSettings', invSettings)
  },
  async overwriteInvoicingSettings() {
    return settings.upsert('invoicing', doc => {
      const today = new Date().toISOString().substr(0,10)
      if (doc.hasOwnProperty('datesModified')) {
        doc['datesModified'].includes(today) ? null : doc['datesModified'].push(today)
      } else {
        doc['datesModified'] = [today]
      }
      doc.lastUpdate = today
      return doc
    })
  }
}

const mutations = {
  setInvoicingSettings: (state, invSettings) => state.invoicingSettings = invSettings
}

export default {
  state,
  getters,
  actions,
  mutations
}