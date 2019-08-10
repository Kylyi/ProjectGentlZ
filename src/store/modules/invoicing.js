import moment from 'moment'
import store from '../index'
import { ipcRenderer } from 'electron'
import { rewriteDefaultSettingFile, readDefaultSettingFile } from '../helpers/localFilesManipulation'
import _ from 'underscore'

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}

const state = {
  obDailyPath1301: localStorage.getItem('obDailyPath1301'),
  obDailyPath1601: localStorage.getItem('obDailyPath1601'),
  lastUpdate: null,
  datesModified: [],
  // dateRange: JSON.parse(localStorage.getItem('invoicingDateRange')) || [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(1, 'months').toISOString().substr(0, 10)],
  dateRange: [0,1,2,3,4,5].map(e => moment().add(e, 'months').format('YYYY-MM')),
  weekGrouping: JSON.parse(localStorage.getItem('invoicingWeekGrouping')) || false,
  groupingDate: null,
  compareDate: null,
  filteredInvoicing: [],
  invoicingDetail: JSON.parse(readDefaultSettingFile('invoicingDetails')) || JSON.parse(readDefaultSettingFile('invoicingColumns')),
  signComments: [],
  invoicingAdminMode: false,
  invoicingReadOnly: false,
  invoicingViews: {},
  invoicingBatchUpdateMode: JSON.parse(localStorage.getItem('invoicingBatchUpdateMode')) || false
}

const getters = {
  obDailyPath1301: state => state.obDailyPath1301,
  obDailyPath1601: state => state.obDailyPath1601,
  invoicingDateRange: state => state.dateRange,
  invoicingWeekGrouping: state => state.weekGrouping,
  invoicingGroupingDate: state => state.groupingDate,
  invoicingDatesModified: state => {
    if (state.datesModified.length === 0) return []
    return state.datesModified.slice(0, state.datesModified.length - 1)
  },
  invoicingLastUpdate: state => state.lastUpdate,
  invoicingCompareDate: state => state.compareDate,
  invoicingFilteredByDateRange: state => state.filteredInvoicing,
  invoicingDetail: state => state.invoicingDetail,
  invoicingDetailVisible: state => state.invoicingDetail.filter(e => e.visible),
  signComments: state => state.signComments.sort((a,b) => {
    const t1 = moment(a.time)
    const t2 = moment(b.time)

    if (t1 < t2) return 1
    if (t1 > t2) return -1
    return 0
  }),
  invoicingAdminMode: state => state.invoicingAdminMode,
  invoicingReadOnly: state => state.invoicingReadOnly,
  invoicingViews: state => state.invoicingViews,
  invoicingBatchUpdateMode: state => state.invoicingBatchUpdateMode
}

const actions = {
  async changeFileLocation({ commit }, {plant, path}) {
    localStorage.setItem('obDailyPath'+plant, path)
    commit('setObDailyPath'+plant, path)
  },
  async changeInvoicingDateRange({ commit, rootState }, val) {
    if (!val) return
    val = val.sort()

    localStorage.setItem('invoicingDateRange', JSON.stringify(val))
    commit('setDateRange', val)
    commit('setFilteredInvoicing', {
      lastUpdate: rootState.invoicing.lastUpdate,
      pms: (rootState.user.userInfo.subordinates || []).concat(rootState.user.userInfo.manuallyAddedSubordinates || []).concat([rootState.user.userInfo.sapUsername]).unique()
    })
  },
  async changeWeekGrouping({ commit }, val) {
    localStorage.setItem('invoicingWeekGrouping', JSON.stringify(val))
    commit('setWeekGrouping', val)
  },
  async getInvoicingSettings({ commit, dispatch, rootState }){
    try {
      const invSettings = rootState.settings.invoicingSettings
      commit('setLastUpdate', invSettings.lastUpdate)
      commit('setDatesModified', invSettings.datesModified)
      commit('setFilteredInvoicing', {
        lastUpdate: invSettings.lastUpdate,
        pms: (rootState.user.userInfo.subordinates || []).concat(rootState.user.userInfo.manuallyAddedSubordinates || []).concat([rootState.user.userInfo.sapUsername]).unique()
      })
      commit('setGroupingDate', invSettings.lastUpdate)
      commit('setViews', invSettings.views)
    } catch (error) {
      dispatch('notify', {
        text: ' ErrorID::1 - ' + error,
        color: 'error',
        state: true,
        timeout: 5000 
      })
    }
  },
  async changeCompareDate({ commit }, val) {
    commit('setCompareDate', val)
  },
  async changeGroupingDate({ commit }, val) {
    console.log(val)
    commit('setGroupingDate', val)
  },
  async changeInvoicingDetail({ dispatch, commit }, {fileName, invoicingDetail}) {
    rewriteDefaultSettingFile(fileName, invoicingDetail)
    dispatch('notify', {
      text: 'Saved.',
      color: 'success',
      state: 'true',
      timeout: 1500
    })
    commit('setInvoicingDetail', invoicingDetail)
  },
  async fetchInvoicingDetail({ commit }) {
    const invDetail = readDefaultSettingFile('invoicingDetails')
    commit('setInvoicingDetail', JSON.parse(invDetail))
  },
  async signInfo({ commit }, signInfo) {
    commit('setSignInfo', signInfo)
  },
  async setInvoicingAdminMode({ commit, dispatch, rootState }, val) {
    commit('setInvoicingAdminMode', val)
    if (val) dispatch('getInvoicingSettings')
  },
  async changeInvoicingReadOnly({ commit }, val) {
    commit('setInvoicingReadOnly', val)
    if (val) dispatch('getInvoicingSettings')
  },
  async setInvoicingBatchUpdateMode({ commit }, val) {
    localStorage.setItem('invoicingBatchUpdateMode', JSON.stringify(val))
    commit('setInvoicingBatchUpdateMode', val)
  }
}


const mutations = {
  setObDailyPath1301: (state, path) => state.obDailyPath1301 = path,
  setObDailyPath1601: (state, path) => state.obDailyPath1601 = path,
  setWeekGrouping: (state, val) => state.weekGrouping = val,
  setDateRange: (state, val) => state.dateRange = val,
  setGroupingDate: (state, date) => state.groupingDate = date,
  setDatesModified: (state, datesModified) => state.datesModified = datesModified,
  setLastUpdate: (state, lastUpdate) => state.lastUpdate = lastUpdate,
  setCompareDate: (state, date) => state.compareDate = date,
  setInvoicingDetail: (state, detail) => state.invoicingDetail = detail,
  setFilteredInvoicing: (state, {lastUpdate, pms}) => {
    const allActiveProjects = store.getters.allProjectsBasic
    const allNonActiveProjects = store.state.projects.nonActiveProjects
    const allProjects = allActiveProjects.concat(allNonActiveProjects)

    if (allProjects.length === 0 ) {
      store.dispatch('notify', {
        text: ' ErrorID::2 - There are no projects AT ALL. ',
        color: 'error',
        state: true,
        timeout: 5000 
      })
    }

    if (store.state.invoicing.invoicingAdminMode) {
      const filteredProjects =  allProjects.filter(e => {
        const lastDate = moment(e['Current Invoice Date']).format('YYYY-MM')
        return state.dateRange.includes(lastDate)
        })
      state.filteredInvoicing = filteredProjects
    } else {
      const filteredProjects =  allProjects.filter(e => {
        const lastDate = moment(e['Current Invoice Date']).format('YYYY-MM')

        return state.dateRange.includes(lastDate)
        && ((pms.includes(e['Project Manager']) || (e['temporaryAssign'].hasOwnProperty('personName') && _.intersection(pms, e['temporaryAssign'].personName).length > 0 )))
      })
      state.filteredInvoicing = filteredProjects
    }
    setTimeout(() => {
      ipcRenderer.send('invoicingArrReady')
    }, 100)
  },
  setSignInfo: (state, comments) => {
    state.signComments = comments
    state.showSignInfo = true
  },
  setInvoicingAdminMode: (state, val) => state.invoicingAdminMode = val,
  setInvoicingReadOnly: (state, val) => state.invoicingReadOnly = val,
  setViews: (state, val) => state.invoicingViews = val,
  setInvoicingBatchUpdateMode: (state, val) => state.invoicingBatchUpdateMode = val
}

export default {
    state,
    getters,
    actions,
    mutations
}