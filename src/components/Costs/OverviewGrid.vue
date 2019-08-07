<template>
  <div>
    <v-layout row wrap pt-1>
      <v-flex column wrap xs12 :style="`max-height: 800px;`">
        <dx-data-grid
          ref="costsTable"
          :data-source="costsDataMonthly.data"
          show-borders
          key-expr='_id'
          column-auto-width
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :row-alternation-enabled="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :word-wrap-enabled="true"
          style="height: 100%; width: 100%;"
          :column-min-width="50"
          :repaint-changes-only="true"
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

          <!-- <dx-selection
            select-all-mode="page"
            show-check-boxes-mode="onLongTap"
            mode="multiple"
            :allow-select-all="false"
          /> -->

          <dx-export :enabled="true" :allow-export-selected-data="true" />

          <dx-state-storing
            :enabled="true"
            type="localStorage"
            storage-key="costsTable"
            :savingTimeout="2000"
          />

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
            v-for="date in dateRange"
            :key="date+'1'"
            :data-field="'costs.result.rmLv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'2'"
            :data-field="'costs.result.rmMv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'3'"
            :data-field="'costs.result.rmUv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'4'"
            :data-field="'costs.result.wipLv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'5'"
            :data-field="'costs.result.wipMv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
            alignment="center"
            :visible="false"
          />
          <dx-column
            v-for="date in dateRange"
            :key="date+'6'"
            :data-field="'costs.result.wipUv_' + date"
            :caption="'RM LV ' + date"
            data-type="number"
            format="thousands"
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
            <!-- <dx-total-item
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
            /> -->
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
export default {
  name: 'OverviewGrid',
  created() {
    if (!this.costsDataMonthly) this.getCostsDataMonthly()
  },
  data() {
    return {
      dateRange: [0,1,2].map(e => moment().add(e, 'months').format('YYYY-MM')),
      selectedMonth: moment().format('YYYY-MM')
    }
  },
  computed: {
    ...mapGetters(['costsDataMonthly'])
  },
  methods: {
    ...mapActions(['getCostsDataMonthly'])
  }
}
</script>

<style>

</style>
