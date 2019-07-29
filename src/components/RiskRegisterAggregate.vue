<template>
  <v-layout column wrap id="riskRegisterAggregate">
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Risk register - Aggregated view</h3>
      </v-flex>
      <v-flex column grow text-xs-right style="display: flex; align-items: center; justify-content: flex-end; padding-right: 24px;">
        <span class="white--text">Mode:</span>
        <v-btn-toggle mandatory
          v-model="riskMode"
          style="box-shadow: none; background-color: transparent; padding-left: 4px;"
        >
          <v-btn outline :value="true" color="white">Risk</v-btn>
          <v-btn outline :value="false" color="white">Project</v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>
    <v-container fluid ref="pivotContainer">
      <resize-observer @notify="handleResize" />
      <v-layout column>

        <v-flex row wrap mb-1><h5 class="headline"><b>Projects with risk register</b></h5></v-flex>

        <v-flex row v-if="riskMode">
          <pivot-risks :definition-width="definitionWidth" />
        </v-flex>

        <v-flex row v-else>
          <pivot :definition-width="definitionWidth" />
        </v-flex>

        <v-flex row wrap pt-3 text-xs-center>
          <v-btn outline color="primary" @click="showMissing = !showMissing">Show / hide projects without risk register</v-btn>
        </v-flex>

        <v-flex row>
          <v-layout v-if="showMissing" column wrap mt-3 style="max-height: 80vh;">
            <v-flex row wrap><h5 class="headline"><b>Projects without risk register</b></h5></v-flex>
            <v-flex row wrap>
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
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>      
    </v-container>

    <template v-if="drilldownDialog">
      <v-dialog
        v-model="drilldownDialog"
        scrollable
        max-width="1230px"
        transition="dialog-transition"
      >
        <drill-down ref="drilldown" />
      </v-dialog>
    </template>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DrillDown from './RiskRegisterAggregate/DrillDown'
import Pivot from './RiskRegisterAggregate/Pivot'
import PivotRisks from './RiskRegisterAggregate/PivotRisks'
export default {
  name: 'RiskRegisterAggregate',
  components: {
    DrillDown,
    Pivot,
    PivotRisks
  },
  data: () => {
    return {
      showMissing: false,
      drilldownDialog: false,
      riskMode: true,
      definitionWidth: 0
    }
  },
  computed: {
    ...mapGetters(['projectsRiskRegister']),
    projectsNoRR() {
      return this.projectsRiskRegister['noRR']
    }
  },
  methods: {
    handleResize() {
      setTimeout(() => {
        this.definitionWidth = this.$refs['pivotContainer'].clientWidth
      }, 200)
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
  #riskRegisterAggregate > div.container.fluid > div.layout.column > div:nth-child(2) > div > div > div > div.dx-pivotgrid-container > table > tr:nth-child(2) {
    display: none;
  }
</style>
