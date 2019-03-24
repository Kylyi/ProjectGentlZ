<template>
  <v-container>
    <graph :propData="riskRegisterTraces" divId="plot" style="height: 300px"></graph>
  </v-container>
</template>

<script>
import Graph from './RiskRegister/Graph'
import { mapGetters } from 'vuex';
export default {
  components: { Graph },
  data: () => {
    return {
      plotInfo: {
        data: [],
        layout: {},
        config: {responsive: true}
      }
    }
  },
  computed: {
    ...mapGetters(['chosenProjects', 'riskRegisterTraces'])
  },
  methods: {
    updatePlot() {
      let x = [0,1,2,3,4,5];
      let y = [5,5,5,5,5,5];
      let data = [{
        x: x,
        y: y,
        type: 'scatter',
        line: {
          width: 4
        },
        text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e', 'B-f'],
      }];
      let layout = {
        // get rid of all the extra whitespace around plots
        margin: {
          t: 25,
          b: 25,
          r: 25,
          l: 25
        },
        title: 'Kokos',
        paper_bgcolor:"#ECEFF1"
      }
      let config = {
        // newish in plotly...auto-resizes on window resize
        responsive: true
      }
      this.plotInfo = { data, layout, config }
    },
  }
}
</script>

<style>
  /* .modebar> div:nth-child(5) {
    display: none!important;
  } */
</style>
