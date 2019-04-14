<template>
  <v-container fluid style="padding: 0;">
    <v-layout column wrap>
      <v-flex row wrap><h5 class="headline"><b>Risk register quickview</b></h5></v-flex>
      <v-flex row wrap>
        <dx-chart
        :data-source="chosenProjects[0].riskRegister.bilance.chartData"
      >
        <dx-series-template
          name-field="category"
        />
        <dx-common-series-settings
          argument-field="mainCategory"
          value-field="priceImpact"
          type="stackedbar"
          hover-mode="nearestPoint"
        />
        <dx-legend
          vertical-alignment="bottom"
          horizontal-alignment="center"
        />
      </dx-chart>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  DxChart,
  DxSeries,
  DxCommonSeriesSettings,
  DxValueAxis,
  DxTitle,
  DxLegend,
  DxExport,
  DxTooltip,
  DxBorder,
  DxLabel,
  DxSeriesTemplate
} from 'devextreme-vue/chart'
export default {
  components: {
    DxChart,
    DxSeries,
    DxCommonSeriesSettings,
    DxValueAxis,
    DxTitle,
    DxLegend,
    DxExport,
    DxTooltip,
    DxBorder,
    DxLabel,
    DxSeriesTemplate
  },
  computed: {
    ...mapGetters(['chosenProjects'])
  }
}
</script>

<style>
  /* .modebar> div:nth-child(5) {
    display: none!important;
  } */
</style>
