<template>
  <v-container id="riskRegisterAggregateDrilldown" fluid style="background: white; position: relative;">
    <v-btn @click="$parent.$parent.$parent.drilldownDialog = false" icon style="position: absolute; margin: 0; top: 5px; right: 8px;"><v-icon>close</v-icon></v-btn>
    <v-layout column>
      <v-flex row >
        <b>{{ selectedProjectRR.projId }}</b> &nbsp; - &nbsp; {{ selectedProjectRR.projName }}
      </v-flex>
      <v-flex row>
        <b>{{ selectedProjectRR.category }}:</b>&nbsp;{{(selectedProjectRR.totalCategory / selectedProjectRR.totalMainCategory * 100).toFixed(1)}}% of all {{ selectedProjectRR.mainCategory === 'risk' ? 'risks' : 'opportunities' }}.
      </v-flex>
      <v-divider></v-divider>
      <v-flex row>
        <v-layout row>
          <v-flex column style="width: 400px; max-width: 400px; display: flex; flex-direction: column;">
            <dx-pie-chart
              :data-source="selectedProjectRR.chartData"
              type="doughnut"
              @point-click="selectData"

              >
              <dx-series argument-field="category" value-field="priceImpact">
                <dx-label
                  :visible="true"
                  format="thousands"
                >
                  <dx-connector :visible="true"/>
                </dx-label>
                <dx-hover-style color="black"/>
              </dx-series>
              <dx-legend
                :visible="false"
                :margin="0"
                horizontal-alignment="right"
                vertical-alignment="top"
              />
              <!-- <dx-tooltip
                :enabled="true"
                :customizeTooltip="tooltipSecondLevel"
              >
                <dx-format
                  type="thousands"
                />
              </dx-tooltip> -->
            </dx-pie-chart>
          </v-flex>

          <v-flex column grow wrap v-if="selectedData">
            <v-layout column>
              <v-flex row wrap pt-2>
                <div><b>Owner</b></div>
                <div>{{selectedData.owner}}</div>
              </v-flex>
              <v-divider></v-divider>
              <v-flex row wrap pt-4>
                <div><b> {{ selectedProjectRR.mainCategory === 'risk' ? 'Risk' : 'Opportunity' }} description</b></div>
                <div>{{selectedData.name}}</div>
              </v-flex>
              <v-divider></v-divider>
              <v-flex row wrap pt-4>
                <div><b>Additional info</b></div>
                <div>{{selectedData.description}}</div>
              </v-flex>
              <v-divider></v-divider>
              <v-flex row wrap pt-4>
                <div><b>Planned action for mitigation</b></div>
                <div>{{selectedData.plannedAction}}</div>
              </v-flex>
              <v-divider></v-divider>
            </v-layout>
          </v-flex>
          <v-flex column grow v-else>Click on point in chart to get more detailed info.</v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { DxPieChart, DxFormat, DxConnector, DxLegend, DxSeries, DxHoverStyle, DxLabel } from 'devextreme-vue/pie-chart'
export default {
  components: {
    DxPieChart,
    DxFormat,
    DxConnector,
    DxLegend,
    DxSeries,
    DxHoverStyle,
    DxLabel
  },
  data() {
    return {
      selectedData: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectRR'])
  },
  methods: {
    selectData(e) {
      e.target.select()
      this.selectedData = e.target.data
    },
    closeDialog() {
      console.log(this.$parent.$parent.drilldownDialog = false)
    }
  }
}
</script>

<style>

</style>
