<template>
  <div>
    <v-layout row wrap pt-1>
      <v-flex v-if="!costsLoading" column wrap xs12 :style="`max-height:calc(100vh - 164px); position: relative;`">
        <v-btn @click="saveChanges" small color="primary" outline style="position:absolute; z-index: 3; right: 62px; margin: 0; top: 2px;">Save changes</v-btn>
        <v-btn @click="setParametersBatch" small color="accent" outline style="position:absolute; z-index: 3; left: 0; margin: 0; top: 2px;">Set parameters for filtered rows</v-btn>
        <v-btn @click="$refs['realDataDialog'].dialog = true" small color="accent" outline style="position:absolute; z-index: 3; left: 280px; margin: 0; top: 2px;">Set real data</v-btn>
        <dx-data-grid
          ref="costsTable"
          :data-source="costsDataMonthly"
          show-borders
          key-expr='_id'
          :column-auto-width="true"
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :row-alternation-enabled="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :word-wrap-enabled="true"
          style="height: 100%; width: 100%;"
          :column-min-width="75"
          :repaint-changes-only="true"
          @content-ready="contentReady"
          @option-changed="filterChanged"
          @row-expanding="rowExpanding"
          >
          <dx-header-filter :visible="true" :allow-search="true" />

          <dx-filter-row :visible="true"/>
          <dx-filter-panel :visible="true"/>
          <dx-column-chooser :enabled="true"/>
          <dx-paging :page-size="2000"/>
          <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" />
          <!-- <dx-state-storing :enabled="true" type="custom" storage-key="overviewCostsGrid" :custom-save="customSaveGrid" :savingTimeout="2000" /> -->
          <dx-export :enabled="true" :allow-export-selected-data="true" />
          <dx-sorting mode="multiple" />

          <dx-master-detail :enabled="true" template="costsParametersTemplate" />
          <div slot="costsParametersTemplate" slot-scope="data">
            <v-container fluid style="padding: 12px;">
              <v-layout class="costsDetailTemplate" row wrap mb-1 style="display: flex; justify-content: space-evenly;">
                <v-flex column shrink pr-4>
                  <table>
                    <tr>
                      <td rowspan="3" style="width: 110px;"><span><b>Material distribution</b></span></td>
                      <td style="text-align: right; vertical-align: bottom;"><b>LV [%]</b></td>
                      <td>
                        <v-text-field @change="dataChanged($event, data.data, 'lvMat', data.data.costsParameters, 'Lv')" type="number"  style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.lvMat" hide-details />
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: right; vertical-align: bottom;"><b>MV [%]</b></td>
                      <td>
                        <v-text-field @change="dataChanged($event, data.data, 'mvMat', data.data.costsParameters, 'Mv')" type="number"  style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.mvMat" hide-details />
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: right; vertical-align: bottom;"><b>UV [%]</b></td>
                      <td>
                        <v-text-field @change="dataChanged($event, data.data, 'uvMat', data.data.costsParameters, 'Uv')" type="number"  style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.uvMat" hide-details />
                      </td>
                    </tr>
                  </table>
                </v-flex>
                <v-flex column shrink pr-4>
                  <table>
                    <tr>
                      <td rowspan="3" style="width: 110px;"><span><b>Leadtime</b></span></td>
                      <td style="text-align: right; vertical-align: bottom;"><b>LV [days]</b></td>
                      <td>
                        <v-text-field @change="dataChanged($event, data.data, 'lvMat_leadtime', data.data.costsParameters)" type="number" style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.lvMat_leadtime" hide-details />
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: right; vertical-align: bottom;"><b>MV [days]</b></td>
                      <td>
                        <v-text-field @change="dataChanged($event, data.data, 'mvMat_leadtime', data.data.costsParameters)" type="number"  style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.mvMat_leadtime" hide-details />
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: right; vertical-align: bottom;"><b>UV [days]</b></td>
                      <td>
                        <v-text-field  @change="dataChanged($event, data.data, 'uvMat_leadtime', data.data.costsParameters)" type="number"  style="padding-left: 8px; display: inline-flex;" :value="data.data.costsParameters.uvMat_leadtime" hide-details />
                      </td>
                    </tr>
                  </table>
                </v-flex>
              </v-layout>
            </v-container>
          </div>

          <dx-column
            data-field="_id"
            caption="Network #"
            alignment="center"
            :fixed="true"
          />
          <dx-column
            data-field="Network Description"
            caption="Network Description"
            alignment="left"
            width="300"
          />
          <dx-column
            data-field="Project Manager"
            caption="PM"
            alignment="left"
            width="120"
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
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            data-field="Real Costs"
            caption="Real Costs"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'1'"
            :data-field="'costs.result.rmLv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'2'"
            :data-field="'costs.result.rmMv_' + date"
            :caption="'RM MV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'3'"
            :data-field="'costs.result.rmUv_' + date"
            :caption="'RM UV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'19'"
            :data-field="'costs.result.rmEx_' + date"
            :caption="'RM EX ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'4'"
            :data-field="'costs.result.wipLv_' + date"
            :caption="'WIP LV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'5'"
            :data-field="'costs.result.wipMv_' + date"
            :caption="'WIP MV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'6'"
            :data-field="'costs.result.wipUv_' + date"
            :caption="'WIP UV ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'20'"
            :data-field="'costs.result.wipEx_' + date"
            :caption="'WIP EX ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'7'"
            :data-field="'costs.result.rmTotal_' + date"
            :caption="'RM ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="date === selectedMonth ? true : false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'8'"
            :data-field="'costs.result.wipTotal_' + date"
            :caption="'WIP ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="date === selectedMonth ? true : false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'9'"
            :data-field="'costs.result.fg_' + date"
            :caption="'FG ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="date === selectedMonth ? true : false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'23'"
            :data-field="'costs.result.fgEx_' + date"
            :caption="'FG EX ' + date"
            data-type="number"
            format="millions"
            alignment="center"
            :visible="false"
          />

          <dx-summary>
            <dx-total-item
              column="Network #"
              summary-type="count"
              display-format="Net count: {0}"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'10'"
              :column="'RM ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'11'"
              :column="'RM LV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'12'"
              :column="'RM MV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'13'"
              :column="'RM UV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'21'"
              :column="'RM EX ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'14'"
              :column="'WIP LV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'15'"
              :column="'WIP MV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'16'"
              :column="'WIP UV ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'22'"
              :column="'WIP EX ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'17'"
              :column="'WIP ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'18'"
              :column="'FG ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              v-for="date in dateRange"
              :key="date+'24'"
              :column="'FG EX ' + date"
              summary-type="sum"
              display-format="{0}"
              value-format="#,##0"
            />
            <dx-total-item
              column="Planned Costs"
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
      <v-flex v-else column wrap xs12 style="display: flex; flex-direction: column; text-align: center;">
        <div><v-icon large>fas fa-spinner fa-spin</v-icon></div>
        <div style="padding-top: 8px;">Loading</div>
      </v-flex>
    </v-layout>
    <batch-update-dialog ref="batchUpdateDialog" :filtered-data="filteredData" :date-range="dateRange" />
    <real-data-dialog ref="realDataDialog" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import moment from 'moment'
import BatchUpdateDialog from './OverviewGrid/BatchUpdateDialog'
import RealDataDialog from './OverviewGrid/RealDataDialog'
export default {
  name: 'OverviewGrid',
  components: { BatchUpdateDialog, RealDataDialog },
  created() {
    this.$root.$on('selectMonth', (month) => {
      if (month) this.selectedMonth = month
      else this.selectedMonth = moment().format('YYYY-MM')
    })
    if (Object.keys(this.costsSettings).length === 0) this.fetchCostsSettings()
  },
  mounted() {
    this.$nextTick(() => {
      console.log('rendered')
      setTimeout(() => {
        if (this.costsDataMonthly.length === 0) this.getCostsDataMonthly()
      }, 250)
    })
  },
  beforeDestroy() {
    this.$root.$off('selectMonth')
  },
  data() {
    return {
      dateRange: [0,1,2,3,4,5,6,7,8,9,10,11].map(e => moment().add(e, 'months').format('YYYY-MM')),
      selectedMonth: moment().format('YYYY-MM'),
      timeoutId: null,
      datagridContentReady: false,
      dataChanges: {},
      filteredData: []
    }
  },
  computed: {
    ...mapGetters(['costsDataMonthly', 'costsLoading', 'costsSettings'])
  },
  methods: {
    ...mapActions(['getCostsDataMonthly', 'changeProjectsData', 'getCostsDataRealLastUpdate', 'fetchCostsSettings']),
    contentReady(e) {
      if (this.datagridContentReady) return

      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.timeoutId = null
          this.datagridContentReady = true
          this.$root.$emit('overviewGridLoaded')
        }, 500)
      } else {
        this.timeoutId = setTimeout(() => {
          this.timeoutId = null
          this.datagridContentReady = true
          this.$root.$emit('overviewGridLoaded')
        }, 500)
      }
    },
    filterChanged(e) {
      if (e.fullName === 'filterValue') {
        this.datagridContentReady = false
      }
    },
    dataChanged(newVal, netData, field, oldData, category) {
      Object.keys(netData.costs.result).forEach(e => {
        if (e.indexOf(category) !== -1 && e.indexOf('Total') === -1 && e.indexOf('leadtime') === -1) {
           netData.costs.result[e] = netData.costs.result[e] / oldData[field] * newVal
        }
      })
      netData.costsParameters[field] = newVal

      const categories = [
        { field: 'rmTotal', condition: 'total', fields: ['rmLv', 'rmMv', 'rmUv'] },
        { field: 'wipTotal', condition: 'total', fields: ['wipLv', 'wipMv', 'wipUv'] },
        { field: 'fg', weight: 1 }
      ]

      this.dateRange.forEach(date => {
        categories.forEach(c => {
          if (c.condition === 'total') {
            netData.costs.result[c.field + '_' + date] = c.fields.reduce((agg, f) => {
              agg = agg + netData.costs.result[f+'_'+date]
              return agg
            } , 0)
          } else {
            netData.costs.result[c.field + '_' + date] = (netData['Planned Costs'] || 0) * c.weight / 100
          }
        })
      })
      
      this.datagridContentReady = false
      this.$refs['costsTable'].instance.refresh()

      if (this.dataChanges.hasOwnProperty(netData._id)) {
        this.dataChanges[netData._id]['costsParameters'][field] = Number(newVal) || 0
      } else {
        const newObj = {...oldData, [field]: Number(newVal) || 0}
        this.dataChanges[netData._id] = {
          costsParameters: newObj
        }
      }
    },
    cancelChanges() {
      this.$refs['costsTable'].instance.refresh()
      this.dataChanges = {}
    },
    async saveChanges() {
      await this.changeProjectsData({
        netNums: Object.keys(this.dataChanges),
        data: Object.values(this.dataChanges)
      })
    },
    setParametersBatch() {
      const dataSource = this.$refs['costsTable'].instance.getDataSource()
      this.filteredData = dataSource._items
      this.$refs['batchUpdateDialog'].dialog = true
    },
    rowExpanding(e) {
      if (e.key === 'Real data') e.cancel = true
    }
  }
}
</script>

<style>
  .costsDetailTemplate input {
    padding: 0!important;
    text-align: center;
  }
</style>
