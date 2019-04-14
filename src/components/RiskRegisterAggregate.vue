<template>
  <v-layout column wrap id="riskRegisterAggregate">
    <v-layout row wrap style="padding: 28px 24px; background-color: #424242;">
      <v-flex column shrink>
        <h3 class="display-2 white--text">Risk register - Aggregate view</h3>
      </v-flex>
      <v-flex column grow>
        
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap mt-2 style="max-height: 80vh;">
        <v-flex row wrap mb-1><h5 class="headline"><b>Projects with risk register</b></h5></v-flex>
        <dx-pivot-grid
          ref="riskRegisterPivot"
          :data-source="dataSource"
          :allow-sorting-by-summary="true"
          :allow-sorting="true"
          :allow-filtering="true"
          :allow-expand-all="true"
          :show-borders="true"
          :scrolling="{ mode: 'virtual' }"
          :show-column-grand-totals="false"
          :show-row-totals="false"
          style="height: 100%"
        >
          <dx-field-chooser :enabled="false"/>
          <dx-field-panel :visible="true"/>
          <dx-export :enabled="true" />
          <!-- <dx-state-storing :enabled="true" storage-key="riskRegisterPivot"></dx-state-storing> -->
        </dx-pivot-grid>

        <!-- <dx-popup
          :width="600"
          :height="400"
          title="Detailed view"
          :visible.sync="popupVisible"
        >
          <dx-chart
            :data-source="chartData"
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
        </dx-popup> -->

      </v-layout>

      <v-layout row wrap pt-3 align-center justify-center>
        <v-btn outline color="primary" @click="showMissing = !showMissing">Show / hide projects without risk register</v-btn>
      </v-layout>

      <v-layout v-if="showMissing" row wrap mt-3 style="height: 80vh;">
        <v-flex row wrap><h5 class="headline"><b>Projects without risk register</b></h5></v-flex>
        <dx-data-grid
          :data-source="projectsNoRR"
          show-borders
          key-expr='Project Definition'
          column-auto-width
          :row-alternation-enabled="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :word-wrap-enabled="true"
          :repaintChangesOnly="true"
          style="height: 100%;"
        >
          <dx-scrolling mode="virtual"></dx-scrolling>
          <dx-header-filter
            :visible="true"
            :allow-search="true"
          />
          <dx-column
            data-field="Project Manager"
            caption="PM"
            alignment="center"
            :allow-sorting="true"
          />
          <dx-column
            data-field="Project Definition"
            caption="Project #"
            alignment="center"
            :allow-sorting="true"
          />
          <dx-column
            data-field="Project Name"
            caption="Project name"
            alignment="center"
            :allow-sorting="true"
          />
        </dx-data-grid>
      </v-layout>
      
    </v-container>
  </v-layout>
</template>

<script>
import { DxPivotGrid, DxFieldChooser, DxFieldPanel, DxExport } from 'devextreme-vue/pivot-grid';
import { DxPopup } from 'devextreme-vue/popup';
import { DxChart, DxCommonSeriesSettings, DxLegend, DxSeriesTemplate } from 'devextreme-vue/chart'
import { DxDataGrid, DxColumn, DxScrolling } from 'devextreme-vue/data-grid';
import { mapGetters, mapActions } from 'vuex';
import _ from 'underscore'
export default {
  name: 'RiskRegisterAggregate',
  components: {
    DxDataGrid,
    DxColumn,
    DxPivotGrid,
    DxFieldChooser,
    DxPopup,
    DxFieldPanel,
    DxChart,
    DxCommonSeriesSettings,
    DxLegend,
    DxSeriesTemplate
  },
  data: () => {
    return {
      projectsNoRR: [],
      popupVisible: false,
      chartData: [],
      showMissing: false
    }
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister']),
    getDetail(e) {
      if (e.area === 'data' && e.cell.columnPath.length > 1) {
        this.popupVisible = true
        const selectedProject = this.allProjectsUniqueProjects.filter(x => x['Project Definition'] === e.cell.rowPath[0])[0]
        this.chartData = selectedProject.riskRegister.bilance.chartData
      }
    }
  },
  computed: {
    ...mapGetters(['allProjectsUniqueProjects', 'defaultRiskRegister']),
    dataSource: function () {
      let projectsNoRR = []
      let src = this.allProjectsUniqueProjects.map(e => {
        if (e.riskRegister.hasOwnProperty('bilance')) {
          return e.riskRegister.bilance.chartData.map(x => {
            x['project_id'] = e['Project Definition']
            x['project_pm'] = e['Project Manager']
            x['project_name'] = e['Project Name']
            return x
          })
        } else {
          projectsNoRR.push(e)
        }
      })

      src = src.filter(e => e)
      this.projectsNoRR = projectsNoRR

      return {
        fields: [
          // ROWS
          { caption: 'Project #', dataField: 'project_id', area: 'row', name: 'project_id', allowFiltering: true, headerFilter: { allowSearch: true }, expanded: true },
          { caption: 'Project name', dataField: 'project_name', area: 'row', name: 'project_name', allowFiltering: true, headerFilter: { allowSearch: true } },
          // COLUMNS
          { caption: 'Main category', name: 'Main Category', dataField: 'mainCategory', area: 'column', sortOrder: 'desc', customizeText(e) {
            return e.valueText.charAt(0).toUpperCase() + e.valueText.slice(1)
          }},
          { caption: 'Category', dataField: 'category', area: 'column' },
          // VALUES
          { caption: 'Sum of Price Impact', dataField: 'priceImpact', area: 'data', dataType: 'number', summaryType: 'sum', format: 'thousands', width: 165 },
          { caption: 'Sum of Weighted price impact', dataField: 'weightedPriceImpact', area: 'data', dataType: 'number', summaryType: 'sum', format: 'thousands', width: 165 },
          // FILTERS
          { caption: 'PM', dataField: 'project_pm', area: 'filter' }
        ],
        store: _.flatten(src)
      }
    }
  }
}
</script>

<style>
  #riskRegisterAggregate .dx-pivotgrid .dx-pivotgrid-area td {
    color: black;
  }

  #riskRegisterAggregate .dx-pivotgrid-horizontal-headers {
    font-weight: bold;
  }

  #riskRegisterAggregate .dx-pivotgrid-vertical-headers {
    font-weight: bold;
  }
</style>
