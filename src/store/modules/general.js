import db from '../../main/scripts/database'
import path from 'path'
import { readFile } from '../../main/scripts/misc'
const isDev = require('electron-is-dev')
const sql = require("mssql/msnodesqlv8")
const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))

const state = {
  offline: true,
  snackbar: { text: null, color: null, state: null },
  notifications: [],
  dbConnectivity: false
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
  dbConnectivity: state => state.dbConnectivity
}

const actions = {
  async notify({ commit }, snackbar) {
    commit('setSnackbar', snackbar)
  },
  async checkConnectivity({ commit, dispatch }, online) {
    commit('setOffline', online)
    dispatch('checkDatabaseConnectivity')
  },
  async addNotification({ commit, dispatch },
    { notification, log, forceActionSelf, forceActionOthers, ...others }) {
    
    if (log) {
      const notifPlaceholder = JSON.parse(JSON.stringify(notification))
      notifPlaceholder.actionDone = false
      db.log.upsert(notification.name, doc => {return {notification: notifPlaceholder, log, forceActionSelf: forceActionOthers, ...others}})
    } 
    if (forceActionSelf) {
      dispatch(notification.action, notification.actionArgs)
      notification.actionDone = true
    }
    if (notification.notify) commit('addNotification', notification)
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
  async deleteLocalStorage() {
    localStorage.clear()
  }
}

const mutations = {
  setSnackbar: (state, snackbar) => state.snackbar = snackbar,
  setOffline: (state, online) => state.offline = !online,
  addNotification: (state, notification) => state.notifications.push(notification),
  removeNotification: (state, notifName) => {
    state.notifications = state.notifications.filter(e => e.name !== notifName)
  },
  setDatabaseConnectivity: (state, dbConnectivity) => state.dbConnectivity = dbConnectivity
}

export default {
  state,
  getters,
  actions,
  mutations
}