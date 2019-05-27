import store from '../index'
import PouchDB from 'pouchdb'
import username from 'username'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteSettings = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/settings')
const settings = new PouchDB('src/db/settings')
settings.sync(remoteSettings, { live: true, retry: true, batch_size: 50 })
  .on('change', (c) => {
    console.dir(c)
    if (c.direction === 'pull') {
      store.dispatch('fetchInvoicingSettings', true)
      store.dispatch('fetchHierarchySettings')
    }
  })

const state = {
  invoicingSettings: null,
  heirarchySettings: null
}

const getters = {
  invoicingSettings: state => state.invoicingSettings,
  heirarchySettings: state => state.heirarchySettings
}

const actions = {
  async fetchInvoicingSettings({ commit }) {
    try {
      const invSettings = await settings.get('invoicing')
      commit('setInvoicingSettings', invSettings)
    } catch (error) {
      commit('setInvoicingSettings', {})
    }
  },
  async fetchHierarchySettings({ commit }) {
    try {
      const hierSettings = await settings.get('hierarchy')
      commit('setHierarchySettings', hierSettings.hier)
    } catch (error) {
      commit('setHierarchySettings', [])
    }
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
  },
  async overwriteHierarchySettings({ dispatch }, hierSettings) {
    try {
      await settings.upsert('hierarchy', doc => {
        doc.hier = hierSettings
        return doc
      })
      dispatch('notify', {
        text: 'Saved.',
        state: true,
        color: 'success'
      })
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  },
  async setUserView({ dispatch }, view) {
    try {
      const userN = username.sync().toLowerCase()
      await settings.upsert('invoicing', doc => {
        doc.views[userN] = view
        return doc
      })
      
      await dispatch('fetchInvoicingSettings')
      dispatch('getInvoicingSettings')
    } catch (err) {
      
    }
  }
}

const mutations = {
  setInvoicingSettings: (state, invSettings) => state.invoicingSettings = invSettings,
  setHierarchySettings: (state, hierSettings) => state.heirarchySettings = hierSettings
}

export default {
  state,
  getters,
  actions,
  mutations
}