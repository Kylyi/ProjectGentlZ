import { projectsDb } from './projects'
import { readDefaultSettingFile, rewriteDefaultSettingFile } from '../helpers/localFilesManipulation'
import _ from 'underscore'

const state = {
  defaultRiskRegister: [],
  selectedProjectRR: null
}

const getters = {
  defaultRiskRegister: state => state.defaultRiskRegister,
  projectsRiskRegister: (state, getters) => {
    let projectsNoRR = []
    let projectsWithRR = JSON.parse(JSON.stringify(getters.allProjectsProjectsMode))

    projectsWithRR = projectsWithRR.map(e => {
      if (e.riskRegisterBilance && !e.riskRegisterBilance.draft) {
        return e.riskRegisterBilance.chartData.map(x => {
          x['dateChanged'] = e.riskRegisterBilance.dateChanged
          x['Project Definition'] = e['Project Definition']
          x['Project Manager'] = e['Project Manager']
          x['Project Name'] = e['Project Name']
          return x
        })
      } else {
        projectsNoRR.push(e)
      }
    })
    projectsWithRR = projectsWithRR.filter(e => e)

    return {
      noRR: projectsNoRR,
      withRR: _.flatten(projectsWithRR)
    }
  },
  selectedProjectRR: (state, getters) => {
    if (!state.selectedProjectRR) return {}

    let projs = JSON.parse(JSON.stringify(getters.projectsRiskRegister['withRR']))
    const projId = state.selectedProjectRR.rowPath[0]
    const projName = state.selectedProjectRR.rowPath[1]
    const mainCategory = state.selectedProjectRR.columnPath[0]
    const category = state.selectedProjectRR.columnPath[1]

    let projData = projs.filter(e => ( e['Project Definition'] === projId ))
    const totalMainCategory = projData.reduce((agg, e) => {
      if (e.mainCategory === mainCategory) return agg += e.priceImpact
      else return agg
    }, 0)
    projData = projData.filter(e => e.category === category)
    const totalCategory = projData.reduce((agg, e) => agg += e.priceImpact, 0)

    return {
      chartData: projData,
      projId,
      projName,
      mainCategory,
      category,
      totalMainCategory,
      totalCategory
    }
  }
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
      const date = new Date()
      await projectsDb.upsert(projId, doc => {
        doc.riskRegister = editedRiskRegister
        doc.riskRegister.dateChanged = date.toISOString().substr(0,10)
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
  },
  selectProjectRR({ commit }, cellData) {
    commit('setSelectedProjectRR', cellData)
  }
}

const mutations = {
  async setDefaultRiskRegister(state, defaultRiskRegister) {state.defaultRiskRegister = defaultRiskRegister},
  setSelectedProjectRR: (state, cellData) => state.selectedProjectRR = cellData
}

export default {
  state,
  getters,
  actions,
  mutations
}