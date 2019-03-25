import db from '../../main/scripts/database'
import username from 'username'
import path from 'path'
import { readFile } from '../../main/scripts/misc'
const isDev = require('electron-is-dev')
const sql = require("mssql/msnodesqlv8")
import fs from 'fs'

const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))

const state = {
  allProjectsBasic: [],
  pmProjectsBasic: [],
  projectsDetail: [],
  chosenProjects: [],
  pmProjectsNetMode: [],
  pmProjectsProjectMode: []
}

const getters = {
  allProjectsBasic: state => state.allProjectsBasic,
  pmProjectsBasic: state => state.pmProjectsBasic.map(e => {
    e.selected = false
    return e
  }),
  projectsDetail: state => state.projectsDetail,
  visibleProjectsDetail: state => state.projectsDetail.filter(e => e.visible),
  chosenProjects: state => state.chosenProjects,
  pmProjectsNetMode: state => state.pmProjectsNetMode,
  pmProjectsProjectMode: state => state.pmProjectsProjectMode,
  riskRegisterTraces: state => {
    if (state.chosenProjects.length === 0) return { data: [], layout: {}, config: { responsive: true } }
    if (typeof(state.chosenProjects[0]) === 'number') return { data: [], layout: {}, config: { responsive: true } }
    const data = Object.keys(state.chosenProjects[0].riskRegister).reduce((agg3, e) => {
      const q = Object.keys(state.chosenProjects[0].riskRegister[e]).reduce((agg, category) => {
        const categoryPriceImpact = state.chosenProjects[0].riskRegister[e][category].reduce((agg2, r) => {
          return r.exists ? agg2 + r.priceImpact : agg2
        }, 0)

        return categoryPriceImpact > 0 ? [...agg, {
          x: [e],
          y: [categoryPriceImpact],
          name: category,
          type: "bar"
        }] : agg

      }, [])

      return q.length > 0 ? [...agg3, ...q] : agg3
    }, [])
    const layout = {
      margin: {
        t: 25,
        b: 25,
        r: 25,
        l: 40,
      },
      showlegend: false,
      barmode: 'stack',
      title: `Network ${state.chosenProjects[0]['_id']} (${state.chosenProjects[0]['Project Definition']})`
    }
    const config = {
      responsive: true,
      displaylogo: false,
    }

    return { data, layout, config }
  }
}

const actions = {
  async fetchAllProjectsBasic({ commit }, force) {
    async function getProjects() {
      return await db.projects.find({ selector: { "_id": { $gt: null } }, limit: null })
    }
    if (force) {
      const projs = getProjects()
      localStorage.setItem('pmProjectsBasic', JSON.stringify(projs.docs))
      commit('setAllProjects', projs.docs)
      dispatch('notify', {
        text: 'Projects were imported successfuly.',
        color: 'success',
        state: 'true'
      })
    }
    else if (!localStorage.getItem('allProjectsBasic') && !force) {
      const projs = getProjects()
      localStorage.setItem('allProjectsBasic', JSON.stringify(projs.docs))
      commit('setAllProjects', projs.docs)
    }
  },
  async fetchPmProjectsBasic({ commit, dispatch }, { force } = { force: false }) {
    async function getProjects() {
      await db.projects.createIndex({ index: { fields: ['Project Manager'] } })
      return await db.projects.find({ selector: { "Project Manager": username.sync() }, limit: null })
    }

    if (force) {
      // Projects are forced to update
      const projs = await getProjects()
      localStorage.setItem('pmProjectsBasic', JSON.stringify(projs.docs))
      commit('setPmProjects', projs.docs)
      dispatch('prepareProjectsNetMode')
      dispatch('prepareProjectsProjectMode')
      dispatch('notify', {
        text: 'Projects were imported successfuly.',
        color: 'success',
        state: true
      })

    } else if (!localStorage.getItem('pmProjectsBasic') && !force) {
      // Projects are not cached
      const projs = await getProjects()
      localStorage.setItem('pmProjectsBasic', JSON.stringify(projs.docs))
      commit('setPmProjects', projs.docs)
      dispatch('prepareProjectsNetMode')
      dispatch('prepareProjectsProjectMode')
    } else {
      commit('setPmProjects', JSON.parse(localStorage.getItem('pmProjectsBasic')))
      dispatch('prepareProjectsNetMode')
      dispatch('prepareProjectsProjectMode')
    }
  },
  async addSingleProject({ dispatch }, net_num) {
    conn.connect()
      .then(() => {
        return conn.request().query(`select top 10 * from [lvmv_networks] where [Network Num] = '${net_num}'`)
      })
      .then(data => {
        return db.projects.upsert(net_num, (doc) => {
          if (doc.hasOwnProperty('fixedFields')) {
            doc['fixedFields'].forEach(u => {
              data.recordset[0][u] = doc[u]
            })
            data.recordset[0]['fixedFields'] = doc['fixedFields']
          } else {
            data.recordset[0]['fixedFields'] = ['riskRegister']
            data.recordset[0]['riskRegister'] = []
          }
          return data.recordset[0]
        })
      })
      .then(() => conn.close())
      .then(() => dispatch('fetchPmProjectsBasic', {force: true}))
      .then(() => dispatch('addNotification', { 
        notification: {
          name: 'Network added',
          info: `Network ${net_num} was just added to db.`,
          type: 'info',
          notify: true,
          action: 'fetchPmProjectsBasic',
          actionInfo: 'Refresh projects',
          actionArgs: {
            force: true
          }
        },
        log: true,
        forceActionSelf: true,
        forceActionOthers: false
      }))
      .catch(err => {
        conn.close()
        dispatch('notify', {
          text: err,
          color: 'error',
          state: 'true'
        })
      })
  },
  async addActiveProjects({ dispatch }) {
    console.time('Projects')
    conn
      .connect()
      .then(() => {
        return conn
          .request()
          .query(
            `SELECT [Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules] FROM [PPES].[dbo].[lvmv_networks] `
          );
      })
      .then(data => {
        data.recordset.map(p =>
          db.projects.upsert(String(p["Network Num"]), doc => {
            if (doc.hasOwnProperty('fixedFields')) {
              doc['fixedFields'].forEach(u => {
                p[u] = doc[u]
              })
              p['fixedFields'] = doc['fixedFields']
            } else {
              p['fixedFields'] = ['riskRegister']
              p['riskRegister'] = []
            }
            return p
          })
        );
        console.timeEnd("Projects");
        // return data.recordset.map(p => db.projects.upsert(p['Network Num'], doc => p))
      })
      .then(() => conn.close())
      .then(() => dispatch("fetchPmProjectsBasic", { force: true }))
      .then(() =>
        dispatch("addNotification", {
          notification: {
            name: "Projects updated",
            info: "All projects were updated.",
            notify: true,
            type: "error",
            action: 'fetchPmProjectsBasic',
            actionInfo: 'Refresh projects',
            actionArgs: {
              force: true
            }
          },
          log: true,
          forceActionSelf: true,
          forceActionOthers: false
        })
      )
      .catch(err => {
        conn.close();
        dispatch('notify', {
          text: err,
          color: 'error',
          state: 'true'
        })
      });
  },
  async editProjectsDetail({ dispatch, commit }, {jsonObj, projectsDetailObj}) {
    const p = isDev ? path.join(path.dirname(__dirname), '..', 'defaultSettings', 'projectDetails.json') : path.join(path.dirname(__dirname), 'defaultSettings', `${jsonObj}.json`)
    fs.writeFile(p, JSON.stringify(projectsDetailObj), 'utf8', (err, res) => {
      if (err) throw err;
      dispatch('notify', {
        text: 'Saved.',
        color: 'success',
        state: 'true'
      })
      commit('setProjectsDetail', projectsDetailObj)
    })
  },
  async fetchProjectsDetail({ commit }) {
    const projsDetail = isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'projectDetails.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'projectDetails.json'), 'utf-8'))
    commit('setProjectsDetail', projsDetail)
  },
  async chooseProjects({ commit }, projData) {
    commit('setChosenProjects', Array.isArray(projData) ? projData : [projData])
  },
  async prepareProjectsNetMode({ commit, rootState }) {
    const projsBasic = rootState.projects.pmProjectsBasic
    if (projsBasic.length === 0) return
    
    const projsNetMode = projsBasic.reduce((agg, e) => {
      const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)

      if (f === -1) {
        // Project ID not in aggregator
        return [...agg, {
          project_id: e['Project Definition'],
          electrical_eng: e['Electrical Engineer'],
          mechanical_eng: e['Mechanical Engineer'],
          foreman: e['Foreman'],
          zvr: e['ZVR']? e['ZVR'].substr(0,10) : null,
          zvl: e['ZVL'] ? e['ZVL'].substr(0, 10) : null,
          SSO: e['SSO'],
          ied_programmer: e['IED Programmer'],
          nets_keys: [e['_id']],
          nets: [{
            net_num: e['Network Num'],
            net_info: [{
              task_num: e['Task Num'],
              task_info: e
            }]
          }]
        }]

      } else {
        // Project ID in aggregator
        const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

        if (f2 === -1) {
          // Network num not in aggregator
          agg[f]['nets'].push({
            net_num: e['Network Num'],
            net_info: [{
              task_num: e['Task Num'],
              task_info: e
            }]
          })
          agg[f]['nets_keys'].push(e['_id'])

          return agg

        } else {
          // Network num in aggregator
          agg[f]['nets'][f2]['net_info'].push({
            task_num: e['Task Num'],
            task_info: e
          })
          return agg
        }

      }
    }, [])

    commit('setPmProjectsNetMode', projsNetMode)
  },
  async prepareProjectsProjectMode({ commit, rootState }) {
    const projsBasic = rootState.projects.pmProjectsBasic
    if (projsBasic.length === 0) return

    const projsProjMode = projsBasic.reduce((agg, e) => {
      const f = agg.map(a => a['Project Definition'] === e['Project Definition']).indexOf(true)
      return f === -1 ? [...agg, e] : agg
    }, [])

    commit('setPmProjectsProjectMode', projsProjMode)
  },
  async changeProjectData({ dispatch }, projData) {
    try {
      await db.projects.upsert(projData._id, doc => projData)
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
  setAllProjects: (state, projects) => state.allProjectsBasic = projects,
  setPmProjects: (state, projects) => state.pmProjectsBasic = projects,
  setProjectsDetail: (state, projsDetail) => state.projectsDetail = projsDetail,
  setChosenProjects: (state, projData) => state.chosenProjects = projData,
  setPmProjectsNetMode: (state, projects) => state.pmProjectsNetMode = projects,
  setPmProjectsProjectMode: (state, projects) => state.pmProjectsProjectMode = projects
}

export default {
  state,
  getters,
  actions,
  mutations
}