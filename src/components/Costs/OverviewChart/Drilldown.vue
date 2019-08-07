<template>
  <v-dialog
    v-model="detailDialog"
    scrollable  
    persistent
    max-width="100%"
    transition="dialog-transition"
    >
    <v-layout column>
      <v-flex row style="background-color: white; position: relative;"> 
        <v-btn @click="detailDialog = false" icon style="position: absolute; margin: 0; top: 5px; right: 8px;"><v-icon>close</v-icon></v-btn>
        <v-layout row style="height: 44px;"><h5 class="headline" style="position: absolute; top: 8px; left: 16px;"><b>{{selectedMonth}}</b></h5></v-layout>
        <v-layout row>
          <v-layout column>
            <v-flex row style="display: flex; justify-content: center;">
              <v-btn-toggle @change="getDatagridData" multiple v-model="seriesSelected" >
                <v-btn value="RM">RM</v-btn>
                <v-btn value="WIP">WIP</v-btn>
                <v-btn value="FG">FG</v-btn>
              </v-btn-toggle>
            </v-flex>

            <v-flex v-if="selectedMonthChartData.length > 0" row style="display: flex; justify-content: center;">
              <dx-pie-chart
                :data-source="selectedMonthChartData"
                type="doughnut"
                title="Detail info"
                :size="{height: 200, width: 500}"
              >
                <dx-series argument-field="field" value-field="value">
                  <dx-label
                    :visible="true"
                    format="millions"
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

        <v-layout row pt-3  >
          <v-flex column style="max-height: 600px;">
            <dx-data-grid
              ref="costsTableDetail"
              :data-source="costsDataMonthly.data"
              key-expr='_id'
              :column-auto-width="true"
              :show-borders="true"
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :row-alternation-enabled="true"
              :show-row-lines="true"
              :show-column-lines="true"
              :word-wrap-enabled="true"
              style="height: 100%; width: 100%;"
              :column-min-width="50"
              :repaint-changes-only="true"
              @option-changed="recalculateChart"
            >
              <dx-header-filter
                :visible="true"
                :allow-search="true"
              />

              <dx-filter-row :visible="true"/>
              <dx-filter-panel :visible="true"/>
              <dx-group-panel :visible="true"/>
              <dx-search-panel :visible="true"/>
              <dx-column-chooser :enabled="true"/>
              <dx-grouping :context-menu-enabled="false" :auto-expand-all="false" :allow-collapsing="true"/>
              <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" />
              <dx-export :enabled="true" :allow-export-selected-data="true" />
              <dx-state-storing :enabled="true" type="localStorage" storage-key="costsDetailMonthly" :savingTimeout="2000" />
              
              <dx-column
                data-field="_id"
                caption="Network #"
                alignment="center"
              />
              <dx-column
                data-field="Network Description"
                caption="Network Description"
                alignment="left"
                width="350"
              />
              <dx-column
                data-field="Project Manager"
                caption="PM"
                alignment="left"
              />
              <dx-column
                caption="Panels / Modules"
                alignment="center"
                cell-template="panelsModulesTemplate"
              />
              <dx-column
                data-field="Planned Costs"
                caption="Planned costs"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                data-field="Real Costs"
                caption="Real Costs"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.rmLv_' + selectedMonth"
                caption="RM LV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.rmMv_' + selectedMonth"
                caption="RM MV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.rmUv_' + selectedMonth"
                caption="RM UV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.rmTotal_' + selectedMonth"
                caption="RM Total"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.wipLv_' + selectedMonth"
                caption="WIP LV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.wipMv_' + selectedMonth"
                caption="WIP MV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.wipUv_' + selectedMonth"
                caption="WIP UV"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.wipTotal_' + selectedMonth"
                caption="WIP Total"
                data-type="number"
                format="thousands"
                alignment="center"
              />
              <dx-column
                :data-field="'costs.result.fg_' + selectedMonth"
                caption="FG"
                data-type="number"
                format="thousands"
                alignment="center"
              />

              <dx-summary>
                <dx-total-item
                  column="RM LV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="RM MV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="RM UV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="RM Total"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="WIP LV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="WIP MV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="WIP UV"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="WIP Total"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
                <dx-total-item
                  column="FG"
                  summary-type="sum"
                  display-format="{0}"
                  value-format="#,##0"
                />
              </dx-summary>

              <div slot="panelsModulesTemplate" slot-scope="templateData">
                {{templateData.data['Number of Panels']}} / {{templateData.data['Number of Modules']}}
              </div>
            </dx-data-grid>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-dialog>
</template>

<script>
import { DxPieChart, DxLegend, DxSeries, DxTooltip, DxFormat, DxLabel, DxConnector, DxExport } from 'devextreme-vue/pie-chart';
import { mapGetters } from 'vuex';
export default {
  name: 'OverviewChartDrilldown',
  components: { DxPieChart, DxLegend, DxSeries, DxTooltip, DxFormat, DxLabel, DxConnector, DxExport },
  props: ['selectedMonth'],
  data() {
    return {
      detailDialog: false,
      selectedMonthChartData: [],
      seriesSelected: []
    }
  },
  computed: {
    ...mapGetters(['costsDataMonthly'])
  },
  methods: {
    getDatagridData(e) {
      if (e.length === 0) {
        this.selectedMonthChartData = []
        return
      }
      const fields = ['RM LV', 'RM MV', 'RM UV', 'WIP LV', 'WIP MV', 'WIP UV', 'FG']
      let selectedMonthChartData = []
      fields.forEach(f => {
        selectedMonthChartData.push({
          field: f,
          value: this.$refs['costsTableDetail'].instance.getTotalSummaryValue(f)
        })
      })

      this.selectedMonthChartData = selectedMonthChartData.filter(x => {
       let isSelected = false
       e.forEach(s => {
         if (x.field.startsWith(s)) isSelected = true
        })
        return isSelected
      })

      console.log(this.$refs['costsTableDetail'])
    },
    recalculateChart(e) {
      if (e.fullName === 'filterValue') {
        setTimeout(() => this.getDatagridData(this.seriesSelected), 1000)
      }
    }
  }
}
</script>

<style>

</style>
