<template>
  <v-layout column style="background-color: white; padding: 0 4px;">
    <v-flex row wrap style="max-height: 52px; padding: 8px 16px;"><h5 class="headline"><b>Risk register</b></h5></v-flex>
    <v-flex row wrap style="padding-top: 32px; display: contents; position: relative;">
      <v-btn
        @click="isFirstLevel = true; filter = ''; selectedData= {};"
        :style="`margin: 0; position: absolute; right: 8px; top: 6px;; display: ${isFirstLevel ? 'none' : ''}`"
        color="accent" outline
        
      >
        <v-icon>chevron_left</v-icon>
        Back
      </v-btn>

      <v-flex row>
        <v-layout column>
          <v-flex row v-if="isFirstLevel">
            <dx-chart
              id="riskRegisterQuickviewChart"
              :data-source="chartDataFiltered"
              :size="{height: chartHeight}"
              :class="isFirstLevel ? 'pointer-on-bars' : ''"
              @point-click="categoryClicked"
            >
            <dx-tooltip
              :enabled="true"
            >
              <dx-format
                type="thousands"
              />
            </dx-tooltip>
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
          
          <v-flex row v-else>
            <v-layout column>
              <v-flex row>
                <dx-pie-chart
                  :data-source="chartDataFiltered"
                  type="doughnut"
                  :size="{height: chartHeight - 100}"
                  @point-click="selectData"
                  >
                  <dx-series argument-field="mainCategory" value-field="priceImpact">
                    <dx-label
                      :visible="true"
                      format="thousands"
                    >
                      <dx-connector :visible="true"/>
                    </dx-label>
                    <dx-hover-style color="black"/>
                  </dx-series>
                  <!-- <dx-series-template
                    name-field="category"
                    :customize-series="customize"
                  /> -->
                  <dx-legend
                    :visible="false"
                    :margin="0"
                    horizontal-alignment="right"
                    vertical-alignment="top"
                  />
                  <dx-tooltip
                    :enabled="true"
                    :customizeTooltip="tooltipSecondLevel"
                  >
                    <dx-format
                      type="thousands"
                    />
                  </dx-tooltip>
                </dx-pie-chart>
              </v-flex>
              <v-divider></v-divider>
              <v-flex row>
                <v-layout column style="overflow: auto; padding: 4px; max-height: 92px;">
                  <v-flex row><b>Owner:</b> &nbsp; {{ selectedData.owner }}</v-flex>
                  <v-flex row><b>Description:</b> &nbsp; {{ selectedData.name }}</v-flex>
                  <v-flex row><b>Planned Action:</b> &nbsp; {{ selectedData.plannedAction }}</v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>

      </v-flex>

      
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import { DxPieChart, DxFormat, DxConnector } from 'devextreme-vue/pie-chart'
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
  DxSeriesTemplate,
  DxHoverStyle
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
    DxSeriesTemplate,
    DxPieChart,
    DxHoverStyle,
    DxFormat,
    DxConnector
  },
  props: ['chartData'],
  created() {
    const dashLayout = JSON.parse(localStorage.getItem('dashboardLayout'))

    if (dashLayout) {
      this.chartHeight = dashLayout[1].h * 40 - 50
    } else {
      this.chartHeight =  11 * 39 - 50
    }
    
  },
  watch: {
    chartData: {
      immediate: true,
      handler() {
        this.isFirstLevel = true
        this.filter = ''
        this.chartDataLocal = JSON.parse(JSON.stringify(this.chartData))
      }
    }
  },
  data: function () {
    return {
      chartHeight: 0,
      chartDataLocal: [],
      isFirstLevel: true,
      filter: '',
      selectedData: {},
      paletteColors: {
        'Health and Safety': 'rgb(255, 199, 32)',
        'High project value or complexity': 'rgb(29, 178, 245)',
        'Commercial Conditions': 'rgb(245, 86, 74)',
        'Technical Specification': 'rgb(235, 53, 115)',
        'Organizational': 'rgb(198, 144, 83)',
        'External conditions': 'rgb(203, 200, 62)',
        'Opportunities': 'rgb(151, 201, 92)' 
      }
    }
  },
  computed: {
    ...mapGetters([]),
    chartDataFiltered() {
      if (!this.filter) return this.chartDataLocal
      else return this.chartDataLocal.filter(x => x.mainCategory === this.filter)   
    }
  },
  methods: {
    categoryClicked(e) {
      if (this.isFirstLevel) {
        this.isFirstLevel = false
        this.filter = e.target.originalArgument
      }
    },
    selectData(e) {
      e.target.select()
      this.selectedData = e.target.data
    },
    getColors(e) {
      if (!this.isFirstLevel) {
        return {
          color: this.paletteColors.hasOwnProperty(e.data.category) ? this.paletteColors[e.data.category] : '#546e7a'
        }
      } else {
        return {
          color: this.paletteColors.hasOwnProperty(e.seriesName) ? this.paletteColors[e.seriesName] : '#546e7a'
        }
      }
    },
    customize(e) {
      return {
        color: this.paletteColors.hasOwnProperty(e) ? this.paletteColors[e] : '#546e7a'
      }
    },
    tooltipSecondLevel(e) {
      return {
        text: `${e.point.data.category} - ${e.percentText}`
      }
    }
  }
}
</script>

<style>
  #riskRegisterQuickviewChart.pointer-on-bars .dxc-series rect {
    cursor: pointer;
  }
</style>
