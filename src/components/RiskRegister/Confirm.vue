<template>
  <v-layout row wrap>
    <v-flex column xs6 pr-3>
      <v-flex row wrap mb-3><h6 class="title"><b>RISKS</b></h6></v-flex>
        <!-- RISKS -->
        <dx-data-grid
          :data-source="filteredRisks"
          show-borders
          key-expr='name'
          column-auto-width
          :allow-column-resizing="true"
          :row-alternation-enabled="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :word-wrap-enabled="true"
          style="max-height: 300px;"
          :repaintChangesOnly="true"
        >
          <dx-summary>
            <dx-total-item
              column="weightedPriceImpact"
              summary-type="sum"
              value-format="thousands"
            />
            <dx-total-item
              column="priceImpact"
              summary-type="sum"
              value-format="thousands"
            />
          </dx-summary>

          <dx-column
            data-field="name"
            caption="Definition"
            alignment="left"
            :allow-sorting="false"
            :allow-resizing="true"
          />
          <dx-column
            data-field="plannedAction"
            caption="Planned action for mitigation"
            alignment="left"
            :allow-sorting="false"
            :allow-editing="false"
          />
          <dx-column
            data-field="owner"
            caption="Owner"
            alignment="center"
            :allow-sorting="true"
          >
          </dx-column>
          <dx-column
            data-field="weightedPriceImpact"
            caption="Weighted price impact [kCZK]"
            alignment="center"
            data-type="number"
            format="thousands"
          />
          <dx-column
            data-field="priceImpact"
            caption="Price impact [kCZK]"
            alignment="center"
            data-type="number"
            format="thousands"
          />
        </dx-data-grid>
    </v-flex>

    <v-flex column xs6 pl-3>
      <v-flex row wrap mb-3><h6 class="title"><b>OPPORTUNITIES</b></h6></v-flex>
      <!-- OPPORTUNITIES -->
      <dx-data-grid
        :data-source="filteredOpps"
        show-borders
        key-expr='name'
        column-auto-width
        :allow-column-resizing="true"
        :row-alternation-enabled="true"
        :show-row-lines="true"
        :show-column-lines="true"
        :word-wrap-enabled="true"
        style="max-height: 900px;"
        :repaintChangesOnly="true"
      >
        <dx-summary>
          <dx-total-item
            column="weightedPriceImpact"
            summary-type="sum"
            value-format="thousands"
          />
          <dx-total-item
            column="priceImpact"
            summary-type="sum"
            value-format="thousands"
          />
        </dx-summary>

        <dx-column
          data-field="name"
          caption="Definition"
          alignment="left"
          :allow-sorting="false"
          :allow-resizing="true"
        />
        <dx-column
          data-field="plannedAction"
          caption="Planned action for mitigation"
          alignment="left"
          :allow-sorting="false"
          :allow-editing="false"
        />
        <dx-column
          data-field="owner"
          caption="Owner"
          alignment="center"
          :allow-sorting="true"
        >
        </dx-column>
        <dx-column
          data-field="weightedPriceImpact"
          caption="Weighted price impact [kCZK]"
          alignment="center"
          data-type="number"
          format="thousands"
        />
        <dx-column
          data-field="priceImpact"
          caption="Price impact [kCZK]"
          alignment="center"
          data-type="number"
          format="thousands"
        />

      </dx-data-grid>
    </v-flex>

    
    <v-layout v-if="chartData.length > 0" row wrap justify-center align-center="">
      <dx-chart
        :size="{width:600}"
        :data-source="chartData"
      >
        <dx-series-template
          name-field="category"
        />
        <dx-common-series-settings
          argument-field="mainCategory"
          value-field="priceImpact"
          type="stackedbar"
          hover-mode="allArgumentPoints"
        />
        <dx-title text="Overview">
        </dx-title>
        <dx-legend
          vertical-alignment="bottom"
          horizontal-alignment="center"
        />
        <dx-export :enabled="true"/>
      </dx-chart>
    </v-layout>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
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
  data: () => {
    return {
      filteredRisks: [],
      filteredOpps: [],
      risksAndOpp: []
    }
  },
  props: ['riskRegister'],
  methods: {
    ...mapActions(['changeProjectRiskRegister']),
    setProjectRiskRegister() {
      if (this.$store.state.projects.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.$store.state.projects.chosenProjects[0]['Project Definition'])
        const netWithRiskRegister = allNets[0]
        
        this.changeProjectRiskRegister({editedRiskRegister: this.newRiskRegister, netId: netWithRiskRegister._id})
      }   
    },
    customizeSeries (e) {
      console.log(e)
      return e
    }
  },
  computed: {
    chartData() {
      if (!this.riskRegister.risks || !this.riskRegister.risks) return []

      let allRisks = []
      const filteredRisks = Object.keys(this.riskRegister.risks).reduce((agg, riskCategory) => {
        const y = this.riskRegister.risks[riskCategory].reduce((agg2, risk) => {
          risk.weightedPriceImpact = risk.priceImpact * risk.probability
          risk.mainCategory = 'risk'
          allRisks.concat(risk)

          if (risk.exists) {
            agg2 = agg2.concat(risk)
            return agg2
          } else {
            return agg2
          }
        }, [])

        return agg.concat(y)
      }, [])

      this.filteredRisks = filteredRisks

      let allOpps = []
      const filteredOpps = Object.keys(this.riskRegister.opportunities).reduce((agg, riskCategory) => {
        const y = this.riskRegister.opportunities[riskCategory].reduce((agg2, risk) => {
          risk.weightedPriceImpact = risk.priceImpact * risk.probability
          risk.mainCategory = 'opportunity'
          allOpps.concat(risk)

          if (risk.exists) {
            agg2 = agg2.concat(risk)
            return agg2
          } else {
            return agg2
          }
        }, [])

        return agg.concat(y)
      }, [])

      this.filteredOpps = filteredOpps

      return filteredRisks.concat(filteredOpps)
    }
  }
}
</script>

<style>

</style>
