import moment from 'moment'
import _ from 'underscore'
const state = {
  costsData: [],
  costsDataMonthly: null
}

function getCostsForDates(data, dates, isChartData = false) {
  let chartData = dates.reduce((agg, e) => {
    const costsMonth = moment(e).format('YYYY-MM')
    const newDataObj = {
      [costsMonth]: { rmLv: 0, rmMv: 0, rmUv: 0, rmTotal: 0, wipLv: 0, wipMv: 0, wipUv: 0, wipTotal: 0, fgTotal: 0, costsMonth }}
    Object.assign(agg, newDataObj)
    return agg
  }, {})

  const result =  data.map(e => {
    const hasParameters = e.hasOwnProperty('costs') && e['costs'].hasOwnProperty('parameters')
    const lvmat_leadtime = hasParameters ? e['costs']['parameters']['lvmat_leadtime'] : 15
    const mvmat_leadtime = hasParameters ? e['costs']['parameters']['mvmat_leadtime'] : 15
    const uvmat_leadtime = hasParameters ? e['costs']['parameters']['uvmat_leadtime'] : 15
    const lvmat = hasParameters ? e['costs']['parameters']['lvmat'] : 30
    const mvmat = hasParameters ? e['costs']['parameters']['mvmat'] : 40
    const uvmat = hasParameters ? e['costs']['parameters']['uvmat'] : 30

    
    if (!e.hasOwnProperty('costs')) e['costs'] = {result: {}}
    dates.forEach(date => {
      date = moment(date)
      const costsMonth = date.format('YYYY-MM')
      const isRmLv = date >= moment(e.costsOperations['op0130_esd']).subtract(lvmat_leadtime, 'days') && date < moment(e.costsOperations['op0130_esd'])
      const isRmMv = (date >= moment(e.costsOperations['op0800_esd']).subtract(mvmat_leadtime, 'days') || date >= moment(e.costsOperations['op0805_esd']).subtract(mvmat_leadtime, 'days')) && 
        (date < moment(e.costsOperations['op0800_esd']) || date < moment(e.costsOperations['op0805_esd']))
      const isRmUv = date >= moment(e.costsOperations['op0105_esd']).subtract(uvmat_leadtime, 'days') && date < moment(e.costsOperations['op0105_esd'])

      const isWipLv = date >= moment(e.costsOperations['op0130_esd']) && date < moment(e.costsOperations['op0420_efd'])
      const isWipMv = ( date >= moment(e.costsOperations['op0800_esd']) || date >= moment(e.costsOperations['op0805_esd']) ) && date < moment(e.costsOperations['op0420_efd'])
      const isWipUv = date >= moment(e.costsOperations['op0105_esd']) && date < moment(e.costsOperations['op0420_efd'])

      const isFg = date >= moment(e.costsOperations['op0420_efd']) && ( !e.costsOperations['op0431_cfd'] || !e.costsOperations['op0431_esd'] )
      
      e['costs']['result']['rmLv_'+costsMonth] = isRmLv ? e['Planned Costs'] || 0 * lvmat / 100 : 0
      e['costs']['result']['rmMv_'+costsMonth] = isRmMv ? e['Planned Costs'] || 0 * mvmat / 100 : 0
      e['costs']['result']['rmUv_'+costsMonth] = isRmUv ? e['Planned Costs'] || 0 * uvmat / 100 : 0
      e['costs']['result']['rmTotal_'+costsMonth] = e['costs']['result']['rmLv_'+costsMonth] + e['costs']['result']['rmMv_'+costsMonth] + e['costs']['result']['rmUv_'+costsMonth]

      e['costs']['result']['wipLv_'+costsMonth] = isWipLv ? e['Planned Costs'] || 0 * lvmat / 100 : 0
      e['costs']['result']['wipMv_'+costsMonth] = isWipMv ? e['Planned Costs'] || 0 * mvmat / 100 : 0
      e['costs']['result']['wipUv_'+costsMonth] = isWipUv ? e['Planned Costs'] || 0 * uvmat / 100 : 0
      e['costs']['result']['wipTotal_'+costsMonth] = e['costs']['result']['wipLv_'+costsMonth] + e['costs']['result']['wipMv_'+costsMonth] + e['costs']['result']['wipUv_'+costsMonth]

      e['costs']['result']['fg_'+costsMonth] = isFg ? e['Planned Costs'] || 0 : 0

      chartData[costsMonth].rmLv += e['costs']['result']['rmLv_'+costsMonth]
      chartData[costsMonth].rmMv += e['costs']['result']['rmMv_'+costsMonth]
      chartData[costsMonth].rmUv += e['costs']['result']['rmUv_'+costsMonth]

      chartData[costsMonth].wipLv += e['costs']['result']['wipLv_'+costsMonth]
      chartData[costsMonth].wipMv += e['costs']['result']['wipMv_'+costsMonth]
      chartData[costsMonth].wipUv += e['costs']['result']['wipUv_'+costsMonth]


      chartData[costsMonth].rmTotal += e['costs']['result']['rmTotal_'+costsMonth]
      chartData[costsMonth].wipTotal += e['costs']['result']['wipTotal_'+costsMonth]
      chartData[costsMonth].fgTotal += e['costs']['result']['fg_'+costsMonth]

    })
    return e
  })

  return {
    data: result,
    chartData: _.flatten(Object.values(chartData))
  }
}

const getters = {
  costsData: (state, getters) => {
    let allProjects = JSON.parse(JSON.stringify(getters.allProjectsBasic))
    return allProjects.filter(e => e.hasOwnProperty('costsOperations'))
  },
  costsDataMonthly: state => state.costsDataMonthly
}

const actions = {
  async getCostsDataMonthly({ commit, rootState }, isChartData = false) {
    let allProjects = JSON.parse(JSON.stringify(rootState.projects.allProjectsBasic))
    allProjects = allProjects.filter(e => e.hasOwnProperty('costsOperations'))
    const dateRange = [0,1,2].map(e => moment().add(e, 'months').endOf('month').format('YYYY-MM-DD'))
    
    const data = getCostsForDates(allProjects, dateRange, isChartData)
    commit('setCostsDataMonthly', data)
  }
}

const mutations = {
  setCostsDataMonthly: (state, data) => state.costsDataMonthly = data
}

export default {
  state,
  getters,
  actions,
  mutations
}