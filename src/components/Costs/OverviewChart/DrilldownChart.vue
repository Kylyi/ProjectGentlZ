<template>
  <v-layout column xs12 ref="costsPieChart">
    <v-flex row style="position: relative;"> 
      <v-layout row style="height: 44px;">
        <v-flex column style="max-width: 150px;"><h5 class="headline" style="position: absolute; top: 8px; left: 16px;"><b>{{selectedMonth}}</b></h5></v-flex>
        <v-flex column grow style="display: flex; align-items: center; justify-content: flex-end;">
            <v-btn @click="$parent.chartLevel = 0" outline>Back</v-btn>
          </v-flex>
      </v-layout>
      <v-layout row pt-2>
        <v-btn-toggle @change="getDatagridData" multiple v-model="seriesSelected" >
          <v-btn value="RM">RM</v-btn>
          <v-btn value="WIP">WIP</v-btn>
          <v-btn value="FG">FG</v-btn>
        </v-btn-toggle>
      </v-layout>
      <!-- CHART -->
      <v-layout row>
        <v-layout column>
          <v-flex v-if="selectedMonthChartData.length > 0" row style="display: flex; justify-content: center;">
            <dx-pie-chart
              :data-source="selectedMonthChartData"
              type="doughnut"
              title="Detail info"
              :size="{height: pieChartHeight, width: pieChartWidth}"
              resolve-label-overlapping="shift"
            >
              <dx-series argument-field="field" value-field="value">
                <dx-label
                  :visible="true"
                  format="millions"
                  :customize-text="getLabel"
                >
                  <dx-connector :visible="true"/>
                </dx-label>
              </dx-series>
              <dx-tooltip
                :enabled="true"
              >
                <dx-format
                  type="millions"
                />
              </dx-tooltip>
            </dx-pie-chart>
          </v-flex>
        </v-layout>

      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import { DxPieChart, DxLegend, DxSeries, DxTooltip, DxFormat, DxLabel, DxConnector, DxExport } from 'devextreme-vue/pie-chart';
import { mapGetters } from 'vuex';
export default {
  name: 'OverviewChartDrilldown',
  components: { DxPieChart, DxLegend, DxSeries, DxTooltip, DxFormat, DxLabel, DxConnector, DxExport },
  props: ['selectedMonth', 'chartData'],
  created() {
    this.$root.$on('chartDataLoaded', () => this.getDatagridData(this.seriesSelected))
  },
  mounted() {
    this.pieChartWidth = this.$parent.$refs.barChart.barChartWidth
    this.$root.$on('windowHeightChanged', () => this.getSize())
  },
  beforeDestroy() {
    this.$root.$off('windowHeightChanged')
    this.$root.$off('chartDataLoaded')
  },
  data() {
    return {
      selectedMonthChartData: [],
      seriesSelected: [],
      pieChartWidth: 0,
      pieChartHeight: window.innerHeight - 250
    }
  },
  methods: {
    getDatagridData(e) {
      if (e.length === 0) {
        this.selectedMonthChartData = []
        return
      }
      const monthsData = this.chartData.filter(x => x.field === this.selectedMonth)
      const fields = ['RM LV', 'RM MV', 'RM UV', 'RM EX', 'WIP LV', 'WIP MV', 'WIP UV', 'WIP EX']
      let selectedMonthChartData = []
      
      fields.forEach(f => {
        let isSelected = false

        e.forEach(s => {
         if (f.startsWith(s)) isSelected = true
        })

        if (isSelected) {
          selectedMonthChartData.push({
            field: f,
            value: monthsData[0][f]
          })
        }

      })

      if (e.includes('FG')) {
        selectedMonthChartData.push(
          {
            field: 'FG',
            value: monthsData[0]['FG Total'] - monthsData[0]['FG EX']
          },
          {
            field: 'FG EX',
            value: monthsData[0]['FG EX']
          }
        )
      }
      this.selectedMonthChartData = selectedMonthChartData
    },
    getLabel(e) {
      return `${e.argument}: ${e.valueText}`
    },
    getSize() {
      this.pieChartWidth = this.$parent.$refs.overviewChart.clientWidth
      this.pieChartHeight = window.innerHeight - 250
    }
  }
}
</script>

<style>

</style>
