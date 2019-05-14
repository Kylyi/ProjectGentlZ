<template>
  <v-layout row wrap>
    <v-flex column shrink>
      <v-icon
        :color="alert ==='warning' ? 'error' : alert === 'info' ? 'info' : 'success'"
        :title="`Last evaluation: ${templateData.data.riskRegisterDateChanged || 'never'}.`"
      >
        {{alert}}
      </v-icon>
      <!-- <div v-html="alert"></div> -->
    </v-flex>
    <v-flex column grow>
      <span v-if="templateData.data.riskRegisterBilance" style="color: #2E7D32;"> {{(templateData.data.riskRegisterBilance.bilanceOpps/1000).toFixed(0)}}K</span>
          / 
      <span v-if="templateData.data.riskRegisterBilance" style="color: #C62828;">{{(templateData.data.riskRegisterBilance.bilanceRisks/1000).toFixed(0)}}K</span>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  name: 'RiskRegisterAlert',
  props: ['templateData'],
  computed: {
    alert: function() {
      const dateChanged = this.templateData.data.riskRegisterDateChanged
      if (!dateChanged) return 'warning' //'<i class="v-icon material-icons" style="color: #ef5350;" title="Not evaluated yet.">warning</i>'

      const date = new Date()
      const currentDay = Number(moment(date).format('DD'))
      if (currentDay >=15 && (moment(dateChanged).month() !== moment(date).month() )) {
        return 'warning'
        // return `<i class="v-icon material-icons" style="color: #ef5350;" title="Last evaluation ${dateChanged}">warning</i>`
      } else if (moment(dateChanged).month() === moment(date).month()) {
        return 'check'
        // return `<i class="v-icon material-icons" style="color: #66bb6a;" title="Last evaluation ${dateChanged}">check</i>`
      } else if (moment(date).diff(dateChanged, 'days') > 30) {
        return 'warning'
        // return `<i class="v-icon material-icons" style="color: #ef5350;" title="Last evaluation ${dateChanged}">warning</i>`
      } else {
        return 'info'
        // return `<i class="v-icon material-icons" style="color: #1e88e5;" title="Last evaluation ${dateChanged}">info</i>`
      }

    }
  }
}
</script>

<style>

</style>
