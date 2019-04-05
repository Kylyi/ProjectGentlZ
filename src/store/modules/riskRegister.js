import path from 'path';
import fs from 'fs';
import { readFile } from '../../main/scripts/misc';
const isDev = require('electron-is-dev')
import { projectsDb } from './projects'

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
  async changeProjectRiskRegister({ dispatch, rootState }, {editedRiskRegister, netId}) {
    try {
      if (!netId) return
      const projId = netId
      await projectsDb.upsert(projId, doc => {
        doc.riskRegister = editedRiskRegister
        return doc
      })
      dispatch('fetchAllProjectsBasic', true)
      dispatch('notify', {
        text: 'Saved.',
        color: 'success',
        state: 'true'
      })
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