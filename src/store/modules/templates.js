import db from '../../main/scripts/database'
import { ipcRenderer } from 'electron';
const { dialog } = require('electron').remote
import fs from 'fs'

const state = {
  allTemplatesBasic: [],
  chosenTemplates: [],
  generateTemplateDialog: false,
  openAfterGenerate: 'no',
  generatorSelectionMode: 'net'
}

const getters = {
  allTemplatesBasic: state => state.allTemplatesBasic,
  chosenTemplates: state => state.chosenTemplates,
  generateTemplateDialog: state => state.generateTemplateDialog,
  openAfterGenerate: state => state.openAfterGenerate,
  generatorSelectionMode: state => state.generatorSelectionMode
}

const actions = {
  async fetchAllTemplates({ commit, dispatch }, force) {
    async function getTmpls() {
      return await db.templates.find({ selector: { _id: { $gt: null } }, limit: null })
    }

    if (force) {
      const tmpls = await getTmpls()
      const z = tmpls.docs.reduce((agg, e) => {
        const x = agg.map(a => a.label === e.template_type)
        const y = x.indexOf(true)
        if (y === -1) agg = [...agg, {
          label: e.template_type,
          options: [e]
        }]
        else agg[y]['options'].push(e)
        return agg
      }, [])

      localStorage.setItem('allTemplatesBasic', JSON.stringify(z))
      commit('setAllTemplatesBasic', z)
      dispatch('notify', {
        text: 'Templates were imported successfuly.',
        color: 'success',
        state: true
      })
      
    } else if (!localStorage.getItem('allTemplatesBasic') && !force) {
      const tmpls = await getTmpls()
      const z = tmpls.docs.reduce((agg, e) => {
        const x = agg.map(a => a.label === e.template_type)
        const y = x.indexOf(true)
        if (y === -1) agg = [...agg, {
          label: e.template_type,
          options: [e]
        }]
        else agg[y]['options'].push(e)
        return agg
      }, [])

      localStorage.setItem('allTemplatesBasic', JSON.stringify(z))
      commit('setAllTemplatesBasic', z)
    } else {
      commit('setAllTemplatesBasic', JSON.parse(localStorage.getItem('allTemplatesBasic')))
    }
  },
  async chooseTemplate({ commit }, tmplNames) {
    commit('setChosenTemplates', tmplNames)
  },
  async generateTemplate({ commit, rootState, dispatch }, single) {
    const tmplDataObj = rootState.templates.chosenTemplates
    const projData = rootState.projects.chosenProjects

    if (tmplDataObj.length > 0 && projData.length > 0) {
      projData.forEach(p => {
            tmplDataObj.forEach(t => {
              async function generate() {
                try {
                  // GET PROJECT DATA
                  let pData
                  if (single === 'true') { pData = projData[0] }
                  // else { pData = await db.projects.get(String(p)) }
                  else { pData = p } 

                  // GET TEMPLATE DATA
                  const tData = await db.templates.getAttachment(t._id, t.template_name)

                  dialog.showSaveDialog(null, {
                    title: 'Save document',
                    defaultPath: t['template_name'],
                    buttonLabel: 'Save',
                    filters:t['template_type'] === 'xlsx' ? [{name: 'Excel', extensions: ['xlsx']}] : [{name: 'Microsoft word', extensions: ['docx']}]
                  }, path => {
                    if (path) ipcRenderer.send('tmpl-gen', {savePath: path, projData: pData, tmplData: tData, tmplType: t['template_type']})
                  })
                } catch (error) {
                  dispatch('notify', {
                    text: error,
                    color: 'error',
                    state: 'true'
                  })
                }
              }
              generate()
        })
      })
    }

    commit('setGenerateTemplateDialog', false)
  },
  async openGenerateTemplateDialog({ commit }, val) {
    commit('setGenerateTemplateDialog', val )
  },
  async changeOpenAfterGenerate({ commit }, val) {
    if (!val) {
      const docOpen = localStorage.getItem('docOpen') ? localStorage.getItem('docOpen') : 'no'
      commit('setOpenAfterGenerate', docOpen)
    } else {
      localStorage.setItem('docOpen', val)
      commit('setOpenAfterGenerate', val)
    }
  },
  async changeGeneratorSelectionMode({ commit, dispatch, rootState }, val) {
    if (!val) {
      // const mode = localStorage.getItem('generatorMode') ? localStorage.getItem('generatorMode') : 'net'
      const mode = rootState.templates.generatorSelectionMode === 'net' ? 'project' : 'net'
      localStorage.setItem('generatorMode', mode)
      commit('setGeneratorSelectionMode', mode)
      dispatch('chooseProjects', [])
    } else {
      localStorage.setItem('generatorMode', val)
      commit('setGeneratorSelectionMode', val)
      dispatch('chooseProjects', [])
    }
  },
  async addTemplate({ dispatch }, tmpl = null) {
    try {
      const att = fs.readFileSync(tmpl.filePath)

      const insertedTmpl = await db.templates.upsert(tmpl.template_name, (doc) => {
        doc.template_type = tmpl.fileType
        doc.template_name = tmpl.fileName
        return doc
      })
      await db.templates.putAttachment(tmpl.template_name, tmpl.fileName, insertedTmpl.rev, att, tmpl.fileType)
      dispatch('fetchAllTemplates', true)

    } catch (err) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: true
      })
    }
  }
}

const mutations = {
  setAllTemplatesBasic: (state, tmpls) => state.allTemplatesBasic = tmpls,
  setChosenTemplates: (state, tmplNames) => state.chosenTemplates = tmplNames,
  setGenerateTemplateDialog: (state, val) => state.generateTemplateDialog = val,
  setOpenAfterGenerate: (state, val) => state.openAfterGenerate = val,
  setGeneratorSelectionMode: (state, val) => state.generatorSelectionMode = val
}

export default {
  state,
  getters,
  actions,
  mutations
}