const sql = require("mssql/msnodesqlv8")
import fs from 'fs'
import store from '../index'
import DataFrame from 'dataframe-js';
const XLSX = require('xlsx')
import { rewriteDefaultSettingFile, readDefaultSettingFile } from '../helpers/localFilesManipulation'

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))


// LOCAL DB
const projects = new PouchDB('src/db/projects', { revs_limit: 3 })
// MY DB
const remoteProjects = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/projects', { revs_limit: 2 })
// ABB DB
// const remoteProjects = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/projects')

let projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
  .on('change', (c) => {
    console.log(c)
    if (c.direction === 'pull') store.dispatch('fetchAllProjectsBasic')
  })

const conn = new sql.ConnectionPool(JSON.parse(readDefaultSettingFile('databaseSettings')))

const state = {
  allProjectsBasic: [],
  pmProjectsBasic: [],
  projectsDetail: [],
  chosenProjects: [],
  pmProjectsProjectMode: [],
  loading: false,
  foreignProjectsBasic: JSON.parse(localStorage.getItem('foreignProjectsBasic')) || [],
  taskInfo: null,
  selectedPM: null
}

const getters = {
  allProjectsBasic: state => state.allProjectsBasic,
  pmProjectsBasic: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    return state.allProjectsBasic.filter(e => {
      return e['Project Manager'] === getters.userInfo.sapUsername ||
      state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0 ||
      (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(getters.userInfo.sapUsername))
    })
  },
  projectsDetail: state => state.projectsDetail,
  visibleProjectsDetail: state => state.projectsDetail.filter(e => e.visible),
  chosenProjects: state => state.chosenProjects,
  pmProjectsProjectMode: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    const projsBasic = state.allProjectsBasic.filter(e => 
      e['Project Manager'] === getters.userInfo.sapUsername || 
      state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0 ||
      (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(getters.userInfo.sapUsername))
      )
    if (projsBasic.length === 0) return []
    return projsBasic.reduce((agg, e) => {
      const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)

      if (f === -1) {
        // Project ID not in aggregator
        return [...agg, {
          project_id: e['Project Definition'],
          project_name: e['Project Name'],
          project_panels: e['Number of Panels'],
          project_modules: e['Number of Modules'],
          project_revenue: e['Project Revenues'],
          riskRegisterBilance: e['riskRegister'].hasOwnProperty('bilance') ? e.riskRegister.bilance : null,
          nets_keys: [e['_id']],
          nets: [e]
        }]

      } else {
        // Project ID in aggregator
        const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

        if (f2 === -1) {
          // Network num not in aggregator
          agg[f]['nets'].push(e)
          agg[f]['nets_keys'].push(e['_id'])
          agg[f]['project_panels'] = agg[f]['project_panels'] + e['Number of Panels']
          agg[f]['project_modules'] = agg[f]['project_modules'] + e['Number of Modules']

          return agg

        } else {
          // Network num in aggregator
          // agg[f]['nets'][f2]['net_info'].push({
          //   task_num: e['Task Num'],
          //   task_info: e
          // })
          // return agg
        }

      }
    }, [])

  },
  allProjectsProjectsMode: (getters) => {
     const projsBasic = getters.allProjectsBasic

     return projsBasic.reduce((agg, e) => {
      const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)

      if (f === -1) {
        // Project ID not in aggregator
        return [...agg, {
          project_id: e['Project Definition'],
          project_name: e['Project Name'],
          project_panels: e['Number of Panels'],
          project_modules: e['Number of Modules'],
          project_revenue: e['Project Revenues'],
          project_pm: e['Project Manager'],
          temporaryAssign: e['temporaryAssign'],
          riskRegisterBilance: e['riskRegister'].hasOwnProperty('bilance') ? e.riskRegister.bilance : 0,
          nets_keys: [e['_id']],
          nets: [e]
        }]

      } else {
        // Project ID in aggregator
        const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

        if (f2 === -1) {
          // Network num not in aggregator
          agg[f]['nets'].push(e)
          agg[f]['nets_keys'].push(e['_id'])
          agg[f]['project_panels'] = agg[f]['project_panels'] + e['Number of Panels']
          agg[f]['project_modules'] = agg[f]['project_modules'] + e['Number of Modules']

          return agg
        } else {
          // Network num in aggregator
          // agg[f]['nets'][f2]['net_info'].push({
          //   task_num: e['Task Num'],
          //   task_info: e
          // })
          // return agg
        }
      }
    }, [])
  },
  pmProjectsUniqueProjects: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    const projsBasic = state.allProjectsBasic.filter(e => e['Project Manager'] === getters.userInfo.sapUsername
    || state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0
    || (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(getters.userInfo.sapUsername)))
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
  allProjectsUniqueProjects: (state) => {
    const projsBasic = state.allProjectsBasic
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
  // riskRegisterTraces: state => {
  //   if (state.chosenProjects.length === 0) return { data: [], layout: {}, config: { responsive: true } }

  //   const allNets = state.allProjectsBasic.filter(e => e['Project Definition'] === state.chosenProjects[0]['Project Definition'])
  //   const netWithRiskRegister = allNets[0]
  //   if (!netWithRiskRegister.riskRegister.hasOwnProperty('risks')) return { data: [], layout: {}, config: { responsive: true } }

  //   const data = ['risks', 'opportunities'].reduce((agg3, e) => {
  //     const q = Object.keys(netWithRiskRegister.riskRegister[e]).reduce((agg, category) => {
  //       const categoryPriceImpact = netWithRiskRegister.riskRegister[e][category].reduce((agg2, r) => {
  //         return r.exists ? agg2 + r.priceImpact : agg2
  //       }, 0)

  //       return categoryPriceImpact > 0 ? [...agg, {
  //         x: [e],
  //         y: [categoryPriceImpact],
  //         name: category,
  //         type: "bar"
  //       }] : agg

  //     }, [])

  //     return q.length > 0 ? [...agg3, ...q] : agg3
  //   }, [])
  //   const layout = {
  //     margin: {
  //       t: 25,
  //       b: 25,
  //       r: 25,
  //       l: 40,
  //     },
  //     showlegend: false,
  //     barmode: 'stack',
  //     title: `Project: ${netWithRiskRegister['Project Definition']}`
  //   }
  //   const config = {
  //     responsive: true,
  //     displaylogo: false,
  //   }

  //   return { data, layout, config }
  // },
  loading: state => state.loading,
  foreignProjectsBasic: state => state.foreignProjectsBasic,
  taskInfo: state => state.taskInfo,
  uniquePms: state => {
    const nonUniquePMs = state.allProjectsBasic.map(e => e['Project Manager'])
    Array.prototype.unique = function() {
      return this.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
      });
    }

    return nonUniquePMs.unique()
  },
  selectedPmProjects: (state) => {
    if (!state.selectedPM) return []
    const projs = state.allProjectsBasic.filter(e => e['Project Manager'] === state.selectedPM ||
    (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(state.selectedPM)))

    return projs.reduce((agg, e) => {
      const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)

      if (f === -1) {
        // Project ID not in aggregator
        return [...agg, {
          project_id: e['Project Definition'],
          project_name: e['Project Name'],
          project_pm: e['Project Manager'],
          temporaryAssign: e['temporaryAssign'],
          nets_keys: [e['_id']],
        }]

      } else {
        // Project ID in aggregator
        const f2 = agg[f]['nets_keys'].includes(e._id)

        if (!f2) {
          // Network num not in aggregator
          agg[f]['nets_keys'].push(e['_id'])

          return agg
        } else {
          // Network num in aggregator
          // agg[f]['nets'][f2]['net_info'].push({
          //   task_num: e['Task Num'],
          //   task_info: e
          // })
          // return agg
        }
      }
    }, [])

  },
  selectedPM: state => state.selectedPM
}

const actions = {
  async fetchAllProjectsBasic({ commit }) {
    async function getProjects() {
      return projects.find({ selector: { "_id": { $gt: null } }, limit: null, sort: ['_id'] })
    }

    const projs = await getProjects()
    commit('setAllProjects', projs.docs)

    // if (force || !localStorage.getItem('allProjectsBasic')) {
    //   const projs = await getProjects()
    //   localStorage.setItem('allProjectsBasic', JSON.stringify(projs.docs))
    //   commit('setAllProjects', projs.docs)
    // } else {
    //   commit('setAllProjects', JSON.parse(localStorage.getItem('allProjectsBasic')))
    // }
  },
  async fetchForeignProjectsBasic({ commit }) {
    commit('setForeignProjectsBasic', JSON.parse(localStorage.getItem('foreignProjectsBasic')) || [])
  },
  async addActiveProjects({ dispatch, commit, rootState }) {
    console.time('Projects')
    conn.connect()
      .then(() => {
        const obDailyPath1301 = rootState.invoicing.obDailyPath1301
        const obDailyPath1601 = rootState.invoicing.obDailyPath1601
        if (!fs.existsSync(obDailyPath1301) || !fs.existsSync(obDailyPath1601)) throw 'OB Daily path not set. Check SETTINGS.'
      })
      .then(() => commit('setLoading', true))
      .then(() => projectsReplicator.cancel())
      .then(() => {
        return conn
          .request()
          .query(
            `SELECT [Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules], [Invoice Date] FROM [PPES].[dbo].[lvmv_networks]`
          );
      })
      .then(data => {
        const obDailyPath1301 = rootState.invoicing.obDailyPath1301
        const obDailyPath1601 = rootState.invoicing.obDailyPath1601

        const obDailySheet1301 = XLSX.readFile(obDailyPath1301, {cellDates: true}).Sheets['3101_zdroj']
        const obDailySheet1601 = XLSX.readFile(obDailyPath1601, {cellDates: true}).Sheets['zdroj']

        const obDailyData1301 = XLSX.utils.sheet_to_json(obDailySheet1301, {range: 2})
        const obDailyData1601 = XLSX.utils.sheet_to_json(obDailySheet1601, {range: 2})
        let obDailyData = obDailyData1301.concat(obDailyData1601)
        obDailyData = obDailyData.map(r => {
          return {
            'Project Definition': r['Číslo projektu'],
            'Project Name': r['Název projektu'],
            'Customer Name': r['Jméno odběratele'],
            'Customer Country': r['Stát'],
            'Project Revenues': Number(r['R celk. v CZK']) + Number(r['OB v CZK']),
            'Project OB': Number(r['OB v CZK']),
            'Project Panels': Number(r['Počet polí'])
          }
        })
        
        const obDailyDf = new DataFrame(obDailyData)
        const dataDf = new DataFrame(data.recordset)
        
        const joinedData = dataDf.leftJoin(obDailyDf, ['Project Definition'])
        return joinedData.toCollection()
      })
      .then(data => {
        const fixedFields = ['riskRegister', 'sign', 'temporaryAssign']
        const projUpserts = data.map(async (p) => {
          await projects.upsert(String(p['Network Num']), doc => {
            p['Net Revenues'] = Number(p['Project Panels']) > 0 ? (Number(p['Project Revenues']) * Number(p['Number of Panels']) / Number(p['Project Panels'])) : 1

            if (doc.hasOwnProperty('fixedFields')) {
              const placeholderFixedFields = doc['fixedFields'].concat(fixedFields)
              p['fixedFields'] = [...new Set(placeholderFixedFields)]

              p['fixedFields'].forEach(u => {
                if (doc.hasOwnProperty(u)) {
                  p[u] = doc[u]
                } else {
                  p[u] = {}
                }
              })    
            } else {
              p['fixedFields'] = fixedFields
              p['riskRegister'] = {}
              p['sign'] = {}
              p['temporaryAssign'] = {}
            }

            const today = new Date().toISOString().substr(0,10)
            if (doc.hasOwnProperty('Invoice Date')) {
              p['Invoice Date'] = Object.assign({}, doc['Invoice Date'], {[today]: p['Invoice Date']})
            } else {
              p['Invoice Date'] = {[today]: p['Invoice Date']}
            }
 
            return p
          })
        });
        console.timeEnd("Projects");
        Promise.all(projUpserts)
          .then(() => {
            projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
              .on('change', (c) => {
                if (c.direction === 'pull') store.dispatch('fetchAllProjectsBasic')
              })
          })
          .catch((err) => console.log(err))
      })
      .then(() => conn.close())
      .then(() => dispatch('overwriteInvoicingSettings'))
      .then(() => dispatch('fetchAllProjectsBasic')
      .then(() => dispatch('fetchInvoicingSettings'))
      )
      .then(() => commit('setLoading', false))
      .then(() => dispatch('notify', {
        text: 'Projects imported.',
        color: 'success',
        state: true,
        timeout: 2500
      }))
      .catch(err => {
        console.timeEnd("Projects");
        projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
          .on('change', (c) => {
            if (c.direction === 'pull') store.dispatch('fetchAllProjectsBasic')
          })
        conn.close();
        dispatch('notify', {
          text: err,
          color: 'error',
          state: true,
          timeout: 4000
        })
        commit('setLoading', false)
      });
  },
  async editProjectsDetail({ dispatch, commit }, {fileName, projectsDetailObj}) {
    rewriteDefaultSettingFile(fileName, projectsDetailObj)
    dispatch('notify', {
      text: 'Saved.',
      color: 'success',
      state: 'true',
      timeout: 1500
    })
    commit('setProjectsDetail', projectsDetailObj)
  },
  async fetchProjectsDetail({ commit }) {
    const projsDetail = readDefaultSettingFile('projectDetails')
    commit('setProjectsDetail', JSON.parse(projsDetail))
  },
  async chooseProjects({ commit, rootState }, projData) {
    // const personalNum = rootState.user.userInfo.sapUsernumber
    // if ((projData.length > 0 || typeof(projData) === 'object') && personalNum ) {
    //   const netNum = (Array.isArray(projData) && projData.length > 0) ? projData[0]['_id'] : projData['_id']

    //   commit('setTaskInfo', {netNum, personalNum})
    // }
    await commit('setChosenProjects', Array.isArray(projData) ? projData : [projData])
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
        text: 'Temporarily added to my projects',
        color: 'success',
        state: true,
        timeout: 2000
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
      if (c.direction === 'pull') store.dispatch('fetchAllProjectsBasic')
    })
  },
  async fetchProjectRevisions({}, netNum) {
    let doc = await projects.get(netNum, {revs_info: true})
    doc['_revs_info'].shift()
    return doc['_revs_info']
  },
  async getRevisionInfo({}, {netNum, revId}) {
    return await projects.get(netNum, {rev: revId})
  },
  async delegateProjects({ dispatch, rootState }, { projs, LTR }) {
    try {
      if (!rootState.projects.selectedPM) throw 'PM not selected'
      if (projs.length === 0) throw 'No projects selected'

      const netsToUpdate = projs.reduce((agg, e) => {
        agg = agg.concat(e.nets_keys)
        return agg
      }, [])
      await projectsReplicator.cancel()

      const updateData = netsToUpdate.map(async (netId) => {
        projects.upsert(netId, doc => {
          if (doc.temporaryAssign.hasOwnProperty('personName')) {
            if (LTR) doc.temporaryAssign.personName.push(rootState.projects.selectedPM)
            else {
              const idx = doc.temporaryAssign.personName.indexOf(rootState.projects.selectedPM)
              doc.temporaryAssign.personName.splice(idx, 1)
            }
          } else {
            if (LTR) doc.temporaryAssign.personName = [rootState.projects.selectedPM]
            else throw 'This shouldn\'t be possible..'
          }
          return doc
        })
      })

      Promise.all(updateData)
        .then(() => {
          projectsReplicator = projects.sync(remoteProjects, { live: true, retry: true, batch_size: 2000 })
            .on('change', (c) => {
              if (c.direction === 'pull') store.dispatch('fetchAllProjectsBasic')
            })
          dispatch('fetchAllProjectsBasic')
          dispatch('notify', {
            text: 'Saved.',
            color: 'success',
            state: true,
            timeout: 2000
          })
        })
        .catch(err => {
          dispatch('notify', {
            text: error,
            color: 'error',
            state: true,
            timeout: 5000
          })
        })
    } catch (error) {
      dispatch('notify', {
        text: error,
        color: 'error',
        state: true,
        timeout: 5000
      })
    }
  },
  async selectPM({ commit }, pmName) {
    commit('setSelectedPM', pmName)
  }
}

const mutations = {
  setAllProjects: (state, projects) => state.allProjectsBasic = projects,
  setPmProjects: (state, projects) => state.pmProjectsBasic = projects,
  setProjectsDetail: (state, projsDetail) => state.projectsDetail = projsDetail,
  setChosenProjects: async (state, projData) => state.chosenProjects = projData,
  setPmProjectsNetMode: (state, projects) => state.pmProjectsNetMode = projects,
  setPmProjectsProjectMode: (state, projects) => state.pmProjectsProjectMode = projects,
  setLoading: (state, val) => state.loading = val,
  setForeignProjectsBasic: (state, projs) => state.foreignProjectsBasic = projs,
  setTaskInfo: (state, {netNum, personalNum}) => {
    if (typeof(netNum) === 'undefined' || !personalNum) {
      console.log('canceled')
      state.taskInfo = null
      return
    }
    conn.connect()
      .then(() => state.loading = true)
      .then(() => {
        return conn
          .request()
          .query(`SELECT [Task Num], [Task Description], [Task Status], [May Start], [Days To Start], [Total Float], [Normal Work], [Normal Work - unit], [Actual Work], [Priority], [Capacity], [Work percentage] FROM [ppes].[dbo].[lvmv_tasks] WHERE [Network Num] = ${Number(netNum)} AND [Personal Num] = ${personalNum}`);
      })
      .then((taskInfo) => {
        console.log(taskInfo)
        state.taskInfo = taskInfo.recordset
      })
      .then(() => conn.close())
      .then(() => state.loading = false)
      .catch(err => {
        console.log(err)
        conn.close()
        state.loading = false
      })
  },
  setSelectedPM: (state, pmName) => state.selectedPM = pmName
}

export default {
  state,
  getters,
  actions,
  mutations
}

export let projectsDb = projects