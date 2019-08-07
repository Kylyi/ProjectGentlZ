<template>
  <div>
    <dx-chart
      id="costsChart"
      class="pointer-on-bars"
      :data-source="costsDataMonthly.chartData"
      title="Costs"
      :size="{height: 800}"
      @point-click="getDetail"
    >
      <dx-common-series-settings argument-field="costsMonth" type="bar"/>
      <dx-series value-field="rmTotal" name="RM">
        <dx-label :customize-text="getLabel" :visible="true" />
      </dx-series>
      <dx-series value-field="wipTotal" name="WIP">
        <dx-label :customize-text="getLabel" :visible="true"></dx-label>
      </dx-series>
      <dx-series value-field="fgTotal" name="FG">
        <dx-label :customize-text="getLabel" :visible="true"></dx-label>
      </dx-series>

      <dx-tooltip :enabled="true" >
        <dx-format type="millions" />
      </dx-tooltip>
    </dx-chart>

    <drilldown ref="drilldown" :selected-month="selectedMonth" />
  </div>
</template>

<script>
import { DxChart, DxSeries, DxCommonSeriesSettings, DxValueAxis, DxTitle, DxLegend, DxBorder, DxExport, DxTooltip, DxCommonAxisSettings, DxFormat, DxLabel } from 'devextreme-vue/chart';
import { DxPieChart, DxConnector} from 'devextreme-vue/pie-chart';
import { mapActions, mapGetters } from 'vuex';
import Drilldown from './OverviewChart/Drilldown'
export default {
  name: 'OverviewChart',
  components: { DxChart, DxSeries, DxCommonSeriesSettings, DxValueAxis, DxTitle, DxLegend, DxBorder, DxExport, DxTooltip, DxCommonAxisSettings, DxFormat, DxLabel, DxPieChart, DxConnector, Drilldown },
  created() {
    if (!this.costsDataMonthly) this.getCostsDataMonthly()
  },
  data() {
    return {
      selectedMonth: ''
    }
  },
  computed: {
    ...mapGetters(['costsDataMonthly'])
  },
  methods: {
    ...mapActions(['getCostsDataMonthly']),
    getDetail(e) {
      this.$refs['drilldown'].detailDialog = true
      this.selectedMonth = e.target.argument
    },
    getLabel(e) {
      return `${e.seriesName}`
    }
  }
}
</script>

<style>
  #costsChart.pointer-on-bars .dxc-series rect {
    cursor: pointer;
  }
</style>
