import { projectsDb } from './projects'
import { readDefaultSettingFile, rewriteDefaultSettingFile } from '../helpers/localFilesManipulation'

const state = {
  defaultRiskRegister: []
}

const getters = {
  defaultRiskRegister: state => state.defaultRiskRegister
}

const actions = {
  async fetchDefaultRiskRegister({ commit }) {
    const defaultRiskRegister = readDefaultSettingFile('defaultRiskRegister')
    commit('setDefaultRiskRegister', JSON.parse(defaultRiskRegister))
  },
  setDefaultRiskRegisterTemplate({}, defaultRiskRegister) {
    rewriteDefaultSettingFile('defaultRiskRegister', defaultRiskRegister)
  },
  async changeProjectRiskRegister({ dispatch }, {editedRiskRegister, netId}) {
    try {
      if (!netId) return
      const projId = netId
      await projectsDb.upsert(projId, doc => {
        doc.riskRegister = editedRiskRegister
        return doc
      })
      dispatch('fetchAllProjectsBasic')
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