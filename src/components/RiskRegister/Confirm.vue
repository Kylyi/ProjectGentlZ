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

    <v-flex row wrap text-xs-center>
      <dx-chart
        :data-source="chartData"
        title="Gross State Product within the Great Lakes Region"
      >
        <dx-common-series-settings
          argument-field="type"
          type="stackedbar"
          hover-mode="allArgumentPoints"
          selection-mode="allArgumentPoints"
        >
          <dx-label :visible="true">
          </dx-label>
        </dx-common-series-settings>
        <dx-series
          value-field="HealthandSafety"
          name="2004"
          stack="yikes"
        />
        <dx-series
          value-field="Organizational"
          stack="pikes"
        />
        <dx-legend
          vertical-alignment="bottom"
          horizontal-alignment="center"
        />
        <dx-export :enabled="true"/>
      </dx-chart>
    </v-flex>
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
  DxLabel
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
    DxLabel
  },
  data: () => {
    return {
      filteredRisks: [],
      filteredOpps: [],
      graf: require('./../../renderer/assets/graf_tbd.png')
    }
  },
  props: ['riskRegister'],
  created() {
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
  },
  methods: {
    ...mapActions(['changeProjectRiskRegister']),
    setProjectRiskRegister() {
      if (this.$store.state.projects.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.$store.state.projects.chosenProjects[0]['Project Definition'])
        const netWithRiskRegister = allNets[0]
        
        this.changeProjectRiskRegister({editedRiskRegister: this.newRiskRegister, netId: netWithRiskRegister._id})
      }   
    }
  },
  computed: {
    chartData() {
      return this.filteredRisks.concat(this.filteredOpps).reduce((agg,e) => {
        const category = e.category.replace(/ /g,'')

        if (e.mainCategory === 'risk') {
          if (agg[0].hasOwnProperty([category])) {
            agg[0][category] = agg[0][category] + e.priceImpact
          } else {
            agg[0][category] = e.priceImpact
          }
          
        } else {
          if (agg[1].hasOwnProperty([category])) {
            agg[1][category] = agg[0][category] + e.priceImpact
          } else {
            agg[1][category] = e.priceImpact
          }
        }

        return agg
      }, [{type: 'Risks'}, {type: 'Opportunities'}])   
    }
  }
}
</script>

<style>

</style>
