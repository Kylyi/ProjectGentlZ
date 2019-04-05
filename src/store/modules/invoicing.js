import moment from 'moment'
import db from '../../main/scripts/database'
import store from '../index'
import { ipcRenderer } from 'electron'

const state = {
  obDailyPath1301: localStorage.getItem('obDailyPath1301'),
  obDailyPath1601: localStorage.getItem('obDailyPath1601'),
  lastUpdate: null,
  datesModified: [],
  dateRange: JSON.parse(localStorage.getItem('invoicingDateRange')) || [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(1, 'months').toISOString().substr(0, 10)],
  weekGrouping: JSON.parse(localStorage.getItem('invoicingWeekGrouping')) || false,
  groupingDate: null,
  compareDate: null,
  filteredInvoicing: []
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
  invoicingFilteredByDateRange: state => state.filteredInvoicing
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
  async getInvoicingSettings({ commit }){
    const invoicingSettingsDoc = await db.settings.get('invoicing')
    commit('setLastUpdate', invoicingSettingsDoc.lastUpdate)
    commit('setDatesModified', invoicingSettingsDoc.datesModified)
    commit('setFilteredInvoicing', invoicingSettingsDoc.lastUpdate)
    commit('setGroupingDate', invoicingSettingsDoc.lastUpdate)
  },
  async changeCompareDate({ commit }, val) {
    commit('setCompareDate', val)
  },
  async changeGroupingDate({ commit }, val) {
    console.log(val)
    // commit('setGroupingDate', val)
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
  setFilteredInvoicing: (state, lastUpdate) => {
    const allProjects = store.getters.allProjectsBasic
    if (allProjects.length === 0 ) return
    const filteredProjects =  allProjects.filter(e => {
      return e['Invoice Date'][lastUpdate] >= state.dateRange[0] && e['Invoice Date'][lastUpdate] <= state.dateRange[1]
    })

    ipcRenderer.send('invoicingArrReady')
    state.filteredInvoicing = filteredProjects
  },
}

export default {
    state,
    getters,
    actions,
    mutations
}