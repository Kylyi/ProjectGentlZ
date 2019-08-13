<template>
  <v-layout column ref="overviewChart">
    <v-flex row v-show="chartLevel === 0">
      <bar-chart ref="barChart" :selected-month="selectedMonth" :chart-data="chartData" :is-parameters-changed="isParametersChanged"  />
    </v-flex>

    <v-flex row v-show="chartLevel === 1">
      <drilldown-chart ref="drilldownChart" :selected-month="selectedMonth" :chart-data="chartData"  />
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import BarChart from './OverviewChart/BarChart'
import DrilldownChart from './OverviewChart/DrilldownChart'
import moment from 'moment'
import { setTimeout } from 'timers';
export default {
  name: 'OverviewChart',
  components: { DrilldownChart, BarChart },
  created() {
    this.$root.$on('overviewGridLoaded', () => { this.getChartData() })
  },
  beforeDestroy() {
    this.$root.$off('overviewGridLoaded')
  },
  data() {
    return {
      selectedMonth: '',
      chartLevel: 0,
      chartData: [],
      isParametersChanged: false
    }
  },
  methods: {
    getChartData() {
      const dateRange = [0,1,2,3,4,5,6,7,8,9,10,11].map(e => moment().add(e, 'months').format('YYYY-MM'))
      let selectedMonthChartData = []
      dateRange.forEach(date => {
        selectedMonthChartData.push({
          field: date,
          'RM LV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('RM LV ' + date),
          'RM MV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('RM MV ' + date),
          'RM UV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('RM UV ' + date),
          'RM Total': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('RM ' + date),

          'WIP LV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('WIP LV ' + date),
          'WIP MV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('WIP MV ' + date),
          'WIP UV': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('WIP UV ' + date),
          'WIP Total': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('WIP ' + date),

          'FG Total': this.$parent.$parent.$parent.$refs['overviewGrid'].$refs['costsTable'].instance.getTotalSummaryValue('FG ' + date),

        })
      })
      this.chartData = selectedMonthChartData
      setTimeout(() => this.$root.$emit('chartDataLoaded'), 200)
    },
    getDetail(e) {
      this.chartLevel = 1
      this.selectedMonth = e.target.argument
      this.$root.$emit('selectMonth', e.target.argument)
    },
    getLabel(e) {
      return `${e.seriesName}`
    },
    getSeries(e) {
      this.$refs['drilldownChart'].seriesSelected = [e.target.name]
      setTimeout(() => this.$refs['drilldownChart'].getDatagridData([e.target.name]), 200)
    }
  }
}
</script>

<style>
  #costsChart.pointer-on-bars .dxc-series rect {
    cursor: pointer;
  }
</style>
