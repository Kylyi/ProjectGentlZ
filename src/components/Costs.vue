<template>
  <v-layout column>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Costs</h3>
      </v-flex>

      <v-flex column grow text-xs-right style="padding: 0px 24px; display: flex; align-items: center; justify-content: flex-end;">
        <!-- <v-btn-toggle v-model="mode" mandatory>
          <v-btn value="overviewGrid">Overview grid</v-btn>
          <v-btn value="overviewChart">Overview chart</v-btn>
          <v-btn value="specificDateGrid">Specific date grid</v-btn>
        </v-btn-toggle> -->

        <v-btn-toggle v-model="selectedPanes" multiple>
          <v-btn value="chart" text>
            <v-icon>bar_chart</v-icon>
          </v-btn>
          <v-btn value="grid" text>
            <v-icon>grid_on</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>

    <v-container fluid>      
      <!-- <overview-grid v-if="mode === 'overviewGrid'" />
      <specific-date-grid v-if="mode === 'specificDateGrid'" />
      <overview-chart v-if="mode === 'overviewChart'" /> -->

      <Split ref="splitPane" style="height: calc(100vh - 206px); display: inline-flex;">
        <SplitArea v-show="selectedPanes.includes('chart')" :size="selectedPanes.length === 1 ? 100 : 50" :minSize="275" >
          CHART
        </SplitArea>

        <SplitArea v-show="selectedPanes.includes('grid')" :size="selectedPanes.length === 1 ? 100 : 50" :minSize="275" >
          <overview-grid />
        </SplitArea>
      </Split>

    </v-container>
  </v-layout>

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import OverviewGrid from './Costs/OverviewGrid'
import SpecificDateGrid from './Costs/SpecificDateGrid'
import OverviewChart from './Costs/OverviewChart'
export default {
  name: 'Costs',
  components: {
    OverviewGrid,
    SpecificDateGrid,
    OverviewChart
  },
  data() {
    return {
      selectedDate: '',
      mode: 'specificDateGrid',
      selectedPanes: ['chart', 'grid']
    }
  }
}
</script>

<style>

</style>
