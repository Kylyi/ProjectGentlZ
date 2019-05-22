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
  customDialogBody: null,
  peopleFilter: {},
  peopleSameLevel: []
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
  customDialogBody: state => state.customDialogBody,
  peopleFilter: state => state.peopleFilter,
  peopleSameLevel: state => state.peopleSameLevel
}

const actions = {
  async notify({ commit }, snackbar) {
    commit('setSnackbar', snackbar)
  },
  async checkConnectivity({ commit, dispatch }, online) {
    try {
      dispatch('checkDatabaseConnectivity')
      await fetch('http://40.113.87.17:5984/')
      commit('setOffline', true)
    } catch (error) {
      commit('setOffline', false)
    }
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
  },
  async setPeopleFilter({ commit, rootState }) {
    Array.prototype.unique = function() {
      return this.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
      });
    }

    const hier = rootState.settings.heirarchySettings
    let hierE = {x: []}
    let groups = []
    let allPeople = []

    function getHierE(arr, path, level) {
      let idx = 0
      arr.forEach(p => {
        if (!path) {
          
          hierE.x.push({
            text: p.title,
            value: {
              lookup: p.title,
              val: p['data']['sapUsername']
            }
          })

          if (p.hasOwnProperty('children')) {
            groups.push('1')
            getHierE(p.children, hierE.x[idx], 2)
          }

          idx++

        } else {
          path.items = path.items || []
          path.items.push({
            text: p.title,
            value: {
              lookup: p.title,
              val: p['data']['sapUsername']
            }
          })
          allPeople.push({
            gentlId: p['data']['gentlId'],
            supervisors: p['data']['supervisors'],
            sapUsername: p['data']['sapUsername']
          })

          if (p.hasOwnProperty('children')) {
            groups.push(String(level))
            getHierE(p.children, path.items[idx], level + 1)
          }

          idx++
        }

      })
    }
    getHierE(hier)
    commit('setPeopleFilter', {
      groupInterval: groups.unique(),
      dataSource: hierE.x
    })
    commit('setPeopleSameLevel', allPeople)
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
  setCustomDialogBody: (state, body) => state.customDialogBody = body,
  setPeopleFilter: (state, filter) => state.peopleFilter = filter,
  setPeopleSameLevel: (state, people) => state.peopleSameLevel = people
}

export default {
  state,
  getters,
  actions,
  mutations
}