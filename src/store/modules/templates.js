import { shell } from 'electron';
const { dialog } = require('electron').remote
import fs from 'fs'
import { generateDocx, generateXlsx } from '../helpers/templateGenerating'
import * as blobUtil from 'blob-util'
import store from '../index'

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteTemplates = new PouchDB('http://Kyli:ivana#94@127.0.0.1:5984/templates')
const templates = new PouchDB('src/db/templates', { revs_limit: 3 })

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}

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
      const x = agg.map(a => a.label === e.templateCategory)
      const y = x.indexOf(true)
      if (y === -1) agg = [...agg, {
        label: e.templateCategory,
        options: [e]
      }]
      else agg[y]['options'].push(e)
      return agg
    }, [])
  },
  chosenTemplates: state => state.chosenTemplates,
  generateTemplateDialog: state => state.generateTemplateDialog,
  openAfterGenerate: state => state.openAfterGenerate,
  generatorSelectionMode: state => state.generatorSelectionMode,
  templateCategories: state => {
    let templateCategories = []
    state.allTemplatesBasic.forEach(tmpl => templateCategories.push(tmpl.templateCategory))
    return templateCategories.filter(tmpl => tmpl).unique()
  }
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
    const generatorSelectionMode = rootState.templates.generatorSelectionMode
    const tmplDataObj = rootState.templates.chosenTemplates
    const projData = rootState.projects.chosenProjects
    async function generate(projData, t, fillData = true) {
      try {
        // GET PROJECT DATA
        // let projData = p

        // GET TEMPLATE DATA
        const tmplData = await templates.getAttachment(t._id, t.template_name)

        const savePath = await dialog.showSaveDialog(null, {
          title: 'Save document',
          defaultPath: t['template_name'],
          buttonLabel: 'Save',
          filters: t['template_type'].startsWith('xls') ? [{name: 'Excel', extensions: ['xlsx', 'xlsm', 'xlsb']}] : [{name: 'Microsoft word', extensions: ['docx']}]
        })
        
        if (savePath) {
          const openFile = rootState.templates.openAfterGenerate === 'yes'
          if (t.template_type === 'docx') {
            await generateDocx({savePath, projData, tmplData}, fillData)
            if (openFile) dispatch('openFile', savePath)
          } else if (t.template_type.startsWith('xls')) {
            await generateXlsx({savePath, projData, tmplData}, fillData)
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

    if (tmplDataObj.length > 0 && projData.length === 0) {
      try {
        tmplDataObj.forEach(t => {
          generate({}, t, false)
        })
      } catch (error) {
        dispatch('notify', {
          text: error,
          color: 'error',
          state: 'true'
        })
      }
    } else if (tmplDataObj.length > 0 && projData.length > 0) {
      projData.forEach(p => {
        tmplDataObj.forEach(t => {
          if (generatorSelectionMode === 'net') {
            generate(p, t, true)
          } else {
            generate(p.nets[0], t, true)
          }
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
      if (!tmpl) throw 'Template not found'
      
      const attPaths = [tmpl.doc.filePath, tmpl.preview.filePath].filter(e => e !== null)
      const insertedTmpl = await templates.upsert(tmpl.templateName, (newDoc) => {
        newDoc.template_type = tmpl.doc.fileType || newDoc.template_type
        newDoc.template_name = tmpl.doc.fileName
        newDoc.template_preview_name = tmpl.preview.fileName
        newDoc.templateDescription = tmpl.templateDescription
        newDoc.templateCategory = tmpl.templateCategory || ''
        return newDoc
      })
      
      let rev = insertedTmpl.rev
      async function insertAtts() {
        for (const path of attPaths) {
          var att = fs.readFileSync(path)
          const len = path.split('\\').length
          const attName =  path.split('\\')[len-1]
          const insertedAtt = await templates.putAttachment(tmpl.templateName, attName, rev, att, path.split('.')[1])
          rev = insertedAtt.rev
        }
      }

      await insertAtts()
      // const att = fs.readFileSync(tmpl.doc.filePath)
      // const att2 = fs.readFileSync(tmpl.preview.filePath)
      // const insertedAtt = await templates.putAttachment(tmpl.templateName, tmpl.doc.fileName, insertedTmpl.rev, att, tmpl.doc.fileType)
      // await templates.putAttachment(tmpl.templateName, tmpl.preview.fileName, insertedAtt.rev, att2, tmpl.doc.fileType)

      dispatch('fetchAllTemplates', true)
      dispatch('notify', {
        text: 'Saved.',
        color: 'success',
        state: true,
        timeout: 2500
      })
    } catch (err) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: true
      })
    }
  },
  async removeTemplate({ dispatch }, templateId) {
    try {
      await templates.upsert(templateId, (newDoc) => {
        newDoc._deleted = true
        return newDoc
      })
      dispatch('fetchAllTemplates', true)
      dispatch('notify', {
        text: 'Saved.',
        color: 'success',
        state: true,
        timeout: 2500
      })
    } catch (error) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: true
      })
    }
  },
  async openFile({}, path) {
    shell.openItem(path)
  },
  async getTemplatePreview({ rootState }) {
    if (!rootState.templates.chosenTemplates[0].hasOwnProperty('template_preview_name')) return 
    const data = await templates.getAttachment(rootState.templates.chosenTemplates[0]['_id'], rootState.templates.chosenTemplates[0]['template_preview_name'])
    const blob = await blobUtil.arrayBufferToBlob(data)
    return await blobUtil.blobToDataURL(blob)
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