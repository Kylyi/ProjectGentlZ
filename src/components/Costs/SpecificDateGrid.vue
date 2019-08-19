<template>
  <div>
    <v-layout row wrap>
      <v-flex column shrink style="padding-left: 8px;">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="selectedDate"
              prepend-icon="event"
              readonly
              label="Date"
              v-on="on"
              hide-details
              style="margin: 0;"
            ></v-text-field>
          </template>
          <v-date-picker v-model="selectedDate" min="2019-04-01" no-title scrollable> </v-date-picker>
        </v-menu>

      </v-flex>
    </v-layout>

    <v-layout row wrap pt-1>
      <v-flex column wrap xs12 :style="`max-height: 800px;`">
        <dx-data-grid
          ref="costsTable"
          :data-source="costsDataSource"
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

          <dx-selection
            select-all-mode="page"
            show-check-boxes-mode="onLongTap"
            mode="multiple"
            :allow-select-all="false"
          />

          <dx-export :enabled="true" :allow-export-selected-data="true" />

          <dx-state-storing
            :enabled="true"
            type="localStorage"
            storage-key="costsTableMonthly"
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
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="Real Costs"
            caption="Real Costs"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.rmLv"
            caption="RM LV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.rmMv"
            caption="RM MV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.rmUv"
            caption="RM UV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.wipLv"
            caption="WIP LV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.wipMv"
            caption="WIP MV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.wipUv"
            caption="WIP UV"
            data-type="number"
            format="millions"
            alignment="center"
          />
          <dx-column
            data-field="costs.result.fg"
            caption="FG"
            data-type="number"
            format="millions"
            alignment="center"
          />

          <div slot="panelsModulesTemplate" slot-scope="templateData">
            {{templateData.data['Number of Panels']}} / {{templateData.data['Number of Modules']}}
          </div>

          <dx-summary>
            <dx-total-item
              column="Network #"
              summary-type="count"
              display-format="Net count: {0}"
            />
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
              column="FG"
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
        </dx-data-grid>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import moment from 'moment'
export default {
  name: 'SpecificDateGrid',
  data() {
    return {
      selectedDate: '',
    }
  },
  computed: {
    ...mapGetters(['allProjectsBasic', 'costsData']),
    costsDataSource() {
      console.log('Computing...')
      let data = JSON.parse(JSON.stringify(this.costsData))
      const date = this.selectedDate ? moment(this.selectedDate) : moment()

      return data.map(e => {
        const hasParameters = e.hasOwnProperty('costs') && e['costs'].hasOwnProperty('parameters')
        const lvmat_leadtime = hasParameters ? e['costs']['parameters']['lvmat_leadtime'] : 15
        const mvmat_leadtime = hasParameters ? e['costs']['parameters']['mvmat_leadtime'] : 15
        const uvmat_leadtime = hasParameters ? e['costs']['parameters']['uvmat_leadtime'] : 15
        
        const lvMat = hasParameters ? e['costsParameters']['lvMat'] : 30
        const mvMat = hasParameters ? e['costsParameters']['mvMat'] : 40
        const uvMat = hasParameters ? e['costsParameters']['uvMat'] : 30

        const isRmLv = date.isSameOrAfter(moment(e.costsOperations['op0130_esd'] || 0).subtract(lvmat_leadtime, 'days').format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0130_esd'] || 0).format('YYYY-MM-DD'))
        const isRmMv = (date.isSameOrAfter(moment(e.costsOperations['op0800_esd'] || 0).subtract(mvmat_leadtime, 'days').format('YYYY-MM-DD')) || date.isSameOrAfter(moment(e.costsOperations['op0805_esd'] || 0).subtract(mvmat_leadtime, 'days').format('YYYY-MM-DD'))) && 
          (date.isBefore(moment(e.costsOperations['op0800_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0805_esd'] || 0).format('YYYY-MM-DD')))
        const isRmUv = date.isSameOrAfter(moment(e.costsOperations['op0105_esd'] || 0).subtract(uvmat_leadtime, 'days').format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0105_esd'] || 0).format('YYYY-MM-DD'))

        const isWipLv = date.isSameOrAfter(moment(e.costsOperations['op0130_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))
        const isWipMv = ( date.isSameOrAfter(moment(e.costsOperations['op0800_esd'] || 0).format('YYYY-MM-DD')) || date.isSameOrAfter(moment(e.costsOperations['op0805_esd'] || 0).format('YYYY-MM-DD') )) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))
        const isWipUv = date.isSameOrAfter(moment(e.costsOperations['op0105_esd'] || 0).format('YYYY-MM-DD')) && date.isBefore(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD'))

        const isFg = date.isSameOrAfter(moment(e.costsOperations['op0420_efd'] || 0).format('YYYY-MM-DD')) && date.isBefore((e.costsOperations['op0431_cfd'] ? moment(e.costsOperations['op0431_cfd']).format('YYYY-MM-DD') : moment(e.costsOperations['op0431_esd'] || 0).format('YYYY-MM-DD')))

        if (!e.hasOwnProperty('costs')) e['costs'] = {result: {}}
        e['costs']['result']['rmLv'] = isRmLv ? e['Planned Costs'] * lvMat / 100 : 0
        e['costs']['result']['rmMv'] = isRmMv ? e['Planned Costs'] * mvMat / 100 : 0
        e['costs']['result']['rmUv'] = isRmUv ? e['Planned Costs'] * uvMat / 100 : 0
        e['costs']['result']['wipLv'] = isWipLv ? e['Planned Costs'] * lvMat / 100 : 0
        e['costs']['result']['wipMv'] = isWipMv ? e['Planned Costs'] * mvMat / 100 : 0
        e['costs']['result']['wipUv'] = isWipUv ? e['Planned Costs'] * uvMat / 100 : 0
        e['costs']['result']['fg'] = isFg ? e['Planned Costs'] : 0

        return e
      })

    }
  }
}
</script>

<style>

</style>
