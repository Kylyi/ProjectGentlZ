import { shell } from 'electron';
const { dialog } = require('electron').remote
import fs from 'fs'
import { generateDocx, generateXlsx } from '../helpers/templateGenerating'

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteTemplates = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/templates')
const templates = new PouchDB('src/db/templates', { revs_limit: 3 })

templates.sync(remoteTemplates, { live: true, retry: true, batch_size: 50 })
  .on('change', (c) => {
    if (c.direction === 'pull') {
      store.dispatch('fetchAllTemplates', true)
    }
  })

const state = {
  allTemplatesBasic: [],
  chosenTemplates: [],
  generateTemplateDialog: false,
  openAfterGenerate: localStorage.getItem('docOpen') || 'no',
  generatorSelectionMode: localStorage.getItem('generatorMode') || 'net'
}

const getters = {
  allTemplatesBasic: state => state.allTemplatesBasic,
  allTemplatesByType: (getters) => {
    if (getters.allTemplatesBasic.length === 0) return []

    return getters.allTemplatesBasic.reduce((agg, e) => {
      const x = agg.map(a => a.label === e.template_type)
      const y = x.indexOf(true)
      if (y === -1) agg = [...agg, {
        label: e.template_type,
        options: [e]
      }]
      else agg[y]['options'].push(e)
      return agg
    }, [])
  },
  chosenTemplates: state => state.chosenTemplates,
  generateTemplateDialog: state => state.generateTemplateDialog,
  openAfterGenerate: state => state.openAfterGenerate,
  generatorSelectionMode: state => state.generatorSelectionMode
}

const actions = {
  async fetchAllTemplates({ commit }) {
    async function getTmpls() {
      return await templates.find({ selector: { _id: { $gt: null } }, limit: null })
    }
    const tmpls = await getTmpls()
    commit('setAllTemplatesBasic', tmpls.docs)
  },
  async chooseTemplate({ commit }, tmplNames) {
    commit('setChosenTemplates', tmplNames)
  },
  async generateTemplate({ commit, rootState, dispatch }) {
    const tmplDataObj = rootState.templates.chosenTemplates
    const projData = rootState.projects.chosenProjects

    if (tmplDataObj.length > 0 && projData.length > 0) {
      projData.forEach(p => {
        tmplDataObj.forEach(t => {
          async function generate() {
            try {
              // GET PROJECT DATA
              const projData = p

              // GET TEMPLATE DATA
              const tmplData = await templates.getAttachment(t._id, t.template_name)

              const savePath = await dialog.showSaveDialog(null, {
                title: 'Save document',
                defaultPath: t['template_name'],
                buttonLabel: 'Save',
                filters: t['template_type'] === 'xlsx' ? [{name: 'Excel', extensions: ['xlsx']}] : [{name: 'Microsoft word', extensions: ['docx']}]
              })
              
              if (savePath) {
                const openFile = rootState.templates.openAfterGenerate === 'yes'
                if (t.template_type === 'docx') {
                  await generateDocx({savePath, projData, tmplData})
                  if (openFile) dispatch('openFile', savePath)
                } else if (t.template_type === 'xlsx') {
                  await generateXlsx({savePath, projData, tmplData})
                  if (openFile) dispatch('openFile', savePath)
                }
              }
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

      const insertedTmpl = await templates.upsert(tmpl.template_name, (doc) => {
        doc.template_type = tmpl.fileType
        doc.template_name = tmpl.fileName
        return doc
      })
      await templates.putAttachment(tmpl.template_name, tmpl.fileName, insertedTmpl.rev, att, tmpl.fileType)
      dispatch('fetchAllTemplates', true)

    } catch (err) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: true
      })
    }
  },
  async openFile({}, path) {
    shell.openItem(path)
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