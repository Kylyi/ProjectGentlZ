<template>
  <v-layout ref="costsBarChart" id="jauznevim" column xs12>
    <v-flex row style="display: flex; justify-content: center;">
      <dx-chart
        id="costsChart"
        class="pointer-on-bars"
        :data-source="chartData"
        title="Costs"
        :size="{height: barChartHeight, width: barChartWidth}"
        @point-click="getDetail"
        @series-click="getSeries"
      >
        <dx-common-series-settings argument-field="field" type="stackedbar"/>
        <dx-series value-field="RM Total" name="RM">
          <!-- <dx-label :customize-text="getLabel" :visible="true" /> -->
        </dx-series>
        <dx-series value-field="WIP Total" name="WIP">
          <!-- <dx-label :customize-text="getLabel" :visible="true"></dx-label> -->
        </dx-series>
        <dx-series value-field="FG Total" name="FG">
          <!-- <dx-label :customize-text="getLabel" :visible="true"></dx-label> -->
        </dx-series>

        <dx-tooltip :enabled="true" >
          <dx-format type="millions" />
        </dx-tooltip>
      </dx-chart>
    </v-flex>
  </v-layout>
</template>

<script>
import { DxChart, DxSeries, DxCommonSeriesSettings, DxValueAxis, DxTitle, DxLegend, DxBorder, DxExport, DxTooltip, DxCommonAxisSettings, DxFormat, DxLabel } from 'devextreme-vue/chart';
import { mapGetters, mapActions } from "vuex";
export default {
  name: 'CostsBarChart',
  components: {  DxChart, DxSeries, DxCommonSeriesSettings, DxValueAxis, DxTitle, DxLegend, DxBorder, DxExport, DxTooltip, DxCommonAxisSettings, DxFormat, DxLabel},
  props: ['selectedMonth', 'chartData', 'isParametersChanged'],
  mounted() {
    this.$root.$on('windowHeightChanged', () => this.getSize())
    this.barChartWidth = this.$refs.costsBarChart.clientWidth / 50 * 30
  },
  beforeDestroy() {
    this.$root.$off('windowHeightChanged')
  },
  data() {
    return {
      barChartWidth: 0,
      barChartHeight: window.innerHeight - 160
    }
  },
  methods: {
    ...mapActions(['notify']),
    getDetail(e) {
      if (this.isParametersChanged) return
      this.$parent.chartLevel = 1
      this.$parent.selectedMonth = e.target.argument
      this.$root.$emit('selectMonth', e.target.argument)
    },
    getLabel(e) {
      return `${e.seriesName}`
    },
    getSeries(e) {
      if (this.isParametersChanged) {
        this.notify({
          text: 'You have unsaved changes. Either save or cancel them first.',
          color: 'info',
          state: true,
          timeout: 4000
        })
        return
      }
      this.$parent.$refs['drilldownChart'].seriesSelected = [e.target.name]
      setTimeout(() => this.$parent.$refs['drilldownChart'].getDatagridData([e.target.name]), 200)
      this.$root.$emit('selectSeries', e.target.name)
    },
    getWidth() {
      this.barChartWidth = this.$refs.costsBarChart.clientWidth
    },
    getSize() {
      this.barChartWidth = this.$parent.$refs.overviewChart.clientWidth
      this.barChartHeight = window.innerHeight - 160
    }
  }
}
</script>

<style>

</style>
