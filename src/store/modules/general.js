import path from 'path'
import { readFile } from '../../main/scripts/misc'
const isDev = require('electron-is-dev')
const sql = require("mssql/msnodesqlv8")
const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const state = {
  offline: true,
  snackbar: { text: null, color: null, state: null, timeout: 3000 },
  notifications: [],
  dbConnectivity: false,
  revision: '2',
  currentPosition: {left: 0, top: 0},
  customDialogBody: null
}

const getters = {
  offline: (state) => state.offline,
  snackbar: (state) => state.snackbar,
  notifications: state => {
    return state.notifications.reduce((agg, e) => {
      const idx = agg.map(x => x.type === e.type).indexOf(true)
      agg[0].notifs.push(e)
      agg[idx].notifs.push(e)

      return agg
    }, [
      {type: 'all', notifs: []},
      {type: 'error', notifs: []},
      {type: 'info', notifs: []},
      {type: 'success', notifs: []}
    ])
  },
  dbConnectivity: state => state.dbConnectivity,
  revision: state => state.revision,
  currentPosition: state => state.currentPosition,
  customDialogBody: state => state.customDialogBody
}

const actions = {
  async notify({ commit }, snackbar) {
    commit('setSnackbar', snackbar)
  },
  async checkConnectivity({ commit, dispatch }, online) {
    commit('setOffline', online)
    dispatch('checkDatabaseConnectivity')
  },
  async addNotifications({ commit, dispatch }, notifications) {
    const notifs = notifications.reduce((agg, e) => {
      const isIn = agg.map(n => n.actionId === e.actionId).indexOf(true)
      
      if (isIn !== -1) {
        agg[isIn].actionArgs = agg[isIn].actionArgs.concat(e.actionArgs)
        return agg
      } else {
        return [...agg, e]
      }
    }, [])

    notifs.forEach(n => {
      if (n.actionForce) dispatch(n.actionName, n.actionArgs)
      commit('addNotification', n)
    });
  },
  async removeNotification({ commit }, notifName) {
    commit('removeNotification', notifName)
  },
  async checkDatabaseConnectivity({ commit }) {
    try {
      const pool = await conn.connect()
      commit('setDatabaseConnectivity', pool['_connected'])
      conn.close()
    } catch (err) {
      conn.close()
      commit('setDatabaseConnectivity', false)
    }
  },
  async clearLocalStorage() {
    localStorage.clear()
  },
  async setCurrentPosition({ commit }, e) {
    commit('setCurrentPosition', { x: e.clientX, y: e.clientY })
  },
  async setCustomDialogBody({ commit }, body) {
    commit('setCustomDialogBody', body)
  }
}

const mutations = {
  setSnackbar: (state, snackbar) => state.snackbar = snackbar,
  setOffline: (state, online) => state.offline = !online,
  addNotification: (state, notification) => state.notifications.push(notification),
  removeNotification: (state, notifName) => {
    state.notifications = state.notifications.filter(e => e.name !== notifName)
  },
  setDatabaseConnectivity: (state, dbConnectivity) => state.dbConnectivity = dbConnectivity,
  setCurrentPosition: (state, { x, y }) => {
    state.currentPosition['left'] = x
    state.currentPosition['top'] = y
  },
  setCustomDialogBody: (state, body) => state.customDialogBody = body
}

export default {
  state,
  getters,
  actions,
  mutations
}