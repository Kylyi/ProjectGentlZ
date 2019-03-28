import path from 'path'
import { readFile } from '../../main/scripts/misc'
const isDev = require('electron-is-dev')
const sql = require("mssql/msnodesqlv8")
import fs from 'fs'
import store from '../index'

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))
PouchDB.plugin(require('pouchdb-upsert-bulk'))

const projects = new PouchDB('src/db/projects', { revs_limit: 3 })
const remoteProjects = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/projects', { revs_limit: 2 })

let projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
  .on('change', (c) => {
    console.log(c)
    store.dispatch('fetchAllProjectsBasic', true)
  })


const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))

const state = {
  allProjectsBasic: [],
  pmProjectsBasic: [],
  projectsDetail: [],
  chosenProjects: [],
  pmProjectsProjectMode: [],
  loading: false,
  foreignProjectsBasic: []
}

const getters = {
  allProjectsBasic: state => state.allProjectsBasic,
  pmProjectsBasic: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    return state.allProjectsBasic.filter(e => {
      return e['Project Manager'] === getters.userInfo.sapUsername || state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0
    })
  },
  projectsDetail: state => state.projectsDetail,
  visibleProjectsDetail: state => state.projectsDetail.filter(e => e.visible),
  chosenProjects: state => state.chosenProjects,
  pmProjectsProjectMode: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    const projsBasic = state.allProjectsBasic.filter(e => e['Project Manager'] === getters.userInfo.sapUsername || state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0)
    if (projsBasic.length === 0) return []
    return projsBasic.reduce((agg, e) => {
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
          riskRegisterBilance: e['riskRegister'].hasOwnProperty('risks') ? e.riskRegister.bilance : {bilanceRisks: 0, bilanceOpps: 0},
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
          if (e['riskRegister'].hasOwnProperty('risks')) {
            agg[f]['riskRegisterBilance'].bilanceRisks = agg[f]['riskRegisterBilance'].bilanceRisks + e.riskRegister.bilance.bilanceRisks
            agg[f]['riskRegisterBilance'].bilanceOpps = agg[f]['riskRegisterBilance'].bilanceOpps + e.riskRegister.bilance.bilanceOpps
          }

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

  },
  pmProjectsUniqueProjects: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    const projsBasic = state.allProjectsBasic.filter(e => e['Project Manager'] === getters.userInfo.sapUsername || state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0)
    if (projsBasic.length === 0) return []
    
      return projsBasic.reduce((agg, e) => {
        const f = agg.map(a => a['Project Definition'] === e['Project Definition']).indexOf(true)

        if (f !== -1) {
          agg[f]['netsKeys'].push(e._id)
          return agg
        } else {
          e['netsKeys'] = [e._id]
          return [...agg, e]
        }
      }, [])
  },
  riskRegisterTraces: state => {
    if (state.chosenProjects.length === 0) return { data: [], layout: {}, config: { responsive: true } }

    const allNets = state.allProjectsBasic.filter(e => e['Project Definition'] === state.chosenProjects[0]['Project Definition'])
    const netWithRiskRegister = allNets[0]
    if (!netWithRiskRegister.riskRegister.hasOwnProperty('risks')) return { data: [], layout: {}, config: { responsive: true } }

    const data = ['risks', 'opportunities'].reduce((agg3, e) => {
      const q = Object.keys(netWithRiskRegister.riskRegister[e]).reduce((agg, category) => {
        const categoryPriceImpact = netWithRiskRegister.riskRegister[e][category].reduce((agg2, r) => {
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
      title: `Project: ${netWithRiskRegister['Project Definition']}`
    }
    const config = {
      responsive: true,
      displaylogo: false,
    }

    return { data, layout, config }
  },
  loading: state => state.loading,
  foreignProjectsBasic: state => state.foreignProjectsBasic
}

const actions = {
  async fetchAllProjectsBasic({ commit }, force) {
    async function getProjects() {
      return await projects.find({ selector: { "_id": { $gt: null } }, limit: null, sort: ['_id'] })
    }
    if (force || !localStorage.getItem('allProjectsBasic')) {
      const projs = await getProjects()
      localStorage.setItem('allProjectsBasic', JSON.stringify(projs.docs))
      commit('setAllProjects', projs.docs)
    } else {
      commit('setAllProjects', JSON.parse(localStorage.getItem('allProjectsBasic')))
    }
  },
  async fetchForeignProjectsBasic({ commit }) {
    commit('setForeignProjectsBasic', JSON.parse(localStorage.getItem('foreignProjectsBasic')) || [])
  },
  async addSingleProject({ dispatch, commit }, net_num) {
    conn.connect()
      .then(() => commit('setLoading', true))
      .then(() => {
        return conn.request().query(`select top 10 * from [lvmv_networks] where [Network Num] = '${net_num}'`)
      })
      .then(data => {
        return projects.upsert(net_num, (doc) => {
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
      .then(() => dispatch('addNotification', { 
        notification: {
          name: 'Network added',
          info: `Network was just added to db.`,
          type: 'info',
          notify: true,
          action: 'fetchAllProjectsBasic',
          actionInfo: 'Refresh projects',
          actionArgs: {
            force: true
          }
        },
        log: true,
        forceActionSelf: true,
        forceActionOthers: true
      }))
      .then(() => commit('setLoading', false))
      .catch(err => {
        conn.close()
        commit('setLoading', false)
        dispatch('notify', {
          text: err,
          color: 'error',
          state: 'true'
        })
      })
  },
  async addActiveProjects({ dispatch, commit, rootState }) {
    console.time('Projects')

    conn.connect()
      .then(() => commit('setLoading', true))
      .then(() => projectsReplicator.cancel())
      .then(() => {
        return conn
          .request()
          .query(
            `SELECT [Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules] FROM [PPES].[dbo].[lvmv_networks] `
          );
      })
      .then(data => {
        const projUpserts = data.recordset.map(async (p) => {
          await projects.upsert(String(p['Network Num']), doc => {
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
        });
        Promise.all(projUpserts)
        .then(() => {
            projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
          .on('change', (c) => {
            console.log(c)
            store.dispatch('fetchAllProjectsBasic', true)
          })
        })
        .catch((err) => console.log(err))
        console.timeEnd("Projects");
      })
      .then(() => conn.close())
      .then(() => {
          rootState.general.offline ? dispatch('fetchAllProjectsBasic', true) : dispatch('fetchAllProjectsBasic', true)
        }
      )
      .then(() => commit('setLoading', false))
      .then(() => dispatch('notify', {
        text: 'Projects imported.',
        color: 'success',
        state: true
      }))
      .catch(err => {
        conn.close();
        dispatch('notify', {
          text: err,
          color: 'error',
          state: true
        })
        commit('setLoading', false)
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
  async changeProjectData({ dispatch }, projData) {
    try {
      await projects.upsert(projData._id, doc => projData)
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
  async changeLoading({ commit }, val) {
    commit('setLoading', val)
  },
  async addForeignNets({ dispatch, commit }, netIds) {
    if (!Array.isArray(netIds)) netIds = [netIds]

    try {
      const projsToAdd = await projects.find({
        selector: {
          '_id': {
            '$in': netIds
          }
        }
      })
  
      let foreignProjs = JSON.parse(localStorage.getItem('foreignProjectsBasic')) || []

      projsToAdd.docs.map(p => {
        const isIn = foreignProjs.map(e => e._id === p._id).indexOf(true)
        isIn === -1 ? foreignProjs.push(p._id) : null
      })

      localStorage.setItem('foreignProjectsBasic', JSON.stringify(foreignProjs))
      commit('setForeignProjectsBasic', foreignProjs)

      dispatch('notify', {
        text: 'Network temporarily added.',
        color: 'success',
        state: true
      })
    } catch (err) {
      dispatch('notify', {
        text: err,
        color: 'error',
        state: true
      })
    }
  },
  async fetchNetTasksInfo({}, net_num) {
    if (!net_num) return
    conn.connect()
      .then(() => conn.request().query(`select * from [lvmv_tasks] where [Network Num] = '${net_num}'`))
      .then(data => console.log(data))
      .then(() => conn.close())
      .catch(err => {
        conn.close()
        console.log(err)
      })
  },
  async removeForeignNets({ commit }) {
    localStorage.setItem('foreignProjectsBasic', JSON.stringify([]))
    commit('setForeignProjectsBasic', [])
  },
  async stopProjectsReplication() {
    projectsReplicator.cancel()
  },
  async startProjectsReplication() {
    projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
    .on('change', (c) => {
      console.log(c)
      store.dispatch('fetchAllProjectsBasic', true)
    })
  }
}

const mutations = {
  setAllProjects: (state, projects) => state.allProjectsBasic = projects,
  setPmProjects: (state, projects) => state.pmProjectsBasic = projects,
  setProjectsDetail: (state, projsDetail) => state.projectsDetail = projsDetail,
  setChosenProjects: (state, projData) => state.chosenProjects = projData,
  setPmProjectsNetMode: (state, projects) => state.pmProjectsNetMode = projects,
  setPmProjectsProjectMode: (state, projects) => state.pmProjectsProjectMode = projects,
  setLoading: (state, val) => state.loading = val,
  setForeignProjectsBasic: (state, projs) => state.foreignProjectsBasic = projs
}

export default {
  state,
  getters,
  actions,
  mutations
}

export let projectsDb = projects