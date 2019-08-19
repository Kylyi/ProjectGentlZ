import moment from 'moment'
import _ from 'underscore'

const state = {
  costsData: [],
  costsDataMonthly: [],
  costsDataRealLastUpdate: [],
  costsLoading: true
}

function getCostsForDates(data, dates, returnSum = false) {
  let sums = {
    rmLv: 0,
    rmMv: 0,
    rmUv: 0,
    rmTotal: 0,
    wipLv: 0,
    wipMv: 0,
    wipUv: 0,
    wipTotal: 0,
    fg: 0
  }

  const result =  data.map(e => {
    const hasParameters = e.hasOwnProperty('costsParameters')
    if (!hasParameters) e['costsParameters'] = {}

    const lvmat_leadtime = hasParameters ? e['costsParameters']['lvMat_leadtime'] : 15
    const mvmat_leadtime = hasParameters ? e['costsParameters']['mvMat_leadtime'] : 15
    const uvmat_leadtime = hasParameters ? e['costsParameters']['uvMat_leadtime'] : 15

    e['costsParameters']['lvMat_leadtime'] = lvmat_leadtime
    e['costsParameters']['mvMat_leadtime'] = mvmat_leadtime
    e['costsParameters']['uvMat_leadtime'] = uvmat_leadtime

    const lvMat = hasParameters ? e['costsParameters']['lvMat'] : 30
    const mvMat = hasParameters ? e['costsParameters']['mvMat'] : 40
    const uvMat = hasParameters ? e['costsParameters']['uvMat'] : 30

    e['costsParameters']['lvMat'] = lvMat
    e['costsParameters']['mvMat'] = mvMat
    e['costsParameters']['uvMat'] = uvMat

    
    if (!e.hasOwnProperty('costs')) e['costs'] = {result: {}}
    dates.forEach(date => {
      date = moment(date)
      const costsMonth = date.format('YYYY-MM')
      const isRmLv = date.isSameOrAfter(moment(e.costsOperations['op0130_esd'] || 0).subtract(lvmat_leadtime, 'days').format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0130_esd'] || 0).format('YYYY-MM-DD'))
      const isRmMv = (date.isSameOrAfter(moment(e.costsOperations['op0800_esd'] || 0).subtract(mvmat_leadtime, 'days').format('YYYY-MM-DD')) || date.isSameOrAfter(moment(e.costsOperations['op0805_esd'] || 0).subtract(mvmat_leadtime, 'days').format('YYYY-MM-DD'))) && 
        (date.isBefore(moment(e.costsOperations['op0800_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0805_esd'] || 0).format('YYYY-MM-DD')))
      const isRmUv = date.isSameOrAfter(moment(e.costsOperations['op0105_esd'] || 0).subtract(uvmat_leadtime, 'days').format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0105_esd'] || 0).format('YYYY-MM-DD'))

      const isWipLv = date.isSameOrAfter(moment(e.costsOperations['op0130_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))
      const isWipMv = ( date.isSameOrAfter(moment(e.costsOperations['op0800_esd'] || 0).format('YYYY-MM-DD')) || date.isSameOrAfter(moment(e.costsOperations['op0805_esd'] || 0).format('YYYY-MM-DD') )) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))
      const isWipUv = date.isSameOrAfter(moment(e.costsOperations['op0105_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))

      const isFg = date.isSameOrAfter(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD')) && date.isBefore((e.costsOperations['op0431_cfd'] ? moment(e.costsOperations['op0431_cfd']).format('YYYY-MM-DD') : moment(e.costsOperations['op0431_esd'] || 0).format('YYYY-MM-DD')))

      const categories = [
        { field: 'rmLv', weight: lvMat, condition: isRmLv },
        { field: 'rmMv', weight: mvMat, condition: isRmMv },
        { field: 'rmUv', weight: uvMat, condition: isRmUv },
        { field: 'rmTotal', condition: 'total', fields: ['rmLv', 'rmMv', 'rmUv'] },
        { field: 'wipLv', weight: lvMat, condition: isWipLv },
        { field: 'wipMv', weight: mvMat, condition: isWipMv },
        { field: 'wipUv', weight: uvMat, condition: isWipUv },
        { field: 'wipTotal', condition: 'total', fields: ['wipLv', 'wipMv', 'wipUv'] },
        { field: 'fg', weight: 100, condition: isFg }
      ]

      categories.forEach(c => {
        if (c.condition === 'total') {
          e['costs']['result'][c.field + '_' + costsMonth] = c.fields.reduce((agg, f) => agg + e['costs']['result'][f+'_'+costsMonth] , 0)
        } else {
          e['costs']['result'][c.field+'_'+costsMonth] = c.condition ? (e['Planned Costs'] || 0) * c.weight / 100 : 0
        }
        if (returnSum) {
          sums[c.field] += e.costs.result[c.field+'_'+costsMonth]
        }
      })

    })
    return e
  })

  if (returnSum) {
    return sums
  } else {
    return result
  }
}

const getters = {
  costsData: (state, getters) => {
    let allProjects = JSON.parse(JSON.stringify(getters.allProjectsBasic))
    return allProjects.filter(e => e.hasOwnProperty('costsOperations') && e['Net Status from Tasks'] !== 'E')
  },
  costsDataMonthly: state => state.costsDataMonthly,
  costsDataRealLastUpdate: state => state.costsDataRealLastUpdate,
  costsLoading: state => state.costsLoading
}

const actions = {
  async getCostsDataMonthly({ commit, rootState, dispatch }, date = false) {
    let allProjects = JSON.parse(JSON.stringify(rootState.projects.allProjectsBasic))
    allProjects = allProjects.filter(e => e.hasOwnProperty('costsOperations') && e['Net Status from Tasks'] !== 'E')
    const dateRange = [0,1,2,3,4,5,6,7,8,9,10,11].map(e => moment().add(e, 'months').endOf('month').format('YYYY-MM-DD'))

    const data = getCostsForDates(allProjects, dateRange)
    const lastUpdate = date || rootState.settings.costsSettings['lastUpdate']

    let additionalData = []
    if (moment(dateRange[0]).format('YYYY-MM') === moment(lastUpdate).format('YYYY-MM')) {
      additionalData = getCostsForDates(JSON.parse(JSON.stringify(allProjects)), [moment(lastUpdate).format('YYYY-MM-DD')], true)
      const lastUpdateMonth = moment(lastUpdate).format('YYYY-MM')
      const realData = rootState.settings.costsSettings.realData[lastUpdate]
      const extraRow = {
        _id: 'Real data',
        'Network Description': `Data for ${lastUpdate}`,
        costs: {
          result: {
            ['rmTotal_' + lastUpdateMonth]: additionalData.rmTotal - realData.rmTotal,
            ['rmEx_' + lastUpdateMonth]: additionalData.rmTotal - realData.rmTotal,
            ['wipTotal_' + lastUpdateMonth]: additionalData.wipTotal - realData.wipTotal,
            ['wipEx_' + lastUpdateMonth]: additionalData.wipTotal - realData.wipTotal,
            ['fg_' + lastUpdateMonth]: additionalData.fg - realData.fg,
            ['fgEx_' + lastUpdateMonth]: additionalData.fg - realData.fg
          }
        }
      }
      data.push(extraRow)

    } else {
      dispatch('notify', {
        text: 'There are no real data for current month',
        color: 'info',
        state: true,
        timeout: 5000
      })
    }

    commit('setCostsDataMonthly', data)
    commit('setCostsLoading', false)
  },
  async getCostsDataRealLastUpdate({ commit, rootState }, date = false) {
    let allProjects = JSON.parse(JSON.stringify(rootState.projects.allProjectsBasic))
    allProjects = allProjects.filter(e => e.hasOwnProperty('costsOperations') && e._id === '1000044127')
    const lastUpdate = date || rootState.settings.costsSettings['lastUpdate']

    const dateRange = [moment(lastUpdate).format('YYYY-MM-DD')]

    const data = getCostsForDates(allProjects, dateRange, true)
    console.log(data)

  },
  setCostsLoading({ commit }, val = true) {
    commit('setCostsLoading', val)
  }
}

const mutations = {
  setCostsDataMonthly: (state, data) => state.costsDataMonthly = data,
  setCostsLoading: (state, val) => state.costsLoading = val
}

export default {
  state,
  getters,
  actions,
  mutations
}