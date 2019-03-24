import path from 'path';
import fs from 'fs';
import { readFile } from '../../main/scripts/misc';
const isDev = require('electron-is-dev')
import db from '../../main/scripts/database'

const state = {
  defaultRiskRegister: []
}

const getters = {
  defaultRiskRegister: state => state.defaultRiskRegister
}

const actions = {
  async fetchDefaultRiskRegister({ commit }) {
    const defaultRiskRegister = isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'defaultRiskRegister.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'defaultRiskRegister.json'), 'utf-8'))
    commit('setDefaultRiskRegister', defaultRiskRegister)
  },
  setDefaultRiskRegisterTemplate({}, defaultRiskRegister) {
    if (isDev) {
      fs.writeFileSync(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'defaultRiskRegister.json'), defaultRiskRegister);
    } else {
      fs.writeFileSync(path.join(path.dirname(__dirname), 'defaultSettings', 'defaultRiskRegister.json'), defaultRiskRegister);
    }
  },
  async changeProjectRiskRegister({ dispatch, rootState }, editedRiskRegister) {
    try {
      const projId = rootState.projects.chosenProjects[0]._id
      let proj
      await db.projects.upsert(projId, doc => {
        doc.riskRegister = editedRiskRegister
        proj = doc
        return doc
      })
      dispatch('addNotification', {
        notification: {
          name: `${projId}: Risk register edited.`,
          info: `Risk register for project ${projId} was just edited.`,
          type: "info",
          notify: true,
          action: "fetchPmProjectsBasic",
          actionInfo: "Refresh projects",
          actionArgs: {
            force: true
          }
        },
        log: true,
        forceActionSelf: true,
        forceActionOthers: false
      });
      dispatch('chooseProjects', proj)
    } catch (err) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: 'true'
      })
    }
  }
}

const mutations = {
  async setDefaultRiskRegister(state, defaultRiskRegister) {state.defaultRiskRegister = defaultRiskRegister}
}

export default {
  state,
  getters,
  actions,
  mutations
}