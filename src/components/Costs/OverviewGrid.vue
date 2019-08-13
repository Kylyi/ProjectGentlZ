<template>
  <div>
    <v-layout row wrap pt-1>
      <v-flex column wrap xs12 :style="`max-height:calc(100vh - 164px); position: relative;`">
        <v-btn @click="saveChanges" small color="primary" outline style="position:absolute; z-index: 3; right: 62px; margin: 0; top: 2px;">Save changes</v-btn>
        <!-- <v-btn @click="cancelChanges" small color="accent" outline style="position:absolute; z-index: 3; right: 370px; margin: 0; top: 2px;">Cancel changes</v-btn> -->
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
          >
          <dx-header-filter
            :visible="true"
            :allow-search="true"
          />

          <dx-filter-row :visible="true"/>
          <dx-filter-panel :visible="true"/>
          <dx-column-chooser :enabled="true"/>
          <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" />

          <dx-export :enabled="true" :allow-export-selected-data="true" />

          <dx-master-detail
            :enabled="true"
            template="costsParametersTemplate"
          />

          <div slot="costsParametersTemplate" slot-scope="data">
            <v-container fluid style="padding: 12px;">
              <v-layout column>
                <v-flex row>
                  <div style="display: inline-flex; width: 120px;"><b>Leadtimes</b></div>
                  <v-text-field @change="dataChanged($event, data.data, 'lvMat_leadtime', data.data.costsParameters)" type="number" style="padding-left: 8px; display: inline-flex;" label="LV LEADTIME" :value="data.data.costsParameters.lvMat_leadtime" hide-details />
                  <v-text-field @change="dataChanged($event, data.data, 'mvMat_leadtime', data.data.costsParameters)" type="number"  style="padding-left: 8px; display: inline-flex;" label="MV LEADTIME" :value="data.data.costsParameters.mvMat_leadtime" hide-details />
                  <v-text-field  @change="dataChanged($event, data.data, 'uvMat_leadtime', data.data.costsParameters)" type="number"  style="padding-left: 8px; display: inline-flex;" label="UV LEADTIME" :value="data.data.costsParameters.uvMat_leadtime" hide-details />
                </v-flex>
                <v-flex row>
                  <div style="display: inline-flex; width: 120px;"><b>Material distribution</b></div>
                  <v-text-field @change="dataChanged($event, data.data, 'lvMat', data.data.costsParameters, 'Lv')" type="number"  style="padding-left: 8px; display: inline-flex;" label="LV MATERIAL" :value="data.data.costsParameters.lvMat" hide-details />
                  <v-text-field @change="dataChanged($event, data.data, 'mvMat', data.data.costsParameters, 'Mv')" type="number"  style="padding-left: 8px; display: inline-flex;" label="MV MATERIAL" :value="data.data.costsParameters.mvMat" hide-details />
                  <v-text-field @change="dataChanged($event, data.data, 'uvMat', data.data.costsParameters, 'Uv')" type="number"  style="padding-left: 8px; display: inline-flex;" label="UV MATERIAL" :value="data.data.costsParameters.uvMat" hide-details />
                </v-flex>
              </v-layout>
            </v-container>
          </div>

          <dx-column
            data-field="_id"
            caption="Network #"
            alignment="center"
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

          <dx-summary>
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
    </v-layout>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import moment from 'moment'
import { DxItem } from 'devextreme-vue/form'
import { DxForm } from 'devextreme-vue/data-grid';
export default {
  name: 'OverviewGrid',
  components: { DxItem, DxForm },
  created() {
    if (!this.costsDataMonthly) this.getCostsDataMonthly()
    this.$root.$on('selectMonth', (month) => {
      if (month) this.selectedMonth = month
      else this.selectedMonth = moment().format('YYYY-MM')
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
      dataChanges: {}
    }
  },
  computed: {
    ...mapGetters(['costsDataMonthly'])
  },
  methods: {
    ...mapActions(['getCostsDataMonthly', 'changeProjectsData']),
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
      console.log(this.dataChanges)
      
      await this.changeProjectsData({
        netNums: Object.keys(this.dataChanges),
        data: Object.values(this.dataChanges)
      })
    }
  }
}
</script>

<style>

</style>
