<template>
  <v-layout column>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Costs</h3>
      </v-flex>

      <v-flex column grow text-xs-right style="padding: 0px 24px; display: flex; align-items: center; justify-content: flex-end;">
        <v-btn outline color="white" @click="specificDateGridState = !specificDateGridState" :style="`background-color: ${specificDateGridState ? '#ff5252!important' : ''}; margin: 0 12px 0 0;`" >Specific date</v-btn>

        <v-btn-toggle v-model="selectedPanes" @change="resizeChart(true)" multiple>
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
      <!-- <overview-grid v-if="mode === 'overviewGrid'" /> -->
      <specific-date-grid v-if="specificDateGridState" />
      <!-- <overview-chart v-if="mode === 'overviewChart'" /> -->

      <Split v-else ref="costsSplitPane" style="height: calc(100vh - 160px); display: inline-flex;" @onDragEnd="resizeChart">
        <SplitArea v-show="selectedPanes.includes('chart')" :size="selectedPanes.length === 1 ? 100 : 30" :minSize="400" style="display: flex; align-items: center;">
          <overview-chart ref="overviewChart" />
        </SplitArea>

        <SplitArea v-show="selectedPanes.includes('grid')" :size="selectedPanes.length === 1 ? 100 : 70" :minSize="400" >
          <overview-grid ref="overviewGrid" />
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
      specificDateGridState: false,
      selectedPanes: ['chart', 'grid']
    }
  },
  methods: {
    resizeChart(timeout = false) {
      if (timeout) {
        setTimeout(() => {
          this.$refs['overviewChart'].$refs['barChart'].getSize()
          this.$refs['overviewChart'].$refs['drilldownChart'].getSize()
        }, 150)
      } else {
        this.$refs['overviewChart'].$refs['barChart'].getSize()
        this.$refs['overviewChart'].$refs['drilldownChart'].getSize()
      }
    }
  }
}
</script>

<style>

</style>
