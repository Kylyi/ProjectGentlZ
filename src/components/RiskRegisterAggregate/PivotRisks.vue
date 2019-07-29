<template>
  <v-layout row wrap pt-2>
    <v-flex column wrap style="max-height: calc(100vh - 248px); position: relative;">
      <v-btn small icon title="Export to excel" style="position: absolute; top: -48px; right: 0;"><v-icon small @click="exportToExcel">fas fa-file-excel</v-icon></v-btn>
      <dx-pivot-grid
        ref="riskRegisterPivot"
        :data-source="dataSource"
        :allow-sorting-by-summary="true"
        :allow-sorting="true"
        :allow-filtering="true"
        :allow-expand-all="true"
        :show-borders="true"
        :show-column-grand-totals="false"
        :show-row-totals="false"
        height="100%"
      >
        <dx-field-chooser :enabled="false"/>
        <dx-scrolling mode="virtual" show-scrollbar="always" :useNative="true" />
        <dx-field-panel
          :visible="true"
          :allow-field-dragging="false"
          :show-filter-fields="false"
        />
        <dx-export :enabled="true" />
        <!-- <dx-state-storing :enabled="true" storage-key="riskRegisterPivot"></dx-state-storing> -->
      </dx-pivot-grid>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { DxPivotGrid, DxFieldChooser, DxFieldPanel, DxScrolling } from 'devextreme-vue/pivot-grid';
import _ from 'underscore'
export default {
  name: 'RiskRegisterAggregatePivot',
  props: ['definitionWidth'],
  components: {
    DxPivotGrid,
    DxFieldChooser,
    DxFieldPanel,
    DxScrolling
  },
  computed: {
    ...mapGetters(['projectsRiskRegister']),
    dataSource: function () {
      return {
        fields: [
          // ROWS
          { caption: 'Category', dataField: 'category', area: 'row', name: 'category', allowFiltering: true, expanded: true, headerFilter: { allowSearch: true }, width: 150 },
          { caption: 'Definition', dataField: 'name', area: 'row', name: 'definition', allowFiltering: true, headerFilter: { allowSearch: true }, expanded: true, sortBySummaryField: 'priceImpact', sortOrder: 'desc', width: this.definitionWidth - 788},
          { caption: 'Project #', dataField: 'Project Definition', area: 'row', name: 'projectDefinition', allowFiltering: true, headerFilter: { allowSearch: true }, expanded: true, width: 70},
          { caption: 'PM', dataField: 'Project Manager', area: 'row', name: 'projectManager', allowFiltering: true, headerFilter: { allowSearch: true }, width: 200, expanded: true},
          { caption: 'Changed', dataField: 'dateChanged', area: 'row', name: 'dateChanged', allowFiltering: true, headerFilter: { allowSearch: true }, width: 70},

          // COLUMNS
          // { caption: 'Main category', name: 'Main Category', dataField: 'mainCategory', area: 'column', sortOrder: 'desc', allowSorting: true, customizeText(e) {
          //   return e.valueText.charAt(0).toUpperCase() + e.valueText.slice(1)
          // }},
          { caption: 'Exists', dataField: 'exists', area: 'column', allowSorting: true, customizeText(e) {
            return 'Value'
          }},

          // VALUES
          { caption: 'Sum of Price Impact', dataField: 'priceImpact', area: 'data', dataType: 'number', summaryType: 'sum', allowSorting: true, format: 'thousands'},
          // { caption: 'Sum of Weighted price impact', dataField: 'weightedPriceImpact', area: 'data', dataType: 'number', summaryType: 'sum', format: 'thousands', width: 165 },

          // FILTERS
          // { caption: 'PM', dataField: 'project_pm', area: 'filter' }
        ],
        store: this.projectsRiskRegister['withRR']
      }
    }
  },
  methods: {
    exportToExcel() {
      this.$refs['riskRegisterPivot'].instance.exportToExcel()
    }
  }
}
</script>

<style>

</style>
