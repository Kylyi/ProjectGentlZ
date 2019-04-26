import moment from 'moment'
import store from '../index'
import { ipcRenderer } from 'electron'
import { rewriteDefaultSettingFile, readDefaultSettingFile } from '../helpers/localFilesManipulation'

const state = {
  obDailyPath1301: localStorage.getItem('obDailyPath1301'),
  obDailyPath1601: localStorage.getItem('obDailyPath1601'),
  lastUpdate: null,
  datesModified: [],
  // dateRange: JSON.parse(localStorage.getItem('invoicingDateRange')) || [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(1, 'months').toISOString().substr(0, 10)],
  dateRange: [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(3, 'months').toISOString().substr(0, 10)],
  weekGrouping: JSON.parse(localStorage.getItem('invoicingWeekGrouping')) || false,
  groupingDate: null,
  compareDate: null,
  filteredInvoicing: [],
  invoicingDetail: [],
  signComments: []
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
  signComments: state => state.signComments.reverse()
}

const actions = {
  async changeFileLocation({ commit }, {plant, path}) {
    localStorage.setItem('obDailyPath'+plant, path)
    commit('setObDailyPath'+plant, path)
  },
  async changeInvoicingDateRange({ commit, rootState }, val) {
    if (!val) return 
    const fromDate = moment(val[0]).toISOString().substr(0, 10)
    const toDate = moment(val[1]).toISOString().substr(0, 10)

    localStorage.setItem('invoicingDateRange', JSON.stringify([fromDate, toDate]))
    commit('setDateRange', [fromDate, toDate])
    commit('setFilteredInvoicing', rootState.invoicing.lastUpdate)
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
      commit('setFilteredInvoicing', invSettings.lastUpdate)
      commit('setGroupingDate', invSettings.lastUpdate)
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
  async changeGroupingDate({}, val) {
    console.log(val)
    // commit('setGroupingDate', val)
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
  setFilteredInvoicing: (state, lastUpdate) => {
    const allProjects = store.getters.allProjectsBasic
    if (allProjects.length === 0 ) {
      store.dispatch('notify', {
        text: ' ErrorID::2 - There are no projects AT ALL. ',
        color: 'error',
        state: true,
        timeout: 5000 
      })
    }
    const filteredProjects =  allProjects.filter(e => {
      return e['Invoice Date'][lastUpdate] >= state.dateRange[0] && e['Invoice Date'][lastUpdate] <= state.dateRange[1]
    })

    ipcRenderer.send('invoicingArrReady')
    state.filteredInvoicing = filteredProjects
  },
  setSignInfo: (state, comments) => {
    state.signComments = comments
    state.showSignInfo = true
  }
}

export default {
    state,
    getters,
    actions,
    mutations
}