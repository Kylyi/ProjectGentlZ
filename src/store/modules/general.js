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
    { notification, log, forceActionSelf, forceActionOthers } = { notification: {}, log: false, forceActionSelf: false, forceActionOthers: false }) {
    
      if (log) {
      const notifPlaceholder = notification
      db.log.upsert(notification.name, doc => {return {notification: notifPlaceholder, log, forceActionOthers}})
    } 
    if (forceActionSelf) {
      dispatch(notification.action, notification.actionArgs)
      notification.actionDone = true
    }
    if (notification.notify) commit('addNotification', notification)
  },
  async removeNotification({ commit }, notification) {
    commit('removeNotification', notification)
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
    
  }
}

const mutations = {
  setSnackbar: (state, snackbar) => state.snackbar = snackbar,
  setOffline: (state, online) => state.offline = !online,
  addNotification: (state, notification) => state.notifications.push(notification),
  removeNotification: (state, notificationId) => {
    const idx = state.notifications.map(e => e._id === notificationId).indexOf(true)
    state.notifications.splice(idx, 1)
  },
  setDatabaseConnectivity: (state, dbConnectivity) => state.dbConnectivity = dbConnectivity
}

export default {
  state,
  getters,
  actions,
  mutations
}