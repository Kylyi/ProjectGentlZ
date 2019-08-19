import store from '../index'
import PouchDB from 'pouchdb'
import username from 'username'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteSettings = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/settings')
const settings = new PouchDB(`${process.env.APPDATA}/GentlDatabase/settings`)
settings.sync(remoteSettings, { live: true, retry: true, batch_size: 50 })
  .on('change', (c) => {
    console.dir(c)
    if (c.direction === 'pull') {
      store.dispatch('fetchInvoicingSettings', true)
      store.dispatch('fetchHierarchySettings')
      store.dispatch('fetchCostsSettings')
    }
  })

const state = {
  invoicingSettings: null,
  hierarchySettings: null,
  costsSettings: {}
}

const getters = {
  invoicingSettings: state => state.invoicingSettings,
  hierarchySettings: state => state.hierarchySettings,
  costsSettings: state => state.costsSettings
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
      commit('setHierarchySettings', hierSettings)
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
      dispatch('fetchHierarchySettings')
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
  },
  async overwriteCostsSettings({ dispatch, commit }, data) {
    try {
      let newDoc
      await settings.upsert('costs', doc => {
        Object.assign(doc.realData, data.realData)
        doc.lastUpdate = data.lastUpdate
        doc.lastUpdateMonth = data.lastUpdateMonth
        newDoc = JSON.parse(JSON.stringify(doc))
        return doc
      })
      dispatch('notify', {
        text: 'Saved.',
        state: true,
        color: 'success'
      })
      delete newDoc['_id']
      delete newDoc['_rev']
      commit('setCostsSettings', newDoc)
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  },
  async fetchCostsSettings({ commit, dispatch }) {
    try {
      const costsSettings = await settings.get('costs')
      commit('setCostsSettings', costsSettings)
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  }
}

const mutations = {
  setInvoicingSettings: (state, invSettings) => state.invoicingSettings = invSettings,
  setHierarchySettings: (state, hierSettings) => state.hierarchySettings = hierSettings,
  setCostsSettings: (state, data) => state.costsSettings = data
}

export default {
  state,
  getters,
  actions,
  mutations
}