<template>
  <v-layout style="text-align:center;">
    <v-flex row wrap v-bind:class="formatDate()">{{cellData.text}}</v-flex>
  </v-layout>
</template>


<style>
  .delayed {
    color: red;
  }
  .hasted {
    color: green;
  }
  .normal {
    color: black;
  }
</style>



<script>
  const moment = require('moment')

  export default {
    data: () => ({
      // cellData: null
    }),
    props: {
      cellData: {
        type: Object,
        default: () => {}
      },
      dates: {
        type: Array,
        default: () => {}
      }
    },
    methods: {
      test () {
        console.log(this._props)
      },
      formatDate () {
        if (this._props.cellData['rowType'] === 'data') {
          const selector = this._props.cellData['data']
          const currentDate = moment(selector['inv_date'][this._props.dates[0]])
          const lastDate = moment(selector['inv_date'][this._props.dates[1]])
          const diff = currentDate.diff(lastDate)

          if (diff > 0) {
            return 'delayed'
          } else if (diff < 0) {
            return 'hasted'
          } else {
            return 'normal'
          }
        }

        return 'normal'
      }
    }
  }
</script>
