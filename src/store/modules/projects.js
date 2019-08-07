const sql = require("mssql/msnodesqlv8")
import fs from 'fs'
import store from '../index'
import DataFrame from 'dataframe-js';
const XLSX = require('xlsx')
import { ipcRenderer } from 'electron'
import { rewriteDefaultSettingFile, readDefaultSettingFile, readFile } from '../helpers/localFilesManipulation'
const axios = require('axios')
const setCookie = require('set-cookie-parser')

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))


// LOCAL DB
let projects
// MY DB
let remoteProjects
let projectsReplicator

const conn = new sql.ConnectionPool(JSON.parse(readDefaultSettingFile('databaseSettings')))

const state = {
  remoteProjectsDb: 'http://Kyli:ivana#94@127.0.0.1:5984/projectsdb',
  pccRemote: {
    link: 'http://hera3.cz.abb.com:8004/sap/opu/odata/SAP/ZFXCZ_PP_PCC1_SRV/',
    production: false
  },
  allProjectsBasic: [],
  nonActiveProjects: [],
  pmProjectsBasic: [],
  projectsDetail: JSON.parse(readDefaultSettingFile('projectDetails')) || JSON.parse(readDefaultSettingFile('invoicingColumns')),
  chosenProjects: [],
  loading: false,
  foreignProjectsBasic: JSON.parse(localStorage.getItem('foreignProjectsBasic')) || [],
  taskInfo: null,
  multipleNetsTasksInfo: {},
  selectedPM: null,
  sapNetInfo: null,
  sapSimilarNetsInfo: [],
  taskColumns: null,
  pccLoading: false
}

const getters = {
  allProjectsBasic: state => state.allProjectsBasic,
  pmProjectsBasic: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []

    let projsBasic = JSON.parse(JSON.stringify(getters.allProjectsBasic))

    if (getters.userInfo.sapUsername !== 'SpecialUser') {
      return projsBasic.filter(e => {
        return e['Project Manager'] === getters.userInfo.sapUsername ||
        state.foreignProjectsBasic.filter(netNum => netNum === e._id).length > 0 ||
        (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(getters.userInfo.sapUsername))
      })
    } else {
      return projsBasic
    }
  },
  projectsDetail: state => state.projectsDetail,
  visibleProjectsDetail: state => state.projectsDetail.filter(e => e.visible),
  chosenProjects: state => state.chosenProjects,
  allProjectsProjectsMode: (getters) => {
     const projsBasic = getters.allProjectsBasic

     return projsBasic.reduce((agg, e) => {
      const f = agg.map(a => a['Project Definition'] === e['Project Definition']).indexOf(true)

      if (f === -1) {
        // Project ID not in aggregator
        return [...agg, {
          '_id': e['_id'],
          'Project Definition': e['Project Definition'],
          'Project Name': e['Project Name'],
          'Project Panels': e['Number of Panels'],
          'Project Modules': e['Number of Modules'],
          'Project Revenues': e['Project Revenues'],
          'Project Manager': e['Project Manager'],
          temporaryAssign: e['temporaryAssign'],
          riskRegisterBilance: e['riskRegister'].hasOwnProperty('bilance') ? e.riskRegister.bilance : 0,
          nets_keys: [e['_id']],
          nets: [e]
        }]

      } else {
        // Project ID in aggregator
        // const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

        // if (f2 === -1) {
        if (true) {
          // Network num not in aggregator
          agg[f]['nets'].push(e)
          agg[f]['nets_keys'].push(e['_id'])
          agg[f]['Project Panels'] = agg[f]['Project Panels'] + e['Number of Panels']
          agg[f]['Project Modules'] = agg[f]['Project Modules'] + e['Number of Modules']

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
  pmProjects: (state, getters) => {
    if (!getters.userInfo.sapUsername) return []
    if (getters.userInfo.sapUsername === 'SpecialUser') return getters.allProjectsProjectsMode

    return getters.allProjectsProjectsMode.filter(e => e['Project Manager'] === getters.userInfo.sapUsername
      || (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(getters.userInfo.sapUsername))
    )
  },
  allProjectsUniqueProjects: (getters) => {
    const projsBasic = getters.allProjectsBasic
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
  loading: state => state.loading,
  foreignProjectsBasic: state => state.foreignProjectsBasic,
  taskInfo: state => state.taskInfo,
  multipleNetsTasksInfo: state => state.multipleNetsTasksInfo,
  uniquePms: state => {
    const nonUniquePMs = state.allProjectsBasic.map(e => e['Project Manager'])
    Array.prototype.unique = function() {
      return this.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
      });
    }

    return nonUniquePMs.unique()
  },
  selectedPmProjects: (state, getters) => {
    if (!state.selectedPM) return []
    const projs = JSON.parse(JSON.stringify(getters.allProjectsProjectsMode))
    return projs.filter(e => e['Project Manager'] === state.selectedPM ||
    (e['temporaryAssign'].hasOwnProperty('personName') && e.temporaryAssign.personName.includes(state.selectedPM)))
  },
  selectedPM: state => state.selectedPM,
  sapNetInfo: state => state.sapNetInfo,
  sapSimilarNetsInfo: state => state.sapSimilarNetsInfo,
  taskColumns: state => state.taskColumns,
  pccRemote: state => state.pccRemote,
  pccLoading: state => state.pccLoading
}

const actions = {
  async initProjectsDb({ dispatch, rootState }) {
    projects = await new PouchDB('src/db/projectsdb', { revs_limit: 3 })
    remoteProjects = await new PouchDB(rootState.projects.remoteProjectsDb, { revs_limit: 2 })

    console.log(remoteProjects)
    dispatch('startProjectsReplication')
  },
  async fetchAllProjectsBasic({ rootState, commit, dispatch }) {
    await projects.createIndex({
      index: {
        fields: ['_id', 'projectDone']
      }
    })

    const nonActiveProjects = await projects.find({
      selector: {
        projectDone: true
      }
    })
    const activeProjects = await projects.find({
      selector: {
        projectDone: {'$exists': false}
      }
    })

    commit('setAllProjects', activeProjects.docs)
    commit('setAllNonActiveProjects', nonActiveProjects.docs)

    if (rootState.projects.chosenProjects.length > 0) {
      dispatch('chooseProjects', rootState.projects.chosenProjects)
    }
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
            `SELECT [Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules], [Invoice Date], [Invoice Date Fixed] FROM [PPES].[dbo].[lvmv_networks_gentl]`
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
        const fixedFields = ['riskRegister', 'sign', 'temporaryAssign', 'extraFields']
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
              p['Current Invoice Date'] = p['Invoice Date']
              p['Invoice Date'] = Object.assign({}, doc['Invoice Date'], {[today]: p['Invoice Date']})
            } else {
              p['Current Invoice Date'] = p['Invoice Date']
              p['Invoice Date'] = {[today]: p['Invoice Date']}
            }
 
            return p
          })
        });
        console.timeEnd("Projects");
        Promise.all(projUpserts)
          .then(() => {
            dispatch('startProjectsReplication')
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
        dispatch('startProjectsReplication')
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
      dispatch('fetchAllProjectsBasic')
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
  async fetchNetTasksInfo({ commit, dispatch, rootState }, netNum) {
    if (!netNum) return

    dispatch('setTasksLoading', true)
    fetch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')/NetCardToTasks?$format=json&$orderby=ActivityNumber`, {
      headers: {
        'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`, // 'Basic cmZjX2dlbnRsOkl2YW5hIzk0'
        'Content-Type': 'application/x-www-form-urlencoded',
        'Allow-Control-Allow-Origin': '*'
      }
    }).then( res => {
      return res.json()
    }).then(resJson => {
      const tasksInfo = resJson.d.results.map(e => {
        for (let [key, value] of Object.entries(e)) {
          if (typeof(value) === 'string' && value.startsWith('/Date(')) {
            const date = new Date(parseInt(value.match(/\d+/)[0]))
            e[key] = date.toISOString().substr(0,10)
              }
        }
        return e
      })

      commit('setTaskInfo', tasksInfo)
    }).then(() => {
      dispatch('setTasksLoading', false)
    }).catch(err => {
      dispatch('setTasksLoading', false)
      dispatch('notify', {
        text: 'Request to SAP cannot be completed.',
        color: 'error',
        state: true,
        timeout: 3000
      })
    })

  },
  async fetchMultipleNetsTasksInfo({ commit, dispatch, rootState }, netNums) {
    try {
      dispatch('setTasksLoading', true)
      let netResponsePromises = []
      for (const netNum of netNums) {
        netResponsePromises.push(fetch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')/NetCardToTasks?$format=json&$orderby=ActivityNumber`, {
          headers: {
            'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Allow-Control-Allow-Origin': '*'
          }
        }).then( res => {
          return res.json()
        }).then(resJson => {
          const tasksInfo = resJson.d.results.map(e => {
            for (let [key, value] of Object.entries(e)) {
              if (typeof(value) === 'string' && value.startsWith('/Date(')) {
                const date = new Date(parseInt(value.match(/\d+/)[0]))
                e[key] = date.toISOString().substr(0,10)
                  }
            }
            return e
          })
          return {[netNum]: tasksInfo}
        }))
      }
      Promise.all(netResponsePromises)
        .then((e) => {
          const tasksObj = e.reduce((agg, x) => Object.assign(agg, x), {})
          dispatch('setTasksLoading', false)
          commit('setMultipleNetsTasksInfo', tasksObj)
        })
        .catch(err => {
          dispatch('setTasksLoading', false)
          dispatch('notify', { text: err, color: 'error', state: true, timeout: 3000 })
        })
    } catch (error) {
      dispatch('setTasksLoading', false)
      dispatch('notify', {
        text: error,
        color: 'error',
        state: true,
        timeout: 3000
      })
    }
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
        ipcRenderer.send('projectsChange', c)
        console.log(c)
        if (c.direction === 'pull') {
          store.dispatch('fetchAllProjectsBasic')
          if (store.getters.chosenProjects.length > 0) {
            const selected = c.change.docs.filter(e => {
              if (store.getters.chosenProjects[0].hasOwnProperty('nets_keys')) {
                return store.getters.chosenProjects[0]['nets_keys'].includes(e['_id'])
              } else {
                return e['_id'] === store.getters.chosenProjects[0]['_id']
              }
            })
            if (selected.length > 0) ipcRenderer.send('selectedProjectChanged', selected[0])
          }
        }
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
          dispatch('startProjectsReplication')
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
  },
  async deactivateNets({ dispatch }, netsKeys) {
    try {
      await projectsReplicator.cancel()

      const netsDeactivate = netsKeys.map(async (netId) => {
        await projects.upsert(netId, doc => {
          doc.projectDone = true
          return doc
        })
      })

      Promise.all(netsDeactivate)
        .then(() => {
          dispatch('startProjectsReplication')
        })
        .then(() => {
          dispatch('fetchAllProjectsBasic')
          dispatch('notify', {
            text: 'Project deactivated.',
            color: 'success',
            state: true,
            timeout: 2000
          })
        })
        .catch(err => console.error(err))
    } catch (error) {
      dispatch('notify', {
        text: error,
        color: 'error',
        state: true,
        timeout: 5000
      })
    }
  },
  async fetchSapNetData({ commit, dispatch, rootState }, netNum) {
    if (!netNum) return

    fetch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')?$format=json`, {
      headers: {
        'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Allow-Control-Allow-Origin': '*'
      }
    })
    .then(res => res.json())
    .then(resJson => {
      console.dir(resJson)

      for (let [key, value] of Object.entries(resJson.d)) {
        if (typeof(value) === 'string' && value.startsWith('/Date(')) {
          const date = new Date(parseInt(value.match(/\d+/)[0]))
          resJson.d[key] = date.toISOString().substr(0,10)
        }
      }
      return resJson.d
    })
    .then(sapNetInfo => commit('setSapNetInfo', sapNetInfo))
    .catch(err => console.error(err))
  },
  async fetchSapNetsData({ rootState, dispatch }, {netNums = [], query, notify = true}) {
    if (netNums.length === 0) return

    let netResponsePromises = []
    netNums.forEach(netNum => {
      netResponsePromises.push(
        fetch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')?$format=json&${query}`, {
        headers: {
          'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Allow-Control-Allow-Origin': '*'
        }
      })
      .then(res => res.json())
      .then(resJson => {
        for (let [key, value] of Object.entries(resJson.d)) {
          if (typeof(value) === 'string' && value.startsWith('/Date(')) {
            const date = new Date(parseInt(value.match(/\d+/)[0]))
            resJson.d[key] = date.toISOString().substr(0,10)
          }
        }
        return {[netNum]: resJson.d}
      }))
    })
    Promise.all(netResponsePromises)
      .then(e => {
        const netsObj = e.reduce((agg, x) => Object.assign(agg, x), {})
        let netsObjToCouch = []
        Object.keys(netsObj).forEach(netNum => {
          netsObjToCouch.push({
            'Current Invoice Date': netsObj[netNum].InvoiceDate,
            'Contractual Delivery Date': netsObj[netNum].ContractDeliveryDate,
            'Expedition Fixed': netsObj[netNum].FixationExpedition,
            'Invoice Date Fixed': netsObj[netNum].FixationInvoice,
            'Delivery Date': netsObj[netNum].RPDispatchDate
          })
        })
        dispatch('changeProjectsData', {
          netNums: Object.keys(netsObj),
          data: netsObjToCouch,
          notify
        })
      })

  },
  async fetchSapSimilarNets({ commit, dispatch, rootState }, netNum) {
    if (!netNum) return

    fetch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')/NetCardToSimilarNetCards?$format=json`, {
      headers: {
        'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Allow-Control-Allow-Origin': '*'
      }
    })
    .then(res => res.json())
    .then(resJson => {
      for (const net of resJson.d.results) {
        for (let [key, value] of Object.entries(net)) {
          if (typeof(value) === 'string' && value.startsWith('/Date(')) {
            const date = new Date(parseInt(value.match(/\d+/)[0]))
            net[key] = date.toISOString().substr(0,10)
          }
        }
      }
      return resJson.d.results
    })
    .then(sapNetsInfo => commit('setSapSimilarNetsInfo', sapNetsInfo))
    .catch(err => console.error(err))

  },
  async setTaskColumns({ commit }) {
    const columns = readDefaultSettingFile('taskColumns')
    commit('setTaskColumns', JSON.parse(columns))
  },
  async changeProjectsData({ dispatch }, {netNums, data, notify = true}) {
    projectsReplicator.cancel()

    const projUpserts = netNums.map(async (p, idx) => {
      await projects.upsert(p, doc => {
        Object.assign(doc, data[idx])
        return doc
      })
    })

    Promise.all(projUpserts)
      .then(() => {
        dispatch('fetchAllProjectsBasic')
        dispatch('startProjectsReplication')
      })
      .then(() => {
        if (notify) {
          dispatch('notify', {
            text: 'Saved.',
            color: 'success',
            state: 'true'
          })
        }
      })
      .catch((err) => console.log(err))
  },
  async insertData({ dispatch }, path) {
    try {
      dispatch('stopProjectsReplication')
      let data = JSON.parse(readFile(path, 'utf-8'))
      data = data.rows.map(e => e.doc)
      data = data.map(e => {
        const {_rev, ...doc} = e
        return doc
      })
      const x = await projects.bulkDocs(data)
      console.log(x)
      dispatch('startProjectsReplication')
    } catch (error) {
      console.error(error)
    }
  },
  async switchPccremote({ commit, dispatch, rootState }) {
    if (rootState.projects.pccRemote.production) {
      commit('setPccRemote', {
        link: 'http://hera3.cz.abb.com:8004/sap/opu/odata/SAP/ZFXCZ_PP_PCC1_SRV/',
        production: false
      })
      dispatch('notify', {
        text: 'You switched to test database!',
        color: 'info',
        timeout: 4000,
        state: true
      })
    } else {
      commit('setPccRemote', {
        link: 'http://uran.cz.abb.com:8000/sap/opu/odata/SAP/ZFXCZ_PP_PCC1_SRV/',
        production: true
      })
      dispatch('notify', {
        text: 'You switched to production database!',
        color: 'info',
        timeout: 4000,
        state: true
      })
    }
  },
  async modifyPccNetData({ dispatch, rootState }, {netNum, data}) {
    try {
      const getCsrf = await axios.get(`${rootState.projects.pccRemote.link}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-csrf-token': 'Fetch',
          'cache-control': 'no-cache',
          'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`
        }
      })

      const csrfToken = getCsrf.headers['x-csrf-token']
      const c = setCookie.parse(getCsrf)

      let cooks = ''
      for (const cook of c) {
        cooks = cooks + `${cook.name}=${cook.value}; `
      }
      
      await axios.patch(`${rootState.projects.pccRemote.link}NetCardSet('${netNum}')?sap-client=001`, data,
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'cookie': cooks,
          'accept-encoding': 'gzip, deflate',
          'content-length': '30',
          'cache-control': 'no-cache'
        }
      })

      dispatch('notify', {
        text: 'Success.',
        color: 'success',
        state: true,
        timeout: 2000
      })
      dispatch('addNotifications', {
        name: 'Net ' + netNum + ' was updated.',
        info: 'Net ' + netNum + ' was updated.',
        type: 'info'
      })
    } catch (error) {
      console.log(error)
    }
  },
  async modifyPccNetsData({ dispatch, rootState, commit }, { netNums, data } ) {
    try {
      commit('setPccLoading', true)
      const getCsrf = await axios.get(`${rootState.projects.pccRemote.link}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-csrf-token': 'Fetch',
          'cache-control': 'no-cache',
          'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`
        }
      })
  
      const csrfToken = getCsrf.headers['x-csrf-token']
      const c = setCookie.parse(getCsrf)
  
      let cooks = ''
      for (const cook of c) {
        cooks = cooks + `${cook.name}=${cook.value}; `
      }
  
      const updateRecursive = function(idx) {
        if (idx === netNums.length) {
          dispatch('notify', {
            text: 'Success.',
            color: 'success',
            state: true,
            timeout: 2000
          })
          commit('setPccLoading', false)
          return
        }
        if (Object.keys(data[idx]).length === 0) {
          updateRecursive(idx + 1)
          return
        }
        axios.patch(`${rootState.projects.pccRemote.link}NetCardSet('${netNums[idx]}')?sap-client=001`, data[idx],
        {
          headers: {
            'x-csrf-token': csrfToken,
            'Authorization': `Basic ${rootState.projects.pccRemote.production ? rootState.user.sapLogin : rootState.user.sapLoginTest}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'cookie': cooks,
            'accept-encoding': 'gzip, deflate',
            'content-length': '30',
            'cache-control': 'no-cache'
          }
        }).then(() => {
          dispatch('addNotifications', {
            name: 'Net ' + netNums[idx] + ' was updated.',
            info: 'Net ' + netNums[idx] + ' was updated.',
            type: 'info'
          })
          if ((idx + 1) !== netNums.length) {
            setTimeout(() => {
              updateRecursive(idx + 1)
            }, 1000)
          } else {
            dispatch('notify', {
              text: 'Success.',
              color: 'success',
              state: true,
              timeout: 2000
            })
            commit('setPccLoading', false)
          }
        }).catch((error) => {
          commit('setPccLoading', false)
          console.log(error)
        })
      }
      updateRecursive(0)
    } catch (error) {
      console.dir(error)
    }
  }
}

const mutations = {
  setAllProjects: (state, projects) => state.allProjectsBasic = projects,
  setAllNonActiveProjects: (state, projects) => state.nonActiveProjects = projects,
  setPmProjects: (state, projects) => state.pmProjectsBasic = projects,
  setProjectsDetail: (state, projsDetail) => state.projectsDetail = projsDetail,
  setChosenProjects: async (state, projData) => state.chosenProjects = projData,
  setPmProjectsNetMode: (state, projects) => state.pmProjectsNetMode = projects,
  setLoading: (state, val) => state.loading = val,
  setForeignProjectsBasic: (state, projs) => state.foreignProjectsBasic = projs,
  setTaskInfo: (state, tasksInfo) => state.taskInfo = tasksInfo,
  setMultipleNetsTasksInfo: (state, netsTasks) => state.multipleNetsTasksInfo = netsTasks,
  setSelectedPM: (state, pmName) => state.selectedPM = pmName,
  setSapNetInfo: (state, netInfo) => state.sapNetInfo = netInfo,
  setSapSimilarNetsInfo: (state, netInfos) => state.sapSimilarNetsInfo = netInfos,
  setTaskColumns: (state, columns) => state.taskColumns = columns,
  setPccRemote: (state, pccRemote) => state.pccRemote = pccRemote,
  setPccLoading: (state, val) => state.pccLoading = val
}

export default {
  state,
  getters,
  actions,
  mutations
}

export let projectsDb = projects